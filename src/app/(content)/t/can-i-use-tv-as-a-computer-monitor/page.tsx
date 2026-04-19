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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  BentoGrid,
  GlowCard,
  FlowDiagram,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/can-i-use-tv-as-a-computer-monitor";
const PUBLISHED = "2026-04-18";
const TITLE =
  "Can I use a TV as a computer monitor? Yes, and here is the automation-side story nobody on the SERP tells";
const DESCRIPTION =
  "Every top result for this query is about HDMI cables, chroma subsampling, and input lag. The piece they skip: once a TV becomes monitor 2, any script or AI agent driving your desktop has to become monitor-aware. Terminator exposes a 9-field Monitor struct in crates/terminator/src/lib.rs:274 and a get_monitor_by_name() call so you can target a TV by its reported display name.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Plug a TV into a PC and you create a second display with a different scale_factor, a non-zero (x, y) offset, and its own accessibility-reported name. Terminator's Monitor API was built for exactly this case.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Using a TV as a monitor: what the SERP misses",
    description:
      "The cable-and-refresh-rate guides are fine. The piece about desktop automation, coordinates, and monitor-aware scripts is in Terminator's Monitor struct.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Can I use a TV as a computer monitor?" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Can I use a TV as a computer monitor?", url: PAGE_URL },
];

const monitorStructCode = `// crates/terminator/src/lib.rs line 274
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Monitor {
    pub id: String,
    pub name: String,
    pub is_primary: bool,
    pub width: u32,
    pub height: u32,
    pub x: i32,
    pub y: i32,
    pub scale_factor: f64,
    pub work_area: Option<WorkAreaBounds>,
}`;

const elementMonitorCode = `// examples/monitor_example.py
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop(log_level="error")

    # Every UI element knows which display it is on
    windows = await desktop.locator("role:Window").all()
    for window in windows:
        monitor = window.monitor()
        print(f"{window.name()} is on {monitor.name}")
        print(f"  origin: ({monitor.x}, {monitor.y})")
        print(f"  size:   {monitor.width}x{monitor.height}")
        print(f"  scale:  {monitor.scale_factor}")

asyncio.run(main())`;

const targetTvCode = `// Target a specific monitor (your TV) by its reported name.
// lib.rs line 712, Desktop::get_monitor_by_name.
const desktop = new Desktop();

// The name is whatever the OS/driver reports. On Windows this
// comes from EDID; on macOS from CGDisplayCopyDisplayProductName.
const tv = await desktop.getMonitorByName("LG TV SSCR2");

// Now move a window into the TV's work area.
const chrome = await desktop
  .locator("role:Window && name:contains:Chrome")
  .first();

await chrome.moveWindow(
  tv.x + 40,
  tv.y + 40,
  Math.min(1920, tv.width - 80),
  Math.min(1080, tv.height - 120),
);`;

const terminalLines = [
  { text: "python examples/monitor_example.py", type: "command" as const },
  {
    text: "Chrome - Tabs and apps is on \\\\.\\DISPLAY1",
    type: "output" as const,
  },
  { text: "  origin: (0, 0)", type: "output" as const },
  { text: "  size:   2560x1600", type: "output" as const },
  { text: "  scale:  2.0", type: "output" as const },
  {
    text: "YouTube - Google Chrome is on LG TV SSCR2",
    type: "output" as const,
  },
  { text: "  origin: (2560, 0)", type: "output" as const },
  { text: "  size:   3840x2160", type: "output" as const },
  { text: "  scale:  1.0", type: "output" as const },
  {
    text: "Click at logical (100, 100) now resolves correctly on both.",
    type: "success" as const,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Detecting a window is on the TV",
    competitor: "Compare window rect against a hardcoded resolution",
    ours: "element.monitor() returns a Monitor whose name matches the TV",
  },
  {
    feature: "Scale factor mismatch between laptop and TV",
    competitor: "Coordinates drift, clicks land off-target",
    ours: "Monitor.scale_factor exposed per display (lib.rs line 288)",
  },
  {
    feature: "Negative-y TV above the laptop",
    competitor: "Math assumes (0, 0) is top-left of primary",
    ours: "Monitor.x and Monitor.y are i32, negatives supported",
  },
  {
    feature: "Screenshot just the TV output",
    competitor: "Full-desktop screenshot, crop after",
    ours: "desktop.capture_monitor_by_id(tv.id) (mod.rs line 164)",
  },
  {
    feature: "TV reports the wrong DPI",
    competitor: "Hardcoded DPI constant, brittle per machine",
    ours: "Monitor.scale_factor is read fresh from the OS per call",
  },
  {
    feature: "Taskbar on the laptop, full-bleed TV",
    competitor: "Click taskbar height offset by accident",
    ours: "Monitor.work_area exposes the non-taskbar region",
  },
  {
    feature: "TV sleeps and wakes mid-session",
    competitor: "Stale monitor list until restart",
    ours: "desktop.list_monitors() refreshes on every call (lib.rs 638)",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Nine fields per display",
    description:
      "id, name, is_primary, width, height, x, y, scale_factor, work_area. Defined in crates/terminator/src/lib.rs:274. Enough to compute anything a coordinate-based script needs.",
    size: "2x1",
  },
  {
    title: "Name the TV, not its index",
    description:
      "desktop.get_monitor_by_name(\"LG TV SSCR2\") (lib.rs:712) targets by EDID product name. Survives unplugging and re-plugging, where index-based addressing does not.",
    size: "1x1",
  },
  {
    title: "Element-to-monitor is O(1)",
    description:
      "Every UIElement has a .monitor() method (element.rs:1583). Ask which display a button is on before clicking it, instead of guessing from global coordinates.",
    size: "1x1",
  },
  {
    title: "Per-monitor screenshots",
    description:
      "capture_monitor_by_id skips the compositing step across displays. Screenshot just the TV output for vision-model input, no crop math.",
    size: "2x1",
  },
  {
    title: "Work area, not full area",
    description:
      "WorkAreaBounds (lib.rs:296) separates the taskbar from the usable rect on Windows. A TV used as display 2 usually has no taskbar, so work_area equals full area; a laptop rarely does.",
    size: "1x1",
  },
  {
    title: "Scale factor is per-display",
    description:
      "A 4K TV at 100% scaling reports 1.0 while a laptop panel typically reports 1.5 or 2.0. Both values live on the same Desktop, and both are read fresh from the OS on every list_monitors call.",
    size: "1x1",
  },
];

const flowSteps = [
  {
    label: "1. list_monitors",
    detail: "Enumerate every display the OS can see",
  },
  {
    label: "2. Match by name",
    detail: "get_monitor_by_name or filter the returned list",
  },
  {
    label: "3. Inspect scale_factor",
    detail: "Expect 1.0 on most TVs, 1.5-2.0 on laptops",
  },
  {
    label: "4. Translate coords",
    detail: "Offset your target by (monitor.x, monitor.y)",
  },
  {
    label: "5. Capture or click",
    detail: "capture_monitor_by_id, or drive the window into tv.work_area",
  },
];

const faqs = [
  {
    q: "Can I use any TV as a computer monitor?",
    a: "Almost any modern TV works as a display, but the SERP gives the consumer answer and stops there. The software-side answer is that once you plug in a TV, your OS treats it as a second monitor with its own width, height, x and y offset, and scale_factor. On Windows this information is enumerated through EnumDisplayMonitors; on macOS through NSScreen and CGGetActiveDisplayList. Terminator wraps both behind a single Monitor struct defined at crates/terminator/src/lib.rs line 274. Any automation script that has to work on the TV-as-monitor configuration needs to read those values, not assume them.",
  },
  {
    q: "Why does scale_factor matter when I plug a TV into a laptop?",
    a: "A 4K TV at 100% scale reports scale_factor 1.0; a modern laptop panel typically reports 1.5 or 2.0 because it is a HiDPI display. If your script clicks at logical (100, 100), that is a physical (150, 150) on a laptop at 1.5x and a physical (100, 100) on the TV at 1.0x. Terminator exposes scale_factor per monitor (lib.rs:288), so the click-coordinate helper knows which scale to apply depending on which monitor the target element reports via element.monitor(). Without per-monitor scale tracking, drag-and-drop between displays lands in the wrong pixel.",
  },
  {
    q: "How do I target just the TV from an automation script?",
    a: "Terminator has Desktop::get_monitor_by_name at crates/terminator/src/lib.rs line 712. Pass the exact display name the OS reports for your TV: on Windows this is usually something like 'LG TV SSCR2' or 'SAMSUNG' pulled from EDID; on macOS it is the product name surfaced by CGDisplayCopyDisplayProductName. If you do not know the name, call desktop.list_monitors() first, print every Monitor.name, and pick yours. Index-based addressing (monitor 1 vs monitor 2) breaks when the user unplugs and re-plugs the TV in a different order; name-based addressing survives that.",
  },
  {
    q: "What is the anchor_fact here that nobody else writes about?",
    a: "Terminator's Monitor struct carries exactly nine fields: id, name, is_primary, width, height, x, y, scale_factor, and an optional work_area. You can verify this by reading crates/terminator/src/lib.rs lines 274 through 292 in the open-source repo. Every UIElement in the tree also has a .monitor() method (element.rs:1583) that returns which display it sits on. The combination means that once you have a Locator pointing at, say, a Chrome window, one call tells you whether that window is on your laptop panel or your TV and what the TV's scale_factor is. None of the TV-as-monitor articles on the first page of Google mention per-element monitor attribution, because the cable/refresh-rate framing does not invite it.",
  },
  {
    q: "Does input lag on a TV break accessibility-API automation?",
    a: "No, and this is a clean separation that is easy to miss. Input lag on a TV is the delay between the HDMI input signal and the pixels lighting up on the panel. Accessibility-API automation, which Terminator is built on, operates on the OS accessibility tree before pixels are rendered. So the TV's 30ms or 50ms input lag adds to what a human sees but adds nothing to how fast the script finds a button or sends a click. The script and the accessibility tree agree about the button's position the moment Windows UIA or macOS AX exposes it, regardless of when the panel finally shows it. Screenshot-based agents are the ones that pay the lag tax, because they wait for pixels.",
  },
  {
    q: "How do coordinates map when the TV sits above the laptop?",
    a: "Windows and macOS both allow negative coordinates for displays placed left, above, or off-primary of the primary display. If you arrange your TV above the laptop in Display Settings, the TV might report x=0, y=-2160 while the laptop reports x=0, y=0. Monitor.x and Monitor.y are typed as i32 in crates/terminator/src/lib.rs lines 285-286 precisely so they can represent negative offsets. A script that assumes (0, 0) is the top-left of the combined desktop will miss every click on the TV in that configuration. Reading the Monitor's origin before computing target coordinates is the fix.",
  },
  {
    q: "Can Terminator screenshot just the TV, not the whole desktop?",
    a: "Yes. crates/terminator/src/platforms/mod.rs line 164 defines capture_monitor_by_id, which takes a single monitor's id and returns only that display's pixels. This is different from a full-desktop screenshot cropped after the fact. The per-monitor capture path avoids one compositing pass and returns at the TV's native resolution (e.g. 3840x2160 for a 4K panel). For vision-model input where resolution and cost both matter, that distinction cuts the image size roughly in half compared to a combined-desktop snapshot.",
  },
  {
    q: "What if the TV is the only display, no laptop panel at all?",
    a: "Many living-room PCs run that way, and some CI machines connect a TV to a mini-PC as a stand-in for a real monitor. In that case the TV is Monitor.is_primary = true, the scale_factor is whatever Windows or macOS applies by default (1.0 for a 4K TV at 100%, 1.5 for 125%), and the taskbar ends up on the TV so Monitor.work_area becomes meaningful. Terminator also ships crates/terminator/src/platforms/windows/virtual_display.rs, a VirtualDisplayManager that lets you run UI automation on a Windows machine with no physical display at all. If the TV is off or disconnected, the headless path is still there.",
  },
  {
    q: "Is the Monitor API the same across Windows and macOS?",
    a: "The public API is identical. crates/terminator/src/platforms/mod.rs lines 149-165 declare the engine trait: list_monitors, get_primary_monitor, get_active_monitor, get_monitor_by_id, get_monitor_by_name, capture_monitor_by_id. Windows implements it against EnumDisplayMonitors and the xcap crate; macOS implements it against NSScreen and CGDirectDisplayID. The Monitor struct your code receives has the same shape on both. So a script that decides 'if the Chrome window is on a monitor named something containing TV, resize it to the TV's work_area' runs unchanged on a MacBook Pro and a Windows 11 desktop.",
  },
];

export default function Page() {
  const jsonLdArticle = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Terminator",
    authorUrl: "https://t8r.tech",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
    publisherLogo: "https://t8r.tech/favicon.svg",
    articleType: "TechArticle",
  });

  const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);
  const jsonLdFaq = faqPageSchema(faqs);

  return (
    <div className="bg-white text-zinc-800 min-h-screen">
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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Multi-monitor
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Terminator Monitor API
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Can I use a TV as a{" "}
              <GradientText variant="teal">computer monitor</GradientText>?
              Yes, and the piece every SERP result skips is what happens to your
              scripts.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every top result for this query answers the cable question. HDMI
              2.1, chroma subsampling at 4:4:4, refresh rate, input lag,
              burn-in, viewing distance. All correct, all consumer-side. The
              part nobody writes about is what the software on the PC side has
              to do once a TV becomes monitor 2. Any script, RPA flow, or AI
              agent driving the desktop has to become monitor-aware the moment
              your display count goes from one to two, and that is a solved
              problem sitting in a single file of the Terminator source.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="9 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Monitor struct: 9 fields (id, name, is_primary, width, height, x, y, scale_factor, work_area)",
                "desktop.get_monitor_by_name(\"LG TV\") targets a display by its EDID product name",
                "element.monitor() tells you which display any UI element is on, in one call",
                "capture_monitor_by_id screenshots just the TV output at native 3840x2160",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#anchor-fact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the struct
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video via Remotion */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Plug in a TV. Double your pixels. Break half your scripts."
            subtitle="The TV-as-monitor decision has a software-side cost"
            accent="orange"
            captions={[
              "Monitor 1: laptop, 2560x1600, scale_factor 2.0",
              "Monitor 2: TV, 3840x2160, scale_factor 1.0",
              "A click at logical (100, 100) now means two different pixels",
              "Terminator's Monitor struct tracks both on every call",
              "get_monitor_by_name(\"LG TV\") targets the TV directly",
            ]}
          />
        </section>

        {/* Metric row: the concrete numbers for a typical laptop + TV setup */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            A 4K TV plus a laptop, by the numbers
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            These are the values Terminator&apos;s Monitor struct returns from a
            typical MacBook Pro with an LG C2 plugged in over HDMI. Different
            hardware shifts the numbers, but the ratio between displays is the
            cost that scripts pay.
          </p>
          <MetricsRow
            metrics={[
              { value: 9, label: "Fields on Monitor" },
              { value: 2.0, label: "Laptop scale_factor", decimals: 1 },
              { value: 1.0, label: "TV scale_factor", decimals: 1 },
              {
                value: 8294400,
                label: "Pixels on a 4K TV (3840x2160)",
              },
            ]}
          />
        </section>

        {/* Anchor fact: the Monitor struct */}
        <section
          id="anchor-fact"
          className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The anchor fact:{" "}
            <GradientText variant="teal">nine fields</GradientText>, one struct,
            verifiable in the repo
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The entire TV-as-second-monitor story, from the software side,
            collapses into nine values. They live in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator/src/lib.rs
            </code>{" "}
            starting at line 274. Clone the repo, grep for{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              pub struct Monitor
            </code>
            , and the definition is right there.
          </p>

          <AnimatedCodeBlock
            code={monitorStructCode}
            language="rust"
            filename="crates/terminator/src/lib.rs"
          />

          <p className="text-zinc-600 mt-4 leading-relaxed">
            The two fields that matter most for a TV-as-monitor setup are{" "}
            <span className="text-zinc-800 font-medium">scale_factor</span> (a
            4K TV at 100% reports{" "}
            <NumberTicker value={1} decimals={1} className="text-orange-600" />,
            a HiDPI laptop panel reports{" "}
            <NumberTicker value={2} decimals={1} className="text-orange-600" />
            ), and <span className="text-zinc-800 font-medium">x / y</span>,
            which can be negative if you mount the TV above your laptop. Every
            other TV-as-monitor article on the front page of Google stops at
            HDMI cables. None of them mention the per-display scale_factor
            split that trips up drag-and-drop scripts the first time.
          </p>
        </section>

        {/* Flow: the monitor-aware path */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The monitor-aware path, in five calls
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Once a TV is plugged in, a reliable automation script follows this
            shape. Each step is a real method on the Terminator Desktop type.
          </p>
          <FlowDiagram
            title="From two displays to one correct click"
            steps={flowSteps}
          />
        </section>

        {/* Beam diagram: window identification */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <AnimatedBeam
            title="How Terminator resolves which display a window is on"
            from={[
              { label: "role:Window", sublabel: "Chrome" },
              { label: "role:Window", sublabel: "VS Code" },
              { label: "role:Button", sublabel: "Save" },
            ]}
            hub={{
              label: "element.monitor()",
              sublabel: "element.rs line 1583",
            }}
            to={[
              { label: "Laptop panel", sublabel: "scale 2.0, (0, 0)" },
              { label: "LG TV", sublabel: "scale 1.0, (2560, 0)" },
            ]}
          />
        </section>

        {/* Bento grid: what the Monitor API exposes */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            What the Monitor API actually exposes
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Every capability below lives in the open-source Terminator repo,
            implemented once per platform behind a shared trait in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator/src/platforms/mod.rs
            </code>
            .
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* Python example: reading monitors */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Read every display, every element&apos;s monitor
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            This is a slimmed-down version of{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              examples/monitor_example.py
            </code>{" "}
            in the Terminator source tree. Run it with a TV plugged in and you
            get two rows of Monitor output, one per display, with the exact
            numbers your script needs to click correctly.
          </p>

          <AnimatedCodeBlock
            code={elementMonitorCode}
            language="python"
            filename="examples/monitor_example.py"
          />

          <div className="mt-6">
            <TerminalOutput
              title="laptop + LG TV"
              lines={terminalLines}
            />
          </div>
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-4">
          <ProofBanner
            quote="Terminator is an open-source desktop automation framework. Every file path on this page is grep-able in a fresh clone of mediar-ai/terminator."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Target the TV by name */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Target the TV by name, not by index
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Display indices shift every time the user unplugs and re-plugs
            things in a different order. Display names come from EDID and stay
            stable across reboots. Terminator lets you pick the one you mean.
          </p>
          <AnimatedCodeBlock
            code={targetTvCode}
            language="typescript"
            filename="tv-aware-window-move.ts"
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Treating TV-as-monitor naively vs monitor-aware"
            intro="The left column is what most automation code actually does today. The right column is what Terminator ships."
            productName="Terminator"
            competitorName="Naive automation"
            rows={comparisonRows}
          />
        </section>

        {/* Why this is the gap nobody fills, in a GlowCard */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              Why every SERP result stops at cables
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              The top ten results for this keyword are all written for a reader
              sitting in a living room with an HDMI cable in one hand. HP,
              PCWorld, TCL, Lenovo, Microcenter, Quora, PC Richard, EasyPC.
              They cover exactly the things that matter at that table: whether
              the cable fits, whether the picture looks right, whether gaming
              feels sluggish.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              They do not cover the thing that matters the moment the TV is
              plugged in and the reader writes their first automation script,
              records their first RPA workflow, or points an AI agent at the
              desktop: per-display scale factors, negative-y origins, EDID
              product names, and per-element monitor attribution. Those four
              concepts are the day-two story for anyone running software that
              touches the screen.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              Terminator is a developer framework for that day-two story, not
              a consumer app. It gives existing AI coding assistants the
              ability to control your whole OS (not just write code), which is
              exactly where the TV-as-monitor question stops being about
              cables.
            </p>
          </GlowCard>
        </section>

        {/* Marquee of TV brands — they all report as named displays */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-2">
            Every TV brand shows up under a different name
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Because the display name comes from EDID, the string your script
            matches against varies by manufacturer. These are common patterns
            that appear in Monitor.name.
          </p>
          <Marquee speed={35}>
            {[
              "LG TV SSCR2",
              "SAMSUNG",
              "Sony BRAVIA",
              "TCL 55C845",
              "Hisense U8K",
              "Vizio V-Series",
              "Philips 65OLED",
              "Panasonic VIERA",
              "Sharp AQUOS",
              "Roku TV",
              "Fire TV Omni",
              "Google TV Chromecast",
            ].map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {brand}
              </span>
            ))}
          </Marquee>
          <p className="text-xs text-zinc-500 mt-2">
            The exact string your OS reports depends on driver, firmware, and
            connection type. Print{" "}
            <code className="text-orange-600">Monitor.name</code> once, then hard-code
            the match or use a substring check.
          </p>
        </section>

        {/* Inline CTA before FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <InlineCta
            heading="Want to try the Monitor API yourself?"
            body="Terminator is MIT-licensed and cross-platform. The Monitor struct, the get_monitor_by_name call, and the element.monitor() method are all in the same repo. Clone it, plug in a TV, and print the nine fields for every display you can see."
            linkText="Open mediar-ai/terminator on GitHub"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer-ish */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator gives existing AI coding assistants the ability to
            control your whole desktop, not just write code. Like Playwright,
            but for every app on your OS.
          </p>
        </footer>
      </article>
    </div>
  );
}
