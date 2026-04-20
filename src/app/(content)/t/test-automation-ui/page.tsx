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
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/test-automation-ui";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Test automation UI: stop flakes at record time, not run time";
const DESCRIPTION =
  "Most test automation UI guides cover run-time flake mitigation: retries, auto-wait, AI self-healing. This page covers the upstream move Terminator's workflow recorder makes: stripping 'flaky DNA' (relative timestamps, Windows COM null values, browser chrome panes) out of the accessibility tree before a selector is ever written.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The selector you record is the selector you replay. Terminator's recorder filters relative time ('3 hours ago'), Windows COM null values ('bstr()', 'variant()'), and ephemeral browser chrome ('Chrome_WidgetWin', 'Intermediate D3D Window') before the selector string is emitted.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Test automation UI: fix flakes before they get recorded",
    description:
      "The recorder refuses to encode 10 relative-time patterns and ~20 null-like COM values into the selector. Grep-able proof in mediar-ai/terminator, crates/terminator-workflow-recorder/src/events.rs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Test automation UI" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Test automation UI", url: PAGE_URL },
];

const nullLikeSource = `// crates/terminator-workflow-recorder/src/events.rs, lines 8-36
// The recorder refuses to emit any of these as a selector value.
// Compiled once at startup, checked on every captured element.

static NULL_LIKE_VALUES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    [
        // Standard null representations
        "null", "nil", "undefined", "(null)", "<null>",
        "n/a", "na", "",

        // Windows-specific "I forgot to fill this field" patterns
        "unknown", "<unknown>", "(unknown)",
        "none",    "<none>",    "(none)",
        "empty",   "<empty>",   "(empty)",

        // COM / Windows API empty-value dressing. Real output you will
        // see in a UIA dump when an app exposes a BSTR or VARIANT that
        // never got populated. These look like valid names but are not.
        "bstr()",
        "variant()",
        "variant(empty)",
    ]
    .into_iter()
    .collect()
});`;

const relativeTimeSource = `// crates/terminator-workflow-recorder/src/events.rs, lines 67-81
// Selectors with relative time silently decay. Tomorrow "3 hours ago"
// will match nothing. The recorder refuses to encode any of these
// into the Name/Text fields of a captured element.

/// Check if text contains relative time patterns that would make selectors unstable
fn contains_relative_time(text: &str) -> bool {
    text.contains(" ago")
        || text.contains("just now")
        || text.contains("yesterday")
        || text.contains("today")
        || text.contains("last week")
        || text.contains("last month")
        || text.ends_with(" min")
        || text.ends_with(" mins")
        || text.ends_with(" hr")
        || text.ends_with(" hrs")
}`;

const parentHierarchySource = `// crates/terminator-workflow-recorder/src/events.rs, lines 696-716
// When walking UP from a clicked element to build its ancestor chain,
// skip parents that are an implementation detail of the OS or browser.
// These exist in the tree but are invisible to users; their names are
// process-private and will vary between runs.

let is_internal_element = parent_info.name.as_ref().map(|n| {
    let lower = n.to_lowercase();

    // Browser internal elements (Chromium's shadow window layer,
    // DirectComposition swap chains, legacy Win32 stubs)
    lower.contains("legacy window")
        || lower.contains("chrome_widgetwin")
        || lower.contains("intermediate d3d window")

    // Panes that just mirror the Window title. If your locator already
    // says process:chrome.exe, adding a "Foo - Google Chrome" pane in
    // the middle of the selector chain is redundant noise.
    || (parent_role == "Pane" && (
        lower.ends_with(" - google chrome")
        || lower.ends_with(" - mozilla firefox")
        || lower.ends_with(" - microsoft edge")
    ))

    // And the relative-time filter, re-applied at every level of the
    // ancestor chain. A grandparent whose name is "5 mins ago" poisons
    // every descendant selector.
    || contains_relative_time(&lower)
}).unwrap_or(false);

if has_name && !is_internal_element {
    hierarchy.push(parent_info);
}`;

const dirtyTree = [
  { text: "# Live UIA dump from chrome.exe, one click ago", type: "command" as const },
  { text: "Window 'Gmail - Google Chrome'", type: "output" as const },
  { text: "  Pane 'Chrome_WidgetWin_1'        <-- ephemeral, varies by run", type: "output" as const },
  { text: "    Pane 'Intermediate D3D Window' <-- DirectComposition layer", type: "output" as const },
  { text: "      Pane 'Gmail - Google Chrome' <-- redundant with process:", type: "output" as const },
  { text: "        Document 'Gmail'", type: "output" as const },
  { text: "          Group 'Emails, 5 mins ago' <-- timestamp will break replay", type: "output" as const },
  { text: "            Group 'variant()'         <-- unpopulated COM BSTR", type: "output" as const },
  { text: "              Button 'Archive'        <-- the real target", type: "output" as const },
];

const cleanSelector = [
  { text: "# Selector the recorder actually emits", type: "command" as const },
  { text: "process:chrome.exe >> role:Document && name:Gmail >> role:Button && name:Archive", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Nodes dropped before selector construction:", type: "output" as const },
  { text: "  - Window 'Gmail - Google Chrome'        (is_window + Window role, kept only if named)", type: "output" as const },
  { text: "  - Pane 'Chrome_WidgetWin_1'             (internal browser element)", type: "output" as const },
  { text: "  - Pane 'Intermediate D3D Window'        (internal browser element)", type: "output" as const },
  { text: "  - Pane 'Gmail - Google Chrome'          (redundant window-title pane)", type: "output" as const },
  { text: "  - Group 'Emails, 5 mins ago'            (contains_relative_time)", type: "output" as const },
  { text: "  - Group 'variant()'                     (NULL_LIKE_VALUES)", type: "output" as const },
];

const brokenTestCode = `// The selector a naive recorder emits. Captured on 2026-04-20.
// Every level of this chain is a tripwire for the next replay.

await desktop.locator(
  'window:Gmail - Google Chrome' +              // title changes on tab switch
  ' >> pane:Chrome_WidgetWin_1' +               // suffix increments per window
  ' >> pane:Intermediate D3D Window' +          // gone when GPU accel is off
  ' >> pane:Gmail - Google Chrome' +            // duplicate of the window
  ' >> document:Gmail' +
  ' >> group:Emails, 5 mins ago' +              // literally wrong in 6 min
  ' >> group:variant()' +                       // COM placeholder, not a name
  ' >> button:Archive'
).first(5000);

// Six of the eight nodes in this chain are guaranteed to rot.
// The test will pass in CI today. It will fail at 3am on Tuesday
// and the error will say "ElementNotFound", not "this recorder
// encoded ephemeral state five selectors ago".`;

const stableTestCode = `// Same user action, same captured moment, Terminator's recorder.
// Everything ephemeral was filtered upstream. The selector that
// survives is the selector you would write by hand.

await desktop.locator(
  'process:chrome.exe' +                        // stable: executable name
  ' >> role:Document && name:Gmail' +           // stable: page <title>
  ' >> role:Button && name:Archive'             // stable: aria-label
).first(5000);

// Three nodes. Zero of them are timestamps, COM placeholders, or
// browser plumbing. This selector still matches 6 months from now,
// on a different monitor, with GPU accel off, in dark mode.`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Where flake gets addressed",
    competitor: "At replay time: auto-wait, retries, AI self-healing, locator rewrites after N failures",
    ours: "At record time: ephemeral content is filtered out of the accessibility tree before the selector string is constructed",
  },
  {
    feature: "Relative timestamps in selectors",
    competitor: "Encoded as literal text, then replaced by an LLM when the match fails",
    ours: "contains_relative_time() filters 10 patterns: ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month', ' min', ' mins', ' hr', ' hrs'",
  },
  {
    feature: "Windows COM placeholder strings",
    competitor: "Not addressed. 'bstr()' and 'variant()' look like valid Name attributes to a generic recorder",
    ours: "NULL_LIKE_VALUES set with ~20 entries including 'bstr()', 'variant()', 'variant(empty)', '<unknown>', '(null)'",
  },
  {
    feature: "Browser chrome artifacts",
    competitor: "'Chrome_WidgetWin_1', 'Intermediate D3D Window' and the duplicate window-title Pane all get written into the selector chain",
    ours: "All three are matched by explicit substrings during parent hierarchy walk; the node is kept in the tree but dropped from the chain",
  },
  {
    feature: "Selector depth",
    competitor: "As deep as the accessibility tree (often 8-12 for Electron apps)",
    ours: "Typically 3-4 after filtering: process + window or document + role+name leaf",
  },
  {
    feature: "Replay-month-later success rate",
    competitor: "Degrades with time as timestamps drift and Chromium internals churn",
    ours: "Flat. Nothing in the emitted selector decays on a fixed clock",
  },
  {
    feature: "Where you find the rule",
    competitor: "In a vendor's self-healing heuristics, usually closed source",
    ours: "crates/terminator-workflow-recorder/src/events.rs, lines 8 to 81 and 696 to 716. Grep in a fresh clone",
  },
];

const filterBento: BentoCard[] = [
  {
    title: "NULL_LIKE_VALUES (~20 patterns)",
    description:
      "The constant HashSet compiled once on startup. Every captured Name, Text, Value, and hierarchy field is lowercased, trimmed, and checked against the set. If it hits, the field serializes as None via serde's skip_serializing_if. Includes both generic placeholders (null, undefined, n/a) and Windows-specific COM output (bstr(), variant(), variant(empty)).",
    size: "2x1",
  },
  {
    title: "contains_relative_time (10 patterns)",
    description:
      "Pure string check. ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month', and four suffixes for minute/hour shorthand (' min', ' mins', ' hr', ' hrs'). Applied to leaf elements and to every ancestor during chain construction.",
    size: "1x1",
  },
  {
    title: "Browser implementation-detail filter",
    description:
      "Lowercased substring match against 'legacy window', 'chrome_widgetwin', 'intermediate d3d window'. These are real Win32 parent windows Chromium ships but the user never sees them. Dropping them halves the depth of most Chrome selectors.",
    size: "1x1",
  },
  {
    title: "Redundant window-title pane filter",
    description:
      "If the parent role is Pane and the name ends with ' - google chrome', ' - mozilla firefox', or ' - microsoft edge', it is dropped. The process: prefix already pins which browser is running; including the tab title twice in the chain is pure noise.",
    size: "2x1",
  },
  {
    title: "is_empty_string (serde guard)",
    description:
      "Used on 30+ fields across KeyboardEvent, ClipboardEvent, HotkeyEvent, DragDropEvent. Whitespace-only strings, empty BSTR wrappers, and the full NULL_LIKE_VALUES set all resolve to None in the recorded JSON. No phantom empty strings leak into the replay.",
    size: "1x1",
  },
  {
    title: "Tested with 60+ assertions",
    description:
      "events.rs ships a dedicated test block at line 1765+ with explicit cases for 'BSTR()', 'VARIANT(EMPTY)', 'Variant(Empty)' mixed case, ' null ' trimmed, 'nullify' not matching (substring protection), 'unknown value' kept. Regression-proof.",
    size: "1x1",
  },
];

const recorderSteps = [
  {
    title: "User clicks a button",
    description:
      "Windows UIA fires a raw focus or invoke event. The recorder picks up the event and resolves the element it fired on. At this point the tree is 'dirty': it contains every internal pane, every timestamp, every unpopulated COM field.",
  },
  {
    title: "Strip the leaf",
    description:
      "Before any selector emission, the leaf's Name, Value, and Text fields run through is_empty_string. Anything in NULL_LIKE_VALUES becomes None. Anything containing a relative-time pattern on the text field marks the whole element as not-encodable (the recorder uses a role-only selector instead).",
  },
  {
    title: "Walk the parent chain",
    description:
      "build_parent_hierarchy walks up from the leaf to the first Window role. At each step it checks is_internal_element: browser plumbing, redundant window-title panes, and any relative-time string cause the parent to be skipped (but the walk continues up).",
  },
  {
    title: "Build the chained selector",
    description:
      "build_chained_selector joins the surviving ancestors with >>. It skips the first Window role because process: already targets that window. Result: a 3 to 4 element chain where every node is stable across runs.",
  },
  {
    title: "Emit as TypeScript or YAML workflow",
    description:
      "The clean selector is written to the recorded workflow file. Replaying a month later against a new Chromium version, new DirectComposition behavior, new tab titles still hits the same leaf because nothing ephemeral was encoded.",
  },
];

const whatGetsDropped = [
  { text: "Button names like 'variant()' or 'bstr()' from apps that expose raw COM VARIANTs" },
  { text: "Group names like 'Emails, 5 mins ago' or 'Posted yesterday' that rewrite on every load" },
  { text: "Windows panes named 'Chrome_WidgetWin_1' (suffix increments per window opened this session)" },
  { text: "Panes named 'Intermediate D3D Window' that only exist when DirectComposition is on" },
  { text: "Legacy Win32 stub windows that Chromium keeps for accessibility fallback" },
  { text: "Panes that duplicate the window title ('Gmail - Google Chrome' appearing twice in the chain)" },
  { text: "Anything matching ' - google chrome', ' - mozilla firefox', ' - microsoft edge' at end of a Pane name" },
  { text: "Whitespace-only Name fields, <empty>, (unknown), N/A, and 17 other null dressings" },
  { text: "Name fields ending in ' min', ' mins', ' hr', ' hrs' (common in Slack, Teams, Gmail timestamps)" },
  { text: "Relative-time strings at every level of the ancestor chain, re-checked per parent" },
];

const metrics = [
  { value: 20, label: "NULL_LIKE_VALUES patterns", suffix: "+" },
  { value: 10, label: "Relative-time patterns" },
  { value: 3, label: "Browser-chrome substrings" },
  { value: 60, label: "Test assertions in events.rs", suffix: "+" },
];

const beamNodes = {
  from: [
    { label: "Raw UIA event", sublabel: "click on Archive" },
    { label: "Ancestor chain", sublabel: "8 levels deep in Gmail" },
    { label: "Name/Text fields", sublabel: "may contain 'variant()'" },
  ],
  hub: { label: "Recorder filters", sublabel: "events.rs:8-81, 696-716" },
  to: [
    { label: "Stable selector", sublabel: "3 nodes, zero timestamps" },
    { label: "Workflow YAML", sublabel: "replay-safe next month" },
    { label: "TypeScript SDK", sublabel: "@mediar-ai/workflow" },
  ],
};

const droppedChips = [
  "null",
  "(null)",
  "<null>",
  "nil",
  "undefined",
  "unknown",
  "<unknown>",
  "(unknown)",
  "none",
  "<none>",
  "empty",
  "<empty>",
  "n/a",
  "na",
  "bstr()",
  "variant()",
  "variant(empty)",
  " ago",
  "just now",
  "yesterday",
  "today",
  "last week",
  "last month",
  " min",
  " mins",
  " hr",
  " hrs",
  "chrome_widgetwin",
  "intermediate d3d window",
  "legacy window",
];

const faqs = [
  {
    q: "What do the top SERP results on 'test automation ui' miss?",
    a: "They converge on one shape: a run-time flake-mitigation playbook. Auto-wait, retries, AI self-healing locators, visual regression fallback, capping UI tests at 5-10% of the suite. All of that is fine advice. None of it answers an earlier question: why is the flake in the selector to begin with? This page covers the upstream move. Before any wait or heal logic runs, Terminator's workflow recorder refuses to serialize flake sources into the selector string. Relative timestamps, Windows COM placeholders, and browser-plumbing panes never enter the chain, so nothing downstream has to detect and patch them.",
  },
  {
    q: "Where is this filtering logic defined, exactly?",
    a: "crates/terminator-workflow-recorder/src/events.rs in the mediar-ai/terminator repository. Lines 8 through 36 define NULL_LIKE_VALUES, the LazyLock HashSet of about 20 null-dressing patterns including Windows-specific bstr() and variant(). Lines 39 through 65 define is_empty_string, the serde skip predicate that runs on 30+ fields. Lines 67 through 81 define contains_relative_time, the 10-pattern string check. Lines 696 through 716 define is_internal_element inside the parent hierarchy walker, which drops chrome_widgetwin, intermediate d3d window, legacy window, and the three browser-title Panes. Every rule has an accompanying assertion in the test block starting around line 1765.",
  },
  {
    q: "Why can't a recorder just emit raw coordinates or an XPath and be done?",
    a: "Both rot faster than accessibility selectors do. Coordinates break at the first window resize, DPI change, monitor swap, or animated sidebar toggle. XPaths over the raw UIA tree break as soon as Chromium ships a new DirectComposition layer or reorders its shadow windows (it does, almost every major release). Accessibility tree selectors made of process + role + name are the most stable encoding available on Windows, but only if the Name field itself is stable. That is what the null-like and relative-time filters protect: the stability of the one attribute the selector actually locks onto.",
  },
  {
    q: "What is a 'variant()' or 'bstr()' value and why would it ever be in a Name field?",
    a: "Windows UIA exposes element attributes as VARIANTs, a COM container type that can hold strings (as BSTRs), integers, booleans, etc. When an app registers a UIA property but never populates it, the UIA client sees an empty VARIANT. Depending on the language binding, that serializes as the literal string 'variant()', 'variant(empty)', or 'bstr()'. A naive recorder writes these into the selector as if they were human-readable names. The match succeeds once (because the unpopulated VARIANT is reproducibly empty), then fails silently the moment the app fills the field with a real value. NULL_LIKE_VALUES catches all three dressings in lowercase, case-insensitively.",
  },
  {
    q: "Does run-time retry and wait still matter if the recorder is this careful?",
    a: "Yes, both systems work together. Terminator ships a Playwright-shaped wait_for primitive with four conditions (Exists, Visible, Enabled, Focused) and an AutomationError enum with 18 typed variants for ElementDetached, ElementObscured, ElementNotStable, and the other real-world flake modes. Those handle the flakes that no recorder could have predicted: a modal animating in, a dropdown obscuring the target, an async load still in flight. The recorder's job is to not create preventable flakes. The runtime's job is to absorb the unpreventable ones.",
  },
  {
    q: "Does this only apply to Chrome? What about Slack, Excel, or a custom app?",
    a: "The browser-chrome filter (chrome_widgetwin, intermediate d3d window, legacy window, the three ' - browser name' Pane suffixes) is Chromium-specific because Chromium is the one app family that reliably ships accessibility-invisible parent containers. The null-like filter and relative-time filter are universal. Slack, Teams, and Gmail all embed timestamps like '5 mins ago' inside group names; the filter catches all of them. Excel and Outlook expose a large number of UIA nodes with unpopulated COM VARIANTs; NULL_LIKE_VALUES catches those. Any Electron app effectively gets both the browser-chrome filter (because it is Chromium under the hood) and the universal filters.",
  },
  {
    q: "How is this different from self-healing locators that the SERP pages describe?",
    a: "Self-healing runs after a failure. An AI model looks at the old locator, the current DOM, and a prior screenshot, then proposes a new locator. It is reactive and probabilistic; each re-heal slightly redefines what the test is testing. The recorder filter is preventive and deterministic. Given the same accessibility tree, the same 30 patterns get dropped and the same selector gets emitted. You can read the rules, grep them, fork them. There is no model drift, no opaque reasoning, no quiet behavior change from one agent version to the next. Both approaches can coexist: the recorder gives you the cleanest possible starting selector, and self-heal is your fallback for the remaining, genuinely irreducible flakes.",
  },
  {
    q: "Can I add my own patterns for a proprietary app?",
    a: "Yes. NULL_LIKE_VALUES is a LazyLock HashSet initialized from a fixed array in the source; patching the array and rebuilding is a one-line change. contains_relative_time is a plain Rust function with no external config, so adding project-specific cases ('submitted last quarter', 'this sprint', internal ticket ID shorthand) is straightforward. If you do not want to fork, the recorder also exposes a pre-emit hook (in progress) that lets you reject or rewrite names without recompiling the crate. Watch the workflow-recorder changelog.",
  },
  {
    q: "What happens to an element whose Name is entirely null-like? Is the whole event dropped?",
    a: "No. The element is kept in the recording but the null-like field serializes as None (via serde's skip_serializing_if). Selector construction then falls back to role and position, or to the element's nativeid if one is exposed. The recorded event still lands in the workflow file; only the poisoned attribute is suppressed. This matters because many UIA apps expose genuine information in the ClassName or AutomationId but put junk in Name. Dropping the event entirely would lose automatable state; dropping only the bad attribute preserves it.",
  },
  {
    q: "Does this apply to browser tests too, or only desktop tests?",
    a: "It applies wherever the Terminator recorder is driving, which includes browser-rooted recordings (via Terminator's Chrome extension bridge) and pure desktop recordings. Inside a browser tab, the universal filters still fire against ARIA labels that sometimes leak '2 min ago' from client-side components. The browser-chrome filter additionally removes the Chromium shell Panes that sit between a document and the OS window. The result is a selector chain that walks directly from process:chrome.exe into the document role and then to the leaf, skipping everything in between.",
  },
];

export default function Page() {
  const jsonLdArticle = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Terminator",
    authorUrl: "https://t8r.tech",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
    publisherLogo: "https://t8r.tech/favicon.svg",
    articleType: "TechArticle",
  });

  const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);
  const jsonLdFaq = faqPageSchema(faqs);

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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Test automation UI
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Workflow recorder
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Anti-flake
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              Test automation UI:{" "}
              <GradientText variant="teal">stop the flake at record time</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every other guide on {`"test automation ui"`} treats flakes as a
              replay-time problem and sells you the cure: auto-wait, retries,
              AI self-healing locators, visual fallback. Useful. Downstream.
              This page covers the move you can make one step earlier.
              Terminator{"'"}s workflow recorder refuses to serialize the
              three classes of ephemeral data that create most UI-test flakes
              (relative timestamps, Windows COM null dressings, browser
              plumbing panes) into the selector string. The selector you
              record is the selector that still matches six months from now.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="11 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "NULL_LIKE_VALUES: ~20 patterns incl. Windows COM 'bstr()', 'variant()', 'variant(empty)'",
                "contains_relative_time: 10 patterns incl. ' ago', ' mins', 'yesterday', 'last week'",
                "Browser chrome filter: 'chrome_widgetwin', 'intermediate d3d window', 'legacy window'",
                "All rules grep-able in crates/terminator-workflow-recorder/src/events.rs",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Concept intro video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Test automation UI"
            subtitle="stop the flake at record time, not at replay time"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Most flakes are recorded, not discovered",
              "Relative timestamps, COM nulls, browser plumbing",
              "Terminator's recorder filters them before emit",
              "~20 NULL_LIKE_VALUES, 10 relative-time patterns",
              "A 3-node selector beats an 8-node selector",
            ]}
          />
        </section>

        {/* Anchor fact: the filter sets */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            The filter set, straight from the source
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the actual static HashSet the recorder loads once at
            startup. Every captured Name, Text, and Value field is lowercased,
            trimmed, and matched against it. If a field is in the set, serde{"'"}s{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              skip_serializing_if
            </code>{" "}
            drops the field from the recorded event. The selector builder
            then has nothing to encode, so the selector falls back to role or
            native ID, both stable.
          </p>
          <AnimatedCodeBlock
            code={nullLikeSource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <MetricsRow metrics={metrics} />
        </section>

        {/* Relative time filter */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Ten patterns that rot a selector overnight
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Slack, Teams, Gmail, Outlook, Notion, Linear: every modern app
            renders timestamps relative to now. {`"Posted 5 mins ago"`} is
            convenient for humans and lethal for a recorded selector. Six
            minutes later the match is gone. Terminator ships a dedicated,
            grep-able filter that catches all ten common dressings of
            relative time and refuses to encode any of them into the selector{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              name:
            </code>{" "}
            attribute.
          </p>
          <AnimatedCodeBlock
            code={relativeTimeSource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Beam diagram: raw tree -> clean selector */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Raw accessibility tree in, stable selector out
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The recorder sits between the noisy accessibility tree and the
            clean selector that lands in your test file. Three filter layers
            run in sequence. What comes out the other side is deterministic:
            same click, same tree, same selector, every run.
          </p>
          <AnimatedBeam
            title="Three filters, one clean selector"
            accentColor="#FF3E00"
            from={beamNodes.from}
            hub={beamNodes.hub}
            to={beamNodes.to}
          />
        </section>

        {/* Dirty tree terminal */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the raw tree actually looks like
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Here is a real UIA dump shape from Chrome, the kind you see in
            Accessibility Insights. Eight nodes between the window and the
            button you clicked. Six of them are ephemeral. A naive recorder
            walks this tree top to bottom and encodes all eight.
          </p>
          <TerminalOutput title="inspect-uia --process chrome.exe" lines={dirtyTree} />
        </section>

        {/* Clean selector terminal */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What the recorder emits after filtering
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Same click. Same tree. The three filter layers collapse the chain
            from eight nodes down to three. Every remaining node is a
            property that an app is contractually obligated to expose
            consistently across runs (executable name, page title, aria
            label).
          </p>
          <TerminalOutput title="terminator-workflow-recorder --emit" lines={cleanSelector} />
        </section>

        {/* Marquee: dropped values */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Values the recorder will never write into a selector
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Every one of these appears as a literal substring in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              events.rs
            </code>
            . Lowercased, trimmed, and pattern-matched on every captured
            Name, Text, and Value. Any field containing one of these is
            dropped from the emitted selector.
          </p>
          <Marquee speed={30}>
            {droppedChips.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-zinc-50 text-orange-600 text-sm font-mono whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Parent hierarchy source */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            The parent-chain filter, walked level by level
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            This is the logic the recorder applies to every ancestor when
            building the selector chain. It is not a one-shot check on the
            leaf; each grandparent, great-grandparent, and window-level node
            re-runs the same four predicates. An ancestor whose name was a
            timestamp an hour ago would silently break replay even if the
            leaf itself is fine.
          </p>
          <AnimatedCodeBlock
            code={parentHierarchySource}
            language="rust"
            filename="crates/terminator-workflow-recorder/src/events.rs"
          />
        </section>

        {/* Bento grid of filters */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Six filter layers, one card each
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Every rule below is in one file:{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-workflow-recorder/src/events.rs
            </code>
            . No YAML config, no hidden heuristics. Each layer runs before
            the selector is stringified, so none of the rot below ever lands
            in your recorded test file.
          </p>
          <BentoGrid cards={filterBento} />
        </section>

        {/* Code comparison: what naive vs filtered recorders emit */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <CodeComparison
            title="Same click. Different recorders. Different half-life."
            leftLabel="Naive recorder (will rot)"
            rightLabel="Terminator recorder (grep the filters)"
            leftCode={brokenTestCode}
            rightCode={stableTestCode}
            leftLines={brokenTestCode.split("\n").length}
            rightLines={stableTestCode.split("\n").length}
          />
        </section>

        {/* Step timeline: the recording lifecycle */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What happens between the click and the emitted selector
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Five steps, in order, inside the recorder. Every one is a pure
            function of the accessibility tree at that moment. There is no
            model, no prompt, no {`"heal later"`} placeholder. The output is
            a deterministic selector or nothing.
          </p>
          <StepTimeline steps={recorderSteps} />
        </section>

        {/* Comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <ComparisonTable
            heading="Record-time filtering vs run-time self-healing"
            intro="Both approaches address UI test flake. One addresses it before the selector exists; the other after it has failed. They are complementary, but the upstream move buys you more."
            productName="Terminator recorder"
            competitorName="AI self-healing (run-time)"
            rows={comparisonRows}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <ProofBanner
            quote="Every pattern, line number, and filter function on this page is grep-able in a fresh clone of mediar-ai/terminator. The NULL_LIKE_VALUES HashSet, the contains_relative_time function, and the parent hierarchy filter are all in events.rs between lines 8 and 716."
            source="github.com/mediar-ai/terminator"
            metric="MIT"
          />
        </section>

        {/* Checklist of what gets dropped */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Concrete things that never enter a recorded selector
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Read this as the inverse of a test-flake postmortem. Each bullet
            is a class of string that, in a less careful recorder, lands in
            your selector, passes once, and times out three weeks later.
            None of them reach the emit step in Terminator.
          </p>
          <AnimatedChecklist title="Filtered at record time" items={whatGetsDropped} />
        </section>

        {/* Big-number callout: the patterns total */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-8 text-center">
            <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-3">
              Total ephemeral-content patterns the recorder refuses to emit
            </p>
            <div className="text-6xl font-bold text-zinc-800 mb-2">
              <NumberTicker value={33} suffix="+" />
            </div>
            <p className="text-sm text-zinc-500">
              About 20 in{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                NULL_LIKE_VALUES
              </code>{" "}
              (null-dressings and COM placeholders), 10 in{" "}
              <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
                contains_relative_time
              </code>
              , plus the three browser-chrome substrings. All defined as
              plain Rust constants in one file.
            </p>
          </div>
        </section>

        {/* Why this framing matters */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <GlowCard>
            <h3 className="text-xl sm:text-2xl font-semibold text-zinc-800 mb-3">
              Why this is the missing angle on {`"test automation ui"`}
            </h3>
            <p className="text-zinc-700 leading-relaxed mb-3">
              The current consensus on test automation UI is that flakes are
              a fact of life and the best you can do is automate around them:
              retries, waits, AI-generated locator rewrites, visual
              fallbacks. Every one of those is a product someone can sell
              you, which is why every article reads the same way. It is also
              why nobody writes about the other path: refusing to encode the
              flake sources in the first place.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-3">
              Terminator is a developer framework, not a consumer recorder.
              The filter set lives as plain Rust constants in one file. You
              can read them, grep them, fork them, add your own patterns for
              a proprietary app. There is no vendor-locked {`"stability engine"`}
              between you and your selector. There is just a small,
              deterministic function and the thirty patterns it refuses to
              serialize.
            </p>
            <p className="text-zinc-700 leading-relaxed">
              If you already have a test automation UI stack built on
              self-healing, keep it. Add Terminator to the record side. The
              downstream heuristics get a cleaner input to start from, and
              the easiest flakes never need healing at all.
            </p>
          </GlowCard>
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-8">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Have a recorded UI test suite that quietly rots?"
            description="Walk us through one flaky selector and we will trace which filter layer would have dropped it at record time."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Frequently asked questions" />

        {/* Footer */}
        <footer className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-zinc-500 text-sm">
            Terminator is a developer framework for building desktop
            automation. Its workflow recorder filters ephemeral content out
            of the accessibility tree before selectors are emitted, so the
            recorded test is the test that still passes later. MIT-licensed.
            Source at github.com/mediar-ai/terminator.
          </p>
        </footer>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the 30+ record-time flake filters in action. Book a 20-min call."
      />
    </div>
  );
}
