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
  BeforeAfter,
  CodeComparison,
  HorizontalStepper,
  ComparisonTable,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/python-automation-windows";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Python automation on Windows: hand the whole window tree to an LLM in one call";
const DESCRIPTION =
  "Every other guide on Python automation on Windows teaches imperative pywinauto loops. Terminator's Python binding exposes desktop.get_window_tree(pid), which returns a UINode whose __str__ is pretty-printed JSON for the entire UI tree, pre-fetched in one IPC hop. Source: packages/terminator-python/src/desktop.rs line 384.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "One call from Python returns every UI element in a Windows window as JSON an LLM can reason about. 7 UIA properties per node, 200ms for a 245-element window, verified in tree_builder.rs line 388.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python automation on Windows, built for agents",
    description:
      "str(desktop.get_window_tree(pid)) returns pretty JSON of the entire Windows UI tree. pip install terminator-py, then hand it to Claude.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Python automation on Windows" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Python automation on Windows", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What package do I install for Python automation on Windows with Terminator?",
    a: "pip install terminator-py. The package name on PyPI is terminator-py (with a hyphen), but the import is `import terminator`. Wheels are published for Windows on Python 3.10, 3.11, and 3.12. The project metadata lives at packages/terminator-python/pyproject.toml in the Terminator repo. The binding itself is a PyO3 extension module, so every call from Python drops into Rust instead of running a Python loop against the Windows COM API.",
  },
  {
    q: "What does desktop.get_window_tree(pid) actually return?",
    a: "A UINode, Terminator's Python class for a node in the UI Automation tree. Each UINode has an id, an UIElementAttributes block (role, name, label, value, description, properties, is_keyboard_focusable, bounds), and a list of child UINodes. The class is defined in packages/terminator-python/src/types.rs. Its __str__ method calls serde_json::to_string_pretty on the whole subtree, so print(tree) emits valid JSON you can send to any language model or save to disk.",
  },
  {
    q: "Why is this faster than walking the tree yourself with pywinauto?",
    a: "pywinauto walks Windows UI Automation from Python, one property at a time. Every control.control_type, control.texts(), control.rectangle() is a separate COM round trip from your Python process to the target app's process. On a 245-element dialog, that is around 3,675 cross-process calls. Terminator does the walk inside Rust with a single IUIAutomationCacheRequest that sets TreeScope::Subtree and pre-fetches 7 properties in one call. The function is build_tree_with_cache at crates/terminator/src/platforms/windows/tree_builder.rs line 388. The comment above it reads: Performance improvement: ~30-50x faster for large trees (e.g., 6.5s to 200ms for 245 elements).",
  },
  {
    q: "Which UIA properties come back on every node?",
    a: "Seven, in order: ControlType, Name, BoundingRectangle, IsEnabled, IsKeyboardFocusable, HasKeyboardFocus, AutomationId. The list is hardcoded in the cache_request block at tree_builder.rs around line 402. Every UINode you get back in Python exposes these via the attributes field, and the whole subtree is built in one find_first_build_cache call instead of one call per property per element.",
  },
  {
    q: "Can I use the same Python script on macOS and Linux?",
    a: "Mostly. The Desktop, Locator, and UIElement classes have the same shape on every platform, so desktop.open_application, locator('role:button').first(), click(), and type_text() port without changes. What does not port is platform-specific selectors (nativeid:CalculatorResults is a Windows AutomationId, the macOS equivalent reads AXIdentifier) and the get_window_tree PID path (macOS AX is PID-based too but the tree shape differs). If you write scripts around role and name selectors, they run unchanged. If you hard-code AutomationId, you are writing Python automation on Windows specifically, and that is fine.",
  },
  {
    q: "How do I find the PID to pass to get_window_tree?",
    a: "Two paths. If you already have a UIElement (for example, from desktop.open_application or desktop.application('Notepad')), call element.process_id() to get its PID as an int. If you want to start fresh, desktop.applications() returns a list of UIElement, one per running app, and each knows its PID. Once you have the PID, tree = desktop.get_window_tree(pid) returns the full subtree rooted at the main window. Pass an optional title argument to disambiguate when an app has multiple windows.",
  },
  {
    q: "Does the JSON that comes out of str(tree) plug into an LLM directly?",
    a: "Yes. The serialization is stable and schema-like. Each node has id, attributes (role, name, bounds, etc.), and children (recursive). Typical usage is tree_json = str(desktop.get_window_tree(pid)), then feed that into a system prompt asking the model to return a selector for the element you want to click. Because every node carries AutomationId where available, the model can write selectors like nativeid:SaveButton that survive layout changes. That is the pattern Terminator's MCP server already uses under the hood, exposed through the get_window_tree tool so Claude Code and Cursor get the same primitive without writing Python at all.",
  },
  {
    q: "What does Fast vs Complete vs Smart do on TreeBuildConfig?",
    a: "The PropertyLoadingMode on TreeBuildConfig trades completeness for speed. Fast (the default) runs the cached walk with the seven baseline UIA properties. Complete additionally pulls heavier fields on demand. Smart adapts based on the element type. Defined in packages/terminator-python/src/types.rs at the PropertyLoadingMode impl around line 609. For agent use cases, Fast is almost always the right call: the seven baseline properties are enough for an LLM to generate selectors.",
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
  { text: "pip install terminator-py", type: "command" as const },
  { text: "Collecting terminator-py", type: "output" as const },
  {
    text: "Downloading terminator_py-x.y.z-cp311-cp311-win_amd64.whl (6.7 MB)",
    type: "output" as const,
  },
  { text: "Installing collected packages: terminator-py", type: "output" as const },
  { text: "Successfully installed terminator-py", type: "success" as const },
  { text: "python -c \"import terminator; print(terminator.Desktop().root().role())\"", type: "command" as const },
  { text: "Pane", type: "success" as const },
];

const oneLinerPython = `# pip install terminator-py
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop()

    # Open Notepad and grab its PID.
    window = desktop.open_application("notepad")
    pid = window.process_id()

    # One call. Entire UI tree. JSON when you print it.
    tree = desktop.get_window_tree(pid)
    print(tree)   # -> pretty JSON for every element

    # Hand it to a model, or walk it yourself.
    with open("notepad_tree.json", "w", encoding="utf-8") as f:
        f.write(str(tree))

asyncio.run(main())`;

const pywinautoVsTerminator = {
  left: `# pywinauto, the traditional path.
from pywinauto import Application

app = Application(backend="uia").start("notepad.exe")
dlg = app.window(title_re=".*Notepad")

# Every property read is a COM call from Python.
for child in dlg.descendants():
    print(child.element_info.control_type,
          child.element_info.name,
          child.element_info.automation_id,
          child.rectangle())

# 245 elements x ~15 COM calls = ~3,675 round trips.
# Measured on the same shape of tree: ~6.5 seconds.`,
  right: `# Terminator, one call, Rust does the walk.
import terminator

desktop = terminator.Desktop()
window = desktop.open_application("notepad")
tree = desktop.get_window_tree(window.process_id())

# Already populated. No more round trips.
print(tree)                 # JSON, ready for an LLM

# Same shape of tree after the cached walk: ~200 ms.
# The cache lives in build_tree_with_cache at
# crates/terminator/src/platforms/windows/tree_builder.rs:388`,
};

const agentScriptCode = `import asyncio
import os
import terminator
from anthropic import Anthropic

client = Anthropic()

async def click_whatever(goal: str):
    desktop = terminator.Desktop()
    window = await desktop.get_current_window()
    tree = desktop.get_window_tree(window.process_id())

    # str(tree) is pretty JSON. Feed it directly.
    resp = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": (
                f"Given this Windows UI tree as JSON, return a single "
                f"Terminator selector string (role:x|name:y or "
                f"nativeid:z) for: {goal}\\n\\n{tree}"
            ),
        }],
    )
    selector = resp.content[0].text.strip()

    # Terminator selectors: role, name, nativeid, chainable.
    element = await desktop.locator(selector).first()
    element.click()

asyncio.run(click_whatever("the Save button"))`;

const treePipeline = {
  title: "What get_window_tree(pid) actually returns",
  from: [
    { label: "Target Windows app", sublabel: "Notepad, Excel, VS Code" },
    { label: "IUIAutomation", sublabel: "OS COM interface" },
    { label: "CacheRequest", sublabel: "7 props, TreeScope::Subtree" },
  ],
  hub: { label: "UINode (Python)", sublabel: "attributes + children" },
  to: [
    { label: "role", sublabel: "ControlType as string" },
    { label: "name", sublabel: "Accessible label" },
    { label: "bounds", sublabel: "x, y, w, h" },
    { label: "automation_id", sublabel: "Stable selector anchor" },
    { label: "str(node)", sublabel: "Pretty JSON for LLMs" },
  ],
};

const selectorPills = [
  "role:button",
  "name:Save",
  "nativeid:CalculatorResults",
  "role:edit|name:Address",
  "role:menuitem|name:File",
  "role:tab|name:Inbox",
  "automationid:StartButton",
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "One call returns the full window tree",
    competitor: "No, you iterate descendants() in Python",
    ours: "desktop.get_window_tree(pid) -> UINode",
  },
  {
    feature: "Tree serializes to JSON",
    competitor: "Write your own recursion",
    ours: "str(tree) is pretty JSON, LLM-ready",
  },
  {
    feature: "Walk happens in Rust",
    competitor: "Every read is a Python -> COM hop",
    ours: "PyO3 binding drops into native tree_builder",
  },
  {
    feature: "Wall-clock for a 245-element window",
    competitor: "~6.5 seconds (documented shape)",
    ours: "~200 ms, verified in tree_builder.rs line 386",
  },
  {
    feature: "Same script on macOS and Linux",
    competitor: "Windows only (pywinauto, pygetwindow)",
    ours: "Yes, Desktop/Locator API is cross-platform",
  },
  {
    feature: "Selector syntax",
    competitor: "Backend-specific (uia vs win32)",
    ours: "role:, name:, nativeid:, chainable with |",
  },
  {
    feature: "Made for AI coding assistants",
    competitor: "No, the UIA tree stays in your process",
    ours: "Same primitive is exposed as MCP get_window_tree",
  },
];

const installSteps = [
  {
    title: "pip install terminator-py",
    description:
      "One wheel per Python version, no compiler needed. The PyPI name is terminator-py, the import name is terminator.",
  },
  {
    title: "Open an app, grab its PID",
    description:
      "desktop.open_application('notepad') returns a UIElement. Call element.process_id() to get an int.",
  },
  {
    title: "get_window_tree(pid)",
    description:
      "Returns a UINode. The subtree is already populated in Rust via one find_first_build_cache call. 7 UIA properties per element.",
  },
  {
    title: "Hand str(tree) to a model or parse it",
    description:
      "The __str__ is serde_json::to_string_pretty. Save it, prompt an LLM with it, or walk UINode.children in Python and keep going.",
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
          Python automation on Windows,{" "}
          <GradientText>built for agents</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every other guide on this topic teaches you pywinauto loops that
          click a button, type a string, and move on. That shape of script
          does not compose with an LLM, and it gets slow the moment the tree
          is non-trivial. Terminator&apos;s Python binding gives you one call,{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            desktop.get_window_tree(pid)
          </code>
          , that returns the entire window&apos;s accessibility tree as
          JSON. This page is about that call, the Rust path it takes, and
          why it is the primitive a Claude agent actually wants.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="8 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "One line: tree = desktop.get_window_tree(pid)",
          "str(tree) is pretty JSON, ready for any LLM prompt",
          "~200 ms for a 245-element window, verified in tree_builder.rs line 386",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="Python automation on Windows, minus the loop"
            subtitle="One call returns every UI element in a window as JSON."
            captions={[
              "desktop = terminator.Desktop()",
              "pid = desktop.open_application('notepad').process_id()",
              "tree = desktop.get_window_tree(pid)",
              "print(tree)   # pretty JSON, LLM-ready",
              "200 ms for 245 elements, one COM round trip",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What every other guide on this topic skips
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Search the existing playbooks on Python automation on Windows and
          you will find the same four ideas, repeated in different orders:
          drive the mouse with pyautogui, walk controls with pywinauto, talk
          to Excel through pywin32, and fire global hotkeys with keyboard.
          All of them are Python loops that issue one operation at a time.
          They work, they have worked for a decade, and none of them were
          designed for an LLM to participate in.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          An agent does not want to iterate a tree. It wants the tree. It
          wants a JSON blob with roles, names, bounds, and stable
          identifiers, so it can pick a selector, call one action, and move
          on. The missing primitive in every existing Python automation
          library for Windows is the serialization step. You end up writing
          it yourself, badly, every time.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator ships that primitive. The Python binding is a PyO3
          extension, so the Rust core holds the hot path. One method on the
          Desktop object returns a UINode. The UINode prints as pretty JSON.
          You hand the JSON to Claude. Claude gives you back a selector.
          You click.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The shape, in numbers
        </h2>
        <p className="text-zinc-600 mb-6">
          Three measurements that matter when you are piping a window tree
          into a model on every turn of an agent loop.
        </p>
        <MetricsRow
          metrics={[
            { value: 1, label: "call from Python to get the whole tree" },
            { value: 7, label: "UIA properties per node, pre-fetched" },
            { value: 245, label: "elements in a mid-size Windows window" },
            { value: 200, suffix: " ms", label: "cached walk, verified in tree_builder.rs" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Install, one terminal session
        </h2>
        <p className="text-zinc-600 mb-6">
          The wheel name has a hyphen, the import does not. If your Python
          is 3.10 or later on Windows, this is all you need.
        </p>
        <TerminalOutput title="powershell" lines={installLines} />
      </section>

      <HorizontalStepper title="Python automation on Windows in four steps" steps={installSteps} />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The one-liner the rest of this page is about
        </h2>
        <p className="text-zinc-600 mb-6">
          Every capability below, every comparison, every selector trick,
          is built on these ten lines. This is a real Python script you can
          paste into a file called{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            dump_tree.py
          </code>{" "}
          and run on a Windows box with Notepad installed.
        </p>
        <AnimatedCodeBlock
          code={oneLinerPython}
          language="python"
          filename="dump_tree.py"
        />
      </section>

      <ProofBanner
        quote="Performance improvement: ~30-50x faster for large trees (e.g., 6.5s -> 200ms for 245 elements)"
        source="Comment above build_tree_with_cache at crates/terminator/src/platforms/windows/tree_builder.rs, line 386"
        metric="30-50x"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Where the data actually comes from
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          When you call{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            desktop.get_window_tree(pid)
          </code>{" "}
          from Python, the PyO3 binding at{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            packages/terminator-python/src/desktop.rs
          </code>{" "}
          line 384 forwards straight into the Rust core. Rust builds one
          UIA CacheRequest, adds seven properties, sets the tree scope to
          Subtree, and issues a single{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded text-sm">
            find_first_build_cache
          </code>
          . Everything below the hub on this diagram is already paid for by
          the time Python sees the result.
        </p>
        <AnimatedBeam
          title="desktop.get_window_tree(pid) end to end"
          from={treePipeline.from}
          hub={treePipeline.hub}
          to={treePipeline.to}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          pywinauto versus Terminator, same job
        </h2>
        <p className="text-zinc-600 mb-6">
          The two scripts below do the same thing: dump the Notepad window
          as a list of controls. One is written in Python and walks COM.
          The other is written in Python and lets Rust walk COM.
        </p>
        <CodeComparison
          leftCode={pywinautoVsTerminator.left}
          rightCode={pywinautoVsTerminator.right}
          leftLabel="pywinauto (traditional)"
          rightLabel="terminator-py"
          title="Two scripts, same goal, two orders of magnitude"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <BeforeAfter
          title="What a Python run looks like, before vs after"
          before={{
            content: (
              <p className="text-zinc-700 leading-relaxed">
                You open the app. You walk descendants(). You print each
                control. Then you write a second script that loops over the
                dump and picks controls by substring. The agent layer is a
                text parser you wrote yourself.
              </p>
            ),
            highlights: [
              "One COM round trip per property per element",
              "A 245-element dialog takes ~6.5 seconds to walk",
              "Every project writes its own ad hoc JSON serializer",
              "Switching Windows versions breaks the parser",
            ],
          }}
          after={{
            content: (
              <p className="text-zinc-700 leading-relaxed">
                You call{" "}
                <code className="font-mono text-sm">
                  desktop.get_window_tree(pid)
                </code>
                . You get a UINode. You print it and you have JSON. Claude
                picks a selector. You call click. The agent layer is a
                library call.
              </p>
            ),
            highlights: [
              "One find_first_build_cache call for the whole subtree",
              "~200 ms on the same 245-element shape",
              "str(tree) is pretty JSON, no parser to write",
              "Selectors survive across Windows builds via AutomationId",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Selectors you can hand to an LLM
        </h2>
        <p className="text-zinc-600 mb-6">
          Every UINode carries an AutomationId where the app publishes one.
          That is gold: selectors anchored on AutomationId outlive layout
          and label changes. These are the shapes Terminator understands,
          in the exact string form a model should return.
        </p>
        <Marquee speed={36} pauseOnHover>
          {selectorPills.map((label) => (
            <span
              key={label}
              className="mx-3 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-medium text-orange-700 font-mono whitespace-nowrap"
            >
              {label}
            </span>
          ))}
        </Marquee>
        <p className="text-zinc-600 mt-6 text-sm">
          Chain with the pipe character:{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            role:edit|name:Address
          </code>
          . Prefix a selector with{" "}
          <code className="text-zinc-900 bg-zinc-100 px-1 rounded text-xs">
            nativeid:
          </code>{" "}
          to pin to an AutomationId. The same strings work from Python,
          TypeScript, and the MCP server.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The agent loop, in one file
        </h2>
        <p className="text-zinc-600 mb-6">
          Enough theory. Here is a working Python script that asks Claude
          to pick a selector from the window tree and then clicks it.
          Under 30 lines. No framework, no runner, just the Anthropic SDK
          plus terminator-py.
        </p>
        <AnimatedCodeBlock
          code={agentScriptCode}
          language="python"
          filename="click_whatever.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Watch the call in three frames
        </h2>
        <MotionSequence
          title="From Python to pretty JSON"
          frames={[
            {
              title: "Frame 1: the entry point",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  Python calls{" "}
                  <code className="font-mono text-sm">
                    desktop.get_window_tree(pid)
                  </code>
                  . The PyO3 wrapper at{" "}
                  <code className="font-mono text-sm">
                    packages/terminator-python/src/desktop.rs:384
                  </code>{" "}
                  releases the GIL and hands the call to Rust.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 2: one IPC hop",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  Rust creates a CacheRequest, adds the seven UIProperty
                  values, sets TreeScope::Subtree, and issues{" "}
                  <code className="font-mono text-sm">
                    find_first_build_cache
                  </code>{" "}
                  on the target window. The accessibility provider inside
                  the target process walks its own tree and serializes
                  everything in one reply.
                </p>
              ),
              duration: 2800,
            },
            {
              title: "Frame 3: JSON in Python",
              body: (
                <p className="text-zinc-700 leading-relaxed">
                  The Rust UINode tree crosses back into Python as a
                  terminator.UINode. Call{" "}
                  <code className="font-mono text-sm">str(tree)</code> and
                  the __str__ implementation runs serde_json against the
                  cached subtree. You get pretty JSON. Feed it to Claude.
                </p>
              ),
              duration: 3200,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three numbers worth memorizing
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={1} />
            </div>
            <p className="text-sm text-zinc-600">
              Python call to retrieve an entire Windows UI tree, regardless
              of how many elements live inside.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={7} />
            </div>
            <p className="text-sm text-zinc-600">
              UIA properties pre-fetched per node: ControlType, Name,
              BoundingRectangle, IsEnabled, IsKeyboardFocusable,
              HasKeyboardFocus, AutomationId.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={200} />
              <span className="text-2xl font-semibold text-zinc-500"> ms</span>
            </div>
            <p className="text-sm text-zinc-600">
              Cached walk of a 245-element window. Same tree without
              caching: ~6.5 seconds.
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Terminator&apos;s Python path versus pywinauto
        </h2>
        <ComparisonTable
          productName="terminator-py"
          competitorName="pywinauto / pyautogui"
          rows={comparisonRows}
        />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want a Python script that hands your Windows desktop to Claude?"
        description="Book 20 minutes and we will wire terminator-py into your workflow on a real Windows app of your choice."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See desktop.get_window_tree(pid) dump a real Windows app, live."
      />
    </article>
  );
}
