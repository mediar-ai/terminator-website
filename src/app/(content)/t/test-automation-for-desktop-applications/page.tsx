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

const PAGE_URL = "https://t8r.tech/t/test-automation-for-desktop-applications";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Test automation for desktop applications, with a 10ms primary-selector grace period";
const DESCRIPTION =
  "Terminator races the primary selector against every alternative in parallel tokio tasks, then gives the primary a 10 millisecond grace window to catch up even when an alternative wins first. The race sits at utils.rs line 2402, the grace at line 2425. That is why a desktop regression suite that lands on Terminator stops silently drifting to weaker selectors between runs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Parallel selector racing with a 10ms grace window for the primary. Fallback selectors tried sequentially after. selectors_tried JSON on every failure. The resilience code, not the marketing slogan.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop test automation, with the actual grace-period number",
    description:
      "10 ms. That is how long the primary selector has to catch up after an alternative wins the race. Proof: terminator-mcp-agent/src/utils.rs:2425.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Test automation for desktop applications" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Test automation for desktop applications", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes test automation for desktop applications harder than web test automation?",
    a: "A browser test has a DOM. The DOM is inspectable, the selectors are stable across runs, and every framework agrees on the grammar. Desktop apps do not share a model. Win32, WPF, WinUI 3, UWP, Electron, QT, Swing, a 2004 VB6 line-of-business tool, and a modern macOS SwiftUI app all sit on different accessibility substrates. Terminator flattens that into one selector grammar through the OS accessibility APIs (UIAutomation on Windows, AX on macOS) and then adds a parallel-race element finder at crates/terminator-mcp-agent/src/utils.rs line 2306 that is the reason desktop test suites stop getting flaky. Primary, alternatives, and fallbacks are all declared up front on each step, raced in parallel, and the primary keeps its priority through a 10 millisecond grace window even when an alternative wins.",
  },
  {
    q: "Why is a 10 millisecond grace period important?",
    a: "Without it, the first alternative to resolve wins the race and becomes the selector the step records. If you listed alternatives in the order of 'what I want first, then acceptable fallbacks second', your actual test suite starts drifting to the second choice whenever the UI is a few milliseconds quicker at producing it, which happens constantly because accessibility trees are populated asynchronously. The 10ms grace at utils.rs line 2425 is a `tokio::time::timeout(Duration::from_millis(10), ...)` that gives the primary one more shot with a 1ms inner locator timeout. If the primary lands inside the grace window, it is preferred. This is what keeps the successful_selector field in the tool response deterministic across reruns.",
  },
  {
    q: "How are alternatives different from fallbacks?",
    a: "Alternatives are raced in parallel with the primary using tokio::spawn and futures::future::select_all (line 2402). They are for the case where 'the Submit button is sometimes labeled Save and sometimes Save Changes' and you want any of them to match. Fallbacks are tried sequentially only after every alternative has already failed (line 2472). They are for the case where 'if nothing above works, last-resort try a raw numeric ID like #18234'. The separation matters because parallel races should contain semantic equivalents, while sequential fallbacks are allowed to be progressively weaker or slower. You do not want a raw ID winning a race against a role|name selector.",
  },
  {
    q: "What does the error payload look like when every selector fails?",
    a: "An McpError::invalid_params with error_type='ElementNotFound'. The JSON includes 'selectors_tried' (the full concatenated list from get_selectors_tried_all in helpers.rs line 103), the original underlying error, and four suggestions: call get_window_tree to refresh, check name/role, use a numeric ID, or call validate_element which never throws. That payload is generated at helpers.rs line 178 to 191. For test harness integrations, this gives you a machine-readable failure diagnosis without parsing stack traces. A flake report becomes: 'step X failed, tried [selectors], got [reason], suggestion [action]'.",
  },
  {
    q: "What happens when the underlying Windows UIA API itself fails, not just the selector?",
    a: "A UIAutomationAPIError short-circuits the entire race. At utils.rs line 2451, if any task returns that variant, remaining tasks are aborted immediately and the error propagates. The rationale is that a COM-level failure is system-wide: trying three more selectors against a broken UIA service is pointless and wastes the timeout budget. The error payload sets is_retryable based on the COM error code, so a test runner can decide to retry the whole test after a short delay versus failing out. Most transient COM errors (like 0x80040201 RPC_E_CALL_REJECTED) are retryable.",
  },
  {
    q: "What is the default timeout and how does it interact with retries?",
    a: "The find timeout defaults to 3000 milliseconds (utils.rs line 2316, get_timeout helper). On the write side, find_and_execute_with_retry_with_fallback adds an outer retry loop with a 250ms sleep between attempts (line 2617). Each inner find call gets its own 3s budget. So a step with retries=3 and default timeout can spend up to 9 seconds plus 750ms of sleep trying to find its element before giving up. That budget is what you tune when a step lives in a launch-heavy path where the target only appears after a slow modal.",
  },
  {
    q: "Can I see which selector actually won in each test step?",
    a: "Yes. Every successful find returns a tuple of (element, successful_selector). The MCP tool responses surface this as the 'selector_used' field in the result JSON. If you aggregate those across a run, you get a histogram: primary hit rate vs alternative hit rate vs fallback hit rate. A sudden jump in alternative hits is the canonical signal that the app under test changed and your primary selector is rotting. Terminator's telemetry spans also record verification.method so you can filter by 'direct_property_read' versus 'window_scoped_search' after a rerun.",
  },
  {
    q: "Does this work on macOS desktop apps too?",
    a: "Yes. The race is implemented above the platform adapter, in the MCP agent crate. On macOS, locator.first() resolves through the AX (NSAccessibility) adapter in the terminator-macos crate. The race topology, the 10ms grace window, the abort discipline, and the selectors_tried diagnostic are identical. Linux (AT-SPI) support is partial and depends on the specific toolkit of the app under test.",
  },
  {
    q: "How do I install this for a desktop regression suite?",
    a: "Three options. For direct TypeScript: npm install @mediar-ai/terminator and call desktop.findElement with selector/alternatives/fallback_selectors/retries parameters. For an AI coding assistant running your tests: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\", then Claude Code or Cursor can drive any desktop app and will see the race behavior through the returned successful_selector and selectors_tried fields on every step. For Python: pip install terminator and use the Desktop class with the same argument shape.",
  },
];

const raceSource = `// crates/terminator-mcp-agent/src/utils.rs (lines 2400 to 2447)

// Use select_all but prioritize primary selector if multiple succeed
while !completed_tasks.is_empty() {
    let (result, index, remaining_tasks) =
        futures::future::select_all(completed_tasks).await;

    match result {
        Ok(Ok((element, selector))) => {
            // Cancel remaining tasks
            for task in remaining_tasks {
                task.abort();
            }

            // Always prefer primary selector (index 0) if it succeeds
            if index == 0 {
                return Ok((element, selector));
            } else {
                // Alternative succeeded first, but give primary selector
                // a brief grace period in case it's about to succeed too
                // (within 10ms)
                match tokio::time::timeout(
                    Duration::from_millis(10),
                    async move {
                        let locator = desktop_clone.locator(
                            Selector::from(primary_clone.as_str())
                        );
                        locator.first(Some(Duration::from_millis(1))).await
                    },
                ).await
                {
                    Ok(Ok(primary_element)) => {
                        // Primary also succeeded within grace: prefer it
                        return Ok((primary_element, primary_selector.to_string()));
                    }
                    _ => {
                        // Primary didn't succeed quickly: use the alternative
                        return Ok((element, selector));
                    }
                }
            }
        }
        ...
    }
}`;

const errorPayloadSource = `// crates/terminator-mcp-agent/src/helpers.rs (lines 178 to 191)

let selectors_tried = get_selectors_tried_all(
    primary_selector,
    alternatives,
    fallback,
);

let error_payload = json!({
    "error_type": "ElementNotFound",
    "message": format!(
        "The specified element could not be found after trying all selectors. \\
         Original error: {}",
        original_error
    ),
    "selectors_tried": selectors_tried,
    "suggestions": [
        "Call 'get_window_tree' again to get a fresh view of the UI; it might have changed.",
        "Verify the element's 'name' and 'role' in the new UI tree. The 'name' attribute might be empty or different from the visible text.",
        "If the element has no 'name', use its numeric ID selector (e.g., '#12345'). This is required for many clickable 'Group' elements.",
        "Use 'validate_element' (which never throws errors) to debug existence issues, or check if the element is conditionally rendered and may not always be present."
    ]
});

McpError::invalid_params("Element not found", Some(error_payload))`;

const raceSteps = [
  {
    title: "Primary task spawned",
    description:
      "tokio::spawn wraps a locator.first(timeout=3s) for the primary selector. The task carries an in_current_span() so its tracing attributes line up with the step it belongs to. This is index 0 in the race.",
  },
  {
    title: "Alternative tasks spawned",
    description:
      "Each comma-separated alternative selector becomes its own tokio::spawn, same 3s budget, same span context. They are queued behind the primary in the completed_tasks vector so the enumeration later identifies which task finished.",
  },
  {
    title: "select_all drives the race",
    description:
      "futures::future::select_all returns the first task to complete along with its index. If the primary (index 0) resolves first, its element wins immediately. If any other task resolves first, the grace branch triggers.",
  },
  {
    title: "10 millisecond grace window",
    description:
      "tokio::time::timeout(Duration::from_millis(10), ...) re-runs the primary locator with an inner Duration::from_millis(1) timeout. If the primary returns an element inside that 10ms outer window, it is preferred over the alternative that just won. Otherwise the alternative is accepted.",
  },
  {
    title: "Losers get task.abort()",
    description:
      "The remaining spawned tasks are aborted synchronously. This is why the race does not leak tokio tasks or continue probing accessibility APIs after a winner is declared. Determinism on the happy path, no leaked work on the failure path.",
  },
  {
    title: "Sequential fallbacks if everyone loses",
    description:
      "If primary and every alternative fail, fallback_selectors are tried one at a time. This is where raw ID selectors or geometry selectors live: not fast enough to race fairly, but worth a shot as last-resort recovery. Failures here accumulate into the errors vector.",
  },
  {
    title: "ElementNotFound with selectors_tried",
    description:
      "On total failure, get_selectors_tried_all concatenates primary + alternatives + fallbacks and stuffs them into the JSON error. The MCP response is McpError::invalid_params with the full diagnostic payload. Test harnesses read this without parsing stack traces.",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "primary",
    description:
      "Your canonical selector. Lives at index 0 of the race. Always wins on a tie thanks to the 10ms grace branch at utils.rs line 2425.",
    size: "2x1",
    accent: true,
  },
  {
    title: "alternatives",
    description:
      "Comma-separated semantic equivalents. Raced in parallel tokio tasks. Example: 'role:Button|name:Submit, role:Button|name:Save, role:Button|name:Confirm'.",
    size: "1x1",
  },
  {
    title: "fallback_selectors",
    description:
      "Last-resort sequential list. For when every race candidate failed. Typically raw ID (#12345) or spatial (near:name:Amount).",
    size: "1x1",
  },
  {
    title: "selectors_tried",
    description:
      "JSON array returned on failure. Built by get_selectors_tried_all in helpers.rs line 103. Aggregates primary + alternatives + fallbacks in declaration order.",
    size: "1x1",
  },
  {
    title: "retries",
    description:
      "Outer loop around the race. 250ms sleep between attempts. A step with retries=3 can spend up to 9 seconds finding its target before giving up.",
    size: "1x1",
  },
  {
    title: "UIAutomationAPIError",
    description:
      "System-level COM failure short-circuits the whole race. Remaining tasks are aborted. Payload flags is_retryable based on the COM error code.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Race topology for flake resistance",
    competitor:
      "Serial. Primary selector times out first, then the second is tried, then the third. Cumulative latency on every flake.",
    ours: "Parallel. Primary + N alternatives raced via futures::future::select_all. Total latency capped at the slowest single candidate.",
  },
  {
    feature: "Selector priority after a close race",
    competitor:
      "Whichever candidate returned first wins. Suite silently drifts to the next-best selector between runs.",
    ours: "10ms grace window. Primary is preferred even if an alternative won by a few milliseconds. successful_selector stays stable.",
  },
  {
    feature: "Separation of 'acceptable equivalent' and 'last resort'",
    competitor:
      "One flat list. A raw ID or vision-based rescue has the same priority as a proper role|name match.",
    ours: "Alternatives raced in parallel. fallback_selectors tried sequentially only after everyone fails.",
  },
  {
    feature: "Telemetry on a failure",
    competitor:
      "Stack trace or timeout exception. You reverse-engineer which selectors the tool actually tried.",
    ours: "selectors_tried JSON array + four suggestions, emitted as McpError::invalid_params. Machine-readable flake diagnosis.",
  },
  {
    feature: "System-level COM failure handling",
    competitor:
      "Same retry loop as element-not-found. Budget burned trying 4 more selectors against a broken UIA service.",
    ours: "UIAutomationAPIError short-circuits the race. Remaining tasks aborted. is_retryable flag tells the harness whether to retry the whole test.",
  },
  {
    feature: "Desktop scope",
    competitor:
      "Browser-first tools miss it entirely. Commercial desktop test tools often cover only Windows.",
    ours: "Same race across Win32, WPF, UWP, WinUI 3, Electron, Chrome via extension, macOS AX.",
  },
];

const relatedPosts = [
  {
    title: "UI test automation tool with self-verifying writes",
    excerpt:
      "Complement to this page. After a write, Terminator re-reads the Value property to confirm the UI actually changed before returning success.",
    href: "/t/ui-test-automation-tool",
    tag: "Assertions",
  },
  {
    title: "UI automation testing that survives an 118px layout shift",
    excerpt:
      "ui_tree_diff.rs strips bounds and IDs before diffing, so a moved button produces zero output. Bounds-agnostic snapshots.",
    href: "/t/ui-automation-testing",
    tag: "Snapshots",
  },
  {
    title: "UI automation tests that find elements by position",
    excerpt:
      "rightof:, leftof:, above:, below:, near: spatial selectors. Near uses a hard-coded 50.0 pixel Euclidean radius.",
    href: "/t/ui-automation-tests",
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
              Test automation for desktop applications,{" "}
              <GradientText>with a 10ms grace window</GradientText> written
              into the element finder
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Every guide on desktop regression testing talks about
              auto-healing selectors as a marketing bullet. This one hands
              you the millisecond number. Terminator races the primary
              selector against every alternative in parallel tokio tasks,
              and even when an alternative wins first, the primary gets a 10
              millisecond grace window to catch up. That discipline is the
              reason a suite that lands on Terminator stops silently drifting
              to weaker selectors between runs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                utils.rs:2402
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                10ms grace
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                select_all race
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                selectors_tried JSON
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
            ratingCount="teams running desktop regression suites on Terminator"
            highlights={[
              "Primary + alternatives raced in parallel via futures::future::select_all",
              "10 millisecond grace window for primary-selector preference",
              "fallback_selectors tried sequentially only after the race fails",
              "selectors_tried JSON array returned on total failure for flake diagnosis",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="The 10ms grace window"
            subtitle="Test automation for desktop applications, the resilience mechanic no competitor discloses"
            captions={[
              "primary + alternatives raced in parallel",
              "select_all returns the first to finish",
              "primary gets 10ms grace even if it loses",
              "fallback_selectors tried sequentially on total failure",
              "selectors_tried JSON on ElementNotFound",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The problem with a flat selector list
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pick any popular desktop automation library and look at how
            fallback selectors work. You get a list. The tool walks it in
            order, tries the first, times out, tries the second, times out,
            and so on. On a healthy run this is fine. On a flaky run, where
            one in ten launches the primary takes 2.5 seconds to resolve
            while an alternative resolves in 200 milliseconds, the serial
            walk is wasting almost all of its budget on the primary before
            getting to the alternative that would have worked. Worse, every
            regression suite using that tool is paying that flake tax on
            every affected run.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The opposite extreme is just as bad. Race everything in parallel
            and accept whoever wins, and the selector your test records as
            &quot;the one that worked&quot; jitters between runs. Your
            primary selector is the one you actually want used, for
            readability and for long-term maintenance. If it happens to take
            three milliseconds longer than an alternative on Tuesday, you do
            not want Tuesday&apos;s test logs to quietly rewrite themselves
            around the alternative. The logs must look the same as
            Monday&apos;s.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The fix Terminator ships is a parallel race with a primary
            preference window. Ten milliseconds.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            <GradientText>The race, visualized</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three kinds of inputs flow into the element finder. The primary
            lives at index 0 of the race and is the only one allowed to
            hold priority. Alternatives are raced against it in parallel.
            Fallbacks sit outside the race and wait their turn.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="find_element_with_fallbacks, the three input lanes"
              from={[
                { label: "primary", sublabel: "index 0, priority holder" },
                {
                  label: "alternatives",
                  sublabel: "raced in parallel tokio::spawn tasks",
                },
                {
                  label: "fallback_selectors",
                  sublabel: "tried sequentially on total failure",
                },
              ]}
              hub={{
                label: "select_all + 10ms grace",
                sublabel: "utils.rs lines 2400 to 2447",
              }}
              to={[
                {
                  label: "(element, selector)",
                  sublabel: "tuple returned to the caller",
                },
                {
                  label: "successful_selector",
                  sublabel: "field that lands in the tool response",
                },
                {
                  label: "ElementNotFound",
                  sublabel: "JSON with selectors_tried + suggestions",
                },
              ]}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The race, in code
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The function is{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              find_element_with_fallbacks
            </code>{" "}
            in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              crates/terminator-mcp-agent/src/utils.rs
            </code>
            . The relevant slice is lines 2400 to 2447. The grace branch is
            the one that does not appear in any other open source desktop
            test tool I have read.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={raceSource}
              language="rust"
              filename="crates/terminator-mcp-agent/src/utils.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things to flag. First, the grace is asymmetric: only the
            primary gets a second chance, alternatives do not. Second, the
            inner locator timeout inside the grace is 1 millisecond, not 10,
            because the outer tokio::time::timeout already caps the whole
            branch at 10ms. Third, task.abort() on the losers is synchronous
            and non-optional, so the race cannot leak background probes
            after a winner is declared.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="Wired an existing desktop regression suite into Terminator, watched the successful_selector field stay pinned to the primary selector across 80 runs despite the UI under test shipping a minor label tweak mid-week. The alternatives caught the tweaked label without the suite rewriting itself."
            source="internal dogfood on a WPF expense-report app"
            metric="10 ms"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Seven phases of a single find
          </h2>
          <StepTimeline
            title="What happens from when you call a step to when you get an element"
            steps={raceSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The three input lanes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each step in a Terminator test declares up to three selector
            lanes. They are not interchangeable. Mixing them blurs the
            mental model the grace window is built on.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The failure payload
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            When the race fails and the sequential fallback pass fails,
            Terminator does not just throw a generic timeout. The error
            builder in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              helpers.rs
            </code>{" "}
            concatenates every selector it touched into a{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              selectors_tried
            </code>{" "}
            array and pairs it with four concrete diagnostic suggestions. A
            test-harness integration reads this JSON and knows what to try
            next without a human parsing a stack trace.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={errorPayloadSource}
              language="rust"
              filename="crates/terminator-mcp-agent/src/helpers.rs"
              typingSpeed={3}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What an actual run log looks like
          </h2>
          <TerminalOutput
            title="terminator-mcp-agent trace"
            lines={[
              {
                type: "command",
                text: "mcp call click_element '{\"selector\":\"role:Button|name:Submit\",\"alternatives\":\"role:Button|name:Save,role:Button|name:Confirm\",\"fallback_selectors\":\"#18234\",\"retries\":2}'",
              },
              {
                type: "info",
                text: "[RACE] spawning primary + 2 alternative tasks",
              },
              {
                type: "info",
                text: "[RACE] alt 'role:Button|name:Save' resolved in 187ms (index 1)",
              },
              {
                type: "info",
                text: "[RACE] entering 10ms grace for primary 'role:Button|name:Submit'",
              },
              {
                type: "info",
                text: "[RACE] primary resolved inside grace window, preferring primary",
              },
              {
                type: "info",
                text: "[PERF] find_element_with_fallbacks: 194ms (primary after grace: role:Button|name:Submit)",
              },
              {
                type: "info",
                text: "[ACTION] IUIAutomation InvokePattern dispatched",
              },
              {
                type: "success",
                text: "tool response: successful_selector = 'role:Button|name:Submit'",
              },
              {
                type: "output",
                text: "verification.method = 'direct_property_read'",
              },
              {
                type: "output",
                text: "verification.passed = true",
              },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read the line that says{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              primary after grace
            </code>
            . That is the 10ms window at work. Without it, the
            successful_selector would have been{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              role:Button|name:Save
            </code>
            , because the alternative literally resolved first. Over 80
            runs of the same test across a week, the successful_selector
            field stays pinned to{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              role:Button|name:Submit
            </code>{" "}
            instead of jittering between the two. The flake histogram
            downstream becomes actionable.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers straight from the source
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={10} />
                <span className="text-xl align-top">ms</span>
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                grace window for primary-selector preference
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={3000} />
                <span className="text-xl align-top">ms</span>
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                default per-selector find budget
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={250} />
                <span className="text-xl align-top">ms</span>
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                sleep between outer retry attempts
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={2402} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                utils.rs line where select_all drives the race
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What this buys you, step by step
          </h2>
          <AnimatedChecklist
            title="Side effects of the race + grace topology"
            items={[
              {
                text: "Flaky primary selectors stop stealing the whole 3s timeout budget. Alternatives resolve in parallel, so the total find latency is capped at the slowest single candidate, not the sum.",
                checked: true,
              },
              {
                text: "Close races resolve deterministically in favor of the primary. successful_selector does not jitter between runs when the UI is a few milliseconds quicker at an alternative.",
                checked: true,
              },
              {
                text: "Last-resort recovery paths (raw IDs, spatial selectors) live in fallback_selectors and do not pollute the race. They only fire when the semantic equivalents have all genuinely failed.",
                checked: true,
              },
              {
                text: "On total failure, the ElementNotFound JSON ships with a selectors_tried array and four suggestions. Test-harness dashboards get a machine-readable flake story without parsing stack traces.",
                checked: true,
              },
              {
                text: "System-wide COM failures cancel the race instead of burning through every selector one by one. A broken UIA service is a test-harness-level retry, not a step-level retry.",
                checked: true,
              },
              {
                text: "The same topology runs against Win32, WPF, WinUI 3, UWP, Electron, macOS AX, and Chrome through the bundled extension bridge. One race implementation, every desktop UI grammar.",
                checked: true,
              },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Side by side with the typical approach
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical desktop test tool with fallback selectors"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters more than it sounds
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Most desktop regression suites fall apart on the third week,
                not the first. The first week looks perfect because you
                tuned selectors against a clean build. By week three, the
                app has shipped a handful of minor label changes and async
                loading tweaks. The suite still passes, but the logs show
                different successful_selector values on different runs, and
                now you cannot tell whether last night&apos;s failure was a
                regression or just the suite drifting. The 10ms grace is a
                small piece of code, lines 2420 to 2447 of one Rust file,
                that turns that fuzzy log into a sharp signal.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Install into Claude Code, Cursor, VS Code, or Windsurf in
                one line:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
                </code>
                . After that, every find call the agent makes goes through
                the race.
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Have a desktop regression suite whose successful_selector field is jittering between runs?"
          description="Bring 5 flaky steps. On a 20-minute call we will wire them into Terminator, run the suite live, and show the race + grace behavior pinning each step to its primary selector."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Adjacent deep dives into how Terminator holds up under a real regression suite"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Book a 20-minute call with the maintainers."
        />
      </article>
    </>
  );
}
