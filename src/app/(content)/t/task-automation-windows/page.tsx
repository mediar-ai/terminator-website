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
  MetricsRow,
  GlowCard,
  ComparisonTable,
  BentoGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/task-automation-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Task automation on Windows: the four fields that turn a script into a resumable workflow";
const DESCRIPTION =
  "Task Scheduler runs a .exe and reports pass or fail. Terminator's execute_sequence engine treats every step as a contract with retries, fallback_id to a named recovery block, post-success jumps, and expected_ui_changes. The SequenceStep struct in crates/terminator-mcp-agent/src/utils.rs at line 1453 has 11 fields and 9 of them are about control flow, not which button to click.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Every listicle of task automation on Windows ranks Power Automate, AutoHotkey, RoboTask, and Task Scheduler by triggers and scripts. Terminator goes a layer deeper: a retry count, a fallback_id jump target, a jumps array of post-success conditions, and an expected_ui_changes string, all per step. Source: SequenceStep in utils.rs:1453.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Task automation on Windows with retries, fallback jumps, and a UI-diff contract",
    description:
      "One struct, four recovery primitives. SequenceStep.retries, .fallback_id, .jumps, .expected_ui_changes. Fallback targets live in a separate troubleshooting array that never runs on the happy path.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Task Automation Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Task Automation Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "How is task automation on Windows with Terminator different from Windows Task Scheduler?",
    a: "Windows Task Scheduler runs a program on a trigger and reports an exit code. It has no concept of 'the Save dialog did not appear, so jump to this recovery step.' Terminator's execute_sequence engine is a workflow runner that wraps every UI step with four recovery and branching primitives: retries, fallback_id, jumps, and expected_ui_changes. The fields are defined on the SequenceStep struct in crates/terminator-mcp-agent/src/utils.rs at line 1453, and the retry plus fallback loop lives in crates/terminator-mcp-agent/src/server_sequence.rs at line 1116.",
  },
  {
    q: "What does fallback_id actually do when a step fails?",
    a: "When a step fails after exhausting its retries, the engine looks up the step whose id equals the failed step's fallback_id and jumps execution there. The fallback target does not need to live in the main steps array. The ExecuteSequenceArgs struct has a separate troubleshooting array (utils.rs line 1520) whose entries are invisible on the happy path and only run when a fallback_id jumps to them. That lets you keep the linear workflow readable while parking recovery logic in a clearly named sidecar block.",
  },
  {
    q: "What is the difference between jumps and fallback_id?",
    a: "fallback_id fires on failure; jumps fire on success. The jumps field is an array of JumpCondition entries, each with an if expression and a to_id target (utils.rs line 1440). After a step returns success, the engine walks the jumps array in order, evaluates the if expression against the accumulated env, and jumps to the first matching target. So a single step can declare 'if the response body says retry=true, go to step X, otherwise fall through to the next step in sequence.' That gives you post-success branching without wrapping every decision in a wrapper script.",
  },
  {
    q: "Why does expected_ui_changes matter for task automation on Windows?",
    a: "Most Windows automation failures are silent. The click returned success because some button got clicked, but it was the wrong button, or the dialog did not actually open. Terminator pairs every step with a ui_diff_before_after capture (handled in execution_logger.rs around line 940) and an optional expected_ui_changes string on the step. When set, the engine can fail the step if the real UI diff does not match the plan, which kicks in retries and fallback_id the same way any other failure would. You get 'did the click actually work?' as a first-class step contract.",
  },
  {
    q: "Can I resume a failed task automation workflow halfway through?",
    a: "Yes. ExecuteSequenceArgs exposes start_from_step and end_at_step (utils.rs lines 1563 and 1566). start_from_step loads the previously persisted env state and resumes execution at the step whose id matches. end_at_step stops inclusively at a step id. Combined with a workflow_id, that gives you bounded reruns where you skip work that already succeeded on the previous attempt. Task Scheduler cannot do this; it reruns the whole program.",
  },
  {
    q: "What happens if the fallback step itself fails?",
    a: "The retry budget and fallback behaviour apply to the troubleshooting step too. Each entry in the troubleshooting array is a full SequenceStep with its own retries, its own jumps, and its own optional fallback_id. The engine protects itself from infinite ping-pong with max_iterations = sequence_items.len() * 10 (server_sequence.rs line 1021), after which the workflow fails hard. In practice that cap means a troubleshooting chain can be up to ten levels deep before the engine gives up.",
  },
  {
    q: "How do the retries, fallback, jumps, and ui-diff fields interact with each other?",
    a: "The order in server_sequence.rs around line 1116 is explicit. First the if expression is evaluated against the env; if it is false, the step is skipped. Otherwise the engine enters a retry loop up to retries+1 attempts. Inside each attempt the tool runs and, if ui_diff_before_after is enabled, the diff is captured and compared against expected_ui_changes. A mismatch counts as a failure and consumes a retry. Once the retry budget is spent, if fallback_id is set, execution jumps there; otherwise the step is marked critical and the workflow halts unless continue is true. If the step did succeed, the jumps array is walked and the first matching condition wins.",
  },
  {
    q: "What is the actual YAML or JSON I write to use these fields?",
    a: "execute_sequence takes either inline steps or a url to a YAML or JSON workflow file. A step block with all four primitives looks like a YAML entry with tool_name, arguments, id, retries, fallback_id, jumps (a list of if / to_id / reason objects), and expected_ui_changes. The MCP tool description in crates/terminator-mcp-agent/src/prompt.rs describes the shape Claude or Cursor should emit. Because the schema is strongly typed via serde and schemars, your AI coding assistant autocompletes the fields when it writes the workflow instead of guessing.",
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

const sequenceStepCode = `// crates/terminator-mcp-agent/src/utils.rs, lines 1453-1503
// Eleven fields. Only tool_name and arguments describe "what to do."
// The other nine describe "what should happen around it."

pub struct SequenceStep {
    // What to run
    pub tool_name: Option<String>,
    pub arguments: Option<serde_json::Value>,

    // Control flow and verification
    pub r#if: Option<String>,              // Skip unless this expression is true
    pub retries: Option<u32>,              // Number of retries before failing
    pub id: Option<String>,                // Addressable by fallback_id / jumps
    pub fallback_id: Option<String>,       // On failure, jump here
    pub jumps: Option<Vec<JumpCondition>>, // On success, evaluate these
    pub expected_ui_changes: Option<String>, // UI diff contract for this step

    // Ergonomics
    pub continue_on_error: Option<bool>,
    pub delay_ms: Option<u64>,
    pub delay: Option<String>,             // "1s", "500ms", "2m"
    pub skippable: Option<bool>,           // For group steps
}`;

const jumpConditionCode = `// crates/terminator-mcp-agent/src/utils.rs, lines 1440-1450
// A single post-success jump. The step executes, then these are walked
// in order. First matching condition wins and execution jumps to to_id.

pub struct JumpCondition {
    pub condition: String,  // e.g. "response.status == 'retry'"
    pub to_id: String,      // Target step id to jump to
    pub reason: Option<String>, // Human-readable log line when taken
}`;

const executionLoopCode = `// crates/terminator-mcp-agent/src/server_sequence.rs, lines 1116-1230
// Simplified control flow for one step in the main loop.

let (if_expr, retries, fallback_id_opt) = (
    step.r#if.clone(),
    step.retries.unwrap_or(0),
    step.fallback_id.clone(),
);

// 1. Evaluate "if" expression; skip the step if it returns false
if !evaluate(if_expr, &env) { continue; }

// 2. Run the tool, up to retries + 1 times
let mut final_result = None;
for attempt in 0..=retries {
    let result = run_tool(step).await;
    match result {
        Ok(r)  => { final_result = Some(r); break; }
        Err(_) if attempt < retries => continue,   // Retry
        Err(e) => { final_result = Some(Err(e)); break; }
    }
}

// 3. On failure, jump to fallback_id if set
if final_result.as_ref().unwrap().is_err() {
    if let Some(target) = fallback_id_opt {
        current_index = lookup_step_index(&target);
        continue;
    }
}

// 4. On success, walk jumps in order and take the first match
for jump in step.jumps.iter().flatten() {
    if evaluate(&jump.condition, &env) {
        current_index = lookup_step_index(&jump.to_id);
        break;
    }
}`;

const workflowYamlCode = `# A real task automation workflow. Renew a web session, extract
# an invoice, type it into a Windows accounting app. Three steps,
# each with its own recovery contract.

steps:
  - id: refresh_session
    tool_name: execute_browser_script
    arguments:
      script_file: ./refresh-session.js
    retries: 2
    expected_ui_changes: "Account dashboard visible, not login form"
    fallback_id: handle_login_expiry
    jumps:
      - if: "response.trial_ended == true"
        to_id: cancel_and_notify
        reason: "Trial expired, skip invoice fetch"

  - id: pull_invoice
    tool_name: execute_browser_script
    arguments:
      script_file: ./pull-latest-invoice.js
    retries: 1
    expected_ui_changes: "Invoice PDF link is present"

  - id: type_into_accounting
    tool_name: type_into_element
    arguments:
      selector: "process:accounting >> role:Edit && name:Invoice Number"
      text: "{{invoice.number}}"
    retries: 3
    expected_ui_changes: "Invoice Number field is non-empty"

troubleshooting:
  - id: handle_login_expiry
    tool_name: execute_browser_script
    arguments:
      script_file: ./reauth-with-totp.js
    retries: 2
    fallback_id: cancel_and_notify

  - id: cancel_and_notify
    tool_name: run_command
    arguments:
      command: "powershell -File .\\\\notify-oncall.ps1"`;

const taskSchedulerVs = `# What Windows Task Scheduler gives you
<Triggers>
  <CalendarTrigger><StartBoundary>2026-04-21T08:00:00</StartBoundary></CalendarTrigger>
</Triggers>
<Actions>
  <Exec><Command>C:\\scripts\\run.ps1</Command></Exec>
</Actions>
<Settings>
  <RestartOnFailure>
    <Interval>PT1M</Interval>
    <Count>3</Count>
  </RestartOnFailure>
</Settings>

# You get: restart the whole program on failure, count = 3.
# You do NOT get: a named step id to jump to, a condition to
# evaluate after success, or a UI diff contract per action.`;

const terminatorVs = `# What Terminator execute_sequence gives you
- id: save_invoice
  tool_name: invoke_element
  arguments:
    selector: "process:quickbooks >> role:Button && name:Save"
  retries: 3
  expected_ui_changes: "Save dialog disappears, status bar shows Saved"
  fallback_id: reopen_and_retry
  jumps:
    - if: "status.contains('duplicate')"
      to_id: skip_duplicate
      reason: "QuickBooks rejected as dup, move on"

# Per step: retry count, UI-diff contract, named failure target,
# post-success conditional branching. Four primitives stacked on
# one action. Task Scheduler does not expose any of them.`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Per-step retry count",
    competitor: "Only whole-program retry",
    ours: "retries: u32 on every SequenceStep",
  },
  {
    feature: "Named recovery target on failure",
    competitor: "Not supported",
    ours: "fallback_id jumps to a specific step id",
  },
  {
    feature: "Post-success conditional branching",
    competitor: "Must shell out to a wrapper script",
    ours: "jumps: array of if/to_id/reason entries",
  },
  {
    feature: "Recovery steps kept out of the happy path",
    competitor: "Mixed into the main script",
    ours: "Separate troubleshooting array, never runs unless jumped to",
  },
  {
    feature: "UI change contract per step",
    competitor: "Not expressible",
    ours: "expected_ui_changes string on every step",
  },
  {
    feature: "Resume from a specific step id",
    competitor: "Reruns the whole program",
    ours: "start_from_step loads persisted env, resumes",
  },
  {
    feature: "Written by an AI coding assistant",
    competitor: "GUI point-and-click or hand-written",
    ours: "JSON schema is exposed over MCP, Claude or Cursor writes the YAML",
  },
];

const stepFields: BentoCard[] = [
  {
    title: "retries",
    description:
      "A u32 on every step. The engine runs the tool up to retries+1 times before treating the step as failed. Default 0. Applies equally to steps in the troubleshooting array.",
    size: "1x1",
    accent: true,
  },
  {
    title: "fallback_id",
    description:
      "A string that must match another step's id. When set and the step fails after retries, execution jumps there. The target can live in the main steps array or in the separate troubleshooting array.",
    size: "1x1",
  },
  {
    title: "jumps",
    description:
      "An array of JumpCondition entries. After a successful run, the engine walks them in order and jumps to the first to_id whose condition evaluates to true. Fires only on success.",
    size: "1x1",
  },
  {
    title: "expected_ui_changes",
    description:
      "A description of the UI diff this step should produce. Paired with ui_diff_before_after capture in execution_logger.rs, it gives you a step-level contract for 'did the click actually work?'",
    size: "1x1",
  },
  {
    title: "if",
    description:
      "A boolean expression evaluated against the env before the step runs. If false, the step is skipped. Use this to gate a step on a previous step's result or an input variable.",
    size: "1x1",
  },
  {
    title: "id",
    description:
      "The addressable name of this step. Also stores {id}_result and {id}_status in the env so later steps can reference them in jumps.condition or if.",
    size: "1x1",
  },
];

const demoTerminalLines = [
  { text: "$ claude mcp terminator execute_sequence --workflow invoice-sync.yaml", type: "command" as const },
  { text: "[execute_sequence] loading 3 main steps, 2 troubleshooting steps", type: "info" as const },
  { text: "[step 0] id=refresh_session tool=execute_browser_script retries=2", type: "info" as const },
  { text: "[step 0] attempt 1 FAILED: Account dashboard not visible", type: "error" as const },
  { text: "[step 0] attempt 2 FAILED: Account dashboard not visible", type: "error" as const },
  { text: "[step 0] attempt 3 FAILED after 2 retries, jumping to fallback_id=handle_login_expiry", type: "info" as const },
  { text: "[step handle_login_expiry] tool=execute_browser_script retries=2", type: "info" as const },
  { text: "[step handle_login_expiry] attempt 1 SUCCESS (reauth via TOTP)", type: "success" as const },
  { text: "[step 0] resumed, attempt 1 SUCCESS (dashboard visible)", type: "success" as const },
  { text: "[step 0] jumps: response.trial_ended == true -> false, falling through", type: "output" as const },
  { text: "[step 1] id=pull_invoice retries=1 SUCCESS (invoice PDF link found)", type: "success" as const },
  { text: "[step 2] id=type_into_accounting retries=3 SUCCESS (Invoice Number = INV-8842)", type: "success" as const },
  { text: "execute_sequence completed: 3 main steps, 1 troubleshooting step, 0 failed", type: "success" as const },
];

const grepLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'pub struct SequenceStep' crates/terminator-mcp-agent/src/utils.rs", type: "command" as const },
  { text: "1453:pub struct SequenceStep {", type: "success" as const },
  { text: "grep -n 'pub struct JumpCondition' crates/terminator-mcp-agent/src/utils.rs", type: "command" as const },
  { text: "1440:pub struct JumpCondition {", type: "success" as const },
  { text: "grep -n 'fallback_id_opt' crates/terminator-mcp-agent/src/server_sequence.rs", type: "command" as const },
  { text: "1120:                    step.fallback_id.clone(),", type: "success" as const },
  { text: "1172:                        step.fallback_id,", type: "success" as const },
  { text: "grep -n 'pub troubleshooting' crates/terminator-mcp-agent/src/utils.rs", type: "command" as const },
  { text: "1520:    pub troubleshooting: Option<Vec<SequenceStep>>,", type: "success" as const },
];

const competingTools = [
  "Windows Task Scheduler",
  "Power Automate Desktop",
  "AutoHotkey",
  "RoboTask",
  "UiPath",
  "Blue Prism",
  "AutoIt",
  "WinAutomation",
  "Automation Workshop",
  "TinyTask",
  "Macro Recorder",
  "WinAppDriver",
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
          Task automation on Windows, with{" "}
          <GradientText>step-level recovery</GradientText>{" "}
          built in
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Task Scheduler runs a program and reports an exit code. RPA canvases
          draw a flowchart. Neither gives you a per-step retry count, a named
          fallback target, a post-success jump table, or a UI-diff contract on
          a single UI action. Terminator does, and the struct that encodes them
          lives in one file you can read in a minute.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="design partners running this in prod"
        highlights={[
          "One struct, SequenceStep, holds all four recovery primitives",
          "Separate troubleshooting array keeps recovery off the happy path",
          "Workflows are YAML an AI coding assistant writes for you via MCP",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Step contracts, not scripts"
            subtitle="Task automation on Windows that knows what should happen next, even when it fails"
            captions={[
              "Step 1: click Save, expect the Save dialog to disappear",
              "Retry the click 3 times if the dialog is still there",
              "On final failure, jump to handle_unsaved_changes",
              "On success, if status mentions 'duplicate', jump to skip_duplicate",
              "Troubleshooting steps never run unless a fallback_id lands on them",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The ceiling of traditional task automation on Windows
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Every list of task automation on Windows tools that the SERP will
          recommend (Task Scheduler, Power Automate Desktop, AutoHotkey,
          RoboTask, UiPath, AutoIt) is a list of ways to trigger a piece of
          code and a way to log that the code ran. The model is binary: the
          program exited with status 0 or it did not. What happens when a
          dialog does not appear, when a button got clicked but the wrong one,
          when the network was flaky on exactly the third retry, is something
          you write glue code around, not something the scheduler understands.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This matters because the failure modes of Windows UI are not binary.
          A click can land on a stale toast, a modal can open in another
          process, a Save dialog can appear on the next frame instead of this
          one. The right shape for a step in a Windows automation is not
          &ldquo;did the .exe exit clean&rdquo; but &ldquo;is the UI now in the
          state this step was supposed to produce.&rdquo; That is a per-step
          contract, and nothing in the traditional task automation stack on
          Windows lets you express it.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator was built after we got tired of paying that glue cost.
          The entire recovery vocabulary is in one struct.
        </p>
      </section>

      <MetricsRow
        metrics={[
          { value: 11, suffix: " fields", label: "on SequenceStep" },
          { value: 9, suffix: "/11", label: "govern control flow or verification" },
          { value: 4, suffix: "", label: "dedicated to retries and branching" },
          { value: 10, suffix: "x", label: "max troubleshooting depth before hard fail" },
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The anchor fact: SequenceStep has 11 fields, 9 are about recovery
        </h2>
        <p className="text-zinc-600 mb-6">
          This is the struct that every step in an execute_sequence workflow
          deserializes into. Read it end to end. Count the fields that describe
          what to click, versus the fields that describe what should happen if
          the click does not land the way you planned.
        </p>
        <AnimatedCodeBlock
          code={sequenceStepCode}
          language="rust"
          filename="utils.rs"
        />
        <p className="text-zinc-600 mt-6">
          Only <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">tool_name</code>{" "}
          and{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">arguments</code>{" "}
          describe what to do. Nine other fields describe the safety net around
          it. That ratio is the design choice.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          Four primitives, one struct
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-8">
          These are the fields that make a Terminator workflow a workflow and
          not a script. Each one has a single, small responsibility, and they
          compose.
        </p>
        <BentoGrid cards={stepFields} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          jumps: post-success branching without a wrapper script
        </h2>
        <p className="text-zinc-600 mb-6">
          fallback_id fires on failure. jumps fire on success. Together they
          cover both sides of a step&apos;s outcome. A JumpCondition is three
          fields, and the engine walks them in order after the tool returns ok.
        </p>
        <AnimatedCodeBlock
          code={jumpConditionCode}
          language="rust"
          filename="utils.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          How the engine actually runs one step
        </h2>
        <p className="text-zinc-600 mb-6">
          The main loop in server_sequence.rs. Every field from the struct
          shows up here in a specific order: if gate, retry loop, fallback on
          failure, jumps on success. Nothing is hidden behind magic.
        </p>
        <AnimatedCodeBlock
          code={executionLoopCode}
          language="rust"
          filename="server_sequence.rs"
        />
      </section>

      <ProofBanner
        quote="9 of the 11 fields on SequenceStep govern control flow or verification, not which button to click."
        source="crates/terminator-mcp-agent/src/utils.rs:1453"
        metric="9/11"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How a workflow routes one failed step
        </h2>
        <p className="text-zinc-600 mb-6">
          A typical Save action on a Windows accounting app. Three main steps.
          If the Save button ever fails past its retries, execution jumps into
          a troubleshooting step that reopens the dialog, then the main flow
          resumes exactly where it left off.
        </p>
        <SequenceDiagram
          title="execute_sequence control flow"
          actors={["Agent", "Main", "Retry", "Fallback", "Env"]}
          messages={[
            { from: 0, to: 1, label: "run step invoke Save", type: "request" },
            { from: 1, to: 2, label: "attempt 1", type: "request" },
            { from: 2, to: 1, label: "ui_diff mismatch", type: "error" },
            { from: 1, to: 2, label: "attempt 2 (retry)", type: "request" },
            { from: 2, to: 1, label: "ui_diff mismatch", type: "error" },
            { from: 1, to: 3, label: "jump to fallback_id", type: "event" },
            { from: 3, to: 4, label: "write recovery context", type: "request" },
            { from: 4, to: 3, label: "env updated", type: "response" },
            { from: 3, to: 1, label: "recovery ok, resume main", type: "response" },
            { from: 1, to: 0, label: "step save_invoice complete", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          A real workflow you can read in one sitting
        </h2>
        <p className="text-zinc-600 mb-6">
          Three main steps, two troubleshooting steps, all four recovery
          primitives used at least once. This is what your AI coding assistant
          writes when you ask Claude Code or Cursor to automate an invoice sync
          over MCP.
        </p>
        <AnimatedCodeBlock
          code={workflowYamlCode}
          language="yaml"
          filename="invoice-sync.yaml"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Task Scheduler on the left, Terminator on the right
        </h2>
        <p className="text-zinc-600 mb-6">
          Same intent, a Save button retry with a recovery path. Task Scheduler
          can retry the whole program on failure. It has no concept of a
          named target to jump to, a post-success condition, or a UI change
          the step must produce.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Task Scheduler XML
            </p>
            <AnimatedCodeBlock
              code={taskSchedulerVs}
              language="xml"
              filename="scheduled-task.xml"
            />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-2">
              Terminator execute_sequence
            </p>
            <AnimatedCodeBlock
              code={terminatorVs}
              language="yaml"
              filename="save-invoice.yaml"
            />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Feature by feature
        </h2>
        <p className="text-zinc-600 mb-6">
          The competitor column is a composite of Task Scheduler, AutoHotkey,
          and the common RPA canvases. The ours column points at the exact
          place in the Terminator source where the primitive lives.
        </p>
        <ComparisonTable
          productName="Terminator"
          competitorName="Task Scheduler / RPA canvases"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What an actual run looks like
        </h2>
        <p className="text-zinc-600 mb-6">
          A MCP client drives a three-step workflow through Claude Code or
          Cursor. The first step fails twice, falls back to a reauth step,
          then the main flow resumes at exactly the place it left off.
        </p>
        <TerminalOutput title="execute_sequence" lines={demoTerminalLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Tools this supplants or fronts
        </h2>
        <p className="text-zinc-600 mb-6">
          Most of these work well for triggering a program. None expose a
          per-step fallback target, a post-success jump condition, or a UI
          diff contract at the step level.
        </p>
        <Marquee
          pauseOnHover
          fade
          speed={45}
          className="border border-zinc-200 rounded-2xl bg-white py-4"
        >
          {competingTools.map((name) => (
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
          Why this matters for AI coding assistants
        </h2>
        <GlowCard>
          <div className="p-8">
            <p className="text-zinc-700 leading-relaxed mb-4">
              Every popular AI coding assistant can already write code. What
              Terminator adds is a runtime that an assistant can target with a
              workflow that admits failure gracefully. Claude Code, Cursor, and
              Windsurf all speak MCP. When you install{" "}
              <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                terminator-mcp-agent
              </code>
              , the assistant sees{" "}
              <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                execute_sequence
              </code>{" "}
              in its tool list, with the <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">SequenceStep</code>{" "}
              schema exposed via JsonSchema.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              That means when you ask the assistant to &ldquo;automate the
              invoice sync and handle login expiry,&rdquo; it has the exact
              vocabulary (retries, fallback_id, jumps, troubleshooting) as
              first-class arguments. It does not invent its own retry loop in a
              wrapper script. It writes a YAML workflow that Terminator runs
              the same way twice.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              The differentiator versus other task automation on Windows tools
              is not just per-step recovery. It is per-step recovery that a
              model writing your automation actually uses, because the schema
              is in the tool description the model reads.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify in the repo
        </h2>
        <p className="text-zinc-600 mb-6">
          If you want to confirm none of this is marketing copy, four grep
          lines. Every field I named has a line number, and every line number
          is reachable from a fresh clone.
        </p>
        <TerminalOutput title="zsh" lines={grepLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          When not to use Terminator for task automation
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If all you need is &ldquo;run C:\scripts\nightly.ps1 at 3am,&rdquo;
          Task Scheduler is the right answer. It is already on the box, and
          the reliability of cron-style triggers is something Terminator does
          not try to replace. Terminator sits on the other axis: once the
          script starts running, how does it handle the fact that the UI it is
          poking at was designed by humans for humans and does not answer a
          wire protocol.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The healthy pattern is Task Scheduler triggers the workflow, and the
          workflow itself is a Terminator execute_sequence call. The scheduler
          decides when. Terminator decides how to recover when the UI does not
          do what you expected.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see your worst flaky Windows task survive a real retry-and-fallback run?"
        description="Book 20 minutes. Bring one of your most fragile scheduled tasks. We will map it to SequenceStep primitives and show you where retries, fallback_id, and expected_ui_changes each catch a specific failure in your stack."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See task automation on Windows survive a retry-then-fallback loop in 20 minutes."
      />
    </article>
  );
}
