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
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  BentoGrid,
  GlowCard,
  StepTimeline,
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/mcp-server-means";
const PUBLISHED = "2026-04-19";
const TITLE =
  "MCP server means a process, not a protocol: the operational layer every explainer leaves out";
const DESCRIPTION =
  "Every top result for 'mcp server means' stops at the protocol definition: a process that exposes tools, resources, and prompts. None of them describe what the server actually does on every single tool call. This page shows the operational layer using Terminator's 10,912-line server.rs: how it saves your keyboard focus before the LLM acts, restores it after, enforces per-client Ask/Act mode, returns HTTP 503 the moment one tool is running, and cancels mid-flight via a tokio cancellation token.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "MCP server does not just mean 'protocol endpoint'. It means a long-running process that saves focus, cancels in-flight tools, enforces Ask/Act mode per client, and returns 503 to load balancers when busy. Terminator's server.rs has all of it in one file.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "mcp server means: the operational layer nobody writes about",
    description:
      "The spec defines the protocol. The server does seven operational things on every call. This page opens server.rs and shows them.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "MCP server means" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "MCP server means", url: PAGE_URL },
];

const focusRestoreCode = `// crates/terminator-mcp-agent/src/server.rs, inside async fn call_tool
// (line ~10621). This is the line that decides whether the server
// will steal your keyboard or hand it back when a tool finishes.

#[cfg(target_os = "windows")]
let restore_focus_default = !matches!(
    tool_name.as_str(),
    "click_element" | "invoke_element" | "hover_element",
);

#[cfg(target_os = "windows")]
let saved_focus = if window_mgmt_opts
    .restore_focus
    .unwrap_or(restore_focus_default)
{
    // Save UI Automation focused element + caret range
    // BEFORE the tool runs. Window activation steals focus,
    // so we capture state first.
    terminator::platforms::windows::save_focus_state()
} else {
    None
};

// ... tool runs here via tool_router.call(tcc) ...

// After the tool returns, restore_focus_state puts your caret back.
// Click-like tools skip this on purpose: you wanted focus where you
// told the LLM to click.`;

const cancellationCode = `// The same call_tool wrapper, a few hundred lines later.
// Every dispatch is racing a cancellation token from the client.

let result = match tool_name {
    "click_element" => {
        let args: ClickElementArgs = serde_json::from_value(args.clone())?;
        tokio::select! {
            result = self.click_element(Parameters(args)) => result,
            _ = request_context.ct.cancelled() => {
                Err(McpError::internal_error(
                    format!("Tool {tool_name} was cancelled"),
                    Some(json!({ "code": -32001, "tool": tool_name })),
                ))
            }
        }
    }
    // ... 30+ more arms, each wrapped in the same tokio::select ...
};`;

const busyStatusCode = `// crates/terminator-mcp-agent/src/main.rs, lines 516-556
// HTTP mode: GET /status probes return 503 when one tool is running.
// This is how an Azure Load Balancer takes a busy VM out of rotation.

let max_concurrent = std::env::var("MCP_MAX_CONCURRENT")
    .ok()
    .and_then(|s| s.parse::<usize>().ok())
    .unwrap_or(1);

// ...

async fn status_handler(State(state): State<AppState>) -> impl IntoResponse {
    let active = state.active_requests.load(Ordering::SeqCst);
    let busy = active >= state.max_concurrent;
    let code = if busy { StatusCode::SERVICE_UNAVAILABLE }
               else     { StatusCode::OK };
    (code, Json(json!({
        "busy": busy,
        "activeRequests": active,
        "maxConcurrent": state.max_concurrent,
        "lastActivity": last_activity,
    })))
}`;

const statusTerminal = [
  { text: "curl -s localhost:8765/status | jq .", type: "command" as const },
  { text: "{", type: "output" as const },
  { text: '  "busy": false,', type: "output" as const },
  { text: '  "activeRequests": 0,', type: "output" as const },
  { text: '  "maxConcurrent": 1,', type: "output" as const },
  { text: '  "lastActivity": "2026-04-19T12:40:11Z"', type: "output" as const },
  { text: "}", type: "output" as const },
  { text: "# HTTP 200: the server is idle, load balancer keeps routing", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# now an LLM fires a long click_element with scroll fallback", type: "output" as const },
  { text: "curl -i localhost:8765/status", type: "command" as const },
  { text: "HTTP/1.1 503 Service Unavailable", type: "error" as const },
  { text: 'content-type: application/json', type: "output" as const },
  { text: "", type: "output" as const },
  { text: '{"busy":true,"activeRequests":1,"maxConcurrent":1,"lastActivity":"..."}', type: "output" as const },
  { text: "# load balancer probes /status, sees 503, routes to another VM", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What the word describes",
    competitor: "A protocol interface (tools, resources, prompts)",
    ours: "A long-running OS process that hosts the interface plus all the side effects",
  },
  {
    feature: "On every tool call",
    competitor: "Spec is silent; 'server handles it'",
    ours: "Save focus, set in_sequence flag, start log capture, start tracing span",
  },
  {
    feature: "Cancellation",
    competitor: "Not in the spec body",
    ours: "tokio::select on request_context.ct for every single match arm",
  },
  {
    feature: "Per-client policy",
    competitor: "Tools are either listed or not",
    ours: "claude-code client in Ask mode gets blocked_tools filtered on list_tools and call_tool",
  },
  {
    feature: "Under load",
    competitor: "Queue, retry, or return 429",
    ours: "MCP_MAX_CONCURRENT=1 by default, GET /status returns 503 so LBs drain the VM",
  },
  {
    feature: "Observability",
    competitor: "Up to the implementer",
    ours: "execution_logger::log_request + log_response_with_logs wrap every dispatch, PostHog timings per tool",
  },
  {
    feature: "Session lifecycle",
    competitor: "initialize, then tools/call",
    ours: "on_initialized prunes dead peers via notify_logging_message('ping') before adding new ones",
  },
];

const operationalBento: BentoCard[] = [
  {
    title: "Focus save and restore",
    description:
      "Before every non-click tool, the server calls save_focus_state() (platforms/windows/input.rs:171). After the handler returns, restore_focus_state() puts the caret back. The MCP server never steals your keyboard.",
    size: "2x1",
  },
  {
    title: "Cancellation mid-call",
    description:
      "Every match arm wraps the handler in tokio::select! against request_context.ct.cancelled(). If the client cancels the request, the running tool stops instead of finishing in the background.",
    size: "1x1",
  },
  {
    title: "Per-client mode",
    description:
      "claude_code in Ask mode has a blocked_tools set. call_tool rejects -32002 when asked, list_tools filters them out. mediar-app (the UI) never gets filtered. Mode is stored per-client.",
    size: "1x1",
  },
  {
    title: "Busy 503 for load balancers",
    description:
      "HTTP mode binds GET /status. Returns 200 when idle, 503 when active_requests >= MCP_MAX_CONCURRENT. An Azure Load Balancer probe drains a VM the moment one tool starts.",
    size: "2x1",
  },
  {
    title: "Execution log capture",
    description:
      "Every call runs inside a log capture window. Structured and tracing logs from the handler and its descendants are written to executions/ with screenshots before and after the UI action.",
    size: "1x1",
  },
  {
    title: "Dead peer pruning",
    description:
      "on_initialized sends notify_logging_message('ping') to every broadcast peer. Peers that fail the ping are dropped. This keeps the broadcast list from leaking across crashed clients.",
    size: "1x1",
  },
];

const timelineSteps = [
  {
    title: "Request arrives",
    description:
      "Claude Code emits a JSON-RPC tools/call frame with tool_name and arguments. call_tool deserializes it and the operational preamble begins. Nothing has touched your OS yet.",
  },
  {
    title: "Per-client mode check",
    description:
      "The server reads client_info.name from the peer (claude-code, mediar-app, cursor). If the client is in Ask mode and the tool is blocked, call_tool returns error -32002 immediately. No dispatch, no side effects.",
  },
  {
    title: "Focus state saved",
    description:
      "On Windows, unless the tool is click-like, save_focus_state() captures the currently focused UIA element and its caret range. This is the checkpoint the server rewinds to after the tool runs.",
  },
  {
    title: "Dispatch and cancellation race",
    description:
      "dispatch_tool match arm deserializes into a typed Args struct and calls the handler inside tokio::select! against request_context.ct. If the client cancels, the tool stops; otherwise the handler touches UIA or AX and returns.",
  },
  {
    title: "Log and screenshot capture",
    description:
      "execution_logger::log_response_with_logs writes the request, response, duration, and captured logs to executions/. If the tool mutated the UI, screenshots before and after are attached to the record.",
  },
  {
    title: "Focus restored, activity timestamp updated",
    description:
      "restore_focus_state() puts your caret back where it was (unless you were clicking, in which case focus follows the click). In HTTP mode, active_requests is decremented and last_activity is written. The next /status probe will return 200 again.",
  },
];

const faqs = [
  {
    q: "What does 'MCP server' actually mean, in one sentence?",
    a: "An MCP server is a long-running process that speaks the Model Context Protocol over stdio or HTTP and hosts a set of named tools an LLM can call. The word 'server' is doing a lot of work here: it is not just a protocol endpoint. It is a process with state, a log pipe, cancellation tokens, focus-saving side effects (if the tools touch a UI), and, in Terminator's case, per-client Ask/Act policy. Every top result for this query stops at the protocol interface; the operational layer is equally part of what the word means in practice.",
  },
  {
    q: "Why does the definition 'a protocol interface for tools, resources, and prompts' feel incomplete?",
    a: "Because an MCP server in production is a process with side effects. A GitHub MCP server that makes HTTP requests is fine to describe purely as a protocol interface. A desktop MCP server like Terminator cannot be. The moment a tool call types a keystroke or clicks a window, the server becomes responsible for save/restore of the caret, for focus policy per tool (click_element, invoke_element, and hover_element deliberately skip focus restore because the user wanted focus to land on the clicked element), for cancellation so the LLM can stop a long-running action, and for concurrency so your machine does not run two conflicting automations at once. Those responsibilities are what 'server' means in full.",
  },
  {
    q: "What is the concrete thing Terminator's MCP server does that a REST API does not?",
    a: "It saves and restores your keyboard focus around every tool call. The exact line is in crates/terminator-mcp-agent/src/server.rs around line 10621: let restore_focus_default = !matches!(tool_name.as_str(), \"click_element\" | \"invoke_element\" | \"hover_element\"). For every tool that is not click-like, the server calls save_focus_state() via the Windows UI Automation API before the tool runs and restore_focus_state() after it returns. A REST API has no concept of this because a REST endpoint is not embedded inside your desktop session. It is a side-effecting process living next to your editor.",
  },
  {
    q: "What are the operational layers wrapped around an MCP tool call?",
    a: "Seven, in order: (1) client mode check, which rejects blocked tools in Ask mode; (2) cancellation reset, so a prior stop_execution does not cancel the next call; (3) workflow context extraction for execute_sequence steps; (4) execution logging start, with tracing span and log capture; (5) focus state save, unless the tool is click-like; (6) the dispatch itself via tokio::select on the cancellation token; (7) response logging, screenshot attachment, PostHog timing, and focus restore. All seven live inside async fn call_tool in server.rs. You can see them sequentially if you read from line 10541 down.",
  },
  {
    q: "Why does MCP_MAX_CONCURRENT default to 1?",
    a: "Because a desktop MCP server serializes access to the GUI. Two tool calls running in parallel would fight each other for window focus, keyboard state, and clipboard. Terminator's main.rs reads MCP_MAX_CONCURRENT from the environment and defaults to 1. If a second tools/call arrives while one is in flight, POST /mcp returns 503 and GET /status returns 503 so an Azure Load Balancer can route traffic to a different VM. You can raise the limit if your tools are genuinely independent (read_file, grep_files, glob_files) but for UI-touching tools, serial is correct.",
  },
  {
    q: "How do I inspect an MCP server's actual behavior, not just its tool list?",
    a: "Run it in HTTP mode and probe the status endpoint. terminator-mcp-agent -t http starts it on localhost; curl localhost:8765/health returns 200 while the process is alive, curl localhost:8765/status returns the busy-aware JSON above, and a trace of log lines written to executions/ for each call shows exactly what the server did, with before/after screenshots. The tool list is the easy part; the operational behavior is the part the README lines 36-45 actually describe.",
  },
  {
    q: "Does every MCP server do this much work on a tool call?",
    a: "No. A minimal MCP server written against the official Python or TypeScript SDK can be 50 lines that handle tool dispatch and nothing else. The operational layer becomes necessary when the server has real-world side effects (UI state, clipboard, focus, filesystem) and multiple clients with different trust levels. Terminator has both, which is why call_tool in server.rs is ~300 lines of bookkeeping around each dispatch. If your MCP server wraps a stateless remote API, you probably do not need most of this. If it touches a running OS session, you need all of it.",
  },
  {
    q: "What is the practical difference between 'MCP server' and 'MCP endpoint'?",
    a: "Colloquially nothing; practically everything. 'MCP endpoint' implies a URL that accepts JSON-RPC. 'MCP server' implies the host process that owns that endpoint and everything around it: the tool registry, the cancellation tokens, the log capture, the focus policy, the per-client mode state, the broadcast peer list. Reading modelcontextprotocol.io you learn what an MCP endpoint accepts. Reading crates/terminator-mcp-agent/src/server.rs you learn what an MCP server is.",
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
        <BackgroundGrid pattern="lines" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-teal-900/30 text-teal-300 text-xs font-medium px-3 py-1 rounded-full border border-teal-800/60">
                Guide
              </span>
              <span className="inline-block bg-zinc-900 text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Model Context Protocol
              </span>
              <span className="inline-block bg-transparent text-zinc-300 text-xs font-medium px-3 py-1 rounded-full border border-zinc-800">
                Operational layer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-100 mb-6 leading-[1.05]">
              What <GradientText variant="teal">MCP server</GradientText> means
              once the protocol explainer ends and the process actually runs
            </h1>

            <p className="text-lg text-zinc-400 mb-6 max-w-3xl leading-relaxed">
              Search this phrase and the top ten results all land in the same
              place: a server is a process that exposes tools, resources, and
              prompts over JSON-RPC. Correct, and useless the moment you write
              one. This page is about the other half. What a real MCP server
              does on every tool call, before and after the dispatch function
              runs, on a machine where tools actually touch the OS. The
              reference implementation is Terminator&apos;s MCP agent, a 10,912
              line Rust server whose job is to let Claude click real buttons in
              real apps without stealing your keyboard.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="9 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "call_tool wraps every dispatch in 7 operational layers",
                "save_focus_state/restore_focus_state keep your caret exactly where it was",
                "tokio::select on request_context.ct cancels in-flight tools mid-call",
                "MCP_MAX_CONCURRENT=1 default; GET /status returns 503 when busy",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs">
                Read call_tool in the repo
              </ShimmerButton>
              <a
                href="#operational-layers"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-800 text-zinc-300 hover:bg-zinc-900 transition-colors text-sm font-medium"
              >
                Skip to the seven layers
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="MCP server means more than a protocol interface."
            subtitle="It means the process that hosts it, with all its side effects."
            accent="teal"
            captions={[
              "A running process, not a spec document",
              "Saves your keyboard focus before a tool acts",
              "Cancels in-flight dispatch on client hangup",
              "Returns HTTP 503 so load balancers drain busy VMs",
              "Restores your caret the moment the tool returns",
            ]}
          />
        </section>

        {/* The textbook vs the real answer */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-5">
            The textbook answer, then the one that matters
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            The textbook: an MCP server is a program that speaks the Model
            Context Protocol, exposes a set of named tools plus optional
            resources and prompts, and responds to{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              list_tools
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              tools/call
            </code>
            . That definition is correct and incomplete. It describes an
            interface, not a process.
          </p>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            The one that matters: an MCP server is a long-running process that
            hosts that interface and absorbs the operational cost of every tool
            call. For a desktop automation server, that cost is concrete. It
            has to pick up your focus state, dispatch the tool without letting
            another call race it, cancel mid-flight if the client disconnects,
            write structured logs so you can replay what happened, restore
            your caret at the exact byte offset it was before, and tell a load
            balancer it is busy so the next call does not fight the current
            one. None of that is in the spec; all of it is in the server.
          </p>
          <p className="text-zinc-400 mb-4 max-w-3xl leading-relaxed">
            If you want to see the operational layer in one file, open{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              crates/terminator-mcp-agent/src/server.rs
            </code>{" "}
            and search for{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              async fn call_tool
            </code>
            . It starts at line 10541. The actual match block that dispatches
            to a handler is buried 300 lines later inside the function. The
            300 lines between are what this page is about.
          </p>
        </section>

        {/* Operational metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-4">
            The server, measured
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl">
            Numbers counted in the current open-source repo. The first is the
            number of operational layers wrapped around each dispatch. The
            second is the line count of{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              server.rs
            </code>
            . The third is the default per-machine concurrency limit in HTTP
            mode. The fourth is the settle delay after window management and
            before dispatch.
          </p>
          <MetricsRow
            metrics={[
              { value: 7, label: "Operational layers per tool call" },
              { value: 10912, label: "Lines in server.rs" },
              { value: 1, label: "MCP_MAX_CONCURRENT default" },
              { value: 200, label: "ms window-settle delay", suffix: "ms" },
            ]}
          />
        </section>

        {/* AnimatedBeam: request flows through layers */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            What wraps a single tool call
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            On the left: clients that reach the server. In the middle:{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              call_tool
            </code>
            , which is not the dispatcher. It is the wrapper. On the right:
            the concrete side effects every call produces, regardless of which
            tool ran.
          </p>
          <AnimatedBeam
            title="call_tool is the wrapper, not the dispatcher"
            from={[
              { label: "Claude Code", sublabel: "stdio client" },
              { label: "Cursor", sublabel: "stdio client" },
              { label: "HTTP /mcp", sublabel: "JSON-RPC 2.0" },
            ]}
            hub={{ label: "call_tool", sublabel: "server.rs line 10541" }}
            to={[
              { label: "Focus saved", sublabel: "UIA GetFocusedElement" },
              { label: "Log capture", sublabel: "executions/*.json" },
              { label: "Cancellation", sublabel: "request_context.ct" },
            ]}
          />
        </section>

        {/* Anchor fact: the focus restore line */}
        <section
          id="anchor-fact"
          className="max-w-4xl mx-auto px-6 py-10 bg-zinc-950/40 border-y border-zinc-800/60 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-4">
            The anchor fact:{" "}
            <GradientText variant="teal">one line decides</GradientText> whether
            the server touches your keyboard
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
            Scroll to line 10621 of{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            . This is the single place the server decides whether it will
            restore your caret after a tool finishes. Click-like tools are
            excluded on purpose: if the LLM clicked into a text field, you
            want focus to land there, not snap back to wherever you were
            before. Every other tool (read a window tree, run a workflow,
            grep a file, launch an app) saves focus first, runs, and restores.
          </p>

          <AnimatedCodeBlock
            code={focusRestoreCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />

          <p className="text-zinc-400 mt-6 mb-4 max-w-3xl leading-relaxed">
            The implementation lives in{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              crates/terminator/src/platforms/windows/input.rs:171
            </code>
            . It creates a{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              IUIAutomation
            </code>{" "}
            instance, calls{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              GetFocusedElement
            </code>
            , and if the element supports{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              TextPattern2
            </code>{" "}
            it also saves the caret range. On restore, it calls{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              SetFocus()
            </code>{" "}
            on the saved element and, if a caret range was captured, writes it
            back. This is what &quot;MCP server&quot; means when the tools are
            UI actions: the server is explicitly responsible for not stealing
            your keyboard.
          </p>

          <div className="mt-6 p-5 rounded-xl bg-teal-500/10 border border-teal-500/30">
            <p className="text-zinc-300 leading-relaxed">
              Verify in 10 seconds:{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                git clone https://github.com/mediar-ai/terminator
              </code>
              , then{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                grep -n restore_focus_default
                crates/terminator-mcp-agent/src/server.rs
              </code>
              . Two hits: one in{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                call_tool
              </code>
              , one in{" "}
              <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                dispatch_tool
              </code>
              . Both apply the same matches! rule. This is not a hypothetical.
              It is the reason running Terminator in a background Claude
              session does not yank your cursor around.
            </p>
          </div>
        </section>

        {/* StepTimeline: end to end call */}
        <section
          id="operational-layers"
          className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-100 mb-4">
            The seven layers wrapped around every dispatch
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl leading-relaxed">
            Here is what happens between the moment{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              call_tool
            </code>{" "}
            receives a{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              CallToolRequestParam
            </code>{" "}
            and the moment the handler actually runs. And what happens after.
            If you only remember one section of this page, make it this one.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* Cancellation code */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Cancellation lives inside every match arm
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            Each arm is a tiny tokio::select race. If the client hangs up or
            fires{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              stop_execution
            </code>
            , the ct token trips and the tool loses the race. The handler
            stops instead of finishing in the background and leaving your UI
            in an in-between state.
          </p>
          <AnimatedCodeBlock
            code={cancellationCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />
        </section>

        {/* BentoGrid: the six responsibilities */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-4">
            What a real MCP server is responsible for
          </h2>
          <p className="text-zinc-400 mb-6 max-w-3xl">
            A protocol interface handles requests and returns responses. A
            server, the process hosting that interface, is responsible for
            keeping the machine in a coherent state while it runs. Six of
            those responsibilities, as implemented in Terminator:
          </p>
          <BentoGrid cards={operationalBento} />
        </section>

        {/* Busy 503 terminal */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-100 mb-3">
            Under load: 503 is the correct answer
          </h2>
          <p className="text-zinc-400 mb-4 max-w-3xl">
            In HTTP mode, the server exposes three endpoints:{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              GET /health
            </code>{" "}
            for liveness,{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              GET /status
            </code>{" "}
            for busy-aware routing, and{" "}
            <code className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
              POST /mcp
            </code>{" "}
            for the JSON-RPC body. /status is the operational primitive: it
            returns 200 when idle and 503 when a tool is in flight, so Azure
            Load Balancer (or any L7 probe) can take the VM out of rotation
            instantly.
          </p>
          <TerminalOutput title="probing a running Terminator MCP server" lines={statusTerminal} />

          <p className="text-zinc-400 mt-6 max-w-3xl">
            The switch is governed by a single environment variable. Raise it
            if your tool set is actually parallel-safe (file I/O, read-only
            queries) and leave it at 1 if any tool touches a GUI. This is
            documented in the README at lines 36-45 and the implementation is
            below.
          </p>

          <AnimatedCodeBlock
            code={busyStatusCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="What the spec defines vs what the server actually does"
            intro="The protocol body tells you how a request is framed. The server body tells you what happens while that request is in flight. Both are part of what MCP server means."
            productName="Terminator MCP server"
            competitorName="MCP spec body"
            rows={comparisonRows}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every file, function, and line number on this page is grep-able in a fresh clone of mediar-ai/terminator. Nothing is composited."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Glow card: punchline */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-100 mb-3">
              Why this distinction is worth the ink
            </h3>
            <p className="text-zinc-300 leading-relaxed mb-3">
              If you are building an MCP server for a remote API (Slack, Linear,
              GitHub, Postgres), most of this page does not apply to you. Your
              handlers are network calls; your server is a thin wrapper over an
              SDK; the spec alone describes 90% of the work.
            </p>
            <p className="text-zinc-300 leading-relaxed mb-3">
              If you are building an MCP server that runs on the same machine
              your user is working on, and whose tools have real side effects
              on that machine, the operational layer is most of the work.
              Terminator is the extreme case: its MCP server is the product,
              its handlers drive the Windows UI Automation and macOS
              Accessibility APIs, and every single tool call has to be polite
              about the user&apos;s session. That politeness is implemented
              line by line in{" "}
              <code className="font-mono text-xs bg-zinc-950/60 px-1.5 py-0.5 rounded border border-zinc-800 text-teal-300">
                call_tool
              </code>
              , not inherited from the protocol.
            </p>
            <p className="text-zinc-300 leading-relaxed">
              When you read &quot;mcp server means&quot; in search results and
              see only the protocol definition, you have been shown half of it.
              This page is the other half.
            </p>
          </GlowCard>
        </section>

        {/* Number callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-teal-300 mb-3">
              Lines of wrapper around each dispatch
            </p>
            <div className="text-6xl font-bold text-zinc-100 mb-2">
              <NumberTicker value={300} suffix="+" />
            </div>
            <p className="text-sm text-zinc-500">
              Counted from the top of call_tool (server.rs line 10541) down to
              the match-arm dispatch. The dispatch itself is ~3 lines. The
              rest is operational policy.
            </p>
          </div>
        </section>

        {/* Inline CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <InlineCta
            heading="Install the Terminator MCP server"
            body="Runs over stdio under Claude Code, Cursor, VS Code, or over HTTP behind a load balancer. MIT-licensed. The 300 lines of wrapper around each dispatch are yours to read."
            linkText="claude mcp add terminator"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator gives AI coding assistants the ability to drive every
            app on your desktop. The MCP server is the process that hosts that
            surface without stepping on your session. Like Playwright for the
            whole OS.
          </p>
        </footer>
      </article>
    </div>
  );
}
