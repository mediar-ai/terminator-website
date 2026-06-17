import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  ProofBanner,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/why-accessibility-apis-beat-ocr-and-pixel-matching";
const PUBLISHED = "2026-05-17";
const TITLE =
  "Why accessibility APIs beat OCR and pixel matching for OS-level automation";
const DESCRIPTION =
  "OCR and pixel matching identify a button by what it looks like to the camera. Accessibility APIs identify it by what the developer named it in code. The three places this matters most are latency, stability, and i18n. Terminator's Windows OCR engine is created via TryCreateFromUserProfileLanguages at engine.rs:763, which means OCR is literally bound to whichever language packs are installed on the user's machine. role:Button && id:save_btn does not care which language Windows is in.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Accessibility APIs use semantic identity set by the app developer. OCR and pixel matching use what the camera saw. The gap is largest on i18n: Windows OCR loads only the user's installed language packs, while AutomationId is the same in every locale.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Why accessibility APIs beat OCR and pixel matching, in three numbers",
    description:
      "Latency: one COM call vs a screen capture plus ML inference. Stability: AutomationId survives, pixels do not. i18n: WinOcrEngine::TryCreateFromUserProfileLanguages binds OCR to installed locales; role:Button does not.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  {
    label: "Why accessibility APIs beat OCR and pixel matching",
  },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Why accessibility APIs beat OCR and pixel matching", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is the literal difference between an accessibility API and OCR or pixel matching?",
    a: "An accessibility API reads a tree of UI elements that the app developer (and the OS framework) populated with semantic identity: role, AutomationId, class name, accessible label, bounding rectangle. OCR reads pixels and runs an ML model to guess what text those pixels represent. Pixel matching takes a reference screenshot and looks for a region of the current screen that matches it pixel-for-pixel within some tolerance. The accessibility API answer is symbolic data the app emitted on purpose. The OCR and pixel matching answers are reconstructions of intent from pixels the OS happened to render at a moment in time. When the rendering changes (DPI, theme, locale, anti-aliasing, scrollbar widths, font substitution) the reconstruction can drift while the symbolic answer stays put.",
  },
  {
    q: "Is the latency advantage really that big?",
    a: "Yes, and the reason is structural, not a benchmark trick. Pattern invocation through UIA on Windows is one COM call into the accessibility runtime that is already loaded into both processes. There is no screen capture, no buffer conversion, no inference. The OCR path on Windows is at minimum: lock the framebuffer, copy pixels out, convert RGBA to BGRA (Terminator does this at engine.rs:734), wrap it in a SoftwareBitmap, hand it to the Windows.Media.Ocr engine, await async recognition, walk the returned lines and words, then still have to compute screen coordinates and call SendInput to actually click. Terminator's own llms.txt at line 243 frames the result as CPU speed instead of LLM inference. The exact multiplier varies by app, but the ceiling for OCR is set by inference time, not by your CPU.",
  },
  {
    q: "What is the i18n problem with OCR exactly?",
    a: "OS-level OCR engines like Windows.Media.Ocr ship language packs separately from the engine. Terminator constructs its OCR engine at crates/terminator/src/platforms/windows/engine.rs line 763 with WinOcrEngine::TryCreateFromUserProfileLanguages(), which Microsoft documents as falling back to whichever languages are installed in the user's profile. An English-only Windows install pointed at a Japanese app produces garbage hiragana-to-ASCII transliteration, an English-and-German install pointed at a Korean app produces nothing usable, and your automation breaks the moment a customer in a different locale runs it. Accessibility APIs sidestep this entirely. AutomationId is set by the app developer in source code, in ASCII, once. It does not change when the OS display language changes. role:Button is a UIA enum value, not a translated string. Your selector role:Button && id:save_btn resolves the same element on en-US, ja-JP, ko-KR, and ar-EG without any per-locale work.",
  },
  {
    q: "What about LocalizedControlType? Doesn't that mean the accessibility tree is also localized?",
    a: "Two properties, one of them is and one of them is not. Terminator handles both at crates/terminator/src/platforms/windows/utils.rs lines 165 to 175. ControlType is an enum (Button, Edit, CheckBox) and is locale-independent. LocalizedControlType is the human-readable string Narrator reads out loud (in English: 'button'; in German: 'Schaltfläche') and is locale-dependent. The lesson is to write selectors against ControlType and AutomationId, never against LocalizedControlType or the user-facing Name. Terminator's role: prefix maps to ControlType, and id: maps to AutomationId. If you find yourself selecting on name:Save you have implicitly opted in to localization risk, and Terminator's docs are explicit about that.",
  },
  {
    q: "When should I actually reach for OCR or pixel matching?",
    a: "When the target does not expose a tree. Three honest cases: a fullscreen game or a 3D modeller rendered through DirectX or OpenGL where the only surface on screen is a frame buffer; a remote desktop or VM viewer where the accessibility bridge does not cross the host boundary; a canvas-based design tool where each hit region lives inside one accessibility node. Terminator ships OCR for exactly this fallback role: the Windows engine surfaces ocr_screenshot_with_bounds at engine.rs:720 returning a tree of OCR lines and words in absolute screen coordinates, but the selector grammar still prefers role:, id:, classname:, and nativeid: when they resolve. The framework's own llms.txt at line 9 puts it as 'no pixel-based automation or image matching by default, though OCR and vision AI are available as supplementary detection methods'. Default is structured; OCR is the escape hatch.",
  },
  {
    q: "Does this also apply to web apps inside Electron or WebView2?",
    a: "Yes, with one caveat. Electron and WebView2 expose their DOM as an accessibility tree through Chromium's accessibility layer, so role: and id: selectors work just like in a native app. The caveat is that AXPress and AXClick on macOS Chrome and Safari sometimes silently no-op, which is why a production AX engine maintains a hardcoded fallback list for those apps and synthesizes input instead. Terminator's locator grammar is the same across native Win32, WPF, UWP, Cocoa, Electron, and WebView2 surfaces, and the framework decides at runtime whether to fire a UIA pattern or fall back to SendInput. Either way, you do not reach for OCR or pixel matching by default.",
  },
  {
    q: "Why is pixel matching so brittle, beyond the obvious DPI argument?",
    a: "DPI is the headline, but five other shifts also break pixel matching. Subpixel anti-aliasing settings (ClearType on Windows, font smoothing on macOS) re-render the same character at the same size into slightly different pixels per machine. Theme changes (light vs dark, accent color) repaint every button. Font substitution silently swaps a font you don't have for a near-match with different glyph widths. Scrollbar widths differ between OS versions and accessibility settings, pushing every element a few pixels. And animation: pixel matching against an element mid-animation matches the wrong frame. Every one of those moves the pixel coordinates of a button. None of them move its AutomationId or its UIA tree position.",
  },
  {
    q: "What does Terminator give me to enforce this discipline in code?",
    a: "Selectors with explicit prefixes. role:Button binds to UIA ControlType. id:save_btn binds to AutomationId. nativeid: binds to the OS-specific identifier (AutomationId on Windows, AXIdentifier on macOS). classname: binds to ClassName. Combinators &&, ||, !, and >> let you compose those. The pos:x,y selector exists but is documented as 'last resort'. There is no name-localized: selector, by design. If you want to type-check at the locator layer, write your locators as constants and reuse them, and lint for any selector that begins with name: or text: because those are the two strings most likely to be localized. The full grammar is in docs/SELECTORS_CHEATSHEET.md in the Terminator repo.",
  },
];

const relatedPosts = [
  {
    title:
      "macOS accessibility UI tree automation: the write path nobody warns you about",
    href: "/t/macos-accessibility-ui-tree",
    excerpt:
      "The read path is easy: AXUIElementCopyAttributeValue walks the tree. The write path is the trap on browser-rendered views.",
    tag: "Deep dive",
    readTime: "8 min read",
  },
  {
    title:
      "Accessibility API desktop automation: fire Control Patterns, skip the mouse",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "UIA ships Control Patterns (Invoke, Toggle, ExpandCollapse, Value) that act on elements without moving the cursor. Read the line numbers.",
    tag: "Reference",
    readTime: "7 min read",
  },
  {
    title:
      "RPA accessibility tree selectors: the actual grammar, with operator precedence",
    href: "/t/rpa-accessibility-tree-selectors",
    excerpt:
      "Most RPA selectors are brittle XML window paths. Terminator parses selectors as a boolean grammar with real operator precedence.",
    tag: "Reference",
    readTime: "8 min read",
  },
];

export default function Page() {
  const articleLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqLd = faqPageSchema(faqs);

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10 pb-24 text-zinc-700">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6 mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Three axes
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
            Why accessibility APIs beat OCR and pixel matching for OS-level automation
          </h1>
          <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
            OCR and pixel matching identify a button by what it looks like to
            the camera. Accessibility APIs identify it by what the developer
            named it in code. That gap shows up in three places: latency,
            stability, and i18n. The third one is the one no other writeup on
            this topic mentions.
          </p>
        </header>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />

        <section className="mt-10 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
            Direct answer (verified 2026-05-17)
          </p>
          <p className="mt-3 text-zinc-800 leading-relaxed">
            Accessibility APIs identify UI elements by semantic identity set in
            app code (role plus AutomationId plus class name) instead of by
            pixel patterns the OS happened to render. The practical
            consequences:
          </p>
          <ul className="mt-4 space-y-2 text-zinc-800 list-disc pl-5">
            <li>
              <strong>Latency.</strong> One COM call into the UIA runtime that
              is already loaded in both processes, vs a full screen capture
              plus ML inference plus coordinate math plus synthetic input.
            </li>
            <li>
              <strong>Stability.</strong> AutomationId is set once in the
              app&apos;s source. DPI changes, theme changes, font substitution,
              and animation frames do not move it. Pixel coordinates move on
              every one of those.
            </li>
            <li>
              <strong>i18n.</strong> The role enum and AutomationId are the
              same in every locale. Windows OCR (Windows.Media.Ocr) is bound
              to whichever language packs are installed on the user&apos;s
              machine, via{" "}
              <code className="rounded bg-orange-100 px-1.5 py-0.5 font-mono text-[0.85em] text-orange-800">
                OcrEngine.TryCreateFromUserProfileLanguages()
              </code>
              . Switch the customer&apos;s Windows display language, and OCR
              breaks; accessibility selectors do not.
            </li>
          </ul>
          <p className="mt-4 text-sm text-zinc-600">
            Authoritative source for the OCR-locale behavior:{" "}
            <a
              className="text-orange-700 underline underline-offset-2"
              href="https://learn.microsoft.com/en-us/uwp/api/windows.media.ocr.ocrengine.trycreatefromuserprofilelanguages"
              target="_blank"
              rel="noopener noreferrer"
            >
              Microsoft docs for OcrEngine.TryCreateFromUserProfileLanguages
            </a>
            .
          </p>
        </section>

        <MetricsRow
          metrics={[
            { value: 1, suffix: " call", label: "UIA pattern invocation" },
            { value: 17, label: "UIElementAttributes fields" },
            { value: 100, suffix: "x", label: "Terminator's own framing of structured-vs-screenshot agents" },
            { value: 0, suffix: " locales", label: "OCR works in without installed language packs" },
          ]}
        />

        <section className="mt-14">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Axis 1 of 3
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
            Latency: one COM call vs a pipeline of screen capture, inference, and synthetic input
          </h2>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            Calling invoke() on a UIA element resolves to a single COM call
            into the IUIAutomationInvokePattern proxy that is already loaded
            inside the target process. The runtime returns when the target
            acknowledges. There is no frame buffer involved, no pixel math,
            no synthetic input event posted to the OS message queue.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The OCR path has a strict minimum number of stages, and you pay
            all of them on every click. Terminator&apos;s own implementation
            of the Windows OCR path is the cleanest evidence: it lives in{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              crates/terminator/src/platforms/windows/engine.rs
            </code>{" "}
            starting at line 720, and the stages are visible in the source.
          </p>

          <SequenceDiagram
            title="What OCR-then-click actually executes"
            actors={["caller", "OS", "OCR engine", "target app"]}
            messages={[
              { from: 0, to: 1, label: "screenshot the window", type: "request" },
              { from: 1, to: 0, label: "RGBA framebuffer", type: "response" },
              { from: 0, to: 0, label: "RGBA → BGRA convert (engine.rs:734)", type: "event" },
              { from: 0, to: 2, label: "RecognizeAsync(SoftwareBitmap)", type: "request" },
              { from: 2, to: 0, label: "OcrResult: lines + words + bounds", type: "response" },
              { from: 0, to: 0, label: "match text → pick a word → click point", type: "event" },
              { from: 0, to: 1, label: "SendInput (move + down + up)", type: "request" },
              { from: 1, to: 3, label: "WM_LBUTTONDOWN / WM_LBUTTONUP", type: "event" },
            ]}
          />

          <p className="mt-4 text-zinc-700 leading-relaxed">
            The UIA-pattern alternative collapses every one of those stages
            into a single message: caller calls{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              invoke_pat.invoke()
            </code>
            , target app acknowledges. Terminator&apos;s llms.txt at line 243
            frames the resulting performance gap as &quot;100x faster (CPU
            speed, not LLM inference)&quot; specifically against
            screenshot-based agents like ChatGPT Agents, Claude computer use,
            and BrowserUse. The multiplier is not the point. The shape of the
            cost curve is: pattern invocation is bounded by CPU, OCR-then-click
            is bounded by whatever ML model is doing the recognition.
          </p>
        </section>

        <section className="mt-14">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Axis 2 of 3
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
            Stability: AutomationId is set once in source, pixels are reconstructed every render
          </h2>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            The standard argument for accessibility-API stability stops at
            DPI: if the user drags the window to a 4K monitor, an (x, y)
            click misses but a tree path does not. That argument is correct
            and undersold. There are at least five other shifts that move
            pixels without moving identity, and any one of them is enough to
            break a pixel-matched script:
          </p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-zinc-700">
            <li>
              <strong>Subpixel anti-aliasing.</strong> ClearType on Windows,
              font smoothing on macOS. The same character at the same size
              renders to different pixels on different machines.
            </li>
            <li>
              <strong>Theme changes.</strong> Light vs dark, custom accent
              color, high-contrast mode. Every button repaints.
            </li>
            <li>
              <strong>Font substitution.</strong> If the user does not have
              the requested font installed, the OS picks a near-match with
              different glyph widths. The button is now five pixels wider.
            </li>
            <li>
              <strong>Scrollbar width and chrome.</strong> Different OS
              versions, different accessibility settings, different per-app
              window-decoration policies all push the content area by a few
              pixels.
            </li>
            <li>
              <strong>Animation.</strong> Pixel matching mid-fade matches the
              wrong frame. Half the time the script clicks too early; the
              other half it clicks the wrong place.
            </li>
          </ul>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of those shifts move AutomationId, ControlType, or the
            element&apos;s position in the UIA tree. The selector{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              role:Button &amp;&amp; id:save_btn
            </code>{" "}
            resolves the same element on a 1080p ClearType light-theme box
            with Segoe UI 9pt as it does on a 4K dark-theme box with a Segoe
            UI substitute at 11pt mid-fade-in. That is the entire stability
            story.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The two failure modes that do break an accessibility selector are
            both honest: the developer renamed the control&apos;s AutomationId
            (which shows up as a typed ElementNotFoundError, not a
            silent-wrong-click), or the control is a custom-drawn widget that
            never implemented a UIA provider (in which case the tree is
            single-node and you legitimately need the OCR fallback below).
          </p>
        </section>

        <section className="mt-14">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-600">
            Axis 3 of 3 — the one nobody covers
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-zinc-900">
            i18n: your OCR is pinned to the user&apos;s installed language packs
          </h2>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            This is the axis the existing guides on accessibility-vs-OCR all
            miss. Pull up Terminator&apos;s Windows OCR engine creation:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800 font-mono">
{`// crates/terminator/src/platforms/windows/engine.rs:763
let ocr_engine = WinOcrEngine::TryCreateFromUserProfileLanguages()
    .map_err(|e| {
        AutomationError::PlatformError(
            format!("Failed to create Windows OCR engine: {e}"),
        )
    })?;`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That single Microsoft API call,{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              Windows.Media.Ocr.OcrEngine.TryCreateFromUserProfileLanguages()
            </code>
            , decides which languages your automation can read. The
            documentation is explicit: it iterates the language profiles
            installed in the user&apos;s settings and tries to build an OCR
            engine that supports them. If none of the installed languages are
            supported by the OCR runtime, it returns null and Terminator
            raises a PlatformError. There is no graceful fallback. There is
            no auto-download. The user&apos;s machine is the source of truth
            for which scripts are even readable.
          </p>

          <BeforeAfter
            title="One automation, two locales"
            before={{
              label: "OCR-based selector",
              content:
                "OCR script targeting a Save button by reading pixels. Selector logic: screenshot the window, OCR-detect the word 'Save', click its center.",
              highlights: [
                "Works on en-US Windows with English OCR installed",
                "Returns garbage on ja-JP Windows: the button now reads 保存",
                "Returns garbage on de-DE Windows: the button now reads Speichern",
                "Works on no locale that does not have an English OCR pack installed",
              ],
            }}
            after={{
              label: "Accessibility selector",
              content:
                "role:Button && id:save_btn. The developer set id='save_btn' in the app's XAML or storyboard. The OS never translates AutomationId.",
              highlights: [
                "Works on en-US Windows",
                "Works on ja-JP Windows, same id",
                "Works on de-DE Windows, same id",
                "Works on ar-EG Windows with RTL layout, same id",
              ],
            }}
          />

          <p className="mt-6 text-zinc-700 leading-relaxed">
            The trap people fall into is selecting on the visible text
            instead. Terminator exposes a{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              name:
            </code>{" "}
            selector that matches the accessible name, and a{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              text:
            </code>{" "}
            selector that matches visible text. Both of those are translated.
            So is{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              LocalizedControlType
            </code>
            , the property Narrator reads aloud (&quot;button&quot; in
            English, &quot;Schaltfläche&quot; in German). Terminator&apos;s
            property mapping at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              crates/terminator/src/platforms/windows/utils.rs
            </code>{" "}
            lines 165 to 175 keeps LocalizedControlType and the
            locale-independent ControlType as separate fields specifically so
            you can choose which one your selector hits.
          </p>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            The discipline that survives locale flips is simple: write
            selectors against{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              role:
            </code>{" "}
            (UIA ControlType enum, never translated) and{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              id:
            </code>{" "}
            (AutomationId, set once in source). Treat{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              name:
            </code>{" "}
            and{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              text:
            </code>{" "}
            as last resorts, only when the app developer did not give you an
            AutomationId. If your selector grammar starts with a string the
            user can see in their language, you have implicitly opted in to
            localization risk.
          </p>
        </section>

        <ProofBanner
          quote="No pixel-based automation or image matching by default, though OCR and vision AI are available as supplementary detection methods."
          source="terminator/llms.txt:9"
          metric="default: structured, fallback: pixels"
        />

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            When OCR and pixel matching are actually the right call
          </h2>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            None of the above means OCR is wrong. It means OCR is a fallback,
            not a default. Three honest cases where you reach for it:
          </p>
          <ol className="mt-4 space-y-3 list-decimal pl-5 text-zinc-700">
            <li>
              <strong>The target renders through a frame buffer.</strong> A
              fullscreen game on DirectX or OpenGL, a 3D modeller, a custom
              CAD canvas. The window is one accessibility node and pixels are
              the only addressable thing.
            </li>
            <li>
              <strong>The accessibility bridge does not cross the host
              boundary.</strong> A remote desktop session, a VM viewer, or a
              Citrix-streamed app. The host machine sees a single video
              surface where the guest&apos;s tree should be.
            </li>
            <li>
              <strong>The app embeds a HTML5 canvas or WebGL surface for its
              real UI.</strong> Figma&apos;s drawing surface, a browser-based
              game engine, a canvas-backed data grid. Each tool&apos;s hit
              region lives inside one canvas element with no children.
            </li>
          </ol>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator ships exactly that fallback. The{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
              ocr_screenshot_with_bounds
            </code>{" "}
            method at engine.rs:720 returns a tree of OCR-detected lines and
            words with bounding rectangles in absolute screen coordinates,
            which you can feed back into the same selector grammar. The right
            mental model is: try the tree, and only if the tree is empty fall
            through to OCR. That order is the difference between a flaky
            script and a deterministic one.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What Terminator actually does
          </h2>
          <p className="mt-5 text-zinc-700 leading-relaxed">
            Terminator is an open source desktop automation framework for
            Windows and macOS. The selector grammar is intentionally shaped
            like Playwright, but the targets are the whole OS. It exposes:
          </p>
          <ul className="mt-4 space-y-2 list-disc pl-5 text-zinc-700">
            <li>
              A Rust core at{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
                terminator-rs
              </code>{" "}
              on crates.io with Windows UIA and macOS AX adapters.
            </li>
            <li>
              Node.js bindings at{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
                @mediar-ai/terminator
              </code>{" "}
              via NAPI-RS.
            </li>
            <li>
              Python bindings at{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
                terminator-py
              </code>{" "}
              via PyO3.
            </li>
            <li>
              An MCP server at{" "}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.9em] text-zinc-800">
                npx -y terminator-mcp-agent@latest
              </code>{" "}
              that exposes desktop control to Claude Code, Cursor, VS Code,
              and Windsurf as MCP tools.
            </li>
          </ul>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The source is at{" "}
            <a
              className="text-orange-600 underline underline-offset-2"
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/mediar-ai/terminator
            </a>
            , MIT licensed. The line numbers cited in this guide are from the
            current main branch as of 2026-05-17. If the file moves between
            then and the time you read this, the structure of the argument
            still holds: structured selectors win on latency, stability, and
            i18n; OCR is the escape hatch when the tree is empty.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Stuck on a flaky desktop test that survives the demo and breaks in prod?"
          description="20 minutes with the team. Bring a screenshot of the selector that's failing, leave with a UIA-tree-grounded replacement."
        />

        <FaqSection items={faqs} />

        <RelatedPostsGrid
          subtitle="Related"
          title="Other deep dives on the accessibility-tree approach"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="20 min with the team on your selector grammar."
      />
    </article>
  );
}
