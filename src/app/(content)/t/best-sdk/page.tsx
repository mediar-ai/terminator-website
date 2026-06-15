import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  StepTimeline,
  CodeComparison,
  AnimatedChecklist,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/best-sdk";
const PUBLISHED = "2026-06-15";
const TITLE =
  "What is the best SDK? It depends on the layer you are automating";
const DESCRIPTION =
  "There is no single best SDK. The right one depends on which layer you control: an API SDK for a service, Playwright for the browser, and an accessibility-driven framework like Terminator for the whole desktop. Here is how to choose, plus what actually separates a reliable SDK from a brittle one.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Most guides on this topic are lists of AI, mobile, or payment SDKs. None of them cover the layer where automation breaks the most: the desktop. Here is a layer-by-layer framework for picking the right SDK.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is the best SDK? Choose by the layer you automate",
    description:
      "API SDK for a service, Playwright for the browser, accessibility-driven framework for the whole OS. A practical decision guide.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Best SDK" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Best SDK", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the best SDK overall?",
    a: "There is no single best SDK, and any guide that hands you one ranked list is ignoring the question that actually matters: which layer are you working at? If you are calling a remote service, the best SDK is the official one that vendor ships (Stripe for payments, the Vercel AI SDK for model calls). If you are driving a web page, Playwright or the official browser SDK is the right tool. If you need to drive real desktop applications across the whole operating system, none of those apply, and the best SDK is one built on the OS accessibility layer, like Terminator. Pick by layer first, then by language and ergonomics.",
  },
  {
    q: "What makes one SDK better than another at the same layer?",
    a: "Three things, in order. First, determinism: does the same call produce the same result on a different machine, locale, or screen resolution? Second, a typed surface with sensible defaults so the common path is short and the dangerous path is explicit. Third, honest failure modes, meaning timeouts, retries, and errors you can catch rather than silent no-ops. A good SDK makes the reliable thing the easy thing. Terminator, for example, refuses to give you a default timeout on element lookups so you never accidentally write a flaky script that passes on a fast machine and fails on a slow one.",
  },
  {
    q: "Is Playwright the best SDK for desktop automation?",
    a: "No. Playwright is excellent and is the right answer for browser automation, but it lives inside the browser. The moment your workflow touches a native dialog, a file picker, Excel, Outlook, a legacy WPF or SAP window, or an OS-level permission prompt, Playwright cannot see it. For that you need an SDK that talks to the operating system accessibility tree. Terminator was deliberately given a Playwright-shaped API (locators, selectors, click, type) so the muscle memory transfers, but its target is the whole OS rather than a single tab.",
  },
  {
    q: "Why do accessibility-based SDKs beat screenshot or coordinate-based automation?",
    a: "Pixel and coordinate automation breaks the instant anything moves: a different resolution, a theme change, a localized label, a window that opened 12 pixels to the left. An accessibility-driven SDK queries the structured UI tree the OS already maintains for screen readers, so it matches elements by role and name rather than by where they happen to be drawn. That is structural, fast, and survives layout changes. It is the same reason Playwright matches DOM nodes instead of screenshotting the browser.",
  },
  {
    q: "What languages does Terminator's SDK support?",
    a: "Terminator ships a Rust core (terminator-rs on crates.io) with native bindings for Node.js/TypeScript (@mediar-ai/terminator via NAPI-RS) and Python 3.10+ (terminator-py via PyO3). There is also a TypeScript workflow SDK (@mediar-ai/workflow) for deterministic step-based automation, and an MCP server (terminator-mcp-agent) that exposes desktop control to AI assistants like Claude Code, Cursor, VS Code, and Windsurf. It is MIT licensed.",
  },
  {
    q: "How do I add Terminator's SDK to an AI coding assistant?",
    a: "One command: claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. That registers the MCP server, after which the assistant can locate and act on real UI elements in any desktop app, not just write code. The same MCP config works for Cursor, VS Code, and Windsurf. For direct programmatic use without an AI assistant, install the Rust crate, the npm package, or the Python package instead.",
  },
];

const articleLd = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const brittleCode = `# coordinate / pixel automation
import pyautogui

# find the Save button by where it was drawn
pyautogui.click(842, 511)
pyautogui.typewrite("invoice.pdf")
pyautogui.press("enter")

# breaks on: different resolution,
# a localized "Guardar" label, a theme
# change, the window opening 12px left,
# a slow disk that delays the dialog`;

const robustCode = `// accessibility-tree automation
const { Desktop } = require("@mediar-ai/terminator");
const desktop = new Desktop();

// match by role + name, scoped to a process
const save = desktop.locator(
  "process:acme >> role:Button && name:Save"
);
// timeout in ms is REQUIRED, no silent default
await (await save.first(5000)).invoke();

// survives moved windows, themes, locales,
// and slow machines because it queries the
// structured UI tree, not screen pixels`;

const decisionSteps = [
  {
    title: "1. Is the target a remote service or an API?",
    description:
      "If you are talking to a server (payments, model inference, storage, auth), the best SDK is the official one that vendor publishes. It tracks their API, handles auth and pagination, and is the path they support. Reach for Stripe's SDK, the Vercel AI SDK, the cloud provider's SDK. Stop here.",
  },
  {
    title: "2. Does the whole job live inside a web page?",
    description:
      "If every element you touch is in the DOM of a browser tab, Playwright (or the official browser automation SDK) is the right answer. It is mature, fast, and gives you network interception and tracing. Stop here unless your workflow leaves the tab.",
  },
  {
    title: "3. Does it touch native apps, dialogs, or the OS?",
    description:
      "File pickers, Excel, Outlook, SAP, internal WPF tools, OS permission prompts, switching between apps: none of these are in the DOM. This is where browser SDKs and pixel scripts fall apart. The best SDK here is one built on the OS accessibility layer.",
  },
  {
    title: "4. Pick by language, then by determinism guarantees.",
    description:
      "Once you are at the right layer, choose the binding for your stack (Rust, TypeScript, Python) and then judge on determinism: stable selectors, explicit timeouts, catchable errors. That last filter is what keeps a desktop automation from becoming a flaky script.",
  },
];

const goodSdkTraits = {
  title: "What separates a reliable SDK from a script that passes on your machine",
  items: [
    { text: "Same call, same result across machines, locales, and resolutions", checked: true },
    { text: "Matches elements by what they are (role + name), not where they are drawn", checked: true },
    { text: "Requires explicit timeouts so flakiness is a choice, not an accident", checked: true },
    { text: "Errors you can catch and retry, not silent no-ops that pass green", checked: true },
    { text: "A typed surface where the common path is short and the risky path is explicit", checked: true },
    { text: "Coordinate clicks and screenshot matching as a last resort, never the default", checked: false },
  ],
};

const relatedPosts = [
  {
    title: "Why accessibility APIs beat OCR and pixel matching",
    href: "/t/why-accessibility-apis-beat-ocr-and-pixel-matching",
    excerpt:
      "The latency, stability, and localization case for querying the UI tree instead of screenshotting the screen.",
    tag: "Deep dive",
  },
  {
    title: "Terminator software, the desktop automation framework",
    href: "/t/terminator-software",
    excerpt:
      "What Terminator is, the package matrix, and how a Playwright-shaped API targets the whole OS.",
    tag: "Overview",
  },
  {
    title: "Cross-platform desktop automation you can verify",
    href: "/t/cross-platform-desktop-automation-verify",
    excerpt:
      "How the same selectors run on Windows UIA and macOS AX, and where the abstraction leaks.",
    tag: "Guide",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema(faqs)) }}
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            What is the best SDK? It depends on the layer you are automating
          </h1>
          <div className="mt-4">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="9 min read"
            />
          </div>
        </header>

        {/* Direct answer, in the first 30% of the page */}
        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-700">
            Direct answer (verified 2026-06-15)
          </p>
          <p className="mt-3 text-lg leading-relaxed text-zinc-900">
            There is no single best SDK. The right one depends on which layer you
            control. Use the official <strong>API SDK</strong> for a remote
            service, <strong>Playwright</strong> for the browser, and an
            accessibility-driven framework like{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="font-medium text-orange-600 underline underline-offset-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terminator
            </a>{" "}
            for the whole desktop. Pick the layer first; the language and the
            brand name come second.
          </p>
        </div>

        <div className="mt-10 space-y-5 text-[17px] leading-relaxed text-zinc-700">
          <p>
            Search this topic and you get the same shape of answer every time: a
            numbered list of AI SDKs, then a list of mobile SDKs, then a list of
            payment SDKs. They are all correct and all useless, because &quot;best
            SDK&quot; is not a single category. An SDK is just a typed wrapper
            around some surface you do not own. The question worth answering is{" "}
            <em>which surface</em>, because the surface decides everything else.
          </p>
          <p>
            Almost none of the popular guides cover the surface where automation
            breaks the most often: the desktop. Once your workflow leaves the
            browser tab and has to click a native file dialog, read a cell in
            Excel, or drive a legacy line-of-business app, the entire question
            changes, and most &quot;best SDK&quot; advice goes quiet. So this guide
            does two things: gives you a layer-by-layer way to choose, and then
            digs into the desktop layer that the listicles skip.
          </p>
        </div>

        {/* Layer matrix */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            The best SDK by layer
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-zinc-700">
            Find the row that matches what you are actually touching. The answer
            in the &quot;reach for&quot; column is the best SDK for that job, and the
            &quot;why it fails out of its layer&quot; column is why borrowing the wrong
            one hurts.
          </p>
          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-zinc-50 text-zinc-900">
                  <th className="px-4 py-3 font-semibold">What you are automating</th>
                  <th className="px-4 py-3 font-semibold">Reach for</th>
                  <th className="px-4 py-3 font-semibold">Why it fails outside its layer</th>
                </tr>
              </thead>
              <tbody className="text-zinc-700">
                <tr className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">A remote service / API</td>
                  <td className="px-4 py-3">The vendor&apos;s official SDK (Stripe, Vercel AI SDK)</td>
                  <td className="px-4 py-3">Tied to one provider&apos;s endpoints; useless for anything off the wire</td>
                </tr>
                <tr className="border-t border-zinc-200 bg-zinc-50/40">
                  <td className="px-4 py-3 font-medium text-zinc-900">A web page in a browser</td>
                  <td className="px-4 py-3">Playwright or the official browser SDK</td>
                  <td className="px-4 py-3">Blind to anything outside the DOM: dialogs, native apps, the OS</td>
                </tr>
                <tr className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">Native desktop apps + the OS</td>
                  <td className="px-4 py-3">An accessibility-tree framework (Terminator)</td>
                  <td className="px-4 py-3">Overkill for a pure-web or pure-API job; use the narrower tool there</td>
                </tr>
                <tr className="border-t border-zinc-200 bg-zinc-50/40">
                  <td className="px-4 py-3 font-medium text-zinc-900">Last-resort pixels / no a11y tree</td>
                  <td className="px-4 py-3">OCR + vision as a supplement, never the default</td>
                  <td className="px-4 py-3">Breaks on resolution, theme, and locale changes; slow and non-deterministic</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Decision flow */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Choose the best SDK in four questions
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-zinc-700">
            Walk top to bottom and stop at the first question that fits. You will
            land at the right layer before you ever compare language bindings.
          </p>
          <div className="mt-6">
            <StepTimeline steps={decisionSteps} />
          </div>
        </section>

        {/* Anchor section: the desktop layer + selector grammar */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            The desktop layer, where &quot;best&quot; gets decided
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-zinc-700">
            At the desktop layer, the difference between the best SDK and a script
            that only works on your machine comes down to one design choice: how do
            you find an element? The brittle answer is by screen coordinates. The
            durable answer is by what the element <em>is</em>. Here is the same Save
            action written both ways.
          </p>
          <div className="mt-6">
            <CodeComparison
              title="Coordinate clicks vs accessibility selectors"
              leftLabel="Brittle: pixel coordinates"
              rightLabel="Durable: a11y selectors"
              leftCode={brittleCode}
              rightCode={robustCode}
              leftLines={brittleCode.split("\n").length}
              rightLines={robustCode.split("\n").length}
            />
          </div>

          <p className="mt-8 text-[17px] leading-relaxed text-zinc-700">
            The durable version on the right is the thing the listicles never show
            you, because it is specific to a real framework. Terminator drives apps
            through the OS accessibility layer (UI Automation on Windows,
            AXUIElement on macOS) and exposes a Playwright-shaped selector grammar
            over it. That grammar is the uncopyable detail, so here it is in full.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6">
            <p className="text-sm font-semibold text-zinc-900">
              Terminator selector grammar (from the framework&apos;s own docs)
            </p>
            <pre className="mt-4 overflow-x-auto rounded-lg bg-zinc-900 p-4 text-[13px] leading-relaxed text-zinc-100">
              <code>{`role:Button            # match by accessibility role
name:Save              # match by accessible name (case-insensitive)
id:submit              # AutomationId
classname:Edit         # UI class name
process:chrome         # scope to a process
nth:0                  # the Nth match (0-based)

# combinators
role:Button && name:Close      # AND
name:Save || name:Submit       # OR
role:Button && !name:Cancel    # NOT
window:Calc >> role:Button >> name:Seven   # descendant
role:Button && name:Submit >> ..           # parent
rightof: / leftof: / above: / below: / near:  # positional`}</code>
            </pre>
            <div className="mt-5 space-y-3 text-[15px] leading-relaxed text-zinc-700">
              <p>
                Two rules in that grammar tell you it was designed by people who
                got burned by flaky automation. First:{" "}
                <strong>never use <code className="rounded bg-zinc-200 px-1 py-0.5 text-[13px]">#id</code> selectors</strong>,
                because raw element IDs are non-deterministic across machines.
                You are pushed toward <code className="rounded bg-zinc-200 px-1 py-0.5 text-[13px]">role + name</code>,
                which is stable. Second:{" "}
                <code className="rounded bg-zinc-200 px-1 py-0.5 text-[13px]">.first()</code> and{" "}
                <code className="rounded bg-zinc-200 px-1 py-0.5 text-[13px]">.all()</code> require an
                explicit timeout in milliseconds, with no silent default. You
                cannot accidentally write a lookup that passes on a fast machine
                and fails on a slow one. The SDK makes the reliable thing the
                only thing.
              </p>
              <p>
                You can verify both rules yourself in the project&apos;s own
                instructions for AI agents at{" "}
                <a
                  href="https://github.com/mediar-ai/terminator"
                  className="font-medium text-orange-600 underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/mediar-ai/terminator
                </a>
                . That is the bar to hold any &quot;best SDK&quot; candidate to.
              </p>
            </div>
          </div>
        </section>

        {/* Traits checklist */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            The test to apply to any SDK
          </h2>
          <p className="mt-3 text-[17px] leading-relaxed text-zinc-700">
            Whatever layer you land at, the same checklist sorts a genuinely good
            SDK from one that demos well and breaks in production. Run any
            candidate against it.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title={goodSdkTraits.title}
              items={goodSdkTraits.items}
            />
          </div>
        </section>

        {/* Install / for AI assistants */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            If the desktop is your layer
          </h2>
          <div className="mt-3 space-y-5 text-[17px] leading-relaxed text-zinc-700">
            <p>
              If your honest answer to question three was yes, Terminator is the
              SDK built for that layer. It ships as a Rust crate
              (<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[15px]">terminator-rs</code>),
              a Node package
              (<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[15px]">@mediar-ai/terminator</code>),
              a Python package
              (<code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[15px]">terminator-py</code>),
              and an MCP server. The fastest way to feel it is to give an AI
              coding assistant OS-level control with one command:
            </p>
            <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-4">
              <code className="block overflow-x-auto text-[14px] text-zinc-100">
                claude mcp add terminator &apos;npx -y terminator-mcp-agent@latest&apos;
              </code>
            </div>
            <p>
              After that, the assistant is no longer limited to writing code in
              the editor. It can locate and act on real UI elements in any app on
              your machine, the same way it would drive a browser, only without
              the tab boundary. The framework is MIT licensed, so there is no
              lock-in to evaluate against.
            </p>
          </div>
        </section>

        <div className="mt-14">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Not sure the desktop is your layer?"
            description="Tell us what you are trying to automate and we will tell you honestly whether Terminator, Playwright, or a vendor SDK is the right tool."
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
          <div className="mt-4">
            <FaqSection items={faqs} />
          </div>
        </section>

        <section className="mt-14">
          <RelatedPostsGrid
            title="Keep reading"
            posts={relatedPosts}
          />
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Pick the right automation layer with us in 15 minutes."
      />
    </article>
  );
}
