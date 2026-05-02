import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedBeam,
  BeforeAfter,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  BentoGrid,
  SequenceDiagram,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/browser-agents-leaving-the-dom";
const PUBLISHED = "2026-05-01";
const TITLE =
  "Browser agents leaving the DOM: where the tool surface ends, and what to do about it";
const DESCRIPTION =
  "Every browser agent breaks the moment its workflow crosses out of the DOM. The download triggers a Save dialog, the link opens a native app, the OAuth code arrives in a desktop authenticator. Terminator's MCP runs a Manifest V3 extension on a local WebSocket on 127.0.0.1:17373 next to the OS accessibility tree, so the same click_element selector works on both sides of the boundary.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Browser agents lose their tool surface the moment a workflow leaves the DOM. The fix is not to keep the agent in the DOM. The fix is one selector grammar that spans the page and the OS at the same time.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "When the DOM ends, the agent does not have to",
    description:
      "Manifest V3 extension on ws://127.0.0.1:17373, plus the UIA tree, behind one set of MCP tools. Same selector grammar inside and outside the page.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Browser agents leaving the DOM" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Browser agents leaving the DOM", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"leaving the DOM\" actually mean for a browser agent?",
    a: "Any moment where the next thing the agent has to interact with is not a DOM node. The most common ones are the OS file save dialog after a download, the \"Open With...\" handler that picks a native app, the system print dialog, the credentials autofill dialog, the OS notification that says \"app X wants to access Y\", a 2FA code that lands in a desktop authenticator app, or the moment a downloaded file has to be opened in Excel or a PDF viewer to finish the task. The DOM ends, document.querySelector returns nothing useful, and the Playwright or CDP-style toolset goes silent. The agent did not lose the task. It lost the tool surface that the task requires for the next click.",
  },
  {
    q: "Why can't a browser agent just call showSaveFilePicker and stay in the DOM?",
    a: "Two reasons. First, showSaveFilePicker is gated behind a user-activation requirement: it only fires inside a synchronous handler for a real click or keypress, and it returns a different (security-restricted) UI in headless or scripted browsers. Second, every download triggered through a normal anchor tag, content-disposition response, or third-party site does not go through the File System Access API at all. It triggers Chrome's built-in download flow, which in turn surfaces the OS save dialog or the per-file prompt depending on the user's setting. Neither of those is reachable through the page's JavaScript execution context. The DOM does not own them.",
  },
  {
    q: "How does Terminator keep the same tool surface working on both sides of the boundary?",
    a: "It runs two adapters under the same MCP tool grammar. Inside the page, a Manifest V3 Chrome extension named \"Terminator Bridge\" (manifest at crates/terminator/browser-extension/manifest.json, version 0.24.32) holds a WebSocket connection to the MCP server on ws://127.0.0.1:17373 (extension_bridge.rs:32) and runs scripts in the active tab through the chrome.scripting and debugger APIs. Outside the page, the OS accessibility tree (UIAutomation on Windows) exposes every native element of every running app. The MCP tools (click_element, type_into_element, press_key, execute_browser_script, set_value, capture_screenshot) take a single selector format and dispatch to whichever adapter the target lives in. The agent does not call a different tool when it crosses from a Submit button in the page to the Save button in the file dialog.",
  },
  {
    q: "What's special about the coordinate system when both adapters are live at once?",
    a: "Browser agents and OS agents normally live in different coordinate spaces. The DOM gives you CSS pixels relative to the viewport. The OS gives you physical pixels relative to the screen. Terminator's capture_browser_dom_elements at crates/terminator-mcp-agent/src/server.rs:838 reconciles them in two steps. It looks up the UIA element with role:Document for the focused tab, reads its screen bounds, and uses the (x, y) of that element as the viewport offset. Then for every DOM element it serializes, it multiplies getBoundingClientRect's CSS pixel coords by window.devicePixelRatio (server.rs:911-914) so they are in physical pixels. The result is that a DOM element's reported coordinates and a UIA element's reported coordinates are in the same space. A click that is computed from the DOM lands in the same place a click computed from the UIA tree would land. Without that step, you cannot mix the two adapters in one workflow without drift on a 4K monitor or on a Retina display.",
  },
  {
    q: "Which browsers does the bridge detect, and what happens for the rest?",
    a: "Five browser process-name patterns are detected at crates/terminator/src/browser_script.rs:20-32: \"chrome\", \"msedge\" or \"edge\", \"firefox\", \"brave\", and \"opera\". The detection picks the right extension target so the WebSocket message is dispatched to the correct active tab. For any other browser the code falls through to \"chrome\" as the default. If the extension is not installed in the running browser, execute_browser_script will block on the connection handshake (extension_bridge.rs has a 30 second wait loop in 500ms ticks before giving up) and then return an error to the agent. UIA-based clicks (click_element, type_into_element) keep working in that browser regardless because they do not touch the extension at all.",
  },
  {
    q: "How is this different from a Playwright agent that uses a CDP downloads listener?",
    a: "A CDP downloads listener gives you the file path of a finished download, not control over the dialog. If the user has \"Ask where to save each file\" enabled, the dialog still pops up and the listener does not see it. If the next step in the workflow is to open that downloaded PDF in Acrobat, click \"Edit PDF\", and type a value into a text box, you are now fully outside the browser and CDP gives you nothing. A UIA-based tool grammar continues to expose every step. You write the same selector format (role:Button, name:Edit PDF, window:Acrobat) you would write to click a button in the browser chrome.",
  },
  {
    q: "What about file dialogs the agent has to fill in, not just click through?",
    a: "The Windows file save dialog is a UIA tree of its own. It exposes a role:Edit element named \"File name:\" and a role:Button named \"Save\". In Terminator's tool surface that is type_into_element with selector \"role:Edit window:Save As\" followed by click_element with selector \"role:Button name:Save\". The agent does not need to know that the previous step was a click on a DOM anchor and the current step is a click on a Win32 button. The MCP tools are the same; the dispatch happens internally. This is the same point as the \"one tool surface\" answer above, but it matters specifically for save dialogs because most browser-agent failures end on exactly this dialog.",
  },
  {
    q: "Is this approach safe? The Manifest V3 extension asks for the debugger permission.",
    a: "Yes, by design. The manifest at crates/terminator/browser-extension/manifest.json declares debugger, tabs, scripting, activeTab, webNavigation, alarms, and storage. The debugger permission is only needed for cases where the chrome.scripting API alone cannot reach a frame (cross-origin iframes that do not match the content-script origin pattern, mostly). The extension only accepts WebSocket messages from 127.0.0.1, so a remote site cannot connect to it. The local-only socket plus a single-origin handshake is the same trust model Playwright and Puppeteer use for their CDP endpoints. If you are running this on a shared workstation, you should still treat the listening port as a trust boundary and not run untrusted code on the same machine, but the same is true of any local automation framework.",
  },
  {
    q: "Why is this a Windows-first story, and what does that mean for macOS?",
    a: "Terminator currently ships Windows-only binaries for its Node.js, Python, and MCP server packages. The Windows UIAutomation tree is the platform of record for desktop automation: Microsoft maintains it, third-party apps target it for accessibility compliance, and the surface is reasonably stable across Windows 10 and 11. macOS support existed at the Rust core for several months and was deleted on 2025-12-16 (commit 0c11011c) to focus on the path with the most depth. macOS users today get the browser-side tools through the extension, but the \"clicking native dialogs\" half of this story does not work on macOS in Terminator yet. If you are building this on macOS, the right starting points are Hammerspoon's axuielement Lua module or MacPaw's macapptree.",
  },
  {
    q: "What does it cost to add this to an existing Claude Code or Cursor agent?",
    a: "One MCP install line. For Claude Code: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". For Cursor or VS Code, add the same command to the mcpServers block of the MCP config. The Chrome extension is bundled inside the npm package and the agent will print a load-unpacked path on first use. Once both are loaded, the agent gets every tool described above (click_element, type_into_element, execute_browser_script, navigate_browser, run_command, plus another roughly twenty action tools that accept ui_diff_before_after for delta-based tree updates). No code change in the agent's prompt is required; the new tools just appear.",
  },
];

const beforeAfterContent = {
  before: {
    label: "DOM-only agent",
    content:
      "Click the Export button, get a download URL, lose the agent. The Save dialog blocks the page, document.querySelectorAll returns the same tree as before, no new event fires in the page context. The agent retries the Export click, gets a second dialog, and stalls. The CDP downloads listener finally reports the file path, but the next step (open it in Acrobat, fill the form, save it back) is a tree the browser cannot see.",
    highlights: [
      "Save dialog is invisible from the page context",
      "CDP downloads listener returns a path, not a UI",
      "Next app (Acrobat, Excel, native auth) is fully outside scope",
      "Recovery is vision fallback or human handoff",
    ],
  },
  after: {
    label: "DOM + accessibility tree",
    content:
      "Click the Export button (role:Button name:Export). The Save dialog opens, the agent reads role:Edit name:File name: and types into it. Click role:Button name:Save. The download finishes, the agent calls open_application with name:Acrobat, then walks the next UIA tree the same way. From the agent's prompt point of view, none of these steps are more special than the first one. The selector grammar covers all of them.",
    highlights: [
      "One selector grammar covers DOM and OS",
      "Save dialog is just another tree of role + name elements",
      "open_application launches Acrobat, Excel, anything else",
      "execute_browser_script available when JS is the right tool",
    ],
  },
};

const timelineSteps = [
  {
    title: "Step 1, in the DOM, the easy part",
    description:
      "The agent calls click_element with selector role:Button name:Export. The MCP server detects the target PID is a browser process (chrome, msedge, edge, firefox, brave, or opera based on browser_script.rs:20-32), routes the click through the UIA tree of the browser window, and the page handler fires.",
  },
  {
    title: "Step 2, the page handler triggers a download, the DOM ends",
    description:
      "Chrome's download flow takes over. The page does not get a new event. document.activeElement is still the Export button. A DOM-only agent would now look at a snapshot identical to its previous one and either retry or give up. The Save dialog is a separate top-level window owned by chrome.exe.",
  },
  {
    title: "Step 3, the agent reads the new UIA tree",
    description:
      "The agent calls get_window_tree on window:Save As. UIA returns the dialog tree: role:Edit name:File name:, role:ComboBox name:Save as type:, role:Button name:Save, role:Button name:Cancel. The tool is the same one the agent used to read the page tree two steps ago. The selector format is the same. There is no separate library, no separate runtime.",
  },
  {
    title: "Step 4, type and click, the dialog goes away",
    description:
      "type_into_element with role:Edit name:File name: and the path string. click_element with role:Button name:Save. The dialog closes. The download lands at the path the agent wrote. The browser is back in focus.",
  },
  {
    title: "Step 5, the next app, still the same tools",
    description:
      "open_application name:Acrobat. UIA wakes the new process. The agent walks Acrobat's tree exactly the way it walked the page and the dialog. If the agent needs the page DOM again at any point (to extract a JSON value the page has but the UIA tree does not), execute_browser_script is one tool call away.",
  },
];

const beamFrom = [
  { label: "Agent (Claude / Cursor / VS Code)", sublabel: "MCP client" },
  { label: "click_element", sublabel: "tool call" },
  { label: "execute_browser_script", sublabel: "tool call" },
];

const beamHub = {
  label: "terminator-mcp-agent",
  sublabel: "router",
};

const beamTo = [
  { label: "UIA tree", sublabel: "Windows accessibility" },
  { label: "Manifest V3 extension", sublabel: "ws://127.0.0.1:17373" },
  { label: "OS file dialogs", sublabel: "native windows" },
  { label: "Native apps", sublabel: "Acrobat, Excel, Outlook" },
];

const sequenceActors = [
  "Agent",
  "MCP server",
  "Chrome extension",
  "UIA tree",
  "Save dialog",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "click_element role:Button name:Export",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "InvokePattern.Invoke()",
    type: "request" as const,
  },
  {
    from: 3,
    to: 1,
    label: "ok, browser fires download",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "ok, ui_diff_before_after",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "type_into_element role:Edit window:Save As",
    type: "request" as const,
  },
  {
    from: 1,
    to: 4,
    label: "ValuePattern.SetValue(path)",
    type: "request" as const,
  },
  {
    from: 4,
    to: 1,
    label: "ok",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "execute_browser_script (extract JSON from page)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "WS eval { code, await_promise }",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "result string",
    type: "response" as const,
  },
];

const failurePoints: BentoCard[] = [
  {
    title: "Download save dialog",
    description:
      "Triggered by every link with content-disposition: attachment, plus every download() call. The page never sees the dialog. CDP returns the eventual file path; the dialog UI is unreachable from the agent.",
    size: "1x1",
  },
  {
    title: "Open With... handler",
    description:
      "The OS picks the application that handles a custom protocol or a downloaded mime type. The browser hands the URL to chrome.exe's IPC and is done. Whatever the user clicks in the system dialog never returns to the page.",
    size: "1x1",
  },
  {
    title: "Print dialog",
    description:
      "window.print() opens a Chrome-rendered preview that exposes only a thin DOM the page does not own. The Print and Cancel buttons live in the browser chrome's UIA tree, not the page DOM.",
    size: "1x1",
  },
  {
    title: "Permission and credential prompts",
    description:
      "Geolocation, clipboard, USB, and password autofill prompts render as native chrome elements. document.activeElement still points at whatever the page focused last; the prompt is a sibling tree.",
    size: "1x1",
  },
  {
    title: "OAuth handoff to a desktop app",
    description:
      "When an OAuth flow finishes by deep-linking into a native authenticator (Microsoft Authenticator, Okta Verify, 1Password), control leaves the browser entirely. The page sees only the redirect URL.",
    size: "1x1",
  },
  {
    title: "Downloaded file -> editor",
    description:
      "The most common case for office workflows. The browser produced an Excel file. Now the agent has to open it, type values, and re-upload. The DOM is irrelevant for the middle of that.",
    size: "1x1",
  },
];

const compareRows: ComparisonRow[] = [
  {
    feature: "DOM access (querySelector, eval JS)",
    competitor:
      "Yes, primary surface (Playwright eval, CDP Runtime.evaluate, browser-use)",
    ours: "Yes, via execute_browser_script through Manifest V3 extension on ws://127.0.0.1:17373",
  },
  {
    feature: "OS file save / open dialog",
    competitor:
      "No. CDP downloads listener returns a path, the dialog UI is unreachable",
    ours: "Yes. The dialog is a UIA tree (role:Edit, role:Button) the same tool grammar walks",
  },
  {
    feature: "Native app launched from a download",
    competitor: "No. Out of scope; the browser process does not see it",
    ours: "Yes. open_application + UIA tree of the new process",
  },
  {
    feature: "OAuth that handoffs to a desktop authenticator",
    competitor:
      "Partial. Page sees the redirect URL; the click in the desktop auth app needs a separate framework",
    ours: "Yes. Same MCP tools click the auth app's UIA tree, then return to the browser",
  },
  {
    feature: "Coordinate system reconciliation",
    competitor:
      "DOM-only. CSS pixels relative to viewport; physical-pixel calls are out of scope",
    ours: "DOM coords scaled by window.devicePixelRatio plus UIA Document offset (server.rs:911-914)",
  },
  {
    feature: "Recovery when DOM goes silent",
    competitor: "Vision fallback (LLM looks at a screenshot and guesses pixels)",
    ours: "Tree fallback. UIA tree is structured, role-typed, and always present for the focused window",
  },
  {
    feature: "Same selector grammar across surfaces",
    competitor: "No. Page selectors and OS selectors are separate worlds",
    ours: "Yes. role:Button name:Save works in the page chrome, in the file dialog, and in Acrobat",
  },
];

const checklistItems = [
  { text: "Chrome download flow with \"Ask where to save\" enabled", checked: true },
  { text: "Per-file Save dialog after a content-disposition response", checked: true },
  { text: "OS-level Open With handler dialog", checked: true },
  { text: "window.print() preview and the Print / Cancel buttons", checked: true },
  { text: "Geolocation, clipboard, USB, and password permission prompts", checked: true },
  { text: "OAuth deep-link into a native authenticator app", checked: true },
  { text: "Downloaded Excel / PDF opened in Office or Acrobat", checked: true },
  { text: "Files dragged from the page into a desktop app", checked: true },
  { text: "Page reads from a desktop clipboard manager", checked: true },
];

const relatedPosts = [
  {
    title: "Accessibility API for AI agents: stop re-reading the whole tree, diff it",
    href: "/t/accessibility-api-ai-agents",
    excerpt:
      "Twenty MCP tools accept ui_diff_before_after. Two regexes strip volatile ids and bounds. The full tree gets sent once; every action returns a delta.",
    tag: "Tree diff",
  },
  {
    title: "Accessibility API for computer-use agents",
    href: "/t/accessibility-api-computer-use-agents",
    excerpt:
      "Why role-typed elements beat pixel coordinates for long-running agents, and how the Windows UIA tree fits into a tool grammar an LLM can drive.",
    tag: "Computer use",
  },
  {
    title: "Open source computer-use agents, April 2026",
    href: "/t/open-source-computer-use-agents-april-2026",
    excerpt:
      "Side-by-side notes on the open-source projects that drive desktops with LLMs, what each one ships today, and where the gaps are.",
    tag: "Roundup",
  },
];

export default function BrowserAgentsLeavingTheDomPage() {
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

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 mt-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
          Tool surface, not just selectors
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight tracking-tight">
          Browser agents leaving the DOM, and the tool surface that does not break when they do
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          Every browser agent has the same failure mode. The workflow starts in the page, hits a download, a save dialog, an &ldquo;Open With&rdquo; handoff, or a desktop authenticator, and the tool surface ends. The fix is not to keep the agent in the DOM. The fix is one selector grammar that spans the page and the OS at the same time.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
      />

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified May 2026)
          </p>
          <p className="text-zinc-900 font-semibold leading-snug">
            One tool surface with two adapters.
          </p>
          <p className="text-zinc-700 mt-2 leading-relaxed">
            A Manifest V3 Chrome extension that runs JavaScript in the active tab, plus the OS accessibility tree (UIAutomation on Windows) for everything outside the tab. Both adapters share one selector grammar (<code className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-orange-200">role:Button name:Save</code>) so the agent does not change tools when the workflow crosses out of the page. In Terminator that is the <code className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-orange-200">terminator-mcp-agent</code> npm package, with the bridge listening on <code className="font-mono text-sm bg-white px-1.5 py-0.5 rounded border border-orange-200">ws://127.0.0.1:17373</code>.
          </p>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The failure trace, in five steps
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          A real workflow looks like this. The user has asked the agent to export a report from a web app, save it to disk, open it in Acrobat, and fill in two fields. The agent gets through step one and dies in step two. Almost every browser agent fails on the same boundary, in the same order.
        </p>

        <StepTimeline steps={timelineSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What changes when the agent has both adapters live
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The toggle below shows the same five-step task from two perspectives. The DOM-only agent only sees what the page tells it. The dual-adapter agent sees the page plus the OS, and treats both as one tree of role and name pairs.
        </p>

        <BeforeAfter
          before={beforeAfterContent.before}
          after={beforeAfterContent.after}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the page tells the agent it is on its own
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          These are the boundaries every browser agent crosses, sorted roughly by how often they break a real workflow. None of them are bugs in the agent. They are the design of the browser sandbox.
        </p>

        <BentoGrid cards={failurePoints} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The router, in one diagram
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The agent talks to one MCP server. The MCP server picks an adapter per tool call. Page-shaped calls go through the Manifest V3 extension over a localhost WebSocket. OS-shaped calls go through UIAutomation. Every native dialog, every native app, every browser chrome element is reachable through the same tool surface.
        </p>

        <AnimatedBeam
          title="One MCP, two adapters"
          from={beamFrom}
          hub={beamHub}
          to={beamTo}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A real call sequence
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The first three messages live inside the browser chrome but outside the DOM. The middle two are the file save dialog. The last three are the page DOM via the extension. From the agent&rsquo;s prompt the only differences are the selector strings.
        </p>

        <SequenceDiagram
          title="Agent -> MCP -> adapter"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The coordinate trick that makes it work
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          A subtle thing makes &ldquo;same tool surface&rdquo; actually true at runtime. DOM coordinates are CSS pixels relative to the viewport. OS coordinates are physical pixels relative to the screen. On a 4K monitor with a 1.5x DPI scale, those numbers do not match. <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">getBoundingClientRect()</code> says one thing. UIA says another. A click that mixes the two will land in the wrong place.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          Terminator reconciles them in <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">capture_browser_dom_elements</code> at <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">crates/terminator-mcp-agent/src/server.rs:838</code>. First, it looks up the UIA element with role:Document for the focused tab and reads its screen-bounds (<code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">x</code>, <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">y</code>) as the viewport offset. Second, it scales every DOM rect by <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">window.devicePixelRatio</code> on the way out of the JS context (<code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">server.rs:911-914</code>). The result is that the DOM and the UIA tree report coordinates in the same space. A click computed from a DOM rect lands where a UIA click on the same element would land, and the agent can mix the two tools in one workflow without coordinate drift.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The exact set of boundaries the bridge covers
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The list below is the operational answer to &ldquo;what counts as leaving the DOM.&rdquo; Every item is a place where DOM-only tools return nothing useful and UIA-based tools return a structured tree.
        </p>

        <AnimatedChecklist
          title="Outside the DOM, still inside the tool surface"
          items={checklistItems}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Versus a CDP-only setup
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The closest thing to this in the browser-agent world is a Playwright or CDP-driven loop with vision fallback. Here is what the two approaches do and do not cover, on the same tasks.
        </p>

        <ComparisonTable
          productName="Terminator"
          competitorName="DOM-only browser agent"
          rows={compareRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Setup, in one line
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          For Claude Code, the MCP install is a single command. For Cursor, VS Code, and Windsurf, add the same command to the <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">mcpServers</code> block of the MCP config. The Chrome extension is bundled inside the npm package; the agent prints the load-unpacked path the first time you call <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">execute_browser_script</code>.
        </p>

        <pre className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 overflow-x-auto text-sm font-mono text-zinc-800">
{`# Claude Code
claude mcp add terminator "npx -y terminator-mcp-agent@latest"

# Cursor / VS Code / Windsurf MCP config
{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`}
        </pre>

        <p className="text-zinc-700 leading-relaxed mt-6">
          Currently Windows-only on the binary side. The macOS Rust adapter was deleted on 2025-12-16 (commit <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">0c11011c</code>) to focus on the Windows UIAutomation path where the team has the most depth. If you are building this on macOS today, Hammerspoon&rsquo;s axuielement Lua module is the closest equivalent.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The honest version of the tradeoff
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Two adapters mean two failure modes. The Manifest V3 extension can fall asleep (the service worker has a hard 30 second idle timeout in MV3), and the bridge has a 30-second reconnect loop in 500ms ticks before it gives up. UIA on Windows can return a stale tree if a window has just appeared and not finished its first paint, and the workaround there is the <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">wait_for_element</code> tool with a small timeout. Neither failure mode is silent: both surface as MCP tool errors with the cause in the message.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          The other tradeoff is platform reach. Browser-only agents run on every desktop OS. UIA-based tools run on Windows. If your agent has to ship cross-OS today, you give up the post-DOM half of this story on macOS and Linux until the platform adapters return. That is a real cost, and it is the reason the broader page on macOS accessibility automation says what it says.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Building an agent that needs to leave the DOM?"
        description="Walk through your workflow with us. We will tell you which steps the bridge handles today and which ones still need work."
      />

      <FaqSection items={faqs} />

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on the tool surface"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Have an agent that gets stuck on the Save dialog? Book a call."
      />
    </article>
  );
}
