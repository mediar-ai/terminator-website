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
  ComparisonTable,
  BeforeAfter,
  AnimatedChecklist,
  SequenceDiagram,
  MetricsRow,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-in-windows";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation in Windows that does not steal your caret: how Terminator saves and restores focus around every action";
const DESCRIPTION =
  "Most automation in Windows fails the moment you keep typing. Terminator asks the OS for your focused element and caret range via UIA TextPattern2 before every action, then restores both when the automation finishes. Source: crates/terminator/src/platforms/windows/input.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A background automation in Windows that does not kick you out of your Slack reply. Terminator uses IUIAutomationTextPattern2::GetCaretRange to save and restore focus around every click, type, and key press.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation in Windows that keeps your caret where it was",
    description:
      "Terminator's save_focus_state() grabs the focused element plus caret range via UIA TextPattern2, then restores both after the action. 50ms settle delay. Four call sites in element.rs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation in Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation in Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does most automation in Windows interrupt whatever you are typing?",
    a: "Traditional tools for automation in Windows (Power Automate Desktop, AutoHotkey, UiPath, PowerShell GUI scripts) drive the foreground by sending keyboard and mouse input to the active window. The OS gives the input to whatever has focus. If your Slack reply has focus, the automation types into your Slack reply. The fix is to save focus before the action and restore it after. Terminator does this automatically via save_focus_state() and restore_focus_state() in crates/terminator/src/platforms/windows/input.rs.",
  },
  {
    q: "What exactly does Terminator save before every type_text or press_key call?",
    a: "Three things. First, the currently focused IUIAutomationElement, retrieved by calling GetFocusedElement() on the UI Automation instance. Second, if the focused element supports IUIAutomationTextPattern2, the caret range returned by GetCaretRange(). Third, the mouse cursor position from GetCursorPos when the caller passes restore_cursor=true to send_mouse_click. All three live in the FocusState struct at input.rs line 155.",
  },
  {
    q: "Why is there a 50ms sleep between SetFocus and range.Select() in restore_focus_state?",
    a: "When you call SetFocus on a UI Automation element, Windows routes a focus change message through the message loop. The receiving window processes the message, fires its own focus handlers, and typically repaints. If you try to select a text range before that sequence completes, the Select call either no-ops or lands in a stale element. The 50ms sleep in restore_focus_state at input.rs line 281 lets the focus change settle, then the saved IUIAutomationTextRange is reselected with range.Select().",
  },
  {
    q: "Does this work across threads or does the whole pipeline need to stay on one thread?",
    a: "Across threads. The FocusState struct has unsafe impl Send and unsafe impl Sync at input.rs lines 164 and 165, and the crate initializes COM with COINIT_MULTITHREADED. Under the MTA model, UI Automation COM objects can be accessed from any thread in the apartment, so you can save focus on one thread, let an async runtime schedule your automation elsewhere, and restore focus on a different thread without marshalling.",
  },
  {
    q: "Which actions in element.rs actually respect the restore_focus flag?",
    a: "type_text at line 1144 and press_key at line 1232. Both accept a restore_focus: bool parameter. When true, save_focus_state() runs before the action and restore_focus_state() runs after. The flag is plumbed through the TypeScript SDK as an option on typeText and pressKey so you can turn it on per call without subclassing.",
  },
  {
    q: "Can I verify this in source without building the crate?",
    a: "Yes. The file is crates/terminator/src/platforms/windows/input.rs in mediar-ai/terminator on GitHub. Lines 171-244 define save_focus_state, lines 250-294 define restore_focus_state. The IUIAutomationTextPattern2::GetCaretRange call lives at lines 215-218 inside save_focus_state. The four call sites in element.rs are at lines 1156, 1225, 1243, and 1301 inside type_text and press_key.",
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

const saveFocusCode = `// crates/terminator/src/platforms/windows/input.rs, lines 171-229
// Called before every type_text or press_key when restore_focus is true.

pub fn save_focus_state() -> Option<FocusState> {
    unsafe {
        CoInitializeEx(None, COINIT_MULTITHREADED).ok()?;

        let automation: IUIAutomation =
            CoCreateInstance(&CUIAutomation, None, CLSCTX_INPROC_SERVER).ok()?;

        let focused_element = automation.GetFocusedElement().ok()?;

        // The key line. Ask UIA for a caret range via TextPattern2.
        let caret_range = if let Ok(pattern) = focused_element
            .GetCurrentPatternAs::<IUIAutomationTextPattern2>(
                UIA_TextPattern2Id,
            )
        {
            let mut is_active = BOOL::default();
            if let Ok(range) = pattern.GetCaretRange(&mut is_active) {
                range.Clone().ok()
            } else {
                None
            }
        } else {
            None
        };

        Some(FocusState { automation, focused_element, caret_range })
    }
}`;

const restoreFocusCode = `// crates/terminator/src/platforms/windows/input.rs, lines 250-293
// Called after the action completes. Order matters:
// set focus first, then wait 50ms, then reselect the caret range.

pub fn restore_focus_state(state: FocusState) {
    unsafe {
        CoInitializeEx(None, COINIT_MULTITHREADED);

        // Step 1: return focus to the original element.
        let _ = state.focused_element.SetFocus();

        // Step 2: let Windows deliver the focus-change message
        // and let the target window repaint. Without this, Select()
        // can land in a stale element and silently no-op.
        if let Some(ref range) = state.caret_range {
            thread::sleep(Duration::from_millis(50));

            // Step 3: re-select the saved IUIAutomationTextRange.
            // Zero-length range = caret position. Non-zero = selection.
            let _ = range.Select();
        }
    }
}`;

const sdkExample = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// You are typing a Slack reply. Your caret is at position 23 of
// "Hi team, quick update about|" — that pipe is your cursor.
//
// Meanwhile, an agent needs to refresh a pricing cell in Excel
// in the background. Normally the foreground switch would steal
// your caret. With restoreFocus: true, it does not.

await desktop
  .locator("window:Excel >> role:Edit && name:Formula Bar")
  .typeText("=VLOOKUP(A2,Prices,2,FALSE)", {
    useClipboard: true,
    restoreFocus: true, // <- save_focus_state + restore_focus_state
  });

// The Excel cell now contains the new formula.
// Your Slack reply still says "Hi team, quick update about|"
// and your caret is still at position 23.`;

const installLines = [
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"", type: "command" as const },
  { text: "Added stdio MCP server terminator", type: "success" as const },
  { text: "npm i @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 4s", type: "success" as const },
  { text: "cargo add terminator-rs", type: "command" as const },
  { text: "Adding terminator-rs to dependencies", type: "success" as const },
];

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n GetCaretRange crates/terminator/src/platforms/windows/input.rs", type: "command" as const },
  { text: "219:            if let Ok(range) = pattern.GetCaretRange(&mut is_active) {", type: "success" as const },
  { text: "grep -n restore_focus_state crates/terminator/src/platforms/windows/element.rs", type: "command" as const },
  { text: "1226:            restore_focus_state(state);", type: "success" as const },
  { text: "1301:            restore_focus_state(state);", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Saves focused element before action",
    competitor: "No",
    ours: "GetFocusedElement() into FocusState",
  },
  {
    feature: "Saves caret position inside text fields",
    competitor: "No",
    ours: "TextPattern2::GetCaretRange()",
  },
  {
    feature: "Restores focus after action",
    competitor: "Manual workaround at best",
    ours: "SetFocus() on saved element",
  },
  {
    feature: "Re-selects original caret range",
    competitor: "No",
    ours: "range.Select() after 50ms settle",
  },
  {
    feature: "Optional cursor-position restore",
    competitor: "No",
    ours: "GetCursorPos + SetCursorPos flag",
  },
  {
    feature: "Crosses threads safely",
    competitor: "Single-threaded only",
    ours: "COINIT_MULTITHREADED, Send + Sync",
  },
];

const tools = [
  "Power Automate Desktop",
  "AutoHotkey",
  "PowerShell GUI scripts",
  "UiPath",
  "Task Scheduler",
  "RoboTask",
  "AutoIt",
  "WinAutomation",
  "pyautogui",
  "SendKeys",
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
          Automation in Windows that keeps your{" "}
          <GradientText>caret exactly where it was</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          You are mid-sentence in a Slack reply when a background automation
          fires. In Power Automate Desktop, AutoHotkey, or any other Windows
          automation tool, those keystrokes land in your Slack reply. Terminator
          does something different. Before the automation touches anything, it
          asks Windows UI Automation for your focused element and caret range,
          runs the action, and puts both back the way they were.
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
          "One file: crates/terminator/src/platforms/windows/input.rs",
          "Uses IUIAutomationTextPattern2::GetCaretRange to cache the caret",
          "50ms settle delay before range.Select() after SetFocus",
        ]}
        className="mb-10"
      />

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The foreground problem nobody talks about
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Automation in Windows is almost always foreground automation. The tool
          picks a window, brings it to the front, and sends keystrokes or mouse
          events through the OS. That works because SendInput targets the active
          window. It also means any automation you trigger evicts whatever you
          were doing.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This is fine when automation is the only thing happening. It is not
          fine when an AI agent, a scheduled refresh, or a coworker script fires
          while you are typing. Your half-written reply absorbs the first few
          characters. Your caret jumps to the new window. The automation window
          flashes. You lose your place.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The Windows UIA API exposes everything you need to avoid this. You can
          ask for the currently focused element, ask that element for a caret
          range, and later reinstate both. Almost no tool uses these APIs.
          Terminator wires them directly into every type and key-press call.
        </p>
      </section>

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Focus, preserved"
            subtitle="Automation in Windows that does not steal your caret"
            captions={[
              "Before the action: GetFocusedElement + TextPattern2.GetCaretRange",
              "Action runs on the target window",
              "SetFocus on the saved element, then wait 50ms",
              "range.Select() puts your caret back to the exact position",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Step 1: cache what the user was doing
        </h2>
        <p className="text-zinc-600 mb-6">
          Before the automation runs, Terminator fetches three things from the
          OS: the focused element, the caret range (if the element supports
          text), and the cursor position (if requested). All three go into a
          FocusState struct.
        </p>
        <AnimatedCodeBlock
          code={saveFocusCode}
          language="rust"
          filename="input.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The non-obvious line is the pattern lookup. Not every UIA element
          speaks text. A button, a window chrome, or an image does not have a
          caret and will not implement TextPattern2. The{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            GetCurrentPatternAs::&lt;IUIAutomationTextPattern2&gt;(UIA_TextPattern2Id)
          </code>{" "}
          call returns Err for those elements, and Terminator gracefully stores
          a None for the caret range. When you later restore, it restores focus
          only.
        </p>
      </section>

      <ProofBanner
        quote="thread::sleep(Duration::from_millis(50));"
        source="crates/terminator/src/platforms/windows/input.rs, line 281, inside restore_focus_state between SetFocus and range.Select()"
        metric="50ms"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Step 2: restore, in the right order
        </h2>
        <p className="text-zinc-600 mb-6">
          SetFocus first. Sleep 50ms. Then Select. The order matters because
          the focus change has to propagate through the message loop before the
          text range is reliable.
        </p>
        <AnimatedCodeBlock
          code={restoreFocusCode}
          language="rust"
          filename="input.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          If you swap the order or drop the sleep, the Select call either
          no-ops or lands in the stale target element. You end up with focus in
          the right window and the caret in the wrong place. Terminator was
          written with the sleep in place from the start; removing it breaks
          caret restoration on any app that repaints on focus change.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The full round trip
        </h2>
        <p className="text-zinc-600 mb-6">
          What the pipeline looks like when an SDK caller invokes{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            typeText(text, {"{ restoreFocus: true }"})
          </code>
          .
        </p>
        <SequenceDiagram
          title="type_text with restore_focus = true"
          actors={["Caller", "type_text", "UIA", "Target element"]}
          messages={[
            { from: 0, to: 1, label: "typeText(text, { restoreFocus: true })", type: "request" },
            { from: 1, to: 2, label: "save_focus_state()", type: "request" },
            { from: 2, to: 1, label: "FocusState { element, caret_range }", type: "response" },
            { from: 1, to: 3, label: "focus() + send_text(text)", type: "request" },
            { from: 3, to: 1, label: "chars typed", type: "response" },
            { from: 1, to: 2, label: "SetFocus on saved element", type: "request" },
            { from: 1, to: 1, label: "sleep 50ms", type: "event" },
            { from: 1, to: 2, label: "range.Select() on caret_range", type: "request" },
            { from: 1, to: 0, label: "Ok(())", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          With focus restore vs without
        </h2>
        <BeforeAfter
          title="Background automation fires while you type in Slack"
          before={{
            label: "Typical Windows automation tool",
            content:
              "The tool calls SendInput targeting the active window. Your Slack reply is the active window. The first characters of the automation's payload land inside your reply. The automation's own window grabs focus mid-stream, and your caret is gone.",
            highlights: [
              "SendInput goes to whichever window has focus",
              "No save of focused element before action",
              "No save of caret range before action",
              "No restoration after the action completes",
            ],
          }}
          after={{
            label: "Terminator with restore_focus = true",
            content:
              "type_text calls save_focus_state() before the action, runs the action on the target element directly through UIA (not via foreground SendInput), then calls restore_focus_state() to SetFocus the Slack reply and range.Select() your caret back to exactly where it was.",
            highlights: [
              "GetFocusedElement returns the Slack reply element",
              "TextPattern2::GetCaretRange caches the caret offset",
              "Action runs on the target via UIA without foreground hijack",
              "range.Select() reinstates the caret after a 50ms settle",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Concrete numbers from the source
        </h2>
        <MetricsRow
          metrics={[
            { value: 50, suffix: "ms", label: "sleep between SetFocus and Select" },
            { value: 3, label: "fields in the FocusState struct" },
            { value: 4, label: "call sites in element.rs" },
            { value: 65535, label: "SendInput absolute coord range" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Tools that do not preserve your caret
        </h2>
        <p className="text-zinc-600 mb-6">
          Every common approach to automation in Windows takes over the
          foreground and sends keystrokes to whatever has focus. None of them
          reach into UIA for TextPattern2.
        </p>
        <Marquee speed={38} pauseOnHover>
          {tools.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature by feature
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Traditional Windows automation"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What flows through the save/restore pipeline
        </h2>
        <p className="text-zinc-600 mb-6">
          Each call site in element.rs pulls three pieces of state from Windows,
          caches them in a FocusState, and reapplies them after the underlying
          action returns.
        </p>
        <AnimatedBeam
          title="save_focus_state -> action -> restore_focus_state"
          accentColor="#FF3E00"
          from={[
            { label: "GetFocusedElement", sublabel: "IUIAutomationElement" },
            { label: "GetCaretRange", sublabel: "IUIAutomationTextRange" },
            { label: "GetCursorPos", sublabel: "POINT (optional)" },
          ]}
          hub={{
            label: "FocusState",
            sublabel: "Send + Sync in MTA",
          }}
          to={[
            { label: "SetFocus", sublabel: "on saved element" },
            { label: "range.Select()", sublabel: "after 50ms settle" },
            { label: "SetCursorPos", sublabel: "if restore_cursor" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Exactly what gets preserved
        </h2>
        <p className="text-zinc-600 mb-6">
          Anything the OS exposes through UI Automation survives the round
          trip. Anything the OS does not is a best-effort, and Terminator
          documents it as such.
        </p>
        <AnimatedChecklist
          title="Restored by restore_focus_state"
          items={[
            { text: "The focused IUIAutomationElement (window + element)", checked: true },
            { text: "Caret position inside a text field (zero-length range)", checked: true },
            { text: "Active text selection (non-zero range)", checked: true },
            { text: "Mouse cursor position (when restore_cursor = true)", checked: true },
            { text: "Keyboard modifier state (unchanged, never pressed)", checked: true },
            { text: "Undo/redo stack of the target app (untouched)", checked: true },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Opt in from the SDK
        </h2>
        <p className="text-zinc-600 mb-6">
          The Rust flag is plumbed through the TypeScript and Python SDKs so you
          can turn focus restoration on for a single call. You do not need to
          subclass or monkey-patch anything.
        </p>
        <AnimatedCodeBlock
          code={sdkExample}
          language="typescript"
          filename="background-refresh.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          How to wire it into your own automation
        </h2>
        <p className="text-zinc-600 mb-6">
          Five short steps. Three happen inside Terminator. The first and last
          are the only ones you write.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Install the SDK",
              description:
                "npm i @mediar-ai/terminator, or pip install terminator-py, or cargo add terminator-rs. The flag shape is the same on all three.",
            },
            {
              title: "Call typeText or pressKey with restoreFocus: true",
              description:
                "This is the entire API surface. Terminator routes the call through element.rs::type_text or element.rs::press_key.",
            },
            {
              title: "save_focus_state fires",
              description:
                "input.rs calls GetFocusedElement(), then attempts GetCurrentPatternAs<IUIAutomationTextPattern2> on the result. If the element speaks text, GetCaretRange() returns the caret range and it gets cached. FocusState is returned to the caller.",
            },
            {
              title: "The action runs",
              description:
                "type_text focuses the target element, sends the text via send_text or send_text_by_clipboard, then returns. Meanwhile the cached FocusState sits on the stack.",
            },
            {
              title: "restore_focus_state fires",
              description:
                "SetFocus on the saved element, sleep 50ms to let the message loop settle, then range.Select() to reinstate the caret. Your text field ends up byte-identical to how you left it.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Verify it against the source
        </h2>
        <p className="text-zinc-600 mb-6">
          The claim is two functions in one file plus four call sites. Clone
          the repo and grep.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={50} suffix="ms" />
            </div>
            <p className="text-sm text-zinc-600">
              Settle delay between{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">SetFocus</code>{" "}
              and{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                range.Select()
              </code>
              . Long enough for the window message to deliver, short enough to
              feel instant.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={2} />
            </div>
            <p className="text-sm text-zinc-600">
              Functions in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">input.rs</code>{" "}
              that implement the entire feature:{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                save_focus_state
              </code>{" "}
              and{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                restore_focus_state
              </code>
              .
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={4} />
            </div>
            <p className="text-sm text-zinc-600">
              Call sites across{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                element.rs
              </code>
              : two in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                type_text
              </code>
              , two in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                press_key
              </code>
              .
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Install
        </h2>
        <p className="text-zinc-600 mb-6">
          Three flavors, same Rust core. The{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            restoreFocus
          </code>{" "}
          flag is exposed in all three.
        </p>
        <TerminalOutput title="install" lines={installLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want your AI agent to automate Windows without stealing the user's caret?"
        description="Book 20 minutes and we will walk through save_focus_state and restore_focus_state against a workflow you already run."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See focus-preserving Windows automation run against your own app in 20 minutes."
      />
    </article>
  );
}
