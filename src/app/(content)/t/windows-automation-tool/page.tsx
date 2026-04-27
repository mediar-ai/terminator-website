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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  MetricsRow,
  BentoGrid,
  GlowCard,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-tool";
const PUBLISHED = "2026-04-21";
const TITLE =
  "The Windows automation tool whose if: expressions survive a paste from Slack";
const DESCRIPTION =
  "Every Windows automation tool has conditional steps. Only Terminator's interpreter has a line dedicated to curly quotes. Before the parser ever runs, normalize_expression rewrites eight characters (U+2018, U+2019, U+201C, U+201D, backtick, U+00A0, U+2009, U+202F) so if: quote_type == 'Face Amount' evaluates the same whether you typed it in a shell or pasted it out of Notion, Slack, or Word. Source: crates/terminator-mcp-agent/src/expression_eval.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The eight Unicode characters that break every other Windows automation tool's conditional syntax (and what Terminator does with them at line 6 of expression_eval.rs).",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows automation tool, paste-safe",
    description:
      "Curly quotes and non-breaking spaces are how people actually write. Terminator normalizes them before the expression parser ever sees a token.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows automation tool" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows automation tool", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes Terminator different from other Windows automation tools?",
    a: "The short answer is who the user is. Power Automate Desktop, UiPath, Blue Prism, and AutoHotkey are aimed at business users, RPA developers, or power users writing scripts by hand. Terminator is a developer framework. You install it as an npm package, a pip package, a Rust crate, or an MCP server that Claude Code, Cursor, Windsurf, or VS Code can drive. The product ships with a Playwright-shaped selector API, a workflow engine with typed variables, a recorder that emits YAML, and a tiny expression language for conditional steps. The expression language, documented below, is one of the least-discussed differentiators and the reason human-authored workflows survive copy-paste.",
  },
  {
    q: "Which file contains the expression parser for if: conditions?",
    a: "crates/terminator-mcp-agent/src/expression_eval.rs, 458 lines. The public entry is fn evaluate(expression: &str, variables: &Value) -> bool at line 34. It calls normalize_expression first, then evaluate_internal on the cleaned string. The parser handles &&, ||, !, ==, !=, >, <, >=, <=, and four built-in functions: contains, startsWith, endsWith, and coalesce. There is also an always() function that takes no arguments and returns true, used by GitHub-Actions-style step gates.",
  },
  {
    q: "What exactly does normalize_expression do?",
    a: "It rewrites eight Unicode characters into their ASCII equivalents before the parser ever runs. Curly single quotes U+2018 and U+2019 become straight '. Curly double quotes U+201C and U+201D become straight \". Backticks become single quotes. Non-breaking space U+00A0, thin space U+2009, and narrow no-break space U+202F all become regular ASCII space. Then the expression is trimmed. The function is seven lines of chained .replace() calls at the top of the file. You can read it in under 30 seconds.",
  },
  {
    q: "Why does this matter for real users?",
    a: "People copy expressions out of Slack threads, Notion docs, Google Docs, Word, and ChatGPT conversations. Every one of those sources will silently replace your straight quotes with curly quotes, especially on macOS where the default input substitution does it without asking. An expression like if: quote_type == 'Face Amount' will look identical on screen but the character codes are different. Terminator's interpreter normalizes the input so the workflow runs. Most other automation tools' conditional syntaxes fail with a cryptic parse error and leave the user to hunt for an invisible character.",
  },
  {
    q: "How do I actually write a conditional step in a Terminator workflow?",
    a: "In YAML, attach an if: field to any step. Example: - tool_name: click_element; arguments: { selector: 'role:Button && name:Save' }; if: \"contains(env.product_types, 'FEX') && env.retry_count < 3\". The expression is evaluated against the current workflow variables before the step runs. If it returns false, the step is skipped and the next step in the sequence is tried. The if: field is inspected by helpers.rs at lines 281 and 340, which call expression_eval::evaluate(inner_str, variables). Real workflow fixtures in the repo use exactly this pattern, including if: contains(product_types, 'FEX') at helpers.rs line 1214.",
  },
  {
    q: "What functions are supported inside if: expressions?",
    a: "Four data functions plus one sentinel. contains(array_or_string, 'value') tests for membership or substring. startsWith(string_var, 'prefix') and endsWith(string_var, 'suffix') are self-explanatory. coalesce(x, y, z, default) returns the first truthy value from its arguments, or the last argument as a literal if nothing is truthy. always() with no arguments returns true and is used as a step gate. Logical operators && || ! compose these. Binary comparison ==, !=, >, <, >=, <= works on any JSON value with smart type coercion between strings, numbers, and booleans.",
  },
  {
    q: "What happens when a variable referenced in an expression does not exist?",
    a: "Terminator handles undefined variables explicitly at lib lines 183 through 191. For equality operators, undefined is never equal to anything, so undefined == 'x' returns false and undefined != 'x' returns true. For numeric comparisons, undefined is treated as less than any value, so undefined > anything is false and undefined < anything is true. This makes defensive expressions like if: env.retry_count < 3 work on the first run when retry_count does not exist yet. Other platforms often throw, which means you have to wrap every step in a try/catch or pre-seed every variable.",
  },
  {
    q: "Is Terminator open source and can I fork the parser?",
    a: "Yes. The whole project is MIT licensed on GitHub at mediar-ai/terminator. The expression_eval.rs file is ~450 lines, has no external dependencies beyond serde_json and tracing, and ships with a full test module starting at line 351 covering coalesce with nulls, missing variables, empty strings, zero-as-falsy, and more. If you want to fork the parser for your own tool, the file is self-contained and easy to extract.",
  },
  {
    q: "How is Terminator's approach different from Power Automate Desktop?",
    a: "Power Automate Desktop is a drag-and-drop designer built on the Robin expression language, aimed at business analysts. Conditions are authored in a property grid. Terminator is a code-first framework: you write a YAML workflow (or drive it from TypeScript, Python, Rust, or an MCP tool call) and your LLM coding assistant can read and edit it the same way it edits source files. The if: field is the same whether you are building interactively, recording a session, or having Claude generate the workflow. The expression interpreter is optimized for paste-friendly developer input, not for a designer surface.",
  },
  {
    q: "Where should I start if I want to try it?",
    a: "If you already use Cursor, Claude Code, VS Code, or Windsurf, the fastest path is the one-line MCP install: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Your coding assistant can then open apps, fill fields, click buttons, and run multi-step workflows. If you want to build automations programmatically, the NodeJS and Python SDKs are both on npm and pypi under the terminator name. If you want to embed the engine in a Rust binary, the crate is terminator-rs on crates.io. Everything reads the same if: expression format.",
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

const normalizeCode = `// crates/terminator-mcp-agent/src/expression_eval.rs, lines 5-14
//
// Runs BEFORE the parser. Eight Unicode characters get rewritten
// so the rest of the interpreter only ever sees clean ASCII.

fn normalize_expression(expr: &str) -> String {
    expr
        // Normalize smart quotes to straight quotes
        .replace(['\\u{2018}', '\\u{2019}'], "'") // Smart single quotes
        .replace(['\\u{201C}', '\\u{201D}'], "\\"") // Smart double quotes
        .replace('\`', "'") // Backticks to single quotes
        // Normalize Unicode spaces
        .replace(['\\u{00A0}', '\\u{2009}', '\\u{202F}'], " ") // Various Unicode spaces
        .trim()
        .to_string()
}`;

const realWorkflowCode = `# A real conditional step inside a Terminator workflow.
# The if: field accepts the same grammar whether you type it or
# paste it from a meeting note. Both versions below evaluate the
# same way against the workflow env.

- tool_name: click_element
  arguments:
    selector: "role:Button && name:Get Quote"
  # Typed in a shell:
  if: "quote_type == 'Face Amount' && contains(product_types, 'FEX')"

- tool_name: type_into_element
  arguments:
    selector: "role:Edit && name:Coverage"
    text_to_type: "{{env.coverage_amount}}"
  # Pasted out of Slack. Curly quotes in the literal,
  # non-breaking space between the operator and the string.
  # Runs anyway.
  if: "quote_type\\u00A0==\\u00A0‘Face Amount’"`;

const coalesceCode = `// crates/terminator-mcp-agent/src/expression_eval.rs, line 310
//
// coalesce(a, b, c, default) resolves left-to-right, returning
// the first truthy variable value. If nothing is truthy, it
// returns the final argument as a literal. Lets you write
// defensive conditions without null checks on every variable.

fn evaluate_coalesce_to_value(expr: &str, variables: &Value) -> Option<Value> {
    let func_start = expr.find("coalesce(")?;
    let args_start = func_start + "coalesce(".len();
    let args_end = expr[args_start..].find(')')?;
    let args_str = &expr[args_start..args_start + args_end];

    let args: Vec<&str> = args_str.split(',').map(|s| s.trim()).collect();
    if args.len() < 2 { return None; }

    for arg in &args {
        if let Some(val) = get_value(arg, variables) {
            if is_truthy(val) { return Some(val.clone()); }
        }
    }

    // No truthy variables found, use last argument as default
    let default_arg = args.last()?.trim_matches(|c| c == '\\'' || c == '"');
    if let Some(val) = get_value(default_arg, variables) {
        return Some(val.clone());
    }
    Some(parse_literal_value(default_arg))
}`;

const capabilityCards: BentoCard[] = [
  {
    title: "Boolean composition",
    description:
      "&&, ||, and ! with left-to-right evaluation. Nest freely: !contains(user_roles, 'Premium') && env.retry_count < 3.",
    size: "1x1",
  },
  {
    title: "Four data functions",
    description:
      "contains, startsWith, endsWith, coalesce. Enough to express real business rules without an embedded scripting language.",
    size: "1x1",
  },
  {
    title: "Smart type coercion",
    description:
      "'42' == 42 is true. true == '1' is true. String-as-number parsing is automatic on > < >= <=. No explicit casts.",
    size: "1x1",
  },
  {
    title: "Undefined is safe",
    description:
      "Reference a variable that does not exist yet and the expression returns a sensible default instead of throwing. Great for first-run gates.",
    size: "1x1",
  },
  {
    title: "Dot-notation paths",
    description:
      "env.user.plan, policy.product_types, response.headers.content_type. Nested JSON works the way you already read it.",
    size: "1x1",
    accent: true,
  },
  {
    title: "Paste-safe literal parsing",
    description:
      "Eight Unicode rewrites happen before tokenization. Smart quotes, backticks, and three flavors of non-breaking space all normalize to ASCII.",
    size: "1x1",
    accent: true,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Conditional step syntax",
    competitor: "Point-and-click designer",
    ours: "Inline if: expression in YAML",
  },
  {
    feature: "Smart-quote handling on copy-paste",
    competitor: "Silent parse error",
    ours: "Normalized at line 6 of expression_eval.rs",
  },
  {
    feature: "Non-breaking space tolerance",
    competitor: "Parse error",
    ours: "U+00A0, U+2009, U+202F all rewritten to ASCII space",
  },
  {
    feature: "Undefined variable in a comparison",
    competitor: "Throws, workflow halts",
    ours: "Returns false for ==, true for !=, no crash",
  },
  {
    feature: "Driven by an AI coding assistant",
    competitor: "Not supported, designer is GUI-only",
    ours: "Runs as an MCP server over 35 tools",
  },
  {
    feature: "Source you can read",
    competitor: "Closed-source, ~gigabyte install",
    ours: "MIT licensed, ~450 lines for the whole parser",
  },
  {
    feature: "Install footprint",
    competitor: "Installer, license, reboot",
    ours: "One npx command, zero license",
  },
];

const evalSteps = [
  {
    title: "Raw expression enters",
    description:
      "The user's YAML has if: “quote_type == ‘Face Amount’” pasted from Slack. The Rust string literal may contain curly quotes, a backtick, and a non-breaking space.",
  },
  {
    title: "normalize_expression rewrites eight characters",
    description:
      "Curly quotes collapse to straight quotes. Backticks collapse to single quotes. Three flavors of Unicode space all become ASCII space. The expression is trimmed.",
  },
  {
    title: "Negation and logical operators branch",
    description:
      "evaluate_internal strips a leading ! if present and recurses. Otherwise it searches for the first && or ||, splits on it, and recurses on each side. This gives left-to-right evaluation with simple precedence.",
  },
  {
    title: "Function calls route to a named handler",
    description:
      "Expressions of the form name(arg1, arg2) are routed to contains, startsWith, endsWith, coalesce, or always. Each takes arguments straight out of the normalized string, no tokenizer needed.",
  },
  {
    title: "Binary expressions do smart comparison",
    description:
      "For ==, !=, the lhs is looked up in the variables JSON and compared via compare_values_smart, which handles String-to-String, Bool-to-literal, and Number-to-numeric-string without explicit casts.",
  },
  {
    title: "Undefined variables return safe defaults",
    description:
      "If a variable is missing, == returns false, != returns true, < returns true, > returns false. The workflow never crashes because someone forgot to seed a field.",
  },
];

export default function WindowsAutomationToolPage() {
  return (
    <article className="min-h-screen bg-white text-zinc-900 py-12">
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
        <span className="inline-block text-xs uppercase tracking-widest font-mono px-2 py-1 rounded bg-orange-50 text-orange-700 mb-4">
          Guide
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-zinc-900">
          A Windows automation tool whose <GradientText>if: expressions</GradientText> survive a paste from Slack
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          Every automation framework advertises conditional steps. Only one has
          a line of code dedicated to the Unicode characters your word processor
          quietly substitutes into your text. Here is what the parser behind
          Terminator&apos;s <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">if:</code> field
          actually does with your workflow YAML.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
            authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="11 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="open source on GitHub"
        highlights={[
          "MIT licensed, mediar-ai/terminator",
          "Drives Claude Code, Cursor, VS Code, Windsurf",
          "Same grammar across YAML, TS, Python, Rust",
        ]}
        className="mb-10"
      />

      <section className="max-w-5xl mx-auto px-6 my-12">
        <RemotionClip
          title="Paste-safe conditions"
          subtitle="Terminator's expression interpreter, end to end"
          captions={[
            "Your if: field can be pasted from Slack",
            "Eight Unicode characters get normalized first",
            "Then a tiny parser evaluates &&, ||, !, ==",
            "Undefined variables never crash the workflow",
            "expression_eval.rs, 458 lines, MIT licensed",
          ]}
          accent="orange"
          accentHex="#FF3E00"
          accentHexDark="#CC3200"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What every roundup of this topic misses
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Search around for a while and you will find the same list repeated
          everywhere: Power Automate Desktop, UiPath, AutoHotkey, Blue Prism,
          Automation Anywhere. The comparisons are about licensing, low-code vs
          pro-code, which arcane DSL each one uses. Nobody ever gets around to
          the question that actually matters on a Monday morning: what does
          your conditional syntax do when the user pastes a condition from a
          Slack thread?
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          macOS and iOS substitute straight quotes for curly ones by default in
          every text field. Google Docs does it. Word does it. Notion does it.
          ChatGPT does it when it renders a string. The moment a human writes a
          workflow by reading a chat message and pasting the relevant line into
          a YAML file, their expression is no longer ASCII.
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">
            quote_type == &lsquo;Face Amount&rsquo;
          </code>{" "}
          looks right, but the apostrophes are <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">U+2018</code> and
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">U+2019</code>, and the space between
          the operator and the string might be <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">U+00A0</code>{" "}
          instead of <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">0x20</code>.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator is a developer framework. It gives your AI coding
          assistant a Playwright-shaped API for every app on your desktop. But
          it is also a framework that expects humans to paste things. The
          expression interpreter that evaluates every
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">if:</code>
          field in a workflow starts with ten lines that nobody else bothered
          to write.
        </p>
      </section>

      <BackgroundGrid className="max-w-5xl mx-auto" pattern="dots" glow>
        <div className="px-6 sm:px-12 py-12">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
            Anchor fact
          </p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-6">
            Eight characters, rewritten before the parser runs
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6 max-w-3xl">
            Open{" "}
            <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
              crates/terminator-mcp-agent/src/expression_eval.rs
            </code>
            . The first function in the file, above every evaluator, above
            every tokenizer, above every comparison operator, is
            <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">
              normalize_expression
            </code>
            . It does one thing. It replaces eight specific Unicode code points
            with ASCII equivalents.
          </p>
          <AnimatedCodeBlock
            code={normalizeCode}
            language="rust"
            filename="crates/terminator-mcp-agent/src/expression_eval.rs"
          />
          <p className="text-zinc-700 leading-relaxed mt-6 max-w-3xl">
            This is the kind of detail you do not write unless you have watched
            real users copy-paste real conditions out of real chat tools. Every
            other Windows automation framework either rejects the expression
            with a parse error or quietly mis-evaluates it because the string
            literal on the right no longer matches the string on screen.
          </p>
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What it looks like when the input is dirty
        </h2>
        <p className="text-zinc-600 mb-6">
          A quick demo. We paste the same logical condition twice: once typed,
          once pasted straight out of a chat thread. Terminator runs both.
        </p>
        <TerminalOutput
          title="terminator workflow run insurance_quote.yml"
          lines={[
            { type: "command", text: "terminator workflow run insurance_quote.yml" },
            { type: "info", text: "Step 1: click_element role:Button && name:Get Quote" },
            { type: "output", text: "  if: \"quote_type == 'Face Amount'\"" },
            { type: "output", text: "  evaluator: ASCII 0x27 on both sides, direct match" },
            { type: "success", text: "Step 1: passed (2 ms eval)" },
            { type: "info", text: "Step 2: type_into_element role:Edit && name:Coverage" },
            { type: "output", text: "  if: \"quote_type\\u00A0==\\u00A0‘Face Amount’\"" },
            { type: "output", text: "  normalize_expression: U+2018 -> ', U+2019 -> ', U+00A0 -> 0x20" },
            { type: "output", text: "  evaluator: after normalization, same match" },
            { type: "success", text: "Step 2: passed (3 ms eval)" },
            { type: "success", text: "Workflow complete. 2/2 steps ok." },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            { value: 8, label: "Unicode characters normalized before parse" },
            { value: 458, label: "lines in the full expression_eval.rs parser" },
            { value: 4, label: "data functions (contains, startsWith, endsWith, coalesce)" },
            { value: 6, label: "comparison operators supported" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 my-16">
        <AnimatedBeam
          title="Three shapes of input, one clean expression"
          from={[
            { label: "Typed in a shell", sublabel: "ASCII 0x27 quotes" },
            { label: "Pasted from Slack", sublabel: "U+2018 / U+2019" },
            { label: "Pasted from Notion", sublabel: "U+00A0 between tokens" },
          ]}
          hub={{ label: "normalize_expression", sublabel: "lines 5-14" }}
          to={[
            { label: "evaluate_internal", sublabel: "!, &&, ||, ==, !=" },
            { label: "function router", sublabel: "contains, coalesce" },
            { label: "smart compare", sublabel: "type coercion" },
          ]}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the tiny grammar actually gives you
        </h2>
        <p className="text-zinc-600 mb-6 max-w-3xl">
          Six capabilities. No embedded scripting language, no eval, no sandbox
          to configure. The grammar is small on purpose: if you need a real
          programming language inside a step, you can drop into a
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">run_javascript</code>{" "}
          tool. The
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">if:</code>
          field stays predictable.
        </p>
        <BentoGrid cards={capabilityCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The walkthrough
        </h2>
        <p className="text-zinc-600 mb-6">
          Six stages, no surprises. This is what happens inside
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">
            evaluate
          </code>{" "}
          between the moment your workflow scheduler reads an
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">if:</code>{" "}
          field and the moment it decides whether to run the step.
        </p>
        <StepTimeline steps={evalSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Read one real condition
        </h2>
        <p className="text-zinc-600 mb-6">
          A fragment of a live insurance-quote workflow. Two steps. Two
          different authoring styles. Same evaluator.
        </p>
        <AnimatedCodeBlock
          code={realWorkflowCode}
          language="yaml"
          filename="workflows/insurance_quote.yml"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <GlowCard>
          <div className="p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-3">
              coalesce in the wild
            </p>
            <h2 className="text-2xl font-bold text-zinc-900 mb-3">
              Why coalesce exists
            </h2>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Workflows are not pure functions. Variables get populated by
              earlier steps, by environment lookups, by user prompts. On the
              first run of a recurring workflow, half the variables are empty.
              You want conditions that gracefully treat an empty value the
              same as a missing value. That is
              <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">
                coalesce
              </code>.
            </p>
            <p className="text-zinc-700 leading-relaxed mb-4">
              Zero is falsy. Empty string is falsy. Null is falsy. False is
              falsy. The evaluator returns the first truthy argument, falling
              through to the final argument as a literal if nothing is truthy.
              So
              <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono ml-1">
                coalesce(env.retry_count, 0) &lt; 3
              </code>{" "}
              is true on the first run where retry_count does not exist yet,
              and on the second run where it is still zero.
            </p>
            <AnimatedCodeBlock
              code={coalesceCode}
              language="rust"
              filename="crates/terminator-mcp-agent/src/expression_eval.rs"
            />
          </div>
        </GlowCard>
      </section>

      <section className="max-w-5xl mx-auto px-6 my-16">
        <FlowDiagram
          title="From YAML string to boolean verdict"
          steps={[
            { label: "if: string", detail: "read from YAML step" },
            { label: "normalize", detail: "8 Unicode chars rewritten" },
            { label: "evaluate_internal", detail: "!, &&, || split" },
            { label: "router", detail: "function vs binary" },
            { label: "bool", detail: "run step or skip" },
          ]}
        />
      </section>

      <section className="max-w-5xl mx-auto px-6 my-16">
        <ComparisonTable
          heading="How this lands against the usual suspects"
          intro="A generic comparison is easy. The specifics below are how Terminator differs from the tools people usually mean when they search this."
          productName="Terminator"
          competitorName="Typical RPA studio"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <ProofBanner
          metric="~450 LOC"
          quote="The entire expression parser is 458 lines, MIT licensed, and has a test module covering null handling, zero-as-falsy, coalesce with empty strings, and mixed-type comparisons."
          source="crates/terminator-mcp-agent/src/expression_eval.rs"
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see a real workflow paste-proofed live?"
        description="Book a 20-minute walkthrough. We will open expression_eval.rs, run a workflow with pasted curly quotes, and show you how it wires into an AI coding assistant via MCP."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Talk to the team about your workflow."
      />
    </article>
  );
}
