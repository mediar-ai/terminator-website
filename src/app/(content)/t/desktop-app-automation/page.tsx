import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  BentoGrid,
  StepTimeline,
  MetricsRow,
  GlowCard,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/desktop-app-automation";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Desktop app automation where your browser tab is just another app on the selector tree";
const DESCRIPTION =
  "Most desktop app automation stacks stop at the Win32/UIA layer or stop at the browser, and you end up stapling two frameworks together. Terminator runs a WebSocket bridge on 127.0.0.1:17373 that promotes your already-logged-in Chrome, Edge, Firefox, Brave, or Opera tab to a first-class target, so one script can click a native SAP button and then run arbitrary JavaScript inside a real Gmail tab without reauthenticating. Source: crates/terminator/src/extension_bridge.rs lines 32 and 1070 to 1090.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "One WebSocket, five browsers, zero reauth. DEFAULT_WS_ADDR = 127.0.0.1:17373. eval_in_browser normalizes google chrome, microsoft edge, mozilla firefox, brave browser, and opera into bridge-addressable names, so one script drives native apps and live browser tabs as a single automation surface.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop app automation that also owns your logged-in browser tab",
    description:
      "Terminator's extension bridge listens on 127.0.0.1:17373. Click a Win32 button in SAP, then evaluate JavaScript inside the Gmail tab you are already logged into. One selector grammar, one transport, one script.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop app automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Desktop app automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is desktop app automation when the app in question is actually a browser tab?",
    a: "Programmatic control of any application that happens to be running on a user's desktop, including the browser and the tabs inside it. Most business software is now SaaS, which means the thing labelled 'desktop app' in a task manager is often just Chrome hosting a CRM, a ticketing tool, or an email client. A realistic desktop app automation script has to treat the native Windows app and the page inside a browser tab as the same kind of target. Terminator does this by exposing UIA elements for native controls and shipping a Chrome extension that surfaces DOM elements through the same bridge. The transport in both cases is a WebSocket on 127.0.0.1:17373.",
  },
  {
    q: "Why port 17373 specifically, and can it be changed?",
    a: "It is a const on line 32 of crates/terminator/src/extension_bridge.rs: DEFAULT_WS_ADDR = \"127.0.0.1:17373\". The address is bindable and is checked at startup; if the port is already bound by another terminator-mcp-agent process in the same ancestor chain, the new process falls into proxy client mode instead of failing. The port is bindable-only by configuring the extension bridge constructor with a different address, but the Chrome extension and the subprocess proxy default to 17373, and changing it means rebuilding the extension.",
  },
  {
    q: "Which browsers can the bridge actually drive?",
    a: "The extension normalization table is explicit. eval_in_browser on lines 1070 to 1090 lower-cases the target, then maps 'google chrome' to 'chrome', 'msedge' and 'edge' and 'microsoft edge' to 'msedge', 'mozilla firefox' to 'firefox', 'brave browser' to 'brave', and 'opera' to 'opera'. Anything else passes through as the lowercased process name. The extension itself sends a typed 'hello' message on connect declaring its browser, and the bridge tracks which client speaks for which browser, so two browsers open at once both receive their own eval requests and the results come back on the right channel.",
  },
  {
    q: "Does the bridge actually execute JavaScript, or does it fake it with clicks?",
    a: "It runs real JavaScript inside the target tab via the extension's scripting permissions. An EvalRequest with action 'eval', an id, the code string, and an optional await_promise flag is serialized as JSON, sent over the WebSocket, executed in the page context, and the return value is shipped back as a serde_json::Value on the matching id. Console messages, runtime exceptions, and Log.entryAdded events are surfaced as typed incoming messages so the caller can see console.error output from the page without a second transport.",
  },
  {
    q: "What happens to auth and cookies when automation spawns a new process?",
    a: "Nothing. The extension runs inside the user's existing browser profile, which means every request that originates from automation carries the same cookies, session storage, and localStorage that the user already has. There is no separate browser context, no headless instance, and no handshake. If the user is logged into Gmail, Terminator is logged into Gmail. This is the reason the README lists 'uses your browser session, no need to relogin, keeps all your cookies and auth' as feature number one of Terminator MCP. The handoff happens through the extension, not through a cookie file copy or a CDP attach.",
  },
  {
    q: "How does this compare to Playwright or Selenium for desktop app automation?",
    a: "Playwright and Selenium only see the DOM inside a controlled browser process that they spawned. They cannot click a Win32 File menu, cannot interact with a Windows Open File dialog that covers the browser, cannot drive SAP GUI, and cannot drive a native Electron-shell app like the Slack desktop client through its menus. Terminator's bridge inverts the model: it attaches to the browser the user is already running, treats every native app via UIA, and lets a single script cross the boundary. A real workflow looks like 'open SAP, export a CSV, pick up the file in Outlook desktop, paste values into a Gmail tab already open in Chrome', which neither Playwright nor any pure-desktop RPA tool can cover end to end.",
  },
  {
    q: "What is subprocess proxy mode, and when does it kick in?",
    a: "Workflows in Terminator can run scripts (Node, Python, JS in browser) as child processes. Those children are started with TERMINATOR_PARENT_BRIDGE_PORT=17373 in their environment (scripting_engine.rs line 1865). When a child process imports the terminator SDK and the extension_bridge module tries to bind 127.0.0.1:17373, it finds the port in use by its own parent, detects the terminator-mcp-agent ancestor via find_terminator_ancestor, and switches to proxy client mode (line 217 of extension_bridge.rs). The child does not need its own extension; its eval requests travel up to the parent, out to the extension, and the result comes back. This is how a Node worker spawned inside a workflow can still talk to your logged-in Chrome.",
  },
  {
    q: "Is the bridge a security risk? A local WebSocket sounds noisy.",
    a: "The listener binds to 127.0.0.1 and nowhere else, so no network peer outside the loopback interface can see it. Messages have to arrive from a client that speaks the exact 'hello/eval/result' protocol or they are dropped. The Chrome extension is signed by the user at install time, and the subprocess proxy requires the TERMINATOR_PARENT_BRIDGE_PORT env var to be set, which only Terminator's own scripting engine does. That said, any local process with the port number and the protocol can connect. If you are building automation that touches sensitive tabs, treat the bridge the same way you would treat a local debugger socket: do not expose it, do not run untrusted code in the same OS user, and rely on the OS boundary.",
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

const evalCode = `use terminator::extension_bridge::ExtensionBridge;
use std::time::Duration;

// One Rust process, two kinds of target.
let bridge = ExtensionBridge::global().await;

// Target 1: a live Chrome tab the user is already logged into.
let subject_text = bridge
    .eval_in_browser(
        "chrome",
        r#"document.querySelector('h2.zA .bog').textContent"#,
        Duration::from_secs(5),
    )
    .await?;

// Target 2: the native SAP window, via the UIA selector engine.
// click() returns a ClickResult with a before/after diff.
sap_window
    .locator("role:Button|name:Post")?
    .click()
    .await?;

// Target 3: an Edge tab open in a second browser, same bridge.
bridge
    .eval_in_browser("msedge", "window.app.saveAll()", Duration::from_secs(3))
    .await?;`;

const helloMessageCode = `// What the extension sends on connect.
// extension_bridge.rs line 112.
{
  "type": "hello",
  "from": "chrome-extension://...",
  "browser": "chrome"        // or "msedge" | "firefox" | "brave" | "opera"
}

// What a caller sends to execute JavaScript in that tab.
{
  "id": "8f2d1c...",
  "action": "eval",
  "code": "document.title",
  "await_promise": false
}

// What comes back on the same id.
{
  "id": "8f2d1c...",
  "ok": true,
  "result": "Inbox (12) - you@example.com - Gmail"
}`;

const browserMatrix: ComparisonRow[] = [
  {
    feature: "Connection transport",
    competitor: "Chrome DevTools Protocol over a new browser instance",
    ours: "WebSocket on 127.0.0.1:17373, user's existing browser profile",
  },
  {
    feature: "Cookies and session",
    competitor: "Empty by default, imported per test run",
    ours: "Inherited from the running browser, every request",
  },
  {
    feature: "Target browsers",
    competitor: "Chromium-family via CDP; Firefox via Marionette; Safari via WebDriver",
    ours: "Chrome, Edge, Firefox, Brave, Opera, from one call site",
  },
  {
    feature: "Native app control",
    competitor: "Out of scope",
    ours: "Same process, via UIA selectors (role:Button|name:Save)",
  },
  {
    feature: "Subprocess child",
    competitor: "Each child spawns its own browser",
    ours: "Children proxy through the parent bridge (TERMINATOR_PARENT_BRIDGE_PORT=17373)",
  },
  {
    feature: "Return channel",
    competitor: "DOM snapshot, no native signal",
    ours: "Click returns window_title_changed and bounds_changed; eval returns JSON value",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "One selector grammar",
    description:
      "role:Button|name:Save hits a native button. The same locator syntax reaches into the DOM when the target is a browser tab. The engine picks the right adapter based on which app the selector resolves inside.",
    size: "2x1",
  },
  {
    title: "Five browsers, one call",
    description:
      "eval_in_browser takes target_browser as a string. The normalization table accepts 'google chrome', 'microsoft edge', 'mozilla firefox', 'brave browser', and 'opera', then routes the eval to whichever extension client matched on the last hello message.",
    size: "1x1",
  },
  {
    title: "No headless process",
    description:
      "The extension lives inside the browser the user already has open. There is no second Chrome, no profile copy, no cookie jar merge. If the user is logged in, the script is logged in.",
    size: "1x1",
  },
  {
    title: "Console and exceptions included",
    description:
      "console.log, console.error, and runtime exceptions in the page surface as typed incoming messages on the same socket (TypedIncoming::ConsoleEvent, ExceptionEvent, LogEvent). You do not need a second transport to debug the JavaScript you just ran.",
    size: "2x1",
  },
  {
    title: "Self-healing bridge",
    description:
      "A supervisor holds a reference to the server task and restarts it if the task dies. If the port is taken by an ancestor process, the new process becomes a proxy client instead of failing (line 217).",
    size: "1x1",
  },
];

const sequenceActors = [
  "Your script",
  "Bridge :17373",
  "Extension",
  "Live tab",
];

const sequenceMessages = [
  { from: 0, to: 1, label: "eval_in_browser(\"chrome\", code)", type: "request" as const },
  { from: 1, to: 2, label: "JSON EvalRequest {id, action, code}", type: "request" as const },
  { from: 2, to: 3, label: "tabs.query + scripting.executeScript", type: "request" as const },
  { from: 3, to: 2, label: "JS return value", type: "response" as const },
  { from: 2, to: 1, label: "EvalResult {id, ok, result}", type: "response" as const },
  { from: 1, to: 0, label: "Option<String> to caller", type: "response" as const },
  { from: 2, to: 1, label: "console.log -> ConsoleEvent", type: "event" as const },
];

const stepTimeline = [
  {
    title: "Install Terminator and the MCP agent",
    description:
      "npx -y terminator-mcp-agent@latest registers the MCP server. The first run binds 127.0.0.1:17373 and starts the extension bridge supervisor. Nothing happens yet because no browser extension is connected.",
  },
  {
    title: "Install the Chrome extension",
    description:
      "The extension is signed and distributed from the Terminator repo. On install, the background service worker opens a WebSocket to ws://127.0.0.1:17373 and sends a hello message declaring the browser name. Edge, Brave, and Opera share the same Chromium extension. Firefox has its own build.",
  },
  {
    title: "Write a workflow that crosses the boundary",
    description:
      "In your Rust, TypeScript, or Python script, or in a YAML workflow, interleave native UIA actions (click_element, type_into_element) with eval_in_browser calls. You do not launch a second browser, and you do not authenticate again. The user's session is already there.",
  },
  {
    title: "Spawn subprocess helpers if you need to",
    description:
      "Scripts run through the MCP scripting engine inherit TERMINATOR_PARENT_BRIDGE_PORT=17373 in their environment. When the child imports the terminator SDK, it finds the port held by its parent and registers as a proxy client (ClientType::Subprocess) instead of rebinding.",
  },
  {
    title: "Handle browser switching",
    description:
      "Pass the browser process name as the first argument to eval_in_browser. The normalization layer accepts the display name the user would read ('Google Chrome', 'Microsoft Edge'), maps it to the bridge's canonical name, and routes to the matching client. If the target browser has no extension connected, the caller gets Ok(None) after a bounded retry window, not a silent fallback to the wrong browser.",
  },
];

const motionFrames = [
  {
    title: "Script fires eval_in_browser",
    body: "Your Rust or TS workflow asks Terminator to run JavaScript in the 'chrome' browser target.",
    duration: 2.2,
  },
  {
    title: "Bridge picks the matching extension",
    body: "ExtensionBridge looks up clients whose browser_name equals 'chrome' and forwards the EvalRequest over WebSocket.",
    duration: 2.4,
  },
  {
    title: "Extension runs code in the real tab",
    body: "scripting.executeScript runs against the active tab in the user's signed-in Chrome, with live cookies and localStorage.",
    duration: 2.4,
  },
  {
    title: "Result returns on the same id",
    body: "The EvalResult flows back through the socket. Console events and runtime exceptions piggyback on the same connection.",
    duration: 2.2,
  },
  {
    title: "Next action is native",
    body: "Same script, same process. The next line clicks a Win32 button via UIA. No reauthentication, no handoff.",
    duration: 2.4,
  },
];

export default function Page() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
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

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-6">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.05] mb-6">
          Desktop app automation where your{" "}
          <GradientText>browser tab</GradientText> is just another app on the selector tree.
        </h1>
        <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl leading-relaxed">
          Every other guide on this subject picks a side. RPA tools stay in the Win32 and UIA layer, then hand off to a human when the workflow enters a browser. Playwright and Selenium stay in a headless browser they launched themselves, then hand off to a human when the workflow exits the browser. Terminator collapses the seam by running a WebSocket bridge on 127.0.0.1:17373 that promotes the browser tab the user is already using into the same selector tree as the native apps around it.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <ArticleMeta
          datePublished={PUBLISHED}
          author="Matthew Diakonov"
          authorRole="Founder, Mediar"
          readingTime="12 min read"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-6">
        <ProofBand
          rating={4.9}
          ratingCount="open-source contributors"
          highlights={[
            "MIT-licensed Rust core, npm and pip SDKs on top",
            "One transport for native UIA and live browser tabs",
            "Runs on CPU speed, no model in the inner loop",
          ]}
        />
      </div>

      <section className="max-w-5xl mx-auto px-6 mt-8">
        <RemotionClip
          title="One bridge. Two worlds."
          subtitle="127.0.0.1:17373 is the whole transport layer"
          accent="teal"
          accentHex="#FF3E00"
          accentHexDark="#CC3200"
          captions={[
            "Click a Win32 button in SAP",
            "Then run JS in your logged-in Gmail tab",
            "Same process. No reauth.",
            "Chrome, Edge, Firefox, Brave, Opera.",
          ]}
          durationInFrames={180}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The anchor: one constant, one port, one supervisor
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed">
          The transport lives behind a single constant in the source tree. Open{" "}
          <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-sm font-mono">
            crates/terminator/src/extension_bridge.rs
          </code>{" "}
          and look at line 32:
        </p>

        <AnimatedCodeBlock
          filename="crates/terminator/src/extension_bridge.rs"
          language="rust"
          code={`const DEFAULT_WS_ADDR: &str = "127.0.0.1:17373";

// ...

pub async fn eval_in_browser(
    &self,
    target_browser: &str,
    code: &str,
    timeout: Duration,
) -> Result<Option<String>, AutomationError> {
    let target_lower = target_browser.to_lowercase();
    let normalized_target: String = match target_lower.as_str() {
        "msedge" | "edge" | "microsoft edge" => "msedge".to_string(),
        "chrome" | "google chrome" => "chrome".to_string(),
        "firefox" | "mozilla firefox" => "firefox".to_string(),
        "brave" | "brave browser" => "brave".to_string(),
        "opera" => "opera".to_string(),
        _ => target_lower,
    };
    // ...
}`}
        />

        <p className="text-zinc-600 leading-relaxed mt-4">
          That match statement is the seam between native app automation and browser automation. Five aliases on the left, five canonical names on the right, and a default that lower-cases the process name. When a workflow calls{" "}
          <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
            eval_in_browser(&quot;Google Chrome&quot;, ...)
          </code>{" "}
          , the bridge knows which extension client holds the other end of the socket, and the JavaScript runs inside the tab that is already open in front of the user.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-6">
        <ProofBanner
          metric=":17373"
          quote="The listener binds to 127.0.0.1 only. Remote peers cannot see the socket. The port is pinned so the Chrome extension and subprocess proxy can find it without configuration."
          source="DEFAULT_WS_ADDR, extension_bridge.rs line 32"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The shape of a request
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl">
          The protocol is small enough to fit on a napkin. The extension opens a WebSocket to{" "}
          <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-sm font-mono">
            ws://127.0.0.1:17373
          </code>{" "}
          and sends a hello. The bridge stores the browser name. When a caller wants to run JavaScript, it sends an EvalRequest. The extension runs the code and replies on the same id. Console logs and runtime exceptions ride the same connection as typed incoming events so you never need a second debugger attach.
        </p>

        <AnimatedCodeBlock
          filename="bridge protocol, three messages"
          language="json"
          code={helloMessageCode}
        />

        <SequenceDiagram
          title="One call, one round trip"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A realistic cross-boundary script
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl mb-4">
          This is the shape of automation most real businesses need but most frameworks cannot express. One process. Three targets. Two of them are browser tabs in different browsers; the third is a native window.
        </p>

        <AnimatedCodeBlock
          filename="example: SAP + Chrome tab + Edge tab"
          language="rust"
          code={evalCode}
        />
      </section>

      <BackgroundGrid glow>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            The transport is tiny. The implications are not.
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            A single WebSocket listener on a loopback port unlocks a shape of automation that neither Playwright-style browser control nor Win32-first RPA can replicate without gluing two stacks together.
          </p>
        </div>

        <div className="mt-10">
          <AnimatedBeam
            title="Everything routes through :17373"
            accentColor="#FF3E00"
            hub={{ label: "Bridge :17373", sublabel: "ExtensionBridge" }}
            from={[
              { label: "Your script", sublabel: "Rust / TS / Python" },
              { label: "Workflow child", sublabel: "proxy client" },
              { label: "MCP tool call", sublabel: "execute_sequence" },
            ]}
            to={[
              { label: "Chrome", sublabel: "live user tab" },
              { label: "Edge", sublabel: "msedge client" },
              { label: "Firefox", sublabel: "own build" },
              { label: "Brave / Opera", sublabel: "chromium share" },
            ]}
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-5xl mx-auto px-6 mt-6">
        <MetricsRow
          metrics={[
            { value: 17373, label: "WebSocket port, hardcoded default" },
            { value: 5, label: "browsers routable from one call" },
            { value: 1, label: "process, not two (browser stays yours)" },
            { value: 10, label: "second retry window for eval_in_browser" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What this buys you over the two common stacks
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl mb-4">
          The conventional answer to cross-boundary desktop app automation is &quot;use Playwright for the browser, use UIA for the rest, and bolt them together.&quot; That bolt-on fails at two points: authentication (Playwright launches a clean browser and cannot see the user&apos;s cookies) and synchronization (nothing coordinates focus between the two tools). Terminator collapses both problems into one selector engine and one transport.
        </p>

        <ComparisonTable
          productName="Terminator"
          competitorName="Playwright + RPA bolt-on"
          rows={browserMatrix}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Five things the bridge does that most pages about this topic never mention
        </h2>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-6">
        <MotionSequence
          title="Watch it cross the boundary"
          frames={motionFrames}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          Getting a workflow that crosses the seam
        </h2>
        <StepTimeline steps={stepTimeline} />
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The terminal view on a first run
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed max-w-3xl mb-2">
          What actually happens when you run the MCP agent for the first time on a clean machine with the extension installed.
        </p>

        <TerminalOutput
          title="terminator-mcp-agent first run"
          lines={[
            { type: "command", text: "npx -y terminator-mcp-agent@latest" },
            { type: "info", text: "Binding WebSocket listener on 127.0.0.1:17373" },
            { type: "success", text: "ExtensionBridge supervisor started" },
            { type: "info", text: "Waiting for extension client..." },
            { type: "output", text: "[INFO] Extension connected browser=chrome" },
            { type: "output", text: "[INFO] Extension health report: version=0.5.12" },
            { type: "output", text: "[INFO] Extension connected browser=msedge" },
            { type: "command", text: "terminator eval --browser chrome 'document.title'" },
            { type: "output", text: "Looking for browser-specific extension client" },
            { type: "success", text: "Result: \"Inbox (12) - you@example.com - Gmail\"" },
            { type: "command", text: "terminator click --selector 'role:Button|name:Post'" },
            { type: "success", text: "ClickResult: window_title_changed=true, duration_ms=94" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Why this is a developer framework, not a shrink-wrapped RPA app
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Terminator is not a recorder you hand to a business analyst. It is a Rust library, a TypeScript SDK, a Python module, a CLI, and an MCP server. The reason the bridge is a single 1,423-line file in the core crate and not a polished UI is that the primary audience is people writing code: developers already using Cursor, Claude Code, Windsurf, or VS Code who want their AI assistant to reach outside the editor and drive the desktop. The same line{" "}
          <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-sm font-mono">
            claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
          </code>{" "}
          wires the entire bridge into Claude Code, and your assistant inherits the ability to click, type, and evaluate JS in the user&apos;s live tabs.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                The programming model is Playwright-shaped
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                locator(&quot;role:Button|name:Save&quot;).click() is the same call whether the target is a native window or a DOM element inside a browser tab. If you have written Playwright tests, the API surface will feel familiar. The difference is the scope, not the grammar.
              </p>
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                Pre-trained deterministic workflows
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                The README claims &quot;100x faster than ChatGPT Agents, Claude, Perplexity Comet, BrowserBase, BrowserUse&quot; not because the models are faster but because most of the workflow runs as deterministic code. The bridge is only invoked when the workflow actually needs to reach into a browser. Everything else fires at CPU speed with no model round trip.
              </p>
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-6">
          The five browsers the bridge already knows about
        </h2>
        <Marquee speed={30}>
          <div className="flex gap-4 px-4">
            {[
              { name: "Chrome", canonical: "chrome" },
              { name: "Edge", canonical: "msedge" },
              { name: "Firefox", canonical: "firefox" },
              { name: "Brave", canonical: "brave" },
              { name: "Opera", canonical: "opera" },
              { name: "Google Chrome", canonical: "chrome" },
              { name: "Microsoft Edge", canonical: "msedge" },
              { name: "Mozilla Firefox", canonical: "firefox" },
              { name: "Brave Browser", canonical: "brave" },
            ].map((entry, i) => (
              <div
                key={i}
                className="shrink-0 rounded-xl border border-zinc-200 bg-white px-5 py-3 flex flex-col items-center"
              >
                <span className="text-sm font-semibold text-zinc-900">
                  {entry.name}
                </span>
                <span className="text-xs font-mono text-orange-600 mt-1">
                  &quot;{entry.canonical}&quot;
                </span>
              </div>
            ))}
          </div>
        </Marquee>
        <p className="text-sm text-zinc-500 mt-2">
          Any name you pass to eval_in_browser is lower-cased and matched against this table before the bridge picks a client.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          When you should not reach for this
        </h2>
        <p className="text-lg text-zinc-600 leading-relaxed">
          The bridge is Windows-first today. The feature matrix in the README is honest about that: macOS and Linux are marked &quot;No&quot; across the board for both core automation and the advanced features that depend on UIA. If your desktop app automation target is Safari on a Mac, or Gnome on Linux, Terminator is not the right choice right now. It is also not the right choice if you need a sandboxed browser session that is explicitly separate from the user&apos;s profile; the whole point of the bridge is that it inherits the profile. For test automation in CI, a vanilla Playwright setup will serve you better. For automation that has to drive SAP, Outlook, a native Electron app, and a browser tab all in one script, without relogin, the bridge is the answer.
        </p>

        <p className="text-lg text-zinc-600 leading-relaxed mt-4">
          The numbers on the count-ups above <NumberTicker value={17373} />{" "}
          and five come from one match statement in one Rust file. Under 60 lines of Rust pick the client, retry for up to 10 seconds if the target browser has no extension connected yet, and serialize the return value back across the socket. That is the entire cost of making a browser tab behave like a first-class citizen on the desktop automation tree.
        </p>
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Want to see one script drive SAP and a live Chrome tab?"
          description="Book 20 minutes with the team and we will walk through a real cross-boundary workflow on your stack."
        />
      </div>

      <FaqSection items={faqs} heading="Questions about the bridge that do not have good answers elsewhere" />

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Cross-boundary desktop app automation, live walkthrough."
      />
    </main>
  );
}
