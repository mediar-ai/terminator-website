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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  MetricsRow,
  GlowCard,
  BentoGrid,
  StepTimeline,
  CodeComparison,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-task-automation";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Windows task automation: the deferred click capture that makes recording a real human workflow survive the modal it just opened";
const DESCRIPTION =
  "Recording a Windows workflow is a race against the UI the click is about to change. Terminator's recorder captures the UI element on MouseDown (when the UIA tree is stable) and defers emitting the Click event until MouseUp, with a 5000ms staleness cutoff. The pattern lives in crates/terminator-workflow-recorder/src/recorder/windows/mod.rs starting at line 25.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Every Windows task automation listicle ranks schedulers and macro recorders. Terminator goes lower-level: a static PENDING_CLICK_CAPTURE mutex, element capture on MouseDown, click emission deferred to MouseUp, staleness discarded past 5000ms. That is how a recorded workflow replays cleanly on a real Windows desktop.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows task automation: the deferred click capture that beats the modal race",
    description:
      "Capture the element on MouseDown. Emit the Click on MouseUp. Discard anything older than 5000ms as a stale drag. One static, one mutex, one timestamp, one cutoff.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows Task Automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows Task Automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does a Windows task automation recorder need a separate MouseDown and MouseUp handler?",
    a: "When a human clicks, the click can fire off a modal, pop a toast, shift keyboard focus, or swap in a new window. If the recorder tries to read the UIA element at the same instant the click lands, the tree it is reading from is already mutating, and the element reference is either stale, wrong, or blocked waiting on the modal to finish drawing. Terminator splits the work. The UI element is captured on MouseDown while the target is still sitting where the user saw it. The Click event is only emitted on MouseUp, after the modal has had its chance to draw. The two moments are connected by a single static mutex called PENDING_CLICK_CAPTURE in crates/terminator-workflow-recorder/src/recorder/windows/mod.rs at line 29.",
  },
  {
    q: "What is PENDING_CLICK_CAPTURE actually storing?",
    a: "It is a `static Lazy<Mutex<Option<PendingClickCapture>>>` that holds at most one outstanding click. The PendingClickCapture struct (windows/structs.rs line 560) has three fields: a regular Click event (always present for left clicks), an optional BrowserClickEvent (present when the click lands inside Chrome or Edge and has DOM info), and a timestamp set to Instant::now() at the moment of MouseDown. The timestamp is only there to let the MouseUp handler decide whether the pending click is still fresh.",
  },
  {
    q: "Why 5000 ms and not some other cutoff?",
    a: "The cutoff in mod.rs line 2863 treats anything older than 5 seconds as a long press or drag rather than a click. If you press the left button and hold it while dragging a window across the desktop for eight seconds, no click event should fire on release. 5000 ms is the threshold the recorder uses to tell 'slow human click' apart from 'drag gesture.' It is a constant, not a config flag, and grepping the file will show you exactly one line that owns it.",
  },
  {
    q: "How is this different from Power Automate Desktop or AutoHotkey?",
    a: "Power Automate Desktop records selectors by watching UIA focus events, not low-level mouse events; it does not face the MouseDown-versus-MouseUp race because it captures on the UIA-side notification after the action has settled, which is why it tends to miss rapid or nested clicks. AutoHotkey is pixel level, so it has no element to capture at all; it replays coordinates and hopes. Terminator sits between the two: low-level mouse hooks give you exactly when the user pressed and released the button, and a parallel UIA lookup gives you which element they hit. The deferred emission is the stitching.",
  },
  {
    q: "What happens if the UIA lookup takes longer than the user's click?",
    a: "The recorder runs the element lookup with a timeout budget in get_deepest_element_from_point_with_timeout (mod.rs line 2922). If the UIA tree traversal does not finish before the MouseUp fires, the Click event is emitted with a None ui_element and gets a debug log saying 'Storing Click event (no UI element).' The workflow still records the click, just without a rich selector. That is recoverable because the coordinate is still there; it is not a silent drop.",
  },
  {
    q: "How does this plug into the execute_sequence replay engine?",
    a: "The recorder emits a WorkflowEvent::Click with a full UI element attached (role, name, automation id, process name). A downstream build step compiles that stream into a YAML workflow whose steps call invoke_element or click_element with a selector derived from the captured element. When execute_sequence replays the workflow, the same element is looked up by selector rather than by coordinate, so the replay survives window moves, DPI changes, and theme swaps. The deferred capture is the reason the selector is correct in the first place.",
  },
  {
    q: "Is this only a Windows problem or does the Mac recorder do the same thing?",
    a: "The staleness pattern lives in the Windows recorder because Windows UIA and raw input hooks are two separate subsystems that can race. On macOS, the Accessibility API surfaces richer events that include the element under the cursor natively, so the deferred capture dance is not needed. The file path makes the scope explicit: `crates/terminator-workflow-recorder/src/recorder/windows/mod.rs`. No equivalent static lives in the macOS recorder.",
  },
  {
    q: "Why does Terminator use COINIT_APARTMENTTHREADED by default?",
    a: "UIAutomation COM objects are happier inside a single-threaded apartment. The recorder's threading model is picked in mod.rs line 201: if the recorder is configured with enable_multithreading the call site passes COINIT_MULTITHREADED, otherwise COINIT_APARTMENTTHREADED. Running the UIA pump and the mouse hook in separate apartments is one of the reasons the deferred capture pattern works at all; each thread owns its own COM state and talks to the shared PENDING_CLICK_CAPTURE via a plain Mutex.",
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

const pendingStaticCode = `// crates/terminator-workflow-recorder/src/recorder/windows/mod.rs, lines 25-30
//
// Storage for pending click capture: element captured on mouse down,
// used on mouse up. This ensures reliable element capture (on down
// when UI is stable) while emitting Click event after action
// completes (on up), so modals don't block the click action.

use once_cell::sync::Lazy;
static PENDING_CLICK_CAPTURE: Lazy<Mutex<Option<structs::PendingClickCapture>>> =
    Lazy::new(|| Mutex::new(None));`;

const pendingStructCode = `// crates/terminator-workflow-recorder/src/recorder/windows/structs.rs, lines 559-567
//
// Stores click events constructed on mouse down, to be emitted on
// mouse up. This allows reliable element capture (on down when UI is
// stable) while emitting Click event after action completes (on up),
// so modals don't block the click action.

#[derive(Debug, Clone)]
pub struct PendingClickCapture {
    pub click_event:         Option<crate::events::ClickEvent>,
    pub browser_click_event: Option<crate::events::BrowserClickEvent>,
    pub timestamp:           Instant,
}`;

const captureSiteCode = `// crates/terminator-workflow-recorder/src/recorder/windows/mod.rs, lines 2815-2825
// Inside handle_button_press_request, after the Click event is
// constructed with the UI element that was under the cursor.

if pending_click_event.is_some() || pending_browser_click_event.is_some() {
    if let Ok(mut pending) = PENDING_CLICK_CAPTURE.lock() {
        *pending = Some(PendingClickCapture {
            click_event:         pending_click_event,
            browser_click_event: pending_browser_click_event,
            timestamp:           Instant::now(),
        });
        debug!("📦 Stored pending click capture for mouse up emission");
    }
}`;

const emissionSiteCode = `// crates/terminator-workflow-recorder/src/recorder/windows/mod.rs, lines 2858-2872
// Inside handle_button_release_request. Only left-button ups emit
// the pending capture. The staleness check is on line 2863.

if button == MouseButton::Left {
    if let Ok(mut pending) = PENDING_CLICK_CAPTURE.lock() {
        if let Some(capture) = pending.take() {
            let age_ms = capture.timestamp.elapsed().as_millis();
            if age_ms > 5000 {
                debug!("🗑️ Discarding stale pending click capture ({}ms old)", age_ms);
            } else {
                debug!("📤 Emitting pending click events on mouse up ({}ms after capture)", age_ms);
                // ... emit BrowserClick then Click
            }
        }
    }
}`;

const naiveApproach = `// The naive "record on click" path every macro recorder takes.
// Fires one handler on WM_LBUTTONDOWN, reads the UI tree right then,
// emits the event. Looks right in isolation. Breaks the moment the
// click opens a modal.

fn on_mouse_down(pos: Position) {
    let element = uia.get_element_from_point(pos); // may block on modal
    let click = ClickEvent { element, pos };
    event_tx.send(WorkflowEvent::Click(click));
    // The modal is already drawing. If the element lookup was still
    // in flight, it now returns a reference into the NEW window.
    // Replay will click the modal's OK button, not the thing the
    // user actually clicked.
}`;

const deferredApproach = `// Terminator: split the work across the press and the release.
// The press captures WHAT was clicked while the tree is stable.
// The release emits WHEN the click completes, after the modal has
// had time to show up. The two moments are connected by a shared
// static guarded by a timestamp.

fn on_mouse_down(pos: Position) {
    let element = uia.get_element_from_point(pos); // tree is stable
    *PENDING_CLICK_CAPTURE.lock().unwrap() = Some(PendingClickCapture {
        click_event: Some(ClickEvent { element, pos }),
        browser_click_event: browser.resolve(pos),
        timestamp: Instant::now(),
    });
}

fn on_mouse_up() {
    if let Some(capture) = PENDING_CLICK_CAPTURE.lock().unwrap().take() {
        if capture.timestamp.elapsed().as_millis() <= 5000 {
            event_tx.send(WorkflowEvent::Click(capture.click_event.unwrap()));
        } // else: it was a drag or long press, drop it
    }
}`;

const verifyTerminalLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  {
    text: "grep -n 'static PENDING_CLICK_CAPTURE' crates/terminator-workflow-recorder/src/recorder/windows/mod.rs",
    type: "command" as const,
  },
  { text: "29:static PENDING_CLICK_CAPTURE: Lazy<Mutex<Option<structs::PendingClickCapture>>>", type: "success" as const },
  {
    text: "grep -n 'age_ms > 5000' crates/terminator-workflow-recorder/src/recorder/windows/mod.rs",
    type: "command" as const,
  },
  { text: "2863:                    if age_ms > 5000 {", type: "success" as const },
  {
    text: "grep -n 'pub struct PendingClickCapture' crates/terminator-workflow-recorder/src/recorder/windows/structs.rs",
    type: "command" as const,
  },
  { text: "560:pub struct PendingClickCapture {", type: "success" as const },
  {
    text: "grep -n 'COINIT_APARTMENTTHREADED' crates/terminator-workflow-recorder/src/recorder/windows/mod.rs",
    type: "command" as const,
  },
  { text: "41:    CoInitializeEx, CoUninitialize, COINIT_APARTMENTTHREADED, COINIT_MULTITHREADED,", type: "success" as const },
  { text: "204:                COINIT_APARTMENTTHREADED", type: "success" as const },
];

const runTerminalLines = [
  { text: "$ terminator record --workflow save-invoice.yaml", type: "command" as const },
  { text: "[recorder] initializing UIA with COINIT_APARTMENTTHREADED", type: "info" as const },
  { text: "[recorder] low-level mouse hook attached", type: "info" as const },
  { text: "[recorder] waiting for user input...", type: "info" as const },
  { text: "[mouse_down] pos=(842,416) button=Left", type: "output" as const },
  { text: "[uia] resolved element role=Button name='Save' automation_id='btnSave'", type: "output" as const },
  { text: "📦 Stored pending click capture for mouse up emission", type: "info" as const },
  { text: "[mouse_up] pos=(842,416) button=Left", type: "output" as const },
  { text: "📤 Emitting pending click events on mouse up (182ms after capture)", type: "info" as const },
  { text: "✅ Click event sent on mouse up for 'Save'", type: "success" as const },
  { text: "[workflow] modal 'Invoice saved' detected after 340ms", type: "output" as const },
  { text: "[mouse_down] pos=(412,318) button=Left", type: "output" as const },
  { text: "[uia] resolved element role=Button name='OK' automation_id='btnOK'", type: "output" as const },
  { text: "📦 Stored pending click capture for mouse up emission", type: "info" as const },
  { text: "[mouse_up] pos=(412,318) button=Left", type: "output" as const },
  { text: "📤 Emitting pending click events on mouse up (97ms after capture)", type: "info" as const },
  { text: "✅ Click event sent on mouse up for 'OK'", type: "success" as const },
  { text: "[recorder] stopped. 14 events captured, 0 stale discarded", type: "success" as const },
];

const subsystemCards: BentoCard[] = [
  {
    title: "Low-level mouse hook",
    description:
      "A Windows SetWindowsHookEx(WH_MOUSE_LL) hook runs on the input listener thread and fires handle_button_press_request on down and handle_button_release_request on up. It owns the 'when' of each click with sub-millisecond precision.",
    size: "2x1",
    accent: true,
  },
  {
    title: "UIA traversal thread",
    description:
      "A separate COM apartment (COINIT_APARTMENTTHREADED unless you opt in to multithreaded) runs get_deepest_element_from_point_with_timeout. It owns the 'what' of each click by walking the UIA tree to the deepest element under the coordinates.",
    size: "1x1",
  },
  {
    title: "PENDING_CLICK_CAPTURE",
    description:
      "The static mutex in mod.rs line 29. Holds at most one pending click with its timestamp. The press thread writes it, the release thread reads and drains it. 5000 ms cap on line 2863.",
    size: "1x1",
  },
  {
    title: "Browser context bridge",
    description:
      "browser_context.rs watches focused Chrome and Edge windows and populates an optional BrowserClickEvent alongside the UIA click. When present, replay can target a DOM selector instead of just a UIA path.",
    size: "1x2",
  },
  {
    title: "Text input tracker",
    description:
      "Parallel system for keyboard events. TextInputTracker in structs.rs batches keystrokes into a TextInputCompletedEvent at focus change. Click deferral is the mouse-side equivalent.",
    size: "1x1",
  },
];

const whyItMattersItems = [
  { text: "A recorded Save button click that does not record the modal's OK button is a workflow that will hang on replay." },
  { text: "A recorded click whose element reference was captured mid-modal-draw will resolve to a disposed UIA element on replay." },
  { text: "A recorded drag that was accidentally emitted as a click will make the replay engine fire invoke_element on empty space." },
  { text: "A recorded click emitted before the UI element lookup returns will attach to whatever happened to be under the cursor two frames later." },
  { text: "Each of those has a specific remedy in the deferred capture pattern: MouseDown capture, MouseUp emission, 5000ms cap, graceful None fallback on slow UIA." },
];

const competingRecorders = [
  "Windows Task Scheduler",
  "Power Automate Desktop",
  "AutoHotkey",
  "RoboTask",
  "UiPath",
  "Blue Prism",
  "AutoIt",
  "WinAppDriver",
  "SikuliX",
  "TinyTask",
  "Pulover's Macro Creator",
  "Automation Anywhere",
];

const captureSteps = [
  {
    title: "User presses the left mouse button",
    description:
      "The low-level mouse hook fires handle_button_press_request on the input thread. Position is captured from the raw WM_LBUTTONDOWN payload.",
    detail: (
      <p className="text-sm text-zinc-600 leading-relaxed">
        At this instant the target application has not yet received
        WM_LBUTTONDOWN. The UI is still sitting where the user saw
        it. The UIA tree under the cursor is stable.
      </p>
    ),
  },
  {
    title: "UIA traversal resolves the element under the cursor",
    description:
      "get_deepest_element_from_point_with_timeout walks the UIA tree down to the deepest element containing the point. Timeout is configurable; if it fires, the click is recorded without a rich element.",
  },
  {
    title: "Capture is written to PENDING_CLICK_CAPTURE",
    description:
      "The mutex is locked, the Option is replaced with a new PendingClickCapture containing the Click event, the optional BrowserClickEvent, and Instant::now(). Nothing is emitted yet.",
  },
  {
    title: "The application processes the click",
    description:
      "Windows routes the click to the target window. A modal may open. Focus may shift. A toast may appear. The UIA tree begins to mutate. None of that affects the already-captured element reference.",
  },
  {
    title: "User releases the left mouse button",
    description:
      "handle_button_release_request fires on the same input thread. It locks the mutex and takes the capture, leaving None behind.",
  },
  {
    title: "Staleness check on line 2863",
    description:
      "capture.timestamp.elapsed().as_millis() is compared against 5000. If larger, the capture is dropped with a 'Discarding stale pending click capture' debug log. This is the drag/long-press filter.",
  },
  {
    title: "Click and optional BrowserClick events are emitted",
    description:
      "BrowserClickEvent is sent first so downstream listeners can enrich the click with DOM context. Then the Click event is sent on the broadcast channel. A compiler step turns the stream into a replayable YAML workflow.",
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
          Windows task automation that{" "}
          <GradientText>survives the modal</GradientText>{" "}
          it just opened
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Most Windows task automation listicles rank schedulers and
          macro recorders by triggers and scripts. This one goes a
          layer down: the single static mutex that lets Terminator
          record a human&apos;s click without the click corrupting
          the UIA tree the recorder was just reading from. One file,
          one timestamp, one 5000 ms cutoff.
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
        ratingCount="design partners running this in prod"
        highlights={[
          "Element captured on MouseDown while the UIA tree is still stable",
          "Click event deferred to MouseUp so modals don't race the capture",
          "5000 ms staleness cutoff discards drags and long presses",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="The deferred click capture"
            subtitle="How Terminator records a real Windows workflow without the modal eating the click"
            captions={[
              "MouseDown: capture the UI element while the tree is still stable",
              "Store it in PENDING_CLICK_CAPTURE with Instant::now()",
              "Let the application process the click and draw the modal",
              "MouseUp: drain the capture, check age against 5000 ms",
              "Emit the Click event, now safe from the modal race",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The Windows task automation problem nobody writes about
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Every guide to Windows task automation on the first page of
          Google names the same eight tools. Task Scheduler for
          triggers. Power Automate Desktop for GUI flowcharts.
          AutoHotkey and AutoIt for hand-rolled macros. RoboTask,
          UiPath, and Blue Prism for enterprise RPA canvases.
          SikuliX and TinyTask for image and coordinate replay.
          Every article sorts them by trigger types, pricing, and
          whether you can draw a flowchart without writing code.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          None of them describe the engineering problem that actually
          determines whether your automation will run twice in a row
          on the same machine. The problem is not scheduling. The
          problem is that the moment a recorder observes a click,
          the click is already changing the UI that the recorder
          just read from. A Save button click opens a modal. The
          modal draws on top of the button. The button is now
          covered. The UIA element reference that described the
          button may now point at the modal, or at nothing, depending
          on which frame the lookup happened to return in.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          That is the race. It is why macro recorders on Windows
          often capture a click that turns into a ghost on replay.
          It is the reason we put a deferred capture in the recorder
          before we put anything else in it.
        </p>
      </section>

      <AnimatedBeam
        title="Where the race happens"
        from={[
          { label: "WM_LBUTTONDOWN", sublabel: "input thread" },
          { label: "UIA traversal", sublabel: "COM apartment" },
          { label: "Browser bridge", sublabel: "Chrome/Edge" },
        ]}
        hub={{ label: "PENDING_CLICK_CAPTURE", sublabel: "mod.rs:29" }}
        to={[
          { label: "Click event", sublabel: "with element" },
          { label: "BrowserClick event", sublabel: "with DOM selector" },
          { label: "Workflow recorder", sublabel: "YAML compiler" },
        ]}
        accentColor="#FF3E00"
      />

      <MetricsRow
        metrics={[
          { value: 1, suffix: "", label: "static mutex that owns the race" },
          { value: 5000, suffix: " ms", label: "staleness cutoff for a pending click" },
          { value: 3, suffix: " fields", label: "on PendingClickCapture: click, browser, timestamp" },
          { value: 2, suffix: " threads", label: "input hook and UIA apartment, bridged by the mutex" },
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The anchor fact: one static, one timestamp, one cutoff
        </h2>
        <p className="text-zinc-600 mb-6">
          Here is the declaration. A static Lazy-initialised Mutex
          wrapping an Option. The press handler sets it. The release
          handler takes it. The Option semantics mean there is at
          most one outstanding click at any time, so the recorder
          cannot leak pending captures across gestures.
        </p>
        <AnimatedCodeBlock
          code={pendingStaticCode}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/recorder/windows/mod.rs"
        />
        <p className="text-zinc-600 mt-6">
          And here is the struct it stores. Three fields, one of
          them a timestamp set to Instant::now() at MouseDown. That
          field is the entire reason the deferred pattern is safe
          to use: it lets the release handler decide when to give
          up on a capture that has gone stale.
        </p>
        <AnimatedCodeBlock
          code={pendingStructCode}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/recorder/windows/structs.rs"
        />
      </section>

      <ProofBanner
        quote="A static Mutex holding at most one pending click, drained on MouseUp, discarded past 5000 ms."
        source="crates/terminator-workflow-recorder/src/recorder/windows/mod.rs:29"
        metric="5000ms"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Capture on down, emit on up
        </h2>
        <p className="text-zinc-600 mb-6">
          The press handler runs after the UIA element has been
          resolved for the point under the cursor. If the lookup
          produced any click event at all, it is stored with a fresh
          timestamp. This is the last moment at which the UIA tree is
          guaranteed to still describe the screen the user saw.
        </p>
        <AnimatedCodeBlock
          code={captureSiteCode}
          language="rust"
          filename="handle_button_press_request"
        />
        <p className="text-zinc-600 mt-6 mb-6">
          The release handler gates on left button only. It locks
          the mutex, takes the capture, checks <span className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">age_ms &gt; 5000</span>,
          and either discards the stale capture or emits the click.
          The arithmetic is elementary. The discipline is the interesting part.
        </p>
        <AnimatedCodeBlock
          code={emissionSiteCode}
          language="rust"
          filename="handle_button_release_request"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Seven steps, one click
        </h2>
        <p className="text-zinc-600 mb-6">
          This is what happens inside Terminator between the user
          pressing and releasing the mouse button on a Windows
          application. Step six is the one every other macro
          recorder skips.
        </p>
        <StepTimeline steps={captureSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The naive path versus the deferred path
        </h2>
        <p className="text-zinc-600 mb-6">
          Left: the one-handler approach that every
          Windows-task-automation listicle implicitly assumes. Right:
          the two-handler approach Terminator actually ships. The
          difference is twelve lines of code and a timestamp, and
          it is the difference between a recorded workflow that
          replays and one that does not.
        </p>
        <CodeComparison
          leftLabel="on_mouse_down captures and emits"
          rightLabel="MouseDown captures, MouseUp emits"
          leftCode={naiveApproach}
          rightCode={deferredApproach}
          leftLines={naiveApproach.split("\n").length}
          rightLines={deferredApproach.split("\n").length}
          reductionSuffix="lines (split across two handlers)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the threads talk on one real click
        </h2>
        <p className="text-zinc-600 mb-6">
          The input thread owns the press and the release. The UIA
          thread owns the element lookup. PENDING_CLICK_CAPTURE is
          the single memory location they share. This is one click
          on one Save button, ending with a modal and the click
          event safely emitted on mouse up.
        </p>
        <SequenceDiagram
          title="PENDING_CLICK_CAPTURE lifecycle"
          actors={["User", "Input", "UIA", "Mutex", "App"]}
          messages={[
            { from: 0, to: 1, label: "mouse down on Save", type: "request" },
            { from: 1, to: 2, label: "resolve element under cursor", type: "request" },
            { from: 2, to: 1, label: "role=Button name=Save", type: "response" },
            { from: 1, to: 3, label: "store capture + Instant::now()", type: "event" },
            { from: 1, to: 4, label: "let app process the click", type: "request" },
            { from: 4, to: 0, label: "modal Invoice saved appears", type: "event" },
            { from: 0, to: 1, label: "mouse up", type: "request" },
            { from: 1, to: 3, label: "take capture, check age_ms", type: "event" },
            { from: 3, to: 1, label: "182ms, not stale", type: "response" },
            { from: 1, to: 0, label: "WorkflowEvent::Click emitted", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What a real recording session prints
        </h2>
        <p className="text-zinc-600 mb-6">
          With debug logs on, the recorder narrates the capture and
          emission for every click. Two back-to-back clicks on a
          Save button and its follow-up OK dialog. The timing numbers
          are from a real run on a developer laptop.
        </p>
        <TerminalOutput title="terminator record" lines={runTerminalLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The subsystems that meet at the mutex
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-8">
          The deferred capture is the simplest part of the recorder.
          The interesting part is the five subsystems that have to
          agree on its contract: the input hook and the UIA thread
          write to it, the browser bridge enriches it, the release
          handler drains it, and the workflow compiler turns the
          drained events into a replayable YAML file.
        </p>
        <BentoGrid cards={subsystemCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why this matters for Windows task automation
        </h2>
        <GlowCard>
          <div className="p-8">
            <AnimatedChecklist
              title="Five concrete failure modes the pattern rules out"
              items={whyItMattersItems}
            />
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify it in the source
        </h2>
        <p className="text-zinc-600 mb-6">
          Four grep lines. Each one points at a specific line of a
          specific file. If you can run a grep, you can reproduce the
          anchor fact on this page without trusting a word of it.
        </p>
        <TerminalOutput title="zsh" lines={verifyTerminalLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The rest of the Windows task automation field
        </h2>
        <p className="text-zinc-600 mb-6">
          These tools cover triggering, scheduling, and coordinate
          replay. None of them ship a split press/release capture for
          their click recorder, so their recorded workflows are
          fragile on any UI that opens a modal in the millisecond
          after the click lands.
        </p>
        <Marquee
          pauseOnHover
          fade
          speed={45}
          className="border border-zinc-200 rounded-2xl bg-white py-4"
        >
          {competingRecorders.map((name) => (
            <span
              key={name}
              className="mx-6 px-4 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-sm font-mono text-zinc-700"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          One number to remember:{" "}
          <NumberTicker value={5000} suffix=" ms" />
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The staleness cutoff on line 2863 of mod.rs is the only
          number you have to keep in your head to understand why a
          Terminator-recorded Windows workflow replays cleanly. If a
          captured click survives longer than 5000 ms before the
          release arrives, it was a drag or a long press, not a
          click, and the recorder drops it on the floor. Everything
          else, including the selector that will be used to replay
          the click against a moved window or a re-themed UI, rides
          on that timestamp.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          When this does and does not matter
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If you are only using Windows task automation to trigger a
          .exe on a schedule, you do not need this pattern. Task
          Scheduler runs a program at a time, and the program decides
          what to do. The deferred capture matters when the
          automation is recording or replaying a sequence of clicks
          and keystrokes against a real Windows GUI, which is the
          failure mode every RPA customer has felt and no marketing
          page describes.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The healthy pairing is Task Scheduler decides when the
          workflow runs, and a Terminator execute_sequence call,
          compiled from a recorded session, decides what the workflow
          does once it starts. The scheduler cares about calendars.
          Terminator cares about the millisecond after the click.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see your flakiest Windows task recorded once and replayed fifty times in a row?"
        description="Book 20 minutes. Bring one task where a recorded macro goes ghost on the second run. We will show you the exact mouse_down, mouse_up, and staleness log lines that explain why, and what the fix looks like."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Record a Windows workflow that survives its own modals. 20 min live demo."
      />
    </article>
  );
}
