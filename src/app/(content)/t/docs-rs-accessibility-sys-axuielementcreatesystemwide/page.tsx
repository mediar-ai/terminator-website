import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ComparisonTable,
  AnimatedChecklist,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/docs-rs-accessibility-sys-axuielementcreatesystemwide";
const PUBLISHED = "2026-06-16";
const TITLE =
  "accessibility-sys AXUIElementCreateSystemWide: the reference docs.rs leaves out";
const DESCRIPTION =
  "The accessibility-sys crate (v0.2.0, by eiz) is 0% documented on docs.rs, so AXUIElementCreateSystemWide shows up as a bare zero-argument FFI signature with no explanation. Here is what the system-wide AX root actually returns, the one thing it cannot do, the trust gate you hit first, and working Rust.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "AXUIElementCreateSystemWide() takes no arguments and returns the macOS system-wide accessibility root. It is good for the focused element and hit-testing, not for walking an app tree. Full reference plus working accessibility-sys code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXUIElementCreateSystemWide in accessibility-sys, explained",
    description:
      "Zero args, returns the AX root. Use it for the focused element and hit-test by coordinate. For a full app tree, create a per-pid element instead.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "accessibility-sys AXUIElementCreateSystemWide" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "accessibility-sys AXUIElementCreateSystemWide", url: PAGE_URL },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Constructor",
    competitor: "AXUIElementCreateSystemWide()",
    ours: "AXUIElementCreateApplication(pid: pid_t)",
  },
  {
    feature: "Arguments",
    competitor: "None",
    ours: "One process id (pid_t)",
  },
  {
    feature: "What it points at",
    competitor: "The system-wide root, not tied to any one app",
    ours: "The root of a single running application",
  },
  {
    feature: "Read the focused element",
    competitor: "Yes, via kAXFocusedUIElementAttribute",
    ours: "Only the focus inside that app",
  },
  {
    feature: "Hit-test by screen coordinate",
    competitor: "Yes, via AXUIElementCopyElementAtPosition",
    ours: "Scoped to that app's windows",
  },
  {
    feature: "Walk the whole UI tree (AXChildren)",
    competitor: "No, the system-wide root does not expose app children",
    ours: "Yes, this is how you enumerate windows and controls",
  },
  {
    feature: "Typical use",
    competitor: "Global focus tracking, pointer hit-testing, system attributes",
    ours: "Inspecting and driving a specific target application",
  },
];

const faqItems: FaqItem[] = [
  {
    q: "Why is the accessibility-sys docs.rs page almost empty?",
    a: "Because the crate is a thin FFI binding layer. docs.rs reports 0% of accessibility-sys is documented, so each item renders as a raw signature with no doc comment. AXUIElementCreateSystemWide shows up as `pub unsafe extern \"C\" fn AXUIElementCreateSystemWide() -> AXUIElementRef` and nothing else. The semantics live in Apple's HIServices headers, not in the Rust crate. The crate is version 0.2.0, authored by eiz, dual licensed MIT or Apache-2.0, and depends on core-foundation-sys ^0.8.",
  },
  {
    q: "What does AXUIElementCreateSystemWide actually return?",
    a: "An AXUIElementRef pointing at the system-wide accessibility object. It is the entry point for things that are not tied to one application: the currently focused UI element across all apps (kAXFocusedUIElementAttribute), the focused application (kAXFocusedApplicationAttribute), and hit-testing a screen coordinate with AXUIElementCopyElementAtPosition. Ownership follows Core Foundation's Create Rule, so you are responsible for releasing it (CFRelease) when you are done.",
  },
  {
    q: "Why can't I get an app's full UI tree from the system-wide element?",
    a: "The system-wide root is not a parent of every application's accessibility tree. Asking it for kAXChildrenAttribute does not hand you every window on the desktop. To enumerate a specific app you call AXUIElementCreateApplication(pid) with that process's id, then read kAXWindowsAttribute and recurse through kAXChildrenAttribute from there. The system-wide element is for focus and pointer queries, not tree traversal.",
  },
  {
    q: "Do I need accessibility permission before any of this works?",
    a: "Yes. Before macOS hands back real elements, your process must be trusted for Accessibility. accessibility-sys exposes AXIsProcessTrustedWithOptions plus the kAXTrustedCheckOptionPrompt constant. Pass that key set to true in a CFDictionary and macOS shows the System Settings prompt. Until the user grants it, attribute reads return kAXErrorAPIDisabled and you get nothing useful, even though AXUIElementCreateSystemWide itself still returns a non-null ref.",
  },
  {
    q: "What is the difference between accessibility-sys and the accessibility crate?",
    a: "accessibility-sys is the raw -sys binding: unsafe extern C functions, AXUIElementRef pointers, manual CFRelease. The accessibility crate (also by eiz) is the safe wrapper on top of it. There you write AXUIElement::system_wide() and AXUIElement::application(pid), and you read attributes through AXAttribute and typed getters instead of calling AXUIElementCopyAttributeValue by hand. Most application code wants the wrapper; reach for -sys only when you need a function the wrapper has not surfaced.",
  },
  {
    q: "Is the macOS AX API portable to Windows?",
    a: "The concepts are, the bindings are not. macOS exposes the AX API (AXUIElement, AXAttribute, AX roles); Windows exposes UI Automation (UIAutomationCore, IUIAutomationElement, control patterns). Both model the screen as a tree of typed elements with names, roles, and values, which is why a single locator grammar can sit over both. But AXUIElementCreateSystemWide has no literal Windows twin. If you want one API across both, that abstraction is exactly the work a framework like Terminator does for you.",
  },
  {
    q: "How do I release the element to avoid a leak?",
    a: "AXUIElementCreateSystemWide follows the Core Foundation Create Rule: the name contains Create, so you own the returned reference. Call CFRelease on the AXUIElementRef when you are finished. The same applies to any AXUIElementRef you get back from AXUIElementCreateApplication or AXUIElementCopyElementAtPosition. The safe accessibility crate handles this for you through Rust's Drop, which is the main reason to prefer it over calling -sys directly.",
  },
];

const articleLd = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbLd = breadcrumbListSchema(breadcrumbSchemaItems);
const faqLd = faqPageSchema(faqItems, `${PAGE_URL}#faq`);

const codeBlock =
  "rounded-xl border border-zinc-200 bg-zinc-50 p-5 overflow-x-auto text-[13px] leading-relaxed font-mono text-zinc-800";

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-600 mb-4">
          macOS Accessibility API reference
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.1]">
          accessibility-sys{" "}
          <span className="text-orange-600">AXUIElementCreateSystemWide</span>
          , decoded
        </h1>
        <p className="mt-6 text-lg text-zinc-500 leading-relaxed max-w-2xl">
          The docs.rs page for{" "}
          <code className="font-mono text-[0.95em] text-zinc-700">
            accessibility-sys
          </code>{" "}
          reports that 0% of the crate is documented. So you land on{" "}
          <code className="font-mono text-[0.95em] text-zinc-700">
            AXUIElementCreateSystemWide
          </code>{" "}
          and get one line of FFI with no explanation. This page is the
          explanation: what the system-wide root returns, the one thing it
          cannot do, and the trust gate you hit before any of it works.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </div>
      </header>

      {/* Direct answer */}
      <section className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-700 mb-3">
            Direct answer &middot; verified 2026-06-16
          </p>
          <p className="text-zinc-800 text-lg leading-relaxed">
            In{" "}
            <code className="font-mono text-[0.95em] text-zinc-900">
              accessibility-sys
            </code>{" "}
            (v0.2.0),{" "}
            <code className="font-mono text-[0.95em] text-zinc-900">
              AXUIElementCreateSystemWide
            </code>{" "}
            is a zero-argument FFI binding that returns the macOS system-wide
            accessibility root. You use it to read the currently focused element
            and application, and to hit-test a screen coordinate. It does{" "}
            <strong>not</strong> let you enumerate a whole application&apos;s UI
            tree. For that, create a per-process element with{" "}
            <code className="font-mono text-[0.95em] text-zinc-900">
              AXUIElementCreateApplication(pid)
            </code>
            .
          </p>
          <pre className="mt-5 rounded-xl border border-orange-200 bg-white p-4 overflow-x-auto text-[13px] leading-relaxed font-mono text-zinc-800">
{`pub unsafe extern "C" fn AXUIElementCreateSystemWide() -> AXUIElementRef`}
          </pre>
          <p className="mt-4 text-sm text-zinc-600">
            Source:{" "}
            <a
              href="https://docs.rs/accessibility-sys/latest/accessibility_sys/"
              className="text-orange-600 underline underline-offset-2"
            >
              docs.rs/accessibility-sys
            </a>{" "}
            and Apple&apos;s{" "}
            <a
              href="https://developer.apple.com/documentation/applicationservices/axuielement"
              className="text-orange-600 underline underline-offset-2"
            >
              AXUIElement reference
            </a>
            .
          </p>
        </div>
      </section>

      {/* What docs.rs gives you */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-5">
          What the crate page actually tells you (and what it leaves out)
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          <code className="font-mono text-[0.95em] text-zinc-800">
            accessibility-sys
          </code>{" "}
          is a binding crate, nothing more. Its job is to hand Rust the raw
          symbols from Apple&apos;s HIServices headers so you can call the C
          Accessibility API. The published facts are short and worth pinning
          down before you write a line:
        </p>
        <ul className="space-y-2 text-zinc-700 leading-relaxed mb-6 list-disc pl-5">
          <li>
            Version <strong>0.2.0</strong>, authored by{" "}
            <strong>eiz</strong>, dual licensed MIT or Apache-2.0.
          </li>
          <li>
            One dependency:{" "}
            <code className="font-mono text-[0.9em] text-zinc-800">
              core-foundation-sys ^0.8
            </code>
            . It targets Apple Darwin.
          </li>
          <li>
            docs.rs reports{" "}
            <strong>0% of the crate is documented</strong>, which is why every
            symbol renders as a bare signature.
          </li>
        </ul>
        <p className="text-zinc-700 leading-relaxed">
          That last point is the trap. The signatures are correct, but a
          signature does not tell you that the system-wide element behaves
          completely differently from an application element, or that it returns
          a usable ref even when your process has no Accessibility permission
          and every later call fails. The behavior lives in Apple&apos;s C
          semantics, not in the Rust doc string. Below is the part the rendered
          docs cannot give you.
        </p>
      </section>

      {/* Signature reference */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-5">
          The four symbols you almost always need together
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Reaching for{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            AXUIElementCreateSystemWide
          </code>{" "}
          alone is rare. In practice you call it next to three siblings: the
          per-app constructor, the attribute reader, and the trust check. Here
          are the real signatures as exported by{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            accessibility-sys
          </code>
          .
        </p>
        <pre className={codeBlock}>
{`// The system-wide root: no arguments.
pub unsafe extern "C" fn AXUIElementCreateSystemWide() -> AXUIElementRef;

// A single application's root: takes its process id.
pub unsafe extern "C" fn AXUIElementCreateApplication(pid: pid_t) -> AXUIElementRef;

// Read one attribute (e.g. kAXFocusedUIElementAttribute) off any element.
pub unsafe extern "C" fn AXUIElementCopyAttributeValue(
    element: AXUIElementRef,
    attribute: CFStringRef,
    value: *mut CFTypeRef,
) -> AXError;

// Is this process trusted for Accessibility? Pass kAXTrustedCheckOptionPrompt
// in the options dictionary to surface the System Settings prompt.
pub unsafe extern "C" fn AXIsProcessTrustedWithOptions(
    options: CFDictionaryRef,
) -> bool;`}
        </pre>
        <p className="text-sm text-zinc-500 mt-3">
          The system-wide constructor takes nothing; the application constructor
          takes a{" "}
          <code className="font-mono text-[0.85em] text-zinc-700">pid_t</code>.
          That single difference is the whole mental model.
        </p>
      </section>

      {/* Comparison */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <ComparisonTable
          heading="System-wide element vs application element"
          intro="The two constructors look similar and behave nothing alike. Pick by the question you are asking, not by which name you remember."
          productName="CreateApplication(pid)"
          competitorName="CreateSystemWide()"
          rows={comparisonRows}
          caveat="Both return AXUIElementRef and both follow the Create Rule, so you own and must CFRelease whatever they hand back."
        />
      </section>

      {/* Capability checklist */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What the system-wide root is genuinely good for
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Keep the system-wide element for cross-application questions. The
          moment you want to read a specific window or click a specific button,
          switch to a per-pid element.
        </p>
        <AnimatedChecklist
          title="Valid uses of AXUIElementCreateSystemWide"
          items={[
            {
              text: "Read the focused UI element across every app via kAXFocusedUIElementAttribute",
            },
            {
              text: "Read the focused application via kAXFocusedApplicationAttribute",
            },
            {
              text: "Hit-test a screen coordinate with AXUIElementCopyElementAtPosition",
            },
            {
              text: "Query a handful of system-level attributes that are not app-scoped",
            },
            {
              text: "Walk a full application's window and control tree",
              checked: false,
            },
            {
              text: "Enumerate every open window on the desktop in one call",
              checked: false,
            },
          ]}
        />
      </section>

      {/* Call sequence */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The order the calls actually happen in
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          A working session is never just one function. This is the sequence
          that produces a real element instead of a permission error.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Check trust first",
              description:
                "Call AXIsProcessTrustedWithOptions with kAXTrustedCheckOptionPrompt set true. If the process is not trusted, macOS prompts the user and every later attribute read returns kAXErrorAPIDisabled.",
            },
            {
              title: "Create the right root",
              description:
                "AXUIElementCreateSystemWide() for focus and pointer questions, or AXUIElementCreateApplication(pid) when you want a specific app's tree.",
            },
            {
              title: "Copy the attribute you want",
              description:
                "AXUIElementCopyAttributeValue with a CFString like kAXFocusedUIElementAttribute. Check the returned AXError; do not assume success.",
            },
            {
              title: "Recurse or hit-test",
              description:
                "From an app element, read kAXWindowsAttribute then kAXChildrenAttribute to walk down. From the system-wide element, hit-test with AXUIElementCopyElementAtPosition instead.",
            },
            {
              title: "Release what you created",
              description:
                "Every ref whose constructor name contains Create or Copy is yours to CFRelease. The safe accessibility crate does this through Drop so you never miss one.",
            },
          ]}
        />
      </section>

      {/* Worked code */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-5">
          A minimal read of the focused element
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-5">
          Here is the smallest honest example with the raw{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            accessibility-sys
          </code>{" "}
          surface: gate on trust, create the system-wide root, copy the focused
          element. The unsafe is unavoidable because these are C bindings.
        </p>
        <pre className={codeBlock}>
{`use accessibility_sys::{
    kAXFocusedUIElementAttribute, AXIsProcessTrustedWithOptions,
    AXUIElementCopyAttributeValue, AXUIElementCreateSystemWide,
};
use core_foundation::base::TCFType;
use core_foundation::string::CFString;
use std::ptr;

unsafe {
    // 1. No trust, no elements. Pass an empty options dict here for brevity;
    //    pass kAXTrustedCheckOptionPrompt = true to show the system prompt.
    if !AXIsProcessTrustedWithOptions(ptr::null()) {
        eprintln!("not trusted for Accessibility yet");
        return;
    }

    // 2. The zero-argument root.
    let system_wide = AXUIElementCreateSystemWide();

    // 3. Ask it for whatever currently has focus, anywhere on screen.
    let attr = CFString::new(kAXFocusedUIElementAttribute);
    let mut focused: core_foundation::base::CFTypeRef = ptr::null();
    let err = AXUIElementCopyAttributeValue(
        system_wide,
        attr.as_concrete_TypeRef(),
        &mut focused,
    );

    println!("AXError = {err}, got focused = {}", !focused.is_null());
    // CFRelease(system_wide) and CFRelease(focused) when done.
}`}
        </pre>
        <p className="text-zinc-700 leading-relaxed mt-6 mb-4">
          Most code should not look like that. The safe{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            accessibility
          </code>{" "}
          crate (also by eiz) wraps the same call so you skip the raw pointers
          and the manual release:
        </p>
        <pre className={codeBlock}>
{`use accessibility::{AXUIElement, AXAttribute};

let system_wide = AXUIElement::system_wide();
let focused = system_wide
    .attribute(&AXAttribute::focused_uielement());
// Drop releases the underlying AXUIElementRef for you.

// And for a specific app, by pid:
let app = AXUIElement::application(pid);
let windows = app.attribute(&AXAttribute::windows());`}
        </pre>
      </section>

      {/* From FFI to framework: Terminator tie */}
      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-5">
          From four FFI calls to an automation framework
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Reading the focused element is the easy 5%. The hard 95% is everything
          a real automation tool has to wrap around these bindings: gating and
          re-checking trust, decoding every AX value type, retrying flaky
          attribute reads, mapping AX roles to something stable, and giving you
          a way to <em>find</em> an element by name or role instead of walking
          children by hand. On Windows the same shape repeats with UI Automation
          instead of the AX API. The primitives differ; the work is identical.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          That wrapper is what{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-600 underline underline-offset-2"
          >
            Terminator
          </a>{" "}
          is. It is a desktop automation framework built on native
          accessibility APIs, shaped like Playwright but pointed at the whole
          operating system rather than the browser. You write a selector,
          Terminator resolves it against the accessibility tree, and acts on the
          element. You do not call{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            AXUIElementCopyAttributeValue
          </code>{" "}
          in a loop, you do not hand-manage{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">CFRelease</code>
          , and you do not re-implement the trust dance on every project.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          If you are reaching for{" "}
          <code className="font-mono text-[0.9em] text-zinc-800">
            accessibility-sys
          </code>{" "}
          because you are building agent or computer-use tooling that has to
          drive real apps, that is the exact problem Terminator exists to take
          off your plate, including the MCP server that lets an AI assistant
          call these capabilities as a tool.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building on the AX API and tired of the FFI?"
          description="Tell us what you are automating on the desktop and we will show you where Terminator already solved the tree-walking, trust, and selector problems."
        />
      </section>

      <FaqSection items={faqItems} />

      <section className="max-w-4xl mx-auto px-6">
        <RelatedPostsGrid
          subtitle="Related"
          title="More on the accessibility tree"
          posts={[
            {
              title: "macOS accessibility UI tree automation",
              href: "/t/macos-accessibility-ui-tree",
              excerpt:
                "How the AX tree maps to real windows and controls, and how to walk it without losing your mind.",
              tag: "macOS",
            },
            {
              title: "Accessibility API desktop automation",
              href: "/t/accessibility-api-desktop-automation",
              excerpt:
                "Control Patterns fire actions on elements without moving the mouse. The accessibility tree is more than a read surface.",
              tag: "Guide",
            },
            {
              title: "Accessibility API for computer-use agents",
              href: "/t/accessibility-api-computer-use-agents",
              excerpt:
                "When an agent should use the structural tree instead of screenshots, and what that buys you.",
              tag: "Agents",
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Driving real desktop apps from Rust? See how Terminator handles the AX and UIA plumbing."
      />
    </article>
  );
}
