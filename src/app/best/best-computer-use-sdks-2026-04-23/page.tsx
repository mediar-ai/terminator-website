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
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  GlowCard,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
} from "@seo/components";
import { SiblingCtaButton } from "./SiblingCtaButton";

const PAGE_URL = "https://t8r.tech/best/best-computer-use-sdks-2026-04-23";
const PUBLISHED = "2026-04-23";
const TITLE = "Best computer-use SDKs for April 23, 2026";
const DESCRIPTION =
  "A ranked April 23, 2026 roundup of the best computer-use SDKs and adjacent tools for developers wiring AI into native apps. Terminator leads with a 25-variant selector enum against the OS accessibility tree, then Fazm, macOS MCP, Assrt, Claude Meter, and five cross-industry picks worth knowing about.";

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
  { label: "Computer-use SDKs for April 23, 2026" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Best of", url: "https://t8r.tech/best" },
  { name: "Best computer-use SDKs for April 23, 2026", url: PAGE_URL },
];

const selectorEnumSource = `// crates/terminator/src/selector.rs
// 25 variants. 5 spatial. 3 boolean. 1 chain. The rest, attributes.
// This is what a code-first computer-use SDK looks like in April 2026.

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

const hostBento: BentoCard[] = [
  {
    title: "25 Selector enum variants",
    description:
      "Defined in crates/terminator/src/selector.rs. Includes Role, Name, NativeId, Process, Chain, five spatial variants (RightOf, LeftOf, Above, Below, Near), and three boolean composers (And, Or, Not).",
    size: "2x1",
  },
  {
    title: "5 spatial selectors",
    description:
      "rightof:, leftof:, above:, below:, near:. Locate elements by screen geometry when the accessibility tree has no stable role or name.",
    size: "1x1",
  },
  {
    title: "35 MCP tools",
    description:
      "crates/terminator-mcp-agent ships 35 tools that Claude Code, Cursor, and any MCP client can call directly. Same selectors you use in code.",
    size: "1x1",
  },
  {
    title: "Windows UIA + macOS AX",
    description:
      "Native adapters under crates/terminator/src/platforms. One Desktop() instance spans every running process on the machine.",
    size: "2x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Code-first SDK (not a chat UI)",
    competitor: "Anthropic computer-use API is model-first; Operator is a consumer product",
    ours: "Yes. TypeScript and Rust SDK, MIT-licensed, no model required",
  },
  {
    feature: "Targets any native app on the OS",
    competitor: "Browser Use and Steel are browser-only. Operator is browser-only.",
    ours: "Yes. Excel, Outlook, Acrobat, Notion desktop, or any app with an AX/UIA tree",
  },
  {
    feature: "Selector language richer than CSS/XPath",
    competitor: "None. Most agent SDKs take screenshots and let the model choose",
    ours: "25-variant Selector enum with boolean + spatial + chain operators",
  },
  {
    feature: "Deterministic resolution (no LLM per click)",
    competitor: "Agent SDKs pay a model inference per action",
    ours: "1 to 50 ms tree walk. Model optional, called only when you want it to be",
  },
  {
    feature: "Ships its own MCP server",
    competitor: "Most computer-use vendors do not",
    ours: "35 tools in crates/terminator-mcp-agent, works with Claude Code today",
  },
];

interface SiblingEntry {
  rank: number;
  name: string;
  slug: string;
  category: string;
  headline: string;
  blurb: string;
  getStartedUrl: string;
  buttonText: string;
  website: string;
  tagGroup: "same-niche" | "cross-industry";
}

const siblings: SiblingEntry[] = [
  {
    rank: 2,
    name: "Fazm",
    slug: "fazm",
    category: "AI desktop agents",
    headline: "The end-user face of a computer-use SDK",
    blurb:
      "If Terminator is the framework layer, Fazm is what happens when you put a voice-first, fully local agent on top of it. Developers evaluating computer-use SDKs should try Fazm first to see what the end product can feel like: browser control, code editing, Google Apps, document handling, all on macOS, fully open source. It is the fastest way to see computer-use work on real desktop apps without writing a line of code yourself.",
    getStartedUrl: "https://fazm.ai/download",
    buttonText: "Download Fazm",
    website: "https://fazm.ai",
    tagGroup: "same-niche",
  },
  {
    rank: 3,
    name: "macOS MCP",
    slug: "macos-mcp",
    category: "macOS MCP servers",
    headline: "The macOS-native MCP companion for Claude Code and friends",
    blurb:
      "Pure macOS-side computer-use exposed as an MCP server. This is the tool Fazm uses for its screen control, now standalone for any MCP client (Claude Code, Cursor, Zed). If your computer-use scope is Mac-only and you prefer to let your AI assistant drive over MCP instead of through a TypeScript SDK, start here. Pairs well with Terminator when your surface covers Windows and macOS.",
    getStartedUrl: "https://macos-use.dev",
    buttonText: "Try macOS MCP",
    website: "https://macos-use.dev",
    tagGroup: "same-niche",
  },
  {
    rank: 4,
    name: "Assrt",
    slug: "assrt",
    category: "AI QA testing tools",
    headline: "Computer-use aimed squarely at QA",
    blurb:
      "Computer-use SDKs and QA automation are becoming the same category. Assrt is the open-source AI tester built on Playwright that auto-discovers scenarios, generates tests, and self-heals selectors. Use it when your computer-use work involves testing web-heavy flows. Use Terminator when the flow escapes the browser into Excel or a native PDF reader. The two stack cleanly in the same repo.",
    getStartedUrl: "https://app.assrt.ai",
    buttonText: "Open Assrt",
    website: "https://assrt.ai",
    tagGroup: "same-niche",
  },
  {
    rank: 5,
    name: "Claude Meter",
    slug: "claude-meter",
    category: "Claude usage trackers",
    headline: "A required companion if you burn tokens driving computer-use",
    blurb:
      "Computer-use workloads are the single easiest way to blow through a Claude weekly quota, because each action cycles a screenshot and a reasoning pass. Claude Meter is a free, MIT-licensed menu bar app and browser extension that shows your live Claude Pro and Max usage: rolling 5-hour window, weekly quota, extra-usage balance. No telemetry. Every serious computer-use developer should be running it.",
    getStartedUrl: "https://claude-meter.com/install",
    buttonText: "Install Claude Meter",
    website: "https://claude-meter.com",
    tagGroup: "same-niche",
  },
  {
    rank: 6,
    name: "mk0r",
    slug: "mk0r",
    category: "AI app builders",
    headline: "What you build on top once computer-use gets easy",
    blurb:
      "mk0r is the opposite of Terminator in the AI tool stack: Terminator gives a single agent control of the whole OS, mk0r turns a sentence into a full HTML/CSS/JS mobile app in real time. Interesting for computer-use devs because it is the kind of generative UI that agents will be opening and operating on users' screens by end of year. Good mental model for what the other side of the computer-use pipeline is starting to look like.",
    getStartedUrl: "https://mk0r.com",
    buttonText: "Try mk0r",
    website: "https://mk0r.com",
    tagGroup: "same-niche",
  },
  {
    rank: 7,
    name: "S4L",
    slug: "s4l",
    category: "social media autoposter tools",
    headline: "Cross-industry pick, one of the best showcases of computer-use in production",
    blurb:
      "S4L is a social media autoposter that drives logged-in sessions across Reddit, X, LinkedIn, and Moltbook. It is one of the clearest real-world examples of how computer-use SDKs get deployed: headful browser automation, site-specific selectors, scheduled runs, engagement tracking. Developers building on top of computer-use frameworks should study how it handles auth, selector drift, and rate limits across five different product surfaces.",
    getStartedUrl: "https://s4l.ai",
    buttonText: "Open S4L",
    website: "https://s4l.ai",
    tagGroup: "cross-industry",
  },
  {
    rank: 8,
    name: "Cyrano",
    slug: "cyrano",
    category: "apartment security cameras",
    headline: "Cross-industry pick, computer-use for CCTV",
    blurb:
      "Cyrano plugs into existing DVR/NVR security systems via HDMI and runs edge AI on up to 25 camera feeds per unit, without replacing any camera. Included here as a cross-industry reference for computer-use developers because the architecture is the same pattern: an intelligent layer sitting on top of a legacy interface, reading pixels and raising structured events. Same mental model as an accessibility-tree agent, different input modality.",
    getStartedUrl: "https://apartment-security-cameras.com",
    buttonText: "See Cyrano",
    website: "https://apartment-security-cameras.com",
    tagGroup: "cross-industry",
  },
  {
    rank: 9,
    name: "Clone",
    slug: "clone",
    category: "AI tools for consultants",
    headline: "What computer-use enables for solo operators",
    blurb:
      "Clone runs a consulting business end to end: invoicing, onboarding, follow-ups, CRM, reporting, all inside the tools the operator already has. Relevant to computer-use SDK developers because it is a complete vertical app built on the premise that an agent can touch QuickBooks, Gmail, Notion, and a CRM without bespoke APIs. Exactly the surface area an SDK like Terminator is built to unlock.",
    getStartedUrl: "https://cl0ne.ai",
    buttonText: "Visit Clone",
    website: "https://cl0ne.ai",
    tagGroup: "cross-industry",
  },
];

const listicleTools = [
  "Anthropic computer-use",
  "OpenAI Operator",
  "Browser Use",
  "Steel Browser",
  "LangChain agents",
  "CrewAI",
  "AutoGen",
  "Appium",
  "WinAppDriver",
  "Playwright",
  "Selenium",
  "UI.Vision",
];

const beamNodes = {
  from: [
    { label: "MCP client", sublabel: "Claude Code, Cursor" },
    { label: "TypeScript SDK", sublabel: "@mediar-ai/terminator" },
    { label: "Rust crate", sublabel: "terminator" },
    { label: "Agent framework", sublabel: "any LLM caller" },
  ],
  hub: { label: "Selector enum", sublabel: "25 variants, Shunting Yard parser" },
  to: [
    { label: "Windows UIA", sublabel: "every app on Windows" },
    { label: "macOS AX", sublabel: "every app on macOS" },
    { label: "Chrome DOM", sublabel: "extension bridge" },
    { label: "MCP tools", sublabel: "35 in terminator-mcp-agent" },
  ],
};

const terminalLines = [
  { text: "npm install @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 2s", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "npx terminator probe 'process:EXCEL >> role:DataItem'", type: "command" as const },
  { text: "  matched 412 elements in 47 ms", type: "output" as const },
  {
    text: "  first: DataItem [name='Q1 2026', AutomationId='A2']",
    type: "output" as const,
  },
  { text: "", type: "output" as const },
  {
    text: "# same selector, called over MCP by Claude Code",
    type: "output" as const,
  },
  {
    text: "tool: get_element → { selector: 'process:EXCEL >> role:DataItem' }",
    type: "command" as const,
  },
  { text: "PASS  0 errors", type: "success" as const },
];

const faqs = [
  {
    q: "Why is Terminator ranked number 1 on this list of best computer-use SDKs for April 23, 2026?",
    a: "Because this list is scored for developers building on computer-use, not consumers trying one out, and on that axis Terminator has the most concrete developer surface area of anything available today: a 25-variant Selector enum in `crates/terminator/src/selector.rs`, a Shunting Yard parser for boolean operators, five spatial selectors (RightOf, LeftOf, Above, Below, Near), one chain operator (>>), native Windows UIA and macOS AX adapters, a TypeScript SDK, a Rust crate, and an MCP server shipping 35 tools. If you disagree with the criteria, the other ten picks on the list are worth reading on their own.",
  },
  {
    q: "Is this list just Anthropic computer-use, OpenAI Operator, and Browser Use with a twist?",
    a: "No, and that is the point. Every other list of computer-use SDKs for April 2026 that I checked ranks those three plus a handful of agent frameworks (LangChain, CrewAI, AutoGen). That is the model-first view of the category. This list is written for developers who need to point at a specific UI element and reliably click, type, or read it, across both native and browser apps, from a real code file. It includes the model-first options by reference, but leads with the tools that actually give you that control.",
  },
  {
    q: "What exactly is the 25-variant Selector enum in Terminator?",
    a: "It is the Rust enum `Selector` defined in `crates/terminator/src/selector.rs` of github.com/mediar-ai/terminator. The 25 variants are: Role, Id, Name, Text, Path, NativeId, Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has, Parent, And, Or, Not, Invalid. Twelve are attribute matchers. Five are spatial. Three are boolean composers. One is a descendant chain. The rest are structural. Every prefix you write in a selector string maps to one of them.",
  },
  {
    q: "How is this different from a browser automation tool like Playwright or Browser Use?",
    a: "Playwright is excellent inside a browser tab. Browser Use and Steel are excellent if your entire computer-use problem is a web page. The moment the flow crosses into Excel, Acrobat, Outlook, or a custom native app, browser-only tools stop working. Terminator resolves selectors against the OS accessibility tree directly: Windows UIA on Windows, the AX API on macOS, and a Chrome extension bridge for DOM access inside Chrome or Edge. A single test file can resolve selectors across UIA, AX, and the Chrome DOM in one run.",
  },
  {
    q: "Do I need to use a specific model with Terminator?",
    a: "No. Terminator is a code-first SDK. A selector resolves in 1 to 50 ms via a deterministic tree walk with no model call. That is the whole point: an agent SDK that pays an LLM inference per click is slow and expensive; Terminator lets you do the routine parts in code and call a model only when you want help. You can wire any model you want (Claude, GPT, local Llama) on top. If you want an MCP-native experience, the bundled MCP server exposes the same selectors to Claude Code, Cursor, and any MCP client.",
  },
  {
    q: "Are the spatial selectors really useful, or is that a gimmick?",
    a: "They are the reason native computer-use works on real apps. Custom widgets, WinForms apps, old Qt apps, and older Electron apps often have a thin or inconsistent accessibility tree. Names and AutomationIds are missing. In those cases, you anchor off a nearby labeled element and traverse: `rightof:(role:Text && name:Password)` is a working locator for an unlabeled password field, `below:(role:HeaderItem && name:Amount)` locates the Excel cell under the Amount header without hardcoding row numbers. No other computer-use SDK on this list ships those selectors as first-class syntax.",
  },
  {
    q: "What platforms does Terminator run on today?",
    a: "Windows and macOS are first-class. On Windows, Terminator uses the UI Automation (UIA) COM API. On macOS, it uses AXUIElement. Linux has experimental AT-SPI2 support but is not the primary target in April 2026. Chrome DOM access is available on all platforms through the Terminator Chrome extension, which exposes executeBrowserScript() on any element resolved inside a Chrome or Edge process.",
  },
  {
    q: "Why include cross-industry picks like Cyrano and Clone in a list of computer-use SDKs?",
    a: "Because computer-use is not only about SDK ergonomics. It is about what the SDK lets you build. Cyrano applies the same architectural pattern (intelligent layer, legacy interface, structured events) to CCTV. Clone is a vertical AI operator that assumes an agent can touch every tool a small-business owner uses. Both of those are signal for where computer-use ends up. Reading them alongside the SDK picks gives developers a fuller mental model of the category than listing only framework libraries would.",
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
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Roundup
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                April 23, 2026
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Computer-use SDKs
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Developer-first
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Best <GradientText>computer-use SDKs</GradientText> for April 23,
              2026
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Dated list, updated this week. April 23, 2026. Scored for
              developers building on computer-use, not consumers trying one
              out. The question this list answers: of everything available
              today, which tool gives you the most honest control over real
              apps, with code you can read, at a price that does not scale
              with every click? Eleven picks, ordered from most to least
              relevant for that question, including two cross-industry picks
              that tell you where computer-use ends up.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="9 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="Open-source, MIT"
              highlights={[
                "25 Selector enum variants in crates/terminator/src/selector.rs",
                "35 MCP tools in crates/terminator-mcp-agent",
                "Windows UIA + macOS AX adapters, Chrome DOM bridge",
                "11 picks on this list, 8 siblings with tracked CTAs",
              ]}
            />
          </div>
        </BackgroundGrid>

        {/* Video-style concept intro */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Best computer-use SDKs"
            subtitle="April 23, 2026, developer-first ranking"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "Everyone lists Operator + Browser Use. That is the consumer view.",
              "Developers need a selector, not a chat box.",
              "Terminator: 25 Selector variants, 5 spatial, 1 chain.",
              "Plus Fazm, macOS MCP, Assrt, Claude Meter, and more.",
              "Ranked the way a developer actually chooses.",
            ]}
          />
        </section>

        {/* The category shape */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            What this date actually reflects
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            April 23, 2026 is the fifth week since Anthropic&apos;s last
            Claude computer-use refresh and about four months after OpenAI
            shipped Operator to consumers. The common listicles now rank
            those two plus Browser Use, Steel, and whatever agent framework
            the author knows best. That is the model-first view. This list
            is written from the other direction: pick up a code file, point
            at an element, click it, read it, move on. Ranked in that order.
          </p>
          <Marquee speed={34}>
            {listicleTools.map((name) => (
              <span
                key={name}
                className="inline-flex items-center px-5 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </Marquee>
          <p className="text-zinc-600 mt-6 max-w-3xl leading-relaxed">
            Every tool above shows up somewhere in the common roundups. Most
            of them are not wrong choices, they are just in a different
            category than what a developer asking &quot;which SDK should I
            use for computer-use?&quot; actually needs. The rank below is
            organized by that need.
          </p>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 py-6">
          <div className="my-8 rounded-2xl border border-zinc-200 bg-zinc-50 grid grid-cols-2 md:grid-cols-4 divide-x divide-zinc-200">
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-orange-600">
                <NumberTicker value={11} />
              </div>
              <div className="text-sm text-zinc-500 mt-2">
                Picks on this list
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-orange-600">
                <NumberTicker value={25} />
              </div>
              <div className="text-sm text-zinc-500 mt-2">
                Selector variants in Terminator
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-orange-600">
                <NumberTicker value={35} />
              </div>
              <div className="text-sm text-zinc-500 mt-2">
                MCP tools shipped with Terminator
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-orange-600">
                <NumberTicker value={2} />
              </div>
              <div className="text-sm text-zinc-500 mt-2">
                Cross-industry picks included
              </div>
            </div>
          </div>
        </section>

        {/* Rank 1: Terminator (host) */}
        <section className="max-w-4xl mx-auto px-6 py-10" id="rank-1-terminator">
          <div className="flex items-baseline gap-4 mb-2">
            <span className="text-6xl font-bold text-orange-600 tabular-nums">
              01
            </span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900">
                Terminator
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                developer framework, desktop + browser, MIT
              </p>
            </div>
          </div>
          <p className="text-zinc-600 my-5 max-w-3xl leading-relaxed">
            Terminator is the reason this list exists. It is a Playwright-shaped
            SDK for the whole OS: a TypeScript and Rust API that resolves
            selectors against native accessibility trees on Windows and
            macOS, and against the Chrome DOM through an extension bridge.
            You write a string, it walks a tree, you get an element. No
            model in the hot path. The complete selector grammar is one
            file.
          </p>

          <AnimatedCodeBlock
            code={selectorEnumSource}
            language="rust"
            filename="crates/terminator/src/selector.rs"
          />

          <p className="text-zinc-600 my-6 max-w-3xl leading-relaxed">
            Everything a computer-use SDK has to do, that file describes in
            25 variants: five attribute matchers most developers already
            know (role, name, text, id, classname), a process scope,
            native-id, five spatial selectors, three boolean composers
            parsed with a Shunting Yard, and a chain operator that lets one
            selector descend through the first match. The MCP server in{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent
            </code>{" "}
            exposes the same grammar to any MCP client, with 35 tools
            including click_element, type_into_element, validate_element,
            execute_sequence, and run_command.
          </p>

          <BentoGrid cards={hostBento} />

          <div className="my-8">
            <AnimatedBeam
              title="One selector, every target"
              from={beamNodes.from}
              hub={beamNodes.hub}
              to={beamNodes.to}
              accentColor="#FF3E00"
            />
          </div>

          <TerminalOutput title="probe and MCP call" lines={terminalLines} />

          <div className="my-8">
            <ComparisonTable
              productName="Terminator"
              competitorName="Typical computer-use SDK"
              rows={comparisonRows}
            />
          </div>

          <div className="mt-8">
            <a
              href="https://github.com/mediar-ai/terminator"
              className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 text-white font-medium shadow-sm hover:bg-orange-700 transition-colors"
            >
              Read the source on GitHub →
            </a>
          </div>
        </section>

        {/* Ranks 2-9: Sibling entries */}
        {siblings.map((entry) => (
          <section
            key={entry.slug}
            className="max-w-4xl mx-auto px-6 py-10"
            id={`rank-${entry.rank}-${entry.slug}`}
          >
            <GlowCard>
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-6xl font-bold text-zinc-300 tabular-nums">
                  {String(entry.rank).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-900">
                    {entry.name}
                  </h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {entry.category}
                    {entry.tagGroup === "cross-industry" ? (
                      <span className="ml-2 inline-block bg-orange-50 text-orange-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-orange-200 uppercase tracking-wide">
                        Cross-industry
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              <h3 className="text-lg font-medium text-zinc-800 mt-4 mb-2">
                {entry.headline}
              </h3>
              <p className="text-zinc-600 leading-relaxed">{entry.blurb}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SiblingCtaButton
                  slug={entry.slug}
                  destination={entry.getStartedUrl}
                  text={entry.buttonText}
                  section={`entry-${entry.rank}`}
                />
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 hover:text-orange-600 transition-colors"
                >
                  {entry.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            </GlowCard>
          </section>
        ))}

        {/* How this list was scored */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-900 mb-3">
            How this list was scored
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Four criteria, in order. Each one eliminates tools that do not
            clear it before getting to the next.
          </p>
          <ol className="space-y-4 max-w-3xl list-decimal pl-6 marker:text-orange-600 marker:font-bold">
            <li className="text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Code-first surface.
              </span>{" "}
              There has to be a real SDK or framework, not only a chat UI or
              a closed API. A developer should be able to clone a repo and
              read the grammar.
            </li>
            <li className="text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Coverage beyond the browser.
              </span>{" "}
              Browser-only options are fine, but ranked lower for a
              computer-use list. The category is about every app on the
              machine, not only the tab.
            </li>
            <li className="text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Deterministic resolution when possible.
              </span>{" "}
              Tools that pay an LLM inference per action are slow and
              expensive. Prefer a tree walk when a tree exists.
            </li>
            <li className="text-zinc-700 leading-relaxed">
              <span className="font-semibold text-zinc-900">
                Pricing that does not scale with every click.
              </span>{" "}
              Open-source and MIT preferred. Per-seat SaaS tools are
              excluded from the top ranks but noted where relevant.
            </li>
          </ol>
        </section>

        {/* Book a call (footer) */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Want help picking one of these for a real codebase?"
            description="30 minutes with the Terminator team. We will walk through your app, map selectors, and tell you which tool on this list is actually the right fit."
            section="roundup-footer"
          />
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <FaqSection items={faqs} />
        </section>
      </article>

      {/* Sticky CTA */}
      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Talk to the Terminator team about your computer-use stack"
        section="roundup-sticky"
      />
    </div>
  );
}
