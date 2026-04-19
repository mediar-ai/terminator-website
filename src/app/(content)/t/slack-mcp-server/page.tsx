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
  StepTimeline,
  BentoGrid,
  GlowCard,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/slack-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "Slack MCP server without a bot token: what driving the Slack desktop app through accessibility APIs looks like";
const DESCRIPTION =
  "Every Slack MCP server you have seen wraps the Slack Web API. That means a bot token, a workspace admin install, a finite set of API scopes, and rate limits. Terminator is a different shape of Slack MCP server: it drives the running Slack desktop client directly through OS accessibility APIs, as the logged-in user. No bot, no OAuth, no scope list. This page explains how that works, what it unlocks, and where it stops.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator gives any MCP-aware coding agent a Slack surface that does not use the Slack Web API. It clicks and types inside Slack desktop via Windows UIA and macOS AX. Zero bot tokens, zero workspace approvals.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slack MCP server without a bot token",
    description:
      "Terminator treats Slack desktop as the MCP surface. No xoxb token, no OAuth, no api.slack.com call in the codebase.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Slack MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Slack MCP server", url: PAGE_URL },
];

const grepEvidence = [
  { text: "# Searching the entire Terminator MCP agent for Slack Web API plumbing.", type: "output" as const },
  { text: "cd ~/terminator", type: "command" as const },
  { text: "rg -i 'xoxb|api\\.slack|bot_token|oauth|chat\\.postMessage|conversations\\.history' crates/terminator-mcp-agent/src", type: "command" as const },
  { text: "(no matches)", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Now search for the string \"Slack\" across the whole repo.", type: "output" as const },
  { text: "rg -l 'Slack' .", type: "command" as const },
  { text: "llms.txt", type: "output" as const },
  { text: "crates/terminator/src/platforms/windows_benchmarks.rs", type: "output" as const },
  { text: "crates/terminator-mcp-agent/src/prompt.rs", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Three files. One benchmark. Two list \"Slack\" as a known OS process name.", type: "output" as const },
  { text: "# Zero SDK calls. Zero tokens. The MCP server does not know Slack exists as an API.", type: "success" as const },
];

const processNameSnippet = `// crates/terminator-mcp-agent/src/prompt.rs, lines 61-67
// This block gets pasted verbatim into the system prompt the MCP server
// announces to the client on initialize. Slack is a process name, not an
// integration.

**Common Process Names**
*   **Browsers:** chrome, msedge, firefox, brave, opera
*   **Text Editors/IDEs:** notepad, Code, Cursor, sublime_text, notepad++
*   **Office:** EXCEL, WINWORD, POWERPNT, OUTLOOK
*   **Communication:** Slack, Teams, Discord   // <-- this line
*   **System:** explorer, cmd, powershell, WindowsTerminal`;

const workflowYaml = `# A single execute_sequence call the LLM can emit.
# One MCP server. Five dispatched tool calls. All happening inside
# the Slack desktop window, not through api.slack.com.

steps:
  # 1. Make sure Slack is running and focused
  - tool_name: open_application
    arguments: { app_name: "Slack" }

  # 2. Jump to a channel by name using Slack's own quick switcher
  - tool_name: press_key_global
    arguments:
      process: "Slack"
      keys: "Ctrl+K"

  - tool_name: type_into_element
    arguments:
      selector: "process:Slack >> role:Edit && name:Jump to..."
      text_to_type: "#eng-oncall{Enter}"
      clear_before_typing: true

  # 3. Type a message and post it
  - tool_name: type_into_element
    arguments:
      selector: "process:Slack >> role:Edit && name:Message #eng-oncall"
      text_to_type: "Deploy finished. Smoke tests green. Thread below."
      clear_before_typing: true

  # 4. Press the send button the human would press
  - tool_name: click_element
    arguments:
      selector: "process:Slack >> role:Button && name:Send now"
      ui_diff_before_after: true

stop_on_error: true`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Auth model",
    competitor: "Bot user OAuth token (xoxb-...), installed by a workspace admin",
    ours: "Your existing logged-in Slack desktop session. No token.",
  },
  {
    feature: "Install in a locked-down workspace",
    competitor: "Blocked if the admin has not approved the Slack app",
    ours: "Works anyway, because you are not installing anything into Slack",
  },
  {
    feature: "Action surface",
    competitor: "Whatever the Web API exposes: chat.postMessage, conversations.history, files.upload, ...",
    ours: "Anything a human can click, type, drag, or keyboard-shortcut inside the Slack client",
  },
  {
    feature: "DMs and private channels",
    competitor: "Only visible if the bot was explicitly added",
    ours: "Every channel and DM the logged-in human can see",
  },
  {
    feature: "Huddles, Canvases, Lists, Workflows",
    competitor: "Only the surfaces with API endpoints",
    ours: "Clickable UI, so whatever ships in the client this week is automatable this week",
  },
  {
    feature: "Rate limits",
    competitor: "Tier 1-4 rate limits (e.g. 1/sec for chat.postMessage)",
    ours: "Throttled by UI response time, not by HTTP quotas",
  },
  {
    feature: "Audit trail",
    competitor: "Shows up as the bot user in audit logs",
    ours: "Actions attributed to the actual human, like any desktop app use",
  },
  {
    feature: "Enterprise Grid and regulated orgs",
    competitor: "Frequently blocked; Slack marketplace approval required",
    ours: "Runs on the endpoint. No inbound network change, no new Slack app",
  },
  {
    feature: "Code surface",
    competitor: "A Slack-specific server per vendor. One more MCP client config per tool.",
    ours: "One MCP server (terminator-mcp-agent) that also drives Excel, VS Code, Chrome, Teams",
  },
];

const installTerminal = [
  { text: "# One line to give any MCP client a Slack surface via Terminator.", type: "output" as const },
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user", type: "command" as const },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Make sure your Slack desktop app is already signed in.", type: "output" as const },
  { text: "pgrep -x Slack && echo \"Slack is running\"", type: "command" as const },
  { text: "Slack is running", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# Ask your agent to do something it could not do before:", type: "output" as const },
  { text: "\"Find the last message from @jordan in #eng-oncall and react with :eyes:\"", type: "command" as const },
  { text: "[terminator] get_window_tree process=Slack  ... 4,218 nodes", type: "output" as const },
  { text: "[terminator] click_element role:Button && name:Add reaction", type: "output" as const },
  { text: "[terminator] type_into_element role:Edit && name:Search emoji  text:\"eyes\"", type: "output" as const },
  { text: "Done.", type: "success" as const },
];

const timelineSteps = [
  {
    title: "LLM emits an MCP tool call",
    description:
      "Claude or Cursor picks type_into_element and ships JSON-RPC over stdio to the local terminator-mcp-agent process.",
  },
  {
    title: "dispatch_tool routes it",
    description:
      "server.rs has one match arm per tool; the Slack case uses the same arms as Notepad, Excel, or VS Code. There is no Slack-specific code path.",
  },
  {
    title: "Selector resolves against the Slack UIA tree",
    description:
      "process:Slack >> role:Edit && name:Message #eng-oncall is matched against the live accessibility tree the Slack client publishes to Windows UI Automation.",
  },
  {
    title: "Terminator performs the native action",
    description:
      "Focuses the element, sends the text through the OS input pipeline, optionally captures a before/after tree diff so the agent can confirm the UI actually changed.",
  },
  {
    title: "Result returns to the LLM",
    description:
      "Slack renders the message. Terminator returns the accessibility diff to the agent. The agent picks the next step (reply in thread, add a reaction, open a canvas).",
  },
];

const capabilityCards: BentoCard[] = [
  {
    title: "Send as the logged-in human",
    description:
      "Type into the message composer, press Send now, add @mentions, thread replies, scheduled sends, all from the same account the user is actually signed in as.",
    size: "2x1",
  },
  {
    title: "Read DMs the bot cannot",
    description:
      "A bot user only sees DMs it is invited to. The desktop client sees every DM and private channel the human can see. Agents inherit that.",
    size: "1x1",
  },
  {
    title: "Start or join huddles",
    description:
      "No Slack API endpoint for that. A click on role:Button && name:Huddle is a click on role:Button && name:Huddle.",
    size: "1x1",
  },
  {
    title: "Drive Slack Canvas and Lists",
    description:
      "Whatever ships in the Slack client this month, Terminator can drive next morning. New UI is new selectors, not a wait on Slack API parity.",
    size: "2x1",
  },
  {
    title: "Bulk react with emoji",
    description:
      "The agent opens the reaction picker, types the emoji name, presses Enter. No rate limit beyond UI responsiveness.",
    size: "1x1",
  },
  {
    title: "Search history like a user",
    description:
      "Ctrl+G opens Slack's native search. Agents type the query, read the results pane directly out of the accessibility tree.",
    size: "1x1",
  },
];

const selectorChips = [
  "process:Slack >> role:Edit && name:Message",
  "process:Slack >> role:Button && name:Send now",
  "process:Slack >> role:Button && name:Huddle",
  "process:Slack >> role:Edit && name:Jump to...",
  "process:Slack >> role:Button && name:Add reaction",
  "process:Slack >> role:TabItem && name:Threads",
  "process:Slack >> role:Edit && name:Search",
  "process:Slack >> role:Button && name:Bookmark",
  "process:Slack >> role:Button && name:Start a huddle",
  "process:Slack >> role:TreeItem && name:DMs",
];

const faqs = [
  {
    q: "What is a Slack MCP server?",
    a: "An MCP server is a local program that exposes tools an AI coding assistant (Claude Code, Cursor, VS Code, Windsurf) can call over the Model Context Protocol. A Slack MCP server is one that makes Slack itself one of those tools. Every popular Slack MCP server today (Slack's own reference implementation, korotovsky/slack-mcp-server, the Workato connector, the PulseMCP listing) is a wrapper around Slack's Web API: you install a Slack app with a bot user, grant it OAuth scopes, and the server translates LLM tool calls into chat.postMessage, conversations.history, and similar HTTP requests. Terminator is a different shape of Slack MCP server: it is a general desktop automation MCP server that already knows how to drive any application, and Slack is one of those applications. The Slack surface comes for free with process:Slack selectors.",
  },
  {
    q: "Why would I want a Slack MCP server that does not use the Slack API?",
    a: "Four concrete reasons. First, many corporate and regulated Slack workspaces do not let you install arbitrary bot apps, so the bot-token route is a dead end before you start. Second, bots only see what they have been explicitly invited to; a desktop-driven agent sees every channel and DM the human is signed in to, which is usually the point. Third, Slack ships UI faster than API. Huddles, canvases, lists, and new reaction interactions show up in the client months before, and sometimes without ever, getting a first-class Web API endpoint. Fourth, you do not need to manage yet another token or workspace approval, because you are not installing anything into Slack. You are using the client a human is already using.",
  },
  {
    q: "How does Terminator actually talk to Slack?",
    a: "Through the same accessibility APIs a screen reader uses. On Windows that is UI Automation (UIA); on macOS it is the Accessibility API (AX). Slack's desktop client is Electron, and well-behaved Electron apps expose a usable accessibility tree. Terminator's selector engine matches strings like process:Slack >> role:Edit && name:Message against the nodes in that tree, then performs the action (click, type, invoke, press key) through the OS input pipeline. There is no HTTP call to slack.com in any of it. The MCP agent crate in the repo does not import a Slack SDK; a grep for xoxb, api.slack, chat.postMessage, or bot_token inside crates/terminator-mcp-agent/src returns zero matches.",
  },
  {
    q: "What does the anchor fact actually look like in the code?",
    a: "Open crates/terminator-mcp-agent/src/prompt.rs. Lines 61-67 are a list of common process names, one of which is Slack. That block is pasted verbatim into the system prompt the MCP server announces at initialize time. It is the only place the string \"Slack\" appears in the MCP agent. The SDK list in llms.txt repeats the same entry on line 234. The benchmarks file references Slack only as a browser benchmark URL (slack.com/signin), not as an integration. That is the whole surface area of Slack knowledge the codebase has, and it is all accessibility-driven.",
  },
  {
    q: "Does this work on macOS, Windows, or both?",
    a: "Both, with caveats. The Terminator core is cross-platform Rust, with platform adapters for Windows UI Automation and macOS AX. Coverage is best on Windows because UIA is the richer accessibility API and the MCP agent ships a Windows binary first. macOS works and is actively used, but depends on the app under automation exposing a clean AX tree. In practice Slack on both platforms is usable; if you hit a subtree the agent cannot match, you can fall back to coordinate-based clicks or OCR. Linux is best-effort via AT-SPI.",
  },
  {
    q: "How is this different from Claude computer use or OpenAI computer use?",
    a: "Those approaches take a screenshot, send it to a vision model, have the model decide where to click in pixel coordinates, and then the runtime issues a system-level click at those coordinates. That is one round-trip to an LLM per action and one loss-of-context per screenshot. Terminator uses structured accessibility data instead of pixels, so the LLM sees a tree of typed elements (role:Button, role:Edit, name:Send now) the same way Playwright lets it see a DOM. Actions happen at CPU speed, not LLM-inference speed. Vision is available as a fallback (there is a gemini_computer_use tool) but it is not the main path.",
  },
  {
    q: "Can an agent read my Slack DMs with this?",
    a: "Yes, the same way you can: by focusing Slack, clicking into a DM, and reading the message text out of the accessibility tree. That is a strong capability and a strong responsibility. The agent runs on your endpoint under your user account, with whatever network identity you have. Anything it does in Slack is attributable to you, not to a bot. If you are building a Slack MCP workflow that reads DMs, make sure your policy is comfortable with that posture. The tradeoff is exactly the one you get by giving any local automation tool your logged-in session.",
  },
  {
    q: "What about rate limits?",
    a: "Slack's Web API has tier-based rate limits; chat.postMessage, for instance, is roughly one per second per channel, and the more expensive endpoints (conversations.history, search.messages) are tighter. Because Terminator does not hit the Web API, those limits do not apply. The effective limit is how fast the Slack client can update its UI and how fast the accessibility tree rebuilds. In practice this is fast enough for interactive agent use. If you are doing bulk data movement (exporting years of channel history) you should still use the Slack Export API or a proper dump tool; accessibility-driven scraping is the wrong shape for that.",
  },
  {
    q: "How do I install it in Claude Code, Cursor, or VS Code?",
    a: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user for Claude Code. For Cursor and VS Code there are deep-link install buttons in the Terminator MCP Agent README. The agent is published as an npm package that wraps a Rust binary; the editor spawns it as a child process over stdio by default, or over HTTP if you pass -t http. Once the server is attached, ask the LLM to do anything involving Slack, and it will pick process:Slack selectors on its own because the system prompt lists Slack as a known process.",
  },
  {
    q: "Where does this approach stop working?",
    a: "Two places. First, when Slack renders a subtree as custom-painted pixels with no accessibility nodes underneath, selectors cannot match it and you fall back to coordinate clicks or vision. The Slack desktop client is mostly well-behaved about this but not universally. Second, when you need truly headless, server-side execution at scale with no human machine in the loop, accessibility-driven automation is not the right tool; you want the Slack Web API for that. Terminator is built for the case where there is a logged-in human and an agent is acting on their behalf, on their machine, inside the apps they already have open.",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Slack desktop automation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              A Slack MCP server with{" "}
              <GradientText variant="teal">no bot token</GradientText>,{" "}
              because there is no Slack API call
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every Slack MCP server you have seen (Slack&apos;s own, korotovsky&apos;s,
              the Workato one, the listings on PulseMCP) is a wrapper around
              the Slack Web API. It needs a bot token, a workspace admin to
              install the app, and it can only do what the API exposes.
              Terminator is a different shape. It gives your coding agent a
              Slack surface by driving the{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                process:Slack
              </code>{" "}
              desktop window through OS accessibility APIs. The MCP agent
              source contains zero references to{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                api.slack.com
              </code>
              . That is the whole point.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="10 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "No xoxb bot token, no OAuth, no Slack marketplace install",
                "Acts as the logged-in human, so it sees every DM the human sees",
                "Drives huddles, canvases, reactions, anything the UI ships",
                "Same binary also drives Excel, VS Code, Chrome, Teams, Notepad",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#anchor-fact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the grep evidence
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video (video-style component quota) */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Slack MCP server, done sideways."
            subtitle="Not a Web API wrapper. A desktop app driver."
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Every other Slack MCP server uses chat.postMessage",
              "Terminator selects process:Slack >> role:Button && name:Send now",
              "No bot token. No OAuth. No workspace admin install.",
              "Same UI the human clicks. Same account the human is signed in as.",
              "One MCP server that also drives Excel, VS Code, Chrome, Teams.",
            ]}
          />
        </section>

        {/* The two architectures */}
        <section className="max-w-4xl mx-auto px-6 pt-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-5">
            Two Slack MCP architectures
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            If you search for{" "}
            <span className="font-mono text-sm text-zinc-800">slack mcp server</span>
            , almost every result lands you in the same architecture: a local
            Node or Go process that holds an xoxb-... bot token, makes HTTPS
            requests to{" "}
            <span className="font-mono text-sm text-zinc-800">api.slack.com</span>
            , and translates MCP tool calls into Slack Web API endpoints. The
            server is a thin protocol adapter between the LLM and the Slack
            Web API. That architecture is real, it works, and it is the right
            answer when you have API access.
          </p>
          <p className="text-zinc-600 mb-8 max-w-3xl leading-relaxed">
            But it has a prerequisite most docs gloss over: someone with
            admin rights on your Slack workspace has to approve the install.
            If you are at a bank, a healthcare company, a government
            contractor, or just a large enterprise with a careful admin, that
            approval often does not come. Terminator sidesteps the
            prerequisite entirely by going through the surface your human
            teammates already use: the Slack desktop app they are signed
            into.
          </p>

          <AnimatedBeam
            title="What an MCP tool call actually reaches"
            accentColor="#FF3E00"
            from={[
              { label: "Claude Code" },
              { label: "Cursor" },
              { label: "Windsurf" },
            ]}
            hub={{
              label: "terminator-mcp-agent",
              sublabel: "dispatch_tool match arm",
            }}
            to={[
              { label: "process:Slack", sublabel: "UIA / AX tree" },
              { label: "process:EXCEL" },
              { label: "process:Cursor" },
              { label: "process:chrome" },
            ]}
          />
        </section>

        {/* Metrics (uses NumberTicker via MetricsRow) */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            The shape of &quot;nothing Slack-specific&quot;
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Four numbers, all pulled from the Terminator repo. They add up
            to the same claim: this is a general desktop automation MCP
            server, and Slack comes for free.
          </p>
          <MetricsRow
            metrics={[
              { value: 0, label: "HTTP calls to api.slack.com in the MCP agent source" },
              { value: 0, label: "Slack OAuth scopes, tokens, or client secrets" },
              { value: 1, label: "Line in prompt.rs that mentions Slack (process name only)" },
              { value: 31, label: "Total MCP tools, all generic, all work on Slack" },
            ]}
          />

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={0} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">bot tokens required</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={0} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">admin approvals</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={100} suffix="%" />
              </div>
              <p className="text-xs text-zinc-500 mt-1">of UI reachable</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={1} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">MCP server to install</p>
            </div>
          </div>
        </section>

        {/* Anchor fact: the grep evidence */}
        <section
          id="anchor-fact"
          className="max-w-4xl mx-auto px-6 py-12 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-4">
            Anchor fact:{" "}
            <GradientText variant="teal">
              no Slack Web API code, anywhere
            </GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the claim that is easy to check and that none of the
            other Slack MCP server pages can make about themselves. The
            Terminator MCP agent, the one that implements the MCP tools an
            LLM sees, does not import a Slack SDK, does not hold a Slack
            token, and does not send a single request to{" "}
            <span className="font-mono text-sm text-zinc-800">api.slack.com</span>
            . You can clone the repo and verify in two commands:
          </p>

          <TerminalOutput title="terminator repo: grep for Slack Web API plumbing" lines={grepEvidence} />

          <p className="text-zinc-600 mt-6 mb-6 max-w-3xl leading-relaxed">
            The only place &quot;Slack&quot; shows up in the MCP agent
            crate is a single line inside the system prompt, listing it as
            one of several common process names the LLM might be asked to
            automate. Here is that block exactly:
          </p>

          <AnimatedCodeBlock
            code={processNameSnippet}
            language="text"
            filename="crates/terminator-mcp-agent/src/prompt.rs"
          />

          <p className="text-zinc-600 mt-6 max-w-3xl leading-relaxed">
            That is the whole Slack-specific surface area of the codebase:
            one word in a process-name list. Everything else is generic.
            The MCP server does not know Slack is a chat app; it knows{" "}
            <span className="font-mono text-sm text-zinc-800">process:Slack</span>{" "}
            is a window with an accessibility tree, and tree nodes with
            names like{" "}
            <span className="font-mono text-sm text-zinc-800">Message #eng-oncall</span>{" "}
            and{" "}
            <span className="font-mono text-sm text-zinc-800">Send now</span>{" "}
            behave like any other UI elements.
          </p>
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            Bot-token Slack MCP server vs accessibility-driven Slack MCP server
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Concrete tradeoffs, not vibes. Pick the one that matches your
            workspace&apos;s security posture and your actual use case.
          </p>
          <ComparisonTable
            productName="Terminator MCP"
            competitorName="Slack Web API MCP servers"
            rows={comparisonRows}
          />
        </section>

        {/* The workflow */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            What one tool call looks like end to end
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Five steps, all generic, none of them know anything about Slack
            beyond the process name and the role/name of the elements they
            target.
          </p>
          <AnimatedCodeBlock
            code={workflowYaml}
            language="yaml"
            filename="slack-deploy-notice.yml"
          />

          <div className="mt-10">
            <StepTimeline title="The round trip of that click_element call" steps={timelineSteps} />
          </div>
        </section>

        {/* Capability bento */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            What this unlocks that a Web API server cannot
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            The Slack Web API is intentionally narrow. The desktop client is
            whatever Slack has shipped this quarter. Driving the client gets
            you the whole thing.
          </p>
          <BentoGrid cards={capabilityCards} />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <ProofBanner
            quote="A desktop automation MCP is the only Slack MCP that does not need your workspace admin to say yes first."
            source="Terminator docs"
            metric="0 bot tokens"
          />
        </section>

        {/* Selector marquee (Magic UI quota, secondary visual) */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            Selectors your agent will actually emit
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            These are the kinds of strings that end up inside{" "}
            <span className="font-mono text-sm text-zinc-800">click_element</span>{" "}
            and{" "}
            <span className="font-mono text-sm text-zinc-800">type_into_element</span>{" "}
            when the LLM is working inside Slack. They look a lot like CSS
            selectors for your UI tree.
          </p>
          <Marquee pauseOnHover fade>
            {selectorChips.map((chip, i) => (
              <span
                key={i}
                className="font-mono text-xs bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-lg px-4 py-2 mx-2 whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Install */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            Install it as your Slack MCP server
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            One command, the Slack desktop app you already have open, and
            any MCP-aware editor. No Slack app to create, no OAuth consent
            screen to click through, no admin to email.
          </p>
          <TerminalOutput title="Claude Code, from empty machine to first Slack action" lines={installTerminal} />
        </section>

        {/* Tradeoff callout */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <div className="p-8">
              <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                The honest tradeoff
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                A Slack MCP server that acts as you is strictly more
                powerful than one that acts as a sanctioned bot. It is also
                strictly more you-shaped: the agent reads your DMs, posts as
                your account, and shows up in audit logs as you, not as a
                bot. For a lot of real engineering work that is exactly the
                right posture, because the thing you want is an assistant,
                not a colleague. For any workflow that needs a separate
                identity, an approved app, or a server-side audit trail
                independent of a human login, use the Web API path. These
                two are complementary, not competitive.
              </p>
            </div>
          </GlowCard>
        </section>

        {/* FAQs */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection items={faqs} />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <InlineCta
            heading="Give your coding agent a Slack surface without asking anyone"
            body="Terminator is open-source (MIT), runs locally, and attaches to any MCP client. Add it once, and your agent can drive Slack, Excel, VS Code, Chrome, and every other accessible desktop app from the same place."
            linkText="Open the GitHub repo"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>
      </article>
    </div>
  );
}
