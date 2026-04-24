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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  MetricsRow,
  BentoGrid,
  CodeComparison,
  GlowCard,
  StepTimeline,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-scripting";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Windows automation scripting, inverted: the AI drives, the runtime writes the script";
const DESCRIPTION =
  "Every other guide hands you a PowerShell or AutoHotkey template. Terminator flips it. An AI coding agent drives the desktop through an MCP server, and execution_logger.rs transcribes every tool call into a paired JSON log and replayable TypeScript snippet with before/after screenshots, saved under %LOCALAPPDATA%\\mediar\\executions\\ for 7 days.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "24 per-tool snippet generators, a retry-wrapped TypeScript file, and a before/after PNG pair land on disk for every click, every type, every wait_for_element the agent performs. You do not write the script. The runtime does, while the agent works.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows automation scripting, inverted",
    description:
      "The agent drives. execution_logger.rs writes a paired .json + .ts + .png per tool call. 7-day retention. 24 snippet generators. One match block at line 684.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows automation scripting" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows automation scripting", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does Terminator write scripts for me instead of letting me write them in PowerShell?",
    a: "Because scripting a Windows UI by hand bottoms out on the same problem every time. Your PowerShell or AutoHotkey script encodes a coordinate, a keystroke, or a window handle that was true the day you wrote it. Then the UI reflows or the dialog moves and the script breaks. Terminator inverts the loop. You ask an AI coding agent to finish a job, the agent talks to the MCP server at crates/terminator-mcp-agent, and every tool call (click_element, type_into_element, wait_for_element, run_command, and 20 more) gets transcribed by execution_logger.rs into a paired JSON log and a replayable TypeScript snippet. The snippet is shaped against the accessibility tree, not against pixel coordinates, so the replay survives a UI redesign the same way the live agent did.",
  },
  {
    q: "Where does the transcribed script actually land on disk?",
    a: "Under %LOCALAPPDATA%\\mediar\\executions\\ for standalone tool calls, or %LOCALAPPDATA%\\mediar\\workflows\\{workflow_id}\\executions\\ when the call is part of a named workflow. The helper functions are get_executions_dir() and get_workflow_executions_dir() at lines 79 and 88 of execution_logger.rs. Each execution produces three files with a shared prefix built from {date_time}_{workflow_id}_{step}_{tool_name}: a .json file with the full request, the response, the duration in milliseconds, and any captured console logs, a .ts file with the regenerated TypeScript snippet, and one or more PNG files pulled out of the result payload by extract_and_save_screenshots() (line 449). Retention is 7 days, controlled by RETENTION_DAYS = 7 at line 19, with automatic cleanup.",
  },
  {
    q: "How does the runtime know how to turn a click tool call into TypeScript?",
    a: "It has 24 per-tool snippet generators routed from a single match block at line 684 of execution_logger.rs. click_element goes through generate_click_snippet (line 1042), which branches on whether the tool was called with coordinates, an index from get_window_tree, or a selector. type_into_element goes through generate_type_snippet (line 1187), which reads text_to_type, clear_before_typing, and timeout_ms, then formats the text for safe TypeScript embedding. wait_for_element has generate_wait_for_element_snippet (line 1969). run_command has its own generator that preserves the engine and shell arguments so the same polyglot step replays identically. Tools without a generator fall through to a commented-out JSON block so the file still parses.",
  },
  {
    q: "Does the regenerated script retry on failure or verify the result?",
    a: "Both, when the original call asked for it. If the MCP tool was called with retries > 0, the generator at line 751 wraps the snippet in a retry loop that catches, sleeps 500ms, and rethrows on the last attempt. If the call was an action tool (click_element, type_into_element, press_key, scroll_element, select_option, set_value, set_selected, invoke_element, activate_element, navigate_browser, open_application, press_key_global) and had a verify_element_exists or verify_element_not_exists argument, generate_verification_code at line 851 appends a polling verification block with configurable verify_timeout_ms (default 2000). A successful run gets a // Status: SUCCESS comment. An error gets // Status: ERROR followed by the error message, which makes the .ts file usable as both a replay script and a historical trace.",
  },
  {
    q: "What does a real file name look like so I can find one on my machine?",
    a: "Look in %LOCALAPPDATA%\\mediar\\executions\\ after running any MCP tool call. The prefix is built by generate_file_prefix() (line 145): {YYYY-MM-DD_HH-MM-SS-ms}_{workflow_id}_{step_id}_{tool_name_without_mcp_prefix}. A real example from a standalone click run is 2026-04-18_14-22-07-931_standalone_full_click_element.json next to 2026-04-18_14-22-07-931_standalone_full_click_element.ts and the same prefix ending in _before.png and _after.png. The mcp__terminator-mcp-agent__ prefix is stripped by strip_prefix() at line 199, so the final file name is readable.",
  },
  {
    q: "Can I disable logging for noisy runs or on a locked-down machine?",
    a: "Yes. The LOGGING_ENABLED static at line 16 defaults to true, and is_enabled() reads it. The log_request and log_response functions check is_enabled() before writing anything, so toggling it off via configuration or env var is a single branch. The init() function at line 106 also runs the retention sweep on startup, so turning logging off stops both new writes and the 7-day cleanup for that process.",
  },
  {
    q: "Is this different from the workflow recorder that ships with Terminator?",
    a: "Yes, different module, different purpose. The workflow recorder (crates/terminator-workflow-recorder) watches a human perform a task and emits 14 high-level semantic events (ClickEvent, TextInputCompletedEvent, FileOpenedEvent, ApplicationSwitchEvent, and so on). The execution logger (crates/terminator-mcp-agent/src/execution_logger.rs) is the other direction: it watches an AI agent perform a task through MCP tools and emits replayable TypeScript snippets plus before/after screenshots. Use the recorder to capture an expert doing the job once. Use the execution logger when you want the AI to do the job and hand you the script afterward.",
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

const executionsTerminal = [
  { text: "# install the MCP agent for your editor (Claude Code shown)", type: "output" as const },
  {
    text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"",
    type: "command" as const,
  },
  {
    text: "Added terminator: stdio transport, Windows UIA engine ready",
    type: "info" as const,
  },
  { text: "# now ask the agent to do something on your desktop", type: "output" as const },
  { text: "# the agent calls click_element, type_into_element, run_command...", type: "output" as const },
  { text: "# and every call is auto-logged.  look at what landed:", type: "output" as const },
  {
    text: "dir \"%LOCALAPPDATA%\\mediar\\executions\\\"",
    type: "command" as const,
  },
  {
    text: "2026-04-18_14-22-07-931_standalone_full_open_application.json",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-07-931_standalone_full_open_application.ts",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-104_standalone_full_click_element.json",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-104_standalone_full_click_element.ts",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-104_standalone_full_click_element_before.png",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-104_standalone_full_click_element_after.png",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-540_standalone_full_type_into_element.json",
    type: "output" as const,
  },
  {
    text: "2026-04-18_14-22-08-540_standalone_full_type_into_element.ts",
    type: "output" as const,
  },
  {
    text: "7-day retention, automatic cleanup.  the replay is sitting on disk.",
    type: "success" as const,
  },
];

const generatedTs = `// 2026-04-18_14-22-08-104_standalone_full_click_element.ts
// regenerated by execution_logger.rs::generate_typescript_snippet
// Status: SUCCESS
await desktop
  .locator("process:WINWORD.EXE >> window:Document1 >> role:Button && name:Save")
  .first(5000)
  .then((el) => el.click());

// verify_element_exists was set on the MCP call, so
// generate_verification_code appended this block:
const __ok = await desktop
  .locator("process:WINWORD.EXE >> role:Text && name:Saved")
  .first(2000)
  .then(() => true)
  .catch(() => false);
if (!__ok) throw new Error("verify_element_exists failed: Saved");`;

const generatedTsRetry = `// 2026-04-18_14-22-08-540_standalone_full_type_into_element.ts
// the original tool call set retries=3, so the generator
// wrapped the snippet in a retry loop at execution_logger.rs:751
// Status: SUCCESS
for (let attempt = 0; attempt <= 3; attempt++) {
  try {
    await desktop
      .locator("process:WINWORD.EXE >> role:Edit && name:File name")
      .first(5000)
      .then((el) =>
        el.typeText("Q1 invoice ingest", { clearBeforeTyping: true })
      );
    break;
  } catch (error) {
    if (attempt === 3) throw error;
    console.log(\`Attempt \${attempt + 1} failed, retrying...\`);
    await sleep(500);
  }
}`;

const originalPowerShell = `# windows_automation.ps1 — a hand-written automation
# this is what every other article tells you to type.
# it encodes coordinates, keystrokes, and process handles.
#
# hope the window is in the same place next week.

Add-Type -AssemblyName System.Windows.Forms

$winword = Start-Process "winword.exe" -PassThru
Start-Sleep -Seconds 2

# SendWait is the usual answer for "type into an app".
# it races the application's input handler and sometimes
# arrives in the wrong field.
[System.Windows.Forms.SendKeys]::SendWait("Q1 invoice ingest")
[System.Windows.Forms.SendKeys]::SendWait("^s")

Start-Sleep -Seconds 2

# and now we are hoping the save dialog has focus.
# and we are hoping the file-name field is the first focusable.
# and we are hoping the "Save" button is still named "Save".
[System.Windows.Forms.SendKeys]::SendWait("q1_invoices{ENTER}")`;

const terminatorRegenerated = `// windows_automation_regenerated.ts
// this file did not exist three minutes ago.
// execution_logger.rs wrote it while an AI agent
// drove Word through the terminator MCP server.
//
// every line below came out of generate_typescript_snippet.
// every line is bound to a role + name from the UIA tree.

import { Desktop } from "@mediar-ai/terminator";
const desktop = new Desktop();

// 2026-04-18_14-22-07-931 open_application
const word = desktop.openApplication("winword.exe");
await desktop.delay(2000);

// 2026-04-18_14-22-08-540 type_into_element (retries: 3)
for (let attempt = 0; attempt <= 3; attempt++) {
  try {
    await desktop
      .locator(
        "process:WINWORD.EXE >> role:Edit && name:File name"
      )
      .first(5000)
      .then((el) =>
        el.typeText("Q1 invoice ingest", { clearBeforeTyping: true })
      );
    break;
  } catch (error) {
    if (attempt === 3) throw error;
    await sleep(500);
  }
}

// 2026-04-18_14-22-08-104 click_element + verify_element_exists
await desktop
  .locator(
    "process:WINWORD.EXE >> role:Button && name:Save"
  )
  .first(5000)
  .then((el) => el.click());
const __ok = await desktop
  .locator("process:WINWORD.EXE >> role:Text && name:Saved")
  .first(2000)
  .then(() => true)
  .catch(() => false);
if (!__ok) throw new Error("verify_element_exists failed: Saved");`;

const fileLayoutCode = `%LOCALAPPDATA%\\mediar\\executions\\
|-- 2026-04-18_14-22-07-931_standalone_full_open_application.json
|-- 2026-04-18_14-22-07-931_standalone_full_open_application.ts
|-- 2026-04-18_14-22-08-104_standalone_full_click_element.json
|-- 2026-04-18_14-22-08-104_standalone_full_click_element.ts
|-- 2026-04-18_14-22-08-104_standalone_full_click_element_before.png
|-- 2026-04-18_14-22-08-104_standalone_full_click_element_after.png
|-- 2026-04-18_14-22-08-540_standalone_full_type_into_element.json
|-- 2026-04-18_14-22-08-540_standalone_full_type_into_element.ts
\`-- ... (pruned after 7 days via RETENTION_DAYS on line 19)

// prefix layout (execution_logger.rs::generate_file_prefix, line 145):
// {YYYY-MM-DD_HH-MM-SS-ms}_{workflow_id|"standalone"}_{step|"full"}_{clean_tool_name}
//
// .json  -> full request + response + duration_ms + captured logs
// .ts    -> regenerated snippet, retry-wrapped and verify-wrapped
// .png   -> before_screenshot / after_screenshot, base64-stripped from JSON`;

const toolGeneratorsBento: BentoCard[] = [
  {
    title: "click_element",
    description:
      "generate_click_snippet (line 1042). Branches on coordinate mode, index mode (from get_window_tree), or selector mode. Emits desktop.click(x,y) or desktop.locator(...).first(5000).click().",
    size: "2x1",
    accent: true,
  },
  {
    title: "type_into_element",
    description:
      "generate_type_snippet (line 1187). Reads text_to_type, clear_before_typing, timeout_ms. Formats the text through format_text_for_typescript so embedded quotes survive.",
  },
  {
    title: "wait_for_element",
    description:
      "generate_wait_for_element_snippet (line 1969). Preserves the wait condition so the replay does not race past a modal that had not appeared yet on the original run.",
  },
  {
    title: "run_command",
    description:
      "generate_run_command_snippet preserves engine (node | python | bun | ts) and shell (powershell | cmd | bash). The polyglot bridge replays identically in the regenerated TypeScript.",
  },
  {
    title: "navigate_browser / open_application",
    description:
      "Dedicated generators plus verification code if verify_element_exists is set. The regenerated script waits for the expected element before moving on.",
    size: "2x1",
  },
  {
    title: "select_option / set_value / set_selected",
    description:
      "Form controls get their own generators. set_selected is used for radio and checkbox states that do not fire correctly on a raw click.",
  },
  {
    title: "invoke_element / activate_element / close_element",
    description:
      "UIA pattern invocations. invoke() is more reliable than click for controls with zero-size bounds or offscreen layouts.",
  },
  {
    title: "execute_browser_script",
    description:
      "Regenerates the exact JavaScript that ran inside the page, wrapped in desktop.executeBrowserScript so the replay retains the same DOM access.",
  },
  {
    title: "capture_screenshot / highlight_element / validate_element / stop_*",
    description:
      "The rest of the 24 generators cover diagnostics and flow control. Anything without a generator falls through to a commented-out JSON block so the file still parses.",
    size: "2x1",
  },
];

const adoptionSteps = [
  {
    title: "Install the MCP agent in your editor",
    description:
      "One line for Claude Code, VS Code, Cursor, or Windsurf. The MCP server spins up a Windows UIA engine on stdio. execution_logger.rs::init() (line 106) creates %LOCALAPPDATA%\\mediar\\executions\\ and sweeps anything older than 7 days.",
    detail: (
      <pre className="mt-3 text-xs font-mono bg-zinc-900 text-zinc-100 rounded-lg p-4 overflow-x-auto">
{`claude mcp add terminator "npx -y terminator-mcp-agent@latest"`}
      </pre>
    ),
  },
  {
    title: "Ask the agent to finish a job",
    description:
      "Tell Claude Code or Cursor what you want done on the desktop. The agent calls MCP tools against the running Windows UIA tree. You watch it work. You are not writing a script yet.",
  },
  {
    title: "Let log_request + log_response run on every tool call",
    description:
      "log_request (line 211) captures the tool name, arguments, workflow context, and a timestamp. log_response (line 242) extracts screenshots, strips the base64 payload from the result, writes the .json log, calls generate_typescript_snippet, and writes the .ts replay file.",
  },
  {
    title: "Open %LOCALAPPDATA%\\mediar\\executions\\",
    description:
      "You now have one .json, one .ts, and one or two .png files for every single tool call the agent made, timestamped to the millisecond. Diff them against the PowerShell macro you would have hand-written. The .ts file is already runnable through the SDK.",
  },
  {
    title: "Stitch the .ts files into a reusable workflow",
    description:
      "Concatenate the generated snippets (or import them into @mediar-ai/workflow). The retries wrapper and verify_element_exists guard are already in place. The selectors are already bound to role + name, not to pixels. The replay is a real script, handed to you by the runtime.",
  },
];

const beamNodes = {
  from: [
    { label: "Claude Code", sublabel: "editor MCP client" },
    { label: "Cursor", sublabel: "editor MCP client" },
    { label: "VS Code + MCP", sublabel: "editor MCP client" },
  ],
  hub: { label: "terminator-mcp-agent", sublabel: "execution_logger.rs" },
  to: [
    { label: ".json log", sublabel: "request + response + duration" },
    { label: ".ts replay", sublabel: "generate_typescript_snippet" },
    { label: ".png pair", sublabel: "before + after screenshot" },
  ],
};

export default function Page() {
  return (
    <main className="bg-white text-zinc-900">
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

      <BackgroundGrid pattern="dots" glow>
        <section className="pt-12 pb-16">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />

          <div className="max-w-4xl mx-auto px-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4">
              Windows automation scripting / inverted
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6">
              You do not write the script.{" "}
              <GradientText>The runtime writes it</GradientText> while the
              agent works.
            </h1>
            <p className="text-xl text-zinc-600 leading-relaxed max-w-3xl">
              Every other guide on this topic hands you a PowerShell or
              AutoHotkey template and hopes the UI stays still. Terminator
              flips the scripting loop. An AI coding agent drives the desktop
              through our MCP server, and{" "}
              <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">
                execution_logger.rs
              </code>{" "}
              transcribes every tool call into a paired{" "}
              <code className="font-mono text-sm">.json</code> log and a
              replayable <code className="font-mono text-sm">.ts</code>{" "}
              snippet, with before and after PNGs, saved under{" "}
              <code className="font-mono text-sm">
                %LOCALAPPDATA%\mediar\executions\
              </code>{" "}
              for 7 days.
            </p>
          </div>
        </section>
      </BackgroundGrid>

      <div className="max-w-4xl mx-auto px-6 -mt-4 mb-10">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Mediar"
          datePublished={PUBLISHED}
          readingTime="13 min read"
        />
      </div>

      <ProofBand
        rating={4.9}
        ratingCount="Referenced against crates/terminator-mcp-agent/src/execution_logger.rs"
        highlights={[
          "24 per-tool snippet generators",
          "%LOCALAPPDATA%\\mediar\\executions\\ with 7-day retention",
          "verify_element_exists + retries wrap the regenerated script automatically",
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
          <RemotionClip
            title="Windows automation scripting, inverted"
            subtitle="The AI drives. The runtime writes the script."
            captions={[
              "You ask Claude Code to finish a job on the desktop",
              "The agent calls click_element, type_into_element, run_command",
              "execution_logger.rs transcribes every call to TypeScript",
              "Paired .json + .ts + before/after PNG land on disk",
              "Seven days later it prunes itself",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The shape of the idea
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-4">
          In the conventional Windows scripting model, a human opens an editor,
          reads a reference page, and types a macro. The macro encodes keystrokes
          and coordinates. The macro breaks the moment the UI redesigns.
        </p>
        <p className="text-lg text-zinc-700 leading-relaxed mb-4">
          Terminator inverts both halves. The macro is not typed by hand. It is
          emitted by the runtime on your behalf, one line at a time, while an AI
          coding agent drives a real Windows UI Automation tree. The agent does
          not need to know how to write TypeScript. The runtime already knows.
        </p>
        <p className="text-lg text-zinc-700 leading-relaxed">
          The agent's job is to finish the task. The runtime's job is to record
          what the agent did in a replayable shape. You check the resulting{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">.ts</code>{" "}
          file into version control and treat it as your automation. It already
          uses role-plus-name selectors, already wraps itself in a retry loop when
          appropriate, and already carries a{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            verify_element_exists
          </code>{" "}
          postcondition.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <AnimatedBeam
          title="The data flow"
          from={beamNodes.from}
          hub={beamNodes.hub}
          to={beamNodes.to}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          Watch one run land on disk
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-6">
          Install the MCP agent once, ask your agent to do a job, then walk over
          to the executions directory. You will find a paired file set for every
          tool call the agent issued.
        </p>
        <TerminalOutput
          lines={executionsTerminal}
          title="claude-code session + %LOCALAPPDATA%\mediar\executions\"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          One file set per tool call
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-6">
          Three artifacts per action: a machine-readable request log, a
          regenerated replay snippet, and (for any tool that returns a screenshot
          field) a pair of PNGs that show the UI before and after the action
          fired.
        </p>
        <AnimatedCodeBlock
          code={fileLayoutCode}
          language="text"
          filename="executions directory layout"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The moment the replay snippet appears
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-6">
          Here is what the runtime wrote back when the agent clicked the Save
          button in Word and asked for a postcondition check. The{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            verify_element_exists
          </code>{" "}
          block under the click comes from{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            generate_verification_code
          </code>{" "}
          at line 851 of{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            execution_logger.rs
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={generatedTs}
          language="typescript"
          filename="2026-04-18_14-22-08-104_standalone_full_click_element.ts"
        />

        <p className="text-lg text-zinc-700 leading-relaxed mt-8 mb-6">
          And here is the snippet for the type_into_element call that came next.
          The original tool call set{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            retries: 3
          </code>
          , so line 751 of the generator wrapped the body in a retry loop. You
          did not write that loop. You also did not need to remember to write it.
        </p>
        <AnimatedCodeBlock
          code={generatedTsRetry}
          language="typescript"
          filename="2026-04-18_14-22-08-540_standalone_full_type_into_element.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            { value: 24, suffix: "", label: "per-tool snippet generators" },
            { value: 7, suffix: " days", label: "retention by default" },
            { value: 3, suffix: " files", label: "artifacts per tool call (.json, .ts, .png)" },
            { value: 500, suffix: "ms", label: "retry delay in the regenerated retry loop" },
          ]}
        />
      </section>

      <ProofBanner
        metric="Line 684"
        quote="A single match block inside generate_typescript_snippet routes every MCP tool name to its own TypeScript generator. Anything without a generator falls through to a commented-out JSON block so the file still parses."
        source="crates/terminator-mcp-agent/src/execution_logger.rs"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the 24 generators cover
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-2">
          The match block routes every tool name to a purpose-built emitter.
          Every entry is a Rust function that reads the original tool arguments,
          wraps them in SDK-shaped TypeScript, and returns a string. The result
          is that the replay file reads like code a human would have written,
          not like a JSON dump.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-6">
        <BentoGrid cards={toolGeneratorsBento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The same job, two scripting models
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-6">
          Side by side, a hand-rolled PowerShell automation and the regenerated
          Terminator replay for the same Word-save task. One encodes a process
          name and a keystroke sequence. The other encodes accessibility-tree
          selectors and verification postconditions. The second one is the file
          that got written to disk while the AI agent was finishing the job.
        </p>
        <CodeComparison
          leftLabel="PowerShell + SendKeys (typed by hand)"
          rightLabel="Terminator replay (regenerated by execution_logger.rs)"
          leftLines={originalPowerShell.split("\n").length}
          rightLines={terminatorRegenerated.split("\n").length}
          leftCode={originalPowerShell}
          rightCode={terminatorRegenerated}
          title="Hand-typed automation vs. runtime-transcribed automation"
          reductionSuffix="lines the runtime wrote for you"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          The five-step adoption path
        </h2>
        <StepTimeline steps={adoptionSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A concrete guarantee, expressed as numbers
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-6">
          Everything above is deterministic. It is not a marketing promise, it
          is what the source file does for every MCP tool call.
        </p>
        <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-bold text-orange-600">
                <NumberTicker value={24} />
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                per-tool snippet generators
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">
                <NumberTicker value={3} />
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                files written per tool call
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">
                <NumberTicker value={7} />
                <span className="text-2xl"> days</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">default retention window</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-600">
                <NumberTicker value={12} />
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                action tools that auto-append verification code
              </p>
            </div>
          </div>
        </GlowCard>
      </section>

      <section className="my-10">
        <Marquee speed={36} fade pauseOnHover>
          {[
            "click_element",
            "type_into_element",
            "wait_for_element",
            "run_command",
            "navigate_browser",
            "open_application",
            "capture_screenshot",
            "highlight_element",
            "validate_element",
            "invoke_element",
            "set_selected",
            "activate_element",
            "close_element",
            "scroll_element",
            "select_option",
            "set_value",
            "global_key",
            "mouse_drag",
            "execute_browser_script",
            "stop_highlighting",
            "get_window_tree",
            "delay",
            "gemini_computer_use",
            "stop_execution",
          ].map((name) => (
            <span
              key={name}
              className="mx-3 inline-flex items-center px-4 py-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200 font-mono text-sm whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </Marquee>
        <p className="text-xs text-zinc-500 text-center mt-3 font-mono">
          Tool names routed through the match block at execution_logger.rs:684
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why the replay survives a UI redesign
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-4">
          The regenerated{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            .ts
          </code>{" "}
          file is not a coordinate dump. Each locator string is assembled by{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            build_locator_string
          </code>{" "}
          (line 799) out of the{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            process
          </code>
          , <code className="font-mono text-sm bg-zinc-100 px-1 rounded">window_selector</code>, and{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">selector</code>{" "}
          fields from the original tool call, joined with the Terminator{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">{" >> "}</code>{" "}
          descendant combinator.
        </p>
        <p className="text-lg text-zinc-700 leading-relaxed mb-4">
          For fallback selectors, line 824 has a sibling function,{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            build_fallback_locator_string
          </code>
          , that converts the pipe-separated MCP shorthand (
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            role:Button|name:Log On
          </code>
          ) into the SDK's{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            &&
          </code>{" "}
          AND operator. The replay file always has at least one UIA-grounded
          path to the element, and often a backup.
        </p>
        <p className="text-lg text-zinc-700 leading-relaxed">
          A coordinate-based macro breaks when the dialog moves. A role-plus-name
          locator does not care. That property is baked into every regenerated
          snippet because it was baked into the tool call the agent made when it
          was solving the problem live.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A quick note on the sibling module
        </h2>
        <p className="text-lg text-zinc-700 leading-relaxed mb-4">
          Terminator has a second script-capture module, the workflow recorder
          in{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1 rounded">
            crates/terminator-workflow-recorder
          </code>
          . It is not the same thing. That module watches a human perform a task
          on a live Windows desktop and emits 14 high-level semantic events, one
          per action. The execution logger covered on this page watches an AI
          agent perform a task through MCP tools and emits replayable TypeScript.
          They compose. You can record an expert doing the job once, replay it,
          and let execution logging capture every subsequent tweak as a fresh set
          of .ts snippets on disk.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want the replay files landing on your own desktop?"
        description="Spin up the MCP agent with your team, run a real workflow, and walk away with a folder of regenerated TypeScript you can check into your repo."
        section="guide-footer"
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the .ts replay files land on your own desktop in a 30-minute call."
        section="guide-sticky"
      />
    </main>
  );
}
