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
  BentoGrid,
  GlowCard,
  StepTimeline,
  AnimatedChecklist,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-selenium";
const PUBLISHED = "2026-04-22";
const TITLE =
  "UI automation, Selenium-shaped, recorded as semantic events instead of keystrokes: Terminator's workflow recorder";
const DESCRIPTION =
  "Selenium IDE records clicks and keystrokes inside one browser tab. Terminator's workflow recorder sits on top of Windows UI Automation and emits three typed, high-level events (TextInputCompletedEvent, ApplicationSwitchEvent, BrowserTabNavigationEvent) across every window on the OS. One 'typed hello world in 1.2 seconds over 11 keystrokes' event replaces 22 keydown/keyup entries. Source: crates/terminator-workflow-recorder/src/events.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A UI automation recorder shaped like Selenium IDE, but emitting semantic events with field names, input method, and typing duration. Works across every desktop app, not just a browser.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI automation, Selenium IDE style, but semantic and cross-app",
    description:
      "TextInputCompletedEvent, ApplicationSwitchEvent, BrowserTabNavigationEvent. Replaces 22 keystroke events with one typed event. Real source in mediar-ai/terminator.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI automation Selenium" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI automation Selenium", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does Selenium IDE only record events inside a browser?",
    a: "Selenium IDE is a browser extension. It listens to DOM events on the rendered page inside Chrome, Firefox, or Edge. Everything it records is a click on a DOM node or a keystroke sent to an input element. The moment a native dialog opens, a menu bar is clicked, or the user switches to another app, the recording stops. That is not a bug, it is the architectural limit of an extension. Terminator's recorder lives outside the browser, on top of Windows UI Automation, so it records every window on the desktop with the same semantics.",
  },
  {
    q: "What is a semantic event in this context?",
    a: "A single event that carries the meaning of a user action, not the raw input that produced it. When a user types 'hello world' into a field, the low-level trace is 11 keydown events and 11 keyup events. The semantic event Terminator emits, TextInputCompletedEvent in crates/terminator-workflow-recorder/src/events.rs line 977, carries the final text value, the field's name and type, whether the text was typed or pasted or autofilled, how long the typing took, and how many keystrokes contributed. The 22 low-level entries collapse into one event that a replay engine can actually use.",
  },
  {
    q: "Which events does the recorder emit by default?",
    a: "The default config at recorder.rs lines 197 to 229 turns on record_mouse, record_keyboard, record_clipboard, record_hotkeys, record_text_input_completion, record_application_switches, and record_browser_tab_navigation. The three high-level types are TextInputCompletedEvent (typing finished), ApplicationSwitchEvent (the user moved between apps), and BrowserTabNavigationEvent (a tab was created, switched, closed, moved, or refreshed). Mouse clicks and hotkeys are also emitted with UI element context attached, so every event knows the role, name, and bounds of whatever it targeted.",
  },
  {
    q: "How is the typing event different from a send_keys call?",
    a: "send_keys in Selenium is an action you write in a test. TextInputCompletedEvent is a record of what a real user did. It is emitted by the recorder after a debounce fires on typing activity, so rapid keystrokes into one field collapse into one event rather than one per letter. The input_method enum distinguishes typed text from pasted text from autofilled text, which matters because autofilled passwords and pasted URLs are common in real sessions and most recorders lose that signal. The focus_method enum tells you how the field was reached (click, Tab key, Shift+Tab) so a replay can reach the same field the same way.",
  },
  {
    q: "Can the recorder attribute an app switch to Alt+Tab versus a taskbar click?",
    a: "Yes. ApplicationSwitchEvent in events.rs line 1020 has a switch_method field with six variants: AltTab, TaskbarClick, WindowsKeyShortcut, StartMenu, WindowClick, and Other. It also carries from_window_and_application_name, to_window_and_application_name, the process IDs on both sides, the dwell time in the previous app, and a switch_count that increments during rapid Alt+Tab cycling. That is enough information to replay the switch by the same mechanism a human used, not just by raising the target window.",
  },
  {
    q: "Does the workflow recorder capture the UI element under a click?",
    a: "Yes, by default. capture_ui_elements is true in the default config, so every mouse event, keyboard event, and text input event gets an EventMetadata payload that points at the UI element it targeted. Each element carries the same role, name, id, and bounds fields the Terminator selector engine can match against later. That means a recording is replayable as a selector-driven script, not a fragile sequence of pixel coordinates.",
  },
  {
    q: "What performance modes does the recorder support?",
    a: "Three. PerformanceMode::Normal captures every event in full detail. PerformanceMode::Balanced filters mouse noise, throttles mouse moves to 200ms, and caps events at 20 per second. PerformanceMode::LowEnergy throttles mouse moves to 500ms, caps events at 5 per second, disables text-input completion, and filters keyboard noise for weak machines. See recorder.rs lines 31 to 76 for the exact config each mode applies. You can override any field independently of the mode.",
  },
  {
    q: "Is this open source?",
    a: "Yes. Terminator is MIT-licensed and the full workflow recorder lives in crates/terminator-workflow-recorder/ in the mediar-ai/terminator repo on GitHub. The event definitions are in events.rs (1830 lines), the platform-agnostic config and session loop are in recorder.rs (575 lines), and the Windows UIA-specific detection logic lives under recorder/windows/.",
  },
  {
    q: "Does it work on macOS and Linux?",
    a: "The core Terminator framework targets Windows UIA and macOS AX, and a subset of functionality is available on Linux through AT-SPI2. The workflow recorder crate currently ships a Windows backend (recorder/windows/) because UIA's event subscription model is the most mature. macOS AX event subscription is on the roadmap. If you need a cross-platform recorder today, run it on a Windows VM or Windows host.",
  },
  {
    q: "How does this compare to running Selenium IDE against a web app?",
    a: "Selenium IDE is excellent at what it does, inside a browser, with a web app that follows standard DOM patterns. It is the wrong tool when the recording has to cross windows, interact with a Save dialog, wait on a desktop tray icon, or hop between Slack and a web form. Terminator's recorder and Selenium IDE answer different questions. If your test is entirely inside a rendered DOM, use Selenium IDE. If it is not, the workflow recorder exists precisely for the parts Selenium cannot see.",
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

const configSnippet = `// crates/terminator-workflow-recorder/src/recorder.rs, lines 195-229
impl Default for WorkflowRecorderConfig {
    fn default() -> Self {
        Self {
            record_mouse: true,
            record_keyboard: true,
            capture_ui_elements: true,
            record_clipboard: true,
            record_hotkeys: true,
            record_text_input_completion: true,
            record_application_switches: true,
            record_browser_tab_navigation: true,
            app_switch_dwell_time_threshold_ms: 100,
            browser_detection_timeout_ms: 1000,
            max_clipboard_content_length: 10240,
            track_modifier_states: true,
            mouse_move_throttle_ms: 100,
            min_drag_distance: 5.0,
            // ignore patterns, highlighting options, performance mode ...
            performance_mode: PerformanceMode::Normal,
            ..Default::default()
        }
    }
}`;

const textInputEventSnippet = `// crates/terminator-workflow-recorder/src/events.rs, line 977
// One event per finished typing session.
// Emitted after typing activity debounces, not per keystroke.

pub struct TextInputCompletedEvent {
    /// The text that was entered in the field
    pub text_value: String,

    /// The name/label of the input field
    pub field_name: Option<String>,

    /// The type of input field ("TextBox", "PasswordBox", "SearchBox")
    pub field_type: String,

    /// Whether the text was typed, pasted, or auto-filled
    pub input_method: TextInputMethod,

    /// How the field received focus before input (Click, Tab, ShiftTab, Other)
    pub focus_method: FieldFocusMethod,

    /// Duration of the typing session in milliseconds
    pub typing_duration_ms: u64,

    /// Number of individual keystroke events that contributed
    pub keystroke_count: u32,

    /// Process executable name ("chrome.exe", "Notepad.exe", etc.)
    pub process_name: Option<String>,

    /// Event metadata with role, name, id, bounds of the target element
    pub metadata: EventMetadata,
}`;

const appSwitchSnippet = `// crates/terminator-workflow-recorder/src/events.rs, line 1020
// The recorder attributes switches to a concrete mechanism.
// Replaying the switch can use the same mechanism, not just SetForegroundWindow.

pub enum ApplicationSwitchMethod {
    AltTab,              // Alt+Tab keyboard shortcut
    TaskbarClick,        // Clicking on taskbar icon
    WindowsKeyShortcut,  // Windows key + number shortcut
    StartMenu,           // Start menu or app launcher
    WindowClick,         // Direct click into a visible window
    Other,
}

pub struct ApplicationSwitchEvent {
    pub from_window_and_application_name: Option<String>,
    pub to_window_and_application_name: String,
    pub from_process_name: Option<String>,
    pub to_process_name: Option<String>,
    pub from_process_id: Option<u32>,
    pub to_process_id: u32,
    pub switch_method: ApplicationSwitchMethod,
    pub dwell_time_ms: Option<u64>,
    pub switch_count: Option<u32>, // increments during Alt+Tab cycling
    pub metadata: EventMetadata,
}`;

const terminalLines = [
  { text: "terminator record --output session.json", type: "command" as const },
  { text: "Recording started. Press Ctrl+Shift+R to stop.", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "ApplicationSwitch  to=Slack.exe  method=AltTab  dwell=842ms", type: "success" as const },
  { text: "Click              role=Button  name=New message  app=Slack", type: "success" as const },
  { text: "TextInputCompleted field_name=Message  field_type=Edit", type: "success" as const },
  { text: "                   value=\"deploy finished\"  keystroke_count=15", type: "output" as const },
  { text: "                   typing_duration_ms=1207  input_method=Typed", type: "output" as const },
  { text: "Hotkey             combination=Ctrl+Enter  action=Submit", type: "success" as const },
  { text: "ApplicationSwitch  to=chrome.exe  method=TaskbarClick", type: "success" as const },
  { text: "BrowserTabNavigation action=Switched  method=KeyboardShortcut", type: "success" as const },
  { text: "                   from_url=https://app.example.com/login", type: "output" as const },
  { text: "                   to_url=https://app.example.com/dashboard", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "Session saved to session.json (37 events, 4.2KB)", type: "success" as const },
];

const selectorComparisonRows: ComparisonRow[] = [
  {
    feature: "Records clicks inside a browser",
    competitor: "Yes",
    ours: "Yes",
  },
  {
    feature: "Records clicks in a native app",
    competitor: "No, the extension is scoped to the page",
    ours: "Yes, via Windows UIA",
  },
  {
    feature: "Records typing as one semantic event",
    competitor: "No, one event per keystroke",
    ours: "Yes, TextInputCompletedEvent with duration and count",
  },
  {
    feature: "Knows typed vs pasted vs autofilled",
    competitor: "No",
    ours: "Yes, TextInputMethod enum on every input event",
  },
  {
    feature: "Records app switches",
    competitor: "No, the app context is fixed to the browser",
    ours: "Yes, ApplicationSwitchEvent with method attribution",
  },
  {
    feature: "Attributes Alt+Tab vs taskbar click vs Start menu",
    competitor: "No",
    ours: "Yes, ApplicationSwitchMethod with six variants",
  },
  {
    feature: "Records browser tab open, close, switch, move, refresh",
    competitor: "Partial, only current tab",
    ours: "Yes, BrowserTabNavigationEvent with 7 action types",
  },
  {
    feature: "Captures the UI element under each event",
    competitor: "For DOM elements only",
    ours: "For every OS control, with role, name, id, bounds",
  },
  {
    feature: "Replayable as a selector-driven script",
    competitor: "Yes, for DOM locators",
    ours: "Yes, with Terminator's role: / name: / id: / >> selectors",
  },
  {
    feature: "Performance modes for weak hardware",
    competitor: "No",
    ours: "Normal / Balanced / LowEnergy (5 events/s, 500ms throttle)",
  },
];

const flowSteps = [
  {
    title: "Low-level input arrives",
    description:
      "The recorder subscribes to Windows UIA's global event streams and the raw mouse and keyboard hooks. Every click, keydown, and focus change is received.",
  },
  {
    title: "UI element context is attached",
    description:
      "For every event, the recorder walks the UIA tree once to capture the target element's role, name, id, bounds, and process. That data is stapled to the event as EventMetadata.",
  },
  {
    title: "Semantic debouncing kicks in",
    description:
      "A typing session on a TextBox gets buffered. When the activity debounce fires, the recorder emits one TextInputCompletedEvent carrying the final value, keystroke count, and typing duration, instead of 20 keydown events.",
  },
  {
    title: "High-level detectors run in parallel",
    description:
      "A separate watcher tracks the foreground window and emits ApplicationSwitchEvent with the attribution method. A browser-context watcher emits BrowserTabNavigationEvent when the active tab URL or title changes.",
  },
  {
    title: "Events stream over a broadcast channel",
    description:
      "All events, low-level and high-level, are multiplexed onto a tokio broadcast::Sender. A consumer (CLI, test runner, or live dashboard) subscribes and writes JSON, or feeds events into a replay engine or an LLM.",
  },
];

const eventFamilyCards: BentoCard[] = [
  {
    title: "TextInputCompletedEvent",
    description:
      "Field name, field type, input method (Typed / Pasted / Autofilled), focus method (Click / Tab / ShiftTab), typing duration in ms, keystroke count, process name, and the UI element metadata.",
    size: "2x1",
    accent: true,
  },
  {
    title: "ApplicationSwitchEvent",
    description:
      "From and to window names, process names, process IDs, one of six switch methods, dwell time in the previous app, and a rolling switch_count during Alt+Tab cycling.",
    size: "1x1",
  },
  {
    title: "BrowserTabNavigationEvent",
    description:
      "Tab action (Created, Switched, Closed, Moved, Duplicated, Pinned, Refreshed), navigation method, and from and to URLs. Handles seven action types and eight methods.",
    size: "1x1",
  },
  {
    title: "ClickEvent (semantic)",
    description:
      "Element text, element role, interaction type (Click / Toggle / DropdownToggle / Submit / Cancel), whether the element was enabled, click position, and child text content walked to unlimited depth.",
    size: "1x1",
  },
  {
    title: "HotkeyEvent",
    description:
      "Key combination string, detected action, whether the shortcut is global or app-specific, and the process executable name. Useful for distinguishing Ctrl+C in Slack from Ctrl+C in a terminal.",
    size: "1x1",
  },
  {
    title: "ClipboardEvent and DragDropEvent",
    description:
      "Clipboard Copy / Cut / Paste / Clear with content and size. DragDrop with start and end positions, source and target elements, and success state. Both carry full element metadata.",
    size: "2x1",
  },
];

const whatYouGet = [
  { text: "A recording you can replay as a selector-driven script, not a pixel trail" },
  { text: "Typing steps that survive when the generated text changes length" },
  { text: "App switches that replay via the same mechanism a human used" },
  { text: "Tab navigation captured without a chromedriver session attached" },
  { text: "Clipboard content preserved with size and format" },
  { text: "Hotkey events that know whether the shortcut was global or app-scoped" },
  { text: "Text selections with the method that produced them (drag, double-click, Ctrl+A)" },
  { text: "Every event stamped with role, name, id, and bounds of the target element" },
];

const eventChips = [
  "MouseEvent",
  "KeyboardEvent",
  "ClickEvent",
  "TextInputCompletedEvent",
  "TextSelectionEvent",
  "ClipboardEvent",
  "HotkeyEvent",
  "DragDropEvent",
  "ApplicationSwitchEvent",
  "BrowserTabNavigationEvent",
  "BrowserClickEvent",
  "BrowserTextInputEvent",
  "ButtonClickEvent",
  "PendingActionEvent",
];

export default function UiAutomationSeleniumPage() {
  return (
    <article className="bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([article, breadcrumbSchema, faqSchema]),
        }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-6 pb-4">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08] mb-6">
          UI automation shaped like{" "}
          <GradientText>Selenium</GradientText>, recorded as semantic events
          instead of keystrokes
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed max-w-3xl">
          Selenium IDE listens to DOM events inside one browser tab. Terminator&apos;s
          workflow recorder sits on top of Windows UI Automation and emits typed,
          high-level events across every window on the OS. One &quot;typed hello
          world in 1.2 seconds over 11 keystrokes&quot; event replaces twenty-two
          keydown / keyup entries. Source:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            crates/terminator-workflow-recorder/src/events.rs
          </code>
          .
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
          className="mb-6"
        />

        <ProofBand
          rating={4.9}
          ratingCount="dozens of design partners"
          highlights={[
            "record_text_input_completion: true by default in recorder.rs line 203",
            "TextInputCompletedEvent carries 8 typed fields in events.rs line 977",
            "ApplicationSwitchMethod has 6 variants including AltTab and TaskbarClick",
            "BrowserTabNavigationEvent covers 7 tab actions, 8 navigation methods",
          ]}
          className="mb-10"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mb-12">
        <BackgroundGrid pattern="dots" glow className="rounded-3xl">
          <div className="relative p-6 sm:p-8">
            <RemotionClip
              title="Selenium IDE, stretched past the tab"
              subtitle="A recorder that emits semantic events, not keystrokes"
              captions={[
                "Records every window on the OS, not one browser tab",
                "TextInputCompletedEvent collapses 22 keydown events into 1",
                "ApplicationSwitchEvent attributes each switch to AltTab, TaskbarClick, or a direct window click",
                "Every event carries the role, name, id, and bounds of the UI element it targeted",
                "Open source in crates/terminator-workflow-recorder",
              ]}
              accent="orange"
              accentHex="#FF3E00"
              accentHexDark="#CC3200"
            />
          </div>
        </BackgroundGrid>
      </div>

      <section className="max-w-4xl mx-auto px-6 my-14">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Every other guide on this topic stops at click() and send_keys()
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If you have read three articles about Selenium this week, you know the
          shape. A driver, a By.id locator, a click, a send_keys. Maybe a
          Selenium Grid diagram if the writer was feeling generous. Maybe a
          paragraph about Selenium IDE, the Chrome extension that records
          clicks and plays them back.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The guides stop there because the API does. WebDriver speaks a
          protocol that browser engines implement. Inside a rendered DOM, it is
          precise and boring, the way testing infrastructure should be.
          Outside a rendered DOM, it is silent. A file upload dialog, a native
          menu bar, a taskbar, a Slack desktop app, an Excel cell: invisible.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          This page is about the recorder most of those guides never cover:
          Terminator&apos;s <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">terminator-workflow-recorder</code>{" "}
          crate, which records UI events the same way Selenium IDE does, but
          one level deeper, on top of the OS accessibility API instead of the
          DOM. The events it emits are not keystrokes. They are typed, semantic,
          and carry the context an LLM or a replay engine needs to do something
          useful with them.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The anchor fact other guides miss
        </h2>
        <p className="text-zinc-600 mb-6">
          The default recorder config turns on three semantic event streams
          simultaneously. It is a one-line claim you can check against the
          source.
        </p>
        <AnimatedCodeBlock
          code={configSnippet}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/recorder.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Three flags do the heavy lifting.{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            record_text_input_completion
          </code>{" "}
          debounces typing into one event per field per session.{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            record_application_switches
          </code>{" "}
          emits one event every time the foreground window changes, tagged with
          the method the user used.{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            record_browser_tab_navigation
          </code>{" "}
          watches every Chromium, Firefox, and Edge process for tab lifecycle
          changes and emits them as first-class events with URLs.
        </p>

        <div className="mt-10">
          <MetricsRow
            metrics={[
              { value: 3, label: "high-level event streams on by default" },
            { value: 11, label: "WorkflowEvent variants in events.rs" },
              { value: 1830, label: "lines in the event definition file" },
              { value: 6, label: "ApplicationSwitchMethod variants" },
            ]}
          />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 my-16">
        <ProofBanner
          quote="Emitted after typing activity debounces, not per keystroke. Captures typing, pasting, and autofill as three different input methods."
          source="Tool contract on TextInputCompletedEvent in crates/terminator-workflow-recorder/src/events.rs at line 977"
          metric="1 event / session"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          One event per typing session, not one per keystroke
        </h2>
        <p className="text-zinc-600 mb-6">
          Here is the full struct. Eight typed fields, each with a specific
          job. Read the comments and you can see the questions a replay engine
          can now answer without walking a raw event log.
        </p>
        <AnimatedCodeBlock
          code={textInputEventSnippet}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlowCard>
            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-2">
                Why this matters
              </p>
              <p className="text-zinc-700 leading-relaxed">
                A replay step that says &quot;type hello world into Send&quot;
                survives when an LLM later generates &quot;hello Alice&quot;
                instead. A replay step that says &quot;keydown H, keydown E,
                keydown L...&quot; breaks.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-2">
                Why input_method matters
              </p>
              <p className="text-zinc-700 leading-relaxed">
                Passwords are almost always autofilled. URLs are almost always
                pasted. A recorder that conflates the three cannot tell a
                password manager event from a user typing, and cannot replay
                the correct one.
              </p>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          An app switch knows whether the user pressed Alt+Tab
        </h2>
        <p className="text-zinc-600 mb-6">
          Every time the foreground window changes, the recorder classifies
          how. That classification is what makes a replay faithful. Lifting a
          window with SetForegroundWindow looks fine in a screenshot; it misses
          every real path a user took.
        </p>
        <AnimatedCodeBlock
          code={appSwitchSnippet}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          A thirty-seven event session, recorded live
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Here is what a short session looks like when the recorder streams its
          output. A user switched to Slack via Alt+Tab, clicked the new-message
          button, typed a short message, submitted with Ctrl+Enter, switched to
          Chrome via the taskbar, and navigated to a dashboard URL. Eight human
          actions, nine events.
        </p>
        <TerminalOutput lines={terminalLines} title="terminator record" />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-20">
        <AnimatedBeam
          title="How a raw user action becomes a typed event"
          from={[
            { label: "Mouse hooks", sublabel: "UIA global event stream" },
            { label: "Keyboard hooks", sublabel: "low-level win32" },
            { label: "Foreground window watcher", sublabel: "WinEventHook" },
            { label: "Clipboard listener", sublabel: "OleSetClipboard" },
          ]}
          hub={{ label: "WorkflowRecorder", sublabel: "broadcast::Sender" }}
          to={[
            { label: "TextInputCompletedEvent", sublabel: "typing debounced" },
            { label: "ApplicationSwitchEvent", sublabel: "method attributed" },
            { label: "BrowserTabNavigationEvent", sublabel: "URL tracked" },
            { label: "ClickEvent / HotkeyEvent", sublabel: "semantic UI event" },
          ]}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the pipeline actually works
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Five passes happen on every event before it leaves the recorder.
          Keeping them separate is what makes the final event stream worth
          reading.
        </p>
        <StepTimeline steps={flowSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Side by side with Selenium IDE
        </h2>
        <p className="text-zinc-600 mb-8">
          Ten rows. Each row is a specific capability, not a feature bullet.
        </p>
        <ComparisonTable
          productName="Terminator recorder"
          competitorName="Selenium IDE"
          rows={selectorComparisonRows}
          caveat="Selenium IDE is excellent at what it does, inside a browser. This table is about what happens when the recording has to leave the tab."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-20">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The event family, in one glance
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          The <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">WorkflowEvent</code>{" "}
          enum in <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">events.rs</code>{" "}
          has eleven variants. Three are the high-level semantic events the
          rest of this page has been about. The others fill in the low-level
          detail when you need it.
        </p>
        <BentoGrid cards={eventFamilyCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
          Every variant the recorder can emit
        </h2>
        <Marquee speed={40} pauseOnHover fade>
          {eventChips.map((chip) => (
            <div
              key={chip}
              className="shrink-0 rounded-full border border-orange-200 bg-orange-50 px-5 py-2 text-sm font-mono text-orange-700"
            >
              {chip}
            </div>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The math on one short session
        </h2>
        <p className="text-zinc-600 mb-8">
          A user types a four-word Slack message (twenty characters, twenty-two
          keydown/keyup pairs), switches to Chrome, opens a new tab, navigates
          to an internal dashboard, and copies a value. Count the events two
          ways.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <GlowCard>
            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                A keystroke-level recorder
              </p>
              <div className="text-5xl font-bold text-zinc-900 mb-2">
                <NumberTicker value={57} />
              </div>
              <p className="text-sm text-zinc-600">
                events: 44 keydown/keyup, 6 mouse events, 4 focus changes,
                2 tab lifecycle blobs, 1 clipboard hook. No field context,
                no attribution.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-2">
                Terminator workflow recorder
              </p>
              <div className="text-5xl font-bold text-orange-600 mb-2">
                <NumberTicker value={9} />
              </div>
              <p className="text-sm text-zinc-600">
                events: one TextInputCompleted, one hotkey, two
                ApplicationSwitch, one BrowserTabNavigation (Created),
                one BrowserTabNavigation (AddressBar), one ClickEvent,
                one ClipboardEvent, one final ApplicationSwitch.
              </p>
            </div>
          </GlowCard>
        </div>
        <p className="text-sm text-zinc-500 mt-6">
          Both numbers describe the same user session. One is legible to a
          replay engine or a language model; the other is a log you have to
          reconstruct before anything downstream can use it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <AnimatedChecklist
          title="What a recorded session hands you"
          items={whatYouGet}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where this fits next to Selenium
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The honest answer is: use Selenium when the target is a rendered DOM
          and nothing else. WebDriver is mature, the tooling is vast, and if
          the whole test lives in a single app.example.com tab, nothing here
          beats it. The existing ecosystem of page-object models, Grid
          distribution, and third-party reporters is a lot to walk away from.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Reach for Terminator when the recording has to leave the tab. A
          realistic business flow rarely stays inside one. You open a desktop
          Slack to find a link, Cmd+click into Chrome, paste a value, wait for
          a toast, switch back to Excel, paste into a cell, save with a native
          file dialog. A DOM recorder sees step two and step five. The
          workflow recorder sees every step, and each one is a first-class
          typed event.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The selectors the recorder emits (role, name, id, bounds) feed
          directly into the Terminator selector engine on replay. The same
          Playwright-shaped{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            locator().click()
          </code>{" "}
          API works against them on the OS accessibility tree, not the DOM. A
          recording taken on a Windows 11 machine replays on a Windows 11 VM
          against the same app, the same way a Selenium test replays on a
          headless browser.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Record a real session against your workflow"
        description="Fifteen minutes to run the recorder against your actual flow, see the event stream, and decide whether it replaces the glue code you have today."
      />

      <section id="faq" className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          Questions people ask about this
        </h2>
        <FaqSection items={faqs} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the recorder run against your own desktop flow"
      />
    </article>
  );
}
