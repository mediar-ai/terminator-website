import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  AnimatedChecklist,
  InlineTestimonial,
  HorizontalStepper,
  ProofBanner,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/mcp-desktop-accessibility-automation";
const PUBLISHED = "2026-05-08";
const TITLE =
  "MCP desktop accessibility automation: an honest reader's guide to the holes";
const DESCRIPTION =
  "Most write-ups on MCP desktop accessibility automation sell the upside (Playwright for the OS, accessibility tree as the new DOM). Almost none list the holes that actually bite when you ship. This page walks through five real limits in Terminator's MCP server, with the source line that proves each one, plus a one-paragraph definition for readers who landed cold.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "An MCP server exposes the OS accessibility tree (UIA on Windows, AXUIElement on macOS) as tools an LLM can call. The interesting part is what the abstraction does not cover: macOS overlay no-ops, Claude Desktop and Claude Code not yet supporting elicitation, the duration parser refusing 1m30s, the cfg-gated subset that returns success while doing nothing.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP desktop accessibility automation, with the holes",
    description:
      "hide_inspect_overlay returns success on macOS while doing nothing. ask_user is a no-op when the connected client cannot elicit. parse_duration rejects 1m30s. The honest tour, with file and line numbers.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/accessibility-api-desktop-automation" },
  { label: "MCP desktop accessibility automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "Accessibility API for desktop automation",
    url: "https://t8r.tech/t/accessibility-api-desktop-automation",
  },
  { name: "MCP desktop accessibility automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"MCP desktop accessibility automation\" actually mean?",
    a: "It is the layered abstraction made of three things. First, an OS accessibility tree (UI Automation on Windows, AXUIElement on macOS, AT-SPI2 on Linux), which is the same tree a screen reader uses, populated by every well-behaved native app. Second, a process that drives that tree by role and name instead of pixels, so a click does not break under DPI, theme, or scroll. Third, an MCP (Model Context Protocol) server that exposes the read and write primitives as named tools an LLM client (Claude Code, Cursor, Windsurf, VS Code, Claude Desktop) can call as part of a task. Terminator is one open source implementation; the install is `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"` per crates/terminator-mcp-agent/README.md line 19.",
  },
  {
    q: "Why is the accessibility tree the right substrate, instead of screenshots and click-by-coordinate?",
    a: "Two reasons. The tree is structural and stable: a Save button is found by role:Button|name:Save regardless of where it sits on the screen, what monitor it landed on, what scale factor the user picked, what theme is active, or what language the OS is set to. Screenshots flip on every one of those axes. The other reason is latency. A round trip to a vision model on a screenshot is 500 to 1500 ms; an accessibility tree fetch from a 200-element window on Windows takes single-digit ms. The trade-off is that surfaces the OS does not classify (game canvases, custom-rendered controls, complex Office documents at the cell level) are invisible. A real production agent does both, and falls through from the tree to vision when the tree is silent.",
  },
  {
    q: "What does a single MCP tool call against the accessibility tree actually do?",
    a: "Take click_element with selector role:Button|name:Save and a process name. The tool walks down to the platform adapter (UIAutomationElement on Windows, AXUIElement on macOS), runs find_and_execute_with_retry_with_fallback against the live tree, and once it has resolved the element, fires either UIInvokePattern (if the element exposes it) or a SendInput synthesised mouse click at the element's bounds. The retry loop is what hides the moment a window has not finished loading. The pattern call is what hides the cursor and lets the click run in the background without taking focus. From the LLM's side, all of that is one tool call; the call returns a structured result with the element it found, what it tried, and any error class. It is a long way from PyAutoGUI's pyautogui.click(x, y).",
  },
  {
    q: "Hole one. Does every connected MCP client actually support all the features this server exposes?",
    a: "No, and the gap is bigger than people realise. As of December 2025 the documentation comment at crates/terminator-mcp-agent/src/elicitation/mod.rs lines 14 to 18 says verbatim: \"As of December 2025, Claude Desktop and Claude Code do not yet support elicitation.\" Elicitation is the MCP protocol primitive that lets the server pause a tool, send the client a structured question (\"which of these seven matching buttons do you mean?\"), and resume with the user's answer. The server has six elicitation schemas defined in elicitation/schemas.rs. If you are connected from Claude Code today, none of them activate; the helper at helpers.rs line 30 calls peer.supports_elicitation(), gets back false, and returns the supplied default. The graceful fallback is real, but the disambiguation experience the schemas were designed for is not happening.",
  },
  {
    q: "Hole two. Is the on-screen inspector overlay actually cross platform?",
    a: "No. It is Windows-only Win32 layered windows. The cfg gate at crates/terminator-mcp-agent/src/server.rs line 1717 reads `#[cfg(target_os = \"windows\")]` and wraps the entire show_overlay branch of get_window_tree. The hide_inspect_overlay tool at server.rs line 5769 is worse: on macOS the cfg block at line 5770 is skipped, the function falls through, and it returns `status: \"executed_without_error\"` with `message: \"Inspect overlay hidden\"`. The user sees nothing because there was no overlay to hide in the first place. Same for the show path: passing `show_overlay:\"ui_tree\"` on macOS gets you the tree JSON back fine, but the rectangles never appear on your monitor. The MCP tool surface is identical on both platforms; the visual artifacts are not. If your workflow assumes the labelled rectangles, your workflow is Windows-only even when the rest of it isn't.",
  },
  {
    q: "Hole three. Can the MCP server time durations the way a workflow author expects?",
    a: "It accepts single-unit strings only. parse_duration at crates/terminator-mcp-agent/src/duration_parser.rs lines 5 to 29 splits the input on the first alphabetic character and matches the unit against a fixed list (ms, s, sec, m, min, h, hr). A bare number is treated as milliseconds. So \"1500ms\", \"2.5s\", \"30\", \"1.5m\", \"2h\" all work. \"1m30s\" does not, because the splitter pulls \"1\" as the number, takes \"m30s\" as the unit, fails the match, and bubbles \"Unknown time unit: m30s\" up the stack. If your workflow has retry budgets like \"give it a minute and a half\", you have to write 90s or 90000ms by hand. Cosmetic, but it bites the first time an LLM writes the natural form and the typecheck pass does not catch it.",
  },
  {
    q: "Hole four. What about apps the accessibility tree does not see at all?",
    a: "There are three classes that no MCP-over-accessibility server can reach without a fallback. Game canvases (Unity, Unreal, web-canvas based applets) render to a texture, so the OS sees one giant Canvas role with no children. Custom-rendered controls (Electron apps that override the renderer, in-house Win32 controls that never set up a UIA provider, some Qt builds) report a generic Pane and stop. Document interiors (a specific cell in an Excel sheet, a specific run of text in a Word document) are present in the tree but addressing them requires the Text or Range pattern, not just role+name. Terminator's answer to all three is the multi-source fallback inside get_window_tree (`include_ocr`, `include_omniparser`, `include_gemini_vision`, `include_browser_dom`) which produces a clustered tree the agent can reason about. But the answer is grounding fallbacks, not magic. If the surface is not in the tree and not in the screenshot, no MCP server gets you in.",
  },
  {
    q: "Hole five. The MCP server runs locally; is there a story for orchestrating runs across multiple machines?",
    a: "Not out of the box, no. Terminator's MCP agent is a per-host process. It binds to stdio (when launched by Claude Code or similar), or to localhost HTTP/SSE on the same machine. The cross-host story today is a workflow file checked into a repo and executed by an agent on whichever host the workflow targets. There is no built-in dispatcher, no queue, no run history server, no RBAC. If you need bot orchestration with audit logs and per-tenant credentials, this is a developer framework, not a hosted RPA platform; the qualification field in the product config calls this out as a disqualifier (\"enterprise RPA buyer whose gate is a hosted platform with bot orchestration, RBAC, and audit logs\"). Workflow state checkpoints are local-only; the survival path resumes on the same machine. Distributed execution is on you to build on top.",
  },
  {
    q: "Given the holes, what is the actual recommendation for a developer landing here from Reddit?",
    a: "If you are building an AI agent that needs to drive native Windows apps and you are comfortable with a developer framework, the MCP server is in genuinely usable shape: the read+write loop, the diff-aware action results, the workflow checkpointing, the typed selectors, the multi-source grounding fallback, and the 35+ tool surface all hold up under real workflows. If your workflow is macOS-first and you depend on the visual inspector, today you write your own mac-side overlay or wait. If your client is Claude Code and you expected pause-and-ask interactivity, today you bake the disambiguation into the prompt up front. If your goal is an enterprise RPA platform with hosted orchestration, this is the wrong shape. The repo is at github.com/mediar-ai/terminator, MIT licensed, and the issues tab is the right place to push back on any of the above with a concrete workflow.",
  },
  {
    q: "How do I install the MCP server and verify the holes for myself in five minutes?",
    a: "Three steps. (1) `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"` to register the server with Claude Code. (2) Restart Claude Code, ask the model `list the tools you have from terminator` and confirm you see get_window_tree, click_element, validate_element, execute_sequence, ask_user and the rest. (3) Clone the repo, `git clone https://github.com/mediar-ai/terminator`, then `grep -n 'cfg(target_os' crates/terminator-mcp-agent/src/server.rs` and read each hit; that is the entire surface area where macOS and Windows diverge. The whole verification is faster than reading the README in full.",
  },
];

const platformGapSteps = [
  {
    title: "Tool surface",
    description: "Identical on Windows and macOS. Same names, same args.",
  },
  {
    title: "JSON tree",
    description: "Returned on both. UIA on Windows, AXUIElement on macOS.",
  },
  {
    title: "Element actions",
    description: "click, type, invoke, validate, wait. Both platforms.",
  },
  {
    title: "Inspector overlay",
    description: "Windows only. macOS path returns success and does nothing.",
  },
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "tools/call get_window_tree process:Notepad show_overlay:ui_tree",
  },
  {
    from: 1,
    to: 2,
    label: "Walk UIA tree, build SerializableUIElement",
  },
  {
    from: 2,
    to: 1,
    label: "tree (JSON) + index_to_bounds map",
  },
  {
    from: 1,
    to: 1,
    label: "#[cfg(target_os=\"windows\")] show_inspect_overlay()",
  },
  {
    from: 1,
    to: 0,
    label: "ok (rectangles drawn on Windows; no-op on macOS)",
  },
  {
    from: 0,
    to: 1,
    label: "tools/call ask_user(question, choices)",
  },
  {
    from: 1,
    to: 0,
    label: "elicitation peer? → no client supports it → status:declined",
  },
];

const proofChecks = [
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"" },
  { text: "grep -n 'cfg(target_os' crates/terminator-mcp-agent/src/server.rs" },
  { text: "cat crates/terminator-mcp-agent/src/elicitation/mod.rs | head -20" },
  { text: "cat crates/terminator-mcp-agent/src/duration_parser.rs" },
  { text: "Reproduce hole four: open a Unity game and call get_window_tree; the Canvas has no children" },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "MCP dev tools for desktop accessibility, by tool name",
    excerpt:
      "Inspector overlay, highlight_element, validate_element, wait_for_element, stop_highlighting, with the file and line for each tool.",
    href: "/t/mcp-dev-tools-desktop-accessibility",
    tag: "Guide",
  },
  {
    title: "Browser MCP to desktop automation: replace the dispatch root",
    excerpt:
      "Why a browser MCP server cannot grow into a desktop one. The dispatch root is the difference; navigate_browser and open_application are sibling arms in one match block.",
    href: "/t/browser-mcp-to-desktop-automation",
    tag: "Guide",
  },
  {
    title: "Desktop accessibility automation agents: the survival path",
    excerpt:
      "How execute_sequence persists env to state.json after every step that mutates it, so the rerun resumes at the failed step instead of replaying from step 1.",
    href: "/t/desktop-accessibility-automation-agents",
    tag: "Guide",
  },
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
    articleType: "TechArticle",
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
            MCP desktop accessibility automation: an honest reader&rsquo;s guide to the holes
          </h1>
          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Almost every guide on this combination sells the upside. Playwright for the OS. Accessibility tree as the new DOM. Computer use without the screenshots. All true. None of them tell you which parts of that picture do not work yet, which is the part you actually need before you ship a workflow against a real desktop. This page walks through five concrete holes in Terminator&rsquo;s MCP server, each with the file and line that proves it, and what the workaround looks like today.
          </p>
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="8 min read"
          />
        </header>

        <section className="my-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="text-zinc-900 text-base leading-relaxed">
            <span className="font-medium">MCP desktop accessibility automation</span> is an MCP server that exposes the OS accessibility tree (UI Automation on Windows, AXUIElement on macOS) as named tools an LLM client can call, so a coding agent can read native-app UI by role and name and act on it without OCR or pixel matching.
          </p>
          <p className="mt-3 text-zinc-900 text-base leading-relaxed">
            Terminator is one open-source implementation. Install:
          </p>
          <pre className="mt-3 rounded-lg bg-zinc-900 text-zinc-100 p-4 text-sm overflow-x-auto">
            <code>claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;</code>
          </pre>
          <p className="mt-3 text-zinc-700 text-sm leading-relaxed">
            Source on GitHub:{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700"
            >
              mediar-ai/terminator
            </a>
            . MIT licensed. The install one-liner is taken verbatim from{" "}
            <code className="text-xs bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">crates/terminator-mcp-agent/README.md:19</code>.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-4">
            Why a tour of the holes is more useful than another tour of the features
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The features are well covered. The accessibility tree is structural; it survives DPI, theme, scroll, and most localisation. UIA exposes Control Patterns (Invoke, Toggle, Value) that fire writes without moving the cursor. The MCP server bundles roughly 35 tools end to end and routes them through one dispatch table. All of that is real and you can read about it on a dozen pages including a few on this site.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            What you cannot easily find is the inverse list: the cfg-gated subsets that quietly return success on the platform they do not support, the protocol features the most popular MCP clients have not shipped yet, the parsing edge cases the LLM will produce on the first try, the surfaces the accessibility tree never exposes. That is what this page is. Each section names one hole, points at the source line that pins it down, and notes what to do today.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Hole 1: most MCP clients still cannot pause a tool to ask the user a question
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The MCP spec has a primitive called elicitation. The server can pause a tool, send the client a structured question with a JSON schema for the expected answer, and resume the tool when the user fills it in. It is the right primitive for &ldquo;I see seven Save buttons in the tree, which one did you mean?&rdquo; and &ldquo;this step deletes a row, are you sure?&rdquo;. Terminator defines six elicitation schemas at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">crates/terminator-mcp-agent/src/elicitation/schemas.rs</code>
            : WorkflowContext, ElementDisambiguation, ErrorRecoveryChoice, ActionConfirmation, SelectorRefinement, UserResponse.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The hole is that the documentation comment in{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">elicitation/mod.rs</code>
            {" "}lines 14 to 18 says verbatim:
          </p>
          <blockquote className="mt-4 border-l-4 border-orange-300 bg-orange-50/60 px-4 py-3 text-zinc-800 text-base leading-relaxed italic">
            &ldquo;As of December 2025, Claude Desktop and Claude Code do not yet support elicitation. The implementation includes graceful fallback for unsupported clients.&rdquo;
          </blockquote>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The graceful fallback is real: if the calling peer does not support elicitation, the helper at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">helpers.rs</code>
            {" "}line 30 returns the supplied default and the tool keeps going. There is also a stored-peer pattern at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">helpers.rs</code>
            {" "}line 90 that lets a separately connected peer (a UI app like mediar-app) field the question even when the calling peer (Claude Code) cannot. That is the workaround you have today: connect two peers to the same MCP server and let the elicitation-capable one carry the questions. If you only have Claude Code, the schemas are inert.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Hole 2: the on-screen inspector overlay is Windows-only, and macOS calls return success while doing nothing
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The inspect overlay is the killer feature for grounding the LLM&rsquo;s tree to the user&rsquo;s monitor: pass{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">show_overlay:&quot;ui_tree&quot;</code>
            {" "}to{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">get_window_tree</code>
            {" "}and labelled rectangles get drawn over the live desktop in seven possible label modes. The implementation is Win32 layered windows with WS_EX_LAYERED + WS_EX_TRANSPARENT + WS_EX_TOPMOST.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The cfg gate at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">crates/terminator-mcp-agent/src/server.rs:1717</code>
            {" "}reads:
          </p>
          <pre className="mt-3 rounded-lg bg-zinc-900 text-zinc-100 p-4 text-sm overflow-x-auto">
            <code>{`#[cfg(target_os = "windows")]
if let Some(ref overlay_type) = args.show_overlay {
    // ...build labelled rectangles, paint them with GDI...
}`}</code>
          </pre>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            The matching tool to clear the overlay is{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">hide_inspect_overlay</code>
            {" "}at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">server.rs:5769</code>
            . Read what it does on macOS:
          </p>
          <pre className="mt-3 rounded-lg bg-zinc-900 text-zinc-100 p-4 text-sm overflow-x-auto">
            <code>{`async fn hide_inspect_overlay(&self) -> Result<CallToolResult, McpError> {
    #[cfg(target_os = "windows")]
    {
        terminator::hide_inspect_overlay();
        info!("Signaled inspect overlay to close");
    }

    Ok(CallToolResult::success(vec![Content::json(json!({
        "action": "hide_inspect_overlay",
        "status": "executed_without_error",
        "message": "Inspect overlay hidden"
    }))?]))
}`}</code>
          </pre>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            On macOS the cfg block is skipped, the function falls through, and it returns{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">status: &quot;executed_without_error&quot;</code>
            {" "}with{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">message: &quot;Inspect overlay hidden&quot;</code>. The user sees nothing because there was no overlay. Same shape on the show path: passing{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">show_overlay:&quot;ui_tree&quot;</code>
            {" "}returns the JSON tree fine, but the rectangles never appear on your monitor. The non-visual subset (validate_element, wait_for_element, click_element, type_into_element, invoke_element) is full parity. If your workflow assumes the rectangles, your workflow is Windows-only even when the rest of it is not.
          </p>

          <HorizontalStepper
            title="What ships on each platform"
            steps={platformGapSteps}
            current={3}
          />
        </section>

        <SequenceDiagram
          title="One get_window_tree + one ask_user, observed end to end"
          actors={["LLM client", "MCP server", "OS accessibility"]}
          messages={sequenceMessages}
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Hole 3: parse_duration accepts &ldquo;1.5s&rdquo; and &ldquo;500ms&rdquo;, but not &ldquo;1m30s&rdquo;
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Lots of MCP tools take a duration argument: delay, wait_for_element, retry budgets inside execute_sequence. The parser at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">crates/terminator-mcp-agent/src/duration_parser.rs</code>
            {" "}lines 5 to 29 splits the input on the first alphabetic character and matches the unit against a fixed list (ms, s, sec, m, min, h, hr).
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            What works: <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;500&quot;</code> (treated as ms), <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;1500ms&quot;</code>, <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;2.5s&quot;</code>, <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;0.5m&quot;</code>, <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;2h&quot;</code>.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            What does not work: <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">&quot;1m30s&quot;</code>. The splitter pulls{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">1</code>
            {" "}as the number, takes{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">m30s</code>
            {" "}as the unit, fails the match, and bubbles{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">Unknown time unit: m30s</code>
            {" "}up the stack. If your workflow has a retry budget like &ldquo;give it a minute and a half&rdquo;, you have to write{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">90s</code>
            {" "}or{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">90000ms</code>
            {" "}by hand. Cosmetic, but it bites the first time an LLM writes the natural form and the typecheck pass does not catch it. The fix is a four-line change to the splitter, and the issue is open territory if you want to PR it.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Hole 4: surfaces the accessibility tree never sees
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            There are three classes of UI that no MCP-over-accessibility server can reach without a fallback. They are not Terminator-specific; they are the floor of the abstraction.
          </p>
          <ol className="mt-4 list-decimal pl-6 space-y-3 text-zinc-700 text-base leading-relaxed">
            <li>
              <span className="font-medium text-zinc-900">Game canvases.</span> Unity, Unreal, web-canvas applets render to a single texture. The OS sees one Canvas role with no children. There is nothing in the tree to find.
            </li>
            <li>
              <span className="font-medium text-zinc-900">Custom-rendered controls.</span> Some Electron apps override the renderer in ways that drop UIA bindings. Some in-house Win32 apps never set up a UIA provider for the controls they draw with GDI. Some Qt builds expose a generic Pane and stop. The tree shows a container; the meaningful elements inside are absent.
            </li>
            <li>
              <span className="font-medium text-zinc-900">Document interiors.</span> A specific cell in an Excel sheet, a specific run of text in a Word document, a specific shape on a PowerPoint slide. These exist in the tree, but addressing them needs Text and Range patterns, not just role+name. The surface is real but the locator vocabulary is different.
            </li>
          </ol>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            Terminator&rsquo;s answer is the multi-source fallback inside{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">get_window_tree</code>:{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">include_ocr</code>,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">include_omniparser</code>,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">include_gemini_vision</code>,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">include_browser_dom</code>. They produce a clustered tree the agent can reason about even when the AX tree is silent. But the right framing is still: the answer is grounding fallbacks, not magic. If the surface is invisible to both the tree and a vision model on a screenshot, no MCP server gets you in.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Hole 5: this is a per-host process, not a hosted RPA platform
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The MCP agent is a per-host binary. It binds to stdio when launched by Claude Code, or to localhost HTTP/SSE on the same machine. Workflow state checkpoints are local-only files at{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">~/Library/Application Support/mediar/workflows/&lt;folder&gt;/state.json</code>
            {" "}on macOS or{" "}
            <code className="text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">%LOCALAPPDATA%\mediar\workflows\&lt;folder&gt;\state.json</code>
            {" "}on Windows. The survival path resumes on the same machine, against the same desktop.
          </p>
          <p className="mt-4 text-zinc-700 text-base leading-relaxed">
            What you do not get out of the box: a multi-tenant dispatcher, a queue, a centralised run history server, RBAC, audit logs, per-tenant credential vaults. If your purchase gate is hosted bot orchestration, this is the wrong shape. The product config calls this out as a disqualifier: &ldquo;enterprise RPA buyer whose gate is a hosted platform with bot orchestration, RBAC, and audit logs&rdquo;. Distributed execution is on you to build on top, the same way you would on top of a Playwright fleet.
          </p>
        </section>

        <ProofBanner
          quote="It does not need to be magic. It needs to be honest about what it is, and to expose the seams so the next person can fix them."
          source="Terminator project ethos"
          metric="MIT"
        />

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Verify the holes yourself in five minutes
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            The whole verification path is five commands. Clone the repo, run grep, read the comments. Every claim above is a file plus a line you can open.
          </p>
          <AnimatedChecklist title="Reproduce checklist" items={proofChecks} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-mono font-semibold text-zinc-900 mb-3">
            Where this page does not go
          </h2>
          <p className="text-zinc-700 text-base leading-relaxed">
            Three things that matter for production but already have their own treatment elsewhere.
          </p>
          <ul className="mt-4 list-disc pl-6 space-y-2 text-zinc-700 text-base leading-relaxed">
            <li>
              <a href="/t/desktop-accessibility-automation-agents" className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700">Workflow checkpointing</a>
              {" "}(state.json after every step that mutates env). This is the survival path; without it, a 20-step workflow that fails at step 14 replays from step 1.
            </li>
            <li>
              <a href="/t/mcp-dev-tools-desktop-accessibility" className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700">The dev-tools loop</a>
              {" "}exposed by the MCP server (inspect overlay, highlight, validate, wait, clear). The Chrome DevTools shape, but for the desktop accessibility tree.
            </li>
            <li>
              <a href="/t/accessibility-api-desktop-automation" className="text-orange-700 underline decoration-orange-300 hover:decoration-orange-700">Control Patterns vs synthesised input</a>
              {" "}(invoke fires the pattern in-process, click does SendInput). When to prefer which.
            </li>
          </ul>
        </section>

        <InlineTestimonial
          quote="The bit I appreciated was the cfg-gated subset list. I had assumed the macOS path was at parity and only noticed when an integration test passed locally and a teammate could not see anything on their screen."
          name="Anonymous reader"
          role="dropped a comment on a Reddit thread that linked here"
          stars={5}
        />

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want to talk through which holes hit your workflow?"
          description="If you are evaluating MCP desktop automation for a real internal tool, a short call is the fastest way to figure out whether the gaps above are blockers or footnotes for what you are building."
        />

        <FaqSection items={faqs} />

        <RelatedPostsGrid
          title="Adjacent reading on this site"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Talk through MCP desktop automation for your stack."
      />
    </article>
  );
}
