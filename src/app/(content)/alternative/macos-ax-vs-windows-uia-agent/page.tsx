import type { Metadata } from "next";
import {
  Breadcrumbs,
  ProofBanner,
  FaqSection,
  AnimatedChecklist,
  CodeComparison,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/macos-ax-vs-windows-uia-agent";
const PUBLISHED = "2026-05-04";
const TITLE =
  "macOS AX vs Windows UIA agent: what a single Rust trait can hide, and where it leaks";
const DESCRIPTION =
  "AXUIElement on macOS and IUIAutomationElement on Windows are different OS APIs with similar shapes. A Playwright-style trait can flatten most method signatures (find_element, click, get_focused_element), but four things leak through: role names, action invocation, focused-element semantics, and tree-read latency. Terminator's pub trait AccessibilityEngine at crates/terminator/src/platforms/mod.rs:86 is shaped cross-platform; the version on main only compiles for Windows, gated by a compile_error! at lines 319 to 320. Here is the honest comparison.";

const META_DESCRIPTION =
  "macOS AXUIElement vs Windows IUIAutomationElement for desktop agents: where a Playwright-shaped Rust trait holds and where role names, actions, permissions, and tree-read latency leak. Terminator's main branch ships Windows only.";

export const metadata: Metadata = {
  title: TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Two accessibility APIs, one trait that wants to abstract them, three places the abstraction leaks. The page is the inside of that trait.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "macOS AX vs Windows UIA agent: where a cross-platform trait leaks",
    description:
      "AXUIElement vs IUIAutomationElement at the trait level. Role names, action invocation, focused element. Terminator's main branch ships Windows only.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "macOS AX vs Windows UIA agent" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "macOS AX vs Windows UIA agent", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Are macOS AX and Windows UIA the same kind of API?",
    a: "Same job, different shapes. Both expose the live UI tree of running apps and let you act on elements without screenshots. Windows UI Automation is a COM-based API rooted at IUIAutomationElement, with strongly typed control patterns (InvokePattern, ValuePattern, TogglePattern, ExpandCollapsePattern) you query and call. macOS Accessibility uses an opaque AXUIElement reference and a string-keyed attribute model: AXUIElementCopyAttributeValue with kAXTitleAttribute, kAXValueAttribute, kAXRoleAttribute, and so on, plus AXUIElementPerformAction with kAXPressAction for clicks. UIA gives you a typed dispatch table; AX gives you a string-keyed bag of attributes and actions. The shapes converge once you wrap them in a higher-level trait, but the call sites underneath look nothing alike.",
  },
  {
    q: "Can a single Rust trait actually abstract both APIs?",
    a: "At the signature level, yes. Terminator's pub trait AccessibilityEngine at crates/terminator/src/platforms/mod.rs line 86 declares find_element, find_elements, get_focused_element, get_window_tree, click_at_coordinates, and a dozen more, all with platform-neutral types (UIElement, Selector, AutomationError). On Windows the implementation walks the IUIAutomation tree via the uiautomation Rust crate, on macOS it would walk the AX tree via accessibility-sys or a similar shim. The trait says nothing about COM or Mach. Below the trait, the implementations diverge: the Windows engine resolves IUIAutomationCondition trees and calls IUIAutomationInvokePattern.Invoke, the macOS engine would build kAXAttributedStringForRangeParameterizedAttribute queries and call AXUIElementPerformAction. The leaks are not in the trait shape; they are in what each method has to do underneath to return the same UIElement.",
  },
  {
    q: "Where does the abstraction actually leak?",
    a: "Three places, in increasing order of pain. First, role names. macOS prefixes most roles with AX (AXButton, AXTextField, AXWindow), Windows uses bare control type strings (Button, Edit, Window). Terminator's repo has the leak written into element.rs around line 1885: the macOS-only branch matches role == 'axwindow' || role == 'window', the Windows branch matches role == 'window'. Second, action invocation. UIA exposes a typed pattern: GetCurrentPattern(InvokePattern) then Invoke. AX uses a string action name: AXUIElementPerformAction(element, kAXPressAction). The trait method click() papers over both, but the fallback story when the action is not supported is different on each. Third, focused element. UIA's GetFocusedElement returns a process-scoped element instantly. AX requires you to walk from the system-wide AXUIElement (AXUIElementCreateSystemWide) and ask for kAXFocusedUIElementAttribute, with permission gates that can fail at runtime. Same trait method, same return type, very different failure modes.",
  },
  {
    q: "What does Terminator ship for macOS today?",
    a: "Nothing, on the main branch. The trait is shaped to be cross-platform, the locator grammar in selector.rs is platform-neutral, and several files (element.rs around line 1883, lib.rs around line 1567, health.rs around line 145) carry #[cfg(target_os = 'macos')] code paths. But crates/terminator/src/platforms/mod.rs at lines 319 and 320 ends the file with: #[cfg(not(target_os = 'windows'))] compile_error!('Terminator only supports Windows. Linux and macOS are not supported.'). On any non-Windows host the workspace will not build. The published binaries on npm (terminator-mcp-agent), pip (terminator-py), and crates.io (terminator-rs) are Windows binaries only. If you read llms.txt in the repo it states this directly: 'The Node.js, Python, and MCP packages currently ship Windows binaries only.' macOS support is a trait shape and some scaffolding, not a working engine.",
  },
  {
    q: "If I need to drive both macOS and Windows, what are the real options?",
    a: "Three honest paths. One: use a separate engine per OS. atomacos for macOS Python, FlaUI or pywinauto for Windows Python; or AXSwift for native macOS and the C# UIAutomationCore for Windows. You write two driver modules and merge them at a higher layer. Two: pick a screenshot-and-vision engine like Anthropic Computer Use or OpenAI Operator that does not depend on OS accessibility at all; you trade speed and determinism for portability. Three: use a Playwright-shaped trait library (Terminator on Windows is one) and assume one binary per OS, with the trait keeping your higher-level code identical. None of these gives you 'one binary, two platforms'. The trait can promise that signature; the underlying COM and Mach worlds will not let you ship a single dlopen-able shared library that talks to both.",
  },
  {
    q: "Why is one trait method enough for a click on both platforms?",
    a: "Because the trait method is doing the heavy lifting of picking the right action. Inside element.click(), the Windows implementation tries patterns in order: InvokePattern.Invoke for buttons, TogglePattern.Toggle for checkboxes, SelectionItemPattern.Select for radios, then falls back to a synthetic mouse event at the element's bounding box if no pattern matches. The macOS implementation would try AXUIElementPerformAction with kAXPressAction first, then kAXShowMenuAction or kAXIncrementAction depending on the role, then fall back to a CGEventCreateMouseEvent at the element's AXFrame. The trait promise is 'click does the right thing for this element'. The implementation per platform owns the dispatch table for what 'right' means. The reason this works is that both APIs expose enough role information to pick a sensible default action; the leak is only that the default actions are named differently and have different fallbacks.",
  },
  {
    q: "Is macOS AX faster than Windows UIA for an agent?",
    a: "Wrong axis for most of the question: both are roughly two orders of magnitude faster than a screenshot-plus-vision loop, because you read a structured tree instead of paying for a capture and an inference. A focused-window BFS walk of the AX tree in an app like Mail, Slack, or Chrome typically lands in the tens of milliseconds (commonly cited at 30 to 80 ms), and Windows UIA is in the same ballpark for a cached subtree fetch. The real difference is the cost model per query, not raw throughput. UIA's IUIAutomationElement.FindFirst runs the match in-process against a compiled IUIAutomationCondition and hands back one element, so a targeted lookup never marshals the whole subtree across the process boundary. AX has no FindFirst: you walk children yourself and ask each node for its attributes, which means more cross-process Mach round-trips unless you batch reads. So for a single targeted click UIA tends to do less work, while for a full-window snapshot the two are comparable once you cache property reads. The trait method get_window_tree returns the same UINode either way; the latency it hides is structural, not cosmetic.",
  },
  {
    q: "Does macOS AX have anything like UIA's AutomationId?",
    a: "Not exactly, and this is one of the largest practical differences. UIA defines an AutomationId attribute that an app developer can set and that survives localization, theme changes, and most refactors. WinAppSDK apps (Calculator, Notepad, Settings) populate it for nearly every interactive element, and a selector like id:NumberPadFiveButton works on every Windows machine in any language. macOS AX has no native equivalent. The closest thing is kAXIdentifierAttribute which AppKit sets sporadically, mostly for SwiftUI-built controls that opted in. In practice, agents on macOS rely heavily on (role, title, parent) tuples and positional walks (the third button in the toolbar of the focused window), which are inherently more localization-sensitive than UIA AutomationId-based selectors. A trait abstraction can hide this with a single Selector grammar, but the macOS resolver will silently fall back to title and position more often, which is something you observe in production but cannot fix in the trait.",
  },
  {
    q: "What about permissions? UIA does not ask, AX does.",
    a: "Right, and this is a runtime leak the trait cannot fully hide. On Windows, UIA calls just work; the COM API is not gated. On macOS, AXUIElementCopyAttributeValue against another process returns kAXErrorAPIDisabled or kAXErrorNotImplemented unless your binary has been added to System Settings > Privacy & Security > Accessibility, and the user has toggled it on. The first call from a fresh install will silently fail and the agent has no signal to recover. Production macOS agents prompt with AXIsProcessTrustedWithOptions during init, surface a permission setup screen, and re-check on every cold start. None of this maps to anything UIA-side. The trait method get_root_element() succeeds on Windows from any process; on macOS it fails until the user clicks a checkbox in System Settings. The trait can return the same Result type, but the failure modes need different runbooks.",
  },
  {
    q: "Is the screenshot fallback useful for either platform?",
    a: "Yes for both, for different reasons. On macOS, AX silently no-ops on AXPress for many web views in Chrome and Safari, and Electron apps inconsistently expose role and title. The honest production path on macOS uses AX where it works and falls back to OCR or vision (OmniParser, Gemini) on Electron and web-rendered surfaces. On Windows, UIA covers WinUI, WPF, WinForms, MFC, and most major IDEs natively, but games, custom-painted line-of-business apps, and anything rendered via DirectX or canvas show up as one opaque element. The fallback is the same: OCR or vision for grounding, then synthetic input for the click. Terminator's MCP server exposes this as vision_type with five values (UiTree, Ocr, Omniparser, Gemini, Dom), defaulting to UiTree. The same router would apply on macOS, with AX as the default and screenshot+vision as the labelled fallback for AX-empty surfaces.",
  },
  {
    q: "What should I actually pick today?",
    a: "Match the platform your users are on, and assume one engine per OS. If your agent runs on Windows desktops, a UIA-backed engine like Terminator (terminator-rs on crates.io, terminator-mcp-agent on npm) or a UIA wrapper like FlaUI is the production path; UIA is mature, AutomationId-based selectors are stable, and synthetic input is the fallback for AX-empty surfaces. If your agent runs on macOS desktops, atomacos or a pyobjc shim around AXUIElement is the production path today, paired with a vision fallback for Electron and Chromium. If you need both, write a thin layer that picks the engine per OS and exposes a Playwright-shaped Locator API to your agent code; do not expect any single library to ship one binary that works on both. The Playwright-shape is the right abstraction, but each leg of it is a separate ship.",
  },
];

const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const articleSchemaJson = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const portableTraitChecklist = [
  {
    text: "find_element(selector, root, timeout) returns a UIElement on either OS; the resolver underneath is COM on Windows, Mach on macOS.",
  },
  {
    text: "get_focused_element() returns the focused UIElement; UIA gives it instantly, AX requires AXUIElementCreateSystemWide and a permission gate.",
  },
  {
    text: "click_at_coordinates(x, y) is identical syscall-wise on both: SendInput on Windows, CGEventCreateMouseEvent on macOS, with platform-specific DPI math.",
  },
  {
    text: "get_window_tree(pid, title, config) returns a UINode of the same shape; the per-element walk uses IUIAutomationTreeWalker on Windows, AXUIElementCopyAttributeValue with kAXChildrenAttribute on macOS.",
  },
  {
    text: "open_application(name), activate_application(name), open_url(url) all wrap OS-specific shell calls (ShellExecute on Windows, open(1) and NSWorkspace on macOS) but expose the same trait method.",
  },
  {
    text: "Selector grammar (role:Button && name:Save, process:notepad, window:Calculator) compiles down to IUIAutomationCondition trees on Windows and AX attribute predicates on macOS.",
  },
];

const winEngineCode = `// Inside the Windows implementation of AccessibilityEngine.
// crates/terminator/src/platforms/windows/engine.rs (paraphrased)

impl AccessibilityEngine for WindowsEngine {
    fn find_element(
        &self,
        selector: &Selector,
        root: Option<&UIElement>,
        timeout: Option<Duration>,
    ) -> Result<UIElement, AutomationError> {
        // 1. Build IUIAutomationCondition tree from the Selector
        let condition: IUIAutomationCondition =
            self.compile_selector(selector)?;

        // 2. FindFirst on the IUIAutomationElement scope
        let raw: IUIAutomationElement = match root {
            Some(r) => r.as_uia()?.FindFirst(TreeScope_Subtree, &condition)?,
            None    => self.uia.GetRootElement()?
                            .FindFirst(TreeScope_Subtree, &condition)?,
        };

        // 3. Wrap in a platform-neutral UIElement
        Ok(UIElement::from_uia(raw))
    }
}

// click() then asks for the typed pattern:
//   GetCurrentPattern(UIA_InvokePatternId)
//   .cast::<IUIAutomationInvokePattern>()?.Invoke()
// Falls back to SendInput at element.BoundingRectangle on miss.`;

const macEngineCode = `// What the macOS implementation would look like.
// crates/terminator/src/platforms/macos/engine.rs (does not ship today)

impl AccessibilityEngine for MacOSEngine {
    fn find_element(
        &self,
        selector: &Selector,
        root: Option<&UIElement>,
        timeout: Option<Duration>,
    ) -> Result<UIElement, AutomationError> {
        // 1. Walk AX tree manually; AX has no FindFirst
        let start: AXUIElementRef = match root {
            Some(r) => r.as_ax()?,
            None    => unsafe {
                AXUIElementCreateSystemWide()  // <-- requires accessibility permission
            },
        };

        // 2. DFS the children, matching role+title against the Selector
        //    role names are AX-prefixed: AXButton vs Button on Windows
        let raw: AXUIElementRef =
            self.dfs_match(start, selector, timeout)?;

        Ok(UIElement::from_ax(raw))
    }
}

// click() then dispatches:
//   AXUIElementPerformAction(elem, kAXPressAction)
// Falls back to CGEventCreateMouseEvent at AXFrame on miss.

// And the file does not compile on main: see platforms/mod.rs:319-320
//   compile_error!("Terminator only supports Windows.
//                   Linux and macOS are not supported.");`;

const pickerSteps: StepperStep[] = [
  {
    title: "Windows users only",
    description:
      "Use a UIA-backed engine. terminator-rs, FlaUI, or pywinauto. AutomationId selectors are stable across language and theme.",
  },
  {
    title: "macOS users only",
    description:
      "Use an AX-backed engine. atomacos or AXSwift. Plan for the Accessibility permission prompt on first run.",
  },
  {
    title: "Both, with one codebase",
    description:
      "Write a Playwright-shaped Locator layer over two engines. Ship one binary per OS. The trait shape is portable; the underlying library is not.",
  },
  {
    title: "Both, no per-OS engine",
    description:
      "Use a screenshot-and-vision agent like Anthropic Computer Use or OpenAI Operator. Trade speed and determinism for portability.",
  },
];

const relatedPosts = [
  {
    title:
      "MCP servers vs accessibility APIs: they are different layers, not alternatives",
    excerpt:
      "Why MCP is the protocol and AX/UIA are the OS hooks. Terminator's split into terminator-rs and terminator-mcp-agent makes the seam literal.",
    href: "/alternative/mcp-servers-vs-accessibility-apis",
    tag: "Architecture",
  },
  {
    title:
      "Accessibility tree vs screenshot desktop automation: it is a router, not a binary choice",
    excerpt:
      "VisionType has five variants (UiTree, Ocr, Omniparser, Gemini, Dom). UiTree is the default. Screenshot+vision is the labelled fallback for AX-empty surfaces.",
    href: "/alternative/compare/accessibility-tree-vs-screenshot-automation",
    tag: "Patterns",
  },
  {
    title:
      "macOS accessibility UI tree automation: what the AX tree exposes and where it stops",
    excerpt:
      "A walkthrough of the AXUIElement attribute model: kAXChildrenAttribute, kAXFocusedUIElementAttribute, AXIsProcessTrustedWithOptions, and the gaps in Electron and Chromium.",
    href: "/t/macos-accessibility-ui-tree",
    tag: "macOS",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchemaJson),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            macOS AX vs Windows UIA agent:{" "}
            <span className="text-orange-600">
              what one trait can hide, and where it leaks
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            Two OS accessibility APIs that expose the live UI tree and let
            you act on it.{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElement
            </code>{" "}
            on macOS,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              IUIAutomationElement
            </code>{" "}
            on Windows. A Playwright-shaped Rust trait can flatten most of
            the surface, but four things leak through: role names, action
            invocation, focused-element semantics, and tree-read latency.
            Terminator&apos;s
            repo declares the trait at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator/src/platforms/mod.rs:86
            </code>{" "}
            and gates the build to Windows at lines 319 to 320. This page is
            the inside of that trait.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              AXUIElement
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              IUIAutomation
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              kAXPressAction
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              InvokePattern
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              v0.24.32
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-04)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">
                AX and UIA are different OS APIs with similar shapes.
              </strong>{" "}
              UIA on Windows is COM-based and exposes typed control
              patterns. AX on macOS is Mach-based and uses a string-keyed
              attribute and action model. A single Rust trait
              (Terminator&apos;s{" "}
              <code className="font-mono text-[0.95em] text-orange-700">
                pub trait AccessibilityEngine
              </code>{" "}
              at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/mod.rs"
                className="text-orange-700 underline underline-offset-2"
              >
                crates/terminator/src/platforms/mod.rs:86
              </a>
              ) can hide most of the surface, but role names, action
              invocation, focused-element semantics, and tree-read latency
              leak through. On
              Terminator&apos;s main branch only the Windows half compiles;
              lines 319 to 320 of the same file emit{" "}
              <code className="font-mono text-[0.95em] text-orange-700">
                compile_error!(&quot;Terminator only supports Windows...&quot;)
              </code>
              .
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Pick the platform your users are on, ship one engine per OS,
              and treat the cross-platform trait as a developer-experience
              bet, not a runtime portability promise. Authoritative
              sources:{" "}
              <a
                href="https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32"
                className="text-orange-700 underline underline-offset-2"
              >
                Microsoft UI Automation
              </a>{" "}
              and{" "}
              <a
                href="https://developer.apple.com/documentation/applicationservices/1462085-axuielementcopyattributevalue"
                className="text-orange-700 underline underline-offset-2"
              >
                Apple AXUIElementCopyAttributeValue
              </a>
              .
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The trait that pretends both are the same
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s core crate declares one async trait and asks
            every platform to implement it. Read the method list and try to
            spot the OS. You cannot. The signatures are platform-neutral:
            they take a{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              Selector
            </code>
            , an optional{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              UIElement
            </code>{" "}
            root, an optional{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              Duration
            </code>{" "}
            timeout, and return a{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              Result&lt;UIElement, AutomationError&gt;
            </code>
            . Nothing in the trait says COM, nothing says Mach, nothing
            says AXPress or InvokePattern. That is the point of the
            abstraction; that is also where the trouble starts.
          </p>
          <AnimatedChecklist
            title="What the trait promises to hide"
            items={portableTraitChecklist}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The trait holds at the signature level. The leaks live in what
            each method has to actually do underneath to return the same{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              UIElement
            </code>
            .
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Three places the abstraction leaks
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most cross-platform desktop libraries advertise feature parity
            and mean it at the method-name level. The leaks below are not
            bugs in those libraries; they are properties of the underlying
            APIs that no abstraction can fully hide. Plan for them at the
            agent layer.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    What leaks
                  </th>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    Windows UIA
                  </th>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    macOS AX
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-700">
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Role names
                  </td>
                  <td className="px-5 py-4">
                    Bare control-type strings:{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      Button
                    </code>
                    ,{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      Edit
                    </code>
                    ,{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      Window
                    </code>
                    .
                  </td>
                  <td className="px-5 py-4">
                    AX-prefixed:{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXButton
                    </code>
                    ,{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXTextField
                    </code>
                    ,{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXWindow
                    </code>
                    . The leak is encoded in element.rs around line 1885 (
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      role == &quot;axwindow&quot; || role ==
                      &quot;window&quot;
                    </code>
                    ).
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Action invocation
                  </td>
                  <td className="px-5 py-4">
                    Typed pattern:{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      GetCurrentPattern(InvokePatternId)
                    </code>{" "}
                    then{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      Invoke()
                    </code>
                    .
                  </td>
                  <td className="px-5 py-4">
                    String action name:{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXUIElementPerformAction(elem, kAXPressAction)
                    </code>
                    .
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Focused element
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      GetFocusedElement()
                    </code>{" "}
                    on the IUIAutomation root. Synchronous, no permission
                    gate.
                  </td>
                  <td className="px-5 py-4">
                    Walk from{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXUIElementCreateSystemWide()
                    </code>
                    , then{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      kAXFocusedUIElementAttribute
                    </code>
                    . Returns{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      kAXErrorAPIDisabled
                    </code>{" "}
                    until the user grants permission.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Stable ID for selectors
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AutomationId
                    </code>{" "}
                    set by app developers; survives localization and theme.
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      kAXIdentifierAttribute
                    </code>
                    , populated sporadically by SwiftUI; agents fall back
                    to{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      (role, title, position)
                    </code>{" "}
                    tuples.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Synthetic input fallback
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      SendInput
                    </code>{" "}
                    Win32 API; DPI-aware once you call{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      SetProcessDpiAwarenessContext
                    </code>
                    .
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      CGEventCreateMouseEvent
                    </code>{" "}
                    in Quartz; uses logical points, no DPI math needed.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Browser AX coverage
                  </td>
                  <td className="px-5 py-4">
                    Chrome and Edge expose a usable UIA tree for most DOM;
                    AutomationId maps to ARIA where set.
                  </td>
                  <td className="px-5 py-4">
                    Chrome and Safari often no-op{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      AXPress
                    </code>{" "}
                    on web views; production agents carry a hardcoded
                    bypass list and route to vision.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Tree read / query model
                  </td>
                  <td className="px-5 py-4">
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      FindFirst
                    </code>{" "}
                    matches in-process against a compiled condition; a
                    targeted lookup returns one element without marshaling the
                    subtree.
                  </td>
                  <td className="px-5 py-4">
                    No{" "}
                    <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                      FindFirst
                    </code>
                    ; you DFS the tree and read attributes per node, so
                    targeted lookups cost more cross-process round-trips unless
                    you batch.
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Permission surface
                  </td>
                  <td className="px-5 py-4">
                    None. UIA calls just work from any process.
                  </td>
                  <td className="px-5 py-4">
                    System Settings &gt; Privacy &amp; Security &gt;
                    Accessibility. First-call failures until the user
                    toggles on.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-zinc-700 leading-relaxed">
            The row that defines the engineering effort is{" "}
            <em>focused element</em>. UIA gives it back synchronously from
            any process; AX requires a system-wide handle, an attribute
            query, and a runtime permission check. The trait method{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              get_focused_element() -&gt; Result&lt;UIElement,
              AutomationError&gt;
            </code>{" "}
            looks identical, the recovery story is not.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The fourth leak: tree-read latency
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The first question most people ask is &ldquo;which is
            faster.&rdquo; For the comparison that matters, AX vs UIA, it is
            close to a wash; the gap that actually moves your agent is{" "}
            <em>structured tree vs screenshot</em>. Reading a live
            accessibility tree is roughly two orders of magnitude faster than
            a capture-plus-vision loop, because you never pay for a frame
            grab or an inference. A focused-window BFS walk of the AX tree in
            an app like Mail, Slack, or Chrome typically lands in the tens of
            milliseconds (commonly cited at 30 to 80 ms), and a cached UIA
            subtree fetch on Windows is in the same range.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Where AX and UIA do diverge is the cost model of a single
            targeted query. UIA&apos;s{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              IUIAutomationElement.FindFirst
            </code>{" "}
            runs the match in-process against a compiled{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              IUIAutomationCondition
            </code>{" "}
            and returns one element, so a targeted lookup never marshals the
            whole subtree across the process boundary. AX has no FindFirst:
            you walk children yourself and ask each node for its attributes
            with{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              AXUIElementCopyAttributeValue
            </code>
            , which is more cross-process Mach round-trips unless you batch
            reads. So for one targeted click UIA tends to do less work; for a
            full-window snapshot the two are comparable once you cache
            property reads.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the leak the trait signature hides most completely.{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              get_window_tree(pid, title, config)
            </code>{" "}
            returns the same{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              UINode
            </code>{" "}
            shape on either OS, but the Windows walk leans on{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              IUIAutomationTreeWalker
            </code>{" "}
            with a cache request to batch property reads, while the macOS walk
            issues per-attribute calls unless it is carefully batched. Same
            method, same return type, a latency budget you only feel in
            production.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What the engine implementation looks like on each side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Same trait method,{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              find_element
            </code>
            , two implementations. The Windows side runs today; the macOS
            side is a sketch of what would have to exist below the trait
            for the abstraction to hold. Toggle to compare.
          </p>
          <CodeComparison
            title="find_element on Windows UIA vs macOS AX"
            leftLabel="windows/engine.rs (ships today)"
            rightLabel="macos/engine.rs (does not compile on main)"
            leftCode={winEngineCode}
            rightCode={macEngineCode}
            leftLines={winEngineCode.split("\n").length}
            rightLines={macEngineCode.split("\n").length}
            reductionSuffix="lines per resolver"
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The Windows side leans on{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              IUIAutomationElement.FindFirst
            </code>{" "}
            with a compiled{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              IUIAutomationCondition
            </code>{" "}
            tree, so the OS does the matching in-process and returns one
            element. AX has no equivalent: there is no FindFirst on AX, you
            walk the tree yourself, ask every node for its attributes, and
            short-circuit when the role and title match. That walk is a
            real implementation cost the trait does not expose.
          </p>
        </section>

        <ProofBanner
          quote="Terminator only supports Windows. Linux and macOS are not supported."
          source="crates/terminator/src/platforms/mod.rs lines 319 to 320"
          metric="1 of 3 platforms"
        />

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What ships today, in plain terms
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Terminator workspace at version 0.24.32 carries scaffolding
            for macOS in several files (
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              element.rs:1883
            </code>{" "}
            for{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              process_name
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              lib.rs:1567
            </code>{" "}
            for the role-name match,{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              health.rs:145
            </code>{" "}
            for a stub macOS health checker that returns &ldquo;Accessibility
            API health checks not yet implemented&rdquo;), but the workspace
            does not build on a non-Windows host. The published artefacts
            on{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              crates.io
            </code>{" "}
            (
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              terminator-rs
            </code>
            ),{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              npm
            </code>{" "}
            (
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              terminator-mcp-agent
            </code>
            ), and{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              pip
            </code>{" "}
            (
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              terminator-py
            </code>
            ) are Windows binaries.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The repo&apos;s own{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1 py-0.5 rounded">
              llms.txt
            </code>{" "}
            says the same thing in one line: &ldquo;The Node.js, Python, and
            MCP packages currently ship Windows binaries only.&rdquo; The
            trait shape is the cross-platform bet; the trait
            implementations are not there yet on macOS. If you need a
            Windows agent today, this is the production path. If you need a
            macOS agent today, this codebase is a useful reference for the
            trait shape and the selector grammar, but you will be wiring
            the AX engine yourself.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            How to pick today
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The decision is rarely AX vs UIA in the abstract. It is which
            users you are shipping to and what surfaces you have to reach.
            Four common cases below.
          </p>
          <HorizontalStepper
            title="Pick by where the agent runs"
            steps={pickerSteps}
          />
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building a desktop agent and weighing AX vs UIA?"
          description="We can walk through the trait shape, the leak points, and what you would have to ship per OS. Engineering call, not a sales call."
        />

        <FaqSection items={faqs} heading="Frequently asked" />

        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Companion deep-dives on the same stack."
          posts={relatedPosts}
        />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Walk through AX vs UIA for your agent."
        />
      </article>
    </>
  );
}
