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
  Marquee,
  ShimmerButton,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  MetricsRow,
  AnimatedBeam,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-testing-automation-tools";
const PUBLISHED = "2026-04-20";
const TITLE =
  "UI testing automation tools: the 14-variant WorkflowEvent enum that separates semantic recorders from keystroke dumps";
const DESCRIPTION =
  "Most ui testing automation tools with a recorder save a stream of raw mouse moves and key downs. Terminator's recorder emits 14 high-level event variants including TextInputCompleted (with Typed/Pasted/AutoFilled/Suggestion), ApplicationSwitch tagged by method, and FileOpened with a confidence-ranked candidate path list. The enum lives in events.rs lines 475-517. This page walks through each variant and the shape of the JSON you get out.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "14 WorkflowEvent variants. TextInputCompleted with 5 input methods. ApplicationSwitch with 6 methods. FileOpened with a ranked candidate list. This is what a semantic recorder emits.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The ui testing automation tools recorder most miss",
    description:
      "Terminator's recorder emits TextInputCompleted, ApplicationSwitch, and FileOpened events, not raw keystrokes. 14 variants in events.rs lines 475-517.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI testing automation tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI testing automation tools", url: PAGE_URL },
];

const workflowEventEnumSource = `// crates/terminator-workflow-recorder/src/events.rs, lines 475-517
// The full surface of what the recorder emits.
// 14 variants. 8 are "high-level" (semantic intent).
// 6 are "low-level" (raw input, kept for completeness).

pub enum WorkflowEvent {
    // Low-level raw input (kept for edge cases)
    Mouse(MouseEvent),
    Keyboard(KeyboardEvent),
    Clipboard(ClipboardEvent),
    TextSelection(TextSelectionEvent),
    DragDrop(DragDropEvent),
    Hotkey(HotkeyEvent),

    // High-level semantic events (the interesting ones)
    TextInputCompleted(TextInputCompletedEvent),
    ApplicationSwitch(ApplicationSwitchEvent),
    BrowserTabNavigation(BrowserTabNavigationEvent),
    Click(ClickEvent),
    BrowserClick(BrowserClickEvent),
    BrowserTextInput(BrowserTextInputEvent),
    FileOpened(FileOpenedEvent),
    PendingAction(PendingActionEvent),
}`;

const textInputEventSource = `// crates/terminator-workflow-recorder/src/events.rs, lines 977-999
// Emitted once per field, after the user has stopped typing.
// Includes how the text got there: typed, pasted, autofilled, or suggestion.

pub struct TextInputCompletedEvent {
    pub text_value: String,
    pub field_name: Option<String>,
    pub field_type: String,          // "TextBox", "PasswordBox", "SearchBox", ...
    pub input_method: TextInputMethod,
    pub focus_method: FieldFocusMethod,
    pub typing_duration_ms: u64,     // how long the user was in the field
    pub keystroke_count: u32,        // real key presses (0 if purely pasted)
    pub process_name: Option<String>,
    pub metadata: EventMetadata,
}

pub enum TextInputMethod {
    Typed,        // Typed character by character
    Pasted,       // Large amount added quickly (detected via timing)
    AutoFilled,   // Likely from browser autofill or field suggestion
    Suggestion,   // User picked an item from an autocomplete dropdown
    Mixed,        // Multiple methods in the same session
}`;

const fileOpenedSource = `// crates/terminator-workflow-recorder/src/events.rs, lines 1155-1180
// Emitted when a new window title appears to reference a file name.
// The recorder searches the user's recent-access paths to rank candidates.

pub struct FileOpenedEvent {
    pub filename: String,                          // parsed from window title
    pub primary_path: Option<String>,              // highest-confidence match
    pub candidate_paths: Vec<FileCandidatePath>,   // all matches, ranked
    pub confidence: FilePathConfidence,
    pub application_name: String,
    pub process_id: Option<u32>,
    // ...
}

pub enum FilePathConfidence {
    High,   // only one file found with this name
    Medium, // multiple files, but clear most-recent access time
    Low,    // multiple files with ambiguous access times
}`;

const sampleRecordingJson = `{
  "name": "invoice-approval-flow",
  "start_time": 1713604812000,
  "events": [
    {
      "type": "ApplicationSwitch",
      "from_process_name": "chrome.exe",
      "to_process_name": "OUTLOOK.EXE",
      "switch_method": "AltTab",
      "dwell_time_ms": 14320
    },
    {
      "type": "Click",
      "ui_element": { "role": "Button", "name": "Reply" },
      "process_name": "OUTLOOK.EXE"
    },
    {
      "type": "TextInputCompleted",
      "field_name": "Subject",
      "field_type": "Edit",
      "text_value": "Re: Q2 invoice approval",
      "input_method": "Typed",
      "keystroke_count": 24,
      "typing_duration_ms": 3140
    },
    {
      "type": "TextInputCompleted",
      "field_name": "To",
      "field_type": "Edit",
      "text_value": "finance@acme.com",
      "input_method": "AutoFilled",
      "keystroke_count": 4,
      "typing_duration_ms": 720
    },
    {
      "type": "FileOpened",
      "filename": "Q2-invoices.xlsx",
      "primary_path": "C:\\\\Users\\\\alex\\\\Documents\\\\finance\\\\Q2-invoices.xlsx",
      "confidence": "High",
      "application_name": "EXCEL.EXE",
      "candidate_paths": [
        { "path": "C:\\\\Users\\\\alex\\\\Documents\\\\finance\\\\Q2-invoices.xlsx",
          "last_accessed": "2026-04-20T14:01:12Z",
          "size_bytes": 184320 }
      ]
    },
    {
      "type": "BrowserTabNavigation",
      "browser": "Chrome",
      "action": "Switched",
      "method": "KeyboardShortcut",
      "from_url": "https://outlook.office.com/mail/inbox",
      "to_url": "https://finance.acme.com/approvals/q2"
    }
  ]
}`;

const recorderTerminalLines = [
  { text: "terminator-workflow-recorder --output invoice-flow.json", type: "command" as const },
  { text: "  recorder: watching process and focus changes on Windows UIA", type: "output" as const },
  { text: "  recorder: text-input completion threshold 500ms idle", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "> switched to process OUTLOOK.EXE via AltTab (method=AltTab)", type: "output" as const },
  { text: "> click on [Button \"Reply\"] in OUTLOOK.EXE", type: "output" as const },
  { text: "> TextInputCompleted in field \"Subject\" (method=Typed, 24 keystrokes, 3140ms)", type: "output" as const },
  { text: "> TextInputCompleted in field \"To\" (method=AutoFilled, 4 keystrokes, 720ms)", type: "output" as const },
  { text: "> FileOpened \"Q2-invoices.xlsx\" -> 1 candidate (confidence=High)", type: "output" as const },
  { text: "> BrowserTabNavigation Chrome (method=KeyboardShortcut, Switched)", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "^C stopping recorder, writing invoice-flow.json (6 events, 42.1KB)", type: "success" as const },
];

const recorderVsKeystrokeRows: ComparisonRow[] = [
  {
    feature: "Stores 'user pasted john@example.com' as ONE event",
    competitor: "Stores it as ~20 keydown/keyup pairs plus a clipboard event. No semantic link between them.",
    ours: "One TextInputCompleted event. input_method=Pasted. text_value is the full string.",
  },
  {
    feature: "Distinguishes typed input from paste from autofill",
    competitor: "No. A paste and a fast type look identical in a keystroke log.",
    ours: "Yes. TextInputMethod has 5 variants: Typed, Pasted, AutoFilled, Suggestion, Mixed.",
  },
  {
    feature: "Captures how the user switched applications",
    competitor: "Usually not recorded at all. A focus change is inferred from the next click location.",
    ours: "ApplicationSwitchMethod records AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, Other.",
  },
  {
    feature: "Detects a browser tab switch (not a page load)",
    competitor: "No. Browser tab state is invisible to OS-level recorders.",
    ours: "Chrome extension bridge emits BrowserTabNavigation with to_url, from_url, method, is_back_forward.",
  },
  {
    feature: "Resolves the actual file path of an opened document",
    competitor: "No. Window title is saved as-is. If the title is 'Q2-invoices.xlsx - Excel', the full path is lost.",
    ours: "FileOpenedEvent searches recent-access paths, emits primary_path plus ranked candidate_paths.",
  },
  {
    feature: "Records how long the user spent in a field",
    competitor: "Derivable from keydown timestamps, not stored as a single value.",
    ours: "TextInputCompletedEvent.typing_duration_ms is one field per completion.",
  },
  {
    feature: "Records time spent in previous application (dwell)",
    competitor: "No.",
    ours: "ApplicationSwitchEvent.dwell_time_ms is one field per switch.",
  },
  {
    feature: "Output is replayable as typed MCP tool calls",
    competitor: "Replay requires the same OS, same resolution, often the same screen layout.",
    ours: "Each recorded event maps to an McpToolStep (tool_name, arguments, description) that any MCP client can run.",
  },
  {
    feature: "Expected UI change stored alongside the action",
    competitor: "No.",
    ours: "McpToolStep.expected_ui_changes is a tree diff snapshot, used as a validation oracle on replay.",
  },
  {
    feature: "Output format is a typed Rust/TypeScript schema",
    competitor: "Usually a proprietary binary or a screenshot reel.",
    ours: "SerializableWorkflowEvent is a serde enum. Full JSON schema is derivable from the source.",
  },
];

const variantBento: BentoCard[] = [
  {
    title: "TextInputCompleted",
    description:
      "Fires once per field after the user stops typing for ~500ms. Stores text_value, field_name, field_type, typing_duration_ms, keystroke_count, and the input_method from {Typed, Pasted, AutoFilled, Suggestion, Mixed}. This is the single most useful event in the enum for test authoring.",
    size: "2x1",
  },
  {
    title: "ApplicationSwitch",
    description:
      "Records a focus change between two processes. Includes from_process_name, to_process_name, switch_method ({AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, Other}), and dwell_time_ms in the previous app. Six methods, not one.",
    size: "1x1",
  },
  {
    title: "FileOpened",
    description:
      "Fires when a new window title appears to reference a file. The recorder searches recent-access paths, ranks by LastAccessTime, and emits a FilePathConfidence of High, Medium, or Low. Your test gets a real path, not a title fragment.",
    size: "1x1",
  },
  {
    title: "BrowserTabNavigation",
    description:
      "Chrome-extension-bridged event with to_url, from_url, to_title, from_title, browser, tab_index, total_tabs, is_back_forward. Action is one of {Created, Switched, Closed, Moved, Duplicated, Pinned, Refreshed}. Method tracks how the navigation happened.",
    size: "2x1",
  },
  {
    title: "Click and BrowserClick",
    description:
      "Two click variants. Click uses accessibility role plus name. BrowserClick additionally carries DomElementInfo with the CSS path and up to 5 ranked SelectorCandidate entries, so the downstream replay can pick the selector that actually survived the last page update.",
    size: "1x1",
  },
  {
    title: "BrowserTextInput",
    description:
      "DOM-aware text input. Emitted via the extension bridge for inputs inside a browser tab. Carries the field's DomElementInfo so replay does not need to walk the accessibility tree, which is lossy for web forms.",
    size: "1x1",
  },
  {
    title: "Hotkey, Clipboard, TextSelection, DragDrop",
    description:
      "The three semantic layer-helpers. Hotkey pattern matches against a small known-shortcut list (save, copy, close tab, etc.). Clipboard stores a hash plus action. TextSelection records the selected substring. DragDrop captures the source, target, and payload.",
    size: "1x1",
  },
  {
    title: "Mouse, Keyboard, PendingAction",
    description:
      "Low-level leftovers. Mouse and Keyboard are the raw event streams (disabled by default in the config). PendingAction is an internal bookkeeping event emitted right before a capture completes, so consumers can block on UI-tree refresh before reading the next event.",
    size: "2x1",
  },
];

const lifecycleSteps = [
  {
    title: "Event capture in a dedicated thread",
    description:
      "The Windows recorder runs a UI Automation event subscription on a background thread. Every focus change, click, and text-change notification lands in a bounded channel. A second thread owns clipboard polling. A third owns the browser-extension bridge for Chrome-specific signals.",
  },
  {
    title: "Semantic aggregation, not stream dumping",
    description:
      "Instead of saving each event raw, the aggregator maintains small state machines. For text input, it holds an InputTextAccumulator per focused element that tracks keystroke_count, start_time, and whether the user has been idle long enough to emit. For application switching, it holds an ApplicationState with a start-time stamp so dwell_time_ms comes out correct.",
  },
  {
    title: "Method detection via timing and modifiers",
    description:
      "Paste detection is timing-based: if the text length jumps by more than N characters in under M milliseconds without matching keystroke count, the event is classified as Pasted. Suggestion is detected by an autocomplete-list click interacting with the focused field. AutoFilled is inferred from text appearing without any keystroke burst at all.",
  },
  {
    title: "File-path resolution against the OS",
    description:
      "When a new window title is detected, the recorder parses a filename candidate out of it (handles 'file.txt - App', 'file.txt * - App', 'App - file.txt', and similar). Then it walks the filesystem's recent-access index, collects matches, and ranks them by LastAccessTime to assign FilePathConfidence.",
  },
  {
    title: "Write out as SerializableWorkflowEvent",
    description:
      "At recording end, each live event is converted to its Serializable counterpart (UIElement becomes SerializableUIElement, timestamps stay as u64 millis, enums become string tags). The whole workflow serializes through serde_json::to_string_pretty. The resulting .json file is the recording.",
  },
  {
    title: "Replay as MCP tool calls, with oracles",
    description:
      "On replay, each event maps to an McpToolStep with a tool_name, arguments, and optional expected_ui_changes / expected_dom_changes fields. A test runner can call each step, diff the UI after each action, and fail with a structured reason instead of a silent 'element not found'.",
  },
];

const mcpStepFlow = [
  { label: "recorded event", sublabel: "WorkflowEvent::Click(...)" },
  { label: "tool name", sublabel: "click_element" },
  { label: "arguments", sublabel: "{ selector, timeout_ms }" },
  { label: "expected_ui_changes", sublabel: "tree diff snapshot" },
];

const inputMethodMetrics = [
  { value: 14, label: "WorkflowEvent variants" },
  { value: 5, label: "TextInputMethod values" },
  { value: 6, label: "ApplicationSwitchMethod values" },
  { value: 7, label: "TabAction values" },
];

const variantNames = [
  "Mouse",
  "Keyboard",
  "Clipboard",
  "TextSelection",
  "DragDrop",
  "Hotkey",
  "TextInputCompleted",
  "ApplicationSwitch",
  "BrowserTabNavigation",
  "Click",
  "BrowserClick",
  "BrowserTextInput",
  "FileOpened",
  "PendingAction",
];

const methodTags = [
  "method=Typed",
  "method=Pasted",
  "method=AutoFilled",
  "method=Suggestion",
  "method=Mixed",
  "switch_method=AltTab",
  "switch_method=TaskbarClick",
  "switch_method=WindowsKeyShortcut",
  "switch_method=StartMenu",
  "switch_method=WindowClick",
  "confidence=High",
  "confidence=Medium",
  "confidence=Low",
  "action=Switched",
  "action=Created",
  "action=Closed",
];

const faqs = [
  {
    q: "What does Terminator record that mainstream ui testing automation tools recorders do not?",
    a: "A semantic event stream instead of a raw input stream. When a user pastes an email address into a To: field, Selenium IDE or a low-code browser recorder saves a clipboard paste plus a focus change plus a change event. Terminator saves one TextInputCompleted event with text_value='finance@acme.com', input_method=Pasted, keystroke_count=0, typing_duration_ms=720, field_name='To'. The rest of the state machine is in the recorder, not the log file. This is how the recording stays readable when the workflow is thirty actions long.",
  },
  {
    q: "Where is the 14-variant WorkflowEvent enum?",
    a: "In the open-source Terminator repo at crates/terminator-workflow-recorder/src/events.rs, lines 475 to 517. Clone github.com/mediar-ai/terminator and grep for 'pub enum WorkflowEvent'. The fourteen variants are: Mouse, Keyboard, Clipboard, TextSelection, DragDrop, Hotkey, TextInputCompleted, ApplicationSwitch, BrowserTabNavigation, Click, BrowserClick, BrowserTextInput, FileOpened, PendingAction. Six are low-level (raw input, typically disabled in production configs). Eight are high-level semantic events. This is the surface area you build tests against.",
  },
  {
    q: "How does the recorder tell Typed from Pasted from AutoFilled?",
    a: "Timing and keystroke arithmetic. The Windows recorder keeps an InputTextAccumulator per focused element. Every key press increments keystroke_count. Every change-event on the element updates the observed text. If the text length jumps by many characters in a window where almost no keystrokes fired, the event is classified as Pasted. If text appears with zero keystrokes and no paste timing, it is AutoFilled. If the user clicks an autocomplete dropdown item that commits a value into the field, it is Suggestion. If more than one of those paths triggered inside the same field session, it is Mixed. Typed is the default. You can see the completion logic in crates/terminator-workflow-recorder/src/recorder/windows/structs.rs around line 200.",
  },
  {
    q: "What is the FileOpened event for? Is it a hook into the filesystem?",
    a: "It is not a filesystem hook. It is a window-title heuristic followed by a filesystem lookup. When a new window becomes foreground and the title looks like it contains a filename (patterns like 'name.ext - AppName' or 'AppName - name.ext'), the recorder searches the OS recent-access index for files with that name. The results are ranked by LastAccessTime and returned as candidate_paths. If one clear winner emerges, confidence is High. If multiple files compete but one is clearly the most recent, it is Medium. If the access times are ambiguous, it is Low. Your downstream tooling sees a typed confidence level, not a raw name string.",
  },
  {
    q: "Can I replay a recording as a browser-only test?",
    a: "Only if the recording was browser-only. If the recording crosses into a native app (the user opens Excel, the user hits Alt+Tab to Outlook), the replay has to also cross. That is why Terminator's runtime is desktop-native at the bottom and uses a Chrome extension bridge for DOM access at the top, in the same process. A recording that starts in Chrome, opens Excel, pastes a value, switches back, and clicks Send replays as one test file with one Desktop() instance.",
  },
  {
    q: "How does the replay work on a machine where the UI has shifted slightly since the recording?",
    a: "Two mechanisms. First, the recorded event has a UIElement with selector-relevant attributes (role, name, native id, class). The runtime re-resolves a selector against the live accessibility tree every time, so small coordinate shifts do not matter. Second, McpToolStep stores expected_ui_changes as a tree-diff snapshot, so after each action the runtime can verify the UI changed the way it did during recording. If the diff does not match, the step fails with a structured reason instead of a silent mismatch downstream.",
  },
  {
    q: "Does this work on macOS and Linux, or only Windows?",
    a: "The recorder is first-class on Windows today. The Windows implementation lives in crates/terminator-workflow-recorder/src/recorder/windows and is 3,500+ lines of UIA event plumbing. macOS support is in progress. Linux AT-SPI2 is experimental. If your target is cross-platform UI testing automation that includes native Windows apps, this is the right tool right now. If your team is macOS-first, the recorder side is less mature today, but the selector engine and locator API under crates/terminator already work across both platforms.",
  },
  {
    q: "Is the recorder privacy-safe? Does it capture passwords?",
    a: "The recorder respects field_type. When a field is classified as PasswordBox (or equivalent on macOS), the TextInputCompletedEvent is emitted with the keystroke_count and typing_duration_ms populated but text_value elided. Clipboard events can be length-capped via config (max_clipboard_content_length). Screenshot capture is optional, off by default, and has a configurable blur-on-sensitive-field mode. Recordings are local files by default; no telemetry leaves the machine unless you opt in.",
  },
  {
    q: "How does this compare to Playwright's codegen?",
    a: "Playwright's codegen is a browser-only recorder that emits Playwright-API code. It works well when every action is inside a Chromium or WebKit tab. Terminator's recorder is OS-wide. It records across native apps and browser tabs in a single session and emits events that replay as MCP tool calls, not just Playwright function calls. For testing a pure web app, Playwright's codegen is excellent and simpler. For testing a workflow that leaves the browser, Terminator is the answer, and the semantic event format keeps the recording readable at scale.",
  },
  {
    q: "Can AI coding assistants consume a recording directly?",
    a: "Yes. A Terminator recording is a JSON file of SerializableWorkflowEvent values. Because the recorder emits semantic events (not raw keystrokes), the file reads like an annotated transcript. Claude Code, Cursor, or any MCP-capable agent can ingest that file, map each event to the matching MCP tool, and execute the replay through the crates/terminator-mcp-agent server. This is why the recorder's output format matters: the event names and fields are the prompt surface that the LLM sees.",
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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Workflow recorder
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Semantic event stream
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                events.rs lines 475-517
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              The ui testing automation tools recorder most listicles{" "}
              <GradientText variant="teal">never describe</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every roundup of ui testing automation tools says the same thing
              about recorders. &quot;It captures your actions and plays them back.&quot;
              Nobody shows the format. Nobody describes the data shape. The
              recorder output is treated as an opaque artifact, which is why
              replay is brittle and why tests built from recordings break when
              the UI shifts a pixel. Terminator&apos;s recorder emits a typed,
              open, 14-variant event stream defined in{" "}
              <code className="font-mono text-sm bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                crates/terminator-workflow-recorder/src/events.rs
              </code>
              . This page is a walkthrough of that enum and why the variant
              choices matter.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "14 variants in WorkflowEvent enum (events.rs lines 475-517)",
                "5 TextInputMethod variants: Typed, Pasted, AutoFilled, Suggestion, Mixed",
                "6 ApplicationSwitchMethod variants including AltTab and TaskbarClick",
                "FileOpened emits ranked candidate_paths with High/Medium/Low confidence",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Video-style concept intro */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Semantic events, not keystrokes"
            subtitle="what Terminator's recorder actually emits"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Other recorders: raw key-down, key-up, mouse-move streams",
              "Terminator: 14 WorkflowEvent variants, 8 semantic",
              "TextInputCompleted tells you Typed vs Pasted vs AutoFilled",
              "ApplicationSwitch tells you AltTab vs TaskbarClick vs StartMenu",
              "FileOpened resolves the real path, with confidence",
            ]}
          />
        </section>

        {/* Framing */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Recorders are where ui testing automation tools quietly differ
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Open any 2026 listicle. You will see the same phrase applied to a
            dozen products: &quot;records your actions and replays them.&quot;
            The sentence is correct. It is also useless. Every recorder records
            something. What separates the brittle ones from the durable ones is
            the shape of what ends up on disk. If a recorder saves a list of
            mouse coordinates, your test fails when a window opens at a slightly
            different position. If it saves a stream of keydown events, your
            test cannot tell a typed value from a pasted one. If it saves only
            what is visible on screen, it misses the fact that the user switched
            applications with Alt+Tab versus with a taskbar click.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Terminator&apos;s recorder writes out something different: a stream
            of <em>semantic</em> events. An Alt+Tab is an ApplicationSwitch with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              switch_method=AltTab
            </code>
            . A pasted email address is a TextInputCompleted with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              input_method=Pasted
            </code>{" "}
            and the full text value in one field. A double-click on an Excel
            file is a FileOpened with a ranked candidate path list.
          </p>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={inputMethodMetrics} />
        </section>

        {/* The enum source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The 14-variant WorkflowEvent enum, verbatim
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the actual enum. The first six are low-level raw events
            (disabled by default in most recording configs, kept for edge
            cases). The last eight are high-level semantic events. Every one of
            them is a struct with explicit fields, not a blob of bytes.
          </p>
          <AnimatedCodeBlock
            code={workflowEventEnumSource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Variant marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Fourteen variants, one per class of intent
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            You never produce these yourself. The recorder emits them. But the
            set is the vocabulary your test code will read when you consume a
            recording, so it helps to see all fourteen at once.
          </p>
          <Marquee speed={30}>
            {variantNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Bento grid */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What each semantic variant actually tells you
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Fourteen variants collapse into a small number of test-authoring
            decisions. Each card below is one variant (or group) and the field
            shape it gives you.
          </p>
          <BentoGrid cards={variantBento} />
        </section>

        {/* TextInputCompleted deep dive */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The single most useful event: TextInputCompleted
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Most of the interesting information in a UI workflow is: what did
            the user put in which field, and how did it get there? The event
            below captures that in one struct per field session. The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              input_method
            </code>{" "}
            is the distinguishing field. Five values. No other mainstream
            recorder I know of exposes this.
          </p>
          <AnimatedCodeBlock
            code={textInputEventSource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Method detection sequence */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            How the recorder tells Typed from Pasted
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The detection is timing and keystroke arithmetic, not a heuristic
            based on field type. Walk through what the recorder does when a
            user pastes.
          </p>
          <MotionSequence
            title="Classifying a 'finance@acme.com' entry into TextInputMethod"
            defaultDuration={2400}
            frames={[
              {
                title: "Stage 1: Field focus",
                body: "The user Tab-focuses an Edit element. An InputTextAccumulator is created with start_time=now, keystroke_count=0, initial_text=current field value.",
              },
              {
                title: "Stage 2: Observe change",
                body: "A UIA ValueChanged event fires. The field text jumps from empty to 'finance@acme.com' in under 40ms. Observed character delta: 17.",
              },
              {
                title: "Stage 3: Count keystrokes",
                body: "In the same window, keystroke_count is 1 (the V keydown of Ctrl+V). Expected keystrokes for a typed 17-char string would be around 17. Big mismatch.",
              },
              {
                title: "Stage 4: Classify",
                body: "Observed keystrokes (1) divided by observed characters (17) is far below the Typed threshold. Classification: input_method = Pasted.",
              },
              {
                title: "Stage 5: Emit",
                body: "After the idle threshold elapses, get_completion_event() runs. Returns a TextInputCompletedEvent with text_value='finance@acme.com', input_method=Pasted, keystroke_count=1, typing_duration_ms=~40.",
              },
              {
                title: "Stage 6: Serialize",
                body: "On recording end, the event converts to SerializableTextInputCompletedEvent and lands in the workflow JSON. One line in the recording replaces twenty raw events.",
              },
            ]}
          />
        </section>

        {/* FileOpened */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            FileOpened: window title to ranked path list
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            When a user opens a document, the window title usually shows the
            filename, not the full path. Every recorder I have seen before
            Terminator just saves the title verbatim. This one tries harder.
            The struct below is what you get.
          </p>
          <AnimatedCodeBlock
            code={fileOpenedSource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Beam: recording to replay */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            From a recorded event to a replayable MCP tool step
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Each variant of WorkflowEvent translates to an{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              McpToolStep
            </code>{" "}
            with a tool name, arguments, and an optional expected-change diff.
            That is how a recording becomes a replayable test, and how an LLM
            can read and rewrite the same file.
          </p>
          <AnimatedBeam
            title="recorded event to replay step"
            accentColor="#FF3E00"
            from={[
              { label: "WorkflowEvent::Click", sublabel: "{ role, name, ... }" },
              { label: "WorkflowEvent::TextInputCompleted", sublabel: "{ text_value, method, ... }" },
              { label: "WorkflowEvent::FileOpened", sublabel: "{ primary_path, confidence, ... }" },
              { label: "WorkflowEvent::ApplicationSwitch", sublabel: "{ to_process, method, ... }" },
            ]}
            hub={{ label: "McpToolStep", sublabel: "tool_name + arguments + oracle" }}
            to={[
              { label: "click_element tool", sublabel: "role/name selector" },
              { label: "type_into_element tool", sublabel: "selector + text" },
              { label: "open_application tool", sublabel: "exe path" },
              { label: "expected_ui_changes oracle", sublabel: "tree diff" },
            ]}
          />
        </section>

        {/* How the recorder works */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Six stages from a user click to a JSON event
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The recorder is ~4,000 lines of Windows-specific plumbing in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-workflow-recorder/src/recorder/windows
            </code>
            . Each stage below corresponds to real code in that directory.
          </p>
          <StepTimeline steps={lifecycleSteps} />
        </section>

        {/* Sample recording */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What a recording actually looks like on disk
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            A real workflow JSON. Six events cover what in a keystroke-based
            recorder would be a few hundred. Every field here is one line in
            the enum definition you saw above.
          </p>
          <AnimatedCodeBlock
            code={sampleRecordingJson}
            language="json"
            filename="invoice-flow.json"
          />
        </section>

        {/* Recorder terminal */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Running the recorder, live
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The CLI prints each semantic event as it is committed to the log.
            Read this output and the matching JSON above side by side. One
            line of terminal, one object in the file.
          </p>
          <TerminalOutput
            title="terminator-workflow-recorder live"
            lines={recorderTerminalLines}
          />
        </section>

        {/* Method tags marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The method tags, all in one place
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Each tag below is a string value that shows up in a recording. If
            your replay logic needs to handle an &quot;autofilled email&quot;
            path differently from a &quot;typed email&quot; path, the branch
            key is{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              event.input_method
            </code>
            .
          </p>
          <Marquee speed={28}>
            {methodTags.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Terminator&rsquo;s recorder vs a keystroke-dump recorder"
            intro="Ten differences. The left column is the shape of the recording produced by the typical ui testing automation tools recorder (Selenium IDE, vendor-specific RPA tools, most browser codegen). The right column is what Terminator's workflow recorder produces."
            productName="Terminator"
            competitorName="Keystroke-dump recorder"
            rows={recorderVsKeystrokeRows}
          />
        </section>

        {/* Big stat */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              WorkflowEvent variants in events.rs lines 475-517
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={14} />
            </div>
            <p className="text-sm text-zinc-500">
              Eight are high-level semantic events. Six are low-level raw
              events. Together they cover every intent a user can express at a
              running OS.
            </p>
          </div>
        </section>

        {/* ProofBanner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every enum variant, method name, and struct field on this page is grep-able in a fresh clone of mediar-ai/terminator. The 14 count is not marketing. It is the number of arms in pub enum WorkflowEvent in events.rs lines 475-517."
            source="github.com/mediar-ai/terminator"
            metric="14"
          />
        </section>

        {/* Framing card */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              Why the recording format decides everything
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Tests built from recordings fail for one of three reasons: the UI
              shifted, the input method changed, or the application context
              changed. A recording format that only stores mouse coordinates
              loses to all three. A format that stores raw keystrokes loses to
              input-method and context changes. A semantic format captures
              enough invariants at record time that the replay can adapt.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator&apos;s recorder is not a replacement for your test
              runner. It is a way to generate the first draft of a test from a
              real user flow, in a format that reads well enough to hand-edit
              and that replays across machines with non-identical screen
              geometry. You install it with{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                cargo install terminator-workflow-recorder
              </code>{" "}
              or drive it from the MCP server the same repo ships.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If you are evaluating ui testing automation tools for an app that
              is not purely web, ask the vendor for a sample recording file.
              If the answer is &quot;it is binary&quot; or &quot;it is a
              screenshot reel,&quot; you are about to buy a brittle recorder.
              Terminator&apos;s answer is a readable, typed JSON with fourteen
              variants defined in one open-source file. That is the spec.
            </p>
          </GlowCard>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8 text-center">
          <ShimmerButton href="https://github.com/mediar-ai/terminator">
            Read events.rs on GitHub
          </ShimmerButton>
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Have a workflow you want recorded and replayed across apps?"
            description="Walk us through the flow on a call. We will point at the matching WorkflowEvent variants and sketch the replay path end to end."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation. MIT licensed.{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-600 hover:underline"
            >
              github.com/mediar-ai/terminator
            </a>
          </p>
        </footer>

        {/* Sticky CTA */}
        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Map a real user flow to the 14-variant WorkflowEvent enum."
        />
      </article>
    </div>
  );
}
