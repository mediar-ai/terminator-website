import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type ComparisonRow,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/docs-rs-accessibility-crate-axuielement-system-wide";
const PUBLISHED = "2026-06-16";
const TITLE =
  "accessibility crate on docs.rs: AXUIElement::system_wide(), and what the docs leave out";
const DESCRIPTION =
  "AXUIElement::system_wide() in the accessibility crate (v0.2.0) returns the root macOS AX element. The docs.rs page lists the signature but not the two things that break a real traversal: the crate's default TreeWalker skips application windows, and walking from the system-wide root loops forever without CFEqual/CFHash cycle detection. Field notes from Terminator's macOS code.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "system_wide(), application(pid), application_with_bundle(): the three AXUIElement constructors, plus the two traversal traps the docs.rs page never mentions.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "accessibility crate: AXUIElement::system_wide() in practice",
    description:
      "The default TreeWalker does not descend into windows. The system-wide AX tree has cycles. Two gotchas docs.rs omits, with the real Rust code that fixes them.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "accessibility crate: AXUIElement::system_wide()" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "accessibility crate: AXUIElement::system_wide()", url: PAGE_URL },
];

const constructorRows: ComparisonRow[] = [
  {
    feature: "system_wide()",
    competitor: "-> Self (infallible). Root of the whole desktop AX tree.",
    ours: "AXUIElementCreateSystemWide(). Start here when you want focus, the menu bar, or to cross app boundaries.",
  },
  {
    feature: "application(pid: pid_t)",
    competitor: "-> Self (infallible). Root element for one running process.",
    ours: "AXUIElementCreateApplication(pid). Scopes the walk to a single app you already have a PID for.",
  },
  {
    feature: "application_with_bundle(bundle_id: &str)",
    competitor: "-> Result<Self, Error>. Resolves a bundle id to a running app.",
    ours: "Fails if the bundle is not running. There is also application_with_bundle_timeout(id, Duration) to wait for launch.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What is AXUIElement::system_wide() in the accessibility crate?",
    a: "It is an infallible constructor on the AXUIElement struct (accessibility crate v0.2.0, re-exported from the ui_element module) that returns the system-wide accessibility element: the root of the macOS accessibility tree. Under the hood it is a safe Rust wrapper over the C function AXUIElementCreateSystemWide() from accessibility-sys. From the element it returns you can read AXFocusedApplication, the menu bar, and reach into any running app, which is why automation tools use it as the entry point.",
  },
  {
    q: "Where is system_wide() in the docs.rs module tree?",
    a: "The accessibility crate's lib.rs does `pub use ui_element::*;`, so the canonical path is accessibility::ui_element::AXUIElement, but in your own code you just write `use accessibility::AXUIElement;`. On docs.rs the method is listed under the AXUIElement struct page at /accessibility/latest/accessibility/ui_element/struct.AXUIElement.html. The lower-level raw binding AXUIElementCreateSystemWide lives in the accessibility-sys crate.",
  },
  {
    q: "Why does my traversal from system_wide() miss every button and field?",
    a: "Because the TreeWalker shipped in the accessibility crate descends through the AXChildren attribute, and an application element does not expose its windows as ordinary children. Windows hang off the AXWindows and AXMainWindow attributes instead. If you walk only children from the application root you enter the app and immediately hit a dead end. You have to read windows() and main_window() explicitly, then walk children inside each window. Terminator's tree_search.rs opens with exactly this note.",
  },
  {
    q: "Why does walking the system-wide tree hang or run out of memory?",
    a: "The macOS accessibility graph is not a strict tree. Parent and child references form cycles (an element points to its parent which points back to it, and some containers re-expose ancestors), so a naive depth-first walk revisits nodes forever. You need to deduplicate visited elements. AXUIElement does not implement Hash or Eq, so you cannot drop it into a HashSet directly. The fix is a wrapper that hashes and compares via Core Foundation's CFHash and CFEqual on the underlying CFTypeRef.",
  },
  {
    q: "Is system_wide() or application(pid) the right starting point?",
    a: "Use application(pid) or application_with_bundle(bundle_id) when you already know which app you are driving: it scopes the walk to one process and is dramatically faster because you never traverse other apps. Use system_wide() when you need cross-application context: the currently focused app (AXFocusedApplication), the system menu bar, or global hotkey targets. system_wide() is the broad entry point; the per-app constructors are the fast path.",
  },
  {
    q: "Does the accessibility crate need accessibility permissions to use system_wide()?",
    a: "Constructing the element does not, but reading any attribute off it does. The process calling into the AX APIs must be trusted in System Settings > Privacy & Security > Accessibility, or AXUIElementCopyAttributeValue returns kAXErrorAPIDisabled / a permission error and you get empty trees. The accessibility crate surfaces that as an Err on the attribute call, not on the constructor.",
  },
  {
    q: "How does Terminator use the accessibility crate?",
    a: "Terminator is a Playwright-style desktop automation framework. Its shipping platform today is Windows via UI Automation, with macOS accessibility support on the roadmap. The macOS traversal layer was built on the accessibility crate's AXUIElement, and the file crates/terminator/src/platforms/tree_search.rs is the worked example this guide draws from: a windows-aware TreeWalker and a CFEqual/CFHash cycle guard around the system-wide root.",
  },
];

function CodeCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
      {title ? (
        <figcaption className="border-b border-zinc-200 bg-white px-4 py-2 font-mono text-xs text-zinc-500">
          {title}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed text-zinc-800">
        <code className="font-mono">{children}</code>
      </pre>
    </figure>
  );
}

const defaultWalkerCode = `use accessibility::{AXUIElement, TreeWalker};

let root = AXUIElement::system_wide();

// The walker that ships with the crate descends AXChildren only.
let walker = TreeWalker::default();
walker.walk(&root, &my_visitor);

// You enter each app... and stop.
// Its buttons and text fields live inside windows,
// and windows are NOT children. You see nothing.`;

const windowsAwareCode = `// Terminator: crates/terminator/src/platforms/tree_search.rs
// "default TreeWalker does not traverse windows,
//  so we need to traverse windows manually"

let mut flow = visitor.enter_element(root);
if flow == TreeWalkerFlow::Continue {
    // 1. windows hang off AXWindows, not AXChildren
    if let Ok(windows) = root.windows() {
        for w in windows.iter() { self.walk_one(&w, visitor); }
    }
    // 2. the focused/main window via AXMainWindow
    if let Ok(main) = root.main_window() {
        self.walk_one(&main, visitor);
    }
    // 3. THEN the ordinary children inside each window
    if let Ok(children) = root.attribute(&self.attr_children) {
        for c in children.into_iter() { self.walk_one(&c, visitor); }
    }
}`;

const cycleGuardCode = `// AXUIElement implements neither Hash nor Eq,
// so you cannot put it in a HashSet directly.
struct AXUIElementWrapper { element: AXUIElement }

impl PartialEq for AXUIElementWrapper {
    fn eq(&self, other: &Self) -> bool {
        unsafe {
            // CFEqual on the raw CFTypeRef = correct AX identity
            core_foundation::base::CFEqual(
                self.element.as_concrete_TypeRef() as _,
                other.element.as_concrete_TypeRef() as _,
            ) != 0
        }
    }
}
impl Eq for AXUIElementWrapper {}

impl Hash for AXUIElementWrapper {
    fn hash<H: Hasher>(&self, state: &mut H) {
        unsafe {
            let h = core_foundation::base::CFHash(
                self.element.as_concrete_TypeRef() as _,
            );
            state.write_u64(h as u64);
        }
    }
}`;

const docsOmitItems = [
  {
    text: "An application element exposes its windows through AXWindows / AXMainWindow, not AXChildren, so the default TreeWalker dead-ends one level into every app.",
  },
  {
    text: "The system-wide AX graph contains cycles; a depth-first walk without dedup recurses until it stack-overflows or exhausts memory.",
  },
  {
    text: "AXUIElement is neither Hash nor Eq, so the obvious HashSet-based visited set does not compile until you wrap it.",
  },
  {
    text: "CFEqual / CFHash on the underlying CFTypeRef are the only correct way to compare two AXUIElement handles for identity.",
  },
  {
    text: "Constructing system_wide() never fails, but the first attribute read fails with a permission error if the process is not trusted for Accessibility.",
  },
];

const relatedPosts = [
  {
    title: "macOS AX UI tree automation: the write-path trap",
    href: "/t/macos-accessibility-ui-tree",
    excerpt:
      "Reading the tree from system_wide() is the easy half. AXPress and AXClick silently no-op on browser views. Here is the click fallback that actually works.",
    tag: "macOS",
    readTime: "9 min",
  },
  {
    title: "macOS accessibility automation API, end to end",
    href: "/t/macos-accessibility-automation-api",
    excerpt:
      "How the AX API surface maps to a real automation engine: roles, attributes, actions, and where the abstraction leaks versus Windows UIA.",
    tag: "Reference",
    readTime: "8 min",
  },
  {
    title: "Accessibility API desktop automation, without the mouse",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "Fire actions on elements instead of moving a cursor. The pattern-first approach that is portable across UIA, AX, and AT-SPI in concept.",
    tag: "Concept",
    readTime: "7 min",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-600">
            macOS accessibility / Rust
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
            The <code className="text-orange-600">accessibility</code> crate on
            docs.rs: <code>AXUIElement::system_wide()</code>, and what the page
            leaves out
          </h1>
          <div className="mt-4">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="8 min read"
            />
          </div>
        </header>

        {/* Direct answer */}
        <section className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-orange-700">
            Direct answer (verified 2026-06-16)
          </p>
          <p className="mt-3 text-lg leading-relaxed text-zinc-900">
            <code className="rounded bg-white px-1.5 py-0.5 text-orange-700">
              AXUIElement::system_wide() -&gt; Self
            </code>{" "}
            lives in the <strong>accessibility</strong> crate (v0.2.0,
            re-exported from the <code>ui_element</code> module). It is an
            infallible constructor that returns the{" "}
            <strong>root system-wide accessibility element</strong> of macOS, a
            safe wrapper over the C call{" "}
            <code>AXUIElementCreateSystemWide()</code>. You walk down from it to
            reach the focused app, the menu bar, and every window on screen.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Source of record:{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://docs.rs/accessibility/latest/accessibility/ui_element/struct.AXUIElement.html"
            >
              docs.rs/accessibility &rarr; AXUIElement
            </a>
            . Raw FFI binding:{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://docs.rs/accessibility-sys/latest/accessibility_sys/fn.AXUIElementCreateSystemWide.html"
            >
              accessibility-sys::AXUIElementCreateSystemWide
            </a>
            .
          </p>
        </section>

        <section className="prose-zinc mt-10">
          <p className="text-lg leading-relaxed text-zinc-700">
            If you searched docs.rs for this, you have probably already found
            the signature. The signature is the easy part. What the reference
            page cannot tell you is what happens when you actually call{" "}
            <code>system_wide()</code> and try to walk the tree it roots: the
            walker bundled with the crate quietly skips every application
            window, and a depth-first traversal of the system-wide root never
            terminates. Both are fixable in a few lines. Neither is documented.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            The code below is the macOS traversal layer from{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/tree_search.rs"
            >
              Terminator&apos;s tree_search.rs
            </a>
            . Terminator is a Playwright-style desktop automation framework; it
            ships on Windows (UI Automation) today, with macOS accessibility
            support on the roadmap, and this file is the record of how it walked
            real macOS apps from the system-wide root using this exact crate.
          </p>
        </section>

        {/* Constructors reference */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            The three ways into the tree
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700">
            <code>AXUIElement</code> gives you three entry points.{" "}
            <code>system_wide()</code> is the broad one. The other two scope you
            to a single process and are the path you want once you know which
            app you are driving.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="When to use it"
              competitorName="Returns"
              rows={constructorRows}
              heading="AXUIElement constructors (accessibility v0.2.0)"
              caveat="application(pid) and system_wide() are infallible. application_with_bundle() returns Result because the bundle may not be running."
            />
          </div>

          <CodeCard title="src/main.rs">{`use accessibility::AXUIElement;

// whole desktop, focus-aware, crosses app boundaries
let root = AXUIElement::system_wide();

// one process you already have a PID for (fast path)
let app = AXUIElement::application(pid);

// resolve a bundle id to a running app
let safari = AXUIElement::application_with_bundle("com.apple.Safari")?;`}</CodeCard>
        </section>

        {/* Gotcha 1: windows */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Trap 1: the default <code>TreeWalker</code> never enters a window
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700">
            The crate ships a <code>TreeWalker</code> that recurses through the{" "}
            <code>AXChildren</code> attribute. That is correct for most nodes
            and wrong for application nodes. An app does not list its windows as
            children: they live behind the <code>AXWindows</code> and{" "}
            <code>AXMainWindow</code> attributes. Walk only children from an app
            root and you step into the app and immediately hit nothing, so every
            button, field, and menu item below the window goes unseen.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            The fix is to read windows explicitly, then walk children inside
            each one. The very first line of Terminator&apos;s walker file is a
            comment to this effect:{" "}
            <em>
              &quot;default TreeWalker does not traverse windows, so we need to
              traverse windows manually.&quot;
            </em>
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 font-mono text-xs font-semibold text-zinc-500">
                Children-only (default) &mdash; sees nothing
              </p>
              <CodeCard>{defaultWalkerCode}</CodeCard>
            </div>
            <div>
              <p className="mb-1 font-mono text-xs font-semibold text-orange-600">
                Windows-aware (Terminator) &mdash; sees the whole app
              </p>
              <CodeCard>{windowsAwareCode}</CodeCard>
            </div>
          </div>
        </section>

        {/* Gotcha 2: cycles */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Trap 2: the system-wide tree has cycles, so the walk never ends
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700">
            &quot;Tree&quot; is generous. The macOS accessibility graph contains
            back-references: a child can point at its parent, some containers
            re-expose ancestors, and following both directions sends a naive
            depth-first walk around in circles until it overflows the stack or
            runs the machine out of memory. You need a visited set.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            Here is the part that surprises people:{" "}
            <code>AXUIElement</code> implements neither <code>Hash</code> nor{" "}
            <code>Eq</code>, so you cannot drop it into a{" "}
            <code>HashSet</code> and the obvious approach does not even compile.
            The fix is a thin wrapper that derives identity from Core
            Foundation&apos;s <code>CFEqual</code> and <code>CFHash</code> on the
            underlying <code>CFTypeRef</code>, which is the only comparison that
            reflects true AX element identity.
          </p>
          <CodeCard title="cycle guard, tree_search.rs (paraphrased)">
            {cycleGuardCode}
          </CodeCard>
          <p className="mt-2 leading-relaxed text-zinc-700">
            With the wrapper in a <code>HashSet</code>, the walker checks
            membership before recursing, counts how many cycles it skipped for
            debugging, and caps absolute recursion at a{" "}
            <code>MAX_DEPTH</code> of 100 as a backstop. Terminator logs the
            cycle count after each traversal: on a busy desktop it is rarely
            zero.
          </p>
        </section>

        {/* What docs omit checklist */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Everything the reference page does not say
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700">
            Pin these five up before you write your first walker. Each one cost
            real debugging time to discover from the type signature alone.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="Field notes for AXUIElement::system_wide()"
              items={docsOmitItems}
            />
          </div>
        </section>

        {/* Permissions note */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            One more thing: the constructor lies about permissions
          </h2>
          <p className="mt-3 leading-relaxed text-zinc-700">
            <code>system_wide()</code> and <code>application(pid)</code> are
            infallible. They return an element no matter what. That is
            convenient and slightly dangerous, because the failure you actually
            care about, missing Accessibility permission, does not surface until
            the first attribute read. Call <code>.windows()</code> or any{" "}
            <code>attribute()</code> getter on an untrusted process and you get
            an <code>Err</code> (a permission error from the underlying{" "}
            <code>AXUIElementCopyAttributeValue</code>), not a panic. So an empty
            tree from a perfectly valid root almost always means the host
            process is not listed under{" "}
            <strong>
              System Settings &rarr; Privacy &amp; Security &rarr; Accessibility
            </strong>
            , not that your traversal is wrong.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building desktop automation on accessibility APIs?"
          description="Talk through the AX traversal traps, the Windows UIA story, and where Terminator fits before you sink a week into your own walker."
        />

        <section className="mt-12">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Questions developers ask about this crate
          </h2>
          <div className="mt-4">
            <FaqSection items={faqs} />
          </div>
        </section>

        <div className="mt-12">
          <RelatedPostsGrid
            title="Keep going"
            posts={relatedPosts}
          />
        </div>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Driving native apps with accessibility APIs? Let's compare notes."
      />
    </article>
  );
}
