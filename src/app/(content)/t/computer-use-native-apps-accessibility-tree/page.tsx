import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  MotionSequence,
  BeforeAfter,
  AnimatedChecklist,
  Marquee,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/computer-use-native-apps-accessibility-tree";
const PUBLISHED = "2026-05-15";
const UPDATED = "2026-05-19";
const TITLE =
  "Computer use on native apps: what the accessibility tree actually looks like to the agent";
const SERP_TITLE =
  "Accessibility tree for computer use agents on native apps";
const DESCRIPTION =
  "A computer use agent never sees the raw UIAutomation or AXUIElement tree of a native app. Terminator serializes it into a compact numbered list, #1 [Button] Save (bounds: [...], focused), where every clickable element gets a 1-based index. The agent emits the index, not pixel coordinates. Source: format_node in crates/terminator/src/tree_formatter.rs.";

export const metadata: Metadata = {
  title: SERP_TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The accessibility tree a computer use agent reads on a native app is a numbered text list, not raw UIA. Every element with bounds gets a #index; the agent clicks by number, the framework resolves it.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "What a native app's accessibility tree looks like to a computer use agent",
    description:
      "Not raw UIAutomation. A compact list: #6 [Button] Save (bounds: [1180,8,80,28], focusable). The agent emits #6. The framework resolves the click.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Computer use on native apps via the accessibility tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Computer use on native apps via the accessibility tree",
    url: PAGE_URL,
  },
];

const faqs: FaqItem[] = [
  {
    q: "What does the accessibility tree of a native app look like to a computer use agent?",
    a: "Not the way the operating system stores it. The OS keeps a tree of accessibility elements with dozens of COM or Objective-C properties each. A computer use agent reads a flattened, compact version. Terminator's format_node function in crates/terminator/src/tree_formatter.rs walks the tree and writes one line per element: an indent for depth, a clickable index, the role in brackets, the accessible name, and a parenthesised context list of bounds and state flags. A whole Calculator window collapses to roughly a dozen short lines of text. That is what reaches the model, not the raw UIAutomation or AXUIElement objects.",
  },
  {
    q: "Why does the agent emit an index instead of pixel coordinates?",
    a: "Because pixels are a moving target and an index is not. The same Save button lands at different screen coordinates depending on DPI scale, window position, theme, and resolution. A model that outputs (x, y) has to re-solve that regression on every screen. Terminator's serializer assigns every element that has bounds a stable 1-based index and stores index to (role, name, bounds, selector) in a HashMap called index_to_bounds. The agent reads the list, emits the number, and the click_element tool in Mode 2 (index plus vision_type ui_tree) looks the number up and performs the click. The model never has to know a coordinate exists.",
  },
  {
    q: "Is the tree the same on Windows and macOS?",
    a: "The source APIs differ. Windows exposes UIAutomation (IUIAutomationElement), macOS exposes the Accessibility API (AXUIElement), Linux exposes AT-SPI2. Terminator has a separate adapter per platform that walks the native tree. Above those adapters the shape is normalized: every node becomes a role, a name, optional bounds, optional state flags, and a selector. So the compact list a computer use agent receives looks the same whether the native app is Notepad on Windows or TextEdit on macOS. The platform-specific quirks stay inside the adapter.",
  },
  {
    q: "How is the accessibility tree different from the browser DOM?",
    a: "The DOM only describes one web page inside one browser tab. The accessibility tree describes every window of every running application: native Win32 and AppKit apps, Office, Electron shells, and the browser itself. A browser also publishes an accessibility tree, built from the DOM plus ARIA, so a computer use agent that targets the OS tree can drive a web page and a native settings dialog with the same code path. That is the point of using the tree rather than the DOM: it does not stop at the edge of the browser window.",
  },
  {
    q: "What happens to an element that has no bounds?",
    a: "It still appears in the list, but it gets a dash prefix instead of an index. In format_node, an element with a bounds rectangle is written as #{index} [Role] name, and an element without bounds is written as - [Role] name. The dash elements are containers, layout groups, and offscreen nodes the agent should not try to click. They stay in the tree because they carry structure and labels the model uses to reason about what is on screen, but only the indexed elements are valid click targets.",
  },
  {
    q: "Which tool actually performs the click after the model picks an index?",
    a: "click_element. It has three modes documented in crates/terminator-mcp-agent/src/server.rs. Mode 1 is Selector: pass a process and a selector string like role:Button|name:Save. Mode 2 is Index: pass the number from a previous get_window_tree response plus vision_type ui_tree. Mode 3 is Coordinates: raw x and y, the escape hatch. For accessibility-tree-driven computer use, Mode 2 is the normal path. The index resolves through index_to_bounds back to the real element and the framework drives the click through the platform's invoke pattern.",
  },
  {
    q: "Do Electron apps show up in the accessibility tree?",
    a: "Partly, and it depends on the app. Electron wraps a Chromium renderer, and Chromium only publishes its internal accessibility tree when accessibility is enabled in the process. Some Electron apps expose a rich tree, some expose only the outer window frame until you trigger the accessibility flag. When the tree is thin, a computer use agent needs a fallback grounding source. Terminator handles this by letting click_element resolve indexes against OCR, Omniparser, Gemini vision, or the browser DOM in addition to the UIA tree, so a missing subtree does not stop the agent.",
  },
  {
    q: "Can a small or local model handle the accessibility tree?",
    a: "Yes, and that is one of the real advantages of the tree over screenshots. A focused window serializes to a few thousand tokens of structured text, well inside the context of a 1B-parameter model, whereas the same window as a screenshot costs many thousands of visual tokens that small models cannot reason over. Terminator ships a four-file example that drives native apps with gemma3:1b over a local Ollama endpoint. The walkthrough is in our guide on running a local model on native apps through the accessibility tree.",
  },
  {
    q: "How many tokens does a native app window cost as an accessibility tree versus a screenshot?",
    a: "Order of magnitude difference. A focused Calculator or Settings pane serializes to a few hundred to a few thousand tokens of plain text. The same window encoded as a screenshot for a vision model usually costs several thousand visual tokens for the image tiles plus another budget for the prompt that explains what the model is looking at. Run a ten-step task and the screenshot path accumulates tens of thousands of tokens that the tree path does not spend. The smaller the window relative to the screen, the larger the gap. Cost compounds the same way as latency, because the tree round-trips through accessibility APIs in milliseconds while a screenshot has to be captured, encoded, and uploaded.",
  },
  {
    q: "Do production computer use agents use the accessibility tree, screenshots, or both?",
    a: "Both, and the split is moving toward tree-first. Anthropic's computer use tool in its first releases leaned on screenshots and pixel coordinates for native apps. Google's Gemini computer use surface added DOM, accessibility tree, and browser-native events as grounding sources in addition to vision. The pragmatic stack on the desktop in 2026 is: accessibility tree as the default grounding because it is fast, structured, cheap, and gives stable element handles, with a vision source (OCR, Omniparser, or a multimodal model) as the fallback for the surfaces where the tree is empty. Terminator's click_element exposes that fallback chain through a single tool, so the agent does not have to switch modalities by hand.",
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

const compactTreeExample = `# get_window_tree on the focused Calculator process
# returns this, not the raw UIAutomation objects:

#1 [Window] Calculator (bounds: [760,300,322,500], focused)
  #2 [Group] Number pad (bounds: [760,540,322,260])
    #3 [Button] Seven (bounds: [760,540,107,65], focusable)
    #4 [Button] Eight (bounds: [867,540,107,65], focusable)
    #5 [Button] Nine  (bounds: [974,540,107,65], focusable)
  #6 [Text] Display is 0 (bounds: [760,460,322,80])
  #7 [Button] Equals (bounds: [974,735,107,65], focusable)
  - [Text] Calculator mode: Standard`;

const singleNode = `#6 [Button] Save (bounds: [1180,8,80,28], focusable, disabled)

  #6          1-based clickable index. This is what the agent emits.
  [Button]    role. Button, Edit, MenuItem, CheckBox, ComboBox, ...
  Save        name. The accessible label the OS already exposes.
  bounds      [x, y, width, height] in screen pixels. Present = clickable.
  focusable   state flags: focusable, focused, disabled, selected, toggled.`;

const docComment = `/// Format a UI tree as compact YAML with #index [ROLE] name format
///
/// Output format:
///   #1 [ROLE] name (bounds: [x,y,w,h], additional context)
///     #2 [ROLE] name (bounds: [x,y,w,h])
///       - ...
///
/// Elements with bounds get a clickable index first.
/// Elements without bounds use a dash prefix.`;

const sequenceFrames = [
  {
    title: "1. The OS tree",
    body: "The native accessibility API holds a deep tree. Every element carries dozens of properties: control type, runtime id, bounding rectangle, pattern support, automation id. Useful for a screen reader, far too verbose for a model's context window.",
    visual: (
      <div className="font-mono text-xs text-zinc-500 leading-relaxed">
        AXUIElement / IUIAutomationElement
        <br />
        ├─ role, name, value, description
        <br />
        ├─ BoundingRectangle, RuntimeId
        <br />
        ├─ IsEnabled, IsKeyboardFocusable, ...
        <br />
        └─ 40+ properties per node, deeply nested
      </div>
    ),
  },
  {
    title: "2. format_node walks it",
    body: "Terminator's serializer recurses the tree once. For each element it writes a single line: indent for depth, an index if the element has bounds, the role, the name, and a short context list. Everything the model cannot act on is dropped.",
    visual: (
      <div className="font-mono text-xs text-orange-700 leading-relaxed">
        crates/terminator/src/tree_formatter.rs
        <br />
        fn format_node(node, indent, output, ...)
        <br />
        → one text line per element
      </div>
    ),
  },
  {
    title: "3. A numbered list",
    body: "The output is compact text. Indexed elements are clickable. Dash elements are structure. A whole window is a few thousand tokens, small enough that even a 1B local model has room to reason over it.",
    visual: (
      <div className="font-mono text-xs text-zinc-700 leading-relaxed">
        #1 [Window] Calculator (focused)
        <br />
        &nbsp;&nbsp;#3 [Button] Seven (focusable)
        <br />
        &nbsp;&nbsp;#7 [Button] Equals (focusable)
        <br />
        &nbsp;&nbsp;- [Text] Calculator mode: Standard
      </div>
    ),
  },
  {
    title: "4. The agent acts by number",
    body: "The model reads the list and replies with an index, say #7. click_element in index mode looks #7 up in the index_to_bounds map, recovers the real element, and performs the click. The model never produced a pixel coordinate.",
    visual: (
      <div className="font-mono text-xs text-zinc-700 leading-relaxed">
        model: click_element(index: 7,
        <br />
        &nbsp;&nbsp;vision_type: &quot;ui_tree&quot;)
        <br />
        framework: #7 → (Button, Equals, bounds, selector)
        <br />
        <span className="text-orange-700">→ click performed</span>
      </div>
    ),
  },
];

const nativeApps = [
  "Notepad",
  "Calculator",
  "File Explorer",
  "Outlook",
  "Excel",
  "Word",
  "Settings",
  "Task Manager",
  "TextEdit",
  "Finder",
  "System Settings",
  "Chrome",
  "VS Code",
  "Slack",
  "Spotify",
];

const treeFitItems = [
  {
    text: "Native Win32, WinUI, UWP, AppKit and Office apps: rich tree, indexed elements line up with what you see.",
    checked: true,
  },
  {
    text: "A web page inside a browser: the browser publishes its own accessibility tree, so the same code path works.",
    checked: true,
  },
  {
    text: "Electron apps: the tree exists but can be thin until Chromium accessibility is enabled in the process.",
    checked: false,
  },
  {
    text: "Office document canvas: cells, shapes and paragraphs render inside one element with no AX children.",
    checked: false,
  },
  {
    text: "Games, DirectX or OpenGL surfaces, canvas design tools: the tree is a single opaque node, fall back to vision.",
    checked: false,
  },
  {
    text: "Remote desktop and VM viewer windows: the accessibility bridge does not cross the host boundary.",
    checked: false,
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Accessibility API for computer use agents: the seven-mode click_element router",
    excerpt:
      "When the accessibility tree is silent, the agent falls through to OCR, Omniparser, Gemini vision, or the browser DOM. One click tool, seven grounding paths.",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Grounding",
  },
  {
    title:
      "Local AI on native apps: a 1B model drives the desktop because the tree is text",
    excerpt:
      "The compact tree is small enough for gemma3:1b. A four-file Rust example wires the accessibility tree into a local Ollama endpoint with zero network egress.",
    href: "/t/local-ai-accessibility-tree-native-apps",
    tag: "Local AI",
  },
  {
    title:
      "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "A tree-based click invokes the element directly and bypasses synthetic HID input. Why that matters for reliability, line by line in the source.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Tree vs pixels",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-4">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-3xl md:text-5xl font-bold tracking-tight leading-[1.08] text-zinc-900">
            Computer use on native apps: what the accessibility tree{" "}
            <span className="text-orange-600">
              actually looks like to the agent
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
            If you landed here from a thread about computer use agents, here is
            the part the screenshots-versus-tree debate skips. A computer use
            agent never touches the raw operating system tree. It reads a
            flattened, numbered text list. Every element it can click has a
            number, and the agent acts by emitting the number. No pixel
            coordinates. This page shows you exactly what that list looks like.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["UIAutomation", "AXUIElement", "get_window_tree", "MCP", "Rust"].map(
              (chip) => (
                <span
                  key={chip}
                  className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-15)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">
                A computer use agent controls a native app by reading the
                operating system&apos;s accessibility tree, not its pixels.
              </strong>{" "}
              Windows exposes that tree through UIAutomation, macOS through
              AXUIElement, Linux through AT-SPI2. The agent does not see the raw
              tree. A framework like Terminator serializes it into a compact
              numbered list where each clickable element has a 1-based index.
              The agent picks an index or a selector, and the framework resolves
              it to a real click, so the model never emits a screen coordinate.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Verifiable in the source: the{" "}
              <code className="font-mono text-[0.95em]">format_node</code>{" "}
              function in{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/tree_formatter.rs"
                className="text-orange-700 underline underline-offset-2"
              >
                crates/terminator-mcp-agent/src/tree_formatter.rs
              </a>{" "}
              writes one line per element and maps every index back to a real
              UI element.
            </p>
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What the agent actually receives
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most write-ups describe the accessibility tree in the abstract:
            structured metadata, element types, labels, parent-child links. All
            true, and none of it tells you what arrives in the model&apos;s
            context. Here is the concrete answer. When Terminator&apos;s{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_window_tree
            </code>{" "}
            tool runs on a focused native app, the response is this:
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.82rem] font-mono leading-relaxed text-zinc-800">
            <code>{compactTreeExample}</code>
          </pre>

          <p className="mt-5 text-zinc-700 leading-relaxed">
            That is the whole Calculator window. Indentation is tree depth.
            Lines that start with{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #
            </code>{" "}
            are clickable: they have a bounding rectangle and a stable index.
            Lines that start with a dash are structure, containers and labels
            the agent reads for context but should not try to click. A model
            does not need a screenshot to know there is a Seven button at index
            3. It is right there as text.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            From a 40-property tree to a one-line element
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The operating system tree is built for screen readers, so it is
            exhaustive. The serializer&apos;s job is to throw away everything a
            model cannot act on and keep the four things it can: where the
            element is, what kind it is, what it is called, and what state it is
            in. Watch the transformation.
          </p>

          <MotionSequence
            title="get_window_tree, step by step"
            frames={sequenceFrames}
            defaultDuration={3200}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The index is the whole trick
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the part that does not show up in the usual explanations,
            and it is the reason an accessibility-tree agent is steadier than a
            screenshot agent. A vision-only computer use agent has to output a
            coordinate. To click Save it recognizes the button in the pixels,
            estimates its center, and emits something like{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              (1218, 22)
            </code>
            . That number is wrong the moment the window moves, the DPI scale
            changes, or the theme shifts.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator removes coordinates from the model&apos;s job entirely.
            When{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              format_node
            </code>{" "}
            assigns an element a{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #index
            </code>
            , it also stores that index in a map called{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              index_to_bounds
            </code>
            , keyed by the number, valued by the element&apos;s role, name,
            bounds, and selector. The model reads the list, picks{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #7
            </code>
            , and calls{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click_element
            </code>{" "}
            in index mode. The framework looks 7 up, recovers the real element,
            and drives the click through the platform&apos;s native invoke path.
            The model produced an integer. It never needed to know a coordinate
            exists.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.82rem] font-mono leading-relaxed text-zinc-800">
            <code>{docComment}</code>
          </pre>

          <p className="mt-5 text-zinc-700 leading-relaxed">
            That doc comment sits directly above{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              format_tree_as_compact_yaml
            </code>{" "}
            in the source. The index is not a presentation detail. It is the
            contract between the model and the framework. The deeper version of
            this idea, where the same indexed list also covers OCR and vision
            sources, is in the{" "}
            <a
              href="/t/accessibility-api-computer-use-agents"
              className="text-orange-700 underline underline-offset-2"
            >
              seven-mode click_element router
            </a>{" "}
            guide.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Reading one node
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every indexed line follows the same grammar. Once you can read one,
            you can read the whole window.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.82rem] font-mono leading-relaxed text-zinc-800">
            <code>{singleNode}</code>
          </pre>

          <p className="mt-5 text-zinc-700 leading-relaxed">
            The presence of a{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              bounds
            </code>{" "}
            rectangle is what decides whether an element gets an index at all.
            An element with bounds is on screen and clickable, so it earns a{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #index
            </code>
            . An element without bounds gets a dash. State flags such as{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              disabled
            </code>
            ,{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              focused
            </code>
            ,{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              selected
            </code>{" "}
            and{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              toggled
            </code>{" "}
            are appended only when they are true, which keeps each line short.
            A model can answer &quot;is the checkbox already on?&quot; without a
            screenshot because the word{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              toggled
            </code>{" "}
            either is or is not on the line.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The same window, two ways a model can see it
          </h2>

          <BeforeAfter
            title="Raw accessibility element vs the serialized line"
            before={{
              label: "Raw UIAutomation element",
              content:
                "The operating system hands you an IUIAutomationElement (or an AXUIElement on macOS). One node carries a control type id, a runtime id, a bounding rectangle struct, a process id, an automation id, a class name, localized control type strings, and a list of supported patterns: Invoke, Toggle, Value, SelectionItem, ExpandCollapse. Multiply that by a few hundred nodes per window. Sending it to a model is impossible and pointless: most of those fields are plumbing the model cannot use.",
              highlights: [
                "40-plus properties per node, COM or Objective-C objects",
                "deeply nested, hundreds of nodes per real window",
                "far too large for a model context window",
                "most fields are plumbing, not decision-relevant",
              ],
            }}
            after={{
              label: "format_node serialized line",
              content:
                "The same Save button becomes one line: #6 [Button] Save (bounds: [1180,8,80,28], focusable). Index, role, name, bounds, the state flags that happen to be true. Nothing else. A whole window of these lines is a few thousand tokens of plain text. The model reads it the way it reads any structured document, and it answers with an index, which the framework turns back into a real click.",
              highlights: [
                "one line per element, four facts the model can act on",
                "a full window is a few thousand text tokens",
                "small and local models can read it, not just frontier ones",
                "the index round-trips back to the real element",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why this matters for native apps specifically
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Browser automation has the DOM. It is structured, queryable, and
            stable, which is why Playwright works as well as it does. Step
            outside the browser and that structure disappears. A native app has
            no DOM. What it has is the accessibility tree, the one structured
            description of its UI the operating system already maintains for
            screen readers. A computer use agent that reads the tree gets a
            DOM-like target for Notepad, Outlook, the Settings app, and a legacy
            line-of-business tool, all through one interface.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            And because the browser itself publishes an accessibility tree, the
            same agent code reaches into a web page when it needs to. The tree
            does not stop at the browser window the way the DOM does. Terminator
            is shaped like Playwright on purpose, but the surface it targets is
            the whole operating system rather than one tab.
          </p>

          <div className="mt-8">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
              Native surfaces the tree covers
            </p>
            <Marquee speed={32} fade pauseOnHover>
              <div className="flex gap-3 pr-3">
                {nativeApps.map((app) => (
                  <span
                    key={app}
                    className="whitespace-nowrap text-sm font-mono px-4 py-2 rounded-xl border border-zinc-200 bg-white text-zinc-700"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Where the tree is honest about its limits
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The accessibility tree is the right primary input for native apps,
            but it is not complete. Some surfaces render their content as pixels
            with no accessible structure underneath. An agent built only on the
            tree will hit those surfaces and stop. A production agent keeps the
            tree as the default and falls through to a vision source when the
            tree returns nothing useful.
          </p>

          <AnimatedChecklist
            title="Tree coverage by surface"
            items={treeFitItems}
          />

          <p className="mt-5 text-zinc-700 leading-relaxed">
            The honest framing is not &quot;tree or vision&quot;. It is tree
            first because it is fast, structured, and cheap on tokens, then
            vision second for the surfaces above where the tree is a single
            opaque node. Terminator wires both behind the same{" "}
            <code className="font-mono text-[0.9em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              click_element
            </code>{" "}
            tool so the agent does not have to switch interfaces when it crosses
            that boundary.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building a computer use agent for native apps?"
          description="If you are wiring an accessibility-tree pipeline into an agent and want to compare notes on serialization, the index contract, or vision fallbacks, grab a slot."
        />

        <div className="max-w-3xl mx-auto px-6">
          <FaqSection items={faqs} />
        </div>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Related guides"
            subtitle="More on the accessibility tree as a computer use surface"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Driving native apps through the accessibility tree? Walk the pipeline with us."
      />
    </>
  );
}
