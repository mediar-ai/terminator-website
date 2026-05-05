import type { Metadata } from "next";
import {
  Breadcrumbs,
  ProofBanner,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  HorizontalStepper,
  AnimatedChecklist,
  CodeComparison,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/mcp-servers-vs-accessibility-apis";
const PUBLISHED = "2026-05-04";
const TITLE =
  "MCP servers vs accessibility APIs: they are different layers, not alternatives";
const DESCRIPTION =
  "MCP is the protocol your AI agent speaks. Accessibility APIs (UIA on Windows, AXUIElement on macOS) are the OS hooks that report real UI elements. The framing 'MCP servers vs accessibility APIs' buries the actual question: does the MCP server you are picking actually wrap a real accessibility engine? Terminator splits the two cleanly. terminator-rs declares pub trait AccessibilityEngine at crates/terminator/src/platforms/mod.rs:86. terminator-mcp-agent has 35 #[tool(...)] handlers in server.rs that all dispatch through it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "MCP and accessibility APIs are stacked, not opposed. The honest comparison is whether the MCP server wraps a real accessibility engine or fakes it with screenshots. Terminator's two-crate split makes the boundary literal.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "MCP servers vs accessibility APIs: they are stacked, not opposed",
    description:
      "MCP is transport. UIA and AX are the OS hooks. Terminator-rs holds the AccessibilityEngine trait. Terminator-mcp-agent is 35 tools that dispatch through it.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "MCP servers vs accessibility APIs" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "MCP servers vs accessibility APIs", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Are MCP servers a replacement for accessibility APIs?",
    a: "No. They sit at different layers and answer different questions. MCP (Model Context Protocol) is a transport spec from Anthropic that defines how an AI client (Claude Desktop, Cursor, VS Code, Claude Code, Windsurf) discovers and calls tools exposed by a server, with a typed JSON schema for arguments and results. Accessibility APIs are OS interfaces (UI Automation on Windows, AXUIElement on macOS, AT-SPI on Linux) that report on the live UI tree of running applications and let you act on elements (invoke, set value, expand, focus). An MCP server with no accessibility engine underneath is a JSON-RPC harness with nothing real to call. An accessibility engine with no MCP server is a normal SDK; you import it from Python or Rust and call methods on it. The useful product is the stack: an MCP server whose tools are thin handlers over a real accessibility engine.",
  },
  {
    q: "What does an MCP server contribute that the accessibility API alone does not?",
    a: "Three things, all on the agent side, none of them about the desktop. First, discovery: MCP defines tools/list and tools/call so an LLM client can enumerate what the server exposes without hardcoding. Second, schema: each tool ships a JSON schema that the client uses to constrain the LLM's tool calls and reject malformed arguments before they touch the desktop. Third, transport: MCP runs over stdio, SSE, or streamable HTTP, so the same server can be embedded next to Claude Desktop or sit behind an authenticated HTTP endpoint. None of this is desktop functionality. It is the interop layer that lets an LLM, running anywhere, call into your accessibility engine without bespoke glue.",
  },
  {
    q: "What does an accessibility API contribute that MCP alone does not?",
    a: "Everything that actually moves bits in another process. UIA on Windows resolves an IUIAutomationElement for a button, asks for its IUIAutomationInvokePattern, and calls Invoke. The call crosses into the target process via COM and runs the button's default action. AXUIElement on macOS does the same shape with AXUIElementCopyAttributeValue and AXUIElementPerformAction. These are the calls that talk to running apps. MCP cannot do any of it on its own; the protocol does not know what a Notepad save button is. The accessibility API is what makes the click real. The MCP server's job is to turn 'click_element with selector role:Button|name:Save in process notepad' into the right sequence of UIA calls and report back what happened.",
  },
  {
    q: "How can I tell whether an MCP server is actually using accessibility APIs or is just pasting screenshots?",
    a: "Read the source if it is open. Look for direct imports of the OS automation library: uiautomation, pywinauto, FlaUI, or the raw Win32 UIAutomationCore on Windows; AppKit AXUIElement, ApplicationServices.framework AXUIElementCopyAttributeValue, or atomacos on macOS. If the only imports are pyautogui, pillow, opencv, or a vision model client, the server is doing screen-and-pixel automation and the MCP wrapper is an illusion of structure on top. Run the server and inspect a tools/list response: a real accessibility-backed server exposes tools shaped like get_window_tree, click_element with a selector grammar, set_value, expand_collapse. A vision-only server's tools tend to be take_screenshot, click_at, type_text, and the LLM has to reason about coordinates from raw image bytes.",
  },
  {
    q: "Why does Terminator split the engine and the MCP server into two separate Rust crates?",
    a: "Because they answer different questions and have different release cycles. The terminator-rs crate (publish name on crates.io) holds the platform code: the AccessibilityEngine trait at crates/terminator/src/platforms/mod.rs line 86, the Windows implementation under crates/terminator/src/platforms/windows that wires uiautomation-rs, the locator grammar in selector.rs, and the synthetic input fallback in input.rs. It can be used as a normal Rust SDK with no LLM in the loop, and it has Python bindings (terminator-py). The terminator-mcp-agent crate is an axum and rmcp service whose only job is to expose 35 tools to an MCP client and route each one through the engine. The MCP layer can grow new tools without changing the AX layer, and the AX layer can fix UIA quirks without breaking the protocol contract. If they were one crate, every MCP feature would touch the platform code and every UIA fix would force an MCP version bump.",
  },
  {
    q: "Does Terminator support macOS today?",
    a: "Not from this repo, today. The current state is Windows-only and the AccessibilityEngine trait declaration is followed by a hard compile gate at crates/terminator/src/platforms/mod.rs lines 319 to 320: compile_error!(\"Terminator only supports Windows. Linux and macOS are not supported.\"). The trait is shaped to be cross-platform (find_element, get_window_tree, get_focused_element are platform-neutral signatures), and previous versions of the repo had a macos.rs implementation, but the version on main right now does not ship one. If you need macOS desktop automation through accessibility APIs from an MCP server today, that is not what this codebase covers. If you need Windows, the UIA path is the production one and is what 35 MCP tools route through.",
  },
  {
    q: "If MCP is just transport, why does it matter which MCP server I pick?",
    a: "Because the server is more than transport. It owns the selector grammar, the error model, the concurrency contract, and the side-effect surface. A click_element tool that takes a raw HWND and pixel coordinates puts the burden on the LLM to reason about windows. A click_element tool that takes a selector like role:Button|name:Save and a process scope puts the burden on the server to walk the AX tree and find the right element. A server with MCP_MAX_CONCURRENT defaulting to 1 (Terminator's default in main.rs) will serialize tool calls because a desktop has one focused window; a server that fan-outs tool calls without thinking about focus will corrupt your UI state when the agent calls two tools in parallel. The protocol does not impose any of this; the server design does.",
  },
  {
    q: "What does one click look like, end to end, in this stack?",
    a: "An MCP client (say Claude Desktop) sends a tools/call JSON-RPC frame: { name: \"click_element\", arguments: { process: \"notepad\", selector: \"role:Button|name:Save\" } }. The Terminator MCP server in server.rs at the click_element handler (line 2486) parses arguments via rmcp's typed Parameters extractor, picks a ClickMode (Selector vs Index vs Coordinates), and calls into the AccessibilityEngine. On Windows, the engine resolves the selector through the WindowsEngine implementation that wraps uiautomation-rs, which calls IUIAutomationElement->FindFirst with the appropriate condition tree, gets the IUIAutomationInvokePattern, and calls Invoke. The pattern call crosses into Notepad's process, runs the button's default action, and returns. The MCP server packs a CallToolResult with success status and any UI diff, and sends the response back to Claude. The protocol carries the request and the response. The accessibility API is what made the click happen.",
  },
  {
    q: "Can an LLM use an accessibility API directly without an MCP server in the middle?",
    a: "Yes, if you write the glue yourself. An LLM is just a function that returns text or tool-shaped JSON. Anthropic's Computer Use beta lets Claude take screenshots and emit pyautogui-style clicks; OpenAI's function calling lets you expose any Python function as a tool. You can hand-roll a function tool that wraps pywinauto or atomacos and skip MCP entirely. What you give up is portability. Your tool definition is bound to one client SDK, the schema lives in your codebase, and switching clients (Claude Desktop to Cursor to Windsurf) means re-wiring the tool registration. MCP is an interop bet: write the server once, plug it into any MCP-aware client. Terminator's MCP server registers in Claude with claude mcp add terminator 'npx -y terminator-mcp-agent@latest' and the same binary works in Cursor and VS Code with config-file edits.",
  },
  {
    q: "Where does this leave Playwright? Is Playwright an accessibility API or an MCP server?",
    a: "Neither, originally. Playwright is a browser automation library that drives Chromium, Firefox, and WebKit through their CDP and similar protocols. It happens to use the browser's accessibility tree as one of its locator strategies (page.getByRole), which is why people call it an accessibility-tree library by analogy. Playwright MCP is a wrapper around Playwright that exposes browser automation as MCP tools. So the stack for Playwright MCP is: MCP transport, Playwright Node API, Chrome DevTools Protocol, browser process. No OS accessibility API is involved on the browser path. Terminator's stack is: MCP transport, terminator-rs SDK, Windows UI Automation, target app process. They are siblings, not the same thing. Browser-only automation: Playwright and Playwright MCP are usually the right choice. Native desktop automation: a UIA-backed MCP server is the right choice.",
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
  "MCP server",
  "Engine trait",
  "UIAutomation",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "tools/call click_element",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "find_element(selector)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "FindFirst on AutomationElement",
    type: "request" as const,
  },
  {
    from: 3,
    to: 2,
    label: "IUIAutomationElement",
    type: "response" as const,
  },
  {
    from: 2,
    to: 3,
    label: "GetCurrentPattern(InvokePattern)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 3,
    label: "Invoke() crosses into target process",
    type: "event" as const,
  },
  {
    from: 3,
    to: 2,
    label: "S_OK",
    type: "response" as const,
  },
  {
    from: 2,
    to: 1,
    label: "ClickResult",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "CallToolResult JSON",
    type: "response" as const,
  },
];

const beforeAfter = {
  title: "What is actually under the MCP layer",
  before: {
    label: "Vision-only MCP server",
    content:
      "An MCP server in this shape exposes tools like take_screenshot, click_at(x, y), and type_text. There is no accessibility engine in the loop. Each tool call ends in a screenshot the LLM has to read, and a SendInput-style synthetic event the LLM has to aim. The protocol layer is honest, but the stack underneath is screen-and-pixel automation in a JSON-RPC suit. Failure modes inherit from PyAutoGUI: DPI-sensitive coordinates, cursor takeover, fragile template matching, and an LLM in the loop on every action.",
    highlights: [
      "tools shaped like screenshot + click_at(x, y)",
      "no IUIAutomationElement anywhere in the source",
      "every action pays LLM inference latency to read pixels",
      "wins where the target has no AX provider (games, canvas)",
    ],
  },
  after: {
    label: "Accessibility-backed MCP server",
    content:
      "Terminator's terminator-mcp-agent crate is the protocol surface only. Each tool handler in server.rs (35 of them) parses arguments and dispatches through the AccessibilityEngine trait declared at crates/terminator/src/platforms/mod.rs line 86. The trait's Windows implementation in crates/terminator/src/platforms/windows wraps uiautomation-rs and calls real UIA pattern methods. The MCP layer adds protocol hygiene; the engine layer does the work. You can use terminator-rs as a plain Rust SDK with no MCP server, and the MCP server can grow tools without touching UIA code.",
    highlights: [
      "click_element handler at server.rs:2486 routes through the engine",
      "engine resolves selectors via FindFirst, fires UIInvokePattern.Invoke",
      "no LLM in the per-action loop; selectors are deterministic",
      "the same Rust crate exposes a Python SDK (terminator-py) with no MCP",
    ],
  },
};

const stackerSteps: StepperStep[] = [
  {
    title: "Client speaks MCP",
    description:
      "Claude Desktop, Cursor, VS Code, or Claude Code emits tools/call over stdio.",
  },
  {
    title: "Server validates args",
    description:
      "rmcp's typed Parameters extractor enforces the JSON schema before any UI work.",
  },
  {
    title: "Engine trait runs",
    description:
      "AccessibilityEngine.find_element resolves the selector to a real UIA element.",
  },
  {
    title: "Pattern fires",
    description:
      "UIInvokePattern.Invoke() crosses into the target process via COM.",
  },
  {
    title: "Diff returns",
    description:
      "CallToolResult carries success and an optional UI tree diff back up the chain.",
  },
];

const layerChecklist = [
  {
    text: "MCP defines tools/list, tools/call, prompts, and resources over stdio, SSE, or streamable HTTP.",
  },
  {
    text: "Accessibility APIs are OS-level interfaces: UI Automation on Windows, AXUIElement on macOS, AT-SPI on Linux.",
  },
  {
    text: "The MCP server is the seam: it owns the schema, the selector grammar, the error model, and concurrency.",
  },
  {
    text: "The engine layer is the work: it owns FindFirst, pattern lookups, and the synthetic-input fallback path.",
  },
  {
    text: "If the MCP server has no engine, every tool call is a screenshot + LLM coordinate guess.",
  },
  {
    text: "If the engine has no MCP server, you have a normal SDK, not a tool an AI client can discover.",
  },
];

const protocolOnlyCode = `# A vision-only MCP server. The protocol layer is honest;
# the stack underneath is pyautogui + screenshots.

@server.tool()
async def take_screenshot() -> bytes:
    return PIL.ImageGrab.grab().tobytes()

@server.tool()
async def click_at(x: int, y: int) -> dict:
    pyautogui.click(x, y)              # SendInput, no element
    return {"clicked": [x, y]}

@server.tool()
async def type_text(text: str) -> dict:
    pyautogui.typewrite(text)          # virtual key presses
    return {"typed": text}

# the LLM has to:
#   1) call take_screenshot
#   2) read the bytes
#   3) reason about coordinates
#   4) call click_at(x, y) and hope the click landed
#
# every action pays LLM inference. DPI changes break it.
# zero accessibility-API calls anywhere in this server.`;

const enginebackedCode = `// Terminator's click_element handler, server.rs:2486
// 35 #[tool(...)] attributes in this file; this is one.

#[tool(description = "Unified click tool with three modes ...")]
pub async fn click_element(
    &self,
    Parameters(args): Parameters<ClickElementArgs>,
) -> Result<CallToolResult, McpError> {
    let mode = args.determine_mode()?;            // Selector | Index | Coordinates

    match mode {
        ClickMode::Selector => {
            // dispatch through the AccessibilityEngine trait
            let element = self.engine
                .find_element(&selector, root, timeout)?;   // platforms/mod.rs:86
            element.click()?;                               // wraps UIInvokePattern
        }
        ClickMode::Index => { /* AX tree index, OCR, Omniparser, Gemini, DOM */ }
        ClickMode::Coordinates => { /* synthetic input fallback */ }
    }

    Ok(CallToolResult::success(...))
}

// the MCP layer is parse + dispatch + repackage.
// the actual click is UIA pattern invocation in the target process.
// no LLM in this loop.`;

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
      "Accessibility API for computer use agents: the seven-mode click_element router",
    excerpt:
      "Why a real desktop agent needs more than one grounding source. ClickMode + VisionType produces seven distinct click paths under one MCP tool. utils.rs:728 and 1062.",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Agents",
  },
  {
    title:
      "The best MCP server is the one shaped like the resource it controls",
    excerpt:
      "Concurrency shape beats tool count. A desktop has one mouse, one keyboard, one focused window. Terminator defaults MCP_MAX_CONCURRENT=1; here is the main.rs code.",
    href: "/t/best-mcp-server",
    tag: "MCP",
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
            MCP servers vs accessibility APIs:{" "}
            <span className="text-orange-600">
              they are different layers, not alternatives
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            The framing buries the actual question. MCP is a protocol; an AI
            client like Claude Desktop or Cursor speaks it to discover and
            call your tools. Accessibility APIs are OS hooks;{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              UI Automation
            </code>{" "}
            on Windows and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElement
            </code>{" "}
            on macOS report on real UI elements and act on them. They are
            stacked, not opposed. The useful comparison is whether the MCP
            server you are picking actually wraps a real accessibility engine.
            Terminator's repo makes the boundary literal: one Rust crate for
            the engine, one for the 35-tool MCP server, and the second never
            touches{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              IUIAutomation
            </code>{" "}
            without going through the first.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MCP
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIAutomation
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              AXUIElement
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              35 tools
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              v0.24.32
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
                MCP servers are not a replacement for accessibility APIs.
              </strong>{" "}
              MCP is the transport and tool-discovery protocol your AI client
              speaks. Accessibility APIs are the OS-level interfaces (UI
              Automation, AXUIElement, AT-SPI) that read and act on real UI
              elements in running apps. A useful desktop-automation MCP
              server wraps a real accessibility engine and exposes its
              operations as typed tools. An MCP server with no engine
              underneath is a JSON-RPC harness that ends every call in a
              screenshot the LLM has to read.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Authoritative sources:{" "}
              <a
                href="https://modelcontextprotocol.io/docs/concepts/architecture"
                className="text-orange-700 underline underline-offset-2"
              >
                Model Context Protocol architecture
              </a>{" "}
              and{" "}
              <a
                href="https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32"
                className="text-orange-700 underline underline-offset-2"
              >
                Microsoft UI Automation overview
              </a>
              .
            </p>
          </div>
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Where each layer sits
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Walking the call from a Claude tool invocation down to the bit
            of the OS that actually clicks the button makes the layering
            concrete. The MCP server is parse, validate, dispatch, and
            repackage. The accessibility API is the call that crosses into
            another process and runs the action. The engine trait between
            them is the seam where Terminator hides the platform code.
          </p>
          <SequenceDiagram
            title="One click, four hops"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What is actually under the protocol layer
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two MCP servers can advertise tools/list with the same names
            and have completely different behavior in production. The
            difference is what the handler dispatches into. A vision-only
            server ends every call at a screenshot and an LLM coordinate
            guess. An accessibility-backed server ends at a UIA pattern
            invocation in the target process. Toggle the panel to see how
            the source code splits.
          </p>
          <BeforeAfter
            title={beforeAfter.title}
            before={beforeAfter.before}
            after={beforeAfter.after}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What each layer contributes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            MCP and accessibility APIs solve disjoint problems. Mixing them
            up obscures the choice you are actually making when you pick an
            MCP server. The split below is the working list.
          </p>

          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-zinc-700">
                <tr>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    Concern
                  </th>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    MCP servers (the protocol)
                  </th>
                  <th className="text-left font-semibold px-5 py-3 border-b border-zinc-200">
                    Accessibility APIs (the OS)
                  </th>
                </tr>
              </thead>
              <tbody className="text-zinc-700">
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    What it speaks
                  </td>
                  <td className="px-5 py-4">
                    JSON-RPC 2.0 over stdio, SSE, or streamable HTTP
                  </td>
                  <td className="px-5 py-4">
                    COM (UIA on Windows), Mach (AX on macOS), D-Bus
                    (AT-SPI on Linux)
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    What it knows about the desktop
                  </td>
                  <td className="px-5 py-4">
                    Nothing. The protocol is opaque to the target apps.
                  </td>
                  <td className="px-5 py-4">
                    The full live UI tree: roles, names, automation IDs,
                    bounds, focused element.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    What you call to make a click happen
                  </td>
                  <td className="px-5 py-4">
                    tools/call with arguments shaped by the server&apos;s
                    schema
                  </td>
                  <td className="px-5 py-4">
                    IUIAutomationInvokePattern::Invoke (Windows) or
                    AXUIElementPerformAction (macOS)
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Discovery model
                  </td>
                  <td className="px-5 py-4">
                    tools/list returns named tools and JSON schemas an LLM
                    client can read
                  </td>
                  <td className="px-5 py-4">
                    Walk the tree from the desktop root or a specific
                    process; query by control type, role, or AutomationId
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Owns the selector grammar
                  </td>
                  <td className="px-5 py-4">
                    No. The grammar lives in the server&apos;s tool
                    schemas.
                  </td>
                  <td className="px-5 py-4">
                    No. UIA gives you ConditionTree, AX gives you attribute
                    queries; both are too low-level for a tool schema.
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Concurrency
                  </td>
                  <td className="px-5 py-4">
                    Per-server policy; Terminator defaults to
                    MCP_MAX_CONCURRENT=1 because a desktop has one focused
                    window
                  </td>
                  <td className="px-5 py-4">
                    Calls are per-process; a UIA call into Notepad and one
                    into Excel can overlap, but two clicks into the same
                    app cannot
                  </td>
                </tr>
                <tr className="border-b border-zinc-100">
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    What &ldquo;works&rdquo; means
                  </td>
                  <td className="px-5 py-4">
                    The client received a CallToolResult with status and
                    content
                  </td>
                  <td className="px-5 py-4">
                    The pattern call returned S_OK and the target process
                    actually ran the default action
                  </td>
                </tr>
                <tr>
                  <td className="px-5 py-4 font-medium text-zinc-900">
                    Useful without the other?
                  </td>
                  <td className="px-5 py-4">
                    Only if some other engine is on the inside (browsers,
                    APIs, file system, vision)
                  </td>
                  <td className="px-5 py-4">
                    Yes. It is a normal SDK; you call it from Python or
                    Rust without an LLM in the loop.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-zinc-700 leading-relaxed">
            The row that decides everything is &ldquo;what you call to make
            a click happen&rdquo;. MCP gives you a JSON-RPC frame. The
            accessibility API gives you a function that runs in the target
            process. Without the bottom row you have a protocol pointing at
            nothing.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            One click, the five hops it takes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The path from a Claude tool call to a real button press is a
            handful of layered moves. Each hop owns its own job; none of
            them is the whole stack.
          </p>
          <HorizontalStepper
            title="From tools/call to UIInvokePattern.Invoke"
            steps={stackerSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What lives where, in plain terms
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A short working list to keep the layers separate when you are
            picking tooling.
          </p>
          <AnimatedChecklist
            title="Layer responsibilities"
            items={layerChecklist}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Two MCP servers, same protocol, different engines
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both snippets are valid MCP servers. Both pass schema
            validation, both register with Claude Desktop, both expose
            tools the LLM can call. The difference is what the tool
            handlers actually do. The first one ends every call at
            pyautogui. The second routes through a real{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AccessibilityEngine
            </code>{" "}
            trait declared at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator/src/platforms/mod.rs:86
            </code>
            .
          </p>
          <CodeComparison
            title="MCP server, with and without an engine underneath"
            leftLabel="vision-only.py"
            rightLabel="server.rs (terminator-mcp-agent)"
            leftCode={protocolOnlyCode}
            rightCode={enginebackedCode}
            leftLines={protocolOnlyCode.split("\n").length}
            rightLines={enginebackedCode.split("\n").length}
            reductionSuffix="lines per click"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why split the engine and the MCP server into separate crates
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Terminator workspace at version 0.24.32 ships two crates
            that matter for this question. The first is{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              terminator-rs
            </code>{" "}
            (path:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator
            </code>
            ). It declares the cross-platform-shaped trait{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              pub trait AccessibilityEngine
            </code>{" "}
            at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              src/platforms/mod.rs
            </code>{" "}
            line 86 with methods like{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              find_element
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_window_tree
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_focused_element
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click_at_coordinates
            </code>
            . The Windows implementation under{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              src/platforms/windows
            </code>{" "}
            wires{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              uiautomation
            </code>
            -rs and is what fires real UIA pattern calls.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The second is{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              terminator-mcp-agent
            </code>{" "}
            (path:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator-mcp-agent
            </code>
            ). Its{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              src/server.rs
            </code>{" "}
            is roughly 11,000 lines, and a grep for{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #[tool(
            </code>{" "}
            returns 35 hits, one per MCP tool exposed to the client. Every
            one of those handlers parses arguments through{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              rmcp
            </code>
            &apos;s typed{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              Parameters
            </code>{" "}
            extractor, then dispatches through the engine. The MCP layer
            never calls{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              IUIAutomation
            </code>{" "}
            directly. That is what the seam exists for: the protocol
            surface can grow new tools without churning UIA code, and the
            engine can absorb UIA quirks without breaking the wire schema.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest caveat: today the engine is Windows-only.{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              src/platforms/mod.rs
            </code>{" "}
            lines 319 to 320 emit{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              compile_error!(&quot;Terminator only supports Windows. Linux
              and macOS are not supported.&quot;)
            </code>{" "}
            on any non-Windows target. The trait is shaped to be
            cross-platform, the locator grammar is platform-neutral, and
            previous versions of the repo had a macOS implementation, but
            the version on{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              main
            </code>{" "}
            today does not ship one. Read the trait, decide if the seam is
            the right one for your stack, and if you need macOS today, this
            specific MCP server is not it. If you need Windows desktop
            automation behind an MCP server, the UIA path is the production
            one and is what 35 tools route through.
          </p>
        </section>

        <ProofBanner
          quote="Most playbooks frame this as MCP or accessibility APIs. In production it is MCP plus a real engine, or it is screenshots in a JSON-RPC suit."
          source="From the engine trait at platforms/mod.rs:86"
          metric="35 tools, 1 trait"
        />

        <section className="max-w-4xl mx-auto px-6 mt-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Picking an MCP server when desktop control is the actual goal
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A short field guide if you are evaluating MCP servers for a
            desktop-driving agent rather than a browser one. Every one of
            these is a question about the engine, not the protocol.
          </p>
          <ol className="mt-6 list-decimal pl-6 space-y-3 text-zinc-700">
            <li>
              <strong className="text-zinc-900">
                Does the source import a real OS automation library?
              </strong>{" "}
              Look for{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                uiautomation
              </code>
              ,{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                pywinauto
              </code>
              ,{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                FlaUI
              </code>{" "}
              on Windows;{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                AXUIElement
              </code>
              ,{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                atomacos
              </code>
              ,{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                pyobjc-framework-ApplicationServices
              </code>{" "}
              on macOS. If the only imports are{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                pyautogui
              </code>{" "}
              and a screenshot library, it is a vision-only server.
            </li>
            <li>
              <strong className="text-zinc-900">
                Does the click tool take a selector or coordinates?
              </strong>{" "}
              A selector signature (
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                role:Button|name:Save
              </code>
              ) means there is a tree-walking layer. A
              coordinates-only signature (
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                x, y
              </code>
              ) means the LLM owns the visual reasoning every call.
            </li>
            <li>
              <strong className="text-zinc-900">
                Is there a{" "}
                <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                  get_window_tree
                </code>{" "}
                tool?
              </strong>{" "}
              A tree dump that returns roles, names, AutomationIds, and
              indexed clickable elements is the thing that makes
              selector-mode and index-mode click tools work. Without it,
              the LLM has nothing to ground against.
            </li>
            <li>
              <strong className="text-zinc-900">
                What is the concurrency default?
              </strong>{" "}
              A desktop has one mouse, one keyboard, and one focused
              window. Servers that fan-out tool calls without thinking
              about focus will corrupt UI state. Terminator defaults{" "}
              <code className="font-mono text-[0.9em] bg-zinc-100 text-zinc-800 px-1 rounded">
                MCP_MAX_CONCURRENT=1
              </code>
              .
            </li>
            <li>
              <strong className="text-zinc-900">
                Is there a fallback path for opaque targets?
              </strong>{" "}
              Real production work runs into AX-empty surfaces (games,
              canvas apps, custom-rendered controls). The honest answer is
              a layered stack: tree first, then OCR or DOM index, then
              vision-LLM grounding, then raw coordinates. Servers that
              admit this and route around the gaps tend to work in
              production.
            </li>
          </ol>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Driving Windows apps from an AI agent? Talk to us."
          description="Walk through the engine boundary, the 35 MCP tools, and the production traps in the path from tools/call to UIInvokePattern.Invoke."
        />

        <FaqSection items={faqs} heading="Frequently asked" />

        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Companion deep-dives on the same stack."
          posts={relatedPosts}
        />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="See the MCP-to-UIA stack live."
        />
      </article>
    </>
  );
}
