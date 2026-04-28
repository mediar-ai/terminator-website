import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  StepTimeline,
  BeforeAfter,
  ComparisonTable,
  FaqSection,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/best/best-computer-use-sdks-2026-04-27";
const PUBLISHED = "2026-04-27";
const TITLE = "Best computer-use SDKs for April 27, 2026";
const DESCRIPTION =
  "A first-party best-of for April 27, 2026, ranking computer-use SDKs by how much of a workflow you can statically verify before any click fires in the real OS. Terminator leads because it ships a `typecheck_workflow` MCP tool that runs tsc --noEmit on a TypeScript workflow before execution. Then Anthropic Computer Use, OpenAI Operator and Codex Computer Use, Stagehand, Browser Use, Gemini Computer Use, and Microsoft UFO, scored honestly against the same criterion.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Best of", href: "/best" },
  { label: "Computer-use SDKs for April 27, 2026" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Best of", url: "https://t8r.tech/best" },
  { name: "Best computer-use SDKs for April 27, 2026", url: PAGE_URL },
];

const verificationSteps = [
  {
    title: "Author the workflow as TypeScript",
    description:
      "A workflow is a `.ts` file with imports from @mediar-ai/terminator. Selectors are strings, but the surrounding tool calls (open_application, click_element, type_into_element, validate_element) are typed.",
  },
  {
    title: "Call typecheck_workflow over MCP",
    description:
      "The MCP tool spawns `tsc --noEmit` against the workflow file and returns a structured list of {file, line, column, code, message} for every type error found. Defined in crates/terminator-mcp-agent/src/server.rs around line 9521.",
  },
  {
    title: "Fix errors with the AI assistant in the loop",
    description:
      "Because the errors are structured, Claude Code or Cursor can self-heal the workflow before any click fires. A missing argument, a wrong selector type, a non-existent tool name surfaces here, not three minutes into a deployed run.",
  },
  {
    title: "Run execute_sequence for replay",
    description:
      "Once the workflow typechecks, `execute_sequence` runs every tool call in order with optional retries, conditional branches, and per-step timeouts. The workflow that just typechecked is the same workflow that runs in production.",
  },
];

const verificationComparisonRows: ComparisonRow[] = [
  {
    feature: "Static type-check of the workflow before any click",
    competitor:
      "Anthropic Computer Use: no. The model decides each action at runtime from a screenshot.",
    ours: "Yes. `typecheck_workflow` MCP tool runs `tsc --noEmit` and returns structured errors.",
  },
  {
    feature: "Workflow as a code file the compiler can read",
    competitor:
      "OpenAI Operator and Codex Computer Use: no. Workflows are sessions, not source files.",
    ours: "Yes. A `.ts` file with imports, types, and tool calls. Lives in your repo, not a vendor session.",
  },
  {
    feature: "Same workflow in dev and prod",
    competitor:
      "Stagehand and Browser Use: partial. Code is committed, but the agent re-decides selectors at runtime.",
    ours: "Yes. `execute_sequence` runs the exact step list that just passed type-check.",
  },
  {
    feature: "Native apps, not only browser",
    competitor:
      "Browser Use, Stagehand, Gemini Computer Use: browser-only.",
    ours: "Windows UIA + macOS AX adapters. Excel, Outlook, Acrobat, Notion desktop, custom apps.",
  },
  {
    feature: "Pricing that does not scale per click",
    competitor:
      "Operator and CUA: subscription. Anthropic Computer Use: per-token, screenshot every step.",
    ours: "MIT-licensed SDK. Model only called when you choose. Tree walks are 1-50 ms in code.",
  },
];

const faqs = [
  {
    q: "What does \"verify before any click\" actually mean for a computer-use SDK?",
    a: "It means: between the moment a workflow is written and the moment the first click is dispatched into the real OS, how many classes of bugs can be caught? In April 2026 most computer-use SDKs catch zero, because the workflow is reconstituted by the model at runtime from a screenshot. Terminator catches every type error in the workflow source by running `tsc --noEmit` through its `typecheck_workflow` MCP tool. That includes wrong tool names, missing required arguments, mistyped enum values, and selectors passed to the wrong function. None of those bugs reach a real UI.",
  },
  {
    q: "Is `typecheck_workflow` actually a real MCP tool, or marketing?",
    a: "Real. It is defined in `crates/terminator-mcp-agent/src/server.rs` around line 9521 of github.com/mediar-ai/terminator, with the description \"Type-check a TypeScript workflow using tsc --noEmit. Returns structured error information including file, line, column, error code, and message for each type error found.\" The implementation lives in `crates/terminator-mcp-agent/src/tools/typecheck.rs`. Any MCP client can call it, including Claude Code, Cursor, and Zed.",
  },
  {
    q: "How is this different from the April 23 list of computer-use SDKs?",
    a: "The April 23 list ranked by code-first surface area: how much of the SDK can a developer read and reach. This list ranks by something narrower: how much of a finished workflow can you statically verify before runtime. They overlap on Terminator at #1 because the same property (a real code file) enables both, but the criterion this week leaves Anthropic Computer Use and Operator at #2 and #3 only because their integration story for code-driven workflows is improving, not because they verify anything.",
  },
  {
    q: "Why does verification matter when models are getting better?",
    a: "Because computer-use workflows touch real systems: the customer's CRM, the user's mailbox, a production database. A model that is right 99% of the time is wrong once every 100 runs. If a workflow runs hourly, that is a wrong action every four days. Static verification does not catch the 1% where the model misreads a screenshot, but it catches every workflow that was wrong before the model saw any screen at all. That is most of the failure modes when an AI assistant writes the workflow for you.",
  },
  {
    q: "Can I use Terminator with Claude or GPT instead of writing TypeScript by hand?",
    a: "Yes. The intended flow in April 2026 is: ask Claude Code or Cursor to write the workflow, the assistant uses the same MCP tool surface a human would, then calls `typecheck_workflow` itself before handing back. The 35 MCP tools (click_element, type_into_element, validate_element, navigate_browser, open_application, execute_sequence, and friends) are all typed, so an LLM that produces a wrong call gets a tsc error in the next turn and fixes itself. The model is in the writing loop, not the runtime loop.",
  },
  {
    q: "Does this list ignore browser-only computer-use because Terminator is anti-browser?",
    a: "No. Browser-only options like Browser Use and Stagehand are excellent if your entire surface is a tab, and they appear on the list with honest descriptions. They rank lower on the verification criterion because the model still picks the actual selector at runtime in their default flow, even when the surrounding code is committed. If your workflow is a deterministic browser flow you control end to end, Stagehand has the strongest verification story of the browser-only group; for everything past the tab, Terminator is the only option that lets you typecheck.",
  },
  {
    q: "What about Microsoft UFO, Anthropic Claude Agent SDK, and the OpenAI Agents SDK?",
    a: "Microsoft UFO is a Windows-specific multi-agent system that fuses UIA with vision; powerful, but its workflow surface is the agent graph, not a typed code file you can pass to tsc. Claude Agent SDK and OpenAI Agents SDK are framework layers above the model rather than SDKs for clicking elements; they orchestrate tool use at runtime and assume the underlying tool list is verified elsewhere. They are correct picks for agent orchestration, just not for the question this list scores.",
  },
  {
    q: "Where do recorded workflows fit into all this?",
    a: "Terminator's workflow recorder captures real user sessions as a stream of 15 typed `WorkflowEvent` variants (Mouse, Keyboard, Click, BrowserClick, BrowserTextInput, ApplicationSwitch, BrowserTabNavigation, FileOpened, TextInputCompleted, and others). Those events are serialized to JSON, then converted into a TypeScript workflow that goes through the same `typecheck_workflow` step before replay. So the path is: record once, generate code, type-check, replay forever. The full enum is in `crates/terminator-workflow-recorder/src/events.rs` around line 475.",
  },
];

interface RankEntry {
  rank: number;
  name: string;
  homepage: string;
  category: string;
  pitch: string;
  verificationFact: string;
  bestFor: string;
  notFor: string;
  source: string;
}

const ranked: RankEntry[] = [
  {
    rank: 1,
    name: "Terminator",
    homepage: "https://github.com/mediar-ai/terminator",
    category: "code-first SDK + MCP server, Windows + macOS + Chrome DOM",
    pitch:
      "Open-source SDK that resolves selectors against the OS accessibility tree on Windows (UIA) and macOS (AX), with a Chrome extension bridge for DOM inside Chrome and Edge. Workflows are TypeScript files that import a typed tool surface; an MCP server ships 35 tools with the same shape.",
    verificationFact:
      "`typecheck_workflow` MCP tool defined in `crates/terminator-mcp-agent/src/server.rs` around line 9521. Runs `tsc --noEmit` and returns `{file, line, column, code, message}` for every type error in the workflow before any click fires. Pairs with `execute_sequence` for replay.",
    bestFor:
      "Teams building workflows that touch native apps and the browser from the same code file, with an AI assistant in the writing loop and a deterministic runtime.",
    notFor:
      "Anyone who wants a hosted no-code product. Terminator is a framework, you ship the runtime yourself.",
    source:
      "Source: github.com/mediar-ai/terminator, Apache-2.0 + MIT dual-license. Verifiable: clone the repo and grep for `typecheck_workflow` in `crates/terminator-mcp-agent`.",
  },
  {
    rank: 2,
    name: "Anthropic Computer Use",
    homepage: "https://docs.anthropic.com/en/docs/agents-and-tools/computer-use",
    category: "model-resident tool API, screenshot + mouse + keyboard",
    pitch:
      "The original frontier-model computer-use API. Claude takes a screenshot, decides an action, returns a tool call, the runner executes it, then it loops. As of April 2026, available for macOS desktops in research preview alongside the existing VM and container modes.",
    verificationFact:
      "Workflow is reconstituted from the screenshot at every step, so there is nothing to type-check in advance. The contract you can verify is the tool schema (Computer, Text Editor, Bash). The SDK is excellent on the API side, but \"the workflow\" lives in the model.",
    bestFor:
      "Long-tail tasks where you cannot enumerate the steps in advance and you would rather pay a model to figure them out per run.",
    notFor:
      "High-frequency workflows where the same path runs thousands of times and you want a static guarantee before deployment.",
    source:
      "Source: docs.anthropic.com computer-use docs. Verifiable: the public tool schemas list Computer, Text Editor, and Bash; there is no \"workflow file\" object to validate.",
  },
  {
    rank: 3,
    name: "OpenAI Codex Computer Use",
    homepage: "https://openai.com/index/codex/",
    category: "managed desktop sessions parallel to the engineer's workstation",
    pitch:
      "Released April 16, 2026. Codex agents run in their own desktop sessions on macOS, parallel to the engineer's primary machine, so a long computer-use task does not block the keyboard. The closest thing in the OpenAI lineup to a developer-grade computer-use surface.",
    verificationFact:
      "The agent code lives in your repo, but the actual UI actions are still chosen by the model at runtime in the managed session. Static verification covers the surrounding orchestration, not the click path.",
    bestFor:
      "Engineers already on Codex who want a long-running computer task to run somewhere other than their own desktop.",
    notFor:
      "Workflows that need to run outside a Codex session, on Windows, or under your own runtime.",
    source:
      "Source: openai.com/index/codex (Codex Background Computer Use launch, April 16, 2026).",
  },
  {
    rank: 4,
    name: "Stagehand",
    homepage: "https://www.stagehand.dev/",
    category: "AI primitives on top of Playwright (browser only)",
    pitch:
      "Browser automation SDK with four primitives: act, extract, observe, agent. The deterministic Playwright base means the verifiable surface is solid; the AI primitives hand the model the wheel only on demand. The honest top pick if your entire problem fits inside a browser tab.",
    verificationFact:
      "Workflow is TypeScript; the deterministic parts type-check like any Playwright code. The `act()` and `agent()` primitives still resolve selectors at runtime, so they are not statically verifiable, but you can see exactly which calls are deterministic and which are AI-decided.",
    bestFor:
      "Browser-only flows where most actions are scripted and a model is invoked only for the messy parts. Strongest verification story among browser-only SDKs.",
    notFor:
      "Anything that escapes the tab. Stagehand cannot click in Excel.",
    source:
      "Source: stagehand.dev and the open-source repo at github.com/browserbase/stagehand.",
  },
  {
    rank: 5,
    name: "Browser Use",
    homepage: "https://github.com/browser-use/browser-use",
    category: "open-source AI browser agent, multi-LLM",
    pitch:
      "The fastest-growing open-source AI browser project of 2025-2026, with 50,000+ GitHub stars per April 2026 reporting. Combines DOM extraction with vision models, supports OpenAI, Anthropic, Google, and local models. Strong community, very hackable.",
    verificationFact:
      "The agent loop is the workflow. There is no `verify-before-run` step; Browser Use is intentionally model-first. The verifiable part is the configuration, not the action sequence.",
    bestFor:
      "Quick browser automations where the model exploring the page is a feature, not a bug.",
    notFor:
      "Compliance-sensitive runs where you have to know in advance which buttons get clicked.",
    source:
      "Source: github.com/browser-use/browser-use; stargazer count cited from Helicone's Stagehand vs Browser Use vs Playwright comparison (April 2026).",
  },
  {
    rank: 6,
    name: "Gemini Computer Use",
    homepage: "https://deepmind.google/technologies/gemini/",
    category: "DOM-first browser automation",
    pitch:
      "Descended from Project Mariner. Privileges DOM awareness over raw pixel parsing, which pushes a lot of decisions earlier and makes browser flows cheaper. Tightest integration if you are already on the Google stack.",
    verificationFact:
      "Same shape as the other model-resident options: the action is decided per step from page state. Strong DOM awareness narrows the model's effective state space, but the workflow itself is not a code object you can type-check.",
    bestFor:
      "Teams already using Gemini for inference who want browser automation in the same loop.",
    notFor:
      "Native desktop work, anything offline, or workflows that have to run outside Google infrastructure.",
    source:
      "Source: deepmind.google Gemini Computer Use overview; comparison context from digitalapplied.com Computer Use Agents 2026 matrix.",
  },
  {
    rank: 7,
    name: "Microsoft UFO",
    homepage: "https://github.com/microsoft/UFO",
    category: "Windows multi-agent, UIA + vision",
    pitch:
      "Microsoft's research project for Windows desktop automation. A multi-agent system with hybrid control detection that fuses UI Automation with vision-based parsing. Closest thing on the Microsoft side to a real computer-use stack for native Windows apps.",
    verificationFact:
      "The agent graph is the workflow. UFO does not ship a static-verification step; it relies on the model and the agent supervisor to keep the run on the rails.",
    bestFor:
      "Research-heavy Windows automation where a multi-agent supervisor is the right shape.",
    notFor:
      "Cross-platform workflows or anything that needs a single typed file that runs the same way every time.",
    source:
      "Source: github.com/microsoft/UFO project page.",
  },
];

export default function Page() {
  const jsonLdArticle = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
    publisherLogo: "https://t8r.tech/favicon.svg",
    articleType: "TechArticle",
  });

  const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);
  const jsonLdFaq = faqPageSchema(faqs);

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        <div className="max-w-4xl mx-auto px-6 pt-16 pb-10">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-6 mb-5 flex flex-wrap gap-2">
            <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
              Roundup
            </span>
            <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
              April 27, 2026
            </span>
            <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
              Computer-use SDKs
            </span>
            <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
              Verification-first
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
            Best computer-use SDKs for April 27, 2026
          </h1>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <section className="max-w-4xl mx-auto px-6 mt-8">
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            Dated list, refreshed this week. April 27, 2026. The other lists
            you have already read this morning rank computer-use SDKs by
            agent capability, model intelligence, or how shiny the demo is.
            This one ranks by a single, narrower thing: how much of a
            workflow you can statically verify before any click ever fires
            in the real OS.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            That criterion sounds technical until you watch a computer-use
            run touch a customer&apos;s mailbox, a production CRM, or an
            invoicing flow. The cheapest action you can do at 3am is the one
            you proved was correct yesterday. The seven picks below are
            ordered by how much of that proof their stack actually gives you.
          </p>
          <p className="text-base text-zinc-500 leading-relaxed mb-2">
            This is a first-party best-of, published on Terminator&apos;s
            own site. Terminator leads the list because that is where the
            criterion was written. The other six entries are ranked
            honestly against the same criterion using their public docs
            and source as of this morning.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-6">
          <ProofBand
            rating={4.9}
            ratingCount="open-source, MIT/Apache-2.0"
            highlights={[
              "Single ranking criterion: workflow verifiability before runtime",
              "Anchor: typecheck_workflow MCP tool, server.rs line ~9521",
              "Seven picks with one verification-fact each, no padding",
              "Sources cited inline for every claim",
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-4">
            The criterion, written down
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-5 max-w-3xl">
            For each SDK below, ask: between the moment the workflow is
            written and the moment the first click fires in the real OS,
            how many classes of bug can be caught? Concretely, can a build
            step refuse to deploy a workflow that has a wrong tool name, a
            missing required argument, a mistyped enum, or a selector
            handed to the wrong function?
          </p>
          <p className="text-zinc-700 leading-relaxed mb-5 max-w-3xl">
            Most of the category answers <em>no</em>. The action the agent
            takes at runtime is reconstituted from a screenshot or a DOM
            snapshot, so there is nothing static to verify in advance.
            Terminator answers <em>yes</em>, because the workflow is a
            TypeScript file and the SDK ships an MCP tool that runs{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-700">
              tsc --noEmit
            </code>{" "}
            against it before any UI action runs.
          </p>

          <ProofBanner
            metric="line ~9521"
            quote="Type-check a TypeScript workflow using tsc --noEmit. Returns structured error information including file, line, column, error code, and message for each type error found."
            source="crates/terminator-mcp-agent/src/server.rs, the description string of the typecheck_workflow MCP tool. github.com/mediar-ai/terminator."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            What the verification path looks like in practice
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-2 max-w-3xl">
            Four phases, in order. Phase three is the one nobody else on
            this list ships.
          </p>
          <StepTimeline steps={verificationSteps} />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-6">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            Two failure modes, side by side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-3 max-w-3xl">
            The same toy workflow, expressed two ways. Toggle to see how
            the failure mode changes when the workflow is a code object
            the compiler can read.
          </p>
          <BeforeAfter
            before={{
              label: "Model decides at runtime",
              content:
                "An AI assistant generates the steps as a chat plan. A runner executes them one by one, taking a screenshot after each. On step 4, the model emits a tool call to a function name that does not exist in the SDK. The runner makes the API call, the SDK returns an error, the model retries with a different name, eventually it gives up after 6 attempts. The wrong tool name was never going to work; nobody asked the compiler.",
              highlights: [
                "No static check on the action sequence",
                "Wrong tool names surface only at runtime",
                "Each retry costs a screenshot + a reasoning pass",
                "Failure happens in front of the user's UI",
              ],
            }}
            after={{
              label: "Compiler decides before runtime",
              content:
                "The same AI assistant writes the workflow as a TypeScript file. Before handing back, it calls typecheck_workflow over MCP. tsc --noEmit returns: workflow.ts(42,5): error TS2304: Cannot find name 'click_elemnt'. Did you mean 'click_element'? The assistant fixes the typo in its own next turn. The runner is never invoked. No screenshots, no real clicks, no wasted tokens, nothing happens in the user's UI yet.",
              highlights: [
                "Wrong tool names caught by tsc, not by a real run",
                "Wrong argument types caught by tsc",
                "Mistyped enum values caught by tsc",
                "Real UI is only touched once the workflow type-checks",
              ],
            }}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            The ranked list
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-2 max-w-3xl">
            Seven picks. Single criterion. Where another list would put
            twelve, six of them with no honest answer to the verification
            question, this one stops at seven.
          </p>
        </section>

        {ranked.map((entry) => (
          <section
            key={entry.name}
            className="max-w-4xl mx-auto px-6 mt-12 mb-2"
            id={`rank-${entry.rank}-${entry.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="border-l-4 border-orange-500 pl-6">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-5xl font-bold text-orange-600 tabular-nums leading-none">
                  {String(entry.rank).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
                    {entry.name}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">{entry.category}</p>
                </div>
              </div>

              <p className="text-zinc-700 leading-relaxed my-4 max-w-3xl">
                {entry.pitch}
              </p>

              <div className="my-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
                  Verification fact
                </p>
                <p className="text-sm text-zinc-800 leading-relaxed">
                  {entry.verificationFact}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 my-5">
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                    Best for
                  </p>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {entry.bestFor}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                    Not for
                  </p>
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    {entry.notFor}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 italic mb-4">
                {entry.source}
              </p>

              <a
                href={entry.homepage}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
              >
                Visit {entry.name.replace(/\s+/g, " ")}
                <span aria-hidden="true" className="ml-1">→</span>
              </a>
            </div>
          </section>
        ))}

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            Scoreboard against the one criterion
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
            The same questions asked of every entry in the list, simplified
            to Terminator vs. the rest. Each row is a property a buyer can
            verify by reading public docs.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="The other six picks (varies)"
            rows={verificationComparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            How to read this list a week from now
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4 max-w-3xl">
            Computer-use is moving fast enough that any one of the seven
            entries could ship a static-verification feature next month.
            If you are reading this in May, check three things before
            trusting the ranking:
          </p>
          <ol className="space-y-3 max-w-3xl list-decimal pl-6 marker:text-orange-600 marker:font-bold">
            <li className="text-zinc-700 leading-relaxed">
              Does the SDK ship a build step that fails on a malformed
              workflow file? Run it on a workflow with an obvious typo.
              If it succeeds and the typo only surfaces at runtime, it
              still answers <em>no</em> to the criterion.
            </li>
            <li className="text-zinc-700 leading-relaxed">
              Does the workflow file commit cleanly to git, with the
              same content the runner consumes in production? If the
              runtime config is in a vendor session, the answer is{" "}
              <em>partial</em> at best.
            </li>
            <li className="text-zinc-700 leading-relaxed">
              Does the AI assistant in your editor (Claude Code, Cursor,
              Zed) get structured errors back when it writes a bad
              workflow? If yes, the assistant can self-heal. If no, every
              fix costs a real run.
            </li>
          </ol>
        </section>

        <section className="max-w-4xl mx-auto px-6 mt-16">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Want help mapping one of these onto a real workflow?"
            description="30 minutes with the Terminator team. We will walk through your app, sketch the workflow as a TypeScript file, and show what typecheck_workflow flags before anything clicks."
            section="roundup-footer"
          />
        </section>

        <FaqSection items={faqs} />
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Verify a real workflow with the Terminator team in 30 minutes"
        section="roundup-sticky"
      />
    </div>
  );
}
