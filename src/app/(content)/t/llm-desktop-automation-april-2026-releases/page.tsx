import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  SequenceDiagram,
  BentoGrid,
  HorizontalStepper,
  AnimatedChecklist,
  IntegrationsGrid,
  ProofBanner,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type FaqItem,
  type IntegrationItem,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/llm-desktop-automation-april-2026-releases";
const PUBLISHED = "2026-05-03";
const TITLE =
  "LLM desktop automation in April 2026: every model release, plus the one-line replacement that decides whether their clicks actually land";
const DESCRIPTION =
  "April 2026 brought a wave of computer-use LLMs (Microsoft Fara-7B, Gemma 4, Manus updates, Claude Mythos preview), but the consequential change for desktop reliability shipped on April 2 in Terminator 0.24.31 (PR #473). It replaced Windows UI Automation's is_offscreen() check, which lies about elements on secondary monitors, with a manual bounds-intersection across every connected display. Every multi-monitor LLM workflow on Windows depended on it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "April 2026's headline LLM news was the model wave. The headline OS-side fact was that Windows UIA returns IsOffscreen=true for elements on secondary monitors, so any LLM driving a two-screen Windows desktop was clicking into a void. Terminator 0.24.31 replaced the check on April 2.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "LLM desktop automation in April 2026, and the multi-monitor click-validation fix nobody wrote up",
    description:
      "Microsoft UIA's IsOffscreen returns true for elements on secondary monitors. Terminator 0.24.31 replaced it with bounds-intersection across every monitor on April 2, 2026. Diff: 71 inserts, 31 deletes, in one file.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/terminator-mcp" },
  { label: "LLM desktop automation in April 2026" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t/terminator-mcp" },
  { name: "LLM desktop automation in April 2026", url: PAGE_URL },
];

const aprilModelCards: BentoCard[] = [
  {
    title: "Microsoft Fara-7B (April 19)",
    description:
      "Microsoft's first agentic small language model purpose-built for computer use. 7B parameters, state of the art in its size class, paired with the new CUAVerifierBench benchmark for verifying CUA agent traces. The point of Fara-7B is to push computer-use into the size class you can run on a workstation GPU.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Gemma 4 family",
    description:
      "Google shipped four Gemma 4 variants under Apache 2.0 in early April. The mid-size variants are competent enough at structured tool-use that the open-weights ceiling for desktop control moved up a clear notch.",
    size: "1x1",
  },
  {
    title: "Manus updates",
    description:
      "Manus continued to be the most aggressively agent-forward general assistant in April, opening browsers, terminals, and files in long autonomous loops without human turns in the middle.",
    size: "1x1",
  },
  {
    title: "Claude Mythos preview",
    description:
      "Anthropic previewed Claude Mythos to a small partner cohort in April. Public benchmarks did not land, but the partner notes describe meaningful tool-use improvements over Sonnet 4.5.",
    size: "1x1",
  },
  {
    title: "Computer use on the long tail",
    description:
      "E2B's open-computer-use, Bytebot's containerized Linux desktop agent, and Microsoft's UFO continued to ship in April. None of them are model releases; they are harnesses around the model wave above.",
    size: "1x1",
  },
];

const sequenceActors = [
  "LLM",
  "MCP server",
  "UIA",
  "Monitor 2",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "click_element role:Button name:Save",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "validate_clickable() -> is_offscreen()",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "true (bounds extend past primary)",
    type: "error" as const,
  },
  {
    from: 1,
    to: 0,
    label: "ElementNotVisible (silently dropped)",
    type: "error" as const,
  },
  {
    from: 0,
    to: 1,
    label: "After PR #473: same call",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "is_visible_on_any_monitor(x, y, w, h)",
    type: "request" as const,
  },
  {
    from: 3,
    to: 1,
    label: "true (bounds intersect Monitor 2)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "click delivered",
    type: "response" as const,
  },
];

const beforeContent =
  "validate_clickable() trusted Windows UIA's IsOffscreen() as its first gate. The Microsoft API returns true for any element whose bounds extend beyond the primary monitor's coordinate range, including elements that are entirely visible on a secondary monitor. The result on a multi-monitor Windows desktop: ElementNotVisible('Element is offscreen') for valid elements, regardless of which LLM picked the selector.";

const afterContent =
  "validate_clickable() now calls is_visible(), which fetches the element's bounds, then walks every monitor returned by xcap::Monitor::all() and tests rectangle intersection. The is_offscreen() call is deleted from both validate_clickable() and is_visible(). The same comment block is duplicated in both call sites: 'This replaces the old is_offscreen() check which incorrectly returned true for elements on secondary monitors (GitHub issue #473).'";

const fixSteps = [
  {
    title: "Drop the lying API",
    description:
      "Remove both calls to IUIAutomationElement::IsOffscreen from validate_clickable() and is_visible().",
  },
  {
    title: "Enumerate monitors",
    description:
      "Call xcap::Monitor::all() and capture each monitor's (x, y, width, height) on the virtual desktop.",
  },
  {
    title: "Test intersection per monitor",
    description:
      "For each monitor, check elem_left < monitor_right && elem_right > monitor_x && elem_top < monitor_bottom && elem_bottom > monitor_y. Return on first match.",
  },
  {
    title: "Log the monitor that won",
    description:
      "tracing::debug! prints the monitor name and bounds it intersected with, so future multi-monitor regressions are visible in the log line, not in silent click failures.",
  },
];

const checklistItems = [
  {
    text: "Clicking a button on a secondary monitor without dragging the window to the primary first.",
    checked: true,
  },
  {
    text: "Activating a window that opens on the right-hand monitor in a 2-monitor setup.",
    checked: true,
  },
  {
    text: "Typing into a text box on a vertical secondary monitor with negative y coordinates.",
    checked: true,
  },
  {
    text: "Highlighting an element on any of three or more monitors arranged left-to-right.",
    checked: true,
  },
  {
    text: "Validate-clickable still rejects elements that have zero bounds, or that genuinely sit outside every monitor (a window dragged into a virtual scroll buffer).",
    checked: true,
  },
];

const integrationItems: IntegrationItem[] = [
  {
    name: "Claude (Sonnet 4.5, Opus 4.7)",
    description:
      "Drives Terminator's MCP server through stdio. Selector strings stay symbolic so multi-monitor coordinates never reach the model.",
    initial: "C",
  },
  {
    name: "Cursor",
    description:
      "Picks up the same MCP config used in Claude Code. Same dispatch path, same fix.",
    initial: "Cu",
  },
  {
    name: "Microsoft Fara-7B",
    description:
      "April 2026's small computer-use model. Returns selector tool calls into the same validate_clickable funnel.",
    initial: "F",
  },
  {
    name: "Gemini Computer Use",
    description:
      "Vision path goes through gemini_computer_use, but the click that lands at the end is still gated by validate_clickable().",
    initial: "G",
  },
  {
    name: "Gemma 4",
    description:
      "Open-weights variants benefit from the fix as soon as you wire them into the Terminator MCP loop.",
    initial: "Ge",
  },
  {
    name: "Open Interpreter",
    description:
      "When configured with Terminator as its OS bridge, every click flows through the same gate.",
    initial: "OI",
  },
  {
    name: "Windsurf, VS Code MCP",
    description:
      "Both consume the same npm-installed terminator-mcp-agent and inherit the multi-monitor fix without code changes.",
    initial: "W",
  },
  {
    name: "Manus",
    description:
      "Long-horizon autonomous loops on multi-monitor Windows desktops were the exact shape this bug was hitting.",
    initial: "M",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What actually shipped for LLM desktop automation in April 2026?",
    a: "Two distinct things, and most writeups only cover the first. The model side: Microsoft Fara-7B (April 19) targeted a 7B agentic small language model with the CUAVerifierBench benchmark; Google released the Gemma 4 family under Apache 2.0; Anthropic previewed Claude Mythos to partners; Manus continued shipping incremental updates to its general autonomous agent. The framework side: Terminator 0.24.31 went out on April 2 with PR #473, fixing multi-monitor click validation. The first set is what every model-news roundup covered. The second is what determines whether any of those models can actually click a button on a second monitor on Windows.",
  },
  {
    q: "What was wrong with multi-monitor click validation before April 2?",
    a: "Windows UI Automation exposes a method called IsOffscreen on every UIElement. It returns true when the element is not visible. The problem is the implementation: IsOffscreen reports based on the primary monitor's bounds, not the virtual desktop. An element living entirely on a second monitor has bounds outside the primary monitor's rectangle, so IsOffscreen returns true even when the element is fully visible to the user. Terminator 0.24.30 trusted this method as the first gate in validate_clickable(), so any LLM driving a multi-monitor Windows workflow saw clicks rejected with ElementNotVisible errors on perfectly valid targets.",
  },
  {
    q: "What replaced the IsOffscreen check?",
    a: "A function called is_visible_on_any_monitor at line 316 of crates/terminator/src/platforms/windows/element.rs. It enumerates every monitor via xcap::Monitor::all(), reads each monitor's x, y, width, and height, then runs a rectangle-intersection test against the element's bounds. If the element's bounds intersect any monitor, the element is visible. The function returns Ok(true) on first match and logs which monitor it intersected with. Both validate_clickable() and is_visible() now use this helper. The old IsOffscreen calls are deleted in both places.",
  },
  {
    q: "How big is the fix?",
    a: "One file. crates/terminator/src/platforms/windows/element.rs. 71 insertions and 31 deletions. The commit hash is e36b9785, dated 2026-04-02, and it closes GitHub issue #473 (which had been opened on March 30 by a user reporting the exact symptom). Released as Terminator 0.24.31 the same day.",
  },
  {
    q: "Why does this matter for any LLM, not just one specific model?",
    a: "Because the LLM never sees the monitor coordinates. Whether the LLM is Claude, Fara-7B, Gemini, Gemma, or Manus, the model returns a selector like role:Button && name:Save. The MCP server resolves that selector to an element, then asks the OS whether it is clickable. If the OS-side answer is false because of a buggy Microsoft API, the click never fires and the LLM gets a generic 'not visible' error back. No prompt-engineering on the model side fixes that. The fix has to be in the validation layer where the OS coordinates actually live.",
  },
  {
    q: "Is the vision path (gemini_computer_use) affected the same way?",
    a: "Yes, at the tail. The vision loop returns coordinates in 0-999 normalized space, which Terminator converts to screen pixels using window offset, DPI, and resize scale. Once that conversion produces an absolute (x, y) on the virtual desktop, the click is dispatched the same way every selector-driven click is dispatched, through the same validate_clickable() gate. So a Gemini Computer Use turn that picked a coordinate on a secondary monitor was hitting the same false negative. The fix is in the shared validation code path, not in either branch.",
  },
  {
    q: "Why did this bug exist for so long?",
    a: "Two reasons. First, IsOffscreen looks like the right method. The Microsoft documentation does not advertise its primary-monitor bias; the method just says 'the element is not on the screen.' Second, the dominant computer-use development setup is a single laptop monitor, often the primary on a docking station. The bug only surfaces when you click into a secondary monitor that is geometrically outside the primary monitor's bounds. The reporter on issue #473 had a wide horizontal layout where the secondary monitor lived at negative x coordinates relative to primary; that is exactly the configuration where IsOffscreen lies most reliably.",
  },
  {
    q: "Does the fix cover macOS as well?",
    a: "macOS goes through a different code path. The Windows-specific bug was in crates/terminator/src/platforms/windows/element.rs. The macOS adapter under crates/terminator/src/platforms/macos talks to AXUIElement and uses the system's own multi-display geometry, which has not exhibited the same misreporting. If you are driving macOS apps with an LLM, you do not need this April patch; if you are driving Windows apps, you do.",
  },
  {
    q: "How do I confirm I am running the fixed version?",
    a: "Run `terminator --version` if you have the CLI installed, or check `crates/terminator-cli/Cargo.toml` for the workspace version. Anything 0.24.31 or newer has the fix. As of May 2026, the workspace version is 0.24.32. If you are pulling from npm, `npx -y terminator-mcp-agent@latest` will resolve to the most recent published agent. The relevant comment block ('This replaces the old is_offscreen() check which incorrectly returned true for elements on secondary monitors') is the in-source signature of the patch.",
  },
  {
    q: "Does this fix change the API surface that an LLM sees?",
    a: "No. The 31 MCP tools (click_element, type_into_element, get_window_tree, and the rest) accept the same arguments and return the same shape. The fix is entirely below the MCP boundary. From the LLM's point of view, the only observable difference is that clicks on secondary monitors now succeed instead of returning ElementNotVisible. That is the kind of fix that does not need a prompt change in any agent that uses Terminator.",
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
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const relatedPosts: RelatedPost[] = [
  {
    title: "Open source desktop automation projects, April 2026",
    href: "/t/open-source-desktop-automation-projects-april-2026",
    excerpt:
      "How four eras of open source desktop automation map onto what an AI coding assistant can actually drive in 2026, and the 753-line selector parser that anchors the newest era.",
    tag: "Adjacent",
  },
  {
    title: "Open source computer use agents, April 2026",
    href: "/t/open-source-computer-use-agents-april-2026",
    excerpt:
      "The four-step coordinate transform that turns a Gemini Computer Use 0-999 click into a real desktop pixel, in public Rust.",
    tag: "Companion",
  },
  {
    title: "Run vLLM locally with a desktop agent",
    href: "/t/vllm-local-inference-desktop-automation-agent",
    excerpt:
      "One environment variable swaps Mediar's hosted Gemini backend for localhost. The contract every self-hosted LLM has to honor.",
    tag: "Setup",
  },
];

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

      <article className="mx-auto min-h-screen max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            author="Matthew Diakonov"
            authorRole="Written with AI"
            readingTime="11 min read"
          />
        </div>

        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          LLM desktop automation in April 2026: every model release, plus the
          one-line replacement that decides whether their clicks actually land
        </h1>

        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Two stories ran in parallel for LLM-driven desktop automation in
          April 2026. The loud one is models. Microsoft shipped Fara-7B on
          April 19, Google shipped four Gemma 4 variants under Apache 2.0,
          Anthropic previewed Claude Mythos to partners, and Manus kept its
          long-horizon agent loop iterating in public. Every roundup on this
          topic stops there. The quieter one is on the OS side: on April 2,
          Terminator 0.24.31 replaced a single Windows API call that had been
          silently breaking multi-monitor clicks for every LLM that drove the
          desktop through it. This page covers both, but spends most of its
          words on the second, because nobody else does.
        </p>

        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
            Direct answer (verified 2026-05-03)
          </p>
          <p className="mt-3 text-zinc-800 leading-relaxed">
            April 2026 produced two kinds of LLM desktop automation news. The
            model wave: Microsoft Fara-7B (April 19, 7B parameters, paired with
            the CUAVerifierBench), Gemma 4 family (Apache 2.0), Manus updates,
            Claude Mythos preview. The framework wave: Terminator 0.24.31 (April
            2, commit{" "}
            <a
              href="https://github.com/mediar-ai/terminator/commit/e36b9785"
              className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
              target="_blank"
              rel="noopener"
            >
              e36b9785
            </a>
            , closing{" "}
            <a
              href="https://github.com/mediar-ai/terminator/issues/473"
              className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
              target="_blank"
              rel="noopener"
            >
              issue #473
            </a>
            ) replaced Windows UI Automation&apos;s{" "}
            <code className="rounded bg-white/70 px-1 text-orange-700">
              IsOffscreen
            </code>{" "}
            check, which returns true for elements that sit on a secondary
            monitor, with a manual bounds-intersection across every connected
            display. Diff: 71 insertions, 31 deletions, in a single file. Every
            multi-monitor LLM workflow on Windows depended on it.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The April 2026 model wave, briefly
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The model side of LLM desktop automation in April was unusually
            dense. Five releases worth knowing, and one structural observation:
            the bottleneck has moved off the model in basically every category.
            Reasoning is good. Tool-use is good. Visual grounding for
            interactive screenshots is good. What still breaks is the bridge
            from &ldquo;the model picked the right thing&rdquo; to &ldquo;the
            click happened on the right pixel.&rdquo;
          </p>
          <div className="mt-8">
            <BentoGrid cards={aprilModelCards} />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Frame the rest of this guide as a question: if the models are this
            good, why does anyone still see flaky desktop automation in April
            2026? The answer for at least one entire class of failures is the
            next section.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The headline OS-side fact: <code>IsOffscreen</code> lies on a second
            monitor
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Windows UI Automation exposes a method called{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              IUIAutomationElement::IsOffscreen
            </code>
            . Reading the docs, you would assume it returns true when the
            element is not visible to the user. In practice, it returns true
            for any element whose bounds extend outside the primary
            monitor&apos;s rectangle. An entirely-visible element on a second
            monitor reports as offscreen. A button on the right-hand display in
            a horizontal two-monitor setup, where the second monitor starts at
            x=1920, will be flagged offscreen by this method even when a human
            is staring directly at it.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator 0.24.30 trusted this method. It was the first gate in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              validate_clickable()
            </code>
            . The downstream effect: every LLM that drove a multi-monitor
            Windows desktop through Terminator hit{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              ElementNotVisible(&ldquo;Element is offscreen&rdquo;)
            </code>{" "}
            on perfectly valid targets. The model never saw the monitor
            geometry; the model just saw an unhelpful error and either retried
            (wasting tokens) or gave up.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            User{" "}
            <a
              href="https://github.com/mediar-ai/terminator/issues/473"
              className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
              target="_blank"
              rel="noopener"
            >
              issue #473
            </a>{" "}
            on March 30 reported the exact symptom: clicks failed with
            &ldquo;not visible&rdquo; until they dragged the application onto
            the primary monitor. The fix landed three days later as commit{" "}
            <a
              href="https://github.com/mediar-ai/terminator/commit/e36b9785"
              className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
              target="_blank"
              rel="noopener"
            >
              e36b9785
            </a>{" "}
            on April 2, 2026. Version 0.24.31 went out the same day.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The bug, drawn
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two round-trips to the same desktop. The first is what Terminator
            0.24.30 did when the LLM tried to click a button on the second
            monitor. The second is what 0.24.31 does, with the same input.
          </p>
          <SequenceDiagram
            title="LLM click path: before and after PR #473"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The replaced helper is{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              is_visible_on_any_monitor
            </code>
            . It enumerates monitors via{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              xcap::Monitor::all()
            </code>{" "}
            and tests rectangle intersection against the element&apos;s bounds.
            If any monitor wins, the element is visible. No call into the
            misreporting Microsoft API at all.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What changed in <code>validate_clickable()</code>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The clearest way to read the patch is to look at the validation
            function&apos;s shape on either side of the diff. Toggle below.
          </p>
          <BeforeAfter
            title="validate_clickable() before and after PR #473"
            before={{
              label: "0.24.30",
              content: beforeContent,
              highlights: [
                "Trusts IUIAutomationElement::IsOffscreen as the first gate",
                "IsOffscreen returns true for any element on a secondary monitor",
                "Returns ElementNotVisible to the LLM with no monitor context",
                "Five validation steps: detached, visible, enabled, viewport, bounds",
              ],
            }}
            after={{
              label: "0.24.31",
              content: afterContent,
              highlights: [
                "is_visible() runs is_visible_on_any_monitor instead",
                "Walks every monitor returned by xcap::Monitor::all()",
                "Rectangle intersection per monitor; first-match short-circuit",
                "Four validation steps: visible, enabled, viewport (detached folded into visible)",
              ],
            }}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Four steps inside the new helper
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              is_visible_on_any_monitor
            </code>{" "}
            is small. The whole helper is roughly forty lines including
            tracing. It does the same four things in order, every call.
          </p>
          <HorizontalStepper
            title="The four-step helper at line 316 of element.rs"
            steps={fixSteps}
            current={fixSteps.length}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two call sites use it: one inside{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              is_visible()
            </code>{" "}
            (line 1452, where the result short-circuits the visibility check),
            and one indirectly via{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              validate_clickable()
            </code>{" "}
            calling{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              is_visible()
            </code>
            . The path that does the actual click work calls validate_clickable
            from inside every action method on the Windows element implementation.
          </p>
        </section>

        <ProofBanner
          quote="One file. 71 insertions, 31 deletions. The Windows API call this replaces is the reason every LLM-driven multi-monitor click on Windows was an ElementNotVisible coin flip."
          metric="71 / 31"
          source="commit e36b9785, crates/terminator/src/platforms/windows/element.rs"
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What now actually works
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of these were broken by the fix. All of them were broken
            before it. Run any of these in your own multi-monitor Windows setup
            against the latest{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-800 text-sm">
              terminator-mcp-agent
            </code>{" "}
            and the click should land first try.
          </p>
          <AnimatedChecklist
            title="Behaviours unblocked by PR #473"
            items={checklistItems}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why every April 2026 LLM benefits, not just one
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The fix lives below the MCP boundary, which means every model that
            consumes Terminator&apos;s tool surface inherits it without any
            changes to its prompts, tool schema, or harness. That includes
            every model release that landed in April, plus the older models
            that were already deployed.
          </p>
          <IntegrationsGrid
            title="Models and harnesses that inherit the fix automatically"
            subtitle="Every one of these calls validate_clickable() at the bottom of the click stack. The only thing that changed is which Windows API the validation step trusts."
            items={integrationItems}
            columns={4}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The point is structural. There is no model-side prompt-engineering
            workaround for a buggy OS-level visibility check. Telling the
            agent &ldquo;please make sure the window is on the primary
            monitor&rdquo; is the kind of brittle hack that exists in production
            agent systems shipping today. The right answer is for the bridge to
            stop lying. April 2 was when ours did.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why most April 2026 writeups missed this
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three reasons. First, model news is loud and frameworks fixes are
            quiet, and an SEO writer&apos;s incentive structure rewards loud.
            Second, the bug only surfaces on a multi-monitor Windows setup, and
            most computer-use development happens on a single laptop screen
            where IsOffscreen happens to behave fine. Third, the symptom looks
            like a model failure (the agent &ldquo;couldn&apos;t click the
            button&rdquo;) which makes it easy to chalk up to model regression
            and move on.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A reasonable mental model for LLM desktop automation in 2026: the
            model contributes intent, the framework contributes the OS bridge,
            and the OS contributes geometry. Most of this year&apos;s
            interesting failures live at the seam between the framework and
            the OS, where a shipped Microsoft API quietly gets one assumption
            wrong. April 2 fixed one of those seams.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want to see your LLM agent click on a second monitor live?"
          description="We can run Terminator against your exact multi-monitor workflow on a 30-minute call, with the validation gate logged in real time so you can see why every previous attempt was failing."
        />

        <div className="mt-14">
          <FaqSection items={faqs} />
        </div>

        <div className="mt-14">
          <RelatedPostsGrid
            title="Adjacent reading"
            subtitle="Other places the LLM-to-desktop bridge has interesting seams"
            posts={relatedPosts}
          />
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See PR #473 land an LLM click on your second monitor."
      />
    </>
  );
}
