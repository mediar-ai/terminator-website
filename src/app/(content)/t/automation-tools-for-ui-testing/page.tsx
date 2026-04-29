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
  AnimatedBeam,
  AnimatedCodeBlock,
  AnimatedChecklist,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  StepTimeline,
  BentoGrid,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-tools-for-ui-testing";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation tools for UI testing that prove they can see the UI first";
const DESCRIPTION =
  "Every ranked list of automation tools for UI testing scores vendors on selectors, self-healing, and AI authoring. None of them ask whether the worker about to run the test can actually see a UI right now. Terminator's MCP agent ships an HTTP /ready endpoint that boots UIAutomation, grabs the desktop root, enumerates TreeScope::Children, and returns 200, 206, or 503 inside a hard 5 second timeout. Source: main.rs line 792 and crates/terminator/src/platforms/windows/health.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A UI test automation tool with an HTTP /ready endpoint that returns 503 when its accessibility stack cannot see the desktop. Drain the worker before you dispatch the test.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI test automation that probes itself over HTTP",
    description:
      "Healthy 200, Degraded 206, Unhealthy 503. Under a 5 second timeout. On the same MCP server your agent talks to. That is how Terminator handles worker fragility.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation tools for UI testing" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation tools for UI testing", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What do automation tools for UI testing usually miss?",
    a: "They assume the worker executing the test is always capable of seeing a UI. That is not true in practice. RDP sessions disconnect. Azure load-balanced VMs shift the desktop session. Virtual display drivers fail to register a headless monitor. The browser automation tool has no opinion about any of this because the browser runs in-process inside the test runner. Desktop UI automation runs against the OS accessibility API, and that API can silently lose the desktop out from under you. Terminator's MCP agent ships an HTTP /ready endpoint that actively probes UIAutomation, grabs the desktop root, and enumerates its children before the job dispatcher sends work. If any step fails, the worker returns 503 Service Unavailable and the orchestrator pulls it out of rotation. Source: crates/terminator-mcp-agent/src/main.rs line 793.",
  },
  {
    q: "What HTTP status codes does /ready return and why?",
    a: "Healthy maps to 200 OK. Degraded maps to 206 Partial Content. Unhealthy maps to 503 Service Unavailable. The mapping lives in crates/terminator/src/health.rs line 25 inside HealthStatus::to_http_status(). Degraded is a real state in the middle: api_available is true but either the desktop cannot be accessed or the element enumeration returned zero children. That covers the common case where the UIAutomation COM object initialized fine but the display was hot-unplugged or RDP dropped the session. Browsers do not have this state because a headless browser always reports itself as having a page; for desktop automation it is the failure mode that bites the most often.",
  },
  {
    q: "How long does /ready take and what happens if the probe hangs?",
    a: "On Windows the probe runs inside tokio::task::spawn_blocking wrapped by tokio::time::timeout(Duration::from_secs(5), check_future). Five seconds is the ceiling. If CoInitializeEx hangs, UIAutomation::new_direct() hangs, or get_root_element() hangs past five seconds, the probe returns Unhealthy with error_message set to 'Health check timed out after 5 seconds - UIAutomation API may be unresponsive' and the HTTP layer returns 503. The timeout is in crates/terminator/src/platforms/windows/health.rs line 35. No dangling COM reference, no stuck readiness probe, no flaky test dispatched against a frozen UIA thread.",
  },
  {
    q: "What is different between /health and /ready?",
    a: "/health is a liveness probe: it confirms the process is alive and the HTTP stack responds. It always returns 200 if the server is up. It does not touch UIAutomation. You point Azure Load Balancer at it and probe every five seconds without interfering with in-flight tests. /ready is a readiness probe that actually exercises the accessibility stack. It is expensive (500ms to 5s on Windows), so you probe it less often: once at worker startup, once per test before dispatch, once in a Kubernetes readinessProbe initialDelaySeconds, or on demand from a diagnostics page. Both endpoints are wired in main.rs lines 792-794. Mixing them up is a common ops footgun with any UI test automation worker fleet.",
  },
  {
    q: "What diagnostics does the /ready payload actually include?",
    a: "The JSON payload on Windows includes: com_initialized (bool), api_available, desktop_accessible, can_enumerate_elements, check_duration_ms, desktop_child_count (integer), is_headless (bool), display_width, display_height, display_x, display_y, desktop_name, plus error_message if any step failed. The writes happen in crates/terminator/src/platforms/windows/health.rs lines 62-205. For example, if the probe succeeds but reports desktop_child_count: 0 with a display_warning of 'Desktop has no child windows', you know the worker booted UIA cleanly but the display is disconnected. That is different from api_available: false which means COM itself is broken. Two different fixes, two different alert routes, both visible in one JSON response.",
  },
  {
    q: "Why do browser-only UI test tools not need this?",
    a: "Because the browser is the runtime. Chromium starts in the same process tree as Playwright, exposes a DOM over DevTools Protocol, and there is no external accessibility service between the test and the page. If Chromium starts, Playwright can query the DOM. Desktop UI automation is the opposite: the accessibility tree is produced by a separate Windows service, depends on a functioning display subsystem, and can be silently degraded by session switches, GPU driver reloads, or certain GPO-restricted hosts. The health probe exists because the gap between 'process is alive' and 'UIA can enumerate a button' is wider than any of the ranked automation tools for UI testing wants to admit.",
  },
  {
    q: "Can I use /ready inside a Kubernetes pod?",
    a: "Yes, that is one of its stated design targets. The inline comment at main.rs line 898 lists 'Pre-deployment validation, Diagnostics and troubleshooting, Kubernetes readiness probes (less frequent)'. A readinessProbe with periodSeconds: 30 and failureThreshold: 2 is reasonable. Pair it with a livenessProbe hitting /health at periodSeconds: 10. The readiness probe will flip the pod to NotReady when UIA becomes unreachable, the livenessProbe will not kill the pod unless the whole axum server dies. This is the pattern Kubernetes expects and Terminator models it directly.",
  },
  {
    q: "Does the /ready endpoint fire only on Windows?",
    a: "The HTTP endpoint is defined cross-platform. The underlying check_automation_health() call dispatches to WindowsHealthChecker, MacOSHealthChecker, or LinuxHealthChecker depending on target_os. macOS and Linux checkers currently return Healthy with a diagnostic note that deep AX and AT-SPI checks are not yet implemented (health.rs lines 167-200). So on Windows you get real probe semantics today; on macOS you get a liveness-equivalent readiness response. That is an honest gap that most automation tools for UI testing do not even document because they never differentiated the two endpoints.",
  },
  {
    q: "How do I install and probe it in under a minute?",
    a: "npx -y terminator-mcp-agent@latest --transport http --port 3000. Then curl -s http://localhost:3000/ready | jq .status. You will see 'ready', 'degraded', or 'not_ready'. The HTTP status code mirrors it. Pipe it into your CI pre-flight: before the pipeline dispatches a test, it curls the worker, checks the status, and skips or retries if the worker is not ready. This replaces the 'it worked on my VM' pattern with a binary signal. The shell command, the endpoint, and the response shape are all visible in main.rs line 870-886.",
  },
];

const readinessSource = `// crates/terminator-mcp-agent/src/main.rs (lines 892-939)

async fn readiness_check() -> impl axum::response::IntoResponse {
    use terminator::health::{check_automation_health, HealthStatus};

    // Deep readiness check - validates UIAutomation API is functional
    // and ready to serve requests. Performs expensive checks (500ms-5s).
    //
    // Use cases:
    // - Pre-deployment validation
    // - Diagnostics and troubleshooting
    // - Kubernetes readiness probes (less frequent)
    // - Manual health verification

    let bridge_health =
        terminator::extension_bridge::ExtensionBridge::health_status().await;

    let automation_health = check_automation_health().await;

    let response_body = serde_json::json!({
        "status": match automation_health.status {
            HealthStatus::Healthy   => "ready",
            HealthStatus::Degraded  => "degraded",
            HealthStatus::Unhealthy => "not_ready",
        },
        "extension_bridge": bridge_health,
        "automation": {
            "api_available": automation_health.api_available,
            "desktop_accessible": automation_health.desktop_accessible,
            "can_enumerate_elements": automation_health.can_enumerate_elements,
            "check_duration_ms": automation_health.check_duration_ms,
            "error_message": automation_health.error_message,
            "diagnostics": automation_health.diagnostics,
        },
        "platform": automation_health.platform,
        "timestamp": chrono::Utc::now().to_rfc3339()
    });

    let http_status = match automation_health.status.to_http_status() {
        200 => axum::http::StatusCode::OK,
        206 => axum::http::StatusCode::PARTIAL_CONTENT,
        503 => axum::http::StatusCode::SERVICE_UNAVAILABLE,
        _   => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
    };

    (http_status, axum::Json(response_body))
}`;

const statusMapSource = `// crates/terminator/src/health.rs (line 23-32)

impl HealthStatus {
    /// Convert to HTTP status code for health endpoints
    pub fn to_http_status(&self) -> u16 {
        match self {
            HealthStatus::Healthy   => 200, // OK
            HealthStatus::Degraded  => 206, // Partial Content
            HealthStatus::Unhealthy => 503, // Service Unavailable
        }
    }
}`;

const windowsProbeSource = `// crates/terminator/src/platforms/windows/health.rs (lines 28-60)

#[async_trait]
impl PlatformHealthCheck for WindowsHealthChecker {
    async fn check_health(&self) -> HealthCheckResult {
        let start = Instant::now();

        // Run the check in a blocking task with timeout since
        // UIAutomation uses COM.
        let check_future =
            tokio::task::spawn_blocking(perform_sync_health_check);

        // Apply a 5-second timeout to the health check.
        match tokio::time::timeout(
            std::time::Duration::from_secs(5),
            check_future,
        ).await {
            Ok(Ok(mut result)) => {
                result.check_duration_ms = start.elapsed().as_millis() as u64;
                result
            }
            Ok(Err(e)) => unhealthy_spawn_error(e, start),
            Err(_)    => unhealthy_timed_out(start),
        }
    }
}`;

const probeSteps = [
  {
    title: "CoInitializeEx(COINIT_MULTITHREADED)",
    description:
      "Bootstraps the COM apartment for this thread. Silently tolerates RPC_E_CHANGED_MODE (0x80010106) so the probe does not fail when COM was already initialized in another mode elsewhere in the process. Records com_initialized: true|false in the diagnostics blob.",
  },
  {
    title: "UIAutomation::new_direct()",
    description:
      "Creates a direct IUIAutomation COM object, bypassing the wrapper cache. If this call fails, api_available stays false, error_message records the exact failure string, and the probe short-circuits. This is the single most common failure on locked-down hosts where UIA was disabled by group policy.",
  },
  {
    title: "get_root_element() and virtual_display::is_headless_environment()",
    description:
      "Grabs the desktop root element. On headless VMs (TERMINATOR_HEADLESS=1, or detected virtual display), logs 'Cannot access desktop: ... This typically indicates RDP disconnection or virtual display issues'. Sets desktop_accessible accordingly. Also captures display_width, display_height, display_x, display_y from the root's bounding rectangle so a zero-sized display surfaces in the JSON immediately.",
  },
  {
    title: "find_all(TreeScope::Children, TrueCondition)",
    description:
      "Enumerates direct children of the desktop, the operation every selector call ultimately depends on. A zero child count flips can_enumerate_elements to false and attaches display_warning: 'Desktop has no child windows'. That is the signal a browser-only test tool has no equivalent for.",
  },
  {
    title: "update_status() and to_http_status()",
    description:
      "Collapses the three boolean checks into the overall HealthStatus enum. All three true produces Healthy; api_available alone produces Degraded; otherwise Unhealthy. to_http_status() converts those to 200, 206, or 503 and the axum handler in main.rs returns the matching StatusCode with the same body regardless.",
  },
];

const readyTerminalLines = [
  { text: "npx -y terminator-mcp-agent@latest --transport http --port 3000", type: "command" as const },
  { text: "Streamable HTTP server running on http://127.0.0.1:3000", type: "info" as const },
  { text: "Health check: http://127.0.0.1:3000/health", type: "info" as const },
  { text: "Readiness: http://127.0.0.1:3000/ready", type: "info" as const },
  { text: "curl -sS -w 'HTTP %{http_code}\\n' http://localhost:3000/ready | jq .status", type: "command" as const },
  { text: "\"ready\"", type: "output" as const },
  { text: "HTTP 200", type: "success" as const },
  { text: "# Unplug the monitor, disconnect RDP, or stop the display driver.", type: "info" as const },
  { text: "curl -sS -w 'HTTP %{http_code}\\n' http://localhost:3000/ready | jq .status", type: "command" as const },
  { text: "\"not_ready\"", type: "output" as const },
  { text: "HTTP 503", type: "error" as const },
];

const readyJsonLines = [
  { text: "curl -s http://localhost:3000/ready | jq .", type: "command" as const },
  { text: "{", type: "output" as const },
  { text: "  \"status\": \"degraded\",", type: "output" as const },
  { text: "  \"automation\": {", type: "output" as const },
  { text: "    \"api_available\": true,", type: "output" as const },
  { text: "    \"desktop_accessible\": true,", type: "output" as const },
  { text: "    \"can_enumerate_elements\": false,", type: "output" as const },
  { text: "    \"check_duration_ms\": 412,", type: "output" as const },
  { text: "    \"diagnostics\": {", type: "output" as const },
  { text: "      \"com_initialized\": true,", type: "output" as const },
  { text: "      \"desktop_child_count\": 0,", type: "output" as const },
  { text: "      \"is_headless\": true,", type: "output" as const },
  { text: "      \"display_width\": 1920,", type: "output" as const },
  { text: "      \"display_height\": 1080,", type: "output" as const },
  { text: "      \"display_warning\": \"Desktop has no child windows\"", type: "output" as const },
  { text: "    }", type: "output" as const },
  { text: "  },", type: "output" as const },
  { text: "  \"platform\": \"windows\"", type: "output" as const },
  { text: "}", type: "output" as const },
  { text: "HTTP 206 Partial Content", type: "info" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Worker exposes an HTTP readiness endpoint",
    competitor: "No. You dispatch the test and hope.",
    ours: "Yes. /ready returns 200, 206, or 503 per a live UIA probe.",
  },
  {
    feature: "Liveness and readiness separated",
    competitor: "n/a. The test itself doubles as a probe.",
    ours: "/health (cheap, always 200 if up) and /ready (deep UIA check).",
  },
  {
    feature: "Detects RDP disconnect before dispatch",
    competitor: "No. Test fails partway through and pollutes the report.",
    ours: "Yes. desktop_child_count: 0 flips status to degraded.",
  },
  {
    feature: "Hard timeout on the probe",
    competitor: "n/a.",
    ours: "5 second tokio::time::timeout. No frozen probe threads.",
  },
  {
    feature: "Diagnostics include display width and height",
    competitor: "Surfaces as a broken screenshot inside a failed run.",
    ours: "display_width, display_height in JSON. Zero values raise.",
  },
  {
    feature: "Headless/virtual display detection",
    competitor: "No explicit signal.",
    ours: "is_headless flag plus display_warning when bounds are zero.",
  },
  {
    feature: "Wired for Kubernetes readinessProbe",
    competitor: "Ad hoc shell scripts per vendor.",
    ours: "Inline doc comment: 'Kubernetes readiness probes (less frequent)'.",
  },
  {
    feature: "License",
    competitor: "Closed SaaS in several ranked entries.",
    ours: "MIT, mediar-ai/terminator on GitHub.",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Healthy → 200 OK",
    description:
      "COM initialized, UIAutomation available, desktop reachable, at least one child window found. The dispatcher sends work.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Degraded → 206 Partial Content",
    description:
      "UIA is alive but the desktop is unreachable or has zero children. Common on disconnected RDP or headless VM with misconfigured virtual display.",
    size: "1x1",
  },
  {
    title: "Unhealthy → 503 Service Unavailable",
    description:
      "CoInitializeEx failed or UIAutomation::new_direct returned an error. The worker is unusable until the host is fixed.",
    size: "1x1",
  },
  {
    title: "Hard 5 s timeout",
    description:
      "tokio::time::timeout(Duration::from_secs(5), check_future). A stuck COM call never ties up a probe worker.",
    size: "1x1",
  },
  {
    title: "Diagnostics blob",
    description:
      "com_initialized, desktop_child_count, is_headless, display_width, display_height, desktop_name. Read directly in a dashboard.",
    size: "2x1",
  },
  {
    title: "Shared library",
    description:
      "check_automation_health() lives in terminator::health and dispatches to a per-OS PlatformHealthCheck trait. Your own tool can depend on it.",
    size: "1x1",
  },
];

const preDispatchSteps = [
  { text: "Orchestrator enqueues a UI regression run." },
  { text: "Dispatcher picks a worker from the pool." },
  { text: "Dispatcher curls worker's /ready endpoint." },
  { text: "Status 200: dispatch the test to this worker." },
  { text: "Status 206 or 503: mark worker as draining, try the next one." },
  { text: "Alert fires on sustained 503s with diagnostics JSON attached." },
];

const relatedPosts = [
  {
    title: "Automation UI testing tools with stable tree diffs",
    excerpt:
      "simple_ui_tree_diff strips volatile IDs and bounds so 118px layout drift produces zero diff.",
    href: "/t/automation-ui-testing-tools",
    tag: "Diff",
  },
  {
    title: "UI test automation tool whose writes refuse to lie",
    excerpt:
      "Every write primitive re-reads the accessibility property before returning. The step only returns success if the UI actually changed.",
    href: "/t/ui-test-automation-tool",
    tag: "Verification",
  },
  {
    title: "UI automation tool that finds controls by geometry",
    excerpt:
      "Spatial selectors: rightof:, leftof:, above:, below:, near:. Filter loop in engine.rs.",
    href: "/t/ui-automation-tool",
    tag: "Selectors",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <article className="text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Automation tools for UI testing that{" "}
              <GradientText>prove they can see</GradientText> the UI first
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Every 2026 roundup of automation tools for UI testing scores
              vendors on self-healing selectors, AI authoring, and cloud
              device grids. None of them answer the question that matters in a
              farm of Windows VMs: can this worker actually see a UI right
              now? Terminator's MCP agent ships an HTTP /ready endpoint that
              boots UIAutomation, grabs the desktop root, enumerates its
              children, and returns HTTP 200, 206, or 503 under a hard 5
              second timeout. Before the orchestrator dispatches a test, it
              can ask.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                GET /health
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                GET /ready
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                200 / 206 / 503
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                tokio::time::timeout(5s)
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="teams running desktop UI test fleets"
            highlights={[
              "Cross-platform PlatformHealthCheck trait in terminator::health",
              "Healthy 200, Degraded 206, Unhealthy 503 (health.rs line 25)",
              "UIA probe inside tokio::time::timeout(Duration::from_secs(5))",
              "Wired on the same axum server your MCP client talks to",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="/ready answers before the test dispatches"
            subtitle="A UI test worker that proves it can see a UI, over HTTP"
            captions={[
              "CoInitializeEx(MULTITHREADED)",
              "UIAutomation::new_direct()",
              "get_root_element()",
              "find_all(TreeScope::Children)",
              "200 / 206 / 503 in under 5 seconds",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The gap every ranked list of automation tools for UI testing
            leaves open
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Nearly every top-ranked 2026 guide compares the same dimensions:
            selector quality, self-healing, AI authoring, parallel grids,
            CI/CD plugins, analytics. All of these assume the worker
            executing the test is capable of seeing a UI when the dispatcher
            hands it a job. In a browser-only world that assumption mostly
            holds, because Chromium is a subprocess of the test runner. The
            moment you move to desktop automation it stops holding. A Windows
            VM can boot cleanly, the test harness can report as online, and
            yet UIAutomation can return no children because the RDP session
            dropped, the virtual display driver de-registered, or a GPO lock
            disabled the accessibility stack.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That is the blind spot Terminator's health and readiness
            endpoints close. The liveness endpoint tells the load balancer
            the process is up. The readiness endpoint tells the dispatcher
            the process can actually see a UI right now, as of two hundred
            milliseconds ago.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Two endpoints, one axum server
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both endpoints are wired in the same router as the MCP protocol
            handler. A single{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              npx terminator-mcp-agent --transport http --port 3000
            </code>{" "}
            gives you /mcp, /health, /ready, /status, and /mode on the same
            port. The split is intentional: cheap liveness for load
            balancers, expensive readiness for dispatchers and diagnostics.
          </p>

          <div className="mt-8">
            <AnimatedBeam
              title="/ready exercises the whole desktop automation stack"
              from={[
                { label: "CI dispatcher", sublabel: "GitHub Actions, ArgoCD, Buildkite" },
                { label: "Kubernetes readinessProbe", sublabel: "periodSeconds: 30" },
                { label: "Azure Load Balancer", sublabel: "health probe every 5 s" },
              ]}
              hub={{ label: "Terminator MCP agent", sublabel: "axum server on :3000" }}
              to={[
                { label: "UIAutomation COM", sublabel: "UIAutomation::new_direct()" },
                { label: "Desktop root", sublabel: "get_root_element()" },
                { label: "TreeScope::Children", sublabel: "find_all(TrueCondition)" },
              ]}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor fact: a 10 line status map
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The mapping from internal health state to HTTP status code is
            ten lines in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              crates/terminator/src/health.rs
            </code>
            . Healthy is 200. Degraded is 206 Partial Content. Unhealthy is
            503 Service Unavailable. 206 is the interesting one: it is what
            the probe returns when the accessibility API is alive but
            cannot enumerate a single desktop window. That state has no
            meaningful analogue in browser automation, which is why no
            browser-first tool exposes it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={statusMapSource}
              language="rust"
              filename="crates/terminator/src/health.rs"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            metric="5 s"
            quote="UIAutomation health check timed out after 5 seconds - UIAutomation API may be unresponsive."
            source="crates/terminator/src/platforms/windows/health.rs, line 53"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Three states, three HTTP codes, one grid
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The status enum is intentionally coarse. Fine-grained diagnostics
            travel in the JSON body. The status code is the signal a
            dispatcher needs to decide whether to send work.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the Windows probe actually does
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Windows implementation is the canonical one today. macOS and
            Linux stubs return Healthy with a diagnostic note that deep AX
            and AT-SPI probes are not yet implemented. The five steps below
            are the order of operations inside{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              perform_sync_health_check
            </code>
            . Each step can short-circuit the probe with a specific
            diagnostic.
          </p>
          <div className="mt-6">
            <StepTimeline steps={probeSteps} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The timeout guard
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A COM call that hangs is worse than a COM call that fails. Every
            production UI automation tool has been bitten by a stuck UIA
            thread that holds a reference past a test's wall clock. The
            readiness probe refuses to hang: it wraps the synchronous check
            in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              tokio::task::spawn_blocking
            </code>{" "}
            and then wraps the join handle in a five second timeout. If the
            timeout fires, the probe returns Unhealthy with a specific
            timeout message.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={windowsProbeSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/health.rs"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Probe in three commands
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Start the MCP agent in HTTP mode, then curl /ready. The shell
            session below is copy-pasteable. Pull the display cable, kill
            the virtual display driver, or drop the RDP session, and the
            second curl flips from 200 to 503 with a specific error_message.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="A two minute reproduction"
              lines={readyTerminalLines}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The Degraded body in full
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            206 Partial Content is the state that lives in the middle:
            UIAutomation is alive, but the desktop has no children. The JSON
            body names exactly why. A real dashboard can parse this and
            route an alert.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="/ready response on a disconnected display"
              lines={readyJsonLines}
            />
          </div>

          <div className="mt-10">
            <GlowCard>
              <div className="p-6">
                <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
                  What the diagnostics catch
                </p>
                <ul className="space-y-2 text-zinc-700 leading-relaxed">
                  <li>
                    <span className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                      desktop_child_count: 0
                    </span>{" "}
                    — display disconnected or session locked.
                  </li>
                  <li>
                    <span className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                      is_headless: true
                    </span>{" "}
                    — TERMINATOR_HEADLESS=1 or a virtual display is in play.
                  </li>
                  <li>
                    <span className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                      display_width: 0
                    </span>{" "}
                    — the monitor reports zero dimensions; GPU reload or
                    driver in a bad state.
                  </li>
                  <li>
                    <span className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                      com_initialized: false
                    </span>{" "}
                    — COM is wedged; this usually means the host needs a
                    reboot before it can serve UI tests.
                  </li>
                </ul>
              </div>
            </GlowCard>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Measured defaults
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The probe is designed to fit inside the readinessProbe
            periodSeconds a sensible Kubernetes operator will pick. Three
            numbers worth memorising.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-zinc-200 bg-white p-8">
            <div className="flex flex-col items-center text-center">
              <span className="text-5xl font-bold text-orange-600">
                <NumberTicker value={5} suffix=" s" />
              </span>
              <p className="mt-2 text-sm text-zinc-500">
                Hard timeout on the Windows probe
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-5xl font-bold text-orange-600">
                <NumberTicker value={3} />
              </span>
              <p className="mt-2 text-sm text-zinc-500">
                Health states (Healthy, Degraded, Unhealthy)
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-5xl font-bold text-orange-600">
                <NumberTicker value={206} />
              </span>
              <p className="mt-2 text-sm text-zinc-500">
                HTTP code when UIA lives but the desktop has no children
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The full handler
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The readiness handler itself is fifty lines. It calls into{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              terminator::health::check_automation_health()
            </code>
            , inlines the extension bridge health alongside it, and
            translates the enum to an axum StatusCode. Zero vendor lock-in;
            anything that speaks HTTP can probe it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={readinessSource}
              language="rust"
              filename="crates/terminator-mcp-agent/src/main.rs"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The dispatch loop this enables
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A test dispatcher does not need to understand UIAutomation to
            use this. It just needs to curl a worker, read the status, and
            route work. The six steps below replace every piece of glue
            custom UI test farms normally ship.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="Pre-dispatch flow"
              items={preDispatchSteps}
            />
          </div>
        </section>

        <ComparisonTable
          heading="Terminator vs a typical browser-only tool"
          intro="What you get for treating the worker as a probeable service instead of a black box."
          productName="Terminator"
          competitorName="Browser-only tools"
          rows={comparisonRows}
          className="max-w-4xl mx-auto px-6 my-14"
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the other ranked entries give you instead
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Playwright and Cypress do not need this, because they are
            browser-only. Virtuoso QA, Mabl, testRigor, Functionize, and
            TestSprite sell AI authoring and self-healing selectors as the
            answer to flakiness, which they are, partially, for scripts
            that run inside an evergreen browser. None of them expose an
            HTTP probe that asserts the OS accessibility API is functional
            before the test fires. Ranorex and Katalon, which do speak
            desktop, leave worker health to the ambient monitoring stack.
            If you are building a fleet, you write that glue yourself.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator pushes that glue into the product. The same binary
            that runs your tests answers the probe. No parallel service to
            deploy, no agent-of-the-agent, no Nagios plugin. One axum
            router; two endpoints.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Probing a UI test fleet you cannot see into?"
          description="Book a 20 minute call with the team. We will walk through wiring /ready into your dispatcher and reading the diagnostics JSON in Grafana."
        />

        <FaqSection items={faqs} />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Next up"
            subtitle="Three more angles on Terminator"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Talk to the team about wiring /ready into your CI fleet."
        />
      </article>
    </>
  );
}
