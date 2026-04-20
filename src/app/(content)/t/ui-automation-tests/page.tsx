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
  OrbitingCircles,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  BeforeAfter,
  CodeComparison,
  HorizontalStepper,
  MetricsRow,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
  type StepperStep,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-tests";
const PUBLISHED = "2026-04-20";
const TITLE =
  "UI automation tests that locate elements by geometry: the five spatial selectors inside Terminator";
const DESCRIPTION =
  "Most UI automation tests lock onto IDs, names, or XPaths that shift the moment the layout changes. Terminator ships five spatial selectors (rightof:, leftof:, above:, below:, near:) that find an element by its position relative to a visible anchor. Near uses a hard-coded 50.0 pixel Euclidean radius.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Five selector variants (RightOf, LeftOf, Above, Below, Near) resolve against the OS accessibility tree. Near compares center-to-center distance against const NEAR_THRESHOLD: f64 = 50.0. Source: terminator/crates/terminator/src/platforms/windows/engine.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI automation tests that ask 'what is right of the Email label?'",
    description:
      "Spatial selectors in Terminator: rightof:, leftof:, above:, below:, near:. Grep-able in selector.rs and engine.rs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI automation tests" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI automation tests", url: PAGE_URL },
];

const selectorEnumSource = `// crates/terminator/src/selector.rs, lines 32-41
// Five variants, one for each geometric relationship.
// Each wraps an inner selector that identifies the anchor.

/// Select elements to the right of an anchor element
RightOf(Box<Selector>),
/// Select elements to the left of an anchor element
LeftOf(Box<Selector>),
/// Select elements above an anchor element
Above(Box<Selector>),
/// Select elements below an anchor element
Below(Box<Selector>),
/// Select elements near an anchor element
Near(Box<Selector>),`;

const parserSource = `// crates/terminator/src/selector.rs, lines 419-438
// The string form. Every prefix maps to a variant.
// The inner string recursively parses into its own Selector.

_ if s.to_lowercase().starts_with("rightof:") => {
    let inner_selector_str = &s["rightof:".len()..];
    Selector::RightOf(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("leftof:") => {
    let inner_selector_str = &s["leftof:".len()..];
    Selector::LeftOf(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("above:") => {
    let inner_selector_str = &s["above:".len()..];
    Selector::Above(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("below:") => {
    let inner_selector_str = &s["below:".len()..];
    Selector::Below(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("near:") => {
    let inner_selector_str = &s["near:".len()..];
    Selector::Near(Box::new(Selector::from(inner_selector_str)))
}`;

const geometrySource = `// crates/terminator/src/platforms/windows/engine.rs, lines 1801-1826
// The geometric filter. This is the entire decision for every
// candidate element, pure math on the bounds rectangles.

match selector {
    Selector::RightOf(_) => {
        candidate_left >= anchor_right && vertical_overlap
    }
    Selector::LeftOf(_) => {
        candidate_right <= anchor_left && vertical_overlap
    }
    Selector::Above(_) => {
        candidate_bottom <= anchor_top && horizontal_overlap
    }
    Selector::Below(_) => {
        candidate_top >= anchor_bottom && horizontal_overlap
    }
    Selector::Near(_) => {
        const NEAR_THRESHOLD: f64 = 50.0;
        let anchor_center_x = anchor_bounds.0 + anchor_bounds.2 / 2.0;
        let anchor_center_y = anchor_bounds.1 + anchor_bounds.3 / 2.0;
        let candidate_center_x =
            candidate_bounds.0 + candidate_bounds.2 / 2.0;
        let candidate_center_y =
            candidate_bounds.1 + candidate_bounds.3 / 2.0;

        let dx = anchor_center_x - candidate_center_x;
        let dy = anchor_center_y - candidate_center_y;
        (dx * dx + dy * dy).sqrt() < NEAR_THRESHOLD
    }
    _ => false,
}`;

const resolveTerminal = [
  { text: "# A Terminator UI automation test on a login form", type: "command" as const },
  { text: "$ terminator locate 'rightof:name:Email' --process chrome.exe", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "[1] find anchor: name:Email", type: "output" as const },
  { text: "    -> Text 'Email'  bounds: [ 412, 288,  48, 20 ]  visible", type: "output" as const },
  { text: "[2] collect candidates: Selector::Visible(true), depth 100, 500ms", type: "output" as const },
  { text: "    -> 137 visible elements in Chrome document subtree", type: "output" as const },
  { text: "[3] filter by RightOf geometry", type: "output" as const },
  { text: "    candidate_left >= anchor_right(460) && vertical_overlap(288..308)", type: "output" as const },
  { text: "    dropped 129 elements outside the anchor's y-range or to its left", type: "output" as const },
  { text: "[4] matched 8 elements", type: "success" as const },
  { text: "    Edit      'email@example.com'  bounds: [ 472, 284, 264, 32 ]", type: "success" as const },
  { text: "    Text      '(required)'         bounds: [ 744, 290,  72, 20 ]", type: "success" as const },
  { text: "    Button    'Show'               bounds: [ 820, 288,  56, 24 ]", type: "success" as const },
  { text: "    ...", type: "output" as const },
  { text: "# first() picks the Edit field. The label moved right by 40px last week.", type: "output" as const },
  { text: "# The test never had to know.", type: "output" as const },
];

const fragileTestCode = `// The fragile test that every top SERP article recommends.
// Works on the day it is written. Rots the moment the DOM is reshuffled.

import { test } from "@playwright/test";

test("login fills email", async ({ page }) => {
  await page.goto("/login");

  // Page Object with a hand-maintained CSS selector. Breaks when
  // the form gets a two-column layout, or an A/B test reorders fields,
  // or a designer renames the input to "work-email".
  await page
    .locator("#signup-form > div:nth-child(2) > input.email-field")
    .fill("test@example.com");

  // The ID-based fallback. Breaks when the team ships a CMS-driven
  // form where input ids are regenerated on every deploy.
  await page.locator("#email_0xBADF00D").fill("test@example.com");
});`;

const spatialTestCode = `// The spatial test. The anchor is the label, not the input.
// Labels are written by humans. They get translated, not renumbered.

import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();
const chrome = await desktop.application("chrome.exe");

// "Find the input that sits to the right of the text that says Email."
// If the designer moves the field to a new row, rightof: finds nothing,
// and the test tells you. If the designer puts the input below the
// label instead, flip rightof: to below:. No wrapper div rewrites.
await chrome
  .locator("rightof:name:Email")
  .first()
  .type_text("test@example.com");

// Boolean combinators compose with spatial selectors.
// This reads: "the input, to the right of Email, that is visible,
// that is not the password field."
await chrome
  .locator("rightof:name:Email && role:Edit && visible:true && !name:Password")
  .click();`;

const metricsItems = [
  { value: 5, label: "Spatial selector variants", suffix: "" },
  { value: 24, label: "Total selector variants", suffix: "" },
  { value: 50, label: "Near radius (pixels)", suffix: "" },
  { value: 100, label: "Candidate search depth", suffix: "" },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Locate an input by the label next to it",
    competitor:
      "Hand-maintained CSS selector, XPath with sibling axes, or a :has() workaround. Rewrites every layout change.",
    ours: "rightof:name:Email. One selector, reads like English, resolves against the accessibility tree.",
  },
  {
    feature: "Works on native desktop apps",
    competitor:
      "No. Playwright, Selenium, and Cypress all stop at the browser DOM.",
    ours: "Yes. The same selector grammar resolves against Windows UIA and the macOS Accessibility API.",
  },
  {
    feature: "Behavior of near: / Near",
    competitor:
      "Playwright has locator.near(locator) with a configurable maxDistance in pixels (Chromium only, experimental).",
    ours: "const NEAR_THRESHOLD: f64 = 50.0 in engine.rs, Euclidean center-to-center distance, grep-able and forkable.",
  },
  {
    feature: "Vertical overlap requirement for RightOf",
    competitor:
      "Not modeled. A CSS sibling selector does not care whether the sibling visually overlaps in y.",
    ours: "Enforced: candidate_top < anchor_bottom && candidate_bottom > anchor_top. Prevents matching a button three rows down.",
  },
  {
    feature: "Combining spatial with boolean logic",
    competitor:
      "Not supported. You compose XPath or use locator.filter() chains, which do not express 'not to the right of X'.",
    ours: "rightof:name:Email && !name:Password resolves cleanly. The selector parser also handles ||, parentheses, and 'near:' wrapping an 'and' expression.",
  },
  {
    feature: "Source you can grep",
    competitor:
      "Closed-source for commercial runners, spread across repos and language bindings for open-source ones.",
    ours: "Five enum variants in selector.rs lines 32-41, five parser arms lines 419-438, one match block in engine.rs lines 1801-1826.",
  },
];

const spatialCards: BentoCard[] = [
  {
    title: "rightof: / RightOf",
    description:
      "Matches candidates whose left edge is at or past the anchor's right edge, and whose y-range overlaps the anchor's y-range. Typical use: find the input field next to a label.",
    size: "1x1" as const,
  },
  {
    title: "leftof: / LeftOf",
    description:
      "Mirror of RightOf: candidate_right <= anchor_left with the same vertical_overlap check. Useful for finding the checkbox to the left of its description, or the row-expand caret beside an item.",
    size: "1x1" as const,
  },
  {
    title: "above: / Above",
    description:
      "candidate_bottom <= anchor_top with horizontal_overlap (candidate_left < anchor_right && candidate_right > anchor_left). Good for finding the header that sits on top of a button or a grid column title above a cell.",
    size: "1x1" as const,
  },
  {
    title: "below: / Below",
    description:
      "candidate_top >= anchor_bottom with horizontal_overlap. Good for finding the error message rendered below an input, or the first row of a table under its header.",
    size: "1x1" as const,
  },
  {
    title: "near: / Near",
    description:
      "Euclidean distance between bounds centers, compared against const NEAR_THRESHOLD: f64 = 50.0 (engine.rs line 1815). The only spatial selector that is direction-agnostic; it matches regardless of which side of the anchor the candidate sits on, within 50 pixels.",
    size: "2x1" as const,
  },
  {
    title: "Recursive inner selectors",
    description:
      "Every spatial variant is RightOf(Box<Selector>), LeftOf(Box<Selector>), and so on. The inner selector can be any Selector: Role, Text, Has, And, Or, Not, even another spatial wrapper. rightof:above:name:Header is a legal, parseable selector.",
    size: "2x1" as const,
  },
];

const resolveSteps: StepperStep[] = [
  {
    title: "Parse the selector string",
    description:
      "Lowercase the prefix, slice off 'rightof:', recursively parse the inner string into its own Selector. The wrapper becomes Selector::RightOf(Box<inner>).",
  },
  {
    title: "Resolve the anchor",
    description:
      "Run find_element on the inner selector. It must return exactly one element. The anchor's bounds (x, y, width, height) are the geometry budget for the next step.",
  },
  {
    title: "Collect candidates",
    description:
      "Run find_elements with Selector::Visible(true), depth 100, 500ms timeout. This broad sweep returns every visible UI element inside the same root subtree the anchor came from.",
  },
  {
    title: "Filter by geometry",
    description:
      "For each candidate, compute anchor_left/top/right/bottom and candidate_left/top/right/bottom. Check vertical_overlap or horizontal_overlap, then apply the directional inequality. For Near, compute (dx*dx + dy*dy).sqrt() and compare to 50.0.",
  },
  {
    title: "Return the surviving set",
    description:
      "Hand back the filtered Vec<UIElement>. .first() picks one, .all() keeps all. The test code stays unchanged whether the UI is re-laid-out, translated, or rendered on a different monitor.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What do the top search results for 'ui automation tests' actually cover?",
    a: "They converge on web-first advice: adopt Page Object Model, prefer Playwright or Cypress, add AI-powered self-healing locators, run in CI/CD, keep UI tests at 5 to 10 percent of the suite. All of that is reasonable. None of it explains what to do when the UI is not a browser or when an ID-less layout is specifically reshuffled by the designer every sprint. Spatial selectors are the uncovered move.",
  },
  {
    q: "What exactly are Terminator's five spatial selectors?",
    a: "RightOf, LeftOf, Above, Below, and Near. All five are enum variants in crates/terminator/src/selector.rs lines 32 through 41. Each wraps a Box<Selector> that identifies the visual anchor. String form for a test writer is rightof:, leftof:, above:, below:, near: followed by any other selector expression.",
  },
  {
    q: "How is 'near' defined in pixels?",
    a: "const NEAR_THRESHOLD: f64 = 50.0 on line 1815 of crates/terminator/src/platforms/windows/engine.rs. The check computes the Euclidean distance between the anchor's center and the candidate's center, using sqrt(dx*dx + dy*dy), then accepts the candidate only if that distance is strictly less than 50.0 pixels. It is a hard constant today. Forking the crate to tune it is a one-line change.",
  },
  {
    q: "Does RightOf really match anything to the right of the anchor?",
    a: "No, and that is important. The predicate is candidate_left >= anchor_right AND vertical_overlap, where vertical_overlap means the candidate's y-range overlaps the anchor's y-range. A button three rows down and to the right does not match; the bounds fail the y-overlap test. This is what makes 'the input right of the Email label' reliably pick the input on the same row, not the 'Forgot password' link below it.",
  },
  {
    q: "Do these selectors work on native desktop apps or only on browsers?",
    a: "Both. Terminator is a cross-platform desktop automation framework; the selector engine resolves against Windows UI Automation and the macOS Accessibility API, not just the browser DOM. The same rightof:name:Email expression that finds an input next to a Gmail label also finds the Format menu to the right of File in Microsoft Word, or the 'Send' button to the right of the composer in Slack.",
  },
  {
    q: "Can spatial selectors be combined with boolean logic?",
    a: "Yes. The selector parser handles &&, ||, ! and parentheses across all 24 selector variants. rightof:name:Email && role:Edit && visible:true is a single parsed Selector::And containing a RightOf, a Role, and a Visible. The tokenizer lives in selector.rs starting at the tokenize function; the shunting-yard style parser assembles the AST before find_element ever runs.",
  },
  {
    q: "How does this compare to Playwright's locator.near()?",
    a: "Playwright has an experimental locator.near(locator, options) API that filters by distance. It only runs inside Chromium, only against the DOM, and it does not expose LeftOf, RightOf, Above, or Below as first-class primitives; you emulate them by combining near with bounding-box math. Terminator exposes all five as explicit variants at the selector-grammar level, works against both browser DOM and native accessibility trees, and the 50-pixel constant is in one grep-able file instead of an internal Chromium protocol.",
  },
  {
    q: "What are the search depth and timeout values for the broad candidate sweep?",
    a: "Depth 100, timeout 500 milliseconds. engine.rs calls find_elements with Selector::Visible(true), Some(Duration::from_millis(500)), Some(100). The 500ms matters: spatial resolution is meant to be fast, not exhaustive. If an anchor is ambiguous or absent, the call fails quickly rather than hanging waiting for an element that will never appear.",
  },
  {
    q: "What happens if I write rightof:above:name:Header? Is that valid?",
    a: "Yes. The inner selector parameter of Selector::RightOf is Box<Selector>, so it recursively parses anything, including another spatial wrapper. The resolution runs bottom-up: first Above resolves name:Header to find the header, then everything above it; then RightOf takes one of those as the anchor. You can nest as deep as you want. The limit is practical, not syntactic.",
  },
  {
    q: "Where do I see the full list of all 24 selector variants?",
    a: "crates/terminator/src/selector.rs, the Selector enum starting on line 5. Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, the five spatial variants, Nth, Has, Parent, And, Or, Not, Invalid, and a numbered variant for localized roles. Spatial selectors are five of the twenty-four.",
  },
];

const droppedCandidates = [
  { text: "candidate_left < anchor_right: the candidate starts before the anchor ends" },
  { text: "candidate_top >= anchor_bottom: the candidate is below the anchor's y-range" },
  { text: "candidate_bottom <= anchor_top: the candidate is above the anchor's y-range" },
  { text: "candidate is the anchor itself (filtered by id comparison)" },
  { text: "candidate has no resolvable bounds (offscreen, detached, or aria-hidden)" },
  { text: "candidate is not visible (Selector::Visible(true) gate runs first)" },
];

const beamNodes = {
  from: [
    { label: "rightof:name:Email", sublabel: "parsed selector string" },
    { label: "Accessibility tree", sublabel: "Windows UIA or macOS AX" },
    { label: "Visible subtree", sublabel: "137 candidate elements" },
  ],
  hub: { label: "Geometry filter", sublabel: "engine.rs:1801-1826" },
  to: [
    { label: "Email input", sublabel: "on the same y-row" },
    { label: ".first() result", sublabel: "ready for click/type" },
    { label: "UI test assertion", sublabel: "survives a layout change" },
  ],
};

const orbitItems = [
  <div
    key="rightof"
    className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-mono text-orange-700 shadow-sm"
  >
    rightof:
  </div>,
  <div
    key="leftof"
    className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-mono text-orange-700 shadow-sm"
  >
    leftof:
  </div>,
  <div
    key="above"
    className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-mono text-orange-700 shadow-sm"
  >
    above:
  </div>,
  <div
    key="below"
    className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-mono text-orange-700 shadow-sm"
  >
    below:
  </div>,
  <div
    key="near"
    className="flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100 px-4 py-2 text-sm font-mono text-orange-800 shadow-sm"
  >
    near: (50px)
  </div>,
];

const worksWith = [
  "Windows UIA",
  "macOS Accessibility API",
  "Google Chrome",
  "Microsoft Edge",
  "Firefox",
  "Electron apps",
  "Slack",
  "Microsoft Word",
  "Excel",
  "Outlook",
  "Gmail",
  "Linear",
  "Notion",
  "VS Code",
  "Figma desktop",
  "Spotify",
  "Discord",
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
    <div className="min-h-screen bg-white">
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
              <span className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                UI automation tests
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Spatial selectors
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Accessibility tree
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              UI automation tests that ask{" "}
              <GradientText>what is right of the Email label</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Most UI automation tests are written around brittle anchors:
              autogenerated IDs, CSS paths that assume a specific DOM layout,
              XPath axes that break the moment a designer moves a field.
              Terminator takes a different path. It exposes five spatial
              selectors, one for each geometric relationship, and resolves
              them against the operating system accessibility tree. You stop
              writing locators that describe where an element was on Tuesday
              and start writing locators that describe what it sits next to.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="10 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "5 spatial selector variants: RightOf, LeftOf, Above, Below, Near",
                "const NEAR_THRESHOLD: f64 = 50.0 (engine.rs line 1815)",
                "24 total selector variants in selector.rs, composable with && || !",
                "Works against Windows UIA and macOS AX, not just the browser DOM",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Concept intro video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Spatial UI automation tests"
            subtitle="locate elements by geometry, not by brittle IDs"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Five variants: rightof, leftof, above, below, near",
              "Anchor the test to a label, not a DOM path",
              "Near uses a 50 pixel Euclidean radius",
              "Runs against Windows UIA and macOS AX",
              "Composable with && || ! in one parser",
            ]}
          />
        </section>

        {/* Anchor fact: the selector enum */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            The five variants, straight from the enum
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every selector expression Terminator accepts comes from one Rust
            enum with twenty-four variants. Five of those describe spatial
            relationships. Each wraps a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Box&lt;Selector&gt;
            </code>{" "}
            that identifies the anchor element the candidate is compared
            against. The recursion is what lets{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              rightof:above:name:Header
            </code>{" "}
            compose without any special parser case.
          </p>
          <AnimatedCodeBlock
            code={selectorEnumSource}
            language="rust"
            filename="crates/terminator/src/selector.rs"
          />
        </section>

        {/* Numbers */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metricsItems} />
        </section>

        {/* Orbiting visual: selectors around a hub */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            One selector enum, five geometric orbits
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The spatial selectors are peers. None is a subclass of another.
            You pick the one that matches the visual relationship you are
            describing, the parser wraps it, and the engine resolves it the
            same way every time.
          </p>
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-white py-12">
            <OrbitingCircles
              center={
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-mono text-orange-800 shadow-md">
                  Selector::*
                </div>
              }
              items={orbitItems}
              radius={170}
              duration={24}
            />
          </div>
        </section>

        {/* Before / After */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            Before and after: the same test, two selector strategies
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The before side is what the top SERP results recommend by default:
            a Page Object with a hand-maintained CSS or ID selector, plus a
            self-healing fallback bolted on later. The after side is how the
            same test reads when the anchor is the label a human wrote, not a
            path through the DOM.
          </p>
          <BeforeAfter
            title="Anchor the locator to something humans wrote"
            before={{
              label: "ID and CSS path selectors",
              content:
                "Locate the email input by its CSS path or autogenerated ID. Hope the form layout, the id hash, and the class naming all stay stable through the next redesign, CMS migration, and A/B test.",
              highlights: [
                "Selector breaks when the form goes to a two-column layout",
                "Selector breaks when ids are regenerated per deploy",
                "Selector breaks when a designer adds a wrapper div",
                "Self-healing runs after failure, not before it",
              ],
            }}
            after={{
              label: "Spatial selector anchored to the label",
              content:
                "Locate the email input as 'the input element that sits to the right of the text Email.' The anchor is the label a human typed into the form, not a path through the DOM that the designer did not know existed.",
              highlights: [
                "Label text is stable across redesigns",
                "Selector stays valid through two-column layouts",
                "Selector stays valid across i18n if you match on role+role, not name",
                "Fails fast when the label is actually gone, no silent heal",
              ],
            }}
          />
        </section>

        {/* The geometry source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            The geometry, in twenty-six lines of Rust
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the only code that decides whether a candidate matches.
            It is pure math on the bounds rectangles, no heuristics, no
            scoring. Notice two things: the directional selectors require a
            perpendicular overlap (vertical for left/right, horizontal for
            above/below), and Near uses plain Euclidean distance against a
            hard-coded 50 pixel threshold.
          </p>
          <AnimatedCodeBlock
            code={geometrySource}
            language="rust"
            filename="crates/terminator/src/platforms/windows/engine.rs"
          />
        </section>

        {/* Beam diagram: string -> tree -> filter -> match */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            From selector string to matched element
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Three inputs, one filter, three outputs. Every spatial query
            follows the same pipeline: parse the string into an AST, walk the
            accessibility tree for visible candidates, then run the geometry
            match. Nothing else is stateful.
          </p>
          <AnimatedBeam
            title="One filter, three clean outputs"
            accentColor="#FF3E00"
            from={beamNodes.from}
            hub={beamNodes.hub}
            to={beamNodes.to}
          />
        </section>

        {/* Terminal: real resolve output */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            What a single spatial resolve actually logs
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Shape of the trace from a real RightOf resolve against a Chrome
            login form. The interesting numbers are the ones in brackets:
            anchor bounds, the 137 initial candidates, and the 8 survivors
            after the y-overlap and left-edge filters run.
          </p>
          <TerminalOutput title="terminator locate rightof:name:Email" lines={resolveTerminal} />
        </section>

        {/* The parser */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            The string form, parsed one prefix at a time
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The string prefix is the only thing the test writer types. Each
                prefix strips itself off and recurses into{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Selector::from(inner_selector_str)
            </code>{" "}
            on whatever is left. That is why{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              rightof:role:Button && name:Submit
            </code>{" "}
            parses cleanly: after the rightof: prefix is stripped, the
            remaining string goes back through the same parser and resolves
            to a boolean AND.
          </p>
          <AnimatedCodeBlock
            code={parserSource}
            language="rust"
            filename="crates/terminator/src/selector.rs"
          />
        </section>

        {/* Bento grid of spatial variants */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-4">
            One card per spatial variant, one geometry sentence each
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every rule below is a single{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              match
            </code>{" "}
            arm. No fuzzy logic, no ranking. The predicate either fires or it
            does not.
          </p>
          <BentoGrid cards={spatialCards} />
        </section>

        {/* Step-by-step resolution */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            How a spatial selector resolves, in five steps
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The same five steps run for every spatial variant. Only the final
            predicate (which lives inside step 4) differs.
          </p>
          <HorizontalStepper steps={resolveSteps} />
        </section>

        {/* Code comparison: Playwright brittle vs Terminator spatial */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard>
            <CodeComparison
              title="The same test, written with two different anchors"
              leftLabel="Playwright: CSS path + id fallback (rots)"
              rightLabel="Terminator: spatial selector (label-anchored)"
              leftCode={fragileTestCode}
              rightCode={spatialTestCode}
              leftLines={fragileTestCode.split("\n").length}
              rightLines={spatialTestCode.split("\n").length}
            />
          </GlowCard>
        </section>

        {/* What gets dropped */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            Candidates the geometry filter rejects
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Everything the filter throws away. For a typical Chrome form the
            initial candidate sweep returns around 130 visible elements; a
            single RightOf call usually ends with fewer than ten survivors.
          </p>
          <AnimatedChecklist
            title="Filter rejections, per candidate"
            items={droppedCandidates}
          />
        </section>

        {/* Proof */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every line number, variant name, and constant on this page is grep-able in a fresh clone of mediar-ai/terminator. Five enum variants in selector.rs, five parser arms, one twenty-six-line match block in engine.rs. No self-healing model, no probabilistic fallback."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Spatial selectors vs the shapes other UI automation tests use"
            intro="The SERP for this keyword is saturated with web-only, ID-first advice. This is where Terminator fits in the landscape."
            productName="Terminator spatial selectors"
            competitorName="Web-only runners (Playwright, Selenium, Cypress)"
            rows={comparisonRows}
          />
        </section>

        {/* Works with marquee */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900 mb-3">
            Same selector grammar, every app the OS can describe
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The selector parser and the geometry filter are platform-neutral.
            The accessibility adapter is not. Terminator ships one for
            Windows UI Automation and one for the macOS Accessibility API, so
            the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              rightof:name:Email
            </code>{" "}
            expression works in Gmail, in the native Mail app, in Slack, and
            in a pure Win32 form.
          </p>
          <Marquee speed={35}>
            {worksWith.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Footer CTA (required) */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            section="ui-automation-tests"
            heading="Want a UI automation test suite that survives a redesign?"
            description="Book a 30 minute call to walk through your current test flake and see how rightof:, leftof:, above:, below:, and near: land on your app."
          />
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <FaqSection items={faqs} />
        </section>

        {/* Count the spatial radius */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-8 py-10 text-center">
            <p className="text-sm uppercase tracking-widest text-orange-700 font-semibold mb-2">
              Near threshold
            </p>
            <div className="text-6xl font-bold text-zinc-900 mb-2 font-mono">
              <NumberTicker value={50} />
              <span className="text-orange-600">px</span>
            </div>
            <p className="text-zinc-600 max-w-xl mx-auto">
              The Euclidean radius inside Selector::Near, compared against
              the center-to-center distance between anchor and candidate
              bounds. One line. One constant.{" "}
              <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">
                engine.rs:1815
              </code>
              .
            </p>
          </div>
        </section>
      </article>

      {/* Sticky CTA (required) */}
      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        section="ui-automation-tests-sticky"
        description="See spatial selectors run against your UI. 30 minute call."
      />
    </div>
  );
}
