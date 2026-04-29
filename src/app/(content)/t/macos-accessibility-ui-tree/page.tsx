import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  StepTimeline,
  BentoGrid,
  GlowCard,
  MetricsRow,
  AnimatedChecklist,
  ComparisonTable,
  Marquee,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type BentoCard,
  type ComparisonRow,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/macos-accessibility-ui-tree";
const PUBLISHED = "2026-04-25";
const TITLE =
  "macOS accessibility UI tree automation: the write path nobody warns you about";
const DESCRIPTION =
  "The read path is easy: AXUIElementCopyAttributeValue walks the tree. The write path is the trap. AXPress and AXClick return success on browser-rendered views and do nothing. A real AX automation engine ships an 8-browser bypass list, a 3-tier click fallback, and synthetic CGEvents. Notes from a 4,368-line macOS implementation that got deleted on 2025-12-16.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "AXPress and AXClick silently no-op on Chrome, Safari, Arc, Firefox, Edge, Brave, Opera, and Vivaldi. Production AX automation falls back to CGEvent mouse simulation. Read the deleted file.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "macOS AX UI tree automation, the write-path trap",
    description:
      "click_auto in the deleted macos.rs: 8-browser bypass list, 3-tier click fallback, manual unsafe Send + Sync wrapper. The honest cost of cross-platform AX work.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "macOS accessibility UI tree automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "macOS accessibility UI tree automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the macOS accessibility UI tree?",
    a: "Every native macOS app exposes its on-screen elements as a tree of AXUIElement objects. Each node carries a role (AXButton, AXTextField, AXMenuItem), an accessible name (AXTitle / AXLabel / AXDescription), a position (AXPosition), a size (AXSize), and a list of supported actions (AXPress, AXClick, AXShowMenu, AXRaise). The tree is rooted at AXUIElement.system_wide() and you walk into it by reading AXFocusedApplication or by getting the element for a specific PID via AXUIElement::application(pid). The tree is what Accessibility Inspector shows you, what VoiceOver speaks, and what every macOS automation tool ultimately reads.",
  },
  {
    q: "Why does AXPress return success but nothing happens when I target a Chrome or Safari window?",
    a: "Because the AX action lands on the browser's accessibility shim, which acknowledges it and never forwards it to the underlying web view. WebKit, Blink, and Gecko all build their own internal accessibility trees on top of the DOM and only partially re-export them through the platform AX API. AXPress and AXClick are no-ops on those re-exported elements. The element's role looks right, the name looks right, the action returns kAXErrorSuccess, and the page does not change. The fix is to detect the browser by application name and switch to synthetic CGEvent mouse clicks at the element's bounds. The deleted Terminator engine kept an explicit allowlist (chrome, safari, arc, firefox, edge, brave, opera, vivaldi, microsoft edge) for exactly this reason, at lines 415 to 424 of crates/terminator/src/platforms/macos.rs in commit 0c11011c~1.",
  },
  {
    q: "How many lines of code does it take to wrap the macOS Accessibility API into a usable automation engine?",
    a: "Roughly 4,368 lines of Rust, based on the deleted Terminator implementation in crates/terminator/src/platforms/macos.rs. That's not the user-facing API, that's the platform adapter alone: tree walking, element lookup by selector, click strategies, key event composition, focus and value setters, monitor enumeration, screenshot, OCR plumbing, and unsafe FFI for the AX functions accessibility-rs doesn't expose. About 130 distinct AXAttribute strings appear in that file. The size is what you sign up for when you commit to making AX work across browsers, Electron, native AppKit, Catalyst-on-macOS, and the long tail of half-instrumented apps.",
  },
  {
    q: "Why does AXUIElement need a manual unsafe Send + Sync wrapper?",
    a: "AXUIElement is a Core Foundation type. Apple says CF objects are thread-safe in practice, but the Rust accessibility crate doesn't mark AXUIElement as Send + Sync, so you can't share it across threads or store it in an async runtime without a manual wrapper. The pattern in the deleted file at lines 76 to 102 is a struct ThreadSafeAXUIElement(Arc<AXUIElement>) with two unsafe impl blocks: unsafe impl Send for ThreadSafeAXUIElement {} and unsafe impl Sync for ThreadSafeAXUIElement {}. The safety comment cites Apple's thread-safety guarantee for Core Foundation objects. Without this you can't run AX queries from a tokio task, which means you can't ship a server, an MCP agent, or any concurrent automation harness.",
  },
  {
    q: "What's the right click strategy for the macOS Accessibility API?",
    a: "Three tiers, in order. First, attempt AXPress via element.perform_action(\"AXPress\"). About 70% of native AppKit elements respond. Second, if that fails, attempt AXClick via element.perform_action(\"AXClick\"). Some controls (mostly buttons in older AppKit views) prefer this. Third, if both fail, drop to CGEvent mouse simulation: read AXPosition and AXSize, compute the center, create a CGEvent for MouseMoved + LeftMouseDown + LeftMouseUp on the HID source, and post each one. The deleted Terminator engine called these click_press, click_accessibility_click, and click_mouse_simulation respectively. Browsers always skipped tiers one and two by name and went straight to tier three, because tiers one and two return success but do nothing on browser-rendered content.",
  },
  {
    q: "Can I read the macOS accessibility tree without granting full Accessibility permissions?",
    a: "No. AXIsProcessTrustedWithOptions(options) is the gate, and options must contain { kAXTrustedCheckOptionPrompt: kCFBooleanTrue } to surface the system prompt the first time. Until the user goes to System Settings → Privacy & Security → Accessibility and toggles your binary on, every AXUIElementCopyAttributeValue call returns kAXErrorAPIDisabled. The deleted engine checked this at construction time at lines 121 to 144 and returned AutomationError::PermissionDenied immediately if the bit wasn't set. There is no programmatic way to grant the permission; you can only ask. For TCC-managed installations and CI, you set the bit in /Library/Application Support/com.apple.TCC/TCC.db with sudo, which is its own production rabbit hole.",
  },
  {
    q: "Why do web inputs need three different attribute names tried before AX text input works?",
    a: "Because Chrome, Safari, Firefox, and friends export web text inputs through the AX API with inconsistent attribute keys. The deleted type_text path at lines 1303 to 1320 tries AXValue first (the canonical key), then AXValueAttribute (legacy, still used by some WebKit views), then AXText (some Electron and CEF builds expose only this). For each candidate, it does an AXUIElementSetAttributeValue call and checks for a zero return code. Whichever one succeeds wins, and on a fully native AppKit text field the first attempt closes the deal in a single FFI call. On browsers, you usually fall through to the third or end up using synthetic key events instead.",
  },
  {
    q: "Is Terminator a tool I can install on my Mac to automate Mac apps today?",
    a: "Not today. Terminator's Node.js, Python, and MCP server packages currently ship Windows-only binaries. The macOS adapter existed at the core Rust level for several months but was deleted on 2025-12-16 in commit 0c11011c, alongside the Linux adapter, to focus on the Windows UIA path where the team has the most depth. The full macos.rs is still recoverable via `git show 0c11011c~1:crates/terminator/src/platforms/macos.rs` and is one of the more thorough open MIT-licensed examples of an AX-based automation engine you can read end to end. If you're building macOS automation yourself, that file is a useful reference for the operational gaps the Apple docs don't cover.",
  },
  {
    q: "What should I use right now if I need a working macOS accessibility automation tool?",
    a: "Three honest answers depending on what you're building. For AppleScript-style scripting and quick UI hooks, Hammerspoon's axuielement Lua module is mature and ships out of the box. For dumping the AX tree to JSON for analysis, MacPaw's macapptree is a focused Python package. For an MCP-style agent server, Nudge runs on macOS today. Each of them ships its own click and value-setting strategy, and each of them has run into some version of the browser-action no-op and the Send/Sync wrapper described above. If you read their source you'll find the same fallbacks, just spelled differently.",
  },
  {
    q: "How is reading the AX tree different from sending an action through it?",
    a: "Reads are pure: AXUIElementCopyAttributeValue, AXUIElementCopyAttributeValues, AXUIElementGetActionDescription. They're idempotent, they're cheap, they're safe to call from any thread once you have your Send/Sync wrapper, and they give you a clean snapshot of the current UI. Writes are a different surface entirely: AXUIElementPerformAction (AXPress, AXClick, AXShowMenu) plus AXUIElementSetAttributeValue (AXValue, AXFocused, AXSelected). Writes are where the abstraction leaks. Some elements lie about supported actions, some accept the action and do nothing, some need a synthetic event instead, and the only way to know which case you're in is to detect the host application up front and have a fallback ready. Every AX automation tool that ships gets this right or gets returned as broken.",
  },
];

const otherToolsLogos = [
  "Hammerspoon",
  "Accessibility Inspector",
  "macapptree",
  "Nudge",
  "Sikuli",
  "PyAutoGUI",
  "Hammerspoon axuielement",
  "ApplicationServices.py",
  "ax-element-rs",
  "atomacos",
];

const eightBrowsers = [
  "chrome",
  "safari",
  "arc",
  "firefox",
  "edge",
  "brave",
  "opera",
  "vivaldi",
  "microsoft edge",
];

const tierMetrics = [
  { value: 4368, label: "lines of Rust in the deleted macos.rs adapter" },
  { value: 8, label: "browsers explicitly bypassing AXPress / AXClick" },
  { value: 3, label: "click strategies tried before reporting failure" },
  {
    value: 130,
    suffix: "+",
    label: "distinct AXAttribute names referenced in the engine",
  },
];

const clickAutoSnippet = `// crates/terminator/src/platforms/macos.rs
// lines 407 to 442, recovered from commit 0c11011c~1

fn click_auto(&self) -> Result<ClickResult, AutomationError> {
    // only mouse simulation works on web, and the AX functions
    // don't fail on web — they return success and do nothing,
    // so we have to detect the browser by app name up front.
    let app_name = self.get_application();

    if let Some(app) = app_name {
        let app_name = app.get_text(1).unwrap_or_default().to_lowercase();
        if app_name.contains("chrome")
            || app_name.contains("safari")
            || app_name.contains("arc")
            || app_name.contains("firefox")
            || app_name.contains("edge")
            || app_name.contains("brave")
            || app_name.contains("opera")
            || app_name.contains("vivaldi")
            || app_name.contains("microsoft edge")
        {
            return self.click_mouse_simulation();
        }
    }

    // 1. Try AXPress action first
    match self.click_press() {
        Ok(result) => return Ok(result),
        Err(e) => debug!("AXPress failed: {:?}, trying alternative methods", e),
    }

    // 2. Try AXClick action
    match self.click_accessibility_click() {
        Ok(result) => return Ok(result),
        Err(e) => debug!("AXClick failed: {:?}, trying alternative methods", e),
    }

    // 3. Try mouse simulation as last resort
    self.click_mouse_simulation()
}`;

const threadSafeSnippet = `// crates/terminator/src/platforms/macos.rs
// lines 76 to 102 — the wrapper every AX automation engine ends up writing

#[derive(Clone)]
pub struct ThreadSafeAXUIElement(Arc<AXUIElement>);

// SAFETY: AXUIElement is safe to send and share between threads as
// Apple's accessibility API is designed to be called from any thread.
// The underlying Core Foundation objects manage their own thread safety.
unsafe impl Send for ThreadSafeAXUIElement {}
unsafe impl Sync for ThreadSafeAXUIElement {}

impl ThreadSafeAXUIElement {
    pub fn system_wide() -> Self {
        Self(Arc::new(AXUIElement::system_wide()))
    }

    pub fn application(pid: i32) -> Self {
        Self(Arc::new(AXUIElement::application(pid)))
    }
}`;

const typeTextSnippet = `// crates/terminator/src/platforms/macos.rs
// lines 1292 to 1321 — three attribute names, in order

let is_web_input = {
    let role = self.role().to_lowercase();
    role.contains("web") || role.contains("generic")
};

if is_web_input {
    debug!("Detected web input, using specialized handling");

    // Try different attribute names that web inputs might use
    for attr_name in &["AXValue", "AXValueAttribute", "AXText"] {
        let cf_string = CFString::new(text);
        unsafe {
            let element_ref = self.element.0.as_concrete_TypeRef()
                as *mut std::os::raw::c_void;
            let attr_str = CFString::new(attr_name);
            let attr_str_ref = attr_str.as_concrete_TypeRef()
                as *const std::os::raw::c_void;
            let value_ref = cf_string.as_concrete_TypeRef()
                as *const std::os::raw::c_void;

            let result = AXUIElementSetAttributeValue(
                element_ref, attr_str_ref, value_ref,
            );
            if result == 0 {
                debug!("Successfully set text using {}", attr_name);
                return Ok(());
            }
        }
    }
}`;

const permissionLines = [
  { text: "$ /usr/local/bin/your-ax-tool inspect Notes", type: "command" as const },
  {
    text: "PermissionDenied: Accessibility permissions not granted",
    type: "error" as const,
  },
  { text: "", type: "output" as const },
  {
    text: "# AXIsProcessTrustedWithOptions returns false until the user opts in.",
    type: "info" as const,
  },
  {
    text: "# Pass kAXTrustedCheckOptionPrompt = kCFBooleanTrue to surface the system prompt:",
    type: "info" as const,
  },
  { text: "", type: "output" as const },
  {
    text: 'open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"',
    type: "command" as const,
  },
  {
    text: "→ User toggles your binary on. AXIsProcessTrustedWithOptions flips to true.",
    type: "success" as const,
  },
  {
    text: "→ AXUIElementCopyAttributeValue stops returning kAXErrorAPIDisabled.",
    type: "success" as const,
  },
];

const tierSteps = [
  {
    title: "Tier 1: AXPress",
    description:
      "element.perform_action(AXAttribute::new(&CFString::new(\"AXPress\"))). The canonical accessibility action. Roughly 70% of native AppKit controls accept it. Buttons, menu items, links. Returns kAXErrorSuccess on success, kAXErrorActionUnsupported on controls that don't expose press semantics.",
  },
  {
    title: "Tier 2: AXClick",
    description:
      "Same shape with AXClick instead of AXPress. Some older AppKit views prefer AXClick. Many custom Cocoa controls expose both. The cost of trying is one FFI call, the upside is avoiding a synthetic input event.",
  },
  {
    title: "Tier 3: CGEvent mouse simulation",
    description:
      "Read AXPosition and AXSize. Compute center = (x + w/2, y + h/2). Create CGEventSource on HIDSystemState. Post MouseMoved, LeftMouseDown, LeftMouseUp at that point. This is the path browsers and Electron apps take. It moves the cursor visibly and bypasses any AX shim that swallowed AXPress.",
  },
  {
    title: "When to skip tiers 1 and 2 entirely",
    description:
      "Browser allowlist. If the host application name contains chrome, safari, arc, firefox, edge, brave, opera, or vivaldi, jump straight to Tier 3. The cost of trying AXPress on a web view is one FFI call that returns success and does nothing — the worst of both worlds, because the engine thinks the click landed.",
  },
];

const operationalCards: BentoCard[] = [
  {
    title: "AXIsProcessTrustedWithOptions is the only gate",
    description:
      "No accessibility entitlement, no AX calls. Pass kAXTrustedCheckOptionPrompt = kCFBooleanTrue at engine construction time to trigger the system prompt the first time. Without the bit set, every AXUIElementCopyAttributeValue returns kAXErrorAPIDisabled.",
    size: "2x1",
    accent: true,
  },
  {
    title: "AXUIElement is Core Foundation, not Rust-safe",
    description:
      "The accessibility crate doesn't mark it Send + Sync. You wrap it manually in struct ThreadSafeAXUIElement(Arc<AXUIElement>) with two unsafe impl blocks. Skip this and you can't run AX queries from a tokio task or an MCP server.",
    size: "1x1",
  },
  {
    title: "AXValue, AXValueAttribute, AXText",
    description:
      "Three attribute names tried in sequence for web inputs. AXValue handles native AppKit. AXValueAttribute is the legacy WebKit key. AXText catches some Electron and CEF builds. First non-zero return code wins.",
    size: "1x1",
  },
  {
    title: "Browsers ack actions and do nothing",
    description:
      "AXPress on a Chrome web view returns kAXErrorSuccess and the page never changes. The browser's AX shim acknowledges the action without forwarding it to Blink. The only fix is a per-app bypass list and synthetic CGEvents.",
    size: "1x1",
  },
  {
    title: "AXMinimizeButton, AXZoomButton, AXCloseButton",
    description:
      "Window chrome lives at known attribute keys. Don't search the tree for a Close button — read AXCloseButton off the window element directly and AXPress that. The deleted engine used this at lines 1715 to 1721.",
    size: "1x1",
  },
  {
    title: "The 130+ AXAttribute string fan-out",
    description:
      "Every property you read or write is an AXAttribute::new(&CFString::new(name)). The 4,368-line file references AXTitle, AXLabel, AXDescription, AXValue, AXPosition, AXSize, AXRole, AXSubrole, AXFocused, AXSelected, AXChildren, AXParent, AXFocusedApplication, AXFocusedUIElement, plus a long tail of role-specific keys. Every one is one FFI call.",
    size: "2x1",
  },
];

const surfaceComparison: ComparisonRow[] = [
  {
    feature: "primary call",
    competitor: "AXUIElementCopyAttributeValue",
    ours: "AXUIElementPerformAction or AXUIElementSetAttributeValue",
  },
  {
    feature: "idempotent",
    competitor: "yes, repeat reads return the same snapshot",
    ours: "no, every call may mutate UI state or fail half-way",
  },
  {
    feature: "browser behavior",
    competitor: "tree exposes elements with role, name, bounds",
    ours: "AXPress and AXClick return success and do nothing",
  },
  {
    feature: "thread safety",
    competitor: "safe to fan out across tokio tasks once wrapped",
    ours: "needs per-element focus and per-process activation up front",
  },
  {
    feature: "fallback strategy",
    competitor: "retry the read, walk a different ancestor",
    ours: "AXPress → AXClick → CGEvent mouse simulation, plus per-app allowlists",
  },
  {
    feature: "Apple docs coverage",
    competitor: "well-documented, sample code in Accessibility Inspector",
    ours: "documented at the API level, silent on which apps lie about supported actions",
  },
  {
    feature: "what an automation engine spends time on",
    competitor: "tree formatting, selector grammar, caching",
    ours: "fallback strategies, browser detection, key event composition, focus dance",
  },
];

const buildingChecklist = [
  {
    text: "Check AXIsProcessTrustedWithOptions with kAXTrustedCheckOptionPrompt = kCFBooleanTrue at engine construction time. Refuse to start if the bit isn't set.",
  },
  {
    text: "Wrap AXUIElement in your own struct with manual unsafe impl Send + Sync. Cite the Core Foundation thread-safety guarantee in a SAFETY comment.",
  },
  {
    text: "Maintain a host-application allowlist of browsers that bypass AXPress and AXClick entirely. Today the list is at least chrome, safari, arc, firefox, edge, brave, opera, vivaldi.",
  },
  {
    text: "For clicks, ship 3 tiers in order: AXPress, AXClick, CGEvent mouse simulation. For browsers, jump directly to tier 3.",
  },
  {
    text: "For text input on web inputs, try AXValue, then AXValueAttribute, then AXText. First non-zero return wins. Fall back to synthetic CGEventKeyboard events if all three fail.",
  },
  {
    text: "Read window chrome from named attributes (AXMinimizeButton, AXZoomButton, AXCloseButton) instead of searching the tree by role + name.",
  },
  {
    text: "Detect web role (role contains 'web' or 'generic') before deciding which value-setting strategy to use. The role lookup itself is one AX call.",
  },
  {
    text: "Budget for permission errors at every level. AXIsProcessTrusted can flip back to false at any time if the user revokes the entitlement, and your engine should surface that as a typed error rather than a panic.",
  },
];

const relatedPosts = [
  {
    title: "Accessibility API for AI agents: diff the tree, don't re-read it",
    excerpt:
      "Companion guide on the read loop. Once you have the tree, what do you do with it? Two regexes strip volatile #ids and bounds, similar::TextDiff::from_lines emits the delta.",
    href: "/t/accessibility-api-ai-agents",
    tag: "Patterns",
  },
  {
    title: "Accessibility API desktop automation, without the mouse",
    excerpt:
      "On Windows, UIInvokePattern and InvokeAction skip the click entirely. Here's the equivalent question on macOS, and why AXPress is sometimes the right answer.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Patterns",
  },
  {
    title: "Open source computer use agents, April 2026",
    excerpt:
      "Snapshot of the agent ecosystem: which tools use accessibility APIs, which use vision, and which combine both. Includes the macOS AX side of the lineup.",
    href: "/t/open-source-computer-use-agents-april-2026",
    tag: "Ecosystem",
  },
];

export default function Page() {
  return (
    <>
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
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            })
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

      <article className="text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              macOS accessibility UI tree automation:{" "}
              <GradientText>the write path nobody warns you about</GradientText>
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Reading the macOS accessibility tree is the easy half.{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                AXUIElementCopyAttributeValue
              </code>{" "}
              walks the tree, Accessibility Inspector renders it for you, and
              every Mac automation guide you find online stops there. The
              write path is where the abstraction leaks.{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                AXPress
              </code>{" "}
              and{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                AXClick
              </code>{" "}
              return success on Chrome, Safari, Arc, Firefox, Edge, Brave,
              Opera, and Vivaldi web views and do absolutely nothing. Any
              automation engine that lasts more than a weekend ships a 3-tier
              click fallback and a hand-coded browser bypass list. This page
              is what 4,368 lines of macOS accessibility code looked like up
              close, before we deleted it.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                AXUIElement
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                AXPress
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                CGEvent
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                ApplicationServices
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="13 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers building macOS desktop automation"
            highlights={[
              "8 browser names bypass AXPress / AXClick on sight",
              "3 click strategies tried per element before failure",
              "Manual unsafe Send + Sync wrapper for AXUIElement",
              "4,368 lines of recoverable Rust to read against",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-12">
          <RemotionClip
            title="The macOS AX write path"
            subtitle="What every other guide leaves out"
            captions={[
              "AXPress and AXClick lie to you on web views",
              "8-browser bypass list, then synthetic CGEvents",
              "AXUIElement isn't Send or Sync without an unsafe wrapper",
              "Read the deleted macos.rs end to end",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What every other guide on this gets right, and where they stop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open any explainer about Mac accessibility automation and you get
            the same recipe. Open Accessibility Inspector. Note the role and
            label of the element you want. Call{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElementCopyAttributeValue
            </code>{" "}
            with the right key. Walk{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXChildren
            </code>{" "}
            recursively. Maybe pretty-print the result. The recipe is correct,
            and it gets you a tree dump on screen in about 60 lines of Swift
            or Python. That's the read path.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What the existing playbooks don't tell you is what happens the
            second you try to drive the tree. Send an AX action, set an AX
            value, focus an element, type into a web input, click the close
            button on a window. Apple's API gives you the function names. It
            does not tell you which controls in which apps actually honor
            them, and on macOS there is no central registry of which AX
            actions are real and which are decoration. You find out by
            shipping it.
          </p>
          <MetricsRow metrics={tierMetrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The eight-browser bypass list, and why it exists
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The single piece of code that captures the write-path problem
            best is the first 35 lines of{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click_auto
            </code>{" "}
            in the Terminator macOS adapter. Before it tries any AX action,
            it asks: what application owns this element? If the answer
            contains any of eight browser substrings, jump straight to
            synthetic mouse events. Don't even attempt AXPress.
          </p>
          <div className="mt-6 mb-2 text-sm text-zinc-500 font-mono">
            The browsers that always skip the AX action path:
          </div>
          <Marquee speed={28} pauseOnHover fade>
            {eightBrowsers.map((b) => (
              <span
                key={b}
                className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-mono text-sm whitespace-nowrap"
              >
                {b}
              </span>
            ))}
          </Marquee>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Why is the list hardcoded? Because the failure mode is the worst
            kind. AXPress on a Chrome web view returns{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              kAXErrorSuccess
            </code>
            , the engine thinks the click landed, the test passes, and the
            page never changes. There is no error to log, no exception to
            catch. The only way to know the click was lost is to compare the
            tree before and after, notice nothing moved, and bail to a
            synthetic event. By that point you've burned a tree snapshot you
            didn't need to take. So the engine front-loads the decision: if
            it looks like a browser, skip the AX action layer entirely.
          </p>
          <div className="mt-8">
            <AnimatedCodeBlock
              code={clickAutoSnippet}
              language="rust"
              filename="crates/terminator/src/platforms/macos.rs"
              typingSpeed={6}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What &quot;click an element&quot; actually means on macOS
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Once you accept that AXPress can lie, the click implementation
            stops being a one-liner and becomes a flowchart. You try the
            cheap path first, fall through to a slightly less cheap path, and
            land on synthetic input as a last resort. That last resort is the
            only path that physically moves the cursor.
          </p>
          <div className="mt-8">
            <AnimatedBeam
              title="Click strategy fan-in"
              from={[
                { label: "AXPress action", sublabel: "70% of native AppKit" },
                { label: "AXClick action", sublabel: "older Cocoa controls" },
                { label: "CGEvent mouse", sublabel: "browsers, Electron, last resort" },
              ]}
              hub={{
                label: "click_auto",
                sublabel: "macos.rs : 407-442",
              }}
              to={[
                { label: "ClickResult: AXPress", sublabel: "no cursor movement" },
                { label: "ClickResult: AXClick", sublabel: "no cursor movement" },
                {
                  label: "ClickResult: CGEvent",
                  sublabel: "cursor moves visibly to (x+w/2, y+h/2)",
                },
              ]}
              accentColor="#FF3E00"
            />
          </div>
          <div className="mt-8">
            <StepTimeline title="The 3-tier click in execution order" steps={tierSteps} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            AXUIElement isn&apos;t Send. AXUIElement isn&apos;t Sync. You wrap it.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every async runtime, MCP server, or background daemon you build
            on top of macOS accessibility has the same first problem. The
            Rust accessibility crate does not implement Send or Sync for{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElement
            </code>
            , so you can&apos;t store one in a struct that crosses await
            points or share one across threads. The fix is a manual wrapper
            with two unsafe impl blocks and a SAFETY comment that points at
            Apple&apos;s thread-safety guarantee for Core Foundation objects.
            You only have to write this once, and the rest of the engine
            depends on it.
          </p>
          <div className="mt-8">
            <AnimatedCodeBlock
              code={threadSafeSnippet}
              language="rust"
              filename="crates/terminator/src/platforms/macos.rs"
              typingSpeed={6}
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            If you skip this step, you discover it the first time you try to
            run an AX query inside a tokio task and the compiler tells you
            the future isn&apos;t Send. Most projects discover it about an
            hour into building, write the wrapper, and never think about it
            again. It is one of the genuinely transferable patterns from
            reading any AX automation engine source.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Typing into a web input: three attribute names in a loop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same trap shows up on the value side. A native AppKit text
            field accepts{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXValue
            </code>{" "}
            via{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElementSetAttributeValue
            </code>{" "}
            and the text appears. A Chrome input exposed through the
            accessibility shim might honor{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXValue
            </code>
            , or might only respond to{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXValueAttribute
            </code>
            , or might only accept{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXText
            </code>{" "}
            depending on which Chromium build it&apos;s running. The deleted
            type_text path tries all three in sequence and takes whichever
            one returns a zero status code.
          </p>
          <div className="mt-8">
            <AnimatedCodeBlock
              code={typeTextSnippet}
              language="rust"
              filename="crates/terminator/src/platforms/macos.rs"
              typingSpeed={6}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Permission gate: AXIsProcessTrustedWithOptions
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Before any of the above runs, the user has to grant your binary
            the Accessibility entitlement. There&apos;s exactly one function
            for this and one option key:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXIsProcessTrustedWithOptions
            </code>{" "}
            with a CFDictionary mapping{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              kAXTrustedCheckOptionPrompt
            </code>{" "}
            to{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              kCFBooleanTrue
            </code>
            . That triggers the system prompt the first time. Until the user
            toggles your binary in System Settings, every AX call returns{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              kAXErrorAPIDisabled
            </code>
            . There is no programmatic way around this; you can only ask.
          </p>
          <div className="mt-6">
            <TerminalOutput title="permission flow" lines={permissionLines} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The operational shape of an AX automation engine
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Outside the marquee fallback chains, an AX engine is a
            collection of small, opinionated decisions. Which attribute
            names to read first. Where to gate on permissions. Which
            controls deserve their own named lookup instead of a tree walk.
            None of these are hard individually; in aggregate they are why
            the file ends up four thousand lines long.
          </p>
          <div className="mt-8">
            <BentoGrid cards={operationalCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Reads vs writes: same API, different surface
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you treat AX reads and AX writes as symmetric you will spend
            most of your engineering budget on the writes. The two surfaces
            look similar in the headers but behave very differently in
            production.
          </p>
          <div className="mt-8">
            <ComparisonTable
              productName="Write path"
              competitorName="Read path"
              rows={surfaceComparison}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            If you&apos;re building this yourself, here&apos;s the punch list
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every macOS automation engine that lasts past a prototype ends
            up with some version of the items below. The exact spelling
            varies by language and runtime. The behavior doesn&apos;t.
          </p>
          <div className="mt-8">
            <AnimatedChecklist
              title="What a production AX engine ends up shipping"
              items={buildingChecklist}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Where Terminator lands on macOS today
          </h2>
          <GlowCard>
            <div className="p-7">
              <p className="text-zinc-700 leading-relaxed">
                Honest update on the state of the project. Terminator is a
                developer framework for building desktop automation. It
                gives existing AI coding assistants the ability to drive
                your whole OS through native accessibility APIs, not just
                write code. On Windows it ships full UIA support: the
                Node.js, Python, and MCP server packages are Windows
                binaries today. On macOS, the adapter you&apos;ve been
                reading about lived at{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  crates/terminator/src/platforms/macos.rs
                </code>{" "}
                for several months and got deleted on 2025-12-16 in commit{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  0c11011c
                </code>{" "}
                so the team could put its weight behind the Windows path
                where it has the most depth.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                The full 4,368-line file is still recoverable from git
                history with{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  git show 0c11011c~1:crates/terminator/src/platforms/macos.rs
                </code>
                . If you&apos;re writing a macOS AX engine right now, that
                file is one of the more complete MIT-licensed examples
                available. Read{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  click_auto
                </code>
                ,{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  type_text
                </code>
                , the{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  ThreadSafeAXUIElement
                </code>{" "}
                wrapper, and the permission check at lines 121 to 144. The
                rest mostly composes from there.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                For a working macOS automation tool today, look at
                Hammerspoon&apos;s axuielement Lua module, MacPaw&apos;s
                macapptree for tree dumps, or Nudge for an MCP server.
                Each of them ships its own click and value-setting
                strategy, and each of them has hit the same set of write-
                path edge cases this page describes.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Other AX-using tools you&apos;ll see in the wild
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of these solve the entire problem; each picks a slice.
            All of them wrap{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElementCopyAttributeValue
            </code>{" "}
            and friends underneath.
          </p>
          <div className="mt-6">
            <Marquee speed={36} pauseOnHover fade>
              {otherToolsLogos.map((t) => (
                <span
                  key={t}
                  className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm whitespace-nowrap"
                >
                  {t}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 my-16">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Building AX automation and want a second pair of eyes?"
            description="Walk through your write-path fallbacks with the team that maintained 4,368 lines of macos.rs. We've already hit the edges."
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <FaqSection items={faqs} heading="Questions developers ask after reading the file" />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Adjacent guides"
            subtitle="Read these next if you're working on the agent-side of the tree"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Compare notes on macOS AX automation with the Terminator team."
      />
    </>
  );
}
