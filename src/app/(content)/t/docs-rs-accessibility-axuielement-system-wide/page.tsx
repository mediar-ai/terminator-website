import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ComparisonTable,
  FlowDiagram,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/docs-rs-accessibility-axuielement-system-wide";
const PUBLISHED = "2026-06-15";
const TITLE =
  "AXUIElement::system_wide() in Rust: the accessibility crate, explained";
const DESCRIPTION =
  "The docs.rs pages for the accessibility crate give you the signature pub fn system_wide() -> Self and nothing else. This is the field guide: what system_wide() actually returns, why you almost always want application(pid) instead, the permission gate, and the trap that the crate's own TreeWalker will not descend into an app's windows.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "AXUIElement::system_wide() returns the global accessibility root. application(pid) returns one app. Here is the difference, the permission gate, and why the stock TreeWalker skips windows.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXUIElement::system_wide() in Rust, demystified",
    description:
      "accessibility crate v0.2.0. system_wide() wraps AXUIElementCreateSystemWide(). The gotcha: the stock TreeWalker does not traverse windows. tree_search.rs proves it.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/accessibility-api-desktop-automation" },
  { label: "AXUIElement::system_wide() in Rust" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "Guides",
    url: "https://t8r.tech/t/accessibility-api-desktop-automation",
  },
  { name: "AXUIElement::system_wide() in Rust", url: PAGE_URL },
];

const constructorRows: ComparisonRow[] = [
  {
    feature: "What it returns",
    competitor: "The single global system-wide accessibility root",
    ours: "The accessibility root of one running application",
  },
  {
    feature: "Signature",
    competitor: "pub fn system_wide() -> Self",
    ours: "pub fn application(pid: pid_t) -> Self",
  },
  {
    feature: "Underlying C call",
    competitor: "AXUIElementCreateSystemWide()",
    ours: "AXUIElementCreateApplication(pid)",
  },
  {
    feature: "Good for",
    competitor:
      "Reading the system-wide focused element (AXFocusedUIElement) and global attributes",
    ours: "Walking a specific app's window and control tree",
  },
  {
    feature: "windows() on it",
    competitor: "Returns nothing useful, the system root has no windows",
    ours: "Returns the app's AXWindow elements you can descend into",
  },
  {
    feature: "Can fail",
    competitor: "No, it is infallible, returns Self",
    ours: "No on construction, but attribute reads fail without permission",
  },
];

const walkSteps = [
  {
    label: "root.windows()",
    detail:
      "Ask the application element for its AXWindows array. The stock TreeWalker never does this, which is the whole reason a custom walker exists.",
  },
  {
    label: "root.main_window()",
    detail:
      "Some apps expose a main window that is not in the windows() array. Walk it too, guarding against the duplicate.",
  },
  {
    label: "attribute(children)",
    detail:
      "Only after the windows are handled, descend into AXChildren the ordinary way.",
  },
  {
    label: "dedupe via CFEqual / CFHash",
    detail:
      "AX trees contain cycles. Every visited element goes into a HashSet keyed on Core Foundation identity so the walk terminates.",
  },
];

const permissionItems = [
  {
    text: "The host process is granted Accessibility permission in System Settings, Privacy and Security, Accessibility.",
  },
  {
    text: "You check it at runtime with AXIsProcessTrusted() before relying on any attribute read.",
  },
  {
    text: "You handle the error path: without trust, system_wide() still returns an element, but attribute() calls come back as an Err, not a panic.",
  },
  {
    text: "For a single app you have the target's pid, so you can call AXUIElement::application(pid) instead of filtering the whole system.",
  },
];

const relatedPosts = [
  {
    title: "The macOS accessibility automation API",
    href: "/t/macos-accessibility-automation-api",
    excerpt:
      "How the AX layer exposes the macOS UI as a queryable tree, and what that buys you over screenshots.",
    tag: "macOS",
  },
  {
    title: "Accessibility API desktop automation",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "The write path: firing control patterns and actions on elements without moving the mouse.",
    tag: "Automation",
  },
  {
    title: "Walking the macOS accessibility UI tree",
    href: "/t/macos-accessibility-ui-tree",
    excerpt:
      "Roles, attributes, and how a structural tree walk beats pixel matching for finding controls.",
    tag: "Internals",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What does AXUIElement::system_wide() return in the accessibility crate?",
    a: "In the accessibility crate version 0.2.0 it is an associated function with the signature pub fn system_wide() -> Self. It returns an AXUIElement that represents the single global system-wide accessibility root. Under the hood it calls AXUIElementCreateSystemWide() from the accessibility-sys crate, whose C signature is pub unsafe extern \"C\" fn AXUIElementCreateSystemWide() -> AXUIElementRef. The system-wide element is the right handle when you want the system focused element (the AXFocusedUIElement attribute, which points at whatever control currently has keyboard focus, regardless of which app owns it). It is not a good handle for walking a particular application, because it does not expose that application's windows.",
  },
  {
    q: "Should I use system_wide() or application(pid) to automate an app?",
    a: "Almost always application(pid). AXUIElement::application(pid: pid_t) -> Self returns the accessibility root of one process, and crucially its windows() method returns that app's AXWindow elements, which you then descend into. system_wide() is for global queries like 'what has focus right now.' If you start from system_wide() and try to find a button inside a specific app, you have to go system root, find the running application, then its windows, then the tree. Starting from application(pid) skips the first two hops. There is also application_with_bundle(bundle_id: &str) -> Result<Self, Error> if you only know the bundle identifier rather than the pid.",
  },
  {
    q: "Why do attribute reads fail even though system_wide() succeeds?",
    a: "Because system_wide() is infallible by signature, it returns Self, not a Result. The permission gate shows up later. macOS only lets a process read the accessibility tree if the user has granted it Accessibility permission in System Settings. If that permission is missing, you still get a valid-looking AXUIElement back, but the first attribute() call returns an Err (an AXError that surfaces as the crate's Error type). Check AXIsProcessTrusted() at startup so you can show a clear permission prompt instead of failing deep in a tree walk.",
  },
  {
    q: "Does the accessibility crate's built-in TreeWalker work out of the box?",
    a: "Not for application trees. The very first line of Terminator's tree_search.rs is a comment that reads: 'TLDR: default TreeWalker does not traverse windows, so we need to traverse windows manually.' The stock TreeWalker descends into AXChildren, but an application's windows are reached through the windows() and main_window() accessors, not always through AXChildren. So Terminator ships TreeWalkerWithWindows, which calls root.windows() first, then root.main_window(), then falls back to the children attribute. If you use the stock walker on an application element you will often see an empty or truncated tree.",
  },
  {
    q: "How do you avoid infinite loops when walking the AX tree?",
    a: "The macOS accessibility tree is a graph, not a strict tree: an element can appear as a child of more than one parent, which creates cycles. Terminator's walker wraps each AXUIElement in an AXUIElementWrapper and stores visited elements in a HashSet. The wrapper implements PartialEq using Core Foundation's CFEqual and Hash using CFHash, so identity is based on the underlying CF object, not on a Rust pointer. Before recursing into an element the walker checks the set; if the element was already seen it returns SkipSubtree and bumps a cycle counter. There is also a MAX_DEPTH constant of 100 as a hard backstop.",
  },
  {
    q: "Where can I read a real implementation that uses AXUIElement?",
    a: "crates/terminator/src/platforms/tree_search.rs in the open-source Terminator repo. It imports use accessibility::{AXAttribute, AXUIElement, AXUIElementAttributes, Error}, which is the same accessibility crate published on docs.rs. The file contains TreeWalkerWithWindows (the windows-aware walker), ElementFinderWithWindows (a walker that polls with an implicit wait and sleeps in 250 ms slices until a deadline), and the AXUIElementWrapper cycle-detection type. It is MIT licensed, so you can copy the pattern. The repo is at github.com/mediar-ai/terminator.",
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
          __html: JSON.stringify(faqPageSchema(faqs, `${PAGE_URL}#faq`)),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Rust / macOS accessibility
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            AXUIElement::system_wide() in Rust, and the trap the docs leave out
          </h1>
          <p className="mt-5 text-lg text-zinc-600">
            If you searched the <code className="font-mono text-[0.95em]">accessibility</code> crate on
            docs.rs you found a one-line signature and no example. This is the
            part the reference page cannot tell you: what{" "}
            <code className="font-mono text-[0.95em]">system_wide()</code> is actually for, when to
            reach for <code className="font-mono text-[0.95em]">application(pid)</code> instead, and
            why the crate&apos;s own tree walker will quietly skip an app&apos;s windows.
          </p>
          <div className="mt-6">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="8 min read"
            />
          </div>
        </header>

        {/* DIRECT ANSWER */}
        <section
          aria-label="Direct answer"
          className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
            Direct answer &middot; verified 2026-06-15
          </p>
          <p className="mt-3 text-zinc-800">
            In the <code className="font-mono text-[0.95em]">accessibility</code> crate (v0.2.0),{" "}
            <code className="font-mono text-[0.95em]">AXUIElement::system_wide()</code> is an
            associated function:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">{`pub fn system_wide() -> Self`}</code>
          </pre>
          <p className="mt-3 text-zinc-800">
            It returns the global <strong>system-wide accessibility root</strong>, wrapping the C
            function <code className="font-mono text-[0.95em]">AXUIElementCreateSystemWide()</code>{" "}
            from <code className="font-mono text-[0.95em]">accessibility-sys</code>. Use it to read
            the system focused element. To walk a single app&apos;s UI, use{" "}
            <code className="font-mono text-[0.95em]">AXUIElement::application(pid)</code> instead.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Source:{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://docs.rs/accessibility/latest/accessibility/ui_element/struct.AXUIElement.html"
            >
              docs.rs/accessibility &rsaquo; AXUIElement
            </a>
          </p>
        </section>

        {/* CONSTRUCTORS */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            The constructors, and which one you actually want
          </h2>
          <p className="mt-4 text-zinc-700">
            The struct gives you four ways to get an{" "}
            <code className="font-mono text-[0.95em]">AXUIElement</code> to start from:{" "}
            <code className="font-mono text-[0.95em]">system_wide()</code>,{" "}
            <code className="font-mono text-[0.95em]">application(pid)</code>,{" "}
            <code className="font-mono text-[0.95em]">application_with_bundle(bundle_id)</code>, and{" "}
            <code className="font-mono text-[0.95em]">application_with_bundle_timeout(bundle_id, timeout)</code>.
            People reach for <code className="font-mono text-[0.95em]">system_wide()</code> first
            because it is the one that needs no arguments. That is usually the wrong move. Here is
            the difference that matters:
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="system_wide()"
              competitorName="application(pid)"
              rows={constructorRows.map((r) => ({
                feature: r.feature,
                competitor: r.competitor,
                ours: r.ours,
              }))}
              caveat="Column 1 is system_wide(); column 2 is application(pid). Both return AXUIElement; only the second is a useful starting point for walking one app's tree."
            />
          </div>
          <p className="mt-5 text-zinc-700">
            The single legitimate reason to start from{" "}
            <code className="font-mono text-[0.95em]">system_wide()</code> is the focused-element
            query. Reading the <code className="font-mono text-[0.95em]">AXFocusedUIElement</code>{" "}
            attribute on the system root tells you which control has keyboard focus right now,
            across every app on the machine. That is the global hook editors and clipboard tools
            use. For anything scoped to a known process, take the pid and call{" "}
            <code className="font-mono text-[0.95em]">application(pid)</code>.
          </p>
        </section>

        {/* PERMISSION GATE */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Why system_wide() &ldquo;works&rdquo; but reads nothing
          </h2>
          <p className="mt-4 text-zinc-700">
            The first surprise is that <code className="font-mono text-[0.95em]">system_wide()</code>{" "}
            cannot fail. Its return type is <code className="font-mono text-[0.95em]">Self</code>,
            not <code className="font-mono text-[0.95em]">Result&lt;Self, Error&gt;</code>. So the
            handle always looks fine. The failure shows up one call later, when you read an
            attribute and macOS refuses because your process was never granted Accessibility
            permission. The element is real; the data behind it is gated.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">{`use accessibility::{AXUIElement, AXAttribute};

// Infallible: you always get an element back.
let system = AXUIElement::system_wide();

// Fallible: this is where missing permission bites.
match system.attribute(&AXAttribute::focused_uielement()) {
    Ok(focused) => { /* the control with keyboard focus */ }
    Err(e) => {
        // Not a panic. An Err you must handle.
        eprintln!("AX read failed (permission?): {e:?}");
    }
}`}</code>
          </pre>
          <p className="mt-5 text-zinc-700">
            Check the grant up front so you can prompt the user cleanly instead of failing deep in
            a tree walk. These are the preconditions before any{" "}
            <code className="font-mono text-[0.95em]">attribute()</code> call returns real data:
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="Preconditions for a useful AXUIElement"
              items={permissionItems}
            />
          </div>
        </section>

        {/* THE GOTCHA - ANCHOR FACT */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            The trap: the stock TreeWalker does not traverse windows
          </h2>
          <p className="mt-4 text-zinc-700">
            This is the part no reference page mentions, and the reason this guide exists. The{" "}
            <code className="font-mono text-[0.95em]">accessibility</code> crate ships a{" "}
            <code className="font-mono text-[0.95em]">TreeWalker</code>. If you point it at an
            application&apos;s <code className="font-mono text-[0.95em]">AXUIElement</code> and expect
            it to enumerate the windows and controls, you will get an almost-empty tree. The reason:
            on macOS an application&apos;s windows are reached through dedicated accessors, not
            reliably through the generic <code className="font-mono text-[0.95em]">AXChildren</code>{" "}
            attribute the stock walker follows.
          </p>
          <p className="mt-4 text-zinc-700">
            Terminator hit this and left the explanation as the literal first line of its walker
            file, <code className="font-mono text-[0.95em]">crates/terminator/src/platforms/tree_search.rs</code>:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border-l-4 border-orange-400 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800">
            <code className="font-mono">{`/// TLDR: default TreeWalker does not traverse windows,
/// so we need to traverse windows manually
use accessibility::{AXAttribute, AXUIElement, AXUIElementAttributes, Error};`}</code>
          </pre>
          <p className="mt-5 text-zinc-700">
            The fix is a custom walker, <code className="font-mono text-[0.95em]">TreeWalkerWithWindows</code>,
            that visits things in a deliberate order. For each element it tries the windows first,
            then the main window, then the ordinary children:
          </p>
          <div className="mt-6">
            <FlowDiagram
              title="How TreeWalkerWithWindows descends one element"
              steps={walkSteps}
            />
          </div>
          <pre className="mt-6 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">{`// crates/terminator/src/platforms/tree_search.rs (abridged)
if flow == TreeWalkerFlow::Continue {
    // 1. windows() - the step the stock walker skips
    if let Ok(windows) = &root.windows() {
        for window in windows.iter() {
            self.walk_one(&window, visitor);
        }
    }
    // 2. main_window() - some apps expose it outside windows()
    if let Ok(main_window) = root.main_window() {
        self.walk_one(&main_window, visitor);
    }
    // 3. only now, the generic children attribute
    if let Ok(children) = root.attribute(&self.attr_children) {
        for child in children.into_iter() {
            self.walk_one(&child, visitor);
        }
    }
}`}</code>
          </pre>
        </section>

        {/* CYCLES */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            And it is a graph, so it has cycles
          </h2>
          <p className="mt-4 text-zinc-700">
            Once you walk windows manually you hit the second surprise: the accessibility tree is
            not a tree. The same element can show up under more than one parent, so a naive
            recursive descent loops forever. Terminator dedupes by wrapping every{" "}
            <code className="font-mono text-[0.95em]">AXUIElement</code> in an{" "}
            <code className="font-mono text-[0.95em]">AXUIElementWrapper</code> and keeping a{" "}
            <code className="font-mono text-[0.95em]">HashSet</code> of what it has already seen. The
            wrapper&apos;s identity is the underlying Core Foundation object, compared with{" "}
            <code className="font-mono text-[0.95em]">CFEqual</code> and hashed with{" "}
            <code className="font-mono text-[0.95em]">CFHash</code>, not a Rust pointer:
          </p>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">{`impl PartialEq for AXUIElementWrapper {
    fn eq(&self, other: &Self) -> bool {
        unsafe {
            let a = self.element.as_concrete_TypeRef();
            let b = other.element.as_concrete_TypeRef();
            core_foundation::base::CFEqual(a as _, b as _) != 0
        }
    }
}

impl Hash for AXUIElementWrapper {
    fn hash<H: Hasher>(&self, state: &mut H) {
        unsafe {
            let r = self.element.as_concrete_TypeRef();
            state.write_u64(core_foundation::base::CFHash(r as _) as u64);
        }
    }
}`}</code>
          </pre>
          <p className="mt-5 text-zinc-700">
            Before recursing, the walker checks the set; a repeat returns{" "}
            <code className="font-mono text-[0.95em]">SkipSubtree</code> and increments a cycle
            counter you can log. There is also a hard{" "}
            <code className="font-mono text-[0.95em]">MAX_DEPTH</code> of 100 as a backstop, and the
            element finder polls on an implicit-wait deadline, sleeping in 250 ms slices until the
            target appears or time runs out. None of this is in the crate docs; all of it is in{" "}
            <code className="font-mono text-[0.95em]">tree_search.rs</code>, MIT licensed, ready to
            copy.
          </p>
        </section>

        {/* WHAT TERMINATOR IS */}
        <section className="mt-14 rounded-xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">
            If you do not want to maintain this yourself
          </h2>
          <p className="mt-3 text-zinc-700">
            Terminator is an open-source desktop automation framework that wraps all of this behind
            a Playwright-shaped API for the whole OS. It uses the same{" "}
            <code className="font-mono text-[0.95em]">accessibility</code> crate on macOS and the
            native UIAutomation layer on Windows, so the windows-aware walk, the cycle dedup, the
            permission handling, and the cross-platform selector grammar are already solved. You
            write <code className="font-mono text-[0.95em]">locator(&quot;name:Save&quot;).click()</code>{" "}
            instead of hand-rolling another tree walker. The source for the macOS path is exactly
            the file quoted above.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Repo:{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator"
            >
              github.com/mediar-ai/terminator
            </a>
          </p>
        </section>

        <div className="mt-14">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Building on the macOS accessibility API?"
            description="Talk through your AXUIElement tree-walk, permission, or cross-platform pain with the people who wrote the walker."
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <div className="mt-16">
          <RelatedPostsGrid
            title="Keep reading"
            posts={relatedPosts}
          />
        </div>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Questions about driving native apps through the accessibility tree? Book a call."
      />
    </article>
  );
}
