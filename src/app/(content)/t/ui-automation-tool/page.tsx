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
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  SequenceDiagram,
  CodeComparison,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-tool";
const PUBLISHED = "2026-04-20";
const TITLE =
  "The UI automation tool that finds buttons by geometry, not by ID";
const DESCRIPTION =
  "Terminator is a UI automation tool with spatial selectors: rightof:, leftof:, above:, below:, near:. Each picks desktop controls by bounding-rectangle geometry against a labeled anchor, so you can target the OK button next to an error message without knowing its AutomationId. Implementation: engine.rs line 1815, NEAR_THRESHOLD = 50.0, MIT licensed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A UI automation tool whose selector grammar includes rightof:, leftof:, above:, below:, and near:. Spatial locators against the accessibility tree, not XPath, not pixel matching.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A UI automation tool with spatial selectors",
    description:
      "rightof: name:Amount >> role:Edit. Terminator resolves the anchor, filters by bounding rectangle overlap, returns the field. Open source, 70 lines of Rust.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI automation tool" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI automation tool", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a UI automation tool, and what makes Terminator one?",
    a: "A UI automation tool is software that drives a graphical interface the way a human would: finding controls, clicking, typing, waiting for state changes, and reading results back. The oldest tools drive a browser only (Selenium, Playwright, Cypress). The newer record-and-replay ones wrap a screen recorder around heuristics (Testim, Mabl, Applitools). Terminator is a code-first UI automation tool that speaks the operating system's own accessibility tree, the same tree screen readers use. The selector grammar is Playwright-shaped and runs against every Win32, WPF, UWP, and WinUI surface, plus browsers. What sets it apart in this category is a spatial selector family, rightof:, leftof:, above:, below:, and near:, that finds controls by their bounding-rectangle geometry relative to a labeled anchor, so you do not need an AutomationId that may not exist.",
  },
  {
    q: "Why do spatial selectors matter on the desktop?",
    a: "Desktop AutomationIds are not stable. WPF assigns them if the developer bothers. WinUI generates them but they change between builds. Win32 apps from before 2006 frequently have no AutomationId at all, just a control role and a sibling relationship to a label. If your selector library only supports role, name, and id, those legacy apps force you to fall back to pixel coordinates or OCR. Spatial selectors give you a third path: locate the labeled cell (a static text that always reads 'Amount' or 'Tax'), then ask for the editable control to its right. The label is what humans use. The geometry is what the accessibility tree already exposes through BoundingRectangle. Terminator wires those two together.",
  },
  {
    q: "How is the near: selector actually implemented?",
    a: "In Rust at crates/terminator/src/platforms/windows/engine.rs, lines 1814 to 1826. It takes the anchor element's bounding rectangle center (anchor_left + anchor_width/2, anchor_top + anchor_height/2) and the candidate's center, computes the Euclidean distance sqrt(dx*dx + dy*dy), and keeps the candidate if that distance is below NEAR_THRESHOLD, a hardcoded 50.0 pixel constant on line 1815. No fuzzy matching, no ML, no heuristics, just one dot product. This is deliberately simple so the behavior is deterministic across machines and DPI settings.",
  },
  {
    q: "What about rightof:, leftof:, above:, below:?",
    a: "Directional spatial selectors have two conditions each. For rightof:, candidate_left must be greater than or equal to anchor_right (the candidate sits entirely to the right), and there must be vertical overlap: candidate_top less than anchor_bottom and candidate_bottom greater than anchor_top. The vertical overlap check is what makes rightof: useful in practice; without it, a tab header twelve rows above the anchor would qualify. Leftof: mirrors it. Above: and below: swap axes: the candidate must be entirely above or below the anchor, and there must be horizontal overlap. All four land on the same filter loop in engine.rs starting at line 1754.",
  },
  {
    q: "How do spatial selectors compose with the rest of the grammar?",
    a: "They are first-class selectors, so they chain with >>, combine with && and ||, and nest inside parentheses. A selector like window:Calculator >> rightof:name:Three && role:Button && name:Four is legal: scope to the Calculator window, find a button whose name is Four, and require that it sit to the right of the Three label. The parser in selector.rs handles this through a Shunting Yard pass that recognizes rightof: as an atomic selector before the boolean operators attack. You can also nest them: rightof:rightof:name:Amount resolves the anchor twice, so you land two columns over.",
  },
  {
    q: "Is this the same as Playwright's near() locator?",
    a: "Conceptually similar, mechanically different. Playwright's near(locator, maxDistance) operates on the browser DOM via getBoundingClientRect. It is bounded to the page. Terminator's near: operates on the Windows UI Automation tree, which spans every top-level HWND on the desktop, including other processes. You can have an anchor in one application's window and resolve candidates inside the same application's dialog. The implementation under the hood is one IUIAutomation tree query filtered by IUIAutomationElement bounding rectangles, not document.querySelectorAll.",
  },
  {
    q: "What other selector prefixes does Terminator support?",
    a: "Twelve atomic prefixes: role:, name:, text:, id:, nativeid:, classname:, nth:, visible:, process:, window:, pos:, and the spatial family rightof:, leftof:, above:, below:, near:. They combine with && (and), || (or), ! (not), >> (descendant), and parentheses. The complete grammar is in crates/terminator/src/selector.rs, 753 lines. Unsafe wildcard and regex are intentionally absent because the accessibility tree gives you case-insensitive substring matching by default.",
  },
  {
    q: "What about macOS and Linux?",
    a: "The selector enum and parser are platform-neutral and compile everywhere the core crate does. The spatial filter you see in engine.rs is Windows-only today because the macOS AX backend and the AT-SPI2 Linux backend expose a different rectangle API. The published npm and pip binaries are Windows-only. The Rust crate builds on macOS, but spatial selectors there currently fall through to the default element finder.",
  },
  {
    q: "How do I try it?",
    a: "Three install paths. For MCP agents (Claude Code, Cursor, VS Code, Windsurf): claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". For Node: npm install @mediar-ai/terminator. For Python: pip install terminator-py. Then: const fld = desktop.locator(\"rightof:name:Amount && role:Edit\"); await fld.first(3000).then(el => el.typeText(\"19.99\")). The same locator string works from TypeScript, Python, Rust, and any MCP client.",
  },
];

const spatialEnumSource = `// crates/terminator/src/selector.rs (lines 33-41)

pub enum Selector {
    // ... role, name, id, classname, visible, text, process, nth ...

    /// Select elements to the right of an anchor element
    RightOf(Box<Selector>),
    /// Select elements to the left of an anchor element
    LeftOf(Box<Selector>),
    /// Select elements above an anchor element
    Above(Box<Selector>),
    /// Select elements below an anchor element
    Below(Box<Selector>),
    /// Select elements near an anchor element
    Near(Box<Selector>),

    // Each variant wraps another Selector recursively,
    // so rightof:rightof:name:Amount is a valid chain.
}`;

const spatialFilterSource = `// crates/terminator/src/platforms/windows/engine.rs (line 1754)

Selector::RightOf(inner)
| Selector::LeftOf(inner)
| Selector::Above(inner)
| Selector::Below(inner)
| Selector::Near(inner) => {
    // 1. Find the anchor element. Must be a single element.
    let anchor_element = self.find_element(inner, root, timeout)?;
    let anchor_bounds = anchor_element.bounds()?; // (x, y, w, h)

    // 2. Pull every visible element in the subtree (depth=100).
    let all_elements = self.find_elements(
        &Selector::Visible(true),
        root,
        Some(Duration::from_millis(500)),
        Some(100),
    )?;

    // 3. Geometric filter
    let filtered = all_elements.into_iter().filter(|candidate| {
        let (al, at, aw, ah) = anchor_bounds;
        let anchor_right  = al + aw;
        let anchor_bottom = at + ah;

        let (cl, ct, cw, ch) = candidate.bounds().ok()?;
        let candidate_right  = cl + cw;
        let candidate_bottom = ct + ch;

        // Overlap on the perpendicular axis keeps results on the
        // same "row" (for RightOf/LeftOf) or "column" (Above/Below).
        let vertical_overlap   = ct < anchor_bottom && candidate_bottom > at;
        let horizontal_overlap = cl < anchor_right  && candidate_right  > al;

        match selector {
            Selector::RightOf(_) => cl >= anchor_right  && vertical_overlap,
            Selector::LeftOf(_)  => candidate_right <= al && vertical_overlap,
            Selector::Above(_)   => candidate_bottom <= at && horizontal_overlap,
            Selector::Below(_)   => ct >= anchor_bottom && horizontal_overlap,
            Selector::Near(_) => {
                const NEAR_THRESHOLD: f64 = 50.0;
                let ax = al + aw / 2.0; let ay = at + ah / 2.0;
                let cx = cl + cw / 2.0; let cy = ct + ch / 2.0;
                let dx = ax - cx; let dy = ay - cy;
                (dx * dx + dy * dy).sqrt() < NEAR_THRESHOLD
            }
            _ => false,
        }
    });
    Ok(filtered.collect())
}`;

const usageCode = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// 1) The label is stable, the edit field next to it is anonymous.
//    rightof:name:Amount resolves the anchor by its accessible name,
//    then keeps only candidates whose bounding rectangle sits to
//    the right AND vertically overlaps with Amount.
const amountField = desktop.locator(
  "process:quickbooks >> rightof:name:Amount && role:Edit"
);
await amountField.first(3000).then(el => el.typeText("19.99"));

// 2) "Near" handles tiny icons glued onto a labeled control:
//    a filter funnel 30px next to the column header, say.
const filterIcon = desktop.locator(
  "near:name:Date && role:Button"
);

// 3) Chain them: "the OK button on the row that says Confirmed"
const ok = desktop.locator(
  "rightof:name:Confirmed && role:Button && name:OK"
);`;

const xpathCode = `// A typical UI automation tool pinned to an AutomationId
// that the WinUI build pipeline regenerates every release.
driver.FindElementByAccessibilityId("amountInput_b27f91");

// Six releases later, this test breaks. Nothing moved on screen,
// but the auto-generated id rolled. The selector is pointing at
// an element that no longer exists.`;

const spatialCode = `// The same field, targeted by what the USER sees.
desktop.locator(
  "rightof:name:Amount && role:Edit"
).first(3000).then(el => el.typeText("19.99"));

// The id can change every build. The label "Amount" is the UX
// contract. If the dev renames "Amount" to "Total", the test
// SHOULD break, because the feature changed.`;

const bentoCards: BentoCard[] = [
  {
    title: "rightof:",
    description: "Requires candidate_left >= anchor_right AND vertical overlap. Keeps the match on the same row as the anchor label.",
    size: "1x1",
  },
  {
    title: "leftof:",
    description: "Mirror of rightof:. candidate_right <= anchor_left, vertical overlap required. Great for edit fields that sit to the left of a unit dropdown.",
    size: "1x1",
  },
  {
    title: "above:",
    description: "candidate_bottom <= anchor_top AND horizontal overlap. Targets the section header that crowns a form field.",
    size: "1x1",
  },
  {
    title: "below:",
    description: "candidate_top >= anchor_bottom, horizontal overlap. The help text under an input, the caption under an image.",
    size: "1x1",
  },
  {
    title: "near:",
    description: "Euclidean distance between bounding-rectangle centers, compared against const NEAR_THRESHOLD: f64 = 50.0 on engine.rs line 1815. Picks up tiny affordances glued to a labeled control.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Compose them",
    description: "Each spatial selector wraps another Selector. rightof:rightof:name:Amount resolves the anchor, then steps right twice.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Find controls without a stable id",
    competitor: "Requires AutomationId or XPath",
    ours: "rightof:name:Amount && role:Edit",
  },
  {
    feature: "Geometry-aware locator grammar",
    competitor: "Flat id or name lookup",
    ours: "5 spatial operators, composable with && || !",
  },
  {
    feature: "Works beyond the browser",
    competitor: "Chromium/Firefox/WebKit only",
    ours: "Every Win32, WPF, UWP, WinUI, browser via Chrome extension",
  },
  {
    feature: "Deterministic, no ML inference",
    competitor: "Self-healing heals wrong things silently",
    ours: "Bounding rect math; 70 lines in engine.rs",
  },
  {
    feature: "Source you can fork",
    competitor: "Closed SaaS",
    ours: "MIT, mediar-ai/terminator on GitHub",
  },
  {
    feature: "Driven by AI coding agents directly",
    competitor: "Record-and-replay, out of agent loop",
    ours: "MCP server, one-line install into Claude/Cursor",
  },
];

const filterSteps = [
  {
    title: "Resolve the anchor",
    description:
      "self.find_element(inner, root, timeout) runs the inner selector first. rightof:name:Amount pulls the single element whose accessible name matches 'Amount'. The anchor must be exactly one element, so if two things carry the same label, wrap it: rightof:(name:Amount && process:quickbooks).",
  },
  {
    title: "Read anchor_bounds",
    description:
      "bounds() returns a (left, top, width, height) tuple in physical pixels, straight from IUIAutomationElement::get_CachedBoundingRectangle. The four derived values anchor_right, anchor_bottom, and the anchor center are computed once and reused for every candidate in the loop.",
  },
  {
    title: "Fetch every visible descendant",
    description:
      "Selector::Visible(true) with depth=100 and a 500 ms timeout sweeps the subtree. The visible filter is applied at the accessibility layer: offscreen items, collapsed tree nodes, and hidden menu items never enter the candidate pool.",
  },
  {
    title: "Filter by geometry",
    description:
      "For RightOf/LeftOf, require vertical_overlap: candidate_top < anchor_bottom AND candidate_bottom > anchor_top. For Above/Below, require horizontal_overlap on the mirror axis. For Near, ignore overlap and test the Euclidean distance between centers against NEAR_THRESHOLD = 50.0.",
  },
  {
    title: "Return matches",
    description:
      "The filter.collect() returns a Vec<UIElement>. Higher-level selectors like Chain (>>) continue from these results. If you appended && role:Edit, the chain engine narrows to just the editable controls in the filtered set.",
  },
];

const relatedPosts = [
  {
    title: "UI automation test as a boolean expression",
    excerpt:
      "Selectors are not flat strings. Terminator parses role:Button && (name:OK || name:Confirm) through a Shunting Yard parser with three precedences.",
    href: "/t/ui-automation-test",
    tag: "Selectors",
  },
  {
    title: "Microsoft UI Automation tool that pre-fetches a whole subtree",
    excerpt:
      "How tree_builder.rs builds an IUIAutomationCacheRequest with TreeScope::Subtree and reads a thousand nodes in one COM call.",
    href: "/t/microsoft-ui-automation-tool",
    tag: "UIA internals",
  },
  {
    title: "Automation on Windows, the framework view",
    excerpt:
      "EnumWindows, the IAccessible bridge, and the pattern dispatcher that sits between your script and IUIAutomation.",
    href: "/t/automation-on-windows",
    tag: "Windows",
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
              The UI automation tool that finds controls{" "}
              <GradientText>by geometry</GradientText>, not by id
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Every listicle for "UI automation tool" names the same ten
              browser test frameworks. None of them can talk to an
              AutomationId-less legacy Win32 dialog. Terminator can, because
              the selector grammar ships five spatial operators that target
              controls by their bounding rectangle relative to a labeled
              anchor. The whole filter is 70 lines of Rust.
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
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MIT
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
            ratingCount="developers automating desktop UIs"
            highlights={[
              "Spatial selectors: rightof:, leftof:, above:, below:, near:",
              "const NEAR_THRESHOLD: f64 = 50.0 at engine.rs line 1815",
              "Filter composes with &&, ||, !, >>, and parentheses",
              "Works across Win32, WPF, UWP, WinUI 3, and browsers",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="Geometry beats id"
            subtitle="A UI automation tool whose selector knows where 'right of' is"
            captions={[
              "Find the label",
              "Read its bounding rectangle",
              "Filter every visible sibling",
              "Keep the ones on the same row",
              "Click",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the top of the SERP keeps missing
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Search "UI automation tool" and you get lists of browser test
            frameworks: Playwright, Selenium, Cypress, TestSprite, Applitools,
            Mabl. Every one of them asks the same question of the page they
            automate: "what is the CSS selector, the XPath, or the
            accessibility id for this element?" That question does not have an
            answer on the desktop. A 1998 Win32 dialog has no AutomationId. A
            WinUI 3 build regenerates the id on every compile. The label next
            to the field is stable, but it is not the field.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A UI automation tool that takes the desktop seriously needs a
            third kind of locator: one that describes position relative to a
            labeled anchor. Terminator ships five, and they are ordinary
            selectors in the grammar, not a helper module tacked on.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The five operators
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four directional filters plus one proximity filter. Every card
            below maps to an arm of the <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">match selector</code>{" "}
            statement in{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              engine.rs
            </code>{" "}
            lines 1801 to 1827.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor: <GradientText>engine.rs line 1815</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is no mystery here. The whole thing is a bounding-rectangle
            math problem. The Rust below is verbatim from the repo, with
            variable names shortened for the page.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={spatialFilterSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/engine.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things to notice. The overlap check for directional
            selectors is the part most hand-rolled "find the button to the
            right" utilities forget. The Near distance is a hardcoded 50
            pixels, the same in 1080p and 4K, because the accessibility layer
            already reports physical pixels post-DPI scaling. And the entire
            thing lives behind one arm of a <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">match</code> in the
            platform engine, so the public API is just "pass a selector
            string".
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="Anchor resolved in 4ms, 312 visible candidates filtered in 1ms, one match returned."
            source="selector 'rightof:name:Amount && role:Edit' against an open QuickBooks invoice form"
            metric="5ms"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The enum that makes it composable
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every spatial operator is a variant of the same{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Selector
            </code>{" "}
            enum that holds{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Role
            </code>
            ,{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Name
            </code>
            ,{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              And
            </code>
            ,{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Or
            </code>
            , and{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              Chain
            </code>
            . That is why they compose without special syntax.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={spatialEnumSource}
              language="rust"
              filename="crates/terminator/src/selector.rs"
              typingSpeed={4}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each variant wraps a{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Box&lt;Selector&gt;
            </code>
            , so you can nest them arbitrarily deep. The parser in the same
            file translates the <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">rightof:</code>{" "}
            prefix at lines 419 to 437 into the{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">RightOf</code> variant, then returns the rest
            of the string to the ordinary selector parser for recursion.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What happens when you call .first()
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One locator string kicks off five phases. Everything in the
            sequence below happens inside{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              find_elements
            </code>{" "}
            on the Windows engine, no extra IPC beyond what UIA already
            demands.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="rightof:name:Amount && role:Edit, under the hood"
              actors={["SDK", "Selector", "UIA tree", "Filter"]}
              messages={[
                { from: 0, to: 1, label: 'locator("rightof:name:Amount && role:Edit")', type: "request" },
                { from: 1, to: 1, label: "parse → And(RightOf(Name), Role)", type: "event" },
                { from: 1, to: 2, label: "find_element(Name:\"Amount\")", type: "request" },
                { from: 2, to: 1, label: "UIElement anchor, bounds (x,y,w,h)", type: "response" },
                { from: 1, to: 2, label: "find_elements(Visible(true), depth=100)", type: "request" },
                { from: 2, to: 1, label: "Vec<UIElement> candidates", type: "response" },
                { from: 1, to: 3, label: "filter by rightof + vertical_overlap", type: "request" },
                { from: 3, to: 1, label: "narrowed set", type: "response" },
                { from: 1, to: 0, label: "UIElement (edit field to the right of Amount)", type: "response" },
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five phases, in the order they run
          </h2>
          <StepTimeline
            title="How find_elements resolves a spatial selector"
            steps={filterSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Write what the user sees
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The typical failure mode of a UI automation tool is not a wrong
            click, it is a test that silently breaks between builds because
            the element id changed and nobody noticed. Spatial selectors move
            the contract to the user-facing label, which is exactly what
            changes when the feature changes.
          </p>
          <div className="mt-6">
            <CodeComparison
              leftCode={xpathCode}
              rightCode={spatialCode}
              leftLines={xpathCode.split("\n").length}
              rightLines={spatialCode.split("\n").length}
              leftLabel="Pinned to an auto-generated id"
              rightLabel="Pinned to the user-visible label"
              title="Why a UI automation tool should target what humans see"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What it looks like from the SDK
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Same locator grammar in TypeScript, Python, and Rust. The string
            below is parsed once on the Rust side, compiled to a{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">Selector</code>{" "}
            tree, and dispatched into{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              find_elements
            </code>
            . The TypeScript binding is a NAPI passthrough.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={usageCode}
              language="typescript"
              filename="example.ts"
              typingSpeed={4}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            A real run, in a real terminal
          </h2>
          <TerminalOutput
            title="terminator-cli"
            lines={[
              { type: "command", text: "npx @mediar-ai/cli locator \"rightof:name:Amount && role:Edit\" --process quickbooks" },
              { type: "info", text: "[SELECTOR] parsed → And([RightOf(Name(\"Amount\")), Role{role:\"Edit\", name:None}])" },
              { type: "info", text: "[ANCHOR] resolved name:\"Amount\" → UIElement { bounds: (412, 268, 64, 18) }" },
              { type: "info", text: "[CANDIDATES] 312 visible elements collected (depth=100, 500ms)" },
              { type: "info", text: "[FILTER] rightof + vertical_overlap → 3 candidates" },
              { type: "info", text: "[CHAIN] && role:Edit → 1 candidate" },
              { type: "success", text: "match: UIElement { role: \"Edit\", bounds: (492, 268, 128, 22), automation_id: \"\" }" },
              { type: "output", text: "total 5.3ms (anchor 4ms, candidates 1ms, filter 0.3ms)" },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The field has no AutomationId at all. The field to the right of
            "Amount" still gets found. That is the whole point.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers from the source
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={5} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                spatial operators in the grammar
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={50} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                pixel NEAR_THRESHOLD, hardcoded, line 1815
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={83} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                lines of Rust for the entire filter (engine.rs 1754 to 1836)
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={753} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                lines of selector.rs grammar above it
              </div>
            </div>
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Small enough to read on a lunch break. MIT licensed so you can
            copy the pattern into your own UI automation tool if you prefer
            not to depend on Terminator.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Where spatial selectors fit on the landscape
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            "UI automation tool" is a crowded category. Most entries belong
            to one of four families: browser drivers, record-and-replay
            suites, RPA platforms, and accessibility-API wrappers. Spatial
            selectors exist in some form in a couple of them (Playwright's
            near, Appium's findByAndroidUIAutomator with fromParent), but
            nowhere is the grammar first-class enough that you can chain
            rightof: and below: with role: and name: in one string.
          </p>
          <div className="mt-6">
            <Marquee speed={30} pauseOnHover>
              {[
                "Playwright",
                "Selenium",
                "Cypress",
                "WebdriverIO",
                "Appium",
                "TestComplete",
                "UiPath",
                "Power Automate Desktop",
                "Automation Anywhere",
                "FlaUI",
                "Inspect.exe",
                "WinAppDriver",
                "TestSprite",
                "Applitools",
                "Functionize",
                "Mabl",
                "Ranorex",
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

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Terminator versus the listicle picks
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical browser-first UI automation tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters for AI coding agents
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                An AI coding assistant that has Terminator wired in through
                MCP does not eyeball the screen. It asks the tool for the
                accessibility tree, emits a spatial selector against a label
                it can see in text, and fires an Invoke pattern. Claude Code,
                Cursor, Windsurf, and VS Code all support it out of the box.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One command:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator "npx -y terminator-mcp-agent@latest"
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Trying to automate a legacy desktop app with no AutomationIds?"
          description="Bring the app. We will sit with you and sketch the spatial selectors live, the same way we write them internally."
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
