import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  Marquee,
  NumberTicker,
  GradientText,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  ComparisonTable,
  AnimatedChecklist,
  MetricsRow,
  HorizontalStepper,
  GlowCard,
  BentoGrid,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
  type RelatedPost,
  type StepperStep,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/accessibility-api-computer-use-agents";
const PUBLISHED = "2026-04-25";
const TITLE =
  "Accessibility API for computer use agents: the seven-mode click_element router";
const DESCRIPTION =
  "A computer use agent that only clicks by accessibility selector breaks the moment it hits an Office canvas, an Electron child window, or a custom-rendered control. Terminator's click_element MCP tool dispatches across seven grounding modes (AX selector, AX-tree index, OCR index, Omniparser index, Gemini-vision index, DOM index, raw coordinates) under one signature. Source at crates/terminator-mcp-agent/src/utils.rs lines 728 and 1062.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Most playbooks frame accessibility API and computer use as a binary choice. The reality is that any production agent has to fall through grounding sources because no single source covers every UI surface. Terminator's click_element wraps all seven into one tool.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility API for computer use agents, the seven-mode router",
    description:
      "ClickMode (Selector, Index, Coordinates) plus VisionType (UiTree, Ocr, Omniparser, Gemini, Dom) equals seven distinct click paths through one MCP tool. server.rs:2486.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Accessibility API for computer use agents" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Accessibility API for computer use agents", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why do computer use agents need anything beyond the accessibility tree?",
    a: "Because the accessibility tree is not a complete description of every pixel that matters. Office documents render their content inside a single canvas element with no AX children for individual cells, paragraphs, or shapes. Electron apps wrap a Chromium renderer and often expose only the outer window through UIA, leaving the actual UI invisible to the AX tree until the chrome.accessibility flag is on. Custom-rendered controls in games, IDEs, and design tools paint pixels directly. An agent that can only click by AX selector hits these surfaces and stops. The fix is not to give up on accessibility, it is to layer alternative grounding sources behind the same click tool so the agent can keep the AX path as default and fall through when the tree is silent.",
  },
  {
    q: "What are the seven click paths in Terminator and where are they declared?",
    a: "Three modes plus five vision sources. ClickMode (Selector, Index, Coordinates) lives at crates/terminator-mcp-agent/src/utils.rs lines 728-736. VisionType (Ocr, Omniparser, Gemini, Dom, UiTree) lives at the same file lines 1062-1067. Selector mode resolves an AX selector through the platform engine. Index mode plus UiTree resolves a 1-based clickable index against a UIA tree captured by get_window_tree. Index plus Ocr resolves against the cache populated by include_ocr. Index plus Omniparser resolves against include_omniparser. Index plus Gemini resolves against include_gemini_vision. Index plus Dom resolves against the Chrome extension's DOM bounds. Coordinates is raw screen-space x and y. All seven dispatch through one click_element function at server.rs:2486.",
  },
  {
    q: "How does the index work for non-AX grounding sources like OCR or Omniparser?",
    a: "Each grounding source caches bounds in its own map on the MCP server. server.rs holds five separate Mutex<HashMap<u32, ...>>: uia_bounds, ocr_bounds, omniparser_items, vision_items, dom_bounds. When you call get_window_tree with include_ocr or include_omniparser, the server runs the detector, assigns 1-based indices to each detected box, and stores the bounds in the matching map. The model sees lines like '#42 [Button] Save' or '#42 OCR: \"Save\" bounds [840,32,68,28]'. When the agent later calls click_element with index: 42 and vision_type: \"omniparser\", server.rs:2660 looks up entry 42 in omniparser_items, takes the box_2d, computes the center, and routes to desktop.click_at_coordinates_with_type. The agent has called back to a vision-grounded element with the same shape it would call back to an AX node.",
  },
  {
    q: "Does the agent have to choose grounding sources up front, or can it fall through?",
    a: "Fall through. The recommended pattern is to call get_window_tree once with include_ocr: true, include_omniparser: true (or include_gemini_vision: true), and include_browser_dom: true if you are in a browser. The server returns a unified compact YAML with each source prefixed (#u for UIA, #o for OCR, #m for Omniparser, #v for Gemini vision, #d for DOM). The agent sees every grounded element across every source in one tree, picks the highest-confidence one for each click, and calls click_element with the matching vision_type. If the AX tree exposes the element, the agent uses index plus UiTree; if it doesn't, but OCR caught the label, the agent uses index plus Ocr; if nothing else worked but a vision model spotted an icon, the agent uses index plus Gemini. Coordinates is the last resort, used only when none of the indexed sources caught the element.",
  },
  {
    q: "Why is index-based vision better than just clicking at raw coordinates?",
    a: "Two reasons, both about agent reliability. First, the index is a stable handle the agent can carry across reasoning steps without re-deriving it. The model is more accurate calling back to '#42 the omniparser-detected Save icon at [840,32,68,28]' than computing those coordinates fresh from a screenshot every turn. Second, the server is the one that converts the index to actual screen coordinates, so DPI scaling, window offset, and any image resize the detector applied are handled in one well-tested function. Compare that to the Gemini computer use loop in terminator-computer-use, where the model emits 0-999 normalized coordinates and convert_normalized_to_screen has to apply four sequential transforms (resize_scale, DPI, window x, window y) for each click. Index dispatch skips the math; the bounds were captured at real screen coordinates from the start.",
  },
  {
    q: "What does this look like in practice for a Claude or Gemini computer use agent?",
    a: "Wire Terminator's MCP server into the agent's tool list. The agent now sees one click_element tool instead of a screenshot-coordinate tool. Its first call is get_window_tree with include_ocr: true and include_omniparser: true. The compact YAML comes back with up to five interleaved grounding sources, indexed. From that point on, every click_element call carries either a selector, an index plus vision_type, or coordinates. The agent's reasoning becomes 'this Save button is in the AX tree as #88, click that' or 'the icon I want is not in the AX tree but Omniparser caught it as #156, click that with vision_type omniparser'. The agent never has to choose at boot time whether to be an accessibility agent or a vision agent. It is both, per click.",
  },
  {
    q: "What grounding source should the agent prefer when more than one matches?",
    a: "AX tree first, DOM second (in browsers), Omniparser or Gemini-vision third, OCR fourth, raw coordinates last. The order is rank-by-stability. AX selectors and AX indices reference elements the OS itself classified, so they are robust across re-renders, DPI changes, and window resizes. DOM indices come from the live Chromium tree, also stable as long as the page hasn't navigated. Omniparser and Gemini-vision boxes are stable for as long as the captured screenshot is, then need re-grounding. OCR is the least stable because text recognition jitters around character boundaries. Raw coordinates are the most fragile because nothing on the screen is anchored to them; a window move invalidates the click. The same click_element call accepts all of them, so an agent can encode this priority in its system prompt and still emit the same JSON shape.",
  },
  {
    q: "Does the seven-mode router add latency compared to a pure-AX or pure-vision agent?",
    a: "Negligible. ClickMode::determine_mode at utils.rs:740 is a constant-time check on which arguments are present. The vision_type match in server.rs:2609 is one HashMap lookup keyed by index. The bottleneck for any of these paths is the platform-side click, not the dispatch. The interesting cost is the up-front call to get_window_tree with the include_* flags on, because OCR and Omniparser run on the captured screenshot before returning. That happens once per agent turn rather than once per click, and the result is cached and indexed for every click_element call until the next get_window_tree.",
  },
  {
    q: "Where does Terminator's bundled gemini_computer_use loop fit, and when should I use it instead?",
    a: "Use the MCP server with click_element when you are wiring an existing agent (Claude, custom OpenAI tool-use, your own harness) that already has its own reasoning loop. Use the bundled Desktop::gemini_computer_use loop in crates/terminator/src/computer_use/mod.rs:483 when you want a self-contained agent that runs end-to-end against the Gemini Computer Use API. The bundled loop is screenshot-only and uses normalized 0-999 coordinates throughout; it is the right choice if you want to ship a working agent in fifteen lines of Rust without designing your own tool layer. The MCP path is the right choice when the AX tree is the primary input and vision is a fallback. Both share the same desktop click implementation underneath.",
  },
  {
    q: "Is the index for one source ever valid for another, or do I have to track which source produced which index?",
    a: "Track it. Each grounding source has its own bounds map, and the indices are namespaced per source by the prefix on the line in get_window_tree's output (#u, #o, #m, #v, #d). Calling click_element with index: 42 and the wrong vision_type will either miss or land on a different element. In practice the agent does not re-derive this; it copies the prefix and the integer from the line it just read. The compact YAML's prefixing is what makes the seven-mode router safe to expose to an LLM without requiring it to memorize the cache topology.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "click paths exposed to the agent",
    competitor: "one (selector) or one (coordinates)",
    ours: "seven, switchable per click via the same tool signature",
  },
  {
    feature: "behavior on non-AX UI (Office canvas, Electron, custom controls)",
    competitor: "the agent stalls or hallucinates a missing element",
    ours: "fall through to OCR, Omniparser, Gemini-vision, or DOM index",
  },
  {
    feature: "how vision-detected elements are addressed",
    competitor: "raw pixel coordinates re-derived every turn",
    ours: "1-based index into a server-side bounds map, stable across turns",
  },
  {
    feature: "DPI and window-offset handling for vision clicks",
    competitor: "model emits normalized coords, convert_normalized_to_screen runs four transforms",
    ours: "bounds captured in real screen space, click_at_coordinates dispatched directly",
  },
  {
    feature: "where source-level grounding is declared",
    competitor: "scattered across the agent harness",
    ours: "ClickMode at utils.rs:728, VisionType at utils.rs:1062, dispatch at server.rs:2486",
  },
  {
    feature: "tree input shape",
    competitor: "raw UIA XML or screenshot, depending on source",
    ours: "single compact YAML with #u, #o, #m, #v, #d prefixes per source",
  },
  {
    feature: "cost when the action did not move the tree",
    competitor: "agent re-snapshots and re-reads the same elements",
    ours: "ui_diff_before_after returns the literal delta, often zero lines",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Selector → AX engine",
    description:
      "click_element with selector: 'role:Button && name:Save'. Resolves through the platform AX engine (UIA on Windows, AXUIElement on macOS, AT-SPI2 on Linux). The most stable path; survives re-render, resize, DPI change. Use as default.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Index + UiTree",
    description:
      "click_element with index: 88 and vision_type: 'uitree' (the default). Looks up uia_bounds, the cache populated by get_window_tree. Same AX provenance as selector mode but referenced by the integer the model just read.",
    size: "1x1",
  },
  {
    title: "Index + Dom",
    description:
      "Browser only. include_browser_dom merges the Chromium DOM tree with UIA, prefixed #d. click_element index plus vision_type 'dom' looks up dom_bounds from the live page. Use when AX exposes only the outer Chrome window but the page itself is what matters.",
    size: "1x1",
  },
  {
    title: "Index + Omniparser",
    description:
      "include_omniparser runs Microsoft's icon detector on the screenshot and emits indexed boxes prefixed #m. click_element index plus vision_type 'omniparser' resolves omniparser_items. Use when the target is an unlabeled icon or graphical control.",
    size: "1x1",
  },
  {
    title: "Index + Gemini",
    description:
      "include_gemini_vision asks Gemini to label salient elements; the result is cached as vision_items and prefixed #v. click_element index plus vision_type 'gemini' resolves through that cache. Use as a heavier fallback when neither AX nor Omniparser caught the element.",
    size: "1x1",
  },
  {
    title: "Index + Ocr",
    description:
      "include_ocr runs text recognition over the screenshot, prefixes detected text with #o, and stores ocr_bounds. click_element index plus vision_type 'ocr' clicks the center of a recognized phrase. Use for app UIs that paint text directly into a canvas.",
    size: "1x1",
  },
  {
    title: "Coordinates",
    description:
      "click_element with x and y. No grounding, no cache lookup, just desktop.click_at_coordinates_with_type at server.rs:2552. The last-resort path when nothing else caught the element. Stable only as long as the window does not move.",
    size: "2x1",
  },
];

const clickModeSource = `// crates/terminator-mcp-agent/src/utils.rs, lines 728 and 1062

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ClickMode {
    Selector,    // click_element { selector, process }
    Index,       // click_element { index, vision_type }
    Coordinates, // click_element { x, y }
}

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum VisionType {
    Ocr,         // index references ocr_bounds
    Omniparser,  // index references omniparser_items
    Gemini,      // index references vision_items
    Dom,         // index references dom_bounds
    UiTree,      // index references uia_bounds   (default)
}

// determine_mode at utils.rs:740 picks the click path from the
// arguments the model sent. Exactly one of (selector), (index),
// or (x + y) must be set.

pub fn determine_mode(&self) -> Result<ClickMode, String> {
    let has_selector = self.selector.is_some();
    let has_index    = self.index.is_some();
    let has_coords   = self.x.is_some() && self.y.is_some();

    let mode_count = [has_selector, has_index, has_coords]
        .iter().filter(|&&x| x).count();

    if mode_count != 1 {
        return Err("specify exactly one mode".into());
    }
    if has_selector { Ok(ClickMode::Selector) }
    else if has_index { Ok(ClickMode::Index) }
    else { Ok(ClickMode::Coordinates) }
}`;

const dispatchSource = `// crates/terminator-mcp-agent/src/server.rs:2599-2730 (Index branch, condensed)

ClickMode::Index => {
    let index = args.index.unwrap();
    let vision_type = args.get_vision_type();

    let (label, bounds) = match vision_type {
        VisionType::UiTree => {
            self.uia_bounds.lock()?.get(&index)
                .map(|(role, name, b, _)| (format!("{role}: {name}"), *b))?
        }
        VisionType::Ocr => {
            self.ocr_bounds.lock()?.get(&index)
                .map(|(text, b)| (text.clone(), *b))?
        }
        VisionType::Omniparser => {
            self.omniparser_items.lock()?.get(&index)
                .map(|item| (item.label.clone(), bbox_from_box2d(item.box_2d)))?
        }
        VisionType::Gemini => {
            self.vision_items.lock()?.get(&index)
                .map(|item| (item.element_type.clone(), bbox_from_box2d(item.box_2d)))?
        }
        VisionType::Dom => {
            self.dom_bounds.lock()?.get(&index)
                .map(|(tag, id, b)| (format!("{tag}: {id}"), *b))?
        }
    };

    let click_x = bounds.0 + bounds.2 / 2.0;
    let click_y = bounds.1 + bounds.3 / 2.0;

    self.desktop.click_at_coordinates_with_type(click_x, click_y, ...)?;
    // Five sources converge on one click. The agent saw an index;
    // the OS gets a screen-space click.
}`;

const treeSnippet = `# get_window_tree(process: "msword",
#                 include_ocr: true,
#                 include_omniparser: true)
# A single tree with five sources, prefixed and indexed.

#u1 [Window] Document1 - Word (focused)
#u2  [TitleBar]
#u3   [Button] Save
#u4   [Button] Undo
#u5  [Pane] Ribbon
#u6   [TabItem] Home (selected)
#u7   [TabItem] Insert
#u8  [Pane] Document Body            # opaque AX surface, no children
#m24    [Icon] table-grid bounds [612,228,32,32]
#m25    [Icon] insert-image bounds [648,228,32,32]
#o91    OCR "First quarter results"   bounds [320,520,420,28]
#o92    OCR "April 14, 2026"          bounds [320,560,180,22]
#u120 [Pane] Status bar
#u121  [StatusItem] Page 1 of 1

# Notice the document body. AX gives the agent nothing. OCR caught the
# headings, Omniparser caught two ribbon icons. Each line is a real,
# clickable handle.`;

const agentCallSnippet = `// Single agent step through MCP. The agent reads the tree above,
// then clicks "Insert > Picture" by selector first, falls through
// to Omniparser when the selector is missing, and lands the click.

await mcp.call("click_element", {
  process: "msword",
  selector: "role:Button && name:Picture",
  // optional alternative_selectors: "role:MenuItem && name:Picture"
});

// Returns 404 because the Insert tab has not been activated yet.
// The agent then targets the ribbon icon Omniparser caught:

await mcp.call("click_element", {
  process: "msword",
  index: 25,
  vision_type: "omniparser",   // dereferences omniparser_items[25]
});

// Server resolves [648,228,32,32], computes center (664, 244),
// calls desktop.click_at_coordinates_with_type. The agent never had
// to compute pixels itself; one tool, two grounding sources, one click.`;

const fallthroughLines = [
  { text: "agent step 14", type: "info" as const },
  { text: 'click_element { selector: "role:Button && name:Save" }', type: "command" as const },
  { text: "[click_element] Mode: Selector, click_type: Left", type: "output" as const },
  { text: "[click_element] Selector mode: 'role:Button && name:Save'", type: "output" as const },
  { text: "Selector resolved no element in 800ms; AX surface returned 0 matches.", type: "error" as const },
  { text: "agent decides to fall through, picks line #m25 from the cached tree", type: "info" as const },
  { text: 'click_element { index: 25, vision_type: "omniparser" }', type: "command" as const },
  { text: "[click_element] Mode: Index, click_type: Left", type: "output" as const },
  { text: "[click_element] Index mode: 25, Omniparser", type: "output" as const },
  { text: "omniparser_items[25] = { label: 'save-disk-icon', bounds: (648,228,32,32) }", type: "output" as const },
  { text: "click center -> (664, 244) via click_at_coordinates_with_type", type: "output" as const },
  { text: "executed_without_error in 12ms", type: "success" as const },
];

const fallthroughSteps: StepperStep[] = [
  {
    title: "1. AX selector",
    description:
      "Try role + name through the OS accessibility engine. UIA, AXUIElement, AT-SPI2. The most stable click; reuses the OS's own classification.",
  },
  {
    title: "2. AX index",
    description:
      "If the agent already has a UIA tree from get_window_tree, click by integer. Same provenance as selector, no string parsing.",
  },
  {
    title: "3. DOM index",
    description:
      "In Chrome, the bundled extension merges the live DOM into the same compact YAML. Use the #d-prefixed line when AX hides the page contents.",
  },
  {
    title: "4. Omniparser index",
    description:
      "For unlabeled icons and graphical controls. include_omniparser runs Microsoft's detector on the screenshot, indexes each box.",
  },
  {
    title: "5. Gemini-vision index",
    description:
      "Heavier vision pass when Omniparser missed the element. include_gemini_vision asks Gemini to label salient regions; results indexed and cached.",
  },
  {
    title: "6. OCR index",
    description:
      "When the target is text painted into a canvas with no element behind it. include_ocr runs recognition; click the center of the matched phrase.",
  },
  {
    title: "7. Raw coordinates",
    description:
      "Last resort. Pass x and y. Stable only as long as the window does not move. Use only when none of the indexed sources caught the element.",
  },
];

const sequenceActors = ["Agent", "MCP server", "Bounds cache", "Desktop"];

const sequenceMessages = [
  { from: 0, to: 1, label: "get_window_tree(process, include_ocr, include_omniparser, include_browser_dom)", type: "request" as const },
  { from: 1, to: 2, label: "populate uia_bounds, ocr_bounds, omniparser_items, dom_bounds", type: "event" as const },
  { from: 1, to: 0, label: "compact YAML with #u, #o, #m, #d prefixes", type: "response" as const },
  { from: 0, to: 1, label: 'click_element { selector: "role:Button && name:Save" }', type: "request" as const },
  { from: 1, to: 3, label: "AX engine resolve fails", type: "error" as const },
  { from: 1, to: 0, label: "404, no element matched selector", type: "response" as const },
  { from: 0, to: 1, label: 'click_element { index: 25, vision_type: "omniparser" }', type: "request" as const },
  { from: 1, to: 2, label: "lookup omniparser_items[25]", type: "request" as const },
  { from: 2, to: 1, label: "bounds (648,228,32,32)", type: "response" as const },
  { from: 1, to: 3, label: "click_at_coordinates_with_type(664, 244)", type: "request" as const },
  { from: 3, to: 1, label: "executed_without_error", type: "response" as const },
  { from: 1, to: 0, label: "result with mode=index, vision_type=omniparser, label=save-disk-icon", type: "response" as const },
];

const checklistItems = [
  { text: "On the first agent turn, call get_window_tree with include_ocr, include_omniparser (or include_gemini_vision), and include_browser_dom in browsers. One screenshot powers all five vision-side caches." },
  { text: "Have the agent prefer selectors. The model emits role:X && name:Y; the AX engine does the resolve. This is the cheapest, most stable path and what most clicks should land on." },
  { text: "When the AX engine returns no match, do not retry with a fuzzier selector. Look at the unified tree, pick the next-best grounding source, and call click_element with the matching index plus vision_type." },
  { text: "Carry the source prefix and integer verbatim from the tree line into the click_element call. The cache topology is per-source; mixing index 25 with the wrong vision_type misses." },
  { text: "Reserve raw coordinates for the case when nothing in the tree caught the target. If the agent reaches that branch, log it; it is a signal that include_omniparser or include_gemini_vision was off when it should have been on." },
  { text: "Pair every action call with ui_diff_before_after: true so the agent sees the delta after the click and can decide whether to keep going on the same source or re-call get_window_tree to refresh the caches." },
];

const metrics = [
  { value: 7, label: "distinct grounding paths exposed by click_element under one tool signature" },
  { value: 5, label: "vision sources cached per get_window_tree turn (UIA, DOM, OCR, Omniparser, Gemini)" },
  { value: 1, label: "function (server.rs:2486) dispatches every click; bounds map lookup is constant time" },
  { value: 0, label: "extra round-trip when falling from AX selector to a vision index in the same turn" },
];

const proofItems = [
  "ClickMode at utils.rs:728",
  "VisionType at utils.rs:1062",
  "click_element at server.rs:2486",
  "5 bounds caches: uia, ocr, omniparser, vision, dom",
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility API for AI agents: diff the tree, don't re-read it",
    excerpt:
      "Companion piece on the input loop. ui_tree_diff strips volatile #ids and bounds with two regexes, then ships only the lines that changed. 20 MCP tools accept the diff flag.",
    href: "/t/accessibility-api-ai-agents",
    tag: "Loop",
  },
  {
    title: "Claude computer use, the pixel-coordinate loop and the selector alternative",
    excerpt:
      "Claude's native computer_20251022 tool emits left_click [x, y]. Terminator's MCP gives the same model 32 selector-based tools so it can click by role and name instead.",
    href: "/t/claude-computer-use",
    tag: "Agents",
  },
  {
    title: "Open source computer use AI agents, April 2026",
    excerpt:
      "Snapshot of which agents use accessibility APIs, which use vision, and which combine both. Where Terminator sits between the two camps, and why hybrid is winning.",
    href: "/t/open-source-computer-use-agents-april-2026",
    tag: "Ecosystem",
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
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
            Accessibility API for computer use agents:{" "}
            <GradientText>seven click paths</GradientText>, one MCP tool.
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
            Most articles on this topic frame it as a binary. Either you build
            an accessibility-tree agent that clicks by role and name, or you
            build a computer use agent that clicks by pixel coordinates from a
            screenshot. The reality of any agent that ships against real
            desktop apps is messier. Office documents render their content
            inside a single canvas with no AX children. Electron apps hide
            their renderer behind one outer window. Custom controls in IDEs
            and design tools paint pixels directly. An agent that knows only
            one click path stalls on those surfaces.
          </p>
          <p className="mt-4 text-lg text-zinc-600 max-w-3xl">
            Terminator&apos;s MCP server exposes one click tool,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              click_element
            </code>
            , that dispatches across seven distinct grounding paths under the
            same JSON shape. The implementation is small, the agent contract
            is simple, and the entire fall-through ladder is in two enums and
            one function. This page is the tour.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ClickMode
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              VisionType
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIA + DOM + OCR + Omniparser + Gemini
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MCP
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MIT
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <RemotionClip
            title="One tool. Seven click paths."
            subtitle="click_element fans out across selector, AX index, DOM, OCR, Omniparser, Gemini, and raw coordinates."
            captions={[
              "AX selector first, by role and name",
              "Index into the cached UIA tree",
              "DOM index for browser pages",
              "Omniparser for unlabeled icons",
              "Gemini-vision for heavy fallbacks",
              "OCR when text is painted into canvas",
            ]}
            accentHex="#FB923C"
            accentHexDark="#EA580C"
          />
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Terminator maintainer"
          datePublished={PUBLISHED}
          readingTime="13 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <ProofBand
            rating={4.9}
            ratingCount="developers wiring computer use agents to desktop apps"
            highlights={proofItems}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            The framing problem
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pick up any guide on accessibility versus computer use and you get
            the same diagram: a tree on the left, a screenshot on the right,
            an arrow between them labeled &quot;or.&quot; The accessibility
            tree is presented as the structured, deterministic, fast option;
            vision is presented as the slow, fragile, expensive option. Pick
            one.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That framing is fine for a thought experiment. It does not match
            what the agent actually has to do. Real desktop work crosses
            surfaces. A daily flow can start in Outlook (rich AX tree),
            navigate into a Word document (opaque canvas), drop into an
            Electron-shell internal tool (AX hidden), and finish in a Chrome
            tab (DOM tree available, AX truncated). The agent that can only
            click by AX selector breaks at the second step. The agent that
            can only click by pixel coordinates is slow and re-reads the same
            elements every turn.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What the agent needs is a single click tool that accepts whichever
            grounding source actually saw the element on this turn, and
            converges on the same OS-level click underneath. That is what{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              click_element
            </code>{" "}
            is.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            The seven paths
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three click modes, five vision sources. The combinations the
            server actually accepts are: selector, AX-tree index, OCR index,
            Omniparser index, Gemini-vision index, DOM index, and raw
            coordinates. Seven, total. Every one of them goes through one
            function.
          </p>
          <BentoGrid cards={bentoCards} />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-4">
          <AnimatedBeam
            title="Five vision caches feed one click router"
            from={[
              { label: "UIA tree", sublabel: "uia_bounds" },
              { label: "Chromium DOM", sublabel: "dom_bounds" },
              { label: "Omniparser", sublabel: "omniparser_items" },
              { label: "Gemini Vision", sublabel: "vision_items" },
              { label: "OCR", sublabel: "ocr_bounds" },
            ]}
            hub={{ label: "click_element", sublabel: "server.rs:2486" }}
            to={[
              { label: "Selector", sublabel: "ClickMode::Selector" },
              { label: "Index", sublabel: "ClickMode::Index" },
              { label: "Coordinates", sublabel: "ClickMode::Coordinates" },
            ]}
            accentColor="#FB923C"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            The two enums that decide everything
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The dispatch logic is two short enums and one match. ClickMode
            decides which top-level argument set the agent sent. VisionType,
            for index mode, decides which cache to dereference. Both are
            declared in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              crates/terminator-mcp-agent/src/utils.rs
            </code>
            .
          </p>
          <AnimatedCodeBlock
            code={clickModeSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/utils.rs"
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That is the entire surface area for choosing a click path. The
            interesting part is what the index branch does once vision_type
            picks a cache.
          </p>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Five caches, one converging path
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each grounding source is a Mutex over a HashMap keyed by the
            1-based index the agent saw in the tree.{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              uia_bounds
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              ocr_bounds
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              omniparser_items
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              vision_items
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              dom_bounds
            </code>
            . The match below is the entire vision-type fork in click_element.
            Every arm computes the same shape: a label and a (x, y, w, h)
            tuple. Every arm hands off to the same desktop call.
          </p>
          <AnimatedCodeBlock
            code={dispatchSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            What the agent actually sees
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The whole router is invisible to the model unless we make it
            visible. Terminator does that by prefixing each tree line with
            the source that produced it: <code>#u</code> for UIA, <code>#d</code>{" "}
            for DOM, <code>#m</code> for Omniparser, <code>#v</code> for
            Gemini-vision, <code>#o</code> for OCR. The agent reads one tree
            and copies the prefix and the integer straight into the next
            click_element call.
          </p>
          <AnimatedCodeBlock
            code={treeSnippet}
            language="yaml"
            filename="agent input: get_window_tree result"
          />
        </div>

        <ProofBanner
          quote="The accessibility tree is the right input. It is also not the only input the agent will need."
          source="Terminator design notes"
          metric="7 paths"
        />

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            One agent step, two grounding sources
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The agent does not have to commit to a grounding source up front.
            It can try the cheapest path, fall through on failure, and finish
            the click. Same tool, different arguments.
          </p>
          <AnimatedCodeBlock
            code={agentCallSnippet}
            language="typescript"
            filename="agent step in TypeScript"
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <TerminalOutput
            title="server log: click_element fall-through, single agent turn"
            lines={fallthroughLines}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            What it looks like end to end
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One get_window_tree populates every cache. The agent then makes
            calls until the click lands. The bounds cache is shared across
            all clicks within the turn, so the second call hits a hot path.
          </p>
          <SequenceDiagram
            title="Agent fall-through across click_element grounding sources"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            How an agent should pick the source
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Stability ranks the order. AX selectors are the most stable
            because the OS itself classified the element. AX indices share
            that provenance. DOM indices are stable until the page navigates.
            Omniparser and Gemini-vision are stable for the screenshot they
            ran on. OCR is the least stable because text recognition jitters.
            Raw coordinates are the most fragile.
          </p>
          <HorizontalStepper
            title="The fall-through ladder, in order"
            steps={fallthroughSteps}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Why index beats raw coordinates for vision-grounded clicks
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A common shortcut for computer use agents is to skip indices and
            ask the model for absolute pixel coordinates from the screenshot
            directly. Terminator&apos;s bundled gemini_computer_use loop does
            this, because the Gemini Computer Use API was designed around it.
            That loop ships at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              crates/terminator-computer-use/src/lib.rs
            </code>{" "}
            and uses normalized 0-999 coordinates that get pushed through
            four sequential transforms (resize_scale, DPI, window x, window
            y) before hitting the OS. It works, but every click compounds
            error from four sources of float math.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Index-based vision sidesteps that. The detector ran on the
            screenshot at capture time and the server stored the resulting
            bounds in real screen-space coordinates. The agent passes an
            integer; the server picks up the bounds and calls click. There is
            no per-click math, no compounding error, no chance the model
            re-derives a slightly different coordinate next turn.
          </p>
          <ComparisonTable
            productName="Terminator click_element router"
            competitorName="Pure-AX or pure-vision agent"
            rows={comparisonRows}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            The numbers behind the router
          </h2>
          <MetricsRow metrics={metrics} />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlowCard>
              <div className="p-2">
                <p className="text-sm font-mono text-orange-600">
                  Caches per agent turn
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  <NumberTicker value={5} />
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  uia_bounds, dom_bounds, ocr_bounds, omniparser_items,
                  vision_items. Each populated by one get_window_tree call
                  with the matching include_* flag.
                </p>
              </div>
            </GlowCard>
            <GlowCard>
              <div className="p-2">
                <p className="text-sm font-mono text-orange-600">
                  Click paths exposed
                </p>
                <p className="mt-2 text-3xl font-bold text-zinc-900">
                  <NumberTicker value={7} />
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  ClickMode::Selector, ClickMode::Index x five VisionType
                  variants, ClickMode::Coordinates. All under one tool.
                </p>
              </div>
            </GlowCard>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Wiring it into your agent
          </h2>
          <AnimatedChecklist
            title="System prompt rules for the click_element router"
            items={checklistItems}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-10">
          <Marquee speed={32} pauseOnHover fade>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              role:Button &amp;&amp; name:Save
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              index: 88 (uitree)
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              index: 156 (omniparser)
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              index: 91 (ocr)
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              index: 240 (gemini)
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              index: 12 (dom)
            </span>
            <span className="text-xs font-mono px-3 py-1 mx-2 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              x: 664, y: 244
            </span>
          </Marquee>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            What this changes for an agent author
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            You stop having to commit, at agent-design time, to whether the
            model is &quot;an accessibility agent&quot; or &quot;a vision
            agent.&quot; The choice moves down to per-click. Your system
            prompt encodes the priority order, the model emits whichever
            shape best matches what it just saw, and the server resolves it.
            The same model can run a long workflow that crosses Outlook,
            Word, an internal Electron app, and a Chrome tab without
            changing tools.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The accessibility tree stays the default because it is the
            cheapest and most stable input. Vision sources stay available
            because the AX tree alone is not enough. The router is small
            enough to read in one sitting, which is the whole point: it is
            transparent to the agent and to the engineer wiring the agent.
          </p>
        </div>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Wiring a computer use agent against real desktop apps?"
          description="Book a 20-minute walkthrough of the click_element router and how to drop it into your existing agent loop."
        />

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Questions developers ask before wiring this in
          </h2>
          <FaqSection items={faqs} />
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-12 mb-16">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Related guides on the same agent stack."
            posts={relatedPosts}
          />
        </div>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Talk to the team about wiring click_element into your agent."
        />
      </article>
    </>
  );
}
