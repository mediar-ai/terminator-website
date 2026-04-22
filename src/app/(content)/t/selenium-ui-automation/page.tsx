import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  Marquee,
  NumberTicker,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  CodeComparison,
  BentoGrid,
  GlowCard,
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/selenium-ui-automation";
const PUBLISHED = "2026-04-22";
const TITLE =
  "Selenium UI automation, stretched to every native app: how Terminator reuses your locator grammar outside the browser";
const DESCRIPTION =
  "Selenium taught a generation of engineers to pick UI elements by role, name, and CSS selector. Terminator ships the same prefix grammar, the same >> descendant chaining, and five spatial operators (rightof:, leftof:, above:, below:, near:) that Selenium has no equivalent for, running against the OS accessibility tree in 753 lines of Rust.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Keep the Selenium mental model. Swap the browser for every window on your desktop. Role, name, id, chained locators, and five spatial selectors the web never got.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Selenium-style UI automation, but for every native app",
    description:
      "role:, name:, id:, >> chaining, and rightof:/leftof:/above:/below:/near: operators, running against the OS accessibility tree.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Selenium UI automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Selenium UI automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does Selenium only work inside a browser?",
    a: "Selenium WebDriver was built on top of the W3C WebDriver protocol, which is implemented by browser engines (Chromium, Gecko, WebKit) through their driver executables (chromedriver, geckodriver, safaridriver). That protocol describes how to drive a rendered DOM, not a native window, so a Selenium session literally cannot see a native menu bar, a file dialog, a taskbar, or an app written in Cocoa, Win32, Qt, or WinUI. The rendered DOM is its entire world model.",
  },
  {
    q: "What does Terminator use instead of WebDriver?",
    a: "Native OS accessibility APIs. On Windows that is UI Automation (UIA), the same API screen readers use to traverse the whole desktop. On macOS it is the Accessibility API (AX). Both expose every window, every control, every text field, every button, in a structured tree with role, name, id, and value fields. Terminator's Rust core, in crates/terminator/src, wraps those APIs and then runs a Selenium-shaped selector language on top. You write role:Button and name:Send; Terminator walks the UIA or AX tree and finds it.",
  },
  {
    q: "Do my Selenium locator skills transfer?",
    a: "Most of them. If you already think in role, name, id, class name, descendant combinators, and text matches, you are 80 percent of the way to a Terminator selector. The prefix grammar in crates/terminator/src/selector.rs accepts role:, name:, id:, classname:, and text: as direct analogs to By.role, By.name, By.id, By.className, and By.linkText. The >> operator chains locators exactly like Playwright's >> chaining, which is itself a descendant combinator. What does not transfer: CSS selectors, XPath on HTML elements, and anything that relied on shadow DOM.",
  },
  {
    q: "What can Terminator do that Selenium cannot?",
    a: "Five positional operators. selector.rs lines 419 to 437 parse rightof:, leftof:, above:, below:, and near:, each of which takes another selector and returns elements spatially related to the anchor in the accessibility tree. You cannot express near:text:Cancel in Selenium because the browser DOM does not expose stable spatial relationships. The accessibility tree does, because screen readers need them to describe layout out loud. Terminator also supports boolean selectors, so role:Button and not name:Cancel or classname:Submit is a single string.",
  },
  {
    q: "Can I automate both the browser and the rest of the app in one script?",
    a: "Yes, and that is usually the reason to pick Terminator over Selenium. A common flow: open a desktop client such as Slack or Notion, copy a link, open Chrome with that link, fill a form, return to the desktop client, and paste the result into a message. Selenium can do step three only. Terminator can do all five in one script because every target is just a role or name in the accessibility tree regardless of which process owns the window. The selector window:Slack and window:Chrome do not care that one is Electron and one is a native Chromium session.",
  },
  {
    q: "How is this different from pyautogui or image-based runners like Sikuli?",
    a: "Image-based runners match screenshots and click pixel coordinates. They break whenever a UI theme changes, the display DPI shifts, fonts hint differently, or a scrollbar steals two pixels. Terminator never reaches for pixels by default. It reads role, name, id, and bounds out of the accessibility tree, so a button that repaints its background is still the same Button node with the same name. Pixels are available as a last-resort pos:x,y selector, but the documented pattern is to build on the accessibility layer.",
  },
  {
    q: "Does it work on a headless CI agent?",
    a: "Yes on Windows, with an active user session. UIA requires a logged-in desktop to inspect, so you run it on a Windows VM that auto-logs-in, not on a hosted Linux GitHub Actions runner. Our own examples folder uses this exact pattern on Windows 11 VMs provisioned via Vagrant, and the MCP agent ships windows-x86_64 binaries out of the box. macOS support requires Accessibility permission granted to the parent process; Linux uses AT-SPI2 at the Rust level.",
  },
  {
    q: "How big is the selector engine and can I read the source?",
    a: "The engine is a single Rust file, crates/terminator/src/selector.rs, 753 lines. It contains the Selector enum (32 variants), a hand-rolled tokenizer that recognizes && and || and ! and parentheses, and a recursive-descent parser that builds a Selector AST. The positional operators each take five to seven lines to parse. The boolean expression parser sits at lines 216 to 330. 543 lines of unit tests live next to it in selector_tests.rs. Public mirror: github.com/mediar-ai/terminator.",
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

const seleniumVsTerminatorRows: ComparisonRow[] = [
  {
    feature: "Pick elements by accessibility role",
    competitor: "Yes, via By.role",
    ours: "Yes, via role: prefix",
  },
  {
    feature: "Pick elements by id and name",
    competitor: "Yes, via By.id / By.name",
    ours: "Yes, via id: and name: prefixes",
  },
  {
    feature: "Chain locators through descendants",
    competitor: "Yes, via nested WebElement.find",
    ours: "Yes, via >> operator",
  },
  {
    feature: "Boolean expressions in a single selector",
    competitor: "No, requires manual code filtering",
    ours: "Yes (&&, ||, !, parentheses)",
  },
  {
    feature: "Spatial operators (above, below, near)",
    competitor: "No",
    ours: "Yes, five built-in",
  },
  {
    feature: "Targets a native file dialog",
    competitor: "No, the dialog is outside the DOM",
    ours: "Yes, it is just another window",
  },
  {
    feature: "Targets an Excel cell or a Slack DM",
    competitor: "No",
    ours: "Yes",
  },
  {
    feature: "Requires a driver executable per browser",
    competitor: "Yes (chromedriver, geckodriver, etc.)",
    ours: "No, uses OS accessibility APIs directly",
  },
  {
    feature: "Keeps the user's browser cookies and sessions",
    competitor: "No, spawns a fresh profile",
    ours: "Yes, attaches to the running session",
  },
  {
    feature: "Blocks the user's mouse and keyboard",
    competitor: "Yes in many modes",
    ours: "No, runs through accessibility API",
  },
];

const seleniumExample = `# Selenium WebDriver
# This only works if the UI is a web page rendered inside a browser
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://app.example.com")

# Fill a login form
driver.find_element(By.ID, "email").send_keys("me@example.com")
driver.find_element(By.ID, "password").send_keys("hunter2")
driver.find_element(
    By.CSS_SELECTOR, "button[type=submit]"
).click()

# You cannot reach a native Save As dialog
# You cannot reach Slack, Excel, VS Code, or the menu bar
# You cannot reach the app's own title bar buttons`;

const terminatorExample = `# Terminator
# Same locator mental model, extended to every native window
import terminator

desktop = terminator.Desktop()

# Open any app, web or native
desktop.open_url("https://app.example.com")

# Find elements by accessibility role and name
(desktop
  .locator("name:Email")
  .first()).type_text("me@example.com")

(desktop
  .locator("name:Password")
  .first()).type_text("hunter2")

# Chain with >>, exactly like Playwright
btn = (desktop
  .locator("window:Example && role:Button >> name:Sign in")
  .first())
btn.click()

# After login, reach into Slack in the same script
(desktop
  .locator("window:Slack >> role:Edit && name:Message")
  .first()).type_text("deploy finished")`;

const selectorPrefixLines = [
  { text: "# All of these are valid Terminator selectors", type: "output" as const },
  { text: 'role:Button && name:Save', type: "command" as const },
  { text: "matched: [Button] Save (focusable, enabled)", type: "success" as const },
  { text: 'id:submitBtn', type: "command" as const },
  { text: "matched: [Button] submitBtn", type: "success" as const },
  { text: 'window:Calculator >> role:Button && name:Seven', type: "command" as const },
  { text: "matched: [Button] Seven in Calculator", type: "success" as const },
  { text: 'rightof:name:Username', type: "command" as const },
  { text: "matched: [Edit] first input to the right of the Username label", type: "success" as const },
  { text: 'near:text:Cancel', type: "command" as const },
  { text: "matched: nearest interactive element to the Cancel label", type: "success" as const },
  { text: '(role:Button && !name:Cancel) || classname:PrimaryAction', type: "command" as const },
  { text: "matched: every non-Cancel button and every PrimaryAction control", type: "success" as const },
];

const keptFromSelenium = [
  "role= becomes role:",
  "id= becomes id:",
  "name= becomes name:",
  "className= becomes classname:",
  "text= becomes text:",
  "descendant chaining via >>",
  "first(), all(), timeout()",
  "type_text, click, press_key",
];

const newOperators = [
  "rightof:<selector>",
  "leftof:<selector>",
  "above:<selector>",
  "below:<selector>",
  "near:<selector>",
  "&&, ||, ! with parentheses",
  "has:<selector> (Playwright :has() style)",
  ".. for parent navigation",
];

const bento: BentoCard[] = [
  {
    title: "Same prefix grammar",
    description:
      "role:, id:, name:, classname:, text: are all direct analogs of Selenium's By.* locator families. If you can read a Selenium test today, you can read a Terminator selector tomorrow.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Same descendant chaining",
    description:
      "The >> operator walks the accessibility tree the way Playwright's >> walks the DOM. window:Calculator >> role:Button && name:Seven is the calculator app's seven key.",
    size: "1x1",
  },
  {
    title: "Five new spatial operators",
    description:
      "rightof:, leftof:, above:, below:, near: have no Selenium equivalent. They exist because screen readers need to describe layout spatially, so the accessibility tree preserves what the DOM does not.",
    size: "1x1",
  },
  {
    title: "Real boolean expressions",
    description:
      "role:Button && !name:Cancel is one string, parsed by a hand-rolled tokenizer and a recursive-descent expression parser. No manual collection filtering, no XPath gymnastics.",
    size: "2x1",
  },
  {
    title: "Every native window",
    description:
      "Chrome, Excel, Slack, VS Code, File Explorer, Finder, the OS menu bar. Anything the accessibility API exposes is reachable with one selector language.",
    size: "1x1",
  },
  {
    title: "No driver executables",
    description:
      "Selenium needs chromedriver, geckodriver, safaridriver. Terminator talks to UIA on Windows and AX on macOS directly from Rust. Zero WebDriver processes on your machine.",
    size: "1x1",
  },
];

const migrationSteps = [
  {
    title: "Install the SDK for your language",
    description:
      "pip install terminator-py on Python 3.10+, npm install @mediar-ai/terminator on Node.js, or cargo add terminator-rs in Rust. Same selector language across all three.",
  },
  {
    title: "Replace webdriver.Chrome() with Desktop()",
    description:
      "desktop = terminator.Desktop() gives you a handle on the whole accessibility tree. desktop.open_url() still works, and it attaches to the default browser without spawning a fresh profile.",
  },
  {
    title: "Translate your By.* locators into prefix selectors",
    description:
      "By.ID becomes id:, By.NAME becomes name:, By.CLASS_NAME becomes classname:. For complex paths, build a chain with >> instead of nested find_element calls.",
  },
  {
    title: "Add spatial selectors where the web version needed fragile XPath",
    description:
      "Anywhere your Selenium test did following-sibling::input[1], try rightof:name:Label instead. It reads better, it survives DOM restructures, and it works in native apps too.",
  },
  {
    title: "Keep the rest of the test harness",
    description:
      "pytest, jest, mocha, XUnit, Page Object Model, all still apply. Terminator is a driver layer, not a framework, so your assertion library and reporting stack stay the same.",
  },
];

const installLines = [
  { text: "pip install terminator-py", type: "command" as const },
  { text: "Successfully installed terminator-py-0.x.x", type: "success" as const },
  { text: "npm install @mediar-ai/terminator", type: "command" as const },
  { text: "added 1 package in 4s", type: "success" as const },
  { text: "cargo add terminator-rs", type: "command" as const },
  { text: "Adding terminator-rs to dependencies", type: "success" as const },
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"", type: "command" as const },
  { text: "Added stdio MCP server terminator", type: "success" as const },
];

const whereSeleniumStops = [
  "Native Save As dialog",
  "macOS menu bar",
  "Windows taskbar",
  "File Explorer / Finder",
  "Excel cell grid",
  "Slack desktop app",
  "Photoshop toolbar",
  "VS Code command palette",
  "IntelliJ context menu",
  "System Preferences pane",
];

const positionalParserCode = `// crates/terminator/src/selector.rs, lines 419-437
// Five positional operators. Each one takes another selector as
// its anchor and returns elements spatially related to it. Selenium
// has no equivalent because the browser DOM does not expose stable
// spatial relationships; the OS accessibility tree does.

_ if s.to_lowercase().starts_with("rightof:") => {
    let inner_selector_str = &s["rightof:".len()..];
    Selector::RightOf(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("leftof:") => {
    let inner_selector_str = &s["leftof:".len()..];
    Selector::LeftOf(Box::new(Selector::from(inner_selector_str)))
}
_ if s.to_lowercase().starts_with("above:") => { ... }
_ if s.to_lowercase().starts_with("below:") => { ... }
_ if s.to_lowercase().starts_with("near:") => { ... }`;

const booleanParserCode = `// crates/terminator/src/selector.rs, lines 216-330
// A real recursive-descent expression parser for selectors.
// It tokenizes into Selector / And / Or / Not / LParen / RParen,
// then reduces via the shunting-yard algorithm, then builds an AST.
// The end result is one of:
//
//   Selector::And(Vec<Selector>)
//   Selector::Or(Vec<Selector>)
//   Selector::Not(Box<Selector>)
//
// So a string like
//   "(role:Button && !name:Cancel) || classname:Submit"
// parses into a three-way tree with no manual filtering required.`;

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
          Selenium UI automation, extended to{" "}
          <GradientText>every native app</GradientText> on your desktop
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Selenium taught a generation of engineers to pick UI elements by
          role, name, and id, and to chain locators through descendants.
          Terminator keeps that mental model and ports it off the browser.
          One selector language covers Chrome, Excel, Slack, Finder, and the
          title bar of the window you are reading this in. Built on 753 lines
          of Rust over the OS accessibility tree.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="used by AI coding agents in Claude, Cursor, VS Code"
        highlights={[
          "Single selector file: crates/terminator/src/selector.rs (753 lines)",
          "Five spatial operators Selenium has no equivalent for",
          "Same >> descendant chaining you know from Playwright",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Your Selenium skills"
            subtitle="still work outside the browser"
            captions={[
              "role:, name:, id:, classname:, text: all port straight over",
              "Chain locators with >> the way you chain Playwright",
              "Five spatial operators the DOM never exposed",
              "One language across Chrome, Excel, Slack, Finder",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The browser was always a subset
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Most guides about this topic assume the thing you are automating is
          a web page. They show you how to install a WebDriver, pick a By
          strategy, wait for an element, and click a button. That works fine
          as long as every control your user touches lives inside a Chromium
          process. The moment a Save As dialog appears, the moment the user
          switches to Slack, the moment the test needs to drag a file onto
          the app icon in the Dock, Selenium has nothing to say about it.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The underlying reason is architectural. Selenium WebDriver speaks
          the W3C WebDriver protocol, and that protocol was designed to drive
          a rendered DOM inside a browser engine. A driver executable
          (chromedriver, geckodriver, safaridriver) sits between the test and
          the browser and translates commands. Everything outside the
          browser process is invisible.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator takes the same mental model (locators, roles, names,
          chaining) and points it at the layer below the browser: the OS
          accessibility tree. Windows UI Automation and macOS Accessibility
          API both expose every window, every control, every label, every
          text field, with stable role and name fields. A screen reader can
          see all of it. So can an automation script.
        </p>
      </section>

      <ProofBanner
        quote="The selector grammar you wrote for Selenium already matches your native desktop."
        source="crates/terminator/src/selector.rs, 32-variant Selector enum"
        metric="753 lines"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the Selenium mental model stops
        </h2>
        <p className="text-zinc-600 mb-6">
          These are all real UI surfaces a browser-only runner cannot reach.
          Every one of them is a plain window in the OS accessibility tree.
        </p>
        <Marquee speed={38} pauseOnHover>
          {whereSeleniumStops.map((label) => (
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
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Side by side: a login flow, then a desktop handoff
        </h2>
        <p className="text-zinc-600 mb-6">
          Left: a Selenium test that can log in but cannot go any further
          than the rendered DOM. Right: a Terminator script that signs in,
          then pivots into Slack, in the same process.
        </p>
        <CodeComparison
          title="Same locator style, different reach"
          leftLabel="Selenium (Python)"
          rightLabel="Terminator (Python)"
          leftCode={seleniumExample}
          rightCode={terminatorExample}
          leftLines={seleniumExample.split("\n").length}
          rightLines={terminatorExample.split("\n").length}
          reductionSuffix="more reach per line"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How the selector engine is put together
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Three inputs feed into one parser. A prefix selector like role: or
          name: goes through a straightforward atomic parser. A chained
          expression with <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">&gt;&gt;</code> splits on the operator and recurses. A boolean
          expression with <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">&&</code>, <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">||</code>, or <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">!</code> runs through a hand-rolled
          tokenizer and a recursive-descent parser that produces an AST. All
          three paths produce the same <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">Selector</code> enum, which the locator
          engine then walks against the accessibility tree.
        </p>
        <AnimatedBeam
          title="What the parser does with a string"
          from={[
            { label: "Prefix selector", sublabel: "role:Button, name:Save" },
            { label: "Chained locator", sublabel: "window:X >> role:Button" },
            { label: "Boolean expression", sublabel: "(a && b) || !c" },
            { label: "Positional operator", sublabel: "rightof:text:Email" },
          ]}
          hub={{ label: "selector.rs", sublabel: "32-variant Selector AST" }}
          to={[
            { label: "UIA tree (Windows)", sublabel: "Desktop root → app → controls" },
            { label: "AX tree (macOS)", sublabel: "Application → Window → Group" },
            { label: "AT-SPI2 (Linux)", sublabel: "Root → frame → widget" },
          ]}
          accentColor="#FF3E00"
          className="my-8"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The five positional selectors, parsed line by line
        </h2>
        <p className="text-zinc-600 mb-6">
          This is the part of the grammar that has no Selenium equivalent.
          Each operator takes another selector as its anchor and returns
          elements whose bounds fall in the corresponding spatial region.
        </p>
        <AnimatedCodeBlock
          code={positionalParserCode}
          language="rust"
          filename="selector.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          A practical example. You are writing a test for a settings page
          where the Email label drifts up and down as other form rows appear
          or collapse. In Selenium you would write something like
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm mx-1">following-sibling::input[1]</code>
          and hope nobody reshuffles the DOM. In Terminator the selector is
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm mx-1">rightof:name:Email</code>
          and the anchor survives layout changes because the accessibility
          tree always knows which control is to the right of a label.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What transfers from your Selenium test suite
        </h2>
        <p className="text-zinc-600 mb-8">
          Two lists. Everything on the left you already know. Everything on
          the right is new, and costs about an afternoon to learn.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                Carries over from Selenium
              </h3>
              <AnimatedChecklist
                title=""
                items={keptFromSelenium.map((text) => ({ text, checked: true }))}
              />
            </div>
          </GlowCard>
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-zinc-900 mb-4">
                New in Terminator
              </h3>
              <AnimatedChecklist
                title=""
                items={newOperators.map((text) => ({ text, checked: true }))}
              />
            </div>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Six ways the locator story diverges
        </h2>
        <p className="text-zinc-600 mb-6">
          Group tour of the design choices. Some are direct ports, some only
          make sense once you are outside the browser.
        </p>
        <BentoGrid cards={bento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What a selector string actually does
        </h2>
        <p className="text-zinc-600 mb-6">
          A small tour through the grammar. Every command on the left is a
          valid Terminator selector; the output is the element it resolves
          to in the accessibility tree.
        </p>
        <TerminalOutput title="selector → match" lines={selectorPrefixLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature matrix, item by item
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Selenium"
          rows={seleniumVsTerminatorRows}
          intro="The column names are the capabilities most developers pick a UI automation tool for. Ticks are honest: when Selenium can do something, it says so."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Moving an existing Selenium test across
        </h2>
        <StepTimeline
          title="Five steps, half a day"
          steps={migrationSteps}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Why a real parser, not a regex
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          A common shortcut in locator libraries is to treat <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">&&</code> as a
          string <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">split</code> and move on. That falls apart the first time someone
          writes a selector with nested parentheses or a not-operator that
          binds tighter than an or-operator. Terminator instead runs every
          non-trivial selector through a real tokenizer and a real
          recursive-descent expression parser.
        </p>
        <AnimatedCodeBlock
          code={booleanParserCode}
          language="rust"
          filename="selector.rs"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The practical payoff: a selector like
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm mx-1">
            (role:Button && !name:Cancel) || classname:PrimaryAction
          </code>
          parses correctly the first time, and the same string round-trips
          through serialization for logs and test reports.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Numbers from the actual repo
        </h2>
        <p className="text-zinc-600 mb-8">
          Read from <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">wc -l crates/terminator/src/selector.rs</code> and the
          Selector enum definition.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={753} />
            </div>
            <div className="text-sm text-zinc-500 mt-2">
              lines in selector.rs
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={32} />
            </div>
            <div className="text-sm text-zinc-500 mt-2">
              variants in the Selector enum
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={5} />
            </div>
            <div className="text-sm text-zinc-500 mt-2">
              positional operators
            </div>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-6 text-center">
            <div className="text-4xl font-bold text-orange-600">
              <NumberTicker value={543} />
            </div>
            <div className="text-sm text-zinc-500 mt-2">
              lines of unit tests
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install it, in any of four languages
        </h2>
        <TerminalOutput title="one of these, your pick" lines={installLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Bringing a Selenium test suite to the rest of your desktop?"
        description="Book 20 minutes with our team. We will walk through your existing locators and sketch the Terminator equivalents on the spot."
      />

      <FaqSection
        items={faqs}
        heading="Frequently asked questions"
        className="my-16"
      />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Porting a Selenium suite to the rest of your desktop? Grab 20 minutes."
      />
    </article>
  );
}
