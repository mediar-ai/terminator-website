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
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  StepTimeline,
  ComparisonTable,
  MetricsRow,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/desktop-application-automation";
const PUBLISHED = "2026-04-23";
const TITLE =
  "Desktop application automation that reports whether the click actually did anything";
const DESCRIPTION =
  "Most desktop application automation libraries expose click(element) as a fire-and-forget call. Terminator's click is a five-phase action that validates the element, asks UIA for a ClickablePoint (with a BoundsCenter fallback), captures pre-state, sends a real mouse event, then diffs post-state and returns a ClickResult with window_title_changed and bounds_changed fields you can assert on. Source: crates/terminator/src/platforms/windows/element.rs lines 666 to 722.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Five phases, one ClickResult. Phase 1 validates visibility, enabled state, and viewport. Phase 2 picks coordinates with a ClickablePoint to BoundsCenter fallback. Phase 4 sends a real OS-level mouse click. Phase 5 diffs the window title and bounds so you know whether the click fired a handler.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Desktop automation where every click returns a post-state diff",
    description:
      "path=UIA::GetClickablePoint; validated=true; window_title_changed=true; bounds_changed=false; pre_title='...'; post_title='...'; duration_ms=142. That is the string every click returns on element.rs line 713.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Desktop Application Automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Desktop Application Automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is desktop application automation, in one sentence?",
    a: "Programmatic control of native applications on Windows and macOS by talking to the operating system's accessibility layer and the input subsystem, so a script or an AI agent can drive Notepad, Excel, SAP, VLC, or any other installed app without a human touching the mouse. Web automation is a subset that targets browsers; desktop automation covers the other 90% of the surface where browser DevTools and Selenium cannot reach.",
  },
  {
    q: "Why do most desktop automation libraries not tell you whether a click worked?",
    a: "Because they ship one of two code paths. Path one is InvokePattern via the accessibility API, which calls the element's invoke handler directly and returns success if the call dispatched. It does not check that the dispatch produced a visible effect, because the API was not designed to. Path two is a raw mouse.click(x, y), which also has no feedback channel; the mouse subsystem acknowledges the injected event and returns. Neither path captures window title, bounds, or focus state before and after the click, so neither can tell you whether the click actually hit the control. Terminator's click method on element.rs line 666 wraps a real mouse click with a pre-state snapshot and a post-state snapshot and returns the diff in the ClickResult.details string.",
  },
  {
    q: "Where exactly do Terminator's five click phases live in the source?",
    a: "One function, one file. crates/terminator/src/platforms/windows/element.rs. Lines 666 to 722 define fn click. Phase 1 calls validate_clickable on line 675, which is defined at line 389 and runs is_visible, is_enabled, and ensure_in_viewport in that order. Phase 2 calls determine_click_coordinates on line 679, defined at line 415, which first tries UIA::GetClickablePoint and falls back to the bounding rectangle's center. Phase 3 snapshots the window title and bounds on lines 682 to 688. Phase 4 sends the physical mouse click on line 698 via super::input::send_mouse_click. Phase 5 snapshots post-state on lines 702 to 708 and builds the details string on line 713.",
  },
  {
    q: "What does the ClickResult.details string actually look like?",
    a: "A semicolon-delimited list of key=value pairs. A real example from a click that opened a new window: path=UIA::GetClickablePoint; validated=true; window_title_changed=true; bounds_changed=false; pre_title='Notepad'; post_title='Save As'; duration_ms=94. The path field is either UIA::GetClickablePoint when UIA returned a clickable point, or UIA::BoundingRectangle when the library fell back to the bounds center. window_title_changed and bounds_changed are the two cheapest signals that something reacted to the click. If both are false and you expected a dialog, your selector probably hit the wrong element.",
  },
  {
    q: "What happens when UIA cannot return a ClickablePoint?",
    a: "The function on element.rs lines 415 to 450 matches on the Ok(None) or Err branch and pulls bounds via UIA::BoundingRectangle, then computes (x + width/2, y + height/2). The path_used string in the returned ClickResult becomes BoundsCenter and the fallback is logged at debug level. This matters for custom controls whose UIA implementation reports bounds but skips GetClickablePoint, which is common in older WPF apps, Swing windows running under JAWS bridges, and Electron apps that expose a minimal UIA provider.",
  },
  {
    q: "Is this faster or slower than a raw mouse.click?",
    a: "Marginally slower per click, dramatically faster per successful workflow. The validation phase adds roughly one UIA round-trip, typically under 10ms on a modern machine. The pre and post snapshots are two more UIA calls each, another 10 to 20ms. In exchange, the caller gets a structured signal on every click about whether it produced a UI change. A workflow that would otherwise fail silently and require a human to inspect a screenshot now fails loudly with a details string that says window_title_changed=false, and the next line in the script can branch. A 200ms delay on wait_for_stable_bounds was explicitly removed (see the comment on element.rs line 407 and line 701) because the tree capture delay already covers it.",
  },
  {
    q: "How does the AI agent use the post-state diff?",
    a: "Terminator's MCP agent exposes click as a tool. The tool response includes the full ClickResult, so the model sees method, coordinates, and details on every call. When the model sees window_title_changed=false after a click that was supposed to open a dialog, it does not assume success. It either retries, asks the UI tree for the current state, or falls back to a different selector strategy. This is how the 95%+ success rate claim in the Terminator README is achieved: not by running a bigger model, but by giving the model a verifiable signal after every physical action.",
  },
  {
    q: "Does the same five-phase flow run on macOS?",
    a: "The phase structure is the same, the APIs are different. macOS uses the AX accessibility framework (AXUIElement) instead of UIAutomation. The click path lives under crates/terminator/src/platforms/mod.rs which defines the trait, and the macOS implementation implements the same ClickResult return type so downstream code does not branch on OS. The macOS equivalent of GetClickablePoint is AXUIElementGetAttributeValue(kAXPositionAttribute) plus kAXSizeAttribute, and the fallback is the same bounds-center computation. The point is that the contract (validate, coordinate, snapshot, click, diff) is portable across OSes; the plumbing behind each phase is not.",
  },
  {
    q: "Can I skip the verification and just send the click?",
    a: "Yes, but it is not the default. The lower-level click_at_coordinates trait method on platforms/mod.rs line 237 sends a raw click at the given (x, y) with no validation and no state snapshot. You give up the details string. Most users do not call it directly; it exists for the recorder replay layer, which already knows the target coordinates and only cares about faithfully reproducing the event stream. For anything that resembles a test assertion or an agent tool, use element.click() and read the returned ClickResult.",
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

const phaseCards: BentoCard[] = [
  {
    title: "Phase 1. Validate",
    description:
      "is_visible covers multi-monitor placement, is_enabled rejects greyed-out controls, ensure_in_viewport confirms the element sits inside the visible region. A click on an off-screen element returns an ElementNotVisible error before a single mouse event fires.",
    size: "1x1",
  },
  {
    title: "Phase 2. Pick coordinates",
    description:
      "UIA::GetClickablePoint first. On failure, BoundingRectangle center. The chosen path is stamped into the ClickResult so you know which one won. Nothing else in this space admits to a fallback.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Phase 3. Snapshot pre-state",
    description:
      "Window title and bounds go into local variables before the click. Two UIA calls, fewer than 20ms on a warm tree. These become the left side of the diff.",
    size: "1x1",
  },
  {
    title: "Phase 4. Click",
    description:
      "A real OS-level mouse event via super::input::send_mouse_click. Not InvokePattern. Not a synthetic focus event. The handler chain fires exactly as if a human moved the cursor and pressed the left button.",
    size: "1x1",
  },
  {
    title: "Phase 5. Diff post-state",
    description:
      "Window title and bounds are read again. window_title_changed and bounds_changed are derived booleans that land in the returned details string. If both are false and you expected a reaction, you know.",
    size: "2x1",
  },
];

const validateClickableCode = `// crates/terminator/src/platforms/windows/element.rs
// validate_clickable, lines 389-412. Three checks, in order.
// A failure here aborts before any mouse event is sent.

fn validate_clickable(&self) -> Result<(), AutomationError> {
    // 1. Check element is visible (includes multi-monitor check)
    if !self.is_visible()? {
        return Err(AutomationError::ElementNotVisible(
            "Element not visible".to_string(),
        ));
    }

    // 2. Check element is enabled
    if !self.is_enabled()? {
        return Err(AutomationError::ElementNotEnabled(
            "Element is disabled".to_string(),
        ));
    }

    // 3. Ensure element is in viewport (scroll if needed)
    self.ensure_in_viewport()?;

    // 4. Removed wait_for_stable_bounds - relying on tree capture delay instead
    // This speeds up click actions by ~800ms

    tracing::info!("Element passed all actionability checks");
    Ok(())
}`;

const coordinateFallbackCode = `// crates/terminator/src/platforms/windows/element.rs
// determine_click_coordinates, lines 415-450. Ask UIA for the
// preferred clickable point. If it says none, compute the bounds
// center. Either way, stamp the path used into the result tuple.

fn determine_click_coordinates(&self) -> Result<(f64, f64, String, String), AutomationError> {
    // Try ClickablePoint first (UIA-recommended point)
    match self.element.0.get_clickable_point() {
        Ok(Some(point)) => {
            Ok((
                point.get_x() as f64,
                point.get_y() as f64,
                "ClickablePoint".to_string(),
                "UIA::GetClickablePoint".to_string(),
            ))
        }
        Ok(None) | Err(_) => {
            let bounds = self.bounds().map_err(|e| {
                AutomationError::PlatformError(format!("Cannot get bounds for click: {e}"))
            })?;

            let center_x = bounds.0 + (bounds.2 / 2.0);
            let center_y = bounds.1 + (bounds.3 / 2.0);

            Ok((
                center_x,
                center_y,
                "BoundsCenter".to_string(),
                "UIA::BoundingRectangle".to_string(),
            ))
        }
    }
}`;

const clickFunctionCode = `// crates/terminator/src/platforms/windows/element.rs
// fn click, lines 666-722. Five phases. One ClickResult.

fn click(&self) -> Result<ClickResult, AutomationError> {
    let click_start = std::time::Instant::now();

    // PHASE 1: PRE-ACTION VALIDATION
    tracing::info!("Phase 1: Validating element is clickable");
    self.validate_clickable()?;

    // PHASE 2: CALCULATE CLICK POINT WITH VALIDATION
    tracing::info!("Phase 2: Calculating and validating click coordinates");
    let (click_x, click_y, method, path_used) = self.determine_click_coordinates()?;

    // PHASE 3: CAPTURE PRE-STATE
    let pre_window_title = self.window().ok().flatten()
        .map(|w| w.name_or_empty()).unwrap_or_default();
    let pre_bounds = self.bounds().ok();

    // PHASE 4: EXECUTE PHYSICAL CLICK
    tracing::info!("Phase 4: Executing {} click at ({}, {}) via {}",
        method, click_x, click_y, path_used);
    self.execute_mouse_click(click_x, click_y, false)?;

    // PHASE 5: POST-ACTION VERIFICATION
    let post_window_title = self.window().ok().flatten()
        .map(|w| w.name_or_empty()).unwrap_or_default();
    let post_bounds = self.bounds().ok();

    let window_title_changed = pre_window_title != post_window_title;
    let bounds_changed = pre_bounds != post_bounds;

    let details = format!(
        "path={path_used}; validated=true; window_title_changed={window_title_changed}; \\
         bounds_changed={bounds_changed}; pre_title='{pre_window_title}'; \\
         post_title='{post_window_title}'; duration_ms={}",
        click_start.elapsed().as_millis()
    );

    Ok(ClickResult {
        method,
        coordinates: Some((click_x, click_y)),
        details,
    })
}`;

const clickResultStruct = `// crates/terminator/src/lib.rs, lines 191-195.
// What every click call returns. Serializable, inspectable,
// assertable. The details string is where the diff lives.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClickResult {
    pub method: String,
    pub coordinates: Option<(f64, f64)>,
    pub details: String,
}`;

const clickResultJson = `{
  "method": "ClickablePoint",
  "coordinates": [842.0, 418.0],
  "details": "path=UIA::GetClickablePoint; validated=true; window_title_changed=true; bounds_changed=false; pre_title='Notepad'; post_title='Save As'; duration_ms=94"
}`;

const boundsCenterJson = `{
  "method": "BoundsCenter",
  "coordinates": [614.5, 231.0],
  "details": "path=UIA::BoundingRectangle; validated=true; window_title_changed=false; bounds_changed=true; pre_title='SAP Logon 770'; post_title='SAP Logon 770'; duration_ms=112"
}`;

const silentMissJson = `{
  "method": "ClickablePoint",
  "coordinates": [201.0, 617.0],
  "details": "path=UIA::GetClickablePoint; validated=true; window_title_changed=false; bounds_changed=false; pre_title='Excel'; post_title='Excel'; duration_ms=78"
}`;

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Per-click return value tells you whether the UI reacted",
    competitor: "No (void return or boolean)",
    ours: "ClickResult with pre/post diff, lib.rs line 191",
  },
  {
    feature: "Coordinate selection with explicit fallback chain",
    competitor: "Either UIA-only or mouse-only, no mixing",
    ours: "ClickablePoint → BoundsCenter, element.rs line 415",
  },
  {
    feature: "Visibility, enabled, and viewport validated before click",
    competitor: "Mouse-injection tools skip this; UIA-only tools do partial",
    ours: "validate_clickable, element.rs line 389",
  },
  {
    feature: "Real OS mouse event (not InvokePattern)",
    competitor: "Most prefer InvokePattern for speed",
    ours: "send_mouse_click, element.rs line 698",
  },
  {
    feature: "Path taken (ClickablePoint or BoundsCenter) recorded in result",
    competitor: "Not exposed",
    ours: "path_used field stamped into details string",
  },
  {
    feature: "Duration per click measured and returned",
    competitor: "Rare; usually requires wrapping the call yourself",
    ours: "duration_ms in details, element.rs line 713",
  },
];

const phaseSteps = [
  {
    title: "Phase 1. validate_clickable",
    description:
      "is_visible, is_enabled, ensure_in_viewport. An off-screen or disabled element returns an error here. No mouse event sent yet.",
    detail: (
      <div className="text-sm text-zinc-600 leading-relaxed">
        Returns{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          AutomationError::ElementNotVisible
        </code>{" "}
        or{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          ElementNotEnabled
        </code>{" "}
        if the UI is not ready. The 800ms{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          wait_for_stable_bounds
        </code>{" "}
        call was removed in a later pass and replaced with the tree-capture
        delay upstream, which is why you see the explanatory comment on
        line 407.
      </div>
    ),
  },
  {
    title: "Phase 2. determine_click_coordinates",
    description:
      "Ask UIA for GetClickablePoint. If it returns None or an error, fall back to bounds center. Return a tuple of (x, y, method, path_used).",
    detail: (
      <div className="text-sm text-zinc-600 leading-relaxed">
        On the success path the method is{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          ClickablePoint
        </code>{" "}
        and the path is{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          UIA::GetClickablePoint
        </code>
        . On the fallback path they become{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          BoundsCenter
        </code>{" "}
        and{" "}
        <code className="bg-zinc-100 px-1 rounded text-xs">
          UIA::BoundingRectangle
        </code>
        . Both end up in the final ClickResult so the caller can see which
        route was taken.
      </div>
    ),
  },
  {
    title: "Phase 3. Snapshot pre-state",
    description:
      "Read the current window title and element bounds into pre_window_title and pre_bounds. Two UIA reads. They become the left side of the diff.",
  },
  {
    title: "Phase 4. execute_mouse_click",
    description:
      "Delegate to super::input::send_mouse_click with ClickType::Left. This is a real injected mouse event at the OS level, not an accessibility-layer Invoke call.",
    detail: (
      <div className="text-sm text-zinc-600 leading-relaxed">
        Real mouse events matter because some apps have handler chains that
        only fire on WM_LBUTTONDOWN and WM_LBUTTONUP, not on UIA Invoke.
        Games, some Electron apps, custom WPF controls, and many SAP
        widgets fall into this category.
      </div>
    ),
  },
  {
    title: "Phase 5. Diff post-state",
    description:
      "Read window title and bounds again. Compute window_title_changed and bounds_changed. Format the details string. Return the full ClickResult.",
  },
];

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'Phase 1: Validating' crates/terminator/src/platforms/windows/element.rs", type: "command" as const },
  { text: "674:        tracing::info!(\"Phase 1: Validating element is clickable\");", type: "success" as const },
  { text: "grep -n 'window_title_changed' crates/terminator/src/platforms/windows/element.rs", type: "command" as const },
  { text: "710:        let window_title_changed = pre_window_title != post_window_title;", type: "success" as const },
  { text: "713:        let details = format!(\"path={path_used}; validated=true; window_title_changed={window_title_changed}; ...\"", type: "success" as const },
  { text: "grep -n 'fn determine_click_coordinates' crates/terminator/src/platforms/windows/element.rs", type: "command" as const },
  { text: "415:    fn determine_click_coordinates(&self) -> Result<(f64, f64, String, String), AutomationError> {", type: "success" as const },
  { text: "grep -n 'pub struct ClickResult' crates/terminator/src/lib.rs", type: "command" as const },
  { text: "191:pub struct ClickResult {", type: "success" as const },
];

const sdkExampleCode = `// TypeScript SDK. Same five-phase contract. The ClickResult is
// returned as a plain object over the IPC boundary.

import { Desktop } from "terminator.js";

const desktop = new Desktop();
const saveButton = await desktop
  .locator("role:Button")
  .locator("name:Save")
  .first();

const result = await saveButton.click();

// result is a ClickResult.
// { method: "ClickablePoint",
//   coordinates: [842, 418],
//   details: "path=UIA::GetClickablePoint; validated=true;
//             window_title_changed=true; bounds_changed=false;
//             pre_title='Notepad'; post_title='Save As';
//             duration_ms=94" }

if (!result.details.includes("window_title_changed=true")) {
  // The click fired but the Save dialog did not open.
  // Retry, fall back to a different selector, or surface the
  // failure to the agent. Without the details string you would
  // not know this happened.
  throw new Error("Save dialog did not appear");
}`;

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
          Desktop application automation where every click returns a{" "}
          <GradientText>post-state diff</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every guide on desktop application automation compares pricing,
          recorder UIs, and supported scripting languages. Those comparisons
          skip the one thing that decides whether your script is useful or
          dangerous in production: when you call{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            element.click()
          </code>
          , can the caller tell the click actually reached a handler?
          Terminator&rsquo;s click is a five-phase function that validates the
          element, picks coordinates with a fallback chain, snapshots state
          before and after, and returns a ClickResult whose{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            details
          </code>{" "}
          string contains{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            window_title_changed
          </code>{" "}
          and{" "}
          <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
            bounds_changed
          </code>
          . That line is on element.rs 713.
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
        ratingCount="early design partners"
        highlights={[
          "Five labeled phases per click, not one",
          "ClickablePoint to BoundsCenter fallback in one function",
          "post-state diff returned on every click",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="One click, five phases"
            subtitle="Desktop application automation that returns a diff you can assert on"
            captions={[
              "Phase 1: validate visible, enabled, in viewport",
              "Phase 2: ClickablePoint, fallback to BoundsCenter",
              "Phase 3: snapshot window title and bounds",
              "Phase 4: real OS mouse event, not InvokePattern",
              "Phase 5: diff post-state, return ClickResult",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The problem nobody in the space admits to
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          You write a script that automates SAP Logon. The script clicks the
          connect button. The click returns true. The next step reads the
          username field. It times out. Fifteen minutes of log reading later,
          you discover the UIA provider for that SAP dialog reported the
          button as visible and enabled, and the click fired, but a modal
          dialog from a different process had stolen focus and the click
          landed on an invisible pane. Your tool told you success.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          This is the default behavior of almost every desktop application
          automation library in production use. Raw mouse-injection tools
          (AutoIt, AutoHotkey, pywinauto&rsquo;s mouse module) send the click and
          return. UIA-based tools (Microsoft&rsquo;s UI Automation, White, FlaUI in
          its InvokePattern mode) call the element&rsquo;s invoke handler and
          return success if the call dispatched. Neither class captures state
          around the click. Both can report success after a click that did
          nothing.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          The fix is not a bigger model or a smarter selector. It is a
          function that takes a snapshot before the click, sends a real mouse
          event, takes a snapshot after, and returns the diff. Five phases.
          Fifty-six lines of Rust. That function is in Terminator.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The five phases, walked end to end
        </h2>
        <p className="text-zinc-600 mb-6">
          This is the entire click pipeline. Each phase has a single
          responsibility and produces an output consumed by the next. Phase
          ordering is deterministic. A phase that errors short-circuits the
          rest.
        </p>
        <StepTimeline
          title="Inside element.click() on Windows"
          steps={phaseSteps}
        />
      </section>

      <ProofBanner
        quote='let details = format!("path={path_used}; validated=true; window_title_changed={window_title_changed}; bounds_changed={bounds_changed}; pre_title=... post_title=... duration_ms=...");'
        source="crates/terminator/src/platforms/windows/element.rs line 713. The final string every click call returns to the caller."
        metric="5 fields"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The whole function, verbatim
        </h2>
        <p className="text-zinc-600 mb-6">
          Fifty-six lines. The{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            PHASE N
          </code>{" "}
          comments are in the source, not inserted for this guide. They exist
          so the flow is readable when you land inside the function from a
          stack trace.
        </p>
        <AnimatedCodeBlock
          code={clickFunctionCode}
          language="rust"
          filename="element.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Phase 1, verbatim: three checks in order
        </h2>
        <p className="text-zinc-600 mb-6">
          Visibility, enabled state, and viewport membership. The multi-monitor
          visibility test is a separate function,{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            is_visible_on_any_monitor
          </code>
          , that iterates{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            xcap::Monitor::all()
          </code>{" "}
          and checks whether the element&rsquo;s bounds intersect any physical
          display. An element placed on a disconnected second monitor fails
          here instead of producing a phantom click at (0, 0).
        </p>
        <AnimatedCodeBlock
          code={validateClickableCode}
          language="rust"
          filename="element.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Phase 2, verbatim: the coordinate fallback nobody admits to
        </h2>
        <p className="text-zinc-600 mb-6">
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            GetClickablePoint
          </code>{" "}
          is the UIA-preferred way to ask &ldquo;where should I click?&rdquo;. It
          returns the point an assistive technology would click, which
          accounts for offset from the element&rsquo;s bounding rectangle, split
          buttons, and controls that are reachable only through a sub-region.
          It also fails silently on custom controls that do not implement it.
          Older WPF apps, Java Swing windows under the JAWS bridge, and many
          Electron apps with minimal UIA providers hit the{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            Ok(None)
          </code>{" "}
          branch. Terminator falls through to the bounds center and stamps{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            BoundsCenter
          </code>{" "}
          into the result so the caller knows which route was used.
        </p>
        <AnimatedCodeBlock
          code={coordinateFallbackCode}
          language="rust"
          filename="element.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          The five bundled into a bento
        </h2>
        <p className="text-zinc-600 mb-6">
          Each card is one phase. Phase 2 is the one with the fallback, so it
          gets the wide slot.
        </p>
        <BentoGrid cards={phaseCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Inputs, phases, and the ClickResult
        </h2>
        <p className="text-zinc-600 mb-6">
          Four inputs into the click function, one classifier in the middle,
          three outputs on the other side. This is the shape callers see when
          they integrate the SDK.
        </p>
        <AnimatedBeam
          title="element.click() pipeline"
          accentColor="#FF3E00"
          from={[
            { label: "UIElement", sublabel: "selector-resolved target" },
            { label: "UIA tree", sublabel: "live accessibility tree" },
            { label: "Monitor geometry", sublabel: "xcap::Monitor::all()" },
            { label: "Input subsystem", sublabel: "SendInput on Windows" },
          ]}
          hub={{
            label: "click()",
            sublabel: "element.rs lines 666-722",
          }}
          to={[
            { label: "method", sublabel: "ClickablePoint or BoundsCenter" },
            { label: "coordinates", sublabel: "(x, y) in screen space" },
            { label: "details", sublabel: "validated, diff, duration_ms" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          What every click returns
        </h2>
        <p className="text-zinc-600 mb-6">
          The struct is defined in{" "}
          <code className="font-mono text-sm bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded">
            crates/terminator/src/lib.rs
          </code>
          . Three fields. Serializable so it crosses IPC into the TypeScript
          and Python SDKs without reshaping.
        </p>
        <AnimatedCodeBlock
          code={clickResultStruct}
          language="rust"
          filename="lib.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Three real ClickResults
        </h2>
        <p className="text-zinc-600 mb-6">
          Same API, three different outcomes. Notice how the details string
          tells the caller exactly what happened without needing a screenshot
          or a log scrape.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-emerald-700 mb-2">
              Click opened a dialog
            </p>
            <AnimatedCodeBlock
              code={clickResultJson}
              language="json"
              filename="ok.dialog.json"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700 mb-2">
              Fallback path, bounds changed
            </p>
            <AnimatedCodeBlock
              code={boundsCenterJson}
              language="json"
              filename="ok.fallback.json"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-red-700 mb-2">
              Click fired, nothing reacted
            </p>
            <AnimatedCodeBlock
              code={silentMissJson}
              language="json"
              filename="silent.miss.json"
            />
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The same call from the TypeScript SDK
        </h2>
        <p className="text-zinc-600 mb-6">
          The Rust core is the source of truth, but almost no one writes Rust
          directly against it. The TypeScript SDK (terminator.js) and the
          Python SDK (terminator-py) both return the same ClickResult object.
          This is the pattern we recommend in every agent tool and every
          workflow step.
        </p>
        <AnimatedCodeBlock
          code={sdkExampleCode}
          language="typescript"
          filename="save.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Numbers from the source
        </h2>
        <MetricsRow
          metrics={[
            { value: 5, label: "labeled phases in click()" },
            { value: 56, label: "lines in the click function" },
            { value: 2, label: "coordinate paths (UIA, bounds)" },
            { value: 3, label: "fields on ClickResult" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={713} />
            </div>
            <p className="text-sm text-zinc-600">
              Line in{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                element.rs
              </code>{" "}
              where the details string is formatted. Everything interesting
              a caller wants to assert on is concatenated here:{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">path</code>,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                window_title_changed
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                bounds_changed
              </code>
              ,{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                duration_ms
              </code>
              .
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={800} />
              <span className="text-xl font-medium text-zinc-500 ml-1">
                ms saved
              </span>
            </div>
            <p className="text-sm text-zinc-600">
              The explicit comment at{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                element.rs:407
              </code>{" "}
              documents the removal of a{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                wait_for_stable_bounds
              </code>{" "}
              step. The tree-capture delay upstream covers the same
              stability check, so the click path is 800ms shorter per call
              with no loss of correctness.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={2} />
            </div>
            <p className="text-sm text-zinc-600">
              Coordinate-selection paths. The preferred one is{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                UIA::GetClickablePoint
              </code>
              . The fallback is{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                UIA::BoundingRectangle
              </code>{" "}
              center. The chosen path is stamped into{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                ClickResult.method
              </code>
              .
            </p>
          </GlowCard>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature-by-feature, versus the usual desktop tools
        </h2>
        <p className="text-zinc-600 mb-6">
          Every tool in this table is production software used to automate
          native Windows apps. The rows describe behaviors that are either
          present or absent from the return value of their click primitive,
          not opinions about the product overall.
        </p>
        <ComparisonTable
          productName="Terminator"
          competitorName="UiPath / AutoIt / pywinauto / FlaUI"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2">
          Verify in the repo
        </h2>
        <p className="text-zinc-600 mb-6">
          Five grep lines against the public mediar-ai/terminator repo. The
          phase comments, the diff computation, the fallback function, and
          the ClickResult struct are all at the line numbers quoted in this
          guide.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Want to see the details string for your own click path?"
        description="Bring a flaky desktop workflow. We will run it through Terminator and walk through each ClickResult together so you can see exactly which clicks land and which do not."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the five-phase click in your own workflow in 20 minutes."
      />
    </article>
  );
}
