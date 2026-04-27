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
  MetricsRow,
  GlowCard,
  BentoGrid,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-python";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Windows automation in Python with a real visual debugger built in";
const DESCRIPTION =
  "Every other Python library for Windows automation runs your script blind. Terminator's Python binding ships element.highlight(), a Win32 GDI overlay that draws a colored, layered, click-through border around any UI element your script touches, with text labels at nine positions. Source: crates/terminator/src/platforms/windows/highlighting.rs line 65.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Watch your Python script touch Windows controls. element.highlight(color=0x00FF00, duration_ms=2000, text='Save') paints a real GDI overlay. WS_EX_LAYERED + WS_EX_TRANSPARENT + WS_EX_TOPMOST.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows automation in Python, with a visible cursor of intent",
    description:
      "pip install terminator-py. element.highlight() draws a real Win32 overlay window around any control your script touches. The visual debugger pywinauto never had.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows automation in Python" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows automation in Python", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does element.highlight() actually draw on the screen?",
    a: "A real Windows overlay window. The implementation lives in crates/terminator/src/platforms/windows/highlighting.rs at the highlight function on line 65. It calls CreateWindowExW with the flags WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST | WS_EX_TOOLWINDOW (line 427), then paints a colored rectangle border around the element using GDI primitives (Rectangle, FillRect, DrawTextW). The window is click-through because of WS_EX_TRANSPARENT, so it never steals focus or interferes with your automation. When the duration expires the overlay window is destroyed and cleaned up by cleanup_overlay_window.",
  },
  {
    q: "What Python call do I use?",
    a: "element.highlight(color=None, duration_ms=None, text=None, text_position=None, font_style=None). The signature is at packages/terminator-python/src/element.rs line 449. All arguments are optional. With no arguments you get a 3-second red border. Pass text='Save button' to add a label, text_position=terminator.TextPosition.bottom() to move it, font_style=terminator.FontStyle(size=18, bold=True, color=0xFFFFFF) to style it. The call returns a HighlightHandle whose close() method dismisses the overlay early.",
  },
  {
    q: "Why are the colors backwards from RGB?",
    a: "The color argument is a 32-bit BGR integer, not RGB, because that is the native format Windows GDI uses internally for COLORREF. Pure red is 0x0000FF, pure green is 0x00FF00, pure blue is 0xFF0000. The default is red (0x0000FF) — the constant DEFAULT_RED_COLOR is at highlighting.rs line 125 with the comment Pure red in BGR format. If you ever see your highlight come up in a color you did not expect, swap the first and last byte.",
  },
  {
    q: "Where can the text label sit relative to the element?",
    a: "Nine positions, defined as classmethods on terminator.TextPosition: top(), top_right(), right(), bottom_right(), bottom(), bottom_left(), left(), top_left(), and inside(). The match arms that compute the text rectangle for each position are at highlighting.rs lines 182 to 190. inside() draws the label 15 pixels inside the element bounds, top() draws it 10 pixels above, the diagonals push 15 pixels diagonally out, and so on. There is no rotation, only the nine anchor points.",
  },
  {
    q: "How is this different from pywinauto's draw_outline?",
    a: "pywinauto's draw_outline calls win32gui in pure Python on the desktop DC. It paints directly onto the desktop without creating a window, so the rectangle disappears the moment Windows redraws that screen region (a tooltip, a hover highlight on another window, even a mouse move). Terminator's highlight creates a layered transparent topmost window, so the overlay survives screen redraws for the full duration. It also supports text labels with size, bold, and color font styling, multi-position anchoring, and a returned HighlightHandle for early dismissal. None of those are in pywinauto.",
  },
  {
    q: "Will the overlay block my next click?",
    a: "No. The window is created with WS_EX_TRANSPARENT, which makes it click-through at the OS hit-testing level. Your next desktop.locator(...).click() goes straight to the underlying control. The overlay is also drawn with SW_SHOWNOACTIVATE, so it never grabs focus. You can stack a highlight on top of a real button and click the real button without dismissing anything.",
  },
  {
    q: "What is set_recording_mode(true) for?",
    a: "By default, highlight() calls scroll_into_view() on the element before painting, so off-screen controls scroll into view to be visible. That is good for live debugging but bad if you are recording a passive workflow and want to highlight whatever the user touches without disturbing the UI. The atomic flag set_recording_mode(true) (highlighting.rs line 60) globally suppresses the scroll. The recording subsystem flips it on, draws non-disruptive highlights of every event, and flips it off when recording ends. Same primitive, two modes.",
  },
  {
    q: "Does it work the same way on macOS and Linux?",
    a: "The Python API does. The same element.highlight(color=..., text=..., duration_ms=...) call is exposed cross-platform through the PyO3 binding. The Windows implementation is the GDI overlay window described here. The macOS and Linux backends paint through their own native compositors with matching semantics. If you write your debugging in terms of element.highlight(...), the script ports without changes; the visual will look slightly different because the underlying compositor is different, but the contract is the same.",
  },
  {
    q: "What about element.highlight_before_action — does that exist for Python too?",
    a: "It exists in the Rust core (crates/terminator/src/element.rs line 1351) and runs automatically before clicks and types when verbose action mode is enabled in the MCP server and CLI. It flashes a 500ms green (BGR 0x00FF00) border with the element's role as a top-anchored 12pt bold white label. From Python you get the equivalent by composing the primitives: handle = element.highlight(color=0x00FF00, duration_ms=500, text=element.role(), text_position=terminator.TextPosition.top()) right before your click. That is the same signature the Rust helper builds.",
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

const installLines = [
  { text: "pip install terminator-py", type: "command" as const },
  { text: "Collecting terminator-py", type: "output" as const },
  {
    text: "Downloading terminator_py-x.y.z-cp311-cp311-win_amd64.whl (6.7 MB)",
    type: "output" as const,
  },
  { text: "Installing collected packages: terminator-py", type: "success" as const },
  {
    text: "python -c \"import terminator; d=terminator.Desktop(); d.open_application('notepad').highlight(duration_ms=2000, text='Notepad')\"",
    type: "command" as const,
  },
  { text: "(red border with white 'Notepad' label flashes for 2 seconds)", type: "output" as const },
];

const heroPython = `# pip install terminator-py
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop(log_level="error")

    notepad = desktop.open_application("notepad.exe")
    await asyncio.sleep(1.5)

    # Find the editor area, then PAINT it on screen.
    editor = await notepad.locator("role:Document").first()

    # Real Win32 overlay. Layered, transparent, topmost.
    # Color is BGR. 0x00FF00 is pure green.
    editor.highlight(
        color=0x00FF00,
        duration_ms=2500,
        text="this is where I will type",
        text_position=terminator.TextPosition.top(),
        font_style=terminator.FontStyle(size=16, bold=True, color=0xFFFFFF),
    )

    editor.type_text("hello, with a visible cursor of intent.")

asyncio.run(main())`;

const colorPython = `# Color codes are BGR, not RGB.
# Pure red:   0x0000FF
# Pure green: 0x00FF00
# Pure blue:  0xFF0000
# Cyan:       0xFFFF00
# Magenta:    0xFF00FF
# Yellow:     0x00FFFF
# Orange:     0x0080FF

# Walk a Save dialog with a different color per element,
# so you can read the script's intent off the screen.
save_dialog = await app.locator("window:Save As").first()
save_dialog.highlight(color=0xFF00FF, duration_ms=3000, text="Save As")

filename_box = await save_dialog.locator("role:Edit").first()
filename_box.highlight(color=0x00FFFF, duration_ms=3000, text="filename")

save_btn = await save_dialog.locator("Button:Save").first()
save_btn.highlight(color=0x00FF00, duration_ms=3000, text="click me")
save_btn.click()`;

const recordingPython = `# Passive recording: paint highlights as the user works,
# but DO NOT scroll anything into view (that would be visible
# and would pollute the recorded interaction stream).
import terminator
from terminator import set_recording_mode

set_recording_mode(True)
try:
    for event in observed_events:    # your event source
        el = event.element
        # 250ms cyan flash, no scroll, no focus steal.
        el.highlight(color=0xFFFF00, duration_ms=250)
finally:
    set_recording_mode(False)`;

const handlePython = `# highlight() returns a HighlightHandle.
# You can dismiss it early when whatever you were
# waiting on actually happens.
import terminator

button = await window.locator("role:Button|name:Submit").first()
handle = button.highlight(
    color=0x0000FF,
    duration_ms=10000,         # up to 10 seconds...
    text="waiting for response",
    text_position=terminator.TextPosition.right(),
)

# ... do other work, poll a server, whatever ...
if response_arrived():
    handle.close()             # dismiss the overlay now`;

const overlayPipeline = {
  title: "What element.highlight() does on the wire",
  from: [
    { label: "Python call site", sublabel: "element.highlight(color, duration, text, ...)" },
    { label: "PyO3 binding", sublabel: "element.rs line 449, releases the GIL" },
    { label: "Rust core", sublabel: "highlight() at highlighting.rs:65" },
  ],
  hub: { label: "Layered overlay window", sublabel: "WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST" },
  to: [
    { label: "GDI Rectangle", sublabel: "border around element bounds" },
    { label: "GDI DrawTextW", sublabel: "label at one of 9 positions" },
    { label: "SW_SHOWNOACTIVATE", sublabel: "no focus stolen, click-through" },
    { label: "HighlightHandle", sublabel: "Python object, .close() dismisses" },
    { label: "Background thread", sublabel: "duration timer + cleanup_overlay_window" },
  ],
};

const colorChips = [
  "color=0x0000FF // red",
  "color=0x00FF00 // green",
  "color=0xFF0000 // blue",
  "color=0xFFFF00 // cyan",
  "color=0xFF00FF // magenta",
  "color=0x00FFFF // yellow",
  "color=0xFFA500 // light blue",
  "color=0x0080FF // orange",
  "color=0x800080 // purple",
];

const positionChips = [
  "TextPosition.top()",
  "TextPosition.top_right()",
  "TextPosition.right()",
  "TextPosition.bottom_right()",
  "TextPosition.bottom()",
  "TextPosition.bottom_left()",
  "TextPosition.left()",
  "TextPosition.top_left()",
  "TextPosition.inside()",
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Visible border around the element being touched",
    competitor: "No (pyautogui prints to stdout)",
    ours: "element.highlight(color, duration_ms, text)",
  },
  {
    feature: "Survives a desktop redraw",
    competitor: "pywinauto draw_outline gets erased the moment another window paints",
    ours: "Real layered topmost window, lives the full duration",
  },
  {
    feature: "Text label on the highlight",
    competitor: "Not supported",
    ours: "Up to 30 chars, 9 anchor positions, custom font",
  },
  {
    feature: "Click-through (does not block input)",
    competitor: "n/a",
    ours: "WS_EX_TRANSPARENT, the overlay never steals clicks",
  },
  {
    feature: "Early dismissal handle",
    competitor: "Not supported",
    ours: "highlight() returns a HighlightHandle with .close()",
  },
  {
    feature: "Passive recording mode",
    competitor: "Not supported",
    ours: "set_recording_mode(True) suppresses scroll_into_view",
  },
  {
    feature: "Same call shape on macOS and Linux",
    competitor: "Windows-only",
    ours: "element.highlight(...) is cross-platform PyO3",
  },
];

const installSteps = [
  {
    title: "Install the wheel",
    description:
      "pip install terminator-py. PyPI ships pre-built wheels for Python 3.10, 3.11, 3.12 on Windows. The import name is terminator, the package name has a hyphen.",
  },
  {
    title: "Open an app, grab a UIElement",
    description:
      "desktop = terminator.Desktop(); window = desktop.open_application('notepad'). open_application returns the top-level UIElement for the window. Every locator hangs off that.",
  },
  {
    title: "Highlight before you act",
    description:
      "element.highlight(color=0x00FF00, duration_ms=500, text='click') paints a green border with a label. Then call .click(). The label is your script telling itself, and you, what it thinks it is doing.",
  },
  {
    title: "Use BGR colors per intent",
    description:
      "Pick a color convention: green for clicks, cyan for typed text, magenta for windows, orange for waits. Reading the highlight stream off the screen replaces print debugging.",
  },
  {
    title: "Switch to recording mode for capture",
    description:
      "When recording user actions for a workflow, terminator.set_recording_mode(True) suppresses the implicit scroll_into_view so highlights are non-disruptive. Flip it back to False when you are done.",
  },
];

const featureCards = [
  {
    title: "Real Win32 overlay window",
    description:
      "Created with CreateWindowExW under the WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST | WS_EX_TOOLWINDOW flags (highlighting.rs line 427). Painted with GDI Rectangle and FillRect. Cleaned up by cleanup_overlay_window when the duration expires.",
    size: "2x1" as const,
  },
  {
    title: "Click-through by design",
    description:
      "WS_EX_TRANSPARENT makes the overlay invisible to hit testing. Your next click goes through it. SW_SHOWNOACTIVATE keeps focus where it was.",
    size: "1x1" as const,
  },
  {
    title: "BGR colors, not RGB",
    description:
      "Native COLORREF format. 0x0000FF is red, 0xFF0000 is blue. If your highlight came up in the wrong color, swap the first and last byte.",
    size: "1x1" as const,
  },
  {
    title: "Nine text positions",
    description:
      "TextPosition.top(), top_right(), right(), bottom_right(), bottom(), bottom_left(), left(), top_left(), inside(). Each one resolves to a hand-coded offset (highlighting.rs lines 182 to 190).",
    size: "2x1" as const,
  },
  {
    title: "HighlightHandle for early dismissal",
    description:
      "highlight() returns a Python object. Call .close() to take the overlay down before the duration expires. Useful for waits that resolve early.",
    size: "1x1" as const,
  },
  {
    title: "Recording mode",
    description:
      "set_recording_mode(True) flips an atomic boolean (highlighting.rs line 60) that suppresses scroll_into_view, so the overlay can mirror user actions without disturbing the UI.",
    size: "1x1" as const,
  },
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
          Windows automation in Python,{" "}
          <GradientText>with a visible cursor of intent</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every Python automation script for Windows you have ever written ran
          blind. The cursor flickers, a window pops up, something happens, and
          you have no way to see which control your script actually grabbed.
          Terminator&apos;s Python binding ships{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            element.highlight()
          </code>
          , a real Win32 GDI overlay that draws a colored, click-through
          border around any element your script touches, with a text label
          where you want it. The visual debugger pywinauto never had.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "Real WS_EX_LAYERED + WS_EX_TRANSPARENT + WS_EX_TOPMOST overlay",
          "9 text positions including Inside",
          "Source: crates/terminator/src/platforms/windows/highlighting.rs line 65",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Windows automation in Python, but you can SEE it"
            subtitle="One method on every UIElement paints what your script is doing."
            captions={[
              "editor = await window.locator('role:Document').first()",
              "editor.highlight(color=0x00FF00, duration_ms=2500, text='type here')",
              "editor.type_text('hello.')",
              "Real Win32 layered overlay. Click-through. Topmost.",
              "9 text positions, BGR colors, HighlightHandle for early close",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What every other guide on this topic skips
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Open the existing playbooks for Windows automation in Python and you
          will find the same four libraries: pywinauto for the UI tree,
          pyautogui for raw mouse and keyboard, pywin32 for COM, and the
          keyboard library for global hotkeys. They all work, they have all
          worked for a decade, and they all expect you to debug by reading
          stdout.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          That is a strange place to be in 2026. We have desktop windows that
          can render anything. We have GPUs that can paint a million
          rectangles per frame. And we are still typing{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            print(child.element_info.control_type, child.rectangle())
          </code>{" "}
          to figure out which button the script grabbed. The script knows
          where it is clicking. The screen does not show it.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator fixes that with a single method on every UIElement. The
          method exists because the Rust core spawns a real layered transparent
          topmost window, paints a GDI border into it, optionally labels it,
          and tears it down on a timer. From Python you call it like any other
          method. The first time you run a script with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            .highlight()
          </code>{" "}
          calls before each action, you stop print-debugging forever.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The one method this whole page is about
        </h2>
        <p className="text-zinc-600 mb-6">
          This is a real Python script you can paste into a file and run on a
          Windows machine with Notepad installed. It opens Notepad, finds the
          editor area, paints a green border with a white &quot;this is where
          I will type&quot; label above it, and types into the document. Watch
          your screen.
        </p>
        <AnimatedCodeBlock
          code={heroPython}
          language="python"
          filename="visible_typing.py"
        />
      </section>

      <ProofBanner
        quote="WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST | WS_EX_TOOLWINDOW"
        source="The exact CreateWindowExW flag set used by the highlight overlay, at crates/terminator/src/platforms/windows/highlighting.rs line 427"
        metric="4 flags"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What happens between Python and the screen
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          When you call{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            element.highlight(...)
          </code>{" "}
          from Python, the PyO3 binding at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            packages/terminator-python/src/element.rs:449
          </code>{" "}
          drops the GIL and forwards the call into the Rust core. The Rust
          core spawns a background thread that creates a real Win32 overlay
          window, paints the border and optional text, and waits for the
          duration to expire (or for{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            HighlightHandle.close()
          </code>{" "}
          to be called from Python).
        </p>
        <AnimatedBeam
          title="element.highlight(...) end to end"
          from={overlayPipeline.from}
          hub={overlayPipeline.hub}
          to={overlayPipeline.to}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The numbers worth knowing
        </h2>
        <p className="text-zinc-600 mb-6">
          A quick read of the surface area, in case you are scanning.
        </p>
        <MetricsRow
          metrics={[
            { value: 1, label: "Python method on every UIElement" },
            { value: 9, label: "text positions for the label" },
            { value: 30, label: "max characters in the label" },
            { value: 4, label: "Win32 extended-style flags on the overlay window" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install and prove it works
        </h2>
        <p className="text-zinc-600 mb-6">
          One pip command, one one-liner that opens Notepad and flashes a
          highlighted label on it. If you see a red border with the word
          Notepad in white text above the window, you are wired up.
        </p>
        <TerminalOutput title="powershell" lines={installLines} />
      </section>

      <StepTimeline title="From pip install to a script you can read off the screen" steps={installSteps} />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The trap nobody warns you about: BGR, not RGB
        </h2>
        <p className="text-zinc-600 mb-6">
          The{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            color
          </code>{" "}
          argument is a Win32 COLORREF, which is BGR-packed. Pure red is{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            0x0000FF
          </code>
          , pure blue is{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            0xFF0000
          </code>
          . The constant{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            DEFAULT_RED_COLOR: u32 = 0x0000FF;
          </code>{" "}
          at highlighting.rs line 125 carries the comment &quot;Pure red in
          BGR format&quot; so the surprise is at least documented in the
          source.
        </p>
        <AnimatedCodeBlock
          code={colorPython}
          language="python"
          filename="color_per_intent.py"
        />
        <p className="text-zinc-600 mt-6">
          A useful convention: pick a color per kind of action and never
          break it. Green for clicks, cyan for typed text, magenta for
          windows, orange for waits. Reading the highlight stream off the
          screen becomes a debug log you do not have to print.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The nine places a label can sit
        </h2>
        <p className="text-zinc-600 mb-6">
          Each call to{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            terminator.TextPosition
          </code>{" "}
          returns a position object you pass into{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            text_position
          </code>
          . The match arms that compute the offset for each anchor live at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            highlighting.rs:182-190
          </code>
          .
        </p>
        <Marquee speed={36} pauseOnHover>
          {positionChips.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 font-mono whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
        <div className="mt-8">
          <Marquee speed={26} reverse pauseOnHover>
            {colorChips.map((label) => (
              <span
                key={label}
                className="mx-3 inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-700 font-mono whitespace-nowrap"
              >
                {label}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The full feature surface
        </h2>
        <p className="text-zinc-600 mb-6">
          Everything that distinguishes this from a printf and a prayer.
        </p>
        <BentoGrid cards={featureCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The HighlightHandle, for waits that finish early
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A common pattern is to highlight an element while you wait for
          something else (a server response, a file to land on disk, a
          spinner to disappear). When the wait completes you want the
          overlay gone immediately, not after the original duration.{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            highlight()
          </code>{" "}
          returns a Python{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            HighlightHandle
          </code>{" "}
          whose{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            close()
          </code>{" "}
          method dismisses the overlay and joins the background thread.
        </p>
        <AnimatedCodeBlock
          code={handlePython}
          language="python"
          filename="early_dismiss.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Recording mode, for highlights that do not move the UI
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          By default, highlight() calls{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            scroll_into_view()
          </code>{" "}
          on the element before painting, so off-screen controls scroll into
          view to be visible. That is the right behavior when you are
          actively debugging. It is the wrong behavior when you are passively
          recording user actions and the highlight is just a visual echo:
          forcing scroll changes the very thing you are trying to record.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The fix is one global atomic boolean.{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            terminator.set_recording_mode(True)
          </code>{" "}
          flips{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            RECORDING_MODE
          </code>{" "}
          at highlighting.rs line 39 to true. While that flag is set,
          highlight() skips the scroll step entirely and draws the overlay
          where the element currently is, even if that is off screen.
        </p>
        <AnimatedCodeBlock
          code={recordingPython}
          language="python"
          filename="passive_recording.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Watch the call cross the boundary in three frames
        </h2>
        <MotionSequence
          title="Python -> PyO3 -> Win32 -> the screen"
          frames={[
            {
              title: "Frame 1: Python invokes the binding",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  Python calls{" "}
                  <code className="font-mono text-sm">
                    element.highlight(color=0x00FF00, duration_ms=500, text=&apos;Save&apos;)
                  </code>
                  . The PyO3 wrapper at{" "}
                  <code className="font-mono text-sm">
                    packages/terminator-python/src/element.rs:449
                  </code>{" "}
                  unpacks the optional arguments, releases the GIL, and
                  forwards into the cross-platform UIElement.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 2: Rust spawns the overlay",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  The platform-specific{" "}
                  <code className="font-mono text-sm">
                    highlight()
                  </code>{" "}
                  in highlighting.rs spawns a background thread, computes the
                  text rectangle from the chosen TextPosition, and calls{" "}
                  <code className="font-mono text-sm">
                    create_and_show_overlay
                  </code>{" "}
                  which does CreateWindowExW with WS_EX_LAYERED |
                  WS_EX_TRANSPARENT | WS_EX_TOPMOST | WS_EX_TOOLWINDOW.
                </p>
              ),
              duration: 3000,
            },
            {
              title: "Frame 3: GDI paints, then cleanup",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  The window procedure handles WM_PAINT by drawing a colored
                  Rectangle around the element bounds and DrawTextW for the
                  label. The thread sleeps in 50 ms slices until the duration
                  expires or the HighlightHandle&apos;s atomic close flag is
                  flipped, then{" "}
                  <code className="font-mono text-sm">
                    cleanup_overlay_window
                  </code>{" "}
                  destroys the HWND. From Python you have already moved on.
                </p>
              ),
              duration: 3200,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three numbers worth memorizing
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={9} />
            </div>
            <p className="text-sm text-zinc-600">
              text positions for the label, from{" "}
              <code className="text-xs">TextPosition.top()</code> all the way
              around to <code className="text-xs">TextPosition.inside()</code>.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={4} />
            </div>
            <p className="text-sm text-zinc-600">
              extended-style flags on the overlay HWND: LAYERED, TRANSPARENT,
              TOPMOST, TOOLWINDOW. Click-through, focus-safe, never in the
              taskbar.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={3000} />
              <span className="text-2xl font-semibold text-zinc-500"> ms</span>
            </div>
            <p className="text-sm text-zinc-600">
              default duration when{" "}
              <code className="text-xs">duration_ms</code> is omitted, set
              inside the spawned thread at highlighting.rs line 161.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Terminator&apos;s highlight versus everything else
        </h2>
        <ComparisonTable
          productName="terminator-py"
          competitorName="pywinauto / pyautogui / pywin32"
          rows={comparisonRows}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see your Windows automation script paint itself on screen?"
        description="Book 20 minutes. We will wire terminator-py into a real Python automation of your choice and turn print-debugging into highlights."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See element.highlight() paint a real Win32 overlay on your own desktop, live."
      />
    </article>
  );
}
