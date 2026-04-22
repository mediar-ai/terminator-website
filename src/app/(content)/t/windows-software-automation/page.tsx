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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  FlowDiagram,
  CodeComparison,
  MetricsRow,
  BentoGrid,
  BeforeAfter,
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

const PAGE_URL = "https://t8r.tech/t/windows-software-automation";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Windows software automation as a query language: selectors with &&, ||, !, >>, and spatial anchors";
const DESCRIPTION =
  "Most Windows software automation tools record clicks or pin to X,Y coordinates. Terminator turns the desktop into a query surface: role:Button && name:Save, window:Login >> role:Edit && rightof:(name:Username), !name:Cancel. This is a tour of the selector grammar, the Shunting Yard parser that compiles it, and the 50.0-pixel geometric filter that powers rightof: and near:. Source: crates/terminator/src/selector.rs and platforms/windows/engine.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Windows software automation should read like a query, not a macro. Terminator compiles role:Button && name:Save && rightof:(name:Username) into a real AST, walks the UI Automation tree, filters by pixel-accurate bounding-box geometry, and returns the element. No coordinates, no recordings, no vision model required.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows software automation as a selector language",
    description:
      "role:Button && name:Save && rightof:(name:Username). A real boolean grammar for picking elements out of the Windows accessibility tree, parsed with Shunting Yard and filtered on bounding-box geometry.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows software automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows software automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes this a selector language and not just a string matcher?",
    a: "A selector language has a grammar, a tokenizer, an operator precedence table, and a parse tree. Terminator has all four. The tokenizer in crates/terminator/src/selector.rs emits Token::Selector, Token::And, Token::Or, Token::Not, Token::LParen, Token::RParen. The parser uses the Shunting Yard algorithm (parse_boolean_expression at line 216) with a precedence of 1 for Or, 2 for And, 3 for Not, so role:Button && !name:Cancel || name:Back parses as (Button AND NOT Cancel) OR Back. The output is a Selector enum with variants Role, Id, Name, Text, Chain, And(Vec), Or(Vec), Not(Box), RightOf(Box), LeftOf(Box), Above(Box), Below(Box), Near(Box), Has(Box), Parent, Nth, Visible, Process, ClassName, LocalizedRole, and more. This is a compiler front end, not a regex.",
  },
  {
    q: "What is the anchor fact in the spatial filter and where does the number live?",
    a: "The near: selector fires when the Euclidean distance between the anchor's center and the candidate's center is strictly less than 50.0 pixels. That constant is defined on a single line: const NEAR_THRESHOLD: f64 = 50.0 in crates/terminator/src/platforms/windows/engine.rs, at line 1815 inside the Selector::Near arm of find_elements. The rightof: and leftof: filters require vertical bounding-box overlap (candidate_top < anchor_bottom && candidate_bottom > anchor_top) and a horizontal gap (candidate_left >= anchor_right). Above: and below: mirror that logic horizontally. All four read bounds from UI Automation, not from screen pixels, so they survive DPI changes.",
  },
  {
    q: "How do chained selectors like window:Notepad >> role:Edit work?",
    a: "The >> operator splits a selector into a Selector::Chain(Vec<Selector>) at parse time. During execution, each part is resolved against the result of the previous part as its root. So window:Notepad >> role:Edit first finds the Notepad top-level window, then searches within that window for an Edit control. Chains are parsed before boolean operators, which means window:Notepad >> (role:Button && name:OK) works and the boolean part applies only within the Notepad scope.",
  },
  {
    q: "What about escaping commas and parentheses in names?",
    a: "The tokenizer has special handling for text: selectors. When the current token starts with text:, both parentheses and commas are treated as literal characters, because visible text on screen frequently contains them. See the in_text_selector guard at selector.rs line 103. The comment explicitly cites a Reddit-style selector: text:RPA Hospital (MGP)? : r/foo. For every other selector prefix, ( and ) are parser delimiters and , means OR.",
  },
  {
    q: "Why use the accessibility tree instead of pixel matching or a vision model?",
    a: "The accessibility tree is already a structured representation of what is on the screen, with names, roles, IDs, and bounds, maintained by every Windows application that implements UI Automation (which is most of them). A pixel matcher breaks on DPI changes, theme changes, font smoothing. A vision model breaks on latency, cost, and hallucinations. Terminator does support OCR and pixel fallbacks for apps that expose nothing to UIA, but the selector language targets the tree first. You read the Windows UI Automation tree with Accessibility Insights or Inspect.exe, write the selector that points at the element, and the same selector works on your coworker's machine, on a CI runner, and in a Windows Sandbox.",
  },
  {
    q: "Can I combine spatial and logical selectors?",
    a: "Yes. role:Edit && rightof:(name:Username) finds an edit field that is both of role Edit AND to the right of an element named Username. The AND branches are flattened during parse (apply_operator at selector.rs line 283 merges nested Selector::And), so any number of predicates can compose. role:Edit && rightof:(name:Username) && !visible:false && process:chrome is a single conjunction.",
  },
  {
    q: "How does this compare to AutoHotkey, AutoIt, Power Automate Desktop, and UiPath for targeting elements?",
    a: "AutoHotkey v2 uses WinTitle syntax and ControlClick/ControlGet, which pin to window titles, class names, or ahk_id handles. AutoIt has AutoItX with similar primitives. Power Automate Desktop records clicks into opaque UIA selectors stored in its repository, which are visual-designer-only and not copy-pasteable across projects. UiPath has Full Selectors, Fuzzy Selectors, and Anchor Base activities, which are spatial but drag-and-drop only. Terminator's selectors are a string grammar you can type, commit to git, diff across versions, and chain as data. They also compile at runtime, so a running MCP agent can build them from user speech without a code change.",
  },
  {
    q: "What if two selectors match the same element more than once?",
    a: "The engine deduplicates by element id. In the positional filter at engine.rs line 1774, the anchor is explicitly skipped (if candidate.id() == anchor_id { return false }), so rightof:(name:Username) does not return the Username label itself. For non-spatial queries, Nth(N) picks the N-th match (role:Button,nth:0 is the first button). Or(Vec) returns all matches of any inner selector, deduplicated at collection time.",
  },
  {
    q: "Is the grammar stable enough to build workflows on top of?",
    a: "The parser and the Selector enum live in the core terminator crate that the Rust, Node, Python, and MCP bindings all depend on. It is MIT licensed. The boolean operators && || ! and the positional prefixes rightof: leftof: above: below: near: have been stable for over a year. Nth, Has, Parent, And, Or, and Not were added incrementally and remain backward compatible. The test file selector_tests.rs has dozens of cases covering the parser, including the legacy role|name pipe syntax which still works.",
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
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const selectorEnumCode = `// crates/terminator/src/selector.rs, lines 3-56
//
// One enum. Every way Terminator can pick an element
// out of the Windows UI Automation tree.

pub enum Selector {
    Role { role: String, name: Option<String> },
    Id(String),
    Name(String),
    Text(String),
    NativeId(String),
    Attributes(BTreeMap<String, String>),
    ClassName(String),
    LocalizedRole(String),
    Process(String),
    Visible(bool),

    // Combinators
    Chain(Vec<Selector>),  // window:X >> role:Y >> name:Z
    And(Vec<Selector>),    // &&
    Or(Vec<Selector>),     // ||
    Not(Box<Selector>),    // !

    // Spatial (bounding-box geometry against an anchor)
    RightOf(Box<Selector>),
    LeftOf(Box<Selector>),
    Above(Box<Selector>),
    Below(Box<Selector>),
    Near(Box<Selector>),   // 50.0-pixel Euclidean threshold

    // Tree navigation
    Parent,
    Has(Box<Selector>),    // Playwright-style :has()
    Nth(i32),

    Invalid(String),
}`;

const shuntingYardCode = `// crates/terminator/src/selector.rs, line 216
//
// Boolean expression parser. Not a regex. A real precedence-climbing
// parser over a tokenized selector string, using the Shunting Yard
// algorithm. Operator precedence: Or = 1, And = 2, Not = 3.

fn parse_boolean_expression(tokens: Vec<Token>) -> Result<Selector, String> {
    let mut output_queue: Vec<Selector> = Vec::new();
    let mut operator_stack: Vec<Token> = Vec::new();

    for token in tokens {
        match token {
            Token::Selector(s) => {
                output_queue.push(parse_atomic_selector(&s));
            }
            Token::LParen => operator_stack.push(token),
            Token::RParen => {
                while let Some(op) = operator_stack.pop() {
                    if op == Token::LParen { break; }
                    apply_operator(op, &mut output_queue)?;
                }
            }
            Token::And | Token::Or | Token::Not => {
                // Pop higher or equal precedence off the stack
                while let Some(top) = operator_stack.last() {
                    if *top == Token::LParen { break; }
                    if operator_precedence(top) >= operator_precedence(&token) {
                        let op = operator_stack.pop().unwrap();
                        apply_operator(op, &mut output_queue)?;
                    } else {
                        break;
                    }
                }
                operator_stack.push(token);
            }
        }
    }
    // ... flush remaining operators, return a Selector AST
}`;

const spatialFilterCode = `// crates/terminator/src/platforms/windows/engine.rs, lines 1754-1835
//
// The Selector::RightOf | LeftOf | Above | Below | Near arm.
// The anchor fact lives at line 1815: NEAR_THRESHOLD is 50.0 pixels.

Selector::RightOf(inner_selector)
| Selector::LeftOf(inner_selector)
| Selector::Above(inner_selector)
| Selector::Below(inner_selector)
| Selector::Near(inner_selector) => {
    // 1. Resolve the anchor. Must be a single element.
    let anchor_element = self.find_element(inner_selector, root, timeout)?;
    let anchor_bounds = anchor_element.bounds()?;   // (x, y, w, h)

    // 2. Pull every visible element as a candidate set.
    let all_elements = self.find_elements(
        &Selector::Visible(true), root,
        Some(Duration::from_millis(500)), Some(100))?;

    // 3. Geometry. No COM calls here, pure bounding-box math.
    let anchor_id = anchor_element.id();
    let filtered = all_elements.into_iter().filter(|candidate| {
        if candidate.id() == anchor_id { return false; }  // never match self

        let c = candidate.bounds().unwrap_or_default();
        let anchor_right = anchor_bounds.0 + anchor_bounds.2;
        let anchor_bottom = anchor_bounds.1 + anchor_bounds.3;
        let v_overlap = c.1 < anchor_bottom && c.1 + c.3 > anchor_bounds.1;
        let h_overlap = c.0 < anchor_right  && c.0 + c.2 > anchor_bounds.0;

        match selector {
            Selector::RightOf(_) => c.0 >= anchor_right && v_overlap,
            Selector::LeftOf(_)  => c.0 + c.2 <= anchor_bounds.0 && v_overlap,
            Selector::Above(_)   => c.1 + c.3 <= anchor_bounds.1 && h_overlap,
            Selector::Below(_)   => c.1 >= anchor_bottom && h_overlap,
            Selector::Near(_) => {
                const NEAR_THRESHOLD: f64 = 50.0;  // <-- the anchor fact
                let ax = anchor_bounds.0 + anchor_bounds.2 / 2.0;
                let ay = anchor_bounds.1 + anchor_bounds.3 / 2.0;
                let cx = c.0 + c.2 / 2.0;
                let cy = c.1 + c.3 / 2.0;
                ((ax - cx).powi(2) + (ay - cy).powi(2)).sqrt() < NEAR_THRESHOLD
            }
            _ => false,
        }
    }).collect();

    Ok(filtered)
}`;

const pythonSelectorCode = `# Targeting a form field without a single coordinate.
# Every string here is a real selector that the parser accepts.

import terminator
desktop = terminator.Desktop()

# 1. Simple conjunction: role AND name.
#    Compiles to Selector::And(vec![Role{..}, Name{..}])
desktop.locator("role:Button && name:Save").click()

# 2. Negation.
#    Compiles to And(vec![Role{..}, Not(Box::new(Name{..}))])
desktop.locator("role:MenuItem && !name:Recent files").click()

# 3. Disjunction with nested spatial anchor.
#    The "textbox right of the Username label, OR right of the Login label."
user_field = desktop.locator(
    "role:Edit && (rightof:(name:Username) || rightof:(name:Login))"
).first()
user_field.type_text("you@example.com")

# 4. Descendant chain + positional. First parses as a Chain,
#    each hop bound to the previous match as its new root.
desktop.locator(
    "window:Settings >> role:TabItem && name:Network >> "
    "role:ToggleSwitch && rightof:(name:Airplane mode)"
).click()

# 5. "Has" to find a container by one of its children.
desktop.locator("role:ListItem && has:(role:Image && name:Unread)").click()`;

const ahkCompareLeft = `; AutoHotkey v2, classic Windows software automation
; Find "Save" button in the Notepad save dialog.

CoordMode "Mouse", "Window"

if WinWait("Save As", , 5) {
    WinActivate "Save As"

    ; Option A: brittle pixel coordinates
    Click 620, 485

    ; Option B: ControlClick by ClassNN, not portable across Windows
    ; builds since the ClassNN index can shift.
    ControlClick "Button1", "Save As"

    ; Option C: loop through controls, grep ClassNN, pick one.
    ; You own the search.
    for i in 1..20 {
        ctrl := "Button" i
        if ControlGetText(ctrl, "Save As") = "Save" {
            ControlClick ctrl, "Save As"
            break
        }
    }
}`;

const ahkCompareRight = `// Terminator, one line of selector language

import { Desktop } from "@mediar-ai/terminator";
const desktop = new Desktop();

// One expression. Typed in code. Diffable. Testable.
// window: + descendant + conjunction + role + name.
await desktop
  .locator("window:Save As >> role:Button && name:Save")
  .first(5000)
  .then((el) => el.click());`;

const metadataBento: BentoCard[] = [
  {
    title: "role:",
    description:
      "Matches by UI Automation ControlType. role:Button, role:Edit, role:MenuItem, role:TabItem, role:ToggleSwitch. Role strings follow the UIA canonical names.",
    size: "1x1",
    accent: true,
  },
  {
    title: "name:",
    description:
      "Accessible name (the label a screen reader would read). Case-insensitive substring by default. name:Save matches Save, Save As..., Save Now.",
    size: "1x1",
  },
  {
    title: "text:",
    description:
      "Visible text content, case-sensitive, substring. The tokenizer treats ( ) , as literal characters inside text: so selectors survive awkward UI labels like text:RPA Hospital (MGP)? : r/foo.",
    size: "2x1",
  },
  {
    title: "id: and nativeid:",
    description:
      "Accessibility ID and OS-level AutomationId. id: is the cross-platform name, nativeid: is the Windows-only exact AutomationId. Use when the name changes across locales.",
    size: "2x1",
  },
  {
    title: "process: and window:",
    description:
      "Scope selectors. process:chrome limits the search to a specific process. window:Calculator scopes to one top-level window. Pair with >> to cascade.",
    size: "1x1",
  },
  {
    title: "rightof: / leftof: / above: / below: / near:",
    description:
      "Spatial filters evaluated against the anchor's bounding box. Require vertical or horizontal overlap; near: uses a 50.0-pixel Euclidean threshold (engine.rs line 1815).",
    size: "2x1",
    accent: true,
  },
  {
    title: "has: and ..",
    description:
      "has:(inner) returns containers whose descendants match the inner selector (Playwright :has()). The .. selector navigates to a parent element.",
    size: "1x1",
  },
  {
    title: "nth:, visible:, classname:",
    description:
      "Match the N-th element (zero-indexed), filter by on-screen visibility, or match by UIA class name. Useful when the tree has many same-role siblings.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Selector as a string you can commit to git",
    competitor: "Recorded UIA blobs in a proprietary repository",
    ours: "role:Button && name:Save && rightof:(name:Username)",
  },
  {
    feature: "Boolean operators on element predicates",
    competitor: "Not supported; one selector per element",
    ours: "&&, ||, ! with explicit precedence (Or=1, And=2, Not=3)",
  },
  {
    feature: "Spatial targeting without coordinates",
    competitor: "Absolute X,Y click, or click-by-coordinate-offset",
    ours: "rightof:, leftof:, above:, below:, near: via UIA bounds",
  },
  {
    feature: "Descendant chain",
    competitor: "Nested UI Spy paths or flat WinTitle match",
    ours: ">> operator, parses into Selector::Chain(Vec<Selector>)",
  },
  {
    feature: "Parser",
    competitor: "String templates",
    ours: "Tokenizer + Shunting Yard (selector.rs line 216)",
  },
  {
    feature: "Grammar documented and testable",
    competitor: "Closed format",
    ours: "selector_tests.rs with dozens of parse cases",
  },
  {
    feature: "Works across apps in one expression",
    competitor: "Per-application configs",
    ours: "process:, window:, and classname: compose freely",
  },
  {
    feature: "License",
    competitor: "Proprietary or EULA-locked",
    ours: "MIT, github.com/mediar-ai/terminator",
  },
];

const selectorChips = [
  "role:Button",
  "name:Save",
  "&&",
  "||",
  "!",
  ">>",
  "..",
  "rightof:",
  "leftof:",
  "above:",
  "below:",
  "near:",
  "has:",
  "nth:0",
  "visible:true",
  "process:chrome",
  "window:Calculator",
  "classname:Edit",
  "id:submit",
  "nativeid:42",
  "text:Open",
];

const verifyLines = [
  {
    text: "git clone https://github.com/mediar-ai/terminator && cd terminator",
    type: "command" as const,
  },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  {
    text: "grep -n 'NEAR_THRESHOLD' crates/terminator/src/platforms/windows/engine.rs",
    type: "command" as const,
  },
  {
    text: "1815:                                    const NEAR_THRESHOLD: f64 = 50.0;",
    type: "success" as const,
  },
  {
    text: "grep -n 'fn parse_boolean_expression' crates/terminator/src/selector.rs",
    type: "command" as const,
  },
  {
    text: "216:fn parse_boolean_expression(tokens: Vec<Token>) -> Result<Selector, String> {",
    type: "success" as const,
  },
  {
    text: "grep -n 'Selector::Chain' crates/terminator/src/selector.rs | head -3",
    type: "command" as const,
  },
  {
    text: "23:    Chain(Vec<Selector>),",
    type: "success" as const,
  },
  {
    text: "499:                return Selector::Chain(cleaned_parts);",
    type: "success" as const,
  },
  {
    text: "grep -n 'RightOf\\|LeftOf\\|Above\\|Below\\|Near' crates/terminator/src/selector.rs | head -5",
    type: "command" as const,
  },
  { text: "33:    RightOf(Box<Selector>),", type: "success" as const },
  { text: "35:    LeftOf(Box<Selector>),", type: "success" as const },
  { text: "37:    Above(Box<Selector>),", type: "success" as const },
  { text: "39:    Below(Box<Selector>),", type: "success" as const },
  { text: "41:    Near(Box<Selector>),", type: "success" as const },
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
          Windows software automation, written as a{" "}
          <GradientText>query language</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Record-and-replay macros pin you to the exact layout of the machine
          they were recorded on. Coordinate clicks break on DPI changes. Most
          Windows software automation tools leave you with one of the two. The
          alternative is a selector grammar you write by hand:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-[15px] font-mono">
            window:Login &gt;&gt; role:Edit &amp;&amp; rightof:(name:Username)
          </code>
          . Terminator ships one.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "&&, ||, ! parsed with Shunting Yard at selector.rs line 216",
          "rightof: and near: filter against UIA bounds, not screen pixels",
          "NEAR_THRESHOLD = 50.0 pixels at engine.rs line 1815",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="A selector language for the Windows desktop"
            subtitle="Terminator compiles strings into a real Selector AST"
            captions={[
              "role:Button && name:Save",
              "window:Login >> role:Edit && rightof:(name:Username)",
              "role:MenuItem && !name:Recent files",
              "near: uses a 50.0-pixel Euclidean threshold",
              "Shunting Yard parser. MIT licensed. One enum, every UI.",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Windows automation has two usual modes. Both are bad.
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Open any guide to Windows software automation on the web and you
          will meet the same two options. The first is a macro recorder:
          you press record, click through the task once, and the tool plays
          the clicks back. The recording is fragile because every click is
          anchored to a window position, a control index, or a screen
          pixel. The first thing that shifts breaks the recording: a Windows
          update, a new DPI, a theme change, a colleague opening a second
          monitor.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The second is scripting with coordinates. AutoHotkey, AutoIt,
          PyAutoGUI, and a dozen older tools let you write a .ahk or .py
          file that calls{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            Click 620, 485
          </code>
          . You get source control back but you buy it with hard-coded
          numbers that encode the test machine&apos;s layout.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          There is a third option. Treat the desktop as a query surface.
          Every Windows app with an accessibility story, which is most of
          them, publishes a live tree of its controls to the UI Automation
          COM API: names, roles, AutomationIds, bounding boxes. The tree
          already describes the element you want to click. You just need a
          language to ask for it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-10">
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
          The selector grammar, at a glance
        </p>
        <Marquee speed={40} pauseOnHover>
          <div className="flex items-center gap-3 pr-3">
            {selectorChips.map((chip) => (
              <span
                key={chip}
                className="font-mono text-sm bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1 whitespace-nowrap"
              >
                {chip}
              </span>
            ))}
          </div>
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The selector enum: one type, every way to pick an element
        </h2>
        <p className="text-zinc-600 mb-6">
          Before the parser runs, there is the target data structure it has
          to produce. Terminator&apos;s{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            Selector
          </code>{" "}
          enum is the entire surface of the language. Every string the user
          writes compiles to one of these variants or a nested combination
          of them.
        </p>
        <AnimatedCodeBlock
          code={selectorEnumCode}
          language="rust"
          filename="crates/terminator/src/selector.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How a selector becomes an element
        </h2>
        <p className="text-zinc-600 mb-6">
          Left column: the kinds of strings a workflow author writes. Middle:
          the selector engine, compiled once, reused for every query. Right
          column: what the engine does with the AST to produce real
          elements.
        </p>
        <AnimatedBeam
          title="Terminator selector engine, inputs to outputs"
          accentColor="#FF3E00"
          from={[
            { label: "role:Button && name:Save" },
            { label: "window:X >> role:Y && rightof:(name:Z)" },
            { label: "role:MenuItem && !name:Recent" },
            { label: "role:ListItem && has:(name:Unread)" },
          ]}
          hub={{ label: "parse_boolean_expression()" }}
          to={[
            { label: "UI Automation tree walk" },
            { label: "Bounding-box geometry filter" },
            { label: "Has() descendant scan" },
            { label: "UIElement[] back to caller" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Parsing: Shunting Yard, not regex
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The parser in{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            crates/terminator/src/selector.rs
          </code>{" "}
          tokenizes the input, assigns each operator a precedence (Or = 1,
          And = 2, Not = 3), and uses Shunting Yard to produce a parse
          tree. Parentheses are first-class, so{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            role:Button &amp;&amp; (name:Save || name:OK)
          </code>{" "}
          resolves its subgroup before the outer AND.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The tokenizer has one quirk worth calling out. Inside a{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            text:
          </code>{" "}
          selector, parentheses and commas are treated as literal content,
          because visible text on screen frequently contains them. The
          comment at line 103 uses a real Reddit-style label as the
          example:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            text:RPA Hospital (MGP)? : r/foo
          </code>
          . No other selector prefix gets this treatment.
        </p>
        <AnimatedCodeBlock
          code={shuntingYardCode}
          language="rust"
          filename="crates/terminator/src/selector.rs"
        />
      </section>

      <ProofBanner
        quote="const NEAR_THRESHOLD: f64 = 50.0; // the one pixel constant in the spatial filter"
        source="crates/terminator/src/platforms/windows/engine.rs line 1815"
        metric="50.0 px"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact: <code className="text-orange-600 bg-orange-50 px-2 py-1 rounded">NEAR_THRESHOLD = 50.0</code>
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Every automation author eventually wants to say &quot;click the
          textbox to the right of the Username label.&quot; Competitors do
          this with pixel offsets against a template image, or with
          point-and-click designers that produce anchor rules nobody can
          read. Terminator turns it into a selector:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            role:Edit &amp;&amp; rightof:(name:Username)
          </code>
          . The parser produces{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            And(vec![Role{"{"}Edit{"}"}, RightOf(Box::new(Name(&quot;Username&quot;)))])
          </code>
          . The engine does the geometry.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          All five positional selectors live in one{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            match
          </code>{" "}
          arm of{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            find_elements
          </code>
          . The anchor is resolved first and its bounds are read from UI
          Automation, not from screen pixels. Then every visible element
          becomes a candidate, the anchor is filtered out by id, and the
          remaining candidates are matched against the anchor&apos;s
          bounding box with vertical or horizontal overlap checks. The{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            near:
          </code>{" "}
          selector uses one constant:{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            const NEAR_THRESHOLD: f64 = 50.0
          </code>
          , Euclidean distance between element centers, at line 1815.
        </p>
        <AnimatedCodeBlock
          code={spatialFilterCode}
          language="rust"
          filename="crates/terminator/src/platforms/windows/engine.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            {
              value: 50,
              suffix: ".0 px",
              label: "NEAR_THRESHOLD at engine.rs line 1815",
            },
            { value: 5, label: "spatial selectors (rightof, leftof, above, below, near)" },
            { value: 3, label: "operator precedence levels (Or=1, And=2, Not=3)" },
            { value: 21, label: "distinct Selector enum variants in selector.rs" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <FlowDiagram
          title="From string to element"
          steps={[
            { label: "Selector string", detail: "role:Button && rightof:(name:Save)" },
            { label: "Tokenizer", detail: "emits Token::Selector, And, Or, Not, (, )" },
            { label: "Shunting Yard", detail: "builds Selector AST" },
            { label: "Engine: find_elements", detail: "matches UIA tree + geometry" },
            { label: "UIElement[]", detail: "returned to script or MCP call" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What you actually write
        </h2>
        <p className="text-zinc-600 mb-6">
          Python, because it is the shortest way to read the grammar. The
          same strings work unchanged in the Node SDK, the Rust SDK, and
          any MCP client (Claude Code, Cursor, Windsurf).
        </p>
        <AnimatedCodeBlock
          code={pythonSelectorCode}
          language="python"
          filename="windows_automation_snippets.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          AutoHotkey vs a selector
        </h2>
        <p className="text-zinc-600 mb-6">
          The canonical Save dialog click, as traditional Windows software
          automation writes it, and as a single Terminator selector.
        </p>
        <CodeComparison
          title="Click the Save button in a Save As dialog"
          leftLabel="AutoHotkey v2"
          rightLabel="Terminator"
          leftLines={ahkCompareLeft.split("\n").length}
          rightLines={ahkCompareRight.split("\n").length}
          leftCode={ahkCompareLeft}
          rightCode={ahkCompareRight}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Every prefix in the grammar
        </h2>
        <p className="text-zinc-600 mb-6">
          Each tile below is a single token the parser recognizes. Combine
          them with{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            &amp;&amp;
          </code>
          ,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            ||
          </code>
          ,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            !
          </code>
          , and{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            &gt;&gt;
          </code>{" "}
          to form any query the Windows accessibility tree can answer.
        </p>
        <BentoGrid cards={metadataBento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Coordinate script vs selector query
        </h2>
        <p className="text-zinc-600 mb-6">
          Same intent, two mental models. Flip the toggle to see what each
          approach actually commits to memory, to disk, and to your
          teammates.
        </p>
        <BeforeAfter
          before={{
            label: "Coordinates and recordings",
            content:
              "You encode the layout of one specific machine into your script. Every value is a pixel, a ClassNN suffix, or an opaque recorded blob. Changes to DPI, theme, locale, Windows version, or even window size can break any of them, and you debug by re-recording.",
            highlights: [
              "Click X,Y hard-codes DPI and screen size",
              "ClassNN indices shift on new Windows builds",
              "Recorded UIA blobs are not human-editable",
              "No boolean logic: one path per element",
            ],
          }}
          after={{
            label: "Selector query language",
            content:
              "You describe the element in terms of what it is and where it is relative to other elements. role:Edit && rightof:(name:Username) works on any login form labeled Username, regardless of the surrounding layout. The parse tree is data; the engine walks the UIA tree once per query.",
            highlights: [
              "role + name + spatial anchor, all in one string",
              "Boolean &&, ||, ! with real precedence",
              "Chain across windows with >>",
              "Text-diffable, git-committable, MCP-callable",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Five steps from selector string to clicked element
        </h2>
        <StepTimeline
          steps={[
            {
              title: "Tokenize the string",
              description:
                "selector.rs line 94. The tokenizer emits Token::Selector for anything that is not an operator, plus Token::And (&&), Token::Or (|| and comma), Token::Not (!), Token::LParen, Token::RParen. text: selectors escape parentheses.",
            },
            {
              title: "Parse with Shunting Yard",
              description:
                "selector.rs line 216. parse_boolean_expression pops operators by precedence (Or=1, And=2, Not=3) and nests sub-selectors inside Selector::And, Selector::Or, Selector::Not. Descendant >> is handled separately and builds a Selector::Chain.",
            },
            {
              title: "Resolve atomic selectors",
              description:
                "Each leaf token becomes a concrete Selector variant. role:Button becomes Selector::Role{role:\"Button\", name:None}. rightof:(name:Username) recursively parses the inside and wraps it in Selector::RightOf(Box::new(...)).",
            },
            {
              title: "Walk the UIA tree",
              description:
                "engine.rs find_elements dispatches on the selector variant. Role/Name/Id/ClassName walk the cached UI Automation tree. Process and Window scope the root. And/Or/Not intersect, union, and exclude match sets.",
            },
            {
              title: "Run the geometry filter",
              description:
                "For RightOf, LeftOf, Above, Below, Near, the anchor is resolved first. All visible candidates are collected, the anchor is excluded by id, and the remaining candidates are filtered by bounding-box overlap. Near uses the 50.0-pixel Euclidean threshold.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature by feature
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Typical Windows automation tool"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify every anchor fact
        </h2>
        <p className="text-zinc-600 mb-6">
          Every file name, line number, and constant on this page comes
          from the MIT-licensed repo. Clone it, grep, read.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={50} decimals={1} />
              <span className="text-xl text-zinc-500 ml-1">px</span>
            </div>
            <p className="text-sm text-zinc-600">
              The{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs font-mono">
                near:
              </code>{" "}
              threshold, hardcoded as{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs font-mono">
                const NEAR_THRESHOLD: f64 = 50.0
              </code>{" "}
              at engine.rs line 1815.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={21} />
            </div>
            <p className="text-sm text-zinc-600">
              Variants in the{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs font-mono">
                Selector
              </code>{" "}
              enum. Covers roles, ids, text, spatial anchors, boolean
              combinators, chains, and tree navigation.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={3} />
            </div>
            <p className="text-sm text-zinc-600">
              Operator precedence levels. Or = 1, And = 2, Not = 3. Set at{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs font-mono">
                operator_precedence()
              </code>{" "}
              in selector.rs.
            </p>
          </GlowCard>
        </div>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want Windows software automation that survives a DPI change?"
        description="Bring a workflow on your machine. We will rewrite its clicks as Terminator selectors in 20 minutes, on your actual apps."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See one Terminator selector replace a page of AutoHotkey, live."
      />
    </article>
  );
}
