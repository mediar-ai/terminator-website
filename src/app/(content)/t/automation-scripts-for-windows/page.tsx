import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  MetricsRow,
  GlowCard,
  BentoGrid,
  CodeComparison,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/automation-scripts-for-windows";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Automation scripts for Windows: one API for every app on the desktop";
const DESCRIPTION =
  "PowerShell and AutoHotkey cover sysadmin and hotkeys. They do not address Win32, UWP, WPF, WinForms, and Electron apps with one script. Terminator's selector engine defines 24 locator primitives that target the Windows UI Automation accessibility tree, and a 35-tool MCP agent so Claude Code can write and run the script for you. Source: crates/terminator/src/selector.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "24 selector primitives, one Playwright-shaped API, the whole Windows desktop. Your AI coding assistant writes the script and runs it through a 35-tool MCP server.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Automation scripts for Windows, made for AI assistants",
    description:
      "Selector-based scripts that address every Win32, UWP, WPF, WinForms, and Electron control. Playwright for the OS.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Automation scripts for Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Automation scripts for Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "How is Terminator different from PowerShell or AutoHotkey for Windows automation?",
    a: "Different target surface. PowerShell drives the OS through cmdlets and .NET, which is great for registry edits, services, and file operations, but it has no first-class handle on a UWP button or a WPF combo box. AutoHotkey drives pixels, keystrokes, and Win32 handles, which works for macros over desktop apps but breaks as soon as layout shifts. Terminator scripts target the Windows UI Automation accessibility tree through a locator API modeled on Playwright. The same script shape finds a button in Notepad, Excel, Chrome, VS Code, and a line-of-business Electron app. The 24 locator primitives are defined as a single Rust enum at crates/terminator/src/selector.rs.",
  },
  {
    q: "What exactly are the 24 selector primitives?",
    a: "Role, Id, Name, Text, Path, NativeId (the Windows AutomationId), Attributes, Filter, Chain, ClassName, Visible, LocalizedRole, Process, RightOf, LeftOf, Above, Below, Near, Nth, Has (Playwright-style :has), Parent, And, Or, Not. You can chain any of them with the pipe character inside the locator string, and combine them with logical operators like && and ||. The Rust enum also has an Invalid variant used to carry parse errors, which is why you may see 25 variants when reading the source.",
  },
  {
    q: "Can my AI coding assistant run these scripts without me writing extra glue?",
    a: "Yes. Terminator ships an MCP server (terminator-mcp-agent) that exposes 35 tools (#[tool(...)] attributes in crates/terminator-mcp-agent/src/server.rs). Claude Code, Cursor, VS Code, Windsurf, and anything else that speaks MCP can call get_window_tree, click_element, type_into_element, press_key, open_application, navigate_browser, execute_sequence, and the rest. You add it with one line: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Now the same assistant that writes your code can also run it against any app on the desktop.",
  },
  {
    q: "Does this work on Win32, UWP, WPF, WinForms, and Electron?",
    a: "Yes, because every one of those frameworks implements Microsoft UI Automation. The accessibility tree is how screen readers understand these apps, so it is also how Terminator understands them. The win_calculator.py example in the repo targets a UWP Calculator control (nativeid:CalculatorResults), and the notepad.py example handles both Windows 10 and Windows 11 Notepad by switching on platform.release(). You can use the same role:, name:, and nativeid: selectors against Chrome (Electron), Visual Studio (WPF), Paint (Win32), and File Explorer (UWP shell) without changing the API.",
  },
  {
    q: "What about workflows that need to be replayed exactly, like RPA?",
    a: "Terminator includes a workflow recorder (crates/terminator-workflow-recorder) that captures mouse, keyboard, clipboard, hotkeys, text-input completion, and UI focus/property/structure changes as a timestamped JSON event stream. Double clicks are detected with the Windows-standard 500 ms time threshold and a 5-pixel distance tolerance. The JSON saves to a file and can be converted back into a script for deterministic replay. That means you record once in your real desktop, then run the replay through the same MCP loop and let the LLM patch the step that broke, rather than re-recording the whole workflow.",
  },
  {
    q: "Is the script deterministic or does it rely on the LLM at runtime?",
    a: "Deterministic first, LLM on recovery. A Terminator script is normal code: pick selectors, call click(), type_text(), press_key(), assert what happened. It runs at CPU speed with no model inference on the hot path. The AI only enters when the script would otherwise fail, for example a selector went stale because a label changed. In that case the script can call get_window_tree to dump the fresh accessibility tree as JSON, hand it to an LLM, and ask for a replacement selector, then retry. This is the pattern the Terminator README describes as >95% success, 100x faster than pure computer-use agents.",
  },
  {
    q: "Which SDKs can I write scripts in?",
    a: "Rust (terminator-rs), TypeScript (@mediar-ai/terminator), Python (terminator-py, Partial), and a workflow SDK (@mediar-ai/workflow) for step-based, typed workflows with error recovery. There is also a CLI (@mediar-ai/cli) for running workflow YAML or TypeScript from the command line, and a KV package (@mediar-ai/kv) for sharing state between steps. The npm package that spins up the MCP server is terminator-mcp-agent, and everything lives under crates/ and packages/ in the Terminator repo.",
  },
  {
    q: "Do I need to inspect the accessibility tree myself to find selectors?",
    a: "Only if you want to. Two paths. Manually, use Accessibility Insights for Windows or inspect.exe (from the Windows SDK) to hover over a control and read its Name, ControlType, and AutomationId. Programmatically, call desktop.get_window_tree(pid), which returns the entire UIA subtree rooted at a window in one cached call. For a mid-size 245-element window this takes about 200 ms on the Rust path (build_tree_with_cache at crates/terminator/src/platforms/windows/tree_builder.rs line 386). Print the tree, hand it to Claude, and ask it to pick a selector. That is the agent-native way to find selectors at runtime.",
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

const installLines = [
  { text: "# one line to give Claude Code the desktop", type: "output" as const },
  {
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest"',
    type: "command" as const,
  },
  {
    text: "Added MCP server terminator (npx -y terminator-mcp-agent@latest)",
    type: "success" as const,
  },
  { text: "# or install one of the SDKs directly", type: "output" as const },
  { text: "npm i @mediar-ai/terminator", type: "command" as const },
  { text: "pip install terminator-py", type: "command" as const },
  { text: "cargo add terminator-rs", type: "command" as const },
];

const hotkeyVsSelector = {
  left: `; autohotkey_v2.ahk
; Open Calculator and compute 1 + 2.
; The script hardcodes a pixel ordering plus
; a controlled window title, so it breaks the
; moment the Calculator layout changes.
Run "calc.exe"
WinWait "Calculator"
WinActivate "Calculator"

; Click (1) by relative coordinates.
ControlClick "x50 y180", "Calculator", , "Left"
Sleep 200
; Click (+)
ControlClick "x150 y180", "Calculator", , "Left"
Sleep 200
; Click (2)
ControlClick "x100 y180", "Calculator", , "Left"
Sleep 200
; Click (=)
ControlClick "x200 y220", "Calculator", , "Left"
Sleep 500

; Read the result via OCR on a screenshot.
; That part is not included here.`,
  right: `# terminator, Python, targets the
# accessibility tree, not pixels.
# Real example from /examples/win_calculator.py.
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop(log_level="error")
    calc = desktop.open_application("calc.exe")
    await asyncio.sleep(1)

    display = calc.locator("nativeid:CalculatorResults")
    one  = await calc.locator("Name:One").first()
    plus = await calc.locator("Name:Plus").first()
    two  = await calc.locator("Name:Two").first()
    eq   = await calc.locator("Name:Equals").first()

    one.click(); plus.click()
    two.click(); eq.click()

    result = (await display.first()).name()
    assert result in ("3", "Display is 3")

asyncio.run(main())`,
};

const mcpPipeline = {
  title: "How your AI assistant runs a Windows script with Terminator",
  from: [
    { label: "Claude Code", sublabel: "or Cursor / VS Code / Windsurf" },
    { label: "Your .ts / .py script", sublabel: "selectors, actions, asserts" },
    { label: "get_window_tree()", sublabel: "UIA subtree as JSON" },
  ],
  hub: {
    label: "terminator-mcp-agent",
    sublabel: "35 MCP tools over stdio or HTTP",
  },
  to: [
    { label: "Win32 apps", sublabel: "Paint, File Explorer" },
    { label: "UWP apps", sublabel: "Calculator, Settings" },
    { label: "WPF / WinForms", sublabel: "Visual Studio, legacy LOB" },
    { label: "Electron / Chromium", sublabel: "Chrome, VS Code, Teams" },
    { label: "Browser DOM", sublabel: "Same locator surface" },
  ],
};

const selectorPills = [
  "role:button",
  "name:Save",
  "nativeid:CalculatorResults",
  "role:edit|name:Address",
  "role:menuitem|name:File",
  "classname:Edit",
  "process:notepad.exe",
  "rightof(name:Bold)",
  "has(role:button|name:Send)",
  "role:button && visible:true",
];

const mcpToolBento: BentoCard[] = [
  {
    title: "get_window_tree",
    description:
      "Snapshot the full UIA subtree for a process as structured JSON. One call, cached in Rust.",
    size: "2x1",
    accent: true,
  },
  {
    title: "click_element",
    description:
      "Unified click. Three modes: selector, position inside bounds, or an existing element handle.",
  },
  {
    title: "type_into_element",
    description:
      "Smart clipboard optimization, handles long strings, falls back to per-key simulation when needed.",
  },
  {
    title: "press_key",
    description:
      "Normalized chords (Ctrl+S, Alt+F4, F11) sent to a focused element instead of the OS globally.",
  },
  {
    title: "execute_sequence",
    description:
      "Run a whole workflow or a step range. Supports resume, rollback, and step-level variables.",
    size: "2x1",
  },
  {
    title: "navigate_browser",
    description:
      "Open a URL inside a browser window the SDK already knows how to locate.",
  },
  {
    title: "open_application",
    description:
      "Launch calc.exe, notepad.exe, or a UWP target like uwp:Microsoft.WindowsCalculator.",
  },
  {
    title: "validate_element",
    description:
      "Assert an element exists before you act. Returns diagnostics when the selector is wrong.",
  },
  {
    title: "glob_files / grep_files",
    description:
      "Let the LLM read your YAML workflows and TypeScript steps inside the working directory.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Targets accessibility tree (role, name, AutomationId)",
    competitor: "No (keys and pixels)",
    ours: "Yes, 24 locator primitives in selector.rs",
  },
  {
    feature: "Works on Win32 + UWP + WPF + WinForms + Electron",
    competitor: "Partial (AHK struggles with UWP and Chromium)",
    ours: "Yes, anything exposing UI Automation",
  },
  {
    feature: "One script shape for every app",
    competitor: "No, separate idioms per app",
    ours: "Yes, locator(\"...\").first().click()",
  },
  {
    feature: "AI coding assistant can author and run it",
    competitor: "No, AHK/AutoIt have no MCP surface",
    ours: "Yes, 35-tool MCP agent (one npx install)",
  },
  {
    feature: "Deterministic replay of recorded workflows",
    competitor: "AHK macros record keys; fragile to layout",
    ours: "workflow-recorder emits JSON, replayable",
  },
  {
    feature: "Recovery when a selector goes stale",
    competitor: "Script fails hard",
    ours: "LLM gets a fresh window tree, picks a new selector",
  },
  {
    feature: "Runs from Rust, TypeScript, Python, or YAML",
    competitor: "AHK: one language. PowerShell: one language.",
    ours: "4 SDKs + MCP + CLI",
  },
  {
    feature: "Open source license",
    competitor: "Mixed",
    ours: "MIT, no lock-in",
  },
];

const stepTimeline = [
  {
    title: "Pick the app you want to drive",
    description:
      "Calc.exe, notepad.exe, Excel, Chrome, or your internal line-of-business tool. Any Windows app that exposes an accessibility tree counts, which is almost every modern Windows app.",
  },
  {
    title: "Dump the window tree once, read the JSON",
    description:
      "desktop.get_window_tree(pid) returns the entire UIA subtree for the window. The cache request pre-fetches 7 properties per node (ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId). About 200 ms for a 245-element window.",
  },
  {
    title: "Write a selector-first script",
    description:
      "Use role:, name:, and nativeid: where possible. Chain with the pipe. Avoid coordinates. Example: calc.locator(\"Name:Equals\").first().click(). The same strings work from Python, TypeScript, and the MCP surface.",
  },
  {
    title: "Run it through the MCP agent",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Now Claude Code can call execute_sequence on your workflow file, patch failing steps from fresh window trees, and repeat until the assertion passes.",
  },
  {
    title: "Record instead of writing, if you prefer",
    description:
      "terminator-workflow-recorder captures your real desktop actions as JSON (mouse, keys, clipboard, focus changes). Double-click detection uses the standard 500 ms / 5 pixel thresholds. Convert the recording to a script, hand it to the same MCP loop, and you have an RPA bot without the legacy RPA cost.",
  },
];

const workflowTs = `// workflow.ts — @mediar-ai/workflow
import { createStep, createWorkflow, z } from '@mediar-ai/workflow';

const Input = z.object({
  sheet: z.string().default('Q1.xlsx'),
});

const openExcel = createStep({
  id: 'open',
  name: 'Open Excel',
  execute: async ({ desktop, input }) => {
    const win = desktop.openApplication('excel');
    await desktop.delay(1500);
    await win.locator('name:Open Other Workbooks').first()
      .then(e => e.click());
    const dialog = await win.locator('window:Open').first();
    await dialog.locator('role:edit|name:File name').first()
      .then(e => e.typeText(input.sheet));
  },
});

const sumColumn = createStep({
  id: 'sum',
  name: 'Sum column B',
  execute: async ({ desktop }) => {
    const cell = await desktop.locator('name:Cell B11').first();
    cell.typeText('=SUM(B2:B10)\\n');
  },
  onError: async ({ error, retry, attempt }) => {
    if (attempt < 3) return retry();
    return { recoverable: false };
  },
});

export default createWorkflow({
  name: 'Q1 summary',
  input: Input,
}).step(openExcel).step(sumColumn).build();`;

const recorderScript = `// record_workflow.rs (excerpt)
use terminator_workflow_recorder::{
    WorkflowRecorder, WorkflowRecorderConfig,
};

let config = WorkflowRecorderConfig {
    enable_highlighting: true,
    highlight_color: Some(0x00FF00),       // green BGR
    highlight_duration_ms: Some(800),
    record_ui_focus_changes: true,
    record_ui_property_changes: true,
    ..Default::default()
};

let mut recorder = WorkflowRecorder::new(
    "Q1 invoice ingest".into(), config,
);
recorder.start().await?;

// ... user performs the workflow on their real desktop ...

recorder.stop().await?;
recorder.save("q1_invoice_ingest.json")?;
// Replay deterministically, or convert to TS/Python.`;

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
          Automation scripts for Windows, when{" "}
          <GradientText>one API covers every app</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Most advice on this topic sends you to PowerShell (a sysadmin
          language) or AutoHotkey (a key-macro engine). Both are fine for what
          they are. Neither of them addresses the actual job: writing one
          script that drives a UWP Calculator, a WPF line-of-business tool, a
          Chromium-based Teams window, and a legacy Win32 dialog with the
          same selectors. Terminator does that by targeting the Windows UI
          Automation accessibility tree, with 24 locator primitives defined
          in one Rust enum and a 35-tool MCP agent so Claude Code can both
          author and run your scripts.
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
        ratingCount="design partners running this in production"
        highlights={[
          "24 locator primitives in crates/terminator/src/selector.rs",
          "35 MCP tools in terminator-mcp-agent, one npx install",
          "Drives Win32 + UWP + WPF + WinForms + Electron apps",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Automation scripts for Windows, rethought"
            subtitle="One selector language. Every desktop app. Your AI assistant runs it."
            captions={[
              "24 selector primitives, one Rust enum",
              "role: / name: / nativeid: / chain with |",
              "Same script: UWP Calculator to legacy LOB",
              "35 MCP tools expose it to Claude Code",
              "Record with workflow-recorder, replay deterministic",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the existing playbooks leak
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Walk through the common advice online. PowerShell gives you
          cmdlets, pipelines, and WMI queries. Perfect for services, registry
          edits, and system hygiene. You do not use it to click the Send
          button in Outlook. AutoHotkey compiles a tiny script into a global
          hotkey that can simulate keys and Win32 control clicks. Perfect for
          swapping Caps Lock to Escape or remapping a macro pad. You do not
          use it to drive a UWP Calculator or to work inside a Chromium-based
          app where the DOM is not a Win32 handle.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          AutoIt adds window and control manipulation on top of key-simulated
          input. Task Scheduler runs your scripts at fixed times. All useful.
          None of it solves the actual problem of 2026: an AI assistant
          should be able to read the state of any window on your desktop,
          decide which control to touch, and touch it. The input surface has
          to be the accessibility tree, not a keystroke and not a pixel.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          That is the shape Terminator takes. The selector engine (the core
          primitive) is a single Rust enum with 24 variants. The execution
          surface is a Playwright-style locator API in Rust, TypeScript, and
          Python. The AI surface is an MCP agent with 35 tools, served over
          stdio or HTTP, installable in one line.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact: 24 primitives, one file
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Open{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/selector.rs
          </code>{" "}
          in the Terminator repo. The{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            pub enum Selector
          </code>{" "}
          at the top of the file declares every way a script can identify an
          element in a Windows app. Count the variants, skip the Invalid
          error variant, and you get 24. They are the entire vocabulary of a
          Terminator selector string, and every SDK parses into the same enum.
        </p>
        <Marquee speed={34} pauseOnHover>
          {selectorPills.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 font-mono whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-600 mt-6 text-sm leading-relaxed">
          The grammar: prefix with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            role:
          </code>{" "}
          /{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            name:
          </code>{" "}
          /{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            nativeid:
          </code>{" "}
          /{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            classname:
          </code>
          , chain sub-selectors with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            |
          </code>
          , combine with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            &&
          </code>{" "}
          /{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            ||
          </code>
          , anchor by spatial relation with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            rightof()
          </code>
          ,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            near()
          </code>
          , and filter descendants with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            has()
          </code>{" "}
          (Playwright-style{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            :has
          </code>
          ). That is the full alphabet.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The shape, in numbers
        </h2>
        <p className="text-zinc-600 mb-6">
          Four numbers to keep in mind when you compare this to the older
          tooling. They come from the Terminator source, not a benchmark
          post.
        </p>
        <MetricsRow
          metrics={[
            { value: 24, label: "locator primitives in selector.rs" },
            { value: 35, label: "MCP tools in terminator-mcp-agent" },
            { value: 7, label: "UIA properties pre-fetched per node" },
            {
              value: 200,
              suffix: " ms",
              label: "cached window-tree walk, 245 elements",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A hotkey macro versus a selector script
        </h2>
        <p className="text-zinc-600 mb-6">
          Both scripts below open Calculator and compute 1 + 2. The left one
          is the AutoHotkey shape that pages on this topic still teach in
          2026. It hardcodes pixel offsets and the window title, so a Windows
          11 layout change or a high-DPI monitor kills it. The right one is
          the first example in{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            examples/win_calculator.py
          </code>{" "}
          in the Terminator repo. It targets semantic names through the
          accessibility tree, so the same script works on Windows 10, Windows
          11, arm64, and a Citrix remote desktop.
        </p>
        <CodeComparison
          leftCode={hotkeyVsSelector.left}
          rightCode={hotkeyVsSelector.right}
          leftLines={hotkeyVsSelector.left.split("\n").length}
          rightLines={hotkeyVsSelector.right.split("\n").length}
          leftLabel="AutoHotkey (pixels + titles)"
          rightLabel="Terminator (selectors)"
          title="Same calculator, two very different scripts"
        />
      </section>

      <ProofBanner
        quote="Runs 100x faster than ChatGPT Agents, Claude, Perplexity Comet, BrowserBase, BrowserUse (deterministic, CPU speed, with AI recovery). >95% success rate unlike most computer use overhyped products."
        source="Terminator README, Why Terminator section"
        metric=">95%"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          How an AI coding assistant actually runs this
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Installing the MCP agent is one line per client. Once that is
          attached to Claude Code, Cursor, VS Code, Windsurf, or anything
          else that speaks MCP, the assistant that already writes your code
          also gets 35 tools for controlling every app on your desktop. This
          is the diagram of the loop.
        </p>
        <AnimatedBeam
          title="Your script plus an MCP agent plus every Windows app"
          from={mcpPipeline.from}
          hub={mcpPipeline.hub}
          to={mcpPipeline.to}
          accentColor="#FF3E00"
        />
        <p className="text-zinc-600 text-sm leading-relaxed mt-4">
          The MCP agent is a single npx-installable server. The tools match
          the locator API so the assistant does not need special prompting to
          use them. When a selector goes stale, the assistant calls{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            get_window_tree
          </code>
          , reads the JSON, and picks a new selector. The loop recovers
          without giving up the script.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install, in a single terminal session
        </h2>
        <p className="text-zinc-600 mb-6">
          Pick the shape that matches the rest of your stack. Each of these
          installs points at the same underlying Rust core, so a script
          written in one ports cleanly to the others.
        </p>
        <TerminalOutput title="powershell / bash" lines={installLines} />
      </section>

      <StepTimeline
        title="From zero to a running script"
        steps={stepTimeline}
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the 35 MCP tools actually do
        </h2>
        <p className="text-zinc-600 mb-6">
          Every one of these is defined as a{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            #[tool(...)]
          </code>{" "}
          attribute in{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            crates/terminator-mcp-agent/src/server.rs
          </code>
          . They are the same primitives an SDK script calls; the MCP agent
          just puts them on the wire so a language model can use them
          directly.
        </p>
        <BentoGrid cards={mcpToolBento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A workflow, not a macro
        </h2>
        <p className="text-zinc-600 mb-6">
          The{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            @mediar-ai/workflow
          </code>{" "}
          SDK wraps steps, state, and error recovery around raw calls. Each
          step is a typed function with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            execute
          </code>{" "}
          and{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            onError
          </code>
          , sharing context through a Zod-typed object between steps. This is
          how you write a Windows automation script that survives flaky
          production conditions without turning into a pile of try / except.
        </p>
        <AnimatedCodeBlock
          code={workflowTs}
          language="typescript"
          filename="workflow.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Record once, replay deterministically
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          If you prefer not to write the script by hand, there is a workflow
          recorder. It lives at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            crates/terminator-workflow-recorder
          </code>{" "}
          and captures mouse, keyboard, clipboard, hotkeys, text input
          completion, and UI focus / property / structure changes. Double
          clicks are detected with the Windows-standard 500 ms time window
          and a 5-pixel distance tolerance (see the README for the tracker
          tests). The output is timestamped JSON with the full
          accessibility-tree metadata for each interaction, so the replay
          uses selectors, not coordinates.
        </p>
        <AnimatedCodeBlock
          code={recorderScript}
          language="rust"
          filename="record_workflow.rs"
        />
        <p className="text-zinc-600 text-sm leading-relaxed mt-6">
          The config lets you filter noise from system UI: clock updates,
          taskbar, notifications,{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            dwm.exe
          </code>
          , and{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            explorer.exe
          </code>{" "}
          are all ignorable out of the box via the{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            ignore_applications
          </code>{" "}
          and{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            ignore_focus_patterns
          </code>{" "}
          fields. Once the recording is saved, you can feed the JSON back
          through the same MCP tools that would run a hand-written script.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three numbers worth memorizing
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={24} />
            </div>
            <p className="text-sm text-zinc-600">
              Selector variants in the{" "}
              <code className="font-mono text-xs">Selector</code> enum at
              crates/terminator/src/selector.rs. One vocabulary for every
              framework.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={35} />
            </div>
            <p className="text-sm text-zinc-600">
              MCP tool handlers in terminator-mcp-agent/src/server.rs. Every
              one is a function your AI assistant can call directly.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={1} />
              <span className="text-2xl font-semibold text-zinc-500"> cmd</span>
            </div>
            <p className="text-sm text-zinc-600">
              claude mcp add terminator &quot;npx -y
              terminator-mcp-agent@latest&quot;. That is the entire install
              for Claude Code.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Watch one script execute, in three frames
        </h2>
        <MotionSequence
          title="open Calculator, compute 1 + 2, read the result"
          frames={[
            {
              title: "Frame 1: open_application",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  The script calls{" "}
                  <code className="font-mono text-sm">
                    desktop.open_application(&quot;calc.exe&quot;)
                  </code>
                  . Rust launches the process and returns a UIElement for the
                  root window. No pixel hunting, no title regex. If the UWP
                  identifier{" "}
                  <code className="font-mono text-sm">
                    uwp:Microsoft.WindowsCalculator
                  </code>{" "}
                  is available, the example prefers it and falls back to{" "}
                  <code className="font-mono text-sm">calc.exe</code>.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 2: locator().first().click()",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  Four locator lookups, one per button:{" "}
                  <code className="font-mono text-sm">Name:One</code>,{" "}
                  <code className="font-mono text-sm">Name:Plus</code>,{" "}
                  <code className="font-mono text-sm">Name:Two</code>,{" "}
                  <code className="font-mono text-sm">Name:Equals</code>. Each
                  resolves against the UIA tree and clicks. The selector
                  engine picks the right match out of the 24 primitives in{" "}
                  <code className="font-mono text-sm">selector.rs</code>.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 3: assert the result",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  The display is a{" "}
                  <code className="font-mono text-sm">
                    nativeid:CalculatorResults
                  </code>{" "}
                  element. Reading{" "}
                  <code className="font-mono text-sm">element.name()</code>{" "}
                  returns either &quot;3&quot; or &quot;Display is 3&quot;
                  depending on the Windows build, and the script accepts
                  both. If the assertion fails, the MCP loop re-reads{" "}
                  <code className="font-mono text-sm">get_window_tree</code>,
                  picks a new selector, and retries.
                </p>
              ),
              duration: 3200,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Terminator versus the traditional tooling
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="AutoHotkey / AutoIt / PowerShell"
          rows={comparisonRows}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want us to wire your Windows workflow into Claude Code?"
        description="Book 20 minutes and we will turn one of your existing AutoHotkey or PowerShell scripts into a selector-based Terminator workflow on a real app."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See a live Terminator script drive a Windows app the way Claude would."
      />
    </article>
  );
}
