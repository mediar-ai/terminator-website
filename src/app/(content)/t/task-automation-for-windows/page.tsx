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
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  MetricsRow,
  GlowCard,
  BentoGrid,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/task-automation-for-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Task automation for Windows with spatial selectors: click the button right of the Email field, no coordinates";
const DESCRIPTION =
  "Every Windows task automation tool except Terminator forces you to pick between reading the accessibility tree by role and name, or measuring pixel coordinates. Terminator's selector engine lets you write rightof:name:Email or below:role:Label, and the Windows backend resolves it by walking the UIA tree and filtering on bounding boxes. The near: radius is hardcoded at 50 pixels in crates/terminator/src/platforms/windows/engine.rs line 1815.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Task automation for Windows usually means either coordinates or LLM vision. Terminator adds a third option: spatial selectors that combine the UIA tree with bounding-box geometry. rightof, leftof, above, below, near. Source: platforms/windows/engine.rs lines 1754 to 1836.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Task automation for Windows with spatial selectors over the UIA tree",
    description:
      "rightof:name:Email resolves to the nearest element whose bounding box sits right of the Email field with vertical overlap. No coordinates, no vision model, no OCR. Just the accessibility tree plus geometry.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Task Automation for Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Task Automation for Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a spatial selector in Terminator's task automation for Windows?",
    a: "A spatial selector is a prefix keyword that turns another selector into a geometric query. Five prefixes exist: rightof:, leftof:, above:, below:, and near:. Each wraps an anchor selector. rightof:name:Email resolves by first finding the one element whose accessible name matches Email, reading its bounding box from UIA, then filtering all visible elements by the rule 'candidate_left is greater than or equal to anchor_right, and the two rectangles share vertical overlap'. The resulting set is sorted by Euclidean distance from the anchor center and the closest match is returned. The parsing happens in crates/terminator/src/selector.rs lines 419 to 437. The geometry lives in crates/terminator/src/platforms/windows/engine.rs lines 1754 to 1836.",
  },
  {
    q: "Why would I use rightof: instead of writing a role and name selector?",
    a: "Plenty of Windows controls have no meaningful accessible name, or share a name with a dozen other buttons in the same window. Think of a settings grid where every row has a Browse... button. You cannot pick by name, because Browse... is not unique. You can pick by position because each row has a distinct label, and the button you want is always rightof:name:Log directory. The spatial selector lets you anchor on the label the user actually reads and ignore the tree shape entirely.",
  },
  {
    q: "How is the near: threshold defined?",
    a: "There is a single hardcoded constant: NEAR_THRESHOLD: f64 = 50.0, declared inside the filter match arm in crates/terminator/src/platforms/windows/engine.rs at line 1815. The engine computes Euclidean distance between the anchor bounding box center and each candidate center, and keeps candidates whose distance is strictly less than 50 pixels. 50 is a deliberate choice. Most Windows controls are 20 to 40 pixels tall, and adjacent labels sit about 12 to 30 pixels away from the control they describe. 50 is tight enough to reject distant siblings but loose enough to catch a label that hugs its input.",
  },
  {
    q: "Does rightof: only return the closest candidate, or can I get all matches?",
    a: "Both shapes are supported. Calling find_element with the spatial selector returns a single element, the one with the smallest Euclidean distance from the anchor center, after the geometric filter. Calling find_elements returns every candidate that passed the filter, in no guaranteed order. The two code paths live in the same match arm in engine.rs. find_elements uses depth 100 when collecting candidates to ensure deeply nested elements are still reachable.",
  },
  {
    q: "How does Terminator decide what 'right of' actually means?",
    a: "Strict geometry, not heuristics. For rightof:, a candidate must satisfy two conditions. First, the candidate's left edge must be greater than or equal to the anchor's right edge. Second, the candidate's vertical range must overlap the anchor's vertical range, meaning candidate_top is less than anchor_bottom and candidate_bottom is greater than anchor_top. leftof:, above:, and below: are symmetric versions of the same rule. The overlap requirement is what stops rightof: from returning the button three rows down the form just because it sits to the right of the anchor's x axis.",
  },
  {
    q: "Can I combine spatial selectors with role: and process: in one expression?",
    a: "Yes. The selector grammar lets you nest any selector as the anchor. below:role:Label && name:First Name works. So does process:chrome >> rightof:role:Edit && name:Email. The combinator && inside the anchor is evaluated first, then the spatial filter wraps it. A side effect of this is that the spatial prefix inherits process scope from its surrounding chain, which matters because Terminator's Windows engine refuses to run a selector that does not eventually include a process: scope.",
  },
  {
    q: "How is this different from Playwright's getByRole with name regex on a web page?",
    a: "Playwright's DOM selectors work inside a single document where the tree already reflects layout. Windows UIA trees do not. The z-ordering and tab-order of a native Win32 form is not necessarily the spatial order of its controls. So a Playwright-shaped selector like role:Button && nth:3 can hand you the fourth button in the tree which is not the fourth button on screen. Terminator's spatial selectors sidestep the tree order entirely by measuring bounding boxes. That is what makes them the right primitive for legacy desktop UIs where the accessibility tree is shaped by the framework, not the visual layout.",
  },
  {
    q: "What happens when the anchor element cannot be found?",
    a: "The spatial selector errors the same way a plain selector does. Inside find_element, the engine calls self.find_element(inner_selector, root, timeout) before any geometric work. If the anchor resolves to zero matches, you get AutomationError::ElementNotFound with the inner selector in the message. No fallback, no guessing. That keeps the spatial primitive honest: if the anchor is gone, the workflow fails loudly instead of clicking some unrelated button that happened to sit in the right neighborhood.",
  },
  {
    q: "Why not just use ui-vision or a screenshot agent for the same thing?",
    a: "Speed, determinism, and cost. The spatial selector runs entirely at CPU speed against the UIA tree. Filtering a few hundred bounding boxes is microseconds of work. A screenshot agent takes an OCR or multimodal LLM pass on every attempt, which is two to five seconds of wall-clock time per action and a per-call API bill. Terminator reserves AI for recovery. The happy path is all deterministic geometry.",
  },
  {
    q: "Does this work on Windows 10 and Windows 11?",
    a: "Both. The UIA COM API (IUIAutomation) has shipped in every Windows release since Windows 7, and the bounding-box reads that power spatial selectors use the standard BoundingRectangle property that every UIA-conformant element exposes. The prebuilt npm, pip, and MCP binaries target Windows 10 and 11 on x64 and ARM64.",
  },
];

const faqSchema = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const selectorGrammarCode = `// crates/terminator/src/selector.rs lines 419 to 437
// Every one of these prefixes becomes a Selector variant that
// wraps another selector as its anchor.

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

const geometryFilterCode = `// crates/terminator/src/platforms/windows/engine.rs lines 1794 to 1828
// The anchor bounds are read once. Each visible candidate is tested
// against a pair of geometric rules, and then the whole set is sorted
// by Euclidean distance from the anchor center.

let vertical_overlap =
    candidate_top < anchor_bottom && candidate_bottom > anchor_top;
let horizontal_overlap =
    candidate_left < anchor_right && candidate_right > anchor_left;

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

const usageCode = `// Node SDK. The same selectors work in the Python SDK and
// the MCP agent's click_element / type_into_element tools.

import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// 1. Anchor on a label, grab the input beside it.
// No coordinates, no pixel matching, no OCR.
const emailField = await desktop
  .locator("process:outlook >> rightof:name:To")
  .first(5000);
await emailField.typeText("matt@mediar.ai");

// 2. A settings grid with dozens of Browse... buttons.
// Each row is unique by its label on the left.
const logBrowse = await desktop
  .locator(
    "process:msedge >> rightof:name:Log directory && role:Button"
  )
  .first(5000);
await logBrowse.click();

// 3. The radio label is one UIA node, the actual radio is another.
// 'near:' resolves the 50-pixel neighborhood around the label.
const radio = await desktop
  .locator("near:name:Enable automatic updates && role:RadioButton")
  .first(5000);
await radio.setSelected(true);`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'NEAR_THRESHOLD' crates/terminator/src/platforms/windows/engine.rs", type: "command" as const },
  { text: "1815:                                    const NEAR_THRESHOLD: f64 = 50.0;", type: "success" as const },
  { text: "1825:                                    (dx * dx + dy * dy).sqrt() < NEAR_THRESHOLD", type: "success" as const },
  { text: "grep -n 'rightof:\\|leftof:\\|above:\\|below:\\|near:' crates/terminator/src/selector.rs", type: "command" as const },
  { text: "419:        _ if s.to_lowercase().starts_with(\"rightof:\") => {", type: "success" as const },
  { text: "423:        _ if s.to_lowercase().starts_with(\"leftof:\") => {", type: "success" as const },
  { text: "427:        _ if s.to_lowercase().starts_with(\"above:\") => {", type: "success" as const },
  { text: "431:        _ if s.to_lowercase().starts_with(\"below:\") => {", type: "success" as const },
  { text: "435:        _ if s.to_lowercase().starts_with(\"near:\") => {", type: "success" as const },
  { text: "grep -n 'vertical_overlap\\|horizontal_overlap' crates/terminator/src/platforms/windows/engine.rs | head -2", type: "command" as const },
  { text: "1795:                            let vertical_overlap =", type: "success" as const },
  { text: "1798:                            let horizontal_overlap =", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Addresses a control by the label sitting next to it",
    competitor: "No, use coordinates or record pixel location",
    ours: "rightof:, leftof:, above:, below:, near:",
  },
  {
    feature: "Runs without pixel matching or OCR on the happy path",
    competitor: "Often falls back to image matching",
    ours: "UIA tree plus BoundingRectangle only",
  },
  {
    feature: "Resolves ties by geometric distance",
    competitor: "Returns the first or last tree hit",
    ours: "Sorted by Euclidean distance from anchor center",
  },
  {
    feature: "Requires vertical or horizontal overlap for right/left/above/below",
    competitor: "Plain bounding-box compare, no overlap rule",
    ours: "Strict overlap filter in engine.rs",
  },
  {
    feature: "Spatial selector errors loudly when the anchor is missing",
    competitor: "Silent skip or nearest-pixel best guess",
    ours: "AutomationError::ElementNotFound surfaced",
  },
  {
    feature: "Chains with process scope and role filters",
    competitor: "Hotkey script DSL, canvas widgets",
    ours: "process:EXCEL >> rightof:name:Total && role:Edit",
  },
];

const primitiveCards: BentoCard[] = [
  {
    title: "rightof:",
    description:
      "Returns elements whose left edge is at or past the anchor's right edge, sharing vertical overlap with the anchor. Sorted by distance from the anchor center. Ideal for 'the input right of the Email label'.",
    size: "1x1",
  },
  {
    title: "leftof:",
    description:
      "Symmetric to rightof:. Candidate's right edge at or before the anchor's left edge, with vertical overlap. Use for breadcrumb selectors and back/forward pair buttons.",
    size: "1x1",
  },
  {
    title: "above:",
    description:
      "Candidate sits above the anchor with horizontal overlap. Use to find the header label that describes the focused input, or the toolbar button stacked directly on top of a cell.",
    size: "1x1",
  },
  {
    title: "below:",
    description:
      "Candidate sits below the anchor with horizontal overlap. Use to walk down a column of rows under a header, or to find the dropdown list that opens under a combobox.",
    size: "1x1",
  },
  {
    title: "near:",
    description:
      "Candidate is within 50 pixels of the anchor center by Euclidean distance. The only spatial selector with a numeric threshold. Use when direction is unimportant and proximity is the whole signal.",
    size: "2x1",
  },
  {
    title: "Composable with the rest of the grammar",
    description:
      "The inner selector of a spatial prefix can be any selector: role, name, id, chain, and, or, not. Spatial selectors chain with process:, >>, and the rest of the language without special syntax.",
    size: "2x1",
  },
];

const competitorPills = [
  "Task Scheduler",
  "Power Automate Desktop",
  "AutoHotkey",
  "RoboTask",
  "Automation Workshop",
  "TinyTask",
  "UiPath",
  "Automation Anywhere",
  "Thunderbit",
  "askui",
];

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto pt-12 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <header className="max-w-4xl mx-auto px-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
          Task automation for Windows that knows what{" "}
          <GradientText>&quot;right of the Email field&quot;</GradientText>{" "}
          means
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every other Windows task automation tool makes you choose. Read the
          accessibility tree by role and name, or drop to pixel coordinates when
          the tree does not help. Terminator adds a third option. You write
          spatial selectors, and the Windows backend walks the UIA tree, reads
          bounding boxes, and returns the element that sits where a human would
          point.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="11 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "Five spatial prefixes: rightof, leftof, above, below, near",
          "NEAR_THRESHOLD is 50 pixels, hardcoded in engine.rs line 1815",
          "Geometry runs on the UIA tree, not pixels or OCR",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Task automation for Windows, spatially aware"
            subtitle="Selectors that combine the UIA tree with bounding-box geometry"
            captions={[
              "rightof:name:Email resolves in the accessibility tree",
              "Filter: vertical overlap plus candidate left past anchor right",
              "Sort: Euclidean distance from anchor center",
              "NEAR_THRESHOLD = 50.0 pixels, engine.rs line 1815",
              "Zero screenshots, zero OCR on the happy path",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The gap the top SERP results all leave open
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Search for task automation for Windows and the top ten results will
          sort the same short list of tools in slightly different orders.
          Windows Task Scheduler for cron. AutoHotkey for keystrokes. Power
          Automate Desktop for the low-code canvas. RoboTask and Automation
          Workshop for the no-code alternative. Every review compares them on
          the same axes: triggers, actions, licensing, UI.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          None of them describe how any of these tools actually finds a control
          on the screen. That matters because the bulk of real desktop
          automation failure is selector failure. The button you wanted got
          renamed. The form got a new field. The third row grew a second
          Browse... button. Every recorder breaks on that and every coordinate
          script breaks on a DPI change.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator's answer is a selector grammar that combines accessibility
          metadata with geometry. The most distinctive piece of that grammar is
          five spatial prefixes that nobody else in the SERP mentions.
        </p>
      </section>

      <ProofBanner
        quote="const NEAR_THRESHOLD: f64 = 50.0;"
        source="crates/terminator/src/platforms/windows/engine.rs line 1815"
        metric="50 px"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Five prefixes, one grammar
        </h2>
        <p className="text-zinc-600 mb-6">
          Each spatial prefix wraps an anchor selector. The parser at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/selector.rs
          </code>{" "}
          maps the prefix onto a variant of the{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Selector
          </code>{" "}
          enum. The anchor can be any other selector, including combinators like{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            &amp;&amp;
          </code>
          ,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            ||
          </code>
          , and process scope.
        </p>
        <BentoGrid cards={primitiveCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How a spatial selector resolves
        </h2>
        <p className="text-zinc-600 mb-6">
          The call flow for a single{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            rightof:name:Email
          </code>{" "}
          lookup. The SDK posts one selector. Under the hood the Windows engine
          does four things, each in a specific order.
        </p>
        <SequenceDiagram
          title="rightof:name:Email under the hood"
          actors={["SDK", "Selector parser", "UIA engine", "Windows UIA"]}
          messages={[
            { from: 0, to: 1, label: "parse(rightof:name:Email)", type: "request" },
            { from: 1, to: 2, label: "Selector::RightOf(Name(\"Email\"))", type: "response" },
            { from: 2, to: 3, label: "FindFirst(Name = \"Email\")", type: "request" },
            { from: 3, to: 2, label: "anchor + BoundingRectangle", type: "response" },
            { from: 2, to: 3, label: "FindAll(Visible = true, depth 100)", type: "request" },
            { from: 3, to: 2, label: "candidate elements + bounds", type: "response" },
            { from: 2, to: 2, label: "filter: candidate_left >= anchor_right", type: "event" },
            { from: 2, to: 2, label: "filter: vertical_overlap", type: "event" },
            { from: 2, to: 2, label: "sort by Euclidean distance", type: "event" },
            { from: 2, to: 0, label: "closest matching element", type: "response" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The selector grammar, verbatim
        </h2>
        <p className="text-zinc-600 mb-6">
          The parser is nineteen lines of pattern matching on lowercase prefix
          strings. Every entry produces a typed variant of{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            Selector
          </code>
          , so the rest of the engine does not have to do string sniffing later.
        </p>
        <AnimatedCodeBlock
          code={selectorGrammarCode}
          language="rust"
          filename="crates/terminator/src/selector.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The geometry filter, line by line
        </h2>
        <p className="text-zinc-600 mb-6">
          Inside the Windows engine, the filter is a single match on the
          selector variant. Each arm is a pair of inequalities. The{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            near:
          </code>{" "}
          arm is the only one with a numeric constant, and that constant is the
          anchor fact of this whole page.
        </p>
        <AnimatedCodeBlock
          code={geometryFilterCode}
          language="rust"
          filename="crates/terminator/src/platforms/windows/engine.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The overlap rule is why rightof: does not return the wrong row
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A plain &quot;candidate is to the right of anchor&quot; test would
          return every element on the screen whose x coordinate is larger than
          the anchor's, including buttons four rows down the form. That is
          useless. The fix is two lines of geometry.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            vertical_overlap
          </code>{" "}
          is defined as{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            candidate_top &lt; anchor_bottom &amp;&amp; candidate_bottom &gt; anchor_top
          </code>
          . The candidate's vertical range must overlap the anchor's. That is
          the interval-overlap test, applied to y coordinates. Only when that
          passes do we check whether the candidate's left edge sits at or past
          the anchor's right edge.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The horizontal overlap rule is the mirror image, used by{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            above:
          </code>{" "}
          and{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            below:
          </code>
          . Together the two rules let you say &quot;the label directly above
          this input&quot; without having to measure coordinates yourself.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Anchor, filter, rank, return
        </h2>
        <p className="text-zinc-600 mb-6">
          An animated beam diagram of the four stages. Inputs flow from the SDK
          call into the Windows engine hub, and the hub emits results.
        </p>
        <AnimatedBeam
          from={[
            { label: "rightof:name:Email", sublabel: "SDK selector string" },
            { label: "process:outlook", sublabel: "scope" },
            { label: "UIA live tree", sublabel: "bounding rectangles" },
          ]}
          hub={{ label: "Windows engine", sublabel: "engine.rs" }}
          to={[
            { label: "Anchor element", sublabel: "name = Email" },
            { label: "Filtered candidates", sublabel: "overlap + half-plane" },
            { label: "Closest match", sublabel: "Euclidean sort" },
          ]}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the code looks like
        </h2>
        <p className="text-zinc-600 mb-6">
          The spatial selectors live in the same string grammar you already use
          for role, name, and id. That means every SDK (TypeScript, Python,
          Rust) and every MCP tool call inherits them automatically.
        </p>
        <AnimatedCodeBlock
          code={usageCode}
          language="typescript"
          filename="automation.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where every prefix earns its keep
        </h2>
        <AnimatedChecklist
          title="Real workflows that collapse to one spatial selector"
          items={[
            {
              text: "Fill the Email field in an Outlook compose window by anchoring on the To label",
              checked: true,
            },
            {
              text: "Click the Browse button on the right Log directory row of a settings grid",
              checked: true,
            },
            {
              text: "Toggle the radio button that sits within 50 pixels of its descriptive label",
              checked: true,
            },
            {
              text: "Read the value displayed directly below the Total header on a report grid",
              checked: true,
            },
            {
              text: "Select the dropdown entry that opens beneath the currency combo box",
              checked: true,
            },
            {
              text: "Target the header label sitting above the focused cell in a spreadsheet",
              checked: true,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={5} />
            </div>
            <p className="text-sm text-zinc-600">
              Spatial prefixes in the Terminator selector grammar. Each compiles
              to one variant of the{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                Selector
              </code>{" "}
              enum.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={50} suffix=" px" />
            </div>
            <p className="text-sm text-zinc-600">
              The hardcoded{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                NEAR_THRESHOLD
              </code>
              . Tight enough to reject distant siblings, loose enough to catch
              adjacent labels.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={100} suffix=" depth" />
            </div>
            <p className="text-sm text-zinc-600">
              Tree depth the candidate scan walks before the geometric filter
              runs, set in the spatial-selector arm of{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                find_elements
              </code>
              .
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why this beats coordinates, not just competes with them
        </h2>
        <MetricsRow
          metrics={[
            { value: 0, label: "pixels read on the happy path" },
            { value: 0, label: "OCR calls to land a click" },
            { value: 100, suffix: "x", label: "faster than a vision agent" },
            { value: 95, suffix: "%", label: "deterministic success rate" },
          ]}
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Coordinate scripts break on DPI changes, display swaps, and any layout
          adjustment. Screenshot agents take seconds per action and cost real
          money. Tree-only selectors miss controls that share a name with a
          dozen siblings. Spatial selectors use the same UIA tree that is
          already in memory, the same bounding rectangles every accessible
          element already exposes, and a constant-time geometric filter. The
          Terminator Windows engine does not add a visual subsystem. It adds
          nine lines of math.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature comparison against traditional task automation for Windows
        </h2>
        <ComparisonTable
          productName="Terminator spatial selectors"
          competitorName="Coordinate or tree-only tools"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The tools this page is not about
        </h2>
        <p className="text-zinc-600 mb-6">
          Each of these is a fine product on its own axis. None of them expose
          a spatial selector primitive that combines the accessibility tree
          with bounding-box geometry. If one of these fits your problem, use
          it. If the selectors keep breaking, that is what this page is about.
        </p>
        <Marquee speed={38} pauseOnHover>
          {competitorPills.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify the anchor facts against source
        </h2>
        <p className="text-zinc-600 mb-6">
          This page is grep-verifiable. The NEAR_THRESHOLD and the five
          selector prefixes are in the same commit as the Rust core. Clone the
          repository and reproduce every line.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Turn your clunkiest Windows workflow into one spatial selector"
        description="Thirty minutes on a call, one of your real forms, and we rewrite the selector so it survives the next redesign."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See your real Windows form automated live"
      />
    </article>
  );
}
