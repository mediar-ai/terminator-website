import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedChecklist,
  AnimatedMetric,
  BeforeAfter,
  HorizontalStepper,
  InlineTestimonial,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/terminator-software";
const PUBLISHED = "2026-05-24";
const TITLE =
  "Terminator software: a developer framework for driving any desktop app, not a Linux terminal emulator";
const DESCRIPTION =
  "Terminator software is an open source desktop automation framework for Windows and macOS. It drives native apps through accessibility APIs, ships as a Rust crate, npm package, Python package, and MCP server, and is published at github.com/mediar-ai/terminator. Not to be confused with the older Linux terminal emulator of the same name.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Open source desktop automation framework. Like Playwright but for your whole OS. Drives Windows and macOS apps through native accessibility APIs. MIT licensed, MCP-ready.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator software, the desktop automation framework",
    description:
      "A Rust + Python + MCP framework for driving any app on Windows and macOS through native accessibility APIs. Not the Linux terminal emulator.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Terminator software" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Terminator software", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is Terminator software?",
    a: "Terminator is an open source desktop automation framework for Windows and macOS, distributed at github.com/mediar-ai/terminator. It drives any native application (Excel, Outlook, SAP, File Explorer, internal WPF tools, browsers, anything with a UI) through the operating system's accessibility layer: UI Automation on Windows and AXUIElement on macOS. The API is intentionally shaped like Playwright, but the target is the entire OS, not just the browser. It ships as a Rust crate (terminator-rs), a Python package, an npm CLI, and an MCP server that lets AI coding assistants like Claude Code, Cursor, VS Code, and Windsurf control real apps.",
  },
  {
    q: "Is this the same as the Linux terminal emulator named Terminator?",
    a: "No. There is an older Linux project named Terminator that is a terminal emulator (multi-pane terminals for GNOME, written in Python, packaged in most distros). It has nothing to do with this project. This Terminator is a desktop automation framework. The name collision exists because both projects predate each other in different ecosystems. If you arrived here looking for the terminal emulator, you want the project at github.com/gnome-terminator/terminator instead. If you want the desktop automation framework, you are in the right place.",
  },
  {
    q: "How is this different from PyAutoGUI, AutoHotkey, or pixel-matching tools?",
    a: "PyAutoGUI and AutoHotkey identify elements by screen position or image matching. Both break the moment a window moves, the OS scales the display, the theme changes, or someone updates the app and the icon shifts five pixels. Terminator queries the accessibility tree directly, so a button is identified by role and name, not by where it happened to be when the script was written. The element survives window resizes, dark mode, DPI changes, and most app updates. Latency is also lower because there is no OCR pass and no image diff.",
  },
  {
    q: "How is this different from Playwright?",
    a: "Playwright drives browsers. Terminator drives everything. If your automation lives entirely in Chrome or Firefox, Playwright is the right tool. The moment you need to click a button in Outlook, drag a file in Explorer, fill a field in SAP GUI, or trigger a save dialog in Photoshop, Playwright cannot help. Terminator covers that gap. The selector grammar is deliberately Playwright-shaped (`role:Button && name:'Save'`) so the mental model carries over.",
  },
  {
    q: "How is this different from UiPath or Power Automate Desktop?",
    a: "Different category. UiPath and Power Automate Desktop are designer-driven RPA platforms aimed at non-developers building business automations. They have per-seat licenses, central bot orchestrators, and visual workflow builders. Terminator is a developer framework. There is no designer. You wire it into code or into an MCP-capable AI assistant. It is MIT licensed and runs locally with no orchestrator. Different audience, different shape, different price.",
  },
  {
    q: "What does the MCP integration actually do?",
    a: "The MCP server (`npx -y terminator-mcp-agent@latest`) exposes desktop automation as a tool to any MCP-aware AI assistant. Once installed, Claude Code, Cursor, VS Code, or Windsurf can call tools like `click_element`, `type_into_element`, `press_key`, `get_focused_window_tree`, and `run_workflow`. The assistant reads the accessibility tree of the focused window, decides what to click, and the framework executes the click for real. This is what lets an AI coding assistant do work outside its own editor.",
  },
  {
    q: "What platforms does it support?",
    a: "Windows is the primary target. The Windows backend wraps UI Automation (uiautomation-rs) and is the most mature. macOS is supported via the AXUIElement API; the Rust crate `axuielement` is the project's own work to make macOS accessibility feel like a typed Rust API. Linux is not currently supported because AT-SPI2 coverage in major Linux apps is uneven. If you need cross-platform between Windows and macOS, that works today.",
  },
  {
    q: "Where do I install it?",
    a: "For the MCP integration: `claude mcp add terminator 'npx -y terminator-mcp-agent@latest'` and restart your assistant. For Rust: `cargo add terminator-rs`. For Python: `pip install terminator-rs`. For npm: `npm install terminator-mcp-agent`. Source and issues live at github.com/mediar-ai/terminator. The documentation site is t8r.tech.",
  },
  {
    q: "What license is it under?",
    a: "MIT. Source on GitHub, no per-seat fees, no telemetry phone-home, no commercial gating of features. The project is maintained by Mediar.",
  },
];

const checklistItems = [
  {
    label: "Open source, MIT licensed",
    description: "Source at github.com/mediar-ai/terminator. No per-seat fees, no telemetry, no feature gating.",
  },
  {
    label: "Cross-platform (Windows + macOS)",
    description: "UI Automation on Windows, AXUIElement on macOS. Single API for both.",
  },
  {
    label: "Playwright-shaped selectors",
    description: "role:Button && name:'Save'. Familiar if you've written browser automation.",
  },
  {
    label: "MCP server included",
    description: "Plug it into Claude Code, Cursor, VS Code, or Windsurf. The AI gets OS-level hands.",
  },
  {
    label: "Works with any native app",
    description: "Excel, Outlook, SAP GUI, File Explorer, Photoshop, Teams, internal WPF tools, browsers.",
  },
  {
    label: "Multiple language bindings",
    description: "Rust crate (terminator-rs), Python package, npm CLI. Same engine underneath.",
  },
];

const installSteps = [
  {
    title: "Install the MCP agent",
    description: "Run `npx -y terminator-mcp-agent@latest` once, or wire it into your assistant's MCP config.",
  },
  {
    title: "Point your assistant at it",
    description: "For Claude Code: `claude mcp add terminator 'npx -y terminator-mcp-agent@latest'`. Cursor, VS Code, and Windsurf use their own MCP config files.",
  },
  {
    title: "Ask the assistant to do work",
    description: "Open Outlook, mark these three emails as read. Open Excel, paste this data, save. The assistant reads the accessibility tree and clicks for real.",
  },
  {
    title: "Inspect or edit the recorded workflow",
    description: "Long-running flows are persisted as human-readable YAML. Edit them in git, replay with `terminator mcp run workflow.yml`.",
  },
];

const beforePixel = `# pyautogui: pixel-based, brittle
import pyautogui, time

pyautogui.click(847, 312)         # "Save" button, today
time.sleep(0.5)
pyautogui.typewrite('report.xlsx')
pyautogui.press('enter')

# Tomorrow: DPI changes,
# button moves 6px right,
# script clicks nothing.`;

const afterTerminator = `# terminator: accessibility-based, durable
from terminator import Desktop

desktop = Desktop()
excel = desktop.app("Excel")

excel.element("role:Button && name:'Save'").click()
excel.element("role:Edit && name:'File name'").type("report.xlsx")
excel.element("role:Button && name:'Save'").click()

# Survives DPI changes, dark mode,
# window moves, theme swaps,
# most app updates.`;

const articleSchemaObj = articleSchema({
  url: PAGE_URL,
  title: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
});

const breadcrumbSchemaObj = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaObj = faqPageSchema(faqs);

export default function TerminatorSoftwarePage() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaObj) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaObj) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaObj) }}
      />

      <div className="mx-auto max-w-4xl px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="mx-auto max-w-4xl px-6 pt-8 pb-6">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          Terminator software, in one sentence
        </h1>
        <p className="mt-6 text-xl text-zinc-700 leading-relaxed">
          Terminator is an open source desktop automation framework for Windows and macOS that drives any native app through the OS accessibility layer, distributed at{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-600 underline underline-offset-4 hover:text-orange-700"
          >
            github.com/mediar-ai/terminator
          </a>
          .
        </p>

        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="6 min read"
          />
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 md:p-8">
          <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">
            Direct answer (verified 2026-05-24)
          </p>
          <p className="mt-3 text-lg text-zinc-900 leading-relaxed">
            <strong>What it is.</strong> A developer framework. Rust core, Python and npm bindings, plus an MCP server. Drives any Windows or macOS app through native accessibility APIs (UI Automation on Windows, AXUIElement on macOS).
          </p>
          <p className="mt-3 text-lg text-zinc-900 leading-relaxed">
            <strong>What it is not.</strong> Not the older Linux terminal emulator of the same name (that one lives at{" "}
            <a
              href="https://github.com/gnome-terminator/terminator"
              className="text-orange-600 underline underline-offset-4 hover:text-orange-700"
            >
              github.com/gnome-terminator/terminator
            </a>
            ). Not an RPA platform with a designer. Not a consumer app you double-click.
          </p>
          <p className="mt-3 text-lg text-zinc-900 leading-relaxed">
            <strong>License.</strong> MIT. Source at{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-600 underline underline-offset-4 hover:text-orange-700"
            >
              github.com/mediar-ai/terminator
            </a>
            . Docs and installer at{" "}
            <a
              href="https://t8r.tech"
              className="text-orange-600 underline underline-offset-4 hover:text-orange-700"
            >
              t8r.tech
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          The name collision, settled
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Two projects share the name. They are not related.
        </p>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Linux terminal emulator
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              gnome-terminator/terminator
            </p>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
              Multi-pane terminal for GNOME, written in Python, packaged in apt/dnf/pacman. First released in 2007. If you want to split your terminal into four panes, this is the project you want, and this page will not help you.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">
              Desktop automation framework (this site)
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">
              mediar-ai/terminator
            </p>
            <p className="mt-2 text-sm text-zinc-700 leading-relaxed">
              Open source desktop automation framework for Windows and macOS. Rust core, Python and npm bindings, MCP server. Built for developers and AI coding assistants that need to drive real apps, not consumer end-users.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          What the framework actually gives you
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The shape is intentionally close to Playwright. If you have written browser automation, the mental model carries over.
        </p>
        <div className="mt-6">
          <AnimatedChecklist title="Core capabilities" items={checklistItems} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          Why accessibility APIs beat pixel matching
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Most desktop automation written in the last 20 years uses pixel coordinates or screenshot diffing to find UI elements. Both approaches break the moment the screen changes. Terminator queries the accessibility tree the OS already maintains, so elements have stable identities that survive layout changes, theme swaps, and DPI scaling.
        </p>
        <div className="mt-6">
          <BeforeAfter
            title="Click 'Save' in Excel"
            before={{
              content:
                "pyautogui finds the button at (847, 312). Tomorrow the user attaches an external monitor, Windows rescales, the button moves to (1271, 468). The script clicks empty canvas and silently fails. No exception, no log line, just the wrong outcome.",
              highlights: [
                "Brittle to DPI changes",
                "Breaks on theme or window resize",
                "Silent failure when target moves",
                "No way to diff selectors in git",
              ],
            }}
            after={{
              content:
                "Terminator queries the UI Automation tree for role:Button && name:'Save'. The element survives DPI changes, dark mode swaps, window resizes, and most app updates. If the button is genuinely missing, the call raises a typed error instead of clicking nothing.",
              highlights: [
                "Survives DPI and theme changes",
                "Survives window resize and move",
                "Typed errors when element is missing",
                "Selectors are plain text, diffable in git",
              ],
            }}
          />
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
              Before: pixel-based
            </p>
            <pre className="mt-3 text-xs text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg p-4 overflow-x-auto whitespace-pre">
{beforePixel}
            </pre>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white p-6">
            <p className="text-xs uppercase tracking-wider text-orange-700 font-semibold">
              After: accessibility-based
            </p>
            <pre className="mt-3 text-xs text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg p-4 overflow-x-auto whitespace-pre">
{afterTerminator}
            </pre>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          Where it slots into your stack
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The most common entry point is the MCP server. Install it once, point your AI coding assistant at it, and the assistant gains the ability to read and manipulate any UI on your machine.
        </p>
        <div className="mt-6">
          <HorizontalStepper title="From install to first automation" steps={installSteps} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="grid md:grid-cols-3 gap-4">
          <AnimatedMetric value={2} label="Operating systems supported (Windows, macOS)" />
          <AnimatedMetric value={4} label="Distribution channels (Rust, Python, npm, MCP)" />
          <AnimatedMetric value={0} label="Per-seat license fees (MIT)" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
          Who it is for
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The intended user is a developer building one of three things:
        </p>
        <ul className="mt-4 space-y-3 text-zinc-700 leading-relaxed list-disc pl-6">
          <li>
            <strong>An AI agent with computer-use capabilities.</strong> You want Claude, GPT, or a local model to drive native apps, not just generate text. Terminator gives the model a typed tool surface for the OS instead of asking it to interpret screenshots.
          </li>
          <li>
            <strong>An internal automation that has outgrown PyAutoGUI or AutoHotkey.</strong> The script worked when one person ran it on one machine. Now five teammates run it, half on laptops with external monitors, and it fails randomly. Switching the underlying engine to the accessibility tree fixes most of those failures.
          </li>
          <li>
            <strong>An MCP tool that needs to drive real apps beyond the browser.</strong> You are extending Claude Code or Cursor with capabilities that Playwright cannot reach: opening attachments, manipulating native dialogs, controlling Excel, dragging files in Explorer.
          </li>
        </ul>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          If you only need browser automation, Playwright is still the right tool. If you need a hosted RPA platform with bot orchestration and audit logs, this is the wrong category. Use UiPath or Power Automate Desktop instead.
        </p>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <InlineTestimonial
          quote="The thing I want from desktop automation is that the selectors I wrote three months ago still work today. Terminator queries the accessibility tree directly, which means a button is identified by what it is, not where it happened to be on the screen the day I wrote the script."
          name="Matt"
          role="Maintainer, github.com/mediar-ai/terminator"
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Considering Terminator for a real automation project?"
        description="If you have a desktop workflow you are trying to drive from code or from an AI assistant, walk us through it and we will tell you honestly whether this framework fits."
      />

      <section className="mx-auto max-w-4xl px-6 py-10">
        <FaqSection title="Common questions about Terminator software" items={faqs} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Walk us through your desktop automation problem."
      />
    </article>
  );
}
