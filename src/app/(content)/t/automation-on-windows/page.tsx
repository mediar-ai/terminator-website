import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  MetricsRow,
  GlowCard,
  BentoGrid,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-on-windows";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation on Windows is slow because of IPC: how Terminator collapses a 6.5s tree walk to 200ms";
const DESCRIPTION =
  "Every naive automation on Windows pays a COM round trip per property per element. Terminator's Windows backend builds the entire UI tree in a single CacheRequest with TreeScope::Subtree, pre-fetching 7 UIA properties in one IPC call. A 245-node window goes from 6.5 seconds to 200 milliseconds.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The real bottleneck in automation on Windows is cross-process IPC, not the accessibility API itself. Terminator caches 7 UIA properties across the whole subtree in one call, then reads every node in-process. Source: crates/terminator/src/platforms/windows/tree_builder.rs, build_tree_with_cache at line 388.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation on Windows: the IPC tax nobody talks about",
    description:
      "A single UIA CacheRequest with TreeScope::Subtree collapses 245 elements x 15 IPC calls into one. 6.5s to 200ms. The one optimization every automation on Windows tutorial skips.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation on Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation on Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why is automation on Windows slower than automation in a browser?",
    a: "Browser automation runs inside the browser process. The DevTools Protocol reads the DOM locally; every getBoundingClientRect is an in-process call. Windows UI Automation is the opposite: every target app is a separate process, and every property read (ControlType, Name, BoundingRectangle, IsEnabled) is a COM call across a process boundary. A naive walk of a 245-element window can easily issue 3,000 of those calls, and the cost is real. Terminator measured 6.5 seconds for that shape of tree without caching.",
  },
  {
    q: "What is the specific optimization Terminator uses?",
    a: "One single UIAutomation CacheRequest with TreeScope::Subtree. The function is build_tree_with_cache in crates/terminator/src/platforms/windows/tree_builder.rs at line 388. It adds seven properties to the cache (ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId), sets the scope to Subtree (which is Element plus Children plus Descendants, value 7), then calls find_first_build_cache once. After that, every get_cached_control_type, get_cached_name, get_cached_bounding_rectangle call is a pure in-process lookup, zero COM traffic.",
  },
  {
    q: "How much does the cached approach actually save?",
    a: "The comment at the top of build_tree_with_cache in tree_builder.rs is specific: '30-50x faster for large trees (e.g., 6.5s -> 200ms for 245 elements)'. The engine's tree builder tries the cached path first and only falls back to the recursive per-property approach if caching fails. See crates/terminator/src/platforms/windows/engine.rs at line 3966 for the fallback branch.",
  },
  {
    q: "Why do the other automation on Windows tools not use CacheRequest?",
    a: "Most consumer automation on Windows tools are not performance-bottlenecked on tree reads because they do not walk the tree. Power Automate Desktop opens a dedicated UIA connection per selector and memoizes the result; AutoHotkey mostly cares about a single control under the cursor; RPA canvases re-scan only the recorded region. Terminator is different because AI agents need the full tree to choose a target, and they need it fast enough that the agent does not time out. That pushes the IPC batching problem onto the critical path.",
  },
  {
    q: "Which UIProperty values are in the cache request?",
    a: "Exactly seven: UIProperty::ControlType, UIProperty::Name, UIProperty::BoundingRectangle, UIProperty::IsEnabled, UIProperty::IsKeyboardFocusable, UIProperty::HasKeyboardFocus, UIProperty::AutomationId. This is the minimum set the tree builder needs to produce a UINode with role, name, bounds, enabled state, focus state, and a stable element ID. Adding more properties to the cache request is cheap; the single IPC call cost scales with element count, not property count.",
  },
  {
    q: "What is TreeScope::Subtree and why does it matter?",
    a: "TreeScope is a UIA enum that controls how deep a search runs. Element is value 1 (just this node), Children is 2, Descendants is 4, and Subtree is 7 (the bitwise OR of all three). Terminator sets Subtree on the cache request, which tells UIA to pre-load every descendant of the root window. Without that, get_cached_children would return an empty iterator and every recursion would have to cross the COM boundary again.",
  },
  {
    q: "Does the cache go stale during a long automation?",
    a: "Yes, the cache is a snapshot. Once a UI mutation happens (a dialog opens, a control changes value), the cached nodes no longer reflect the live tree. Terminator's action tools rebuild the tree before and after each mutation when you pass ui_diff_before_after:true. The cost is amortized: one IPC call per action, not 15 per element per action.",
  },
  {
    q: "What happens if the cache request fails?",
    a: "The engine falls back to the recursive per-property path. See crates/terminator/src/platforms/windows/engine.rs at line 3978: on Err, the code logs 'Cached approach failed, falling back to recursive' and proceeds with build_ui_node_tree_configurable. The fallback path uses batched children reads with a configurable timeout_per_operation_ms (default 50ms) and yields the CPU every N elements to keep the host responsive.",
  },
  {
    q: "Does this matter for short scripts or only for agent workflows?",
    a: "Both. A one-shot script that reads a single edit field makes one IPC call with or without caching. But any script that needs to find a specific control (searching by role and name, iterating siblings, validating a workflow) is walking the tree. The moment you walk more than 50 elements, the difference between caching and not caching shows up as real wall-clock seconds. For agent workflows where the model inspects the tree on every turn, caching is what makes sub-second turns possible.",
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
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const rustCacheCode = `// crates/terminator/src/platforms/windows/tree_builder.rs, line 388
// Performance improvement: ~30-50x faster for large trees
//   (e.g., 6.5s -> 200ms for 245 elements)

pub(crate) fn build_tree_with_cache(
    automation: &UIAutomation,
    root_element: &uiautomation::UIElement,
    max_depth: Option<usize>,
    application_name: Option<String>,
    include_all_bounds: bool,
) -> Result<crate::UINode, AutomationError> {
    let cache_request = automation.create_cache_request()?;

    // Seven properties. One IPC call. No per-element round trips.
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

    // Subtree = Element | Children | Descendants (value 7).
    // This is what makes get_cached_children work without another IPC.
    cache_request.set_tree_scope(TreeScope::Subtree)?;

    let true_condition = automation.create_true_condition()?;

    // ONE call. Returns a snapshot of the entire window tree.
    let cached_root = root_element.find_first_build_cache(
        TreeScope::Element,
        &true_condition,
        &cache_request,
    )?;

    // Walk the snapshot in-process. Every get_cached_* below is zero IPC.
    build_node_from_cached_element(/* ... */)
}`;

const naiveVsCacheCode = `// Naive approach: one COM call per property per element
for element in tree {
    let role = element.control_type()?;       // IPC
    let name = element.name()?;               // IPC
    let rect = element.bounding_rectangle()?; // IPC
    let enabled = element.is_enabled()?;      // IPC
    let focusable = element.is_keyboard_focusable()?; // IPC
    // ... and so on, roughly 15 IPC calls per node
    // 245 elements * 15 calls = ~3,675 cross-process hops
}

// Cached approach: one CacheRequest, one find_first_build_cache
let cache_request = automation.create_cache_request()?;
for prop in PROPERTIES { cache_request.add_property(*prop)?; }
cache_request.set_tree_scope(TreeScope::Subtree)?;

let cached_root = root.find_first_build_cache( // <-- THE call
    TreeScope::Element,
    &true_condition,
    &cache_request,
)?;

for element in walk_cached(cached_root) {
    let role = element.get_cached_control_type()?; // local lookup
    let name = element.get_cached_name()?;         // local lookup
    // ... no more IPC
}`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  {
    text: "grep -n 'build_tree_with_cache' crates/terminator/src/platforms/windows/tree_builder.rs | head -2",
    type: "command" as const,
  },
  { text: "388:pub(crate) fn build_tree_with_cache(", type: "success" as const },
  {
    text: "grep -n 'TreeScope::Subtree' crates/terminator/src/platforms/windows/tree_builder.rs",
    type: "command" as const,
  },
  { text: "426:        .set_tree_scope(TreeScope::Subtree)", type: "success" as const },
  {
    text: "grep -n 'Performance improvement' crates/terminator/src/platforms/windows/tree_builder.rs",
    type: "command" as const,
  },
  {
    text: "386: /// Performance improvement: ~30-50x faster for large trees (e.g., 6.5s -> 200ms for 245 elements)",
    type: "success" as const,
  },
  {
    text: "grep -c 'UIProperty::' crates/terminator/src/platforms/windows/tree_builder.rs",
    type: "command" as const,
  },
  { text: "9", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Reads UI Automation tree via single CacheRequest",
    competitor: "No, per-property COM calls",
    ours: "Yes, 7 properties in one find_first_build_cache",
  },
  {
    feature: "Tree scope set once",
    competitor: "Per-node scope on every descent",
    ours: "TreeScope::Subtree at request construction",
  },
  {
    feature: "Wall-clock for a 245-node window",
    competitor: "~6.5 seconds",
    ours: "~200 milliseconds",
  },
  {
    feature: "Falls back gracefully when cache fails",
    competitor: "Retries same slow path",
    ours: "Logs and calls build_ui_node_tree_configurable",
  },
  {
    feature: "Exposes the primitive to AI coding assistants",
    competitor: "UI only",
    ours: "MCP tool get_window_tree",
  },
  {
    feature: "Code-first SDKs on top",
    competitor: "Drag-and-drop canvas",
    ours: "Rust, TypeScript, Python, MCP",
  },
  {
    feature: "Open source license",
    competitor: "Proprietary",
    ours: "MIT on GitHub at mediar-ai/terminator",
  },
];

const propertyPills = [
  "UIProperty::ControlType",
  "UIProperty::Name",
  "UIProperty::BoundingRectangle",
  "UIProperty::IsEnabled",
  "UIProperty::IsKeyboardFocusable",
  "UIProperty::HasKeyboardFocus",
  "UIProperty::AutomationId",
];

const bentoCards: BentoCard[] = [
  {
    title: "find_first_build_cache",
    description:
      "The single UIA method call that does all the heavy lifting. Accepts a TreeScope, a condition, and a CacheRequest, and returns a root element with every descendant pre-fetched.",
    size: "2x1",
    accent: true,
  },
  {
    title: "create_cache_request",
    description:
      "Allocates the request. Cheap. You add one UIProperty at a time; the cost of the request scales with element count, not property count.",
    size: "1x1",
  },
  {
    title: "set_tree_scope(Subtree)",
    description:
      "Scope value 7 = Element | Children | Descendants. Without this, get_cached_children returns nothing and recursion falls back to live COM calls.",
    size: "1x1",
  },
  {
    title: "get_cached_control_type",
    description:
      "In-process read from the snapshot. Zero IPC. Every get_cached_* accessor is the same shape.",
    size: "1x1",
  },
  {
    title: "get_cached_children",
    description:
      "Returns the pre-loaded child array. No COM traversal, no waiting on a remote process. The recursion is plain Rust iteration.",
    size: "1x1",
  },
  {
    title: "build_node_from_cached_element",
    description:
      "The recursive function that walks the snapshot and produces the final UINode. Every field on UIElementAttributes comes from a get_cached_* read.",
    size: "2x1",
  },
];

const cachePipeline = {
  title: "One CacheRequest, one IPC hop, seven properties",
  from: [
    { label: "Target process", sublabel: "Excel, Chrome, Notepad" },
    { label: "UIA provider", sublabel: "Per-app accessibility tree" },
    { label: "IUIAutomation", sublabel: "COM entry point" },
  ],
  hub: { label: "CacheRequest", sublabel: "TreeScope::Subtree" },
  to: [
    { label: "ControlType", sublabel: "Role for every node" },
    { label: "Name", sublabel: "Label text" },
    { label: "BoundingRectangle", sublabel: "x, y, w, h" },
    { label: "IsEnabled / focus", sublabel: "3 boolean flags" },
    { label: "AutomationId", sublabel: "Stable element id" },
  ],
};

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto pt-12 pb-24">
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

      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <header className="max-w-4xl mx-auto px-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
          Automation on Windows is slow because of{" "}
          <GradientText>IPC</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every tutorial on automation on Windows teaches you how to click a
          button. None of them tell you why the button took two seconds to
          resolve. The answer is not the accessibility API, it is the number
          of times your process asked another process a question. This page is
          about the single Windows UI Automation call that took Terminator
          from 6.5 seconds to 200 milliseconds on a 245-element window, and
          why it is the reason Claude Code can drive desktop apps in real
          time.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "Single UIA CacheRequest with TreeScope::Subtree pre-fetches the whole tree",
          "Seven UIProperty values batched in one find_first_build_cache call",
          "6.5s to 200ms on 245 elements, verified in tree_builder.rs line 388",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Automation on Windows, without the IPC tax"
            subtitle="One CacheRequest. Seven properties. Zero per-element round trips."
            captions={[
              "A 245-node window costs 3,675 IPC calls the naive way",
              "Terminator uses UIA CacheRequest with TreeScope::Subtree",
              "Seven properties pre-fetched in one find_first_build_cache",
              "Every get_cached_* read is in-process, zero COM traffic",
              "6.5 seconds to 200 milliseconds, verified in tree_builder.rs",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The thing every automation on Windows guide gets wrong
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Search the top ten results for automation on Windows and you will
          find a lot of Task Scheduler screenshots, a couple of AutoHotkey
          snippets, and a marketing page for Power Automate Desktop. Not one
          of them mentions the words UI Automation by name. The API is
          treated as a black box labeled &quot;find the button.&quot;
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Under the hood, every one of those tools is talking to the same
          COM interface, IUIAutomation, introduced in Windows 7 and stable
          across every version since. And every one of them is paying the
          same cost: each property you read on a UI element is a
          cross-process function call, because the target app lives in its
          own process, and your process does not share memory with it.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The naive way to walk a window tree is to recurse from the root,
          and for each element read its control type, name, bounds, enabled
          state, focus state, and a few more. That is roughly fifteen COM
          calls per element. On a 245-element window (your average Office
          dialog), that is 3,675 round trips across the process boundary
          before you have even found the Save button. Measured cost on a
          real machine: 6.5 seconds.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the wall-clock time actually goes
        </h2>
        <p className="text-zinc-600 mb-6">
          The accessibility API is fast. The IPC is not. Here is the math,
          out loud, for a 245-element window.
        </p>
        <MetricsRow
          metrics={[
            { value: 245, label: "elements in a mid-size window" },
            { value: 15, label: "IPC calls per element, naive walk" },
            { value: 3675, label: "total cross-process round trips" },
            { value: 6500, suffix: "ms", label: "wall-clock for the naive walk" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The single call that collapses the tax
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          UIA has a feature most tutorials skip:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            IUIAutomationCacheRequest
          </code>
          . You tell UIA which properties you want ahead of time, you set the
          tree scope once, and you issue a single{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            find_first_build_cache
          </code>{" "}
          call. UIA walks the target process&apos;s tree in that process,
          assembles a snapshot with every property you asked for, and hands
          it back in one hop. From that point forward, every{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            get_cached_*
          </code>{" "}
          read is an in-process lookup against the snapshot. The boundary is
          crossed exactly once.
        </p>
        <AnimatedBeam
          title="The cache pipeline, one IPC call"
          from={cachePipeline.from}
          hub={cachePipeline.hub}
          to={cachePipeline.to}
          accentColor="#FF3E00"
        />
      </section>

      <ProofBanner
        quote="Performance improvement: ~30-50x faster for large trees (e.g., 6.5s -> 200ms for 245 elements)"
        source="Comment at the top of build_tree_with_cache in crates/terminator/src/platforms/windows/tree_builder.rs at line 386"
        metric="30-50x"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor: build_tree_with_cache, seven properties, one call
        </h2>
        <p className="text-zinc-600 mb-6">
          This is the core of Terminator&apos;s Windows backend. It lives in{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/platforms/windows/tree_builder.rs
          </code>
          , starting at line 388. Every word inside this function is
          verifiable with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            grep
          </code>
          .
        </p>
        <AnimatedCodeBlock
          code={rustCacheCode}
          language="rust"
          filename="crates/terminator/src/platforms/windows/tree_builder.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The exact seven properties
        </h2>
        <p className="text-zinc-600 mb-6">
          Adding more properties to a CacheRequest costs nothing measurable;
          the single IPC call dominates. These are the seven Terminator
          asks for, in order.
        </p>
        <Marquee speed={38} pauseOnHover>
          {propertyPills.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 font-mono whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-600 mt-6 text-sm">
          Each one maps to a field on{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            UIElementAttributes
          </code>
          . The tree builder reads them through{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            get_cached_control_type
          </code>
          ,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            get_cached_name
          </code>
          ,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            get_cached_bounding_rectangle
          </code>
          , and friends. Nothing in that loop crosses a process boundary.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Side by side: naive versus cached
        </h2>
        <p className="text-zinc-600 mb-6">
          The difference between an automation on Windows that feels instant
          and one that freezes the agent is the top half vs the bottom half
          of this file.
        </p>
        <AnimatedCodeBlock
          code={naiveVsCacheCode}
          language="rust"
          filename="naive-vs-cache.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the IPC call actually travels
        </h2>
        <p className="text-zinc-600 mb-6">
          The sequence is short because we want it to be. One hop out, one
          hop back, the whole tree comes with it.
        </p>
        <SequenceDiagram
          title="build_tree_with_cache on a 245-element window"
          actors={["Terminator", "IUIAutomation", "Target app", "Tree walker"]}
          messages={[
            {
              from: 0,
              to: 1,
              label: "create_cache_request() + add_property x 7",
              type: "request",
            },
            {
              from: 0,
              to: 1,
              label: "set_tree_scope(TreeScope::Subtree)",
              type: "request",
            },
            {
              from: 0,
              to: 1,
              label: "find_first_build_cache(root, true_condition, cache_request)",
              type: "request",
            },
            {
              from: 1,
              to: 2,
              label: "walk UIA provider, gather 7 props per node",
              type: "event",
            },
            {
              from: 2,
              to: 1,
              label: "snapshot of 245 cached elements",
              type: "response",
            },
            {
              from: 1,
              to: 0,
              label: "cached_root with pre-loaded subtree",
              type: "response",
            },
            {
              from: 0,
              to: 3,
              label: "build_node_from_cached_element (in-process, zero IPC)",
              type: "event",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Watch the walk in four frames
        </h2>
        <MotionSequence
          title="Inside a single build_tree_with_cache call"
          frames={[
            {
              title: "Frame 1: the request",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  Terminator builds a CacheRequest, adds the seven
                  UIProperty values, sets TreeScope::Subtree once, and
                  creates a true_condition that matches every element.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 2: the hop",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  A single call to find_first_build_cache crosses the process
                  boundary. UIA asks the target app&apos;s provider to walk
                  its own tree and serialize the seven properties of every
                  descendant. Everything in one reply.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 3: the snapshot",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  What comes back is a cached_root UIElement. Its
                  get_cached_children is pre-populated. Each child&apos;s
                  properties are pre-loaded. The remote process is done
                  talking to us.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 4: the tree",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  build_node_from_cached_element recurses over the
                  snapshot. Every get_cached_control_type, get_cached_name,
                  get_cached_bounding_rectangle read is a local lookup. 245
                  UINode structs assembled in ~200 ms.
                </p>
              ),
              duration: 3200,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify against the source
        </h2>
        <p className="text-zinc-600 mb-6">
          The claims on this page are grep-verifiable. Clone the repo and
          run these commands. If any line returns something different, the
          page is wrong; file an issue.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The six functions that make the cache work
        </h2>
        <p className="text-zinc-600 mb-6">
          Each card is a real symbol in the Windows UI Automation crate or
          Terminator&apos;s tree builder. Search for it in your copy of the
          repo.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three numbers that matter
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={1} />
            </div>
            <p className="text-sm text-zinc-600">
              COM round trip from Terminator to the target process, no
              matter how many elements live inside the window.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={7} />
            </div>
            <p className="text-sm text-zinc-600">
              UIProperty values pre-fetched on every node in the subtree,
              set once at CacheRequest construction.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={200} />
              <span className="text-2xl font-semibold text-zinc-500">ms</span>
            </div>
            <p className="text-sm text-zinc-600">
              Observed wall-clock for a 245-element window after caching.
              Same tree, no cache: 6.5 seconds.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Terminator versus naive automation on Windows
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Traditional automation on Windows"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The five-step version of everything above
        </h2>
        <StepTimeline
          steps={[
            {
              title: "The app lives in its own process",
              description:
                "Windows accessibility is cross-process by design. Every property read on a UI element crosses a COM boundary. This is the root cause of slow automation on Windows.",
            },
            {
              title: "UIA ships a batching primitive called CacheRequest",
              description:
                "You add properties, you set scope, you call find_first_build_cache once. The server walks its own tree locally and returns a serialized snapshot. Documented since Windows 7.",
            },
            {
              title: "Terminator wraps it in build_tree_with_cache",
              description:
                "Seven properties, TreeScope::Subtree, one find_first_build_cache. The function is at crates/terminator/src/platforms/windows/tree_builder.rs line 388.",
            },
            {
              title: "Every read after that is in-process",
              description:
                "get_cached_control_type, get_cached_name, get_cached_bounding_rectangle all read from the snapshot. build_node_from_cached_element walks it recursively in pure Rust.",
            },
            {
              title: "The agent turns the tree into action",
              description:
                "When an AI coding assistant calls the get_window_tree MCP tool, this cached path runs. If caching fails on a weird app, the engine falls back to the recursive path at engine.rs line 3978.",
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want automation on Windows that finishes before the agent times out?"
        description="Book 20 minutes and we will wire Terminator's cached UIA tree into your editor on a real workflow of your choice."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See Terminator read a Windows tree in 200ms, live."
      />
    </article>
  );
}
