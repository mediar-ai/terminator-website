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
  BentoGrid,
  GlowCard,
  StepTimeline,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/mcp-server-list";
const PUBLISHED = "2026-04-19";
const TITLE =
  "MCP server list: where your client actually keeps one, and the 12-path map an installer has to know";
const DESCRIPTION =
  "Every top result for 'mcp server list' is a directory of third-party servers. None tell you that your MCP client keeps its own list, as a JSON file, at a path that differs by client and by OS. Terminator's installer ships the map: 12 client paths across Windows, macOS, and Linux, plus a special-cased command shell-out for VS Code. This page is that map, with the source and the verify commands.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Your MCP client stores its server list as a JSON file on disk. The path is different for Cursor, Claude Desktop, Windsurf, Cline, RooCode, Witsy, Enconvo, BoltAI, Amazon Bedrock, Amazon Q, and VS Code. Here is the full 12-path map and where it lives in code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The MCP server list lives on your disk, not in a directory",
    description:
      "12 clients, 12 JSON paths, one map in config.js. Plus the 31-tool list Terminator appends to whichever one you pick.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "MCP server list" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "MCP server list", url: PAGE_URL },
];

const configJsCode = `// crates/terminator-mcp-agent/config.js lines 50-100
// The built-in map the installer uses when you run
// \`npx terminator-mcp-agent --add-to-app\`.

const clientPaths = {
  claude: { type: "file", path: defaultClaudePath },
  cline: {
    type: "file",
    path: path.join(baseDir, vscodePath,
      "saoudrizwan.claude-dev", "settings", "cline_mcp_settings.json"),
  },
  roocode: {
    type: "file",
    path: path.join(baseDir, vscodePath,
      "rooveterinaryinc.roo-cline", "settings", "mcp_settings.json"),
  },
  windsurf: {
    type: "file",
    path: path.join(homeDir, ".codeium", "windsurf", "mcp_config.json"),
  },
  witsy:   { type: "file", path: path.join(baseDir, "Witsy", "settings.json") },
  enconvo: { type: "file", path: path.join(homeDir, ".config", "enconvo", "mcp_config.json") },
  cursor:  { type: "file", path: path.join(homeDir, ".cursor", "mcp.json") },

  // VS Code is special: there is no stable JSON file, the client owns the list.
  // The installer shells out to \`code --add-mcp <json>\` instead.
  vscode:            { type: "command", command: "code" },
  "vscode-insiders": { type: "command", command: "code-insiders" },

  boltai:           { type: "file", path: path.join(homeDir, ".boltai", "mcp.json") },
  "amazon-bedrock": { type: "file", path: path.join(homeDir, "Amazon Bedrock Client", "mcp_config.json") },
  amazonq:          { type: "file", path: path.join(homeDir, ".aws", "amazonq", "mcp.json") },
};`;

const claudeConfigSnippet = `// ~/Library/Application Support/Claude/claude_desktop_config.json
// (or %APPDATA%\\Claude\\claude_desktop_config.json on Windows)
// This IS your MCP server list for Claude Desktop.
{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    },
    "another-server": {
      "command": "node",
      "args": ["/path/to/server.js"]
    }
  }
}`;

const listToolsResponse = `// What the client sees after initialize.
// This is the OTHER kind of "MCP server list": the tool list
// one server exposes over JSON-RPC 2.0.
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      { "name": "get_window_tree",                "description": "Get UI tree for a process..." },
      { "name": "get_applications_and_windows_list", "description": "Get all applications..." },
      { "name": "click_element",                  "description": "Unified click tool..." },
      { "name": "type_into_element",              "description": "Types text into a UI element..." },
      { "name": "press_key",                      "description": "Sends a key press..." },
      { "name": "press_key_global",               "description": "Activates the window and sends a key..." },
      { "name": "validate_element",               "description": "Validates element exists..." },
      { "name": "wait_for_element",               "description": "Waits for an element..." },
      { "name": "activate_element",               "description": "Brings window to foreground..." },
      { "name": "navigate_browser",               "description": "Drives the address bar..." },
      { "name": "execute_browser_script",         "description": "Runs JS in the active tab..." },
      { "name": "open_application",               "description": "Launches an app..." },
      { "name": "scroll_element",                 "description": "Scrolls a UI element..." },
      { "name": "delay",                          "description": "Delays execution..." },
      { "name": "run_command",                    "description": "Shell or embedded JS/Python/Node..." },
      { "name": "mouse_drag",                     "description": "Mouse drag between coordinates..." },
      { "name": "highlight_element",              "description": "Colored border for confirmation..." },
      { "name": "select_option",                  "description": "Select a dropdown option..." },
      { "name": "set_selected",                   "description": "Set selection state..." },
      { "name": "invoke_element",                 "description": "Invokes a UI element..." },
      { "name": "set_value",                      "description": "Sets value of editable control..." },
      { "name": "execute_sequence",               "description": "Multi-step YAML/JSON workflow..." },
      { "name": "stop_highlighting",              "description": "Stops active highlights..." },
      { "name": "stop_execution",                 "description": "Cancels running tools..." },
      { "name": "gemini_computer_use",            "description": "Gemini agentic loop..." },
      { "name": "read_file",                      "description": "Read file with line numbers..." },
      { "name": "write_file",                     "description": "Write a file..." },
      { "name": "edit_file",                      "description": "Edit by replacing a string match..." },
      { "name": "copy_content",                   "description": "Copy content between files..." },
      { "name": "glob_files",                     "description": "Find files by glob pattern..." },
      { "name": "grep_files",                     "description": "Regex search in files..." }
    ]
  }
}`;

const addToAppTerminal = [
  { text: "# 1. Run the installer and pick a client from the map", type: "output" as const },
  {
    text: "npx -y terminator-mcp-agent@latest --add-to-app",
    type: "command" as const,
  },
  { text: "? Which MCP client? (Use arrow keys)", type: "output" as const },
  { text: "  Cursor       ~/.cursor/mcp.json", type: "output" as const },
  { text: "> Claude       ~/Library/Application Support/Claude/claude_desktop_config.json", type: "output" as const },
  { text: "  VS Code      (special: code --add-mcp)", type: "output" as const },
  { text: "  Windsurf     ~/.codeium/windsurf/mcp_config.json", type: "output" as const },
  { text: "  Cline        ...Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json", type: "output" as const },
  { text: "  RooCode      ...Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json", type: "output" as const },
  { text: "  Witsy, Enconvo, BoltAI, Amazon Bedrock, Amazon Q, VS Code Insiders", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "Added terminator-mcp-agent to Claude's list.", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# 2. Verify: open the file and read the list", type: "output" as const },
  {
    text: "cat \"$HOME/Library/Application Support/Claude/claude_desktop_config.json\"",
    type: "command" as const,
  },
  { text: "{ \"mcpServers\": { \"terminator-mcp-agent\": { \"command\": \"npx\", ... } } }", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# 3. Or use the Claude Code CLI", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "  terminator-mcp-agent   stdio   31 tools", type: "success" as const },
];

const verifyTerminal = [
  { text: "# How to see the 31-tool list an MCP server actually returns", type: "output" as const },
  { text: "# Step 1: start the server in stdio mode", type: "output" as const },
  { text: "npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "# Step 2: on another process, send JSON-RPC 2.0 list_tools", type: "output" as const },
  {
    text: 'echo \'{"jsonrpc":"2.0","id":1,"method":"tools/list"}\' | nc -U /tmp/mcp.sock',
    type: "command" as const,
  },
  { text: "{ \"jsonrpc\": \"2.0\", \"id\": 1, \"result\": { \"tools\": [ ... 31 entries ... ] } }", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Or the MCP-inspector CLI does this for you", type: "output" as const },
  { text: "npx @modelcontextprotocol/inspector npx terminator-mcp-agent@latest", type: "command" as const },
  { text: "Inspector listening on http://127.0.0.1:6274 (tools tab shows 31)", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What kind of list?",
    competitor: "A curated directory of third-party MCP servers on a website",
    ours: "The literal JSON array in your client's config file, plus the per-tool list a server returns over JSON-RPC",
  },
  {
    feature: "Where does it live?",
    competitor: "In a web page's database",
    ours: "On your disk at a client-specific path (Cursor: ~/.cursor/mcp.json, Claude: ~/Library/Application Support/Claude/claude_desktop_config.json, etc.)",
  },
  {
    feature: "How many clients are mapped?",
    competitor: "Not applicable (directories are client-agnostic)",
    ours: "12 clients in crates/terminator-mcp-agent/config.js: Claude, Cursor, VS Code, VS Code Insiders, Windsurf, Cline, RooCode, Witsy, Enconvo, BoltAI, Amazon Bedrock, Amazon Q",
  },
  {
    feature: "How does the installer write to VS Code?",
    competitor: "Would expect a shared JSON path",
    ours: "Special-cased as { type: \"command\", command: \"code\" }; shells out to code --add-mcp <json> because VS Code owns the list itself",
  },
  {
    feature: "How is the 31-tool list kept in sync?",
    competitor: "Maintained manually in a wiki",
    ours: "build.rs walks server.rs at compile time, scans for \"tool_name\" => match arms, bakes them into the binary via cargo:rustc-env=MCP_TOOLS, prompt.rs reads env!(\"MCP_TOOLS\") at startup so the system prompt and dispatcher cannot drift",
  },
  {
    feature: "Multi-client install",
    competitor: "Copy-paste the same JSON into every client manually",
    ours: "npx -y terminator-mcp-agent@latest --add-to-app prompts for a client and writes the correct file or runs the correct command",
  },
  {
    feature: "Answers 'what tools does this server expose'?",
    competitor: "Sometimes, for well-documented servers, via a web page",
    ours: "Live, over the wire: POST a tools/list JSON-RPC frame and the server returns the same 31 names its own dispatcher matches against",
  },
];

const clientBentoCards: BentoCard[] = [
  {
    title: "Cursor",
    description:
      "Single-file JSON at ~/.cursor/mcp.json. Edit it directly or use the installer; the mcpServers key is the server list.",
    size: "1x1",
  },
  {
    title: "Claude Desktop",
    description:
      "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json. Windows: %APPDATA%\\Claude\\claude_desktop_config.json. Restart the app after editing.",
    size: "2x1",
  },
  {
    title: "VS Code + Insiders",
    description:
      "No stable JSON path; the editor owns the list. Installer shells out to code --add-mcp <json> (or code-insiders). That is why config.js marks these entries type: command.",
    size: "2x1",
  },
  {
    title: "Windsurf",
    description:
      "~/.codeium/windsurf/mcp_config.json. Same mcpServers shape as Claude and Cursor.",
    size: "1x1",
  },
  {
    title: "Cline",
    description:
      "Deep inside VS Code globalStorage: saoudrizwan.claude-dev/settings/cline_mcp_settings.json. The installer reaches into VS Code's config dir to find it.",
    size: "1x1",
  },
  {
    title: "RooCode",
    description:
      "Same idea as Cline: rooveterinaryinc.roo-cline/settings/mcp_settings.json under VS Code globalStorage.",
    size: "1x1",
  },
  {
    title: "Witsy, Enconvo, BoltAI",
    description:
      "Each has its own home-dir path: Witsy in Application Support/Witsy/settings.json, Enconvo in ~/.config/enconvo/mcp_config.json, BoltAI in ~/.boltai/mcp.json.",
    size: "2x1",
  },
  {
    title: "Amazon Bedrock + Amazon Q",
    description:
      "Bedrock: ~/Amazon Bedrock Client/mcp_config.json. Q: ~/.aws/amazonq/mcp.json. The AWS lineage shows in the paths.",
    size: "1x1",
  },
];

const toolGroupBento: BentoCard[] = [
  {
    title: "Discovery",
    description:
      "get_window_tree, get_applications_and_windows_list, validate_element, wait_for_element. Read-only probes for what is on screen before you touch anything.",
    size: "1x1",
  },
  {
    title: "Action",
    description:
      "click_element, type_into_element, press_key, press_key_global, invoke_element, set_value, set_selected, select_option, scroll_element, mouse_drag. The verbs the LLM picks to move a UI.",
    size: "2x1",
  },
  {
    title: "Browser bridge",
    description:
      "navigate_browser and execute_browser_script, routed through Terminator's MV3 Chrome extension on ws://127.0.0.1:17373. DOM-level access from the same dispatch block as the native arms.",
    size: "2x1",
  },
  {
    title: "Filesystem",
    description:
      "read_file, write_file, edit_file, copy_content, glob_files, grep_files. The server is also a typed filesystem, so workflows can read YAML inputs and write reports.",
    size: "1x1",
  },
  {
    title: "Escape hatches",
    description:
      "run_command (shell or embedded JS/Python/Node), gemini_computer_use (vision-based agentic loop). For the cases where accessibility trees are not enough.",
    size: "2x1",
  },
  {
    title: "Orchestration",
    description:
      "execute_sequence stitches any of the other 30 into a YAML pipeline. stop_execution cancels in flight. delay pads between actions. activate_element brings a window forward.",
    size: "1x1",
  },
];

const installSteps = [
  {
    title: "List, in the client sense, exists as a JSON file on disk",
    description:
      "Before anything else: your client keeps an MCP server list as a JSON object at a known path. For Cursor it is ~/.cursor/mcp.json. For Claude Desktop it is in Application Support. For VS Code it is internal.",
  },
  {
    title: "Installer reads its 12-client map",
    description:
      "crates/terminator-mcp-agent/config.js defines clientPaths with 12 entries. Running npx -y terminator-mcp-agent@latest --add-to-app prompts you to pick one.",
  },
  {
    title: "Write the file (or shell out for VS Code)",
    description:
      "For file-type entries the installer merges a new mcpServers entry into the existing JSON. For command-type entries (vscode, vscode-insiders) it runs code --add-mcp <json> because the editor owns the list.",
  },
  {
    title: "Restart the client, watch it discover the server",
    description:
      "On boot, the client reads its list, spawns terminator-mcp-agent as a child process, and sends initialize. The server replies with its tool list, the other sense of MCP server list.",
  },
  {
    title: "Tool list is also code-generated",
    description:
      "build.rs at crates/terminator-mcp-agent/build.rs walks src/server.rs, collects every \"tool_name\" => match arm, and bakes a comma-separated list into the binary as MCP_TOOLS. prompt.rs reads env!(\"MCP_TOOLS\") at startup so the system prompt and dispatch function cannot drift.",
  },
];

const faqs = [
  {
    q: "What is an MCP server list?",
    a: "Two things share the phrase. First sense: your MCP client's list of servers it knows about, stored as a JSON file on disk at a client-specific path (Cursor uses ~/.cursor/mcp.json, Claude Desktop uses ~/Library/Application Support/Claude/claude_desktop_config.json on macOS, Windsurf uses ~/.codeium/windsurf/mcp_config.json, and so on). Second sense: the list of tools a single MCP server exposes, returned over JSON-RPC 2.0 when the client sends a tools/list method. Both are literal lists. Neither is a marketing directory. If you are searching for 'mcp server list' hoping to see tools a specific server exposes, this page shows Terminator's 31-entry tool list below. If you are looking for where your own client stores its list, the 12-path map is also here.",
  },
  {
    q: "Where does each MCP client store its server list on disk?",
    a: "From crates/terminator-mcp-agent/config.js lines 50 to 100: Cursor uses ~/.cursor/mcp.json. Claude Desktop uses ~/Library/Application Support/Claude/claude_desktop_config.json on macOS or %APPDATA%\\Claude\\claude_desktop_config.json on Windows. Windsurf uses ~/.codeium/windsurf/mcp_config.json. Cline lives inside VS Code globalStorage under saoudrizwan.claude-dev/settings/cline_mcp_settings.json. RooCode is also under VS Code globalStorage at rooveterinaryinc.roo-cline/settings/mcp_settings.json. Witsy uses Application Support/Witsy/settings.json. Enconvo uses ~/.config/enconvo/mcp_config.json. BoltAI uses ~/.boltai/mcp.json. Amazon Bedrock uses ~/Amazon Bedrock Client/mcp_config.json. Amazon Q uses ~/.aws/amazonq/mcp.json. VS Code and VS Code Insiders are the two exceptions: there is no stable JSON path, so the installer shells out to code --add-mcp or code-insiders --add-mcp instead.",
  },
  {
    q: "Why does VS Code not get a JSON path?",
    a: "Because VS Code owns its MCP list internally and exposes a stable CLI flag instead. Look at line 82 of config.js: the vscode entry is { type: 'command', command: 'code' }. When you pick vscode in the --add-to-app wizard, the installer runs code --add-mcp <json-string> instead of touching a file. The vscode-insiders entry does the same with code-insiders. This is why config.js has two type kinds: file targets get their JSON merged in-place, command targets get an execFileSync call.",
  },
  {
    q: "What does a minimal MCP server list file look like?",
    a: "A flat JSON object with an mcpServers key. Every client listed above shares this shape. Example: { \"mcpServers\": { \"terminator-mcp-agent\": { \"command\": \"npx\", \"args\": [\"-y\", \"terminator-mcp-agent@latest\"] } } }. Each entry is a key (the server name your client will show in its UI) mapped to an object with command and args. The command is the executable the client spawns as a child process; it speaks MCP over that child's stdin and stdout. You can add as many entries as you like; the client reads the whole list at startup and spawns one subprocess per entry.",
  },
  {
    q: "How is Terminator's own tool list generated and where is it?",
    a: "At compile time, by the build script. crates/terminator-mcp-agent/build.rs line 31 has a function extract_mcp_tools() that reads src/server.rs, scrolls until it finds the line containing 'let result = match tool_name', and then collects every string literal that matches the 'tool_name' => match arm pattern. It filters for lowercase-and-underscore names, deduplicates, joins with commas, and emits cargo:rustc-env=MCP_TOOLS=<list> so the value is baked into the binary. prompt.rs line 10 does let mcp_tools = env!(\"MCP_TOOLS\") and pastes the list into the system instructions at line 99. The result: the tool list the LLM sees, the list the dispatcher matches against, and the list the build scanner extracts are always the same list, because they are all read from the same place in server.rs.",
  },
  {
    q: "Which tools does Terminator's MCP server expose?",
    a: "Thirty-one: get_window_tree, get_applications_and_windows_list, click_element, type_into_element, press_key, press_key_global, validate_element, wait_for_element, activate_element, navigate_browser, execute_browser_script, open_application, scroll_element, delay, run_command, mouse_drag, highlight_element, select_option, set_selected, invoke_element, set_value, execute_sequence, stop_highlighting, stop_execution, gemini_computer_use, read_file, write_file, edit_file, copy_content, glob_files, grep_files. Five groups: discovery (read the tree), action (click or type), browser bridge (DOM access via the Terminator Bridge extension), filesystem (typed file ops), orchestration (execute_sequence plus stop), and two escape hatches (run_command and gemini_computer_use).",
  },
  {
    q: "How do I verify the tool list a server actually returns, without trusting its docs?",
    a: "Use the MCP Inspector or a JSON-RPC client directly. npx @modelcontextprotocol/inspector npx terminator-mcp-agent@latest starts a web UI that connects to the server over stdio and shows the live tools/list response. For raw verification, spawn the server yourself and send it a JSON-RPC frame: { \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"tools/list\", \"params\": {} }. The response contains a tools array with name and description for every entry. This is authoritative in a way a docs page is not; you are reading the list the server itself produces at boot.",
  },
  {
    q: "Can I have two MCP servers with the same name in my list?",
    a: "No. The JSON object key is the name; object keys cannot repeat. If you add terminator-mcp-agent twice, the second overwrites the first. This is also why the installer's writeConfigFile function reads the existing config, merges a new entry into mcpServers, and writes the result back: it is a dictionary merge, not an append. If you want two instances of the same server (for example, one on stdio and one on HTTP), give them different keys.",
  },
  {
    q: "Does every MCP client support every server in its list?",
    a: "Functionally yes, protocol-wise. If the server speaks Model Context Protocol correctly over its declared transport (stdio or HTTP), every compliant client can list its tools and dispatch calls. Ergonomically the clients differ. Claude Desktop and Cursor render the tool list as a sidebar. Claude Code shows it via claude mcp list. VS Code surfaces MCP servers in its extensions model. Cline and RooCode expose the list in their respective panels. The underlying list of servers in the JSON file is identical in shape across clients; the client's UI is what changes.",
  },
  {
    q: "Why does Terminator publish an installer instead of asking users to edit the JSON?",
    a: "Because the 12-path map is what users would otherwise have to memorize. Finding Claude Desktop's config on Windows at %APPDATA%\\Claude\\claude_desktop_config.json is not the same keystroke as finding it on macOS at ~/Library/Application Support/Claude/claude_desktop_config.json, and neither matches the VS Code --add-mcp flow. config.js in the agent's npm package encodes all 12 of those resolutions so one command, --add-to-app, writes to the correct file or runs the correct CLI. Users do not have to learn the map; the installer already knows it. That file is the anchor of this page.",
  },
];

export default function Page() {
  const jsonLdArticle = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Config on disk
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              MCP server list, the one{" "}
              <GradientText variant="teal">on your disk</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Top results for this query are directories of third-party MCP
              servers. Useful, but they are not your list. Your list is a
              JSON file sitting in a client-specific path on your machine. If
              you use Cursor, it is at{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                ~/.cursor/mcp.json
              </code>
              . If you use Claude Desktop on macOS, it is at{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </code>
              . Twelve clients, twelve paths, one map inside Terminator&apos;s
              installer source.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="10 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Two senses of 'MCP server list' — your client's list on disk, and the tool list a server returns",
                "12 client paths mapped in crates/terminator-mcp-agent/config.js",
                "VS Code and VS Code Insiders special-cased as command targets (code --add-mcp)",
                "Terminator's own list: 31 tools, generated at compile time by build.rs",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the installer source
              </ShimmerButton>
              <a
                href="#twelve-paths"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the 12-path map
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Your MCP server list is not a website. It is a file."
            subtitle="Twelve clients, twelve paths, one installer map."
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Every MCP client keeps its own list as JSON on disk",
              "Cursor, Claude Desktop, Windsurf, Cline, RooCode, Witsy, Enconvo, BoltAI, Amazon Bedrock, Amazon Q, VS Code, VS Code Insiders",
              "Each has a different path; VS Code has no path, it has a CLI flag",
              "Terminator's config.js encodes all 12 so --add-to-app writes the right one",
              "A separate list: the 31 tools a server returns over JSON-RPC",
            ]}
          />
        </section>

        {/* The two senses */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            Two things people mean by {"\""}MCP server list{"\""}
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The phrase is overloaded. The first sense is the list of MCP
            servers your client is configured to talk to. That list is a JSON
            file on your disk, one per client, at a path the client fixes. It
            is the thing you edit when you want your editor to start spawning
            a new server. The second sense is the list of tools a single MCP
            server returns when the client asks for them. That list is not a
            file; it is a JSON-RPC response the server produces at boot time.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Both matter and both are worth seeing with the source open. The
            rest of this page walks through both, using the Terminator source
            as the reference implementation. The first list, because
            Terminator ships an installer that knows where 12 clients keep
            theirs. The second list, because Terminator&apos;s is code-generated
            at compile time and reliable to enumerate.
          </p>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-6 pb-10">
          <MetricsRow
            metrics={[
              { value: 12, label: "MCP clients mapped in config.js" },
              { value: 2, label: "Target kinds: file + command" },
              { value: 31, label: "Tools in Terminator's server list" },
              { value: 17373, label: "Port the Chrome bridge listens on" },
            ]}
          />
        </section>

        {/* Marquee: client names */}
        <section className="max-w-5xl mx-auto px-6 pb-4">
          <p className="text-center text-xs uppercase tracking-wider text-zinc-500 mb-4">
            Clients the Terminator installer can write to
          </p>
          <Marquee pauseOnHover fade speed={40}>
            {[
              "Cursor",
              "Claude Desktop",
              "Claude Code",
              "VS Code",
              "VS Code Insiders",
              "Windsurf",
              "Cline",
              "RooCode",
              "Witsy",
              "Enconvo",
              "BoltAI",
              "Amazon Bedrock",
              "Amazon Q",
            ].map((name) => (
              <span
                key={name}
                className="mx-3 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Anchor section: the 12-path map */}
        <section
          id="twelve-paths"
          className="max-w-4xl mx-auto px-6 py-12 scroll-mt-16 bg-white/40 border-y border-zinc-200/60"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The anchor:{" "}
            <GradientText variant="teal">
              twelve clients, twelve paths
            </GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Inside the Terminator MCP agent&apos;s npm package, alongside the
            Rust binary and the JS wrapper, there is a file called{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/config.js
            </code>
            . The single most load-bearing object in that file is{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              clientPaths
            </code>
            , defined between lines 50 and 100. It encodes where every
            supported MCP client keeps its server list.
          </p>

          <AnimatedCodeBlock
            code={configJsCode}
            language="javascript"
            filename="crates/terminator-mcp-agent/config.js"
          />

          <p className="text-zinc-600 mt-6 mb-6 max-w-3xl leading-relaxed">
            Read that object carefully: every entry has a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              type
            </code>
            , either{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              file
            </code>{" "}
            (most clients) or{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              command
            </code>{" "}
            (VS Code and VS Code Insiders). File targets get their JSON merged
            in place. Command targets get an{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execFileSync
            </code>{" "}
            call: the installer runs{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              code --add-mcp &lt;json&gt;
            </code>{" "}
            because VS Code owns the list and does not expose a stable file
            path. That asymmetry is the single most practically useful detail
            in the map.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-orange-50 border border-orange-300">
            <p className="text-zinc-700 leading-relaxed">
              Verify in 10 seconds: clone{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                mediar-ai/terminator
              </code>{" "}
              and run{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                grep -nE &apos;type:\s*&quot;(file|command)&quot;&apos;
                crates/terminator-mcp-agent/config.js
              </code>
              . You will see twelve matches, two of them command targets. Then{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                grep -n supportedClients crates/terminator-mcp-agent/config.js
              </code>{" "}
              to see the final array of client keys the{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                --add-to-app
              </code>{" "}
              picker shows.
            </p>
          </div>
        </section>

        {/* Bento: per-client detail */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            Every client&apos;s list, at the path the client expects
          </h2>
          <p className="text-zinc-600 mb-8 max-w-3xl leading-relaxed">
            These are not the paths as we wish they were. These are the paths
            the open-source installer writes to, because these are the paths
            the clients read from. Everything below is drawn from{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              config.js
            </code>
            ; check the source if anything surprises you.
          </p>
          <BentoGrid cards={clientBentoCards} />
        </section>

        {/* The shape of a server list file */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            What a server list file actually looks like
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Despite the path differences, the shape is consistent. A server
            list is a JSON object with one top-level key:{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              mcpServers
            </code>
            . Inside it, each key is a server name (the label your client
            will show) and each value is a spawn descriptor with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              command
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              args
            </code>
            . The client spawns the process, speaks MCP over its stdio, and
            shows whatever{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              tools/list
            </code>{" "}
            returns.
          </p>
          <AnimatedCodeBlock
            code={claudeConfigSnippet}
            language="json"
            filename="claude_desktop_config.json"
          />
        </section>

        {/* Animated beam: installer → file or command */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            How --add-to-app routes one server to many lists
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Same installer, same entry being written, many destinations. The
            hub is{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              --add-to-app
            </code>
            . The left side is which client you picked. The right side is the
            file or command it resolves to.
          </p>
          <AnimatedBeam
            title="--add-to-app resolves a client to a list target"
            accentColor="#FF3E00"
            from={[
              { label: "--add-to-app claude", sublabel: "type: file" },
              { label: "--add-to-app cursor", sublabel: "type: file" },
              { label: "--add-to-app vscode", sublabel: "type: command" },
              { label: "--add-to-app windsurf", sublabel: "type: file" },
              { label: "--add-to-app cline", sublabel: "type: file" },
            ]}
            hub={{ label: "writeConfig()", sublabel: "config.js:166" }}
            to={[
              {
                label: "~/Library/.../Claude/claude_desktop_config.json",
                sublabel: "merge into mcpServers",
              },
              { label: "~/.cursor/mcp.json", sublabel: "merge into mcpServers" },
              { label: "code --add-mcp <json>", sublabel: "execFileSync" },
              {
                label: "~/.codeium/windsurf/mcp_config.json",
                sublabel: "merge into mcpServers",
              },
              {
                label: "VS Code globalStorage/.../cline_mcp_settings.json",
                sublabel: "merge into mcpServers",
              },
            ]}
          />
        </section>

        {/* Terminal: actually using the installer */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Adding a server to your list, in practice
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The installer is an interactive picker, but every choice it
            offers traces back to one of the 12 entries in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              clientPaths
            </code>
            . If the entry is a file, the installer merges into it. If it is
            a command, the installer shells out. Either way, after the picker
            finishes, your client&apos;s list contains one more server.
          </p>
          <TerminalOutput title="terminator-mcp-agent --add-to-app" lines={addToAppTerminal} />
        </section>

        {/* Step timeline: end-to-end */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The full path, from the two senses of the word
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The first list (on disk, per client) is what gets you a running
            server. The second list (tools, per server) is what the LLM
            actually dispatches against.
          </p>
          <StepTimeline steps={installSteps} />
        </section>

        {/* Second sense: the 31-tool list */}
        <section
          id="server-tool-list"
          className="max-w-4xl mx-auto px-6 py-12 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The other list:{" "}
            <GradientText variant="teal">
              what Terminator&apos;s server returns
            </GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Once your client has spawned Terminator as a child process, it
            sends{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              initialize
            </code>
            {" "}then{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              tools/list
            </code>
            . The server&apos;s reply is the second meaning of{" "}
            <span className="italic">MCP server list</span>. Terminator&apos;s
            returns 31 entries. The names in the reply are the exact same
            strings in the{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              match tool_name
            </code>{" "}
            block at line 9953 of{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              server.rs
            </code>
            , because they are extracted from it at build time.
          </p>
          <AnimatedCodeBlock
            code={listToolsResponse}
            language="json"
            filename="response to tools/list (abridged)"
          />
        </section>

        {/* Bento: the 31 tools by group */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The 31 tools, grouped by what they unlock
          </h2>
          <p className="text-zinc-600 mb-8 max-w-3xl leading-relaxed">
            A server list is usually just names. Below the names: six real
            capability groups an LLM can mix inside a single{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            call.
          </p>
          <BentoGrid cards={toolGroupBento} />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <ProofBanner
            quote={'build.rs scans server.rs at compile time, collects every "tool_name" => match arm, and bakes the list into the binary via cargo:rustc-env=MCP_TOOLS. prompt.rs reads env!("MCP_TOOLS") so the system prompt, the dispatcher, and the tools/list response all read from the same source of truth.'}
            source="crates/terminator-mcp-agent/build.rs line 31"
            metric="31"
          />
        </section>

        {/* Verify */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Verifying the server&apos;s own list
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The authoritative answer to {'"'}what does this MCP server
            expose{'"'} is the JSON-RPC reply to{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              tools/list
            </code>
            . Two ways to see it without writing a client:
          </p>
          <TerminalOutput title="inspect the list a server returns" lines={verifyTerminal} />
        </section>

        {/* Metric counters */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <h3 className="text-xl font-semibold text-zinc-800 mb-6">
              Two numbers that anchor this page
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlowCard>
                <div className="p-6">
                  <div className="text-5xl font-mono font-bold text-orange-600">
                    <NumberTicker value={12} />
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    MCP client paths encoded in{" "}
                    <code className="font-mono text-xs text-orange-600">
                      config.js
                    </code>{" "}
                    clientPaths (including two command-target exceptions for
                    VS Code)
                  </div>
                </div>
              </GlowCard>
              <GlowCard>
                <div className="p-6">
                  <div className="text-5xl font-mono font-bold text-orange-600">
                    <NumberTicker value={31} />
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    Tools Terminator&apos;s server returns to{" "}
                    <code className="font-mono text-xs text-orange-600">
                      tools/list
                    </code>
                    , generated at compile time from the dispatch match block
                  </div>
                </div>
              </GlowCard>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            Directory vs. disk, side by side
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            If you came here from the top SERP results, you were probably
            looking at a directory of third-party servers. This table is why
            your local list is a different thing, and why the Terminator
            installer handles both senses of the phrase.
          </p>
          <ComparisonTable
            productName="On-disk MCP server list (Terminator installer)"
            competitorName="Online directory of MCP servers"
            rows={comparisonRows}
          />
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <FaqSection items={faqs} heading="Questions about MCP server lists" />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <InlineCta
            heading="Add Terminator to whichever list you use"
            body="One command, twelve clients. The installer knows the path, writes the file, or shells out to VS Code. You get 31 desktop-automation tools in your MCP list."
            linkText="Install from GitHub"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>
      </article>
    </div>
  );
}
