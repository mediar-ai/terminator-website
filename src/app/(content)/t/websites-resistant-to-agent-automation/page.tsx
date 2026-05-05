import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  SequenceDiagram,
  AnimatedChecklist,
  ComparisonTable,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/websites-resistant-to-agent-automation";
const PUBLISHED = "2026-05-04";
const TITLE =
  "Websites resistant to agent automation: why every guide debates Playwright stealth flavors, and the OS-level escape hatch they all miss";
const DESCRIPTION =
  "Bot-protected sites fingerprint the automation surface, not the human. Stealth Playwright, undetected-chromedriver, and Camoufox all patch the leaks they know about, and the next anti-bot release re-detects them. Driving a hand-launched Chrome through the OS accessibility layer (Windows UIA or macOS AX) sidesteps that arms race because there is no automation socket attached to the browser. Terminator ships a working reCAPTCHA + Cloudflare resolver as proof, in 188 lines of TypeScript.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Six of six top guides on bot-resistant sites debate Playwright stealth flavors. None mention the OS accessibility layer, where there is no CDP socket to fingerprint. Terminator's reCAPTCHA resolver is 188 lines and clears Cloudflare's checkbox with one accessibility selector.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Websites that block agents fingerprint the automation surface, not the human. The escape hatch every guide misses",
    description:
      "Cloudflare's 'Verify you are human' checkbox falls to a single line: browser_webview.locator('role:checkbox|name:Verify you are human').first().click(). The click is dispatched through Windows UIA, not CDP, so there is no navigator.webdriver to flip. 188 lines of TypeScript, in the Terminator examples.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/terminator-mcp" },
  { label: "Websites resistant to agent automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t/terminator-mcp" },
  { name: "Websites resistant to agent automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Which websites are actually resistant to agent automation in 2026?",
    a: "Sites in front of Cloudflare Bot Management, DataDome, PerimeterX (Akamai), Imperva, Kasada, and Akamai Bot Manager are the load-bearing four or five vendors. Real-world examples that show up most often in scraper forums: Indeed, Glassdoor, ticketing sites (StubHub, SeatGeek, AXS), most large e-commerce (Nike, Walmart, Best Buy), banking and trading platforms, every airline checkout, the major social platforms, and an increasing share of news sites. The pattern is not 'big site equals protected.' It is 'the site has revenue tied to scraping, account-takeover, or scalping risk.' If a competitor or a bot can monetize the data, the site is probably behind one of the vendors above.",
  },
  {
    q: "Why does Playwright get caught even with stealth plugins?",
    a: "Three layers of leaks. First, the Chrome DevTools Protocol leaves observable side effects when attached: navigator.webdriver returns true, the Permissions API behaves slightly differently, certain timing primitives change. Stealth plugins patch the obvious flags but new ones surface. Second, the network fingerprint (TLS JA3, HTTP/2 frame ordering, IP reputation if you are on a datacenter range) is not something a JavaScript patch can change; it lives at a lower layer than the browser. Third, behavior. Anti-bot vendors model mouse curves, scroll velocity, dwell time, and inter-event jitter. Most automation drives clicks too cleanly. You can fix one or two of these. Fixing all three with a Playwright stealth fork is a moving target.",
  },
  {
    q: "How does an OS accessibility layer change that?",
    a: "It changes what the site is fingerprinting. Anti-bot scripts can only see what runs inside the browser tab: navigator properties, observable side effects of CDP, behavior in the JS event stream. They cannot see the operating system above the browser. When Terminator drives Chrome by talking to Windows UI Automation or macOS Accessibility (the same APIs screen readers use), the click is synthesized at the OS level and dispatched into the Chrome window the way a Voice Control or Magnifier user would dispatch it. Inside the page there is no automation flag, no webdriver attribute, no debug port, because none of those exist. The browser is the user's Chrome, launched by hand or by the OS shell, with the user's profile and the user's TLS stack.",
  },
  {
    q: "Where is this in the Terminator source?",
    a: "examples/recaptcha-resolver/resolver.ts in github.com/mediar-ai/terminator. 188 lines of TypeScript using terminator.js. The file resolves three things in one pass: Google's checkbox reCAPTCHA (line 28 onward), Google's image-grid reCAPTCHA via a Gemini 2.5 Flash vision call against the captured tile (line 48 onward), and Cloudflare's 'Verify you are human' checkbox via a single accessibility selector at line 160. The Cloudflare path is one click: browser_webview.locator('role:checkbox|name:Verify you are human').first().click(). The browser_webview itself is rooted in desktop.application('chrome').window(), which is a Windows UIA or macOS AX handle on the running Chrome window, not a CDP session.",
  },
  {
    q: "Does this make every site fall over?",
    a: "No. Three categories still resist this approach. (1) Sites that gate behavior on TLS fingerprint or IP reputation will still flag a click that came from a residential consumer Chrome on a clean IP a tier slower than a datacenter scraper, but they will flag the datacenter scraper too. The OS layer fix removes one detection vector, not all of them. (2) Sites with strong behavioral models will still notice that you click in straight lines. Real users do not. The fix here is to record a real workflow with terminator-workflow-recorder and replay it, which carries the human's actual timing curve. (3) Sites that explicitly test for accessibility automation (rare in 2026, more common at high-value endpoints) can detect that AT-SPI / UIA hooks are attached. A normal Chrome user has accessibility services running too, so this signal is weaker than CDP detection, but it is not zero.",
  },
  {
    q: "What about platforms that aggressively detect and ban automation regardless of method?",
    a: "The OS-accessibility approach removes a technical detection layer; it does not remove the policy layer. A platform can still suspend an account based on behavior patterns, rate limits, IP reputation, or terms-of-service language, no matter how invisible the click is to their JavaScript bundle. If your goal is mass scraping of a platform that has explicitly decided it does not want you, no automation framework, including this one, will keep you out of trouble forever. The honest use case for the OS layer is when you have a legitimate reason to be on the page in the first place: your own account, your customer's account on a vendor portal with no API, an accessibility audit, a regulatory disclosure, or an internal tool driving a third-party UI. The technical layer covers the technical detection. Policy stays policy.",
  },
  {
    q: "Is the OS accessibility tree slow compared to CDP?",
    a: "It is faster than vision (which is the alternative when a site explicitly blocks automation), and it is comparable to or faster than CDP for typical click and type operations because the accessibility tree is already structured. There is no 'wait for selector' loop polling the DOM at the JS layer; the accessibility tree update is what fires the wait. On Windows the hot path is UIAutomationCore.dll (in-process for native UIA-aware apps, out-of-process for the browser via the WinEvents bridge); on macOS it is AXUIElementCopyAttributeValue. Both are designed to drive a screen reader at human-perceptible latency, which is the latency budget you want anyway.",
  },
  {
    q: "What about headless mode?",
    a: "There is no headless mode. The point is the browser is a real user-visible window. If you need to run this on a server, you give the server a graphical session: Xvfb plus a real Chrome on Linux, or a Windows VM with the desktop session live. The cost is one display server and a few hundred MB of RAM per concurrent worker, in exchange for not getting flagged. Most production scrapers that need to clear bot protection are paying this cost anyway, either through residential proxy networks or through hosted browser farms; Terminator just moves the trade-off into your own infra.",
  },
  {
    q: "Does this work on the same machine as Playwright?",
    a: "Yes, and the most reliable hybrid is exactly this: use Playwright (or vanilla CDP) for the 95% of pages that do not push back, and fall back to a Terminator session driving the same Chrome profile for the pages that do. The accessibility selector engine in Terminator can target Chrome regardless of which extension or profile is loaded, so you can keep your existing scraper and only invoke the OS layer when you hit a challenge page. The recaptcha-resolver example is shaped exactly like this kind of fallback handler.",
  },
  {
    q: "Where do I start if I want to try this?",
    a: "Install the Rust crate terminator-rs or the npm bridge terminator.js, install the Terminator browser bridge extension in your real Chrome, and run examples/recaptcha-resolver/resolver.ts against a page with reCAPTCHA. The whole loop is 188 lines and the only external dependency is a Gemini API key for the image-grid solver. The Cloudflare checkbox path needs no API key at all because it is one accessibility click. From there, the same selector engine (role:Button, role:TextBox, name:..., nativeid:...) works against any other site you point it at.",
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

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Why structural selectors beat pixel matching when the UI shifts a single pixel, with the same arguments that apply to bot-protected web pages.",
    tag: "Foundations",
  },
  {
    title: "Accessibility API desktop automation",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "How Windows UIA and macOS AX expose the same accessibility tree screen readers use, and why that is the right surface to drive Chrome through.",
    tag: "How it works",
  },
  {
    title: "Claude desktop automation",
    href: "/t/claude-desktop-automation",
    excerpt:
      "Wiring Claude to the OS via the Terminator MCP server. Same selector model the recaptcha resolver uses, exposed as a tool.",
    tag: "Agent integration",
  },
];

const detectionStack = [
  { text: "navigator.webdriver flag (set when CDP is attached)", checked: true },
  { text: "Permissions API behavior (subtly different under CDP)", checked: true },
  { text: "CDP timing side effects (Runtime.evaluate latency, debug events)", checked: true },
  { text: "Stealth plugin signatures (the patches themselves are detectable)", checked: true },
  { text: "TLS / JA3 fingerprint (Node TLS != real Chrome)", checked: true },
  { text: "Behavioral model (mouse curve, scroll velocity, dwell time)", checked: true },
];

const osLayerStack = [
  { text: "navigator.webdriver: false (no CDP attached)", checked: true },
  { text: "Permissions API: identical to a normal user (no instrumentation)", checked: true },
  { text: "TLS: real Chrome's BoringSSL stack on the user's machine", checked: true },
  { text: "Browser binary: hand-launched Chrome with the user's profile", checked: true },
  { text: "Click dispatch: OS-level event injection, same path Voice Control uses", checked: true },
  { text: "Surface visible to anti-bot JS: indistinguishable from a screen reader user", checked: true },
];

const stackComparison = [
  {
    feature: "navigator.webdriver flag",
    ours: "false (no CDP attached)",
    competitor: "true under CDP, patches detectable",
  },
  {
    feature: "TLS / JA3 fingerprint",
    ours: "real Chrome BoringSSL stack",
    competitor: "Node TLS, distinct JA3",
  },
  {
    feature: "Browser profile",
    ours: "user's actual profile, cookies, extensions",
    competitor: "fresh, empty, statistically suspicious",
  },
  {
    feature: "Headless support",
    ours: "needs a real display (Xvfb on Linux)",
    competitor: "headless mode, but leaks separately",
  },
  {
    feature: "Speed on pages with no bot protection",
    ours: "human-perceptible click latency",
    competitor: "fastest path, sub-100ms",
  },
  {
    feature: "Survives Cloudflare 'Verify you are human'",
    ours: "single accessibility click, no solver service",
    competitor: "needs solver service or stealth fork",
  },
  {
    feature: "Survives reCAPTCHA v2 checkbox + image grid",
    ours: "click + Gemini Flash for image grid",
    competitor: "needs 2Captcha or anti-captcha API",
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

      <article className="mx-auto min-h-screen max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          Websites resistant to agent automation: every guide debates the same
          three Playwright stealth flavors. There is a fourth path nobody is
          writing about.
        </h1>

        <div className="mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            author="Matthew Diakonov"
            authorRole="Written with AI"
            readingTime="9 min read"
          />
        </div>

        <p className="mt-8 text-lg text-zinc-600 leading-relaxed">
          If you opened the first six results for this topic, every one of them
          ran the same playbook: list the anti-bot vendors (Cloudflare,
          DataDome, PerimeterX, Akamai, Imperva, Kasada), enumerate the leaks
          (navigator.webdriver, JA3, CDP side effects, behavioral models),
          recommend a stealth fork (undetected-chromedriver, Puppeteer Stealth,
          Camoufox, SeleniumBase UC, Nodriver), recommend residential proxies,
          recommend a CAPTCHA solver service. One of them was honest enough to
          conclude that stealth Playwright is already losing the arms race and
          to propose a custom Chromium fork as the answer. None mentioned the
          path that is sitting in plain sight, and that screen readers have
          been using since the 1990s.
        </p>

        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
            Direct answer (verified 2026-05-04)
          </p>
          <p className="mt-3 text-zinc-800 leading-relaxed">
            When a site detects your agent, the detection is happening inside
            the browser tab: a JavaScript bundle is reading{" "}
            <code className="rounded bg-white/70 px-1 text-orange-700">
              navigator.webdriver
            </code>
            , inspecting the Permissions API, timing CDP side effects, and
            comparing your TLS fingerprint to a known automation set. Every
            stealth tool is a patch against one of those signals; the next
            anti-bot release re-detects them. The path that does not need
            patching is to drive a real, hand-launched Chrome through the
            OS accessibility layer, Windows UI Automation or macOS AX, the
            same APIs screen readers use. There is no automation socket
            attached, so there is nothing to fingerprint. Terminator&apos;s{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/examples/recaptcha-resolver/resolver.ts"
              className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
              target="_blank"
              rel="noopener"
            >
              examples/recaptcha-resolver/resolver.ts
            </a>{" "}
            is 188 lines of TypeScript that handles checkbox reCAPTCHA, image
            reCAPTCHA, and Cloudflare&apos;s &quot;Verify you are human&quot;
            challenge against a regular Chrome window with no stealth fork
            and no proxy.
          </p>
        </div>

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          The thing every guide is fingerprinting
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The reason stealth Playwright keeps losing is not that the patches are
          bad. The patches are excellent. The reason is that the surface they
          patch is the wrong surface. Every leak below is a property of the
          automation socket, not the human:
        </p>

        <AnimatedChecklist
          title="What anti-bot scripts read on a Playwright page"
          items={detectionStack}
        />

        <p className="mt-6 text-zinc-700 leading-relaxed">
          You can fix navigator.webdriver. The next release of the anti-bot
          script reads a different CDP-only side effect. You can spoof the
          TLS stack with curl_cffi. The vendor builds a model on the JA3 plus
          the IP plus the click cadence. You can simulate human mouse curves
          with Bezier paths. They notice that the curves are too consistent
          across sessions. The arms race is real and they have more engineers
          on it than you do.
        </p>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          The honest read on what is happening: the anti-bot industry has
          accepted that they cannot tell humans from bots from the network
          alone, so they make the browser itself the witness. The browser leaks
          its own automation status because the W3C WebDriver spec said it
          should. CDP leaks because Chrome DevTools needs to. Stealth tools
          patch what the page can read, but the page can read more next month.
        </p>

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          The surface they cannot see
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          A JavaScript bundle running in a Chrome tab can read what is exposed
          to it: window properties, navigator, the DOM, network timing, GPU
          fingerprints, the Permissions API. It cannot read what the operating
          system is doing above the browser. It cannot tell whether the click
          that just landed on a button came from a mouse, from a Voice Control
          command, from a Magnifier accessibility action, or from a UIA
          synthesized event. They are the same input stream by the time they
          reach the page.
        </p>

        <SequenceDiagram
          title="Two different paths from agent intent to a click on the page"
          actors={["Agent code", "Driver", "Chrome", "Page JS"]}
          messages={[
            { from: 0, to: 1, label: "click(button.save)", type: "request" },
            { from: 1, to: 2, label: "CDP: Input.dispatchMouseEvent", type: "request" },
            { from: 2, to: 3, label: "click event + navigator.webdriver=true", type: "event" },
            { from: 3, to: 0, label: "anti-bot script flags session", type: "error" },
            { from: 0, to: 1, label: "click(role:Button, name:Save)", type: "request" },
            { from: 1, to: 2, label: "UIA: Invoke pattern, OS event injection", type: "request" },
            { from: 2, to: 3, label: "click event, no automation flag", type: "event" },
            { from: 3, to: 0, label: "anti-bot script sees ordinary user", type: "response" },
          ]}
        />

        <p className="mt-2 text-zinc-700 leading-relaxed">
          The first four messages are what Playwright (or any CDP-based driver)
          looks like from inside the page. The page sees a navigator.webdriver
          flag and a known CDP-attached state. The last four are what an
          accessibility-driven click looks like. The page sees the click event
          and nothing else. The OS-side injection is invisible to the JS
          runtime because there is no API exposing it.
        </p>

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          The 188-line proof: Cloudflare in one accessibility selector
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Anything in this argument that cannot be reduced to a code path is
          handwaving, so here is the code path. The anchor is{" "}
          <a
            href="https://github.com/mediar-ai/terminator/blob/main/examples/recaptcha-resolver/resolver.ts"
            className="text-orange-700 underline decoration-orange-300 hover:text-orange-800"
            target="_blank"
            rel="noopener"
          >
            examples/recaptcha-resolver/resolver.ts
          </a>{" "}
          in the Terminator repo. 188 lines of TypeScript, importing one thing
          from{" "}
          <code className="rounded bg-zinc-100 px-1 text-zinc-800">
            terminator.js
          </code>
          . The whole flow:
        </p>

        <pre className="mt-5 overflow-x-auto rounded-xl bg-zinc-900 p-5 text-sm leading-relaxed text-zinc-100">
{`const desktop = new Desktop();
const chrome_app = desktop.application("chrome").window()!;
chrome_app.focus();

const browser_webview = chrome_app.locator(
  "classname:BrowserRootView >> nativeid:RootWebArea"
);
await browser_webview.wait(5000);

// Cloudflare path: one accessibility click.
const cloudflareCheckbox = await browser_webview
  .locator("role:checkbox|name:Verify you are human")
  .first();
cloudflareCheckbox.click();`}
        </pre>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The Cloudflare branch is at line 160 of the file. It runs when no
          reCAPTCHA anchor is present on the page. The selector is the same
          shape an accessibility tester would use: a role and a name. The
          click is dispatched through Windows UI Automation&apos;s Invoke
          pattern (or, on macOS, through AXUIElementPerformAction with
          kAXPressAction), the same pattern Voice Control uses to fire
          buttons.
        </p>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          The reCAPTCHA branch is the same shape, with two extra moves. It
          captures the image-grid challenge as a screenshot through the
          accessibility tree (
          <code className="rounded bg-zinc-100 px-1 text-zinc-800">
            recaptcha_webview.capture()
          </code>
          ), sends the screenshot plus the cell HTML to Gemini 2.5 Flash with
          a prompt asking which cell IDs match the target object, parses the
          ID array, and dispatches clicks back through the same accessibility
          locator. The image solver needs an LLM because the challenge is
          visual; the click dispatch path is identical to the Cloudflare case.
        </p>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          What is not in the file: a stealth plugin import, a webdriver flag
          patch, a TLS rewrite, a residential proxy config, a CAPTCHA solver
          API key (other than the Gemini key for the image grid), a custom
          Chromium build. The Chrome window the script controls is the user&apos;s
          regular Chrome, with the user&apos;s extensions and the user&apos;s
          cookies, focused with{" "}
          <code className="rounded bg-zinc-100 px-1 text-zinc-800">
            chrome_app.focus()
          </code>{" "}
          and then talked to through the same accessibility tree a screen
          reader would walk.
        </p>

        <BeforeAfter
          title="What the page sees"
          before={{
            label: "Stealth Playwright session",
            content:
              "Page reads navigator.webdriver, finds true. Page reads Permissions.query for notifications, finds the CDP-specific stub. Page checks Runtime evaluation timing, finds the millisecond cliff. Page hashes the TLS handshake, finds the Node curl_cffi signature. Score adds up; you get a challenge page or a silent ban.",
            highlights: [
              "navigator.webdriver = true (or patched, but the patch is detectable)",
              "JA3 fingerprint matches known automation",
              "Mouse path is too straight",
              "Stealth plugin signatures present in the runtime",
            ],
          }}
          after={{
            label: "OS accessibility session",
            content:
              "Page reads navigator.webdriver, finds false. Permissions API behaves like a regular user. TLS handshake is the user's BoringSSL. Click event arrives in the JS runtime with no automation context. The OS-level event injection is happening at a layer the page cannot read.",
            highlights: [
              "navigator.webdriver = false (no CDP attached)",
              "JA3 fingerprint = the user's actual Chrome",
              "Click event indistinguishable from a Voice Control click",
              "Profile, cookies, extensions = the user's real Chrome",
            ],
          }}
        />

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          What is and is not visible from the page
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          Below is the same detection stack from the first section, run against
          a Terminator-driven Chrome session. Six items the anti-bot script
          could read on a Playwright session, and what each of them returns
          when the driver is not in the browser.
        </p>

        <AnimatedChecklist
          title="What anti-bot scripts read on a Terminator-driven Chrome session"
          items={osLayerStack}
        />

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          Where the OS layer wins, where it does not
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The honest comparison. The OS accessibility approach is not
          universally better than CDP automation, and the cases where it loses
          are worth knowing before you commit to it.
        </p>

        <ComparisonTable
          productName="OS accessibility (Terminator)"
          competitorName="CDP / WebDriver (Playwright stealth)"
          rows={stackComparison}
        />

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The CDP path is faster on cooperative pages, supports headless mode
          out of the box, and is what the entire web testing ecosystem is built
          around. Use it for the 95% of pages that do not push back. The OS
          path costs you a real display, costs you a few hundred MB per
          session, and runs at human-perceptible click latency. In exchange you
          get a click that anti-bot scripts cannot tell apart from a Voice
          Control user, and a code surface that does not need a stealth fork
          maintained against the next anti-bot release. The most reliable
          production setup is to run both: CDP first, fall back to OS
          accessibility on pages that detect you.
        </p>

        <h2 className="mt-16 text-3xl font-semibold text-zinc-900 tracking-tight">
          The one objection that holds up
        </h2>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The OS accessibility layer is not a magical bypass for everything.
          The anti-bot industry will eventually start fingerprinting
          accessibility automation directly: AT-SPI hooks on Linux, UIA
          provider attachment on Windows, AXObserver on macOS. These are
          weaker signals than the CDP attach because real users with
          accessibility software running look the same way. But they are not
          zero. If you are scraping a high-value endpoint where the site has
          dedicated detection engineers, expect a future round of the arms
          race to land here too.
        </p>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          The two things that will keep working past that round: behavioral
          fidelity (replaying recorded human timing instead of synthesizing
          clicks), and TLS / IP fidelity (using the user&apos;s real Chrome
          on the user&apos;s real network, not a datacenter proxy). The OS
          layer makes both of those cheap to combine because the browser
          really is the user&apos;s Chrome. A stealth Playwright running on a
          Hetzner box is fighting a different fight.
        </p>

        <p className="mt-4 text-zinc-700 leading-relaxed">
          The other objection that comes up: this is heavier than HTTP
          scraping. Yes. If the site is happy to serve you JSON without a
          challenge, do not use a browser at all. The OS accessibility
          approach is for the case where the site has explicitly decided it
          does not want automated traffic, and where you have a legitimate
          reason to be there anyway (your own account, your customer&apos;s
          account, an accessibility audit, a regulatory disclosure, an
          internal tool that drives a vendor portal that has no API).
        </p>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Bringing this to a site that keeps catching your agent?"
          description="Walk through your detection trace with the team. Bring the page that is flagging you and the script that is getting flagged."
        />

        <FaqSection items={faqs} />

        <RelatedPostsGrid
          title="Related guides on the OS accessibility approach"
          posts={relatedPosts}
        />
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Talk through a detection trace with the team."
      />
    </>
  );
}
