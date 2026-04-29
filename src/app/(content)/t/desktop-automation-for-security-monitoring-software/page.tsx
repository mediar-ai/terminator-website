import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ProofBanner,
  SequenceDiagram,
  CodeComparison,
  AnimatedChecklist,
  BeforeAfter,
  GlowCard,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/desktop-automation-for-security-monitoring-software";
const PUBLISHED = "2026-04-29";
const TITLE =
  "Desktop monitoring automation for security software: a typed-event SDK, not another EDR feature matrix";
const DESCRIPTION =
  "Pages on this phrase pitch closed-source EDR/DLP feature matrices. None give a developer who is building or red-teaming desktop security software a typed event stream they can subscribe to. Terminator's terminator-workflow-recorder crate emits 14 typed WorkflowEvent variants, each fused with UIAutomation/AX context, broadcast over a tokio channel with a 1000-event buffer. Source: crates/terminator-workflow-recorder/src/events.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "FileOpenedEvent does a filesystem search on the window title and emits filename, primary_path, candidate_paths, FilePathConfidence (High/Medium/Low), process_id, and search_time_ms. Sysmon EventID 11 cannot tie a file write back to the UI element that triggered it. This can.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A typed-event SDK for desktop security tooling",
    description:
      "14 WorkflowEvent variants. broadcast::channel buffer = 1000. PerformanceMode::LowEnergy throttles to 10 events/sec for an always-on monitoring agent. Open source under MIT.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop monitoring automation for security software" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Desktop monitoring automation for security software",
    url: PAGE_URL,
  },
];

const eventVariants = [
  {
    text: "Mouse(MouseEvent) — type, button, position, scroll_delta, drag_start, plus EventMetadata with the resolved UIElement under the cursor",
    checked: true,
  },
  {
    text: "Keyboard(KeyboardEvent) — keystrokes filtered through track_modifier_states so Ctrl, Alt, Shift come back as flags rather than separate events",
    checked: true,
  },
  {
    text: "Clipboard(ClipboardEvent) — Copy/Cut/Paste/Clear, content (truncated at max_clipboard_content_length, default 10240 bytes), content_size, format, plus the UI element that owned focus at the time",
    checked: true,
  },
  {
    text: "TextSelection(TextSelectionEvent) — selected_text, start_position, end_position, selection_method (MouseDrag, DoubleClick, TripleClick, KeyboardShortcut, ContextMenu)",
    checked: true,
  },
  {
    text: "DragDrop(DragDropEvent) — start and end positions, source_element as a UIElement, data_type, content (when text), success bool",
    checked: true,
  },
  {
    text: "Hotkey(HotkeyEvent) — combination string, action, is_global, process_name (chrome.exe, Notepad.exe, etc.)",
    checked: true,
  },
  {
    text: "TextInputCompleted(TextInputCompletedEvent) — text_value, field_name, field_type (TextBox, PasswordBox, SearchBox), input_method (typed vs pasted vs autofilled), typing_duration_ms, keystroke_count",
    checked: true,
  },
  {
    text: "ApplicationSwitch(ApplicationSwitchEvent) — from/to window_and_application_name, from/to process_name, from/to process_id, switch_method (AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick), dwell_time_ms",
    checked: true,
  },
  {
    text: "BrowserTabNavigation(BrowserTabNavigationEvent) — from/to URL, from/to title, browser, tab_index, total_tabs, page_dwell_time_ms, is_back_forward",
    checked: true,
  },
  {
    text: "Click(ClickEvent) — element_text, interaction_type (Click, Toggle, DropdownToggle, Submit, Cancel), element_role, was_enabled, page_url when in a browser",
    checked: true,
  },
  {
    text: "BrowserClick(BrowserClickEvent) — both ui_element (UIA) and dom_element (CSS selector, XPath, aria_label, inner_text), so a CSP-style policy can match on either tree",
    checked: true,
  },
  {
    text: "BrowserTextInput(BrowserTextInputEvent) — DOM-aware text input event for the in-browser case, separate from the OS-level TextInputCompleted",
    checked: true,
  },
  {
    text: "FileOpened(FileOpenedEvent) — filename, primary_path, candidate_paths sorted by LastAccessTime, FilePathConfidence (High/Medium/Low), application_name, process_id, search_time_ms, file_extension, full window_title",
    checked: true,
  },
  {
    text: "PendingAction(PendingActionEvent) — emitted before UI element capture finishes, so a downstream consumer can correlate raw input with the eventual high-level Click event",
    checked: true,
  },
];

const sysmonScript = `# Approach 1: kernel-side telemetry only (Sysmon + ETW + audit logs)
#
# You see this in the EventLog:
#   Event 11 (FileCreate)
#     Image:        C:\\Windows\\System32\\notepad.exe
#     ProcessId:    4928
#     TargetFilename: C:\\Users\\u\\AppData\\Local\\Temp\\rabbit-hole.tmp
#
# What you do NOT see:
#   - which window the user had focus on at the moment
#   - whether the user dragged a file in or pasted bytes from clipboard
#   - the literal label of the button the user just clicked
#   - whether the FileSave dialog was triggered by Ctrl+S, by a menu, or
#     by a programmatic action from another process
#
# To enrich kernel events with UI context, you write platform code:
#   Windows: hand-roll a UIA AddAutomationEventHandler subscriber, marshal
#            from the COM apartment, debounce property-change spam.
#   macOS:   ship a privileged daemon, request Accessibility permission,
#            walk AXUIElementCopyAttributeValue trees, handle
#            kAXNotificationFocusedUIElementChanged.
#
# That's the gap every team in this category builds in-house, badly.`;

const terminatorScript = `# Approach 2: subscribe to a typed event stream
//
// in Rust, against terminator-workflow-recorder
use terminator_workflow_recorder::{WorkflowRecorder, WorkflowRecorderConfig};
use tokio_stream::StreamExt;

let config = WorkflowRecorderConfig::default(); // captures all 14 variants
let mut recorder = WorkflowRecorder::new("session-1".into(), config);
recorder.start().await?;

let mut stream = recorder.event_stream();
while let Some(event) = stream.next().await {
    match event {
        // FileOpenedEvent already carries window_title + UIElement context
        WorkflowEvent::FileOpened(e) => {
            // confidence is High/Medium/Low based on filesystem-search results
            if e.confidence == FilePathConfidence::Low { continue; }
            forward_to_dlp_pipeline(&e).await;
        }
        // ClipboardEvent has the truncated content + size + the focused UI
        // element that issued the Copy. Now your DLP rule can say "Copy of
        // PII-shaped text from FieldType=PasswordBox" without OCR.
        WorkflowEvent::Clipboard(e) if e.action == ClipboardAction::Copy => {
            inspect_for_pii(&e).await;
        }
        // ApplicationSwitchEvent fuses Alt+Tab vs WindowsKeyShortcut vs
        // TaskbarClick into one enum. Your UEBA model gets switch_method
        // and dwell_time_ms for free.
        WorkflowEvent::ApplicationSwitch(e) => append_to_session_graph(&e),
        _ => {}
    }
}`;

const faqs: FaqItem[] = [
  {
    q: "Where does Terminator actually emit these events from? Is this a kernel driver, a userspace agent, or something else?",
    a: "Userspace, single binary, no kernel driver and no signed driver chain to maintain. The recorder lives in crates/terminator-workflow-recorder and runs as a tokio task inside the host process. It hooks raw input through standard userspace APIs (Windows low-level keyboard and mouse hooks for keystrokes and clicks, AX notifications on macOS) and enriches every raw event by querying the UI Automation tree on Windows or the AXUIElement tree on macOS. The output of every hook is funneled into a tokio::sync::broadcast::Sender<WorkflowEvent> channel with a buffer of 1000 events (recorder.rs line 310), and any number of subscribers can call recorder.event_stream() to get back an async stream they consume with tokio_stream::StreamExt. There is no privileged kernel component, no service install, and the binary can be killed and restarted without rebooting.",
  },
  {
    q: "Why is a userspace, accessibility-API approach interesting for security tooling when ETW, Sysmon, and EDR vendors already operate at the kernel level?",
    a: "Because kernel telemetry and UI telemetry answer different questions, and most security tools only have one of them. Sysmon EventID 11 tells you a process called CreateFile against TargetFilename, but it cannot tell you whether the user clicked a Save dialog, dragged a file from File Explorer, or pasted bytes from clipboard, because by the time the syscall fires the UI context is gone. The accessibility tree carries the orthogonal half: the literal element_role, element_text, focused field_type (TextBox vs PasswordBox vs SearchBox), and the parent application_name/window_title. A serious DLP, UEBA, or insider-threat tool needs both halves stitched together. Building the UI half from scratch on Windows means writing AddAutomationEventHandler glue, debouncing property-change events, marshalling from a multi-threaded COM apartment, and dealing with stale UIElement references when an app exits mid-event. terminator-workflow-recorder ships that work behind a flat Rust enum.",
  },
  {
    q: "What exactly does FileOpenedEvent give me that EventID 11 does not?",
    a: "It captures the file from the user's perspective, not from the syscall's. When notepad.exe shows 'todolist-backup.txt - Notepad' in its title bar, FileOpenedEvent (events.rs line 1155) extracts the filename token, runs a filesystem search to find candidates, sorts them by NTFS LastAccessTime, and returns: filename, primary_path (best guess), candidate_paths as a Vec<FileCandidatePath> for ambiguity, FilePathConfidence as High/Medium/Low so a downstream rule can decide whether to alert or to gate on a second signal, application_name, process_id, process_name, search_time_ms (so you can budget the recorder's CPU usage), file_extension, and the full window_title for forensic detail. None of this is in the kernel event because the kernel does not know that the user was looking at this specific file inside Notepad. It also does not need a kernel filter driver, so it will not break Windows updates the way a signed minifilter occasionally does.",
  },
  {
    q: "How does the recorder keep itself from saturating CPU on a live user session? An always-on monitoring agent that throttles a workstation is a non-starter.",
    a: "There are three knobs and they are explicit. PerformanceMode::Normal is the default and captures everything; it sets mouse_move_throttle_ms to 100 (10 FPS, recorder.rs line 210) which is already enough to drop most idle pointer churn. PerformanceMode::Balanced caps events at 20 per second, throttles mouse_move to 200ms, and turns on mouse and keyboard noise filtering. PerformanceMode::LowEnergy caps at 10 per second, throttles mouse_move to 500ms, disables text_input_completion (the most expensive feature because it tracks per-field typing state), and adds a 50ms processing delay per event cycle. You can also set a custom max_events_per_second and event_processing_delay_ms regardless of mode. For a security agent you almost certainly want LowEnergy or Balanced because you do not need a 10 Hz mouse trail to detect a clipboard exfiltration.",
  },
  {
    q: "Can a user-mode tool like this be tampered with by the same user it is monitoring? That is the standard objection to userspace EDR.",
    a: "Yes, and the honest answer is that this is not a substitute for a kernel-protected EDR if your threat model includes a privileged local attacker. It is a complementary signal source. The intended deployment shapes are: as the user-context layer beneath an existing kernel agent, where the kernel agent watches process integrity and the recorder enriches each kernel event with the UI it was issued from; as a test harness for security software, where the security tool you are developing wants programmatic, structured user behavior to validate its detections; and as a managed-IT scenario where the user is a willing party (think CRM data hygiene, contact-center call wrap-up, KYC review). For every other shape, the recorder feeds a kernel-rooted pipeline rather than replacing it.",
  },
  {
    q: "How do I integrate this with an LLM-based detection agent? The product description mentions an MCP server.",
    a: "There is a separate crate, terminator-mcp-agent, that exposes the same Rust core over the Model Context Protocol. You install it with one line: claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. The MCP server exposes tools for navigating the UI tree, reading element state, and clicking, plus an HTTP /ready endpoint that returns 200/206/503 based on a four-step UIAutomation health probe (described in detail in our automation-testing-tools-for-desktop-application guide). For an LLM-based detection or triage agent, the typical pattern is: stream WorkflowEvents into a Kafka or Redpanda topic, run a stateless filter that batches events by application_name + dwell_time_ms, and call the LLM only on flagged batches. The LLM itself can use the MCP tools to investigate further, such as reading the actual contents of the focused window or capturing a structural snapshot of the UI tree at the time of the event.",
  },
  {
    q: "Does this work on macOS, or is it Windows-only? Most desktop security tooling I have seen is Windows-first.",
    a: "The core of Terminator is cross-platform, with parallel Windows (UIAutomation, win32 hooks) and macOS (AXUIElement, CGEvent taps) backends. The workflow-recorder crate is currently Windows-first: the WindowsRecorder struct is the production implementation and exposes all 14 event variants. The macOS recorder is on the roadmap but not at parity yet. If your security software has to span both platforms today, the realistic split is: use terminator-workflow-recorder on Windows for the rich event stream, and use Terminator's lower-level Desktop and Locator API on macOS to query AX state on demand from your own event source (CGEvent or NSAccessibility notifications). Both backends share the same UIElement type, so anything you build on top of attributes(), role(), bounds(), and process_id() works unchanged across platforms.",
  },
  {
    q: "What is the license, and can a commercial security vendor build a product on top of this?",
    a: "Terminator is published under the MIT license. The repository at github.com/mediar-ai/terminator carries a top-level LICENSE file with the standard MIT permission text, and the Rust crate is published on crates.io as terminator-rs while the MCP agent is published on npm as terminator-mcp-agent. MIT permits commercial use, modification, and redistribution provided the copyright notice is preserved, so a security vendor can vendor the workflow-recorder crate, ship a closed-source agent that depends on it, or fork it into a private build. There is no copyleft tax. If your concern is patent grants, MIT does not include an explicit patent grant the way Apache 2.0 does, so plan accordingly with your legal review.",
  },
];

const relatedPosts = [
  {
    title: "Automation testing tools for desktop application",
    href: "/t/automation-testing-tools-for-desktop-application",
    excerpt:
      "An HTTP /ready endpoint that runs a four-step UIAutomation probe inside a five-second timeout. 200, 206, or 503.",
    tag: "Liveness probe",
  },
  {
    title: "Accessibility API for desktop automation",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "Why the AX/UIA tree beats screenshot OCR for stable selectors and what each platform's API actually exposes.",
    tag: "Accessibility tree",
  },
  {
    title: "Python desktop automation",
    href: "/t/python-desktop-automation",
    excerpt:
      "23 awaitable methods that release the GIL and run on Tokio. asyncio.gather across multiple apps in parallel.",
    tag: "Python bindings",
  },
];

export default function Page() {
  return (
    <article className="text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              url: PAGE_URL,
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4">
          For developers building or testing security software
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 leading-[1.05] tracking-tight">
          Desktop monitoring automation for security software is a developer problem, not a buyer problem. You need a typed event stream, not another product comparison.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Almost every article on this phrase is a vendor roundup of EDR, DLP, and UEBA products with feature checkboxes and pricing tiers. That is useful if you are buying. It is useless if you are <em>building</em> the security software, or red-teaming it, or shipping in-house tooling on top. What that audience actually needs is a structured event stream where every user action arrives already fused with UI Automation context. Terminator&rsquo;s <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">terminator-workflow-recorder</code> crate emits 14 typed <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">WorkflowEvent</code> variants over a tokio broadcast channel. This page is about that crate, what each variant carries, and where it earns its keep against the kernel-side telemetry security teams are already running.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="11 min read"
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          The thesis: kernel telemetry and UI telemetry answer different questions
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Modern security stacks already see kernel events. Sysmon, ETW, EDR sensors, audit policies, and the various flavors of file-system minifilter all surface the same shape of data: a process called this syscall, with these arguments, against this object. That is enough to detect <em>some</em> attacks (process injection, lolbins running off-spec, suspicious child processes), but it is structurally incomplete for anything that hinges on what the user was actually doing.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          When a user copies a customer list out of Salesforce and pastes it into a personal Gmail tab, the kernel sees clipboard COM activity and a pair of HTTPS connections to two unrelated domains. It does not see the literal text of the email field, the URL of the source page, the application name on either side, or the focused element role. Without that, a DLP rule has to either rely on full-content network inspection (TLS-terminating proxies, agent-mediated MITM) or accept a high false-positive rate. The accessibility tree carries the missing half. The challenge is that getting at it cleanly across Windows UIA and macOS AX is the kind of work everyone in this category writes once and never finishes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <ProofBanner
          metric="14"
          quote="The WorkflowEvent enum at events.rs line 475 covers Mouse, Keyboard, Clipboard, TextSelection, DragDrop, Hotkey, TextInputCompleted, ApplicationSwitch, BrowserTabNavigation, Click, BrowserClick, BrowserTextInput, FileOpened, PendingAction. Every variant carries an EventMetadata with an Option<UIElement> resolved at capture time."
          source="crates/terminator-workflow-recorder/src/events.rs lines 475-517"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Pillar 1. The 14 event variants, and why each one matters for a security pipeline
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          A security pipeline that consumes this stream is not interested in raw input events on their own. It cares about events that already have a process, an application name, a window title, and an element role attached. Below is the full enum, with the fields each variant carries. The shape of every variant is in <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">events.rs</code> in the same crate; this is not a paraphrase, it is the actual struct contents.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
        <AnimatedChecklist
          title="WorkflowEvent variants and their fields"
          items={eventVariants}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Pillar 2. The anchor field: FileOpenedEvent ties the kernel and the UI together
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The single most useful variant for a security pipeline is <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">FileOpenedEvent</code>. It is also the one that nothing else in this category ships, because it is the result of correlating two signals that almost no SDK fuses: a window title change and a filesystem search.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          When notepad.exe shows <em>todolist-backup.txt - Notepad</em>, the recorder strips the filename token out of the window title, walks the recent-files heuristics on disk, and sorts every match by NTFS <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">LastAccessTime</code>. The result lands in <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">candidate_paths</code> as a <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Vec&lt;FileCandidatePath&gt;</code>, with the highest-confidence guess promoted to <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">primary_path</code>. The confidence enum has three levels: <em>High</em> when only one file matched the filename, <em>Medium</em> when multiple files matched but one had a clearly more recent access time, and <em>Low</em> when access times were ambiguous. The whole resolution time is reported in <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">search_time_ms</code> so a downstream consumer can throttle expensive matches and fall back to filename-only when the search is taking too long on slow disks.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <GlowCard>
          <div className="p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
              The shape, verbatim
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              FileOpenedEvent is defined at events.rs line 1155. The fields are: filename: String, primary_path: Option&lt;String&gt;, candidate_paths: Vec&lt;FileCandidatePath&gt;, confidence: FilePathConfidence, application_name: String, process_id: Option&lt;u32&gt;, process_name: Option&lt;String&gt;, search_time_ms: f64, file_extension: Option&lt;String&gt;, window_title: String, metadata: EventMetadata. The metadata field carries an optional resolved UIElement and a unix-millis timestamp. There is also a corresponding SerializableFileOpenedEvent for export to JSON.
            </p>
          </div>
        </GlowCard>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <p className="text-zinc-700 leading-relaxed">
          The reason this matters is that <em>kernel-only</em> file telemetry cannot tie a write back to the UI element that triggered it. Sysmon EventID 11 sees the syscall after the dialog has dismissed and the focus has changed. By the time you correlate that event back to the user, you have lost the application context. FileOpenedEvent fires <em>at the moment the window title changes</em>, which is the same moment the user perceives the file as &ldquo;open&rdquo;, with the application_name and process_id carried in the same struct. A DLP rule reading this stream can say <em>copy from a window whose application_name is the line-of-business CRM and whose primary_path is under C:/Users/Public</em> and that is a single match expression, not a multi-event correlation graph.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Pillar 3. The flow: how a raw input becomes a typed event your security tool can match on
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The internal pipeline is short, single-process, and runs as a tokio task. The diagram below walks one mouse click from the moment the OS hook fires to the moment a downstream subscriber pulls a typed <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">WorkflowEvent::Click</code> out of the broadcast channel. The same pipeline serves keyboard, clipboard, drag-drop, application-switch, and tab-navigation events; only the hook source and the UIA query differ.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <SequenceDiagram
          title="From raw OS input to typed WorkflowEvent"
          actors={["OS hook", "Recorder", "UIAutomation", "broadcast::channel", "Subscriber"]}
          messages={[
            { from: 0, to: 1, label: "WM_LBUTTONUP at (x,y)", type: "event" },
            { from: 1, to: 1, label: "emit PendingAction", type: "event" },
            { from: 1, to: 2, label: "ElementFromPoint(x,y)", type: "request" },
            { from: 2, to: 1, label: "UIElement (role, name, app)", type: "response" },
            { from: 1, to: 1, label: "build ClickEvent", type: "event" },
            { from: 1, to: 3, label: "send WorkflowEvent::Click", type: "request" },
            { from: 3, to: 4, label: "deliver Click to receiver", type: "response" },
            { from: 4, to: 4, label: "match on event_role + element_text", type: "event" },
          ]}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <p className="text-zinc-700 leading-relaxed">
          Two details to note. The <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">PendingAction</code> event is emitted before the UIA query completes; it carries the position and button only. This lets a latency-sensitive consumer (say, a real-time blocker) react on the raw click and then enrich the decision when the matching <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Click</code> arrives a few milliseconds later. Second, the broadcast channel buffer is 1000 events (recorder.rs line 310). Subscribers that cannot keep up will receive a <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">RecvError::Lagged(skipped)</code> with the count of dropped events; the recorder logs an error but the stream stays open. Plan your subscriber to drain at line rate or rely on the lag value as a backpressure signal.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          The two ways to wire this up: kernel-only versus typed-event
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Below is the concrete shape of the choice. The left column is what most teams do today: stitch UI context onto kernel events by hand, on each platform, with the bugs and platform forks that implies. The right column is what subscribing to <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">terminator-workflow-recorder</code> looks like.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
        <CodeComparison
          title="Same goal, two starting points"
          leftLabel="kernel-only telemetry"
          rightLabel="typed WorkflowEvent stream"
          leftCode={sysmonScript}
          rightCode={terminatorScript}
          leftLines={sysmonScript.split("\n").length}
          rightLines={terminatorScript.split("\n").length}
          reductionSuffix="vs platform-specific glue"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          What changes for a developer the day they stop hand-rolling UIA glue
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The tangible shift is in the shape of the code that sits between &ldquo;something happened&rdquo; and &ldquo;a rule fired.&rdquo; The before-and-after below is what the same component looks like in a security pipeline before and after switching to a typed event stream.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
        <BeforeAfter
          title="The detection pipeline"
          before={{
            label: "Hand-rolled, three pipelines",
            content:
              "Three pipelines, two platforms, one heuristic. A kernel-side ETW listener emits a stream of file and process events. A separate userspace agent on Windows runs a UIA AddAutomationEventHandler subscription, debounces property-change spam, and dumps focused-element JSON to a file. A third process on macOS subscribes to AX notifications and writes its own format. Your detection rule has to join all three by timestamp with a tolerance window, dedupe, and hope the platform-specific quirks have not changed in the last patch cycle.",
            highlights: [
              "two platform-specific UI subscribers to maintain",
              "kernel and UI events arrive on separate clocks",
              "every rule writer needs to know the join shape",
              "stale UIElement references when an app exits mid-event",
            ],
          }}
          after={{
            label: "One typed event stream",
            content:
              "One stream. fn handle(event: WorkflowEvent). Match on the variant, read the fields, decide. The UI element is already attached to the event when relevant. Application name, process id, window title, and confidence-scored file path are all leaf fields on a single struct. Cross-platform behavior is the same enum on both, with different backends behind it.",
            highlights: [
              "single tokio broadcast channel, 1000-event buffer",
              "one match arm per detection class",
              "EventMetadata.ui_element resolves at capture time",
              "subscribers can run in the same binary or over MCP",
            ],
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Counterargument: where this is the wrong choice
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          A userspace, accessibility-API-rooted recorder is not a drop-in for a kernel-rooted EDR. If your threat model includes a privileged local attacker who can stop services, modify hook DLLs, or impersonate the recorder, you need a kernel-protected component below this one. terminator-workflow-recorder is the right answer in three shapes: as the user-context layer beneath an existing kernel agent (the kernel agent watches integrity, the recorder enriches each kernel event with the UI it came from), as a test harness for a security product (programmatic, structured user behavior to validate detections), and in managed-IT scenarios where the user is a willing participant (CRM hygiene, contact center wrap-up, KYC review, voluntary insider-risk programs).
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          It is also Windows-first today. The macOS recorder is on the roadmap but does not yet have parity for all 14 variants; on macOS the production-ready surface is the lower-level <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Desktop</code> and <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">Locator</code> API for on-demand AX queries, and you would need to drive the recording loop from your own CGEvent or NSAccessibility source. Linux is not currently in scope; the AT-SPI integration in the cross-platform health module is a stub.
        </p>
      </div>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Building or red-teaming desktop security software?"
        description="A 30-minute call to walk through the WorkflowEvent stream against your specific detection or simulation use case."
      />

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          FAQ
        </h2>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-4">
        <FaqSection items={faqs} />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More from the developer-facing side of Terminator"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Walk through WorkflowEvent for your detection or red-team build."
      />
    </article>
  );
}
