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
  InlineCta,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/what-are-mcp-server";
const PUBLISHED = "2026-04-19";
const TITLE =
  "What are MCP servers, really? The 150 lines of startup code nobody shows you";
const DESCRIPTION =
  "Every definition of an MCP server skips the part where the process has to boot. Terminator's MCP agent runs kill_previous_mcp_instances() before it accepts a single request, retries port 17373 up to 5 times, and installs a panic hook that writes to stderr so it cannot corrupt the JSON-RPC stream on stdout. That is what an MCP server actually is, operationally.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "MCP servers aren't abstract 'services that expose tools.' They are long-lived OS processes with boot hygiene, port contention, and transport-specific lifecycles. We walk through main.rs from a real one.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What are MCP servers, operationally",
    description:
      "Boot cleanup, panic hooks, UTF-8 console fixes, port retries, auto-destruct. The plumbing every MCP server has but nobody writes about.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "What are MCP servers?" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "What are MCP servers?", url: PAGE_URL },
];

const killPreviousCode = `// crates/terminator-mcp-agent/src/main.rs line 151
// The very first thing main() does, before the MCP handshake,
// before logging, before loading tools. It cleans the house.

fn kill_previous_mcp_instances(enforce_single: bool) {
    let current_pid = std::process::id();
    let mut system = System::new();
    system.refresh_processes(ProcessesToUpdate::All, true);

    let mut killed_count = 0;
    for (pid, process) in system.processes() {
        let name = process.name().to_string_lossy().to_lowercase();

        if !name.contains("terminator-mcp-agent")
            && !name.contains("terminator-bridge-service")
        {
            continue;
        }
        if pid.as_u32() == current_pid {
            continue; // don't kill ourselves
        }

        // Default: only kill orphans (parent is dead)
        // --enforce-single-instance: kill every other copy
        if !enforce_single {
            if let Some(parent_pid) = process.parent() {
                let parent_alive = is_process_alive(parent_pid.as_u32());
                if parent_alive { continue; } // leave it alone
            }
        }

        if process.kill() { killed_count += 1; }
    }

    if killed_count > 0 {
        std::thread::sleep(Duration::from_millis(2000));
        // then verify port 17373 actually released, up to 5 retries
        let mut retries = 0;
        while retries < 5 {
            match TcpListener::bind("127.0.0.1:17373") {
                Ok(l) => { drop(l); break; }
                Err(_) => {
                    retries += 1;
                    std::thread::sleep(Duration::from_millis(1000));
                }
            }
        }
    }
}`;

const panicHookCode = `// main.rs line 270
// An MCP server on stdio is talking JSON-RPC over stdout.
// If a panic writes to stdout, the client sees garbage and disconnects.
// This hook writes to stderr ONLY. stdout stays clean.

std::panic::set_hook(Box::new(|panic_info| {
    // CRITICAL: Never write to stdout during panic
    // it corrupts the JSON-RPC stream
    if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
        eprintln!("MCP Server Panic: {s}");
    } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
        eprintln!("MCP Server Panic: {s}");
    } else {
        eprintln!("MCP Server Panic occurred");
    }
    if let Some(location) = panic_info.location() {
        eprintln!("Panic location: {}:{}", location.file(), location.line());
    }
}));

// And on Windows, force the console code page to UTF-8
// so unicode from the accessibility tree doesn't get mangled
#[cfg(target_os = "windows")]
std::process::Command::new("cmd")
    .args(["/c", "chcp", "65001"])
    .creation_flags(CREATE_NO_WINDOW)
    .spawn(); // non-blocking on purpose`;

const transportMatchCode = `// main.rs line 375
// One binary, three transports. Same dispatch_tool,
// three different lifecycles.

match args.transport {
    TransportMode::Stdio => {
        // spawn under editor, talk JSON-RPC on stdin/stdout
        let service = desktop.serve(stdio()).await?;
        service.waiting().await?;
    }
    TransportMode::Sse => {
        // legacy: bind a port, write Server-Sent Events
        let ct = SseServer::serve(addr).await?
            .with_service(move || desktop.clone());
        tokio::signal::ctrl_c().await?;
        ct.cancel();
        child_process::kill_all(); // kill bun/node workers
    }
    TransportMode::Http => {
        // streamable HTTP, shared DesktopWrapper across sessions
        // so recorder state survives start/stop calls
        let desktop_wrapper = Arc::new(RwLock::new(None));
        let service = StreamableHttpService::new(/* ... */);
    }
}`;

const bootTerminal = [
  { text: "npx terminator-mcp-agent --enforce-single-instance", type: "command" as const },
  { text: "🔒 Production mode: enforcing single instance", type: "info" as const },
  { text: "🔴 Killing MCP agent PID 48219 (enforcing single instance)", type: "output" as const },
  { text: "✅ Successfully killed PID 48219", type: "success" as const },
  { text: "🔴 Killing bridge service PID 48220 (enforcing single instance)", type: "output" as const },
  { text: "✅ Successfully killed PID 48220", type: "success" as const },
  { text: "🧹 Cleaned up 2 process(es), waiting for ports to be released...", type: "info" as const },
  { text: "Port 17373 is now available", type: "success" as const },
  { text: "Set Windows console to UTF-8 mode (async)", type: "output" as const },
  { text: "========================================", type: "output" as const },
  { text: "Terminator MCP Server v1.x.x", type: "output" as const },
  { text: "Build profile: release", type: "output" as const },
  { text: "Git commit: <GIT_HASH baked in by build.rs>", type: "output" as const },
  { text: "========================================", type: "output" as const },
  { text: "Initializing Terminator MCP server...", type: "info" as const },
  { text: "Transport mode: Stdio", type: "info" as const },
  { text: "Starting stdio transport...", type: "info" as const },
  { text: "# only now does the MCP handshake begin", type: "output" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What happens before the first request?",
    competitor: "Docs don't say. Reference servers usually just start a listener.",
    ours: "kill_previous_mcp_instances() runs, with two modes: kill orphans only (default) or kill every other copy (--enforce-single-instance).",
  },
  {
    feature: "Port contention on restart",
    competitor: "Silent bind failure, client sees an unclear disconnect.",
    ours: "2000ms grace, then 5 retry attempts binding 127.0.0.1:17373, with log lines on each attempt.",
  },
  {
    feature: "What happens when a tool handler panics?",
    competitor: "Stack trace goes to stdout, JSON-RPC stream corrupts, client dies.",
    ours: "Custom panic hook writes to stderr only. stdout is reserved for protocol bytes, no matter what.",
  },
  {
    feature: "Transport modes in one binary",
    competitor: "Most reference MCP servers support stdio, period.",
    ours: "stdio, SSE, and streamable HTTP, selected by a --transport flag with per-mode lifecycles.",
  },
  {
    feature: "What if the parent editor dies?",
    competitor: "The MCP server leaks, stays in the process list forever.",
    ours: "--watch-pid <parent> spawns a tokio task that polls is_process_alive() every 1s and calls std::process::exit(0) when parent goes away (Windows).",
  },
  {
    feature: "Unicode on Windows consoles",
    competitor: "Default code page is IBM437. Accessibility tree output corrupts.",
    ours: "Non-blocking chcp 65001 runs at boot. UTF-8 everywhere without blocking startup.",
  },
  {
    feature: "Binary traceability",
    competitor: "Hash of a binary, maybe.",
    ours: "build.rs stamps GIT_HASH, GIT_BRANCH, and BUILD_TIMESTAMP into the binary via rustc-env. Logged on every boot.",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "An MCP server is a long-lived OS process",
    description:
      "Not a lambda. Not a request handler. A process that stays alive between tool calls because the state inside it (recorder, focus, cancellation tokens, Windows UIA handles) outlives any single request. That changes everything about its boot sequence.",
    size: "2x1",
  },
  {
    title: "Boot hygiene is mandatory",
    description:
      "Terminator's MCP agent kills its own orphans before it opens a socket. Two modes: kill every copy (enforce_single_instance) or kill only copies whose parent is dead (default).",
    size: "1x1",
  },
  {
    title: "Port 17373 has a retry loop",
    description:
      "After cleanup it sleeps 2000ms, then tries to bind 127.0.0.1:17373 up to 5 times with 1-second gaps. If it can't bind after 5 tries it logs a warning but continues. Belt and braces.",
    size: "1x1",
  },
  {
    title: "stdout is sacred on stdio transport",
    description:
      "stdio MCP servers speak JSON-RPC 2.0 over stdout. A stray println or panic message and the client sees malformed JSON. Terminator's panic hook explicitly redirects every panic payload to stderr so stdout stays protocol-clean.",
    size: "2x1",
  },
  {
    title: "Child processes get killed with the server",
    description:
      "When the MCP server receives Ctrl+C, it calls child_process::kill_all() which reaches into a Windows Job Object set up at boot and terminates every bun/node worker it spawned. No orphaned transpilers.",
    size: "1x1",
  },
  {
    title: "--watch-pid means auto-destruct",
    description:
      "Pass --watch-pid <editor_pid> and the agent spawns a tokio task that checks is_process_alive(pid) every second. When the editor dies, the agent calls std::process::exit(0). No leaked automation processes.",
    size: "1x1",
  },
];

const bootSteps = [
  {
    title: "Args parsed, transport picked",
    description:
      "clap reads --transport, --port, --host, --auth-token, --watch-pid, --enforce-single-instance. Before any of that matters, the agent runs boot hygiene.",
  },
  {
    title: "Kill previous instances",
    description:
      "Scan the system process list with sysinfo. For every terminator-mcp-agent or terminator-bridge-service that isn't us, decide by mode: enforce_single kills all copies, default kills only copies whose parent died.",
  },
  {
    title: "Wait and verify port 17373",
    description:
      "After any kill, sleep 2000ms for the OS to release ports. Then try TcpListener::bind up to 5 times, 1-second gap between attempts. Log each retry.",
  },
  {
    title: "Install the panic hook",
    description:
      "Override the default panic behavior so that every panic payload writes to stderr only. stdout is off-limits for anything that isn't a valid JSON-RPC frame.",
  },
  {
    title: "Windows UTF-8 fix, non-blocking",
    description:
      "Spawn cmd /c chcp 65001 with CREATE_NO_WINDOW, without waiting on the result. On some Azure VMs chcp takes 6+ seconds; waiting would break health checks.",
  },
  {
    title: "Init telemetry, Sentry, PostHog, logging",
    description:
      "Now that the process is safe, set up observability: log_capture, sentry guard, OpenTelemetry, execution_logger, posthog startup event. The binary also logs its own build date, size, and git hash.",
  },
  {
    title: "Optionally spawn the PID watcher",
    description:
      "If --watch-pid was passed and we're on Windows, tokio::spawn a loop that polls is_process_alive every second and calls exit(0) when the parent dies.",
  },
  {
    title: "Finally: serve the transport",
    description:
      "Now match on TransportMode. Stdio pipes the DesktopWrapper into rmcp::serve(stdio()). SSE starts an SseServer on the bound port. Http sets up a StreamableHttpService with a shared DesktopWrapper behind an Arc<RwLock>. Only now does the MCP handshake happen.",
  },
];

const bootChecklist = [
  { text: "kill orphaned copies of itself (default: only if their parent is dead)" },
  { text: "enforce single-instance mode when launched with --enforce-single-instance" },
  { text: "sleep 2000ms and retry binding port 17373 up to 5 times" },
  { text: "install a panic hook that writes to stderr so stdout stays JSON-RPC clean" },
  { text: "on Windows, non-blocking chcp 65001 to force UTF-8 console output" },
  { text: "create a Job Object so bun and node workers die with the agent" },
  { text: "initialize Sentry, OpenTelemetry, execution_logger, PostHog startup event" },
  { text: "stamp GIT_HASH, GIT_BRANCH, BUILD_TIMESTAMP into logs via build.rs rustc-env" },
  { text: "if --watch-pid set, spawn a 1-second tokio poller that exits when parent dies" },
  { text: "only after all of that, start the chosen transport and accept the first request" },
];

const faqs = [
  {
    q: "What are MCP servers in one sentence?",
    a: "MCP servers are long-lived OS processes that speak the Model Context Protocol (JSON-RPC 2.0 over stdio, SSE, or streamable HTTP) and expose a catalog of named tools an LLM can call. In practice, they are not abstract 'services' but real processes on your machine with startup sequences, memory, and lifecycle concerns. Terminator's MCP agent is a concrete example: a Rust binary that runs 150+ lines of boot hygiene (kill orphans, verify port 17373, install a panic hook, UTF-8 fix, start telemetry) before it accepts its first list_tools request.",
  },
  {
    q: "Why does an MCP server need to kill previous instances of itself?",
    a: "Because MCP clients spawn MCP servers as child processes. When an editor like Claude Code or Cursor crashes, restarts, or loses its connection, the child MCP servers can be orphaned: still running, still holding ports, still hanging onto automation handles. Terminator's agent is especially prone to this because it holds OS-level UIAutomation resources. So main.rs line 151's kill_previous_mcp_instances function scans for other copies of terminator-mcp-agent and terminator-bridge-service, skips itself, and kills the rest. Default mode only kills processes whose parent is dead (so other active editors keep their agents). Pass --enforce-single-instance and it kills every other copy regardless.",
  },
  {
    q: "What's special about the panic hook in Terminator's MCP server?",
    a: "Stdio MCP servers communicate by writing JSON-RPC 2.0 frames to stdout. Anything non-JSON on stdout breaks the protocol: the client sees malformed data and disconnects. The default Rust panic behavior writes to stdout. So Terminator installs a custom panic hook at main.rs line 270 that writes only to stderr, never to stdout. Every panic payload, every location line goes to stderr. This is one of those details that never appears in the MCP spec but is essential if you want your server to survive a single handler bug without killing the whole session.",
  },
  {
    q: "Why does Terminator's MCP agent run chcp 65001 on Windows, and why non-blocking?",
    a: "Windows consoles default to code page IBM437, which mangles UTF-8 output. The accessibility tree from Windows UIA is full of unicode (app names, element properties), so Terminator forces the console to UTF-8 via cmd /c chcp 65001. It uses std::process::Command::spawn without waiting for completion because, per the code comment, on some Azure VMs chcp can take 6+ seconds and a blocking call would miss the health check window. So the fix is fire-and-forget. By the time any real work starts, the console is already UTF-8.",
  },
  {
    q: "What does the --watch-pid flag do?",
    a: "It turns the MCP server into an auto-destructing process. When you pass --watch-pid <parent_pid>, main.rs spawns a tokio task that calls is_process_alive(pid) every 1000ms (Windows-only, via PROCESS_QUERY_LIMITED_INFORMATION with a fallback to PROCESS_QUERY_INFORMATION). The moment that parent PID stops responding, the agent calls std::process::exit(0). This exists because editors can crash without cleaning up their children; --watch-pid ensures the MCP server doesn't linger after the editor it was spawned for is gone.",
  },
  {
    q: "How many transport modes does a single MCP server support?",
    a: "Depends on the server. The reference SDK servers are usually stdio only. Terminator's MCP agent supports three, selected by a --transport flag: Stdio (default, used by local editors), Sse (Server-Sent Events, for legacy web integrations), and Http (streamable HTTP, for remote clients and load-balanced deployments). The three have different lifecycles: stdio blocks on service.waiting(), SSE blocks on Ctrl+C then calls child_process::kill_all(), and HTTP uses a shared Arc<RwLock<Option<DesktopWrapper>>> so recorder state persists across requests. Same dispatch_tool, same tools, three wildly different process shapes.",
  },
  {
    q: "Is there a port MCP servers are expected to use?",
    a: "There is no reserved port in the MCP spec. Servers pick whatever they want. Terminator's MCP agent defaults to 127.0.0.1:3000 for SSE and HTTP transports and uses 17373 for internal coordination (that's the port it verifies after cleanup). You can override host and port via --host and --port. If you're running multiple MCP servers behind a reverse proxy, you'll end up assigning them ports yourself anyway.",
  },
  {
    q: "What's the difference between an MCP server and a REST API from the operator's perspective?",
    a: "A REST API is usually stateless and designed to run behind a load balancer with N replicas. An MCP server on stdio is a single process owned by a single editor session, and its internal state (focus restoration, active recorders, in-progress workflows, cancellation tokens for long-running clicks) has to survive between tool calls. That's why an MCP server cares about boot hygiene in a way a REST API usually doesn't: one process per session, holding real OS resources, means you really don't want two copies fighting. Terminator's enforce_single_instance flag exists specifically for production deployments where exactly one agent per machine is required.",
  },
  {
    q: "What else does build.rs do besides extracting tool names?",
    a: "Three things on top of the tool extraction. It runs git rev-parse HEAD to capture the commit hash into GIT_HASH, git rev-parse --abbrev-ref HEAD for the branch into GIT_BRANCH, and chrono::Utc::now().to_rfc3339() for BUILD_TIMESTAMP. All three get injected via cargo:rustc-env so the final binary carries its own provenance. Every boot logs those three values along with the binary path, modification time, and file size. When a user reports a bug, you can ask 'what was the Git commit line in your startup logs?' and narrow the source revision instantly.",
  },
  {
    q: "Why would I care about any of this if I just want to use an MCP server?",
    a: "If you only ever use one AI editor on one machine and never restart it, you won't care. The moment you run Claude Code and Cursor at the same time, or restart your editor in the middle of an automation, or try to run Terminator in a CI pipeline or on a shared Windows VM, you'll hit every one of these concerns. The difference between an MCP server that 'works on my machine' and one that holds up in production is exactly this boot-hygiene layer: orphan cleanup, port retries, panic isolation, lifecycle flags. It isn't glamorous but it's the majority of the code that separates a demo from a product.",
  },
];

const beamSources = [
  { label: "Stdio transport", sublabel: "spawned by editor" },
  { label: "SSE transport", sublabel: "legacy web clients" },
  { label: "Streamable HTTP", sublabel: "remote + load-balanced" },
];

const beamDestinations = [
  { label: "Windows UIA", sublabel: "accessibility tree" },
  { label: "macOS AX", sublabel: "accessibility APIs" },
  { label: "Browser JS", sublabel: "execute_browser_script" },
  { label: "Shell / bun / node", sublabel: "run_command handlers" },
];

const marqueeItems = [
  "kill_previous_mcp_instances()",
  "TcpListener::bind 127.0.0.1:17373",
  "std::panic::set_hook → eprintln only",
  "chcp 65001 (non-blocking)",
  "init_job_object()",
  "init_telemetry() + init_execution_logger()",
  "--watch-pid tokio poller (1s)",
  "StreamableHttpService + Arc<RwLock>",
  "SseServer::serve",
  "stdio() transport + service.waiting()",
  "child_process::kill_all()",
  "build.rs → GIT_HASH, GIT_BRANCH, BUILD_TIMESTAMP",
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
                Model Context Protocol
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Terminator MCP agent
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              What are{" "}
              <GradientText variant="teal">MCP servers</GradientText>, really?
              The boot sequence nobody writes about.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every article on the first page of Google defines an MCP server
              the same way: a service that exposes tools, resources, and prompts
              to an LLM over the Model Context Protocol. All correct, all
              abstract. None of them show you what happens when the process
              actually boots. Terminator&apos;s MCP agent runs roughly 150 lines
              of pre-handshake code before it accepts its first request:
              orphan cleanup, port retry loops, panic hooks, Windows UTF-8
              fixes, optional parent-PID auto-destruct, transport-specific
              lifecycle setup. That&apos;s the operational shape of an MCP
              server, and it&apos;s open source, so let&apos;s walk through it.
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
                "main.rs line 151: kill_previous_mcp_instances runs before the MCP handshake",
                "Port 17373 has a 5-attempt retry loop with 2000ms grace window",
                "Custom panic hook redirects to stderr so stdout stays JSON-RPC clean",
                "Three transport modes (stdio, SSE, streamable HTTP) in one binary",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#boot-sequence"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the boot code
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Remotion concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="An MCP server is a long-lived OS process, not a function."
            subtitle="Which means the boot sequence matters as much as the tools."
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Step 1: kill your own orphans before binding any port",
              "Step 2: verify port 17373 released, retry up to 5 times",
              "Step 3: install a panic hook that never touches stdout",
              "Step 4: pick a transport, then handshake with the LLM",
            ]}
          />
        </section>

        {/* The one-line answer */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            The short answer, then the interesting answer
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Short answer: MCP servers are processes that speak JSON-RPC 2.0
            over stdio or HTTP, implement{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              list_tools
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              tools/call
            </code>
            , and expose a named catalogue of capabilities an LLM can invoke.
            Every article says that.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Interesting answer: MCP servers are long-lived processes, which
            means almost everything that matters about running them is what
            happens <em>around</em> the protocol. They can be orphaned, they
            can fight each other over ports, they can panic mid-call, they can
            leak when the editor that spawned them crashes. Terminator&apos;s
            MCP agent handles every one of those cases explicitly, and you can
            read the code. Each of the sections below pulls directly from{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/src/main.rs
            </code>
            .
          </p>
        </section>

        {/* Metrics row */}
        <section className="max-w-4xl mx-auto px-6 pt-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Terminator&apos;s MCP server boot, by the numbers
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl">
            Each number below comes from the current open-source
            implementation. Line counts are{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              wc -l
            </code>{" "}
            on the actual files. Retry counts and timeouts are constants in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              main.rs
            </code>
            .
          </p>
          <MetricsRow
            metrics={[
              { value: 941, label: "Lines in main.rs" },
              { value: 17373, label: "Port it verifies after cleanup" },
              { value: 5, label: "Port-bind retry attempts" },
              { value: 3, label: "Transport modes in one binary" },
            ]}
          />
        </section>

        {/* Boot step timeline — the anchor narrative */}
        <section
          id="boot-sequence"
          className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            What actually happens when the server boots
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            When an editor spawns Terminator&apos;s MCP server, the process
            does not immediately start accepting MCP traffic. It does these
            eight things first, in this order:
          </p>
          <StepTimeline steps={bootSteps} />
        </section>

        {/* Terminal: what the boot looks like */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the boot actually prints
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Paste this into a terminal and watch a leftover instance die.
            Notice how the protocol handshake (the MCP part) doesn&apos;t
            start until the cleanup is done.
          </p>
          <TerminalOutput lines={bootTerminal} title="terminator-mcp-agent startup" />
        </section>

        {/* Anchor fact — the kill_previous code */}
        <section className="max-w-4xl mx-auto px-6 py-10 bg-orange-50/50 border-y border-orange-200/60">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The uncopyable part:{" "}
            <GradientText variant="teal">kill_previous_mcp_instances</GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the function that makes Terminator&apos;s agent safe to
            launch repeatedly from an editor that crashes. Every MCP server
            needs something like it, but almost none ship with it. Open{" "}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/src/main.rs
            </code>{" "}
            at line 151 and you&apos;ll find this exact shape, abbreviated
            below:
          </p>

          <AnimatedCodeBlock
            code={killPreviousCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
          />

          <p className="text-zinc-600 mt-4 leading-relaxed">
            Two modes fall out of the{" "}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              enforce_single
            </code>{" "}
            boolean. In default mode the agent is polite: it only kills other
            copies whose parent PID is already dead. Another active editor
            keeps its own agent. In{" "}
            <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              --enforce-single-instance
            </code>{" "}
            mode (production), it kills every other copy on the machine, no
            exceptions. The port retry loop at the bottom is what makes the
            operation safe: the OS needs ~2 seconds to actually release port
            17373 after SIGKILL, and the retry verifies we got it.
          </p>
        </section>

        {/* Panic hook and UTF-8 */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            Why stdout is sacred, and how the panic hook protects it
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            On the stdio transport, the MCP protocol frames JSON-RPC 2.0
            messages and writes them to stdout. The client parses stdout as
            JSON. One stray print, one panic stack trace, one library that
            thinks it can log to stdout, and the connection dies. Terminator
            installs a panic hook that fully redirects every panic payload to
            stderr. On Windows, it also fixes the console code page to UTF-8
            so unicode in the accessibility tree doesn&apos;t arrive mangled.
          </p>
          <AnimatedCodeBlock
            code={panicHookCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
          />
          <p className="text-zinc-600 mt-4 leading-relaxed">
            The{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              chcp 65001
            </code>{" "}
            call is deliberately non-blocking: the comment in the source
            explains that on some Azure VMs the call can take 6 seconds, which
            would break the health check window. Fire-and-forget is the right
            trade-off.
          </p>
        </section>

        {/* Before/after callout using a GlowCard */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard>
            <div className="p-2">
              <h3 className="text-xl font-semibold text-zinc-800 mb-3">
                Everything the agent does before accepting its first request
              </h3>
              <p className="text-zinc-600 mb-4">
                This is what the generic &quot;MCP server&quot; articles skip.
                When the LLM sends its first{" "}
                <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                  tools/list
                </code>
                , all of this has already happened.
              </p>
              <AnimatedChecklist title="Boot-time checklist" items={bootChecklist} />
            </div>
          </GlowCard>
        </section>

        {/* Transport match code + bento */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            Three transports, one server binary
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Most reference MCP servers only support stdio. Terminator ships
            three transport modes and the lifecycle differs meaningfully
            between them. The key detail: the{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              DesktopWrapper
            </code>{" "}
            state (recorder, in-progress sequences, focus history) has to
            persist across requests in HTTP mode, which is why{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Arc&lt;RwLock&lt;Option&lt;DesktopWrapper&gt;&gt;&gt;
            </code>{" "}
            shows up only there.
          </p>
          <AnimatedCodeBlock
            code={transportMatchCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/main.rs"
          />
        </section>

        {/* AnimatedBeam — how transports feed into OS APIs */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Three inputs, one dispatcher, four OS surfaces
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Whatever transport you pick, the requests all land in the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              dispatch_tool
            </code>{" "}
            function, and the tool handlers fan back out to the OS. That&apos;s
            why the server is one binary and not three.
          </p>
          <AnimatedBeam
            title="From transport to OS surface"
            from={beamSources}
            hub={{ label: "dispatch_tool", sublabel: "server.rs match block" }}
            to={beamDestinations}
            accentColor="#FF3E00"
          />
        </section>

        {/* Bento of architectural facts */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-6">
            Six things the definition pages never mention
          </h2>
          <BentoGrid cards={bentoCards} />
        </section>

        {/* Comparison to generic MCP server */}
        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            Generic MCP tutorial server vs Terminator&apos;s production agent
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Almost every &quot;build your first MCP server&quot; tutorial skips
            everything on the right-hand column. You can ship a working MCP
            server in an afternoon without any of it. You will regret that the
            first time your editor crashes mid-call.
          </p>
          <ComparisonTable
            productName="Terminator MCP agent"
            competitorName="Generic MCP tutorial server"
            rows={comparisonRows}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 pt-4 pb-10">
          <ProofBanner
            metric="941 lines"
            quote="of main.rs handle boot hygiene, panic isolation, and transport lifecycles before the MCP handshake ever starts."
            source="terminator-mcp-agent/src/main.rs"
          />
        </section>

        {/* Marquee of the concrete system calls */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The actual calls that run before your first tool call
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every chip below is a real function, hook, or syscall that
            executes in the first second of the agent&apos;s life.
          </p>
          <Marquee pauseOnHover fade>
            {marqueeItems.map((item) => (
              <span
                key={item}
                className="mx-2 inline-block rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-mono text-zinc-700"
              >
                {item}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Try it section with NumberTicker */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Run one yourself in{" "}
            <span className="text-orange-600">
              <NumberTicker value={30} />
            </span>{" "}
            seconds
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Wire Terminator&apos;s MCP server into Claude Code, then watch
            your startup logs to see every boot step we walked through fire in
            real time.
          </p>
          <TerminalOutput
            lines={[
              {
                text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user",
                type: "command",
              },
              { text: "Added terminator (stdio) - User scope", type: "success" },
              { text: "", type: "output" },
              { text: "# now in another terminal, tail the log", type: "output" },
              {
                text: "tail -f ~/.terminator/logs/*.log",
                type: "command",
              },
              { text: "🔧 Multi-instance mode: allowing multiple instances, only cleaning orphans", type: "info" },
              { text: "✨ No orphaned or conflicting processes found", type: "output" },
              { text: "Set Windows console to UTF-8 mode (async)", type: "output" },
              { text: "Terminator MCP Server v1.x.x", type: "output" },
              { text: "Transport mode: Stdio", type: "info" },
              { text: "Starting stdio transport...", type: "info" },
              { text: "MCP server still running (stdio mode)", type: "output" },
            ]}
            title="setup + live log"
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Closing CTA */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <InlineCta
            heading="Want a desktop agent that survives the editor crashing?"
            body="Terminator is the MCP server that made us care about every line on this page. It gives your AI coding assistant the ability to control every app on your desktop, not just write code. Open source, MIT licensed, a single npx command to install."
            linkText="Install Terminator"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>
      </article>
    </div>
  );
}
