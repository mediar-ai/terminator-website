import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/sentence-to-desktop-automation-script";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-11";
const TITLE =
  "Sentence to desktop automation script: the structural reason it works in Terminator and fails when you ask a cold LLM";
const DESCRIPTION =
  "A sentence becomes a runnable script in Terminator because the MCP server ships a system prompt with one load-bearing rule: never guess or predict element attributes. The AI must call get_window_tree first and resolve selectors against the actual tree. The script is a sequence of MCP tool calls expressible as YAML. Source: terminator-mcp-agent/src/prompt.rs line 21.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The cold-LLM PyAutoGUI path fails because the model has no live UI state. Terminator's MCP server flips the problem: a system prompt forbids the AI from inventing element attributes, get_window_tree returns the real tree, and the AI emits a YAML sequence that replays deterministically.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentence to desktop automation script, the structural answer",
    description:
      "One rule in the MCP server's system prompt makes the sentence-to-script path work: never guess element attributes, derive them from get_window_tree. The script is YAML steps under execute_sequence.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Sentence to desktop automation script" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Sentence to desktop automation script", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the shortest path from a sentence to a working desktop script today?",
    a: "Install Terminator's MCP server into a coding assistant you already use. Claude Code: `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`. Cursor, VS Code, Windsurf accept the same npm command through their MCP config block. Then type the sentence. The assistant calls get_window_tree first because the system prompt makes it call get_window_tree first, derives selectors from the returned tree, and chains MCP tool calls (open_application, click_element, type_into_element, press_key, execute_sequence). The chain runs against the live desktop. To save it as a script for replay, write the same tool calls into a YAML file under a `steps:` key with `tool_name` and `arguments` and run it with `terminator mcp run workflow.yml`.",
  },
  {
    q: "Why does asking a cold LLM to write a PyAutoGUI script from a sentence usually fail?",
    a: "Two reasons that compound. First, the model has no observation of the live UI at write time. It writes `pyautogui.click(412, 78)` because it has seen that pattern in training data, not because the Save button is at (412, 78) on your screen. Second, even when the model is told to inspect the UI first, it has no enforcement mechanism: the next time you give it a different sentence it will silently regress to guessing. The Terminator MCP server moves the enforcement into the system prompt and the tool surface. The model is given a get_window_tree tool that returns the real tree and a system prompt that says, verbatim at prompt.rs line 21, `Always derive selectors strictly from the provided UI tree or DOM data; never guess or predict element attributes based on assumptions.` The selector engine then refuses non-deterministic forms (`#id` is rejected by convention in the docs) and accepts `role:Button && name:Save` style selectors that resolve against the live tree.",
  },
  {
    q: "What format is the saved script in?",
    a: "YAML or JSON. Either is a list of steps under a top-level `steps:` key. Each step has a `tool_name` (matches the MCP tool name, like `click_element`, `type_into_element`, `execute_sequence`, `open_application`, `press_key`), an `id` (string, used for jump targets and state references), and an `arguments` object whose shape is the same as the live MCP arguments. The test workflow at `crates/terminator-mcp-agent/tests/workflows/test_jump_if.yml` is the canonical example. Conditional jumps live under a `jumps:` array on each step, with `if:` (an expression that can reference prior step status or result fields), `to_id:` (the next step), and an optional `reason:` for logging. Replay loads the YAML, walks steps in order, evaluates jumps, and dispatches into the same MCP server that executed the live sentence.",
  },
  {
    q: "Where is the system prompt that constrains the AI?",
    a: "`crates/terminator-mcp-agent/src/prompt.rs`. The function is `get_server_instructions()` and the entire returned string is the system prompt the MCP transport ships to the client. Read it once and the shape becomes obvious. The selector-discipline rule is at line 21. The batching rule for `execute_sequence` is at lines 38 to 53. The selector syntax block (role/name/text/id/nativeid prefixes, `&&` / `||` / `!` / `>>` combinators) is at lines 55 to 60. The full list of MCP tool names that may be used inside a sequence is injected at compile time via `env!(\"MCP_TOOLS\")`. The prompt is checked into the repo and is the same one your local assistant receives when you install the agent via npx.",
  },
  {
    q: "What does the sequence diagram of one sentence-to-script turn look like?",
    a: "Sentence enters the assistant. Assistant reads system prompt, sees `get_window_tree` is the first move. Assistant calls `get_window_tree` with the target process. Server returns the structural tree of the foreground app: a flat list of UI elements with role, name, AutomationId, IsEnabled, bounds, and child relationships. Assistant picks a selector from the returned tree (literally copies role and name from one of the rows). Assistant calls `click_element` or `type_into_element` with that selector. Server resolves the selector against the live tree, performs the action through UI Automation, returns a ui_diff so the assistant can see what changed without taking another screenshot. Repeat until the sentence is satisfied. The trace is deterministic at the selector layer; the only place model judgement matters is choosing which row of the tree to use.",
  },
  {
    q: "Can I make the same sentence produce the same script every time?",
    a: "Yes, but the discipline matters. Two patterns. First, scope every selector to a process (`process:notepad >> role:Edit`). Without scoping, the same `role:Edit` could resolve into a different app's text field. Second, capture the tree once via `get_window_tree` and reuse its `name` and `AutomationId` values verbatim in the script. Selectors like `role:Button && name:Save` are stable across sessions because the UIA name comes from the app's resource file, not from runtime layout. The Terminator selector docs are explicit: `NEVER use #id selectors. They are non-deterministic across machines.` Save your script with `role:` plus `name:` plus `process:` scope and the same sentence will compile to the same script tomorrow and on a colleague's machine.",
  },
  {
    q: "Why is the script not just a Python file?",
    a: "Because the unit of replay is not a function call, it is an MCP tool invocation, and the MCP server is the part that does the heavy lifting (selector resolution, retry, window management, screenshot capture, conditional jumps). A YAML or JSON sequence is a portable description of those invocations. It is language-agnostic by design. You can replay it from Rust, Node, Python, or any MCP client. You can pipe it into `terminator mcp run workflow.yml` from the @mediar-ai CLI. You can load it into the @mediar-ai/workflow TypeScript SDK and add Zod-typed input validation. You can hand-edit it without rebuilding anything. The Rust/Node bindings remain available for direct programmatic use; the YAML path is for the sentence-to-replay loop specifically.",
  },
  {
    q: "What happens when the UI changes between writing the script and replaying it?",
    a: "Two layers of recovery. Static layer: a selector like `role:Button && name:Save` survives a layout reshuffle as long as the button still has the same name in the resource file. Surviving locales also works when the app exposes LocalizedRole. Dynamic layer: when a selector misses at replay, the MCP loop can dump the current `get_window_tree` to the LLM and ask for a patched selector for that one step. The rest of the script keeps running. This is the same loop the system prompt forces at write time, just invoked again at replay time on the one step that broke. A coordinate-based PyAutoGUI script has no equivalent recovery, which is the second reason the cold-LLM path produces brittle output: the script has no semantic identifier for the element it was clicking.",
  },
  {
    q: "Does this work on macOS or only Windows?",
    a: "Windows is the primary platform with full feature support: UI Automation, the full selector grammar, the workflow recorder, the MCP server. macOS support exists at the core Rust level (the same selector strings resolve against the Accessibility API), and is the supported path for sentence-to-script on Mac. Linux uses AT-SPI2. The Node and Python SDKs ship Windows binaries today. If you are building a sentence-to-script flow that has to run cross-platform, the recommended shape is to author the script as YAML against the MCP server, then run it on whichever platform you target; the selector vocabulary normalizes across UIA, AX, and AT-SPI at the framework level.",
  },
  {
    q: "What stops the assistant from skipping get_window_tree and guessing anyway?",
    a: "Three pressures, none of which are 'we hope it does the right thing.' First, the system prompt repeats the rule near the top of the instructions block; models follow stated tool-use protocols when the framing is direct and short. Second, the selector engine itself rejects pixel-only and id-only selectors except as a last-resort `pos:x,y` prefix; if the model invents a selector it will see a resolution failure and self-correct. Third, every action tool defaults to capturing a UI diff (`ui_diff_before_after: true`) so the assistant sees what its selector actually touched. The combination collapses the failure mode where the model tells you the task succeeded while the screen is unchanged. It does not eliminate it, but it pushes the failure into a regime where retry-with-tree-dump fixes it.",
  },
];

const sequenceActors = [
  "You",
  "Claude / Cursor",
  "MCP server",
  "Desktop",
];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "open Notepad, type 'Hello', save as hello.txt",
    type: "request" as const,
  },
  { from: 1, to: 2, label: "open_application 'notepad'", type: "request" as const },
  { from: 2, to: 3, label: "ShellExecute notepad.exe", type: "request" as const },
  { from: 3, to: 2, label: "process started, hWnd=0x9c4", type: "response" as const },
  { from: 2, to: 1, label: "ok, tree_after_action attached", type: "response" as const },
  { from: 1, to: 2, label: "get_window_tree process='notepad'", type: "request" as const },
  {
    from: 2,
    to: 3,
    label: "UIA: GetCachedChildren on Notepad root",
    type: "request" as const,
  },
  {
    from: 3,
    to: 2,
    label: "tree: role:Edit name:'Text editor' + role:MenuBar children",
    type: "response" as const,
  },
  { from: 2, to: 1, label: "tree JSON (62 elements)", type: "response" as const },
  {
    from: 1,
    to: 2,
    label: "type_into_element 'process:notepad >> role:Edit' 'Hello'",
    type: "request" as const,
  },
  { from: 2, to: 3, label: "UIA ValuePattern.SetValue", type: "request" as const },
  { from: 3, to: 2, label: "ui_diff: text changed", type: "response" as const },
  { from: 2, to: 1, label: "ok, ui_diff attached", type: "response" as const },
  {
    from: 1,
    to: 2,
    label: "press_key 'process:notepad' 'Ctrl+S'",
    type: "request" as const,
  },
  {
    from: 3,
    to: 2,
    label: "Save As dialog appears (role:Dialog name:'Save As')",
    type: "event" as const,
  },
  {
    from: 1,
    to: 2,
    label: "type_into_element 'role:Edit && name:File name' 'hello.txt'",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "click_element 'role:Button && name:Save'",
    type: "request" as const,
  },
  { from: 2, to: 1, label: "task complete, ui_diff confirms file saved", type: "response" as const },
];

const enforcementItems = [
  {
    text: "Call get_window_tree at the start of a task. Action tools carry their own tree updates, so don't re-query.",
  },
  {
    text: "Derive selectors strictly from the provided UI tree or DOM data; never guess or predict element attributes (prompt.rs line 21).",
  },
  {
    text: "Use highlight_before_action by default so every resolved selector visibly outlines the element before clicking.",
  },
  {
    text: "Scope every selector to a process (process:chrome, process:notepad, process:WINWORD). Otherwise role:Edit could land in the wrong app.",
  },
  {
    text: "Batch independent UI calls into a single execute_sequence to cut MCP round-trips and freeze the order of operations.",
  },
  {
    text: "Use ui_diff_before_after to verify the action moved the UI, instead of taking another screenshot.",
  },
  {
    text: "Never use #id selectors. They are non-deterministic across machines. Use role + name + AutomationId.",
  },
  {
    text: "On missing or empty tool output, say so explicitly. Never hallucinate success.",
  },
];

const installSteps = [
  {
    title: "Install the MCP server",
    description:
      "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" (Cursor and VS Code take the same npm command in their MCP config block).",
  },
  {
    title: "Type the sentence",
    description:
      "Speak the goal in plain English. The system prompt the server ships forces the assistant to plan with get_window_tree as its first move.",
  },
  {
    title: "Watch the tool calls",
    description:
      "Each call shows the resolved selector and a UI diff. The chain you see is the literal script. Copy it.",
  },
  {
    title: "Persist as YAML",
    description:
      "Wrap the chain in a steps: array with tool_name and arguments. Save as workflow.yml. Replay with terminator mcp run workflow.yml.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Accessibility tree vs PyAutoGUI: two clicks, two operations, two failure modes",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Pattern invoke() runs inside the target process. SendInput synthesizes HID events. The difference is why coordinate-based scripts go stale in days.",
    tag: "Internals",
  },
  {
    title:
      "A Windows automation script you record instead of write",
    href: "/t/windows-automation-script",
    excerpt:
      "The complementary path. Instead of speaking a sentence, perform the workflow once and let the recorder lift it into 14 semantic event types.",
    tag: "Recorder",
  },
  {
    title:
      "Claude desktop automation with Terminator",
    href: "/t/claude-desktop-automation",
    excerpt:
      "What it actually looks like when Claude Code drives a real desktop through the MCP loop. Selector grammar, tool surface, retry on stale.",
    tag: "Claude",
  },
  {
    title:
      "Open source desktop automation projects, April 2026",
    href: "/t/open-source-desktop-automation-projects-april-2026",
    excerpt:
      "Where Terminator sits in the open-source landscape: AT-SPI, UIA, AX, and the MCP-shaped tools that lean on each.",
    tag: "Landscape",
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
            <span>structural answer, not prompt tricks</span>
          </div>

          <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            You don&apos;t turn a sentence into a desktop automation script by
            asking a smarter LLM. You turn it into a script by forbidding the
            LLM from guessing.
          </h1>

          <p className="mt-5 text-lg text-zinc-700 leading-relaxed">
            Every guide on this topic shows you the same recipe: paste a
            sentence into ChatGPT, ask for a PyAutoGUI script, hope. It fails
            because the model never observed your UI. It guessed at coordinates,
            invented control names, and produced a brittle macro you cannot
            debug.
          </p>

          <p className="mt-4 text-base text-zinc-600 leading-relaxed">
            Terminator solves the same problem from the other end. The MCP
            server ships a system prompt with one load-bearing rule near the
            top, plus a primitive (get_window_tree) that returns the live
            structure of the foreground app. The assistant is structurally
            unable to guess. The chain of tool calls it produces, in order, is
            the script. Save it as YAML and replay it tomorrow.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              terminator-mcp-agent
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              get_window_tree
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              role:Button &amp;&amp; name:Save
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              execute_sequence
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <section className="max-w-3xl mx-auto px-6 mt-10">
          <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 md:p-7">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
              Direct answer (verified 2026-05-11)
            </p>
            <p className="text-lg text-zinc-900 leading-relaxed">
              Install Terminator&apos;s MCP server into a coding assistant you
              already use:{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                claude mcp add terminator &quot;npx -y
                terminator-mcp-agent@latest&quot;
              </code>{" "}
              (Cursor, VS Code, and Windsurf accept the same npm command). Type
              your sentence. The server&apos;s system prompt forbids the
              assistant from guessing element attributes, so it calls{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                get_window_tree
              </code>{" "}
              on the live UI, picks selectors from the returned tree, and
              chains MCP tool calls. That chain is the script. Persist it as
              YAML under a{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                steps:
              </code>{" "}
              array and replay with{" "}
              <code className="font-mono text-[0.95em] bg-white text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                terminator mcp run workflow.yml
              </code>
              .
            </p>
            <p className="mt-3 text-sm text-zinc-600">
              Authoritative source:{" "}
              <a
                href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/prompt.rs"
                className="text-orange-700 underline hover:no-underline"
                target="_blank"
                rel="noreferrer"
              >
                prompt.rs in mediar-ai/terminator
              </a>
              . The rule that does the work is at line 21.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why the cold-LLM path doesn&apos;t produce a working script
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pretend you have a sentence: <em>open Notepad, type Hello, save
            as hello.txt</em>. You paste it into a chat. You ask for a script.
            The model returns PyAutoGUI:
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>guess.py (what a cold LLM returns)</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`import pyautogui, subprocess, time

subprocess.Popen(["notepad.exe"])
time.sleep(2)
pyautogui.typewrite("Hello", interval=0.05)
pyautogui.hotkey("ctrl", "s")
time.sleep(1)
# the model guessed where the filename field is
pyautogui.click(612, 419)
pyautogui.typewrite("hello.txt", interval=0.05)
# and where the Save button is
pyautogui.click(1054, 619)`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two coordinates the model fabricated. Two sleeps that race the
            application. Zero validation that any of it landed. Run it on a
            different Windows build, a different DPI, with the taskbar on the
            top instead of the bottom, or in a localized Notepad, and it goes
            sideways. The model could not have done better, because it never
            observed your screen. It only had your sentence and its training
            data&apos;s pattern of how PyAutoGUI scripts look.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The structural problem isn&apos;t that the model is too small or
            too dumb. It&apos;s that the script-writing phase happened with no
            access to the live UI. No amount of prompt engineering fixes that.
            Coordinate guesses come from priors, not observations.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The rule that flips the problem
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open{" "}
            <code className="font-mono text-zinc-800">
              crates/terminator-mcp-agent/src/prompt.rs
            </code>{" "}
            in the Terminator repo. Scroll to line 21. The system prompt the
            MCP server ships to the assistant contains this clause verbatim:
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>prompt.rs &nbsp;line 21</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`Always derive selectors strictly from the provided UI
tree or DOM data; never guess or predict element
attributes based on assumptions.`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            That sentence is not a tooltip and not a hint. It is the part of
            the system prompt that the assistant receives the moment it
            connects to the MCP server. The rest of the file (174 lines in
            total) is the supporting machinery: when to call get_window_tree
            and when not to, the selector grammar (role:, name:, text:, id:,
            nativeid:, classname:, nth:, visible:, process:, window:, pos:),
            the combinators (&amp;&amp;, ||, !, &gt;&gt;, ..), the common
            pitfalls (ElementNotVisible, ElementNotEnabled, radio button
            clicks, hyperlink containers), and the &quot;escape hatch&quot; for
            empty tool output (say so, never fabricate).
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The selector engine itself enforces the rule from the other side.
            The framework documentation states the convention plainly: <em>
            never use #id selectors; they are non-deterministic across
            machines</em>. The first-class selectors are role + name + process
            scope, which can only be filled in from the structural tree, which
            can only be obtained from get_window_tree. The rule and the tool
            shape line up. The assistant cannot bypass the rule by writing
            something that looks like a selector but isn&apos;t.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            One sentence, traced turn by turn
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The same sentence as above, but routed through the MCP server. Each
            row is one MCP call. Notice where the first get_window_tree lands
            (right after the app launches) and what the assistant does with the
            tree it receives.
          </p>

          <SequenceDiagram
            title="Sentence → tool chain, with the tree as the source of truth"
            actors={sequenceActors}
            messages={sequenceMessages}
          />

          <p className="mt-2 text-sm text-zinc-500">
            Green is request, teal is response, amber is an OS-level event the
            server reports back into the loop. Every selector the assistant
            uses is a string it pulled out of the tree returned by the previous
            response.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What the script looks like on disk
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The trace from the previous section flattens into a YAML file. Each
            step has a tool_name (an MCP tool), an id (for jump targets and
            state references), and an arguments block whose shape matches the
            live MCP call. Schema reference: the test workflow at{" "}
            <code className="font-mono text-zinc-800">
              crates/terminator-mcp-agent/tests/workflows/test_jump_if.yml
            </code>
            .
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800 flex items-center gap-2 text-xs font-mono text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-zinc-600" />
              <span>workflow.yml (the script the sentence compiled to)</span>
            </div>
            <pre className="px-5 py-4 font-mono text-sm leading-relaxed overflow-x-auto">
              <code>{`name: Hello.txt in Notepad
description: open Notepad, type Hello, save as hello.txt

steps:
  - tool_name: open_application
    id: open_notepad
    arguments:
      app_name: notepad

  - tool_name: get_window_tree
    id: tree_after_open
    arguments:
      process: notepad

  - tool_name: type_into_element
    id: type_hello
    arguments:
      selector: "process:notepad >> role:Edit"
      text_to_type: "Hello"
      clear_before_typing: true

  - tool_name: press_key
    id: trigger_save_as
    arguments:
      selector: "process:notepad >> role:Document"
      key: "{Ctrl}s"

  - tool_name: type_into_element
    id: type_filename
    arguments:
      selector: "role:Edit && name:File name"
      text_to_type: "hello.txt"
      clear_before_typing: true

  - tool_name: click_element
    id: confirm_save
    arguments:
      selector: "role:Button && name:Save"`}</code>
            </pre>
          </div>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Run it later with{" "}
            <code className="font-mono text-zinc-800">
              terminator mcp run workflow.yml
            </code>
            . Want to resume from a specific step?{" "}
            <code className="font-mono text-zinc-800">
              terminator mcp run workflow.yml --start-from &quot;type_filename&quot;
            </code>
            . Want a dry run?{" "}
            <code className="font-mono text-zinc-800">--dry-run</code>. The CLI
            and the @mediar-ai/workflow SDK share the same selector resolver, so
            a script written from a sentence is the same shape as a script
            written by hand or recorded from a live session.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Side by side: same goal, two scripts
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Toggle below. The before panel is what cold-LLM PyAutoGUI gives
            you. The after panel is what the Terminator MCP path gives you for
            the same sentence. Read the highlights; the differences are not
            stylistic, they are structural.
          </p>

          <BeforeAfter
            before={{
              label: "Cold-LLM PyAutoGUI from a sentence",
              content:
                "The model wrote the script from your sentence alone. It guessed two coordinates, picked two sleeps, and produced a file that will only run on the resolution and locale it imagined. The Save dialog is targeted by pixel pair. The filename edit field is targeted by pixel pair. There is no recovery if anything is off by ten pixels; there is no selector to match against because the script never asked the OS what was on screen.",
              highlights: [
                "coordinates fabricated from training data, not observation",
                "no scoping to a process: a stray click can land in any window",
                "no recovery path: pyautogui has no concept of element identity",
                "breaks on different DPI, locale, taskbar position, theme",
              ],
            }}
            after={{
              label: "Sentence routed through Terminator MCP",
              content:
                "The assistant called get_window_tree the moment Notepad opened. It picked role:Edit because the tree returned a role:Edit element with no ambiguity, and scoped it to process:notepad so the script is reusable. It picked role:Button && name:Save in the Save As dialog because that is the literal name in the UIA tree. The script the model emitted is a portable YAML file. Replay it tomorrow, on a colleague's machine, in French Windows; the selectors resolve through the same UIA properties.",
              highlights: [
                "every selector resolved against the live tree before use",
                "process:scope on every step, so steps don't bleed across apps",
                "selectors survive layout reshuffles and most locale switches",
                "if a step misses on replay, the MCP loop patches one step at a time",
              ],
            }}
          />
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            What the system prompt actually enforces
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read prompt.rs front to back once; the rules below are the ones
            that show up over and over. Together they explain why the same
            sentence produces a script that survives next week&apos;s release
            rather than a coordinate macro that will need to be regenerated
            tomorrow.
          </p>

          <AnimatedChecklist
            title="Rules the MCP server pushes into every conversation"
            items={enforcementItems}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Each rule maps onto a structural choice in the framework. The
            selector grammar refuses non-deterministic forms. The tool surface
            attaches a UI diff to every action. Window management activates the
            target process before keys are sent. The result is that the script
            the assistant produces is the same shape whether you typed the
            sentence or whether the workflow recorder captured your hands.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            How to take a sentence to a saved script today
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four steps. None of them require leaving the editor where you
            already type prompts.
          </p>

          <HorizontalStepper
            steps={installSteps}
            current={0}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you skip step four the script is still useful: every MCP call
            the assistant made is in your conversation history, and you can
            re-run any subset by asking the assistant to repeat it. The YAML
            form just lets you take the script out of the conversation and run
            it without the model in the loop.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
            The part that makes this honest
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this depends on the model being especially capable. The
            same flow works with whatever assistant you already use, because
            the discipline lives in the server. A weaker model produces a
            longer script (more get_window_tree calls, more chosen-and-verified
            selectors). A stronger model produces a tighter one. Both produce
            something that runs.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The cold-LLM PyAutoGUI path doesn&apos;t scale because every
            improvement to the model is offset by a new failure mode in the
            unobserved UI. The MCP-with-system-prompt path scales because the
            failure modes are now in territory the framework can fix:
            stale-selector retry, missing-element recovery, conditional jumps,
            sequence batching. The sentence is still the input. The script is
            still the output. The thing in the middle just stopped pretending
            it could read your screen by induction.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-16 mb-6">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            section="sentence-to-script-footer"
            heading="Bring a sentence, leave with a script that replays."
            description="If you're trying to compile English into a desktop automation that survives the next UI change, bring a target app. We'll walk through wiring the MCP server into your assistant of choice and saving the chain as YAML."
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
          section="sentence-to-script-sticky"
          description="Sentence-to-script not landing reliably? Talk it through."
        />
      </article>
    </>
  );
}
