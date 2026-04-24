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
  BentoGrid,
  CodeComparison,
  BeforeAfter,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-script";
const PUBLISHED = "2026-04-23";
const TITLE =
  "A Windows automation script you record instead of write: 14 semantic event types, replayable against the accessibility tree";
const DESCRIPTION =
  "Every other guide on this topic tells you to type a PowerShell or AutoHotkey script. Terminator's workflow recorder captures one instead. The recorded JSON is the script: 14 high-level event types, each one a Click with interaction_type, a TextInputCompleted with keystroke_count, a FileOpened with confidence and candidate_paths, a recorded ApplicationSwitch with switch_method. Source: crates/terminator-workflow-recorder/src/events.rs:475.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Perform the workflow once on your real desktop. The recorder serializes 14 semantic event variants tied to accessibility-tree elements, not pixel coordinates. The JSON replays through the same MCP loop, and Claude Code patches the one step that breaks.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A Windows automation script you record, not write",
    description:
      "14 semantic event types. ButtonClick, TextInputCompleted, FileOpened, ApplicationSwitch. Each one bound to an accessibility-tree element. Replay survives a UI redesign because the script never knew about pixel 612, 419 in the first place.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows automation script" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows automation script", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does Terminator emit 14 event types when AutoHotkey only records keystrokes and mouse moves?",
    a: "Because keystrokes and mouse moves are the wrong abstraction for replay. They tell you what the user did with their hands. They do not tell you what the user did with the application. Terminator's recorder lifts both into 14 high-level WorkflowEvent variants (events.rs line 475): Mouse, Keyboard, Clipboard, TextSelection, DragDrop, Hotkey, TextInputCompleted, ApplicationSwitch, BrowserTabNavigation, Click, BrowserClick, BrowserTextInput, FileOpened, PendingAction. The interesting ones are the high-level kind. A 'Click' is not a coordinate, it is a ClickEvent struct (events.rs line 345) with element_text, element_role, was_enabled, an interaction_type discriminator (Click, Toggle, DropdownToggle, Submit, Cancel), and a metadata pointer to the actual UIA element. Replay does not need to know where the Save button was on screen yesterday. It only needs to find a button whose accessible name is Save in the same window.",
  },
  {
    q: "What does TextInputCompleted give me that recording every keystroke does not?",
    a: "Aggregation. Recording one keystroke at a time produces a script that types K-E-Y-D-O-W-N K-E-Y-D-O-W-N K-E-Y-D-O-W-N when what actually happened semantically was 'the user typed hello into the search box.' TextInputCompletedEvent (events.rs line 977) collapses a typing session into a single event with text_value (the final string), keystroke_count (how many physical keys were pressed), typing_duration_ms (how long the typing took), input_method (Typed, Pasted, AutoFilled, Suggestion, Mixed), focus_method (how the field got focus before input started), field_name, field_type (TextBox, PasswordBox, SearchBox), and a process_name. Replay sets the text directly through UI Automation. The replay does not retype every key, which means it does not race the application's input handler.",
  },
  {
    q: "How does the recorder know a file was opened?",
    a: "It watches window titles and searches the file system. FileOpenedEvent (events.rs line 1155) carries the filename extracted from the window title, a primary_path (the most likely file location), candidate_paths sorted by NTFS LastAccessTime, a confidence enum (FilePathConfidence), the application_name, the process_id, the file_extension, the search_time_ms (how long the lookup took, in milliseconds), and the full window_title the filename was extracted from. So opening todolist-backup.txt in Notepad becomes a FileOpened event with the resolved path, not a Win+R run dialog macro that has to recreate the navigation by hand.",
  },
  {
    q: "How is an ApplicationSwitch event different from just recording Alt+Tab?",
    a: "Six switch methods, not one. ApplicationSwitchMethod (events.rs line 1003) discriminates AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, and Other. ApplicationSwitchEvent (line 1020) records from_window_and_application_name, to_window_and_application_name, from_process_name, to_process_name, from_process_id, to_process_id, switch_method, dwell_time_ms (how long you stayed in the previous app), and switch_count for rapid Alt+Tab cycling. On replay you can switch via the same method, or pick a different one, because the script knows what was being switched away from and what was being switched to as named entities. Recording 'Alt key down, Tab key down, Tab key up, Alt key up' tells the replay engine nothing about which window you wanted to land in.",
  },
  {
    q: "How do I run the recorder?",
    a: "It ships as an example binary in the workflow-recorder crate. From the Terminator repo: `cargo run --example record_workflow`. The example sets enable_highlighting=true, highlight_color=0x00FF00 (green BGR), highlight_duration_ms=800, and prints each event to stdout as it lands. Recording runs for 20 seconds by default. The default `WorkflowRecorderConfig` records mouse, keyboard, clipboard, hotkeys, text-input completion, application switches, browser navigation, file opens, and UI focus/property changes. You can flip individual capture flags off if a workflow does not need them. The Windows recorder source itself lives at crates/terminator-workflow-recorder/src/recorder/windows/mod.rs and is currently 3,581 lines.",
  },
  {
    q: "What format is the saved script in, and how do I replay it?",
    a: "JSON. Each event has a Serializable* counterpart that strips runtime types and writes a flat schema (SerializableMouseEvent, SerializableKeyboardEvent, SerializableTextInputCompletedEvent, etc., declared at events.rs lines 1360 through 1690). The full stream is a SerializableWorkflowEvent enum (line 1677). To replay, hand the JSON to a workflow runner: `terminator mcp run recorded.yml` from @mediar-ai/cli, or load the events into the @mediar-ai/workflow SDK and convert each event into a step. Selectors are derived from the metadata.ui_element field on each event (role, name, AutomationId, application name) so the replay does not depend on screen geometry.",
  },
  {
    q: "What happens when the UI changes between recording and replay?",
    a: "The script tries the recorded selector. If the element is gone or the name changed, the MCP loop calls get_window_tree on the current window, hands the fresh accessibility-tree JSON to the LLM, and asks for a replacement selector. The retry runs the patched step, then continues the rest of the script. This is why the script being a bag of semantic events matters: the LLM only has to repair one event at a time, not rewrite a coordinate-based macro from scratch. A keystroke-and-pixel recorder cannot offer that recovery loop because there is no semantic name to match against.",
  },
  {
    q: "Can the recorder distinguish typed input from pasted input from autofill?",
    a: "Yes. TextInputMethod (events.rs line 948) is a five-variant enum: Typed (each character came from a key event), Pasted (clipboard paste), AutoFilled (the field arrived populated by the platform), Suggestion (the user accepted an inline suggestion), Mixed (some combination). FieldFocusMethod is recorded separately. The replay engine uses the input_method to pick a strategy: Typed reproduces the keystrokes, Pasted writes to the clipboard and triggers Ctrl+V, AutoFilled skips the input entirely if the application restores it on next load. This level of intent classification is what makes replay survive small UI changes that would tear a key-by-key macro apart.",
  },
  {
    q: "Does this only work on Windows?",
    a: "The recorder ships full coverage on Windows because it sits on top of Microsoft UI Automation, which is the most complete accessibility stack of the three platforms Terminator supports. The Windows-specific recorder is `crates/terminator-workflow-recorder/src/recorder/windows/mod.rs` (3,581 lines). The supporting structs are in `windows/structs.rs` (672 lines). macOS and Linux replay paths exist for the action side of Terminator (the click, type, locate primitives), but the recorder is Windows-first today. If you need cross-platform recording, the recommended path is to author workflows in TypeScript with @mediar-ai/workflow and run them through the MCP agent, which is what most teams do anyway.",
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
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const recordTerminal = [
  { text: "# clone, build, and start the live recorder", type: "output" as const },
  {
    text: "git clone https://github.com/mediar-ai/terminator && cd terminator",
    type: "command" as const,
  },
  {
    text: "cargo run --example record_workflow",
    type: "command" as const,
  },
  {
    text: "[INFO] Comprehensive workflow recording started!",
    type: "info" as const,
  },
  {
    text: "BUTTON CLICK 1: \"Save\" (Submit) Position: (1612, 78)",
    type: "output" as const,
  },
  {
    text: "     element_role: Button   was_enabled: true",
    type: "output" as const,
  },
  {
    text: "     app: WINWORD.EXE   interaction_type: Submit",
    type: "output" as const,
  },
  {
    text: "TEXT INPUT COMPLETED 2: \"Q1 invoice ingest\" (17 keystrokes in 4120ms)",
    type: "output" as const,
  },
  {
    text: "     field: \"File name\" (TextBox)   method: Typed",
    type: "output" as const,
  },
  {
    text: "FILE OPENED 3: q1_invoices.xlsx   confidence: High",
    type: "output" as const,
  },
  {
    text: "     primary_path: C:\\Users\\matt\\Documents\\Q1\\q1_invoices.xlsx",
    type: "output" as const,
  },
  {
    text: "     application: EXCEL.EXE   search_time_ms: 12.4",
    type: "output" as const,
  },
  {
    text: "APPLICATION SWITCH 4: WINWORD.EXE -> EXCEL.EXE   method: AltTab",
    type: "output" as const,
  },
  {
    text: "     dwell_time_ms: 8412",
    type: "output" as const,
  },
  {
    text: "Recording complete. 4 semantic events captured.",
    type: "success" as const,
  },
];

const recordedJsonExcerpt = `// recorded.json (excerpt, one of 14 event types)
{
  "TextInputCompleted": {
    "text_value": "Q1 invoice ingest",
    "field_name": "File name",
    "field_type": "TextBox",
    "input_method": "Typed",
    "focus_method": "Click",
    "typing_duration_ms": 4120,
    "keystroke_count": 17,
    "process_name": "WINWORD.EXE",
    "metadata": {
      "ui_element": {
        "role": "edit",
        "name": "File name",
        "application_name": "Microsoft Word",
        "automation_id": "FileNameTextBox",
        "process_id": 19284
      },
      "timestamp": 1745421831409
    }
  }
}

// versus a coordinate-based recorder (AutoHotkey-style):
// MouseClick, Left, 612, 419
// Send Q1 invoice ingest
//
// the second one tells you nothing about
// what the user actually meant. it breaks
// the moment the dialog moves five pixels.`;

const replayTs = `// replay.ts — runs a recorded JSON file
// through the same MCP machinery that ships
// with terminator-mcp-agent.
import { runRecordedWorkflow } from "@mediar-ai/workflow";
import recorded from "./q1_ingest.json";

await runRecordedWorkflow(recorded, {
  // Type-safe overrides per event.
  onTextInput: (event) => ({
    selector: \`role:edit && name:\${event.field_name}\`,
    method: event.input_method, // Typed / Pasted / Mixed
  }),
  onClick: (event) => ({
    selector: \`role:\${event.element_role} && name:\${event.element_text}\`,
    interaction: event.interaction_type, // Submit / Toggle / etc.
  }),
  // If a selector goes stale, the MCP loop dumps a
  // fresh window tree to the LLM and asks for a
  // patched selector. The recovery is event-by-event,
  // not whole-script-rewrite.
  onMissingElement: "patch_with_llm",
});`;

const eventsBento: BentoCard[] = [
  {
    title: "Click",
    description:
      "ClickEvent at events.rs:345. element_text, element_role, was_enabled, child_text_content, plus an interaction_type that splits into 5 variants.",
    size: "2x1",
    accent: true,
  },
  {
    title: "TextInputCompleted",
    description:
      "Aggregates a typing session. text_value, keystroke_count, typing_duration_ms, input_method (Typed | Pasted | AutoFilled | Suggestion | Mixed).",
  },
  {
    title: "FileOpened",
    description:
      "Watches window titles, resolves the file path. primary_path, candidate_paths sorted by LastAccessTime, confidence, search_time_ms.",
  },
  {
    title: "ApplicationSwitch",
    description:
      "switch_method covers AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, Other. dwell_time_ms records how long you stayed in the previous app.",
  },
  {
    title: "BrowserTabNavigation",
    description:
      "from_url, to_url, from_title, to_title, page_dwell_time_ms. Distinguishes KeyboardShortcut, TabClick, NewTabButton, AddressBar, LinkNewTab.",
    size: "2x1",
  },
  {
    title: "Hotkey",
    description:
      "Records the chord (Ctrl+S, Win+L) plus the action that resulted, when the system can name it.",
  },
  {
    title: "Clipboard",
    description:
      "Cut, copy, paste, with content preview. The replay can branch on what was on the clipboard at record time.",
  },
  {
    title: "TextSelection",
    description:
      "Length, content preview, selection_method. Useful for replays that need to reselect a region before acting on it.",
  },
  {
    title: "DragDrop",
    description:
      "start_position, end_position, plus the source UI element under the cursor when the drag began.",
  },
  {
    title: "Mouse / Keyboard / PendingAction",
    description:
      "Low-level events kept available for diagnostics, but high-level events take precedence when both fire on the same input.",
    size: "2x1",
  },
];

const recordVsWriteBefore = `; autohotkey_v2.ahk
; recorded with the AHK macro recorder
; or hand-written by a sysadmin in 2008.
;
Run "EXCEL.EXE"
Sleep 1500
WinActivate "Excel"
Click 612, 78        ; toolbar Save button
Sleep 200
Send "{Tab 3}"       ; navigate to file name field
Send "Q1 invoice ingest"
Sleep 100
Click 1054, 619      ; Save button on the Save dialog
;
; brittle. layout shifts ten pixels?
; pinned tab? high DPI? broken.`;

const recordVsWriteAfter = `// recorded.json (Terminator workflow recorder)
// 14 semantic events, each tied to an
// accessibility-tree element rather than a pixel.
//
// 1. ApplicationSwitch  to EXCEL.EXE  via TaskbarClick
// 2. Click              "Save"        Submit, role:Button
// 3. TextInputCompleted "Q1 invoice"  field:File name
// 4. Click              "Save"        Submit, role:Button
//
// replay finds elements by name + role.
// dialog moves? still works.
// localized to French? still works
// (UIA names map across locales when
//  the developer wired LocalizedRole).`;

const flowSteps = {
  title: "From hand to JSON to replay",
  from: [
    { label: "Your hands on the keyboard", sublabel: "click Save, type a filename, Alt+Tab to Excel" },
    { label: "WinUI Automation events", sublabel: "raw COM stream from the OS" },
    { label: "Recorder normalization", sublabel: "windows/mod.rs, 3,581 lines" },
  ],
  hub: {
    label: "14 WorkflowEvent variants",
    sublabel: "events.rs:475, with full UI element metadata",
  },
  to: [
    { label: "recorded.json", sublabel: "SerializableWorkflowEvent stream" },
    { label: "@mediar-ai/workflow", sublabel: "typed step-based replay" },
    { label: "terminator-mcp-agent", sublabel: "MCP execute_sequence on the JSON" },
    { label: "Claude Code recovery", sublabel: "patches one stale selector at a time" },
  ],
};

const stepTimeline = [
  {
    title: "Run the recorder",
    description:
      "cargo run --example record_workflow inside the Terminator repo. The recorder paints a green outline around every UI element it captures, so you can see in real time what was tied to each event.",
  },
  {
    title: "Perform the workflow once",
    description:
      "Click the buttons, type the values, drag the files, switch the apps. Every action lands as a high-level event with the surrounding UI metadata. Recording wraps after 20 seconds in the example binary; programmatic use lets you stop on a hotkey or a custom condition.",
  },
  {
    title: "Inspect the JSON",
    description:
      "Each event is a tagged variant with a full metadata block. The metadata.ui_element field contains the role, name, AutomationId, application name, and process id of the element that received the action. That is the part the replay engine matches on, not pixel coordinates.",
  },
  {
    title: "Hand it to the replay engine",
    description:
      "Either run it directly through @mediar-ai/cli (terminator mcp run recorded.yml) or load it into @mediar-ai/workflow as a typed sequence. Both paths share the same selector resolver and both can call into the MCP agent for recovery when an element has moved.",
  },
  {
    title: "Patch with the LLM, do not re-record",
    description:
      "When a replay step fails because a button was renamed, the MCP loop dumps the fresh window tree to Claude Code and asks for a new selector. The patched step runs, the rest of the script continues. This is the loop that lets a recorded workflow survive a UI redesign without being recaptured from scratch.",
  },
];

const wrapperPills = [
  "WorkflowEvent (14 variants)",
  "ButtonInteractionType (5)",
  "ApplicationSwitchMethod (6)",
  "TabNavigationMethod (6)",
  "TextInputMethod (5)",
  "FilePathConfidence",
  "FieldFocusMethod",
  "SerializableWorkflowEvent",
  "PendingActionType (3)",
  "MouseEventType",
  "EventMetadata",
  "UIElement (role, name, AutomationId)",
];

const sequenceFrames = [
  {
    title: "1. The user clicks Save in Excel",
    body: (
      <p className="text-sm text-zinc-600">
        UI Automation fires an Invoke event on a Button element with name=&quot;Save&quot;
        and role=&quot;Button&quot; inside process EXCEL.EXE.
      </p>
    ),
    duration: 2200,
  },
  {
    title: "2. The recorder lifts it to a ClickEvent",
    body: (
      <p className="text-sm text-zinc-600">
        events.rs:345. interaction_type=Submit (because the button is the dialog&apos;s
        default action). element_text=&quot;Save&quot;, was_enabled=true,
        relative_position is captured for table-row clicks.
      </p>
    ),
    duration: 2400,
  },
  {
    title: "3. The event is serialized",
    body: (
      <p className="text-sm text-zinc-600">
        SerializableClickEvent ships a flat schema that survives JSON round-trip
        without losing the metadata.ui_element block.
      </p>
    ),
    duration: 2200,
  },
  {
    title: "4. Replay rebuilds the click",
    body: (
      <p className="text-sm text-zinc-600">
        The runner reads role + name + application_name, queries the live
        accessibility tree for a match, and sends an Invoke. No coordinate ever
        leaves the JSON.
      </p>
    ),
    duration: 2400,
  },
  {
    title: "5. The same script runs tomorrow",
    body: (
      <p className="text-sm text-zinc-600">
        Even if the Save button moves to a new toolbar position. Even if Excel
        ships a new ribbon. The match is on what the element is, not where it was.
      </p>
    ),
    duration: 2600,
  },
];

const sourceTreeCode = `// crates/terminator-workflow-recorder/src/events.rs
// line 475

pub enum WorkflowEvent {
    Mouse(MouseEvent),
    Keyboard(KeyboardEvent),
    Clipboard(ClipboardEvent),
    TextSelection(TextSelectionEvent),
    DragDrop(DragDropEvent),
    Hotkey(HotkeyEvent),
    TextInputCompleted(TextInputCompletedEvent),
    ApplicationSwitch(ApplicationSwitchEvent),
    BrowserTabNavigation(BrowserTabNavigationEvent),
    Click(ClickEvent),
    BrowserClick(BrowserClickEvent),
    BrowserTextInput(BrowserTextInputEvent),
    FileOpened(FileOpenedEvent),
    PendingAction(PendingActionEvent),
}`;

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
          You don&apos;t write a Windows automation script.{" "}
          <GradientText>You record one.</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every other guide on this topic opens an editor and starts typing
          PowerShell, AutoHotkey, or AutoIt. Terminator inverts the order. You
          perform the workflow once on your real desktop. The recorder serializes
          fourteen high-level event types, each one tied to an accessibility-tree
          element rather than a pixel coordinate. The JSON that comes back is
          the script. Replay runs against UI Automation, not against
          screen geometry, so the recording survives a UI redesign that would
          shred a key-and-pixel macro.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="design partners running recorded workflows in production"
        highlights={[
          "14 WorkflowEvent variants in events.rs:475",
          "3,581 lines of Windows recorder in windows/mod.rs",
          "JSON replays through the same MCP agent that ships with Terminator",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Record. Don't write."
            subtitle="A Windows automation script as a stream of semantic events, not a string of keystrokes."
            captions={[
              "14 high-level event variants",
              "ButtonClick: 5 interaction types",
              "TextInputCompleted: collapses keystrokes",
              "FileOpened: confidence + candidate paths",
              "Replay binds to the accessibility tree",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The thing every other write-up skips
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Most writing on this topic teaches you a syntax. PowerShell for
          services, AutoHotkey for hotkeys, AutoIt for window control. They are
          all useful for what they are. None of them addresses the part of the
          job that gets expensive in production: the script that worked
          yesterday breaks today because a button moved. A recorded macro that
          knows the Save button as &quot;the click at coordinate (612, 78)&quot;
          has nothing to fall back on.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Terminator&apos;s workflow recorder solves that by recording at a
          higher altitude. The unit of capture is not a key event. It is a
          tagged variant of an enum named WorkflowEvent, defined as fourteen
          discrete event types in one file. The most useful seven of those are
          high-level semantic events: ClickEvent with an interaction_type that
          splits into Click, Toggle, DropdownToggle, Submit, Cancel.
          TextInputCompletedEvent that aggregates a whole typing session into a
          single text_value with keystroke_count and typing_duration_ms.
          FileOpenedEvent that watches window titles and resolves the file path
          on disk with a confidence score. ApplicationSwitchEvent with a
          switch_method enum so replay can pick a different method if Alt+Tab
          is unavailable. The replay engine consumes those structs and walks
          the accessibility tree, not the screen.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <BeforeAfter
          title="The same task, recorded two different ways"
          before={{
            label: "Coordinate-based recorder",
            content: recordVsWriteBefore,
            highlights: [
              "Hard-coded screen coordinates (612, 78) and (1054, 619)",
              "Replay assumes the dialog never moves",
              "Localization breaks the script (different text)",
              "High-DPI changes shift the entire layout",
            ],
          }}
          after={{
            label: "Terminator semantic recorder",
            content: recordVsWriteAfter,
            highlights: [
              "Each event is bound to a UIA element, not a pixel",
              "Replay finds Save by role + name, not coordinates",
              "Survives ribbon and toolbar reflows",
              "Works across locales when the app exposes LocalizedRole",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The fourteen variants, and what is in each
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Pulled from the WorkflowEvent enum at
          crates/terminator-workflow-recorder/src/events.rs line 475. Read the
          file directly if you want the field-level definitions. Each event
          carries an EventMetadata block with the originating UI element and a
          timestamp. The high-level events live above the low-level ones in the
          same enum, which is what makes the JSON replayable instead of just
          watchable.
        </p>
        <BentoGrid cards={eventsBento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What you see when you start the recorder
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The example binary in the workflow-recorder crate prints every event
          to stdout as it lands. This is the live output during a 20-second
          capture of a Word-then-Excel workflow. Notice how each line is a named
          event with structured fields, not a raw key code or pixel pair.
        </p>
        <TerminalOutput lines={recordTerminal} title="cargo run --example record_workflow" />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The pipeline, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Your hands move. The OS fires UI Automation events. The recorder
          normalizes them into one of fourteen WorkflowEvent variants and
          attaches the surrounding UI element metadata. The events stream into
          a SerializableWorkflowEvent JSON file. From there, three replay
          surfaces share the same selector resolver: the CLI, the typed
          workflow SDK, and the MCP agent. The MCP agent is the one Claude Code
          calls when it needs to patch a stale selector mid-replay.
        </p>
        <AnimatedBeam
          from={flowSteps.from}
          hub={flowSteps.hub}
          to={flowSteps.to}
          title={flowSteps.title}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MotionSequence
          title="What replay actually does for one click"
          frames={sequenceFrames}
          defaultDuration={2400}
          loop={true}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The numbers that hold this up
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every claim on this page lands in a specific source file. The numbers
          below are line counts, variant counts, and timing constants pulled
          from the Terminator repo as of this writing.
        </p>
        <MetricsRow
          metrics={[
            { value: 14, label: "WorkflowEvent variants" },
            { value: 5, label: "ButtonInteractionType variants" },
            { value: 6, label: "ApplicationSwitchMethod variants" },
            { value: 3581, label: "Lines in windows/mod.rs" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The single source line everything else is built on
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          This is the enum that defines what a recorded Windows automation script
          can be. Open the file at line 475 to see the same thing on disk. The
          high-level variants (Click, TextInputCompleted, FileOpened,
          ApplicationSwitch, BrowserTabNavigation) are the ones that make replay
          robust. The low-level variants stay around because some workflows
          really do need raw mouse coordinates.
        </p>
        <AnimatedCodeBlock
          code={sourceTreeCode}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          One event at a glance
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Here is what a single TextInputCompleted event looks like in the
          recorded JSON. Compare the bottom of the file: a coordinate-based
          recorder for the same action would have nothing to say about the
          field name, the typing duration, or the input method.
        </p>
        <AnimatedCodeBlock
          code={recordedJsonExcerpt}
          language="json"
          filename="recorded.json"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The five steps from hand to script
        </h2>
        <StepTimeline steps={stepTimeline} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Replaying the JSON
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The replay surface is a typed runner. You can override how each event
          type resolves to a selector or a low-level action. The recovery hook
          (onMissingElement: &quot;patch_with_llm&quot;) is the loop that lets a
          stale selector be repaired by Claude Code at runtime, one event at a
          time, instead of forcing you to record the workflow again from scratch.
        </p>
        <AnimatedCodeBlock
          code={replayTs}
          language="typescript"
          filename="replay.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Type names you will run into
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A short tour of the type vocabulary. All declared in
          terminator-workflow-recorder/src/events.rs. The fourteen-variant outer
          enum is the spine; the inner enums (interaction type, switch method,
          tab navigation method, text input method) are how the recorder
          classifies what the user actually meant.
        </p>
        <Marquee speed={50} pauseOnHover>
          {wrapperPills.map((label) => (
            <div
              key={label}
              className="px-4 py-2 mx-2 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-sm font-mono whitespace-nowrap"
            >
              {label}
            </div>
          ))}
        </Marquee>
      </section>

      <ProofBanner
        quote={
          "events.rs ships 14 WorkflowEvent variants. windows/mod.rs is 3,581 lines. " +
          "Both numbers are checkable in the public Terminator repo."
        }
        source="crates/terminator-workflow-recorder/src/"
        metric="14"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <GlowCard>
          <div className="p-8">
            <h3 className="text-2xl font-semibold text-zinc-900 mb-3">
              Why this matters for AI coding assistants
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              A recorded script with semantic events is cheap for a model to
              repair. The model only needs to see one event&apos;s context plus
              the current accessibility tree to propose a new selector. A
              keystroke-and-pixel macro is expensive to repair: the model has to
              re-derive the entire intent from a sequence of low-level signals.
              That is the practical reason Terminator&apos;s recorder lifts the
              capture into{" "}
              <NumberTicker value={14} /> high-level event types in the first
              place. It is not for human readability. It is so the recovery loop
              has something to work with.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              The same MCP agent that records the workflow can replay it, patch
              it, and run it on a different machine. One npx install, then the
              full loop fits inside Claude Code, Cursor, VS Code, or Windsurf.
            </p>
          </div>
        </GlowCard>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see a recorded workflow replay against your own desktop?"
        description="Record one of your team's workflows on a call. We replay it through the MCP agent and walk through the recovery loop live."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Record once, replay everywhere. Book 15 minutes."
      />
    </article>
  );
}
