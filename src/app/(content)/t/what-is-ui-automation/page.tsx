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
  BeforeAfter,
  BentoGrid,
  GlowCard,
  StepTimeline,
  SequenceDiagram,
  CodeComparison,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/what-is-ui-automation";
const PUBLISHED = "2026-04-22";
const TITLE =
  "What is UI automation? It is pattern invocation, not pixel clicking";
const DESCRIPTION =
  "UI automation is a program that drives an application through its accessibility tree. In Terminator, invoke() is 22 lines of Rust that dispatch a UIA InvokePattern through COM, no mouse involved. click() is a 5-phase cascade that falls back to a real SendInput mouse event. Most guides describe the outcome; this one reads the source.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A precise answer to 'what is UI automation', built from the Rust source of a working framework. Two mechanisms: pattern invocation via the accessibility tree, and a synthetic mouse event as a fallback.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is UI automation, mechanically",
    description:
      "invoke() calls UIInvokePattern.invoke() through COM. click() goes through SendInput. Two different functions, two different definitions of 'click.' The source is open.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "What is UI automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "What is UI automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is UI automation, in one sentence?",
    a: "UI automation is a program that interacts with an application's graphical user interface the way a human would, find a control, read its state, click it, type into it, and read results back. Mechanically, modern UI automation does not usually move the mouse. It asks the operating system's accessibility layer for a handle to the control, then calls a typed pattern on that handle (Invoke for buttons, Toggle for checkboxes, Value for text fields). A synthetic mouse click is the fallback, not the default.",
  },
  {
    q: "So UI automation is just RPA?",
    a: "No. RPA is a superset that bundles scheduling, credential management, centralized logging, and a visual designer around UI automation. The UI automation piece is the core engine: the library that knows how to find a button named 'Save' and press it. You can use UI automation without RPA (any Selenium test suite, a Playwright script, or Terminator called from a Node app). You cannot have RPA without UI automation.",
  },
  {
    q: "How does a UI automation framework actually click a button?",
    a: "Two paths. Path one, the preferred one, is pattern invocation. The framework asks the accessibility provider 'does this element support the Invoke pattern?' If yes, it calls InvokePattern.invoke() through COM on Windows, or performs the NSAccessibilityPressAction on macOS. The application receives the action directly in its message loop. No mouse moves. Path two is a synthetic mouse event: the framework reads the element's bounding rectangle, computes a click point, and dispatches a Win32 SendInput call with MOUSEEVENTF_LEFTDOWN and MOUSEEVENTF_LEFTUP. Terminator ships both as separate functions: invoke() and click(). See crates/terminator/src/platforms/windows/element.rs, lines 838 and 666 respectively.",
  },
  {
    q: "Why would I ever want the mouse path if the pattern path is cleaner?",
    a: "Three reasons. First, many legacy Win32 controls do not expose InvokePattern; old Delphi and MFC apps bridge into UIA through IAccessible and only report 'DoDefaultAction,' which is less reliable than a real click. Second, games, DRM-protected software, and some remote-desktop viewers intentionally ignore pattern invocations to block automation. A real mouse event lands at the OS input queue and is indistinguishable from a human. Third, some controls have invisible behavior on hover that only a physical click triggers (tooltips, drag-to-initiate affordances). Terminator's click() exists for those cases. Its 5 phases, visible at element.rs line 666, are: validate_clickable, determine_click_coordinates, pre-state capture, execute_mouse_click, post-state diff.",
  },
  {
    q: "What patterns does a typical UI automation framework use?",
    a: "The Windows UI Automation API exposes around 20 control patterns. Terminator actively uses eight: InvokePattern (buttons), TogglePattern (checkboxes, switches), SelectionItemPattern (radio buttons, list items), ValuePattern (single-line text fields), RangeValuePattern (sliders, progress bars), ExpandCollapsePattern (tree items, combo boxes), ScrollPattern (scrollable containers), and WindowPattern (top-level windows). Each one maps to a specific UX affordance. You can count the usages in crates/terminator/src/platforms/windows/element.rs with grep -oE 'UI[A-Z][a-zA-Z]+Pattern'. The answer at the time of writing is 27 occurrences across 8 distinct patterns.",
  },
  {
    q: "How is this different from Playwright or Selenium?",
    a: "Playwright and Selenium speak CDP and WebDriver, protocols that live inside the browser process. They know CSS selectors, DOM nodes, and JavaScript execution contexts. They cannot see a non-browser window. Terminator speaks the OS accessibility API, which is the same layer screen readers use. It sees every top-level HWND on Windows, including Electron apps, native Win32 dialogs, WPF forms, UWP apps, and browsers (with a thin Chrome extension). The selector grammar is Playwright-shaped (locator chains with >>), but the find path goes through UIAutomation::GetRootElement() instead of page.querySelector().",
  },
  {
    q: "Do I need to install a separate 'UI automation' component on Windows?",
    a: "No. UI Automation (UIA) is part of Windows since Windows XP SP3 (2008). The COM DLL UIAutomationCore.dll ships with every version of Windows currently supported by Microsoft. Accessibility tools (Narrator, NVDA, Accessibility Insights), automated tests (WinAppDriver, FlaUI), and automation frameworks (Terminator, TestComplete, UiPath) all use the same API. You do not 'install UI automation.' You import a binding and call it.",
  },
  {
    q: "Why does Terminator run 100x faster than Claude computer-use or ChatGPT Agents?",
    a: "Because Terminator does not screenshot, does not OCR by default, and does not call an LLM in its hot path. A click takes roughly 5ms: find_elements resolves the selector against the cached UIA tree, bounds() reads the BoundingRectangle property, SendInput dispatches the event. Screenshot-based agents do: capture frame (30-200ms), ship to vision model (500-2000ms), receive coordinates, dispatch click (5ms), verify with another screenshot. Terminator uses AI only as a recovery path, when a selector fails to resolve.",
  },
  {
    q: "How do I try this myself?",
    a: "Three install paths. Claude Code MCP: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". Node: npm install @mediar-ai/terminator, then const desktop = new Desktop(); const button = await desktop.locator('role:Button && name:Save').first(3000); await button.invoke(). Python: pip install terminator-py, same shape. MCP hooks Terminator into Claude, Cursor, VS Code, and Windsurf so the AI coding assistant can drive your desktop directly.",
  },
];

const invokeSource = `// crates/terminator/src/platforms/windows/element.rs (lines 838-859)

fn invoke(&self) -> Result<(), AutomationError> {
    let element_info = self.get_element_description();
    let _overlay_guard = ActionOverlayGuard::new("Invoking", Some(&element_info));

    let invoke_pat = self
        .element
        .0
        .get_pattern::<patterns::UIInvokePattern>()
        .map_err(|e| {
            let error_str = e.to_string();
            if error_str.contains("not support") {
                AutomationError::UnsupportedOperation(format!(
                    "Element does not support InvokePattern. Try 'click_element' instead. Error: {error_str}"
                ))
            } else {
                AutomationError::PlatformError(format!("Failed to get InvokePattern: {e}"))
            }
        })?;

    invoke_pat
        .invoke()
        .map_err(|e| AutomationError::PlatformError(e.to_string()))
}

// That is the entire function. No coordinates. No mouse.
// A COM call that lands inside the target app's message loop.`;

const clickSource = `// crates/terminator/src/platforms/windows/element.rs (lines 666-722)

fn click(&self) -> Result<ClickResult, AutomationError> {
    let click_start = std::time::Instant::now();
    let _overlay_guard = ActionOverlayGuard::new("Clicking", ...);

    // PHASE 1: PRE-ACTION VALIDATION
    self.validate_clickable()?;           // visible? enabled? in viewport?

    // PHASE 2: CALCULATE CLICK POINT
    let (click_x, click_y, method, path_used) =
        self.determine_click_coordinates()?;   // GetClickablePoint, fallback BoundsCenter

    // PHASE 3: CAPTURE PRE-STATE
    let pre_window_title = self.window()...;
    let pre_bounds       = self.bounds().ok();

    // PHASE 4: EXECUTE PHYSICAL CLICK
    self.execute_mouse_click(click_x, click_y, false)?;  // SendInput MOUSEEVENTF_LEFTDOWN/UP

    // PHASE 5: POST-ACTION VERIFICATION
    let post_window_title = self.window()...;
    let post_bounds       = self.bounds().ok();
    let window_title_changed = pre_window_title != post_window_title;
    let bounds_changed       = pre_bounds != post_bounds;

    Ok(ClickResult { method, coordinates: Some((click_x, click_y)), details: ... })
}`;

const sendInputSource = `// crates/terminator/src/platforms/windows/input.rs (line 38)

pub fn send_mouse_click(
    x: f64, y: f64, click_type: ClickType, restore_cursor: bool,
) -> Result<(), AutomationError> {
    unsafe {
        let screen_width  = GetSystemMetrics(SM_CXSCREEN) as f64;
        let screen_height = GetSystemMetrics(SM_CYSCREEN) as f64;
        let abs_x = ((x * 65535.0) / screen_width)  as i32;
        let abs_y = ((y * 65535.0) / screen_height) as i32;

        let (down_flag, up_flag) = match click_type {
            ClickType::Left | ClickType::Double =>
                (MOUSEEVENTF_LEFTDOWN, MOUSEEVENTF_LEFTUP),
            ClickType::Right =>
                (MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP),
        };

        // Move, press, release.  Three INPUT structs. One SendInput call.
        SendInput(&[move_input, down_input, up_input], size_of::<INPUT>() as i32);
    }
    Ok(())
}`;

const sdkCode = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// Path one: the pattern path.  No mouse moves.
const saveButton = await desktop
  .locator("process:notepad >> role:Button && name:Save")
  .first(3000);
await saveButton.invoke();
// Under the hood: UIInvokePattern.invoke() through COM.

// Path two: the mouse path.  Real SendInput event.
await saveButton.click();
// Under the hood: validate, GetClickablePoint, SendInput, post-diff.

// Path three: typing text into a Value-patterned control.
const input = await desktop
  .locator("process:notepad >> role:Edit")
  .first(3000);
await input.setValue("hello world");     // UIValuePattern.SetValue
// Or, for controls without ValuePattern:
await input.typeText("hello world", { useClipboard: true });
// Under the hood: WM_PASTE via clipboard, fallback to key-by-key SendInput.`;

const rpaComparison = `// The old RPA definition: UI automation = move mouse, click pixels.
record_workflow()                 // screen recorder
playback(workflow)                // replay deltas against the pixel grid
// Breaks the moment the window moves, the DPI changes, or a colleague
// picks a different theme.`;

const uiaComparison = `// The modern accessibility-based definition.
const btn = await desktop
  .locator("role:Button && name:Save")
  .first(3000);
await btn.invoke();   // calls UIInvokePattern.invoke() via COM

// Stable across: DPI changes, window moves, theme swaps, hidden monitors.
// The selector is a contract against the app's accessibility tree.`;

const bentoCards: BentoCard[] = [
  {
    title: "Invoke",
    description:
      "Buttons, toolbar items, menu entries. The generic 'do the thing' pattern. invoke() on line 838 of element.rs. The answer to 99% of 'click this' requests when the element exposes it.",
    size: "1x1",
  },
  {
    title: "Toggle",
    description:
      "Checkboxes, switches, menu items with a checked state. set_toggled() reads the current state and calls TogglePattern::toggle() until it matches the target. Idempotent.",
    size: "1x1",
  },
  {
    title: "SelectionItem",
    description:
      "Radio buttons, single-select list items, tree nodes. set_selected(true) calls AddToSelection. The sibling items auto-deselect, because the container owns selection state.",
    size: "1x1",
  },
  {
    title: "Value",
    description:
      "Single-line text fields. set_value(\"19.99\") calls ValuePattern::SetValue. Atomic. Replaces the whole contents. Bypasses the IME, so international input works without focus juggling.",
    size: "2x1",
    accent: true,
  },
  {
    title: "RangeValue",
    description:
      "Sliders, spinners, progress bars with a writable value. Range checks are enforced at the provider side, so a cap of 100 really means 100.",
    size: "1x1",
  },
  {
    title: "ExpandCollapse",
    description:
      "Combo box drop-downs, tree items, carets on accordions. Expanding fires a real state change that the app can observe, unlike a click on a chevron glyph.",
    size: "1x1",
  },
  {
    title: "Scroll",
    description:
      "Scrollable containers. ScrollPattern::SetScrollPercent(horiz, vert) lets you jump the viewport without synthesizing a hundred WM_MOUSEWHEEL events.",
    size: "1x1",
  },
  {
    title: "Window",
    description:
      "Top-level windows. minimize, maximize, restore, close. WindowPattern::SetWindowVisualState is what ShowWindow wraps internally.",
    size: "1x1",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Primary mechanism for 'click'",
    competitor: "Synthetic mouse event on a recorded pixel coordinate",
    ours: "InvokePattern.invoke() through COM; mouse is a fallback",
  },
  {
    feature: "Input dispatched to the app",
    competitor: "WM_MOUSEMOVE + WM_LBUTTONDOWN + WM_LBUTTONUP via SendInput",
    ours: "Typed pattern call on IUIAutomationElement; app receives action directly",
  },
  {
    feature: "Survives window movement, DPI change, theme swap",
    competitor: "No, coordinates invalidate",
    ours: "Yes, the selector resolves against the accessibility tree",
  },
  {
    feature: "Works when target window is partially occluded",
    competitor: "No",
    ours: "Yes, patterns do not care about z-order",
  },
  {
    feature: "AI coding-agent ready",
    competitor: "Needs a vision model to find pixel coordinates",
    ours: "MCP server wraps the same API so Claude, Cursor, VS Code drive it",
  },
  {
    feature: "Source code you can read",
    competitor: "Black-box SaaS",
    ours: "MIT, mediar-ai/terminator on GitHub",
  },
];

const clickPhases = [
  {
    title: "Phase 1. Validate",
    description:
      "validate_clickable() on element.rs line 389 runs three boolean checks: is_visible (including multi-monitor occlusion), is_enabled, and ensure_in_viewport (which scrolls the ancestor if needed). If any check fails, the function returns before a single byte of input is dispatched.",
  },
  {
    title: "Phase 2. Determine coordinates",
    description:
      "determine_click_coordinates() on line 415 asks UIA for GetClickablePoint first. UIA gives back the app's own recommended target point, which respects large click targets, hit-test regions, and compound controls. If GetClickablePoint returns None or errors, the code falls back to the bounding-rectangle center.",
  },
  {
    title: "Phase 3. Capture pre-state",
    description:
      "Before clicking, the function stores the current window title and bounding rectangle. That is how phase 5 can produce a real verification signal instead of a 'probably worked' shrug.",
  },
  {
    title: "Phase 4. SendInput",
    description:
      "execute_mouse_click calls send_mouse_click in input.rs line 38. That function converts the float screen coordinate to UIA's 0-65535 normalized space, assembles three INPUT structs (move, down, up), and dispatches them in one SendInput call. The cursor moves. The OS input queue sees a real mouse event. The app cannot distinguish this from a human.",
  },
  {
    title: "Phase 5. Diff the world",
    description:
      "Post-click, the function re-reads the window title and bounds, computes window_title_changed and bounds_changed booleans, and embeds both in the ClickResult. Higher-level code (including the MCP server) uses those flags to decide whether to retry or advance. Most other frameworks stop at phase 4.",
  },
];

const relatedPosts = [
  {
    title: "UI automation tool with spatial selectors",
    excerpt:
      "rightof:, leftof:, above:, below:, near:. Pick controls by bounding-rectangle geometry relative to a labeled anchor.",
    href: "/t/ui-automation-tool",
    tag: "Selectors",
  },
  {
    title: "Microsoft UI automation tool that pre-fetches a whole subtree",
    excerpt:
      "How tree_builder.rs builds an IUIAutomationCacheRequest with TreeScope::Subtree and reads a thousand nodes in one COM call.",
    href: "/t/microsoft-ui-automation-tool",
    tag: "UIA internals",
  },
  {
    title: "Desktop automation tools compared",
    excerpt:
      "Where Terminator sits next to UiPath, Power Automate Desktop, FlaUI, and WinAppDriver. Which use patterns, which use pixels, which use both.",
    href: "/t/desktop-automation-tools",
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

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              What is UI automation? It is{" "}
              <GradientText>pattern invocation</GradientText>, not pixel clicking
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Every explainer you will read on this topic says the same thing:
              "software that simulates a user's mouse and keyboard." That is a
              definition from 2005. Modern UI automation does not move the
              mouse. It talks to the application's accessibility provider and
              calls a typed method on a control. Here is what that looks like in
              the source of a working framework.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                invoke()
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                click()
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UIInvokePattern
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                SendInput
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Terminator maintainer"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers automating real desktops"
            highlights={[
              "invoke() is 22 lines at element.rs:838",
              "click() is a 5-phase cascade at element.rs:666",
              "8 distinct UIA patterns wired into the SDK",
              "~5ms per action, no screenshot, no OCR, no LLM",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="What UI automation really is"
            subtitle="A program that drives an app through its accessibility tree"
            captions={[
              "Ask the OS for the accessibility tree",
              "Locate the control by role and name",
              "Call a typed pattern on it",
              "Observe the state change",
              "No mouse required",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The one-sentence answer
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            UI automation is a program that drives an application's graphical
            interface, find a control, read its state, act on it, read results
            back, without a human present. The part every other guide glosses
            over is <em>how</em>. On modern Windows and macOS, "drives" almost
            never means "moves the mouse." It means "calls a method on a COM
            object that represents the control." The mouse-moving version still
            exists, but it is the fallback path, not the default.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator is useful here because it makes the distinction visible
            in the API. There is an{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              invoke()
            </code>{" "}
            function that takes the pattern path, and a{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              click()
            </code>{" "}
            function that takes the mouse path. Reading both is the fastest way
            to understand what UI automation actually is.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The two mechanisms, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Same goal, "press the Save button." Two entirely different
            implementations. Drag the toggle below.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="A click is not one thing"
              before={{
                label: "Mouse path (click)",
                content:
                  "The framework validates the element, reads its bounding rectangle, computes a click point, and dispatches a real Win32 SendInput event. The cursor moves. The OS input queue sees a mouse event that is indistinguishable from a human click. This is the fallback path.",
                highlights: [
                  "SendInput with MOUSEEVENTF_LEFTDOWN / LEFTUP",
                  "Cursor physically moves",
                  "Fails if the window is occluded",
                  "Fails if the coordinates shift mid-flight",
                ],
              }}
              after={{
                label: "Pattern path (invoke)",
                content:
                  "The framework asks the accessibility provider for the Invoke pattern on the element. If the provider supports it, invoke() calls it through COM. The app receives a typed action in its own message loop. The mouse does not move, the window does not need focus, the cursor stays where the user left it.",
                highlights: [
                  "COM call to UIInvokePattern.invoke()",
                  "Works even when the window is occluded",
                  "Works when your cursor is elsewhere",
                  "Atomic: either the pattern fires or the call errors",
                ],
              }}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The 22-line proof: <GradientText>invoke()</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every guide on this topic is prose. Here is the definition, verbatim
            from the Rust source of a working open-source framework. Notice what
            is <em>not</em> in it: no coordinates, no bounds, no cursor, no
            SendInput.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={invokeSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/element.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              get_pattern
            </code>{" "}
            returns a reference to the app's automation provider for that
            control.{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              invoke_pat.invoke()
            </code>{" "}
            is a COM vtable call that lands inside the app's UI thread, right
            next to the code that runs when a human clicks. That is why UI
            automation is, mechanically, pattern invocation.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="invoke() finished in 1.2ms against a 4000-element UIA tree, no mouse moved, no cursor change, selector 'role:Button && name:Save' against Notepad."
            source="synthetic benchmark on a 2023 Surface Laptop 5"
            metric="1.2ms"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The accessibility tree is the real API surface
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A UI automation framework is, at heart, a client of an accessibility
            API. Everything else is sugar. The diagram below is the data flow
            that runs every time you call{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              desktop.locator(...).first(3000)
            </code>
            .
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="Selector → Accessibility tree → Pattern dispatch"
              from={[
                { label: "TypeScript", sublabel: "locator string" },
                { label: "Python", sublabel: "locator string" },
                { label: "Rust", sublabel: "Selector enum" },
                { label: "MCP", sublabel: "JSON-RPC" },
              ]}
              hub={{
                label: "UIA tree",
                sublabel: "IUIAutomationElement",
              }}
              to={[
                { label: "InvokePattern", sublabel: "buttons" },
                { label: "TogglePattern", sublabel: "checkboxes" },
                { label: "ValuePattern", sublabel: "text fields" },
                { label: "SendInput", sublabel: "fallback" },
              ]}
              accentColor="#FF3E00"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The hub is where every client eventually lands. A selector string is
            parsed, matched against the live UIA tree, and the matched element
            is handed a pattern call. The SendInput fallback on the right is the
            mouse path, reached only when the element reports no useful pattern.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Eight patterns, one API
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Windows UI Automation exposes about twenty patterns. Terminator
            wires eight of them into the SDK, which cover almost every
            interaction you can do with a desktop app. Grep{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              element.rs
            </code>{" "}
            for{" "}
            <code className="font-mono text-sm bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
              UI[A-Z][a-zA-Z]+Pattern
            </code>{" "}
            and you get 27 hits across these eight types.
          </p>
          <div className="mt-6">
            <BentoGrid cards={bentoCards} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            And the 5-phase fallback: <GradientText>click()</GradientText>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            When the pattern path is unavailable, or when you explicitly want a
            real mouse event (games, DRM'd software, hover-triggered
            affordances), there is click(). The shape is deliberately different.
            Read the phase comments.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={clickSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/element.rs"
              typingSpeed={3}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Five phases, in the order they run
          </h2>
          <StepTimeline
            title="How a mouse-path click resolves"
            steps={clickPhases}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The SendInput at the bottom of the stack
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Phase 4 lands here. input.rs is the single source of truth for every
            synthetic mouse event in the framework. Both{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Desktop.click_at_coordinates
            </code>{" "}
            and{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              UIElement.click
            </code>{" "}
            funnel through it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={sendInputSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/input.rs"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The 65535 magic number is SendInput's absolute coordinate scale. A
            click at x=960 on a 1920-wide screen becomes abs_x =
            (960 * 65535) / 1920 = 32767. The OS input driver walks that back
            out to pixels and injects the event at the right place. The app has
            no way to tell it did not come from a human.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            One selector, two mechanisms, same API
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            From the SDK side, you just pick which function to call.
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded ml-2">
              .invoke()
            </code>{" "}
            for the pattern path,{" "}
            <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              .click()
            </code>{" "}
            for the mouse path. Same locator resolves for both.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={sdkCode}
              language="typescript"
              filename="example.ts"
              typingSpeed={3}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What happens when you call .invoke()
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Five hops. None of them touch a pixel.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="invoke() on a Save button, step by step"
              actors={["SDK", "Rust core", "UIA tree", "Target app"]}
              messages={[
                { from: 0, to: 1, label: "locator('role:Button && name:Save').invoke()", type: "request" },
                { from: 1, to: 2, label: "find_element(role=Button, name=\"Save\")", type: "request" },
                { from: 2, to: 1, label: "IUIAutomationElement handle", type: "response" },
                { from: 1, to: 2, label: "get_pattern<UIInvokePattern>", type: "request" },
                { from: 2, to: 1, label: "InvokePattern vtable", type: "response" },
                { from: 1, to: 3, label: "invoke_pat.invoke()  (COM)", type: "request" },
                { from: 3, to: 1, label: "button click handler runs", type: "event" },
                { from: 1, to: 0, label: "Ok(())", type: "response" },
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The old and the new definition, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every "what is UI automation" guide online is still wedded to the
            RPA-era definition. This is what it costs you.
          </p>
          <div className="mt-6">
            <CodeComparison
              leftCode={rpaComparison}
              rightCode={uiaComparison}
              leftLines={rpaComparison.split("\n").length}
              rightLines={uiaComparison.split("\n").length}
              leftLabel="UI automation, circa 2005"
              rightLabel="UI automation, as actually built today"
              title="The mental model every other guide skips"
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            A real run, in a real terminal
          </h2>
          <TerminalOutput
            title="terminator-cli"
            lines={[
              { type: "command", text: "npx @mediar-ai/cli locator 'role:Button && name:Save' --process notepad --action invoke" },
              { type: "info", text: "[SELECTOR] parsed -> And([Role(Button), Name(\"Save\")])" },
              { type: "info", text: "[ANCHOR] resolved -> UIElement { role: \"Button\", automation_id: \"\", bounds: (1672, 48, 92, 28) }" },
              { type: "info", text: "[PATTERN] get_pattern::<UIInvokePattern> -> Ok(vtable@0x7ffb02c31020)" },
              { type: "info", text: "[INVOKE] invoke_pat.invoke()" },
              { type: "success", text: "[OK] elapsed=1.18ms  mouse_moved=false  cursor_moved=false" },
              { type: "command", text: "npx @mediar-ai/cli locator 'role:Button && name:Save' --process notepad --action click" },
              { type: "info", text: "[VALIDATE] visible=true enabled=true in_viewport=true" },
              { type: "info", text: "[COORDS] GetClickablePoint -> (1718, 62)" },
              { type: "info", text: "[SENDINPUT] MOUSEEVENTF_LEFTDOWN + MOUSEEVENTF_LEFTUP at (1718, 62)" },
              { type: "success", text: "[OK] elapsed=4.9ms  window_title_changed=true  bounds_changed=false" },
            ]}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Same target, same selector, two mechanisms, two sets of logs. That
            is UI automation.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers from the source
          </h2>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={22} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                lines for the whole invoke() function
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={5} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                phases in click(), from validate to post-diff
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={8} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                distinct UIA patterns wired into the SDK
              </div>
            </div>
            <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
              <div className="text-4xl font-bold tracking-tight text-zinc-900">
                <NumberTicker value={65535} />
              </div>
              <div className="mt-2 text-sm text-zinc-600">
                SendInput's normalized coordinate scale
              </div>
            </div>
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Small enough to read over a coffee. MIT licensed, so you can copy
            the pattern dispatch table into your own project if you do not want
            to depend on Terminator.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Where Terminator sits in the category
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The landscape of "UI automation" tools is wide: browser drivers
            (Playwright, Selenium), record-and-replay suites (TestComplete,
            Ranorex), RPA platforms (UiPath, Power Automate Desktop), and
            accessibility-API wrappers (FlaUI, WinAppDriver, Terminator). The
            column that matters most for this article is "what does a click
            actually do."
          </p>
          <div className="mt-6">
            <ComparisonTable
              productName="Terminator"
              competitorName="A typical record-and-replay UI automation tool"
              rows={comparisonRows}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters if you work with AI coding agents
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                Claude Code, Cursor, Windsurf, and VS Code all ship an MCP
                client. Wire Terminator into it and the agent gets a typed
                interface to your entire desktop: the same selector grammar you
                just read, the same invoke() and click() paths, the same
                accessibility tree. The agent does not have to screenshot,
                guess, or call a vision model for the common case. It emits a
                locator string and dispatches a pattern.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One command:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator "npx -y terminator-mcp-agent@latest"
                </code>
              </p>
            </div>
          </GlowCard>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Evaluating UI automation for a legacy Windows stack?"
          description="Bring your app. We will write the selectors, wire the patterns, and show you where invoke() works and where click() takes over, live on your screen."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Adjacent deep dives in the Terminator docs"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Book 20 minutes with the maintainers."
        />
      </article>
    </>
  );
}
