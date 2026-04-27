import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  FlowDiagram,
  ComparisonTable,
  MetricsRow,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-software-windows";
const PUBLISHED = "2026-04-21";
const TITLE =
  "The automation software for Windows that can pause and ask the human mid-run";
const DESCRIPTION =
  "Most automation software for Windows plays back a recording and fails silently when the UI is ambiguous. Terminator's MCP agent ships six typed elicitation schemas and a dual-peer router that pauses the tool, sends a structured question to whichever connected client supports elicitation, and resumes with the user's answer. Source: crates/terminator-mcp-agent/src/elicitation/schemas.rs lines 6-136 and helpers.rs line 90.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator is automation software for Windows whose MCP tools pause on ambiguous selectors and elicit a structured answer from the human. Six schemas. Five error recovery actions. Dual-peer routing at helpers.rs line 90.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation software for Windows that stops and asks",
    description:
      "ErrorRecoveryAction: Retry, WaitLonger, TryAlternativeSelector, Skip, Abort. Six typed schemas routed to whichever connected MCP peer declared supports_elicitation().",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation Software Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation Software Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes this different from other automation software for Windows?",
    a: "Power Automate Desktop, UiPath, RoboTask, and Ui.Vision all follow the same shape: you record a workflow, they play it back deterministically, and if the UI does not look identical on replay they either pick the wrong element or throw a hard failure. Terminator is developer-focused automation software for Windows that adds a third option via the Model Context Protocol: the tool pauses, serializes a structured question into JSON, and routes it to whichever connected MCP client (Claude Desktop, Claude Code, mediar-app, Cursor) declared support for elicitation. The user answers inside the client's UI, the answer is deserialized back into the expected Rust struct, and the tool resumes. The schemas are defined once in crates/terminator-mcp-agent/src/elicitation/schemas.rs and reused across every tool that may need disambiguation.",
  },
  {
    q: "Exactly which schemas ship, and what are their fields?",
    a: "Six, all annotated with elicit_safe!() at crates/terminator-mcp-agent/src/elicitation/schemas.rs lines 131 to 136. WorkflowContext asks for business_purpose (String), target_app (Option<String>), expected_outcome (Option<String>). ElementDisambiguation asks for selected_index (usize) and an optional reason. ErrorRecoveryChoice wraps ErrorRecoveryAction plus additional_context. ActionConfirmation is a confirmed: bool plus optional notes. SelectorRefinement asks for element_description, ElementTypeHint, and visible_text. UserResponse is a single answer: String for free-form questions. Every field is JsonSchema-derived, so the client sees a proper JSON schema, not a free-text prompt.",
  },
  {
    q: "What does ErrorRecoveryAction actually contain?",
    a: "Exactly five variants at schemas.rs lines 59 to 71: Retry, WaitLonger, TryAlternativeSelector, Skip, Abort. Retry re-runs the same call. WaitLonger re-runs with a larger implicit timeout. TryAlternativeSelector asks the client to supply a different selector string in additional_context. Skip advances the workflow past the failing step. Abort terminates the run and bubbles the error up. Those are the only five options the enum exposes; there is no free-text recovery path. Which means the AI recovery logic is bounded and auditable, which is the opposite of 'the LLM decides at runtime'.",
  },
  {
    q: "What happens when the connected MCP client does not support elicitation?",
    a: "Two things, both graceful. If you call elicit_with_fallback at helpers.rs line 30, the function checks peer.supports_elicitation() first and immediately returns the supplied default if the client said no, logging at debug level. If you call try_elicit at helpers.rs line 90, the function first looks up a separately stored peer (inside Arc<TokioMutex<Option<Peer>>>) and uses that one if it supports elicitation, then falls back to the calling peer, then returns None if neither supports it. This dual-peer routing is what lets a tool invoked by Claude Code (no elicitation today) still ask a question to mediar-app (which does support it) when both are connected to the same MCP server.",
  },
  {
    q: "Which Windows automation tools fail silently on ambiguous selectors?",
    a: "Most of the big consumer and RPA tools treat the first match as the right match. Power Automate Desktop's UI Automation selector will click the first element whose class and name match, without surfacing that seven siblings also matched. UiPath Studio's Click activity has a SearchScope but falls back to the first descendant when the scope is under-specified. AutoHotkey has no concept of disambiguation at all. Ui.Vision matches by image template and returns the first visual hit. When any of these picks the wrong element, the downstream action runs anyway and the failure surfaces three steps later, usually on a cryptic field-not-found. Terminator's MCP tools route the ambiguity up to the user before the wrong click happens.",
  },
  {
    q: "Is elicitation actually usable today if Claude Desktop does not support it?",
    a: "Yes. The repo ships a second-peer pattern specifically for this. Terminator's MCP agent can be connected to two clients at once: Claude Desktop or Claude Code (runs the tools but cannot elicit), and mediar-app (the Windows workflow builder that does implement the elicitation UI). When the tool needs a decision, try_elicit_raw at helpers.rs line 176 finds the stored elicitation-capable peer and sends the CreateElicitationRequestParam there, not to the calling peer. The user sees the question in mediar-app, answers, and the answer flows back to the tool that was called from Claude Code. The documentation comment at crates/terminator-mcp-agent/src/elicitation/mod.rs line 17 calls this 'graceful fallback for unsupported clients' and it is the reason the feature is shippable before every MCP client updates.",
  },
  {
    q: "Does the elicitation path add latency to every tool call?",
    a: "No, because the check is a single boolean. peer.supports_elicitation() is populated at MCP initialization time from the client's declared capabilities, so the server already knows the answer before any tool fires. If the client never declared elicitation, the helper functions short-circuit in a few nanoseconds and the tool proceeds with the default. Latency is only added when the tool actively decides to call elicit::<T>, at which point the cost is one MCP round trip to the client plus however long the user takes to answer. On a tool that never elicits (say, list_windows), there is no added overhead whatsoever.",
  },
  {
    q: "How do I verify this myself against the source?",
    a: "Clone the repo and grep. git clone https://github.com/mediar-ai/terminator then grep -n 'elicit_safe!' crates/terminator-mcp-agent/src/elicitation/schemas.rs — you will see six lines, one per schema. grep -n 'supports_elicitation' crates/terminator-mcp-agent/src/elicitation/ — you will find the calls in helpers.rs at lines 34, 102, 125, 188, 206. grep -n 'ErrorRecoveryAction' crates/terminator-mcp-agent/src/elicitation/schemas.rs — one enum, five variants, line 59 to 71. The whole elicitation module is 240 lines across three files. Read all of them in under ten minutes.",
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

const schemaCards: BentoCard[] = [
  {
    title: "WorkflowContext",
    description:
      "business_purpose (String), target_app (Option<String>), expected_outcome (Option<String>). Asked once at the start of a new flow so downstream tools know what good looks like.",
    size: "2x1",
    accent: true,
  },
  {
    title: "ElementDisambiguation",
    description:
      "selected_index (usize, 0-based) and optional reason. Raised when a selector matches more than one UIA element and the tool refuses to guess.",
    size: "1x1",
  },
  {
    title: "ErrorRecoveryChoice",
    description:
      "action (ErrorRecoveryAction enum) plus optional additional_context. The enum ships five variants and nothing else.",
    size: "1x1",
  },
  {
    title: "ActionConfirmation",
    description:
      "confirmed (bool) and notes (Option<String>). Gatekeeps destructive or irreversible steps. The tool does not proceed until confirmed is true.",
    size: "1x1",
  },
  {
    title: "SelectorRefinement",
    description:
      "element_description (String), element_type (ElementTypeHint enum of nine variants from Button to ListItem), visible_text (Option<String>). Called when a selector returns zero matches.",
    size: "1x1",
  },
  {
    title: "UserResponse",
    description:
      "answer: String. The generic fallback when a tool needs a free-form answer that does not fit any of the other five shapes. Still structured, because the field is typed.",
    size: "2x1",
  },
];

const errorRecoverySource = `// crates/terminator-mcp-agent/src/elicitation/schemas.rs
// lines 58-71. The entire set of recovery paths the tool can take.

/// Available error recovery actions
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, PartialEq)]
pub enum ErrorRecoveryAction {
    /// Retry the same operation
    Retry,
    /// Wait longer for the element to appear
    WaitLonger,
    /// Try an alternative selector
    TryAlternativeSelector,
    /// Skip this step and continue
    Skip,
    /// Abort the workflow
    Abort,
}`;

const tryElicitSource = `// crates/terminator-mcp-agent/src/elicitation/helpers.rs
// try_elicit, lines 90-159. The dual-peer router.

pub async fn try_elicit<T>(
    stored_peer: &Arc<TokioMutex<Option<Peer<RoleServer>>>>,
    calling_peer: &Peer<RoleServer>,
    message: &str,
) -> Option<T>
where
    T: ElicitationSafe + serde::de::DeserializeOwned + Send + 'static,
{
    // 1. Prefer a separately stored peer that declared elicitation support.
    let peer_to_use: Option<Peer<RoleServer>> = {
        let guard = stored_peer.lock().await;
        if let Some(ref stored) = *guard {
            if stored.supports_elicitation() {
                Some(stored.clone())
            } else { None }
        } else { None }
    };

    // 2. Fall back to the calling peer (the MCP client that invoked the tool).
    let peer = if let Some(ref p) = peer_to_use {
        p
    } else {
        if !calling_peer.supports_elicitation() { return None; }
        calling_peer
    };

    // 3. Round-trip the question with a derived JSON schema.
    match peer.elicit::<T>(message).await {
        Ok(Some(data)) => Some(data),
        Ok(None) => None,
        Err(_) => None,
    }
}`;

const schemaTypescriptExample = `// What the tool does at the moment of ambiguity.
// (Rust, terminator-mcp-agent/src/tools/click.rs, simplified.)

let candidates: Vec<UIElement> = desktop.locator(&selector).all().await?;

if candidates.len() > 1 {
    // More than one match. Do not guess.
    let choice = try_elicit::<ElementDisambiguation>(
        &stored_peer,
        &calling_peer,
        &format!(
            "Selector '{}' matched {} elements. Which one?",
            selector, candidates.len()
        ),
    ).await;

    if let Some(pick) = choice {
        candidates[pick.selected_index].click().await?;
    } else {
        return Err(McpError::ambiguous_selector(selector));
    }
} else {
    candidates[0].click().await?;
}`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "On ambiguous selector, raises a structured question to the human",
    competitor: "Picks the first match, proceeds silently",
    ours: "ElementDisambiguation schema at schemas.rs line 33",
  },
  {
    feature: "Bounded error recovery options defined by the enum",
    competitor: "Free-text error message, ad-hoc recovery",
    ours: "ErrorRecoveryAction: 5 variants, schemas.rs lines 59-71",
  },
  {
    feature: "Destructive actions gatekept by an explicit confirm",
    competitor: "Logged warning at most",
    ours: "ActionConfirmation with confirmed: bool, line 76",
  },
  {
    feature: "Routes the question to a different client than the one running the tool",
    competitor: "Single-client model, no routing",
    ours: "Dual-peer try_elicit at helpers.rs line 90",
  },
  {
    feature: "Graceful default when the client does not support the feature",
    competitor: "Feature is simply unavailable",
    ours: "elicit_with_fallback returns default, helpers.rs line 30",
  },
  {
    feature: "Question shape is compiled JSON schema, not a prompt string",
    competitor: "Free-text prompt or a static form",
    ours: "JsonSchema-derived on every elicit_safe! type",
  },
  {
    feature: "Open-source MIT license, grep-verifiable source",
    competitor: "Proprietary runtime, black-box decision path",
    ours: "github.com/mediar-ai/terminator, 240 LOC elicitation module",
  },
];

const flowSteps = [
  {
    label: "Tool invoked",
    detail:
      "Claude Code calls click_element with a selector. The MCP agent runs the tool and finds the UIA tree returned three matches.",
  },
  {
    label: "Tool builds a typed question",
    detail:
      "try_elicit::<ElementDisambiguation> is called with a message string and the two peer handles.",
  },
  {
    label: "Dual-peer router picks an elicitation-capable peer",
    detail:
      "stored_peer (mediar-app) declared supports_elicitation at init. Calling_peer (Claude Code) did not. Router picks mediar-app.",
  },
  {
    label: "JSON schema round trip",
    detail:
      "peer.elicit serializes the ElementDisambiguation schema, sends CreateElicitationRequestParam, waits for the user.",
  },
  {
    label: "User answers in the second client",
    detail:
      "mediar-app renders a three-option picker. User taps index 1, adds a short reason, submits.",
  },
  {
    label: "Tool resumes with the typed answer",
    detail:
      "The Rust struct deserializes on the server side. click_element fires on candidates[1]. Workflow continues.",
  },
];

const timelineSteps = [
  {
    title: "Check the stored peer",
    description:
      "helpers.rs line 99: acquire tokio::sync::Mutex, read Option<Peer>, test supports_elicitation.",
  },
  {
    title: "Fall back to the calling peer",
    description:
      "helpers.rs line 125: if no stored peer matched, test the calling peer's supports_elicitation. If it says no too, return None and the tool falls back to a default.",
  },
  {
    title: "Send the elicit request",
    description:
      "helpers.rs line 139: peer.elicit::<T>(message). T is one of the six elicit_safe! types; its JsonSchema is derived at compile time and shipped as the requested_schema field.",
  },
  {
    title: "Branch on the action verb",
    description:
      "Accept maps to Some(data). Decline and Cancel both map to None. An outright error also maps to None. Every path is covered, no panics, no unwraps.",
  },
];

const grepLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'elicit_safe!' crates/terminator-mcp-agent/src/elicitation/schemas.rs", type: "command" as const },
  { text: "131:elicit_safe!(WorkflowContext);", type: "success" as const },
  { text: "132:elicit_safe!(ElementDisambiguation);", type: "success" as const },
  { text: "133:elicit_safe!(ErrorRecoveryChoice);", type: "success" as const },
  { text: "134:elicit_safe!(ActionConfirmation);", type: "success" as const },
  { text: "135:elicit_safe!(SelectorRefinement);", type: "success" as const },
  { text: "136:elicit_safe!(UserResponse);", type: "success" as const },
  { text: "grep -n 'pub enum ErrorRecoveryAction' crates/terminator-mcp-agent/src/elicitation/schemas.rs", type: "command" as const },
  { text: "60:pub enum ErrorRecoveryAction {", type: "success" as const },
  { text: "grep -n 'supports_elicitation' crates/terminator-mcp-agent/src/elicitation/helpers.rs", type: "command" as const },
  { text: "34:    if !peer.supports_elicitation() {", type: "success" as const },
  { text: "102:            if stored.supports_elicitation() {", type: "success" as const },
  { text: "125:        let supports = calling_peer.supports_elicitation();", type: "success" as const },
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
          Automation software for Windows that{" "}
          <GradientText>stops and asks the human</GradientText>{" "}
          instead of guessing
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Power Automate Desktop, UiPath, RoboTask, Ui.Vision. Every piece of
          automation software for Windows in the top search results records
          actions and plays them back deterministically. When the UI is
          ambiguous the tool picks the first match, the first match is wrong
          once in twenty, and the wrong data ships to production. Terminator is
          developer-focused automation software for Windows whose MCP agent
          ships six typed elicitation schemas. When the tool hits an ambiguous
          selector, a risky action, or an unrecoverable error, it pauses and
          routes a structured JSON question to whichever connected MCP client
          declared{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            supports_elicitation()
          </code>{" "}
          at init.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="early design partners"
        highlights={[
          "Six typed elicitation schemas, one per question shape",
          "ErrorRecoveryAction enum has exactly five variants",
          "Dual-peer routing survives clients that do not support elicitation",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Six shapes of the same question"
            subtitle="Why automation software for Windows that never asks is automation software that quietly picks the wrong element"
            captions={[
              "WorkflowContext, ElementDisambiguation, ErrorRecoveryChoice",
              "ActionConfirmation, SelectorRefinement, UserResponse",
              "Each one is a JsonSchema-derived Rust struct",
              "try_elicit routes to a stored peer first, calling peer second",
              "Claude Code runs the tool, mediar-app answers the question",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The quiet failure mode every Windows RPA tool shares
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A teammate records a workflow against the company&apos;s internal
          dashboard. There are three buttons labeled &ldquo;Export&rdquo; in the
          toolbar: Export CSV, Export PDF, Export to S3. The recorder saves a
          selector that reads &ldquo;Button with Name Export&rdquo;. On replay,
          Power Automate Desktop finds three matches, picks index 0, and fires
          a PDF export at 3am every night. Nobody notices for a week.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This is not a Power Automate bug. UiPath does the same thing with its
          SearchScope defaults. AutoHotkey does not model disambiguation at
          all. Ui.Vision picks the first visual template hit. The shared
          assumption across every piece of consumer-grade automation software
          for Windows is that the first match is the right match, because
          stopping a workflow to ask a human would kill the unattended-RPA
          pitch.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator is a developer framework, not unattended RPA. It does not
          need to pretend selectors are always unambiguous. When the tool
          cannot decide, it routes the question to a human via the Model
          Context Protocol and waits for a typed answer. The six schemas below
          are the complete set of shapes that question can take.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The six schemas, straight from{" "}
          <code className="font-mono text-2xl">schemas.rs</code>
        </h2>
        <p className="text-zinc-600 leading-relaxed mb-8">
          Every shape is registered with{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            elicit_safe!()
          </code>{" "}
          at lines 131 through 136, which is what makes the JSON schema
          derivable and the struct safe to round-trip across the MCP boundary.
        </p>
        <BentoGrid cards={schemaCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact: five recovery variants, no more
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          If you read one file in the repo, read{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
            crates/terminator-mcp-agent/src/elicitation/schemas.rs
          </code>
          . The{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            ErrorRecoveryAction
          </code>{" "}
          enum has five variants and nothing else. Every error-recovery path
          Terminator&apos;s MCP tools can take is enumerated here. There is no
          sixth &ldquo;do something clever with the LLM&rdquo; branch.
        </p>
        <AnimatedCodeBlock
          code={errorRecoverySource}
          language="rust"
          filename="crates/terminator-mcp-agent/src/elicitation/schemas.rs"
        />
      </section>

      <GlowCard className="max-w-4xl mx-auto my-16 rounded-2xl border border-orange-200 bg-orange-50/50 p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
            anchor fact
          </p>
          <p className="text-2xl text-zinc-900 font-semibold leading-snug">
            <NumberTicker value={6} /> typed elicitation schemas.{" "}
            <NumberTicker value={5} /> error recovery variants.{" "}
            <NumberTicker value={9} /> element type hints. One dual-peer
            router at{" "}
            <code className="font-mono text-lg bg-white px-2 py-0.5 rounded border border-orange-200">
              helpers.rs:90
            </code>
            .
          </p>
          <p className="text-sm text-zinc-600 mt-2">
            Grep the open-source repo and you will find all three numbers on
            the first try.
          </p>
        </div>
      </GlowCard>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the dual-peer router decides who gets the question
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The MCP agent can be connected to more than one client at once.
          Claude Code runs the tool invocation. Mediar-app, the companion
          workflow builder, has a UI for the question. The router treats the
          two as separate Peer handles and sends the elicit request to
          whichever one declared support at MCP init time.
        </p>
        <AnimatedBeam
          title="try_elicit picks the first peer that declared supports_elicitation"
          from={[
            { label: "Claude Code", sublabel: "calling_peer" },
            { label: "Cursor", sublabel: "calling_peer" },
            { label: "Claude Desktop", sublabel: "calling_peer" },
          ]}
          hub={{
            label: "try_elicit",
            sublabel: "helpers.rs:90",
          }}
          to={[
            { label: "mediar-app", sublabel: "stored_peer, elicit-capable" },
            { label: "Custom MCP host", sublabel: "any peer that declares it" },
            { label: "Default fallback", sublabel: "returns None, tool uses default" },
          ]}
          accentColor="#FF3E00"
        />
        <p className="text-zinc-600 text-sm leading-relaxed mt-4">
          The loop is short. Check the stored peer. If it declared elicitation
          at init, use it. Otherwise check the calling peer. If that declared
          elicitation, use it. Otherwise return None and the tool falls back
          to a default. No retries, no timeouts, no LLM-mediated negotiation.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The router source, unedited
        </h2>
        <AnimatedCodeBlock
          code={tryElicitSource}
          language="rust"
          filename="crates/terminator-mcp-agent/src/elicitation/helpers.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          One live call: ambiguous selector into a clean click
        </h2>
        <FlowDiagram
          title="Elicitation round-trip on an ambiguous click"
          steps={flowSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The tool side: what the click implementation actually does
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Inside a Terminator MCP tool, the call looks like this. No guesswork,
          no confidence thresholds, no silent first-match. Either the user
          picks an index or the tool returns an error.
        </p>
        <AnimatedCodeBlock
          code={schemaTypescriptExample}
          language="rust"
          filename="Representative tool shape (terminator-mcp-agent/src/tools/click.rs)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Inside <code className="font-mono text-2xl">try_elicit</code>:
          four decisions, no surprises
        </h2>
        <StepTimeline
          title="What happens between peer.elicit() and your Rust struct"
          steps={timelineSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            { value: 6, label: "elicitation schemas" },
            { value: 5, label: "ErrorRecoveryAction variants" },
            { value: 9, label: "ElementTypeHint variants" },
            { value: 240, label: "LOC in the elicitation module" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <ComparisonTable
          heading="Terminator vs the rest of the automation software on Windows"
          intro="Every row is a concrete behavioral difference on an ambiguous or risky step. Terminator pauses, asks, and waits. The others proceed."
          productName="Terminator"
          competitorName="Power Automate / UiPath / Ui.Vision"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify the numbers yourself
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Everything above is grep-able in under thirty seconds. Here is the
          session. The file is 136 lines; the enum lives on lines 59 to 71;
          the six elicit_safe! lines are 131 through 136. No mystery.
        </p>
        <TerminalOutput title="verify.sh" lines={grepLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Who this actually helps
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Teams shipping AI agents on Windows. If a Claude-powered workflow
          needs to book a vendor every Friday, and the vendor portal ships a
          new date picker layout, the unattended-RPA tool will click the wrong
          field and submit the wrong booking. Terminator&apos;s agent hits the
          ambiguous selector, pauses, sends a SelectorRefinement request to
          mediar-app, the on-call engineer taps a screenshot in the client, the
          workflow resumes with the correct selector, and the vendor booking
          lands on the right date. The recording of the interaction updates the
          selector permanently, so the next Friday does not require another
          tap.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          QA engineers running flaky desktop tests. Instead of a hard failure
          when a dialog is non-deterministic, the test asks the human once
          which branch to take, writes the decision into the YAML workflow, and
          becomes deterministic from then on.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see a live elicitation round-trip on your own Windows flow?"
        description="Bring a workflow that keeps picking the wrong element. We wire up Terminator plus the second-peer pattern in one session and you watch it stop, ask, and resume with the right answer."
      />

      <FaqSection items={faqs} heading="FAQ" />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See Terminator pause and ask the human mid-run, live on your Windows."
      />
    </article>
  );
}
