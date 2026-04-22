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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  BentoGrid,
  GlowCard,
  MetricsRow,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-tools-for-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Automation tools for Windows: why the cache-batched accessibility tree beats screenshots, coordinates, and RPA studios";
const DESCRIPTION =
  "Most automation tools for Windows either replay pixel clicks or drive a drag-and-drop studio. Terminator is a developer framework that builds the Microsoft UI Automation tree in one CacheRequest round-trip (ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId), then serves every subsequent read from local cache with zero further IPC. That is the speed budget an AI coding assistant needs to drive a real desktop in a loop.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator batches seven UIProperty values into a single IUIAutomationCacheRequest with TreeScope::Subtree, fetches the whole subtree in one COM call via find_first_build_cache, and reads every property locally. File: crates/terminator/src/platforms/windows/tree_builder.rs lines 398 to 436.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The fastest automation tool for Windows is not an RPA studio",
    description:
      "It is a Rust library that makes one UIA CacheRequest, batches seven properties, and gives your AI coding assistant a local accessibility tree instead of a screenshot.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation tools for Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation tools for Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why pick a developer framework over Power Automate Desktop or UiPath Studio?",
    a: "Because AI coding assistants write code, not flowchart tiles. Power Automate Desktop and UiPath Studio expect a human to drag activities onto a canvas. An agent driving your desktop needs a typed SDK it can import, call, and test. Terminator is a library (Rust core with Node.js and Python bindings) plus a Model Context Protocol server, so Claude Code, Cursor, and Codex can call functions like locator('Edit', 'Address').click() the same way they already call Playwright.",
  },
  {
    q: "What makes the accessibility tree faster than screenshots or coordinates?",
    a: "Two things. First, the Windows UI Automation (UIA) API returns structured data. You get role, name, AutomationId, and bounding box as text, not pixels, so there is nothing to OCR and nothing to re-detect after a theme change. Second, Terminator fetches those properties in bulk. In crates/terminator/src/platforms/windows/tree_builder.rs the build_tree_with_cache path creates one IUIAutomationCacheRequest, calls add_property for seven properties (ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId), sets the tree scope to Subtree, then issues a single find_first_build_cache. After that, every descendant is read locally via get_cached_* with zero further COM round-trips.",
  },
  {
    q: "Is the UIA CacheRequest really a single round-trip?",
    a: "Yes. IUIAutomation::FindFirstBuildCache is a documented Microsoft API that performs the cross-process walk once and returns a detached cached tree. Without it, each property access is its own COM call from your process to the target app, and Windows accessibility is cross-process IPC. A mid-sized window has hundreds of elements and seven properties per element; that is potentially thousands of IPC calls. The CacheRequest collapses that to one call plus local reads. Terminator logs this phase with [CACHED_TREE] in the info level so you can verify the timing yourself.",
  },
  {
    q: "What selector strategies does Terminator support on Windows?",
    a: "The three that map directly to UIA: ControlType (role), Name (accessible name), and AutomationId (the stable developer-assigned ID, when present). The engine tries name match first and only loads AutomationId when name is empty, which keeps the common path cheap. Selectors chain, so locator({ role: 'window', name: 'Notepad' }).locator({ role: 'edit' }) narrows scope at each step instead of walking the whole tree again.",
  },
  {
    q: "How does Terminator avoid freezing the UI thread while walking the tree?",
    a: "The tree builder has a yield_every_n_elements field, defaulted to 50, that inserts a 1 ms sleep after every N elements processed. That lets the target app's UI thread service its own message pump while Terminator walks the subtree. Screenshot-based agents do not hit this problem because they do not touch the UI thread, but they also do not know what they are clicking.",
  },
  {
    q: "Does the MCP agent expose the same primitives?",
    a: "Yes. The terminator-mcp-agent binary registers fifteen tools that an AI coding assistant can call directly, including get_window_tree, click_element, activate_element, validate_element, open_application, and execute_sequence. These are the same primitives the SDK exposes, so the agent and your own code share a model. You can also hand a TypeScript snippet to execute_browser_script and run it inside the active Chrome tab via chrome.debugger, which makes a single tool call span the desktop and the web.",
  },
  {
    q: "What performance budget should I expect?",
    a: "Terminator's own benchmark file (crates/terminator/src/platforms/windows_benchmarks.rs) defines thresholds for 26 scenarios covering Calculator, Notepad, Excel, Chrome, GitHub, Amazon, YouTube, and Slack. Excellent is 50 ms or less and up to 50 elements. Good is 51 to 150 ms and up to 150 elements. Fair is 151 to 300 ms and up to 300 elements. Anything over 300 ms is Poor. The throughput metric the benchmarks report is elements per millisecond.",
  },
  {
    q: "How does this compare to AutoHotkey or pywinauto?",
    a: "AutoHotkey is a scripting language that sends keyboard and mouse events. It is fast and ubiquitous, but it does not give an AI agent a structured view of the screen. Pywinauto is Python-only and also speaks UIA, but it does not use CacheRequest by default; each property access is a separate COM call. Terminator is cross-language (Rust core, Node and Python bindings), MCP-native, and wraps the cache pattern for you.",
  },
  {
    q: "Can I verify the CacheRequest code myself?",
    a: "Clone the repo and look at crates/terminator/src/platforms/windows/tree_builder.rs. The function is build_tree_with_cache. The property list sits in a [UIProperty; 7] array around line 404. The find_first_build_cache call is around line 436. Run an example workflow with RUST_LOG=info and you will see a log line starting with [CACHED_TREE] that tells you how long the build took.",
  },
  {
    q: "Is Terminator open source and MIT licensed?",
    a: "Yes. The repo is mediar-ai/terminator on GitHub. Crates, extension, MCP agent, and the Node and Python bindings are all MIT. You can read the exact COM initialization path, the selector engine, and the extension bridge without signing an enterprise contract.",
  },
];

const faqSchema = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const cacheRequestCode = `// crates/terminator/src/platforms/windows/tree_builder.rs
// build_tree_with_cache: one round-trip for an entire subtree

info!("[CACHED_TREE] Starting cached tree build");
let start_time = std::time::Instant::now();

let cache_request = automation.create_cache_request()?;

// Seven properties, batched into ONE IPC call
let properties = [
    UIProperty::ControlType,
    UIProperty::Name,
    UIProperty::BoundingRectangle,
    UIProperty::IsEnabled,
    UIProperty::IsKeyboardFocusable,
    UIProperty::HasKeyboardFocus,
    UIProperty::AutomationId,
];

for prop in &properties {
    cache_request.add_property(*prop)?;
}

// TreeScope::Subtree = Element + Children + Descendants.
// After this one call, every descendant property is local.
cache_request.set_tree_scope(TreeScope::Subtree)?;

let true_condition = automation.create_true_condition()?;

let cached_root = root_element
    .find_first_build_cache(
        TreeScope::Element,
        &true_condition,
        &cache_request,
    )?;

// From here, every get_cached_* call is zero COM cost.`;

const typicalRpaCode = `// What most Windows automation libraries do
// Each property access is its own cross-process COM call.

let control_type = element.get_property("ControlType").await?; // COM call
let name         = element.get_property("Name").await?;         // COM call
let enabled      = element.get_property("IsEnabled").await?;    // COM call
let bounds       = element.get_property("BoundingRectangle").await?; // COM call
let focus        = element.get_property("HasKeyboardFocus").await?;  // COM call
let auto_id      = element.get_property("AutomationId").await?; // COM call

// For N elements: N * 6 IPC round-trips before your agent
// has seen a single thing on screen.`;

const sdkCode = `// Node.js SDK, same primitives, CacheRequest used under the hood
import { Desktop } from "terminator.js";

const desktop = new Desktop();
const notepad = await desktop.openApplication("Notepad");

// One cached tree build runs here; the locator chain
// then walks the local cached tree with no further COM cost.
const editor = notepad.locator({ role: "Edit", name: "Text Editor" });
await editor.typeText("Hello from an AI coding assistant.");

await notepad.locator({ role: "Button", name: "File" }).click();
await notepad.locator({ role: "MenuItem", name: "Save" }).click();`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n add_property crates/terminator/src/platforms/windows/tree_builder.rs", type: "command" as const },
  { text: "415:        cache_request.add_property(*prop).map_err(|e| {", type: "success" as const },
  { text: "grep -n find_first_build_cache crates/terminator/src/platforms/windows/tree_builder.rs", type: "command" as const },
  { text: "436:        .find_first_build_cache(TreeScope::Element, &true_condition, &cache_request)", type: "success" as const },
  { text: "# The seven UIProperty values that get batched:", type: "output" as const },
  { text: "sed -n '404,412p' crates/terminator/src/platforms/windows/tree_builder.rs", type: "command" as const },
  { text: "    let properties = [", type: "output" as const },
  { text: "        UIProperty::ControlType,", type: "output" as const },
  { text: "        UIProperty::Name,", type: "output" as const },
  { text: "        UIProperty::BoundingRectangle,", type: "output" as const },
  { text: "        UIProperty::IsEnabled,", type: "output" as const },
  { text: "        UIProperty::IsKeyboardFocusable,", type: "output" as const },
  { text: "        UIProperty::HasKeyboardFocus,", type: "output" as const },
  { text: "        UIProperty::AutomationId,", type: "output" as const },
  { text: "    ];", type: "output" as const },
  { text: "# Run a workflow and watch the timing log:", type: "output" as const },
  { text: "RUST_LOG=info cargo run --example hello_windows", type: "command" as const },
  { text: "[CACHED_TREE] Starting cached tree build", type: "success" as const },
  { text: "[CACHED_TREE] Built 147 nodes in 38ms", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "How it sees the screen",
    competitor: "Pixels, OCR, or coordinates",
    ours: "Microsoft UI Automation accessibility tree",
  },
  {
    feature: "How many IPC calls per tree build",
    competitor: "One per property per element (N times 6+)",
    ours: "One find_first_build_cache, then local reads",
  },
  {
    feature: "Selector stability across themes and DPI",
    competitor: "Breaks on theme or font changes",
    ours: "Role, Name, AutomationId stay the same",
  },
  {
    feature: "Primary interface",
    competitor: "Drag-and-drop studio or record-and-replay",
    ours: "Typed SDK (Rust, Node, Python) plus MCP server",
  },
  {
    feature: "Fit for AI coding assistants",
    competitor: "No, needs a human in the studio",
    ours: "Yes, Claude Code and Cursor call MCP tools directly",
  },
  {
    feature: "Works with your current Windows session",
    competitor: "Often boots an isolated robot session",
    ours: "Runs in your logged-in user session",
  },
  {
    feature: "License",
    competitor: "Per-bot or per-studio seat",
    ours: "MIT, mediar-ai/terminator on GitHub",
  },
  {
    feature: "Browser scripting from the same tool call",
    competitor: "No, separate browser product",
    ours: "execute_browser_script via chrome.debugger",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "One CacheRequest, whole subtree",
    description:
      "build_tree_with_cache creates a single IUIAutomationCacheRequest, adds seven UIProperty values, sets TreeScope::Subtree, and fetches the element plus every descendant in one COM round-trip. Source: crates/terminator/src/platforms/windows/tree_builder.rs, line 398 onward.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Seven batched properties",
    description:
      "ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId. Everything an agent needs to decide what to click is pre-loaded before the locator chain runs.",
    size: "1x1",
  },
  {
    title: "TreeScope::Subtree (value 7)",
    description:
      "Element (1) plus Children (2) plus Descendants (4) combined. One scope flag is the difference between walking the tree live and reading it from local memory.",
    size: "1x1",
  },
  {
    title: "yield_every_n_elements = 50",
    description:
      "Default setting in TreeBuilderConfig. Every 50 elements the walker sleeps 1 ms so the target app's UI thread can service its own message pump. No freezing Excel while you index it.",
    size: "1x1",
  },
  {
    title: "get_cached_* reads",
    description:
      "After the cache build, every descendant property is read locally with get_cached_name, get_cached_control_type, and so on. A counter in TreeBuildingContext tracks cache_hits you can log at the end of a workflow.",
    size: "1x1",
  },
  {
    title: "MCP agent, fifteen tools",
    description:
      "terminator-mcp-agent exposes get_window_tree, click_element, activate_element, validate_element, execute_sequence, execute_browser_script, and ten more. Each tool is a typed function an AI coding assistant can call over MCP.",
    size: "2x1",
  },
];

const metrics = [
  { value: 50, suffix: " ms", label: "Excellent build budget for a small window" },
  { value: 150, suffix: " ms", label: "Good build budget for a mid-sized window" },
  { value: 7, suffix: "", label: "UIProperty values batched per CacheRequest" },
  { value: 26, suffix: "", label: "Scenarios covered by the benchmark suite" },
];

const remotionCaptions = [
  "Windows apps expose an accessibility tree.",
  "Most tools read it one property at a time.",
  "Terminator asks for the whole subtree in one call.",
  "Seven UIProperty values come back batched.",
  "Your agent reads every element locally, with zero COM cost.",
];

const beamFrom = [
  { label: "Claude Code / Cursor", sublabel: "AI coding assistant" },
  { label: "MCP client", sublabel: "JSON-RPC over stdio" },
  { label: "terminator.js / .py", sublabel: "Typed SDK" },
];

const beamHub = {
  label: "Terminator Rust core",
  sublabel: "Windows UIA adapter",
};

const beamTo = [
  { label: "Notepad, Outlook, Excel", sublabel: "Native Windows apps" },
  { label: "Chrome, Edge, Brave", sublabel: "Via chrome.debugger bridge" },
  { label: "Installer dialogs", sublabel: "System UI, MSI windows" },
];

const checklistItems = [
  { text: "Fixed RPA studios: Power Automate, UiPath Studio, Blue Prism", checked: true },
  { text: "Scripting tools: AutoHotkey, AutoIt", checked: true },
  { text: "Python UIA wrappers: pywinauto, uiautomation", checked: true },
  { text: "Screenshot or OCR agents: SikuliX, pixel-diff bots", checked: true },
  { text: "Test drivers: WinAppDriver, Appium Windows, Coded UI (retired)", checked: true },
  { text: "Task schedulers: Windows Task Scheduler, cron-style runners", checked: true },
];

const stepTimelineSteps = [
  {
    title: "Your agent issues an MCP call",
    description:
      "Claude Code or Cursor sends a JSON-RPC message like click_element { selector: { role: 'Button', name: 'Save' } } to the terminator-mcp-agent binary.",
  },
  {
    title: "The Rust core builds a cached tree",
    description:
      "build_tree_with_cache runs. One create_cache_request, seven add_property calls, TreeScope::Subtree, then find_first_build_cache. A log line starting with [CACHED_TREE] tells you how long it took.",
  },
  {
    title: "The selector engine walks the local cache",
    description:
      "Role, Name, and (if needed) AutomationId match against the cached subtree. No new COM calls. Name is tried first, AutomationId only when name is empty.",
  },
  {
    title: "The action runs against the live element",
    description:
      "Click, type, focus, or activate fire through the real COM handle. The cached tree is strictly for discovery; the live handle is used for the action itself.",
  },
  {
    title: "The MCP response carries the result",
    description:
      "Success, failure, or structured return value flows back through JSON-RPC to the AI assistant, which writes the next step of the workflow.",
  },
];

const sequenceActors = ["Agent", "MCP agent", "Rust core", "Windows UIA"];

const sequenceMessages: Array<{ from: number; to: number; label: string; type?: "request" | "response" | "event" | "error" }> = [
  { from: 0, to: 1, label: "get_window_tree", type: "request" },
  { from: 1, to: 2, label: "build_tree_with_cache", type: "request" },
  { from: 2, to: 3, label: "create_cache_request + 7 add_property", type: "request" },
  { from: 2, to: 3, label: "find_first_build_cache (ONE call)", type: "request" },
  { from: 3, to: 2, label: "cached subtree", type: "response" },
  { from: 2, to: 1, label: "UINode (local reads only)", type: "response" },
  { from: 1, to: 0, label: "JSON tree for the agent", type: "response" },
];

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
              readingTime="11 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Automation tools for Windows: why the{" "}
              <GradientText>cache-batched accessibility tree</GradientText>{" "}
              beats screenshots, coordinates, and RPA studios
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every &ldquo;top 10 automation tools for Windows&rdquo; article recommends the same
              six products: Power Automate Desktop, UiPath, AutoHotkey, WinAutomation, Blue Prism,
              and a task scheduler. None of them explains why the Windows UI Automation tree, fetched
              in one CacheRequest round-trip, is the only approach fast and stable enough for an AI
              coding assistant to drive your desktop in a loop. This page does.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="Built on Microsoft UI Automation, MIT licensed, audited by real agents"
          highlights={[
            "One CacheRequest, seven batched UIProperty values",
            "Typed SDKs in Rust, Node.js, and Python",
            "MCP server with fifteen tools for AI coding assistants",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="Automation tools for Windows"
            subtitle="Why the accessibility tree, batched, wins"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The shortlist everyone links to, and what it misses
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you search &ldquo;automation tools for Windows&rdquo;, the first page of results is a
            stack of vendor roundups that recommend effectively the same six products. They are real
            tools and they solve real problems, but every one of them is optimised for a human in a
            studio: drag an activity onto a canvas, press record, pick an element from a visual
            picker. The problem is that the job you actually need a Windows automation tool for in
            2026 is different. You want an AI coding assistant to read the screen, pick the right
            element, and act on it, in a loop, without a human in the middle.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="What the listicles cover"
              items={checklistItems}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Six categories, zero of them designed to be called from a typed SDK by Claude Code,
            Cursor, or Codex. That is the gap. Terminator fills it, and the reason it can is an
            implementation detail most automation coverage never touches: how the tool talks to
            Windows in the first place.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The anchor: one CacheRequest, seven properties, a whole subtree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Microsoft UI Automation (UIA) is the accessibility API that backs almost every modern
            Windows control: WPF, WinUI, UWP, WinForms, Electron apps, the Office suite, File
            Explorer, the Start menu. Screen readers use it. Accessibility inspectors use it. It
            exposes every UI element with a role (ControlType), a name, a bounding box, and dozens
            of other properties. If you read it well, you do not need pixels and you do not need
            coordinates.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The catch is that UIA is cross-process. Your automation process and the target
            application are different processes, and every property lookup is a COM call across that
            boundary. Naive wrappers do one call per property per element. A mid-sized window has a
            few hundred elements and you usually need six or seven properties each. That is
            thousands of round-trips before your agent has decided what to click.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator takes the documented solution and wires it into its tree builder by default.
            The file is{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              crates/terminator/src/platforms/windows/tree_builder.rs
            </code>
            . The function is <code>build_tree_with_cache</code>. This is the anchor fact for this
            whole page.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={cacheRequestCode}
              language="rust"
              filename="crates/terminator/src/platforms/windows/tree_builder.rs"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Seven properties, one scope flag (
            <code>TreeScope::Subtree</code> is value 7: Element + Children + Descendants), one
            <code> find_first_build_cache</code>. After that, <code>get_cached_name</code>,
            <code> get_cached_control_type</code>, <code>get_cached_bounding_rectangle</code>, and the
            rest are all local memory reads. A counter in <code>TreeBuildingContext</code> named
            <code> cache_hits</code> tracks how many times the hot path took the local read.
          </p>
        </section>

        <ProofBanner
          quote="[CACHED_TREE] is the log line you watch. Seven properties for an entire subtree in one round-trip. Every subsequent read is free."
          metric="1 IPC call"
          source="crates/terminator/src/platforms/windows/tree_builder.rs"
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the typical library does instead
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            To see why the CacheRequest matters, compare it to the default pattern most Windows
            automation libraries use when you access a property. Each getter is its own round-trip.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={typicalRpaCode}
              language="rust"
              filename="sketch: naive UIA wrapper"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That cost scales with the size of the UI, not the complexity of the task. Once a window
            has 300 elements, you are spending most of your clock budget on IPC, not on logic. If an
            AI agent is driving that library in a loop, every iteration pays the same tax.
          </p>
        </section>

        <MetricsRow metrics={metrics} />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How a tool call flows through the system
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            When your AI coding assistant calls an MCP tool, here is what happens underneath. Notice
            where the expensive boundary is and how many times it gets crossed.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="Agent -> MCP -> Rust -> UIA"
              actors={sequenceActors}
              messages={sequenceMessages}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two requests cross into the Windows UIA boundary: the cache request build, and the
            single <code>find_first_build_cache</code>. Everything after that is local. For
            comparison: a naive wrapper would have one arrow per property per element going right,
            and one going back.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Terminator versus the listicle shortlist
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The usual suspects all do something real. Where they fall short, specifically, is what
            an AI coding assistant needs: a typed SDK, a structured view of the screen, and a cheap
            per-iteration cost.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="Terminator"
              competitorName="Typical Windows RPA or scripting tool"
              rows={comparisonRows}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How an AI coding assistant reaches every Windows app
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The value of a fast tree builder is that it unlocks calling pattern: agent sends intent,
            tool returns a tree, agent picks a locator, tool runs the action. Same pattern for every
            Windows surface you might want to automate.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="One framework, every Windows surface"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What it looks like from your side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The SDK surface stays small. You open an application, you locate elements by role and
            name, you act. The CacheRequest detail is in the Rust core below you; you do not have to
            know about it to benefit from it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={sdkCode}
              language="typescript"
              filename="example.ts"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The pieces that make it work
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Six things come together. The cache batch is the headline, but the rest of the system
            matters too.
          </p>
          <div className="mt-8">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The step-by-step, in order
          </h2>
          <div className="mt-6">
            <StepTimeline steps={stepTimelineSteps} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Verify it yourself
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is all public and MIT licensed. If you want to confirm the CacheRequest pattern is
            real before you install anything, a shallow clone and three greps are enough.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="Verify the cache-batched tree build"
              lines={verifyLines}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The <code>[CACHED_TREE]</code> log line is the timing you can trust. Run Terminator
            against your own Windows apps at <code>RUST_LOG=info</code> and you will see how long
            the one-shot subtree build took before a single locator ever ran.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The takeaway for choosing a Windows automation tool
          </h2>
          <GlowCard>
            <div className="p-6">
              <p className="text-zinc-800 leading-relaxed">
                If a human is driving the automation, an RPA studio is fine. If you want an AI
                coding assistant to drive it, you need four things the studios do not give you: a
                typed SDK, a structured tree instead of pixels, a cheap per-iteration cost, and an
                MCP server the assistant can already speak to. Terminator ships all four, and the
                CacheRequest-batched tree build is what keeps the cost cheap enough to loop.
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want to see it drive your own Windows workflow?"
          description="Hop on a call and we will run Terminator against the exact app your team is trying to automate."
        />

        <div className="mt-14">
          <FaqSection items={faqs} />
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See Terminator drive your Windows apps live."
      />
    </>
  );
}
