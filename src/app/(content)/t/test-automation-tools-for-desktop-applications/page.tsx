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
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  AnimatedBeam,
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
  "https://t8r.tech/t/test-automation-tools-for-desktop-applications";
const PUBLISHED = "2026-04-26";
const TITLE =
  "Test automation tools for desktop applications: a tsc gate the AI assistant can call before any pixel moves";
const DESCRIPTION =
  "Most desktop test tools shift right: errors surface when the test runs against a real UI. Terminator ships an MCP tool, typecheck_workflow, that runs tsc --noEmit on a TypeScript desktop test workflow before any window opens, parses tsc output with a five-field regex, and returns structured TypeError objects with a seven-line code context (3 lines, the error line marked with an arrow, 3 lines) so an AI coding assistant can repair the workflow before the suite touches the application under test. Source: crates/terminator-mcp-agent/src/tools/typecheck.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A typecheck-before-execute primitive on the MCP tool surface. Five-field tsc parser. Seven-line context with an arrow on the error line. One of 35 MCP tools the agent exposes. typecheck.rs is 278 lines, MIT.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A tsc gate for desktop test automation tools",
    description:
      "Terminator's typecheck_workflow MCP tool runs tsc --noEmit on the workflow before any window opens, returns structured TypeError objects, and lets the AI coding assistant fix the test before the test runs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Test automation tools for desktop applications" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Test automation tools for desktop applications",
    url: PAGE_URL,
  },
];

const regexSource = `// crates/terminator-mcp-agent/src/tools/typecheck.rs, lines 49-86
// Every line of tsc --noEmit output is matched against this regex.
// Five capture groups, five fields on TypeError. Anything that does
// not match is dropped. That is the entire "is this a tsc error or
// noise?" rule.

pub fn parse_tsc_output(output: &str) -> Vec<TypeError> {
    let mut errors = Vec::new();
    let re = regex::Regex::new(
        r"^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$"
    )
    .expect("Invalid regex");

    for line in output.lines() {
        let line = line.trim();
        if let Some(caps) = re.captures(line) {
            errors.push(TypeError {
                file:    caps.get(1).map(|m| m.as_str().to_string()).unwrap_or_default(),
                line:    caps.get(2).and_then(|m| m.as_str().parse().ok()).unwrap_or(0),
                column:  caps.get(3).and_then(|m| m.as_str().parse().ok()).unwrap_or(0),
                code:    caps.get(4).map(|m| m.as_str().to_string()).unwrap_or_default(),
                message: caps.get(5).map(|m| m.as_str().to_string()).unwrap_or_default(),
                context: None,
            });
        }
    }
    errors
}`;

const contextSource = `// crates/terminator-mcp-agent/src/tools/typecheck.rs, lines 88-115
// Three lines before, the error line with " -> ", three lines after.
// Seven lines total. Formatted with a four-space line-number gutter
// so the assistant can render it inline without extra parsing.

fn get_error_context(workflow_path: &Path, error: &TypeError) -> Option<String> {
    let file_path = workflow_path.join(&error.file);
    let content = fs::read_to_string(&file_path).ok()?;
    let lines: Vec<&str> = content.lines().collect();

    if error.line == 0 || error.line as usize > lines.len() {
        return None;
    }

    let error_idx = error.line as usize - 1;
    let start = error_idx.saturating_sub(3);
    let end   = (error_idx + 4).min(lines.len());

    let mut context_lines = Vec::new();
    for (i, line) in lines.iter().enumerate().take(end).skip(start) {
        let line_num = i + 1;
        let marker = if line_num == error.line as usize { " -> " } else { "    " };
        context_lines.push(format!("{}{:>4}: {}", marker, line_num, line));
    }

    Some(context_lines.join("\\n"))
}`;

const runnerSource = `// crates/terminator-mcp-agent/src/tools/typecheck.rs, lines 142-204
// Pick a runner. Bun first, npx second, error if neither is on PATH.
// No silent shell fallback. No "I tried tsc directly". Either the
// AI coding assistant resolved a real Node toolchain, or the gate
// returns a clean error string the model can react to.

pub async fn typecheck_workflow(workflow_path: &str) -> Result<TypecheckResult, String> {
    let path = Path::new(workflow_path);
    if !path.exists() { return Err(format!("Workflow path does not exist: {}", workflow_path)); }

    let tsconfig = path.join("tsconfig.json");
    if !tsconfig.exists() { return Err(format!("No tsconfig.json found in: {}", workflow_path)); }

    let (program, args) = if command_exists("bun").await {
        ("bun", vec!["tsc", "--noEmit"])
    } else if command_exists("npx").await {
        ("npx", vec!["tsc", "--noEmit"])
    } else {
        return Err("Neither bun nor npx found. Install bun or Node.js.".to_string());
    };

    let output = Command::new(program)
        .args(&args)
        .current_dir(path)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .output()
        .await
        .map_err(|e| format!("Failed to run tsc: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined_output = format!("{}\\n{}", stdout, stderr);
    let mut errors = parse_tsc_output(&combined_output);
    let error_count = errors.len();
    let success = output.status.success() && error_count == 0;

    if !success { enrich_errors_with_context(path, &mut errors); }

    Ok(TypecheckResult { success, errors, error_count, raw_output: if success { None } else { Some(combined_output.to_string()) } })
}`;

const sampleResultSource = `// What the AI coding assistant receives back as a JSON CallToolResult.
// One TypeError per parsed tsc line. context is enriched only when
// success is false, so a green run carries no payload weight.

{
  "success": false,
  "error_count": 1,
  "errors": [
    {
      "file": "src/checkout.spec.ts",
      "line": 42,
      "column": 19,
      "code": "TS2345",
      "message": "Argument of type 'number' is not assignable to parameter of type 'string'.",
      "context":
        "      39:   const desktop = new Desktop();\\n" +
        "      40:   await desktop.launch('AdminDesktop');\\n" +
        "      41:   const usernameField = desktop.locator(\\n" +
        " ->   42:     'window:AdminDesktop >> role:Edit && name:' + 12345\\n" +
        "      43:   );\\n" +
        "      44:   await usernameField.first(3000).then(el => el.typeText('ops-qa'));\\n" +
        "      45: }"
    }
  ],
  "raw_output": "src/checkout.spec.ts(42,19): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'."
}`;

const tscTerminal = [
  { text: "# 1) Assistant calls typecheck_workflow before any UI runs.", type: "info" as const },
  { text: 'mcp -> typecheck_workflow { "workflow_path": "C:\\\\workflows\\\\checkout" }', type: "command" as const },
  { text: "INFO [typecheck] Running tsc --noEmit in C:\\\\workflows\\\\checkout", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "# 2) bun is on PATH so the runner picks bun. No shell fallback.", type: "info" as const },
  { text: "DEBUG command_exists(\"bun\") -> true", type: "output" as const },
  { text: "DEBUG spawn bun [\"tsc\", \"--noEmit\"] in C:\\\\workflows\\\\checkout", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# 3) tsc finds one type error. The five-field regex captures it.", type: "info" as const },
  { text: "src/checkout.spec.ts(42,19): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.", type: "error" as const },
  { text: "", type: "output" as const },
  { text: "# 4) get_error_context renders 3 + arrow + 3.", type: "info" as const },
  { text: "WARN [typecheck] Found 1 type errors in C:\\\\workflows\\\\checkout", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# 5) Result returned to MCP. Assistant edits the workflow.", type: "info" as const },
  { text: "INFO Returned TypecheckResult { success: false, error_count: 1 }", type: "success" as const },
  { text: "INFO Assistant called write_file to repair line 42, then re-ran typecheck_workflow", type: "success" as const },
  { text: "INFO [typecheck] Type-check passed for C:\\\\workflows\\\\checkout", type: "success" as const },
  { text: "INFO Assistant proceeded to execute_sequence with the green workflow", type: "success" as const },
];

const toolCards: BentoCard[] = [
  {
    title: "typecheck_workflow",
    description:
      "Runs tsc --noEmit on the workflow directory, parses the output with a five-field regex, enriches every error with seven lines of context. Returns a TypecheckResult { success, errors, error_count, raw_output } as JSON.",
    size: "2x1",
    accent: true,
  },
  {
    title: "execute_sequence",
    description:
      "The runner. Spawns the TypeScript workflow under bun or node, attaches the event pipe, surfaces step events back as MCP notifications. The piece typecheck_workflow gates.",
    size: "1x1",
  },
  {
    title: "click",
    description:
      "Unified click tool with three modes (selector, coords, image). Verifies the action with ui_diff_before_after so the assistant does not need a follow-up tree call.",
    size: "1x1",
  },
  {
    title: "type_text",
    description:
      "Smart-clipboard text entry into a UI element with verification. Trailing keys like {Enter} or {Tab} are auto-detected so the assistant chains type plus submit in one tool call.",
    size: "1x1",
  },
  {
    title: "wait_for_element",
    description:
      "Wait for an element to satisfy a condition (visible, enabled, focused, exists). One of two ways the suite stays sync-correct without a manual sleep.",
    size: "1x1",
  },
  {
    title: "validate_element",
    description:
      "Read-only existence check that never throws. Returns status='success' with exists=true or status='failed' with exists=false. The conditional-branch primitive.",
    size: "2x1",
  },
  {
    title: "capture_screenshot",
    description:
      "Element, window, or full-monitor screenshot. Auto-resizes to a max dimension. Pairs with execution_logger.rs to cut a before/after pair on every tool call.",
    size: "1x1",
  },
  {
    title: "read_file / write_file / edit_file / grep_files / glob_files",
    description:
      "Five workspace tools so the assistant can repair the test workflow itself. Combined with typecheck_workflow this is the full inner loop: read, edit, typecheck, run.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Where the test learns it has a bug",
    competitor:
      "At runtime, against a real window. The locator throws or a button does not appear. Sometimes thirty seconds in, after a launch, a login, and a navigation.",
    ours:
      "Before any window opens. typecheck_workflow runs tsc --noEmit on the workflow directory and returns parsed errors as JSON. The AI coding assistant fixes the workflow file, then runs the suite.",
  },
  {
    feature: "What the test author writes the test in",
    competitor:
      "Vendor scripting language (TestComplete script, Ranorex Studio, Squish), VBScript variants, or a thin Python wrapper around an unmaintained driver.",
    ours:
      "Plain TypeScript. Every workflow is a tsconfig.json plus .ts files the SDK already types end-to-end. The same code you would write in a normal node project.",
  },
  {
    feature: "Surface the AI coding assistant talks to",
    competitor:
      "A GUI with a record-and-replay button. The assistant has no way to invoke it programmatically without UI automation against the test tool itself.",
    ours:
      "An MCP server with 35 tools. Read, edit, grep, glob, screenshot, click, type, validate, execute_sequence, typecheck_workflow. All callable as JSON-RPC from any MCP-aware editor.",
  },
  {
    feature: "How tsc errors are reported back to the model",
    competitor:
      "Stdout strings. The model sees a wall of compiler text and has to parse line numbers itself, often badly.",
    ours:
      "Structured TypeError objects with file, line, column, code, message, and a seven-line context with an arrow on the error line. The model receives JSON, not text.",
  },
  {
    feature: "Fallback when the toolchain is missing",
    competitor:
      "Often a silent skip or a confused 'tsc not installed' shell error. Sometimes a vendor licensing prompt.",
    ours:
      "Bun first, npx second. If neither is on PATH the tool returns 'Neither bun nor npx found. Install bun or Node.js.' as the error string. The assistant can read it and act.",
  },
  {
    feature: "Where the gate sits in the run lifecycle",
    competitor:
      "Optional pre-build step the test author has to wire up themselves, usually in a YAML CI file.",
    ours:
      "A first-class MCP tool the assistant can call before execute_sequence. The decision to gate is made by the model on a per-run basis, not by a CI workflow.",
  },
  {
    feature: "License of the gate code",
    competitor:
      "Proprietary. Per-seat or per-runner. The reporter plugin is rarely open source.",
    ours:
      "MIT. typecheck.rs is 278 lines you can read in an evening, fork in an afternoon.",
  },
  {
    feature: "What 'green' means",
    competitor:
      "Vendor reporter says PASS. Often based on stdout scraping with no schema.",
    ours:
      "TypecheckResult.success is true and error_count is 0 and raw_output is None. Three independent fields the assistant can assert against.",
  },
];

const sequenceActors = [
  "AI assistant",
  "MCP agent",
  "tsc (bun/npx)",
  "Workflow files",
];

const sequenceMessages: {
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}[] = [
  {
    from: 0,
    to: 1,
    label: "tools/call typecheck_workflow { workflow_path }",
    type: "request",
  },
  {
    from: 1,
    to: 2,
    label: "spawn bun tsc --noEmit (cwd = workflow_path)",
    type: "request",
  },
  { from: 2, to: 3, label: "read tsconfig.json + every .ts file", type: "event" },
  {
    from: 3,
    to: 2,
    label: "source returned",
    type: "response",
  },
  {
    from: 2,
    to: 1,
    label: "stderr: src/checkout.spec.ts(42,19): error TS2345: ...",
    type: "error",
  },
  {
    from: 1,
    to: 1,
    label: "parse_tsc_output -> TypeError, get_error_context -> 3 + 1 + 3 lines",
    type: "event",
  },
  {
    from: 1,
    to: 0,
    label: "TypecheckResult { success: false, errors[], error_count: 1 }",
    type: "response",
  },
  {
    from: 0,
    to: 1,
    label: "tools/call edit_file (repair the workflow line)",
    type: "request",
  },
  {
    from: 0,
    to: 1,
    label: "tools/call typecheck_workflow (re-run)",
    type: "request",
  },
  {
    from: 1,
    to: 0,
    label: "TypecheckResult { success: true, errors: [], error_count: 0 }",
    type: "response",
  },
  {
    from: 0,
    to: 1,
    label: "tools/call execute_sequence (only after green)",
    type: "request",
  },
];

const beamNodes = {
  from: [
    { label: "AI coding assistant", sublabel: "Cursor, Claude Code, Windsurf" },
    { label: ".ts test workflow", sublabel: "tsconfig.json + src/**/*.ts" },
    { label: "package manager", sublabel: "bun or npx (PATH check)" },
    { label: "TerminatorSDK types", sublabel: "@mediar-ai/terminator d.ts" },
  ],
  hub: {
    label: "typecheck_workflow",
    sublabel: "tools/typecheck.rs, 278 lines, MIT",
  },
  to: [
    { label: "TypecheckResult JSON", sublabel: "success, errors[], error_count" },
    { label: "Per-error context", sublabel: "3 lines + arrow + 3 lines" },
    { label: "raw_output (stderr)", sublabel: "only on failure" },
    { label: "tracing subscriber", sublabel: "info or warn level" },
  ],
};

const toolChips = [
  "typecheck_workflow",
  "execute_sequence",
  "click",
  "type_text",
  "wait_for_element",
  "validate_element",
  "capture_screenshot",
  "open_application",
  "navigate_browser",
  "read_file",
  "write_file",
  "edit_file",
  "grep_files",
  "glob_files",
  "scroll_element",
  "select_option",
  "press_key",
  "highlight_element",
  "ask_user_for_input",
  "stop_all",
];

const metrics = [
  { value: 278, label: "lines in typecheck.rs" },
  { value: 5, label: "fields per TypeError" },
  { value: 7, label: "lines of context per error" },
  { value: 35, label: "MCP tools the agent exposes" },
];

const wiringSteps = [
  {
    title: "Lay the workflow out as a normal TypeScript project",
    description:
      "A folder with tsconfig.json at the root and your .ts test files under src/. The SDK package @mediar-ai/terminator is a dev dependency. The same shape any node project uses; no proprietary file format.",
  },
  {
    title: "Tell the assistant to call typecheck_workflow before execute_sequence",
    description:
      "In the system prompt or workflow rules: 'Always invoke typecheck_workflow on workflow_path before execute_sequence. If success is false, fix the file, then re-invoke until green.' That single rule turns a runtime failure into a typecheck failure.",
  },
  {
    title: "On failure, the assistant edits with edit_file",
    description:
      "It receives the structured TypeError list. file, line, column, code, message, and the seven-line context with the error line marked. It calls edit_file with the precise old/new strings, no guessing about location.",
  },
  {
    title: "Re-run typecheck_workflow until success is true",
    description:
      "The agent allows arbitrary loops. The model decides when to stop. In practice 1 to 3 iterations clear most workflow regressions because every error carries its own context.",
  },
  {
    title: "Only then call execute_sequence",
    description:
      "The runner spawns the workflow under bun (preferred) or node, attaches the event pipe, and forwards step events as MCP notifications/progress. By the time UI moves, the workflow is type-safe.",
  },
  {
    title: "Capture the green TypecheckResult in the run record",
    description:
      "execution_logger.rs writes a JSON record per tool call under %LOCALAPPDATA%\\mediar\\executions\\. The typecheck_workflow result is one of those records. Seven-day retention, replayable on demand.",
  },
];

const capabilityChecks = [
  {
    text: "Catch a typo in a Locator selector before any window opens, not after a 30-second launch and login",
  },
  {
    text: "Hand the AI coding assistant a structured TypeError list that already includes a seven-line context with an arrow on the error line",
  },
  {
    text: "Refuse to run execute_sequence if typecheck_workflow returns success: false, by policy in the assistant's system prompt",
  },
  {
    text: "Use bun preferentially when present, fall back to npx, fail loudly if neither is available, all without bespoke shell logic",
  },
  {
    text: "Avoid licensing a proprietary reporter plugin to surface tsc output back to the model",
  },
  {
    text: "Loop the typecheck-edit cycle until the workflow is green, then run, with no human in the inner loop",
  },
  {
    text: "Keep raw_output out of the result on green runs so the payload stays compact",
  },
  {
    text: "Read the gate's source in an evening (278 lines, MIT) and fork it for a different language toolchain",
  },
];

const faqs = [
  {
    q: "Why is shift-left for desktop test automation tools different from shift-left for browser tests?",
    a: "Browser tests have a typecheck story by accident: most teams write Playwright in TypeScript, run tsc as a CI step, and the IDE catches the rest. Desktop test tools, on the other hand, sit on three discontinuities. The test process drives Win32 UI through UIAutomation, the assertions live in a vendor scripting language (TestComplete, Ranorex, Squish), and the AI assistant on top of the stack speaks an entirely different protocol. Shift-left typically means 'add a tsc step in CI'. That does not help an AI coding assistant that is editing a workflow file at 2am between two execute_sequence calls. typecheck_workflow makes the gate a tool, not a CI job, which is why it can sit inside the agent loop instead of outside it.",
  },
  {
    q: "What exactly does the regex at line 54 of typecheck.rs match?",
    a: "The pattern is ^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$. Five capture groups: the relative file path (non-greedy), the 1-indexed line number, the 1-indexed column number, the TS error code (TS2345, TS2304, etc.), and the human-readable message. The anchor on each end and the explicit 'error' keyword keep warnings, info notes, and unrelated tooling output out of the parse result. parse_tsc_output trims each line first, so trailing whitespace from terminal pipes does not break the match. Lines that do not match are silently dropped, which is the right default: tsc emits banners, file lists, and progress lines that have no business becoming TypeError records.",
  },
  {
    q: "Why seven lines of context, and why an arrow?",
    a: "Three lines before, the error line, three lines after. That is the standard rg, fd, and modern compiler output shape, and it is what models like Claude Sonnet, GPT-4o, and Gemini 2.0 are best at consuming. Less context and the model loses scope (which function is this in, what variable was just declared); more context and the prompt budget bleeds. The arrow marker (' -> ' on the error line, four spaces on the others) is intentionally a four-character gutter so the JSON output is column-aligned regardless of line-number digit width. get_error_context formats it with format!(\"{}{:>4}: {}\", marker, line_num, line) at line 111. The model can render it inline in the chat without any additional parsing.",
  },
  {
    q: "Why bun first and npx second?",
    a: "Two reasons. First, bun spawns a TypeScript runtime in single-digit milliseconds where node + tsx adds 200 to 500ms of cold start, and a typecheck loop the assistant runs three or four times per repair cycle compounds that delay. Second, bun's bundled tsc is fully API-compatible with the npm tsc, so 'bun tsc --noEmit' produces identical output to 'npx tsc --noEmit'; there is no behavior difference for the regex parser. The fallback exists because not every customer environment has bun on PATH (macOS dev machines vs Windows CI runners differ), and silent failures at the tool level would block the agent loop. The match returns a clean error string when both are missing; the model handles the message rather than the agent.",
  },
  {
    q: "What happens if tsconfig.json is missing or workflow_path does not exist?",
    a: "Two early-return checks. workflow_path absent returns Err(format!(\"Workflow path does not exist: {}\", workflow_path)). tsconfig.json absent returns Err(format!(\"No tsconfig.json found in: {}\", workflow_path)). Both surface as a CallToolResult::error to the MCP client, which the assistant reads as a tool error rather than a TypecheckResult. That distinction matters: an Err means the gate could not run, so the assistant should fix the workspace; a TypecheckResult { success: false } means the gate ran and the workflow has type errors, so the assistant should fix the source. The two failure modes do not get conflated.",
  },
  {
    q: "How does this compare to TestComplete, Ranorex, WinAppDriver, FlaUI, AutoIt, or Squish?",
    a: "The comparison points are different in kind. Those tools are GUI-first products with a recorder, a script editor, and a runner. The 'tool surface' an AI coding assistant can call is at best a CLI to start the recorder, sometimes a REST endpoint to launch a saved test. None of them ship an MCP server or expose 35 named tools as JSON-RPC, and none ship a typecheck-before-execute primitive that returns structured errors. In practice a team using one of them and an AI assistant ends up writing a wrapper script that scrapes the vendor reporter's stdout, which is exactly the loop typecheck_workflow eliminates. The Terminator answer is to make the model the editor and the agent the runner, with TypeScript as the only language between them.",
  },
  {
    q: "Does this replace JUnit XML reporting?",
    a: "No, it sits before it. typecheck_workflow only addresses static type errors in the workflow source. Runtime failures (an element does not appear, an assertion fails, a network call hangs) are still reported through the event pipe as StepFailed events and aggregated into whatever final reporter the team wants. A common pattern is to keep a thin sink on top of the event stream that emits JUnit XML at the end of a run; the typecheck step is a separate gate the assistant can invoke standalone. Picture two layers: type errors caught by tsc before any UI runs, runtime errors reported through the event stream while UI runs.",
  },
  {
    q: "Can I add my own pre-execute gate alongside typecheck_workflow?",
    a: "Yes. The MCP tool surface is open. Adding a tool follows the rmcp #[tool] macro pattern in server.rs (35 examples to copy), so a 'lint_workflow' or 'eslint_workflow' or even 'biome_workflow' gate is roughly the same 200 lines of Rust as typecheck.rs: a parser, an enrichment pass, a JSON-shaped result. The workflow rules in the assistant's system prompt then call them in sequence: lint, typecheck, execute_sequence. Because the MCP transport is JSON-RPC, the tools are addressable by name; the model decides the order. The agent does not enforce an order beyond what individual tool descriptions suggest.",
  },
  {
    q: "What does 'success' mean in TypecheckResult?",
    a: "Three conditions, all required. output.status.success() (the tsc process exited with code 0). error_count == 0 (the regex parser found zero matching lines). The function returns TypecheckResult { success: output.status.success() && error_count == 0, ... }. A non-zero exit but zero parsed errors is treated as a failure, which guards against tsc emitting an unexpected error format that the regex misses. A zero exit with parsed errors is also treated as a failure, which guards against a regression in tsc's exit-code semantics. Both edges close. The raw_output field is None on success, Some(combined) on failure, so a green run is small and a red run is debuggable.",
  },
  {
    q: "Where in the repo can I read this and prove it runs?",
    a: "crates/terminator-mcp-agent/src/tools/typecheck.rs, 278 lines, MIT licensed. The unit tests at the bottom (#[cfg(test)] mod tests, lines 206 to 277) cover parse_tsc_output for single, multiple, no, and noisy outputs, and get_error_context against a temp file with a known type error. The integration into the MCP server is at crates/terminator-mcp-agent/src/server.rs lines 9521 to 9545: a #[tool(description = ...)] block that wraps typecheck::typecheck_workflow into a CallToolResult. Run cargo test -p terminator-mcp-agent typecheck to see the parser tests pass. The full file is short enough to read in one sitting.",
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
                Desktop test tools
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP tool surface
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                tsc --noEmit
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Test automation tools for desktop applications,{" "}
              <GradientText>gated by tsc before any pixel moves</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Most desktop test tools shift right. The error surfaces when the
              suite is already mid-run against a real application: a launch, a
              login, a navigation, then a stale selector throws. Terminator
              ships a different primitive on its MCP tool surface,{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                typecheck_workflow
              </code>
              . It runs{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                tsc --noEmit
              </code>{" "}
              on the workflow folder, parses every error with a five-field
              regex, attaches a seven-line code context with an arrow on the
              error line, and hands the result back to the AI coding assistant
              as JSON before any window opens.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="13 min read"
            />
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="Open-source, MIT"
          highlights={[
            "278 lines in tools/typecheck.rs, every line readable in one sitting",
            "Five-field regex captures file, line, column, code, and message",
            "Seven-line context per error with the error line marked by an arrow",
            "One of 35 MCP tools the agent exposes; the only typecheck-before-execute gate among them",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="A tsc gate the assistant can call"
            subtitle="before any window opens"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "278 lines in tools/typecheck.rs",
              "Five-field regex parses every tsc error",
              "Seven-line context with an arrow on the error line",
              "Bun first, npx second, hard error if neither",
              "One of 35 MCP tools the assistant can call",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <ProofBanner
            metric="278 lines"
            quote="The whole gate, from the regex that parses tsc output to the formatter that draws an arrow on the error line, fits in a single Rust file you can read in an evening."
            source="crates/terminator-mcp-agent/src/tools/typecheck.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Five fields, one regex
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The whole &quot;is this a real type error?&quot; decision sits in a
            single regex. Five capture groups, anchored to the start and end of
            the line, with an explicit{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              error
            </code>{" "}
            keyword between the location and the TS code. Tsc banners,
            file-list previews, and progress notes never match. Anything that
            does becomes one populated{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              TypeError
            </code>{" "}
            with five fields the assistant can act on.
          </p>
          <AnimatedCodeBlock
            code={regexSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Three lines, an arrow, three lines
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The model needs scope. A TS2345 message in isolation tells you
            which type was mismatched but not which function it was inside or
            which variable was just declared. The context formatter renders
            three lines before the error, the error line itself with a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              {" -> "}
            </code>{" "}
            marker, and three lines after, all with a four-character gutter so
            the JSON output is column-aligned regardless of how many digits the
            line numbers have. Total: seven lines of context per error.
          </p>
          <AnimatedCodeBlock
            code={contextSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Bun first, npx second, no silent shell fallback
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The runner picks bun if it is on PATH, npx if not. Both are tested
            with the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              command_exists
            </code>{" "}
            helper at line 125 (which itself shells to{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              where
            </code>{" "}
            on Windows and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              which
            </code>{" "}
            elsewhere). When neither is present the function returns an Err
            with a string the assistant can read, not a panic and not a silent
            zero-result. That distinction is the difference between &quot;your
            workflow has type errors&quot; and &quot;the toolchain is missing
            from this machine&quot;, and the agent loop relies on it.
          </p>
          <AnimatedCodeBlock
            code={runnerSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the assistant gets back
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            One JSON object,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              TypecheckResult
            </code>
            . Three top-level fields:{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              success
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              error_count
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              errors
            </code>
            , plus an optional{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              raw_output
            </code>{" "}
            that is only populated on failure. Every entry in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              errors
            </code>{" "}
            is a structured{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              TypeError
            </code>{" "}
            with the parsed fields and the seven-line context. The model reads
            JSON, not a wall of compiler text.
          </p>
          <AnimatedCodeBlock
            code={sampleResultSource}
            language="json"
            filename="callTool('typecheck_workflow') response"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            All 35 tools live behind one MCP socket
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The agent exposes 35 tools to whichever MCP-aware editor the team
            uses (Cursor, Claude Code, Windsurf, Zed). Most of them act on the
            UI: click, type, scroll, screenshot. A few act on the workspace:
            read_file, write_file, edit_file, grep_files, glob_files. One of
            them, the one this guide is built around, runs the typecheck.
            Below is a sample of the surface, with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              typecheck_workflow
            </code>{" "}
            highlighted as the gate.
          </p>
          <div className="my-4">
            <Marquee speed={32}>
              {toolChips.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
          <BentoGrid cards={toolCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Shift-right is the default; shift-left is the option
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Eight concrete points where the gate-as-MCP-tool model and the
            traditional desktop test tool model diverge. None of these are
            philosophical: each one is a code path the assistant either has or
            does not.
          </p>
          <ComparisonTable
            productName="Terminator (typecheck_workflow)"
            competitorName="Typical desktop test tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Producers on the left, consumers on the right
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The hub is{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              typecheck_workflow
            </code>
            . On the left it pulls from the assistant&apos;s tool call, the
            workflow source, the resolved package manager, and the SDK type
            definitions. On the right it fans out to a structured result, an
            enriched per-error context, an optional raw stderr, and a tracing
            log line. The whole shape is designed so the gate runs on a
            workspace folder and only a workspace folder, no global state.
          </p>
          <AnimatedBeam
            title="typecheck_workflow inputs and outputs"
            accentColor="#FF3E00"
            from={beamNodes.from}
            hub={beamNodes.hub}
            to={beamNodes.to}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the assistant sees when it calls the tool
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            A single round trip from the assistant&apos;s point of view. It
            asks for a typecheck. The agent picks bun, runs tsc, parses the
            output, returns a structured result. The assistant edits the file,
            re-asks, and only proceeds to{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            once the result is green.
          </p>
          <TerminalOutput
            title="MCP server logs (RUST_LOG=info)"
            lines={tscTerminal}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Four parties, one repair loop
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The full handshake from the AI coding assistant out to the
            workflow files and back. The agent calls bun, bun runs tsc, tsc
            reads the source, the parser extracts five fields per error, the
            formatter attaches seven lines of context, the result lands as JSON
            on the assistant&apos;s side. If success is false the assistant
            edits, then re-runs the same loop. Only after a green result does
            execute_sequence get called.
          </p>
          <SequenceDiagram
            title="assistant -> mcp agent -> tsc -> workflow"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Wiring the gate into your suite
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Six concrete steps, each one bounded to a real file. The shape is
            the same for a fresh project and a retrofit. The pattern works
            because{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              typecheck_workflow
            </code>{" "}
            is just another tool the assistant can call; there is no special
            wiring required beyond a system-prompt rule.
          </p>
          <StepTimeline steps={wiringSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What this primitive unlocks in practice
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Eight things you can do with this in place. Every one is a check
            against the current code, not a marketing slogan. The same
            primitive replaces what most desktop test tools require a CI
            pipeline plus a vendor reporter to express.
          </p>
          <AnimatedChecklist
            title="Capabilities this gate adds"
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
                The whole gate lives in{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  crates/terminator-mcp-agent/src/tools/typecheck.rs
                </code>
                . 278 lines, MIT. The five-field regex,{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  ^(.+?)\(\(\d+\),\(\d+\)\):\s*error\s+\(TS\d+\):\s*(.+)$
                </code>
                , sits in{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  parse_tsc_output
                </code>{" "}
                at line 54. The seven-line context formatter{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  get_error_context
                </code>{" "}
                lives at line 90 and emits 3 lines, the error line marked with{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  &quot; -&gt; &quot;
                </code>
                , then 3 more lines, all with a four-space gutter via{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  format!(&quot;{`{}{:>4}: {}`}&quot;, marker, line_num, line)
                </code>{" "}
                at line 111. The runner picks bun, then npx, then errors. The
                tool is wired into the MCP server at{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  server.rs:9521-9545
                </code>
                . The unit tests at the bottom of the file round-trip the
                regex against four shapes (single, multiple, none, noisy) and
                the context formatter against a temp file with a known TS2322
                error; run{" "}
                <code className="font-mono text-sm bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-orange-700">
                  cargo test -p terminator-mcp-agent typecheck
                </code>{" "}
                to see them pass.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  tools/typecheck.rs
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  tools/mod.rs
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  server.rs:9521
                </span>
                <span className="px-2 py-1 rounded bg-zinc-50 border border-zinc-200 text-zinc-700">
                  Cargo.toml
                </span>
              </div>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Numbers you can verify from the repo
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every figure is a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              wc -l
            </code>{" "}
            or a literal count of named items in the source. None of them
            require running the binary.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={278} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                lines in tools/typecheck.rs
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={5} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                fields parsed per tsc error
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={7} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                lines of context per error
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={35} />
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                MCP tools the agent ships
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Put a tsc gate in front of your desktop test suite"
            description="Bring a workflow folder you already have. We will wire typecheck_workflow into your MCP-aware editor, watch the assistant repair a bad selector before any window opens, and hand you the rule to put in your system prompt by the end of the call."
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
          description="See an AI coding assistant repair a desktop test before any pixel moves"
        />
      </article>
    </div>
  );
}
