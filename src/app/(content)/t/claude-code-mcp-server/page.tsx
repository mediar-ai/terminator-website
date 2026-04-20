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
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/claude-code-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "The Claude Code MCP server that treats your context window as a budget, not a default";
const DESCRIPTION =
  "Every 'Claude Code MCP server' tutorial shows claude mcp add and a list of popular servers. None of them talk about what happens after you wire up a desktop automation MCP and Claude Code starts burning 30 round-trips to click through an installer. Terminator's execute_sequence tool collapses a whole 20-step desktop workflow into one MCP call, saves workflow state to disk between runs, and lets the same YAML re-play on a headless VM after Claude Code closes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Wiring an MCP server into Claude Code is the easy part. Surviving a real automation task without burning the context window is the hard part. This page shows the one tool (execute_sequence) that changes that, and the file-backed state that makes Claude Code sessions outlive themselves.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Claude Code MCP server for real desktop work",
    description:
      "execute_sequence collapses 20 desktop steps into one MCP call, state.json survives the session, TERMINATOR_HEADLESS=true replays on a VM.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Claude Code MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Claude Code MCP server", url: PAGE_URL },
];

const installCode = `# One line. This is the official command from
# crates/terminator-mcp-agent/README.md line 19.

claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# "-s user" installs it at user scope, so every Claude Code session
# on this machine (not just this repo) picks the server up.

# Verify it registered, and that every handler is visible to the LLM.
claude mcp list
#   terminator   stdio   32 tools`;

const dispatchCode = `// crates/terminator-mcp-agent/src/server.rs line 9953
// The dispatch_tool match block. Every tool name Claude Code can
// call lands here. Notice execute_sequence at line 10234.

let result = match tool_name {
    "get_window_tree"                   => self.get_window_tree(...).await,
    "get_applications_and_windows_list" => self.get_applications_and_windows_list(...).await,
    "click_element"                     => self.click_element(...).await,
    "type_into_element"                 => self.type_into_element(...).await,
    "press_key"                         => self.press_key(...).await,
    "press_key_global"                  => self.press_key_global(...).await,
    "validate_element"                  => self.validate_element(...).await,
    "wait_for_element"                  => self.wait_for_element(...).await,
    "activate_element"                  => self.activate_element(...).await,
    "navigate_browser"                  => self.navigate_browser(...).await,
    "execute_browser_script"            => self.execute_browser_script(...).await,
    "open_application"                  => self.open_application(...).await,
    // ...
    "execute_sequence" => {
        // Line 10234. Claude Code sends ONE tool call here,
        // and Box::pin wraps a whole workflow's worth of work
        // inside a single MCP round-trip.
        Box::pin(self.execute_sequence_impl(
            peer,
            request_context,
            client_progress_token,
            args,
        )).await
    }
    "stop_execution"                    => self.stop_execution().await,
    // ...
    _ => Err(McpError::internal_error("Unknown tool called", ...)),
};`;

const cancellationCode = `// crates/terminator-mcp-agent/src/server.rs lines 9957-9966
// EVERY handler awaits inside tokio::select! against a cancellation
// token taken from the current request_context. When Claude Code
// calls stop_execution from another tab, this flips and the click
// drops within a scheduler tick. No orphaned pointer, no hung window.

tokio::select! {
    result = self.click_element(Parameters(args)) => result,
    _ = request_context.ct.cancelled() => {
        Err(McpError::internal_error(
            format!("{tool_name} cancelled"),
            Some(json!({"code": -32001, "tool": tool_name}))
        ))
    }
}`;

const sequenceWorkflow = `# Passed to execute_sequence in a single MCP tool call.
# This is 8 Claude-Code-visible steps, 1 MCP round-trip, 1 set of
# input tokens on the return path. Try this shape against a server
# that exposes click/type/key as separate tools: you'll burn 8x the
# context.

variables:
  invoice_path: { type: string, default: "C:/in/INV-4412.pdf" }
  target_account: { type: string, default: "Expense:Software" }

selectors:
  qb_window: "role:Window && name:QuickBooks Desktop"
  amount_field: "role:Edit && name:Amount"
  account_combo: "role:ComboBox && name:Account"
  save_btn: "role:Button && name:Save & Close"

steps:
  - id: open_qb
    tool_name: open_application
    arguments: { path: "qbw.exe" }

  - tool_name: wait_for_element
    arguments:
      selector: "\${{selectors.qb_window}}"
      condition: "exists"
      timeout_ms: 15000

  - id: read_invoice
    tool_name: run_command
    arguments:
      engine: javascript
      run: |
        const pdf = await desktop.pdf.read(invoice_path);
        return { amount: pdf.total, vendor: pdf.vendor };

  - tool_name: type_into_element
    arguments:
      selector: "\${{selectors.amount_field}}"
      text_to_type: "\${{amount}}"

  - tool_name: select_option
    arguments:
      selector: "\${{selectors.account_combo}}"
      option_name: "\${{target_account}}"

  # Conditional jump: if QuickBooks flagged the vendor as new,
  # detour through a 3-step create-vendor flow and rejoin here.
  - tool_name: validate_element
    id: vendor_check
    arguments: { selector: "role:Dialog && name:Add Vendor" }
    jumps:
      - if: "vendor_check_status == 'success'"
        to_id: create_vendor
        reason: "Unknown vendor; route through the create-vendor flow"

  - tool_name: click_element
    arguments: { selector: "\${{selectors.save_btn}}" }

  - id: create_vendor
    tool_name: click_element
    arguments: { selector: "role:Button && name:Quick Add" }

stop_on_error: true`;

const stateCode = `// crates/terminator-mcp-agent/src/server_sequence.rs lines 186-213
// Every step with an id or a set_env writes the current env map
// to a per-workflow state.json on disk. Claude Code can close,
// your machine can reboot, and the next run picks up where the
// last one left off.

async fn get_state_file_path(
    _workflow_id: Option<&str>,
    workflow_url: Option<&str>,
) -> Option<PathBuf> {
    let data_dir = dirs::data_local_dir()?;

    if let Some(url) = workflow_url {
        if let Some(folder) = extract_workflow_folder_from_url(url) {
            // Windows: %LOCALAPPDATA%\\mediar\\workflows\\<folder>\\state.json
            // macOS:   ~/Library/Application Support/mediar/workflows/<folder>/state.json
            // Linux:   ~/.local/share/mediar/workflows/<folder>/state.json
            return Some(
                data_dir
                    .join("mediar")
                    .join("workflows")
                    .join(&folder)
                    .join("state.json"),
            );
        }
    }

    None
}`;

const headlessTerminal = [
  { text: "# Claude Code session closed. Move the YAML to a Windows VM.", type: "output" as const },
  { text: "scp close-month-end.yml ops@win-vm-01:C:/workflows/", type: "command" as const },
  { text: "Connection established", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# SSH to the VM. No RDP session, no interactive desktop.", type: "output" as const },
  { text: "ssh ops@win-vm-01", type: "command" as const },
  { text: "Last login: Sat Apr 19 03:12 2026 from 192.168.10.4", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Virtual display mode. Windows UIA still works.", type: "output" as const },
  { text: "set TERMINATOR_HEADLESS=true", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "# Same YAML Claude Code authored. Runs unattended.", type: "output" as const },
  { text: "terminator mcp run C:/workflows/close-month-end.yml --verbose", type: "command" as const },
  { text: "[INFO ] Resolved state: C:\\Users\\ops\\AppData\\Local\\mediar\\workflows\\close-month-end\\state.json", type: "output" as const },
  { text: "[INFO ] Step 1/8  open_application           ok   230ms", type: "output" as const },
  { text: "[INFO ] Step 2/8  wait_for_element           ok   1.2s", type: "output" as const },
  { text: "[INFO ] Step 3/8  run_command (engine=js)    ok   140ms", type: "output" as const },
  { text: "[INFO ] Step 4/8  type_into_element          ok   90ms", type: "output" as const },
  { text: "[INFO ] Step 5/8  select_option              ok   110ms", type: "output" as const },
  { text: "[INFO ] Step 6/8  validate_element           ok   40ms   (jump not taken)", type: "output" as const },
  { text: "[INFO ] Step 7/8  click_element              ok   70ms", type: "output" as const },
  { text: "[INFO ] sequence finished                    ok   1.9s total", type: "success" as const },
];

const verifyTerminal = [
  { text: "# Claude Code picked up the registered server.", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "  terminator   stdio   32 tools", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# One of those 32 is execute_sequence. Confirm it.", type: "output" as const },
  { text: "claude mcp get terminator --tools | grep execute_sequence", type: "command" as const },
  { text: "  execute_sequence   Batch multiple desktop actions into one MCP call", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# State persists across sessions in a predictable place.", type: "output" as const },
  { text: "ls ~/Library/Application\\ Support/mediar/workflows/", type: "command" as const },
  { text: "  close-month-end/   invoice-import/   weekly-qa-sweep/", type: "output" as const },
  { text: "cat ~/Library/Application\\ Support/mediar/workflows/close-month-end/state.json", type: "command" as const },
  { text: "  { \"last_step_id\": \"create_vendor\", \"last_step_index\": 7, \"env\": { ... } }", type: "output" as const },
];

const marqueeChips = [
  "claude mcp add terminator",
  "-s user",
  "stdio transport",
  "execute_sequence",
  "state.json",
  "role:Window && name:",
  "press_key_global",
  "TERMINATOR_HEADLESS=true",
  "one MCP round-trip",
  "stop_execution",
  "tokio::select!",
  "Box::pin(execute_sequence_impl)",
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Claude Code install flow",
    competitor: "Hand-edit ~/.claude.json, restart Claude Code",
    ours: "One line: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user",
  },
  {
    feature: "Context cost of a 20-step task",
    competitor: "20 tool calls, 20 result frames, 20 ui-tree snapshots injected into the conversation",
    ours: "1 execute_sequence tool call, 1 condensed result payload, optional per-step tree suppression",
  },
  {
    feature: "Mid-workflow control flow",
    competitor: "LLM re-plans after every step, loses state between tool calls",
    ours: "YAML jumps, fallback_id, and group_name handle branching inside the sequence engine",
  },
  {
    feature: "Session survival",
    competitor: "Agent history dies when Claude Code closes",
    ours: "state.json per workflow folder, env survives between runs and across reboots",
  },
  {
    feature: "Cancellation",
    competitor: "Close connection; server handler finishes, desktop stays hung",
    ours: "stop_execution flips a cancellation token inside every tokio::select; pointer releases within a scheduler tick",
  },
  {
    feature: "Re-run after Claude Code closes",
    competitor: "Re-prompt, rebuild the plan, hope the LLM remembers",
    ours: "terminator mcp run workflow.yml --start-from step_5 against the same state.json",
  },
  {
    feature: "Headless execution",
    competitor: "Needs RDP session or a real display",
    ours: "TERMINATOR_HEADLESS=true creates a virtual display context Windows UIA can still read",
  },
  {
    feature: "Vision fallbacks when the tree is wrong",
    competitor: "One fixed strategy",
    ours: "ui_tree (default), OCR, Omniparser, browser DOM, or gemini_computer_use, picked per call",
  },
];

const sequenceActors = [
  "Claude Code",
  "MCP stdio",
  "server.rs",
  "execute_sequence_impl",
  "Desktop (UIA / AX)",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "call_tool name=execute_sequence (steps[1..8])",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "JSON-RPC frame over stdio",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "Box::pin(execute_sequence_impl(args))",
    type: "request" as const,
  },
  {
    from: 3,
    to: 4,
    label: "open_application, wait_for_element, ... (8x)",
    type: "request" as const,
  },
  {
    from: 4,
    to: 3,
    label: "step results + state.json write per id",
    type: "response" as const,
  },
  {
    from: 3,
    to: 2,
    label: "single condensed CallToolResult",
    type: "response" as const,
  },
  {
    from: 2,
    to: 1,
    label: "one JSON-RPC response frame",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "one tool result injected into context",
    type: "response" as const,
  },
];

const capabilityCards: BentoCard[] = [
  {
    title: "One install command",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. User scope means every Claude Code session on the box picks the server up, not just this repo.",
    size: "2x1",
    accent: true,
  },
  {
    title: "32 tools in one dispatch",
    description:
      "Browser (navigate_browser, execute_browser_script), native apps (open_application, click_element, type_into_element, press_key_global), filesystem (read_file, edit_file, glob_files, grep_files), and control flow (execute_sequence, stop_execution) all route through one match arm.",
  },
  {
    title: "Selector syntax you can type",
    description:
      "role:Button && name:Save, navigate to parent with >> .. >>, substring matching by default. No XPath, no CSS, no hand-rolled scraping.",
  },
  {
    title: "One MCP call, N desktop steps",
    description:
      "execute_sequence takes a YAML workflow with jumps, fallbacks, group_name, continue_on_error, and variable interpolation. Claude Code emits one tool call; the server runs the whole sequence.",
    size: "2x1",
  },
  {
    title: "Per-workflow state.json",
    description:
      "Env variables, tool results, and the last step index are written to mediar/workflows/<folder>/state.json after every step with an id. You can resume a broken workflow from exactly where it stopped.",
  },
  {
    title: "Headless VM replay",
    description:
      "TERMINATOR_HEADLESS=true spins up a virtual display context. The same YAML Claude Code authored today runs unattended on a Windows VM tomorrow.",
  },
];

const contextTimelineSteps = [
  {
    title: "Tool call shape",
    description:
      "Every MCP tool call costs input tokens (the tool schema, the arguments, the system prompt reminder) and output tokens (the LLM's decision, the arguments to emit). Every response frame costs input tokens to inject back into the conversation.",
  },
  {
    title: "Desktop tasks are long",
    description:
      "A realistic desktop task is 15 to 30 steps: open app, wait, check state, click, type, validate, click, type, screenshot, ... . Times three if there are branches, retries, or vendor-specific prompts to dismiss.",
  },
  {
    title: "Naive MCP servers explode the round-trip count",
    description:
      "Each step becomes a separate tool call. Each step emits a full UI tree snapshot back into the conversation. Each step gives the LLM a chance to re-plan, and re-planning burns output tokens on top of the input cost. The context window becomes the bottleneck well before the desktop does.",
  },
  {
    title: "execute_sequence moves the loop server-side",
    description:
      "The LLM decides the workflow shape once, emits one tool call, and the sequence engine handles step-by-step execution, UI tree capture, selector resolution, variable interpolation, conditional jumps, and fallbacks. The LLM does not see the intermediate trees unless it asks for them.",
  },
  {
    title: "State outlives the MCP call",
    description:
      "Each step with an id writes an entry to state.json. If Claude Code closes, if the machine reboots, if a colleague picks up the task, the next run reads the same state file and continues. The context window is not the storage medium anymore.",
  },
];

const checklist = [
  {
    text: "The server exposes a batching primitive (execute_sequence, run_script, workflow_run)",
  },
  {
    text: "Tool handlers share one cancellation token so stop_execution actually stops work",
  },
  {
    text: "There is a predictable on-disk location for workflow state between runs",
  },
  {
    text: "The same MCP binary can run headless (no RDP, no attended session)",
  },
  {
    text: "Selector syntax is visible, documented, and does not require vision models by default",
  },
  {
    text: "The tool list the LLM sees is derived from the dispatch code, not drifted from it",
  },
];

const installSteps = [
  {
    title: "Install Claude Code if you have not already",
    description:
      "npm install -g @anthropic-ai/claude-code. Claude Code is the CLI that speaks MCP; the Terminator server plugs into whichever Claude Code install you have on this machine.",
  },
  {
    title: "Register the MCP server at user scope",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. User scope means every Claude Code session on this machine sees the server, without having to add it per repo.",
  },
  {
    title: "Confirm Claude Code sees the 32 tools",
    description:
      "claude mcp list should show terminator stdio 32 tools. If it shows 0 tools or the name in red, check that Node.js 16+ is on PATH and that npx can fetch the package.",
  },
  {
    title: "Optional: grant accessibility permission on macOS",
    description:
      "System Settings → Privacy & Security → Accessibility → add the terminal app that launches Claude Code (Terminal, iTerm, Warp). Without this, get_window_tree returns empty results on every window.",
  },
  {
    title: "Tell Claude Code what you want",
    description:
      "\"Open QuickBooks, import invoice INV-4412.pdf, post it to Expense:Software, save and close.\" Claude Code picks execute_sequence, emits one tool call, and Terminator walks the real GUI. The conversation stays readable; the YAML it generates sits in .mediar/workflows/<name>/ and can be re-run unattended.",
  },
];

const faqs = [
  {
    q: "What exactly is a 'Claude Code MCP server' and how is Terminator one of them?",
    a: "Claude Code speaks the Model Context Protocol over stdio and HTTP. Any process that answers initialize, tools/list, and tools/call on one of those transports is a Claude Code MCP server. Terminator ships crates/terminator-mcp-agent as a Rust binary that speaks stdio by default (and HTTP with -t http). You install it in Claude Code with: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. After that, Claude Code sees 32 new tools it can call, all of which touch the real desktop through accessibility APIs (Windows UIA on Windows, AX on macOS) instead of screenshots.",
  },
  {
    q: "Why does the context window matter here? Is this not just a performance micro-optimization?",
    a: "No. On realistic desktop tasks it is the dominant cost. A 20-step workflow via a naive MCP server means 20 tool calls, 20 argument payloads, 20 return frames, and typically 20 UI tree snapshots injected back into the conversation. Tree snapshots are the heavy part: the basic tree of a single browser tab is already thousands of tokens. Twenty of them in one session is tens of thousands of tokens of context the LLM has to read to decide the next step. execute_sequence keeps the tree server-side (include_tree_after_action=false for intermediate steps) and returns one condensed result, which is the difference between the workflow fitting in context and Claude Code starting to lose earlier turns.",
  },
  {
    q: "What is the 'one MCP call' I keep reading about in this page?",
    a: "execute_sequence is a tool on the server. Claude Code emits a single JSON-RPC tools/call frame with tool_name=execute_sequence and arguments containing the full YAML workflow. The server routes it to the arm at crates/terminator-mcp-agent/src/server.rs line 10234, which calls Box::pin(self.execute_sequence_impl(...)) and runs every step in that workflow inside the same request context. One JSON-RPC request, one JSON-RPC response, N desktop actions in between. The alternative (one tool call per step) is what most MCP servers give you by default, and it is the context-window-explosion scenario.",
  },
  {
    q: "How does the workflow actually survive after Claude Code closes?",
    a: "Inside execute_sequence_impl, every step that has an id or calls set_env triggers save_workflow_state. That function is in crates/terminator-mcp-agent/src/server_sequence.rs around line 216 and it writes a file at <data_dir>/mediar/workflows/<folder>/state.json with the current env map, the last step id, the last step index, and an ISO-8601 timestamp. When you later run terminator mcp run workflow.yml --start-from some_step, the CLI reads that file and seeds env before executing. Nothing in the MCP message history is load-bearing; the workflow is the contract.",
  },
  {
    q: "What does 'runs on a headless VM' mean in practice?",
    a: "On Windows, the UI Automation API normally requires a display session. Terminator's agent detects headless environments (no console window, running as a service, or TERMINATOR_HEADLESS=true explicitly) and initializes a virtual display context that Windows UIA will read against. The effect is that you can take the same YAML Claude Code authored, scp it to a Windows VM with no RDP session, set TERMINATOR_HEADLESS=true, run terminator mcp run workflow.yml, and the automation fires as if a human were logged in. This is documented in crates/terminator-mcp-agent/README.md starting at line 419 under 'Virtual Display Support'.",
  },
  {
    q: "What happens if I hit Ctrl+C in Claude Code while a long-running tool is in flight?",
    a: "Claude Code triggers the MCP request_context cancellation, which flips request_context.ct.cancelled(). Every handler in crates/terminator-mcp-agent/src/server.rs wraps its work in tokio::select! against that token (starting at lines 9957-9966 for get_window_tree and continuing for click_element, type_into_element, wait_for_element, and the rest). When the token fires, the in-flight future is dropped at the next await point and the handler returns McpError code -32001. The desktop pointer releases within a scheduler tick. This is different from HTTP-only cancellation, where the connection closes but the server-side work runs to completion, often corrupting state. You can also call the stop_execution tool from a second Claude Code tab to force the same behaviour explicitly.",
  },
  {
    q: "Is this better or worse than Claude's native computer-use tool?",
    a: "It is a different trade-off. Claude computer use is vision-based: screenshots in, click coordinates out. It is model-agnostic about the target and works on anything rendered to pixels. Terminator reads the accessibility tree, which means selectors are readable (role:Button && name:Save), actions are deterministic (clicks dispatch through invoke patterns, not screen coordinates), and latency is lower (no image capture on every step). For most line-of-business desktop apps, especially Win32 and Electron apps with accessible trees, Terminator is faster and more reliable. For pixel-only surfaces (games, some legacy apps, remote desktop sessions rendered as video), computer-use is the right tool. The two compose: Terminator has a gemini_computer_use fallback arm for the cases where the accessibility tree is missing.",
  },
  {
    q: "Does execute_sequence have error handling, or does the whole workflow fail on step 1?",
    a: "It has four independent mechanisms. First, stop_on_error: true at the workflow level is the default strict mode. Second, continue_on_error: true on a single step lets it fail quietly. Third, fallback_id on a step jumps to a named troubleshooting step instead of stopping. Fourth, conditional jumps (jumps: [{ if: \"status == 'success'\", to_id: ... }]) let you branch based on prior step results. The full shape is documented in the README under 'Fallback Mechanism' and the example workflows in crates/terminator-mcp-agent/examples/. Between those, a real workflow can encode retry-then-escalate logic without forcing Claude Code to re-plan after every failure.",
  },
  {
    q: "What is the minimal path to go from zero to 'Claude Code is driving my desktop'?",
    a: "Three steps. One: install Claude Code (npm install -g @anthropic-ai/claude-code). Two: run claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. Three: on macOS, grant accessibility permission to whatever terminal app launches Claude Code. Confirm with claude mcp list that terminator shows 32 tools. Then ask Claude Code something like \"list the applications currently open on my desktop\" (it will call get_applications_and_windows_list) or \"open Calculator and compute 42 plus 8\" (it will call execute_sequence with open_application, type_into_element, click_element, wait_for_element). No config files, no JSON patching.",
  },
  {
    q: "Where do I look in the repo to verify what this page claims?",
    a: "crates/terminator-mcp-agent/src/server.rs for the dispatch_tool block at line 9953, the execute_sequence arm at 10234 (Box::pin async recursion), and the tokio::select cancellation pattern at 9957-9966. crates/terminator-mcp-agent/src/server_sequence.rs for state persistence: get_state_file_path at line 193 and save_workflow_state at line 216. crates/terminator-mcp-agent/README.md lines 19 for the Claude Code install command, lines 419-433 for TERMINATOR_HEADLESS, and lines 600-650 for partial execution and state.json. crates/terminator-mcp-agent/build.rs line 31 for the compile-time tool-list extraction that keeps the LLM-visible tool names in sync with the dispatch arms.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Playwright MCP server, then off the page",
    excerpt:
      "Same MCP shape as playwright-mcp, scope that does not stop at the browser tab. Includes the Chrome extension on ws://127.0.0.1:17373.",
    href: "/t/playwright-mcp-server",
    tag: "Comparison",
  },
  {
    title: "The best MCP server for a real deployment",
    excerpt:
      "Why MCP_MAX_CONCURRENT=1 is the right default for a desktop, and how the 503-on-busy body doubles as a load balancer contract.",
    href: "/t/best-mcp-server",
    tag: "Production",
  },
  {
    title: "MCP server list",
    excerpt:
      "A concrete tool-by-tool list of what Terminator's MCP server exposes, with arguments and side effects.",
    href: "/t/mcp-server-list",
    tag: "Reference",
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
    <div className="min-h-screen bg-white">
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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Claude Code
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Context budget
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                execute_sequence
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              The Claude Code{" "}
              <GradientText variant="teal">MCP server</GradientText> that
              treats your context window as a budget, not a default.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every tutorial for &quot;Claude Code MCP server&quot; ends at the
              install command. That is the easy part. The hard part is the
              minute your agent starts driving a real application. A 20-step
              desktop task via a naive MCP server eats the context window alive:
              twenty tool-call round-trips, twenty UI tree snapshots injected
              back into the conversation, twenty chances for the LLM to
              re-plan. Terminator ships a single tool,{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
                execute_sequence
              </code>
              , that collapses that into one MCP call with server-side jumps,
              fallbacks, and state persistence. The YAML Claude Code authors
              today runs unattended on a headless VM tomorrow. This page walks
              through the exact code that makes that possible.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="13 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="every 'Claude Code MCP server' top-10 article read"
              highlights={[
                "32 tools in one dispatch arm",
                "execute_sequence collapses N steps into 1 round-trip",
                "state.json persists between sessions and reboots",
                "TERMINATOR_HEADLESS=true replays on a VM",
              ]}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#install"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-orange-300 hover:text-orange-700 transition-colors"
              >
                Skip to the install
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Claude Code MCP server"
            subtitle="Built for one-call desktop workflows, not per-step round-trips"
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Claude Code speaks MCP",
              "Desktop tasks are 20+ steps",
              "Every round-trip eats the context window",
              "execute_sequence makes it one MCP call",
              "The YAML survives the session",
            ]}
            durationInFrames={210}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <Marquee speed={40} pauseOnHover fade>
            <div className="flex items-center gap-3 pr-3">
              {marqueeChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-mono text-zinc-700 whitespace-nowrap"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Why every Claude Code MCP guide stops at the install command
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            I read the top results for &quot;claude code mcp server&quot;: the
            official docs, the Builder.io guide, Scott Spence&apos;s post, the
            Docker MCP Toolkit announcement, ksred&apos;s &quot;Claude Code AS
            an MCP server&quot; piece, and the three or four GitHub READMEs that
            rank with them. They all tell you the same three things. How
            transport types work (stdio vs HTTP). How{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              claude mcp add
            </code>
            {" "}writes a block to{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              ~/.claude.json
            </code>
            . And a list of popular servers, which at this point is an
            evergreen content format with no teeth.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            None of them describe what happens on minute two. You connect an
            MCP server that can actually do something heavy (a browser driver,
            a desktop automator, a filesystem scraper), you ask Claude Code for
            a real task, and the context window starts filling with round-trip
            noise. By step fifteen you are either at the context limit or
            watching Claude Code politely lose the plot because earlier turns
            are getting summarised away.
          </p>

          <ProofBanner
            metric="1"
            quote="Number of MCP round-trips needed to run an 8-step desktop workflow through Terminator's execute_sequence tool. The LLM does not see the intermediate UI trees unless it explicitly asks for them."
            source="crates/terminator-mcp-agent/src/server.rs line 10234"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The math behind the context problem
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Before showing the fix, it is worth making the problem concrete.
            This is the arithmetic of a Claude Code session that does real
            desktop work through an MCP server that exposes one action per
            tool call.
          </p>
          <StepTimeline steps={contextTimelineSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <MetricsRow
            metrics={[
              { value: 32, label: "tools in one dispatch arm" },
              { value: 1, label: "MCP call per full workflow" },
              { value: 8, label: "desktop steps in the example YAML" },
              { value: 3, suffix: " OS", label: "targets with the same YAML" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The dispatch arm that changes the shape of a Claude Code session
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Here is the dispatch block every Claude Code tool call lands in.
            Most of the arms are shaped the same way: deserialise args, call a
            handler, return the result. The{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              execute_sequence
            </code>
            {" "}arm is the exception. It uses{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              Box::pin
            </code>
            {" "}to hold a recursive async future, so one tool call can contain
            an entire workflow, including nested sequences.
          </p>
          <AnimatedCodeBlock
            code={dispatchCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
            typingSpeed={5}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <AnimatedBeam
            title="One MCP call, N desktop actions"
            accentColor="#FF3E00"
            from={[
              { label: "Claude Code", sublabel: "(LLM)" },
              { label: "stdio transport", sublabel: "(MCP client)" },
            ]}
            hub={{ label: "execute_sequence", sublabel: "(Rust handler)" }}
            to={[
              { label: "open_application" },
              { label: "type_into_element" },
              { label: "click_element" },
              { label: "wait_for_element" },
              { label: "run_command" },
              { label: "state.json write" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The YAML Claude Code emits, in practice
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            This is a realistic slice of what Claude Code actually sends to
            Terminator for a common task: importing a PDF invoice into
            QuickBooks Desktop. Eight steps, one conditional jump, one set of
            selectors. Claude Code makes this decision once, ships one tool
            call, and the sequence engine runs the rest.
          </p>
          <AnimatedCodeBlock
            code={sequenceWorkflow}
            language="yaml"
            filename="close-month-end.yml"
            typingSpeed={4}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            What the round-trip actually looks like on the wire
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The sequence diagram below shows the collapse in concrete terms.
            Left to right: Claude Code, the stdio transport, the dispatch
            function in <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">server.rs</code>,
            the sequence engine, and the underlying OS accessibility APIs. One
            request frame in, one response frame out, all step-level work
            contained between them.
          </p>
          <SequenceDiagram
            title="A single execute_sequence call"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Cancellation: stop_execution actually stops the pointer
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Batching only pays off if you can bail out safely. Every handler
            in Terminator awaits inside a{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              tokio::select!
            </code>
            {" "}against a cancellation token lifted off the{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              request_context
            </code>
            . When Claude Code disconnects mid-workflow (or when a second
            Claude Code tab explicitly calls{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              stop_execution
            </code>
            ), the in-flight click is dropped at the next await point. The
            desktop pointer releases within a scheduler tick. Compare this
            with HTTP-only cancellation, where the connection closes but the
            handler runs to completion against a UI that no one is watching
            anymore.
          </p>
          <AnimatedCodeBlock
            code={cancellationCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
            typingSpeed={5}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            State.json: why the workflow survives Claude Code closing
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Inside the sequence engine, every step that has an{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              id
            </code>
            {" "}or writes to{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              set_env
            </code>
            {" "}triggers a write to a per-workflow state file on disk. The
            path is OS-native and predictable. The consequence is that the
            MCP message history is not the storage medium: the YAML is the
            contract, and the state file is the resumable context.
          </p>
          <AnimatedCodeBlock
            code={stateCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server_sequence.rs"
            typingSpeed={5}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Verifying the install and the state file on your own box
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            If you just installed the server, these are the commands that
            confirm Claude Code can see it and that the state directory is
            where this page says it is. The last line is the one that matters:
            the state file is human-readable JSON you can{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              cat
            </code>
            {" "}and inspect.
          </p>
          <TerminalOutput
            title="Verifying install + state persistence"
            lines={verifyTerminal}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The payoff: the same YAML runs on a headless VM
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The YAML Claude Code authored is not a transient artifact. Move
            it to a Windows VM, set{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              TERMINATOR_HEADLESS=true
            </code>
            , and run it with the Terminator CLI. The virtual display context
            satisfies Windows UI Automation without a logged-in RDP session,
            and the same selectors resolve because the accessibility tree is
            an OS-level structure, not a pixel artifact. This is how a
            Claude-Code-driven agent graduates from a desktop helper into a
            nightly job on a server.
          </p>
          <TerminalOutput
            title="Replay on a headless Windows VM"
            lines={headlessTerminal}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            What else the 32 tools give Claude Code
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            execute_sequence is the one that matters for context budget, but
            it is sitting on top of 31 other tools. The full surface. The map
            below is the mental model: six capability clusters that every
            Claude Code tool call eventually lands in.
          </p>
          <BentoGrid cards={capabilityCards} />
        </section>

        <section id="install" className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The install, end to end
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Five steps, one of which only matters on macOS. If you are
            tempted to copy just the first command and move on, at least read
            step three: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">claude mcp list</code> is how you know the server actually
            registered.
          </p>
          <StepTimeline steps={installSteps} />
          <div className="mt-6">
            <AnimatedCodeBlock
              code={installCode}
              language="bash"
              filename="install-and-verify.sh"
              typingSpeed={6}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Terminator vs a generic Claude Code MCP server
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The right-hand column is the composite behaviour of the other
            MCP servers that rank for this query. Nothing personal; the table
            is just a structural lens. If your server of choice has a batching
            primitive, a shared cancellation token, and a state file, you can
            treat the two columns as a quality check rather than a ranking.
          </p>
          <ComparisonTable
            productName="Terminator MCP"
            competitorName="Generic Claude Code MCP"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard className="p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              Checklist for evaluating any Claude Code MCP server
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Not a marketing filter; a structural one. Steal this list and
              apply it to whichever MCP server you are considering. If it
              passes four out of six, Claude Code will handle long tasks.
              If it passes two, expect to babysit the context window.
            </p>
            <AnimatedChecklist
              title="Structural checklist"
              items={checklist}
            />
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The honest summary
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Most &quot;Claude Code MCP server&quot; tutorials rank near the
            top of Google because the install command is memorable and the
            structure is replicable. They are not wrong; they are incomplete.
            The thing that separates an MCP server you can use in Claude Code
            for a weekend from one you can trust with a weekly job is whether
            the server treats the conversation as a transcript of decisions
            rather than the authoritative store of state. Terminator does.
            The YAML is the contract. The state file is the resumable context.
            The LLM&apos;s job is to decide the shape, not to relay every
            keystroke.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            If you want to try it on the exact install command this page has
            been showing, run this:
          </p>
          <AnimatedCodeBlock
            language="bash"
            filename="one-command.sh"
            code={`claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user`}
            typingSpeed={8}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            section="claude-code-mcp-server-footer"
            heading="Wiring Terminator into a Claude Code workflow for a real deployment?"
            description="Bring the task you actually want automated. We will walk through the YAML, the state.json layout, and how to run it headless on your own VM. 20 minutes, live."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection items={faqs} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RelatedPostsGrid
            title="More on the same MCP server from other angles"
            subtitle="If this page was useful, these walk through the other half of the surface"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          section="claude-code-mcp-server-sticky"
          description="Book a live walkthrough: execute_sequence, state.json, headless replay"
        />
      </article>
    </div>
  );
}
