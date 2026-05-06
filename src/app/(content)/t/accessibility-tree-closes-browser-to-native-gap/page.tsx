import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  ProofBanner,
  Marquee,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/accessibility-tree-closes-browser-to-native-gap";
const PUBLISHED = "2026-05-06";
const TITLE =
  "Accessibility tree desktop agents: the browser is already a UIA element, that is what closes the gap";
const DESCRIPTION =
  "Desktop agents that drive the OS accessibility tree do not need a separate adapter to reach inside a browser. Chrome is itself a UIA subtree under role:Document. The same role+name selector that walks Notepad's Save dialog walks the page inside a tab, once the agent reconciles devicePixelRatio against the Document element's screen bounds. Source at crates/terminator-mcp-agent/src/server.rs:838.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The browser-to-native gap is a tooling gap, not a semantic one. The OS accessibility tree already contains both surfaces. One selector grammar, one tree, two worlds reconciled by devicePixelRatio against the UIA Document element.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility tree desktop agents: the browser is already a UIA element",
    description:
      "role:Document is the bridge. server.rs:838 anchors the viewport, multiplies DOM rects by devicePixelRatio, and a tree-driven agent crosses from the page to the OS Save dialog without changing tools.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Accessibility tree desktop agents" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Accessibility tree desktop agents", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the accessibility tree, and why do desktop agents read it instead of pixels?",
    a: "Every modern OS exposes a structured tree of every visible UI element so that screen readers and assistive tech can describe a window without reading pixels. On Windows that surface is UI Automation (UIA); on macOS it is AXUIElement; on Linux it is AT-SPI2. Each node carries a role (Button, Edit, MenuItem, Document), a name (Save, Subject, Cancel), enabled and focused state, and a stable bounding rectangle. A desktop agent that reads this tree gets the same description the OS gives a screen reader, in milliseconds, with no inference required. A pixel-driven agent has to reconstruct that same information from a screenshot every step, with a vision model, at thousands of visual tokens per window. The structured path is faster, cheaper, and survives DPI changes and theme changes that break pixel matching.",
  },
  {
    q: "How does this close the gap between browser-only agents and native-app agents?",
    a: "Because the browser itself is a node in the OS accessibility tree. On Windows a Chrome window appears as a UIA element with role:Document underneath the chrome.exe process; on macOS the equivalent AX role exists on the WebKit and Blink content area. The web page inside that document is already exposed as accessibility children that mirror the DOM's accessible nodes. So an agent that speaks role:Button name:Save against the OS tree can walk a native dialog, and an agent that speaks role:Button name:Subscribe against the OS tree can walk the page inside the active tab. There is no second tool, no second selector grammar, no boundary the agent has to be aware of. The tree spans both worlds because the OS already has to span both worlds for assistive tech.",
  },
  {
    q: "If the OS tree already covers the page, why does Terminator also ship a browser extension?",
    a: "Two reasons that come up in real workflows. First, the OS accessibility view of a page is structurally accurate but coarser than the DOM. It does not include CSS attributes, computed styles, the full hierarchy of generic divs, or the pseudo-state of hover and focus rings. Second, in-page JavaScript execution (filling a controlled React input, dispatching a synthetic event, reading shadow DOM) needs a real JS context. The Manifest V3 extension at crates/terminator/browser-extension/manifest.json (version 0.24.32) holds a WebSocket on 127.0.0.1:17373 and gives the agent a way to call execute_browser_script when the structural tree is not enough. The extension is an enrichment over the AX path, not a replacement for it. The agent decides which one to use per call, and the click target lands in the same screen-space coordinate either way.",
  },
  {
    q: "What is the actual coordinate problem when both adapters are live?",
    a: "DOM coordinates and OS coordinates are in different spaces. getBoundingClientRect returns CSS pixels relative to the viewport. UIAutomation returns physical pixels relative to the screen. On a Retina or 4K display window.devicePixelRatio is 2.0 or higher, so a CSS pixel rect at (320, 200) is at (640, 400) in the OS frame, plus the screen offset of the browser viewport. Terminator's capture_browser_dom_elements at crates/terminator-mcp-agent/src/server.rs:838 reconciles them in two steps. It first locates the UIA element with role:Document for the active tab and reads its bounds(); the (x, y) of that element is the viewport offset in screen space. Then for every DOM element it serializes, it multiplies the CSS pixel rect by window.devicePixelRatio (server.rs:911-914). After those two scaling steps a click computed from a DOM rect lands in the same place as a click computed from a UIA element. Without that reconciliation, the agent drifts on every laptop with non-100% scaling.",
  },
  {
    q: "Does this work on macOS and Linux, not just Windows?",
    a: "Yes for the tree itself. AXUIElement on macOS exposes the same role / name / bounds shape, with values like AXButton, AXTextField, AXWindow that map to the same selector grammar Terminator uses on Windows. AT-SPI2 on Linux is consistent for GTK and Qt apps; coverage of Electron and Chromium on Linux varies by distribution. The Manifest V3 browser extension that fills in the in-page enrichment is platform-agnostic because Chrome is the same on all three, but the macOS port of the MCP server has a smaller surface than the Windows build at this point. If you are building a native-only agent on macOS or Linux, the AX path is solid; the cross-OS browser extension path on macOS still has rough edges worth pinging us about before you commit.",
  },
  {
    q: "Where does the accessibility tree fail, and what should an agent do about it?",
    a: "Three concrete failure surfaces. First, fullscreen DirectX, OpenGL, or Metal surfaces (games, some IDE editors, the Figma drawing canvas) have an empty or single-node AX subtree because the app paints pixels directly. Second, sandboxed RDP and VM viewers do not bridge the AX tree across the host boundary; you see one opaque element where the remote screen is. Third, custom-drawn controls in legacy line-of-business apps that never implemented a UIA provider show up as Pane or generic Custom elements with no useful name. The right architecture is to keep the tree as the default path because it is fast and tiny-model-friendly, and stack a vision-grounded fallback for those three cases. Terminator's click_element MCP tool exposes seven grounding modes for exactly this reason; the AX selector path is mode one, the OCR / Omniparser / Gemini / DOM / coordinate paths are the fallbacks.",
  },
  {
    q: "How fast is reading the tree compared to taking a screenshot?",
    a: "On a moderately complex window (a Notepad++ session, an Outlook compose pane, a populated browser tab) the cached UIA subtree fetch in tree_builder.rs:388 with TreeScope::Subtree comes back in tens of milliseconds because the cache pre-fetches every property in one IPC call (ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId at lines 404-412). Walking the same window node-by-node with separate IPC calls is one to two orders of magnitude slower; this is why the cached path exists. A screenshot of the same window costs roughly the same wall time on the capture side, but the perception cost on the model side is many thousands of visual tokens to read versus a few thousand text tokens for the tree. The tree wins on every dimension except the three failure surfaces above.",
  },
  {
    q: "Will agents stop needing screenshots entirely if the tree is this good?",
    a: "No. Vision still wins for fullscreen rendered surfaces, for sanity-checking that the agent is on the right screen at all, and for any task where the visual layout itself is the data (a slide layout, a chart, a design canvas). The right framing is that the accessibility tree is the default tool the agent reaches for, screenshots are the escalation when the tree is silent, and a production agent stack stitches both. The thing this page is arguing against is the symmetric mistake: building a screenshot-only agent for the desktop. That stack burns visual tokens to read text the OS already gave you for free, and it inherits every brittleness of pixel matching across DPI, theme, language, and resolution.",
  },
  {
    q: "I am building a Claude Code or Cursor MCP agent. What is the smallest path to give it OS-level reach?",
    a: "Install the MCP agent: claude mcp add terminator npx -y terminator-mcp-agent@latest. That registers the tool surface (get_window_tree, click_element, type_into_element, press_key, capture_screenshot, execute_browser_script) with your assistant. The defaults connect to the OS UIA / AX tree out of the box; the browser extension is opt-in. From inside Claude Code or Cursor, ask the agent to run get_window_tree on the focused window and inspect the JSON it returns; that is the same input shape any model is going to see. Once you can read the tree, the click and type tools accept role+name selectors directly. Repo at github.com/mediar-ai/terminator, source for everything in this article is in crates/terminator-mcp-agent/src/server.rs.",
  },
];

const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const articleSchemaJson = articleSchema({
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

const sequenceActors = [
  "Agent",
  "MCP server",
  "OS accessibility tree",
  "Browser extension",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "click_element { selector: 'role:Button name:Subscribe' }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "find role:Document for active tab, then descendants",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "UIA Subscribe element, bounds in screen px",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "click landed at (x, y) in screen space",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "click_element { selector: 'role:Button name:Save' }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "same selector grammar, now resolves against the file dialog",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "UIA Save button on the OS Save dialog",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "click landed; agent never knew it crossed a boundary",
    type: "response" as const,
  },
];

const beforeAfter = {
  title: "What happens when the workflow leaves the page",
  before: {
    label: "Browser-only agent (DOM-bound)",
    content:
      "The agent reaches the Subscribe button via document.querySelector. It clicks. The site triggers a download. Chrome opens the OS Save dialog. document.querySelector returns nothing for it. The agent's tool surface goes silent. The next step in the user's workflow lives in a window the agent cannot see. The user has to step in, click Save manually, and hand control back. Every flow that touches a download, a native authenticator, an Open With handler, or an OS notification breaks at this seam.",
    highlights: [
      "tool surface ends at the DOM boundary",
      "downloads, dialogs, authenticators all invisible",
      "user has to step in for any non-page interaction",
      "can't reuse the agent for native-only workflows",
    ],
  },
  after: {
    label: "Tree-driven agent (OS-bound)",
    content:
      "The agent reaches the Subscribe button via role:Button name:Subscribe against the OS UIA tree. The browser viewport is a UIA Document under chrome.exe, and the page's accessibility children are right there. It clicks. The site triggers a download. Chrome opens the OS Save dialog. The Save dialog is also a UIA subtree, also exposing role:Button name:Save. The same selector grammar resolves it. The agent never knew it crossed a boundary because there is no boundary in the tree, only in the implementation that ignored half of it.",
    highlights: [
      "one selector grammar, two worlds",
      "Save / Print / Open With dialogs are reachable",
      "page elements and OS elements use the same tool",
      "browser is detected as a process and kept distinct only for performance, not for tooling",
    ],
  },
};

const treeFitItems = [
  {
    text: "Native Win32, WinUI, UWP apps: tree is the right default; cached subtree fetch returns in tens of ms",
  },
  {
    text: "Browser tabs (Chrome, Edge, Firefox, Brave, Arc, Vivaldi, Opera): tree reaches the page through role:Document under the browser process",
  },
  {
    text: "Electron and Office apps: tree covers most controls; an Office canvas needs the in-page enrichment for cells and shapes",
  },
  {
    text: "OS dialogs (Save, Open, Print, credentials, OAuth consent): tree wins outright; this is exactly what assistive tech is built for",
  },
  {
    text: "macOS AppKit, SwiftUI: AXUIElement returns the same role / name shape on the same selector grammar",
  },
  {
    text: "Fullscreen DirectX, OpenGL, Metal surfaces: tree is empty by design; vision is the only path",
  },
  {
    text: "Canvas drawing tools (Figma surface, Excalidraw, Miro board): one opaque canvas in the tree, vision fallback required",
  },
  {
    text: "Sandboxed RDP and VM viewers: AX tree does not cross the host boundary; vision fallback required",
  },
];

const stepperSteps: StepperStep[] = [
  {
    title: "Read",
    description:
      "get_window_tree returns the cached UIA / AX subtree for the focused process as JSON: role, name, bounds, focus state for every element",
  },
  {
    title: "Match",
    description:
      "Selector grammar resolves role:Button && name:Save against the tree; same grammar works in a native dialog or inside a browser tab",
  },
  {
    title: "Act",
    description:
      "click_element invokes the platform action (UIInvokePattern on Windows, AXPress on macOS); no synthetic mouse input, no coordinate guessing",
  },
];

const browserSurfaces = [
  "chrome.exe",
  "msedge.exe",
  "firefox.exe",
  "brave.exe",
  "arc.exe",
  "vivaldi.exe",
  "opera.exe",
  "iexplore.exe",
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Browser agents leaving the DOM: where the tool surface ends, and what to do about it",
    excerpt:
      "Companion piece focused on the implementation: the Manifest V3 extension on ws://127.0.0.1:17373, the coordinate reconciliation, and how the same MCP tool dispatches across both adapters.",
    href: "/t/browser-agents-leaving-the-dom",
    tag: "Browser bridge",
  },
  {
    title:
      "Local AI for native apps: a 1B model drives the desktop because the accessibility tree is text, not pixels",
    excerpt:
      "Why structured AX-tree text beats screenshots for tiny local models. gemma3:1b on Ollama, four files of Rust, the filter step that makes it work.",
    href: "/t/local-ai-accessibility-tree-native-apps",
    tag: "Local AI",
  },
  {
    title:
      "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "Tree-driven click invokes UIInvokePattern through COM. PyAutoGUI drives SendInput. Different syscalls, different brittleness profiles, side by side in the source.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Tree vs pixels",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchemaJson),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Accessibility tree desktop agents:{" "}
            <span className="text-orange-600">
              the browser is already a UIA element, that is what closes the
              gap
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
            The most common framing of accessibility-tree agents treats the
            tree as a substitute for the DOM, useful when the workflow leaves
            the browser. That undersells it. The tree is a superset. Every
            running browser is itself a node in the OS accessibility tree,
            and the page inside the tab is exposed as accessibility children
            of a{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              role:Document
            </code>{" "}
            element under the browser process. One selector grammar reaches
            both worlds. The browser-to-native gap is a tooling gap, not a
            semantic one.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIAutomation
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              AXUIElement
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              role:Document
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MCP
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              devicePixelRatio
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />

        <div className="max-w-3xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-06)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">
                Desktop agents use the accessibility tree by walking the OS
                surface a screen reader walks: UIAutomation on Windows,
                AXUIElement on macOS, AT-SPI2 on Linux.
              </strong>{" "}
              They address elements by role + name selectors (
              <code className="font-mono text-[0.95em]">
                role:Button name:Save
              </code>
              ) instead of pixel coordinates, and they call platform actions
              (
              <code className="font-mono text-[0.95em]">UIInvokePattern</code>{" "}
              on Windows,{" "}
              <code className="font-mono text-[0.95em]">AXPress</code> on
              macOS) instead of synthesizing mouse input. Because every
              running browser is itself a UIA / AX subtree, the same grammar
              also reaches the page inside an active tab.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Reference implementation is open source. Browser process list at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/applications.rs"
                className="text-orange-700 underline underline-offset-2"
              >
                applications.rs:53
              </a>
              , viewport reconciliation at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
                className="text-orange-700 underline underline-offset-2"
              >
                server.rs:838
              </a>
              , cached subtree fetch at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/tree_builder.rs"
                className="text-orange-700 underline underline-offset-2"
              >
                tree_builder.rs:388
              </a>
              .
            </p>
          </div>
        </div>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The thesis: the OS already merged the two worlds
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A blind user opens a Chrome tab and a screen reader announces the
            page heading, the buttons, the form fields. That same user
            triggers a download and the screen reader announces the OS Save
            dialog without missing a beat. There is no &quot;browser
            adapter&quot; and &quot;OS adapter&quot; on the assistive-tech
            side. There is one tree. Microsoft has spent two decades making
            sure browsers expose their content into UIA so that screen
            readers work; the side effect is that any tool that reads UIA
            already has structural reach into every page rendered by every
            shipping browser. The same is true of AXUIElement on macOS.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What is &quot;new&quot; is treating that tree as the default
            input for an agent rather than for a screen reader. The
            screen-reader use case reads; the agent use case reads and
            writes. The grammar is the same: address an element by role and
            name, then invoke an action that the platform exposes. The
            implementation is the same: walk a tree of UIA / AX elements,
            match a selector, dispatch through{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              UIInvokePattern.invoke
            </code>{" "}
            (Windows) or{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              AXUIElementPerformAction
            </code>{" "}
            (macOS).
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What an agent actually does, end to end
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three steps, repeated for every action. The shape is the same on
            a Notepad Save dialog as it is on a button inside a Gmail
            composer.
          </p>
          <HorizontalStepper
            title="how a tree-driven action resolves"
            steps={stepperSteps}
            current={2}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The selector grammar does not change at the boundary
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Watch a single agent task cross from inside a browser tab into
            the OS Save dialog. The tool calls are identical. Only the
            element that resolves on the other side is different.
          </p>
          <SequenceDiagram
            title="One selector grammar, page side and OS side"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The agent never branches on &quot;am I in the browser or out of
            it.&quot; That decision is below the API. Internally, Terminator
            detects browser processes by name (
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              chrome
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              msedge
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              firefox
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              brave
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              arc
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              vivaldi
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              opera
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              iexplore
            </code>
            , at{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/applications.rs"
              className="text-orange-700 underline underline-offset-2"
            >
              applications.rs:53
            </a>
            ) and routes those PIDs through a slightly different lookup path
            for performance, but the selector grammar exposed to the agent
            stays the same.
          </p>
        </section>

        <section className="max-w-5xl mx-auto px-6 my-10">
          <Marquee speed={28} pauseOnHover fade>
            {browserSurfaces.map((name) => (
              <div
                key={name}
                className="mx-3 px-5 py-3 rounded-xl border border-zinc-200 bg-white text-zinc-700 font-mono text-sm whitespace-nowrap"
              >
                {name}
                <span className="ml-3 text-xs text-orange-600">
                  role:Document
                </span>
              </div>
            ))}
          </Marquee>
          <p className="mt-3 text-center text-xs text-zinc-500">
            Every browser process Terminator recognizes as a tab host. The
            page inside lives under{" "}
            <code className="font-mono">role:Document</code> in the OS tree.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What this looks like when the workflow leaves the page
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the case that breaks browser-only agents and works
            cleanly for tree-driven ones. The user clicks something, a
            download starts, the OS Save dialog opens, the agent picks a
            location, the file lands on disk, the next app opens it. None of
            those steps require a different tool surface.
          </p>
          <BeforeAfter
            title={beforeAfter.title}
            before={beforeAfter.before}
            after={beforeAfter.after}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The reconciliation step nobody mentions: viewport offset times
            devicePixelRatio
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the anchor fact most articles on this topic skip past.
            DOM coordinates are CSS pixels relative to the viewport. UIA
            coordinates are physical pixels relative to the screen. On a
            Retina or 4K display these are not even close to each other.
            Without an explicit reconciliation, a click computed from a DOM
            rect lands hundreds of pixels off where it should.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              capture_browser_dom_elements
            </code>{" "}
            at{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
              className="text-orange-700 underline underline-offset-2"
            >
              server.rs:838
            </a>{" "}
            does it in two steps. First it locates the UIA element with{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              role:Document
            </code>{" "}
            for the active tab and reads its bounds; the (x, y) of that
            element is the viewport offset in screen space. Second, for
            every DOM element it serializes, it multiplies the
            getBoundingClientRect values by{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              window.devicePixelRatio
            </code>{" "}
            (lines 911 to 914 of the same file). After both scaling steps,
            DOM-derived coordinates and UIA-derived coordinates are in the
            same frame. A click works the same regardless of which side
            produced the rect.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Document-element lookup matters more than it looks. You
            cannot derive the viewport offset from JavaScript window
            properties because{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              window.screenX
            </code>{" "}
            and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              window.screenY
            </code>{" "}
            silently drift on multi-monitor setups with non-uniform DPI
            scaling. The OS tree gives you the truth: the UIA Document
            element&apos;s screen bounds. Anchor there, scale by DPR,
            forget the rest.
          </p>
        </section>

        <ProofBanner
          quote="The accessibility tree is not a fallback for the DOM. It is the surface that contains it."
          source="Source: Terminator core, applications.rs and server.rs"
          metric="1 selector grammar"
        />

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Where the tree wins, and where it does not
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest list. Worth memorizing before you build an agent on
            top of this stack, because the failures are predictable and you
            want to know which third tool to plug in for them.
          </p>
          <AnimatedChecklist
            title="Tree fit, surface by surface"
            items={treeFitItems}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The pattern is simple. Anything that the OS itself describes
            structurally to a screen reader, the tree covers. Anything that
            paints pixels directly past the OS compositor (a game frame, a
            VM viewer, a custom-drawn legacy control) requires vision. A
            production agent stack uses the tree as the default and falls
            through to OCR, Omniparser, Gemini, or coordinates as a
            second-class path when the tree returns nothing useful. Reaching
            for vision first is the wasteful loop, not the other way around.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Why the cached subtree fetch matters more than people think
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The default UIA traversal walks one node at a time, with one
            cross-process IPC call per property per node. On a populated
            window that adds up to thousands of round trips, and the tree
            takes seconds to return. That latency is most of why people
            stop using UIA and reach for screenshots; the tree is fine, the
            naive traversal is the problem.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The fix lives at{" "}
            <a
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/tree_builder.rs"
              className="text-orange-700 underline underline-offset-2"
            >
              tree_builder.rs:388
            </a>
            . Build a UIA{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              CacheRequest
            </code>{" "}
            with the seven properties an agent actually needs (
            <code className="font-mono text-[0.95em]">ControlType</code>,{" "}
            <code className="font-mono text-[0.95em]">Name</code>,{" "}
            <code className="font-mono text-[0.95em]">
              BoundingRectangle
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em]">IsEnabled</code>,{" "}
            <code className="font-mono text-[0.95em]">
              IsKeyboardFocusable
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em]">
              HasKeyboardFocus
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em]">AutomationId</code>),
            set tree scope to{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              TreeScope::Subtree
            </code>
            , and fetch the whole subtree in one IPC call. After that,
            building the tree structure is a pure-Rust walk over cached
            properties, no further cross-process calls. Same tree, two
            orders of magnitude faster on windows of typical complexity.
            That is the difference between &quot;agent can do this&quot;
            and &quot;agent in theory could but no one would actually use
            it.&quot;
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building an agent that needs to cross the browser-to-native boundary?"
          description="If you are wiring a tree-driven agent and want a second pair of eyes on the selector grammar, the viewport reconciliation, or the cached subtree path, send a calendar invite."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Related guides"
            subtitle="Companion deep dives on the tree, the boundary, and the local-model angle"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Wiring a tree-driven agent across browser and OS? Walk through it with us."
      />
    </>
  );
}
