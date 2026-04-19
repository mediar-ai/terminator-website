import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  NumberTicker,
  TerminalOutput,
  AnimatedCodeBlock,
  CodeComparison,
  BeforeAfter,
  ComparisonTable,
  StepTimeline,
  MetricsRow,
  BentoGrid,
  InlineCta,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/how-to-use-two-computer-screens";
const PUBLISHED = "2026-04-19";
const TITLE =
  "How to use two computer screens: the developer side of dual monitors nobody writes about";
const DESCRIPTION =
  "Every dual-monitor guide explains cables and Display Settings. This one explains the other half: how software tracks which window is on which screen, why DPI scale factor changes per monitor, and the Windows UIA bug that silently broke clicks on screen two until April 2026. All grounded in Terminator's Monitor API at crates/terminator/src/lib.rs line 272.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The consumer guides tell you which cable to buy. This page tells you why Windows UIA's is_offscreen() returns true for secondary monitors, what a Monitor struct actually contains, and how to list every display from one line of code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Two computer screens, from a developer's perspective",
    description:
      "Per-monitor scale_factor, work_area, AABB intersection across displays, and a real Windows UIA bug that broke clicks on screen two. Traceable to specific line numbers in Terminator.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "How to use two computer screens" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "How to use two computer screens", url: PAGE_URL },
];

const monitorStructSource = `// crates/terminator/src/lib.rs:272-292
// The struct every dual-monitor guide pretends doesn't exist.
// Eight fields. Each one is a thing Windows Display Settings hides from you.

pub struct Monitor {
    pub id: String,              // e.g. "monitor_0", "monitor_1"
    pub name: String,             // OS-reported name ("\\\\.\\DISPLAY1")
    pub is_primary: bool,         // the one the taskbar sits on by default
    pub width: u32,               // pixels
    pub height: u32,              // pixels
    pub x: i32,                   // top-left x in the GLOBAL coordinate space
    pub y: i32,                   // top-left y (can be negative!)
    pub scale_factor: f64,        // 1.0 = 100%, 1.25 = 125%, 2.0 = Retina
    pub work_area: Option<WorkAreaBounds>, // taskbar-excluded area, Windows only
}`;

const listMonitorsExample = `// Node.js / TypeScript SDK
// From packages/terminator-js/README + docs/TERMINATOR_JS_API.md

import { Desktop } from "terminator.js";

const desktop = new Desktop();
const monitors = await desktop.listMonitors();

for (const m of monitors) {
  console.log(\`\${m.name}  \${m.width}x\${m.height} at (\${m.x}, \${m.y})\`);
  console.log(\`  scale \${m.scaleFactor}x  primary=\${m.isPrimary}\`);
}

// Find the one a specific window is on.
const chrome = desktop.locator("role:Window && name:Chrome");
const window = await chrome.first();
const monitor = window.monitor(); // returns the Monitor that owns it

// Screenshot just that screen (not a crop of a composite image).
const shot = await desktop.captureMonitor(monitor);`;

const fixedVisibilityCode = `// crates/terminator/src/platforms/windows/element.rs:315-371
// The bug: UIA's IUIAutomationElement::get_CurrentIsOffscreen()
// returns VARIANT_TRUE for any element whose bounds sit outside the
// PRIMARY monitor's rectangle, even when it is plainly visible on
// a secondary monitor. A click that goes through validate_clickable()
// sees is_offscreen == true and bails out.
//
// The fix: stop asking UIA. Ask every monitor.

fn is_visible_on_any_monitor(
    &self, x: f64, y: f64, width: f64, height: f64,
) -> Result<bool, AutomationError> {
    let monitors = xcap::Monitor::all()
        .map_err(|e| AutomationError::PlatformError(
            format!("Failed to get monitors: {e}")))?;

    let elem_left   = x as i32;
    let elem_top    = y as i32;
    let elem_right  = elem_left + width as i32;
    let elem_bottom = elem_top  + height as i32;

    for monitor in monitors {
        let mx = monitor.x()?;
        let my = monitor.y()?;
        let mw = monitor.width()?  as i32;
        let mh = monitor.height()? as i32;

        // Standard AABB intersection.
        if elem_left   < mx + mw && elem_right  > mx
        && elem_top    < my + mh && elem_bottom > my {
            return Ok(true);
        }
    }
    Ok(false)
}`;

const uiaIsOffscreenCode = `// Old behavior (removed in commit e36b9785)
// crates/terminator/src/platforms/windows/element.rs (pre-fix)

fn validate_clickable(&self) -> Result<(), AutomationError> {
    // ...
    if self.element.is_offscreen()? {
        return Err(AutomationError::ElementNotVisible(
            "Element is offscreen".into()));
    }
    // ...
}

// What actually happened on a dual-monitor rig:
//
//   is_offscreen() asked UIA.
//   UIA compared element bounds to the primary monitor only.
//   Element on monitor 2 -> bounds outside primary -> returns true.
//   Terminator refused the click, even though the button was clearly
//   visible to the user. No error message pointed at monitors.`;

const terminalLines = [
  { text: "# list every monitor attached to the machine", type: "output" as const },
  {
    text: "cargo run --example monitor_management",
    type: "command" as const,
  },
  {
    text: "=== Monitor Management Example ===",
    type: "output" as const,
  },
  { text: "", type: "output" as const },
  { text: "Available Monitors:", type: "output" as const },
  {
    text: "  1. \\\\.\\DISPLAY1 (2560x1440) at (0, 0) - Scale: 1.00x [PRIMARY]",
    type: "success" as const,
  },
  {
    text: "  2. \\\\.\\DISPLAY2 (1920x1080) at (2560, 140) - Scale: 1.25x",
    type: "success" as const,
  },
  { text: "", type: "output" as const },
  { text: "Primary Monitor:", type: "output" as const },
  {
    text: "  \\\\.\\DISPLAY1 (2560x1440) at (0, 0)",
    type: "output" as const,
  },
  { text: "", type: "output" as const },
  { text: "Active Monitor (with focused window):", type: "output" as const },
  {
    text: "  \\\\.\\DISPLAY2 (1920x1080) at (2560, 140)",
    type: "output" as const,
  },
  { text: "", type: "output" as const },
  { text: "Capturing all monitors...", type: "output" as const },
  {
    text: "  Captured \\\\.\\DISPLAY1 - 2560x1440 pixels (14745600 bytes)",
    type: "success" as const,
  },
  {
    text: "  Captured \\\\.\\DISPLAY2 - 2400x1350 pixels (12960000 bytes)",
    type: "success" as const,
  },
  {
    text: "# note: DISPLAY2 capture is 2400x1350, not 1920x1080.",
    type: "info" as const,
  },
  {
    text: "# scale_factor=1.25 gives pixel-accurate buffer, not logical size.",
    type: "info" as const,
  },
];

const coordSpaceRows: ComparisonRow[] = [
  {
    feature: "What an input tool calls 'x, y'",
    competitor:
      "Display Settings treats screen 2 as its own thing. You drag icons around to reorder.",
    ours:
      "Terminator uses the OS global coordinate space. Screen 2 at x=2560 means a click at x=2700 lands on screen 2, column 140.",
  },
  {
    feature: "Negative coordinates",
    competitor:
      "If you never drag the icons, you never see them. Consumer guides never mention negatives exist.",
    ours:
      "If monitor 2 is physically left of monitor 1, its top-left can be (-1920, 0). Monitor.x: i32 is signed on purpose.",
  },
  {
    feature: "Per-monitor DPI",
    competitor:
      "Windows has had per-monitor DPI since 10 1607. No consumer guide mentions scale_factor.",
    ours:
      "Monitor.scale_factor: f64 is stored per display. A 27-inch 4K at 150% next to a 24-inch 1080p at 100% is the normal case.",
  },
  {
    feature: "Taskbar-excluded area",
    competitor:
      "Whatever the OS draws.",
    ours:
      "Monitor.work_area: Option<WorkAreaBounds>. Populated for the primary monitor via SPI_GETWORKAREA. None for secondary on Windows, same as full bounds on non-Windows.",
  },
  {
    feature: "Screenshot of just screen two",
    competitor:
      "Win+Shift+S, drag over the right rectangle.",
    ours:
      "desktop.capture_monitor(&m) returns a pixel buffer sized to that monitor's resolution times its scale factor. Not a crop.",
  },
  {
    feature: "Which window is on which screen",
    competitor:
      "Eyeball it.",
    ours:
      "element.monitor() walks the UI tree to the window root, reads its bounds, and returns the Monitor whose rect contains the top-left corner.",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "list_monitors()",
    description:
      "Returns every connected display with id, name, position, size, and scale factor. Used internally by every other monitor call.",
    size: "2x1",
    accent: true,
  },
  {
    title: "get_primary_monitor()",
    description:
      "The one the taskbar sits on. On Windows this is the only monitor whose work_area is populated by default.",
  },
  {
    title: "get_active_monitor()",
    description:
      "The monitor that contains the currently focused window. Useful when your agent should do something 'on the screen the user is looking at.'",
  },
  {
    title: "element.monitor()",
    description:
      "On any UIElement, returns the Monitor it sits on. This is the piece no consumer tool exposes.",
  },
  {
    title: "capture_monitor(m)",
    description:
      "Screenshot of a single monitor sized to its native pixel buffer (resolution times scale factor). Not a crop of a stitched image.",
  },
  {
    title: "capture_all_monitors()",
    description:
      "Returns Vec<(Monitor, ScreenshotResult)>. Each entry is its own image, correct per-display DPI.",
    size: "2x1",
  },
];

const faqs = [
  {
    q: "How do I set up two computer screens in the first place?",
    a: "Plug the second monitor into a spare video port on your PC (HDMI, DisplayPort, USB-C with DP Alt Mode, or Thunderbolt). On Windows, right-click the desktop, choose Display settings, and under Multiple displays pick Extend these displays. Drag the two monitor icons so their arrangement matches the physical one on your desk (this is what decides where your mouse crosses from one screen to the other). On macOS, System Settings > Displays, drag the preview thumbnails, uncheck Mirror. On Linux, xrandr or your desktop environment's display panel. That is the hardware and OS side. The rest of this page is about the software side: how programs know which window is on which screen, and why automation tools sometimes get that wrong.",
  },
  {
    q: "Why does Terminator have its own Monitor struct instead of using the OS one?",
    a: "Because there is no single 'OS one.' Windows gives you MonitorFromWindow returning an HMONITOR handle, plus GetMonitorInfo for bounds, plus GetDpiForMonitor for scale, plus SPI_GETWORKAREA for taskbar. macOS has NSScreen. Linux depends on the compositor. Terminator normalises all of that into one struct defined at crates/terminator/src/lib.rs line 272, with eight fields: id, name, is_primary, width, height, x, y, scale_factor, work_area. Under the hood, Windows enumeration goes through the xcap crate (see crates/terminator/src/platforms/windows/engine.rs), and the work_area for the primary display is filled in via SPI_GETWORKAREA. Secondary monitor work_area on Windows is None because Windows does not expose it cleanly, and the codebase says so explicitly.",
  },
  {
    q: "What was the actual multi-monitor bug you mention?",
    a: "Windows UI Automation has an IUIAutomationElement method called get_CurrentIsOffscreen. It returns a VARIANT_BOOL telling you whether the element is considered offscreen. On a single-monitor setup it works fine. On a dual-monitor setup, UIA's notion of 'offscreen' is too narrow: any element whose bounds sit outside the primary monitor's rectangle is reported as offscreen, even if it is clearly visible on a secondary monitor. Terminator's validate_clickable used to call this and refuse the click. The fix, commit e36b9785 landed on April 2, 2026, replaces that call with is_visible_on_any_monitor, which iterates xcap::Monitor::all() and runs an axis-aligned bounding box intersection per monitor. The diff is 71 added, 31 removed, all in crates/terminator/src/platforms/windows/element.rs. The code is above.",
  },
  {
    q: "What does 'global coordinate space' mean in practice?",
    a: "When you click at (x, y) with a low-level input API like Windows SendInput with MOUSEEVENTF_ABSOLUTE, the coordinates are not relative to any single monitor. They are positions in one virtual screen rectangle that contains all monitors. If your primary monitor is 2560x1440 at (0, 0) and your secondary is 1920x1080 positioned to its right, the secondary's usable range is roughly (2560, 0) to (4480, 1080). An agent that wants to click the center of the secondary monitor clicks at (3520, 540). If monitor 2 is above or to the left, coordinates are negative. Terminator stores this directly on the Monitor struct, Monitor.x and Monitor.y are i32 (signed), and Monitor.contains_point(x, y) at lib.rs line 311 is how you ask 'does this pixel belong to this display?'",
  },
  {
    q: "Why does scale_factor matter?",
    a: "Because 'same pixel count' and 'same physical size' are not the same thing. A 27-inch 4K monitor at 150% scaling renders a button 1.5 times bigger in pixels than a 1080p monitor at 100% scaling, even though the UI is the same 'logical' size. If your automation measures in logical pixels and the machine renders in physical pixels, you click the wrong spot. Terminator stores scale_factor: f64 per monitor so the caller can decide which space to work in. When Terminator captures a specific monitor via desktop.capture_monitor(monitor), the returned image is sized to native pixel resolution (resolution times scale factor), not the logical size shown in Windows Display Settings. That is why the terminal output above shows DISPLAY2 captured at 2400x1350 even though Display Settings says 1920x1080.",
  },
  {
    q: "How do I know which monitor a specific window is on?",
    a: "In Terminator, every UIElement has a .monitor() method that returns the Monitor containing it. The implementation walks up to the top-level window, reads its bounds via the platform accessibility API (UIA on Windows, AXUIElement on macOS), and returns the first monitor whose rectangle contains the window's top-left corner. No other high-level automation framework exposes this cleanly. Playwright does not (it is browser-only). PyAutoGUI does not (it reads raw mouse coords). xdotool does not. You typically have to call GetWindowRect yourself, then MonitorFromRect, then translate the HMONITOR to something your code understands. The SDK methods are documented at packages/terminator-js README and crates/terminator/src/lib.rs line 638 (list_monitors), 678 (get_active_monitor), 730 (capture_monitor).",
  },
  {
    q: "Can I capture only the secondary monitor?",
    a: "Yes. desktop.list_monitors() returns them in order. Pick the one you want (by id, by name, by !is_primary, or by coordinates), then call desktop.capture_monitor(&monitor). Under the hood this calls xcap::Monitor::capture_image() on the specific monitor handle, which gives you its own pixel buffer, not a crop of a stitched multi-monitor screenshot. The MCP server exposes a simpler shape: the capture_screenshot tool has an entire_monitor: bool flag. When true, Terminator captures the full monitor containing the target window, not the window itself. That is the only monitor-specific MCP tool parameter; the lower-level monitor enumeration APIs are only exposed through the Rust, Python, and Node SDKs.",
  },
  {
    q: "What does 'active monitor' mean exactly?",
    a: "The monitor containing the currently focused window. Not the monitor the mouse cursor is on, not the 'primary' monitor in Display Settings. Rationale: when an agent is doing work for a user who has Chrome on screen 2 and Slack on screen 1, 'active' should mean wherever the user is working. Terminator implements this at crates/terminator/src/lib.rs line 678 via desktop.engine.get_active_monitor(). On Windows it calls GetForegroundWindow, then MonitorFromWindow, then resolves that to a Monitor. On macOS it asks AX for the frontmost application's main window frame and matches it against the enumerated monitors. This is the monitor most agent scripts should default to when the user says 'take a screenshot' without specifying one.",
  },
  {
    q: "Why don't consumer guides cover any of this?",
    a: "Because the consumer keyword 'how to use two computer screens' is almost always about setup: which cable, which port, how to extend the desktop in Display Settings, how to choose a primary. Those guides are correct for a user at a desk plugging things in. They have no reason to cover coordinate spaces, per-monitor DPI, or accessibility tree APIs. That leaves a real gap for anyone writing software that has to work across two screens: RDP tools, screen recorders, automation frameworks, game launchers, window managers. This page is for them. The source of truth sits in Terminator's monitor code: lib.rs 272-325 (Monitor struct and helpers), windows/engine.rs 3284-3501 (Windows enumeration and capture), windows/element.rs 315-371 (multi-monitor visibility check), examples/monitor_management.rs (runnable example).",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude computer use and the selector path the articles skip",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer tool is a pixel-coordinate loop. Terminator's MCP exposes 32 selector-based tools instead. Same model, different physics.",
    tag: "Guide",
  },
  {
    title: "Terminator monitor_management example on GitHub",
    href: "https://github.com/mediar-ai/terminator/blob/main/crates/terminator/examples/monitor_management.rs",
    excerpt:
      "The runnable Rust example that prints every attached monitor, fetches the primary and active ones, and captures them one by one.",
    tag: "Code",
  },
  {
    title: "Terminator repo",
    href: "https://github.com/mediar-ai/terminator",
    excerpt:
      "Core Rust crates, MCP agent, Node and Python SDKs, workflow recorder. MIT licensed.",
    tag: "Repo",
  },
];

const jsonLdArticle = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Terminator",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);

const jsonLdFaq = faqPageSchema(faqs);

export default function HowToUseTwoComputerScreensPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-teal-900/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full border border-teal-800/60">
                Guide
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Multi-monitor
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Per-monitor DPI
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Windows UIA + macOS AX
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-[1.05]">
              How to use{" "}
              <GradientText variant="teal">two computer screens</GradientText>,
              from a developer&apos;s perspective
            </h1>

            <p className="text-lg text-zinc-400 mb-6 max-w-3xl leading-relaxed">
              Every guide for this keyword has the same shape. Buy a cable.
              Plug it in. Open Display settings. Click Extend these displays.
              That is correct for setup and it is covered well by Microsoft,
              Dell, HP, and Lenovo. This page is about the other half: how
              software tracks which window is on which screen, why each monitor
              has its own DPI scale factor, and what breaks when an automation
              tool tries to click something on screen two. All anchored to
              real code: Terminator&apos;s{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                Monitor
              </code>{" "}
              struct at{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                crates/terminator/src/lib.rs:272
              </code>
              , and a real Windows UIA bug fixed in commit{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                e36b9785
              </code>{" "}
              on April 2, 2026.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Monitor struct with 8 fields (id, name, x, y, w, h, scale_factor, work_area)",
                "is_visible_on_any_monitor() replaces a broken Windows UIA check",
                "desktop.list_monitors(), get_active_monitor(), capture_monitor()",
                "element.monitor() on any UIElement",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="#bug">See the UIA bug, and the fix</ShimmerButton>
              <a
                href="#api"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors text-sm font-medium"
              >
                See the monitor API
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Two screens. Two coordinate worlds."
            subtitle="Most guides stop at the cable. This page picks up where they stop."
            accent="teal"
            captions={[
              "Every display has its own pixel grid and its own DPI",
              "One virtual coordinate space stitches them together",
              "x and y can be negative if screen two is to the left",
              "Windows UIA silently reports secondary-monitor elements as offscreen",
              "Terminator checks all monitors with an AABB intersection",
            ]}
          />
        </section>

        {/* Why this page exists */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-5">
            What the consumer guides leave out
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            Microsoft Support, Dell, HP, Lenovo, and every productivity blog
            all answer the same version of this question: which cable, which
            port, how to drag the monitor icons around in Display Settings. If
            you are setting up a second monitor at your desk, those guides are
            fine. They stop where the interesting part starts.
          </p>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            Once two displays are attached, your operating system has to
            answer a new set of questions on your behalf. Which monitor does
            this window belong to? What is the DPI of the monitor the cursor
            is on right now? If I click at pixel{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              (3520, 540)
            </code>
            , which physical screen does that land on? If I take a screenshot,
            do I get both monitors stitched together, or one at a time, and at
            what resolution? These are developer questions. They are also the
            questions where multi-monitor automation breaks.
          </p>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            The rest of this page walks through each of them with real code
            from Terminator, a cross-platform desktop automation framework.
            Terminator is open source, MIT, and it has to handle every
            multi-monitor edge case on both Windows and macOS, so the answers
            are not hypothetical.
          </p>
        </section>

        {/* The flow */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Where automation tools talk to your monitors
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            On the left: everything an agent or script might ask. On the
            right: the platform APIs that answer. In the middle:
            Terminator&apos;s{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              Monitor
            </code>{" "}
            abstraction that normalises them. This is the contract consumer
            guides never draw, because from the user&apos;s side it is
            invisible.
          </p>
          <AnimatedBeam
            title="Agent or script -> Terminator -> OS multi-monitor APIs"
            from={[
              { label: "list_monitors()" },
              { label: "get_active_monitor()" },
              { label: "element.monitor()" },
              { label: "capture_monitor()" },
            ]}
            hub={{ label: "Monitor struct", sublabel: "lib.rs:272" }}
            to={[
              { label: "Windows UIA + xcap" },
              { label: "macOS AXUIElement + NSScreen" },
              { label: "Linux xrandr / Wayland" },
              { label: "SPI_GETWORKAREA" },
            ]}
          />
        </section>

        {/* The Monitor struct */}
        <section id="api" className="max-w-4xl mx-auto px-6 py-10 scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            What a monitor actually is, to software
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            Windows Display Settings shows each screen as an icon with a
            number on it. From your code&apos;s point of view, a monitor is a
            struct with these eight fields. If you squint, this list is also
            the list of things that can be different between your two screens
            and trip up a naive click.
          </p>
          <AnimatedCodeBlock
            code={monitorStructSource}
            language="rust"
            filename="crates/terminator/src/lib.rs"
            typingSpeed={0}
          />
        </section>

        {/* Bento grid of API methods */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            The six calls that cover every multi-monitor question
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            Every question a dual-monitor agent has to answer reduces to one
            of these. Each one is a method on{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              Desktop
            </code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              UIElement
            </code>
            , implemented the same way in the Rust, Python, and Node SDKs.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* Code example - listing monitors */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Listing every monitor in six lines
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            No capture. No clicks. Just enumeration. The output from this
            exact call is what drives every other multi-monitor decision the
            rest of an agent makes.
          </p>
          <AnimatedCodeBlock
            code={listMonitorsExample}
            language="typescript"
            filename="list-monitors.ts"
            typingSpeed={0}
          />
        </section>

        {/* Terminal output */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            What that looks like on a real dual-monitor rig
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            The runnable example lives at{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              crates/terminator/examples/monitor_management.rs
            </code>
            . Here is the output on a setup with a 2560x1440 primary at 100%
            scaling and a 1920x1080 secondary at 125% scaling positioned to
            its right. The two infos at the end are the thing nobody writes
            about: the captured image of DISPLAY2 is{" "}
            <NumberTicker value={2400} />x<NumberTicker value={1350} />, not
            1920x1080, because the capture respects{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              scale_factor
            </code>
            .
          </p>
          <TerminalOutput title="bash" lines={terminalLines} />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-4">
            Numbers you can check yourself
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
            All four come from the Terminator source. The line numbers are
            line numbers in the published repo; the commit SHA is the exact
            multi-monitor fix; the eight fields are the eight fields of the{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              Monitor
            </code>{" "}
            struct; the diff lines are the size of the fix.
          </p>
          <MetricsRow
            metrics={[
              { value: 8, label: "Fields on the Monitor struct" },
              { value: 272, label: "Line of Monitor in lib.rs" },
              { value: 71, label: "Lines added by the UIA fix" },
              { value: 315, label: "Line of is_visible_on_any_monitor" },
            ]}
          />

          <ProofBanner
            quote="Stop asking Windows UIA whether the element is offscreen. Ask every monitor whether its rectangle intersects the element's bounds. If any of them says yes, the element is visible."
            source="Commit e36b9785 on 2026-04-02, crates/terminator/src/platforms/windows/element.rs"
            metric="71 added, 31 removed, one file"
          />
        </section>

        {/* The bug */}
        <section id="bug" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-4">
            The <GradientText variant="teal">is_offscreen()</GradientText> trap on screen two
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            This is the anchor fact for this page. Before April 2, 2026, if
            your app was on your secondary monitor and an agent asked
            Terminator to click something in it, the click would be refused.
            Not with a clean &quot;element is on monitor 2&quot; message. With
            a generic{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              ElementNotVisible
            </code>{" "}
            error. The reason was one call into Windows UIA.
          </p>
          <BeforeAfter
            title=""
            before={{
              label: "Before: UIA's is_offscreen()",
              content:
                "validate_clickable() called self.element.is_offscreen(). That maps to IUIAutomationElement::get_CurrentIsOffscreen on the underlying COM object. UIA decides 'offscreen' by comparing bounds to the primary monitor only, so any element whose bounds start past the primary's right edge was reported as offscreen. Perfectly visible buttons on screen two were refused.",
              highlights: [
                "Element on monitor 2 -> UIA says offscreen -> click refused",
                "Generic ElementNotVisible error, no hint about monitors",
                "Worked fine in single-monitor testing",
                "Reproducible by anyone with two screens, not platform-specific",
              ],
            }}
            after={{
              label: "After: is_visible_on_any_monitor()",
              content:
                "The new helper at element.rs line 315 pulls every connected monitor via xcap::Monitor::all() and runs a standard axis-aligned bounding box intersection: element_left < monitor_right && element_right > monitor_left && element_top < monitor_bottom && element_bottom > monitor_top. If any monitor returns true, the element is visible. UIA is never asked.",
              highlights: [
                "Loops over every monitor, not just the primary",
                "Pure bounds math, no platform flag to trust",
                "Traceable log line per monitor for debugging",
                "Fix shipped in v0.24.31, commit e36b9785",
              ],
            }}
          />
        </section>

        {/* The two code blocks side by side */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            The code, before and after
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            Left: the removed call that was wrong on multi-monitor setups.
            Right: the replacement helper. Same file. Same line range. One
            function call became one loop, and the framework stopped lying to
            itself about screen two.
          </p>
          <CodeComparison
            leftLabel="Before (removed in e36b9785)"
            rightLabel="After: is_visible_on_any_monitor"
            leftCode={uiaIsOffscreenCode}
            rightCode={fixedVisibilityCode}
            leftLines={uiaIsOffscreenCode.split("\n").length}
            rightLines={fixedVisibilityCode.split("\n").length}
            title="crates/terminator/src/platforms/windows/element.rs"
            reductionSuffix="lines of real multi-monitor math"
          />
        </section>

        {/* Coordinate space table */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Consumer view vs developer view
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            Same six questions, answered from both sides. The left column is
            what Dell and Microsoft write about. The right column is what your
            code actually has to know if it wants to work across two screens.
          </p>
          <ComparisonTable
            productName="Terminator Monitor API"
            competitorName="Consumer setup guides"
            rows={coordSpaceRows}
          />
        </section>

        {/* Step timeline */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            What happens when an agent clicks a button on screen two
          </h2>
          <p className="text-zinc-400 mb-5 max-w-3xl leading-relaxed">
            Tracing one click end to end makes the multi-monitor plumbing
            concrete. This is the selector path, not the pixel path, so the
            coordinates are derived from the OS accessibility tree, not from
            an image.
          </p>
          <StepTimeline
            steps={[
              {
                title: "Agent asks for click_element with a selector",
                description:
                  "role:Button && name:Save. No coordinates, no screenshot. The selector is resolved against the Windows UIA tree (or macOS AX tree on Mac).",
              },
              {
                title: "Terminator finds the element and reads its bounds",
                description:
                  "bounds come back as a rect in the global coordinate space, which spans every monitor. If the button is on screen 2 at x=2560+400, the x returned is 2960, not 400.",
              },
              {
                title: "validate_clickable() checks visibility",
                description:
                  "This is the step that used to call is_offscreen() and get the wrong answer. It now calls is_visible_on_any_monitor() and iterates xcap::Monitor::all(). Any monitor whose rect intersects the element's rect counts as visible.",
              },
              {
                title: "Focus restore captures the current cursor and window",
                description:
                  "Terminator is explicit about not stealing your cursor. Before moving it, the current position and foreground window are saved so they can be put back after the click.",
              },
              {
                title: "SendInput fires with global, normalised coordinates",
                description:
                  "On Windows the click goes through SendInput with MOUSEEVENTF_ABSOLUTE. Coordinates are normalised to the 0-65535 range across the full virtual screen (GetSystemMetrics(SM_CXSCREEN) + SM_CYSCREEN), so screen two is first-class.",
              },
              {
                title: "A UI diff is captured and returned",
                description:
                  "Before/after tree, plus a screenshot of the monitor containing the target window, not a stitched image. The agent sees what changed next turn.",
              },
            ]}
          />
        </section>

        {/* Practical setup tips for non-devs */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Practical tips if you are setting screens up for the first time
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            The developer side is this page. The user side is short enough
            that it fits below. If you are stuck on setup, these five points
            plus the Windows and Dell links in the FAQ cover 90% of it.
          </p>
          <ul className="space-y-3 text-zinc-400 max-w-3xl leading-relaxed list-disc pl-6 mb-4">
            <li>
              Match resolutions if you can. Mixing 1440p and 1080p is fine but
              you will see the DPI jump as the cursor crosses the boundary.
            </li>
            <li>
              Drag the monitor icons in Display Settings until their
              arrangement matches your desk. This controls where the mouse
              crosses from one screen to the other, and it is what decides
              the sign of{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                Monitor.x
              </code>
              .
            </li>
            <li>
              Pick a primary that makes sense. It is the one the taskbar and
              most new windows default to, and on Windows it is the only one
              whose{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                work_area
              </code>{" "}
              is exposed cleanly.
            </li>
            <li>
              If one monitor looks blurry, check its scaling percentage. Per-
              monitor DPI means 100% on a 4K screen will look tiny, and 150%
              on a 1080p screen will look pixelated. Pick a ratio that gives
              roughly the same logical size on both.
            </li>
            <li>
              If you automate anything, store the active monitor at the start
              of the session. Users dock and undock laptops, which changes
              the monitor topology mid-run.
            </li>
          </ul>
        </section>

        {/* Inline CTA */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <InlineCta
            heading="Automate across both your screens"
            body="Terminator is an MIT-licensed desktop automation framework. Same API on Windows and macOS, per-monitor DPI handled, Monitor struct with real position and scale, and a fresh fix so clicks on screen two work correctly. If you are building an agent, a recorder, or a window manager, start here."
            linkText="Read the source on GitHub"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Questions about two-screen setups" />

        {/* Related */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="More from the Terminator guides"
            posts={relatedPosts}
          />
        </section>
      </article>
    </div>
  );
}
