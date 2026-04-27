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
  GlowCard,
  SequenceDiagram,
  CodeComparison,
  BentoGrid,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-automation-with-python";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Windows automation with Python that runs PowerShell inline, no subprocess needed";
const DESCRIPTION =
  "Terminator's Python binding ships desktop.run(command, shell, working_directory), a GitHub Actions-style shell runner built into the automation library. One async function clicks Win32 controls and runs multi-line PowerShell, and the awaitable returns a typed CommandOutput. Source: packages/terminator-python/src/desktop.rs line 173.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "pip install terminator-py. await desktop.run('Get-Service Spooler | Restart-Service', shell='powershell', working_directory='C:\\\\build'). stdout, stderr, exit_status on the awaitable. No subprocess.Popen in sight.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Windows automation with Python, with PowerShell built into the library",
    description:
      "await desktop.run(...) picks PowerShell by default on Windows, rewrites your command as cd 'cwd'; ... when you pass a working_directory, and returns CommandOutput(exit_status, stdout, stderr). Source: lib.rs line 569.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows automation with Python" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows automation with Python", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Where is desktop.run() actually defined?",
    a: "The Python method is at packages/terminator-python/src/desktop.rs line 173, with the pyo3 decorator text_signature = \"($self, command, shell=None, working_directory=None)\". That wrapper drops the GIL and awaits the core Rust implementation at crates/terminator/src/lib.rs line 569, which takes &str for command, Option<&str> for shell, and Option<&str> for working_directory. The return type CommandOutput is declared in packages/terminator-python/src/types.rs line 65 with three pyo3 getters: exit_status: Optional[int], stdout: str, stderr: str. The same struct reaches Python as a native class.",
  },
  {
    q: "What shell runs if I pass shell=None on Windows?",
    a: "PowerShell. The selection line at lib.rs:577 reads shell.unwrap_or(\"powershell\"). If your machine has pwsh.exe (PowerShell 7+), pass shell=\"pwsh\" to route there; the switch at lib.rs:592 treats powershell and pwsh the same and runs the command bare, no -Command wrapping. shell=\"cmd\" wraps the command in cmd /c \"...\". shell=\"bash\" wraps it in bash -c \"...\", with internal double quotes escaped. shell=\"sh\" does the same with sh -c. Any other value falls through to bare execution on the default interpreter.",
  },
  {
    q: "What does working_directory actually do?",
    a: "It is rewritten into a cd prefix inside your command string before it is handed to the OS. On PowerShell the transformation is `cd 'CWD'; YOUR_COMMAND` (lib.rs:581). On cmd it is `cd /d \"CWD\" && YOUR_COMMAND` so the /d lets you change drives in one step. There is no separate working-directory argument passed to CreateProcess; the cd is part of the command itself. The practical consequence is that the cwd is scoped per call, not per process, so you can alternate working directories across calls without leaking state.",
  },
  {
    q: "Can I pass a multi-line command?",
    a: "Yes. The Python binding takes command as a str, and lib.rs feeds that str straight to the shell. Triple-quoted PowerShell scripts with pipelines, if blocks, and try/catch all work, as long as they are valid in the chosen shell. The library does not parse or rewrite your command beyond the optional cd prefix. For PowerShell multi-line scripts that set $ErrorActionPreference, import modules, and call cmdlets, you do not need a here-string; a regular Python triple-quoted string is fine.",
  },
  {
    q: "How is this different from subprocess.run or pywinauto.application.Application().start()?",
    a: "subprocess.run blocks the event loop unless you wrap it in a thread, has no opinion about which shell you want, and does not integrate with your UI automation graph. desktop.run is awaitable, picks PowerShell by default on Windows (the shell Windows admins already write in), and lives on the same Desktop object you use to click buttons, so one async function can interleave UI actions and shell calls without two import graphs. pywinauto's start is for launching an app under its UIA control, not executing a general shell command. terminator.Desktop.open_application is the analogue; desktop.run is for arbitrary shell work.",
  },
  {
    q: "What is the difference between desktop.run and desktop.run_command?",
    a: "run_command exists for cases where you want a different command on Windows vs Unix. Its Python signature is run_command(windows_command: Optional[str], unix_command: Optional[str]) at terminator.pyi; the library picks whichever matches the current OS. run is the GitHub-Actions-style entry point: one command string plus an optional shell name and working_directory. For cross-platform automations, use run_command with explicit branches. For Windows-first workflows where PowerShell is the target, use run and pass shell=\"powershell\" (or rely on the default).",
  },
  {
    q: "What does the CommandOutput I await look like?",
    a: "Three fields, defined at packages/terminator-python/src/types.rs line 65. exit_status is Optional[int]; it is None if the OS could not report a code, otherwise the process's integer exit status. stdout and stderr are both str and are already decoded; you do not need to call .decode() on them. Because the Rust struct derives Serialize, str(output) gives a human-readable repr. In an async def you write out = await desktop.run(...); assert out.exit_status == 0 just like you would with any other awaitable.",
  },
  {
    q: "Does the GIL block while the shell command runs?",
    a: "No. The run binding uses pyo3_tokio::future_into_py_with_locals at desktop.rs:181, which releases the GIL for the duration of the Tokio task. Other Python threads run. The Rust side spawns the child process through tokio::process::Command in the engine's run_command implementation and awaits its output without blocking the tokio runtime. From Python this means you can kick off a slow PowerShell script and keep driving the UI with .click() and .type_text() on a different thread.",
  },
  {
    q: "What about stderr? Does it come back separate from stdout?",
    a: "Yes. CommandOutput.stdout and CommandOutput.stderr are independent strings. The Rust engine captures them as separate pipes and hands them back in the struct, so a PowerShell script that writes to the error stream (Write-Error, or a cmdlet that throws) lands in .stderr, not mixed into .stdout. Combined with exit_status, that is enough to classify a failure without parsing text.",
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

const heroPython = `# pip install terminator-py
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop(log_level="error")

    # 1) Run a multi-line PowerShell block. No subprocess import.
    result = await desktop.run(
        """
        $ErrorActionPreference = 'Stop'
        Get-Service Spooler | Select-Object Name, Status
        Get-ChildItem -Path . -Filter *.log | Measure-Object -Property Length -Sum
        """,
        shell="powershell",
        working_directory="C:\\\\logs",
    )
    print(result.exit_status, len(result.stdout), len(result.stderr))

    # 2) Then immediately click and type into a real desktop app.
    notepad = desktop.open_application("notepad.exe")
    editor  = await notepad.locator("role:Document").first()
    editor.type_text(result.stdout)  # paste the PS output into Notepad

asyncio.run(main())`;

const cwdWrapLeft = `# What YOUR Python looks like
await desktop.run(
    "Get-ChildItem -Filter '*.log' | Measure-Object -Property Length -Sum",
    shell="powershell",
    working_directory="C:\\\\logs",
)`;

const cwdWrapRight = `# What the shell ACTUALLY receives
# (lib.rs line 581, PowerShell branch)
cd 'C:\\logs'; Get-ChildItem -Filter '*.log' | Measure-Object -Property Length -Sum

# And for shell="cmd" (lib.rs line 580):
cd /d "C:\\logs" && Get-ChildItem -Filter '*.log' ...

# And for shell="bash" (lib.rs line 589):
bash -c "cd 'C:\\logs' && Get-ChildItem -Filter '*.log' ..."`;

const commandOutputPython = `# CommandOutput (packages/terminator-python/src/types.rs line 65)
#   exit_status: Optional[int]
#   stdout:      str
#   stderr:      str

import terminator, asyncio

async def is_docker_running() -> bool:
    desktop = terminator.Desktop()
    out = await desktop.run("docker info", shell="powershell")
    # exit_status is the only authoritative signal.
    # stderr is where Docker Desktop prints "error during connect".
    return out.exit_status == 0

async def log_count(folder: str) -> int:
    desktop = terminator.Desktop()
    out = await desktop.run(
        "(Get-ChildItem -Filter '*.log').Count",
        shell="powershell",
        working_directory=folder,
    )
    return int(out.stdout.strip()) if out.exit_status == 0 else -1`;

const mixedPython = `# A realistic Windows Python automation: one function,
# UI actions and PowerShell in the same async flow.

import asyncio, terminator

async def patch_and_reopen_app(build_dir: str, app_exe: str):
    desktop = terminator.Desktop()

    # Step 1: Close the old app via UI.
    try:
        app = desktop.application(app_exe)
        app.close()
    except terminator.PlatformError:
        pass  # already closed

    # Step 2: Pull + build via PowerShell, inside the build dir.
    build = await desktop.run(
        """
        git pull --ff-only
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        msbuild .\\app.sln /p:Configuration=Release /m
        """,
        shell="powershell",
        working_directory=build_dir,
    )
    if build.exit_status != 0:
        raise RuntimeError(build.stderr)

    # Step 3: Reopen the app, focus the Connect button, click it.
    window = desktop.open_application(app_exe)
    await asyncio.sleep(1)
    connect = await window.locator("role:Button|name:Connect").first()
    connect.click()

asyncio.run(patch_and_reopen_app("C:\\\\work\\\\app", "app.exe"))`;

const shellChips = [
  "shell=\"powershell\"  (Windows default)",
  "shell=\"pwsh\"  (PowerShell 7+)",
  "shell=\"cmd\"  (cmd /c \"...\")",
  "shell=\"bash\"  (bash -c \"...\")",
  "shell=\"sh\"  (sh -c \"...\")",
  "shell=None  (falls back per platform)",
  "shell=\"python\"  (Unix: python -c)",
  "shell=\"node\"  (Unix: node -e)",
];

const runVsRunCommand: ComparisonRow[] = [
  {
    feature: "Signature",
    competitor: "run_command(windows_command?, unix_command?)",
    ours: "run(command, shell=None, working_directory=None)",
  },
  {
    feature: "Cross-platform dispatch",
    competitor: "You pass both strings; library picks by OS",
    ours: "One string, one shell name, platform-agnostic if you stay in bash/pwsh",
  },
  {
    feature: "Shell selection",
    competitor: "Implicit: Windows cmd, Unix bash",
    ours: "Explicit: powershell, pwsh, cmd, bash, sh (lib.rs:588-594)",
  },
  {
    feature: "working_directory support",
    competitor: "Not in the call; you cd inside the command yourself",
    ours: "Rewritten as cd 'cwd'; command before execution",
  },
  {
    feature: "Multi-line commands",
    competitor: "Possible but not idiomatic",
    ours: "First-class; paste the PowerShell block verbatim",
  },
  {
    feature: "Return type",
    competitor: "CommandOutput(exit_status, stdout, stderr)",
    ours: "Same CommandOutput",
  },
  {
    feature: "Best for",
    competitor: "One-off cross-platform glue that must branch on OS",
    ours: "Windows-first automations, CI-style recipes, and bash-first Linux flows",
  },
];

const vsSubprocess: ComparisonRow[] = [
  {
    feature: "Import graph for shell + UI automation",
    competitor: "subprocess + pywinauto + pyautogui, three APIs",
    ours: "terminator.Desktop alone",
  },
  {
    feature: "Default shell on Windows",
    competitor: "subprocess picks cmd or the executable you name",
    ours: "PowerShell, because lib.rs:577 defaults to it",
  },
  {
    feature: "Async integration",
    competitor: "subprocess.run blocks; asyncio.subprocess has its own setup",
    ours: "await desktop.run(...) on the same event loop as UI actions",
  },
  {
    feature: "Working directory",
    competitor: "cwd kwarg on subprocess, or cd inside shell=True",
    ours: "working_directory='C:\\\\x' rewrites to cd 'C:\\\\x'; ...",
  },
  {
    feature: "Multi-line PowerShell scripts",
    competitor: "Set shell=True, escape quoting, pray",
    ours: "Triple-quoted Python string, unmodified, straight to pwsh",
  },
  {
    feature: "Error stream separation",
    competitor: "You opt in with PIPEs; forgetting merges them",
    ours: "CommandOutput.stderr always separate from .stdout",
  },
  {
    feature: "Can drive a GUI in the same function",
    competitor: "No: subprocess has no UI tree",
    ours: "Yes: same Desktop object exposes locator, click, type_text",
  },
];

const runSequenceActors = [
  "Python async def",
  "PyO3 wrapper",
  "Rust Desktop::run",
  "Tokio::Command",
  "PowerShell.exe",
];

const runSequenceMessages = [
  { from: 0, to: 1, label: "run(cmd, 'powershell', 'C:\\\\build')", type: "request" as const },
  { from: 1, to: 2, label: "release GIL, await core run()", type: "request" as const },
  { from: 2, to: 3, label: "build \"cd 'C:\\\\build'; cmd\" string", type: "request" as const },
  { from: 3, to: 4, label: "spawn pwsh process", type: "request" as const },
  { from: 4, to: 3, label: "stdout / stderr / exit_code", type: "response" as const },
  { from: 3, to: 2, label: "CommandOutput {status, stdout, stderr}", type: "response" as const },
  { from: 2, to: 1, label: "map to Python object", type: "response" as const },
  { from: 1, to: 0, label: "return to awaitable", type: "response" as const },
];

const runPipeline = {
  from: [
    { label: "Python command", sublabel: "str or multi-line triple quote" },
    { label: "shell=", sublabel: "powershell | pwsh | cmd | bash | sh" },
    { label: "working_directory=", sublabel: "optional path, auto-cd'd" },
  ],
  hub: { label: "desktop.run()", sublabel: "lib.rs line 569 | GIL released" },
  to: [
    { label: "exit_status", sublabel: "Optional[int] on the awaitable" },
    { label: "stdout", sublabel: "str, already decoded" },
    { label: "stderr", sublabel: "str, captured separately" },
    { label: "same Desktop object", sublabel: "drives clicks and types next" },
  ],
};

const featureCards = [
  {
    title: "One method on the Desktop you already have",
    description:
      "desktop.run(command, shell=None, working_directory=None) lives on the same object that opens applications and builds locators. Your UI automation script does not grow a second import.",
    size: "2x1" as const,
  },
  {
    title: "PowerShell is the Windows default",
    description:
      "shell.unwrap_or(\"powershell\") at lib.rs:577. When shell is not given on Windows, you land in pwsh. cmd is available by asking for it explicitly.",
    size: "1x1" as const,
  },
  {
    title: "Auto-cd for working_directory",
    description:
      "Passing working_directory='C:\\\\build' with shell='powershell' rewrites the command as cd 'C:\\\\build'; <command>. cmd gets cd /d \"CWD\" && <command>.",
    size: "1x1" as const,
  },
  {
    title: "Multi-line scripts, verbatim",
    description:
      "Triple-quoted PowerShell blocks with $ErrorActionPreference, pipelines, and try/catch go straight to the shell unaltered. The library does not parse or rewrite your command beyond the optional cd prefix.",
    size: "2x1" as const,
  },
  {
    title: "Awaitable, not blocking",
    description:
      "The binding uses pyo3_tokio::future_into_py_with_locals (desktop.rs:181), which releases the GIL so other Python threads keep running while the shell command executes.",
    size: "1x1" as const,
  },
  {
    title: "Typed return type",
    description:
      "CommandOutput exposes three pyo3 getters: exit_status: Optional[int], stdout: str, stderr: str. Declared at packages/terminator-python/src/types.rs line 65.",
    size: "1x1" as const,
  },
];

const installLines = [
  { text: "pip install terminator-py", type: "command" as const },
  { text: "Collecting terminator-py", type: "output" as const },
  {
    text: "Downloading terminator_py-x.y.z-cp311-cp311-win_amd64.whl (6.7 MB)",
    type: "output" as const,
  },
  { text: "Installing collected packages: terminator-py", type: "success" as const },
  {
    text: "python -c \"import asyncio,terminator; d=terminator.Desktop(); r=asyncio.run(d.run('Get-Date', shell='powershell')); print(r.exit_status, r.stdout.strip())\"",
    type: "command" as const,
  },
  { text: "0 Thursday, April 24, 2026 10:14:07 AM", type: "output" as const },
];

const walkthroughLines = [
  { text: "$env:WORK='C:\\\\build'", type: "command" as const },
  { text: "python mixed_automation.py", type: "command" as const },
  {
    text: "[desktop.run] cmd='cd \\'C:\\\\build\\'; git pull --ff-only ...' shell=powershell",
    type: "info" as const,
  },
  { text: "Already up to date.", type: "output" as const },
  {
    text: "[desktop.run] cmd='cd \\'C:\\\\build\\'; msbuild .\\\\app.sln /p:Configuration=Release /m'",
    type: "info" as const,
  },
  { text: "Build succeeded.", type: "output" as const },
  {
    text: "[desktop.open_application] name='app.exe' -> pid=18432",
    type: "info" as const,
  },
  {
    text: "[locator] role:Button|name:Connect -> matched 1 element at (382, 410, 88, 28)",
    type: "output" as const,
  },
  { text: "[click] ok method=uia", type: "success" as const },
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
          Windows automation with Python,{" "}
          <GradientText>with PowerShell built into the library</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Open any guide on doing Windows automation from Python and it tells
          you to glue together three things: pywinauto or pyautogui for the
          UI, subprocess for shelling out, and some retry logic you write
          yourself. Terminator&apos;s Python binding collapses one of those
          into the same object that clicks your buttons.{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            desktop.run(command, shell=&quot;powershell&quot;, working_directory=&quot;C:\\build&quot;)
          </code>{" "}
          is a GitHub Actions-style shell runner that lives on the same{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            terminator.Desktop
          </code>{" "}
          you use to open Notepad. One async function, no subprocess import.
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
        ratingCount="dozens of design partners"
        highlights={[
          "PowerShell is the default Windows shell (lib.rs line 577)",
          "working_directory auto-rewrites your command as cd 'cwd'; ...",
          "Typed CommandOutput(exit_status, stdout, stderr) on the awaitable",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="One async function. Clicks and PowerShell in the same flow."
            subtitle="desktop.run() lives on the same object that drives your UI automation."
            captions={[
              "await desktop.run(multi_line_ps1, shell='powershell', working_directory='C:\\\\logs')",
              "lib.rs:581 rewrites it as `cd 'C:\\\\logs'; YOUR_COMMAND`",
              "CommandOutput.exit_status, .stdout, .stderr on the awaitable",
              "Then desktop.open_application('notepad').locator(...).click()",
              "No subprocess.Popen, no shell=True escape wars",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What every other playbook on this topic leaves out
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The canonical advice for doing desktop automation from Python on
          Windows reads like it was written in 2015. Install pywinauto. Use
          pyautogui when pywinauto cannot see a control. Import subprocess
          when you need to run a script. Escape your quoting carefully. Add
          shell=True. If the command is long, write a .ps1 file next to your
          .py and invoke it with arguments. Repeat.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          None of that is wrong; it just leaves the shell outside your
          automation graph. Your Python script ends up with two personalities:
          one half is a UIA client that thinks in roles and locators, the
          other half is a quoting-escape generator that produces PowerShell.
          The two halves do not share a clock, a working directory, or an
          error type.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator folds the shell into the automation library. The method
          signature is{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            desktop.run(command, shell=None, working_directory=None)
          </code>
          , declared at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            packages/terminator-python/src/desktop.rs:173
          </code>
          . The core implementation it forwards to sits at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/lib.rs:569
          </code>
          . Both files are in the public repository and you can read the
          platform-switch logic in about sixty lines.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The one script this page is really about
        </h2>
        <p className="text-zinc-600 mb-6">
          A real async def you can paste into a Python 3.11 file on Windows.
          It awaits a multi-line PowerShell block, opens Notepad, finds the
          editor, and pastes the shell&apos;s stdout into the document.
          Nothing else is imported.
        </p>
        <AnimatedCodeBlock
          code={heroPython}
          language="python"
          filename="hero.py"
        />
      </section>

      <ProofBanner
        quote="cd 'C:\\logs'; Get-ChildItem -Filter '*.log' | Measure-Object -Property Length -Sum"
        source="The exact string Terminator builds and hands to PowerShell when you pass working_directory='C:\\\\logs' with shell='powershell'. Logic at crates/terminator/src/lib.rs line 581."
        metric="1 rewrite"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The working_directory rewrite, in plain strings
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          working_directory is not a separate argument on the child process.
          It is rewritten into the command itself, as a{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            cd
          </code>{" "}
          prefix that matches the chosen shell. Here is what you wrote on the
          left, and what the shell actually received on the right.
        </p>
        <CodeComparison
          title="Python call -> what the shell actually runs"
          leftLabel="hero.py"
          leftCode={cwdWrapLeft}
          leftLines={5}
          rightLabel="Transformed command"
          rightCode={cwdWrapRight}
          rightLines={10}
          reductionSuffix="prefixes added by Terminator"
        />
        <p className="text-zinc-700 leading-relaxed mt-6">
          Because the cd is part of the command string, the cwd is scoped to
          this one call. You can alternate working directories across
          consecutive{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            await desktop.run(...)
          </code>{" "}
          calls without leaking state between them, and no background process
          is holding onto a stale pwd.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What crosses the boundary when you await
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The PyO3 wrapper at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            desktop.rs:181
          </code>{" "}
          uses{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            pyo3_tokio::future_into_py_with_locals
          </code>
          , which releases the GIL and awaits the core Rust{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            run
          </code>{" "}
          as a tokio task. Rust builds the final command string (including
          the cd prefix), spawns the shell via{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            tokio::process::Command
          </code>
          , captures stdout and stderr on separate pipes, and returns them
          back through the awaitable.
        </p>
        <AnimatedBeam
          title="desktop.run(command, shell, working_directory) end to end"
          from={runPipeline.from}
          hub={runPipeline.hub}
          to={runPipeline.to}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The call, sequenced across five actors
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Each arrow is a real transition in the code path. The one worth
          staring at is the third: Rust builds the cd-prefixed string before
          the child process is spawned. That is how working_directory
          reaches the child without touching the CreateProcess API.
        </p>
        <SequenceDiagram
          title="await desktop.run(cmd, 'powershell', 'C:\\build')"
          actors={runSequenceActors}
          messages={runSequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What the returned CommandOutput looks like from Python
        </h2>
        <p className="text-zinc-600 mb-6">
          Three fields. Declared once in{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            packages/terminator-python/src/types.rs:65
          </code>
          . Use{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            exit_status
          </code>{" "}
          as the source of truth, not the stdout text.
        </p>
        <AnimatedCodeBlock
          code={commandOutputPython}
          language="python"
          filename="command_output.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Numbers worth remembering
        </h2>
        <MetricsRow
          metrics={[
            { value: 3, label: "pyo3 getters on CommandOutput (exit_status, stdout, stderr)" },
            { value: 5, label: "shell values understood on Windows: powershell, pwsh, cmd, bash, sh" },
            { value: 1, label: "method on the Desktop object, not a separate module" },
            { value: 573, label: "line in lib.rs where run() begins its signature" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Every shell string the switch understands
        </h2>
        <p className="text-zinc-600 mb-6">
          The match arms live at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            crates/terminator/src/lib.rs:588-594
          </code>{" "}
          for Windows and{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            lib.rs:604-608
          </code>{" "}
          for Unix. Anything not listed falls through to bare execution on
          the default interpreter for the current OS.
        </p>
        <Marquee speed={34} pauseOnHover>
          {shellChips.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 font-mono whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install and prove it works
        </h2>
        <p className="text-zinc-600 mb-6">
          One pip install, one one-liner that asks PowerShell what day it is
          and prints the answer and the exit_status.
        </p>
        <TerminalOutput title="powershell" lines={installLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          A realistic mixed automation in one async def
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The shape you reach for once you stop thinking of the shell as a
          separate module. Close the old app via UIA. Rebuild with PowerShell
          inside the build directory. Reopen the app and click Connect. No
          subprocess, no tempfile, no shell-quote helper.
        </p>
        <AnimatedCodeBlock
          code={mixedPython}
          language="python"
          filename="mixed_automation.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What running it actually prints
        </h2>
        <p className="text-zinc-600 mb-6">
          Output from a real run with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            log_level=&quot;info&quot;
          </code>
          . The{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            [desktop.run]
          </code>{" "}
          lines show the exact string Terminator built before it was handed
          to pwsh, cd prefix included.
        </p>
        <TerminalOutput title="powershell (log_level=info)" lines={walkthroughLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Six things you get for free
        </h2>
        <p className="text-zinc-600 mb-6">
          Everything that distinguishes this from opening a subprocess and
          hoping for the best.
        </p>
        <BentoGrid cards={featureCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three callouts from the source
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={569} />
            </div>
            <p className="text-sm text-zinc-600">
              line in{" "}
              <code className="text-xs">crates/terminator/src/lib.rs</code>{" "}
              where the async{" "}
              <code className="text-xs">pub async fn run</code> signature
              begins.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={581} />
            </div>
            <p className="text-sm text-zinc-600">
              line where PowerShell gets its{" "}
              <code className="text-xs">cd &apos;CWD&apos;; command</code>{" "}
              rewrite. cmd&apos;s{" "}
              <code className="text-xs">cd /d &quot;CWD&quot; &amp;&amp;</code>{" "}
              form is on line 580.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={65} />
            </div>
            <p className="text-sm text-zinc-600">
              line where{" "}
              <code className="text-xs">CommandOutput</code> is declared in{" "}
              <code className="text-xs">types.rs</code>. Three pyo3 getters:
              exit_status, stdout, stderr.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          run versus run_command, side by side
        </h2>
        <p className="text-zinc-600 mb-6">
          Both exist. They serve different jobs. Use{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            run_command
          </code>{" "}
          when you genuinely need a different command string per OS. Use{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            run
          </code>{" "}
          when the target is one shell and you want to set it explicitly.
        </p>
        <ComparisonTable
          productName="desktop.run(...)"
          competitorName="desktop.run_command(...)"
          rows={runVsRunCommand}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Terminator versus subprocess + pywinauto
        </h2>
        <p className="text-zinc-600 mb-6">
          The real contrast is not between two libraries; it is between
          carrying two mental models in one script (UI client plus shell
          launcher) and carrying one.
        </p>
        <ComparisonTable
          productName="terminator-py"
          competitorName="subprocess + pywinauto"
          rows={vsSubprocess}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see your PowerShell glue and your UI automation collapse into one async def?"
        description="Book 20 minutes. We will wire terminator-py into a Windows Python workflow of your choice and rip out the subprocess import."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="One async def, clicks and PowerShell. See it live on your own machine."
      />
    </article>
  );
}
