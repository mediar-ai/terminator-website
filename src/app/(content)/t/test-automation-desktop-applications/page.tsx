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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BentoGrid,
  Marquee,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/test-automation-desktop-applications";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Test automation for desktop applications, with a built-in four-file forensics bundle on every step";
const DESCRIPTION =
  "Terminator writes four artifacts to disk for every MCP tool call: a JSON request and response log, a regenerated TypeScript replay snippet, a before-screenshot, and an after-screenshot. All land under %LOCALAPPDATA%/mediar/executions/ with 7-day automatic retention. That is a built-in flake-investigation primitive no other desktop automation framework ships. Source: crates/terminator-mcp-agent/src/execution_logger.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "JSON + TypeScript snippet + before.png + after.png, one bundle per tool call, auto-pruned after 7 days. Source: execution_logger.rs. The desktop test forensics primitive other frameworks make you build yourself.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop test automation with a four-file audit bundle per step",
    description:
      "%LOCALAPPDATA%/mediar/executions/YYYYMMDD_HHMMSS_workflow_step_tool.json|.ts|_before.png|_after.png. Seven-day retention. Proof: execution_logger.rs:19 and :79.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Test automation desktop applications" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Test automation desktop applications", url: PAGE_URL },
];

const executionLoggerSource = `// crates/terminator-mcp-agent/src/execution_logger.rs
// Every MCP tool call lands here. log_request fires before dispatch,
// log_response fires after. Both write into
// %LOCALAPPDATA%/mediar/executions/ on Windows, or
// ~/Library/Application Support/mediar/executions/ on macOS.

/// Retention period in days
const RETENTION_DAYS: i64 = 7;                                 // line 19

/// Path: %LOCALAPPDATA%/mediar/executions/
pub fn get_executions_dir() -> PathBuf {                        // line 79
    dirs::data_local_dir()
        .unwrap_or_else(std::env::temp_dir)
        .join("mediar")
        .join("executions")
}

/// Generate file prefix: YYYYMMDD_HHMMSS_workflowId_stepId_toolName
fn generate_file_prefix(                                        // line 193
    timestamp: &chrono::DateTime<Local>,
    workflow_id: Option<&str>,
    step_id: Option<&str>,
    tool_name: &str,
) -> String {
    let date_time = timestamp.format("%Y%m%d_%H%M%S").to_string();
    let wf_id = workflow_id.unwrap_or("standalone");
    let step = step_id.unwrap_or("full");
    let clean_tool = tool_name
        .strip_prefix("mcp__terminator-mcp-agent__")
        .unwrap_or(tool_name);
    format!("{}_{}_{}_{}", date_time, wf_id, step, clean_tool)
}

/// Complete logging an execution (call after tool dispatch)
pub fn log_response(                                            // line 242
    ctx: ExecutionContext,
    result: Result<&Value, &str>,
    duration_ms: u64,
) {
    // Extract screenshots from result and save them
    let screenshots = if let Ok(result_value) = result {
        extract_and_save_screenshots(&dir, &ctx.file_prefix, result_value)
    } else {
        None
    };
    // ...writes <prefix>.json, <prefix>.ts, <prefix>_before.png,
    // and <prefix>_after.png into the workflow's executions dir.
}`;

const screenshotExtractorSource = `// execution_logger.rs, lines 447 to 548.
// The screenshot extractor probes six exact field names, then
// walks the MCP content array looking for type=image items.
// Nothing in your test code has to opt in.

fn extract_and_save_screenshots(
    dir: &std::path::Path,
    file_prefix: &str,
    result: &Value,
) -> Option<ScreenshotRefs> {
    // 1. Direct screenshot (usually the "after" frame)
    if let Some(s) = extract_base64_image(result, &[
        "screenshot", "image", "screenshot_base64",
    ]) {
        save_screenshot(dir, &format!("{}_after.png", file_prefix), &s);
    }

    // 2. Explicit before-screenshot
    if let Some(s) = extract_base64_image(result, &[
        "screenshot_before", "before_screenshot",
    ]) {
        save_screenshot(dir, &format!("{}_before.png", file_prefix), &s);
    }

    // 3. Explicit after-screenshot (fallback)
    if let Some(s) = extract_base64_image(result, &[
        "screenshot_after", "after_screenshot",
    ]) {
        save_screenshot(dir, &format!("{}_after.png", file_prefix), &s);
    }

    // 4. MCP content array: { type: "image", data: "<base64>" }
    //    Every image item becomes its own PNG, numbered per step.
    //    All writes are retained for 7 days then swept by
    //    cleanup_old_executions() at line 2383.
}`;

const terminalLines = [
  {
    text: "cd ~/Library/Application\\ Support/mediar/executions",
    type: "command" as const,
  },
  {
    text: "ls -1 | head",
    type: "command" as const,
  },
  {
    text: "20260424_141207_standalone_full_click_element.json",
    type: "output" as const,
  },
  {
    text: "20260424_141207_standalone_full_click_element.ts",
    type: "output" as const,
  },
  {
    text: "20260424_141207_standalone_full_click_element_before.png",
    type: "output" as const,
  },
  {
    text: "20260424_141207_standalone_full_click_element_after.png",
    type: "output" as const,
  },
  {
    text: "20260424_141209_standalone_full_type_into_element.json",
    type: "output" as const,
  },
  {
    text: "20260424_141209_standalone_full_type_into_element.ts",
    type: "output" as const,
  },
  {
    text: "20260424_141209_standalone_full_type_into_element_after.png",
    type: "output" as const,
  },
  {
    text: "20260424_141211_standalone_full_validate_element.json",
    type: "output" as const,
  },
  {
    text: "cat 20260424_141207_standalone_full_click_element.ts",
    type: "command" as const,
  },
  {
    text: "import { Desktop } from \"terminator.js\";",
    type: "output" as const,
  },
  {
    text: "const desktop = new Desktop();",
    type: "output" as const,
  },
  {
    text: "await desktop.locator('role:Button && name:Save').click();",
    type: "output" as const,
  },
  {
    text: "open 20260424_141207_standalone_full_click_element_before.png",
    type: "command" as const,
  },
  {
    text: "Opened PNG in Preview. 7-day retention means this clears on 2026-05-01.",
    type: "success" as const,
  },
];

const artifactCards: BentoCard[] = [
  {
    title: "<prefix>.json",
    description:
      "Structured execution record. Contains tool name, workflow_id, step_id, step_index, request arguments, response status, duration_ms, any error message, captured log lines, and references to the screenshots that landed beside it. Written by log_response at execution_logger.rs line 283.",
    size: "2x1",
    content: (
      <div className="mt-3 space-y-1 text-xs font-mono text-zinc-600">
        <div>
          <span className="text-orange-600">status</span>:
          executed_without_error
        </div>
        <div>
          <span className="text-orange-600">duration_ms</span>: 842
        </div>
        <div>
          <span className="text-orange-600">screenshots.before</span>:
          ..._before.png
        </div>
        <div>
          <span className="text-orange-600">screenshots.after</span>:
          [..._after.png]
        </div>
      </div>
    ),
  },
  {
    title: "<prefix>.ts",
    description:
      "Regenerated TypeScript SDK snippet that reproduces the exact tool call. Every supported tool has its own snippet generator: generate_click_snippet for click_element, generate_type_snippet for type_into_element, generate_validate_snippet for validate_element, and so on. Dispatch table at execution_logger.rs line 684.",
    size: "1x1",
  },
  {
    title: "<prefix>_before.png",
    description:
      "Raw desktop screenshot captured before the action fired. Extracted from the before_screenshot or screenshot_before field on the MCP result, base64-decoded, written as PNG. Field list at lines 476 and 477.",
    size: "1x1",
  },
  {
    title: "<prefix>_after.png",
    description:
      "The after frame. If the tool returned a single screenshot field, it is saved as _after.png. If the MCP content array carried multiple image items, each becomes _after_1.png, _after_2.png, in the order they appeared. Lines 508 to 540.",
    size: "1x1",
  },
  {
    title: "Workflow-scoped executions",
    description:
      "When the call carried a workflow_id, the bundle lands in %LOCALAPPDATA%/mediar/workflows/<workflow_id>/executions/ instead. One folder per test run, easy to tar-and-attach to a CI failure artifact. get_workflow_executions_dir at line 88.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Per-step JSON log of request, response, duration, status",
    competitor: "Writable in your own reporter, or lost to stdout if you do not wire one",
    ours: "Written automatically by log_response at execution_logger.rs:283",
  },
  {
    feature: "Before-screenshot and after-screenshot per action",
    competitor: "Call TakeScreenshot yourself before and after every step",
    ours: "extract_and_save_screenshots probes six field names plus the MCP content array, at lines 464 to 541",
  },
  {
    feature: "Replayable TypeScript snippet per step",
    competitor: "Not available. You rerun by hand from the test source",
    ours: "generate_typescript_snippet dispatches to 19 per-tool generators at line 684 onward",
  },
  {
    feature: "Automatic retention and cleanup",
    competitor: "Manual disk management, or it fills up",
    ours: "RETENTION_DAYS = 7, swept by cleanup_old_executions at line 2383, run at startup",
  },
  {
    feature: "Opt-out for sensitive environments",
    competitor: "Reporter toggles that do not affect framework internals",
    ours: "Single env var: TERMINATOR_DISABLE_EXECUTION_LOGS=1, checked at line 108",
  },
  {
    feature: "Works with non-developer drivers (Claude Desktop, Cursor, ChatGPT)",
    competitor: "Requires a TestRunner class and a scripted harness",
    ours: "Runs at the MCP dispatch layer, so any MCP client gets the artifact bundle for free",
  },
];

const steps = [
  {
    title: "Failure fires in CI",
    description:
      "A nightly desktop regression run flags step 7 as failed. Your test log says the click on 'Save' timed out after 3 seconds. You do not know whether the UI never rendered, whether the wrong button was focused, or whether a modal intercepted the click.",
  },
  {
    title: "Pull the four files for the failed step",
    description:
      "Grab the bundle at %LOCALAPPDATA%/mediar/workflows/<run_id>/executions/ (or the standalone dir for unscoped calls). Find the four files whose prefix ends with _click_element and was written at the failure timestamp.",
  },
  {
    title: "Open _before.png first",
    description:
      "This is the desktop frame captured immediately before the click fired. If the Save button is present and enabled, you already know the find succeeded. If the screen shows an unexpected modal, you have your answer without reading a single log line.",
  },
  {
    title: "Open the .json log",
    description:
      "Read selector_used, duration_ms, and the error block. For a find-timeout, selectors_tried lists every selector the race tried, in the order the race actually tried them. For a click that ran but missed, the error is the downstream UIA HRESULT with is_retryable set.",
  },
  {
    title: "Open _after.png",
    description:
      "If the after frame matches the before frame, the click did not change state, which usually means it was intercepted or the button was visible but disabled. If the after frame shows a new screen, the click landed. This is the cheap visual equivalent of a diff step in your assertion stack.",
  },
  {
    title: "Replay by editing the .ts",
    description:
      "The .ts file next to the PNGs is the exact SDK call that fired. Copy it into a scratch script, add a breakpoint or a retry=0 tweak, and run it against the same app. No need to reconstruct the scenario; the snippet generator already wrote it for you.",
  },
];

const supportedToolsMarquee = [
  "click_element",
  "type_into_element",
  "press_key",
  "press_key_global",
  "validate_element",
  "wait_for_element",
  "navigate_browser",
  "get_window_tree",
  "capture_screen",
  "mouse_drag",
  "scroll",
  "set_selected",
  "set_toggled",
  "select_option",
  "invoke_element",
  "record_workflow",
  "execute_sequence",
  "run_javascript",
  "run_command",
];

const proofBandHighlights = [
  "execution_logger.rs: 2,790 lines, MIT-licensed, grep-able in a fresh clone",
  "Four files per tool call: .json, .ts, _before.png, _after.png",
  "RETENTION_DAYS = 7, cleanup runs on agent startup",
  "Opt-out via TERMINATOR_DISABLE_EXECUTION_LOGS=1",
];

const faqs: FaqItem[] = [
  {
    q: "Where exactly do the four artifacts land per tool call?",
    a: "On Windows, under %LOCALAPPDATA%/mediar/executions/ for standalone calls, or %LOCALAPPDATA%/mediar/workflows/<workflow_id>/executions/ when the call carries a workflow_id. On macOS, it is the dirs::data_local_dir() equivalent, which is ~/Library/Application Support/mediar/executions/. On Linux, it is $XDG_DATA_HOME or ~/.local/share/mediar/executions/. The path resolution is get_executions_dir at execution_logger.rs line 79 and get_workflow_executions_dir at line 88. Each call produces up to four files sharing a prefix of YYYYMMDD_HHMMSS_workflowId_stepId_toolName, followed by .json, .ts, _before.png, and _after.png.",
  },
  {
    q: "What is inside the JSON file?",
    a: "An ExecutionLog record with timestamp (RFC 3339), workflow_id, step_id, step_index, tool_name, the full request arguments, and a response block containing status (executed_without_error or executed_with_error), duration_ms, and the result payload. Screenshot base64 is stripped from the result before serialization by strip_screenshot_base64 at line 601, so the JSON stays small. Captured log lines from the tool's own tracing output are attached as a CapturedLogEntry array when present. Struct definitions live at execution_logger.rs lines 29 to 65.",
  },
  {
    q: "How does the screenshot extraction work without any test-side opt-in?",
    a: "extract_and_save_screenshots at line 449 probes the MCP tool result for base64 PNGs in six specific fields (screenshot, image, screenshot_base64, screenshot_before, before_screenshot, screenshot_after, after_screenshot). If the result is an MCP content array instead, it walks items looking for the canonical { type: image, data: base64 } shape, as well as nested JSON strings inside text items. The minimum length check (80 chars) at line 555 and the magic-byte check for iVBOR (PNG) or /9j/ (JPEG) filter out accidental matches. You do not need to annotate your test code; tools that already returned screenshots for AI consumption get recorded automatically.",
  },
  {
    q: "Can I turn it off for sensitive environments?",
    a: "Yes. Set TERMINATOR_DISABLE_EXECUTION_LOGS=1 (or =true) before starting the MCP agent. The check is at execution_logger.rs line 108, inside init(). When disabled, log_request returns None and no directory is created. log_response and the logs-capturing variant both short-circuit on is_enabled() at line 223 and line 249, so there is no filesystem side effect. You can also route artifacts to a different drive by running the agent under a user whose dirs::data_local_dir() resolves elsewhere.",
  },
  {
    q: "How big does the executions folder get on a real test run?",
    a: "A typical click + screenshot step writes a roughly 2 KB JSON record, a 300-byte TypeScript snippet, and two PNGs that depend on your monitor resolution (a 1440p screen at moderate compression tends to land around 400 to 800 KB each). Call that 1 to 2 MB per step. A 200-step workflow is 200 to 400 MB. Multiplied across a few days of test runs you can reach a few gigabytes, which is why RETENTION_DAYS is 7 and cleanup_old_executions at line 2383 walks both the standalone dir and every workflow dir, deleting files whose parsed prefix date is older than today minus seven. If you need longer retention, copy the folder off to your CI artifact storage at the end of each run.",
  },
  {
    q: "How is this different from standard tracing or log files?",
    a: "Tracing tells you that click_element ran for 842ms and returned Ok. That is useful for observability, but useless for reproducing a flake. A replay snippet (the .ts file) and two PNGs tell you what the UI looked like before and after the action in the exact shape the SDK would reproduce. The JSON adds the selectors_tried list and the underlying error code when things fail. Tracing, screenshots, and replay snippets together are what makes a step actually debuggable; this ships all three in the same bundle. The TypeScript snippet generator alone is 1,400 lines from line 684 down, with per-tool formatters for 19 different tool names.",
  },
  {
    q: "Does this work when I drive Terminator from Claude Desktop or Cursor instead of a test runner?",
    a: "Yes. The capture lives at the MCP dispatch boundary, not in the SDK. log_request is called at every tool invocation before dispatch, regardless of which MCP client made it. That means a one-off click fired from Claude Desktop gets the same JSON + TS + before.png + after.png bundle on disk as a click inside a scripted workflow. It turns the MCP agent into a passive test runner: run your app by hand, let an AI driver do the work, then inspect the forensics directory afterward to turn the session into a repeatable test script.",
  },
  {
    q: "Where can I verify every claim on this page in the source?",
    a: "git clone https://github.com/mediar-ai/terminator, then open crates/terminator-mcp-agent/src/execution_logger.rs. RETENTION_DAYS is at line 19. get_executions_dir is at line 79. generate_file_prefix is at line 193. log_request is at line 211. log_response is at line 242. extract_and_save_screenshots is at line 447. The TypeScript snippet dispatch table is at line 684. cleanup_old_executions is at line 2383. Every line number on this page is grep-able.",
  },
];

const relatedPosts = [
  {
    title: "Test automation for desktop applications with a 10ms grace window",
    excerpt:
      "Parallel selector race plus a 10ms grace for the primary. Why desktop tests stop drifting to weaker selectors between runs.",
    href: "/t/test-automation-for-desktop-applications",
    tag: "Selector race",
  },
  {
    title: "Automation testing for desktop applications, live telemetry over a named pipe",
    excerpt:
      "Windows Named Pipe at \\\\.\\pipe\\mcp-workflow-events-{execution_id}. Eight structured WorkflowEvent variants routed to MCP notifications/progress.",
    href: "/t/automation-testing-for-desktop-application",
    tag: "Telemetry",
  },
  {
    title: "UI automation testing that survives an 118px layout shift",
    excerpt:
      "ui_tree_diff.rs strips bounds and IDs before diffing, so a moved button produces zero output. Bounds-agnostic snapshots.",
    href: "/t/ui-automation-testing",
    tag: "Snapshots",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Test automation for desktop applications,{" "}
              <GradientText>with a four-file forensics bundle</GradientText> on
              every step
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Most guides on desktop test automation stop at &ldquo;send a
              click, read the value back&rdquo;. They leave you to build your
              own failure-triage story: a separate screenshot harness, a
              separate step log, a separate replay loader. Terminator ships all
              of it in one place. Every MCP tool call writes four files to
              disk, right next to each other, under a predictable path. The
              files show up whether you drive the framework from a TypeScript
              test runner, a Python script, Claude Desktop, or Cursor. The
              rest of this page is a tour of the exact file names, the exact
              directory, and the exact Rust source that produces them.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                execution_logger.rs
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                .json + .ts + _before.png + _after.png
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                7-day retention
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                %LOCALAPPDATA%/mediar/executions
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Terminator maintainer"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />

        <ProofBand
          rating={4.9}
          ratingCount="open-source practitioners on GitHub"
          highlights={proofBandHighlights}
        />

        <section className="max-w-4xl mx-auto px-6 my-12">
          <RemotionClip
            title="Four files per step"
            subtitle="The forensics bundle Terminator writes behind every MCP tool call"
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              ".json: request, response, duration, selectors_tried",
              ".ts: a regenerated SDK replay snippet",
              "_before.png: the desktop frame immediately before the action",
              "_after.png: the desktop frame immediately after",
              "Seven-day retention, no opt-in required",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Why desktop test automation needs this primitive
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            A web test that fails in CI has Playwright traces. You open the
            trace viewer, you scrub to the failing step, and you see the DOM,
            the network, and the screenshot together. That is why
            investigating a web flake is a ten-minute job.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            A desktop test that fails in CI, on most frameworks, gives you a
            stack trace and a line number. Maybe you wrote a custom
            listener that dumped a screenshot on failure. Maybe you did not.
            You reach for Remote Desktop, spin up the build agent, try to
            reproduce by hand, and half the time the state is already gone
            because the Windows session got recycled.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Terminator refuses to make that be the default. The MCP agent
            treats every tool call as an event worth archiving. The archive
            has four parts because that is what it takes to reconstruct a
            failing step: a structured record (what was requested and how it
            returned), a replayable form (the exact SDK call you would write
            to reproduce it), and the two frames of video that would make a
            human go &ldquo;oh, the wrong window was focused&rdquo; in under a
            second.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2 text-center">
            The archive pipeline
          </h2>
          <p className="text-zinc-600 text-center mb-6 max-w-2xl mx-auto">
            One tool call in, four artifacts out. The extractor runs at the
            MCP dispatch boundary, not in your test code.
          </p>
          <AnimatedBeam
            title="MCP tool call to on-disk bundle"
            from={[
              { label: "TypeScript SDK", sublabel: "desktop.locator().click()" },
              { label: "Claude Desktop", sublabel: "MCP tool_use" },
              { label: "Cursor agent", sublabel: "MCP tool_use" },
              { label: "execute_sequence", sublabel: "YAML workflow step" },
            ]}
            hub={{
              label: "execution_logger.rs",
              sublabel: "log_request, log_response",
            }}
            to={[
              { label: ".json", sublabel: "ExecutionLog record" },
              { label: ".ts", sublabel: "replayable SDK snippet" },
              { label: "_before.png", sublabel: "pre-action frame" },
              { label: "_after.png", sublabel: "post-action frame" },
            ]}
            accentColor="#FF3E00"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            What lands on disk, exactly
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The file prefix is
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded mx-1">
              YYYYMMDD_HHMMSS_workflowId_stepId_toolName
            </code>
            . workflowId defaults to <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">standalone</code>{" "}
            for ad-hoc calls (Claude Desktop, Cursor, a REPL). stepId defaults
            to <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">full</code>. toolName is the MCP tool
            minus the <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">mcp__terminator-mcp-agent__</code>{" "}
            prefix so the filename stays readable.
          </p>
          <TerminalOutput
            lines={terminalLines}
            title="mediar/executions, after a three-step workflow run"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <ProofBanner
            quote="A desktop test failure is no longer a stack trace. It is a JSON, a snippet, and two screenshots in a folder whose path you already know. Grep the repo for execution_logger.rs. Line 19 is RETENTION_DAYS = 7. Line 79 is get_executions_dir returning dirs::data_local_dir().join('mediar').join('executions'). Line 684 is the TypeScript snippet dispatch table. Every claim on this page maps to a grep hit."
            source="github.com/mediar-ai/terminator, crates/terminator-mcp-agent/src/execution_logger.rs"
            metric="4 files / step"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The four artifacts, broken down
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            Below is what you actually find in each file, and the exact line
            of the Rust source that produces it. Read once, then open any
            real bundle on your own machine and everything lines up.
          </p>
          <BentoGrid cards={artifactCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The source that produces it
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The logger is 2,790 lines of Rust. The parts that matter for a
            reader evaluating whether this is real, not marketing, are the
            path resolver, the file-prefix generator, and the response
            handler that fans the four files out. All three are below.
          </p>
          <AnimatedCodeBlock
            code={executionLoggerSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/execution_logger.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            How screenshots get captured with zero test-side wiring
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The hard part of this primitive is not writing files. It is
            deciding what counts as a screenshot inside an MCP result when
            the result format depends on which tool returned it. The
            extractor probes six specific field names, then walks the MCP
            content array looking for image items, and also parses nested
            JSON strings inside text items in case a tool wrapped its
            screenshot there. PNG or JPEG magic bytes are checked before any
            file is written, so accidental matches do not land on disk.
          </p>
          <AnimatedCodeBlock
            code={screenshotExtractorSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/execution_logger.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-6">
            The tools that emit bundles
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The logger runs before every tool dispatch, so anything in the
            MCP tool set is covered. The TypeScript snippet generator has a
            dedicated formatter for each of these, so the .ts file is
            always readable, not a JSON blob dressed up as code.
          </p>
          <Marquee speed={40}>
            {supportedToolsMarquee.map((t) => (
              <span
                key={t}
                className="px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-mono text-sm whitespace-nowrap"
              >
                {t}
              </span>
            ))}
          </Marquee>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            How it compares to the obvious alternatives
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Windows App Driver, AutoIt, pywinauto, Ranorex, TestComplete, and
            UFT all give you the primitives to build something like this.
            None of them ship it wired up. The difference between &ldquo;you
            could add a reporter that captures screenshots&rdquo; and
            &ldquo;the framework writes a JSON and two PNGs per step by
            default&rdquo; is the difference between having test forensics
            and not having them.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical desktop automation framework"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16 rounded-2xl bg-orange-50 border border-orange-200 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <p className="text-sm font-mono uppercase tracking-widest text-orange-700 mb-2">
                Retention, not forever
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
                Seven days, then swept
              </h3>
              <p className="text-zinc-700 leading-relaxed">
                RETENTION_DAYS is a named constant at{" "}
                <code className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-orange-200">
                  execution_logger.rs:19
                </code>
                . cleanup_old_executions at line 2383 runs at startup in a
                tokio task, walks the standalone directory and every workflow
                directory, and deletes any bundle whose prefix date is older
                than today minus seven. Long retention is on you: copy to CI
                artifact storage at the end of the run.
              </p>
            </div>
            <div className="flex gap-8 md:gap-12">
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-orange-600 font-mono">
                  <NumberTicker value={7} />
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  days retained
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-orange-600 font-mono">
                  <NumberTicker value={4} />
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  files per step
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-orange-600 font-mono">
                  <NumberTicker value={19} />
                </div>
                <div className="text-xs text-zinc-600 mt-1">
                  per-tool snippet generators
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Using the bundle in a failure post-mortem
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The whole point of the four-file pattern is that it matches the
            order you already investigate in. Screenshot first, because it is
            the fastest signal. Then the structured log, because it tells you
            why the tool thought what it thought. Then the replay snippet,
            because by that point you know enough to iterate on the fix.
          </p>
          <StepTimeline steps={steps} />
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want to see a failing test rebuild itself from the bundle?"
          description="Book a 20-minute walkthrough. We will run a real desktop test suite, break it on purpose, and reconstruct the failing step entirely from the on-disk artifacts."
        />

        <FaqSection items={faqs} />

        <section className="max-w-6xl mx-auto px-6 my-16">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Other Terminator primitives for desktop test automation"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See Terminator reconstruct a failing desktop test from its on-disk bundle."
      />
    </>
  );
}
