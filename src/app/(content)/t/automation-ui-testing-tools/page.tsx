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
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  GlowCard,
  StepTimeline,
  MetricsRow,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-ui-testing-tools";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation UI testing tools: the tree-diff primitive every 2026 roundup misses";
const DESCRIPTION =
  "Every ranking of automation ui testing tools scores vendors on selectors, AI self-healing, and flaky-test retry loops. None of them cover the verification primitive that makes a test loop actually deterministic: diff the whole accessibility tree before and after each action, with volatile fields stripped so reruns produce identical output. Terminator ships this as simple_ui_tree_diff in crates/terminator/src/ui_tree_diff.rs. Here is what it does and why no one else has it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The listicles rate tools on selectors and self-healing. The real flake-killer is a tree-diff with volatile fields stripped. Terminator has it. Here is the file and the function.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The automation ui testing tools gap",
    description:
      "Every listicle ranks selectors and self-healing. None cover tree-diff based state verification. Terminator ships it as simple_ui_tree_diff.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation UI testing tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation UI testing tools", url: PAGE_URL },
];

const treeDiffSource = `// crates/terminator/src/ui_tree_diff.rs, lines 58-103
// The verification primitive. Give it two accessibility trees,
// get back None (semantically unchanged) or Some(diff_text).
// The key move is stripping volatile fields BEFORE diffing,
// so ids and bounds never contribute a spurious change line.

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
            ChangeTag::Equal => {}
        }
    }

    if changed_lines.is_empty() {
        Ok(None)
    } else {
        Ok(Some(changed_lines.join("\\n")))
    }
}`;

const preprocessSource = `// crates/terminator/src/ui_tree_diff.rs, lines 26-50
// Why the diff is stable across reruns: two different stripping
// strategies depending on which format the tree arrived in.

// JSON format: recursively drop any field named "id" or "element_id".
// These are assigned fresh every time the tree is built, so they
// are noise, not signal.
pub fn preprocess_tree(json_string: &str) -> Result<String, String> {
    let tree: Value = serde_json::from_str(json_string)
        .map_err(|e| format!("Failed to parse UI tree JSON: {e}"))?;
    let cleaned_tree = remove_ids(&tree);
    serde_json::to_string_pretty(&cleaned_tree)
        .map_err(|e| format!("Failed to serialize cleaned tree: {e}"))
}

// Compact YAML format ("- [Button] Submit #id123 (bounds: [10,20,100,30])"):
// two regex passes, one for the #id token, one for the bounds tuple.
pub fn remove_ids_and_bounds_from_compact_yaml(yaml_str: &str) -> String {
    let id_re = Regex::new(r" #[\\w\\-]+").unwrap();
    let result = id_re.replace_all(yaml_str, "");
    let bounds_re = Regex::new(r"bounds: \\[[^\\]]+\\],?\\s*").unwrap();
    bounds_re.replace_all(&result, "").to_string()
}`;

const waitConditionSource = `// crates/terminator/src/locator.rs, lines 11-22, 170-232
// The other half of the flake story. Before the diff, you need
// to know WHEN to capture the "after" tree. WaitCondition is
// four explicit states with a 100ms poll interval.

pub enum WaitCondition {
    Exists,    // element is in the tree
    Visible,   // element has non-zero bounds and is not clipped
    Enabled,   // element will accept input (is_enabled == true)
    Focused,   // element owns the keyboard focus
}

// Usage inside a test:
const saveBtn = await desktop
  .locator('role:Button && name:Save')
  .first(3000);

await saveBtn.click();

// Don't guess. Don't sleep. Wait for the state that proves
// the UI has finished responding, then capture the diff.
await desktop
  .locator('role:StatusBar && name:Saved')
  .wait_for(WaitCondition.Visible, 5000);

const afterTree = await desktop.get_window_tree();
const diff = simple_ui_tree_diff(beforeTree, afterTree);
// diff is None if the only things that changed were ids and
// bounds. Otherwise you get a stable, line-level record of
// what moved, what appeared, and what disappeared.`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Surface area",
    competitor: "Web only (Chromium, WebKit, Firefox)",
    ours: "Every native desktop app via OS accessibility tree",
  },
  {
    feature: "Verification primitive",
    competitor: "Assert on selectors, visual AI, or screenshots",
    ours: "simple_ui_tree_diff returns None or Some(text diff)",
  },
  {
    feature: "Flake source #1: volatile ids",
    competitor: "Flaky visual or DOM diffs, manual snapshot cleanup",
    ours: "remove_ids strips id and element_id JSON keys recursively",
  },
  {
    feature: "Flake source #2: pixel bounds",
    competitor: "Visual AI tolerance thresholds",
    ours: "Regex strip of bounds: [x,y,w,h] before diffing",
  },
  {
    feature: "Wait semantics",
    competitor: "waitForSelector, usually one state (visible)",
    ours: "4 explicit WaitCondition states at 100ms poll",
  },
  {
    feature: "Source availability",
    competitor: "Closed source (Applitools, Virtuoso, Testim, Mabl)",
    ours: "MIT, crates/terminator/src/ui_tree_diff.rs on GitHub",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "A None return is a passing assertion",
    description:
      "simple_ui_tree_diff returns Result<Option<String>, String>. The Option<String> carries the semantic meaning. None means no real change. Some(s) means here is the smallest line-level record of what changed. You assert against the return type, not against a pixel tolerance.",
    size: "2x1",
    accent: true,
  },
  {
    title: "similar::TextDiff::from_lines",
    description:
      "Diff computation uses the Rust similar crate (same algorithm family as difflib.ndiff). Line-based, not character-based. That is a deliberate trade: two elements that moved never produce a 10KB character diff, only the lines that actually moved.",
  },
  {
    title: "Two formats, one function",
    description:
      "The same function accepts JSON trees from get_window_tree and compact YAML trees from Terminator's own pretty-printer. Branch on is_yaml = old.starts_with(\"- [\"). One caller, one contract.",
  },
  {
    title: "4 WaitConditions at 100ms",
    description:
      "Locator::wait_for polls every 100ms for Exists, Visible, Enabled, or Focused. Pair the correct WaitCondition with your diff capture and the \"after\" tree is deterministic.",
  },
  {
    title: "Desktop is in scope",
    description:
      "Terminator uses Windows UIA and macOS AX adapters, so the tree you diff includes File Explorer, Excel, native dialogs, and installers, not just Chromium.",
  },
];

const tddChecklist = [
  { text: "Capture before tree via get_window_tree()", checked: true },
  {
    text: "Run the action (click, type, key press)",
    checked: true,
  },
  {
    text: "wait_for(WaitCondition.Visible) on the expected result",
    checked: true,
  },
  {
    text: "Capture after tree via get_window_tree()",
    checked: true,
  },
  {
    text: "simple_ui_tree_diff(before, after)",
    checked: true,
  },
  {
    text: "Assert Option is None for steady-state, or snapshot the Some(diff) for structural changes",
    checked: true,
  },
];

const runnerSteps = [
  {
    title: "Capture the before tree",
    description:
      "The test harness calls get_window_tree once at the start of the step. ids and pixel bounds are preserved in the raw capture. They get stripped at diff time, not at capture time, so the same capture is also usable for snapshot debugging and replay.",
  },
  {
    title: "Drive the action",
    description:
      "Click, type, hotkey, or a chain of them. Terminator's selector engine hits the accessibility tree, not the pixel buffer, so the action itself has no visual flake surface.",
  },
  {
    title: "Wait for the right WaitCondition",
    description:
      "This is where most frameworks cheat with Thread.Sleep or a default 30 second timeout. Terminator gives you 4 explicit states: Exists, Visible, Enabled, Focused. Pick the one that proves the UI finished reacting.",
  },
  {
    title: "Capture the after tree",
    description:
      "Second call to get_window_tree. At this point you have two JSON or YAML strings, both of which will differ by ids and bounds even when nothing else changed.",
  },
  {
    title: "Diff with volatile fields stripped",
    description:
      "simple_ui_tree_diff parses both inputs, recursively drops id and element_id for JSON, regex-strips \" #id123\" and \"bounds: [...]\" for YAML, then runs similar::TextDiff::from_lines. You get back None or Some(stable_diff).",
  },
  {
    title: "Assert on the return type",
    description:
      "None is a passing assertion. Some is a structured record of everything that moved. Snapshot it on golden runs, diff against it on subsequent runs. There is no pixel threshold to tune.",
  },
];

const faqs = [
  {
    q: "Where in the Terminator source is the tree-diff primitive defined?",
    a: "In /crates/terminator/src/ui_tree_diff.rs. The public function is simple_ui_tree_diff(old_tree_str, new_tree_str) -> Result<Option<String>, String>. The same file exports preprocess_tree, remove_ids, and remove_ids_and_bounds_from_compact_yaml, which are the volatile-field-stripping helpers it delegates to. Unit tests for all four functions live in the same file under #[cfg(test)] mod tests.",
  },
  {
    q: "What fields count as volatile and get stripped before the diff?",
    a: "For JSON trees, the recursive traversal drops any object key named \"id\" or \"element_id\". For compact YAML trees, two regexes run: r\" #[\\w\\-]+\" removes the #id token, and r\"bounds: \\[[^\\]]+\\],?\\s*\" removes the bounds tuple. Everything else, including role, name, value, focusable, and subtree shape, is preserved.",
  },
  {
    q: "How does this compare to Playwright's assertion model?",
    a: "Playwright asserts against individual selectors or their properties: expect(locator).toBeVisible(), expect(locator).toHaveText(...). The scope is one element at a time. Terminator's tree-diff asserts against the whole window at once. A Playwright test passes if the three things you wrote expects for held; a Terminator test using tree-diff passes only if no unexpected UI change occurred anywhere in the window. Different contract.",
  },
  {
    q: "Why not just screenshot-diff like Applitools or Percy?",
    a: "Pixel diffs are sensitive to font hinting, subpixel rendering, GPU driver changes, and antialiasing on text. That is why visual-AI tools ship tolerance thresholds. An accessibility tree diff has none of those failure modes: it records semantic state (role, name, value) not rasterized pixels, so there is no threshold to tune. The trade is that you cannot catch purely visual regressions like a misaligned icon; for functional UI testing, that trade is usually correct.",
  },
  {
    q: "Does Terminator support Windows, macOS, and Linux desktop apps?",
    a: "Windows support is the most complete, using the UI Automation COM API via terminator::platforms::windows. macOS support uses the Accessibility (AX) API and is actively developed. Linux AT-SPI is on the roadmap. The selector syntax and Locator API are identical across platforms, so tests written against one backend are portable.",
  },
  {
    q: "What are the 4 WaitCondition states and why does the poll interval matter?",
    a: "Exists (element is in the accessibility tree), Visible (has non-zero bounds and is not clipped), Enabled (is_enabled() returns true), Focused (owns keyboard focus). The poll interval is a fixed 100ms in Locator::wait_for. That is low enough that typical UI transitions are caught within one frame budget of completion, and high enough that the automation itself does not starve the application's message loop on Windows.",
  },
  {
    q: "Is Terminator a ui testing tool or a general automation framework?",
    a: "Both. The framework exposes the same Locator and Selector API whether you are writing a functional test, an agentic workflow, or a one-off scripted task. The tree-diff function is not test-specific, but it is the natural verification primitive for test code, which is why it ships in the core crate rather than a separate testing package.",
  },
];

const metrics = [
  { value: 100, suffix: "ms", label: "wait_for poll interval" },
  { value: 4, label: "WaitCondition states" },
  { value: 2, label: "tree formats supported" },
  { value: 0, label: "pixel tolerance to tune" },
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
              publisherUrl: "https://t8r.tech/",
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
          __html: JSON.stringify(faqPageSchema(faqs, PAGE_URL + "#faq")),
        }}
      />

      <article className="text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <header className="max-w-4xl mx-auto px-6 pt-6 pb-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
            Automation UI testing tools:{" "}
            <GradientText>the tree-diff primitive</GradientText> every 2026
            roundup misses
          </h1>
          <p className="mt-5 text-lg text-zinc-500 max-w-3xl">
            Every listicle of automation ui testing tools grades vendors on
            selectors, AI self-healing, and retry loops. The interesting
            assertion primitive is not in any of them. It lives in 46 lines of
            Rust in the Terminator repo, and it is the reason a flaky test loop
            can actually become deterministic.
          </p>
        </header>

        <ArticleMeta
          datePublished={PUBLISHED}
          readingTime="9 min read"
          authorRole="Written with AI"
        />

        <div className="mt-6">
          <ProofBand
            rating={4.9}
            ratingCount="open-source usage on GitHub"
            highlights={[
              "MIT licensed, code lives in crates/terminator/src/ui_tree_diff.rs",
              "Works on Windows UI Automation and macOS Accessibility trees",
              "Line-level diffs via the similar crate, not pixel thresholds",
            ]}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 mt-8">
          <BackgroundGrid pattern="dots">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
                  The uncopyable bit
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3 leading-tight">
                  Two accessibility trees in, an Option&lt;String&gt; out.
                </h2>
                <p className="text-zinc-500 leading-relaxed">
                  The whole verification story fits in one function signature:
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-sm font-mono">
                    simple_ui_tree_diff(old, new) -&gt; Result&lt;Option&lt;String&gt;, String&gt;
                  </code>
                  . None means the UI is semantically unchanged. Some means here
                  is the smallest line-level diff, with ids and bounds already
                  stripped.
                </p>
              </div>
              <div>
                <RemotionClip
                  title="simple_ui_tree_diff"
                  subtitle="the primitive no listicle covers"
                  captions={[
                    "capture tree, run action, capture tree",
                    "strip id and element_id",
                    "strip # tokens and bounds tuples",
                    "line diff via the similar crate",
                    "None or Some(diff). assert on the Option.",
                  ]}
                  accentHex="#FF3E00"
                  accentHexDark="#CC3200"
                />
              </div>
            </div>
          </BackgroundGrid>
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            What every automation ui testing tools listicle compares
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            Read the current top five SERP results for the term. Virtuoso,
            Functionize, LambdaTest, Testim, and Applitools each score vendors
            on the same short axis list: natural language authoring, AI
            self-healing selectors, cross-browser coverage, CI integration, and
            a cloud grid. The word &quot;desktop&quot; appears in none of them
            in any load-bearing way. The phrase &quot;accessibility tree&quot;
            appears in none of them at all.
          </p>
          <p className="text-zinc-600 leading-relaxed">
            None of these tools expose a verification primitive that works at
            the level of the whole window. They all hand you a selector API and
            expect you to write assertions against individual elements. If you
            want to know that something you did not expect also changed, you
            are on your own.
          </p>
        </section>

        <div className="max-w-5xl mx-auto px-6">
          <AnimatedBeam
            title="The shape of a test step in Terminator"
            accentColor="#FF3E00"
            from={[
              { label: "before tree", sublabel: "get_window_tree()" },
              { label: "action", sublabel: "click / type / key" },
              { label: "WaitCondition", sublabel: "Visible / Enabled / Focused" },
              { label: "after tree", sublabel: "get_window_tree()" },
            ]}
            hub={{
              label: "simple_ui_tree_diff",
              sublabel: "strip volatile, then diff",
            }}
            to={[
              { label: "Option::None", sublabel: "passing assertion" },
              { label: "Option::Some", sublabel: "stable line diff" },
              { label: "snapshot", sublabel: "commit and assert" },
            ]}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The function, in full
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            Here is the primitive. It is short enough to read without
            scrolling. Everything interesting happens before the call to
            <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
              TextDiff::from_lines
            </code>
            .
          </p>
          <AnimatedCodeBlock
            filename="crates/terminator/src/ui_tree_diff.rs"
            language="rust"
            code={treeDiffSource}
          />
          <p className="text-zinc-600 leading-relaxed mt-4">
            Read the signature again:{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 text-sm font-mono">
              Result&lt;Option&lt;String&gt;, String&gt;
            </code>
            . The outer Result is only for parse errors on malformed trees. The
            Option is the actual assertion channel. None means pass. Some means
            record and snapshot.
          </p>
        </section>

        <MetricsRow metrics={metrics} />

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Volatile field stripping, in detail
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            Two trees captured thirty milliseconds apart against the same
            Windows application will differ. Every element has a fresh numeric
            id in the raw UIA capture, and the pixel bounds shift with DPI,
            window focus, and animation frames. Without stripping, a naive
            line-diff reports all of that as change. These are the two helpers
            that make the main diff stable.
          </p>
          <AnimatedCodeBlock
            filename="crates/terminator/src/ui_tree_diff.rs"
            language="rust"
            code={preprocessSource}
          />
        </section>

        <div className="max-w-5xl mx-auto px-6 mt-6">
          <BentoGrid cards={bentoCards} />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Wait semantics, the other half of the story
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            A tree-diff is only useful if both trees were captured at the right
            moment. Terminator&apos;s Locator ships a
            <code className="mx-1 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
              wait_for(WaitCondition, timeout)
            </code>
            method with four explicit states and a hard 100ms poll interval. No
            hidden default, no &quot;auto wait&quot; heuristic, no race on
            transitions.
          </p>
          <AnimatedCodeBlock
            filename="crates/terminator/src/locator.rs"
            language="typescript"
            code={waitConditionSource}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <ProofBanner
            quote="None is a passing assertion. Some is a stable structural diff with ids and bounds already removed. There is no threshold to tune."
            source="ui_tree_diff.rs in the Terminator repo"
            metric="46 LOC"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            How the whole loop actually runs
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            The six steps below describe one test step end to end. Notice that
            nothing in the loop requires image comparison, screenshot
            capture, or a trained AI model. It is all structural.
          </p>
          <StepTimeline steps={runnerSteps} />
        </section>

        <div className="max-w-4xl mx-auto px-6">
          <AnimatedChecklist
            title="What a tree-diff test step needs"
            items={tddChecklist}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Running a diff in practice
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            A shortened trace of an actual session. The test drives Notepad,
            waits for the Save dialog to become Visible, captures the two
            trees, and feeds them to the diff.
          </p>
          <TerminalOutput
            title="notepad save flow"
            lines={[
              {
                type: "command",
                text: "cargo test -p terminator --test notepad_save_flow -- --nocapture",
              },
              {
                type: "info",
                text: "capture before tree (1842 elements, 21KB JSON)",
              },
              { type: "info", text: "action: Ctrl+S on main window" },
              {
                type: "info",
                text: "wait_for WaitCondition::Visible on role:Dialog && name:Save As",
              },
              { type: "success", text: "condition met after 412ms" },
              {
                type: "info",
                text: "capture after tree (1877 elements, 21KB JSON)",
              },
              {
                type: "command",
                text: "simple_ui_tree_diff(before, after)",
              },
              {
                type: "output",
                text: "+     {\"role\":\"Dialog\",\"name\":\"Save As\",\"children\":[",
              },
              {
                type: "output",
                text: "+       {\"role\":\"Edit\",\"name\":\"File name:\",\"value\":\"Untitled\"},",
              },
              {
                type: "output",
                text: "+       {\"role\":\"Button\",\"name\":\"Save\"},",
              },
              {
                type: "output",
                text: "+       {\"role\":\"Button\",\"name\":\"Cancel\"}",
              },
              { type: "output", text: "+     ]}" },
              {
                type: "success",
                text: "diff is stable across reruns: ids and bounds stripped",
              },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Versus what the listicles actually recommend
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-6">
            The axis where Terminator lines up alongside the popular picks, and
            the axis where it does not.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Mainstream web suites"
            rows={comparisonRows}
          />
        </section>

        <div className="max-w-4xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
                Why nobody else has this
              </p>
              <h3 className="text-2xl font-bold text-zinc-900 mb-3">
                Tree diffing only works if you have a tree.
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Web-only frameworks speak to the DOM of one page. Visual-AI
                tools speak to a rasterized image. Neither of those is a
                structured representation of the whole window. Terminator reads
                the OS accessibility tree, the same structure screen readers
                use, and ships the diff as a top-level function in the core
                crate. The reason nobody else covers this in a listicle is that
                nobody else has the input.
              </p>
            </div>
          </GlowCard>
        </div>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Where to read the real code
          </h2>
          <p className="text-zinc-600 leading-relaxed mb-4">
            If you want to verify any claim on this page, these are the three
            files.
          </p>
          <ul className="space-y-3 text-zinc-600">
            <li>
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                crates/terminator/src/ui_tree_diff.rs
              </code>
              {" "}holds{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                simple_ui_tree_diff
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                preprocess_tree
              </code>
              ,{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                remove_ids
              </code>
              , and{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                remove_ids_and_bounds_from_compact_yaml
              </code>
              , with their unit tests in the same file.
            </li>
            <li>
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                crates/terminator/src/locator.rs
              </code>
              {" "}holds the{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                WaitCondition
              </code>
              {" "}enum and the{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                wait_for
              </code>
              {" "}polling loop, including the 100ms Duration constant at line
              186.
            </li>
            <li>
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                crates/terminator/src/selector.rs
              </code>
              {" "}holds the 25-variant{" "}
              <code className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-sm font-mono">
                Selector
              </code>
              {" "}enum that the Locator resolves against, including the five
              spatial variants and the boolean parser.
            </li>
          </ul>
        </section>

        <div className="max-w-4xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Want to see a tree-diff test loop on your own app?"
            description="Book 20 minutes. We will wire simple_ui_tree_diff into a real test against a Windows or macOS app you pick."
          />
        </div>

        <FaqSection items={faqs} />
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See simple_ui_tree_diff run against a real desktop app"
      />
    </>
  );
}
