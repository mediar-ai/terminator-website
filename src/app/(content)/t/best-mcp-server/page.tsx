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
  ShimmerButton,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  BentoGrid,
  GlowCard,
  InlineCta,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/best-mcp-server";
const PUBLISHED = "2026-06-10";
const TITLE =
  "The best MCP server is the wrong question. Best for which job? A category map, with the desktop one nobody covers";
const DESCRIPTION =
  "Every 'best MCP server' listicle ranks servers by GitHub stars and lumps them into one pile. That hides the only thing that matters: best for which job. Here is the honest category map (repo, browser, knowledge, database, desktop) with the right pick per category, plus a deep look at the one category the listicles skip: driving native desktop apps via accessibility trees, where Playwright and screenshot/RobotJS servers fall over.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "There is no single best MCP server. There is a best server per job. GitHub for repos, Playwright for the browser, Notion/Slack for knowledge, SQL for data, and an accessibility-tree server for native desktop apps. This page is that map.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best MCP server? Wrong question. Best for which job.",
    description:
      "A category map of MCP servers: repo, browser, knowledge, database, desktop. With the one category every listicle skips: native desktop control via the accessibility tree.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Best MCP server" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Best MCP server", url: PAGE_URL },
];

const categoryRows: ComparisonRow[] = [
  {
    feature: "Repo / code (read files, PRs, issues)",
    competitor: "GitHub MCP server",
    ours: "Best when the job stays inside a Git host. Structured, official, the first server most people install. Not a desktop tool.",
  },
  {
    feature: "Browser / web pages (DOM, scraping, form fills)",
    competitor: "Playwright MCP server (Microsoft)",
    ours: "Best for anything that lives in a browser. Fast, cross-platform, DOM-accurate. If your whole task is web, stop here, this is the right tool, not a desktop framework.",
  },
  {
    feature: "Team knowledge (docs, wikis, messages)",
    competitor: "Notion / Slack MCP servers",
    ours: "Best when the answer is already written down somewhere internal. Easy setup, read-and-write over a known API.",
  },
  {
    feature: "Structured data (SQL, schemas, reports)",
    competitor: "SQL / database MCP servers",
    ours: "Best when the question is a query. One of the original reference servers and still among the most useful.",
  },
  {
    feature: "Native desktop apps (the OS beyond the browser)",
    competitor: "Screenshot / RobotJS servers, Windows-MCP",
    ours: "Terminator: drives any native app through the OS accessibility tree (UIA on Windows, AX on macOS), not pixels. Structural lookups, sub-second latency, no OCR. The category the listicles skip.",
  },
];

const categoryBento: BentoCard[] = [
  {
    title: "Start with the job, not the star count",
    description:
      "A 593-server directory sorted by GitHub stars tells you what is popular, not what fits your task. Popularity and fit are different axes. The Playwright server has 12K stars and is useless for clicking a button in a native Win32 dialog.",
    size: "2x1",
  },
  {
    title: "3 to 8 servers, not 30",
    description:
      "The consistent advice across every roundup: most effective setups run 3 to 8 MCP servers. Start with the 2 or 3 that cover your primary workflow, add more only when a concrete use case appears. A wall of installed servers is latency and prompt bloat, not capability.",
    size: "2x1",
  },
  {
    title: "Browser is solved. The OS is not.",
    description:
      "Playwright owns the browser category outright. The gap is everywhere else on the desktop: legacy line-of-business apps, native installers, accounting software, the 80% of work that never opens a tab. That is the category this page goes deep on.",
    size: "2x1",
  },
  {
    title: "Official beats popular for the obvious ones",
    description:
      "For GitHub, Slack, Notion, and Playwright, prefer the first-party server. They track API changes and are maintained. Reach for community servers when no first-party option exists, which is exactly the case for cross-platform native desktop control.",
    size: "1x1",
  },
  {
    title: "Verify the tool list before you trust the README",
    description:
      "A server's real surface is the JSON-RPC tools/list response, not its marketing. Run npx @modelcontextprotocol/inspector against any server to see the exact tools it exposes before you wire it into an agent.",
    size: "2x1",
  },
  {
    title: "Transport matters under load",
    description:
      "stdio servers spawn as a child process and are simplest for local single-user agents. HTTP servers matter when you need shared or remote access. Pick per deployment, not per hype.",
    size: "1x1",
  },
];

const desktopRows: ComparisonRow[] = [
  {
    feature: "How it finds an element",
    competitor: "Screenshot + OCR, or fixed pixel coordinates (RobotJS-style servers)",
    ours: "Walks the OS accessibility tree and matches by role, name, and structure, the same metadata a screen reader uses",
  },
  {
    feature: "Latency per action",
    competitor: "Hundreds of ms to seconds: capture a frame, run a vision model, reason about pixels",
    ours: "Sub-second structural lookups; no image is captured or sent to a model for a plain click",
  },
  {
    feature: "Stability across resolutions / themes / DPI",
    competitor: "Breaks when the window moves, the theme changes, or DPI scales; coordinates drift",
    ours: "Coordinate-independent: an element is the same node whether the window is at 100% or 200% scale",
  },
  {
    feature: "Internationalization",
    competitor: "OCR misreads non-Latin scripts; pixel templates are language-specific",
    ours: "Reads the accessibility name property directly, language-agnostic by construction",
  },
  {
    feature: "Token cost in an agent loop",
    competitor: "Every step ships an image to the model; tokens and dollars scale with steps",
    ours: "A tree node is a few hundred bytes of text; the agent reasons over structure, not screenshots",
  },
  {
    feature: "Cross-platform reach",
    competitor: "Most desktop MCP servers are Windows-only or macOS-only",
    ours: "One Playwright-shaped API over both UIA (Windows) and AX (macOS), primary focus Windows",
  },
];

const installTerminal = [
  { text: "# The one-liner: add Terminator to whichever MCP client you use", type: "output" as const },
  {
    text: "claude mcp add terminator 'npx -y terminator-mcp-agent@latest'",
    type: "command" as const,
  },
  { text: "Added terminator (stdio) to Claude Code.", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Verify what it actually exposes, do not trust the README", type: "output" as const },
  { text: "claude mcp list", type: "command" as const },
  { text: "  terminator   stdio   31 tools", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "# Same server works in Cursor, VS Code, Windsurf via MCP config", type: "output" as const },
  { text: "npx -y terminator-mcp-agent@latest --add-to-app", type: "command" as const },
  { text: "? Which MCP client? (Cursor, Claude, VS Code, Windsurf, Cline...)", type: "output" as const },
];

const whyAccessibilityCode = `// Why "best" depends on the surface, in one comparison.
// A screenshot/RobotJS server, to click "Save":
//   1. capture the full screen        (a PNG, ~1-3 MB)
//   2. send it to a vision model       (tokens + latency)
//   3. ask "where is the Save button"  (model guesses x,y)
//   4. move mouse to (x, y) and click   (drifts if window moved)

// Terminator, to click "Save":
click_element({
  selector: 'role:Button name:"Save"'   // structural, from the AX/UIA tree
})
//   1. query the accessibility tree    (text, ~hundreds of bytes)
//   2. match role + name                (deterministic)
//   3. invoke the element               (no coordinates, no image)
//
// Same task. One ships an image every step. The other never does.`;

const faqs = [
  {
    q: "What is the best MCP server?",
    a: "There is no single best MCP server, and any list that gives you one without asking what you are automating is sorting by popularity, not fit. MCP servers are tools, and the best tool depends on the job. For repository work the GitHub server is the standard first install. For anything in a web browser, Microsoft's Playwright server is the clear winner. For team knowledge, the Notion or Slack servers. For structured data, a SQL or database server. For driving native desktop applications beyond the browser, an accessibility-tree server like Terminator. The honest answer to 'what is the best MCP server' is 'best for which of those jobs', and most effective agent setups combine three to eight servers across categories rather than betting on one.",
  },
  {
    q: "How many MCP servers should I actually install?",
    a: "Three to eight is the range every serious roundup converges on. Start with the two or three servers that cover your primary workflow, then add more only when you hit a concrete need. Installing thirty servers does not make your agent more capable; it inflates the tool list the model has to reason over, adds startup latency as each server spawns, and increases the surface for a tool-name collision or a misfire. Coverage of the right categories beats raw count.",
  },
  {
    q: "Why is Playwright the best MCP server for the browser but not for the desktop?",
    a: "Playwright drives a browser through the DOM and the Chrome DevTools Protocol. Inside a web page that is exactly the right abstraction: every element has a stable selector, the page exposes its own structure, and Playwright reads it directly. But a native Windows or macOS application has no DOM. There is no document.querySelector for a Win32 dialog or a macOS toolbar. Once your task leaves the browser, Playwright has nothing to grab. That is not a flaw in Playwright; it is the boundary of its surface. The desktop needs a different structural source, which is the operating system's accessibility API.",
  },
  {
    q: "What makes an accessibility-tree MCP server better than a screenshot or RobotJS one for native apps?",
    a: "Four concrete things. Latency: a structural lookup in the accessibility tree is sub-second and ships no image, while a screenshot server captures a frame and runs it through a vision model on every step. Stability: accessibility nodes are coordinate-independent, so they survive the window moving, the theme changing, or DPI scaling, whereas pixel coordinates drift the moment any of that happens. Internationalization: the accessibility name property is read directly regardless of language, while OCR misreads non-Latin scripts and pixel templates are language-specific. Token cost: a tree node is a few hundred bytes of text the agent reasons over, against an image sent to the model every action. For agent loops that run hundreds of steps, those differences compound into the gap between a demo and something you ship.",
  },
  {
    q: "When should I NOT use Terminator?",
    a: "When your automation lives entirely in a web browser, use Playwright instead, it is the right tool and we will say so plainly. When you only need to query a database, use a SQL server. When the answer is already written in Notion or Slack, use those. Terminator is a developer framework for building desktop automation that drives real native apps through accessibility APIs; it is not a hosted RPA platform with bot orchestration and audit logs, and it is not a browser tool. If your job is the browser or a known SaaS API, a category-specific server is the better pick. Terminator earns its place specifically when the work is on the OS, outside the browser, across native apps.",
  },
  {
    q: "Is Terminator the best MCP server for desktop automation?",
    a: "For cross-platform native desktop control via accessibility APIs, it is the strongest open-source option we know of, and it is honest about its boundary. It exposes 31 tools over MCP, drives both Windows (UIA) and macOS (AX) through one Playwright-shaped API, uses the accessibility tree rather than OCR or pixel matching, and is MIT-licensed with the full source at github.com/mediar-ai/terminator. Windows-only servers like Windows-MCP are capable on Windows alone; screenshot and RobotJS servers work anywhere but pay the vision-model tax on every action. Terminator's bet is that structural access plus cross-platform reach is the right tradeoff for production desktop agents. Read the source and the tool list and judge for your own workload.",
  },
  {
    q: "How do I verify what tools an MCP server really exposes before trusting a 'best of' list?",
    a: "Run the MCP Inspector against it: npx @modelcontextprotocol/inspector npx terminator-mcp-agent@latest opens a UI that connects over stdio and shows the live tools/list response, the authoritative list of what the server can do. A README or a listicle can be stale or aspirational; the JSON-RPC tools/list reply is the ground truth the client and the model actually see. Do this for any server before you wire it into an agent, especially when a roundup calls it 'the best'.",
  },
  {
    q: "Can I combine Terminator with Playwright and GitHub in the same agent?",
    a: "Yes, and that is the intended pattern. MCP is composable: a single client can connect to multiple servers at once, and the model picks the right tool per step. A realistic stack might run the GitHub server for repo context, Playwright for any web step, and Terminator for the native desktop steps, all listed in the same client config. Because each server speaks the same protocol, they coexist without special integration; the agent sees one merged tool list and dispatches across all three.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "MCP server list, the one on your disk",
    href: "/t/mcp-server-list",
    excerpt:
      "Your MCP client keeps its server list as a JSON file at a client-specific path. The 12-path map across Cursor, Claude, VS Code, Windsurf, and more.",
    tag: "Companion",
  },
  {
    title: "Playwright MCP server vs the desktop",
    href: "/t/playwright-mcp-server",
    excerpt:
      "Where Playwright's DOM-based MCP server is the right pick, and the exact line where the browser ends and the native OS begins.",
    tag: "Adjacent",
  },
  {
    title: "MCP servers vs accessibility APIs",
    href: "/alternative/mcp-servers-vs-accessibility-apis",
    excerpt:
      "What the accessibility tree gives an MCP server that a screenshot never can: structure, stability, and language-agnostic element names.",
    tag: "Deep dive",
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
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs),
        }}
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
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MCP
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Category map
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              The best MCP server is the{" "}
              <GradientText variant="teal">wrong question</GradientText>
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Every &quot;best MCP server&quot; list sorts a few hundred servers
              by GitHub stars and hands you a pile. That hides the only thing
              that decides the answer:{" "}
              <span className="font-medium text-zinc-800">
                best for which job
              </span>
              . The GitHub server is the right pick for repos and useless for a
              native Win32 dialog. Playwright owns the browser and has nothing to
              grab once you leave the tab. This page is the honest category map,
              plus a deep look at the one category the listicles skip: driving
              native desktop apps through the accessibility tree, where
              screenshot and RobotJS servers fall over.
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
                "Best MCP server = best per category (repo, browser, knowledge, data, desktop)",
                "3 to 8 servers is the range every serious roundup converges on, not 30",
                "Playwright wins the browser; the OS beyond the browser is the open gap",
                "Terminator: 31 tools, accessibility-tree (UIA + AX), cross-platform, MIT",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#desktop-category"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Jump to the desktop category
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="There is no single best MCP server. There is a best one per job."
            subtitle="Repo, browser, knowledge, data, desktop. Five categories, five right answers."
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "GitHub for repos. Playwright for the browser. Notion/Slack for knowledge.",
              "SQL for data. An accessibility-tree server for native desktop apps.",
              "Most setups run 3 to 8 servers across categories, not one mega-server",
              "The browser is solved. The other 80% of the desktop is the open gap.",
              "Terminator fills the desktop category: structural, fast, cross-platform",
            ]}
          />
        </section>

        {/* The reframe */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            &quot;Best&quot; is a category question, not a leaderboard
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            The MCP ecosystem went from a handful of reference servers to several
            hundred in about a year. The listicles responded by ranking them, and
            a ranking implies a winner. But popularity and fit are different
            axes. The Playwright server has roughly 12K GitHub stars and cannot
            click a button in a native accounting app, because a native app has
            no DOM for it to read. A SQL server is unbeatable at queries and
            cannot open a browser. The star count is real; it just does not
            answer your question.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            So the useful framing is: name the surface you are automating, then
            pick the server built for that surface. Below is the map we would
            give a developer wiring up an agent today, including the honest cases
            where the right answer is not us.
          </p>
        </section>

        {/* Metrics */}
        <section className="max-w-4xl mx-auto px-6 pt-6 pb-10">
          <MetricsRow
            metrics={[
              { value: 5, label: "Categories that cover most real agent jobs" },
              { value: 8, label: "Upper end of servers a good setup runs" },
              { value: 31, label: "Tools Terminator exposes over MCP" },
              { value: 2, label: "Native platforms it drives (Windows + macOS)" },
            ]}
          />
        </section>

        {/* Category comparison table */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The category map
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Five categories cover the large majority of what people actually
            automate with MCP. For each, the server we would reach for first.
            Note the last row: it is the one most &quot;best MCP server&quot;
            roundups omit entirely, because the desktop beyond the browser is
            harder to demo than a GitHub PR.
          </p>
          <ComparisonTable
            productName="Best pick for the job"
            competitorName="Category"
            rows={categoryRows}
          />
        </section>

        {/* Marquee: server names */}
        <section className="max-w-5xl mx-auto px-6 pb-4 pt-2">
          <p className="text-center text-xs uppercase tracking-wider text-zinc-500 mb-4">
            Servers worth knowing, by category
          </p>
          <Marquee pauseOnHover fade speed={40}>
            {[
              "GitHub",
              "Playwright",
              "Notion",
              "Slack",
              "SQL / Postgres",
              "Brave Search",
              "Filesystem",
              "Windows-MCP",
              "Terminator (desktop)",
            ].map((name) => (
              <span
                key={name}
                className="mx-3 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </section>

        {/* Bento: how to actually choose */}
        <section className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-3">
            How to choose, in six rules
          </h2>
          <p className="text-zinc-600 mb-8 max-w-3xl leading-relaxed">
            The advice that survives contact with a real agent build, distilled
            from the roundups and from running these servers ourselves.
          </p>
          <BentoGrid cards={categoryBento} />
        </section>

        {/* The desktop category — deep dive */}
        <section
          id="desktop-category"
          className="max-w-4xl mx-auto px-6 py-12 scroll-mt-16 bg-white/40 border-y border-zinc-200/60"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            The category nobody covers:{" "}
            <GradientText variant="teal">native desktop apps</GradientText>
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Browser automation is a solved category, Playwright owns it. The
            unsolved one is everything else on your machine: legacy
            line-of-business software, native installers, desktop accounting and
            ERP tools, the 80% of work that never opens a tab. The MCP servers
            that target it split into two approaches, and the difference between
            them is the difference between a demo and production.
          </p>

          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            Approach one is to take a screenshot and reason about pixels (the
            RobotJS-and-vision-model servers, and screenshot modes generally).
            Approach two is to read the operating system&apos;s accessibility
            tree, the same structured metadata a screen reader uses, and address
            elements by role and name. Terminator takes the second approach.
            Here is the same click, both ways:
          </p>

          <AnimatedCodeBlock
            code={whyAccessibilityCode}
            language="javascript"
            filename="screenshot vs accessibility tree, to click one button"
          />

          <p className="text-zinc-600 mt-6 mb-6 max-w-3xl leading-relaxed">
            The structural approach is not always available, some apps expose a
            poor accessibility tree, and for those Terminator keeps a
            vision-based escape hatch. But when the tree is good, which is most
            modern native UI, it is faster, cheaper, and far more stable. The
            table below is why.
          </p>

          <ComparisonTable
            productName="Accessibility tree (Terminator)"
            competitorName="Screenshot / RobotJS server"
            rows={desktopRows}
          />
        </section>

        {/* Proof banner */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <ProofBanner
            quote={
              "The API is intentionally shaped like Playwright, but it targets the whole OS instead of just the browser. It drives apps through native accessibility APIs (UIA on Windows, AX on macOS) rather than OCR or pixel matching, so element lookups are structural and fast."
            }
            source="github.com/mediar-ai/terminator"
            metric="31 tools"
          />
        </section>

        {/* Install / verify terminal */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Trying the desktop pick, and verifying it
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            One line adds Terminator to Claude Code; the same server works in
            Cursor, VS Code, and Windsurf through their MCP config. And the rule
            from the six applies here too: do not trust this page&apos;s claim of
            31 tools, list them yourself.
          </p>
          <TerminalOutput
            title="claude mcp add terminator + verify"
            lines={installTerminal}
          />
        </section>

        {/* Two anchor numbers */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8">
            <h3 className="text-xl font-semibold text-zinc-800 mb-6">
              Two numbers that frame the choice
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlowCard>
                <div className="p-6">
                  <div className="text-5xl font-mono font-bold text-orange-600">
                    <NumberTicker value={8} />
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    The upper end of how many MCP servers a good agent setup
                    runs. More is prompt bloat and latency, not capability.
                  </div>
                </div>
              </GlowCard>
              <GlowCard>
                <div className="p-6">
                  <div className="text-5xl font-mono font-bold text-orange-600">
                    <NumberTicker value={31} />
                  </div>
                  <div className="mt-2 text-sm text-zinc-600">
                    Tools Terminator exposes for the desktop category, driving
                    native Windows and macOS apps via the accessibility tree.
                  </div>
                </div>
              </GlowCard>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <FaqSection
            items={faqs}
            heading="Best MCP server, answered honestly"
          />
        </section>

        {/* Related */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Where the category lines get sharp"
            posts={relatedPosts}
          />
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-12">
          <InlineCta
            heading="Filling the desktop category in your stack?"
            body="Terminator is the open-source, MIT-licensed MCP server for driving native Windows and macOS apps through the accessibility tree. One line to install, 31 tools, Playwright-shaped. Read the source and judge it for your workload."
            linkText="Install from GitHub"
            href="https://github.com/mediar-ai/terminator"
          />
        </section>
      </article>
    </div>
  );
}
