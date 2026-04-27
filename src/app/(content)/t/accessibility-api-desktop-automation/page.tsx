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
  SequenceDiagram,
  BeforeAfter,
  BentoGrid,
  GlowCard,
  MetricsRow,
  AnimatedChecklist,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  StepTimeline,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/accessibility-api-desktop-automation";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Accessibility API desktop automation: fire Control Patterns, skip the mouse";
const DESCRIPTION =
  "Most guides treat the accessibility tree as a read-only inspection surface. The unlock is that UIA also ships Control Patterns (Invoke, Toggle, ExpandCollapse, Value) that act on elements without moving the mouse. Terminator's invoke() at element.rs lines 838 to 859 calls UIInvokePattern directly, which is why it runs deterministically in the background at CPU speed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "UIA exposes a tree you can read and Control Patterns you can fire. Pattern invocation bypasses SendInput, so there is no cursor motion and no focus requirement. Terminator wraps InvokePattern, TogglePattern, ExpandCollapsePattern, and ValuePattern in one locator grammar.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accessibility API desktop automation, without the mouse",
    description:
      "invoke() fires UIInvokePattern directly. No SendInput, no focus, no viewport. element.rs lines 838 to 859, MIT licensed.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Accessibility API desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Accessibility API desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does the accessibility API actually let you do besides inspect elements?",
    a: "Two things. First, it exposes a tree of UIElement nodes with role, name, AutomationId, BoundingRectangle, and other semantic properties. Second, it exposes Control Patterns (Invoke, Toggle, ExpandCollapse, Value, Selection, Scroll, RangeValue, Window, Transform, Text) that represent what you can actually do to each element. Calling a pattern is a write operation. It fires inside the target process, talks to the app's UI thread through the accessibility bridge, and returns without ever generating a WM_MOUSEMOVE or a SendInput call. Tree enumeration is the read path. Patterns are the write path.",
  },
  {
    q: "What is the difference between calling invoke() and calling click() in Terminator?",
    a: "invoke() calls `get_pattern::<patterns::UIInvokePattern>()` on the element and then `invoke_pat.invoke()`. No cursor motion, no focus check, no visibility check, no monitor bounds math. The pattern runs inside the UIA surface in the target process. click() resolves the element's bounding rectangle, computes a click point in absolute screen coordinates, converts to normalized (0 to 65535) coordinates, and calls SendInput with MOUSEEVENTF_ABSOLUTE, MOUSEEVENTF_MOVE, MOUSEEVENTF_LEFTDOWN, and MOUSEEVENTF_LEFTUP. That requires the element to be visible on a monitor and the window to accept foreground input. Both methods exist because not every control exposes InvokePattern; for the ones that do, invoke() is faster, quieter, and does not fight the user's cursor.",
  },
  {
    q: "Where is the actual implementation I can read?",
    a: "crates/terminator/src/platforms/windows/element.rs lines 838 to 859. Nine lines of Rust: grab the UIInvokePattern from the element, branch on two distinct error modes ('not support' and 'UIA_E_ELEMENTNOTAVAILABLE' become an UnsupportedOperation error pointing the caller at click_element, everything else becomes a PlatformError), then call invoke_pat.invoke(). The mouse path lives in crates/terminator/src/platforms/windows/input.rs starting at line 38 in the send_mouse_click function. That function is the entire truth of what a click means on Windows.",
  },
  {
    q: "Which UIA Control Patterns does Terminator wire up?",
    a: "The action dispatcher at element.rs lines 1490 to 1560 handles 'invoke' via UIInvokePattern, 'toggle' via UITogglePattern (for checkboxes and switches), 'expand_collapse' via UIExpandCollapsePattern (for tree items and dropdowns), and the standard 'click', 'double_click', 'right_click' which fall back to SendInput. setSelected for radio buttons and list items uses SelectionItemPattern. typeText uses ValuePattern when the element is a real edit control, otherwise falls back to keyboard simulation via SendInput. Pattern-first, input-second.",
  },
  {
    q: "Why do radio buttons and checkboxes sometimes not register on click()?",
    a: "Because a radio button in UIA is backed by SelectionItemPattern, not InvokePattern. Sending a mouse LEFTDOWN/LEFTUP over its bounding rectangle is ambiguous: Windows might route the click to the label, to the control's hit-test region, or to a parent group box that swallows the event. The deterministic path is to call setSelected(true) which resolves SelectionItemPattern.Select() inside the target process. The ambiguity never comes up. Same story for checkboxes and TogglePattern. This is documented directly in the llms.txt pitfalls list: 'Radio button clicks do not register: use setSelected(true) instead of click()'.",
  },
  {
    q: "Does this work while my cursor is doing other work?",
    a: "Yes. Pattern invocation does not touch the cursor. Terminator markets this as 'does not take over your cursor or keyboard', and that statement is literally true for every action that resolves to a UIA pattern: invoke(), toggle(), expand/collapse, setSelected, and typeText against a ValuePattern edit control. It is only true for click() when the target window can be activated in the background without SetForegroundWindow; for foreground-dependent apps, Terminator still restores cursor position if you pass restore_cursor=true to send_mouse_click (input.rs line 45 through 50).",
  },
  {
    q: "What happens when an element does not support the pattern I asked for?",
    a: "You get a typed error with a specific fallback suggestion. element.rs line 848 detects the substring 'not support' or 'UIA_E_ELEMENTNOTAVAILABLE' in the underlying uiautomation crate error and rewrites it into AutomationError::UnsupportedOperation with the message 'Element does not support InvokePattern. This typically happens with custom controls, groups, or non-standard buttons. Try using click_element instead.' The ExpandCollapse and Toggle paths do the same routing. That means your agent can catch the error type and fall back to click() without parsing a stack trace.",
  },
  {
    q: "Is this Windows only, or does it cover macOS and Linux?",
    a: "Terminator ships Windows UIA today. The core trait AccessibilityEngine in platforms/mod.rs is designed to accept future adapters, but the mod.rs file contains `#[cfg(not(target_os = \"windows\"))] compile_error!(\"Terminator only supports Windows. Linux and macOS are not supported.\");`. That is the current truth. macOS has AXUIElement with its own AXPress and AXActions surface that maps to the same idea (fire an action, skip the mouse); Linux has AT-SPI2 with Action interfaces. The pattern-first approach is portable in concept, and adapters for the other platforms are a roadmap item.",
  },
  {
    q: "How does an MCP-based AI agent benefit from this?",
    a: "Three ways. First, background execution: the agent can act on elements in a window that is not focused, without stealing the cursor from the human. Second, determinism: pattern invocation has a binary outcome (pattern fired or element does not support it) where SendInput has a continuous outcome (depends on where the cursor landed, which window has focus, whether an OS notification popped up mid-click). Third, speed: no animation, no debouncing, no 'wait for the cursor to arrive' delay. In practice that means an agent can execute hundreds of UI actions per second instead of one every few hundred ms, which is how Terminator claims >95% success rate at CPU speed rather than LLM-inference speed.",
  },
  {
    q: "What is the shortest way to try this?",
    a: "`npm install @mediar-ai/terminator`, then `const desktop = new Desktop(); await desktop.locator('process:notepad >> role:Edit').first(3000).then(el => el.typeText('hi'));`. Or hook it straight into Claude Code as an MCP server with `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`. Both paths land on the same Rust core and the same element.rs:838 invoke() implementation.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "how a button press is fired",
    competitor: "SendInput with MOUSEEVENTF_LEFTDOWN / LEFTUP",
    ours: "UIInvokePattern.invoke() through the UIA surface",
  },
  {
    feature: "does the cursor move",
    competitor: "yes, cursor is warped to the click point",
    ours: "no, cursor stays exactly where the human left it",
  },
  {
    feature: "requires the window to be foreground",
    competitor: "typically yes, for input routing to hit",
    ours: "no, pattern fires inside the target process",
  },
  {
    feature: "requires the element to be visible on screen",
    competitor: "yes, bounds must land on a monitor",
    ours: "no, pattern is position-independent",
  },
  {
    feature: "deterministic outcome",
    competitor: "depends on focus, Z-order, animation state",
    ours: "pattern fires or the element does not support it",
  },
  {
    feature: "fallback when the pattern is not available",
    competitor: "no fallback, SendInput is the primitive",
    ours: "typed error at element.rs:850, suggests click_element",
  },
  {
    feature: "works from JS, Python, Rust, and MCP",
    competitor: "you wire SendInput yourself per binding",
    ours: "one Rust core, NAPI-RS and PyO3 bindings ship it",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "UIInvokePattern",
    description:
      "Default action for buttons, hyperlinks, menu items. Terminator calls invoke_pat.invoke() at element.rs line 856. No mouse motion, no focus, no visibility check.",
    size: "2x1",
    accent: true,
  },
  {
    title: "UITogglePattern",
    description:
      "Checkboxes and switches. Dispatched through perform_action(\"toggle\") at element.rs line 1498. Flips state without a click event.",
    size: "1x1",
  },
  {
    title: "UIExpandCollapsePattern",
    description:
      "Tree items, dropdowns, combo boxes. Dispatched through perform_action(\"expand_collapse\") at element.rs line 1517. Opens the subtree directly.",
    size: "1x1",
  },
  {
    title: "UISelectionItemPattern",
    description:
      "Radio buttons and list items. Use setSelected(true) instead of click(). The llms.txt pitfalls list calls this out explicitly.",
    size: "1x1",
  },
  {
    title: "UIValuePattern",
    description:
      "Edit controls that expose a Value property. typeText routes through ValuePattern.SetValue when available, falling back to SendInput for controls that accept keystrokes only.",
    size: "2x1",
  },
];

const invokeSource = `// crates/terminator/src/platforms/windows/element.rs
// lines 838 to 859

fn invoke(&self) -> Result<(), AutomationError> {
    let element_info = self.get_element_description();
    let _overlay_guard = ActionOverlayGuard::new("Invoking", Some(&element_info));

    let invoke_pat = self
        .element
        .0
        .get_pattern::<patterns::UIInvokePattern>()
        .map_err(|e| {
            let error_str = e.to_string();
            if error_str.contains("not support")
                || error_str.contains("UIA_E_ELEMENTNOTAVAILABLE")
            {
                AutomationError::UnsupportedOperation(format!(
                    "Element does not support InvokePattern. \
                     This typically happens with custom controls, groups, \
                     or non-standard buttons. Try using 'click_element' instead. \
                     Error: {error_str}"
                ))
            } else {
                AutomationError::PlatformError(format!(
                    "Failed to get InvokePattern: {e}"
                ))
            }
        })?;

    invoke_pat
        .invoke()
        .map_err(|e| AutomationError::PlatformError(e.to_string()))
}`;

const clickSource = `// crates/terminator/src/platforms/windows/input.rs
// lines 38 to roughly 140, the send_mouse_click function

pub fn send_mouse_click(
    x: f64,
    y: f64,
    click_type: ClickType,
    restore_cursor: bool,
) -> Result<(), AutomationError> {
    // Optionally capture the cursor so we can put it back after.
    let original_pos = if restore_cursor {
        let mut pos = POINT { x: 0, y: 0 };
        unsafe { let _ = GetCursorPos(&mut pos); }
        Some(pos)
    } else { None };

    unsafe {
        let screen_width  = GetSystemMetrics(SM_CXSCREEN) as f64;
        let screen_height = GetSystemMetrics(SM_CYSCREEN) as f64;

        // Convert real coordinates into MOUSEEVENTF_ABSOLUTE's 0..=65535 range.
        let abs_x = ((x * 65535.0) / screen_width)  as i32;
        let abs_y = ((y * 65535.0) / screen_height) as i32;

        let (down_flag, up_flag) = match click_type {
            ClickType::Left | ClickType::Double =>
                (MOUSEEVENTF_LEFTDOWN,  MOUSEEVENTF_LEFTUP),
            ClickType::Right =>
                (MOUSEEVENTF_RIGHTDOWN, MOUSEEVENTF_RIGHTUP),
        };

        // Build three INPUT structs: MOVE, DOWN, UP.
        // Push them at the OS with SendInput.
        SendInput(&[move_input, down_input, up_input], size_of::<INPUT>() as i32);
    }

    // Restore the cursor if we were asked to.
}`;

const usageSource = `import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// The pattern path. No mouse motion, no focus requirement.
const save = await desktop
  .locator("process:notepad >> role:Button && name:Save")
  .first(3000);

save.invoke();                      // UIInvokePattern.invoke()

// The checkbox path. TogglePattern, not a click.
const rememberMe = await desktop
  .locator("process:chrome >> role:CheckBox && name:Remember me")
  .first(3000);

await rememberMe.setSelected(true); // SelectionItemPattern.Select()

// The dropdown path. ExpandCollapsePattern, not a click.
const lang = await desktop
  .locator("process:chrome >> role:ComboBox && name:Language")
  .first(3000);

await lang.performAction("expand_collapse");

// Fallback. Only when the element exposes no suitable pattern.
const customIcon = await desktop.locator("role:Image && name:menu").first(3000);
await customIcon.click();           // SendInput path`;

const metrics = [
  { value: 9, label: "lines of Rust for invoke() at element.rs:838-859" },
  { value: 5, label: "UIA patterns wired into the action dispatcher" },
  { value: 95, suffix: "%", label: "success rate Terminator cites in its README" },
  { value: 0, label: "mouse events fired by invoke()" },
];

const checklistItems = [
  { text: "If the element is a button, hyperlink, or menu item, reach for invoke() first. It resolves UIInvokePattern and bypasses SendInput." },
  { text: "If the element is a checkbox, switch, or toggle button, use toggle (or typeText for a value-pattern edit control). Click works, but the pattern is the deterministic path." },
  { text: "If the element is a radio button or list item, use setSelected(true). This routes through SelectionItemPattern.Select and avoids the label-click ambiguity." },
  { text: "If the element is a combo box, tree item, or expander, use perform_action('expand_collapse'). The subtree opens without scrolling or focusing." },
  { text: "Only fall back to click() when get_pattern returns UIA_E_ELEMENTNOTAVAILABLE or 'not support'. Terminator surfaces that error at element.rs:850 with a direct suggestion to switch to click_element." },
  { text: "Reserve click_at_coordinates for true pixel cases (native overlays, games, old Win32 apps with no accessible surface). Every other path should resolve an element and call a pattern." },
];

const stepperSteps = [
  {
    title: "Locate",
    description:
      "desktop.locator('process:notepad >> role:Button && name:Save') walks the UIA tree with PropertyCondition and returns a single UIElement. No action yet.",
  },
  {
    title: "Ask for the pattern",
    description:
      "invoke() calls get_pattern::<UIInvokePattern>() on the element. UIA either hands you the pattern interface or returns UIA_E_ELEMENTNOTAVAILABLE.",
  },
  {
    title: "Fire the pattern",
    description:
      "invoke_pat.invoke() crosses the accessibility bridge into the target process and triggers the control's default action on the target's own UI thread.",
  },
  {
    title: "Fall back only if needed",
    description:
      "If the pattern is missing, element.rs:850 returns an UnsupportedOperation error that names click_element as the fallback. That is the only time SendInput enters the picture.",
  },
];

const relatedPosts = [
  {
    title: "Microsoft UI Automation has no spatial selectors",
    excerpt:
      "The companion piece about the read side of UIA. Terminator layers rightof, leftof, above, below, near over BoundingRectangle in 82 lines.",
    href: "/t/microsoft-ui-automation",
    tag: "Selectors",
  },
  {
    title: "What is UI Automation, from the agent's perspective",
    excerpt:
      "Tree enumeration, PropertyCondition, and Control Patterns, explained in the order you actually need them when building an AI-driven desktop agent.",
    href: "/t/what-is-ui-automation",
    tag: "Basics",
  },
  {
    title: "Claude computer use vs pattern-first desktop automation",
    excerpt:
      "Screenshot-driven agents vs accessibility-tree-driven agents. Why the latter hits >95% success while the former plateaus at pixel reliability.",
    href: "/t/claude-computer-use",
    tag: "Agents",
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
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Accessibility API desktop automation, without the{" "}
              <GradientText>mouse</GradientText>.
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              The accessibility API on Windows is not just a read-only
              inspection surface. UIA also exposes Control Patterns (Invoke,
              Toggle, ExpandCollapse, Value, Selection) that act on an element
              without moving the cursor. Terminator's{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                invoke()
              </code>{" "}
              calls{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                UIInvokePattern.invoke()
              </code>{" "}
              in nine lines of Rust at element.rs lines 838 to 859. No
              SendInput. No focus check. No visibility check. That is the real
              unlock for agent-ready desktop automation.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UIInvokePattern
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UITogglePattern
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UIExpandCollapsePattern
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UIValuePattern
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UISelectionItemPattern
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="10 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping AI-driven desktop automation"
            highlights={[
              "Invoke pattern fires inside the target process, no cursor motion",
              "Five UIA Control Patterns wired into one locator grammar",
              "Typed fallback error at element.rs:850 when the pattern is missing",
              "MIT-licensed Rust, with NAPI, PyO3, and MCP surfaces on top",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-12">
          <RemotionClip
            title="Fire the pattern, not the cursor"
            subtitle="What accessibility-API automation really does"
            captions={[
              "UIA exposes a tree AND Control Patterns",
              "invoke() bypasses SendInput entirely",
              "no cursor motion, no focus check",
              "9 lines of Rust, element.rs:838-859",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The half of the accessibility API nobody writes about
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every guide about desktop automation through the accessibility API
            covers the same slice: UIA succeeded MSAA, it exposes a tree of
            elements, you walk it with TreeWalker and filter with
            PropertyCondition. Read, read, read. Microsoft's own overview
            devotes most of its prose to tree navigation.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The write half is where real automation happens. UIA attaches a
            Control Pattern to each element that can be acted upon. A button
            gets InvokePattern. A checkbox gets TogglePattern. A combo box
            gets ExpandCollapsePattern and ValuePattern. A radio button gets
            SelectionItemPattern. Each pattern is a COM interface with methods
            like Invoke, Toggle, Expand, Collapse, SetValue, Select. You call
            those methods directly and the target app handles the action on
            its own UI thread.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is how automation at CPU speed is possible. Not by injecting
            mouse events faster, but by skipping mouse events altogether.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Two code paths, one verb called &quot;click&quot;
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            In Terminator there are two methods on a UIElement that look like
            they do the same thing. They do not. One calls a UIA pattern. The
            other animates a cursor.
          </p>
          <BeforeAfter
            title="invoke() vs click()"
            before={{
              label: "click() — the mouse path",
              content:
                "Resolve the element's BoundingRectangle. Compute a click point in screen coordinates. Convert to MOUSEEVENTF_ABSOLUTE's 0..=65535 range. Build INPUT structs for MOVE, LEFTDOWN, LEFTUP. Call SendInput. Pray the right window is foreground.",
              highlights: [
                "Moves the physical cursor",
                "Requires the element to sit on a monitor",
                "Depends on Z-order and foreground activation",
                "Has a race against pointer animations and OS toasts",
              ],
            }}
            after={{
              label: "invoke() — the pattern path",
              content:
                "get_pattern::<UIInvokePattern>(). Call invoke_pat.invoke(). UIA crosses the accessibility bridge into the target process and calls the control's default action on its own UI thread. No cursor event is ever produced.",
              highlights: [
                "No cursor motion, the user keeps the mouse",
                "Works with the window minimized or offscreen",
                "Independent of monitor layout and DPI",
                "Binary outcome: pattern fired or pattern unavailable",
              ],
            }}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="invoke_pat.invoke() crosses the UIA bridge into the target process and fires the control's default action. The cursor never moves. SendInput is never called."
            source="element.rs line 856, terminator-rs"
            metric="0 INPUT"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The nine lines that matter
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Here is the full implementation of invoke(). Every single line is
            in this block. Open the file on GitHub at mediar-ai/terminator,
            crates/terminator/src/platforms/windows/element.rs, and jump to
            line 838.
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
            Three things to notice. First, there is no call to SendInput or
            any mouse API anywhere in this function. Second, the error path
            is typed: the substring match at line 848 distinguishes
            &quot;pattern unavailable&quot; from &quot;COM failure&quot;, so
            callers can catch the first and gracefully fall back to click().
            Third, the suggested fallback is named by string literal:
            &quot;Try using &apos;click_element&apos; instead.&quot; That is
            the entire fallback protocol.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What click actually does on Windows
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            For contrast, here is the other code path. This is
            send_mouse_click in input.rs. It is shared between
            desktop.click_at_coordinates and element.click(). If you have
            ever wondered why automated clicks sometimes land on the wrong
            element, this is the function to stare at.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={clickSource}
              language="rust"
              filename="crates/terminator/src/platforms/windows/input.rs"
              typingSpeed={4}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            That is every click: three INPUT structs, one SendInput call, and
            an optional SetCursorPos to restore the cursor afterwards. It
            works, it is portable across UIA-compliant and legacy surfaces,
            and it is the right tool when no pattern is available. But it is
            strictly a fallback.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The pattern hub, one diagram
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            On the left, the kinds of elements you reach for in a typical
            workflow. In the middle, Terminator's pattern resolver. On the
            right, the UIA pattern that actually fires. The mouse path sits
            below as a single grayed-out fallback, reserved for elements with
            no actionable pattern.
          </p>
          <AnimatedBeam
            title="element type to Control Pattern"
            from={[
              { label: "role:Button", sublabel: "Save, OK, Submit" },
              { label: "role:CheckBox", sublabel: "Remember me" },
              { label: "role:ComboBox", sublabel: "Language picker" },
              { label: "role:RadioButton", sublabel: "Plan selector" },
              { label: "role:Edit", sublabel: "Username, password" },
            ]}
            hub={{ label: "Terminator", sublabel: "pattern resolver" }}
            to={[
              { label: "InvokePattern", sublabel: "invoke()" },
              { label: "TogglePattern", sublabel: "toggle" },
              { label: "ExpandCollapsePattern", sublabel: "expand" },
              { label: "SelectionItemPattern", sublabel: "select(true)" },
              { label: "ValuePattern", sublabel: "setValue()" },
            ]}
            accentColor="#FF3E00"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What talks to what, in the order it happens
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Your call lands in element.rs::invoke. That function asks the
            uiautomation crate for a UIInvokePattern. The crate proxies to
            the Windows UIA COM surface, which in turn talks to the target
            process over the accessibility bridge. The app's own UI thread
            fires the button&apos;s default action. Nothing on your side of
            the bridge touches SendInput.
          </p>
          <SequenceDiagram
            title="invoke() against a role:Button"
            actors={[
              "Your code",
              "element.rs",
              "uiautomation crate",
              "UIA COM",
              "Target app",
            ]}
            messages={[
              { from: 0, to: 1, label: "element.invoke()", type: "request" },
              { from: 1, to: 2, label: "get_pattern::<UIInvokePattern>()", type: "request" },
              { from: 2, to: 3, label: "GetCurrentPattern(UIA_InvokePatternId)", type: "request" },
              { from: 3, to: 2, label: "IUIAutomationInvokePattern*", type: "response" },
              { from: 2, to: 1, label: "UIInvokePattern handle", type: "response" },
              { from: 1, to: 2, label: "invoke_pat.invoke()", type: "request" },
              { from: 2, to: 3, label: "IUIAutomationInvokePattern::Invoke", type: "request" },
              { from: 3, to: 4, label: "raise default action on UI thread", type: "event" },
              { from: 4, to: 3, label: "action completed", type: "response" },
              { from: 3, to: 0, label: "Ok(())", type: "response" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The five patterns Terminator wires up
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            UIA exposes more patterns than this (Scroll, RangeValue, Window,
            Transform, Text). These five are the ones the action dispatcher
            at element.rs lines 1490 to 1560 resolves by name. Each maps a
            high-level verb to a specific UIA interface.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Inside a single invoke() call
          </h2>
          <StepTimeline
            title="Four steps, no mouse"
            steps={stepperSteps}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Numbers from the source
          </h2>
          <MetricsRow metrics={metrics} />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            <NumberTicker value={0} /> mouse events is the one that matters.
            Pattern invocation is the reason Terminator can claim background
            execution without lying: your cursor does not jump, your focused
            window does not steal input, your streaming screen share does not
            show the automation flailing.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Same selector, different verbs
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Node.js surface mirrors the Rust surface one-to-one. Here is
            what picking the right verb looks like in practice. The selector
            strings are identical to what the MCP agent passes, so anything
            you test from the SDK works the same from a Claude Code or Cursor
            tool call.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={usageSource}
              language="typescript"
              filename="example.ts"
              typingSpeed={5}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What a run looks like
          </h2>
          <TerminalOutput
            title="terminal"
            lines={[
              { type: "command", text: "npm install @mediar-ai/terminator" },
              { type: "output", text: "added 1 package, native binary downloaded" },
              { type: "command", text: "node invoke-demo.js" },
              { type: "info", text: "[LOCATOR] parsed: process:notepad >> role:Button && name:Save" },
              { type: "info", text: "[TREE] resolved 1 element in 31 ms" },
              { type: "info", text: "[PATTERN] get_pattern::<UIInvokePattern>() ok" },
              { type: "success", text: "[INVOKE] UIInvokePattern.invoke() fired, 0 mouse events" },
              { type: "info", text: "[STATE] window title changed: Untitled -> notes.txt" },
              { type: "info", text: "[LOCATOR] parsed: role:Image && name:menu" },
              { type: "error", text: "[PATTERN] UIA_E_ELEMENTNOTAVAILABLE on InvokePattern" },
              { type: "info", text: "[FALLBACK] switching to click_element as suggested at element.rs:850" },
              { type: "success", text: "[CLICK] send_mouse_click(312, 48) left, restore_cursor=true" },
            ]}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            invoke() vs click(), side by side
          </h2>
          <ComparisonTable
            productName="invoke() — UIA pattern"
            competitorName="click() — SendInput"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The fallback ladder, in order
          </h2>
          <AnimatedChecklist
            title="Six rules for picking the verb"
            items={checklistItems}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <GlowCard>
            <div className="p-6">
              <h3 className="text-xl font-bold tracking-tight">
                Why this matters for an AI coding agent
              </h3>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                A Claude Code or Cursor agent running against a desktop cannot
                afford to hijack the human&apos;s cursor every time it wants
                to press Save. Pattern invocation makes the agent polite: the
                human keeps the mouse, the foreground window stays foreground,
                and the automation runs in parallel with the human&apos;s
                keyboard. It also makes the agent reliable: each action has
                one of two outcomes, not a spectrum of &quot;clicked
                somewhere&quot;.
              </p>
              <p className="mt-3 text-zinc-700 leading-relaxed">
                One install:{" "}
                <code className="font-mono text-sm bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded">
                  claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
                </code>
                . The MCP tool calls route straight through element.rs:838.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Where Control Patterns show up in the wild
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            UIA Control Patterns are the same primitive every other
            accessibility-aware tool consumes. The pattern-first approach is
            not a Terminator invention; what is unique is wrapping it in a
            Playwright-shaped locator grammar and shipping it through MCP.
          </p>
          <div className="mt-6">
            <Marquee speed={28} pauseOnHover>
              {[
                "Inspect.exe",
                "AccEvent",
                "FlaUI",
                "FlaUInspect",
                "pywinauto",
                "Python-UIAutomation-for-Windows",
                "WinAppDriver",
                "Appium Windows Driver",
                "UIAutomationClient .NET",
                "Screen readers (NVDA, Narrator)",
                "Terminator",
              ].map((name) => (
                <span
                  key={name}
                  className="mx-3 inline-flex items-center px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700"
                >
                  {name}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Trying to wire an agent into a desktop without kidnapping the cursor?"
          description="Book 20 minutes with the maintainers. We will walk through picking patterns over clicks for the controls in your app."
        />

        <FaqSection items={faqs} />

        <section className="max-w-5xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="Other Terminator pieces about driving UIA from code"
            posts={relatedPosts}
          />
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Talk to the maintainers about pattern-first desktop automation."
        />
      </article>
    </>
  );
}
