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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  BeforeAfter,
  CodeComparison,
  AnimatedChecklist,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-ui-testing";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation UI testing that does not stop at the browser: Playwright-shaped tests for every desktop app";
const DESCRIPTION =
  "Most guides on 'automation ui testing' cover Selenium, Playwright, Cypress. All browser-only. This page shows how the same wait-for-visible, wait-for-enabled, assert-is-focused model works against native Windows and macOS apps through the OS accessibility tree, using one selector language that crosses Chrome, Excel, and Slack in a single test.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Async wait and assert primitives for UI testing that work on any desktop app through Windows UIA and macOS AX. Four WaitConditions, 18 typed errors, one selector language across browser and native.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation UI testing past the browser",
    description:
      "Playwright-shaped wait_for and validate, but against the OS accessibility tree. Selectors like window:Calculator >> role:Button && name:Equals. Real source in mediar-ai/terminator.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation UI testing" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation UI testing", url: PAGE_URL },
];

const waitForSource = `// crates/terminator/src/locator.rs, lines 170-233
// Four conditions. 100 ms poll. The same shape Playwright users know,
// but backed by the OS accessibility tree, not the DOM.

pub enum WaitCondition {
    Exists,
    Visible,
    Enabled,
    Focused,
}

pub async fn wait_for(
    &self,
    condition: WaitCondition,
    timeout: Option<Duration>,
) -> Result<UIElement, AutomationError> {
    let effective_timeout = timeout.unwrap_or(self.timeout);
    let start_time = std::time::Instant::now();
    let poll_interval = Duration::from_millis(100);

    loop {
        if start_time.elapsed() > effective_timeout {
            return Err(AutomationError::Timeout(/* ... */));
        }
        match self.validate(Some(poll_interval)).await {
            Ok(Some(element)) => {
                let condition_met = match condition {
                    WaitCondition::Exists  => true,
                    WaitCondition::Visible => element.is_visible().unwrap_or(false),
                    WaitCondition::Enabled => element.is_enabled().unwrap_or(false),
                    WaitCondition::Focused => element.is_focused().unwrap_or(false),
                };
                if condition_met { return Ok(element); }
            }
            Ok(None)   => { /* keep polling */ }
            Err(e)     => return Err(e),
        }
        tokio::time::sleep(poll_interval).await;
    }
}`;

const errorTypesSource = `// crates/terminator/src/errors.rs
// Every UI test flake you know, promoted to a typed variant.
// Your assertions can match on these, not on string content.

#[derive(Error, Debug)]
pub enum AutomationError {
    ElementNotFound(String),
    Timeout(String),
    PermissionDenied(String),
    PlatformError(String),
    UnsupportedOperation(String),
    UnsupportedPlatform(String),
    InvalidArgument(String),
    Internal(String),
    InvalidSelector(String),
    UIAutomationAPIError { message, com_error, operation, is_retryable },

    // The lifecycle errors that UI tests actually hit:
    ElementDetached(String),    // element left the tree mid-assert
    ElementNotVisible(String),  // bounds are zero-size or off-screen
    ElementNotEnabled(String),  // dependency not satisfied
    ElementNotStable(String),   // bounds are still animating
    ElementObscured(String),    // another element is on top

    ScrollFailed(String),
    OperationCancelled(String),
    VerificationFailed(String),
}`;

const testExampleCode = `// tests/checkout.spec.ts
// One test. Two apps. One selector language.

import { Desktop } from '@mediar-ai/terminator';

const desktop = new Desktop();

test('order flow survives across Excel + Chrome', async () => {
  // 1. Read the order number from a running Excel workbook
  const orderCell = await desktop
    .locator('process:EXCEL >> role:DataItem && name:A2')
    .first(3000);
  const orderId = orderCell.name();

  // 2. Drive Chrome. Same locator shape, different process.
  const chrome = desktop.locator('process:chrome');

  await chrome
    .locator('role:Edit && name:Search orders')
    .first(3000)
    .then(el => el.typeText(orderId, { clearBeforeTyping: true }));

  // 3. Assertion-style check: the status badge must appear.
  // validate() returns Ok(None) on timeout, so no throw to catch.
  const badge = await chrome
    .locator('role:Text && name:Paid')
    .validate(5000);

  expect(badge).not.toBeNull();

  // 4. Wait for the UI to settle before the next step.
  await chrome
    .locator('role:Button && name:Refund')
    .waitFor('enabled', 5000);
});`;

const playwrightEquivalentCode = `// test.spec.ts
// Works only if the UI under test is a web page in a browser.

import { test, expect } from '@playwright/test';

test('order flow', async ({ page }) => {
  await page.goto('/orders');

  // Cannot read the Excel cell: the workbook is a native app.
  // Cannot click the Refund button in a desktop-only admin tool.

  await page.getByPlaceholder('Search orders').fill('OR-4213');

  await expect(page.getByText('Paid')).toBeVisible();

  await expect(page.getByRole('button', { name: 'Refund' }))
    .toBeEnabled();
});`;

const terminatorEquivalentCode = `// same test.spec.ts
// Runs against the browser AND the native apps around it.

import { Desktop } from '@mediar-ai/terminator';
const desktop = new Desktop();

const chrome = desktop.locator('process:chrome');

await chrome
  .locator('role:Edit && name:Search orders')
  .first(3000)
  .then(el => el.typeText('OR-4213'));

const paid = await chrome
  .locator('role:Text && name:Paid')
  .waitFor('visible', 5000);

const refund = await chrome
  .locator('role:Button && name:Refund')
  .waitFor('enabled', 5000);

// Continue into the native admin tool. Same API.
const admin = desktop.locator('process:AdminDesktop');
await admin
  .locator('role:Button && name:Confirm refund')
  .first(3000)
  .then(el => el.invoke()); // invoke() bypasses viewport visibility`;

const runTerminal = [
  { text: "npm install @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 2s", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "npx vitest run tests/checkout.spec.ts", type: "command" as const },
  { text: "  tests/checkout.spec.ts", type: "output" as const },
  { text: "    order flow survives across Excel + Chrome", type: "output" as const },
  { text: "      locator(process:EXCEL >> role:DataItem && name:A2) -> 1 match in 41ms", type: "output" as const },
  { text: "      typeText(OR-4213) -> ok", type: "output" as const },
  { text: "      waitFor(visible, role:Text && name:Paid) -> met in 612ms", type: "output" as const },
  { text: "      waitFor(enabled, role:Button && name:Refund) -> met in 188ms", type: "output" as const },
  { text: "    PASS  1 test, 4 assertions, 1.3s", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Target surface",
    competitor: "A single browser tab, DOM only",
    ours: "Every running process the OS exposes. Browser tabs, native apps, system dialogs, the taskbar",
  },
  {
    feature: "Selector language",
    competitor: "CSS + ARIA + text + XPath",
    ours: "role, name, id, nativeid, classname, text, visible, process, window, plus rightof, leftof, above, below, near",
  },
  {
    feature: "Wait primitives",
    competitor: "toBeVisible, toBeEnabled, toBeFocused, toHaveText, auto-waiting in actions",
    ours: "wait_for(Exists | Visible | Enabled | Focused), validate() for assertion-style Ok(None)-on-miss, 100ms poll",
  },
  {
    feature: "Typed flake errors",
    competitor: "TimeoutError, generic Error",
    ours: "18 variants including ElementNotVisible, ElementObscured, ElementNotStable, ElementDetached, ElementNotEnabled",
  },
  {
    feature: "Cross-app flows in one test",
    competitor: "Impossible. A second tool (Winium, AppiumDesktop, AutoIt) is required for the native side",
    ours: "One Desktop instance covers Chrome, Excel, Outlook, a custom admin tool, and a system dialog in a single test",
  },
  {
    feature: "Invoke vs click",
    competitor: "Click only. If the element is off-screen, scroll first",
    ours: "invoke() calls the accessibility API default action without requiring viewport visibility. Faster and more deterministic",
  },
  {
    feature: "State primitives on controls",
    competitor: "check() for checkboxes, selectOption() for selects",
    ours: "setSelected(true) works for checkboxes AND radio buttons (Windows UIA quirk: radios ignore click())",
  },
  {
    feature: "Speed per action",
    competitor: "10 to 50ms per action on a local browser",
    ours: "CPU speed, not LLM inference. ~1ms selector resolve on the accessibility tree, no screenshot parsing",
  },
  {
    feature: "Runs in CI without a display server",
    competitor: "Yes, headless Chromium",
    ours: "Only with a real Windows session: UIA needs a desktop. Run on a Windows VM or a CI Windows image",
  },
];

const waitStepBento: BentoCard[] = [
  {
    title: "Exists, Visible, Enabled, Focused",
    description:
      "Locator::wait_for takes a WaitCondition enum with exactly four variants. That mirrors the four questions a UI test actually asks. No string matchers, no fuzzy 'state' objects. Each condition is a one-method call on the resolved element.",
    size: "2x1",
  },
  {
    title: "100 ms poll, explicit timeout",
    description:
      "The polling loop sleeps for 100 ms between checks. Timeout is the locator's default or the per-call argument. No global implicit wait.",
    size: "1x1",
  },
  {
    title: "validate() never throws on miss",
    description:
      "validate() returns Ok(Some(element)) on hit, Ok(None) on ElementNotFound or Timeout, Err only for platform faults. Write assertions with if let, not try/catch.",
    size: "1x1",
  },
  {
    title: "18 typed error variants",
    description:
      "AutomationError ships ElementNotVisible, ElementObscured, ElementNotStable, ElementDetached, ElementNotEnabled, UIAutomationAPIError with a COM code, plus the usual Timeout and InvalidSelector. Every flake has a name.",
    size: "2x1",
  },
  {
    title: "Selectors survive resize and theme",
    description:
      "role:Button && name:Save is stable across window sizes, DPI, light/dark themes, RTL locales. Coordinates are not.",
    size: "1x1",
  },
  {
    title: "Scoped to one process",
    description:
      "process:chrome roots a locator inside a running executable. window:Calculator narrows to a single top-level window. Tests do not leak into other apps.",
    size: "1x1",
  },
];

const timelineSteps = [
  {
    title: "Write a locator",
    description:
      "desktop.locator('process:EXCEL >> role:DataItem && name:A2'). No coordinates, no screenshot anchors. Use the Accessibility Insights picker on Windows or Accessibility Inspector on macOS to discover the role and name.",
  },
  {
    title: "Resolve with a timeout",
    description:
      "Every .first(timeoutMs) or .all(timeoutMs) call takes an explicit timeout in milliseconds. No implicit wait. If the element is not there in time, the call returns Timeout, a typed variant you can handle.",
  },
  {
    title: "Wait for the right condition",
    description:
      "Use wait_for(WaitCondition::Visible, 5_000) before clicking a button that animates in. Use wait_for(WaitCondition::Enabled, 5_000) before clicking a submit that is gated on validation. Poll interval is 100 ms.",
  },
  {
    title: "Assert with validate",
    description:
      "validate() returns Ok(None) on ElementNotFound or Timeout instead of throwing. Pair it with an assert: expect(await locator.validate(5_000)).not.toBeNull(). Your test runner records a single assertion.",
  },
  {
    title: "Act, and pick invoke over click",
    description:
      "For buttons that live off-screen or behind a virtual scroll, invoke() calls the OS accessibility default action directly. No mouse move, no viewport visibility required. Faster and flake-resistant.",
  },
  {
    title: "Traverse into the next process",
    description:
      "One Desktop object is a global locator root. To continue into a native admin tool after the browser, scope to its process name and keep going. Selectors look identical to the web ones.",
  },
];

const selectorPrefixes = [
  "role:",
  "name:",
  "text:",
  "id:",
  "nativeid:",
  "classname:",
  "visible:",
  "process:",
  "window:",
  "pos:",
  "rightof:",
  "leftof:",
  "above:",
  "below:",
  "near:",
];

const errorChips = [
  "ElementNotFound",
  "Timeout",
  "ElementNotVisible",
  "ElementNotEnabled",
  "ElementNotStable",
  "ElementObscured",
  "ElementDetached",
  "InvalidSelector",
  "ScrollFailed",
  "VerificationFailed",
  "UIAutomationAPIError",
  "PermissionDenied",
  "OperationCancelled",
];

const capabilityChecks = [
  { text: "Wait for a button to become visible on a modal that animates in" },
  { text: "Assert a native menu item is enabled before invoking it" },
  { text: "Wait for focus to land on a specific field after keyboard navigation" },
  { text: "Catch ElementObscured when a tooltip covers the element and retry" },
  { text: "Catch ElementNotStable while a toast is sliding in and re-poll" },
  { text: "Move one test across Excel, Chrome, and a native admin tool" },
  { text: "Scope a locator to a single process or window" },
  { text: "Invoke a button that is off-screen without first scrolling" },
  { text: "Use setSelected(true) on radio buttons that ignore click() on Windows" },
  { text: "Read and assert on a cell value from a running Excel workbook" },
];

const appsCovered = [
  "Chrome",
  "Edge",
  "Firefox",
  "Excel",
  "Word",
  "Outlook",
  "Slack desktop",
  "Teams",
  "Notion desktop",
  "Figma desktop",
  "VS Code",
  "Cursor",
  "Explorer",
  "PowerShell",
  "Terminal",
  "Calculator",
  "Notepad",
  "PowerPoint",
];

const mcpBeamNodes = {
  from: [
    { label: "Playwright test", sublabel: "web surface only" },
    { label: "Cypress test", sublabel: "web surface only" },
    { label: "Native UI test", sublabel: "wants both" },
  ],
  hub: { label: "Terminator Locator", sublabel: "locator.rs:170-233" },
  to: [
    { label: "Windows UIA", sublabel: "COM accessibility API" },
    { label: "macOS AX", sublabel: "AXUIElement" },
    { label: "Linux AT-SPI2", sublabel: "experimental" },
    { label: "Browser DOM", sublabel: "via Chrome extension bridge" },
  ],
};

const metrics = [
  { value: 4, label: "WaitConditions in the enum" },
  { value: 18, label: "Typed error variants" },
  { value: 100, label: "Poll interval (ms)", suffix: "" },
  { value: 15, label: "Selector prefixes" },
];

const faqs = [
  {
    q: "What do most guides on 'automation ui testing' cover that this page does not?",
    a: "They cover browser UI testing, narrowly. Selenium, Playwright, Cypress, Puppeteer, Katalon, TestCafe, WebdriverIO. All of them drive a web DOM through a browser driver (CDP, WebDriver-BiDi, or Selenium's JSON Wire). They are the right answer when the whole UI you need to test is a web page. This page covers the other half of automation UI testing: the UI that is not in a browser. Installed desktop apps, cross-app workflows, in-app dialogs that an embedded webview cannot reach, native admin tools, Excel, Outlook, PowerPoint, the Windows settings UI. For that, you need to drive the OS accessibility tree, not the DOM. Terminator is the Playwright-shaped framework for doing that. Same locator, wait_for, validate, click, type, invoke primitives; a different runtime under the hood.",
  },
  {
    q: "What are the WaitConditions and how many are there?",
    a: "Exactly four, defined as a Rust enum in crates/terminator/src/locator.rs. They are Exists, Visible, Enabled, and Focused. Locator::wait_for takes one of them and a Duration timeout. It polls with a 100 millisecond interval and checks the condition against the resolved element (element.is_visible(), element.is_enabled(), element.is_focused()) on each tick. The wait returns a typed Ok(element) when the condition becomes true, or AutomationError::Timeout if the deadline passes. That is the full surface. No fluent chain with 20 matchers, no implicit wait, no polling interval you need to tune. If you know Playwright's auto-wait, this is the explicit, minimal version of it.",
  },
  {
    q: "How is this different from Appium, Winium, or WinAppDriver?",
    a: "Those are WebDriver-protocol clients for native automation. They work, but the selectors are verbose WebDriver-style (By.AccessibilityId, By.Name, XPath over the UIA tree) and the API shape is older: desired capabilities, sessions, a Selenium-style findElement. Terminator is Playwright-shaped and code-first: a single Desktop() object, chained locators, async wait_for, typed errors, and one selector string that is readable at a glance (window:Calculator >> role:Button && name:Seven). Terminator also gives you an MCP server and a TypeScript workflow SDK with Zod schemas on top of the same primitives, which lets you reuse test steps as deterministic automations. Finally, Terminator is MIT-licensed and has no remote driver dependency: the SDK talks to UIA over COM directly from your test process.",
  },
  {
    q: "Can the same test run against both a web app and a native app?",
    a: "Yes. That is the anchor use case. A single Desktop instance scoped by process name gives you a locator root for any running program. A typical cross-app test looks like: 1) process:EXCEL to read a seed value from an open workbook; 2) process:chrome to drive the browser admin UI; 3) process:AdminDesktop to confirm the side-effect in the native dashboard. Same locator shape, same waitFor conditions, same typed errors, no second framework. Browser DOM access is available too through Terminator's Chrome extension bridge, which exposes executeBrowserScript() on any element resolved inside a Chrome process. That is useful when the accessibility tree is thin in a custom web widget and you need to fall back to the DOM.",
  },
  {
    q: "Which flake errors does Terminator surface, and how do I handle ElementObscured or ElementNotStable?",
    a: "The full list is in crates/terminator/src/errors.rs under the AutomationError enum: ElementNotFound, Timeout, PermissionDenied, PlatformError, UnsupportedOperation, UnsupportedPlatform, InvalidArgument, Internal, InvalidSelector, UIAutomationAPIError (with COM code + retryability flag), ElementDetached, ElementNotVisible, ElementNotEnabled, ElementNotStable, ElementObscured, ScrollFailed, OperationCancelled, VerificationFailed. Eighteen variants. Two of them map directly to the most common sources of UI test flake. ElementNotStable fires when the target's bounding box is still animating (a toast sliding in, a list reordering); the fix is to wait longer or use invoke() which does not need stable bounds. ElementObscured fires when another element is on top at click time (an overlay, a tooltip, a banner); the fix is to dismiss the covering element or press Escape and retry. Because these are typed, your test code matches on them explicitly instead of parsing a stringified Error.",
  },
  {
    q: "What does invoke() do that click() does not?",
    a: "click() synthesizes a mouse event at the element's center point. That requires the element to be visible in the viewport, its bounds to be stable, and nothing to be obscuring the pixel. invoke() calls the accessibility API's default action on the element directly. On Windows UIA that is the InvokePattern.Invoke method; on macOS AX it is the AXPress or role-appropriate action. It works even if the element is off-screen or partially obscured, it does not require a mouse move, and it is faster because it skips the hit-test. It is less faithful to a real user (no mouse, no focus-ring toggle), so prefer click() for user-facing smoke tests and invoke() for deep functional tests where you just need the action to fire. The one gotcha: radio buttons on Windows often ignore Invoke; use setSelected(true) instead.",
  },
  {
    q: "Does this replace Playwright for browser tests?",
    a: "No, and it is not meant to. Playwright is the best-in-class browser UI test runner with a mature fixture model, tracing, and a deep toolbox around it (component tests, API mocking, codegen, visual comparison). If your whole product under test is a web page, stay in Playwright. Terminator is the right tool when the product under test is a native app, or when a single scenario spans a browser plus a native app. You can also run both in the same test file: Playwright for the web surface, Terminator for the desktop surface. They do not fight. Terminator's selectors deliberately mirror Playwright's for cognitive load reasons. A Playwright user reading a Terminator test understands it on sight.",
  },
  {
    q: "What does a single selector look like on Windows vs macOS?",
    a: "Selectors are cross-platform by design. role:Button && name:Save reads the Windows UIA LocalizedControlType + Name on Windows, and the macOS AX Role + AXTitle on macOS. The Rust selector engine in crates/terminator/src/selector.rs normalizes both into the same matcher tree. The platform-specific adapters (crates/terminator/src/platforms/) translate the matchers into UIA property conditions or AX attribute queries. You write one test; it runs on both hosts where the app under test runs. The main caveat is that native widgets have different canonical roles on the two platforms (TextBox on Windows vs AXTextField on macOS). Use role:Edit as the cross-platform shim, or fall back to nativeid: when you need pinpoint precision, which is rare for well-labeled apps.",
  },
  {
    q: "How fast is a selector resolve compared to a Playwright locator?",
    a: "On Windows, a cached accessibility tree walk from a process root to a leaf button is ~1 ms for apps with a few thousand UIA nodes (Notepad, Calculator) and 10 to 50 ms for larger ones (Notion, VS Code). Playwright's locator resolve on a busy web page is comparable, 10 to 50 ms. The two are in the same order of magnitude. The place where the approaches diverge is screenshot-based computer use tools (Claude computer use, ChatGPT Agents, BrowserUse, Perplexity Comet). Those run an LLM against a screenshot for every action. That is seconds, not milliseconds. Terminator's README claims 100x the throughput over that category, which is consistent with the difference between a tree walk and an LLM inference call.",
  },
  {
    q: "Does it run in CI?",
    a: "Yes, on a Windows CI image with a real logged-in desktop session, or a self-hosted Windows VM. Windows UIA requires a desktop because it queries the Win32 accessibility APIs that only exist when a session is interactive. GitHub Actions windows-latest runners provide this. Headless CI on Linux does not work for Windows UIA automation (that is a category error, not a Terminator limitation). For pure browser tests in CI, keep using Playwright on a Linux runner. For desktop and cross-app tests, schedule them on Windows, treat them as integration tests rather than unit tests, and budget them accordingly. macOS AX in CI requires granting Accessibility permission to the runner process, which is scriptable via tccutil on GitHub Actions macOS runners with sudo access.",
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
                UI testing
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Windows UIA + macOS AX
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Playwright-shaped
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Automation UI testing,{" "}
              <GradientText variant="teal">past the browser</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every guide for &quot;automation ui testing&quot; points at one
              kind of framework: Selenium, Playwright, Cypress, WebdriverIO,
              TestCafe, Katalon. All of them drive a web page in a browser.
              All useful. All missing a category. This page is about the
              other half of UI testing: native desktop apps, cross-app
              workflows, and the parts of your product that do not live
              inside a Chromium tab. Same{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                wait_for
              </code>
              ,{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                validate
              </code>
              , and{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                locator
              </code>{" "}
              shape you already know, but backed by the OS accessibility tree
              instead of the DOM.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "Four WaitConditions: Exists, Visible, Enabled, Focused",
                "18 typed AutomationError variants (ElementObscured, ElementNotStable, ElementDetached, ...)",
                "One selector language across Windows UIA, macOS AX, and Chrome DOM",
                "100 ms poll interval, explicit per-call timeouts, no implicit wait",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Concept intro video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Automation UI testing"
            subtitle="past the browser, across every app"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Same Playwright-shaped locator API",
              "Backed by the OS accessibility tree",
              "Four WaitConditions: Exists, Visible, Enabled, Focused",
              "One test spans Chrome, Excel, Outlook, Slack",
              "Flakes get typed names: ElementObscured, ElementNotStable",
            ]}
          />
        </section>

        {/* Core anchor: the wait_for source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The whole wait-and-assert model in one file
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the actual source of the async wait primitive in
            Terminator. Four conditions, a 100 millisecond poll loop, and a
            typed{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              AutomationError::Timeout
            </code>{" "}
            on miss. No hidden auto-wait chain. No global implicit timeout.
            If you have written Playwright, this looks like the explicit,
            minimal version of its auto-wait. The difference is that{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              element.is_visible()
            </code>{" "}
            asks Windows UIA (or macOS AX), not the DOM.
          </p>
          <AnimatedCodeBlock
            code={waitForSource}
            language="rust"
            filename="crates/terminator/src/locator.rs"
          />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metrics} />
        </section>

        {/* Beam diagram */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One locator, four runtimes
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The locator is the user-facing surface. Under it, four platform
            adapters resolve selectors against whatever subsystem actually
            knows about UI elements on the box. You do not pick an adapter
            explicitly. Scoping a locator to a process is enough to route it.
          </p>
          <AnimatedBeam
            title="Selector routing by process"
            accentColor="#FF3E00"
            from={mcpBeamNodes.from}
            hub={mcpBeamNodes.hub}
            to={mcpBeamNodes.to}
          />
        </section>

        {/* Typed errors */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Every UI test flake, promoted to a type
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            UI tests fail in predictable ways: an element is there but zero
            size, there but disabled, there but obscured, there but still
            animating, not there yet at all. Most frameworks surface these
            as a single{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              TimeoutError
            </code>{" "}
            with a stringified message. Terminator gives each one a named
            variant. Your retry and recovery code matches on the variant,
            not on a regex over the message.
          </p>
          <AnimatedCodeBlock
            code={errorTypesSource}
            language="rust"
            filename="crates/terminator/src/errors.rs"
          />
          <div className="mt-6">
            <Marquee speed={28}>
              {errorChips.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* Bento grid: the wait/assert story */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The testing primitives, one card each
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            These six things are what differentiate a desktop-and-browser UI
            test framework from a browser-only one. None of them are
            product-specific. They are the surface you need whenever UI is
            the unit under test.
          </p>
          <BentoGrid cards={waitStepBento} />
        </section>

        {/* Before/after: browser-only vs cross-surface */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The moment browser-only stops being enough
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the test that breaks most setups. The seed data is in an
            Excel workbook. The primary flow is in Chrome. The confirmation
            lives in a native admin tool. Toggle to see what a browser-only
            framework can do vs what a desktop-aware one can.
          </p>
          <BeforeAfter
            title="Order-refund test: seed in Excel, act in Chrome, confirm in native admin"
            before={{
              label: "Browser-only framework",
              content:
                "Playwright / Cypress / Selenium can reach the Chrome step. They cannot read the Excel cell and cannot click the native confirm button. Teams glue a second tool (Winium, AppiumDesktop, AutoIt) for the native parts. That second tool has a different selector language, a different error surface, and its own flake profile. The test becomes three tests taped together with a shell script.",
              highlights: [
                "Cannot read a cell from a running Excel workbook",
                "Cannot drive a native admin tool",
                "Two frameworks, two selector languages, two flake surfaces",
              ],
            }}
            after={{
              label: "Terminator (desktop + browser)",
              content:
                "One Desktop() instance, scoped by process for each step. Excel, Chrome, and the admin tool are all just locator roots. Same wait_for, same validate, same typed errors. The test reads as one story instead of three.",
              highlights: [
                "process:EXCEL >> role:DataItem && name:A2 reads the seed",
                "process:chrome >> role:Button && name:Refund drives the web UI",
                "process:AdminDesktop >> role:Button && name:Confirm closes the loop",
              ],
            }}
          />
        </section>

        {/* Code comparison */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <CodeComparison
            title="Same test, two runtimes"
            leftLabel="Playwright (browser only)"
            rightLabel="Terminator (browser + native)"
            leftCode={playwrightEquivalentCode}
            rightCode={terminatorEquivalentCode}
            leftLines={playwrightEquivalentCode.split("\n").length}
            rightLines={terminatorEquivalentCode.split("\n").length}
            reductionSuffix="extra lines to cross into the native app"
          />
        </section>

        {/* Full example */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            A full cross-app test, top to bottom
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            This file runs in Vitest (or Jest, Mocha, anything that exposes{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              test
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              expect
            </code>
            ). One Desktop instance, three apps, one assertion. No extra
            setup beyond{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              npm install @mediar-ai/terminator
            </code>
            .
          </p>
          <AnimatedCodeBlock
            code={testExampleCode}
            language="typescript"
            filename="tests/checkout.spec.ts"
          />
        </section>

        {/* How it runs */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What it looks like when it runs
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Selector resolves are on the order of milliseconds. wait_for
            returns the instant the condition becomes true. The whole test
            finishes in about a second on a warm Windows session.
          </p>
          <TerminalOutput title="vitest run tests/checkout.spec.ts" lines={runTerminal} />
        </section>

        {/* Timeline: the UI test lifecycle */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The six moves in every desktop UI test
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            These are the steps, in order. If a step fails, the failure is a
            typed variant and your retry logic matches on it. No
            try/catch/stringify dance.
          </p>
          <StepTimeline steps={timelineSteps} />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Terminator vs a browser-only UI test framework"
            intro="Point-by-point differences that matter when the UI under test is not purely web. Same shape, wider reach."
            productName="Terminator"
            competitorName="Browser-only (Selenium, Playwright, Cypress)"
            rows={comparisonRows}
          />
        </section>

        {/* Selector prefix marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One selector language, every prefix you need
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            These are every prefix the selector engine understands. You will
            use{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              role:
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              name:
            </code>{" "}
            99% of the time. The positional ones (
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              rightof:
            </code>
            ,{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              near:
            </code>
            ) save you on ambiguous layouts.
          </p>
          <Marquee speed={26}>
            {selectorPrefixes.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every line number, WaitCondition variant, error type, and selector prefix on this page is grep-able in a fresh clone of mediar-ai/terminator. No invented specs."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Capability checklist */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Specific assertions a desktop UI test needs to express
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            This is a concrete checklist of things that are awkward or
            impossible in a browser-only framework and natural in a
            desktop-aware one. Each item maps to one or two calls in the SDK.
          </p>
          <AnimatedChecklist title="" items={capabilityChecks} />
        </section>

        {/* Apps marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Apps you can target today
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Anything whose window the OS exposes accessibility information
            for. That is most production Windows apps. Electron apps in
            particular tend to have well-labeled roles and names, which
            makes them easy selector targets.
          </p>
          <Marquee speed={40} reverse>
            {appsCovered.map((name) => (
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
              Why this framing matters
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              UI test automation has been split into two tribes for a decade.
              Browser people have Playwright and friends. Native people have
              Appium, Winium, WinAppDriver, and a queue of legacy RPA
              vendors. Neither side gives you a single language for the
              whole surface. Teams pay for that split with parallel test
              infrastructures, two on-call rotations for test flakiness, and
              scenarios that never get automated because they cross the
              boundary.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator is a developer framework for building desktop
              automation. It is not a consumer app. It gives existing AI
              coding assistants, and your existing test runner, the ability
              to control your entire OS, not just a browser tab. Like
              Playwright, but for every app on your desktop.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If your product is a pure web app, keep using Playwright. If
              any part of your workflow leaves the tab, add Terminator to
              the same test file.
            </p>
          </GlowCard>
        </section>

        {/* Wait count stat callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              Poll interval, in milliseconds, of Locator::wait_for
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={100} />
            </div>
            <p className="text-sm text-zinc-500">
              Fixed in{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                crates/terminator/src/locator.rs
              </code>
              . Every 100 ms, the loop checks your condition against the
              live accessibility tree. Timeout is yours to pass in.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Have a UI test that leaves the browser tab?"
            description="Show us the scenario and we will map it to a single Terminator spec that spans every app it touches."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation. It extends the Playwright-shaped locator, wait_for,
            and validate model to every running app on Windows and macOS.
            MIT-licensed. Source at github.com/mediar-ai/terminator.
          </p>
        </footer>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See cross-app UI tests run live. Book a 20-min call."
      />
    </div>
  );
}
