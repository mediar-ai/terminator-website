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
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  OrbitingCircles,
  GlowCard,
  MetricsRow,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-for-windows";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Automation for Windows that your AI coding assistant can actually drive: 35 MCP tools over UI Automation";
const DESCRIPTION =
  "Most automation for Windows is a canvas for humans or a hotkey language for scripts. Terminator is a developer framework that exposes Windows as 35 typed MCP tools to Claude Code, Cursor, and Windsurf. Every action returns a before/after UI tree diff so the agent can verify its own work.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator exposes the Windows UIA tree to AI agents as 35 MCP tools. click_element, type_into_element, press_key, and the rest all accept ui_diff_before_after:true and return only what changed. Source: crates/terminator-mcp-agent/src/server.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation for Windows that your AI coding assistant can drive",
    description:
      "35 MCP tools over the Windows UI Automation tree. Every action returns a UI tree diff so Claude Code can verify its own click without rescanning the screen.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation for Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation for Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What makes Terminator different from Power Automate Desktop or AutoHotkey as automation for Windows?",
    a: "Power Automate Desktop is a low-code canvas for human operators to click together. AutoHotkey is a hotkey and scripting language. Terminator is a developer framework, closer to Playwright for the whole OS. You write code (Rust, TypeScript, or Python) or you let an AI coding assistant call its MCP tools directly. Selectors are UIA-based strings like role:Button && name:Save, scoped by process. No drag-and-drop canvas, no vendor lock-in, MIT licensed.",
  },
  {
    q: "How many MCP tools does Terminator ship?",
    a: "Exactly 35, registered via #[tool(...)] attributes inside crates/terminator-mcp-agent/src/server.rs. They include click_element, type_into_element, press_key, press_key_global, invoke_element, activate_element, mouse_drag, scroll_element, select_option, set_selected, set_value, capture_screenshot, get_window_tree, get_applications_and_windows_list, navigate_browser, open_application, validate_element, wait_for_element, highlight_element, stop_highlighting, hide_inspect_overlay, delay, ask_user, gemini_computer_use, execute_sequence, read_file, write_file, edit_file, copy_content, glob_files, grep_files, typecheck_workflow, stop_execution. Grep the source: grep -c '#\\[tool(' crates/terminator-mcp-agent/src/server.rs returns 35.",
  },
  {
    q: "Why does every action tool accept a ui_diff_before_after parameter?",
    a: "When an AI agent clicks a button, it needs to know what changed. The naive approach is to re-fetch the full window tree after every action, which is slow and floods the agent context with unchanged nodes. Terminator snapshots the tree before the action, runs the action, snapshots the tree after, and returns only the diff. The tool description strings literally tell the model: 'Use ui_diff_before_after:true to see changes (no need to call get_window_tree after).' See server.rs line 2152 for the type_into_element tool's description.",
  },
  {
    q: "How is the UI tree diff stabilized so it does not flood with noise?",
    a: "UIA trees contain volatile identifiers like runtime ids and bounding rectangles that shift on every repaint, so a naive diff would surface dozens of cosmetic changes for every click. Terminator strips those fields in crates/terminator/src/ui_tree_diff.rs. preprocess_tree removes id and element_id from the JSON form. remove_ids_and_bounds_from_compact_yaml strips '#abc123' identifiers and 'bounds: [x,y,w,h]' tuples from the compact YAML form. After preprocessing, a text diff via the similar crate shows only semantic changes.",
  },
  {
    q: "Why use structured accessibility APIs instead of screenshots plus vision AI for desktop automation?",
    a: "Speed and determinism. Per Terminator's llms.txt, UIA-based automation runs at CPU speed rather than LLM inference speed, which is roughly 100x faster, and it succeeds over 95 percent of the time on deterministic tasks. Screenshot-plus-vision agents have to re-infer the same layout on every step, drift when icons change, and cost money per action. Terminator reserves AI for error recovery, not every click.",
  },
  {
    q: "How do I give Claude Code access to this automation for Windows?",
    a: "One command. Run claude mcp add terminator 'npx -y terminator-mcp-agent@latest' in a terminal and Claude Code registers all 35 tools. The agent has two identical one-liners in the MCP config for Cursor, VS Code, and Windsurf, documented in the mediar-ai/terminator README. After that, any prompt like 'open Excel, paste this formula in cell A1, save the file' resolves through the MCP tools instead of screenshots.",
  },
  {
    q: "Does Terminator work on Windows 10 or only Windows 11?",
    a: "Both. The Windows backend talks to the UI Automation COM API (IUIAutomation, introduced in Windows 7 and stable across every shipping version since). The MSI installer and prebuilt npm binary target Windows 10 and 11, both x64 and ARM64. The Rust core also has macOS and Linux backends (AX API and AT-SPI2), though the npm, pip, and MCP packages currently ship Windows binaries only.",
  },
  {
    q: "Can the agent verify its click landed without a screenshot?",
    a: "Yes. The ui_diff_before_after response includes the set of added, removed, and modified nodes between the two tree snapshots, rendered in the compact YAML form after ID and bounds stripping. If the click opened a dialog, the diff contains the new [Window] and its children. If the click was eaten by a disabled control, the diff is empty. The agent decides what to do next from that text alone.",
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

const mcpConfigCode = `// claude mcp add terminator "npx -y terminator-mcp-agent@latest"
// Same one-liner works for Cursor, VS Code, Windsurf via their MCP config.

{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`;

const agentCallCode = `// What the AI agent actually sends when you say "click the Save button".
// The call goes through the MCP transport to terminator-mcp-agent.

{
  "tool": "click_element",
  "arguments": {
    "selector": "process:winword >> role:Button && name:Save",
    "ui_diff_before_after": true
  }
}

// The agent does NOT need to call get_window_tree afterwards.
// The click_element response already contains the diff of the window tree
// before and after the action, with volatile ids and bounds stripped.`;

const diffResponseCode = `{
  "action": "click_element",
  "status": "executed_without_error",
  "ui_diff_before_after": {
    "added": [
      "- [Window] Save As",
      "  - [Edit] File name #AutomationId=1001",
      "  - [Button] Save",
      "  - [Button] Cancel"
    ],
    "removed": [],
    "modified": [
      "- [Button] Save (enabled) -> (disabled)"
    ]
  }
}

// The "Save As" dialog appeared. The original Save button greyed out.
// Two semantic changes, zero pixel diffing, ready for the next tool call.`;

const installLines = [
  { text: "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"", type: "command" as const },
  { text: "Added stdio MCP server terminator to Claude Code", type: "success" as const },
  { text: "cursor: open ~/.cursor/mcp.json and add the same entry", type: "output" as const },
  { text: "Restart your editor", type: "output" as const },
  { text: "-> 35 tools registered under terminator-mcp-agent", type: "success" as const },
];

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -c '#\\[tool(' crates/terminator-mcp-agent/src/server.rs", type: "command" as const },
  { text: "35", type: "success" as const },
  { text: "grep -n 'ui_diff_before_after' crates/terminator-mcp-agent/src/server.rs | head -5", type: "command" as const },
  { text: "1330:...use their ui_diff_before_after/include_tree_after_action params instead.", type: "success" as const },
  { text: "2152:...Use ui_diff_before_after:true to see changes (no need to call get_window_tree after).", type: "success" as const },
  { text: "wc -l crates/terminator/src/ui_tree_diff.rs", type: "command" as const },
  { text: "300 crates/terminator/src/ui_tree_diff.rs", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Exposes the desktop to AI agents as MCP tools",
    competitor: "No",
    ours: "35 tools via terminator-mcp-agent",
  },
  {
    feature: "Selector language for Windows controls",
    competitor: "Drag-and-drop or hotkey only",
    ours: "role:/name:/id:/process: with && || !",
  },
  {
    feature: "Action returns a UI tree diff",
    competitor: "No, re-screenshot",
    ours: "ui_diff_before_after on every action tool",
  },
  {
    feature: "Uses accessibility API, not pixels",
    competitor: "Mixed or coordinate-based",
    ours: "IUIAutomation COM API end to end",
  },
  {
    feature: "Code-first SDKs",
    competitor: "Canvas or script DSL",
    ours: "Rust, TypeScript, Python, MCP",
  },
  {
    feature: "Open source license",
    competitor: "Proprietary or restricted",
    ours: "MIT on GitHub at mediar-ai/terminator",
  },
  {
    feature: "Works inside a scheduled CI job",
    competitor: "Requires attended desktop",
    ours: "Headless mode via TERMINATOR_HEADLESS env var",
  },
];

const competitorPills = [
  "Power Automate Desktop",
  "UiPath",
  "Automation Anywhere",
  "AutoHotkey v2",
  "AutoIt",
  "SikuliX",
  "pywinauto",
  "Task Scheduler",
  "WinAutomation",
  "TinyTask",
  "Thunderbit",
];

const bentoCards: BentoCard[] = [
  {
    title: "click_element",
    description:
      "Left, right, double. Accepts a UIA selector string or an index into the last returned tree. Returns the before/after diff when you pass ui_diff_before_after:true.",
    size: "2x1",
    accent: true,
  },
  {
    title: "type_into_element",
    description:
      "Clipboard-optimised typing with verification. Trailing {Enter}, {Tab}, or {Escape} are auto-detected so a search box prompt reads 'search query{Enter}'.",
    size: "1x1",
  },
  {
    title: "press_key",
    description:
      "Keys normalize to curly-brace form. 'Ctrl+A' becomes '{Ctrl}a'. Fires against the focused element; press_key_global fires against the OS.",
    size: "1x1",
  },
  {
    title: "invoke_element",
    description:
      "UIA InvokePattern invocation. Works on offscreen and minimized elements where a literal click would fail. The fallback path for buttons that reject mouse events.",
    size: "1x1",
  },
  {
    title: "get_window_tree",
    description:
      "Structured snapshot of a process's accessibility tree. Supports include_browser_dom for Chrome DOM, include_ocr for vision text, include_omniparser for icons.",
    size: "2x1",
  },
  {
    title: "wait_for_element",
    description:
      "Waits for a selector condition (visible, enabled, exists) with an explicit timeout. The Playwright-shaped primitive for race conditions in desktop UIs.",
    size: "1x1",
  },
  {
    title: "execute_sequence",
    description:
      "Runs a YAML or JSON workflow file with conditional jumps, retries, and engine-mode JavaScript or Python steps. The MCP tool that turns a prompt into a replayable script.",
    size: "2x1",
  },
  {
    title: "capture_screenshot",
    description:
      "Real screenshot for when the accessibility tree truly is not enough. Rare fallback. The other 34 tools handle the rest through structured data.",
    size: "1x1",
  },
];

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
          Automation for Windows your{" "}
          <GradientText>AI coding assistant</GradientText>{" "}
          can actually drive
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every other guide to automation for Windows walks you through a
          drag-and-drop RPA canvas or an AutoHotkey snippet meant for a human
          keyboardist. This page is about the other use case: giving Claude
          Code, Cursor, or Windsurf a typed MCP surface to drive the real
          Windows accessibility tree, and having every click tell the agent
          what changed.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "35 MCP tools registered in crates/terminator-mcp-agent/src/server.rs",
          "Every action tool returns a UI tree diff via ui_diff_before_after:true",
          "Selectors built on IUIAutomation, not pixels",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Automation for Windows, agent-shaped"
            subtitle="A typed MCP surface over the UI Automation tree"
            captions={[
              "35 tools registered via #[tool(...)] in server.rs",
              "click_element, type_into_element, press_key, invoke_element, and 31 more",
              "Every action accepts ui_diff_before_after:true",
              "Response returns the changed nodes in compact YAML",
              "The agent sees what happened without a new screenshot",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Two different readers typed the same search
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          A developer searches for &quot;automation for Windows&quot; because
          they want to script a daily task, deploy a workflow across a fleet,
          or let an AI coding assistant take care of the parts of work that
          happen outside the text editor. A business analyst searches the same
          phrase because a vendor called Power Automate is up for renewal.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The business analyst has endless options. UiPath, Automation
          Anywhere, Power Automate Desktop, TinyTask, Thunderbit. All
          canvases. All designed to record human clicks and play them back. The
          developer reads those pages and bounces, because they do not want a
          canvas. They want an API.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator is the API. It is a Rust core with Node, Python, and MCP
          bindings, shaped like Playwright, targeting every Windows
          application instead of a browser. And the newest binding, the one
          most pages on this keyword ignore, is the MCP agent that exposes 35
          typed tools to whichever AI assistant you already use.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact the other pages miss
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Terminator ships a single MCP binary,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            terminator-mcp-agent
          </code>
          , that any MCP-aware editor can attach to with one line. Inside that
          binary,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator-mcp-agent/src/server.rs
          </code>{" "}
          registers exactly 35 tools. Every tool that performs an action
          accepts an optional{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            ui_diff_before_after
          </code>{" "}
          parameter. When set, the tool captures the target window&apos;s UIA
          tree before the action, runs the action, captures the tree again,
          and returns only the semantic delta.
        </p>
        <MetricsRow
          metrics={[
            { value: 35, label: "MCP tools registered in server.rs" },
            { value: 95, suffix: "%", label: "deterministic task success rate" },
            { value: 100, suffix: "x", label: "faster than vision agents" },
            { value: 1, label: "line to add to Claude Code" },
          ]}
        />
      </section>

      <ProofBanner
        quote="Use ui_diff_before_after:true to see changes (no need to call get_window_tree after)."
        source="Tool description string for type_into_element in crates/terminator-mcp-agent/src/server.rs at line 2152"
        metric="35 tools"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Wire it into Claude Code
        </h2>
        <p className="text-zinc-600 mb-6">
          The agent talks to the MCP binary over stdio. You paste one entry
          into the MCP config and restart. There is no separate daemon, no
          service to install, no Azure portal to log into.
        </p>
        <AnimatedCodeBlock
          code={mcpConfigCode}
          language="json"
          filename=".cursor/mcp.json"
        />
        <p className="text-zinc-700 leading-relaxed mt-4">
          The one-liner for Claude Code is{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
          </code>
          . The same binary answers HTTP on request, with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            /health
          </code>
          ,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            /status
          </code>
          , and{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            /mcp
          </code>{" "}
          endpoints and a tunable{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            MCP_MAX_CONCURRENT
          </code>{" "}
          limit if you want to run multiple agents on one host.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the agent actually sends
        </h2>
        <p className="text-zinc-600 mb-6">
          A user prompt like &quot;save this Word document&quot; turns into a
          single MCP call. The agent does not loop back to read the window
          tree. The tool call itself returns the diff.
        </p>
        <AnimatedCodeBlock
          code={agentCallCode}
          language="javascript"
          filename="agent-call.json"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The diff, stripped of noise
        </h2>
        <p className="text-zinc-600 mb-6">
          UIA trees contain volatile runtime IDs and bounding rectangles that
          drift on every repaint. A naive diff would flood the agent with
          cosmetic changes. Terminator preprocesses both snapshots in{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/ui_tree_diff.rs
          </code>
          , stripping{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            id
          </code>
          ,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            element_id
          </code>
          , and{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            bounds
          </code>{" "}
          fields. What the agent sees is only what a human would notice.
        </p>
        <AnimatedCodeBlock
          code={diffResponseCode}
          language="json"
          filename="click_element response"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The 35 tools, by role
        </h2>
        <p className="text-zinc-600 mb-6">
          The MCP surface is small on purpose. One tool per verb. A short
          selection of the action tools every agent ends up calling.
        </p>
        <BentoGrid cards={bentoCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Works across the editor ecosystem
        </h2>
        <p className="text-zinc-600 mb-6">
          The MCP binary is a transport-level adapter. Any editor that speaks
          the Model Context Protocol can load it. These are the editors the
          Terminator README documents out of the box.
        </p>
        <div className="flex justify-center">
          <OrbitingCircles
            center={
              <div className="flex flex-col items-center justify-center rounded-full border border-orange-200 bg-orange-50 w-32 h-32 text-orange-700">
                <span className="text-sm font-semibold">terminator</span>
                <span className="text-xs">mcp-agent</span>
              </div>
            }
            items={[
              <span
                key="claude"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                Claude Code
              </span>,
              <span
                key="cursor"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                Cursor
              </span>,
              <span
                key="vscode"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                VS Code
              </span>,
              <span
                key="windsurf"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                Windsurf
              </span>,
              <span
                key="continue"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                Continue
              </span>,
              <span
                key="zed"
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-800 shadow-sm"
              >
                Zed
              </span>,
            ]}
            radius={160}
            duration={24}
          />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The tools this page is not about
        </h2>
        <p className="text-zinc-600 mb-6">
          Every name on this strip is a fine product. None of them ship as an
          MCP server. None of them return a before/after UI tree diff. If the
          reader you are is a business analyst picking a canvas, one of these
          is likely right for you. If you are a developer shipping an AI
          workflow, keep reading.
        </p>
        <Marquee speed={38} pauseOnHover>
          {competitorPills.map((label) => (
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
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature by feature
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Traditional automation for Windows"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Five steps to your first agent-driven desktop action
        </h2>
        <p className="text-zinc-600 mb-6">
          Three happen inside Terminator. Two you type yourself. No canvas, no
          recorder to rewatch.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Install the MCP agent into your editor",
              description:
                "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" for Claude Code. Paste the same JSON into ~/.cursor/mcp.json for Cursor, or the Windsurf and VS Code equivalents.",
            },
            {
              title: "Prompt your assistant with a desktop task",
              description:
                "\"Open Excel, paste this formula into cell B2, save as report.xlsx.\" The assistant routes the verbs to terminator-mcp-agent's 35 tools instead of trying to imagine a screenshot.",
            },
            {
              title: "The tool call fires against IUIAutomation",
              description:
                "click_element resolves the selector \"process:EXCEL >> role:Edit && name:Formula Bar\" through the UIA COM API, calls ElementFromPoint or InvokePattern as appropriate, and drives the real control.",
            },
            {
              title: "The diff comes back inline",
              description:
                "Because the tool call was made with ui_diff_before_after:true, the MCP response includes the added, removed, and modified nodes after preprocess_tree strips volatile IDs and bounds.",
            },
            {
              title: "The agent decides the next call",
              description:
                "Reading only the diff, the assistant knows whether a dialog opened, whether a progress spinner appeared, or whether the Save button greyed out. It fires the next tool. No extra get_window_tree round trip.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify the anchor claims against source
        </h2>
        <p className="text-zinc-600 mb-6">
          The whole of this page is grep-verifiable. Clone the repository and
          run the same commands the AI coding assistant would.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={35} />
            </div>
            <p className="text-sm text-zinc-600">
              MCP tools registered in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                server.rs
              </code>
              . One binary, one one-line install, the whole Windows
              accessibility surface.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={2} />
            </div>
            <p className="text-sm text-zinc-600">
              Preprocessing passes in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                ui_tree_diff.rs
              </code>
              : strip IDs from JSON, strip IDs and bounds from compact YAML.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={0} />
            </div>
            <p className="text-sm text-zinc-600">
              Extra{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                get_window_tree
              </code>{" "}
              round trips the agent has to make after an action with{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                ui_diff_before_after:true
              </code>
              .
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Install
        </h2>
        <p className="text-zinc-600 mb-6">
          The MCP binary is published as{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            terminator-mcp-agent
          </code>{" "}
          on npm and ships prebuilt Windows binaries. No Rust toolchain
          required on the host.
        </p>
        <TerminalOutput title="install" lines={installLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want your AI coding assistant driving Windows apps by Friday?"
        description="Book 20 minutes and we will wire Terminator's 35 MCP tools into your editor against a real Windows workflow."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See Terminator's MCP surface drive a live Windows app in 20 minutes."
      />
    </article>
  );
}
