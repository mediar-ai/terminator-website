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
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  CodeComparison,
  ComparisonTable,
  BeforeAfter,
  StepTimeline,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/uipath-desktop-automation";
const PUBLISHED = "2026-04-24";
const TITLE =
  "UiPath desktop automation for developers: a selector grammar with operator precedence, not an XML editor";
const DESCRIPTION =
  "Most explainers about UiPath desktop automation describe XML selectors with wnd and ctrl tags configured inside Studio's Selector Editor. Terminator takes the same Windows UI Automation primitives and exposes them through a single-string boolean expression grammar with parentheses, AND, OR, NOT, descendant chaining (>>), spatial operators (rightof:, above:), and a has: predicate, parsed by a Shunting Yard algorithm in crates/terminator/src/selector.rs. Same UIA tree underneath, very different surface for code and AI agents.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Selector grammar with operator precedence (Or=1, And=2, Not=3), Shunting Yard parser, 23-variant Selector enum, descendant chaining via >>. Same UIA primitives as UiPath, different surface.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "UiPath desktop automation, rewritten as a selector expression language",
    description:
      "Boolean operators, parentheses, NOT, descendant chains, spatial selectors, has(): all parsed in selector.rs and callable from any AI coding assistant via MCP.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "UiPath desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "UiPath desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Is Terminator a UiPath replacement?",
    a: "Not as a like-for-like swap. UiPath is a closed-source platform with Studio (a visual designer), Orchestrator (a job scheduler), and a robot license model. Terminator is a developer framework: an MIT-licensed Rust core, an MCP server (terminator-mcp-agent on npm), and SDKs for TypeScript, Python, and Rust. Both sit on top of Windows UI Automation, so the underlying selectors target the same elements (Pane, Edit, Button, ListItem, etc.). The difference is the authoring surface. UiPath workflows are XAML files with XML selector strings dragged together in Studio. Terminator workflows are TypeScript files an AI coding assistant or a developer writes directly, with selectors expressed as boolean expressions parsed by a real grammar.",
  },
  {
    q: "What does the selector grammar actually look like?",
    a: "A single string. Examples: role:Button|name:Save (legacy single-pipe role + name). (role:Window && name:Best Plan Pro) >> nativeid:dob (a chained, AND-grouped expression). role:Edit && !visible:false (NOT operator). rightof:role:Label|name:Email (spatial, find an element to the right of an anchor). has:role:Image (descendant predicate, like Playwright's :has()). All of those parse through the same code path in crates/terminator/src/selector.rs. The tokenizer handles &&, ||, ',' (also OR), !, (, ), and >>. parse_boolean_expression then runs a Shunting Yard pass with operator_precedence Or=1, And=2, Not=3.",
  },
  {
    q: "How is that different from UiPath's strict and fuzzy selectors?",
    a: "UiPath stores a selector as an XML fragment, e.g. <wnd app='notepad.exe' cls='Notepad' /><ctrl name='Text Editor' role='editable text' />. Each tag is one element in the path, attributes inside the tag are matched as flat key=value pairs, and you toggle between strict matching and fuzzy (with attributes like matching:aaname='fuzzy' and fuzzylevel:aaname='0.4') in Studio's Selector Editor. There is no AND/OR/NOT between attributes, no parentheses, no operator precedence. Terminator's expression grammar gives you those primitives. The tradeoff is honest: UiPath's editor is friendlier for someone hand-clicking through a UI; the grammar is friendlier for code that an AI generates and edits, and for selectors that need composition.",
  },
  {
    q: "Where exactly does the parser live?",
    a: "crates/terminator/src/selector.rs in the Terminator repository. The Selector enum is at the top of the file with 23 variants (Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has, Parent, And, Or, Not, plus Invalid for parse failures). The tokenizer is fn tokenize starting around line 94. The Shunting Yard parser is fn parse_boolean_expression starting around line 215. The descendant chain split on >> happens earlier, in the From<&str> impl at line 478, because >> has priority over the boolean operators and produces a Selector::Chain.",
  },
  {
    q: "What spatial selectors are supported?",
    a: "Five: rightof:, leftof:, above:, below:, and near:. Each takes another selector as its inner expression. So rightof:role:Label|name:Email finds elements that are rightward of the labelled Email field. These are useful when an input has no native accessibility name but always sits next to a label that does. They are listed as variants in the Selector enum (RightOf, LeftOf, Above, Below, Near) and are dispatched by parse_atomic_selector in the same file.",
  },
  {
    q: "Does Terminator support attended automation, the way UiPath Assistant does?",
    a: "Terminator runs from your own session. It uses your existing browser session, so cookies and logins survive. It does not take over your cursor and keyboard the way a foreground RDA bot does. You can wire that into an attended-style trigger (a hotkey, an MCP tool call from your assistant, a CLI command) or into an unattended job runner. The framework is neutral about whether a human is at the keyboard; what it gives you is the underlying selector engine, the action API (click, type, press, drag), the workflow recorder, and an MCP server. Composition is up to you.",
  },
  {
    q: "Can an AI coding assistant actually use this without a designer?",
    a: "Yes, that is the design point. Add the MCP agent with claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. Your assistant gets ~35 tools registered, including get_window_tree (returns the live UIA tree as JSON), click_element (takes a selector string), and execute_sequence (runs a YAML or TS workflow). The assistant composes selector strings the same way it composes Playwright selectors for the web. Because the grammar has operator precedence and a typed AST, the assistant can reason about a selector as an expression, not as a stringly-typed XML blob it has to template.",
  },
  {
    q: "What about the things UiPath gives you that this does not?",
    a: "Several real gaps. UiPath ships Studio, a visual designer that beginners can use to build a workflow without writing code; Terminator does not. UiPath has Orchestrator, a hosted control plane for scheduling jobs across many robots; Terminator does not (you bring your own runner). UiPath has a marketplace of pre-built activities and connectors; Terminator has SDKs and examples but no marketplace. UiPath has formal enterprise support contracts; Terminator is community-supported under MIT. If your team's workflow assumes a designer-first authoring loop and a centralised job board, UiPath is a different category of tool. If your workflow is 'an LLM writes the automation', Terminator's surface is the one shaped for that.",
  },
];

const selectorComparisonRows: ComparisonRow[] = [
  {
    feature: "Selector representation",
    competitor: "XML fragment, one tag per ancestor (e.g. <wnd app='notepad.exe' /><ctrl name='Edit' />)",
    ours: "Single-string boolean expression (e.g. (role:Window && name:Notepad) >> role:Edit)",
  },
  {
    feature: "Logical operators between attributes",
    competitor: "Implicit AND only (every attribute on a tag must match)",
    ours: "Explicit && (AND), || (OR), , (also OR), ! (NOT), with parentheses for grouping",
  },
  {
    feature: "Operator precedence",
    competitor: "Not applicable, attributes are flat key=value pairs",
    ours: "Shunting Yard with operator_precedence (Or=1, And=2, Not=3)",
  },
  {
    feature: "Descendant chaining",
    competitor: "Implied by tag order in the XML fragment",
    ours: ">> operator splits into a Selector::Chain of independent expressions",
  },
  {
    feature: "Spatial selectors",
    competitor: "Anchor-based with the Anchor Base activity",
    ours: "rightof:, leftof:, above:, below:, near: as first-class atomic selectors",
  },
  {
    feature: "Has-descendant predicate",
    competitor: "Workaround via Find Children + filtering",
    ours: "has:<inner-selector> as an atomic selector, parsed into Selector::Has",
  },
  {
    feature: "Parent navigation",
    competitor: "GetParent activity",
    ours: ".. as a literal selector token, parsed into Selector::Parent",
  },
  {
    feature: "Invalid input behaviour",
    competitor: "Selector Editor flags the field, run-time exception otherwise",
    ours: "Selector::Invalid(reason) variant returned by the parser, surfaced before execution",
  },
  {
    feature: "Author",
    competitor: "Human in Studio's Selector Editor (Ctrl+E)",
    ours: "Code, or an AI coding assistant emitting a string into a TypeScript file",
  },
  {
    feature: "License of the engine",
    competitor: "Vendor-proprietary, requires a UiPath licence to run at scale",
    ours: "MIT, Rust crate terminator-rs on crates.io",
  },
];

const remotionCaptions = [
  "Same Windows UIA tree underneath.",
  "Different surface on top.",
  "One string. AND, OR, NOT, parens.",
  ">> chains. rightof: anchors. has() filters.",
  "An AI coding assistant writes it directly.",
];

const selectorEnumSnippet = `// crates/terminator/src/selector.rs

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub enum Selector {
    Role { role: String, name: Option<String> },
    Id(String),
    Name(String),
    Text(String),
    Path(String),
    NativeId(String),
    Attributes(BTreeMap<String, String>),
    Filter(usize),
    Chain(Vec<Selector>),
    ClassName(String),
    Visible(bool),
    LocalizedRole(String),
    Process(String),
    RightOf(Box<Selector>),
    LeftOf(Box<Selector>),
    Above(Box<Selector>),
    Below(Box<Selector>),
    Near(Box<Selector>),
    Nth(i32),
    Has(Box<Selector>),
    Parent,
    And(Vec<Selector>),
    Or(Vec<Selector>),
    Not(Box<Selector>),
    Invalid(String),
}`;

const shuntingYardSnippet = `// parse_boolean_expression: Shunting Yard over selector tokens

fn operator_precedence(token: &Token) -> i32 {
    match token {
        Token::Or  => 1,
        Token::And => 2,
        Token::Not => 3,
        _          => 0,
    }
}

fn parse_boolean_expression(tokens: Vec<Token>) -> Result<Selector, String> {
    let mut output_queue: Vec<Selector> = Vec::new();
    let mut operator_stack: Vec<Token>  = Vec::new();

    for token in tokens {
        match token {
            Token::Selector(s) => output_queue.push(parse_atomic_selector(&s)),
            Token::LParen      => operator_stack.push(token),
            Token::RParen => {
                while let Some(op) = operator_stack.pop() {
                    if op == Token::LParen { break; }
                    apply_operator(op, &mut output_queue)?;
                }
            }
            Token::And | Token::Or | Token::Not => {
                while let Some(top) = operator_stack.last() {
                    if *top == Token::LParen { break; }
                    if operator_precedence(top) >= operator_precedence(&token) {
                        let op = operator_stack.pop().unwrap();
                        apply_operator(op, &mut output_queue)?;
                    } else { break; }
                }
                operator_stack.push(token);
            }
        }
    }

    while let Some(op) = operator_stack.pop() {
        apply_operator(op, &mut output_queue)?;
    }
    Ok(output_queue.pop().expect("non-empty"))
}`;

const chainSnippet = `// >> has higher priority than the boolean operators.
// It splits the input first and produces a Selector::Chain.

impl From<&str> for Selector {
    fn from(s: &str) -> Self {
        let s = s.trim();

        if s.contains(">>") {
            let parts: Vec<&str> = s.split(">>").map(|p| p.trim()).collect();
            if parts.len() > 1 {
                let cleaned: Vec<Selector> = parts
                    .into_iter()
                    .map(|part| Selector::from(strip_outer_parens(part)))
                    .collect();
                return Selector::Chain(cleaned);
            }
        }

        // ... boolean expression parsing happens after this
    }
}`;

const uipathSelectorSnippet = `<!-- A typical UiPath selector. Edited in Studio's Selector Editor (Ctrl+E).
     Attributes inside one tag are an implicit AND.
     There is no OR, no NOT, no parentheses, no precedence. -->
<wnd app='notepad.exe' cls='Notepad' />
<ctrl name='Text Editor' role='editable text' />`;

const terminatorSelectorSnippet = `// The same target, expressed as a Terminator selector string.
// Parsed once into a typed AST. Composes with operators and spatial helpers.

const editor = await desktop
  .locator(
    "(process:notepad && role:Window) >> role:Edit && !visible:false"
  )
  .first(2000);

await editor.typeText("Same UIA tree, different surface.");`;

const recipeSnippet = `// Examples that exercise different parts of the grammar.

// 1. Boolean AND with parentheses
desktop.locator("(role:Button && name:Save) || (role:Button && name:Submit)");

// 2. Spatial: the Edit field to the right of the "Email" label
desktop.locator("rightof:role:Label|name:Email");

// 3. has(): a Pane that contains an Image (Playwright-style)
desktop.locator("role:Pane && has:role:Image");

// 4. Negation: visible Buttons that are not disabled
desktop.locator("role:Button && !attr:disabled=true");

// 5. Descendant chain: the Notepad Edit, regardless of intermediate frames
desktop.locator("process:notepad >> role:Edit");

// 6. Nth: the third row in a list
desktop.locator("role:ListItem >> nth:2");`;

const installSteps = [
  {
    title: "Install the framework",
    description:
      "npm i @mediar-ai/terminator on Windows for the TypeScript SDK, or cargo add terminator-rs for Rust. The selector grammar lives in the Rust core and is shared by every SDK. Python (terminator.py) is partial today.",
  },
  {
    title: "Wire it into your AI assistant",
    description:
      "claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. The MCP server exposes ~35 tools: get_window_tree, click_element, execute_sequence, typecheck_workflow, and more. The assistant calls them with selector strings.",
  },
  {
    title: "Inspect the live UI tree",
    description:
      "Use Accessibility Insights for Windows or inspect.exe to see what UIA reports for the app you want to drive. Names, roles, AutomationIDs, ClassNames are exactly what you put after the colons in the selector grammar (name:, role:, nativeid:, classname:).",
  },
  {
    title: "Compose, run, refine",
    description:
      "Write the workflow as a TypeScript file using @mediar-ai/workflow's createStep / createWorkflow. Each step takes a desktop instance and a Locator with a selector string. If a selector is wrong, the parser returns a Selector::Invalid(reason) before any click runs.",
  },
];

const sequenceMessages: Array<{
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}> = [
  {
    from: 0,
    to: 1,
    label: "desktop.locator(\"(role:Window && name:Notepad) >> role:Edit\")",
    type: "request",
  },
  { from: 1, to: 2, label: "Selector::from(&str) splits on '>>'", type: "event" },
  { from: 2, to: 2, label: "tokenize each segment, run Shunting Yard", type: "event" },
  {
    from: 2,
    to: 1,
    label: "Selector::Chain([And([Role, Name]), Role(Edit)])",
    type: "response",
  },
  { from: 1, to: 3, label: "engine.find_element(&selector, ...)", type: "request" },
  { from: 3, to: 3, label: "walk Windows UIA tree, match each chained selector", type: "event" },
  { from: 3, to: 1, label: "UIElement (UIA pointer + cached props)", type: "response" },
  { from: 1, to: 0, label: "Locator wrapper, ready for .typeText() / .click()", type: "response" },
];

const beamFrom = [
  { label: "&&  ||  ,  !  ( )", sublabel: "boolean tokenizer" },
  { label: ">>", sublabel: "descendant chain split" },
  { label: "rightof: above: has: ..", sublabel: "atomic selector prefixes" },
];

const beamHub = {
  label: "selector.rs",
  sublabel: "23-variant Selector AST",
};

const beamTo = [
  { label: "Windows UIA", sublabel: "uiautomation crate" },
  { label: "Browser DOM", sublabel: "Chrome extension bridge" },
  { label: "OCR fallback", sublabel: "uni_ocr / WinOcr" },
];

const grammarChips: Array<{ token: string; meaning: string }> = [
  { token: "&&", meaning: "AND, precedence 2" },
  { token: "||", meaning: "OR, precedence 1" },
  { token: ",", meaning: "OR (alias for ||)" },
  { token: "!", meaning: "NOT, precedence 3" },
  { token: "(  )", meaning: "grouping" },
  { token: ">>", meaning: "descendant chain (highest priority)" },
  { token: "role:", meaning: "control type, e.g. Button, Edit, Pane" },
  { token: "name:", meaning: "accessibility name" },
  { token: "nativeid:", meaning: "AutomationId on Windows" },
  { token: "classname:", meaning: "WinForms / Win32 ClassName" },
  { token: "process:", meaning: "owning process name" },
  { token: "text:", meaning: "visible text content" },
  { token: "attr:k=v", meaning: "arbitrary attribute key/value" },
  { token: "visible:true", meaning: "filter by on-screen visibility" },
  { token: "rightof: above: leftof: below: near:", meaning: "spatial anchors" },
  { token: "has:<sel>", meaning: ":has()-style descendant predicate" },
  { token: "nth:N", meaning: "N-th match (zero-indexed)" },
  { token: "..", meaning: "parent" },
];

const terminalLines = [
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "[terminator] MCP server listening on stdio", type: "output" as const },
  { text: "[terminator] tools registered: 35", type: "output" as const },
  {
    text: "[claude] click_element(selector: \"(process:notepad && role:Window) >> role:Edit\")",
    type: "command" as const,
  },
  {
    text: "[selector] Selector::Chain([And([Process('notepad'), Role{Window}]), Role{Edit}])",
    type: "output" as const,
  },
  { text: "[engine] walking UIA tree from desktop root", type: "output" as const },
  { text: "[engine] match: Window 'Untitled - Notepad' (PID 18472)", type: "output" as const },
  { text: "[engine] match: Edit 'Text Editor' (AutomationId '15')", type: "output" as const },
  { text: "[engine] click sent (340ms)", type: "success" as const },
  {
    text: "[claude] click_element(selector: \"role:Button && name:Bogus || \")",
    type: "command" as const,
  },
  {
    text: "[selector] Selector::Invalid('Parse error: OR operator requires two operands')",
    type: "error" as const,
  },
  {
    text: "[claude] retries with \"role:Button && name:Bogus\" -- no element found, raises ElementNotFound",
    type: "output" as const,
  },
];

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchema = faqPageSchema(faqs);

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

      <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <BackgroundGrid pattern="dots" glow>
          <div className="py-10">
            <ArticleMeta
              datePublished={PUBLISHED}
              author="Matthew Diakonov"
            authorRole="Written with AI"
              readingTime="13 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              UiPath desktop automation, rewritten as a{" "}
              <GradientText>selector expression language</GradientText> with operator precedence
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Most explainers about driving Windows desktop applications describe selectors as XML fragments. A{" "}
              <code>&lt;wnd&gt;</code> for the window, a <code>&lt;ctrl&gt;</code> for the control, attribute
              key=value pairs inside each tag, a Strict / Fuzzy toggle in a designer. That is the surface UiPath
              ships. Underneath both UiPath and Terminator sit on the same Microsoft UI Automation tree, the same
              roles (Pane, Edit, Button, ListItem), the same AutomationIds. Terminator changes the surface. The
              selector is one string. The grammar has <code>&amp;&amp;</code>, <code>||</code>, <code>!</code>,{" "}
              <code>( )</code>, descendant chaining via <code>&gt;&gt;</code>, spatial operators like{" "}
              <code>rightof:</code>, and a <code>has:</code> predicate. It is parsed by a Shunting Yard algorithm
              into a 23-variant typed AST. The whole point is so an AI coding assistant can compose, edit, and
              reason about selectors as expressions, not as XML it has to template.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={5.0}
          ratingCount="MIT, MCP-native, single-string grammar over Windows UIA"
          highlights={[
            "Shunting Yard parser in selector.rs, operator_precedence Or=1, And=2, Not=3",
            "23-variant Selector AST including spatial, has(), parent, nth",
            "Same Windows UIA primitives as UiPath, exposed as code",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="Selectors as a real grammar, not an XML editor."
            subtitle="Same Windows UI Automation tree underneath. Different surface for code and AI agents."
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What every UiPath explainer leaves on the table
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open ten guides about driving desktop apps from a script. They will all describe the same XML form:
            one tag per element in the path, attributes as flat key=value pairs, a Strict mode that requires
            every attribute to match exactly, a Fuzzy mode that lets attributes drift with{" "}
            <code>matching:aaname=&apos;fuzzy&apos;</code> and <code>fuzzylevel:aaname=&apos;0.4&apos;</code>.
            They will describe Studio&apos;s Selector Editor (Ctrl+E) and the UI Explorer overlay. They will
            mention anchor-based matching for elements with no useful accessibility name. None of them present
            the option that this page is about: a selector grammar with parentheses, operator precedence, and a
            real parser. That option exists. It is the surface Terminator chose because the operator writing the
            workflow is now often an LLM, and an LLM is much better at composing an expression than at hand-editing
            XML fragments inside a designer.
          </p>
          <div className="mt-6">
            <Marquee speed={40} fade pauseOnHover>
              <div className="flex gap-3 pr-3">
                {grammarChips.map((c) => (
                  <span
                    key={c.token}
                    className="whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
                  >
                    <span className="font-mono font-semibold text-zinc-900">{c.token}</span>
                    <span className="mx-2 text-zinc-400">|</span>
                    <span className="text-zinc-600">{c.meaning}</span>
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: one file, one Shunting Yard pass, 23 AST variants
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                The implementation lives in{" "}
                <code>crates/terminator/src/selector.rs</code>. The first thing the file declares is a{" "}
                <code>Selector</code> enum with twenty-three variants. Eight cover atomic match types
                (<code>Role</code>, <code>Id</code>, <code>Name</code>, <code>Text</code>, <code>Path</code>,{" "}
                <code>NativeId</code>, <code>Attributes</code>, <code>ClassName</code>). Five are spatial
                (<code>RightOf</code>, <code>LeftOf</code>, <code>Above</code>, <code>Below</code>,{" "}
                <code>Near</code>). Three are predicates and traversal (<code>Has</code>, <code>Parent</code>,{" "}
                <code>Nth</code>). Three are logical (<code>And</code>, <code>Or</code>, <code>Not</code>). One
                is the descendant <code>Chain</code>. The remaining variants cover process scoping, visibility
                filtering, localized roles, and an explicit <code>Invalid(reason)</code> return that the parser
                produces when the input string does not parse, so a malformed selector never silently turns
                into an unintended match.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The selector AST, top of selector.rs
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Twenty-three variants. The interesting ones for a reader coming from a UiPath background are the
            five spatial variants and the boolean group. UiPath has spatial matching through anchors, but it is
            an activity that wraps two selectors. Here it is a single selector token (<code>rightof:</code>) that
            takes another selector as its inner argument and parses the same way as everything else.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={selectorEnumSnippet}
              language="rust"
              filename="crates/terminator/src/selector.rs (top)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The parser. Shunting Yard, three precedence levels, no surprises.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <code>Or</code> has precedence 1, <code>And</code> has precedence 2, <code>Not</code> has
            precedence 3. The output queue holds <code>Selector</code> values, the operator stack holds tokens.
            Same algorithm Dijkstra wrote for arithmetic expressions in 1961, applied to a tiny boolean algebra
            over UI matchers. The full implementation is fewer than seventy lines.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={shuntingYardSnippet}
              language="rust"
              filename="parse_boolean_expression (selector.rs)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why <code className="text-orange-600">&gt;&gt;</code> is parsed before everything else
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Descendant chaining is not a boolean operator. <code>(role:Window && name:Notepad) &gt;&gt;
            role:Edit</code> means: find a Window whose name is Notepad, and inside that, find an Edit. Each
            side of <code>&gt;&gt;</code> is itself a complete selector expression. The <code>From&lt;&amp;str&gt;</code>{" "}
            implementation splits on <code>&gt;&gt;</code> first and recursively parses each segment, producing a{" "}
            <code>Selector::Chain</code>. Inside each segment, the boolean operators are then resolved with the
            Shunting Yard pass.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={chainSnippet}
              language="rust"
              filename="impl From<&str> for Selector (selector.rs)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Side by side: same target, two surfaces
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Notepad&apos;s text area is a single element in the Windows UIA tree. UiPath addresses it with an
            XML fragment configured in Studio. Terminator addresses it with a single string parsed into a
            chained boolean expression. The runtime does the same thing on both sides; the authoring surface is
            the part that differs.
          </p>
          <div className="mt-6">
            <CodeComparison
              title="UiPath XML selector vs. Terminator selector grammar"
              leftLabel="UiPath (XML in Studio's Selector Editor)"
              rightLabel="Terminator (selector grammar in TypeScript)"
              leftCode={uipathSelectorSnippet}
              rightCode={terminatorSelectorSnippet}
              leftLines={uipathSelectorSnippet.split("\n").length}
              rightLines={terminatorSelectorSnippet.split("\n").length}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Six recipes that exercise the grammar
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each one is a single string. Each one parses through{" "}
            <code>parse_atomic_selector</code> for the leaves and <code>parse_boolean_expression</code> for the
            operators. None of them require a designer or a manifest file.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={recipeSnippet}
              language="typescript"
              filename="six selector recipes"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What happens between <code>desktop.locator(...)</code> and the click
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four actors, eight messages, one round-trip through the parser, one walk of the live UIA tree. The
            assistant calls the SDK, the SDK constructs a Selector via <code>From&lt;&amp;str&gt;</code>, the
            engine walks the chain, and a <code>UIElement</code> comes back wrapped in a Locator. After that
            point, <code>.click()</code>, <code>.typeText()</code>, and friends are all that remains.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="Locator string -> Selector AST -> UIA element"
              actors={["AI assistant / dev", "SDK Locator", "selector.rs parser", "UIA engine"]}
              messages={sequenceMessages}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            With the grammar vs. without it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same intent, two authoring loops. One ends with a person in a designer dragging a UI Explorer
            crosshair and toggling Strict / Fuzzy on a per-attribute basis. The other ends with a string in a
            file an AI assistant just wrote, parsed in microseconds, and either an executable element or an
            <code>Invalid</code> variant the runtime can refuse to act on.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="XML selector in a designer vs. selector grammar in code"
              before={{
                label: "XML in Selector Editor",
                content:
                  "Open Studio. Drag the UI Explorer crosshair onto the target element. Read back an XML fragment with one tag per ancestor and key=value attributes inside each tag. Toggle Strict or Fuzzy attribute by attribute. Save as part of an activity inside a XAML file. Selector behaviour is implicit AND across attributes; for OR, NOT, or composition you escape into Anchor Base, Find Children, or Conditional activities.",
                highlights: [
                  "One tag per ancestor, attributes as flat pairs",
                  "Strict / Fuzzy toggle inside Studio",
                  "No AND/OR/NOT between attributes, no parentheses",
                  "Composition lives in surrounding activities, not the selector",
                ],
              }}
              after={{
                label: "Selector grammar in code",
                content:
                  "Write the selector as one string in a TypeScript file. The SDK parses it once into a typed AST. Boolean operators, NOT, and parentheses are part of the grammar. Descendant chaining is the >> operator, spatial matching is rightof: / leftof: / above: / below: / near:, descendant predicates are has:. A malformed input returns Selector::Invalid(reason) before any UI action runs.",
                highlights: [
                  "Single string, parsed into a 23-variant AST",
                  "Operator precedence: Not(3) > And(2) > Or(1)",
                  ">> chains, spatial selectors, has(), parent (..)",
                  "Invalid input is a typed variant, not a runtime surprise",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What a real MCP turn looks like on stdio
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One valid selector chains, walks the UIA tree, finds the element, and clicks. One malformed
            selector parses into <code>Selector::Invalid</code> and never reaches the engine. The assistant
            sees both responses on the same channel and can react in the next turn.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="claude_desktop -> terminator-mcp-agent (stderr tail)"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The four steps that get this wired into your assistant
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Nothing extra to install for the grammar specifically. It comes with the Rust core, which the
            Node and Python SDKs both link against, and it is the same parser the MCP agent uses when an AI
            assistant emits a selector.
          </p>
          <div className="mt-6">
            <StepTimeline steps={installSteps} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The comparison row that belongs in every roundup
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most comparisons of UiPath alternatives stop at license type, supported operating system, and
            recorder capability. The selector representation is the row that decides whether an LLM can author
            a workflow without a designer.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="UiPath desktop automation"
            rows={selectorComparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The numbers that describe the surface
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <NumberTicker value={1} /> file (selector.rs),{" "}
            <NumberTicker value={23} /> Selector AST variants,{" "}
            <NumberTicker value={3} /> precedence levels (Or=1, And=2, Not=3),{" "}
            <NumberTicker value={5} /> spatial operators (rightof, leftof, above, below, near),{" "}
            <NumberTicker value={1} /> descendant chain operator (
            <code className="font-mono">&gt;&gt;</code>), and{" "}
            <NumberTicker value={1} /> typed Invalid variant the parser returns instead of letting a malformed
            selector match anything.
          </p>
        </section>

        <section className="mt-14">
          <ProofBanner
            quote="The selector should be an expression an AI can compose. Not an XML fragment a person edits in a designer."
            source="selector.rs, terminator-rs"
            metric="23 AST variants"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Where this leaves UiPath, and where it does not
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            UiPath remains the right tool for an organisation that wants a designer-first authoring loop, a
            hosted control plane (Orchestrator), formal enterprise support, and a marketplace of pre-built
            activities. Terminator does not replace any of that. What Terminator replaces is the part of the
            workflow where a developer or an AI assistant is going to write code anyway. For that part, an XML
            fragment in a designer is a strange interchange format, and a parsed expression language is a more
            honest one.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Install with{" "}
            <code>claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;</code>. Ask your
            assistant to call <code>get_window_tree</code> on a running app. Watch what it emits as a selector
            string. The string will be a single line that parses cleanly through{" "}
            <code>selector.rs</code>. That is the entire pitch.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Walk through your hardest UiPath selector and rewrite it as a Terminator expression"
          description="Bring one selector you fight with regularly. We will open a live MCP session, get the live UIA tree, and rewrite the selector as a single string with the boolean grammar. You will see the AST it parses into, and the element it finds, on the same call."
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Frequently asked
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See your UiPath selector rewritten as a parsed Terminator expression."
      />
    </>
  );
}
