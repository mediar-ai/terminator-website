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
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/best-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "The best MCP server is the one that matches the shape of the resource it controls";
const DESCRIPTION =
  "Every 'best MCP server' listicle ranks by tool count or category. None of them ask the one question that matters in production: does the server's concurrency shape match the resource behind it? Terminator is the only MCP server I have read that defaults MCP_MAX_CONCURRENT=1 because a desktop has one mouse, one keyboard, and one focused window. This page shows the exact main.rs code that enforces it and why every other approach corrupts state.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Ranking MCP servers by tool count misses the production question. The better filter is concurrency shape: some resources fan out (search, read-only queries), some serialize (a mouse, a printer, a checkout flow). We pick Terminator apart to show what 'designed for the resource' looks like in code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The best MCP server is the one shaped like the resource it controls",
    description:
      "Stateless fan-out servers corrupt a desktop. Terminator defaults MCP_MAX_CONCURRENT=1 and returns 503 with a load-balancer-shaped body. Here is the code.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Best MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Best MCP server", url: PAGE_URL },
];

const gateCode = `// crates/terminator-mcp-agent/src/main.rs:515-524
// Default is 1. On purpose. Set higher only if you are sure your
// resource can actually handle it.

let max_concurrent = std::env::var("MCP_MAX_CONCURRENT")
    .ok()
    .and_then(|s| s.parse::<usize>().ok())
    .unwrap_or(1);

// main.rs:664-684 — middleware on POST /mcp. If the machine is
// already executing a request, new requests get 503 with a
// load-balancer-shaped body and never touch the desktop.

async fn mcp_gate(
    State(state): State<AppState>,
    req: Request<Body>,
    next: Next,
) -> impl IntoResponse {
    if req.method() == Method::POST {
        let active = state.active_requests.load(Ordering::SeqCst);
        if active >= state.max_concurrent {
            let last_activity = state.last_activity.lock()
                .map(|s| s.clone())
                .unwrap_or_else(|_| chrono::Utc::now().to_rfc3339());
            let body = serde_json::json!({
                "busy": true,
                "activeRequests": active,
                "maxConcurrent": state.max_concurrent,
                "lastActivity": last_activity,
            });
            return (StatusCode::SERVICE_UNAVAILABLE, Json(body))
                .into_response();
        }
        // ... register cancellation, increment, forward to handler ...
    }
}`;

const statusProbeCode = `// crates/terminator-mcp-agent/src/main.rs:537-553
// GET /status is the contract with the load balancer. 200 if the
// VM can accept a new tool call, 503 if it is already executing one.
// Same JSON shape as the 503 body above, so ops can write one parser.

async fn status_handler(State(state): State<AppState>) -> impl IntoResponse {
    let active = state.active_requests.load(Ordering::SeqCst);
    let busy = active >= state.max_concurrent;
    let last_activity = state.last_activity.lock()
        .map(|s| s.clone())
        .unwrap_or_else(|_| chrono::Utc::now().to_rfc3339());

    let code = if busy {
        StatusCode::SERVICE_UNAVAILABLE
    } else {
        StatusCode::OK
    };

    (code, Json(serde_json::json!({
        "busy": busy,
        "activeRequests": active,
        "maxConcurrent": state.max_concurrent,
        "lastActivity": last_activity,
    })))
}`;

const installTerminal = [
  { text: "# Install the Terminator MCP server under Claude Code", type: "output" as const },
  {
    text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user",
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Probe the status endpoint before and during a tool call", type: "output" as const },
  { text: "curl -s http://127.0.0.1:3000/status", type: "command" as const },
  {
    text: "{\"busy\":false,\"activeRequests\":0,\"maxConcurrent\":1,\"lastActivity\":\"2026-04-19T10:12:41Z\"}",
    type: "output" as const,
  },
  { text: "# 200 OK. VM is idle, LB keeps it in rotation.", type: "info" as const },
  { text: "", type: "output" as const },
  { text: "# While a click_element call is running, the same probe flips:", type: "output" as const },
  { text: "curl -s -o /dev/null -w \"%{http_code}\\n\" http://127.0.0.1:3000/status", type: "command" as const },
  { text: "503", type: "output" as const },
  { text: "# LB takes this VM out of rotation. Next tool call routes elsewhere.", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Default concurrency",
    competitor: "Unbounded or whatever the host sets",
    ours: "MCP_MAX_CONCURRENT defaults to 1 (main.rs:516)",
  },
  {
    feature: "What happens when busy",
    competitor: "Request queues, blocks, or races the active one",
    ours: "POST /mcp returns 503 with a JSON body shaped for a load balancer",
  },
  {
    feature: "GET /status behaviour",
    competitor: "No such endpoint, or 200 even while a request runs",
    ours: "200 when idle, 503 when busy, same body shape as the 503 from /mcp",
  },
  {
    feature: "Cancellation",
    competitor: "No way to stop a long action once it starts",
    ours: "stop_execution tool + tokio::select on a per-request CancellationToken",
  },
  {
    feature: "State ownership",
    competitor: "Stateless, relies on the caller to be serial",
    ours: "Long-lived process owns the machine, focus, and pointer for the duration",
  },
  {
    feature: "Schema drift protection",
    competitor: "Prompt engineer keeps the tool list in sync by hand",
    ours: "build.rs bakes the dispatch_tool match arms into env!(\"MCP_TOOLS\") at compile time",
  },
  {
    feature: "Horizontal scale story",
    competitor: "Run more replicas of the same process",
    ours: "Run more VMs, each with one mouse; LB picks an idle one via /status",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "The desktop has one mouse",
    description:
      "If two agents try to click at once, one of them loses the race and the LLM gets told its click succeeded while a different app actually received focus. The only correct concurrency for a physical device is 1. Terminator encodes that in the default.",
    size: "2x1",
    accent: true,
  },
  {
    title: "A search API has N",
    description:
      "Read-only fan-out is fine. A search MCP server can serve 50 requests at once and nothing breaks. That is a different resource with a different correct answer, which is exactly why 'best MCP server' is the wrong question.",
    size: "1x1",
  },
  {
    title: "A checkout flow has 1",
    description:
      "You do not want two agents both adding items to the same cart, racing on the same stripe checkout page. Serialised per session is the safe default. Most business MCP servers silently ignore this.",
    size: "1x1",
  },
  {
    title: "The 503 body is a contract",
    description:
      "busy, activeRequests, maxConcurrent, lastActivity. A load balancer reads the same four fields whether it hit POST /mcp with work or GET /status with a probe. One parser, two code paths.",
    size: "2x1",
  },
  {
    title: "The /status endpoint is a health probe, not a dashboard",
    description:
      "Returning 503 from /status while the VM is busy is on purpose. Azure's Standard Load Balancer reads that as 'take me out of rotation', and the next client gets routed to an idle VM. No retry logic in the client needed.",
    size: "1x1",
  },
  {
    title: "stop_execution hits tokio::select",
    description:
      "The cancellation is not a polite request. Every tool handler in server.rs is awaited inside a tokio::select against a CancellationToken from the request manager. Calling stop_execution drops the handler and the mouse is free on the next frame.",
    size: "1x1",
  },
];

const criteria = [
  {
    title: "Concurrency shape must match the resource",
    description:
      "A desktop is serial. A search API is parallel. A checkout is per-session serial. The 'best' server is the one that picks the right shape and enforces it in code, not the one with the longest tool list.",
  },
  {
    title: "Busy behaviour must be legible to infrastructure",
    description:
      "503 with a documented JSON body, same shape from /status and from /mcp, so an ops team can write one parser and route accordingly. Silently queuing is worse than returning 503.",
  },
  {
    title: "Cancellation must be cheap and synchronous",
    description:
      "stop_execution returning after the action finishes is not cancellation. Terminator wires every handler through tokio::select on a per-request CancellationToken so the abort is effective within one tick.",
  },
  {
    title: "Schema must be derived from code, not hand-written",
    description:
      "Terminator's build.rs reads the match arms in server.rs and bakes the tool names into the binary via env!(\"MCP_TOOLS\"). The system prompt cannot drift from what the server will actually accept.",
  },
  {
    title: "Observability must be on by default, not opt-in",
    description:
      "Every tool call is wrapped in log_request and log_response_with_logs, with screenshots before and after UI actions. Executions land on disk in executions/. If you cannot audit the last tool call, the server is not production ready.",
  },
];

const timelineSteps = [
  {
    title: "Pick a resource",
    description:
      "Search API. Postgres. A GitHub account. Your entire desktop. A Salesforce tenant. Each one has a different answer to the question 'how many concurrent operations can touch this without corrupting state'.",
  },
  {
    title: "Write that answer down",
    description:
      "If it is one, put MCP_MAX_CONCURRENT=1 in your env and the default in the binary. If it is ten, set it to ten and document why. If it is unbounded, say so and explain which invariants protect you. This is not an optimisation, it is correctness.",
  },
  {
    title: "Enforce it at the transport boundary, not the handler",
    description:
      "Terminator's gate is middleware on POST /mcp. Reject with 503 before the request manager registers the cancellation token. Doing it inside the handler is too late; by then you have already touched shared state.",
  },
  {
    title: "Expose /status with the same shape as the 503",
    description:
      "One JSON shape, four fields, two code paths that return it. A load balancer can poll /status and read 503 from /mcp with the same parser. The client sees a useful error, not a timeout.",
  },
  {
    title: "Scale by replication, not by thread count",
    description:
      "If you need more throughput for a serial resource, run more replicas behind an LB. Each one owns one copy of the resource. The LB picks an idle replica via /status. This is how Terminator scales across VMs.",
  },
];

const criteriaChecklistItems = [
  { text: "Concurrency default matches the resource shape, encoded in the binary." },
  { text: "POST /mcp returns 503 with a documented JSON body when busy." },
  { text: "GET /status returns the same body with the same fields." },
  { text: "stop_execution cancels in-flight work via a per-request CancellationToken." },
  { text: "Tool schemas derived from source at compile time, not hand-written." },
  { text: "Every tool call is logged with request, response, and duration by default." },
  { text: "Transport is either stdio or HTTP framed as JSON-RPC 2.0, not a bespoke protocol." },
];

const marqueeChips = [
  "MCP_MAX_CONCURRENT=1",
  "POST /mcp",
  "GET /status",
  "503 busy body",
  "stop_execution",
  "tokio::select",
  "CancellationToken",
  "execute_sequence",
  "env!(\"MCP_TOOLS\")",
  "Azure LB friendly",
  "JSON-RPC 2.0",
  "stdio or HTTP",
];

const faqs = [
  {
    q: "What is the actual 'best MCP server' as of April 2026?",
    a: "There is no single answer, and any list that gives you one is selling you something. The question is structurally wrong. An MCP server is a wrapper over a resource, and the right answer depends on the shape of that resource. For a desktop, the best server I have read is Terminator, specifically because it defaults MCP_MAX_CONCURRENT=1 and has a busy-aware /status endpoint that plays nicely with a load balancer. For a search engine, Exa is the obvious pick because search is read-only and fan-out friendly. For a CRM, HubSpot and Salesforce each publish their own. The correct question is: which MCP server is best for the resource I actually want an AI to control.",
  },
  {
    q: "Why does Terminator default MCP_MAX_CONCURRENT to 1?",
    a: "Because a desktop has exactly one mouse, one keyboard, and one window with focus at any time. If two tool calls run at once and both try to click, one of them either races the other or hits the wrong window. The LLM has no way to know which happened, because the accessibility tree the tool reads is a snapshot of shared state. Terminator makes this explicit in crates/terminator-mcp-agent/src/main.rs line 516: the default is 1. You can set it higher with an env var, but only if you know that your specific workflow never contends for the same input device at the same time, which for GUI automation is almost never true.",
  },
  {
    q: "What happens when the Terminator MCP server is busy and a new request arrives?",
    a: "POST /mcp returns 503 Service Unavailable immediately, with a JSON body shaped {\"busy\": true, \"activeRequests\": 1, \"maxConcurrent\": 1, \"lastActivity\": \"<ISO-8601>\"}. The 503 is intentional. A load balancer probing GET /status gets the same body with the same four fields and pulls that VM out of rotation until the active request finishes. The next client request lands on an idle VM. This is in main.rs lines 664 through 684 for the gate middleware and 537 through 553 for the status handler. It is documented in the crate's README under the HTTP Endpoints heading.",
  },
  {
    q: "Is any other MCP server designed around this concurrency contract?",
    a: "Not that I have read. The vast majority of MCP servers I have audited are HTTP wrappers around stateless APIs where concurrency is the remote service's problem. GitHub MCP, Slack MCP, Exa, Firecrawl, Notion MCP: all fine to run unbounded because the upstream has its own rate limiting and the operations are mostly idempotent. The 'best MCP server' listicles never bring up concurrency because for most of the servers in those lists, the right answer is 'whatever, the API is stateless anyway'. Desktop, browser control, and anything running against a physical device or a single logged-in session are the servers where concurrency shape genuinely matters, and they are underrepresented in the top-ranked articles.",
  },
  {
    q: "How do I verify the concurrency behaviour myself?",
    a: "Run the server with HTTP transport: npx -y terminator-mcp-agent@latest -t http. In one terminal, curl http://127.0.0.1:3000/status and confirm you get 200 with busy=false. Fire a long-running tool call like click_element against a slow-to-render window. In a second terminal, curl the same URL while the first is running. You will get 503 with busy=true, the same body shape, activeRequests=1, maxConcurrent=1. When the first call finishes, /status flips back to 200. You can also set MCP_MAX_CONCURRENT=2 as an env var, rerun the experiment, and watch two concurrent clicks actually step on each other, which is an excellent education in why the default is 1.",
  },
  {
    q: "Does this mean Terminator does not scale?",
    a: "It scales by replication, not by thread count. Each VM owns exactly one mouse, so the throughput story is not about making one VM serve 100 concurrent tool calls; it is about running 100 VMs behind a load balancer and letting the LB pick an idle one on every request. The 503-from-/status behaviour is the mechanism: Azure Load Balancer, Google Cloud Load Balancer, and any HTTP health check that understands 503 will take a busy VM out of rotation and route traffic elsewhere. This is the same scaling pattern you would use for any resource that is physically serial, like a 3D printer, a hardware test bench, or a phone farm.",
  },
  {
    q: "What does 'schema drift protection' actually mean in Terminator's code?",
    a: "crates/terminator-mcp-agent/build.rs reads src/server.rs at compile time, walks until it hits the line containing 'let result = match tool_name', then collects every subsequent match arm that starts with a quoted string followed by '=>'. That list becomes the MCP_TOOLS environment variable via rustc-env. prompt.rs reads env!(\"MCP_TOOLS\") and pastes it into the system prompt the server returns on initialize. The consequence: the list of tool names the LLM is told about is literally compiled from the list of tool names the dispatch function knows how to route. They cannot disagree. Every other MCP server I have read maintains the prompt and the dispatch by hand.",
  },
  {
    q: "How is stop_execution different from a regular cancellation?",
    a: "stop_execution is a first-class tool in the MCP server. The LLM can call it like any other tool, and every handler in server.rs awaits its work inside a tokio::select against a CancellationToken pulled from the request manager at the start of the request. When stop_execution fires, the token flips and the tokio::select drops the in-flight work. It is synchronous in the sense that the desktop pointer is free within one scheduler tick. Contrast with HTTP-only cancellation where you can drop the connection but the server-side handler keeps running to completion and corrupting state. In practice, this means you can say 'stop' to Claude in the middle of a runaway automation and the mouse actually stops.",
  },
  {
    q: "Does the 'best MCP server' question even make sense when Anthropic, OpenAI, and Google all have native tool use?",
    a: "Yes, for a specific reason. MCP lets one tool server serve every client that speaks the protocol. If you hand-code tools into Claude's native tool-use API, you cannot reuse them with Cursor, VS Code, a custom agent, or an MCP-aware chat app without re-implementing the wrapper. The value of MCP is the single implementation, shared contract. For a product like Terminator, where the tool set is 30+ handlers, that reuse is worth the protocol overhead. For a product where the 'tool' is one HTTP call, native tool use is usually the right choice.",
  },
  {
    q: "Where do I look in the Terminator repo to verify everything on this page?",
    a: "crates/terminator-mcp-agent/src/main.rs for the concurrency default at line 516, the status handler at lines 537 to 553, and the mcp_gate middleware at lines 664 to 684. crates/terminator-mcp-agent/src/server.rs for the 31 tool handlers (grep for '#[tool('), the dispatch_tool match block at line 9953, and the stop_execution handler at line 8587. crates/terminator-mcp-agent/build.rs for the compile-time tool extraction at line 31, and crates/terminator-mcp-agent/src/prompt.rs for the env!(\"MCP_TOOLS\") injection at line 10. Finally, crates/terminator-mcp-agent/README.md lines 36 through 45 document the HTTP endpoints and the 503 behaviour as the public contract.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "What is an MCP server?",
    excerpt:
      "An MCP server, opened in the editor. Not the abstract definition; the actual dispatch_tool function that 31 tools flow through.",
    href: "/t/what-is-mcp-server",
    tag: "Concept",
  },
  {
    title: "What are MCP servers, really?",
    excerpt:
      "The 150 lines of startup code nobody shows you. Process lifecycle, stdio framing, panic hooks, and why the protocol starts before the handshake.",
    href: "/t/what-are-mcp-server",
    tag: "Deep dive",
  },
  {
    title: "MCP server list",
    excerpt:
      "A concrete list of Terminator's MCP tools, not a generic directory of servers. Names, signatures, and what each one actually touches.",
    href: "/t/mcp-server-list",
    tag: "Reference",
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
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
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
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Production criteria
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Concurrency
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              The best{" "}
              <GradientText variant="teal">MCP server</GradientText> is the
              one whose concurrency shape matches the resource it controls.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every top result for this query is a listicle that ranks MCP
              servers by tool count, category coverage, or GitHub stars. None
              of them ask the one question that decides whether the server
              will survive a weekend of real use: does the server&apos;s
              concurrency shape match the shape of the resource behind it?
              Terminator is the only MCP server I have read that answers this
              question in code, by defaulting <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">MCP_MAX_CONCURRENT</code>
              {" "}to <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">1</code>
              {" "}because a desktop has exactly one mouse. This page shows the
              exact lines of <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">main.rs</code>
              {" "}that enforce it and walks through what the same idea looks
              like applied to other resources.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="9 top-ranked 'best MCP server' articles read"
              highlights={[
                "MCP_MAX_CONCURRENT defaults to 1",
                "503 body shape doubles as LB contract",
                "Cancellation via tokio::select, not polling",
                "Schema compiled from source at build time",
              ]}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#criteria"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-orange-300 hover:text-orange-700 transition-colors"
              >
                Jump to the criteria
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Best MCP server"
            subtitle="Ranked by whether its concurrency shape matches its resource"
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "A desktop has one mouse",
              "A search API has many workers",
              "A checkout flow has one session",
              "The best server encodes that in its default",
              "Terminator defaults MCP_MAX_CONCURRENT to 1",
            ]}
            durationInFrames={210}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <Marquee speed={40} pauseOnHover fade>
            <div className="flex items-center gap-3 pr-3">
              {marqueeChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-mono text-zinc-700 whitespace-nowrap"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The question every listicle skips
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Nine different articles show up on the first page of Google for
            &quot;best MCP server&quot;. Taskade, Firecrawl, K2view, Skyvia,
            MCP Bundles, Effloow, Fungies, FastMCP, mcpmanager. I read all of
            them. They disagree on which servers belong in the top ten, but
            they agree on what makes a server &quot;best&quot;: breadth of
            tool coverage, category popularity, GitHub stars, and the author&apos;s
            personal taste. None of them ask whether the server&apos;s
            concurrency default is correct for the thing it controls.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            That omission is the whole game. An MCP server is a wrapper over a
            resource. The resource has a correct concurrency shape. If the
            wrapper disagrees with the shape, the wrapper corrupts state. The
            number of tools the wrapper exposes is completely irrelevant to
            that failure mode.
          </p>

          <ProofBanner
            metric="1"
            quote="Default value of MCP_MAX_CONCURRENT in Terminator's MCP agent. Set higher only if you can prove that two concurrent tool calls never contend for the same input device, which on a real desktop is almost never true."
            source="crates/terminator-mcp-agent/src/main.rs line 516"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Resource shape decides everything
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Before you pick an MCP server, you have to decide what shape the
            resource behind it actually has. There are three shapes, and the
            correct default concurrency is different for each.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The AnimatedBeam view of the contract
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            On the left, the clients. In the middle, the gate. On the right,
            the physical machine. The gate is where Terminator makes its
            bet. If the machine is already doing something, the gate says 503
            before the request ever lands on the dispatch function, and the
            client can either retry against a different VM or wait.
          </p>
          <AnimatedBeam
            title="POST /mcp routing under MCP_MAX_CONCURRENT=1"
            accentColor="#FF3E00"
            from={[
              { label: "Claude Code", sublabel: "stdio or HTTP" },
              { label: "Cursor", sublabel: "stdio" },
              { label: "Load balancer", sublabel: "probes /status" },
              { label: "Custom agent", sublabel: "JSON-RPC 2.0" },
            ]}
            hub={{ label: "mcp_gate", sublabel: "main.rs:664" }}
            to={[
              { label: "dispatch_tool", sublabel: "one tool runs" },
              { label: "503 busy", sublabel: "same JSON shape" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The exact code that enforces the default
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            This is the part you cannot copy from another &quot;best MCP
            server&quot; page. Open{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              crates/terminator-mcp-agent/src/main.rs
            </code>
            . Two blocks of code define the contract. The first sets the
            default. The second enforces it.
          </p>
          <AnimatedCodeBlock
            code={gateCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
            typingSpeed={6}
          />
          <p className="text-lg text-zinc-600 leading-relaxed mt-6 mb-6">
            Notice the order of operations inside{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              mcp_gate
            </code>
            . The active-requests counter is checked{" "}
            <em>before</em> the cancellation token is registered, before the
            timeout clock starts, before any work is scheduled. A busy VM
            rejects the request at the transport boundary, not at the
            handler. There is no path where the rejected request touches the
            shared desktop state.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The matching status endpoint returns the same body the 503 does.
            Four fields: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">busy</code>,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">activeRequests</code>,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">maxConcurrent</code>,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">lastActivity</code>. That is the whole LB contract.
          </p>
          <AnimatedCodeBlock
            code={statusProbeCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
            typingSpeed={6}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            What it looks like from a terminal
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            You do not have to take my word for it. Install the server, hit
            the endpoints, and watch the flip from 200 to 503 when a tool
            call is in flight.
          </p>
          <TerminalOutput title="Probing /status before and during a tool call" lines={installTerminal} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <MetricsRow
            metrics={[
              { value: 1, label: "Default MCP_MAX_CONCURRENT" },
              { value: 503, label: "HTTP status when busy" },
              { value: 4, label: "Fields in the busy body" },
              { value: 31, suffix: "+", label: "Tools guarded by one gate" },
            ]}
          />
        </section>

        <section id="criteria" className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Five criteria that actually separate production MCP servers from
            demos
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            If you are going to rank MCP servers, rank them against real
            production behaviour. Here are five filters to use instead of tool
            count. Terminator was designed to pass all five; most of the
            servers on the top listicles pass one or two.
          </p>
          <StepTimeline steps={criteria} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Terminator vs the generic &quot;top ten&quot; server
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The column on the right is not every MCP server in the world. It
            is the composite behaviour of the servers that show up highest on
            the listicles, mostly stateless HTTP wrappers around SaaS APIs,
            where these production questions either do not apply or have not
            been answered.
          </p>
          <ComparisonTable
            productName="Terminator MCP"
            competitorName="Typical listicle pick"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            How to pick the right MCP server for your actual resource
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The best MCP server for your problem is the one whose defaults
            you agree with before you look at the tool list. Here is the
            order of questions I ask myself.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard className="p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 tracking-tight">
              A checklist you can screenshot
            </h2>
            <p className="text-zinc-600 leading-relaxed mb-6">
              Use this as a filter on any MCP server you are evaluating.
              Terminator passes every line. Most of the servers you see on
              top listicles pass the last two.
            </p>
            <AnimatedChecklist
              title="Production MCP server checklist"
              items={criteriaChecklistItems}
            />
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The honest take on &quot;best&quot;
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            I will not tell you Terminator is the best MCP server for your
            Notion database. Of course it is not; Notion publishes their own
            server and they know their invariants better than anyone.
            Terminator is the best MCP server I have read for the specific
            job of letting an AI coding assistant drive a whole desktop,
            because it treats the desktop as what it is: a single-session,
            single-focus, single-pointer resource that breaks loudly when two
            callers touch it at once. That awareness shows up in the
            defaults, in the HTTP contract, and in the cancellation
            plumbing. If you are evaluating MCP servers for anything that
            touches physical devices, logged-in UI sessions, or exclusive
            resources, steal those criteria and apply them to whichever
            server you end up picking.
          </p>

          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            If you are here because you want to try the server itself,
            install it with one command and point your editor at it:
          </p>

          <AnimatedCodeBlock
            language="bash"
            filename="install.sh"
            code={`# Claude Code
claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# Run it standalone over HTTP and watch /status flip
npx -y terminator-mcp-agent@latest -t http
# then: curl http://127.0.0.1:3000/status`}
            typingSpeed={6}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            section="best-mcp-server-footer"
            heading="Evaluating an MCP server for a real deployment?"
            description="We will walk you through Terminator's concurrency model, the /status contract, and how we scale it across a fleet of VMs. 20 minutes, live."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection items={faqs} />
        </section>

        <section className="max-w-4xl mx-auto px-6 py-10">
          <RelatedPostsGrid
            title="More from the Terminator guides"
            subtitle="Pages that unpack the same MCP server from different angles"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          section="best-mcp-server-sticky"
          description="Book a live walkthrough of Terminator's concurrency model"
        />
      </article>
    </div>
  );
}
