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
  TerminalOutput,
  FlowDiagram,
  BentoGrid,
  GlowCard,
  MetricsRow,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/desktop-automation-tools";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Desktop automation tools: why one clustered view of UIA, DOM, OCR, Omniparser, and Gemini beats picking a single perception method";
const DESCRIPTION =
  "Every desktop automation tool forces a choice: accessibility tree (WinAppDriver, UiPath) or pixel vision (SikuliX, Claude computer use, OpenAI Operator). Terminator fuses five perception sources (UIA, browser DOM, OCR, Omniparser icon detection, Gemini vision) into one spatially-clustered index so an AI coding assistant can target whichever source actually saw the element. This page walks through how that clustering works.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator's ClusteredYaml output prefixes each element with its source (#u for UIA, #d for DOM, #o for OCR, #p for Omniparser, #g for Gemini) and groups overlapping detections from different sources using union-find with a 1.5x smaller-dimension threshold. File: crates/terminator/src/tree_formatter.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A desktop automation tool that fuses five perception sources",
    description:
      "UIA, DOM, OCR, Omniparser, and Gemini vision merged into one clustered index. One agent, five ways of seeing the same pixel.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop automation tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Desktop automation tools", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a desktop automation tool, and how is it different from a browser automation tool?",
    a: "A desktop automation tool drives any application on your operating system. That includes browsers but also Excel, SAP, Teams, File Explorer, QuickBooks, Photoshop, or an internal WPF tool that has no web counterpart. Browser automation tools like Playwright only see DOM nodes inside a browser process. Desktop automation needs to reach outside the browser sandbox and talk to the OS accessibility layer (Windows UI Automation on Windows, AX API on macOS, AT-SPI2 on Linux), plus fall back to pixels when those APIs return nothing useful.",
  },
  {
    q: "Why do most tools force a choice between accessibility and vision?",
    a: "Because they pick a perception method up front. WinAppDriver, UiPath, Power Automate Desktop, and Robot Framework are accessibility-first. They query UIA, find a matching element, click. SikuliX, Claude computer use, and OpenAI Operator are vision-first. They screenshot, ask a model or OpenCV where the element is, click a coordinate. Each approach has a blind spot. UIA can miss custom-drawn canvas controls and anything rendered to a WebGL surface. Vision can miss structured metadata like AutomationId or role, which is the only reliable way to tell a disabled button apart from an enabled one that happens to look gray. Terminator's contribution is refusing to pick. It runs all five perception pipelines and clusters their outputs spatially so your agent sees every detection from every source stacked on the same screen coordinates.",
  },
  {
    q: "What exactly does the ClusteredYaml output look like?",
    a: "Every detection gets a prefixed index: #u for UIA, #d for browser DOM, #o for OCR text, #p for Omniparser icon detection, #g for Gemini vision. Elements whose bounding boxes overlap or sit within 1.5x the smaller dimension of each other collapse into one cluster, labeled with a centroid coordinate. A Submit button that UIA sees as a Button control, the DOM sees as a <button> tag, and OCR reads as the word 'Submit' ends up as three lines inside one cluster at, say, @(480, 612): [Button] #u7 'Submit', [button] #d3 'Submit', [OcrWord] #o12 'Submit'. Your agent can target the most reliable source for that specific element without screenshotting the whole screen and re-running detection.",
  },
  {
    q: "How does the clustering threshold actually work?",
    a: "In crates/terminator/src/tree_formatter.rs the should_cluster function takes two bounding boxes, computes the minimum edge distance between them (zero if they overlap), and compares against 1.5x the smaller of the two bounds' smaller dimension. That ratio is deliberately generous. An OCR word detected a few pixels offset from the UIA button that contains it will still cluster. A button halfway across the screen will not. Cluster membership is resolved with union-find path compression, so if A is close to B and B is close to C, all three end up in one group. Clusters are then sorted by the Y-then-X position of their first element to give a stable reading order.",
  },
  {
    q: "Why does an AI coding assistant need five sources and not just one?",
    a: "Because real desktops fail each source in different ways. Electron apps sometimes expose UIA elements without accessible names, so UIA says 'there is a Button here' but cannot tell you what it does; the DOM inside the Electron content view can. Office ribbons expose rich UIA metadata but render custom icons that Omniparser can identify when the accessible name is a generic 'Button'. Remote desktop or Citrix sessions hand you a single pixel buffer with no accessibility tree at all, and you have to fall back to OCR and Gemini. Non-text UI elements like chart axes or drag handles usually show up in Omniparser and Gemini but are invisible to UIA. Any tool that commits to one source will fail on a sizable slice of real applications. Clustering lets the agent skip the source that failed and click the one that succeeded.",
  },
  {
    q: "Is this different from what Claude computer use or OpenAI Operator do?",
    a: "Yes. Computer use agents from Anthropic and OpenAI take a screenshot, send it to the model, get back coordinates, and click. The model sees only pixels; it does not see the accessibility tree, it does not see the DOM, and it cannot tell if a control is disabled without inferring from visual cues. Terminator runs locally on your machine, fuses structured signals (UIA, DOM) with visual signals (OCR, Omniparser, Gemini) into one view, and hands the clustered index to whichever AI coding assistant you already use. The model still makes the decision, but it picks from a set of concrete, prefix-tagged elements with real bounding boxes instead of guessing at a pixel location.",
  },
  {
    q: "Is Terminator a developer framework or an end-user product?",
    a: "Developer framework. You install it with cargo add terminator-rs (Rust), npm install @mediar-ai/terminator (Node.js), pip install terminator-py (Python), or npx -y terminator-mcp-agent@latest (MCP server). There is no studio, no drag-and-drop canvas, no bot designer. Its job is to give Claude Code, Cursor, Codex, Windsurf, and similar AI coding assistants the ability to drive any desktop application the same way those assistants already drive browsers through Playwright. That is the whole point of publishing it as an MCP server: you add one line to your MCP config and your existing AI pair programmer can suddenly read and manipulate any Windows application.",
  },
  {
    q: "How do I see the clustered output locally?",
    a: "Install the MCP agent with `npx -y terminator-mcp-agent@latest`, wire it into your AI assistant's MCP config, and call get_window_tree with tree_output_format set to 'clustered_yaml'. The result will include the prefixed indices. You can enable additional sources with include_browser_dom, include_ocr, include_omniparser, and include_gemini_vision flags. Only UIA is on by default because the extra sources each have a cost (OCR spins up Tesseract, Omniparser needs a local model, Gemini needs an API key and a network round-trip). Turn them on when the default tree is missing what you need.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Perception sources",
    competitor: "One. Accessibility OR pixels, never both",
    ours: "Five. UIA, DOM, OCR, Omniparser, Gemini",
  },
  {
    feature: "Blind-spot fallback",
    competitor: "None. If the primary method fails, the agent is stuck",
    ours: "Automatic. Agent picks a different source's prefix",
  },
  {
    feature: "Agent-facing format",
    competitor: "Raw tree dump or a screenshot",
    ours: "Spatially-clustered YAML with prefixed indices",
  },
  {
    feature: "Coordinate system",
    competitor: "Per-source, often misaligned",
    ours: "One screen-coordinate space for all five",
  },
  {
    feature: "Disabled-button detection",
    competitor: "Guess from pixels, or query UIA only",
    ours: "Combine UIA is_enabled with visual state",
  },
  {
    feature: "Remote desktop / Citrix",
    competitor: "Accessibility tools fail outright",
    ours: "OCR and Gemini sources still fire",
  },
  {
    feature: "Canvas and WebGL",
    competitor: "UIA returns nothing; needs vision model",
    ours: "Omniparser and Gemini fill the gap",
  },
  {
    feature: "License",
    competitor: "Proprietary, seat-based, or closed",
    ours: "MIT, open source, self-hostable",
  },
];

const remotionCaptions = [
  "UIA sees it as a Button.",
  "The DOM sees a <button> tag.",
  "OCR reads the word 'Submit'.",
  "Omniparser detects the icon.",
  "Gemini describes its purpose.",
  "All five cluster at @(480, 612).",
];

const clusteredYamlOutput = `# Cluster @(480,612)
- [Button] #u7 "Submit" (bounds: [440,600,80,28])
- [button] #d3 "Submit" (bounds: [440,600,80,28])
- [OcrWord] #o12 "Submit" (bounds: [446,604,68,22])
- [icon] #p4 "paper-plane" (bounds: [448,606,18,18])
- [button] #g2 "Submit" (primary call to action, filled) (bounds: [440,600,80,28])

# Cluster @(200,248)
- [Edit] #u3 "Email" (bounds: [160,236,320,28])
- [input] #d1 "email" (bounds: [160,236,320,28])
- [OcrWord] #o5 "Email" (bounds: [172,240,48,18])

# Cluster @(1320,48)
- [Image] #u22 (bounds: [1300,32,40,40])
- [icon] #p1 "user-avatar" (bounds: [1302,34,36,36])
`;

const shouldClusterRust = `/// Determine if two elements should be clustered together.
/// Uses a relative threshold based on the smaller element dimension.
fn should_cluster(b1: Rect, b2: Rect) -> bool {
    let smaller_dim = f64::min(
        f64::min(b1.w, b1.h),
        f64::min(b2.w, b2.h),
    );
    // 1.5x the smaller dimension. Generous enough that an OCR word
    // detected a few pixels offset from its UIA parent still clusters,
    // tight enough that a button halfway across the screen does not.
    let threshold = smaller_dim * 1.5;
    min_edge_distance(b1, b2) < threshold
}

/// Union-find path compression so A~B and B~C puts A, B, C in one cluster.
fn cluster_elements(elements: Vec<UnifiedElement>) -> Vec<Vec<UnifiedElement>> {
    let mut parent: Vec<usize> = (0..elements.len()).collect();
    for i in 0..elements.len() {
        for j in (i + 1)..elements.len() {
            if should_cluster(elements[i].bounds, elements[j].bounds) {
                union(&mut parent, i, j);
            }
        }
    }
    // ... group by root, sort each cluster by (Y, X) reading order ...
}`;

const mcpCallJson = `{
  "tool": "get_window_tree",
  "arguments": {
    "pid": 13928,
    "tree_output_format": "clustered_yaml",
    "include_browser_dom": true,
    "include_ocr": true,
    "include_omniparser": true,
    "include_gemini_vision": false
  }
}`;

const sourceMetrics = [
  { value: 5, label: "Perception sources fused" },
  { value: 1, label: "Prefix character per source" },
  { value: 1.5, decimals: 1, suffix: "x", label: "Clustering threshold (smaller dim)" },
  { value: 35, label: "MCP tools exposed to agents" },
];

const checklistItems = [
  { text: "Accessibility-first tools miss canvas, WebGL, and remote desktop" },
  { text: "Vision-first tools miss is_enabled, AutomationId, accessible name" },
  { text: "Neither approach helps when both sources partially fail" },
  { text: "Running both separately forces the agent to pick wrong up front" },
];

const clusteringSteps = [
  {
    label: "Each source writes detections to its own cache",
    detail: "UIA walks the accessibility tree via one IUIAutomationCacheRequest. DOM comes from the browser extension injecting a hit-test script. OCR rasterizes the window and runs Tesseract. Omniparser runs a local vision model. Gemini returns structured JSON. Every detection carries a bounding box in screen coordinates.",
  },
  {
    label: "ElementSource tags each detection with a prefix",
    detail: "UIA gets 'u', DOM 'd', OCR 'o', Omniparser 'p', Gemini 'g'. Indices stay source-local so #u1 and #d1 can both exist in the same window without collision.",
  },
  {
    label: "Union-find clusters overlapping bounds across sources",
    detail: "For every pair of detections, if min_edge_distance is less than 1.5x the smaller bounding dimension, union their sets. A small OCR word sitting inside a large UIA button still clusters because the smaller dimension controls the threshold.",
  },
  {
    label: "Clusters sort by reading order, elements sort within",
    detail: "Clusters sort by the (Y, X) of their first element so the agent reads top-to-bottom. Within a cluster, elements sort by reading order too, so the densest structured source (usually UIA) tends to appear first when all are present.",
  },
  {
    label: "The agent picks a prefix and clicks",
    detail: "Claude, Cursor, or any MCP-speaking agent now sees one YAML with every detection stacked on the same coordinate. If #u7 is present it uses UIA selectors. If UIA only sees an empty Pane, #d3 routes through the DOM. If the window is Citrix, only #o and #g exist, and those become the targets.",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "UIA: structured metadata",
    description:
      "Role, AccessibleName, AutomationId, BoundingRectangle, IsEnabled, IsKeyboardFocusable. Batched into one CacheRequest so a full subtree costs one COM round-trip instead of thousands.",
    accent: true,
  },
  {
    title: "DOM: the browser truth",
    description:
      "A Chrome extension injects into the page and reports tag, identifier, and viewport-aligned bounds. Catches anything the browser renders outside UIA's reach, including shadow DOM and canvas overlays.",
  },
  {
    title: "OCR: text the others missed",
    description:
      "Tesseract runs on a captured window screenshot. Essential for Citrix, remote desktop, and any custom-drawn control that does not expose an accessible name.",
  },
  {
    title: "Omniparser: icon and widget vision",
    description:
      "A local model that detects clickable regions by appearance, not by text. Ships bounding boxes plus a label (icon, button, chart). Works on WebGL canvases and paint-mode UIs.",
  },
  {
    title: "Gemini: natural-language descriptions",
    description:
      "Optional. When enabled, returns 2D boxes with element_type, content, and a short description like 'primary call to action, filled'. Useful when the agent needs to disambiguate between visually similar controls.",
  },
  {
    title: "Cluster: one view over all five",
    description:
      "Each detection is turned into a UnifiedElement with source, index, display_type, text, description, bounds. Clusters emit a centroid header and a prefixed-index line per element. That is what the model sees.",
    accent: true,
  },
];

const terminalLines = [
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "[terminator] MCP server listening on stdio", type: "output" as const },
  { text: "[terminator] 35 tools registered", type: "output" as const },
  { text: "[claude] get_window_tree pid=13928 tree_output_format=clustered_yaml", type: "command" as const },
  { text: "[terminator] UIA cache request completed: 142 elements", type: "output" as const },
  { text: "[terminator] DOM bridge: 47 elements", type: "output" as const },
  { text: "[terminator] OCR: 86 words", type: "output" as const },
  { text: "[terminator] Omniparser: 12 icons", type: "output" as const },
  { text: "[terminator] clustered into 41 groups", type: "success" as const },
  { text: "[claude] invoke selector=#u7", type: "command" as const },
  { text: "[terminator] click on Button 'Submit' at (480,612)", type: "success" as const },
];

const beamFrom = [
  { label: "UIA", sublabel: "#u" },
  { label: "DOM", sublabel: "#d" },
  { label: "OCR", sublabel: "#o" },
  { label: "Omniparser", sublabel: "#p" },
  { label: "Gemini", sublabel: "#g" },
];

const beamTo = [
  { label: "Clustered YAML", sublabel: "one view" },
  { label: "Prefixed indices", sublabel: "#u1, #d2, #o3 ..." },
  { label: "MCP tools", sublabel: "get_window_tree" },
  { label: "Your AI agent", sublabel: "picks a prefix" },
];

const beamHub = { label: "cluster_elements", sublabel: "union-find, 1.5x threshold" };

const listicleTools = [
  "Power Automate Desktop",
  "UiPath Studio",
  "AutomationAnywhere",
  "Blue Prism",
  "WinAppDriver",
  "AutoHotkey",
  "SikuliX",
  "Robot Framework",
  "AskUI",
  "TestComplete",
  "Ranorex",
  "Squish",
];

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchema = faqPageSchema(faqs);

export default function Page() {
  return (
    <>
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

      <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <BackgroundGrid pattern="dots" glow>
          <div className="py-10">
            <ArticleMeta
              datePublished={PUBLISHED}
              author="Matthew Diakonov"
              readingTime="13 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Desktop automation tools, reconsidered: one{" "}
              <GradientText>clustered view</GradientText> over five perception sources
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every roundup of desktop automation tools forces you into the same binary. Accessibility,
              like WinAppDriver, UiPath, or Power Automate Desktop. Or pixels, like SikuliX, Claude
              computer use, or OpenAI Operator. Each approach has a real blind spot. This guide is
              about a third option: fuse both, tag every detection with its source, and let the agent
              pick a prefix.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="Five perception sources, one clustered index, MIT licensed"
          highlights={[
            "UIA, DOM, OCR, Omniparser, Gemini in one view",
            "Union-find clustering at 1.5x the smaller dimension",
            "MCP server exposes this to Claude, Cursor, Codex",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="One pixel, five perceptions"
            subtitle="How Terminator merges every way of seeing the screen"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The binary everyone else forces on you
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Search for desktop automation tools and the same twelve products keep appearing. Each one
            commits to a single way of seeing the screen. That commitment is the thing an AI coding
            assistant has to live with once it starts running in a loop.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="What every shortlist gets wrong"
              items={checklistItems}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A tool that queries UIA will never see the pixel-drawn chart axis your workflow needs to
            click. A tool that screenshots and sends the image to a vision model will never know
            whether a button is actually disabled or just styled gray. If your agent has to pick one
            or the other at configuration time, it will be wrong on a non-trivial slice of real
            applications.
          </p>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: five sources, one prefix each, one cluster per pixel
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Terminator runs every perception method the tool supports and merges them. The core
                type that makes this work lives in{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  crates/terminator/src/tree_formatter.rs
                </code>
                . It is an enum called <code>ElementSource</code> with five variants: <code>Uia</code>,{" "}
                <code>Dom</code>, <code>Ocr</code>, <code>Omniparser</code>, <code>Gemini</code>. Each
                variant is assigned a one-character prefix: <code>u</code>, <code>d</code>,{" "}
                <code>o</code>, <code>p</code>, <code>g</code>. Every detection the tool makes from
                any source becomes a <code>UnifiedElement</code> with those fields, plus a bounding
                box in screen coordinates.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                The agent never sees five separate trees. It sees one YAML, clustered by spatial
                proximity. The function that does the clustering is <code>cluster_elements</code> and
                the decision function next to it is <code>should_cluster</code>. That is the anchor
                fact for this guide.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The five perception sources, each tagged with its prefix
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every source earns its place by covering a failure mode of the others. Running all five
            only matters because real desktops fail them in different ways on different apps.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How the clustering actually runs
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Five separate perception pipelines produce detections. A merging step collapses detections
            that sit on top of each other into one group. The merging step is not magic; it is a
            union-find with a generous distance threshold.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="Perception sources merge into one clustered view"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
          <div className="mt-6">
            <FlowDiagram
              title="From five pipelines to one YAML"
              steps={clusteringSteps.map((s) => ({
                label: s.label,
                detail: s.detail,
              }))}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The threshold: 1.5x the smaller dimension
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The clustering decision is deliberately simple. Two detections cluster if their bounding
            boxes overlap, or if the minimum edge distance between them is less than 1.5x the smaller
            of the two smaller-dimensions. That ratio is the whole tuning budget. It is tight enough
            that a button and a text label three rows away do not cluster, loose enough that an OCR
            word detected a few pixels offset from the UIA parent still does.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={shouldClusterRust}
              language="rust"
              filename="crates/terminator/src/tree_formatter.rs"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Union-find then resolves transitive closure. If A clusters with B and B with C, all three
            become one group. Path compression keeps the lookup cheap even when a window has hundreds
            of detections. After clustering, each group sorts by reading order (Y then X) and the
            groups themselves sort by the position of their first element, so the emitted YAML reads
            top-down like a normal document.
          </p>
          <div className="mt-6">
            <ProofBanner
              quote="The generous threshold was the right call. OCR bounds land a few pixels off from UIA bounds constantly, and you want them to cluster anyway."
              source="Implementation note, tree_formatter.rs"
              metric="1.5x"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the agent actually reads
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            When the MCP agent emits a clustered tree, every element is on a line with its source
            prefix, its display type, an optional name or description, and the bounding box. An agent
            scanning the YAML for a Submit button finds three lines inside one cluster: UIA, DOM, and
            OCR all confirmed the same region.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={clusteredYamlOutput}
              language="yaml"
              filename="get_window_tree (tree_output_format: clustered_yaml)"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If the agent wants the structured metadata, it picks <code>#u7</code>. If UIA is empty and
            the DOM is not (common on web views and Electron apps), it picks <code>#d3</code>. If the
            session is Citrix and only OCR fired, it picks <code>#o12</code>. The agent does not have
            to decide its perception strategy up front. It reads the YAML and targets the line that
            has the most information.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The tool call that exposes it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP agent registers 35 tools. The one that surfaces clustered output is{" "}
            <code>get_window_tree</code>. You set <code>tree_output_format</code> to{" "}
            <code>clustered_yaml</code> and toggle the sources you want. Only UIA is on by default
            because the extra sources each have a cost: OCR boots Tesseract, Omniparser loads a local
            model, Gemini calls a remote API.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={mcpCallJson}
              language="json"
              filename="MCP tool call"
            />
          </div>
          <div className="mt-6">
            <TerminalOutput
              title="Running the MCP server"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Numbers worth pinning
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of these are benchmark claims. They are facts about how the tool is wired.
          </p>
          <div className="mt-6">
            <MetricsRow metrics={sourceMetrics} />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Five sources, one prefix each, a <NumberTicker value={1.5} decimals={1} suffix="x" /> clustering threshold, and{" "}
            <NumberTicker value={35} /> MCP tools that the agent can call once the tree is in hand.
            The rest of the behavior, clicks, typing, invoke, scroll, is standard desktop automation.
            The interesting part is the view the agent reads before it decides what to do.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How this compares to single-perception tools
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Single-perception tools"
            rows={comparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The usual shortlist, and where it sits in this view
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            For context, the products that most roundups recommend. Each one makes a single perception
            bet. None of them publish a clustered view over multiple sources.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {listicleTools.map((t) => (
              <span
                key={t}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700"
              >
                {t}
              </span>
            ))}
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most are accessibility-first studios aimed at business analysts. A few are image-matching
            tools aimed at QA engineers. A new cohort (Claude computer use, OpenAI Operator, AskUI) is
            model-first and pixel-based. They all solve specific problems well. The gap is that none
            of them expose a unified, spatially-aligned index to the agent driving the loop.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why a developer framework, not a studio
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A studio assumes a human is in the loop: dragging activities onto a canvas, recording a
            workflow, picking elements from a visual picker. An AI coding assistant writes code, calls
            functions, reads structured output, and recovers from errors. The interface it wants is a
            typed SDK plus an MCP server.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator ships the Rust core, NAPI-RS bindings for Node, PyO3 bindings for Python, and
            the MCP agent as an npm package. One line in your MCP config gives Claude Code, Cursor,
            Windsurf, or Codex the ability to drive any desktop application. The clustered tree is
            what they read first on every iteration.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="See the clustered view on your own desktop"
          description="Twenty minutes, your screen, our agent. We will point it at whichever application breaks your current tool and watch the prefixes light up."
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Frequently asked
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Show us the app your current tool cannot see."
      />
    </>
  );
}
