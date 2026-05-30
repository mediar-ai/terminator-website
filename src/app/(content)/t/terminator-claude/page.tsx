import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  TerminalOutput,
  CodeComparison,
  SequenceDiagram,
  HorizontalStepper,
  IntegrationsGrid,
  ShineBorder,
  TextShimmer,
  TypingAnimation,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/terminator-claude";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-11";
const TITLE =
  "Terminator + Claude: the two install paths nobody distinguishes (Claude Code vs Claude Desktop)";
const DESCRIPTION =
  "There are two ways to wire Terminator into Claude: claude mcp add for Claude Code, and editing claude_desktop_config.json for Claude Desktop. Most guides only show the first one. Sourced from crates/terminator-mcp-agent/config.js: 12 supported MCP clients with exact config paths, with Claude as the default fallback.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Claude Code installs Terminator via a CLI call. Claude Desktop installs it via a JSON file at a platform-specific path. Same MCP server, two wire-ups. This page shows both, plus the 10 other clients the installer supports out of the box.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator + Claude: two install paths, one MCP server",
    description:
      "claude mcp add for Claude Code. claude_desktop_config.json for Claude Desktop. Both wire Terminator's 35 MCP tools into the model. config.js:107 makes Claude the default.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Terminator + Claude" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Terminator + Claude", url: PAGE_URL },
];

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Terminator MCP agent",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Windows, macOS",
  description:
    "Open-source MCP server that gives Claude (Claude Code and Claude Desktop) 35 accessibility-API-backed tools to click, type, and drive real Windows and macOS apps, resolving selectors against the OS accessibility tree instead of screenshots.",
  url: PAGE_URL,
  downloadUrl: "https://www.npmjs.com/package/terminator-mcp-agent",
  softwareHelp: "https://github.com/mediar-ai/terminator",
  license: "https://github.com/mediar-ai/terminator/blob/main/LICENSE",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  author: { "@type": "Person", name: "Matthew Diakonov", url: "https://m13v.com" },
  publisher: { "@type": "Organization", name: "Terminator", url: "https://t8r.tech" },
};

const claudeCodeInstall = `# 1. Add the Terminator MCP server to Claude Code
claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# 2. Verify the server is registered
claude mcp list

# 3. Start a session. Terminator's 35 tools are now callable.
claude

# That's the whole install. No JSON. The CLI writes
# to ~/.claude.json (user scope) under "mcpServers".`;

const claudeDesktopInstall = `// Open Settings -> Developer -> "Edit Config" in Claude Desktop,
// or open the file directly:
//
//   Windows: %APPDATA%\\Claude\\claude_desktop_config.json
//   macOS:   ~/Library/Application Support/Claude/claude_desktop_config.json
//
// Add Terminator under mcpServers, save, restart Claude Desktop.

{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"],
      "env": {
        "LOG_LEVEL": "info",
        "RUST_BACKTRACE": "1"
      }
    }
  }
}`;

const installerOutput = [
  { type: "command" as const, text: "npx -y terminator-mcp-agent@latest --add-to-app" },
  { type: "info" as const, text: "Select MCP client (default: claude)" },
  { type: "output" as const, text: "1) cursor      Cursor" },
  { type: "output" as const, text: "2) claude      Claude  (default)" },
  { type: "output" as const, text: "3) vscode      VS Code" },
  { type: "output" as const, text: "4) insiders    VS Code Insiders" },
  { type: "output" as const, text: "5) windsurf    Windsurf" },
  { type: "output" as const, text: "6) cline       Cline" },
  { type: "output" as const, text: "7) roocode     RooCode" },
  { type: "output" as const, text: "8) witsy       Witsy" },
  { type: "output" as const, text: "9) enconvo     Enconvo" },
  { type: "output" as const, text: "10) boltai      BoltAI" },
  { type: "output" as const, text: "11) amazon-bedrock  Amazon Bedrock" },
  { type: "output" as const, text: "12) amazonq     Amazon Q" },
  { type: "command" as const, text: "> [Enter] (accept default: claude)" },
  { type: "info" as const, text: "Writing /Users/you/Library/Application Support/Claude/claude_desktop_config.json" },
  { type: "success" as const, text: "Merged terminator-mcp-agent into mcpServers" },
  { type: "info" as const, text: "Restart Claude Desktop to load the server." },
];

const verifyOutput = [
  { type: "command" as const, text: "# After installing, verify Claude actually sees the server" },
  { type: "command" as const, text: "claude mcp list" },
  { type: "output" as const, text: "terminator: npx -y terminator-mcp-agent@latest" },
  { type: "command" as const, text: "# In a Claude Code session, list the exposed tools" },
  { type: "command" as const, text: "claude" },
  { type: "output" as const, text: "user> what mcp tools are available from terminator?" },
  { type: "info" as const, text: "Claude inspects the MCP server and lists 35 tools" },
  { type: "output" as const, text: "  open_application, click_element, type_into_element," },
  { type: "output" as const, text: "  press_key, get_window_tree, capture_screenshot," },
  { type: "output" as const, text: "  execute_sequence, run_command, ... (29 more)" },
  { type: "command" as const, text: "# Drive a real app to confirm the round trip" },
  { type: "output" as const, text: "user> open Notepad and type \"hello from claude\"" },
  { type: "success" as const, text: "Claude calls open_application then type_into_element" },
  { type: "success" as const, text: "Window receives keystrokes via UIA TextPattern" },
];

const integrations = [
  {
    name: "Claude Code",
    initial: "CC",
    description: "claude mcp add CLI. Writes to ~/.claude.json.",
  },
  {
    name: "Claude Desktop",
    initial: "CD",
    description: "claude_desktop_config.json. Default in --add-to-app.",
  },
  {
    name: "Cursor",
    initial: "Cu",
    description: "~/.cursor/mcp.json. Has a deeplink install URL.",
  },
  {
    name: "VS Code",
    initial: "VS",
    description: "Uses the `code --add-mcp` CLI, not a file.",
  },
  {
    name: "VS Code Insiders",
    initial: "VI",
    description: "Same as VS Code, via `code-insiders --add-mcp`.",
  },
  {
    name: "Windsurf",
    initial: "Wi",
    description: "~/.codeium/windsurf/mcp_config.json.",
  },
  {
    name: "Cline",
    initial: "Cl",
    description: "VS Code globalStorage path under saoudrizwan.claude-dev.",
  },
  {
    name: "RooCode",
    initial: "Ro",
    description: "VS Code globalStorage under rooveterinaryinc.roo-cline.",
  },
  {
    name: "Witsy",
    initial: "Wt",
    description: "Application Support/Witsy/settings.json.",
  },
  {
    name: "Enconvo",
    initial: "En",
    description: "~/.config/enconvo/mcp_config.json.",
  },
  {
    name: "BoltAI",
    initial: "Bo",
    description: "~/.boltai/mcp.json.",
  },
  {
    name: "Amazon Q / Bedrock",
    initial: "AQ",
    description: "~/.aws/amazonq/mcp.json or Amazon Bedrock Client/mcp_config.json.",
  },
];

const stepperSteps = [
  {
    title: "Pick which Claude you're using",
    description:
      "Claude Code (the terminal CLI) and Claude Desktop (the GUI app from claude.ai) read MCP servers from different places. Pick one before you copy any command. Both work; the install paths are different.",
  },
  {
    title: "Wire the server",
    description:
      "Claude Code: run `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`. Claude Desktop: edit claude_desktop_config.json and add the mcpServers block. The installer can do the JSON edit for you with `npx -y terminator-mcp-agent@latest --add-to-app`.",
  },
  {
    title: "Restart the client",
    description:
      "Claude Code picks up the new server on the next `claude` invocation. Claude Desktop needs a quit-and-relaunch from the system tray (Windows) or the dock menu (macOS) so the renderer process re-reads the config file.",
  },
  {
    title: "Confirm the 35 tools are visible",
    description:
      "Ask Claude what tools it can see from the terminator server. You should get back open_application, click_element, type_into_element, press_key, get_window_tree, capture_screenshot, execute_sequence, run_command, and 27 more. If you only see a few or get nothing, the server failed to start; check the MCP logs path below.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Does Terminator only work with Claude, or can other models drive it too?",
    a: "Terminator's MCP agent is a standard Model Context Protocol server, so any MCP-aware client can call it. The package handles 12 named clients in its `--add-to-app` installer (Cursor, Claude Desktop, VS Code, VS Code Insiders, Windsurf, Cline, RooCode, Witsy, Enconvo, BoltAI, Amazon Bedrock, Amazon Q) and Claude Code is a 13th via the `claude mcp add` CLI. Anything else that speaks MCP can point at the same `npx -y terminator-mcp-agent@latest` command and use the 35 tools without changes.",
  },
  {
    q: "What's the actual difference between Claude Code and Claude Desktop for this?",
    a: "Claude Code is Anthropic's terminal CLI: you install it with `npm install -g @anthropic-ai/claude-code` and talk to it from your shell. It stores MCP servers in `~/.claude.json` and you add them with `claude mcp add`. Claude Desktop is the GUI app from claude.ai: it stores MCP servers in `claude_desktop_config.json` at a platform-specific path. Same MCP protocol, two different config surfaces. Terminator's installer covers both; the one-liner you see everywhere only covers the first.",
  },
  {
    q: "Where exactly does claude_desktop_config.json live on each OS?",
    a: "Windows: `%APPDATA%\\Claude\\claude_desktop_config.json` (usually `C:\\Users\\<you>\\AppData\\Roaming\\Claude\\claude_desktop_config.json`). macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`. Linux: `~/.config/Claude/claude_desktop_config.json`. These paths are built from `os.homedir()` and `process.env.APPDATA` inside `crates/terminator-mcp-agent/config.js` lines 25 through 46. The file is JSON, the merge is shallow on `mcpServers`, and the installer creates the parent directory if it doesn't exist.",
  },
  {
    q: "Why is Claude the default in the `--add-to-app` installer?",
    a: "Line 107 of `config.js`: `const normalizedClient = client ? client.toLowerCase() : \"claude\";`. If you run the installer without specifying a client, it falls back to Claude Desktop. The reason is historical: Claude Desktop was the first MCP-enabled chat app to ship, so the installer was written against it first, and the default never moved. Practically it means a developer who runs `npx -y terminator-mcp-agent@latest --add-to-app` and presses Enter ends up with a working Claude Desktop install.",
  },
  {
    q: "What does Terminator give Claude that Anthropic's built-in computer-use tool doesn't?",
    a: "Anthropic's `computer_20251022` tool is a screenshot-in, pixel-coordinate-out loop: every action costs a vision round trip and an Anthropic API call. Terminator exposes 35 selector-based tools so Claude can click by accessibility role and name (`role:Button && name:Save`), resolved against the OS accessibility tree locally. Latency drops from hundreds of milliseconds per click to single-digit milliseconds. The tradeoff is that Terminator only works on apps that expose accessibility data, which on Windows is almost everything via UI Automation, and on macOS is most native apps via AXUIElement.",
  },
  {
    q: "Where do the MCP server logs live so I can debug a failed Claude session?",
    a: "Windows: `%LOCALAPPDATA%\\claude-cli-nodejs\\Cache\\<encoded-project-path>\\mcp-logs-terminator-mcp-agent\\*.txt`. macOS/Linux: `~/.local/share/claude-cli-nodejs/Cache/<encoded-project-path>/mcp-logs-terminator-mcp-agent/*.txt`. The `<encoded-project-path>` segment is your current working directory with slashes percent-encoded. To enable verbose logging, set `LOG_LEVEL=debug` and `RUST_BACKTRACE=1` in the server's env block in `claude_desktop_config.json` (or the equivalent in Claude Code's `~/.claude.json`).",
  },
  {
    q: "Will the install touch other MCP servers I already have configured?",
    a: "The merge is shallow on the `mcpServers` object: existing servers are preserved, and `terminator-mcp-agent` is added or overwritten as a single key. See `writeConfigFile` in `config.js` lines 217 through 251: the existing config is read, spread into `mergedConfig`, and the new config is spread on top. Anything you have under `globalShortcut` or other top-level keys is untouched. If you want to remove Terminator later, delete the `terminator-mcp-agent` key from `mcpServers` and restart the client.",
  },
  {
    q: "What platforms does the install actually run on?",
    a: "Node 18 or newer for the npx invocation. The runtime currently ships Windows binaries through the `terminator-mcp-win32-x64-msvc` and `terminator-mcp-win32-arm64-msvc` optional dependencies in the npm package. macOS support exists at the core Rust level via AXUIElement and is exposed through `app.mediar.ai`; Linux uses AT-SPI2 and is wired through the same MCP interface. Claude Code runs everywhere Node runs; Claude Desktop runs on Windows and macOS. The same `npx -y terminator-mcp-agent@latest` command works for all clients on all supported platforms, the installer detects the OS at runtime.",
  },
  {
    q: "Can I run Terminator's MCP server over HTTP instead of stdio?",
    a: "Yes. The agent accepts `-t http` to switch from stdio to an HTTP transport, then exposes `POST /mcp` for tool calls, `GET /health` as a liveness check, and `GET /status` as a busy probe (200 idle, 503 busy). Concurrency is `MCP_MAX_CONCURRENT` (default 1). This is how the `remote-mcp` skill in the Terminator repo lets Claude drive a remote VM: the VM runs the agent in HTTP mode, Claude on your laptop calls `terminator mcp exec --url http://<vm-ip>:8080/mcp <tool> '<json>'`, and the tool runs on the VM. Set `MCP_AUTH_TOKEN` to require a bearer token.",
  },
  {
    q: "What's the smallest workflow that proves the install is working?",
    a: "After wiring the MCP server, start Claude (Code or Desktop) and say: \"open Notepad and type 'hello from claude'\". Claude should issue two tool calls: `open_application` with `{\"app_name\": \"notepad\"}`, then `type_into_element` with a selector like `role:Document` or `role:Edit` and the text. If you see those two calls and the text shows up in the Notepad window, the round trip is healthy. If Claude says it doesn't have the tools, the server didn't load; check the MCP log directory above.",
  },
];

const installSequenceMessages = [
  { from: 0, to: 1, label: "claude mcp add terminator", type: "request" as const },
  { from: 1, to: 2, label: "spawn 'npx -y terminator-mcp-agent@latest'", type: "request" as const },
  { from: 2, to: 1, label: "MCP server up on stdio", type: "response" as const },
  { from: 1, to: 0, label: "registered in ~/.claude.json", type: "response" as const },
  { from: 0, to: 1, label: "user: open Notepad and type hi", type: "event" as const },
  { from: 1, to: 2, label: "tool call: open_application", type: "request" as const },
  { from: 2, to: 3, label: "UIA: ShellExecute('notepad.exe')", type: "request" as const },
  { from: 3, to: 2, label: "window handle + pid", type: "response" as const },
  { from: 2, to: 1, label: "{status: ok, pid: 4920}", type: "response" as const },
  { from: 1, to: 2, label: "tool call: type_into_element", type: "request" as const },
  { from: 2, to: 3, label: "TextPattern.SetValue('hi')", type: "request" as const },
  { from: 3, to: 2, label: "ack", type: "response" as const },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude desktop automation: one MCP call that runs the whole workflow",
    href: "/t/claude-desktop-automation",
    excerpt:
      "execute_sequence compiles a whole typed workflow into one MCP call so Claude is at the bookends, not in the inner loop.",
    tag: "Workflows",
  },
  {
    title: "Claude computer use: the pixel-coordinate loop and the selector alternative",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer-use tool sends screenshots and gets pixels back. Terminator's MCP lets Claude click by role and name instead.",
    tag: "Comparison",
  },
  {
    title: "The Claude Code MCP server that treats your context window as a budget",
    href: "/t/claude-code-mcp-server",
    excerpt:
      "Wiring an MCP server is easy. Surviving a real desktop task without burning context is the hard part. One execute_sequence call instead of 20.",
    tag: "Claude Code",
  },
  {
    title: "Claude skills for desktop automation: the two that ship inside Terminator",
    href: "/t/claude-skills-for-desktop-automation",
    excerpt:
      "Two skill.md files under .claude/skills/ pair Anthropic's skill format with a 35-tool MCP server.",
    tag: "Skills",
  },
  {
    title: "Claude Opus 4.7 desktop automation: why fewer tool calls changes the shape",
    href: "/t/claude-opus-4-7-desktop-automation",
    excerpt:
      "Opus 4.7 reasons more and clicks less by default. That pulls desktop automation toward compiled workflows.",
    tag: "Models",
  },
  {
    title: "Browser MCP to desktop automation: where the boundary actually is",
    href: "/t/browser-mcp-to-desktop-automation",
    excerpt:
      "Playwright MCP stops at the browser viewport. Terminator picks up the rest of the OS.",
    tag: "Architecture",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <TypingAnimation
              text="terminator + claude"
              duration={120}
              className="font-mono"
            />
          </div>
          <h1 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Terminator + Claude: the two install paths nobody distinguishes.
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            Almost every guide that comes up for this topic shows one command:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              claude mcp add terminator
            </code>
            . That command only covers Claude Code. If you opened the desktop
            app from <span className="font-medium">claude.ai</span> and tried the
            same incantation, nothing happened. There are{" "}
            <TextShimmer>two distinct install paths</TextShimmer>
            , and the installer that ships in this repo handles{" "}
            <span className="font-medium">twelve clients</span> in total.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              claude mcp add
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              claude_desktop_config.json
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              35 MCP tools
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MIT
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <section className="max-w-4xl mx-auto px-6 mt-10">
          <ShineBorder color="#FF3E00" borderRadius={20}>
            <div className="p-6 md:p-8 bg-white">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
                Direct answer (verified 2026-05-11)
              </p>
              <p className="text-lg text-zinc-900 leading-relaxed">
                Terminator gives Claude the ability to drive real desktop apps
                by exposing 35 accessibility-API-backed tools through a Model
                Context Protocol server. There are two install paths.{" "}
                <span className="font-semibold">Claude Code:</span>{" "}
                <code className="font-mono text-[0.92em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
                </code>
                .{" "}
                <span className="font-semibold">Claude Desktop:</span> add the{" "}
                <code className="font-mono text-[0.92em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  mcpServers
                </code>{" "}
                block to{" "}
                <code className="font-mono text-[0.92em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  claude_desktop_config.json
                </code>{" "}
                (path varies by OS, see the next section).
              </p>
              <p className="mt-3 text-sm text-zinc-500">
                Verified against the install code in{" "}
                <a
                  href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/config.js"
                  className="text-orange-600 hover:underline"
                >
                  crates/terminator-mcp-agent/config.js
                </a>{" "}
                and the project README. Both paths terminate at the same{" "}
                <code className="font-mono text-[0.9em]">terminator-mcp-agent</code>{" "}
                process speaking MCP over stdio.
              </p>
            </div>
          </ShineBorder>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Path 1: Claude Code (the terminal CLI)
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Claude Code is the CLI you install from npm as{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              @anthropic-ai/claude-code
            </code>
            . It stores MCP servers in <code className="font-mono">~/.claude.json</code>{" "}
            and ships a subcommand for adding them, so you never touch the file
            by hand. One line wires Terminator in. The <code className="font-mono">-s user</code> flag installs at user
            scope, which means every project on the machine sees the server,
            not just the project you happened to be in when you ran the
            command.
          </p>
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-xs font-mono text-zinc-400">
                shell: claude-code-install
              </span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{claudeCodeInstall}</code>
            </pre>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Path 2: Claude Desktop (the chat app from claude.ai)
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Claude Desktop is the GUI app you download from Anthropic. It loads
            MCP servers from a JSON file at startup. There is no{" "}
            <code className="font-mono">claude mcp add</code> equivalent inside
            the app, so you either edit the file by hand or let Terminator&apos;s
            installer write it for you. The exact path depends on the OS, and
            this is the bit no other write-up makes explicit:
          </p>
          <ul className="mt-5 space-y-2 text-zinc-700 leading-relaxed">
            <li>
              <span className="font-semibold text-zinc-900">Windows:</span>{" "}
              <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                %APPDATA%\Claude\claude_desktop_config.json
              </code>
            </li>
            <li>
              <span className="font-semibold text-zinc-900">macOS:</span>{" "}
              <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                ~/Library/Application Support/Claude/claude_desktop_config.json
              </code>
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Linux:</span>{" "}
              <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                ~/.config/Claude/claude_desktop_config.json
              </code>
            </li>
          </ul>
          <p className="mt-5 text-sm text-zinc-500">
            Those paths come from <code className="font-mono">platformPaths</code> at lines 25 through 46 of{" "}
            <code className="font-mono">crates/terminator-mcp-agent/config.js</code>. The directory may not exist
            yet; the installer creates it on first run.
          </p>
          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-xs font-mono text-zinc-400">
                claude_desktop_config.json
              </span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{claudeDesktopInstall}</code>
            </pre>
          </div>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            Or, if you would rather not touch the JSON, the installer can do it
            for you and pick up the right path on your OS. Press Enter at the
            prompt and Claude Desktop is the default selection.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <TerminalOutput
            lines={installerOutput}
            title="npx -y terminator-mcp-agent@latest --add-to-app"
          />
          <p className="mt-4 text-sm text-zinc-500">
            From <code className="font-mono">supportedClients</code> at lines 260
            through 273 of <code className="font-mono">config.js</code>. Claude
            is the default fallback in <code className="font-mono">getConfigPath</code>
            : if you pass no argument, line 107 normalises the client to{" "}
            <code className="font-mono">&quot;claude&quot;</code>.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What ends up on the wire
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both install paths boot the same{" "}
            <code className="font-mono">terminator-mcp-agent</code> process. The
            client speaks MCP over stdio (or HTTP, with{" "}
            <code className="font-mono">-t http</code>), and the agent dispatches
            each tool call into the platform&apos;s accessibility API. Here is the
            shape of a single user request through the stack:
          </p>
          <SequenceDiagram
            title="claude_code -> mcp_agent -> os"
            actors={["You", "Claude", "MCP agent", "OS (UIA / AX)"]}
            messages={installSequenceMessages}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The point is that Claude itself doesn&apos;t know about UI Automation
            or AXUIElement. It calls a tool by name (one of the 35{" "}
            <code className="font-mono">#[tool(...)]</code> macros in{" "}
            <code className="font-mono">crates/terminator-mcp-agent/src/server.rs</code>
            ) with structured arguments, and the agent does the platform work.
            That is why the same install commands work whether you&apos;re on a
            Windows VM driving an installer or on macOS clicking through a
            native preference pane.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The two configs, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you have ever wired both Claude Code and Claude Desktop, you
            know the configs look almost identical at the{" "}
            <code className="font-mono">mcpServers</code> level but live in
            different files. Toggle below to see what each one writes.
          </p>
          <CodeComparison
            title="Same server, two config homes"
            leftLabel="Claude Code · ~/.claude.json"
            rightLabel="Claude Desktop · claude_desktop_config.json"
            leftLines={claudeCodeInstall.split("\n").length}
            rightLines={claudeDesktopInstall.split("\n").length}
            leftCode={claudeCodeInstall}
            rightCode={claudeDesktopInstall}
            reductionSuffix="cli vs json"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Walk it through
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four steps cover both paths. The two middle steps are where Claude
            Code and Claude Desktop diverge; the first and last steps are the
            same.
          </p>
          <HorizontalStepper steps={stepperSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Verify the round trip
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            After either install, the cheapest verification is to ask Claude
            what it can see, then drive a known app. Notepad is a safe target
            on Windows; TextEdit works the same way on macOS.
          </p>
          <TerminalOutput
            lines={verifyOutput}
            title="post-install smoke test"
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If the tool list comes back empty, the server didn&apos;t start. The
            MCP log directory is{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
              %LOCALAPPDATA%\claude-cli-nodejs\Cache\&lt;encoded-cwd&gt;\mcp-logs-terminator-mcp-agent\
            </code>{" "}
            on Windows, and the equivalent under{" "}
            <code className="font-mono">~/.local/share/claude-cli-nodejs/Cache/</code>{" "}
            on macOS and Linux. Tail the most recent{" "}
            <code className="font-mono">.txt</code> file there and you will see
            the startup banner, the MCP handshake, and the first tool dispatch.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What about the other 10 clients?
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Claude Code and Claude Desktop are the most common entry points,
            but the same MCP server installs into every major MCP-aware client.
            The installer writes to the appropriate config file or shells out
            to the client&apos;s own CLI (VS Code uses{" "}
            <code className="font-mono">code --add-mcp</code>; everything else
            edits JSON).
          </p>
          <IntegrationsGrid
            title="Every client the installer knows about"
            subtitle="Defined in clientPaths and supportedClients inside crates/terminator-mcp-agent/config.js"
            items={integrations}
            columns={3}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Why a separate install at all
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic already ships a first-party computer use tool (
            <code className="font-mono">computer_20251022</code>): screenshot
            in, pixel coordinates out, one Anthropic round trip per click. That
            works, but every click costs a vision pass and an API call. If you
            are running a 20-step workflow inside an enterprise app, that is
            twenty screenshots and twenty round trips and a lot of room for the
            model to pick a slightly wrong pixel and ruin the run.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s MCP server gives Claude a different set of hands. The
            tools resolve selectors like{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              role:Button &amp;&amp; name:Save
            </code>{" "}
            against the OS accessibility tree locally, in single-digit
            milliseconds, with no screenshot in flight. The model still
            reasons; it just doesn&apos;t have to look at pixels to act. That trade
            is what the second install path unlocks, and it is the reason this
            page exists: most write-ups stop at the one-liner and leave readers
            who are running Claude Desktop with no idea why nothing happened.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            section="terminator-claude-footer"
            heading="Wiring this into a real product?"
            description="If you are giving Claude desktop hands inside a customer-facing workflow, we can review your selector strategy, the failure modes you will hit, and whether the right tool here is the 35-tool MCP or one big execute_sequence call. Book 30 minutes with Matt."
          />
        </section>

        <FaqSection items={faqs} heading="Common questions" />

        <section className="max-w-4xl mx-auto px-6 my-16">
          <RelatedPostsGrid
            title="Adjacent reads"
            subtitle="Deeper dives on specific parts of the Claude + Terminator wiring."
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING_URL}
          site="Terminator"
          section="terminator-claude-sticky"
          description="30 min with Matt on giving Claude real desktop hands."
        />
      </article>
    </>
  );
}
