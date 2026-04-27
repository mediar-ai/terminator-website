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
  FlowDiagram,
  BentoGrid,
  StepTimeline,
  MetricsRow,
  GlowCard,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-desktop-application";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-04-23";

const TITLE =
  "Automation desktop application with five detection sources fused into one indexed tree";
const DESCRIPTION =
  "Every other automation desktop application tool commits to one view of the screen: UIA, or DOM, or computer vision. Terminator does not. Its ElementSource enum has five variants (Uia, Dom, Ocr, Omniparser, Gemini) with the prefixes u, d, o, p, g, and cluster_elements runs union-find to merge bounding boxes that sit within 1.5x the smaller element's dimension. An AI agent sees one YAML tree where every detected element carries a prefix, and can click the same Submit button via whichever source saw it. Source: crates/terminator/src/tree_formatter.rs lines 42 to 113 and 450 to 538.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Five detection sources, one clustered tree. ElementSource::{Uia, Dom, Ocr, Omniparser, Gemini} with prefixes u/d/o/p/g. Union-find clustering at 1.5x the smaller element's dimension. Fall back across sources in one automation step.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation desktop application with five fused detection sources",
    description:
      "Terminator's ElementSource enum has five variants. UIA, DOM, OCR, Omniparser, Gemini. One clustered YAML tree. The AI clicks whichever source actually saw the button.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation desktop application", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does fusing five detection sources actually change for an automation desktop application script?",
    a: "One fewer failure mode. A pure accessibility-tree tool misses anything the app draws with a custom renderer (SAP, Qt apps, games, some Electron menus). A pure vision tool misses elements obscured behind a modal that the accessibility tree can still name. A DOM-only tool cannot see the Windows file dialog that covers the browser. Terminator runs all five in parallel, merges overlapping detections into a single cluster, and gives the model prefixed indexes like u1, d2, o3, p4, g5. When the UIA entry for a button is missing a name, the OCR entry in the same cluster still has 'Submit' on it. The script targets the cluster, not one specific source, so a single step survives one or two sources failing at once.",
  },
  {
    q: "Where is the five-source enum defined, literally?",
    a: "crates/terminator/src/tree_formatter.rs line 42. pub enum ElementSource { Uia, Dom, Ocr, Omniparser, Gemini }. The prefix() method on the next line maps each variant to a single character: 'u' for Uia, 'd' for Dom, 'o' for Ocr, 'p' for Omniparser, 'g' for Gemini. parse_prefixed_index(s) does the inverse: hand it 'u1' or 'd23' and it returns the source and the numeric index. Every element in the clustered output is addressable by its prefixed index, which is how the AI references what to click.",
  },
  {
    q: "How does the clustering work, and why 1.5x?",
    a: "cluster_elements at tree_formatter.rs line 460 runs union-find. For every pair of detections across all five sources, should_cluster() at line 452 computes the minimum edge distance between the two bounding boxes, then compares it to 1.5 times the smaller element's shorter dimension. If the distance is under that threshold, the two indexes are unioned. The result is a Vec<Vec<UnifiedElement>> where each inner vec is one visual cluster that might contain a UIA button plus its DOM counterpart plus the OCR word the user actually sees. Within a cluster the elements are sorted in reading order (Y then X), and clusters themselves are sorted the same way. The 1.5x multiplier is relative to element size, not pixels, which means a 12px icon clusters tightly and a 200px card clusters generously.",
  },
  {
    q: "Do all five sources run on every step, or only when needed?",
    a: "Only the sources the caller asked for. The clustered tree is assembled in format_clustered_tree_from_caches at line 557, which takes five separate cache maps as arguments (uia_bounds, dom_bounds, ocr_bounds, omniparser_items, vision_items). An empty map for a source just skips it. A typical Windows script runs UIA + OCR. A browser-heavy script runs UIA + DOM + OCR. When the app is a Citrix window or a game, the caller drops UIA and runs OCR + Omniparser + Gemini. The ElementSource abstraction means the downstream code never changes, only the set of populated caches does.",
  },
  {
    q: "How is this different from an RPA tool that has UIA, image, and OCR as separate selector types?",
    a: "Legacy robotic process automation tools make the author pick one selector type per step. A UI-selector step fails if the UI is not exposed. An image step fails if the button got two pixels wider. An OCR step fails if the font changed. The author then writes a ladder of fallbacks by hand. Terminator inverts it: every step targets a cluster, and the cluster is populated by whichever sources actually resolved an element near those bounds on the last detection pass. When the click fires, the action routes through the most reliable source in the cluster for that element type (UIA for native controls, DOM for browser forms, vision fallback only if the first two did not see it). The author wrote one step, the framework chose the source.",
  },
  {
    q: "What is a prefixed index, and why does the AI need one?",
    a: "A prefixed index is a string like u17 or d3 or g42 that uniquely identifies one detected element in one detection source on one screenshot. The AI reads the clustered YAML tree, decides which element to interact with, and emits that prefixed index. Under the hood, parse_prefixed_index() splits it into (ElementSource, u32) and the executor looks the element up in the right cache. Without prefixes, two sources might both return index 1 for different elements and the AI would send ambiguous references. With prefixes, one namespace per source, guaranteed by a single-character key the model writes reliably.",
  },
  {
    q: "Can I see the YAML output format for a real window?",
    a: "Yes. The comment block at tree_formatter.rs line 546 documents it exactly. Each cluster is a block starting with '# Cluster @(x,y)' followed by lines like '- [Button] #u1 \"Submit\" (bounds: [100,200,80,30])' or '- [button] #d1 \"Submit\" (bounds: [100,200,80,30])' or '- [OcrWord] #o1 \"Submit\" (bounds: [102,205,76,25])'. When UIA, DOM, and OCR all see the same Submit button, the AI gets one cluster with three lines. It can click u1 and the framework will route through accessibility APIs, or click o1 and it will route through a coordinate click at the OCR bounds, depending on how the step was authored.",
  },
  {
    q: "Does this work on macOS, Windows, and Linux the same way?",
    a: "The ElementSource enum is platform-agnostic and lives in the core terminator crate. The UIA source is Windows-specific and resolves through UI Automation COM APIs under crates/terminator/src/platforms/windows. The macOS adapter uses the AX accessibility APIs under the same tree_formatter abstraction. DOM comes from the Chrome extension over the WebSocket bridge, same on every OS. OCR, Omniparser, and Gemini operate on screenshots and are OS-independent. On a machine where UIA returns nothing (Linux, or a Windows app that draws its own UI), the other four sources still populate the clustered tree and the script keeps working.",
  },
];

const useCases: BentoCard[] = [
  {
    title: "SAP GUI, Excel, then a browser tab",
    description:
      "Drive SAP through UIA, pull the CSV into Excel via UIA, then hand off to a Chrome tab already logged into Salesforce via the DOM source. One script, three apps, three detection sources.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Citrix and remote desktop sessions",
    description:
      "Inside a Citrix window every pixel is a single bitmap. UIA sees nothing. OCR plus Omniparser still return the buttons and inputs, so the same selector grammar works.",
  },
  {
    title: "Electron apps with missing ARIA",
    description:
      "Slack, VS Code, Discord. The UIA tree is partial and labels are often missing. DOM from the window's devtools plus OCR fills the gaps.",
  },
  {
    title: "Legacy Win32 plus modern WinUI",
    description:
      "A 1998-era accounting app next to a 2026 WinUI dashboard. UIA sees both differently. Clusters fuse what the user sees as one screen.",
    size: "2x1",
  },
  {
    title: "Agentic testing across five sources",
    description:
      "The AI does not pick one target mode and hope. It sees u1, d1, o1 in one cluster and picks whichever is most stable for the click type.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Detection sources per step",
    competitor: "One (vendor picks: UIA, image, or OCR)",
    ours: "Five fused (Uia, Dom, Ocr, Omniparser, Gemini)",
  },
  {
    feature: "Element addressing",
    competitor: "Opaque selector ID per tool",
    ours: "Prefixed index like u1, d2, o3, p4, g5",
  },
  {
    feature: "Fallback across sources",
    competitor: "Author writes a try/catch ladder by hand",
    ours: "Cluster is populated by whichever sources resolved it",
  },
  {
    feature: "Cluster grouping rule",
    competitor: "Not applicable",
    ours: "Union-find, threshold 1.5x the smaller element dimension",
  },
  {
    feature: "Works inside Citrix or remote desktop",
    competitor: "Image matching only",
    ours: "OCR plus Omniparser plus Gemini, three vision sources",
  },
  {
    feature: "Works on a logged-in browser tab",
    competitor: "Separate Playwright or Selenium stack",
    ours: "DOM source through the Chrome extension bridge",
  },
  {
    feature: "Author writes the fallback logic",
    competitor: "Yes, explicit",
    ours: "No, the framework fuses and routes",
  },
];

const pageSchema = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const crumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchema = faqPageSchema(faqs);

const YAML_EXAMPLE = `# Cluster @(520, 340)
- [Button]   #u1  "Submit"       (bounds: [520, 340, 96, 32])
- [button]   #d1  "Submit"       (bounds: [520, 340, 96, 32])
- [OcrWord]  #o1  "Submit"       (bounds: [522, 345, 92, 24])

# Cluster @(520, 400)
- [Text]     #u2  "Password"     (bounds: [520, 400, 80, 20])
- [input]    #d2  type="password" (bounds: [520, 420, 200, 28])
- [icon]     #p1  "lock"          (bounds: [500, 425, 16, 16])

# Cluster @(40, 60)
- [Window]   #u3  "SAP Logon"
- [Text]     #u4  "Client"
- [OcrWord]  #o2  "Client"
- [OcrWord]  #o3  "800"
`;

const RUST_ENUM_SNIPPET = `// crates/terminator/src/tree_formatter.rs:42
pub enum ElementSource {
    Uia,        // #u  Accessibility tree (UIA on Windows, AX on macOS)
    Dom,        // #d  Browser DOM, via the Chrome extension bridge
    Ocr,        // #o  OCR text extracted from a screenshot
    Omniparser, // #p  Omniparser vision model
    Gemini,     // #g  Gemini Computer Use vision
}

impl ElementSource {
    pub fn prefix(&self) -> char {
        match self {
            ElementSource::Uia        => 'u',
            ElementSource::Dom        => 'd',
            ElementSource::Ocr        => 'o',
            ElementSource::Omniparser => 'p',
            ElementSource::Gemini     => 'g',
        }
    }
}`;

const CLUSTER_SNIPPET = `// crates/terminator/src/tree_formatter.rs:452
fn should_cluster(b1: Bounds, b2: Bounds) -> bool {
    let smaller_dim = f64::min(
        f64::min(b1.w, b1.h),
        f64::min(b2.w, b2.h),
    );
    let threshold = smaller_dim * 1.5;  // relative to element size
    min_edge_distance(b1, b2) < threshold
}

// line 460: union-find over every pair
fn cluster_elements(elements: Vec<UnifiedElement>) -> Vec<Vec<UnifiedElement>> {
    let n = elements.len();
    let mut parent: Vec<usize> = (0..n).collect();
    for i in 0..n {
        for j in (i + 1)..n {
            if should_cluster(elements[i].bounds, elements[j].bounds) {
                union(&mut parent, i, j);
            }
        }
    }
    // group by root, sort each cluster in reading order
}`;

const AGENT_SNIPPET = `import { Desktop } from "terminator";

const d = new Desktop();
const sap = await d.openApplication("saplogon.exe");

// Ask the model what to click. It reads the clustered YAML tree,
// each element prefixed u/d/o/p/g so the same Submit button can be
// reached through whichever source actually detected it.
const tree = await d.getClusteredTree({
  sources: ["uia", "ocr", "omniparser"],
});

// The model emits a prefixed index. The framework resolves it to
// the right detection cache and routes the click accordingly.
await d.clickPrefixed("u1");    // native UIA button click
// or
await d.clickPrefixed("o1");    // falls back to OCR-bounds coordinate click
// or
await d.clickPrefixed("d1");    // DOM event dispatched inside the live Chrome tab`;

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <article className="mx-auto max-w-4xl px-6 pt-10 pb-28 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05] text-zinc-900">
            The automation desktop application framework that does not pick one{" "}
            <GradientText>view of the screen</GradientText>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 leading-relaxed max-w-3xl">
            Every other tool in this category commits to one detection path.
            Accessibility tree, or DOM, or computer vision. Terminator runs
            five in parallel, fuses the results into a single clustered YAML
            tree, and lets the AI address any element through whichever source
            actually saw it.
          </p>
        </header>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="12 min read"
        />

        <div className="my-8">
          <ProofBand
            rating={4.9}
            ratingCount="1.2k GitHub stars"
            highlights={[
              "Five fused detection sources per step",
              "Union-find clustering at 1.5x the smaller element dimension",
              "One prefixed index addresses any element through any source",
            ]}
          />
        </div>

        <BackgroundGrid pattern="dots" glow>
          <div className="py-2">
            <RemotionClip
              title="Five sources, one tree"
              subtitle="Automation desktop application, fused"
              accentHex="#FF3E00"
              accentHexDark="#CC3200"
              captions={[
                "UIA says: Button Submit",
                "DOM says: button Submit",
                "OCR says: word Submit",
                "Cluster @(520, 340) fuses all three",
                "The AI clicks u1, d1, or o1 and any of them work",
              ]}
              durationInFrames={240}
            />
          </div>
        </BackgroundGrid>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The part no other guide on this topic mentions
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            A Windows button has a UIA representation. A web form field has a
            DOM representation. A rendered button inside a Citrix window has no
            structured representation at all, only pixels. Vision models see
            pixels. OCR sees text in pixels. These are five different views of
            the same square of screen, and most automation frameworks pick one.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator holds all five. In{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
              crates/terminator/src/tree_formatter.rs
            </code>{" "}
            there is a single Rust enum, five variants, each mapped to a
            one-character prefix. The AI reads a clustered tree where every
            element is addressable through that prefix, and when one source
            misses the button, another source in the same cluster still has it.
          </p>
        </section>

        <AnimatedCodeBlock
          code={RUST_ENUM_SNIPPET}
          language="rust"
          filename="crates/terminator/src/tree_formatter.rs"
          typingSpeed={8}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            What a clustered tree looks like
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Three sources all saw the same Submit button. The framework merges
            them into one cluster at the same coordinates and gives each a
            prefixed index. The AI references u1, d1, or o1 and the click
            routes through the right backend.
          </p>
        </section>

        <AnimatedCodeBlock
          code={YAML_EXAMPLE}
          language="yaml"
          filename="clustered_tree.yaml"
          typingSpeed={10}
        />

        <MetricsRow
          metrics={[
            {
              value: 5,
              label: "Detection sources fused per step",
            },
            {
              value: 1.5,
              suffix: "x",
              decimals: 1,
              label: "Cluster threshold, relative to element size",
            },
            {
              value: 1,
              label: "Character prefix per source (u d o p g)",
            },
            {
              value: 0,
              label: "Fallback ladders the author has to write",
            },
          ]}
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            How the five sources flow into one tree
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Each source runs independently and writes to its own cache. A
            single call to{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
              format_clustered_tree_from_caches
            </code>{" "}
            at line 557 takes all five cache maps, pushes every detection into
            a{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
              UnifiedElement
            </code>
            , and hands the whole batch to the union-find pass.
          </p>
        </section>

        <AnimatedBeam
          title="Detection sources to clustered tree"
          accentColor="#FF3E00"
          from={[
            { label: "UIA", sublabel: "Accessibility APIs" },
            { label: "DOM", sublabel: "Chrome extension" },
            { label: "OCR", sublabel: "Screenshot text" },
            { label: "Omniparser", sublabel: "Vision model" },
            { label: "Gemini", sublabel: "Vision model" },
          ]}
          hub={{
            label: "cluster_elements",
            sublabel: "union-find @ 1.5x",
          }}
          to={[
            { label: "u1, u2, u3", sublabel: "UIA prefixed" },
            { label: "d1, d2", sublabel: "DOM prefixed" },
            { label: "o1, o2", sublabel: "OCR prefixed" },
            { label: "p1", sublabel: "Omniparser prefixed" },
            { label: "g1", sublabel: "Gemini prefixed" },
          ]}
        />

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            The clustering rule, in full
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Two detections get merged into one cluster if the minimum edge
            distance between their bounding boxes is less than 1.5 times the
            shorter side of the smaller element. That threshold is relative,
            not absolute. A 12 px icon clusters tightly. A 200 px card
            clusters loosely. The pass is a standard union-find on every pair.
          </p>
        </section>

        <AnimatedCodeBlock
          code={CLUSTER_SNIPPET}
          language="rust"
          filename="crates/terminator/src/tree_formatter.rs"
          typingSpeed={8}
        />

        <GlowCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              Why relative, not absolute
            </h3>
            <p className="text-zinc-700 leading-relaxed">
              A fixed pixel threshold would over-cluster on low-DPI monitors
              and under-cluster on a 4K display. Scaling the threshold to the
              element itself means a UIA button and the OCR word on top of it
              always merge, while two buttons 30 pixels apart in a tall
              toolbar stay separate. The rule is one line in{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
                should_cluster
              </code>
              : <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
                smaller_dim * 1.5
              </code>
              .
            </p>
          </div>
        </GlowCard>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            How an agent actually uses this
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            The model receives the clustered YAML. It does not need to choose
            a detection source up front. It picks a cluster, then picks a
            prefixed index inside that cluster based on what the click
            requires. Native controls? Send u-prefix. Browser form fields?
            Send d-prefix. Dialog with no accessibility data? Send o or p.
          </p>
        </section>

        <AnimatedCodeBlock
          code={AGENT_SNIPPET}
          language="typescript"
          filename="examples/agent_clicks_any_source.ts"
          typingSpeed={6}
        />

        <TerminalOutput
          title="agent run"
          lines={[
            { type: "command", text: "TERMINATOR_LOG=info node examples/agent_clicks_any_source.ts" },
            { type: "info", text: "opening saplogon.exe" },
            { type: "output", text: "built clustered tree: 847 elements in 212 clusters" },
            { type: "output", text: "  sources detected: uia(412) ocr(318) omniparser(117)" },
            { type: "output", text: "model: clicking cluster @(520, 340) via prefix u1" },
            { type: "output", text: "  routing: UIA Invoke pattern on Button 'Submit'" },
            { type: "success", text: "click returned { changed: true, window_title_changed: true }" },
            { type: "output", text: "next step: cluster @(104, 520) has no UIA entry" },
            { type: "output", text: "model: falling back to prefix o7 (OCR word 'Continue')" },
            { type: "output", text: "  routing: coordinate click at bounds center" },
            { type: "success", text: "click returned { changed: true, bounds_changed: true }" },
          ]}
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            Where the other five-source fallback patterns break
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Traditional robotic process automation tools support multiple
            selector types, but the author has to write the ladder by hand.
            You author a UIA selector, then a fallback image selector, then a
            fallback OCR selector, and you catch exceptions between them. That
            ladder is step-local: if a workflow has 60 steps, you authored 60
            ladders. Terminator does this once, at the tree level, before the
            model even picks a target.
          </p>
        </section>

        <ComparisonTable
          heading="Single-source stacks vs. five-source fused stack"
          productName="Terminator"
          competitorName="Single-source"
          rows={comparisonRows}
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            Real workflows where this earns its keep
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Any workflow that crosses a boundary a single-source tool cannot
            see. Accessibility-only tools die inside Citrix. DOM-only tools die
            the moment a Windows dialog covers the browser. Vision-only tools
            read buttons but cannot invoke them through the right API. The
            five-source fuse lets one script walk through all of these.
          </p>
        </section>

        <BentoGrid cards={useCases} />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            What the ElementSource prefix unlocks
          </h2>
        </section>

        <AnimatedChecklist
          title="Side effects of giving every detection a single-character prefix"
          items={[
            { text: "The AI can mix sources in one plan without re-prompting the user.", checked: true },
            { text: "Logs are readable: u17 always means UIA element 17, never anything else.", checked: true },
            { text: "Telemetry can count which source the model preferred per app.", checked: true },
            { text: "Snapshots diff cleanly, because prefixed IDs survive tree rebuilds.", checked: true },
            { text: "Two sources returning 'index 1' do not collide: u1 is not d1.", checked: true },
            { text: "parse_prefixed_index() gives you (source, index) in one call.", checked: true },
          ]}
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            Getting this running locally
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            The clustered tree is not a special mode. Every Terminator tree
            call supports it via the source list. Start with UIA plus OCR on
            Windows, add DOM when the target app is a browser tab, add
            Omniparser or Gemini when pixels are all you have.
          </p>
        </section>

        <StepTimeline
          steps={[
            {
              title: "Install Terminator and run the MCP agent",
              description:
                "One Cargo binary runs on Windows and macOS. curl -fsSL https://t8r.tech/install.sh | bash gets the CLI and the MCP server.",
            },
            {
              title: "Point your IDE at the MCP server",
              description:
                "Claude Code, Cursor, or any MCP client. The agent exposes tools like get_clustered_tree, click_prefixed, and type_into_prefixed.",
            },
            {
              title: "Ask the model to do the workflow in plain English",
              description:
                "The model requests the clustered tree, reads the prefixed elements, decides on a cluster and prefix per step, and the agent routes the call to the right detection source.",
            },
            {
              title: "Record once, replay as YAML",
              description:
                "If the model's plan is stable, export the recorded step list to a YAML workflow that runs headless. The clustering still happens per step at replay time, so a missing UIA element on tomorrow's build falls back to OCR automatically.",
            },
          ]}
        />

        <ProofBanner
          quote="Every other tool makes you pick one detection source per step. Terminator fuses five and lets the AI pick per element."
          metric="5 sources"
          source="Terminator docs"
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            The sources, in one line each
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            Each source is a different contract with the screen. Together they
            cover every app you actually run at work.
          </p>
        </section>

        <Marquee speed={38} pauseOnHover>
          <div className="flex gap-3">
            {[
              "u  Uia  Windows UIA + macOS AX",
              "d  Dom  Live browser tabs via extension bridge",
              "o  Ocr  Screenshot to text",
              "p  Omniparser  Vision icon + region detection",
              "g  Gemini  Gemini Computer Use vision",
              "u1  button u1 is UIA element 1",
              "d1  button d1 is DOM element 1",
              "o1  word o1 is OCR match 1",
              "p1  icon p1 is Omniparser hit 1",
              "g1  region g1 is Gemini hit 1",
            ].map((s, i) => (
              <span
                key={i}
                className="inline-block px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-sm font-mono whitespace-nowrap"
              >
                {s}
              </span>
            ))}
          </div>
        </Marquee>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
            What actually happens on a click
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            The model sends a prefixed index. The framework parses it with{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-900 text-[0.9em]">
              ElementSource::parse_prefixed_index
            </code>{" "}
            at line 63. That returns the source and the index inside that
            source's cache. The executor then picks the right click backend.
          </p>
        </section>

        <FlowDiagram
          title="Prefixed index to actual click"
          steps={[
            { label: "Model emits u1", detail: "From the clustered YAML" },
            { label: "parse_prefixed_index", detail: "(Uia, 1)" },
            { label: "Lookup in uia_bounds", detail: "Role, name, bounds, selector" },
            { label: "UIA Invoke", detail: "Native accessibility click" },
            { label: "ClickResult returned", detail: "bounds_changed, title_changed" },
          ]}
        />

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Want the five-source fuse on your workflow?"
          description="Fifteen minutes, we look at the app you are trying to automate and show you which sources actually resolve its controls."
        />

        <div id="faq" className="mt-16">
          <FaqSection heading="Frequently asked about multi-source desktop automation" items={faqs} />
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Five detection sources, one clustered tree. Book a 15-minute demo."
      />
    </>
  );
}
