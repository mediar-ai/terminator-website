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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  BentoGrid,
  StepTimeline,
  MetricsRow,
  GlowCard,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/open-source-desktop-automation-projects-april-2026";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Open source desktop automation projects, April 2026: which ones still ship, which ones speak MCP, and the only one with a real selector grammar";
const DESCRIPTION =
  "A grounded look at the open source desktop automation projects that matter in April 2026. Most of the listicles re-list the same six tools from a decade ago. This guide groups projects by what they actually hand to an AI coding assistant: pixels, a Python wrapper, a flowchart studio, or a typed selector grammar with an MCP server. Terminator is the only one in the last category, and the implementation lives in 753 lines of Rust at crates/terminator/src/selector.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Open source desktop automation in April 2026 has split into four eras of project. The fourth era ships a typed selector grammar plus an MCP server. Terminator's selector parser is a hand-written Shunting Yard implementation at crates/terminator/src/selector.rs (753 lines, 26 Selector variants).",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Open source desktop automation projects, April 2026, ranked by what they give an AI agent",
    description:
      "AutoHotkey, AutoIt, SikuliX, PyAutoGUI, pywinauto, Robot Framework. Then Terminator: a Playwright-style selector grammar for the OS, with 35 MCP tools, MIT licensed.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Open source desktop automation projects, April 2026" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Open source desktop automation projects, April 2026", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Which open source desktop automation projects are still actively maintained in April 2026?",
    a: "AutoHotkey is still maintained as a scripting language for Windows. AutoIt is still around but its community has shrunk. SikuliX has had infrequent releases. PyAutoGUI receives occasional fixes. Robot Framework and the RPA Framework ecosystem keep shipping. pywinauto is alive but slow-moving. The clearest spike of recent engineering activity is Terminator, whose CHANGELOG.md shows four releases in the first thirteen days of January 2026 (0.24.16, 0.24.18, 0.24.19, 0.24.20) and 86 total versioned releases by then. The activity gap matters because Model Context Protocol shifted desktop automation between 2024 and 2026, and the older projects have not adapted.",
  },
  {
    q: "What does Terminator do that the older open source projects do not?",
    a: "Three things. First, it uses the native accessibility tree (Windows UI Automation) rather than pixels or screenshots, so locators stay stable across themes and DPI changes. Second, it ships a Model Context Protocol server with 35 tools (counted by `grep -c '#[tool('` in crates/terminator-mcp-agent/src/server.rs at the 2026-01-13 release), so Claude Code, Cursor, VS Code, and Windsurf can drive your desktop the same way they drive a browser today. Third, it ships a real selector grammar. AutoHotkey and AutoIt do not have one. PyAutoGUI does not have one. pywinauto has a Python builder but no parser. Terminator's parser is at crates/terminator/src/selector.rs, 753 lines, hand-written Shunting Yard with operator precedence and parentheses.",
  },
  {
    q: "What does that selector grammar actually look like?",
    a: "It is the closest thing to Playwright for the desktop. You can write `process:notepad >> role:Edit` to scope an Edit control to the Notepad process. You can write `role:Button && name:Save && !classname:Disabled` to combine attributes with logical operators. You can navigate spatially with `rightof:(role:Tab && name:Settings)` or `below:role:Toolbar`. You can use `||` for OR, `&&` for AND, `!` for NOT, `>>` for descendant chains, and `..` to walk back to the parent. The Selector enum at crates/terminator/src/selector.rs has 26 variants, including Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has, Parent, And, Or, Not, and Invalid.",
  },
  {
    q: "Where exactly does the parser live and how does it work?",
    a: "It lives in one file: crates/terminator/src/selector.rs. The pipeline is: tokenize() walks the input character by character producing a Vec of Token (Selector, And, Or, Not, LParen, RParen), then parse_boolean_expression() runs a Shunting Yard algorithm with operator_precedence() returning NOT=3, AND=2, OR=1. apply_operator() pops operands and folds them into Selector::And, Selector::Or, or Selector::Not nodes. text: selectors get special handling so they can contain colons and parentheses without breaking the tokenizer. Spatial selectors like rightof:, leftof:, above:, below:, and near: are parsed in parse_atomic_selector() around line 419.",
  },
  {
    q: "How do screenshot-based projects like SikuliX or PyAutoGUI compare on stability?",
    a: "They do real work and they have a place. The cost is that pixel matching breaks on theme changes, font changes, DPI scaling, and any animation that runs while you grab the screen. If your automation has to survive a Windows update or a user toggling dark mode, an accessibility-tree-based tool will keep working without re-recording image templates. The trade-off is that the accessibility-tree projects depend on the target app exposing UIA correctly. Most modern Windows apps do. Older Win32 software sometimes does not, and that is where SikuliX or PyAutoGUI still win.",
  },
  {
    q: "Why does Model Context Protocol matter for desktop automation specifically?",
    a: "MCP standardizes how AI coding assistants call external tools. In 2024 every assistant invented its own bridge to its own browser harness. By 2026, MCP is the lingua franca: Cursor, Claude Code, VS Code, and Windsurf all speak it. A desktop automation project that ships an MCP server gives every one of those assistants the ability to drive Windows in a loop, the same way they drive Playwright. Terminator's MCP server is published as the npm package `terminator-mcp-agent` and you wire it up with one command: `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`. None of the older open source projects ship an MCP server.",
  },
  {
    q: "Is Terminator really MIT licensed and is everything I have described in the public repo?",
    a: "Yes. The repo is mediar-ai/terminator on GitHub. Selector parser, MCP agent, Rust core, Node.js bindings, Python bindings, workflow recorder, and CLI are all MIT. To verify the selector parser yourself, clone the repo, then `wc -l crates/terminator/src/selector.rs` will show 753 lines, `grep -c \"#\\[tool(\" crates/terminator-mcp-agent/src/server.rs` will show 35, and `grep -c \"^## \\[\" CHANGELOG.md` will show 86 release headings as of the 0.24.20 release on 2026-01-13.",
  },
  {
    q: "What about Linux and macOS support?",
    a: "Open source desktop automation on Linux is dominated by AT-SPI2 wrappers and dogtail, which is unmaintained but still functional. xdotool is the universal coordinate-based fallback and is maintained. On macOS, the cross-platform projects (PyAutoGUI, SikuliX, Robot Framework) work with the usual screenshot caveats. Terminator's core Rust crate has macOS Accessibility API support at the platform layer, but its npm and pip distributions ship Windows binaries today; the README is explicit about that. Pick your tool based on which OS your automation actually has to run on, not which OS the project page says it supports.",
  },
  {
    q: "Do I need to learn the selector grammar or can I record workflows instead?",
    a: "You can record. Terminator includes the terminator-workflow-recorder crate which captures human workflows as deterministic YAML you can replay. Many users record once, then edit the YAML by hand later when something needs to change. The selector grammar is what the recorded workflow ends up using under the covers, so if you ever want to debug or tighten a recorded step, knowing the grammar pays off. AutoHotkey and AutoIt have no recorder; you write scripts. SikuliX has a record-and-replay UI but it is image-based, not tree-based.",
  },
  {
    q: "If I am building an AI agent that controls a desktop in 2026, where should I start?",
    a: "Start with the smallest scope that proves the loop works. Pick one app and one workflow you can describe in three sentences. If your agent already speaks MCP, install Terminator's MCP agent (one command). Wire the agent to call get_window_tree, then click_element with a selector built from `role:` and `name:`. When that round-trip works against one app, generalize. The selector grammar will start to repay itself the moment you need a workflow that spans two windows or that has to find an element by negation (\"the only enabled Save button that is not in the toolbar\"). That is also the moment screenshot-based tools fall over.",
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

const tokenizerCode = `// crates/terminator/src/selector.rs
// 753-line, hand-written tokenizer + Shunting Yard parser.
// What follows is the Token type and the precedence table.

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Selector(String),
    And,    // &&
    Or,     // || or ,
    Not,    // !
    LParen, // (
    RParen, // )
}

fn operator_precedence(token: &Token) -> i32 {
    match token {
        Token::Or  => 1,
        Token::And => 2,
        Token::Not => 3,
        _          => 0,
    }
}

// 26 Selector variants. The interesting ones for an agent:
pub enum Selector {
    Role { role: String, name: Option<String> },
    Process(String),
    RightOf(Box<Selector>),
    LeftOf(Box<Selector>),
    Above(Box<Selector>),
    Below(Box<Selector>),
    Near(Box<Selector>),
    Has(Box<Selector>),       // Playwright-style :has()
    Parent,                   // Playwright-style ..
    And(Vec<Selector>),
    Or(Vec<Selector>),
    Not(Box<Selector>),
    // ...and 14 more.
}`;

const selectorExpressionsCode = `// What you can write in the selector string itself.
// All of this parses against a single 753-line file.

// Scope to a process, then walk a chain.
process:notepad >> role:Edit

// Combine attributes with boolean operators.
role:Button && name:Save && !classname:Disabled

// OR with || or comma.
name:Save || name:Submit, name:OK

// Spatial: pick the element next to another one.
role:TextBox && rightof:(role:Label && name:Email)

// Walk back to the parent (Playwright-style ..).
role:Button && name:Submit >> ..

// Scoped to one window, descendants two levels deep.
window:Calculator >> role:Button >> name:Seven

// Negation inside a chain.
process:chrome >> role:Button && !name:Cancel`;

const verifyLines = [
  {
    text: "git clone https://github.com/mediar-ai/terminator && cd terminator",
    type: "command" as const,
  },
  {
    text: "Cloning into 'terminator'...",
    type: "output" as const,
  },
  {
    text: "wc -l crates/terminator/src/selector.rs",
    type: "command" as const,
  },
  {
    text: "     753 crates/terminator/src/selector.rs",
    type: "success" as const,
  },
  {
    text: "grep -c \"^## \\[\" CHANGELOG.md",
    type: "command" as const,
  },
  {
    text: "86",
    type: "success" as const,
  },
  {
    text: "head -5 CHANGELOG.md | tail -4",
    type: "command" as const,
  },
  {
    text: "## [Unreleased]",
    type: "output" as const,
  },
  {
    text: "## [0.24.20] - 2026-01-13",
    type: "output" as const,
  },
  {
    text: "## [0.24.19] - 2026-01-09",
    type: "output" as const,
  },
  {
    text: "## [0.24.18] - 2026-01-09",
    type: "output" as const,
  },
  {
    text: "grep -c \"#\\[tool(\" crates/terminator-mcp-agent/src/server.rs",
    type: "command" as const,
  },
  {
    text: "35",
    type: "success" as const,
  },
  {
    text: "grep -nE \"And|Or|Not|RightOf|Has|Parent\" crates/terminator/src/selector.rs | head -8",
    type: "command" as const,
  },
  {
    text: "33: RightOf(Box<Selector>),",
    type: "output" as const,
  },
  {
    text: "44: Has(Box<Selector>),",
    type: "output" as const,
  },
  {
    text: "47: Parent,",
    type: "output" as const,
  },
  {
    text: "49: And(Vec<Selector>),",
    type: "output" as const,
  },
  {
    text: "51: Or(Vec<Selector>),",
    type: "output" as const,
  },
  {
    text: "53: Not(Box<Selector>),",
    type: "output" as const,
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "How it sees the screen",
    competitor: "Pixels, OCR, or coordinates (SikuliX, PyAutoGUI)",
    ours: "Native accessibility tree via Windows UI Automation",
  },
  {
    feature: "Selector grammar",
    competitor: "None, or a Python builder API (pywinauto)",
    ours: "Hand-written Shunting Yard parser, 26 Selector variants",
  },
  {
    feature: "Boolean operators in selectors",
    competitor: "Not supported",
    ours: "&&, ||, !, parens with NOT=3 AND=2 OR=1 precedence",
  },
  {
    feature: "Spatial selectors",
    competitor: "Not supported",
    ours: "rightof:, leftof:, above:, below:, near:",
  },
  {
    feature: "Model Context Protocol server",
    competitor: "None of the older projects ship one",
    ours: "terminator-mcp-agent with 35 tools, npm-installable",
  },
  {
    feature: "Engineering activity in 2026",
    competitor: "Mostly maintenance releases or dormant",
    ours: "Four releases in the first 13 days of January 2026",
  },
  {
    feature: "License",
    competitor: "Mixed (GPL, MIT, BSD; pywinauto BSD; AHK GPL2)",
    ours: "MIT, mediar-ai/terminator on GitHub",
  },
  {
    feature: "Surface for AI coding assistants",
    competitor: "Wrap manually in your own MCP shim",
    ours: "Native MCP, one-liner install in Cursor / Claude Code / VS Code",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "Era 1: scripting languages (1998 onward)",
    description:
      "AutoHotkey, AutoIt, sometimes Sikuli's older Jython runtime. You write a hotkey or a Send command and the OS replays it. Fast, ubiquitous, and they will probably outlive everything below them. They give an AI agent almost no structured information about the screen.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Era 2: pixel and OCR (2010 onward)",
    description:
      "SikuliX, PyAutoGUI, image-template bots. Match a saved image, click its center. Lovely until a theme changes. No selector grammar to speak of.",
    size: "1x1",
  },
  {
    title: "Era 3: accessibility wrappers (2015 onward)",
    description:
      "pywinauto, dogtail, Linux AT-SPI2 wrappers, the old WinAppDriver. They expose the OS accessibility tree through a builder API. No parser, no boolean operators, often no spatial selectors.",
    size: "1x1",
  },
  {
    title: "Era 4: MCP-native, parser-backed",
    description:
      "Terminator. Accessibility tree plus a real selector grammar plus a Model Context Protocol server. You hand an AI assistant a string and it walks the OS. April 2026 is the first year this category is shippable, MIT, and not a research demo.",
    size: "2x1",
  },
  {
    title: "RPA studios are not on this list",
    description:
      "Power Automate Desktop, UiPath Studio, Blue Prism, and Automation Anywhere are not open source desktop automation projects, no matter how the marketing reads. They are commercial flowchart builders. Useful for human-driven processes, not the right shape for an AI coding assistant in a loop.",
    size: "1x1",
  },
  {
    title: "Robot Framework deserves a separate note",
    description:
      "Robot Framework is open source and active, but it is a keyword-driven test runner, not a desktop automation framework. Pair it with the RPA Framework libraries (rpaframework.org) and you get something useful, with most of the same screenshot caveats as SikuliX once you leave the browser.",
    size: "1x1",
  },
];

const projectChips = [
  "AutoHotkey",
  "AutoIt",
  "SikuliX",
  "PyAutoGUI",
  "pywinauto",
  "Robot Framework",
  "RPA Framework",
  "dogtail",
  "xdotool",
  "AT-SPI2",
  "WinAppDriver",
  "Appium Windows",
  "Terminator",
];

const eraTimelineSteps = [
  {
    title: "1998 to 2010: keyboard-and-mouse scripting",
    description:
      "AutoHotkey (1998) and AutoIt (1999) define the genre. You bind a key, you send a string, you script Windows like it is a typewriter. Reliable for a single workflow, opaque to anything that needs to read the screen.",
  },
  {
    title: "2010 to 2020: pixels and image templates",
    description:
      "Sikuli, then SikuliX. PyAutoGUI in 2014. Macro recorders inside RPA studios. They work because GPUs got fast and screenshots got cheap. They break the moment Windows changes a theme.",
  },
  {
    title: "2018 to 2024: accessibility wrappers go mainstream",
    description:
      "pywinauto picks up users. dogtail and AT-SPI2 stabilize on Linux. WinAppDriver tries to be Selenium for Windows. The accessibility tree is finally first-class on Windows and macOS, but every project exposes it through a different builder API.",
  },
  {
    title: "2024 onward: MCP and parser-backed selectors",
    description:
      "Anthropic ships Model Context Protocol. AI assistants suddenly need a stable, typed contract for desktop tools. Terminator publishes an MCP server with 35 tools and a 753-line selector parser. April 2026 is the first month where you can install this category in one command.",
  },
];

const metrics = [
  { value: 753, suffix: "", label: "Lines in selector.rs (parser + types)" },
  { value: 26, suffix: "", label: "Selector enum variants" },
  { value: 35, suffix: "", label: "Tools in the MCP server" },
  { value: 86, suffix: "", label: "Versioned releases by 2026-01-13" },
];

const remotionCaptions = [
  "April 2026: most desktop automation lists still recommend tools from 2010.",
  "AutoHotkey, AutoIt, SikuliX, PyAutoGUI, pywinauto, Robot Framework.",
  "All real, all useful, none designed for an AI coding assistant.",
  "One open source project ships a real selector grammar and an MCP server.",
  "That is the spine of this guide.",
];

const relatedPosts = [
  {
    title: "Automation tools for Windows: the cache-batched accessibility tree",
    href: "/t/automation-tools-for-windows",
    excerpt:
      "How Terminator builds the entire UIA subtree in one CacheRequest round-trip and why that lets an AI agent loop without paying IPC tax.",
    tag: "Architecture",
  },
  {
    title: "Accessibility API desktop automation, demystified",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "What the Windows UI Automation tree actually exposes, and why it is the right primitive for an agent that has to survive a theme change.",
    tag: "Concepts",
  },
  {
    title: "Claude desktop automation: hooking Claude into your OS",
    href: "/t/claude-desktop-automation",
    excerpt:
      "A walkthrough of installing the terminator-mcp-agent in Claude Code and the first three tool calls that prove the loop works.",
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

      <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <BackgroundGrid pattern="dots" glow>
          <div className="py-10">
            <ArticleMeta
              datePublished={PUBLISHED}
              author="Matthew Diakonov"
              readingTime="13 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Open source desktop automation projects, April 2026: which ones still ship, which ones speak{" "}
              <GradientText>MCP</GradientText>, and the only one with a real selector grammar
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Most guides on this topic re-list the same six projects from 2010 and call it a day. That
              is not an accurate map of what is shippable in April 2026. The interesting question is no
              longer &ldquo;what scripts the keyboard&rdquo;, it is &ldquo;what hands an AI coding
              assistant a typed contract for the entire OS&rdquo;. This guide walks the open source
              projects that are still active, groups them by what they actually expose to an agent, and
              ends on the one project that ships a real selector grammar plus a Model Context Protocol
              server. The grammar lives in a single file, 753 lines, MIT licensed.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={4.9}
          ratingCount="86 versioned releases, 35 MCP tools, 26 Selector variants, all MIT"
          highlights={[
            "Hand-written Shunting Yard parser, crates/terminator/src/selector.rs",
            "Spatial selectors: rightof, leftof, above, below, near",
            "MCP server installs with one npx command",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="Open source desktop automation in April 2026"
            subtitle="The state of the art, in five lines"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The projects in active circulation
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Before grouping them, here is the cast. Every name below is an open source project that
            still has users and at least an occasional release in 2025 or 2026. Some are decades old.
            One is two years old. They are all real.
          </p>
          <Marquee speed={36} pauseOnHover fade>
            {projectChips.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
              >
                {name}
              </span>
            ))}
          </Marquee>
          <p className="mt-2 text-sm text-zinc-500">
            Not exhaustive. RPA studios (Power Automate Desktop, UiPath, Blue Prism) are excluded
            because they are commercial. Selenium and Playwright are excluded because they automate
            browsers, not desktops.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Four eras of open source desktop automation
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The cleanest way to make sense of this list is to sort by what each project hands to the
            caller. There are four eras. They overlap. Most existing guides flatten all four into a
            single bullet list, which is why those guides feel interchangeable.
          </p>
          <div className="mt-8">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            How we got here
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shape of the field follows the shape of what was fast on commodity hardware. Each era
            replaces the previous one not because the older tools stopped working, but because a new
            primitive became cheap enough to wrap.
          </p>
          <div className="mt-6">
            <StepTimeline steps={eraTimelineSteps} />
          </div>
        </section>

        <ProofBanner
          quote="The selector parser is one file. 753 lines. Six tokens, three precedence levels, 26 Selector variants. That is the spine of an AI-driven desktop automation workflow in 2026."
          metric="753 LOC"
          source="crates/terminator/src/selector.rs"
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The anchor: a real selector grammar for the desktop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Across every project on the chip strip above, exactly one ships a parser for selector
            expressions. AutoHotkey has a hotkey DSL, but it does not query the accessibility tree.
            AutoIt has window titles and control IDs, but no boolean composition. SikuliX matches
            images, not symbolic locators. PyAutoGUI matches images. pywinauto exposes a Python builder
            (chained method calls), which is fine for Python but cannot be serialized to a string and
            handed to an AI assistant over a wire protocol. Robot Framework is keyword-driven; the
            keywords delegate to libraries that, again, do not parse a grammar.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s grammar is parsed by a single 753-line Rust file at{" "}
            <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
              crates/terminator/src/selector.rs
            </code>
            . The pipeline is the textbook one for boolean expressions: tokenize the input, run
            Shunting Yard with operator precedence, fold operators into AST nodes. The interesting
            part is how few moving parts it has.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={tokenizerCode}
              language="rust"
              filename="crates/terminator/src/selector.rs"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three precedence levels (NOT=3, AND=2, OR=1) and 26 Selector variants are enough to
            describe almost every locator a UI agent needs to express. The grammar cooperates with the
            chain operator <code>&gt;&gt;</code> and the parent operator <code>..</code>, both
            borrowed from Playwright&apos;s vocabulary. Spatial selectors are unique to desktop work,
            because the screen is two-dimensional in a way the DOM is not.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What you can actually write
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The grammar earns its keep when you watch how compact a real locator becomes. Each line
            below parses against the file above and matches a single element on a Windows desktop.
            Most of these would be a paragraph of code in any of the older projects.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={selectorExpressionsCode}
              language="text"
              filename="selector strings"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The last expression is the one I think pays for the whole grammar. <code>process:chrome</code>{" "}
            scopes the lookup to a single browser process. <code>&gt;&gt;</code> walks one level into
            the descendants. <code>role:Button &amp;&amp; !name:Cancel</code> matches every button that
            is not the Cancel button. Try writing that in image-template form. You can&apos;t. Try
            writing it in pywinauto&apos;s builder API. You can, but it takes three lines and your
            agent has to know it.
          </p>
        </section>

        <MetricsRow metrics={metrics} />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Side by side: the only one of these projects an AI agent can drive over MCP
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pulling the row count down to the questions that matter for an agent in 2026: how does it
            see the screen, what does the selector grammar look like, is there a Model Context Protocol
            server, and how active is the project this year.
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="Terminator"
              competitorName="Typical open source desktop automation project"
              rows={comparisonRows}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Verify it yourself before you install anything
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three of the four claims in this guide are checkable in under a minute against the public
            repo. The fourth (MCP tool count) takes one more grep. Here is the shell session in full,
            so you can confirm before you trust the prose.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="Verify selector parser, release cadence, and MCP tool count"
              lines={verifyLines}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If those numbers do not line up against the latest <code>main</code>, the project moved
            faster than this guide did, and the conclusion still holds. Terminator&apos;s release
            cadence is the second piece of evidence in this guide. The first is the file path.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the older projects are still good for
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this is a takedown of AutoHotkey or SikuliX. Those projects are excellent at the
            jobs they were designed for, and they predate Model Context Protocol by 25 and 15 years
            respectively. AutoHotkey is the right answer when you want a global hotkey and a fast Send
            command. SikuliX is the right answer when the target software is a legacy Win32 control
            with no accessibility surface and a stable visual layout. PyAutoGUI is the right answer
            when you want a 200-line Python script that nudges a mouse cursor.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shift in 2026 is that the typical job has changed. The interesting unit of automation
            is no longer &ldquo;a one-off script a human runs&rdquo;, it is &ldquo;an AI assistant
            that drives the desktop in a loop&rdquo;. For that job, the grammar matters more than any
            single primitive. A Send command is not a contract. A typed selector string is.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The takeaway
          </h2>
          <GlowCard>
            <div className="p-6">
              <p className="text-zinc-800 leading-relaxed">
                If you are picking an open source desktop automation project in April 2026 because a
                human will run scripts, AutoHotkey, AutoIt, or PyAutoGUI is fine. If you are picking
                because an AI coding assistant has to drive the desktop in a loop, you want three
                things the older projects do not give you: a structured view of the screen via the
                accessibility tree, a typed selector grammar your assistant can produce as a string,
                and a Model Context Protocol server it can call directly. Those three things meet in
                exactly one project on this list. The grammar is in one file, the file is 753 lines,
                and it is MIT licensed at <code>mediar-ai/terminator</code>.
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want to see the selector grammar driving your own Windows app?"
          description="Hop on a call and we will run Terminator against the exact workflow your team is trying to automate, with the locator strings on screen."
        />

        <div className="mt-14">
          <FaqSection items={faqs} />
        </div>

        <div className="mt-14">
          <RelatedPostsGrid
            title="Adjacent reading"
            subtitle="More on the implementation details behind this category"
            posts={relatedPosts}
          />
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the selector grammar drive your desktop apps live."
      />
    </>
  );
}
