import type { Metadata } from "next";
import {
  Breadcrumbs,
  FaqSection,
  FlowDiagram,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  MetricsRow,
  HorizontalStepper,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type StepperStep,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/ax-tree-vs-screenshot-computer-use-mac";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-12";
const TITLE =
  "AX tree vs screenshot for computer use on Mac: the choice is per-element, not per-task";
const DESCRIPTION =
  "On macOS, AX tree vs screenshot is not an architectural coin flip. Three quirks of the Mac Accessibility API (TreeWalker not traversing windows by default, system-wide focus behind a permission gate, Electron and Chromium webviews collapsing to one opaque AXGroup) make the right answer per-element. The agent should route per call: AX by default, vision when AX returns nothing useful. Terminator's vision_type router is exactly that shape.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The Mac AX-vs-screenshot decision broken at the API level. Three quirks of macOS AX that turn the simple answer into a per-call routing problem.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AX tree vs screenshot computer use on Mac: per-element, not per-task",
    description:
      "macOS AX has three quirks that flip the AX-vs-screenshot decision from architectural to per-call. Here is what they are and how to route around them.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "AX tree vs screenshot computer use (Mac)" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "AX tree vs screenshot computer use (Mac)", url: PAGE_URL },
];

const nativeAxSample = `# Native Cocoa surface (Notes.app, top-level document window)
# Output of AXUIElementCopyAttributeValue walked recursively.
# This is what the agent reads instead of a 2576px PNG.

AXWindow "Untitled" (focused)
  AXScrollArea
    AXTextArea  value: "Buy milk, eggs, sourdough"   focusable
  AXToolbar
    AXButton  title: "Share"     enabled
    AXButton  title: "Done"      enabled
    AXPopUpButton  title: "Format"  enabled
  AXSplitGroup
    AXOutline  title: "Folders"
      AXOutlineRow  title: "On My Mac"  selected
      AXOutlineRow  title: "iCloud"

# Every node has a role (AXButton, AXTextArea, AXOutlineRow), a stable
# accessible name (the title), a bounds rect, and a flag set. The model
# clicks by saying "AXButton title=Share" and the resolver calls
# AXUIElementPerformAction(elt, kAXPressAction). No pixels involved.
`;

const electronAxSample = `# Electron surface (Slack desktop app, channel view)
# Same recursive AX walk, same accessibility permission granted.
# This is what real Mac AX returns on a Chromium-rendered window.

AXWindow "Slack | #engineering | mediar"
  AXGroup
    AXGroup
      AXGroup
        AXGroup
          AXGroup  bounds: [0, 0, 1440, 900]
            AXStaticText  value: ""
            AXStaticText  value: ""

# Six nested AXGroups with no titles, no roles below "Group", and no
# bounds you can target. The send button is somewhere in there as a
# Chromium DOM node, but AX only sees the Skia paint tree. The tree
# is there, but it carries zero semantic information for the agent.
# This is the surface where you have to switch to screenshot+vision.
`;

const treeRoutingSteps = [
  { label: "Agent asks for window tree", icon: "browser" as const, detail: "Call get_window_tree on the focused app" },
  { label: "Native Cocoa? AX wins", icon: "check" as const, detail: "AXWindow with named children: click by role+title via kAXPressAction" },
  { label: "Electron or webview?", icon: "iframe" as const, detail: "Recursive AX walk returns nested AXGroups with no titles" },
  { label: "Route to vision fallback", icon: "redirect" as const, detail: "Call click_element with vision_type: Omniparser or Gemini" },
  { label: "Custom-painted canvas?", icon: "server" as const, detail: "One opaque AXGroup for entire surface: vision_type: Ocr or Gemini" },
];

const macQuirks = [
  {
    text: "Default TreeWalker does not traverse windows. The first line of crates/terminator/src/platforms/tree_search.rs in the Terminator repo is literally a TLDR comment about this: macOS AX gives you children of one window via kAXChildrenAttribute, but to see all an app's windows you have to read kAXWindowsAttribute from the app element and walk each one. Miss that and your agent thinks the app only has whatever window happens to be returned first.",
    checked: false,
  },
  {
    text: "System-wide focus is permission-gated. AXUIElementCreateSystemWide and kAXFocusedUIElementAttribute return kAXErrorAPIDisabled until your binary appears in System Settings, Privacy and Security, Accessibility, with the checkbox toggled on. The first run of any Mac AX agent fails silently here. You need AXIsProcessTrustedWithOptions on every cold start.",
    checked: false,
  },
  {
    text: "Electron and Chromium webviews collapse to AXGroup soup. Chromium speaks AX on Mac, but the bridge maps the DOM to a stack of nested AXGroups with no titles, no AXIdentifier, and no role information below Group. Slack, Discord, VS Code, Notion desktop, ChatGPT desktop, Claude desktop, Cursor: all of these return an unusable subtree even with permission granted.",
    checked: false,
  },
  {
    text: "Custom-painted surfaces are one opaque element. Games, Figma's canvas, Photoshop's document area, terminal emulators with GPU compositors, anything rendered through Metal or OpenGL: AX sees one AXGroup with the full window bounds. The tree is technically there, but there is nothing in it to click.",
    checked: false,
  },
  {
    text: "What you keep when AX works: deterministic targeting that survives DPI changes, dark mode, localization, and theme animations. Native Cocoa apps (Notes, Mail, Calendar, Reminders, System Settings, Finder, every AppKit and SwiftUI surface) expose role plus accessible name on every interactive element, and the click happens via kAXPressAction in microseconds with no model turn spent grounding from pixels.",
    checked: true,
  },
];

const sequenceActors = ["Agent", "MCP server", "macOS AX"];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "get_window_tree(pid: Slack)",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "AXUIElementCopyAttributeValue(...)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "AXGroup > AXGroup > AXGroup (empty)",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "tree: no actionable elements",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "click_element { vision_type: Omniparser, ... }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 0,
    label: "tool_result: clicked Send (vision-grounded)",
    type: "response" as const,
  },
];

const stepperSteps: StepperStep[] = [
  {
    title: "Grant accessibility permission",
    description: "AXIsProcessTrustedWithOptions on cold start; surface a setup screen if it returns false.",
  },
  {
    title: "Walk windows explicitly",
    description: "Read kAXWindowsAttribute from the app element. Do not rely on the default child walk.",
  },
  {
    title: "Try AX first",
    description: "If the subtree has at least one element with a named role below AXGroup, target it structurally.",
  },
  {
    title: "Fall back per call",
    description: "If AX returns AXGroup soup, the same click_element call switches to vision_type: Omniparser or Gemini.",
  },
];

const numbers = [
  { value: 5, label: "vision_type values in Terminator's MCP server (Ocr, Omniparser, UiTree, Dom, Gemini)" },
  { value: 1, label: "default vision_type on click_element: UiTree, set in utils.rs at get_vision_type" },
  { value: 320, label: "line in platforms/mod.rs where the workspace compile_error! still blocks non-Windows builds" },
  { value: 0, label: "screenshot bytes sent when AX has a named role and AXPress is supported" },
];

const faqs: FaqItem[] = [
  {
    q: "When should a Mac computer use agent prefer AX tree over screenshot?",
    a: "When the target subtree contains at least one element with a named role below AXGroup and a non-empty accessible name. That is roughly every native Cocoa surface: Notes, Mail, Calendar, Reminders, Finder, System Settings, every AppKit and SwiftUI app, plus Xcode and Office for Mac. On those surfaces, AX gives you role, title, bounds, and state in a few kilobytes of structured text per window, and the click happens via AXUIElementPerformAction with kAXPressAction in microseconds. The agent reads structured text instead of grounding from a 2576px PNG every turn.",
  },
  {
    q: "When should the same agent fall back to screenshot plus vision?",
    a: "Three real surfaces. First, Electron apps and Chromium-embedded webviews (Slack, Discord, VS Code, Notion, Cursor, ChatGPT desktop, Claude desktop): macOS Chromium maps the DOM to nested AXGroups with no titles, no AXIdentifier, and no role information. Even with full accessibility permission, the agent gets unactionable subtree shapes. Second, custom-painted surfaces: games rendered through Metal, Figma's canvas, Photoshop's document area, terminal emulators with GPU compositors. AX sees one opaque element with the window bounds and nothing inside. Third, image interpretation: any task where the user asks the agent to read a chart, an image embed, or visually compare two states. The tree does not carry that information.",
  },
  {
    q: "Is the right decision per-task or per-element?",
    a: "Per-element. A single task on Mac frequently spans both regimes: open Slack (Electron, vision), copy a message (vision), switch to Notes (AX), paste and save (AX). Routing at the task level forces you to use vision everywhere just because one surface in the task needed it, which is wasteful for the AX-friendly steps and slow for the agent loop. Routing at the call level keeps each tool invocation honest. Terminator exposes this as the vision_type parameter on click_element with five values (Ocr, Omniparser, UiTree, Dom, Gemini) that the agent selects per call, defaulting to UiTree when omitted. Source: crates/terminator-mcp-agent/src/utils.rs lines 1060 to 1073.",
  },
  {
    q: "What is the specific macOS AX quirk most agents miss?",
    a: "The default TreeWalker does not traverse windows. macOS AX returns children of one window when you read kAXChildrenAttribute on an app element, but a real Mac app frequently has several windows (the main window plus inspectors, palettes, modal sheets, preferences). To see them all you have to read kAXWindowsAttribute and walk each window separately. Terminator's repo has this written into its first comment: crates/terminator/src/platforms/tree_search.rs line 1 reads 'TLDR: default TreeWalker does not traverse windows, so we need to traverse windows manually.' The file ships a TreeWalkerWithWindows struct that enumerates kAXWindowsAttribute siblings and walks them all. If your agent uses an off-the-shelf accessibility crate without this workaround, you will silently miss elements in roughly half the apps your users open.",
  },
  {
    q: "Does Terminator ship a macOS binary today?",
    a: "Not yet. The Rust core has cross-platform scaffolding: AccessibilityEngine is shaped as a trait at crates/terminator/src/platforms/mod.rs line 86, the tree_search.rs file uses the accessibility-sys crate to walk AXUIElement trees, and several files (element.rs around line 1883, lib.rs around line 1567) have target_os = 'macos' code paths. But the same mod.rs ends at lines 318 to 320 with #[cfg(not(target_os = 'windows'))] compile_error!('Terminator only supports Windows. Linux and macOS are not supported.'). The published binaries on npm (terminator-mcp-agent) and pip (terminator-py) are Windows-only as of this writing. If you need this routing shape on Mac today, the architecture is here to copy: use atomacos or a pyobjc shim around AXUIElement for the AX path, wire OmniParser or Gemini for the vision path, and route per-call.",
  },
  {
    q: "Why is the screenshot path slower and more expensive on Mac specifically?",
    a: "Two reasons. First, Retina. A Mac on a 16-inch built-in display is 3456 by 2234 logical pixels, which is roughly 7.7 megapixels at native resolution and around 3 megapixels after Anthropic's 2576px long-edge downscale. Every screenshot is large, every encode round-trips through PNG, every upload spends real bandwidth. Second, the round-trip shape. Native Anthropic computer use is screenshot, act, screenshot, where the post-action screenshot is mandatory because the tool result for left_click does not echo state. Every action costs two round-trips and one vision pass. The AX path on Mac is one Mach call, one InvokePattern equivalent (AXUIElementPerformAction), and one optional tree re-read. The first runs in microseconds; the second runs in hundreds of milliseconds plus vision pricing.",
  },
  {
    q: "Does the AX tree get any of the visual context the screenshot does?",
    a: "Not for free, and the absences matter. The tree gives you role, name, bounds, value, and state. It does not give you color, font, image content, custom-drawn icons, or anything rendered into a canvas. If your agent task involves 'click the red button' or 'find the chart that is trending down' the tree is silent on the discriminator. Production agents handle this in two ways. The first is a small per-element vision call on demand: when the agent has a target named element in the AX tree but needs to disambiguate among several matches, it takes a cropped screenshot of the bounds and asks the vision model to pick. The second is the explicit vision_type fallback per call when no usable AX subtree exists. Both are cheaper than 'screenshot every turn' but recover the visual signal where the task needs it.",
  },
  {
    q: "What is the failure mode of 'AX everywhere' on a real Mac desktop?",
    a: "Three modes, in roughly the order users hit them. One: silent permission failure. AXUIElementCopyAttributeValue against another process returns kAXErrorAPIDisabled until your binary is in System Settings, Privacy and Security, Accessibility. A first-run agent that does not detect this with AXIsProcessTrustedWithOptions tells the model 'the app has no UI' and the loop dies confused. Two: window blindness. The default child walk misses non-main windows, so the agent thinks Calendar has no inspector or that Mail has no compose window. Three: Electron silence. The agent enters Slack and the tree is six nested AXGroups with no titles. The model emits 'click the Send button' and the resolver returns no matches, then synthesizes a click at coordinates the model invented from nothing. The fix in all three cases is the same: detect each failure shape and route to the vision_type fallback before the agent thinks the surface is empty.",
  },
  {
    q: "What is the failure mode of 'screenshot everywhere' on a real Mac desktop?",
    a: "The opposite shape. Every turn costs a screenshot, an encode, a vision pass, and a coordinate decision the model has to ground from raw pixels. Most native Mac surfaces are stable AX-friendly apps where the model spends its entire vision budget re-finding a button it could have looked up by role plus title for zero tokens. Latency stacks up too: a 100-action task at 2 seconds per action is 200 seconds of vision; the same task with AX routing on the native surfaces and vision routing on the two Electron surfaces is around 30 seconds. The model's accuracy also dips: a 5-pixel tooltip shift, a theme animation mid-capture, a transient hover state, all of these turn into 'click missed' on the screenshot path but never reach the AX path because the tree is theme-independent.",
  },
  {
    q: "What is the practical default for a new Mac agent project?",
    a: "AX-first with vision-fallback per call. Default every click and read to the AX tree. Detect the three failure shapes (permission denied, AXGroup soup, single opaque AXGroup) at the tool-router layer and switch to vision_type Omniparser or Gemini on those specific calls. Keep the same selector grammar on top so the agent code reads the same on both branches. The Terminator MCP server's click_element tool is shaped this way: it takes a selector, an optional vision_type, and runs the tree path by default. The agent gets to pick the grounding mechanism without restructuring the prompt or the tool surface.",
  },
];

const articleSchemaJson = articleSchema({
  url: PAGE_URL,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
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
    title: "Claude Opus 4.7 computer use, without the screenshots",
    excerpt:
      "The tree-diff alternative to computer_20251124. Every action returns the changed UI elements as compact YAML, so the model reads what happened without another screenshot.",
    href: "/alternative/claude-opus-4-7-computer-use-without-screenshots",
    tag: "Alternative",
  },
  {
    title: "macOS AX vs Windows UIA agent: where a Playwright-style trait leaks",
    excerpt:
      "AXUIElement and IUIAutomationElement under one Rust trait. Role names, action invocation, focused-element semantics: where the abstraction actually leaks.",
    href: "/alternative/macos-ax-vs-windows-uia-agent",
    tag: "Alternative",
  },
  {
    title: "Accessibility tree vs PyAutoGUI: structural versus pixel automation",
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
            Alternative / AX tree vs screenshot (Mac)
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            AX tree vs screenshot for computer use on Mac. The choice is per-element.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            Almost every comparison of these two approaches treats them as an architectural coin flip: pick one for the agent, run with it. On macOS that framing breaks in production because three specific quirks of the Mac Accessibility API silently flip the right answer on roughly half the surfaces a real desktop agent encounters in a typical user session. This page is about what those quirks are, why they make per-call routing the only honest shape, and what a router that handles all three looks like in code.
          </p>
        </header>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-12)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            Use the AX tree by default for native Cocoa surfaces (every AppKit and SwiftUI app: Notes, Mail, Calendar, Finder, System Settings, Xcode). Fall back to screenshot plus a vision model (OCR, OmniParser, or Gemini) per call when AX returns one opaque{" "}
            <code className="rounded bg-white px-1 text-orange-700">AXGroup</code>{" "}
            or six nested{" "}
            <code className="rounded bg-white px-1 text-orange-700">AXGroup</code>s with no titles, which is what Chromium-rendered apps (Slack, Discord, VS Code, Cursor, ChatGPT desktop, Claude desktop) and custom-painted canvases (Figma, Photoshop, games) actually return on Mac AX. The decision belongs at the call level, not the task level. Source for the routing shape:{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs"
            >
              crates/terminator-mcp-agent/src/utils.rs
            </a>{" "}
            lines 1060 to 1073, the{" "}
            <code className="rounded bg-white px-1 text-orange-700">VisionType</code>{" "}
            enum with five values defaulting to{" "}
            <code className="rounded bg-white px-1 text-orange-700">UiTree</code>.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Authoritative macOS AX reference:{" "}
            <a
              className="text-orange-600 underline"
              href="https://developer.apple.com/documentation/applicationservices/axuielement_h"
            >
              developer.apple.com/documentation/applicationservices/axuielement_h
            </a>
            . Terminator core (cross-platform trait, AX tree walker with window-traversal workaround):{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator"
            >
              github.com/mediar-ai/terminator
            </a>
            .
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The two regimes, on actual Mac surfaces
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The abstract comparison (faster, cheaper, more deterministic) is real but it hides what actually happens when you walk the tree on a Mac. Toggle to see the AX subtree two real apps return when your agent walks them with full accessibility permission granted. The first is a native Cocoa app and the tree is doing the job. The second is the Electron app a user opens five minutes later, with the same permission and the same walker, and the tree has nothing for the agent to grab.
          </p>
          <BeforeAfter
            title="Same AX walk, two surfaces"
            before={{
              label: "Native Cocoa: Notes.app",
              content: nativeAxSample,
              highlights: [
                "every node has a role below AXGroup",
                "accessible names are stable and localized correctly",
                "click by AXPress runs in microseconds",
              ],
            }}
            after={{
              label: "Electron: Slack",
              content: electronAxSample,
              highlights: [
                "six nested AXGroups, no titles, no AXIdentifier",
                "Chromium maps the DOM to Skia paint nodes, not AX",
                "the tree is technically there, but unactionable",
              ],
            }}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Three quirks the rhetoric does not mention
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The latency and token numbers you see quoted for AX-vs-screenshot (50ms vs 5s, kilobytes vs megabytes) are real but they assume the tree is there. On Mac specifically, three things change whether that assumption holds. Production agents fail in different ways at each of them, and the only honest fix is to detect the failure shape and route around it per call.
          </p>
          <AnimatedChecklist
            title="The macOS AX quirks every Mac agent project hits"
            items={macQuirks}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The quirk written into the source
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The first line of{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/tree_search.rs"
            >
              crates/terminator/src/platforms/tree_search.rs
            </a>{" "}
            in the Terminator repo is a TLDR comment about the most subtle of these:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`/// TLDR: default TreeWalker does not traverse windows,
/// so we need to traverse windows manually
use accessibility::{AXAttribute, AXUIElement, AXUIElementAttributes, Error};
// ...

pub struct TreeWalkerWithWindows {
    attr_children: AXAttribute<CFArray<AXUIElement>>,
    visited: RefCell<HashSet<AXUIElementWrapper>>,
    cycle_count: RefCell<usize>,
}`}
          </pre>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            That is a workaround for an OS API behavior. macOS AX gives you children of a single window when you read{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">kAXChildrenAttribute</code>{" "}
            on an app element, but most real Mac apps run with several windows alive at once: the main document, an inspector, a sheet, a preferences panel, a contextual palette. To see them all the walker has to read{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">kAXWindowsAttribute</code>{" "}
            on the app element and walk every window separately, then dedupe with a visited set because window children can reference each other. The default walker in any off-the-shelf accessibility crate does not do this. An agent built on top of it silently misses every interactive element that is not in the first window returned, and the model has no signal that anything is missing.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the kind of thing the rhetoric never names because it lives one level below "use the accessibility tree." But it is exactly the kind of failure that turns a Mac agent demo into something that does not work on a user's machine, where the user has Calendar open with the inspector and the agent looks at the wrong window for an hour.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The router, drawn
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Once you accept the routing is per-call, the architecture is a small piece of code at the tool layer of the MCP server. Every{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">click_element</code>{" "}
            invocation carries an optional{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">vision_type</code>{" "}
            parameter. When omitted, the server uses the AX tree. When the agent has seen an empty subtree or a single opaque AXGroup on the previous call, it sets{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">vision_type: &quot;omniparser&quot;</code>{" "}
            or{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">vision_type: &quot;gemini&quot;</code>{" "}
            and the same tool call runs through the vision path instead.
          </p>
          <FlowDiagram
            title="Per-element routing on a Mac agent step"
            steps={treeRoutingSteps}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The five values of{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">VisionType</code>{" "}
            in{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/utils.rs"
            >
              utils.rs
            </a>{" "}
            (lines 1060 to 1073) cover the realistic Mac surfaces:{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">UiTree</code>{" "}
            for AX,{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">Ocr</code>{" "}
            for surfaces where the only signal is rendered text (terminal, custom labels),{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">Omniparser</code>{" "}
            for general visual grounding when AX is empty,{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">Gemini</code>{" "}
            for vision-language grounding when OmniParser is not enough, and{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">Dom</code>{" "}
            for browser DOM when the agent has a webdriver attached. The default returned by{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">get_vision_type</code>{" "}
            (around line 834) is{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">UiTree</code>, which is the right default for any task that opens with a native Cocoa app.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What the switch looks like on the wire
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One round-trip walks the AX tree and finds nothing. The next call from the agent flips to vision_type Omniparser and the click happens. The model spent zero pixels on Notes a second earlier; it spends pixels here because here is where pixels are the only signal.
          </p>
          <SequenceDiagram
            title="Slack on Mac: AX returns nothing, agent falls back to Omniparser"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Wire it up on a fresh Mac agent
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four steps that hold whether you build on top of an existing framework or roll your own AX shim. The first one is the step that silently fails on day one if you skip it.
          </p>
          <HorizontalStepper title="AX-first, vision-fallback, per-call routing" steps={stepperSteps} />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            Terminator's published MCP server runs this shape today, but on Windows only:{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              npx -y terminator-mcp-agent@latest
            </code>{" "}
            ships a Windows binary, and the workspace mod.rs at line 320 still carries{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              compile_error!(&quot;Terminator only supports Windows...&quot;)
            </code>{" "}
            for the non-Windows targets. The macOS code paths exist in the repo (tree_search.rs, element.rs cfg blocks, the AccessibilityEngine trait at platforms/mod.rs line 86) but the binary is not yet shipping. If you need this routing on Mac today, the architecture is here to copy: read the AX shim files for the window-traversal logic, wire OmniParser or Gemini for the vision fallback, and keep the per-call switch at the tool-router layer.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">Numbers worth carrying</h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four small numbers from the source code, not benchmarks. They define the shape of the router and where the gaps still live.
          </p>
          <MetricsRow metrics={numbers} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why this matters more on Mac than on Windows
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Windows UIA is mature and covers WinUI, WPF, WinForms, MFC, and most major IDEs natively with{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">AutomationId</code>{" "}
            attributes that survive localization and theme changes. The AX-everywhere default works for the majority of Windows surfaces. Mac is the opposite shape. Native Cocoa apps are well-covered by AX, but the user spends half their day in Chromium-rendered Electron apps (Slack, Discord, VS Code, Cursor, ChatGPT desktop, Claude desktop, Notion, Linear, Figma's app shell, Spotify), and Chromium on Mac maps the DOM to AXGroup soup. The AX-everywhere default is wrong for that half. Routing per call is not a fancy optimization; it is the only way to keep the agent useful across the apps a user actually opens.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Building a Mac computer use agent and tired of AXGroup soup?"
          description="30 minutes. Walk through your agent loop, see where the per-call routing buys you the most, leave with a concrete next step."
        />

        <FaqSection
          heading="Questions about AX tree vs screenshot for Mac computer use"
          items={faqs}
        />

        <RelatedPostsGrid
          title="Adjacent reads"
          subtitle="Specific deep dives into the same stack"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Stop guessing where AX is the right call. Book a 30-minute working session."
      />
    </article>
  );
}
