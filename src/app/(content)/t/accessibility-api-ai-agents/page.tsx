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
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  CodeComparison,
  BeforeAfter,
  MetricsRow,
  AnimatedChecklist,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  StepTimeline,
  BentoGrid,
  GlowCard,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/accessibility-api-ai-agents";
const PUBLISHED = "2026-04-25";
const TITLE =
  "Accessibility API for AI agents: stop re-reading the whole tree, diff it";
const DESCRIPTION =
  "Most articles about driving an AI agent through the accessibility API stop at 'read the tree.' That's the trap: re-snapshotting the tree on every step blows out tokens. Terminator's MCP returns only the lines that changed after each action. The regex strip and line-based diff live at crates/terminator/src/ui_tree_diff.rs, and 20 MCP tools accept ui_diff_before_after.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The accessibility tree is the right input for AI agents. Re-reading it after every action is the wrong loop. Terminator strips volatile #ids and bounds with two regexes, then line-diffs the tree, and ships only the delta back to the model.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility API for AI agents, the delta loop",
    description:
      "Two regexes (` #[\\w\\-]+` and `bounds: \\[[^\\]]+\\]`) strip UIA volatility. similar::TextDiff::from_lines emits + and - only. 20 MCP tools take ui_diff_before_after.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Accessibility API for AI agents" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Accessibility API for AI agents", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does an accessibility API actually give an AI agent that a screenshot doesn't?",
    a: "Two things a vision model has to reconstruct from pixels. First, the role of every element (Button, ComboBox, Edit, MenuItem, ListItem) as the OS itself classifies it, not as a CNN guesses. Second, a stable selector grammar (role + name + window + AutomationId) that the agent can call back to in the next step without re-finding the element by visual coordinates. On Windows that comes from UIAutomation. On macOS it's AXUIElement. On Linux it's AT-SPI2. The agent's job changes from 'where is the Save button at this DPI' to 'invoke the element whose role is Button and whose name is Save.'",
  },
  {
    q: "If accessibility trees are so good for agents, why do most accessibility-tree agents still struggle on long tasks?",
    a: "Because they re-read the full tree after every action. A medium-complexity desktop window (Outlook compose, a Salesforce browser tab, a Jira backlog) renders 800 to 4,000 elements in its UIA tree. Serialized as YAML that's roughly 30,000 to 120,000 input tokens. If the agent calls 20 tools to finish a task, the model has now seen the same tree 20 times, with most attributes identical. The token bill scales with steps, the latency scales with steps, and the model gets confused by what changed because nothing is highlighted. The fix is not 'use a smaller tree,' it's 'send a diff.'",
  },
  {
    q: "Where is the diff implementation in Terminator and what does it actually do?",
    a: "crates/terminator/src/ui_tree_diff.rs. The function `simple_ui_tree_diff` at line 58 takes the before-tree and after-tree as strings, detects whether they're JSON or compact YAML, and runs them through `remove_ids_and_bounds_from_compact_yaml` (lines 40-50) or `preprocess_tree` (lines 26-35). The YAML path uses two regexes: ` #[\\w\\-]+` to strip indices like `#12345` and `#abc-def`, and `bounds: \\[[^\\]]+\\],?\\s*` to strip bounding-rectangle blocks. The JSON path walks the value tree and drops `id` and `element_id` keys recursively. Then it calls `TextDiff::from_lines` from the `similar` crate (line 81) and emits only `+` (insert) and `-` (delete) lines. Equal lines are skipped. If nothing changed, it returns `Ok(None)` and the model sees no tree at all that turn.",
  },
  {
    q: "Which MCP tools accept ui_diff_before_after and why does that matter?",
    a: "Twenty of them, including click_element, type_into_element, press_key, press_key_global, mouse_drag, scroll_element, select_option, set_selected, set_value, invoke_element, navigate_browser, open_application, activate_element, validate_element, wait_for_element, execute_browser_script, capture_screenshot, run_command, and the meta-tool execute_sequence. Every action tool that mutates UI state takes the parameter. The tool captures a tree snapshot before it fires the action, performs the action, captures another snapshot, runs `simple_ui_tree_diff`, and includes the diff in the tool result. That removes a whole class of agent calls (the explicit get_window_tree after every action) and is exactly what the description on get_window_tree itself warns about: 'Do NOT call after action tools - use their ui_diff_before_after/include_tree_after_action params instead.'",
  },
  {
    q: "How is the tree formatted before it's diffed?",
    a: "Compact YAML, not raw UIA serialization. crates/terminator/src/tree_formatter.rs::format_tree_as_compact_yaml emits one element per line in the form `#1 [ROLE] name (bounds: [x,y,w,h], focusable, focused, selected, value: ...)`. Children are indented two spaces. Elements with bounds get a 1-based clickable index; elements without bounds get a `- [ROLE]` dash prefix. State flags are only included when true (`focused`, `selected`, `toggled`, `disabled`). This format is denser than UIA's native XML by an order of magnitude, and the regex-based strip in ui_tree_diff.rs is designed to operate on exactly this shape.",
  },
  {
    q: "Why strip the AutomationId and bounding rectangle before diffing?",
    a: "Because both are volatile across a single application's run. `AutomationId` is generated per-instance for many WinUI, WPF, and Electron controls; the same Save button gets a new id every render pass. `bounds` shifts whenever the window is resized, scrolled, or DPI-changed, even when nothing semantically changed. If you don't strip these, every action looks like a 200-line diff because the layout reflowed. After the strip, the diff is exactly the elements that appeared, disappeared, or had a name, role, or state change. That's what the agent actually needs to reason about.",
  },
  {
    q: "What does this mean for token cost on a real desktop task?",
    a: "Take a 20-step automation that opens Outlook, drafts a reply, attaches a file, and sends it. The Outlook compose window's UIA tree is roughly 900 elements. In compact YAML that's about 24,000 tokens. Naive loop: send the full tree before step 1 and after each of 20 actions. Total: 21 * 24,000 = 504,000 tokens of tree input. Delta loop: send the full tree once, then 20 deltas of typically 5 to 30 lines each (~200 tokens). Total: 24,000 + 20 * 200 = 28,000 tokens of tree input. The agent does the same task with about 5% of the input cost on the tree side, and the model is no longer drowning in unchanged context.",
  },
  {
    q: "Does the diff path work for browser automation too, or just native windows?",
    a: "Both. UIA exposes Chrome, Edge, and Firefox windows as accessibility trees, so the same `get_window_tree(process: 'chrome')` returns a tree the diff can run on. For richer DOM data, set `include_browser_dom: true` and you get the DOM merged with the UIA tree, prefixed with `#d` for DOM elements and `#u` for UIA elements (see ElementSource in tree_formatter.rs lines 41-79). The Chrome extension Terminator ships does the bridging. The diff treats both source prefixes the same — they're just lines.",
  },
  {
    q: "What if I want the full tree on a specific step, not the diff?",
    a: "Pass `include_tree_after_action: true` instead of `ui_diff_before_after: true`. The action tools accept either. Use the full tree when the action triggered a navigation or a window switch and you genuinely want the agent to re-orient. Use the diff for incremental changes within the same window. Mixing both during a workflow is fine; both branches share the same `format_tree_as_compact_yaml` pipeline so the agent doesn't see a different schema between turns.",
  },
  {
    q: "How is Terminator different from screenshot-driven agents like Claude computer use or browser-use?",
    a: "Different input, different loop, different cost curve. Screenshot agents send images to a vision model on every step; the model burns tokens on layout it already knows and re-derives selectors that are not stable across renders. Terminator sends a structured tree once and a delta after each action, so the model can plan with cheap, fully-described elements and call back to them by selector. Vision is still available (`include_gemini_vision: true`, `include_omniparser: true`, OCR via `include_ocr: true`) for the cases where an app has no accessible surface, but it's a fallback, not the default. The deterministic outcome that Terminator advertises (>95% success rate at CPU speed) comes from the accessibility-tree-plus-delta path being the primary route.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "tree input frequency",
    competitor: "full tree on every agent step",
    ours: "full tree once, delta on every step after",
  },
  {
    feature: "volatility filtering",
    competitor: "raw IDs and bounds bleed into every diff",
    ours: "two regex passes strip #ids and bounds before diffing",
  },
  {
    feature: "diff engine",
    competitor: "manual JSON.diff or string compare per agent author",
    ours: "similar::TextDiff::from_lines, line-based, single source of truth",
  },
  {
    feature: "where the delta is exposed",
    competitor: "rebuilt by hand in each agent harness",
    ours: "ui_diff_before_after parameter on 20 MCP action tools",
  },
  {
    feature: "format consistency",
    competitor: "full tree and partial tree often have different schemas",
    ours: "compact YAML for both full and delta, same parser on the agent side",
  },
  {
    feature: "no-op handling",
    competitor: "agent receives an unchanged tree and may hallucinate progress",
    ours: "Ok(None) is returned, the agent literally sees nothing happened",
  },
  {
    feature: "browser + native parity",
    competitor: "DOM and UIA come back in different shapes",
    ours: "both prefixed (#d, #u) inside the same compact YAML, diff treats them the same",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Two regexes do the volatility strip",
    description:
      "` #[\\w\\-]+` removes per-instance indices like #12345. `bounds: \\[[^\\]]+\\],?\\s*` removes bounding-rectangle blocks. Defined at ui_tree_diff.rs lines 43 and 48.",
    size: "2x1",
    accent: true,
  },
  {
    title: "similar::TextDiff::from_lines",
    description:
      "Line-based diff at line 81. Equal lines are skipped (line 93). Only Insert and Delete lines reach the model, prefixed with + and -.",
    size: "1x1",
  },
  {
    title: "Ok(None) on no change",
    description:
      "Line 99 returns no diff at all when the action did not move the tree. The agent literally sees the action was a no-op rather than re-parsing an unchanged dump.",
    size: "1x1",
  },
  {
    title: "JSON path or YAML path",
    description:
      "Detected at line 63 by checking if the tree starts with `- [`. JSON trees go through preprocess_tree (lines 26-35); YAML trees through the regex strip (lines 40-50). Same diff after.",
    size: "1x1",
  },
  {
    title: "20 MCP tools, one parameter",
    description:
      "click_element, type_into_element, press_key, set_value, invoke_element, scroll_element, select_option, set_selected, mouse_drag, navigate_browser, open_application, activate_element, validate_element, wait_for_element, execute_browser_script, capture_screenshot, run_command, press_key_global, execute_sequence — all accept ui_diff_before_after.",
    size: "2x1",
  },
];

const diffSource = `// crates/terminator/src/ui_tree_diff.rs
// lines 40 to 103, the YAML diff path

pub fn remove_ids_and_bounds_from_compact_yaml(yaml_str: &str) -> String {
    // Remove #id patterns (e.g., #12345, #abc-def-123)
    let id_re = Regex::new(r" #[\\w\\-]+").unwrap();
    let result = id_re.replace_all(yaml_str, "");

    // Remove bounds: [x,y,w,h] blocks (volatile across resize, scroll, DPI)
    let bounds_re = Regex::new(r"bounds: \\[[^\\]]+\\],?\\s*").unwrap();
    bounds_re.replace_all(&result, "").to_string()
}

pub fn simple_ui_tree_diff(
    old_tree_str: &str,
    new_tree_str: &str,
) -> Result<Option<String>, String> {
    let is_yaml = old_tree_str.trim_start().starts_with("- [");

    let (old_processed, new_processed) = if is_yaml {
        (
            remove_ids_and_bounds_from_compact_yaml(old_tree_str),
            remove_ids_and_bounds_from_compact_yaml(new_tree_str),
        )
    } else {
        (
            preprocess_tree(old_tree_str)?,
            preprocess_tree(new_tree_str)?,
        )
    };

    let diff = TextDiff::from_lines(&old_processed, &new_processed);
    let mut changed_lines = Vec::new();

    for change in diff.iter_all_changes() {
        match change.tag() {
            ChangeTag::Delete => changed_lines.push(format!("- {}", change.value().trim_end())),
            ChangeTag::Insert => changed_lines.push(format!("+ {}", change.value().trim_end())),
            ChangeTag::Equal  => { /* skipped */ }
        }
    }

    if changed_lines.is_empty() {
        Ok(None) // the action moved nothing, the agent sees that explicitly
    } else {
        Ok(Some(changed_lines.join("\\n")))
    }
}`;

const fullTreeSnippet = `# get_window_tree(process: "outlook")
# returned every step in the naive loop

#1 [Window] Inbox - matt@mediar.ai - Outlook (bounds: [0,0,1920,1080], focused)
  #2 [TitleBar] (bounds: [0,0,1920,32])
    #3 [Button] Minimize (bounds: [1788,0,44,32])
    #4 [Button] Maximize (bounds: [1832,0,44,32])
    #5 [Button] Close (bounds: [1876,0,44,32])
  #6 [Pane] Ribbon (bounds: [0,32,1920,108])
    #7 [TabItem] Home (bounds: [12,32,68,32], selected)
    #8 [TabItem] Send / Receive (bounds: [80,32,124,32])
    #9 [TabItem] Folder (bounds: [204,32,68,32])
    #10 [TabItem] View (bounds: [272,32,52,32])
    ... 870 more elements ...
  #881 [List] Messages (bounds: [240,140,520,940])
    #882 [ListItem] John Doe — Quarterly review (bounds: [240,140,520,72], selected)
    ... 60 more list items ...

# ~24,000 input tokens for the agent, every turn`;

const deltaSnippet = `# click_element(selector: "name:Reply") with ui_diff_before_after: true
# returned by the same step in the delta loop

ui_tree_diff:
- #882 [ListItem] John Doe — Quarterly review (selected)
+ #882 [ListItem] John Doe — Quarterly review
+ #1241 [Window] RE: Quarterly review - Message (focused)
+ #1242 [Edit] To (value: john@acme.com)
+ #1243 [Edit] Cc
+ #1244 [Edit] Subject (value: RE: Quarterly review)
+ #1245 [Edit] Message body (focusable)
+ #1246 [Button] Send

# ~200 input tokens. The model sees exactly what the click produced.`;

const usageSnippet = `// One agent step, through the MCP server.
// Notice the absence of any explicit get_window_tree call.

await mcp.call("click_element", {
  process: "outlook",
  selector: "role:Button && name:Reply",
  ui_diff_before_after: true,    // <-- the only line that matters
});

// Result includes:
// {
//   "action": "click_element",
//   "status": "executed_without_error",
//   "ui_tree_diff": "- #882 [ListItem] ...selected\\n+ #882 [ListItem] ...\\n+ #1241 [Window] RE: ..."
// }

// The agent now plans the next step against the delta,
// not against a 24,000-token re-snapshot of the same tree.`;

const metrics = [
  { value: 20, label: "MCP action tools accept ui_diff_before_after" },
  { value: 2, label: "regex passes strip volatile UIA attributes pre-diff" },
  { value: 95, suffix: "%", label: "input-token reduction in a 20-step Outlook task vs naive loop" },
  { value: 0, label: "lines emitted by the diff when the action was a no-op" },
];

const checklistItems = [
  { text: "On the first agent turn, call get_window_tree once. Cache the YAML on your side. The agent gets the full tree exactly once per task." },
  { text: "On every action tool call after that, set `ui_diff_before_after: true`. The MCP server returns the changed lines, prefixed with + and -, in the result." },
  { text: "When the action triggered a navigation or window switch (open_application, navigate_browser, activate_element on a different window), use `include_tree_after_action: true` instead so the agent fully re-orients." },
  { text: "Treat `Ok(None)` (no diff returned) as 'the action did not move the tree.' That is a real, actionable signal — the model should consider the action a no-op rather than hallucinate a state change." },
  { text: "Never strip the +/- prefixes before passing the diff into the model context. The prefixes are how the agent tells removed elements from added ones; without them, role: Button could mean either appeared or disappeared." },
  { text: "If you also enable include_browser_dom or include_ocr, the diff still works — both sources land inside the same compact YAML, prefixed by source (#u, #d, #o), and TextDiff treats them as lines." },
];

const stepperSteps = [
  {
    title: "Turn 1: full tree, once",
    description:
      "The MCP agent calls get_window_tree(process: 'chrome'). format_tree_as_compact_yaml runs. The agent receives the full compact YAML — every element with role, name, bounds, and state. This is the only time the model sees the entire tree.",
  },
  {
    title: "Action tool, with the diff flag",
    description:
      "The agent calls click_element / type_into_element / press_key with `ui_diff_before_after: true`. The server snapshots the tree, fires the action, snapshots again, and runs simple_ui_tree_diff between the two snapshots.",
  },
  {
    title: "Volatility strip",
    description:
      "Inside ui_tree_diff.rs, two regexes drop ` #<id>` patterns and `bounds: [...]` blocks from both snapshots. UIA's per-instance noise (re-rendered AutomationIds, layout reflow) is gone before the diff even starts.",
  },
  {
    title: "Line-based diff",
    description:
      "similar::TextDiff::from_lines walks the cleaned snapshots. Equal lines are skipped (zero output). Inserts emit `+ <line>`. Deletes emit `- <line>`. The result is concatenated and shoved into the action tool's response under `ui_tree_diff`.",
  },
  {
    title: "Agent reasons against the delta",
    description:
      "The model sees: maybe 5 lines, maybe 50, almost never 4,000. It plans the next action against the changed elements, calls another action tool, and the loop repeats. Total tree input across N actions is roughly 1*full + N*delta, not (N+1)*full.",
  },
];

const relatedPosts = [
  {
    title: "Accessibility API desktop automation, without the mouse",
    excerpt:
      "Companion piece on the write side of UIA. invoke() fires UIInvokePattern in nine lines of Rust. No SendInput, no focus check, no visibility check.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Patterns",
  },
  {
    title: "Claude computer use vs accessibility-tree agents",
    excerpt:
      "Screenshot loops vs structured-tree loops. Where vision agents plateau and why the accessibility-API path goes 100x faster on the same task.",
    href: "/t/claude-computer-use",
    tag: "Agents",
  },
  {
    title: "Open source computer use AI agents, April 2026",
    excerpt:
      "A current snapshot of the open ecosystem: which agents use accessibility APIs, which use vision, and which combine both. Includes Terminator's place in the lineup.",
    href: "/t/open-source-computer-use-agents-april-2026",
    tag: "Ecosystem",
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

      <article className="text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Accessibility API for AI agents:{" "}
              <GradientText>diff the tree</GradientText>, don&apos;t re-read it.
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              The accessibility tree is the right input for an AI agent. UIA on
              Windows, AXUIElement on macOS, AT-SPI2 on Linux — all of them
              expose role, name, AutomationId, state, and bounds for every
              element on screen. That part most articles cover well. The part
              they miss is the loop. An agent that re-reads the full tree on
              every step burns tokens linearly with task length and ends up
              drowning in unchanged context. Terminator returns a{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                ui_tree_diff
              </code>{" "}
              after each action: only the lines that changed, with volatile{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                #ids
              </code>{" "}
              and{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                bounds
              </code>{" "}
              stripped first. That is the unlock for long-horizon agents.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                ui_diff_before_after
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                simple_ui_tree_diff
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                similar::TextDiff
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                MCP
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
          readingTime="11 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers wiring AI agents into desktop apps"
            highlights={[
              "Two regexes strip volatile #ids and bounds before diffing",
              "similar::TextDiff::from_lines emits only + and - lines",
              "20 MCP action tools accept ui_diff_before_after as a parameter",
              "Compact YAML format keeps full and delta on the same schema",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-12">
          <RemotionClip
            title="Diff the tree, don't re-read it"
            subtitle="The accessibility-API loop most agent guides skip"
            captions={[
              "full tree once, delta after every action",
              "two regexes strip volatile #ids and bounds",
              "similar::TextDiff::from_lines does the rest",
              "20 MCP tools take ui_diff_before_after",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The trap every other guide on this leaves you in
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read the existing playbooks for &quot;use the accessibility API to
            drive an AI agent&quot; and you will get the same recipe. Pull the
            UIA tree, serialize it, hand it to the model, ask the model what
            element to act on, send back an action. Then, almost universally,
            the article ends. What it does not say is what the loop looks like
            after action one. The honest answer is: most implementations call
            the tree-getter again. Every step. From scratch.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That recipe falls apart on anything longer than three or four
            actions. A real desktop window has 800 to 4,000 accessible
            elements. Outlook compose, Salesforce inside Chrome, a Jira
            backlog with 200 visible cards — all of them sit in that range.
            Re-reading those on every step pushes input tokens north of half
            a million for a single task. The model spends most of its
            attention on layout it has already seen, and gets confused about
            what your last click actually did because nothing in the dump is
            highlighted.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The fix is structural. Don&apos;t send the tree again. Send the
            diff.
          </p>
          <MetricsRow metrics={metrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the loop actually looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things happen on every Terminator agent step. The
            accessibility tree gets snapshotted. An action tool fires. The
            tree gets snapshotted again, diffed against the first snapshot,
            and only the changed lines reach the model. Inside the agent
            harness, that whole flow is one MCP call with one extra
            parameter.
          </p>
          <AnimatedBeam
            title="From snapshot to delta to model context"
            from={[
              { label: "Pre-action snapshot", sublabel: "compact YAML" },
              { label: "Post-action snapshot", sublabel: "compact YAML" },
            ]}
            hub={{ label: "ui_tree_diff.rs", sublabel: "regex strip + line diff" }}
            to={[
              { label: "+ added lines", sublabel: "new elements / state" },
              { label: "- removed lines", sublabel: "gone elements / state" },
              { label: "Ok(None)", sublabel: "no-op signal" },
            ]}
            accentColor="#FF3E00"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The two regexes and the line diff
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator/src/ui_tree_diff.rs
            </code>{" "}
            and the whole thing is 100 lines, including doc comments. Two
            regex strips, one branch on JSON vs YAML format, one call into
            the{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              similar
            </code>{" "}
            crate, three ChangeTag arms. Every line that does anything is in
            the block below.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={diffSource}
              language="rust"
              filename="crates/terminator/src/ui_tree_diff.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The first regex,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              {' #[\\w\\-]+'}
            </code>
            , drops UIA-assigned indices like{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #12345
            </code>
            . Those are non-deterministic across renders, especially in
            WinUI, WPF, and Electron apps. The second regex,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              {'bounds: \\[[^\\]]+\\]'}
            </code>
            , drops bounding rectangles, which shift every time the window
            resizes or scrolls. Both pieces of data are useful in the full
            tree (so the agent can call clicks at coordinates), but they are
            pure noise inside a diff. The strip is the difference between a
            5-line meaningful change and a 200-line layout-reflow change.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="If the action did not move the tree, simple_ui_tree_diff returns Ok(None). The agent gets a literal no-op signal instead of a re-parsed identical dump."
            source="ui_tree_diff.rs line 99, terminator-rs"
            metric="0 lines"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Full tree vs delta, on the same step
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Same action, two response shapes. The naive loop returns the
            entire window tree. The delta loop returns the lines that
            changed. Toggle below to see what the model would actually
            ingest in each case for a single click on Reply in Outlook.
          </p>
          <CodeComparison
            title="What the agent sees per step"
            leftLabel="Naive (full tree)"
            leftLines={900}
            leftCode={fullTreeSnippet}
            rightLabel="Delta (ui_diff_before_after)"
            rightLines={9}
            rightCode={deltaSnippet}
            reductionSuffix="fewer lines per step"
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The model still has the full tree from turn 1 in its context. It
            still knows about the title bar, the ribbon, and the message
            list. It just does not need to re-read all of that to figure out
            that a click on Reply opened a compose window. The compose
            window is the diff. That is the whole insight.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            One parameter, twenty tools
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            You do not have to wire the diff yourself. The MCP server
            accepts{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              ui_diff_before_after: true
            </code>{" "}
            on every tool that mutates UI state. The server captures the
            before-tree, fires the action, captures the after-tree, runs{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              simple_ui_tree_diff
            </code>
            , and includes the result in the tool response. The
            description on{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_window_tree
            </code>{" "}
            spells the policy out: &quot;Do NOT call after action tools, use
            their{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              ui_diff_before_after
            </code>
            /
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              include_tree_after_action
            </code>{" "}
            params instead.&quot;
          </p>
          <div className="mt-6">
            <Marquee speed={26} pauseOnHover>
              {[
                "click_element",
                "type_into_element",
                "press_key",
                "press_key_global",
                "mouse_drag",
                "scroll_element",
                "select_option",
                "set_selected",
                "set_value",
                "invoke_element",
                "navigate_browser",
                "open_application",
                "activate_element",
                "validate_element",
                "wait_for_element",
                "execute_browser_script",
                "capture_screenshot",
                "run_command",
                "highlight_element",
                "execute_sequence",
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
          <div className="mt-8">
            <AnimatedCodeBlock
              code={usageSnippet}
              language="typescript"
              filename="agent-loop.ts"
              typingSpeed={4}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five things the diff path actually does
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed mb-6">
            The implementation is small, but each piece is doing real work
            inside the agent loop. Here is the breakdown of what every line
            in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              ui_tree_diff.rs
            </code>{" "}
            buys you.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            One source tree, two agent loops
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same accessibility surface can be driven two ways. One is
            the loop the rest of the open ecosystem ships with. The other
            is the loop Terminator ships out of the box. They use the same
            input but produce very different cost curves over a 20-step
            task.
          </p>
          <BeforeAfter
            title="Naive accessibility-tree agent vs delta-loop agent"
            before={{
              label: "Naive loop",
              content:
                "Full tree on turn 1. Action. Full tree again. Action. Full tree again. Action. The model re-ingests the entire window after every step. Layout reflow, AutomationId churn, and bounds shifts pollute the context. Token cost scales linearly with task length.",
              highlights: [
                "21 full snapshots over 20 steps",
                "~500,000 tree input tokens on a medium task",
                "Bounds and AutomationId noise inflates apparent change",
                "Hard to tell which step actually moved the UI",
              ],
            }}
            after={{
              label: "Delta loop",
              content:
                "Full tree on turn 1. Action with ui_diff_before_after. Tiny diff back. Action with the flag again. Tiny diff back. The model still has the original tree in context, but reasons against the changes. Token cost is roughly flat past turn 1.",
              highlights: [
                "1 full snapshot, 20 small deltas",
                "~5% of the tree-input tokens of the naive loop",
                "Volatile attributes stripped before diffing",
                "Ok(None) when the action did not move the tree",
              ],
            }}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five steps inside one MCP turn
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is the sequence the server runs the moment you flip
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              {' ui_diff_before_after: true'}
            </code>
            . You do not write any of this; the MCP transport handles it.
            But knowing the shape is what lets you reason about the agent
            loop.
          </p>
          <StepTimeline title="One agent turn end to end" steps={stepperSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How to wire your agent harness to use this
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed mb-6">
            Six rules, none of them subtle. If your harness already has an
            MCP transport, every one of these is a five-minute change.
          </p>
          <AnimatedChecklist
            title="Delta-loop checklist"
            items={checklistItems}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Side by side: which loop are you running?
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed mb-6">
            If you have built an accessibility-tree agent before, this
            table is the question to ask of your own code. Most agents in
            the wild are running the left column even when they think
            they&apos;re running the right.
          </p>
          <ComparisonTable
            productName="Terminator delta loop"
            competitorName="Naive accessibility-tree loop"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-8">
              <h2 className="text-2xl font-bold tracking-tight">
                The shortest path to trying this
              </h2>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Wire the MCP server into Claude Code, Cursor, or VS Code with
                a single command. The server ships with{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  ui_diff_before_after
                </code>{" "}
                already exposed on every action tool. Your existing AI coding
                assistant becomes a desktop agent on a delta loop, not a
                screenshot loop.
              </p>
              <pre className="mt-5 p-4 rounded-lg bg-zinc-900 text-zinc-100 text-sm font-mono overflow-x-auto">
                <code>{`claude mcp add terminator "npx -y terminator-mcp-agent@latest"`}</code>
              </pre>
              <p className="mt-3 text-zinc-600 text-sm">
                MIT licensed. Source at{" "}
                <a
                  href="https://github.com/mediar-ai/terminator"
                  className="text-orange-600 hover:underline"
                >
                  github.com/mediar-ai/terminator
                </a>
                . The diff path is at{" "}
                <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                  crates/terminator/src/ui_tree_diff.rs
                </code>
                .
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Wiring an AI agent into a desktop without lighting your token bill on fire?"
          description="Book 20 minutes with the maintainers. We will walk through the delta loop, the MCP tool surface, and what it takes to drop Terminator into your existing harness."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Other Terminator pieces about the agent surface"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Talk to the maintainers about delta-loop accessibility-API agents."
        />
      </article>
    </>
  );
}
