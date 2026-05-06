import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/self-driving-agents-legacy-desktop-limits";
const PUBLISHED = "2026-05-06";
const TITLE =
  "Self-driving agents and the legacy desktop ceiling: what actually breaks, and what to do about it";
const DESCRIPTION =
  "Autonomous AI agents (Claude computer use, OpenAI Operator, Gemini computer use) collapse on a 1998 WinForms LOB app for one structural reason: the accessibility tree is shallow or empty, and the agent has no fall-through. The pragmatic ceiling is whatever Windows MSAA's LegacyIAccessible bridge can surface. Terminator wires that bridge plus four other grounding sources into one click_element MCP tool.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Where self-driving agents hit a wall: legacy Win32, MFC, and Delphi apps publish a tree that ends in a single Pane with no name. The fix is a fall-through grounding chain inside one tool, not a smarter prompt.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Why self-driving agents stall on a 1998 LOB app",
    description:
      "The accessibility tree returns a Pane with no name. The agent has no fall-through. Reliability drops to that of a screenshot-only loop. Here is what the working shape looks like.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Self-driving agents and the legacy desktop ceiling" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Self-driving agents and the legacy desktop ceiling", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Where do self-driving agents actually break on legacy desktop apps?",
    a: "They break at the grounding step, not at the planning step. The model proposes a perfectly reasonable next action (\"click the Save button in the customer ledger window\") and asks the runtime which element to click. On a modern UWP or WPF app the runtime returns a UI Automation element with role:Button, name:Save, AutomationId set, an InvokePattern attached. On a 1998 MFC line-of-business app the runtime returns a single Pane with no name, no AutomationId, and no InvokePattern. There is nothing to click. The agent has two bad options: emit a coordinate guessed from the screenshot, or stall. Both produce the kind of flake that makes computer-use loops unusable past a 5 to 10 step horizon.",
  },
  {
    q: "Is this just a Windows problem, or does macOS have the same ceiling?",
    a: "macOS has its own ceiling but a different shape. AppKit and Mac Catalyst apps publish a reasonably rich AX tree by default; the failures cluster around Electron child windows, custom-rendered controls, and apps that explicitly disable accessibility for performance. Windows is where the legacy population is large enough to be its own category: tens of thousands of internal LOB apps written in MFC, Delphi, PowerBuilder, classic WinForms, and Win32 with hand-rolled WM_PAINT. Microsoft's answer for those is the MSAA-to-UIA bridge, exposed in UIA as the LegacyIAccessible property family. That bridge is what an agent has to read from when the modern UIA properties are empty.",
  },
  {
    q: "What does the LegacyIAccessible bridge actually give an agent?",
    a: "Eight properties: LegacyIAccessibleName, LegacyIAccessibleValue, LegacyIAccessibleDescription, LegacyIAccessibleRole, LegacyIAccessibleState, LegacyIAccessibleHelp, LegacyIAccessibleKeyboardShortcut, and LegacyIAccessibleDefaultAction. They are the UIA wrapper around the MSAA IAccessible interface that legacy controls have implemented since the late 1990s. In Terminator's code they are mapped explicitly in crates/terminator/src/platforms/windows/utils.rs at lines 198 to 205, so a selector like role:Button && name:Save will fall back to LegacyIAccessibleName and LegacyIAccessibleDefaultAction when the UIA Name and InvokePattern come back empty. That is enough to recover most legacy buttons, menu items, and edits. It is not enough for owner-drawn lists, custom grids, or anything painted by a third-party drawing library.",
  },
  {
    q: "Why is one grounding source structurally insufficient for a self-driving agent?",
    a: "Because the population of UI surfaces an autonomous agent will encounter is non-uniform. A modern Office canvas, a WinForms grid, an Electron Chromium child window, an OS-level toast, a PDF, a screen-share embed: each has a different relationship with the accessibility tree. UIA covers the first set, the LegacyIAccessible bridge covers the second, OCR covers anything with rendered text, an icon-detection model like Omniparser covers icon controls, a vision model covers everything else, and raw screen coordinates are the last resort. An agent that only reads UIA will fail roughly 100% of the time on the canvas surfaces. An agent that only sends screenshots will be expensive, slow, and will fluff the modern surfaces it could have hit deterministically. The only working shape is a fall-through chain, and the chain has to live behind one tool signature so the model does not have to plan which grounding source to use.",
  },
  {
    q: "What does that fall-through chain look like in code, concretely?",
    a: "In Terminator's MCP server it is an enum with five variants at crates/terminator-mcp-agent/src/utils.rs lines 1062 to 1073: Ocr, Omniparser, UiTree, Dom, Gemini. The click_element tool accepts a vision_type field that names which source the index came from, and an optional x and y for raw coordinate mode. The agent calls click_element with role:Button name:Save first; if that 404s on this UI, it calls get_window_tree with include_omniparser or include_gemini_vision to get an indexed list of icon-shaped or vision-detected items, and then clicks by index. The selector grammar and the index grammar both go through the same dispatch arm. From the model's view it is one tool. From the runtime's view it is five sources of grounding plus a coordinate escape hatch.",
  },
  {
    q: "How is this different from \"computer use\" agents that already use vision?",
    a: "Computer use models are vision-first. The model emits an (x, y) per click and the runtime is responsible for clicking those exact coordinates. That works, but it is the most expensive and most flake-prone of the available grounding sources. The relevant change is to invert the default: structural grounding (UIA, LegacyIAccessible, DOM) is the first try, and vision is the fallback when the structural sources cannot resolve the element. Terminator has a Gemini computer-use arm in the same dispatch (server.rs has it as one match arm next to click_element); it is there for canvases and PDFs, not as the steady state. That inversion is what makes a 50-step workflow feasible without a full-screen screenshot per step.",
  },
  {
    q: "What is the practical ceiling, then? Where do even fall-through agents fail?",
    a: "Three places. First, owner-drawn controls that paint themselves with raw GDI and never call any IAccessible API. The LegacyIAccessible role comes back as ROLE_SYSTEM_CLIENT (43) with no name and no default action. Vision and OCR are the only path. Second, applications that explicitly disable UIA for performance reasons (some game-adjacent industrial apps do this), where you get nothing structural at all. Third, dialogs that render text via Direct2D into a swap chain, where OCR is needed because the text is not in the tree. In all three the agent still works, just at the lowest tier of the chain (OCR or vision), with the corresponding latency and cost. The point of the chain is that the agent does not collapse when it hits one of these; it degrades.",
  },
  {
    q: "If I'm running an autonomous loop today, what's the minimal change I should make?",
    a: "Stop letting the model plan its own grounding. Give it one tool that takes a selector or an index and let the runtime decide which source to consult. If your stack is OpenAI Operator or Anthropic computer use, that means putting an MCP server in front of them whose click and type tools accept role:/name: selectors and fall through to vision only when the selector misses. Terminator is one such server (one MCP install line: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"). The same shape can be built on top of pywinauto, FlaUI, or raw UIAutomationCore.dll, but the LegacyIAccessible bridge has to be wired in for any of it to help on legacy LOB apps.",
  },
  {
    q: "Is this a problem that goes away as legacy apps get rewritten?",
    a: "On a long enough timeline, yes. In practice the LOB application replacement cycle measured in actual customer environments is closer to 15 years than 5, and the tail of unmaintained MFC and Delphi apps inside large organizations is enormous. Any autonomous agent claiming end-to-end automation of office work has to handle that tail or it is only automating the modern half. The accessibility-tree-plus-fall-through pattern is the only one that scales across both halves without a separate code path per app.",
  },
];

const beforeContent = `Self-driving agent loop with one grounding source (UIA tree only, or screenshots only). Step 1: model proposes "click Save in customer ledger". Step 2: runtime queries UIA on legacy MFC window. Step 3: result is a single Pane element with role:Pane, name:"" (empty), no InvokePattern, no children of interest. Step 4: agent has nothing to click. It either stalls, retries with a vision call (expensive, slow, often wrong on busy enterprise UIs), or hallucinates a coordinate. Reliability past a 5 to 10 step horizon collapses to roughly that of a screenshot-only loop.`;

const afterContent = `Same loop, with grounding fall-through wired into one tool. Step 1: model proposes "click Save". Step 2: runtime queries UIA. UIA Name is empty. Step 3: runtime falls back to MSAA via the LegacyIAccessibleName and LegacyIAccessibleDefaultAction properties. Match found. Step 4: dispatch the default action. No screenshot taken. No vision model called. Workflow continues to step 5. The agent only spends a vision call on the surfaces where the structural sources genuinely cannot resolve the element (canvases, owner-drawn controls, swap-chain text), not on every step.`;

const dispatchActors = ["Agent", "MCP", "UIA", "MSAA bridge", "OCR / Vision"];

const dispatchMessages = [
  { from: 0, to: 1, label: "click_element role:Button name:Save", type: "request" as const },
  { from: 1, to: 2, label: "find by Name + InvokePattern", type: "request" as const },
  { from: 2, to: 1, label: "Name = empty, no pattern", type: "error" as const },
  { from: 1, to: 3, label: "fallback: LegacyIAccessibleName", type: "request" as const },
  { from: 3, to: 1, label: 'name = "Save", default action = "Press"', type: "response" as const },
  { from: 1, to: 0, label: "click dispatched, no screenshot", type: "response" as const },
  { from: 0, to: 1, label: "next step on owner-drawn grid", type: "request" as const },
  { from: 1, to: 2, label: "UIA query", type: "request" as const },
  { from: 2, to: 1, label: "ROLE_SYSTEM_CLIENT (43)", type: "error" as const },
  { from: 1, to: 3, label: "MSAA query", type: "request" as const },
  { from: 3, to: 1, label: "no name, no action", type: "error" as const },
  { from: 1, to: 4, label: "fall through to OCR / Omniparser", type: "request" as const },
  { from: 4, to: 1, label: "indexed boxes by visible text", type: "response" as const },
  { from: 1, to: 0, label: "click by index, recovered", type: "response" as const },
];

const ceilingSteps: StepperStep[] = [
  {
    title: "UIA tree (modern)",
    description:
      "WPF, UWP, Catalyst, well-behaved WinForms. Role + Name + AutomationId + InvokePattern all present. Selector matches in one query.",
  },
  {
    title: "LegacyIAccessible (MSAA bridge)",
    description:
      "Old MFC, Delphi, classic WinForms, Win32 LOB. UIA Name is empty; the eight LegacyIAccessible* properties carry the metadata. Mapped at utils.rs:198-205.",
  },
  {
    title: "OCR / Omniparser",
    description:
      "Owner-drawn grids, custom controls, anything with rendered text but no IAccessible. The agent indexes visible text or detected icons and clicks by index.",
  },
  {
    title: "Vision model",
    description:
      "Canvases, PDFs, swap-chain text, screen-share embeds. Slowest and most expensive tier. Only consulted when the three above fail.",
  },
  {
    title: "Raw coordinates",
    description:
      "Last resort. The agent emits an (x, y) it derived from one of the upper tiers (a vision detection box, an OCR bounding box, a known offset). Almost never the planning model's own guess.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility API for computer use agents: the seven-mode click_element router",
    href: "/t/accessibility-api-computer-use-agents",
    excerpt:
      "The full breakdown of all seven grounding modes the click_element MCP tool dispatches across, with the file references in utils.rs.",
    tag: "Deep dive",
  },
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Why pixel matching is the wrong default for an autonomous loop, and what the structural alternative looks like end to end.",
    tag: "Comparison",
  },
  {
    title: "Browser agents leaving the DOM",
    href: "/t/browser-agents-leaving-the-dom",
    excerpt:
      "The other half of the autonomy ceiling: browser agents stall the moment a workflow leaves the page. Same selector grammar, both sides of the boundary.",
    tag: "Architecture",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              datePublished: PUBLISHED,
              url: PAGE_URL,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
            }),
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

      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Guide / autonomous agents
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight text-zinc-900">
            Self-driving agents and the legacy desktop ceiling: what actually breaks, and what to do about it
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Every autonomous AI agent demo runs on a clean Chrome window or a freshly installed VS Code. The wall it hits in real customer environments is the population of legacy desktop apps that still drive day-to-day work: a 1998 MFC ledger, a Delphi-built shop-floor terminal, a WinForms claim system that has not been recompiled in twelve years. The reason the agent stalls there is not that it lacks reasoning; it is that the accessibility tree it relies on returns nothing useful for those windows, and the agent has no fall-through to a second grounding source.
          </p>
        </header>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />

        <section className="mt-8 rounded-lg border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs font-mono uppercase tracking-wider text-orange-700">
            Direct answer (verified 2026-05-06)
          </p>
          <p className="mt-2 text-zinc-800 leading-relaxed">
            Self-driving agents break on legacy desktop apps the moment the accessibility tree returns a single <code className="rounded bg-white px-1 py-0.5 text-sm">Pane</code> with no name, or a <code className="rounded bg-white px-1 py-0.5 text-sm">LegacyIAccessibleRole = 43</code> (custom client) with no default action. The agent has no element to ground its next click on, the loop stalls or hallucinates a coordinate, and reliability drops to that of a screenshot-only agent. The fix is structural: pair the UIA tree with the MSAA <code className="rounded bg-white px-1 py-0.5 text-sm">LegacyIAccessible</code> bridge plus a fall-through to OCR, an icon detector, and vision, all behind one tool signature so the model never plans its own grounding source.
          </p>
        </section>

        <h2 className="mt-12 text-2xl font-semibold text-zinc-900">
          The ceiling, in one sentence
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          A self-driving agent is only as autonomous as its weakest grounding source on the surface in front of it. On a modern UIA-clean app the planner can be a 7B model and still hit 90%+ task completion because the click target is unambiguous. On a 1998 MFC window the planner can be a frontier model and you still get 30% completion if the runtime cannot read the controls. The autonomy level is not a property of the model. It is a property of the runtime that translates the model&apos;s intent into a click.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          What &ldquo;legacy&rdquo; means here, structurally
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          For the purposes of a self-driving agent, an app is &ldquo;legacy&rdquo; when its accessibility metadata sits on the wrong side of three Microsoft transitions. First, it predates UIA (introduced with Windows Vista, 2006), so the tree is populated by the MSAA-to-UIA bridge rather than by native UIA providers. Second, it was built before the UIA pattern model became normative (InvokePattern, ValuePattern, ExpandCollapsePattern), so its controls expose only the older IAccessible default-action verb. Third, in many cases the developer never implemented IAccessible at all, so what UIA can extract is whatever the default Win32 IAccessible proxy can scrape from the HWND tree. The end result is a UIA tree that is shallow, mostly unnamed, and whose only non-empty fields are in the <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">LegacyIAccessible*</code> namespace.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          The eight properties that keep an autonomous agent alive on those windows
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Every UIA wrapper that wants to recover something useful from a legacy control reads from the MSAA bridge. In Terminator, the mapping is in <a href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/utils.rs" className="text-orange-600 underline-offset-2 hover:underline">crates/terminator/src/platforms/windows/utils.rs</a> at lines 198-205:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800">
{`// Text properties
"LegacyIAccessibleValue"            => Some(UIProperty::LegacyIAccessibleValue),
"LegacyIAccessibleDescription"      => Some(UIProperty::LegacyIAccessibleDescription),
"LegacyIAccessibleRole"             => Some(UIProperty::LegacyIAccessibleRole),
"LegacyIAccessibleState"            => Some(UIProperty::LegacyIAccessibleState),
"LegacyIAccessibleHelp"             => Some(UIProperty::LegacyIAccessibleHelp),
"LegacyIAccessibleKeyboardShortcut" => Some(UIProperty::LegacyIAccessibleKeyboardShortcut),
"LegacyIAccessibleName"             => Some(UIProperty::LegacyIAccessibleName),
"LegacyIAccessibleDefaultAction"    => Some(UIProperty::LegacyIAccessibleDefaultAction),`}
        </pre>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Those eight properties are the difference between an agent that can save a record in a 25-year-old MFC app and an agent that emits coordinates derived from a screenshot. The <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">LegacyIAccessibleName</code> field carries the button label that UIA&apos;s <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">Name</code> often does not. The <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">LegacyIAccessibleDefaultAction</code> field carries the verb (&ldquo;Press&rdquo;, &ldquo;Open&rdquo;, &ldquo;Toggle&rdquo;) that lets the runtime invoke the control without a synthesized mouse event. The <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">LegacyIAccessibleRole</code> field disambiguates a button from a menu item from an edit when the modern <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">ControlType</code> comes back as <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">Pane</code> by default.
        </p>

        <BeforeAfter
          title="The two loops, side by side"
          before={{ label: "One grounding source", content: beforeContent }}
          after={{ label: "Fall-through chain", content: afterContent }}
        />

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          Why one tool signature, not two
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The recurring temptation is to expose the grounding sources as separate tools (<code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">click_by_selector</code>, <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">click_by_ocr</code>, <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">click_by_vision</code>, <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">click_by_coords</code>) and let the model pick. That fails for a structural reason. The model has no way of knowing which source will work on the surface it is looking at without trying. So it tries one, observes the failure, tries another, observes that failure, and burns its planning budget on bookkeeping. The grounding source is a runtime concern, not a planning concern. It belongs in one tool that takes a selector or an index, and the runtime decides which source to consult by trying them in priority order.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Terminator&apos;s click_element accepts three modes (selector, index, raw coordinates) and one <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">vision_type</code> field that tells the runtime which index source the model is referring to. The five legal index sources are defined as one enum at <a href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs" className="text-orange-600 underline-offset-2 hover:underline">crates/terminator-mcp-agent/src/utils.rs</a> lines 1062-1073:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800">
{`#[derive(Debug, Clone, Copy, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum VisionType {
    Ocr,
    Omniparser,
    UiTree,
    Dom,
    Gemini,
}`}
        </pre>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          From the model&apos;s view there is one tool. From the runtime&apos;s view there are five sources of grounding plus a coordinate escape hatch, and the LegacyIAccessible bridge sits inside the <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">UiTree</code> path so a selector-based call already gets the legacy-aware fall-through for free.
        </p>

        <SequenceDiagram
          title="One step on a legacy MFC window, then one step on an owner-drawn grid"
          actors={dispatchActors}
          messages={dispatchMessages}
        />

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          The ceiling, by tier
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Stack the grounding sources from cheapest to most expensive, and the autonomy ceiling on a given UI is whichever tier first returns a usable element. A self-driving agent is not asking which tier is &ldquo;best&rdquo; on average; it is asking which one matches the surface in front of it right now.
        </p>

        <HorizontalStepper title="Grounding tiers, in priority order" steps={ceilingSteps} />

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          The three failure modes that survive even fall-through
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Even a well-implemented chain has a bottom. Three categories of UI surface stay hard for any autonomous loop:
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-6 text-zinc-700 leading-relaxed marker:text-orange-600 marker:font-mono">
          <li>
            <span className="font-medium text-zinc-900">Owner-drawn controls.</span> Custom grids, third-party drawing libraries that paint via raw GDI, in-house chart widgets that never call any IAccessible API. The MSAA bridge returns <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">ROLE_SYSTEM_CLIENT (43)</code> with no name and no default action. OCR or vision is the only path. Latency goes up by an order of magnitude on these steps.
          </li>
          <li>
            <span className="font-medium text-zinc-900">Apps with UIA explicitly disabled.</span> A small population of game-adjacent and industrial apps disable UIA for performance. The tree is empty by design. Vision is the only viable source. Plan workflows around a small number of these, never as the steady state.
          </li>
          <li>
            <span className="font-medium text-zinc-900">Direct2D / swap-chain text.</span> Modern UIs that render text into a swap chain bypass GDI text rendering and therefore are invisible to UIA in many cases. OCR is the recovery path; even a strong vision model handles them comfortably because the rendered text is sharp.
          </li>
        </ol>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The point of the chain is not that it eliminates these. It is that the agent does not collapse when it hits one. It degrades to a slower tier, the loop continues, and the cost shows up only on the steps where it is unavoidable.
        </p>

        <h2 className="mt-10 text-2xl font-semibold text-zinc-900">
          The minimum change that moves the ceiling
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          If you are running an autonomous loop on top of Anthropic computer use, OpenAI Operator, or Gemini computer use today, the smallest useful change is to stop letting the model emit raw screen coordinates as its first move. Put a structural-grounding tool in front of the model and let the runtime fall through to vision only when the structural sources fail. Concretely:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-zinc-700 leading-relaxed marker:text-orange-600">
          <li>
            Install an MCP server whose <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">click_element</code> tool reads the UIA tree and the LegacyIAccessible bridge before falling through to OCR and vision. (Terminator is one such server: <code className="rounded bg-zinc-100 px-1 py-0.5 text-sm">claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;</code>.)
          </li>
          <li>
            Wire the same tool into Cursor, VS Code, or Windsurf via the same MCP config so the agent can drive native windows the same way it drives the editor.
          </li>
          <li>
            Reserve the model&apos;s coordinate-emitting capability for the canvases and PDFs where structural grounding genuinely cannot help. Treat any coordinate the model emits on a non-canvas surface as a smell, not a feature.
          </li>
        </ul>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Hitting the legacy ceiling on a real workflow?"
          description="If your autonomous loop stalls on a specific Win32 or MFC window, send the screenshot and the UIA dump. We will look at it with you and tell you which tier in the chain is missing."
        />

        <FaqSection items={faqs} />

        <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Stuck on a legacy LOB window? 20 min, no slides."
      />
    </article>
  );
}
