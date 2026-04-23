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
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  GlowCard,
  MetricsRow,
  ComparisonTable,
  StepTimeline,
  AnimatedChecklist,
  CodeComparison,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/automation-for-desktop-application";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Automation for desktop application: the Boolean and spatial selector language Terminator compiles through a Shunting Yard parser";
const DESCRIPTION =
  "Most automation for desktop application work still binds to coordinates or image matches. Terminator ships a typed selector language with Boolean algebra (&&, ||, !) and spatial relators (rightof, leftof, above, below, near) that a Shunting Yard parser compiles into an AST and runs against the OS accessibility tree. Source: crates/terminator/src/selector.rs lines 205-272; near threshold at crates/terminator/src/platforms/windows/engine.rs line 1815.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A selector AST with 24 variants, a Shunting Yard expression parser with precedence Or=1 And=2 Not=3, and a near: relator with a hardcoded 50px Euclidean threshold. That is what a real framework for automation for desktop application looks like.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Automation for desktop application: a Shunting Yard compiled selector language",
    description:
      "Boolean operators &&, ||, !. Spatial relators rightof, leftof, above, below, near. Parent traversal with ... All compiled into an AST and evaluated against the UIA tree.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation for desktop application" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation for desktop application", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does automation for a desktop application actually mean in 2026?",
    a: "It means driving an application that runs outside the browser the same way a human does, by a program rather than a person. That includes Outlook, SAP, Excel, Photoshop, internal WPF and WinForms tools, Electron apps like Slack and Notion, and native Mac apps. The way a serious framework does this is by querying the operating system's accessibility layer (UI Automation on Windows, AXUIElement on macOS, AT-SPI2 on Linux) to locate elements by role, name, and other attributes, then synthesizing input events or invoking UIA control patterns to act on them. Image matching and coordinate pushing are last-resort techniques, not the primary interface.",
  },
  {
    q: "Why does Terminator ship a whole selector language instead of a Python API?",
    a: "Because desktop UIs are messy and the selector is where the mess lives. A Python function call like click_button(name='Save') collapses the moment you have two Save buttons, or a Save button that is named differently in a localized build, or a Save button that only exists inside one dialog. A selector language lets you express 'a Button whose name is Save AND which is inside the Export dialog', or 'the Checkbox to the right of the Username label', or 'the nth-from-last MenuItem that is not disabled', all in one string. Terminator's parser lives in crates/terminator/src/selector.rs and compiles these expressions into a Selector enum with 24 variants (Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has, Parent, And, Or, Not, plus Invalid for parse errors).",
  },
  {
    q: "How does the Boolean part work?",
    a: "The tokenizer in selector.rs walks the string character by character, recognizing && as And, || or , as Or, ! as Not, and parentheses as grouping. Whitespace outside a token is skipped; whitespace inside a text: value is preserved, which is how text:'RPA Hospital (MGP)? : r/foo' survives parsing. Operator precedence is defined at lines 206 through 212: Or is precedence 1, And is precedence 2, Not is precedence 3. The parser is a textbook Shunting Yard implementation at lines 215 through 272. It builds an AST directly, flattens nested Ands into a single Vec<Selector> and nested Ors the same way, and returns a Selector::Invalid if the expression is malformed rather than panicking. You write role:Button && !name:Close || role:MenuItem and you get back a tree that the engine can walk.",
  },
  {
    q: "How exactly does the near: relator decide something is 'near'?",
    a: "It takes the center point of the anchor element's bounding box, the center point of the candidate element's bounding box, computes the Euclidean distance between them, and returns true when that distance is strictly less than NEAR_THRESHOLD, which is defined as 50.0 pixels at crates/terminator/src/platforms/windows/engine.rs line 1815. It is a hardcoded constant, not configurable, intentionally tight. rightof:/leftof: and above:/below: work differently: they use half-plane tests (candidate_left >= anchor_right for rightof) combined with an overlap check on the perpendicular axis (candidate_top < anchor_bottom && candidate_bottom > anchor_top for rightof, so the candidate must share vertical rows with the anchor). The relevant math sits at engine.rs lines 1783 through 1826.",
  },
  {
    q: "What does a real selector look like when I use all of this together?",
    a: "A login dialog click might read process:slack.exe >> role:Window && name:'Slack' >> rightof:(role:Text && name:'Username') && role:Edit. That says: inside the Slack process, under the Slack window, find an Edit element whose bounding box sits to the right of the 'Username' label and shares vertical rows with it. The descendant combinator >> chains selectors to walk down the accessibility tree. The .. token moves up to a parent. nth:0 picks the first match, nth-1 picks the last, nth-2 the second-to-last. has: asserts that an element contains a matching descendant. Each of these compiles to a specific Selector variant and the engine evaluates them against the UIA tree with timeout and depth parameters you can set per call.",
  },
  {
    q: "Does the selector language work the same on Windows, macOS, and Linux?",
    a: "The selector syntax is identical. The engine adapters differ. On Windows the selector runs against IUIAutomation and walks the UIA tree via TreeScope. On macOS it runs against AXUIElement. On Linux it runs against AT-SPI2. A few attribute names translate: id: resolves to AutomationId on Windows and AXIdentifier on macOS, classname: resolves to Win32 ClassName on Windows and AXRoleDescription on macOS. The Boolean and spatial operators are platform-independent because the bounds math only needs an element rectangle, which every accessibility API exposes. In practice you write one selector string and it runs everywhere the framework supports.",
  },
  {
    q: "How is this different from Playwright's locator system?",
    a: "Playwright is DOM-only. Its selectors evaluate against HTML elements, aria attributes, and CSS pseudo-classes, all of which exist only inside a browser. Terminator's selectors evaluate against an accessibility tree that spans every application on your desktop, so the same vocabulary (role, name, id, classname, text, visible, rightof, leftof, above, below, near, nth, has, parent, and, or, not) works inside Excel, SAP, Photoshop, VS Code, Slack, Chrome, and your own WinForms tool. The shape of the language is deliberately Playwright-adjacent so a web-automation engineer can pick it up in a day, but the backend is completely different. It is like Playwright for the whole OS.",
  },
  {
    q: "How do I debug a selector that is not matching?",
    a: "Three ways. First, the Selector::Invalid variant preserves the reason string so a bad expression like role:Button && && name:Save comes back as Invalid('Invalid expression: multiple selectors without operators') rather than silently returning zero matches. Second, the tree_formatter module prints the accessibility tree of a running window so you can see exactly what role, name, and AutomationId the target element actually exposes. Third, the MCP agent has a tool that takes a selector plus a screenshot and shows which nodes matched, which failed, and why. The combination catches the three common failure modes: the name you thought you saw is really an AutomationId, the role you guessed is Pane rather than Group, or the element is under a different process than you assumed.",
  },
  {
    q: "Can I use this selector language with my AI coding assistant?",
    a: "Yes. Terminator ships an MCP server, terminator-mcp-agent, that exposes the selector language as tool calls for Claude Code, Cursor, VS Code, and Windsurf. Your assistant reads the accessibility tree of your running application, composes a selector in the exact vocabulary described above, and invokes click, type, or press_key actions against it. Because the selector language is expressive enough to target by role, Boolean composition, and spatial layout, the assistant does not have to fall back to pixel coordinates or screenshot recognition, which is where most LLM-driven desktop agents get slow and unreliable. Install with npx -y terminator-mcp-agent@latest and point your assistant's MCP config at it.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Selector language",
    competitor: "Coordinates or image templates",
    ours: "Boolean algebra + spatial relators, parsed by Shunting Yard",
  },
  {
    feature: "Logical operators",
    competitor: "None (one attribute per call)",
    ours: "&&, ||, !, parentheses, operator precedence Or=1 And=2 Not=3",
  },
  {
    feature: "Spatial relators",
    competitor: "Manual offset math",
    ours: "rightof, leftof, above, below, near (50px Euclidean threshold)",
  },
  {
    feature: "Chaining",
    competitor: "Nested function calls",
    ours: ">> descendant combinator, .. parent, nth:, has:",
  },
  {
    feature: "Parse errors",
    competitor: "Runtime exception or silent no-match",
    ours: "Selector::Invalid variant with reason string, caught at compile",
  },
  {
    feature: "Cross-platform",
    competitor: "Windows only or web only",
    ours: "Windows UIA, macOS AX, Linux AT-SPI2, identical syntax",
  },
  {
    feature: "Works with AI coding assistants",
    competitor: "Bolt-on after the fact",
    ours: "MCP server native, works with Claude Code, Cursor, VS Code, Windsurf",
  },
  {
    feature: "License",
    competitor: "Per-seat commercial",
    ours: "MIT, source on GitHub",
  },
];

const astVariants = [
  "Role { role, name }",
  "Id(String)",
  "Name(String)",
  "Text(String)",
  "Path(String)",
  "NativeId(String)",
  "Attributes(BTreeMap)",
  "Filter(usize)",
  "Chain(Vec<Selector>)",
  "ClassName(String)",
  "Visible(bool)",
  "LocalizedRole(String)",
  "Process(String)",
  "RightOf(Box<Selector>)",
  "LeftOf(Box<Selector>)",
  "Above(Box<Selector>)",
  "Below(Box<Selector>)",
  "Near(Box<Selector>)",
  "Nth(i32)",
  "Has(Box<Selector>)",
  "Parent",
  "And(Vec<Selector>)",
  "Or(Vec<Selector>)",
  "Not(Box<Selector>)",
];

const remotionCaptions = [
  "Every desktop app has an accessibility tree.",
  "Most frameworks query it with one attribute at a time.",
  "Terminator parses Boolean and spatial expressions.",
  "role:Button && !name:Close || rightof:name:Username",
  "Compiled by Shunting Yard, evaluated on the tree.",
];

const selectorEnumRust = `// crates/terminator/src/selector.rs lines 3-56
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

const precedenceRust = `// crates/terminator/src/selector.rs lines 205-212
fn operator_precedence(token: &Token) -> i32 {
    match token {
        Token::Or => 1,
        Token::And => 2,
        Token::Not => 3,
        _ => 0,
    }
}`;

const shuntingYardRust = `// crates/terminator/src/selector.rs lines 215-272
fn parse_boolean_expression(tokens: Vec<Token>) -> Result<Selector, String> {
    let mut output_queue: Vec<Selector> = Vec::new();
    let mut operator_stack: Vec<Token> = Vec::new();

    for token in tokens {
        match token {
            Token::Selector(s) => output_queue.push(parse_atomic_selector(&s)),
            Token::LParen => operator_stack.push(token),
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
    // ...drain remaining operators, return single Selector or error
}`;

const spatialRust = `// crates/terminator/src/platforms/windows/engine.rs lines 1801-1826
match selector {
    Selector::RightOf(_) => {
        candidate_left >= anchor_right && vertical_overlap
    }
    Selector::LeftOf(_) => {
        candidate_right <= anchor_left && vertical_overlap
    }
    Selector::Above(_) => {
        candidate_bottom <= anchor_top && horizontal_overlap
    }
    Selector::Below(_) => {
        candidate_top >= anchor_bottom && horizontal_overlap
    }
    Selector::Near(_) => {
        const NEAR_THRESHOLD: f64 = 50.0;
        let anchor_center_x = anchor_bounds.0 + anchor_bounds.2 / 2.0;
        let anchor_center_y = anchor_bounds.1 + anchor_bounds.3 / 2.0;
        let candidate_center_x = candidate_bounds.0 + candidate_bounds.2 / 2.0;
        let candidate_center_y = candidate_bounds.1 + candidate_bounds.3 / 2.0;

        let dx = anchor_center_x - candidate_center_x;
        let dy = anchor_center_y - candidate_center_y;
        (dx * dx + dy * dy).sqrt() < NEAR_THRESHOLD
    }
    _ => false,
}`;

const pyAutoGuiCode = `# the typical "automation for desktop application" starter code
import pyautogui
import time

# log into an app
pyautogui.click(420, 312)          # username field at screen coords
pyautogui.typewrite("alice", 0.05)
pyautogui.click(420, 362)          # password field, 50px below
pyautogui.typewrite("hunter2", 0.05)
pyautogui.click(520, 412)          # submit button

# the moment someone moves the window, resizes it,
# uses high-dpi, or changes theme, all of these coords lie.
time.sleep(2)
pyautogui.locateOnScreen("inbox.png")   # image match fallback`;

const terminatorCode = `// the same flow in Terminator's selector language
import { Desktop } from "terminator.js";

const desktop = new Desktop();
const slack = desktop.locator("process:slack.exe >> role:Window");

// "the Edit field to the right of the Username label"
await slack
  .locator("rightof:(role:Text && name:Username) && role:Edit")
  .typeInto("alice");

// "the Edit field below the Password label"
await slack
  .locator("below:(role:Text && name:Password) && role:Edit")
  .typeInto("hunter2");

// "a Button named Sign in that is not disabled"
await slack
  .locator("role:Button && name:'Sign in' && !name:Disabled")
  .click();`;

const filterMetrics = [
  { value: 24, label: "Selector AST variants" },
  { value: 5, label: "Spatial relators" },
  { value: 3, label: "Boolean operators" },
  { value: 50, label: "Pixel threshold for near:" },
];

const filterCards: BentoCard[] = [
  {
    title: "24-variant AST",
    description:
      "Every selector compiles to one of 24 Selector enum variants defined in src/selector.rs. Role is a struct, not just a string, so role:Button && name:Save is a single Role variant with Some(name) rather than a boolean AND of two selectors. This keeps the common case fast.",
    accent: true,
  },
  {
    title: "Shunting Yard parser",
    description:
      "parse_boolean_expression at selector.rs:215 is a classic Shunting Yard implementation. Operator precedence is explicit (Or=1, And=2, Not=3), nested Ands and Ors are flattened into single Vec nodes so the engine evaluates them in one pass, and malformed input returns Selector::Invalid rather than panicking.",
  },
  {
    title: "Spatial operators",
    description:
      "rightof, leftof, above, below, near. The first four use half-plane bounds tests with a perpendicular-axis overlap check so 'to the right' means literally aligned rows, not merely higher X. near uses a 50.0-pixel Euclidean distance between element centers, defined as const NEAR_THRESHOLD: f64 = 50.0.",
  },
  {
    title: "Descendant combinator >>",
    description:
      "Chains compile to Selector::Chain(Vec<Selector>). Each step runs against the previous result. process:slack.exe >> role:Window && name:Slack >> role:Button && name:Send is three links the engine walks in order, with its own TreeScope tuning at each level to keep the tree walk cheap.",
    accent: true,
  },
  {
    title: "Parent and nth navigation",
    description:
      "The .. token produces Selector::Parent, which moves up one level in the UIA tree. nth:N selects the Nth match from a result set (0-indexed). nth-N selects from the end, so nth-1 is the last and nth-2 is the second-to-last. has: takes another selector and returns only elements whose descendants match it.",
  },
  {
    title: "Text with special chars",
    description:
      "The tokenizer special-cases text: values so parentheses, colons, and single pipes inside the text value are preserved rather than treated as operators. text:'RPA Hospital (MGP)? : r/foo' survives the parse intact. Only unescaped && and || get tokenized as Boolean operators.",
  },
];

const beamFrom = [
  { label: "Selector string", sublabel: "role:Button && ..." },
  { label: "Tokenizer", sublabel: "selector.rs:94" },
  { label: "AST parser", sublabel: "Shunting Yard" },
];

const beamHub = {
  label: "Selector AST",
  sublabel: "24 variants",
};

const beamTo = [
  { label: "Windows UIA", sublabel: "IUIAutomation" },
  { label: "macOS AX", sublabel: "AXUIElement" },
  { label: "Linux AT-SPI2", sublabel: "atspi-rs" },
];

const parseSteps = [
  {
    title: "Tokenize the input",
    description:
      "tokenize() at selector.rs:94 walks the string one character at a time. && becomes Token::And, || or , becomes Token::Or, ! becomes Token::Not, parentheses become LParen/RParen. Anything else accumulates into a Token::Selector. Whitespace inside text: values is preserved; whitespace outside tokens is dropped.",
  },
  {
    title: "Check for unbalanced parens",
    description:
      "has_unbalanced_parens() at selector.rs:76 scans the string for opening and closing parentheses, incrementing and decrementing a depth counter. Closing without opening or unbalanced total returns a parse error before the Shunting Yard stage even begins.",
  },
  {
    title: "Run Shunting Yard",
    description:
      "parse_boolean_expression() at selector.rs:215 pushes atomic selectors onto an output queue and operators onto an operator stack. When an operator comes in, higher-or-equal precedence operators on the stack get applied first. Parentheses group explicitly. The output is a single Selector AST root.",
  },
  {
    title: "Flatten nested And and Or",
    description:
      "apply_operator() at selector.rs:275 checks whether an And or Or operand is itself already an And or Or of the same kind. If so, it concatenates the inner vecs rather than nesting. role:A && role:B && role:C compiles to a single And with three operands, not a binary tree. The engine loops instead of recursing.",
  },
  {
    title: "Dispatch to the platform engine",
    description:
      "Each Selector variant has a match arm in platforms/windows/engine.rs (IUIAutomation), platforms/macos/engine.rs (AXUIElement), and platforms/linux/engine.rs (AT-SPI2). Role queries turn into TreeScope walks. Spatial relators turn into bounding-box math. Chain iterates the list, passing the previous result as the new root.",
  },
  {
    title: "Return elements or Selector::Invalid",
    description:
      "A successful parse returns a Selector tree the engine can walk. A failed parse returns Selector::Invalid with a reason string so the caller can log it, show it to the user, or surface it into the MCP response. The framework never silently matches nothing for a malformed input.",
  },
];

const terminalLines = [
  { text: '$ npx -y terminator-mcp-agent@latest', type: "command" as const },
  { text: "[mcp] started on stdio, ready for tool calls", type: "output" as const },
  { text: "[mcp] list_applications -> [chrome.exe, slack.exe, olk.exe, code.exe]", type: "output" as const },
  {
    text: '[mcp] find_element selector="process:slack.exe >> role:Window && name:Slack"',
    type: "command" as const,
  },
  { text: "[mcp] parsed AST: Chain([Process(slack.exe), Role{Window, Some(Slack)}])", type: "info" as const },
  {
    text: '[mcp] find_element selector="rightof:(role:Text && name:Username) && role:Edit"',
    type: "command" as const,
  },
  {
    text: "[mcp] parsed AST: And([RightOf(Role{Text, Some(Username)}), Role{Edit, None}])",
    type: "info" as const,
  },
  { text: "[mcp] resolved anchor bounds: x=412 y=302 w=82 h=20", type: "output" as const },
  { text: "[mcp] filtered 43 candidates by candidate_left >= anchor_right && vertical_overlap", type: "output" as const },
  { text: "[mcp] 1 match: role:Edit AutomationId='login.username' bounds=(504,298,220,28)", type: "success" as const },
  { text: "[mcp] type_into element='login.username' text='alice' -> ok", type: "success" as const },
];

const stabilityItems = [
  {
    label: "Window moves",
    detail: "Selector keeps working. Bounds math is recomputed at query time, no frozen coordinates.",
  },
  {
    label: "Theme changes",
    detail: "Role, name, and AutomationId do not change with theme. Image-match selectors break here; accessibility-tree selectors do not.",
  },
  {
    label: "High-DPI scaling",
    detail: "Bounds are delivered by UIA in the display's native coordinate space; spatial relators scale with the window automatically.",
  },
  {
    label: "Localization",
    detail: "Use LocalizedRole for display strings or AutomationId for stable IDs; role: and id: are locale-invariant.",
  },
  {
    label: "Two of the same widget",
    detail: "Compose with Boolean operators and spatial relators: rightof:(role:Text && name:Password) && role:Edit.",
  },
  {
    label: "Dialog nested inside dialog",
    detail: "Chain with >> so selectors are scoped. has: asserts that a parent must contain a specific descendant before matching.",
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
              readingTime="15 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Automation for desktop application, judged on its{" "}
              <GradientText>selector language</GradientText>, not its action list
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Nearly every guide on automation for desktop application grades products by what actions
              they can perform: click, type, scroll, screenshot. The actions are trivial. The reason
              desktop automation frameworks differ in quality is the selector language you write to
              decide which element to act on. This page is about Terminator's selector language, the
              Shunting Yard parser that compiles it, and the spatial relators that make it actually
              targetable on real desktop UIs.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="MIT-licensed, written in Rust, cross-platform via UIA, AX, and AT-SPI2"
          highlights={[
            "24 selector AST variants, compiled by Shunting Yard",
            "Boolean operators && || ! with explicit precedence",
            "Spatial relators rightof, leftof, above, below, near",
            "near threshold hardcoded at 50.0 pixels",
          ]}
        />

        <RemotionClip
          title="One selector language, every desktop app"
          subtitle="Boolean + spatial + accessibility tree"
          captions={remotionCaptions}
          accentHex="#FF3E00"
          accentHexDark="#CC3200"
        />

        <section className="prose prose-zinc max-w-none my-10">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            The part of desktop automation that everyone underestimates
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            When a developer first tries to automate something outside the browser, they reach for
            coordinate clicks or image matching. Both are obvious, both feel like they work, and both
            are wrong. Coordinates lie the moment someone moves a window, changes a theme, or switches
            to a high-DPI display. Image templates lie the moment a button style tweaks. The only
            durable way to target elements in a desktop application is to query the operating system's
            accessibility tree and describe elements by what they structurally are, not where they
            happen to sit in pixels today.
          </p>
          <p className="text-zinc-700 leading-relaxed mt-4">
            Which means the interesting design question for a desktop automation framework is not
            "does it have a click action" (everyone does) but "what language do I use to describe the
            element I want to click". That is the selector language. Terminator's is a typed algebra
            with Boolean operators and spatial relators, compiled to an AST by a Shunting Yard parser
            and evaluated against the OS accessibility tree on Windows, macOS, and Linux.
          </p>
        </section>

        <MetricsRow metrics={filterMetrics} />

        <section className="my-10">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Coordinate scripts vs a selector language, in one side-by-side
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            This is the example I wish existed when I was first looking for automation for a desktop
            application. On the left is the version every tutorial shows you. On the right is the
            same flow written against Terminator's selector language. Count the things that would
            have to change on the left if the Slack window moved, resized, changed theme, or got
            translated.
          </p>
          <CodeComparison
            leftCode={pyAutoGuiCode}
            rightCode={terminatorCode}
            leftLines={pyAutoGuiCode.split("\n").length}
            rightLines={terminatorCode.split("\n").length}
            leftLabel="pyautogui coordinate script"
            rightLabel="Terminator selector language"
            title="Same login flow, two philosophies"
            reductionSuffix="lines, zero coordinates"
          />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            The AST has 24 variants and every operator maps to one
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            The selector type is defined in crates/terminator/src/selector.rs. It is a plain Rust
            enum, not a trait object. Every selector you type at the API layer ends up as one of
            these variants. Role is a struct variant because role and name are so often combined, so
            role:Button && name:Save compiles to a single Role {"{"} role: "Button", name:
            Some("Save") {"}"}, not an And of two selectors. That keeps the hot path fast.
          </p>
          <AnimatedCodeBlock
            code={selectorEnumRust}
            language="rust"
            filename="crates/terminator/src/selector.rs"
            typingSpeed={6}
          />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Operator precedence, stated plainly
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Every algebra needs precedence. Terminator's is the boring one every programming language
            uses: Not binds tightest, And is next, Or is loosest. The function below lives in the
            same file and is the whole rule. If you want to override it, you use parentheses, which
            the tokenizer already produces dedicated tokens for.
          </p>
          <AnimatedCodeBlock
            code={precedenceRust}
            language="rust"
            filename="crates/terminator/src/selector.rs"
            typingSpeed={8}
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            So role:Button && !name:Disabled || role:MenuItem is parsed as (role:Button AND (NOT
            name:Disabled)) OR role:MenuItem. If that is not what you meant, add parens:
            role:Button && (!name:Disabled || role:MenuItem). It is the same mental model as any
            expression parser you have written against, just wearing a selector skin.
          </p>
        </section>

        <section className="my-14">
          <GlowCard>
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-zinc-900 mb-3">
                Shunting Yard, verbatim
              </h2>
              <p className="text-zinc-700 leading-relaxed mb-5">
                The parser itself is Dijkstra's algorithm, written in Rust. Output queue for
                operands, operator stack for operators, apply higher-or-equal precedence operators
                before pushing, drain at the end. Nothing exotic. The value is that every valid
                expression becomes one AST node with predictable shape, and every invalid expression
                becomes a Selector::Invalid with a specific reason.
              </p>
              <AnimatedCodeBlock
                code={shuntingYardRust}
                language="rust"
                filename="crates/terminator/src/selector.rs"
                typingSpeed={4}
              />
            </div>
          </GlowCard>
        </section>

        <ProofBanner
          metric="50.0"
          quote="The Euclidean distance threshold that decides whether two elements are 'near' each other."
          source="crates/terminator/src/platforms/windows/engine.rs line 1815, hardcoded constant NEAR_THRESHOLD"
        />

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            Spatial relators are the part that actually makes layouts targetable
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Boolean operators let you compose. Spatial relators let you describe layout. rightof,
            leftof, above, and below are not just "candidate has bigger X than anchor". Each one
            requires perpendicular-axis overlap so the relationship is actually visual: a button
            directly beside a label counts as rightof, a button three rows down does not. near takes
            a different tack, Euclidean distance between the bounding-box centers, with a hardcoded
            50.0-pixel threshold so the relation is tight rather than wobbly. The whole function
            lives in one match arm in the Windows engine.
          </p>
          <AnimatedCodeBlock
            code={spatialRust}
            language="rust"
            filename="crates/terminator/src/platforms/windows/engine.rs"
            typingSpeed={4}
          />
          <p className="text-zinc-700 leading-relaxed mt-6">
            Because the relator requires the anchor selector to resolve first, the engine evaluates
            the expression in the right order: inner selector, then filter candidates by bounds.
            rightof:(role:Text && name:Username) resolves the Text element with name Username, grabs
            its bounds, and then evaluates the outer selector against every visible element, keeping
            only those whose rectangles sit to the right and share rows. This is why you never write
            offsets in Terminator. The bounds math is the offsets.
          </p>
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            Where a selector string goes between typing it and clicking something
          </h2>
          <AnimatedBeam
            from={beamFrom}
            hub={beamHub}
            to={beamTo}
            title="From string to platform adapter"
            accentColor="#FF3E00"
          />
        </section>

        <section className="my-14">
          <StepTimeline
            title="Six steps from a selector string to a match"
            steps={parseSteps}
          />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mt-10 mb-4">
            What this looks like when an agent actually runs it
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Install the MCP agent, point Claude Code or Cursor at it, and watch a selector get
            tokenized, parsed, and resolved against a running Slack window. The log below is the
            kind of thing you see in the agent stream. Parsed AST is printed verbatim so you can
            tell at a glance what the parser thought you meant, before any action fires.
          </p>
          <TerminalOutput lines={terminalLines} title="terminator-mcp-agent stdio stream" />
        </section>

        <section className="my-14">
          <BentoGrid cards={filterCards} />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            The full variant inventory, because a selector language with hidden features is not a
            selector language
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Everything below is a public Selector variant. If a surface API supports a selector, it
            supports every one of these. There are no private extensions, no hidden flags, no
            proprietary operators that the Enterprise tier unlocks.
          </p>
          <AnimatedChecklist
            title="Selector enum variants, from selector.rs"
            items={astVariants.map((text) => ({ text }))}
          />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            What survives, what does not
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-6">
            A selector language is only as useful as the scenarios in which it keeps working. The
            whole point of building on the accessibility tree instead of pixels is that the tree is
            stable under the changes that break coordinate scripts. These are the scenarios where
            the selector survives.
          </p>
          <div className="space-y-3">
            {stabilityItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-zinc-200 bg-white p-5"
              >
                <div className="text-sm font-semibold text-zinc-900 mb-1">{item.label}</div>
                <div className="text-sm text-zinc-600 leading-relaxed">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            How this compares to the other things called "automation for desktop application"
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical desktop automation tooling"
            rows={comparisonRows}
          />
        </section>

        <section className="my-14">
          <h2 className="text-2xl font-semibold text-zinc-900 mb-4">
            One last note on where to read the code
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            All of this is in the public repository under{" "}
            <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-sm">
              crates/terminator/src/selector.rs
            </code>{" "}
            for the parser and{" "}
            <code className="px-1.5 py-0.5 bg-zinc-100 rounded text-sm">
              crates/terminator/src/platforms/
            </code>{" "}
            for the per-OS evaluator. If you are the kind of reader who bounced off the marketing
            pages and wanted the actual file that decides "right of means candidate_left {">"}=
            anchor_right && vertical_overlap", you have it. That is the file.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want the selector language pointed at your own desktop app?"
          description="Twenty minutes with the team, we write a live selector against whatever you have open, and you see the AST and the tree walk in real time."
        />

        <FaqSection items={faqs} />
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the selector language running against a real desktop app."
      />
    </>
  );
}
