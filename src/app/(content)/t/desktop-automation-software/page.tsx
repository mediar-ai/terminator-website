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
  BentoGrid,
  GlowCard,
  MetricsRow,
  ComparisonTable,
  StepTimeline,
  BeforeAfter,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/desktop-automation-software";
const PUBLISHED = "2026-04-22";
const TITLE =
  "Desktop automation software: the recorder denylist that decides whether your workflow still runs in week two";
const DESCRIPTION =
  "Most desktop automation software is graded on what it can record. Terminator's recorder is graded on what it refuses to record. The workflow recorder ships a denylist of selector traps (relative timestamps, COM null patterns, browser internal class names) that get stripped from every saved selector so workflows survive past the day they were recorded. Source: crates/terminator-workflow-recorder/src/events.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "19 null-like patterns, 9 relative-time substrings, and 3 browser-internal class names that Terminator's recorder strips out of selectors before persisting them. File: crates/terminator-workflow-recorder/src/events.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop automation software, judged on what it refuses to record",
    description:
      "Terminator's workflow recorder ships a hardcoded denylist of selector traps. NULL_LIKE_VALUES has 19 entries. contains_relative_time blocks 9 substrings. Browser internals get scrubbed from every Pane.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop automation software" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Desktop automation software", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is desktop automation software?",
    a: "Desktop automation software lets a program drive any application on your operating system the way a human would. That covers Excel, Outlook, SAP, Photoshop, File Explorer, Teams, internal WPF tools, and the browser. It works by querying the operating system's accessibility layer (Windows UI Automation, macOS Accessibility API, AT-SPI2 on Linux) and synthesizing input events. Terminator is desktop automation software in the developer-framework shape: you do not click around in a designer, you wire it into your AI coding assistant via MCP and it gives that assistant the ability to read and manipulate every UI element on the screen.",
  },
  {
    q: "Why do recorded automations break so quickly in other tools?",
    a: "Almost always because the recorder remembered something that was never meant to be remembered. The classic case is recording a click on a button labeled 'Posted 3 hours ago'. Tomorrow that label is 'Posted 1 day ago' and the entire selector chain breaks. Other failure modes: the recorder captures the window title 'Inbox - YourName - Outlook', then someone renames the mailbox; or it captures a generic Windows pane class like 'Chrome_WidgetWin_1' that exists on every Chrome window, so the next replay binds to the wrong tab. Terminator's recorder filters all of these explicitly. The relevant code is build_parent_hierarchy in crates/terminator-workflow-recorder/src/events.rs around line 661, which calls is_internal_element and contains_relative_time before persisting any parent name into a selector.",
  },
  {
    q: "What exactly is in the denylist?",
    a: "Three pieces. NULL_LIKE_VALUES (lines 8-36) is a HashSet with 19 entries: null, nil, undefined, (null), <null>, n/a, na, the empty string, unknown, <unknown>, (unknown), none, <none>, (none), empty, <empty>, (empty), bstr(), variant(), and variant(empty). The last three are COM-specific patterns that Windows UIA emits when an accessible name was never set. contains_relative_time (lines 69-81) blocks 9 substrings: ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month', and the trailing tokens ' min', ' mins', ' hr', ' hrs'. is_internal_element (lines 696-716) strips three browser internals (legacy window, chrome_widgetwin, intermediate d3d window) plus three per-browser window-title suffixes (' - google chrome', ' - mozilla firefox', ' - microsoft edge') from any Pane element.",
  },
  {
    q: "Why is filtering at record time better than handling it at replay time?",
    a: "Because at replay time you have already lost the information you need. If your recorded selector says role:Pane && name:'Posted 3 hours ago', a replay engine has no way to know that '3 hours ago' was the unstable part. It will either match nothing, or match the first element whose name happens to contain 'ago'. Filtering at record time means the recorded YAML never contains the trap. The selector that gets persisted is the most stable parent the recorder could find, which is usually a static label like 'Notifications' or a structural element like the toolbar. The agent that replays the workflow weeks later inherits a selector that does not depend on what the screen looked like at record time.",
  },
  {
    q: "How does Terminator handle the recording when the user clicks something with no good label at all?",
    a: "It walks up the parent chain. build_parent_hierarchy collects up to 10 NAMED parents, skipping any unnamed Pane or Group. It stops as soon as it hits a Window role, since process: scoping in Terminator selectors already targets the application. It also stops at process boundaries so a click inside Chrome cannot accidentally produce a selector that depends on the desktop or taskbar above it. The result is a chained selector like process:chrome >> role:Pane && text:Notifications >> role:Button && text:Submit. The chain may be long, but every link is a name the recorder was willing to bet on.",
  },
  {
    q: "Where does Terminator sit relative to UiPath, Power Automate Desktop, and AutoHotkey?",
    a: "Different category. UiPath and Power Automate Desktop are designer-driven RPA platforms, optimized for non-developers building business automations. AutoHotkey is a scripting language for keyboard macros and small custom tools. Terminator is a developer framework, MIT licensed, distributed as a Rust crate, npm package, Python package, and MCP server. The intended user is not a citizen developer in a designer; it is a developer or an AI coding assistant invoking it programmatically. The denylist behavior described on this page is the kind of detail you only notice when you are debugging a failed workflow at three in the morning, which is the situation the framework was built for.",
  },
  {
    q: "Can I see the recorded workflow before it runs?",
    a: "Yes. The recorder emits human-readable YAML. Each step contains a tool_name (typically click_element, type_into_element, press_key), an arguments object with the selector, and a description. Selectors that survived the denylist are written verbatim. You can read the YAML, edit it, version-control it, and pass it to the MCP agent later with terminator mcp run workflow.yml. The CLI also supports --dry-run, --start-from, and --end-at flags so you can isolate a problem step without re-running the whole flow.",
  },
  {
    q: "What happens if the application I'm recording does emit relative timestamps as accessible names?",
    a: "The recorder still captures the click; what it skips is including the unstable name in the parent-chain selector. The target element itself is identified by its role, AutomationId, position within the parent, or the static parts of its hierarchy. If you have a list of items and each one carries a 'last edited 2 minutes ago' subtitle, Terminator will use the row index, the item's own AutomationId, or the row's role:DataItem rather than the volatile timestamp. If the only thing distinguishing two elements is the timestamp, the recorder logs a debug warning so you know the recording is fragile by nature, not by accident.",
  },
  {
    q: "How do I install Terminator and try the recorder?",
    a: "On Windows, install the MCP agent with `npx -y terminator-mcp-agent@latest` and the workflow recorder with `cargo add terminator-workflow-recorder` or by cloning the repo and running cargo build inside crates/terminator-workflow-recorder. Recording is triggered programmatically through the recorder API or via the workflow CLI. The output is a YAML file you can replay with `terminator mcp run workflow.yml`. The MCP agent itself integrates with Claude Code, Cursor, VS Code, and Windsurf so your AI coding assistant can read the recorded workflow, modify it, or generate new ones from natural-language instructions.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Selectors with relative timestamps",
    competitor: "Recorded as captured (' Posted 3 hours ago')",
    ours: "Stripped via contains_relative_time, 9 substrings blocked",
  },
  {
    feature: "COM null patterns (bstr(), variant())",
    competitor: "Persisted into the selector when UIA returns them",
    ours: "Filtered by NULL_LIKE_VALUES, 19 entries",
  },
  {
    feature: "Chrome internal panes (Chrome_WidgetWin_1)",
    competitor: "Captured as a parent, breaks on next Chrome update",
    ours: "Skipped by is_internal_element",
  },
  {
    feature: "Window title suffixes (' - Google Chrome')",
    competitor: "Bound into selector, breaks on tab switch",
    ours: "Stripped from any Pane that mirrors window title",
  },
  {
    feature: "Cross-process parent walk",
    competitor: "May include desktop or taskbar elements",
    ours: "Halts at process boundary via process_id check",
  },
  {
    feature: "Replay format",
    competitor: "Proprietary binary or designer-only XML",
    ours: "Human-readable YAML, edit and diff in git",
  },
  {
    feature: "License",
    competitor: "Per-seat commercial",
    ours: "MIT, source on GitHub",
  },
  {
    feature: "Agent integration",
    competitor: "Bot designer, no MCP",
    ours: "MCP server, works with Claude Code, Cursor, VS Code, Windsurf",
  },
];

const remotionCaptions = [
  "You click a button labeled '3 hours ago'.",
  "Most recorders save that string into the selector.",
  "Tomorrow it reads '1 day ago'.",
  "The replay fails silently.",
  "Terminator strips it before saving.",
];

const nullLikeRust = `// crates/terminator-workflow-recorder/src/events.rs lines 8-36
static NULL_LIKE_VALUES: LazyLock<HashSet<&'static str>> = LazyLock::new(|| {
    [
        // Standard null representations
        "null", "nil", "undefined", "(null)", "<null>",
        "n/a", "na", "",
        // Windows-specific null patterns
        "unknown", "<unknown>", "(unknown)",
        "none", "<none>", "(none)",
        "empty", "<empty>", "(empty)",
        // COM/Windows API specific
        "bstr()", "variant()", "variant(empty)",
    ]
    .into_iter()
    .collect()
});`;

const relativeTimeRust = `// crates/terminator-workflow-recorder/src/events.rs lines 69-81
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

const internalElementRust = `// crates/terminator-workflow-recorder/src/events.rs lines 696-716
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
        // (redundant after process: selector)
        || (parent_role == "Pane" && (
            lower.ends_with(" - google chrome")
            || lower.ends_with(" - mozilla firefox")
            || lower.ends_with(" - microsoft edge")
        ))
        // Skip elements with relative timestamps
        // (dynamic, will break selectors)
        || contains_relative_time(&lower)
    })
    .unwrap_or(false);`;

const beforeYaml = `# What a naive recorder produces
- tool: click_element
  description: Click 'Mark as read'
  arguments:
    selector: |
      process:olk.exe
      >> role:Pane && name:'Inbox - matt@mediar.ai - Outlook'
      >> role:Pane && name:'bstr()'
      >> role:DataItem && name:'Sarah Chen, 3 hours ago, Re: Q2 forecast'
      >> role:Button && name:'Mark as read'`;

const afterYaml = `# What Terminator's recorder produces
- tool: click_element
  description: Click 'Mark as read'
  arguments:
    selector: |
      process:olk.exe
      >> role:DataItem && name:'Sarah Chen, Re: Q2 forecast'
      >> role:Button && name:'Mark as read'`;

const filterMetrics = [
  { value: 19, label: "Null-like patterns blocked" },
  { value: 9, label: "Relative-time substrings blocked" },
  { value: 6, label: "Browser internals blocked" },
  { value: 10, label: "Max named parents in selector chain" },
];

const filterCards: BentoCard[] = [
  {
    title: "NULL_LIKE_VALUES",
    description:
      "19 entries that the recorder treats as 'this name is meaningless, do not put it in a selector'. Includes the obvious null, nil, undefined plus the COM-specific bstr() and variant(empty) that Windows UIA returns when an accessible name was never set. Stored in a HashSet for O(1) lookup.",
    accent: true,
  },
  {
    title: "contains_relative_time",
    description:
      "9 substring checks. Blocks ' ago', 'just now', 'yesterday', 'today', 'last week', 'last month' and the trailing tokens ' min', ' mins', ' hr', ' hrs'. The trailing-token checks catch labels like '5 mins' that compact UIs use without an 'ago'.",
  },
  {
    title: "is_internal_element",
    description:
      "Strips three browser-implementation panes that exist on every modern Chromium window: 'legacy window', 'chrome_widgetwin', 'intermediate d3d window'. Also drops any Pane whose name ends with ' - Google Chrome', ' - Mozilla Firefox', or ' - Microsoft Edge' since the process: prefix already targets that browser.",
  },
  {
    title: "Process boundary halt",
    description:
      "Walks up the parent chain only as long as parent.process_id() matches the target's. The moment it exits the application's UI tree (into the desktop, taskbar, or another window), it stops. Selectors never include elements outside the recorded application.",
  },
  {
    title: "Window-role short circuit",
    description:
      "Walks up at most 10 named parents, but stops as soon as it reaches an element with role 'Window'. The window itself is included; nothing above it is. Combined with process: scoping, this keeps the chain tight.",
  },
  {
    title: "Whitespace and length checks",
    description:
      "is_empty_string trims first, then only allocates a lowercase copy when the trimmed length is 20 characters or less. Long labels are assumed to be real content, not null patterns. The is_empty_string check is wired into 14 separate serde skip_serializing_if attributes across the event types so empty fields never reach the persisted YAML.",
    accent: true,
  },
];

const beamFrom = [
  { label: "User click", sublabel: "raw event" },
  { label: "UIA tree walk", sublabel: "parent chain" },
  { label: "Element name", sublabel: "as captured" },
];

const beamHub = {
  label: "build_parent_hierarchy",
  sublabel: "denylist + boundary checks",
};

const beamTo = [
  { label: "Stable selector", sublabel: "process:app >> role:X >> ..." },
  { label: "YAML workflow", sublabel: "human-readable, diffable" },
  { label: "MCP replay", sublabel: "Claude, Cursor, VS Code" },
];

const recorderSteps = [
  {
    title: "Capture the raw event",
    description:
      "The Windows UIA event hook fires on click. The recorder gets a pointer to the clicked element, plus modifier keys and timing.",
  },
  {
    title: "Extract the immediate identifiers",
    description:
      "Role, name, AutomationId, bounding box, text content. These are stored as the target element's identity. NULL_LIKE_VALUES filtering happens here so a name of 'bstr()' is treated as no name at all.",
  },
  {
    title: "Walk up the parent chain",
    description:
      "Iterate parent.parent() up to 10 times. Each parent is checked against the process_id of the target. Cross-process parents end the walk.",
  },
  {
    title: "Filter each parent's name",
    description:
      "is_internal_element checks for browser internals, mirrored window titles, and relative timestamps. Parents whose only name is a denylisted pattern are skipped, but the walk continues upward through them so a meaningful grandparent can still be captured.",
  },
  {
    title: "Stop at the application Window",
    description:
      "When parent.role() == 'Window' the walk halts, that Window is included in the chain, and the desktop/taskbar above it is not.",
  },
  {
    title: "Build the chained selector",
    description:
      "build_chained_selector joins the surviving parents with the >> descendant combinator. The output is something a human can read, diff in git, and edit before replay.",
  },
];

const terminalLines = [
  { text: "$ npx -y terminator-mcp-agent@latest --record workflow.yml", type: "command" as const },
  { text: "[recorder] starting on Windows, performance_mode=Normal", type: "output" as const },
  { text: "[recorder] hooking UIA event listener", type: "output" as const },
  { text: "[recorder] click captured: olk.exe role:Button name:'Mark as read'", type: "output" as const },
  { text: "[recorder] walking parent chain (max_depth=10)", type: "output" as const },
  { text: "[recorder] skip parent: name='bstr()' matches NULL_LIKE_VALUES", type: "info" as const },
  { text: "[recorder] skip parent: name='Sarah Chen, 3 hours ago' matches contains_relative_time", type: "info" as const },
  { text: "[recorder] skip parent: name='Inbox - matt@mediar.ai - Outlook' is_internal_element", type: "info" as const },
  { text: "[recorder] keep parent: role:DataItem name='Sarah Chen, Re: Q2 forecast'", type: "output" as const },
  { text: "[recorder] halt at role:Window 'Outlook'", type: "output" as const },
  { text: "[recorder] persisted selector: process:olk.exe >> role:DataItem && name:'Sarah Chen, Re: Q2 forecast' >> role:Button && name:'Mark as read'", type: "success" as const },
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
              readingTime="14 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Desktop automation software, judged on the{" "}
              <GradientText>selectors it refuses to record</GradientText>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every guide to desktop automation software grades products on what they can do.
              Workflow builder. AI recovery. Image recognition. Cross-platform support. None of those
              graders mention the actual reason recorded automations break in week two: the recorder
              wrote down something that was never meant to last. This guide is about the small,
              boring, hardcoded denylist inside Terminator's workflow recorder, and why that denylist
              is the part of a desktop automation framework most worth reading the source for.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="MIT-licensed, written in Rust, integrates with Claude Code, Cursor, VS Code, Windsurf"
          highlights={[
            "19 null-like patterns blocked at record time",
            "9 relative-time substrings filtered from selector names",
            "Process-boundary aware parent walk, halts at the application Window",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="What a recorder chooses to forget"
            subtitle="Why the denylist matters more than the feature list"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why every roundup of desktop automation software misses the same thing
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open any roundup of desktop automation software and the same dozen products show up:
            UiPath, Power Automate Desktop, Automation Anywhere, Blue Prism, AutoHotkey, SikuliX,
            WinAppDriver, Robot Framework, AskUI, TestComplete, Ranorex, Squish. The grading rubric
            is always the same: visual builder, AI features, image recognition, cross-platform,
            licensing, ecosystem. Pick one, install it, record a workflow, ship it.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two weeks later the workflow fails. Nobody changed the application. Nobody changed the
            workflow. The button is still there, the form is still there, the data is still there.
            But the recorded selector embedded a string that has changed since the recording: the
            window title, a relative timestamp, a generated identifier, a pane class name that the
            browser updated. The replay engine cannot find the element. The whole flow halts.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That failure mode is invisible at evaluation time and dominant at production time. It is
            the actual cost of running recorded automations at scale. The choice of desktop
            automation software should be graded on it. Almost no guide does.
          </p>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: a 19-entry HashSet, a 9-line function, and a process-boundary check
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Terminator's workflow recorder is a Rust crate at{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  crates/terminator-workflow-recorder
                </code>
                . The file that does selector hygiene is{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  src/events.rs
                </code>
                . Three pieces of code in that file decide what is allowed to land in a recorded
                YAML selector.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                <code>NULL_LIKE_VALUES</code> is a static <code>HashSet</code> with 19 entries.{" "}
                <code>contains_relative_time</code> is a 9-line function that returns true if a
                string smells like a timestamp. <code>is_internal_element</code> wraps both, plus
                three browser-internal class names and three per-browser window-title suffixes. Any
                parent name that matches any of these is dropped from the persisted selector.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                That is the entire mechanism. It is small, it is boring, and it is the difference
                between a workflow that runs in three weeks and one that does not. The rest of this
                guide walks through it.
              </p>
            </div>
          </GlowCard>
        </section>

        <MetricsRow metrics={filterMetrics} />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The denylist, line by line
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <code>NULL_LIKE_VALUES</code> sits at the top of the file. It is a{" "}
            <code>LazyLock&lt;HashSet&lt;&amp;&apos;static str&gt;&gt;</code> so the lookup is{" "}
            <NumberTicker value={1} />-time and there is no per-event allocation. Three categories
            of value live in it. The first is the obvious set every developer would write: null,
            nil, undefined, the empty string. The second is the Windows-specific patterns the OS
            emits when an element exists but never had a real name: unknown, none, empty in their
            literal, angle-bracket, and parenthesized variants. The third is what makes this
            recorder different: <code>bstr()</code>, <code>variant()</code>, and{" "}
            <code>variant(empty)</code>. Those are the string representations Windows UIA returns
            when a COM <code>BSTR</code> or <code>VARIANT</code> field was zero-initialized. They
            are common in legacy WPF and WinForms applications and they look like real names if you
            do not know what they are.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={nullLikeRust}
              language="rust"
              filename="crates/terminator-workflow-recorder/src/events.rs"
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            <code>contains_relative_time</code> is the second piece. It is a single function that
            takes an already-lowercased string and returns true if the string contains any of nine
            substrings. The first six are obvious. The last four catch the compact form modern UIs
            use, like &quot;5 mins&quot; or &quot;2 hrs&quot; without a trailing &quot;ago&quot;.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={relativeTimeRust}
              language="rust"
              filename="crates/terminator-workflow-recorder/src/events.rs"
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            <code>is_internal_element</code> is wired into the parent walk. It catches three browser
            implementation classes that exist on every modern Chromium window, plus the per-browser
            window-title suffixes that any Pane will inherit when the user has the browser focused.
            And then it folds in <code>contains_relative_time</code>, so the relative-time check
            applies to every parent, not just to the target element.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={internalElementRust}
              language="rust"
              filename="crates/terminator-workflow-recorder/src/events.rs"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What that looks like in a recorded workflow
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The cleanest way to see what the denylist does is to compare what a naive recorder would
            produce against what Terminator actually persists for the same click. The example below
            is a click on the &quot;Mark as read&quot; button on a row in Outlook. Same click, same
            element, same UIA tree.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="A click on 'Mark as read' in Outlook"
              before={{
                label: "Naive recorder",
                content: beforeYaml,
                highlights: [
                  "Window title 'Inbox - matt@mediar.ai - Outlook' embedded as a parent",
                  "COM null pattern 'bstr()' captured as a Pane name",
                  "Relative timestamp '3 hours ago' baked into the row identifier",
                  "Selector breaks the moment the email is more than three hours old",
                ],
              }}
              after={{
                label: "Terminator recorder",
                content: afterYaml,
                highlights: [
                  "Window title stripped: process:olk.exe already targets the application",
                  "bstr() Pane skipped via NULL_LIKE_VALUES",
                  "Timestamp removed via contains_relative_time",
                  "Survives across days, mailbox renames, and Outlook restarts",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How the recorder actually walks the tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The denylist is one piece. It only matters because the surrounding logic respects it.
            The function that does the walking is <code>build_parent_hierarchy</code>. It is short,
            it has a clear contract, and it is the load-bearing piece of any selector that survives
            replay.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="From a raw click to a persisted selector"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
          <div className="mt-6">
            <StepTimeline
              title="The six steps build_parent_hierarchy executes per click"
              steps={recorderSteps}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Watching the recorder skip in real time
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Run the recorder with logging at debug level and every skipped parent is emitted as a
            structured log line. This is what a single Outlook click looks like as the recorder
            processes it. The three info lines are the denylist firing.
          </p>
          <div className="mt-6">
            <TerminalOutput lines={terminalLines} title="recorder.log" />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The six checks that run before any selector is saved
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The denylist is one of six gating conditions that run on every parent the recorder
            considers. Each one rules out a class of selector that has been observed to break in the
            wild. None of them is exotic on its own; the value is in having all six wired in by
            default rather than left as a configuration the user is expected to discover.
          </p>
          <div className="mt-6">
            <BentoGrid cards={filterCards} />
          </div>
        </section>

        <section className="mt-14">
          <ProofBanner
            quote="The fastest way to learn what a desktop automation tool will fail on is to read its recorder."
            metric="6 gates per parent, 0 configuration"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How this maps to other desktop automation software
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most other tools handle some of these problems somewhere in the pipeline, but they do it
            at replay time, not record time. Replay-time fallbacks (anchor matching, OCR rescue,
            visual element recognition) are useful, but they are repairs on top of a recording that
            already lost information. Doing the work at record time means the recording itself is
            the artifact you trust. The table below is what a serious comparison looks like once you
            grade on this dimension.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="Terminator"
              competitorName="Typical RPA recorder"
              rows={comparisonRows}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why this matters for an AI coding assistant
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator is not a designer-driven RPA suite. It is a developer framework, distributed
            as a Rust crate, an npm package, a Python package, and an MCP server. The audience is
            developers wiring it into their own pipelines, and AI coding assistants (Claude Code,
            Cursor, VS Code, Windsurf) wiring it in via MCP.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The reason the denylist is load-bearing for that audience is straightforward. An AI
            assistant that records a workflow once and replays it across many sessions cannot afford
            silent breakage. If the recorded selector embeds a timestamp from the moment of
            recording, every subsequent run is a new failure mode the model has to debug. The model
            has no way to know that the &quot;3 hours ago&quot; in the selector was the unstable
            part. The right place to fix that is one level down, in the recorder, with a hardcoded
            denylist that runs every time.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator does that. It is the same shape as Playwright&apos;s codegen for browsers:
            opinionated about what makes a stable selector, willing to throw away convenience in
            favor of survival. The difference is that Terminator covers the whole desktop, not just
            a browser tab.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="See what your existing workflows look like once the denylist runs"
          description="Bring a screen recording of a real flow and we will record it through Terminator on a call. You will see exactly which parents the recorder kept and which it threw away."
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Frequently asked questions
          </h2>
          <FaqSection items={faqs} />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Record a real workflow on a call and watch the denylist run."
      />
    </>
  );
}
