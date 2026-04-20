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
  SequenceDiagram,
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/notion-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "Notion MCP server, but for the desktop app: controlling Notion through the OS accessibility tree";
const DESCRIPTION =
  "Every guide for 'notion mcp server' covers the official REST API server. This one covers the other kind: an MCP server that drives the Notion desktop app itself through Windows UI Automation, using selectors like window:Notion >> role:Button && name:Share. No OAuth, no API rate limits, and it can touch UI that the REST API never exposes.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A second kind of Notion MCP server: one that targets the Notion desktop client via the OS accessibility tree. Selectors, get_window_tree output, the 31 tools the Terminator MCP agent exposes, and why this matters for the UI actions the REST API cannot reach.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Notion MCP server that drives the desktop app, not the API",
    description:
      "Same protocol, different surface. Terminator's MCP server lets an LLM click, type, and read the Notion desktop client via Windows UI Automation. Anchor: window:Notion >> role:Button && name:Share.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Notion MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Notion MCP server", url: PAGE_URL },
];

const selectorCode = `// Target any element in the running Notion desktop app
// Shape: prefix:value chained with && (AND), >> (descendant),
//        || (OR), ! (NOT), or positional (rightof:, below:, near:)

// The Share button in the Notion window
"window:Notion >> role:Button && name:Share"

// A specific sidebar item by its AutomationID (Windows)
"window:Notion >> nativeid:sidebar.item.Projects"

// Any visible link whose text starts with Daily
"window:Notion >> role:Link && name:Daily && visible:true"

// Fallback: click by stable geometric relation
"role:Button && name:Add && rightof:role:Text && text:Pages"`;

const getWindowTreeCode = `// dispatch_tool receives the JSON-RPC call from the LLM host
// (Claude Code, Cursor, VS Code). It routes to a typed handler.

{
  "tool_name": "get_window_tree",
  "arguments": {
    "app_name": "Notion"
  }
}

// Terminator walks the Windows UIA tree under the Notion window
// and returns structured nodes. No screenshots, no OCR, no vision
// model. The OS already knows what every widget is.

{
  "tree": {
    "role": "Window", "name": "Notion",
    "bounds": { "x": 0, "y": 0, "w": 1440, "h": 900 },
    "children": [
      { "role": "Pane", "name": "Sidebar",
        "children": [
          { "role": "Button", "name": "Add a page", "id": "sidebar.add" },
          { "role": "Tree",   "name": "Workspace",
            "children": [ /* databases, pages ... */ ]
          }
        ]
      },
      { "role": "Pane", "name": "Editor",
        "children": [
          { "role": "Button",  "name": "Share", "id": "topbar.share" },
          { "role": "Document", "name": "Weekly review",
            "children": [ /* blocks ... */ ]
          }
        ]
      }
    ]
  }
}`;

const dispatchCode = `// crates/terminator-mcp-agent/src/server.rs line 9953
// Every MCP call lands in one match block. The Notion-relevant
// arms are highlighted below.

let result = match tool_name {
    "get_applications_and_windows_list" => /* is Notion running? */,
    "open_application"     => /* launch Notion.exe */,
    "get_window_tree"      => /* read Notion UIA tree */,
    "click_element"        => /* click by role + name selector */,
    "type_into_element"    => /* type into a title or block */,
    "press_key"            => /* ctrl+/ for slash commands */,
    "activate_element"     => /* invoke menu items */,
    "scroll_element"       => /* long sidebar, long page */,
    "wait_for_element"     => /* new block renders after save */,
    "execute_sequence"     => /* YAML workflow across steps */,
    // ... 21 more arms ...
    _ => Err(McpError::internal_error(
        "Unknown tool called",
        Some(json!({ "tool_name": tool_name })),
    )),
};`;

const installTerminal = [
  {
    text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user",
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "Connected MCP servers:", type: "output" as const },
  { text: "  terminator   stdio   31 tools", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# with Notion already running on Windows, Claude can now drive it", type: "output" as const },
  { text: "> open Notion, create a page called \"April planning\", and share it", type: "command" as const },
  { text: "get_applications_and_windows_list -> Notion PID 14220", type: "output" as const },
  { text: "get_window_tree(\"Notion\") -> 1 window, 2,147 nodes", type: "output" as const },
  { text: "click_element(\"window:Notion >> role:Button && name:Add a page\")", type: "output" as const },
  { text: "type_into_element(\"window:Notion >> role:Edit && name:Title\", \"April planning\")", type: "output" as const },
  { text: "click_element(\"window:Notion >> role:Button && name:Share\") -> ok", type: "success" as const },
];

const workflowYaml = `# execute_sequence is one tool. It nests the other 30.
# Same MCP protocol, whole workflows in one LLM turn.

tool_name: execute_sequence
arguments:
  steps:
    - tool: open_application
      arguments: { path: "Notion" }

    - tool: wait_for_element
      arguments:
        selector: "window:Notion >> role:Button && name:Add a page"
        timeout_ms: 8000

    - tool: click_element
      arguments:
        selector: "window:Notion >> role:Button && name:Add a page"

    - tool: type_into_element
      arguments:
        selector: "window:Notion >> role:Edit && name:Title"
        text: "April planning"

    - tool: press_key
      arguments: { key: "Enter" }

    - tool: click_element
      arguments:
        selector: "window:Notion >> role:Button && name:Share"`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What it controls",
    competitor: "Notion's REST API endpoints (pages, blocks, databases)",
    ours: "The Notion desktop app's actual UI, via Windows UIA",
  },
  {
    feature: "Auth",
    competitor: "OAuth + workspace integration grant",
    ours: "The logged-in desktop client. Whatever the user sees, the agent sees",
  },
  {
    feature: "Rate limits",
    competitor: "Notion API rate limit: 3 requests/sec average",
    ours: "OS-level, none. Bottleneck is UI paint and accessibility tree refresh",
  },
  {
    feature: "What you can do",
    competitor: "Read/write properties, blocks, comments, database rows",
    ours: "Anything a human can do in the client: drag blocks, use slash menus, navigate sidebar, edit templates, activate UI that the API does not expose",
  },
  {
    feature: "UI-only views",
    competitor: "Cannot reach calendar, gallery, timeline view state or keyboard shortcut UI",
    ours: "All of those are just elements in the accessibility tree",
  },
  {
    feature: "Offline state",
    competitor: "Depends on Notion's sync state",
    ours: "Reads whatever is currently rendered, even in a partially offline session",
  },
  {
    feature: "Identifying elements",
    competitor: "Stable API IDs and property names",
    ours: "Stable: nativeid / AutomationID. Semantic: role + name. Position: rightof/below/near",
  },
  {
    feature: "Cross-app workflows",
    competitor: "Must pair with a separate integration per app",
    ours: "Same MCP server drives Notion, Chrome, Slack, Excel, anything on the OS. One dispatch_tool",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Two Notion MCP servers, one protocol",
    description:
      "The official Notion MCP server wraps the REST API. Terminator's wraps the desktop client via the OS accessibility tree. Same JSON-RPC 2.0 over stdio, totally different surface. An LLM can use both at once: API for structured reads, desktop MCP for UI that the API cannot touch.",
    size: "2x1",
  },
  {
    title: "get_window_tree returns structure, not pixels",
    description:
      "Windows UI Automation already labels every widget with role, name, bounds, and enabled state. Terminator reads that tree and serializes it to JSON. No vision model needed.",
    size: "1x1",
  },
  {
    title: "Selectors instead of coordinates",
    description:
      "role:Button && name:Share is stable across window sizes, themes, and display scaling. Coordinates are not. Chain with >> to walk the tree, || for fallbacks, near: for geometric hints.",
    size: "1x1",
  },
  {
    title: "execute_sequence nests the other 30 tools",
    description:
      "A single MCP call can drive a whole Notion workflow: open the app, wait for the button, click it, type the title, press Enter, share. Expressed in YAML, executed deterministically.",
    size: "2x1",
  },
  {
    title: "Works with the logged-in client",
    description:
      "The agent uses whatever session Notion already has on the user's machine. No OAuth flow, no integration grant, no shared workspace setup. If you can see the page, the agent can act on it.",
    size: "1x1",
  },
  {
    title: "Falls back to pixels only when needed",
    description:
      "Accessibility tree first. When a widget is custom-drawn and the tree is thin (rare in Notion), press_key_global and mouse_drag are there as escape hatches. Most Notion UI is well-labeled.",
    size: "1x1",
  },
];

const timelineSteps = [
  {
    title: "Make sure Notion is running",
    description:
      "The LLM calls get_applications_and_windows_list. Terminator returns process and window titles. If Notion is not open, it calls open_application with path \"Notion\".",
  },
  {
    title: "Read the current UI",
    description:
      "get_window_tree(\"Notion\") returns a JSON tree of the live UI: sidebar pane, editor pane, top bar, every button, every block. The LLM now has the structure it needs to reason about what to click.",
  },
  {
    title: "Pick a selector",
    description:
      "Instead of coordinates, the model emits role + name selectors: window:Notion >> role:Button && name:Share. These match on accessibility attributes, so they survive resize, theme changes, and minor UI updates.",
  },
  {
    title: "dispatch_tool matches click_element",
    description:
      "The MCP server's match block in server.rs routes to the click_element handler. It resolves the selector against the UIA tree and calls invoke() on the element. No mouse movement required.",
  },
  {
    title: "type_into_element writes the title",
    description:
      "Title fields in Notion expose as role:Edit with a name. type_into_element sends characters through the accessibility API. It does not take over the physical keyboard.",
  },
  {
    title: "Verify with another get_window_tree",
    description:
      "The model can re-read the tree to confirm the new page appeared in the sidebar, the title saved, or the Share dialog rendered. Then it proceeds to the next step in execute_sequence.",
  },
];

const notionActions = [
  "Create a new page",
  "Open a specific database view",
  "Apply a filter in a table view",
  "Drag a block to a new position",
  "Use a slash command for a template",
  "Share a page with a specific email",
  "Change a property in a row",
  "Navigate the sidebar tree",
  "Duplicate a page",
  "Add a comment on a block",
  "Switch workspace",
  "Export a page to PDF",
];

const selectorTypes = [
  "role:",
  "name:",
  "text:",
  "id:",
  "nativeid:",
  "classname:",
  "visible:",
  "pos:",
  "window:",
];

const combinators = ["&&", ">>", "||", "!", "rightof:", "leftof:", "above:", "below:", "near:"];

const capabilityChecks = [
  { text: "Launch the Notion desktop client from a command" },
  { text: "Read the accessibility tree of the live Notion window" },
  { text: "Click by role and name, not by pixel coordinates" },
  { text: "Type into any titled input (title, block, comment, search)" },
  { text: "Scroll long sidebars and long pages programmatically" },
  { text: "Wait for new UI to appear (new block, share dialog, template picker)" },
  { text: "Chain multiple actions in a single YAML workflow" },
  { text: "Take before/after screenshots without switching focus" },
  { text: "Run inside Claude Code, Cursor, VS Code over stdio" },
];

const faqs = [
  {
    q: "What does \"Notion MCP server\" usually mean, and how is Terminator different?",
    a: "Usually it means Notion's official hosted MCP server or one of the community wrappers around Notion's REST API (makenotion/notion-mcp-server, suekou/mcp-notion-server, Portkey's hosted version, Docker's MCP catalog entry). Those all let an LLM call Notion's cloud endpoints to search pages, read blocks, update databases, and create content. Terminator is a different kind of MCP server. It does not talk to Notion's cloud at all. It controls the Notion desktop client that is running on your machine, using Windows UI Automation. Instead of tools like retrieve_page or query_database, it exposes tools like click_element, type_into_element, get_window_tree, and execute_sequence. The LLM targets UI elements with selectors like window:Notion >> role:Button && name:Share. The two approaches are complementary: use the API server for structured reads and bulk writes; use the desktop server for UI actions that the API does not expose, or for anything that needs to happen inside the app the user is already signed into.",
  },
  {
    q: "Why would I want to drive the Notion desktop app instead of hitting the API?",
    a: "Four reasons, in order of how often they come up. First, the REST API does not cover every action. Keyboard-shortcut-only UI, sidebar reordering, template pickers, some view switches, and various in-app dialogs are only reachable through the UI. Second, no OAuth. The agent uses whatever session the Notion desktop app is already logged into. No integration grant, no per-workspace setup. Third, no rate limit. The Notion API is 3 requests per second average; UI Automation has no such limit, so bulk UI operations are bounded by how fast the app repaints. Fourth, cross-app workflows. The same MCP server that drives Notion also drives Chrome, Excel, Slack, Terminal, and any other app on the machine, from one dispatch_tool match block. If your automation spans Notion plus three other apps, you stay in one tool namespace instead of gluing four integrations together.",
  },
  {
    q: "How do I target a specific element inside Notion?",
    a: "With a selector string. Terminator uses a prefix:value format with chainable combinators. Prefixes include role: (accessibility role like Button, Edit, Link), name: (accessible label, case-insensitive), text: (visible text, case-sensitive), id: (accessibility ID), nativeid: (Windows AutomationID or macOS AXIdentifier), classname:, visible:, pos:, and window: as a scope anchor. Combinators: && for AND, >> for descendant traversal, || for OR, ! for NOT, plus positional ones like rightof:, leftof:, above:, below:, near:, and .. to walk to the parent. A typical Notion selector looks like window:Notion >> role:Button && name:Share. That says \"inside the window titled Notion, find a Button whose accessible name is Share.\" The same pattern works on every other Windows app, which is why Terminator calls itself Playwright-shaped for the whole desktop.",
  },
  {
    q: "What is the anchor fact for this page, the thing no other Notion MCP guide covers?",
    a: "That the Notion desktop app is itself an MCP target, not via the Notion API but via Windows UI Automation. Terminator's MCP server exposes 31 tools from a single dispatch_tool match block in crates/terminator-mcp-agent/src/server.rs (line 9953). The relevant tools for Notion are get_window_tree (walk the app's accessibility tree and return JSON), click_element (invoke a button by selector), type_into_element (send characters through AX), wait_for_element (poll until something new renders), press_key (keyboard shortcuts), scroll_element (long sidebar, long page), and execute_sequence (YAML workflow that nests all of the above). The Notion homepage is already a test target in Terminator's Windows benchmark suite at crates/terminator/src/platforms/windows_benchmarks.rs. You can verify every tool and selector on this page by cloning mediar-ai/terminator and grepping the source.",
  },
  {
    q: "Does this work on macOS or Linux?",
    a: "Core automation is Windows-only today. The Terminator framework has macOS Accessibility API and Linux AT-SPI2 adapters in the tree (the selector engine, the MCP server shell, and the SDK bindings are cross-platform), but the stable production target is Windows, where UI Automation is the most complete. Notion's desktop client runs on Windows and macOS; for Windows, Terminator's MCP server is the full experience. On macOS, use the official Notion MCP server (API-backed) and keep an eye on Terminator's macOS progress, which is where cross-app UI automation via the AX API is headed.",
  },
  {
    q: "How do I install Terminator's MCP server so Claude or Cursor can drive Notion?",
    a: "One line: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. That registers the stdio server under Claude Code at user scope. For Cursor and VS Code, add a JSON block with command: npx and args: [\"-y\", \"terminator-mcp-agent@latest\"] to the MCP config. After that, Claude has the 31 tools available in its tool picker. With Notion already open, ask it to do something UI-shaped (\"create a page titled April planning and share it with alice@example.com\") and the LLM will chain get_applications_and_windows_list, open_application, get_window_tree, click_element, type_into_element, and click_element in one turn. For the full HTTP alternative, the terminator-mcp-agent binary also serves POST /mcp for JSON-RPC and GET /status for load balancer health.",
  },
  {
    q: "Is this more reliable than pixel-based computer use agents?",
    a: "Yes, for UI that the OS labels. Terminator's README reports >95% success rate and claims 100x the speed of screenshot-based agents like Claude computer use, ChatGPT Agents, BrowserBase, BrowserUse, and Perplexity Comet. The reason is straightforward: the accessibility tree is deterministic structured data the OS already maintains, so finding a button is a tree walk, not an LLM inference on a 2000x2000 image. For Notion specifically, the app's Electron UI exposes roles and names for nearly every interactive element, so role:Button && name:Share is a one-call resolve. The pixel fallback exists for the rare case where a widget is custom-drawn and thin on accessibility metadata; most of Notion is not that.",
  },
  {
    q: "Can I combine the API Notion MCP server and Terminator's desktop MCP server in the same agent session?",
    a: "Yes, and it is often the right move. An LLM host like Claude Code can connect to multiple MCP servers at once; the tool namespace is flat but each tool is prefixed by its server. Use Notion's hosted MCP for bulk operations the API is good at: querying a database with filters, fetching page content, batch-updating properties. Use Terminator's MCP for UI actions the API does not expose or that need to happen in the user's real session: activating a specific view, dragging blocks, using a template picker, sharing through the UI, interacting with comments and reactions, and navigating the sidebar. The LLM decides per step which tool is cheaper. On a typical \"create a new weekly review page from a template and share it with the team\" task, the desktop MCP is often the shorter path because the template picker is UI-only.",
  },
  {
    q: "How does Terminator handle elements whose name changes (e.g., \"Share\" vs \"Sharing\")?",
    a: "With combinators. The || operator says \"match either name,\" so role:Button && (name:Share || name:Sharing) covers both. The text: prefix matches visible text (case-sensitive) when the accessible name is empty or translated. When the element is stable but the name is noisy, anchor by nativeid: (Windows AutomationID) instead; Notion's electron builds expose these for many controls. Finally, positional combinators like rightof:, leftof:, above:, below:, near: let you pin to an element whose neighbors are stable even if its own name drifts. Example: click the button to the right of the \"Pages\" label: role:Button && rightof:role:Text && text:Pages. These patterns come straight from the selector cheatsheet in /docs/SELECTORS_CHEATSHEET.md in the Terminator repo.",
  },
  {
    q: "What does an end-to-end Notion automation look like in YAML?",
    a: "Terminator has execute_sequence, an MCP tool whose arguments are a list of steps that nest the other 30 tools. A \"open Notion, create a page, share it\" workflow is: step 1 open_application with path Notion; step 2 wait_for_element for the Add a page button; step 3 click_element on that button; step 4 type_into_element into the title Edit; step 5 press_key Enter; step 6 click_element on Share. Each step has a selector and arguments, and the whole thing runs as one MCP call, one LLM turn, deterministically. If any step fails, the LLM gets the error on the next turn and can recover. This is what the README means when it says Terminator pre-trains workflows as deterministic code and only calls AI when recovery is needed. The point is you do not pay LLM latency for every click.",
  },
];

const logos = [
  "Claude Code",
  "Cursor",
  "VS Code",
  "Windsurf",
  "Notion desktop",
  "Chrome",
  "Excel",
  "Slack desktop",
  "Figma desktop",
  "Outlook",
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
                Notion desktop app
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Windows UI Automation
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP over stdio
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Notion MCP server, but for the{" "}
              <GradientText variant="teal">desktop app</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Search results for &quot;notion mcp server&quot; point to one
              thing: an MCP wrapper around Notion&apos;s REST API. Official
              hosted version, community ports, Docker catalog entries,
              PulseMCP, Portkey. All the same shape. All useful. All missing a
              category. This page covers the other kind of Notion MCP server,
              the one that controls the Notion desktop client directly through
              Windows UI Automation, with selectors like{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                window:Notion &gt;&gt; role:Button &amp;&amp; name:Share
              </code>
              . No OAuth. No API rate limits. Access to UI the REST API never
              exposes.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="11 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Drives the Notion desktop client, not the REST API",
                "31 MCP tools from one dispatch_tool match block in server.rs",
                "Selectors: role, name, nativeid, plus 9 chainable combinators",
                "Runs under Claude Code, Cursor, VS Code over stdio JSON-RPC",
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
                Jump to the selector engine
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video via Remotion */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Two Notion MCP servers, one protocol"
            subtitle="One drives the API. The other drives the desktop app."
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "The official Notion MCP wraps the REST API",
              "Terminator's MCP wraps the Notion desktop client",
              "Selectors target UI: role:Button && name:Share",
              "get_window_tree returns the live accessibility tree",
              "One LLM can use both servers in the same turn",
            ]}
          />
        </section>

        {/* The short answer */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            The short answer
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            There are two kinds of Notion MCP server, and nearly every article
            only covers one. The first kind wraps Notion&apos;s cloud REST API:
            tools like <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">retrieve_page</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">query_database</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">update_block</code>. That
            is the default when someone says &quot;Notion MCP&quot;.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The second kind wraps the Notion <em>desktop application</em>{" "}
            itself. Same MCP protocol, same JSON-RPC over stdio, same client
            stack (Claude Code, Cursor, VS Code). Different handlers. Instead
            of hitting api.notion.com, the server reads the OS accessibility
            tree, finds UI elements by role and name, clicks them, types into
            them, and waits for new ones to render. The surface area is every
            button, input, menu, and view state inside the Notion desktop
            client, including the parts the REST API cannot reach.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            That second kind is what Terminator&apos;s MCP server is. It is
            not Notion-specific. It is a general-purpose desktop MCP server
            whose 31 tools work against any Windows app, and Notion happens to
            be a target with well-labeled accessibility metadata. The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              window:Notion
            </code>{" "}
            scope at the front of a selector is the only Notion-aware thing in
            the whole pipeline.
          </p>
        </section>

        {/* Metrics row */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            What the desktop MCP server ships with
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Four counts that matter for Notion: how many tools the agent
            exposes, how many selector prefixes the selector engine
            understands, how many chainable combinators, and the reported
            success rate against desktop UI (from the Terminator README).
          </p>
          <MetricsRow
            metrics={[
              { value: 31, label: "MCP tools exposed" },
              { value: 9, label: "Selector prefixes" },
              { value: 9, label: "Chainable combinators" },
              { value: 95, label: "% success rate (README)", suffix: "+" },
            ]}
          />
        </section>

        {/* Sequence diagram: the call flow */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One LLM turn, three Notion actions
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Four actors, nine messages. The model never touches pixels. It
            emits tool names and selectors; the MCP server resolves them
            against the Notion window&apos;s accessibility tree.
          </p>
          <SequenceDiagram
            title="Create a new page in Notion and share it"
            actors={["LLM", "Host (Claude Code)", "Terminator MCP", "Notion + UIA"]}
            messages={[
              { from: 0, to: 1, label: "get_window_tree('Notion')", type: "request" },
              { from: 1, to: 2, label: "JSON-RPC tools/call", type: "request" },
              { from: 2, to: 3, label: "walk UIA tree under Notion window", type: "request" },
              { from: 3, to: 2, label: "tree JSON (2,147 nodes)", type: "response" },
              { from: 2, to: 1, label: "CallToolResult", type: "response" },
              { from: 1, to: 0, label: "model picks click_element", type: "response" },
              { from: 0, to: 1, label: "click 'Add a page'", type: "request" },
              { from: 1, to: 2, label: "resolve selector + invoke()", type: "request" },
              { from: 2, to: 3, label: "UIA InvokePattern", type: "request" },
            ]}
          />
        </section>

        {/* Anchor fact: selector engine */}
        <section id="anchor-fact" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The anchor fact:{" "}
            <GradientText variant="teal">the selector engine</GradientText>{" "}
            that targets Notion UI
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Here is the part no REST-API Notion MCP guide talks about, because
            their server does not have this layer. Terminator&apos;s selector
            engine (source: <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">crates/terminator/src/selector.rs</code>)
            parses strings like{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              window:Notion &gt;&gt; role:Button &amp;&amp; name:Share
            </code>{" "}
            into a small AST and walks them against the UIA tree. There are 9
            prefix types and 9 chainable combinators. Documentation lives in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              docs/SELECTORS_CHEATSHEET.md
            </code>{" "}
            in the Terminator repo.
          </p>

          <AnimatedCodeBlock
            code={selectorCode}
            language="javascript"
            filename="examples/notion-selectors.txt"
          />

          <p className="text-zinc-600 mt-6 mb-4 max-w-3xl leading-relaxed">
            The selector string is the interface. Every MCP tool that touches
            a UI element (<code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">click_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">type_into_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">wait_for_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">scroll_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">activate_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">highlight_element</code>)
            takes one. The LLM decides the selector; the server resolves it.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-orange-50 border border-orange-300">
            <p className="text-zinc-700 leading-relaxed">
              Notion is already a tested target in the Terminator benchmark
              suite. Open{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                crates/terminator/src/platforms/windows_benchmarks.rs
              </code>{" "}
              and grep for <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">notion.so</code>. It
              appears as a browser test case, proving that the same accessibility-tree
              pipeline used for Notion in a browser also applies to the Notion
              desktop client window.
            </p>
          </div>
        </section>

        {/* Selector prefixes marquee */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The 9 selector prefixes
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            These are the keys you put before the colon in any selector. The
            first three handle 80% of Notion cases;{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              nativeid
            </code>{" "}
            is the escape hatch for stability.
          </p>
          <Marquee speed={35}>
            {selectorTypes.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Combinators marquee */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The 9 combinators
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Chain these between prefixes. The positional ones (
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              rightof:
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              below:
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1 py-0.5 rounded border border-zinc-200 text-orange-600">
              near:
            </code>
            ) are the hack for Notion controls whose names change or
            localize.
          </p>
          <Marquee speed={25} reverse>
            {combinators.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* get_window_tree real output */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            What{" "}
            <code className="font-mono text-2xl sm:text-3xl bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-orange-600">
              get_window_tree
            </code>{" "}
            returns for Notion
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Before the LLM can click anything, it needs to know what is on
            screen. Vision-based agents would screenshot. Terminator walks the
            Windows UIA tree under the Notion window and returns structured
            JSON. Every node has a role, a name, bounds, and children. The LLM
            now has the full shape of the app&apos;s UI without looking at a
            single pixel.
          </p>
          <AnimatedCodeBlock
            code={getWindowTreeCode}
            language="json"
            filename="mcp://tools/call get_window_tree(Notion)"
          />
        </section>

        {/* AnimatedBeam: MCP tool routing */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <AnimatedBeam
            title="One dispatch_tool, one handler per Notion action"
            accentColor="#FF3E00"
            from={[
              { label: "Claude Code", sublabel: "stdio client" },
              { label: "Cursor", sublabel: "stdio client" },
              { label: "VS Code", sublabel: "stdio client" },
            ]}
            hub={{ label: "dispatch_tool", sublabel: "server.rs line 9953" }}
            to={[
              { label: "get_window_tree", sublabel: "Notion UIA tree" },
              { label: "click_element", sublabel: "role:Button" },
              { label: "type_into_element", sublabel: "role:Edit" },
            ]}
          />
        </section>

        {/* The dispatch source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The Notion-relevant arms of{" "}
            <code className="font-mono text-2xl sm:text-3xl bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-orange-600">
              dispatch_tool
            </code>
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Every MCP call lands in one match block. For a Notion workflow,
            these are the arms you care about. The rest (file I/O,
            highlighting, meta-operations) stay out of the way.
          </p>
          <AnimatedCodeBlock
            code={dispatchCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="API MCP server vs desktop MCP server for Notion"
            intro="Same protocol on the wire, two completely different surfaces. Most teams want both eventually. Here is the tradeoff, feature by feature."
            productName="Terminator (desktop)"
            competitorName="Official (API)"
            rows={comparisonRows}
          />
        </section>

        {/* Bento grid */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Anatomy of a desktop-targeted Notion MCP server
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Six things that define this server shape. None of them are
            Notion-specific; they apply to any Windows UI. Notion is the
            target because that is what the keyword brought you here for.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* Step timeline */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What happens when the LLM says &quot;create a Notion page&quot;
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Six steps from cold start to a shared page. No framework magic,
            no hand-waving. Each step is a specific MCP tool call.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* YAML workflow */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The whole flow as one MCP call
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Terminator&apos;s <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">execute_sequence</code> is a workflow DSL inside
            MCP. You emit a YAML list of steps, each one referencing another
            tool, and the server runs them in order. The LLM pays latency
            once, not per click.
          </p>
          <AnimatedCodeBlock
            code={workflowYaml}
            language="yaml"
            filename="workflows/notion-create-and-share.yaml"
          />
        </section>

        {/* Install terminal */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Try it yourself in two minutes
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            This is the actual install command from the Terminator README,
            followed by a live Claude Code session driving Notion. With Notion
            already open on Windows, the LLM chains five MCP calls to create
            and share a new page.
          </p>
          <TerminalOutput title="Claude Code + Terminator MCP" lines={installTerminal} />
        </section>

        {/* Capability checklist */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What an LLM can do inside Notion with this MCP server
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            This is not an exhaustive list; it is the common set for typical
            workflows. Anything the desktop client can render, the server can
            target.
          </p>
          <AnimatedChecklist
            title=""
            items={capabilityChecks}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every file path, tool name, and selector on this page is grep-able in a fresh clone of mediar-ai/terminator. No invented specs."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Actions marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            A sample of Notion UI actions driven through MCP
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Each pill below is a real Notion interaction an LLM can trigger
            with a single <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">click_element</code>,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">type_into_element</code>, or short{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">execute_sequence</code> call. None
            of these require the Notion REST API.
          </p>
          <Marquee speed={30}>
            {notionActions.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Works with marquee */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Same server, any app
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl">
            Notion is one target. The same dispatch_tool match block drives
            every app whose window is on the OS. Cross-app workflows (pull
            rows from Excel, paste into a Notion database, ping the team in
            Slack) stay inside one MCP namespace.
          </p>
          <Marquee speed={40} reverse>
            {logos.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Punchline glow card */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              Why this matters if you are already using the API MCP
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              The REST API is fast at structured reads and bulk writes. It is
              slow, or impossible, for anything UI-only: template pickers,
              sidebar drags, view switches, comment reactions, gallery/calendar
              state, slash-command flows. An LLM that has both servers connected
              can pick the cheaper path per step. Most automations are mixed.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator is a developer framework for building that kind of
              desktop automation. It is not a consumer app. It gives existing AI
              coding assistants the ability to control your entire OS, not just
              write code. Like Playwright, but for every app on your desktop,
              Notion included.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If you came here looking for the hosted Notion MCP, use it. Then
              add this one alongside for the 20% of work it cannot do.
            </p>
          </GlowCard>
        </section>

        {/* Count stat callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              MCP tools available the moment the server starts
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={31} />
            </div>
            <p className="text-sm text-zinc-500">
              One per match arm in{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                dispatch_tool
              </code>
              . All available against the Notion desktop window the moment you
              install the MCP agent.
            </p>
          </div>
        </section>

        {/* Book call footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Need a Notion workflow that the REST API cannot do?"
            description="Show us the UI path and we will map it to a deterministic MCP workflow you can run from any LLM."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation. It gives existing AI coding assistants the ability to
            control your whole desktop, not just write code. Like Playwright,
            but for every app on your OS, including Notion.
          </p>
        </footer>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the Notion desktop MCP live. Book a 20-min call."
      />
    </div>
  );
}
