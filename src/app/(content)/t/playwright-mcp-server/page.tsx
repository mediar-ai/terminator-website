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
  BeforeAfter,
  FlowDiagram,
  AnimatedChecklist,
  GlowCard,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/playwright-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "Playwright MCP server, then off the page: what an MCP server looks like when it does not stop at the browser tab";
const DESCRIPTION =
  "Playwright MCP is excellent inside a tab. The moment your AI agent needs to leave the tab (open Excel, paste a value, run a CLI, drag a file into a desktop app) it is out of room. Terminator is the same shape of MCP server (accessibility-tree-based, click and type by selector, discovered at runtime), but its dispatch function spans the whole OS. And it ships a separate Chrome extension on ws://127.0.0.1:17373 so one workflow mixes DOM-level and native-app steps.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Playwright MCP gave LLMs the browser tab. Terminator is the same accessibility-tree-shaped server with 31 tools, including open_application and execute_browser_script in the same match block.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playwright MCP, then off the page",
    description:
      "Playwright MCP is browser-only. Terminator is the same MCP shape for the whole desktop, with its own Chrome extension on ws://127.0.0.1:17373.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Playwright MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Playwright MCP server", url: PAGE_URL },
];

const manifestCode = `{
  "name": "Terminator Bridge",
  "manifest_version": 3,
  "version": "0.24.32",
  "description": "Bridge to evaluate JS in the active tab via a local WebSocket (no DevTools UI).",
  "background": { "service_worker": "worker.js", "type": "module" },
  "permissions": [
    "debugger",
    "tabs",
    "scripting",
    "activeTab",
    "webNavigation",
    "alarms",
    "storage"
  ],
  "host_permissions": ["<all_urls>"],
  "content_scripts": [{
    "js": ["content.js"],
    "matches": ["<all_urls>"],
    "match_about_blank": true,
    "run_at": "document_start"
  }]
}`;

const workerCode = `// crates/terminator/browser-extension/worker.js
// Service worker connects to the local WebSocket the Rust MCP server hosts.

const WS_URL = "ws://127.0.0.1:17373";
let socket = null;

// Protocol per browser-extension/README.md:
//   request:  { id, action: "eval", code, awaitPromise: true }
//   response: { id, ok: true, result } | { id, ok: false, error }
//
// The MCP server's execute_browser_script tool sends an "eval" frame here,
// the worker uses chrome.debugger to run the code in the active tab, and
// returns the result through the same socket. No DevTools window opens.`;

const mixedWorkflow = `# crates/terminator-mcp-agent/examples/mixed.yml
# One MCP server, one execute_sequence call, two surfaces:
# the browser DOM and the native Excel window. Try this with playwright-mcp.

steps:
  # 1. Native: open Excel
  - tool_name: open_application
    arguments: { path: "excel.exe" }

  # 2. Native: type the header row using the accessibility tree
  - tool_name: type_into_element
    arguments:
      selector: "role:Window && name:Book1 - Excel"
      text_to_type: "order_id\\tcustomer\\ttotal\\n"

  # 3. Browser: navigate to the source data
  - tool_name: navigate_browser
    arguments: { url: "https://orders.internal/q4" }

  # 4. Browser: pull the rows out of the page DOM
  #    Runs through the Terminator Bridge extension on ws://127.0.0.1:17373
  - id: rows
    tool_name: execute_browser_script
    arguments:
      script: |
        return Array.from(document.querySelectorAll('tr.order'))
          .map(r => [
            r.dataset.id,
            r.querySelector('.customer').innerText,
            r.querySelector('.total').innerText,
          ].join('\\t')).join('\\n');

  # 5. Native: paste the DOM scrape back into Excel
  - tool_name: type_into_element
    arguments:
      selector: "role:Window && name:Book1 - Excel"
      text_to_type: "\${{rows_result}}"

  # 6. OS: hit Ctrl+S
  - tool_name: press_key_global
    arguments: { keys: "Ctrl+S" }
stop_on_error: true`;

const dispatchCode = `// crates/terminator-mcp-agent/src/server.rs line 9953
// Same dispatch_tool match block. The LLM picks any of these in one session.

let result = match tool_name {
    // Browser surface (overlaps with playwright-mcp)
    "navigate_browser"       => self.navigate_browser(...).await,
    "execute_browser_script" => self.execute_browser_script(...).await,

    // Native OS surface (playwright-mcp has nothing here)
    "open_application"       => self.open_application(...).await,
    "get_applications_and_windows_list" => self.get_apps(...).await,
    "get_window_tree"        => self.get_window_tree(...).await,
    "click_element"          => self.click_element(...).await,
    "type_into_element"      => self.type_into_element(...).await,
    "press_key_global"       => self.press_key_global(...).await,
    "mouse_drag"             => self.mouse_drag(...).await,
    "run_command"            => self.run_command(...).await,
    "execute_sequence"       => self.execute_sequence(...).await,
    "read_file" | "write_file" | "edit_file" | "glob_files" | "grep_files"
                              => self.fs_tool(tool_name, ...).await,
    // ... 18 more arms ...
    _ => Err(McpError::internal_error("Unknown tool", ...)),
};`;

const installTerminal = [
  { text: "# 1. Install the MCP server (the Rust binary, behind npx)", type: "output" as const },
  {
    text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user",
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# 2. Load the Chrome extension (gives the MCP server an eval channel into Chrome)", type: "output" as const },
  { text: "open chrome://extensions", type: "command" as const },
  { text: "# Toggle Developer Mode, click \"Load unpacked\"", type: "output" as const },
  { text: "# Pick: terminator/crates/terminator/browser-extension/", type: "output" as const },
  { text: "Loaded \"Terminator Bridge\" v0.24.32", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# 3. Verify the server sees 31 tools", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "  terminator   stdio   31 tools", type: "output" as const },
  { text: "# Includes navigate_browser AND open_application in the same dispatch block", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Scope",
    competitor: "Browser tab only (Chromium, Firefox, WebKit, Edge)",
    ours: "Whole OS via accessibility APIs (Windows UIA, macOS AX) plus Chrome via its own extension",
  },
  {
    feature: "Native app control",
    competitor: "Cannot launch or click into Excel, Notepad, VS Code, legacy Win32",
    ours: "open_application, get_window_tree, click_element, type_into_element work on any accessible app",
  },
  {
    feature: "OS hotkeys",
    competitor: "Sends keys into the tab",
    ours: "press_key_global sends Ctrl+S, Win+R, Cmd+Tab to the active OS focus",
  },
  {
    feature: "Drag and drop across windows",
    competitor: "DOM drag inside the page only",
    ours: "mouse_drag accepts (start_x, start_y, end_x, end_y) in screen coordinates",
  },
  {
    feature: "Mix browser and native steps",
    competitor: "Must hand off to a second tool",
    ours: "execute_sequence YAML interleaves navigate_browser, open_application, run_command in one call",
  },
  {
    feature: "Chrome integration",
    competitor: "Driven by the playwright runtime, separate browser instance",
    ours: "Custom MV3 extension in browser-extension/manifest.json, WebSocket bridge ws://127.0.0.1:17373, uses chrome.debugger to eval in the active tab without DevTools UI",
  },
  {
    feature: "Workflow recording",
    competitor: "playwright codegen for the browser",
    ours: "terminator-workflow-recorder captures real OS event streams and turns them into YAML",
  },
  {
    feature: "Headless / VM mode",
    competitor: "headless Chromium",
    ours: "TERMINATOR_HEADLESS=true uses a virtual display so Windows UIA works without RDP",
  },
];

const playwrightOnly = [
  "navigate_browser",
  "execute_browser_script",
];

const terminatorExtra = [
  "open_application",
  "get_applications_and_windows_list",
  "get_window_tree",
  "click_element",
  "type_into_element",
  "press_key",
  "press_key_global",
  "validate_element",
  "wait_for_element",
  "activate_element",
  "scroll_element",
  "select_option",
  "set_selected",
  "set_value",
  "invoke_element",
  "highlight_element",
  "stop_highlighting",
  "mouse_drag",
  "delay",
  "run_command",
  "execute_sequence",
  "stop_execution",
  "gemini_computer_use",
  "read_file",
  "write_file",
  "edit_file",
  "copy_content",
  "glob_files",
  "grep_files",
];

const flowSteps = [
  {
    label: "LLM emits tool call",
    detail:
      "Claude or Cursor picks execute_browser_script and ships JSON-RPC over stdio to the local terminator-mcp-agent process.",
  },
  {
    label: "dispatch_tool matches",
    detail:
      "server.rs line 9953 has one match arm per tool; execute_browser_script dispatches to the handler that talks to the Chrome extension.",
  },
  {
    label: "Server frames eval msg",
    detail:
      "The handler opens a WebSocket client to ws://127.0.0.1:17373 and sends { id, action: \"eval\", code, awaitPromise: true }.",
  },
  {
    label: "Extension runs JS",
    detail:
      "The MV3 service worker (worker.js) attaches to the active tab via the debugger permission and runs the JS through the DevTools Protocol. No DevTools window opens.",
  },
  {
    label: "Result returns",
    detail:
      "Worker posts { id, ok: true, result } back. Server stores it as ${{step_id}}_result, available to the next step (which can be open_application or type_into_element).",
  },
];

const faqs = [
  {
    q: "What is the Playwright MCP server?",
    a: "Playwright MCP is Microsoft's reference Model Context Protocol server for browser automation. It runs Playwright under the hood, exposes MCP tools like browser_navigate, browser_click, browser_type, browser_snapshot, browser_screenshot, and lets an LLM client (Claude Code, Cursor, VS Code) drive a real browser through structured accessibility snapshots instead of pixels. It is excellent at what it does. The catch is that the universe of what it can do ends at the browser tab. The moment your agent needs to open Excel, drag a file from Finder into a desktop app, or run a shell command, it is out of room and you need a second tool.",
  },
  {
    q: "How is Terminator's MCP server related to Playwright MCP?",
    a: "Same shape, larger surface. Both are MCP servers. Both expose typed tools the LLM discovers via list_tools. Both prefer accessibility-tree snapshots over screenshots so the model sees structured data instead of pixels. The difference is what the dispatch function calls into. Playwright MCP calls Playwright, which calls Chrome DevTools Protocol, which talks to a browser. Terminator's dispatch function (crates/terminator-mcp-agent/src/server.rs line 9953) calls into Windows UI Automation, macOS Accessibility, and (for the browser case) its own MV3 Chrome extension on ws://127.0.0.1:17373. So Terminator gives the same Playwright-shaped API for the entire desktop, and it ships browser support as one slice of a larger toolset.",
  },
  {
    q: "What is the Chrome extension Terminator ships and why does it exist?",
    a: "Look at crates/terminator/browser-extension/manifest.json in the repo: it is an MV3 extension named \"Terminator Bridge\", currently version 0.24.32. The background service worker (worker.js) opens a WebSocket connection to ws://127.0.0.1:17373 the moment Chrome is started. The MCP server's execute_browser_script tool sends frames like { id, action: \"eval\", code, awaitPromise: true } down that socket; the extension uses Chrome's debugger permission to run the JS in the active tab via the DevTools Protocol and return the result. The point of the extension is that it lets the same MCP server that drives native Windows or macOS apps also reach into Chrome without launching a second browser instance via Playwright. You keep your real cookies, your real session, your real DOM.",
  },
  {
    q: "Can Terminator do everything Playwright MCP can?",
    a: "For the browser-DOM case, yes, and through a different mechanism. Terminator's navigate_browser drives whatever browser is the user's default; execute_browser_script executes arbitrary JavaScript inside the active tab through the Terminator Bridge extension. You can scrape the DOM, fill forms via document queries, await promises, return JSON. What you do not get is Playwright's full test runner ergonomics (fixtures, expect, traces). Terminator is an automation framework, not a test framework. If your goal is end-to-end test authoring, use playwright-mcp. If your goal is an LLM agent that needs to do real work that crosses the browser boundary, use Terminator.",
  },
  {
    q: "What does a workflow that mixes browser and native steps actually look like?",
    a: "It is a single execute_sequence call with steps that interleave tool names. A real example from the repo's pattern: open_application excel.exe, then type_into_element to write a header row into the active sheet, then navigate_browser to an internal report, then execute_browser_script to scrape rows out of the page DOM (the result lands in env as rows_result), then type_into_element back into Excel pasting that string, then press_key_global Ctrl+S to save. One MCP server. One match block. Six dispatched tool calls. Two completely different surfaces. This is the workflow shape playwright-mcp cannot express because steps 1, 2, 5, and 6 happen outside the browser.",
  },
  {
    q: "Is Terminator just a wrapper around Playwright?",
    a: "No. Terminator is a Rust crate that wraps the OS accessibility APIs directly (terminator-rs on crates.io). The browser-DOM evaluation path uses Chrome's own debugger protocol via a custom MV3 extension, not Playwright. There is no playwright dependency in the MCP agent. The architectural similarity is intentional: Playwright proved that an accessibility-tree-based, selector-driven, typed-action API is the right shape for LLMs to drive a UI. Terminator applies that same shape to the OS. The README phrases it as Playwright but for every app on your desktop. That is the lineage, not the dependency.",
  },
  {
    q: "How many tools does Terminator's MCP server expose, and where can I see the list?",
    a: "Thirty-one. The list is generated at compile time. crates/terminator-mcp-agent/build.rs reads server.rs, walks until it finds the line containing let result = match tool_name, collects every quoted name from the match arms, and bakes the comma-separated list into the binary as the MCP_TOOLS env var via rustc-env. crates/terminator-mcp-agent/src/prompt.rs reads env!(\"MCP_TOOLS\") and pastes the names into the system prompt the server announces on initialize. So the LLM sees the same list the dispatch function dispatches against, automatically, every build. To see the list yourself: clone mediar-ai/terminator and run grep -n MCP_TOOLS crates/terminator-mcp-agent/build.rs crates/terminator-mcp-agent/src/prompt.rs, or open server.rs at line 9953 and read the arms.",
  },
  {
    q: "How do I install Terminator's MCP server in Claude Code, Cursor, or VS Code?",
    a: "One line for Claude Code: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. For Cursor and VS Code there are deep-link install buttons in the Terminator MCP Agent README. The agent is published as an npm package that wraps a Rust binary; it works over stdio by default (the editor spawns it as a child process) or over HTTP if you pass -t http (POST /mcp for calls, GET /status returns 503 when busy so a load balancer can drain). For the browser-DOM eval channel, additionally load the unpacked extension at crates/terminator/browser-extension/ in chrome://extensions with Developer Mode enabled.",
  },
  {
    q: "Does Terminator work on macOS and Linux, or only Windows?",
    a: "The MCP server runs on macOS and Windows. Per the repo's README, the most complete coverage is on Windows (Windows UIA gives the richest accessibility tree); macOS has the AX adapter and works for many apps. Linux desktop support depends on AT-SPI and is best-effort. The Chrome extension portion (the part that overlaps with playwright-mcp) is browser-driven so it works the same everywhere Chrome runs. If your use case is purely browser-DOM and you need Linux, playwright-mcp is the safer bet. If your use case is Windows desktop automation specifically, Terminator is built for it.",
  },
  {
    q: "What is the catch?",
    a: "Two real catches. First, accessibility trees are only as good as the apps that expose them. A well-built Win32 or UWP app gives you a clean tree; an Electron app or a custom-rendered canvas gives you mush, and you fall back to coordinate-based clicks or vision (Terminator has a gemini_computer_use tool for that, but it is slower and less reliable than tree-based selectors). Second, the Chrome extension requires loading an unpacked extension (developer mode) the first time, which is a manual step. If you cannot or will not enable developer extensions in Chrome, the navigate_browser path still works (it drives the OS-level browser window) but execute_browser_script does not have a DOM bridge. Most teams either enable developer extensions on the automation machine or use a headless Chrome path under run_command.",
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
                Browser + desktop automation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Playwright MCP server, then{" "}
              <GradientText variant="teal">off the page</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Microsoft&apos;s playwright-mcp gave language models a browser
              tab. Excellent inside that tab, useless outside it. The moment
              your agent needs to open Excel, paste the value it just scraped,
              hit Cmd+S, and drag the file into a desktop uploader, it has
              left the universe playwright-mcp can see. This page is about
              what an MCP server looks like when its dispatch function does
              not stop at the browser. The server in question is Terminator;
              the anchor is its own Chrome extension on{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                ws://127.0.0.1:17373
              </code>
              .
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="11 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Same shape as playwright-mcp: accessibility tree + click/type by selector",
                "Dispatches navigate_browser AND open_application from one match block",
                "Ships its own MV3 Chrome extension (manifest.json v0.24.32) on ws://127.0.0.1:17373",
                "31 tools total, including run_command, mouse_drag, press_key_global",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#chrome-extension"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the Chrome extension
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Playwright MCP is browser-only. Terminator MCP is the same shape, OS-wide."
            subtitle="One dispatch function, two surfaces, one execute_sequence call."
            accent="orange"
            captions={[
              "Both speak MCP; both prefer accessibility trees over pixels",
              "playwright-mcp tools end at the browser tab",
              "Terminator dispatches navigate_browser AND open_application from one match arm",
              "Its own MV3 Chrome extension bridges DOM eval over ws://127.0.0.1:17373",
              "The same workflow can scrape a page and then paste into Excel",
            ]}
          />
        </section>

        {/* The framing */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            What playwright-mcp is, and where it stops
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Microsoft&apos;s playwright-mcp is the reference MCP server for
            browser automation. It wraps Playwright, exposes a small set of
            typed tools (navigate, click, type, snapshot, screenshot), and
            speaks the Model Context Protocol so any MCP-aware client (Claude
            Code, Cursor, VS Code, the GitHub Copilot Coding Agent) can drive
            a real browser. It uses the page&apos;s accessibility tree, not
            pixels, which is why the LLM sees structured data and not
            screenshots.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            That last detail is the interesting one. Accessibility trees are
            not a browser concept. Windows has had UI Automation since 2005;
            macOS has had AX since 2001. Every well-behaved desktop app
            already exposes one. So if the right shape for an LLM to drive a
            UI is &quot;accessibility tree plus selector-based click and
            type,&quot; that shape generalizes past the browser. Terminator
            is what happens when you take that shape and apply it to the
            whole OS.
          </p>
        </section>

        {/* Before/after: scope */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BeforeAfter
            title="Scope of an MCP call, side by side"
            before={{
              label: "playwright-mcp",
              content:
                "Browser-tab universe. Tools speak DOM. Anything outside the tab requires a second MCP server, a separate runtime, and a hand-off you write yourself.",
              highlights: [
                "browser_navigate, browser_click, browser_type",
                "Cannot launch Excel, Notepad, or your CLI",
                "Cannot send Ctrl+S to the OS focus",
                "Cannot drag a file from Finder into a desktop app",
              ],
            }}
            after={{
              label: "Terminator MCP",
              content:
                "OS-wide universe via accessibility APIs. Browser is one tool group out of seven. Same protocol, same accessibility-tree philosophy, dispatch surface that includes both navigate_browser and open_application.",
              highlights: [
                "navigate_browser + execute_browser_script (DOM)",
                "open_application, get_window_tree, click_element (native)",
                "press_key_global, mouse_drag, run_command (OS-level)",
                "execute_sequence stitches them in one YAML call",
              ],
            }}
          />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Terminator&apos;s MCP server, by the numbers
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Counts pulled from the open-source repo at the commit this page
            was written against. The first is match arms in the dispatch
            function. The second is total OS-level tool surface. The third
            is the version of the Chrome extension that ships in-tree. The
            fourth is the local WebSocket port the extension talks to.
          </p>
          <MetricsRow
            metrics={[
              { value: 31, label: "Tool match arms in dispatch_tool" },
              { value: 29, label: "Tools playwright-mcp does not have" },
              { value: 24, prefix: "v0.", label: "Chrome extension version (decimal)", decimals: 2 },
              { value: 17373, label: "Local WebSocket port for the bridge" },
            ]}
          />
        </section>

        {/* Anchor: the Chrome extension */}
        <section
          id="chrome-extension"
          className="max-w-4xl mx-auto px-6 py-12 scroll-mt-16 bg-white/40 border-y border-zinc-200/60"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The anchor:{" "}
            <GradientText variant="teal">
              Terminator ships its own Chrome extension
            </GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Inside the Terminator repo, alongside the MCP agent crate, there
            is a directory called{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator/browser-extension/
            </code>
            . It contains an MV3 Chrome extension named &quot;Terminator
            Bridge&quot;, currently at version 0.24.32. This is the part no
            playwright-mcp page mentions, because no other MCP server does
            this. Terminator does not depend on Playwright; it bridges into
            Chrome through its own extension.
          </p>

          <AnimatedCodeBlock
            code={manifestCode}
            language="json"
            filename="crates/terminator/browser-extension/manifest.json"
          />

          <p className="text-zinc-600 mt-6 mb-6 max-w-3xl leading-relaxed">
            Two permissions are doing the work. The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              debugger
            </code>{" "}
            permission lets the extension attach to the active tab via
            Chrome&apos;s DevTools Protocol and run arbitrary JavaScript
            without opening a DevTools window. The host permission{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              &lt;all_urls&gt;
            </code>{" "}
            lets it do that on any site. The MV3 service worker
            (worker.js) opens a WebSocket connection to{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              ws://127.0.0.1:17373
            </code>{" "}
            the moment Chrome boots, and waits for the local MCP server to
            send eval frames.
          </p>

          <AnimatedCodeBlock
            code={workerCode}
            language="javascript"
            filename="crates/terminator/browser-extension/worker.js"
          />

          <div className="mt-6 p-5 rounded-xl bg-orange-50 border border-orange-300">
            <p className="text-zinc-700 leading-relaxed">
              Verify in 10 seconds: clone{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                mediar-ai/terminator
              </code>{" "}
              and{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                cat crates/terminator/browser-extension/manifest.json
              </code>
              . You will see the version, the{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                debugger
              </code>{" "}
              permission, and the manifest_version 3 declaration. Then{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                grep -n 17373 crates/terminator/browser-extension/worker.js
              </code>{" "}
              to find the WebSocket URL the worker connects to. The same
              port appears in the MCP agent&apos;s execute_browser_script
              handler when it acts as the WebSocket client. That is the
              entire bridge: a manifest, a worker, a port.
            </p>
          </div>
        </section>

        {/* Animated beam: the dispatch hub */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            One MCP server, two surfaces
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Same MCP host (your editor), same dispatch function, two
            surfaces it can reach. The browser-DOM path uses the Chrome
            extension. The native-app path uses Windows UIA or macOS AX.
            The LLM picks tool names; the dispatcher picks targets.
          </p>
          <AnimatedBeam
            title="What dispatch_tool can reach"
            from={[
              { label: "Claude Code", sublabel: "stdio MCP client" },
              { label: "Cursor", sublabel: "stdio MCP client" },
              { label: "VS Code", sublabel: "stdio MCP client" },
            ]}
            hub={{ label: "dispatch_tool", sublabel: "server.rs:9953" }}
            to={[
              { label: "Chrome", sublabel: "via MV3 extension on :17373" },
              { label: "Native apps", sublabel: "Windows UIA / macOS AX" },
              { label: "Shell + FS", sublabel: "run_command, read/write_file" },
            ]}
          />
        </section>

        {/* The dispatch_tool source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The match block, with the browser arms next to the OS arms
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the shape of Terminator&apos;s dispatch function.
            Browser tools and native tools live in the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              match
            </code>
            , dispatched by the LLM&apos;s tool call name. There is no
            second server, no protocol switch, no glue you have to write.
          </p>
          <AnimatedCodeBlock
            code={dispatchCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />
        </section>

        {/* Mixed workflow */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            A workflow playwright-mcp cannot express
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Open Excel. Type a header row. Open a browser to an internal
            report. Scrape the rows out of the page DOM. Paste them back
            into Excel. Save. Six steps, two completely different surfaces,
            one{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_sequence
            </code>{" "}
            call.
          </p>
          <AnimatedCodeBlock
            code={mixedWorkflow}
            language="yaml"
            filename="examples/mixed.yml"
          />
          <p className="text-zinc-500 text-sm mt-4 max-w-3xl leading-relaxed">
            Step 4 returns through the Chrome extension on{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              ws://127.0.0.1:17373
            </code>
            . Step 5 reads{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              {"${{rows_result}}"}
            </code>{" "}
            from the workflow env, which auto-populated because step 4 had
            an{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              id
            </code>
            . The data passing is documented in the MCP Agent README under
            &quot;Tool Result Storage&quot;.
          </p>
        </section>

        {/* Flow diagram */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            How an{" "}
            <code className="font-mono text-base bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-orange-600">
              execute_browser_script
            </code>{" "}
            call physically reaches the page
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Five hops. The interesting one is hop 4: the bridge extension
            uses Chrome&apos;s debugger permission, which is how it can run
            JS in a tab without opening DevTools and without spawning a
            second browser the way Playwright does.
          </p>
          <FlowDiagram title="LLM script eval, end to end" steps={flowSteps} />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="playwright-mcp vs Terminator MCP, on real capabilities"
            intro="Apples-to-apples on the things an LLM agent actually needs to do. Browser-only is the right answer when your task is browser-only. Most real automations are not."
            productName="Terminator MCP"
            competitorName="playwright-mcp"
            rows={comparisonRows}
          />
        </section>

        {/* The 29 tools playwright-mcp doesn't have */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The 29 tools you get past the browser
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Every name below is in Terminator&apos;s dispatch match block.
            None map to anything in playwright-mcp&apos;s tool list. They
            cover native UI, OS keys, shell, files, workflow control, and
            vision fallback.
          </p>
          <Marquee speed={38}>
            {terminatorExtra.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
          <p className="text-xs text-zinc-500 mt-4 max-w-3xl">
            For comparison, the two tool names that overlap with
            playwright-mcp:{" "}
            {playwrightOnly.map((n, i) => (
              <span key={n}>
                <code className="font-mono text-orange-600">{n}</code>
                {i < playwrightOnly.length - 1 ? ", " : ""}
              </span>
            ))}
            . Everything else in the marquee is what makes the dispatch
            surface OS-wide.
          </p>
        </section>

        {/* Install terminal */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Install in three steps
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Step 1 wires the Rust binary into your editor. Step 2 enables
            the browser-DOM bridge by loading the unpacked extension. Step
            3 confirms 31 tools are visible to your agent.
          </p>
          <TerminalOutput title="install" lines={installTerminal} />
        </section>

        {/* When to use which */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            When playwright-mcp is the right call
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            If your agent&apos;s entire job lives in a browser, playwright-mcp
            is leaner. It is the official Playwright project, it has the test
            framework around it (codegen, traces, expect), and it knows
            cross-browser quirks because Playwright already does. Use it for
            web QA, browser-scoped scrapers, anything that does not need the
            OS.
          </p>
          <AnimatedChecklist
            title="Use playwright-mcp if"
            items={[
              { text: "Your agent only ever drives a web app and never leaves the tab" },
              { text: "You want Playwright's full test ergonomics (fixtures, traces, expect) backing your MCP" },
              { text: "You need cross-browser parity (Chromium, Firefox, WebKit, Edge)" },
              { text: "You are happy isolating the agent to a fresh browser context per run" },
            ]}
          />
          <AnimatedChecklist
            title="Use Terminator if"
            items={[
              { text: "The work crosses the browser boundary (Excel, legacy app, file system, shell)" },
              { text: "You want one MCP server with a Playwright-shaped API for the whole OS" },
              { text: "You want the LLM to use your real Chrome session, real cookies, real DOM, via the bundled MV3 extension" },
              { text: "You need OS-level keys, drag-and-drop across windows, or native window management" },
              { text: "You want tool discovery to stay in sync with the source automatically (the build.rs trick)" },
            ]}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every file path on this page (manifest.json, worker.js, server.rs:9953) is grep-able in a fresh clone of mediar-ai/terminator."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Glow card: the takeaway */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              The shape Playwright proved, applied to the OS
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Playwright proved that an accessibility-tree-based, selector-
              driven, typed-action API is the right interface for an LLM to
              drive a UI. playwright-mcp packages that interface as an MCP
              server for the browser. Terminator takes the same shape and
              applies it to the entire desktop, including a custom Chrome
              extension so you do not have to leave your real browser to
              get the DOM eval path.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If you only ever needed the browser, you would use
              playwright-mcp. If you needed the browser{" "}
              <em className="text-zinc-800">and</em> Excel{" "}
              <em className="text-zinc-800">and</em> the shell{" "}
              <em className="text-zinc-800">and</em> a legacy Win32 app
              your team still depends on, you would use a server whose
              dispatch function does not stop at the tab. That is what
              Terminator is.
            </p>
          </GlowCard>
        </section>

        {/* Inline CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <InlineCta
            heading="Wire Terminator MCP into your editor"
            body="One npx command for stdio under Claude Code, Cursor, or VS Code. Add the unpacked Chrome extension if you want the DOM bridge on ws://127.0.0.1:17373. MIT-licensed; the dispatch function is one file you can read end to end."
            linkText="claude mcp add terminator"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* Number callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              Local WebSocket port the Chrome bridge listens on
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={17373} />
            </div>
            <p className="text-sm text-zinc-500">
              Defined in{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                browser-extension/worker.js
              </code>
              . Loopback only; never leaves the machine.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation, not a consumer app. It gives existing AI coding
            assistants the ability to control your entire OS, not just
            write code. Like Playwright, but for every app on your
            desktop.
          </p>
        </footer>
      </article>
    </div>
  );
}
