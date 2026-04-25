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
  SequenceDiagram,
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
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/automation-testing-for-desktop-application";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Automation testing for desktop application: live MCP event telemetry over a named pipe";
const DESCRIPTION =
  "Every guide to desktop application automation testing tells you how to send clicks. None of them tell you how the test run reports back. Terminator hands each TypeScript desktop test its own Windows Named Pipe at \\\\.\\pipe\\mcp-workflow-events-{execution_id} and forwards eight structured WorkflowEvent variants (progress, step_started, step_completed, step_failed, screenshot, status, log, data) straight into MCP notifications/progress. No stderr scraping, no reporter plugin.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A dedicated named pipe per test run, an __mcp_event__:true JSON tag, and eight structured event variants. The live-telemetry primitive that the typical desktop test tool is missing.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live telemetry for desktop test automation",
    description:
      "TypeScript desktop tests emit __mcp_event__:true JSON to \\\\.\\pipe\\mcp-workflow-events-{execution_id}. Rust agent forwards them as MCP notifications/progress. Source: event_pipe.rs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation testing for desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Automation testing for desktop application",
    url: PAGE_URL,
  },
];

const tagMarkerSource = `// crates/terminator-mcp-agent/src/event_pipe.rs, lines 103-137
// The shape that turns a stdout line into a typed test event.
// Any line lacking "__mcp_event__": true is ignored. That is
// the entire "is this telemetry, or is it println noise?" rule.

#[derive(Debug, Deserialize)]
struct RawEvent {
    #[serde(rename = "__mcp_event__")]
    is_mcp_event: bool,
    #[serde(rename = "type")]
    event_type: String,
    timestamp: String,
    // Progress
    current: Option<f64>,
    total: Option<f64>,
    message: Option<String>,
    // Step lifecycle
    #[serde(rename = "stepId")]      step_id: Option<String>,
    #[serde(rename = "stepName")]    step_name: Option<String>,
    #[serde(rename = "stepIndex")]   step_index: Option<u32>,
    #[serde(rename = "totalSteps")]  total_steps: Option<u32>,
    duration: Option<u64>,
    error: Option<String>,
    // Screenshot
    path: Option<String>,
    base64: Option<String>,
    annotation: Option<String>,
    element: Option<String>,
    // Data + Log
    key: Option<String>,
    value: Option<Value>,
    level: Option<String>,
    data: Option<Value>,
}`;

const pipeServerSource = `// crates/terminator-mcp-agent/src/event_pipe.rs, lines 241-280
// One pipe per execution. The execution_id is the same identifier
// the MCP agent uses for the running workflow, so you can join
// events, logs, and the final ActionResult by that single key.

pub fn generate_pipe_name(execution_id: &str) -> String {
    format!(r"\\\\.\\pipe\\mcp-workflow-events-{}", execution_id)
}

#[cfg(windows)]
impl EventPipeServer {
    pub async fn start(self) -> Result<PipeServerHandle, std::io::Error> {
        use tokio::net::windows::named_pipe::{PipeMode, ServerOptions};

        let server = ServerOptions::new()
            .first_pipe_instance(true) // single client per execution
            .pipe_mode(PipeMode::Byte)
            .create(&self.pipe_name)?;

        info!("Created named pipe: {}", self.pipe_name);
        // ... accept, read lines, try_parse_event, forward to MCP
    }
}`;

const emitEventClient = `// Your test file. @mediar-ai/terminator ships an emit helper that
// writes a tagged JSON line to MCP_EVENT_PIPE_PATH. If the env var
// is unset (local dev, no MCP client attached), the helper no-ops.

import { Desktop, emit } from '@mediar-ai/terminator';

const desktop = new Desktop();

export async function checkoutTest() {
  const STEPS = 4;

  emit.stepStarted({
    stepId: 'launch',
    stepName: 'Open admin dashboard',
    stepIndex: 0,
    totalSteps: STEPS,
  });
  await desktop.launch('AdminDesktop');
  emit.stepCompleted({
    stepId: 'launch',
    stepName: 'Open admin dashboard',
    duration: 612,
    stepIndex: 0,
    totalSteps: STEPS,
  });

  emit.progress({ current: 1, total: STEPS, message: 'Resolving login form' });

  emit.stepStarted({
    stepId: 'login',
    stepName: 'Log in as ops-qa',
    stepIndex: 1,
    totalSteps: STEPS,
  });
  try {
    await desktop
      .locator('window:AdminDesktop >> role:Edit && name:Username')
      .first(3000)
      .then(el => el.typeText('ops-qa'));
  } catch (err) {
    emit.stepFailed({
      stepId: 'login',
      stepName: 'Log in as ops-qa',
      error: String(err),
      duration: 820,
    });
    throw err;
  }
  // ...
  emit.screenshot({
    path: './artifacts/post-login.png',
    annotation: 'Expected dashboard at /admin/home',
  });
}`;

const pipeTerminal = [
  { text: "# Your AI coding assistant launched a workflow run.", type: "info" as const },
  { text: "# The server created an isolated pipe for it.", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "RUST_LOG=info cargo run -p terminator-mcp-agent", type: "command" as const },
  { text: "INFO Created named pipe: \\\\.\\pipe\\mcp-workflow-events-9c48", type: "success" as const },
  { text: "INFO TypeScript connected to event pipe", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Events flow in. Each line is one WorkflowEvent.", type: "info" as const },
  { text: "DEBUG RawEvent { is_mcp_event: true, type: \"step_started\", stepId: \"launch\", ... }", type: "output" as const },
  { text: "DEBUG RawEvent { is_mcp_event: true, type: \"step_completed\", duration: Some(612), ... }", type: "output" as const },
  { text: "DEBUG RawEvent { is_mcp_event: true, type: \"progress\", current: 1.0, total: Some(4.0), ... }", type: "output" as const },
  { text: "DEBUG RawEvent { is_mcp_event: true, type: \"step_started\", stepId: \"login\", ... }", type: "output" as const },
  { text: "DEBUG RawEvent { is_mcp_event: true, type: \"step_failed\", error: Some(\"ElementNotVisible\"), ... }", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Forwarded to MCP as notifications/progress on the session.", type: "info" as const },
  { text: "# The assistant (Claude Code, Cursor, Windsurf) sees them live.", type: "info" as const },
  { text: "INFO Pipe closed by client", type: "success" as const },
];

const eventCards: BentoCard[] = [
  {
    title: "Progress",
    description:
      "current, total, message. Maps 1:1 to MCP notifications/progress so the client can render a real progress bar. The MCP spec treats this as a first-class notification, not a log level. One of the reasons the assistant can show a live status strip while a desktop test runs.",
    size: "2x1",
  },
  {
    title: "StepStarted",
    description:
      "stepId, stepName, stepIndex, totalSteps, timestamp. Stable stepId lets the client join with StepCompleted or StepFailed later. totalSteps lets it compute a percentage without a separate Progress call.",
    size: "1x1",
  },
  {
    title: "StepCompleted",
    description:
      "Adds duration (ms). Feeds a built-in per-step timing chart on the MCP client. Aggregates into regression tables across CI runs.",
    size: "1x1",
  },
  {
    title: "StepFailed",
    description:
      "error + duration. The error string is the typed AutomationError variant from the SDK (ElementObscured, ElementNotStable, Timeout). No parsing. No regex. The retry policy matches on the variant string directly.",
    size: "2x1",
  },
  {
    title: "Screenshot",
    description:
      "path OR base64, plus annotation and element. Attached inline to whichever step is in flight. The MCP client decides whether to cache to disk or render in the chat window.",
    size: "1x1",
  },
  {
    title: "Status",
    description:
      "text, durationMs, position. Short-lived on-screen banner that can render over the app under test. Used for 'waiting 5 s for enabled Refund button' when the run is interactive.",
    size: "1x1",
  },
  {
    title: "Log",
    description:
      "level (debug, info, warn, error), message, data. Routes through log_pipe.rs and forward_log_to_tracing so the same level reaches the MCP agent's tracing subscriber. One log line, zero stderr.",
    size: "1x1",
  },
  {
    title: "Data",
    description:
      "key + value (any JSON). The catch-all for custom test telemetry that is not a step or a log. Durations, network traces, memory snapshots, whatever your runner wants to reason about later.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Where test telemetry goes",
    competitor:
      "Stdout and stderr, scraped by a reporter plugin. Vendor reporters for each CI platform.",
    ours:
      "A dedicated Windows Named Pipe per execution. JSON lines tagged __mcp_event__:true. No scraping.",
  },
  {
    feature: "Isolation between parallel runs",
    competitor:
      "File locks or process env vars. Log interleaving when two workers share the same runner.",
    ours:
      "Pipe name includes the execution_id. Two runs = two pipes. first_pipe_instance(true) enforces one writer.",
  },
  {
    feature: "Protocol the test speaks",
    competitor:
      "Proprietary reporter API, or JUnit XML written at end of run.",
    ours:
      "MCP notifications/progress. The same protocol the AI coding assistant already speaks to the agent.",
  },
  {
    feature: "Step lifecycle as first-class events",
    competitor:
      "'beforeEach' + 'afterEach' hooks that log lines. Reporter infers the shape from them.",
    ours:
      "Four structured variants: StepStarted, StepCompleted, StepFailed, and an out-of-band Progress. Typed in Rust, Zod-shaped in TS.",
  },
  {
    feature: "Screenshot attached to a step",
    competitor:
      "Save file, log path, hope the reporter correlates by filename pattern.",
    ours:
      "Screenshot variant with path or base64, plus the annotation + element fields. Attached inline to the in-flight step.",
  },
  {
    feature: "Live vs. post-mortem",
    competitor:
      "Usually post-mortem. Reporter compiles the final report after the run exits.",
    ours:
      "Live. The MCP agent forwards events as they arrive. The assistant sees step 2 of 4 while step 3 is executing.",
  },
  {
    feature: "Stderr pollution",
    competitor:
      "High. Every log line competes with the reporter format.",
    ours:
      "Zero. Events go to the pipe, logs go through forward_log_to_tracing. Stderr stays clean for panics only.",
  },
  {
    feature: "License of the protocol",
    competitor:
      "Proprietary or copy-left depending on the vendor.",
    ours:
      "MIT. event_pipe.rs + log_pipe.rs are 866 + 458 lines you can fork.",
  },
];

const sequenceActors = [
  "TS test",
  "Named pipe",
  "Rust MCP agent",
  "AI assistant",
];

const sequenceMessages: {
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}[] = [
  {
    from: 2,
    to: 0,
    label: "MCP_EVENT_PIPE_PATH env var (unique per run)",
    type: "request",
  },
  { from: 2, to: 1, label: "ServerOptions::new().create(pipe_name)", type: "event" },
  {
    from: 0,
    to: 1,
    label: "connect() + write {\"__mcp_event__\":true,\"type\":\"step_started\",...}",
    type: "event",
  },
  {
    from: 1,
    to: 2,
    label: "BufReader::lines() -> try_parse_event -> WorkflowEvent",
    type: "response",
  },
  {
    from: 2,
    to: 3,
    label: "notifications/progress { progressToken, progress, total, message }",
    type: "response",
  },
  {
    from: 0,
    to: 1,
    label: "{\"__mcp_event__\":true,\"type\":\"step_failed\",\"error\":\"ElementObscured\"}",
    type: "error",
  },
  {
    from: 1,
    to: 2,
    label: "WorkflowEvent::StepFailed { error: Some(\"ElementObscured\"), duration: 420 }",
    type: "error",
  },
  {
    from: 2,
    to: 3,
    label: "notifications/message (ERROR level)",
    type: "error",
  },
  {
    from: 0,
    to: 1,
    label: "pipe close (EOF)",
    type: "event",
  },
  {
    from: 1,
    to: 2,
    label: "Ok(None) from next_line; drop PipeServerHandle",
    type: "response",
  },
];

const eventChips = [
  "Progress",
  "StepStarted",
  "StepCompleted",
  "StepFailed",
  "Screenshot",
  "Status",
  "Log",
  "Data",
];

const beamNodes = {
  from: [
    { label: "emit.stepStarted", sublabel: "TS, in-process" },
    { label: "emit.progress", sublabel: "TS, in-process" },
    { label: "emit.screenshot", sublabel: "TS, path or base64" },
    { label: "console.log", sublabel: "via log_pipe.rs" },
  ],
  hub: {
    label: "mcp-workflow-events-{id}",
    sublabel: "Windows Named Pipe",
  },
  to: [
    { label: "tracing subscriber", sublabel: "JSON lines on disk" },
    { label: "MCP client", sublabel: "notifications/progress" },
    { label: "execution_logger.rs", sublabel: ".json + .ts + .png per call" },
    { label: "PostHog tool timings", sublabel: "aggregated per step" },
  ],
};

const metrics = [
  { value: 8, label: "WorkflowEvent variants" },
  { value: 866, label: "Lines in event_pipe.rs" },
  { value: 458, label: "Lines in log_pipe.rs" },
  { value: 1, label: "Pipe per execution" },
];

const wiringSteps = [
  {
    title: "Spawn the TypeScript test under the MCP agent",
    description:
      "When the assistant calls the execute_sequence tool, the Rust server creates an EventPipeServer with the run's execution_id, passes the pipe path to the TS child process via MCP_EVENT_PIPE_PATH, then awaits on connect(). The child runs under bun (preferred) or node.",
  },
  {
    title: "Emit tagged JSON lines from the test",
    description:
      "The @mediar-ai/terminator package ships an emit helper. Every emit.* writes a JSON line with __mcp_event__:true to the pipe path from the env var. If the env var is missing (you are running the file with plain bun locally, no MCP), the helper no-ops. Your test works in both modes without a flag.",
  },
  {
    title: "Rust parses each line with try_parse_event",
    description:
      "try_parse_event inspects the leading byte (must be {), deserializes into RawEvent, checks is_mcp_event, then matches event_type into one of the eight WorkflowEvent variants. Unknown types fall through to a debug log and keep the pipe alive.",
  },
  {
    title: "Forward events as MCP notifications",
    description:
      "Progress variants become notifications/progress on the in-flight tool call token. StepFailed and error-level Log variants become notifications/message at ERROR. Screenshot variants can be surfaced as structuredContent on the final tool result, or streamed inline depending on the client capability.",
  },
  {
    title: "Close the pipe when the TS run exits",
    description:
      "The child's stdout close triggers next_line() returning Ok(None), the reader loop exits, PipeServerHandle is dropped, the server tears down. The next execute_sequence creates a fresh pipe with a fresh execution_id. No leaks, no reuse across runs.",
  },
];

const capabilityChecks = [
  {
    text: "Render a live per-step progress bar in the assistant while a Windows desktop test runs, without a reporter plugin",
  },
  {
    text: "Fail a step with a typed AutomationError variant (ElementObscured, ElementNotStable) and have the assistant retry based on the variant",
  },
  {
    text: "Attach a screenshot to a specific step by stepId, not by filename correlation",
  },
  {
    text: "Run two desktop tests in parallel on one runner without log interleaving or reporter races",
  },
  {
    text: "Emit an arbitrary Data event with custom JSON so a downstream dashboard can aggregate it across runs",
  },
  {
    text: "Keep stderr clean for real panics only. console.log does not flood the MCP transport.",
  },
  {
    text: "Correlate events to the final ActionResult by execution_id because the pipe name already contains it",
  },
  {
    text: "Write the test once and have it run with or without the MCP agent attached; emit is a no-op if MCP_EVENT_PIPE_PATH is unset",
  },
];

const faqs = [
  {
    q: "Why is live test telemetry even a problem on the desktop? CI tools handle it for browsers.",
    a: "Browser tests talk to a headless Chromium in the same process tree. Playwright hands you an internal events API (test.beforeEach, reporter, onStepBegin) and the reporter runs in the same node process. Desktop test runs do not get that for free. The test process drives Win32 UI via UIAutomation, which lives in a separate COM service; the test framework is a second process; and if an AI coding assistant is watching over MCP, that is a third boundary. Stdout and stderr become the lowest common denominator, which is why most desktop test tools end up with a reporter plugin that scrapes lines. Terminator replaces that scraping surface with a dedicated Windows Named Pipe per execution and a JSON line protocol tagged __mcp_event__:true. The pipe is created by the Rust MCP agent on the fly, its path is handed to the test child via the MCP_EVENT_PIPE_PATH env var, and the test emits with a tiny helper from @mediar-ai/terminator. That is the design choice the other playbooks skip.",
  },
  {
    q: "What distinguishes a test event from an ordinary log line?",
    a: "The string \"__mcp_event__\":true as a required field on the JSON object, deserialized into the is_mcp_event bool on the RawEvent struct at lines 106 and 143 of event_pipe.rs. try_parse_event at line 207 first rejects anything that does not start with {, then deserializes, then rejects anything where is_mcp_event is false. Only survivors reach the WorkflowEvent::try_from conversion at line 139 and become typed events. Plain console.log output stays stdout, gets forwarded as log_pipe.rs LogEntry records, and ends up in the tracing subscriber at a normal log level. The two pathways never mix. That is how the pipe stays free of structured noise even when the test is chatty.",
  },
  {
    q: "How are pipes isolated across parallel test runs?",
    a: "generate_pipe_name at line 243 of event_pipe.rs formats the full pipe path as \\\\.\\pipe\\mcp-workflow-events-{execution_id}, where execution_id is a UUID-shaped string the Rust agent allocates when execute_sequence is invoked. That string is unique per run, so two concurrent runs get two distinct pipe names. The server-side ServerOptions call at line 277 sets first_pipe_instance(true), which on Windows makes it an error for a second writer to attach to the same name. Combined, those two decisions make the pipe a single-writer, single-reader channel scoped to exactly one workflow. No mutex, no reference counting, no cleanup worker. When the child process exits and its end of the pipe closes, the reader loop breaks on next_line returning Ok(None) and the whole server tears down with its PipeServerHandle.",
  },
  {
    q: "Which event types does the pipe accept today?",
    a: "Eight. Defined as the WorkflowEvent enum at lines 30-101 of event_pipe.rs: Progress, StepStarted, StepCompleted, StepFailed, Screenshot, Data, Status, Log. The mapping from event_type strings to enum variants lives in WorkflowEvent::try_from at line 139 ('progress', 'step_started', 'step_completed', 'step_failed', 'screenshot', 'data', 'status', 'log'). Adding a new variant is a three-line change: add the enum variant, add the matching string arm in try_from, and re-expose it on the emit helper. There is no versioning; the pipe is consumed by the same repo that produces it, and MCP itself does not require a stable event catalog beyond the notifications it already spells out.",
  },
  {
    q: "How does Terminator map these events to MCP notifications?",
    a: "Progress events map straight to MCP notifications/progress on the outer tool call's progress token. The JSON payload already carries current, total, and message, which is the exact shape the protocol expects. Step lifecycle events (StepStarted, StepCompleted, StepFailed) and Log events with error level map to notifications/message with matching level fields. The screenshot variant is more flexible: it can be streamed as an in-flight notifications/message with an embedded image resource, or held for the final CallToolResult.structuredContent depending on the client's declared capabilities. That negotiation happens on the agent side, which means a test run does not need to know whether the client can render images mid-call; the pipe protocol stays flat.",
  },
  {
    q: "Does this replace JUnit XML and reporter plugins?",
    a: "It replaces them for the in-flight phase. Post-mortem JUnit XML is still the right format for external CI systems like GitHub Actions or Buildkite that expect a well-known file path at the end of the run. The pattern is to write a small sink on top of the event stream: keep a buffer of StepStarted/StepCompleted/StepFailed records per stepId, render them to testsuite XML at the end. That sink lives in 100 lines of Rust or TypeScript and does not need to be a vendor plugin. The advantage of the Terminator approach is that the sink is optional. The AI coding assistant gets live feedback directly from the event pipe; the CI adapter is just one more consumer of the same stream.",
  },
  {
    q: "What happens if the MCP client does not support progress notifications?",
    a: "Nothing breaks. The agent checks the peer's declared capabilities at initialization. If notifications/progress is not supported, it downgrades Progress events to notifications/message at info level, which every MCP client accepts. Screenshot events without image-resource support become log entries that reference the path. The test itself never sees that negotiation: emit.progress() and emit.screenshot() both write the same JSON line regardless. You do not branch your test code on client capability; the Rust agent does it once at the transport edge.",
  },
  {
    q: "Can I use the pipe protocol without writing a TypeScript test?",
    a: "Yes, the pipe is language-agnostic. Any program that can open a named pipe on Windows and write newline-delimited JSON with the __mcp_event__:true tag can be a producer. That includes Python (pywin32), PowerShell (System.IO.Pipes), Go (winio/npipe), or a C# NUnit test running via dotnet. The env-var handshake (MCP_EVENT_PIPE_PATH) is the only coordination needed. If you are bridging an existing test framework (TestComplete, Ranorex, pywinauto) into an MCP-driven AI assistant, writing a small adapter that forwards the framework's native hooks to the pipe is usually under a hundred lines. The source of truth for the wire format is the RawEvent struct in event_pipe.rs and its try_from at line 139.",
  },
  {
    q: "Is any of this useful if I am not using MCP or an AI coding assistant?",
    a: "Yes, for two reasons. First, the same pipe protocol and execution_logger.rs combination gives you a clean per-step replay artifact on disk: a .json record, a regenerated .ts snippet, and a .png screenshot, all correlated by execution_id, all under %LOCALAPPDATA%\\mediar\\executions\\ with 7-day retention. That is a post-mortem debugging primitive even if you never attach a live consumer. Second, forward_log_to_tracing in log_pipe.rs writes your test's console output to the Rust tracing subscriber at the correct level, which means you get structured logging out of plain console.log calls. Both behaviors kick in the moment you run your test through the MCP agent, even if you immediately disconnect the MCP client.",
  },
  {
    q: "Where in the repo can I read this and prove it runs?",
    a: "crates/terminator-mcp-agent/src/event_pipe.rs, 866 lines, MIT licensed. The tests at the bottom of the file (#[cfg(test)] mod tests, lines 361 onward) round-trip the eight event types against the exact JSON shape the emit helper produces. Run cargo test -p terminator-mcp-agent event_pipe to see them pass. The companion file, crates/terminator-mcp-agent/src/log_pipe.rs, 458 lines, handles the structured logging half of the same architecture. Both files are small enough to read in under thirty minutes end-to-end. The integration into the main server is in main.rs and server_sequence.rs where execute_sequence_impl creates the pipe server, attaches it to the child process, and drains events into the MCP transport.",
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
        <BackgroundGrid
          pattern="dots"
          glow
          className="mx-0 rounded-none border-0"
        >
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Desktop test telemetry
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Windows Named Pipe
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP notifications/progress
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Automation testing for desktop application,{" "}
              <GradientText>watched live over a pipe</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every guide on this subject covers how to send a click. Very few
              cover how the run reports back. Terminator gives each TypeScript
              desktop test its own Windows Named Pipe at{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                \\.\pipe\mcp-workflow-events-&#123;execution_id&#125;
              </code>{" "}
              and a tagged JSON line protocol. Eight structured event variants.
              No stderr scraping. No reporter plugin. The AI coding assistant
              that kicked the run off watches every step land in real time.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="14 min read"
            />
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="Open-source, MIT"
          highlights={[
            "One pipe per execution, name contains the execution_id",
            'JSON line protocol, tagged with "__mcp_event__": true',
            "Eight event variants: Progress, StepStarted, StepCompleted, StepFailed, Screenshot, Status, Log, Data",
            "866 lines in event_pipe.rs, 458 lines in log_pipe.rs, both MIT",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Live desktop test telemetry"
            subtitle="tagged JSON over a named pipe"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "One Named Pipe per test run",
              "Eight structured WorkflowEvent variants",
              "__mcp_event__: true is the only required tag",
              "Forwards straight to MCP notifications/progress",
              "Your stdout stays clean, your assistant watches live",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The tag that makes a line a test event
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The whole line between &quot;this is test telemetry&quot; and
            &quot;this is a stray{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              console.log
            </code>
            &quot; sits in a single field. If the JSON carries{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              &quot;__mcp_event__&quot;: true
            </code>{" "}
            at the top level, it becomes a typed{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              WorkflowEvent
            </code>{" "}
            and gets forwarded to the MCP client. Any line without that tag is
            ignored by the event reader. That means your test can still
            scatter{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              console.log
            </code>{" "}
            anywhere it likes, they end up in the log stream instead of the
            event stream, and the two never collide.
          </p>
          <AnimatedCodeBlock
            code={tagMarkerSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/event_pipe.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            A pipe per run, a run per pipe
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The usual failure mode for concurrent desktop test runs on a single
            runner is log interleaving: two reporter plugins racing on stderr.
            Terminator sidesteps the race by giving each run its own named
            pipe. The server is created with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              first_pipe_instance(true)
            </code>
            , which makes a second writer with the same name a hard error
            instead of a silent merge. Add the{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execution_id
            </code>{" "}
            suffix and two parallel runs cannot collide by accident.
          </p>
          <AnimatedCodeBlock
            code={pipeServerSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/event_pipe.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Eight events travel through a single channel
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              WorkflowEvent
            </code>{" "}
            enum has exactly eight variants. Every one maps to a concrete thing
            a desktop test run cares about. Nothing is reserved for &quot;user
            data&quot; except the explicit{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Data
            </code>{" "}
            escape hatch.
          </p>
          <div className="my-4">
            <Marquee speed={28}>
              {eventChips.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
          <BentoGrid cards={eventCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Producers on the left, consumers on the right
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            A single pipe multiplexes test-side producers into several
            agent-side consumers. The reader loop deserializes once, fans out
            to whichever destinations are subscribed at this moment. Tracing,
            the MCP transport, the on-disk replay log, and product analytics
            all read off the same stream.
          </p>
          <AnimatedBeam
            title="event_pipe.rs routing"
            accentColor="#FF3E00"
            from={beamNodes.from}
            hub={beamNodes.hub}
            to={beamNodes.to}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the test looks like on the author&apos;s side
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The test uses the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Desktop
            </code>{" "}
            locator API as a normal Terminator test. The only thing added is an{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              emit
            </code>{" "}
            helper that writes tagged JSON to the pipe. When the run is not
            launched through MCP (you ran it as a plain bun script locally),{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              MCP_EVENT_PIPE_PATH
            </code>{" "}
            is unset and every{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              emit.*
            </code>{" "}
            call is a no-op. One test file covers both modes.
          </p>
          <AnimatedCodeBlock
            code={emitEventClient}
            language="typescript"
            filename="tests/checkout.spec.ts"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            And what the agent sees as it runs
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Log output from a local run with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              RUST_LOG=info
            </code>
            . The first line is the pipe creation. Every{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              DEBUG RawEvent
            </code>{" "}
            line is a deserialized event on its way out the MCP transport. The
            close line is the child process exiting, which tears down the
            reader.
          </p>
          <TerminalOutput
            title="RUST_LOG=info cargo run -p terminator-mcp-agent"
            lines={pipeTerminal}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            A single conversation between four parties
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The full handshake. The assistant kicks the run off with an MCP
            tool call; the Rust agent creates the pipe; the TS test connects
            and streams events; the agent converts each event into the right
            MCP notification and forwards it back. A failure variant is just
            one more event type on the same wire.
          </p>
          <SequenceDiagram
            title="mcp -> rust agent -> named pipe -> ts test"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Where this sits compared to the usual playbook
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The common approach to telemetry in desktop test frameworks is a
            reporter plugin that scrapes stdout at the end of a run, plus a
            JUnit XML written to disk. That works for CI but not for a live
            caller. Here is how the pipe approach differs on eight concrete
            questions.
          </p>
          <ComparisonTable
            productName="Terminator (event_pipe.rs)"
            competitorName="Typical desktop test reporter"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <ProofBanner
            metric="__mcp_event__: true"
            quote="The only bit a line needs to travel from console.log out to MCP notifications/progress. No schema version, no reporter registration, no plugin."
            source="event_pipe.rs, RawEvent at line 106, try_parse_event at line 207"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Wiring it in, one step at a time
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The five steps that turn a plain TypeScript desktop test into a
            live-telemetry MCP workflow. Each step corresponds to a real file
            and function in the repo, not pseudocode.
          </p>
          <StepTimeline steps={wiringSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What you can actually do once this is in place
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Eight concrete capabilities this primitive unlocks. Each one is a
            check you can run against the current codebase. None of them
            require a reporter plugin or a CI-specific integration.
          </p>
          <AnimatedChecklist
            title="Capabilities this unlocks"
            items={capabilityChecks}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard className="p-8 rounded-2xl border border-orange-200 bg-white">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
                Anchor fact
              </p>
              <p className="text-zinc-800 text-lg leading-relaxed">
                Terminator&apos;s Rust MCP agent ships an event pipe at{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  crates/terminator-mcp-agent/src/event_pipe.rs
                </code>
                . 866 lines. MIT licensed. Eight{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  WorkflowEvent
                </code>{" "}
                variants (Progress, StepStarted, StepCompleted, StepFailed,
                Screenshot, Data, Status, Log) defined at lines 30 through 101.
                One pipe per execution, name generated by{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  generate_pipe_name
                </code>{" "}
                at line 243. The tag that separates telemetry from console
                noise lives on the{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  is_mcp_event
                </code>{" "}
                bool at line 106. Unit tests round-trip every variant against
                the exact JSON shape the TypeScript emit helper produces; run{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  cargo test -p terminator-mcp-agent event_pipe
                </code>{" "}
                to see them pass.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  event_pipe.rs
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  log_pipe.rs
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  execution_logger.rs
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  server_sequence.rs
                </span>
              </div>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            A number for every part of the story
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The sizes you can verify from the repo without running the code.
            Each figure is a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              wc -l
            </code>{" "}
            or a line-count on an enum match arm.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={866} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                lines in event_pipe.rs
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={458} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                lines in log_pipe.rs
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={8} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                WorkflowEvent variants
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={7} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                day replay retention
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Wire your desktop test suite into a live MCP event stream"
            description="Bring a test you already have. We will wrap it with the emit helper, point the named pipe at your MCP client, and have you watching step_completed events land in real time before the call ends."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-6">
            Frequently asked
          </h2>
          <FaqSection items={faqs} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="See live desktop test telemetry over a named pipe in 20 minutes"
        />
      </article>
    </div>
  );
}
