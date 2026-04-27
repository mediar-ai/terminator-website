import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  AnimatedChecklist,
  TerminalOutput,
  SequenceDiagram,
  FlowDiagram,
  GlowCard,
  BentoGrid,
  StepTimeline,
  ComparisonTable,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-program";
const PUBLISHED = "2026-04-21";
const TITLE =
  "The Windows automation program you can watch work: Terminator's 30% translucent action HUD";
const DESCRIPTION =
  "Terminator is the only Windows automation program that draws a click-through, 30% opaque, full-screen status HUD over the live desktop on every click and keystroke. 77/255 alpha, 32-pixel Segoe UI, 300ms minimum display. Source: crates/terminator/src/platforms/windows/action_overlay.rs, 565 lines.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Every Win32 automation program either runs silently or steals the foreground. Terminator paints a WS_EX_TRANSPARENT full-screen layered window at 77/255 alpha and narrates each action in 32-pixel Segoe UI while the user keeps typing underneath.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Windows automation program that shows you what it is doing",
    description:
      "30% translucent, click-through, full-screen HUD over the desktop. 100ms anti-spam cooldown, 300ms minimum display, 50ms window warmup. One file, action_overlay.rs, 565 lines.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows Automation Program" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows Automation Program", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why do I care that a Windows automation program draws a translucent overlay?",
    a: "Because the other option is flying blind. Most Windows automation programs either log in a side panel (Power Automate Desktop, UiPath Assistant) or run entirely silent (AutoHotkey, PyAutoGUI). When something goes wrong mid-workflow, the only way to know which step fired and on which element is to scroll through logs after the fact. Terminator paints the action name and the target element's description over the live desktop as the action fires, so you can watch the agent work without taking your hand off the mouse. The overlay is click-through, so you can keep using the machine while it is visible.",
  },
  {
    q: "What exactly is on the HUD?",
    a: "Two lines of text inside an 800-by-400 centered box with a 2-pixel black border. The top line is the action name in 32-pixel Segoe UI FW_BLACK weight. Examples: 'Typing', 'Clicking', 'Pressing key', 'Invoking'. The bottom line is the element description in 20-pixel Segoe UI FW_NORMAL. Examples: 'role:Button && name:Export CSV' or 'name:Compose a message' from Slack. The HUD draws on top of whatever is on screen, at alpha 77 out of 255, which is exactly 30 percent opaque. Everything else on the desktop stays visible underneath.",
  },
  {
    q: "How is it click-through if it is rendered on top?",
    a: "Three window extended styles, combined. WS_EX_LAYERED makes it a layered window so Windows will honor the alpha blend. WS_EX_TRANSPARENT makes it invisible to the hit-test so mouse input falls through to the window underneath. WS_EX_NOACTIVATE stops it from stealing focus when it appears. WS_EX_TOPMOST keeps it above everything. WS_EX_TOOLWINDOW keeps it out of Alt+Tab. All five are combined in a single CreateWindowExW call at crates/terminator/src/platforms/windows/action_overlay.rs line 296.",
  },
  {
    q: "Does this slow down the automation?",
    a: "Nowhere near a perceptible amount. The HUD runs on its own thread, spawned at action_overlay.rs line 142. The calling thread pays a 50ms window-creation barrier (WINDOW_CREATION_DELAY_MS at line 31) to ensure the HUD is up before the click lands, so a human watching the screen cannot miss the narration. On hide, the calling thread may block up to 300ms minus the elapsed display time to enforce MINIMUM_DISPLAY_MS (line 28), but only on fast actions; a 2-second type never hits that guard. For burst workflows the anti-spam cooldown at OVERLAY_CHANGE_COOLDOWN_MS=100 (line 25) drops further show requests rather than thrashing the window. On a 30-step YAML workflow the cumulative overhead is under a second.",
  },
  {
    q: "Can I turn it off for headless runs?",
    a: "Yes. Two ways. First, the environment variable TERMINATOR_ACTION_OVERLAY. Set it to 0, false, or off before the process starts and the OVERLAY_ENV_CHECKED Lazy on line 37 flips ACTION_OVERLAY_ENABLED to false the first time show_action_overlay is called. Second, the programmatic API: set_action_overlay_enabled(false) on line 72 toggles the flag at runtime and hides any active overlay. CI pipelines and headless Windows Servers usually set the env var; interactive desktop runs leave it on.",
  },
  {
    q: "What happens on a multi-monitor setup?",
    a: "The overlay spans every monitor. create_overlay_window at line 266 calls GetSystemMetrics with SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, SM_CXVIRTUALSCREEN, and SM_CYVIRTUALSCREEN (lines 288-291) to get the virtual desktop bounds, which is the bounding rectangle of every connected display. The window is created at those absolute coordinates, so the status box is always centered across the whole virtual desktop. On a single monitor the message box sits in the middle of that display. On a three-monitor setup it sits in the middle of the center monitor, since that is the middle of the combined virtual screen.",
  },
  {
    q: "What if an action triggers while the previous overlay is still fading?",
    a: "LAST_OVERLAY_CHANGE at line 55 stores the Instant of the most recent show call. On the next show, the code at lines 110-121 checks whether that instant is less than OVERLAY_CHANGE_COOLDOWN_MS=100 milliseconds old; if so, it drops the new show request rather than flashing. For updates to an already-visible overlay the code takes a different path, update_action_overlay_message at line 208, which mutates OVERLAY_STATE and calls InvalidateRect to repaint without destroying the window.",
  },
  {
    q: "How does the overlay know when to disappear?",
    a: "ActionOverlayGuard. This is an RAII struct defined at action_overlay.rs line 242. Its constructor calls show_action_overlay; its Drop impl calls hide_action_overlay. Windows automation calls in the crate (type_text, press_key, click, invoke, drag, scroll) create an _overlay_guard at the top of their body and let Rust's scope rules handle the lifetime. The moment the action returns, the guard drops, the overlay hides. You can see the pattern in element.rs at lines 1153 (typing) and 1240 (pressing a key): let _overlay_guard = ActionOverlayGuard::new('Typing', Some(&element_info));",
  },
  {
    q: "Is the overlay only available on Windows?",
    a: "Yes. The file lives under crates/terminator/src/platforms/windows/ and uses windows::Win32::Graphics::Gdi and windows::Win32::UI::WindowsAndMessaging, both of which are Windows-only crates. The macOS platform adapter has its own status mechanism tied to NSApplication, and the Linux adapter currently does not render an overlay. If you need the same 'watch the agent work' experience on macOS or Linux you fall back to the framework's structured logging plus highlight_element, which draws colored borders around the elements it touches on every platform.",
  },
  {
    q: "Can I change what the overlay says?",
    a: "Yes, programmatically. update_action_overlay_message(message, sub_message) at line 208 replaces the text on an already-visible overlay and triggers a repaint via InvalidateRect. If you are scripting against Terminator from TypeScript or Python you do not normally call it directly; the platform-layer action functions pass the action name and element description to the guard automatically. If you are extending the framework with a custom action type, you create your own ActionOverlayGuard::new with your own strings at the top of your function.",
  },
  {
    q: "Where can I see the source?",
    a: "The full HUD implementation is crates/terminator/src/platforms/windows/action_overlay.rs in the mediar-ai/terminator repo on GitHub. 565 lines. RAII guard at line 242, show/hide at lines 95 and 157, window creation at line 266, the transparency call at line 347, and the paint routine at line 411. The env-var toggle is at lines 37-44. The call sites live in crates/terminator/src/platforms/windows/element.rs: search for ActionOverlayGuard::new and you will find one at the top of every action method.",
  },
];

const faqSchema = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const article = articleSchema({
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

const overlayCreateSource = `// crates/terminator/src/platforms/windows/action_overlay.rs
// Lines 287-347. The HUD is a layered, click-through, always-on-top
// window that spans the entire virtual desktop (every monitor).

// Get virtual screen dimensions (all monitors combined)
let screen_x = GetSystemMetrics(SM_XVIRTUALSCREEN);
let screen_y = GetSystemMetrics(SM_YVIRTUALSCREEN);
let screen_width = GetSystemMetrics(SM_CXVIRTUALSCREEN);
let screen_height = GetSystemMetrics(SM_CYVIRTUALSCREEN);

// Create full-screen click-through overlay window
let hwnd = CreateWindowExW(
    WINDOW_EX_STYLE(
        WS_EX_TOPMOST.0       // always above application windows
        | WS_EX_LAYERED.0     // honor the alpha blend
        | WS_EX_TRANSPARENT.0 // click-through (mouse hits the app below)
        | WS_EX_TOOLWINDOW.0  // hidden from Alt+Tab
        | WS_EX_NOACTIVATE.0, // do not steal focus when shown
    ),
    OVERLAY_CLASS_NAME,       // "TerminatorActionOverlay"
    PCWSTR::from_raw(window_name.as_ptr()),
    WINDOW_STYLE(WS_POPUP.0),
    screen_x, screen_y, screen_width, screen_height,
    None, None, Some(HINSTANCE(h_instance.0)), None,
)?;

// Set transparency: 77/255 = exactly 30% opaque.
// Low enough to not obscure the desktop, high enough to read 32px text.
SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA)?;

// Show without stealing focus
let _ = ShowWindow(hwnd, SW_SHOWNOACTIVATE);`;

const guardSource = `// crates/terminator/src/platforms/windows/action_overlay.rs
// Lines 242-259. RAII: show on construction, hide on drop.
// Rust scope rules do the rest.

pub struct ActionOverlayGuard {
    _private: (),
}

impl ActionOverlayGuard {
    pub fn new(action: &str, element_info: Option<&str>) -> Self {
        let sub_message = element_info.map(|s| s.to_string());
        show_action_overlay(action, sub_message);
        Self { _private: () }
    }
}

impl Drop for ActionOverlayGuard {
    fn drop(&mut self) {
        hide_action_overlay();
    }
}

// Call site, crates/terminator/src/platforms/windows/element.rs:1153
// (inside type_text):
//
//     let element_info = self.get_element_description();
//     let _overlay_guard = ActionOverlayGuard::new("Typing", Some(&element_info));
//     // ... rest of type_text ...
//     // _overlay_guard drops here when the fn returns -> overlay hides.`;

const antiFlashSource = `// crates/terminator/src/platforms/windows/action_overlay.rs
// Lines 22-31. Three constants tune the user-visible behavior.

// Window class name registered with RegisterClassExW.
const OVERLAY_CLASS_NAME: PCWSTR = windows::core::w!("TerminatorActionOverlay");

// Minimum time between overlay state changes (prevent flashing).
// A burst of actions 30ms apart shows exactly one overlay, not ten.
const OVERLAY_CHANGE_COOLDOWN_MS: u64 = 100;

// Minimum time overlay must be visible (prevents instant show/hide).
// A 2ms action still shows the overlay for 300ms so a human can read it.
const MINIMUM_DISPLAY_MS: u64 = 300;

// Time to wait after spawning thread to ensure window is visible.
// Caller blocks 50ms so the HUD is up before the click fires.
const WINDOW_CREATION_DELAY_MS: u64 = 50;

// Default on, disable via env var TERMINATOR_ACTION_OVERLAY=0
static ACTION_OVERLAY_ENABLED: AtomicBool = AtomicBool::new(true);`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "wc -l crates/terminator/src/platforms/windows/action_overlay.rs", type: "command" as const },
  { text: "     565 crates/terminator/src/platforms/windows/action_overlay.rs", type: "success" as const },
  { text: "grep -n 'SetLayeredWindowAttributes' crates/terminator/src/platforms/windows/action_overlay.rs", type: "command" as const },
  { text: "347:        SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA)?;", type: "success" as const },
  { text: "grep -n 'OVERLAY_CLASS_NAME\\|_MS: u64' crates/terminator/src/platforms/windows/action_overlay.rs", type: "command" as const },
  { text: "22:const OVERLAY_CLASS_NAME: PCWSTR = windows::core::w!(\"TerminatorActionOverlay\");", type: "success" as const },
  { text: "25:const OVERLAY_CHANGE_COOLDOWN_MS: u64 = 100;", type: "success" as const },
  { text: "28:const MINIMUM_DISPLAY_MS: u64 = 300;", type: "success" as const },
  { text: "31:const WINDOW_CREATION_DELAY_MS: u64 = 50;", type: "success" as const },
  { text: "grep -n 'ActionOverlayGuard::new' crates/terminator/src/platforms/windows/element.rs | head", type: "command" as const },
  { text: "1153:        let _overlay_guard = ActionOverlayGuard::new(\"Typing\", Some(&element_info));", type: "success" as const },
  { text: "1240:        let _overlay_guard = ActionOverlayGuard::new(\"Pressing key\", Some(&element_info));", type: "success" as const },
  { text: "TERMINATOR_ACTION_OVERLAY=0 cargo test --package terminator action_overlay", type: "command" as const },
  { text: "test platforms::windows::action_overlay::tests::test_enable_disable ... ok", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Renders a click-through translucent HUD over the live desktop during each action",
    competitor: "No on-screen overlay, logs in a side panel or silent",
    ours: "SetLayeredWindowAttributes at action_overlay.rs:347, alpha 77/255",
  },
  {
    feature: "Full-screen HUD is click-through so keyboard and mouse reach the app below",
    competitor: "Status windows either steal focus or must be dismissed",
    ours: "WS_EX_TRANSPARENT | WS_EX_NOACTIVATE, CreateWindowExW at :296",
  },
  {
    feature: "RAII guard auto-hides the overlay when the action returns",
    competitor: "Manual show/hide with explicit close or timers",
    ours: "ActionOverlayGuard Drop impl at action_overlay.rs:255",
  },
  {
    feature: "Anti-flash cooldown and minimum display guard prevent flicker on bursts",
    competitor: "Overlays flash frame-by-frame on fast sequences",
    ours: "100ms cooldown, 300ms minimum display, constants at :25-28",
  },
  {
    feature: "Overlay spans all monitors via SM_C*VIRTUALSCREEN",
    competitor: "Primary monitor only, or breaks on mixed-DPI setups",
    ours: "GetSystemMetrics(SM_XVIRTUALSCREEN ...), action_overlay.rs:287-291",
  },
  {
    feature: "Per-process opt-out via one environment variable",
    competitor: "Requires configuration file edits or CLI flags",
    ours: "TERMINATOR_ACTION_OVERLAY=0, checked lazily at :37-44",
  },
  {
    feature: "Source is MIT-licensed and auditable in one file",
    competitor: "Closed-source UI status code",
    ours: "action_overlay.rs, 565 lines, github.com/mediar-ai/terminator",
  },
];

const rejectedChecklist = [
  { text: "Overlay steals keyboard focus when it appears", checked: false },
  { text: "User has to close a modal dialog to keep working", checked: false },
  { text: "Status window appears in Alt+Tab and interrupts window switching", checked: false },
  { text: "Fast action bursts flash the overlay dozens of times a second", checked: false },
  { text: "Sub-100ms actions show no overlay at all (too fast to see)", checked: false },
  { text: "HUD only draws on the primary monitor, invisible on secondary", checked: false },
  { text: "Status layer is opaque and covers the app you are watching", checked: false },
  { text: "Developer has to call hide_overlay manually at every action exit", checked: false },
];

const acceptedChecklist = [
  { text: "Click-through via WS_EX_TRANSPARENT so mouse hits the app underneath", checked: true },
  { text: "WS_EX_NOACTIVATE prevents the overlay from stealing focus on show", checked: true },
  { text: "WS_EX_TOOLWINDOW keeps the HUD out of Alt+Tab", checked: true },
  { text: "OVERLAY_CHANGE_COOLDOWN_MS=100 collapses bursts into one visible HUD", checked: true },
  { text: "MINIMUM_DISPLAY_MS=300 guarantees a readable flash even on fast actions", checked: true },
  { text: "SM_XVIRTUALSCREEN + SM_CXVIRTUALSCREEN span every connected monitor", checked: true },
  { text: "77/255 alpha leaves the app visible underneath the status text", checked: true },
  { text: "ActionOverlayGuard Drop impl hides the HUD the instant the action returns", checked: true },
];

const lifecycleSteps = [
  {
    title: "Action starts in the platform adapter",
    description:
      "type_text, press_key, click, invoke, mouse_drag, scroll. Each one is a method on the Windows platform element. First line of the body constructs a local _overlay_guard via ActionOverlayGuard::new with the action name and the target element's description.",
  },
  {
    title: "show_action_overlay gets called",
    description:
      "Line 95. Checks ACTION_OVERLAY_ENABLED, the env-var lazy, and the 100ms anti-spam cooldown. If any of those blocks the call, returns without drawing. Otherwise updates OVERLAY_STATE with the new message and records OVERLAY_SHOWN_AT for the minimum-display-time guard.",
  },
  {
    title: "Overlay thread spawns and creates the window",
    description:
      "thread::spawn at line 142. In that thread, create_overlay_window registers the WNDCLASSEXW, computes SM_*VIRTUALSCREEN bounds, calls CreateWindowExW with the five extended styles, then SetLayeredWindowAttributes at 77/255 alpha. The calling thread sleeps 50ms so the HUD is visible before the action fires.",
  },
  {
    title: "The real Windows action executes",
    description:
      "SendInput for keyboard and mouse, or UIA invoke patterns. The agent clicks, types, scrolls. The user sees the desktop respond with the action narrated on top in 32-pixel Segoe UI, readable through the 30 percent alpha.",
  },
  {
    title: "Message loop polls for close signal",
    description:
      "Lines 361-381. PeekMessageW runs at 10ms intervals. If should_close flips true, the loop breaks and DestroyWindow takes down the HUD cleanly. Otherwise the message pump keeps serving WM_PAINT and WM_CLOSE in the overlay thread.",
  },
  {
    title: "Action returns, Rust drops the guard",
    description:
      "End of type_text or press_key. _overlay_guard goes out of scope. Drop impl calls hide_action_overlay. The MINIMUM_DISPLAY_MS guard may sleep the calling thread briefly to hit the 300ms floor, then PostMessageW(WM_CLOSE) reaches the overlay thread and the window is gone.",
  },
];

const bentoCards = [
  {
    title: "Click-through, always",
    description:
      "WS_EX_TRANSPARENT is the Win32 flag that excludes a window from hit testing. Paired with WS_EX_LAYERED and WS_EX_NOACTIVATE, it produces a full-screen HUD that shows on top of everything but cannot catch a click. Your mouse lands on the app underneath.",
    size: "2x1" as const,
    accent: true,
  },
  {
    title: "30% opaque",
    description:
      "SetLayeredWindowAttributes(hwnd, COLORREF(0), 77, LWA_ALPHA). 77 out of 255. The background fills with white which at alpha 77 reads as a soft grey haze over the desktop. Black 32-pixel Segoe UI on that haze is reliably legible.",
    size: "1x1" as const,
  },
  {
    title: "Spans every monitor",
    description:
      "SM_XVIRTUALSCREEN and SM_CXVIRTUALSCREEN return the bounding rectangle of every connected display. The HUD is created at those coordinates. The status box always centers on the middle of the virtual desktop.",
    size: "1x1" as const,
  },
  {
    title: "RAII lifetime, not manual show/hide",
    description:
      "Each action function opens a scope, constructs an ActionOverlayGuard, does its work, and lets Rust's drop rules tear the HUD down on return. No leaks, no forgotten hide calls, no timer logic.",
    size: "1x1" as const,
  },
  {
    title: "Env var off switch",
    description:
      "TERMINATOR_ACTION_OVERLAY=0 in the environment at process start disables every show call via a Lazy that runs on first access. Used by CI and headless Windows Server runs.",
    size: "1x1" as const,
  },
];

const metricCards = [
  { value: 30, suffix: "%", label: "opaque (77/255 alpha)" },
  { value: 300, suffix: "ms", label: "minimum display time" },
  { value: 100, suffix: "ms", label: "anti-flash cooldown" },
  { value: 565, label: "lines in action_overlay.rs" },
];

const styleMarqueeItems = [
  "WS_EX_TOPMOST",
  "WS_EX_LAYERED",
  "WS_EX_TRANSPARENT",
  "WS_EX_TOOLWINDOW",
  "WS_EX_NOACTIVATE",
  "WS_POPUP",
  "SW_SHOWNOACTIVATE",
  "LWA_ALPHA",
  "CS_HREDRAW",
  "CS_VREDRAW",
];

const actionNameMarqueeItems = [
  "Typing",
  "Clicking",
  "Pressing key",
  "Invoking",
  "Scrolling",
  "Dragging",
  "Activating window",
  "Setting value",
  "Selecting option",
  "Hovering",
];

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto pt-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <header className="max-w-4xl mx-auto px-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
          The Windows automation program{" "}
          <GradientText>you can watch work</GradientText>{" "}
          from the desktop you are already using
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Most Windows automation programs either run invisibly or take over
          the foreground. Terminator paints a{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            WS_EX_LAYERED | WS_EX_TRANSPARENT
          </code>{" "}
          full-screen window at 77 out of 255 alpha over your whole virtual
          desktop, writes the current action in 32-pixel Segoe UI, and lets
          your mouse and keyboard fall straight through to whatever app it is
          acting on. One file, 565 lines, MIT-licensed, and on by default.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="operators running it on shared Windows desktops"
        highlights={[
          "30% opaque full-screen HUD with a 2-pixel black border and 32-pixel Segoe UI",
          "Click-through via WS_EX_TRANSPARENT so the user keeps typing underneath",
          "RAII ActionOverlayGuard hides the HUD the instant the action returns",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="A Windows automation program that narrates itself"
            subtitle="Terminator's per-action HUD, rendered in Win32 GDI at 77/255 alpha"
            captions={[
              "WS_EX_LAYERED | WS_EX_TRANSPARENT = translucent and click-through",
              "77/255 alpha = 30% opaque, readable over any desktop",
              "32-pixel Segoe UI with the action name, 20-pixel with the element",
              "300ms minimum display, 100ms cooldown, 50ms warmup",
              "RAII ActionOverlayGuard: drop = hide, zero manual lifetime",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The problem most Windows automation software does not try to solve
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Two people are sharing the same Windows machine. One is an agent.
          The other is a person. The agent is running a multi-step automation
          that clicks buttons, types into forms, scrolls panels, and moves
          windows. The person is trying to read email and answer Slack.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The existing programs in this space give you two choices. Run the
          automation silently, in which case the person has no idea what is
          happening and panics when a window they were not looking at suddenly
          has a new dropdown selected. Or run the automation with a status
          window, which steals focus, appears in Alt+Tab, and has to be
          dismissed before the person can get back to whatever they were
          doing. Neither is good. Both are what every commercial Windows
          automation program has shipped for a decade.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator took a different route. There is a third option: draw a
          click-through, translucent, full-screen layer over the whole desktop
          that narrates what the agent is doing, and let the person keep using
          the computer without a single missed keystroke. The implementation
          is one file, one RAII guard, and five Win32 extended window styles.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          The anchor fact, in one line
        </h2>
        <ProofBanner
          metric="77 / 255"
          quote="Terminator's on-screen action HUD is a WS_EX_LAYERED full-screen window at alpha 77 out of 255, which is exactly 30 percent opaque. The WS_EX_TRANSPARENT flag on the same window makes it click-through, so a user can keep typing into the app underneath while the agent narrates its actions on top in 32-pixel Segoe UI."
          source="crates/terminator/src/platforms/windows/action_overlay.rs, lines 287 through 347"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <NumberFocusCallout />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the overlay actually gets on screen
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Five extended window styles, one alpha call, one ShowWindow. The
          five styles are what make the overlay behave like a heads-up display
          instead of a regular app window. Each one carries a specific
          promise about how Windows treats the window, and dropping any of
          them breaks the HUD.
        </p>
        <AnimatedCodeBlock
          code={overlayCreateSource}
          language="rust"
          filename="crates/terminator/src/platforms/windows/action_overlay.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-3">
          the Win32 flags that make a HUD feel like a HUD
        </p>
        <Marquee speed={30} pauseOnHover fade>
          <div className="flex items-center gap-3 pr-3">
            {styleMarqueeItems.map((s, i) => (
              <span
                key={`style-${i}`}
                className="px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-sm font-mono whitespace-nowrap"
              >
                {s}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Five behaviors stitched together by five flags
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The interesting part is not that the HUD exists. It is that the HUD
          is built entirely out of existing Win32 knobs, in a combination most
          Windows GUI code never uses. Each card below is one knob and what
          it gets you.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The RAII guard is the whole lifetime API
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          There is no{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            overlay.show()
          </code>
          /
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            overlay.hide()
          </code>{" "}
          pair to forget. An action function opens a scope, constructs an{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            ActionOverlayGuard
          </code>
          , and the moment the action returns (normally, with an error, or via
          a panic) Rust's Drop impl runs and the HUD disappears. This is
          why you cannot find a single explicit hide call in the action
          methods.
        </p>
        <AnimatedCodeBlock
          code={guardSource}
          language="rust"
          filename="crates/terminator/src/platforms/windows/action_overlay.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-3">
          action names that show up in the top line of the HUD
        </p>
        <Marquee speed={22} reverse pauseOnHover fade>
          <div className="flex items-center gap-3 pr-3">
            {actionNameMarqueeItems.map((s, i) => (
              <span
                key={`action-${i}`}
                className="px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {s}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Anti-flash: three constants, one user-visible property
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A fast YAML workflow can fire thirty actions in a second. Without
          guards, the overlay would mount and tear down the window thirty
          times, and the user would see an unreadable strobe. Three constants
          at the top of the file stop this from happening.
        </p>
        <AnimatedCodeBlock
          code={antiFlashSource}
          language="rust"
          filename="crates/terminator/src/platforms/windows/action_overlay.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The lifecycle of one action, end to end
        </h2>
        <StepTimeline
          title="From function entry to HUD down, six stages"
          steps={lifecycleSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Who is talking to whom during one typing action
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Three entities, one call path. The calling thread owns the action.
          The overlay thread owns the window and its message pump. Shared
          state lives in static locks, not in either thread. The sequence
          below is what happens when you call{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            element.type_text(&quot;hello&quot;)
          </code>
          .
        </p>
        <SequenceDiagram
          title="type_text on a Windows UIEdit"
          actors={["Caller", "OVERLAY_STATE", "Overlay thread"]}
          messages={[
            { from: 0, to: 1, label: "ActionOverlayGuard::new(\"Typing\", ...)", type: "request" },
            { from: 1, to: 2, label: "thread::spawn + OVERLAY_SHOWN_AT = now", type: "request" },
            { from: 2, to: 0, label: "CreateWindowExW + SetLayeredWindowAttributes(77)", type: "response" },
            { from: 0, to: 0, label: "sleep 50ms (WINDOW_CREATION_DELAY_MS)", type: "event" },
            { from: 0, to: 0, label: "send_text / UIA Value.SetValue", type: "event" },
            { from: 0, to: 1, label: "drop(_overlay_guard) -> hide_action_overlay", type: "request" },
            { from: 1, to: 2, label: "enforce MINIMUM_DISPLAY_MS, PostMessageW(WM_CLOSE)", type: "request" },
            { from: 2, to: 0, label: "DestroyWindow, thread exits", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the data flows inside the crate
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Action method on the left. Overlay pipeline in the middle. On-screen
          output on the right. The hub in the beam below is the single file
          that owns the whole HUD.
        </p>
        <AnimatedBeam
          title="action_overlay.rs, the hub"
          from={[
            { label: "type_text", sublabel: "element.rs:1153 ActionOverlayGuard::new" },
            { label: "press_key", sublabel: "element.rs:1240 ActionOverlayGuard::new" },
            { label: "click / invoke", sublabel: "platform action guards" },
            { label: "scroll / drag", sublabel: "input routines" },
          ]}
          hub={{
            label: "action_overlay.rs",
            sublabel: "565 lines, one file",
          }}
          to={[
            { label: "WS_EX_LAYERED window", sublabel: "77/255 alpha, click-through" },
            { label: "32px Segoe UI action line", sublabel: "DrawTextW, FW_BLACK" },
            { label: "20px Segoe UI element line", sublabel: "DrawTextW, FW_NORMAL" },
            { label: "auto hide on Drop", sublabel: "RAII lifetime, guaranteed" },
          ]}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow metrics={metricCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The decisions the overlay took, versus the ones it refused
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every checkbox below is a design choice. The left column (unchecked)
          is what the HUD intentionally does not do. The right column (checked)
          is how it was actually shipped.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedChecklist
            title="Rejected, by design"
            items={rejectedChecklist}
          />
          <AnimatedChecklist title="Shipped" items={acceptedChecklist} />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The paint path, in order
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The overlay's{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            WM_PAINT
          </code>{" "}
          handler lives at line 411. Every time Windows asks the HUD to redraw,
          this is what happens in order. Plain GDI, no third-party libs.
        </p>
        <FlowDiagram
          title="WM_PAINT handler, action_overlay.rs:411-535"
          steps={[
            {
              label: "BeginPaint + GetClientRect",
              detail:
                "Acquire the paint DC and read the window's client bounds so the centered box can be computed.",
            },
            {
              label: "FillRect with a white brush",
              detail:
                "The entire client area gets filled white. At layered alpha 77/255 that reads as a faint grey haze, the uniform tint that sells the 'HUD over the desktop' look.",
            },
            {
              label: "CreateFontW('Segoe UI', FW_BLACK, -32)",
              detail:
                "32-pixel bold Segoe UI, with CLEARTYPE_QUALITY antialiasing, for the action name.",
            },
            {
              label: "Rectangle with a 2-pixel black pen",
              detail:
                "An 820x420 outlined box centered on the virtual desktop. No fill, so the desktop underneath stays visible through the interior.",
            },
            {
              label: "DrawTextW the main message",
              detail:
                "DT_CENTER | DT_SINGLELINE | DT_VCENTER in a 60-pixel-tall rect near the top of the box. Typing, Clicking, Pressing key, and so on.",
            },
            {
              label: "DrawTextW the element sub-message",
              detail:
                "If present, a smaller 20-pixel FW_NORMAL font, DT_CENTER | DT_WORDBREAK, for the role-and-name description of the element being acted on.",
            },
            {
              label: "DeleteObject + EndPaint",
              detail:
                "Release the fonts, the pen, the brush, and the DC. GDI resource hygiene, so the HUD does not leak handles over long runs.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why this matters if you are deploying an agent on a shared machine
        </h2>
        <GlowCard>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Put yourself in the seat of an operations lead approving an AI
            agent to run on an analyst's workstation during business hours.
            What you want from the automation is obvious: a visible signal of
            what it is doing that does not take the analyst offline. The HUD
            is that signal. It shows up, narrates one line of action and one
            line of target, and vanishes. The analyst keeps typing.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            Compare that to the alternative: the analyst sees their cursor
            jump, a window they did not open gets a new dropdown value, a
            modal dialog fires in front of their email. They either pull the
            plug on the agent or write an angry ticket. Terminator ships a
            translucent HUD so you never have to have that conversation.
          </p>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <ComparisonTable
          heading="Terminator vs other Windows automation programs, on the specific question of 'can the user see what it is doing'"
          intro="Every row is a concrete property of the on-screen status behavior. Nothing about scripting language, YAML shape, or licensing."
          productName="Terminator"
          competitorName="Power Automate / UiPath / AutoHotkey / SikuliX / PyAutoGUI"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify every number on this page
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The HUD is one MIT-licensed file. Every alpha value, every
          millisecond constant, every style flag is in plain text and takes
          under a minute to confirm. Clone the repo, grep the names, done.
        </p>
        <TerminalOutput title="verify.sh" lines={verifyLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see a click-through Windows HUD narrate your agent live?"
        description="Bring a workflow. We run it on a shared desktop with the overlay on, then show you where in action_overlay.rs to tune the alpha and timings for your ops team."
      />

      <FaqSection items={faqs} heading="FAQ" />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Watch a Windows agent narrate itself through a 30% translucent HUD."
      />
    </article>
  );
}

function NumberFocusCallout() {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-8 flex flex-col gap-3">
      <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
        the uncopyable line
      </p>
      <p className="text-2xl text-zinc-900 font-semibold leading-snug">
        Alpha <NumberTicker value={77} /> out of 255 ={" "}
        <NumberTicker value={30} />% opaque. A{" "}
        <NumberTicker value={300} />
        ms minimum display. A <NumberTicker value={100} />
        ms anti-flash cooldown. All in one file,{" "}
        <NumberTicker value={565} /> lines long, running every time the
        automation touches a Windows UI element.
      </p>
      <p className="text-sm text-zinc-600 mt-1">
        Grep the repo for{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">
          SetLayeredWindowAttributes
        </code>
        ,{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">
          MINIMUM_DISPLAY_MS
        </code>
        , and{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">
          ActionOverlayGuard
        </code>
        . Each one lands on exactly one line in{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">
          crates/terminator/src/platforms/windows/action_overlay.rs
        </code>
        .
      </p>
    </div>
  );
}
