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
  AnimatedBeam,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  MetricsRow,
  BentoGrid,
  CodeComparison,
  BeforeAfter,
  StepTimeline,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-script-automation";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Windows script automation: one MCP tool, six scripting engines, one desktop SDK";
const DESCRIPTION =
  "PowerShell, Node, Bun, TypeScript, Python, cmd, bash. One MCP tool (run_command) drives all of them and injects a desktop SDK as a global so a single Windows script can shell out to the registry and click a WPF button in the same execution. Source: terminator-mcp-agent/src/utils.rs:963.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Six engines on a single MCP tool. PowerShell for system queries, JavaScript and Python with a desktop SDK for UIA clicks, all in one workflow with typed variable passing between steps.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows script automation, polyglot edition",
    description:
      "PowerShell + JavaScript + Python in one workflow. The desktop SDK is a global. set_env passes typed values between steps.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows script automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows script automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does Terminator's run_command tool actually do that PowerShell or AutoHotkey alone cannot?",
    a: "run_command is a single MCP tool that accepts an engine argument. The engine can be node, bun, javascript/js, typescript/ts, python/py, or you can leave engine off and use the shell field with powershell, pwsh, cmd, bash, or sh. When you pick an engine in the JS, TypeScript, or Python family, Terminator wraps your script in a preamble that injects a desktop object as a global. That object is a real instance of the @mediar-ai/terminator SDK, which talks directly to Microsoft UI Automation. So in one tool call your script can both run a system shell command and walk the accessibility tree of any open window. PowerShell on its own cannot click a WPF combo box. AutoHotkey on its own cannot read an Active Directory query result back into a typed object. Terminator lets one workflow do both because the bridge is the MCP tool, not the language.",
  },
  {
    q: "Where exactly is the desktop SDK injected?",
    a: "Look at crates/terminator-mcp-agent/src/scripting_engine.rs around line 1059. The Node wrapper builds a temporary main_<timestamp>.js that starts with const { Desktop } = require('@mediar-ai/terminator'); global.desktop = new Desktop();. It also exposes global.log, global.sleep, global.emit (the workflow event emitter), and global.createKVClient (a key/value store helper). Your script body is then executed inside an async IIFE with those globals destructured into local scope. The Python and TypeScript engines do the equivalent for their runtimes. That is why your inline code can write desktop.openApplication('notepad.exe') without any import line.",
  },
  {
    q: "How do steps in different languages share data?",
    a: "Through set_env. Inside execute_sequence, the docstring for the tool spells it out: return a JSON object shaped like {set_env: {key: value}} from any run_command step, and the runtime stores those keys for the rest of the sequence. Subsequent steps reference them as {{key}} substitutions in tool args, or as bare variable names in conditional expressions. There is even a small fallback parser at server.rs line 663 (parse_set_env_from_script) that scans simple return-shaped scripts when the structured response is missing. You can run a PowerShell step that emits {set_env: {invoiceId: 'INV-2031'}}, then a JavaScript step that reads invoiceId without re-querying the source.",
  },
  {
    q: "Which Windows shells are supported when I do not want the SDK injected?",
    a: "When you omit the engine field and pass shell instead, the supported values on Windows are powershell, pwsh, cmd, bash (Git Bash or WSL), and sh. The default on Windows is powershell. The dispatcher at crates/terminator-mcp-agent/src/server.rs line 4830 picks the right invocation: cmd /c for cmd, bash -c for bash and sh, and a direct command line for PowerShell. timeout_ms defaults to 120000 ms (two minutes) and 0 means no timeout. Working directory is honored per shell with the right cd syntax (cd /d for cmd, cd ' ' for PowerShell).",
  },
  {
    q: "Can I run a workflow file mixing engines from a single MCP call?",
    a: "Yes. execute_sequence takes a workflow definition (inline, file path, or URL pointing at a .yaml/.json) and dispatches each step through the same run_command machinery. So step 1 can be {run: 'Get-Service Spooler | Select-Object -ExpandProperty Status', shell: 'powershell'}, step 2 can be {engine: 'javascript', run: 'await desktop.locator(...).first().click()'}, step 3 can be {engine: 'python', run: 'import json; print(json.dumps({...}))'}. Variables flow with {{name}} substitution. Failed steps can return rich diagnostics that the LLM uses to patch the workflow and retry. The single MCP entry point keeps the AI assistant in the loop end to end.",
  },
  {
    q: "What is the difference between run and script_file?",
    a: "Both fields live on RunCommandArgs in crates/terminator-mcp-agent/src/utils.rs at line 963. run is inline source code as a string. script_file is a path to a file on disk. Exactly one of the two must be provided. When script_file is used, the resolver tries scripts_base_path first, then the workflow directory, then the path as-is. Reading the file fails fast with a clear error and the list of resolution attempts. This is the part that lets a workflow author keep larger scripts on disk under version control and reference them by name from a YAML, instead of stuffing 200 lines of TypeScript into a YAML string.",
  },
  {
    q: "Does the script have access to environment variables?",
    a: "Yes, two ways. The env field on RunCommandArgs accepts a JSON object that the runtime injects into the script. JSON strings inside that object are auto-parsed back into objects or arrays so a value like '[1,2,3]' arrives as an actual array, not a string you have to JSON.parse yourself. Variables also become bare identifiers in JavaScript and Python; you do not need an env. prefix. On top of that, regular process environment variables (PATH, USERPROFILE, all the rest) are inherited the way any spawned process inherits them.",
  },
  {
    q: "What gets returned from a script step?",
    a: "The wrapper writes a sentinel-bracketed result to stdout: __RESULT__<json>__END__ on success, __ERROR__<json>__END__ on failure. The MCP server parses that envelope, extracts the structured value, and packages it back as the tool result alongside captured logs (stdout and stderr). If include_logs is true (default) those logs ride along, and on errors they are always included regardless of the flag. include_monitor_screenshots adds a base64 screenshot of every monitor at the end, useful for the LLM to see what the script left on screen.",
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

const installLines = [
  { text: "# wire one tool that runs every Windows script flavor", type: "output" as const },
  {
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest"',
    type: "command" as const,
  },
  {
    text: "Added MCP server terminator (npx -y terminator-mcp-agent@latest)",
    type: "success" as const,
  },
  { text: "# now your assistant can call run_command with any engine:", type: "output" as const },
  { text: 'engine: "javascript" -> Node, with global.desktop injected', type: "output" as const },
  { text: 'engine: "python"     -> CPython, with desktop module bound', type: "output" as const },
  { text: 'engine: "typescript" -> Bun, transpiled, same global.desktop', type: "output" as const },
  { text: 'shell:  "powershell" -> raw PowerShell, no SDK, no overhead', type: "output" as const },
  { text: 'shell:  "cmd"        -> classic cmd /c "..."', type: "output" as const },
  { text: 'shell:  "bash"       -> Git Bash or WSL bash', type: "output" as const },
];

const polyglotPipeline = {
  title: "One MCP tool routes every script flavor through one desktop binding",
  from: [
    { label: "PowerShell step", sublabel: "Get-Service / WMI / AD" },
    { label: "JavaScript step", sublabel: "global.desktop, click, type" },
    { label: "TypeScript step", sublabel: "Bun, transpiled, typed" },
    { label: "Python step", sublabel: "import binding free" },
    { label: "cmd / bash step", sublabel: "shell-out for raw output" },
  ],
  hub: {
    label: "run_command",
    sublabel: "1 of 35 MCP tools",
  },
  to: [
    { label: "Windows UIA tree", sublabel: "any open window" },
    { label: "set_env bag", sublabel: "{{key}} into next step" },
    { label: "stdout + stderr", sublabel: "back to the LLM" },
    { label: "screenshots", sublabel: "monitor capture, optional" },
  ],
};

const enginePills = [
  "engine: node",
  "engine: bun",
  "engine: javascript",
  "engine: typescript",
  "engine: python",
  "shell: powershell",
  "shell: pwsh",
  "shell: cmd",
  "shell: bash",
  "shell: sh",
  "set_env: { ... }",
  "{{var}} substitution",
];

const engineBento: BentoCard[] = [
  {
    title: "engine: javascript",
    description:
      "Node or Bun. Runs your inline code inside an async IIFE with global.desktop, global.sleep, global.log, global.emit, and global.createKVClient already destructured into scope. No import line, no boilerplate.",
    size: "2x1",
    accent: true,
  },
  {
    title: "engine: typescript",
    description:
      "Same as above, transpiled on the fly. Brings types to your selectors and lets the LLM author with autocomplete-shaped intent.",
  },
  {
    title: "engine: python",
    description:
      "CPython. The terminator-py module is pre-bound, environment variables are auto-typed, and __RESULT__ markers carry the return value back.",
  },
  {
    title: "shell: powershell",
    description:
      "Default on Windows. No SDK injection, no overhead. Use it for Get-Service, registry edits, Get-WmiObject, and Get-ADUser. Output flows back as stdout for the next engine step to consume.",
    size: "2x1",
  },
  {
    title: "shell: cmd",
    description:
      "Classic cmd.exe. Works for legacy .bat orchestration and for tools that hate PowerShell quoting.",
  },
  {
    title: "shell: bash",
    description:
      "Git Bash on Windows, or WSL bash. Useful when your team has cross-platform muscle memory.",
  },
  {
    title: "set_env between steps",
    description:
      "Return { set_env: { key: value } } from any step. The runtime stores those keys and substitutes {{key}} into later step args. Typed JSON survives the round trip.",
    size: "2x1",
  },
  {
    title: "script_file resolver",
    description:
      "Pass a path instead of inline code. The resolver checks scripts_base_path, then the workflow directory, then the path as-is. Errors include every attempted location.",
  },
  {
    title: "include_logs + screenshots",
    description:
      "On by default. Logs always returned on errors. Optional monitor screenshots make the LLM aware of UI state without a second tool call.",
  },
];

const shellOnly = `# windows-only.ps1 ---------------------------------------
# PowerShell can do this part fine on its own.
$svc = Get-Service Spooler | Select-Object -ExpandProperty Status
$user = (Get-CimInstance Win32_ComputerSystem).UserName
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# But now you need to OPEN your line-of-business app
# (a 2014-era WPF tool that has no API), find the
# 'Print spooler' field, type the status, hit Save.
# This is the part PowerShell cannot do.

# You shell out to AutoHotkey? It does not understand
# the WPF accessibility tree.
# You shell out to Selenium? Wrong stack.
# You hand it to a human? You wrote a script for nothing.

Write-Host "Status: $svc | User: $user | Time: $ts"
# ... and now you stop, because the OS is in your way.`;

const polyglot = `# workflow.yaml -------------------------------------------
# One MCP execute_sequence call. Three engines.
# Variables flow between steps via set_env.

steps:
  - name: read system state
    tool_name: run_command
    arguments:
      shell: powershell
      run: |
        $svc = Get-Service Spooler |
          Select -ExpandProperty Status
        $obj = @{ spooler = "$svc"; ts = (Get-Date).ToString("o") }
        $obj | ConvertTo-Json -Compress

  - name: store state for next step
    tool_name: run_command
    arguments:
      engine: javascript
      env:
        sysJson: "{{steps[0].stdout}}"
      run: |
        const state = JSON.parse(sysJson);
        return { set_env: { spoolerStatus: state.spooler } };

  - name: drive the WPF app with the desktop SDK
    tool_name: run_command
    arguments:
      engine: javascript
      run: |
        const win = await desktop.openApplication("LobApp.exe");
        await desktop.delay(1500);
        const field = await win.locator(
          "role:edit|name:Print spooler"
        ).first();
        await field.typeText("{{spoolerStatus}}");
        const save = await win.locator(
          "role:button|name:Save"
        ).first();
        await save.click();
        return { saved: true };`;

const stepTimeline = [
  {
    title: "Decide which engine each step actually needs",
    description:
      "Registry reads, service status, AD lookups, file ACLs: PowerShell wins. UI clicks, typed input, accessibility tree dumps: JavaScript or Python with the desktop SDK. Data shaping or numerical work: Python. CSV ingest from a 2002 .bat: cmd. Treat the engine field on run_command as the only routing decision you have to make.",
  },
  {
    title: "Wrap each step as a run_command call",
    description:
      "Pick run for inline code or script_file for a versioned file. Add env: { ... } to inject typed variables. Set timeout_ms if the step is long. Set include_monitor_screenshots: true when you want the LLM to see the screen after the step lands.",
  },
  {
    title: "Pass typed data downstream with set_env",
    description:
      "Return { set_env: { key: value } } from any step. Reference it later as {{key}} in tool arguments or as the bare identifier inside a JavaScript or Python step (variables are injected into local scope by the wrapper). Strings stay strings, numbers stay numbers, parsed JSON arrives as an actual array.",
  },
  {
    title: "Let the agent recover from broken selectors",
    description:
      "If a desktop locator fails, do not retry blindly. Have the LLM call get_window_tree to dump the fresh UIA subtree as JSON, ask it for a replacement selector, then call run_command again with the patched code. The README pegs that pattern at >95% success and roughly 100x faster than pure pixel-vision agents on the same task.",
  },
  {
    title: "Bind the whole thing to one execute_sequence call",
    description:
      "Put the steps in a YAML or JSON file. Run them through execute_sequence with the file:// URL. State is persisted to .mediar/workflows/, so you can resume from any step after a failure. Step ranges are addressable, which means the LLM can re-run only the broken middle without re-doing the long opening setup.",
  },
];

const beforeAfter = {
  title: "What a Windows automation playbook used to look like vs polyglot",
  before: {
    label: "Single-language script",
    content:
      "Pick PowerShell, AutoHotkey, AutoIt, or no-code Power Automate Desktop. Live with the trade-off forever. PowerShell scripts that need to drive a UI shell out to AutoHotkey through a temp file. AutoHotkey scripts that need a system query shell out to PowerShell through cmd /c. Power Automate Desktop hides the script and reformats your logic into a click-to-build canvas you cannot diff in git. The AI assistant in your editor cannot meaningfully author or run any of these end to end.",
    highlights: [
      "PowerShell cannot click WPF, UWP, or Electron controls cleanly",
      "AutoHotkey has no first-class API for AD or registry",
      "Power Automate Desktop is a GUI, not a scriptable surface",
      "Glue between languages lives in temp files and stdout parsing",
    ],
  },
  after: {
    label: "Polyglot via run_command",
    content:
      "Author one workflow. Each step picks the engine it needs. PowerShell does what PowerShell does. JavaScript with the injected desktop SDK clicks through the WPF app the AI just opened. Python crunches the result. Variables flow with set_env. The AI assistant lives in the loop, calling the same MCP tool for every step, and patches selectors when they go stale by reading get_window_tree.",
    highlights: [
      "One tool, six engines, one set of variable plumbing",
      "Desktop SDK auto-injected as a global into JS, TS, and Python",
      "Workflow file is plain YAML or JSON, diffable in git",
      "Same loop authors, runs, recovers, and asserts",
    ],
  },
};

const cliInstall = `// run-from-typescript.ts
// You do not have to live inside a YAML file. Same engines,
// same desktop SDK injection, called directly from your code.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "terminator-mcp-agent@latest"],
});

const mcp = new Client(
  { name: "polyglot-runner", version: "0.1.0" },
  { capabilities: {} }
);
await mcp.connect(transport);

// Step A: PowerShell, no SDK injection
const ps = await mcp.callTool({
  name: "run_command",
  arguments: {
    shell: "powershell",
    run: "(Get-CimInstance Win32_OperatingSystem).Caption",
  },
});

// Step B: JavaScript with global.desktop injected by the wrapper
const js = await mcp.callTool({
  name: "run_command",
  arguments: {
    engine: "javascript",
    run: \`
      const win = await desktop.openApplication("notepad.exe");
      await desktop.delay(800);
      const editor = await win.locator("role:edit").first();
      await editor.typeText("Running on: {{os}}");
      return { typed: true };
    \`,
    env: { os: ps.content[0].text },
  },
});

console.log(js);`;

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
          Windows script automation, when{" "}
          <GradientText>one tool runs every flavor</GradientText> and the
          desktop comes for free
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Almost every guide on this topic forces a language pick: PowerShell,
          AutoHotkey, AutoIt, or a no-code canvas. Terminator goes the other
          way. One MCP tool, run_command, accepts six different scripting
          engines (Node, Bun, JavaScript, TypeScript, Python, plus
          PowerShell/cmd/bash via shell mode). The JavaScript, TypeScript, and
          Python engines get a real desktop SDK injected as a global, which
          means a single Windows script can shell out to the registry and
          click a WPF button in the same execution. Variables flow between
          steps via set_env. The AI assistant in your editor sits in the loop
          end to end.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="10 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="design partners running polyglot Windows workflows in production"
        highlights={[
          "Six engines on one MCP tool (utils.rs:963)",
          "global.desktop injected by Node wrapper (scripting_engine.rs:1059)",
          "set_env state passing across PowerShell, JS, and Python steps",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Windows script automation, polyglot edition"
            subtitle="One MCP tool. Six engines. The desktop SDK is a global."
            captions={[
              "PowerShell, Node, Bun, TypeScript, Python, cmd, bash",
              "global.desktop is already in scope, no import",
              "set_env carries typed values between steps",
              "Your AI assistant authors and runs every step",
              "WPF, UWP, Win32, Electron: same locator surface",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The shape of the problem
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Windows automation has always been bottlenecked by the fact that the
          right tool for one slice is the wrong tool for the next. Querying
          services, the registry, Active Directory, IIS, scheduled tasks: that
          is PowerShell territory and nothing else gets close. Pressing Ctrl+S
          inside a 2014 WPF line-of-business app: PowerShell pretends, but
          really you want a UI Automation client. Pulling a row out of a
          confidential .csv your finance team produces every Monday: Python
          handles that in five lines. Calling a 2003-vintage cmd batch script
          your CFO insists on keeping: cmd.exe.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Most articles about this offer a forced pick. Pick one tool, learn
          its quirks, accept that the other 60 percent of the work has to live
          in another tool somewhere else. The hidden cost shows up as glue:
          temp files, parsed stdout, ad-hoc scheduled tasks, brittle COM
          interop. None of that scales when an AI coding assistant tries to
          author the workflow.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator&apos;s answer is that the bridge should be the tool, not
          the language. One MCP tool, run_command, runs whichever engine fits
          the step, and the JavaScript, TypeScript, and Python engines arrive
          with a real desktop SDK already in scope.
        </p>
      </section>

      <Marquee speed={40} fade>
        <div className="flex gap-3 px-3">
          {enginePills.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 text-xs font-mono whitespace-nowrap"
            >
              {pill}
            </span>
          ))}
        </div>
      </Marquee>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          One tool, six engines, one wiring diagram
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Here is what actually happens when an MCP client (Claude Code,
          Cursor, your own TypeScript code calling the agent over stdio) fires
          a run_command call. The tool dispatcher looks at the engine field
          first. If it matches one of node, bun, javascript, js, typescript,
          ts, python, py, the request enters the engine path. The runtime
          writes a wrapper script that imports @mediar-ai/terminator and
          assigns a Desktop instance to a global named desktop. Your script
          body executes inside an async IIFE that destructures that global
          (plus log, sleep, emit, createKVClient) into local scope. If engine
          is missing, the request enters the shell path: PowerShell on
          Windows by default, with cmd, pwsh, bash, and sh available.
        </p>
      </section>

      <AnimatedBeam
        from={polyglotPipeline.from}
        hub={polyglotPipeline.hub}
        to={polyglotPipeline.to}
        title={polyglotPipeline.title}
        accentColor="#FF3E00"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact: where the SDK is injected
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If you want to verify the JavaScript engine actually does what we
          claim, open
          {" "}
          <code className="text-sm font-mono bg-orange-50 text-orange-700 border border-orange-200 px-1 rounded">
            crates/terminator-mcp-agent/src/scripting_engine.rs
          </code>
          {" "}
          in the Terminator repo and jump to roughly line 1059. The wrapper
          template is right there in a Rust raw string literal. It writes a
          temp file shaped like the snippet below before spawning Node, which
          is why your inline script can write
          {" "}
          <code className="text-sm font-mono bg-orange-50 text-orange-700 border border-orange-200 px-1 rounded">
            await desktop.locator(...)
          </code>
          {" "}
          on the very first line with no import.
        </p>
      </section>

      <AnimatedCodeBlock
        code={`// scripting_engine.rs:1059 — auto-generated wrapper, abridged
const { Desktop } = require('@mediar-ai/terminator');

global.desktop = new Desktop();
global.log = console.log;
global.sleep = (ms) => new Promise(r => setTimeout(r, ms));

try {
  const { emit, createStepEmitter } = require('@mediar-ai/workflow');
  global.emit = emit;
  global.createStepEmitter = createStepEmitter;
} catch (_) { /* no-op fallbacks */ }

(async () => {
  try {
    const result = await (async () => {
      // Your inline run: code lands here, with these in scope.
      const { desktop, emit, log, sleep, createKVClient } = global;
      // ---- USER SCRIPT BODY ----
      <YOUR CODE>
      // ---- END USER SCRIPT BODY ----
    })();
    process.stdout.write(
      '__RESULT__' + JSON.stringify(result ?? null) + '__END__\\n'
    );
  } catch (error) {
    process.stdout.write(
      '__ERROR__' + JSON.stringify({
        message: String(error?.message ?? error),
        stack:   String(error?.stack ?? '')
      }) + '__END__\\n'
    );
  }
})();`}
        language="javascript"
        filename="scripting_engine.rs (Rust raw string, JS contents)"
      />

      <ProofBanner
        quote="The wrapper file is named main_<unix_nanos>.js and dropped into the same directory where the @mediar-ai/terminator package is installed. The unique timestamp is exactly why two concurrent run_command calls do not collide on disk."
        source="scripting_engine.rs comments around line 1136"
        metric="0 collisions"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where a single-language script gives up
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Take a workflow most teams hit at least once a quarter: a system
          query that informs a UI action. Read the Spooler service status,
          then write that status into a field inside a WPF app the team has
          been running since 2014. PowerShell can do the first half. It cannot
          do the second half.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Look at the two scripts side by side. The first is the version that
          ends at the OS boundary. The second is the polyglot run_command
          workflow that crosses it.
        </p>
      </section>

      <CodeComparison
        leftCode={shellOnly}
        rightCode={polyglot}
        leftLines={shellOnly.split("\n").length}
        rightLines={polyglot.split("\n").length}
        leftLabel="PowerShell only"
        rightLabel="run_command polyglot"
        title="Bridge the OS boundary in one workflow"
        reductionSuffix="lines, end to end"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What each engine unlocks
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          The engine field on run_command is the only routing decision your
          AI assistant has to make per step. The bento below maps each value
          to what that engine is best at, and what it brings into scope.
        </p>
      </section>

      <BentoGrid cards={engineBento} />

      <BeforeAfter
        title="Picking one language vs picking the right engine per step"
        before={beforeAfter.before}
        after={beforeAfter.after}
      />

      <MetricsRow
        metrics={[
          { value: 6, label: "scripting engines on one MCP tool" },
          { value: 35, label: "total MCP tools in terminator-mcp-agent" },
          { value: 24, label: "selector primitives in selector.rs" },
          { value: 120000, label: "default timeout_ms (2 min)" },
        ]}
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The five steps of authoring a polyglot workflow
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          You do not have to memorize a new framework. The work happens in
          five small choices. Each one is a property on a run_command call or
          on the wrapping execute_sequence step.
        </p>
      </section>

      <StepTimeline steps={stepTimeline} />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Skip YAML and call run_command from your own TypeScript
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The MCP server is the durable interface, but you can talk to it
          without a workflow file at all. Open it as a stdio process from any
          language with an MCP client and call run_command directly. The same
          engine routing applies. The same desktop SDK gets injected. You
          just orchestrate the steps in your own code.
        </p>
      </section>

      <AnimatedCodeBlock
        code={cliInstall}
        language="typescript"
        filename="run-from-typescript.ts"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install in 30 seconds
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          One npx-shaped MCP server line gives Claude Code (or Cursor, VS
          Code, Windsurf, anything else that speaks MCP) the ability to call
          run_command with any of the six engines. From that moment your
          assistant can author and run polyglot Windows workflows.
        </p>
      </section>

      <TerminalOutput lines={installLines} title="Wire it up" />

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see a polyglot workflow drive your real desktop?"
        description="Bring the WPF app, the PowerShell snippet, and the Python step. We will build the workflow live in 20 minutes."
      />

      <FaqSection items={faqs} className="mt-16" />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="20 min walkthrough: one MCP tool, six engines, your real desktop."
      />
    </article>
  );
}
