import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  SequenceDiagram,
  AnimatedChecklist,
  MetricsRow,
  ProofBanner,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/browser-mcp-to-desktop-automation";
const PUBLISHED = "2026-05-06";
const TITLE =
  "Browser MCP to desktop automation: you don't extend the server, you replace its dispatch root";
const DESCRIPTION =
  "Every browser MCP server (Playwright MCP, Chrome DevTools MCP, Browser MCP, browser-use, Browserbase) binds its tool dispatch to a Page or Browser object. That is why the agent goes blind the second the workflow leaves the tab. The fix is not a second tool. The fix is one MCP whose dispatch root is the OS accessibility tree, with the browser sitting as a subset. Terminator does this in one match block at server.rs:9953.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "navigate_browser and open_application are sibling arms in one match block. That's the difference between a browser MCP and a desktop one.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browser MCP to desktop: replace the dispatch root, not extend it",
    description:
      "Browser MCP binds tools to a Page object. Desktop MCP binds to the OS tree. The browser becomes one subset, not the whole thing.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Browser MCP to desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Browser MCP to desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a browser MCP server, exactly, and why does the boundary matter?",
    a: "A browser MCP server is an MCP process that exposes tools like navigate, click, fill, screenshot, and execute_script, all of which take a CSS or aria selector and dispatch through a single Browser or Page handle (Playwright Browser, a CDP session, a Browserbase session). The shape of the tool registry mirrors the shape of the underlying object. Browser MCP can do anything that object can do. It cannot do anything that object cannot do. The OS save dialog, the OAuth code in a desktop authenticator, the legacy Win32 line-of-business app, the Excel paste, the run_command into a shell, none of those are reachable through a Page handle, so they are not reachable through a browser MCP either. The boundary is structural, not a missing feature.",
  },
  {
    q: "What does it mean to replace the dispatch root instead of extending the server?",
    a: "Most people who hit the boundary try to bolt on a second MCP server (a desktop tool, a shell tool, a custom subprocess) and let the LLM decide which to call. That works, sort of, until you need to mix steps in one workflow: scrape a row out of the page, paste it into Excel, and hit Ctrl-S, all inside one execute_sequence so the model only has to plan once. Two MCPs cannot share state cleanly; two selector grammars do not interleave. The structural fix is to use one MCP whose dispatch table is rooted at the OS, not at a tab. Terminator does this. In crates/terminator-mcp-agent/src/server.rs starting at line 9953, the dispatch_tool method is one Rust match block where navigate_browser, execute_browser_script, open_application, click_element, type_into_element, press_key_global, and run_command are all sibling arms.",
  },
  {
    q: "How does Terminator reach into the browser if its dispatch root is the OS?",
    a: "It ships a Manifest V3 Chrome extension named Terminator Bridge (manifest at crates/terminator/browser-extension/manifest.json, version 0.24.32) which holds a WebSocket connection to the local MCP server on ws://127.0.0.1:17373 (worker.js line 1, port verified at main.rs:240). The MCP server's execute_browser_script tool sends an eval frame down that socket, the extension uses chrome.scripting + chrome.debugger to run the code in the active tab, and returns the result through the same socket. From the agent's point of view it is just another tool in the same registry. The selector for a click in the page (capture_browser_dom_elements + click) and the selector for a click in a native window (role:Button name:Save) flow through the same dispatch.",
  },
  {
    q: "Why is the unified selector grammar more important than a unified set of tools?",
    a: "Because the workflow recorder, the YAML format, the LLM prompt, and the failure modes are all shaped by the selector. Two tools that take two different selector formats are not really one tool surface, even if they live behind the same MCP server. Terminator's selector format (role:Button name:Save window:Save As, or role:Document for the focused tab) works for both surfaces. type_into_element with role:Edit window:Save As fills the file save dialog the same way it fills a DOM input. The LLM does not have to remember which tool to pick when the workflow crosses the boundary; the selector already tells the dispatch where the element lives.",
  },
  {
    q: "Is this just \"computer use\" with extra steps?",
    a: "No, and the difference is important on a slow network. Computer use models (Claude's, Gemini's, OpenAI's) operate on screenshots and emit (x, y) clicks. They are pixel-bound, expensive, and slow. Terminator dispatches by selector against the accessibility tree, which is structural and fast: get_window_tree returns a JSON tree of every named control in a window, the agent picks one by name, and the click lands on the element regardless of resolution, scaling, or theme. The gemini_computer_use tool does exist in the same dispatch block (server.rs has it as one arm) for cases where vision is the right tool, like canvases or PDFs. The point is that selector-based dispatch is the default, and screenshot dispatch is a fallback, not the other way around.",
  },
  {
    q: "Concretely, what tools does Terminator add that a browser MCP does not have?",
    a: "Compared with a typical browser MCP (whose tool list is roughly: navigate, click, fill, select, hover, press, screenshot, evaluate, console, network, plus tab-management), Terminator's match block adds open_application, get_applications_and_windows_list, get_window_tree, click_element / type_into_element / set_value / select_option / set_selected with cross-app selectors, press_key_global (Ctrl+S, Win+R, Cmd+Tab against the active OS focus, not the active tab), mouse_drag with screen coordinates, run_command into bash/cmd/powershell/node/python, capture_screenshot at the screen level, gemini_computer_use as a vision fallback, and a file-system block (read_file / write_file / edit_file / glob_files / grep_files / copy_content). The browser tools (navigate_browser, execute_browser_script) are still there, just as siblings.",
  },
  {
    q: "Will this work on macOS too, or is it Windows-only?",
    a: "Right now the Node.js, Python, and MCP server packages are Windows-first. Windows UIAutomation is the primary surface and the one with the most depth in tests. macOS support existed in the Rust core for a stretch and was removed on 2025-12-16 (commit 0c11011c) to focus on the Windows path. The browser-extension half of the bridge still works on either OS because it is a Chrome MV3 extension talking to a local WebSocket; the native-app half does not work on macOS in Terminator today. If you are on a Mac and you need both halves, the answer is to run the agent against a Windows VM through the headless mode (TERMINATOR_HEADLESS=true uses a virtual display so UIA works without RDP).",
  },
  {
    q: "How do I install and verify the unified dispatch in under a minute?",
    a: "One MCP install line, then load the extension. Run claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user (or wire it into Cursor / VS Code / Windsurf via the same name). Open chrome://extensions, toggle Developer Mode, click Load unpacked, point at the browser-extension folder inside the terminator-mcp-agent npm package or the GitHub repo (path: crates/terminator/browser-extension), and confirm \"Terminator Bridge\" v0.24.32 loads. claude mcp list should now show terminator with around three dozen tools. The two tells that the dispatch is unified: navigate_browser shows up next to open_application in the tool list, and execute_sequence accepts a YAML that mixes both without a custom adapter.",
  },
  {
    q: "What if my agent only needs the browser, ever?",
    a: "Then a browser MCP is the right answer and you should not migrate. Playwright MCP is excellent for tab-bound work, Chrome DevTools MCP is excellent for inspecting and debugging a real browser, Browser MCP is excellent for fully local browser control through an extension, browser-use is excellent if you want a self-hosted agent loop. Terminator overlaps with all of them on the browser surface but its reason to exist is the OS surface. Use the right tool for the job; the unified dispatch only matters if the job leaves the tab.",
  },
];

const beforeContent = `Browser MCP server (Playwright MCP, Chrome DevTools MCP, Browser MCP, browser-use, Browserbase): the tool dispatch table is bound to one Page or Browser object. Every tool is a method on that object. The agent can do anything the page can do, and nothing else. Save dialog, native authenticator, Excel paste, OS hotkey, shell command: all out of scope. The agent goes blind at the tab boundary.`;

const afterContent = `Desktop MCP server (Terminator): the tool dispatch table is bound to the OS accessibility tree. The browser is one subset, reached through a Manifest V3 extension on ws://127.0.0.1:17373. navigate_browser and open_application are sibling arms in one match block at server.rs:9953. The same selector grammar covers a Submit button on the page and a Save button in the file dialog.`;

const dispatchActors = [
  "LLM",
  "MCP server",
  "Browser ext",
  "OS UIA",
];

const dispatchMessages = [
  { from: 0, to: 1, label: "navigate_browser(internal URL)", type: "request" as const },
  { from: 1, to: 2, label: "ws eval", type: "request" as const },
  { from: 2, to: 1, label: "page ready", type: "response" as const },
  { from: 0, to: 1, label: "execute_browser_script (scrape rows)", type: "request" as const },
  { from: 1, to: 2, label: "ws eval", type: "request" as const },
  { from: 2, to: 1, label: "rows[]", type: "response" as const },
  { from: 0, to: 1, label: "open_application(\"excel.exe\")", type: "request" as const },
  { from: 1, to: 3, label: "UIA Launch", type: "request" as const },
  { from: 3, to: 1, label: "window handle", type: "response" as const },
  { from: 0, to: 1, label: "type_into_element(role:Window Excel)", type: "request" as const },
  { from: 1, to: 3, label: "UIA SetValue", type: "request" as const },
  { from: 0, to: 1, label: "press_key_global(\"Ctrl+S\")", type: "request" as const },
  { from: 1, to: 3, label: "UIA Invoke", type: "request" as const },
];

const browserMcpCovers = [
  { text: "Click and type inside a page DOM" },
  { text: "Navigate, reload, screenshot a tab" },
  { text: "Evaluate JavaScript in a page context" },
  { text: "Inspect network and console (CDP)" },
  { text: "Manage tabs, dialogs (in-page)" },
];

const desktopMcpAdds = [
  { text: "open_application + get_window_tree + click_element on any UIA-accessible app" },
  { text: "press_key_global for Ctrl+S, Win+R, Cmd+Tab against the OS focus, not the tab" },
  { text: "mouse_drag with screen coordinates across windows" },
  { text: "run_command into bash, cmd, powershell, node, python from the same MCP" },
  { text: "Native file save / open dialogs filled by selector, not coordinates" },
  { text: "execute_sequence YAML interleaves navigate_browser, open_application, run_command in one call" },
];

const mixedYaml = `# crates/terminator-mcp-agent/examples/mixed.yml
# One MCP, one execute_sequence, two surfaces. The dispatch root is
# the OS; the browser is one of the arms.

steps:
  # Browser surface (would also work in Playwright MCP)
  - tool_name: navigate_browser
    arguments: { url: "<your internal orders URL>" }

  - id: rows
    tool_name: execute_browser_script
    arguments:
      script: |
        return Array.from(document.querySelectorAll("tr.order"))
          .map(r => [r.dataset.id, r.querySelector(".total").innerText].join("\\t"))
          .join("\\n");

  # Native surface (no browser MCP can reach this)
  - tool_name: open_application
    arguments: { path: "excel.exe" }

  - tool_name: type_into_element
    arguments:
      selector: "role:Window && name:Book1 - Excel"
      text_to_type: "\${{rows_result}}"

  - tool_name: press_key_global
    arguments: { keys: "Ctrl+S" }

  # Native dialog, filled by selector
  - tool_name: type_into_element
    arguments:
      selector: "role:Edit && window:Save As && name:File name:"
      text_to_type: "q4-orders.xlsx"

  - tool_name: click_element
    arguments:
      selector: "role:Button && window:Save As && name:Save"

stop_on_error: true`;

const dispatchSnippet = `// crates/terminator-mcp-agent/src/server.rs line 9953
// One Rust match block. The LLM picks any of these arms in one session.

let result = match tool_name {
    // Browser surface (overlaps with playwright-mcp / chrome-devtools-mcp)
    "navigate_browser"        => self.navigate_browser(...).await,
    "execute_browser_script"  => self.execute_browser_script(...).await,

    // Native OS surface (no browser MCP has these arms)
    "open_application"                  => self.open_application(...).await,
    "get_applications_and_windows_list" => self.get_apps(...).await,
    "get_window_tree"                   => self.get_window_tree(...).await,
    "click_element"                     => self.click_element(...).await,
    "type_into_element"                 => self.type_into_element(...).await,
    "press_key_global"                  => self.press_key_global(...).await,
    "mouse_drag"                        => self.mouse_drag(...).await,
    "run_command"                       => self.run_command(...).await,

    // Vision fallback in the same dispatch block
    "gemini_computer_use"     => self.gemini_computer_use(...).await,

    // Sequence runner that mixes any of the above
    "execute_sequence"        => self.execute_sequence(...).await,

    // ... around two dozen more arms (file ops, validation,
    // highlighting, scrolling, screenshots, etc.) ...
    _ => Err(McpError::internal_error("Unknown tool", ...)),
};`;

const installSteps = `# 1. Install Terminator's MCP server (Rust binary, behind npx)
claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# 2. Load the Chrome extension that gives the MCP server an eval channel
#    open chrome://extensions, toggle Developer Mode, "Load unpacked",
#    pick: terminator/crates/terminator/browser-extension/
#    (Manifest V3, name "Terminator Bridge", version 0.24.32)

# 3. Verify the dispatch is unified
claude mcp list
# terminator   stdio   ~3 dozen tools
# Includes navigate_browser AND open_application AND run_command
# in the same registry.`;

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
            Browser MCP to desktop automation: you don&apos;t extend the server, you replace its dispatch root
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Every browser MCP (Playwright MCP, Chrome DevTools MCP, Browser MCP, browser-use, Browserbase) binds its tool dispatch to a single <code className="text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">Page</code> or <code className="text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded">Browser</code> handle. That is why your agent goes blind the moment the workflow leaves the tab. The structural fix is not a second MCP. It is one MCP whose dispatch root is the OS accessibility tree, with the browser sitting as one subset.
          </p>
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="7 min read"
          />
        </header>

        <section className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-05-06)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <strong>You don&apos;t extend a browser MCP.</strong> A browser MCP&apos;s dispatch table is bound to a <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">Page</code> object: every tool is a method on that page, so OS-level work (Save dialogs, native apps, system shortcuts, shell commands) is structurally out of scope. To control the desktop, you swap to an MCP whose dispatch is bound to the OS accessibility tree, with the browser as one subset reached through an extension. Terminator does this in one Rust match block at <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">crates/terminator-mcp-agent/src/server.rs:9953</code>, where <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">navigate_browser</code> and <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">open_application</code> are sibling arms.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Source:{" "}
            <a href="https://github.com/microsoft/playwright-mcp" className="text-orange-600 underline">
              github.com/microsoft/playwright-mcp
            </a>{" "}
            (browser-only),{" "}
            <a href="https://github.com/mediar-ai/terminator" className="text-orange-600 underline">
              github.com/mediar-ai/terminator
            </a>{" "}
            (whole-OS).
          </p>
        </section>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          The boundary is structural, not a missing feature
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Read the source of any browser MCP and you&apos;ll find the same shape. Microsoft&apos;s playwright-mcp wraps a Playwright <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">Browser</code>; Chrome DevTools MCP wraps a CDP session and exposes <a href="https://github.com/ChromeDevTools/chrome-devtools-mcp" className="text-orange-600 underline">26 tools in 6 categories</a>; browsermcp.io wraps a local Chrome through an extension; browser-use wraps a Playwright browser context; Browserbase wraps a remote browser. The tool registry is whatever methods the underlying object exposes. That is what makes them composable and easy to ship; it is also what makes them unable to leave the tab.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The Save dialog is not in the page DOM. The OAuth code in your desktop authenticator is not in the page DOM. Excel is not in the page DOM. The shell is not in the page DOM. None of those are reachable through a Page handle, so none of them are reachable through a browser MCP. You can bolt on a second MCP server, but two registries do not interleave inside one <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">execute_sequence</code> call, and the LLM has to plan twice.
        </p>

        <BeforeAfter
          title="Browser MCP vs desktop MCP, viewed as dispatch tables"
          before={{
            label: "Browser MCP",
            content: beforeContent,
            highlights: [
              "Tools are methods on a Page or Browser object",
              "Every tool's reach equals that page's reach",
              "Save dialog, native apps, OS shortcuts: out of scope",
              "Two MCPs to mix surfaces, two registries, two plans",
            ],
          }}
          after={{
            label: "Desktop MCP (Terminator)",
            content: afterContent,
            highlights: [
              "Tools are arms in one match block over the OS tree",
              "Browser surface is one subset, reached via MV3 extension",
              "navigate_browser and open_application sit side by side",
              "One execute_sequence interleaves both surfaces",
            ],
          }}
        />

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          The match block is the whole story
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The fastest way to see what makes a desktop MCP different from a browser MCP is to read the dispatch function. In Terminator&apos;s <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">server.rs</code>, the <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">dispatch_tool</code> method is one Rust <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">match tool_name</code> at line 9953. Every tool the agent can call is one arm of that match.
        </p>

        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{dispatchSnippet}</code>
        </pre>

        <p className="text-zinc-700 leading-relaxed">
          Around three dozen <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">#[tool(...)]</code> declarations live in <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">server.rs</code>; they all dispatch through that one match. The browser arms (<code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">navigate_browser</code>, <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">execute_browser_script</code>) overlap with what a browser MCP gives you. The native arms (<code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">open_application</code>, <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">click_element</code>, <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">type_into_element</code>, <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">press_key_global</code>, <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">run_command</code>) cannot exist in a browser MCP because their dispatch is bound to a Page object, not the OS.
        </p>

        <ProofBanner
          metric="36"
          quote="#[tool(...)] declarations in server.rs, all routed by one match block at line 9953. navigate_browser and open_application are sibling arms."
          source="terminator/crates/terminator-mcp-agent/src/server.rs"
        />

        <MetricsRow
          metrics={[
            { value: 36, label: "Tools in Terminator MCP" },
            { value: 26, label: "Chrome DevTools MCP tools (browser only)" },
            { value: 1, label: "Match block routes both surfaces" },
            { value: 17373, label: "Local WebSocket port for the bridge" },
          ]}
        />

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          What a unified dispatch looks like in flight
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          A real workflow that crosses the boundary: scrape a page, paste into Excel, save with a native dialog. The agent emits ten tool calls, the MCP server dispatches each one through the same match, and the browser extension and the OS accessibility tree do the work in their own lanes.
        </p>

        <SequenceDiagram
          title="One execute_sequence, two surfaces"
          actors={dispatchActors}
          messages={dispatchMessages}
        />

        <p className="text-zinc-700 leading-relaxed">
          The MCP server is the only process the LLM talks to. Whether the next call lands on the browser extension at <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">ws://127.0.0.1:17373</code> or on the Windows UIAutomation tree is decided inside the match. The agent does not know and does not have to.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          What the YAML looks like when both surfaces are alive
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The same shape as a Playwright MCP test, but with two extra kinds of step. Try this in Playwright MCP and the run halts at <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">open_application</code>: the tool is not in the registry. Try it in Terminator and every step routes through the same dispatch.
        </p>
        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{mixedYaml}</code>
        </pre>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          The honest scope of each kind of MCP
        </h2>

        <AnimatedChecklist
          title="What every browser MCP covers"
          items={browserMcpCovers}
        />

        <AnimatedChecklist
          title="What a desktop MCP adds on top"
          items={desktopMcpAdds}
        />

        <p className="text-zinc-700 leading-relaxed">
          If your agent will only ever live inside a tab, a browser MCP is the right tool and you do not need any of this. <a href="https://github.com/microsoft/playwright-mcp" className="text-orange-600 underline">Playwright MCP</a> is mature, <a href="https://github.com/ChromeDevTools/chrome-devtools-mcp" className="text-orange-600 underline">Chrome DevTools MCP</a> is the right pick for inspecting and debugging a real browser, <a href="https://browsermcp.io/" className="text-orange-600 underline">Browser MCP</a> is good for fully local Chrome control, <a href="https://github.com/browser-use/browser-use" className="text-orange-600 underline">browser-use</a> for self-hosted agent loops. The argument here is only relevant if your workflow leaves the tab even once.
        </p>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          Install and verify the unified dispatch
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The two tells that the dispatch root is the OS, not a tab: <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">navigate_browser</code> appears next to <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">open_application</code> in <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">claude mcp list</code>, and <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">execute_sequence</code> accepts a YAML that mixes both without a custom adapter.
        </p>
        <pre className="my-6 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900 p-5 text-[13px] leading-relaxed text-zinc-100">
          <code>{installSteps}</code>
        </pre>

        <h2 className="mt-12 mb-4 text-2xl font-mono font-semibold text-zinc-900">
          When to use this, and when not to
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Use a desktop MCP when the agent has to cross from the page into a native window in a single workflow: download then open in Acrobat, scrape then paste into Excel, complete an OAuth flow that lands in a desktop authenticator, fill a system Save dialog, run a shell command between two browser steps. Use a browser MCP when the workflow stays in the tab, because the smaller registry is cheaper to plan against and the install is one binary.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The mistake is to bolt on a second MCP and assume the model will pick the right one. It will, sometimes; the failures show up at the boundary, where the model has to context-switch between two selector grammars and two state spaces, and they cost more than the migration to a unified dispatch would have.
        </p>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Have a workflow that keeps tripping over the tab boundary?"
          description="Show us where your browser MCP gives up and we'll walk through where Terminator picks up. 30 minutes, no slides."
        />

        <FaqSection heading="Browser MCP to desktop FAQ" items={faqs} />

        <RelatedPostsGrid
          title="Related guides"
          posts={[
            {
              title: "Playwright MCP server, then off the page",
              excerpt: "Same MCP shape, broader scope: how Terminator extends Playwright MCP into native windows.",
              tag: "Compare",
              href: "/t/playwright-mcp-server",
            },
            {
              title: "When browser agents leave the DOM",
              excerpt: "What breaks the moment a workflow crosses out of the DOM, and how a unified selector grammar fixes it.",
              tag: "Deep dive",
              href: "/t/browser-agents-leaving-the-dom",
            },
            {
              title: "Terminator MCP",
              excerpt: "The MCP server itself: tool list, install, examples.",
              tag: "Reference",
              href: "/t/terminator-mcp",
            },
          ]}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See it bridge browser and desktop in 30 minutes."
      />
    </article>
  );
}
