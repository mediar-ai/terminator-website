import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  StepTimeline,
  AnimatedChecklist,
  ProofBanner,
  CodeComparison,
  NumberTicker,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/automation-testing-tools-for-desktop-application";
const PUBLISHED = "2026-04-28";
const TITLE =
  "Automation testing tools for desktop application: the four-step pre-flight that tells you the screen is even alive";
const DESCRIPTION =
  "Every list of desktop automation testing tools ranks the same names by feature matrix. None of them tell you how to detect, before a single click is sent, that the test agent VM has lost its desktop session. Terminator's MCP agent ships an HTTP /ready endpoint that runs a four-step UIAutomation probe (COM init, automation creation, root element, child enumeration) inside a five-second timeout and maps the result to HTTP 200, 206, or 503.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "curl http://127.0.0.1:3000/ready and you get 503 the moment the desktop is dead. Source: crates/terminator/src/health.rs and crates/terminator/src/platforms/windows/health.rs. Five-second timeout, COINIT_MULTITHREADED, TreeScope::Children with a true condition.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A pre-flight desktop liveness probe for test runners",
    description:
      "Four ordered checks. One five-second timeout. HTTP 200, 206, or 503. desktop_child_count and display_width come back in the JSON. The CI primitive missing from every other desktop test tool.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation testing tools for desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Automation testing tools for desktop application",
    url: PAGE_URL,
  },
];

const probeChecks = [
  {
    title: "Step 1. Initialize COM in multi-threaded mode",
    description:
      "Calls CoInitializeEx(None, COINIT_MULTITHREADED) and tolerates RPC_E_CHANGED_MODE (0x80010106) so a process that already initialized COM in a different mode is still considered healthy.",
    detail: (
      <p className="text-sm text-zinc-600 leading-relaxed">
        This catches the failure where the host process was launched without a thread that ever called CoInitializeEx. Without it the next call to UIAutomation hard-fails with E_NOINTERFACE rather than a useful error, and a normal try/click test would just hang on the COM apartment. The probe records <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">com_initialized: true|false</code> in the response diagnostics so you can tell this case apart from a UIA failure.
      </p>
    ),
  },
  {
    title: "Step 2. Build a fresh UIAutomation instance",
    description:
      "Runs UIAutomation::new_direct() and flips api_available to true on success. Failure is reported back as 'UIAutomation creation failed' with the underlying error string.",
    detail: (
      <p className="text-sm text-zinc-600 leading-relaxed">
        new_direct bypasses the cached automation singleton and forces a real CoCreateInstance for CUIAutomation. If a stale UIA host process is wedged (a common failure on long-lived Azure agent VMs that have been running for weeks), this is the line that throws first. The probe answers in milliseconds and the error message gets logged at <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">tracing::error!</code> level.
      </p>
    ),
  },
  {
    title: "Step 3. Get the desktop root element",
    description:
      "Calls automation.get_root_element() and flips desktop_accessible to true. On failure it queries virtual_display::is_headless_environment() and adds is_headless and a 'virtual display may be disconnected' diagnostic to the response.",
    detail: (
      <p className="text-sm text-zinc-600 leading-relaxed">
        This is the step that catches a dead RDP session. The error message returned literally reads "Cannot access desktop: ... This typically indicates RDP disconnection or virtual display issues." The diagnostic block is what lets a CI script branch: a healthy machine with no RDP gets one error class, a headless agent VM with a misconfigured virtual display gets another.
      </p>
    ),
  },
  {
    title: "Step 4. Enumerate desktop children with a true condition",
    description:
      "Builds automation.create_true_condition() and walks root_element.find_all(TreeScope::Children, &condition). Counts the result, adds desktop_child_count to diagnostics, and only flips can_enumerate_elements when the count is greater than zero.",
    detail: (
      <p className="text-sm text-zinc-600 leading-relaxed">
        Zero children on a logged-in desktop is the silent killer for a desktop test suite. The screen looks alive (Step 3 passed), UIAutomation answered (Step 2 passed), but the tree is empty because the display is connected at the OS level and disconnected at the user-session level. The probe explicitly downgrades to "Desktop has no child windows - display may be disconnected" rather than letting the next test wait for a button that will never appear.
      </p>
    ),
  },
];

const responseDiagnostics = [
  { text: "platform: windows | macos | linux (std::env::consts::OS)", checked: true },
  { text: "api_available: true after UIAutomation::new_direct() succeeds", checked: true },
  { text: "desktop_accessible: true after get_root_element() succeeds", checked: true },
  { text: "can_enumerate_elements: true when desktop_child_count > 0", checked: true },
  { text: "check_duration_ms: wall-clock time for the four steps in ms", checked: true },
  { text: "diagnostics.com_initialized: bool, separates COM failure from UIA failure", checked: true },
  { text: "diagnostics.desktop_child_count: usize, lets you alarm on tree shrinkage", checked: true },
  { text: "diagnostics.is_headless: bool, true when TERMINATOR_HEADLESS=1 is set", checked: true },
  { text: "diagnostics.display_width / display_height: i32, zero means RDP detached", checked: true },
  { text: "error_message: a single string with the first failure encountered, or null", checked: true },
];

const naiveScript = `# pre-test.sh — naive way most desktop CI pipelines do it
# Hope the agent VM is alive. Run the suite. Read the failures.

echo "starting desktop test suite"
pytest tests/desktop/ --maxfail=10

# what actually happens on a dead RDP session:
#   - Selenium/WinAppDriver hangs for the full implicit wait
#     on every locator in every test, then ConnectionRefused
#   - test runner exits with mixed timeouts and TimeoutException
#   - you get 47 minutes of red CI logs that all say "could not
#     find element" and zero indication that the session itself
#     was dead before t=0
#   - rerun usually "fixes" it because the next agent has a
#     fresh RDP session, so the bug looks intermittent forever`;

const probeScript = `# pre-test.sh — Terminator MCP agent /ready check
# Refuse to start if the desktop session is not actually alive.

npx -y terminator-mcp-agent@latest --transport http --port 3000 &
sleep 2

READY=$(curl -s -o /tmp/ready.json -w "%{http_code}" http://127.0.0.1:3000/ready)

if [ "$READY" != "200" ]; then
  echo "desktop not ready (HTTP $READY) — failing fast"
  cat /tmp/ready.json | jq '.automation'
  exit 1
fi

# Real example response on a healthy Azure VM:
#   { "status": "ready",
#     "automation": {
#       "api_available": true,
#       "desktop_accessible": true,
#       "can_enumerate_elements": true,
#       "check_duration_ms": 47,
#       "diagnostics": {
#         "com_initialized": true,
#         "desktop_child_count": 14,
#         "is_headless": false,
#         "display_width": 1920,
#         "display_height": 1080 } } }

echo "desktop is alive — running suite"
pytest tests/desktop/`;

const faqs: FaqItem[] = [
  {
    q: "Why does desktop test automation need a separate liveness probe at all? Doesn't a 'test for the existence of a button' already prove the screen is alive?",
    a: "It proves it after a per-test implicit wait. WinAppDriver, Appium for desktop, pywinauto, AutoIt, and most other Windows automation libraries default to retrying element lookups for tens of seconds before giving up. So when the RDP session has dropped, every test in the suite eats the full retry budget on its first locator, then fails with a generic 'could not find element' or 'TimeoutException'. A 100-test suite can burn an hour producing logs that look like 100 unrelated bugs and look intermittent because the next CI run gets a fresh agent. A single-shot probe before the suite starts converts that into one unambiguous fail-fast: HTTP 503 with com_initialized:true, desktop_accessible:false, and a literal 'RDP disconnection or virtual display issues' string in the error_message field.",
  },
  {
    q: "What does the four-step probe actually run, and where does it live in the source?",
    a: "It lives in two files. crates/terminator/src/health.rs (229 lines) defines the cross-platform HealthCheckResult struct, the HealthStatus enum (Healthy / Degraded / Unhealthy), and the to_http_status() mapping (200 / 206 / 503). crates/terminator/src/platforms/windows/health.rs implements perform_sync_health_check() with the four ordered steps: CoInitializeEx(None, COINIT_MULTITHREADED), UIAutomation::new_direct(), automation.get_root_element(), and root_element.find_all(TreeScope::Children, &automation.create_true_condition()). The whole sync function is wrapped in tokio::task::spawn_blocking and then in tokio::time::timeout(Duration::from_secs(5)) so a wedged UIAutomation host can never block the probe past five seconds. The HTTP route is mounted at /ready in crates/terminator-mcp-agent/src/main.rs around lines 866-941.",
  },
  {
    q: "How is /ready different from /health on the same agent? They sound like the same thing.",
    a: "They are deliberately split. /health is a 'process is alive and HTTP server is responding' liveness check that returns 200 unconditionally and never touches UIAutomation. It is meant for Azure Load Balancer health probes that fire every five to fifteen seconds, mediar-app monitoring that fires every thirty, and Kubernetes liveness probes. /ready is the deep readiness check: it calls into UIAutomation and can take 500ms to 5s, so it is meant for pre-deployment validation, pre-test gating, Kubernetes readiness probes, and manual diagnostics. The comment block above readiness_check() in main.rs warns explicitly: 'NOT recommended for frequent automated monitoring - use /health instead.' Hitting /ready every five seconds in a load balancer would slow down the actual MCP traffic.",
  },
  {
    q: "What does HTTP 206 mean in the context of a desktop liveness probe? That status code is for partial content.",
    a: "It is reused as the 'degraded' state. HealthStatus::to_http_status() returns 200 for Healthy, 206 for Degraded, and 503 for Unhealthy. Degraded is the case where api_available is true but either desktop_accessible or can_enumerate_elements is false. In practice that happens when COM and UIAutomation are both responsive but the desktop session has just dropped: you can talk to the API, you cannot find the screen. Picking 206 instead of 503 lets a smarter CI script branch on three states rather than two. A pre-test gate can decide to retry on 503 (full failure, probably worth restarting the agent) and exit fast on 206 (partial failure, probably worth alerting humans).",
  },
  {
    q: "Where does the headless detection actually come from? The Windows file references is_headless_environment but doesn't define it.",
    a: "It lives in crates/terminator/src/platforms/windows/virtual_display.rs. The function checks the TERMINATOR_HEADLESS environment variable (any value of 'true' or '1' counts) and returns true. It is intentionally minimal because the more interesting signal is downstream: when the probe gets a root element back but the bounding rectangle has width or height of zero, the 'display has zero dimensions' diagnostic fires. That is the actual signal that a virtual display driver is misconfigured rather than a real RDP disconnect, and it is what lets you tell apart 'this CI runner needs to be restarted' from 'the indirectdisplay driver was reinstalled wrong.' The current implementation could check session ID and remote-session flags too, but the env-var trip wire plus the zero-dimension check has been enough for the failure modes seen in production.",
  },
  {
    q: "Can I run /ready against a remote desktop test farm, or does it have to be local?",
    a: "Local to the agent VM. The terminator-mcp-agent binds the HTTP server on 127.0.0.1:3000 by default and the /ready check runs against the UIAutomation API on the same machine, because UIAutomation is a per-session COM object that cannot be reached from another box. The realistic deployment is one MCP agent per CI worker VM, with curl http://127.0.0.1:3000/ready as the pre-test step in the same job. If you have a fleet, point each runner at its own local agent and aggregate the JSON response into your monitoring stack alongside the diagnostics block, which already serializes to a flat shape that fits Prometheus or any other JSON-friendly metrics pipeline.",
  },
  {
    q: "What happens on macOS and Linux? The Windows file is detailed but the cross-platform code looks like it just returns 'healthy' for those.",
    a: "Correct. crates/terminator/src/health.rs defines MacOSHealthChecker and LinuxHealthChecker with stubs that return HealthStatus::Healthy and a diagnostic note ('Accessibility API health checks not yet implemented' or 'AT-SPI health checks not yet implemented'). Windows is the primary target because that is where the operationally-painful failure modes live (RDP, virtual displays, indirectdisplay drivers, COM apartments). On macOS the equivalent failure shape is an Accessibility permission revocation or a screen-recording prompt that has been dismissed, and the right probe there would call AXIsProcessTrustedWithOptions and try a real AXUIElementCopyAttributeValue against the system-wide AXUIElement. That work is on the roadmap; today, the Windows probe is the load-bearing one.",
  },
  {
    q: "How does this fit alongside an existing test framework like Pytest, NUnit, or Mocha? I don't want to rewrite my suite.",
    a: "It does not replace the test runner. It runs as a pre-step in the same CI job: start the MCP agent in the background, sleep two seconds, curl /ready, exit non-zero on anything except 200, then run your existing pytest / dotnet test / npx mocha command unchanged. The probe is read-only against UIAutomation, so it does not interfere with anything the test does later. The only state it leaves behind is a background MCP agent process, which you either let CI clean up or kill explicitly at the end of the job. The same pattern works whether the suite uses Terminator's own SDK, WinAppDriver, AutoIt, or pywinauto for the actual clicks.",
  },
];

const relatedPosts = [
  {
    title: "Automation testing for desktop application",
    href: "/t/automation-testing-for-desktop-application",
    excerpt: "Live event telemetry over a Windows Named Pipe per test run. Eight typed WorkflowEvent variants, no stderr scraping.",
    tag: "Telemetry",
  },
  {
    title: "Automation tools for testing desktop applications",
    href: "/t/automation-tools-for-testing-desktop-applications",
    excerpt: "The BLAKE3 element-id hash that survives across releases so your selectors do not break every time the dev team ships.",
    tag: "Selectors",
  },
  {
    title: "Test automation tools for desktop applications",
    href: "/t/test-automation-tools-for-desktop-applications",
    excerpt: "An MCP-callable tsc gate that an AI assistant can hit before any pixel moves on screen.",
    tag: "Type safety",
  },
];

export default function Page() {
  return (
    <article className="bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              url: PAGE_URL,
              publisher: "Terminator",
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

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4">
          Pre-flight liveness probe / desktop CI
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 leading-[1.05] tracking-tight">
          Every guide to automation testing tools for desktop application ranks the same names. None of them tell you how to detect that the screen is dead before the suite starts.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          The honest reason desktop test runs are flaky in CI is rarely the test code. It is that the agent VM lost its RDP session, the virtual display went to zero dimensions, or the UIAutomation COM host wedged on the previous run, and the test framework noticed only after burning the per-element implicit wait on every locator. Terminator&rsquo;s MCP agent ships an HTTP <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">/ready</code> endpoint that runs a four-step UIAutomation probe in under five seconds and returns HTTP 200, 206, or 503. Curl it before you start the suite. If it is 503, fail the build and skip the runner; if it is 200, your tests have a real desktop underneath them.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
      />

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Why a separate probe matters
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Pull up any list of automation testing tools for desktop application work and you will see the same shortlist: WinAppDriver from Microsoft, TestComplete from SmartBear, Ranorex, Katalon Studio, Tosca, T-Plan Robot, UFT One, Winium. They all do roughly the same job: drive Windows controls through some flavor of UI Automation, optionally with image-matching as a fallback, and offer a record-and-playback workflow on top. The feature-matrix differences between them are real but small.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          What none of them ship is a primitive for the operational reality that destroys most desktop CI fleets. RDP sessions drop. Virtual display drivers misconfigure on patch Tuesdays. The UIA COM host occasionally wedges after enough consecutive runs. When any of that happens, every locator in every test in the suite goes through its full retry budget before the runner gives up. A 100-test suite that should have failed in two seconds instead burns 47 minutes producing red logs that all say <em>could not find element</em>, and the next CI run on a fresh agent goes green, so the failure looks intermittent forever.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The probe described below is small, surgical, and you can call it from any pre-test step regardless of which test framework you already use. It does not replace any tool on the shortlist. It answers one question that none of them answer: <em>is the screen even alive?</em>
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <ProofBanner
          metric="5s"
          quote="The whole probe is wrapped in tokio::time::timeout(Duration::from_secs(5)) inside spawn_blocking, so a wedged UIAutomation host cannot block longer than five seconds even if every COM call inside hangs."
          source="crates/terminator/src/platforms/windows/health.rs lines 35-58"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          The four checks, in order
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The whole probe is one synchronous function, <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">perform_sync_health_check()</code>, that runs four checks in order and updates a single <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">HealthCheckResult</code> as it goes. Each step catches a different failure mode. A test runner that reads the response can tell which step failed and decide what to do.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <StepTimeline steps={probeChecks} />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          What comes back in the JSON
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The HTTP body is intentionally flat. Every field on the response has a fixed key and a fixed type, which makes it easy to parse with <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">jq</code> or pipe into a metrics agent. The full shape lives in <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">HealthCheckResult</code> in <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">crates/terminator/src/health.rs</code> and gets nested under the <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">automation</code> key by the MCP agent&rsquo;s <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">readiness_check()</code> handler.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <AnimatedChecklist
          title="Fields on the /ready response"
          items={responseDiagnostics}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          The HTTP status code is the load-bearing part
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The probe maps its three internal health states onto three HTTP status codes via <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">HealthStatus::to_http_status()</code>. That is what makes <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">curl -f</code> from a CI script useful: a single exit code carries the right amount of information.
        </p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-3xl font-mono font-bold text-orange-600">
              <NumberTicker value={200} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">Healthy</p>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
              All four checks passed. <code className="font-mono text-xs">api_available</code>, <code className="font-mono text-xs">desktop_accessible</code>, and <code className="font-mono text-xs">can_enumerate_elements</code> are all true. Run the suite.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-3xl font-mono font-bold text-orange-600">
              <NumberTicker value={206} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">Degraded</p>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
              UIAutomation is reachable but the desktop or the tree is not. Usually means the session dropped after start. A smart CI script alerts humans rather than restarts.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <div className="text-3xl font-mono font-bold text-orange-600">
              <NumberTicker value={503} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-widest text-zinc-500 font-mono">Unhealthy</p>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
              COM never initialized or UIAutomation refused to instantiate. The runner is broken. Fail the job, requeue the test, ideally on a different agent.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Naive pre-test step versus a real one
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The cost of <em>not</em> doing this is concrete. Toggle between the two scripts to see what changes.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <CodeComparison
          leftLabel="naive pre-test (most teams)"
          rightLabel="terminator /ready gate"
          leftLines={11}
          rightLines={20}
          leftCode={naiveScript}
          rightCode={probeScript}
          title="pre-test.sh"
          reductionSuffix="more honest CI exit codes"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          What the rest of the desktop testing tool category misses
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          To be fair, most of the named players in this category are good at their actual job. WinAppDriver is the canonical Windows UI Automation driver and is genuinely solid for WPF, WinForms, Win32, and UWP. TestComplete and Ranorex have polished object spies and integrate cleanly with CI plugins. Katalon and Tosca cater to mixed audiences. T-Plan Robot has cross-platform reach via VNC. None of that is wrong.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          What the whole category treats as someone else&rsquo;s problem is the agent-VM operational layer. There is no documented WinAppDriver endpoint to ask &ldquo;is the desktop alive?&rdquo; before you POST a session. There is no built-in TestComplete API that tells you whether the COM apartment is wedged before your project loads. The implicit assumption across the category is that the test framework will discover that condition by failing on the first locator, which is exactly the behavior that makes the failure mode look intermittent and turns a five-second config bug into 47-minute red CI runs.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The probe in this guide is a few hundred lines of Rust and a single curl. It does not stop you from using any of the tools above. It just makes the fact-of-life that desktops can be dead at the OS level into a checkable HTTP status code, so the rest of the tooling can keep doing what it does well.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          Honest limitations
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The probe is Windows-first. The macOS and Linux paths return <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">HealthStatus::Healthy</code> with a TODO note (&ldquo;Accessibility API health checks not yet implemented&rdquo;); on those platforms it tells you the process is alive but does not actually probe the AX or AT-SPI tree. If you are testing macOS desktop apps, treat the macOS branch as a placeholder for now.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The probe is also single-shot, not continuous. Running it before the suite catches the most common failure mode (the screen was dead at t=0). It does not catch the screen dying mid-run. If your suite is long enough that this matters, the typical pattern is to wrap each test in a try-catch that re-hits <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">/ready</code> on first failure and decides whether to retry or to abort the whole run.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          And the probe does not run any of your real tests for you. It is a pre-flight check, not a smoke test. A green 200 means the probe&rsquo;s four steps passed. It does not mean Calculator is installed, your application has launched, or your golden fixtures are correct. Those failures still need real tests.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-14">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want a walkthrough of /ready in your CI?"
          description="Show us how your desktop test fleet is wired today and we will sketch where the probe slots in."
        />
      </div>

      <FaqSection items={faqs} heading="More questions about pre-flight liveness for desktop tests" />

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More on Terminator for desktop testing"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Pre-flight desktop liveness in 5s. Want to see it in your CI?"
      />
    </article>
  );
}
