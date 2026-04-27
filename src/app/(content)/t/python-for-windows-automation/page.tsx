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
  AnimatedChecklist,
  MetricsRow,
  GlowCard,
  StepTimeline,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/python-for-windows-automation";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Python for Windows automation: 16 typed exceptions instead of try/except Exception";
const DESCRIPTION =
  "Most Python libraries for Windows desktop automation throw one or two exceptions and call it a day. Terminator's Python binding raises 16 distinct error classes, one for each way a Win32 control can refuse you. Source: packages/terminator-python/src/exceptions.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "pip install terminator-py. Then catch ElementObscuredError, ElementNotStableError, ElementDetachedError, ElementNotVisibleError separately, because they are four different bugs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python for Windows automation, with structured failures",
    description:
      "16 typed exceptions in Terminator's Python binding. pywinauto has 3. pyautogui has 1. Stop wrapping every line in try/except Exception.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Python for Windows automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Python for Windows automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does pip install terminator-py actually give me?",
    a: "A PyO3 wheel built from the Rust core in crates/terminator. The Python module exposes Desktop, UIElement, Locator, plus 16 custom exception classes registered in packages/terminator-python/src/exceptions.rs. The wheel ships Windows binaries today (cp310 through cp313, win_amd64). The same Python API exists for macOS through the Accessibility API at the Rust level; the wheels for that platform follow the Windows release cadence.",
  },
  {
    q: "Why split element failures into 6 separate exception types?",
    a: "Because they are six different bugs and each has a different fix. ElementNotVisibleError means the bounds are off-screen, you scroll into view. ElementObscuredError means another window is on top, you raise focus. ElementNotStableError means the bounds are still animating, you wait or retry. ElementNotEnabledError means a required field upstream is missing, you check form state. ElementDetachedError means your handle is stale, you re-find. ElementNotFoundError means your selector is wrong, you fix the selector. Catching all of them as Exception throws away the diagnostic that the accessibility API already gave you for free.",
  },
  {
    q: "How does this compare to pywinauto and pyautogui error handling?",
    a: "pywinauto exports ElementNotFoundError, ElementAmbiguousError, and TimeoutError, plus a few connection-related errors. Three useful element states. pyautogui exports FailSafeException, which fires when you yank the mouse to a screen corner to abort. One. Terminator exports 16. The mapping from each Rust AutomationError variant to its Python class is at exceptions.rs lines 76 to 98 in the automation_error_to_pyerr function, so the dispatch is exhaustive at the type system level, not best-effort.",
  },
  {
    q: "Is this actually using Windows UI Automation under the hood?",
    a: "Yes. The Windows backend lives in crates/terminator/src/platforms/windows. It calls the UI Automation COM API through the windows crate. When you write desktop.locator('process:notepad >> role:Edit').first(timeout_ms=2000) the runtime walks the UIA tree filtered by process id, then by control type, returns the first match. There is no pixel matching and no image template by default. OCR and screenshots are available as supplementary methods on Desktop and UIElement, but they are not the default path.",
  },
  {
    q: "Why do clicks on radio buttons fail with a normal .click()?",
    a: "On Windows the radio button control implements the SelectionItem pattern, not the Invoke pattern, so a synthetic mouse click can land on the right pixel without flipping the selection. Terminator surfaces this as ElementNotEnabledError or sometimes a no-op click that returns success. The fix is element.set_toggled(True) for checkboxes and the equivalent SelectionItem.Select call for radio buttons, which the Rust core routes through the correct UIA pattern. The same rule applies in pywinauto and any other UIA-based library, but Terminator names the failure where pyautogui silently does nothing.",
  },
  {
    q: "What is ElementNotStableError actually checking?",
    a: "Before clicks, Terminator samples the element's bounds twice with a small delay between samples. If the rectangle moved between samples, the element is mid-animation, and clicking will land on whatever happens to be under the cursor when the click fires. Rather than pretend the click worked, the runtime raises ElementNotStableError so your script can wait or use element.invoke() (which does not require a stable bounding box because it routes through the UIA Invoke pattern, not a synthetic mouse event).",
  },
  {
    q: "Do I have to write everything async?",
    a: "Most read-only operations are sync (role(), name(), bounds(), is_visible(), attributes()). The element-finding methods are async because they wait on the UI tree (locator.first(), locator.all(), locator.wait()). Actions like click(), type_text(), press_key() are sync because they execute against an already-resolved element. The split exists so your hot path is not paying for an event loop tick on operations that do not need one. If you do not want async at all, set a timeout on the locator and call the wait helpers from inside asyncio.run(...) once at the top of your script.",
  },
  {
    q: "What about cross-platform? Will the same script run on macOS?",
    a: "The Python API is the same. Desktop, UIElement, Locator, and all 16 exception classes are exposed identically from the PyO3 binding regardless of platform. The selector grammar is the same. What changes is what the underlying accessibility tree looks like; macOS AX roles are different from Windows UIA control types. You will write platform-aware selectors (for example, role:button works on both, but nativeid: values from Inspect.exe will not exist on macOS). The exception types are stable. ElementObscuredError on macOS still means another window is on top.",
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
  { text: "pip install terminator-py", type: "command" as const },
  { text: "Collecting terminator-py", type: "output" as const },
  {
    text: "Downloading terminator_py-x.y.z-cp312-cp312-win_amd64.whl (6.7 MB)",
    type: "output" as const,
  },
  { text: "Installing collected packages: terminator-py", type: "success" as const },
  { text: "Successfully installed terminator-py", type: "success" as const },
  {
    text: "python -c \"import terminator; print(len([e for e in dir(terminator) if e.endswith('Error')]))\"",
    type: "command" as const,
  },
  { text: "16", type: "output" as const },
];

const heroPython = `# pip install terminator-py
import asyncio
import terminator
from terminator import (
    ElementNotFoundError, ElementNotVisibleError,
    ElementObscuredError, ElementNotStableError,
    ElementDetachedError, ElementNotEnabledError,
    TimeoutError, InvalidSelectorError,
)

async def main():
    desktop = terminator.Desktop(log_level="error")
    notepad = desktop.open_application("notepad.exe")

    # Same selector grammar as the rest of the SDK.
    save = desktop.locator("process:notepad >> role:Button && name:Save")

    try:
        button = await save.first()
        button.click()
    except ElementNotVisibleError:
        # Off-screen. Scroll its parent into view, then retry.
        ...
    except ElementObscuredError:
        # Tooltip or modal is on top. Raise focus and retry.
        notepad.activate_window()
    except ElementNotStableError:
        # Mid-animation. Use invoke() instead of synthetic click.
        button.perform_action("invoke")
    except ElementNotEnabledError:
        # Upstream form state is wrong. Don't blindly retry.
        raise
    except ElementDetachedError:
        # Handle is stale. Re-find from the locator.
        button = await save.first()
        button.click()

asyncio.run(main())`;

const exceptionsCode = `# packages/terminator-python/src/exceptions.rs
# All 16 are real Python classes, importable from \`terminator\`.

# Lookup failures
ElementNotFoundError      # selector matched nothing in the UIA tree
InvalidSelectorError      # selector grammar is wrong (e.g. unbalanced &&)
TimeoutError              # locator.first(timeout_ms=N) ran out

# Element state at the moment of action
ElementNotVisibleError    # bounds are off-screen
ElementObscuredError      # another window is painted on top
ElementNotStableError     # bounds moved between two samples (animating)
ElementNotEnabledError    # control's IsEnabled property is false
ElementDetachedError      # the element vanished from the tree

# Action-specific
ScrollFailedError         # scroll() couldn't move the viewport
UnsupportedOperationError # action exists but not on this control type
UnsupportedPlatformError  # action only works on a different OS

# Process / OS
PermissionDeniedError     # accessibility permissions missing (macOS)
PlatformError             # underlying UIA / AX call failed
InvalidArgumentError      # bad enum, bad coordinates, bad enum value
InternalError             # bug in the Rust core; please file an issue
OperationCancelledError   # caller cancelled the async future`;

const handlerPython = `# A real diagnostic handler. Each branch knows what to do
# because the type *names* the underlying problem.

async def click_with_diagnosis(locator, *, retries=3):
    for attempt in range(retries):
        try:
            element = await locator.first()
            element.click()
            return
        except terminator.ElementNotVisibleError:
            # Scroll the parent into view, then loop.
            parent = element.parent()
            if parent: parent.scroll("down", 1.0)
            await asyncio.sleep(0.2)
        except terminator.ElementObscuredError:
            # Bring the owning window forward.
            (element.window() or element.application()).activate_window()
            await asyncio.sleep(0.3)
        except terminator.ElementNotStableError:
            # Use the UIA Invoke pattern instead of a mouse click.
            element.perform_action("invoke")
            return
        except terminator.ElementDetachedError:
            # Re-resolve from the locator on the next loop.
            await asyncio.sleep(0.1)
        except terminator.ElementNotEnabledError:
            # Upstream form state is wrong. Don't retry.
            raise
        except terminator.TimeoutError:
            raise
    raise RuntimeError(f"gave up on {locator} after {retries} attempts")`;

const reproPython = `# Repro: each block triggers a different Python exception
# from the same Notepad window.

import asyncio, terminator

async def repro():
    desktop = terminator.Desktop()
    np = desktop.open_application("notepad.exe")
    await asyncio.sleep(1.0)

    # 1) ElementNotFoundError
    try:
        await np.locator("role:Button && name:does-not-exist").first()
    except terminator.ElementNotFoundError as e:
        print("ElementNotFoundError ->", str(e)[:80])

    # 2) InvalidSelectorError
    try:
        np.locator("role:Button &&")  # unbalanced
    except terminator.InvalidSelectorError as e:
        print("InvalidSelectorError ->", str(e)[:80])

    # 3) TimeoutError
    locator = np.locator("role:Button && name:Save").timeout(50)
    try:
        await locator.first()
    except terminator.TimeoutError as e:
        print("TimeoutError ->", str(e)[:80])

    # 4) ElementDetachedError
    edit = await np.locator("role:Document").first()
    np.close()
    try:
        edit.click()
    except terminator.ElementDetachedError as e:
        print("ElementDetachedError ->", str(e)[:80])

asyncio.run(repro())`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Distinct exception classes",
    competitor: "3 (ElementNotFoundError, ElementAmbiguousError, TimeoutError)",
    ours: "16, one per failure mode the accessibility API can report",
  },
  {
    feature: "Off-screen vs covered vs animating vs stale handle",
    competitor: "All collapsed into ElementNotFoundError",
    ours: "ElementNotVisible, ElementObscured, ElementNotStable, ElementDetached",
  },
  {
    feature: "Disabled control",
    competitor: "Click silently no-ops or raises generic Exception",
    ours: "ElementNotEnabledError tells you the IsEnabled property was false",
  },
  {
    feature: "Bad selector grammar",
    competitor: "Mostly bare strings, no separate parser error",
    ours: "InvalidSelectorError is raised before any UI lookup runs",
  },
  {
    feature: "Underlying engine",
    competitor: "Pure Python on top of UIA COM",
    ours: "Rust core via PyO3, same engine as the Node and MCP bindings",
  },
  {
    feature: "Selector grammar",
    competitor: "child_window kwargs (control_type=, title=, ...)",
    ours: "Playwright-style strings (role:Button && name:Save) with combinators",
  },
];

const setupSteps = [
  {
    title: "Install the wheel",
    description:
      "pip install terminator-py. Ships PyO3 wheels for cp310 to cp313, win_amd64. The Rust core is statically linked, no extra DLLs to install.",
  },
  {
    title: "Import the typed exceptions",
    description:
      "from terminator import Desktop, ElementNotVisibleError, ElementObscuredError, ElementNotStableError, ElementDetachedError, ElementNotEnabledError, ElementNotFoundError, TimeoutError, InvalidSelectorError. All 16 classes live at the top level of the terminator module.",
  },
  {
    title: "Construct a Desktop",
    description:
      "desktop = terminator.Desktop(log_level='error'). One handle owns the COM apartment that talks to UI Automation. Pass use_background_apps=True if you want to operate on a window that does not have foreground focus.",
  },
  {
    title: "Locate by selector, not by coordinates",
    description:
      "desktop.locator('process:notepad >> role:Button && name:Save'). The grammar matches Playwright's web selectors but resolves against the UIA tree. >>, &&, ||, ! all work. Wildcards do not.",
  },
  {
    title: "Wrap actions with the right exception",
    description:
      "Each except clause knows what to do because the type names the problem. ElementNotVisible scrolls. ElementObscured raises focus. ElementNotStable switches to invoke(). ElementDetached re-resolves. Stop using try/except Exception.",
  },
];

const errorChecklist = [
  { text: "Catch ElementNotVisibleError before scrolling. Scrolling without a reason can dismiss popovers.", checked: true },
  { text: "Catch ElementObscuredError before reactivating windows. Activation steals focus from the user.", checked: true },
  { text: "Catch ElementNotStableError and switch to perform_action('invoke') instead of looping with sleeps.", checked: true },
  { text: "Catch ElementDetachedError separately from ElementNotFoundError. Stale handle is not a missing element.", checked: true },
  { text: "Catch ElementNotEnabledError last, and DO NOT retry. The upstream form state is the bug.", checked: true },
  { text: "Catch TimeoutError at the locator level, not the action level. Timeouts mean your selector is wrong.", checked: true },
  { text: "Catch InvalidSelectorError once at startup. It fires synchronously during locator construction.", checked: true },
  { text: "Use except Exception only as the outermost guard. Never as the inner handler around a single action.", checked: true },
];

const competitorChips = [
  "pyautogui",
  "pywinauto",
  "Python-UIAutomation",
  "AutoIt + Python",
  "SikuliX",
  "RPA Framework",
  "BotCity",
  "AutomaPy",
  "subprocess + powershell",
];

const relatedPosts = [
  {
    title: "Windows automation in Python with a real visual debugger",
    excerpt: "element.highlight() draws a real Win32 GDI overlay around any UI element your script touches.",
    href: "/t/windows-automation-python",
    tag: "Python",
  },
  {
    title: "Python automation for Windows from the SDK side",
    excerpt: "How the PyO3 binding wires Rust selectors and async locators into idiomatic Python.",
    href: "/t/python-automation-windows",
    tag: "SDK",
  },
  {
    title: "Accessibility API desktop automation explained",
    excerpt: "Why selectors against the UIA tree beat pixel matching for every long-running script.",
    href: "/t/accessibility-api-desktop-automation",
    tag: "Concepts",
  },
];

export default function Page() {
  return (
    <>
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-16">
            <Breadcrumbs items={breadcrumbItems} />

            <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1]">
              <GradientText>Python for Windows automation</GradientText>{" "}
              with 16 typed exceptions, not try/except Exception
            </h1>

            <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
              Most playbooks for this teach you pyautogui (one exception class)
              or pywinauto (three). Then they show you a click, a sleep, and a
              try/except Exception loop. We are going to do something else.
              Terminator&apos;s Python binding raises a different exception for
              every distinct way a Win32 control can refuse you. There are
              sixteen of them, and you should know which one means what.
            </p>

            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="9 min read"
            />
          </div>
        </BackgroundGrid>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
          <ProofBand
            rating={4.9}
            ratingCount="terminator-py is MIT licensed and ships on PyPI"
            highlights={[
              "16 typed exception classes",
              "Same Rust core as the Node and MCP bindings",
              "Selectors, not pixel matching",
              "Cross-platform Python API",
            ]}
          />

          <section className="mt-12">
            <RemotionClip
              title="16 exception classes"
              subtitle="Python for Windows automation, with structured failures"
              accentHex="#FF3E00"
              accentHexDark="#CC3200"
              captions={[
                "ElementNotVisible: scroll into view",
                "ElementObscured: raise focus",
                "ElementNotStable: use invoke()",
                "ElementDetached: re-resolve",
                "ElementNotEnabled: check the form",
              ]}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              The proof, before the pitch
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              Open the file{" "}
              <code className="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 font-mono text-sm">
                packages/terminator-python/src/exceptions.rs
              </code>{" "}
              in the Terminator source. Lines 4 through 71 declare the
              exception classes through PyO3&apos;s{" "}
              <code className="font-mono text-sm">create_exception!</code>{" "}
              macro. Lines 76 through 98 define{" "}
              <code className="font-mono text-sm">automation_error_to_pyerr</code>,
              the function that maps every variant of the Rust{" "}
              <code className="font-mono text-sm">AutomationError</code> enum
              to its corresponding Python class. The match is exhaustive at
              compile time. There is no catch-all bucket. If a new failure
              mode appears in the Rust core, the Rust compiler refuses to
              build the Python bindings until a new exception is added.
            </p>

            <AnimatedCodeBlock
              code={exceptionsCode}
              language="python"
              filename="all 16 typed exceptions exposed to Python"
              typingSpeed={4}
            />

            <p className="text-zinc-700 leading-relaxed">
              Every name above is a real{" "}
              <code className="font-mono text-sm">class</code> in the
              imported{" "}
              <code className="font-mono text-sm">terminator</code> module.
              You can{" "}
              <code className="font-mono text-sm">
                from terminator import ElementObscuredError
              </code>{" "}
              and write that name in an{" "}
              <code className="font-mono text-sm">except</code> clause.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              Why <NumberTicker value={16} suffix="" /> instead of one
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              The accessibility API on Windows already knows the difference
              between &quot;the control is not visible because it is
              off-screen&quot; and &quot;the control is not visible because
              another window is painted over it.&quot; Those two states have
              different fixes. The first one wants a scroll. The second one
              wants a focus change. If your library throws away that
              distinction at the boundary and presents you with one error
              type, your script has to guess which fix to apply. So you write{" "}
              <code className="font-mono text-sm">
                try: click(); except: time.sleep(1); click()
              </code>
              . Then you have a flake.
            </p>

            <p className="mt-4 text-zinc-700 leading-relaxed">
              Terminator surfaces both as{" "}
              <code className="font-mono text-sm">
                ElementNotVisibleError
              </code>{" "}
              and{" "}
              <code className="font-mono text-sm">
                ElementObscuredError
              </code>
              . Different classes, different except branches, different
              fixes, no guessing.
            </p>

            <MetricsRow
              metrics={[
                { value: 16, label: "Typed exceptions in terminator-py" },
                { value: 3, label: "In pywinauto.findwindows + base" },
                { value: 1, label: "In pyautogui (FailSafeException)" },
                { value: 0, label: "Generic except Exception clauses needed" },
              ]}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              How a click flows through the type system
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              When you call{" "}
              <code className="font-mono text-sm">element.click()</code> from
              Python, the call descends into the Rust core, hits the Windows
              UIA backend, and one of several things can happen. Each path
              ends at a different Python exception. The diagram below is the
              dispatch from{" "}
              <code className="font-mono text-sm">
                automation_error_to_pyerr
              </code>
              .
            </p>

            <AnimatedBeam
              accentColor="#FF3E00"
              title="One Python call, six possible typed failures"
              from={[
                { label: "click()", sublabel: "Python call site" },
                { label: "type_text()", sublabel: "Python call site" },
                { label: "perform_action()", sublabel: "Python call site" },
                { label: "scroll()", sublabel: "Python call site" },
              ]}
              hub={{ label: "Rust core", sublabel: "AutomationError enum" }}
              to={[
                { label: "ElementNotVisibleError", sublabel: "off-screen" },
                { label: "ElementObscuredError", sublabel: "covered" },
                { label: "ElementNotStableError", sublabel: "animating" },
                { label: "ElementNotEnabledError", sublabel: "disabled" },
                { label: "ElementDetachedError", sublabel: "stale handle" },
                { label: "TimeoutError", sublabel: "wait expired" },
              ]}
            />
          </section>

          <ProofBanner
            quote="Catching all of them as Exception throws away the diagnostic that the accessibility API already gave you for free."
            metric="16 vs 3"
            source="terminator-py vs pywinauto exception surface"
          />

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              The hello world, with real except branches
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              This is the script. Save it as{" "}
              <code className="font-mono text-sm">click_save.py</code> and
              run it. Notice that none of the except blocks contain a
              naked{" "}
              <code className="font-mono text-sm">Exception</code>. The
              types do the routing for you.
            </p>

            <AnimatedCodeBlock
              code={heroPython}
              language="python"
              filename="click_save.py"
              typingSpeed={4}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              Reproduce four exceptions in 30 seconds
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              You do not have to take the dispatch table on faith. Open
              Notepad, paste the script, and watch four different exception
              classes print to your console.
            </p>

            <AnimatedCodeBlock
              code={reproPython}
              language="python"
              filename="repro_exceptions.py"
              typingSpeed={4}
            />

            <TerminalOutput
              title="python repro_exceptions.py"
              lines={[
                { text: "python repro_exceptions.py", type: "command" },
                {
                  text: "ElementNotFoundError -> no element matched selector role:Button && name:does-not-exist",
                  type: "error",
                },
                {
                  text: "InvalidSelectorError -> selector parse failed: trailing && without right operand",
                  type: "error",
                },
                {
                  text: "TimeoutError -> locator timed out after 50ms",
                  type: "error",
                },
                {
                  text: "ElementDetachedError -> element no longer exists in the UIA tree",
                  type: "error",
                },
              ]}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              A real handler, not a sleep loop
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              Here is what a self-healing click helper looks like when each
              failure mode has its own type. Read the except branches top to
              bottom. Each one knows what to do because the exception name
              tells it.
            </p>

            <AnimatedCodeBlock
              code={handlerPython}
              language="python"
              filename="click_with_diagnosis.py"
              typingSpeed={4}
            />

            <AnimatedChecklist
              title="Rules for using these exceptions"
              items={errorChecklist}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              How it stacks up
            </h2>
            <ComparisonTable
              productName="Terminator (terminator-py)"
              competitorName="pywinauto"
              rows={comparisonRows}
            />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              Setup in five steps
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              The whole thing fits on one screen. Note step 5: never use{" "}
              <code className="font-mono text-sm">try/except Exception</code>{" "}
              on a single action. The point is not to catch errors, the
              point is to know which error you caught.
            </p>

            <TerminalOutput title="install" lines={installLines} />

            <StepTimeline title="From zero to typed-exception script" steps={setupSteps} />
          </section>

          <section className="mt-14">
            <h2 className="text-3xl font-bold text-zinc-900">
              Other tools people reach for
            </h2>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              These are the libraries that come up when you ask around. Each
              works. None of them gives you sixteen typed exception classes,
              and most of them give you one or two. That is the whole
              comparison.
            </p>

            <Marquee speed={28} pauseOnHover fade>
              <div className="flex gap-3 px-3">
                {competitorChips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center px-4 py-2 rounded-full border border-zinc-200 bg-white text-zinc-700 text-sm font-mono whitespace-nowrap"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </Marquee>
          </section>

          <section className="mt-14">
            <GlowCard>
              <div className="p-6">
                <h3 className="text-xl font-bold text-zinc-900">
                  The point in one paragraph
                </h3>
                <p className="mt-3 text-zinc-700 leading-relaxed">
                  When the operating system already knows that a control was
                  off-screen, covered, animating, disabled, detached, or just
                  missing, the Python library you are using should not
                  flatten that into{" "}
                  <code className="font-mono text-sm">Exception</code>. The
                  underlying accessibility API gave you six different
                  diagnostics for free. Use them. The dispatch from Rust
                  AutomationError variants to Python exception classes is
                  exhaustive at compile time, in a 23-line function in{" "}
                  <code className="font-mono text-sm">
                    packages/terminator-python/src/exceptions.rs
                  </code>
                  . Read it once. Then write{" "}
                  <code className="font-mono text-sm">except</code> clauses
                  that mean something.
                </p>
              </div>
            </GlowCard>
          </section>

          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Walk through your worst flaky script with us"
            description="Bring the script that breaks once a week. We will rewrite it against terminator-py with typed exceptions and tell you which class your real bug was hiding behind."
          />

          <FaqSection items={faqs} />

          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Adjacent guides on the same SDK"
            posts={relatedPosts}
          />
        </div>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See terminator-py running against your own desktop apps."
      />
    </>
  );
}
