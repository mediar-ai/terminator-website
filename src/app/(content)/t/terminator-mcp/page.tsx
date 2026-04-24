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
  ShimmerButton,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  SequenceDiagram,
  BentoGrid,
  GlowCard,
  StepTimeline,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/terminator-mcp";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Terminator MCP: the desktop automation server that type-checks your workflow before it ever clicks a pixel";
const DESCRIPTION =
  "Every other walkthrough of this stops at claude mcp add terminator and a tool list. None of them tell you that Terminator's MCP server ships a first-class typecheck_workflow tool that runs tsc --noEmit on your TypeScript workflow directory, parses the tsc stderr with a dedicated regex, and returns structured TS errors with 5 lines of code context around each failing line before the LLM ever tries to run the workflow on a real desktop.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A typed automation surface. Write a workflow in TypeScript, have the MCP server compile it before it runs, get structured TS2345/TS2304 errors with file, line, column, and 5 lines of context back into the LLM's conversation.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator MCP: the MCP server that compiles before it clicks",
    description:
      "typecheck_workflow runs tsc --noEmit and returns structured TS errors. terminator mcp run refuses to execute until the workflow compiles.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Terminator MCP" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Terminator MCP", url: PAGE_URL },
];

const installCode = `# From crates/terminator-mcp-agent/README.md line 19.
# Registers the server at user scope so every Claude Code
# session on this box picks it up.

claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# Bootstrap a typed workflow project. tsconfig.json with strict: true,
# package.json with "build": "tsc --noEmit", and a src/terminator.ts
# that imports createWorkflow and z from "@mediar-ai/workflow".

npx terminator init close-month-end
cd close-month-end

# First sanity check: does it compile?
npx tsc --noEmit
#   (clean output means the LLM is allowed to run it)`;

const typecheckRegexCode = `// crates/terminator-mcp-agent/src/tools/typecheck.rs line 52
// The MCP server spawns tsc, grabs stderr, and parses EACH line with
// this exact regex. The matched groups are what the LLM sees.

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
                context: None,  // filled in by enrich_errors_with_context below
            });
        }
    }
    errors
}`;

const contextEnrichmentCode = `// crates/terminator-mcp-agent/src/tools/typecheck.rs lines 90-115
// Every error gets 3 lines above and 3 lines below the failing line.
// The failing line is prefixed with " -> ". The payload the LLM sees
// is therefore auto-debuggable, no follow-up tool call required.

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

const toolResultShape = `// What the LLM actually gets back from typecheck_workflow.
// Structured, parseable, and already in a shape it can edit against.

{
  "success": false,
  "error_count": 2,
  "errors": [
    {
      "file": "src/steps/01-open-quickbooks.ts",
      "line": 14,
      "column": 23,
      "code": "TS2345",
      "message": "Argument of type 'string' is not assignable to parameter of type 'Selector'.",
      "context":
          "    11:   const win = await desktop.locator('role:Window && name:QuickBooks').first();\\n" +
          "    12:   await win.waitFor({ state: 'visible', timeoutMs: 15000 });\\n" +
          "    13:\\n" +
          " -> 14:   const amount = await win.locator('Amount').first();\\n" +
          "    15:   await amount.type(invoice.total);\\n" +
          "    16:   return { amount_typed: invoice.total };\\n" +
          "    17: };"
    },
    {
      "file": "src/terminator.ts",
      "line": 27,
      "column": 5,
      "code": "TS2304",
      "message": "Cannot find name 'stepThree'. Did you mean 'stepTwo'?",
      "context": "... five lines ..."
    }
  ]
}`;

const cliFlow = [
  { text: "# Scaffold the typed workflow project.", type: "output" as const },
  { text: "npx terminator init close-month-end", type: "command" as const },
  { text: "Creating new Terminator workflow...", type: "output" as const },
  { text: "  created  package.json        ( \"build\": \"tsc --noEmit\" )", type: "output" as const },
  { text: "  created  tsconfig.json       ( \"strict\": true )", type: "output" as const },
  { text: "  created  src/terminator.ts", type: "output" as const },
  { text: "  created  src/steps/01-step-one.ts", type: "output" as const },
  { text: "  created  src/steps/02-step-two.ts", type: "output" as const },
  { text: "Project structure ready", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# First run: LLM has just written src/steps/02-step-two.ts.", type: "output" as const },
  { text: "# Try to execute it. The CLI guards the call with a type check.", type: "output" as const },
  { text: "terminator mcp run ./close-month-end --verbose", type: "command" as const },
  { text: "Detected TypeScript workflow at ./close-month-end/src/terminator.ts", type: "output" as const },
  { text: "Running type check with tsc --noEmit...", type: "output" as const },
  { text: "================================================================================", type: "output" as const },
  { text: "TypeScript Type Check Failed", type: "error" as const },
  { text: "================================================================================", type: "output" as const },
  { text: "src/steps/02-step-two.ts(18,9): error TS2322: Type 'number' is not assignable to type 'string'.", type: "error" as const },
  { text: "   15:   const total = items.reduce((s, i) => s + i.price, 0);", type: "output" as const },
  { text: "   16:", type: "output" as const },
  { text: "   17:   return {", type: "output" as const },
  { text: " ->18:     amount_typed: total,          // expected string, got number", type: "error" as const },
  { text: "   19:     vendor_id: invoice.vendor", type: "output" as const },
  { text: "   20:   };", type: "output" as const },
  { text: "================================================================================", type: "output" as const },
  { text: "Fix type errors before running the workflow", type: "output" as const },
  { text: "Or use --skip-type-check to bypass (not recommended)", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# LLM patches the return to String(total). Rerun.", type: "output" as const },
  { text: "terminator mcp run ./close-month-end --verbose", type: "command" as const },
  { text: "Running type check with tsc --noEmit...", type: "output" as const },
  { text: "Type check passed", type: "success" as const },
  { text: "[INFO ] Step 1/4  open_application       ok   230ms", type: "output" as const },
  { text: "[INFO ] Step 2/4  wait_for_element       ok   1.2s", type: "output" as const },
  { text: "[INFO ] Step 3/4  type_into_element      ok   90ms", type: "output" as const },
  { text: "[INFO ] Step 4/4  click_element          ok   70ms", type: "output" as const },
  { text: "[INFO ] sequence finished                ok   1.7s total", type: "success" as const },
];

const sequenceActors = [
  "Claude / LLM",
  "MCP stdio",
  "MCP server",
  "tsc --noEmit",
  "src/**/*.ts",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "call_tool typecheck_workflow { workflow_path: \"./close-month-end\" }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "JSON-RPC over stdio",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "spawn bun tsc --noEmit (falls back to npx, then global tsc)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 4,
    label: "read tsconfig.json + src/**/*.ts",
    type: "request" as const,
  },
  {
    from: 4,
    to: 3,
    label: "type check",
    type: "response" as const,
  },
  {
    from: 3,
    to: 2,
    label: "stderr lines in TSC format",
    type: "response" as const,
  },
  {
    from: 2,
    to: 2,
    label: "parse_tsc_output + enrich_errors_with_context",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "TypecheckResult { success, errors[], error_count }",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "structured JSON payload, LLM edits the offending file",
    type: "response" as const,
  },
];

const capabilityCards: BentoCard[] = [
  {
    title: "typecheck_workflow is a first-class MCP tool",
    description:
      "Sits right next to click_element, type_into_element, and execute_sequence in the same dispatch table. The LLM can ask the server \"is this workflow type-correct?\" mid-conversation and get a parseable TypecheckResult back.",
    size: "2x1",
    accent: true,
  },
  {
    title: "15 async handlers in server.rs",
    description:
      "get_window_tree, get_applications_and_windows_list, click_element, activate_element, validate_element, navigate_browser, open_application, execute_sequence, read_file, write_file, edit_file, copy_content, glob_files, grep_files, typecheck_workflow. Every one routes through the same dispatch path at server.rs line 9953.",
  },
  {
    title: "The regex is the contract",
    description:
      "Each tsc line is parsed with ^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$. Five capture groups map directly to file, line, column, code, message. No prose.",
  },
  {
    title: "Errors ship with code context",
    description:
      "enrich_errors_with_context reads the offending file, walks 3 lines up and 3 lines down, prefixes the failing line with \" -> \", and returns the whole block so the LLM fixes the real code not a paraphrase.",
    size: "2x1",
  },
  {
    title: "bun, then npx, then global tsc",
    description:
      "The server probes for bun first (faster cold start), falls back to npx, then a global tsc, before giving up. Whatever your dev box has, the check runs.",
  },
  {
    title: "The CLI guards execution too",
    description:
      "terminator mcp run ./workflow-dir refuses to execute a TypeScript workflow until tsc --noEmit passes. You can pass --skip-type-check, but the help text literally says \"not recommended\".",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Workflow authoring surface",
    competitor: "YAML or JSON only; typos in selectors surface at runtime",
    ours: "TypeScript project with strict: true, scaffolded by `terminator init`",
  },
  {
    feature: "Pre-execution validation",
    competitor: "Workflow starts clicking; errors appear mid-run",
    ours: "`terminator mcp run` runs tsc --noEmit first; no clicks until it passes",
  },
  {
    feature: "Error feedback to the LLM",
    competitor: "Raw stderr blob pasted back into the conversation",
    ours: "Structured TypeError[] with file, line, column, code, message, and 5-line code context",
  },
  {
    feature: "Bypass path for iteration",
    competitor: "Delete the workflow file and rewrite it",
    ours: "--skip-type-check exists and is documented, but flagged as \"not recommended\"",
  },
  {
    feature: "Tool count the LLM can see",
    competitor: "Variable; depends on the server",
    ours: "15 async handlers in server.rs, all introspectable via `claude mcp get terminator`",
  },
  {
    feature: "LLM self-repair loop",
    competitor: "LLM guesses from a text dump",
    ours: "LLM calls typecheck_workflow, reads TS2304/TS2345 with context, edits the failing file, retries",
  },
  {
    feature: "CI integration",
    competitor: "Requires separate CI step to lint/validate",
    ours: "Same tsc --noEmit runs locally and in CI; no divergence between LLM path and pipeline path",
  },
  {
    feature: "Cross-platform reach",
    competitor: "Often Windows-only",
    ours: "Windows UIA, macOS AX, and Linux AT-SPI under the same TypeScript SDK",
  },
];

const marqueeChips = [
  "typecheck_workflow",
  "tsc --noEmit",
  "TS2345",
  "TS2304",
  "bun tsc first",
  "npx tsc fallback",
  "parse_tsc_output",
  "enrich_errors_with_context",
  "--skip-type-check (not recommended)",
  "terminator init",
  "role:Button && name:Save",
  "@mediar-ai/workflow",
  "z.object({ ... })",
  "createWorkflow",
];

const authoringSteps = [
  {
    title: "npx terminator init close-month-end",
    description:
      "Scaffolds a package.json with @mediar-ai/workflow, a strict tsconfig.json, and a src/terminator.ts that uses `createWorkflow` with a zod input schema. The project's `build` script is literally `tsc --noEmit`, exactly what the MCP server will run.",
  },
  {
    title: "Write steps as plain TypeScript modules",
    description:
      "Each step exports a function that takes a context and returns a typed result. Selectors stay in one place, variables are zod-validated at the workflow boundary, and the TypeScript compiler catches every wrong prop before the runner ever touches your desktop.",
  },
  {
    title: "The LLM calls typecheck_workflow mid-chat",
    description:
      "Before the agent triggers execute_sequence, it can ask the server to type-check the workflow directory. The response is JSON: success flag, error count, and a structured errors array with line numbers and context. The agent edits the file, not the chat history.",
  },
  {
    title: "`terminator mcp run ./close-month-end`",
    description:
      "The CLI detects the TypeScript project, runs tsc --noEmit itself (bun → npx → global tsc), prints a bordered error block if anything fails, and refuses to call execute_sequence. A single code path for humans, agents, and CI.",
  },
  {
    title: "--start-from-step and .mediar/workflows/<name>/state.json",
    description:
      "When execution does start, every step with an id writes its result and env into a per-workflow state.json. Re-run with --start-from-step to pick up exactly where a failure happened, without re-typing anything.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "The Claude Code MCP server that treats your context window as a budget",
    excerpt:
      "The same server, seen from the other side: execute_sequence collapses a 20-step workflow into one MCP round-trip, and state.json outlives the Claude Code session.",
    href: "/t/claude-code-mcp-server",
    tag: "MCP deep dive",
  },
  {
    title: "Windows automation in Python with a real visual debugger",
    excerpt:
      "element.highlight() paints a layered Win32 overlay around any control your script touches. The visible cursor of intent that pywinauto never shipped.",
    href: "/t/windows-automation-python",
    tag: "Python SDK",
  },
  {
    title: "Accessibility API desktop automation",
    excerpt:
      "Why Terminator reads UIA/AX trees instead of pixels: faster, cheaper, and resilient to theme changes that break vision models.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Architecture",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What exactly does the typecheck_workflow tool do?",
    a: "It takes a workflow_path argument, checks that the path exists and contains a tsconfig.json, then shells out to the TypeScript compiler with `tsc --noEmit` in that directory. It tries `bun tsc --noEmit` first because bun has a faster cold start; if bun is not on PATH it falls back to `npx tsc --noEmit`; if npx is not on PATH it falls back to a global `tsc`. The implementation is at crates/terminator-mcp-agent/src/tools/typecheck.rs lines 142-204. The tool is registered as an MCP tool in crates/terminator-mcp-agent/src/server.rs at lines 9521-9545 with the description \"Type-check a TypeScript workflow using tsc --noEmit. Returns structured error information including file, line, column, error code, and message for each type error found.\"",
  },
  {
    q: "How are the type errors parsed, and how do I know the parser is accurate?",
    a: "Each line of tsc stdout/stderr is matched against the regex `^(.+?)\\((\\d+),(\\d+)\\):\\s*error\\s+(TS\\d+):\\s*(.+)$` in typecheck.rs line 54. The five capture groups map to file path, 1-indexed line, 1-indexed column, the TS error code, and the message. There are two unit tests in the same file at lines 210-228: `test_parse_tsc_output_single_error` verifies a single TS2345 error parses correctly, and `test_parse_tsc_output_multiple_errors` verifies two errors on two lines both parse. Both are the first things that run on every CI build of the MCP agent.",
  },
  {
    q: "What does the code context attached to each error look like?",
    a: "After the parser produces a list of TypeError structs, enrich_errors_with_context walks each one, reads the corresponding source file, and builds a block of 7 lines: the 3 lines before the failing line, the failing line itself, and the 3 lines after. The failing line is prefixed with the literal string \" -> \" and all other lines with 4 spaces. Each line includes its 1-indexed line number, right-aligned in a 4-character field. The logic is at typecheck.rs lines 90-115. The practical effect is that when the LLM reads the tool response, it sees the broken code in its original shape, not a paraphrase, and can edit the file directly.",
  },
  {
    q: "Does `terminator mcp run` also type-check, or is that only available via MCP?",
    a: "Both. The MCP tool typecheck_workflow exists so agents can call it explicitly. The CLI runs the same check automatically whenever you point `terminator mcp run` at a TypeScript workflow. The detection lives in crates/terminator-cli/src/typescript_workflow.rs `is_typescript_workflow` at lines 7-60: a `.ts` or `.js` file, or a directory containing package.json plus one of terminator.ts, src/terminator.ts, workflow.ts, or index.ts. If detected, `run_type_check` at lines 154-249 runs tsc and, on failure, prints a bordered error block with a literal hint: \"Fix type errors before running the workflow. Or use --skip-type-check to bypass (not recommended).\" You can bypass by passing `--skip-type-check` but the flag description in crates/terminator-cli/src/main.rs line 146 says exactly \"Skip TypeScript type checking before execution (not recommended).\"",
  },
  {
    q: "Which TypeScript entry points does the project scaffold expect?",
    a: "Four accepted locations, in priority order: `terminator.ts` at the project root, then `src/terminator.ts`, then `workflow.ts`, then `index.ts`. The logic is in typescript_workflow.rs at `path_to_file_url` (lines 63-90). `terminator init` scaffolds `src/terminator.ts`, which becomes `file:///absolute/path/src/terminator.ts` as the workflow URL. That URL is what the state persistence layer hashes to derive the per-workflow state directory under `mediar/workflows/<folder>/state.json`.",
  },
  {
    q: "What does the scaffolded project look like?",
    a: "`terminator init my-workflow` creates a directory with package.json (depends on `@mediar-ai/workflow` at latest, devDeps on typescript ^5 and @types/node ^20), a strict tsconfig.json (target ES2020, module commonjs, strict: true, esModuleInterop, rootDir ./src, outDir ./dist), a src/terminator.ts calling `createWorkflow` with a zod input schema and a list of step imports, and two example step files under src/steps/. The package.json's only script is `\"build\": \"tsc --noEmit\"`, which is the exact command the MCP server shells out to when typecheck_workflow runs. The implementation is in crates/terminator-cli/src/commands/init.rs lines 69-120.",
  },
  {
    q: "How is this different from other desktop-automation MCP servers?",
    a: "Most MCP automation servers expose click, type, and screenshot primitives and let the LLM stitch them together inside the context window. If the LLM gets a selector wrong, you find out when the click misfires on a real window. Terminator's MCP server moves validation left: you author the workflow as a strongly-typed TypeScript module, the selectors and step return types are part of the TS signature, and both the MCP surface and the CLI refuse to run until `tsc --noEmit` passes. The LLM gets a structured error payload it can act on directly instead of a generic runtime exception, and the same check runs in CI without any divergence.",
  },
  {
    q: "Does the type check block execute_sequence as well, or only TypeScript workflows?",
    a: "execute_sequence accepts YAML, JSON, and TypeScript workflows. The pre-execution type check only fires for TypeScript projects, because `is_typescript_workflow` in typescript_workflow.rs only returns true when it sees a TS entry file or a package.json + TS-entry combination. A YAML workflow takes the original path through the execute_sequence engine unchanged. If you want type-level safety on a YAML workflow, the documented pattern is to generate the YAML from a TypeScript file using `createWorkflow` and the zod schemas.",
  },
];

const tsErrorQuote =
  "src/steps/02-step-two.ts(18,9): error TS2322: Type 'number' is not assignable to type 'string'.";

export default function TerminatorMcpPage() {
  const articleJsonLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    author: "Matthew Diakonov",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    url: PAGE_URL,
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqJsonLd = faqPageSchema(faqs);

  return (
    <div className="bg-white text-zinc-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([articleJsonLd, breadcrumbJsonLd, faqJsonLd]),
        }}
      />

      <article className="pt-10 pb-24">
        <section className="max-w-4xl mx-auto px-6">
          <Breadcrumbs items={breadcrumbItems} />
        </section>

        <BackgroundGrid className="mt-6" pattern="dots" glow>
          <section className="max-w-4xl mx-auto px-6 pt-10 pb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-medium text-orange-700 mb-6">
              Terminator MCP server
              <span className="text-orange-300">|</span>
              Typed from the first tool call
            </div>

            <h1 className="font-mono text-4xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              The MCP server that compiles your desktop workflow
              <br />
              <GradientText>before it clicks a single pixel.</GradientText>
            </h1>

            <p className="text-lg md:text-xl text-zinc-600 leading-relaxed mb-8 max-w-3xl">
              Every other guide on this stops at{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                claude mcp add terminator
              </code>{" "}
              and a tool list. None of them tell you that the server ships a
              first-class <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">typecheck_workflow</code> tool
              that runs{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">tsc --noEmit</code>{" "}
              against your TypeScript workflow directory and hands the LLM a
              structured list of{" "}
              <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">TS2345</code>{" "}
              errors with five lines of code context around each failing line,
              before any part of your desktop starts moving.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#install"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-zinc-700 border border-zinc-300 hover:bg-zinc-50 transition"
              >
                Jump to the install command
              </a>
            </div>
          </section>
        </BackgroundGrid>

        <section className="max-w-4xl mx-auto px-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Creator of Terminator"
            datePublished={PUBLISHED}
            readingTime="10 min read"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pt-8">
          <ProofBand
            rating={4.9}
            ratingCount="1.2k GitHub stars"
            highlights={[
              "Rust MCP agent in production",
              "Windows UIA + macOS AX + Linux AT-SPI",
              "TypeScript SDK with strict: true",
              "Works under Claude Code, Cursor, and raw stdio",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Terminator MCP"
            subtitle="Compiler-first desktop automation"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "LLM writes a TypeScript workflow",
              "typecheck_workflow runs tsc --noEmit",
              "Structured TS errors feed back into chat",
              "Only compiling workflows reach your desktop",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <MetricsRow
            metrics={[
              {
                value: 15,
                label: "async handlers in server.rs",
                suffix: "",
              },
              {
                value: 5,
                label: "regex capture groups",
                suffix: "",
              },
              {
                value: 7,
                label: "lines of context per error",
                suffix: "",
              },
              {
                value: 3,
                label: "tsc fallbacks (bun → npx → global)",
                suffix: "",
              },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The shape of a typed MCP round-trip
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Every other MCP server treats the LLM as the type checker: you
            write a fuzzy intent, the model picks a tool, the tool runs, and
            you learn it was wrong when something on your screen moves to a
            place you did not intend. Terminator inverts that. The LLM writes
            code. The code is compiled. Only compiling code gets to talk to
            your desktop.
          </p>
          <AnimatedBeam
            title="How one typecheck_workflow call flows end-to-end"
            accentColor="#FF3E00"
            from={[
              { label: "Claude Code", sublabel: "LLM chat" },
              { label: "Cursor", sublabel: "LLM chat" },
              { label: "Raw stdio client", sublabel: "any MCP" },
            ]}
            hub={{
              label: "typecheck_workflow",
              sublabel: "MCP server tool",
            }}
            to={[
              { label: "tsc --noEmit", sublabel: "bun, then npx" },
              { label: "src/**/*.ts", sublabel: "your files" },
              { label: "TypecheckResult", sublabel: "JSON with errors[]" },
            ]}
          />
        </section>

        <section id="install" className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Install the server, then scaffold a typed workflow
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The server and the CLI ship together. One command registers the
            MCP, the next command creates a TypeScript project that is already
            compatible with the compile-before-you-click contract.
          </p>
          <AnimatedCodeBlock
            language="bash"
            filename="install.sh"
            code={installCode}
            typingSpeed={8}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The anchor fact: five capture groups, seven lines of context
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The part of the source that makes this uncopyable is short. It is
            a parser and an enricher. The parser maps a TSC line to a typed
            struct. The enricher pulls three lines above and three lines below
            the failing line so the LLM can see what it broke.
          </p>
          <AnimatedCodeBlock
            language="rust"
            filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
            code={typecheckRegexCode}
            typingSpeed={4}
          />
          <div className="h-6" />
          <AnimatedCodeBlock
            language="rust"
            filename="crates/terminator-mcp-agent/src/tools/typecheck.rs"
            code={contextEnrichmentCode}
            typingSpeed={4}
          />
          <div className="h-6" />
          <ProofBanner
            quote={tsErrorQuote}
            source="parse_tsc_output on a real TS2322"
            metric="TS2322"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            What the LLM actually sees in its tool response
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            After the parser and the enricher finish, the MCP server returns a
            JSON object through{" "}
            <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Content::json(TypecheckResult)
            </code>
            . The response is not a blob of stderr. It is a structured array
            the model can walk, match on{" "}
            <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              code
            </code>
            , and turn into a specific edit against a specific file.
          </p>
          <AnimatedCodeBlock
            language="json"
            filename="typecheck_workflow response"
            code={toolResultShape}
            typingSpeed={3}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The same contract, enforced from the CLI
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            A typed MCP surface that only the LLM respects would be a gimmick.
            The same check runs when you invoke{" "}
            <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              terminator mcp run
            </code>{" "}
            from a shell, so your CI pipeline and your laptop see the exact
            same gate. The session below is a real two-pass run: first attempt
            fails the type check, second attempt passes and executes.
          </p>
          <TerminalOutput
            title="close-month-end ~ two runs, one fixed"
            lines={cliFlow}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard>
            <div className="p-8">
              <p className="text-xs uppercase tracking-widest text-orange-600 font-semibold mb-3">
                The single line worth remembering
              </p>
              <p className="font-mono text-xl md:text-2xl text-zinc-900 leading-relaxed">
                &quot;Fix type errors before running the workflow. Or use
                --skip-type-check to bypass (not recommended).&quot;
              </p>
              <p className="text-sm text-zinc-500 mt-4">
                Literal text from{" "}
                <code>
                  crates/terminator-cli/src/typescript_workflow.rs:247-248
                </code>
                . The CLI prints it to stderr on every failed type check. The
                flag exists, but the help string in{" "}
                <code>main.rs:146</code> names it &quot;not recommended&quot;
                on the tin.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            How authoring actually flows
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Five steps take you from a blank directory to a workflow that a
            Claude Code tab can run against a real QuickBooks window. The
            compile gate sits between steps three and four.
          </p>
          <StepTimeline title="From init to first successful run" steps={authoringSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The server is a compiler host too
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Six things to keep in your head when you think about what this
            server actually exposes to the LLM. Three of them are ordinary MCP
            mechanics. Three of them exist because the authors wanted the LLM
            to fix its own mistakes without help.
          </p>
          <BentoGrid cards={capabilityCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The full sequence, one frame at a time
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            What happens between the LLM calling the tool and the LLM reading
            the result. Notice that step seven,{" "}
            <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              parse_tsc_output + enrich_errors_with_context
            </code>
            , is the only step the tsc binary does not participate in. That
            piece of code is where a blob of stderr turns into something the
            model can fix.
          </p>
          <SequenceDiagram
            title="typecheck_workflow, end to end"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            Versus the untyped default
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The comparison below is not against a specific competitor. It is
            against the shape most desktop-automation MCP servers land on:
            YAML or JSON workflows, validated at runtime, reported as
            exceptions when something goes wrong.
          </p>
          <ComparisonTable
            productName="Terminator MCP"
            competitorName="Typical MCP automation surface"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <Marquee speed={30} pauseOnHover fade>
            {marqueeChips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-2 mx-3 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-sm font-mono whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </Marquee>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
            The payoff, in one number
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The MCP agent crate defines{" "}
            <NumberTicker value={15} /> async tool handlers in{" "}
            <code className="bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            . Exactly one of them exists to stop the other fourteen from ever
            running on code that has not compiled. If you remember one thing
            about this server, let that be it.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed">
            The other fourteen are the obvious ones: window trees,
            click_element, type_into_element, activate, validate, navigate a
            browser, open an application, execute a whole sequence, read,
            write and edit files, copy content, glob, and grep. You can see
            the list in <code>git grep &quot;pub async fn&quot; crates/terminator-mcp-agent/src/server.rs</code>.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            section="terminator-mcp-footer"
            heading="Want to see typecheck_workflow run against your own workflow?"
            description="Bring a TypeScript automation that almost works. We will wire it into a Claude Code tab, run tsc --noEmit through the MCP, and watch the LLM patch its own errors in real time. 20 minutes, live."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection items={faqs} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RelatedPostsGrid
            title="Other angles on the same server"
            subtitle="If this one was useful, these walk through the rest of the surface"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          section="terminator-mcp-sticky"
          description="Book a walkthrough: typecheck_workflow, tsc --noEmit, and the self-repair loop"
        />
      </article>
    </div>
  );
}
