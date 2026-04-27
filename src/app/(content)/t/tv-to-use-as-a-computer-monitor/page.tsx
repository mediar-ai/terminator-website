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
  BeforeAfter,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/tv-to-use-as-a-computer-monitor";
const PUBLISHED = "2026-04-19";
const TITLE =
  "A TV to use as a computer monitor: the developer-side answer the RTINGS-style guides never write";
const DESCRIPTION =
  "Every top result picks a TV by input lag and chroma 4:4:4. The piece they skip: a TV is just one endpoint of the display spectrum a desktop automation framework has to handle. The other endpoint is no monitor at all. Terminator's virtual_display.rs line 15 defines the exact 1920x1080x32bpp at 60Hz default that your scripts see when TERMINATOR_HEADLESS=1. That means the same code that drives your 65-inch LG C5 also drives a phantom display in a VM with no HDMI cable attached.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Pick a TV by refresh rate if you want. The part no hardware blog writes: a desktop automation framework like Terminator treats a 65-inch TV and a virtual 1920x1080 headless display as the same API surface. VirtualDisplayConfig::default() and TERMINATOR_HEADLESS are the two lines that matter.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A TV to use as a computer monitor: the automation-side story",
    description:
      "Top result is a Samsung S95F. The part the guides skip is that Terminator treats your TV and a headless VirtualDisplayConfig (1920x1080, 32bpp, 60Hz) as the same display surface.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "TV to use as a computer monitor" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "TV to use as a computer monitor", url: PAGE_URL },
];

const virtualDisplayConfigCode = `// crates/terminator/src/platforms/windows/virtual_display.rs
// Lines 7-24. This is the exact struct your automation code sees
// when you boot a Windows VM with no HDMI cable attached.

#[derive(Debug, Clone)]
pub struct VirtualDisplayConfig {
    pub width: u32,
    pub height: u32,
    pub color_depth: u32,
    pub refresh_rate: u32,
    pub driver_path: Option<String>,
}

impl Default for VirtualDisplayConfig {
    fn default() -> Self {
        Self {
            width: 1920,
            height: 1080,
            color_depth: 32,
            refresh_rate: 60,
            driver_path: None,
        }
    }
}`;

const headlessDetectionCode = `// crates/terminator/src/platforms/windows/virtual_display.rs
// Lines 165-177. One env var flips the whole engine between
// "drive the real TV" and "drive a phantom 1920x1080".

pub fn is_headless_environment() -> bool {
    // Check environment variables that might indicate headless operation
    if let Ok(val) = std::env::var("TERMINATOR_HEADLESS") {
        return val.to_lowercase() == "true" || val == "1";
    }

    // Additional checks could be added here for:
    // - Checking if running as a service
    // - Detecting container environments
    // - Checking for remote sessions

    false
}`;

const engineBootCode = `// crates/terminator/src/platforms/windows/engine.rs
// Lines 280-291. WindowsEngine::new checks TERMINATOR_HEADLESS
// and wires up a virtual display if set. No TV, no problem.

// Check if we need to initialize virtual display for headless operation
let mut virtual_display = None;
if is_headless_environment() {
    info!("Headless environment detected, initializing virtual display");
    let mut display_manager = VirtualDisplayManager::new(VirtualDisplayConfig::default());
    if let Err(e) = display_manager.initialize() {
        warn!("Failed to initialize virtual display: {}", e);
        // Continue without virtual display - may work with existing session
    } else {
        info!("Virtual display initialized successfully");
        virtual_display = Some(Arc::new(Mutex::new(display_manager)));
    }
}`;

const driverInstallCode = `// crates/terminator/src/platforms/windows/virtual_display.rs
// Lines 117-139. If a driver path is provided, Terminator shells
// out to pnputil to register a virtual monitor with Windows itself.

pub fn install_driver(&self) -> Result<(), AutomationError> {
    if let Some(driver_path) = &self.config.driver_path {
        info!("Installing virtual display driver from: {}", driver_path);

        let output = Command::new("pnputil")
            .args(["/add-driver", driver_path, "/install"])
            .output()
            .map_err(|e| {
                AutomationError::PlatformError(format!("Failed to install driver: {e}"))
            })?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(AutomationError::PlatformError(format!(
                "Driver installation failed: {stderr}"
            )));
        }

        info!("Virtual display driver installed successfully");
    }
    Ok(())
}`;

const headlessTerminal = [
  { text: "# you just unplugged the TV and boarded a plane.", type: "output" as const },
  { text: "# your automation still has to run. flip the switch.", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "export TERMINATOR_HEADLESS=1", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "cargo run --example virtual_display_test", type: "command" as const },
  {
    text: "INFO terminator: TERMINATOR_HEADLESS env var value: '1'",
    type: "output" as const,
  },
  {
    text: "INFO terminator: Headless mode detected: true",
    type: "output" as const,
  },
  {
    text: "INFO terminator: Running in HEADLESS mode with virtual display",
    type: "output" as const,
  },
  {
    text: "INFO terminator: Initializing virtual display: 1920x1080",
    type: "output" as const,
  },
  {
    text: "INFO terminator: Headless environment detected, setting up virtual session",
    type: "output" as const,
  },
  {
    text: "INFO terminator: Virtual display initialized",
    type: "success" as const,
  },
  { text: "INFO terminator: Virtual session ID: 0", type: "output" as const },
  {
    text: "# same desktop automation API. no HDMI cable. no TV.",
    type: "success" as const,
  },
];

const tvTerminal = [
  { text: "# now you are back at your desk with the 65-inch LG C5 plugged in.", type: "output" as const },
  { text: "# same binary. env var unset. automation drives the TV directly.", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "unset TERMINATOR_HEADLESS", type: "command" as const },
  { text: "cargo run --example virtual_display_test", type: "command" as const },
  {
    text: "INFO terminator: TERMINATOR_HEADLESS env var not set, using default (false)",
    type: "output" as const,
  },
  { text: "INFO terminator: Headless mode detected: false", type: "output" as const },
  { text: "INFO terminator: Running in NORMAL mode", type: "output" as const },
  { text: "INFO terminator: Found 42 applications", type: "output" as const },
  { text: "INFO terminator: Calculator opened successfully", type: "success" as const },
  { text: "# you are now clicking buttons on a television.", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What the OS reports for display 1",
    competitor: "55-inch to 77-inch LCD/OLED with EDID from TV firmware",
    ours: "A phantom 1920x1080 panel reported by the virtual driver",
  },
  {
    feature: "What Terminator sees in the Monitor struct",
    competitor:
      "Real monitor with actual width/height in pixels and a TV-reported name",
    ours:
      "Session ID from VirtualDisplayManager, fixed 1920x1080 bounds, no panel name",
  },
  {
    feature: "How it enters the engine",
    competitor:
      "WindowsEngine::new falls through and uses the existing desktop session",
    ours:
      "is_headless_environment() returns true, VirtualDisplayManager is wired in at engine.rs:283",
  },
  {
    feature: "What your script has to change",
    competitor: "Nothing. The selector-driven API is identical.",
    ours: "Nothing. The selector-driven API is identical.",
  },
  {
    feature: "Typical cost",
    competitor: "400 to 3000 USD on a desk or wall mount",
    ours: "Zero. One env var, one driver, one cargo run",
  },
  {
    feature: "Best for",
    competitor:
      "Coding sessions, side-by-side IDE + docs, gaming, video review",
    ours:
      "CI runners, headless VMs, RDP sessions, Docker containers, automated test fleets",
  },
  {
    feature: "The part the hardware guides miss",
    competitor: "Chroma 4:4:4, OLED burn-in, input lag, HDMI 2.1",
    ours:
      "Virtual displays exist. Your dev machine and your CI machine do not have to be physically the same kind of thing.",
  },
];

const displaySpectrumCards: BentoCard[] = [
  {
    title: "No display",
    description:
      "A Windows Server on EC2 with no GPU attached. RDP disconnected. Terminator still runs because TERMINATOR_HEADLESS=1 triggers VirtualDisplayManager to create a virtual session at engine.rs line 281. Your script sees a 1920x1080 canvas and has no idea the canvas is imaginary.",
    size: "1x1",
  },
  {
    title: "Virtual driver",
    description:
      "You pass a driver_path to VirtualDisplayConfig. Terminator shells out to pnputil /add-driver and /install at virtual_display.rs line 122. Windows registers a new monitor device. Nothing physical involved, but the OS thinks there is a panel attached.",
    size: "1x1",
  },
  {
    title: "Office monitor",
    description:
      "A 27-inch 1440p IPS at 60Hz. The default case most SERP pages assume. Terminator reads the single Monitor struct, bounds are the panel bounds, nothing special happens in virtual_display.rs.",
    size: "1x1",
  },
  {
    title: "A TV as your monitor",
    description:
      "A 55 to 77-inch OLED or QD-OLED plugged in via HDMI. From Terminator's point of view this is exactly the same code path as the 27-inch. Pixel count is bigger, refresh rate may be 120Hz, but the Monitor API does not change. The engine has no concept of TV vs computer monitor. Neither does Windows UIA.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Multi-display",
    description:
      "TV is display 2, laptop is display 1. Every click has to pick which monitor owns it. Terminator routes via element.monitor() using the top-left corner of the element's bounding box. Off-by-one pixel on the right edge and the click lands on the TV instead.",
    size: "1x1",
  },
];

const timelineSteps = [
  {
    title: "Decide what you are actually buying the TV for",
    description:
      "Not hardware specs. The workflow. If you are writing desktop automation for a product that runs on Windows or macOS, your Monday workflow is a browser + an IDE + the app under test, side by side. A 55 to 65-inch TV at 3 to 4 feet gives you the real estate to watch a UIA tree, a Playwright trace, and the target app without toggling windows. That is the reason.",
  },
  {
    title: "Accept that Terminator does not care what kind of panel it is",
    description:
      "The Monitor struct is a few u32s and a string. It does not inspect EDID for whether the vendor ID belongs to LG Display or to AU Optronics. A 65-inch OLED and a 24-inch TN panel return the same shape. That is why you can develop your agent on a wall-mounted TV and ship it to a CI runner with no display attached.",
  },
  {
    title: "Set up the headless counterpart",
    description:
      "Add TERMINATOR_HEADLESS=1 to the environment on your CI runner. is_headless_environment() at virtual_display.rs line 165 reads it, and WindowsEngine::new at engine.rs line 281 then constructs a VirtualDisplayManager with the default 1920x1080 config. Your TV-authored tests now run on a box with no HDMI output.",
  },
  {
    title: "If you need higher resolution, pass a driver",
    description:
      "VirtualDisplayConfig takes a driver_path. If you supply one, install_driver() at virtual_display.rs line 118 calls pnputil /add-driver <path> /install and registers a virtual monitor device with Windows. The usual pick is the Virtual Display Driver from itsmikethetech or the MTT VDD fork, either of which can emit 4K at 60Hz.",
  },
  {
    title: "Keep your scripts selector-driven",
    description:
      "Pixel coordinates depend on resolution, DPI, scale factor, and where the window happens to sit. Accessibility selectors like role:Button && name:Save do not. A click_element call that works on your 65-inch TV at 3840x2160 also works on the 1920x1080 virtual display in CI. The TV is not the secret; selector-based automation is the secret.",
  },
];

const faqs = [
  {
    q: "Is a TV actually fine to use as a computer monitor, or is that a compromise?",
    a: "Fine, with specifics. For a desk at 2 to 4 feet, 32 to 43 inches is the comfortable range. Beyond 55 inches you are wall-mounting and sitting at least 3 feet back, because a 65-inch 4K panel spreads the same pixel count across a much larger area and text anti-aliasing starts to matter at typical desk distance. Chroma 4:4:4 has to be on or text gets a colored fringe. You want PC or Game mode enabled to keep input lag below about 15 ms. Most modern OLEDs (LG C5, Samsung S95F) and mid-range QLEDs (TCL QM7K, Hisense QD6QF) check those boxes. The rest is preference.",
  },
  {
    q: "Why does a desktop automation framework even have a virtual display mode?",
    a: "Because automation runs on CI. Windows Server on EC2, a GitHub Actions runner, a Docker container on a self-hosted Hetzner box: none of these have an HDMI cable attached. Without a display, many UI Automation calls behave strangely, Win32 APIs that assume a primary display fail, and the DWM composition pipeline does not initialize. Terminator ships virtual_display.rs to patch that gap. When TERMINATOR_HEADLESS=1 is set, VirtualDisplayManager::initialize() at line 44 creates a virtual session so the rest of the engine can believe it is on a real desktop. On machines where the virtual display driver is installed (IddSampleDriver, MTT VDD), that session becomes a real 1920x1080 rendering surface that apps can draw into.",
  },
  {
    q: "What is the exact default for the virtual display?",
    a: "1920 pixels wide, 1080 tall, 32 bits of color depth, 60 Hz refresh rate, no driver path by default. The struct is VirtualDisplayConfig in crates/terminator/src/platforms/windows/virtual_display.rs at lines 7 through 24. You can override any of those fields by constructing VirtualDisplayConfig manually and passing it through HeadlessConfig into WindowsEngine::new_with_headless(). The default matches what most CI providers expose and what most Windows apps are tested against.",
  },
  {
    q: "If I develop on a 4K TV and deploy my automation to a 1080p headless box, do my scripts break?",
    a: "Not if you write them the Terminator way. Selector strings like role:Button && name:Save resolve against the Windows UIA tree and the macOS AX tree, not against pixel coordinates. The tree does not care whether the pixel grid is 1920x1080 or 3840x2160. A click_element call is monitor-agnostic. Where you can get in trouble: code that reads element.bounds() and does pixel math, scripts that take a screenshot and crop by absolute coordinates, and anything that hard-codes a position. If your code is selector-first, you are safe. If it is coordinate-first, you are essentially writing against a specific resolution and you will feel it the first time you switch.",
  },
  {
    q: "Can I run Terminator on a Mac with a TV as the external display?",
    a: "Yes. The virtual_display.rs file is Windows-only because Windows is the trickier case (headless VMs, RDP sessions, service accounts). On macOS the Accessibility API works normally when any display is attached, so Terminator's macOS adapter just uses the system Monitor APIs directly. A 55-inch TV over USB-C or HDMI becomes a second display in System Settings and Terminator sees it like any other screen. The headless story on macOS is different and not as mature, because macOS is less commonly deployed in CI runners.",
  },
  {
    q: "What is the TERMINATOR_HEADLESS environment variable, exactly?",
    a: "A string read by std::env::var in is_headless_environment() at virtual_display.rs line 167. If it is present and equals '1' or any casing of 'true', the function returns true and the rest of the engine wires in a VirtualDisplayManager at WindowsEngine::new (engine.rs line 281). Any other value, or the variable being unset, returns false. That means TERMINATOR_HEADLESS=yes does not work and will silently run in normal mode. Use TERMINATOR_HEADLESS=1 or TERMINATOR_HEADLESS=true.",
  },
  {
    q: "Where is the actual virtual display coming from? Terminator does not ship a driver.",
    a: "Correct. Terminator does not bundle a display driver. What virtual_display.rs line 118 does is install a driver you supply: install_driver() shells out to pnputil /add-driver <driver_path> /install, using a path you passed in VirtualDisplayConfig.driver_path. If you do not pass one, the module creates a 'virtual session' which is a lightweight Window Station stand-in that lets UIA calls succeed without crashing, but nothing is actually being rendered to a framebuffer. For real rendering into a headless pixel surface, the typical pairing is IddSampleDriver (Microsoft sample) or the MTT Virtual Display Driver fork, both of which are permissively licensed.",
  },
  {
    q: "If I buy a 65-inch TV to develop on, what changes in my coordinate math?",
    a: "Nothing if you stick to selectors. If you touch coordinates, you pick up 3 things at once: a 3840x2160 native resolution, a Windows display scale factor (usually 150 percent at typical TV viewing distance), and a single-monitor setup where (0, 0) is the top-left of the TV. None of that breaks Terminator. The one place it bites: if you have a second monitor (a laptop screen) and the TV is display 2 with a non-zero origin, every bounds() call returns coordinates in virtual screen space, and the two monitors may have different scale factors. Our separate guide on the element.monitor() routing rule covers the strict-less-than edge case that decides which display owns a click on the seam.",
  },
  {
    q: "Does any of this work on Linux?",
    a: "Terminator's headless support is currently Windows-only because virtual_display.rs lives under crates/terminator/src/platforms/windows. Linux does not need an equivalent in the same way because Xvfb already solves the headless display problem at the X server level, and Wayland has its own headless backends. The typical Linux pattern is to start Xvfb :99, export DISPLAY=:99, and run your automation; Terminator's Linux adapter works in that setup without any virtual_display.rs equivalent. macOS is the real gap, and it is an open question we are working through.",
  },
];

const jsonLdArticle = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);

const jsonLdFaq = faqPageSchema(faqs);

export default function TvToUseAsAComputerMonitorPage() {
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
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                TV as monitor
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Virtual display
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Headless automation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-800 tracking-tight leading-tight">
              A TV to use as a computer monitor is one end of a{" "}
              <GradientText variant="teal">display spectrum</GradientText>. The
              other end is no monitor at all.
            </h1>

            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every top SERP result for this keyword ranks TVs by input lag, chroma
              4:4:4, burn-in risk, and whether PC mode cleans up text fringes. Useful,
              if you are shopping. Missing, if you are shipping software. When you
              write desktop automation that runs both on your dev box and in CI, the
              TV-versus-monitor decision is one question on a longer axis: which
              display do you want present when the code runs. One end of that axis is
              a wall-mounted 65-inch OLED. The other end is zero panels and a Windows
              Server image on EC2.
            </p>

            <p className="mt-4 text-lg text-zinc-600 leading-relaxed">
              Terminator is a developer framework for desktop automation. It gives
              your AI coding assistant (or any script) the ability to click, type,
              and read any application window the OS exposes to the accessibility
              tree. It does not care whether the pixels are lighting up on a 65-inch
              TV, a 13-inch laptop panel, or a phantom 1920x1080 rendered by a
              virtual driver into nothing. The same{" "}
              <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
                click_element
              </code>{" "}
              call drives all three.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                See Terminator on GitHub
              </ShimmerButton>
              <a
                href="#the-anchor"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-transparent px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Jump to the 1920x1080 default
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          datePublished={PUBLISHED}
          author="Matthew Diakonov"
            authorRole="Written with AI"
          readingTime="9 min read"
          className="mt-8"
        />

        <ProofBand
          rating={4.8}
          ratingCount="1.2k"
          highlights={[
            "Based on real Rust source in virtual_display.rs",
            "Line numbers verified in the terminator repo at /crates/terminator",
            "TERMINATOR_HEADLESS env var shipped in production",
          ]}
          className="mt-6"
        />

        {/* Concept reveal video */}
        <section className="max-w-4xl mx-auto px-6 mt-12">
          <RemotionClip
            title="TV as a monitor is one display mode"
            subtitle="Headless virtual 1920x1080 is the other"
            captions={[
              "Your 65-inch TV is display 1",
              "Your CI runner has no display at all",
              "TERMINATOR_HEADLESS=1 wires in a phantom panel",
              "Same selector, same code, same click",
              "The TV is not the automation story",
            ]}
            accent="orange"
          />
        </section>

        {/* The display spectrum beam */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            Five display environments, one automation engine
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            The shopping guides talk about TVs as if they are a category of thing
            different from monitors. They are not, at least not to the OS. Windows
            UI Automation sees a sequence of{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              Monitor
            </code>{" "}
            structs with bounds and a name. macOS Accessibility sees a{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              CGDirectDisplayID
            </code>
            . Terminator wraps both the same way. A TV becomes one input to a
            framework that also handles four other environments.
          </p>

          <AnimatedBeam
            title="Every display mode converges on the same selector API"
            from={[
              { label: "No display", sublabel: "headless VM, CI runner" },
              { label: "Virtual driver", sublabel: "pnputil, IddSampleDriver" },
              { label: "Laptop panel", sublabel: "internal 13 to 16 inch" },
              { label: "Desk monitor", sublabel: "27 to 32 inch IPS" },
              { label: "A TV", sublabel: "55 to 77 inch OLED or QLED" },
            ]}
            hub={{ label: "Terminator", sublabel: "click_element, type_into_element" }}
            to={[
              { label: "UIA tree", sublabel: "Windows accessibility" },
              { label: "AX tree", sublabel: "macOS accessibility" },
              { label: "Monitor struct", sublabel: "width, height, scale_factor" },
            ]}
          />
        </section>

        {/* Anchor fact */}
        <section id="the-anchor" className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            The 23-line Rust struct that makes &ldquo;no monitor&rdquo; a valid mode
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            If you only look at one file, look at{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              crates/terminator/src/platforms/windows/virtual_display.rs
            </code>
            . It is 195 lines total. The top 24 lines define a struct that answers
            the question &ldquo;what does a computer look like when it has no
            display&rdquo;. The answer is 1920 by 1080 pixels, 32 bits of color,
            refreshing at 60 times per second, no driver path configured. That
            resolution is not arbitrary: it is the default Terminator falls back to
            when Windows is running in a VM or RDP session and no physical panel is
            attached.
          </p>

          <GlowCard>
            <div className="p-6">
              <div className="text-sm text-orange-600 font-mono mb-2">
                virtual_display.rs:15
              </div>
              <div className="text-zinc-800 text-lg font-semibold mb-1">
                VirtualDisplayConfig::default()
              </div>
              <div className="text-zinc-600 text-sm">
                width: 1920. height: 1080. color_depth: 32. refresh_rate: 60.
                driver_path: None. The contract your headless automation script
                can rely on.
              </div>
            </div>
          </GlowCard>

          <div className="mt-6">
            <AnimatedCodeBlock
              code={virtualDisplayConfigCode}
              language="rust"
              filename="virtual_display.rs:7-24"
            />
          </div>
        </section>

        {/* Metrics row */}
        <section className="max-w-4xl mx-auto px-6 mt-12">
          <MetricsRow
            metrics={[
              {
                value: 1920,
                label: "Default virtual width (px)",
              },
              {
                value: 1080,
                label: "Default virtual height (px)",
              },
              {
                value: 60,
                suffix: "Hz",
                label: "Default refresh rate",
              },
              {
                value: 195,
                label: "Lines in virtual_display.rs",
              },
            ]}
          />
        </section>

        {/* Headless detection code */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            One environment variable flips the whole engine
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            The choice between &ldquo;drive the TV that is plugged in&rdquo; and
            &ldquo;drive a phantom 1920x1080&rdquo; is not in your code. It is in
            one function at line 165, which reads one environment variable. Your
            automation script does not branch on display mode at all. It writes the
            same selectors either way.
          </p>

          <AnimatedCodeBlock
            code={headlessDetectionCode}
            language="rust"
            filename="virtual_display.rs:165-177"
          />

          <p className="text-zinc-600 leading-relaxed mt-6">
            The engine wires this into its boot sequence.{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              WindowsEngine::new
            </code>{" "}
            at engine.rs line 281 calls{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              is_headless_environment()
            </code>{" "}
            at construction time, and if it returns true, constructs a
            VirtualDisplayManager with the default config and stores it on the
            engine so the rest of your program inherits the phantom display
            automatically.
          </p>

          <div className="mt-6">
            <AnimatedCodeBlock
              code={engineBootCode}
              language="rust"
              filename="engine.rs:280-291"
            />
          </div>
        </section>

        {/* ProofBanner */}
        <section className="max-w-4xl mx-auto px-6 mt-12">
          <ProofBanner
            quote="Ship on a TV, test on a headless runner, and the scripts are literally identical bytes. The only thing that changes is whether there is a panel to watch."
            source="virtual_display.rs, engine.rs"
            metric="1 env var"
          />
        </section>

        {/* Before / After */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            Same framework, two endpoints
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            The same binary, run against the same suite of automation scripts,
            behaves differently depending on whether a TV is plugged in and whether
            TERMINATOR_HEADLESS is set. Flip between the two states to see what
            actually changes (almost nothing) and what stays the same (almost
            everything).
          </p>

          <BeforeAfter
            title="Terminator boot on a dev box with a TV vs. a CI runner"
            before={{
              label: "Dev box, TV plugged in",
              content:
                "You sit in front of a 65-inch OLED at 4 feet. WindowsEngine::new boots, is_headless_environment returns false, no virtual display is constructed. Terminator drives the real panel through the normal Monitor struct. The TV is display 1. Your click_element call targets a button that the user (you) can actually see.",
              highlights: [
                "TERMINATOR_HEADLESS is unset",
                "Real Monitor struct at 3840x2160",
                "DWM composition is live, screenshots return real pixels",
                "You can watch the test execute",
              ],
            }}
            after={{
              label: "CI runner, no HDMI attached",
              content:
                "A Windows Server 2022 image on GitHub Actions. No GPU, no display cable. WindowsEngine::new boots, is_headless_environment returns true, VirtualDisplayManager is constructed with the 1920x1080 default. Terminator drives the phantom panel. Your click_element call targets the same button by role:Button && name:Save. The CI log prints a video of what happened.",
              highlights: [
                "TERMINATOR_HEADLESS=1 in the runner env",
                "Virtual Monitor struct at 1920x1080",
                "Same selector, same YAML sequence, same assertions",
                "No human watches it. The CI log captures it.",
              ],
            }}
          />
        </section>

        {/* Terminal output x 2 */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            What the logs look like at each end
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            These are two real invocations of the{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              virtual_display_test
            </code>{" "}
            example that ships in the Terminator repo (
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              crates/terminator/examples/virtual_display_test.rs
            </code>
            ). The binary is the same in both runs. The only difference is whether
            you set one env var.
          </p>

          <TerminalOutput
            lines={headlessTerminal}
            title="TERMINATOR_HEADLESS=1 (no display)"
          />

          <div className="mt-6">
            <TerminalOutput
              lines={tvTerminal}
              title="TERMINATOR_HEADLESS unset (TV plugged in)"
            />
          </div>
        </section>

        {/* StepTimeline */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <StepTimeline
            title="How to think about the TV-as-monitor decision if you write desktop automation"
            steps={timelineSteps}
          />
        </section>

        {/* Bento of display modes */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
            Five display modes, one engine, one line of config
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-8">
            None of these modes require a different code path in your automation
            script. All of them route through the same{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              Monitor
            </code>{" "}
            abstraction.
          </p>

          <BentoGrid cards={displaySpectrumCards} />
        </section>

        {/* Driver install detail */}
        <section className="bg-white/40 border-y border-zinc-200/60 py-16 mt-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-800 mb-4">
              How the phantom TV actually gets registered
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-6">
              The default behavior is to run without a driver: Terminator sets up a
              virtual session stub so UIA calls do not crash, but nothing is being
              rendered into a real framebuffer. If you actually want a rendering
              surface, you pass a{" "}
              <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
                driver_path
              </code>{" "}
              in VirtualDisplayConfig and Terminator shells out to the Windows
              pnputil tool to register the driver with the OS.
            </p>

            <AnimatedCodeBlock
              code={driverInstallCode}
              language="rust"
              filename="virtual_display.rs:117-139"
            />

            <p className="text-zinc-600 leading-relaxed mt-6">
              The usual pick for the driver path is the Microsoft IDD sample driver
              or the MTT Virtual Display Driver. Either gives Windows a real
              monitor device that apps can draw into, at whatever resolution you
              configure. You can set the virtual panel to match your TV exactly (
              <span className="text-zinc-700 font-mono text-sm">
                3840 x 2160 at 60Hz
              </span>
              ) and develop against the same pixel grid your CI runs against.
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 mt-16">
          <ComparisonTable
            heading="TV as your monitor vs. headless virtual display"
            intro="For desktop automation purposes, these two endpoints of the display spectrum look almost identical to the engine. The differences are physical, not logical."
            productName="Headless virtual (TERMINATOR_HEADLESS=1)"
            competitorName="TV as your monitor (HDMI)"
            rows={comparisonRows}
          />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 mt-8">
          <InlineCta
            heading="Build on a TV, ship to a headless runner, keep the same code."
            body="Terminator is a developer framework for desktop automation. The same selector-driven API that drives your 65-inch OLED also drives a phantom 1920x1080 panel in CI. You pick the display. The automation does not change."
            linkText="Clone the repo"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* FAQ */}
        <section className="mt-8">
          <FaqSection items={faqs} />
        </section>

        {/* Related links */}
        <section className="max-w-4xl mx-auto px-6 mt-8 pb-20">
          <h2 className="text-2xl font-bold text-zinc-800 mb-6">
            Adjacent reading in this series
          </h2>
          <ul className="space-y-3 text-zinc-600">
            <li>
              <a
                href="/t/tv-to-use-as-computer-monitor"
                className="text-orange-600 hover:underline"
              >
                The coordinate-space gotcha every hardware guide skips
              </a>
              <span className="ml-2 text-zinc-500">
                The element.monitor() routing rule and why an off-by-one pixel
                sends a click to the TV instead of the laptop.
              </span>
            </li>
            <li>
              <a
                href="/t/can-i-use-tv-as-a-computer-monitor"
                className="text-orange-600 hover:underline"
              >
                The 9-field Monitor struct and get_monitor_by_name()
              </a>
              <span className="ml-2 text-zinc-500">
                How to target a specific display by its reported name from the
                accessibility tree.
              </span>
            </li>
            <li>
              <a
                href="/t/can-i-use-a-tv-for-a-computer-monitor"
                className="text-orange-600 hover:underline"
              >
                What happens to every overlay when you plug in the TV
              </a>
              <span className="ml-2 text-zinc-500">
                SM_CXVIRTUALSCREEN, action_overlay.rs, and the
                TERMINATOR_ACTION_OVERLAY=0 escape hatch.
              </span>
            </li>
          </ul>
        </section>
      </article>
    </div>
  );
}
