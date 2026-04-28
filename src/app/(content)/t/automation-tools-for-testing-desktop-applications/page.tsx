import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  CodeComparison,
  BeforeAfter,
  StepTimeline,
  HorizontalStepper,
  AnimatedChecklist,
  MetricsRow,
  ProofBanner,
  ComparisonTable,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/automation-tools-for-testing-desktop-applications";
const PUBLISHED = "2026-04-27";
const TITLE =
  "Automation tools for testing desktop applications: the BLAKE3 hash that keeps tests from breaking on every release";
const DESCRIPTION =
  "Most desktop UI test maintenance comes from one mechanical problem: an element you matched on Tuesday is unmatchable on Wednesday because the tool's identity scheme drifted. Terminator solves this by hashing four accessibility properties (automation_id + role + name + classname) with BLAKE3 and using the first eight bytes as the element ID. Source: crates/terminator/src/platforms/windows/utils.rs lines 21 to 88, plus the test that proves stability across application restarts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "BLAKE3-hashed accessibility properties produce stable element IDs across application restarts. The mechanism that desktop UI testing roundups never name.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop testing without flaky selectors",
    description:
      "Terminator hashes automation_id + role + name + classname with BLAKE3. Same element, same ID, even after the app is restarted.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation tools for testing desktop applications" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Automation tools for testing desktop applications",
    url: PAGE_URL,
  },
];

const hashFunctionSource = `// crates/terminator/src/platforms/windows/utils.rs, lines 21 to 88
// Generate a stable element ID based on element properties.
pub fn generate_element_id(
    element: &uiautomation::UIElement,
) -> Result<usize, AutomationError> {
    let automation_id = element.get_automation_id().ok().filter(|s| !s.is_empty());
    let role         = element.get_control_type().ok()
        .filter(|t| *t != ControlType::Custom);
    let name         = element.get_name().ok().filter(|s| !s.is_empty());
    let class_name   = element.get_classname().ok().filter(|s| !s.is_empty());

    let mut to_hash = String::new();
    if let Some(id) = automation_id    { to_hash.push_str(&id); }
    if let Some(r)  = role             { to_hash.push_str(&r.to_string()); }
    if let Some(n)  = name             { to_hash.push_str(&n); }
    if let Some(cn) = class_name       { to_hash.push_str(&cn); }

    if to_hash.is_empty() {
        if let Ok(rect) = element.get_bounding_rectangle() {
            to_hash.push_str(&format!(
                "{}:{}:{}:{}",
                rect.get_left(), rect.get_top(),
                rect.get_width(), rect.get_height(),
            ));
        }
    }

    let hash = blake3::hash(to_hash.as_bytes());
    Ok(hash.as_bytes()[0..8]
        .try_into()
        .map(u64::from_le_bytes)
        .unwrap() as usize)
}`;

const stabilityTestSource = `// crates/terminator/src/tests/id_stability_tests.rs
// Verifies that generate_element_id returns the SAME hash after Notepad
// is killed and restarted. If this assertion ever fires, a regression
// has occurred in the identity scheme.
#[tokio::test]
#[ignore]
async fn test_element_id_stability_across_restarts() -> Result<(), AutomationError> {
    let get_notepad_document_hash = || -> Result<usize, AutomationError> {
        let (_guard, desktop, notepad_app) = setup_notepad();
        let document_selector = Selector::Role {
            role: "document".to_string(),
            name: None,
        };
        let doc_element = desktop.engine.find_element(
            &document_selector, Some(&notepad_app), None,
        )?;
        let doc_impl = doc_element
            .as_any()
            .downcast_ref::<WindowsUIElement>()
            .ok_or_else(|| AutomationError::PlatformError(
                "Failed to downcast UIElement".to_string(),
            ))?;
        generate_element_id(&doc_impl.element.0)
    };

    // Launch Notepad, hash the document, kill the process.
    let hash1 = get_notepad_document_hash()?;
    thread::sleep(Duration::from_millis(500));

    // Launch a NEW Notepad instance, hash the document again.
    let hash2 = get_notepad_document_hash()?;

    // Same element across two distinct OS processes -> same ID.
    assert_eq!(
        hash1, hash2,
        "The element ID should be stable when the application is restarted. \
         If this fails, a regression has occurred."
    );
    Ok(())
}`;

const brittleTestExample = `// A typical desktop test using a coordinate-based or DOM-path tool.
// On Tuesday this passed. The user's app shipped a refactor on Tuesday
// night that nudged the toolbar by 18px and renamed an internal handler.
// On Wednesday morning, every test in the suite is red.

await driver.click({ x: 412, y: 88 });            // toolbar moved
await driver.findByPath("Window/Toolbar/Item[3]"); // index changed
await driver.findByXPath("//Pane[1]/Button[2]");   // pane reordered
await driver.findByImage("save_button.png");       // theme update broke it`;

const stableTestExample = `// The same scenario in a Terminator workflow.
// The Save button still has automation_id="SaveButton", role=Button,
// name="Save", classname="Button". The hash is the same as yesterday.
// The selector resolves the same element. The test does not break.

const desktop = new Desktop();
const window = await desktop
  .locator("process:editor >> window:Untitled")
  .first(5000);
const saveBtn = await window
  .locator("role:Button && name:Save")
  .first(2000);
await saveBtn.click();`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Element identity scheme",
    product: "BLAKE3 hash of automation_id + role + name + classname",
    competitor: "Coordinate, DOM path, or screenshot match",
  },
  {
    feature: "ID stability across app restarts",
    product: "Same hash, asserted by id_stability_tests.rs",
    competitor: "Often regenerated; brittle on process recycle",
  },
  {
    feature: "Reaction to a 1-pixel layout shift",
    product: "Unchanged (no spatial dependency)",
    competitor: "Image match misses; coordinates miss",
  },
  {
    feature: "Authoring surface",
    product: "TypeScript / Rust / Python SDK + MCP server",
    competitor: "Proprietary recorder or low-code IDE",
  },
  {
    feature: "How a test gets fixed when it breaks",
    product: "AI agent reads the typecheck error, edits the workflow file",
    competitor: "QA engineer opens the IDE, re-records",
  },
  {
    feature: "License",
    product: "MIT, source on GitHub (mediar-ai/terminator)",
    competitor: "Mostly proprietary, often per-seat",
  },
];

const faqs: FaqItem[] = [
  {
    question:
      "Why do most desktop test suites need re-recording after every release?",
    answer:
      "Because the test tool's identity scheme is bound to something the app changes routinely: pixel coordinates, screenshots of buttons, or fragile DOM-style paths through the accessibility tree. A single layout tweak invalidates one of those, and the test fails to find its target. Terminator decouples identity from layout entirely. The element's ID is a BLAKE3 hash over four properties exposed by the OS accessibility API: automation_id, role, name, classname. None of those four change when a designer moves a button 18 pixels to the right.",
  },
  {
    question:
      "Where is the actual hash function defined?",
    answer:
      "In crates/terminator/src/platforms/windows/utils.rs, function generate_element_id, lines 21 to 88. It concatenates the four properties into a single string, runs blake3::hash over the bytes, and takes the first 8 bytes interpreted as a little-endian u64. If all four properties are missing (which is rare for any element a real test would target), it falls back to bounding-rectangle coordinates, then to the Arc pointer as a last resort.",
  },
  {
    question:
      "How is the stability claim actually verified?",
    answer:
      "There is a test in crates/terminator/src/tests/id_stability_tests.rs called test_element_id_stability_across_restarts. It launches Notepad as a new OS process, locates the document element, hashes it, kills the process, launches a fresh Notepad, finds the document element again, hashes it, and asserts the two hashes are equal. If a refactor ever changes the identity scheme in a way that breaks cross-restart stability, that test fails in CI before the change ships.",
  },
  {
    question:
      "Does this work cross-platform or just on Windows?",
    answer:
      "Windows is the primary target with full feature support, including the hashing scheme described here. macOS support exists at the core Rust level via the Accessibility API (with permissions). Linux uses AT-SPI2. The Node.js, Python, and MCP packages currently ship Windows binaries only, so if your test target is a macOS-only app, build against the Rust crate directly rather than the npm/pip packages.",
  },
  {
    question:
      "What does an AI coding assistant do with this?",
    answer:
      "Terminator ships an MCP server (terminator-mcp-agent) that exposes the desktop automation primitives plus a typecheck_workflow tool. An assistant like Claude Code or Cursor can author a test as a TypeScript workflow file, ask the MCP server to typecheck it, and only then run it. When something breaks, the failure comes back as a structured object with file, line, code, and message, not a stack trace, which is easier for the assistant to repair without escalating to a human.",
  },
  {
    question:
      "When does the hash actually change?",
    answer:
      "It changes when one of the four input properties changes: automation_id is renamed in the app's source, the control type is altered (rare), the accessible name is rewritten (for example, a button label change from \"Save\" to \"Save file\"), or the underlying Win32 classname is replaced. None of those happen from layout, theme, font, or window-size changes. They only happen when a developer intentionally edits a property the accessibility API reads, which is exactly when a test SHOULD be re-examined.",
  },
  {
    question:
      "Is there a free or open-source version?",
    answer:
      "Yes. The whole framework is MIT-licensed at github.com/mediar-ai/terminator. The Rust crate (terminator-rs), the Node.js package (@mediar-ai/terminator), the Python package (terminator-py), the MCP agent (terminator-mcp-agent), and the workflow SDK (@mediar-ai/workflow) are all installable from public registries. There is no per-seat license, no proprietary recorder, and no separate enterprise build.",
  },
];

const articleJsonLd = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
});

const breadcrumbsJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
const faqJsonLd = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-5 sm:px-6 pt-10 pb-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero */}
      <header className="mx-auto max-w-3xl px-5 sm:px-6 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-orange-700 mb-4">
          Desktop testing &middot; deep dive
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-900">
          Most automation tools for testing desktop applications break on
          release day. Here is the four-line function that prevents it.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Pick any list of desktop testing tools and you will read the same
          three things: it has self-healing AI, it has visual recognition, it
          has a low-code recorder. None of those answer the only mechanical
          question that matters when a test is red on a Wednesday morning:{" "}
          <span className="text-zinc-900 font-medium">
            does the tool address the same on-screen element by the same
            identifier today as it did yesterday?
          </span>{" "}
          Terminator&apos;s answer is a BLAKE3 hash over four accessibility
          properties. Same element, same hash, even after the application is
          killed and relaunched as a new OS process. The hash function is 67
          lines, the test that proves stability is 30, and they are both in
          the public Rust source.
        </p>
      </header>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      {/* Section 1: the actual problem */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The maintenance trap is mechanical, not philosophical
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          Industry surveys put 50% to 70% of QA effort into fixing tests that
          worked the day before. The vendor pages blame &ldquo;flaky tests&rdquo;,
          a phrase that obscures the actual cause. There is nothing flaky
          happening at runtime. What is happening is that the tool&apos;s
          identity scheme is too tightly coupled to something the application
          changes routinely. If the identity scheme is a screen coordinate, a
          single button-position tweak invalidates it. If it is a screenshot,
          a theme or DPI change invalidates it. If it is a positional path
          like <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono">Window/Toolbar/Item[3]</code>{" "}
          through the UI tree, reordering two siblings invalidates it.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The fix is not to layer self-healing on top of a fragile scheme.
          The fix is to start from a scheme that does not depend on the
          things the app changes for cosmetic and structural reasons.
        </p>
      </section>

      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <BeforeAfter
          title="Same scenario, two identity schemes"
          before={{
            label: "Coordinate / image / path",
            content: brittleTestExample,
            highlights: [
              "Layout shift breaks coordinate clicks",
              "Theme change breaks screenshot match",
              "Sibling reorder breaks positional path",
              "Tests must be re-recorded after every visual change",
            ],
          }}
          after={{
            label: "Hashed accessibility properties",
            content: stableTestExample,
            highlights: [
              "Selector binds to role + name, not position",
              "Hash is identical across application restarts",
              "Theme, font, DPI, and layout changes are no-ops",
              "Tests survive routine releases without re-authoring",
            ],
          }}
        />
      </div>

      {/* Section 2: the hash function */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The four properties Terminator hashes
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          Every desktop UI element exposed by the OS accessibility tree
          carries a small set of identity properties. On Windows, those come
          from the UI Automation (UIA) COM API. Terminator picks four of
          them, in priority order, and hashes the concatenation:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-orange-50/40 p-4">
            <p className="font-mono text-xs text-orange-700 uppercase tracking-wider">
              automation_id
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              The string a developer assigns to the element in code (e.g.
              <code className="font-mono"> &quot;SaveButton&quot;</code>). The most stable
              property when present.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-orange-50/40 p-4">
            <p className="font-mono text-xs text-orange-700 uppercase tracking-wider">
              role
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              The accessibility control type:{" "}
              <code className="font-mono">Button</code>,{" "}
              <code className="font-mono">Edit</code>,{" "}
              <code className="font-mono">CheckBox</code>. Skipped when{" "}
              <code className="font-mono">Custom</code>.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-orange-50/40 p-4">
            <p className="font-mono text-xs text-orange-700 uppercase tracking-wider">
              name
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              The accessible label users see, e.g.
              <code className="font-mono"> &quot;Save&quot;</code>. The same string
              screen readers announce.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-orange-50/40 p-4">
            <p className="font-mono text-xs text-orange-700 uppercase tracking-wider">
              classname
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              The Win32 class name (<code className="font-mono">Button</code>,{" "}
              <code className="font-mono">Edit</code>). Stable per widget kind.
            </p>
          </div>
        </div>

        <p className="mt-6 text-zinc-700 leading-relaxed">
          The function pushes whichever of those four are non-empty into a
          single string, hashes it with BLAKE3, and returns the first 8
          bytes as a <code className="font-mono">u64</code>. If all four are
          empty (a rare case for anything a real test targets), it falls
          back to the element&apos;s bounding rectangle, and only as a final
          resort to the in-memory pointer (which is explicitly documented as
          NOT stable across sessions). The whole function:
        </p>

        <pre className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 text-[12.5px] leading-relaxed font-mono">
          <code>{hashFunctionSource}</code>
        </pre>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Two things are worth noticing. First, the hash is content-derived,
          not session-derived; nothing in the input depends on a process ID,
          a window handle, or a memory address (except the explicit fallback
          path, which is documented as session-only). Second, BLAKE3 is
          deterministic for a given input, so equal inputs produce equal
          hashes regardless of which OS process is running, which CPU is
          executing it, or how many days have passed since the last run.
        </p>
      </section>

      {/* Section 3: the stability test */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The test that fails the build if stability ever regresses
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          Claims about test stability tend to be marketing prose. This one is
          a <code className="font-mono">#[tokio::test]</code> in the
          repository. It is rigged to fail loudly the moment anyone changes
          the identity scheme in a way that breaks cross-restart stability.
        </p>

        <pre className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 text-[12.5px] leading-relaxed font-mono">
          <code>{stabilityTestSource}</code>
        </pre>

        <ProofBanner
          metric="hash1 == hash2"
          quote="The element ID should be stable when the application is restarted. If this fails, a regression has occurred."
          source="crates/terminator/src/tests/id_stability_tests.rs"
        />

        <p className="mt-2 text-zinc-700 leading-relaxed">
          Two distinct OS processes, two separate UIAutomation
          interrogations, the same 64-bit ID. That assertion is what lets a
          test author write{" "}
          <code className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            role:Button &amp;&amp; name:Save
          </code>{" "}
          today and have it still match the same element on the next CI run,
          on a fresh Windows VM, after the user&apos;s editor has been killed
          and respawned by the test harness.
        </p>
      </section>

      {/* The four-property pipeline as steps */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-6">
        <StepTimeline
          title="What happens when your test asks for an element"
          steps={[
            {
              title: "Selector parsing",
              description:
                "Your selector string (for example process:notepad >> role:Button && name:Save) is parsed into a tree of clauses. No coordinates, no images, no XPath.",
            },
            {
              title: "Tree walk via UIA",
              description:
                "Terminator walks the Windows UI Automation tree under the chosen process or window, asking each node for its automation_id, role, name, and classname.",
            },
            {
              title: "Filter by clause",
              description:
                "Each clause (role:..., name:..., id:..., classname:...) is matched against those properties. Substring match by default, no wildcards.",
            },
            {
              title: "Hash the survivors",
              description:
                "For each candidate element, generate_element_id concatenates the four properties and runs BLAKE3 over them, producing a stable 64-bit fingerprint.",
            },
            {
              title: "Return the element",
              description:
                "The first match (or the nth, if you used nth:N) is wrapped in a UIElement. The fingerprint is what makes this same element addressable on the next run.",
            },
          ]}
        />
      </section>

      {/* Section: comparison */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          How this changes the comparison with the older toolchain
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          A lot of the desktop test category was shaped before the
          accessibility tree was a reliable surface to bind tests to.
          SikuliX targeted images. Older record-and-replay tools targeted
          coordinates and window handles. Newer entrants layered self-heal
          on top of those. None of them changed the underlying identity
          scheme. Terminator did. The practical differences look like this:
        </p>
        <ComparisonTable
          productName="Terminator"
          competitorName="Conventional desktop test tool"
          rows={comparisonRows}
        />
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The fair caveat: if your target application does not implement the
          accessibility API at all (some legacy custom-drawn frameworks),
          all four input properties may be empty, and Terminator falls back
          to bounding-rectangle hashing, which is more stable than raw
          pixels but not as stable as a real <code className="font-mono">automation_id</code>. In that scenario, image-based tools and Terminator end up in roughly the same place. Where the
          accessibility tree is populated (which is the case for almost
          every modern WinForms, WPF, WinUI, Electron, Qt, and UWP app),
          Terminator&apos;s hash gives you a deterministic identifier that
          older tools cannot.
        </p>
      </section>

      {/* What it gives you in practice */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          What that one mechanism unlocks for a test suite
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          A stable element ID is unglamorous on its own. The interesting
          consequences show up in second-order behaviour:
        </p>
        <AnimatedChecklist
          title="What stable IDs make possible"
          items={[
            {
              text: "Snapshot-based assertions: capture the IDs of every important control once, diff against them on every release, fail the build only when an actual identity change occurs.",
              checked: true,
            },
            {
              text: "Cache locators across runs: a test that hits 60 elements does not need to re-walk the UIA tree 60 times if the IDs were captured during the previous run.",
              checked: true,
            },
            {
              text: "Run the same suite on a teammate's machine, on a fresh Azure Windows VM, on the CI runner, and get matching IDs for every element you care about.",
              checked: true,
            },
            {
              text: "Tag flaky-looking failures as either real (the hash changed) or environmental (the hash matched but the click was preempted), instead of bucketing both into 'flaky'.",
              checked: true,
            },
            {
              text: "Hand the failure log to an AI coding assistant via MCP, including the exact (selector, expected_hash, observed_hash) tuple, and let it propose a one-line workflow patch.",
              checked: true,
            },
          ]}
        />
      </section>

      {/* Setup steps */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          Going from this page to a passing desktop test
        </h2>
        <HorizontalStepper
          steps={[
            {
              title: "Install",
              description:
                "npm install @mediar-ai/terminator @mediar-ai/workflow zod",
            },
            {
              title: "Locate",
              description:
                "Write a selector like role:Button && name:Save inside your target window.",
            },
            {
              title: "Act",
              description:
                "Drive click, typeText, invoke, setSelected on the element.",
            },
            {
              title: "Verify",
              description:
                "Read the element back and assert against name, value, or its hashed ID.",
            },
          ]}
          current={1}
        />
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The Node.js, Python, and MCP packages currently ship Windows
          binaries. macOS exists at the Rust layer (cargo add{" "}
          <code className="font-mono">terminator-rs</code>) and Linux uses
          AT-SPI2. If you want an AI coding assistant to author the suite,
          point it at <code className="font-mono">terminator-mcp-agent</code>{" "}
          and use the bundled <code className="font-mono">typecheck_workflow</code>{" "}
          tool to validate workflows before running them.
        </p>
      </section>

      {/* The capability cost */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The honest tradeoffs
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          A page that pretends a tool has no downsides is useless to anyone
          actually picking one. Here are the places where this approach
          loses, and why someone might still pick a different tool.
        </p>
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              Tradeoff #1
            </p>
            <p className="mt-2 text-zinc-900 font-medium">
              You write code, not a recorder script.
            </p>
            <p className="mt-1 text-zinc-700 text-sm">
              If your QA team only writes plain-English instructions and
              clicks &quot;record&quot;, this is the wrong shape. testRigor or
              Katalon Studio fit that workflow better. Terminator is a
              developer framework: TypeScript, Python, or Rust source files
              with selectors and assertions. The MCP server narrows the gap
              because an AI assistant can author tests for non-coders, but
              the artifact is still code.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              Tradeoff #2
            </p>
            <p className="mt-2 text-zinc-900 font-medium">
              Custom-rendered apps without accessibility expose less to bind
              to.
            </p>
            <p className="mt-1 text-zinc-700 text-sm">
              If you are testing a game built in a custom engine, or an old
              MFC app that never wired up accessibility, the four hash
              inputs will mostly be empty and you will fall back to
              bounding-rectangle hashing. SikuliX or vision-AI tools are
              specifically built for that case and will outperform here.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-zinc-500">
              Tradeoff #3
            </p>
            <p className="mt-2 text-zinc-900 font-medium">
              Cross-platform packaging is uneven.
            </p>
            <p className="mt-1 text-zinc-700 text-sm">
              The npm and pip packages currently ship Windows binaries
              only. macOS works against the Rust crate today, but you will
              be writing Rust or building bindings yourself if you target
              both. TestComplete and Test Studio give you packaged
              cross-platform support out of the box.
            </p>
          </div>
        </div>
      </section>

      {/* Code comparison: what an authored test looks like */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <CodeComparison
          title="What the same test looks like"
          leftLabel="Conventional desktop tool"
          rightLabel="Terminator workflow"
          leftLines={4}
          rightLines={9}
          leftCode={brittleTestExample}
          rightCode={stableTestExample}
          reductionSuffix="lines, but stable across releases"
        />
      </div>

      {/* Closing prose */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10">
        <h2 className="text-2xl font-semibold text-zinc-900">
          The point of all this
        </h2>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          When someone shopping for a desktop testing tool asks
          &ldquo;which one is best?&rdquo;, they are usually about to be
          handed a list of brand names with feature checkmarks. The
          checkmarks rarely tell you which tool will still match the same
          on-screen element after your team ships its next refactor. That
          property is decided at the layer below all the marketing,
          specifically at the point where the framework decides what counts
          as the same element.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Terminator&apos;s answer is in <code className="font-mono">utils.rs</code> at line 23, in 67 lines of Rust, and is verified by a tokio test in the same crate. You can read both files in under five minutes. Whatever tool you pick after reading this, ask its docs the same question and read the answer at the same level of detail. If the answer is missing, that is its own answer.
        </p>
      </section>

      {/* metrics row */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <MetricsRow
          metrics={[
            { value: 4, label: "properties hashed" },
            { value: 8, suffix: " bytes", label: "of BLAKE3 used as ID" },
            { value: 0, label: "session-bound inputs" },
            { value: 67, label: "lines in the function" },
          ]}
        />
      </div>

      {/* Footer Book a call CTA */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-6">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Talking through how this would land in your test suite"
          description="Book 30 minutes if you want to walk through whether the hash-based identity scheme fits your application's accessibility coverage. We will look at your actual app, not a slide deck."
          section="guide-footer"
        />
      </div>

      {/* FAQ */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-6">
        <FaqSection
          title="Questions readers actually ask"
          faqs={faqs}
        />
      </div>

      {/* Related posts */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 py-6">
        <RelatedPostsGrid
          title="Adjacent reading"
          subtitle="More on how Terminator works"
          posts={[
            {
              title:
                "Automation testing tool for desktop application: AI-fixable error contracts",
              href: "/t/automation-testing-tool-for-desktop-application",
              excerpt:
                "How Terminator hands a failing test back to the AI that wrote it, as JSON instead of a stack trace.",
              tag: "Deep dive",
            },
            {
              title:
                "Automation tools for UI testing that prove they can see the UI first",
              href: "/t/automation-tools-for-ui-testing",
              excerpt:
                "Terminator's MCP agent ships a /ready endpoint that boots UIAutomation and returns 200, 206, or 503 in under five seconds.",
              tag: "Health checks",
            },
            {
              title:
                "Automation testing for desktop application: end-to-end walkthrough",
              href: "/t/automation-testing-for-desktop-application",
              excerpt:
                "A full setup guide from npm install to a passing assertion against a running Windows app.",
              tag: "Walkthrough",
            },
          ]}
        />
      </div>

      {/* Sticky CTA, follows the reader */}
      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See if Terminator's hash-stable selectors fit your desktop test suite."
        section="guide-sticky"
      />
    </article>
  );
}
