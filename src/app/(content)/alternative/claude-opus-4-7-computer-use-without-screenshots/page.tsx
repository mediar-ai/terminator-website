import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  HorizontalStepper,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/claude-opus-4-7-computer-use-without-screenshots";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-08";
const TITLE =
  "Claude Opus 4.7 computer use alternative: drive the desktop without sending a single screenshot";
const DESCRIPTION =
  "Anthropic's computer_20251124 tool is a screenshot loop. Opus 4.7 sees a base64 PNG, picks pixels, your code clicks, you screenshot again. Terminator's MCP server is a different contract: every action tool returns the changed UI elements as compact YAML lines in the same response, so Opus 4.7 reads what the click did without another screenshot. The diff is set with ui_diff_before_after: true and tree_output_format: 'compact_yaml'. Source: crates/terminator-mcp-agent/src/utils.rs lines 87 to 138.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Anthropic's beta computer use tool is a screenshot loop. Terminator's MCP server gives Opus 4.7 a tree-diff response shape: every action returns the changed elements as YAML, no screenshot in either direction.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Claude Opus 4.7 without screenshots: the tree-diff alternative to computer_20251124",
    description:
      "Set ui_diff_before_after: true on every Terminator MCP action tool. Opus 4.7 reads the YAML diff and decides the next action. The screenshot never crosses the wire.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Claude Opus 4.7 computer use alternative" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "Claude Opus 4.7 computer use alternative", url: PAGE_URL },
];

const screenshotToolResult = `// What you must return after every Anthropic computer_20251124 action.
// The tool result content includes a base64-encoded PNG screenshot.
// Opus 4.7 needs this image to know what changed; there is no other channel.
// Source: platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
//   "Encode screenshots as base64 PNG or JPEG"
//   "Screenshot images (see Vision pricing)"

{
  "role": "user",
  "content": [{
    "type": "tool_result",
    "tool_use_id": "toolu_01A09q90qw90lq917835lq9",
    "content": [{
      "type": "image",
      "source": {
        "type": "base64",
        "media_type": "image/png",
        "data": "iVBORw0KGgoAAAANSUhEUgAA...   // ~3.75MP at 2576px long edge
                  ...several hundred KB of base64 here...
                  ...truncated for sanity..."
      }
    }]
  }]
}

// Cost shape: image input billed via Anthropic vision pricing.
// Latency shape: PNG encode + upload + model re-decode every action.
// Failure shape: a tooltip moved one pixel; the next click misses;
//                you replay the loop from scratch.`;

const treeDiffToolResult = `// What Terminator's MCP server returns after click_element
// when you set ui_diff_before_after: true and
// tree_output_format: "compact_yaml" (the default).
// Source: crates/terminator-mcp-agent/src/tree_formatter.rs lines 56-180
//   format_tree_as_compact_yaml(tree, indent)

{
  "type": "tool_result",
  "content": [{
    "type": "text",
    "text": "{
      \\"action\\": \\"click\\",
      \\"status\\": \\"success\\",
      \\"has_ui_changes\\": true,
      \\"ui_diff\\": {
        \\"added\\": [
          \\"#1 [Window] Save As (focused, bounds: [800,400,600,420])\\",
          \\"  #2 [Edit] File name: (focusable, value: 'untitled.txt')\\",
          \\"  #3 [Button] Save (focusable)\\",
          \\"  #4 [Button] Cancel (focusable)\\"
        ],
        \\"removed\\": [
          \\"#7 [MenuItem] Save As...  (focused)\\"
        ]
      }
    }"
  }]
}

// Cost shape: a few hundred bytes of YAML, no image input.
// Latency shape: one MCP roundtrip; UIA tree diff is in microseconds.
// Failure shape: status=failed comes back with a typed error;
//                ui_diff still tells the model whether anything moved.`;

const giveUps = [
  {
    text: "If your target surface is fully custom-rendered, like a game or a Direct3D editor, the accessibility tree may not have it. You still want a screenshot fallback there.",
    checked: false,
  },
  {
    text: "Vision-based grounding (zoom, OCR, Omniparser, Gemini) is genuinely useful when an Electron app exposes a div soup with no role or name. Terminator's vision_type parameter routes there explicitly when needed; it is not the default.",
    checked: false,
  },
  {
    text: "If you want the model to interpret a chart, an image embed, or anything visual that is not a control, you have to send pixels. Tree diffs do not describe images.",
    checked: false,
  },
  {
    text: "What you do gain: every action returns a structured diff Opus 4.7 can reason about; image input becomes opt-in for the cases that genuinely need it; the same workflow runs the same way on a CI box and a developer laptop.",
    checked: true,
  },
];

const sequenceActors = ["Opus 4.7", "Your code", "MCP server", "OS UIA"];

const sequenceMessagesScreenshot = [
  { from: 0, to: 1, label: "tool_use: screenshot", type: "request" as const },
  { from: 1, to: 0, label: "tool_result: base64 PNG", type: "response" as const },
  { from: 0, to: 1, label: "tool_use: left_click [487, 341]", type: "request" as const },
  { from: 1, to: 0, label: "tool_result: ok (no state echo)", type: "response" as const },
  { from: 0, to: 1, label: "tool_use: screenshot", type: "request" as const },
  { from: 1, to: 0, label: "tool_result: base64 PNG", type: "response" as const },
];

const sequenceMessagesDiff = [
  {
    from: 0,
    to: 2,
    label: "tool_use: click_element { selector, ui_diff_before_after: true }",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "FindFirst(condition_tree)",
    type: "request" as const,
  },
  { from: 3, to: 2, label: "IUIAutomationElement", type: "response" as const },
  { from: 2, to: 3, label: "InvokePattern.Invoke()", type: "request" as const },
  { from: 3, to: 2, label: "ok", type: "response" as const },
  { from: 2, to: 0, label: "tool_result: { status, ui_diff: {added, removed} }", type: "response" as const },
];

const stepperSteps: StepperStep[] = [
  {
    title: "Install the MCP server",
    description: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"",
  },
  {
    title: "Get the tree once",
    description: "Call get_window_tree at task start. The model receives indexed YAML.",
  },
  {
    title: "Act with diff on",
    description: "Every action takes ui_diff_before_after: true. No more screenshots.",
  },
  {
    title: "Read the diff, repeat",
    description: "Opus 4.7 sees added/removed elements and picks the next tool.",
  },
];

const metrics = [
  { value: 2576, suffix: " px", label: "Opus 4.7 screenshot input ceiling on the long edge" },
  { value: 735, label: "input tokens per Anthropic computer_20251124 tool definition" },
  { value: 35, label: "typed MCP tools in terminator-mcp-agent server.rs" },
  { value: 0, label: "screenshots required when ui_diff_before_after is enabled" },
];

const faqs: FaqItem[] = [
  {
    q: "What is the alternative to Anthropic's computer use tool for Claude Opus 4.7?",
    a: "Terminator's MCP server, registered with one command: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Once registered, Opus 4.7 sees 35 typed tools (click_element, type_into_element, press_key, scroll_element, set_value, validate_element, wait_for_element, navigate_browser, capture_screenshot, execute_sequence, and others) instead of one schema-less computer tool. Each tool resolves a selector against the OS accessibility tree (Windows UIA today, macOS AX in the core but not yet on the published binary) and returns a structured JSON result. The crucial flag is ui_diff_before_after: true on every action tool, which makes the response include the changed elements as compact YAML lines. Opus 4.7 reads that and picks the next tool without ever sending a screenshot.",
  },
  {
    q: "How does Opus 4.7 know what happened on the screen if it never sees a screenshot?",
    a: "Through the diff response. Terminator captures the UI tree before the action runs, captures it again after, computes the diff, and returns it inline as compact YAML. The format is defined in crates/terminator-mcp-agent/src/tree_formatter.rs at format_tree_as_compact_yaml around line 56. A typical diff looks like 'added: #1 [Window] Save As (focused, bounds: [800,400,600,420])  #2 [Button] Save (focusable)' and 'removed: #7 [MenuItem] Save As... (focused)'. The model has the role, accessible name, focused state, bounds, and a stable index for every element that changed. That is enough information to decide the next click. The screenshot loop exists because the native computer tool has no other channel to report state; the MCP server has the tree, so it does not need pixels.",
  },
  {
    q: "Is this faster than the screenshot loop on Opus 4.7?",
    a: "Yes, by two mechanisms. First, image input drops out. Anthropic charges screenshots through standard vision pricing (per their computer use docs), and a 2576px long-edge image is roughly 3.75MP, which is a substantial input on every step. The MCP path returns a few hundred bytes of YAML instead. Second, the inner loop avoids round-trips. Each native computer use action requires the model to emit a click, your code to execute it, your code to take a fresh screenshot, and the screenshot to ride back to Anthropic. The MCP path runs the click-and-diff inside one tool result; UIA's IUIAutomationElement.FindFirst and InvokePattern.Invoke calls finish in microseconds. Opus 4.7's documented preference for fewer tool calls per turn at the default effort level lines up with this shape: the model thinks once, dispatches one tool, reads the diff, thinks again.",
  },
  {
    q: "Where does the index in the YAML diff come from, and can the model click by index?",
    a: "The compact YAML formatter assigns sequential indices (#1, #2, #3, ...) to every element with bounds, and stores a server-side cache of (index → role, name, bounds, selector) for the most recent tree. That is exactly what click_element's Index mode consumes. The model can call click_element with { \"index\": 5 } and Terminator looks up the cached element and clicks it. No coordinates emitted, no selector authored, no screenshot rendered. The Index mode is documented in server.rs at the click_element handler around line 2486 (Mode 2 - Index) and is what makes the tree-diff loop self-contained: the model gets indices on every diff, refers to them on the next call.",
  },
  {
    q: "When does the screenshot path still beat the tree-diff path?",
    a: "Three honest cases. One: fully custom-painted surfaces. Games rendered through Direct3D, Office canvases, terminal emulators with custom GPU compositors, and many CAD tools expose one opaque accessibility node for an entire surface. The tree has nothing useful; you need vision. Two: visual interpretation tasks. If the user asks 'is this chart trending up?' or 'is the photo upside down?' the model has to look at pixels. The tree carries no semantics about images. Three: web pages where the structural DOM is hostile (Cloudflare interstitials, single-page apps that route tooltips into a portal far from the visible parent). Terminator handles these by exposing capture_screenshot as one of the 35 MCP tools and by adding a vision_type parameter on click_element with values UiTree, Ocr, Omniparser, Gemini, and Dom. The right pattern is structural by default, vision by exception, with the agent making the choice per call.",
  },
  {
    q: "Does Anthropic's beta computer use tool work alongside Terminator's MCP server?",
    a: "Yes. They are not mutually exclusive: one is a built-in Anthropic tool, the other is an MCP server. You can register both. The pragmatic split is to give Opus 4.7 access to Terminator's selector-and-index tools as the primary surface, and keep computer_20251124 around for the cases the accessibility tree does not cover. Opus 4.7 picks per task. The cost shape changes accordingly: structural tools cost a few hundred input tokens per call; the computer tool's first invocation per session adds roughly 735 input tokens for the schema, plus vision pricing on every screenshot. If 90 percent of the work hits the tree, 90 percent of the cost moves off image input.",
  },
  {
    q: "What model versions of the computer tool does Opus 4.7 support, and which do I want?",
    a: "Opus 4.7 supports computer_20251124 (with beta header computer-use-2025-11-24). The newer schema introduces enable_zoom and a zoom action that takes a region [x1, y1, x2, y2] and returns that region at full resolution. Zoom is useful when you genuinely need pixels and want to keep input cost down. The older computer_20250124 still works with prior models but does not give Opus 4.7 anything it does not already get from the newer schema. If you choose the screenshot path, use computer_20251124. If you choose the MCP path, the version of computer_20251124 is irrelevant because you do not enable the tool.",
  },
  {
    q: "What about platforms? Does this work on macOS or only Windows?",
    a: "The MCP path is Windows-only on the published binary today. Terminator's core Rust crate has the cross-platform AccessibilityEngine trait at crates/terminator/src/platforms/mod.rs line 86 with macOS AX scaffolding, but the main branch ends with a compile_error! at lines 319-320 stating 'Terminator only supports Windows'. The npm package terminator-mcp-agent ships a Windows binary. If you need Opus 4.7 driving macOS desktops without screenshots today, this is not the right tool yet. If you need macOS with screenshots, you can still use the native Anthropic computer tool and pair it with a thin click-by-coordinate executor like cliclick. Linux uses AT-SPI2 in the Rust core but is similarly not packaged as an MCP binary.",
  },
  {
    q: "Why would the model trust an indexed list of elements more than a screenshot?",
    a: "It is not about trust, it is about what the model is good at. Pixels are a noisy substrate for clicks: tooltips reflow, scroll bars introduce subpixel offsets, DPI scaling and theme changes shift everything by a few pixels. The model has to ground every step from raw pixels each time. The accessibility tree is what the OS itself uses to route assistive technology; it has stable role names (Button, Edit, Window), localized accessible names that survive theme changes, and a fixed parent-child structure. A model handed '#3 [Button] Save (focusable)' has unambiguous targeting. A model handed a 2576x1620 PNG has to find the Save button through computer vision every single step. The first failure mode is brittle clicks. The second failure mode is none.",
  },
];

const articleSchemaJson = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude Opus 4.7 desktop automation: fewer tool calls, bigger workflows",
    excerpt:
      "What changed in Opus 4.7 for desktop work: 2576px input, 1:1 coordinates, fewer default tool calls. Why execute_sequence is the right shape for it.",
    href: "/t/claude-opus-4-7-desktop-automation",
    tag: "Guide",
  },
  {
    title: "Claude computer use: the pixel-coordinate loop, and the selector-based path",
    excerpt:
      "Anthropic's native computer tool, broken open. Side-by-side with Terminator's selector tools. server.rs source, no marketing.",
    href: "/t/claude-computer-use",
    tag: "Guide",
  },
  {
    title: "Accessibility API for computer use agents: the seven-mode click_element router",
    excerpt:
      "ClickMode (Selector, Index, Coordinates) plus VisionType (UiTree, Ocr, Omniparser, Gemini, Dom). One tool, seven grounding paths.",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Guide",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Alternative / Opus 4.7 computer use
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Claude Opus 4.7 computer use, without the screenshots
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            Anthropic's beta computer tool ships with one observation channel: a base64 PNG. Opus 4.7 looks at the screenshot, picks pixel coordinates, your code clicks, you screenshot again. The 2576px image input ceiling and 1:1 coordinate mapping make that loop smoother than it was on 4.6, but the loop is still pixels in, pixels out, pixels in, pixels out. There is a different contract that does not include the screenshot at all. It is what this page is about.
          </p>
        </header>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            Wire Opus 4.7 to Terminator&apos;s MCP server with{" "}
            <code className="rounded bg-white px-1 text-orange-700">
              claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
            </code>
            , then set{" "}
            <code className="rounded bg-white px-1 text-orange-700">ui_diff_before_after: true</code>{" "}
            and{" "}
            <code className="rounded bg-white px-1 text-orange-700">
              tree_output_format: &quot;compact_yaml&quot;
            </code>{" "}
            on every action tool. The server resolves selectors locally against the OS accessibility tree and returns the changed elements as YAML inside the same response Opus reads. No screenshot crosses the wire in either direction. The diff fields are defined in{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs"
            >
              crates/terminator-mcp-agent/src/utils.rs
            </a>{" "}
            at the{" "}
            <code className="rounded bg-white px-1 text-orange-700">DiffTreeOptions</code> struct.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Native computer tool reference:{" "}
            <a
              className="text-orange-600 underline"
              href="https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool"
            >
              platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
            </a>
            . Opus 4.7 release notes:{" "}
            <a
              className="text-orange-600 underline"
              href="https://www.anthropic.com/news/claude-opus-4-7"
            >
              anthropic.com/news/claude-opus-4-7
            </a>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Two contracts, one Opus 4.7
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shape of the bytes the model sees is what divides these two paths. Both let Opus 4.7 click a real button in a real app. They disagree on what comes back after the click. Toggle to see the literal JSON your code has to return as a tool result in each case.
          </p>
          <BeforeAfter
            title="Tool result for one click, two contracts"
            before={{
              label: "Anthropic computer_20251124",
              content: screenshotToolResult,
              highlights: [
                "every action requires a screenshot to know what changed",
                "image input billed via vision pricing on every step",
                "model has to re-ground from raw pixels, every turn",
              ],
            }}
            after={{
              label: "Terminator MCP, diff on",
              content: treeDiffToolResult,
              highlights: [
                "added/removed elements as YAML, indexed for the next call",
                "image input drops out; the model reads structured text",
                "next click can target #2 by index, no coordinates emitted",
              ],
            }}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">The round-trip, drawn</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three messages versus one. The native computer tool needs a screenshot before the click and a fresh screenshot after, because the tool result for left_click is just a confirmation; there is no state in it. The MCP path bundles act-and-observe into one tool call.
          </p>
          <SequenceDiagram
            title="Native computer_20251124: screenshot, act, screenshot"
            actors={["Opus 4.7", "Your code"]}
            messages={sequenceMessagesScreenshot}
          />
          <SequenceDiagram
            title="Terminator MCP click_element with ui_diff_before_after: true"
            actors={sequenceActors}
            messages={sequenceMessagesDiff}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What the diff actually carries
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The compact YAML format prefixes every element that has bounds with a sequential index, then writes the role, accessible name, and a small set of state flags in parentheses. The same indices are cached server-side for the next tool call, which is what enables the second mode of click_element: the model can refer to elements by index and never write coordinates. The format definition lives in{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/tree_formatter.rs"
            >
              crates/terminator-mcp-agent/src/tree_formatter.rs
            </a>{" "}
            at <code className="rounded bg-orange-50 px-1 text-orange-700">format_tree_as_compact_yaml</code>{" "}
            (line 56) and{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">format_node</code> (line 82).
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`# Excerpt of a real diff after pressing Ctrl+S in Notepad.
# This is what arrives in the tool_result content.
# Indices are stable across the response;
# the model uses them on the next click_element call.

added:
  - "#1 [Window] Save As                     bounds: [800,400,600,420] focused"
  - "  #2 [Edit] File name:                  value: 'untitled.txt'      focusable"
  - "  #3 [ComboBox] Save as type:           value: 'Text Documents'    focusable"
  - "  #4 [Button] Save                      bounds: [1200,780,80,32]   focusable"
  - "  #5 [Button] Cancel                    bounds: [1290,780,80,32]   focusable"
removed:
  - "#7 [MenuItem] Save As...                focused"
`}
          </pre>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Three things are happening in those few hundred bytes that a screenshot does not get for free. Element identity is anchored to role and accessible name, not pixel position. State (focused, focusable, value) is structured, not implied. And every entry has a stable index, so the model&apos;s next message can be{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              click_element({"{"} index: 4 {"}"})
            </code>{" "}
            and the server resolves it without further model thinking.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Numbers that matter</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four numbers worth holding in your head when you choose between these contracts on Opus 4.7. The first two are Anthropic&apos;s, sourced from the computer use docs. The second two are Terminator&apos;s, sourced from{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            .
          </p>
          <MetricsRow metrics={metrics} />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            735 input tokens per native tool definition is the Anthropic-published per-session overhead for adding the computer tool. That is small. The screenshot input on every action is what adds up; vision pricing on a 3.75MP base64 PNG, ten or twenty times per task, is where most of the bill goes. The MCP path replaces every one of those screenshot uploads with a few hundred bytes of YAML.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Wire it up</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four steps. The first three are once-per-environment; the fourth is the contract you give to Opus 4.7 in the system prompt or tool wrapper.
          </p>
          <HorizontalStepper title="Opus 4.7 with no screenshots, end to end" steps={stepperSteps} />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            On Claude Desktop, Cursor, VS Code, or Windsurf, the registration command is the same:{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
            </code>
            . The first call to{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">get_window_tree</code> for a process returns the indexed YAML and seeds the server-side index cache. Every subsequent action with{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">ui_diff_before_after: true</code>{" "}
            updates the cache and gives Opus 4.7 the next set of indices. The screenshot tool stays available as{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">capture_screenshot</code>, but the model has to choose to call it. By default it does not.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What you give up by removing screenshots
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest answer is: a few real things, on a small set of surfaces. The structural path is the right default for line-of-business apps, browsers, IDEs, and most native productivity tools. It is the wrong default for games and visual interpretation. The point is to make the screenshot opt-in instead of automatic.
          </p>
          <AnimatedChecklist
            title="Tradeoffs to know up front"
            items={giveUps}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why this fits Opus 4.7 specifically
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two of the changes Anthropic shipped with 4.7 push agents toward the tree-diff shape rather than the screenshot shape. Lower default tool-call frequency means Opus 4.7, left to its own taste, prefers to think more and act fewer times per turn. A screenshot loop that demands one model turn per click runs against that grain. A tool that returns a structured diff after each action lets the model think once, dispatch one tool, and read a meaningful response, which is the cadence Opus 4.7 already wants. The xhigh effort level Anthropic recommends for agentic work compounds this: deeper reasoning per step pays off when each step changes more state, which is exactly what an action plus a tree diff offers and what a single click does not.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Building an Opus 4.7 desktop agent and tired of the screenshot bill?"
          description="30 minutes. Walk through your agent loop, see if the tree-diff path fits, leave with a concrete next step."
        />

        <FaqSection heading="Questions about driving Opus 4.7 without screenshots" items={faqs} />

        <RelatedPostsGrid
          title="Adjacent reads"
          subtitle="Specific deep dives into the same stack"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Cut the screenshot bill on your Opus 4.7 agent. Book a call."
      />
    </article>
  );
}
