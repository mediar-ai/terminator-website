import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  AnimatedChecklist,
  MetricsRow,
  ProofBanner,
  FlowDiagram,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/ai-agent-computer-use-reliability";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-18";
const TITLE =
  "AI agent computer use reliability: push retries into the tool schema, not into the prompt";
const DESCRIPTION =
  "Most computer-use stacks expose action verbs only (click, type, screenshot). The model has to write retry and verification logic in its own chain of thought, every call. Terminator's MCP tool schema declares retries, verify_element_exists, verify_element_not_exists, alternative_selectors, fallback_selectors, and fallback_id as first-class fields on every action. The retry-and-verify loop runs in Rust with a 250ms backoff. The model spends tokens on planning, not on control flow.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Reliability for computer-use agents is a tool-schema problem, not a prompt problem. Anthropic computer_20251124 ships 6 schema fields, zero about correctness. Terminator's MCP ships 7 reliability primitives baked in.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI agent computer use reliability: stop putting retries in the prompt",
    description:
      "Compound the math at the agent loop: 95% step accuracy across 20 steps lands at 36% end-to-end. Move retries and post-action verification into the tool's JSON schema and the executor handles the recovery in microseconds, not model tokens.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "AI agent computer use reliability" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "AI agent computer use reliability", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the single biggest cause of computer-use agent failure in production?",
    a: "Step accuracy compounds. A 95% accurate step across a 20-step real workflow lands at 0.95^20 = 36% end-to-end success. The popular computer-use tools (Anthropic computer_20251124, OpenAI CUA, Gemini Computer Use) ship action verbs only: screenshot, click, type, key, mouse_move, scroll. The model is supposed to compose retry and verification logic in its own chain of thought, on every step. That works on benchmarks where the model is fresh, the context is short, and OSWorld's harness gives it a stable VM. It does not survive real desktop sessions where the same model has to remember to verify each click on hour two of an agent loop. The fix is to push the retry-and-verify into the tool's JSON schema so the executor enforces those semantics on every call without burning model tokens.",
  },
  {
    q: "How does Terminator put reliability into the tool schema?",
    a: "Every action tool exposed by Terminator's MCP server (click_element, type_into_element, press_key, scroll_element, select_option, invoke_element, activate_element, open_application, navigate_browser, and others) flattens an ActionOptions struct into its parameter set. That struct lives at crates/terminator-mcp-agent/src/utils.rs lines 216 to 239 and declares four fields: retries (Option<u32>), verify_element_exists (String), verify_element_not_exists (String), and verify_timeout_ms (Option<u64>, default 2000). The MCP server's executor runs the retry loop in Rust with a 250ms sleep between attempts; the post-action verification polls UIA or AX until the predicate holds or the timeout fires. The agent's tool call just says retries: 3, verify_element_exists: 'role:Document'. The model never writes a try/catch.",
  },
  {
    q: "What's the difference between alternative_selectors and fallback_selectors?",
    a: "Alternatives race in parallel; fallbacks run sequentially after the primary times out. Both live in SelectorOptions at utils.rs lines 141 to 169. alternative_selectors fires every selector at once and the first match wins; useful when the same element might be addressable by role:Button|name:Save or role:Button|automationid:btnSave depending on app version. fallback_selectors is sequential, attempted only after the primary times out; useful when the cheap selector fails and you want to fall through to a more expensive one (a regex name match, a deeper window walk). Combine them: primary tries the fast path, alternatives race a couple of variants, fallbacks pick up legacy classnames.",
  },
  {
    q: "What is fallback_id for, and how is it different from retries?",
    a: "retries handles transient failure of a single step (UI was busy, element appeared 200ms late, the click landed before the listener attached). fallback_id, defined on SequenceStep at utils.rs line 1485, handles permanent failure: when retries are exhausted, the workflow jumps to a named recovery step instead of stopping. You declare a troubleshooting block of steps (utils.rs:1517) and point your action's fallback_id at one of them. Example: if 'click_save' fails after 3 retries, jump to 'fallback_id: dismiss_unsaved_changes' which closes any blocking modal and falls back through to 'click_save' a final time. The whole graph is encoded as JSON; the model writes the happy path and names the recovery handlers.",
  },
  {
    q: "Why not just ask the model to verify each step itself?",
    a: "You can. Anthropic's own computer-use docs recommend prompting the model with 'After each step, take a screenshot and carefully evaluate if you have achieved the right outcome.' Two costs. First, every verification is a full agent turn: screenshot, encode to PNG, ship to the model, wait for the analysis, parse the response. That is roughly one to two seconds and 1,000 to 1,800 input tokens per check. Second, the model can drift. Long agent loops accumulate state; under context pressure, verification gets skipped, hallucinated, or papered over. The Rust executor doesn't drift. It polls UIA or AX until the predicate is true or the timeout fires; cost is microseconds; cost in tokens is zero.",
  },
  {
    q: "How is this different from a wrapper that adds retries to the Anthropic tool?",
    a: "A wrapper retries the same action with the same coordinates. If the model picked (412, 38) because it misread the screenshot, retrying (412, 38) three times does nothing useful. Terminator's retry runs find_and_execute_with_retry (utils.rs:2521), which re-resolves the selector from the live accessibility tree on every attempt. If the dialog moved 20 pixels between attempts, the selector still binds to the right element because role:Button|name:Save is a structural address, not a coordinate. The retry actually has a chance of working because the inputs change every time the tree is re-walked.",
  },
  {
    q: "Does verify_element_exists work for the negative case (modal should have closed)?",
    a: "verify_element_not_exists is the second of the two verification fields. Same polling behavior; the executor waits until the matching element is gone from the tree or until verify_timeout_ms fires. Useful pattern: click 'Save', then verify_element_not_exists: 'role:Dialog|name:Save As' to confirm the modal closed. If the action ran but the dialog stayed up (because Save was greyed out, because the form was invalid, because focus was on the wrong control), the tool returns an error instead of pretending success. The next step never runs on the assumption that the dialog is gone when it's still up.",
  },
  {
    q: "Where does the retry sleep timing come from?",
    a: "find_and_execute_with_retry in crates/terminator-mcp-agent/src/utils.rs at line 2521 sleeps Duration::from_millis(250) between attempts. That number balances two things: long enough that an app under transient load has time to recover (typical UI redraw budget is one frame at 16ms, but post-click handlers can run 100 to 200ms), short enough that 3 retries finishes inside a second. There's also find_element_with_fallbacks ahead of it which has its own timeout per selector, so a primary that times out at 1000ms then a fallback that times out at 1000ms then 250ms sleep then another attempt all adds up to a worst-case budget of a few seconds for a 3-retry step. That's tight enough not to drag on long workflows and loose enough to absorb realistic UI flake.",
  },
  {
    q: "What about visual tasks where there is no accessibility tree (games, custom Canvas widgets, image editors)?",
    a: "The tree-walking approach has a real ceiling. If the target element doesn't publish AX or UIA properties (custom-rendered Canvas, WebGL, native game engines, raster image regions in Photoshop), no selector resolves. Terminator's MCP exposes capture_screenshot and gemini_computer_use tools for exactly those cases; the pixel loop is still available when you need it. The bet is that 95% of the desktop apps a production agent has to drive (Excel, Outlook, Chrome, Slack, SAP, Salesforce, CRMs, banking portals, IDEs) do publish a tree, and the reliability primitives on the tree-walking side make those 95% dramatically more boring to automate. The remaining 5% can fall back to vision when they have to.",
  },
  {
    q: "How do I add Terminator to an existing computer-use agent loop?",
    a: "Install the MCP server once: claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. Or in Cursor/VS Code/Windsurf settings, point at the same npx command. The MCP server registers 35-odd tools, each of which already accepts retries, verify_element_exists, and the selector redundancy fields. Your agent gets those primitives by tool description; the model picks them up the next time it inspects the tool schema. If you've got an agent harness today that uses Anthropic's computer_20251124, keep it for the screenshot fallback; route the structural calls (open app, click button by name, type into named field, verify state) through Terminator's MCP tools and watch your retry-loop tokens drop.",
  },
];

const compoundMetrics = [
  {
    value: 95,
    suffix: "%",
    label: "step accuracy (1 step)",
  },
  {
    value: 77,
    suffix: "%",
    label: "after 5 steps (0.95^5)",
  },
  {
    value: 60,
    suffix: "%",
    label: "after 10 steps (0.95^10)",
  },
  {
    value: 36,
    suffix: "%",
    label: "after 20 steps (0.95^20)",
  },
];

const primitiveList = [
  {
    text: "retries: u32 — retry the entire find-and-act sequence with a 250ms sleep between attempts (utils.rs:2521)",
  },
  {
    text: "verify_element_exists: string — poll the tree until this selector resolves or the timeout fires; fail the action if it never does",
  },
  {
    text: "verify_element_not_exists: string — poll the tree until this selector is gone (modal closed, spinner finished, button greyed out)",
  },
  {
    text: "verify_timeout_ms: u64 — polling budget for either verification, defaults to 2000ms (utils.rs:238)",
  },
  {
    text: "alternative_selectors: string — race a comma-separated list in parallel, first match wins (utils.rs:163)",
  },
  {
    text: "fallback_selectors: string — sequential list tried only after the primary plus alternatives all time out (utils.rs:168)",
  },
  {
    text: "fallback_id: string — workflow-level jump target when retries are exhausted, pointing at a named troubleshooting step (utils.rs:1485)",
  },
];

const retryFlowSteps = [
  {
    label: "Tool call arrives",
    detail: "click_element with retries=3, verify_element_exists",
  },
  {
    label: "Find element",
    detail: "primary selector + alternatives race; fallbacks if both time out",
  },
  {
    label: "Invoke action",
    detail: "UIInvokePattern.invoke() inside the target process",
  },
  {
    label: "Verify state",
    detail: "poll until selector exists/missing, or timeout",
  },
  {
    label: "Return to model",
    detail: "single result, success or error; no inner loop visible",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Everyday computer-use modal failure: the OS already labels modals, vision agents don't read the label",
    href: "/t/computer-use-everyday-flow-modal-failure",
    excerpt:
      "The single most common pixel-loop failure mode is the boring save prompt. The OS marks it as modal via UIA IsDialog; a tree-walking agent reads the bit and dismisses it.",
    tag: "Failure mode",
  },
  {
    title: "Computer use agent state tracking",
    href: "/t/computer-use-agent-state-tracking",
    excerpt:
      "What an agent should remember about the screen between steps, and how the accessibility tree is a better state vehicle than a screenshot history.",
    tag: "Architecture",
  },
  {
    title: "Claude computer use: the pixel-coordinate loop and the selector alternative",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer-use tool sends a screenshot per click. Terminator's MCP lets Claude click by role and name resolved against the live UIA tree.",
    tag: "Comparison",
  },
  {
    title: "Accessibility tree vs PyAutoGUI: two clicks, two operations, two failure modes",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Pattern invoke() runs inside the target process. SendInput synthesizes HID events. The difference shows up the first time the foreground app loses focus.",
    tag: "Internals",
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
            <span>reliability is a schema problem</span>
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Computer-use agent reliability lives in the tool schema, not the prompt.
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            The default computer-use tools ship action verbs and call it a day:
            click, type, screenshot, scroll. Every retry, every post-action
            check, every recovery path is something the model has to compose in
            its own chain of thought, every loop, on every call. That works on
            short benchmarks. It collapses on hour-two production sessions.
          </p>

          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            The fix is not a smarter model. It is a richer tool contract. Push
            the retry-and-verify into the JSON schema and the executor takes
            care of it in microseconds, not model tokens.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              retries
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              verify_element_exists
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              fallback_id
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <section className="max-w-3xl mx-auto px-6 mt-10">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 md:p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
              Direct answer (verified 2026-05-18)
            </p>
            <p className="text-lg text-zinc-900 leading-relaxed">
              Computer-use agents get reliable when retries, post-action
              verification, alternative selectors, and recovery branches move
              out of the agent&apos;s prompt and into the tool&apos;s JSON
              schema. The executor enforces those semantics on every call. The
              model spends its inference budget on planning, not on writing
              try/catch logic it&apos;s going to drift away from on turn 47.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Verified against Anthropic&apos;s{" "}
              <a
                href="https://platform.claude.com/docs/en/docs/agents-and-tools/tool-use/computer-use-tool"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                Computer Use Tool documentation
              </a>{" "}
              for the computer_20251124 schema, and against Terminator&apos;s
              MCP source at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                crates/terminator-mcp-agent/src/utils.rs
              </a>{" "}
              for the ActionOptions and SelectorOptions structs.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The compounding math is why most agents look fine in a demo and lose at work.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pick a step accuracy you&apos;re proud of, say 95%. Now imagine a
            real workflow: open Outlook, find the email, copy a value, switch
            to the CRM tab, open a record, paste the value into the right
            field, save, verify the toast. That is twenty distinct steps if you
            count each click and each menu open. 0.95 to the 20th power lands
            at about 36% end-to-end. A workflow with thirty steps lands at 22%.
            A demo with five steps lands at 77% and looks impressive, which is
            why the demos always have exactly five steps.
          </p>

          <MetricsRow metrics={compoundMetrics} />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            You can&apos;t train your way out of this curve. You can drag the
            step-level number up a few points with a bigger model or better
            prompting, but the exponent is unforgiving. The only mathematically
            honest move is to drop the failure rate per step so close to zero
            that the compounding stops hurting. That happens when each step
            retries on its own, verifies its own postcondition, and can fall
            back to a recovery step on a permanent fault, with all three
            handled by the runtime instead of the model.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What every popular computer-use tool actually exposes.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read the schemas. Anthropic&apos;s computer_20251124 tool ships six
            top-level parameters total: type, name, display_width_px,
            display_height_px, display_number, and enable_zoom. The actions
            inside (screenshot, left_click, type, scroll, zoom) take
            coordinates, text, or amounts. None of them take retries. None of
            them take a post-action verification predicate. The same shape
            holds for OpenAI&apos;s CUA and Gemini&apos;s Computer Use: action
            verb plus parameters, return raw outcome, you figure out what to do
            with it.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The official advice is to bandage this in the prompt. From
            Anthropic&apos;s docs, verbatim:{" "}
            <span className="italic text-zinc-900">
              &ldquo;After each step, take a screenshot and carefully evaluate
              if you have achieved the right outcome. Explicitly show your
              thinking: &lsquo;I have evaluated step X...&rsquo; If not correct,
              try again. Only when you confirm a step was executed correctly
              should you move on to the next one.&rdquo;
            </span>{" "}
            That works. It also costs roughly 1,000 to 1,800 input tokens per
            screenshot per check, plus the model latency, plus the drift risk
            of asking the model to be its own self-supervisor for hundreds of
            turns.
          </p>

          <BeforeAfter
            title="Schema field count for reliability concerns"
            before={{
              label: "Anthropic computer_20251124",
              content:
                "Six top-level fields: type, name, display_width_px, display_height_px, display_number, enable_zoom. Three of them are display geometry. One is a feature flag (enable_zoom). None of them are about post-action correctness. The agent's tool call carries only the action and parameters; the retry/verify policy lives, if anywhere, in the system prompt or a wrapper layer your team writes.",
              highlights: [
                "0 schema fields for retries",
                "0 schema fields for post-action verification",
                "0 schema fields for selector redundancy",
                "reliability discipline is a prompting concern",
              ],
            }}
            after={{
              label: "Terminator MCP click_element",
              content:
                "Action-specific args plus a flattened ActionOptions struct (utils.rs:216-239) carrying retries, verify_element_exists, verify_element_not_exists, verify_timeout_ms, plus a flattened SelectorOptions struct (utils.rs:141-169) carrying alternative_selectors and fallback_selectors. Workflow steps add fallback_id (utils.rs:1485) for jump-to-recovery on permanent failure. The Rust executor at find_and_execute_with_retry (utils.rs:2521) implements the retry loop with a 250ms backoff and re-resolves the selector against a fresh tree on each attempt.",
              highlights: [
                "retries with 250ms backoff, in Rust",
                "verify_element_exists and _not_exists with poll-until-timeout",
                "alternative_selectors race, fallback_selectors run serially",
                "fallback_id jumps to a named troubleshooting step",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The seven primitives.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            These are the fields every action tool in Terminator&apos;s MCP
            server inherits, by serde flatten. The agent doesn&apos;t write the
            retry loop. The agent fills in the schema fields and the executor
            does the work.
          </p>

          <AnimatedChecklist
            title="What lands on every action tool, for free"
            items={primitiveList}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two of these (retries, verify_*) live in the ActionOptions struct
            and apply to the action call itself. Two (alternative_selectors,
            fallback_selectors) live in SelectorOptions and apply to element
            lookup. One (fallback_id) lives on the workflow step and applies
            after retries are exhausted. The point is that all seven of them
            are static metadata on the tool call, declared by the model once,
            executed by Rust forever.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What a tool call actually looks like.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is one tool call from an agent driving Outlook to find an
            email, click the Reply button, and confirm the compose pane opened.
            One JSON object. The retries, the verification, and the selector
            redundancy are declarative; nothing in the agent&apos;s outer loop
            has to know they exist.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>terminator-mcp click_element call</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`{
  "name": "click_element",
  "arguments": {
    "process": "outlook",
    "selector": "role:Button|name:Reply",
    "alternative_selectors": "role:Button|name:Reply All, role:Button|automationid:btnReply",
    "fallback_selectors": "role:MenuItem|name:Reply",

    "retries": 3,
    "verify_element_exists": "role:Document|name:Message",
    "verify_timeout_ms": 3000,

    "highlight_before_action": false
  }
}`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Compare to the equivalent inside an Anthropic computer-use loop:
            the model would have to emit a click at some (x, y), screenshot,
            re-evaluate, decide if it landed, possibly retry by picking new
            coordinates, possibly verify by looking at the new screenshot. That
            sequence is at least three round-trips to the API and a few
            thousand tokens, every time. The Terminator version is one call,
            one return, zero screenshots.
          </p>

          <FlowDiagram
            title="What the Rust executor does on one call"
            steps={retryFlowSteps}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why a retry in the runtime is not the same as a retry in the prompt.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The obvious objection: a smart agent could just retry on its own.
            Yes, and that retry has three problems a Rust retry doesn&apos;t.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            First, the model retries the same action. If the agent picked
            coordinates (412, 38) because it misread the screenshot, retrying
            (412, 38) three times achieves nothing. Terminator&apos;s retry
            (utils.rs:2521) re-runs find_element_with_fallbacks on every
            attempt. The selector role:Button|name:Save resolves against a
            fresh UIA tree each time. If the button moved 40 pixels between
            attempt one and attempt two, the structural address still binds to
            the right element. The retry has real new information on each run.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Second, the model retries in tokens. A single retry inside an
            Anthropic computer-use loop is a fresh screenshot (1000 to 1800
            tokens) plus the model&apos;s reasoning tokens plus the next tool
            call. Three retries is around 6,000 tokens of context burn. The
            Rust retry costs micro-CPU and a 250ms sleep; tokens spent: zero.
            On a long agent loop, this is the difference between fitting in
            200K of context with room to plan and running out of room after the
            tenth flaky modal.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Third, the model drifts. Long agent loops accumulate state. Under
            context pressure, the model can quietly stop running the
            verification step the system prompt asked for, especially if a few
            recent verifications all came back true. The Rust executor does
            not drift. It runs the same code on turn 1 and turn 470.
          </p>

          <ProofBanner
            quote="Even if an agent were 85% reliable at each step, a 10-step workflow would succeed end-to-end only about 20% of the time."
            source="2026 industry analysis on agent reliability"
            metric="20%"
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            That number comes up because every external review of agent
            reliability lands on the same exponent problem. The pages that
            currently dominate this topic frame the answer as either &ldquo;a
            better model&rdquo; or &ldquo;a state-machine orchestration
            layer&rdquo;. Both can help. Neither addresses the cheapest move:
            push retry and verify into the tool boundary, so step accuracy
            stops looking like 95% and starts looking like 99.5%, and the
            compounding starts working for you instead of against you.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Where this approach has limits, and what falls back to vision.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The tree-walking approach has a real ceiling. If the target
            element doesn&apos;t publish UIA on Windows or AX on macOS, no
            selector resolves. Canvas-rendered widgets, WebGL games, raster
            regions in Photoshop, custom-drawn IDE panels: those need a vision
            tool. Terminator&apos;s MCP exposes a capture_screenshot tool and a
            gemini_computer_use tool for those cases, so the agent has both
            shapes available in the same harness.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The split that works in practice is: structural calls for anything
            that publishes a tree, vision for anything that doesn&apos;t. About
            95% of the desktop apps an enterprise agent has to drive (Outlook,
            Excel, Chrome, Slack, Salesforce, SAP, CRMs, banking portals,
            IDEs, the OS itself) publish a tree. The reliability primitives
            apply to those calls. The 5% that doesn&apos;t can degrade to
            vision when it has to. Keeping both routes in one MCP server keeps
            the agent&apos;s tool surface coherent.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            One install.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP server is one command. Run it once and every Claude Code,
            Cursor, VS Code, or Windsurf agent on the same machine inherits
            the seven primitives.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>install Terminator MCP</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`claude mcp add terminator 'npx -y terminator-mcp-agent@latest'`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP server is published as{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              terminator-mcp-agent
            </code>{" "}
            on npm, the core crate as{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              terminator-rs
            </code>{" "}
            on crates.io. The source lives at{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-700 underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
            >
              github.com/mediar-ai/terminator
            </a>
            . Open{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs"
              className="text-orange-700 underline hover:no-underline"
              target="_blank"
              rel="noreferrer"
            >
              utils.rs
            </a>{" "}
            and grep for ActionOptions; the four reliability fields are right
            there. Open server.rs and search for retries; the executor wires
            them in at lines 2170, 2324, 2829, and 3170. Nothing about the
            design is hidden behind a paid tier.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16 mb-6">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            section="ai-agent-reliability-footer"
            heading="Move retry and verify out of your prompt."
            description="If you're running a Claude, Cursor, or in-house computer-use loop and watching the compound failure curve eat your end-to-end accuracy, bring a target workflow. We'll walk through where retries, verify_element_exists, and fallback_id slot into your existing harness."
          />
        </section>

        <FaqSection items={faqs} />

        <section className="max-w-3xl mx-auto px-6 my-12">
          <RelatedPostsGrid
            title="Adjacent reading"
            subtitle="On the same shape"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING_URL}
          site="Terminator"
          section="ai-agent-reliability-sticky"
          description="Computer-use loop dropping steps in production? Talk it through."
        />
      </article>
    </>
  );
}
