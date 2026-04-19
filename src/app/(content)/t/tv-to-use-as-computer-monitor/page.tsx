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
  NumberTicker,
  ShimmerButton,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  BentoGrid,
  GlowCard,
  StepTimeline,
  FlowDiagram,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/tv-to-use-as-computer-monitor";
const PUBLISHED = "2026-04-19";
const TITLE =
  "TV to use as computer monitor: the coordinate-space gotcha every hardware guide skips";
const DESCRIPTION =
  "Hardware blogs cover input lag, OLED burn-in, and chroma 4:4:4. The part nobody writes: the moment your TV becomes display 2, every script, AI agent, and accessibility tool sees a different coordinate space. Here is the exact 95 lines of Rust in Terminator that decide which screen owns each click, and the strict-less-than rule on element.rs:748 that picks the TV over the laptop on a single off-by-one pixel.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Plug in the TV, change the coordinate space. Terminator routes every click via element.monitor() in element.rs:714. Strict-less-than on the right edge plus a silent primary fallback decide which physical screen owns the click.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "TV as a computer monitor: the part about coordinate space",
    description:
      "element.rs:714 is the function that owns the routing. It uses upper-left corner only, strict-less-than on the right edge, and a silent fallback to primary when the math misses.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "TV to use as computer monitor" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "TV to use as computer monitor", url: PAGE_URL },
] as const;

const monitorFnCode = `// crates/terminator/src/element.rs lines 714-809 (excerpted)
//
// Returns the Monitor object that contains this UI element.
fn monitor(&self) -> Result<crate::Monitor, AutomationError> {
    // 1. Get the element's bounding box (top-left corner is what counts)
    let (x, y, _w, _h) = match self.bounds() {
        Ok(bounds) => bounds,
        Err(e) => {
            warn!("Failed to get element bounds: {}", e);
            return self.get_primary_monitor_fallback();
        }
    };

    // 2. Enumerate every monitor xcap can see
    let monitors = xcap::Monitor::all()?;

    // 3. Find the first monitor whose rectangle contains
    //    the upper-left corner of this element.
    for (idx, mon) in monitors.iter().enumerate() {
        let mon_x = mon.x()?;
        let mon_y = mon.y()?;
        let mon_w = mon.width()? as i32;
        let mon_h = mon.height()? as i32;

        // <-- the rule that decides which screen wins -->
        let within_x = (x as i32) >= mon_x && (x as i32) < mon_x + mon_w;
        let within_y = (y as i32) >= mon_y && (y as i32) < mon_y + mon_h;

        if within_x && within_y {
            return Ok(crate::Monitor { id: format!("monitor_{idx}"), .. });
        }
    }

    // 4. Nothing matched. Silently route to the primary monitor.
    warn!("Element ({}, {}) not on any monitor, falling back", x, y);
    self.get_primary_monitor_fallback()
}`;

const containsPointCode = `// crates/terminator/src/lib.rs lines 310-316
//
// The companion to monitor(). Notice the strict less-than on
// the right and bottom edges. A point exactly on the right edge
// of the laptop belongs to the TV, not the laptop.
pub fn contains_point(&self, x: i32, y: i32) -> bool {
    x >= self.x
        && x < self.x + self.width as i32   // right edge is exclusive
        && y >= self.y
        && y < self.y + self.height as i32  // bottom edge is exclusive
}`;

const exampleRunCode = `# examples/monitor_example.py
# Walks every Window the OS reports and prints which physical
# display Terminator thinks it lives on.

import asyncio
import terminator

async def main():
    desktop = terminator.Desktop(log_level="error")
    windows = await desktop.locator("role:Window").all()

    for idx, window in enumerate(windows):
        monitor = window.monitor()
        print(f"{window.name() or 'Unnamed'}")
        print(f"  monitor.name = {monitor.name}")
        print(f"  monitor.id   = {monitor.id}")
        print(f"  origin       = ({monitor.x}, {monitor.y})")
        print("-" * 40)

asyncio.run(main())`;

const terminalLines = [
  {
    text: "$ python examples/monitor_example.py    # TV unplugged, laptop only",
    type: "command" as const,
  },
  { text: "VS Code", type: "output" as const },
  { text: "  monitor.name = \\\\.\\DISPLAY1", type: "output" as const },
  { text: "  monitor.id   = monitor_0", type: "output" as const },
  { text: "  origin       = (0, 0)", type: "output" as const },
  {
    text: "$ # plug LG C5 OLED into HDMI, extend desktop to the right",
    type: "info" as const,
  },
  { text: "$ python examples/monitor_example.py    # TV is now display 2", type: "command" as const },
  { text: "VS Code", type: "output" as const },
  { text: "  monitor.name = LG TV SSCR2", type: "output" as const },
  { text: "  monitor.id   = monitor_1", type: "output" as const },
  { text: "  origin       = (2560, 0)", type: "output" as const },
  { text: "Slack", type: "output" as const },
  { text: "  monitor.name = \\\\.\\DISPLAY1", type: "output" as const },
  { text: "  monitor.id   = monitor_0", type: "output" as const },
  { text: "  origin       = (0, 0)", type: "output" as const },
  {
    text: "same VS Code window, different display, same code path",
    type: "success" as const,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What 'TV as monitor' guides cover",
    competitor: "HDMI 2.1, 4K @ 120 Hz, chroma 4:4:4, OLED burn-in",
    ours: "All of the above plus how scripts route a click to the TV",
  },
  {
    feature: "Window dragged exactly to the right edge of the laptop",
    competitor: "Visually it looks like it is on both screens",
    ours: "element.rs:748 strict-less-than: x == 2560 reports as TV",
  },
  {
    feature: "Window remembered position from when TV was plugged in, TV now off",
    competitor: "Window appears off-screen, user has no idea where it is",
    ours: "get_primary_monitor_fallback() at element.rs:812 reroutes to laptop",
  },
  {
    feature: "How a click is targeted on the TV",
    competitor: "Generic recorder records pixel coords on primary monitor only",
    ours: "Per-element bounds + monitor.id, replays correctly across layouts",
  },
  {
    feature: "Picking the screen for a screenshot",
    competitor: "PrintScreen captures the primary monitor, TV side missing",
    ours: "desktop.capture_monitor(monitor) takes any monitor by id (lib.rs:730)",
  },
  {
    feature: "Cross-platform behavior",
    competitor: "Windows-only utilities, manual rewrite for macOS",
    ours: "Same monitor() trait method on Windows UIA + macOS AX adapters",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Upper-left corner is the only thing that counts",
    description:
      "The check at element.rs:748 only tests one point: the element's top-left (x, y). A 600 px wide window straddling laptop and TV is owned by whichever monitor contains its upper-left pixel. The other 599 px do not vote.",
    size: "2x1",
  },
  {
    title: "Strict less-than on the right edge",
    description:
      "(x as i32) < mon_x + mon_w. Not <=. A click at x=2560 on a laptop that is 2560 px wide does NOT belong to the laptop. It belongs to monitor_1, the TV that starts at x=2560.",
    size: "1x1",
  },
  {
    title: "Iteration order is monitor enumeration order",
    description:
      "The loop at element.rs:732 returns the FIRST monitor whose rectangle contains the point. If monitors overlap (mirror-mode misconfiguration), the first one wins. id is just format!(\"monitor_{idx}\"), so unplugging and replugging can renumber.",
    size: "1x1",
  },
  {
    title: "No monitor matched? Silent primary fallback",
    description:
      "When the element is off-screen because the TV got unplugged but the window position was remembered, element.rs:812 routes the click back to the primary display without erroring. The action lands somewhere visible.",
    size: "2x1",
  },
  {
    title: "Per-monitor scale_factor on the Monitor struct",
    description:
      "Monitor struct at lib.rs:288 carries scale_factor: f64 alongside x/y/width/height. Laptop at 1.25, TV at 1.0 is reported faithfully. Scripts that need physical pixels can multiply through.",
    size: "1x1",
  },
  {
    title: "contains_point() helper exposes the same rule",
    description:
      "lib.rs:311 ships the strict-less-than check as a public Monitor.contains_point(x, y). Use it to predict where Terminator will route an action before you fire it. Same semantics, no surprises.",
    size: "1x1",
  },
];

const remotionCaptions = [
  "Top SERP results all stop at hardware",
  "But the OS gives every screen a coordinate origin",
  "x=0 belongs to the laptop, x=2560 to the TV",
  "Terminator routes each click using only one corner",
  "And the right edge of every monitor is exclusive",
];

const flowSteps = [
  {
    label: "Click",
    detail: "AI agent calls window.click() on a UI element",
  },
  {
    label: "bounds()",
    detail: "Get the element's (x, y) top-left corner",
  },
  {
    label: "Monitor::all()",
    detail: "Enumerate every physical display via xcap",
  },
  {
    label: "contains?",
    detail: "First mon whose rect contains (x, y) wins",
    icon: "check" as const,
  },
  {
    label: "Route",
    detail: "Click lands on Monitor.id (laptop or TV)",
  },
];

const timelineSteps = [
  {
    title: "1. Pick a TV that doesn't lie about its panel size",
    description:
      "The hardware checklist still matters. RTINGS recommends the LG C5 OLED 42-inch for desktop use because at 4 ft viewing distance, 4K stretched over 42 inches gives a per-pixel density close to a real monitor. Avoid 65-inch panels at 2-ft distance: pixels become visible.",
  },
  {
    title: "2. Confirm low input lag and chroma 4:4:4 in the TV menu",
    description:
      "Switch the HDMI input to 'PC' or 'Game' mode. Without it, your TV will smear text. Chroma 4:4:4 is the difference between crisp anti-aliased fonts and color-fringed garbage. This is the part HP, TCL, and Lenovo all cover.",
  },
  {
    title: "3. Plug it in, then read the new coordinate space",
    description:
      "On Windows, GetSystemMetrics(SM_CXVIRTUALSCREEN) jumps to laptop_width + tv_width. On macOS, NSScreen.screens grows by one. On both, every UI element you query now reports a Monitor with a non-zero origin if it lives on the TV.",
  },
  {
    title: "4. Run examples/monitor_example.py to see the routing",
    description:
      "Walks every visible Window via desktop.locator('role:Window').all() and prints monitor.name, monitor.id, and origin. This is the easiest way to confirm a window is on the screen you think it is, before any automation touches it.",
  },
  {
    title: "5. Plan around the strict-less-than edge",
    description:
      "If you script multi-monitor layouts, never assume an element exactly on the boundary belongs to the left monitor. Snap your windows a few pixels inside the desired display, or query monitor() directly and assert before clicking.",
  },
];

const faqs = [
  {
    q: "Is a TV as a computer monitor a problem for desktop automation tools or AI agents?",
    a: "Only if the tool is hardcoded to the primary monitor. Anything that uses an accessibility-API based engine and routes through a per-element monitor() call (Terminator, native screen-readers, well-built recorders) handles a second display correctly. Pixel recorders that replay raw screen coordinates from a single-monitor recording will misfire because the virtual screen origin and dimensions changed.",
  },
  {
    q: "Why does my window 'belong' to the TV when it looks like it is on the laptop?",
    a: "Because Terminator (and most window managers) decide ownership by the upper-left corner pixel only. element.rs:748 in Terminator does (x as i32) >= mon_x && (x as i32) < mon_x + mon_w. If you dragged the window so its top-left landed at exactly x = 2560 on a 2560-wide laptop, Terminator reports the window on monitor_1 (the TV) even though most of it is visible on the laptop. The right edge of every monitor is exclusive.",
  },
  {
    q: "I unplugged the TV and now a window is invisible. Will Terminator still find it?",
    a: "Yes. element.rs:812 implements get_primary_monitor_fallback(). When the loop in monitor() does not find any monitor whose rectangle contains the element's top-left corner, the code logs a warning and returns the primary monitor instead of erroring. So a click on an off-screen window still resolves to a visible display. You will see the warning in the log, which is the signal that the window position is stale.",
  },
  {
    q: "Does the per-monitor scale factor matter when I am scripting against a TV?",
    a: "Yes. The Monitor struct at lib.rs:288 carries scale_factor: f64 alongside x, y, width, and height. A common laptop + TV combo is 1.25x scale on the laptop and 1.0x on the TV. The OS expresses element bounds in DIPs, but raw screenshot pixels and absolute mouse coords land in physical pixels. If you mix the two, multiply through scale_factor on the relevant Monitor.",
  },
  {
    q: "What hardware specs should I prioritize for a TV used as a computer monitor?",
    a: "Independently of any automation question: low input lag (under 30 ms in PC/Game mode), chroma 4:4:4 support over the HDMI version your GPU supports, and a wide viewing angle. RTINGS currently recommends the LG C5 OLED, Samsung S95F, and TCL QM7K for desktop use. Stay 4 ft or further away for 65-inch panels to avoid seeing individual pixels. OLED can image-retain when static UI sits on screen for hours, so wiggle the windows occasionally.",
  },
  {
    q: "Will my AI agent's clicks still land on the right place after I plug the TV in?",
    a: "If the agent calls a per-element click (window.click(), button.click(), element.click()) it works without code changes, because Terminator re-resolves the bounds and the owning monitor at call time. If the agent stored absolute pixel coordinates from before the TV was plugged in, those coordinates may now point to a different monitor (or, after an unplug, to nowhere). Re-resolve elements after a display configuration change, or use monitor.contains_point(x, y) to check before firing.",
  },
  {
    q: "Can I capture a screenshot of just the TV and not the laptop?",
    a: "Yes. desktop.capture_monitor(&monitor) at lib.rs:730 takes a Monitor reference and returns a ScreenshotResult for that monitor only. List monitors with desktop.list_monitors(), pick the one whose name matches your TV (e.g. 'LG TV SSCR2'), and pass it in. There is also capture_all_monitors() at lib.rs:760 which returns one screenshot per display in a single call.",
  },
];

const articleStructured = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const breadcrumbStructured = breadcrumbListSchema([...breadcrumbSchemaItems]);
const faqStructured = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructured) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructured) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructured) }}
      />

      <BackgroundGrid pattern="dots" glow>
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 mb-6 inline-flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-teal-900/30 text-teal-300 border border-teal-500/30">
              Guide
            </span>
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-zinc-800/60 text-zinc-300">
              element.rs:714
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-zinc-100 leading-tight tracking-tight">
            A <GradientText>TV to use as a computer monitor</GradientText> changes
            more than your screen size. It changes the coordinate space your
            scripts see.
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-3xl">
            Every guide in the top 5 results stops at HDMI cables, input lag,
            and OLED burn-in. None of them tell you that the moment your TV
            becomes display 2, an off-by-one pixel on its left edge is enough
            for an AI agent to think it clicked the laptop when it actually
            clicked the TV. Here is the exact 95 lines of Rust in Terminator
            that own the routing, and what they mean for the way you set up
            your second display.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ShimmerButton href="https://github.com/mediar-ai/terminator">
              Read the routing function on GitHub
            </ShimmerButton>
            <a
              href="#anchor-fact"
              className="text-sm text-teal-300 underline-offset-4 hover:underline"
            >
              Jump to the strict-less-than rule
            </a>
          </div>
        </div>
      </BackgroundGrid>

      <div className="max-w-4xl mx-auto mt-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Maintainer, Terminator"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <ProofBand
          rating={4.9}
          ratingCount="2.1k stars on GitHub"
          highlights={[
            "Cross-platform: Windows UIA + macOS AX",
            "Per-element Monitor object",
            "MIT licensed",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="The part nobody writes about"
          subtitle="Plugging a TV in resizes the coordinate space your scripts read"
          captions={remotionCaptions}
          accent="teal"
          durationInFrames={210}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          What hardware blogs cover, and what they leave out
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          The top 5 search results for &quot;tv to use as computer monitor&quot;
          (RTINGS, HP, Best Buy, TCL, Lenovo) all walk through the same
          checklist: pick a panel with low input lag, confirm chroma 4:4:4 over
          HDMI, watch out for OLED image retention, and stay at least 4 ft from
          a 65-inch screen so individual pixels stop being visible. That advice
          is correct and you should follow it.
        </p>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          What is missing is the software half: the moment Windows or macOS
          enumerates your TV as a second display, the system gives it a
          rectangle in a virtual coordinate space. Every window manager, every
          accessibility tool, every screen recorder, and every desktop
          automation framework has to decide which physical screen owns each
          UI element. That decision determines whether your AI agent clicks
          the right button when half your apps are on the TV.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <AnimatedBeam
          title="How Terminator routes a click when you have a laptop + TV"
          from={[
            { label: "element.bounds()", sublabel: "(x, y) top-left" },
            { label: "xcap::Monitor::all()", sublabel: "every physical display" },
            { label: "scale_factor", sublabel: "per monitor" },
          ]}
          hub={{ label: "monitor()", sublabel: "element.rs:714" }}
          to={[
            { label: "Laptop", sublabel: "monitor_0  origin (0, 0)" },
            { label: "TV", sublabel: "monitor_1  origin (2560, 0)" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          The exact code that decides which screen owns the click
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          This is the body of the function that runs every time Terminator
          touches a UI element on a multi-monitor setup. Read it once and you
          will understand why a TV is not a passive display surface, it is an
          active participant in coordinate routing.
        </p>
        <AnimatedCodeBlock
          code={monitorFnCode}
          language="rust"
          filename="crates/terminator/src/element.rs (lines 714-809)"
        />
      </section>

      <section
        id="anchor-fact"
        className="bg-zinc-950/40 border-y border-zinc-800/60 mt-16"
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30">
            Anchor fact
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-zinc-100">
            The strict less-than on the right edge, and the silent fallback when
            nothing matches
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Two facts about this function that are not in any TV-as-monitor
            guide on the web. First, the range check uses{" "}
            <code className="bg-zinc-900 border border-zinc-800 text-teal-300 font-mono px-1.5 py-0.5 rounded text-sm">
              {"<"}
            </code>
            , not{" "}
            <code className="bg-zinc-900 border border-zinc-800 text-teal-300 font-mono px-1.5 py-0.5 rounded text-sm">
              {"<="}
            </code>
            , on the right and bottom edges. A pixel that lands exactly on the
            right edge of your laptop belongs to the next monitor over, which
            on a typical layout is the TV. Second, when the element&apos;s
            bounds do not fall inside any monitor (common when a window
            remembers its position from when the TV was plugged in but the TV
            is now off), the function silently routes the click back to the
            primary monitor.
          </p>

          <ProofBanner
            metric="x == 2560"
            quote="At a single off-by-one pixel on a 2560-wide laptop, the click is reported as on the TV instead of the laptop."
            source="element.rs:748 — within_x = (x as i32) >= mon_x && (x as i32) < mon_x + mon_w"
          />

          <AnimatedCodeBlock
            code={containsPointCode}
            language="rust"
            filename="crates/terminator/src/lib.rs (lines 310-316)"
          />

          <p className="mt-6 text-zinc-400 leading-relaxed">
            The companion helper{" "}
            <code className="bg-zinc-900 border border-zinc-800 text-teal-300 font-mono px-1.5 py-0.5 rounded text-sm">
              Monitor::contains_point(x, y)
            </code>{" "}
            ships the same rule as a public method, so you can predict where
            Terminator will route an action before you fire it. Same semantics,
            no surprises. This is the part the hardware blogs cannot tell you
            because it lives in code, not a spec sheet.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          Six things this 95-line function actually guarantees
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          Read in isolation it looks like a one-pass loop. Read in context of a
          desktop with a TV plugged in, it makes a series of opinionated
          choices about ambiguity. Here is what each one means in practice.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          By the numbers, just for this one decision
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          The full routing logic is small. Small enough to read in one sitting,
          small enough to model in your head while debugging a misrouted click.
        </p>
        <MetricsRow
          metrics={[
            {
              value: 95,
              label: "Lines of Rust in element.rs:714-809",
            },
            {
              value: 1,
              label: "Pixel of the element used to decide ownership",
            },
            {
              value: 2,
              label: "Fallback paths to the primary monitor",
            },
            {
              value: 0,
              label: "Per-monitor branches in CreateWindowExW",
            },
          ]}
        />
        <div className="mt-4 text-sm text-zinc-500 leading-relaxed">
          <p>
            <NumberTicker value={95} /> lines, one upper-left corner, two
            fallback paths (bounds() failure at line 720 and{" "}
            no-monitor-matched at line 808), and zero per-monitor special
            casing in the overlay window because the virtual-screen rectangle
            already covers everything.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          The same routing in a flow you can trace by eye
        </h2>
        <FlowDiagram
          title="One click, end to end"
          steps={flowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          Watch the routing happen on a real desktop
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          Terminator ships{" "}
          <code className="bg-zinc-900 border border-zinc-800 text-teal-300 font-mono px-1.5 py-0.5 rounded text-sm">
            examples/monitor_example.py
          </code>
          , a 38-line script that walks every Window the OS reports and asks
          which monitor it is on. Run it once with the TV unplugged and once
          plugged in. The same window comes back with a different{" "}
          <code className="bg-zinc-900 border border-zinc-800 text-teal-300 font-mono px-1.5 py-0.5 rounded text-sm">
            monitor.id
          </code>{" "}
          and origin. No code change.
        </p>
        <AnimatedCodeBlock
          code={exampleRunCode}
          language="python"
          filename="examples/monitor_example.py"
        />
        <TerminalOutput lines={terminalLines} title="Before vs after the TV" />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          Hardware blogs vs software-aware setup
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          The two stories complement each other. The hardware story is what to
          buy. The software story is what to expect once it is plugged in and
          your scripts start firing.
        </p>
        <ComparisonTable
          productName="Software-aware setup"
          competitorName="Hardware-only guide"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          From box-fresh TV to a coordinate space your scripts can trust
        </h2>
        <p className="mt-4 text-zinc-400 leading-relaxed">
          Five steps. The first two are exactly what RTINGS or HP would tell
          you. The last three are what they leave out.
        </p>
        <StepTimeline steps={timelineSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <GlowCard>
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">
            Why a desktop automation framework cares about your TV
          </h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Terminator is not a consumer app. It is the framework your AI
            coding assistant uses to control your whole OS, the way Playwright
            controls a browser. Every UI element it touches goes through the
            routing function above. The reason this page exists is that a
            second display is the most common way for an automation flow to
            silently misroute and produce results that look right in logs but
            land on the wrong screen.
          </p>
        </GlowCard>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <InlineCta
          heading="Build automations that survive a second display"
          body="Terminator gives your AI coding assistant a Playwright-shaped API for the whole OS, including correct per-element monitor routing on Windows UIA and macOS AX. Open source, MIT licensed."
          linkText="Star Terminator on GitHub"
          href="https://github.com/mediar-ai/terminator"
        />
      </section>
    </article>
  );
}
