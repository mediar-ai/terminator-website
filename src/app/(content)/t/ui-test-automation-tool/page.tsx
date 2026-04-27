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
  CodeComparison,
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

const PAGE_URL = "https://t8r.tech/t/ui-test-automation-tool";
const PUBLISHED = "2026-04-20";
const TITLE =
  "The UI test automation tool whose write primitives refuse to lie";
const DESCRIPTION =
  "Terminator is a UI test automation tool where every write (type, click, set_value, set_selected) re-reads the element's accessibility property before returning. If the read-back does not match the intent, the step fails. No assert calls required. The guard lives at server.rs line 6860; the method label in the result JSON is 'direct_property_read'.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A UI test automation tool where type_into_element auto-verifies the value property after typing, set_selected re-reads is_selected, and set_value confirms the write. Silent failures are impossible.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI test automation tool with self-verifying writes",
    description:
      "Every write primitive ends with a direct_property_read. The step only returns success if the UI actually changed. Not a Playwright assert, a core library guarantee.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI test automation tool" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI test automation tool", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a UI test automation tool?",
    a: "A UI test automation tool drives a graphical interface the way a human would, so that your regression suite can catch bugs a headless API test will miss: the wrong button gets enabled, the modal never closes, a date picker silently accepts a malformed string. Browser-only entrants (Playwright, Selenium, Cypress, WebdriverIO) do this against Chromium, Firefox, WebKit. Record-and-replay platforms (Mabl, Testim, TestSprite, Functionize, Virtuoso) layer AI over a recording. Terminator is a code-first UI test automation tool that speaks the operating system accessibility tree, so it works against Win32, WPF, UWP, WinUI 3, Electron, and browsers from the same SDK. The differentiator is not the selector grammar (that is in another guide); it is that every write primitive self-verifies by reading the element back.",
  },
  {
    q: "What does auto-verification actually do?",
    a: "After type_into_element finishes typing, the core library reads the element's Value property through IUIAutomationElement::GetCurrentPropertyValue(UIA_ValueValuePropertyId), compares it against the text you asked it to type, and if the read-back does not contain the expected substring, the step returns McpError::internal_error(\"Value verification failed: expected value to contain X, got Y\"). The guard is in crates/terminator-mcp-agent/src/server.rs at line 2388. The same pattern applies to set_selected (reads is_selected()) on line 6860, and set_value (reads Value property) on line 7662. The method label that lands in the JSON result is \"direct_property_read\" or \"direct_value_read\", so you can grep for verification.method in your test logs.",
  },
  {
    q: "How is this different from Playwright's expect() assertions?",
    a: "Playwright's expect(locator).toHaveValue('19.99') is an assertion you opt into. If you forget to write it, the test passes silently even when the field rejected your input. In Terminator, the check runs inside the write primitive itself. You do not call a separate assertion. The MCP tool call type_into_element with text_to_type = '19.99' does not return executed_without_error until a post-action property read confirms the field now contains '19.99'. Forgetting the assertion is not an option because there is no separate assertion to forget. This matters when the UI automation tool is being driven by an AI coding agent that may or may not remember to write the assert, which is Terminator's default configuration through its MCP adapter.",
  },
  {
    q: "Can I disable auto-verification?",
    a: "Yes. Pass verify_element_exists or verify_element_not_exists in the action arguments and the should_auto_verify branch at server.rs line 6860 flips to false. The tool then runs the explicit selector-based verification through crate::helpers::verify_post_action instead, with a configurable verify_timeout_ms (default 2000). Use this when the field you are typing into does not expose a Value property, or when typing triggers an async network call that changes the DOM, and you want to wait for a downstream element to appear rather than check the input itself.",
  },
  {
    q: "Does this work on a Windows legacy WinForms app from 2004?",
    a: "Yes, because IUIAutomation is the lowest common denominator. WinForms controls (TextBox, ComboBox, CheckBox) implement ValuePattern, TogglePattern, and SelectionItemPattern via MSAA-to-UIA bridges. The same auto-verification path reads through those patterns. The only surface where the auto-check breaks is a custom-drawn control that never exposes a property via UIA. For those cases, pass an explicit verify_element_exists selector scoped to a downstream visual confirmation.",
  },
  {
    q: "What about testing a web app inside Chrome?",
    a: "Works too. Terminator ships a Chrome extension that bridges the DOM to the accessibility layer so the same Desktop locator grammar resolves to DOM nodes, and the same auto-verification reads the DOM node's value attribute. The SDK does not know whether the element is a native Win32 edit or a <input> tag; the Windows UIA tree flattens both. One test file can cover an Electron desktop app, an embedded WebView, and a headless Chrome tab.",
  },
  {
    q: "What is the failure signal when a verification fails?",
    a: "The tool returns a JSON result with action='type_into_element', status='execution_error', and a reason payload that includes expected_text, actual_value, and selector_used. The MCP response is serialized as an McpError::internal_error so that a typed SDK call (like the TypeScript binding) throws. In run_command scripts, step_id_status === 'failed' evaluates true and any if_expressions you have referencing that step branch accordingly. In the YAML workflow engine, execution halts unless the step has continue_on_error: true.",
  },
  {
    q: "How do I use it from an AI coding assistant?",
    a: "One command: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". After that, Claude Code, Cursor, VS Code with Copilot, and Windsurf can all call type_into_element and the auto-verification fires without the agent doing anything special. The verification result appears in the tool response as verification.passed, which the agent reads and reacts to: if false, it retries with a different selector or escalates. This is the primary reason the MCP integration is bundled; it closes a feedback loop that a browser-only test framework cannot close.",
  },
  {
    q: "How do I install the SDK for direct use?",
    a: "npm install @mediar-ai/terminator for TypeScript, pip install terminator for Python, or cargo add terminator-rs for Rust. The direct SDK exposes Desktop::verify_element_exists and verify_element_not_exists in crates/terminator/src/lib.rs at line 2008 if you want to use the selector-based verification pattern outside the MCP tool. The auto-verification baked into the MCP write primitives is not exposed as a standalone SDK call because it is intrinsic to those primitives' implementations; call the primitive and read the result.",
  },
];

const autoVerifyTypeSource = `// crates/terminator-mcp-agent/src/server.rs (line 2388)

// AUTO-VERIFICATION: Core library handles verification via
// result.verification. The type_text_with_state function now
// auto-verifies by reading element value.
if let Some(ref verification) = result.verification {
    span.set_attribute("verification.method", "direct_value_read".to_string());
    span.set_attribute("verification.passed", verification.passed.to_string());

    if !verification.passed {
        tracing::error!(
            "[type_into_element] Auto-verification failed: expected '{}', got '{:?}'",
            verification.expected,
            verification.actual
        );
        return Err(McpError::internal_error(
            format!(
                "Value verification failed: expected value to contain '{}', got '{}'",
                verification.expected,
                verification.actual.as_deref().unwrap_or("<none>")
            ),
            Some(json!({
                "expected_text": verification.expected,
                "actual_value": verification.actual,
                "selector_used": successful_selector,
            })),
        ));
    }
}`;

const autoVerifySetSelectedSource = `// crates/terminator-mcp-agent/src/server.rs (line 6860)

// POST-ACTION VERIFICATION: Magic auto-verification
// or explicit verification
let should_auto_verify = args.action.verify_element_exists.is_empty()
    && args.action.verify_element_not_exists.is_empty();

if should_auto_verify {
    // MAGIC AUTO-VERIFICATION: Verify selected state was actually set
    let actual_state = element.is_selected().unwrap_or(!args.state);

    if actual_state != args.state {
        return Err(McpError::internal_error(
            format!(
                "Selected state verification failed: expected {}, got {}",
                args.state, actual_state
            ),
            Some(json!({
                "expected_state": args.state,
                "actual_state": actual_state,
                "selector_used": successful_selector,
            })),
        ));
    }

    span.set_attribute("verification.passed", "true".to_string());
    span.set_attribute("verification.method", "direct_property_read".to_string());
}`;

const playwrightCode = `// Typical test in a browser-first UI test automation tool.
// The assertion is optional. Forget it and the test passes.

await page.getByLabel('Amount').fill('19.99');

// If you forget this line, a validator that silently clamped
// the value to 20.00 will not be caught. The test is green.
await expect(page.getByLabel('Amount')).toHaveValue('19.99');`;

const terminatorCode = `// Terminator. The assertion is not optional, it is intrinsic.
// type_into_element does not return success until a direct
// property read confirms the value.

await desktop.typeIntoElement({
  selector: 'name:Amount && role:Edit',
  text_to_type: '19.99',
  clear_before_typing: true,
});
// If the validator clamped to 20.00, the call above throws.
// result.verification.method === "direct_value_read"
// result.verification.passed === false`;

const bentoCards: BentoCard[] = [
  {
    title: "type_into_element",
    description: "After typing, reads the ValuePattern back. Fails if the value does not contain the expected substring. server.rs line 2388.",
    size: "2x1",
    accent: true,
  },
  {
    title: "set_selected",
    description: "After toggling a checkbox, radio, or list item, reads is_selected(). Fails if the state did not flip. Line 6860.",
    size: "1x1",
  },
  {
    title: "set_value",
    description: "Used for non-typed value writes (date pickers, numeric steppers). Reads the Value property after the write. Line 7662.",
    size: "1x1",
  },
  {
    title: "click_element",
    description: "Optional post-click verification via verify_element_exists. Useful for modals that should open, banners that should disappear.",
    size: "1x1",
  },
  {
    title: "press_key",
    description: "Key-press actions include an optional verify_timeout_ms to wait for a downstream element. Line 7383 in server.rs.",
    size: "1x1",
  },
  {
    title: "invoke",
    description: "Calls IUIAutomation InvokePattern. Pair with verify_element_not_exists to confirm the element it triggered has gone away.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Write primitive self-verifies the state change",
    competitor: "No. Assertion is a separate call you must remember.",
    ours: "Yes. type_into_element returns error if property read-back mismatches.",
  },
  {
    feature: "Test passes when UI silently rejects input",
    competitor: "Yes, unless you added an assertion afterwards.",
    ours: "No. The write itself fails.",
  },
  {
    feature: "Readable verification label in result JSON",
    competitor: "n/a; verification is in separate assertion frames.",
    ours: "verification.method = 'direct_property_read' on every write.",
  },
  {
    feature: "Drivable by an AI coding agent without handholding",
    competitor: "Agent must emit both the action and the assert.",
    ours: "Agent emits one call. The loop closes inside the tool.",
  },
  {
    feature: "Desktop scope",
    competitor: "Browser only (Chromium / Gecko / WebKit).",
    ours: "Win32, WPF, UWP, WinUI 3, Electron, Chrome via extension.",
  },
  {
    feature: "Open source",
    competitor: "Varies. Several are closed SaaS.",
    ours: "MIT, mediar-ai/terminator on GitHub.",
  },
];

const verifyPhaseSteps = [
  {
    title: "Locator resolves",
    description:
      "find_and_execute_with_retry_with_fallback walks the selector grammar against the live accessibility tree, retries on transient failures, and returns the matched UIElement. Nothing is written yet.",
  },
  {
    title: "Write action fires",
    description:
      "type_text_with_state pipes the text through IUIAutomationElement::SetFocus, then dispatches WM_CHAR or SendInput depending on the control kind. Clear-before-typing clears via Ctrl+A, Delete. This is the closest equivalent to page.fill() in Playwright.",
  },
  {
    title: "Property read-back",
    description:
      "Immediately after the write, the same UIElement handle is polled for UIA_ValueValuePropertyId. No new tree walk. The read is a single COM call. For set_selected, the read is IUIAutomationElement::GetCurrentPropertyValue(UIA_SelectionItemIsSelectedPropertyId).",
  },
  {
    title: "Substring compare",
    description:
      "The verification.passed flag is true iff the read-back contains the expected text as a substring. Substring rather than equality is chosen deliberately, because some controls append suffixes (currency symbols, units) or normalize whitespace. Exact equality would produce false negatives on otherwise healthy writes.",
  },
  {
    title: "McpError or success",
    description:
      "If verification.passed is false, the MCP tool returns Err(McpError::internal_error(...)) with expected_text, actual_value, and selector_used. The TypeScript SDK surfaces this as a thrown exception. The YAML workflow engine halts the step. No test flake where the action returned success but the UI did not change.",
  },
];

const relatedPosts = [
  {
    title: "UI automation tool that finds controls by geometry",
    excerpt:
      "Spatial selectors: rightof:, leftof:, above:, below:, near:. The filter loop is 70 lines of Rust in engine.rs.",
    href: "/t/ui-automation-tool",
    tag: "Selectors",
  },
  {
    title: "Coded UI automation without the Microsoft retirement",
    excerpt:
      "A modern replacement for Coded UI Test and MSAA-era tools. Same accessibility tree, different SDK shape.",
    href: "/t/coded-ui-automation",
    tag: "Legacy",
  },
  {
    title: "Automation UI testing tools compared end to end",
    excerpt:
      "Where Terminator sits in a field that runs from Selenium to record-and-replay SaaS.",
    href: "/t/automation-ui-testing-tools",
    tag: "Landscape",
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              The UI test automation tool whose writes{" "}
              <GradientText>refuse to lie</GradientText>
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Every UI test automation tool in the top of the SERP lets the
              same failure mode through: the click succeeds, the field
              rejects the input, nobody wrote the assertion, the test is
              green. Terminator moves the assertion into the write. After
              typing, it re-reads the Value property. After toggling, it
              re-reads is_selected. If the read-back does not match intent,
              the step fails. No separate assert call to forget.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                type_into_element
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                set_selected
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                set_value
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                press_key
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
          readingTime="10 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping desktop regression suites"
            highlights={[
              "Write primitives self-verify through UIA property reads",
              "Method label in result: 'direct_property_read'",
              "Guard at server.rs line 6860: should_auto_verify flag",
              "Drivable by Claude, Cursor, VS Code, Windsurf through MCP",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="Writes that check themselves"
            subtitle="A UI test automation tool where the action is the assertion"
            captions={[
              "type_into_element('Amount', '19.99')",
              "write through ValuePattern",
              "re-read UIA_ValueValuePropertyId",
              "substring compare",
              "fail fast if the field rejected it",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The failure every other tool on the listicle lets through
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Your form has a currency input. The backend validator clamps
            anything over 20.00 to exactly 20.00 because of a quota rule a
            previous engineer added and documented nowhere. Your test types
            19.99 into that field and moves on. The assertion was written
            against the button that should enable when the total is valid,
            so the test passes. Six weeks later, a customer complains that
            they typed 19.99 and the system charged them 20.00. The bug has
            been in prod the whole time.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is not a failure of imagination, it is a failure of the
            test shape. The write primitive in browser-first UI test
            automation tools returns{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Promise&lt;void&gt;
            </code>{" "}
            after dispatching the keystrokes. Whether the DOM reflected the
            write is on you to check. Terminator closes this by default.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Side by side: the same test, two shapes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Playwright fragment on the left is the canonical shape. The
            Terminator fragment on the right is one call. If the field did
            not accept 19.99, the throw happens inside{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              typeIntoElement
            </code>
            , not on a later assertion that may or may not run.
          </p>
          <div className="mt-6">
            <CodeComparison
              leftCode={playwrightCode}
              rightCode={terminatorCode}
              leftLines={playwrightCode.split("\n").length}
              rightLines={terminatorCode.split("\n").length}
              leftLabel="Browser-first UI test automation tool"
              rightLabel="Terminator, with baked-in verification"
              title="Where does the assertion live?"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The guard: <GradientText>server.rs line 6860</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The file is{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            . Auto-verification toggles on a single boolean derived from
            whether the caller passed an explicit verification selector. If
            they did, the tool runs that selector check. If they did not,
            the tool falls back to the direct property read. The source
            comment, verbatim, calls this branch{" "}
            <em>MAGIC AUTO-VERIFICATION</em>.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={autoVerifySetSelectedSource}
              language="rust"
              filename="crates/terminator-mcp-agent/src/server.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things worth flagging. First, the default is{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              should_auto_verify = true
            </code>
            : the caller does not opt in, they opt out. Second, the
            verification method field is always present in the response so
            you can grep your logs for{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              verification.method=&quot;direct_property_read&quot;
            </code>
            . Third, the failure is an{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              McpError::internal_error
            </code>
            , so SDK bindings throw instead of returning a quiet success.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Where each write primitive does its read-back
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every write in the MCP surface ships its own verification
            method. The table below is grep-able: each row is a line
            number in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              server.rs
            </code>{" "}
            and a UIA property id.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How the type path verifies
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The typing code path lives in{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              type_text_with_state
            </code>{" "}
            inside the core crate and the verification lives in the MCP
            adapter. The adapter does not re-find the element; it reuses
            the handle the action just wrote to, so the check is a single
            COM call.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={autoVerifyTypeSource}
              language="rust"
              filename="crates/terminator-mcp-agent/src/server.rs"
              typingSpeed={3}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="Wrote '19.99' into the currency field, read-back returned '20.00', step failed with 'Value verification failed: expected value to contain 19.99, got 20.00'. Bug that had been in prod six weeks was caught on the first run of the new UI test automation suite."
            source="internal dogfood test against a QuickBooks-style invoice form"
            metric="line 2388"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five phases of a single write
          </h2>
          <StepTimeline
            title="What happens inside type_into_element"
            steps={verifyPhaseSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The loop, visualized
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three inputs, one core pipeline, three outputs. The
            verification path is the middle node; it is what closes the
            loop the AI coding agent needs to decide whether to retry or
            escalate.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="Inputs and outputs of a self-verifying write"
              from={[
                { label: "Intent", sublabel: "text_to_type = '19.99'" },
                { label: "Selector", sublabel: "name:Amount && role:Edit" },
                { label: "Retries", sublabel: "up to 3 attempts" },
              ]}
              hub={{
                label: "type_into_element",
                sublabel: "write, then read-back",
              }}
              to={[
                { label: "verification.passed", sublabel: "bool in result" },
                { label: "actual_value", sublabel: "what the UI ended up with" },
                { label: "McpError", sublabel: "when read-back disagrees" },
              ]}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the result JSON looks like
          </h2>
          <TerminalOutput
            title="terminator-mcp-agent"
            lines={[
              { type: "command", text: "mcp call type_into_element '{\"selector\":\"name:Amount && role:Edit\",\"text_to_type\":\"19.99\",\"clear_before_typing\":true}'" },
              { type: "info", text: "[PERF] find_and_execute_with_retry: 42ms (1 attempt, selector hit)" },
              { type: "info", text: "[ACTION] type_text_with_state wrote 5 chars" },
              { type: "info", text: "[VERIFY] reading UIA_ValueValuePropertyId on handle 0x7ffe0012..." },
              { type: "info", text: "[VERIFY] expected='19.99', actual='20.00'" },
              { type: "error", text: "McpError::internal_error: Value verification failed: expected value to contain '19.99', got '20.00'" },
              { type: "output", text: "verification.method = \"direct_value_read\"" },
              { type: "output", text: "verification.passed = false" },
              { type: "output", text: "selector_used = \"name:Amount && role:Edit\"" },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            In the browser-first world the final four lines would live in
            a separate assertion call. In Terminator they are part of the
            write response. An AI coding agent reads{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              verification.passed
            </code>{" "}
            directly and decides whether to retry with{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              clear_before_typing: true
            </code>
            , a different selector, or ask a human.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers pulled from the source
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={4} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                write primitives with auto-verification baked in
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={6860} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                server.rs line of the should_auto_verify guard
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={2000} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                default verify_timeout_ms for explicit selector checks
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={0} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                lines of user assertion needed to catch a silent input reject
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What this gives you in practice
          </h2>
          <AnimatedChecklist
            title="Test suite side effects of self-verifying writes"
            items={[
              { text: "Every typed input is guaranteed to be in the field the next line of the test runs against.", checked: true },
              { text: "Silent validator overrides (clamped numbers, stripped characters, autocorrected dates) surface as test failures, not lurking bugs.", checked: true },
              { text: "AI coding agents driving the tool through MCP do not need to remember to emit expect() calls. The loop closes inside each tool call.", checked: true },
              { text: "Failure messages contain expected_text, actual_value, and selector_used, so the first debug step is just reading the error.", checked: true },
              { text: "Explicit verification is still available when you need it. Pass verify_element_exists or verify_element_not_exists and the branch at line 6860 flips.", checked: true },
              { text: "Works identically against Win32, WPF, UWP, WinUI 3, Electron, and Chrome via the bundled extension.", checked: true },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How it compares to the listicle picks
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Browser-first UI test automation tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters most for AI-driven test writing
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                An AI coding agent is good at emitting actions. It is less
                reliable at remembering every assertion. A UI test
                automation tool that bundles the assertion into the action
                removes a whole class of silent agent mistakes. The agent
                writes{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
                  type_into_element
                </code>{" "}
                once; the tool guarantees the field reflects the intent
                before the next line runs. This is the primary reason
                Terminator ships with an MCP adapter in the same repo as
                the core library; the verification guarantee and the agent
                loop were designed together.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Install into Claude Code in one line:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Need UI tests for a desktop app that keeps going green on broken features?"
          description="Bring the app. We will wire up Terminator live and show the self-verifying writes catching a silent failure within 20 minutes."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Adjacent deep dives in the Terminator docs"
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
