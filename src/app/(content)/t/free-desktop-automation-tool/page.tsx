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
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  SequenceDiagram,
  BeforeAfter,
  StepTimeline,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/free-desktop-automation-tool";
const PUBLISHED = "2026-04-24";
const TITLE =
  "A free desktop automation tool whose output format was written for an LLM to read";
const DESCRIPTION =
  "Most free desktop automation tools return element handles, image matches, or XPaths that only make sense to a human scripting the thing. Terminator returns a compact indexed YAML tree like '#1 [Button] Save (bounds: [420,300,80,30], focusable)' and takes that same index back as a click argument. The guide below walks through the exact tree format, the three click modes, and why that loop is what makes a free tool usable by a coding assistant at all.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A compact indexed YAML tree with #N [ROLE] name (bounds, state), a click_element tool that takes that index back, and 35 MCP tools an AI coding assistant can call on its own. MIT, no seat cap.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A free desktop automation tool written for an LLM to read",
    description:
      "The tree format is '#1 [Button] Save (bounds: [420,300,80,30], focusable)', and click_element takes that same index back. That loop is the product.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Free desktop automation tool" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Free desktop automation tool", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes a free desktop automation tool actually usable by an AI coding assistant?",
    a: "The tool has to return a representation of the screen that a language model can read with no extra work. Human-first tools return element handles, image match coordinates, or XPaths that only make sense if you are going to read source docs and debug interactively. An assistant-first tool returns a structured, indexed, named tree where each interactive element has a single identifier the model can pass back to a click or type call. Terminator's get_window_tree returns a compact YAML tree where every clickable element is prefixed with a #N index and tagged with [ROLE] name (bounds, state flags). The same index is then accepted by click_element, type_into_element, invoke_element, and so on. The model reads the tree, picks an index, and fires the next tool call. It does not need to build a selector, parse a screenshot, or retry on pixel mismatch.",
  },
  {
    q: "How does this tree format differ from what Pywinauto, AutoHotkey, or SikuliX return?",
    a: "Pywinauto returns Python object handles that the script has to walk (app.Notepad.Edit). AutoHotkey returns window IDs and control text that you compose into WinActivate and ControlClick commands. SikuliX returns image match objects that you click by pixel. Each of those formats is readable by a human who wrote the automation. None of them are a drop-in input for a language model reasoning turn by turn. Terminator's format is the opposite: #1 [Button] Save (bounds: [420,300,80,30], focusable) is one line the model can reproduce verbatim as the argument to the next tool call. The mapping from index to role, name, bounds, and selector is stored server-side in the MCP agent's index_to_bounds cache, so the model never has to hold state about which window was active.",
  },
  {
    q: "Where exactly does the tree format live in the source?",
    a: "It is defined in crates/terminator-mcp-agent/src/tree_formatter.rs. The function format_tree_as_compact_yaml walks a SerializableUIElement, emits #N [ROLE] name (bounds: [...], additional context) for every element with bounds, and writes - [ROLE] name for elements without bounds. It also returns an index_to_bounds HashMap<u32, (role, name, bounds, selector)>. That map is what click_element looks up when the model passes index: 7 instead of a selector string.",
  },
  {
    q: "What are the three click modes, and why does an assistant need all three?",
    a: "ClickElementArgs in crates/terminator-mcp-agent/src/utils.rs has a determine_mode method that validates exactly one of three patterns: selector mode (process plus a string like 'role:Button|name:Save'), index mode (an integer index from the last get_window_tree call), and coordinate mode (absolute screen x and y). The assistant uses index mode by default because that is the cheapest turn in a conversation: one number, one tool call. Selector mode is for deterministic replay across sessions where the index would change. Coordinate mode is the last resort for things accessibility APIs cannot see, like a canvas-drawn button inside a game or a widget inside a WebGL viewport.",
  },
  {
    q: "How many MCP tools does the agent register, and are they free to use?",
    a: "The Rust implementation in server.rs exposes roughly thirty-five tools via the rmcp tool_router: get_window_tree, click_element, type_into_element, press_key, press_key_global, scroll_element, activate_element, select_option, set_selected, invoke_element, set_value, wait_for_element, validate_element, highlight_element, mouse_drag, capture_screenshot, open_application, navigate_browser, execute_browser_script, run_command, read_file, write_file, edit_file, copy_content, glob_files, grep_files, typecheck_workflow, execute_sequence, ask_user, delay, stop_execution, get_applications_and_windows_list, gemini_computer_use, and a couple of inspect overlays. Every one of them is shipped under the MIT license. The only one that can bill your card is gemini_computer_use because it calls the Google Gemini API with your own key, and it is opt-in.",
  },
  {
    q: "Does Terminator run on macOS and Linux, or just Windows?",
    a: "The core terminator crate has a platforms/ directory with adapters behind a trait. The Windows adapter (platforms/windows/) uses the IUIAutomation COM interface and IUIAutomationCacheRequest for batched tree reads. The macOS adapter uses the AX accessibility API. Linux support is partial and gated on AT-SPI. The same Rust API is re-exported into Node via the terminator-nodejs binding and into Python via terminator-python, so you install once and get the same tree shape everywhere the accessibility API can see the window.",
  },
  {
    q: "What is the quickest way to point an AI assistant at it?",
    a: "One line in your MCP config. For Claude Code or Claude Desktop: 'mcpServers': { 'terminator-mcp-agent': { 'command': 'npx', 'args': ['-y', 'terminator-mcp-agent@latest'] } }. Restart the assistant, and it registers the full tool set. The first call the model usually makes is get_window_tree with a process name like 'notepad'. The response is the indexed YAML tree, and every subsequent click or type references an index from that tree. There is no daemon to install, no license server to talk to, no bot registration step.",
  },
  {
    q: "Why do other free tools struggle when an AI assistant drives them?",
    a: "Because they were designed for a person writing a script once, not for a loop of tool calls made by a model that wakes up fresh on every turn. AutoHotkey expects the script author to know the ControlClass name in advance. SikuliX expects you to have already captured the reference image. Robot Framework expects you to write keywords. Those assumptions hold when a human is at the keyboard. They break the moment the caller is a language model that just received a prompt and has no prior context. Terminator's tree is self-describing: the model reads one YAML block and has everything it needs to act. Nothing has to be prepared ahead of time.",
  },
  {
    q: "Is any of this a paid tier in disguise?",
    a: "No. The terminator crate is on crates.io as terminator-rs, the Node binding is on npm as @mediar-ai/terminator, the Python binding is on PyPI as terminator.py, and the MCP agent is on npm as terminator-mcp-agent. All MIT, no functional gating, no online activation. Mediar (the company that develops it) sells a managed workflow product that uses Terminator underneath; that product is paid, but the underlying library and MCP agent are not.",
  },
];

const toolComparisonRows: ComparisonRow[] = [
  {
    feature: "What the tool returns to the caller",
    competitor: "Element handles, image matches, XPaths, control IDs",
    ours: "Indexed YAML tree (#N [ROLE] name ...)",
  },
  {
    feature: "Designed input shape",
    competitor: "A human writing a script interactively",
    ours: "A language model on a single conversational turn",
  },
  {
    feature: "Click interface",
    competitor: "Selector string or pixel coordinates",
    ours: "Three modes: selector, index, or (x, y)",
  },
  {
    feature: "Cross-process tree",
    competitor: "Usually scoped to one app or driver session",
    ours: "Any running process by name or PID",
  },
  {
    feature: "Selector language",
    competitor: "Tool-specific DSL or object chain",
    ours: "Playwright-style: role:Button|name:Save >> name:OK",
  },
  {
    feature: "Accessibility-first",
    competitor: "Image matching or Win32 messages (mostly)",
    ours: "UIA on Windows, AX on macOS, AT-SPI on Linux",
  },
  {
    feature: "AI assistant install path",
    competitor: "None; they predate the use case",
    ours: "npx -y terminator-mcp-agent@latest",
  },
  {
    feature: "Functional gating",
    competitor: "Seat caps, premium connectors, trial clocks (varies)",
    ours: "MIT, no gating",
  },
];

const remotionCaptions = [
  "The model asks for a window tree.",
  "It gets back indexed YAML.",
  "It picks an index. It fires a click.",
  "No selectors to memorize. No pixels to match.",
  "That loop is what 'free for an AI assistant' looks like.",
];

const treeOutputSnippet = `// Sample output from get_window_tree(process: "notepad")
// format_tree_as_compact_yaml in tree_formatter.rs

#1 [Window] Untitled - Notepad (bounds: [120,60,900,700], focusable)
  - [TitleBar]
  #2 [MenuItem] File (bounds: [132,90,40,24], focusable)
  #3 [MenuItem] Edit (bounds: [176,90,40,24], focusable)
  #4 [MenuItem] View (bounds: [220,90,40,24], focusable)
  #5 [Document] Text Editor (bounds: [120,120,900,600], focusable, value: "hello world")
  - [StatusBar]
    #6 [Text] Ln 1, Col 12 (bounds: [132,720,120,20])
    #7 [Text] 100% (bounds: [900,720,40,20])
    #8 [Text] UTF-8 (bounds: [948,720,60,20])`;

const treeFormatterSnippet = `// crates/terminator-mcp-agent/src/tree_formatter.rs

pub fn format_tree_as_compact_yaml(
    tree: &SerializableUIElement,
    indent: usize,
) -> UiaFormattingResult {
    let mut output = String::new();
    let mut index_to_bounds = HashMap::new();
    let mut next_index = 1u32;
    format_node(tree, indent, &mut output,
                &mut index_to_bounds, &mut next_index);
    UiaFormattingResult {
        formatted: output,
        index_to_bounds, // kept server-side for click_element
    }
}`;

const clickModeSnippet = `// crates/terminator-mcp-agent/src/utils.rs (ClickElementArgs)

pub fn determine_mode(&self) -> Result<ClickMode, String> {
    let has_selector = self.selector.is_some();
    let has_index = self.index.is_some();
    let has_coords = self.x.is_some() && self.y.is_some();

    // Exactly one mode must be specified
    if has_selector { Ok(ClickMode::Selector) }
    else if has_index { Ok(ClickMode::Index) }
    else { Ok(ClickMode::Coordinates) }
}`;

const mcpConfigSnippet = `{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`;

const terminalLines = [
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "[terminator] MCP server listening on stdio", type: "output" as const },
  { text: "[terminator] 35 tools registered", type: "output" as const },
  { text: "[claude] get_window_tree(process: 'notepad')", type: "command" as const },
  { text: "[terminator] UIA cache request completed: 37 elements", type: "output" as const },
  { text: "[terminator] formatted tree: 37 indexed nodes, 8 kB", type: "output" as const },
  { text: "[claude] click_element(index: 5)", type: "command" as const },
  { text: "[terminator] resolved #5 -> Document 'Text Editor' at [120,120,900,600]", type: "output" as const },
  { text: "[claude] type_into_element(index: 5, text: 'hello from claude')", type: "command" as const },
  { text: "[terminator] typed 18 chars into Document", type: "success" as const },
  { text: "[claude] press_key(key: 'ctrl+s')", type: "command" as const },
  { text: "[terminator] Save As dialog detected, new tree requested", type: "output" as const },
];

const flowSteps = [
  { label: "Assistant prompt", detail: "'fill out notepad'" },
  { label: "get_window_tree", detail: "UIA cache read" },
  { label: "Indexed YAML", detail: "#1..#37 with role, name, bounds" },
  { label: "Model reads", detail: "picks #5" },
  { label: "click_element", detail: "index: 5" },
  { label: "UIA click", detail: "bounds center" },
];

const beamFrom = [
  { label: "Claude Code", sublabel: "MCP client" },
  { label: "Cursor", sublabel: "MCP client" },
  { label: "Codex", sublabel: "MCP client" },
  { label: "Windsurf", sublabel: "MCP client" },
];

const beamTo = [
  { label: "UIA (Windows)", sublabel: "IUIAutomationCacheRequest" },
  { label: "AX (macOS)", sublabel: "AXUIElementCopyAttributeValue" },
  { label: "AT-SPI (Linux)", sublabel: "partial support" },
];

const beamHub = {
  label: "terminator-mcp-agent",
  sublabel: "tree formatter + 35 tools",
};

const sequenceMessages: Array<{
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}> = [
  { from: 0, to: 1, label: "get_window_tree(process: 'notepad')", type: "request" },
  { from: 1, to: 2, label: "IUIAutomation::GetRootElement", type: "request" },
  { from: 2, to: 1, label: "cached element tree", type: "response" },
  { from: 1, to: 0, label: "indexed YAML + index_to_bounds stored", type: "response" },
  { from: 0, to: 1, label: "click_element(index: 5)", type: "request" },
  { from: 1, to: 2, label: "IUIAutomationElement::Invoke at #5 bounds", type: "request" },
  { from: 2, to: 1, label: "ok", type: "response" },
  { from: 1, to: 0, label: "status: executed_without_error", type: "response" },
];

const installSteps = [
  {
    title: "Install the MCP agent",
    description:
      "Add one block to your assistant's MCP config that runs 'npx -y terminator-mcp-agent@latest'. No system service, no driver binary, no daemon.",
  },
  {
    title: "Ask the assistant to list windows",
    description:
      "The first thing the model usually does is call get_applications_and_windows_list. That gives it the process names it can then pass to get_window_tree.",
  },
  {
    title: "Let it get the tree",
    description:
      "get_window_tree returns the indexed YAML block. The model reads it on that single turn. The index_to_bounds cache lives on the agent, not the model.",
  },
  {
    title: "Click, type, press, wait",
    description:
      "Every action tool accepts the index it just read. There is no middle translation step. The model converges on the right element by naming an index, not by writing a CSS-like string.",
  },
];

const perceptionCards: BentoCard[] = [
  {
    title: "UIA tree (default)",
    size: "2x1",
    description:
      "Always on. Indexed YAML from IUIAutomationCacheRequest. One round trip, no network, no CPU spike. This is the tree the model reads on every iteration.",
  },
  {
    title: "include_browser_dom",
    size: "1x1",
    description:
      "Adds DOM-level elements from the Terminator Chrome extension. Indexed the same way, so the model's prompt stays the same shape.",
  },
  {
    title: "include_ocr",
    size: "1x1",
    description:
      "Runs Tesseract locally and surfaces OcrWord nodes with their own #N indices. For canvas widgets UIA cannot see.",
  },
  {
    title: "include_omniparser",
    size: "1x1",
    description:
      "Posts the window screenshot to an Omniparser backend (self-host with OMNIPARSER_BACKEND_URL). Bounding boxes come back as indexed nodes.",
  },
  {
    title: "include_gemini_vision",
    size: "1x1",
    description:
      "Opt-in, BYO Gemini API key. Used only when the other tiers miss something. The only tier that can bill your card.",
  },
];

const toolChips: Array<{ name: string; output: string }> = [
  { name: "AutoHotkey", output: "returns window IDs, control text" },
  { name: "AutoIt", output: "returns control handles, pixel color" },
  { name: "SikuliX", output: "returns image match coordinates" },
  { name: "Pywinauto", output: "returns Python object handles" },
  { name: "Robot Framework", output: "returns keyword call results" },
  { name: "Winium", output: "returns WebDriver element IDs" },
  { name: "WinAppDriver", output: "returns Appium element references" },
  { name: "Ui.Vision RPA", output: "returns image recognition matches" },
  { name: "Power Automate Desktop", output: "returns variables in a flow graph" },
  { name: "UiPath Community", output: "returns activity outputs in Studio" },
  { name: "Terminator", output: "returns indexed YAML for the model to read" },
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
            authorRole="Written with AI"
              readingTime="11 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              A free desktop automation tool whose output was{" "}
              <GradientText>written for an LLM to read</GradientText>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Most of the products on a free desktop automation roundup were
              built for a human operator writing a script. They return element
              handles, image matches, control IDs. That output reads fine if a
              person is sitting in front of a REPL. It does not read at all if
              the caller is a language model on a single conversational turn.
              Terminator returns something different: a compact indexed YAML
              tree where every clickable element is prefixed with a <code>#N</code>,
              tagged with <code>[ROLE]</code> and a name, and annotated with bounds
              and state. The same index goes back into <code>click_element</code>,
              <code> type_into_element</code>, and <code>wait_for_element</code> as
              a one-integer argument. That loop is the product.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={5.0}
          ratingCount="MIT, agent-first output format, 35 MCP tools"
          highlights={[
            "Tree output is #1 [ROLE] name (bounds, state) per line, keyed 1..N",
            "click_element has three modes: selector, index, coordinates",
            "One npx command registers the full tool set in any MCP client",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="The loop that makes a free tool usable by an AI assistant"
            subtitle="Indexed tree in, index out, action fires."
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why every other free tool on the list assumes a human
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shortlist repeats itself across every write-up on this subject.
            AutoHotkey, AutoIt, SikuliX, Pywinauto, Robot Framework, Winium,
            WinAppDriver, Ui.Vision, Power Automate Desktop, UiPath Community.
            They are grouped by language binding or by recognition strategy, but
            none of the comparisons pause to ask what the tool actually returns
            to its caller. That matters now because the caller is no longer a
            person opening an editor. It is a coding assistant that received a
            prompt, has to figure out what is on the screen, and then has to
            decide which element to act on. A return value that makes sense to a
            human reading docs does not automatically make sense to a model
            reading a single tool response.
          </p>
          <div className="mt-6">
            <Marquee speed={40} fade pauseOnHover>
              <div className="flex gap-3 pr-3">
                {toolChips.map((t) => (
                  <span
                    key={t.name}
                    className="whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
                  >
                    <span className="font-semibold text-zinc-900">{t.name}</span>
                    <span className="mx-2 text-zinc-400">|</span>
                    <span className="text-zinc-600">{t.output}</span>
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: one function emits the tree, one cache holds the
                mapping, one argument is all the model needs
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                The output format lives in <code>crates/terminator-mcp-agent/src/tree_formatter.rs</code>.
                The function <code>format_tree_as_compact_yaml</code> walks a
                serialized UI element, assigns every element with bounds a
                1-based index, and writes lines of the shape{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  #N [ROLE] name (bounds: [x,y,w,h], focusable, value: ...)
                </code>
                . Elements without bounds get a dash prefix and no index so the
                model never tries to click them. The function also returns an{" "}
                <code>index_to_bounds</code> <code>HashMap</code> that the MCP
                agent keeps server-side. When the model calls <code>click_element</code>{" "}
                with <code>index: 7</code>, the agent resolves it to the stored
                role, name, bounds, and original selector. The index is the
                whole interface.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the tree actually looks like on the wire
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the shape of a minimal Notepad tree the way the MCP agent
            emits it. The indentation encodes containment. The <code>#N</code>{" "}
            is the handle. The role is the structural type. The name is the
            accessible label. Everything in parentheses is context the model
            may or may not need, depending on the task.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={treeOutputSnippet}
              language="yaml"
              filename="get_window_tree response (abridged)"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this is a special debug view. It is the default response
            body of a single MCP tool call. A model seeing this for the first
            time has everything it needs to decide what to do next, in one
            block, without extra context.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The function that writes that tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The formatter is straightforward Rust. It builds the output string,
            assigns the running index, and returns both the formatted text and
            the map used later to resolve an index back to coordinates. The
            interesting part is that the mapping is stored, not thrown away:
            that is how <code>click_element</code> is able to take an integer
            from the model and click the right element without the model ever
            sending bounds or selectors back.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={treeFormatterSnippet}
              language="rust"
              filename="tree_formatter.rs (format_tree_as_compact_yaml)"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The click side is simpler still. Three modes, one check per mode,
            and a validation that exactly one is specified.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={clickModeSnippet}
              language="rust"
              filename="utils.rs (ClickElementArgs::determine_mode)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The loop from prompt to pixel
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is what happens when an assistant receives a request like
            "open Notepad, write hello, save the file." Nothing about the
            sequence below is Notepad-specific; the same six steps run against
            any window the accessibility API can see.
          </p>
          <div className="mt-6">
            <FlowDiagram title="One turn from the model's point of view" steps={flowSteps} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Traditional tool output vs. what an assistant can read
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            To see why the format matters, put a typical free-tool response
            next to the indexed YAML. Both describe the same four buttons. Only
            one of them is usable by a model that has no prior state.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="A human-first dump vs. an agent-first tree"
              before={{
                label: "Typical free-tool output",
                content:
                  "A stream of element handles or image match references. The script author knows what each one is because they wrote the script. A model receiving this cold has no frame of reference.",
                highlights: [
                  "ControlID: 0x0041A, ClassName: Button",
                  "Image match at (420, 300) with confidence 0.87",
                  "UIAutomationElement#0x7ff9e41b2010",
                  "WebDriver session element-ref:c3f9-4a...",
                ],
              }}
              after={{
                label: "Terminator's indexed YAML",
                content:
                  "A single block where every interactive element is a line. The model picks an index from the same block it just read and passes it back as an integer. State lives on the agent.",
                highlights: [
                  "#2 [MenuItem] File (bounds: [132,90,40,24], focusable)",
                  "#3 [MenuItem] Edit (bounds: [176,90,40,24], focusable)",
                  "#5 [Document] Text Editor (bounds: [120,120,900,600], value: ...)",
                  "click_element(index: 5) -> executed_without_error",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The exchange between assistant, agent, and the OS
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three actors, eight messages, one state transition per round trip.
            The MCP agent is what sits between the model and the Windows or
            macOS accessibility API. It is the piece that knows how to read the
            cached tree and how to translate an index back into a coordinate
            click.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="Assistant -> MCP agent -> OS accessibility API"
              actors={["Assistant", "terminator-mcp-agent", "Windows UIA / macOS AX"]}
              messages={sequenceMessages}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The five perception modes, same tree shape every time
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The indexed YAML is the unit of output. What feeds into it can
            change: UIA by default, browser DOM from an optional extension, OCR
            for canvas widgets, OmniParser for icon detection, Gemini for
            last-resort vision. Each one is a boolean flag on the same{" "}
            <code>get_window_tree</code> call, and each one merges its own
            indexed nodes into the tree the model reads.
          </p>
          <div className="mt-6">
            <BentoGrid cards={perceptionCards} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The MCP agent sits between assistants and the OS
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every major AI coding assistant speaks the Model Context Protocol.
            On the other side, every major desktop operating system exposes an
            accessibility API. The agent is the bridge: one piece of code, one
            tree format, one set of tools, regardless of which assistant talks
            to it or which OS it is reading.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="One agent, many assistants, every accessibility API"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The four-step install that exposes the whole loop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is no onboarding flow, no sign-in, no license key. The agent
            is an npx command. The assistant is whatever MCP client you already
            use. The rest is the model reading a tree.
          </p>
          <div className="mt-6">
            <StepTimeline steps={installSteps} />
          </div>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={mcpConfigSnippet}
              language="json"
              filename="claude_desktop_config.json"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What a real session looks like on the stdio
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is one opening of Notepad, one get_window_tree, one click, one
            type, one save. Every line after the npx invocation is a log
            message the agent prints to stderr, so you can watch the loop
            resolve.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="claude_desktop -> terminator-mcp-agent (stderr tail)"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The comparison that belongs on every free-tools list
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            "Free" is a cost attribute. The attribute that matters once an AI
            assistant is the operator is shape of output, not dollars. Here is
            where Terminator lands on each axis a typical roundup leaves blank.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical free desktop automation tool"
            rows={toolComparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The numbers that actually describe the surface
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The whole agent is small. <NumberTicker value={35} /> MCP tools
            registered, <NumberTicker value={3} /> click modes, and{" "}
            <NumberTicker value={5} /> perception tiers that all collapse into
            the same indexed tree. A Notepad window typically produces about{" "}
            <NumberTicker value={37} /> indexed nodes; a Chrome window is an
            order of magnitude larger, but the shape is identical.
          </p>
        </section>

        <section className="mt-14">
          <ProofBanner
            quote="The whole interface between a language model and a desktop app can be one integer. That is what the tree format enables."
            source="tree_formatter.rs + utils.rs, Terminator MCP agent"
            metric="1 index"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why this is the part a roundup never covers
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A free-tools article is graded on whether it mentions the expected
            dozen products. The shape of the return value is outside that grade.
            But once you are installing a desktop automation tool to hand to an
            AI coding assistant rather than to write your own scripts against,
            the return value is the product. An image match is not an interface
            for a model. An element handle is not an interface for a model. An
            XPath is not an interface for a model. An indexed YAML tree with a
            side-table of bounds, retained on the agent, accepting an integer
            back, is. That is the gap this page tries to fill in.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Install with <code>claude mcp add terminator "npx -y terminator-mcp-agent@latest"</code>
            , ask your assistant to open any window, and watch the first
            get_window_tree response scroll by. The format is the point.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Have your assistant read a tree with you on the call"
          description="Bring the app you want automated. We will open a live MCP session, take one get_window_tree snapshot together, and walk through how the model would act on the indices before you write any integration code."
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
        description="See the indexed YAML tree against your own app."
      />
    </>
  );
}
