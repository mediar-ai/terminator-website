import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  TerminalOutput,
  CodeComparison,
  AnimatedChecklist,
  SequenceDiagram,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/claude-opus-4-7-desktop-automation";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-08";
const TITLE =
  "Claude Opus 4.7 desktop automation: why the new default of fewer tool calls changes the shape of your agent";
const DESCRIPTION =
  "Opus 4.7 is the first Claude model with 1:1 pixel-to-coordinate mapping and 2576px screenshot input. It also makes fewer tool calls per turn by default and reasons more. Those two changes pull desktop automation away from per-click screenshot loops and toward compiled workflows. Here is what that means in practice with Terminator's MCP server.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Opus 4.7 ships with two changes that matter for desktop automation: 1:1 pixel coords on the computer-use tool, and fewer tool calls per turn by default. Terminator's 35-tool MCP server gives that model accessibility-tree hands instead of pixel hands.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Opus 4.7 desktop automation: fewer tool calls, bigger workflows",
    description:
      "Opus 4.7 wants to think more and click less. That is the wrong shape for a screenshot loop and the right shape for compiled workflows. Terminator's execute_sequence MCP tool is the bridge.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Claude Opus 4.7 desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Claude Opus 4.7 desktop automation", url: PAGE_URL },
];

const installLines = [
  { type: "command" as const, text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"" },
  { type: "output" as const, text: "Resolving terminator-mcp-agent... ok" },
  { type: "output" as const, text: "Registered MCP server: terminator (35 tools)" },
  { type: "success" as const, text: "Opus 4.7 can now click, type, and read the desktop accessibility tree." },
];

const computerUseSnippet = `// Opus 4.7 with Anthropic's built-in computer-use tool.
// Model sees a screenshot, picks pixels, returns this JSON.
// You implement the screenshot capture and the click.
// Opus 4.7 specific: image input ceiling is 2576px / 3.75MP
// (4.6 was 1568px / 1.15MP) and coordinates are 1:1 with
// actual pixels, no scale-factor math.

{
  "type": "tool_use",
  "name": "computer",
  "input": {
    "action": "left_click",
    "coordinate": [487, 341]
  }
}

// Cost shape: one model inference per click.
// Latency shape: roundtrip the screenshot every step.
// Failure shape: a tooltip or modal moves the pixel,
// the next click misses, you replay from scratch.`;

const mcpSnippet = `// Opus 4.7 with Terminator's MCP server.
// 35 typed tools exposed via npx terminator-mcp-agent.
// Source of truth: crates/terminator-mcp-agent/src/server.rs
// (each tool is a #[tool(...)] macro, 35 in total).

{
  "type": "tool_use",
  "name": "click_element",
  "input": {
    "selector": "process:notepad >> role:Button && name:Save"
  }
}

// Resolved against the OS accessibility tree (Windows UIA
// or macOS AX), not pixels. The selector survives DPI
// changes, theme changes, and tooltip layouts.
// Opus 4.7's "fewer tool calls" default still applies,
// but each call now does structural work, not a pixel guess.`;

const sequenceCall = `// One MCP call. The whole workflow inside.
// crates/terminator-mcp-agent/src/server.rs:7549

{
  "name": "execute_sequence",
  "input": {
    "variables": {
      "report_path": { "type": "string", "default": "report.xlsx" }
    },
    "selectors": {
      "calc_window": "role:Window && name:Calculator",
      "btn_equals":  "role:Button && name:Equals"
    },
    "steps": [
      { "tool_name": "open_application",
        "arguments": { "path": "calc.exe" }, "id": "launch" },
      { "tool_name": "type_into_element",
        "arguments": { "selector": "\${{selectors.calc_window}}",
                       "text_to_type": "42" },
        "retries": 2,
        "fallback_id": "recover_focus" },
      { "tool_name": "click_element",
        "arguments": { "selector": "\${{selectors.btn_equals}}" },
        "jumps": [
          { "if": "click_element_status == 'success'",
            "to_id": "capture" }
        ]},
      { "tool_name": "wait_for_element", "id": "capture",
        "arguments": { "selector": "\${{selectors.calc_window}}",
                       "condition": "exists",
                       "include_tree": true } }
    ],
    "troubleshooting": [
      { "tool_name": "activate_element", "id": "recover_focus",
        "arguments": { "selector": "\${{selectors.calc_window}}" } }
    ]
  }
}

// Opus 4.7 emits this once.
// The MCP server runs every step locally with no model in
// the inner loop. If a step fails, the troubleshooting
// branch fires. Output is structured JSON.`;

const opusChanges = [
  {
    text: "Image input ceiling rises to 2576px on the long edge, roughly 3.75MP, up from 1568px / 1.15MP on Opus 4.6.",
    checked: true,
  },
  {
    text: "Coordinates returned by the computer-use tool are 1:1 with actual pixels. No scale-factor math required.",
    checked: true,
  },
  {
    text: "Fewer tool calls per turn at the default effort level. The model reasons more before acting.",
    checked: true,
  },
  {
    text: "New xhigh effort level between high and max. Anthropic recommends xhigh for agentic and coding work.",
    checked: true,
  },
  {
    text: "1M token context window. 128k max output tokens. Adaptive thinking. Same platform features as Opus 4.6.",
    checked: true,
  },
];

const sequenceActors = [
  "Opus 4.7",
  "MCP server",
  "Windows UIA / macOS AX",
];

const sequenceMessages = [
  { from: 0, to: 1, label: "execute_sequence(workflow)", note: "single tool_use, ~5KB JSON" },
  { from: 1, to: 2, label: "open_application(calc.exe)" },
  { from: 2, to: 1, label: "process_id, hwnd" },
  { from: 1, to: 2, label: "type_into_element(selector, '42')" },
  { from: 2, to: 1, label: "ok | retry | fallback" },
  { from: 1, to: 2, label: "click_element(selector)" },
  { from: 2, to: 1, label: "ok" },
  { from: 1, to: 2, label: "wait_for_element(condition: exists)" },
  { from: 2, to: 1, label: "tree snapshot" },
  { from: 1, to: 0, label: "structured JSON result", note: "one model turn closes the loop" },
];

const metrics = [
  { value: "35", label: "typed MCP tools in server.rs" },
  { value: "1", label: "model turn for a multi-step workflow via execute_sequence" },
  { value: "2576", label: "px screenshot input ceiling on Opus 4.7" },
  { value: "1:1", label: "pixel-to-coordinate mapping in computer-use" },
];

const faqs = [
  {
    question: "How do I use Claude Opus 4.7 for desktop automation?",
    answer:
      "Two paths. Anthropic exposes a built-in computer-use tool: Opus 4.7 sees a screenshot (now up to 2576px / 3.75MP, with 1:1 pixel-to-coordinate mapping) and returns click or type actions that your code executes. Or wire Terminator's MCP server with `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"` so Opus 4.7 calls 35 typed accessibility-tree tools instead of pixel coordinates. The MCP path resolves selectors locally against Windows UI Automation or macOS Accessibility, no screenshot in the loop.",
  },
  {
    question: "Does Opus 4.7 actually improve over Opus 4.6 for desktop work?",
    answer:
      "For pixel-driven computer use, yes, in two specific ways. The image input ceiling rose from 1568px to 2576px on the long edge (about 3.75MP), so a Full HD or 4K screenshot fits without aggressive downscaling. Coordinates the model emits are 1:1 with the actual pixels you sent, so there is no scale-factor math. Anthropic also reduced default tool-call frequency on 4.7, which means the model leans on reasoning over rapid-fire actions. For agentic flows, run at high or xhigh effort.",
  },
  {
    question: "What is the xhigh effort level and when should I use it?",
    answer:
      "xhigh is a new effort level Opus 4.7 introduced between high and max. Anthropic's docs recommend it for coding and agentic use cases because the model spends more time reasoning before each action, which compensates for the lower default tool-call rate. For a desktop automation agent that has to navigate unfamiliar applications, xhigh tends to produce fewer wasted clicks at the cost of higher per-turn latency.",
  },
  {
    question: "Why does Terminator give 35 tools instead of just one click(x,y) tool?",
    answer:
      "Because clicks are one-tenth of what an automation actually needs. The 35 tools at crates/terminator-mcp-agent/src/server.rs cover get_window_tree, click_element, type_into_element, press_key, validate_element, wait_for_element, scroll_element, select_option, set_value, capture_screenshot, run_command, navigate_browser, execute_browser_script, execute_sequence, and the file primitives read_file / write_file / edit_file / glob_files / grep_files. Each one wraps a real OS or browser primitive. A click(x,y) tool collapses all that into pixel guessing and forces the model back into a screenshot loop.",
  },
  {
    question: "What is execute_sequence and why is it the right shape for Opus 4.7?",
    answer:
      "execute_sequence is one MCP tool that accepts a typed workflow: variables, named selectors, an array of steps, fallback branches, conditional jumps, and an optional output parser. The model emits the whole workflow once. The server runs every step locally with no model in the inner loop. Because Opus 4.7 defaults to fewer tool calls per turn, it is naturally inclined to think harder up front and dispatch a bigger unit of work. execute_sequence is the bigger unit. The shape matches.",
  },
  {
    question: "Can I mix the screenshot path and the accessibility path?",
    answer:
      "Yes, and you usually want to. Terminator exposes capture_screenshot as one of its tools, so Opus 4.7 can fall back to vision when the accessibility tree is missing labels (common in custom-rendered Electron and game UIs). The healthy split is: structural tools for everything the OS knows the name of, screenshot plus Opus 4.7's 1:1 coordinates for the rest. Use validate_element first to decide which path to take.",
  },
  {
    question: "What platforms does this work on?",
    answer:
      "Windows is the primary platform with full feature support via the UI Automation COM API. macOS works at the core Rust level via the Accessibility API and requires you to grant accessibility permissions in System Settings. The terminator-mcp-agent npm package ships Windows binaries and macOS works through the Rust crate. Linux uses AT-SPI2 in the core but is not yet packaged as an MCP binary.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude desktop automation: one MCP call that runs the whole workflow",
    excerpt: "execute_sequence in detail. Variables, selectors, jumps, fallback branches, JS output parser. server.rs:7549.",
    href: "/t/claude-desktop-automation",
    tag: "Guide",
  },
  {
    title: "Claude computer use: the pixel loop, and the selector-based alternative",
    excerpt: "Why Anthropic's native computer-use tool is a screenshot loop, and what the accessibility-tree alternative looks like.",
    href: "/t/claude-computer-use",
    tag: "Guide",
  },
  {
    title: "Claude skills for desktop automation: the two that ship with Terminator",
    excerpt: "terminator-issue-reporter and remote-mcp. Two skills under .claude/skills that pair Anthropic skill markdown with the MCP server.",
    href: "/t/claude-skills-for-desktop-automation",
    tag: "Guide",
  },
];

const articleSchemaJson = articleSchema({
  url: PAGE_URL,
  title: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaJson = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Guide / Opus 4.7
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Claude Opus 4.7 desktop automation
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            Opus 4.7 shipped on April 16, 2026 with two changes that quietly rewrite how a desktop agent should be built. The first is on the screenshot side: image inputs now go up to 2576 pixels on the long edge (about 3.75 megapixels), and the coordinates the model returns are 1:1 with actual pixels, no scale-factor math. The second is on the planning side: the model makes fewer tool calls per turn by default, leaning on reasoning over rapid action. Those two changes pull in opposite directions if you are stuck in a per-click screenshot loop. They line up perfectly if your tools are structural and your workflow is compiled.
          </p>
        </header>

        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="8 min read"
          />
        </div>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-08)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            Two paths to drive a desktop with Opus 4.7. <strong>Path A:</strong> Anthropic's built-in <code className="rounded bg-white px-1 text-orange-700">computer</code> tool. Opus 4.7 sees a screenshot at up to 2576px and emits <code className="rounded bg-white px-1 text-orange-700">left_click</code> or <code className="rounded bg-white px-1 text-orange-700">type</code> actions; you implement the actual screenshot capture and OS click. <strong>Path B:</strong> Terminator's MCP server, installed once with <code className="rounded bg-white px-1 text-orange-700">claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;</code>. Opus 4.7 then has 35 typed tools that hit the OS accessibility tree directly, no screenshot in the loop. Path B is the better fit for Opus 4.7's "fewer tool calls, more reasoning" default because <code className="rounded bg-white px-1 text-orange-700">execute_sequence</code> lets the model ship a whole workflow as one tool call.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Source for the model facts: <a className="text-orange-600 underline" href="https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7">platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7</a>. Source for the 35 tools: <a className="text-orange-600 underline" href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs">crates/terminator-mcp-agent/src/server.rs</a>.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">What actually changed in Opus 4.7</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic's release notes for 4.7 highlight coding and vision wins. For anyone building a desktop automation agent, three of the changes matter more than the rest, and they interact.
          </p>
          <div className="mt-6">
            <AnimatedChecklist items={opusChanges} title="Opus 4.7 changes that move desktop automation" />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The pixel-side improvements (2576px input, 1:1 coordinates) make screenshot-driven clicks finally tractable. A 1080p screenshot fits without aggressive downscaling, and you no longer translate model coordinates back to your actual screen. So if you choose Path A, the screenshot loop is now smoother than it has ever been on a Claude model.
          </p>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            But the planning-side change is the one that flips the strategy. Lower default tool-call frequency means Opus 4.7, left to its own taste, will not happily emit thirty <code className="rounded bg-orange-50 px-1 text-orange-700">left_click</code> events in sequence. It would rather think once and act once. If your tool surface is just <em>screenshot</em> and <em>click(x,y)</em>, that preference works against you. If your tool surface includes a single tool that accepts a typed multi-step workflow, that preference works for you.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Path A vs Path B, in code</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both paths are real and supported. The shape of what Opus 4.7 emits is what differs.
          </p>
          <div className="mt-6">
            <CodeComparison
              title="Same click, two surfaces"
              leftLabel="Path A: native computer tool"
              rightLabel="Path B: Terminator MCP"
              leftCode={computerUseSnippet}
              rightCode={mcpSnippet}
              language="json"
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Path A asks the model to be a vision system. Every click costs one screenshot upload and one round-trip. The model has to decide where the button is in pixels, every time the layout shifts. Path B asks the model to be a planner. The selector <code className="rounded bg-orange-50 px-1 text-orange-700">role:Button &amp;&amp; name:Save</code> is resolved locally by the MCP server against the live UIA tree on Windows or AX tree on macOS, in microseconds, without the model in the loop.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Wire it up in one command</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator publishes its MCP server on npm as <code className="rounded bg-orange-50 px-1 text-orange-700">terminator-mcp-agent</code>. The Claude Code, Cursor, and Windsurf clients all support the same registration command.
          </p>
          <div className="mt-6">
            <TerminalOutput title="Terminator MCP install" lines={installLines} />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            After registration, Opus 4.7 sees the 35 tools as ordinary tool definitions. There is no special prompting required. The model picks the tool whose schema matches the task; the server resolves selectors and runs the action; the result comes back as structured JSON that Opus reads on its next turn.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">The execute_sequence shape</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Of the 35 tools in the MCP server, one is the reason Opus 4.7's "fewer tool calls" default becomes an advantage rather than a problem. <code className="rounded bg-orange-50 px-1 text-orange-700">execute_sequence</code>, defined at <code className="rounded bg-orange-50 px-1 text-orange-700">crates/terminator-mcp-agent/src/server.rs:7549</code>, accepts a whole typed workflow inside a single tool call: variables, named selectors, an ordered list of steps, retries per step, fallback branches via <code className="rounded bg-orange-50 px-1 text-orange-700">fallback_id</code>, conditional <code className="rounded bg-orange-50 px-1 text-orange-700">jumps</code> based on prior step status, and an optional output parser written as JavaScript.
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{sequenceCall}
          </pre>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            One model inference. The server walks the steps. If <code className="rounded bg-orange-50 px-1 text-orange-700">type_into_element</code> fails twice, the engine jumps to <code className="rounded bg-orange-50 px-1 text-orange-700">recover_focus</code> in the troubleshooting block and retries. The model only re-enters the loop when the whole sequence finishes or hits an unrecoverable state.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">What that looks like as a sequence</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The contrast with the per-click loop is sharpest when you draw it.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="One workflow, one model turn"
              actors={sequenceActors}
              messages={sequenceMessages}
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">When to still use the screenshot path</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Path B is not a moral position. There are real cases where Path A wins. Custom-rendered Electron surfaces, canvas-heavy editors, and games expose almost nothing useful through accessibility APIs; their entire UI is a single opaque element with no labels. Opus 4.7's higher-resolution input and 1:1 coordinates are exactly what you want there. Terminator includes <code className="rounded bg-orange-50 px-1 text-orange-700">capture_screenshot</code> as one of its 35 tools precisely so Opus 4.7 can fall back to vision when the tree is empty.
          </p>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            The healthy split: use <code className="rounded bg-orange-50 px-1 text-orange-700">validate_element</code> to check whether the accessibility tree exposes what you need. If yes, structural tools. If no, screenshot plus 1:1 click. Opus 4.7 is good enough at routing this decision that you can leave it to the model rather than hardcoding the split.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Numbers that fit on one row</h2>
          <div className="mt-6">
            <MetricsRow metrics={metrics} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">A practical recipe</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you are starting today, the configuration that gets the most out of Opus 4.7 looks like this. Run the model at <strong>xhigh</strong> effort for the agentic outer loop, since Anthropic explicitly recommends xhigh for coding and agent work and you want the model to reason hard before dispatching a workflow. Register Terminator's MCP server as the single source of desktop tools. Lean on <code className="rounded bg-orange-50 px-1 text-orange-700">execute_sequence</code> for any task that has more than two structural steps; reserve direct per-tool calls for short interactive sessions and recovery paths. Keep the <code className="rounded bg-orange-50 px-1 text-orange-700">computer</code> tool available as an escape hatch for surfaces with no accessibility metadata.
          </p>
          <p className="mt-3 text-zinc-700 leading-relaxed">
            The mental model: Opus 4.7 is the planner; Terminator is the operator. The model reasons, compiles a workflow, and steps back. The MCP server runs the workflow. Failures bounce back to the model only when the troubleshooting branch cannot recover. That is the agent shape Opus 4.7's defaults were tuned for.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Pairing Opus 4.7 with desktop automation in production?"
          description="Bring your workflow. We will sketch the execute_sequence shape, the fallback branches, and where the screenshot escape hatch belongs."
        />

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">FAQ</h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <section className="mt-12">
          <RelatedPostsGrid title="Keep reading" posts={relatedPosts} />
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Talk to us about Opus 4.7 and desktop automation."
      />
    </article>
  );
}
