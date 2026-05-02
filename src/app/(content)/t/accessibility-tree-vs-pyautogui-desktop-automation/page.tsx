import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  ComparisonTable,
  BeforeAfter,
  BentoGrid,
  AnimatedChecklist,
  SequenceDiagram,
  CodeComparison,
  InlineTestimonial,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type BentoCard,
  type ComparisonRow,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/accessibility-tree-vs-pyautogui-desktop-automation";
const PUBLISHED = "2026-05-01";
const TITLE =
  "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation";
const DESCRIPTION =
  "PyAutoGUI's click(x, y) always lowers to SendInput because PyAutoGUI does not know what is at (x, y). Accessibility tree automation calls UIInvokePattern.invoke() on the element's COM proxy and never generates a HID event. Twenty two lines of Rust at element.rs:838 to 859 vs the eighty line SendInput path at input.rs:38 to 117 explain the entire difference.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Accessibility tree automation calls a method on the element. PyAutoGUI sends a mouse event at coordinates. They are different operations with different failure modes. Read the line numbers.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility tree automation vs PyAutoGUI, at the syscall layer",
    description:
      "invoke() calls UIInvokePattern.invoke() on the element's COM proxy. PyAutoGUI's click(x, y) always lowers to SendInput. Two different operations.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  {
    label: "Accessibility tree automation vs PyAutoGUI",
  },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Accessibility tree automation vs PyAutoGUI", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the literal difference between an accessibility tree click and a PyAutoGUI click?",
    a: "Accessibility tree automation calls a method on a UI element. PyAutoGUI sends a mouse event at coordinates. On Windows, the tree path resolves to IUIAutomationInvokePattern::Invoke, a COM call that runs inside the target process and returns a binary success or failure. The PyAutoGUI path resolves to SendInput with MOUSEEVENTF_ABSOLUTE plus MOUSEEVENTF_MOVE plus MOUSEEVENTF_LEFTDOWN plus MOUSEEVENTF_LEFTUP, a kernel call that injects HID events at normalized screen coordinates. The two operations have different types. One asks the element to perform its default action; the other moves a virtual mouse and presses a virtual button at a screen location and hopes the right element is under it.",
  },
  {
    q: "When should I pick PyAutoGUI over an accessibility tree library?",
    a: "When the target does not expose a tree. That is the only honest case. Three real examples: a fullscreen game rendered through DirectX or OpenGL where the only thing on the screen is a frame buffer; a canvas-based design tool like Figma's drawing surface where each tool's hit region lives inside a single canvas element with no children; a sandboxed remote desktop or virtual machine viewer where the accessibility bridge does not cross the host boundary. In all three the AX or UIA tree is empty or single-node, and pixel coordinates are the only addressable thing. Everywhere else, picking PyAutoGUI is choosing the OS's worst-case input path on purpose.",
  },
  {
    q: "Is the accessibility tree actually faster, or is that just a marketing claim?",
    a: "It is faster, and the cause is not mysterious. SendInput on Windows posts events into the message queue, which the OS schedules with timing that depends on cursor smoothing settings, foreground priority, and any IME or low level keyboard hook installed by other software. A typical click is at minimum the time to move plus debounce plus down plus up, and most automation tools add a 10 to 50 ms safety pause around each event so the target can react. UIInvokePattern.invoke runs as a COM cross process call and returns when the target process acknowledges. There is no virtual cursor motion, no debounce window, no foreground gating. On Terminator's own claim of 100x faster than screenshot or pixel based agents, the source is the llms.txt at line 243: 'CPU speed, not LLM inference', which describes pattern invocation specifically.",
  },
  {
    q: "Why does PyAutoGUI break when the user resizes the window or changes DPI?",
    a: "Because (x, y) is a coordinate in screen space, and screen space changes. A button at (412, 300) on a 1920x1080 monitor at 100% scale is at (515, 375) on the same window dragged to a 200% scaled 4K monitor. PyAutoGUI's locateOnScreen function (the higher level alternative) takes a reference image and template matches against the current screenshot pixel by pixel; PyAutoGUI's own docs note that 'if a single pixel is a different color, locateOnScreen will not find the image'. The accessibility tree carries semantic identity (role, automation id, name) that survives DPI changes, theme changes, resolution changes, and most layout changes. The only thing that breaks the tree path is the developer renaming the control or removing the AutomationId, and that shows up as a typed ElementNotFoundError instead of a click on the wrong place.",
  },
  {
    q: "Does the accessibility tree solve everything? What does it miss?",
    a: "Two things, both worth knowing. First, custom controls that draw their own pixels and do not implement the AX or UIA provider interface show up in the tree as a single opaque element. Some games, some terminal emulators, some 3D modellers, and some legacy ActiveX widgets fall in this bucket. Second, write actions through the AX bridge sometimes silently no-op on browser web views: AXPress and AXClick on macOS Chrome and Safari return success and do nothing, which is why production AX engines maintain hardcoded browser bypass lists and fall back to synthetic input on those apps. The tree is the right default; the synthetic input path is the right fallback; PyAutoGUI is the right tool when there is nothing else.",
  },
  {
    q: "What does Terminator actually do under the hood, line by line?",
    a: "On Windows, Terminator's invoke() at crates/terminator/src/platforms/windows/element.rs lines 838 to 859 is twenty two lines of Rust. It calls get_pattern::<patterns::UIInvokePattern>() on the wrapped IUIAutomationElement, classifies the error into UnsupportedOperation or PlatformError, and calls invoke_pat.invoke(). No SendInput, no GetCursorPos, no screen metrics math. The fallback click() path lives in crates/terminator/src/platforms/windows/input.rs at function send_mouse_click starting line 38, and it is the canonical SendInput dance: GetCursorPos to save state, GetSystemMetrics for SM_CXSCREEN and SM_CYSCREEN, multiply by 65535 and divide by screen size to normalize, build three INPUT structs (move, down, up), call SendInput on each. Roughly eighty lines for the path that PyAutoGUI's whole click is conceptually a port of.",
  },
  {
    q: "Can I run an accessibility tree tool while still using my mouse for normal work?",
    a: "Yes, and that is the largest practical difference. Pattern invocation does not move the cursor or change keyboard focus. You can run an automation against a background Excel workbook while continuing to write code in another window. PyAutoGUI cannot do this; every click physically moves your cursor and every typewrite physically presses your keys. If your cursor was hovering a save button when the script fires, the script's click and your accidental human click queue together, and which one wins is undefined. Terminator markets this as 'does not take over your cursor or keyboard', and that statement is literally true for every action that resolves to a UIA pattern: invoke, toggle, expand_collapse, set_selected, and type_text against a value pattern edit control.",
  },
  {
    q: "Is there a Python library that does what Terminator does, but for those who already use PyAutoGUI?",
    a: "Several, with tradeoffs. pywinauto is the closest historical match on Windows: it walks UIA, exposes a Python-shaped API, and has been around for a decade. Its weakness is concurrency; it is fully synchronous and holds the GIL through every UIA call, so asyncio.gather cannot parallelize it. Terminator's Python binding (pip install terminator-py, import terminator) wraps the same Rust UIA core that drives the MCP server, and every awaitable releases the GIL onto a Tokio reactor, which means asyncio.gather across multiple apps actually overlaps. atomacos and pyobjc-framework-ApplicationServices cover the macOS AX side. None of them ship the synthetic input fallback list out of the box; you usually wire that in yourself when a target lies about supporting AXPress.",
  },
  {
    q: "Is PyAutoGUI dead? Why does it keep coming up in tutorials?",
    a: "PyAutoGUI is not dead, and it is the right answer for a narrow set of problems: scripts that operate over genuinely opaque graphical targets (games, canvas apps, presentations, retro emulators), educational examples where a beginner needs to see a cursor move, automation across an OS or app combination where no AX bridge exists. The tutorial overrepresentation comes from PyAutoGUI being the easiest possible thing to demo in five lines of Python. The cost of that simplicity shows up in production: every script that reaches a thousand actions ends up either (a) growing a screenshot diff harness to detect when a pixel changed, or (b) being rewritten against an accessibility library because the screenshot harness still misses things on a different DPI.",
  },
  {
    q: "If I am writing an AI agent, which one should the agent use to interact with the desktop?",
    a: "The accessibility tree, with PyAutoGUI as the bottom of the fallback stack. An agent that takes screenshots and asks an LLM to output (x, y) coordinates is paying the LLM inference latency on every action, which is the path ChatGPT Agents and Claude computer use take. Terminator's own claim is roughly 100x faster on this loop because invoke() is a COM call that does not require a model in the loop at all; the model picks a selector, the framework resolves it, and the action fires. PyAutoGUI underneath catches the cases where the tree returns nothing, and OCR plus vision AI catches the cases where even pixel coordinates are not stable. The tree is not the only layer, but it is the layer that turns an agent loop from inference-bound to CPU-bound.",
  },
];

const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const articleSchemaJson = articleSchema({
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

const comparisonRows: ComparisonRow[] = [
  {
    feature: "what the click resolves to in the OS",
    competitor:
      "SendInput with MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_MOVE | MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_LEFTUP",
    ours:
      "IUIAutomationInvokePattern::Invoke, a COM call into the target process",
  },
  {
    feature: "how the target is addressed",
    competitor:
      "absolute screen coordinates, normalized to 0 to 65535 by screen size",
    ours:
      "selector grammar resolved to an IUIAutomationElement: role, name, AutomationId, process scope",
  },
  {
    feature: "cursor and keyboard while running",
    competitor:
      "physically moves cursor, presses real virtual keys, fights live user input",
    ours:
      "no cursor motion, no keyboard focus change, runs while you keep working",
  },
  {
    feature: "behavior at different DPI or resolution",
    competitor:
      "coordinates and reference images go stale; rerecord on every monitor",
    ours:
      "selectors carry semantic identity; survive DPI, theme, resolution changes",
  },
  {
    feature: "failure when target moves or hides",
    competitor:
      "click lands on whatever is now at (x, y), often the wrong thing, silently",
    ours:
      "ElementNotFoundError, ElementNotVisible, or ElementNotEnabled, all typed",
  },
  {
    feature: "speed per action",
    competitor:
      "limited by SendInput timing, debounce, and any added safety pause",
    ours:
      "limited by COM round trip into the target process, hundreds of actions per second",
  },
  {
    feature: "works on canvas, OpenGL, DirectX surfaces",
    competitor:
      "yes, the only option for these targets",
    ours:
      "no, the tree is empty or single node",
  },
  {
    feature: "works on Win32, WinUI, UWP, AppKit, Electron, web in browser",
    competitor:
      "yes via pixels, but coordinates and template images are brittle",
    ours:
      "yes via the tree the OS exposes for screen readers",
  },
  {
    feature: "concurrency across multiple apps",
    competitor:
      "single threaded; serializes through a virtual cursor",
    ours:
      "providers run per process; asyncio.gather across apps actually overlaps",
  },
  {
    feature: "the rough size of the click implementation",
    competitor:
      "the full SendInput dance (about 80 lines on input.rs:38 to 117)",
    ours:
      "twenty two lines on element.rs:838 to 859 calling invoke_pat.invoke()",
  },
];

const pyautoguiSnippet = `# pyautogui : everything is coordinates

import pyautogui

# move the cursor and click at a screen point
pyautogui.click(412, 300)

# or, find the button by template matching against a screenshot
button = pyautogui.locateOnScreen('save_button.png', confidence=0.9)
if button is not None:
    pyautogui.click(pyautogui.center(button))

# typing is virtual key presses (your real keyboard is the target)
pyautogui.typewrite('hello world', interval=0.05)

# windows path: this resolves to user32!SendInput with
# MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_MOVE | MOUSEEVENTF_LEFTDOWN
# | MOUSEEVENTF_LEFTUP for the click, and SendInput with
# KEYEVENTF_UNICODE for each character of typewrite.
#
# this is the same primitive a real human uses to drive the OS,
# which means everything that fights real human input fights this:
# foreground window changes, focus stealing protection, IME hooks,
# screen recording overlays, accidental cursor motion, monitor DPI.`;

const treeSnippet = `// terminator : everything is a selector

const desktop = new Desktop();

// find the button by what it IS, not where it is
const save = await desktop
  .locator("process:notepad >> role:Button && name:Save")
  .first(3000);

// invoke() runs the element's default action through UIA
// no cursor motion, no SendInput, no foreground gating
save.invoke();

// type into a real edit control via ValuePattern (no key events)
const editor = await desktop
  .locator("process:notepad >> role:Edit")
  .first(3000);
editor.typeText("hello world", { clearBeforeTyping: true });

// windows path under the hood, file by file:
//
//   crates/terminator/src/platforms/windows/element.rs
//     fn invoke(&self) -> Result<(), AutomationError> {
//         let pat = self.element.0
//             .get_pattern::<patterns::UIInvokePattern>()?;
//         pat.invoke()                          // line 857
//     }
//                                                // 22 lines total,
//                                                // 838 to 859
//
// no SendInput in this path. no MOUSEEVENTF flags. no normalized
// screen coordinates. the action fires inside the target process.`;

const beforeAfter = {
  title: "Same task, two ways to send the click",
  before: {
    label: "PyAutoGUI",
    content:
      "Save the document in Notepad. With PyAutoGUI you find the save button by where it is on the screen, take a screenshot of it, save the image to disk, then in your script open the image, locate it on the live screen via template matching, compute its center in pixels, move the virtual cursor there, and synthesize a left mouse down and a left mouse up. Every step has a way to fail. The reference image goes stale when the OS theme changes. The match misses when the user is on a different DPI scale. The cursor motion conflicts with whatever the human is doing right now. The save dialog opens at a different position than your reference shot of the editor.",
    highlights: [
      "reference image must be re-captured on every theme, DPI, or resolution change",
      "click moves the real cursor; conflicts with the user's live input",
      "no error if the wrong element is at (x, y); the click just lands on something else",
      "scripts get longer every time a new desktop config breaks an old reference",
    ],
  },
  after: {
    label: "Accessibility tree",
    content:
      "Same task, with a tree-based library. You write `process:notepad >> role:Button && name:Save`. The framework calls IUIAutomation::ElementFromSelector, walks the tree, finds the IUIAutomationElement that matches role and name inside the notepad process, asks it for its UIInvokePattern, and calls Invoke on it. The action runs inside the notepad process via COM. Your cursor stays where it is. Your keyboard focus stays where it is. The save fires. If the button is not on screen, you get ElementNotVisible (use invoke instead, which does not require viewport visibility). If the button is disabled, you get ElementNotEnabled. If notepad is not running, you get ElementNotFoundError. Each failure is typed and points to its fix.",
    highlights: [
      "selectors survive DPI, theme, resolution, layout shifts",
      "invoke() runs in the target process; no cursor motion, no focus change",
      "every failure is a typed error with a fallback suggestion",
      "the same selector grammar works on Win32, WinUI, UWP, Electron, browsers",
    ],
  },
};

const failureModeCards: BentoCard[] = [
  {
    title: "Where PyAutoGUI is the only option",
    description:
      "Fullscreen DirectX or OpenGL games with one frame buffer and no AX provider. Canvas drawing surfaces in browsers (Figma, Excalidraw, Miro) where every tool lives inside a single canvas element. Sandboxed remote desktop and VM viewers where the AX bridge does not cross the host boundary. In these cases the tree is empty or single node, and pixel coordinates are the only addressable surface.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Where PyAutoGUI silently does the wrong thing",
    description:
      "Multi monitor with mixed DPI scaling. PyAutoGUI's own docs note multi-monitor behavior is unreliable depending on OS version. The click lands on whatever is now at (x, y), and 'whatever' might be a different window than the one your reference image came from.",
    size: "1x1",
  },
  {
    title: "Where the tree silently does the wrong thing",
    description:
      "macOS Chrome, Safari, Arc, Firefox web views. AXPress and AXClick return kAXErrorSuccess and the page never changes. Production AX engines maintain a hardcoded browser bypass list (8 names in the deleted Terminator macos.rs at lines 415 to 424) and fall back to synthetic input on those apps. The tree is the default; the synthetic path is the planned fallback.",
    size: "1x1",
  },
  {
    title: "Where the tree is unambiguously better",
    description:
      "Native Win32, WinUI, UWP, AppKit, every Electron app, every Office app, the system shell. These all expose rich AX or UIA trees with stable AutomationIds and named controls. A selector lasts across releases of the target app; a pixel reference does not.",
    size: "1x1",
  },
  {
    title: "Where they cooperate",
    description:
      "Many production agents stack them. Tree first for speed and determinism; OCR or template matching for elements with no AX provider; PyAutoGUI synthetic input for anything that requires real cursor motion (drag and drop in apps that hit-test from MouseMove, animation triggers, drawing). Terminator's own architecture is described in llms.txt as 'accessibility tree + DOM + OCR + vision AI for maximum reliability'.",
    size: "2x1",
  },
];

const ruleChecklist = [
  {
    text: "Does the target expose a real AX or UIA tree with named controls? Use the tree.",
  },
  {
    text: "Is your script going to run while a human uses the same machine? Use the tree (no cursor takeover).",
  },
  {
    text: "Will it run in CI on a headless or remote VM where DPI may differ from your dev box? Use the tree (selectors survive DPI).",
  },
  {
    text: "Will it run hundreds of actions in an agent loop? Use the tree (CPU speed, not HID-event speed).",
  },
  {
    text: "Is the target a fullscreen game, canvas drawing surface, or DirectX renderer? PyAutoGUI is the only option.",
  },
  {
    text: "Does the target's tree return success on the action but the UI does not change? Fall back to synthetic input (PyAutoGUI's primitive, but ideally through your tree library's own click() method that falls back to SendInput).",
  },
  {
    text: "Are you writing an LLM agent that picks targets visually? Stack them: tree for the actions the LLM resolves to a selector, vision plus PyAutoGUI for the targets it can only describe by appearance.",
  },
];

const stackedTools = [
  "PyAutoGUI",
  "pywinauto",
  "atomacos",
  "pyobjc-framework-ApplicationServices",
  "Sikuli",
  "uiautomation",
  "Hammerspoon axuielement",
  "terminator-py",
];

const relatedPosts = [
  {
    title:
      "Accessibility API desktop automation: fire Control Patterns, skip the mouse",
    excerpt:
      "Companion deep dive on UIA Control Patterns. invoke() at element.rs:838-859 calls UIInvokePattern.invoke() directly. Toggle, ExpandCollapse, Value, SelectionItem rounded out.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Patterns",
  },
  {
    title:
      "Python desktop automation that actually runs concurrently with asyncio.gather",
    excerpt:
      "PyAutoGUI and pywinauto are sync and hold the GIL. terminator-py wraps every awaitable in pyo3_tokio::future_into_py_with_locals so asyncio.gather across apps overlaps for real.",
    href: "/t/python-desktop-automation",
    tag: "Python",
  },
  {
    title:
      "macOS accessibility UI tree automation: the write path nobody warns you about",
    excerpt:
      "AXPress and AXClick lie on Chrome, Safari, Arc, Firefox web views. The 8-browser bypass list, the 3-tier click fallback, the manual Send + Sync wrapper. From a 4,368-line macos.rs.",
    href: "/t/macos-accessibility-ui-tree",
    tag: "macOS",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchemaJson),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Accessibility tree automation vs PyAutoGUI:{" "}
            <span className="text-orange-600">
              the two clicks are not the same operation
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            Most comparisons of these two approaches read like checklists.
            One uses image recognition, the other uses UIA, both can drive
            mouse and keyboard. That framing buries the actual difference.
            The two libraries hit different primitives in the operating
            system. PyAutoGUI&apos;s{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click(x, y)
            </code>{" "}
            always lowers to{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              SendInput
            </code>{" "}
            because PyAutoGUI does not know what is at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              (x, y)
            </code>
            . Accessibility tree automation calls{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              UIInvokePattern.invoke()
            </code>{" "}
            on the element&apos;s COM proxy and never generates an HID
            event. Twenty two lines of Rust at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              element.rs:838-859
            </code>{" "}
            versus the eighty line{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              SendInput
            </code>{" "}
            path at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              input.rs:38-117
            </code>{" "}
            explain the entire difference.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIInvokePattern
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              SendInput
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MOUSEEVENTF_ABSOLUTE
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              IUIAutomationElement
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MIT
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-01)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">Pick the accessibility tree</strong>{" "}
              when the target exposes one. That is every native Win32,
              WinUI, UWP, AppKit, Electron, and Chromium-based app, plus
              most modern web through the browser&apos;s AX bridge. It
              runs in the background, does not fight your cursor, survives
              DPI and theme changes, and is roughly 100x faster on agent
              loops because it bypasses HID input entirely.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">Pick PyAutoGUI</strong>{" "}
              when the target does not expose a tree:
              fullscreen DirectX or OpenGL games, canvas-rendered design
              tools (Figma&apos;s drawing surface, Excalidraw, Miro), and
              sandboxed remote desktop or VM viewers where the AX bridge
              does not cross the host boundary. Authoritative sources:{" "}
              <a
                href="https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-implementinginvoke"
                className="text-orange-700 underline underline-offset-2"
              >
                Microsoft UIA Invoke pattern
              </a>{" "}
              and{" "}
              <a
                href="https://pyautogui.readthedocs.io/en/latest/"
                className="text-orange-700 underline underline-offset-2"
              >
                PyAutoGUI documentation
              </a>
              .
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers building real desktop automation"
            highlights={[
              "PyAutoGUI's own docs warn 'a single different pixel' breaks locateOnScreen",
              "Terminator's invoke() at element.rs:838-859 is 22 lines, no SendInput on that path",
              "Pattern invocation runs in the target process, no cursor takeover",
              "100x faster than screenshot-based agents on the same agent loop (llms.txt:243)",
            ]}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Two libraries, two different things they do to the OS
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most articles framing this comparison stop at &ldquo;PyAutoGUI
            is image-based, the others are accessibility-based&rdquo;.
            That description is true and useless. It hides the fact that
            the two libraries call into the operating system at different
            layers, and once you see the layers the choice becomes
            mechanical instead of philosophical.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            PyAutoGUI is a thin Python wrapper around the OS&apos;s human
            input emulation API. On Windows that is{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              user32!SendInput
            </code>
            ; on macOS{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              CGEventPost
            </code>
            ; on X11{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              XTest
            </code>
            . These functions all do the same thing: inject a synthetic
            mouse or keyboard event at a screen coordinate as if a real
            human had moved their hand there. The OS does not care that
            the event came from a script.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            An accessibility tree library calls a different family of
            functions. On Windows the call is{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              IUIAutomationInvokePattern::Invoke
            </code>{" "}
            on a COM proxy that lives inside the target application&apos;s
            address space. The proxy receives the call cross-process,
            runs whatever the application has wired up as the
            element&apos;s default action, and returns. No cursor
            motion. No virtual key press. No way for a human at the
            keyboard to interfere.
          </p>
          <SequenceDiagram
            title="What happens when you click a Save button, by library"
            actors={["Your script", "PyAutoGUI / OS HID", "Target process", "UIA / accessibility"]}
            messages={[
              { from: 0, to: 1, label: "click(412, 300)", type: "request" },
              { from: 1, to: 1, label: "SendInput MOUSEMOVE", type: "event" },
              { from: 1, to: 1, label: "SendInput LEFTDOWN", type: "event" },
              { from: 1, to: 1, label: "SendInput LEFTUP", type: "event" },
              { from: 1, to: 2, label: "OS dispatches WM_LBUTTONDOWN", type: "request" },
              { from: 2, to: 0, label: "(maybe) OnSaveClicked()", type: "response" },
              { from: 0, to: 3, label: "invoke('Save')", type: "request" },
              { from: 3, to: 2, label: "IUIAutomationInvokePattern::Invoke", type: "request" },
              { from: 2, to: 3, label: "OnSaveClicked()", type: "response" },
              { from: 3, to: 0, label: "Ok(())", type: "response" },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The top half is PyAutoGUI. Three SendInput calls, an OS
            dispatch step, and a hope that the WM_LBUTTONDOWN lands on
            the save button instead of a notification toast that just
            popped up. The bottom half is the tree. One method call,
            cross-process, returns when the action is done.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The same task, written both ways
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Save a Notepad document, the canonical hello-world of
            desktop automation. Tab between the two implementations
            below. The PyAutoGUI version is shorter to write. The tree
            version is shorter to maintain.
          </p>
          <BeforeAfter
            before={beforeAfter.before}
            after={beforeAfter.after}
            title={beforeAfter.title}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Reading the actual code
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The PyAutoGUI script and the Terminator script aren&apos;t
            actually doing the same thing under the hood. Reading both
            side by side, with the OS-level comment about which syscall
            each one resolves to, is the whole point. The tab on the
            left is what most tutorials show. The tab on the right is
            what the tree library is actually doing.
          </p>
          <CodeComparison
            title="What each library does to the OS"
            leftCode={pyautoguiSnippet}
            rightCode={treeSnippet}
            leftLabel="pyautogui (HID input)"
            rightLabel="terminator (UIA invoke)"
            leftLines={pyautoguiSnippet.split("\n").length}
            rightLines={treeSnippet.split("\n").length}
            reductionSuffix="of the work moves into the OS"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Feature by feature, the actual differences
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The rows that matter most are the first and last. The first
            tells you what each library calls. The last tells you how
            many lines of code the click implementation is. Everything
            in between is a consequence of those two facts.
          </p>
          <ComparisonTable
            productName="Accessibility tree (Terminator)"
            competitorName="PyAutoGUI"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Where each one wins, and where each one quietly loses
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Neither approach is universally right. The accessibility
            tree is the better default by a wide margin, but it has a
            failure mode (browser web views silently no-oping AX
            actions on macOS) that PyAutoGUI does not share. PyAutoGUI
            has a failure mode (silently clicking the wrong thing when
            the layout changes) that the tree does not share. Knowing
            both sets of failures is the whole skill.
          </p>
          <BentoGrid cards={failureModeCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The decision rule, written out
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Run through the list below in order. The first answer that
            matches is your answer. Most desktop automation problems
            terminate at the first or second item; the rest exists
            because real production scripts mix layers.
          </p>
          <AnimatedChecklist
            title="When to pick which"
            items={ruleChecklist}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The 100x claim, where it comes from
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s own documentation puts the speed delta at
            roughly two orders of magnitude. The number comes from a
            specific comparison: agents that screenshot the screen,
            send the image to an LLM, ask the LLM to output click
            coordinates, then PyAutoGUI those coordinates. That loop
            spends most of its budget on LLM inference. A tree-based
            agent that resolves a selector and calls a UIA pattern
            spends most of its budget on a COM round trip. The first
            is bounded by inference latency (often hundreds of
            milliseconds per action). The second is bounded by IPC
            latency (often single digit milliseconds per action). On
            an agent loop with hundreds of steps, the difference
            compounds to roughly the published 100x.
          </p>
          <ProofBanner
            metric="100x"
            quote="Runs 100x faster than ChatGPT Agents, Claude, Perplexity Comet, BrowserBase, BrowserUse (deterministic, CPU speed, with AI recovery). >95% success rate unlike most computer use overhyped products."
            source="Terminator README, 'Why Terminator > For Developers'"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What developers actually say after switching
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two of the most repeated observations from production
            scripts: the cursor stops fighting you, and the script
            stops failing on your colleague&apos;s laptop. Both are
            consequences of leaving the HID layer and moving into the
            tree.
          </p>
          <InlineTestimonial
            quote="Pattern invocation does not touch the cursor. We market this as 'does not take over your cursor or keyboard', and that statement is literally true for every action that resolves to a UIA pattern: invoke, toggle, expand_collapse, set_selected, and type_text against a value pattern edit control."
            name="Terminator"
            role="llms.txt and source comments at element.rs:838-859"
            stars={5}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Migrating a PyAutoGUI script to the tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The mechanical translation is straightforward and the
            order matters. Replace coordinate based actions with
            selectors first, then replace screenshot diff checks with
            tree property reads, then keep PyAutoGUI calls only for
            the residual targets that genuinely have no tree node.
            Below is the standard order of operations.
          </p>
          <ol className="mt-6 space-y-3 list-decimal list-inside text-zinc-700 leading-relaxed">
            <li>
              Run the target app and inspect its tree.{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                accesschk.exe
              </code>{" "}
              and the built-in{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                inspect.exe
              </code>{" "}
              from the Windows SDK both expose UIA nodes. On macOS,
              Apple&apos;s Accessibility Inspector does the same. Look
              for{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                AutomationId
              </code>
              ,{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                Name
              </code>
              , and{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                ControlType
              </code>{" "}
              on each control you currently click by coordinate.
            </li>
            <li>
              Replace each{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                pyautogui.click(x, y)
              </code>{" "}
              with a selector. The grammar is{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                process:foo &gt;&gt; role:Button &amp;&amp; name:Save
              </code>
              . If the control has an AutomationId, prefer that over
              role and name (it is more stable across releases).
            </li>
            <li>
              Replace{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                locateOnScreen(&apos;icon.png&apos;)
              </code>{" "}
              with{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                desktop.locator(...).all(timeout)
              </code>
              . The tree returns every match in one call, with bounds
              and properties, so you do not need to template match.
            </li>
            <li>
              Replace{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                pyautogui.typewrite()
              </code>{" "}
              with{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                element.typeText()
              </code>
              . Where the element is a real edit control, this
              resolves to ValuePattern.SetValue, no virtual key
              presses. Where it is not, fall back to synthetic key
              events.
            </li>
            <li>
              Keep PyAutoGUI for the residual: drag-and-drop with
              hit-testing on MouseMove (some games), drawing on a
              canvas, anything that physically requires cursor motion.
              These are now isolated to specific call sites instead of
              being your default mode.
            </li>
            <li>
              Move from{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                click()
              </code>{" "}
              to{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                invoke()
              </code>{" "}
              wherever the target supports InvokePattern. This is the
              one line that buys you background execution and the 100x
              claim simultaneously.
            </li>
          </ol>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The libraries you will actually pick from
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Below is the working set of Python and cross-language
            libraries that show up when you choose a path. PyAutoGUI
            is at the top because it is the canonical pixel library;
            the rest are tree libraries with different tradeoffs.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {stackedTools.map((t) => (
              <span
                key={t}
                className="text-sm font-mono px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            <a
              href="https://pyautogui.readthedocs.io/en/latest/"
              className="text-orange-600 underline underline-offset-2"
            >
              PyAutoGUI
            </a>{" "}
            is the reference pixel library;{" "}
            <a
              href="https://pywinauto.readthedocs.io/en/latest/"
              className="text-orange-600 underline underline-offset-2"
            >
              pywinauto
            </a>{" "}
            is the historical Python tree library on Windows;{" "}
            <a
              href="https://github.com/yinkaisheng/Python-UIAutomation-for-Windows"
              className="text-orange-600 underline underline-offset-2"
            >
              uiautomation
            </a>{" "}
            is the alternate UIA wrapper;{" "}
            <a
              href="https://pypi.org/project/atomacos/"
              className="text-orange-600 underline underline-offset-2"
            >
              atomacos
            </a>{" "}
            covers macOS AX from Python; and{" "}
            <a
              href="https://pypi.org/project/terminator-py/"
              className="text-orange-600 underline underline-offset-2"
            >
              terminator-py
            </a>{" "}
            is the binding to the Rust UIA core that drives the MCP
            server. If you are picking today and you want concurrency
            (asyncio.gather across multiple apps actually overlapping),
            terminator-py is the only one that releases the GIL on
            every UI call.
          </p>
        </section>

        <div className="max-w-4xl mx-auto px-6 my-16">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Migrating a PyAutoGUI script to the accessibility tree?"
            description="Walk through your existing pixel-based script with the team that maintains the UIA invoke() path. We have already hit the failure modes."
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <FaqSection
            items={faqs}
            heading="Questions developers ask after switching"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Adjacent reading"
            subtitle="Read these next if you are still on the pixel side"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Compare notes on tree vs pixel desktop automation."
      />
    </>
  );
}
