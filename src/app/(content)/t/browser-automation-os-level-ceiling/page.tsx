import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  ProofBanner,
  AnimatedChecklist,
  SequenceDiagram,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/browser-automation-os-level-ceiling";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-10";
const TITLE =
  "Browser automation hits a desktop ceiling: the seven moments Playwright goes silent, mapped to the OS-level tool that takes over";
const DESCRIPTION =
  "Browser automation works until the next click is owned by a different process. Then it stops, hard. This page enumerates the seven concrete ceiling moments (save dialogs, system print, native authenticators, OAuth desktop redirects, fullscreen surfaces, Open With handlers, app-to-app handoff) and maps each one to the specific Terminator MCP tool that resolves it. Of 38 #[tool(...)] declarations in crates/terminator-mcp-agent/src/server.rs, exactly one runs inside the DOM. The other 37 exist because the ceiling exists.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Where Playwright stops working, mapped to the seven specific OS-level moments that cause it. Each ceiling crossing has a tool that already exists in Terminator's MCP server.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browser automation has a hard ceiling at the OS",
    description:
      "Seven moments your browser-side script will go silent, and the one accessibility-tree tool that already handles each one. Source paths included.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Browser automation desktop ceiling" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Browser automation desktop ceiling", url: PAGE_URL },
];

const ceilingMoments = [
  {
    n: "01",
    name: "OS file save dialog after a download",
    failure:
      "User clicks Download. Chrome surfaces the OS save dialog. Your Playwright locator returns nothing because the dialog is owned by explorer.exe (Windows) or Finder (macOS), not by the browser process. page.on('dialog') never fires; that handler is for JavaScript alert/confirm/prompt only.",
    fix: "click_element with selector role:Button|name:Save against process:Save As. Lives at crates/terminator-mcp-agent/src/server.rs:2486. The same selector grammar that walks a page button walks the dialog button.",
  },
  {
    n: "02",
    name: "System print sheet (Ctrl+P then everything after)",
    failure:
      "page.evaluate(() => window.print()) opens the print dialog. The dropdown for printer selection, the page-range input, the Save as PDF destination, the duplex checkbox, all live in a system window the browser cannot inspect or click. CDP cannot drive what CDP cannot see.",
    fix: "press_key_global with key Ctrl+P at server.rs:3330 to trigger from the focused tab, then click_element on role:ComboBox|name:Destination, then invoke_element on role:MenuItem|name:Save as PDF (server.rs:7244). The InvokePattern path is more reliable than coordinate clicks for menu items.",
  },
  {
    n: "03",
    name: "Native authenticator app for 2FA",
    failure:
      "The user enters credentials in your scripted browser. Google or Okta sends the push to Microsoft Authenticator, Duo Mobile (desktop client), or 1Password's native app. The 6-digit code lands in another window. document.querySelector cannot read it. clipboard polling works only if the user already copied it.",
    fix: "activate_element on the authenticator window (server.rs:4947), capture_screenshot of just that window region (server.rs:7007), then a small OCR pass via the include_ocr flag on get_window_tree (server.rs:1330). The code is in the AX tree on macOS for most authenticators; on Windows it tends to be a custom-painted control, which is where the OCR fallback earns its place.",
  },
  {
    n: "04",
    name: "OAuth flow that exits to a desktop app",
    failure:
      "The OAuth provider responds with a custom URL scheme (msteams://, slack://, com.notion.id://) and the OS hands the next step to a native app. Playwright's context dies the moment the URL leaves the browser. The OAuth callback succeeds in the OS, your script does not see it.",
    fix: "open_application at server.rs:6227 to surface the native app deterministically, then click_element on role:Button|name:Allow inside its window. The OS already routed the callback; you only have to click the consent dialog. One MCP call replaces the brittle 'wait_for_url' loop that never returns.",
  },
  {
    n: "05",
    name: "Fullscreen GPU surfaces (canvas-heavy IDEs, games, design tools, screen-sharing previews)",
    failure:
      "Figma's drawing canvas, the Unreal viewport, a remote-desktop window, the Zoom share-screen preview. The accessibility subtree of these surfaces is one node deep. The DOM, if any, is a single container. Both browser automation and accessibility-tree automation fall silent at the same time.",
    fix: "click_element coordinate mode at server.rs:2517 for the rare moments you need pixel-targeted clicks, with capture_screenshot grounded by the bounding rect of the parent UIA element so the coordinates are anchored, not blind. Terminator's seven grounding modes cover this exact failure surface; the AX path is the default and pixel mode is the explicit escalation.",
  },
  {
    n: "06",
    name: "Open With handlers and external file viewers",
    failure:
      "User downloads an Excel file from a SaaS. Workflow continues in Excel: edit a cell, save, re-upload. Playwright never sees Excel. Selenium does not either. The browser handed off to xlsx through the OS file association and the next 90 seconds of work happen in a different process tree.",
    fix: "open_application Excel, click_element role:Document|name:Sheet1 then role:DataItem to walk the cells, type_into_element (server.rs:2154) for value entry, press_key Ctrl+S to save, then back to the browser tab with activate_element. The session bridges through the OS, not through CDP.",
  },
  {
    n: "07",
    name: "App-to-app handoff in a real workflow",
    failure:
      "An invoice arrives by email in the Outlook native app. The agent has to extract a number, paste it into a SaaS billing tool in Chrome, screenshot the confirmation, and save the screenshot to a OneDrive folder visible only in Explorer. Playwright covers exactly one of those four windows. The other three have no DOM at all.",
    fix: "execute_sequence (server.rs:7503) wraps every step into one MCP call so the model spends one inference cycle deciding the workflow, not one cycle per click. The sequence steps freely mix click_element on Outlook, execute_browser_script for the SaaS form, and capture_screenshot writing to disk. One grammar across four processes.",
  },
];

const seqMessages: { from: number; to: number; label: string; type?: "request" | "response" | "event" | "error" }[] = [
  { from: 0, to: 1, label: "page.click('a[download]')", type: "request" },
  { from: 1, to: 2, label: "Browser surfaces OS save dialog", type: "event" },
  { from: 0, to: 1, label: "page.locator('button:Save').click()", type: "request" },
  { from: 1, to: 0, label: "TimeoutError: locator not found", type: "error" },
  { from: 0, to: 3, label: "click_element role:Button|name:Save", type: "request" },
  { from: 3, to: 2, label: "UIA InvokePattern on Save dialog", type: "request" },
  { from: 2, to: 3, label: "Dialog closed, file written", type: "response" },
  { from: 3, to: 0, label: "ui_diff_before_after delta returned", type: "response" },
];

const everythingThatBreaksAtTheCeiling = [
  { text: "page.locator() returning the OS save dialog's Save button", checked: false },
  { text: "page.on('dialog') firing for the system print sheet", checked: false },
  { text: "page.context().cookies() reading credentials from a native password manager", checked: false },
  { text: "Reading a 2FA code from Microsoft Authenticator's window", checked: false },
  { text: "Clicking the Allow button in an OAuth consent dialog opened in a native app", checked: false },
  { text: "Filling a cell in Excel after the SaaS exported an .xlsx", checked: false },
  { text: "Driving the Open With chooser when a download has no default app", checked: false },
  { text: "Capturing a screenshot of the OS notification that says permission was just granted", checked: false },
];

const everythingThatStillWorks = [
  { text: "Walking the OS accessibility tree under the active window in tens of milliseconds", checked: true },
  { text: "Selecting elements by role+name across native apps and Chrome tabs with one grammar", checked: true },
  { text: "Receiving DOM events back via execute_browser_script when you do need the page context", checked: true },
  { text: "Reconciling DOM coordinates with screen coordinates via devicePixelRatio against the role:Document UIA bounds", checked: true },
  { text: "Falling back to coordinate clicks when the AX subtree is empty (fullscreen surfaces, RDP)", checked: true },
  { text: "Wrapping the whole multi-app sequence in one execute_sequence call so the model spends one turn instead of fifteen", checked: true },
];

const installSteps: StepperStep[] = [
  {
    title: "Install the MCP",
    description: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" registers 38 typed tools.",
  },
  {
    title: "Open the focused window",
    description: "Ask the agent to call get_window_tree on the focused process. You see the same JSON the model sees.",
  },
  {
    title: "Cross the ceiling",
    description: "Reproduce a flow that broke before. The save dialog or native authenticator now resolves through click_element with role+name.",
  },
  {
    title: "Compile the workflow",
    description: "Wrap the working steps in execute_sequence so the model fires one inference, not one per click.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"browser automation desktop ceiling\" actually mean in code?",
    a: "It means the boundary where Playwright, Puppeteer, Selenium, and any CDP-bound tool stop returning useful data. The browser exposes a DOM through the Chrome DevTools Protocol; document.querySelector and page.locator both descend that DOM. The instant the next interactive element belongs to a different OS process (the file-save dialog, an authenticator app, the print sheet, an Excel file the browser just opened), the DOM is empty for that target. The browser automation library does not throw a special error; it usually just times out waiting for an element that the browser was never going to see in the first place. The fix is not to keep retrying inside the browser. The fix is to cross to a different surface (the OS accessibility tree) using a tool grammar that spans both worlds.",
  },
  {
    q: "Where exactly does Playwright say it does not handle this?",
    a: "Playwright's dialog docs at playwright.dev/docs/dialogs are explicit that dialogs there means JavaScript alert/confirm/prompt and beforeunload, all of which live inside the page's JS context. OS-level dialogs are out of scope. The downloads docs at playwright.dev/docs/downloads handle the file write itself but not the OS save sheet that Chrome surfaces if the user has not turned on auto-downloads, and the page.evaluate(() => window.print()) call opens a sheet that is reachable only through the OS. None of this is a Playwright bug; it is a scope statement. The browser process is the contract Playwright signed.",
  },
  {
    q: "How does Terminator measure that ceiling in its own source?",
    a: "Run grep -c '#\\[tool' crates/terminator-mcp-agent/src/server.rs against the repo at github.com/mediar-ai/terminator. As of release 0.24.32 it reports 38 tool declarations. Exactly one of them, execute_browser_script at server.rs:7839, runs inside the DOM by sending JavaScript through a Manifest V3 Chrome extension on a local WebSocket at ws://127.0.0.1:17373. The other 37 (open_application, click_element, type_into_element, press_key, press_key_global, activate_element, invoke_element, capture_screenshot, get_window_tree, set_value, scroll_element, drag_mouse, validate_element, wait_for, and so on) operate against the OS accessibility tree directly. That 1:37 ratio is the most honest measure of how much surface area the browser does not cover for an automation that has to do real work.",
  },
  {
    q: "Why not just use the File System Access API or showSaveFilePicker?",
    a: "Two reasons. First, showSaveFilePicker is gated behind a synchronous user-activation handler; it only fires on a real click or keypress and behaves differently in headless mode. It also does not run for downloads that did not originate from your script (a content-disposition response, a third-party iframe, a navigation to a binary). Second, even when it works, it does not solve any of the other six ceiling moments: 2FA, OAuth desktop redirect, system print, Open With, fullscreen surfaces, app handoff. It is a small patch on one specific seam in a much larger boundary. The ceiling is not the file dialog; the ceiling is the browser process.",
  },
  {
    q: "Is the accessibility tree fast enough to use for every interaction?",
    a: "Yes, with caveats. A cached UIA subtree fetch on a populated window comes back in tens of milliseconds when the cache pre-fetches every property in one IPC call (see tree_builder.rs:388 in the terminator crate, where ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, and AutomationId are all populated together). Walking node-by-node with separate IPC calls is one to two orders of magnitude slower; the cached path is what makes structural automation viable as a default. The AX tree is silent on three known surfaces: fullscreen rendered apps, sandboxed RDP windows, and legacy custom-painted controls. For those, a vision-grounded fallback is the right escalation, and Terminator's click_element exposes that as an explicit mode rather than a hidden retry.",
  },
  {
    q: "Does this replace Playwright?",
    a: "No, and that framing is wrong. Inside the page, Playwright is the right tool. Its DOM model, its auto-waiting, and its trace viewer are all sharper than what an OS-level tool offers when the workload is purely web. Where Playwright runs out of room is the moment the workload leaves the browser. Terminator and Playwright cooperate cleanly: Playwright drives the page, Terminator's MCP drives everything outside it, and the same agent loop calls both. If your automation does not cross the ceiling, you do not need Terminator. If it does, you need a tool that can.",
  },
  {
    q: "What about Computer Use APIs (Anthropic, OpenAI)?",
    a: "Computer Use models close one half of the gap by reasoning about screenshots and proposing pixel coordinates. They do not give the agent access to the OS accessibility tree, so every click costs an inference, every check costs another screenshot, and the model has to re-derive the structure of the window from pixels each turn. Terminator's MCP gives the same model an accessibility tree and a typed tool surface, which collapses most of those screenshot loops into one structural call. Opus 4.7's defaults pull desktop automation toward fewer-tools-per-turn workflows; that shape favors compiled MCP sequences over per-click vision.",
  },
  {
    q: "How do I try this against a flow that just broke for me?",
    a: "Install the MCP server with one line: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Open Claude Code, ask the agent to call get_window_tree on the focused process, and inspect the JSON. That is the same input the model sees. Replay the failing step, this time letting the agent reach for click_element with a role+name selector instead of CDP. If you want help wiring it into an existing Playwright run, the team at github.com/mediar-ai/terminator is reachable on Discord, and the source for everything in this article is in crates/terminator-mcp-agent/src/server.rs. The repo is MIT-licensed.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility tree desktop agents: the browser is already a UIA element",
    href: "/t/accessibility-tree-closes-browser-to-native-gap",
    excerpt: "Why the OS tree already spans both Chrome and the file dialog, and the devicePixelRatio trick that makes one selector grammar work on both sides.",
    tag: "Architecture",
  },
  {
    title: "Browser agents leaving the DOM: where the tool surface ends",
    href: "/t/browser-agents-leaving-the-dom",
    excerpt: "The Manifest V3 extension, the local WebSocket, and how the same selector format dispatches to either adapter without the agent knowing.",
    tag: "Bridge",
  },
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt: "Why structural element lookups beat pixel matching on latency, stability, DPI, and i18n.",
    tag: "Comparison",
  },
];

const articleJsonLd = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbJsonLd = breadcrumbListSchema(breadcrumbSchemaItems);
const faqJsonLd = faqPageSchema(faqs);

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-6 pb-4">
        <p className="text-xs font-mono uppercase tracking-widest text-orange-600 mb-4">
          Guide / OS-level automation
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-zinc-900 leading-tight tracking-tight">
          Browser automation hits a desktop ceiling. Here are the seven moments it goes silent, and the OS-level tool that takes over each one.
        </h1>
        <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
          Browser automation works the moment the next click is owned by the browser process, and stops working the moment it is not. The boundary is not gradual. It is a wall. This page enumerates the seven concrete places that wall shows up in real automations and maps each one to the specific tool that resolves it.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="8 min read"
      />

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-3">
            Direct answer (verified 2026-05-10)
          </p>
          <p className="text-zinc-900 text-lg leading-relaxed">
            Browser automation stops working the second the next interactive element belongs to a process other than the browser tab: OS save and open dialogs, the system print sheet, native authenticators, OAuth handoffs to desktop apps, fullscreen GPU surfaces, Open With handlers, and any window owned by a separate executable. Inside the tab, document.querySelector returns elements. One frame outside, it returns nothing. The fix is not retrying inside the browser; it is a tool grammar that walks the OS accessibility tree the same way it walks the DOM.
          </p>
          <p className="text-sm text-zinc-600 mt-4">
            Verified against Playwright&apos;s own scope statement at{" "}
            <a
              href="https://playwright.dev/docs/dialogs"
              className="text-orange-700 underline"
              rel="noopener"
            >
              playwright.dev/docs/dialogs
            </a>
            , which limits the dialog API to JavaScript alert, confirm, prompt, and beforeunload only.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <ProofBanner
          metric="1 of 38"
          quote="Of 38 #[tool(...)] declarations in crates/terminator-mcp-agent/src/server.rs, exactly one runs inside the DOM. The other 37 exist because the browser-process boundary exists."
          source="grep -c '#[tool' against terminator at github.com/mediar-ai/terminator, release 0.24.32"
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
          Why this is one wall, not many
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The seven moments below look unrelated on the surface. A file save dialog has nothing in common with a Microsoft Authenticator window. The system print sheet is not the same as a fullscreen Figma canvas. They feel like seven different problems with seven different workarounds.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          They are the same problem. In every case the next thing the script has to interact with is a UI element owned by a different OS process than the one Playwright attached to. CDP is a per-process protocol. The DOM is a per-document tree. Once the relevant element is outside both of those, the browser-side toolset has nothing useful to say. The wall is not at any one of those seven points; it is at the browser process boundary, and the seven points are where ordinary workflows happen to cross it.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The structural fix is to switch tree. The OS already exposes a tree of every visible UI element across every process for screen readers (UI Automation on Windows, AXUIElement on macOS, AT-SPI2 on Linux). A tool that speaks role:Button name:Save against that tree walks both a page button and a system save dialog with the same call. That is the only way the wall stops being a wall.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">
          The seven ceiling moments
        </h2>
        <p className="text-sm text-zinc-500 mb-8">
          Each moment is paired with the failure shape on the browser side and the specific Terminator MCP tool that resolves it. File paths point at the canonical implementation in the repo at github.com/mediar-ai/terminator.
        </p>

        <ol className="space-y-10">
          {ceilingMoments.map((m) => (
            <li key={m.n} className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-3">
              <div className="text-2xl font-mono text-orange-600 leading-none pt-1">
                {m.n}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                  {m.name}
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                      What breaks
                    </p>
                    <p className="text-zinc-700 leading-relaxed text-sm">
                      {m.failure}
                    </p>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                    <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
                      What takes over
                    </p>
                    <p className="text-zinc-800 leading-relaxed text-sm">
                      {m.fix}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
          What a single ceiling crossing looks like, end to end
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          A download click is the most common ceiling crossing in the wild. The Playwright-side script issues the click, the browser surfaces an OS dialog, and the script then tries to locate a button that the browser never owned in the first place. The locator times out somewhere around the default 30 seconds. Replacing that timeout with a click_element call against the dialog process resolves the same step in tens of milliseconds.
        </p>
        <SequenceDiagram
          title="Ceiling crossing: download → save dialog → resolution"
          actors={["Agent", "Chrome", "OS Save Dialog", "Terminator MCP"]}
          messages={seqMessages}
        />
        <p className="text-sm text-zinc-500 mt-2">
          The first three messages are the browser-side path. They end with a TimeoutError because the Save button is not in the DOM. The next four messages are the OS-level path through Terminator&apos;s MCP server, which resolves the dialog by talking to the same UIA element the screen reader already sees.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
          What stays broken vs. what starts working
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          If you keep doing only browser-side automation, the items in the first list will keep failing in production no matter how much retry logic you add. The items in the second list are what becomes available the moment you also have an OS-level tool grammar.
        </p>
        <AnimatedChecklist
          title="Stays broken at the ceiling"
          items={everythingThatBreaksAtTheCeiling}
        />
        <AnimatedChecklist
          title="Available once you cross"
          items={everythingThatStillWorks}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
          The cost of staying inside the browser
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Teams that hit this ceiling for the first time usually try three things in order. They add longer timeouts, then they add OCR on a screenshot of the Save dialog, then they introduce a second framework (PyAutoGUI, AutoHotkey, AppleScript) and bolt it onto the side of the Playwright runner with shell calls. Each step buys some reliability and adds a category of failure: the longer timeouts hide root cause, the OCR drifts on DPI changes and language changes, and the bolted-on framework speaks a different selector grammar so the agent stops being able to reason about both sides as one workflow.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The honest accounting is that any flow that crosses the ceiling more than once is paying compounding maintenance cost on a structural problem. The fix is not to make the workaround better; it is to switch to a tool that does not have a process-boundary problem in the first place. Read at the OS layer. Click at the OS layer. Drop into the DOM only when the page itself is the source of truth.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The price you pay for that switch is one new dependency and one new mental model (selectors as role:role|name:name across processes, not CSS selectors against one document). The price you stop paying is everything in the first checklist above.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-3">
          Try it against a flow that broke for you yesterday
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The fastest way to know whether the ceiling is your actual bottleneck is to take a flow that already broke once on the browser side and re-run it through an MCP-equipped agent. Four steps.
        </p>
        <HorizontalStepper title="Four steps to test the ceiling" steps={installSteps} />
        <p className="text-sm text-zinc-500 mt-4">
          The MCP server speaks to Claude Code, Cursor, VS Code, and Windsurf out of the box. On Windows it ships native UIA support; on macOS it speaks AXUIElement. The same selector grammar works on both. Source at{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-700 underline"
            rel="noopener"
          >
            github.com/mediar-ai/terminator
          </a>
          .
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination={BOOKING_URL}
        site="Terminator"
        section="ceiling-guide-footer"
        heading="Hitting the ceiling on a real workflow?"
        description="Bring a Playwright run that times out at a save dialog or an OAuth handoff. We will diff the failing step against an MCP-equipped agent on a 30-minute call."
      />

      <section className="max-w-4xl mx-auto px-6 mt-16" id="faq">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900 mb-6">
          Questions people land on this page asking
        </h2>
        <FaqSection items={faqs} />
      </section>

      <div className="max-w-4xl mx-auto px-6 mt-16">
        <RelatedPostsGrid title="Related guides" posts={relatedPosts} />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        section="ceiling-guide-sticky"
        description="Walk a broken Playwright flow through Terminator MCP on a 30-min call."
      />
    </article>
  );
}
