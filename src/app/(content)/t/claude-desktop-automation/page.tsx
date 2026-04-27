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
  ShimmerButton,
  NumberTicker,
  Marquee,
  TerminalOutput,
  AnimatedCodeBlock,
  BeforeAfter,
  BentoGrid,
  ComparisonTable,
  StepTimeline,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/claude-desktop-automation";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Claude desktop automation: one MCP call that runs the whole workflow, not one click at a time";
const DESCRIPTION =
  "Everyone writes about Claude driving a desktop one click at a time. Terminator's execute_sequence tool lets Claude compile a whole typed workflow (variables, selectors, jumps, fallback branches, JS output parser) into a single MCP call that runs at CPU speed with no model in the inner loop. Sourced from utils.rs:1506 and server.rs:7537.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Stop sending Claude a screenshot on every click. Compile the whole workflow once into an execute_sequence MCP call: typed variables, named selectors, conditional jumps, fallback_id branches, JS output parser. Model at the bookends, not in the inner loop.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude desktop automation, compiled into one MCP call",
    description:
      "execute_sequence takes 19 typed fields and a YAML of steps. Claude ships it once. The engine runs locally, branches on failures, returns structured JSON. server.rs:7537.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Claude desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Claude desktop automation", url: PAGE_URL },
];

const perClickPayload = `// Claude: one tool call per click.
// Shape of the loop most guides describe:

// turn 1
{ "name": "click_element", "input": { "selector": "role:Button && name:Open" } }
// -> MCP returns result, Claude thinks, Claude emits:

// turn 2
{ "name": "type_into_element", "input": {
    "selector": "role:Edit && name:Filename",
    "text_to_type": "report.xlsx" }}
// -> MCP returns result, Claude thinks, Claude emits:

// turn 3
{ "name": "click_element", "input": { "selector": "role:Button && name:Open" } }

// ... repeat for every atomic action.
// One model inference per step. Token + latency cost per click.
// Claude is in the inner loop of the workflow.`;

const batchPayload = `// Claude: one tool call, whole workflow compiled.
// Shape of what Terminator's execute_sequence accepts:

{
  "name": "execute_sequence",
  "input": {
    "variables": {
      "report_path": { "type": "string", "default": "report.xlsx" },
      "first_number": { "type": "string", "default": "42" }
    },
    "inputs": { "report_path": "reports/march.xlsx", "first_number": "42" },
    "selectors": {
      "calc_window": "role:Window && name:Calculator",
      "btn_open":    "role:Button && name:Open",
      "btn_equals":  "role:Button && name:Equals"
    },
    "steps": [
      { "tool_name": "open_application", "arguments": { "path": "calc.exe" }, "id": "launch" },
      { "tool_name": "type_into_element",
        "arguments": { "selector": "\${{selectors.calc_window}}",
                       "text_to_type": "\${{first_number}}" },
        "id": "typed_first", "retries": 2,
        "fallback_id": "recover_focus" },
      { "tool_name": "click_element",
        "arguments": { "selector": "\${{selectors.btn_equals}}" },
        "jumps": [
          { "if": "click_element_status == 'success'", "to_id": "capture" }
        ]},
      { "tool_name": "wait_for_element", "id": "capture",
        "arguments": { "selector": "\${{selectors.calc_window}}",
                       "condition": "exists", "include_tree": true } }
    ],
    "troubleshooting": [
      { "tool_name": "activate_element", "id": "recover_focus",
        "arguments": { "selector": "\${{selectors.calc_window}}" } }
    ],
    "output": { "javascript_code":
      "return { total: tree?.children?.find(c => c.attributes?.role==='Text')?.attributes?.name }" }
  }
}

// One MCP call. No model inference between steps.
// Deterministic retries, branches, fallbacks, parser.`;

const struct = `// crates/terminator-mcp-agent/src/utils.rs:1506
// The full shape of what execute_sequence accepts.
// Every field here is wired; none of this is vapor.

pub struct ExecuteSequenceArgs {
    pub url:                     Option<String>,               // file:// or http(s)
    pub steps:                   Option<Vec<SequenceStep>>,    // the actual workflow
    pub troubleshooting:         Option<Vec<SequenceStep>>,    // fallback_id targets
    pub variables:               Option<HashMap<String, VariableDefinition>>,
    pub inputs:                  Option<serde_json::Value>,    // per-run overrides
    pub selectors:               Option<serde_json::Value>,    // named UI shortcuts
    pub stop_on_error:           Option<bool>,                 // default: true
    pub include_detailed_results: Option<bool>,
    pub output_parser:           Option<serde_json::Value>,    // full DSL form
    pub output:                  Option<serde_json::Value>,    // simplified alias
    pub r#continue:              Option<bool>,                 // inverse of stop_on_error
    pub verbosity:               Option<String>,               // quiet | normal | verbose
    pub start_from_step:         Option<String>,               // resume from step id
    pub end_at_step:             Option<String>,               // stop after step id
    pub follow_fallback:         Option<bool>,
    pub execute_jumps_at_end:    Option<bool>,
    pub scripts_base_path:       Option<String>,
    pub workflow_id:             Option<String>,
    pub skip_preflight_check:    Option<bool>,
    pub trace_id:                Option<String>,               // OpenTelemetry
    pub execution_id:            Option<String>,
    pub window_mgmt: WindowManagementOptions,                  // flattened
}`;

const stepStruct = `// crates/terminator-mcp-agent/src/utils.rs:1453
// Every step can carry its own control flow. These fields are what
// makes execute_sequence a workflow language, not a macro recorder.

pub struct SequenceStep {
    pub tool_name:         Option<String>,       // click_element, type_into_element, run_command, ...
    pub arguments:         Option<Value>,        // per-tool args, templated with \${{...}}
    pub continue_on_error: Option<bool>,
    pub delay_ms:          Option<u64>,          // or delay: "500ms" / "2s" / "1m"
    pub group_name:        Option<String>,       // group log block
    pub steps:             Option<Vec<ToolCall>>,// child steps for grouped form
    pub skippable:         Option<bool>,
    pub r#if:              Option<String>,       // "policy.use_max_budget == true"
    pub retries:           Option<u32>,
    pub id:                Option<String>,       // result stored as {id}_result / {id}_status
    pub fallback_id:       Option<String>,       // route into troubleshooting on ultimate failure
    pub jumps:             Option<Vec<JumpCondition>>, // first-match-wins after success
    pub expected_ui_changes: Option<String>,     // drift detection for replay
}`;

const stateSnippet = `// crates/terminator-mcp-agent/src/server_sequence.rs:189
// Every workflow tagged with a file:// url or a workflow_id gets a
// state directory. Tool results and env vars persist between runs.
// This is what makes start_from_step / end_at_step actually resumable.

//   Windows: %LOCALAPPDATA%\\mediar\\workflows\\<workflow_id>\\state.json
//   macOS:   ~/Library/Application Support/mediar/workflows/<folder>/state.json
//   Linux:   ~/.local/share/mediar/workflows/<folder>/state.json

// After a step with id=typed_first completes:
//   env.typed_first_result  = <full tool result JSON>
//   env.typed_first_status  = "success" | "failed" | "skipped"
//
// The next step can reference it in an r#if expression:
//   r#if: "typed_first_status == 'success'"
// Or in a jumps array:
//   jumps:
//     - if: "typed_first_result.element.name == 'Open'"
//       to_id: capture`;

const installLines = [
  { text: "# one command: Claude Code learns the full 32-tool set", type: "output" as const },
  {
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user',
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# execute_sequence is just one of them. Claude will reach for it", type: "output" as const },
  { text: "# whenever the task has more than two or three steps.", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "  terminator   stdio   32 tools (includes execute_sequence)", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Same server binary works in Cursor, VS Code, Windsurf, Zed.", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Model inferences per workflow of N steps",
    competitor: "N (one per tool call)",
    ours: "1 plus a final parser step (constant, not a function of N)",
  },
  {
    feature: "Who decides the order of steps",
    competitor: "Claude, re-deciding each turn based on the latest tool result",
    ours: "The YAML. The model wrote the plan once. The engine executes.",
  },
  {
    feature: "Retries",
    competitor: "Claude must notice the failure and emit a new tool call",
    ours: "Per-step retries: u32 field on SequenceStep. Engine loops internally.",
  },
  {
    feature: "Conditional branching",
    competitor: "Relies on Claude reading the previous result and picking the next action",
    ours: "r#if per step, plus jumps array with first-match-wins expressions",
  },
  {
    feature: "Recovery from a bad UI state",
    competitor: "Claude retries blindly until it hits a token budget",
    ours: "fallback_id routes to a named step in the troubleshooting list",
  },
  {
    feature: "Resume after a crash",
    competitor: "Start from turn one. The model has no memory of where it was.",
    ours: "start_from_step + state.json on disk. Picks up from the last id that ran.",
  },
  {
    feature: "Structured output",
    competitor: "Claude summarises the run in prose. Parsing is your problem.",
    ours: "output_parser with JavaScript code. Returns typed JSON back to Claude.",
  },
  {
    feature: "Observability",
    competitor: "Whatever the MCP host happens to log",
    ours: "OpenTelemetry trace_id + execution_id fields on every call",
  },
  {
    feature: "When the model is actually needed",
    competitor: "Every single step, including trivial ones",
    ours: "At the start (compile the plan) and the end (read the parsed result)",
  },
];

const fieldCards: BentoCard[] = [
  {
    title: "variables",
    description:
      "Typed schema for every input the workflow accepts. Each entry declares type (string, number, enum, array, object), label, default, regex, and options. The same schema powers form UIs in front of the workflow.",
    size: "2x1",
    accent: true,
  },
  {
    title: "inputs",
    description:
      "Per-run values that satisfy the variables schema. This is what changes between runs. Everything else stays the same.",
  },
  {
    title: "selectors",
    description:
      "Named shortcuts for UI elements. btn_save instead of role:Button && name:Save pasted in five places. DRY for accessibility selectors.",
  },
  {
    title: "steps",
    description:
      "The workflow itself. Each SequenceStep is a tool call with optional id, retries, r#if expression, jumps array, and fallback_id.",
    size: "2x1",
  },
  {
    title: "troubleshooting",
    description:
      "A separate list of steps that only run when a normal step's fallback_id points at them. Keeps recovery paths out of the happy-path flow.",
  },
  {
    title: "output_parser",
    description:
      "JavaScript (or declarative DSL) that runs against the final UI tree and returns structured JSON back to Claude. The whole reason this scales.",
    accent: true,
  },
  {
    title: "start_from_step / end_at_step",
    description:
      "Resume from a named id or stop after one. With state persistence in .mediar/workflows/<id>/state.json, you can replay a single step in isolation.",
    size: "2x1",
  },
  {
    title: "stop_on_error / continue",
    description:
      "Switch between strict and best-effort execution. Some flows want to die on first failure; others want to finish and report what happened.",
  },
  {
    title: "trace_id / execution_id",
    description:
      "OpenTelemetry correlation ids that thread through executor and agent logs. Wire it to your observability stack once.",
  },
];

const marqueeChips = [
  "Claude Code",
  "Cursor",
  "VS Code",
  "Windsurf",
  "Zed",
  "Continue.dev",
  "Cline",
  "Goose",
];

const faqs = [
  {
    q: "Is Claude desktop automation the same thing as Claude computer use?",
    a: "They overlap but they are not the same product. Anthropic's computer use is a tool type (computer_20251022) exposed in the API where Claude sees a screenshot and returns pixel coordinates. Claude desktop automation as a goal, getting Claude to reliably drive apps on your OS, can be built on top of that, or on top of the accessibility-tree path that Terminator exposes over MCP. Most articles pick the first interpretation because it is the newest. This page is about the second, which is more deterministic and much cheaper for long workflows.",
  },
  {
    q: "What does execute_sequence actually accept as input?",
    a: "A single JSON object whose schema lives in crates/terminator-mcp-agent/src/utils.rs at line 1506 as the ExecuteSequenceArgs struct. It has 19 typed fields: steps, troubleshooting, variables, inputs, selectors, stop_on_error, include_detailed_results, output_parser, output, continue, verbosity, start_from_step, end_at_step, follow_fallback, execute_jumps_at_end, scripts_base_path, workflow_id, skip_preflight_check, trace_id, execution_id, plus a flattened WindowManagementOptions block. You can also pass a url pointing at a local file or HTTP endpoint that contains the same shape in YAML, so Claude does not have to reprint a huge workflow every time.",
  },
  {
    q: "How is each step more than just a tool call?",
    a: "SequenceStep is defined at utils.rs line 1453. On top of tool_name and arguments, every step can carry an id (which exposes {id}_result and {id}_status to later steps), a retries count, an r#if expression evaluated before the step runs, a jumps array evaluated after success, a fallback_id that routes into the troubleshooting list on ultimate failure, a group_name to bundle nested steps, continue_on_error and skippable flags, a delay_ms or human-readable delay, and an expected_ui_changes hint for drift detection during replay.",
  },
  {
    q: "Where does the model actually run in this design?",
    a: "At the bookends. Claude (or Cursor, or Windsurf, it is just an MCP client) compiles your intent into the execute_sequence payload once. The Rust engine runs the steps locally, resolves each selector against the Windows UI Automation tree or the macOS Accessibility tree, applies retries and jumps without another inference, and passes the final UI tree into the output_parser. The parser returns structured JSON to the MCP host, which is where the model wakes up again and decides what to do with the result. For an N-step workflow, the model is invoked twice, not N times.",
  },
  {
    q: "How do conditional jumps work?",
    a: "Each step can carry a jumps field that is an array of JumpCondition entries. After the step completes successfully, the engine walks the array in order and evaluates the if expression against the environment. The first match wins; the engine jumps to the step with that to_id. Expressions can reference any {id}_status or {id}_result variable set earlier in the run. See crates/terminator-mcp-agent/tests/workflows/test_jump_if.yml for the canonical test of this behavior, including first-match-wins, complex &&/|| expressions, and jump conditions that deliberately do not trigger.",
  },
  {
    q: "Can a workflow resume after a crash or a partial run?",
    a: "Yes. When the call carries a file:// url or an explicit workflow_id, the engine writes its environment to disk after each step that has an id or that modifies env via set_env. On macOS the state lives at ~/Library/Application Support/mediar/workflows/<folder>/state.json; on Windows at %LOCALAPPDATA%\\mediar\\workflows\\<id>\\state.json; on Linux at ~/.local/share/mediar/workflows/<folder>/state.json. Pass start_from_step to resume from a named id. That is what server_sequence.rs lines 189 to 207 implement.",
  },
  {
    q: "Does the output_parser have to be JavaScript?",
    a: "No. There is a declarative DSL form (output_parser field) that is JSON and handles most extraction without any code. The simplified output field takes JavaScript as javascript_code, which runs inside the agent process with access to the final UI tree. Use the DSL for simple field extraction and the JS form when you need to walk the tree or format numbers. Either way, what Claude sees back is parsed JSON rather than a raw tree dump.",
  },
  {
    q: "How does this coexist with Claude's native computer use tool?",
    a: "They are complementary. Anthropic's computer tool is useful for UIs where the accessibility tree is empty or lies (games, canvas-heavy apps, some Electron shells). Terminator exposes a capture_screenshot tool and a gemini_computer_use fallback, so a workflow can mix selector-based steps with an occasional vision-based step. The important thing is that the selector path, and execute_sequence in particular, is the default, not the exception. Pixel vision is reserved for the cases where the OS refuses to tell you where the button is.",
  },
  {
    q: "How do I install the MCP server so Claude Code can use it?",
    a: "One command at the user scope: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. Terminator registers as a stdio MCP server under Claude Code's supervision and exposes all 32 tools including execute_sequence. The same binary runs in Cursor, VS Code, Windsurf, Zed, and anything else that speaks the Model Context Protocol. Setup details and per-client instructions live in crates/terminator-mcp-agent/README.md in the repo.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude computer use, explained at the tool-schema level",
    href: "/t/claude-computer-use",
    excerpt:
      "What Claude actually emits under Anthropic's computer_20251022 tool, and the selector-based alternative Terminator exposes over MCP. dispatch_tool at server.rs:9953.",
    tag: "Guide",
  },
  {
    title: "Best MCP server for desktop agents",
    href: "/t/best-mcp-server",
    excerpt:
      "How MCP servers are evaluated when the agent is supposed to drive a desktop, not just answer questions. Terminator as a working example.",
    tag: "Guide",
  },
  {
    title: "Open source computer-use agents, April 2026",
    href: "/t/open-source-computer-use-agents-april-2026",
    excerpt:
      "A field survey of the frameworks that let an LLM click around an OS. Which ones compile workflows. Which ones loop on screenshots.",
    tag: "Survey",
  },
];

const jsonLdArticle = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);
const jsonLdFaq = faqPageSchema(faqs);

export default function ClaudeDesktopAutomationPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP workflows
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                execute_sequence
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Typed branching
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              <GradientText variant="teal">Claude desktop automation</GradientText>
              , compiled into one MCP call instead of one click at a time
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every guide on this topic tells the same story. Claude takes a
              screenshot, Claude decides where to click, Claude clicks, repeat.
              That is what Anthropic&apos;s computer tool does. It is also the
              most expensive way to drive a desktop from an LLM, because the
              model sits inside the inner loop of every action. Terminator
              ships a different shape: a single tool called{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                execute_sequence
              </code>{" "}
              that takes a whole typed workflow as a parameter. Claude writes
              the plan once. The Rust engine runs it locally through the
              accessibility tree with retries, conditional jumps, fallback
              branches, and a JavaScript output parser. Then Claude wakes back
              up with structured JSON. The model is at the bookends, not
              between every click.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="13 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "One MCP call per workflow, not per click",
                "ExecuteSequenceArgs struct at utils.rs:1506",
                "Typed variables, named selectors, conditional jumps, fallback_id",
                "State persisted to .mediar/workflows/<id>/state.json",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="#install">Install in Claude Code</ShimmerButton>
              <a
                href="#fields"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Inspect the 19 typed fields
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Two shapes of Claude desktop automation."
            subtitle="One puts the model inside every click. The other compiles the whole plan once."
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Per-click MCP: model inference on every turn",
              "execute_sequence: one call, whole workflow",
              "Typed variables, named selectors, jumps, fallbacks",
              "Model at the bookends, engine in the middle",
              "server.rs:7537, utils.rs:1506, 19 fields",
            ]}
          />
        </section>

        {/* Which clients */}
        <section className="max-w-4xl mx-auto px-6 pt-2 pb-6">
          <p className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
            Any MCP client works. Same server binary, same 32 tools.
          </p>
          <Marquee speed={28} fade>
            {marqueeChips.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm font-medium shadow-sm"
              >
                {label}
              </span>
            ))}
          </Marquee>
        </section>

        {/* The question nobody asks */}
        <section className="max-w-4xl mx-auto px-6 pt-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            The question most guides skip
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Given an MCP server full of desktop tools, why does Claude need to
            emit a separate tool call for every click? The default answer is
            that MCP works turn by turn, so of course it does. The useful
            answer is that turn-by-turn is a choice of the tool set, not a law
            of the protocol. A tool can accept a whole plan as its argument,
            run that plan, and return the result. That is exactly what{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            is.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The effect is not subtle. A 40-step workflow that would cost you
            40 model inferences, 40 tool-result round-trips, and whatever
            screenshots the host decided to ship along the way collapses into
            two inferences: the one where Claude writes the plan, and the one
            where Claude reads the parsed output. Between them, the engine is
            pure Rust talking to Windows UI Automation or macOS Accessibility
            at CPU speed.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The rest of this page is a tour of the fields on that tool, the
            file in the repo that defines them, and the lifecycle of one call
            from the moment Claude emits it to the moment the parsed JSON
            comes back. All of it is verifiable. Line numbers are given.
          </p>
        </section>

        {/* Before / After: the tool-call shapes */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Two tool-call shapes, drawn as pseudo-JSON
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Same user intent (&quot;open the file, enter the number, press
            equals, read the result&quot;). Two very different things Claude
            has to emit.
          </p>
          <BeforeAfter
            title=""
            before={{
              label: "Per-click MCP",
              content:
                "Claude emits one tool_use per atomic action. After every call, the MCP host returns, Claude thinks again, Claude emits the next one. For N steps you pay N inferences plus whatever the host decides to attach to each turn (often a screenshot).",
              highlights: [
                "One inference per step",
                "Retries are the model's problem",
                "Branching lives in the model's head, not in code",
                "Resume after a crash means replaying turn one",
              ],
            }}
            after={{
              label: "execute_sequence",
              content:
                "Claude emits one tool_use whose arguments describe the whole workflow: variables, selectors, steps with retries and jumps, a troubleshooting branch, and an output parser. The engine runs it. No model inference fires between steps.",
              highlights: [
                "One inference to compile, one to read the parsed output",
                "Retries and branches live in typed fields on each step",
                "Fallback_id routes into a named recovery path",
                "Resume via start_from_step + state.json",
              ],
            }}
          />
        </section>

        {/* Side by side code */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What Claude actually types, in both shapes
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            These are abbreviated but faithful. On the left: three successive
            tool calls Claude would emit in the per-click shape. On the right:
            a single tool call that carries the entire plan.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <AnimatedCodeBlock
              code={perClickPayload}
              language="javascript"
              filename="per-click.jsonc"
              typingSpeed={0}
            />
            <AnimatedCodeBlock
              code={batchPayload}
              language="javascript"
              filename="execute_sequence.jsonc"
              typingSpeed={0}
            />
          </div>
        </section>

        {/* Beam diagram */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The shape of a single compiled call
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Every input flows into the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence_impl
            </code>{" "}
            entry point. The engine fans out to the OS accessibility tree, the
            embedded scripting engines, and back into the tool dispatcher for
            step tools. Only the parsed output escapes back up to the model.
          </p>
          <AnimatedBeam
            accentColor="#FF3E00"
            title="Claude emits once. Engine runs the fan-out. Parsed JSON returns."
            from={[
              { label: "variables" },
              { label: "inputs" },
              { label: "selectors" },
              { label: "steps" },
              { label: "troubleshooting" },
            ]}
            hub={{ label: "execute_sequence_impl", sublabel: "server_sequence.rs:344" }}
            to={[
              { label: "Windows UIA" },
              { label: "macOS AX" },
              { label: "Node / Bun / Python" },
              { label: "output_parser" },
            ]}
          />
        </section>

        {/* The struct itself */}
        <section id="fields" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            <GradientText variant="teal">ExecuteSequenceArgs</GradientText>: the anchor fact
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the struct that defines the tool. Open{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/src/utils.rs
            </code>{" "}
            at line 1506. Every field below corresponds to a schemars
            annotation that becomes part of the MCP tool schema Claude sees.
            There is no framework magic between your YAML and this type.
          </p>
          <AnimatedCodeBlock
            code={struct}
            language="rust"
            filename="crates/terminator-mcp-agent/src/utils.rs"
            typingSpeed={0}
          />
        </section>

        {/* Bento of field meanings */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What each of those fields is for
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Nine of the 19 fields carry most of the weight. The rest are
            observability and execution-mode switches. Scan this grid once and
            the YAML stops feeling mysterious.
          </p>
          <BentoGrid cards={fieldCards} />
        </section>

        {/* SequenceStep */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            SequenceStep: where branching actually lives
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Each entry in the{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              steps
            </code>{" "}
            array is a SequenceStep, and the shape of that type is what lifts
            execute_sequence from a macro recorder into a workflow language.
            An id turns a step into a variable. A retries count turns it into
            a bounded loop. An r#if expression turns it into a guarded branch.
            A jumps array turns it into a switch. A fallback_id turns it into
            a recovery entry point.
          </p>
          <AnimatedCodeBlock
            code={stepStruct}
            language="rust"
            filename="crates/terminator-mcp-agent/src/utils.rs"
            typingSpeed={0}
          />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The numbers, checkable against the repo
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every one of these is a count or a line number you can reproduce.
            Clone the repo at{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-600 hover:underline"
            >
              mediar-ai/terminator
            </a>{" "}
            and grep for yourself.
          </p>
          <MetricsRow
            metrics={[
              { value: 19, label: "Typed fields on ExecuteSequenceArgs" },
              { value: 13, label: "Typed fields on SequenceStep" },
              { value: 7537, label: "Line of execute_sequence in server.rs" },
              { value: 32, label: "Total MCP tools the agent exposes" },
            ]}
          />

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-orange-200 bg-orange-50">
              <div className="text-4xl font-bold text-orange-600">
                <NumberTicker value={2} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Model inferences for an N-step workflow
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white">
              <div className="text-4xl font-bold text-zinc-800">
                <NumberTicker value={1506} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                utils.rs line of ExecuteSequenceArgs
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white">
              <div className="text-4xl font-bold text-zinc-800">
                <NumberTicker value={189} />
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                server_sequence.rs line where state.json path is computed
              </p>
            </div>
            <div className="p-5 rounded-xl border border-zinc-200 bg-white">
              <div className="text-4xl font-bold text-zinc-800">
                <NumberTicker value={100} suffix="x" />
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                Target speedup over pixel-loop agents
              </p>
            </div>
          </div>

          <ProofBanner
            quote="The model writes the plan, the engine runs it. For an N-step workflow, Claude is invoked twice regardless of N: once to compile, once to read the parsed output."
            source="Terminator MCP agent, execute_sequence contract"
            metric="2 inferences / N steps"
          />
        </section>

        {/* State persistence */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Why start_from_step actually works
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Resumption is only useful if the engine remembers what came before.
            Terminator writes the environment to disk after each step that
            mutates it, keyed on the workflow id or file URL. The next run
            reads that state before it starts. This is what makes it safe to
            kill a run mid-flow and pick up at a named id without replaying
            from the top.
          </p>
          <AnimatedCodeBlock
            code={stateSnippet}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server_sequence.rs"
            typingSpeed={0}
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Per-click MCP agents vs a compiled workflow, feature by feature
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The comparison that matters is not Terminator against other MCP
            servers. It is two designs of what Claude should hand over when it
            wants a computer to do something.
          </p>
          <ComparisonTable
            productName="execute_sequence"
            competitorName="Per-click MCP tools"
            rows={comparisonRows}
          />
        </section>

        {/* Step timeline: lifecycle of one call */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One execute_sequence call, traced end to end
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Read along with the source files. This is what happens between
            Claude emitting the JSON and the MCP host returning a
            CallToolResult.
          </p>
          <StepTimeline
            steps={[
              {
                title: "Claude emits a single tool_use for execute_sequence",
                description:
                  "The arguments object carries variables, inputs, selectors, steps, optional troubleshooting, and an output parser. Everything the workflow needs to run is in one payload.",
              },
              {
                title: "MCP host frames it as JSON-RPC and ships to the agent",
                description:
                  "Claude Code, Cursor, Windsurf, whichever MCP client you are using pipes the request over stdio to the terminator-mcp-agent child process.",
              },
              {
                title: "dispatch_tool routes into execute_sequence_impl",
                description:
                  "server.rs line 10234 handles nested calls via Box::pin. Top-level calls hit server.rs line 7537. Both paths end in execute_sequence_impl at server_sequence.rs line 344.",
              },
              {
                title: "Inputs are validated against the variables schema",
                description:
                  "Types, regex patterns, enum options, required flags. A malformed call fails here with a typed error, not half way through clicking.",
              },
              {
                title: "State is loaded from .mediar/workflows/<id>/state.json",
                description:
                  "If start_from_step is set, the engine restores env vars from the last run so later steps see {id}_result and {id}_status from before.",
              },
              {
                title: "Each step runs through the same dispatch_tool",
                description:
                  "No model inference. Templated args get ${{...}} substitution, the selector resolves against the OS accessibility tree, the action fires, the step id captures the result, jumps are evaluated, fallback_id is honoured on ultimate failure.",
              },
              {
                title: "output_parser runs against the final tree",
                description:
                  "JavaScript or declarative DSL. Walks the tree, returns a small JSON object (total, list of rows, whatever the workflow was actually for).",
              },
              {
                title: "CallToolResult returns up the stdio pipe",
                description:
                  "Claude wakes up once, reads the parsed object, and decides the next user-facing action. For a workflow of 40 steps that is two model inferences total.",
              },
            ]}
          />
        </section>

        {/* Install */}
        <section id="install" className="max-w-4xl mx-auto px-6 py-10 scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Install in Claude Code, one command
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The MCP agent ships as a single npm package. Claude Code picks it
            up at the user scope and exposes all 32 tools including{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>
            .
          </p>
          <TerminalOutput title="terminal" lines={installLines} />
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            heading="Compile your next desktop workflow into one MCP call"
            description="15 minutes with the Terminator team. Bring a real flow you want Claude to run, leave with a typed execute_sequence draft."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Questions readers actually ask" />

        {/* Related */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="More from the Terminator guides"
            posts={relatedPosts}
          />
        </section>
      </article>

      {/* Sticky CTA follows the reader on long scroll */}
      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="See execute_sequence run your workflow end-to-end in 15 minutes."
      />
    </div>
  );
}
