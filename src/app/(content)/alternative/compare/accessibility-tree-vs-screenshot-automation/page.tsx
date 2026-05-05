import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  BeforeAfter,
  HorizontalStepper,
  SequenceDiagram,
  CodeComparison,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/compare/accessibility-tree-vs-screenshot-automation";
const PUBLISHED = "2026-05-04";
const TITLE =
  "Accessibility tree vs screenshot desktop automation: it is a router, not a binary choice";
const DESCRIPTION =
  "Five grounding sources, one click_element handler. The VisionType enum at terminator-mcp-agent/src/utils.rs:1062 has exactly five variants: UiTree, Ocr, Omniparser, Gemini, Dom. The default at utils.rs:835 is UiTree. The match arm in server.rs:2609 to 2730 dispatches to all five. The honest framing is that the AX tree is the default and screenshot+vision is the labelled fallback for the surfaces that have no AX provider.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Production desktop agents do not pick between accessibility tree and screenshot. They route per call. Terminator's click_element exposes a vision_type parameter with five values and a default of ui_tree.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility tree vs screenshot desktop automation: it is a router",
    description:
      "VisionType has five variants (UiTree, Ocr, Omniparser, Gemini, Dom). UiTree is the default. Screenshot+vision is the fallback for surfaces with no AX provider.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Accessibility tree vs screenshot desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  {
    name: "Accessibility tree vs screenshot desktop automation",
    url: PAGE_URL,
  },
];

const faqs: FaqItem[] = [
  {
    q: "Which is faster, accessibility tree automation or screenshot-based automation?",
    a: "The accessibility tree is faster, and the gap is structural, not implementation-specific. An AX-tree click on Windows resolves to IUIAutomationElement.FindFirst followed by IUIAutomationInvokePattern.Invoke, two COM cross-process calls that complete in single-digit milliseconds. A screenshot click has to capture the framebuffer (xcap on Windows pulls roughly 8 MB of RGBA at 1920x1080), encode to PNG, base64 the bytes, post the payload to a vision backend (OmniParser, Gemini, or local OCR), wait for the model to return bounding boxes, scale the coordinates back into screen space, then send a synthetic mouse event. Terminator's llms.txt at line 243 puts the gap at 100x ('CPU speed, not LLM inference'). The dominant cost on the screenshot path is the network round-trip and model inference, not the screenshot itself.",
  },
  {
    q: "When should I actually use the screenshot path?",
    a: "When the target surface has no accessibility provider, or has one that lies. Three categories: full-screen DirectX or OpenGL games where the OS sees one HWND containing a frame buffer; canvas-rendered design surfaces (Figma's drawing area, Photopea, web-based 3D tools) where every tool's hit region lives inside one canvas element; legacy ActiveX or custom-painted line-of-business widgets that draw their own pixels and never registered a UIA provider. In all three the AX tree returns a single opaque element and the only addressable thing is pixel coordinates. Terminator's click_element exposes vision_type='omniparser' and vision_type='gemini' for exactly these cases. Everywhere else the tree is the right default.",
  },
  {
    q: "Can the same MCP tool do both grounding strategies in one call?",
    a: "Yes, that is the design. In Terminator's MCP server, click_element is one tool with three modes (selector, index, coordinates) and the index mode takes a vision_type parameter that selects which grounding source to dereference. The enum is declared at crates/terminator-mcp-agent/src/utils.rs line 1062 with five variants: UiTree (the default at utils.rs:835), Ocr, Omniparser, Gemini, and Dom. The dispatch lives in server.rs starting at line 2609 as one match arm. The caller picks the source per click. The same agent can use ui_tree on a sidebar button and gemini on a canvas in the next call without re-instantiating anything.",
  },
  {
    q: "Why is screenshot-based grounding still on the table if the tree is faster and more reliable?",
    a: "Three honest reasons. First, the AX tree on macOS Chrome and Safari silently no-ops on AXPress for many web views, so any production desktop engine carries a hardcoded browser bypass list that falls back to synthetic input. Second, vision models like Gemini 2.0 Flash and OmniParser see things the tree does not: a numeric label drawn inside a canvas, an icon with no accessible name, a tooltip that has not yet shown. Third, vendor-built apps occasionally ship with the UIA provider disabled (older Office variants, kiosk shells, locked-down line-of-business apps), and the only entry point is the pixel grid. Production frameworks treat screenshot as a tagged fallback, not the default; that is the difference between a router and a single-source agent.",
  },
  {
    q: "Does screenshot-based automation suffer from DPI or resolution changes?",
    a: "Yes, twice. First, the captured pixel coordinates of an element shift when the user changes DPI scaling: a button at (412, 300) on a 100% scale 1920x1080 monitor lands at (515, 375) when the same window is dragged to a 200% scale 4K display. Second, vision models trained on one resolution scale degrade when given screenshots at a different resolution. Terminator's omniparser path at server.rs:1141 to 1147 carries explicit DPI scaling (`x = window_x + (box_2d[0] * inv_scale / dpi_scale_w)`) to convert physical-pixel bounding boxes back to logical screen coordinates. The accessibility tree is DPI-invariant by design: the OS reports element bounds in logical units already, and selectors carry semantic identity (role, AutomationId, name) that survives DPI, theme, and resolution changes.",
  },
  {
    q: "Does the tree miss things the screenshot path catches?",
    a: "Yes, and the gap is well-defined. Custom controls that draw their own pixels and skip the UIA provider interface show up in the tree as a single opaque element with no children: many games, some terminal emulators, certain 3D modellers, and legacy ActiveX widgets fall in this bucket. Tooltips and hover states are inconsistently exposed; the tree may not see a callout that has not been activated. Custom-rendered icons inside a canvas have no accessible name, and even when the tree sees the canvas element, it cannot tell you that the third icon from the top is the trash button. Vision models can. The right design treats screenshot-and-vision as a labelled fallback, not the default. That is what vision_type=omniparser and vision_type=gemini exist for.",
  },
  {
    q: "How does Terminator decide which path to take if the caller does not pick one?",
    a: "The caller picks one. There is no automatic selection; vision_type defaults to UiTree at utils.rs line 835 (`self.vision_type.unwrap_or(VisionType::UiTree)`). If you call get_window_tree first, the response carries indexed entries from the AX tree and the natural follow-up is click_element with vision_type=ui_tree. If you call capture_screenshot followed by an OmniParser or Gemini parse, the response carries indexed entries from the vision pass and the follow-up is click_element with vision_type=omniparser or vision_type=gemini. The server keeps four separate index maps in memory (uia_bounds, ocr_bounds, omniparser_items, vision_items, dom_bounds) keyed by the tool that populated them, so the dispatch is unambiguous.",
  },
  {
    q: "Is screenshot-based desktop automation what Claude Computer Use does?",
    a: "Yes. The Anthropic Computer Use beta operates over screenshots: the model receives a screenshot, emits pyautogui-style click(x, y) and type(text) actions, and waits for the next screenshot. This is the binary you might be reading about as 'screenshot desktop automation'. Pixel grounding is general (it works on anything visible) but slow (every action pays inference latency) and DPI-sensitive (the model has to learn the current resolution). The accessibility tree is narrower in surface coverage but deterministic on what it sees and ~100x faster per action. The honest combination: route the bulk of clicks through the tree to keep cost and latency down; route the residual through vision to cover the tree's blind spots. Terminator's terminator-computer-use crate is exactly that combination wired up.",
  },
  {
    q: "What happens if I call vision_type=ui_tree without first calling get_window_tree?",
    a: "You get a typed error, not a silent miss. The match arm at server.rs:2610 looks up the index in self.uia_bounds and returns McpError::internal_error with the message 'UI tree index N not found. Call get_window_tree first.' if the lookup fails. The same shape holds for vision_type=ocr (looks up ocr_bounds), vision_type=omniparser (omniparser_items), vision_type=gemini (vision_items), and vision_type=dom (dom_bounds). Each vision type has its own index map populated by its own producer tool. The error tells you exactly which producer to call. That is part of why the router design beats a single-source agent: the failure mode is observable instead of 'we tried the tree, fell back to vision, and silently aimed at the wrong pixel'.",
  },
  {
    q: "Does this mean Terminator is doing screenshot automation when I use vision_type=gemini?",
    a: "It is doing screenshot grounding, then dispatching the click through synthetic input at the resolved coordinates. The screenshot path takes a window or monitor capture, base64-encodes it, posts it to https://app.mediar.ai/api/vision/parse with the Gemini prompt, receives normalized bounding boxes, scales them back into screen space, and finally calls click_at_coordinates_with_type. The mouse event itself uses the same SendInput synthetic-input path that PyAutoGUI uses; Terminator does not pretend to invoke a UIA pattern when there is none to invoke. The honesty is in the labelling: vision_type=gemini means 'I am asking Gemini to find the element for me and then clicking the pixels'. vision_type=ui_tree means 'I am asking UIA to find the element and invoking the pattern'. Two different operations, one tool surface.",
  },
];

const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const articleSchemaJson = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const sequenceActors = [
  "MCP client",
  "click_element",
  "Tree branch",
  "Vision branch",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "tools/call vision_type=ui_tree, index=5",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "lookup uia_bounds[5]",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "(role, name, bounds)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "UIInvokePattern.Invoke -> S_OK",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "tools/call vision_type=gemini, index=2",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "lookup vision_items[2]",
    type: "request" as const,
  },
  {
    from: 3,
    to: 1,
    label: "VisionElement{box_2d}",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "SendInput at scaled (x,y)",
    type: "event" as const,
  },
];

const beforeAfter = {
  title: "Two ways to frame the same question",
  before: {
    label: "The binary framing (wrong)",
    content:
      "Most articles treat 'accessibility tree vs screenshot' as a forced choice. Pick a side, take the tradeoffs, ship. The framing implies the agent commits to one grounding strategy at startup and lives with it. The reader walks away thinking they have to pick the tree (and lose canvas-rendered surfaces) or pick screenshots (and pay LLM inference on every click). Neither is what production desktop agents actually do.",
    highlights: [
      "implies one strategy per agent",
      "treats canvas/games and business apps as the same problem",
      "buries the cost of LLM inference in the comparison",
      "ignores DPI scaling math on the screenshot side",
    ],
  },
  after: {
    label: "The router framing (real)",
    content:
      "Terminator's click_element is one MCP tool with a vision_type parameter. The enum at crates/terminator-mcp-agent/src/utils.rs:1062 has exactly five variants: UiTree, Ocr, Omniparser, Gemini, Dom. The default is UiTree. The dispatch is one match arm at server.rs:2609 to 2730 and each branch reads from its own index map (uia_bounds, ocr_bounds, omniparser_items, vision_items, dom_bounds). The agent picks the source per call. The cheap, deterministic source is the default; vision is a labelled fallback for the surfaces that need it.",
    highlights: [
      "one tool, five grounding sources",
      "ui_tree default at utils.rs:835 keeps cost and latency down",
      "vision modes invoked explicitly when the tree returns nothing useful",
      "errors name the producer tool to call (typed misses, not silent ones)",
    ],
  },
};

const stepperSteps: StepperStep[] = [
  {
    title: "ui_tree (default)",
    description:
      "Walks UIAutomation on Windows, AXUIElement on macOS. No screenshot, no LLM in the action loop. The default at utils.rs:835.",
  },
  {
    title: "ocr",
    description:
      "Captures a screenshot, runs local OCR to find text bounds. Fastest screenshot path because no remote model call is involved.",
  },
  {
    title: "omniparser",
    description:
      "Captures a screenshot, posts to the OmniParser backend at app.mediar.ai/api/omniparser/parse for icon and structural element detection.",
  },
  {
    title: "gemini",
    description:
      "Captures a screenshot, posts to the Gemini Vision backend for general-purpose element grounding by description.",
  },
  {
    title: "dom",
    description:
      "Reads the live DOM via the Chrome extension. Browser-only path, used when the AX tree under-reports a webpage.",
  },
];

const visionModeChecklist = [
  {
    text: "ui_tree returns a typed error if the index is missing; you call get_window_tree first to populate uia_bounds.",
  },
  {
    text: "ocr is local-only; no network hop, but limited to text-shaped targets.",
  },
  {
    text: "omniparser detects icons and non-text elements; needs network to mediar.ai.",
  },
  {
    text: "gemini is the most general grounding; it can find 'the trash icon next to the third row' but pays full LLM latency.",
  },
  {
    text: "dom only works inside browsers; complementary to ui_tree on web pages, not a replacement for the tree elsewhere.",
  },
  {
    text: "All five modes share the same selector grammar at the index layer; the tool surface stays one click_element.",
  },
];

const visionTypeEnumCode = `// crates/terminator-mcp-agent/src/utils.rs:1062
#[derive(Debug, Clone, Copy, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum VisionType {
    Ocr,
    Omniparser,
    #[serde(alias = "ui_tree")]
    #[serde(alias = "uitree")]
    UiTree,
    #[serde(alias = "dom")]
    Dom,
    /// Gemini vision model elements
    #[serde(alias = "vision")]
    Gemini,
}

// utils.rs:833
/// Get vision type, defaulting to UiTree
pub fn get_vision_type(&self) -> VisionType {
    self.vision_type.unwrap_or(VisionType::UiTree)
}`;

const dispatchCode = `// crates/terminator-mcp-agent/src/server.rs:2609
let (item_label, bounds) = match vision_type {
    VisionType::UiTree => {
        // populated by get_window_tree
        let r = self.uia_bounds.lock()?.get(&index).cloned();
        // (role, name, bounds, selector)
    }
    VisionType::Ocr => {
        // populated by run_ocr on a screenshot
        let r = self.ocr_bounds.lock()?.get(&index).cloned();
    }
    VisionType::Omniparser => {
        // populated by parse_image_with_backend
        let r = self.omniparser_items.lock()?.get(&index).cloned();
    }
    VisionType::Gemini => {
        // populated by parse_image_with_gemini
        let r = self.vision_items.lock()?.get(&index).cloned();
    }
    VisionType::Dom => {
        // populated by Chrome extension DOM tree
        let r = self.dom_bounds.lock()?.get(&index).cloned();
    }
};

// the click is at the bounds the chosen producer recorded
let click_x = bounds.0 + bounds.2 / 2.0;
let click_y = bounds.1 + bounds.3 / 2.0;`;

const relatedPosts = [
  {
    title:
      "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "Companion deep-dive on the syscall layer. invoke() at element.rs:838 to 859 calls UIInvokePattern.Invoke directly. PyAutoGUI's click(x, y) always lowers to SendInput.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Patterns",
  },
  {
    title:
      "MCP servers vs accessibility APIs: they are different layers, not alternatives",
    excerpt:
      "MCP is transport. UIA and AX are the OS hooks. Terminator-rs holds the AccessibilityEngine trait. Terminator-mcp-agent has 35 #[tool(...)] handlers that all dispatch through it.",
    href: "/alternative/mcp-servers-vs-accessibility-apis",
    tag: "Architecture",
  },
  {
    title: "Accessibility API for computer use agents",
    excerpt:
      "Why a real desktop agent needs more than one grounding source. ClickMode + VisionType produces seven distinct click paths under one MCP tool.",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Agents",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchemaJson),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Accessibility tree vs screenshot desktop automation:{" "}
            <span className="text-orange-600">
              it is a router, not a binary choice
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            The framing presupposes the agent has to pick a side. Production
            desktop agents do not pick. Terminator&apos;s{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click_element
            </code>{" "}
            tool exposes one selector with a{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              vision_type
            </code>{" "}
            parameter that routes to five grounding sources: the accessibility
            tree (default), local OCR, OmniParser, Gemini Vision, and the
            browser DOM. The right reading of this comparison is which mode to
            pick per call, not which side to pick at startup.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ui_tree (default)
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ocr
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              omniparser
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              gemini
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              dom
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-04)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">
                For surfaces that expose an accessibility provider (the bulk of
                Windows and macOS business apps), the accessibility tree wins.
              </strong>{" "}
              It is deterministic, ~100x faster than the screenshot path, and
              survives DPI, theme, and resolution changes because selectors
              carry semantic identity instead of pixel coordinates.{" "}
              <strong className="text-zinc-900">
                Screenshot+vision wins for surfaces that have no usable AX
                tree:
              </strong>{" "}
              DirectX or OpenGL games, canvas-rendered design surfaces, and
              opaque legacy widgets that draw their own pixels. Production
              frameworks pick a router, not a side. Terminator&apos;s{" "}
              <code className="font-mono text-[0.92em] bg-white px-1.5 py-0.5 rounded border border-orange-200">
                VisionType
              </code>{" "}
              enum at{" "}
              <code className="font-mono text-[0.92em] bg-white px-1.5 py-0.5 rounded border border-orange-200">
                crates/terminator-mcp-agent/src/utils.rs:1062
              </code>{" "}
              has exactly five variants and defaults to UiTree.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Authoritative sources:{" "}
              <a
                href="https://github.com/mediar-ai/terminator"
                className="text-orange-700 underline underline-offset-2"
              >
                Terminator source
              </a>
              ,{" "}
              <a
                href="https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32"
                className="text-orange-700 underline underline-offset-2"
              >
                Microsoft UI Automation overview
              </a>
              , and the{" "}
              <a
                href="https://docs.anthropic.com/en/docs/agents-and-tools/computer-use"
                className="text-orange-700 underline underline-offset-2"
              >
                Anthropic Computer Use docs
              </a>{" "}
              for the screenshot-only baseline.
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The framing is the bug
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            &ldquo;Accessibility tree vs screenshot&rdquo; reads like a debate
            with two sides. It is not. It is a routing decision the caller
            makes per click. The clearest evidence sits in the source: one
            tool, five labelled grounding modes, one default. The mistake the
            binary framing makes is treating 1990s-era line-of-business apps
            and 2026-era canvas-rendered design tools as the same problem. The
            tree handles the first cleanly and the second poorly. Vision
            handles the second cleanly and the first wastefully. The router
            framing is what falls out when you stop pretending the surface is
            uniform.
          </p>
          <BeforeAfter
            title={beforeAfter.title}
            before={beforeAfter.before}
            after={beforeAfter.after}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What the router actually looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The five grounding modes share a tool name (
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              click_element
            </code>
            ), a click semantics layer (
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              left | double | right
            </code>
            ), and a result schema. They differ in what populates the index
            map the click reads from. Each producer is a different MCP tool
            and a different code path; the consumer (
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              click_element
            </code>
            ) is one match arm.
          </p>
          <HorizontalStepper title="Five vision_type values" steps={stepperSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The enum, the default, and the dispatch
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two short slices of source code make the design legible. The first
            is the enum and its default. The second is the match arm that
            converts the value into a bounds lookup. Together they explain why
            the router never has to guess: each grounding mode owns its own
            index map and the caller names which one to use.
          </p>
          <CodeComparison
            title="Where the modes are defined and dispatched"
            leftLabel="VisionType enum + default (utils.rs)"
            rightLabel="click_element match arm (server.rs)"
            leftCode={visionTypeEnumCode}
            rightCode={dispatchCode}
            leftLines={20}
            rightLines={28}
            reductionSuffix="lines per side"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            One tool, two paths through it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same tool call can resolve through the tree branch or the
            vision branch depending on which index map the caller is reading.
            The tree branch ends in a UIA pattern call inside the target
            process. The vision branch ends in synthetic input at coordinates
            the model returned. Both end in a result frame the MCP client gets
            back; the producer tool is what differs.
          </p>
          <SequenceDiagram
            title="Two clicks, one click_element"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            How the modes differ in practice
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The modes are not symmetric. ui_tree is cheap and structural;
            gemini is expensive and general. Picking the right one is a
            tradeoff between latency, surface coverage, and the kind of error
            you can recover from when the lookup misses. Reading the modes
            side by side is the working list when you sit down to write a
            workflow.
          </p>
          <AnimatedChecklist
            title="What each mode is honest about"
            items={visionModeChecklist}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            When screenshot still wins outright
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The router framing does not let the tree off the hook. There are
            real surfaces where the tree returns one opaque element and there
            is nothing more to ask it. A DirectX game window is one HWND with
            a frame buffer; the AX provider sees the window and nothing
            inside. A canvas-rendered design tool draws every layer into a
            single canvas element; the AX tree reports the canvas. A
            kiosk-mode line-of-business app sometimes ships with the UIA
            provider explicitly disabled, leaving SendInput at coordinates as
            the only way in. In all three the right vision_type is omniparser
            or gemini. The cost is real (one network round-trip plus model
            inference per click) but the alternative is an empty selector and
            a workflow that cannot make progress.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest framing in production looks like this: the tree covers
            roughly 95% of the clicks an agent makes against business apps,
            and screenshot+vision cleans up the residual 5%. The residual
            cannot be ignored, and it cannot be pushed onto a separate agent.
            It has to be available as a labelled fallback inside the same
            tool, with the same selector grammar at the index layer, so the
            agent can reach for it without context-switching. That is the
            shape Terminator&apos;s click_element is built around.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What this means for picking a framework
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two reads of the same comparison usually point at two different
            framework styles. Vision-only frameworks (the Anthropic Computer
            Use beta as the canonical example, plus several MCP wrappers
            around pyautogui and pillow) ground every action in a screenshot
            and an LLM. Cost is high per click; surface coverage is uniform.
            Tree-only frameworks (pywinauto, FlaUI, classic UIAutomation
            wrappers) ground every action in the AX tree. Cost is low per
            click; surface coverage drops on canvas-rendered and
            custom-painted apps. A router framework keeps the cost-low default
            and adds the labelled escape hatch.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If your agent will ever touch a canvas-rendered app or a game,
            tree-only is going to fail you and you will end up bolting on a
            screenshot path under pressure. If your agent only ever touches
            structured business apps, vision-only is paying full LLM
            inference for a click that should have been a 2 ms pattern call.
            Picking the router up front avoids both regrets.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Caveats worth naming
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A few things the binary framing tends to elide and the router
            framing has to handle explicitly. The accessibility tree on macOS
            Chrome and Safari silently no-ops on AXPress for many web views,
            so any production engine maintains a hardcoded browser bypass
            list and falls back to synthetic input. Vision models trained on
            one resolution scale degrade when given screenshots at a
            different scale; Terminator&apos;s omniparser path at server.rs
            lines 1141 to 1147 carries explicit DPI math to scale physical
            bounding boxes back to logical screen coordinates. Cross-platform
            coverage is uneven: terminator-rs declares the cross-platform
            trait at platforms/mod.rs:86 but main today ships Windows
            primarily, with macOS support at the core Rust level. None of
            these are deal-breakers; they are reasons the labelled-fallback
            design exists in the first place.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building an agent that has to clear both kinds of surface?"
          description="Talk through the routing model with us before you commit. Tree-default with a labelled vision fallback is what we have shipped; the calls walk through the tradeoffs on your real workload."
        />

        <section className="max-w-4xl mx-auto px-6 mt-14" id="faq">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Frequently asked
          </h2>
          <FaqSection items={faqs} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14 mb-20">
          <RelatedPostsGrid
            title="Adjacent reads"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Pick the right grounding mode for your agent's real workload."
      />
    </>
  );
}
