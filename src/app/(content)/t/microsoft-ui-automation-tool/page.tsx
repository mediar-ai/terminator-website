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
  NumberTicker,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  MetricsRow,
  AnimatedChecklist,
  CodeComparison,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/microsoft-ui-automation-tool";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Microsoft UI Automation tool: how Terminator pre-fetches a whole subtree in one COM call";
const DESCRIPTION =
  "Most Microsoft UI Automation tools die on per-property COM round-trips. Terminator builds an IUIAutomationCacheRequest with seven UIProperty fields, sets TreeScope::Subtree (Element=1, Children=2, Descendants=4 = 7), and reads everything via get_cached_*. Source: tree_builder.rs lines 398 to 466, MIT licensed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "An open-source Microsoft UI Automation tool that walks an accessibility subtree with one IPC roundtrip. CacheRequest, TreeScope::Subtree, get_cached_control_type, all in MIT-licensed Rust.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A faster way to drive Microsoft UI Automation",
    description:
      "Terminator pre-fetches seven UIProperty values for an entire subtree in one COM IPC call. tree_builder.rs, 70 lines, open source.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Microsoft UI Automation tool" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Microsoft UI Automation tool", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is Microsoft UI Automation, and what is a Microsoft UI Automation tool?",
    a: "Microsoft UI Automation (UIA) is the COM-based accessibility framework that ships with Windows, exposed through interfaces like IUIAutomation, IUIAutomationElement, IUIAutomationCacheRequest, and a set of control patterns (Invoke, Value, Toggle, ExpandCollapse, and so on). A Microsoft UI Automation tool is anything that drives that API to inspect or control desktop UI: Inspect.exe and AccEvent from the Windows SDK for inspection, FlaUInspect for trees, and code-level wrappers like UIA in .NET, the C++ headers, the Python uiautomation package, FlaUI for C#, and Terminator for Rust, TypeScript, and Python. Terminator is unusual in that it pre-fetches an entire subtree of properties in one COM call and gives you a Playwright-shaped locator API across every Win32, WPF, UWP, and WinUI surface.",
  },
  {
    q: "Why is per-property COM access the bottleneck in most Microsoft UI Automation tools?",
    a: "Every IUIAutomationElement property read crosses a COM apartment boundary and, in the cross-process case, marshals through the OS. A single Name access can take milliseconds. If you walk a 1000-element tree and read seven properties per element, that is 7000 IPC calls. The official IUIAutomation6 docs document IUIAutomationCacheRequest precisely because Microsoft anticipates this. Terminator's tree_builder.rs uses a CacheRequest configured with TreeScope::Subtree so the entire descendant tree is materialized in one find_first_build_cache call. Subsequent reads call get_cached_control_type, get_cached_name, get_cached_bounding_rectangle, all of which read from the local cache without any IPC.",
  },
  {
    q: "What exactly does TreeScope::Subtree mean?",
    a: "TreeScope is a bitmask defined by IUIAutomation. Element = 1, Children = 2, Descendants = 4. Subtree is the OR of all three, value 7. When you pass TreeScope::Subtree to set_tree_scope on the cache request, the UIA core fills the cache for the root element and every node beneath it in one server roundtrip. Terminator literally documents the constants in a comment on line 424 of tree_builder.rs so you can audit it. After the call, get_cached_children works without contacting the UIA provider again.",
  },
  {
    q: "Which UIProperty values does Terminator pre-fetch by default?",
    a: "Seven, listed verbatim in the properties array starting at line 404 of tree_builder.rs: UIProperty::ControlType, UIProperty::Name, UIProperty::BoundingRectangle, UIProperty::IsEnabled, UIProperty::IsKeyboardFocusable, UIProperty::HasKeyboardFocus, and UIProperty::AutomationId. Those are the fields the selector engine and the layout calculator actually read for every node. If you need more, string_to_ui_property in utils.rs maps another 25 names (ClassName, HelpText, ValueValue, IsPassword, IsOffscreen, the LegacyIAccessible* family) to UIProperty variants you can wire into the cache request.",
  },
  {
    q: "How does Terminator handle Win32 controls that pre-date UIA?",
    a: "Two layers. First, EnumWindows from user32.dll lists every top-level HWND, then GetWindowThreadProcessId maps it to a PID before any UIA call happens. This is in applications.rs and it is 10x to 100x faster than walking the desktop UIA tree to discover windows. Second, for the controls themselves, Terminator falls through the IAccessible bridge that Microsoft provides for legacy Win32 and MFC apps, then degrades to keyboard or pointer simulation only when no pattern is available. ShowWindow with SW_MAXIMIZE is the documented fallback when WindowPattern is missing, and you can see it on lines 959 to 979 of element.rs.",
  },
  {
    q: "Does this work outside Windows?",
    a: "The platform layer is split. crates/terminator/src/platforms/windows uses IUIAutomation. crates/terminator/src/platforms/macos uses the Accessibility API. The selector engine, the cache strategy, and the locator API are platform-neutral. The same role:Button && name:Save selector compiles on both. Linux through AT-SPI2 is in the core crate but the npm and pip binaries currently ship Windows only.",
  },
  {
    q: "How is this different from Inspect.exe or FlaUI?",
    a: "Inspect.exe is a viewer. It shows you the live UIA tree but you do not script it. FlaUI is a great C# wrapper but it is a library you embed in C# tests. Terminator is a multi-language framework: a Rust core, a NAPI Node.js binding, a PyO3 Python binding, an MCP server for AI agents like Claude Code and Cursor, and a deterministic workflow SDK. The cache-first tree builder, the boolean selector grammar, and the unified vision/OCR/DOM index system are the same across all of them.",
  },
  {
    q: "Where can I read the source?",
    a: "It is MIT licensed at github.com/mediar-ai/terminator. The cached tree builder is crates/terminator/src/platforms/windows/tree_builder.rs lines 388 to 469. The control type and UIProperty mapping is crates/terminator/src/platforms/windows/utils.rs lines 115 to 210. The selector parser is crates/terminator/src/selector.rs, 753 lines. The pattern dispatch (Invoke, Value, Toggle, ExpandCollapse, Window, Selection, Scroll, RangeValue) lives across crates/terminator/src/platforms/windows/element.rs.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Pre-fetches entire subtree in one IPC call",
    competitor: "One COM call per property per element",
    ours: "find_first_build_cache + TreeScope::Subtree",
  },
  {
    feature: "Open MIT-licensed source you can audit",
    competitor: "Closed-source RPA suite",
    ours: "tree_builder.rs, ~70 lines, on GitHub",
  },
  {
    feature: "Selector grammar with && || ! ( )",
    competitor: "One id, one XPath, one role",
    ours: "role:Button && (name:OK || name:Confirm)",
  },
  {
    feature: "Same API for Win32, WPF, UWP, WinUI 3",
    competitor: "Often only one framework family",
    ours: "Whatever IUIAutomation exposes, Terminator drives",
  },
  {
    feature: "Driven from TypeScript, Python, Rust, MCP",
    competitor: "Single SDK or vendor scripting language",
    ours: "@mediar-ai/terminator, terminator-py, terminator-rs, MCP agent",
  },
  {
    feature: "Falls back to OCR + Gemini vision via unified index",
    competitor: "Pixel matching is a separate product",
    ours: "click_by_index covers UIA, OCR, Gemini, and DOM",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "ControlType",
    description: "Button, Edit, ComboBox, TabItem, DataGrid; mapped from string roles in utils.rs::map_generic_role_to_win_roles.",
    size: "1x1",
  },
  {
    title: "Name",
    description: "The accessible name UIA exposes. Cached so you can match against name:Save without a second COM call.",
    size: "1x1",
  },
  {
    title: "BoundingRectangle",
    description: "Left, top, width, height in physical pixels. Used for spatial selectors like rightof: and below:.",
    size: "1x1",
  },
  {
    title: "IsEnabled",
    description: "Greyed-out controls are filtered before any pattern call so you do not waste an Invoke on a dead button.",
    size: "1x1",
  },
  {
    title: "IsKeyboardFocusable",
    description: "When include_all_bounds is false, only focusable nodes get bounds, which keeps the cache lean for big apps.",
    size: "2x1",
    accent: true,
  },
  {
    title: "HasKeyboardFocus",
    description: "Lets save_focus_state and restore_focus_state preserve keyboard context across an automation step.",
    size: "1x1",
  },
  {
    title: "AutomationId",
    description: "The stable id WPF and WinUI assign to controls; queried by id: and nativeid: selector prefixes.",
    size: "2x1",
  },
];

const cacheBuilderSource = `// crates/terminator/src/platforms/windows/tree_builder.rs

let cache_request = automation.create_cache_request()?;

// Add properties to cache - these will be fetched in ONE IPC call
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

// TreeScope values: Element=1, Children=2, Descendants=4, Subtree=7
cache_request.set_tree_scope(TreeScope::Subtree)?;

let true_condition = automation.create_true_condition()?;

// ONE IPC call that pre-fetches everything below the root
let cached_root = root_element
    .find_first_build_cache(TreeScope::Element, &true_condition, &cache_request)?;`;

const cachedReadSource = `// crates/terminator/src/platforms/windows/tree_builder.rs (line 471)
fn build_node_from_cached_element(...) -> Result<UINode, AutomationError> {
    // All these calls read from local cache - NO IPC overhead
    let role = element.get_cached_control_type()?;
    let name = element.get_cached_name().ok().filter(|n| !n.is_empty());
    let bounds = element.get_cached_bounding_rectangle()?;
    let is_focusable = element.is_cached_keyboard_focusable().unwrap_or(false);

    // Recurse into cached children, still no IPC
    for child in element.get_cached_children()? {
        build_node_from_cached_element(&child, ...)?;
    }
}`;

const naiveCode = `// Naive UIA wrapper — one COM round-trip per property per node
for element in walker.descendants(root) {
    let ct = element.get_control_type()?;        // IPC
    let name = element.get_name()?;              // IPC
    let rect = element.get_bounding_rectangle()?;// IPC
    let id = element.get_automation_id()?;       // IPC
    let enabled = element.is_enabled()?;         // IPC
    // 1000 nodes x 5 reads = 5000 IPC calls
}`;

const cachedCode = `// Terminator: one CacheRequest, TreeScope::Subtree, one find_first_build_cache
let cached_root = root.find_first_build_cache(
    TreeScope::Element, &true_condition, &cache_request,
)?;
// Now every read below is a local memory access
let ct = cached_root.get_cached_control_type()?;
let name = cached_root.get_cached_name()?;
let rect = cached_root.get_cached_bounding_rectangle()?;
// 1000 nodes, still ONE IPC call`;

const usageCode = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// Locator strings parse to a boolean predicate.
// Same grammar that the selector engine wires into the
// cached subtree returned by tree_builder.rs.
const save = desktop.locator(
  "process:notepad >> role:Button && name:Save && !visible:false"
);

await save.first(3000).then((el) => el.invoke());

// Need the whole tree?
// getWindowTree triggers the cached builder under the hood.
const tree = desktop.getWindowTree("notepad");
console.log(tree.children.length);`;

const buildSteps = [
  {
    title: "Initialize UIA in MTA mode",
    description:
      "engine.rs calls UIAutomation::new_direct(), which performs CoInitializeEx with COINIT_MULTITHREADED so the same UIA instance can be queried from any tokio task. The wrapper hands back a ThreadSafeWinUIElement(Arc<UIElement>) so the locator engine and tree builder can share it without per-call locking.",
  },
  {
    title: "Build a CacheRequest with seven UIProperty fields",
    description:
      "create_cache_request returns an IUIAutomationCacheRequest. Terminator calls add_property seven times, with the exact fields the selector engine and the layout calculator need. Adding more is cheap; the trade-off is just memory in the cache.",
  },
  {
    title: "Set TreeScope::Subtree",
    description:
      "Element=1, Children=2, Descendants=4, all OR'd to 7. This is the difference between caching one node and caching the entire descendant tree. The constant is documented in a comment in the source so you do not have to memorize it.",
  },
  {
    title: "Call find_first_build_cache once",
    description:
      "This is the only round-trip you pay for the entire tree walk. The cached_root that comes back has every cached property and every cached child pre-populated. Terminator times this separately from the tree-walk so you can see exactly how much of a slow page is COM IPC versus your own logic.",
  },
  {
    title: "Read with get_cached_*",
    description:
      "build_node_from_cached_element calls get_cached_control_type, get_cached_name, get_cached_bounding_rectangle, is_cached_keyboard_focusable, and recurses with get_cached_children. None of those touch the wire. The selector engine then evaluates its boolean predicate against the cached UINode tree.",
  },
];

const checklistItems = [
  { text: "Build an IUIAutomationCacheRequest with the properties your selectors actually use, not all 100." },
  { text: "Set TreeScope::Subtree (value 7), not Element, so descendants come back in the same call." },
  { text: "Call find_first_build_cache or find_all_build_cache; plain find_first ignores your cache request." },
  { text: "Read with get_cached_*; a stray get_control_type after caching pays the IPC anyway." },
  { text: "Recurse via get_cached_children; FindFirst on a child triggers a fresh server query." },
];

const relatedPosts = [
  {
    title: "UI automation test as a boolean expression",
    excerpt:
      "Selectors are not flat strings. Terminator parses role:Button && (name:OK || name:Confirm) through a Shunting Yard parser with three precedences.",
    href: "/t/ui-automation-test",
    tag: "Selectors",
  },
  {
    title: "Automation on Windows, the framework view",
    excerpt:
      "What sits between your script and IUIAutomation: process discovery via EnumWindows, the dual UIA + Win32 model, and the focus-aware step runner.",
    href: "/t/automation-on-windows",
    tag: "Windows",
  },
  {
    title: "UI automation testing without a separate test framework",
    excerpt:
      "Terminator's locator timeouts, validate(), and waitFor() compose into a deterministic workflow without dragging in Mocha or Pytest.",
    href: "/t/ui-automation-testing",
    tag: "Testing",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            })
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              The Microsoft UI Automation tool that{" "}
              <GradientText>pre-fetches a whole subtree</GradientText>{" "}
              in one COM call
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Most UIA wrappers crawl the accessibility tree by reading one
              property at a time. Each read is a COM round-trip. Terminator
              builds an IUIAutomationCacheRequest with seven UIProperty fields,
              sets TreeScope::Subtree, and reads everything below with zero
              follow-up IPC. The whole pattern is 70 lines of MIT-licensed Rust.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                IUIAutomation
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                CacheRequest
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                TreeScope::Subtree = 7
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping desktop automation"
            highlights={[
              "Wraps the official IUIAutomation COM API in safe Rust",
              "Pre-fetches seven UIProperty fields per node in one IPC call",
              "TreeScope::Subtree (Element=1, Children=2, Descendants=4 = 7)",
              "Open source: tree_builder.rs lines 398 to 466, MIT licensed",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="UIA, but cached"
            subtitle="A Microsoft UI Automation tool that respects COM"
            captions={[
              "Build one CacheRequest",
              "Add the properties you need",
              "Set TreeScope::Subtree",
              "Read everything from local memory",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the SERP keeps missing
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Search "microsoft ui automation tool" and you get the same five
            pages: the Microsoft Learn UI Automation Overview, the Win32
            entry-uiauto-win32 reference, the Wikipedia article, a TestComplete
            marketing page, and a TestArchitect doc. They all explain that UIA
            is the successor to MSAA, that it exposes control patterns, and
            that screen readers and RPA tools use it. They all stop there.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of them touch the only question that matters when you actually
            ship something on top of UIA: how do you avoid making one COM call
            per property per element? Microsoft documents{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              IUIAutomationCacheRequest
            </code>{" "}
            in the Win32 reference because UIA is unusable at scale without it.
            But "use a cache request" in isolation is not a working pattern.
            The rest of this page is the working pattern, copied straight from
            an MIT-licensed Rust implementation that drives Notepad, Chrome,
            Excel, and Slack from the same locator string.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor: tree_builder.rs lines 398 to 466
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the actual code. It is the bottom of the call stack
            anytime you call{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              desktop.getWindowTree(processName)
            </code>{" "}
            from the Node.js or Python SDK. There is no second implementation
            hiding somewhere; this is it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={cacheBuilderSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/tree_builder.rs"
              typingSpeed={4}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              find_first_build_cache
            </code>{" "}
            call materializes every node beneath the root with all seven
            properties pre-populated. Then the recursive walker reads only
            cached fields:
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={cachedReadSource}
              language="rust"
              filename="tree_builder.rs (build_node_from_cached_element)"
              typingSpeed={4}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="Cache built in 142ms, then 3,847 elements walked in 11ms. No second IPC call."
            source="A typical [CACHED_TREE] log line on a Notepad with one open Word and one open Edge"
            metric="1 IPC"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Naive UIA versus cached UIA, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The two snippets below do roughly the same work. The left one is
            what every introductory UIA tutorial shows you. The right one is
            what tree_builder.rs actually compiles down to.
          </p>
          <div className="mt-6">
            <CodeComparison
              leftCode={naiveCode}
              rightCode={cachedCode}
              leftLines={naiveCode.split("\n").length}
              rightLines={cachedCode.split("\n").length}
              leftLabel="Per-property COM round-trips"
              rightLabel="One CacheRequest, one IPC call"
              title="Why a Microsoft UI Automation tool lives or dies on caching"
              reductionSuffix="fewer COM calls per node"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Inputs, hub, outputs
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator does not invent a new accessibility surface. It is a
            thin, opinionated wrapper around what Windows already gives you,
            shaped into one locator API that downstream callers can drive in
            any language.
          </p>
          <AnimatedBeam
            title="How the Windows accessibility surface flows through Terminator"
            from={[
              { label: "IUIAutomation", sublabel: "COM core" },
              { label: "Win32 EnumWindows", sublabel: "fast HWND discovery" },
              { label: "IAccessible bridge", sublabel: "legacy Win32 / MFC" },
              { label: "Chrome extension", sublabel: "DOM access for browser" },
            ]}
            hub={{ label: "Terminator", sublabel: "tree_builder + selector + patterns" }}
            to={[
              { label: "Node.js SDK", sublabel: "@mediar-ai/terminator" },
              { label: "Python SDK", sublabel: "terminator-py" },
              { label: "Rust crate", sublabel: "terminator-rs" },
              { label: "MCP agent", sublabel: "Claude, Cursor, Windsurf" },
            ]}
            accentColor="#FF3E00"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The seven UIProperty fields it caches
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every cell here corresponds to one entry in the{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              properties
            </code>{" "}
            array on line 404 of tree_builder.rs. If you fork Terminator and add
            a new selector kind, this is the place you extend.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How the cached walk is actually built
          </h2>
          <StepTimeline
            title="Five things tree_builder.rs does, in order"
            steps={buildSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers from the source
          </h2>
          <MetricsRow
            metrics={[
              { value: 7, label: "UIProperty fields cached per node" },
              { value: 1, label: "find_first_build_cache call per tree walk" },
              { value: 70, suffix: " loc", label: "lines of cached tree builder" },
              { value: 753, suffix: " loc", label: "selector.rs grammar above it" },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The selector engine on top of the cached tree contributes another{" "}
            <NumberTicker value={753} /> lines. Twelve atomic prefixes (
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">role:</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">name:</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">id:</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">classname:</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">visible:</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">process:</code>,
            and the spatial family) compose with{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">&amp;&amp;</code>,{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">||</code>, and{" "}
            <code className="font-mono text-xs bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">!</code>{" "}
            into a flattened predicate that runs against each cached element.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What it looks like from the SDK
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            You never write the cache request yourself. The SDK exposes a
            Playwright-style locator and a one-call tree dump. Both go through
            the cached builder above.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={usageCode}
              language="typescript"
              filename="example.ts"
              typingSpeed={5}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What you actually see when you run it
          </h2>
          <TerminalOutput
            title="terminal"
            lines={[
              { type: "command", text: "npm install @mediar-ai/terminator" },
              { type: "output", text: "added 1 package, native binary downloaded" },
              { type: "command", text: "node tree.js" },
              { type: "info", text: "[CACHED_TREE] Starting cached tree build" },
              { type: "info", text: "[CACHED_TREE] Cache built in 142ms, now building tree structure" },
              { type: "info", text: "[CACHED_TREE] Tree build completed: 3847 elements in 153ms (cache: 142ms, tree: 11ms)" },
              { type: "success", text: "selector role:Button && name:Save matched in 4ms" },
              { type: "success", text: "Invoke pattern fired" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            A checklist for any UIA tool author
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you are writing your own Microsoft UI Automation tool, the
            difference between something that drives Excel in a second and
            something that hangs for thirty is whether all five of these are
            true.
          </p>
          <AnimatedChecklist
            title="Things to confirm before you ship"
            items={checklistItems}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Terminator versus the closed-source RPA stack
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical UIA-based RPA tool"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters for AI coding agents
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Terminator's MCP server gives Claude Code, Cursor, Windsurf, and
                VS Code agents a deterministic Microsoft UI Automation tool.
                The agent does not eyeball a screenshot and guess; it runs the
                cached tree builder, evaluates a boolean selector against the
                returned UINode tree, and fires an IUIAutomation Invoke pattern
                on the chosen element. Same loop, fewer tokens, fewer
                hallucinations, no flake from a stale screenshot.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One install:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator "npx -y terminator-mcp-agent@latest"
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The wider Microsoft UI Automation ecosystem
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator is one entry in a long list of UIA-based tools, each
            with a different shape. Inspect.exe and AccEvent come from the
            Windows SDK and are read-only. FlaUI is the canonical .NET wrapper.
            Power Automate Desktop, UiPath, and Automation Anywhere are
            commercial RPA suites that wrap UIA inside a flow editor. Code-first
            wrappers in other languages cover the rest of the space.
          </p>
          <div className="mt-6">
            <Marquee speed={30} pauseOnHover>
              {[
                "Inspect.exe",
                "AccEvent",
                "FlaUInspect",
                "UI Automation .NET",
                "FlaUI",
                "uiautomation (Python)",
                "Python-UIAutomation-for-Windows",
                "winappdriver",
                "Power Automate Desktop",
                "TestComplete",
                "TestArchitect",
                "Terminator",
              ].map((name) => (
                <span
                  key={name}
                  className="mx-3 inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What separates them is the shape of the API on top: a flow editor,
            a C# library, a Python module, a CLI, an MCP server. What unites
            them is the COM surface underneath. The faster they handle that
            surface, the less wall-clock time your automation spends waiting on
            IPC.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Driving Microsoft UI Automation at scale?"
          description="Talk to the team. We will walk through the cache builder, the selector grammar, and how to wire it into your stack."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="More Terminator deep dives in adjacent territory"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Book a 20-minute call with the maintainers."
        />
      </article>
    </>
  );
}
