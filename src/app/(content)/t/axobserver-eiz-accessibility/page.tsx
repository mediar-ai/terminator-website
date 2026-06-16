import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  CodeComparison,
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  howToSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/axobserver-eiz-accessibility";
const PUBLISHED = "2026-06-16";
const TITLE =
  "AXObserver with the eiz/accessibility crate: the safe wrapper does not exist, here is the bridge";
const DESCRIPTION =
  "The high-level accessibility crate (eiz/accessibility) ships no AXObserver type. It exposes TreeWalker, ElementFinder, and the AXUIElement surface, and nothing else. To receive AX notifications you drop to the companion accessibility-sys FFI crate and drive AXObserverCreate, AXObserverAddNotification, and AXObserverGetRunLoopSource yourself. This is the layer Terminator's macOS tree walker sits on.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "eiz/accessibility has no safe AXObserver. You bridge to accessibility-sys: AXObserverCreate(pid, callback, *mut AXObserverRef), AXObserverAddNotification, AXObserverGetRunLoopSource, then schedule the run-loop source. Full working wiring with the retain and refcon gotchas.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXObserver is not in eiz/accessibility. Use accessibility-sys.",
    description:
      "The safe crate exports TreeWalker, ElementFinder, AXUIElement. No observer. Notifications live in accessibility-sys via raw AXObserverCreate. Here is the bridge.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "AXObserver with eiz/accessibility" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "AXObserver with eiz/accessibility", url: PAGE_URL },
];

const safeCrateCode = `// What the high-level \`accessibility\` crate (eiz/accessibility) gives you.
// docs.rs/accessibility exports exactly this surface:
use accessibility::{
    AXUIElement,        // a wrapped element ref
    AXAttribute,        // typed attribute access
    AXUIElementAttributes,
    TreeWalker,         // depth-first tree traversal
    TreeVisitor,        // enter_element / exit_element
    ElementFinder,      // find one element by predicate
    Error,
};

// You can read the tree:
let app = AXUIElement::application(pid);
let title = app.attribute(&AXAttribute::title())?;

// You can walk it. But there is no AXObserver type here.
// No \`Observer\`, no \`Notification\`, no \`add_notification\`, nothing.
// The crate is a pull model: you ask, it answers. It never pushes.`;

const sysCrateCode = `// What you must reach for: the companion FFI crate accessibility-sys.
// This is the complete, unsafe layer the safe crate is built on.
use accessibility_sys::{
    AXObserverCreate,            // (pid_t, AXObserverCallback, *mut AXObserverRef) -> AXError
    AXObserverAddNotification,   // (observer, element, CFStringRef, *mut c_void) -> AXError
    AXObserverRemoveNotification,
    AXObserverGetRunLoopSource,  // (observer) -> CFRunLoopSourceRef
    AXObserverRef,
    kAXFocusedUIElementChangedNotification,
    kAXValueChangedNotification,
    kAXWindowCreatedNotification,
};

// The callback is a bare C function pointer, four args, no closure capture:
pub type AXObserverCallback = unsafe extern "C" fn(
    observer: AXObserverRef,
    element: AXUIElementRef,
    notification: CFStringRef,
    refcon: *mut c_void,
);

// Everything below is your job. The safe crate will not do it for you.`;

const fullExample = `use accessibility_sys::{
    AXObserverAddNotification, AXObserverCreate, AXObserverGetRunLoopSource,
    AXObserverRef, AXUIElementRef, kAXFocusedUIElementChangedNotification,
};
use core_foundation::base::TCFType;
use core_foundation::runloop::{kCFRunLoopDefaultMode, CFRunLoop};
use core_foundation::string::CFString;
use std::os::raw::c_void;
use std::ptr;

// 1. The callback. It is extern "C" and cannot capture state, so any
//    context you need must arrive through the refcon pointer.
unsafe extern "C" fn on_notification(
    _observer: AXObserverRef,
    _element: AXUIElementRef,
    notification: core_foundation::string::CFStringRef,
    _refcon: *mut c_void,
) {
    let note = CFString::wrap_under_get_rule(notification);
    println!("AX notification fired: {}", note.to_string());
    // Do NOT release \`notification\` or \`element\`: they are
    // "get rule" references owned by the observer, not by you.
}

fn watch_focus(pid: i32) -> Result<(), i32> {
    unsafe {
        // 2. Create the observer for one target process (by pid).
        let mut observer: AXObserverRef = ptr::null_mut();
        let err = AXObserverCreate(pid, on_notification, &mut observer);
        if err != 0 {
            return Err(err); // kAXErrorSuccess is 0
        }

        // 3. Register the notifications you care about against an element.
        //    Use the application element as the root for app-wide events.
        let app = accessibility::AXUIElement::application(pid);
        let note = CFString::from_static_string(
            kAXFocusedUIElementChangedNotification,
        );
        AXObserverAddNotification(
            observer,
            app.as_concrete_TypeRef(),
            note.as_concrete_TypeRef(),
            ptr::null_mut(), // refcon: pass a *mut to your state here
        );

        // 4. The observer is inert until its run-loop source is scheduled.
        //    This is the step people miss: no source on a run loop, no callbacks.
        let source = AXObserverGetRunLoopSource(observer);
        CFRunLoop::get_current().add_source(
            &core_foundation::runloop::CFRunLoopSource::wrap_under_get_rule(source),
            kCFRunLoopDefaultMode,
        );

        // 5. Keep \`observer\` alive for the lifetime of the watch, and
        //    run a loop so the source can deliver. Dropping the observer
        //    or letting the run loop exit stops every notification.
        CFRunLoop::run_current();
    }
    Ok(())
}`;

const faqs: FaqItem[] = [
  {
    q: "Does the eiz/accessibility crate expose AXObserver?",
    a: "No. The high-level `accessibility` crate (github.com/eiz/accessibility, published as `accessibility` on crates.io) exports ElementFinder, TreeWalker, TreeVisitor, TreeWalkerFlow, Error, and the action, attribute, and ui_element modules. There is no Observer type, no Notification type, and no add_notification method anywhere in its public surface. The crate is a pull model: you call AXUIElement::attribute() and it answers. It never pushes events to you. AXObserver lives only in the companion FFI crate `accessibility-sys`.",
  },
  {
    q: "Why is AXObserver in accessibility-sys but not in accessibility?",
    a: "Because the safe crate was never finished for the observer path. Its own README states it plainly: 'The high level safe bindings are pretty spotty, but accessibility-sys is complete.' The author wrapped the read path (elements, attributes, tree walking) in safe Rust because that is what most assistive-tech tools needed first. The notification path, which requires a C function pointer, a refcon for context, and manual run-loop scheduling, is harder to wrap safely, so it was left at the raw FFI level in accessibility-sys.",
  },
  {
    q: "What is the exact signature of AXObserverCreate in accessibility-sys?",
    a: "`pub unsafe extern \"C\" fn AXObserverCreate(application: pid_t, callback: AXObserverCallback, outObserver: *mut AXObserverRef) -> AXError`. The first argument is a process id, not an element: an observer is scoped to one process. The callback is `unsafe extern \"C\" fn(observer: AXObserverRef, element: AXUIElementRef, notification: CFStringRef, refcon: *mut c_void)`, a bare C function pointer that cannot capture a closure environment. AXError is an i32 where 0 (kAXErrorSuccess) means success.",
  },
  {
    q: "My callback never fires. What did I forget?",
    a: "Almost always the run-loop source. AXObserverCreate and AXObserverAddNotification do not arm anything. The observer stays inert until you call AXObserverGetRunLoopSource(observer) and add that CFRunLoopSourceRef to a running CFRunLoop in kCFRunLoopDefaultMode. If you registered notifications and then returned from your function, or if you never started a run loop on that thread, the observer is alive but mute. The second most common cause is that the process is not accessibility-trusted; call AXIsProcessTrusted() and check it returns true before debugging anything else.",
  },
  {
    q: "How do I pass state into the extern \"C\" callback?",
    a: "Through the refcon. AXObserverAddNotification takes a final `*mut c_void` argument that is handed back to your callback verbatim on every event. Box your state, leak or otherwise keep the box alive, and pass `Box::into_raw(state) as *mut c_void`. Inside the callback, recover it with `&*(refcon as *const YourState)`. Do not pass a pointer to a stack value: the stack frame is gone by the time the notification fires. And do not drop the box while the observer is still registered, or the callback dereferences freed memory.",
  },
  {
    q: "Do I need to release the element and notification passed to my callback?",
    a: "No. Both arrive as Core Foundation 'get rule' references: the observer owns them, you are only borrowing for the duration of the callback. Wrap them with `wrap_under_get_rule` (not `wrap_under_create_rule`) if you use the core-foundation crate, which takes a +0 reference and will not over-release. Calling CFRelease on them yourself, or wrapping with the create-rule variant, double-frees and crashes the host app, not just your code, because you are running inside its accessibility bridge.",
  },
  {
    q: "Which notification name constants does accessibility-sys provide?",
    a: "The common ones are exported as static strings: kAXFocusedUIElementChangedNotification, kAXValueChangedNotification, kAXWindowCreatedNotification, kAXMainWindowChangedNotification, kAXFocusedWindowChangedNotification, kAXUIElementDestroyedNotification, kAXTitleChangedNotification, and the selection and row-count families. You pass them to AXObserverAddNotification as a CFStringRef. Build one with `CFString::from_static_string(kAXFocusedUIElementChangedNotification)` and hand over `as_concrete_TypeRef()`.",
  },
  {
    q: "Does Terminator use the eiz/accessibility crate?",
    a: "Yes, on the macOS side. The tree walker at crates/terminator/src/platforms/tree_search.rs opens with `use accessibility::{AXAttribute, AXUIElement, AXUIElementAttributes, Error};` and builds a custom TreeWalkerWithWindows on top of it. The file's first line is a warning that explains why the custom walker exists: the crate's default TreeWalker does not descend into application windows, so Terminator walks the window list manually. It is a concrete example of living inside the eiz crate's safe surface for the read path while reaching past it where the abstraction stops.",
  },
  {
    q: "Should I poll the tree instead of using AXObserver?",
    a: "Only if events do not matter to you. Polling AXUIElement attributes on a timer is simple and entirely within the safe crate, and for a one-shot script it is fine. But polling cannot tell you the instant focus moved, a window opened, or a text field's value changed, and it burns CPU re-walking a tree that did not change. AXObserver is the push model: the system calls you exactly when the thing happens. For anything long-running, an agent watching for state changes, a recorder capturing a workflow, the observer is the correct primitive even though it costs you a trip through accessibility-sys.",
  },
];

export default function Page() {
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
  const faqLd = faqPageSchema(faqs);
  const howToLd = howToSchema(
    "Wire AXObserver onto the eiz/accessibility crate",
    "Receive macOS accessibility notifications when the high-level accessibility crate has no observer type, by bridging to the accessibility-sys FFI crate.",
    [
      { name: "Create the observer", text: "Call AXObserverCreate(pid, callback, &mut observer) with the target process id and a bare extern C callback." },
      { name: "Register notifications", text: "Call AXObserverAddNotification(observer, element, notification, refcon) for each AX notification name you care about." },
      { name: "Schedule the run-loop source", text: "Call AXObserverGetRunLoopSource(observer) and add it to a running CFRunLoop in kCFRunLoopDefaultMode." },
      { name: "Keep it alive and run", text: "Hold the observer for the lifetime of the watch and run the run loop so the source can deliver callbacks." },
    ]
  );

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4">
          macOS accessibility / Rust
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
          AXObserver and the eiz/accessibility crate: the safe wrapper does not exist
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          If you searched for AXObserver alongside eiz/accessibility, you almost
          certainly hit the same wall everyone does: you found the crate, you
          found AXUIElement and TreeWalker, and you could not find an observer
          anywhere. You are not missing it. It is not there.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      {/* Direct answer */}
      <section className="max-w-3xl mx-auto px-6 mt-8">
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-06-16)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <strong>The high-level <code className="font-mono text-[0.95em]">accessibility</code> crate
            (eiz/accessibility) does not expose AXObserver.</strong> Its public
            surface is ElementFinder, TreeWalker, TreeVisitor, TreeWalkerFlow,
            Error, and the action, attribute, and ui_element modules. To receive
            AX notifications you bridge to its companion FFI crate{" "}
            <code className="font-mono text-[0.95em]">accessibility-sys</code>,
            which has the complete observer API: <code className="font-mono text-[0.9em]">AXObserverCreate</code>,{" "}
            <code className="font-mono text-[0.9em]">AXObserverAddNotification</code>, and{" "}
            <code className="font-mono text-[0.9em]">AXObserverGetRunLoopSource</code>. The crate's own
            README says it directly: &quot;The high level safe bindings are pretty
            spotty, but accessibility-sys is complete.&quot;
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Verified against{" "}
            <a
              href="https://docs.rs/accessibility/latest/accessibility/"
              className="text-orange-600 underline underline-offset-2"
            >
              docs.rs/accessibility
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/eiz/accessibility"
              className="text-orange-600 underline underline-offset-2"
            >
              github.com/eiz/accessibility
            </a>
            .
          </p>
        </div>
      </section>

      {/* The two crates */}
      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900">
          Two crates, one of them is the read path and one of them is everything else
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          eiz/accessibility ships as two crates that live in the same repository.{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">accessibility</code>{" "}
          is the safe, ergonomic layer. <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">accessibility-sys</code>{" "}
          is the raw <code className="font-mono text-sm">extern &quot;C&quot;</code> binding to Apple&apos;s
          ApplicationServices accessibility functions. The safe layer wraps the
          parts that were easy to make safe, which is the pull model: ask an
          element for an attribute, walk a tree. The push model, where the system
          calls you back when something changes, was left at the raw FFI level.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          So the answer to &quot;how do I use AXObserver with eiz/accessibility&quot;
          is not a function call you missed. It is a layer change. You keep using
          the safe crate for elements and attributes, and you reach down to
          accessibility-sys for the observer itself.
        </p>

        <div className="mt-8">
          <CodeComparison
            title="The surface you have vs the surface you need"
            leftLabel="accessibility (safe, no observer)"
            rightLabel="accessibility-sys (raw, complete)"
            leftCode={safeCrateCode}
            rightCode={sysCrateCode}
            leftLines={safeCrateCode.split("\n").length}
            rightLines={sysCrateCode.split("\n").length}
          />
        </div>
      </section>

      {/* Walkthrough */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">
          The bridge, four steps
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          An AXObserver is not a poll loop. It is a Core Foundation run-loop
          source that the system fires when a registered notification happens
          inside a target process. Wiring it up is four mechanical steps, and
          missing any one of them produces an observer that compiles, runs, and
          never calls you back.
        </p>

        <div className="mt-8">
          <StepTimeline
            steps={[
              {
                title: "Create the observer for a pid",
                description:
                  "AXObserverCreate(pid, callback, &mut observer). The observer is scoped to one process, identified by process id, not by element. The callback is a bare extern \"C\" function pointer, so it cannot capture anything from its environment.",
                detail: (
                  <code className="font-mono text-xs text-zinc-700">
                    AXObserverCreate(pid_t, AXObserverCallback, *mut AXObserverRef) -&gt; AXError
                  </code>
                ),
              },
              {
                title: "Register each notification",
                description:
                  "AXObserverAddNotification(observer, element, notification, refcon). Register against the application element for app-wide events like focus changes, or against a specific element for value changes. The notification is a CFStringRef built from one of the kAX...Notification constants.",
                detail: (
                  <code className="font-mono text-xs text-zinc-700">
                    AXObserverAddNotification(observer, element, CFStringRef, *mut c_void) -&gt; AXError
                  </code>
                ),
              },
              {
                title: "Schedule the run-loop source",
                description:
                  "AXObserverGetRunLoopSource(observer) returns a CFRunLoopSourceRef. Add it to a running CFRunLoop in kCFRunLoopDefaultMode. This is the step that is easy to skip and impossible to debug from the symptom alone: until the source is on a live run loop, the observer delivers nothing.",
                detail: (
                  <code className="font-mono text-xs text-zinc-700">
                    AXObserverGetRunLoopSource(observer) -&gt; CFRunLoopSourceRef
                  </code>
                ),
              },
              {
                title: "Keep it alive and run the loop",
                description:
                  "Hold the observer for the full lifetime of the watch and run a run loop on that thread. Drop the observer, let the box behind your refcon free, or let the run loop exit, and every callback stops at once.",
              },
            ]}
          />
        </div>
      </section>

      {/* Full code */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">
          A working watch, end to end
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Here is the whole thing for a focus-change watch on one process. It
          uses the safe <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">accessibility</code>{" "}
          crate to grab the application element and the raw{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">accessibility-sys</code>{" "}
          functions for the observer, with core-foundation handling the run loop
          and string conversions.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-200 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="h-3 w-3 rounded-full bg-zinc-700" />
            <span className="ml-3 font-mono text-xs text-zinc-400">
              watch_focus.rs
            </span>
          </div>
          <pre className="overflow-x-auto bg-zinc-950 p-5 text-[13px] leading-relaxed">
            <code className="font-mono text-zinc-100 whitespace-pre">
              {fullExample}
            </code>
          </pre>
        </div>
      </section>

      {/* Gotchas */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">
          The four things that silently break it
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          None of these throw a compile error. Each one produces an observer that
          looks correct and delivers nothing, or worse, crashes the app you are
          watching. If your callback is not firing, walk this list before
          touching anything else.
        </p>
        <div className="mt-8">
          <AnimatedChecklist
            title="Pre-flight for a silent observer"
            items={[
              {
                text: "The run-loop source is added to a running CFRunLoop. AXObserverGetRunLoopSource returns it, but you have to schedule it and keep a loop running. No loop, no callbacks.",
                checked: true,
              },
              {
                text: "The process is accessibility-trusted. AXIsProcessTrusted() returns true. Without the permission, AXObserverCreate can succeed and still never deliver.",
                checked: true,
              },
              {
                text: "Your refcon points at heap state that outlives the registration. A pointer to a stack value is dangling by the time the notification fires.",
                checked: true,
              },
              {
                text: "You wrap callback element and notification refs with the get-rule, not the create-rule. Over-releasing them double-frees inside the host process.",
                checked: true,
              },
            ]}
          />
        </div>
      </section>

      {/* Terminator anchor */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">
          How a real framework sits on this crate
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Terminator is an open source desktop automation framework that drives
          apps through native accessibility APIs rather than OCR or pixel
          matching. Its macOS tree walker is built directly on the eiz crate. The
          file <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">crates/terminator/src/platforms/tree_search.rs</code>{" "}
          opens with:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-950 p-4 text-[13px] leading-relaxed">
          <code className="font-mono text-zinc-100 whitespace-pre">{`// TLDR: default TreeWalker does not traverse windows,
// so we need to traverse windows manually
use accessibility::{AXAttribute, AXUIElement, AXUIElementAttributes, Error};`}</code>
        </pre>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          That first comment is the same lesson as the AXObserver gap, one layer
          up. The safe crate gives you a TreeWalker, but it does not descend into
          an application&apos;s windows, so Terminator wrote{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">TreeWalkerWithWindows</code>{" "}
          to walk the window list by hand. The pattern repeats across the whole
          eiz surface: lean on the safe layer for the common read path, and reach
          past it the moment you need something the safe wrapper never covered,
          window traversal, or observers, or anything event-driven.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          That is the honest shape of building on macOS accessibility in Rust
          today. The high-level crate saves you real work on the part it covers,
          and you should expect to drop to accessibility-sys for the rest. An
          observer is simply the most common place people hit that edge, which is
          why this exact pairing turns up in searches at all.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building an observer-driven automation layer on macOS?"
          description="We live in the eiz/accessibility and accessibility-sys layers daily for Terminator. Tell us what you are watching for and we will compare notes on the run-loop and trust-prompt edges."
        />
      </div>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Questions developers actually ask about this
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related reading"
          posts={[
            {
              title: "macOS accessibility UI tree automation",
              href: "/t/macos-accessibility-ui-tree",
              excerpt:
                "Walking the AX tree on macOS, role and attribute lookups, and where the abstraction leaks.",
              tag: "macOS",
            },
            {
              title: "Accessibility API desktop automation",
              href: "/t/accessibility-api-desktop-automation",
              excerpt:
                "Fire control patterns instead of moving the mouse, on the write path side of the accessibility tree.",
              tag: "Concept",
            },
            {
              title: "Accessibility API for AI agents",
              href: "/t/accessibility-api-ai-agents",
              excerpt:
                "Why an agent should read the accessibility tree and listen for changes rather than screenshot and poll.",
              tag: "Agents",
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Stuck on a silent AXObserver? Let's debug the run-loop wiring together."
      />
    </article>
  );
}
