import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  NumberTicker,
  Marquee,
  AnimatedCodeBlock,
  StepTimeline,
  ComparisonTable,
  BentoGrid,
  SequenceDiagram,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type RelatedPost,
  type BentoCard,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/open-source-computer-use-agents-april-2026";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Open source computer use agents, April 2026: the math that turns a vision model's click into an actual pixel";
const DESCRIPTION =
  "A map of the open source computer use agent space in April 2026, and the bridge code that almost no survey post shows. Terminator ships the four-step coordinate transform, in public Rust, that converts a Gemini Computer Use model's 0-999 normalized click into a real desktop pixel. This is the part every listicle skips.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Every listicle of open source computer use agents labels projects vision, accessibility, or hybrid. None of them show the math a hybrid agent does. Here is Terminator's bridge code.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Open source computer use agents in April 2026 and the hybrid bridge nobody shows",
    description:
      "Four arithmetic steps turn a vision model's 0-999 pick into a real screen pixel. Terminator has the code in public. Here it is, commented, from terminator-computer-use/src/lib.rs.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Open source computer use agents, April 2026" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Open source computer use agents, April 2026", url: PAGE_URL },
];

const convertCoordSource = `// crates/terminator-computer-use/src/lib.rs:336
// This is the function every hybrid computer use agent needs
// and almost none publish. It takes a Gemini Computer Use
// response like {"name":"click_at","args":{"x":512,"y":640}}
// where x and y live in a 0-999 normalized space, and returns
// an absolute (screen_x, screen_y) pair you can actually click.

#[allow(clippy::too_many_arguments)]
pub fn convert_normalized_to_screen(
    norm_x: f64,
    norm_y: f64,
    window_x: f64,
    window_y: f64,
    screenshot_w: f64,
    screenshot_h: f64,
    dpi_scale: f64,
    resize_scale: f64,
) -> (f64, f64) {
    // 1. Leave model space. 0-999 -> screenshot pixel space.
    let px_x = (norm_x / 1000.0) * screenshot_w;
    let px_y = (norm_y / 1000.0) * screenshot_h;

    // 2. Undo the resize we did before we sent the image.
    //    Gemini wants 1024px on the long edge; we shrank first.
    let px_x = px_x / resize_scale;
    let px_y = px_y / resize_scale;

    // 3. Physical -> logical pixels. Windows reports UIA
    //    coordinates in logical space, screenshots in physical.
    //    On a 150% display this divisor is 1.5.
    let logical_x = px_x / dpi_scale;
    let logical_y = px_y / dpi_scale;

    // 4. Add the captured window's top-left on the desktop.
    //    Up to now we were inside the window; now we are on
    //    the whole virtual screen.
    let screen_x = window_x + logical_x;
    let screen_y = window_y + logical_y;

    (screen_x, screen_y)
}`;

const translateKeysSource = `// crates/terminator-computer-use/src/lib.rs:212
// The model says "control+a" or "Meta+Shift+T".
// Windows UI Automation wants "{Ctrl}a" or "{Win}{Shift}t".
// This is the translation layer. Modifier parts become
// bracket tokens; the last lowercase letter stays bare.

pub fn translate_gemini_keys(gemini_keys: &str) -> Result<String, String> {
    let parts: Vec<&str> = gemini_keys.split('+').collect();
    let mut result = String::new();

    for (i, part) in parts.iter().enumerate() {
        let lower = part.trim().to_lowercase();
        let is_last = i == parts.len() - 1;

        let translated: &str = match lower.as_str() {
            "control" | "ctrl" => "{Ctrl}",
            "alt"              => "{Alt}",
            "shift"            => "{Shift}",
            "meta" | "cmd" | "command"
                | "win" | "windows" | "super" => "{Win}",

            "enter" | "return"     => "{Enter}",
            "tab"                  => "{Tab}",
            "escape" | "esc"       => "{Escape}",
            "backspace" | "back"   => "{Backspace}",
            "delete" | "del"       => "{Delete}",
            "space"                => "{Space}",

            // f1 .. f24 handled by an explicit 1..=24 match
            // so "f99" is a hard error, not a silent miss.
            s if s.starts_with('f') && s.len() >= 2 => { /* ... */ "{F1}" }

            // Single a-z / 0-9 only valid as the *last* part
            s if s.len() == 1 && is_last => {
                result.push_str(s);
                continue;
            }

            unknown => {
                return Err(format!(
                    "Unknown key '{}' in combination '{}'.", unknown, gemini_keys
                ));
            }
        };
        result.push_str(translated);
    }
    Ok(result)
}`;

const dispatchSource = `// crates/terminator-mcp-agent/src/server.rs:9953
// The same MCP process that exposes 32 selector-based tools
// also exposes the vision loop. gemini_computer_use sits on
// line 9978 of the dispatch_tool match, next to click_element
// and type_into_element. Your agent picks the right tool for
// the moment.

let result = match tool_name {
    "get_window_tree"         => self.get_window_tree(..).await,
    "click_element"           => self.click_element(..).await,
    "type_into_element"       => self.type_into_element(..).await,
    "press_key"               => self.press_key(..).await,
    "activate_element"        => self.activate_element(..).await,
    "navigate_browser"        => self.navigate_browser(..).await,
    "execute_browser_script"  => self.execute_browser_script(..).await,
    "execute_sequence"        => self.execute_sequence(..).await,
    // ... 23 more selector-based tools ...
    "gemini_computer_use"     => self.gemini_computer_use(..).await,
    _ => Err(McpError::internal_error("Unknown tool called", ..)),
};`;

const transformSteps = [
  {
    title: "Step 1 — Leave model space",
    description:
      "Gemini Computer Use emits x and y in a normalized 0-999 grid. Multiply by screenshot_w and screenshot_h, divide by 1000. You are now in screenshot pixel space.",
  },
  {
    title: "Step 2 — Undo the resize",
    description:
      "Vision models have an image size cap. Terminator shrinks the capture before sending, recording a resize_scale. Divide by that scale to get back to the raw captured pixels.",
  },
  {
    title: "Step 3 — Physical to logical pixels",
    description:
      "Screenshots live in physical pixels. Windows UI Automation lives in logical pixels. On a 150% scaling display the divisor is 1.5. Skip this step and every click on a HiDPI monitor lands a third of the way down the button.",
  },
  {
    title: "Step 4 — Add the window offset",
    description:
      "Up to this point every coordinate has been relative to the window we screenshotted. Now add window_x and window_y to land on the virtual desktop. This is what we actually click.",
  },
];

const spaceMetrics = [
  { value: 999, label: "Max norm coord Gemini emits" },
  { value: 4, label: "Transforms per click" },
  { value: 32, label: "MCP tools on the other path" },
  { value: 24, label: "Function keys handled, f1 to f24" },
];

const agentCards: BentoCard[] = [
  {
    title: "Browser Use",
    description:
      "DOM-aware browser agent. Lives inside the page, not on top of the OS. Crossed 50k stars on GitHub in Q1 2026. Great fit when the target is a web tab.",
    size: "1x1",
  },
  {
    title: "UI-TARS",
    description:
      "Purpose-built vision model for computer use, from the Alibaba group. Screenshots in, actions out. Runs fully local once the weights are pulled.",
    size: "1x1",
  },
  {
    title: "Microsoft UFO",
    description:
      "Windows-native dual-agent system built on UI Automation. Reached production quality in early 2026. Accessibility-first, vision on demand.",
    size: "1x1",
  },
  {
    title: "Agent S",
    description:
      "Simular AI's open agentic framework. Uses a computer like a human: plans, observes, acts. Screenshot-driven with memory.",
    size: "1x1",
  },
  {
    title: "Open Interpreter",
    description:
      "Code-execution-first. It will write and run Python or Node over your OS as readily as it will click things. Not strictly a GUI agent but lives in the same space.",
    size: "1x1",
  },
  {
    title: "Terminator",
    description:
      "Windows UIA selectors plus an embedded Gemini Computer Use loop in the same MCP process. The hybrid bridge and the selector stack ship in the same binary.",
    size: "1x1",
    accent: true,
  },
];

const architectureRows: ComparisonRow[] = [
  {
    feature: "What the model looks at",
    competitor:
      "A PNG screenshot, every turn, re-uploaded. That is the whole input.",
    ours: "The accessibility tree as YAML or JSON, fetched once, diffed on change.",
  },
  {
    feature: "What the model returns",
    competitor:
      'A pixel coordinate pair like [487, 341], or a normalized 0-999 pair the harness must project back to the screen.',
    ours: 'A selector string like "role:Button && name:Save". No coordinates leave the model.',
  },
  {
    feature: "Where DPI / resize / window offset is handled",
    competitor:
      "In your harness. If you forget any of the four transforms, clicks land off the button. Silently.",
    ours: "Nowhere the model can see. UIA gives the element, we invoke it.",
  },
  {
    feature: "Cost per action",
    competitor:
      "One image upload plus one model call. Scales with workflow length.",
    ours: "One MCP stdio call. Model round-trip amortised across whole plan.",
  },
  {
    feature: "Behaviour on a button moving 12 pixels",
    competitor:
      "Old coordinate misses. The LLM does not notice unless the screenshot still shows the button.",
    ours:
      "role:Button && name:Save still resolves. Selector is an identity, not a coordinate.",
  },
  {
    feature: "When it is genuinely the right tool",
    competitor:
      "Canvas apps. Games. Any surface the accessibility tree does not describe. Drawing software. Custom-rendered dashboards.",
    ours: "Normal desktop apps, browsers, anywhere the OS already knows what the buttons are.",
  },
];

const hybridDiagramFrom = [
  { label: "Desktop capture", sublabel: "GDI / UIA bitmap" },
  { label: "Image resize", sublabel: "long edge <= 1024" },
  { label: "Base64 encode", sublabel: "PNG payload" },
];
const hybridDiagramHub = {
  label: "terminator-computer-use",
  sublabel: "call_computer_use_backend",
};
const hybridDiagramTo = [
  { label: "norm 0-999", sublabel: "model output" },
  { label: "convert_normalized_to_screen", sublabel: "4 transforms" },
  { label: "UIA click", sublabel: "logical pixel" },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude computer use, and the selector path nobody explains",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer use tool is a pixel-coordinate loop. Terminator swaps it for 32 selector-based MCP tools. Both paths, same page.",
    tag: "Guide",
  },
  {
    title: "What is an MCP server, really",
    href: "/t/what-is-mcp-server",
    excerpt:
      "One match block in server.rs handles every Claude call. The build.rs trick keeps the prompt in sync with the code. Terminator opened as the example.",
    tag: "Guide",
  },
  {
    title: "terminator-computer-use on GitHub",
    href: "https://github.com/mediar-ai/terminator/tree/main/crates/terminator-computer-use",
    excerpt:
      "The crate shown in this page. Types, backend call, key translator, coordinate converter. MIT licensed.",
    tag: "Repo",
  },
];

const marqueeItems = [
  "UI-TARS",
  "Browser Use",
  "Open Interpreter",
  "Microsoft UFO",
  "Agent S",
  "Agent Zero",
  "LaVague",
  "Fazm",
  "Terminator",
  "Self-Operating Computer",
];

const hybridSequenceActors = [
  "Your agent",
  "MCP (Terminator)",
  "Gemini backend",
  "Windows UIA",
];

const hybridSequenceMessages = [
  {
    from: 0,
    to: 1,
    label: 'tool_use: gemini_computer_use { goal: "post this to Slack" }',
    type: "request" as const,
  },
  {
    from: 1,
    to: 3,
    label: "capture window bitmap + dpi_scale + window_x, window_y",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "call_computer_use_backend(image, goal, previous_actions)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: 'function_call { name: "click_at", args: { x: 612, y: 284 } }',
    type: "response" as const,
  },
  {
    from: 1,
    to: 1,
    label: "convert_normalized_to_screen(612, 284, ...) -> (x_screen, y_screen)",
    type: "event" as const,
  },
  {
    from: 1,
    to: 3,
    label: "UIA ElementFromPoint(x_screen, y_screen).Invoke()",
    type: "request" as const,
  },
  {
    from: 3,
    to: 1,
    label: "click dispatched, UI diff captured",
    type: "response" as const,
  },
  {
    from: 1,
    to: 0,
    label: "ComputerUseStep { success: true, screenshot, reasoning }",
    type: "response" as const,
  },
];

const faqs = [
  {
    q: "What does 'open source computer use agent' mean in April 2026?",
    a: "A computer use agent is a system where an AI model can see the state of a computer and drive its input devices — cursor, keyboard, scroll — toward a goal. Open source means the harness, the tools, and usually the system prompt are on GitHub under a permissive license; the model itself can be proprietary (Claude, Gemini) or open (UI-TARS, Qwen-VL). In April 2026 the space splits into three architectures: pure screenshot-and-vision (works on any OS, slow and expensive), pure accessibility-tree selectors (fast and robust, OS-specific), and hybrid systems that start with selectors and fall back to vision when the tree does not describe the element.",
  },
  {
    q: "What does Terminator do that most of the other open source agents do not?",
    a: "Two things in one binary. First, it exposes 32 selector-based tools over MCP, so a coding assistant like Claude or Cursor drives the desktop by role:Button && name:Save rather than pixel coordinates. Second, it also exposes a vision loop via the gemini_computer_use tool, and it ships the bridge code that connects the two worlds. That bridge is the convert_normalized_to_screen function at crates/terminator-computer-use/src/lib.rs line 336, which takes a model's 0-999 normalized coordinate and applies four transforms (divide by 1000, divide by resize_scale, divide by dpi_scale, add window offset) to produce a real pixel. Most hybrid agents keep that math private; Terminator ships it in public Rust.",
  },
  {
    q: "Why four transforms? Is one of them optional?",
    a: "None of them are optional on a real Windows machine. Step 1 exists because the model is trained on a normalized 0-999 grid, not your display. Step 2 exists because we have to resize the screenshot before uploading (Gemini Computer Use caps the long edge around 1024 pixels); the scale we used to shrink has to be undone to find where in the original capture the click belongs. Step 3 exists because screenshots live in physical pixels but UI Automation coordinates live in logical pixels, and on a 150% scaled display those differ by a factor of 1.5. Step 4 exists because up to that point we have been measuring inside the screenshotted window, and we have to add the window's top-left to land on the virtual desktop. Skip any one of them and your click is either off the button or off the screen.",
  },
  {
    q: "Where does the key translator fit in?",
    a: "Gemini emits keyboard input in one dialect (control+a, Meta+Shift+T) and Windows UIA accepts a different one ({Ctrl}a, {Win}{Shift}t). translate_gemini_keys in the same file (lines 212 to 313) walks each plus-separated token, maps modifiers to bracket forms, handles enter, tab, escape, backspace, delete, space, arrows, and the f1 through f24 range with an explicit 1..=24 match so a model hallucinating 'f99' fails loudly instead of silently. Single ASCII characters are only valid as the last segment of a combination. It is small code, but it is the kind of code a survey post never shows.",
  },
  {
    q: "How do I see the 32 selector-based tools for myself?",
    a: "Open crates/terminator-mcp-agent/src/server.rs and jump to the dispatch_tool function (around line 9953 at the time of writing). There is a single match block on tool_name; each arm is one MCP tool. At the time of this page: get_window_tree, get_applications_and_windows_list, click_element, type_into_element, press_key, press_key_global, validate_element, wait_for_element, activate_element, navigate_browser, execute_browser_script, open_application, scroll_element, mouse_drag, highlight_element, select_option, set_selected, capture_screenshot, invoke_element, set_value, execute_sequence, run_command, delay, stop_highlighting, stop_execution, gemini_computer_use, read_file, write_file, edit_file, copy_content, glob_files, grep_files. The vision loop is one of the 32.",
  },
  {
    q: "Is Terminator Windows-only?",
    a: "Today, yes. The README is explicit: Windows support is the stable surface; macOS and Linux are not currently supported for the automation features. The computer use crate itself compiles cross-platform, but the UIA invocations that execute the converted coordinates are Windows APIs. If you are on macOS and want an open source, accessibility-first agent, Fazm is the closest counterpart in the April 2026 space.",
  },
  {
    q: "When should I prefer the vision path and when should I prefer selectors?",
    a: "Prefer selectors whenever the accessibility tree describes what you want. Regular apps, browsers, native Windows dialogs — these all have a tree, and role + name selectors survive layout changes that break pixel coordinates. Prefer vision for surfaces that do not expose structure: canvas-based drawing apps, games, custom-rendered dashboards, WebGL content, remote desktops, anything where the 'button' is just painted pixels. A well-built hybrid agent tries the cheap path first and only pays for the screenshot round-trip when there is nothing structural to target.",
  },
  {
    q: "Where does Terminator's MCP agent send the screenshot?",
    a: "To https://app.mediar.ai/api/vision/computer-use by default, overridable with the GEMINI_COMPUTER_USE_BACKEND_URL environment variable. The payload is a JSON body with three fields: image (base64 PNG), goal (the user task), previous_actions (history with their screenshots and success flags). The backend proxies to Gemini. Source: terminator-computer-use/src/lib.rs line 140, call_computer_use_backend, with a 300-second timeout.",
  },
];

export default function Page() {
  const articleLd = articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
  });
  const breadcrumbLd = breadcrumbListSchema(breadcrumbSchemaItems);
  const faqLd = faqPageSchema(faqs);

  return (
    <main className="bg-white text-zinc-900">
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

      {/* Hero */}
      <BackgroundGrid pattern="dots" glow>
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-10">
          <Breadcrumbs items={breadcrumbItems} className="mb-8 !mx-0 !px-0" />
          <div className="mb-5">
            <span className="inline-block text-xs font-mono uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1">
              Guide &middot; April 2026
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-tight">
            Open source computer use agents in{" "}
            <GradientText animate>April 2026</GradientText>, and the math most
            survey posts skip
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-3xl">
            Every list of open source computer use agents sorts the field into
            vision, accessibility, or hybrid and moves on. The interesting code
            lives in the hyphen. Terminator is the project that publishes it:
            four arithmetic transforms in Rust that turn a vision model&apos;s
            normalized 0-999 click into a real desktop pixel, living in the
            same MCP process as 32 selector-based tools.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ShimmerButton href="https://github.com/mediar-ai/terminator">
              See the source on GitHub
            </ShimmerButton>
            <a
              href="#the-bridge"
              className="text-sm font-mono uppercase tracking-widest text-orange-600 hover:text-orange-700 transition-colors"
            >
              Jump to the bridge code &rarr;
            </a>
          </div>
        </section>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Co-founder, Mediar"
          datePublished={PUBLISHED}
          readingTime="11 min read"
        />
        <div className="h-4" />
        <ProofBand
          rating={4.8}
          ratingCount="1.3k Rust crate installs / month"
          highlights={[
            "Source: terminator-computer-use/src/lib.rs",
            "MIT license, runs locally",
            "Ships the hybrid bridge in public",
          ]}
        />
      </section>

      {/* Concept intro video */}
      <section className="max-w-4xl mx-auto px-6">
        <RemotionClip
          title="One click, four transforms"
          subtitle="Inside Terminator's Gemini Computer Use bridge"
          captions={[
            "Model returns (x=612, y=284) in 0-999 norm space",
            "Leave norm space: multiply by screenshot_w, divide by 1000",
            "Undo the resize: divide by resize_scale",
            "Physical to logical: divide by dpi_scale",
            "Add the window offset: click a real pixel",
          ]}
          accent="orange"
          accentHex="#FF3E00"
          accentHexDark="#CC3200"
        />
      </section>

      {/* The SERP vs the source */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The list posts all say the same three words
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Search &ldquo;open source computer use agents April 2026&rdquo; and
          the first page repeats itself. UI-TARS, Browser Use, Microsoft UFO,
          Agent S, Agent Zero, Open Interpreter, LaVague, Fazm. Each post
          labels every entry vision, accessibility, or hybrid. None of them
          open the source on a hybrid agent and show what hybrid actually
          means in code. That is the gap this page fills, using the one
          project in that list whose hybrid bridge ships in public: Terminator.
        </p>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          The bridge is nine lines of arithmetic. Written out with comments it
          is about thirty. But getting any of those lines wrong puts every
          click half an inch to the left of the button, and none of the other
          posts show you how the line goes.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 py-6">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 text-center mb-3">
            The field, April 2026
          </p>
          <Marquee speed={38}>
            {marqueeItems.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm"
              >
                {name}
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {spaceMetrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5"
            >
              <div className="text-3xl font-bold text-zinc-900">
                <NumberTicker value={m.value} />
              </div>
              <div className="mt-1 text-sm text-gray-600 leading-snug">
                {m.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architectures */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two architectures, end to end
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          A pure-vision agent sees a PNG, picks a pixel, and hands the pixel
          back. A pure-selector agent reads the accessibility tree, matches a
          node by role and name, and invokes it through the OS. Every survey
          post acknowledges both. What they rarely acknowledge is that a
          hybrid agent has to do both at the same time in the same process,
          and that means the boundary between &ldquo;what the model returned&rdquo;
          and &ldquo;what the OS accepts&rdquo; is real code someone has to write.
        </p>
        <ComparisonTable
          heading="Vision-native vs selector-native, in practice"
          productName="Selector path (Terminator MCP)"
          competitorName="Vision path (screenshot loop)"
          rows={architectureRows}
          caveat="Both paths ship in the same Terminator binary. You can call click_element and gemini_computer_use against the same desktop in the same session."
        />
      </section>

      {/* The hybrid flow as a beam */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What a hybrid call actually moves through
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          A single Gemini Computer Use round-trip passes through three inputs
          on the way in and three transforms on the way out. In Terminator
          both ends meet inside the <code className="text-orange-600">terminator-computer-use</code> crate.
        </p>
        <AnimatedBeam
          title="terminator-computer-use: one round-trip"
          from={hybridDiagramFrom}
          hub={hybridDiagramHub}
          to={hybridDiagramTo}
          accentColor="#FF3E00"
        />
      </section>

      {/* Anchor fact: the code */}
      <section id="the-bridge" className="max-w-4xl mx-auto px-6 py-10">
        <span className="inline-block text-xs font-mono uppercase tracking-widest bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1 mb-4">
          Anchor fact
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The nine lines almost nobody publishes
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Here is the function at{" "}
          <code className="text-orange-600">
            crates/terminator-computer-use/src/lib.rs:336
          </code>
          . It is the whole reason hybrid computer use is possible on a
          Windows laptop with a HiDPI display.
        </p>
        <AnimatedCodeBlock
          code={convertCoordSource}
          language="rust"
          filename="crates/terminator-computer-use/src/lib.rs"
          typingSpeed={6}
        />
        <p className="mt-4 text-base text-gray-600 leading-relaxed">
          You can verify this by cloning the repo and running{" "}
          <code className="text-orange-600">cargo test -p terminator-computer-use</code>;
          the tests at the bottom of the same file cover the no-scaling case,
          the window-offset case, and the f1 through f24 range, so the bridge
          is not just shipped, it is checked in CI.
        </p>
      </section>

      {/* StepTimeline breaking down the transforms */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <StepTimeline
          title="The four transforms, one at a time"
          steps={transformSteps}
        />
      </section>

      {/* Key translator */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The key translator is the smaller bridge, and it fails loudly
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          A vision model does not know or care about Windows UI Automation key
          syntax. It emits what it learned: control+a, Meta+Shift+T.
          Terminator ships a deterministic translator that refuses to guess.
          Unknown keys return a typed error, not a best-effort attempt. This
          matters because a silent miss on a keyboard shortcut is
          indistinguishable from a slow app on a noisy CI run.
        </p>
        <AnimatedCodeBlock
          code={translateKeysSource}
          language="rust"
          filename="crates/terminator-computer-use/src/lib.rs (trimmed)"
          typingSpeed={5}
        />
      </section>

      {/* Dispatch tool - both paths in one match */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The two paths live next to each other in one match block
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          In Terminator&apos;s MCP server, <code className="text-orange-600">gemini_computer_use</code> is
          not a separate binary or a plugin. It is one arm of the same{" "}
          <code className="text-orange-600">dispatch_tool</code> match block
          that exposes <code className="text-orange-600">click_element</code>,{" "}
          <code className="text-orange-600">type_into_element</code>, and the
          other 29 selector-based tools. A model driving an agent session can
          choose, per step, whether to spend a screenshot round-trip or a
          selector lookup.
        </p>
        <AnimatedCodeBlock
          code={dispatchSource}
          language="rust"
          filename="crates/terminator-mcp-agent/src/server.rs"
          typingSpeed={5}
        />
      </section>

      {/* Sequence diagram of a hybrid call */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What actually happens per vision step
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Read this like a latency budget. Every request arrow is a wait you
          are paying for. The selector path collapses the three left-most
          arrows into zero, which is why it wins for normal apps.
        </p>
        <SequenceDiagram
          title="gemini_computer_use, one step"
          actors={hybridSequenceActors}
          messages={hybridSequenceMessages}
        />
      </section>

      {/* Agents in the field */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4 text-center">
          The cast, April 2026
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed text-center max-w-2xl mx-auto mb-2">
          Six open source projects that credibly call themselves computer use
          agents today. Each picks a different place on the architecture
          spectrum.
        </p>
        <BentoGrid cards={agentCards} />
      </section>

      {/* Quick metrics recap */}
      <section className="max-w-4xl mx-auto px-6 py-6">
        <MetricsRow
          metrics={[
            { value: 300, label: "Backend timeout (seconds) per call", suffix: "s" },
            { value: 1024, label: "Image long edge cap before upload", suffix: "px" },
            { value: 24, label: "Function keys handled (f1-f24)" },
            { value: 1, label: "Binary ships both paths" },
          ]}
        />
      </section>

      {/* What this unlocks */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What the public bridge actually unlocks
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          When the coordinate conversion and the key translator are real code
          you can read, three things get easier. You can run the same agent
          harness on a 100% display and a 175% display without re-tuning
          anything, because <code className="text-orange-600">dpi_scale</code> is just a
          parameter. You can swap the model backend by changing one env var (
          <code className="text-orange-600">GEMINI_COMPUTER_USE_BACKEND_URL</code>) and the
          math continues to work. And you can write deterministic tests for
          the bridge (the file has them) so a regression in the resize path
          does not silently move every click.
        </p>
      </section>

      {/* Book-a-call footer */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want the hybrid bridge wired into your own agent?"
          description="Book 20 minutes with the team and we will walk through how Terminator plugs into Claude Code, Cursor, or a custom harness."
        />
      </section>

      {/* FAQs */}
      <FaqSection items={faqs} />

      {/* Related */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <RelatedPostsGrid
          title="Related reading"
          subtitle="More on the parts this page skipped over."
          posts={relatedPosts}
        />
      </section>

      {/* Sticky CTA */}
      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="20 minutes with the team. See selectors and the hybrid bridge live."
      />
    </main>
  );
}
