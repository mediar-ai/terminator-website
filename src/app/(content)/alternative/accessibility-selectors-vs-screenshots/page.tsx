import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  CodeComparison,
  SequenceDiagram,
  AnimatedChecklist,
  MotionSequence,
  Marquee,
  NumberTicker,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/accessibility-selectors-vs-screenshots";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-15";
const TITLE =
  "Accessibility selectors vs screenshot automation: one is a query, the other is a guess";
const DESCRIPTION =
  "Screenshot automation matches a cropped picture or a pixel coordinate. An accessibility selector is a real query: role, name, spatial relations, boolean composition. Terminator's selector engine parses 25 selector kinds, so you can write 'the button to the right of the Total label' as one string. No screenshot tool can express that.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Why a selector survives a theme change, a DPI scale, and a moved toolbar, and a cropped template image does not. Broken down at the source level.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility selectors vs screenshot automation: query vs guess",
    description:
      "A selector names what an element is. A screenshot records what a pixel region looks like. Here is why that gap decides your automation's reliability.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Accessibility selectors vs screenshot automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "Accessibility selectors vs screenshot automation", url: PAGE_URL },
];

const screenshotCode = `import pyautogui, time

def click_save():
    # the button is identified by a cropped screenshot
    loc = pyautogui.locateOnScreen("save_button.png", confidence=0.9)
    if loc is None:
        # retry once in case the toolbar is still animating
        time.sleep(0.5)
        loc = pyautogui.locateOnScreen("save_button.png", confidence=0.9)
    if loc is None:
        raise RuntimeError("Save button not found on screen")
    pyautogui.click(pyautogui.center(loc))

# save_button.png has to be re-cropped on every theme,
# DPI scale, locale, or toolbar change. There is no query.`;

const selectorCode = `const { Desktop } = require("@mediar-ai/terminator");

async function clickSave() {
  // the button is identified by what it IS in the tree
  const save = await new Desktop()
    .locator("role:Button && name:Save")
    .first(5000);
  await save.click();
}
// survives theme, DPI, locale, and toolbar changes`;

const selectorStrings = [
  "role:Button && name:Save",
  "rightof:name:Username",
  "below:name:OK",
  "has:role:Edit",
  "process:notepad >> role:Edit",
  "!role:Button && visible:true",
  "name:Save || name:Submit",
  "window:Calculator >> role:Button >> name:Seven",
  "near:text:Cancel",
  "nativeid:42",
  "nth:0",
  "..",
];

const sequenceActors = ["Agent", "OS / accessibility API", "Pixels + vision"];

const sequenceMessages: {
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}[] = [
  {
    from: 0,
    to: 1,
    label: "Selector: role:Button && name:Save",
    type: "request",
  },
  { from: 1, to: 0, label: "Element handle + bounds rect", type: "response" },
  { from: 0, to: 0, label: "click() via the OS accessibility action", type: "event" },
  { from: 0, to: 2, label: "Screenshot path: capture the whole window", type: "request" },
  { from: 2, to: 2, label: "OCR or a vision model infers a bounding box", type: "event" },
  { from: 2, to: 0, label: "Best-guess x,y coordinate", type: "response" },
  { from: 0, to: 2, label: "click(x, y) and hope nothing moved", type: "error" },
];

const screenshotFallbackItems = [
  {
    text: "The surface is custom-painted: a game UI, a Figma-style canvas, a chart rendered straight to a bitmap. The accessibility tree exposes one opaque node and there is nothing inside it to select.",
    checked: true,
  },
  {
    text: "You are driving a remote-desktop or VNC stream where only pixels cross the wire and no accessibility tree exists on your side of the connection.",
    checked: true,
  },
  {
    text: "You are testing the visual result itself: layout, spacing, color, a rendering regression. That is exactly what a screenshot is for, and a selector cannot see any of it.",
    checked: true,
  },
  {
    text: "The app is a normal native Windows or macOS program. It almost certainly exposes a tree, so a selector will be faster and will not break the next time someone restyles a button.",
    checked: false,
  },
  {
    text: "You reached for screenshots because the tree 'looked hard to read'. Inspect it once with Accessibility Insights or Accessibility Inspector and the selector usually writes itself.",
    checked: false,
  },
];

const motionFrames = [
  {
    title: "The whole window",
    body: "A single desktop window can expose hundreds of accessibility nodes: every button, field, menu item, and label.",
  },
  {
    title: "role:Button",
    body: "Keep only the nodes whose accessibility role is Button. A few hundred nodes drop to a few dozen.",
  },
  {
    title: "&& name:Save",
    body: "Keep the one whose accessible name is Save. The query has resolved to a single element with a known bounds rect.",
  },
  {
    title: "A screenshot never narrows",
    body: "Template matching gets the whole picture every time, then runs inference to find one region. The selector did the narrowing structurally, for free.",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Are accessibility selectors actually faster than screenshot matching?",
    a: "Yes, and the reason is structural. A selector resolves through accessibility API calls that return an element handle and its bounds rect directly. Screenshot matching first captures a bitmap of the window, then runs template matching or a vision model over that bitmap before it has any coordinate at all. The selector skips both the capture and the inference. For an AI agent the difference is also a model turn: with a selector the agent names the element, with screenshots it spends a turn grounding a coordinate from pixels.",
  },
  {
    q: "Do accessibility selectors break when the UI is restyled?",
    a: "No, and that is the whole point of using them. A selector names an element by its accessibility role and its accessible name, not by pixels. Dark mode, a 150 percent DPI scale, a moved toolbar, a refreshed icon set: none of that changes role:Button && name:Save. A cropped template image breaks on every one of those changes, because the picture it was cropped from no longer matches the screen.",
  },
  {
    q: "What about apps that do not expose an accessibility tree?",
    a: "Some surfaces genuinely do not expose a usable tree: custom-painted canvases, GPU-composited game UIs, remote-desktop pixel streams. There a selector has nothing structural to bind to, and screenshots plus OCR are the correct tool. Terminator keeps OCR and vision detection as a built-in fallback for exactly those cases. The point is not that screenshots are never right, it is that they should be the exception, not the default.",
  },
  {
    q: "Can a screenshot tool target 'the field to the right of the Email label'?",
    a: "Not directly. A screenshot tool matches a template image or a fixed coordinate, so a relationship like 'to the right of' has to be hand-coded as pixel math against a layout you hope never moves. Terminator's selector engine has spatial operators built in: rightof:, leftof:, above:, below:, and near:. You write rightof:name:Email and the resolver computes the geometry from the accessibility tree at runtime.",
  },
  {
    q: "Is this just Playwright?",
    a: "Same idea, wider scope. Playwright's getByRole locators query the browser's accessibility tree, which is why they survive CSS refactors. Terminator applies the same selector model to the operating system accessibility tree, so it reaches every native app, not only web pages. The selector syntax is intentionally shaped like Playwright's: role and name, chaining, :has(), parent navigation.",
  },
  {
    q: "How do I find the role and name to put in a selector?",
    a: "Inspect the live tree once. On Windows use Accessibility Insights, on macOS use Accessibility Inspector. Terminator can also dump a window's tree with getWindowTree. You read the node, copy its role and its accessible name into a selector, and you are done. It is the same workflow as opening dev tools to copy a CSS selector, except the tree is the OS accessibility tree.",
  },
  {
    q: "Does Terminator ever use screenshots?",
    a: "Yes, as a deliberate fallback rather than the default. Selectors resolve first; OCR and vision detection kick in only for surfaces the accessibility tree does not describe. That is the opposite of a screenshot-first tool, which treats the tree as an afterthought and grounds everything from pixels even when a clean structural address was available.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "AX tree vs screenshot for computer use on Mac",
    href: "/alternative/ax-tree-vs-screenshot-computer-use-mac",
    excerpt:
      "On macOS the choice is per-element, not per-task. Three quirks of the Mac accessibility API that flip the decision.",
    tag: "Comparison",
    readTime: "8 min",
  },
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    excerpt:
      "Why PyAutoGUI's pixel matching goes flaky and what a structural tree walk replaces it with.",
    tag: "Comparison",
    readTime: "7 min",
  },
  {
    title: "RPA with accessibility tree selectors",
    href: "/t/rpa-accessibility-tree-selectors",
    excerpt:
      "How selector-driven element lookup replaces brittle coordinate scripts in real RPA workflows.",
    tag: "Guide",
    readTime: "6 min",
  },
];

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleSchema({
              headline: TITLE,
              description: DESCRIPTION,
              url: PAGE_URL,
              datePublished: PUBLISHED,
              dateModified: PUBLISHED,
              author: "Matthew Diakonov",
              authorUrl: "https://m13v.com",
              publisherName: "Terminator",
              publisherUrl: "https://t8r.tech",
              articleType: "TechArticle",
            }),
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

      <div className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Selectors vs screenshots
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Accessibility selectors vs screenshot automation: one is a query,
            the other is a guess
          </h1>
          <p className="mt-4 text-sm text-zinc-500">
            By Matthew Diakonov &middot; Written with AI &middot; Updated May
            15, 2026 &middot; 9 min read
          </p>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600">
            Both approaches end with the same click. They get there in
            completely different ways. A screenshot tool crops a picture of a
            button and hunts for that picture on screen. An accessibility
            selector asks the operating system a structured question and gets
            back the element. That gap is why one of them goes flaky the week
            someone ships a redesign and the other does not.
          </p>
        </header>

        <div className="mt-8 rounded-xl border border-orange-200 bg-orange-50 p-5">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Short answer
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-800">
            Use accessibility selectors whenever the app exposes an
            accessibility tree, which is almost every native Windows and macOS
            application. A selector is a structural query that names what an
            element <em>is</em> (its role, its accessible name, its automation
            id). A screenshot only records what a pixel region <em>looks
            like</em>. Reach for screenshots and OCR only for the surfaces the
            tree genuinely cannot describe: custom-painted canvases,
            GPU-composited game UIs, and remote-desktop pixel streams.
            Terminator is built selector-first for exactly that reason, with
            vision kept as a fallback.
          </p>
        </div>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The same task, both ways
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            Here is &quot;click the Save button&quot; written against a
            screenshot library and against a selector. Look less at the line
            count and more at the comment block at the bottom of each side.
            That is where the real cost lives.
          </p>
          <CodeComparison
            title="Click the Save button"
            leftLabel="Screenshot automation"
            rightLabel="Accessibility selector"
            leftCode={screenshotCode}
            rightCode={selectorCode}
            leftLines={15}
            rightLines={10}
            reductionSuffix="fewer lines, and no template image to maintain"
          />
          <p className="mt-4 leading-relaxed text-zinc-700">
            The screenshot version is not wrong. It works, today, on this
            machine, in this theme, at this resolution. The problem is that
            every one of those qualifiers is load-bearing. The cropped
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              save_button.png
            </code>
            is a snapshot of a moment, and the moment keeps ending. A selector
            is not a snapshot. It is a description that stays true as long as
            the button still exists and is still called Save.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            A selector is a query. A coordinate is not.
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            This is the distinction that most write-ups on the topic skip.
            They land on &quot;accessibility selectors are more stable than
            pixels&quot; and stop, as if a selector were just a sturdier
            string. It is not a string. It is a query, and a screenshot
            approach has no query language at all.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            A screenshot tool gives you two primitives:
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              locateOnScreen(image)
            </code>
            and
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              click(x, y)
            </code>
            . Every other concept you need has to be hand-built on top of
            those. &quot;The third row&quot; becomes pixel arithmetic.
            &quot;The field next to the Email label&quot; becomes a cropped
            region and a hope that the layout never shifts. &quot;A button
            that is visible and not disabled&quot; cannot be expressed at all,
            because a picture does not carry an enabled flag.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            A selector carries all of that as first-class syntax. You can
            compose by role and name, filter by visibility, scope to a
            process, walk to a parent, require a descendant, pick the nth
            match, and combine clauses with boolean operators. The accessibility
            tree already knows what every node is; the selector engine just
            lets you ask.
          </p>

          <p className="mt-8 mb-3 text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">
            Real selector strings Terminator parses
          </p>
          <Marquee speed={32} pauseOnHover fade>
            {selectorStrings.map((s) => (
              <code
                key={s}
                className="mx-2 inline-block rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-800"
              >
                {s}
              </code>
            ))}
          </Marquee>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            <NumberTicker value={25} /> ways to name an element, zero ways to
            name a pixel
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            This is the part you can check yourself. Terminator&apos;s selector
            engine lives in
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              crates/terminator/src/selector.rs
            </code>
            . The
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
              Selector
            </code>
            enum at the top of that file defines 25 variants. They group into
            five kinds of question you can ask about an element:
          </p>
          <ul className="mt-5 space-y-3 text-zinc-700">
            <li className="leading-relaxed">
              <span className="font-semibold text-zinc-900">Identity.</span>{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                role:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                name:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                id:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                nativeid:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                classname:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                text:
              </code>
              . What the element is and what it is called.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-zinc-900">Spatial.</span>{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                rightof:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                leftof:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                above:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                below:
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                near:
              </code>
              . An element described by its position relative to another
              element, computed from the tree at runtime.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-zinc-900">Structure.</span>{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                has:
              </code>{" "}
              (a Playwright-style descendant requirement),{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                ..
              </code>{" "}
              (parent navigation),{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                &gt;&gt;
              </code>{" "}
              (chain through the hierarchy), and{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                nth:
              </code>{" "}
              for ordinal selection.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-zinc-900">Filters.</span>{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                visible:
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                process:
              </code>
              . State and scope a picture cannot record.
            </li>
            <li className="leading-relaxed">
              <span className="font-semibold text-zinc-900">Boolean.</span>{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                &amp;&amp;
              </code>
              ,{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                ||
              </code>
              , and{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                !
              </code>
              , with parentheses. The test file{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                boolean_selector_tests.rs
              </code>{" "}
              exercises real expressions like{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                (role:button &amp;&amp; name:Submit) || (role:link &amp;&amp;
                name:Cancel)
              </code>{" "}
              and{" "}
              <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
                !role:button &amp;&amp; visible:true
              </code>
              .
            </li>
          </ul>
          <p className="mt-5 leading-relaxed text-zinc-700">
            Now count the equivalents on the screenshot side. A template-match
            library exposes one way to name a target: a cropped image. A
            vision model adds one more: a natural-language description that it
            grounds into a bounding box. Neither is composable. You cannot AND
            two template images. You cannot ask a picture for the element to
            the left of another element without writing the geometry yourself.
            The asymmetry is not a matter of polish. One side is a language and
            the other side is a pair of primitives.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Watch one selector narrow the tree
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            A selector resolves by progressively filtering nodes. Each clause
            shrinks the candidate set until one element is left. A screenshot
            never narrows: it carries the whole window into every match
            attempt.
          </p>
          <div className="mt-6">
            <MotionSequence
              title="role:Button && name:Save resolving"
              frames={motionFrames}
              defaultDuration={2600}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            How each side resolves one click
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            The two paths below do not just differ in reliability. They differ
            in how many moving parts sit between &quot;I want to click
            Save&quot; and an actual click. The selector path is one request
            and one response. The screenshot path adds a capture, an inference
            step, and a coordinate that is only ever a best guess.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="Selector resolution vs screenshot resolution"
              actors={sequenceActors}
              messages={sequenceMessages}
            />
          </div>
          <p className="mt-5 leading-relaxed text-zinc-700">
            The red step at the end of the screenshot path is the one that
            bites. Once you have a coordinate, you have committed to it. If the
            window scrolled, if a notification pushed the layout down, if the
            inference was off by twelve pixels, the click lands on the wrong
            thing and the script keeps going as if it succeeded. The selector
            path never produces a loose coordinate to be wrong about: it hands
            you an element, and the click goes through the operating
            system&apos;s own accessibility action for that element.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Where a screenshot is still the right call
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            Selector-first does not mean selector-only. There are real
            surfaces where the accessibility tree has nothing useful in it, and
            on those surfaces a screenshot plus OCR or a vision model is the
            honest answer. The mistake is using screenshots as the default and
            falling back to selectors, instead of the other way around.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="Screenshot fallback: yes for the first three, no for the last two"
              items={screenshotFallbackItems}
            />
          </div>
          <p className="mt-5 leading-relaxed text-zinc-700">
            The dividing line is whether the element exists in the tree at all.
            A button in a normal AppKit, WinUI, WPF, or WinForms app has a
            node with a role and a name. A button drawn by a game engine onto a
            Metal or Direct3D surface does not: the whole window is one opaque
            node. The first is a selector&apos;s job. The second is genuinely a
            screenshot&apos;s job. Confusing the two, in either direction, is
            where automations go brittle.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            How Terminator draws that line
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-700">
            Terminator is a desktop automation framework with an API shaped
            like Playwright, except it targets the whole operating system
            instead of just the browser. It drives apps through the native
            accessibility APIs: UI Automation on Windows, the Accessibility API
            on macOS. Element lookup is selector-first by default, which is why
            the selector engine in{" "}
            <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
              selector.rs
            </code>{" "}
            is as expressive as it is. OCR and vision detection ship in the
            box, but they are the fallback for surfaces the tree cannot
            describe, not the primary mechanism.
          </p>
          <p className="mt-4 leading-relaxed text-zinc-700">
            It is a developer framework, not a consumer app. You pull in the
            Rust crate{" "}
            <code className="rounded bg-zinc-100 px-1 text-sm text-zinc-800">
              terminator-rs
            </code>
            , the Python bindings, or the Node package, or you wire the MCP
            server into Claude Code, Cursor, or VS Code so an AI assistant can
            drive real desktop apps as a tool. Whichever entry point you pick,
            the selector is the unit of work, and the selector is a query. The
            full prefix list is documented in the selector cheat sheet in the{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
            >
              open-source repository
            </a>
            , and the core crate is published as{" "}
            <a
              href="https://crates.io/crates/terminator-rs"
              className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
            >
              terminator-rs on crates.io
            </a>
            .
          </p>
        </section>

        <div className="mt-14">
          <BookCallCTA
            appearance="footer"
            destination={BOOKING_URL}
            site="Terminator"
            heading="Porting a screenshot-based automation off pixel coordinates?"
            description="30 minutes. Bring the flakiest part of your script and we will work out which elements are clean selector targets and which genuinely need vision."
          />
        </div>

        <section className="mt-14">
          <FaqSection
            heading="Accessibility selectors vs screenshot automation: common questions"
            items={faqs}
          />
        </section>

        <div className="mt-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Deeper dives into the same trade-off"
            posts={relatedPosts}
          />
        </div>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Selectors over screenshots: book a 30-minute working session."
      />
    </article>
  );
}
