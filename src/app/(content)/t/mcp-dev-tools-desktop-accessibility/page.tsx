import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  TerminalOutput,
  AnimatedChecklist,
  HorizontalStepper,
  ProofBanner,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/mcp-dev-tools-desktop-accessibility";
const PUBLISHED = "2026-05-07";
const TITLE =
  "MCP dev tools for desktop accessibility: the inspect/highlight/state loop, by tool name";
const DESCRIPTION =
  "Most guides on this topic describe the accessibility tree as a passive concept and stop. Terminator's MCP server actually ships the developer-tools loop your LLM needs to work against it: an on-screen inspector overlay drawn over the live desktop with seven label modes, a per-element highlighter, a state validator, a state-conditioned wait, and a clear. Here is each tool by name, with the source line and an example call.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "get_window_tree with show_overlay:\"ui_tree\" draws labeled rectangles directly on the desktop. highlight_element flashes any selector match. validate_element returns visible/enabled/focused. wait_for_element polls until the state holds. The full Chrome-DevTools-shaped loop, exposed as MCP tools.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "MCP dev tools for desktop accessibility, by tool name",
    description:
      "An on-screen inspector overlay, an element highlighter, a state validator, a conditioned wait, and a clear. Every tool in Terminator's MCP server, with file paths and line numbers.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/accessibility-api-desktop-automation" },
  { label: "MCP dev tools for desktop accessibility" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "Accessibility API for desktop automation",
    url: "https://t8r.tech/t/accessibility-api-desktop-automation",
  },
  { name: "MCP dev tools for desktop accessibility", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"MCP dev tools for desktop accessibility\" actually mean? I see those words but they could mean five things.",
    a: "It means the set of tools an MCP server exposes to a coding agent (Claude, Cursor, Windsurf, VS Code) so the agent can inspect, identify, and operate on the OS-level accessibility tree the way a frontend developer uses Chrome DevTools to inspect, identify, and operate on the DOM. Concretely, that is five primitives: read the tree (get_window_tree), draw labeled rectangles over every element on the actual screen (get_window_tree with show_overlay:\"ui_tree\"), highlight one specific match (highlight_element), check element state (validate_element, wait_for_element), and clear the overlay (stop_highlighting). The Terminator MCP server has all five as named tools in one dispatch table at crates/terminator-mcp-agent/src/server.rs near line 9953.",
  },
  {
    q: "Why does an LLM need an on-screen overlay if it has the tree as JSON?",
    a: "Two reasons. First, when get_window_tree returns 800 elements with similar role and name attributes, an agent that has only the JSON cannot tell which one a human user means by \"the Save button.\" Drawing rectangles labeled with [index] or [index:role:name] over the actual screen lets the agent ask the user to confirm by index, or pass an annotated screenshot back into a vision model to ground the reference. Second, when a workflow misclicks, the developer reading the run log wants to see what the agent saw at that step. The overlay is the visual artifact that closes the gap between the JSON tree and the pixels on the user's monitor. Implementation is at crates/terminator/src/platforms/windows/inspect_overlay.rs, show_inspect_overlay() at line 103 builds a layered Win32 window with WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST and paints rectangles plus labels with GDI Rectangle and DrawTextW.",
  },
  {
    q: "What are the seven label modes for the inspect overlay, and when do I use each one?",
    a: "They live in OverlayDisplayMode at crates/terminator/src/platforms/mod.rs lines 37-53. Rectangles draws the boxes only, no labels, useful when you just want to see the partition of the window. Index labels each rectangle with [N], the same N you can pass to nth: in a selector. Role labels each with the accessibility role (Button, Edit, Window, etc.). IndexRole combines the two as [N:Role] and is the default for inspector workflows. Name uses the accessible name, which is what a screen reader would read aloud; this is what to use when triaging localization issues. IndexName is [N:Name]. Full is [N:Role:Name] and is the densest label, useful when you are screenshotting the overlay to feed to a vision model. The mode is chosen by the overlay_display_mode argument on get_window_tree.",
  },
  {
    q: "How does this differ from the Inspect.exe tool that ships with the Windows SDK?",
    a: "Inspect.exe is a standalone GUI you launch with a mouse. It is fine for one-off debugging. The MCP overlay is the same idea but driven by tool calls from an LLM in your editor. You write \"show me the accessibility tree of Notepad with index labels,\" the agent calls get_window_tree with process:notepad and show_overlay:\"ui_tree\" and overlay_display_mode:\"index_role\", and the rectangles appear on your monitor in under a second. The same agent can then pick an index, call click_element with selector:nth:14 (or with the resolved role+name), and verify the result with validate_element. Inspect.exe cannot do that loop without a human at the keyboard. The selectors that the overlay surfaces are also the exact strings the rest of the MCP tool surface accepts: there is one grammar across read, inspect, click, type, and validate.",
  },
  {
    q: "Why is highlight_element separate from get_window_tree's overlay?",
    a: "The overlay shows every element. highlight_element shows one. Implementation at server.rs line 5600. After the agent has resolved a selector to a specific match, it calls highlight_element with that selector and an optional color (passed as a u32 ARGB at server.rs line 5640) and an optional text label that prints next to the rectangle. The default duration is 1000ms; a tokio::spawn at line 5717 schedules cleanup after that window so highlights do not leak. On Windows you can also pass font_size, font_bold, and font_color to control the label rendering (server.rs lines 5651-5658). This is the same affordance Chrome DevTools gives you when you hover an element in the Elements panel and a colored box flashes around it in the viewport.",
  },
  {
    q: "What is validate_element really doing under the hood?",
    a: "It runs find_and_execute_with_retry_with_fallback against the live accessibility tree (server.rs line 5477) with a no-op action, so the only outcome that matters is whether the selector resolved. It returns the matched element's attributes (role, name, AutomationId, bounds, process_id), the selector that won (selector_used), and every selector it tried (selectors_tried), with timestamps. If you also pass include_tree_after_action:true, it attaches the resulting subtree under the matched element, which is the cheapest way to walk into a control without re-issuing get_window_tree. This is the equivalent of opening the Elements panel and clicking on a node to see its computed properties, but as a single tool call.",
  },
  {
    q: "How is wait_for_element different from validate_element?",
    a: "validate_element resolves the selector once. wait_for_element polls the selector until a named state condition holds, with a timeout. The valid conditions are exists, visible, enabled, focused (server.rs line 5990). exists short-circuits to the standard locator wait at line 5838. The other three poll, because the property they are watching can change without the tree shape changing (a button can become enabled in place after a network call resolves). Use exists when you are blocked on a window appearing, visible when you are blocked on a popup that is not yet on screen, enabled when you are blocked on a Submit button that just turned interactable, and focused when you are scripting a text field that has to be the focused control before keystrokes will land in it.",
  },
  {
    q: "Where does stop_highlighting fit in the loop?",
    a: "It is the cleanup tool. After get_window_tree drew the overlay or highlight_element flashed a box, the visual artifacts persist by design (the InspectOverlayHandle::Drop impl at inspect_overlay.rs line 60 explicitly does not auto-close). stop_highlighting at server.rs line 7458 removes the active overlay window and drains the active highlight handles. Call it before the workflow ends, or at the start of the next inspection pass, otherwise the user is staring at the previous run's labels.",
  },
  {
    q: "Are these dev tools Windows-only? What works on macOS?",
    a: "The MCP tool surface is identical on both platforms: get_window_tree, validate_element, wait_for_element, highlight_element, stop_highlighting all dispatch to a desktop trait that has Windows and macOS implementations. The on-screen overlay (show_inspect_overlay) is currently Windows-only because it uses Win32 layered windows; the cfg gates are at server.rs line 1717 (#[cfg(target_os = \"windows\")]). On macOS get_window_tree still returns the JSON tree (read from AXUIElementCopyAttributeValue calls underneath), but the overlay is a no-op. highlight_element on macOS uses the AX-side highlight path. The non-visual subset (validate_element, wait_for_element) is full parity.",
  },
  {
    q: "How do I install this and try the inspector overlay myself in five minutes?",
    a: "Two commands. claude mcp add terminator 'npx -y terminator-mcp-agent@latest' to register the server with Claude Code (Cursor and VS Code take an equivalent MCP entry in their config). Then in a chat ask: \"open Notepad, run get_window_tree with show_overlay:'ui_tree' and overlay_display_mode:'index_role', then highlight the File menu, validate that it is enabled, and clear the overlay.\" The agent will issue open_application, get_window_tree, highlight_element, validate_element, stop_highlighting in that order, and you will see labeled rectangles appear over the Notepad window then disappear. The MCP server logs are written under ~/.terminator/logs by default; tail one to see the actual JSON each tool returned.",
  },
  {
    q: "Can I use these tools from a script instead of from an LLM?",
    a: "Yes. The same tool dispatch is reachable from the Rust crate (terminator-rs on crates.io) and the Node binding (@mediar-ai/terminator on npm) without going through MCP. The MCP server is a thin wrapper that exposes the dispatch_tool match block (server.rs line 9844) over JSON-RPC for LLMs; the underlying functions like Desktop::get_window_tree and Element::highlight are exported from the crate for direct use. So a CI script that wants to take an annotated screenshot of an app's accessibility tree before and after a change can call show_inspect_overlay directly, no LLM in the loop.",
  },
  {
    q: "How does this compare with browser MCP servers like Playwright MCP and Chrome DevTools MCP?",
    a: "Playwright MCP and Chrome DevTools MCP expose the same shape of tools (get tree, highlight, click, wait) but bound to a Page or browser context. Their inspector overlay is the browser's own inspect mode. The desktop accessibility equivalent of Playwright MCP is a server that binds tools to the OS accessibility tree and exposes the same primitives over the OS surface. Terminator is that server. The boundary matters when the workflow leaves the tab (a Save dialog, a desktop authenticator, an Excel paste, a native menu): a browser MCP cannot reach those, an OS-rooted MCP can, and the inspector overlay tool gives the agent the same visual grounding for native windows that Chrome DevTools gives it for the DOM. Source: github.com/mediar-ai/terminator.",
  },
];

const inspectorActors = [
  "LLM",
  "Terminator MCP",
  "Accessibility tree",
  "Screen overlay",
];

const inspectorMessages = [
  {
    from: 0,
    to: 1,
    label: 'get_window_tree(process:"notepad", show_overlay:"ui_tree")',
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "build tree (UIA on Windows / AX on macOS)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 3,
    label: 'show_inspect_overlay(elements, "index_role")',
    type: "event" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ tree, overlay_shown:'ui_tree' }",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: 'highlight_element(selector:"role:Button|name:Save", color:0xFF00FF00)',
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "flash colored border + label",
    type: "event" as const,
  },
  {
    from: 0,
    to: 1,
    label: 'validate_element(selector:"role:Button|name:Save")',
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ exists:true, visible:true, enabled:true }",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "stop_highlighting()",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "remove overlay window",
    type: "event" as const,
  },
];

const overlayLabelModes = [
  { text: "Rectangles — boxes only, no labels (use to see the layout partition of a window)" },
  { text: "Index — [N], the same N you pass to nth: in a selector" },
  { text: "Role — [Button], [Edit], [Window], etc." },
  { text: "IndexRole — [N:Role], the default for inspector workflows" },
  { text: "Name — the accessible name a screen reader would read (use for localization triage)" },
  { text: "IndexName — [N:Name]" },
  { text: "Full — [N:Role:Name], densest label, best for vision-model screenshots" },
];

const workflowSteps = [
  {
    title: "Read the tree",
    description: "get_window_tree returns the accessibility tree of one process as JSON.",
  },
  {
    title: "Show the overlay",
    description: "show_overlay:\"ui_tree\" draws labeled rectangles over every element on screen.",
  },
  {
    title: "Highlight one match",
    description: "highlight_element flashes a colored border around the resolved selector.",
  },
  {
    title: "Check state",
    description: "validate_element returns visible/enabled/focused; wait_for_element polls until the condition holds.",
  },
  {
    title: "Clear",
    description: "stop_highlighting removes the overlay and drains active highlights.",
  },
];

const inspectorSession = [
  {
    text: "$ claude mcp add terminator 'npx -y terminator-mcp-agent@latest'",
    type: "command" as const,
  },
  { text: "Added MCP server: terminator", type: "success" as const },
  { text: "$ claude", type: "command" as const },
  {
    text: "you> open Notepad and show the accessibility tree as an overlay with index_role labels",
    type: "info" as const,
  },
  {
    text: "claude> calling open_application(name=\"notepad\")",
    type: "output" as const,
  },
  {
    text: "claude> calling get_window_tree(process=\"notepad\", show_overlay=\"ui_tree\", overlay_display_mode=\"index_role\")",
    type: "output" as const,
  },
  {
    text: "{ overlay_shown: \"ui_tree\", tree: { role: \"Window\", name: \"Untitled - Notepad\", children: [...] } }",
    type: "success" as const,
  },
  {
    text: "you> highlight the File menu in green and validate it is enabled",
    type: "info" as const,
  },
  {
    text: "claude> calling highlight_element(selector=\"role:MenuItem|name:File\", color=0xFF00FF00, text=\"FILE\")",
    type: "output" as const,
  },
  {
    text: "claude> calling validate_element(selector=\"role:MenuItem|name:File\")",
    type: "output" as const,
  },
  {
    text: "{ exists: true, visible: true, enabled: true, bounds: [12, 26, 38, 22] }",
    type: "success" as const,
  },
  { text: "you> clear the overlay", type: "info" as const },
  { text: "claude> calling stop_highlighting()", type: "output" as const },
  { text: "{ status: \"executed_without_error\" }", type: "success" as const },
];

export default function Page() {
  const articleJsonLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqJsonLd = faqPageSchema(faqs);

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 mb-8">
          <h1 className="text-3xl sm:text-4xl font-mono font-semibold tracking-tight text-zinc-900 leading-tight">
            MCP dev tools for desktop accessibility: the inspect/highlight/state loop, by tool name
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Most guides on this topic describe the accessibility tree as a passive concept and stop. The interesting question is what dev tools an MCP server actually exposes against it: how an LLM in your editor can inspect a native window the way a frontend developer inspects a React app in Chrome DevTools. Terminator&apos;s MCP server ships that loop as five named tools. This is each one, with the source line and an example call.
          </p>
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="10 min read"
          />
        </header>

        <section className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-05-07)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            The Terminator MCP server (npx -y terminator-mcp-agent) exposes a Chrome-DevTools-shaped toolbox for the desktop accessibility tree:
          </p>
          <ul className="mt-3 space-y-1.5 text-zinc-900 text-base leading-relaxed">
            <li>
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">get_window_tree</code>
              {" "}returns the accessibility tree as JSON, and with{" "}
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">show_overlay:&quot;ui_tree&quot;</code>
              {" "}draws labeled rectangles directly on the user&apos;s screen for every element, with seven label modes.
            </li>
            <li>
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">highlight_element</code>
              {" "}flashes a colored border (and optional text label) around any selector match for a configurable duration.
            </li>
            <li>
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">validate_element</code>
              {" "}resolves a selector once and returns the matched element&apos;s attributes plus which selector won.
            </li>
            <li>
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">wait_for_element</code>
              {" "}polls a selector until a state condition (exists, visible, enabled, focused) holds.
            </li>
            <li>
              <code className="text-sm bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">stop_highlighting</code>
              {" "}removes the active overlay window and drains highlight handles.
            </li>
          </ul>
          <p className="mt-3 text-zinc-700 text-sm leading-relaxed">
            All five live in one Rust dispatch table at{" "}
            <code className="text-xs bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">crates/terminator-mcp-agent/src/server.rs</code>
            {" "}near line 9953. Source for the on-screen overlay:{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/inspect_overlay.rs"
              className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
            >
              crates/terminator/src/platforms/windows/inspect_overlay.rs
            </a>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Why a separate dev-tools loop, instead of just &quot;the tree&quot;
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Reading the accessibility tree is the easy part. Every desktop framework has had a way to do that since UI Automation shipped in Windows Vista. The hard part is what a frontend developer takes for granted in the browser: pointing at one specific node, watching its state change, asking the OS &quot;is this thing actually clickable right now,&quot; and then ungating the next step on the answer. That loop is what makes Chrome DevTools usable. Without it, the agent has to guess.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            An MCP server that only returns the tree puts the burden of that loop on the LLM, which is the slowest, most expensive component in the stack. An MCP server that exposes the loop as named tools lets the LLM pay one tool call per state transition, and lets the developer reading the run log see exactly what was visible to the agent at each step.
          </p>
        </section>

        <HorizontalStepper title="The five tools, in order of use" steps={workflowSteps} />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            1. get_window_tree, with show_overlay
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The entry point. Pass{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">process</code>
            {" "}to scope to one app, optionally{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">tree_max_depth</code>
            {" "}to bound traversal cost, and{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">show_overlay:&quot;ui_tree&quot;</code>
            {" "}to also draw the inspector overlay on screen. The overlay branch is gated to Windows at server.rs line 1717 and routes through{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">show_inspect_overlay()</code>
            {" "}in{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">crates/terminator/src/platforms/windows/inspect_overlay.rs</code>
            , which builds a layered Win32 window with{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">WS_EX_LAYERED | WS_EX_TRANSPARENT | WS_EX_TOPMOST</code>
            {" "}so it sits over the target app without intercepting clicks, then paints rectangles and labels with{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">Rectangle</code>
            {" "}and{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">DrawTextW</code>
            .
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            Pick the label style with{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">overlay_display_mode</code>
            . The seven values come from the{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">OverlayDisplayMode</code>
            {" "}enum at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">crates/terminator/src/platforms/mod.rs</code>
            {" "}lines 37 to 53.
          </p>
        </section>

        <AnimatedChecklist
          title="The seven OverlayDisplayMode values"
          items={overlayLabelModes}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            2. highlight_element, after the selector resolves
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Once the agent has a specific selector,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">highlight_element</code>
            {" "}(server.rs line 5600) flashes a colored border and an optional text label around it. The color is a u32 ARGB; the duration is milliseconds and defaults to 1000. A{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">tokio::spawn</code>
            {" "}at line 5717 schedules cleanup so highlights do not leak past their duration. On Windows the label rendering is configurable through{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">font_size</code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">font_bold</code>
            , and{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">font_color</code>
            {" "}(lines 5651 to 5658).
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The reason this is separate from the inspector overlay: the overlay shows every element so the agent can pick. The highlight shows one element so the agent (and a human watching the run) can confirm.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            3. validate_element, the one-shot state read
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">validate_element</code>
            {" "}runs the same selector resolution machinery as a click (server.rs line 5477), but with a no-op action: the only thing that matters is whether the element was found. It returns the resolved element&apos;s role, name, AutomationId, bounds, process_id, plus{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">selector_used</code>
            {" "}(which of your alternatives won) and{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">selectors_tried</code>
            {" "}(every selector it tested). Pass{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">include_tree_after_action:true</code>
            {" "}to get the resulting subtree without re-issuing get_window_tree.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            4. wait_for_element, the conditioned poll
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Different from validate_element because the property being watched can change without the tree shape changing: a Submit button can become enabled in place after a network call resolves, a Save dialog can become focused. The four valid conditions, parsed at server.rs line 5990, are{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">exists</code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">visible</code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">enabled</code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">focused</code>
            . The{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">exists</code>
            {" "}path short-circuits to the standard locator wait at line 5838; the other three poll the live tree until the condition holds or the timeout fires.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            This is the difference between an automation that hangs after a click and one that proceeds the moment the next control becomes interactive. Use{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">enabled</code>
            {" "}as the gate before a Submit click, and you stop racing the UI.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            5. stop_highlighting, the cleanup
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The overlay window and highlight rectangles persist by design: the{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">InspectOverlayHandle::Drop</code>
            {" "}impl at inspect_overlay.rs line 60 explicitly does not auto-close. This is because the language bindings (Python, Node) and the MCP server return a result and discard the handle; if Drop closed the window, the user would never see the labels.{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">stop_highlighting</code>
            {" "}(server.rs line 7458) is the explicit cleanup. Call it before the workflow ends, or at the start of the next inspection pass, otherwise you will be staring at the previous run&apos;s overlay.
          </p>
        </section>

        <section className="mt-12">
          <SequenceDiagram
            title="One full pass: open Notepad, inspect, highlight, validate, clear"
            actors={inspectorActors}
            messages={inspectorMessages}
          />
        </section>

        <ProofBanner
          quote="An MCP server for the OS accessibility tree, with the inspect/highlight/state loop a developer would actually use. Read it on GitHub."
          source="github.com/mediar-ai/terminator"
          metric="5 tools"
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            What it looks like in your editor
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed mb-4">
            From a Claude Code session against a fresh install. The first command registers the MCP server; the rest are tool calls the agent makes for you when you describe the inspection in English.
          </p>
          <TerminalOutput
            title="claude code session, mcp dev tools loop"
            lines={inspectorSession}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Cross-platform: Windows vs macOS today
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The MCP tool surface is identical across both platforms. Calls dispatch to a desktop trait that has Windows (UI Automation) and macOS (AX) implementations. The on-screen inspector overlay (show_inspect_overlay) is currently Windows-only because it uses Win32 layered windows; the cfg gates are at server.rs line 1717. On macOS, get_window_tree returns the JSON tree (read from{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">AXUIElementCopyAttributeValue</code>
            {" "}calls underneath), but the overlay is a no-op. highlight_element on macOS uses the AX-side highlight path. validate_element and wait_for_element are full parity.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            Most of our users build for Windows first because the line-of-business apps that resist browser-side automation are Windows-native. macOS support exists for cross-platform agents and for our own development on a Mac.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Why this matters more than another &quot;list of MCP tools&quot;
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The reason browser MCP servers (Playwright MCP, Chrome DevTools MCP) work is not that they expose ten tools. It is that the ten tools are shaped like a developer&apos;s actual workflow against the DOM: open a page, inspect, highlight a node, watch its state, act, verify. The same shape is missing from most desktop automation MCPs, which expose either &quot;take a screenshot and click x,y&quot; (the computer-use shape) or &quot;here is the tree, you figure it out&quot; (the raw-tree shape). Neither matches how a developer would debug a desktop app.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The inspect/highlight/state/wait/clear loop is the bridge. It is the smallest set of tools that lets an agent do what a human at Inspect.exe does: see the partition of the window, point at one specific node, check whether it is interactive, wait until it is, and clean up. Once you have that loop, the click and type tools that everyone has are usable. Without it, they are guesses.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Where to read the source
          </h2>
          <ul className="space-y-2 text-zinc-700 text-base leading-relaxed list-disc pl-6">
            <li>
              MCP dispatch table:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                crates/terminator-mcp-agent/src/server.rs
              </a>
              {" "}near line 9953.
            </li>
            <li>
              Inspect overlay implementation:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/inspect_overlay.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                crates/terminator/src/platforms/windows/inspect_overlay.rs
              </a>
              .
            </li>
            <li>
              OverlayDisplayMode enum:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/mod.rs"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                crates/terminator/src/platforms/mod.rs
              </a>
              {" "}lines 37 to 53.
            </li>
            <li>
              Repo home:{" "}
              <a
                href="https://github.com/mediar-ai/terminator"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                github.com/mediar-ai/terminator
              </a>
              .
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Related guides on this site
          </h2>
          <ul className="space-y-2 text-zinc-700 text-base leading-relaxed list-disc pl-6">
            <li>
              <a
                href="/t/browser-mcp-to-desktop-automation"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Browser MCP to desktop automation: replace the dispatch root, not extend it
              </a>
              {" "}— what changes when the MCP&apos;s dispatch root is the OS instead of a tab.
            </li>
            <li>
              <a
                href="/t/rpa-accessibility-tree-selectors"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                RPA accessibility tree selectors: the actual grammar
              </a>
              {" "}— the selector strings the inspector overlay surfaces, with operator precedence.
            </li>
            <li>
              <a
                href="/t/terminator-mcp"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Terminator MCP: the desktop automation server that type-checks your workflow before it ever clicks a pixel
              </a>
              {" "}— the typecheck_workflow tool that runs tsc --noEmit before execution.
            </li>
            <li>
              <a
                href="/t/accessibility-api-desktop-automation"
                className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
              >
                Accessibility API for desktop automation
              </a>
              {" "}— why structural lookup beats OCR and pixel matching.
            </li>
          </ul>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Need to wire this into your agent before next week?"
          description="Bring your specific desktop automation target. We will pair on the selector grammar, the inspector overlay loop, and the right MCP integration for your editor."
        />

        <FaqSection items={faqs} />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Pair with us on a desktop automation MCP integration."
        />
      </div>
    </article>
  );
}
