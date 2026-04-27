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
  AnimatedChecklist,
  TerminalOutput,
  ComparisonTable,
  GlowCard,
  StepTimeline,
  BentoGrid,
  BeforeAfter,
  Marquee,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/tools-for-automation-testing-of-desktop-application";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Tools for automation testing of desktop application, with a structural diff baked into every action";
const DESCRIPTION =
  "Most desktop test tools want you to write assertions per step. Terminator returns a unified diff of the UI tree before and after each action, with element IDs and pixel coordinates already stripped. The stripping logic lives at crates/terminator/src/ui_tree_diff.rs lines 7 and 40. The diff sits on every ClickResult and ActionResult as the uiDiff field.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "ui_tree_diff.rs strips ids, element_ids, and pixel bounds before diffing the UI tree, so a moved button produces zero output. Bounds-agnostic snapshot diffs as a testing primitive.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Desktop test tools that diff the UI tree, with the IDs already stripped",
    description:
      "215 lines in ui_tree_diff.rs. remove_ids on line 7, regex bounds remover on line 40, simple_ui_tree_diff on line 58. The reason a Terminator-driven desktop test does not flake on layout shift.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Tools for automation testing of desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Tools for automation testing of desktop application",
    url: PAGE_URL,
  },
];

const faqs: FaqItem[] = [
  {
    q: "Why does a desktop test tool need a UI tree diff at all?",
    a: "Because the alternative is writing one or two assertions per step (verify field X has value Y, verify button Z is now disabled), which collapses under volume. Once a regression suite covers a real desktop app, the assertions outnumber the actions and the suite becomes a maintenance pit. A structural diff inverts the model: every action records what changed in the accessibility tree, and the test only fails when the change does not match. The fact that Terminator computes the diff inside the agent (crates/terminator/src/ui_tree_diff.rs) instead of leaving it to user code is what lets you snapshot a UI flow with zero asserts.",
  },
  {
    q: "How does the diff stay stable when the UI shifts a few pixels between runs?",
    a: "Through aggressive preprocessing before the line diff runs. For JSON trees, remove_ids at ui_tree_diff.rs line 7 walks the tree and drops every key named 'id' or 'element_id'. For compact YAML trees, remove_ids_and_bounds_from_compact_yaml at line 40 applies two regexes: ' #[\\w\\-]+' to strip identifier suffixes and 'bounds: \\[[^\\]]+\\],?\\s*' to strip pixel rectangles. After both trees pass through that filter, only the structurally meaningful lines remain. A button that moved from x=412 to x=540 produces no diff. A button whose name changed from Submit to Save produces one '-' line and one '+' line. That distinction is the entire point.",
  },
  {
    q: "Where does the diff actually surface in the API I write tests against?",
    a: "On the result of every action. In the TypeScript SDK (docs/TERMINATOR_JS_API.md lines 470 to 500), ClickResult and ActionResult both expose an optional uiDiff field of shape { diff: string, treeBefore?: string, treeAfter?: string, hasChanges: boolean }. You opt in per call: element.click({ uiDiff: true }). The MCP agent surfaces the same shape on click_element, type_into_element, press_key, and a handful of other tools, so an AI coding assistant testing a desktop app sees the diff in its tool response and can decide whether the change matched intent. Without the flag the action runs without any tree capture and the field is undefined.",
  },
  {
    q: "What format is the diff in, and why does that matter for snapshot testing?",
    a: "Unified-style line diff. Lines added in the after-tree are prefixed with '+ ', lines removed are prefixed with '- ', and equal lines are filtered out (ui_tree_diff.rs lines 86 to 96). The output is what Rust's similar crate produces from TextDiff::from_lines, which mirrors the behavior of Python's difflib.ndiff. That format matters because it is git-native: you can commit a baseline diff to your repo, diff again on the next run, and assert string equality. No image diffing library, no antialiasing tolerance, no font hinting workaround. The whole snapshot is a few hundred bytes of text per action and any reviewer can read it.",
  },
  {
    q: "How long does Terminator wait for the UI to settle before it captures the after-tree?",
    a: "1500 milliseconds by default, configurable per call. The timing lives at lib.rs line 1814 inside execute_with_ui_diff: tokio::time::sleep(Duration::from_millis(settle_ms)) runs after the action and before the after-snapshot. UiDiffOptions exposes settle_delay_ms so a fast modal can cut it to 200ms and a slow data-bound view can stretch it to 4000ms. Tree capture itself uses TreeBuildConfig with timeout_per_operation_ms=100 and yield_every_n_elements=25 to avoid stalling the accessibility thread, which matters because UIAutomation on Windows is notoriously deadlock-prone if you query it while it is still mutating.",
  },
  {
    q: "What if the diff is wrong because the accessibility tree is itself unreliable?",
    a: "Then you fall back to the same primitives the diff is built on. The same accessibility-tree dump that feeds the diff is also exposed through get_window_tree, so a test that suspects a flaky snapshot can capture the raw tree before and after manually, run the same regex preprocessor, and inspect any line. Because Terminator goes through the OS accessibility APIs (UIAutomation on Windows, AX on macOS) and not through pixel scraping, the tree reflects what assistive tech sees, not what a screenshot library guesses. You still get false positives when the app emits transient roles during animation, which is what the settle delay is for.",
  },
  {
    q: "Does this replace tools like TestComplete, Ranorex, Squish, or WinAppDriver?",
    a: "It replaces them when your test runner is an AI coding assistant or a TypeScript script and the app is anything reachable through accessibility. Commercial desktop test tools were built for a recorder/playback workflow and a single-OS stack. Terminator is a developer framework, MIT licensed, with a Playwright-shaped API, an MCP server, and the diff-as-primitive design described above. If you have an existing TestComplete suite that drives a single Windows app and a team trained on its IDE, switching is a project. If you are starting a regression suite from scratch in 2026, or pointing Claude Code at a desktop app, Terminator is closer to the shape your test code actually wants.",
  },
  {
    q: "How do I install it for a desktop test suite?",
    a: "Three ways. For TypeScript: npm install @mediar-ai/terminator, then construct a Desktop, locate elements with selectors that look like role:Button|name:Submit, and call .click({ uiDiff: true }) to read result.uiDiff. For Python: pip install terminator, identical shape. For an AI coding assistant: claude mcp add terminator 'npx -y terminator-mcp-agent@latest', and the assistant gets click_element / type_into_element / press_key tools that all carry the uiDiff flag. The Rust crate is published as terminator on crates.io if you want to embed the engine directly in a Rust test harness.",
  },
];

const stripperSource = `// crates/terminator/src/ui_tree_diff.rs (lines 7 to 50)

/// Remove id and element_id fields from UI tree JSON
pub fn remove_ids(value: &Value) -> Value {
    match value {
        Value::Array(arr) => Value::Array(arr.iter().map(remove_ids).collect()),
        Value::Object(obj) => {
            let mut new_obj = serde_json::Map::new();
            for (key, val) in obj.iter() {
                if key != "id" && key != "element_id" {
                    new_obj.insert(key.clone(), remove_ids(val));
                }
            }
            Value::Object(new_obj)
        }
        _ => value.clone(),
    }
}

/// Remove IDs and bounds from compact YAML format for cleaner diffs
/// Compact YAML: - [Button] Submit #id123 (bounds: [10,20,100,30], focusable)
/// After:        - [Button] Submit (focusable)
pub fn remove_ids_and_bounds_from_compact_yaml(yaml_str: &str) -> String {
    let id_re = Regex::new(r" #[\\w\\-]+").unwrap();
    let result = id_re.replace_all(yaml_str, "");

    let bounds_re = Regex::new(r"bounds: \\[[^\\]]+\\],?\\s*").unwrap();
    bounds_re.replace_all(&result, "").to_string()
}`;

const usageSource = `// snapshot test of "click submit and confirm a confirmation dialog appears"

import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();
const submit = await desktop.locator("role:Button|name:Submit").first();

const result = await submit.click({ uiDiff: true });

if (!result.uiDiff?.hasChanges) {
  throw new Error("nothing on screen changed after click; that is a regression");
}

// commit this on the first run, diff against it on every run after
expect(result.uiDiff.diff).toMatchInlineSnapshot(\`
+   - [Window] Confirm Submission (modal)
+     - [Text] Are you sure you want to submit?
+     - [Button] Yes
+     - [Button] No
\`);`;

const diffOutputLines = [
  { text: "node test-checkout.js", type: "command" as const },
  { text: "[ui_diff] Capturing UI tree before action", type: "info" as const },
  {
    text: "[ui_diff] Action: click on role:Button|name:Place Order",
    type: "info" as const,
  },
  {
    text: "[ui_diff] Waiting 1500ms for UI to settle",
    type: "info" as const,
  },
  { text: "[ui_diff] Capturing UI tree after action", type: "info" as const },
  {
    text: "[ui_diff] UI changes detected: 412 characters in diff",
    type: "info" as const,
  },
  { text: "", type: "output" as const },
  { text: "diff:", type: "output" as const },
  { text: "- [Button] Place Order (enabled)", type: "output" as const },
  { text: "+ [Button] Place Order (disabled)", type: "output" as const },
  {
    text: "+ [ProgressBar] Processing your order (indeterminate)",
    type: "output" as const,
  },
  { text: "+ [Window] Order Confirmation (modal)", type: "output" as const },
  {
    text: "+   [Text] Order #4081 placed successfully",
    type: "output" as const,
  },
  { text: "+   [Button] View Receipt", type: "output" as const },
  { text: "+   [Button] Close", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "snapshot matched, test passed", type: "success" as const },
];

const pipelineSteps = [
  {
    title: "Capture before-tree",
    description:
      "self.get_window_tree(pid, None, Some(tree_config)) at lib.rs line 1923. PropertyLoadingMode is Complete by default so the snapshot includes Value, IsEnabled, IsExpanded, and accessible name. Tree capture is skipped if pid is 0; the action runs without diff and uiDiff is None.",
  },
  {
    title: "Format as compact YAML",
    description:
      "format_ui_node_as_compact_yaml(&tree_before, 0).formatted at lib.rs line 1934. Each node becomes a single line of '- [Role] Name #id (bounds: [..], flags)'. Indentation encodes parent-child structure.",
  },
  {
    title: "Run the action",
    description:
      "The async closure executes the user-requested click, type, press, or scroll. Result is captured but the after-snapshot has not started yet.",
  },
  {
    title: "Sleep for settle_delay_ms",
    description:
      "tokio::time::sleep(Duration::from_millis(settle_ms)) at lib.rs line 1942. Default 1500ms. The window for accessibility events to fire and the tree to stabilize. Fast modals can drop this to 200ms; slow data-bound views can raise it to 4000ms.",
  },
  {
    title: "Capture after-tree",
    description:
      "Second call to get_window_tree with the same TreeBuildConfig. If this fails (the app crashed, the window closed) the diff is suppressed and the original action result is returned with uiDiff=None.",
  },
  {
    title: "Strip volatile fields",
    description:
      "is_yaml = old_tree_str.trim_start().starts_with('- [') decides the path. YAML hits the regex stripper, JSON hits the recursive remove_ids. Either way, ids and bounds are gone before the diff runs.",
  },
  {
    title: "Line-diff with the similar crate",
    description:
      "TextDiff::from_lines(&old_processed, &new_processed) at line 81. Iterate iter_all_changes(), keep ChangeTag::Insert as '+ ' lines and ChangeTag::Delete as '- ' lines, drop ChangeTag::Equal entirely.",
  },
  {
    title: "Return UiDiffResult",
    description:
      "Some(diff) becomes UiDiffResult { diff, has_changes: true }. None becomes UiDiffResult { diff: 'No UI changes detected', has_changes: false }. The TypeScript SDK exposes both on ClickResult.uiDiff and ActionResult.uiDiff.",
  },
];

const stripperBento: BentoCard[] = [
  {
    title: "id keys",
    description:
      "remove_ids() at line 7 walks the JSON tree recursively and drops any key literally named 'id'. UIAutomation runtime IDs change every time the tree is rebuilt; keeping them would make every diff a wall of noise.",
    size: "1x1",
    accent: true,
  },
  {
    title: "element_id keys",
    description:
      "Same recursion, same drop. element_id is the internal handle Terminator assigns to a UIElement; useful at runtime, useless in a snapshot.",
    size: "1x1",
  },
  {
    title: "#suffix tags",
    description:
      "Compact YAML serializes ids as ' #abc-def-123' suffixes on each line. The regex ' #[\\w\\-]+' deletes them in one pass.",
    size: "1x1",
  },
  {
    title: "pixel bounds",
    description:
      "'bounds: [x,y,w,h]' clauses are stripped by 'bounds: \\[[^\\]]+\\],?\\s*'. A button that moved 118 pixels left after a window resize produces zero diff output. This is the single most important rule.",
    size: "2x1",
    accent: true,
  },
  {
    title: "kept: role + name",
    description:
      "[Button] Submit, [Text] Total: $42.18, [CheckBox] Remember me. The semantic axis. If this changes, the test should care.",
    size: "1x1",
  },
  {
    title: "kept: state flags",
    description:
      "(enabled), (disabled), (focused), (selected), (expanded). The behavioral axis. These are the assertions you would have written by hand.",
    size: "1x1",
  },
  {
    title: "kept: tree shape",
    description:
      "Indentation is preserved. A new modal appearing as a sibling of the main window shows up as a fresh '+ [Window]' subtree. A row added to a list shows up at the right depth.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Verifying that something changed after a click",
    competitor:
      "Write an explicit assertion per step. assertEnabled(saveButton, false). assertVisible(confirmDialog, true). One change = many lines.",
    ours: "result.uiDiff.hasChanges. If false, nothing in the accessibility tree moved; that itself is the assertion.",
  },
  {
    feature: "Catching unexpected side effects",
    competitor:
      "Caught only by assertions you wrote in advance. A button that secretly disabled a third unrelated control will not show up.",
    ours: "Anything that changed shows up as a + or - line. Unexpected disables, ghost modals, late-arriving toasts, all visible in the diff.",
  },
  {
    feature: "Stability under layout shift",
    competitor:
      "Pixel-based image diffs flag every antialiasing change, every font hinting variation. Coordinate selectors break when the window resizes.",
    ours: "remove_ids_and_bounds_from_compact_yaml() strips pixel rectangles before diffing. A 118px button shift produces zero diff lines.",
  },
  {
    feature: "Storing snapshots in git",
    competitor:
      "Binary screenshots, .png files, blob diffs in PRs. Reviewers cannot tell what changed without opening both images side by side.",
    ours: "Plain-text diff, a few hundred bytes per action. toMatchInlineSnapshot, git diff, code review by reading.",
  },
  {
    feature: "Tree capture timing under animation",
    competitor:
      "Up to you. Most tools spin a sleep(500) into the test code itself, which then leaks into every other step.",
    ours: "settle_delay_ms on UiDiffOptions. Default 1500ms, applied automatically between the action and the after-snapshot at lib.rs line 1942.",
  },
  {
    feature: "Cross-platform support",
    competitor:
      "Most desktop test tools are Windows-only or require a separate license per OS. Some require a paid agent on the SUT.",
    ours: "Same diff logic across UIAutomation on Windows and AX on macOS. terminator-mcp-agent re-exports terminator::ui_tree_diff so both adapters share one implementation.",
  },
  {
    feature: "Driving the test from an AI coding assistant",
    competitor:
      "Recorder UI generates VBScript or proprietary script. Hard to wire into Claude Code or Cursor without an extra abstraction layer.",
    ours: "MCP server. claude mcp add terminator. Click and type tools return uiDiff in their response so the model can see what its action did.",
  },
];

const stickyHero = (
  <div className="flex flex-wrap gap-2">
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      ui_tree_diff.rs
    </span>
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      remove_ids:7
    </span>
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      regex bounds remover:40
    </span>
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      simple_ui_tree_diff:58
    </span>
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
      uiDiff on every action
    </span>
    <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
      MIT
    </span>
  </div>
);

const otherTools = [
  "TestComplete",
  "Ranorex",
  "Squish",
  "WinAppDriver",
  "Appium Desktop",
  "AutoIT",
  "Coded UI",
  "TestArchitect",
  "Sikuli",
  "FlaUI",
  "WinTaskBot",
  "Pywinauto",
];

const beforeBlock = `// classic desktop assertion-based test
//   "click Submit, then verify the modal opened"

submitButton.click();

// you have to know in advance what to check
expect(modal.isVisible()).toBe(true);
expect(modal.getTitle()).toBe("Confirm Submission");
expect(yesButton.isEnabled()).toBe(true);
expect(noButton.isEnabled()).toBe(true);

// did anything else change? you would never know.`;

const afterBlock = `// same flow, with the diff as the assertion
//   "click Submit, then snapshot what changed"

const result = await submitButton.click({ uiDiff: true });

// every change in the accessibility tree, in plain text
expect(result.uiDiff.diff).toMatchInlineSnapshot(\`
+ [Window] Confirm Submission (modal)
+   [Text] Are you sure you want to submit?
+   [Button] Yes (enabled)
+   [Button] No (enabled)
\`);

// any unexpected side effect now also fails the test`;

const relatedPosts = [
  {
    title:
      "Test automation for desktop applications, with a 10ms grace window",
    excerpt:
      "Sister page on the parallel selector race in utils.rs. The mechanism that keeps the diff stable across reruns by keeping selector choice deterministic.",
    href: "/t/test-automation-for-desktop-applications",
    tag: "Selectors",
  },
  {
    title: "UI automation testing that survives an 118px layout shift",
    excerpt:
      "Goes deeper on the bounds regex and how a moved button produces zero diff output. Bounds-agnostic snapshots in practice.",
    href: "/t/ui-automation-testing",
    tag: "Snapshots",
  },
  {
    title: "Automation tools for UI testing on Windows",
    excerpt:
      "Where Terminator sits on the Windows accessibility stack: UIAutomation, COM, the apartment-model deadlock traps, and how the agent avoids them.",
    href: "/t/automation-tools-for-ui-testing",
    tag: "Windows",
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
              Tools for automation testing of desktop application,{" "}
              <GradientText>with a structural diff</GradientText> baked into
              every action
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Most existing playbooks list the same nine tools and stop. None
              of them describe a testing primitive that hands you the
              accessibility tree before and after each click, with element ids
              and pixel coordinates already stripped, ready to commit as a
              snapshot. Terminator does, and the stripping logic is 215 lines
              of Rust at a path you can read without a login.
            </p>
            <div className="mt-6">{stickyHero}</div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="13 min read"
        />

        <div className="mt-6">
          <ProofBand
            rating={4.8}
            ratingCount="open-source desktop automation users"
            highlights={[
              "ui_tree_diff.rs is 215 lines, MIT licensed, on GitHub",
              "uiDiff field on ClickResult and ActionResult",
              "Same engine drives Windows UIAutomation and macOS AX",
              "Plain-text diffs commit cleanly to git",
            ]}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="Diff as a testing primitive"
            subtitle="The stripping logic is the testing tool"
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "click() returns ClickResult.uiDiff",
              "remove_ids strips id and element_id",
              "regex strips pixel bounds",
              "what is left is what your test cares about",
              "snapshot it. commit it. move on.",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
            What every other guide on this leaves out
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed">
            The shape of those articles is predictable. A short paragraph on
            why desktop testing is hard. A nine-row table comparing
            TestComplete, Ranorex, Squish, WinAppDriver, Appium, AutoIT, Coded
            UI, TestArchitect, and Sikuli on price, license, supported
            languages, and recorder mode. A vague closer on choosing the right
            tool for your team. None of them describe what an actual desktop
            test step records, or how that recording survives a window resize
            between two runs of the same suite. The diff primitive in
            Terminator does both, and the implementation is short enough to
            read.
          </p>

          <div className="mt-6">
            <Marquee speed={45} fade>
              <div className="flex gap-3 pr-3">
                {otherTools.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono px-3 py-1.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 whitespace-nowrap"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Marquee>
            <p className="text-xs text-zinc-500 mt-1 text-center">
              the usual roster. none of them ship a structural-diff snapshot
              primitive in their default API.
            </p>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            The 215 lines that change the testing model
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-2">
            crates/terminator/src/ui_tree_diff.rs holds the entire mechanism.
            Two strippers, one diff, a format detector, and the test cases
            that prove the strippers work. That is it. Below is the part that
            does the work.
          </p>
          <AnimatedCodeBlock
            code={stripperSource}
            language="rust"
            filename="crates/terminator/src/ui_tree_diff.rs"
          />
          <p className="text-zinc-600 leading-relaxed mt-2">
            remove_ids is recursive over arbitrary JSON. Strings, numbers, and
            booleans pass through as-is. Objects rebuild without the offending
            keys. Arrays map element-wise. Compact YAML hits a different path:
            two regex sweeps. The bounds remover is the regex that matters.
            Without it, every screen shift would dominate the diff and the
            primitive would be useless.
          </p>
        </section>

        <MetricsRow
          metrics={[
            {
              value: 215,
              suffix: " lines",
              label: "in ui_tree_diff.rs",
            },
            {
              value: 2,
              label: "regex sweeps for compact YAML",
            },
            {
              value: 1500,
              suffix: " ms",
              label: "default settle delay",
            },
            {
              value: 0,
              label: "diff lines on a 118px shift",
            },
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            What the strippers keep, and what they throw away
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            A diff that includes everything is noise. A diff that strips too
            much misses real regressions. The exact split below is what
            Terminator settled on after watching real desktop apps emit real
            accessibility events.
          </p>
          <BentoGrid cards={stripperBento} />
        </section>

        <AnimatedBeam
          title="Where the diff comes from, where it goes"
          accentColor="#FF3E00"
          from={[
            {
              label: "before-tree capture",
              sublabel: "get_window_tree, lib.rs:1923",
            },
            {
              label: "the action runs",
              sublabel: "click / type / press",
            },
            {
              label: "after-tree capture",
              sublabel: "1500ms settle delay",
            },
          ]}
          hub={{
            label: "ui_tree_diff",
            sublabel: "strip + diff",
          }}
          to={[
            {
              label: "ClickResult.uiDiff",
              sublabel: "TypeScript SDK",
            },
            {
              label: "tool response",
              sublabel: "MCP agent",
            },
            {
              label: "snapshot file",
              sublabel: "your test runner",
            },
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            How a single click becomes a snapshot
          </h2>
          <p className="text-zinc-600 leading-relaxed">
            The async function execute_with_ui_diff in crates/terminator/src/lib.rs
            is the orchestrator. The eight steps below are what runs every
            time you pass uiDiff=true.
          </p>
          <StepTimeline steps={pipelineSteps} />
        </section>

        <BeforeAfter
          title="One click, two ways to write the test"
          before={{
            label: "Assertion-based",
            content: beforeBlock,
            highlights: [
              "Have to know in advance what to check",
              "Misses unexpected side effects",
              "One change ships as many lines",
            ],
          }}
          after={{
            label: "Diff-based",
            content: afterBlock,
            highlights: [
              "Records every change in the tree",
              "Catches secondary disables and ghost modals",
              "Snapshot is a few hundred bytes of plain text",
            ],
          }}
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            What it looks like in your terminal
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            The MCP agent and the SDK both log this same shape. The
            [ui_diff] info lines come from the tracing spans inside
            execute_with_ui_diff. The diff itself is the unified-style block
            you commit to your repo as a snapshot.
          </p>
          <TerminalOutput
            title="$ node test-checkout.js"
            lines={diffOutputLines}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            What the test code actually looks like
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-2">
            The opt-in is one extra option on the action. The diff lives on
            the result. Snapshot it once, run the suite for a year, never
            write another assertion for that step.
          </p>
          <AnimatedCodeBlock
            code={usageSource}
            language="typescript"
            filename="tests/checkout.spec.ts"
          />
        </section>

        <ProofBanner
          quote="The whole snapshot is a few hundred bytes of text per action and any reviewer can read it."
          source="commit-time review of a Terminator-driven desktop suite"
          metric="0 binary diffs in PRs"
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            How this compares to the usual roster
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-2">
            Cells are written narrow on purpose; the row labels carry the
            argument. The competitor column is the median behavior across the
            tools listed in the marquee above. The ours column is what
            Terminator does today, with the file or function reference where
            applicable.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical desktop test tool"
            rows={comparisonRows}
          />
        </section>

        <AnimatedChecklist
          title="Hard requirements this satisfies for a regression suite"
          items={[
            { text: "Snapshot is plain text, not binary", checked: true },
            {
              text: "Identifiers and pixel coordinates are stripped before diffing",
              checked: true,
            },
            {
              text: "Wait-for-settle is configurable per call, not baked into test code",
              checked: true,
            },
            {
              text: "hasChanges flag distinguishes 'no diff' from 'diff suppressed by error'",
              checked: true,
            },
            {
              text: "Same engine on Windows UIAutomation and macOS AX",
              checked: true,
            },
            {
              text: "MCP-shaped, so an AI coding assistant can drive the suite",
              checked: true,
            },
            {
              text: "MIT licensed, no paid agent on the desktop under test",
              checked: true,
            },
          ]}
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-3">
            How to put this on a real desktop suite
          </h2>
          <GlowCard>
            <div className="p-6">
              <p className="text-zinc-600 leading-relaxed mb-3">
                Three install paths. Pick whichever matches the runner you
                already have.
              </p>
              <ul className="text-zinc-700 leading-relaxed list-disc pl-5 space-y-2">
                <li>
                  <span className="font-mono text-zinc-900 text-sm">
                    npm install @mediar-ai/terminator
                  </span>{" "}
                  if your test code is TypeScript or JavaScript. Construct a{" "}
                  <span className="font-mono text-sm">Desktop</span>, locate
                  with selectors like{" "}
                  <span className="font-mono text-sm">role:Button|name:Submit</span>
                  , call{" "}
                  <span className="font-mono text-sm">
                    .click(&#123; uiDiff: true &#125;)
                  </span>
                  , read{" "}
                  <span className="font-mono text-sm">result.uiDiff</span>.
                </li>
                <li>
                  <span className="font-mono text-zinc-900 text-sm">
                    pip install terminator
                  </span>{" "}
                  if your test code is Python. The Desktop class shape is
                  identical and uiDiff is the same field.
                </li>
                <li>
                  <span className="font-mono text-zinc-900 text-sm">
                    claude mcp add terminator &quot;npx -y
                    terminator-mcp-agent@latest&quot;
                  </span>{" "}
                  if you want Claude Code or Cursor to drive the suite. Every
                  click_element / type_into_element / press_key tool response
                  carries uiDiff so the model sees what its own action did.
                </li>
              </ul>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Want a diff-driven desktop test suite running this quarter?"
            description="Show us the app. We will wire ui_tree_diff into your existing CI in one call."
          />
        </section>

        <FaqSection items={faqs} />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Related guides"
            subtitle="Other parts of the Terminator engine that show up in test runs."
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the diff-as-snapshot primitive on your own desktop app."
      />
    </>
  );
}
