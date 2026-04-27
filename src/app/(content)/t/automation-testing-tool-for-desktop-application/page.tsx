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
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  GlowCard,
  StepTimeline,
  AnimatedChecklist,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/automation-testing-tool-for-desktop-application";
const PUBLISHED = "2026-04-27";
const TITLE =
  "Automation testing tool for desktop application: a transpiler that returns AI-fixable JSON, not stack traces";
const DESCRIPTION =
  "Most desktop test runners hand you a stack trace when a test fails to compile. Terminator hands the failing test back to whatever AI wrote it as a JSON object with error_type, error_line, fix, and a recovery action. Four recovery variants. Fourteen TypeScript-detection regexes. A condition parser that strips smart quotes before evaluating. The pieces of a desktop testing tool designed to be driven by an LLM that may have written the test five seconds ago.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "An AI-fixable error contract for desktop tests: error_type, can_fix, error_line, fix, recovery. Source: transpiler.rs and expression_eval.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop testing tool with AI-fixable errors",
    description:
      "Four RecoveryAction variants. UseJavaScript embeds a literal rewrite instruction. The condition parser strips smart quotes. Built for tests an LLM just wrote.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation testing tool for desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Automation testing tool for desktop application",
    url: PAGE_URL,
  },
];

const recoveryActionSource = `// crates/terminator-mcp-agent/src/transpiler.rs, lines 81-91
// Four recovery variants. Each one tells the caller (an AI agent
// driving this test) what to do on the next attempt without a human
// having to read the failure and decide.

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RecoveryAction {
    /// AI should fix the code based on error message
    FixCode,
    /// AI should rewrite in plain JavaScript (remove TS syntax)
    UseJavaScript,
    /// User needs to install tools
    InstallTool { tool: String, url: String },
    /// Retry may help (transient error)
    Retry,
}`;

const useJavaScriptInstruction = `// crates/terminator-mcp-agent/src/transpiler.rs, lines 184-186
// The UseJavaScript recovery is not a category. It is a literal
// instruction string. The agent on the other side of the pipe gets
// exactly this sentence as part of the error payload.

RecoveryAction::UseJavaScript => json!({
    "action": "use_javascript",
    "instruction": "Rewrite without TypeScript syntax. Remove: type annotations (: string), interfaces, generics (<T>), 'as' casts, enum, namespace."
}),`;

const errorPayload = `// What the MCP client actually receives when a test fails
// to compile. From transpiler.rs::TranspileError::into_mcp_error,
// lines 156-196. The client is an AI coding assistant. The shape
// is what it sees as a tool error, not a stderr blob.

{
  "error_type": "syntax_error",
  "can_fix": true,
  "location": { "line": 5, "column": 10 },
  "error_line": "const x string = 'hello';",
  "fix": "Add ':' between variable name and type: 'const x: string'",
  "recovery": "fix_code"
}`;

const detectorSource = `// crates/terminator-mcp-agent/src/transpiler.rs, lines 230-274
// Fourteen regex patterns. If any match, the file is treated as
// TypeScript and routed to the transpiler. If none match, it runs
// as plain JavaScript with no compile step.
// This is what makes a test work the same whether the LLM
// remembered to write types or not.

pub fn is_typescript_code(script: &str) -> bool {
    let ts_patterns = [
        // Type annotations
        r":\\s*(string|number|boolean|any|void|never|unknown|object)\\s*[;,=\\)\\}]",
        r":\\s*(string|number|boolean|any|void|never|unknown|object)\\s*\\[",
        // Interface declarations
        r"\\binterface\\s+\\w+",
        // Type declarations
        r"\\btype\\s+\\w+\\s*=",
        // Generic type parameters
        r"<\\s*\\w+\\s*(extends|,)",
        r"\\w+<\\w+>",
        // as type assertion
        r"\\bas\\s+(string|number|boolean|any|object|unknown|\\w+)\\b",
        // Non-null assertion
        r"\\w+!\\.",
        // Function parameter types
        r"\\(\\s*\\w+\\s*:\\s*\\w+",
        // Return type annotations
        r"\\)\\s*:\\s*\\w+\\s*(\\{|=>)",
        // readonly modifier
        r"\\breadonly\\s+\\w+",
        // public/private/protected modifiers
        r"\\b(public|private|protected)\\s+\\w+",
        // enum declarations
        r"\\benum\\s+\\w+",
        // namespace declarations
        r"\\bnamespace\\s+\\w+",
        // declare keyword
        r"\\bdeclare\\s+(const|let|var|function|class)",
        // import type
        r"\\bimport\\s+type\\b",
    ];
    // ... iterates and matches
}`;

const smartQuoteSource = `// crates/terminator-mcp-agent/src/expression_eval.rs, lines 6-15
// The condition that gates a step in a desktop test is a string.
// LLMs and chat clients love to mangle that string with smart
// quotes and non-breaking spaces. Before parsing, every expression
// is normalized to ASCII. This is the line that lets a test pasted
// out of a doc still run.

fn normalize_expression(expr: &str) -> String {
    expr
        // Normalize smart quotes to straight quotes
        .replace(['\\u{2018}', '\\u{2019}'], "'") // Smart single quotes
        .replace(['\\u{201C}', '\\u{201D}'], "\\"") // Smart double quotes
        .replace('\`', "'") // Backticks to single quotes
        // Normalize Unicode spaces
        .replace(['\\u{00A0}', '\\u{2009}', '\\u{202F}'], " ") // Various Unicode spaces
        .trim()
        .to_string()
}`;

const failedRunTerminal = [
  { text: "# An AI assistant just wrote a test and asked the agent to run it.", type: "info" as const },
  { text: "# The TypeScript has a syntax error. Watch what comes back.", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "execute_sequence({ script: 'const x string = \\'hello\\';\\nawait desktop.locator(\\'role:Button\\').click();' })", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "[transpiler] Detected TypeScript code, transpiling to JavaScript", type: "output" as const },
  { text: "[transpiler] Using bun for transpilation", type: "output" as const },
  { text: "ERROR script_98421.ts:1:8: error: Expected ',' but found 'string'", type: "error" as const },
  { text: "", type: "output" as const },
  { text: "# Tool error returned to the MCP client. Not a stack trace, a contract.", type: "info" as const },
  { text: "{", type: "success" as const },
  { text: "  \"error_type\": \"syntax_error\",", type: "success" as const },
  { text: "  \"can_fix\": true,", type: "success" as const },
  { text: "  \"location\": { \"line\": 1, \"column\": 8 },", type: "success" as const },
  { text: "  \"error_line\": \"const x string = 'hello';\",", type: "success" as const },
  { text: "  \"fix\": \"Add ':' between variable name and type: 'const x: string'\",", type: "success" as const },
  { text: "  \"recovery\": \"fix_code\"", type: "success" as const },
  { text: "}", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# The AI reads can_fix=true, applies the fix line, retries.", type: "info" as const },
  { text: "execute_sequence({ script: 'const x: string = \\'hello\\';\\nawait desktop.locator(\\'role:Button\\').click();' })", type: "command" as const },
  { text: "[transpiler] Successfully transpiled 87 bytes of TypeScript to 64 bytes of JavaScript", type: "success" as const },
  { text: "Step completed.", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Compile error shape",
    competitor:
      "Plain text stack trace dumped to stderr. The LLM has to parse it back into structure on its own.",
    ours:
      "Structured JSON: error_type, can_fix, location.line, location.column, error_line, fix, recovery. Built by into_mcp_error() in transpiler.rs.",
  },
  {
    feature: "What to do next, if anything",
    competitor:
      "Implicit. The model guesses retry, rewrite, or escalate.",
    ours:
      "Explicit recovery field with four typed values: fix_code, use_javascript, install_tool, retry. RecoveryAction enum, lines 81-91.",
  },
  {
    feature: "Type-aware tests",
    competitor:
      "Either the runner is JavaScript-only (you lose types) or it is TypeScript-only (you lose flexibility).",
    ours:
      "is_typescript_code() runs 14 regex patterns on every script. Plain JS skips transpilation, TS goes through bun or esbuild. The test author can write either, the same call works.",
  },
  {
    feature: "Smart quotes from copy-paste",
    competitor:
      "Condition parsers reject U+2018, U+2019, U+201C, U+201D and fail with a cryptic 'unexpected character' message.",
    ours:
      "expression_eval.rs::normalize_expression replaces all four smart-quote variants and three non-breaking space variants with ASCII before evaluating. The condition runs.",
  },
  {
    feature: "Fallback path when bun is missing",
    competitor:
      "Either an install error or a hard requirement that bun be on PATH.",
    ours:
      "Bun preferred (find_executable checks bundled location first, then PATH), esbuild via npx as the second tier, RecoveryAction::InstallTool with a download URL as the last tier.",
  },
  {
    feature: "Test license",
    competitor:
      "Per-seat or per-runner. Often gated behind a sales call.",
    ours:
      "MIT. transpiler.rs is 950 lines, expression_eval.rs is 458 lines. Fork it.",
  },
];

const sequenceActors = [
  "AI agent",
  "MCP server",
  "Transpiler",
  "Bun runtime",
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
    label: "execute_sequence({ script: '<TypeScript>' })",
    type: "request",
  },
  {
    from: 1,
    to: 2,
    label: "transpile(script, NodeJs) -> is_typescript_code: true",
    type: "event",
  },
  { from: 2, to: 3, label: "bun build script.ts --target node --no-bundle", type: "request" },
  { from: 3, to: 2, label: "stderr: 'script.ts:1:8: error: Expected ...'", type: "error" },
  {
    from: 2,
    to: 1,
    label: "Err(TranspileError { kind: SyntaxError, fix, recovery: FixCode })",
    type: "error",
  },
  {
    from: 1,
    to: 0,
    label: "McpError { error_type, can_fix, location, error_line, fix, recovery }",
    type: "error",
  },
  {
    from: 0,
    to: 1,
    label: "execute_sequence({ script: '<repaired TypeScript>' })",
    type: "request",
  },
  { from: 1, to: 2, label: "transpile(script, NodeJs)", type: "event" },
  { from: 2, to: 3, label: "bun build", type: "request" },
  { from: 3, to: 2, label: "JS output", type: "response" },
  { from: 2, to: 1, label: "Ok(TranspileResult { code, was_typescript: true })", type: "response" },
  { from: 1, to: 0, label: "Step completed.", type: "response" },
];

const beamNodes = {
  from: [
    { label: "AI-written .ts", sublabel: "fresh from the chat" },
    { label: "Pasted YAML", sublabel: "smart quotes inside" },
    { label: "Hand-edited JS", sublabel: "no types at all" },
    { label: "Mixed module", sublabel: "TS + plain JS" },
  ],
  hub: {
    label: "transpile()",
    sublabel: "is_typescript_code + bun + esbuild",
  },
  to: [
    { label: "Ok(TranspileResult)", sublabel: "ready for the runtime" },
    { label: "RecoveryAction::FixCode", sublabel: "with line + fix" },
    { label: "RecoveryAction::UseJavaScript", sublabel: "rewrite instruction" },
    { label: "RecoveryAction::InstallTool", sublabel: "tool + URL" },
  ],
};

const metrics = [
  { value: 4, label: "RecoveryAction variants" },
  { value: 14, label: "TS detection regexes" },
  { value: 7, label: "Unicode chars normalized" },
  { value: 950, label: "Lines in transpiler.rs" },
];

const wiringSteps = [
  {
    title: "The agent submits a script as a tool argument",
    description:
      "execute_sequence accepts a script field on the MCP tool call. The script can be TypeScript, plain JavaScript, or anything in between. The author does not declare which one. The Rust agent decides at the next step.",
  },
  {
    title: "is_typescript_code() runs 14 regex matches",
    description:
      "transpiler.rs lines 230-274. The patterns target type annotations, interface and type aliases, generic parameters, as casts, non-null assertions, parameter and return type annotations, readonly, public/private/protected, enum, namespace, declare, and import type. One match flips the routing flag.",
  },
  {
    title: "Plain JS short-circuits, TypeScript runs through a transpiler",
    description:
      "If the detector returns false, transpile() returns Ok(TranspileResult { code: script, was_typescript: false }) without writing a temp file. If it returns true, the agent picks bun if find_executable('bun') succeeds (with a bundled bun next to the binary as the first probe), otherwise esbuild via npx, otherwise RecoveryAction::InstallTool.",
  },
  {
    title: "On compile failure, parse the output into a TranspileError",
    description:
      "parse_transpilation_error in transpiler.rs uses three pre-compiled regexes (esbuild file:line:col, bun stack frame, TypeScript TS#### codes). It fills line, column, error_line, message, and a fix string when it can derive one. The TranspileErrorKind goes onto the error so the recovery dispatcher knows which path to write.",
  },
  {
    title: "into_mcp_error() emits the structured payload",
    description:
      "The error becomes McpError::invalid_params with the JSON shape the AI agent reads. error_type and can_fix are always present. location, error_line, fix are conditional. recovery is one of fix_code, use_javascript (which embeds an instruction string), install_tool (with tool name and URL), or retry.",
  },
  {
    title: "The agent reads can_fix and either retries or escalates",
    description:
      "When can_fix is true, the typical pattern in Claude Code or Cursor is: read fix, splice into the script around location.line, call execute_sequence again. When can_fix is false (system_error, missing_tool with no fallback), the agent surfaces the message to the human. No stack trace ever appears in the tool result.",
  },
];

const capabilityChecks = [
  {
    text: "Hand the agent a TypeScript test that does not compile and watch it fix itself on the next call without your intervention",
  },
  {
    text: "Mix typed and untyped code in the same test file and have the runtime route it correctly without an explicit flag",
  },
  {
    text: "Accept a step gating expression copied out of a doc with smart quotes intact and still evaluate it",
  },
  {
    text: "Get a structured 'install bun' instruction back when the runtime is missing instead of a confusing PATH error",
  },
  {
    text: "Drop in expression_eval.rs into your own test runner if you want the smart-quote handling without the rest of the stack",
  },
  {
    text: "Trace any failure to a 1- or 2-sentence message plus the offending source line, never a multi-frame stack",
  },
  {
    text: "Run the same script through plain bun locally for human debugging and through the agent for AI-driven runs without a code change",
  },
  {
    text: "Read all 1408 lines of transpiler.rs + expression_eval.rs and prove every claim on this page in under thirty minutes",
  },
];

const faqs = [
  {
    q: "Why does a desktop test runner need an LLM-shaped error contract at all? Tests are written by humans.",
    a: "Some are. The interesting case is the ones that are not. When a developer hands an AI coding assistant the prompt 'write a Terminator test that opens Notepad, types Hello, screenshots the result, and asserts the title contains Hello.txt', the assistant generates a TypeScript file in seconds and submits it to the agent. If that file does not compile, the assistant has two choices: read a stack trace, infer the problem, and retry, or surface the failure to the human. Stack traces are bad for the first option because they are designed for human readers (lots of context, fuzzy framing) and they vary between bun and esbuild and node. Terminator pre-shapes the error so the assistant gets exactly what it needs to retry: error_type, can_fix, location, error_line, fix, recovery. That contract is at transpiler.rs lines 156-196 in into_mcp_error. The point is not that humans can not write tests; the point is that an agent driving this loop is now a normal authoring path, and the tool fits that path natively.",
  },
  {
    q: "What is in the recovery field?",
    a: "Four typed values defined as RecoveryAction at transpiler.rs lines 81-91. fix_code: the AI should rewrite the source based on the message. use_javascript: the AI should remove TypeScript syntax and resubmit, with the literal instruction 'Rewrite without TypeScript syntax. Remove: type annotations (: string), interfaces, generics (<T>), 'as' casts, enum, namespace.' embedded in the JSON at lines 184-186. install_tool: the runtime is missing, the JSON includes a tool name and a download URL, the AI should pause and ask the human. retry: a transient system error, the AI should call again. The dispatch happens once, on the agent side, after parse_transpilation_error categorizes the failure. The client never has to invent its own recovery taxonomy.",
  },
  {
    q: "How does the runner decide whether a script is TypeScript without a flag from the caller?",
    a: "is_typescript_code() at transpiler.rs lines 230-274 walks 14 regex patterns over the script. The patterns hit type annotations on variables, function parameters, and return values; interface, type, and enum declarations; generic parameters (<T> and X<Y>); as casts; non-null assertions; readonly; the public, private, protected modifiers; namespace; declare; and import type. One match returns true and the script is sent to bun or esbuild. Zero matches returns false and the script runs as JavaScript with no transpile step at all. The benefit is that a one-liner script that does desktop.click() does not pay the bun startup tax, and a heavy TypeScript file with interfaces does not have to be hand-flagged. The detector is opportunistic, not strict: a JavaScript file that contains the substring 'as string' inside a comment will be transpiled. That is the cost of avoiding a flag.",
  },
  {
    q: "What does the smart-quote handling actually do, and why does it matter for a desktop testing tool?",
    a: "expression_eval.rs::normalize_expression at lines 6-15 calls .replace() on the input string for U+2018 and U+2019 (left and right single curly quotes), U+201C and U+201D (left and right double curly quotes), backtick (mapped to single quote so an LLM that wraps strings in backticks still parses), and U+00A0, U+2009, U+202F (non-breaking space, thin space, narrow no-break space). It runs before the expression goes into evaluate_internal at line 33. The reason this matters: a step in a Terminator workflow can be gated on a condition like contains(env.locale, 'en-US') or runtime.attempts >= 3. When that string comes from a chat client, a Notion doc, or a copy-paste out of a doc viewer, the quotes are usually curly. Other condition parsers reject the input. This one accepts it. For an AI-authored test the difference is concrete: contains(value, 'sandbox') with curly quotes around 'sandbox' compiles, evaluates, and gates the step.",
  },
  {
    q: "Where does this fit relative to a record-and-playback tool or a no-code IDE?",
    a: "Different layer. A record-and-playback IDE solves authoring: you click around, the tool emits a script. Terminator does not have a recorder shipped with the framework today; it expects either a developer or an AI agent to write the script. The transpiler and condition parser exist because the script can come from anywhere, including a model that may have written it badly. So the comparison is not 'Terminator vs. TestComplete' on UI features; it is 'Terminator vs. anything that wants to be driven by an AI coding assistant', and the relevant feature surface is what the runner returns when something goes wrong. Most desktop testing tools were built before LLM-driven authoring existed. Their error surfaces still assume a human will read them. Terminator's does not.",
  },
  {
    q: "Does any of this matter if I am running tests by hand?",
    a: "Some of it. The fix string in TranspileError is short and actionable for humans too: 'Add : between variable name and type: const x: string'. The error_line gives you the exact source the parser tripped on without scrolling through stack frames. parse_transpilation_error normalizes esbuild and bun output into one shape, so a developer who switches tools does not see different formats. The smart-quote normalization helps anyone copying expressions out of an editor that auto-corrects them. The pieces that matter most for AI-driven runs (RecoveryAction routing, can_fix, the use_javascript instruction string) are not relevant if no agent is reading the tool result. They do not get in the way either.",
  },
  {
    q: "Can I see the error contract for a real failure end to end?",
    a: "Yes. Clone https://github.com/mediar-ai/terminator, install bun, and run cargo test -p terminator-mcp-agent transpiler. The tests at the bottom of transpiler.rs round-trip syntax errors and type errors through parse_transpilation_error and assert the JSON shape. If you want to see it across the wire, attach any MCP client to the agent, call execute_sequence with a deliberately broken TypeScript snippet, and read the structured error in the tool result. Concretely: the script 'const x string = 1;' produces { error_type: 'syntax_error', can_fix: true, location: { line: 1, column: 8 }, error_line: \"const x string = 1;\", recovery: 'fix_code' }. The path from your input to that JSON is two functions: transpile() and TranspileError::into_mcp_error().",
  },
  {
    q: "How does this differ from the existing event_pipe.rs telemetry channel?",
    a: "Different phase of the run. event_pipe.rs handles in-flight telemetry: the test is compiling and executing, and it streams progress and step events to the MCP client. transpiler.rs handles the gate before the test ever runs. If the script does not compile, no step events fire, no pipe is opened. The transpiler error is the result of the tool call. The event pipe is the side channel during the tool call. Both speak structured JSON to the same client; both are designed for an AI consumer; they live at different points in the lifecycle.",
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
                AI-fixable errors
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                TypeScript transpiler
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP agent
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              An automation testing tool for desktop applications,{" "}
              <GradientText>shaped for the model that wrote the test</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Most desktop test runners hand you a stack trace when a test
              fails to compile. Terminator hands the failing test back to
              whatever AI wrote it as a JSON object with{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                error_type
              </code>
              ,{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                error_line
              </code>
              ,{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                fix
              </code>
              , and a{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                recovery
              </code>{" "}
              action. Four recovery variants. Fourteen TypeScript-detection
              regexes. A condition parser that strips smart quotes before
              evaluating. The pieces of a desktop testing tool designed to be
              driven by an LLM that may have written the test five seconds
              ago.
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
            "Compile errors return as JSON with error_type, can_fix, error_line, fix, and recovery",
            "Four typed RecoveryAction variants: FixCode, UseJavaScript, InstallTool, Retry",
            "is_typescript_code() auto-routes plain JS and TypeScript with 14 regex patterns",
            "expression_eval.rs strips four smart-quote variants and three Unicode space variants before parsing",
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="A desktop test fails to compile"
            subtitle="and the AI fixes it without asking"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Tool error returns as JSON, not a stack trace",
              "error_type, can_fix, error_line, fix, recovery",
              "Four typed RecoveryAction variants",
              "The AI reads the fix, splices, retries",
              "No human in the loop on a syntax error",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The shape an AI sees when a test fails
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            When the agent calls{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            with a TypeScript script that does not compile, the tool error
            comes back as a structured payload. Every field is there for a
            reason. The MCP client (Claude Code, Cursor, Windsurf) reads it,
            patches the source line, and re-submits.
          </p>
          <AnimatedCodeBlock
            code={errorPayload}
            language="json"
            filename="tool error returned to MCP client"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Four recovery variants, picked at the agent
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The error message is not the whole contract. The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              recovery
            </code>{" "}
            field tells the AI what to do next. Four variants, each one
            mapped to a different failure shape. The dispatch happens once,
            on the Rust side, after the transpiler categorizes the failure.
            The client never has to invent its own recovery taxonomy.
          </p>
          <AnimatedCodeBlock
            code={recoveryActionSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/transpiler.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The recovery that embeds its own instruction
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Three of the four variants are categories. One of them, when the
            transpiler is missing and the test contains TypeScript-only
            syntax, is a literal sentence. The agent receives this string as
            part of the JSON. There is no ambiguity about what to do.
          </p>
          <AnimatedCodeBlock
            code={useJavaScriptInstruction}
            language="rust"
            filename="crates/terminator-mcp-agent/src/transpiler.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            How the runtime decides if a script is TypeScript
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The author does not flag it. There is no{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              language: ts
            </code>{" "}
            field. Fourteen regex patterns look for TypeScript-only syntax;
            one match flips the routing. A one-line{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              desktop.click()
            </code>{" "}
            short-circuits the transpiler and runs as plain JavaScript. A
            file with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              interface
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              :string
            </code>{" "}
            goes through bun or esbuild. The same call signature handles
            both.
          </p>
          <AnimatedCodeBlock
            code={detectorSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/transpiler.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Watch a failed test repair itself
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            One of the most common LLM mistakes is omitting the colon between
            a variable name and a TypeScript type. Here is what the agent log
            looks like when that happens, and what the AI does next.
          </p>
          <TerminalOutput
            lines={failedRunTerminal}
            title="execute_sequence -> compile error -> structured fix -> success"
          />
        </section>

        <ProofBanner
          quote="When the test fails, the failure is itself the prompt."
          source="transpiler.rs::TranspileError::into_mcp_error"
          metric="4 recovery variants"
        />

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The condition parser strips smart quotes before evaluating
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            A test gates a step on a condition like{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              contains(env.locale, &apos;en-US&apos;)
            </code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              runtime.attempts &gt;= 3
            </code>
            . When that string comes out of a chat client or a doc, the
            quotes are typically U+2018, U+2019, U+201C, U+201D. Most parsers
            reject them. This one normalizes them to ASCII before parsing,
            along with three Unicode space variants. The condition runs.
          </p>
          <AnimatedCodeBlock
            code={smartQuoteSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/expression_eval.rs"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            What flows through the transpiler
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Anything the agent submits as a script. AI-written TypeScript.
            YAML pasted with smart quotes intact. Hand-edited JavaScript with
            no types. A mixed module that starts with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              interface
            </code>{" "}
            and ends with a vanilla call expression. Each input is routed to
            one of four outcomes.
          </p>
          <AnimatedBeam
            from={beamNodes.from}
            hub={beamNodes.hub}
            to={beamNodes.to}
            title="Inputs into transpile(), outcomes the agent receives"
            accentColor="#FF3E00"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The roundtrip the AI sees on every call
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            From the moment the agent submits a script to the moment it gets
            a structured tool result, the path runs through three boundaries:
            MCP server, transpiler, runtime. Errors cross the same boundaries
            in reverse, picking up structure as they go.
          </p>
          <SequenceDiagram
            title="execute_sequence -> compile -> retry"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Six steps the runtime takes for every script
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            None of these are optional, none are configurable from the test.
            They run on every{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            call, in this order.
          </p>
          <StepTimeline steps={wiringSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            How this stacks up against a typical record-and-playback tool
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The relevant axis is not whether a tool can record clicks; every
            tool can. The relevant axis is what the runner returns when
            something goes wrong, because that is what an AI driving the loop
            actually consumes.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical desktop test tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <GlowCard>
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-zinc-800 mb-4">
                Eight things this tool actually lets you do
              </h3>
              <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
                Not feature pills, not capability claims. Concrete behaviors
                you can verify in the source by grepping the file paths
                listed under each one in the FAQ.
              </p>
              <AnimatedChecklist title="" items={capabilityChecks} />
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="See an AI fix its own desktop test in real time"
            description="Twenty minutes with the team, walking through transpiler.rs, the recovery dispatch, and a real failed run repaired without a human in the loop."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection heading="Questions about an AI-shaped desktop test runner" items={faqs} />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Watch a desktop test fail and self-repair on a call."
        />
      </article>
    </div>
  );
}
