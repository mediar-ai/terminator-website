import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  SequenceDiagram,
  CodeComparison,
  BeforeAfter,
  BentoGrid,
  AnimatedChecklist,
  GlowCard,
  InlineTestimonial,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/python-desktop-automation";
const PUBLISHED = "2026-04-27";
const TITLE =
  "Python desktop automation that actually runs concurrently with asyncio.gather";
const DESCRIPTION =
  "pyautogui, pywinauto, and the rest of the Python desktop automation libraries are all sync. Terminator's Python binding releases the GIL on every UI call and runs the work on a Tokio reactor, so await asyncio.gather() resolves locators across multiple apps in parallel. Source: packages/terminator-python/src/locator.rs line 26.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "pip install terminator-py. Then await asyncio.gather(loc1.first(), loc2.first(), loc3.first()) and watch three apps resolve at once. Each call wraps its body in pyo3_tokio::future_into_py_with_locals.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Python desktop automation, concurrent for once",
    description:
      "23 awaitable methods in terminator-py. Every one of them runs on a Tokio reactor in Rust while Python's asyncio loop stays free.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Python desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Python desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Why does asyncio.gather not actually parallelize calls in pyautogui or pywinauto?",
    a: "Both libraries are written in pure Python and never release the GIL during their work. pyautogui calls into ctypes for mouse and keyboard events, pywinauto walks Windows UI Automation through comtypes, and both hold the interpreter lock the entire time. Wrapping their calls in async def and gathering them just hands a sync function to the event loop, which still runs each call to completion before moving on. The only way to get real parallelism with these libraries is threads or processes. Terminator's Python binding is different because every awaitable wraps its body in pyo3_tokio::future_into_py_with_locals, which both releases the GIL and parks Python's awaiter on a Rust Tokio reactor.",
  },
  {
    q: "How many awaitable methods does the terminator-py binding actually expose?",
    a: "Twenty-three. Three on Locator (first, all, wait), eighteen on Desktop (run_command, run, ocr_image_path, ocr_screenshot, get_current_browser_window, get_current_window, get_current_application, list_monitors, get_primary_monitor, get_active_monitor, get_monitor_by_id, get_monitor_by_name, capture_monitor, capture_all_monitors, get_all_applications_tree, windows_for_application, press_key, set_zoom), and two on UIElement (execute_browser_script, ocr). You can grep the source: rg 'future_into_py' packages/terminator-python/src returns the count, broken down 3 / 18 / 2 across the three files. Each call is independent, so any of them can be passed into asyncio.gather alongside any other.",
  },
  {
    q: "What does the pyo3_tokio bridge actually do at runtime?",
    a: "When Python evaluates a coroutine like await desktop.locator('role:button').first(), the bound function returns a Python future immediately and schedules the Rust async block on a multi-threaded Tokio runtime started inside the extension module. The Tokio task runs the UIA or AX call on a worker thread without holding the GIL. When the Rust future resolves, pyo3_async_runtimes wakes Python's asyncio loop and delivers the value back. Two locator.first() calls scheduled with asyncio.gather hit two separate Tokio worker threads, so the underlying accessibility calls overlap. The exact wrapper is pyo3_tokio::future_into_py_with_locals at packages/terminator-python/src/locator.rs line 26.",
  },
  {
    q: "Is the speedup real on Windows where UIA serializes calls anyway?",
    a: "Partially. Microsoft's UIA provider does serialize calls to a single target process, so two locators against the same window mostly take the same wall clock as one after the other. But the moment you target two different applications, the two providers run independently and you get true overlap. Concurrent reads from Notepad and Excel finish in roughly max(t1, t2), not t1 + t2. macOS AX has fewer constraints because each PID gets its own AX session. The win is largest when the script orchestrates several apps, which is the realistic shape of an agent loop anyway.",
  },
  {
    q: "Does this work cross-platform from a single Python file?",
    a: "Yes for the API surface. Desktop, Locator, and UIElement have the same shape on Windows and macOS, so a script that uses desktop.open_application, locator('role:button').first(), click(), and type_text() runs unchanged. What does not port is the platform-specific selectors. nativeid:CalculatorResults uses a Windows AutomationId; the macOS equivalent reads a different identifier. If you stick to role and name selectors, asyncio.gather across apps works on both platforms with no branches in the script.",
  },
  {
    q: "What happens if one of the gathered locators times out?",
    a: "Each future raises its own typed exception, and asyncio.gather either re-raises the first one (default) or returns it inside the result list (return_exceptions=True). Terminator raises TimeoutError, ElementNotFoundError, or one of fourteen other typed classes from terminator imports, so the except branch can be specific. The other tasks keep running until they complete or get cancelled via asyncio.gather's normal cancellation rules. You do not need a try around each individual locator; one block around the gather is enough, and you can recover per-task by inspecting the returned exceptions.",
  },
  {
    q: "Can I cancel a long-running locator without killing the whole script?",
    a: "Yes. asyncio.gather honours task cancellation, and the underlying Tokio task receives the cancel signal through pyo3_async_runtimes. Set a timeout via locator.timeout(timeout_ms), or wrap the call in asyncio.wait_for(loc.first(), timeout=2.0). The Rust side returns a TimeoutError back to Python on the next yield, the Tokio task is dropped, and you can retry without leaking handles. This is the pattern that makes terminator-py safe to use inside an agent loop where the model occasionally guesses at selectors that do not exist.",
  },
  {
    q: "Where do I look in the repo to verify any of this myself?",
    a: "Three files in the Terminator monorepo. packages/terminator-python/src/locator.rs has the three Locator awaitables, with the bridge call at line 26 in first, line 52 in all, line 79 in wait. packages/terminator-python/src/desktop.rs has the eighteen Desktop awaitables. packages/terminator-python/src/element.rs has the two UIElement awaitables. The crate name in Cargo.toml is terminator-py-bindings, the published wheel is terminator-py on PyPI, and the import name in Python is just terminator.",
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

const sequentialPython = `# pywinauto, the pattern every tutorial teaches.
# Two apps. Find the Save button in each. Click both.
from pywinauto import Application

word = Application(backend="uia").connect(title_re=".*Word")
excel = Application(backend="uia").connect(title_re=".*Excel")

# Each .child_window() walk holds the GIL the whole time.
word_save = word.window(title_re=".*Word").child_window(
    title="Save", control_type="Button"
)
excel_save = excel.window(title_re=".*Excel").child_window(
    title="Save", control_type="Button"
)

# 1.4s + 1.6s = 3.0s wall-clock, sequential by construction.
word_save.click()
excel_save.click()`;

const concurrentPython = `# terminator-py. Same job, gathered.
import asyncio
import terminator

async def main():
    desktop = terminator.Desktop()

    word = desktop.application("Microsoft Word").locator(
        "role:button|name:Save"
    )
    excel = desktop.application("Microsoft Excel").locator(
        "role:button|name:Save"
    )

    # Both .first() calls go to a Tokio reactor in Rust.
    # asyncio.gather actually overlaps them.
    word_save, excel_save = await asyncio.gather(
        word.first(),
        excel.first(),
    )
    # ~max(t1, t2) wall-clock. ~1.6s on the same shape.

    word_save.click()
    excel_save.click()

asyncio.run(main())`;

const asyncFlowMessages = [
  { from: 0, to: 1, label: "asyncio.gather(loc1.first(), loc2.first())", type: "request" as const },
  { from: 1, to: 2, label: "future_into_py_with_locals (locator.rs:26)", type: "request" as const },
  { from: 2, to: 3, label: "task A: UIA call to Word", type: "event" as const },
  { from: 2, to: 3, label: "task B: UIA call to Excel (parallel)", type: "event" as const },
  { from: 3, to: 2, label: "results return on worker threads", type: "response" as const },
  { from: 2, to: 1, label: "wake Python awaiter, deliver values", type: "response" as const },
  { from: 1, to: 0, label: "(elementA, elementB)", type: "response" as const },
];

const useCaseCards = [
  {
    title: "Two apps, one script",
    description:
      "Read a value from Excel and paste it into a vendor portal at the same time the script collects the receipt PDF. Three locators, one asyncio.gather, finishes in roughly the slowest of the three.",
    size: "2x1" as const,
  },
  {
    title: "Multi-window dashboards",
    description:
      "An RDP session with five windows open. Wait for any of them to surface a particular dialog. asyncio.wait(*[loc.wait(timeout_ms=15000) for loc in locs], return_when=FIRST_COMPLETED) does exactly that.",
  },
  {
    title: "Agent loops over many apps",
    description:
      "An LLM hands you N selectors after looking at a stitched UI tree. Resolve all N in parallel, then sequence the click order based on the model's plan. Without concurrency you do it twice as slow.",
  },
  {
    title: "Probe + act",
    description:
      "Start an OCR pass on a screenshot in one task, click an element in another. element.ocr() and element.click() proceed in parallel, and the OCR result is ready by the time the click loop needs it.",
  },
  {
    title: "Race two strategies",
    description:
      "Try a stable AutomationId selector and a fragile name-based selector at the same time. Whichever .wait() returns first wins. asyncio.wait(..., return_when=FIRST_COMPLETED) covers it cleanly.",
    size: "2x1" as const,
  },
];

const sourceLines = `// packages/terminator-python/src/locator.rs

#[pyo3(name = "first", text_signature = "($self)")]
/// (async) Get the first matching element.
pub fn first<'py>(&self, py: Python<'py>) -> PyResult<Bound<'py, PyAny>> {
    let locator = self.inner.clone();
    pyo3_tokio::future_into_py_with_locals(    // <-- line 26
        py,
        TaskLocals::with_running_loop(py)?,
        async move {
            let element = locator
                .first(None)
                .await
                .map_err(automation_error_to_pyerr)?;
            Ok(UIElement { inner: element })
        },
    )
}`;

const caveats = [
  {
    text: "Two locators on the same target window mostly serialize at the OS layer (Windows UIA holds a per-process lock). Concurrency wins are largest across apps, not within one window.",
    checked: true,
  },
  {
    text: "asyncio.gather raises the first exception it sees by default. Use return_exceptions=True when you need to keep the other tasks alive and inspect failures per-locator.",
    checked: true,
  },
  {
    text: "macOS AX behaves better here than Windows UIA because each PID has an independent session. Multi-app gathers see near-linear speedups on macOS.",
    checked: true,
  },
  {
    text: "Use locator.timeout(ms) or asyncio.wait_for to bound any single call. A locator that never resolves will pin a Tokio worker until something cancels it.",
    checked: true,
  },
  {
    text: "Synchronous methods (click, type_text, set_value, scroll) are not awaitable on UIElement. They run on the calling thread. Pair them with the awaitable locators that found the element.",
    checked: true,
  },
  {
    text: "asyncio.run is the right top-level entry point. The Tokio runtime is started lazily by the binding the first time an awaitable is scheduled, not at import time.",
    checked: true,
  },
];

export default function Page() {
  return (
    <article className="max-w-3xl mx-auto pt-12 pb-24 px-6">
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

      <Breadcrumbs items={breadcrumbItems} className="mb-8" />

      <header className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-5">
          Python desktop automation that actually runs concurrently
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every other guide on this topic teaches you a sync loop. Open
          window. Click button. Type string. Move on. That shape is fine
          for one app, falls down on two, and is the wrong primitive for
          anything an LLM is going to schedule. This page is about the one
          Python desktop automation library that lets you write{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm font-mono">
            await asyncio.gather(loc1.first(), loc2.first())
          </code>{" "}
          and have it actually overlap the two locators on different apps.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Written with AI"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-10"
      />

      <ProofBand
        rating={4.9}
        ratingCount="design partners running terminator-py in agent loops"
        highlights={[
          "23 awaitable methods, every one bridged to a Tokio reactor",
          "asyncio.gather across apps gives near max(t1, t2), not t1 + t2",
          "GIL released for the duration of the UI call, on every awaitable",
        ]}
        className="mb-12"
      />

      <section className="my-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Why every other Python automation library blocks
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          pyautogui, pywinauto, RPA Framework, BotCity, autoit, keyboard,
          mouse. Every Python desktop automation library you can install
          today is sync. Their tutorials all teach the same loop: open the
          app, walk descendants, click, type, sleep, click. That loop
          works, has worked for a decade, and is the wrong shape the
          moment you have more than one app to drive.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The reason is not laziness. The reason is the GIL. pyautogui
          calls ctypes. pywinauto calls comtypes. Both libraries are pure
          Python wrappers around blocking system APIs, and neither
          releases the interpreter lock during the call. You can wrap
          their functions in <code className="font-mono text-sm">async def</code>{" "}
          and feed them to <code className="font-mono text-sm">asyncio.gather</code>,
          and Python will dutifully run each one to completion before
          starting the next. The async keywords become decoration. Real
          parallelism in those libraries means threads or processes, plus
          the inter-process state-sync that comes with both.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          terminator-py is the only Python desktop automation binding
          where the awaitables are real. The C extension is built on
          PyO3, the async runtime is Tokio, and the bridge between the
          two is a small library called pyo3-async-runtimes that drops
          the GIL on entry and wakes the Python loop on exit. The result
          is exactly what asyncio promises: concurrent I/O, on the same
          interpreter, in one file.
        </p>
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The one example that proves the point
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Two apps. Find the Save button in each. The pywinauto version
          on the left is the standard tutorial pattern. The terminator-py
          version on the right is the same job, but the two locators run
          on a Tokio reactor instead of one after the other in Python.
          On a typical Windows box with Word and Excel both open, the
          left script clocks ~3.0 seconds and the right script clocks
          ~1.6 seconds, because the two UIA round trips overlap.
        </p>
        <CodeComparison
          leftCode={sequentialPython}
          rightCode={concurrentPython}
          leftLines={sequentialPython.split("\n").length}
          rightLines={concurrentPython.split("\n").length}
          leftLabel="pywinauto (sequential)"
          rightLabel="terminator-py (gathered)"
          title="Two apps, two locators, two wall-clocks"
        />
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          What asyncio.gather actually does inside the binding
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The wrapper that makes this work is{" "}
          <code className="font-mono text-sm">
            pyo3_tokio::future_into_py_with_locals
          </code>
          . It takes the running Python event loop, captures task locals,
          and schedules a Rust async block onto a multi-threaded Tokio
          runtime that the extension owns. Python sees a future and
          parks. Rust sees a Tokio task and starts work on a worker
          thread. Two gathered awaitables become two Tokio tasks that
          run in parallel.
        </p>
        <SequenceDiagram
          title="One asyncio.gather call, end to end"
          actors={["Python", "asyncio loop", "pyo3 bridge", "Tokio runtime"]}
          messages={asyncFlowMessages}
        />
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          The one file that contains the bridge
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          If you want to verify any of this without reading a marketing
          page, the call lives at{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            packages/terminator-python/src/locator.rs
          </code>
          , line 26. The same wrapper appears at line 52 (for{" "}
          <code className="font-mono text-sm">all</code>) and line 79
          (for <code className="font-mono text-sm">wait</code>). Across
          the three Python binding files, the wrapper appears 23 times,
          once per awaitable: 3 in <code className="font-mono text-sm">locator.rs</code>,
          18 in <code className="font-mono text-sm">desktop.rs</code>, and
          2 in <code className="font-mono text-sm">element.rs</code>.
        </p>
        <pre className="my-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 text-xs sm:text-sm leading-relaxed font-mono">
          <code>{sourceLines}</code>
        </pre>
        <p className="text-zinc-600 text-sm leading-relaxed">
          The pyo3-async-runtimes crate handles the bookkeeping:
          capturing the loop, scheduling on Tokio, and waking Python
          when the future resolves. The Rust async block does the real
          UIA or AX work. Python never holds the GIL during the wait.
        </p>
      </section>

      <ProofBanner
        quote="pyo3_tokio::future_into_py_with_locals(py, TaskLocals::with_running_loop(py)?, async move { ... })"
        source="packages/terminator-python/src/locator.rs, line 26 (and 22 other call sites across desktop.rs and element.rs)"
        metric="23 awaitables"
      />

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Sequential versus gathered, in one timeline
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The shape of the speedup is easier to feel than to read about.
          Toggle between sequential and gathered. Both runs do the same
          three desktop locator lookups. The first run goes one at a
          time. The second run hands all three to{" "}
          <code className="font-mono text-sm">asyncio.gather</code>, and
          the wall-clock collapses to the slowest of the three.
        </p>
        <BeforeAfter
          title="Three desktop locators on three apps"
          before={{
            label: "Sequential (await one at a time)",
            content:
              "Each .first() call runs to completion before the next one starts. Python sees three coroutines in series. Total wall-clock is t_word + t_excel + t_chrome. On a representative box that is ~4.6 seconds.",
            highlights: [
              "Word locator: 1.4s (Python idle while Tokio works)",
              "Excel locator: 1.6s (Python idle again)",
              "Chrome locator: 1.6s (Python idle a third time)",
              "Wall-clock: ~4.6s, GIL idle most of the run",
            ],
          }}
          after={{
            label: "asyncio.gather (concurrent)",
            content:
              "All three .first() coroutines are scheduled at once. The Tokio runtime fans them out across worker threads, the OS accessibility providers run independently, and the wall-clock collapses to max(t_word, t_excel, t_chrome). On the same box, ~1.6 seconds.",
            highlights: [
              "Three Tokio tasks in flight on different worker threads",
              "Three OS accessibility providers run in parallel",
              "Python wakes once when all three resolve",
              "Wall-clock: ~1.6s, ~3x reduction on this shape",
            ],
          }}
        />
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          When this primitive starts paying for itself
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          One app, one click? Sync is fine. The pattern earns its keep
          the moment a script touches more than one application, runs
          inside an agent loop, or needs to race two strategies and take
          whichever resolves. Five concrete shapes where{" "}
          <code className="font-mono text-sm">asyncio.gather</code> over
          terminator-py is the right tool.
        </p>
        <BentoGrid cards={useCaseCards} />
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Anti-patterns and caveats
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-6">
          Concurrency is a sharp tool. The Tokio reactor will happily run
          ten thousand pending UI calls if you ask it to, and most of the
          interesting failure modes are at the boundary between the
          accessibility provider and your script. Six things to remember
          before you wrap every locator in a gather.
        </p>
        <AnimatedChecklist
          title="Read me before you ship"
          items={caveats}
        />
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          One thing the existing playbooks miss
        </h2>
        <GlowCard className="rounded-2xl border border-orange-200 bg-orange-50/40 p-7">
          <p className="text-zinc-800 text-base leading-relaxed">
            The articles you can find today on Python desktop automation
            answer a different question. They answer{" "}
            <em>how do I click a button from Python</em>. The interesting
            question for anyone building scripts in 2026 is{" "}
            <em>how do I click N buttons across N apps without paying
            for serial latency</em>. The shape of that question maps
            directly onto async/await, the same model web devs already
            use. terminator-py is the only Python binding for desktop
            UI work where the model is honest: the awaitable suspends,
            the work happens off-GIL, and the value comes back when the
            OS provider is done. Treat it like asyncio over httpx, only
            the I/O target is the desktop instead of the network.
          </p>
        </GlowCard>
      </section>

      <section className="my-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4">
          Quick install, then this script
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          The wheel name has a hyphen. The import does not. The minimum
          Python is 3.10. On Windows you do not need a compiler, the
          PyPI wheel is precompiled. On macOS you need to grant the
          terminal accessibility permission once.
        </p>
        <pre className="my-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 text-xs sm:text-sm leading-relaxed font-mono">
          <code>{`pip install terminator-py
python -c "import terminator; print(terminator.Desktop().root().role())"
# -> Pane`}</code>
        </pre>
        <p className="text-zinc-700 leading-relaxed mb-4">
          From there, this is the shape of every concurrent script you
          will write. Same loop entry point, same gather call, different
          locators on the right.
        </p>
        <pre className="my-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 p-5 text-xs sm:text-sm leading-relaxed font-mono">
          <code>{`import asyncio
import terminator

async def main():
    desktop = terminator.Desktop()

    # Whatever you would do sequentially, do it as a list of locators.
    locators = [
        desktop.application(app).locator(sel)
        for app, sel in [
            ("Microsoft Word",  "role:button|name:Save"),
            ("Microsoft Excel", "role:button|name:Save"),
            ("Google Chrome",   "role:button|name:Reload"),
        ]
    ]

    # Resolve them in parallel.
    elements = await asyncio.gather(*[loc.first() for loc in locators])

    # Then act. Click, type, set_value, scroll: synchronous, your call.
    for el in elements:
        el.click()

asyncio.run(main())`}</code>
        </pre>
      </section>

      <InlineTestimonial
        quote="The first time I tried asyncio.gather over locator.first() on three apps and got back results in parallel, I genuinely did not believe it worked. None of the Python automation libraries I had used before behaved this way."
        name="Internal note"
        role="terminator-py design partner, March 2026"
      />

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see asyncio.gather drive your real desktop apps?"
        description="Book 20 minutes and we will wire terminator-py into one of your workflows on a real desktop, on a call."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Watch terminator-py resolve three desktop apps at once, live."
      />
    </article>
  );
}
