import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/computer-use-everyday-flow-modal-failure";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-11";
const TITLE =
  "Everyday computer-use modal failure mode: the OS already labels modals, vision agents don't read the label";
const DESCRIPTION =
  "The single most common failure for pixel-loop computer-use agents (Claude's computer_20251022, Gemini Computer Use, OpenAI CUA) is the everyday modal: a save prompt, a permissions sheet, a cookie banner. The OS already names it as a modal via the UIA IsDialog property (Windows 10 1809+). Pixel agents are blind to that bit. Terminator reads it. The selector is role:Dialog.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Pixel-loop computer-use agents fail on save prompts, consent sheets, and cookie banners because they can't read the OS-level IsDialog bit. Tree-walking agents can. Here is the bit, the file, and the line.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Everyday computer-use modal failure: the bit pixel agents can't see",
    description:
      "Windows UIA exposes IsDialog (since build 17763). Vision agents only see pixels. A modal looks like a dimmed background. Tree-walking agents read role:Dialog directly.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Everyday modal failure mode" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Everyday modal failure mode", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"everyday computer-use modal failure mode\" actually mean?",
    a: "A computer-use agent is mid-task. Something modal pops up: a save prompt, a permissions sheet, a cookie banner, an unsaved-changes confirmation, a Windows UAC prompt, a browser autofill suggestion, a JavaScript alert(). Anything that interrupts the foreground task. A vision-driven agent looking at a screenshot sees overlapping pixels. It does not see a semantic interrupt. It may keep clicking against the dimmed UI underneath, may guess at the primary button, may report the task as done because the next screenshot looks plausible. The agent is technically following its plan; the OS has already changed the rules and the agent never heard the change.",
  },
  {
    q: "Doesn't a smart enough vision model just learn to recognize modals?",
    a: "Sometimes. Anthropic's own computer-use docs note that 'error rates are higher with dynamically changing interfaces, pop-up dialogs, and complex multi-step authentication processes' and recommend you ask the model to 'press Enter or click the primary button' as a workaround. That is a prompt-engineering bandage, not a primitive. It does not survive (a) modals whose primary button is destructive (Discard), (b) modals where the primary button is below the fold on a narrow viewport, (c) modals stacked on top of other modals, or (d) modals on second monitors the agent isn't currently screenshotting. The OS has a one-bit answer to all of these; the agent is choosing not to read it.",
  },
  {
    q: "What is the IsDialog property, exactly?",
    a: "UI Automation exposes a per-element boolean property called IsDialog. When true, the element is semantically a modal dialog; assistive technologies use it to change how they announce the element. Microsoft introduced it in Windows 10 build 10.0.17763.0 (October 2018, the 1809 release). XAML controls Flyout and ContentDialog default to IsDialog=true. Terminator's selector engine maps the string 'IsDialog' onto UIProperty::IsDialog at crates/terminator/src/platforms/windows/utils.rs line 189, which means you can write the bit into a selector and Terminator will resolve it through the same COM call the screen-reader uses.",
  },
  {
    q: "How does Terminator handle a modal in practice?",
    a: "Two patterns. Defensive: at the top of every action, run desktop.locator('role:Dialog').validate(1000) and dismiss whatever you find before continuing. Reactive: catch ElementNotFoundError on your real target, then check for a Dialog, dismiss it, retry. Both are three lines of code, both work because role:Dialog resolves via UIA's class-name list plus the IsDialog property. The dismiss is usually a wait_for_element on role:Button && (name:OK || name:Cancel || name:Save || name:Discard) inside the Dialog. The whole loop happens in single-digit milliseconds, with no model call and no screenshot.",
  },
  {
    q: "Why don't pixel-loop agents just call the same API?",
    a: "They can. They mostly don't. The Anthropic computer_20251022 tool ships with screenshot + click(x,y) + type and nothing else; the model never receives the accessibility tree as a tool result. Gemini Computer Use is the same shape. OpenAI's CUA is the same shape. The whole bet is that the model is the ontology, so the harness stays minimal. Terminator's bet is the opposite: the OS already publishes the ontology (IsDialog, ControlType, AutomationId, Name), so the harness should expose it and let the model spend tokens on planning, not on pixel-reading. The MCP server exposes 35 selector-based tools for this reason.",
  },
  {
    q: "Does this only apply to Windows?",
    a: "The IsDialog property is Windows UIA specifically. macOS exposes the same semantics through a different shape: AXSheet for app-modal sheets, AXWindow with AXSubrole=kAXDialogSubrole for free-floating dialogs, AXAlert for alert panels. AT-SPI on Linux uses the role ROLE_DIALOG plus the modal state. The selector idea is the same in every case: you ask the OS what is on screen by structural role, not by pixel pattern. Terminator's selector grammar normalizes role:Dialog across platforms; the Windows backend resolves it via IsDialog and class-name fallback, the macOS backend resolves via AXSubrole and AXRole.",
  },
  {
    q: "Which everyday modals does this catch?",
    a: "The boring ones, which is the point. Save changes before closing. Windows UAC consent. macOS permission prompts (Files and Folders, Screen Recording, Accessibility). Cookie banner overlays in Chromium. Browser autofill drop-downs. The Are-you-still-watching prompt on streaming sites. The unsaved-form confirmation Chrome shows on tab close. The Word document-recovery panel. Slack's join-call notification. Almost every productivity app has 3 to 6 of these. A real desktop session probably crosses 10 modals per hour for an active user. A computer-use agent driving the same session crosses the same 10 modals, and every one is a chance to fail silently.",
  },
  {
    q: "What's the proof Terminator's selector actually resolves IsDialog and not just classnames?",
    a: "Two files. crates/terminator/src/platforms/windows/utils.rs line 189 maps the string 'IsDialog' to UIProperty::IsDialog, which is the Windows UIA enum entry that asks for UIA_IsDialogPropertyId. crates/terminator/src/platforms/windows/tree_builder.rs line 323 branches on 'Window' or 'Dialog' for container elements when loading smart attributes. The role:Dialog selector resolves through these two paths together: the tree builder identifies dialog containers, the property lookup confirms IsDialog=true. The Microsoft docs page for AutomationProperties.IsDialog confirms the property was introduced in Windows 10 version 1809 (build 10.0.17763.0) and that Flyout and ContentDialog default to true.",
  },
  {
    q: "What if the modal is a legacy Win32 message box, not a XAML ContentDialog?",
    a: "Same outcome, different path. The legacy MessageBox API produces a window with class name #32770, which UIA already knows to label as a dialog before IsDialog existed as a property. Terminator's tree builder treats Window and Dialog the same way at tree_builder.rs line 323. The role:Dialog selector matches both. The IsDialog property is the modern path; the class-name list is the fallback. Both produce a true value for role:Dialog at the selector layer, so your dismissal logic doesn't need to know which path matched.",
  },
  {
    q: "Where do I start if I want to wire this into my own agent?",
    a: "Install Terminator's MCP server: claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. Then teach your agent one defensive step: before every action, call validate_element with role:Dialog and a one-second timeout. If it resolves, get the dialog's children, find the Button you want, click_element on it, then retry the original action. The whole loop is four MCP calls and zero screenshots. The Terminator repo at github.com/mediar-ai/terminator ships examples that do this for the most common modal classes.",
  },
];

const sequenceActors = [
  "User",
  "Agent harness",
  "Vision model",
  "Desktop",
];

const sequenceMessages = [
  { from: 0, to: 1, label: "Save the spreadsheet", type: "request" as const },
  { from: 1, to: 3, label: "screenshot()", type: "request" as const },
  { from: 3, to: 1, label: "PNG of Excel", type: "response" as const },
  { from: 1, to: 2, label: "screenshot + goal", type: "request" as const },
  { from: 2, to: 1, label: "click(412, 38) // File menu", type: "response" as const },
  { from: 1, to: 3, label: "SendInput at (412,38)", type: "event" as const },
  { from: 3, to: 1, label: "modal appears: 'Save as .xlsx?'", type: "event" as const },
  { from: 1, to: 3, label: "screenshot()", type: "request" as const },
  { from: 3, to: 1, label: "PNG with dimmed background", type: "response" as const },
  { from: 1, to: 2, label: "screenshot + goal", type: "request" as const },
  { from: 2, to: 1, label: "click(556, 412) // wrong: dimmed UI under modal", type: "error" as const },
  { from: 1, to: 3, label: "SendInput at (556,412)", type: "event" as const },
  { from: 3, to: 1, label: "click absorbed by modal overlay, no effect", type: "error" as const },
  { from: 1, to: 0, label: "task complete (it isn't)", type: "error" as const },
];

const treeSequenceActors = [
  "User",
  "Agent harness",
  "MCP / Terminator",
  "Desktop",
];

const treeSequenceMessages = [
  { from: 0, to: 1, label: "Save the spreadsheet", type: "request" as const },
  { from: 1, to: 2, label: "validate role:Dialog (1s timeout)", type: "request" as const },
  { from: 2, to: 3, label: "UIA: GetPropertyValue(IsDialog) on top-level windows", type: "request" as const },
  { from: 3, to: 2, label: "no dialog present", type: "response" as const },
  { from: 2, to: 1, label: "{exists: false}", type: "response" as const },
  { from: 1, to: 2, label: "click_element role:MenuItem && name:Save", type: "request" as const },
  { from: 2, to: 3, label: "UIInvokePattern.invoke()", type: "request" as const },
  { from: 3, to: 2, label: "modal appears: 'Save as .xlsx?'", type: "event" as const },
  { from: 1, to: 2, label: "validate role:Dialog (1s timeout)", type: "request" as const },
  { from: 2, to: 3, label: "UIA: IsDialog=true on element 0x4f9c", type: "response" as const },
  { from: 2, to: 1, label: "{exists: true, name: 'Save as'}", type: "response" as const },
  { from: 1, to: 2, label: "click_element role:Button && name:Save inside dialog", type: "request" as const },
  { from: 2, to: 3, label: "UIInvokePattern.invoke()", type: "response" as const },
  { from: 2, to: 1, label: "ok", type: "response" as const },
];

const everydayModals = [
  { text: "Save changes before closing? (every editor on every OS, every day)" },
  { text: "Windows UAC consent prompt for elevation" },
  { text: "macOS permission sheet: Screen Recording, Accessibility, Files and Folders" },
  { text: "Cookie banner overlay on a Chromium tab (first-party, third-party, both)" },
  { text: "Browser autofill drop-down covering the next form field" },
  { text: "Streaming service Are-you-still-watching prompt" },
  { text: "Slack join-call modal slid in from the right" },
  { text: "Word's document-recovery side panel on first open after crash" },
  { text: "Chrome unsaved-form confirmation on tab close" },
  { text: "JavaScript alert() and confirm() in any web app" },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Claude computer use: the pixel-coordinate loop and the selector alternative",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer-use tool sends a screenshot per click. Terminator's MCP lets Claude click by role and name resolved against the UIA tree.",
    tag: "Comparison",
  },
  {
    title:
      "Accessibility tree vs PyAutoGUI: two clicks, two operations, two failure modes",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Pattern invoke() runs inside the target process. SendInput synthesizes HID events. The difference shows up the first time a modal appears.",
    tag: "Internals",
  },
  {
    title:
      "Accessibility-tree desktop agents: closing the browser-to-native gap",
    href: "/t/accessibility-tree-closes-browser-to-native-gap",
    excerpt:
      "Playwright reads the DOM. Terminator reads the OS UIA / AX tree, including modals the DOM never knew about.",
    tag: "Architecture",
  },
  {
    title: "Open-source computer-use agent SDK: where the tree fits",
    href: "/t/open-source-computer-use-agent-sdk",
    excerpt:
      "An SDK that lets your agent ask the OS for the structure on screen, not the pixels.",
    tag: "SDK",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbListSchema(breadcrumbSchemaItems)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />

          <div className="mt-8 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            <span>failure mode #1</span>
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            The everyday computer-use modal failure mode.
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            A save prompt slides up. A consent sheet appears. A cookie banner
            covers the field. Your computer-use agent keeps clicking. The OS
            already labelled that overlay as modal. The agent never read the
            label.
          </p>

          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            This is the single most common way pixel-driven agents fall over on
            real desktop work. Not jailbreaks. Not hallucinations. Not stuck
            CAPTCHAs. The boring overlay on Tuesday morning.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIA_IsDialogPropertyId
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              role:Dialog
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              Windows 10 build 17763+
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="7 min read"
        />

        <section className="max-w-3xl mx-auto px-6 mt-10">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 md:p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
              Direct answer (verified 2026-05-11)
            </p>
            <p className="text-lg text-zinc-900 leading-relaxed">
              Vision-driven agents only see pixels. The operating system
              already names modals via the UIA{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                IsDialog
              </code>{" "}
              property (Windows 10 build 10.0.17763.0 onwards). A pixel-loop
              agent can&apos;t read that bit, so a save prompt looks like
              overlapping pixels instead of a modal interrupt. A tree-walking
              agent like Terminator reads it directly and lets you write{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                role:Dialog
              </code>{" "}
              as a selector.
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Authoritative source:{" "}
              <a
                href="https://learn.microsoft.com/en-us/uwp/api/windows.ui.xaml.automation.automationproperties.isdialog"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                AutomationProperties.IsDialog on Microsoft Learn
              </a>
              . Wired into Terminator at{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/utils.rs"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                crates/terminator/src/platforms/windows/utils.rs
              </a>{" "}
              line 189.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What this looks like in real footage
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Picture Excel. Your agent is told to save the file. It opens the
            File menu, the model picks coordinates, the harness clicks. The
            dialog comes up:{" "}
            <span className="font-medium text-zinc-900">
              &ldquo;Save as .xlsx or keep .csv?&rdquo;
            </span>{" "}
            The dialog dims the spreadsheet behind it. The agent takes a fresh
            screenshot and ships it back to the vision model. The model returns
            click coordinates. Sometimes the coordinates land on a button on
            the dialog. Often, they don&apos;t, because the model hasn&apos;t
            learned that the dim layer means &ldquo;ignore me&rdquo;. The click
            absorbs against the modal overlay. The harness takes another
            screenshot. The screen looks the same. The agent reports success.
            The file was never saved.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is one trace. Multiply by ten modals per hour for an active
            desktop session and the failure mode is the rate-limiting step on
            every long-running agent.
          </p>

          <SequenceDiagram
            title="Pixel-loop trace: a modal swallows the click"
            actors={sequenceActors}
            messages={sequenceMessages}
          />

          <p className="mt-2 text-sm text-zinc-500">
            Every red line is a turn where the agent had no signal that
            something modal was on screen. The vision model is doing its job;
            the harness just never told it the foreground became
            uninteractable.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The bit the OS already publishes
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Microsoft added a single boolean to the UI Automation property set
            in Windows 10 version 1809 (build 10.0.17763.0, October 2018):{" "}
            <code className="font-mono text-[0.95em] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200">
              UIA_IsDialogPropertyId
            </code>
            . When true, the element is semantically modal. Screen readers use
            this bit to change how they announce: title, focused control,
            content up to focused control. XAML&apos;s{" "}
            <code className="font-mono text-zinc-800">Flyout</code> and{" "}
            <code className="font-mono text-zinc-800">ContentDialog</code>{" "}
            default it to true. Win32 message boxes (class{" "}
            <code className="font-mono text-zinc-800">#32770</code>) hit a
            class-name fallback in every UIA client and are treated as dialogs
            even when the property is absent.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s selector engine wires this directly into the
            grammar. The string{" "}
            <code className="font-mono text-zinc-800">&quot;IsDialog&quot;</code>{" "}
            is mapped to{" "}
            <code className="font-mono text-zinc-800">UIProperty::IsDialog</code>{" "}
            at this exact line:
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>
                crates/terminator/src/platforms/windows/utils.rs &nbsp;line 189
              </span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`pub(crate) fn string_to_ui_property(key: &str) -> Option<UIProperty> {
    match key {
        // ...
        "IsControlElement"   => Some(UIProperty::IsControlElement),
        "IsRequiredForForm"  => Some(UIProperty::IsRequiredForForm),
        "IsDialog"           => Some(UIProperty::IsDialog),   // <- line 189
        // ...
    }
}`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            The tree builder treats{" "}
            <code className="font-mono text-zinc-800">Window</code> and{" "}
            <code className="font-mono text-zinc-800">Dialog</code> as the same
            container kind at{" "}
            <code className="font-mono text-zinc-800">
              tree_builder.rs:323
            </code>
            , so the selector{" "}
            <code className="font-mono text-zinc-800">role:Dialog</code>{" "}
            resolves against the IsDialog-marked subtree and the legacy
            class-name path in one shot. You write the bit; Terminator does the
            COM call.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Same task, two loops
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Toggle the tabs below. Same task: save a spreadsheet. The
            difference between the loops is one validation step that costs
            roughly a millisecond and zero model tokens.
          </p>

          <BeforeAfter
            before={{
              label: "Pixel-loop computer use",
              content:
                "Screenshot the desktop. Ship the PNG to the vision model. Receive click coordinates. SendInput at those coordinates. Screenshot again. If a modal appeared the previous click might have missed; the model is now staring at a dimmed spreadsheet with an overlay and has to decide on its own whether the overlay is the new target. Most modern vision models guess right most of the time; the failure rate compounds across long sessions because every screenshot costs an Anthropic round-trip plus model inference, and the agent has no primitive that says 'a modal is up, deal with it first'.",
              highlights: [
                "no signal from OS that a modal exists",
                "every modal check costs a screenshot and a model call",
                "destructive defaults (Discard, Delete) are guessed at",
                "silent failure: next screenshot looks plausible, agent reports done",
              ],
            }}
            after={{
              label: "Tree-walking with role:Dialog",
              content:
                "Before every action, call validate(role:Dialog, 1s). If a dialog exists, get its children, find the Button by role + name, invoke it, retry the original action. The validation cost is a UIA round-trip into the foreground process, single-digit milliseconds. The dismissal logic is three lines. The agent never has to recognize modals from pixels because the OS just told it. Stacked modals work the same way; the validation returns the topmost dialog each time and you peel them in order.",
              highlights: [
                "OS publishes IsDialog; agent reads it directly",
                "no model in the inner loop; CPU-speed, not inference-speed",
                "stacked modals peel in order via repeated validate()",
                "destructive defaults are named (Discard vs Save), not guessed",
              ],
            }}
          />

          <SequenceDiagram
            title="Tree-walking trace: the modal is named, not guessed"
            actors={treeSequenceActors}
            messages={treeSequenceMessages}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The three lines that handle a modal
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the entire pattern, in TypeScript against the Terminator
            Node binding. Drop it before any action that touches an app you
            don&apos;t fully own.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>dismiss-modal.ts</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`import { Desktop } from "terminator.js";

const desktop = new Desktop();

// Before any action: did a modal appear since last frame?
const dialog = await desktop.locator("role:Dialog").validate(1000);
if (dialog.exists) {
  // Inside the dialog, find a Button whose name maps to "continue task"
  // (your call: Save, OK, Allow, Yes, Continue, Got it).
  const ok = await dialog.element!
    .locator("role:Button && (name:Save || name:OK || name:Allow)")
    .first(2000);
  await ok.invoke();
}

// Now do whatever you were trying to do.
await desktop
  .locator("process:excel >> role:MenuItem && name:Save")
  .first(3000)
  .then((el) => el.invoke());`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three things to note. First,{" "}
            <code className="font-mono text-zinc-800">validate()</code> does
            not throw on absence; it returns{" "}
            <code className="font-mono text-zinc-800">
              {"{ exists: false }"}
            </code>
            . That keeps the happy path branchless. Second,{" "}
            <code className="font-mono text-zinc-800">invoke()</code> on a
            UIA{" "}
            <code className="font-mono text-zinc-800">UIInvokePattern</code>{" "}
            runs inside the target process. Your cursor stays where it is. You
            can keep typing in another window while the agent works. Third, the
            same selector grammar works for Win32 MessageBox, XAML
            ContentDialog, WPF dialogs, WinForms, and most Electron sheets
            because all of them advertise themselves through UIA.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What &ldquo;everyday&rdquo; actually covers
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            When people say computer-use agents work on benchmarks but fall
            over in production, this is usually what they mean. Benchmarks
            don&apos;t have a Tuesday-morning permission sheet on the second
            screen. Real desktops do, every hour. Here is the list a long
            session crosses:
          </p>

          <AnimatedChecklist
            title="The boring modals an agent meets every hour"
            items={everydayModals}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of these are interesting. All of them break a pixel-loop
            agent. All of them resolve through{" "}
            <code className="font-mono text-zinc-800">role:Dialog</code>{" "}
            (Windows UIA), AXSheet / AXAlert / kAXDialogSubrole (macOS AX), or
            ROLE_DIALOG (AT-SPI on Linux). Same selector idea, three different
            OS backends, one harness primitive that the vision-loop crowd has
            chosen not to ship.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why pixel-loop agents keep skipping the bit
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The argument for vision-only is real: pixels work on{" "}
            <em>everything</em>, including apps that don&apos;t expose
            accessibility data, including games, including the sandbox of a
            remote VM. The argument against is that on the 95% of everyday
            desktop apps that <em>do</em> publish a UIA / AX tree, the harness
            is leaving a free signal on the table. The OS already paid the cost
            of marking modals; the agent is paying it again at the model
            layer, in tokens and screenshots.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic&apos;s own docs admit it indirectly: the fix for the
            everyday modal failure is to nudge the model with text (&ldquo;ask
            Claude to press Enter or click the primary button&rdquo;). That
            works until the primary button is destructive, the modal is
            stacked, or the prompt is on a monitor the agent isn&apos;t
            currently looking at. None of those edges exist for a tree-walking
            agent because{" "}
            <code className="font-mono text-zinc-800">role:Dialog</code>{" "}
            traverses every desktop, every monitor, every top-level window,
            and returns the modals by structural role, not by which pixels are
            currently on screen.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&apos;s bet is that the right shape is to expose the OS
            primitives directly through an MCP server and let the model spend
            its inference budget on planning. The model picks what to do; the
            framework resolves the selector; the action runs as a COM call
            inside the target process. The everyday modal becomes a four-call
            MCP loop instead of a three-screenshot Anthropic round-trip.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16 mb-6">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            section="modal-failure-footer"
            heading="Ship an agent that doesn't lose to the everyday modal."
            description="If you're building a computer-use agent that has to survive real desktop sessions, the modal handling is the part nobody benchmarks. Bring a target app, we'll walk through how Terminator's role:Dialog primitive plugs into your loop."
          />
        </section>

        <FaqSection items={faqs} />

        <section className="max-w-3xl mx-auto px-6 my-12">
          <RelatedPostsGrid
            title="Adjacent reading"
            subtitle="On the same shape"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination={BOOKING_URL}
          site="Terminator"
          section="modal-failure-sticky"
          description="Brittle modal handling killing your agent loop? Talk it through."
        />
      </article>
    </>
  );
}
