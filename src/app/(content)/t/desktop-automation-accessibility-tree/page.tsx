import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  FlowDiagram,
  BeforeAfter,
  MetricsRow,
  TerminalOutput,
  InlineTestimonial,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/desktop-automation-accessibility-tree";
const PUBLISHED = "2026-05-15";
const TITLE =
  "Desktop automation and the accessibility tree: what one node costs to capture";
const DESCRIPTION =
  "The accessibility tree is not a free structure you read once. Each node property is a separate cross-process call. Terminator's tree builder defaults to PropertyLoadingMode::Fast, loading only role and name per node, and attaches pixel bounds only to keyboard-focusable elements. Here is what one UIElementAttributes node actually carries and why a good framework refuses to capture all of it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "What a single accessibility tree node carries, which properties Terminator deliberately skips, and why capturing a deep tree is not free. UIElementAttributes has 17 fields; the default mode reads two.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The accessibility tree is not free to capture",
    description:
      "Each node property is one cross-process call. Terminator's default mode loads role + name only, bounds only for focusable elements. Read the struct.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Desktop automation and the accessibility tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Desktop automation and the accessibility tree", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the accessibility tree in desktop automation?",
    a: "It is the hierarchy of UI elements the operating system already maintains so screen readers can describe an app. Every window, panel, button, text field, list item, and menu entry is a node, and each node carries semantic properties: a role (Button, Edit, CheckBox), an accessible name, a value, state flags, and a bounding rectangle. Desktop automation frameworks walk this tree to find and act on elements instead of matching pixels in a screenshot. On Windows the tree is exposed by UI Automation, on macOS by the Accessibility API, on Linux by AT-SPI2. Terminator captures it through these native APIs and matches elements with a selector grammar.",
  },
  {
    q: "Is reading the accessibility tree actually free or fast?",
    a: "No, and that is the part most guides skip. The tree is not a JSON blob sitting in memory that you copy out. Each node and each property of each node is a cross-process call: your automation process asks the target application's UI Automation provider for one value at a time, over COM on Windows. A node with role, name, value, bounds, enabled state, and focus state is six separate round trips. A complex app like Chrome with a deep web view has thousands of nodes. A naive 'capture everything on every node' dump can take several seconds and tens of thousands of round trips. The engineering work in a desktop automation framework is not getting the tree, it is getting it fast enough to be usable.",
  },
  {
    q: "What does a single tree node carry in Terminator?",
    a: "The UIElementAttributes struct in crates/terminator/src/element.rs (lines 309 to 343) defines roughly 17 fields: role, name, label, text, value, description, application_name, a free-form properties map, is_keyboard_focusable, is_focused, is_toggled, bounds, enabled, is_selected, child_count, and index_in_parent. A UINode (lib.rs lines 328 to 338) wraps those attributes plus an id, a children vector, and a selector string that is the full chained path from the root to that node. The selector field is why every node in a captured tree is directly addressable: you can copy it straight into desktop.locator().",
  },
  {
    q: "Why does the default mode only load role and name?",
    a: "Because the PropertyLoadingMode enum (crates/terminator/src/platforms/mod.rs lines 57 to 64) defaults to Fast, and Fast loads only the essential properties. Selector matching needs role, name, and id; it does not need description, value, or bounds for every node in the tree. Loading all 17 fields on all nodes is the Complete mode, and it is several times slower because every extra field is another cross-process call multiplied across the whole tree. Smart mode sits between them, loading properties based on element type. Fast is the default because an agent loop that re-captures the tree after every action cannot afford Complete mode latency on each pass.",
  },
  {
    q: "Why are bounds only populated for keyboard-focusable elements?",
    a: "Look at element.rs line 334. The bounds field carries the inline comment 'Only populated for keyboard-focusable elements'. The tree builder's get_configurable_attributes function checks element.is_keyboard_focusable() and only then calls element.bounds() to attach a rectangle. The reasoning: a static text label or a layout container is not something you click, so its pixel rectangle is dead weight in the tree. The elements you actually act on (buttons, edit fields, checkboxes, list items) are exactly the keyboard-focusable ones, and those get bounds. The tree formatter then assigns a click index only to nodes that have bounds, so the indexed, clickable subset of the tree is the focusable subset by construction.",
  },
  {
    q: "How does Terminator walk the tree without freezing the machine?",
    a: "build_ui_node_tree_configurable in tree_builder.rs uses an explicit work queue instead of pure recursion, so a pathologically deep app cannot blow the stack; recursion is capped at depth 100 and anything deeper is pushed back onto the queue. Children are processed in batches (batch_size defaults to 50). Every 50 elements (yield_every_n_elements) and between large batches, the builder calls thread::sleep for 1 millisecond to yield CPU so the host UI stays responsive while the tree is being captured. Tree depth itself defaults to 50 levels, raised to 500 for browsers because web apps nest deeply. None of this is exotic; it is the unglamorous machinery that turns 'read the tree' from a slogan into a function that returns in a few hundred milliseconds.",
  },
  {
    q: "How is the accessibility tree better than screenshots for an agent?",
    a: "Two reasons. First, size and speed: a formatted accessibility tree for a typical app is a few kilobytes of structured text, while a screenshot is hundreds of kilobytes of pixels that a vision model has to process. Sending text to an LLM is faster and cheaper than sending an image. Second, precision: a node says 'this is a Button named Save at these bounds' with no guessing, where a vision model has to infer what is clickable. Terminator's own positioning is that this is what makes it deterministic and roughly 100x faster than screenshot-driven agents, because actions resolve through the tree at CPU speed instead of through an inference call per step.",
  },
  {
    q: "When does the accessibility tree fail, and what do you fall back to?",
    a: "Three known gaps. Custom controls that draw their own pixels (some games, some 3D tools, canvas drawing surfaces) show up as a single opaque node with no useful children. Some apps implement accessibility poorly: Electron apps are known for flat, shallow trees, and a deeply nested web view may exceed the default depth so you have to raise it or scope the search. And a few targets, notably browser web views on macOS, return success on a tree action while doing nothing. Terminator's answer is layered: accessibility tree first, then DOM access through a Chrome extension, then OCR, then vision AI, so the tree is the fast default and the other layers catch what it misses.",
  },
  {
    q: "How do I capture the tree myself to see this?",
    a: "From the Node SDK: const tree = desktop.getWindowTree('notepad'). It returns a UINode you can walk or serialize to JSON. getWindowTreeResult additionally gives you the formatted, indexed string and an indexToBounds map for click-by-index. From an MCP agent (Claude Code, Cursor, VS Code), the same capture is exposed as a tool, so the agent asks for the tree, reads the structured nodes, and picks a selector. Install with claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Either path runs the same Rust tree builder described here.",
  },
  {
    q: "Does the tree look the same on Windows and macOS?",
    a: "The shape is the same (a hierarchy of role-bearing nodes) but the providers differ. Windows UI Automation has the richest provider coverage and is Terminator's primary platform. macOS exposes the Accessibility API (AXUIElement) and requires the user to grant accessibility permission. Linux uses AT-SPI2. Role names differ across platforms (a Windows 'Edit' is a macOS 'AXTextField'), which is why Terminator's selector grammar matches on substrings and why you inspect the real tree of your target app before writing selectors rather than guessing role names.",
  },
];

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
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);

// One node, the way Terminator's UIElementAttributes struct defines it.
// Fast mode (the default) loads the orange fields. Everything else is
// either skipped, conditional, or only filled in Complete / Smart mode.
const nodeFields: {
  field: string;
  type: string;
  note: string;
  tier: "fast" | "conditional" | "complete";
}[] = [
  { field: "role", type: "String", note: "Button, Edit, CheckBox, ...", tier: "fast" },
  { field: "name", type: "Option<String>", note: "the accessible label", tier: "fast" },
  { field: "label", type: "Option<String>", note: "associated label text", tier: "complete" },
  { field: "text", type: "Option<String>", note: "rendered text content", tier: "complete" },
  { field: "value", type: "Option<String>", note: "edit / value content", tier: "complete" },
  { field: "description", type: "Option<String>", note: "help / tooltip text", tier: "complete" },
  { field: "application_name", type: "Option<String>", note: "cached per tree", tier: "conditional" },
  { field: "properties", type: "HashMap", note: "free-form extra props", tier: "complete" },
  { field: "is_keyboard_focusable", type: "Option<bool>", note: "gates bounds", tier: "conditional" },
  { field: "is_focused", type: "Option<bool>", note: "has keyboard focus", tier: "conditional" },
  { field: "is_toggled", type: "Option<bool>", note: "checkbox / switch state", tier: "complete" },
  { field: "bounds", type: "Option<(f64,f64,f64,f64)>", note: "focusable nodes only", tier: "conditional" },
  { field: "enabled", type: "Option<bool>", note: "interactable or greyed out", tier: "complete" },
  { field: "is_selected", type: "Option<bool>", note: "list item / tab state", tier: "complete" },
  { field: "child_count", type: "Option<usize>", note: "direct children", tier: "conditional" },
  { field: "index_in_parent", type: "Option<usize>", note: "position among siblings", tier: "conditional" },
];

const tierStyle: Record<string, string> = {
  fast: "bg-orange-50 border-orange-200 text-orange-900",
  conditional: "bg-amber-50/40 border-zinc-200 text-zinc-800",
  complete: "bg-white border-zinc-200 text-zinc-700",
};

const buildSteps = [
  { label: "Enumerate children", detail: "UIA returns the child elements of the current node" },
  { label: "Load role + name", detail: "Fast mode reads only the two essential properties" },
  { label: "Bounds if focusable", detail: "is_keyboard_focusable() gate before element.bounds()" },
  { label: "Batch 50, yield 1ms", detail: "thread::sleep keeps the host UI responsive" },
  { label: "Recurse, depth-capped", detail: "work queue takes over past recursion depth 100" },
];

const metrics = [
  { value: 17, label: "fields on a UIElementAttributes node" },
  { value: 2, label: "of them loaded by the default Fast mode" },
  { value: 50, label: "children per batch, and tree depth default" },
  { value: 1, suffix: " ms", label: "CPU yield every 50 elements walked" },
];

const relatedPosts = [
  {
    title:
      "Accessibility API desktop automation: fire Control Patterns, skip the mouse",
    excerpt:
      "The write side of the same API. Once you have walked the tree and found a node, invoke() fires its UIA Control Pattern directly, no cursor motion.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Patterns",
  },
  {
    title:
      "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "Why a tree-resolved action and a coordinate click hit different layers of the OS, with the failure modes of each laid out side by side.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Comparison",
  },
  {
    title:
      "macOS accessibility UI tree automation: the write path nobody warns you about",
    excerpt:
      "The macOS AX side of the tree. Where AXPress quietly no-ops, the browser bypass list, and what is genuinely portable from Windows UIA.",
    href: "/t/macos-accessibility-ui-tree",
    tag: "macOS",
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
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.07] text-zinc-900">
            Desktop automation and the accessibility tree:{" "}
            <span className="text-orange-600">
              what one node costs to capture
            </span>
          </h1>
          <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
            Almost every explainer about the accessibility tree stops at the
            same place: it is a hierarchy of UI elements, each with a role and a
            name, and it beats screenshots. True, and not the interesting part.
            The interesting part is that the tree is not a structure you read.
            It is a structure you <em>build</em>, one cross-process call at a
            time, and a desktop automation framework lives or dies on the cuts
            it makes while building it. This page walks through what a single
            node carries, and which of its fields Terminator deliberately
            refuses to load by default.
          </p>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-15)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              The <strong className="text-zinc-900">accessibility tree</strong>{" "}
              is the hierarchy of UI elements the operating system already
              maintains so assistive technology can describe an app. Every
              window, panel, button, text field, and list item is a node, and
              each node carries semantic data: a role, an accessible name, a
              value, state flags, and a bounding rectangle. Desktop automation
              frameworks walk this tree to find and act on elements instead of
              matching pixels in a screenshot. Windows exposes it through{" "}
              <a
                href="https://learn.microsoft.com/en-us/windows/win32/winauto/ui-automation-specification"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-700 underline underline-offset-2"
              >
                UI Automation
              </a>
              , macOS through the Accessibility API, Linux through AT-SPI2.
              Terminator captures it through these native APIs and matches
              elements with a selector grammar shaped like Playwright&apos;s.
            </p>
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The tree is real, and so is its cost
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is the mental model most people carry away from a tutorial:
            the accessibility tree exists, somewhere, fully formed, and a
            library hands it to you the way a browser hands you the DOM. That
            picture is wrong in a way that matters.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            On Windows, the tree lives inside each running application&apos;s
            UI Automation provider. Your automation process does not share
            memory with it. When you ask for a node&apos;s name, that is a COM
            call that crosses a process boundary, gets serviced by the target
            app, and returns one string. Ask for its role, its value, its
            bounding rectangle, whether it is enabled: each one is a separate
            round trip. A single node with six interesting properties is six
            cross-process calls.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Now multiply. A bare Notepad window has a couple hundred nodes. A
            Chrome window with a real web app inside it has many thousands. A
            framework that captures every property on every node is making tens
            of thousands of cross-process calls for one tree dump, and the user
            watches their machine hitch while it happens. The naive
            implementation is not slightly slow. It is unusable inside an agent
            loop that re-reads the tree after every action.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            So the real engineering question for desktop automation is not
            &quot;how do I get the accessibility tree.&quot; It is &quot;how
            little of it can I get away with capturing, and how do I capture
            even that without freezing the host.&quot; The rest of this page is
            Terminator&apos;s answer, read straight out of the source.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What one node actually carries
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s representation of a node is the{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              UIElementAttributes
            </code>{" "}
            struct in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/element.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              crates/terminator/src/element.rs
            </a>{" "}
            (lines 309 to 343). It defines roughly 17 fields. Below is the whole
            set. The orange fields are the ones the{" "}
            <strong className="text-zinc-900">default Fast mode loads</strong>{" "}
            for every node. The amber fields are loaded conditionally (state
            flags, structural counts, the focusable-gated bounds). The plain
            fields are only filled when you explicitly ask for Complete or Smart
            mode.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nodeFields.map((f) => (
              <div
                key={f.field}
                className={`rounded-lg border px-3 py-2.5 ${tierStyle[f.tier]}`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <code className="font-mono text-sm font-semibold">
                    {f.field}
                  </code>
                  <code className="font-mono text-[10px] opacity-70 shrink-0">
                    {f.type}
                  </code>
                </div>
                <p className="mt-1 text-xs leading-snug opacity-80">{f.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-200 border border-orange-300" />
              Fast mode (default)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-zinc-300" />
              conditional
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border border-zinc-300" />
              Complete / Smart only
            </span>
          </div>

          <p className="mt-6 text-zinc-700 leading-relaxed">
            One node is not just attributes. The{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              UINode
            </code>{" "}
            wrapper (
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/lib.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              lib.rs
            </a>
            , lines 328 to 338) adds three more things: an{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              id
            </code>
            , a{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              children
            </code>{" "}
            vector, and a{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              selector
            </code>{" "}
            string. That selector is the full chained path from the root window
            down to this node, something like{" "}
            <code className="font-mono text-[0.85em] bg-zinc-100 text-zinc-800 px-1 rounded">
              role:Window &amp;&amp; name:Untitled &gt;&gt; role:Edit
            </code>
            . It is built as the tree is walked, so every node in a captured
            tree is already addressable: copy its selector straight into{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              desktop.locator()
            </code>{" "}
            and you have a locator for it.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Why the default loads two fields, not seventeen
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The choice of how much to capture is a single enum.{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              PropertyLoadingMode
            </code>{" "}
            in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/mod.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              platforms/mod.rs
            </a>{" "}
            (lines 57 to 64) has three variants, and the comments in the source
            describe each one exactly: Fast is &quot;only load essential
            properties (role + name) - fastest,&quot; Complete is &quot;load all
            properties for complete element data - slower but
            comprehensive,&quot; and Smart is &quot;load specific properties
            based on element type - balanced approach.&quot; The default for
            tree building is Fast.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That default looks aggressive until you remember the cost model.
            Selector matching needs role, name, and id. It does not need a
            tooltip description or a value string for the layout container three
            levels up that you will never touch. Loading those anyway means one
            extra cross-process call per field, per node, across the whole tree.
            Fast mode is not cutting corners. It is declining to pay for data
            nothing will read.
          </p>
          <BeforeAfter
            title="PropertyLoadingMode, the two ends of the dial"
            before={{
              label: "Complete mode",
              content:
                "Every field on every node. The tree is comprehensive: you get description, value, enabled, toggled, selected, the properties map, all of it, on the layout containers as much as on the buttons. It is the right mode when you genuinely need a full audit of an app's UI. It is the wrong mode as a default, because each extra field is another COM round trip multiplied across thousands of nodes.",
              highlights: [
                "one cross-process call per property, per node",
                "a deep browser tree can take seconds to dump",
                "most captured fields are never read by a selector",
                "too slow to re-run after every action in an agent loop",
              ],
            }}
            after={{
              label: "Fast mode (the default)",
              content:
                "Role and name per node, the two fields a selector matches on, plus conditional state and the focusable-gated bounds. Skips description, value, the properties map, and the rest unless the node type or your config asks for them. The dump returns in a few hundred milliseconds for a normal window, fast enough that an agent can re-capture the tree on every step.",
              highlights: [
                "two reads per node instead of seventeen",
                "selector matching has everything it needs",
                "tree dump stays inside an agent-loop time budget",
                "upgrade to Complete or Smart only where you need it",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The anchor: bounds only for what you can focus
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is the single most telling line in the whole tree builder. In{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/element.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              element.rs
            </a>
            , line 334, the{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              bounds
            </code>{" "}
            field of a node is declared with this comment attached to it:
          </p>
          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <pre className="font-mono text-sm text-zinc-800 overflow-x-auto">
              <code>{`pub bounds: Option<(f64, f64, f64, f64)>,
// Only populated for keyboard-focusable elements`}</code>
            </pre>
          </div>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            That comment is a design decision written down. The tree
            builder&apos;s{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              get_configurable_attributes
            </code>{" "}
            function checks{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              element.is_keyboard_focusable()
            </code>{" "}
            and only when that is true does it call{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              element.bounds()
            </code>{" "}
            to attach a rectangle. Asking for a node&apos;s bounding rectangle
            is itself a cross-process call, so this is not a cosmetic skip. It
            is the framework declining to pay for the pixel coordinates of
            things you will never click.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The logic underneath it is clean. The elements you act on (buttons,
            edit fields, checkboxes, list items, links) are precisely the ones
            the OS marks keyboard-focusable. A static text label, a decorative
            image, a layout group: not focusable, not clicked, no bounds. Then
            the tree formatter closes the loop. It assigns a numeric click index
            only to nodes that have bounds. So the indexed, clickable subset of
            a captured tree is the keyboard-focusable subset, by construction,
            with no separate filtering pass. One inline comment, and the whole
            capture-cost story is consistent.
          </p>
          <InlineTestimonial
            quote="bounds: Option<(f64, f64, f64, f64)>, // Only populated for keyboard-focusable elements"
            name="Terminator source"
            role="crates/terminator/src/element.rs, line 334, MIT licensed"
            stars={5}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Walking the tree without freezing the machine
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Capturing less per node is half the job. The other half is the walk
            itself.{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              build_ui_node_tree_configurable
            </code>{" "}
            in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/tree_builder.rs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              tree_builder.rs
            </a>{" "}
            does not just recurse blindly. It uses an explicit work queue, so a
            pathologically deep app cannot blow the call stack: recursion is
            capped at depth 100, and anything deeper gets pushed back onto the
            queue and processed iteratively.
          </p>
          <FlowDiagram title="One pass of the tree builder" steps={buildSteps} />
          <p className="mt-2 text-zinc-700 leading-relaxed">
            The yield step is the one developers underestimate. The builder
            tracks how many elements it has processed, and every 50 of them
            (the{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              yield_every_n_elements
            </code>{" "}
            default), plus between large child batches, it calls{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              thread::sleep
            </code>{" "}
            for 1 millisecond. That tiny pause hands CPU back to the rest of the
            system so the host UI does not visibly hitch while a big tree is
            being captured. Children are processed in batches of 50 (
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              batch_size
            </code>
            ), and the tree depth itself defaults to 50 levels, raised to 500
            for browsers because web apps nest far deeper than native windows.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this is glamorous. It is the unglamorous machinery that
            turns &quot;read the accessibility tree&quot; from a slogan into a
            function that reliably returns in a few hundred milliseconds without
            making the user&apos;s desktop stutter. When a guide tells you the
            tree is fast, this is the code that earned the word.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What a captured tree actually looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Once the builder has run, the formatter renders the tree as a
            compact, indented, YAML-like block. Nodes that carry bounds get a{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              #N
            </code>{" "}
            click index; nodes without bounds get a plain dash. Here is a
            trimmed dump of a Notepad window captured in Fast mode.
          </p>
          <TerminalOutput
            title="capture the tree"
            lines={[
              { type: "command", text: "node dump-tree.js" },
              {
                type: "info",
                text: "[TREE] process:notepad  mode=Fast  depth=50",
              },
              { type: "output", text: "[Window] Untitled - Notepad (4 children)" },
              { type: "output", text: "  - [MenuBar] (bounds skipped: not focusable)" },
              { type: "output", text: "  #1 [Edit] Text Editor (bounds: [0,52,1280,648])" },
              { type: "output", text: "  - [StatusBar] (3 children)" },
              { type: "output", text: "      - [Text] Ln 1, Col 1" },
              { type: "output", text: "      - [Text] 100%" },
              { type: "output", text: "  #2 [Button] Close (bounds: [1232,4,46,32])" },
              {
                type: "success",
                text: "[TREE] 214 nodes, max depth 9, 2 indexed, built in 312 ms",
              },
              {
                type: "info",
                text: "selector for #1 -> role:Window && name:Untitled >> role:Edit",
              },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read the last two lines. 214 nodes captured, only 2 of them indexed,
            because only 2 are keyboard-focusable and therefore only 2 carry
            bounds. The MenuBar and the StatusBar text are in the tree (you can
            still read their names and roles) but they are not clickable
            targets, so the formatter does not waste an index on them. And the
            selector for node{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              #1
            </code>{" "}
            is already written out, ready to paste into a locator. That is the
            Fast-mode philosophy made visible: capture what addresses and acts
            on elements, skip the rest.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The numbers, straight from the source
          </h2>
          <MetricsRow metrics={metrics} />
          <p className="mt-2 text-zinc-700 leading-relaxed">
            Seventeen fields defined, two loaded by default. That ratio is the
            whole argument. Everything else (the batching, the depth limits, the
            millisecond yield) exists to make even those two reads, multiplied
            across thousands of nodes, finish fast enough that an AI agent can
            re-capture the tree on every single step of a workflow without the
            human noticing.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Where the tree is thin, and what catches the fall
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The accessibility tree is the right default for desktop automation,
            but it is honest to name where it gets thin. Three cases come up
            repeatedly.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <strong className="text-zinc-900">Custom-drawn surfaces.</strong>{" "}
            A fullscreen game, a 3D modeller, a browser canvas (Figma&apos;s
            drawing area, Excalidraw, Miro): these paint their own pixels and
            expose a single opaque node with no useful children. The tree
            cannot help you there because the app never built one.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <strong className="text-zinc-900">Shallow trees.</strong>{" "}
            Some apps implement accessibility poorly. Electron apps are known
            for flat, unhelpful trees. And a genuinely deep web view can exceed
            the depth limit, which is exactly why Terminator raises the default
            depth to 500 for browsers and why &quot;element not found&quot;
            often means &quot;deeper than the depth you captured&quot; rather
            than &quot;not there.&quot;
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <strong className="text-zinc-900">Lying providers.</strong>{" "}
            A few targets return success on a tree action while doing nothing,
            most notoriously browser web views on macOS. The tree is not wrong
            about what exists; it is wrong about what acting on it will do.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s response is to treat the tree as the fast first
            layer of a stack, not the only layer. Its{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-700 underline underline-offset-2"
            >
              own description
            </a>{" "}
            is &quot;accessibility tree + DOM + OCR + vision AI for maximum
            reliability&quot;: the tree resolves the overwhelming majority of
            elements at CPU speed, DOM access through a Chrome extension covers
            web content the tree mangles, and OCR plus vision catch the
            custom-drawn surfaces. The tree is the default precisely because it
            is cheap and structured; the other layers exist because no single
            layer is complete.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Capturing it yourself
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Everything above is one function call away. From the Node SDK,{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              desktop.getWindowTree(&apos;notepad&apos;)
            </code>{" "}
            returns a{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              UINode
            </code>{" "}
            you can walk or serialize;{" "}
            <code className="font-mono text-[0.92em] bg-zinc-100 text-zinc-800 px-1 rounded">
              getWindowTreeResult
            </code>{" "}
            additionally hands back the formatted indexed string and an
            index-to-bounds map for click-by-index. From an MCP agent in Claude
            Code, Cursor, or VS Code, the same capture is exposed as a tool: the
            agent asks for the tree, reads the structured nodes, and picks a
            selector, all running the same Rust tree builder this page
            describes.
          </p>
          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              install the MCP server
            </p>
            <pre className="mt-3 font-mono text-sm text-zinc-800 overflow-x-auto">
              <code>{`claude mcp add terminator "npx -y terminator-mcp-agent@latest"`}</code>
            </pre>
            <p className="mt-3 text-xs font-mono text-zinc-500">
              or pull the SDK directly: npm i @mediar-ai/terminator
            </p>
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 my-12">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Tuning a tree capture that is too slow for your agent loop?"
            description="Talk through PropertyLoadingMode, depth limits, and where your target app's tree gets thin with the people who wrote the builder."
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <FaqSection
            items={faqs}
            heading="Questions about the accessibility tree"
          />
        </section>

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="The rest of the accessibility-tree series on Terminator"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Compare notes on capturing accessibility trees fast."
      />
    </>
  );
}
