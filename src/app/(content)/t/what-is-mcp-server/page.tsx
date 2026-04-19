import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  OrbitingCircles,
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
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/what-is-mcp-server";
const PUBLISHED = "2026-04-18";
const TITLE =
  "What is an MCP server? A real one, opened up in the editor, not the abstract definition";
const DESCRIPTION =
  "Every top result for this query defines MCP the same way: a protocol that lets AI call tools. Nobody opens an actual MCP server and shows the dispatch function. This page does. We look at Terminator's dispatch_tool match block in server.rs (31 match arms, one per tool) and the build.rs trick that extracts those tool names at compile time and bakes them into the system prompt.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "An MCP server is a named function dispatcher for LLMs. Here is what one actually looks like when you open it in an editor: one match block, one tool per arm, plus a build step that keeps the system prompt in sync with the code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What an MCP server really is, with the source open",
    description:
      "Past the protocol jargon, an MCP server is a dispatch_tool function with one match arm per capability. Terminator's has 31. We walk through them.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "What is an MCP server?" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "What is an MCP server?", url: PAGE_URL },
];

const dispatchToolCode = `// crates/terminator-mcp-agent/src/server.rs (lines 9953+)
// dispatch_tool is the function every MCP request flows through.
// Each match arm wires one tool name to one async handler.

let result = match tool_name {
    "get_window_tree" => { /* read the accessibility tree */ }
    "click_element"   => { /* click by selector or index */ }
    "type_into_element" => { /* keystroke a string into a field */ }
    "press_key"       => { /* send a keychord to the focused element */ }
    "open_application" => { /* launch an app by path */ }
    "navigate_browser" => { /* drive the address bar */ }
    "execute_browser_script" => { /* run JS in the page */ }
    "run_command"     => { /* shell or embedded JS/Python/Node */ }
    "execute_sequence" => { /* multi-step YAML/JSON workflow */ }
    // ... 22 more arms, one per tool ...
    _ => Err(McpError::internal_error(
        "Unknown tool called",
        Some(json!({ "tool_name": tool_name })),
    )),
};`;

const buildRsCode = `// crates/terminator-mcp-agent/build.rs line 31
// At compile time, scan server.rs for \`"tool_name" =>\` match arms
// and bake the resulting list into the binary via rustc-env.

fn extract_mcp_tools() -> String {
    let server_rs = fs::read_to_string("src/server.rs")
        .unwrap_or_default();

    let mut tools = Vec::new();
    let mut in_dispatch_tool = false;

    for line in server_rs.lines() {
        if line.contains("let result = match tool_name") {
            in_dispatch_tool = true;
            continue;
        }
        if in_dispatch_tool {
            let trimmed = line.trim();
            if trimmed.starts_with('"') && trimmed.contains("\\" =>") {
                if let Some(end) = trimmed[1..].find('"') {
                    let name = &trimmed[1..1 + end];
                    tools.push(name.to_string());
                }
            }
            if trimmed.starts_with("_ =>") { break; }
        }
    }
    tools.join(",")
}

// Then in main():
//   println!("cargo:rustc-env=MCP_TOOLS={}", extract_mcp_tools());`;

const promptInjectCode = `// crates/terminator-mcp-agent/src/prompt.rs line 10
// The tool list baked at compile time becomes a string literal
// the LLM sees inside the system prompt for every session.

pub fn get_server_instructions() -> String {
    let mcp_tools = env!("MCP_TOOLS");
    // ...
    format!(
        "Only desktop automation tools from the MCP server can be \\
         used inside execute_sequence steps. Valid tool names for \\
         execute_sequence:\\n{mcp_tools}\\n..."
    )
}`;

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
  { text: "# the 31 tools now appear inside Claude's tool picker", type: "output" as const },
  { text: "# Claude can now click, type, and read any app on your desktop", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Transport",
    competitor: "HTTP+JSON, fixed URL, one endpoint per verb",
    ours: "stdio or HTTP, framed JSON-RPC 2.0, one dispatch_tool entrypoint",
  },
  {
    feature: "Tool discovery",
    competitor: "OpenAPI spec the LLM has to be shown manually",
    ours: "list_tools() returns them at runtime, baked from source by build.rs",
  },
  {
    feature: "Who writes the schema",
    competitor: "Developer hand-writes types for function calling",
    ours: "Schema derived from Rust arg structs via #[tool] macros",
  },
  {
    feature: "How tools reach the prompt",
    competitor: "Prompt engineer pastes a list into the system prompt",
    ours: "env!(\"MCP_TOOLS\") compile-time injection keeps prompt and code in sync",
  },
  {
    feature: "What the tools can touch",
    competitor: "Whatever the API wraps (usually one service)",
    ours: "Anything the OS accessibility tree exposes, across all apps",
  },
  {
    feature: "Session state",
    competitor: "Stateless HTTP calls",
    ours: "Long-lived process, cancellation tokens, in_sequence flag, focus restoration",
  },
  {
    feature: "Concurrency limit",
    competitor: "Typical web API rate limits",
    ours: "MCP_MAX_CONCURRENT env var, 503 when busy for LB probes (README line 45)",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "A single dispatch function",
    description:
      "server.rs exposes one async dispatch_tool(tool_name, arguments) that match-arms on the name and calls the correct typed handler. Every tool call in the protocol lands here first. There is no routing layer beyond the match block.",
    size: "2x1",
  },
  {
    title: "One handler per tool",
    description:
      "click_element, type_into_element, get_window_tree. Each match arm deserializes JSON into a typed Args struct, awaits an async method, and wraps cancellation via tokio::select.",
    size: "1x1",
  },
  {
    title: "list_tools for discovery",
    description:
      "The LLM asks the server what it can do. list_tools returns the full tool set, filtered per client if the client is running in Ask mode with blocked_tools set.",
    size: "1x1",
  },
  {
    title: "A system prompt that stays in sync",
    description:
      "build.rs parses the match block at compile time and bakes the tool list into MCP_TOOLS. prompt.rs reads env!(\"MCP_TOOLS\") and pastes it into the instructions the LLM sees. Add a tool, recompile, the prompt updates itself.",
    size: "2x1",
  },
  {
    title: "Transport: stdio or HTTP",
    description:
      "Started by a local command under your editor's supervision (stdio) or behind a load balancer with GET /status returning 503 when busy. Same dispatch, different plumbing.",
    size: "1x1",
  },
  {
    title: "Observability that is actually there",
    description:
      "Every tool call is wrapped in execution_logger::log_request and log_response_with_logs. Screenshots before and after UI actions, per-tool PostHog timings, captured tracing and stderr all land on disk in executions/.",
    size: "1x1",
  },
];

const timelineSteps = [
  {
    title: "Editor starts the server",
    description:
      "Claude Code or Cursor spawns npx -y terminator-mcp-agent and opens a pair of pipes. The MCP handshake agrees on a protocol version and the server declares its capabilities.",
  },
  {
    title: "Client asks list_tools",
    description:
      "The LLM's host calls list_tools. Terminator returns every handler name it registered via #[tool] macros, with JSON schemas derived from Rust arg structs.",
  },
  {
    title: "LLM picks a tool by name",
    description:
      "During a user turn, the model decides it needs to type into a text box. It emits a tool call with tool_name: \"type_into_element\" and JSON arguments for the selector and text.",
  },
  {
    title: "dispatch_tool matches the name",
    description:
      "server.rs match arm at \"type_into_element\" deserializes arguments into TypeIntoElementArgs, runs tokio::select against the cancellation token from request_context, and awaits the handler.",
  },
  {
    title: "Handler touches the OS",
    description:
      "type_into_element calls into the Windows UIA or macOS AX adapter, finds the element by selector, and sends keystrokes through the accessibility API. No screenshots, no vision model, no pixel math.",
  },
  {
    title: "Result flows back",
    description:
      "The handler returns a CallToolResult. dispatch_tool logs the response with duration and captured logs, restores window focus, and writes screenshots before/after to executions/. The LLM receives the result on the next turn.",
  },
];

const toolList = [
  "get_window_tree",
  "get_applications_and_windows_list",
  "click_element",
  "type_into_element",
  "press_key",
  "press_key_global",
  "validate_element",
  "wait_for_element",
  "activate_element",
  "navigate_browser",
  "execute_browser_script",
  "open_application",
  "scroll_element",
  "delay",
  "run_command",
  "mouse_drag",
  "highlight_element",
  "select_option",
  "set_selected",
  "invoke_element",
  "set_value",
  "execute_sequence",
  "stop_highlighting",
  "stop_execution",
  "gemini_computer_use",
  "read_file",
  "write_file",
  "edit_file",
  "copy_content",
  "glob_files",
  "grep_files",
];

const faqs = [
  {
    q: "What is an MCP server in one sentence?",
    a: "An MCP server is a process that speaks the Model Context Protocol over stdio or HTTP and exposes a set of named, typed tools an LLM can call. Past the protocol framing, the core is a single dispatch function that takes a tool name plus JSON arguments and returns a structured result. You can see a real one at crates/terminator-mcp-agent/src/server.rs line 9953 in the Terminator repo: the async fn dispatch_tool has one match arm per tool, and Terminator's currently has 31 of them. That dispatch function is the MCP server. Everything else (transport, logging, schema generation) is plumbing around it.",
  },
  {
    q: "How is an MCP server different from a REST API?",
    a: "Two things. First, the tools are discovered at runtime via list_tools, not pre-documented in an OpenAPI spec. The LLM asks the server \"what can you do\" on every connection and the server answers with a schema the model can consume without human intervention. Second, the tool set is designed for an LLM, not a human developer. Typed arguments, clear naming, parameter limits, and a cancellation token so the model can stop a long-running action are first-class. Terminator's implementation goes further: its build.rs parses the dispatch_tool match block at compile time and bakes the tool list into the system prompt via env!(\"MCP_TOOLS\"), so the LLM sees the exact same list the binary dispatches against. A REST API has no mechanism for that.",
  },
  {
    q: "What does an MCP server actually do, as opposed to the generic definition?",
    a: "Whatever you put inside dispatch_tool. Terminator's server hosts 31 desktop automation tools: click_element, type_into_element, get_window_tree, navigate_browser, open_application, execute_sequence, run_command, and two dozen more. Each one is an async Rust function that eventually calls into Windows UIA or macOS accessibility APIs. An MCP server for Slack would have post_message, list_channels, mark_read. An MCP server for Postgres would have run_query, list_tables, describe_schema. The protocol is the same; the handlers are whatever makes sense for your system.",
  },
  {
    q: "What is the uncopyable thing about Terminator's MCP server?",
    a: "The build.rs trick. Look at crates/terminator-mcp-agent/build.rs starting at line 31. extract_mcp_tools() reads src/server.rs, walks until it hits the line containing \"let result = match tool_name\", then collects every subsequent line that starts with a quoted string followed by \" =>\". That list becomes the MCP_TOOLS environment variable via rustc-env, which means the compiled binary contains the literal string of comma-separated tool names. prompt.rs line 10 reads env!(\"MCP_TOOLS\") at compile time and injects it into the system instructions the server returns on initialize. The practical effect: you cannot drift between what the server dispatches and what the LLM sees in its prompt. Every other MCP server I have seen lets those two drift.",
  },
  {
    q: "Do I need the MCP protocol for my LLM to use tools?",
    a: "No. OpenAI function calling, Anthropic tool use, and model-specific SDKs all let you define tools inline. MCP matters when you want a tool server that is independent of the LLM, reusable across clients, and launchable as a separate process. Example: Terminator's MCP server runs the same way whether Claude Code, Cursor, or a custom app is talking to it, because the protocol is the contract. If you hardcode function definitions into one client, you pay that cost again for the next client. MCP is worth it when the tool set is either large (Terminator's 31), expensive to maintain (browser automation), or security-sensitive (file system access), and you want one implementation that multiple assistants share.",
  },
  {
    q: "How does a client like Claude or Cursor connect to an MCP server?",
    a: "Two common transports. stdio means the client launches the server as a child process and communicates over stdin/stdout, framed as JSON-RPC 2.0. This is what claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user sets up: Claude spawns npx, the MCP agent writes JSON-RPC frames to stdout, Claude reads them. HTTP is the alternative: the server binds a port and exposes POST /mcp (the main JSON-RPC endpoint), GET /health, and GET /status. Terminator's HTTP mode also exposes GET /events for SSE-based workflow progress. See crates/terminator-mcp-agent/README.md lines 36-45 for the full HTTP surface, including the concurrency-aware 503 behavior that plays nicely with an Azure Load Balancer.",
  },
  {
    q: "What does Terminator's MCP server let an LLM actually do?",
    a: "Drive any app on your desktop through the accessibility tree. Concretely: read the UI tree of any Windows or macOS app (get_window_tree), click elements by role and name (click_element with selectors like role:Button && name:Submit), type into text boxes (type_into_element), drive a browser (navigate_browser, execute_browser_script), launch applications, read and write files, run shell commands, and stitch it all together into YAML or JSON workflows (execute_sequence). The LLM does not see pixels unless you ask it to; it reads structured accessibility data the OS already provides. That is why Terminator calls itself Playwright-shaped for the whole desktop. Selectors, locators, typed actions, and the LLM sits on top as a user.",
  },
  {
    q: "How do I inspect an MCP server's tool list without reading the source?",
    a: "Two ways. The MCP spec provides list_tools. Any client library (including the official TypeScript and Python SDKs) exposes this as a call. Terminator's CLI shortcut is terminator mcp exec list_tools or terminator mcp exec get_applications to probe a single tool. For local debugging, you can also run the agent with HTTP transport (-t http) and hit the endpoint directly. For the specific case of Terminator, the shortest path to see the full list is to open crates/terminator-mcp-agent/src/server.rs and search for \"let result = match tool_name\"; every subsequent match arm is a tool. The same list is embedded in the binary at build time, so the binary and the source can never disagree.",
  },
  {
    q: "Why would I build an MCP server instead of adding features to my existing product?",
    a: "Because the audience is AI assistants, not humans. A product's web UI is optimized for a human with a mouse; an MCP server is optimized for a model that reads tool schemas, reasons about which tool to call, and does not benefit from visual affordances. A good test: if the work you want an AI to do involves chaining 5+ actions in your product and no single API call does all of it, an MCP server gives the LLM a first-class way to drive that chain with typed tools and explicit cancellation. Terminator's case is the extreme version: the product has no UI, it is entirely an MCP server plus SDKs. The MCP server IS the product.",
  },
  {
    q: "What is the smallest possible MCP server?",
    a: "A process that speaks MCP, exposes list_tools returning one tool, and handles one tool call. In practice that is ~50 lines in Python using the official SDK. A useful MCP server is usually larger because it needs schema definitions, error handling, observability, and a real set of tools. Terminator's MCP agent is ~10,900 lines in server.rs alone, plus the rest of the crate, because it is wrapping Windows UIA and macOS accessibility APIs and doing serious cross-process work. But the minimum bar is low; the floor to get an LLM calling a single custom tool is a single afternoon of work with an SDK.",
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
              <span className="inline-block bg-teal-900/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full border border-teal-800/60">
                Guide
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Model Context Protocol
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Terminator MCP agent
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-[1.05]">
              What is an{" "}
              <GradientText variant="teal">MCP server</GradientText>? A real one,
              opened up in the editor, not the abstract definition.
            </h1>

            <p className="text-lg text-zinc-400 mb-6 max-w-3xl leading-relaxed">
              Every article on the first page of Google defines MCP the same way.
              A protocol, a client, a server, three primitives (tools, resources,
              prompts), the same three example servers (files, GitHub, Slack).
              All correct, all abstract. What none of them do is open an actual
              MCP server and show the dispatch function where the name the LLM
              emits becomes the code that runs. This page does. The server is
              Terminator&apos;s MCP agent, a ~10,900 line Rust binary that turns
              your AI coding assistant into a desktop agent, and the interesting
              part fits on one screen.
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
                "dispatch_tool in server.rs: one match arm per tool, 31 arms",
                "build.rs parses the match block and bakes the tool list into the binary",
                "prompt.rs reads env!(\"MCP_TOOLS\") so the system prompt stays in sync",
                "Claude, Cursor, VS Code all speak the same stdio JSON-RPC transport",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#dispatch-tool"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors text-sm font-medium"
              >
                Jump to the match block
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video via Remotion */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="An MCP server is a named function dispatcher for LLMs."
            subtitle="Open server.rs and that is literally what you find."
            accent="teal"
            captions={[
              "One process, one dispatch_tool function, one match block",
              "Each arm: \"tool_name\" => call the async handler",
              "Terminator's has 31 arms, one per desktop action",
              "build.rs bakes that list into the system prompt at compile time",
              "The LLM sees the exact names the binary dispatches against",
            ]}
          />
        </section>

        {/* The short answer */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-5">
            The short answer
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            An MCP server is a long-running process that exposes a set of named
            tools an LLM can call. It speaks JSON-RPC 2.0 over stdio or HTTP, it
            responds to <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">list_tools</code> with a catalogue of what
            it can do, and it responds to <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">tools/call</code> by dispatching to
            a handler keyed on the tool name. That is the whole protocol from
            the server&apos;s perspective. The value of an MCP server is whatever
            its handlers do.
          </p>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            Terminator&apos;s MCP server is worth looking at because its 31
            handlers wrap the Windows UI Automation and macOS Accessibility APIs.
            Which means the LLM it is connected to can click, type, scroll, and
            read the state of any app on your desktop, not just talk to one
            SaaS. Same protocol, dramatically different surface area.
          </p>
        </section>

        {/* Sequence diagram: the MCP call flow */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            How a single tool call flows through an MCP server
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            Four actors, nine messages. The model never touches the OS directly;
            it emits a tool name and waits.
          </p>
          <SequenceDiagram
            title="tools/call over stdio"
            actors={["LLM", "Host (Claude Code)", "MCP server (Terminator)", "OS (UIA / AX)"]}
            messages={[
              { from: 0, to: 1, label: "pick tool_name = click_element", type: "request" },
              { from: 1, to: 2, label: "JSON-RPC tools/call", type: "request" },
              { from: 2, to: 2, label: "dispatch_tool match arm", type: "event" },
              { from: 2, to: 3, label: "find_element(selector)", type: "request" },
              { from: 3, to: 2, label: "UIAutomationElement", type: "response" },
              { from: 2, to: 3, label: "invoke() or click()", type: "request" },
              { from: 3, to: 2, label: "ok", type: "response" },
              { from: 2, to: 1, label: "CallToolResult + screenshot", type: "response" },
              { from: 1, to: 0, label: "next turn, rendered", type: "response" },
            ]}
          />
        </section>

        {/* Metrics row */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-4">
            Terminator&apos;s MCP server, by the numbers
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl">
            Numbers pulled from the current state of the open-source repo. The
            first is the count of match arms in{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              dispatch_tool
            </code>
            . The second is the count of exposed handler functions via{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              #[tool]
            </code>{" "}
            macros. The third is the line count of{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              src/server.rs
            </code>
            . The fourth is the default per-machine concurrency limit in HTTP mode.
          </p>
          <MetricsRow
            metrics={[
              { value: 31, label: "Match arms in dispatch_tool" },
              { value: 35, label: "Tool functions in server.rs" },
              { value: 10912, label: "Lines in server.rs" },
              { value: 1, label: "MCP_MAX_CONCURRENT default" },
            ]}
          />
        </section>

        {/* The dispatch_tool source */}
        <section id="dispatch-tool" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-4">
            <GradientText variant="teal">dispatch_tool</GradientText>: the whole
            server, on one screen
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
            This is the core of Terminator&apos;s MCP server. Abbreviated, but
            shaped exactly like the real file. Open{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              crates/terminator-mcp-agent/src/server.rs
            </code>{" "}
            at line 9953 to see all 31 arms. Each arm deserializes JSON into a
            typed Args struct, awaits an async handler, and wraps cancellation
            via <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">tokio::select</code>. There is no
            routing framework. No middleware chain. One match block.
          </p>

          <AnimatedCodeBlock
            code={dispatchToolCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />

          <p className="text-zinc-400 mt-4 leading-relaxed">
            That is it. Every MCP tool call the LLM makes, for every tool the
            server exposes, passes through that match. If you remember one
            thing about MCP servers from this page, let it be that the protocol
            is elaborate and the server shape is not.
          </p>
        </section>

        {/* Anchor fact: the build.rs trick */}
        <section className="max-w-4xl mx-auto px-6 py-10 bg-zinc-950/40 border-y border-zinc-800/60">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-4">
            The anchor fact:{" "}
            <GradientText variant="teal">build.rs</GradientText> keeps the
            system prompt in sync with the code
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
            Here is the part no other MCP explainer mentions, because no other
            server does it. Terminator&apos;s{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              build.rs
            </code>{" "}
            runs at compile time. It opens{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              src/server.rs
            </code>
            , walks every line until it hits the string{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              let result = match tool_name
            </code>
            , then collects the tool names from the match arms below. The
            resulting comma-separated list is injected into the binary as an
            environment variable.
          </p>

          <AnimatedCodeBlock
            code={buildRsCode}
            language="rust"
            filename="crates/terminator-mcp-agent/build.rs"
          />

          <p className="text-zinc-400 mt-6 mb-4 max-w-3xl leading-relaxed">
            At runtime, <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">prompt.rs</code> reads the
            baked-in list and pastes it verbatim into the system instructions
            the server announces on <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">initialize</code>. The LLM&apos;s
            system prompt literally contains the names the match block
            dispatches against.
          </p>

          <AnimatedCodeBlock
            code={promptInjectCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/prompt.rs"
          />

          <div className="mt-6 p-5 rounded-xl bg-teal-500/10 border border-teal-500/30">
            <p className="text-zinc-300 leading-relaxed">
              You can verify this in 10 seconds: clone the repo and run{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                grep -n MCP_TOOLS crates/terminator-mcp-agent/build.rs
                crates/terminator-mcp-agent/src/prompt.rs
              </code>
              . Three matches come back: one writing the env var in build.rs, one
              reading it with <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">env!</code>, and one interpolating it into
              the instructions string. The prompt cannot drift from the
              implementation, because changing either requires recompiling and
              the build step parses the match block fresh every time.
            </p>
          </div>
        </section>

        {/* The 31 tools marquee */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            The 31 tool names, end to end
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            This is the exact set the build step extracts, in source order. The
            LLM sees this list inside its system prompt and picks a name when
            it wants to act.
          </p>
          <Marquee speed={35}>
            {toolList.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-800 bg-zinc-900 text-teal-300 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
          <p className="text-xs text-zinc-500 mt-3 max-w-3xl">
            Count them: there are 31. Some wrap UI actions (click_element,
            type_into_element), some wrap OS-level affordances (open_application,
            run_command), some wrap file I/O (read_file, write_file), and one
            (execute_sequence) is a workflow DSL that nests the others.
          </p>
        </section>

        {/* Anatomy bento */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-4">
            Anatomy of a real MCP server
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl">
            Every MCP server boils down to these six parts. The names change,
            the shapes do not. Below is how Terminator implements each one.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* AnimatedBeam: tool router */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <AnimatedBeam
            title="Every tool call, one hub, one handler per arm"
            from={[
              { label: "Claude Code", sublabel: "stdio client" },
              { label: "Cursor", sublabel: "stdio client" },
              { label: "VS Code", sublabel: "stdio client" },
            ]}
            hub={{ label: "dispatch_tool", sublabel: "server.rs line 9953" }}
            to={[
              { label: "click_element", sublabel: "UIA / AX" },
              { label: "execute_sequence", sublabel: "workflow DSL" },
              { label: "run_command", sublabel: "JS / Python / shell" },
            ]}
          />
        </section>

        {/* Step timeline: what happens end to end */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            End to end, what happens when an LLM calls a tool
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            Six steps from cold start to rendered result. No hand-waving, no
            "the framework handles it" boxes.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* Install terminal */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Try it against a real server in two minutes
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            This is the actual installer path the Terminator README ships. Once
            Claude recognizes the server, the 31 tool names show up in its
            internal tool picker and your AI can drive your desktop.
          </p>
          <TerminalOutput title="macOS / Linux" lines={installTerminal} />
        </section>

        {/* Orbiting circles: ecosystem */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            What orbits a Terminator MCP server once it is running
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            Six real tool names from the dispatch match, circling the server
            that exposes them. These are the verbs an LLM has available the
            moment the process is up.
          </p>
          <OrbitingCircles
            center={<span className="text-sm font-mono">t8r</span>}
            radius={150}
            duration={30}
            items={[
              <span key="a" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">click_element</span>,
              <span key="b" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">type_into_element</span>,
              <span key="c" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">get_window_tree</span>,
              <span key="d" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">execute_sequence</span>,
              <span key="e" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">navigate_browser</span>,
              <span key="f" className="text-xs font-mono text-teal-300 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900">run_command</span>,
            ]}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every file and line number referenced on this page is grep-able in a fresh clone of mediar-ai/terminator."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="MCP server vs a traditional REST API"
            intro="Both expose capabilities over a network protocol. The audience is the difference. One is built for developers to integrate; the other is built for language models to discover and call."
            productName="MCP server"
            competitorName="REST API"
            rows={comparisonRows}
          />
        </section>

        {/* Glow card: the 'what is it for' punchline */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-100 mb-3">
              Why MCP matters for the desktop case specifically
            </h3>
            <p className="text-zinc-300 leading-relaxed mb-3">
              A file system MCP server is nice. A GitHub MCP server is nice.
              What is new is that the same protocol also lets an LLM drive the
              UI of arbitrary apps. Calculator, Excel, Chrome, a legacy
              Win32 accounting system your team still uses. Any of those, via
              the accessibility tree, through one <code className="font-mono text-xs bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">dispatch_tool</code> match block.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-3">
              Terminator is that MCP server. It is a developer framework for
              building desktop automation, not a consumer app. It gives
              existing AI coding assistants the ability to control your entire
              OS, not just write code. Like Playwright, but for every app on
              your desktop, and the surface the LLM sees is the 31-tool list
              the build step extracts from <code className="font-mono text-xs bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">server.rs</code>.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              If you were looking for a definition of MCP server, the short
              answer is at the top of this page. If you were looking for the
              thing it is actually good for, this is it.
            </p>
          </GlowCard>
        </section>

        {/* Inline CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <InlineCta
            heading="Install Terminator's MCP server now"
            body="Runs over stdio under Claude Code or Cursor, or over HTTP behind a load balancer. MIT-licensed, cross-platform, and the full source of the dispatch function is in one file you can read start to finish in an hour."
            linkText="claude mcp add terminator"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* Count stat callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-300 mb-3">
              Desktop tools currently exposed
            </p>
            <div className="text-6xl font-bold text-zinc-100 mb-2">
              <NumberTicker value={31} />
            </div>
            <p className="text-sm text-zinc-500">
              One per match arm in dispatch_tool. Counted fresh at every
              compile.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator gives existing AI coding assistants the ability to
            control your whole desktop, not just write code. Like Playwright,
            but for every app on your OS.
          </p>
        </footer>
      </article>
    </div>
  );
}
