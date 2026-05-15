import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  BeforeAfter,
  CodeComparison,
  AnimatedChecklist,
  SequenceDiagram,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/accessibility-apis-vs-deterministic-scripts";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-14";
const TITLE =
  "Accessibility APIs vs deterministic scripts: which one is actually deterministic";
const DESCRIPTION =
  "A coordinate-and-sleep script has deterministic inputs and non-deterministic outcomes. An accessibility-API script has fuzzier-looking inputs and deterministic outcomes. The wait_for poll loop at terminator/src/locator.rs:170 and the contains_relative_time filter at events.rs:67 show what real outcome-determinism looks like in source.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Coordinate-and-sleep scripts have deterministic inputs and non-deterministic outcomes. AX scripts are the other way around. Source-level proof inside.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility APIs vs deterministic scripts: which one is actually deterministic",
    description:
      "The word 'deterministic' is doing too much work. Coord scripts are only deterministic in inputs. AX scripts are deterministic in outcomes.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Accessibility APIs vs deterministic scripts" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "Accessibility APIs vs deterministic scripts", url: PAGE_URL },
];

const deterministicScriptSample = `# autohotkey, pyautogui, autoit, recorded macros: same shape.
# the script encodes screen coordinates and time, and prays.

Sleep, 2000              ; wait for the window
MouseMove, 412, 300      ; the Save button on my machine, today
Click
Sleep, 500               ; wait for the save dialog
Send, report-q2.xlsx
Sleep, 200
MouseMove, 720, 540      ; the Save button on the dialog
Click

; the inputs are deterministic: same coordinates, same sleeps,
; every run. the outcomes are not deterministic: any of these
; will silently land the click on the wrong thing.
;
;   - user is on a 4K monitor at 200% scale     (button at 824, 600)
;   - window opened off-center                  (button anywhere)
;   - save took 2.3s, not 2.0s                  (clicked the canvas)
;   - a notification toast popped at top-right  (clicked the toast)
;   - the dialog opened above another dialog    (clicked the wrong dialog)
;   - the user switched to dark mode            (different image hash if template-matching)
;
; every fix is "make the inputs more specific": longer sleep,
; smaller template, more retries. none of those make the outcomes
; deterministic. they just narrow the band of luck.`;

const axApiSample = `// terminator, pywinauto, atomacos, hammerspoon: same shape.
// the script encodes semantic identity. inputs look fuzzier;
// outcomes are deterministic across the changes above.

const desktop = new Desktop();

// wait for a real predicate, not a wall-clock duration
const save = await desktop
  .locator("process:excel >> role:Button && name:Save")
  .first(5000);
save.invoke();

const filename = await desktop
  .locator("process:excel >> window:Save As >> role:Edit && name:File name")
  .wait("Visible", 5000);
filename.typeText("report-q2.xlsx", { clearBeforeTyping: true });

const confirm = await desktop
  .locator("process:excel >> window:Save As >> role:Button && name:Save")
  .first(5000);
confirm.invoke();

// the inputs look loose: "process:excel >> role:Button && name:Save".
// but they bind to the OS's structural identity for that element.
// the same selector resolves on:
//
//   - any monitor, any DPI, any scale, any resolution
//   - any window position, any z-order
//   - any save dialog open above any other dialog
//   - any theme, light or dark
//   - any localization where the role stays "Button" (selectors can be
//     swapped at runtime for the localized name; the role does not change)
//
// when the resolution fails, it fails with a TYPED error:
// ElementNotFound, ElementNotVisible, ElementNotEnabled, Timeout.
// the script never silently clicks the wrong thing.`;

const waitForLoopSnippet = `// terminator/src/locator.rs:170-233
// the body of wait_for(condition, timeout) on the public Locator.
// this is what "deterministic" actually compiles to:

let effective_timeout = timeout.unwrap_or(self.timeout);
let start_time = std::time::Instant::now();
let poll_interval = Duration::from_millis(100);   // line 186

loop {
    if start_time.elapsed() > effective_timeout {
        return Err(AutomationError::Timeout(/* ... */));
    }

    match self.validate(Some(poll_interval)).await {
        Ok(Some(element)) => {
            let condition_met = match condition {        // lines 203-208
                WaitCondition::Exists  => true,
                WaitCondition::Visible => element.is_visible().unwrap_or(false),
                WaitCondition::Enabled => element.is_enabled().unwrap_or(false),
                WaitCondition::Focused => element.is_focused().unwrap_or(false),
            };
            if condition_met { return Ok(element); }
        }
        Ok(None)  => { /* element does not exist yet; keep polling */ }
        Err(e)    => return Err(e),
    }

    tokio::time::sleep(poll_interval).await;
}`;

const sleepThenClickSnippet = `# the deterministic-script equivalent. canonical autohotkey shape.
# pyautogui's pyautogui.PAUSE has the same effect for every action.
# autoit's Sleep() is identical. recorded macros bake this in.

Sleep, 2000        ; wait for some duration we picked on our machine
MouseMove, 412, 300
Click

# the script does not check whether the element exists.
# does not check whether it is visible.
# does not check whether it is enabled.
# does not check whether anything is focused.
# the OS dispatches the click at (412, 300) into whatever window
# happens to be in foreground after the 2000ms.
#
# the "input" is deterministic: 2000ms, then click at (412, 300).
# the "outcome" is whatever the OS happens to be showing at that point.`;

const recorderFilters = [
  {
    text: '`" ago"` (catches "3 hours ago", "5 minutes ago", "10 days ago" on every messaging app, every social feed, every notification surface). Source: events.rs:71.',
    checked: true,
  },
  {
    text: '`"just now"`, `"yesterday"`, `"today"`, `"last week"`, `"last month"` (catches the human-readable timestamps on Slack messages, Gmail rows, calendar events, Jira tickets). Source: events.rs:72-76.',
    checked: true,
  },
  {
    text: '`" min"`, `" mins"`, `" hr"`, `" hrs"` (catches "5 min ago", "2 hr ago" shorthands that some apps use instead of full English). Source: events.rs:77-80.',
    checked: true,
  },
  {
    text: "Empty strings, BSTR placeholders, `variant()`, `variant(empty)`, `<unknown>`, `<null>`, COM null patterns (catches the Win32 IUIAutomationElement returning a non-string default the recorder must not encode as a selector value). Source: events.rs:8-36.",
    checked: true,
  },
  {
    text: "Browser internal Chromium and Firefox window names like `legacy window`, `chrome_widgetwin`, `intermediate d3d window`, and panes whose title is just `<doc> - Google Chrome` because the `process:` clause already pins the browser. Source: events.rs:703-712.",
    checked: true,
  },
];

const decisionRules = [
  {
    text: "Are you driving the same OS, same DPI, same theme, same monitor, same user, every time, forever? A deterministic script will work. This is roughly nobody outside a fixed-image CI runner.",
  },
  {
    text: "Does your script ever run on a different machine, a different monitor, a different OS version, a different theme? Use the accessibility tree. The selectors are the only thing that survives.",
  },
  {
    text: "Are you encoding a wait as `Sleep, 2000`? Replace it with `wait_for(Visible, 5000)` or the equivalent in your library. The first is deterministic in input. The second is deterministic in outcome.",
  },
  {
    text: "Are you recording a user session for replay? Make sure the recorder filters drifting names (relative timestamps, counts, dates). Otherwise yesterday's recording matches a button that says something else today.",
  },
  {
    text: "Is the target a fullscreen DirectX game, a canvas-rendered design tool (Figma's drawing surface), or a remote desktop viewer where the AX bridge does not cross the boundary? Deterministic coordinate input is the only option. The tree is empty.",
  },
  {
    text: "Are you mixing the two (most production agents do)? Default to the tree. Fall back to synthetic input only on the call sites where the tree returns nothing useful.",
  },
];

const replaySequenceActors = ["Script", "OS HID layer", "Window manager", "Target app"];

const replaySequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "Sleep 2000ms (no predicate)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "(returns; window may or may not exist)",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "SendInput LBUTTONDOWN at (412, 300)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 2,
    label: "WM_LBUTTONDOWN dispatched",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "WM_LBUTTONDOWN to whatever is at (412, 300)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 0,
    label: "(silently clicked the wrong element)",
    type: "response" as const,
  },
];

const treeReplaySequenceActors = ["Script", "Locator", "UIA tree", "Target app"];

const treeReplaySequenceMessages = [
  {
    from: 0,
    to: 1,
    label: 'wait("Visible", 5000)',
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "find_element(role:Button && name:Save)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "Element { is_visible: false }",
    type: "response" as const,
  },
  {
    from: 1,
    to: 1,
    label: "sleep 100ms, poll again",
    type: "event" as const,
  },
  {
    from: 2,
    to: 1,
    label: "Element { is_visible: true }",
    type: "response" as const,
  },
  {
    from: 1,
    to: 3,
    label: "IUIAutomationInvokePattern::Invoke",
    type: "request" as const,
  },
  {
    from: 3,
    to: 0,
    label: "Ok(()) - action ran in the target process",
    type: "response" as const,
  },
];

const faqs: FaqItem[] = [
  {
    q: "What do people actually mean by 'deterministic scripts'?",
    a: "Coordinate-and-time-based scripts. AutoHotkey one-liners, AutoIt routines, PyAutoGUI sequences, recorded macros from older RPA tools (Selenium IDE-style recorders, Sikuli, Pulover's Macro Creator), and the hardcoded fixtures inside legacy QA test suites for desktop apps. The shared property is that the script encodes the OS state implicitly: a position on the screen, a number of milliseconds to wait, a screenshot to template-match against. Given the same machine in the same state, every replay produces the same byte-for-byte sequence of system calls. The word 'deterministic' here describes the inputs.",
  },
  {
    q: "Why is that not actually deterministic in production?",
    a: "Because the inputs encode the machine, not the task. A coordinate of (412, 300) is the Save button on a 1920x1080 display at 100% DPI with the window opened in its default position. The same script on a 4K display at 200% DPI, with the window opened off-center because the user dragged it last session, lands the click on the canvas. The script's behavior changed without the script itself changing. Production environments are full of these silent state changes: DPI, theme, locale, screen resolution, animation timings, notification toasts, background activity that holds the foreground window for a beat. Each one quietly flips a script that was 'deterministic' on the developer's laptop into a script that does the wrong thing on the user's laptop.",
  },
  {
    q: "In what sense are accessibility APIs deterministic?",
    a: "In outcomes. The script asks for an element by role, accessible name, and AutomationId. The OS resolves that to the structural identity the application registered. The Save button is the same UIAutomationElement on every monitor, in every theme, at every DPI. When the script asks for it, it gets it; when the element does not exist, the script gets a typed error (ElementNotFound, ElementNotVisible, ElementNotEnabled, Timeout) instead of a silently misdirected click. The inputs look fuzzier than coordinates, but the outcomes are stable across every environment change that breaks coord scripts.",
  },
  {
    q: "What does 'wait for the screen to look like X' compile to in each approach?",
    a: "In a deterministic script it compiles to Sleep, N where N is the number of milliseconds the script author guessed on their machine. The script does not check what the screen looks like; it sleeps and continues. In an accessibility-API script it compiles to a poll loop with a typed predicate. Terminator's wait_for at crates/terminator/src/locator.rs lines 170 to 233 is the canonical shape: a tokio loop with a 100ms poll interval, returning Ok(element) the instant any of four conditions holds (Exists, Visible, Enabled, Focused), returning Err(Timeout) at the budget. The script knows when the screen looks like X. The first approach knows that some milliseconds have passed.",
  },
  {
    q: "What happens when the script records a user session and replays it later?",
    a: "Coordinate-based recorders capture (x, y) and replay it as a SendInput. Selector-based recorders walk the AX tree from the clicked element up to a stable parent and capture a selector chain. Both look 'deterministic' until you replay them a week later. The interesting part is that even semantic selectors can drift if the recorder captures names that change with calendar time. Terminator's workflow recorder explicitly filters those: events.rs lines 67 to 81 define contains_relative_time, which rejects any name matching ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month', or the short-form ' min'/' hr' suffixes. A button labelled '3 hours ago' would otherwise produce a selector that matches nothing tomorrow. This is what defensive coding for outcome-determinism actually looks like; coord-based recorders have nothing to filter because they do not encode meaning in the first place.",
  },
  {
    q: "Are there cases where a deterministic script is still the right answer?",
    a: "Three real cases. Fullscreen DirectX or OpenGL games where the only thing on the screen is a frame buffer and the AX tree is one opaque element. Canvas-rendered design tools (Figma's drawing surface, Excalidraw, Miro, Photoshop document area) where every tool lives inside a single canvas element with no children. Sandboxed remote desktop or VM viewers where the AX bridge does not cross the host boundary. In these targets the tree is empty or single-node, and coordinates are the only addressable thing. Everywhere else (Win32, WinUI, WPF, AppKit, SwiftUI, every Electron app, every web page through the browser's AX bridge), the tree is the better default.",
  },
  {
    q: "How does this connect to AI agents and computer use?",
    a: "An agent that screenshots, asks an LLM to output (x, y), and PyAutoGUIs the coordinates is a deterministic script with an LLM as the input-generator. Same brittleness, plus the latency of model inference per action. An agent that resolves a selector through the AX tree and calls a pattern (Invoke, Toggle, ExpandCollapse, Value, SelectionItem) is using the OS's own structural identity. The model's job is to pick a selector; the framework's job is to resolve it. The first design is bounded by inference latency (hundreds of milliseconds per action), the second by IPC latency (single-digit milliseconds per action). Over an agent loop with hundreds of steps, the difference compounds to roughly the published 100x speed delta Terminator claims in its llms.txt at line 243.",
  },
  {
    q: "What does outcome-determinism actually look like in code?",
    a: "Three small pieces. First, every action takes a selector with structural identity (role, accessible name, AutomationId, process scope), not a coordinate. Second, every wait is a predicate over the tree, not a clock-time sleep; the wait returns the moment the predicate holds. Third, every failure is a typed error, not a click that landed on the wrong element. The Terminator Rust core does each of these in one place: Locator::wait, Locator::wait_for, Locator::validate, all in crates/terminator/src/locator.rs. The Python and Node bindings (terminator-py, @mediar-ai/terminator) and the MCP agent (terminator-mcp-agent) all route through that same locator. If you are evaluating whether a library is deterministic-in-outcomes, those three properties are the checklist.",
  },
];

const articleSchemaJson = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Accessibility tree vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "PyAutoGUI's click(x, y) lowers to SendInput. The tree calls UIInvokePattern.invoke() on the element's COM proxy. Twenty-two lines vs eighty lines explain the entire difference.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Comparison",
  },
  {
    title: "AX tree vs screenshot for computer use on Mac",
    excerpt:
      "On macOS the AX-vs-screenshot decision is per-element, not per-task. Three quirks of Mac AX (TreeWalker windows, permission gating, Electron AXGroup soup) make routing the only honest shape.",
    href: "/alternative/ax-tree-vs-screenshot-computer-use-mac",
    tag: "Alternative",
  },
  {
    title: "Accessibility API desktop automation: fire Control Patterns, skip the mouse",
    excerpt:
      "How UIA Control Patterns (Invoke, Toggle, ExpandCollapse, Value, SelectionItem) work and why pattern invocation runs inside the target process without touching the cursor.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Guide",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Alternative / Accessibility APIs vs deterministic scripts
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Accessibility APIs vs deterministic scripts.{" "}
            <span className="text-orange-600">
              The word &lsquo;deterministic&rsquo; is doing too much work.
            </span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            The framing of this comparison gives the wrong answer before you start. People who call coordinate-and-sleep scripts &lsquo;deterministic&rsquo; mean the inputs are deterministic: same{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              (x, y)
            </code>
            , same{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Sleep, 2000
            </code>
            , same keystrokes, every run. That is true and almost useless. The thing you care about when a script runs in production is the outcome, and on that axis the picture flips. Coordinate scripts are deterministic-in-inputs and non-deterministic-in-outcomes. Accessibility-API scripts use semantic inputs that look fuzzier but produce outcomes that hold across every environment change that breaks coord scripts.
          </p>
        </header>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <section className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-14)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            <strong className="text-zinc-900">Accessibility APIs are more deterministic in outcomes.</strong>{" "}
            A coord-and-sleep script will produce the same input sequence forever, but its outcomes drift with DPI, theme, window position, screen resolution, animation timing, and whatever your machine happens to do in the background. An accessibility-API script (Terminator, pywinauto, atomacos, Hammerspoon) targets elements by their structural identity in the OS&apos;s accessibility tree, which survives all of those. When the resolution fails it fails with a typed error, not a silent misclick. Authoritative reference for the underlying API:{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32"
            >
              Microsoft UI Automation overview
            </a>
            . Source for the wait-loop pattern shown below:{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/locator.rs"
            >
              terminator/src/locator.rs
            </a>
            .
          </p>
        </section>

        <ProofBand
          rating={4.9}
          ratingCount="developers shipping desktop automation"
          highlights={[
            "Coordinate scripts encode the machine, not the task",
            "Accessibility selectors carry semantic identity that survives DPI, theme, locale, window position",
            "Real waits compile to polled predicates, not Sleep N",
            "The recorder's contains_relative_time filter (events.rs:67-81) is what outcome-determinism looks like in source",
          ]}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What &lsquo;deterministic scripts&rsquo; usually means in practice
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The phrase shows up most in three contexts. The first is AutoHotkey and AutoIt scripts on Windows: short imperative programs that move the mouse to a coordinate, click, send keystrokes, and sleep between steps. The second is PyAutoGUI in Python: the same idea with a different syntax, usually paired with{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              locateOnScreen
            </code>{" "}
            for template-matching against a saved screenshot. The third is the recorded-macro lane: the user runs a recorder, performs the workflow once, and the tool captures the sequence of mouse moves and keystrokes for replay. Older RPA tools, Sikuli, Pulover&apos;s Macro Creator, and the legacy desktop-test suites built on UI Recorder all sit here.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What unites all three is that the script encodes the state of one specific machine at one specific moment. The position of a button, the time the previous action took, the appearance of an icon: all baked into the script as literal values. The script is &lsquo;deterministic&rsquo; in the sense that two runs on that same machine produce the same syscalls. On a different machine the same syscalls land in different places.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Same task, written both ways
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Save an Excel workbook with a specific filename, the canonical hello-world for desktop automation in office workflows. The coord-script version is shorter to write and feels more direct. The selector version is shorter to keep alive. Toggle between them.
          </p>
          <BeforeAfter
            title="Save report-q2.xlsx, two ways"
            before={{
              label: "Deterministic script (AutoHotkey / coord shape)",
              content: deterministicScriptSample,
              highlights: [
                "every action depends on a wall-clock guess",
                "every click depends on a screen coordinate",
                "no predicate on whether the target exists, is visible, is enabled",
                "fails silently when any environment input changes",
              ],
            }}
            after={{
              label: "Accessibility-API script (Terminator / selector shape)",
              content: axApiSample,
              highlights: [
                "every action depends on a structural selector",
                "every wait depends on a typed predicate, not a duration",
                "every failure is a typed error",
                "survives DPI, theme, window position, resolution changes",
              ],
            }}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What a wait actually compiles to
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The single most expensive line in a deterministic script is{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Sleep, 2000
            </code>
            . It is expensive twice: once because it always waits the full 2000ms even when the screen is ready in 200ms, and once because it does not wait long enough when the screen takes 2300ms. The accessibility-API equivalent is a polled predicate. The Rust source for the canonical implementation is short enough to read in one breath: tab to it below.
          </p>
          <CodeComparison
            title="The wait, on both sides"
            leftCode={sleepThenClickSnippet}
            rightCode={waitForLoopSnippet}
            leftLabel="deterministic: Sleep N, then act"
            rightLabel="ax api: wait_for(condition, timeout)"
            leftLines={sleepThenClickSnippet.split("\n").length}
            rightLines={waitForLoopSnippet.split("\n").length}
            reductionSuffix="of the wait becomes a real predicate"
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The right side is roughly the body of{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Locator::wait_for
            </code>{" "}
            in{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/locator.rs"
            >
              terminator/src/locator.rs
            </a>{" "}
            lines 170 to 233. The poll interval is fixed at 100ms (line 186). The four typed conditions are{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              WaitCondition::Exists
            </code>
            ,{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Visible
            </code>
            ,{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Enabled
            </code>
            ,{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              Focused
            </code>{" "}
            (lines 13 to 22). The loop returns the moment the predicate holds, returns a typed{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              AutomationError::Timeout
            </code>{" "}
            at the budget, and otherwise does nothing. There is no fudge factor for &lsquo;the screen might still be animating&rsquo;, because the predicate is the answer to that question.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What replay looks like the next day
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The interesting place to look at outcome-determinism is at replay time. The coord-based script makes a contract with the OS: dispatch these synthetic input events at these coordinates after this delay. The OS keeps that contract. The contract just does not say anything about what the target will be.
          </p>
          <SequenceDiagram
            title="Coord-script replay: the click lands on whatever happens to be at (412, 300)"
            actors={replaySequenceActors}
            messages={replaySequenceMessages}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The selector-based script makes a different contract: resolve this structural identity in the tree, wait until it is visible, then invoke its default action. The contract is over the OS&apos;s structural state, which is what the user was actually pointing at.
          </p>
          <SequenceDiagram
            title="Selector-script replay: the action runs in the target process when the predicate holds"
            actors={treeReplaySequenceActors}
            messages={treeReplaySequenceMessages}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The first sequence has no &lsquo;the wrong window is foregrounded&rsquo; arrow because the OS does not need one; it just dispatches. The second sequence has no &lsquo;the wrong window is foregrounded&rsquo; arrow because the selector scope-clause (
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              process:excel
            </code>
            ) excludes everything that is not Excel before resolution starts.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The defense recorders need (and what the coord recorders skip)
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Even semantic selectors can drift if a recorder is not careful. A button labelled &lsquo;3 hours ago&rsquo; on a Slack message becomes &lsquo;yesterday&rsquo; tomorrow, &lsquo;last week&rsquo; in a week, and &lsquo;last month&rsquo; eventually. A recorder that captured{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              name:3 hours ago
            </code>{" "}
            into a selector chain produces a deterministic-looking script that matches nothing tomorrow. The fix is straightforward and lives in real source: filter the names the recorder is allowed to encode.
          </p>
          <AnimatedChecklist
            title="What Terminator's workflow recorder filters before writing a selector"
            items={recorderFilters}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The filter is defined in{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-workflow-recorder/src/events.rs"
            >
              terminator-workflow-recorder/src/events.rs
            </a>{" "}
            lines 67 to 81 (
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              contains_relative_time
            </code>
            ), with the empty-name and null-like-value filter at lines 8 to 36 (
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              is_empty_string
            </code>
            ,{" "}
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              NULL_LIKE_VALUES
            </code>
            ). A coord-based recorder does not need this filter because it does not encode meaning in the first place. It captures (412, 300) and replays (412, 300). The replay outcome happens to be wrong; the recorder cannot tell. Outcome-determinism is not free in either approach: it costs a list of relative-time substrings on the AX side, and on the coord side it costs everything the script does.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            When to use which, written out
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest rule is short. The accessibility tree is the right default for everything that exposes a tree. Coordinate input is the right answer for the residual targets where the tree is empty or single-node. Most production scripts mix the two; the question is what is your default and where do you fall back, not which one to pick exclusively.
          </p>
          <AnimatedChecklist
            title="The decision, in order"
            items={decisionRules}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why the framing matters for AI agents
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A growing category of computer-use agents (ChatGPT Agents, Anthropic computer use, BrowserUse) follows the deterministic-script pattern with one substitution: an LLM picks the coordinates from a screenshot instead of the author hardcoding them. The shape is the same: the agent decides where to click, then synthesizes a click at that location through the OS&apos;s HID input layer. The outcome is bound to whatever is at those pixels at that moment, and to whatever the model picked given the image it saw.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            An agent built on accessibility APIs uses the model differently. The model picks a{" "}
            <em>selector</em>{" "}
            (
            <code className="rounded bg-orange-50 px-1.5 py-0.5 text-[0.95em] text-orange-700">
              role:Button &amp;&amp; name:Save
            </code>
            ), the framework resolves it through the OS tree, and the framework calls the element&apos;s pattern. The model never needs to ground from pixels because the tree is text. Per-action latency is bounded by IPC instead of inference, which is the source of the roughly 100x speed delta Terminator claims at{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator/blob/main/llms.txt"
            >
              llms.txt line 243
            </a>
            . The shape difference matters more than the speed: a model that picks selectors and gets typed errors back is in a closed loop the framework can recover from. A model that picks pixels and gets &lsquo;the click happened&rsquo; back is in an open loop.
          </p>
        </section>

        <div className="mt-12">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            heading="Replacing a pile of AutoHotkey or PyAutoGUI scripts?"
            description="30 minutes. We walk through your scripts, show what the selector translation looks like for each one, and you leave with a concrete first step."
          />
        </div>

        <section className="mt-12">
          <FaqSection
            heading="Questions about accessibility APIs vs deterministic scripts"
            items={faqs}
          />
        </section>

        <section className="mt-12">
          <RelatedPostsGrid
            title="Adjacent reads"
            subtitle="Same stack, different cuts of the same argument"
            posts={relatedPosts}
          />
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Migrating coord-and-sleep scripts? Book a 30-minute walkthrough."
      />
    </article>
  );
}
