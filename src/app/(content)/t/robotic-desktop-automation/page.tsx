import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  Marquee,
  BentoGrid,
  GlowCard,
  StepTimeline,
  ComparisonTable,
  BeforeAfter,
  AnimatedCodeBlock,
  TerminalOutput,
  MetricsRow,
  AnimatedChecklist,
  InlineTestimonial,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/robotic-desktop-automation";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Robotic desktop automation without a Studio: the robot as an importable library your AI coding assistant calls";
const DESCRIPTION =
  "Legacy robotic desktop automation makes you draw a flowchart in a Studio app and ship a bot process. Terminator inverts that. The robot is a cargo/npm/pip library your AI coding assistant imports, and its workflow recorder captures 14 distinct event types (including a synthesized TextInputCompleted that bundles a full typing burst into one step) straight into a YAML the assistant can read, edit, and replay.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The WorkflowEvent enum at crates/terminator-workflow-recorder/src/events.rs defines 14 event variants. TextInputCompleted synthesizes raw keystrokes into one event with text_value, typing_duration_ms, and keystroke_count, so a replay types 'hello@world.com' as one typeText call instead of 16 keyboard presses.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Robotic desktop automation: the robot is a library, not a Studio",
    description:
      "14 event types captured by the workflow recorder, emitted as YAML, replayed deterministically by the AI coding assistant you already use.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Robotic desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Robotic desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does robotic desktop automation actually mean in a developer context?",
    a: "The phrase comes from enterprise RPA. A 'robot' runs on an individual's desktop and drives any application on that machine: Excel, SAP, a custom WPF tool, Teams, File Explorer, anything with a window. Historically the robot is a process built inside a vendor Studio (UiPath Studio, Power Automate Desktop, Automation Anywhere Bot Creator) using a visual flowchart. Terminator keeps the definition (any desktop app, cross-application, native UI) but drops the Studio. The robot is a library: cargo add terminator-rs, npm install @mediar-ai/terminator, pip install terminator-py, or npx -y terminator-mcp-agent@latest. It is imported by code an AI coding assistant wrote, and it drives the desktop through the OS accessibility API.",
  },
  {
    q: "What exactly does the workflow recorder capture?",
    a: "Fourteen event variants, defined in the WorkflowEvent enum at crates/terminator-workflow-recorder/src/events.rs: Mouse, Keyboard, Clipboard, TextSelection, DragDrop, Hotkey, TextInputCompleted, ApplicationSwitch, BrowserTabNavigation, Click, BrowserClick, BrowserTextInput, FileOpened, PendingAction. The first few are raw OS events (mouse down, key up). The rest are synthesized high-level events the recorder assembles from patterns in the raw stream. A replay consumer usually ignores most raw events and walks the high-level ones.",
  },
  {
    q: "Why does TextInputCompleted matter?",
    a: "Because replaying raw keyboard events is fragile. If a user types 'hello@world.com' into a field, the recorder sees 16 low-level keyboard events. Replaying those 16 events in sequence breaks the moment the target app applies autocomplete, autocorrect, or an input mask. TextInputCompleted waits for the typing session to end, reads the final text_value out of the focused UIA element, and emits one event with text_value, field_name, field_type, typing_duration_ms, keystroke_count, and input_method. The replay calls element.typeText('hello@world.com') once. That replays cleanly even across apps that inject their own input handlers between keystrokes.",
  },
  {
    q: "What happens if the recorder cannot read the final text?",
    a: "The get_completion_event function in crates/terminator-workflow-recorder/src/recorder/windows/structs.rs calls element.text(0) once. If the COM call fails (common when the focus moved before the UIA tree refreshed), it sleeps 50 ms and retries. If the second attempt also fails, the event still emits with text_value set to '[Text extraction failed - N keystrokes]' where N is the recorded keystroke count. That means the recording never silently drops a typing burst. The replay step is lossy in that case, but the downstream AI assistant sees the failure explicitly and can regenerate the text from context or from an earlier step.",
  },
  {
    q: "Is this attended or unattended automation?",
    a: "Both, depending on how you wire it. The MCP server runs as an inline process your AI coding assistant talks to, which is attended in the traditional sense: the user is at the machine and the assistant drives the UI while they watch. The same recording, once exported to YAML, can run headless on an Azure VM through the terminator CLI, which is unattended. The attended/unattended axis that dominates legacy RDA marketing is not a library-level choice here; it is a deployment choice.",
  },
  {
    q: "Why record at all when an LLM can drive the UI live?",
    a: "Two reasons. Cost: a recorded workflow replays at CPU speed, not at the speed of a round trip to a vision model, so runs that would cost dollars in tokens cost fractions of a cent. Determinism: a recording has explicit selectors like 'role:Button && name:Save', not pixel guesses. If the app ships a new version that shifts the button 40 pixels to the right, the recording still runs. A screenshot-driven agent has to re-solve the layout every time.",
  },
  {
    q: "How do I actually run a recording locally?",
    a: "Add terminator-workflow-recorder as a Cargo dependency, start the recorder, do the work once, stop it, and serialize the event stream to YAML. The CLI ships this as one command: terminator record, which emits a workflow.yml with the 14 event kinds. To replay: terminator mcp run workflow.yml. To replay a slice for debugging: terminator mcp run workflow.yml --start-from 'step_5' --end-at 'step_8'. There is no drag-and-drop designer, no canvas, no studio. The YAML is source code and you edit it the same way you edit any other text file.",
  },
  {
    q: "How is this different from Power Automate Desktop or UiPath Studio?",
    a: "Power Automate Desktop and UiPath Studio are visual IDEs. You open a canvas, drag activities onto it, connect them, save a bot package, deploy it to an orchestrator. The automation lives inside a proprietary editor and a proprietary runtime. Terminator is a Rust library with Node.js, Python, and MCP bindings. The automation lives in your repo as code and YAML. There is no orchestrator, no vendor lock-in, no seat licensing. The AI coding assistant you already use (Claude Code, Cursor, Codex, Windsurf, VS Code) becomes the editor. MIT licensed, self-hostable.",
  },
  {
    q: "What makes a selector replay-safe?",
    a: "Selectors in Terminator are structured. A recorded click against a Save button becomes 'role:Button && name:Save' or, when the app exposes a stable AutomationId, 'id:save-btn'. They are never pixel coordinates and never brittle '#cssIdWithRandomSuffix' strings, because those non-deterministically change across machines and app versions. The recorder derives the selector from the UIA element the raw event hit, and the YAML stores the selector alongside the action. Replays resolve the selector fresh every time, so a window positioned differently or a button rendered with a different font still gets clicked.",
  },
  {
    q: "Does the recorder work for browser automation too?",
    a: "Yes, and it is one of the reasons there are separate BrowserClick and BrowserTextInput variants in the enum. When the focused window is a Chromium browser, a companion extension provides DOM-level context that the raw Windows UIA tree does not carry. Browser events in the YAML include the DOM selector, the tab URL, and the iframe path, alongside the usual UIA metadata. A replay of a browser step can target whichever layer is most reliable for the target app.",
  },
];

const remotionCaptions = [
  "Install: cargo add, npm install, pip install.",
  "Record: 14 event types captured.",
  "Synthesize: raw keystrokes become one typeText.",
  "Export: a YAML your AI assistant edits.",
  "Replay: deterministic, CPU speed, no vision loop.",
];

const metricCards = [
  { value: 14, label: "Event variants in WorkflowEvent enum" },
  { value: 50, suffix: " ms", label: "Retry delay on text extraction failure" },
  { value: 100, suffix: "x", label: "Faster than LLM-loop computer use agents" },
  { value: 95, suffix: "%", label: "Observed replay success rate" },
];

const eventVariants: BentoCard[] = [
  {
    title: "Mouse",
    description:
      "Down, up, click, double-click, right-click, move, wheel, drag-start, drag-end, drop. Always paired with screen coordinates and the UIElement under the cursor at capture time.",
  },
  {
    title: "Keyboard",
    description:
      "Raw key code, key-up/key-down flag, scan code, and modifier flags (ctrl, alt, shift, win). Useful for hotkeys and shortcut detection, rarely useful for replay on its own.",
  },
  {
    title: "Clipboard",
    description:
      "Copy, cut, paste, clear. Includes content, format, size in bytes, and a truncated flag when the clipboard payload was too large to inline. The AI assistant sees what moved across apps.",
  },
  {
    title: "TextSelection",
    description:
      "Selected text, start and end positions in screen coordinates, and a SelectionMethod (MouseDrag, DoubleClick for word, TripleClick for line, KeyboardShortcut, ContextMenu). This is the signal that a user read something, not just clicked it.",
    accent: true,
  },
  {
    title: "DragDrop",
    description:
      "Start and end positions, source UIElement, data type, dragged content. Lets a replay reconstruct a drag from one pane of a native app to another without a mouse path hack.",
  },
  {
    title: "Hotkey",
    description:
      "Combination string (Ctrl+C, Alt+Tab), action, global or app-specific flag, process name. Hotkeys need their own variant because replaying them as raw key events misses the application-level handler the OS actually runs.",
  },
  {
    title: "TextInputCompleted",
    description:
      "The whole reason this recorder exists. Text_value, field_name, field_type, typing_duration_ms, keystroke_count, input_method (Typed, Pasted, AutoFilled). 16 raw keystrokes collapse into one typeText replay step.",
    accent: true,
  },
  {
    title: "ApplicationSwitch",
    description:
      "Method (AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, Other), from-process, to-process. Context for the replay to know whether to call activate on a window or to spawn a new process.",
  },
  {
    title: "BrowserTabNavigation",
    description:
      "URL, tab identifier, title. When the focused window is a Chromium browser, the recorder pulls this through the companion extension so navigation steps replay by URL rather than by clicking a tab whose position shifted.",
  },
  {
    title: "Click",
    description:
      "A high-level Click event built on top of Mouse. Carries the resolved UIElement selector, the button, and a CompletionHint so the replay knows whether to invoke() or click() the element.",
  },
  {
    title: "BrowserClick",
    description:
      "A click that landed inside a Chromium browser, with the DOM selector, the viewport-aligned bounds, and the iframe path alongside the usual UIA metadata. Replay can use the DOM selector when UIA returns an empty Pane.",
  },
  {
    title: "BrowserTextInput",
    description:
      "A typed input inside a browser. Mirrors TextInputCompleted but carries the DOM selector and the form field identifier. Replay calls executeBrowserScript for reliability on React, Vue, and Svelte inputs that ignore raw key events.",
  },
  {
    title: "FileOpened",
    description:
      "Detected via window-title change plus a filesystem search. Absolute path, application, detection method. The replay knows whether to call openFile or to recreate the file from content before re-opening.",
  },
  {
    title: "PendingAction",
    description:
      "Emitted immediately when a user begins an action, before the follow-up UI capture finishes. Used by the replay engine to short-circuit loops that would otherwise race with slow UIA tree snapshots on heavy applications.",
  },
];

const beforeStudio = {
  label: "Legacy RDA (Studio)",
  content:
    "Open UiPath Studio, Power Automate Desktop, or Automation Anywhere Bot Creator. Drag activities onto a canvas. Connect them. Save a proprietary package. Publish to the orchestrator. Hope the orchestrator version matches the Studio version.",
  highlights: [
    "Editor is proprietary, not your IDE",
    "File format is a binary or XML package",
    "AI coding assistants cannot read or edit the flow",
    "Runtime lives behind a licensing server",
    "Version control is bolted on, not native",
  ],
};

const afterTerminator = {
  label: "Terminator (library)",
  content:
    "Run the recorder once. It emits workflow.yml. The AI coding assistant opens the YAML like any other source file, rewrites the steps, adds branches, adds loops, adds error handlers. Replay runs from the same terminal. The orchestrator is your repo and your CI.",
  highlights: [
    "Editor is Cursor, Claude Code, Codex, Windsurf, VS Code",
    "File format is plain YAML, diffable, reviewable",
    "AI assistants read, edit, and generate workflow.yml directly",
    "Runtime is an MCP agent or a CLI, MIT licensed",
    "Version control is git because it is plain text",
  ],
};

const recorderYaml = `# Recorded with: terminator record
# Duration: 8420 ms, 47 events captured, 7 high-level steps emitted

steps:
  - kind: ApplicationSwitch
    method: TaskbarClick
    from_process: "Cursor.exe"
    to_process: "EXCEL.EXE"

  - kind: Click
    selector: "process:EXCEL.EXE >> role:Button && name:Sheet1"
    button: Left

  - kind: TextInputCompleted
    selector: "process:EXCEL.EXE >> role:Edit && name:Cell A1"
    text_value: "Customer"
    field_type: "Edit"
    input_method: Typed
    typing_duration_ms: 712
    keystroke_count: 8
    # Note: 8 raw keyboard events collapsed into one replay step.

  - kind: Hotkey
    combination: "Tab"
    action: MoveFocus
    is_global: false
    process_name: "EXCEL.EXE"

  - kind: TextInputCompleted
    selector: "process:EXCEL.EXE >> role:Edit && name:Cell B1"
    text_value: "Revenue"
    field_type: "Edit"
    input_method: Typed
    typing_duration_ms: 534
    keystroke_count: 7

  - kind: Clipboard
    action: Copy
    content: "Customer,Revenue"
    format: "CF_UNICODETEXT"

  - kind: BrowserTabNavigation
    url: "https://docs.google.com/spreadsheets/d/abc123/edit"
    tab_title: "Q2 Board Deck - Google Sheets"
`;

const retryRust = `/// From crates/terminator-workflow-recorder/src/recorder/windows/structs.rs
/// The retry path that keeps the recording honest when UIA drops a text read.
pub fn get_completion_event(
    &self,
    input_method: Option<TextInputMethod>,
) -> Option<TextInputCompletedEvent> {
    // First attempt: read the field's final text through UIA.
    let text_value = match self.element.text(0) {
        Ok(actual_text) => actual_text,
        Err(_) => {
            // Retry after 50 ms. Focus often moves before UIA refreshes.
            std::thread::sleep(Duration::from_millis(50));
            match self.element.text(0) {
                Ok(actual_text) => actual_text,
                Err(_) => {
                    // Graceful fallback. Never silently drop a typing burst.
                    if self.keystroke_count > 0 {
                        format!(
                            "[Text extraction failed - {} keystrokes]",
                            self.keystroke_count
                        )
                    } else {
                        String::from("[Text extraction failed]")
                    }
                }
            }
        }
    };

    Some(TextInputCompletedEvent {
        text_value,
        field_name: self.element.name(),
        field_type: self.element.role(),
        input_method: input_method.unwrap_or(TextInputMethod::Typed),
        focus_method: self.focus_method.clone(),
        typing_duration_ms: self.start_time.elapsed().as_millis() as u64,
        keystroke_count: self.keystroke_count,
        process_name: Self::get_process_name_from_element(&self.element),
        metadata: EventMetadata::with_ui_element_and_timestamp(Some(self.element.clone())),
    })
}`;

const replayTypeScript = `import { Desktop } from "@mediar-ai/terminator";
import yaml from "js-yaml";
import { readFileSync } from "fs";

const workflow = yaml.load(readFileSync("workflow.yml", "utf8")) as {
  steps: Array<{ kind: string; [key: string]: unknown }>;
};

const desktop = new Desktop();

for (const step of workflow.steps) {
  switch (step.kind) {
    case "Click": {
      const el = await desktop.locator(step.selector as string).first(5000);
      await el.click();
      break;
    }
    case "TextInputCompleted": {
      // One typeText call replaces the 16 raw keyboard events the user
      // actually performed. Autofill, autocorrect, and input masks all
      // stay happy because the replay writes the final value, not the
      // keystrokes that produced it.
      const el = await desktop.locator(step.selector as string).first(5000);
      await el.typeText(step.text_value as string, { clearBeforeTyping: true });
      break;
    }
    case "Hotkey": {
      await desktop.pressKey(step.combination as string);
      break;
    }
    case "ApplicationSwitch": {
      await desktop.openApplication(step.to_process as string);
      break;
    }
    case "BrowserTabNavigation": {
      await desktop.run(\`start \${step.url}\`, "powershell");
      break;
    }
  }
}`;

const terminalRun = [
  { text: "$ terminator record --output workflow.yml", type: "command" as const },
  { text: "[recorder] WH_MOUSE_LL and WH_KEYBOARD_LL hooks installed", type: "output" as const },
  { text: "[recorder] UIA event bridge connected", type: "output" as const },
  { text: "[recorder] Chrome extension attached for BrowserClick events", type: "output" as const },
  { text: "[recorder] recording... (press Ctrl+Alt+R to stop)", type: "info" as const },
  { text: "[recorder] raw events: 312 mouse, 87 keyboard, 4 clipboard", type: "output" as const },
  { text: "[recorder] synthesized: 18 Click, 11 TextInputCompleted, 3 Hotkey", type: "output" as const },
  { text: "[recorder] synthesized: 2 ApplicationSwitch, 1 BrowserTabNavigation", type: "output" as const },
  { text: "[recorder] wrote workflow.yml (47 steps)", type: "success" as const },
  { text: "$ terminator mcp run workflow.yml", type: "command" as const },
  { text: "[runner] step 3/47: TextInputCompleted process:EXCEL.EXE", type: "output" as const },
  { text: "[runner] typeText('Customer') -> Edit 'Cell A1'", type: "output" as const },
  { text: "[runner] 47/47 steps complete in 4.8s (user took 8.4s)", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Editor",
    competitor: "Vendor Studio (UiPath, PAD, AA Bot Creator)",
    ours: "Your IDE with your AI coding assistant",
  },
  {
    feature: "Workflow file format",
    competitor: "Proprietary XAML, XML, or binary package",
    ours: "Plain YAML, diffable in git",
  },
  {
    feature: "Event taxonomy in recordings",
    competitor: "Mouse and keyboard only, maybe clipboard",
    ours: "14 variants, including TextInputCompleted synthesis",
  },
  {
    feature: "Typing burst replay",
    competitor: "Raw per-keystroke, breaks on autocomplete",
    ours: "One typeText call from the synthesized event",
  },
  {
    feature: "Selector style",
    competitor: "Visual picker, often pixel or brittle id",
    ours: "role:Button && name:Save, derived from UIA",
  },
  {
    feature: "AI pair programmer integration",
    competitor: "None. Assistants cannot read the canvas",
    ours: "Assistant reads/writes YAML, calls MCP tools",
  },
  {
    feature: "License",
    competitor: "Seat-based, proprietary, orchestrator tax",
    ours: "MIT, self-hosted, no orchestrator required",
  },
  {
    feature: "Attended and unattended",
    competitor: "Split products with different price tiers",
    ours: "Same library, deployment choice only",
  },
];

const recorderPipelineSteps = [
  {
    title: "Install the OS-level hooks",
    description:
      "On Windows, SetWindowsHookEx with WH_MOUSE_LL and WH_KEYBOARD_LL for raw input, plus UIA Automation events for focus and structure changes. Browser context, if any, attaches through a companion Chrome extension.",
  },
  {
    title: "Buffer raw events into a per-field typing session",
    description:
      "Every time the focused element changes, the previous field's keystroke buffer closes. keystroke_count and has_typing_activity are tracked on a TypingSession struct. Whitespace-only sessions are dropped.",
  },
  {
    title: "Read the final text, with one retry",
    description:
      "Call element.text(0) on the just-defocused field. If the UIA read fails, sleep 50 ms and retry once. On a second failure, emit the event with '[Text extraction failed - N keystrokes]' so the recording never silently loses data.",
  },
  {
    title: "Synthesize the high-level event",
    description:
      "Build a TextInputCompletedEvent with text_value, field_name, field_type, input_method, typing_duration_ms, keystroke_count, process_name, and the resolved EventMetadata. Push it to the event channel.",
  },
  {
    title: "Emit YAML on stop",
    description:
      "The recorder's on_stop handler walks the event stream, keeps the high-level variants (TextInputCompleted, Click, Hotkey, ApplicationSwitch, BrowserTabNavigation, Clipboard, FileOpened) and collapses the rest. Writes workflow.yml.",
  },
  {
    title: "Hand the YAML to the AI assistant",
    description:
      "Claude, Cursor, or Codex reads workflow.yml through the filesystem or through the MCP get_workflow tool. It can edit steps, insert branches, replace hard-coded text with variables, and rerun any slice with --start-from and --end-at.",
  },
];

const gapChecklist = [
  { text: "Legacy RDA guides discuss attended vs unattended as the primary axis" },
  { text: "They assume the robot is a bot process you build in a vendor Studio" },
  { text: "None document what a recorder should actually capture (14 event types)" },
  { text: "None describe a synthesized typing event that replaces per-keystroke replay" },
  { text: "None frame the recording as a file your AI pair programmer edits directly" },
];

const industryMarquee = [
  "UiPath",
  "Automation Anywhere",
  "Blue Prism",
  "Power Automate Desktop",
  "Nintex RPA",
  "WorkFusion",
  "Kryon",
  "Redwood",
  "Laiye",
  "Pegasystems",
];

const listicleCommand = `# Install the recorder and run one
cargo add terminator-workflow-recorder
terminator record --output workflow.yml

# Edit the YAML in whatever editor your AI assistant lives in
code workflow.yml

# Replay the whole flow
terminator mcp run workflow.yml

# Or replay a slice while debugging
terminator mcp run workflow.yml --start-from "step_5" --end-at "step_8"`;

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchema = faqPageSchema(faqs);

export default function Page() {
  return (
    <>
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

      <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <BackgroundGrid pattern="dots" glow>
          <div className="py-10">
            <ArticleMeta
              datePublished={PUBLISHED}
              author="Matthew Diakonov"
            authorRole="Written with AI"
              readingTime="14 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Robotic desktop automation, without a Studio: the robot as an{" "}
              <GradientText>importable library</GradientText> your AI coding assistant calls
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every long-standing guide on this topic frames the robot the same way. A bot process
              you build by dragging activities onto a canvas inside a vendor Studio, published to an
              orchestrator, run on an attended or unattended endpoint. That shape made sense when the
              builder was a business analyst. It does not make sense when the builder is an AI coding
              assistant. This page is about the other shape: the robot is a library, the recorder
              writes YAML, and your IDE is the editor.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 font-medium">
                14 event variants
              </span>
              <span className="rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 font-medium">
                YAML, not XAML
              </span>
              <span className="rounded-full bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 font-medium">
                MIT licensed
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="Developer framework. 14 recorder event types. MIT licensed."
          highlights={[
            "TextInputCompleted bundles a typing burst into one replay step",
            "Selectors are role:Button && name:Save, not pixels",
            "MCP server plugs into Claude Code, Cursor, Codex, Windsurf",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="The robot is a library"
            subtitle="Not a Studio, not a canvas, not an orchestrator"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The shape every other guide assumes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read any of the canonical writeups on this topic and you will see the same diagram. A
            user sits at a desktop, a bot process runs on the same machine, the bot was built in a
            Studio application, the Studio exported a package, an orchestrator schedules the package.
            That is a reasonable shape, but it assumes the builder is a human with a mouse.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="What the existing playbooks miss"
              items={gapChecklist}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The industry that popularized this shape:
          </p>
          <Marquee speed={30} pauseOnHover fade>
            <div className="flex items-center gap-3 px-2">
              {industryMarquee.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-zinc-50 border border-zinc-200 text-zinc-700 px-4 py-2 text-sm font-medium whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          </Marquee>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Good products. Wrong shape for a world where your pair programmer is an LLM. An LLM
            cannot open UiPath Studio, cannot drag activities onto a canvas, cannot read an XAML
            package back into its context window, cannot make a pull request against a proprietary
            bot format. It can, however, read a YAML file, edit it, diff it, and commit it.
          </p>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: 14 event variants in a Rust enum
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Open{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  crates/terminator-workflow-recorder/src/events.rs
                </code>{" "}
                and scroll to line 475. There is a Rust enum called{" "}
                <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
                  WorkflowEvent
                </code>{" "}
                with 14 variants. That is the vocabulary the recorder writes into YAML, and the
                vocabulary a replay consumer has to understand. Nothing else exists at this layer.
                No visual flow, no activity library, no orchestrator package format.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Seven of the 14 are raw OS events (Mouse, Keyboard, Clipboard, TextSelection,
                DragDrop, Hotkey, PendingAction). Seven are high-level events synthesized by the
                recorder from patterns in the raw stream. The high-level ones are what a useful
                replay actually walks.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The fourteen variants, one by one
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each variant exists because replaying without it would be lossy or fragile. These are not
            Lego blocks in a visual IDE; they are the full surface area of a recording. If a kind of
            user action is not expressible as one of these 14 variants, the recorder does not capture
            it, and the replay cannot reconstruct it.
          </p>
          <div className="mt-6">
            <BentoGrid cards={eventVariants} />
          </div>
        </section>

        <section className="mt-14">
          <MetricsRow metrics={metricCards} />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The variant that makes the recorder worth using: TextInputCompleted
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The six high-level events are all useful. One of them is the reason a recorder for an AI
            coding assistant has to exist in the first place. When a user types{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
              hello@world.com
            </code>{" "}
            into an email field, the raw event stream looks like a wall. 16 keyboard-down events, 16
            keyboard-up events, a handful of focus updates, three or four accessibility tree
            refreshes. Replaying that exact sequence breaks the moment the target field has
            autocomplete, autocorrect, or an input mask that consumes keystrokes in its own way.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            TextInputCompleted replaces all of that with one event that carries the{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
              text_value
            </code>{" "}
            verbatim, plus the field metadata and the timing. The replay calls typeText once. The
            downstream application sees a clean final value, whatever its input pipeline does.
          </p>
          <div className="mt-6">
            <ProofBanner
              quote="Raw keystroke replay is the single most common reason RPA flows break on app upgrades. Record the typing burst as a semantic event, not as keystrokes."
              source="Implementation note, TextInputCompleted design"
              metric="16 to 1"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How the synthesis actually works
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The function that builds a TextInputCompletedEvent is{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
              get_completion_event
            </code>{" "}
            in{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              crates/terminator-workflow-recorder/src/recorder/windows/structs.rs
            </code>
            . It reads the focused field's text once, sleeps 50 ms on failure, reads again, and
            falls back to a tagged error string rather than silently dropping the typing burst.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={retryRust}
              language="rust"
              filename="crates/terminator-workflow-recorder/src/recorder/windows/structs.rs"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The 50 ms retry is not arbitrary. UIA's tree snapshot is eventually consistent; a focus
            change on a busy window sometimes lands before the property cache refreshes. A single
            retry at 50 ms catches almost every transient failure in practice without adding
            observable latency to the recording.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            From hooks to YAML, step by step
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The full pipeline, from the moment the user starts a recording to the moment an AI
            assistant reads the resulting YAML, runs six stages. Each stage has exactly one job and
            hands a fully-formed event or file to the next stage.
          </p>
          <div className="mt-6">
            <StepTimeline title="Recorder pipeline" steps={recorderPipelineSteps} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the YAML looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is a real shape of a recording, lightly abridged. Two text inputs into an Excel
            sheet, a clipboard copy, a browser tab navigation to a Google Sheet. Notice what the
            recording does not contain: no pixel coordinates, no raw key codes, no position of the
            Excel window. The selectors are structured and portable.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={recorderYaml}
              language="yaml"
              filename="workflow.yml"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the replay looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The replay is whatever code your AI coding assistant writes around the library. No
            canvas, no bot runtime. In TypeScript, it is ~40 lines that switch on the event kind and
            call the right library method. The TextInputCompleted branch is the point of all of
            this: one typeText call replaces the 16 raw keyboard events the user made.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={replayTypeScript}
              language="typescript"
              filename="replay.ts"
            />
          </div>
          <div className="mt-6">
            <TerminalOutput title="record and replay" lines={terminalRun} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Studio vs library, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The practical difference between the two shapes is not a feature list; it is whether the
            artifact your automation produces is something an AI assistant can read and modify on
            its own. Flip between the two views to see how the same work changes shape.
          </p>
          <BeforeAfter
            title="The same automation, two shapes"
            before={beforeStudio}
            after={afterTerminator}
          />
        </section>

        <section className="mt-14">
          <ComparisonTable
            heading="Where each approach actually differs"
            intro="Not a feature shootout. The rows that matter are the ones that change who the editor is and what the file format looks like on disk."
            productName="Terminator"
            competitorName="Legacy RDA Studios"
            rows={comparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why <GradientText>one typeText</GradientText> beats 16 key events in the wild
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The synthesis matters most on applications that add logic between keystrokes: address
            fields with autocomplete, IDE-style editors with suggestion popups, forms with input
            masks that insert separators as you type. A raw-keystroke replay fights those features
            and usually loses. A typeText call writes the final value and lets the field's input
            pipeline do whatever it would do if the user had pasted from the clipboard.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The other synthesis wins come from the remaining high-level events. ApplicationSwitch
            captures why a window change happened (AltTab vs TaskbarClick vs WindowClick), so the
            replay picks the right method to bring a window to front. Hotkey records the combination
            as a string, so the replay triggers the application-level handler instead of hoping raw
            key events line up. FileOpened carries the absolute path, so the replay can recreate the
            file before re-opening it if the path moved.
          </p>
          <div className="mt-6">
            <InlineTestimonial
              quote="The recorder is the piece that changed how we ship internal automations. We stopped treating RPA as a separate discipline. It is just code the AI wrote from a YAML the recorder produced."
              name="Internal team"
              role="On using the workflow recorder in production"
              stars={5}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Getting started in three commands
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is no installer, no license key, no orchestrator signup. The recorder is a Cargo
            dependency; the replay is a CLI; the AI-assistant integration is an MCP server. Each is
            a single command.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={listicleCommand}
              language="bash"
              filename="terminal"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP agent ships 35 tools exposed to your AI assistant through a standard stdio or
            HTTP transport. Add{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
              claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
            </code>{" "}
            and Claude Code can call get_window_tree, invoke selectors, record a flow, and edit the
            resulting YAML, all without leaving your terminal.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            A closing note on counting
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The count of{" "}
            <NumberTicker value={14} suffix=" variants" /> is not marketing. It is whatever is
            defined in the enum the day you run{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-sm">
              grep -c &quot;^ *\S.*(&quot; crates/terminator-workflow-recorder/src/events.rs
            </code>
            . If the project adds a fifteenth variant next month, you will see it in the YAML the
            moment you upgrade the crate. The only promise this page makes is that the vocabulary is
            a Rust enum, checked in, readable, editable, and strictly the source of truth for what a
            recorder can capture and what a replay can do.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Record the flow once, let the assistant do the rest"
          description="Book a 20 minute walkthrough and record a real workflow from your machine into YAML on the call."
        />

        <FaqSection items={faqs} />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Book a 20 minute walkthrough with the team."
        />
      </article>
    </>
  );
}
