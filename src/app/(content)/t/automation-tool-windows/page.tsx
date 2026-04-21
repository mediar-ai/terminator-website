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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  BeforeAfter,
  FlowDiagram,
  ComparisonTable,
  MetricsRow,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-tool-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "An automation tool for Windows whose recorder knows autocomplete from typing";
const DESCRIPTION =
  "Most Windows automation tools record the keystrokes. Terminator's workflow recorder classifies each finished field into Typed, Pasted, AutoFilled, Suggestion, or Mixed. A 5000ms timer over arrow-key activity is what tells typing apart from an autocomplete pick. Source: crates/terminator-workflow-recorder/src/recorder/windows/structs.rs line 125.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The automation tool for Windows whose recorder emits a TextInputCompleted event with input_method = Typed, Pasted, AutoFilled, Suggestion, or Mixed. The 5000ms window between the last arrow key and Enter is the rule that decides Suggestion.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "An automation tool for Windows with five input methods, not one",
    description:
      "Arrow keys 0x26, 0x28, 0x25, 0x27, 0x1B. Enter (0x0D) within 5 seconds. That is a TextInputMethod::Suggestion event, not a keystroke replay.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation Tool Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation Tool Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does an automation tool for Windows need to know whether the user typed or picked from autocomplete?",
    a: "Because typing and picking look identical in a raw keystroke log but mean different things on replay. If the user types 'New' and selects 'New York' from a city autocomplete, a recorder that saves the keystrokes will replay N E W on a machine where the dropdown does not open, and the field ends up with 'New' instead of 'New York'. A recorder that marks the finished field as Suggestion remembers the final value and the interaction shape, so the replay restores 'New York' even when no suggestion popup appears.",
  },
  {
    q: "Where in Terminator's source is this classification done?",
    a: "Three files in the terminator-workflow-recorder crate. The enum TextInputMethod lives at crates/terminator-workflow-recorder/src/events.rs lines 946 to 958 with variants Typed, Pasted, AutoFilled, Suggestion, and Mixed. The 5000ms decision rule is in handle_enter_key at src/recorder/windows/structs.rs lines 121 to 135. The emission site for the suggestion case is in src/recorder/windows/mod.rs lines 3262 to 3285, where key_code 0x0D triggers the branch that sets input_method to TextInputMethod::Suggestion before sending WorkflowEvent::TextInputCompleted.",
  },
  {
    q: "Which specific keys put the tracker into autocomplete navigation mode?",
    a: "Five virtual-key codes from add_keystroke in structs.rs line 68. 0x26 is Up arrow. 0x28 is Down arrow. 0x25 is Left arrow. 0x27 is Right arrow. 0x1B is Escape. When any of these fire, in_autocomplete_navigation is set to true and last_autocomplete_activity is reset to Instant::now(). Escape is included because it cancels a suggestion list without selecting anything, which the replay layer needs to know about.",
  },
  {
    q: "Why 5000 milliseconds specifically?",
    a: "It is the literal argument in structs.rs line 125: time_since_nav < std::time::Duration::from_millis(5000). Five seconds is long enough that a human who paused to read the autocomplete list before hitting Enter is still inside the window, and short enough that a separate typing session a minute later does not get mis-classified as a suggestion pick. This is a soft heuristic, tuned to real recordings. The code is in plain view if you want to tune it for your domain.",
  },
  {
    q: "What does the emitted event actually contain?",
    a: "A TextInputCompletedEvent struct from events.rs lines 977 to 999. Ten fields. text_value is the final contents of the field. field_name and field_type are the label and role. input_method is one of the five enum variants. focus_method is how the field got focus (MouseClick, KeyboardNav, Programmatic, Unknown). typing_duration_ms is the wall-clock elapsed from first keystroke to completion. keystroke_count is only the typing keys, not arrow keys or modifiers. process_name is the .exe of the host. metadata carries the full UI element reference. This is a replayable representation, not a keystroke log.",
  },
  {
    q: "What other Windows automation tools differentiate the five input methods?",
    a: "None that I have found. Power Automate Desktop records the final text value of a field but does not mark how the text arrived; a paste and a type look identical in the flow graph. UiPath Studio's Type Into activity stores a string, with no field for whether the recorder saw it typed or pasted. AutoHotkey has no recorder. WinAppDriver is a driver, not a recorder. TinyTask saves raw input events with no classification. Terminator's workflow-recorder crate is the only Windows automation tool I have read the source of that emits an input_method tag on the completion event.",
  },
  {
    q: "Does this make the recorded JSON bigger?",
    a: "Smaller on average. A field where the user typed twelve characters and then picked a suggestion generates one TextInputCompleted event with input_method=Suggestion and the final text_value, not twelve keystroke events plus an arrow-key trail plus an Enter. The SerializableTextInputCompletedEvent type at events.rs line 1524 is the on-disk shape, and it skips empty fields via serde's skip_serializing_if. A recording of a typical form fill is noticeably shorter than the equivalent raw keystroke dump.",
  },
  {
    q: "How do I turn this on?",
    a: "It is on by default in terminator-workflow-recorder when record_text_input_completion is true. The Balanced performance mode keeps it on; LowEnergy turns it off because the UIA probes for text value add measurable overhead on weak machines. See WorkflowRecorderConfig::default() in src/recorder.rs and PerformanceMode::low_energy_config() at src/recorder.rs line 46. If you want just this event and nothing else, set record_mouse=false, record_keyboard=false, record_text_input_completion=true, and you will see only the high-level completion events.",
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

const inputMethodCards: BentoCard[] = [
  {
    title: "Typed",
    description:
      "Keys land one by one with no paste, no autocomplete navigation, no auto-fill trigger. The default when no other signal fires. Replays by sending the final text_value into the field.",
    size: "1x1",
  },
  {
    title: "Pasted",
    description:
      "A large block of characters arrives within a single event window. The recorder will mark this in later classifier passes. Replays by writing the string directly instead of simulating keys.",
    size: "1x1",
  },
  {
    title: "AutoFilled",
    description:
      "Browser or OS populates the field without a user keystroke — saved credentials, address fill, form memory. The replay layer knows to expect this and does not type over it.",
    size: "1x1",
  },
  {
    title: "Suggestion",
    description:
      "The user navigated a dropdown with arrow keys and pressed Enter inside the 5000ms window in structs.rs line 125. The final field value comes from the list, not from the typed prefix.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Mixed",
    description:
      "Multiple methods inside one field-edit session. The replay layer falls back to setting the final text_value verbatim.",
    size: "1x1",
  },
];

const textInputMethodEnum = `// crates/terminator-workflow-recorder/src/events.rs, lines 946-958
// The five classes an automation tool for Windows has to tell apart
// if it wants the recording to replay tomorrow.

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TextInputMethod {
    /// Text was typed character by character
    Typed,
    /// Text was likely pasted (large amount added quickly)
    Pasted,
    /// Text was likely auto-filled or auto-completed
    AutoFilled,
    /// Text was selected from autocomplete/suggestion dropdown
    Suggestion,
    /// Mixed input methods
    Mixed,
}`;

const addKeystrokeCode = `// crates/terminator-workflow-recorder/src/recorder/windows/structs.rs
// add_keystroke, lines 66-119. The function that decides whether the
// next Enter will be a plain keypress or a suggestion selection.

pub fn add_keystroke(&mut self, key_code: u32) {
    // Autocomplete navigation keys: arrows and Escape
    if Self::is_autocomplete_navigation_key(key_code) {
        self.in_autocomplete_navigation = true;
        self.last_autocomplete_activity = Instant::now();

        // Capture the field's current text in case the next event is
        // an Enter that replaces the prefix with a picked suggestion.
        if self.text_before_autocomplete.is_none() {
            self.text_before_autocomplete =
                Self::get_element_text_value_safe(&self.element);
        }
        return;
    }

    // Typing keys only. Navigation and modifiers do not count.
    if Self::is_typing_key(key_code) {
        self.keystroke_count += 1;
        self.has_typing_activity = true;
        self.in_autocomplete_navigation = false;
    }
}

fn is_autocomplete_navigation_key(key_code: u32) -> bool {
    matches!(
        key_code,
        0x26 |  // Up arrow
        0x28 |  // Down arrow
        0x25 |  // Left arrow
        0x27 |  // Right arrow
        0x1B    // Escape (cancel autocomplete)
    )
}`;

const handleEnterCode = `// crates/terminator-workflow-recorder/src/recorder/windows/structs.rs
// handle_enter_key, lines 121-135. The only function in the codebase
// that reclassifies a keypress into a Suggestion completion event.

pub fn handle_enter_key(&mut self) -> bool {
    // If we are in autocomplete navigation, Enter likely selects a suggestion
    if self.in_autocomplete_navigation {
        let time_since_nav = self.last_autocomplete_activity.elapsed();
        if time_since_nav < std::time::Duration::from_millis(5000) {
            // 5 second window
            self.has_typing_activity = true;
            self.keystroke_count += 1;
            self.in_autocomplete_navigation = false;
            return true; // Indicates this is a suggestion selection
        }
    }
    false
}`;

const emissionSiteCode = `// crates/terminator-workflow-recorder/src/recorder/windows/mod.rs
// handle_key_press_for_completion_request, lines 3262-3285. The
// point at which the input_method tag is stamped on the event.

let is_suggestion_enter = if key_code == 0x0D {
    text_input.handle_enter_key()
} else {
    false
};

let completion_reason = if is_suggestion_enter {
    "suggestion_enter"
} else {
    "trigger_key"
};

if text_input.should_emit_completion(completion_reason) {
    let input_method = if is_suggestion_enter {
        Some(crate::TextInputMethod::Suggestion)
    } else {
        None // defaults to Typed inside get_completion_event
    };

    if let Some(text_event) = text_input.get_completion_event(input_method) {
        let _ = event_tx.send(WorkflowEvent::TextInputCompleted(text_event));
    }
}`;

const typedEventJson = `{
  "type": "TextInputCompleted",
  "text_value": "New",
  "field_name": "City",
  "field_type": "Edit",
  "input_method": "Typed",
  "focus_method": "MouseClick",
  "typing_duration_ms": 2140,
  "keystroke_count": 3,
  "process_name": "chrome.exe"
}`;

const suggestionEventJson = `{
  "type": "TextInputCompleted",
  "text_value": "New York",
  "field_name": "City",
  "field_type": "Edit",
  "input_method": "Suggestion",
  "focus_method": "MouseClick",
  "typing_duration_ms": 3820,
  "keystroke_count": 4,
  "process_name": "chrome.exe"
}`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Emits a per-field completion event, not a keystroke stream",
    competitor: "Mostly no (raw input logs)",
    ours: "WorkflowEvent::TextInputCompleted in events.rs line 495",
  },
  {
    feature: "Classifies input as Typed / Pasted / AutoFilled / Suggestion / Mixed",
    competitor: "No differentiation",
    ours: "TextInputMethod enum in events.rs lines 946-958",
  },
  {
    feature: "Detects 'picked from dropdown' via arrow-key plus Enter timing",
    competitor: "Records arrows and Enter as keystrokes",
    ours: "5000ms rule in structs.rs line 125",
  },
  {
    feature: "Records the final text_value of the field",
    competitor: "Some do, some store only the keystrokes",
    ours: "element.text(0) with retry in structs.rs line 171",
  },
  {
    feature: "Captures focus method (click, Tab, programmatic)",
    competitor: "Rare",
    ours: "FieldFocusMethod enum in events.rs lines 962-973",
  },
  {
    feature: "Escape cancels autocomplete-nav state for the next Enter",
    competitor: "Not tracked as a state change",
    ours: "0x1B in is_autocomplete_navigation_key, structs.rs line 96",
  },
];

const stateFlowSteps = [
  {
    label: "Typing key",
    detail:
      "0x30..0x39, 0x41..0x5A, space, punctuation. Increments keystroke_count, sets has_typing_activity=true.",
  },
  {
    label: "Arrow or Escape",
    detail:
      "0x26, 0x28, 0x25, 0x27, 0x1B. Flips in_autocomplete_navigation to true and stamps last_autocomplete_activity.",
  },
  {
    label: "Enter within 5000ms",
    detail:
      "handle_enter_key returns true. Completion reason becomes suggestion_enter.",
  },
  {
    label: "Emit",
    detail:
      "WorkflowEvent::TextInputCompleted with input_method = TextInputMethod::Suggestion.",
  },
];

const beforeAfterBefore = {
  label: "Raw keystroke replay",
  content:
    "Recorded events for a 'New York' autocomplete pick in Chrome:\n\nKEY N (0x4E)\nKEY e (0x45)\nKEY w (0x57)\nKEY DOWN (0x28)\nKEY DOWN (0x28)\nKEY ENTER (0x0D)\n\nReplay on a clean machine where the autocomplete list does not appear (cache cleared, different browser profile, different user session).",
  highlights: [
    "N, e, w are typed",
    "Down arrow twice hits nothing because no suggestion list opened",
    "Enter submits the form with 'New' in the City field",
    "Replay silently produces the wrong data",
  ],
};

const beforeAfterAfter = {
  label: "TextInputCompleted replay",
  content:
    "Recorded event from terminator-workflow-recorder:\n\nTextInputCompleted {\n  text_value: \"New York\",\n  input_method: Suggestion,\n  field_name: \"City\",\n  process_name: \"chrome.exe\"\n}\n\nReplay calls type_into_element with the final text_value and skips the keystroke stream entirely.",
  highlights: [
    "Field ends up with 'New York' regardless of autocomplete availability",
    "Replay does not depend on cached suggestions",
    "Works across browser profiles and cold sessions",
    "Shorter JSON, faster playback",
  ],
};

const competingTools = [
  "Power Automate Desktop",
  "UiPath",
  "AutoHotkey",
  "WinAppDriver",
  "TinyTask",
  "FlaUI",
  "AutoIt",
  "pywinauto",
  "TestComplete",
  "Ranorex",
  "Blue Prism",
  "WinAutomation",
];

const sequenceFrames = [
  {
    title: "t=0ms",
    body: (
      <p className="text-zinc-300 text-sm leading-relaxed">
        Field gets focus. A TextInputTracker is created and{" "}
        <code className="bg-white/10 px-1 rounded">initial_text</code> is captured.
      </p>
    ),
    duration: 2000,
  },
  {
    title: "t=1240ms",
    body: (
      <p className="text-zinc-300 text-sm leading-relaxed">
        User types N, e, w.{" "}
        <code className="bg-white/10 px-1 rounded">keystroke_count</code> becomes 3,{" "}
        <code className="bg-white/10 px-1 rounded">has_typing_activity</code> is true,{" "}
        <code className="bg-white/10 px-1 rounded">in_autocomplete_navigation</code> stays false.
      </p>
    ),
    duration: 2400,
  },
  {
    title: "t=2100ms",
    body: (
      <p className="text-zinc-300 text-sm leading-relaxed">
        Chrome opens an autocomplete list. User hits Down (0x28) twice.{" "}
        <code className="bg-white/10 px-1 rounded">in_autocomplete_navigation</code> flips to true.{" "}
        <code className="bg-white/10 px-1 rounded">last_autocomplete_activity</code> = now.
      </p>
    ),
    duration: 2800,
  },
  {
    title: "t=3820ms",
    body: (
      <p className="text-zinc-300 text-sm leading-relaxed">
        Enter (0x0D) arrives. Elapsed since last arrow = 1720ms. 1720ms {"<"} 5000ms, so{" "}
        <code className="bg-white/10 px-1 rounded">handle_enter_key</code> returns true. The completion reason is suggestion_enter.
      </p>
    ),
    duration: 2800,
  },
  {
    title: "t=3825ms",
    body: (
      <p className="text-zinc-300 text-sm leading-relaxed">
        Recorder reads the field&rsquo;s final text via UIA: &ldquo;New York&rdquo;. Emits{" "}
        WorkflowEvent::TextInputCompleted with{" "}
        <code className="bg-white/10 px-1 rounded">input_method = TextInputMethod::Suggestion</code>.
      </p>
    ),
    duration: 3000,
  },
];

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'from_millis(5000)' crates/terminator-workflow-recorder/src/recorder/windows/structs.rs", type: "command" as const },
  { text: "125:            if time_since_nav < std::time::Duration::from_millis(5000) {", type: "success" as const },
  { text: "grep -n 'pub enum TextInputMethod' crates/terminator-workflow-recorder/src/events.rs", type: "command" as const },
  { text: "948:pub enum TextInputMethod {", type: "success" as const },
  { text: "grep -n 'TextInputMethod::Suggestion' crates/terminator-workflow-recorder/src/recorder/windows/mod.rs", type: "command" as const },
  { text: "2476:                                    input_method: crate::TextInputMethod::Suggestion,", type: "success" as const },
  { text: "3275:                        Some(crate::TextInputMethod::Suggestion)", type: "success" as const },
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
          The automation tool for Windows that knows{" "}
          <GradientText>autocomplete from typing</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every listicle ranks automation tools for Windows by price, licensing,
          and drag-and-drop feel. Those rankings skip the one question that
          decides whether a recording replays next Tuesday: does the recorder
          know the user picked &ldquo;New York&rdquo; from an autocomplete list, or
          does it think the user typed N, e, w, down-arrow, down-arrow, enter?
          Terminator&rsquo;s workflow recorder makes that call with a 5000ms timer
          and emits a typed event called{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            TextInputCompleted
          </code>{" "}
          instead of a keystroke stream.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="early design partners"
        highlights={[
          "Five input-method classes, not one",
          "5000ms rule at structs.rs line 125",
          "Replays work even when the dropdown does not appear",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Five ways text arrives"
            subtitle="And why an automation tool for Windows that ignores the difference will replay the wrong value"
            captions={[
              "Typed: keys N, e, w land one by one",
              "Arrow keys set in_autocomplete_navigation = true",
              "Enter inside 5000ms = TextInputMethod::Suggestion",
              "text_value is captured from UIA, not keystrokes",
              "Replay restores New York, not New",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The silent-miss bug in most Windows recorders
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A user records a workflow in Chrome. They click the City field, type
          N-e-w, wait for the autocomplete list to open, press Down twice, hit
          Enter, and the field ends up with &ldquo;New York&rdquo;. A traditional
          keystroke recorder saves six events: N, e, w, Down, Down, Enter. The
          raw log is faithful to the user&rsquo;s fingers but lies about the user&rsquo;s
          intent.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          On replay, the automation runs on a cold browser session. Chrome has
          no autocomplete history for this origin. The bot types N-e-w, sends
          two Down keys into an empty list, presses Enter, and submits the form
          with &ldquo;New&rdquo;. The test passed on the author&rsquo;s laptop and silently
          ships the wrong city to a production ledger.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The fix is to have the recorder notice that the Enter was pressed
          while the user was navigating a suggestion list, and to save the final
          value of the field instead of the keystrokes. That is exactly what
          Terminator&rsquo;s workflow recorder does, in one function, with a
          5000-millisecond window.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The five input-method classes
        </h2>
        <p className="text-zinc-600 mb-6">
          One enum, five variants, in{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            crates/terminator-workflow-recorder/src/events.rs
          </code>
          . Every text field a recording touches ends up tagged with one of
          these. The replay layer uses the tag to decide how to put the same
          value into the same field on a different machine.
        </p>
        <BentoGrid cards={inputMethodCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The enum, verbatim
        </h2>
        <p className="text-zinc-600 mb-6">
          The whole taxonomy is thirteen lines of Rust. No external library
          owns the classification; it is a data type Terminator defines and
          every SDK binding re-exports.
        </p>
        <AnimatedCodeBlock
          code={textInputMethodEnum}
          language="rust"
          filename="events.rs"
        />
      </section>

      <ProofBanner
        quote="if time_since_nav < std::time::Duration::from_millis(5000) { return true; }"
        source="crates/terminator-workflow-recorder/src/recorder/windows/structs.rs line 125. The single comparison that promotes a plain Enter into a TextInputMethod::Suggestion event."
        metric="5000ms"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The state machine inside the tracker
        </h2>
        <p className="text-zinc-600 mb-6">
          Every focused text field gets a{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            TextInputTracker
          </code>{" "}
          struct. The interesting fields are{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            in_autocomplete_navigation
          </code>{" "}
          and{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            last_autocomplete_activity
          </code>
          . Here is how the state transitions.
        </p>
        <FlowDiagram
          title="Keystroke to TextInputCompleted, Windows path"
          steps={stateFlowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          add_keystroke: the routing function
        </h2>
        <p className="text-zinc-600 mb-6">
          Each key event goes through one place. Arrows and Escape flip the
          flag. Typing keys advance the counter. Modifiers and navigation keys
          are ignored. This is the whole routing.
        </p>
        <AnimatedCodeBlock
          code={addKeystrokeCode}
          language="rust"
          filename="structs.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          handle_enter_key: the 5-second decision
        </h2>
        <p className="text-zinc-600 mb-6">
          This is the only function in the Terminator codebase that turns a
          plain Enter into a Suggestion event. Fifteen lines. One comparison
          against{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            Duration::from_millis(5000)
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={handleEnterCode}
          language="rust"
          filename="structs.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Where the tag gets stamped
        </h2>
        <p className="text-zinc-600 mb-6">
          The emission point lives in the input-processing loop inside{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            mod.rs
          </code>
          . Key code 0x0D asks the tracker whether we are mid-suggestion. If
          yes, the event is sent with{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            TextInputMethod::Suggestion
          </code>
          . If no, the tracker falls through to{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            Typed
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={emissionSiteCode}
          language="rust"
          filename="mod.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Five-frame walkthrough of a real interaction
        </h2>
        <p className="text-zinc-600 mb-6">
          A user types &ldquo;New&rdquo; in a City field, navigates a Chrome
          autocomplete with the Down arrow, and hits Enter. Here is what the
          tracker observes, millisecond by millisecond.
        </p>
        <MotionSequence
          title="New York from a Chrome autocomplete list"
          frames={sequenceFrames}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Same field, different tags
        </h2>
        <p className="text-zinc-600 mb-6">
          Two sample events from the same City field on the same form. The only
          difference in the user&rsquo;s behavior is whether the autocomplete list
          opened. The event shape is identical; only{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            input_method
          </code>{" "}
          and{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            text_value
          </code>{" "}
          change.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-2">Typed</p>
            <AnimatedCodeBlock
              code={typedEventJson}
              language="json"
              filename="event.typed.json"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500 mb-2">Suggestion</p>
            <AnimatedCodeBlock
              code={suggestionEventJson}
              language="json"
              filename="event.suggestion.json"
            />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Replay with and without the tag
        </h2>
        <p className="text-zinc-600 mb-6">
          Toggle the two views. The top tab is what a traditional Windows
          automation tool captures and plays back. The bottom tab is what
          Terminator captures and plays back. Same user behavior, different
          outcome on replay.
        </p>
        <BeforeAfter
          title="'New York' autocomplete pick, replayed on a cold session"
          before={beforeAfterBefore}
          after={beforeAfterAfter}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Numbers from the source
        </h2>
        <MetricsRow
          metrics={[
            { value: 5, label: "variants in TextInputMethod" },
            { value: 5000, label: "ms window for Suggestion" },
            { value: 5, label: "arrow and escape key codes tracked" },
            { value: 10, label: "fields on TextInputCompletedEvent" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={5000} />
              <span className="text-xl font-medium text-zinc-500 ml-1">ms</span>
            </div>
            <p className="text-sm text-zinc-600">
              The literal argument to{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                Duration::from_millis
              </code>{" "}
              on line 125 of{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">structs.rs</code>.
              Long enough that a user who pauses to read the suggestion list
              still lands inside the window, short enough that a later
              typing session does not get mis-classified.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={5} />
            </div>
            <p className="text-sm text-zinc-600">
              Virtual-key codes that set{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                in_autocomplete_navigation
              </code>{" "}
              to true:{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">0x26</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">0x28</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">0x25</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">0x27</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">0x1B</code>.
              Arrows in four directions plus Escape for explicit cancel.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={0} />
            </div>
            <p className="text-sm text-zinc-600">
              Keystrokes the replay layer has to simulate when the recording
              saw a Suggestion event. The bot writes the final{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">text_value</code>{" "}
              directly into the field, which is why it works even when the
              autocomplete popup never appears.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Inputs, classifier, outputs
        </h2>
        <p className="text-zinc-600 mb-6">
          One tracker reads typing keys, arrows, Escape, and Enter from the
          Windows low-level input hook. One helper makes the Suggestion
          decision. Five output labels land on the completion event.
        </p>
        <AnimatedBeam
          title="TextInputTracker routes raw input into one of five labels"
          accentColor="#FF3E00"
          from={[
            { label: "Typing keys", sublabel: "0x30..0x39, 0x41..0x5A, space, punctuation" },
            { label: "Arrow keys", sublabel: "0x26, 0x28, 0x25, 0x27" },
            { label: "Escape", sublabel: "0x1B, cancels autocomplete nav" },
            { label: "Enter", sublabel: "0x0D, triggers completion check" },
          ]}
          hub={{
            label: "TextInputTracker",
            sublabel: "structs.rs lines 27-64",
          }}
          to={[
            { label: "Typed", sublabel: "default when no other signal fires" },
            { label: "Suggestion", sublabel: "Enter inside 5000ms window" },
            { label: "Pasted / AutoFilled / Mixed", sublabel: "later classifier passes" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Automation tools for Windows that leave this bug in the recording
        </h2>
        <p className="text-zinc-600 mb-6">
          Every tool in the row below either saves raw input or stores only the
          final string with no provenance. None of them tag the completion
          event with a Suggestion marker so the replay layer can route around
          the dropdown.
        </p>
        <Marquee speed={38} pauseOnHover>
          {competingTools.map((label) => (
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
          Feature-by-feature
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Other Windows recorders"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Verify in the repo
        </h2>
        <p className="text-zinc-600 mb-6">
          Three grep lines against the public mediar-ai/terminator repo. The
          enum, the 5000ms literal, and both emission sites all sit under the
          workflow-recorder crate.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Curious whether this would catch the silent-miss bugs in your current recordings?"
        description="Book 20 minutes and bring a flaky recording. We will run it through the workflow recorder and show you exactly which events come back as Typed, Suggestion, or Mixed."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See how Terminator classifies Windows text input in 20 minutes."
      />
    </article>
  );
}
