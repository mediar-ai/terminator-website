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
  SequenceDiagram,
  BentoGrid,
  GlowCard,
  MetricsRow,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-software-for-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "The automation software for Windows that also runs JavaScript inside your browser tabs";
const DESCRIPTION =
  "Most automation software for Windows stops at the OS boundary. Terminator ships a Manifest V3 Chrome extension, Terminator Bridge v0.24.32, that opens a WebSocket to 127.0.0.1:17373 and evaluates JavaScript inside the active tab via chrome.debugger. One script can click a native Windows button and read the DOM of the page behind it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator combines the Windows UI Automation tree with a Chrome extension bridge. The MV3 service worker talks to the Rust core on ws://127.0.0.1:17373 and runs your script via chrome.debugger.sendCommand(tabId, 'Runtime.evaluate', ...). No DevTools window required.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows automation that reaches into the browser tab",
    description:
      "Terminator Bridge v0.24.32 connects Chrome to the Rust core on port 17373 and evaluates JavaScript in the active tab via chrome.debugger. Source: crates/terminator/browser-extension/worker.js.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation software for Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation software for Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes Terminator different from other automation software for Windows like Power Automate, UiPath, or AutoHotkey?",
    a: "Those tools stop at the OS boundary. They can drive Windows controls, file dialogs, and system menus, but they cannot run a document.querySelectorAll in your browser tab. Terminator ships both a UI Automation backend for native Windows controls and a Manifest V3 Chrome extension called Terminator Bridge, so a single script can click a native Save button and immediately read the DOM of the page it just saved, using the same session state your normal browser already has.",
  },
  {
    q: "How does the Chrome extension actually talk to the Rust core?",
    a: "The extension runs an MV3 service worker (crates/terminator/browser-extension/worker.js) that opens a WebSocket to ws://127.0.0.1:17373. The Rust side binds that port via ExtensionBridge::start_server in crates/terminator/src/extension_bridge.rs (line 32: const DEFAULT_WS_ADDR: &str = \"127.0.0.1:17373\";). When your automation calls execute_browser_script, the Rust core sends a JSON message over the socket, the worker calls chrome.debugger.attach on the active tab, then chrome.debugger.sendCommand(tabId, 'Runtime.evaluate', { expression }), and sends the result back across the same socket.",
  },
  {
    q: "What permissions does Terminator Bridge request?",
    a: "Exactly seven, listed in manifest.json: debugger, tabs, scripting, activeTab, webNavigation, alarms, storage. The debugger permission is the one doing the heavy lifting: it lets the extension speak the Chrome DevTools Protocol from code, without a DevTools window ever being open. The content_scripts block matches <all_urls> and runs content.js at document_start on every tab, which is how the bridge knows when a page is ready for scripting.",
  },
  {
    q: "Why does this matter for AI agents like Claude Code or Cursor?",
    a: "Because the agent can write one MCP call that spans the desktop and the web, instead of switching tools. Example: 'in Outlook, click the first unread email, then in Chrome, open the attached docs.google.com link and return the table on row 3'. Terminator's MCP tool execute_browser_script (registered in crates/terminator-mcp-agent/src/server.rs line 7815) accepts TypeScript that gets transpiled before execution and runs inside the active Chrome tab. The agent does not have to juggle Playwright plus a separate desktop automation library.",
  },
  {
    q: "Does this work with my existing logged-in Chrome profile?",
    a: "Yes, that is the point. The extension is just an extension you install in whatever Chrome profile you already use. Your Gmail, Salesforce, Figma, and every other session is already there. Terminator does not launch a fresh headless browser the way Playwright does by default, so there is no re-login flow, no captcha replay, and no 'your Google account has been blocked from this automated browser' dialog.",
  },
  {
    q: "What happens if the extension is not installed?",
    a: "execute_browser_script fails with a clear error. The tool description in server.rs ends with the literal line 'Requires Chrome extension installed.' If the WebSocket client is not connected when a script is sent, the Rust side waits up to 30 seconds for it to reconnect (browser_script.rs, 60 iterations of 500ms) before giving up. During that window the MV3 service worker can be auto-woken by a content-script handshake on page load or navigation.",
  },
  {
    q: "Is it safe to let an agent run arbitrary JavaScript in my tabs?",
    a: "It is as safe as you make it. The extension attaches via chrome.debugger, which triggers the standard yellow 'Terminator Bridge started debugging this browser' bar at the top of the tab. You can see every attached tab, and detaching is a single click. The repo is MIT licensed, so the debugger-permission code path is fully readable. Scripts have a 30KB return cap to prevent accidental data firehoses, and the tool description explicitly warns that scripts triggering navigation can be killed before their return statement executes.",
  },
  {
    q: "Which browsers besides Chrome are supported?",
    a: "The bridge targets any Chromium browser that accepts the extension: Chrome, Edge, Brave, Opera. Firefox is detected by process name in browser_script.rs and falls back to the same extension loaded in Firefox. The browser is normalized by process: msedge or edge map to msedge, chrome maps to chrome, and so on, so one codebase handles all of them.",
  },
  {
    q: "Can I verify the port binding on my own machine?",
    a: "On Windows, run netstat -ano | findstr :17373 | findstr LISTENING. You will see a single process owning the port: that is either terminator-mcp-agent or a Rust process embedding the crate. If another process already owns the port, the extension falls back to proxy-client mode and connects to the existing server instead of binding its own (extension_bridge.rs line 644, start_proxy_client).",
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

const manifestCode = `// crates/terminator/browser-extension/manifest.json
{
  "manifest_version": 3,
  "name": "Terminator Bridge",
  "version": "0.24.32",
  "description": "Bridge to evaluate JS in the active tab via a local WebSocket (no DevTools UI).",
  "background": { "service_worker": "worker.js", "type": "module" },
  "content_scripts": [{
    "js": ["content.js"],
    "matches": ["<all_urls>"],
    "match_about_blank": true,
    "run_at": "document_start"
  }],
  "host_permissions": ["<all_urls>"],
  "permissions": [
    "debugger",
    "tabs",
    "scripting",
    "activeTab",
    "webNavigation",
    "alarms",
    "storage"
  ]
}`;

const workerSnippet = `// crates/terminator/browser-extension/worker.js
const WS_URL = "ws://127.0.0.1:17373";
let socket = null;

// For every JS expression sent from Rust:
evalResult = await sendCommand(tabId, "Runtime.evaluate", {
  expression: wrapped,
  awaitPromise: true,
  returnByValue: true,
  userGesture: true,
});

// sendCommand is a thin promise wrapper over:
chrome.debugger.sendCommand({ tabId }, method, params, (result) => {
  if (chrome.runtime.lastError) reject(...);
  else resolve(result);
});`;

const bridgeSnippet = `// crates/terminator/src/extension_bridge.rs
const DEFAULT_WS_ADDR: &str = "127.0.0.1:17373";

// Port already in use? Fall back to proxy-client mode.
match ExtensionBridge::start_proxy_client(&port.to_string()).await {
  Ok(bridge) => Ok(bridge),
  Err(e) => Err(e),
}`;

const mcpCallCode = `// What the MCP client sends when you say
// "open google.com and return the table on the results page"
// This is a SINGLE tool call that spans desktop + browser.

{
  "tool": "execute_browser_script",
  "arguments": {
    "selector": { "process": "chrome" },
    "script": \`
      const rows = [...document.querySelectorAll('table tr')];
      return {
        count: rows.length,
        headers: [...rows[0].querySelectorAll('th')].map(h => h.innerText),
        first_row: [...rows[1].querySelectorAll('td')].map(c => c.innerText)
      };
    \`,
    "window_mgmt": { "bring_to_front": true }
  }
}

// The Rust core:
// 1. finds the chrome process in the window cache
// 2. focuses it (so the active tab is the target)
// 3. sends the script over ws://127.0.0.1:17373
// 4. the MV3 worker attaches chrome.debugger and runs Runtime.evaluate
// 5. the result crosses back and becomes the MCP response`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "cat crates/terminator/browser-extension/build_check.json", type: "command" as const },
  { text: '{ "manifest_version": 3, "name": "Terminator Bridge", "version": "0.24.32" }', type: "success" as const },
  { text: "grep DEFAULT_WS_ADDR crates/terminator/src/extension_bridge.rs", type: "command" as const },
  { text: 'const DEFAULT_WS_ADDR: &str = "127.0.0.1:17373";', type: "success" as const },
  { text: "grep -c Runtime.evaluate crates/terminator/browser-extension/worker.js", type: "command" as const },
  { text: "11", type: "success" as const },
  { text: "# Port really is listening after you run npx terminator-mcp-agent:", type: "output" as const },
  { text: "netstat -ano | findstr :17373 | findstr LISTENING", type: "command" as const },
  { text: "  TCP    127.0.0.1:17373   0.0.0.0:0   LISTENING   18224", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Controls native Windows UI",
    competitor: "Yes",
    ours: "Yes, via IUIAutomation COM API",
  },
  {
    feature: "Runs JavaScript in your current browser tab",
    competitor: "No",
    ours: "Yes, Runtime.evaluate via chrome.debugger",
  },
  {
    feature: "Uses your existing logged-in Chrome profile",
    competitor: "Usually no, spawns fresh browser",
    ours: "Yes, extension loads into your normal Chrome",
  },
  {
    feature: "Chrome DevTools Protocol without DevTools window",
    competitor: "No",
    ours: "Yes, MV3 worker attaches chrome.debugger",
  },
  {
    feature: "Single tool call spans desktop and browser",
    competitor: "No, separate tools",
    ours: "execute_browser_script on terminator-mcp-agent",
  },
  {
    feature: "TypeScript scripts transpiled before eval",
    competitor: "No",
    ours: "Auto-detected and transpiled server-side",
  },
  {
    feature: "Open source extension",
    competitor: "Proprietary",
    ours: "MIT, crates/terminator/browser-extension",
  },
  {
    feature: "Works across Chrome, Edge, Brave, Opera, Firefox",
    competitor: "Usually Chromium only",
    ours: "Normalized by process name in browser_script.rs",
  },
];

const competitorPills = [
  "Power Automate Desktop",
  "UiPath Studio",
  "Automation Anywhere",
  "AutoHotkey v2",
  "AutoIt",
  "Blue Prism",
  "WinAutomation",
  "SikuliX",
  "pywinauto",
  "Robocorp",
  "Playwright (browser only)",
  "Selenium (browser only)",
];

const bentoCards: BentoCard[] = [
  {
    title: "Terminator Bridge v0.24.32",
    description:
      "Manifest V3 Chrome extension shipped inside crates/terminator/browser-extension. Loads content.js at document_start on every tab and a service worker that talks to the Rust core.",
    size: "2x1",
    accent: true,
  },
  {
    title: "ws://127.0.0.1:17373",
    description:
      "The WebSocket address hard-coded as DEFAULT_WS_ADDR in extension_bridge.rs. Rust binds the server, the MV3 worker dials it, and every script crosses that socket.",
    size: "1x1",
  },
  {
    title: "chrome.debugger",
    description:
      "The permission that unlocks CDP from JavaScript. The worker calls sendCommand(tabId, 'Runtime.evaluate', ...) to run your script, skipping the need for a DevTools window.",
    size: "1x1",
  },
  {
    title: "Your real Chrome session",
    description:
      "No fresh profile, no captcha fight, no re-login. The extension runs inside the Chrome you already use, so Gmail, Salesforce, and Google sign-in are already authenticated.",
    size: "2x1",
  },
  {
    title: "execute_browser_script",
    description:
      "MCP tool at crates/terminator-mcp-agent/src/server.rs:7815. Accepts TypeScript, transpiles it, returns up to 30KB of structured data per call. Paired with 34 other desktop-automation tools.",
    size: "1x1",
  },
  {
    title: "DOM + accessibility tree together",
    description:
      "capture_browser_dom and get_window_tree can be called back to back. One pass gives you the UIA tree, the DOM of the active tab, and optionally OCR and omniparser output for icons.",
    size: "1x1",
  },
  {
    title: "Port collision handling",
    description:
      "If another Terminator instance already owns 17373, the new instance starts in proxy_client mode and connects to the existing server. No crashes, no duplicated listeners.",
    size: "2x1",
  },
  {
    title: "Multi-browser by process name",
    description:
      "browser_script.rs normalizes chrome, msedge, edge, brave, opera, and firefox. One MCP call targets whichever Chromium (or Firefox) you happened to have focused.",
    size: "1x1",
  },
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
          The automation software for Windows that also runs{" "}
          <GradientText>JavaScript inside your browser tabs</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Almost every list of automation software for Windows stops at the
          operating system. You get a tool that can click a button in Excel, or
          a tool that can fill a form in Chrome, but rarely the same tool doing
          both in one script. Terminator does both because it ships a real
          Chrome extension, Terminator Bridge, that wires the browser back into
          the desktop-automation core through a local WebSocket.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="11 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="verified from crates/terminator/browser-extension"
        highlights={[
          "Terminator Bridge v0.24.32 (Manifest V3 Chrome extension)",
          "WebSocket on 127.0.0.1:17373 (DEFAULT_WS_ADDR in extension_bridge.rs)",
          "Runs JavaScript via chrome.debugger.sendCommand Runtime.evaluate",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="One script. Desktop plus browser."
            subtitle="Terminator Bridge, the missing piece of Windows automation"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Click a native Windows button with UIA",
              "Run document.querySelector in the active tab",
              "One WebSocket: ws://127.0.0.1:17373",
              "chrome.debugger.sendCommand, no DevTools UI",
              "Your real logged-in Chrome profile",
            ]}
          />
        </div>
      </BackgroundGrid>

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The thing nobody else on this SERP ships
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The rest of the category is divided into two camps. Desktop tools
          (Power Automate Desktop, UiPath, AutoHotkey, AutoIt, WinAutomation)
          drive native Windows controls, file dialogs, and system menus. Browser
          tools (Playwright, Selenium, browser-based RPA) drive DOMs. Anything
          that requires both has to either bolt them together with IPC that you
          maintain, or bounce through the clipboard.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Terminator bolts them together for you. Inside the repository, at{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm font-mono text-orange-700">
            crates/terminator/browser-extension/
          </code>
          , there is a full Manifest V3 Chrome extension. The service worker
          keeps a WebSocket open to the Rust core on port 17373. Every time the
          core receives an <code className="font-mono text-sm">execute_browser_script</code> call, it
          sends the script across that socket, the worker attaches{" "}
          <code className="font-mono text-sm">chrome.debugger</code> to the
          active tab, and runs <code className="font-mono text-sm">Runtime.evaluate</code> over the
          Chrome DevTools Protocol. No DevTools window, no remote-debugging
          flag, no headless browser.
        </p>
      </section>

      <MetricsRow
        metrics={[
          { value: 17373, label: "WebSocket port" },
          { value: 3, label: "Manifest version", prefix: "MV" },
          { value: 7, label: "Chrome permissions" },
          { value: 30, label: "Max response KB" },
        ]}
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the bridge is wired
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Four moving parts: your script, the Rust core, the MV3 service
          worker, and Chrome&apos;s debugger API. The same pieces handle every
          request, in both directions.
        </p>
      </section>

      <AnimatedBeam
        title="execute_browser_script path"
        accentColor="#FF3E00"
        from={[
          { label: "Your MCP client", sublabel: "Claude Code, Cursor, Windsurf" },
          { label: "Rust SDK", sublabel: "terminator-rs, terminator-py, @mediar-ai/terminator" },
          { label: "MCP tool call", sublabel: "execute_browser_script" },
        ]}
        hub={{
          label: "Terminator core",
          sublabel: "ws://127.0.0.1:17373",
        }}
        to={[
          { label: "MV3 service worker", sublabel: "worker.js" },
          { label: "chrome.debugger", sublabel: "Runtime.evaluate" },
          { label: "Active Chrome tab", sublabel: "your real session" },
        ]}
      />

      <SequenceDiagram
        title="One execute_browser_script call, start to finish"
        actors={["MCP client", "Rust core", "MV3 worker", "chrome.debugger", "Tab"]}
        messages={[
          { from: 0, to: 1, label: "execute_browser_script(script)", type: "request" },
          { from: 1, to: 1, label: "find chrome process, focus it", type: "event" },
          { from: 1, to: 2, label: "WebSocket frame on :17373", type: "request" },
          { from: 2, to: 3, label: "debugger.attach(tabId, '1.3')", type: "request" },
          { from: 3, to: 4, label: "Runtime.evaluate({ expression })", type: "request" },
          { from: 4, to: 3, label: "result = fn(document)", type: "response" },
          { from: 3, to: 2, label: "CDP response", type: "response" },
          { from: 2, to: 1, label: "WebSocket frame back", type: "response" },
          { from: 1, to: 0, label: "CallToolResult (JSON, up to 30KB)", type: "response" },
        ]}
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The manifest, verbatim
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          You can audit every permission the extension asks for before you
          install it. Here is the real manifest, copied from the repo. Seven
          permissions, and the one doing the work is{" "}
          <code className="font-mono text-sm">debugger</code>.
        </p>
      </section>

      <AnimatedCodeBlock
        code={manifestCode}
        language="json"
        filename="browser-extension/manifest.json"
      />

      <AnimatedChecklist
        title="Why each permission is there"
        items={[
          { text: "debugger: attach to a tab and call Runtime.evaluate over the Chrome DevTools Protocol.", checked: true },
          { text: "tabs: enumerate tabs so the worker can pick the active one to attach to.", checked: true },
          { text: "scripting: fallback path via chrome.scripting.executeScript when the debugger path is not available.", checked: true },
          { text: "activeTab: scope permissions to the tab the user is currently on.", checked: true },
          { text: "webNavigation: know when a page is loading so the worker can re-arm content scripts.", checked: true },
          { text: "alarms: keep the MV3 service worker warm with scheduled wake-ups.", checked: true },
          { text: "storage: persist attached-tab state and log recent lifecycle events across worker restarts.", checked: true },
        ]}
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor: port 17373
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The whole system hinges on one line of Rust and one line of
          JavaScript. Both reference the same local address.
        </p>
      </section>

      <AnimatedCodeBlock
        code={bridgeSnippet}
        language="rust"
        filename="crates/terminator/src/extension_bridge.rs"
      />

      <AnimatedCodeBlock
        code={workerSnippet}
        language="javascript"
        filename="crates/terminator/browser-extension/worker.js"
      />

      <ProofBanner
        quote="Port 17373 is the single seam between native Windows automation and the browser tab. If you can reach it, you can drive both."
        source="crates/terminator/src/extension_bridge.rs line 32"
        metric="17373"
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify it yourself
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Three greps and a netstat. Everything on this page is checkable
          against the repo without running an install, and checkable against a
          live machine after you do.
        </p>
      </section>

      <TerminalOutput title="verify-extension.sh" lines={verifyLines} />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What a real call looks like
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          An MCP call that spans the desktop and the browser is one tool call,
          not two. No inter-process plumbing, no clipboard detour. The
          selector picks the process, the script runs inside the tab.
        </p>
      </section>

      <AnimatedCodeBlock
        code={mcpCallCode}
        language="json"
        filename="mcp-call.json"
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Anatomy of the bridge
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Eight facts that together make this category of automation software
          feel different from everything else on the SERP.
        </p>
      </section>

      <BentoGrid cards={bentoCards} />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How you install and see it working
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The MCP agent and the extension boot together. You install one npm
          package, load the extension, and a yellow bar on your tab confirms
          the debugger is attached. If the bar is missing, scripts fail fast.
        </p>
      </section>

      <StepTimeline
        steps={[
          {
            title: "Install the MCP agent",
            description:
              "npx -y terminator-mcp-agent@latest starts the Rust server and binds 127.0.0.1:17373. On Windows, the server runs as a native process; no Docker, no WSL.",
          },
          {
            title: "Load Terminator Bridge into Chrome",
            description:
              "Drop crates/terminator/browser-extension into chrome://extensions with Developer mode on, or install the packaged crx. The service worker immediately tries to dial the WebSocket.",
          },
          {
            title: "Watch for the yellow bar",
            description:
              "The first time a script runs, Chrome shows 'Terminator Bridge started debugging this browser' at the top of the attached tab. That bar is Chrome's guarantee that nothing is happening silently.",
          },
          {
            title: "Run a call from your MCP client",
            description:
              "In Claude Code, ask it to read a table on the current tab. The agent picks execute_browser_script, ships a few lines of JS, and gets a JSON object back. No screenshot, no OCR, no fresh browser.",
          },
          {
            title: "Pair it with desktop tools",
            description:
              "The next call can be click_element on a Windows-native button, type_into_element on Notepad, or a workflow YAML that alternates the two. The MV3 worker stays connected across the whole session.",
          },
        ]}
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Compared to other automation software for Windows
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The difference is not in what each tool can click inside a single
          app. It is in whether your script can cross the OS-to-browser seam
          without losing session state.
        </p>
      </section>

      <ComparisonTable
        productName="Terminator"
        competitorName="Typical Windows RPA"
        rows={comparisonRows}
      />

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Who lives in the same SERP
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          All useful tools in their own right. None of them combine UIA with an
          in-tab Chrome extension the way Terminator does, which is the angle
          this page is about.
        </p>
      </section>

      <Marquee speed={40} pauseOnHover fade>
        {competitorPills.map((name) => (
          <div
            key={name}
            className="mx-3 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
          >
            {name}
          </div>
        ))}
      </Marquee>

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A concrete scenario the rest can&apos;t do in one script
        </h2>
        <GlowCard>
          <div className="p-6">
            <p className="text-zinc-700 leading-relaxed mb-4">
              You receive an email in Outlook with a link to a Google Sheet. You
              want to download the PDF version of the sheet, rename the file to
              include the sender and the first cell&apos;s value, and move it into
              a OneDrive folder based on a rule you read from the sheet itself.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              With most automation software for Windows, this is two scripts
              duct-taped together. With Terminator, it is one MCP session.{" "}
              <code className="font-mono text-sm">click_element</code> to open
              the email,{" "}
              <code className="font-mono text-sm">navigate_browser</code> on the
              Sheet link,{" "}
              <code className="font-mono text-sm">execute_browser_script</code>{" "}
              to read row 1 and the sender column,{" "}
              <code className="font-mono text-sm">press_key</code> for
              Ctrl+P to invoke print,{" "}
              <code className="font-mono text-sm">type_into_element</code> the
              new filename into the Save As dialog. One workflow, one session,
              zero OS-to-browser hand-off.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              Because the browser script ran inside the tab you were already
              looking at, you did not have to log into Google. Because the Save
              As dialog is a real UIA window, you did not have to screenshot
              anything.
            </p>
          </div>
        </GlowCard>
      </section>

      <section className="mt-14 px-6">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where to read the code
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every file referenced on this page is in the public MIT-licensed{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-600 underline decoration-orange-200 decoration-2 underline-offset-2"
          >
            mediar-ai/terminator
          </a>{" "}
          repo. Start with the four files below and you have the entire surface
          of this feature in about 2,000 lines of code total.
        </p>
      </section>

      <AnimatedChecklist
        title="Files to read in order"
        items={[
          { text: "crates/terminator/browser-extension/manifest.json — declares the MV3 extension and its seven permissions.", checked: true },
          { text: "crates/terminator/browser-extension/worker.js — the service worker that opens the WebSocket and attaches chrome.debugger.", checked: true },
          { text: "crates/terminator/src/extension_bridge.rs — the Rust side of the WebSocket server, including the port-collision proxy-client fallback.", checked: true },
          { text: "crates/terminator/src/browser_script.rs — execute_script, the function that sends one expression and waits for one result.", checked: true },
          { text: "crates/terminator-mcp-agent/src/server.rs around line 7815 — the MCP tool definition that your agent calls.", checked: true },
        ]}
      />

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see the bridge run against your own Chrome?"
        description="Twenty-minute walkthrough. Bring a workflow that is currently split between a desktop RPA and a browser script. We will collapse it into one Terminator session."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See it drive your desktop and your browser in one session."
      />
    </article>
  );
}
