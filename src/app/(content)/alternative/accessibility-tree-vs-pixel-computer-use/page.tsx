import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  HorizontalStepper,
  ProofBanner,
  MetricsRow,
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
  "https://t8r.tech/alternative/accessibility-tree-vs-pixel-computer-use";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-15";
const MODIFIED = "2026-05-18";
const TITLE =
  "Accessibility tree vs pixel for computer use: the framing is wrong";
const DESCRIPTION =
  "Almost every comparison treats accessibility tree and pixel-based computer use as a binary choice. In production agents the choice is per-region, not per-task or per-agent. Terminator's MCP server merges UIA tree, DOM, OCR, OmniParser, and Gemini detections into one spatially-clustered list keyed by source prefix (#u1, #d1, #o1, #p1, #g1) so the model sees every signal about the same screen region in one tool result. Source: crates/terminator/src/tree_formatter.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "The accessibility tree vs pixel debate misses the production answer. Real agents need a spatial cluster that merges both signals. Here is the mechanism, drawn from one open-source repo's tree_formatter.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Accessibility tree vs pixel for computer use is a false dichotomy",
    description:
      "Five element sources, one union-find clustering pass, one prefixed index the model clicks by. Here is what an honest production agent loop actually looks like.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "Accessibility tree vs pixel computer use" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "Accessibility tree vs pixel computer use", url: PAGE_URL },
];

const treeOnlySample = `# What the model sees when you only ship the UIA / AX tree.
# Slack desktop, channel view, full accessibility permission granted.
# Output of get_window_tree formatted as compact YAML.

AXWindow "Slack | #engineering | mediar"
  AXGroup
    AXGroup
      AXGroup
        AXGroup
          AXGroup  bounds: [0, 0, 1440, 900]
            AXStaticText  value: ""

# The tree is technically there, but Chromium maps the DOM to a stack
# of nested AXGroups with no titles, no AXIdentifier, no role information
# below "Group". The "Send" button is in there somewhere, but there is
# nothing in this tree for the model to target. It will hallucinate a
# coordinate, miss, and the loop will get stuck.`;

const clusteredSample = `# Same Slack window, same MCP call, but the server clustered
# the UIA snapshot, the OmniParser run, and the OCR pass by
# spatial bounds. Each element keeps its source prefix.
# Source: terminator/src/tree_formatter.rs lines 545-650.

# Cluster @(1376, 832)
- [Button] #u12 "Send" (bounds: [1376, 832, 36, 36])
- [icon]   #p7         (bounds: [1378, 834, 32, 32])
- [OcrWord] #o4 "Send" (bounds: [1380, 836, 28, 28])

# Cluster @(120, 720)
- [Edit]   #u9 "Message #engineering" (bounds: [120, 720, 1200, 80])
- [input]  #p4                          (bounds: [120, 720, 1200, 80])

# The model clicks #u12 if it trusts the tree.
# It clicks #p7 if the tree was empty here.
# Same selector grammar, same response shape, one tool call.`;

const sequenceActors = ["Agent", "MCP server", "UIA / AX", "Vision backend"];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "get_window_tree { include_vision: true }",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "snapshot UIA tree",
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "snapshot screen, parse",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "uia_bounds (HashMap)",
    type: "response" as const,
  },
  {
    from: 3,
    to: 1,
    label: "omniparser_items + vision_items",
    type: "response" as const,
  },
  {
    from: 1,
    to: 1,
    label: "format_clustered_tree_from_caches(...)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 0,
    label: "clustered_tree { #u1, #p1, #o1, ... }",
    type: "response" as const,
  },
  {
    from: 0,
    to: 1,
    label: "click_index { index: 'u12' }",
    type: "request" as const,
  },
];

const stepperSteps: StepperStep[] = [
  {
    title: "Native desktop apps",
    description:
      "Notes, Mail, Finder, Calendar, File Explorer, Settings, Office, Xcode. AX/UIA returns clean role+name on every interactive element. Tree wins.",
  },
  {
    title: "Browsers with the CDP attached",
    description:
      "Chrome, Edge, Brave. DOM tag+id beats both. #d prefix indexes the real DOM nodes, not the AXGroup wrapper.",
  },
  {
    title: "Electron and Chromium apps",
    description:
      "Slack, Discord, VS Code, Cursor, Notion. AX collapses to AXGroup soup. Pixel detectors (#p OmniParser, #o OCR) carry the signal.",
  },
  {
    title: "Custom-painted canvases",
    description:
      "Figma, Photoshop, games, terminal emulators with GPU compositors. One opaque AXGroup. Gemini grounding (#g) for visual-language tasks.",
  },
];

const metrics = [
  {
    value: 5,
    label: "element sources clustered into one list (Uia, Dom, Ocr, Omniparser, Gemini)",
  },
  {
    value: 1.5,
    decimals: 1,
    suffix: "x",
    label: "smaller-dimension threshold for spatial clustering (should_cluster)",
  },
  {
    value: 25,
    label: "selector kinds the engine still parses on top of the clustered output",
  },
  {
    value: 1,
    label: "tool result the model reads to see every source for a region",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Why is 'accessibility tree vs pixel' framed as a binary choice in most articles?",
    a: "Because at the API surface it looks like one. Anthropic's computer_20251124 tool takes screenshots and returns clicks at pixel coordinates. OS-level accessibility APIs (Microsoft UIAutomation, Apple AXUIElement, Linux AT-SPI) return structured trees with roles and names. Each one is a fully-formed contract. If you build an agent on top of one of them, the dichotomy holds for that agent. The problem is that a real user session on a real desktop runs through both regimes within the same minute. The user opens Slack (Electron, AX is empty), copies a message (pixel), switches to Notes (AX is rich), pastes and saves (AX). An agent built on one regime is wrong half the day.",
  },
  {
    q: "What does 'clustering by bounds' mean concretely?",
    a: "Each source emits elements with a screen-coordinate bounding box. UIA gives you a button at (1376, 832, 36, 36). OmniParser, running pixel detection on the same screenshot, gives you an icon at (1378, 834, 32, 32). OCR gives you the word 'Send' at (1380, 836, 28, 28). Without clustering the model sees three separate clickables and has to guess they refer to the same UI element. With clustering they appear under one cluster header in the output, sorted by reading order, each tagged with its source prefix. The agent picks one to click. If the first source fails, the next call uses the next prefix. The grouping happens once on the server, before the model sees the tree.",
  },
  {
    q: "What exactly is the clustering threshold?",
    a: "1.5 times the smaller dimension of the two boxes. The function is should_cluster(b1, b2) in crates/terminator/src/tree_formatter.rs around line 452. It takes the minimum of all four side lengths (width and height of both boxes) and multiplies by 1.5. If the minimum edge distance between the boxes is under that, they get unioned into the same cluster. A 36-pixel button and a 32-pixel icon that overlap end up in the same cluster because the smaller-dimension threshold is 48 pixels and they overlap, so the edge distance is zero. The union-find runs in O(n^2) over all elements; n is bounded by the visible window so it stays cheap.",
  },
  {
    q: "Why use single-character prefixes like 'u', 'd', 'o', 'p', 'g' instead of full names?",
    a: "Token cost. The model reads this output every turn. With a thousand visible elements on a busy screen, '#uia_1234' versus '#u1234' is a real difference once you multiply by every action in a long-horizon task. The prefix map lives in ElementSource::prefix in tree_formatter.rs around line 52: Uia='u', Dom='d', Ocr='o', Omniparser='p', Gemini='g'. The reverse parser at parse_prefixed_index splits the first character off the index string and routes the click to the right backend. The agent never needs to spell out 'omniparser' in its turn.",
  },
  {
    q: "What does the model actually do differently when it sees both sources?",
    a: "Two things. First, when the same region has a #u and a #p entry, the model usually picks #u because the tree click is cheaper and more deterministic. AXUIElementPerformAction with kAXPressAction runs in microseconds and survives DPI changes, theme animations, and localization. The pixel click runs through an OS-level coordinate trigger that breaks on a five-pixel shift. Second, when a region has only a #p or #o entry (AX returned nothing actionable there), the model picks the pixel index and the same click_index tool call dispatches through the vision-coordinate path. The agent's selector grammar does not change. The decision happens at index resolution, not at prompt time.",
  },
  {
    q: "Is the click_index call really the same for every source?",
    a: "Yes. The MCP server's click_index tool accepts an index string. The string starts with one of five characters. The server reads the character, looks up the cached bounds for that source's index, and dispatches the click. UIA indices route to AXUIElementPerformAction or its UIA equivalent (InvokePattern.Invoke on Windows). DOM indices route through a CDP click on the attached browser. OCR, Omniparser, and Gemini indices route to a coordinate click at the center of the cached bounds. The agent writes click_index('u12') or click_index('p7') and the resolver does the rest. Source: ClusteredFormattingResult.index_to_source_and_bounds at tree_formatter.rs line 112.",
  },
  {
    q: "What is the failure mode of 'accessibility tree only'?",
    a: "Three modes, in order of how often they hit. Electron apps return AXGroup soup, so any task that touches Slack, Discord, VS Code, Cursor, Notion desktop, ChatGPT desktop, or Claude desktop ends in a silent dead end. Custom-painted canvases (Figma, Photoshop, games, GPU-composited terminals) return one opaque element with the window bounds. Image-interpretation tasks (read a chart, compare two design states, find the red badge) have no representation in the tree at all. None of these surface as errors; the tree just says nothing useful and the agent hallucinates.",
  },
  {
    q: "What is the failure mode of 'pixel only'?",
    a: "Cost and latency on native surfaces. A Mac Retina display runs around 7.7 megapixels at native resolution and around 3 after the 2576-pixel long-edge downscale. Every screenshot is large, every encode round-trips through PNG, every upload spends real bandwidth, every model turn spends image input tokens. On the half of the user's day that is native Cocoa or Win32 apps with a perfectly readable tree, the screenshot loop is paying for grounding the model could have gotten free from role+name. Latency compounds: a 100-action task at two seconds per action is over three minutes of vision time; the same task with tree routing on native surfaces is under thirty seconds.",
  },
  {
    q: "Where is this implementation in the repo?",
    a: "The clustering logic is in crates/terminator/src/tree_formatter.rs. ElementSource enum starts at line 40. UnifiedElement struct at line 84. should_cluster function at line 452. cluster_elements (the union-find pass) at line 460. format_clustered_tree_from_caches (the merge of UIA, DOM, OCR, Omniparser, Gemini caches) at line 557. The MCP server wires it up at crates/terminator-mcp-agent/src/server.rs line 1697, where it pulls a snapshot of each per-source cache and writes the clustered string into result_json['clustered_tree']. Repo: github.com/mediar-ai/terminator.",
  },
  {
    q: "Does the agent need to know which source to pick, or does the model figure it out?",
    a: "The model figures it out from the cluster output. The clusters are sorted in reading order (top-to-bottom, left-to-right), and within each cluster the entries are listed in the same order. When two sources cover the same region, the model sees both and picks the one that matches its intent best. We do not bias the model with a per-source preference, because the right choice depends on what the surface looks like, and the surface differs across apps within the same task. The prompt template tells the model the prefix meanings once; everything after that is the model's call.",
  },
  {
    q: "Does this work cross-platform today?",
    a: "The clustering and the MCP server are platform-agnostic, but the published binary is Windows-first. The Rust core has a target_os = 'macos' code path for the AX walker in crates/terminator/src/platforms/tree_search.rs (the file's first comment is the famous 'default TreeWalker does not traverse windows' TLDR), but the workspace mod.rs at line 320 still emits compile_error! for non-Windows targets. Published as npx terminator-mcp-agent on npm and terminator-py on pip; both ship the Windows binary. The macOS adapter is in the repo if you want to copy the AX shim and the per-call routing into your own agent today.",
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
    title: "AX tree vs screenshot for computer use on Mac",
    excerpt:
      "Three quirks of the macOS Accessibility API that flip the AX-vs-screenshot decision from architectural to per-call. With the source line that names the most subtle one.",
    href: "/alternative/ax-tree-vs-screenshot-computer-use-mac",
    tag: "Alternative",
  },
  {
    title: "Claude Opus 4.7 computer use, without the screenshots",
    excerpt:
      "The tree-diff alternative to computer_20251124. Every action returns the changed UI elements as compact YAML, so the model reads what happened without another screenshot.",
    href: "/alternative/claude-opus-4-7-computer-use-without-screenshots",
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
            Alternative / Accessibility tree vs pixel computer use
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            Accessibility tree vs pixel for computer use. The framing is wrong.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            Every article comparing these two approaches asks the same question: should your agent ground actions in the accessibility tree, or in pixels? Tree people quote the 5x token saving and the 3x latency win. Pixel people quote AXGroup soup in Slack and the impossibility of clicking inside a Figma canvas with role names. Both are right, both end the article with some version of &ldquo;real agents combine both,&rdquo; and almost none of them say what combining them looks like in production code. This page describes one concrete mechanism, written into one open-source repo, for merging the two regimes per screen region in one tool result the model reads.
          </p>
          <div className="mt-6">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="9 min"
            />
          </div>
        </header>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-15)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            Use both, in one tool result, clustered by screen bounds. On native surfaces (every Cocoa, AppKit, SwiftUI, Win32, WinUI, WPF, MFC, and Electron-with-real-AX app) prefer the accessibility tree: role plus name in a few kilobytes, click in microseconds via{" "}
            <code className="rounded bg-white px-1 text-orange-700">kAXPressAction</code>{" "}
            or{" "}
            <code className="rounded bg-white px-1 text-orange-700">InvokePattern.Invoke</code>. On Chromium-rendered apps (Slack, Discord, VS Code, Cursor, Notion desktop) and custom-painted surfaces (Figma, Photoshop, games), the tree returns AXGroup soup or one opaque element, and a pixel detector (OCR, OmniParser, or a vision-language model) fills the gap. The right architecture does not pick one regime for the agent. It clusters every source by spatial bounds, gives each its own prefixed index (
            <code className="rounded bg-white px-1 text-orange-700">#u</code>,{" "}
            <code className="rounded bg-white px-1 text-orange-700">#d</code>,{" "}
            <code className="rounded bg-white px-1 text-orange-700">#o</code>,{" "}
            <code className="rounded bg-white px-1 text-orange-700">#p</code>,{" "}
            <code className="rounded bg-white px-1 text-orange-700">#g</code>), and lets the model pick a source per click. Mechanism in code:{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/tree_formatter.rs"
            >
              terminator/src/tree_formatter.rs
            </a>
            , the{" "}
            <code className="rounded bg-white px-1 text-orange-700">format_clustered_tree_from_caches</code>{" "}
            function around line 557.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The dichotomy survives only at the API level
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic&rsquo;s{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">
              computer_20251124
            </code>{" "}
            tool returns clicks at pixel coordinates after the model reads a base64 PNG. Microsoft UIAutomation, Apple AXUIElement, Linux AT-SPI all return tree nodes with roles and names. Each contract is internally consistent, and an agent that lives inside one contract gets a clean mental model. The price is that real desktop sessions cross contracts every few minutes. A user opens Slack to read a message (Electron, AX returns nothing), Cmd-Tabs to Notes to jot a reply (Cocoa, AX returns role-and-name on every line), opens Figma to grab a screenshot of a frame (canvas, only pixels carry signal), pastes it into a doc (rich text, AX). An agent built around one regime treats half the session as noise.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Every comparison article admits this with a closing paragraph like &ldquo;combine both for best results.&rdquo; What they skip is the part the architect needs: where does the combination happen, what does the wire format look like, and how does the model pick a source for one click without restructuring the prompt? The next sections are about that mechanism.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The tree-only view, on the surface where the tree breaks
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Toggle to see what the agent reads when you ship only the UIA tree on a Slack window, and what the same agent reads when the server clusters the UIA snapshot with an OmniParser pass and an OCR pass on the same screenshot. The first view is the one most production agents render today. The second is the view that lets the model click <code className="rounded bg-orange-50 px-1 text-orange-700">#u12</code> when the tree has a name and{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">#p7</code>{" "}
            when it does not.
          </p>
          <BeforeAfter
            title="Same window, two tool-result shapes"
            before={{
              label: "Tree only",
              content: treeOnlySample,
              highlights: [
                "six nested AXGroups with no names",
                "model has no target, hallucinates a coordinate",
                "loop usually fails silently on the second turn",
              ],
            }}
            after={{
              label: "Clustered output (UIA + OmniParser + OCR)",
              content: clusteredSample,
              highlights: [
                "each cluster groups all sources that share a screen region",
                "every entry is keyed by source prefix",
                "click_index('u12') and click_index('p7') resolve to the right backend",
              ],
            }}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The mechanism in five lines of Rust
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shape that makes the &ldquo;both at once&rdquo; framing actually work is a five-variant enum and a union-find pass. The enum:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`// crates/terminator/src/tree_formatter.rs, around line 40
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ElementSource {
    Uia,        // #u - Accessibility tree
    Dom,        // #d - Browser DOM
    Ocr,        // #o - OCR text
    Omniparser, // #p - Omniparser vision
    Gemini,     // #g - Gemini vision
}`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The pass: every element from every source lands in one{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">Vec&lt;UnifiedElement&gt;</code>{" "}
            with a screen-coordinate bounding box and a source tag. The clustering rule:
          </p>
          <pre className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-800">
{`// around line 450
fn should_cluster(b1: (f64, f64, f64, f64),
                  b2: (f64, f64, f64, f64)) -> bool {
    let smaller_dim = f64::min(
        f64::min(b1.2, b1.3), f64::min(b2.2, b2.3));
    let threshold = smaller_dim * 1.5;
    min_edge_distance(b1, b2) < threshold
}`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A union-find walk over all pairs of elements groups every set that shares a region. Sources sit inside the same group when their bounds overlap or sit closer than 1.5 times the smaller box dimension. The result is a list of clusters sorted in reading order. The MCP server emits one{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">clustered_tree</code>{" "}
            string and one index map. The model picks indices off the string and the resolver routes them through the right backend.
          </p>
          <ProofBanner
            quote="default TreeWalker does not traverse windows, so we need to traverse windows manually"
            source="crates/terminator/src/platforms/tree_search.rs, line 1"
            metric="line 1"
          />
          <p className="mt-2 text-zinc-700 leading-relaxed">
            That TLDR is the first comment in the platform shim that backs the{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">#u</code>{" "}
            source. The clustering pass does not know it. The model does not see it. The accessibility-tree branch silently misses every non-main window unless the platform shim works around an OS-level walker default. That is the kind of failure that does not survive in a one-source agent.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What the model sees, one round-trip at a time
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One MCP call returns a clustered tree. The model reads it. The next call clicks one prefixed index. The MCP server snapshots all caches in parallel, clusters, and writes a single result. The wire diagram below shows the call shape; nothing about the agent loop changes between a tree-friendly app and a tree-hostile one.
          </p>
          <SequenceDiagram
            title="One tool call, every source, one response"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            When each source actually carries the signal
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The model does not need a prompt that tells it which surfaces are AX-friendly and which are not. It reads a cluster, sees which sources are present, and picks one. But for a human designing the agent, the per-surface picture is useful. The five-source split lines up roughly with four classes of UI:
          </p>
          <HorizontalStepper
            title="Where each prefix wins"
            steps={stepperSteps}
          />
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The lines blur. Office for Mac uses AppKit on the chrome and a Chromium webview for the cloud-doc surface, so a single task crosses regimes. Cursor renders its file tree with Chromium AX but the editor itself with a Monaco canvas. Some Photoshop dialogs are native AX while the document area is a Metal canvas. None of that needs custom code in the agent if the clustering happens server-side: the model just sees more clusters tagged with{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">#p</code>{" "}
            in one part of the window and{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">#u</code>{" "}
            in another.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The same choice with no model in the loop
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Everything above assumes an agent: a model reads a clustered tree and clicks a prefixed index. Plenty of desktop automation has no model in it at all. RPA jobs, QA suites, scheduled scripts, a build step that drives an installer. The accessibility-tree-versus-pixel question is identical for those, and so is the answer, but the machinery is lighter. There is no union-find clustering and no five-source merge to run, because there is no model to feed. You pick the source yourself, at author time.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            In that mode the selector grammar is the whole API. A deterministic script calls{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">desktop.locator(&quot;role:Button &amp;&amp; name:Save&quot;)</code>{" "}
            then{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">.invoke()</code>{" "}
            directly. Tree first, because role plus name resolves in a COM round trip and survives DPI, theme, and locale shifts. Pixel and OCR stay as the fallback for exactly the surfaces a model would also fall through on: canvases, games, and remote-desktop viewports where the tree is one opaque node. The only thing that changes between an agent and a script is who chooses the source. An agent reads the clustered output and picks an index; a script commits the selector when you write it, and a miss surfaces as a typed{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">ElementNotFoundError</code>{" "}
            instead of a hallucinated coordinate. Terminator exposes both paths from one Rust core: the{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">terminator-rs</code>{" "}
            crate and the{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">terminator-py</code>{" "}
            binding for scripted automation, and the{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">terminator-mcp-agent</code>{" "}
            server for the agent loop.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Four numbers that define the shape
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four numbers from the source code, not benchmarks. They define the surface of the system and the price of crossing it.
          </p>
          <MetricsRow metrics={metrics} />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why the binary framing keeps coming back
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two reasons. The first is research-paper inertia. Computer-use benchmarks publish numbers on one regime at a time so the result is comparable across labs; that framing leaks into how the press writes about the field. The second is that pipeline engineering for a hybrid is genuinely harder than pipeline engineering for one regime. You need a per-source bounds cache, a union-find over visible elements every tree call, a prefix-aware resolver in every action tool, and a tool result format that survives clusters with eight entries on a busy screen. None of it is hard individually; together it adds a hundred or two hundred lines of orchestration code per agent. Most published agents skip that and pick one regime, which is why the dichotomy in articles outlives the dichotomy in practice.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Terminator&rsquo;s contribution to this conversation is not the insight that hybrid is better; that part is widely agreed. The contribution is one open-source repo where the orchestration code is written down. If the framing on your roadmap doc is still &ldquo;pick a regime,&rdquo; the next page to read is{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/tree_formatter.rs"
            >
              tree_formatter.rs
            </a>
            . The next thing to look at is the prefixed-index resolver in{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator-mcp-agent/src/server.rs"
            >
              server.rs
            </a>{" "}
            around line 1697.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Designing a computer use agent and stuck on the tree-or-pixel question?"
          description="30 minutes. Bring your agent loop, leave with a concrete plan for the source-prefixed cluster output and where it routes to each backend."
        />

        <FaqSection
          heading="Questions about accessibility tree vs pixel computer use"
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
        description="Stop picking one regime. Book a 30-minute working session on hybrid grounding."
      />
    </article>
  );
}
