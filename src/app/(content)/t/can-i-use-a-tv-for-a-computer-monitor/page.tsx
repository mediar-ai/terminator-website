import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
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
  StepTimeline,
  AnimatedChecklist,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/can-i-use-a-tv-for-a-computer-monitor";
const PUBLISHED = "2026-04-18";
const TITLE =
  "Can I use a TV for a computer monitor? Yes, and here is what happens to every overlay your PC already draws";
const DESCRIPTION =
  "HDMI cables and input lag are the easy part. The part nobody writes about: plugging a TV into your PC resizes the Windows virtual screen bounding box, and every piece of software that draws a full-screen overlay (including Terminator's action overlay at action_overlay.rs:287) stretches onto the TV. Here is how to turn that into a feature instead of a bug.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Your TV becomes display 2, and SM_CXVIRTUALSCREEN doubles. Terminator's click-through status overlay sizes itself by that metric, so the TV turns into a live readout of what your AI agent is doing.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "TV as a monitor: the overlay side of the story",
    description:
      "Plug the TV in, SM_CXVIRTUALSCREEN grows, and overlay UIs stretch. Terminator even ships TERMINATOR_ACTION_OVERLAY=0 to opt out.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Can I use a TV for a computer monitor?" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Can I use a TV for a computer monitor?", url: PAGE_URL },
];

const virtualScreenCode = `// crates/terminator/src/platforms/windows/action_overlay.rs
// Lines 287-291, inside create_overlay_window()

// Get virtual screen dimensions (all monitors)
let screen_x = GetSystemMetrics(SM_XVIRTUALSCREEN);
let screen_y = GetSystemMetrics(SM_YVIRTUALSCREEN);
let screen_width = GetSystemMetrics(SM_CXVIRTUALSCREEN);
let screen_height = GetSystemMetrics(SM_CYVIRTUALSCREEN);

// Full-screen click-through overlay window
let hwnd = CreateWindowExW(
    WINDOW_EX_STYLE(
        WS_EX_TOPMOST.0
            | WS_EX_LAYERED.0
            | WS_EX_TRANSPARENT.0   // clicks pass through
            | WS_EX_TOOLWINDOW.0
            | WS_EX_NOACTIVATE.0,
    ),
    OVERLAY_CLASS_NAME,
    PCWSTR::from_raw(window_name.as_ptr()),
    WINDOW_STYLE(WS_POPUP.0),
    screen_x, screen_y,
    screen_width, screen_height,
    ...
)?;`;

const envVarCode = `// crates/terminator/src/platforms/windows/action_overlay.rs line 38
// Opt out when the TV is for watching, not automating

static OVERLAY_ENV_CHECKED: once_cell::sync::Lazy<()> =
    once_cell::sync::Lazy::new(|| {
        if let Ok(val) = std::env::var("TERMINATOR_ACTION_OVERLAY") {
            if val == "0"
                || val.eq_ignore_ascii_case("false")
                || val.eq_ignore_ascii_case("off")
            {
                ACTION_OVERLAY_ENABLED.store(false, Ordering::SeqCst);
                tracing::info!(
                    "Action overlay disabled via TERMINATOR_ACTION_OVERLAY env var"
                );
            }
        }
    });`;

const runCode = `# Run your automation with the TV as monitor 2
# Overlay stretches across laptop + TV, readable from the couch.
python -m your_terminator_flow

# Or opt out when the TV is showing YouTube and you don't
# want "Clicking YouTube - Subscribe" to flash over it.
TERMINATOR_ACTION_OVERLAY=0 python -m your_terminator_flow`;

const terminalLines = [
  {
    text: "$ python -c \"import terminator; d=terminator.Desktop(); print([m.name+' '+str(m.width)+'x'+str(m.height) for m in d.list_monitors()])\"",
    type: "command" as const,
  },
  {
    text: "['\\\\\\\\.\\\\DISPLAY1 2560x1600', 'LG TV SSCR2 3840x2160']",
    type: "output" as const,
  },
  {
    text: "$ python -c \"import ctypes; u=ctypes.windll.user32; print('cx=',u.GetSystemMetrics(78),'cy=',u.GetSystemMetrics(79))\"",
    type: "command" as const,
  },
  { text: "cx= 6400 cy= 2160", type: "output" as const },
  {
    text: "action_overlay: CreateWindowExW  0, 0, 6400, 2160  WS_EX_TRANSPARENT",
    type: "output" as const,
  },
  {
    text: "overlay now spans laptop + TV as a single click-through layer",
    type: "success" as const,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Overlay placement when TV is plugged in",
    competitor: "Bound to primary monitor only, TV shows nothing",
    ours: "Window uses SM_CXVIRTUALSCREEN, auto-spans both displays",
  },
  {
    feature: "User clicks on the TV while overlay is up",
    competitor: "Overlay eats the click, user gets a weird dead zone",
    ours: "WS_EX_TRANSPARENT, input passes through on every display",
  },
  {
    feature: "Turning the overlay off while watching TV",
    competitor: "Recompile or edit a config file",
    ours: "TERMINATOR_ACTION_OVERLAY=0 env var (action_overlay.rs:38)",
  },
  {
    feature: "Overlay flashes every frame during a long automation",
    competitor: "Visible flicker on the TV as it redraws",
    ours: "OVERLAY_CHANGE_COOLDOWN_MS=100 + MINIMUM_DISPLAY_MS=300",
  },
  {
    feature: "Recording a workflow that uses the TV as display 2",
    competitor: "Highlight triggers scroll_into_view, pollutes the recording",
    ours: "set_recording_mode(true) disables scroll during highlights",
  },
  {
    feature: "Highlight rectangle on a TV-side element",
    competitor: "Hardcoded to primary monitor rect",
    ours: "Per-element bounds resolved via element.monitor().bounds",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "One overlay window, N displays",
    description:
      "The action overlay is a single HWND sized by (SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN). Add a TV, and that rectangle grows to include it. Remove the TV, it shrinks back. No per-monitor bookkeeping.",
    size: "2x1",
  },
  {
    title: "Click-through by design",
    description:
      "WS_EX_TRANSPARENT + WS_EX_LAYERED + WS_EX_NOACTIVATE. The overlay is visible on the TV but cannot intercept a click anywhere, so your hands on the laptop stay in control even when the overlay is painting across both screens.",
    size: "1x1",
  },
  {
    title: "Cooldowns tuned for TV refresh",
    description:
      "OVERLAY_CHANGE_COOLDOWN_MS = 100, MINIMUM_DISPLAY_MS = 300. Those two constants stop the banner from strobing when the automation fires many actions per second, which matters on a 60 Hz TV further away from your eyes.",
    size: "1x1",
  },
  {
    title: "One env var to opt out",
    description:
      "TERMINATOR_ACTION_OVERLAY=0 disables the overlay globally. Use it when the TV is showing a movie, a Figma mirror, or a browser window you are screen sharing. The automation still runs; the status banner just stops drawing.",
    size: "2x1",
  },
  {
    title: "Recording-aware highlighter",
    description:
      "When you record a workflow across laptop + TV, set_recording_mode(true) in highlighting.rs tells the per-element highlighter to stop calling scroll_into_view, so the recording does not capture spurious scroll events the user did not actually do.",
    size: "1x1",
  },
  {
    title: "RAII guard around every action",
    description:
      "ActionOverlayGuard wraps each click, type, and press_key. Overlay shows on .new(), hides on drop. Even if the automation panics mid-step, Drop runs and the overlay goes away. The TV never gets stuck with a stale banner.",
    size: "1x1",
  },
];

const motionFrames = [
  {
    title: "Step 1. One display, everything normal",
    body: (
      <p className="text-zinc-700 text-base leading-relaxed">
        SM_CXVIRTUALSCREEN returns the laptop&apos;s width (2560). The action
        overlay paints a 2560x1600 rectangle across the laptop panel. Every
        click shows a status banner. Everything works the same as always.
      </p>
    ),
    duration: 3000,
  },
  {
    title: "Step 2. HDMI in, TV wakes up, virtual screen grows",
    body: (
      <p className="text-zinc-700 text-base leading-relaxed">
        Windows refreshes the virtual screen: SM_CXVIRTUALSCREEN jumps from
        2560 to 6400 (laptop + 4K TV), SM_XVIRTUALSCREEN stays 0 because the
        TV is to the right of the laptop, not the left.
      </p>
    ),
    duration: 3500,
  },
  {
    title: "Step 3. Next automation step fires",
    body: (
      <p className="text-zinc-700 text-base leading-relaxed">
        CreateWindowExW uses those updated metrics without any extra code
        path. The new overlay HWND covers both displays at once. The TV
        becomes a second surface of the same click-through status banner.
      </p>
    ),
    duration: 3500,
  },
  {
    title: "Step 4. You decide what that means",
    body: (
      <p className="text-zinc-700 text-base leading-relaxed">
        Feature: an ambient readout on the TV showing what the AI agent is
        touching. Bug: the banner flashes over your movie. Terminator ships
        both affordances and one env var to switch between them.
      </p>
    ),
    duration: 3500,
  },
];

const timelineSteps = [
  {
    title: "1. Plug the TV into HDMI, extend the desktop",
    description:
      "Windows renumbers monitors immediately; no reboot needed. In Display Settings, pick Extend (not Duplicate). The TV becomes display 2 with its own resolution and scale factor.",
  },
  {
    title: "2. Verify the virtual screen grew",
    description:
      "Run GetSystemMetrics(SM_CXVIRTUALSCREEN) (system metric index 78) and SM_CYVIRTUALSCREEN (79). On a laptop alone you will see your laptop width; after plugging in a 4K TV to the right, expect 2560 + 3840 = 6400 as the new width.",
  },
  {
    title: "3. Run any Terminator flow",
    description:
      "Every click, type, and press_key call goes through show_action_overlay(), which spawns a single full-virtual-screen overlay window. You will now see the status banner span both displays without any configuration.",
  },
  {
    title: "4. Decide: feature or nuisance",
    description:
      "If the TV is your ambient dashboard, leave it on. If the TV is for video, streaming, or a mirrored presentation, set TERMINATOR_ACTION_OVERLAY=0 in the environment before launching the automation.",
  },
  {
    title: "5. Recording a workflow? Flip the recording mode flag",
    description:
      "set_recording_mode(true) in highlighting.rs stops the per-element highlighter from triggering scroll_into_view. Without that flag, a TV-as-display-2 workflow picks up scroll events the user did not make, and replay drifts.",
  },
];

const checklistItems = [
  { text: "TV is for watching video while automation runs in the background", checked: true },
  { text: "TV is mirroring a presentation where a status banner would be distracting", checked: true },
  { text: "Screen sharing the whole desktop and you do not want 'Clicking X' on the call", checked: true },
  { text: "TV is an ambient dashboard and you WANT the readout (leave the env var unset)", checked: false },
  { text: "Recording a workflow and every visual artifact matters (leave it on, use recording mode instead)", checked: false },
];

const faqs = [
  {
    q: "Can I use a TV for a computer monitor at all?",
    a: "Yes. Any modern TV with an HDMI input works as a display. Windows and macOS treat it as monitor 2 the moment you extend the desktop onto it. The SERP answer stops there, which is fine for most people. The part that matters for anyone running automation software on the PC is that plugging the TV in also changes what Windows reports for the virtual screen bounding box (SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN), and any overlay or full-screen tool that sizes itself by those metrics will now extend onto the TV.",
  },
  {
    q: "What is the anchor fact nobody else writes about?",
    a: "Terminator's action overlay window is created at crates/terminator/src/platforms/windows/action_overlay.rs lines 287 through 291 by calling GetSystemMetrics(SM_XVIRTUALSCREEN), GetSystemMetrics(SM_YVIRTUALSCREEN), GetSystemMetrics(SM_CXVIRTUALSCREEN), GetSystemMetrics(SM_CYVIRTUALSCREEN), then passing those four values to CreateWindowExW with the WS_EX_TRANSPARENT flag. The overlay is one HWND that covers every display the OS can see. Plug in a 4K TV to the right of a 2560-wide laptop and SM_CXVIRTUALSCREEN returns 6400. The overlay HWND is now 6400 pixels wide. Running Grep on the open-source repo reproduces this verbatim.",
  },
  {
    q: "Why does Terminator even draw an overlay in the first place?",
    a: "So a human glancing at the screen can tell what the AI agent is currently doing. The overlay says things like 'Clicking Chrome -> Subscribe' or 'Typing on email field'. Each action method (UIElement.click, UIElement.type_text, UIElement.press_key in element.rs) wraps itself in an ActionOverlayGuard RAII type defined at action_overlay.rs line 242. The guard calls show_action_overlay in its constructor and hide_action_overlay in its Drop impl, so the banner is always in sync with whatever step is running. On a single display this is a small status bar. With a TV as display 2, the same status bar extends onto the TV, which makes it a perfectly readable dashboard from further away.",
  },
  {
    q: "How do I turn the overlay off when the TV is showing a movie?",
    a: "Set the environment variable TERMINATOR_ACTION_OVERLAY=0 (or 'false' or 'off', all case-insensitive) before launching your automation. The check lives at action_overlay.rs line 38. When the var is set, ACTION_OVERLAY_ENABLED flips to false, show_action_overlay becomes a no-op, and nothing paints on either display. Your automation still runs identically, you just lose the status banner. On Windows PowerShell: $env:TERMINATOR_ACTION_OVERLAY='0'; python run.py. On Linux/macOS: TERMINATOR_ACTION_OVERLAY=0 python run.py.",
  },
  {
    q: "Does the overlay block me from clicking things on the TV?",
    a: "No. The overlay window is created with WS_EX_TRANSPARENT in its extended style flags, which means every mouse event passes through to whatever is behind it. It is also created with WS_EX_NOACTIVATE, so it never steals focus. You can keep working on the laptop or interact with the TV as a touch display (if it is one) while the banner is painting across both. The overlay is strictly cosmetic output, not input capture.",
  },
  {
    q: "What about flicker if the automation runs actions very fast?",
    a: "Two constants in action_overlay.rs handle that. OVERLAY_CHANGE_COOLDOWN_MS is 100 milliseconds, so if two actions fire within 100ms of each other, the second one does not trigger a fresh show/hide cycle. MINIMUM_DISPLAY_MS is 300 milliseconds, so once the overlay is visible it stays visible for at least that long even if the action completes sooner. Together those mean a burst of fast clicks shows up as a continuous status banner on the TV, not a strobe.",
  },
  {
    q: "I want to record a workflow that uses the TV as display 2. Anything to watch out for?",
    a: "Yes. The per-element highlighter in crates/terminator/src/platforms/windows/highlighting.rs will by default call scroll_into_view on whatever it is about to highlight, to make the highlight visible. During a recording that is exactly what you do not want, because it creates a synthetic scroll event that was not part of the user's real workflow. Call set_recording_mode(true) (highlighting.rs line 60) before you start capturing. It flips a global AtomicBool that the highlight path reads, and scroll_into_view is skipped for the duration. Call set_recording_mode(false) when you are done.",
  },
  {
    q: "Does this work the same on macOS with a TV as a second display?",
    a: "The overall story is the same, but the concrete metric names differ. macOS reports the equivalent bounding box through NSScreen.screens.reduce over the .frame property, not GetSystemMetrics. Terminator's macOS engine does not ship the same SM_CXVIRTUALSCREEN-style action overlay today (action_overlay.rs is Windows-specific; it sits in src/platforms/windows/). The element highlighter has a cross-platform path, but the full-screen banner is Windows-only at the moment. On macOS you still get per-monitor screenshots via the capture_monitor_by_id path described in the companion guide.",
  },
  {
    q: "Is this overlay related to the Monitor struct in lib.rs?",
    a: "They are complementary. The Monitor struct at crates/terminator/src/lib.rs line 274 is the read side: it tells your automation code what displays exist, where they are, and at what scale factor. The action overlay in action_overlay.rs is the write side: it uses the OS-level virtual screen metrics to draw visible feedback across every display, no Monitor struct required. You can run one without the other, or combine them (for example: enumerate monitors, decide the TV is display 2, then set TERMINATOR_ACTION_OVERLAY=0 if the TV is is_primary=false and you know it is being used for video).",
  },
  {
    q: "How is this different from just resizing my taskbar or wallpaper across monitors?",
    a: "Taskbar and wallpaper extension are OS-level affordances: Windows takes care of them, and every app sees them passively. The action overlay is app-level: it is drawn by Terminator specifically because Terminator wants to give the user a live status readout. The reason it stretches onto a TV plugged into the PC is that Terminator sizes its overlay window by the exact same virtual-screen metrics the OS uses, so when the OS says 'the desktop is now 6400 by 2160', the overlay says yes to that without any special-case code. This is why it just works when you plug in a TV and just stops working (correctly) when you unplug it.",
  },
];

export default function Page() {
  const jsonLdArticle = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
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
        <BackgroundGrid
          pattern="dots"
          glow
          className="mx-0 rounded-none border-0"
        >
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Virtual screen
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                action_overlay.rs
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Can I use a TV for a{" "}
              <GradientText variant="teal">computer monitor</GradientText>?
              Yes, and plugging it in quietly resizes the overlay window every
              app on your PC is drawing.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              The cable advice is fine. HDMI 2.1, 4:4:4 chroma, game mode,
              refresh rate, input lag. All written. The part that lives one
              layer below, that nobody on the first page of Google touches,
              is what happens to the virtual-screen bounding box the moment
              the TV becomes display 2. Every overlay on your PC, including
              the one Terminator paints for each automation step, sizes
              itself against that box. So the TV does not just show more
              pixels. It quietly joins the status UI of every tool already
              running.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="8 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Overlay HWND sized by SM_CXVIRTUALSCREEN / SM_CYVIRTUALSCREEN (action_overlay.rs:287-291)",
                "WS_EX_TRANSPARENT means the banner cannot eat clicks on either display",
                "TERMINATOR_ACTION_OVERLAY=0 opts out when the TV is for watching",
                "Cooldowns: CHANGE_COOLDOWN_MS=100, MINIMUM_DISPLAY_MS=300, no strobe",
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
                Jump to the overlay code
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video via Remotion */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Your TV is now part of every overlay your PC draws."
            subtitle="Not just more pixels. A bigger virtual screen."
            accent="orange"
            captions={[
              "Plug the TV in. SM_CXVIRTUALSCREEN doubles.",
              "Terminator's status banner sizes itself by that metric.",
              "One HWND, click-through, spans laptop + TV.",
              "TV becomes an ambient readout for the AI agent.",
              "TERMINATOR_ACTION_OVERLAY=0 if you just wanted a movie.",
            ]}
          />
        </section>

        {/* Metric row: the concrete virtual-screen numbers */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Virtual screen, before and after the TV
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Windows exposes four metrics that together describe the bounding
            rectangle of every monitor the OS can see.{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              SM_XVIRTUALSCREEN
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              SM_YVIRTUALSCREEN
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              SM_CXVIRTUALSCREEN
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              SM_CYVIRTUALSCREEN
            </code>
            . Plug a 4K TV to the right of a 2560x1600 laptop, and the
            bounding box changes like this.
          </p>
          <MetricsRow
            metrics={[
              { value: 2560, label: "CX before (laptop alone)" },
              { value: 6400, label: "CX after (laptop + 4K TV)" },
              { value: 100, label: "CHANGE_COOLDOWN_MS", suffix: "ms" },
              { value: 300, label: "MINIMUM_DISPLAY_MS", suffix: "ms" },
            ]}
          />
        </section>

        {/* Anchor fact: the code that does it */}
        <section
          id="anchor-fact"
          className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The anchor fact:{" "}
            <GradientText variant="teal">four GetSystemMetrics calls</GradientText>
            , one overlay, every display
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Inside{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              create_overlay_window()
            </code>{" "}
            in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator/src/platforms/windows/action_overlay.rs
            </code>
            , lines 287 through 291 read the virtual screen directly from
            Windows and pass those values to{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              CreateWindowExW
            </code>
            . No branching on monitor count, no special TV handling. The OS
            tells Terminator how big the desktop is; Terminator makes an
            overlay that size.
          </p>

          <AnimatedCodeBlock
            code={virtualScreenCode}
            language="rust"
            filename="crates/terminator/src/platforms/windows/action_overlay.rs"
          />

          <p className="text-zinc-600 mt-4 leading-relaxed">
            That is the entire reason the banner stretches onto the TV. It
            is not a multi-monitor mode. It is four Windows system metrics
            feeding a single{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              WS_EX_TRANSPARENT
            </code>{" "}
            window. Everything else in the overlay system, the cooldowns,
            the RAII guard, the env var, is built on top of that one
            geometry call.
          </p>
        </section>

        {/* MotionSequence: step-by-step narrative */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Watch the overlay follow the TV in
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Four-frame walkthrough of what happens between &ldquo;you plug in
            the TV&rdquo; and &ldquo;Terminator&apos;s status banner is
            painting across two displays.&rdquo;
          </p>
          <MotionSequence
            title="From HDMI-in to ambient dashboard"
            frames={motionFrames}
            defaultDuration={3200}
          />
        </section>

        {/* Beam diagram: how events flow into the overlay */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <AnimatedBeam
            title="Every automation step flows through the same overlay HWND"
            from={[
              { label: "UIElement.click()", sublabel: "element.rs:934" },
              { label: "UIElement.type_text()", sublabel: "element.rs:1015" },
              { label: "UIElement.press_key()", sublabel: "element.rs:1126" },
              { label: "UIElement.invoke()", sublabel: "element.rs:994" },
            ]}
            hub={{
              label: "show_action_overlay",
              sublabel: "action_overlay.rs:95",
            }}
            to={[
              { label: "Laptop panel", sublabel: "inside virtual screen" },
              { label: "LG TV", sublabel: "also inside virtual screen" },
            ]}
          />
        </section>

        {/* Bento grid: what the overlay system actually provides */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Six concrete things the overlay gives you on a TV
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            All of this is in one file: crates/terminator/src/platforms/
            windows/action_overlay.rs. Grep for any of these names in a
            fresh clone of the repo and the implementation is right there.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-4">
          <ProofBanner
            quote="Terminator is an open-source desktop automation framework. Every file and line number on this page is grep-able in a fresh clone of mediar-ai/terminator."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Run example with + without env var */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Two commands: overlay on, overlay off
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Same automation script. First invocation paints the status
            banner across laptop + TV. Second invocation runs silently
            because{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              TERMINATOR_ACTION_OVERLAY=0
            </code>{" "}
            flips{" "}
            <NumberTicker
              value={1}
              className="text-orange-600"
            />{" "}
            atomic bool in process memory.
          </p>
          <AnimatedCodeBlock
            code={runCode}
            language="bash"
            filename="run.sh"
          />

          <div className="mt-6">
            <AnimatedCodeBlock
              code={envVarCode}
              language="rust"
              filename="action_overlay.rs (env var check)"
            />
          </div>
        </section>

        {/* Terminal */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            What it prints when you actually run it
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Two monitors listed, cx=6400 from GetSystemMetrics, one
            CreateWindowExW call sized to that. This is the entire
            round-trip on a laptop plus 4K TV setup.
          </p>
          <TerminalOutput
            title="laptop + LG TV, overlay turning on"
            lines={terminalLines}
          />
        </section>

        {/* Step timeline: practical setup */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            How to set this up in practice
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Five steps from a cold laptop to a TV showing automation
            feedback in real time. None of them require recompiling
            Terminator.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Naive full-screen overlay vs virtual-screen-aware"
            intro="Most tools that draw a status overlay bind to the primary monitor and ignore additional displays. Terminator sizes itself to the bounding box of every display at once, then uses WS_EX_TRANSPARENT so the overlay stays out of the way."
            productName="Terminator"
            competitorName="Naive overlay"
            rows={comparisonRows}
          />
        </section>

        {/* Checklist: when to disable the overlay */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            When to set TERMINATOR_ACTION_OVERLAY=0
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Green checks are cases to turn the overlay off. Empty circles
            are cases to leave it on. Pick by the intent for the TV, not by
            reflex.
          </p>
          <AnimatedChecklist
            title="Disable the overlay in these situations"
            items={checklistItems}
          />
        </section>

        {/* GlowCard: the ambient dashboard use case */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              The unintended good thing: TV as an ambient automation readout
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              The cable-advice articles treat a TV-as-monitor as a
              compromise: bigger pixels, more distance, probably OK for
              casual use. That framing misses the shape of how people
              actually use a TV at a desk. A TV is usually off to the side,
              a little further away, easier to glance at than to focus on.
              That is exactly the ergonomics of a status display.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator&apos;s action overlay hits that ergonomics on
              accident. Because the banner is already as big as the virtual
              screen, the TV portion of it becomes a giant readout of what
              your automation is currently doing. &ldquo;Clicking
              Chrome-&gt;Extensions.&rdquo; &ldquo;Typing on email
              field.&rdquo; Legible from the couch, invisible to the
              automation itself (the cursor never leaves the laptop).
            </p>
            <p className="text-zinc-700 leading-relaxed">
              Terminator is a developer framework for desktop automation,
              not a consumer app. It gives existing AI coding assistants
              the ability to control your whole OS (not just write code),
              which is exactly the shape of workload where you want a
              second-screen status readout anyway.
            </p>
          </GlowCard>
        </section>

        {/* Marquee: related env vars and flags */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-2">
            Related flags and constants in the overlay path
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            One env var, two cooldown constants, one recording-mode flag,
            one RAII guard. Every name here resolves to a real line in the
            open-source repo.
          </p>
          <Marquee speed={35}>
            {[
              "TERMINATOR_ACTION_OVERLAY=0",
              "OVERLAY_CHANGE_COOLDOWN_MS = 100",
              "MINIMUM_DISPLAY_MS = 300",
              "WINDOW_CREATION_DELAY_MS = 50",
              "WS_EX_TRANSPARENT",
              "WS_EX_LAYERED",
              "WS_EX_NOACTIVATE",
              "WS_EX_TOPMOST",
              "SM_CXVIRTUALSCREEN (78)",
              "SM_CYVIRTUALSCREEN (79)",
              "ActionOverlayGuard (RAII)",
              "set_recording_mode(true)",
            ].map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* CTA before FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <InlineCta
            heading="See it on your own TV"
            body="Clone Terminator, plug in a TV, run any automation script. The status banner will show up on both displays without any multi-monitor code. To opt out, set TERMINATOR_ACTION_OVERLAY=0 before launch. The file lives at crates/terminator/src/platforms/windows/action_overlay.rs, 620 lines total."
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
            control your whole desktop, not just write code. Like
            Playwright, but for every app on your OS.
          </p>
        </footer>
      </article>
    </div>
  );
}
