import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ProofBanner,
  AnimatedChecklist,
  SequenceDiagram,
  HorizontalStepper,
  TerminalOutput,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/cross-platform-desktop-automation-verify";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-11";
const TITLE =
  "Cross-platform desktop automation: how to verify the runtime is actually healthy on Windows and macOS before you click";
const DESCRIPTION =
  "A scripted click that never lands is worse than a test that fails fast. This guide shows how Terminator's built-in /ready endpoint verifies cross-platform desktop automation: one JSON contract on both Windows and macOS, three booleans (api_available, desktop_accessible, can_enumerate_elements), and a five-step Windows probe wrapped in a five-second timeout.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "How to verify cross-platform desktop automation is healthy before your CI lane starts clicking. One HTTP endpoint, three booleans, HTTP 200/206/503.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verify cross-platform desktop automation before you click",
    description:
      "Terminator ships /ready: hit it, get HTTP 200 plus api_available, desktop_accessible, can_enumerate_elements. Source paths included.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Verify cross-platform desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Verify cross-platform desktop automation", url: PAGE_URL },
];

const probeSteps: StepperStep[] = [
  {
    title: "Initialize COM",
    description:
      "CoInitializeEx with COINIT_MULTITHREADED. Tolerates RPC_E_CHANGED_MODE (0x80010106) if another part of the process already initialized.",
  },
  {
    title: "Create UIAutomation",
    description:
      "UIAutomation::new_direct(). Sets api_available = true on success. Fails when the platform service is disabled or the session is non-interactive.",
  },
  {
    title: "Get desktop root",
    description:
      "automation.get_root_element(). Sets desktop_accessible = true. The branch also checks is_headless_environment(), so headless CI gets a diagnostic instead of a misleading false.",
  },
  {
    title: "Enumerate children",
    description:
      "Walk a small fan-out of the root to confirm the tree is queryable. Sets can_enumerate_elements = true. This is the one that catches degraded sessions where the API loads but returns empty trees.",
  },
  {
    title: "Roll up status",
    description:
      "update_status() collapses the three booleans to Healthy, Degraded, or Unhealthy and maps to HTTP 200, 206, or 503. The whole thing runs inside a 5-second tokio::time::timeout so a hung COM call cannot deadlock the probe.",
  },
];

const componentChecks = [
  {
    text: "api_available — the platform automation runtime loaded (UIAutomation on Windows, AX on macOS).",
  },
  {
    text: "desktop_accessible — the root desktop element is reachable from this process.",
  },
  {
    text: "can_enumerate_elements — children of the root come back without error.",
  },
  {
    text: "check_duration_ms — how long the probe took. CI lanes can alarm on this independently.",
  },
  {
    text: "diagnostics — per-platform key/value bag. On Windows you get com_initialized and is_headless. On macOS you currently get a note that AX-level checks are not yet wired up.",
  },
];

const sequenceActors = ["CI runner", "/ready", "Platform probe", "AX or UIA"];

const sequenceMessages = [
  { from: 0, to: 1, label: "GET /ready" },
  { from: 1, to: 2, label: "check_automation_health()" },
  { from: 2, to: 3, label: "init API, get root, enumerate" },
  { from: 3, to: 2, label: "ok or error, with timings" },
  { from: 2, to: 1, label: "HealthCheckResult { 3 booleans }" },
  { from: 1, to: 0, label: "HTTP 200 ready | 206 degraded | 503 not_ready" },
];

const readyResponse = [
  { type: "command" as const, text: "curl -i http://127.0.0.1:9999/ready" },
  { type: "output" as const, text: "HTTP/1.1 200 OK" },
  { type: "output" as const, text: "content-type: application/json" },
  { type: "output" as const, text: "" },
  { type: "output" as const, text: '{' },
  { type: "output" as const, text: '  "status": "ready",' },
  { type: "output" as const, text: '  "platform": "windows",' },
  { type: "output" as const, text: '  "automation": {' },
  { type: "output" as const, text: '    "api_available": true,' },
  { type: "output" as const, text: '    "desktop_accessible": true,' },
  { type: "output" as const, text: '    "can_enumerate_elements": true,' },
  { type: "output" as const, text: '    "check_duration_ms": 312,' },
  { type: "output" as const, text: '    "error_message": null,' },
  { type: "output" as const, text: '    "diagnostics": { "com_initialized": true, "is_headless": false }' },
  { type: "output" as const, text: "  }" },
  { type: "output" as const, text: "}" },
];

const degradedResponse = [
  { type: "command" as const, text: "curl -i http://127.0.0.1:9999/ready" },
  { type: "error" as const, text: "HTTP/1.1 503 Service Unavailable" },
  { type: "output" as const, text: '{ "status": "not_ready",' },
  { type: "output" as const, text: '  "automation": { "api_available": false,' },
  { type: "output" as const, text: '    "error_message": "Health check timed out after 5 seconds - UIAutomation API may be unresponsive" } }' },
];

const faqItems: FaqItem[] = [
  {
    q: "What does verify mean for cross-platform desktop automation?",
    a: "Three things you can actually check from outside the process: the OS-level automation API loaded, the desktop root is reachable, and a tree walk over its children returns without error. Terminator exposes those as api_available, desktop_accessible, and can_enumerate_elements on a single JSON shape that is identical on Windows and macOS. The endpoint that returns them is /ready on the MCP agent, and it maps the rolled-up status to HTTP 200, 206, or 503 so any CI runner can gate on it without parsing the body.",
  },
  {
    q: "How is /ready different from /health on the same agent?",
    a: "/health is liveness only. It confirms the process is alive and the HTTP server is responding and that is it; it does not touch UIAutomation or AX, so it cannot block during heavy automation workloads. /ready is the deep check that actually probes the platform API. The split exists because Azure load balancers and Kubernetes liveness probes need a cheap call every 5-15 seconds, but pre-deployment validation and on-call diagnostics want the expensive one. Use /health for keep-alive, /ready for go/no-go.",
  },
  {
    q: "Does the same probe really run on Windows and macOS?",
    a: "Same trait, same return shape, different bodies. PlatformHealthCheck::check_health is implemented by WindowsHealthChecker in crates/terminator/src/platforms/windows/health.rs, which does the COM init plus UIAutomation walk described on this page. macOS today returns an optimistic Healthy result with a diagnostic note saying AX-level checks are not yet implemented, so on macOS you treat /ready as a liveness signal until that lands. The README and source are explicit about this, which is the right move; an honest stub beats a green light that lies.",
  },
  {
    q: "Why is the Windows check wrapped in a 5-second timeout?",
    a: "UIAutomation is COM, and COM calls can hang when another desktop session is paged out, the WinStation is locked, or a parked screensaver is owning the foreground. A 5-second tokio::time::timeout around the spawned blocking task means the worst case is one 503 with a clear error_message string, not a deadlocked probe that takes the readiness lane down with it. The duration that ships in check_duration_ms lets you alarm on slow probes long before they reach the timeout.",
  },
  {
    q: "Can I use /ready as a CI gate before a Playwright-style desktop suite runs?",
    a: "Yes, that is the canonical use. Start the agent on the runner, poll /ready until status is ready (or fail the job after N attempts), then start your scenario. On Windows the probe also writes is_headless to diagnostics; if you are running on a headless agent, you can choose to allow Degraded as success since enumeration in a headless session is its own can of worms. Treat 206 as a decision point, not an automatic fail.",
  },
  {
    q: "How is this different from running a sample script and seeing if it passes?",
    a: "A sample script verifies the script. /ready verifies the runtime that the script depends on. The distinction matters in two cases. First, when a real scenario takes 90 seconds, you want a sub-second gate before you start. Second, when a scenario fails, you want to know whether your locator is wrong or whether the automation runtime is actually broken on this machine. The three booleans give you that bisection for free.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    excerpt:
      "Why structural element lookups beat OCR and pixel matching for cross-platform automation.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Foundation",
  },
  {
    title: "Browser automation hits a desktop ceiling",
    excerpt:
      "The seven concrete moments Playwright goes silent, and the OS-level tool that takes over.",
    href: "/t/browser-automation-os-level-ceiling",
    tag: "Reference",
  },
  {
    title: "MCP desktop accessibility automation",
    excerpt:
      "How the MCP server gives Claude, Cursor, and VS Code real control over native apps.",
    href: "/t/mcp-desktop-accessibility-automation",
    tag: "Architecture",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
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
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
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
          __html: JSON.stringify(faqPageSchema(faqItems)),
        }}
      />

      <div className="mx-auto max-w-3xl px-5 pt-8 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="mx-auto max-w-3xl px-5 pb-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          Cross-platform desktop automation: how to verify the runtime is actually healthy before you click
        </h1>
        <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
          A scripted click that never lands costs you more than a test that fails fast. The fix is to verify the desktop automation runtime itself, on every platform, before any scenario starts. Terminator exposes that verify call as one HTTP endpoint, with one JSON shape on Windows and macOS.
        </p>
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </header>

      <section className="mx-auto max-w-3xl px-5 py-6">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <div className="text-xs font-medium uppercase tracking-wider text-orange-700">
            Direct answer (verified 2026-05-11)
          </div>
          <p className="mt-3 text-zinc-900 text-lg leading-relaxed">
            Hit the MCP agent at <code className="font-mono text-sm bg-white px-1.5 py-0.5 rounded">GET /ready</code>. It returns <strong>HTTP 200</strong> with <code className="font-mono text-sm">status: &quot;ready&quot;</code> when the platform accessibility API is up, the desktop root is reachable, and the tree enumerates. It returns <strong>206 Partial Content</strong> for degraded states and <strong>503 Service Unavailable</strong> when the API is unreachable. The body is identical on Windows and macOS: three booleans, a duration in milliseconds, an optional error string, and a diagnostics bag.
          </p>
          <p className="mt-3 text-sm text-zinc-600">
            Source:{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/health.rs"
              className="text-orange-700 underline"
            >
              crates/terminator/src/health.rs
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/main.rs"
              className="text-orange-700 underline"
            >
              crates/terminator-mcp-agent/src/main.rs
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          The contract is the same on both platforms
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Every platform implements one Rust trait, <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">PlatformHealthCheck</code>, and returns one shape, <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">HealthCheckResult</code>. The convenience function <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">check_automation_health()</code> picks the right implementation at compile time using <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">cfg(target_os = &quot;...&quot;)</code>. That is the part that makes cross-platform verify actually portable: a single client can poll one URL and reason about one JSON object regardless of whether the agent is sitting on Windows or macOS.
        </p>
        <div className="mt-6">
          <AnimatedChecklist
            title="What every HealthCheckResult tells you"
            items={componentChecks}
          />
        </div>
      </section>

      <ProofBanner
        quote="The endpoint maps three booleans to HTTP 200, 206, or 503. CI gates can use status codes; humans get the JSON."
        source="crates/terminator/src/health.rs"
        metric="200/206/503"
      />

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          What the call looks like in flight
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The CI runner hits one HTTP endpoint. Inside the process, the readiness handler calls the shared probe, which dispatches to the platform implementation, which talks to the native automation API. Every step is bounded.
        </p>
        <div className="mt-6">
          <SequenceDiagram
            title="GET /ready, end to end"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          The Windows probe is a five-step check with a hard timeout
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          On Windows the verify path is real work: COM init, UIAutomation construction, desktop root, enumeration, status rollup. The whole sequence runs inside <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">tokio::time::timeout(Duration::from_secs(5), ...)</code>, so a hung COM call returns a clean 503 with an error string instead of taking the readiness lane offline.
        </p>
        <div className="mt-6">
          <HorizontalStepper title="WindowsHealthChecker::check_health" steps={probeSteps} />
        </div>
        <p className="mt-6 text-sm text-zinc-600">
          File:{" "}
          <a
            href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/health.rs"
            className="text-orange-700 underline"
          >
            crates/terminator/src/platforms/windows/health.rs
          </a>
          . The timeout is on line 35, COM init around line 70, the UIAutomation construction around line 91, the root element retrieval around line 107. Headless detection lives in the same file via <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">is_headless_environment()</code> and surfaces in the diagnostics bag rather than silently failing the check.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          A healthy response, and an unhealthy one
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The body is small enough to read in one breath. On a working Windows session you get a 200 with three trues and a duration. On a wedged session you get a 503 with the timeout string.
        </p>
        <div className="mt-6">
          <TerminalOutput title="ready response on a healthy Windows agent" lines={readyResponse} />
        </div>
        <div className="mt-6">
          <TerminalOutput title="ready response when UIAutomation is unresponsive" lines={degradedResponse} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          What verify means on macOS today
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The MacOSHealthChecker in <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">health.rs</code> currently returns an optimistic Healthy result with a diagnostic note that reads <em>Accessibility API health checks not yet implemented</em>. That is the right behavior for a stub: it is honest, the field is in the JSON, and a caller that cares can branch on it. Until the AX-level probe lands, treat the macOS /ready response as a liveness signal that the agent is up and Cocoa is reachable, and rely on a small canary script (open a known app, query the AX tree of its window) for harder verification.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The two trapdoors that bite on macOS are TCC permissions and a non-interactive session. TCC denials show up as empty AX trees rather than errors, which is why the planned macOS probe will need to actually walk a known window, not just instantiate the AX client. The Linux branch in the same file has the same shape and the same honest TODO.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          How this changes your CI lane
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The shape of a desktop automation job becomes the same on both operating systems. Boot the agent, poll /ready until the rolled-up status is ready (or treat degraded as acceptable if you have made that call), then run the actual scenario. If a scenario then fails, you have a real bisect: was /ready healthy a moment before? If yes, the failure is in your selector or the app under test. If no, the runtime broke and the scenario was never going to pass. That bisect is the whole point.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The cost of adding this gate is negligible. The probe runs in a couple hundred milliseconds on a warm Windows runner, the timeout caps the worst case at five seconds, and a status-code check is one line of bash or one assertion in your test runner. The cost of not adding it is the class of flake that every long-lived desktop suite eventually accumulates, where one machine in the pool quietly degrades and every scenario fails for reasons that have nothing to do with the code under test.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Need this gate in your pipeline?"
          description="Walk me through your runner setup and we will sketch the exact /ready poll, the timeout, and the alarm thresholds for your platform mix."
        />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-10">
        <FaqSection items={faqItems} />
      </section>

      <section className="mx-auto max-w-5xl px-5 py-10">
        <RelatedPostsGrid
          title="Related guides"
          subtitle="More from Terminator on desktop automation internals."
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Walk through your verify and gate strategy with the maintainer."
      />
    </article>
  );
}
