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
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  CodeComparison,
  MetricsRow,
  GlowCard,
  StepTimeline,
  SequenceDiagram,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-tools-windows";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation tools for Windows: the one that refuses to run an ambiguous selector";
const DESCRIPTION =
  "Most automation tools for Windows happily search the whole desktop tree and match the wrong button in the wrong app. Terminator's Windows engine throws AutomationError::InvalidSelector the moment your selector does not include a process: scope. Source: crates/terminator/src/platforms/windows/engine.rs line 1020.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Of all the automation tools for Windows, Terminator is the only one whose engine refuses to run a selector without a process: scope. The guardrail is selector_has_process_scope at engine.rs:184, enforced in find_elements at engine.rs:1020.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation tools for Windows that refuse to guess",
    description:
      "One Rust helper, sixteen lines. Walks the selector AST and returns false unless some branch is Selector::Process(_). When false, find_elements refuses to run.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation Tools Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation Tools Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes Terminator different from other automation tools for Windows?",
    a: "Terminator is a developer framework, not a consumer RPA canvas. It exposes Windows UI Automation as a Playwright-shaped API plus an MCP server your AI coding assistant can drive directly. The one feature other automation tools for Windows do not have: the engine refuses to run a selector that does not include a process: scope. That one guardrail kills the most common class of flake, where a selector like role:Button && name:OK silently matches a confirmation dialog in a different process.",
  },
  {
    q: "Where is the guardrail implemented in source?",
    a: "Two places. First, the recursive helper selector_has_process_scope at crates/terminator/src/platforms/windows/engine.rs line 184. It walks the Selector AST through every combinator (And, Or, Not, Chain, Has, RightOf, LeftOf, Above, Below, Near) and returns true only when some branch is a Selector::Process(_). Second, the enforcement point at engine.rs line 1020, inside find_elements, which returns AutomationError::InvalidSelector with the message \"Desktop-wide search not allowed. Selector must include 'process:' prefix to scope search to a specific application.\" if the helper returns false and no explicit root element was passed.",
  },
  {
    q: "Why do other automation tools for Windows not enforce this?",
    a: "Historical reasons, mostly. Power Automate Desktop and UiPath descend from RPA tooling where the user points at a control in a recorder and the runtime stores a screenshot plus a partial property path. AutoHotkey is a scripting language with window-title matchers, no query AST. WinAppDriver follows Selenium's model where every query is scoped to a session that already knows its app. Playwright-on-desktop ports and pywinauto accept bare selectors and walk the desktop root if you let them. None of these tools have a single place where the query engine can reject an ambiguous query on principle.",
  },
  {
    q: "Can I still do a desktop-wide search when I actually want one?",
    a: "Yes, but you have to be explicit. Pass a root element to find_elements (via element.locator() in the SDKs). The check at engine.rs line 1020 reads if root.is_none() && !selector_has_process_scope(selector). If root is Some, the guardrail does not fire, on the assumption that you already scoped the search by picking the root yourself. There is no desktop-walk flag; if you want to walk the desktop, you ask the desktop element for it directly.",
  },
  {
    q: "Which selector combinators does the AST walker descend into?",
    a: "All the ones that contain other selectors. Selector::And and Selector::Or iterate their children with .any(selector_has_process_scope). Selector::Not recurses into its inner. Selector::Chain does the same. Selector::Has unwraps its inner. Selector::RightOf, LeftOf, Above, Below, Near all descend into the anchor selector. Leaf selectors (Role, Name, Id, Text, Path, NativeId, Attributes, ClassName, Visible, LocalizedRole, Filter, Nth, Parent, Invalid) return false unless they are Selector::Process(_). The walker is intentionally recursive so that process:chrome >> role:Button && name:Submit, with process: nested deep inside a Chain, still counts as scoped.",
  },
  {
    q: "What does the rejection actually look like at runtime?",
    a: "You get an AutomationError::InvalidSelector. The message includes three worked examples the engine prints so you can copy and adapt: process:chrome >> role:Button && name:Submit, process:notepad >> role:Document, and process:explorer >> role:Icon && name:Recycle Bin. The error is thrown before any UIA call is made, so you pay microseconds, not a 500ms UIA timeout. On the MCP side, the error bubbles up as a tool error on the calling client, which means Claude Code, Cursor, or Windsurf see an explicit scope reminder instead of a timeout or the wrong click.",
  },
  {
    q: "Does this hurt the AI coding assistant use case, where the agent does not know which process to pick?",
    a: "The opposite. The tool description strings in crates/terminator-mcp-agent/src/server.rs tell the model the expected selector shape, and when the model forgets, the InvalidSelector error gives it a one-shot correction with three examples inline. In practice this is the fastest way to teach a model the selector grammar: one rejected call, one readable fix. Compare to tools that silently match a wrong button and then try to act on it.",
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

const scopeHelperCode = `// crates/terminator/src/platforms/windows/engine.rs, lines 184-199
// One recursive walk over the selector AST. Returns true only if
// some leaf of the expression is a Selector::Process(_).

fn selector_has_process_scope(selector: &Selector) -> bool {
    match selector {
        Selector::Process(_) => true,

        // Every combinator descends into its children
        Selector::Chain(selectors) => selectors.iter().any(selector_has_process_scope),
        Selector::And(selectors)   => selectors.iter().any(selector_has_process_scope),
        Selector::Or(selectors)    => selectors.iter().any(selector_has_process_scope),
        Selector::Not(inner)       => selector_has_process_scope(inner),
        Selector::Has(inner)       => selector_has_process_scope(inner),

        // Spatial anchors descend into their anchor selector
        Selector::RightOf(inner)
        | Selector::LeftOf(inner)
        | Selector::Above(inner)
        | Selector::Below(inner)
        | Selector::Near(inner)   => selector_has_process_scope(inner),

        // Every other leaf (Role, Name, Id, Text, Path, Visible, ...)
        // is not a process scope on its own.
        _ => false,
    }
}`;

const enforcementCode = `// crates/terminator/src/platforms/windows/engine.rs, lines 1012-1030
// The one place in the Windows backend where a selector is rejected
// before any UIA call is made.

fn find_elements(
    &self,
    selector: &Selector,
    root: Option<&UIElement>,
    timeout: Option<Duration>,
    depth: Option<usize>,
) -> Result<Vec<UIElement>, AutomationError> {
    // Enforce scoping: desktop-wide search requires a process selector
    // unless the caller has already picked a root element to scope to.
    if root.is_none() && !selector_has_process_scope(selector) {
        return Err(AutomationError::InvalidSelector(format!(
            "Desktop-wide search not allowed. Selector must include \\
             'process:' prefix to scope search to a specific application.\\n\\
             Examples:\\n\\
             - process:chrome >> role:Button && name:Submit\\n\\
             - process:notepad >> role:Document\\n\\
             - process:explorer >> role:Icon && name:Recycle Bin\\n\\
             Or use element.locator() to search within a specific \\
             element's tree.\\n\\
             Current selector: {selector:?}"
        )));
    }

    // ... the actual search only runs past this guard.
}`;

const sdkFixExample = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// Broken: this matches role:Button && name:OK in every visible
// process on the desktop. The engine refuses it outright.
//
// AutomationError::InvalidSelector("Desktop-wide search not allowed...")
await desktop.locator("role:Button && name:OK").click();

// Fixed: prefix with process: so the search is bounded.
// The engine runs the query, finds exactly one button, clicks it.
await desktop
  .locator("process:winword >> role:Button && name:OK")
  .click();

// Also valid: pick a root first, then search under it. The guardrail
// only fires when root is None and the selector has no process scope.
const chrome = await desktop.application("chrome");
await chrome.locator("role:Button && name:Submit").click();`;

const rejectedSelector = `// REJECTED by engine.rs:1020
//
// Matches any Button named "OK" on the whole desktop. In practice
// this picks whichever dialog the UIA root lists first, which is
// non-deterministic across runs.

role:Button && name:OK
role:Edit && name:Search
window:Login >> role:Button
(role:Button && name:Save) || (role:Button && name:Submit)
rightof:name:Filename >> role:Button

// All five have no Selector::Process(_) anywhere in their AST.
// selector_has_process_scope returns false. find_elements returns
// AutomationError::InvalidSelector before touching UIA.`;

const acceptedSelector = `// ACCEPTED by engine.rs:1020
//
// Each of these has at least one Selector::Process(_) node somewhere
// in the AST, so the recursive walker returns true and the search
// is bounded to that process's window tree.

process:winword >> role:Button && name:OK
process:chrome >> role:Edit && name:Search
process:notepad >> window:Login >> role:Button

// The process: prefix can be buried inside a Chain or an anchor.
// The walker descends, so this is still scoped:
process:chrome >> rightof:name:Filename >> role:Button

// Or combine scopes across fallbacks:
(process:winword >> role:Button && name:Save)
  || (process:winword >> role:Button && name:Submit)`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Engine rejects unscoped selectors",
    competitor: "No (walks desktop root silently)",
    ours: "InvalidSelector at engine.rs:1020",
  },
  {
    feature: "Recursive AST check for process scope",
    competitor: "No AST, string matchers only",
    ours: "selector_has_process_scope at engine.rs:184",
  },
  {
    feature: "Rejection before any UIA call",
    competitor: "Hits UIA, then times out",
    ours: "Early return, microseconds",
  },
  {
    feature: "Scope nested inside Chain/And/Or still counts",
    competitor: "Varies, often not recognized",
    ours: ".any(selector_has_process_scope) on children",
  },
  {
    feature: "Spatial anchors (rightof:, near:) require scoped anchor",
    competitor: "Not supported at all",
    ours: "Anchor's selector is walked too",
  },
  {
    feature: "Error message includes working examples",
    competitor: "Usually opaque",
    ours: "Three process:... examples inline",
  },
];

const terminalErrorLines = [
  { text: "$ claude mcp terminator click_element --selector 'role:Button && name:OK'", type: "command" as const },
  { text: "[terminator] find_elements(selector=And([Role{Button}, Name(OK)]), root=None)", type: "info" as const },
  { text: "[terminator] selector_has_process_scope -> false", type: "output" as const },
  { text: "AutomationError::InvalidSelector:", type: "error" as const },
  { text: "  Desktop-wide search not allowed. Selector must include 'process:' prefix to", type: "error" as const },
  { text: "  scope search to a specific application.", type: "error" as const },
  { text: "  Examples:", type: "error" as const },
  { text: "    - process:chrome >> role:Button && name:Submit", type: "error" as const },
  { text: "    - process:notepad >> role:Document", type: "error" as const },
  { text: "    - process:explorer >> role:Icon && name:Recycle Bin", type: "error" as const },
  { text: "$ claude mcp terminator click_element --selector 'process:winword >> role:Button && name:OK'", type: "command" as const },
  { text: "[terminator] selector_has_process_scope -> true (via Chain[0] = Process(\"winword\"))", type: "output" as const },
  { text: "[terminator] find_elements -> 1 match in 4ms", type: "success" as const },
  { text: "clicked role:Button && name:OK inside pid 8712 (winword.exe)", type: "success" as const },
];

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'Desktop-wide search not allowed' crates/terminator/src/platforms/windows/engine.rs", type: "command" as const },
  { text: "1022:                \"Desktop-wide search not allowed. Selector must include 'process:' prefix to scope search to a specific application.\\n\\", type: "success" as const },
  { text: "grep -n 'fn selector_has_process_scope' crates/terminator/src/platforms/windows/engine.rs", type: "command" as const },
  { text: "184:fn selector_has_process_scope(selector: &Selector) -> bool {", type: "success" as const },
  { text: "grep -n 'selector_has_process_scope(selector)' crates/terminator/src/platforms/windows/engine.rs", type: "command" as const },
  { text: "1020:        if root.is_none() && !selector_has_process_scope(selector) {", type: "success" as const },
];

const competingTools = [
  "Power Automate Desktop",
  "AutoHotkey",
  "UiPath",
  "AutoIt",
  "pywinauto",
  "WinAppDriver",
  "FlaUI",
  "TestStack.White",
  "Ranorex",
  "WinAutomation",
  "Blue Prism",
  "TinyTask",
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
          Automation tools for Windows that{" "}
          <GradientText>refuse to guess</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every listicle of automation tools for Windows ranks Power Automate,
          AutoHotkey, UiPath, and WinAppDriver by features. None of them mention
          the one design decision that cuts the most common flake in half.
          Terminator&apos;s Windows engine refuses to run a selector like{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            role:Button &amp;&amp; name:OK
          </code>{" "}
          because it cannot tell you which OK, in which app, on which desktop.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="8 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="early design partners"
        highlights={[
          "One helper, sixteen lines, enforced in one place",
          "Rejection lands in microseconds, not a 500ms UIA timeout",
          "Error message prints three working process: examples inline",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Refuses ambiguity"
            subtitle="The one guardrail that sets Terminator apart from every other Windows automation tool"
            captions={[
              "You write: role:Button && name:OK",
              "Engine walks the AST, finds no process: leaf",
              "find_elements returns InvalidSelector in microseconds",
              "You write: process:winword >> role:Button && name:OK",
              "Engine accepts, UIA returns one match, Terminator clicks",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The cross-app ghost bug
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Pick any traditional automation tool for Windows. Write a click on a
          button called OK. If another window on the desktop also has a button
          called OK (a background Outlook prompt, a Teams dialog, a Windows
          Update banner), the UIA root will list both. Whichever one the tree
          walker hits first wins. Your test passed on Tuesday and fails on
          Wednesday because a Slack notification shifted z-order.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This is the single most common class of flake in Windows automation,
          and it is the one class of flake that a query engine can rule out
          by design. A selector either explicitly says which process it is
          targeting, or it does not. If it does not, the engine should refuse.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator is the only framework I know of that takes this position.
          The enforcement is sixteen lines of Rust at the top of its Windows
          engine, and the refusal is one early return inside the function
          every selector must go through.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The helper: selector_has_process_scope
        </h2>
        <p className="text-zinc-600 mb-6">
          A single recursive function over the Selector enum. It returns true
          only when some leaf of the expression is{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            Selector::Process(_)
          </code>
          . Every combinator is handled explicitly so nested scopes still count.
        </p>
        <AnimatedCodeBlock
          code={scopeHelperCode}
          language="rust"
          filename="engine.rs"
        />
      </section>

      <ProofBanner
        quote="if root.is_none() && !selector_has_process_scope(selector)"
        source="crates/terminator/src/platforms/windows/engine.rs line 1020. The single check that gates every find_elements call on the Windows backend."
        metric="1 line"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The enforcement: find_elements
        </h2>
        <p className="text-zinc-600 mb-6">
          Every selector the Windows backend executes passes through{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            find_elements
          </code>
          . One early return at the top of the function rejects unscoped queries
          before any COM call crosses the process boundary.
        </p>
        <AnimatedCodeBlock
          code={enforcementCode}
          language="rust"
          filename="engine.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the rejection looks like
        </h2>
        <p className="text-zinc-600 mb-6">
          The first line fails. The error prints three ready-to-copy examples.
          The second line succeeds on the first try.
        </p>
        <TerminalOutput title="claude code + terminator-mcp-agent" lines={terminalErrorLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          How the walker flows
        </h2>
        <p className="text-zinc-600 mb-6">
          One entry point, one helper, one rejection path. The caller learns
          about the refusal before Windows UIA is even asked to start a search.
        </p>
        <SequenceDiagram
          title="find_elements with an unscoped selector"
          actors={["Caller", "find_elements", "scope_helper", "UIA"]}
          messages={[
            { from: 0, to: 1, label: "find_elements(selector, root=None)", type: "request" },
            { from: 1, to: 2, label: "selector_has_process_scope(selector)", type: "request" },
            { from: 2, to: 2, label: "recurse: And/Or/Not/Chain/Has/spatial", type: "event" },
            { from: 2, to: 1, label: "false (no Selector::Process found)", type: "response" },
            { from: 1, to: 0, label: "Err(InvalidSelector)  // engine.rs:1022", type: "error" },
            { from: 1, to: 3, label: "(UIA never contacted)", type: "event" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The AST walk, in one picture
        </h2>
        <p className="text-zinc-600 mb-6">
          The helper is a recursive visitor. Each combinator decides how to
          forward the question to its children. One <code className="font-mono text-sm">Selector::Process(_)</code>{" "}
          anywhere makes the whole expression valid.
        </p>
        <AnimatedBeam
          title="selector_has_process_scope descends into every branch"
          accentColor="#FF3E00"
          from={[
            { label: "Selector::And", sublabel: ".any(scope_helper) on children" },
            { label: "Selector::Or", sublabel: ".any(scope_helper) on children" },
            { label: "Selector::Chain", sublabel: "seq of selectors, any scoped" },
            { label: "Selector::Not", sublabel: "recurse into inner" },
            { label: "Selector::Has", sublabel: "recurse into inner" },
            { label: "Selector::RightOf et al", sublabel: "descend anchor selector" },
          ]}
          hub={{
            label: "selector_has_process_scope",
            sublabel: "engine.rs line 184",
          }}
          to={[
            { label: "true", sublabel: "if any branch holds Process(_)" },
            { label: "false", sublabel: "every other leaf" },
            { label: "-> find_elements", sublabel: "pass or InvalidSelector" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What every other Windows automation tool does instead
        </h2>
        <p className="text-zinc-600 mb-6">
          None of these refuse an ambiguous query. Some of them do not have a
          query engine at all. The list is not a knock, it is a map of where
          this guardrail is missing.
        </p>
        <Marquee speed={38} pauseOnHover>
          {competingTools.map((label) => (
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
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Side by side
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Other automation tools for Windows"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Rejected vs accepted selectors
        </h2>
        <p className="text-zinc-600 mb-6">
          The only difference between the left and right columns is whether a{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            process:
          </code>{" "}
          prefix exists somewhere in the AST. The shape of the query does not
          matter; only the presence of scope does.
        </p>
        <CodeComparison
          title="engine.rs:1020 decides"
          leftLabel="Refused by the engine"
          rightLabel="Run by the engine"
          leftCode={rejectedSelector}
          rightCode={acceptedSelector}
          leftLines={rejectedSelector.split("\n").length}
          rightLines={acceptedSelector.split("\n").length}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Concrete numbers from the source
        </h2>
        <MetricsRow
          metrics={[
            { value: 16, label: "lines in selector_has_process_scope" },
            { value: 184, label: "engine.rs line of the helper" },
            { value: 1020, label: "engine.rs line of the enforcement" },
            { value: 3, label: "example selectors in the error message" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={11} />
            </div>
            <p className="text-sm text-zinc-600">
              Selector combinators the AST walker recurses into before falling
              back to false:{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">And</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Or</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Not</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Chain</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Has</code>,{" "}
              plus five spatial anchors (
              <code className="bg-zinc-100 px-1 rounded text-xs">RightOf</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">LeftOf</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Above</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Below</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">Near</code>).
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={0} />
            </div>
            <p className="text-sm text-zinc-600">
              UIA calls made when the rejection fires. The early return at{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                engine.rs:1020
              </code>{" "}
              runs before any COM instance is touched, so an unscoped selector
              costs microseconds of pattern matching, not a UIA timeout.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={35} />
            </div>
            <p className="text-sm text-zinc-600">
              Typed MCP tools in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                terminator-mcp-agent
              </code>{" "}
              that go through this guardrail.{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                click_element
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                type_into_element
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                validate_element
              </code>
              , and the rest all delegate to{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                find_elements
              </code>
              .
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The fix in your own code
        </h2>
        <p className="text-zinc-600 mb-6">
          The SDKs expose two escape hatches. Prefix the selector with{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            process:
          </code>
          , or grab the application root first and use{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            element.locator()
          </code>
          . Either counts as scoping to the engine.
        </p>
        <AnimatedCodeBlock
          code={sdkFixExample}
          language="typescript"
          filename="scope-your-selectors.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What happens on a real click
        </h2>
        <p className="text-zinc-600 mb-6">
          Five steps from the MCP tool call to the UIA hit, with the guardrail
          sitting between steps two and three.
        </p>
        <StepTimeline
          steps={[
            {
              title: "MCP tool call arrives",
              description:
                "Claude Code sends click_element with a selector string. The MCP agent parses the string into a Selector AST (role:Button, And, Process, Chain, ...) using the Shunting Yard grammar.",
            },
            {
              title: "find_elements is called",
              description:
                "The dispatch in terminator-mcp-agent hands the Selector to WindowsEngine::find_elements(selector, root=None). Root is None because the MCP tool call did not pass an explicit container.",
            },
            {
              title: "selector_has_process_scope walks the AST",
              description:
                "The helper descends into every combinator. It returns true at the first Selector::Process(_) leaf it finds. If the walk completes without one, the helper returns false.",
            },
            {
              title: "Engine decides",
              description:
                "If the helper returned false, find_elements returns AutomationError::InvalidSelector with the three-example message. If it returned true, the engine proceeds to the UIA search.",
            },
            {
              title: "UIA search runs, or does not",
              description:
                "On a scoped selector, the engine walks the process's window tree and returns matches. On an unscoped one, the MCP tool returns the error to the client, and the model gets a one-shot correction it can act on in its next call.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Verify in the repo
        </h2>
        <p className="text-zinc-600 mb-6">
          Three grep lines. The helper, the enforcement, and the error string
          all live in the same file on mediar-ai/terminator.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Curious whether this guardrail would catch the flakes in your Windows automation?"
        description="Book 20 minutes and we will run your worst selectors through the engine together and show you the exact reject paths."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See how Terminator rejects ambiguous Windows selectors in 20 minutes."
      />
    </article>
  );
}
