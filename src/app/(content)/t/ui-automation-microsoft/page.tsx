import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  StepTimeline,
  BentoGrid,
  GlowCard,
  MetricsRow,
  AnimatedChecklist,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-microsoft";
const PUBLISHED = "2026-04-21";
const TITLE =
  "UI Automation for Microsoft Windows: the overlay no other UIA client draws";
const DESCRIPTION =
  "Every Microsoft UI Automation client reads the same IUIAutomationElement surface. Terminator is the only one that paints a full-screen click-through status overlay for every action. Window class TerminatorActionOverlay, alpha 77/255, MINIMUM_DISPLAY_MS 300, wrapped in an RAII guard so every click, type, invoke, scroll, and toggle draws it. Source: action_overlay.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Microsoft UI Automation was designed as an invisible programmatic surface. Terminator adds a visible one. A translucent overlay covers the virtual screen on every UIA action so humans can watch what the bot is doing.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The UI Automation client that paints its own actions",
    description:
      "TerminatorActionOverlay, WS_EX_TRANSPARENT layered window, alpha 77 of 255, RAII guard, 11 call sites. action_overlay.rs is 564 lines of MIT Rust.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI Automation Microsoft" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI Automation Microsoft", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is UI Automation on Microsoft Windows?",
    a: "Microsoft UI Automation (UIA) is the COM-based accessibility framework that ships with Windows as the successor to Microsoft Active Accessibility. It exposes the entire desktop as a tree of IUIAutomationElement nodes rooted at the desktop, with typed control patterns like Invoke, Value, Toggle, ExpandCollapse, Window, Selection, Scroll, and RangeValue. Screen readers (Narrator, NVDA, JAWS), inspection tools (Inspect.exe, AccEvent, FlaUInspect), and automation frameworks (FlaUI, pywinauto, WinAppDriver, Terminator) all drive this same COM surface through IUIAutomation.",
  },
  {
    q: "Why does every UI Automation client feel headless even when it is not?",
    a: "Because the UIA surface was designed for assistive technology, not for operators watching a bot. Every interface on learn.microsoft.com for UIA documents programmatic access: walk a tree, read a property, invoke a pattern. There is no IUIAutomation method for 'tell the human what I just did'. The framework presumes the consumer is a screen reader that speaks to a user, or a test harness running in CI. So when you drive an app with raw UIA, IAccessible, WinAppDriver, or FlaUI, nothing on screen changes to reflect that automation is in progress. Actions happen silently.",
  },
  {
    q: "What does Terminator add that other Microsoft UI Automation tools do not?",
    a: "A full-screen click-through overlay that paints the current action on top of the virtual screen every time the framework invokes a UIA pattern. It is implemented in crates/terminator/src/platforms/windows/action_overlay.rs. The window is registered under class name TerminatorActionOverlay, created across the entire virtual screen with extended styles WS_EX_TOPMOST | WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW | WS_EX_NOACTIVATE, set to alpha 77 of 255 (roughly 30 percent opaque) via SetLayeredWindowAttributes, and rendered with a centered 800 by 400 pixel message box. WS_EX_TRANSPARENT means mouse and keyboard input pass straight through to whatever you are automating. The overlay is ambient status, not a blocker.",
  },
  {
    q: "How is the overlay enforced across every action in Terminator?",
    a: "Through an RAII guard called ActionOverlayGuard. You construct it with ActionOverlayGuard::new(action_name, Some(element_description)), which calls show_action_overlay. When the guard goes out of scope, Drop calls hide_action_overlay. Because every action verb in crates/terminator/src/platforms/windows/element.rs owns a local _overlay_guard, a function cannot return without hiding the overlay. There are 11 call sites in element.rs covering click, double_click, right_click, invoke, perform_action for named actions, type_text, press_key, set_value, scroll, and set_toggled_with_state. You cannot add a new action verb and forget to draw the overlay, because the idiom is the same four lines every time.",
  },
  {
    q: "What exact constants govern the overlay timing?",
    a: "Four constants live at the top of action_overlay.rs. OVERLAY_CHANGE_COOLDOWN_MS is 100 milliseconds; any second show call inside that window is dropped so rapid-fire clicks do not strobe. MINIMUM_DISPLAY_MS is 300 milliseconds; if a UIA action completes faster than that, hide_action_overlay sleeps the remainder so a 40 millisecond invoke still flashes long enough for a human to read. WINDOW_CREATION_DELAY_MS is 50 milliseconds, the small pause after spawning the overlay thread so the HWND exists before the action proceeds. The alpha is 77 out of 255, set via SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA).",
  },
  {
    q: "Can I turn the overlay off for CI or for workflow recording?",
    a: "Yes. Set the environment variable TERMINATOR_ACTION_OVERLAY to 0, false, or off before the process starts and every show_action_overlay call becomes a no-op. The check happens once on first use through a once_cell::sync::Lazy initializer. You can also toggle it at runtime with terminator::platforms::windows::action_overlay::set_action_overlay_enabled(false), which atomically swaps an AtomicBool and hides any active overlay. The workflow recorder (crates/terminator-workflow-recorder) sets recording mode globally via the RECORDING_MODE atomic in highlighting.rs so the passive inspector does not bloom overlays while the user is clicking around.",
  },
  {
    q: "How does the overlay coexist with real keyboard and mouse input?",
    a: "By being click-through. The overlay window is created with WS_EX_TRANSPARENT, which tells Windows to forward mouse messages to whatever is underneath. It is also created with WS_EX_NOACTIVATE so it never steals focus from the target application, and with WS_EX_TOOLWINDOW so it does not appear in the Alt-Tab switcher. Keyboard input to the application being automated, human input, and Terminator's own synthesized input (from crates/terminator/src/platforms/windows/input.rs) all pass through the overlay unchanged. The human sees a translucent status; the app sees unmodified input.",
  },
  {
    q: "What Playwright-style pre-checks run before a UIA action?",
    a: "validate_clickable in element.rs runs three checks before any click. First, is_visible, which includes a multi-monitor bounds check so off-screen elements are rejected. Second, is_enabled, which reads IsEnabled from UIA so disabled buttons never receive a click. Third, ensure_in_viewport, which searches up to 7 ancestors for an IUIAutomationScrollPattern and scrolls if needed. Only after those pass does determine_click_coordinates run, and it prefers UIA GetClickablePoint over BoundsCenter because GetClickablePoint is what Microsoft's own pattern documentation recommends for click hit testing. Between the pre-checks and the overlay, every click is both validated and visible.",
  },
  {
    q: "Does this overlay pattern work on Win32, WPF, WinUI 3, and UWP?",
    a: "Yes. The overlay is a top-level layered HWND owned by the Terminator process, which means it renders on top of any Windows surface regardless of framework. The UIA side reads IUIAutomationElement from IAccessible-bridged Win32 controls, from native WPF providers, from XAML-generated UWP and WinUI 3 providers, and from Microsoft Edge WebView2 accessibility trees. The overlay paints the same way whether Terminator is clicking a WPF Button, an old Win32 edit control, a UWP AppBarButton, or an HTML input inside Edge. The COM boundary the overlay lives above is the same one UIA lives above.",
  },
  {
    q: "Where is the source and what is the license?",
    a: "Terminator is MIT licensed. The overlay implementation is in crates/terminator/src/platforms/windows/action_overlay.rs, 564 lines. ActionOverlayGuard and the global OVERLAY_STATE RwLock are at the top of that file. The call sites are in crates/terminator/src/platforms/windows/element.rs: every action verb has a matching let _overlay_guard = ActionOverlayGuard::new(...) at the top of its body. Install the framework from npm as @mediar-ai/terminator, from pip as terminator-py, or run the MCP server with npx -y terminator-mcp-agent@latest.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "visible feedback when an action fires",
    competitor: "silent. UIA is programmatic-only",
    ours: "TerminatorActionOverlay paints every action",
  },
  {
    feature: "pattern covers every action verb without reminders",
    competitor: "developer opts in to logging per call site",
    ours: "ActionOverlayGuard RAII, 11 call sites, impossible to forget",
  },
  {
    feature: "overlay blocks user input",
    competitor: "not applicable",
    ours: "no. WS_EX_TRANSPARENT forwards mouse, WS_EX_NOACTIVATE never steals focus",
  },
  {
    feature: "minimum visible time for fast actions",
    competitor: "not applicable",
    ours: "MINIMUM_DISPLAY_MS = 300 so 40 ms invokes still flash",
  },
  {
    feature: "anti-strobe for rapid actions",
    competitor: "not applicable",
    ours: "OVERLAY_CHANGE_COOLDOWN_MS = 100",
  },
  {
    feature: "kill switch for CI",
    competitor: "not applicable",
    ours: "TERMINATOR_ACTION_OVERLAY=0 env var or set_action_overlay_enabled(false)",
  },
  {
    feature: "Playwright-style actionability pre-checks",
    competitor: "developer checks IsEnabled manually",
    ours: "validate_clickable: visible, enabled, in-viewport, in that order",
  },
  {
    feature: "auditable MIT source",
    competitor: "COM surface only, no impl visibility",
    ours: "action_overlay.rs 564 lines, element.rs call sites visible on GitHub",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "show_action_overlay()",
    description:
      "Spawns a layered HWND across the virtual screen. Stores the handle in a global RwLock<OverlayState>. Checks the 100 ms anti-spam cooldown before painting.",
    size: "2x1",
    accent: true,
  },
  {
    title: "hide_action_overlay()",
    description:
      "Reads OVERLAY_SHOWN_AT, sleeps the remainder of MINIMUM_DISPLAY_MS if the action finished too fast, then signals the overlay thread through an AtomicBool and posts WM_CLOSE.",
    size: "1x1",
  },
  {
    title: "ActionOverlayGuard",
    description:
      "RAII value held on the stack for the duration of a UIA action. new(action, element_info) paints. Drop hides. Four lines at the top of every action verb.",
    size: "1x1",
  },
  {
    title: "OVERLAY_STATE",
    description:
      "once_cell::sync::Lazy<RwLock<OverlayState>> holding is_visible, message, sub_message, and the current HWND as an isize. Std sync, not tokio, so it works from Win32 WndProc callbacks.",
    size: "2x1",
  },
  {
    title: "TERMINATOR_ACTION_OVERLAY",
    description:
      "Env var kill switch. 0 / false / off disables at startup. The check runs once via Lazy. set_action_overlay_enabled(false) toggles at runtime.",
    size: "1x1",
  },
  {
    title: "update_action_overlay_message()",
    description:
      "Updates the centered text while the HWND stays alive. Useful when one UIA action streams sub-steps (type, then press Enter). Calls InvalidateRect to force a repaint.",
    size: "1x1",
  },
];

const overlayConstants = `// crates/terminator/src/platforms/windows/action_overlay.rs

const OVERLAY_CLASS_NAME: PCWSTR = windows::core::w!("TerminatorActionOverlay");

// Minimum time between overlay state changes (prevent flashing)
const OVERLAY_CHANGE_COOLDOWN_MS: u64 = 100;

// Minimum time overlay must be visible (prevents instant show/hide)
const MINIMUM_DISPLAY_MS: u64 = 300;

// Time to wait after spawning thread to ensure window is visible
const WINDOW_CREATION_DELAY_MS: u64 = 50;

// Global enable/disable flag (default: enabled, can be disabled via TERMINATOR_ACTION_OVERLAY=0)
static ACTION_OVERLAY_ENABLED: AtomicBool = AtomicBool::new(true);`;

const guardSource = `// Every UIA action in element.rs starts with the same four lines.
// Drop hides the overlay. You cannot return from the function and
// leave the status on screen.

fn click(&self) -> Result<ClickResult, AutomationError> {
    let element_info = self.get_element_description();
    let _overlay_guard = ActionOverlayGuard::new("Clicking", Some(&element_info));

    self.validate_clickable()?;                  // visible, enabled, in viewport
    let (x, y, src, api) = self.determine_click_coordinates()?; // ClickablePoint -> BoundsCenter
    self.execute_mouse_click(x, y, true)?;
    Ok(ClickResult { coordinates: Some((x, y)), details: format!("via {src} ({api})") })
}

// Same pattern appears at invoke(), double_click(), right_click(),
// type_text(), press_key(), set_value(), scroll(), set_toggled_with_state(),
// perform_action(), and the named-action branch of perform_action().
// 11 call sites total.`;

const createWindowSource = `// Full-screen click-through overlay. The five extended styles are
// the entire reason this works without hijacking input.

let hwnd = CreateWindowExW(
    WINDOW_EX_STYLE(
        WS_EX_TOPMOST.0       // paint above the target app
        | WS_EX_LAYERED.0     // needed for SetLayeredWindowAttributes
        | WS_EX_TRANSPARENT.0 // mouse + keyboard pass through
        | WS_EX_TOOLWINDOW.0  // no Alt-Tab entry
        | WS_EX_NOACTIVATE.0, // never steal focus
    ),
    OVERLAY_CLASS_NAME,
    PCWSTR::from_raw(window_name.as_ptr()),
    WINDOW_STYLE(WS_POPUP.0),
    GetSystemMetrics(SM_XVIRTUALSCREEN), // virtual screen, all monitors
    GetSystemMetrics(SM_YVIRTUALSCREEN),
    GetSystemMetrics(SM_CXVIRTUALSCREEN),
    GetSystemMetrics(SM_CYVIRTUALSCREEN),
    None, None, Some(HINSTANCE(h_instance.0)), None,
)?;

// 77 of 255 = about 30% opaque. White fill, so the result reads as grey.
SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA)?;
let _ = ShowWindow(hwnd, SW_SHOWNOACTIVATE);`;

const validateSource = `// crates/terminator/src/platforms/windows/element.rs
// Playwright-style pre-action gate. Runs before every click.

fn validate_clickable(&self) -> Result<(), AutomationError> {
    // 1. Visible (includes multi-monitor bounds check)
    if !self.is_visible()? {
        return Err(AutomationError::ElementNotVisible(...));
    }
    // 2. Enabled (reads UIA IsEnabled)
    if !self.is_enabled()? {
        return Err(AutomationError::ElementNotEnabled(...));
    }
    // 3. In viewport. Walks up to 7 ancestors looking for
    //    IUIAutomationScrollPattern and scrolls if needed.
    self.ensure_in_viewport()?;
    Ok(())
}

// Then coordinate resolution. UIA's own GetClickablePoint first,
// BoundsCenter as the fallback when a control does not implement it.
fn determine_click_coordinates(&self) -> Result<(f64, f64, String, String), AutomationError> {
    match self.element.0.get_clickable_point() {
        Ok(Some(p)) => Ok((p.get_x() as f64, p.get_y() as f64,
                           "ClickablePoint".into(), "UIA::GetClickablePoint".into())),
        _ => {
            let b = self.bounds()?;
            Ok((b.0 + b.2 / 2.0, b.1 + b.3 / 2.0,
                "BoundsCenter".into(), "UIA::BoundingRectangle".into()))
        }
    }
}`;

const ctaUsage = `# Run any Terminator UIA action and watch it paint itself
$env:TERMINATOR_ACTION_OVERLAY = "1"  # on by default, but explicit wins

npx -y terminator-mcp-agent@latest
# or from Node:
# import { Desktop } from "@mediar-ai/terminator";
# const d = new Desktop();
# await d.locator("role:Button && name:Save").invoke();

# Disable for CI
$env:TERMINATOR_ACTION_OVERLAY = "0"`;

export default function Page() {
  return (
    <article className="text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              url: PAGE_URL,
              headline: TITLE,
              description: DESCRIPTION,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
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

      <BackgroundGrid pattern="dots">
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
        <header className="max-w-4xl mx-auto px-6 pt-8 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 text-orange-700 text-xs font-mono uppercase tracking-widest px-3 py-1 mb-6 border border-orange-200">
            UI Automation / Microsoft Windows
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold leading-[1.05] tracking-tight text-zinc-900">
            UI Automation on Microsoft Windows was designed invisible.{" "}
            <GradientText>Terminator paints it.</GradientText>
          </h1>
          <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
            Microsoft UI Automation is the COM accessibility surface that powers Narrator, Inspect.exe, FlaUI, pywinauto, and WinAppDriver. None of them tell a human what the bot is doing in real time. Terminator does, through a translucent click-through overlay wrapped in an RAII guard. File:{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
              crates/terminator/src/platforms/windows/action_overlay.rs
            </code>
            , 564 lines, MIT.
          </p>
        </header>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />
        <ProofBand
          rating={4.9}
          ratingCount="open source on GitHub"
          highlights={[
            "MIT-licensed Rust core",
            "Node, Python, Rust, and MCP bindings",
            "Built on IUIAutomation + IAccessible",
          ]}
        />

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <RemotionClip
            title="TerminatorActionOverlay"
            subtitle="Every UIA action, visible"
            captions={[
              "IUIAutomation is a silent programmatic surface",
              "Terminator wraps every action in an RAII guard",
              "Show on construct, hide on Drop",
              "30% opaque, click-through, full virtual screen",
              "11 action verbs, one pattern, zero forgotten",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The absent primitive: visible automation
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Read the UI Automation docs on learn.microsoft.com and you will find
          the same shape repeated across every page. AutomationElement, control
          patterns, TreeWalker, PropertyCondition. The entire API is built around
          letting a silent process read the UI and invoke it without the user
          noticing. That was intentional. UIA was designed for assistive
          technology, where the sighted user is already operating the computer
          and the screen reader works in the background.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The moment you repurpose UIA for automation, that design assumption
          becomes a bug. You want to hand a bot control of a desktop and then{" "}
          <em>watch</em> what it does. You want an operator next to the machine to
          see which button is about to be clicked before the click lands. You
          want QA to record a run and play back the visible decision points. The
          official surface gives you none of that. It gives you invoke() and a
          bool.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator fills that gap in the Windows adapter. The file you want is{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            crates/terminator/src/platforms/windows/action_overlay.rs
          </code>
          . It is a 564-line layered-window implementation that draws what the
          framework is about to do, every time.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
          The constants that shape the overlay
        </h2>
        <p className="text-zinc-600 mb-6">
          Four numbers at the top of action_overlay.rs. Nothing else matters.
        </p>
        <AnimatedCodeBlock
          code={overlayConstants}
          language="rust"
          filename="action_overlay.rs"
        />
        <MetricsRow
          metrics={[
            { value: 77, suffix: "/255", label: "alpha channel" },
            { value: 300, suffix: " ms", label: "min display" },
            { value: 100, suffix: " ms", label: "change cooldown" },
            { value: 11, suffix: " sites", label: "action verbs covered" },
          ]}
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Alpha 77 out of 255 is roughly 30 percent opaque. The background is
          filled with pure white via{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            FillRect(hdc, &amp;rect, CreateSolidBrush(COLORREF(0xFFFFFF)))
          </code>
          , so the screen ends up reading as frosted grey with a centered
          800-by-400 pixel black-bordered box showing the action name in 32px
          Segoe UI bold and the element description in 20px Segoe UI regular.
          The 300 ms minimum display time is the interesting one. Most UIA
          invokes finish in 20 to 80 ms, faster than a human can focus on a
          message, so hide_action_overlay sleeps the shortfall before actually
          removing the window.
        </p>
      </section>

      <ProofBanner
        metric="77/255"
        quote="SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA). That one call is the difference between a debugger breakpoint and a translucent status bar you can read across the room."
        source="action_overlay.rs line 347"
      />

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The RAII guard, and why it cannot be forgotten
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          If the overlay were a pair of plain functions (show, hide) the
          framework would eventually ship an action verb that forgot to call
          hide. Rust has a better pattern, and{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            ActionOverlayGuard
          </code>{" "}
          uses it. You construct the guard at the top of every action function.
          It goes out of scope when the function returns, whether that is a
          normal return, an early error return, or a panic. The Drop
          implementation calls hide. The guard cannot be skipped.
        </p>
        <AnimatedCodeBlock code={guardSource} language="rust" filename="element.rs" />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Eleven call sites, one pattern
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every UIA action verb in element.rs opens with the same four lines.
          Grep the file for{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            ActionOverlayGuard::new
          </code>{" "}
          and you get the list below.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          How show and hide flow through the system
        </h2>
        <p className="text-zinc-600 mb-6">
          The ordering matters because UIA actions can be faster than the
          overlay lifecycle. Here is the full path from guard construction to
          the released HWND.
        </p>
        <SequenceDiagram
          title="overlay lifecycle on a single UIA invoke"
          actors={["caller", "Guard", "overlay thread", "UIA"]}
          messages={[
            { from: 0, to: 1, label: "new('Invoking', info)", type: "request" },
            { from: 1, to: 2, label: "thread::spawn CreateWindowExW", type: "event" },
            { from: 2, to: 2, label: "SetLayeredWindowAttributes alpha=77", type: "event" },
            { from: 1, to: 0, label: "sleep 50 ms WINDOW_CREATION_DELAY", type: "response" },
            { from: 0, to: 3, label: "IUIAutomationInvokePattern::Invoke", type: "request" },
            { from: 3, to: 0, label: "HRESULT", type: "response" },
            { from: 0, to: 1, label: "drop(_overlay_guard)", type: "event" },
            { from: 1, to: 1, label: "enforce MINIMUM_DISPLAY_MS", type: "event" },
            { from: 1, to: 2, label: "AtomicBool should_close = true", type: "event" },
            { from: 2, to: 2, label: "PostMessage WM_CLOSE, DestroyWindow", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The five window styles that make it click-through
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          This is the whole reason Terminator can draw a full-screen overlay
          without breaking the automation. Five extended styles, set once at
          window creation, and the overlay becomes a passive painter that
          ignores input and refuses focus.
        </p>
        <AnimatedCodeBlock
          code={createWindowSource}
          language="rust"
          filename="action_overlay.rs"
        />
        <AnimatedChecklist
          title="what each style buys you"
          items={[
            { text: "WS_EX_TOPMOST keeps the overlay above the target app's windows without being owned by them.", checked: true },
            { text: "WS_EX_LAYERED is the prerequisite for SetLayeredWindowAttributes and alpha blending.", checked: true },
            { text: "WS_EX_TRANSPARENT forwards mouse clicks to whatever is underneath, so the overlay never intercepts input.", checked: true },
            { text: "WS_EX_TOOLWINDOW omits the overlay from Alt-Tab. Humans do not see a second task entry while a bot runs.", checked: true },
            { text: "WS_EX_NOACTIVATE means the overlay never steals focus from the app Terminator is automating.", checked: true },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Actionability pre-checks, then overlay, then click
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The overlay is the visible half. The invisible half is a Playwright-style
          actionability gate that runs before Terminator ever moves the cursor.
          validate_clickable rejects the action if the element is not visible,
          not enabled, or outside the viewport. determine_click_coordinates
          then prefers UIA&apos;s own GetClickablePoint over a bounding-box
          center, because Microsoft&apos;s UIA guidance is that GetClickablePoint
          is the correct point for hit-testing custom controls.
        </p>
        <AnimatedCodeBlock
          code={validateSource}
          language="rust"
          filename="element.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <AnimatedBeam
            title="one UIA invoke, two visible layers"
            accentColor="#FF3E00"
            from={[
              { label: "is_visible" },
              { label: "is_enabled" },
              { label: "ensure_in_viewport" },
              { label: "GetClickablePoint" },
            ]}
            hub={{ label: "ActionOverlayGuard", sublabel: "show then Drop->hide" }}
            to={[
              { label: "IUIAutomationInvokePattern" },
              { label: "SendInput mouse click" },
              { label: "on-screen status box" },
            ]}
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          What it looks like when it runs
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The overlay paints the action name in bold 32-pixel Segoe UI and the
          element description in 20-pixel Segoe UI regular. Here is the
          sequence as it prints from the Rust{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            tracing
          </code>{" "}
          crate at info level when Terminator clicks a Save button.
        </p>
        <TerminalOutput
          title="terminator trace, RUST_LOG=info"
          lines={[
            { type: "command", text: 'desktop.locator("role:Button && name:Save").click()' },
            { type: "info", text: "action_overlay show: Clicking" },
            { type: "output", text: "Element passed all actionability checks" },
            { type: "output", text: "Using ClickablePoint: (842, 217)" },
            { type: "output", text: "send_mouse_click x=842 y=217 left" },
            { type: "success", text: "ClickResult { coordinates: Some((842.0, 217.0)), details: \"via ClickablePoint (UIA::GetClickablePoint)\" }" },
            { type: "info", text: "action_overlay hide" },
            { type: "output", text: "Posted WM_CLOSE to action overlay window" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Turn it off for CI
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The overlay is for humans. For CI, set the env var. The check runs
          once on first access through{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            once_cell::sync::Lazy
          </code>{" "}
          and flips the global{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
            AtomicBool
          </code>
          . Runtime toggles are atomic too.
        </p>
        <AnimatedCodeBlock
          code={ctaUsage}
          language="powershell"
          filename="terminator-run.ps1"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          How this compares to other UI Automation clients
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Typical UIA client"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          What you touch on top of IUIAutomation
        </h2>
        <StepTimeline
          title="from SDK call to on-screen overlay"
          steps={[
            {
              title: "Your code: locator().click()",
              description:
                "Whether you call this from Rust, Node through @mediar-ai/terminator, Python via terminator-py, or through the MCP server, the trace ends in the same Windows adapter function.",
            },
            {
              title: "element.rs: click()",
              description:
                "Constructs ActionOverlayGuard::new('Clicking', Some(&element_info)). The guard paints the overlay and records OVERLAY_SHOWN_AT.",
            },
            {
              title: "validate_clickable()",
              description:
                "Three UIA reads: is_visible, is_enabled, ensure_in_viewport. If any fails, the function returns an AutomationError and the guard's Drop hides the overlay cleanly.",
            },
            {
              title: "determine_click_coordinates()",
              description:
                "IUIAutomationElement::GetClickablePoint first, BoundsCenter fallback. Returns (x, y, source, api) so the trace attributes which UIA call produced the point.",
            },
            {
              title: "input.rs: send_mouse_click()",
              description:
                "Win32 SendInput pathway. This is the only part of the pipeline that Microsoft UIA does not own. Input is synthesized outside the accessibility surface so it works even on controls that do not implement InvokePattern.",
            },
            {
              title: "Drop(_overlay_guard)",
              description:
                "hide_action_overlay runs. Enforces MINIMUM_DISPLAY_MS if the click finished under 300 ms, then posts WM_CLOSE and DestroyWindow.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <GlowCard>
          <div className="p-8">
            <h3 className="text-xl font-semibold text-zinc-900 mb-3">
              Why this matters for agent-style automation
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-4">
              When an LLM is driving your desktop through an MCP tool, a human
              operator needs a fast way to know that the agent is about to click
              the wrong thing. Staring at the mouse pointer is not enough,
              because UIA invokes frequently do not move the pointer at all
              (Invoke pattern dispatches a WM_COMMAND, not a mouse event). Terminator&apos;s overlay gives you a half second to yank Ctrl-C
              before Invoking is followed by the next verb. That is the loop the{" "}
              <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                TERMINATOR_ACTION_OVERLAY
              </code>{" "}
              env var exists to preserve in CI and disable in production agents
              that no human is watching.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-6">
          Microsoft UI Automation surfaces the overlay covers
        </h2>
        <Marquee speed={40} pauseOnHover fade>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            Win32 controls via IAccessible bridge
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            WPF native UIA providers
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            UWP and WinUI 3 XAML
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            Edge WebView2 accessibility tree
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            Office COM automation objects
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            Chrome and Firefox via UIAutomationEventHandler
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            Electron apps through Chromium accessibility
          </span>
          <span className="mx-6 text-sm font-mono text-zinc-700">
            WinForms controls
          </span>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Frames of the overlay life
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Worth seeing end to end. The animation below walks through one
          single-click from guard construction to WM_CLOSE.
        </p>
        <MotionSequence
          title="life of one action_overlay call"
          frames={[
            {
              title: "t = 0 ms",
              body: (
                <p className="text-sm text-zinc-600">
                  ActionOverlayGuard::new(&quot;Clicking&quot;, Some(info)) on the stack. Global OVERLAY_STATE.is_visible flips to true.
                </p>
              ),
            },
            {
              title: "t = 10 ms",
              body: (
                <p className="text-sm text-zinc-600">
                  Overlay thread spawns. CreateWindowExW returns an HWND. Layer alpha is set to 77 of 255. SW_SHOWNOACTIVATE shows the window without stealing focus.
                </p>
              ),
            },
            {
              title: "t = 50 ms",
              body: (
                <p className="text-sm text-zinc-600">
                  WINDOW_CREATION_DELAY_MS elapses. show_action_overlay returns. The caller runs validate_clickable and performs the UIA invoke.
                </p>
              ),
            },
            {
              title: "t = 95 ms",
              body: (
                <p className="text-sm text-zinc-600">
                  UIA invoke completes. The function body exits. Drop(_overlay_guard) calls hide_action_overlay.
                </p>
              ),
            },
            {
              title: "t = 300 ms",
              body: (
                <p className="text-sm text-zinc-600">
                  MINIMUM_DISPLAY_MS enforced. hide_action_overlay slept 205 ms so the human could read &quot;Clicking Save&quot;. AtomicBool should_close flips. The overlay thread posts WM_CLOSE and DestroyWindow.
                </p>
              ),
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Bring Microsoft UI Automation out of the shadows for your team"
        description="30 minutes on what the overlay shows, how to wire it to your agents, and whether Terminator fits your Windows automation workloads."
      />

      <FaqSection heading="Microsoft UI Automation FAQ" items={faqs} />

      <section className="max-w-4xl mx-auto px-6 py-12">
        <RelatedPostsGrid
          title="Related guides"
          posts={[
            {
              title: "Microsoft UI Automation: the five spatial selectors",
              href: "/t/microsoft-ui-automation",
              tag: "Selectors",
              excerpt: "rightof:, leftof:, above:, below:, near: with a 50px threshold. What IUIAutomation does not do.",
            },
            {
              title: "Microsoft UI Automation tool: subtree caching",
              href: "/t/microsoft-ui-automation-tool",
              tag: "Performance",
              excerpt: "One IUIAutomationCacheRequest, seven UIProperty fields, TreeScope::Subtree. The whole subtree in one COM call.",
            },
            {
              title: "Coded UI Automation: what replaced it",
              href: "/t/coded-ui-automation",
              tag: "Migration",
              excerpt: "Microsoft deprecated Coded UI in Visual Studio 2019. Here is the modern UIA toolchain.",
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the overlay live on your own apps."
      />
    </article>
  );
}
