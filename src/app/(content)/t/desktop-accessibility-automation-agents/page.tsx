import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  FlowDiagram,
  TerminalOutput,
  AnimatedChecklist,
  BeforeAfter,
  ProofBanner,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/desktop-accessibility-automation-agents";
const PUBLISHED = "2026-05-08";
const TITLE =
  "Desktop accessibility automation agents: the part nobody documents is that they have to be checkpointed";
const DESCRIPTION =
  "Most articles on desktop accessibility automation agents describe the read path (the tree) and the write path (clicks). Almost nobody documents the survival path: how an agent that crashes at step 14 of 20 resumes from step 14, not step 1. Terminator's MCP execute_sequence writes a state.json after every step that mutates env. Source at crates/terminator-mcp-agent/src/server_sequence.rs lines 50, 193, 216, 261.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A desktop accessibility automation agent reads the OS accessibility tree and acts on it. The boring part is the read and write. The interesting part is what happens when step 14 fails on a 20-step workflow. Terminator persists env to ~/Library/Application Support/mediar/workflows/<folder>/state.json after every step, so start_from_step:'<id>' picks up exactly where the crash was.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop accessibility automation agents, the survival path",
    description:
      "save_workflow_state at server_sequence.rs:216 writes after every env mutation. extract_workflow_folder_from_url at line 50 picks the folder. start_from_step resumes. That is the difference between a script and an agent.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/accessibility-api-desktop-automation" },
  { label: "Desktop accessibility automation agents" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "Accessibility API for desktop automation",
    url: "https://t8r.tech/t/accessibility-api-desktop-automation",
  },
  { name: "Desktop accessibility automation agents", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a desktop accessibility automation agent, in one paragraph?",
    a: "A program that drives desktop apps the way a screen reader reads them: through the OS accessibility tree (UI Automation on Windows, AXUIElement on macOS, AT-SPI2 on Linux) instead of pixels. The agent finds elements by role and name, fires actions through accessibility patterns or synthesised input, and reads state back from the same tree. When a large language model is in the loop, the agent talks to the OS through an MCP server (Terminator's is one) so the model issues structured tool calls instead of OCR'ing screenshots. The model never sees a pixel that is not in the tree, and the OS never sees an action that is not bound to a structural selector.",
  },
  {
    q: "How is this different from a computer use agent that drives the desktop with screenshots and click-by-coordinate?",
    a: "Computer use agents (the Claude computer-use mode, Anthropic's reference loop, Gemini's computer-use API) read pixels and emit click(x,y) plus type(text). They work on any UI but are sensitive to DPI, theme, scroll position, and resolution; the same step is a different click on a different monitor. Accessibility-tree agents read role+name+AutomationId and emit click(role:Button|name:Save). The selector is stable across DPI, scroll, theme, and even most localisation, because the OS is doing the lookup. The trade-off is that surfaces the OS does not classify (game canvases, custom-rendered controls, Office documents at the cell level) are invisible. A real production agent does both, and falls through from the tree to vision when the tree is silent.",
  },
  {
    q: "What does \"checkpointed\" mean for one of these agents and why does it matter?",
    a: "It means the agent writes its working state to disk after every step, so a crash, a network glitch, or a Ctrl-C does not reset the run to step 1. In Terminator's MCP, the meta-tool execute_sequence calls save_workflow_state (server_sequence.rs:216) after a step stores a tool result into env. The state file is at ~/Library/Application Support/mediar/workflows/<folder>/state.json on macOS, %LOCALAPPDATA%\\mediar\\workflows\\<folder>\\state.json on Windows, and ~/.local/share/mediar/workflows/<folder>/state.json on Linux. To resume, you re-run execute_sequence on the same workflow URL with start_from_step:\"<step_id>\" set to the last failed step. load_workflow_state (line 261) reads the file and re-injects env into the execution context before step 1 of the resumed range runs. Most desktop automation frameworks (PyAutoGUI, AutoHotkey, raw UIA, raw AX) have no analogue; they are scripts, not agents.",
  },
  {
    q: "Where exactly does the state file path come from? I cannot tell from a state.json filename which run it belongs to.",
    a: "From the workflow URL. extract_workflow_folder_from_url (server_sequence.rs:50) takes a string like file:///Users/matt/.../workflows/github-demo/src/terminator.ts, normalises slashes, finds the substring /workflows/, and returns the next path component (\"github-demo\"). That folder name becomes the leaf directory under .../mediar/workflows/. The convention is that a workflow lives in its own folder under a workflows/ directory, and the folder name is the workflow's identity. Two workflows in two different folders never collide on state, even with the same step IDs. There is also a workflow_id parameter on execute_sequence kept for backward compatibility, but the URL-based path takes precedence (line 200). If neither is set, no state file is written and the workflow runs unchecked but unrecoverable.",
  },
  {
    q: "What is in the state.json file?",
    a: "A flat JSON object with five keys: last_updated (RFC3339 timestamp), last_step_id (the step that just finished), last_step_index (the 0-based index of that step), workflow_id, workflow_file (basename of the workflow URL), and env (the live environment object the steps read and write). The env object is the one the steps use as both input (variables substituted into selectors and arguments via {{key}}) and output (a step that returns set_env: {key: value} writes back into it). On resume, the loader (line 261) reads the file, takes the env field, and inserts it under \"env\" in the new execution context. From the perspective of the resumed step, nothing else has happened in the world. From the perspective of the OS, the desktop is wherever the user left it.",
  },
  {
    q: "Which steps trigger a save? Every tool call?",
    a: "Only steps whose result is stored into env. In execute_sequence, a step that supplies a step id and returns a tool result (or that uses run_command with a set_env return) writes the result to env at server_sequence.rs:1466 and immediately calls save_workflow_state with the current step index. A read-only step that does not store anything (a get_window_tree without an id, a validate_element with no follow-up env write) does not bump the state file. This is intentional: the state file is the variables that the next step depends on, not a transcript of every tool call. A separate execution_logger captures the full transcript for debugging.",
  },
  {
    q: "How does this change how I write a long agent workflow?",
    a: "Three habits. First, give every step an id, because start_from_step:\"<id>\" is the resume handle. Second, store anything that took non-trivial work to compute (a parsed account number, an OAuth token captured from a browser run_command, a file path the agent just wrote) into env, so it survives. Third, write your steps as idempotent restarts: a click on a Submit button that was already submitted should be safe, or the resumed run will double-submit. With those three, a 20-step Outlook automation that fails on the network round trip at step 14 resumes at step 14 with the env from step 13 intact, instead of replaying steps 1 through 13 against a UI that may already be in a different state. Without those three, you rerun the whole thing every failure.",
  },
  {
    q: "How does Terminator's accessibility-tree path relate to its 38 MCP tools and the seven grounding modes for click_element?",
    a: "Three layers. Layer one is 38 #[tool] declarations in crates/terminator-mcp-agent/src/server.rs (read, click, type, key, drag, scroll, validate, wait, highlight, navigate, screenshot, run_command, execute_sequence, and so on). Layer two is the seven-mode click_element router (Selector, Index over UiTree/Ocr/Omniparser/Gemini/Dom, Coordinates) that lets the agent fall through grounding sources when the AX tree is silent. Layer three is execute_sequence, the meta-tool that wraps the other 37 into a step list with state persistence, jump conditions, fallback IDs, and resumability. A real agent uses all three: tools to read and act, the click router to ground when the tree is incomplete, and execute_sequence to make the run survivable. The page you are reading is about layer three, because that is the one the existing playbooks miss.",
  },
  {
    q: "Why save state to a JSON file on disk instead of an in-memory store or a database?",
    a: "Because the failure modes that matter are crash, hang, and reboot. An in-memory store dies with the process. A database is one more dependency to install and one more place where the credentials must be valid. A JSON file written through tokio::fs::write to an OS-standard data directory (data_local_dir from the dirs crate) survives a kill -9 of the MCP server, a Windows update reboot, and a laptop sleep. If the user wants to inspect the state, they cat the file. If they want to migrate the workflow to another machine, they copy the folder. The cost is no transactions and no concurrent writers; the convention is that one workflow URL maps to one folder, and only one execute_sequence is in flight against that folder at a time. For our customers' agents, that constraint has not bound.",
  },
  {
    q: "Is this Windows-only, like a lot of UIA tooling?",
    a: "No. The state-persistence path uses platform-agnostic Rust (dirs::data_local_dir, tokio::fs, serde_json) and works on Windows, macOS, and Linux. The accessibility-tree backends underneath are platform-specific (UI Automation COM on Windows, AXUIElement on macOS, AT-SPI2 on Linux), but the agent loop is the same. macOS support exists at the core Rust level (the terminator-rs crate); the Node and Python packages currently ship Windows binaries only. Most of our users target Windows because the line-of-business apps that resist browser-side automation are Windows-native, but the cross-platform path is real.",
  },
  {
    q: "How do I install the MCP server and try execute_sequence with a checkpoint?",
    a: "Two commands. claude mcp add terminator 'npx -y terminator-mcp-agent@latest' to register the server with Claude Code (Cursor, VS Code, Windsurf take an equivalent MCP entry). Then in a chat: \"create a workflow file at ~/workflows/notepad-demo/terminator.ts that opens Notepad, types a sentence, then errors on purpose; run it with execute_sequence; show me the state.json that was written; then resume from after the type step.\" The agent will use execute_sequence with the file:// URL, the runtime will write ~/Library/Application Support/mediar/workflows/notepad-demo/state.json (macOS) or %LOCALAPPDATA%\\mediar\\workflows\\notepad-demo\\state.json (Windows) after each successful step, and on the resume call it will load env from that file and start at the step you specified. The full source is at github.com/mediar-ai/terminator.",
  },
];

const flowSteps = [
  {
    label: "execute_sequence(url, steps[])",
    detail: "Agent calls the meta-tool with a workflow URL and an ordered list of steps.",
  },
  {
    label: "extract_workflow_folder_from_url",
    detail: "server_sequence.rs:50 finds /workflows/<folder>/ and returns the folder name.",
  },
  {
    label: "step runs, returns result",
    detail: "Tool dispatched against the OS accessibility tree (UIA on Windows, AX on macOS).",
    icon: "check" as const,
  },
  {
    label: "result stored to env[step.id]",
    detail: "If the step has an id, server_sequence.rs:1466 writes its result into env.",
  },
  {
    label: "save_workflow_state",
    detail: "server_sequence.rs:216 writes state.json with last_step_id, last_step_index, env.",
  },
  {
    label: "crash or stop",
    detail: "Kill -9, reboot, network glitch, agent timeout. The state file is already on disk.",
    icon: "error" as const,
  },
  {
    label: "execute_sequence(url, start_from_step:'X')",
    detail: "Same URL, with start_from_step set. load_workflow_state at line 261 reads env back.",
  },
  {
    label: "step X runs with prior env",
    detail: "From the resumed step's perspective, nothing else has happened.",
    icon: "check" as const,
  },
];

const checklistItems = [
  { text: "Every step has an id (start_from_step needs one to resume)" },
  { text: "Anything expensive to recompute (parsed totals, captured tokens, file paths) is written to env" },
  { text: "Each step is idempotent on rerun (a Submit click that already submitted is safe)" },
  { text: "The workflow lives in its own folder under a workflows/ directory" },
  { text: "Only one execute_sequence is in flight against that folder at a time" },
  { text: "On failure, the resume call passes start_from_step set to the last completed step's id" },
];

const resumeSession = [
  { text: "$ npx -y terminator-mcp-agent@latest --once execute_sequence \\", type: "command" as const },
  { text: "    --url file://$HOME/workflows/outlook-reply/terminator.ts", type: "command" as const },
  { text: "[step 1 ] open_outlook              -> ok",  type: "output" as const },
  { text: "[step 2 ] click_inbox               -> ok",  type: "output" as const },
  { text: "[step 13] parse_account_number      -> ok (env.account = \"AC-771-93\")", type: "output" as const },
  { text: "state saved: ~/Library/Application Support/mediar/workflows/outlook-reply/state.json", type: "info" as const },
  { text: "[step 14] fetch_quote_from_crm      -> ERROR: read ECONNRESET", type: "error" as const },
  { text: "process exited with code 1", type: "error" as const },
  { text: "", type: "output" as const },
  { text: "$ npx -y terminator-mcp-agent@latest --once execute_sequence \\", type: "command" as const },
  { text: "    --url file://$HOME/workflows/outlook-reply/terminator.ts \\", type: "command" as const },
  { text: "    --start_from_step fetch_quote_from_crm", type: "command" as const },
  { text: "loaded env from step 13 (env.account = \"AC-771-93\")", type: "info" as const },
  { text: "[step 14] fetch_quote_from_crm      -> ok",  type: "output" as const },
  { text: "[step 15] paste_quote_into_reply    -> ok",  type: "output" as const },
  { text: "[step 20] send                      -> ok",  type: "success" as const },
  { text: "workflow finished without replaying steps 1-13", type: "success" as const },
];

const stateJsonExample = `{
  "last_updated": "2026-05-08T14:32:11.402Z",
  "last_step_id": "parse_account_number",
  "last_step_index": 12,
  "workflow_id": null,
  "workflow_file": "terminator.ts",
  "env": {
    "account": "AC-771-93",
    "customer": "ACME LTD",
    "inbox_id": "AAMkAD...",
    "subject": "Re: Quote 84211"
  }
}`;

export default function Page() {
  const articleJsonLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqJsonLd = faqPageSchema(faqs);

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-mono font-semibold tracking-tight text-zinc-900 leading-tight">
            Desktop accessibility automation agents: the part nobody documents is that they have to be checkpointed
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Most articles on this topic explain the read path (here is the accessibility tree) and the write path (here is how you click an element). Both are interesting and both are well covered. The piece that almost nobody writes about, and the piece that decides whether a 20-step automation actually finishes against a real desktop, is the survival path: what happens when step 14 of 20 fails because the network blinked, and how the agent picks back up at step 14 instead of step 1.
          </p>
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </header>

        <section className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            A desktop accessibility automation agent is a program that drives desktop apps through the OS accessibility tree (UI Automation on Windows, AXUIElement on macOS, AT-SPI2 on Linux) and exposes that capability to a coding LLM (Claude, Cursor, Windsurf, VS Code) through an MCP server. Production-grade ones share three properties:
          </p>
          <ul className="mt-3 space-y-1.5 text-zinc-900 text-base leading-relaxed list-disc pl-5">
            <li>
              <span className="font-medium">Structural lookup, not pixels.</span> Selectors are{" "}
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">role:Button|name:Save</code>
              {" "}so a click does not break when DPI, theme, or scroll changes.
            </li>
            <li>
              <span className="font-medium">A grounding fallback.</span> The agent can fall through from the AX tree to OCR, Omniparser, vision, or DOM when the tree is silent, through one click_element router.
            </li>
            <li>
              <span className="font-medium">Checkpointed execution.</span> The orchestrator writes an env snapshot to disk after every step that mutates env, so a crashed run resumes at the failed step instead of replaying. In Terminator that is{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server_sequence.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                save_workflow_state at server_sequence.rs:216
              </a>
              .
            </li>
          </ul>
          <p className="mt-3 text-zinc-700 text-sm leading-relaxed">
            This page is a deep dive on property three, because property one and property two are already covered well elsewhere. The state file lives at{" "}
            <code className="text-xs bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">~/Library/Application Support/mediar/workflows/&lt;folder&gt;/state.json</code>
            {" "}on macOS, and at{" "}
            <code className="text-xs bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">%LOCALAPPDATA%\mediar\workflows\&lt;folder&gt;\state.json</code>
            {" "}on Windows.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            The 20-step automation and the network glitch
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Here is the workflow we kept hitting from real customer tickets, anonymised. The agent opens Outlook, finds the latest reply from a named customer, parses an account number out of the body, opens an internal CRM in a browser tab, fetches a quote keyed on that account number, drops the quote into the reply, and sends. Twenty steps end to end, mixed across native UIA (the Outlook compose window, the Send button), browser DOM (the CRM tab), and a run_command shell step (a tiny TypeScript snippet that parses the account number out of free-text email body).
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            Steps 1 through 13 finish in 18 seconds. Step 14 calls the CRM and gets ECONNRESET because a corporate VPN renegotiated. With a stateless agent, the rerun starts at step 1: it reopens Outlook, re-parses the body, re-opens the CRM. Twenty seconds wasted, and worse, the side effects of the first thirteen steps may be dirty (a draft window is already open, an inbox row is already selected). With a checkpointed agent, the rerun starts at step 14 with{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">env.account</code>
            {" "}already populated. One step, then forward.
          </p>
        </section>

        <BeforeAfter
          title="Stateless script vs checkpointed agent on a single failed step"
          before={{
            label: "Stateless desktop script",
            content:
              "A script (PyAutoGUI, AutoHotkey, raw UIA, raw AX, a hand-rolled Python loop) holds its variables in process memory. When step 14 throws, the process dies and so does env. The rerun starts at step 1 against a desktop that already has a half-open Outlook draft and a selected inbox row.",
            highlights: [
              "env lives in RAM, dies with the process",
              "rerun replays steps 1 through 13 against a dirty UI",
              "side effects can compound (double-clicks, stale drafts)",
              "no record on disk of where the run actually got",
            ],
          }}
          after={{
            label: "Checkpointed accessibility agent",
            content:
              "execute_sequence writes ~/Library/Application Support/mediar/workflows/<folder>/state.json after every step that stored a value into env. On rerun with start_from_step set to the failed step, load_workflow_state reads the file, the prior env is re-injected, and the agent resumes at the exact step that failed.",
            highlights: [
              "env snapshot survives kill -9, reboot, sleep",
              "rerun starts at the failed step, env intact",
              "state.json is human-readable for debugging",
              "one workflow URL maps to one state folder",
            ],
          }}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            How the state file gets written, end to end
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The whole loop is in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server_sequence.rs"
              className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
            >
              crates/terminator-mcp-agent/src/server_sequence.rs
            </a>
            . There are four functions that matter and they run in this order on every step that has an id:
          </p>
        </section>

        <FlowDiagram
          title="One step through execute_sequence with state persistence"
          steps={flowSteps}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Where the file goes, and how the folder is picked
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The path is built in{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">get_state_file_path</code>
            {" "}at server_sequence.rs:193. The base directory is whatever{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">dirs::data_local_dir()</code>
            {" "}returns on the platform: %LOCALAPPDATA% on Windows, ~/Library/Application Support on macOS, ~/.local/share on Linux. Under that, the agent appends{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">mediar/workflows/&lt;folder&gt;/state.json</code>
            .
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The interesting part is where the folder name comes from. It is parsed out of the workflow URL by{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">extract_workflow_folder_from_url</code>
            {" "}at line 50. The function strips the file:// prefix, normalises slashes, finds the substring{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">/workflows/</code>
            , and returns the next path component. So the URL{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">file:///Users/matt/code/workflows/outlook-reply/src/terminator.ts</code>
            {" "}maps to the folder{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">outlook-reply</code>
            . The convention is one workflow per folder, and the folder name is the workflow's identity. Two workflows in two folders never collide on state, even if they share step IDs.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            What is in state.json
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed mb-4">
            From a real run of the Outlook workflow above, just after step 13 finished. Five top-level keys: a timestamp, the last step's id and 0-based index, the optional workflow_id and the basename of the workflow file, and the env object the steps read and write.
          </p>
          <pre className="overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-900 font-mono">
            <code>{stateJsonExample}</code>
          </pre>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            On resume, only env is replayed into the new execution context (line 636). The other fields are bookkeeping for the human reading the file. A step that resumes does not see a different last_updated timestamp; it sees its own variables, exactly the way the prior run left them.
          </p>
        </section>

        <ProofBanner
          quote="execute_sequence is the meta-tool that wraps the other 37 MCP tools into a step list with state persistence, jump conditions, fallback IDs, and resumability. Source on GitHub."
          source="github.com/mediar-ai/terminator"
          metric="38 tools"
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            What the resume looks like from a terminal
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed mb-4">
            Real session shape against the Outlook workflow. The first command runs to step 14 and dies. The second command, with start_from_step set to the failed step's id, picks up exactly where the crash was and finishes the remaining seven steps. No replay of steps 1 through 13.
          </p>
          <TerminalOutput
            title="execute_sequence, crash and resume"
            lines={resumeSession}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            What you have to do as the agent author
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed mb-4">
            The runtime gives you the state file for free. There are six conventions on your side that turn the file into actual recoverability instead of a debugging artefact.
          </p>
        </section>

        <AnimatedChecklist
          title="Checklist for a survivable accessibility automation agent"
          items={checklistItems}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Why a JSON file on disk, not a database
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The failure modes that matter for a desktop agent are crash, hang, and reboot. An in-memory store dies with the process. A SQLite or Postgres dependency is one more install and one more place where the credentials must be valid. A JSON file written through{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">tokio::fs::write</code>
            {" "}to{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">dirs::data_local_dir()</code>
            {" "}survives kill -9, a Windows update reboot, and a laptop sleep. If the user wants to inspect the state, they cat the file. If they want to migrate the workflow to another machine, they copy the folder. The cost is no transactions and no concurrent writers; one workflow URL maps to one folder, and only one execute_sequence is in flight against that folder at a time. For our customers' agents, that constraint has not bound.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The file is also not the transcript. A separate{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">execution_logger</code>
            {" "}captures every tool call's full input and output for debugging. state.json captures only the env that the next step depends on, so the file stays small and the resume path stays cheap.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Where this fits in the broader Terminator surface
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            execute_sequence is layer three of three. Layer one is the 38{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">#[tool]</code>
            {" "}declarations in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
              className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
            >
              crates/terminator-mcp-agent/src/server.rs
            </a>
            : the read tools (get_window_tree, validate_element, wait_for_element), the write tools (click_element, type_into_element, press_key, set_value, invoke_element), the inspect tools (highlight_element, stop_highlighting), and the orchestration tools (execute_sequence, run_command). Layer two is the seven-mode click_element router that lets the agent fall through grounding sources (AX tree, AX tree index, OCR, Omniparser, Gemini vision, DOM, raw coordinates) when the AX tree is silent on the surface in front of it. Layer three is the meta-tool that wraps the other 37 into a step list with persistence.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            A hello-world script uses layer one. A robust click router uses layers one and two. An agent that finishes long workflows uses all three. The keyword on the page you are reading collapses all three under one phrase, but the survival path is the one that decides whether a deployed agent actually runs all twenty steps in production, day after day, against UIs that occasionally fail.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Where to read the source
          </h2>
          <ul className="space-y-2 text-zinc-700 text-base leading-relaxed list-disc pl-6">
            <li>
              save / load / get-path:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server_sequence.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                crates/terminator-mcp-agent/src/server_sequence.rs
              </a>
              {" "}lines 50, 193, 216, 261.
            </li>
            <li>
              MCP tool dispatch table:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                crates/terminator-mcp-agent/src/server.rs
              </a>
              .
            </li>
            <li>
              Repo home and install:{" "}
              <a
                href="https://github.com/mediar-ai/terminator"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                github.com/mediar-ai/terminator
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Related guides
          </h2>
          <ul className="space-y-2 text-zinc-700 text-base leading-relaxed list-disc pl-6">
            <li>
              <a
                href="/t/accessibility-api-desktop-automation"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Accessibility API desktop automation: fire Control Patterns, skip the mouse
              </a>
              {" "}— the write path. UIInvokePattern instead of SendInput.
            </li>
            <li>
              <a
                href="/t/accessibility-api-ai-agents"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Accessibility API for AI agents: stop re-reading the whole tree, diff it
              </a>
              {" "}— the read path. Tree diffs cut tree-input tokens by 95% on long runs.
            </li>
            <li>
              <a
                href="/t/accessibility-api-computer-use-agents"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Accessibility API for computer use agents: the seven-mode click_element router
              </a>
              {" "}— the grounding-fallback path when the AX tree is silent.
            </li>
            <li>
              <a
                href="/t/mcp-dev-tools-desktop-accessibility"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                MCP dev tools for desktop accessibility: the inspect/highlight/state loop
              </a>
              {" "}— the developer-tools loop the LLM uses against the tree.
            </li>
          </ul>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building a long-running desktop agent and tired of replays?"
          description="Bring your workflow. We will walk through the step IDs, the env shape, and the resume conventions that make a 20-step run survivable on a real machine."
        />

        <FaqSection items={faqs} />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Pair with us on a checkpointed desktop accessibility agent."
        />
      </div>
    </article>
  );
}
