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
  BeforeAfter,
  StepTimeline,
  ComparisonTable,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/desktop-automation-tools-free";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Free desktop automation tools that let an AI assistant compile-check its own script before any click runs";
const DESCRIPTION =
  "Most lists of free desktop automation tools rank products by license terms, feature checklists, and supported recorders. None of them ask the question that matters once an AI assistant is the one writing the script: can the tool tell the assistant the workflow does not even compile, before that workflow opens a window? Terminator ships an MCP tool, typecheck_workflow, whose entire job is to run tsc --noEmit on the assistant's TypeScript file and return structured TypeError records with file, line, column, error code, and a seven-line code context window with an arrow marker on the offending line. This guide walks through the file, the regex, the fallback chain, and the loop the assistant runs end-to-end.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "typecheck_workflow MCP tool, parse_tsc_output regex, 7-line context window with a -> arrow on the failing line, bun-then-npx fallback. File: crates/terminator-mcp-agent/src/tools/typecheck.rs. MIT, no seat cap.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free desktop automation tools with a built-in compile-check for AI",
    description:
      "typecheck_workflow returns TypeError records with line, column, code, message, and a seven-line context window. Tsc --noEmit, run from inside MCP, before any click.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop automation tools (free)" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Desktop automation tools (free)", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does typecheck_workflow actually do?",
    a: "It is an MCP tool exposed by terminator-mcp-agent. The model passes a workflow_path argument that points at a directory. The agent confirms the directory exists, confirms there is a tsconfig.json inside it, then shells out to either bun tsc --noEmit or npx tsc --noEmit (whichever exists in PATH). The combined stdout and stderr is parsed against the regex ^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$ and turned into a list of TypeError structs. Each error includes file, line, column, error code (TS2345, TS2304, etc.), and message. On failure the agent enriches each error with a code context window: three lines before the offending line, the offending line itself with a -> marker, and three lines after, with line numbers in the gutter. The whole thing returns as structured JSON to the assistant, which can read it on the same conversational turn it requested the check.",
  },
  {
    q: "Why is this in the MCP agent at all? Why not just expect the developer to run tsc?",
    a: "Because the developer is no longer the one writing the workflow. A coding assistant generates the TypeScript file based on a prompt. If the file does not compile, the assistant has to find that out somehow. Without typecheck_workflow, the only way it finds out is by trying to run the workflow, watching the runtime crash, parsing a stack trace, and guessing what to fix. With typecheck_workflow, the assistant gets the same feedback a developer would get from their editor: file, line, column, error code, message, surrounding code. It can fix the bug in one more turn instead of recovering from a runtime failure that may have already opened windows or clicked into the wrong app.",
  },
  {
    q: "Where exactly does this live in the source tree?",
    a: "The implementation file is crates/terminator-mcp-agent/src/tools/typecheck.rs. It is roughly 280 lines including its tests. The tool is registered in crates/terminator-mcp-agent/src/server.rs at the typecheck_workflow function definition (around line 9523). The arguments struct is TypecheckWorkflowArgs and takes one field, workflow_path. The result struct is TypecheckResult with success: bool, errors: Vec<TypeError>, error_count: usize, and raw_output: Option<String>. The raw_output is only included on failure so the assistant can read the full tsc dump when the parsed errors are not enough.",
  },
  {
    q: "Does it actually fall back from bun to npx, or is one hard-coded?",
    a: "It checks bun first. The function command_exists shells out to which (Unix) or where (Windows) and returns true only if the exit code is success. If bun exists, the tool runs bun tsc --noEmit. If bun does not exist, it tries the same check for npx and uses npx tsc --noEmit. If neither is in PATH the tool returns the error string 'Neither bun nor npx found. Install bun or Node.js.' The choice of bun first is intentional: bun is faster at booting tsc, which matters when the assistant is hitting this loop on every iteration of a workflow generation.",
  },
  {
    q: "What does the seven-line context window look like in practice?",
    a: "If the failure is on line 4 of src/test.ts, get_error_context reads the file, slices lines 1 through 7 (3 before, 1 offending, 3 after, clamped to file bounds), and renders each one as either '    {line_num:>4}: {line}' or ' -> {line_num:>4}: {line}' depending on whether it is the failing line. The output looks like '    1: import { foo } from \\'bar\\';' on line 1 and ' ->    4:   const x: string = 123;' on line 4. The model sees the failing line in context, not as a single message. That is what makes the next fix viable in one turn.",
  },
  {
    q: "How is this different from running tsc in CI?",
    a: "CI runs tsc once per push, after a human has already written the file. typecheck_workflow runs tsc inside an MCP session, on a file the assistant just wrote, before that file gets executed. The assistant calls it in the same conversation that produced the file. There is no commit, no push, no CI runner spin-up. It is a feedback turn, not a release gate. Most other free desktop automation tools have no analogue: their language is Python or AutoHotkey or .ahk script, which has no static type system to begin with, so 'compile-check' is not a thing the runtime can offer.",
  },
  {
    q: "Will typecheck_workflow catch logic bugs, or only type errors?",
    a: "Only the things tsc --noEmit catches. Wrong selector strings, missing element timeouts, race conditions, off-by-one indices: tsc cannot see those. What tsc does see is the shape of every desktop API call: did you pass a string where a number was required, did you call a method that does not exist on the Desktop class, did you import from a wrong path, did you forget to await a promise that returns a locator. Those are the errors that crash a workflow on startup, and those are the errors typecheck_workflow returns to the assistant before the workflow ever runs.",
  },
  {
    q: "Do other free desktop automation tools have anything like this?",
    a: "Not as a runtime feature. AutoHotkey is dynamically scoped and does not have a separate type checker. AutoIt has Au3Check, which catches some syntax issues, but it is a separate executable and is not exposed to an AI assistant over a structured protocol. SikuliX runs Jython and surfaces Python tracebacks at runtime, never at compile time. Pywinauto is plain Python with no built-in type-check tool. Robot Framework has --dryrun mode, which executes the workflow with all keywords stubbed; that is closer in spirit, but it is a CLI flag for a developer, not a tool an MCP client can call. Terminator is the only one in the category whose package.json includes both the runtime SDK and an MCP-exposed compile check that returns structured TypeError objects.",
  },
  {
    q: "Is the whole thing free and MIT?",
    a: "Yes. terminator-mcp-agent is on npm under the MIT license. The typecheck_workflow tool is part of the same npm package and ships with every install of npx -y terminator-mcp-agent@latest. There is no premium tier that unlocks the type checker. The only piece of the agent that touches a paid API is gemini_computer_use, which calls Gemini with your own key for last-resort visual recovery. Type-checking has no API call attached to it: it runs the local tsc binary that bun or node already has.",
  },
  {
    q: "What is the quickest way to see typecheck_workflow run end-to-end?",
    a: "Add the agent to your MCP client with claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. Ask the assistant to write a TypeScript workflow that opens Notepad and types a string. Then ask it to call typecheck_workflow on the directory it just wrote the file into. The first call will either return success: true, errors: [], error_count: 0 or a structured list of errors with code context. The assistant will use whichever response it gets to decide whether to call execute_sequence next. That is the loop.",
  },
];

const toolComparisonRows: ComparisonRow[] = [
  {
    feature: "Compile-check the assistant's script before execution",
    competitor: "Not exposed; assistant has to run and crash",
    ours: "typecheck_workflow MCP tool, returns structured TypeError list",
  },
  {
    feature: "Error format the assistant reads back",
    competitor: "Runtime stack trace in stdout / stderr",
    ours: "JSON: file, line, column, code (TS2345 etc.), message, 7-line context",
  },
  {
    feature: "Pre-flight tool runner",
    competitor: "Manual; the developer runs tsc / pylint / Au3Check by hand",
    ours: "Built into the same MCP session that wrote the workflow",
  },
  {
    feature: "Works from inside an AI coding assistant",
    competitor: "No; tools predate MCP and the AI-author use case",
    ours: "Yes; the tool is registered with #[tool(...)] in server.rs",
  },
  {
    feature: "Toolchain detection",
    competitor: "Hard-coded interpreter or none",
    ours: "command_exists check: bun first, npx fallback, error if neither",
  },
  {
    feature: "Cost of a single check",
    competitor: "Free, but human-driven",
    ours: "Free, no API, runs local tsc, returns in one MCP call",
  },
  {
    feature: "License",
    competitor: "Mixed: MIT, GPL, Apache, vendor proprietary, dual-licensed",
    ours: "MIT for runtime, MIT for MCP agent, MIT for typecheck tool",
  },
];

const remotionCaptions = [
  "The assistant writes a workflow.",
  "It calls typecheck_workflow before running it.",
  "Tsc --noEmit fires inside the MCP agent.",
  "Errors come back with file, line, column, code, context.",
  "The fix happens before the first click.",
];

const typecheckRsSnippet = `// crates/terminator-mcp-agent/src/tools/typecheck.rs

pub async fn typecheck_workflow(workflow_path: &str)
    -> Result<TypecheckResult, String>
{
    let path = Path::new(workflow_path);
    if !path.exists() {
        return Err(format!("Workflow path does not exist: {}", workflow_path));
    }

    let tsconfig = path.join("tsconfig.json");
    if !tsconfig.exists() {
        return Err(format!("No tsconfig.json found in: {}", workflow_path));
    }

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
        .output()
        .await
        .map_err(|e| format!("Failed to run tsc: {}", e))?;

    let combined_output = format!("{}\\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr));

    let mut errors = parse_tsc_output(&combined_output);
    let error_count = errors.len();
    let success = output.status.success() && error_count == 0;

    if !success { enrich_errors_with_context(path, &mut errors); }

    Ok(TypecheckResult {
        success,
        errors,
        error_count,
        raw_output: if success { None } else { Some(combined_output.to_string()) },
    })
}`;

const parseTscSnippet = `// parse_tsc_output: turn one tsc line into a TypeError struct

pub fn parse_tsc_output(output: &str) -> Vec<TypeError> {
    let mut errors = Vec::new();
    let re = regex::Regex::new(
        r"^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$"
    ).expect("Invalid regex");

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

const contextSnippet = `// get_error_context: 3 lines before, the offending line, 3 after

fn get_error_context(workflow_path: &Path, error: &TypeError) -> Option<String> {
    let file_path = workflow_path.join(&error.file);
    let content = fs::read_to_string(&file_path).ok()?;
    let lines: Vec<&str> = content.lines().collect();

    if error.line == 0 || error.line as usize > lines.len() { return None; }

    let error_idx = error.line as usize - 1;
    let start = error_idx.saturating_sub(3);
    let end = (error_idx + 4).min(lines.len());

    let mut context_lines = Vec::new();
    for (i, line) in lines.iter().enumerate().take(end).skip(start) {
        let line_num = i + 1;
        let marker = if line_num == error.line as usize { " -> " } else { "    " };
        context_lines.push(format!("{}{:>4}: {}", marker, line_num, line));
    }
    Some(context_lines.join("\\n"))
}`;

const sampleErrorJson = `{
  "success": false,
  "error_count": 1,
  "errors": [
    {
      "file": "src/workflow.ts",
      "line": 14,
      "column": 19,
      "code": "TS2345",
      "message": "Argument of type 'number' is not assignable to parameter of type 'string'.",
      "context": "       11: const desktop = new Desktop();\\n       12: \\n       13: export const openNotepad = createStep({\\n ->    14:   execute: async ({ desktop }) => desktop.openApplication(7),\\n       15: });\\n       16: \\n       17: const workflow = createWorkflow({ name: 'demo' })"
    }
  ],
  "raw_output": "src/workflow.ts(14,19): error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'."
}`;

const mcpConfigSnippet = `{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`;

const terminalLines = [
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "[terminator] MCP server listening on stdio", type: "output" as const },
  { text: "[terminator] tools registered: 35 (incl. typecheck_workflow)", type: "output" as const },
  { text: "[claude] write_file('./flows/notepad/src/workflow.ts', ...)", type: "command" as const },
  { text: "[terminator] wrote 1.2 kB", type: "output" as const },
  { text: "[claude] typecheck_workflow(workflow_path: './flows/notepad')", type: "command" as const },
  { text: "[typecheck] Running tsc --noEmit in ./flows/notepad", type: "output" as const },
  { text: "[typecheck] Found 1 type errors in ./flows/notepad", type: "output" as const },
  { text: "[claude] reads error: src/workflow.ts:14:19 TS2345", type: "output" as const },
  { text: "[claude] edit_file('./flows/notepad/src/workflow.ts', ...)", type: "command" as const },
  { text: "[claude] typecheck_workflow(workflow_path: './flows/notepad')", type: "command" as const },
  { text: "[typecheck] Type-check passed for ./flows/notepad", type: "success" as const },
  { text: "[claude] execute_sequence(workflow_path: './flows/notepad')", type: "command" as const },
  { text: "[runner] Executing step: open Notepad", type: "output" as const },
  { text: "[runner] Completed step: open Notepad (340ms)", type: "success" as const },
];

const installSteps = [
  {
    title: "Install the MCP agent",
    description:
      "Add one block to your assistant's MCP config that runs npx -y terminator-mcp-agent@latest. typecheck_workflow comes with it. No extra dependency, no separate install, no service.",
  },
  {
    title: "Have the assistant scaffold a workflow",
    description:
      "Ask your assistant to write a TypeScript workflow under a directory it picks. It will create a tsconfig.json (the type-checker requires one), a package.json that depends on @mediar-ai/terminator and @mediar-ai/workflow, and an src/workflow.ts file.",
  },
  {
    title: "Have it call typecheck_workflow",
    description:
      "Pass workflow_path: './path/to/the/dir'. The agent runs bun tsc --noEmit if bun is installed, else npx tsc --noEmit. The result is JSON: success, error_count, an array of TypeErrors with code context, and raw_output if anything failed.",
  },
  {
    title: "Let the assistant fix and re-check",
    description:
      "If the result has error_count > 0, the assistant patches the file and re-calls typecheck_workflow. Once success is true, it can call execute_sequence to actually run the workflow against the OS. The first click happens after the compile check passes, not before.",
  },
];

const beamFrom = [
  { label: "Claude Code", sublabel: "MCP client" },
  { label: "Cursor", sublabel: "MCP client" },
  { label: "Codex", sublabel: "MCP client" },
  { label: "Windsurf", sublabel: "MCP client" },
];

const beamTo = [
  { label: "bun tsc --noEmit", sublabel: "preferred when bun is in PATH" },
  { label: "npx tsc --noEmit", sublabel: "fallback when bun is missing" },
  { label: "Err: install bun or Node", sublabel: "if neither command exists" },
];

const beamHub = {
  label: "typecheck_workflow",
  sublabel: "tools/typecheck.rs",
};

const sequenceMessages: Array<{
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}> = [
  { from: 0, to: 1, label: "write_file('flows/x/src/workflow.ts', ...)", type: "request" },
  { from: 1, to: 0, label: "ok, 1.2 kB", type: "response" },
  { from: 0, to: 1, label: "typecheck_workflow(workflow_path: 'flows/x')", type: "request" },
  { from: 1, to: 2, label: "spawn bun tsc --noEmit (cwd: flows/x)", type: "request" },
  { from: 2, to: 1, label: "stderr: workflow.ts(14,19): error TS2345 ...", type: "response" },
  { from: 1, to: 1, label: "parse_tsc_output + enrich with 7-line context", type: "event" },
  { from: 1, to: 0, label: "{ success: false, errors: [{...}], error_count: 1 }", type: "response" },
  { from: 0, to: 1, label: "edit_file then typecheck_workflow again", type: "request" },
  { from: 1, to: 2, label: "spawn bun tsc --noEmit (cwd: flows/x)", type: "request" },
  { from: 2, to: 1, label: "exit 0, no errors", type: "response" },
  { from: 1, to: 0, label: "{ success: true, errors: [], error_count: 0 }", type: "response" },
];

const toolChips: Array<{ name: string; offered: string }> = [
  { name: "AutoHotkey", offered: "no static type system, no compile check" },
  { name: "AutoIt", offered: "Au3Check exists but is not MCP-exposed" },
  { name: "SikuliX", offered: "runtime-only Jython tracebacks" },
  { name: "Pywinauto", offered: "no built-in pre-flight check" },
  { name: "Robot Framework", offered: "--dryrun is a CLI flag, not an MCP tool" },
  { name: "Winium", offered: "WebDriver runtime errors only" },
  { name: "WinAppDriver", offered: "Appium errors only" },
  { name: "Power Automate Desktop", offered: "vendor designer, not exposed to MCP" },
  { name: "UiPath Community", offered: "Studio compiler, not exposed to MCP" },
  { name: "Ui.Vision RPA", offered: "image-recognition runtime errors only" },
  { name: "Terminator", offered: "typecheck_workflow returns structured TypeError records" },
];

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
              readingTime="12 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              The free desktop automation tool that lets the assistant{" "}
              <GradientText>compile-check its own script</GradientText> before
              the first click
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              The category page for free desktop automation tools rarely asks
              the question that decides whether an AI-written workflow runs at
              all. Not the license, not the recorder, not the seat count. The
              question is whether the assistant can find out the file does not
              compile before the file gets executed against the operating
              system. Terminator answers it with a single MCP tool,{" "}
              <code>typecheck_workflow</code>, that runs <code>tsc --noEmit</code>{" "}
              against the workflow directory and returns a structured list of{" "}
              <code>TypeError</code> records with file, line, column, error
              code, message, and a seven-line code context window with a{" "}
              <code>-&gt;</code> arrow on the offending line. Everything below
              walks through where that tool lives, what its parser regex looks
              like, and how the loop runs end-to-end.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={5.0}
          ratingCount="MIT, MCP-native, structured pre-flight type-check"
          highlights={[
            "typecheck_workflow MCP tool runs bun tsc --noEmit, falls back to npx",
            "Errors return as JSON: file, line, column, TS code, message, context",
            "Seven-line context window with a -> arrow on the failing line",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="Compile-check before click. That is the loop."
            subtitle="An MCP tool whose only job is to tell the assistant the script does not build yet."
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What every other roundup leaves out
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same dozen products show up on every list. AutoHotkey, AutoIt,
            SikuliX, Pywinauto, Robot Framework, Winium, WinAppDriver,
            Ui.Vision, Power Automate Desktop, UiPath Community Edition. The
            comparison axes are always license type, supported recorder, image
            matching vs. accessibility-based, Windows vs. cross-platform. None
            of those axes change once the operator stops being a person at the
            keyboard. When the operator is an AI coding assistant, the axis
            that matters is whether it can find out the workflow does not even
            compile before the workflow opens a window. Almost none of the
            tools in the category expose that signal at all. None of them
            expose it as a structured tool an MCP client can call.
          </p>
          <div className="mt-6">
            <Marquee speed={40} fade pauseOnHover>
              <div className="flex gap-3 pr-3">
                {toolChips.map((t) => (
                  <span
                    key={t.name}
                    className="whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
                  >
                    <span className="font-semibold text-zinc-900">{t.name}</span>
                    <span className="mx-2 text-zinc-400">|</span>
                    <span className="text-zinc-600">{t.offered}</span>
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: one file, one regex, one fallback chain
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                The implementation lives in{" "}
                <code>crates/terminator-mcp-agent/src/tools/typecheck.rs</code>.
                It does four things in order. It validates that the path the
                assistant passed exists and that there is a{" "}
                <code>tsconfig.json</code> inside it. It picks a runner with a{" "}
                <code>command_exists</code> check that prefers <code>bun</code>{" "}
                and falls back to <code>npx</code>. It runs <code>tsc --noEmit</code>{" "}
                with the workflow directory as the working directory and
                captures both stdout and stderr. It parses the combined output
                with the regex{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  ^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$
                </code>{" "}
                and, on failure only, enriches each error with a seven-line
                context window. The output is JSON the assistant reads on the
                same MCP turn that requested the check.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The function the MCP agent runs
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the entire entry point. Validation, runner detection,
            spawn, parse, optional context enrichment, structured result. The
            return shape is what gets serialized back to the assistant as the
            tool result.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={typecheckRsSnippet}
              language="rust"
              filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The regex that turns one tsc line into a TypeError
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Tsc emits errors in a single line format:{" "}
            <code>path(line,col): error TSXXXX: message</code>. The regex
            extracts the five capture groups, each one becomes a field on the{" "}
            <code>TypeError</code> struct, and lines that do not match are
            dropped silently. That last detail matters: a real tsc dump is
            full of noise (warnings, summaries, header lines), and the parser
            ignores everything that is not shaped like an error.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={parseTscSnippet}
              language="rust"
              filename="parse_tsc_output (typecheck.rs)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How the seven-line context window is built
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The context is the bit a model needs most. A line and column
            number on its own is hard to act on. The function reads the file,
            slices three lines above and three below the failing line, and
            renders each one with a four-character marker:{" "}
            <code>&quot; -&gt; &quot;</code> on the offending line and four
            spaces on the others. Line numbers are right-aligned in a
            four-wide gutter so the output stays a clean rectangle in the
            assistant&apos;s prompt.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={contextSnippet}
              language="rust"
              filename="get_error_context (typecheck.rs)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the assistant sees on the wire
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is one real failure shape. The workflow tries to call{" "}
            <code>desktop.openApplication(7)</code>, which is wrong because{" "}
            <code>openApplication</code> takes a string. The compile check
            returns a single error with the exact line, the exact column, the
            exact error code, and the four lines around the failure rendered
            with the arrow marker.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={sampleErrorJson}
              language="json"
              filename="typecheck_workflow result (one error)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            With the loop vs. without the loop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two ways to discover the same bug. One ends with the assistant
            reading a runtime stack trace after the workflow already opened a
            window or clicked into the wrong app. The other ends with the
            assistant patching one line in one file before the OS sees a
            single tool call.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="Pre-flight type-check vs. find-out-at-runtime"
              before={{
                label: "Without typecheck_workflow",
                content:
                  "The assistant writes the script, calls execute_sequence, the runtime crashes mid-step. The error surfaces as a stack trace inside a runtime log. The assistant has to parse the trace, guess the source file, and figure out the fix from a runtime error message that does not include the original line of code.",
                highlights: [
                  "Workflow opens windows or clicks before the bug surfaces",
                  "Stack trace is the only signal",
                  "Source line is not in the error",
                  "Fix turn is reactive, not preventive",
                ],
              }}
              after={{
                label: "With typecheck_workflow",
                content:
                  "The assistant calls typecheck_workflow on the file it just wrote. The result is a JSON list of TypeError records, each with file, line, column, code, message, and a seven-line context window. Nothing has run on the OS yet. The fix and re-check happen entirely inside the MCP session.",
                highlights: [
                  "No window opens until the file compiles",
                  "Errors are structured JSON, not text",
                  "Each error includes a 7-line code context",
                  "Fix turn happens before the side effects do",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The exchange between assistant, agent, and tsc
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three actors, eleven messages, two compile passes. The MCP agent
            sits between the assistant and the local <code>tsc</code> binary.
            It is the piece that knows how to spawn the right runner, parse
            the output into structured errors, and merge in the code context.
            Every byte the assistant sees is shaped by it.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="Assistant -> terminator-mcp-agent -> tsc"
              actors={["Assistant", "terminator-mcp-agent", "tsc (bun or npx)"]}
              messages={sequenceMessages}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What a real session looks like on stdio
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One file write, one failed type-check, one fix, one passing
            type-check, one execute. The agent prints to stderr so you can
            watch the loop resolve in real time, even when the assistant runs
            it from a UI that hides the protocol.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="claude_desktop -> terminator-mcp-agent (stderr tail)"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            One agent, every assistant, two possible runners
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP agent is a single binary. Every major AI coding assistant
            speaks the protocol. On the other side, the agent picks one of
            three outcomes per call: bun if it is in PATH, npx if it is not,
            an explicit error string if neither is installed. Nothing else is
            consulted, no env var lookup, no config file, no version
            negotiation.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="typecheck_workflow as a hub between assistants and the local toolchain"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The four steps that turn this on for any MCP client
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is no separate package, no settings panel, no opt-in flag.
            The type-check tool is registered in the same{" "}
            <code>tool_router</code> as <code>click_element</code> and{" "}
            <code>get_window_tree</code>. Once the agent is wired up, the
            assistant can call it in the same conversation it writes the
            workflow.
          </p>
          <div className="mt-6">
            <StepTimeline steps={installSteps} />
          </div>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={mcpConfigSnippet}
              language="json"
              filename="claude_desktop_config.json"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The comparison row that belongs on every roundup
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            License is a price column. Recorder type is a feature column.
            Pre-flight compile-check, exposed as an MCP tool, callable by the
            same assistant that wrote the script, is the column that decides
            whether an AI-written workflow has any chance of running cleanly
            on the first try.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical free desktop automation tool"
            rows={toolComparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The numbers that describe the surface
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The whole tool is small. <NumberTicker value={1} /> file
            (typecheck.rs), <NumberTicker value={5} /> regex capture groups
            (file, line, column, code, message),{" "}
            <NumberTicker value={7} /> lines of context per error (3 before,
            the offending line, 3 after), <NumberTicker value={2} /> possible
            runners (bun, npx), and <NumberTicker value={4} /> validation
            checks (path exists, tsconfig present, runner found, exit code
            success).
          </p>
        </section>

        <section className="mt-14">
          <ProofBanner
            quote="The first click of an AI-driven workflow should never be the moment you find out the script does not compile."
            source="typecheck.rs, terminator-mcp-agent"
            metric="0 clicks before tsc"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why this is the part the category page never covers
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A roundup is graded on whether it lists the expected dozen
            products. A pre-flight tool the assistant calls before any side
            effect is outside that grade. But once you are installing a free
            desktop automation framework so an AI assistant can drive it, the
            ability to compile-check the assistant&apos;s own output is the
            difference between a workflow that runs and a workflow that
            crashes mid-step. <code>typecheck_workflow</code> is a 280-line
            file in a Rust crate and it does only one thing. That one thing
            is the gap most other tools have not noticed yet.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Install with{" "}
            <code>
              claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
            </code>
            , ask your assistant to write a workflow, and ask it to call{" "}
            <code>typecheck_workflow</code> on the directory before it calls{" "}
            <code>execute_sequence</code>. The first response back from the
            agent will tell you whether the file compiles. The first click
            comes after that, not before.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Watch the compile-check loop run against your own workflow"
          description="Bring a TypeScript file (or none) and we will open a live MCP session, write a workflow together, run typecheck_workflow until it passes, and only then execute it. You will see exactly how the assistant reads the structured TypeError records back."
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Frequently asked
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See typecheck_workflow run on a workflow you bring."
      />
    </>
  );
}
