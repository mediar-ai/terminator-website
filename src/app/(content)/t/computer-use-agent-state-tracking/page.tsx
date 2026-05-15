import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  HorizontalStepper,
  ShineBorder,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/computer-use-agent-state-tracking";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-14";
const TITLE =
  "Computer use agent state tracking: why a 118-pixel window shift returns zero diff";
const DESCRIPTION =
  "Most computer use agents track UI state by re-snapshotting the screen or tree after every action. Terminator captures the accessibility tree before and after, strips IDs and bounds with two regexes, then returns the structured diff as part of the action result. A window that moved 118 pixels but didn't change semantically reports zero changes. Source: crates/terminator/src/ui_tree_diff.rs, 227 lines.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The state tracking primitive most computer-use frameworks skip: strip volatile fields (IDs, bounds) before diffing the accessibility tree. Animation noise and DPI shifts no longer trigger false positives. The diff arrives with the action response, not as a second model call.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Computer use agent state tracking, done with two regexes and a tree diff",
    description:
      "Terminator's ui_diff_before_after returns the structural delta after each action. IDs and pixel bounds are stripped first, so the diff only shows what semantically changed.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Computer use agent state tracking" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Computer use agent state tracking", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is computer use agent state tracking, in one sentence?",
    a: "It is the part of an agent loop that answers the question 'did my action actually change the UI, and how?' without taking another full screenshot or re-querying the whole accessibility tree by hand. For Terminator that answer is a structured diff returned alongside the click or type response, listing only the lines of the tree that changed after the volatile fields (IDs, bounds) were stripped. For a typical screenshot-only computer use loop it is a second model call against a pair of images.",
  },
  {
    q: "Why isn't 'diff the accessibility tree before and after' enough on its own?",
    a: "Because the raw tree is full of fields that change every time you fetch it even when nothing visible changed. AutomationId values regenerate, runtime element_id values rotate, and bounding rectangles shift by a pixel when a parent reflows. If you diff the raw trees you get a wall of noise on every click. The interesting signal (a new dialog appeared, a button became enabled, a text field gained focus) drowns. Terminator's preprocess_tree and remove_ids_and_bounds_from_compact_yaml functions remove id, element_id, and bounds entries before the line diff runs, so the diff is over semantic structure only. A window that moved 118 pixels without re-rendering returns no diff at all. There is a test for exactly that case (test_simple_ui_tree_diff_yaml_bounds_change_no_diff at line 202 of ui_tree_diff.rs).",
  },
  {
    q: "Where exactly in the code does this happen?",
    a: "Two functions in crates/terminator/src/ui_tree_diff.rs do the work. remove_ids_and_bounds_from_compact_yaml uses a regex ` #[\\w\\-]+` (literal space, hash, then word characters or hyphens) to strip the inline id markers from compact YAML lines like `- [Button] Submit #id123 (bounds: [10,20,100,30], focusable)`. Then it uses `bounds: \\[[^\\]]+\\],?\\s*` to strip the bounds payload. preprocess_tree handles the JSON variant: it walks the tree and drops any key named id or element_id. The cleaned strings then go into similar::TextDiff::from_lines, the Rust equivalent of Python's difflib.ndiff, and only the lines tagged Insert or Delete come back. Equal lines are skipped. The whole module is 227 lines including tests.",
  },
  {
    q: "How does an agent actually receive the diff?",
    a: "If you are using the Rust crate directly, you call desktop.execute_with_ui_diff(selector, action, Some(UiDiffOptions { settle_delay_ms: Some(1500), .. })) and get back a tuple of (action_result, element, Option<UiDiffResult>). UiDiffResult has two fields: diff (a string of + and - lines) and has_changes (a boolean). If you are on the Node.js SDK, you pass `uiDiffBeforeAfter: true` to .click() or .typeText() options and the result object includes a uiDiff field with the same shape. If you are using the MCP server from Claude Code, Cursor, VS Code, or Windsurf, you set `ui_diff_before_after: true` on click_element, type_into_element, press_key, or any other action tool and the response JSON carries ui_diff and has_ui_changes. The system prompt the MCP server ships explicitly tells the assistant not to call get_window_tree after an action, because the diff is already attached to the action response.",
  },
  {
    q: "What does the structured diff look like in practice?",
    a: "A list of lines that changed after the strip pass. Lines starting with `-` were in the before tree and not in the after. Lines starting with `+` are new. For a Save dialog opening, you would see something like `+   - [Dialog] Save As (focusable)` followed by `+     - [Edit] File name` and `+     - [Button] Save`. Plus and minus signs are the only markers; equal lines are dropped on purpose to keep the diff short enough that an LLM can read it in one token budget. The diff is plain text, not JSON, because the model already speaks diff syntax fluently.",
  },
  {
    q: "Why is the default settle delay 1500 milliseconds?",
    a: "Because most native UI animations (Windows Fluent transitions, macOS view animations, web view fade-ins inside Electron apps) complete inside one second, and you need a margin. If you capture the AFTER tree too early you see the half-rendered intermediate state, which produces a diff full of partially-built dialog children that disappear on the next frame. 1500ms is the empirical floor that produces a clean diff for the common cases. The number is the unwrap_or default on opts.settle_delay_ms inside execute_with_ui_diff in crates/terminator/src/lib.rs around line 1814. Override it per call: shorter (200-500ms) for purely keyboard actions inside a single text field, longer (2500-5000ms) for actions that trigger a network round-trip the UI is waiting on.",
  },
  {
    q: "How is this different from Anthropic's computer use loop or other screenshot-based agents?",
    a: "Screenshot-based loops track state by comparing two raster images. The model has to do the comparison, which costs another full inference, and the comparison is pixel-aware (not semantically aware), so font rendering changes, subpixel jitter, and animation easing all register as differences. Terminator's loop tracks state structurally at the accessibility tree level. The diff is computed in Rust before the model ever sees it, so the per-action token cost goes to zero unless something semantically changed. Vision still has a place in the loop (Terminator's open source SDK ships a Gemini Computer Use adapter for cases where the tree is empty), but for the 90% case where the app exposes a real accessibility tree, you want structural state tracking, not visual.",
  },
  {
    q: "Does the diff capture cost a full extra tree walk?",
    a: "Yes. It walks the tree twice (once before, once after) and computes a line diff between the two compact YAML strings. On a typical foreground window with 200-800 elements this costs in the tens of milliseconds per direction on Windows UIA, plus the settle delay. The tradeoff is that you save a model call per action. If your action tool would otherwise be followed by get_window_tree (the LLM's default move to figure out what happened), you have replaced one tree walk plus one full model turn with one tree walk and a small diff string. Cheaper, faster, and more honest about what changed.",
  },
  {
    q: "What if the action did nothing visible?",
    a: "You see `No UI changes detected` in the diff field and has_changes false. This is the failure mode the diff was built to surface. A click that resolved against the right element but did not change anything (because the button was already pressed, or the element is a dead area inside a misnamed container) shows up as `has_changes: false` instead of being silently reported as success. Pair this with the system prompt rule that says 'never hallucinate success' and the agent can decide whether to retry, re-acquire the tree, or escalate. The output of the action and the structural state delta are separated on purpose: one tells you the call returned ok, the other tells you the world moved.",
  },
  {
    q: "Can I turn it off if I don't want the diff?",
    a: "Yes. On the Rust SDK, just call the non-diff variants of the action methods (element.click(), element.type_text()). On the Node SDK, leave uiDiffBeforeAfter false (it defaults to false at the binding layer to keep simple scripts fast). On the MCP server, the server prompt strongly encourages it for agent loops; in the changelog at version 0.24 the team made the parameter mandatory at the MCP layer specifically because agents that omitted it kept losing track of state. If you are running a deterministic recorded workflow where you already know the expected state, you can omit it and gain back the settle delay. If you are running an LLM-driven loop, leave it on.",
  },
];

const sequenceActors = [
  "Agent",
  "MCP server",
  "tree capture",
  "Diff engine",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "click_element 'role:Button && name:Save' { ui_diff_before_after: true }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "get_window_tree(pid, compact YAML)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "before_str (812 lines)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 1,
    label: "execute UIA Invoke pattern on Save",
    type: "event" as const,
  },
  {
    from: 1,
    to: 1,
    label: "sleep(settle_delay_ms = 1500)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 2,
    label: "get_window_tree(pid, compact YAML)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "after_str (834 lines)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 3,
    label: "simple_ui_tree_diff(before_str, after_str)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 3,
    label: "strip #ids via ` #[\\w\\-]+`",
    type: "event" as const,
  },
  {
    from: 3,
    to: 3,
    label: "strip bounds via `bounds: \\[[^\\]]+\\],?\\s*`",
    type: "event" as const,
  },
  {
    from: 3,
    to: 3,
    label: "TextDiff::from_lines, keep + and - only",
    type: "event" as const,
  },
  {
    from: 3,
    to: 1,
    label: "Some('+   - [Dialog] Save As\\n+     - [Edit] File name\\n+     - [Button] Save')",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "{ result: ok, ui_diff: <diff string>, has_ui_changes: true }",
    type: "response" as const,
  },
];

const stripChecklist = [
  {
    text: "AutomationId values rotate per-session on some apps (notably Office, every browser, anything WPF). Diffing them produces a +/- pair for every element under the action's parent.",
  },
  {
    text: "element_id is Terminator's own internal identifier, regenerated on each get_window_tree call. It exists for selector caching, not for state comparison.",
  },
  {
    text: "bounds: [x,y,w,h] shifts when a window animates, when a parent reflows after a font fallback, or when DPI scaling kicks in on a second monitor. Pure visual noise from a semantic standpoint.",
  },
  {
    text: "Equal lines (similar::ChangeTag::Equal) are dropped on purpose. The diff is a description of what changed, not a re-statement of what stayed the same. Keeps the diff inside a few hundred tokens even for large trees.",
  },
  {
    text: "JSON path is handled separately by preprocess_tree: parse with serde_json, walk the object, drop keys named id and element_id, re-serialize with pretty printing.",
  },
  {
    text: "Compact YAML path is handled with two regex substitutions because the YAML never gets parsed back into a tree, it stays as the literal indented representation an LLM is good at reading.",
  },
];

const installSteps = [
  {
    title: "Install Terminator's MCP server",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Same npm command goes into Cursor's, VS Code's, and Windsurf's MCP config block.",
  },
  {
    title: "Set ui_diff_before_after: true on the first action call",
    description:
      "The system prompt the MCP server ships already pushes the assistant to do this. If you want belt-and-suspenders, mention it once in your own instructions to Claude.",
  },
  {
    title: "Read ui_diff in the response",
    description:
      "Lines starting with + are new in the after tree. Lines starting with - were removed. No diff lines means the action did not change the UI semantically, which is a real failure mode worth handling.",
  },
  {
    title: "Override settle_delay_ms when the action waits on a network",
    description:
      "Default is 1500ms. Increase to 3000-5000 for clicks that trigger a server round-trip before the dialog renders. Decrease to 200-500 for keypress sequences inside a single text field.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Accessibility API for computer use agents: the cache topology under click_element",
    href: "/t/accessibility-api-computer-use-agents",
    excerpt:
      "Where state tracking starts: the UIA, DOM, OCR, Omniparser, and Gemini caches that get_window_tree builds before the agent makes its first selector choice.",
    tag: "Internals",
  },
  {
    title:
      "Sentence to desktop automation script, the structural answer",
    href: "/t/sentence-to-desktop-automation-script",
    excerpt:
      "The system prompt rule at prompt.rs line 21 that forbids the agent from guessing element attributes, paired with the get_window_tree primitive that makes the rule enforceable.",
    tag: "Prompt",
  },
  {
    title:
      "Open source computer use agent SDK: deterministic + vision in one install",
    href: "/t/open-source-computer-use-agent-sdk",
    excerpt:
      "The hybrid runtime that ships both an accessibility-tree path and a Gemini 2.5 vision loop, switchable at the action level.",
    tag: "SDK",
  },
  {
    title: "Accessibility tree closes the browser-to-native gap",
    href: "/t/accessibility-tree-closes-browser-to-native-gap",
    excerpt:
      "Why the same tree-diff approach generalizes from Playwright's DOM into Windows UIA and macOS AX, and where the abstraction leaks.",
    tag: "Cross-platform",
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
              authorUrl: "https://m13v.com",
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

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>tree diff, not screenshot diff</span>
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Computer use agent state tracking, done with two regexes and a tree diff
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Every guide on this topic says the same thing: take a screenshot
            before, take a screenshot after, ask the model what changed. That
            works, and it costs you a model turn per action plus a vision
            inference that does not know the difference between a button
            becoming enabled and a pixel of subpixel rendering shifting in the
            font.
          </p>

          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Terminator does it differently. The framework captures the
            accessibility tree before the action, performs the action, waits
            1500ms for the UI to settle, captures the tree again, strips the
            volatile fields (IDs and bounds) out of both, and runs a line
            diff. The result is a structural description of what changed,
            returned in the same response as the action result. No second
            model call. No vision compare. A window that moved 118 pixels but
            did not re-render reports zero changes.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ui_diff_before_after
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              execute_with_ui_diff
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              simple_ui_tree_diff
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              settle_delay_ms: 1500
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <section className="max-w-3xl mx-auto px-6 mt-10">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 md:p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
              Direct answer (verified 2026-05-14)
            </p>
            <p className="text-lg text-zinc-900 leading-relaxed">
              Most computer use agents track UI state by re-snapshotting the
              screen or the accessibility tree after every action and asking
              the model to compare. Terminator does it structurally. Pass{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                ui_diff_before_after: true
              </code>{" "}
              to any action tool. The framework grabs the accessibility tree
              before the action, runs the action, waits 1500ms, grabs the tree
              again, strips IDs and bounds from both copies, and returns the
              diff lines in the action response under{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                ui_diff
              </code>{" "}
              and{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                has_ui_changes
              </code>
              . No second model call. No vision compare.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Source:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/ui_tree_diff.rs"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                crates/terminator/src/ui_tree_diff.rs
              </a>
              , 227 lines, and{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/lib.rs"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                execute_with_ui_diff in lib.rs
              </a>{" "}
              from line 1748.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The reason you cannot just diff the raw tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The accessibility tree of a real foreground window has 200 to 800
            nodes on a typical screen. Every node carries an{" "}
            <code className="font-mono text-zinc-800">AutomationId</code>, an
            internal{" "}
            <code className="font-mono text-zinc-800">element_id</code>, and a
            bounding rectangle. On most apps the AutomationId rotates on every
            new session. The internal element_id rotates on every tree fetch.
            The bounds shift any time a parent reflows by a pixel, which
            happens during animations, DPI changes, and font fallbacks.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you write a naive{" "}
            <code className="font-mono text-zinc-800">tree_after == tree_before</code>{" "}
            check, you get a diff on every fetch even when nothing changed.
            The volume is roughly: one +/- pair per element under the parent
            that animated. For a Save dialog with 40 children, that is 80 noise
            lines. Real changes get buried.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>naive raw-tree diff after a single Save click</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`- [Button] Save #id8d3a (bounds: [892,512,80,30], focusable)
+ [Button] Save #idee71 (bounds: [892,514,80,30], focusable)
- [Group] Toolbar #id2b91 (bounds: [12,8,1280,42])
+ [Group] Toolbar #id7f02 (bounds: [12,8,1280,42])
- [Edit] Filename #idab43 (bounds: [420,460,260,28])
+ [Edit] Filename #idc197 (bounds: [420,462,260,28])
... 218 more lines of pure noise ...`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two pixels of vertical shift (the dialog scrolled up by an
            animation easing curve) plus fresh IDs on every node. None of it
            is a state change. All of it is in the diff. An agent that reads
            this output learns nothing about whether the Save actually did
            anything.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The two regexes that fix it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open{" "}
            <code className="font-mono text-zinc-800">
              crates/terminator/src/ui_tree_diff.rs
            </code>{" "}
            in the Terminator repo. The whole module is 227 lines. The state
            tracking primitive lives in two functions.
          </p>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            The compact YAML format the framework uses for tree dumps looks
            like <code className="font-mono text-zinc-800">- [Button] Save #id8d3a (bounds: [892,512,80,30], focusable)</code>.
            Two regex substitutions get applied to every line before the diff
            runs:
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>ui_tree_diff.rs lines 40-50</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`pub fn remove_ids_and_bounds_from_compact_yaml(yaml_str: &str) -> String {
    // Remove #id patterns (e.g., #12345, #abc-def-123)
    // This regex matches: space + # + word characters (letters, numbers, hyphens)
    let id_re = Regex::new(r" #[\\w\\-]+").unwrap();
    let result = id_re.replace_all(yaml_str, "");

    // Remove bounds patterns: "bounds: [x,y,w,h]" with optional trailing comma/space
    // Matches: "bounds: [123,456,789,100]" or "bounds: [123,456,789,100], "
    let bounds_re = Regex::new(r"bounds: \\[[^\\]]+\\],?\\s*").unwrap();
    bounds_re.replace_all(&result, "").to_string()
}`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            For trees serialized as JSON (the larger, more verbose form), a
            separate function{" "}
            <code className="font-mono text-zinc-800">preprocess_tree</code>{" "}
            parses with serde_json, walks the object, drops every key named{" "}
            <code className="font-mono text-zinc-800">id</code> or{" "}
            <code className="font-mono text-zinc-800">element_id</code>, and
            re-serializes with pretty printing. After preprocessing, both
            cleaned strings go into{" "}
            <code className="font-mono text-zinc-800">similar::TextDiff::from_lines</code>,
            the Rust port of Python&apos;s difflib.ndiff, and only the lines
            tagged Insert or Delete come back. Equal lines are dropped.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <ShineBorder color="#FF3E00" borderWidth={2}>
            <div className="rounded-2xl bg-white border border-zinc-100 p-6 md:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
                Anchor fact
              </p>
              <p className="text-xl md:text-2xl text-zinc-900 leading-snug font-semibold tracking-tight">
                A window that moves 118 pixels without a re-render returns
                zero changes.
              </p>
              <p className="mt-4 text-base text-zinc-700 leading-relaxed">
                The repo carries this as a test. Open ui_tree_diff.rs at line
                202:{" "}
                <code className="font-mono text-zinc-800">
                  test_simple_ui_tree_diff_yaml_bounds_change_no_diff
                </code>
                . Two trees with the same structure but bounds shifted by 118
                pixels on the Y axis. The assertion is{" "}
                <code className="font-mono text-zinc-800">diff.is_none()</code>.
                If you regress the regex you break this test.
              </p>
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span>ui_tree_diff.rs lines 201-212</span>
                </div>
                <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
                  <code>{`#[test]
fn test_simple_ui_tree_diff_yaml_bounds_change_no_diff() {
    // Same structure, only bounds changed (element moved down 118px)
    let tree1 = "- [Group] Comment from flappy-goose \
(bounds: [26,472,617,367], focusable)\\n  - [Button] Reply \
(bounds: [128,961,82,34], focusable)";
    let tree2 = "- [Group] Comment from flappy-goose \
(bounds: [26,472,617,485], focusable)\\n  - [Button] Reply \
(bounds: [128,1079,82,34], focusable)";

    let diff = simple_ui_tree_diff(tree1, tree2).unwrap();
    assert!(diff.is_none(), "Bounds-only changes should not produce a diff");
}`}</code>
                </pre>
              </div>
            </div>
          </ShineBorder>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The full call shape, end to end
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One click, traced through the agent loop. The MCP server is in the
            middle. The tree capture engine is the UIA backend on Windows or
            the AX backend on macOS. The diff engine is the 227-line module
            above.
          </p>

          <SequenceDiagram
            title="One action, one structural diff returned to the agent"
            actors={sequenceActors}
            messages={sequenceMessages}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            What the agent gets back is two fields:{" "}
            <code className="font-mono text-zinc-800">ui_diff</code> (a string
            of plus and minus lines) and{" "}
            <code className="font-mono text-zinc-800">has_ui_changes</code> (a
            boolean). The model reads them in the same turn it issued the
            action. Branch logic is local: if has_ui_changes is false, retry
            with a different selector. If new dialog lines appeared, focus the
            next action on those. If a target node disappeared, the action
            succeeded.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What gets stripped, and why each one matters
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The preprocessing pass is the entire point. Without it the diff is
            noise. With it the diff is signal. Here is what falls out before
            the line comparison runs.
          </p>

          <AnimatedChecklist
            title="Volatile fields removed before diffing"
            items={stripChecklist}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Screenshot diff vs structural diff
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both approaches answer the question &quot;what changed after my
            action.&quot; They answer it at different layers. The cost
            profile, the failure modes, and the LLM token budget look very
            different.
          </p>

          <BeforeAfter
            title="The two approaches, same question, different answers"
            before={{
              label: "Screenshot diff",
              content:
                "Take a full screenshot before and after. Send both images to the model. Ask the model to compare. The model spends another inference budget on a vision compare that does not know what is structural and what is decorative.",
              highlights: [
                "Two full vision inferences per action",
                "Subpixel jitter and animation easing count as changes",
                "Font fallback renders as a real diff to the model",
                "DPI scaling changes everything at once",
                "Costs tokens proportional to screen resolution",
              ],
            }}
            after={{
              label: "Structural tree diff",
              content:
                "Capture the accessibility tree before and after. Strip IDs and bounds via two regex passes. Run a line diff in Rust. Return only the changed lines as part of the action response. The model sees structural state changes, in text, in the same turn.",
              highlights: [
                "Zero extra model calls per action",
                "Pixel shifts under 1000px on any axis report zero changes",
                "Animation timing handled by the 1500ms settle delay",
                "Diff is a few hundred tokens at most, regardless of screen size",
                "Same primitive on Windows UIA, macOS AX",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The settle delay, in one paragraph
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most native UI animations finish inside one second. Capture the
            AFTER tree too early and you snapshot a half-rendered dialog with
            children that vanish on the next frame. The default of 1500ms is
            the empirical floor that produces a clean diff for the common
            cases (Office, Chrome, Electron apps, native Windows shell). The
            number lives at line 1814 of crates/terminator/src/lib.rs as the
            unwrap_or default on{" "}
            <code className="font-mono text-zinc-800">
              opts.settle_delay_ms
            </code>
            . Override it per call when you know more about the action.
            Keyboard sequences inside a single text field finish in under
            200ms, so 200-500 is fine. Actions that trigger a server round
            trip before the next dialog renders want 2500-5000.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Wiring it into your own loop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four steps. The first one is the install you already have if you
            ship anything on top of Terminator.
          </p>

          <HorizontalStepper title="From install to first structural diff" steps={installSteps} />

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>node SDK: state tracking on a click</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`import { Desktop } from "terminator.js";

const desktop = new Desktop();
const saveBtn = await desktop
  .locator("process:notepad >> role:Button && name:Save")
  .first();

const result = await saveBtn.click({
  uiDiffBeforeAfter: true,
  uiDiffMaxDepth: 30,
});

if (result.uiDiff?.hasChanges) {
  // result.uiDiff.diff is a string of + and - lines
  // route on it: dialog opened, button disabled, etc.
} else {
  // the click resolved but nothing semantic changed
  // retry, re-acquire tree, or surface failure
}`}</code>
            </pre>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>rust: the lower-level shape</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`use terminator::{Desktop, UiDiffOptions};

let desktop = Desktop::new_default()?;
let options = UiDiffOptions {
    settle_delay_ms: Some(1500),
    ..Default::default()
};

let (result, element, diff) = desktop
    .execute_with_ui_diff(
        "process:notepad >> role:Button && name:Save",
        |el| el.click(),
        Some(options),
    )
    .await?;

match diff {
    Some(d) if d.has_changes => { /* d.diff is a String of +/- lines */ }
    Some(_) => { /* "No UI changes detected" */ }
    None    => { /* tree capture failed; action still happened */ }
}`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            On the MCP path (Claude Code, Cursor, VS Code, Windsurf), nothing
            on your side. The server prompt the assistant receives already
            steers it toward{" "}
            <code className="font-mono text-zinc-800">
              ui_diff_before_after: true
            </code>{" "}
            on every action tool. The diff arrives in the response JSON. The
            assistant reads it before deciding what to do next. The changelog
            entry at version 0.24 made the parameter mandatory at the MCP
            layer specifically because agents that omitted it kept losing
            track of state.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What this does not solve
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Structural state tracking is not a replacement for vision in every
            case. There are two regimes where the tree diff is the wrong
            tool.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            First, apps with empty accessibility trees. Older games, custom
            DirectX surfaces, some Java Swing dialogs, and a handful of
            Electron apps that never wire up ARIA. The before and after trees
            are both effectively empty. The diff is always empty. You need
            vision here. Terminator&apos;s SDK ships a Gemini Computer Use
            adapter for this case; the click_element tool also exposes an
            include_omniparser path that runs an OCR plus visual model on top
            of the screenshot. The structural diff coexists with the visual
            grounding; you do not have to pick one.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Second, changes that are purely visual. A button glow, a color
            shift in a chart, a hover state that fades in. None of those show
            up in the accessibility tree because they are not announced to
            assistive tech. If your agent has to act on visual-only feedback,
            you want a vision pass; the tree diff will report{" "}
            <code className="font-mono text-zinc-800">
              has_changes: false
            </code>{" "}
            and be technically correct but not useful. The honest split is to
            use the tree diff for navigation and semantic state, and vision
            for the cases where the application explicitly opted out of
            announcing the change.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            heading="Building a computer use agent that has to track real desktop state?"
            description="Bring the loop you have. We will look at where state tracking is leaking and whether the structural diff fits."
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Related reading
          </h2>
          <div className="mt-6">
            <RelatedPostsGrid posts={relatedPosts} />
          </div>
        </section>

        <div className="max-w-3xl mx-auto px-6 mt-16 pb-24">
          <p className="text-sm text-zinc-500">
            Last verified 2026-05-14 against the main branch of{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-700 underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
            >
              mediar-ai/terminator
            </a>
            . If the line numbers move (ui_tree_diff.rs is small but it does
            get refactored), the function names are stable.
          </p>
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Talk through state tracking with the team building it."
      />
    </>
  );
}
