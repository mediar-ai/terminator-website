import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  OrbitingCircles,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  BeforeAfter,
  HorizontalStepper,
  BentoGrid,
  GlowCard,
  MetricsRow,
  AnimatedChecklist,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/microsoft-ui-automation";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Microsoft UI Automation has no spatial selectors. Terminator adds five.";
const DESCRIPTION =
  "The IUIAutomation surface lets you walk the tree and filter by property, but not by geometry. Terminator extends Microsoft UI Automation with rightof:, leftof:, above:, below:, and near: operators that resolve an anchor through UIA and then filter candidates by bounding-rectangle math. NEAR_THRESHOLD is 50 pixels. Source: engine.rs lines 1754 to 1836.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Microsoft UI Automation exposes trees and property conditions, never geometry. Terminator adds five spatial selectors so you can say rightof:name:Username and get the edit field next to the label.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spatial selectors for Microsoft UI Automation",
    description:
      "rightof:, leftof:, above:, below:, near:. A 50 pixel threshold, vertical and horizontal overlap rules, MIT-licensed Rust. engine.rs lines 1754 to 1836.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Microsoft UI Automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Microsoft UI Automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is Microsoft UI Automation?",
    a: "Microsoft UI Automation (UIA) is the COM-based accessibility framework that ships with Windows. It is the successor to MSAA and exposes the entire desktop as a tree of IUIAutomationElement nodes with typed control patterns (Invoke, Value, Toggle, ExpandCollapse, Window, Selection, Scroll, RangeValue). You navigate the tree with IUIAutomationTreeWalker, filter by property with IUIAutomationPropertyCondition, and read fields like Name, ControlType, BoundingRectangle, and AutomationId from every node. Screen readers like Narrator, inspection tools like Inspect.exe, and automation frameworks like FlaUI, WinAppDriver, and Terminator all drive this surface.",
  },
  {
    q: "Why does Microsoft UI Automation not have a spatial selector?",
    a: "UIA is an accessibility API, not a layout API. The assumption is that assistive technology walks a logical tree and reads semantic roles, so the surface exposes parent, child, and sibling relationships plus a flat BoundingRectangle property per element. There is no built-in IUIAutomation method like FindRightOf or FindNear. If you want to say 'the edit control to the right of the Username label' you have to read every candidate's BoundingRectangle and do the math yourself. Terminator does that math for you as a first-class selector operator.",
  },
  {
    q: "How does Terminator implement rightof and the other spatial selectors?",
    a: "The implementation lives in crates/terminator/src/platforms/windows/engine.rs between lines 1754 and 1836. Step one: resolve the anchor selector through the normal UIA path so you know the anchor's (x, y, width, height). Step two: collect candidate elements via a broad Selector::Visible(true) query with depth 100 and a 500 ms timeout. Step three: filter candidates by bounding-rectangle math. For RightOf, a candidate qualifies when candidate_left >= anchor_right and the two rectangles share vertical overlap (candidate_top < anchor_bottom && candidate_bottom > anchor_top). LeftOf mirrors that. Above and Below use horizontal overlap instead. Near computes Euclidean distance between rectangle centers and accepts anything under NEAR_THRESHOLD, which is 50.0 pixels.",
  },
  {
    q: "What is the exact NEAR_THRESHOLD value?",
    a: "50.0 pixels, defined inline on line 1815 of engine.rs as `const NEAR_THRESHOLD: f64 = 50.0;`. The distance is center-to-center Euclidean: `(dx*dx + dy*dy).sqrt()`. That is a small radius chosen so near: matches only elements that visibly belong to the same cluster (a label and its input, a row header and its first cell). For wider hits use below: or rightof: where the bound is an overlap test, not a distance.",
  },
  {
    q: "Why filter by vertical or horizontal overlap instead of pure left/right?",
    a: "If you only tested candidate_left >= anchor_right for RightOf, you would match every element anywhere on the screen that happens to sit to the right of the anchor's x coordinate, including things on different rows. Requiring that the candidate and anchor rectangles overlap vertically scopes RightOf to items that are in the same horizontal band as the anchor, which matches what a human means by 'to the right of'. Above and Below flip the axis and require horizontal overlap for the same reason.",
  },
  {
    q: "Can I chain spatial selectors with boolean operators?",
    a: "Yes. The selector grammar in crates/terminator/src/selector.rs (753 lines) tokenizes boolean operators &&, ||, !, parentheses, and the comma shorthand, and the Shunting-Yard parser merges them with atomic prefixes like role:, name:, id:, classname:, visible:, process:, rightof:, leftof:, above:, below:, near:, nth:, and has:. So `role:Edit && rightof:name:Username` compiles to a Chain([And([Role(Edit, None), RightOf(Name(Username))])]) predicate. The inner selector of a spatial operator can itself be any expression, which is why the engine recurses into inner selectors for process scoping, visibility, and anchor resolution.",
  },
  {
    q: "How is this different from Inspect.exe, FlaUI, or Microsoft's own automation samples?",
    a: "Inspect.exe is a viewer. It shows you the UIA tree and properties but does not let you script actions. FlaUI is the canonical .NET UIA wrapper; it gives you a FindAll with conditions and a bounding rectangle per element, but no spatial operator. Microsoft's own samples under windows-classic-samples demonstrate TreeWalker and PropertyCondition but never layout-relative queries. Terminator is the only open-source framework I know that bakes spatial selectors into the locator grammar and ships the resolver across Rust, Node.js, Python, and an MCP server.",
  },
  {
    q: "What happens if the anchor resolves to more than one element?",
    a: "find_element is used to resolve the anchor, not find_elements, so the API contract is that the anchor must be unique. If your inner selector matches multiple candidates, resolution fails with an ambiguity error and the spatial selector never runs. In practice you narrow the anchor with the same grammar you use everywhere else: `rightof:(role:Text && name:Username)` instead of `rightof:name:Username` if the bare name matches more than one label.",
  },
  {
    q: "Does this work for WPF, WinUI 3, UWP, and Win32?",
    a: "Yes, because every surface that UIA exposes has a BoundingRectangle. Terminator's selector engine does not care whether a given HWND is a Win32 button, a WPF Button, a UWP AppBarButton, or a WinUI 3 ContentDialog primary button; it only reads what UIA returns. For Win32 controls that pre-date UIA, the IAccessible bridge fills in the bounds and the same RightOf / Above math applies. The only surface where spatial selectors do not apply cleanly is off-screen virtualized items, because their bounds come back as zeros until they scroll into view.",
  },
  {
    q: "Where is the source and what is the license?",
    a: "Terminator is MIT licensed. The spatial selector resolver is in crates/terminator/src/platforms/windows/engine.rs between lines 1754 and 1836. The selector AST (the Rust enum with RightOf, LeftOf, Above, Below, Near variants) is at the top of crates/terminator/src/selector.rs. The documented selector grammar is in docs/SELECTORS_CHEATSHEET.md. Install from npm as @mediar-ai/terminator, from pip as terminator-py, or run the MCP server with `npx -y terminator-mcp-agent@latest`.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "find element by screen geometry relative to an anchor",
    competitor: "write manual BoundingRectangle math per element",
    ours: "rightof:name:Username resolves in one locator call",
  },
  {
    feature: "compose spatial and property filters",
    competitor: "one PropertyCondition at a time",
    ours: "role:Edit && rightof:name:Username && !visible:false",
  },
  {
    feature: "overlap-aware left / right / above / below",
    competitor: "raw x coordinate comparison",
    ours: "requires vertical overlap for rightof/leftof, horizontal overlap for above/below",
  },
  {
    feature: "Euclidean near selector",
    competitor: "not exposed by IUIAutomation",
    ours: "NEAR_THRESHOLD = 50.0 px, center-to-center",
  },
  {
    feature: "available from TypeScript, Python, Rust, MCP",
    competitor: "C++ COM, C# via UIAutomationClient",
    ours: "@mediar-ai/terminator, terminator-py, terminator-rs, terminator-mcp-agent",
  },
  {
    feature: "MIT-licensed source you can audit",
    competitor: "Win32 COM surface, no implementation visibility",
    ours: "engine.rs lines 1754 to 1836, on GitHub",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "rightof:",
    description:
      "candidate_left >= anchor_right with vertical overlap. Grab the text box that sits next to the label, even when the tree order does not match the visual order.",
    size: "1x1",
  },
  {
    title: "leftof:",
    description:
      "Mirror of rightof. candidate_right <= anchor_left with vertical overlap. Useful for prefix labels, icons, and row headers that render to the left of data.",
    size: "1x1",
  },
  {
    title: "above:",
    description:
      "candidate_bottom <= anchor_top with horizontal overlap. Finds the heading or form label stacked on top of a control.",
    size: "1x1",
  },
  {
    title: "below:",
    description:
      "candidate_top >= anchor_bottom with horizontal overlap. The click target for validation messages, helper text, or the next input down the form.",
    size: "2x1",
    accent: true,
  },
  {
    title: "near:",
    description:
      "Center-to-center Euclidean distance under NEAR_THRESHOLD (50.0 px). Matches elements that visibly belong to the same cluster as the anchor, regardless of axis.",
    size: "1x1",
  },
  {
    title: "anchor",
    description:
      "The inner selector passed to any spatial operator. Resolved via find_element, so it must match a single element. If your anchor is ambiguous, narrow it with && before wrapping.",
    size: "2x1",
  },
];

const spatialResolverSource = `// crates/terminator/src/platforms/windows/engine.rs
// lines 1754 to 1836

Selector::RightOf(inner_selector)
| Selector::LeftOf(inner_selector)
| Selector::Above(inner_selector)
| Selector::Below(inner_selector)
| Selector::Near(inner_selector) => {
    // 1. Find the anchor element. Must be a single element.
    let anchor_element = self.find_element(inner_selector, root, timeout)?;
    let anchor_bounds = anchor_element.bounds()?; // (x, y, width, height)

    // 2. Get all candidate elements within the same root.
    let all_elements = self.find_elements(
        &Selector::Visible(true),
        root,
        Some(Duration::from_millis(500)),
        Some(100),
    )?;

    // 3. Filter candidates based on geometric relationship
    let anchor_id = anchor_element.id();
    let filtered_elements = all_elements
        .into_iter()
        .filter(|candidate| {
            if candidate.id() == anchor_id { return false; }
            if let Ok(candidate_bounds) = candidate.bounds() {
                let anchor_left   = anchor_bounds.0;
                let anchor_top    = anchor_bounds.1;
                let anchor_right  = anchor_bounds.0 + anchor_bounds.2;
                let anchor_bottom = anchor_bounds.1 + anchor_bounds.3;

                let candidate_left   = candidate_bounds.0;
                let candidate_top    = candidate_bounds.1;
                let candidate_right  = candidate_bounds.0 + candidate_bounds.2;
                let candidate_bottom = candidate_bounds.1 + candidate_bounds.3;

                let vertical_overlap =
                    candidate_top < anchor_bottom && candidate_bottom > anchor_top;
                let horizontal_overlap =
                    candidate_left < anchor_right && candidate_right > anchor_left;

                match selector {
                    Selector::RightOf(_) =>
                        candidate_left >= anchor_right && vertical_overlap,
                    Selector::LeftOf(_)  =>
                        candidate_right <= anchor_left && vertical_overlap,
                    Selector::Above(_)   =>
                        candidate_bottom <= anchor_top && horizontal_overlap,
                    Selector::Below(_)   =>
                        candidate_top >= anchor_bottom && horizontal_overlap,
                    Selector::Near(_) => {
                        const NEAR_THRESHOLD: f64 = 50.0;
                        let anchor_cx = anchor_bounds.0 + anchor_bounds.2 / 2.0;
                        let anchor_cy = anchor_bounds.1 + anchor_bounds.3 / 2.0;
                        let cand_cx   = candidate_bounds.0 + candidate_bounds.2 / 2.0;
                        let cand_cy   = candidate_bounds.1 + candidate_bounds.3 / 2.0;
                        let dx = anchor_cx - cand_cx;
                        let dy = anchor_cy - cand_cy;
                        (dx * dx + dy * dy).sqrt() < NEAR_THRESHOLD
                    }
                    _ => false,
                }
            } else { false }
        })
        .collect();

    Ok(filtered_elements)
}`;

const manualUiaSource = `// What you have to write directly against IUIAutomation
// when you want "the edit box right of the Username label"

IUIAutomation *automation;
CoCreateInstance(CLSID_CUIAutomation, NULL, CLSCTX_INPROC_SERVER,
                 IID_IUIAutomation, (void**)&automation);

// 1. Resolve the anchor by Name
IUIAutomationCondition *nameCond;
VARIANT v; v.vt = VT_BSTR; v.bstrVal = SysAllocString(L"Username");
automation->CreatePropertyCondition(UIA_NamePropertyId, v, &nameCond);

IUIAutomationElement *root, *anchor;
automation->GetRootElement(&root);
root->FindFirst(TreeScope_Descendants, nameCond, &anchor);

RECT anchorRect;
anchor->get_CurrentBoundingRectangle(&anchorRect);

// 2. Enumerate every visible element, read every bounding rectangle,
//    then filter by vertical overlap and candidate_left >= anchor_right.
IUIAutomationCondition *trueCond;
automation->CreateTrueCondition(&trueCond);

IUIAutomationElementArray *all;
root->FindAll(TreeScope_Descendants, trueCond, &all);

int len; all->get_Length(&len);
for (int i = 0; i < len; i++) {
    IUIAutomationElement *cand;
    all->GetElement(i, &cand);
    RECT r; cand->get_CurrentBoundingRectangle(&r);
    bool verticalOverlap = r.top < anchorRect.bottom && r.bottom > anchorRect.top;
    if (r.left >= anchorRect.right && verticalOverlap) {
        // candidate is to the right of the anchor
    }
}`;

const terminatorUsageSource = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// "The edit control to the right of the Username label, in Notepad."
const username = desktop.locator(
  "process:notepad >> role:Edit && rightof:name:Username"
);

await username.first(3000).then((el) => el.typeText("matthew"));

// "Whatever sits directly below the Save button."
const belowSave = desktop.locator("below:(role:Button && name:Save)");

// "Anything within 50 px of the Cancel label."
const nearCancel = desktop.locator("near:text:Cancel");`;

const metricsA = [
  { value: 5, label: "spatial operators (rightof, leftof, above, below, near)" },
  { value: 50, suffix: " px", label: "NEAR_THRESHOLD Euclidean radius" },
  { value: 100, label: "default candidate search depth" },
  { value: 500, suffix: " ms", label: "candidate-collection timeout" },
];

const stepperSteps = [
  {
    title: "Parse selector",
    description:
      "selector.rs tokenizes the string and builds a Selector AST. `rightof:name:Username` becomes Selector::RightOf(Box::new(Selector::Name(\"Username\"))).",
  },
  {
    title: "Resolve anchor",
    description:
      "engine.rs calls find_element on the inner selector. One UIA FindFirst with the anchor's property condition, returning a single IUIAutomationElement.",
  },
  {
    title: "Collect candidates",
    description:
      "A broad Selector::Visible(true) query runs with depth 100 and a 500 ms budget. This is the only expensive part of the pipeline.",
  },
  {
    title: "Filter by geometry",
    description:
      "Each candidate's bounding rectangle is compared against the anchor's using the overlap rules for rightof/leftof/above/below, or the Euclidean distance for near.",
  },
];

const checklistItems = [
  { text: "Use the same selector everywhere. `rightof:name:Username` works from Rust, Node, Python, and the MCP tool calls." },
  { text: "Narrow the anchor with &&. A bare name: often matches more than one element; spatial selectors need a unique anchor." },
  { text: "Prefer rightof/leftof/above/below over near when you actually mean 'in the same row/column'. Overlap beats radius." },
  { text: "Pair spatial selectors with role: or classname:. `role:Edit && rightof:name:Username` is faster and sharper than rightof alone." },
  { text: "Remember the 500 ms candidate timeout. If the app is still loading, spatial selectors will return empty; wrap them in locator.first(timeout) to retry." },
];

const relatedPosts = [
  {
    title: "Microsoft UI Automation tool: cached subtree builder",
    excerpt:
      "The companion piece. How tree_builder.rs pre-fetches seven UIProperty fields with one IUIAutomationCacheRequest and TreeScope::Subtree.",
    href: "/t/microsoft-ui-automation-tool",
    tag: "Caching",
  },
  {
    title: "Coded UI automation, reshaped around a selector chain",
    excerpt:
      "Microsoft deprecated Coded UI Test. Terminator brings a Playwright-style >> chain that reuses the same AutomationId CUIT addressed.",
    href: "/t/coded-ui-automation",
    tag: "Legacy",
  },
  {
    title: "UI automation testing without a dedicated test framework",
    excerpt:
      "Locator timeouts, validate(), and waitFor() compose into a deterministic workflow without dragging in Mocha or Pytest.",
    href: "/t/ui-automation-testing",
    tag: "Testing",
  },
];

const motionFrames = [
  {
    title: "The raw UIA surface",
    body: "Trees and property conditions. No layout-aware primitive.",
    duration: 2000,
  },
  {
    title: "Step 1: resolve the anchor",
    body: "find_element runs on the inner selector. One IUIAutomationElement comes back.",
    duration: 2200,
  },
  {
    title: "Step 2: collect visible candidates",
    body: "A broad Selector::Visible(true) query runs at depth 100 with a 500 ms budget.",
    duration: 2400,
  },
  {
    title: "Step 3: filter by geometry",
    body: "Overlap rules for rightof/leftof/above/below. Euclidean distance for near (< 50 px).",
    duration: 2400,
  },
  {
    title: "The locator resolves",
    body: "`rightof:name:Username` returns the edit field next to the label.",
    duration: 2200,
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
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Microsoft UI Automation has no{" "}
              <GradientText>spatial selectors</GradientText>. Terminator adds
              five.
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              IUIAutomation lets you walk a tree and filter by property. It
              does not let you ask for "the edit control to the right of the
              Username label". Terminator extends the surface with five
              geometry-aware operators that resolve an anchor through UIA and
              then filter visible candidates by bounding-rectangle math. The
              whole resolver is 82 lines of Rust in engine.rs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                rightof:
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                leftof:
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                above:
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                below:
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                near:
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                NEAR_THRESHOLD = 50.0 px
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Terminator maintainer"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping desktop automation"
            highlights={[
              "Five spatial selectors layered on top of IUIAutomation",
              "Overlap rules for rightof, leftof, above, below",
              "NEAR_THRESHOLD = 50.0 px center-to-center Euclidean",
              "Open source: engine.rs lines 1754 to 1836, MIT licensed",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="Geometry-aware UIA"
            subtitle="Five selectors the Microsoft surface does not ship"
            captions={[
              "rightof:name:Username",
              "leftof:role:Checkbox",
              "above:name:OK",
              "below:role:Button",
              "near:text:Cancel",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the SERP keeps missing
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Search "microsoft ui automation" and the first page is the
            Microsoft Learn UI Automation Overview, the Win32 entry-uiauto-win32
            reference, Wikipedia, a FlaUI tutorial, and a TestComplete marketing
            page. They all cover the same ground: UIA succeeded MSAA, it exposes
            IUIAutomation, IUIAutomationElement, a TreeWalker, property
            conditions, and control patterns. Every one of them stops at the
            COM surface.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of them answers the question you actually hit five minutes
            into a real project: the accessible name I want is on a static
            Text element, but the thing I need to click is a different element
            that happens to sit next to it. UIA has BoundingRectangle on every
            node. It just does not have any primitive that says "elements to
            the right of X" or "elements near Y". You can build it from raw
            coordinates, and people have, but nobody on the first SERP page
            ships it as a locator.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This page is the resolver, in Rust, with line numbers.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The five operators, orbiting the anchor
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every spatial selector takes an inner selector (the anchor) and
            returns the candidates that satisfy the relation. RightOf, LeftOf,
            Above, and Below use overlap on the perpendicular axis. Near uses
            a Euclidean radius.
          </p>
          <OrbitingCircles
            center={
              <div className="text-center">
                <div className="text-xs font-mono text-orange-600 uppercase tracking-widest">
                  anchor
                </div>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  inner selector
                </div>
              </div>
            }
            items={[
              <span key="r" className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">rightof:</span>,
              <span key="l" className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">leftof:</span>,
              <span key="a" className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">above:</span>,
              <span key="b" className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">below:</span>,
              <span key="n" className="font-mono text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">near:</span>,
            ]}
            radius={150}
            duration={30}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The resolver, watched step by step
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Scroll into the frame below and the pipeline plays out: anchor
            resolution, candidate collection, geometric filter. This is
            exactly what happens inside a single locator() call when you use
            any of the five operators.
          </p>
          <MotionSequence frames={motionFrames} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="The spatial resolver is the only 82-line block that sits between a UIA FindFirst and a click. One anchor call, one broad candidate query, one bounding-box filter."
            source="engine.rs::find_elements, Selector::RightOf match arm"
            metric="82 loc"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor: engine.rs lines 1754 to 1836
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the function arm. It is the entire implementation. Nothing
            hidden in another file, nothing deferred to a plugin. Paste the
            keyword into GitHub search on mediar-ai/terminator and you land
            here.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={spatialResolverSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/engine.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things to notice. Anchor resolution uses{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              find_element
            </code>
            , so the inner selector must be unambiguous. The candidate pool is
            a broad{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Selector::Visible(true)
            </code>{" "}
            query at depth 100 with a 500 ms cap, which keeps the cost bounded
            even on a noisy desktop. And the Near branch is the only one that
            uses distance; everything else is an overlap check.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the same query looks like against raw IUIAutomation
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            UIA gives you BoundingRectangle per element, but you have to bring
            your own filter. Tab through to see what a one-line Terminator
            selector expands to when you write it by hand in C++.
          </p>
          <BeforeAfter
            title="Same semantics, different amount of code"
            before={{
              label: "Raw IUIAutomation in C++",
              content:
                "FindFirst the anchor. FindAll every descendant. Loop over the array, read every BoundingRectangle, compare by hand. You wrote the overlap test, you wrote the loop, you wrote the array release.",
              highlights: [
                "No primitive for 'rightof' in the COM surface",
                "You own the overlap math",
                "One full tree walk per candidate collection",
                "Error handling and release calls are yours",
              ],
            }}
            after={{
              label: "Terminator locator",
              content:
                "desktop.locator('role:Edit && rightof:name:Username'). The resolver runs the anchor, collects visible candidates at depth 100, and filters by the RightOf overlap rule. Same semantics, one line.",
              highlights: [
                "Grammar compiles RightOf into the AST",
                "Anchor resolution and filter share one UIA session",
                "Works the same in Rust, Node, Python, and MCP",
                "MIT-licensed source you can audit",
              ],
            }}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What actually talks to what
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Your code calls a locator. The selector parser turns the string
            into an AST with a RightOf / LeftOf / Above / Below / Near node.
            The engine resolves the anchor against IUIAutomation, collects
            candidates, and filters by geometry before returning the element
            list.
          </p>
          <SequenceDiagram
            title="rightof:name:Username resolution"
            actors={["Your code", "selector.rs", "engine.rs", "IUIAutomation"]}
            messages={[
              { from: 0, to: 1, label: "locator('rightof:name:Username')", type: "request" },
              { from: 1, to: 2, label: "Selector::RightOf(Name('Username'))", type: "request" },
              { from: 2, to: 3, label: "FindFirst on anchor PropertyCondition", type: "request" },
              { from: 3, to: 2, label: "anchor element + BoundingRectangle", type: "response" },
              { from: 2, to: 3, label: "FindAll Visible(true), depth=100", type: "request" },
              { from: 3, to: 2, label: "candidate array (N elements)", type: "response" },
              { from: 2, to: 2, label: "filter: candidate_left >= anchor_right && vert overlap", type: "event" },
              { from: 2, to: 0, label: "matching UIElement[]", type: "response" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers from the source
          </h2>
          <MetricsRow metrics={metricsA} />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The <NumberTicker value={50} suffix=" px" /> Near radius is the
            only magic number in the resolver. Everything else is an overlap
            test, which is scale-invariant: whether you are on a 1080p laptop
            or a 5K display, rightof still means rightof.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Each operator, in one cell
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Treat this as the reference card. Every bullet here maps to an
            arm of the match statement above.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the resolver does, in four steps
          </h2>
          <HorizontalStepper title="Inside a single spatial locator call" steps={stepperSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The raw UIA version, for contrast
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you have written against IUIAutomation in C++ before, this will
            look familiar. It is what you end up with when you need "rightof"
            and the only primitive available is BoundingRectangle.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={manualUiaSource}
              language="cpp"
              filename="direct-uia-rightof.cpp"
              typingSpeed={4}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            From the SDK, one line each
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The TypeScript surface is the shortest. Same selector strings work
            from terminator-py and the MCP tool calls without translation.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={terminatorUsageSource}
              language="typescript"
              filename="example.ts"
              typingSpeed={5}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What you see when you run it
          </h2>
          <TerminalOutput
            title="terminal"
            lines={[
              { type: "command", text: "npm install @mediar-ai/terminator" },
              { type: "output", text: "added 1 package, native binary downloaded" },
              { type: "command", text: "node rightof.js" },
              { type: "info", text: "[LOCATOR] parsed: RightOf(Name(\"Username\"))" },
              { type: "info", text: "[ANCHOR] resolved in 38 ms at (x=184, y=220, w=96, h=20)" },
              { type: "info", text: "[CANDIDATES] Visible(true) depth=100 returned 412 elements in 124 ms" },
              { type: "info", text: "[FILTER] 3 candidates satisfied candidate_left >= 280 AND vertical overlap" },
              { type: "success", text: "matched role:Edit at (x=296, y=216, w=220, h=28)" },
              { type: "success", text: "typed 'matthew' into the Username field" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Terminator versus direct IUIAutomation
          </h2>
          <ComparisonTable
            productName="Terminator spatial selector"
            competitorName="Direct IUIAutomation"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            A checklist before you ship a spatial selector
          </h2>
          <AnimatedChecklist
            title="Five things to double-check"
            items={checklistItems}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters for AI coding agents
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                An agent driving a UIA desktop cannot always see a clean
                accessible name on the thing it needs to click. Buttons with
                icon-only labels, inputs that inherit their semantics from a
                sibling label, cells in custom grids, all of these are
                unreachable through role and name alone. Spatial selectors
                close that gap: the agent anchors on the closest labeled
                element and reaches over with{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  rightof:
                </code>
                ,{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  below:
                </code>
                , or{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  near:
                </code>
                . No vision model, no screenshot, no heuristic. Just UIA plus
                82 lines of Rust.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One install:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator "npx -y terminator-mcp-agent@latest"
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The wider Microsoft UI Automation ecosystem
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Spatial selectors are one slice. The rest of the UIA ecosystem is
            the usual cast of inspectors, language wrappers, and RPA suites.
            Every name below consumes the same IUIAutomation surface; the
            differences are API shape, license, and how much work they do for
            you above the COM layer.
          </p>
          <div className="mt-6">
            <Marquee speed={28} pauseOnHover>
              {[
                "Inspect.exe",
                "AccEvent",
                "FlaUInspect",
                "FlaUI",
                "UIAutomationClient .NET",
                "Python-UIAutomation-for-Windows",
                "pywinauto",
                "WinAppDriver",
                "Appium Windows Driver",
                "Power Automate Desktop",
                "TestComplete",
                "Terminator",
              ].map((name) => (
                <span
                  key={name}
                  className="mx-3 inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Hitting the wall where UIA roles are not enough?"
          description="Book 20 minutes. We will walk through anchor selection, the overlap rules, and how to wire a spatial locator into your stack."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Other Terminator pieces on the same surface"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Talk to the maintainers about driving UIA from your agent."
        />
      </article>
    </>
  );
}
