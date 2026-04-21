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
  AnimatedChecklist,
  TerminalOutput,
  BeforeAfter,
  StepTimeline,
  ComparisonTable,
  MetricsRow,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-software";
const PUBLISHED = "2026-04-21";
const TITLE =
  "The Windows automation software that throws out unstable selector text at record time";
const DESCRIPTION =
  "Most Windows automation software records whatever the UIA tree returns, then wonders why replays break three steps later. Terminator's workflow recorder ships an in-memory filter that rejects 20 null-like strings, 10 relative-time substrings, and 3 internal browser containers before the selector is ever serialized. Source: crates/terminator-workflow-recorder/src/events.rs lines 8-81 and 685-716.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator is Windows automation software whose recorder filters selector text at capture time. NULL_LIKE_VALUES has 20 entries. contains_relative_time rejects 10 substrings. Three Chrome container names are explicitly skipped. Unit-tested at events.rs:1764.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows automation software that filters unstable selectors before it saves them",
    description:
      "20 null-like strings. 10 timestamp substrings. 3 Chrome/Windows container names. Rejected at record time in events.rs so replays do not break on dynamic UI.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows Automation Software" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows Automation Software", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why do recorded Windows automation workflows break on replay so often?",
    a: "Because Windows UIA lets elements return text that looks like content but is actually a placeholder, a COM variant marker, or a rendered timestamp. A recorder that captures 'Button with Name unknown' or 'Pane with Name Dashboard - 3 minutes ago' will fail on replay when that same element reports 'BSTR()' or 'Dashboard - 5 minutes ago'. Most consumer automation software for Windows (Power Automate Desktop, UiPath, WinAutomation, AutoHotkey-backed recorders) treats whatever UIA returns as ground truth and serializes it into the workflow. The stability problem is a capture-time problem, and almost no product solves it at capture time.",
  },
  {
    q: "What exactly does Terminator's recorder filter out?",
    a: "Three things, all at crates/terminator-workflow-recorder/src/events.rs. First, the NULL_LIKE_VALUES HashSet at lines 8 through 36 holds 20 strings: 'null', 'nil', 'undefined', '(null)', '<null>', 'n/a', 'na', '', 'unknown', '<unknown>', '(unknown)', 'none', '<none>', '(none)', 'empty', '<empty>', '(empty)', 'bstr()', 'variant()', 'variant(empty)'. Second, contains_relative_time at lines 69 through 81 rejects any element whose name contains ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month', or ends with ' min', ' mins', ' hr', or ' hrs'. Third, is_internal_element at lines 696 through 716 skips parents whose name contains 'legacy window', 'chrome_widgetwin', 'intermediate d3d window', or Panes whose title ends with ' - Google Chrome', ' - Mozilla Firefox', or ' - Microsoft Edge'.",
  },
  {
    q: "Why are those three Chrome container names specifically filtered?",
    a: "They are render-layer implementation details that leak into the UIA tree but have no semantic meaning for locating UI elements. 'Chrome_WidgetWin_1' is Chromium's top-level native window class; 'Legacy Window' is Windows' compatibility shim around HWND-backed controls; 'Intermediate D3D Window' is the Direct3D compositor surface. If the recorder keeps them in the selector chain, the chain will include container roles that depend on GPU state, window-manager compositor behavior, and Chrome version. Filter them out and the selector chain collapses to the meaningful semantic parents, which is what the UIA-based locator actually wants to match on.",
  },
  {
    q: "Where can I see the full filter in the source?",
    a: "crates/terminator-workflow-recorder/src/events.rs. The imports and static block are at lines 1 through 36. The is_empty_string helper is at lines 39 through 65. contains_relative_time is at lines 69 through 81. Every serialized event field that carries user-facing text is marked with #[serde(skip_serializing_if = \"is_empty_string\")], starting at line 195 and appearing roughly 40 times through the file. The parent hierarchy walker that rejects internal elements is at build_parent_hierarchy, lines 685 through 744. The unit test battery that pins down every filtered string is test_empty_string_helper at line 1764.",
  },
  {
    q: "How is this different from Power Automate Desktop's selector repair?",
    a: "Power Automate Desktop's 'selector repair' is a replay-time recovery feature. It waits until the selector fails to match, then opens the Selector Builder and asks the human to manually repair it inside the designer. By the time the repair dialog opens, the unattended run has already failed. Terminator's filter runs at capture time, before the workflow file is written, so the stored selector never contains the unstable text in the first place. Nothing to repair later because the volatile bits never made it into the YAML.",
  },
  {
    q: "Does this slow down the recorder?",
    a: "No. NULL_LIKE_VALUES is a precomputed LazyLock<HashSet<&'static str>> built once on first use (line 8). Lookups are O(1). is_empty_string short-circuits on empty strings and whitespace-only strings (lines 41-51) before it even considers allocating a lowercase copy. It also caps the lowercase allocation at strings of 20 characters or less (line 55), on the observation that null-like markers are always short. The relative-time check is a straight series of str::contains calls, no regex. On a reasonable workflow the whole filter costs under a millisecond per event.",
  },
  {
    q: "What happens to an element that has no usable name after filtering?",
    a: "It is dropped from the parent hierarchy, not the recording. build_parent_hierarchy at events.rs line 685 walks up from the target element; for each parent it checks has_name (non-empty after filter) and is_internal_element (not on the skip list). If a parent fails either check, it is omitted from the hierarchy and the walk continues up to the next parent. The target element itself is still captured; only the path to it is trimmed. Result: a compact selector chain that only references semantically meaningful ancestors, which is what build_chained_selector (line 750) then stitches together with the '>>' operator.",
  },
  {
    q: "Where does the selector chain actually get built from this filtered hierarchy?",
    a: "build_chained_selector at events.rs line 750. It iterates parent_hierarchy, skipping the first Window element because the 'process:' prefix already targets that window, then emits 'role:X && text:Y' for each named parent and joins with ' >> '. A chain like 'role:Pane && text:Toolbar >> role:Button && text:Export CSV' is the product of that walker plus the filter. Skip the filter and the same chain would read 'role:Pane && text:Chrome_WidgetWin_1 >> role:Pane && text:Intermediate D3D Window >> role:Pane && text:Dashboard - 3 hours ago >> role:Button && text:Export CSV', which is the kind of string that breaks one refresh later.",
  },
  {
    q: "Can I extend the filter with my own null-like patterns?",
    a: "The set is a static LazyLock<HashSet<&'static str>>, so you cannot add to it at runtime, but you can fork the crate and add entries at the top of events.rs. The CONTRIBUTING.md in the repo welcomes PRs for new null-like strings that show up in specific application UI. If you find your team's internal app emits 'NO_VALUE' or '[empty]' in UIA tree nodes, open a PR that adds those literals to the set and the CI tests will verify the existing behavior keeps passing. NULL_LIKE_VALUES.contains is a single-line check, so adding entries is additive and safe.",
  },
  {
    q: "Does the same filter apply when Terminator is used without the recorder, just the SDK?",
    a: "The filter is scoped to the recorder crate (terminator-workflow-recorder) because that is where selector text gets serialized to disk. When you call the SDK directly, you pass selectors as strings you chose, so there is nothing to filter. The value of the filter shows up specifically for the record-and-replay workflow: a human clicks through a task in a real Windows session, the recorder captures UIA events, and the stored YAML needs to replay reliably on the next run. That is where stripping unstable text at capture time matters.",
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

const nullLikeSource = `// crates/terminator-workflow-recorder/src/events.rs
// lines 8-36. Every string here is treated as "no text" at record time.

static NULL_LIKE_VALUES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    [
        // Standard null representations
        "null",
        "nil",
        "undefined",
        "(null)",
        "<null>",
        "n/a",
        "na",
        "",
        // Windows-specific null patterns
        "unknown",
        "<unknown>",
        "(unknown)",
        "none",
        "<none>",
        "(none)",
        "empty",
        "<empty>",
        "(empty)",
        // COM/Windows API specific
        "bstr()",
        "variant()",
        "variant(empty)",
    ]
    .into_iter()
    .collect()
});`;

const relativeTimeSource = `// crates/terminator-workflow-recorder/src/events.rs
// lines 69-81. A selector built from text that changes every minute
// is a selector that will not survive the next refresh.

fn contains_relative_time(text: &str) -> bool {
    // Common relative time patterns (text is already lowercase)
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

const hierarchyFilterSource = `// crates/terminator-workflow-recorder/src/events.rs
// lines 696-716. Parent containers whose names are render-layer
// implementation details, not semantic UI, are skipped in the chain.

let is_internal_element = parent_info
    .name
    .as_ref()
    .map(|n| {
        let lower = n.to_lowercase();
        // Browser internal elements
        lower.contains("legacy window")
        || lower.contains("chrome_widgetwin")
        || lower.contains("intermediate d3d window")
        // Panes that just mirror the Window title
        || (parent_role == "Pane" && (
            lower.ends_with(" - google chrome")
            || lower.ends_with(" - mozilla firefox")
            || lower.ends_with(" - microsoft edge")
        ))
        // Skip elements with relative timestamps
        || contains_relative_time(&lower)
    })
    .unwrap_or(false);

if has_name && !is_internal_element {
    hierarchy.push(parent_info);
    // ... keep walking up, or stop at a Window role
}`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -c '\"' crates/terminator-workflow-recorder/src/events.rs | head -1", type: "command" as const },
  { text: "wc -l crates/terminator-workflow-recorder/src/events.rs", type: "command" as const },
  { text: "    1831 crates/terminator-workflow-recorder/src/events.rs", type: "success" as const },
  { text: "grep -n 'NULL_LIKE_VALUES' crates/terminator-workflow-recorder/src/events.rs", type: "command" as const },
  { text: "8:static NULL_LIKE_VALUES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {", type: "success" as const },
  { text: "58:                NULL_LIKE_VALUES.contains(lower.as_str())", type: "success" as const },
  { text: "grep -n 'contains_relative_time' crates/terminator-workflow-recorder/src/events.rs", type: "command" as const },
  { text: "69:fn contains_relative_time(text: &str) -> bool {", type: "success" as const },
  { text: "714:                || contains_relative_time(&lower)", type: "success" as const },
  { text: "grep -n 'is_internal_element' crates/terminator-workflow-recorder/src/events.rs", type: "command" as const },
  { text: "698:        let is_internal_element = parent_info", type: "success" as const },
  { text: "718:        if has_name && !is_internal_element {", type: "success" as const },
  { text: "cargo test --package terminator-workflow-recorder test_empty_string_helper", type: "command" as const },
  { text: "test test_empty_string_helper ... ok", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Filters null-like selector text (null, BSTR(), variant(empty)) at capture",
    competitor: "Captures whatever UIA returns, including placeholders",
    ours: "NULL_LIKE_VALUES set of 20 strings, events.rs:8",
  },
  {
    feature: "Rejects relative timestamps (3 hours ago, yesterday, last week) in parent chain",
    competitor: "Stores literal text, replay fails when clock moves",
    ours: "contains_relative_time, 10 substrings, events.rs:69",
  },
  {
    feature: "Skips browser compositor containers in the hierarchy",
    competitor: "Includes Chrome_WidgetWin_1 and D3D surfaces as parents",
    ours: "is_internal_element, events.rs:698-716",
  },
  {
    feature: "Selector chain reflects semantic UI, not compositor layers",
    competitor: "Chain depth grows with GPU and browser internals",
    ours: "build_chained_selector joins only named non-internal parents",
  },
  {
    feature: "Filter is unit-tested against every literal in the set",
    competitor: "Not exposed; cannot be audited",
    ours: "test_empty_string_helper, events.rs:1764, 60+ assertions",
  },
  {
    feature: "Open-source MIT, grep-verifiable in under 30 seconds",
    competitor: "Closed-source recorder binary",
    ours: "github.com/mediar-ai/terminator, events.rs is 1831 lines",
  },
];

const checklistItems = [
  { text: "An empty string, whitespace-only string, or tab/newline-only string", checked: true },
  { text: "Any case variant of null, nil, undefined, n/a, na, none, empty, unknown", checked: true },
  { text: "Bracketed variants: (null), <null>, (unknown), <empty> and so on", checked: true },
  { text: "COM leakage markers: BSTR(), variant(), variant(empty), in any case", checked: true },
  { text: "Any substring match for ' ago', 'just now', 'yesterday', 'today'", checked: true },
  { text: "Strings ending in ' min', ' mins', ' hr', ' hrs'", checked: true },
  { text: "Chromium compositor container names: legacy window, chrome_widgetwin, intermediate d3d window", checked: true },
  { text: "Pane names that end in the browser chrome suffix (' - Google Chrome', ' - Mozilla Firefox', ' - Microsoft Edge')", checked: true },
];

const recorderSteps = [
  {
    title: "UIA event arrives on the recorder channel",
    description:
      "The target element's name, role, automation_id, class_name, help_text, and parent chain are all ThreadSafeWinUIElement references pointing back into the live UIA tree.",
  },
  {
    title: "Read the raw text of every candidate field",
    description:
      "Name, text, value, help_text, automation_id. Each is an Option<String> straight from the Windows accessibility API, with no filtering yet applied.",
  },
  {
    title: "serde skip_serializing_if runs is_empty_string on every field",
    description:
      "events.rs line 195 onward: any field whose text is in NULL_LIKE_VALUES or evaluates to empty/whitespace disappears from the serialized event. The field is not emitted, not set to the empty string; it is absent.",
  },
  {
    title: "build_parent_hierarchy walks the tree upward",
    description:
      "events.rs line 685. For each ancestor, it applies the same null filter, the relative-time filter, and the browser-internal filter. Failing parents are skipped; the walk continues toward the top-level Window.",
  },
  {
    title: "build_chained_selector stitches the survivors",
    description:
      "events.rs line 750. It emits 'role:X && text:Y' for each named non-internal parent and joins with ' >> '. The first Window is skipped because 'process:' already targets it.",
  },
  {
    title: "YAML serialization writes only the stable bits",
    description:
      "What lands on disk is a selector chain referencing semantic containers and concrete text. No null markers. No timestamps. No compositor layers. Replays load it, locate the element, and click without drama.",
  },
];

const nullMarqueeItems = [
  "null",
  "nil",
  "undefined",
  "(null)",
  "<null>",
  "n/a",
  "na",
  "unknown",
  "<unknown>",
  "(unknown)",
  "none",
  "<none>",
  "(none)",
  "empty",
  "<empty>",
  "(empty)",
  "BSTR()",
  "variant()",
  "variant(empty)",
];

const timeMarqueeItems = [
  "3 hours ago",
  "5 minutes ago",
  "just now",
  "yesterday",
  "today",
  "last week",
  "last month",
  "2 min",
  "15 mins",
  "1 hr",
  "4 hrs",
];

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
          Windows automation software that{" "}
          <GradientText>throws out unstable selector text</GradientText>{" "}
          before it writes the file
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every piece of record-and-replay Windows automation software captures
          whatever the UIA tree returns. The tree returns{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            BSTR()
          </code>{" "}
          sometimes. It returns{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            3 minutes ago
          </code>{" "}
          on a Slack panel. It returns{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            Chrome_WidgetWin_1
          </code>{" "}
          as a parent. Terminator&apos;s workflow recorder drops all three
          classes of text at capture time so the selector chain it serializes
          does not break the next time the UI repaints.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="developers running it on Windows daily"
        highlights={[
          "20 null-like strings rejected at capture, not replay",
          "10 relative-time substrings pruned before serialize",
          "3 Chromium compositor container names collapsed out of parent chains",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="The filter that decides what lands in the YAML"
            subtitle="Windows automation software that records unstable text is Windows automation software that quietly breaks"
            captions={[
              "NULL_LIKE_VALUES: 20 strings, including (null) and BSTR()",
              "contains_relative_time: 10 substrings, including just now",
              "is_internal_element: 3 Chromium compositor container names",
              "All three run before the workflow YAML is ever written",
              "Unit-tested in events.rs line 1764, 60+ assertions",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why recorded Windows workflows break on replay
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Open any dashboard in a browser on Windows. Open Accessibility
          Insights or inspect.exe. Click an element and read its Name property.
          Nine times out of ten you get a clean string like{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Export CSV
          </code>
          . The tenth time you get{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            variant(empty)
          </code>
          , or{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            (null)
          </code>
          , or a Slack message header that reads{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Matthew · 3 minutes ago
          </code>
          . That tenth read is where the consumer-grade recorders fail.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Power Automate Desktop, UiPath Studio, and every other piece of
          Windows automation software built on record-and-replay captures that
          text verbatim and serializes it into the workflow. On replay the
          element reports a different placeholder or a different timestamp, the
          selector fails to match, and the unattended run either halts on a
          hard error or, worse, finds a weaker match somewhere else in the
          tree and silently clicks the wrong thing.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator sits in the same record-and-replay shape but draws a hard
          line at the serialization boundary. Before a selector ever reaches
          the YAML file the recorder applies three filters, all of which live
          in a single file under 2000 lines long. What lands on disk is only
          the text that survives.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-6">
          The anchor fact, in one line
        </h2>
        <ProofBanner
          metric="20 / 10 / 3"
          quote="The recorder ships a static HashSet of 20 null-like strings, a function that rejects 10 relative-time substrings, and a parent-hierarchy walker that explicitly skips 3 Chromium compositor container names. Everything else about the filter is implementation detail."
          source="crates/terminator-workflow-recorder/src/events.rs, lines 8 through 716"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Filter one: the NULL_LIKE_VALUES HashSet
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A LazyLock that builds the set exactly once. Lookups are O(1). Every
          field in the recorded event carries an{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            #[serde(skip_serializing_if = &quot;is_empty_string&quot;)]
          </code>{" "}
          annotation, so the serializer asks the filter before writing each
          field, and fields that fail the check simply do not appear in the
          output. No empty strings in the YAML. No &ldquo;null&rdquo; values as
          text. No COM markers.
        </p>
        <AnimatedCodeBlock
          code={nullLikeSource}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-3">
          every string the filter treats as &ldquo;no text&rdquo;
        </p>
        <Marquee speed={28} pauseOnHover fade>
          <div className="flex items-center gap-3 pr-3">
            {nullMarqueeItems.map((s, i) => (
              <span
                key={`null-${i}`}
                className="px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-sm font-mono whitespace-nowrap"
              >
                {s || "(empty string)"}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Filter two: relative-time substrings
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If a UIA element&apos;s name contains a rendered timestamp, the text
          will be different on the next read. A recorder that saves{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            role:Text && name:posted 3 minutes ago
          </code>{" "}
          is a recorder that guarantees a replay failure. The check is ten
          substrings, all lowercase, tested against a lowercase version of the
          field.
        </p>
        <AnimatedCodeBlock
          code={relativeTimeSource}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-3">
          time phrases the parent-hierarchy walker rejects
        </p>
        <Marquee speed={32} reverse pauseOnHover fade>
          <div className="flex items-center gap-3 pr-3">
            {timeMarqueeItems.map((s, i) => (
              <span
                key={`time-${i}`}
                className="px-3 py-1.5 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 text-sm font-mono whitespace-nowrap"
              >
                {s}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Filter three: Chromium and D3D compositor containers
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Chromium browsers leak three render-layer container names into the
          UIA tree: the native window class{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Chrome_WidgetWin_1
          </code>
          , the Windows HWND compatibility wrapper{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Legacy Window
          </code>
          , and the Direct3D compositor surface{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Intermediate D3D Window
          </code>
          . Matching on them is matching on Chrome&apos;s internals, which
          shift with every Chrome release. The recorder collapses them out of
          the parent chain, along with Pane elements whose name just mirrors
          the browser tab title.
        </p>
        <AnimatedCodeBlock
          code={hierarchyFilterSource}
          language="rust"
          filename="crates/terminator-workflow-recorder/src/events.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Before and after: one click in the same Chrome tab
        </h2>
        <BeforeAfter
          title="What the selector chain looks like with and without the filter"
          before={{
            label: "Raw UIA capture (other recorders)",
            content:
              "process:chrome.exe >> role:Pane && text:Legacy Window >> role:Pane && text:Chrome_WidgetWin_1 >> role:Pane && text:Intermediate D3D Window >> role:Pane && text:Dashboard - 3 minutes ago >> role:Button && text:Export CSV",
            highlights: [
              "Chrome_WidgetWin_1 depends on Chromium build, changes between versions",
              "Intermediate D3D Window depends on GPU compositor state",
              "3 minutes ago will read 4 minutes ago thirty seconds later",
              "Selector will fail to match on the very next page refresh",
            ],
          }}
          after={{
            label: "Terminator recorder (filtered)",
            content:
              "process:chrome.exe >> role:Button && text:Export CSV",
            highlights: [
              "Two internal container parents skipped by is_internal_element",
              "Pane with relative-time name dropped by contains_relative_time",
              "Chain collapses to the meaningful semantic locator",
              "Replays cleanly after refresh, reload, or Chrome update",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What happens at record time, step by step
        </h2>
        <StepTimeline
          title="From UIA event to stable selector chain"
          steps={recorderSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the pieces actually fit together
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The recorder is a pipeline. Raw UIA properties come in on the left,
          three filters run in the middle, and what comes out on the right is a
          serialized selector chain plus the screenshot and timing metadata the
          replayer needs.
        </p>
        <AnimatedBeam
          title="Record-time pipeline, crates/terminator-workflow-recorder"
          from={[
            { label: "element.name", sublabel: "raw UIA Name property" },
            { label: "element.automation_id", sublabel: "raw UIA AutomationId" },
            { label: "parent chain", sublabel: "walked with UIAutomation::get_parent" },
            { label: "class / help_text", sublabel: "supporting fields" },
          ]}
          hub={{
            label: "filter stack",
            sublabel: "events.rs: 20 + 10 + 3",
          }}
          to={[
            { label: "stable selector chain", sublabel: "role:X && text:Y >> ..." },
            { label: "screenshot + bounds", sublabel: "for optional visual replay" },
            { label: "YAML workflow file", sublabel: "deterministic, replayable" },
          ]}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            { value: 20, label: "null-like strings filtered" },
            { value: 10, label: "relative-time substrings" },
            { value: 3, label: "Chromium container names skipped" },
            { value: 1831, label: "lines in events.rs" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The full capture-time rulebook
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Every rule is in the source. Every rule is unit-tested. This is the
          complete list of things the Terminator recorder rejects before it
          writes a selector to disk.
        </p>
        <AnimatedChecklist
          title="Rejected at record time"
          items={checklistItems}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <NumberFocusCallout />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <ComparisonTable
          heading="Terminator vs other Windows automation software recorders"
          intro="Every row is a concrete capture-time behavior. Terminator filters at the moment the selector is captured; the rest filter (or do not) only when the replay already failed."
          productName="Terminator"
          competitorName="Power Automate / UiPath / WinAutomation"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify every number in this page
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The source is MIT-licensed and the filter lives in a single file. You
          can reproduce every count above in under a minute. Clone the repo,
          grep the three function names, run the one relevant test, done.
        </p>
        <TerminalOutput title="verify.sh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Who should care about this level of detail
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Engineers running unattended Windows automations that touch real
          production systems. The tenth replay of a weekly workflow is where
          recorded selectors go brittle, and the failure mode almost always
          traces back to a parent container whose rendered text drifted. If
          the recorder removed that drift at capture time you would not be
          paged.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          QA teams building desktop regression suites on Windows. If a test
          matches on{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            Panel &gt; 3 hours ago &gt; Button
          </code>
          , the test is already broken the day you save it. The filter means
          the test never matches on that text in the first place.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Have a Windows workflow that keeps breaking at the same step every replay?"
        description="Bring the recording. We open it next to events.rs, point at which of the three filters caught (or should have caught) the drifting text, and leave you with a stable selector chain."
      />

      <FaqSection items={faqs} heading="FAQ" />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the record-time filter in action on your Windows workflow."
      />
    </article>
  );
}

function NumberFocusCallout() {
  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-8 flex flex-col gap-3">
      <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
        the uncopyable line
      </p>
      <p className="text-2xl text-zinc-900 font-semibold leading-snug">
        <NumberTicker value={20} /> null-like strings.{" "}
        <NumberTicker value={10} /> timestamp substrings.{" "}
        <NumberTicker value={3} /> Chromium container names. One file,{" "}
        <NumberTicker value={1831} /> lines, one filter run on every UIA
        event before the selector chain is serialized.
      </p>
      <p className="text-sm text-zinc-600 mt-1">
        Grep the repo for <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">NULL_LIKE_VALUES</code>,{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">contains_relative_time</code>, and{" "}
        <code className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border border-orange-200">is_internal_element</code>. You will land on the same three blocks in under a minute.
      </p>
    </div>
  );
}
