import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  MetricsRow,
  TerminalOutput,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/structural-locators-vs-pixel-matching";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-22";
const MODIFIED = "2026-05-22";
const TITLE =
  "Structural locators vs pixel matching for computer use";
const DESCRIPTION =
  "A pixel match is a photo you took once. A structural locator is a query you re-run at the moment you act. Terminator's Locator stores only a selector and a timeout, then re-walks the accessibility tree on every action. Source: crates/terminator/src/locator.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Why a re-resolving locator survives a moved button, a theme change, and a DPI scale, and a captured pixel template does not. Broken down at the source line.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Structural locators vs pixel matching for computer use",
    description:
      "A locator holds no element. It holds a query and a timeout, and resolves fresh every action. Here is the line of Rust that makes it work.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Structural locators vs pixel matching" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "Structural locators vs pixel matching", url: PAGE_URL },
];

const metrics = [
  {
    value: 0,
    suffix: "s",
    label:
      "default locator timeout: one-shot search unless you ask it to wait (DEFAULT_LOCATOR_TIMEOUT)",
  },
  {
    value: 100,
    suffix: "ms",
    label: "poll interval while a locator waits for a condition (wait_for)",
  },
  {
    value: 4,
    label:
      "wait conditions a locator re-checks each poll: exists, visible, enabled, focused",
  },
  {
    value: 5,
    label:
      "spatial-relation selector kinds: right of, left of, above, below, near",
  },
];

const terminalLines = [
  { text: "agent step: click the Save button", type: "command" as const },
  {
    text: "locator(\"role:Button|name:Save\")  // a query, resolved now",
    type: "output" as const,
  },
  { text: "re-walking accessibility tree of frontmost window", type: "info" as const },
  { text: "matched 1 element, role=Button name=Save  enabled=true", type: "success" as const },
  { text: "invoke() via AXUIElementPerformAction", type: "success" as const },
  { text: "", type: "output" as const },
  { text: "agent step: same button, but the dialog never opened", type: "command" as const },
  {
    text: "locator(\"role:Button|name:Save\").waitFor(\"exists\", 1000)",
    type: "output" as const,
  },
  {
    text: "Timed out after 1s waiting for element role:Button|name:Save",
    type: "error" as const,
  },
  {
    text: "caught a typed AutomationError::Timeout, not a click into empty space",
    type: "info" as const,
  },
];

const faqs: FaqItem[] = [
  {
    q: "What is a structural locator, in one sentence?",
    a: "A description of an element by what it is: its role (Button, Edit, Document), its name, its place in the accessibility tree, and optionally its spatial relation to another element. The locator does not hold a pixel, a coordinate, or even a resolved element handle. It holds the query. You point it at a live window and it walks the tree to find a match at the moment you act. In Terminator that object is the Locator struct in crates/terminator/src/locator.rs, which carries an engine reference, a Selector, a timeout, and an optional root, and nothing else.",
  },
  {
    q: "What is pixel matching, and how is it different?",
    a: "Pixel matching covers two related techniques. Template matching crops a reference image of a control and slides it across a fresh screenshot looking for the best correlation (PyAutoGUI's locateOnScreen, OpenCV's matchTemplate). Coordinate replay records that the Save button was at (412, 238) and clicks there next time. Both freeze the target at capture time. A structural locator freezes nothing: it stores the description and resolves it against whatever the screen looks like when the action runs.",
  },
  {
    q: "Why does pixel matching break so easily?",
    a: "Because the thing it stored is appearance, and appearance is the least stable property of a UI. Change the display scale and every cached coordinate is off by the scale factor. Switch from light to dark theme and the template no longer correlates. Resize the window, collapse a sidebar, localize the button text, or let the OS animate a transition mid-frame, and the captured crop is matching against pixels that have moved or recolored. The control is still there, still does the same thing, still has the same role and name. Only its pixels changed, and pixels are exactly what the match keyed on.",
  },
  {
    q: "Does a structural locator resolve once and cache the element?",
    a: "No, and that is the whole point. Each action method on the locator re-runs the search. wait() calls the engine's find_element again. all() calls find_elements again. wait_for() loops, calling validate() every 100 milliseconds until the condition holds or the timeout fires. There is no stale handle to go bad between the moment you build the locator and the moment you click. The query is the durable artifact; the element is recomputed on demand.",
  },
  {
    q: "What happens when a structural locator cannot find its target?",
    a: "You get a typed error, not a wrong click. The engine returns ElementNotFound, and the locator upgrades it to AutomationError::Timeout with the selector string baked into the message, for example 'Timed out after 1s waiting for element role:Button|name:Save'. A pixel match in the same situation returns its best-correlation coordinate regardless of whether the match is any good, so the agent clicks confidently into empty space and the failure surfaces three steps later as nonsense. Loud, located failure beats silent, displaced failure every time you are debugging an agent.",
  },
  {
    q: "Can a structural locator express position, the way a screenshot region can?",
    a: "Yes, structurally rather than absolutely. The Selector enum in crates/terminator/src/selector.rs has RightOf, LeftOf, Above, Below, and Near, each wrapping another selector. So 'the field to the right of the Total label' is one query that re-resolves spatially as the layout reflows, instead of a fixed rectangle that points at the wrong place after a resize. You also get Has for parent-by-child matching and Nth for index selection, and you chain them with .locator() to scope into a subtree.",
  },
  {
    q: "Is this just Playwright locators for the desktop?",
    a: "Deliberately, yes. The API is shaped like Playwright's: desktop.locator(\"role:window\").waitFor(\"visible\", 5000), then chain into it, then act. The difference is the backend. Playwright resolves against the browser DOM. Terminator resolves against the OS accessibility tree (UIAutomation on Windows, AXUIElement on macOS), so the same lazy, re-resolving locator model reaches Notepad, Settings, Office, and native dialogs, not just a browser tab.",
  },
  {
    q: "When is pixel matching actually the right call?",
    a: "When there is no structure to query. A game rendered to a GPU canvas, a remote-desktop viewport that arrives as a single video stream, a Figma or Photoshop document area, a custom-painted chart: the accessibility tree returns one opaque node with the window bounds and nothing inside. There is no role and no name to match on, so a vision or pixel signal is the only thing carrying information. The honest architecture uses a locator wherever the tree has structure and falls back to pixels only on those opaque surfaces.",
  },
  {
    q: "Where can I read the implementation?",
    a: "The Locator type, its wait/validate/wait_for methods, the 100ms poll interval, and the WaitCondition enum are all in crates/terminator/src/locator.rs in github.com/mediar-ai/terminator. The selector grammar, including the spatial relations, is in crates/terminator/src/selector.rs. Runnable examples that build locators and act on them are in the examples folder, for instance examples/notepad.py.",
  },
];

const articleSchemaJson = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: MODIFIED,
  author: "Matthew Diakonov",
  authorUrl: "https://m13v.com",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);

const relatedPosts: RelatedPost[] = [
  {
    title: "Accessibility selectors vs screenshot automation",
    excerpt:
      "The selector grammar in depth: a selector is a query, a screenshot is a guess. Role, name, spatial relations, and boolean composition in one string.",
    href: "/alternative/accessibility-selectors-vs-screenshots",
    tag: "Alternative",
  },
  {
    title: "Accessibility tree vs pixel for computer use: the framing is wrong",
    excerpt:
      "When the tree is empty, pixels carry the signal. How Terminator clusters UIA, DOM, OCR, and vision detections into one prefixed list the model clicks by.",
    href: "/alternative/accessibility-tree-vs-pixel-computer-use",
    tag: "Alternative",
  },
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    excerpt:
      "Why selector-driven trees beat pixel coordinates and OpenCV template matching for production desktop automation.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Guide",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchemaJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaJson) }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-16 sm:px-6">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Alternative / Structural locators vs pixel matching
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Structural locators vs pixel matching for computer use
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            If your agent finds a button by matching a cropped image or replaying a coordinate, you have stored the one property of a UI that is guaranteed to change: how it looked the day you captured it. A structural locator stores something that does not move when the pixels do. This is the difference, with the line of code that makes it real.
          </p>
          <div className="mt-6">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="7 min"
            />
          </div>
        </header>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-22)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            A structural locator addresses a UI element by{" "}
            <strong className="text-zinc-900">what it is</strong>: role, name, and position in the accessibility tree. It re-resolves that query against the live UI every time it acts. Pixel matching addresses an element by{" "}
            <strong className="text-zinc-900">what it looked like</strong>: a captured image or a fixed coordinate, frozen at capture time, which breaks the instant resolution, theme, scale, localization, or layout shifts. For a computer-use agent the locator is deterministic and survives UI change; the pixel match is a one-shot guess against a frame that is already stale. You can read the locator mechanism in{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/locator.rs"
            >
              crates/terminator/src/locator.rs
            </a>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Two definitions, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Strip away the framework names and the two approaches store fundamentally different things. One stores a picture. One stores a question.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500">
                Pixel matching
              </p>
              <p className="mt-3 font-medium text-zinc-900">A photograph</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                A cropped reference image or a recorded coordinate. Resolution is captured at one moment and compared against later screenshots by correlation. When the screen changes, the comparison drifts. The control still works; the picture no longer fits.
              </p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-orange-700">
                Structural locator
              </p>
              <p className="mt-3 font-medium text-zinc-900">A question</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                A query over the accessibility tree:{" "}
                <code className="rounded bg-white px-1 text-orange-700">role:Button|name:Save</code>. It holds no element and no coordinate. It re-asks the tree every time you act, so it answers correctly even after the layout moves.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What each one actually stores, and when it resolves
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The reliability gap is not about accuracy on a static screen. On a frozen screenshot a good template match and a locator both find the button. The gap opens the moment anything between capture and action changes. Toggle between what the two approaches hold in memory.
          </p>
          <BeforeAfter
            title="The artifact you keep between steps"
            before={{
              label: "Pixel template (frozen at capture)",
              content: `# What a pixel matcher keeps
template  = crop of "Save" button, captured at 2x scale, light theme
last_hit  = (412, 238)   # where it matched last run

# Next run, the window opened on a 1x external monitor,
# the user is in dark mode, and the toolbar gained one icon.
match_score = 0.61        # below threshold, or worse:
click(412, 238)           # confident click into empty space`,
              highlights: [
                "stores appearance: a crop and a coordinate",
                "scale, theme, locale, or layout change invalidates it",
                "a bad match still returns a coordinate, so the click lands somewhere wrong",
              ],
            }}
            after={{
              label: "Structural locator (re-resolved at action time)",
              content: `# What a Locator keeps (crates/terminator/src/locator.rs)
struct Locator {
    engine:   Arc<dyn AccessibilityEngine>,
    selector: Selector,   // role:Button|name:Save
    timeout:  Duration,
    root:     Option<UIElement>,
}
// No element. No coordinate. Just the query + a timeout.

# Next run, same changed window:
locator.wait(None)        # re-walks the live tree now
# -> finds Button name=Save regardless of where it moved`,
              highlights: [
                "stores identity: a selector, a timeout, and an optional root",
                "re-walks the live accessibility tree on every action",
                "a miss returns a typed Timeout, never a wrong coordinate",
              ],
            }}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The line that makes it a locator, not a snapshot
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The reason a structural locator is resilient is not a clever matching heuristic. It is that the locator deliberately resolves nothing until you act. Here is the struct, verbatim in spirit from{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">crates/terminator/src/locator.rs</code>:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`// crates/terminator/src/locator.rs
pub struct Locator {
    engine: Arc<dyn AccessibilityEngine>,
    selector: Selector,
    timeout: Duration,        // default for this locator instance
    root: Option<UIElement>,
}

// One-time search by default. Opt into polling by setting a timeout.
const DEFAULT_LOCATOR_TIMEOUT: Duration = Duration::from_secs(0);`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is no field for a found element. Every action method re-runs the query against the live tree:{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">wait()</code>{" "}
            calls the engine&rsquo;s{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">find_element</code>{" "}
            again,{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">all()</code>{" "}
            calls{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">find_elements</code>{" "}
            again, and{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">wait_for()</code>{" "}
            loops on a 100 millisecond poll, re-checking the element against one of four conditions until it holds:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`pub enum WaitCondition {
    Exists,
    Visible,
    Enabled,
    Focused,
}

// wait_for(): poll_interval = Duration::from_millis(100)
// loop: validate() -> check condition -> sleep 100ms -> repeat
// on timeout: AutomationError::Timeout, with the selector in the message`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That is the uncopyable part. A pixel matcher cannot adopt this behavior because it has nothing to re-resolve: its target is a crop, and a crop is just as stale on the second poll as the first. The locator can poll because its target is a description, and the description is still true after the button moves.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What it looks like in code
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The public API is shaped like Playwright, so the lazy-resolution model reads the way you expect. You build a locator, optionally wait for a condition, then act. Each call resolves fresh. This is from{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">examples/notepad.py</code>{" "}
            and the Node test suite:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`# Python: build a locator, resolve it now, act on it
editor   = desktop.open_application("notepad.exe")
add_tab  = await editor.locator("name:Add New Tab").first()
add_tab.click()

document = await editor.locator("role:Document").first()
document.type_text("hello from terminator!")

// Node: wait for a condition before acting
const win = await desktop
  .locator("role:window")
  .waitFor("exists", 5000);   // re-resolves until it exists or 5s passes`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Notice there is no screenshot in that loop and no coordinate anywhere. The agent never says &ldquo;click at (412, 238)&rdquo;. It says &ldquo;find the thing named Save and invoke it,&rdquo; and the framework re-answers that on the spot.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Four numbers that define the behavior
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            These come straight from the source, not a benchmark. They are the dials that govern how a locator resolves.
          </p>
          <MetricsRow metrics={metrics} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The failure mode is the real difference
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both approaches succeed on a clean run. What separates them is what happens when the target is not where it was. A pixel matcher returns its best-correlation coordinate no matter how poor the match, so a missed target becomes a click into empty space that corrupts the next several steps silently. A locator that cannot resolve raises a typed, located error and stops.
          </p>
          <TerminalOutput title="agent loop: same selector, two outcomes" lines={terminalLines} />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The timeout message carries the selector string, so when an agent stalls you know exactly which element it could not find. That is the difference between a five-minute fix and an hour of bisecting a run that drifted three steps after the actual failure.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Where pixel matching still wins
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A structural locator needs structure to query. On surfaces that have none, the locator is the worse tool and you should reach for pixels. A game rendered to a GPU canvas, a remote-desktop viewport delivered as a single video stream, the document area of Figma or Photoshop, a custom-drawn chart: the accessibility tree hands back one opaque node with the window bounds and nothing actionable inside. There is no role and no name to match, so a vision model or a pixel detector is the only thing carrying signal there.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The honest answer is not &ldquo;locators always, pixels never.&rdquo; It is: use a locator wherever the tree has structure, which is the large majority of native and well-built desktop apps, and fall back to pixels only on the opaque surfaces. The mistake the brittle agents make is using pixels everywhere because pixels are the only thing a pure-screenshot loop can see. For how to merge both signals into one tool result when you do need them together, see the{" "}
            <a
              className="text-orange-600 underline"
              href="https://t8r.tech/alternative/accessibility-tree-vs-pixel-computer-use"
            >
              accessibility tree vs pixel
            </a>{" "}
            breakdown.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Building an agent that keeps clicking the wrong place?"
          description="30 minutes. Bring your automation loop, leave with a concrete plan for replacing pixel matches with re-resolving locators where the tree has structure."
        />

        <FaqSection
          heading="Structural locators vs pixel matching: common questions"
          items={faqs}
        />

        <RelatedPostsGrid
          title="Adjacent reads"
          subtitle="Deeper dives into the same stack"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Stop storing coordinates. Book a 30-minute working session on locator-driven automation."
      />
    </article>
  );
}
