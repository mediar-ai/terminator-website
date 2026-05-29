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
  ShimmerButton,
  NumberTicker,
  TerminalOutput,
  AnimatedCodeBlock,
  CodeComparison,
  BeforeAfter,
  SequenceDiagram,
  ComparisonTable,
  StepTimeline,
  MetricsRow,
  InlineCta,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/claude-computer-use";
const PUBLISHED = "2026-04-18";
const TITLE =
  "Claude computer use: the pixel-coordinate loop, and the selector-based alternative nobody explains";
const DESCRIPTION =
  "Claude's native computer use tool is a screenshot-in, pixel-coordinate-out loop. Every click costs a screenshot and an Anthropic round-trip. Terminator ships an MCP server with 32 selector-based tools so Claude can click by accessibility role and name instead, resolving against the OS UIA tree locally. This page shows both paths with real source from server.rs line 9953.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The inside of Claude's computer use tool is a pixel-coordinate loop. Terminator's MCP agent replaces it with 32 selector-based tools so clicks hit the accessibility tree directly. Both shown side by side.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude computer use, and the selector-based path nobody talks about",
    description:
      "Native computer use sends a screenshot to Claude and gets pixel coordinates back. Terminator's MCP lets Claude use role:Button && name:Save instead. Same outcome, different physics.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Claude computer use" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Claude computer use", url: PAGE_URL },
];

const anthropicToolCall = `// What Claude emits when native computer use is enabled.
// Source: Anthropic computer_20251022 tool schema.
// The model sees a screenshot, picks pixels, returns this JSON.

{
  "type": "tool_use",
  "name": "computer",
  "input": {
    "action": "left_click",
    "coordinate": [487, 341]
  }
}

// Your harness must:
//   1. Screenshot the desktop
//   2. Ship it to Anthropic with the tool definition
//   3. Receive an action with [x, y] in pixel space
//   4. Execute the click (xdotool, PyAutoGUI, your own driver)
//   5. Screenshot again, send again, wait again

// Every click is one image upload and one model call.`;

const terminatorToolCall = `// What Claude emits when Terminator's MCP server is attached.
// Source: crates/terminator-mcp-agent/src/server.rs:9993 (click_element arm).
// No screenshot required. No coordinates. One selector string.

{
  "type": "tool_use",
  "name": "click_element",
  "input": {
    "selector": "role:Button && name:Save"
  }
}

// Terminator's dispatch_tool match arm:
//   - deserialises the args into ClickElementArgs
//   - resolves the selector against the Windows UIA tree (or macOS AX)
//   - calls invoke() or click() on the matched element
//   - returns a CallToolResult plus a UI diff

// CPU-speed lookup. No model inference. No image upload.`;

const dispatchSource = `// crates/terminator-mcp-agent/src/server.rs:9953
// One function handles every MCP call from Claude.
// Each arm is a selector-based tool. 32 arms total.

let result = match tool_name {
    "get_window_tree"              => self.get_window_tree(..)              .await,
    "get_applications_and_windows_list" => self.get_applications_and_windows_list(..).await,
    "click_element"                => self.click_element(..)                .await,
    "type_into_element"            => self.type_into_element(..)            .await,
    "press_key"                    => self.press_key(..)                    .await,
    "press_key_global"             => self.press_key_global(..)             .await,
    "validate_element"             => self.validate_element(..)             .await,
    "wait_for_element"             => self.wait_for_element(..)             .await,
    "activate_element"             => self.activate_element(..)             .await,
    "navigate_browser"             => self.navigate_browser(..)             .await,
    "execute_browser_script"       => self.execute_browser_script(..)       .await,
    "open_application"             => self.open_application(..)             .await,
    "scroll_element"               => self.scroll_element(..)               .await,
    "mouse_drag"                   => self.mouse_drag(..)                   .await,
    "highlight_element"            => self.highlight_element(..)            .await,
    "select_option"                => self.select_option(..)                .await,
    "set_selected"                 => self.set_selected(..)                 .await,
    "capture_screenshot"           => self.capture_screenshot(..)           .await,
    "invoke_element"               => self.invoke_element(..)               .await,
    "set_value"                    => self.set_value(..)                    .await,
    "execute_sequence"             => self.execute_sequence(..)             .await,
    "run_command"                  => self.run_command(..)                  .await,
    "delay"                        => self.delay(..)                        .await,
    "stop_highlighting"            => self.stop_highlighting(..)            .await,
    "stop_execution"               => self.stop_execution(..)               .await,
    "gemini_computer_use"          => self.gemini_computer_use(..)          .await,
    "read_file"                    => self.read_file(..)                    .await,
    "write_file"                   => self.write_file(..)                   .await,
    "edit_file"                    => self.edit_file(..)                    .await,
    "copy_content"                 => self.copy_content(..)                 .await,
    "glob_files"                   => self.glob_files(..)                   .await,
    "grep_files"                   => self.grep_files(..)                   .await,
    _ => Err(McpError::internal_error("Unknown tool called", ..)),
};`;

const promptRule = `// crates/terminator-mcp-agent/src/prompt.rs:10, 21
// The system prompt Claude sees on every session.
// Note line 21: selectors come from the tree, never from the model's imagination.

pub fn get_server_instructions() -> String {
    let mcp_tools = env!("MCP_TOOLS"); // compiled in by build.rs
    format!("
You are an AI assistant designed to control a computer desktop.
Your primary goal is to understand the user's request and translate
it into a sequence of tool calls to automate GUI interactions.

- Always derive selectors strictly from the provided UI tree or DOM data;
  never guess or predict element attributes based on assumptions.
- verify_element_exists/verify_element_not_exists require EXACT match
  from UI tree - only use selectors you've seen in a previous response.

Valid tool names:
{mcp_tools}
    ")
}`;

const installTerminal = [
  { text: "# give Claude Code the 32 selector-based tools", type: "output" as const },
  {
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user',
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "Connected MCP servers:", type: "output" as const },
  { text: "  terminator   stdio   32 tools", type: "output" as const },
  { text: "", type: "output" as const },
  {
    text: "# Claude now has click_element, type_into_element, navigate_browser, and 29 more",
    type: "output" as const,
  },
  {
    text: "# selectors resolve against the OS accessibility tree. no screenshots needed per click.",
    type: "success" as const,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What the model returns per action",
    competitor: '{ action: "left_click", coordinate: [x, y] }',
    ours: '{ name: "click_element", selector: "role:Button && name:Save" }',
  },
  {
    feature: "Input the model needs to see",
    competitor: "PNG screenshot of the desktop, every turn",
    ours: "Accessibility tree (YAML/JSON), fetched once per screen",
  },
  {
    feature: "Round-trip cost per click",
    competitor: "One screenshot upload + one model call",
    ours: "One MCP stdio call. Model already knows the tree.",
  },
  {
    feature: "Where the resolution happens",
    competitor: "Inside the model: it reads pixels, does OCR-style vision, returns coords",
    ours: "Inside Terminator: selector is matched against the Windows UIA / macOS AX tree locally",
  },
  {
    feature: "Failure mode on UI drift",
    competitor: "Button moved 12 pixels, old coordinate misses, silent miss-click",
    ours: "Selector by role+name still resolves if the element is still there. If not, a typed McpError comes back.",
  },
  {
    feature: "Observability",
    competitor: "Screenshots are the only artifact. Replay is imprecise.",
    ours: "Every call logged by tool_logging.rs. UI tree before/after captured by default into executions/.",
  },
  {
    feature: "Cursor and keyboard",
    competitor: "Takes over your cursor. You cannot use the computer while it runs.",
    ours: "Runs through accessibility APIs. Your cursor is untouched.",
  },
  {
    feature: "Session state",
    competitor: "Whatever your harness script keeps",
    ours: "Long-lived MCP process. Cancellation tokens, concurrency gate (MCP_MAX_CONCURRENT), focus restore.",
  },
];

const toolkitRows: ComparisonRow[] = [
  {
    feature: "Opens an application",
    competitor: "Claude must take a screenshot, find the taskbar icon pixel, click it, wait, screenshot again",
    ours: "open_application({ path: 'notepad' }) - single MCP call, returns the PID and the fresh UI tree",
  },
  {
    feature: "Fills a login form",
    competitor: "Screenshot. Coord-click the email field. Type. Screenshot. Coord-click password. Type. Screenshot.",
    ours: "type_into_element({ selector: 'role:Edit && name:Email' }) twice - no vision loop",
  },
  {
    feature: "Reads a dialog",
    competitor: "Screenshot, OCR inside the model, hope the text survived compression",
    ours: "get_window_tree returns the literal Name and Value strings from the accessibility API",
  },
  {
    feature: "Runs a multi-step workflow",
    competitor: "Loop: screenshot -> LLM -> action -> screenshot -> LLM -> action ... Anthropic billed per turn.",
    ours: "execute_sequence ships a whole YAML of steps in one call. Engine-mode JS/Python share state via env.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "What is an MCP server? A real one, opened in the editor",
    href: "/t/what-is-mcp-server",
    excerpt:
      "The dispatch_tool match block in server.rs, the build.rs trick that keeps the system prompt in sync with the code. Terminator is the example.",
    tag: "Guide",
  },
  {
    title: "Terminator on GitHub",
    href: "https://github.com/mediar-ai/terminator",
    excerpt:
      "Core Rust crates, MCP agent, Node and Python bindings, workflow recorder. MIT licensed.",
    tag: "Repo",
  },
  {
    title: "Terminator MCP agent README",
    href: "https://github.com/mediar-ai/terminator/tree/main/terminator-mcp-agent",
    excerpt:
      "Install commands for Cursor, VS Code, Claude Code. HTTP transport, concurrency gate, virtual display support for headless VMs.",
    tag: "Docs",
  },
];

const faqs = [
  {
    q: "How does Claude's native computer use actually work?",
    a: "Anthropic ships a tool type called computer (current revision computer_20251022). When enabled, your harness is responsible for taking a screenshot of the desktop and sending it to Claude alongside the tool definition. Claude returns a tool_use block whose input is an action like left_click with a coordinate pair in pixel space. Your code executes the click, takes another screenshot, sends both back, and the loop continues. Every action is one screenshot upload and one model round-trip. This is not a limitation of Claude, it is how the tool is defined: the model sees pixels, you execute pixels.",
  },
  {
    q: "Why is that loop expensive?",
    a: "Two reasons, both mechanical. First, every action pays for one image token budget plus output tokens, and screenshots are not tiny even after downscaling. Anthropic's own computer use docs note that long tasks with frequent screenshots consume significant credits. Second, wall-clock latency: every action is one full inference pass, typically one to several seconds. A 40-action workflow becomes a coffee break. A deterministic selector-driven agent can do the same 40 steps in seconds because the model is not in the inner loop.",
  },
  {
    q: "Is Claude computer use free, and what does it cost to run?",
    a: "It is not free in either form. The beta API tool bills per token, and computer use is token-heavy by construction: every action sends a screenshot (image tokens) plus the model call (input and output tokens), so a 40-step workflow is 40 inference passes. Anthropic's own docs warn that frequent screenshots consume significant credits. The consumer 'Claude can use your computer' preview requires a Pro or Max subscription. Terminator's MCP agent is MIT-licensed and free, and because selectors resolve locally against the accessibility tree, it removes the per-click screenshot entirely, which is where most of the token cost in a pixel loop comes from. You still pay for the Claude calls that reason about the task, just not for an image upload on every click.",
  },
  {
    q: "Is Claude computer use available on Windows, or only macOS?",
    a: "Both. Anthropic ships computer use two ways. The beta API tool (computer_20251022) is OS-agnostic: it returns pixel coordinates and your harness executes them wherever it runs, Windows or macOS. The consumer research preview started on macOS and expanded to Windows in 2026, behind a Pro or Max plan. If you are on Windows specifically, the selector path is even stronger: Windows UI Automation exposes a deep, well-labelled tree for native and Win32 apps, so Terminator can resolve role:Button && name:Save without a single screenshot. Windows is Terminator's primary target, and the same MCP server also covers macOS via the AX API.",
  },
  {
    q: "What exactly does Terminator's MCP server give Claude instead?",
    a: "32 typed tools that speak accessibility-tree selectors, not coordinates. You can list them by opening crates/terminator-mcp-agent/src/server.rs at line 9953, where the dispatch_tool match block has one arm per tool. Examples: click_element takes a selector like role:Button && name:Save, type_into_element takes a selector plus text, navigate_browser drives the address bar, execute_browser_script runs JS inside the page, execute_sequence accepts a YAML of steps. The complete list at the time of writing: get_window_tree, get_applications_and_windows_list, click_element, type_into_element, press_key, press_key_global, validate_element, wait_for_element, activate_element, navigate_browser, execute_browser_script, open_application, scroll_element, mouse_drag, highlight_element, select_option, set_selected, capture_screenshot, invoke_element, set_value, execute_sequence, run_command, delay, stop_highlighting, stop_execution, gemini_computer_use, read_file, write_file, edit_file, copy_content, glob_files, grep_files.",
  },
  {
    q: "Why selectors instead of coordinates?",
    a: "Because the operating system already knows where every element is. Windows UI Automation and macOS Accessibility both expose a live tree where each element has a role (Button, Edit, Text, Window), a name, a value, bounds, and a parent chain. Terminator finds elements by matching that tree. role:Button && name:Save survives the button moving by 100 pixels, the window being resized, a theme change, or a DPI shift. A coordinate pair does not. The system prompt Terminator sends to Claude, in crates/terminator-mcp-agent/src/prompt.rs line 21, makes this explicit: always derive selectors strictly from the provided UI tree or DOM data; never guess or predict element attributes based on assumptions.",
  },
  {
    q: "Can I use Claude's native computer use and Terminator together?",
    a: "Yes. Terminator's MCP agent exposes both a capture_screenshot tool and a vision-model fallback called gemini_computer_use (server.rs line 10267) for cases where the accessibility tree is empty or lies. The normal flow is: Claude calls get_window_tree first, reads the tree, picks the selector it needs, calls click_element or type_into_element. If an element is truly invisible to accessibility, you can escalate to a visual path. The point is that the selector path is the default, not the exception, and most Windows and macOS apps expose enough tree to skip vision entirely.",
  },
  {
    q: "How do I install Terminator's MCP server in Claude Code?",
    a: "One command: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. That registers the server at the user scope, runs it over stdio under Claude Code's supervision, and exposes the 32 tools inside the normal tool picker. For Cursor, VS Code, Windsurf, or any other MCP client, the same server binary works with a standard mcpServers JSON block pointing at the same npx command. Full instructions live in crates/terminator-mcp-agent/README.md on GitHub.",
  },
  {
    q: "Does Terminator replace Claude computer use or complement it?",
    a: "It replaces the default path for the actions where accessibility tree is faster and more reliable, which is most of them on Windows and macOS. Terminator's README is explicit about the goal: run 100x faster than the pixel-loop agents and hit above 95% success rate by keeping the model out of the inner loop. Anthropic's native computer use still matters for fully alien UIs (games, some Electron apps that do not expose their tree, canvas-heavy apps), which is why Terminator keeps a vision-model tool available as a fallback rather than pretending it is never needed.",
  },
  {
    q: "Is the system prompt really compiled into the binary?",
    a: "Yes, and this is the detail worth looking at yourself. crates/terminator-mcp-agent/build.rs at line 31 defines extract_mcp_tools(), a build-time function that opens src/server.rs, scans for the let result = match tool_name line, and collects every subsequent \"tool_name\" =>. That list becomes the MCP_TOOLS environment variable via println!(\"cargo:rustc-env=MCP_TOOLS=...\"). Then prompt.rs reads env!(\"MCP_TOOLS\") at compile time and pastes it into the system instructions Claude receives. The practical consequence: the server cannot tell Claude about a tool that dispatch_tool does not handle, and Claude cannot see a stale tool list. They are the same list by construction.",
  },
];

const jsonLdArticle = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);

const jsonLdFaq = faqPageSchema(faqs);

export default function ClaudeComputerUsePage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Claude computer use
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP server
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Accessibility tree
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              <GradientText variant="teal">Claude computer use</GradientText>,
              and the selector-based path the articles skip
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every explainer for this keyword says the same thing. Claude sees
              your screen, Claude controls your mouse, Claude is now an
              autonomous digital worker. None of them open the tool definition.
              The computer tool Anthropic ships is a pixel-coordinate loop:
              every turn, your harness sends a screenshot, Claude returns{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                {"{ action: \"left_click\", coordinate: [x, y] }"}
              </code>
              , you execute, screenshot again. That is the product. This page
              is about the alternative that already exists: instead of giving
              Claude pixels, give it selectors. Terminator&apos;s MCP agent
              exposes 32 tools that talk to the OS accessibility tree, so
              Claude calls{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                click_element(&quot;role:Button &amp;&amp; name:Save&quot;)
              </code>{" "}
              and nothing round-trips a screenshot through Anthropic.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="11 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "32 selector-based tools in one MCP server",
                "dispatch_tool match block at server.rs line 9953",
                "Accessibility tree driven: Windows UIA + macOS AX",
                "One install command for Claude Code, Cursor, VS Code, Windsurf",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="#install">Install in Claude Code</ShimmerButton>
              <a
                href="#toolbox"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                See the 32 tools
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Direct answer / key facts */}
        <section className="max-w-4xl mx-auto px-6 pt-8">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 sm:p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
              The 30-second answer
            </p>
            <p className="text-zinc-700 text-base sm:text-lg leading-relaxed mb-6">
              <strong className="text-zinc-900 font-semibold">
                Claude computer use
              </strong>{" "}
              lets Claude operate a computer by looking at screenshots and
              replying with mouse and keyboard actions in pixel coordinates.
              Your harness screenshots the desktop, sends the image to the
              model, gets back something like{" "}
              <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                {"{ action: \"left_click\", coordinate: [x, y] }"}
              </code>
              , executes the click, then screenshots again. Every action is one
              image upload and one model round-trip, which is why long tasks get
              slow and expensive. On Windows and macOS you can skip that loop for
              most clicks: drive apps through the OS accessibility tree by
              selector instead of by pixel. That is what Terminator&apos;s MCP
              server gives Claude.
            </p>
            <dl className="grid gap-5 sm:grid-cols-3 border-t border-zinc-200 pt-6">
              <div>
                <dt className="text-sm font-semibold text-zinc-900 mb-1">
                  How it works
                </dt>
                <dd className="text-sm text-zinc-600 leading-relaxed">
                  Screenshot in, pixel coordinate out, on a loop. The model sits
                  in the inner loop of every single click.
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-zinc-900 mb-1">
                  Where you get it
                </dt>
                <dd className="text-sm text-zinc-600 leading-relaxed">
                  A beta API tool (
                  <code className="font-mono text-xs text-orange-600">
                    computer_20251022
                  </code>
                  ) for your own harness, plus a consumer research preview in the
                  Claude apps on macOS and Windows (Pro or Max plan).
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-zinc-900 mb-1">
                  The faster path
                </dt>
                <dd className="text-sm text-zinc-600 leading-relaxed">
                  Terminator&apos;s MCP server: 32 selector-based tools that
                  resolve against the Windows UIA / macOS AX tree locally. No
                  screenshot per click.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Two paths into your desktop."
            subtitle="Both use Claude. Only one sends a screenshot every turn."
            accent="orange"
            captions={[
              "Native computer use: screenshot in, pixel coordinate out",
              "Terminator MCP: selector in, accessibility-tree match out",
              "Same model. Same outcome. Different physics.",
              "32 tools at server.rs:9953. No vision loop in the hot path.",
              "One install: claude mcp add terminator",
            ]}
          />
        </section>

        {/* The short version */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            The short version
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Claude computer use is a tool Anthropic exposes via the API. The
            tool&apos;s contract is simple and that is the whole problem: the
            model takes a screenshot of your desktop as input and emits actions
            in pixel coordinates as output. The client loop is screenshot, send,
            receive coordinate, execute, screenshot, send, receive, execute.
            Every cycle is one image upload and one model call.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            On Windows and macOS, the OS already publishes a live accessibility
            tree that knows where every button, edit field, menu item, and
            checkbox is, what role it has, what its name is, and whether it is
            enabled. Terminator&apos;s MCP agent wraps that tree into 32 MCP
            tools. Claude calls them by selector. The click resolves locally
            through Windows UIA or macOS AX. No screenshot is required for the
            vast majority of actions, and the model is not in the critical path
            for element lookup.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            You can run both at once. The interesting question is which one
            Claude reaches for first. When Terminator is attached, it should be
            the tree, not the screenshot.
          </p>
        </section>

        {/* Before / After: the two tool schemas */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What Claude actually emits, in both worlds
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            This is the most concrete way to see the difference. Same user
            intent (&quot;click the Save button&quot;), two tool calls, two
            completely different sets of downstream work.
          </p>
          <BeforeAfter
            title=""
            before={{
              label: "Native computer use",
              content:
                "Pixel coordinate. Your harness ships a fresh screenshot, Claude reads it, Claude returns an (x, y) in pixel space. You execute the click with xdotool, PyAutoGUI, or your own driver. The model never saw the button's name or role, only its pixels.",
              highlights: [
                "Screenshot required every turn",
                "Model in the inner loop of element lookup",
                "Coordinates break when the window moves 12 pixels",
                "Replaying the run means replaying the screenshots",
              ],
            }}
            after={{
              label: "Terminator MCP",
              content:
                "Selector. Claude emits the tool name (click_element) and a selector string (role:Button && name:Save). Terminator's dispatch_tool at server.rs line 9953 resolves it against the OS accessibility tree, calls invoke() or click() on the matched element, and returns a UI diff. No screenshot required for lookup.",
              highlights: [
                "One MCP stdio call, no image upload",
                "Survives window resize, DPI change, theme change",
                "Fails loudly with a typed McpError if the element is gone",
                "Full audit trail in executions/ by default",
              ],
            }}
          />
        </section>

        {/* Side by side code */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The tool calls, side by side
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Left: the JSON Claude emits under Anthropic&apos;s{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              computer_20251022
            </code>{" "}
            tool schema. Right: the JSON Claude emits when Terminator&apos;s
            MCP agent is attached. Both target the same button. Only one
            requires a new screenshot to find it.
          </p>
          <CodeComparison
            leftLabel="Anthropic computer tool"
            rightLabel="Terminator MCP click_element"
            leftCode={anthropicToolCall}
            rightCode={terminatorToolCall}
            leftLines={anthropicToolCall.split("\n").length}
            rightLines={terminatorToolCall.split("\n").length}
            title="tool_use payloads for 'click Save'"
            reductionSuffix="lines, and one fewer screenshot per click"
          />
        </section>

        {/* The native loop, drawn */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The native pixel loop, drawn once
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Eight actors, ten messages. The model is in the middle of every
            action. This is why long tasks cost real money and real time on
            Claude computer use: every arrow on the right-hand side is a paid
            inference plus an image token charge.
          </p>
          <SequenceDiagram
            title="native computer use: one click"
            actors={["User", "Harness", "Anthropic API", "Desktop"]}
            messages={[
              { from: 0, to: 1, label: "task: click Save", type: "request" },
              { from: 1, to: 3, label: "take screenshot", type: "request" },
              { from: 3, to: 1, label: "desktop.png (base64)", type: "response" },
              { from: 1, to: 2, label: "messages + screenshot + tool defs", type: "request" },
              { from: 2, to: 2, label: "model reads pixels", type: "event" },
              { from: 2, to: 1, label: "tool_use: left_click [487, 341]", type: "response" },
              { from: 1, to: 3, label: "move_mouse + click at (487, 341)", type: "request" },
              { from: 3, to: 1, label: "os reports ok", type: "response" },
              { from: 1, to: 3, label: "take screenshot again", type: "request" },
              { from: 3, to: 1, label: "desktop.png v2", type: "response" },
            ]}
          />
        </section>

        {/* Terminator path drawn as a beam */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The selector path, drawn as a beam
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The MCP agent sits between Claude and the OS. Every tool call flows
            through a single{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              dispatch_tool
            </code>{" "}
            function. Selector in, accessibility-tree match out, action
            performed through UIA or AX. The model is not re-invoked to resolve
            the element.
          </p>
          <AnimatedBeam
            title="Claude -> Terminator MCP -> OS accessibility tree"
            from={[
              { label: "Claude Code" },
              { label: "Cursor" },
              { label: "VS Code" },
              { label: "Windsurf" },
            ]}
            hub={{ label: "dispatch_tool", sublabel: "server.rs:9953" }}
            to={[
              { label: "Windows UIA" },
              { label: "macOS AX" },
              { label: "Chrome DOM" },
              { label: "Workflow engine" },
            ]}
          />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            What the numbers look like
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Three of these come straight from the repo. The fourth comes from
            Terminator&apos;s README claim, which is worth verifying yourself
            (it is the pitch of the project). All of them are checkable: the
            match arm count can be counted by reading{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              server.rs
            </code>
            , the line number is literally the line of the dispatch, and the
            concurrency default is in README line 45.
          </p>
          <MetricsRow
            metrics={[
              { value: 32, label: "Selector-based tools exposed to Claude" },
              { value: 9953, label: "Line of dispatch_tool in server.rs" },
              { value: 10912, label: "Total lines in server.rs" },
              { value: 100, suffix: "x", label: "Target speedup over pixel-loop agents" },
            ]}
          />

          <ProofBanner
            quote="Claude can drive the OS without a screenshot in the inner loop. The selector resolves against the live UIA tree, in-process, at CPU speed."
            source="Terminator MCP agent, crates/terminator-mcp-agent/src/prompt.rs"
            metric="32 tools / 1 MCP call per click"
          />
        </section>

        {/* Anchor fact: the dispatch source */}
        <section id="toolbox" className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            <GradientText variant="teal">dispatch_tool</GradientText>: the 32 tools Claude sees
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the anchor fact for the page. Open{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/src/server.rs
            </code>{" "}
            at line 9953. There is one{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              match tool_name
            </code>{" "}
            block, each arm wires a tool name to an async Rust handler, and
            there are 32 named arms before the wildcard. Below is the shape of
            it, abbreviated so the names line up. Every one of these is what
            Claude can call when Terminator is attached.
          </p>
          <AnimatedCodeBlock
            code={dispatchSource}
            language="rust"
            filename="crates/terminator-mcp-agent/src/server.rs"
            typingSpeed={0}
          />
        </section>

        {/* The system prompt */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The rule the model is told, every session
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Terminator&apos;s system prompt lives in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              src/prompt.rs
            </code>
            . It starts by importing the compile-time tool list via{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              env!(&quot;MCP_TOOLS&quot;)
            </code>{" "}
            (populated by{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              build.rs:31
            </code>
            ) and then it explicitly forbids the model from inventing
            selectors. This is the single most important line in the prompt,
            and the one that keeps Terminator from drifting back into a
            vision-style guess-and-check loop.
          </p>
          <AnimatedCodeBlock
            code={promptRule}
            language="rust"
            filename="crates/terminator-mcp-agent/src/prompt.rs"
            typingSpeed={0}
          />
        </section>

        {/* A concrete toolkit comparison */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Four everyday tasks, both ways
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The easiest way to understand the latency delta is to think about
            what happens step-by-step for tasks a normal agent flow actually
            does.
          </p>
          <ComparisonTable
            productName="Terminator MCP (selector)"
            competitorName="Native computer use (pixel)"
            rows={toolkitRows}
          />
        </section>

        {/* Architectural table */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The architectural contrast
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Same LLM behind both. Different assumptions about where element
            lookup happens and what the model is expected to do with its
            tokens.
          </p>
          <ComparisonTable
            productName="Terminator MCP"
            competitorName="Anthropic computer tool"
            rows={comparisonRows}
          />
        </section>

        {/* Install */}
        <section id="install" className="max-w-4xl mx-auto px-6 py-10 scroll-mt-16">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Install in Claude Code in one command
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The MCP agent ships as a single npm package. Claude Code exposes an{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              mcp add
            </code>{" "}
            helper that wires it up with the right stdio plumbing.
          </p>
          <TerminalOutput title="terminal" lines={installTerminal} />
        </section>

        {/* Step timeline: one click, end to end */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What actually happens when Claude clicks Save
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Trace one click through the whole stack. This is the selector path,
            step by step, with the files you can open yourself.
          </p>
          <StepTimeline
            steps={[
              {
                title: "Claude emits a tool_use for click_element",
                description:
                  "The name field is \"click_element\". The input is { selector: \"role:Button && name:Save\" }. No coordinates. No screenshot attached.",
              },
              {
                title: "MCP host forwards JSON-RPC tools/call over stdio",
                description:
                  "Claude Code, Cursor, or whatever MCP client you use, frames the call as JSON-RPC 2.0 on the stdout pipe of the npx-spawned terminator-mcp-agent process.",
              },
              {
                title: "dispatch_tool matches the name at server.rs:9953",
                description:
                  "The \"click_element\" arm deserialises the arguments into ClickElementArgs and awaits self.click_element(..) under a tokio::select against the request's cancellation token.",
              },
              {
                title: "The selector resolves against the UIA or AX tree",
                description:
                  "On Windows, terminator-rs calls into IUIAutomation. On macOS, AXUIElement. It walks children by role and name until it finds the match, respecting tree_max_depth (default 30).",
              },
              {
                title: "The action fires through the accessibility API",
                description:
                  "invoke() is preferred over click() because it does not require the element to be in the viewport or to have stable bounds. The OS performs the native click event.",
              },
              {
                title: "Terminator captures the UI diff",
                description:
                  "By default, the before/after tree is diffed and a screenshot is saved to executions/. ui_diff_before_after returns what changed, has_ui_changes returns a boolean Claude can check.",
              },
              {
                title: "A CallToolResult returns up the stdio pipe",
                description:
                  "Structured result, captured stderr, timing. Claude sees the diff next turn. No new screenshot was needed to find the button.",
              },
            ]}
          />
        </section>

        {/* Inline CTA */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <InlineCta
            heading="Give Claude the selectors, keep computer use for the rest"
            body="Terminator is MIT-licensed. Install the MCP agent in Claude Code in one command. Keep Anthropic's computer tool for the fully alien UIs (games, canvas apps) where the accessibility tree is empty. Let the tree do the work everywhere else."
            linkText="Read the source on GitHub"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Questions readers actually ask" />

        {/* Related */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="More from the Terminator guides"
            posts={relatedPosts}
          />
        </section>
      </article>
    </div>
  );
}
