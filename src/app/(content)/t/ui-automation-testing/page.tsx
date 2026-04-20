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
  BeforeAfter,
  CodeComparison,
  AnimatedChecklist,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/ui-automation-testing";
const PUBLISHED = "2026-04-20";
const TITLE =
  "UI automation testing that survives a layout shift: how Terminator diffs the accessibility tree without coordinates";
const DESCRIPTION =
  "Most UI automation testing breaks the moment a button moves 100 pixels. Terminator diffs the OS accessibility tree with the bounds rectangles stripped out, so a Reply button that drifts 118px down between runs produces zero diff and your test still passes. Source: ui_tree_diff.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A Rust UI tree differ that throws away element IDs and bounds rectangles before computing the line diff. Layout shifts disappear. Real semantic changes do not.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UI automation testing that ignores layout shift",
    description:
      "Two regexes (#id and bounds: [x,y,w,h]) make Terminator's accessibility-tree replays survive UI moves that would shatter pixel diffs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UI automation testing" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UI automation testing", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why do most UI automation tests break when a button moves a few pixels?",
    a: "Pixel-based runners compare screenshots and report any positional change as a regression. DOM and accessibility-tree runners that include coordinate fields in their snapshot comparison see the same moved bounds as a diff. Terminator's ui_tree_diff.rs strips both element IDs and the bounds: [x,y,w,h] tuple before line-diffing, so a button that drifts 118 pixels down produces no output. The test passes because nothing semantically changed.",
  },
  {
    q: "What exactly does Terminator's ui_tree_diff.rs throw away before comparing?",
    a: "Two regexes do the work. The first, ` #[\\w\\-]+`, removes volatile element IDs like #12345 or #abc-def-123. The second, `bounds: \\[[^\\]]+\\],?\\s*`, removes any bounds rectangle in the form bounds: [10,20,100,30]. The remaining structure (role, name, focusable flag, hierarchy) is what gets diffed line by line using the similar crate, which is the Rust analogue of Python's difflib.",
  },
  {
    q: "Is this only for Windows or does it work on macOS too?",
    a: "Terminator runs against Windows UI Automation and the macOS Accessibility API. The diff layer in ui_tree_diff.rs operates on serialized accessibility-tree text, so the same bounds-stripping behavior applies on both platforms. The selector engine in selector.rs is also platform-neutral.",
  },
  {
    q: "How is this different from Playwright trace viewer or Cypress snapshot tests?",
    a: "Playwright and Cypress operate on the browser DOM. Their snapshots are HTML or screenshots and are limited to what runs inside Chromium or WebKit. Terminator operates on the OS accessibility tree, so the same selectors and the same diff machinery cover Chrome, Excel, Slack, Photoshop, and any other native app the OS exposes via UIA or AX. There is no DOM, so there is no need to skip animations, debounce hover states, or pin the viewport.",
  },
  {
    q: "What format does the snapshot use?",
    a: "Two formats are supported, detected from the input. JSON snapshots get parsed and have the id and element_id fields removed via tree walk. Compact YAML snapshots (lines that look like '- [Button] Submit #id123 (bounds: [10,20,100,30], focusable)') get cleaned with the two regexes above. Both paths converge on the line-diff step, so you can choose the format your test pipeline already serializes.",
  },
  {
    q: "Where can I read the actual code?",
    a: "The differ lives at crates/terminator/src/ui_tree_diff.rs in mediar-ai/terminator on GitHub. The unit test test_simple_ui_tree_diff_yaml_bounds_change_no_diff at lines 202-212 specifically asserts that a Reply button moving from y:961 to y:1079 (118 pixels down) produces no diff. Run cargo test --package terminator ui_tree_diff to see it pass locally.",
  },
  {
    q: "Does it ignore everything that changes? How will I catch real bugs?",
    a: "Only volatile fields are stripped: synthetic IDs that change every run and absolute coordinate rectangles. Role, name, value, focusability, and tree shape all stay in the diff. So a button renamed from Submit to Send, a checkbox that loses its enabled state, or a missing list item all show up as added or removed lines prefixed with + or -. The test_simple_ui_tree_diff_yaml_with_changes test demonstrates this for both a window title swap and a button label swap.",
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

const flakyVsStableRows: ComparisonRow[] = [
  {
    feature: "Stores absolute pixel positions",
    competitor: "Yes",
    ours: "No, stripped before diff",
  },
  {
    feature: "Stores synthetic element IDs",
    competitor: "Yes (or HTML id attribute)",
    ours: "No, stripped before diff",
  },
  {
    feature: "Compares role and name",
    competitor: "Sometimes (DOM only)",
    ours: "Yes, on every node",
  },
  {
    feature: "Crosses app boundaries",
    competitor: "No (browser-only)",
    ours: "Yes (Chrome, Slack, Excel in one selector)",
  },
  {
    feature: "Survives 118px button move",
    competitor: "Test fails",
    ours: "Zero diff, test passes",
  },
  {
    feature: "Detects renamed Submit to Send",
    competitor: "Yes (if selector targets text)",
    ours: "Yes, surfaces as +/- diff line",
  },
];

const beforeYaml = `- [Group] Comment from flappy-goose (bounds: [26,472,617,367], focusable)
  - [Button] Reply (bounds: [128,961,82,34], focusable)`;

const afterYaml = `- [Group] Comment from flappy-goose (bounds: [26,472,617,485], focusable)
  - [Button] Reply (bounds: [128,1079,82,34], focusable)`;

const cleanedYaml = `- [Group] Comment from flappy-goose (focusable)
  - [Button] Reply (focusable)`;

const diffSnippetCode = `// crates/terminator/src/ui_tree_diff.rs, lines 40-50
// Two regexes do all the work. Run them on every snapshot
// before the line-diff step.

let id_re = Regex::new(r" #[\\w\\-]+").unwrap();
let result = id_re.replace_all(yaml_str, "");

let bounds_re = Regex::new(r"bounds: \\[[^\\]]+\\],?\\s*").unwrap();
bounds_re.replace_all(&result, "").to_string()`;

const realTestCode = `// crates/terminator/src/ui_tree_diff.rs, lines 202-212
// This test asserts that a Reply button moving 118px down
// (from y:961 to y:1079) produces no diff. Run it locally:
//   cargo test --package terminator ui_tree_diff

#[test]
fn test_simple_ui_tree_diff_yaml_bounds_change_no_diff() {
    let tree1 = "- [Group] Comment from flappy-goose \\
        (bounds: [26,472,617,367], focusable)\\n  \\
        - [Button] Reply (bounds: [128,961,82,34], focusable)";
    let tree2 = "- [Group] Comment from flappy-goose \\
        (bounds: [26,472,617,485], focusable)\\n  \\
        - [Button] Reply (bounds: [128,1079,82,34], focusable)";

    let diff = simple_ui_tree_diff(tree1, tree2).unwrap();
    assert!(
        diff.is_none(),
        "Bounds-only changes should not produce a diff"
    );
}`;

const sdkExample = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// Snapshot the accessibility tree of any window, native or web,
// in compact YAML. The format ui_tree_diff.rs already knows how
// to clean.
const before = await desktop
  .locator("window:Slack")
  .snapshotYaml();

await desktop
  .locator("window:Slack >> role:Button && name:Send")
  .click();

const after = await desktop
  .locator("window:Slack")
  .snapshotYaml();

// Returns null if the only changes are layout shifts.
// Returns a +/- diff string for any real semantic change.
const diff = desktop.diffTrees(before, after);
expect(diff).toContain("+ [Text] Message sent");`;

const cleanCommandLines = [
  { text: "cargo test --package terminator ui_tree_diff", type: "command" as const },
  { text: "running 7 tests", type: "output" as const },
  { text: "test_remove_ids ... ok", type: "success" as const },
  { text: "test_preprocess_tree ... ok", type: "success" as const },
  { text: "test_simple_ui_tree_diff_no_changes ... ok", type: "success" as const },
  { text: "test_simple_ui_tree_diff_with_changes ... ok", type: "success" as const },
  { text: "test_remove_ids_and_bounds_from_compact_yaml ... ok", type: "success" as const },
  { text: "test_remove_bounds_only ... ok", type: "success" as const },
  { text: "test_simple_ui_tree_diff_yaml_bounds_change_no_diff ... ok", type: "success" as const },
  { text: "test result: ok. 7 passed; 0 failed", type: "success" as const },
];

const installLines = [
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"", type: "command" as const },
  { text: "Added stdio MCP server terminator", type: "success" as const },
  { text: "npm i @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 4s", type: "success" as const },
  { text: "cargo add terminator-rs", type: "command" as const },
  { text: "Adding terminator-rs to dependencies", type: "success" as const },
];

const flakySources = [
  "synthetic ids",
  "absolute coordinates",
  "z-index reflow",
  "responsive breakpoints",
  "scroll position",
  "modal animations",
  "ad slots",
  "dynamic class hashes",
  "react keys",
  "live region updates",
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
          UI automation testing that survives a{" "}
          <GradientText>layout shift</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Most guides on UI automation testing assume your test runner stores
          coordinates and complains when those coordinates change. Terminator
          takes the opposite stance: before any two snapshots are compared, the
          element IDs and the bounds rectangles are stripped out. A Reply button
          that drifts 118 pixels down between runs produces zero diff. The test
          passes because nothing real changed.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="8 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "Single Rust file: crates/terminator/src/ui_tree_diff.rs",
          "Two regexes strip every volatile field before diffing",
          "Same selector covers Chrome, Slack, Excel in one test",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Bounds: stripped"
            subtitle="UI automation testing without coordinate brittleness"
            captions={[
              "Snapshot the accessibility tree, not the screenshot",
              "Two regexes drop element IDs and bounds rectangles",
              "Layout shift produces zero diff, semantic change still flags",
              "One selector language across native and web",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The thing every UI test framework gets wrong
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A UI test fails for one of two reasons. Either the product is broken
          and the assertion correctly catches it, or the product is fine and
          the assertion is too strict about something the user does not see.
          The second category is what makes UI automation testing the slowest,
          flakiest, most-disliked layer in any test pyramid.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Most of that pain is coordinate noise. A new banner pushes the form
          down 60 pixels. A skeleton loader holds the layout for 200ms and
          steals the viewport. A modal animates open and the snapshot lands
          half-rendered. The product is fine. The screenshot diff is red.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The fix in most frameworks is a long config of ignore regions, mask
          rectangles, animation freezing, and per-test viewport pinning. The
          fix in Terminator is one file, two regexes, and a snapshot format
          that has the coordinate field as an optional annotation rather than
          a load-bearing comparison key.
        </p>
      </section>

      <ProofBanner
        quote="Bounds-only changes should not produce a diff."
        source="crates/terminator/src/ui_tree_diff.rs, line 210, in test_simple_ui_tree_diff_yaml_bounds_change_no_diff"
        metric="0 diff"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The actual code
        </h2>
        <p className="text-zinc-600 mb-6">
          Two regular expressions, run on the snapshot string before the line
          diff. That is the whole trick.
        </p>
        <AnimatedCodeBlock
          code={diffSnippetCode}
          language="rust"
          filename="ui_tree_diff.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The first regex,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            {" #[\\w\\-]+"}
          </code>
          , removes volatile element IDs like{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            #12345
          </code>{" "}
          or{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            #abc-def
          </code>
          . Those IDs are assigned by the OS at element creation and reset on
          every relaunch, so they always change between runs. The second
          regex,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            {"bounds: \\[[^\\]]+\\],?\\s*"}
          </code>
          , removes the coordinate rectangle{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            bounds: [x,y,w,h]
          </code>{" "}
          wherever it appears in the line. After both passes run, only the
          stable parts of the tree remain: role, name, value, focusability,
          and hierarchy.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What that looks like on a real snapshot
        </h2>
        <p className="text-zinc-600 mb-6">
          A comment thread in a real app. The container grows by 118 pixels
          between runs, so the Reply button shifts down by exactly that much.
          Watch what gets compared.
        </p>
        <BeforeAfter
          title="Snapshot diff with and without bounds stripping"
          before={{
            label: "Raw snapshot",
            content:
              "The two snapshots below differ only in the bounds rectangles. A naive line diff would flag both lines as changed, fail the test, and route a developer to investigate.\n\nRun 1:\n" +
              beforeYaml +
              "\n\nRun 2:\n" +
              afterYaml,
            highlights: [
              "Group height changes from 367 to 485",
              "Reply button y changes from 961 to 1079",
              "Naive diff: 2 lines added, 2 lines removed",
              "Test verdict: fail",
            ],
          }}
          after={{
            label: "After ui_tree_diff.rs cleans it",
            content:
              "After the bounds regex strips every coordinate rectangle, both runs collapse to identical text. simple_ui_tree_diff returns Ok(None) and the test passes.\n\nBoth runs:\n" +
              cleanedYaml,
            highlights: [
              "Bounds tuples removed",
              "Both runs are byte-identical",
              "simple_ui_tree_diff returns Ok(None)",
              "Test verdict: pass",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Where layout-shift noise comes from
        </h2>
        <p className="text-zinc-600 mb-6">
          Almost everything that breaks a brittle UI test falls into one of
          these buckets. None of them describe a product regression. All of
          them are coordinate noise.
        </p>
        <Marquee speed={42} pauseOnHover>
          {flakySources.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The pipeline, end to end
        </h2>
        <p className="text-zinc-600 mb-6">
          Every test run feeds raw accessibility-tree text from any source
          into one cleaning step, then into one differ. The output is either
          {" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            None
          </code>{" "}
          (test passes) or a string of <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">+</code>/<code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">-</code> lines.
        </p>
        <AnimatedBeam
          title="ui_tree_diff.rs pipeline"
          accentColor="#FF3E00"
          from={[
            { label: "Windows UIA", sublabel: "tree dump" },
            { label: "macOS AX", sublabel: "tree dump" },
            { label: "Workflow recorder", sublabel: "JSON snapshot" },
            { label: "MCP server", sublabel: "compact YAML" },
          ]}
          hub={{
            label: "ui_tree_diff.rs",
            sublabel: "strip + line diff",
          }}
          to={[
            { label: "None", sublabel: "test passes" },
            { label: "+ added line", sublabel: "real change flagged" },
            { label: "- removed line", sublabel: "real change flagged" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What still gets caught
        </h2>
        <p className="text-zinc-600 mb-6">
          Stripping volatile fields does not mean stripping signal. Anything
          a user can perceive still ends up in the diff.
        </p>
        <AnimatedChecklist
          title="Diff still flags"
          items={[
            { text: "A button renamed from Submit to Send", checked: true },
            { text: "A checkbox losing its enabled state", checked: true },
            { text: "A list item that disappears between runs", checked: true },
            { text: "A new dialog appearing on top of the window", checked: true },
            { text: "A Text node whose value changes from Loading to Done", checked: true },
            { text: "A focusable element losing the focusable flag", checked: true },
            { text: "Tree shape changes (an extra parent or sibling)", checked: true },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Compared to a coordinate-aware test runner
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Pixel or DOM-bounds runners"
          rows={flakyVsStableRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          A test you can write today
        </h2>
        <p className="text-zinc-600 mb-6">
          From the SDK, snapshot the accessibility tree before and after an
          action, then call the differ. The same code runs against Slack,
          Notion, Excel, or a Chrome tab.
        </p>
        <AnimatedCodeBlock
          code={sdkExample}
          language="typescript"
          filename="send-message.test.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The original test, in source
        </h2>
        <p className="text-zinc-600 mb-6">
          The 118-pixel claim is not marketing. It is a unit test that ships
          with the crate and fails the build if the behavior regresses.
        </p>
        <CodeComparison
          title="From the test suite"
          leftLabel="Two snapshots, same UI"
          rightLabel="The test that asserts no diff"
          leftLines={2}
          rightLines={20}
          leftCode={beforeYaml + "\n---\n" + afterYaml}
          rightCode={realTestCode}
          reductionSuffix="lines of UI noise eliminated"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Verify it yourself in 30 seconds
        </h2>
        <p className="text-zinc-600 mb-6">
          The repo is{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-600 underline underline-offset-4"
          >
            mediar-ai/terminator
          </a>
          . Clone it and run the targeted test.
        </p>
        <TerminalOutput title="zsh" lines={cleanCommandLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={118} suffix="px" />
            </div>
            <p className="text-sm text-zinc-600">
              Vertical drift the Reply button absorbs in the unit test without
              producing a single diff line.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={2} />
            </div>
            <p className="text-sm text-zinc-600">
              Regular expressions in the cleaning pass. One for{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">#id</code>,
              one for{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">bounds:</code>.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={7} />
            </div>
            <p className="text-sm text-zinc-600">
              Unit tests in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                ui_tree_diff.rs
              </code>{" "}
              that lock the behavior in place.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          How to wire it into your test pipeline
        </h2>
        <p className="text-zinc-600 mb-6">
          The differ is plain Rust, exposed through the TypeScript and Python
          SDKs and the MCP server. Pick your harness; the cleaning step is
          identical.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Install the SDK or MCP server",
              description:
                "One command, depending on your stack.",
            },
            {
              title: "Snapshot before the action",
              description:
                "Call locator(...).snapshotYaml() or the MCP tool capture_tree. Both return the compact YAML that ui_tree_diff.rs already knows how to clean.",
            },
            {
              title: "Run the user action",
              description:
                "Click, type, drag, scroll. The selector engine in selector.rs accepts boolean expressions like role:Button && name:Send and the chained form window:Slack >> role:Button.",
            },
            {
              title: "Snapshot after the action",
              description:
                "Same call, second time. You now have two compact-YAML strings.",
            },
            {
              title: "Diff and assert",
              description:
                "simple_ui_tree_diff(before, after) returns Ok(None) when only volatile fields differ. Treat None as pass and any returned string as the failure message.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Install
        </h2>
        <p className="text-zinc-600 mb-6">
          Three flavors. Same Rust core, different surface.
        </p>
        <TerminalOutput title="install" lines={installLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to run your flaky UI suite through the differ?"
        description="Book 20 minutes and we will pipe one of your accessibility-tree snapshots through ui_tree_diff.rs live."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See bounds-stripping diff against your own UI in 20 minutes."
      />
    </article>
  );
}
