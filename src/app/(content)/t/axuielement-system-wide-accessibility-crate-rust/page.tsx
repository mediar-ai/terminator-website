import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  FlowDiagram,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/axuielement-system-wide-accessibility-crate-rust";
const PUBLISHED = "2026-05-06";
const TITLE =
  "AXUIElement::system_wide() in the accessibility crate: the three patterns the docs don't ship";
const DESCRIPTION =
  "AXUIElement::system_wide() in the Rust accessibility crate is a one-line wrapper around AXUIElementCreateSystemWide. The hard part is the three patterns it does not give you: an unsafe Send + Sync wrapper, a permission gate via AXIsProcessTrustedWithOptions, and a two-step walk through AXFocusedApplication then AXFocusedUIElement. Notes from a 4,368-line macOS adapter that was deleted on 2025-12-16 and is still the most complete reference for this code path.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The function body is one line. Your code around it is roughly two hundred. Here is what those lines do, with line numbers from a real implementation.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "AXUIElement::system_wide(): three patterns the accessibility crate docs leave out",
    description:
      "Send + Sync newtype, AXIsProcessTrustedWithOptions gate, AXFocusedApplication then AXFocusedUIElement walk. Real Rust, real line numbers.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  {
    label: "Guides",
    href: "/t/macos-accessibility-ui-tree",
  },
  { label: "AXUIElement::system_wide() in Rust" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "macOS accessibility UI tree",
    url: "https://t8r.tech/t/macos-accessibility-ui-tree",
  },
  { name: "AXUIElement::system_wide() in Rust", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does AXUIElement::system_wide() return in the Rust accessibility crate?",
    a: "It returns an AXUIElement that wraps Apple's AXUIElementCreateSystemWide() C function. The body in eiz/accessibility's accessibility/src/ui_element.rs is one line: unsafe { Self::wrap_under_create_rule(AXUIElementCreateSystemWide()) }. The returned element is the root of the macOS accessibility hierarchy: it is not a single window or application, it is the system-wide pseudo-element that holds attributes like AXFocusedApplication and AXFocusedUIElement and lets you walk into any running app's tree. Calling .role() on it returns kAXErrorNoValue (-25204) because the system-wide element has no role of its own; that is expected, not a bug.",
  },
  {
    q: "Why does AXUIElement need a manual unsafe Send + Sync wrapper to use across threads?",
    a: "Because the underlying type holds a Core Foundation pointer and the accessibility crate does not implement Send or Sync. If you stash an AXUIElement in a tokio task, an Arc you share with another thread, or any Send-bound async context, the borrow checker rejects it. Apple's accessibility API is documented as thread-safe (you can call AXUIElementCopyAttributeValue from any thread, the framework serializes against the main run loop), but Rust does not know that. The fix is a newtype: pub struct ThreadSafeAXUIElement(Arc<AXUIElement>); unsafe impl Send for ThreadSafeAXUIElement {} unsafe impl Sync for ThreadSafeAXUIElement {}. The deleted Terminator macOS adapter declared exactly that at lines 77 to 84 of crates/terminator/src/platforms/macos.rs in commit 0c11011c~1, with a SAFETY comment explaining the reasoning.",
  },
  {
    q: "Do I have to ask for accessibility permission before calling system_wide()?",
    a: "system_wide() itself does not need permission, the function call cannot fail, you get an AXUIElement back unconditionally. Every attribute read on it does need permission. Without it, .attribute_names() returns an empty list and .attribute(AXFocusedApplication) returns kAXErrorNotImplemented or kAXErrorAPIDisabled. The accepted pattern is to gate engine construction on AXIsProcessTrustedWithOptions from ApplicationServices.framework, with AXTrustedCheckOptionPrompt set to true so the system shows the user the prompt the first time. The Terminator adapter did this at lines 119 to 148 of macos.rs: build the CFDictionary with the prompt option, call AXIsProcessTrustedWithOptions, and bail with PermissionDenied if the result is false. The user then has to add your binary to System Settings, Privacy & Security, Accessibility, and restart the process.",
  },
  {
    q: "How do I get the currently focused element starting from system_wide()?",
    a: "It is a two-step walk. The system-wide element does not directly hold the focused element; it holds AXFocusedApplication, which is the focused app's AXUIElement, and that app holds AXFocusedUIElement, which is the actual control under the keyboard cursor. In Rust with the accessibility crate, you read the AXFocusedApplication attribute, downcast the CFType result to AXUIElement, then read AXFocusedUIElement on that and downcast again. If either downcast returns None or either read returns kAXErrorNoValue, there is no focused element right now (no app is foregrounded, or the app has no focusable control). The Terminator adapter implemented this at get_focused_element, lines 2386 to 2410 of macos.rs.",
  },
  {
    q: "Can system_wide() reach a window or control inside an app, or do I need application(pid)?",
    a: "You can reach anything from system_wide() in principle, by walking children of AXFocusedApplication, but that is the slow path and it only works for the foreground app. For any other running app you call AXUIElement::application(pid) to get that app's tree directly. application(pid) is just AXUIElementCreateApplication wrapped under create rule. The PID comes from NSWorkspace.runningApplications or from sysinfo / proc enumeration in pure Rust. The deleted Terminator adapter cached one ThreadSafeAXUIElement per app and refreshed by PID at lines 2440 to 2460. system_wide() is the right root for global queries (focused app, key window) and for serving as a parent reference; per-app trees should always come from application(pid) for stability.",
  },
  {
    q: "What error code should I expect when I call .role() on the system-wide element?",
    a: "-25204, which is kAXErrorNoValue. The system-wide element is a pseudo-element: it exists to hold global attributes, it does not represent a window or control, so it has no AXRole, AXTitle, or AXSize. Treat -25204 as expected on this element and do not log it as a warning. Other -252xx codes are real failures: -25200 kAXErrorAPIDisabled (accessibility off in System Settings), -25201 kAXErrorInvalidUIElement (the AXUIElement was destroyed or the app died), -25202 kAXErrorInvalidUIElementObserver (used by AXObserver only), -25204 kAXErrorNoValue (the attribute exists for that role but is not currently set), -25212 kAXErrorCannotComplete (transient, retry), -25214 kAXErrorAttributeUnsupported (the role does not have this attribute). The Terminator adapter filtered -25204 specifically at line 169 of macos.rs and reused that filter at line 1004.",
  },
  {
    q: "Does system_wide() work in a sandboxed macOS app?",
    a: "No. The macOS App Sandbox blocks AXUIElementCopyAttributeValue against any process you do not own, and AXIsProcessTrustedWithOptions returns false even when the user has approved the app. Mac App Store distribution and TCC sandbox profiles both disable accessibility client API outside the sandbox boundary. The practical answer for any automation tool that uses the accessibility crate's system_wide() is that the binary has to ship outside the sandbox: a Developer ID signed binary distributed directly, a Homebrew formula, a cargo install, or a notarized app with the com.apple.security.app-sandbox entitlement explicitly disabled. There is no Apple-blessed escape hatch from inside the sandbox.",
  },
  {
    q: "Is the accessibility crate the only Rust path to AXUIElement?",
    a: "No, but it is the only one with a high-level wrapper. accessibility-sys is the unsafe FFI layer; it gives you AXUIElementRef and the raw C functions and nothing else. accessibility-sys-ng is a maintained fork. cidre is a broader Apple framework binding that includes some AX types. objc2 currently does not ship AXUIElement bindings (issue #624 in the objc2 repo is the open ask). For new code, the choice is between accessibility (high-level, no Send/Sync) and a thin custom wrapper over accessibility-sys (more code, full control). Both end up calling the same AXUIElementCreateSystemWide. The Send/Sync, permission, and focused-element patterns in this guide apply to either path.",
  },
  {
    q: "Why did Terminator delete its macOS adapter, and what does that mean for someone using the accessibility crate today?",
    a: "Terminator's main crate was Windows-first and the macOS path was diverging in features and reliability. On 2025-12-16, commit 0c11011c removed crates/terminator/src/platforms/macos.rs (4,368 lines) and crates/terminator/src/platforms/linux.rs (2,962 lines) so the team could focus on Windows UIA. The Rust source code is still available in git history at commit 0c11011c~1 and remains, as far as we can tell, the most complete public Rust example of using AXUIElement::system_wide() in production: it covers thread safety, permission gating, focused-element traversal, the kAXErrorNoValue filter, browser-specific bypass for AXPress, value setters, key event composition, and monitor enumeration. If you are starting fresh on macOS automation in Rust today, that file is the reference implementation. The fact that Terminator stopped shipping it does not invalidate the patterns; it means we made a product call about where the team's bandwidth goes, not a technical call about the API.",
  },
];

const focusedElementActors = [
  "Your code",
  "system_wide",
  "Focused app",
  "Focused control",
];

const focusedElementMessages = [
  {
    from: 0,
    to: 1,
    label: "AXUIElement::system_wide()",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "Arc<AXUIElement> root",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "attribute(\"AXFocusedApplication\")",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "downcast::<AXUIElement>()",
    type: "event" as const,
  },
  {
    from: 0,
    to: 2,
    label: "attribute(\"AXFocusedUIElement\")",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "downcast::<AXUIElement>()",
    type: "event" as const,
  },
  {
    from: 3,
    to: 0,
    label: "the actual control",
    type: "response" as const,
  },
];

const callLifecycleSteps = [
  {
    label: "1. Construct",
    detail:
      "AXUIElement::system_wide() calls AXUIElementCreateSystemWide; the body is one line.",
  },
  {
    label: "2. Wrap",
    detail:
      "Place inside Arc and a newtype with unsafe impl Send + Sync, otherwise Tokio rejects it.",
  },
  {
    label: "3. Gate",
    detail:
      "Call AXIsProcessTrustedWithOptions before any attribute read; bail on false.",
  },
  {
    label: "4. Walk",
    detail:
      "AXFocusedApplication then AXFocusedUIElement; downcast each result to AXUIElement.",
  },
];

const gotchas = [
  {
    text: "AXUIElement is not Send and not Sync; the accessibility crate does not impl either.",
    checked: false,
  },
  {
    text: ".role() on the system-wide element returns -25204 (kAXErrorNoValue); filter it.",
    checked: false,
  },
  {
    text: "Without AXIsProcessTrustedWithOptions, attribute reads silently return empty lists.",
    checked: false,
  },
  {
    text: "The Mac App Sandbox blocks system_wide() permanently; ship outside the sandbox.",
    checked: false,
  },
  {
    text: "wrap_under_create_rule moves ownership; do not also call CFRelease on the ref.",
    checked: false,
  },
  {
    text: "AXFocusedApplication returns CFType; downcast to AXUIElement before chaining.",
    checked: false,
  },
];

const constructorSnippet = `// From eiz/accessibility, accessibility/src/ui_element.rs
impl AXUIElement {
    pub fn system_wide() -> Self {
        unsafe { Self::wrap_under_create_rule(AXUIElementCreateSystemWide()) }
    }

    pub fn application(pid: pid_t) -> Self {
        unsafe { Self::wrap_under_create_rule(AXUIElementCreateApplication(pid)) }
    }
}`;

const threadSafeSnippet = `// terminator/crates/terminator/src/platforms/macos.rs (deleted in 0c11011c)
// lines 76-103
#[derive(Clone)]
pub struct ThreadSafeAXUIElement(Arc<AXUIElement>);

// SAFETY: AXUIElement is safe to send and share between threads as Apple's
// accessibility API is designed to be called from any thread. The underlying
// Core Foundation objects manage their own thread safety.
unsafe impl Send for ThreadSafeAXUIElement {}
unsafe impl Sync for ThreadSafeAXUIElement {}

impl ThreadSafeAXUIElement {
    pub fn new(element: AXUIElement) -> Self {
        Self(Arc::new(element))
    }

    pub fn system_wide() -> Self {
        Self(Arc::new(AXUIElement::system_wide()))
    }

    pub fn application(pid: i32) -> Self {
        Self(Arc::new(AXUIElement::application(pid)))
    }
}`;

const permissionSnippet = `// terminator/crates/terminator/src/platforms/macos.rs (deleted in 0c11011c)
// MacOSEngine::new, lines 119-148
let accessibility_enabled = unsafe {
    use core_foundation::dictionary::CFDictionaryRef;

    #[link(name = "ApplicationServices", kind = "framework")]
    unsafe extern "C" {
        fn AXIsProcessTrustedWithOptions(options: CFDictionaryRef) -> bool;
    }

    let check_attr = CFString::new("AXTrustedCheckOptionPrompt");
    let options = CFDictionary::from_CFType_pairs(&[(
        check_attr.as_CFType(),
        CFBoolean::true_value().as_CFType(),
    )])
    .as_concrete_TypeRef();

    AXIsProcessTrustedWithOptions(options)
};

if !accessibility_enabled {
    return Err(AutomationError::PermissionDenied(
        "Accessibility permissions not granted".to_string(),
    ));
}

Ok(Self {
    system_wide: ThreadSafeAXUIElement::system_wide(),
    use_background_apps,
    activate_app,
})`;

const focusedSnippet = `// terminator/crates/terminator/src/platforms/macos.rs (deleted in 0c11011c)
// get_focused_element, lines 2386-2410
fn get_focused_element(&self) -> Result<UIElement, AutomationError> {
    let system_wide = AXUIElement::system_wide();
    let focused_app_attr = AXAttribute::new(&CFString::new("AXFocusedApplication"));
    let focused_element_attr = AXAttribute::new(&CFString::new("AXFocusedUIElement"));

    // Step 1: read AXFocusedApplication off system_wide and downcast to AXUIElement
    let focused_app = system_wide.attribute(&focused_app_attr).map_err(|e| {
        AutomationError::ElementNotFound(
            format!("Failed to get focused application: {}", e),
        )
    })?;

    if let Some(app_element) = focused_app.downcast::<AXUIElement>() {
        // Step 2: read AXFocusedUIElement off the app and downcast again
        let focused_element = app_element.attribute(&focused_element_attr).map_err(|e| {
            AutomationError::ElementNotFound(format!(
                "Failed to get focused element within application: {}",
                e
            ))
        })?;

        if let Some(element) = focused_element.downcast::<AXUIElement>() {
            Ok(self.wrap_element(ThreadSafeAXUIElement::new(element)))
        } else {
            Err(AutomationError::ElementNotFound(
                "Focused element attribute did not contain a valid AXUIElement".to_string(),
            ))
        }
    } else {
        Err(AutomationError::ElementNotFound(
            "AXFocusedApplication did not contain a valid AXUIElement".to_string(),
        ))
    }
}`;

const errorFilterSnippet = `// terminator/crates/terminator/src/platforms/macos.rs (deleted in 0c11011c)
// wrap_element, line 169 — and again at line 1004
if let Err(e) = ax_element.0.role() {
    if let accessibility::Error::Ax(code) = e {
        if code != -25204 {
            // kAXErrorNoValue is expected on the system-wide root and on
            // elements that genuinely have no role; do not warn on those.
            let err_str = error_string(code);
            debug!(
                "Warning: Potentially invalid AXUIElement: {:?} (error: {})",
                e, err_str
            );
        }
    }
}`;

export default function Page() {
  const articleJsonLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqJsonLd = faqPageSchema(faqs);

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-mono font-semibold tracking-tight text-zinc-900 leading-tight">
            <code className="font-mono">AXUIElement::system_wide()</code> in the Rust accessibility crate: the three patterns the docs don&apos;t ship
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            The function body is one line. The code you have to put around it, before any of it does anything useful in a real automation tool, is roughly two hundred. Here are those lines, with line numbers from a deleted-but-still-canonical Rust adapter that used this exact code path in production.
          </p>
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </header>

        <section className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-05-06)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">AXUIElement::system_wide()</code>{" "}
            in the{" "}
            <a
              href="https://github.com/eiz/accessibility"
              className="text-orange-600 underline"
            >
              eiz/accessibility
            </a>{" "}
            crate is a one-line wrapper around{" "}
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">AXUIElementCreateSystemWide()</code>{" "}
            from the macOS ApplicationServices framework. It returns the root pseudo-element of the macOS Accessibility API, the same handle Swift code gets from{" "}
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">AXUIElementCreateSystemWide()</code>.
          </p>
          <p className="mt-3 text-zinc-900 text-base leading-relaxed">
            The returned <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">AXUIElement</code> is{" "}
            <strong>not <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Send</code> and not <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Sync</code></strong>, so for any threaded or async use you wrap it in <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Arc&lt;AXUIElement&gt;</code> inside a newtype with{" "}
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">unsafe impl Send</code> and{" "}
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">unsafe impl Sync</code>. You also gate construction on{" "}
            <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">AXIsProcessTrustedWithOptions</code>, otherwise every attribute read on the element silently returns nothing.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Source for the function body:{" "}
            <a
              href="https://github.com/eiz/accessibility/blob/master/accessibility/src/ui_element.rs"
              className="text-orange-600 underline"
            >
              eiz/accessibility/blob/master/accessibility/src/ui_element.rs
            </a>
            . Reference adapter (4,368 lines, deleted on 2025-12-16):{" "}
            <a
              href="https://github.com/mediar-ai/terminator/commit/0c11011c"
              className="text-orange-600 underline"
            >
              terminator commit 0c11011c
            </a>
            .
          </p>
        </section>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          The function body is one line
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Here is the entire constructor, copied from{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            accessibility/src/ui_element.rs
          </code>{" "}
          on{" "}
          <a
            href="https://github.com/eiz/accessibility"
            className="text-orange-600 underline"
          >
            eiz/accessibility
          </a>
          . It calls into the C function{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElementCreateSystemWide()
          </code>{" "}
          (declared in{" "}
          <a
            href="https://docs.rs/accessibility-sys/latest/accessibility_sys/"
            className="text-orange-600 underline"
          >
            accessibility-sys
          </a>
          ) and wraps the returned{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElementRef
          </code>{" "}
          using Core Foundation&apos;s create-rule (the caller owns one retain).
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{constructorSnippet}</code>
        </pre>

        <p className="text-zinc-700 leading-relaxed">
          That is it. No initialization, no permission check, no error path. The call cannot fail; you always get an element back. Everything that makes this useful, and everything that makes it tricky, lives in the code you write next.
        </p>

        <FlowDiagram
          title="The four-step lifecycle of one system_wide() call"
          steps={callLifecycleSteps}
        />

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Pattern 1: the Send + Sync newtype
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The accessibility crate does not implement{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">Send</code>{" "}
          or{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">Sync</code>{" "}
          on{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">AXUIElement</code>. The struct holds a Core Foundation pointer, and Rust auto-derives neither trait for raw-pointer-bearing types. The compiler is being correct: the crate maintainer has not certified, in code, that the type is thread-safe.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          Apple says it is. The{" "}
          <a
            href="https://developer.apple.com/documentation/applicationservices/axuielement_h"
            className="text-orange-600 underline"
          >
            ApplicationServices Accessibility API
          </a>{" "}
          documentation states that AXUIElement functions can be called from any thread; the framework serializes calls against the application&apos;s main run loop internally. So you have a type that is safe at the framework level but unsafe in the type system. The accepted fix is a newtype with two unsafe impls and a SAFETY comment that pins the assumption to the API documentation.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The deleted Terminator macOS adapter declared this at the top of{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            crates/terminator/src/platforms/macos.rs
          </code>
          . You can read the file in git at{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            git show 0c11011c~1:crates/terminator/src/platforms/macos.rs
          </code>
          .
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{threadSafeSnippet}</code>
        </pre>

        <p className="text-zinc-700 leading-relaxed">
          Three things to notice. The wrapper holds an{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            Arc
          </code>
          , not the raw element, so cloning is cheap and reference counting is correct. The{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            new
          </code>{" "}
          constructor takes an existing{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElement
          </code>{" "}
          (you get those out of attribute reads, see Pattern 3). The two static constructors mirror the high-level crate&apos;s API:{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            system_wide()
          </code>{" "}
          for the global root,{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            application(pid)
          </code>{" "}
          for a specific process. Without this newtype, every Tokio task that touches an AX element fails to compile with a Send bound error.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Pattern 2: the permission gate
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The call to{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            system_wide()
          </code>{" "}
          itself does not require any permission. You always get a valid element handle back. What needs permission is everything you would do with that handle: reading any attribute, listing any child, performing any action.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The failure mode without permission is silent, not loud. Reading{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXFocusedApplication
          </code>{" "}
          on an unauthorized process returns{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            kAXErrorAPIDisabled
          </code>{" "}
          (-25200) or{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            kAXErrorNotImplemented
          </code>{" "}
          (-25208) depending on the macOS version, and{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            attribute_names()
          </code>{" "}
          returns an empty list. Your code looks like it works, then nothing happens, and you spend two hours wondering whether you traversed the tree wrong.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The fix is to call{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXIsProcessTrustedWithOptions
          </code>{" "}
          before any attribute read, with the{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXTrustedCheckOptionPrompt
          </code>{" "}
          option set to true so the system shows the user the prompt the first time. The accessibility crate does not export this function as of writing, so you link it directly through{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            #[link(name = &quot;ApplicationServices&quot;, kind = &quot;framework&quot;)]
          </code>
          . The Terminator adapter did this in{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            MacOSEngine::new
          </code>
          , at lines 119 to 148:
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{permissionSnippet}</code>
        </pre>

        <p className="text-zinc-700 leading-relaxed">
          The first time the user runs your binary, macOS pops a prompt asking for accessibility permission. They click OK, then they have to manually toggle your binary on in System Settings, Privacy &amp; Security, Accessibility. They then have to fully quit and relaunch your process, because the trust check is read once and cached for the life of the process.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Pattern 3: the focused-element walk
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          A thing the system-wide element is good for, that{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            application(pid)
          </code>{" "}
          can&apos;t do, is finding the element under the keyboard cursor right now without knowing which app it is in. You read{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXFocusedApplication
          </code>{" "}
          off the system-wide element to learn which app is foreground, then read{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXFocusedUIElement
          </code>{" "}
          off that app to learn which control inside it has focus.
        </p>

        <SequenceDiagram
          title="From system_wide() to the focused control"
          actors={focusedElementActors}
          messages={focusedElementMessages}
        />

        <p className="text-zinc-700 leading-relaxed">
          Two things to know. Both attribute reads return{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            CFType
          </code>
          , the Core Foundation top-level dynamic type, not{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElement
          </code>{" "}
          directly; you have to call{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            .downcast::&lt;AXUIElement&gt;()
          </code>{" "}
          and handle the{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            None
          </code>{" "}
          case where the attribute existed but did not contain an element. Either read can return{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            kAXErrorNoValue
          </code>{" "}
          if no app is foreground or the foreground app has no focusable control (think Finder with the desktop selected). That is a normal state, not an error.
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{focusedSnippet}</code>
        </pre>

        <p className="text-zinc-700 leading-relaxed">
          For everything other than the focused-element case, prefer{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElement::application(pid)
          </code>
          . Walking children of{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXFocusedApplication
          </code>{" "}
          is a slow path, only works for whichever app is foreground at the moment of the call, and is racy. The deleted adapter cached one wrapped element per app PID and refreshed by PID enumeration; it used the system-wide element only as a parent reference and as the entry point for focused-element queries.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          The error code you will see most often: -25204
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The single most common AX error code in real-world code is{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            kAXErrorNoValue
          </code>{" "}
          (-25204). It does not mean failure; it means the attribute exists for that role but is not currently set, or the element legitimately has no value for it. The system-wide element returns -25204 for almost everything you might call on it directly:{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            .role()
          </code>
          ,{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            .title()
          </code>
          ,{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            .position()
          </code>
          ,{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            .size()
          </code>
          . That is by design: the system-wide element exists to hold global attributes (
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXFocusedApplication
          </code>
          ), not to represent a window or control.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          Filter -25204 specifically before logging or reporting. Every other -252xx code is a real condition you want to surface:
        </p>
        <ul className="list-disc pl-6 mt-3 space-y-2 text-zinc-700">
          <li>
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">-25200 kAXErrorAPIDisabled</code>: accessibility off in System Settings.
          </li>
          <li>
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">-25201 kAXErrorInvalidUIElement</code>: the element was destroyed or its app died.
          </li>
          <li>
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">-25204 kAXErrorNoValue</code>: expected on the system-wide root and on legitimate empty attributes.
          </li>
          <li>
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">-25212 kAXErrorCannotComplete</code>: transient; retry once after a short delay.
          </li>
          <li>
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">-25214 kAXErrorAttributeUnsupported</code>: this role does not have this attribute; expected during generic walks.
          </li>
        </ul>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{errorFilterSnippet}</code>
        </pre>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Things the docs don&apos;t warn you about
        </h2>

        <AnimatedChecklist
          title="The shortlist of system_wide() gotchas"
          items={gotchas}
        />

        <p className="text-zinc-700 leading-relaxed">
          The first three are non-negotiable on any project that uses the accessibility crate seriously. The fourth one (sandbox) is what makes Mac App Store distribution effectively impossible for any tool built on this API; you ship Developer ID notarized binaries directly to users instead. The fifth one (create-rule) is hidden by the high-level crate, but if you drop down to{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            accessibility-sys
          </code>{" "}
          and call{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXUIElementCreateSystemWide
          </code>{" "}
          yourself, you must wrap the returned ref under create rule, not get rule. The sixth one (downcast) trips up first-time users of the Core Foundation type system; everything that comes back from an attribute read is a CFType and has to be downcast to the concrete kind you expect.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Why the deleted file is still the reference
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          On 2025-12-16, Terminator removed{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            crates/terminator/src/platforms/macos.rs
          </code>{" "}
          (4,368 lines) and{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            crates/terminator/src/platforms/linux.rs
          </code>{" "}
          (2,962 lines) in commit{" "}
          <a
            href="https://github.com/mediar-ai/terminator/commit/0c11011c"
            className="text-orange-600 underline"
          >
            0c11011c
          </a>
          . The framework is now Windows-only by{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            compile_error!
          </code>{" "}
          on non-Windows targets; the line lives in{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            crates/terminator/src/platforms/mod.rs
          </code>
          .
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          That doesn&apos;t make the deleted file useless to anyone working with the accessibility crate today. The patterns above (Send + Sync newtype, AXIsProcessTrustedWithOptions gate, focused-element walk, kAXErrorNoValue filter) are stable across macOS releases and don&apos;t depend on Terminator-specific types. Pull the file with{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            git show 0c11011c~1:crates/terminator/src/platforms/macos.rs
          </code>{" "}
          and read it as a reference: 130-some distinct{" "}
          <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AXAttribute
          </code>{" "}
          strings, the full click strategy ladder, key event composition, monitor enumeration, all using exactly the constructors covered here.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          On the active Terminator product side, our focus is the Windows UIA path; that is where the framework ships, where the MCP agent lives, and where the workflow recorder runs. If you are on macOS today and you need a working desktop automation surface that has shipped, you have two honest options: write the Rust against the accessibility crate yourself using the patterns above, or run the Windows MCP server in a VM and drive it from your Mac. We are happy to talk through either route if you want to compare notes; the booking link below is the fastest way to get on a call.
        </p>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Stuck on the macOS AX path in Rust?"
          description="A 20-minute call with the team that wrote (and then deleted) 4,368 lines of this code. Bring your stack trace."
        />

        <FaqSection
          heading="AXUIElement::system_wide() in Rust, FAQ"
          items={faqs}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Talk to the team that built and deleted a 4,368-line macOS AX adapter."
      />
    </article>
  );
}
