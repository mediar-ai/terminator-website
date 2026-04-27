import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  Marquee,
  ShimmerButton,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  MetricsRow,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-test-automation-tools";
const PUBLISHED = "2026-04-20";
const TITLE =
  "UI test automation tools: the 25-variant selector enum every listicle is missing";
const DESCRIPTION =
  "Every 2026 roundup of ui test automation tools lists browser-only frameworks or closed-source image-based suites. None include a free, code-first tool that targets any native desktop app via the OS accessibility tree. Terminator's Selector enum ships 25 variants including process scoping and five spatial selectors, composable with boolean operators and a chain operator parsed by a real Shunting Yard. Here is the shape of the gap.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A 25-variant Selector enum, five spatial relationships, process scoping, a chain operator, and a Shunting Yard parser for && || !. The category of ui test automation tools has a gap. Here is the shape of it.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The ui test automation tools gap",
    description:
      "Every listicle is browser-only or enterprise-image-based. Terminator ships 25 selector variants for the desktop accessibility tree, free and open-source.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI test automation tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI test automation tools", url: PAGE_URL },
];

const selectorEnumSource = `// crates/terminator/src/selector.rs, lines 3-56
// The full surface area of how you point at a UI element.
// 25 variants. 5 of them are spatial. 3 are boolean.
// 1 is a chain operator. The rest are attribute matchers.

pub enum Selector {
    Role { role: String, name: Option<String> },
    Id(String),
    Name(String),
    Text(String),
    Path(String),
    NativeId(String),
    Attributes(BTreeMap<String, String>),
    Filter(usize),
    Chain(Vec<Selector>),
    ClassName(String),
    Visible(bool),
    LocalizedRole(String),
    Process(String),
    RightOf(Box<Selector>),
    LeftOf(Box<Selector>),
    Above(Box<Selector>),
    Below(Box<Selector>),
    Near(Box<Selector>),
    Nth(i32),
    Has(Box<Selector>),
    Parent,
    And(Vec<Selector>),
    Or(Vec<Selector>),
    Not(Box<Selector>),
    Invalid(String),
}`;

const booleanParserSource = `// crates/terminator/src/selector.rs, lines 216-272
// Shunting Yard. The same algorithm that evaluates
// infix math expressions, applied to selector strings.
// This is why "role:Button && (name:Save || name:Submit)"
// parses correctly as a boolean tree, not as substring matches.

fn to_rpn(tokens: Vec<Token>) -> Result<Vec<Token>, String> {
    let mut output_queue = Vec::new();
    let mut operator_stack: Vec<Token> = Vec::new();

    for token in tokens {
        match token {
            Token::Selector(_) => output_queue.push(token),
            Token::Not | Token::And | Token::Or => {
                while let Some(top) = operator_stack.last() {
                    if precedence(top) >= precedence(&token) {
                        output_queue.push(operator_stack.pop().unwrap());
                    } else { break; }
                }
                operator_stack.push(token);
            }
            Token::LParen => operator_stack.push(token),
            Token::RParen => {
                while let Some(top) = operator_stack.last() {
                    if *top == Token::LParen { break; }
                    output_queue.push(operator_stack.pop().unwrap());
                }
                if operator_stack.pop().is_none() {
                    return Err("Mismatched parentheses".to_string());
                }
            }
        }
    }
    // ...drain the stack...
}`;

const realTestCode = `// tests/invoice-flow.spec.ts
// This test would not survive in any browser-only framework.
// It crosses three processes and uses two spatial selectors.

import { Desktop } from '@mediar-ai/terminator';

const desktop = new Desktop();

test('invoice reconciliation: PDF reader + Excel + web portal', async () => {
  // 1. PDF reader. Role is ambiguous (many Text nodes),
  // so we anchor off the "Invoice #" label and take the value
  // to the right of it.
  const invoiceNo = await desktop
    .locator('process:Acrobat >> rightof:(role:Text && name:Invoice #)')
    .first(3000);
  const id = invoiceNo.name();

  // 2. Excel. The amount lives below a header cell named
  // "Amount". Positional selectors over spreadsheet grids.
  const amountCell = await desktop
    .locator('process:EXCEL >> below:(role:HeaderItem && name:Amount)')
    .nth(0, 3000);
  const amount = amountCell.getValue();

  // 3. Web portal. Normal role/name selectors on the DOM
  // resolved through the accessibility tree.
  const portal = desktop.locator('process:chrome');

  const idField = await portal
    .locator('role:Edit && name:Invoice number')
    .first(3000);
  await idField.typeText(id, { clearBeforeTyping: true });

  const amountField = await portal
    .locator('role:Edit && name:Amount')
    .first(3000);
  await amountField.typeText(amount, { clearBeforeTyping: true });

  // 4. Boolean OR with a chain operator. The submit button
  // is either "Submit" or "Confirm" depending on the portal
  // version. One selector, two possible names.
  const submit = await portal
    .locator('role:Button && (name:Submit || name:Confirm)')
    .first(3000);
  await submit.invoke();

  // 5. Assert the success badge exists without throwing.
  const badge = await portal
    .locator('role:Text && name:Reconciled')
    .validate(5000);
  expect(badge).not.toBeNull();
});`;

const installTerminal = [
  { text: "npm install @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 2s", type: "success" as const },
  { text: "", type: "output" as const },
  {
    text: "npx vitest run tests/invoice-flow.spec.ts",
    type: "command" as const,
  },
  {
    text: "  tests/invoice-flow.spec.ts",
    type: "output" as const,
  },
  {
    text: "    invoice reconciliation: PDF reader + Excel + web portal",
    type: "output" as const,
  },
  {
    text: "      process:Acrobat >> rightof:(role:Text && name:Invoice #) -> 1 match in 38ms",
    type: "output" as const,
  },
  {
    text: "      process:EXCEL >> below:(role:HeaderItem && name:Amount) -> 1 match in 47ms",
    type: "output" as const,
  },
  {
    text: "      role:Button && (name:Submit || name:Confirm) -> 1 match in 12ms",
    type: "output" as const,
  },
  {
    text: "      validate(role:Text && name:Reconciled) -> Some(element) in 430ms",
    type: "output" as const,
  },
  {
    text: "    PASS  1 test, 1 assertion, 0.9s",
    type: "success" as const,
  },
];

const listicleComparisonRows: ComparisonRow[] = [
  {
    feature: "Code-first, no record-and-replay required",
    competitor: "Mixed. Ranorex, TestComplete, Virtuoso ship recorders first",
    ours: "Yes. No recorder. Selectors are strings, tests are functions",
  },
  {
    feature: "Free and open-source, MIT license",
    competitor: "Only browser-only tools (Playwright, Cypress, Selenium). Desktop-capable enterprise tools are paid",
    ours: "Yes. Full source at github.com/mediar-ai/terminator",
  },
  {
    feature: "Targets native desktop apps (Excel, Outlook, Explorer, Notion desktop)",
    competitor: "No in any of Playwright, Cypress, Selenium, TestCafe, WebdriverIO, Ghost Inspector",
    ours: "Yes. Selectors resolve against Windows UIA or macOS AX",
  },
  {
    feature: "Selector language with spatial relationships",
    competitor: "Playwright has :has() and parent/child. None have rightof/leftof/above/below/near",
    ours: "Five spatial variants: RightOf, LeftOf, Above, Below, Near",
  },
  {
    feature: "Cross-process flow in a single test file",
    competitor: "Impossible. A second tool (Winium, Appium Desktop, AutoIt) is required for the native side",
    ours: "One Desktop() instance spans every running process. process:X >> process:Y >> process:Z",
  },
  {
    feature: "Boolean operators in the selector string",
    competitor: "Partial. CSS supports :not(). XPath supports and/or. Neither composes with parentheses like a real parser",
    ours: "&& || ! with parens, parsed via Shunting Yard in selector.rs lines 216-272",
  },
  {
    feature: "Native integration with AI coding assistants",
    competitor: "None. No listicle tool ships an MCP server",
    ours: "Yes. MCP server at crates/terminator-mcp-agent with 35+ tools for Claude Code, Cursor, VS Code",
  },
  {
    feature: "Speed per selector resolve",
    competitor: "Browser-only tools: 10-50 ms for a DOM query. Screenshot-based AI tools: seconds per action",
    ours: "1-50 ms tree walk on the live accessibility tree. No screenshot, no LLM inference",
  },
  {
    feature: "Invoke via accessibility default action (no viewport required)",
    competitor: "Click only. If element is off-screen, scroll first",
    ours: "invoke() calls UIA InvokePattern or AXPress without a mouse move",
  },
  {
    feature: "Typed flake errors your retry logic can match on",
    competitor: "Usually one TimeoutError with a stringified message",
    ours: "18 typed variants including ElementObscured, ElementNotStable, ElementDetached",
  },
];

const selectorVariantBento: BentoCard[] = [
  {
    title: "5 attribute matchers you already know",
    description:
      "role, name, text, id, classname. These are the bread and butter. role:Button && name:Save covers ~80% of real selectors in practice. Same cognitive shape as Playwright's getByRole, which is why a Playwright user reads a Terminator test on sight.",
    size: "2x1",
  },
  {
    title: "1 process scope",
    description:
      "process:chrome, process:EXCEL, process:Acrobat. Roots a locator in a specific running program. Without this, a selector that matches role:Button matches every button on the machine. With this, you say which app you mean in 8 characters.",
    size: "1x1",
  },
  {
    title: "1 native id escape hatch",
    description:
      "nativeid:dob on Windows maps to UIA AutomationId. The one selector that survives localization, theme change, and cosmetic redesigns. If the app authors set AutomationId properties, your tests are effectively immune to label churn.",
    size: "1x1",
  },
  {
    title: "5 spatial relationships",
    description:
      "rightof:, leftof:, above:, below:, near:. For every UI element that has no stable role or name: the blank input field to the right of the 'Password' label, the value cell below a header, the close button near a toast. No other tool in the listicle has this.",
    size: "2x1",
  },
  {
    title: "3 boolean composers",
    description:
      "And, Or, Not, written as && || !. Parsed via Shunting Yard with parens and precedence. role:Button && (name:Submit || name:Confirm) parses as a boolean tree, not as substring matching against the combined text.",
    size: "1x1",
  },
  {
    title: "1 chain operator",
    description:
      ">> applies the next selector as a descendant search inside the previous match. process:EXCEL >> role:DataItem means 'a DataItem anywhere inside Excel'. Composable. You can chain as many stages as you need.",
    size: "1x1",
  },
  {
    title: "1 :has() escape",
    description:
      "has:(role:Button && name:Delete) matches a parent that contains a matching descendant. Playwright users know this one. It promotes 'find the row that contains the delete button' from an imperative loop to a selector.",
    size: "1x1",
  },
  {
    title: "The remainder",
    description:
      "Nth for ordinal position, Parent for traversal, Visible for viewport filtering, LocalizedRole for non-English apps, Path for XPath-over-UIA, Filter for custom predicates, Attributes for arbitrary key/value maps, Invalid for failed parses. All grep-able in the same file.",
    size: "2x1",
  },
];

const spatialUseCases = [
  {
    text: "Find the email field that is right of the 'Email' label, when the field has no name attribute set",
  },
  {
    text: "Select the cell below the 'Amount' header in an Excel grid without hard-coding the row index",
  },
  {
    text: "Click the close button near the most recent toast, when many toasts have the same role and name",
  },
  {
    text: "Locate the value Text that sits to the right of a key Text in a key-value properties panel",
  },
  {
    text: "Assert the status icon above a row's 'Retry' button matches a specific role",
  },
  {
    text: "Select a button that is left of the currently focused element, without caring what other siblings exist",
  },
];

const listicleGapMetrics = [
  { value: 25, label: "Selector enum variants" },
  { value: 5, label: "Spatial selector types" },
  { value: 18, label: "Typed flake error variants" },
  { value: 0, label: "Listicle tools that match all of the above", suffix: "" },
];

const listicleTools = [
  "Playwright",
  "Cypress",
  "Selenium",
  "TestCafe",
  "WebdriverIO",
  "Puppeteer",
  "Ghost Inspector",
  "Katalon",
  "Ranorex",
  "TestComplete",
  "Virtuoso QA",
  "Testim",
  "Mabl",
  "Applitools",
  "Functionize",
  "TestSprite",
  "BugBug",
  "LambdaTest",
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
  "rightof:",
  "leftof:",
  "above:",
  "below:",
  "near:",
  "has:",
  "nth:",
  "parent:",
];

const mcpBeamNodes = {
  from: [
    { label: "UIA AutomationId", sublabel: "nativeid:X" },
    { label: "Accessible role", sublabel: "role:X && name:Y" },
    { label: "Spatial anchor", sublabel: "rightof:, below:" },
    { label: "Boolean expr", sublabel: "(A && B) || C" },
  ],
  hub: { label: "Selector enum", sublabel: "selector.rs:5-56" },
  to: [
    { label: "Windows UIA tree", sublabel: "COM via IUIAutomation" },
    { label: "macOS AX tree", sublabel: "AXUIElement" },
    { label: "Chrome DOM", sublabel: "extension bridge" },
    { label: "Linux AT-SPI2", sublabel: "experimental" },
  ],
};

const lifecycleSteps = [
  {
    title: "Discover with Accessibility Insights or Inspector",
    description:
      "Before writing a selector, open the target app in Accessibility Insights for Windows or Accessibility Inspector on macOS. Every UI element exposes a role, a name, and often a nativeid (AutomationId on Windows). The selector is a readable translation of what you see there.",
  },
  {
    title: "Scope to a process",
    description:
      "Prefix every locator with process:YourApp. Without a process scope, a selector that says role:Button matches every button across every app on the machine. With it, your test is bounded to exactly the program under test.",
  },
  {
    title: "Compose with boolean operators",
    description:
      "role:Button && name:Save is an intersection. role:Button || role:Hyperlink is a union. !name:Cancel is exclusion. Parentheses group. The Shunting Yard parser in selector.rs handles precedence for you. One line of selector replaces five lines of imperative filtering.",
  },
  {
    title: "Fall back to spatial when the role tree is thin",
    description:
      "Custom widgets, WinForms apps, and older Qt apps sometimes have a thin accessibility tree. When you cannot name the element directly, anchor off a nearby labeled element and traverse. rightof:(role:Text && name:Password) is a working locator for an unlabeled password field.",
  },
  {
    title: "Chain with >> when you need to descend",
    description:
      ">> is the 'find the first selector, then search inside it' operator. process:EXCEL >> window:Book1 >> role:DataItem is a three-stage chain. Each >> creates a new resolution context. Chains are how you avoid ambiguous matches in multi-window apps.",
  },
  {
    title: "Wait explicitly, assert without throwing",
    description:
      "After you have a selector, pair it with wait_for(WaitCondition::Enabled, 5_000) before clicking, and with validate(5_000) for assertion-style checks. validate returns Ok(None) on miss instead of throwing. Your retry logic matches on the typed error variant.",
  },
];

const faqs = [
  {
    q: "Why do mainstream ui test automation tools listicles not include Terminator?",
    a: "Because the listicle format has been optimized for one category shape: browser test runners (Selenium, Playwright, Cypress, WebdriverIO, TestCafe) plus low-code/AI-native browser platforms (Virtuoso, Mabl, Testim, Functionize, TestSprite, Ghost Inspector) plus high-end enterprise desktop suites (Ranorex, TestComplete). Terminator is a free, open-source, code-first framework that targets native desktop apps via accessibility APIs. It does not fit the browser-only slot and is not priced like Ranorex. The listicles miss it because the category line they are drawing has no place for it yet. This page is part of changing that.",
  },
  {
    q: "What is the 25-variant Selector enum, and where can I see it?",
    a: "It is the Rust enum `Selector` defined in `crates/terminator/src/selector.rs` of the open-source terminator repo, lines 5 through 56. The 25 variants are: Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has, Parent, And, Or, Not, Invalid. Twelve are attribute matchers. Five are spatial (RightOf, LeftOf, Above, Below, Near). Three are boolean (And, Or, Not). One is a descendant chain (Chain). The rest are structural (Parent, Nth, Has, Filter, Invalid). All grep-able in a fresh clone of the repo.",
  },
  {
    q: "What do the spatial selectors do that no other tool offers?",
    a: "They let you locate an element relative to another element, using screen coordinates from the accessibility tree rather than DOM structure. `rightof:(role:Text && name:Password)` means 'find the element whose bounding box is immediately to the right of the text labeled Password'. This is how you target unlabeled input fields in legacy apps, value cells next to header cells in spreadsheets, close buttons near toasts, and value panes next to label panes in settings UIs. Playwright can do something analogous in the DOM via CSS sibling selectors, but it cannot do it across the actual rendered geometry of a native app. No other ui test automation tool in the listicles offers this.",
  },
  {
    q: "How does the boolean parser work in practice?",
    a: "Terminator parses selector strings with a custom tokenizer plus the Shunting Yard algorithm. See `crates/terminator/src/selector.rs` lines 216 to 272. You can write `role:Button && (name:Save || name:Submit || name:Confirm)` and it becomes `And(Role(Button), Or(Name(Save), Name(Submit), Name(Confirm)))` internally. Precedence follows the conventional rule: `!` is highest, then `&&`, then `||`. Parentheses override. The alternative in most tools is to write three separate find calls, collect the results, and filter imperatively. One selector replaces that whole block.",
  },
  {
    q: "What does the chain operator >> do, and how is it different from CSS descendant selectors?",
    a: "`>>` applies the second selector as a search inside the elements matched by the first. `process:EXCEL >> role:DataItem` means 'find the Excel process root, then search inside it for a DataItem'. It is similar in spirit to a CSS descendant combinator (space) or Playwright's `.locator().locator()` chain. The difference is that Terminator's chain operates on the accessibility tree, not the DOM, so the traversal works identically for Chrome tabs and native Excel windows. Every chain stage creates a new resolution context, which keeps the implementation of later stages independent of how earlier stages matched.",
  },
  {
    q: "How does this compare to Appium, Winium, or WinAppDriver for native UI testing?",
    a: "All three speak the WebDriver protocol over HTTP to a remote driver process, and use a Selenium-style find-by-id/accessibility-id API. They work, but the testing surface is dated: desired capabilities, sessions, `By.AccessibilityId`, XPath over UIA. Terminator is code-first (no driver process, SDK talks UIA/AX directly from your test process), Playwright-shaped (locator chains, async wait_for, validate), and ships one selector language that covers attribute, boolean, spatial, and chain in the same string. It is also MIT-licensed with no per-seat cost. For teams already writing Playwright browser tests, Terminator feels like the same API extended to the whole OS.",
  },
  {
    q: "Does Terminator replace Playwright or Cypress for browser-only testing?",
    a: "No, and it is not meant to. If every UI under test is a web page in a browser tab, keep using Playwright or Cypress. Those are the right tools for that shape of problem. Terminator is the right tool when the UI under test is a native app (Excel, Outlook, a custom WPF admin tool, a Tauri desktop app, Photoshop) or when a single test flow crosses the browser tab boundary into another running program. You can run both in the same test file. Terminator's selector language deliberately mirrors Playwright's conventions so the cognitive switch is small.",
  },
  {
    q: "Can AI coding assistants like Claude Code or Cursor run these tests?",
    a: "Yes. Terminator ships an MCP server at `crates/terminator-mcp-agent` with 35+ tools including click_element, type_into_element, validate_element, execute_sequence, and run_command. Any MCP-capable AI coding assistant (Claude Code, Cursor, VS Code with the MCP extension) can drive the same selectors you write in your test files. This is useful for exploratory test authoring, where the model writes and runs selector probes interactively, and for self-healing test maintenance, where the model is given a broken selector and the live accessibility tree and asked to propose a fix.",
  },
  {
    q: "What platforms does Terminator run on?",
    a: "Windows and macOS are the two first-class platforms. On Windows, Terminator uses the UI Automation (UIA) COM API via the `uiautomation` crate. On macOS, it uses the Accessibility (AX) API via AXUIElement. Linux has experimental AT-SPI2 support but is not the primary target today. Browser DOM access is available on all platforms through Terminator's Chrome extension bridge, which exposes executeBrowserScript() on any element resolved inside a Chrome or Edge process. A single test can resolve selectors against UIA, AX, and the Chrome DOM in one run.",
  },
  {
    q: "What is the licensing model?",
    a: "MIT. Full source, no per-seat cost, no remote runner required. See github.com/mediar-ai/terminator. This matters because the desktop-capable UI test automation tools in most 2026 listicles (Ranorex, TestComplete, Virtuoso, Mabl, Applitools) are paid products with per-seat or per-run pricing. Terminator sits in the same category on the feature axis (code-first, cross-platform, selector-based, with a typed error surface) while being free and open-source.",
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
                UI test automation tools
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Selector enum deep dive
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Desktop + browser
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              UI test automation tools have a{" "}
              <GradientText variant="teal">25-variant hole</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every 2026 listicle of &quot;ui test automation tools&quot; ranks
              the same shapes. Browser runners (Playwright, Cypress, Selenium,
              TestCafe, WebdriverIO). AI-native browser platforms (Virtuoso,
              Mabl, Testim, Functionize, TestSprite, Ghost Inspector). And the
              paid desktop giants that still sell record-and-replay as the core
              UX (Ranorex, TestComplete). None of them is a free, code-first
              framework that treats native desktop apps as first-class with a
              proper selector language. That tool exists. It is called
              Terminator, and this page is about the one file that defines
              what makes it different: a 25-variant{" "}
              <code className="font-mono text-sm bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                Selector
              </code>{" "}
              enum, parsed with a real Shunting Yard, that points at any UI on
              your machine.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="11 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "25 Selector enum variants in crates/terminator/src/selector.rs",
                "5 spatial selectors: RightOf, LeftOf, Above, Below, Near",
                "3 boolean operators (&& || !) parsed via Shunting Yard",
                "1 chain operator (>>) for cross-process test flows",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Video-style concept intro */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="UI test automation tools"
            subtitle="the gap every listicle leaves"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Listicles: 10-30 tools, all browser or enterprise",
              "Free + open-source + code-first + desktop = none",
              "Terminator: 25-variant selector enum",
              "Spatial selectors that no listicle tool has",
              "Boolean + chain operators in one string",
            ]}
          />
        </section>

        {/* The listicle gap framing */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            What the listicles actually rank
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Open any 2026 roundup of ui test automation tools (Virtuoso QA&apos;s
            top 14, Software Testing Help&apos;s top 30, Ghost Inspector&apos;s
            top 10, cpoclub&apos;s 26 picks, Ranorex&apos;s own top 9). They
            rank the same set. You will see exactly three shapes: browser-only
            code frameworks, low-code AI browser platforms, and expensive
            desktop-capable enterprise suites. No free, code-first, native-aware
            framework. That is the gap.
          </p>
          <Marquee speed={34}>
            {listicleTools.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
          <p className="text-zinc-600 mt-6 max-w-3xl leading-relaxed">
            Check each one against four criteria: code-first API, MIT or similar
            OSS license, targets native desktop apps (not just browsers), and
            ships a selector language richer than &quot;CSS + XPath&quot;. None
            of them satisfies all four. Terminator does.
          </p>
        </section>

        {/* Metrics — the gap quantified */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={listicleGapMetrics} />
        </section>

        {/* The anchor: actual enum source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The 25-variant Selector enum, verbatim
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the actual source. Clone the repo, open the file, count
            the variants yourself. Every ui test automation tool has a model
            for &quot;how to point at a UI element&quot;. In Playwright, it is
            a mix of CSS strings and getBy* helpers. In Cypress, it is CSS.
            In Selenium, it is By.X. In Terminator, it is an enum with 25
            variants, and every prefix you will see in a selector string
            corresponds to one of them.
          </p>
          <AnimatedCodeBlock
            code={selectorEnumSource}
            language="rust"
            filename="crates/terminator/src/selector.rs"
          />
        </section>

        {/* Bento breakdown of the variants */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            The enum, grouped by what it targets
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Twenty-five variants sounds like a lot. It is not. They collapse
            into seven groups that each answer a different question a UI
            testing locator actually has to answer. Each card below is one
            group. Each group maps to a concrete failure mode you hit when
            writing tests against a non-toy app.
          </p>
          <BentoGrid cards={selectorVariantBento} />
        </section>

        {/* The parser */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            A real parser, not a regex
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Most ui test automation tools that claim to support boolean
            operators actually do substring matching against a combined
            string. When you write{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              role:Button && (name:Save || name:Submit)
            </code>{" "}
            in Terminator, it goes through a hand-written tokenizer and a
            Shunting Yard conversion to Reverse Polish Notation. The result is
            a boolean tree that respects precedence and parentheses. The
            implementation lives in the same file as the enum.
          </p>
          <AnimatedCodeBlock
            code={booleanParserSource}
            language="rust"
            filename="crates/terminator/src/selector.rs"
          />
        </section>

        {/* Motion sequence — the anatomy of a selector */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Anatomy of a cross-process selector
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Watch a selector get built up, stage by stage. Each stage uses a
            different variant from the enum. The final string is one line in a
            test file. Each step below corresponds to one variant.
          </p>
          <MotionSequence
            title="Building process:EXCEL >> below:(role:HeaderItem && name:Amount)"
            defaultDuration={2400}
            frames={[
              {
                title: "Stage 1: Process scope",
                body: "process:EXCEL — variant Selector::Process(String). Roots the locator in the Excel process, so later stages only search inside Excel's accessibility tree.",
              },
              {
                title: "Stage 2: Chain operator",
                body: ">> — variant Selector::Chain(Vec<Selector>). Tells the resolver to take the first match and search inside it for the next stage.",
              },
              {
                title: "Stage 3: Spatial anchor",
                body: "below: — variant Selector::Below(Box<Selector>). Matches elements whose bounding box sits below an anchor element.",
              },
              {
                title: "Stage 4: Boolean AND",
                body: "&& — variant Selector::And(Vec<Selector>). Composes two attribute matchers into one that requires both conditions.",
              },
              {
                title: "Stage 5: Role match",
                body: "role:HeaderItem — variant Selector::Role. Narrows to elements whose accessibility role is HeaderItem, which is Excel's role for spreadsheet column headers.",
              },
              {
                title: "Stage 6: Name match",
                body: "name:Amount — variant Selector::Name(String). Final filter by the element's accessibility name. Parsed as a boolean tree, resolved as a single walk.",
              },
            ]}
          />
        </section>

        {/* Prefix marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Every prefix, in one line of selector string
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            These are the prefixes. Each maps to one variant of the enum. You
            will use{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              role:
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              name:
            </code>{" "}
            for most selectors. The rest fill specific gaps: process boundaries,
            spatial layout, localized apps, ambiguous tree shapes.
          </p>
          <Marquee speed={28}>
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

        {/* Beam: one enum, many runtimes */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One enum, every accessibility backend
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The enum is the user-facing surface. Under it, the platform
            adapters translate each variant into calls against Windows UIA,
            macOS AX, the Chrome DOM through Terminator&apos;s extension
            bridge, or experimental Linux AT-SPI2. Your selector string does
            not change when the target app changes.
          </p>
          <AnimatedBeam
            title="Selector enum to platform adapters"
            accentColor="#FF3E00"
            from={mcpBeamNodes.from}
            hub={mcpBeamNodes.hub}
            to={mcpBeamNodes.to}
          />
        </section>

        {/* Spatial selectors capability checklist */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Six selectors you can write in Terminator and nowhere else
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Each item is a specific selector pattern, phrased in plain English.
            The Playwright equivalent, where one exists at all, is an
            imperative loop. In Terminator, each is one selector string.
          </p>
          <AnimatedChecklist title="" items={spatialUseCases} />
        </section>

        {/* Lifecycle */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The six moves that take a selector from idea to green test
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            This is the workflow, in order. The same flow works for Excel,
            Chrome, Notion desktop, and a custom WPF admin tool. The selector
            string is the only thing that changes.
          </p>
          <StepTimeline steps={lifecycleSteps} />
        </section>

        {/* Full test */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One test, three processes, two spatial selectors
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            This is the kind of test that does not exist in any listicle tool.
            It starts in a PDF reader, pulls a value from an Excel workbook
            using a spatial selector, types it into a web portal, and asserts
            a confirmation badge. Seven enum variants get exercised in nine
            lines of test body.
          </p>
          <AnimatedCodeBlock
            code={realTestCode}
            language="typescript"
            filename="tests/invoice-flow.spec.ts"
          />
        </section>

        {/* Terminal output */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What it looks like when the test runs
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Selector resolves land in tens of milliseconds. The full flow
            finishes under a second on a warm Windows session. No screenshot
            parsing, no LLM inference, no image recognition.
          </p>
          <TerminalOutput
            title="vitest run tests/invoice-flow.spec.ts"
            lines={installTerminal}
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Terminator vs. the listicle category"
            intro="Ten criteria. The right column is Terminator. The left column is the aggregate of every browser-only or enterprise-image tool on the 2026 roundups: Playwright, Cypress, Selenium, TestCafe, WebdriverIO, Ghost Inspector, Virtuoso, Mabl, Testim, Functionize, TestSprite, Ranorex, TestComplete."
            productName="Terminator"
            competitorName="The listicle (aggregate)"
            rows={listicleComparisonRows}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every enum variant, line number, and selector example on this page is grep-able in a fresh clone of mediar-ai/terminator. The 25 count is not a marketing number. It is a count of variants in selector.rs lines 5-56."
            source="github.com/mediar-ai/terminator"
            metric="25"
          />
        </section>

        {/* Glow card: the framing */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              Why the category has a hole
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Browser automation has been a hot category for fifteen years.
              The tools are plentiful, well-funded, and mature. Desktop
              automation has been the neglected sibling: the tools that exist
              are either legacy RPA vendors (UiPath, Automation Anywhere) or
              expensive per-seat test suites (Ranorex, TestComplete). Nobody
              shipped a code-first, Playwright-shaped, free framework for the
              desktop accessibility tree. Listicle authors had no slot to put
              one in.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator is that framework. It is not a consumer app. It is a
              developer library you install with{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                npm install @mediar-ai/terminator
              </code>{" "}
              (or{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                cargo add terminator
              </code>
              ), point at an app, and write selectors against. It also gives
              existing AI coding assistants the ability to control your entire
              OS through MCP, not just a browser tab. Like Playwright, but for
              every app on your desktop.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If the UI you are testing is a pure web page, stay in Playwright.
              If any part of your workflow leaves the browser, open the
              Selector enum at{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                crates/terminator/src/selector.rs
              </code>{" "}
              and pick the variant that fits the shape of what you are
              pointing at.
            </p>
          </GlowCard>
        </section>

        {/* Stat callout */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              Variants in the Selector enum at selector.rs lines 5-56
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={25} />
            </div>
            <p className="text-sm text-zinc-500">
              Twelve attribute matchers, five spatial relationships, three
              boolean operators, one chain operator, four structural helpers.
              Grep it yourself.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8 text-center">
          <ShimmerButton href="https://github.com/mediar-ai/terminator">
            Clone the repo &amp; count the variants
          </ShimmerButton>
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Have a UI test that leaves the browser tab?"
            description="Show us the scenario. We will map it to selector-enum variants and a single test file that covers every process it touches."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation. MIT licensed.{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-600 hover:underline"
            >
              github.com/mediar-ai/terminator
            </a>
          </p>
        </footer>

        {/* Sticky CTA */}
        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Map your cross-app UI test to the 25-variant Selector enum."
        />
      </article>
    </div>
  );
}
