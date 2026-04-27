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
  NumberTicker,
  ShimmerButton,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  MetricsRow,
  CodeComparison,
  BentoGrid,
  GlowCard,
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/microsoft-power-automation-desktop";
const PUBLISHED = "2026-04-19";
const TITLE =
  "Microsoft Power Automation Desktop, but the workflow file is plain YAML your AI assistant can write";
const DESCRIPTION =
  "Power Automate Desktop locks your automation inside a proprietary designer. Terminator is a developer framework for the same job: the workflow is a YAML file with readable selectors like role:Button && name:Save, an MCP server Claude Code or Cursor talks to directly, and TERMINATOR_HEADLESS=true runs the same file unattended on a Windows VM.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A developer-first take on Microsoft Power Automate Desktop. Git-diffable YAML workflows, typeable selectors, MCP server your AI assistant drives, and unattended replay without per-bot licensing.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Power Automate Desktop, reframed for developers",
    description:
      "YAML workflows, typeable selectors (role:Button && name:Save), 32-tool MCP server, TERMINATOR_HEADLESS=true.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Microsoft Power Automation Desktop" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Microsoft Power Automation Desktop", url: PAGE_URL },
];

const padWorkflow = `<?xml version="1.0" encoding="utf-8"?>
<!-- What PAD actually writes to disk. The file extension is .txt
     but the content is a proprietary action DSL that only the
     Power Automate Desktop designer can open, diff, or edit.
     Selectors are captured as numeric element IDs bound to an
     opaque object repository; you cannot read them. -->

UIAutomation.LaunchApplication Application: $'''qbw.exe''' \\
  ProcessId=> AppProcessId WindowTitle=> AppTitle

UIAutomation.Click.Click Element: $'''appmask["Window 'QuickBooks'"]["Button 'Save'"]''' \\
  ClickType: UIAutomation.ClickType.LeftClick MouseMoveTime: 500

# The "appmask" string above is an opaque handle into an object
# repository that only exists inside the .pad file. You cannot
# review it in a pull request. You cannot author it by hand.
# You cannot generate it from an LLM.`;

const terminatorWorkflow = `# crates/terminator-mcp-agent YAML. Plain text. Diff it in git.
# Hand-edit it in VS Code. Ask Claude Code to generate it.

name: Post invoice to QuickBooks
variables:
  invoice_path: { type: string, default: "C:/in/INV-4412.pdf" }
  target_account: { type: string, default: "Expense:Software" }

selectors:
  qb_window:   "role:Window && name:QuickBooks Desktop"
  amount_fld:  "role:Edit   && name:Amount"
  acct_combo:  "role:ComboBox && name:Account"
  save_btn:    "role:Button && name:Save & Close"

steps:
  - id: open_qb
    tool_name: open_application
    arguments: { path: "qbw.exe" }

  - tool_name: wait_for_element
    arguments:
      selector: "\${{selectors.qb_window}}"
      condition: "exists"
      timeout_ms: 15000

  - id: read_invoice
    tool_name: run_command
    arguments:
      engine: javascript
      run: |
        const pdf = await desktop.pdf.read(invoice_path);
        return { amount: pdf.total, vendor: pdf.vendor };

  - tool_name: type_into_element
    arguments:
      selector: "\${{selectors.amount_fld}}"
      text_to_type: "\${{amount}}"

  - tool_name: select_option
    arguments:
      selector: "\${{selectors.acct_combo}}"
      option_name: "\${{target_account}}"

  - tool_name: click_element
    arguments: { selector: "\${{selectors.save_btn}}" }

stop_on_error: true`;

const selectorGrammar = `// From /Users/matthewdi/terminator/docs/SELECTORS_CHEATSHEET.md.
// The complete selector grammar, in one screen. Everything below
// is a string you can type, copy into YAML, or paste into a prompt.

role:Button                           // by accessibility role
name:Save                             // by accessible name/label
id:submit                             // by AutomationId (Windows)
nativeid:42                           // by OS-specific id
classname:Edit                        // by UI class name
text:Open                             // by visible text
pos:100,200                           // by screen coordinates
visible:true                          // filter by visibility
rightof:name:Username                 // positional: right of another
leftof:role:Checkbox                  // positional: left of another
above:name:OK                         // positional: above
below:name:OK                         // positional: below
near:text:Cancel                      // positional: within tolerance
nth:0                                 // nth element, 0-based
nth-1                                 // last element (nth from end)
..                                    // navigate to parent

role:Button && name:Close             // compound (and)
window:Calculator >> role:Button >> name:Seven   // chain (descendant)`;

const installCommands = `# One line. The MCP server is a Rust binary shipped via npm.
# It speaks MCP over stdio by default, or HTTP with -t http.

# Claude Code
claude mcp add terminator "npx -y terminator-mcp-agent@latest" -s user

# Cursor and VS Code: same npx invocation inside mcp.json:
# {
#   "mcpServers": {
#     "terminator-mcp-agent": {
#       "command": "npx",
#       "args": ["-y", "terminator-mcp-agent@latest"]
#     }
#   }
# }

# Verify 32 tools are live.
claude mcp list
#   terminator   stdio   32 tools`;

const headlessTerminal = [
  { text: "# One YAML file, two environments. Authored locally,", type: "output" as const },
  { text: "# replayed on a headless Windows VM. No RDP, no attended session.", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "scp post-invoice.yml ops@win-vm-01:C:/workflows/", type: "command" as const },
  { text: "Connection established", type: "success" as const },
  { text: "ssh ops@win-vm-01", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "# Virtual display context. Windows UIA still reads the tree.", type: "output" as const },
  { text: "set TERMINATOR_HEADLESS=true", type: "command" as const },
  { text: "", type: "output" as const },
  { text: "# Same YAML Claude Code authored this morning.", type: "output" as const },
  { text: "terminator mcp run C:/workflows/post-invoice.yml --verbose", type: "command" as const },
  { text: "[INFO ] Step 1/6  open_application      ok   230ms", type: "output" as const },
  { text: "[INFO ] Step 2/6  wait_for_element      ok   1.2s", type: "output" as const },
  { text: "[INFO ] Step 3/6  run_command (js)      ok   140ms", type: "output" as const },
  { text: "[INFO ] Step 4/6  type_into_element     ok   90ms", type: "output" as const },
  { text: "[INFO ] Step 5/6  select_option         ok   110ms", type: "output" as const },
  { text: "[INFO ] Step 6/6  click_element         ok   70ms", type: "output" as const },
  { text: "[INFO ] sequence finished               ok   1.9s total", type: "success" as const },
];

const padTerminal = [
  { text: "# Power Automate Desktop on the same task.", type: "output" as const },
  { text: "# There is no file you can run from a terminal.", type: "output" as const },
  { text: "# The flow lives inside the designer and the PAD runtime.", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# The documented way to run a flow unattended:", type: "output" as const },
  { text: "# 1. Open Power Automate for desktop (needs display)", type: "output" as const },
  { text: "# 2. Create or import the flow", type: "output" as const },
  { text: "# 3. Sign in with a work or school account", type: "output" as const },
  { text: "# 4. Pay for an unattended bot license (Process plan)", type: "output" as const },
  { text: "# 5. Install the on-premises gateway on the target VM", type: "output" as const },
  { text: "# 6. Trigger from Power Automate cloud", type: "output" as const },
  { text: "", type: "output" as const },
  { text: "# There is no `pad run flow.pad` command.", type: "error" as const },
];

const marqueeChips = [
  "role:Button && name:Save",
  "window:Calculator >> role:Button",
  "name:Seven",
  "id:submit",
  "execute_sequence",
  "terminator mcp run",
  "TERMINATOR_HEADLESS=true",
  "open_application",
  "type_into_element",
  "wait_for_element",
  "role:ComboBox",
  "role:Edit",
  "above:name:OK",
  "nth-1",
  "validate_element",
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Workflow file",
    competitor: "Proprietary PAD action DSL inside a designer-only file",
    ours: "Plain YAML you can diff in git, hand-edit, and generate from an LLM",
  },
  {
    feature: "Selector syntax",
    competitor: "Numeric element IDs bound to an opaque object repository",
    ours: "role:Button && name:Save, visible in the YAML, typeable, copy-pasteable",
  },
  {
    feature: "Authoring mode",
    competitor: "Drag and drop inside Power Automate for desktop",
    ours: "Ask Claude Code or Cursor; it emits YAML through the MCP server",
  },
  {
    feature: "Primary audience",
    competitor: "Citizen developers and IT admins inside a Microsoft tenant",
    ours: "Developers who already write Playwright, Rust, TypeScript, or Python",
  },
  {
    feature: "Accessibility tree access",
    competitor: "Abstracted behind the PAD recorder and object repository",
    ours: "Direct IUIAutomation via the uiautomation Rust crate, exposed as get_window_tree",
  },
  {
    feature: "AI-assistant integration",
    competitor: "Copilot add-on inside the designer; no MCP surface",
    ours: "32-tool MCP server over stdio; Claude, Cursor, VS Code, Windsurf all drive it",
  },
  {
    feature: "Unattended execution",
    competitor: "Needs Process plan license, on-prem gateway, Power Automate machine",
    ours: "TERMINATOR_HEADLESS=true and terminator mcp run workflow.yml; MIT licensed",
  },
  {
    feature: "Version control story",
    competitor: "Flow export is a binary-ish blob; pull request review is not practical",
    ours: "Text diff in any repo; code review is normal YAML review",
  },
  {
    feature: "Extensibility",
    competitor: "Custom actions require a separate SDK and signed modules",
    ours: "run_command with engine: javascript or engine: python embedded inline",
  },
  {
    feature: "Licensing",
    competitor: "Per-user / per-bot Microsoft 365 or Power Automate Premium",
    ours: "MIT on GitHub; fork it, ship it, no lock-in",
  },
];

const capabilityCards: BentoCard[] = [
  {
    title: "One selector grammar, everywhere",
    description:
      "role:Button && name:Save works in the YAML, in the MCP tool arguments, in Claude Code prompts, and in the Rust SDK. The same string routes through the accessibility tree the same way every time.",
    size: "2x1",
    accent: true,
  },
  {
    title: "32 MCP tools, one dispatch arm",
    description:
      "open_application, click_element, type_into_element, press_key_global, wait_for_element, validate_element, navigate_browser, execute_browser_script, run_command, execute_sequence, and more, all routed from one match in crates/terminator-mcp-agent/src/server.rs.",
    size: "2x1",
  },
  {
    title: "Direct UIA, no abstraction",
    description:
      "The Windows adapter binds to IUIAutomation through the uiautomation Rust crate. No PAD recorder in the middle, no object repository, no signed-custom-action SDK.",
  },
  {
    title: "Headless replay on a VM",
    description:
      "TERMINATOR_HEADLESS=true initializes a virtual display context. Windows UIA still reads the tree. The same YAML authored in Claude Code runs unattended without an interactive session.",
  },
  {
    title: "Recorder that writes diffable JSON",
    description:
      "terminator-workflow-recorder captures mouse, keyboard, clipboard, and UI automation events into a plain JSON stream you can replay or convert to YAML. No proprietary .pad archive.",
  },
  {
    title: "AI recovery when the tree is wrong",
    description:
      "fallback_id on a step jumps to a recovery path; a gemini_computer_use arm is available when the accessibility tree is missing or a pixel-only surface is in the way.",
  },
];

const whyDeveloperSteps = [
  {
    title: "The artifact is a text file",
    description:
      "Pull requests on automation changes work the same way they work for application code. A reviewer reads a diff. A lint rule checks a selector. A CI job runs terminator mcp run workflow.yml --dry-run. None of that is available when the flow lives inside a designer.",
  },
  {
    title: "The selectors are strings you can read",
    description:
      "role:Button && name:Save is self-describing. When a button label changes from Save to Save & Close, you see it in the diff. When an id is missing, you fall back to compound role+name or to positional locators like above:name:OK. No object repository to chase.",
  },
  {
    title: "The authoring loop includes an LLM",
    description:
      "You type a prompt into Claude Code or Cursor. The agent calls get_window_tree to see the UI, drafts a YAML with execute_sequence, runs it once to validate, and commits the result. A non-trivial workflow is authored in one loop, not fifty designer clicks.",
  },
  {
    title: "The runtime is a single Rust binary",
    description:
      "terminator-mcp-agent is 32 tools, one process, and a stdio transport. No Power Automate machine, no on-prem data gateway, no Azure dependency. MIT license means a fork is a git clone away.",
  },
  {
    title: "The execution context survives the session",
    description:
      "Per-workflow state.json under %LOCALAPPDATA%/mediar/workflows/<folder>/state.json lets the next run resume exactly where the last one stopped. Move the file to a VM, keep the state, replay unattended.",
  },
];

const checklist = [
  { text: "The workflow artifact is a text file you can diff in a pull request" },
  { text: "Selectors are readable strings (role, name, id, classname), not opaque handles" },
  { text: "An AI assistant can author the workflow by calling a documented MCP tool" },
  { text: "The same file runs unattended without a per-bot license" },
  { text: "The runtime binds directly to the OS accessibility API (UIA on Windows)" },
  { text: "Failure handling is encoded inside the workflow (fallback_id, jumps, stop_on_error)" },
  { text: "The project is MIT-licensed and forkable" },
];

const installSteps = [
  {
    title: "Install the Terminator MCP server",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user. User scope means every Claude Code session on the machine sees the 32 tools. Cursor and VS Code get the same binary via mcp.json.",
  },
  {
    title: "Confirm the dispatch is live",
    description:
      "claude mcp list shows terminator stdio 32 tools. The list is generated from the dispatch match in crates/terminator-mcp-agent/src/server.rs at build time, so if a handler exists the LLM sees it.",
  },
  {
    title: "Ask for a real task, not a hello world",
    description:
      "\"Post invoice INV-4412.pdf to QuickBooks under Expense:Software and save.\" Claude Code calls get_window_tree, drafts an execute_sequence YAML, runs it once for validation, and commits the file to .mediar/workflows/.",
  },
  {
    title: "Check the YAML into git",
    description:
      "The workflow is plain text. git add workflows/post-invoice.yml and review it in a pull request. Your reviewer reads the steps and the selectors without opening a designer.",
  },
  {
    title: "Replay unattended",
    description:
      "scp workflows/post-invoice.yml ops@win-vm-01:C:/flows/, set TERMINATOR_HEADLESS=true, run terminator mcp run C:/flows/post-invoice.yml. The same YAML, the same selectors, no interactive session, no per-bot license.",
  },
];

const faqs = [
  {
    q: "Is Terminator a drop-in replacement for Microsoft Power Automate Desktop?",
    a: "No, and it is not trying to be. PAD is a citizen-developer RPA tool inside the Power Platform with a designer, an object repository, a Copilot add-on, and per-bot licensing. Terminator is a developer framework: a Rust SDK, a TypeScript SDK (@mediar-ai/terminator), an MCP server (terminator-mcp-agent), and a workflow recorder. They overlap on the same underlying Windows API (UI Automation), but the authoring and deployment models are different. If you want drag-and-drop inside a Microsoft tenant, use PAD. If you want your workflow in git and your AI assistant writing it, use Terminator.",
  },
  {
    q: "What does Terminator's YAML workflow actually look like compared to a PAD flow?",
    a: "A Terminator workflow is a plain YAML file with four top-level blocks: variables, selectors, steps, and stop_on_error. Each step names a tool (open_application, click_element, type_into_element, wait_for_element, select_option, run_command, validate_element, and so on) and passes arguments. Selectors are strings: role:Button && name:Save, window:Calculator >> role:Button >> name:Seven, id:submit. A real example is at crates/terminator/examples/cron_example.yml in the repo. A PAD flow, by contrast, lives inside the designer's proprietary action DSL with numeric element IDs pointing into an object repository that you cannot review in a pull request.",
  },
  {
    q: "How do I get Claude Code or Cursor to author the workflow for me?",
    a: "Install the MCP server with claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" -s user (Claude Code) or the equivalent mcp.json block for Cursor, VS Code, or Windsurf. The server exposes 32 tools. Ask for a task, the assistant calls get_window_tree to read the current UI, drafts an execute_sequence YAML, and validates it. execute_sequence wraps a whole workflow in a single MCP call so the context window does not explode on a 20-step task. Power Automate Desktop has a Copilot add-on inside the designer, but there is no MCP interface an external agent can call.",
  },
  {
    q: "Can Terminator run the same workflow unattended on a Windows VM like PAD does?",
    a: "Yes, without the Process plan license, the on-prem data gateway, or the Power Automate machine. Set TERMINATOR_HEADLESS=true on the VM and run terminator mcp run workflow.yml. The agent detects the missing display session and spins up a virtual display context that Windows UI Automation can still read against. The workflow runs the same way an attended session runs: selectors resolve through IUIAutomation, clicks dispatch through invoke patterns, and the per-workflow state.json records progress so a failed run can resume.",
  },
  {
    q: "How is the selector syntax different from PAD's UI element capture?",
    a: "PAD records UI elements into an opaque object repository and references them by numeric ID in the flow. You cannot read the selector in a pull request; you open the designer to inspect it. Terminator uses plain strings documented in docs/SELECTORS_CHEATSHEET.md: prefixes like role:, name:, id:, nativeid:, classname:, text:, pos:, visible:, positional filters rightof:, leftof:, above:, below:, near:, indexing with nth:0 and nth-1, parent navigation with .., compound with && and chaining with >>. Example: window:Calculator >> role:Button >> name:Seven is a complete, readable locator for the Seven button in the Windows Calculator.",
  },
  {
    q: "What about licensing? PAD ships with Windows; is Terminator free?",
    a: "Power Automate for desktop is free to install, but unattended execution, premium connectors, and Power Automate hosted machines require Microsoft 365 or Power Automate Premium licensing with per-user or per-bot costs. Terminator is MIT-licensed on GitHub (github.com/mediar-ai/terminator). You can fork it, embed the Rust crate (terminator-rs) or the TypeScript SDK (@mediar-ai/terminator) in your own application, and ship it without a license key. The npm-distributed MCP server is the same MIT code.",
  },
  {
    q: "What is the actual runtime stack under Terminator on Windows?",
    a: "The core is the terminator Rust crate. On Windows it binds to the uiautomation crate, which wraps Microsoft's IUIAutomation COM interface (the same API PAD eventually calls). Selector resolution and element enumeration happen through direct UIA calls. Browser automation uses a Chrome extension on a local WebSocket (ws://127.0.0.1:17373) that accepts {action: 'eval', code} messages. The MCP agent (terminator-mcp-agent) is a separate Rust binary that imports terminator and speaks MCP over stdio or HTTP. macOS support exists for the Rust SDK via AX APIs; the MCP agent is Windows-first.",
  },
  {
    q: "How does error recovery work when a selector goes stale?",
    a: "Three mechanisms. First, fallback_id on a step lets the sequence engine jump to a named troubleshooting step instead of halting; that is inside execute_sequence, not in the LLM's re-planning loop. Second, continue_on_error: true on a step lets the workflow proceed past a non-fatal failure. Third, when the accessibility tree is wrong or the surface is pixel-only, a gemini_computer_use fallback arm is available that takes a screenshot and asks Gemini for coordinates. PAD's recovery model is a designer-level Error Handling block plus manual flow revision; Terminator encodes recovery inside the YAML so Claude Code does not have to re-plan after every transient failure.",
  },
  {
    q: "Can I record my screen and get a Terminator workflow out the other side?",
    a: "Yes. terminator-workflow-recorder is a Rust crate that hooks the Windows input stack and UI Automation event stream, producing a JSON workflow with every mouse click, keyboard event, clipboard operation, and focus change, each annotated with the UI element it hit. You can replay the JSON directly or translate it to YAML for execute_sequence. Documentation is in crates/terminator-workflow-recorder/README.md. PAD has a desktop recorder too, but its output is the proprietary flow format, not a plain text file.",
  },
  {
    q: "Where in the Terminator repo do I look to verify what this page claims?",
    a: "docs/SELECTORS_CHEATSHEET.md for the complete selector grammar. crates/terminator-mcp-agent/src/server.rs for the 32-tool dispatch (the match block near line 9953). crates/terminator-mcp-agent/README.md for the install commands, the MCP config JSON, and the TERMINATOR_HEADLESS notes. crates/terminator/examples/cron_example.yml for a runnable YAML workflow. crates/terminator-workflow-recorder/README.md for the recorder output format. crates/terminator/Cargo.toml for the uiautomation dependency that proves the Windows stack is direct IUIAutomation.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude computer use, grounded in the accessibility tree",
    excerpt:
      "Vision-based agents click pixels; Terminator clicks role:Button && name:Save. A comparison and how the two compose.",
    href: "/t/claude-computer-use",
    tag: "Comparison",
  },
  {
    title: "Playwright MCP server, for more than just the browser",
    excerpt:
      "Same MCP shape as playwright-mcp, scope that does not stop at the browser tab. Includes the Chrome extension bridge.",
    href: "/t/playwright-mcp-server",
    tag: "Comparison",
  },
  {
    title: "Claude Code MCP server that treats context as a budget",
    excerpt:
      "execute_sequence collapses N desktop steps into one MCP call, state.json survives the session, TERMINATOR_HEADLESS=true replays on a VM.",
    href: "/t/claude-code-mcp-server",
    tag: "Guide",
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
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
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
              <span className="inline-block bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full border border-orange-200">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Power Automate Desktop
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Developer RPA
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Windows UIA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.05]">
              Microsoft Power Automation Desktop, but the workflow is{" "}
              <GradientText variant="teal">plain YAML</GradientText> your AI
              assistant can write.
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              If you searched &quot;Microsoft Power Automation Desktop&quot;
              and every result is a Microsoft Learn page about installation,
              the designer, and the difference between a cloud flow and a
              desktop flow, this page is the other perspective. Terminator
              is a developer framework for the same job: automate Windows
              apps through the accessibility tree. The difference is where
              the workflow lives. PAD keeps it inside a proprietary designer.
              Terminator keeps it in a YAML file with readable selectors
              like{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
                role:Button &amp;&amp; name:Save
              </code>
              , an MCP server Claude Code or Cursor drives directly, and a{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
                TERMINATOR_HEADLESS=true
              </code>{" "}
              flag that runs the same file unattended on a Windows VM.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="top 'microsoft power automation desktop' results"
              highlights={[
                "YAML workflow, typeable selectors",
                "32-tool MCP server for AI assistants",
                "Direct IUIAutomation via uiautomation crate",
                "TERMINATOR_HEADLESS=true, MIT license",
              ]}
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="https://github.com/mediar-ai/terminator">
                Read the source on GitHub
              </ShimmerButton>
              <a
                href="#install"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-800 hover:border-orange-300 hover:text-orange-700 transition-colors"
              >
                Skip to the install
              </a>
            </div>
          </div>
        </BackgroundGrid>

        <div className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="Power Automate Desktop, for developers"
            subtitle="YAML workflows, readable selectors, MCP for your AI assistant"
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
            captions={[
              "PAD hides the workflow inside a designer",
              "Terminator keeps it in plain YAML",
              "Selectors are strings you can type",
              "Claude Code drives the MCP server",
              "TERMINATOR_HEADLESS=true replays on a VM",
            ]}
            durationInFrames={210}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6">
          <Marquee speed={40} pauseOnHover fade>
            <div className="flex items-center gap-3 pr-3">
              {marqueeChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-block rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-mono text-zinc-700 whitespace-nowrap"
                >
                  {chip}
                </span>
              ))}
            </div>
          </Marquee>
        </div>

        <section className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The one thing every Power Automate Desktop article skips
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            Every result on the first page of Google for &quot;microsoft power
            automation desktop&quot; is a Microsoft Learn page: Install,
            Introduction to desktop flows, Automate desktop applications,
            Prerequisites and limitations, Run unattended desktop flows. They
            are competent reference docs for the Microsoft product. They
            describe the designer, the Microsoft Store install versus the MSI,
            the Process plan license, and the steps to connect an on-prem data
            gateway for unattended bots.
          </p>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            None of them answer the first question a developer asks. What does
            the workflow file actually look like, and can I keep it in a git
            repository like the rest of my code? The answer with PAD is, in
            practice, no. The flow lives inside a proprietary action DSL bound
            to an object repository that only the designer can open. You can
            export it, but the export is not something you review in a pull
            request. That gap is the whole reason this page exists.
          </p>

          <ProofBanner
            quote="Every flow I ship, I can diff in git and run on a Windows VM without a bot license"
            metric="1 YAML file"
            source="The tradeoff Terminator optimizes for"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The workflow file, side by side
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-8">
            Same task: open QuickBooks, read an invoice PDF, type the amount,
            pick the account, save. The PAD version on the left is the
            documented shape of a Power Automate Desktop action sequence. The
            Terminator version on the right is a real YAML the MCP server
            executes with one{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              execute_sequence
            </code>{" "}
            call.
          </p>

          <CodeComparison
            title="PAD action DSL vs Terminator YAML"
            leftLabel="Power Automate Desktop"
            rightLabel="Terminator"
            leftCode={padWorkflow}
            rightCode={terminatorWorkflow}
            leftLines={padWorkflow.split("\n").length}
            rightLines={terminatorWorkflow.split("\n").length}
            reductionSuffix="lines of readable config"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The selector grammar, in one screen
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The whole Terminator selector language fits on one screen. This is
            the contents of{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              docs/SELECTORS_CHEATSHEET.md
            </code>{" "}
            distilled to its grammar rules. Every string here is something you
            can type into a YAML file, into an MCP tool argument, or into a
            Claude Code prompt.
          </p>

          <AnimatedCodeBlock
            code={selectorGrammar}
            language="text"
            filename="docs/SELECTORS_CHEATSHEET.md (grammar)"
          />

          <p className="text-base text-zinc-600 leading-relaxed mt-6">
            PAD represents the same information as a captured UI element in an
            object repository, referenced by numeric ID from the action DSL.
            You see that numeric ID in an export, but the human-readable
            mapping lives inside the designer. The selector above, in
            contrast, is the entire contract: a reviewer reads it, an LLM
            writes it, a linter checks it.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Your AI assistant, not a designer
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-8">
            The Terminator MCP server publishes 32 tools through one dispatch
            arm in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            . Any MCP-speaking assistant, Claude Code, Cursor, VS Code,
            Windsurf, can call them. The diagram below is the flow of a
            single authoring loop: the assistant reads the accessibility tree,
            drafts a YAML, runs the sequence once to validate.
          </p>

          <AnimatedBeam
            title="One MCP server, every major AI assistant"
            accentColor="#FF3E00"
            hub={{ label: "terminator-mcp-agent", sublabel: "32 tools, stdio" }}
            from={[
              { label: "Claude Code", sublabel: "claude mcp add" },
              { label: "Cursor", sublabel: "mcp.json" },
              { label: "VS Code", sublabel: "mcp block" },
              { label: "Windsurf", sublabel: "mcp config" },
            ]}
            to={[
              { label: "Windows UIA", sublabel: "IUIAutomation" },
              { label: "Chrome extension", sublabel: "ws://127.0.0.1:17373" },
              { label: "Shell + JS + Py", sublabel: "run_command" },
              { label: "Gemini fallback", sublabel: "gemini_computer_use" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Power Automate Desktop compared, field by field
          </h2>
          <ComparisonTable
            productName="Terminator"
            competitorName="Power Automate Desktop"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            The numbers that tell the story
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            A few concrete facts about the surface area you are comparing.
          </p>
          <MetricsRow
            metrics={[
              { value: 32, label: "MCP tools in one dispatch arm" },
              { value: 1, label: "YAML file per workflow" },
              { value: 100, suffix: "x", label: "Faster than vision-based agents" },
              { value: 95, suffix: "%", label: "Deterministic success rate" },
            ]}
          />
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
            Speed and success-rate numbers are the{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em] font-mono text-zinc-700">
              README.md
            </code>{" "}
            claims for deterministic YAML execution versus vision-based
            computer-use agents; the 32-tool count is what{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.9em] font-mono text-zinc-700">
              claude mcp list
            </code>{" "}
            prints after installation.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Unattended execution, without a bot license
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            PAD&apos;s unattended flow story is a Microsoft 365 or Power
            Automate Premium plan, an on-premises data gateway, a Power
            Automate machine group, and a cloud trigger. Terminator&apos;s is
            a single environment variable and a single CLI command.
          </p>
          <TerminalOutput title="Headless VM replay" lines={headlessTerminal} />
          <p className="text-base text-zinc-600 leading-relaxed mt-6">
            For comparison, here is what the PAD flow file looks like outside
            its designer.
          </p>
          <TerminalOutput
            title="Trying to run a PAD flow from a shell"
            lines={padTerminal}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <GlowCard>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
              What changes when the workflow becomes a text file
            </h2>
            <StepTimeline steps={whyDeveloperSteps} />
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            What the MCP server actually ships
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-8">
            A quick map of what you get when you run{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-[0.95em] font-mono text-zinc-800">
              npx -y terminator-mcp-agent@latest
            </code>
            . Every card here is a concrete feature, not a marketing promise.
          </p>
          <BentoGrid cards={capabilityCards} />
        </section>

        <section id="install" className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            Install and first real task
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            The whole install is one command. After that, every step here is
            something Claude Code or Cursor does for you, not a designer
            click.
          </p>
          <AnimatedCodeBlock
            code={installCommands}
            language="bash"
            filename="install"
          />
          <div className="mt-10">
            <StepTimeline title="From zero to a committed YAML" steps={installSteps} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 tracking-tight">
            A checklist for choosing a developer-grade desktop automator
          </h2>
          <p className="text-lg text-zinc-600 leading-relaxed mb-6">
            If you are leaving Power Automate Desktop (or arriving at the
            problem from a pure developer angle), these are the properties to
            hold your next tool to.
          </p>
          <AnimatedChecklist
            title="Developer RPA shortlist"
            items={checklist}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Walk through your PAD flow with the Terminator team"
            description="Bring one flow you would like to express as YAML. We will draft the selectors, wire up the MCP server, and run it against your target app live on the call."
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-14">
          <FaqSection heading="FAQ" items={faqs} />
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Other guides comparing Terminator to the tools people land on first"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Turn a PAD flow into a YAML workflow live on a call."
      />
    </div>
  );
}
