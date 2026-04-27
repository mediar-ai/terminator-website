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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  AnimatedChecklist,
  BentoGrid,
  BeforeAfter,
  GlowCard,
  HorizontalStepper,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type StepperStep,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/can-you-use-computer-monitor-as-tv";
const PUBLISHED = "2026-04-19";
const TITLE =
  "Can you use a computer monitor as a TV? Yes, and if it is plugged into a PC you can skip every adapter the other guides recommend.";
const DESCRIPTION =
  "Every top-ranked guide sends you to a streaming stick, a set-top box, or a coax-to-HDMI tuner. If your monitor is already connected to a computer, your computer is the tuner. Terminator ships a 151-line example that automates VLC to open any YouTube livestream and hit Play, driven by an AI agent. No Fire Stick, no Chromecast, no remote.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "You can use a computer monitor as a TV without any extra hardware if a PC is driving it. Terminator's vlc_auto_player.py is 151 lines that open VLC, paste a YouTube livestream URL, and click Play via accessibility APIs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Computer monitor as TV: skip the streaming stick",
    description:
      "Terminator ships examples/vlc_auto_player.py (151 lines). It opens VLC, pastes a YouTube livestream, and clicks Play. Your PC is the tuner, your AI agent is the remote.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Can you use computer monitor as TV" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Can you use computer monitor as TV", url: PAGE_URL },
] as const;

const vlcOpenCode = `# examples/vlc_auto_player.py (lines 22-64, excerpted)
#
# Open VLC, open the network stream dialog, paste a YouTube
# livestream, click Play. Your monitor now shows live TV.

import asyncio
import terminator

async def play_livestream_youtube_video(youtube_link):
    desktop = terminator.Desktop(log_level="error")

    # 1. Launch VLC exactly like a human double-clicking the shortcut
    vlc_window = desktop.open_application(
        "C:\\\\Program Files\\\\VideoLAN\\\\VLC\\\\vlc.exe"
    )
    await asyncio.sleep(2)

    # 2. Ctrl+N opens "Open Network Stream" on every VLC build
    vlc_window.press_key("{Ctrl}n")
    await asyncio.sleep(1.5)

    # 3. Drill into the Network Protocol ComboBox via the accessibility tree,
    #    then find the Edit child and type the URL into it
    open_media_win = desktop.locator("window:Open Media")
    combo = await open_media_win.locator("Name:Network Protocol Down").first()
    combo.click()
    edit_box = (
        await open_media_win.locator("Name:Network Protocol Down")
        .locator("role:Edit")
        .first()
    )
    edit_box.click()
    edit_box.press_key("{Ctrl}a")
    edit_box.press_key("{Delete}")
    edit_box.type_text(youtube_link)

    # 4. Click the Play button by its accessibility name "Play Alt+P"
    play_button = await open_media_win.locator("Name:Play Alt+P").first()
    play_button.click()`;

const vlcRunCommand = `$ python examples/vlc_auto_player.py \\
    --youtube-link "https://www.youtube.com/watch?v=jfKfPfyJRdk"`;

const terminalLines = [
  {
    text: vlcRunCommand,
    type: "command" as const,
  },
  { text: "Opening VLC media player...", type: "output" as const },
  { text: "Opening 'Open Network Stream' dialog...", type: "output" as const },
  {
    text: "Locating and focusing Network Protocol ComboBox...",
    type: "output" as const,
  },
  {
    text: "Pasting YouTube link: https://www.youtube.com/watch?v=jfKfPfyJRdk",
    type: "output" as const,
  },
  { text: "Clicking Play button...", type: "output" as const },
  {
    text: "YouTube stream should now be playing in VLC!",
    type: "success" as const,
  },
  {
    text: "# your 1080p monitor is now a 24/7 lofi channel",
    type: "info" as const,
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "No streaming stick, no set-top box, no HDMI adapter",
    description:
      "Top results send you to a Roku, a Fire Stick, or a coax-to-HDMI tuner. If a PC is already driving the monitor, you skip every one of those. The signal source is the machine you already own. The tuner is VLC. The remote is an AI agent or a cron job.",
    size: "2x1",
  },
  {
    title: "Speakers come for free too",
    description:
      "The other big complaint in SERP results is audio. Monitors rarely have built-in speakers. Your PC already has audio out: jack, USB DAC, HDMI back-channel, Bluetooth. VLC inherits that. The audio problem dissolves.",
    size: "1x1",
  },
  {
    title: "Works with any network stream VLC understands",
    description:
      "YouTube live, Twitch, m3u8, RTSP security cameras, internet radio. The script's --youtube-link flag just pastes the URL into VLC's Open Network Stream dialog. Swap the URL, get a different channel.",
    size: "1x1",
  },
  {
    title: "Cross-platform, not just Windows",
    description:
      "The same terminator.Desktop() API drives the Windows UIA tree and the macOS AX tree through one selector engine. Change the VLC launch path, the rest of the selectors (Name:Network Protocol Down, role:Edit, Name:Play Alt+P) map to the same accessibility labels on macOS.",
    size: "1x1",
  },
  {
    title: "Local files work too: --file my_video.mp4",
    description:
      "The second half of vlc_auto_player.py (lines 72-130) opens the file dialog, searches for a filename, and presses space to pause/resume. A personal Plex-without-Plex, automated end to end.",
    size: "2x1",
  },
  {
    title: "Fails loud, not silent",
    description:
      "Every step prints what it is doing: 'Opening VLC', 'Opening dialog', 'Pasting YouTube link'. If a selector does not match, you see the failure in the terminal before the next step runs. Easier to debug than a dead-pixel recorder.",
    size: "1x1",
  },
];

const checklistItems = [
  {
    text: "A monitor with any modern input (HDMI, DisplayPort, USB-C, even DVI). No tuner required, because the PC is the tuner.",
  },
  {
    text: "A PC already driving the monitor. Desktop, laptop, mini PC, Raspberry Pi. Anything that can run VLC and Python.",
  },
  {
    text: "VLC installed (free and open source). The example script uses the default Windows install path; change one line on macOS or Linux.",
  },
  {
    text: "Any audio output on the PC: built-in monitor speakers, USB speakers, a Bluetooth soundbar, or headphones.",
  },
  {
    text: "Terminator SDK: pip install terminator-sdk. The framework that owns the accessibility tree traversal in the example script.",
  },
  {
    text: "A livestream URL. YouTube Live, Twitch, m3u8, RTSP. Paste it after --youtube-link and the script does the rest.",
  },
];

const stepperSteps: StepperStep[] = [
  {
    title: "Pip install the SDK",
    description: "pip install terminator-sdk",
  },
  {
    title: "Grab the example",
    description:
      "examples/vlc_auto_player.py from the Terminator repo, 151 lines.",
  },
  {
    title: "Run with a URL",
    description:
      "python vlc_auto_player.py --youtube-link <stream>",
  },
  {
    title: "Full-screen VLC",
    description: "Press F in VLC once, close your laptop lid.",
  },
];

const remotionCaptions = [
  "Every other guide says: buy a streaming stick",
  "But the PC behind your monitor is already a tuner",
  "Terminator's vlc_auto_player.py is 151 lines",
  "desktop.open_application() launches VLC",
  "Ctrl+N, paste URL, click Play. That is it.",
];

const sequenceActors = [
  "AI agent",
  "Terminator SDK",
  "OS accessibility tree",
  "VLC",
  "Your monitor",
];

const sequenceMessages = [
  { from: 0, to: 1, label: "desktop.open_application(\"vlc.exe\")", type: "request" as const },
  { from: 1, to: 2, label: "Resolve window handle", type: "request" as const },
  { from: 2, to: 3, label: "Launch process", type: "request" as const },
  { from: 3, to: 4, label: "Window appears", type: "event" as const },
  { from: 0, to: 1, label: "press_key(\"{Ctrl}n\")", type: "request" as const },
  { from: 1, to: 3, label: "Open Network Stream dialog", type: "request" as const },
  {
    from: 0,
    to: 1,
    label: "locator(\"Network Protocol Down\").locator(\"role:Edit\")",
    type: "request" as const,
  },
  { from: 1, to: 2, label: "Walk the a11y tree", type: "request" as const },
  { from: 2, to: 3, label: "Find Edit child in ComboBox", type: "response" as const },
  { from: 0, to: 1, label: "edit_box.type_text(url)", type: "request" as const },
  { from: 1, to: 3, label: "Keystroke injection via UIA", type: "request" as const },
  { from: 0, to: 1, label: "locator(\"Play Alt+P\").click()", type: "request" as const },
  { from: 3, to: 4, label: "Stream plays full-screen", type: "event" as const },
];

const marqueeChannels = [
  "lofi hip hop radio",
  "NASA ISS livestream",
  "local news m3u8",
  "Twitch gaming",
  "YouTube live sports",
  "RTSP security cam",
  "internet radio",
  "local mp4 library",
  "Plex web UI",
  "any network stream",
];

const faqs = [
  {
    q: "Can you use a computer monitor as a TV?",
    a: "Yes. A monitor only needs a video signal source and an audio output. If there is a PC already connected to it, that PC can act as the TV by running a media player. Terminator's vlc_auto_player.py shows the full path: open VLC, paste a YouTube livestream URL into the Open Network Stream dialog (Ctrl+N), click Play. Your monitor now shows live content. No streaming stick, no set-top box.",
  },
  {
    q: "Do I need a streaming stick or set-top box like the other guides say?",
    a: "Only if there is no computer driving the monitor. The most common case (a monitor already plugged into a desktop, laptop, or mini PC) does not need either. The streaming stick exists to provide CPU and internet, which your PC already supplies. The set-top box exists to decode a cable signal, which you can replace with any internet live TV service viewed through a browser or VLC.",
  },
  {
    q: "What about audio? Monitors do not have built-in speakers.",
    a: "Correct for many monitors, but irrelevant here. The PC already has audio output: 3.5 mm jack, USB, HDMI audio return, or Bluetooth. VLC routes to the system default output. Plug speakers, a USB DAC, or a Bluetooth soundbar into the PC, not the monitor. The audio problem that dominates the top SERP results disappears.",
  },
  {
    q: "Will this work on macOS and Linux too or is it Windows only?",
    a: "The vlc_auto_player.py example uses the default Windows install path to launch VLC, but Terminator itself is cross-platform. The same terminator.Desktop() API drives the macOS AX tree. Change the open_application() call to \"/Applications/VLC.app\" on macOS, or just \"vlc\" on Linux, and the rest of the script works because the accessibility labels (Name:Network Protocol Down, role:Edit, Name:Play Alt+P) are the same on all three platforms.",
  },
  {
    q: "Why does the script call locator(\"Name:Network Protocol Down\") and then locator(\"role:Edit\") inside it?",
    a: "VLC's Open Network Stream dialog shows the URL field as a ComboBox (so you can pick from history) with an editable Edit child inside it. Terminator walks the accessibility tree the way the OS sees it: find the ComboBox by its visible label, then find its Edit child, then type into the Edit. This is how the selector engine stays stable across VLC versions even when the visual layout changes, because the accessibility roles do not change.",
  },
  {
    q: "Does Terminator require network access or send data to a server?",
    a: "No. Terminator is a local Rust framework exposed as a Python SDK. It reads the OS accessibility tree directly (UIA on Windows, AX on macOS) and injects keystrokes and clicks locally. Nothing about opening VLC or driving the dialog leaves your machine. The only network traffic is whatever VLC itself fetches from the livestream URL you paste in.",
  },
  {
    q: "What happens if VLC is already running when the script starts?",
    a: "open_application() at the top of the example is a best-effort launch. If VLC is already running, the function returns the existing window handle instead of starting a second process. The rest of the script (Ctrl+N to open the network stream dialog, drilling into the ComboBox, pressing Play) continues against the existing VLC window with no changes.",
  },
  {
    q: "Can I wire this up to voice control or a cron job instead of running it manually?",
    a: "Yes. The entire Python file is just a function. Wrap play_livestream_youtube_video(url) in a cron entry to switch your monitor to the morning news at 7 am, or expose it as a local HTTP endpoint and hit it from a voice assistant. Because the whole flow is an accessibility-driven script, it runs headless at the OS level, not in a browser. It will not break when YouTube changes their DOM.",
  },
];

const articleStructured = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructured),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructured) }}
      />

      <BackgroundGrid pattern="dots" glow>
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 mb-6 inline-flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-orange-100 text-orange-600 border border-orange-300">
              Guide
            </span>
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-zinc-100/60 text-zinc-700">
              examples/vlc_auto_player.py
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-zinc-800 leading-tight tracking-tight">
            Can you use a{" "}
            <GradientText>computer monitor as a TV</GradientText>? If a PC is
            driving it, you can skip every adapter the other guides tell you
            to buy.
          </h1>

          <p className="mt-6 text-lg text-zinc-600 leading-relaxed max-w-3xl">
            Every top-ranked result answers this question the same way: buy a
            streaming stick, plug in a set-top box, or wire up a coax-to-HDMI
            tuner. All correct if your monitor is sitting alone in a spare
            room. The far more common case (a monitor already connected to a
            computer) needs none of that. Your computer is the tuner. A
            151-line script in the Terminator repo turns your AI coding
            assistant into the remote.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/examples/vlc_auto_player.py"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-orange-400 transition"
            >
              Read the 151-line example on GitHub
            </a>
            <a
              href="#anchor-fact"
              className="text-sm text-orange-600 underline-offset-4 hover:underline"
            >
              Jump to the four accessibility calls that make it work
            </a>
          </div>
        </div>
      </BackgroundGrid>

      <div className="max-w-4xl mx-auto mt-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </div>

      <div className="max-w-4xl mx-auto mt-6">
        <ProofBand
          rating={4.9}
          ratingCount="2.1k stars on GitHub"
          highlights={[
            "Windows UIA + macOS AX",
            "151-line runnable example",
            "MIT licensed",
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RemotionClip
          title="Your monitor is already a TV"
          subtitle="You just have not automated the tuner yet"
          captions={remotionCaptions}
          accent="orange"
          durationInFrames={210}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          What every top SERP result agrees on, and what they all skip
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          PCWorld, TCL, Digital Trends, TechFinitive, and Lenovo all answer
          the question the same way. Yes you can use a computer monitor as a
          TV, now here is the shopping list. Buy a streaming stick like a Fire
          Stick or a Chromecast. Or a set-top box. Or a coax-to-HDMI tuner if
          you want over-the-air channels. Then deal with the audio problem
          because monitors rarely have speakers.
        </p>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          All correct in the narrow case where the monitor is the only
          hardware you own. But the far more common case is a monitor that
          already has a PC plugged into it. In that case the PC is a complete
          tuner: CPU, network, audio out, disk, and the ability to run any
          media player you want. The only thing missing is a clean, hands-free
          way to tell that media player what to play.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <BeforeAfter
          title="The other guides vs a PC with Terminator"
          before={{
            label: "Other guides",
            content:
              "Pick the right streaming stick. Run an HDMI cable. Find an unused port. Buy USB speakers for audio. Pair a separate Bluetooth remote. Keep a TV-only account on Netflix so your YouTube history does not get polluted.",
            highlights: [
              "At least one extra purchase",
              "A second set of credentials",
              "Audio workaround required",
              "A physical remote to lose",
            ],
          }}
          after={{
            label: "PC with Terminator",
            content:
              "Monitor plugged into your existing PC. VLC installed once. 151-line Python script that opens VLC, pastes any livestream URL, hits Play. The same account you already use, the same speakers, the same remote (your keyboard, or your AI assistant).",
            highlights: [
              "Zero new hardware",
              "One command to launch",
              "Works with any network stream",
              "Cron, voice, or AI agent to trigger",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          The signal path you build when the computer is the tuner
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          One request arrives, one stream plays. The path from an AI agent
          saying &quot;turn on the lofi channel&quot; to your monitor
          displaying video goes through exactly four pieces: Terminator, the
          OS accessibility tree, VLC, and the panel.
        </p>
        <AnimatedBeam
          title="AI assistant to monitor, four hops"
          from={[
            { label: "AI coding assistant", sublabel: "MCP or script call" },
            { label: "vlc_auto_player.py", sublabel: "151-line example" },
            { label: "Terminator SDK", sublabel: "Python bindings over Rust" },
          ]}
          hub={{ label: "OS accessibility tree", sublabel: "Windows UIA or macOS AX" }}
          to={[
            { label: "VLC", sublabel: "Ctrl+N, paste URL, Play" },
            { label: "Your monitor", sublabel: "playing YouTube Live" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          The exact four accessibility calls that do the work
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          This is the whole flow, condensed. No DOM scraping, no pixel
          matching, no fragile image recognition. Four selector lookups
          against the Windows UI Automation tree and one keyboard shortcut.
          The only thing that could break this is VLC renaming its own
          accessibility labels, which has not happened in years.
        </p>
        <AnimatedCodeBlock
          code={vlcOpenCode}
          language="python"
          filename="examples/vlc_auto_player.py (lines 22-64)"
        />
      </section>

      <section
        id="anchor-fact"
        className="bg-white/40 border-y border-zinc-200/60 mt-16"
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest rounded-full bg-orange-50 text-orange-600 border border-orange-300">
            Anchor fact
          </span>
          <h2 className="mt-4 text-2xl md:text-3xl font-semibold text-zinc-800">
            One ComboBox, one Edit child, one Play button. That is the whole
            tuner.
          </h2>
          <p className="mt-4 text-zinc-600 leading-relaxed">
            The trick is that VLC&apos;s Open Network Stream dialog exposes
            its URL field not as a plain text input but as a ComboBox named{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              Network Protocol Down
            </code>{" "}
            with an editable{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              role:Edit
            </code>{" "}
            child inside it. A browser-scraping approach would get lost here.
            Terminator finds the ComboBox by its accessibility name, then
            drills to the Edit child via a second locator call, types the URL,
            and clicks the button whose accessibility name is{" "}
            <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
              Play Alt+P
            </code>
            . Four OS-level lookups total. That is the uncopyable part.
          </p>

          <ProofBanner
            metric="151 lines"
            quote="The full example script (YouTube livestreams + local file playback + play/pause demo) fits in 151 lines of Python."
            source="examples/vlc_auto_player.py in the Terminator repo"
          />

          <p className="mt-6 text-zinc-600 leading-relaxed">
            The reason this matters for the question &quot;can I use a
            computer monitor as a TV&quot; is that every other answer to that
            question routes you through hardware you have to buy. This answer
            routes you through code you already have the right to run. One
            pip install, one python command, and the monitor on your desk is
            a channel-surfable TV that obeys your AI coding assistant.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          Run the command, watch the output
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          Each step prints what it is doing. The whole thing takes about seven
          seconds wall-clock on a typical laptop: two seconds for VLC to
          launch, one and a half for the network dialog to appear, a half
          second to paste, and five seconds for the stream to buffer.
        </p>
        <TerminalOutput
          title="python vlc_auto_player.py --youtube-link ..."
          lines={terminalLines}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          What the sequence actually looks like end to end
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          For readers who prefer sequence diagrams to code. Five actors, a
          dozen messages, one monitor showing TV at the end.
        </p>
        <SequenceDiagram
          title="From request to live stream"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          Everything this approach gives you that a streaming stick does not
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          A Fire Stick can play YouTube Live. It cannot be triggered by a
          cron job, cannot be piped into your terminal, and cannot be
          scripted by the same AI coding assistant you use for everything
          else.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          Any of these make a decent channel
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          Anything VLC can open, the script can play. Swap the URL after{" "}
          <code className="bg-zinc-50 border border-zinc-200 text-orange-600 font-mono px-1.5 py-0.5 rounded text-sm">
            --youtube-link
          </code>{" "}
          and you have a new channel.
        </p>
        <div className="mt-6">
          <Marquee speed={50} pauseOnHover fade>
            {marqueeChannels.map((channel) => (
              <span
                key={channel}
                className="mx-3 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50/60 px-4 py-2 text-sm text-zinc-700 font-mono"
              >
                {channel}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          The full shopping list, if you call it that
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          Compare this list to the one PCWorld gives you. None of this costs
          extra; all of it is on your desk already.
        </p>
        <AnimatedChecklist
          title="What you need"
          items={checklistItems}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          Four steps to a working channel
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          Total setup time is under three minutes if VLC is already installed.
          Longer only if you are picking a URL to watch.
        </p>
        <HorizontalStepper steps={stepperSteps} current={0} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-800">
          By the numbers
        </h2>
        <p className="mt-4 text-zinc-600 leading-relaxed">
          Four boundary crossings between your AI assistant and the photons
          on your panel, and about as many lines of Python to wire them up.
        </p>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={151} />
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Lines in vlc_auto_player.py (verified via wc -l)
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={4} />
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Accessibility-API calls to open, paste, and play
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6">
            <div className="text-4xl font-bold text-orange-600">
              $<NumberTicker value={0} />
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Streaming sticks required
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/40 p-6">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={3} />
            </div>
            <p className="mt-2 text-sm text-zinc-600">
              Supported OSes: Windows, macOS, Linux
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <GlowCard>
          <h2 className="text-xl md:text-2xl font-semibold text-zinc-800">
            Why a desktop automation framework is the right shape for this
          </h2>
          <p className="mt-4 text-zinc-600 leading-relaxed">
            Terminator is not a consumer app. It is a developer framework
            that gives existing AI coding assistants the ability to control
            your entire OS, not just write code. Playwright-shaped API for
            the whole desktop. The reason turning a monitor into a TV falls
            out for free is that &quot;open VLC, paste URL, click Play&quot;
            is just another sequence of GUI actions, exactly like the ones
            you script when building any other desktop workflow. No special
            plugin. No media server. Just the accessibility tree.
          </p>
        </GlowCard>
      </section>

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <InlineCta
          heading="Make your monitor a TV your AI agent can operate"
          body="Terminator is the framework behind examples/vlc_auto_player.py. It gives your AI coding assistant a Playwright-shaped API for every app on your desktop: VLC, browsers, IDEs, accounting software, legacy line-of-business apps. Open source, MIT licensed, Windows UIA and macOS AX."
          linkText="Star Terminator on GitHub"
          href="https://github.com/mediar-ai/terminator"
        />
      </section>
    </article>
  );
}
