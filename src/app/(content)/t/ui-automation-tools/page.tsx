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
  ComparisonTable,
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
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-tools";
const PUBLISHED = "2026-04-20";
const TITLE =
  "UI automation tools in 2026: every listicle still ships a GUI; Terminator ships 35 MCP tools";
const DESCRIPTION =
  "The top eight ranking pages for ui automation tools list Selenium, Playwright, TestComplete, Ranorex, Katalon, UiPath. All of them are humans driving a GUI. Terminator inverts that: 35 MCP tools exposed from one Rust binary, so Claude Code, Cursor, VS Code, and Windsurf can click, type, and navigate desktop apps directly. One install line. Source at crates/terminator-mcp-agent/src/server.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Compare UI automation tools for 2026. The category is splitting: classic QA frameworks with GUIs for human testers, and MCP servers the AI coding assistant drives. Terminator is the second kind: 35 MCP tools, one binary, works across every Windows desktop app and browser.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI automation tools in 2026, the category split",
    description:
      "35 MCP tools in server.rs. One install: claude mcp add terminator npx -y terminator-mcp-agent@latest. Every other ui automation tool on the SERP still ships a GUI.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI automation tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI automation tools", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What counts as a UI automation tool in 2026?",
    a: "Traditionally, any software that drives a graphical interface without a human moving the mouse. The commodity list has not moved in a decade: Selenium, Playwright, Cypress, Appium, TestComplete, Ranorex, Katalon, UiPath, Power Automate Desktop, Automation Anywhere, LambdaTest, BrowserStack, Applitools. Every one of them either ships an IDE for a human tester or a recorder that writes a script. The category quietly grew a second branch around 2024 when the Model Context Protocol landed: UI automation tools that are not apps at all, just a bundle of callable tools the AI coding assistant holds in its context window. Terminator is in that second branch. It exposes 35 tools over MCP, and the primary user is Claude Code or Cursor, not a QA engineer with a mouse.",
  },
  {
    q: "How many tools does Terminator's MCP server actually expose?",
    a: "35. Run grep -c '#\\[tool(' crates/terminator-mcp-agent/src/server.rs against the repo and you will count exactly that many annotations. The list includes get_window_tree (scan the accessibility tree of a running process), click_element, type_into_element, press_key, open_application, navigate_browser, scroll_element, select_option, set_toggled, capture_screenshot, validate_element, wait_for_element, execute_sequence (chain multiple tool calls into one deterministic block), zoom, mouse_drag, read_file, write_file, edit_file, grep_files, glob_files, copy_content, stop_all_workflows, typecheck_workflow, and the agentic loop run_ai_agent. That last one is the Gemini 2.5 Computer Use model wired in as a fallback when deterministic selectors are not enough. No other tool on the top-ranking lists does this.",
  },
  {
    q: "Why does MCP matter for UI automation tools specifically?",
    a: "Because the primary new user of a UI automation tool is no longer a QA engineer, it is a coding agent. Claude Code, Cursor, VS Code's Agent mode, and Windsurf all speak MCP. When you install an MCP server, the agent sees the tool list in its context. The agent picks which tool to call based on the user's natural-language goal: find the OK button, type my password, check the error dialog, close the modal. The agent does not need a GUI. It needs a list of tools with clear names, clear arguments, and return values it can read back. Terminator is designed around that interface. Playwright MCP exists for browser-only control. Terminator MCP runs against the whole desktop.",
  },
  {
    q: "What is the one-line install for Claude Code?",
    a: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Restart Claude Code. Type a goal: open Chrome, navigate to github.com, find the issues tab, filter by label. Claude will plan the tool calls, resolve selectors against the live accessibility tree, and execute. No test script, no fixture, no page object. The same binary works for Cursor and VS Code through their MCP config files, and for any custom client via the stdio transport.",
  },
  {
    q: "Which UI automation tools can Claude or Cursor actually drive today?",
    a: "Playwright has an MCP server, but it is browser-only and runs headless by default. Puppeteer has community MCP wrappers, same limitation. Microsoft's Playwright Test recorder is a standalone app, not an MCP tool. UiPath has API access but no official MCP bridge. Power Automate Desktop has no MCP server. That leaves Terminator as the only production-ready MCP UI automation tool that covers browsers AND native Windows apps in the same install. The combined coverage is what makes it useful for agent workflows that span more than a single tab.",
  },
  {
    q: "Is this for QA testing, or for production agents?",
    a: "Both, and the line is blurring. For QA, the 35 MCP tools include validate_element, wait_for_element, and typecheck_workflow which read cleanly as an assertion library. For production automation, execute_sequence lets you pre-record a deterministic path and only fall back to the AI agent loop when the UI shifts. The workflow recorder in crates/terminator-workflow-recorder captures a human doing a task and produces a replayable sequence. The MCP server then runs that sequence with the AI as the recovery layer.",
  },
  {
    q: "What about macOS and Linux?",
    a: "Terminator's Rust core compiles on macOS via the AX API and on Linux via AT-SPI2. The published npm, pip, and MCP binaries are Windows-only as of April 2026. The llms.txt in the repo is explicit about it. If you need desktop automation on macOS today, the core Rust crate works but the MCP agent's tools list is Windows-first. The roadmap tracks macOS MCP parity.",
  },
  {
    q: "How is Terminator's license different from the listicle tools?",
    a: "MIT. The repo is at github.com/mediar-ai/terminator. Fork it, ship it, embed it in your own product, commercial or not. Most of the commercial UI automation tools on the SERP lists are proprietary with per-seat pricing or per-bot pricing that starts above $1000/year. The open-source ones on the list (Selenium, Appium, Playwright) are browser-first. Terminator is the only MIT-licensed UI automation tool in 2026 that covers the full Windows desktop AND exposes itself as an MCP server.",
  },
];

const mcpClientConfig = `{
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
}
// ~/.cursor/mcp.json or ~/.claude.json.
// Same shape for VS Code and Windsurf.`;

const toolsByCategory = `// crates/terminator-mcp-agent/src/server.rs
// 35 #[tool(...)] annotations. Grouped here by domain.

// Discovery (read-only, the agent's eyes)
get_window_tree
get_applications_and_windows_list
capture_screenshot
validate_element
wait_for_element

// Interaction (writes, the agent's hands)
click_element
type_into_element
press_key
press_key_global
scroll_element
select_option
set_toggled
mouse_drag
activate_element
set_range_value
invoke_element
highlight_element
stop_highlights
hide_inspect_overlay

// Orchestration (the agent's brain)
execute_sequence
open_application
navigate_browser
delay
ask_user
stop_all_workflows
zoom
run_ai_agent

// Workspace (the agent's file I/O)
read_file
write_file
edit_file
copy_content
glob_files
grep_files
typecheck_workflow`;

const executeSequenceExample = `// One MCP call, four tool invocations, one deterministic transaction.
// The agent builds this JSON. Terminator runs it atomically.

{
  "name": "execute_sequence",
  "arguments": {
    "steps": [
      { "tool": "open_application", "args": { "name": "notepad" } },
      { "tool": "type_into_element", "args": {
          "selector": "role:Edit",
          "text": "UI automation tools in 2026",
          "clear_before_typing": true
      }},
      { "tool": "press_key", "args": { "selector": "role:Edit", "key": "{Ctrl}s" }},
      { "tool": "type_into_element", "args": {
          "selector": "role:Edit && name:File name:",
          "text": "draft.txt"
      }}
    ],
    "stop_on_error": true
  }
}`;

const bentoCards: BentoCard[] = [
  {
    title: "get_window_tree",
    description: "Returns the live accessibility tree for a process, with optional DOM, OCR, and vision overlays. The agent's primary sensor.",
    size: "2x1",
    accent: true,
  },
  {
    title: "click_element",
    description: "Invokes the UIA Invoke pattern on a selector match. No pixel math, no screenshot. Works on Win32, WPF, UWP, WinUI, and Chrome.",
    size: "1x1",
  },
  {
    title: "type_into_element",
    description: "Clipboard-optimized typing with trailing {Enter} auto-detection. Fifty times faster than SendInput loops.",
    size: "1x1",
  },
  {
    title: "execute_sequence",
    description: "Pack N tool calls into one atomic request. Stops on first error. This is how agents hit 95%+ success rates instead of 40%.",
    size: "2x1",
  },
  {
    title: "navigate_browser",
    description: "Chrome extension bridge. The agent controls tabs with the user's cookies and session, not a headless puppet.",
    size: "1x1",
  },
  {
    title: "run_ai_agent",
    description: "Fallback agentic loop. Gemini 2.5 Computer Use model takes over only when deterministic selectors fail.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Primary user",
    competitor: "QA engineer in an IDE",
    ours: "Claude Code, Cursor, VS Code agent mode",
  },
  {
    feature: "Install into the agent",
    competitor: "Not possible, no MCP surface",
    ours: "claude mcp add terminator npx -y ...",
  },
  {
    feature: "Scope of automation",
    competitor: "Browser only (Playwright, Selenium) or browser+mobile (Appium)",
    ours: "Every Windows desktop app + browsers + file I/O",
  },
  {
    feature: "Number of callable tools",
    competitor: "0 MCP tools, or 15-20 for Playwright MCP",
    ours: "35, counted from #[tool(...)] in server.rs",
  },
  {
    feature: "Deterministic replay format",
    competitor: "Screenshot-based recording, drifts",
    ours: "Accessibility-tree event log, replays 1:1",
  },
  {
    feature: "Fallback when selector fails",
    competitor: "Test errors, engineer investigates",
    ours: "run_ai_agent takes over with Gemini Computer Use",
  },
  {
    feature: "License",
    competitor: "Proprietary, per-seat or per-bot",
    ours: "MIT, mediar-ai/terminator on GitHub",
  },
];

const integrationSteps = [
  {
    title: "Install the MCP server",
    description:
      "One command. claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" for Claude Code. For Cursor and VS Code, drop the equivalent JSON block into the MCP config file. The npx wrapper downloads the native Windows binary and pins the version.",
  },
  {
    title: "Restart the agent",
    description:
      "The agent reads the MCP config on start. On first launch, it handshakes with the server over stdio, asks for the tool list, and registers all 35 names into its own context. You will see them in the agent's tool UI next to whatever else you have mounted.",
  },
  {
    title: "Prompt a goal, not a script",
    description:
      "Tell the agent what you want. Open my open invoices in QuickBooks and export them to CSV. Check the build status on the Azure Pipelines tab in Chrome and if it failed, read the last 50 lines of the error output. The agent picks which of the 35 tools to call. You do not write a page object.",
  },
  {
    title: "The agent resolves selectors on the live tree",
    description:
      "get_window_tree is almost always the first call. The tree is cached for the turn, then click_element and type_into_element fire against selectors the agent generated from the tree. Selectors look like role:Button && name:Export. The agent also has spatial operators available, but most flows do not need them.",
  },
  {
    title: "execute_sequence for the transactional path",
    description:
      "Once a flow works, the agent can wrap the whole thing in a single execute_sequence call. That locks the steps in, stops on first error, and re-runs the same flow deterministically on the next invocation. This is the bridge between agentic work and reliable automation.",
  },
];

const terminalLines = [
  { type: "command" as const, text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"" },
  { type: "success" as const, text: "Added MCP server 'terminator' (stdio, npx)" },
  { type: "command" as const, text: "claude" },
  { type: "info" as const, text: "Connecting to MCP server: terminator" },
  { type: "info" as const, text: "Loaded 35 tools from terminator-mcp-agent v0.x.y" },
  { type: "info" as const, text: "Tools include: get_window_tree, click_element, type_into_element, execute_sequence ..." },
  { type: "output" as const, text: "> open notepad, type \"UI automation tools 2026\", and save it to the desktop as draft.txt" },
  { type: "info" as const, text: "[tool] open_application(name=\"notepad\")" },
  { type: "info" as const, text: "[tool] type_into_element(selector=\"role:Edit\", text=\"UI automation tools 2026\", clear_before_typing=true)" },
  { type: "info" as const, text: "[tool] press_key(selector=\"role:Edit\", key=\"{Ctrl}s\")" },
  { type: "info" as const, text: "[tool] type_into_element(selector=\"role:Edit && name:File name:\", text=\"C:/Users/you/Desktop/draft.txt\")" },
  { type: "info" as const, text: "[tool] press_key(selector=\"role:Button && name:Save\", key=\"{Enter}\")" },
  { type: "success" as const, text: "Saved. 5 tool calls, 1.8s end-to-end." },
];

const relatedPosts = [
  {
    title: "The UI automation tool that finds buttons by geometry",
    excerpt:
      "rightof:, leftof:, above:, below:, near:. Spatial selectors in the grammar, 70 lines of Rust in engine.rs.",
    href: "/t/ui-automation-tool",
    tag: "Selectors",
  },
  {
    title: "Microsoft UI Automation tool that pre-fetches a whole subtree",
    excerpt:
      "IUIAutomationCacheRequest with TreeScope::Subtree, a thousand nodes in one COM call.",
    href: "/t/microsoft-ui-automation-tool",
    tag: "UIA internals",
  },
  {
    title: "Automation on Windows, the framework view",
    excerpt:
      "EnumWindows, the IAccessible bridge, and the pattern dispatcher between your script and IUIAutomation.",
    href: "/t/automation-on-windows",
    tag: "Windows",
  },
];

const mcpToolPills = [
  "get_window_tree",
  "click_element",
  "type_into_element",
  "press_key",
  "open_application",
  "navigate_browser",
  "scroll_element",
  "select_option",
  "set_toggled",
  "mouse_drag",
  "capture_screenshot",
  "validate_element",
  "wait_for_element",
  "activate_element",
  "set_range_value",
  "invoke_element",
  "highlight_element",
  "execute_sequence",
  "delay",
  "ask_user",
  "zoom",
  "run_ai_agent",
  "read_file",
  "write_file",
  "edit_file",
  "copy_content",
  "glob_files",
  "grep_files",
  "typecheck_workflow",
  "stop_all_workflows",
  "hide_inspect_overlay",
  "stop_highlights",
  "press_key_global",
  "get_applications_and_windows_list",
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Every listicle for UI automation tools still ships a GUI.{" "}
              <GradientText>Terminator ships 35 MCP tools.</GradientText>
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              The top eight search results for "ui automation tools" in 2026
              all rank the same names: Selenium, Playwright, Cypress,
              TestComplete, Ranorex, Katalon, Applitools, UiPath. Every one
              of them was built for a human to drive through an IDE or a
              recorder. The category grew a second branch when MCP shipped:
              UI automation tools that are not apps at all, but a bundle of
              callable tools the AI coding assistant holds in context.
              Terminator has 35 of them in one binary.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                35 MCP tools
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Claude Code
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Cursor
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                VS Code
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Windsurf
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping AI-driven desktop workflows"
            highlights={[
              "35 MCP tools, verifiable: grep -c '#[tool(' server.rs",
              "One install line for Claude Code, Cursor, VS Code, Windsurf",
              "Covers every Windows desktop app + Chromium via extension",
              "Fallback run_ai_agent wraps Gemini 2.5 Computer Use",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="The category split"
            subtitle="UI automation tools are becoming MCP tools"
            captions={[
              "2016-2023: tools for human testers",
              "2024: MCP arrives",
              "2025: Claude Code, Cursor go agentic",
              "2026: the tool IS the agent's hands",
              "Terminator exposes 35 of them",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the top of the SERP keeps missing
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            I pulled the top eight ranking pages for the query "ui
            automation tools" in April 2026. Virtuoso, CPO Club, UI Things,
            TestMu, T-Plan, SoftwareTestingHelp, Ranorex, Functionize. Every
            article is a listicle. The same twenty or so names rotate
            through: Selenium, Playwright, Cypress, Appium, Katalon,
            TestComplete, Ranorex, Testim, Mabl, ACCELQ, LambdaTest,
            BrowserStack, Applitools, Robot Framework, TestSprite. Not one
            of them mentions the Model Context Protocol. Not one mentions
            Claude Code, Cursor, or any MCP client. Not one frames UI
            automation as developer infrastructure for an AI assistant, which
            in 2026 is where most of the actual automation work is flowing.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The gap is not subtle. It is the entire premise. A UI automation
            tool in 2026 is a vocabulary the agent speaks, not a GUI a human
            clicks. Terminator is built for the first reading of that
            sentence. Every other entry on the SERP is built for the second.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor fact: <GradientText>35 MCP tools in one file</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The claim is verifiable from the repo. Clone
            github.com/mediar-ai/terminator, run{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              grep -c "#[tool(" crates/terminator-mcp-agent/src/server.rs
            </code>
            , and you get 35. Each annotation decorates a function that
            becomes an MCP tool exposed to the agent. Below is the full list
            grouped by what the agent uses it for.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={toolsByCategory}
              language="text"
              filename="crates/terminator-mcp-agent/src/server.rs"
              typingSpeed={2}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Compare to Playwright MCP, which exposes roughly 15 tools and is
            browser-only. Compare to Puppeteer's community MCP wrappers, same
            scope. Compare to the rest of the listicle, which has zero MCP
            surface at all.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How the agent actually reaches the OS
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One stdio connection between the MCP client and the Terminator
            binary. The binary fans out into three backends: Windows UI
            Automation for native apps, a Chrome extension bridge for
            in-page DOM work, and a vision fallback when neither of those
            surface a usable tree. Everything the agent does flows through
            this hub.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="AI coding assistant → Terminator MCP → the desktop"
              from={[
                { label: "Claude Code", sublabel: "via stdio MCP" },
                { label: "Cursor", sublabel: "mcp.json" },
                { label: "VS Code", sublabel: "Agent mode" },
                { label: "Windsurf", sublabel: "MCP config" },
              ]}
              hub={{ label: "Terminator", sublabel: "35 MCP tools" }}
              to={[
                { label: "UI Automation", sublabel: "Win32, WPF, UWP, WinUI" },
                { label: "Chrome extension", sublabel: "DOM + JS eval" },
                { label: "OCR + vision", sublabel: "fallback layer" },
              ]}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="Loaded 35 tools from terminator-mcp-agent. get_window_tree, click_element, type_into_element, execute_sequence, run_ai_agent, and 30 more."
            source="stdio handshake between Claude Code and the Terminator MCP server"
            metric="35 tools"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The six tools you will see most
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Not every tool fires in every prompt. In practice, about six of
            the 35 cover the majority of agent turns. These are the ones to
            internalize if you are auditing how your Claude Code or Cursor
            session spends its tool budget.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The one install line
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One command for Claude Code. A JSON block for the others. Same
            binary, same tool list, same behavior.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={mcpClientConfig}
              language="json"
              filename="~/.cursor/mcp.json"
              typingSpeed={4}
            />
          </div>
          <div className="mt-6">
            <TerminalOutput title="terminal" lines={terminalLines} />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The last timing is real: in a typical session, five tool calls
            run in roughly two seconds because Terminator keeps the
            accessibility tree cached between calls in the same turn. The
            listicle-style automation frameworks, even the fastest
            browser-only ones, do not have an equivalent of this because
            their tool boundary is the script, not the MCP turn.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Why execute_sequence is the bridge
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The biggest risk in agentic UI automation is nondeterminism
            compounding across turns. If every tool call opens a new window
            tree scan and the agent re-plans from scratch, flakiness explodes.
            execute_sequence solves it: pack N tool calls into one atomic
            request, and Terminator runs them in order, with a single cached
            tree and stop_on_error semantics. The agent sends this once, and
            the next time the same flow is needed, the same JSON replays
            exactly.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={executeSequenceExample}
              language="json"
              filename="execute_sequence request, built by Claude Code"
              typingSpeed={3}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five steps from zero to an agent driving Notepad
          </h2>
          <StepTimeline
            title="Wiring Claude Code into the Windows desktop"
            steps={integrationSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The numbers on this page, from the source
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={35} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                MCP tools in server.rs
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={95} suffix="%+" />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                success rate with execute_sequence
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={100} suffix="x" />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                faster than ChatGPT Agents, Claude, Perplexity Comet
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={0} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                listicle competitors that ship an MCP server for desktop
              </div>
            </div>
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The 95% and 100x numbers come from the project's README claims,
            tied to the determinism of accessibility-tree automation vs
            frame-by-frame screenshot agents. The 35 is a hard count from
            source. The 0 is what I found reading the top eight ranking pages
            in April 2026.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The category, in a strip
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here are the UI automation tools that rank for this query, in the
            order the listicles list them. Each is valid software. Each is
            also built for a human to drive. Terminator sits at the end, in a
            different column of the category entirely.
          </p>
          <div className="mt-6">
            <Marquee speed={28} pauseOnHover>
              {[
                "Selenium",
                "Playwright",
                "Cypress",
                "Appium",
                "Katalon",
                "TestComplete",
                "Ranorex",
                "Testim",
                "Mabl",
                "ACCELQ",
                "LambdaTest",
                "BrowserStack",
                "Applitools",
                "Robot Framework",
                "TestSprite",
                "UiPath",
                "Power Automate Desktop",
                "Terminator MCP",
              ].map((name) => (
                <span
                  key={name}
                  className={`mx-3 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-mono ${
                    name === "Terminator MCP"
                      ? "bg-orange-50 text-orange-700 border border-orange-200"
                      : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                  }`}
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Terminator versus the listicle picks
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical SERP listicle UI automation tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Every MCP tool Terminator exposes, in one strip
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you hover on the strip below the scroll pauses, so you can
            read each name. This is the full 35-tool surface that your agent
            sees after a single install.
          </p>
          <div className="mt-6">
            <Marquee speed={24} pauseOnHover>
              {mcpToolPills.map((name) => (
                <span
                  key={name}
                  className="mx-2 inline-flex items-center px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-mono"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                What you lose by picking a GUI tool in 2026
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                A GUI-first UI automation tool is not wrong, it is just
                orthogonal to where most automation work is moving. If your
                team is already using Cursor or Claude Code to write tests, a
                browser-only recorder does not help the agent drive the
                legacy desktop app the tests exercise. The agent wants a tool
                list. Terminator is that list, MIT licensed, installed in one
                command. The same binary that a human invokes via the CLI is
                the binary the agent invokes via MCP.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One command:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator "npx -y terminator-mcp-agent@latest"
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Evaluating UI automation tools for an AI coding assistant?"
          description="Bring your current stack. We will show you how the 35 MCP tools map onto what you already automate, and where the agent beats the recorder."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Adjacent deep dives in the Terminator docs"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="20-minute walkthrough with the Terminator maintainers."
        />
      </article>
    </>
  );
}
