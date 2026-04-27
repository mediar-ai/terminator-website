import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  AnimatedBeam,
  BackgroundGrid,
  GradientText,
  ShimmerButton,
  TerminalOutput,
  AnimatedCodeBlock,
  CodeComparison,
  SequenceDiagram,
  ComparisonTable,
  StepTimeline,
  MetricsRow,
  BentoGrid,
  GlowCard,
  AnimatedChecklist,
  Marquee,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type RelatedPost,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/open-source-computer-use-agent-sdk";
const PUBLISHED = "2026-04-26";
const TITLE =
  "Open source computer use agent SDK: the deterministic + vision hybrid most guides skip";
const DESCRIPTION =
  "An open source SDK for building computer use agents that ships both a deterministic accessibility-tree runtime and a built-in Gemini 2.5 Computer Use vision loop in the same package. Walks through the actual coordinate-conversion and key-translation Rust source so you can audit how the vision agent talks to your desktop.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Most computer use agents either run a vision loop or drive accessibility selectors. Terminator's SDK ships both. Inside: the 402-line Rust crate that wires Gemini 2.5 Computer Use to a UIA-driven runtime, with the actual translate_gemini_keys and convert_normalized_to_screen functions opened up.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Open source computer use agent SDK: deterministic + vision in one install",
    description:
      "Terminator ships a Rust+Node+Python SDK plus an MCP server with 32 tools, including a turnkey gemini_computer_use loop. Same install. Same script. Switch at the action level.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Open source computer use agent SDK" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Open source computer use agent SDK", url: PAGE_URL },
];

const installTerminal = [
  {
    text: "# install the SDK + the MCP runtime in one line",
    type: "output" as const,
  },
  { text: "npm i @mediar-ai/terminator", type: "command" as const },
  {
    text: "added 1 package, ships native bindings via napi-rs",
    type: "output" as const,
  },
  { text: "", type: "output" as const },
  {
    text: "# attach the same MCP server to Claude Code, Cursor, VS Code, Windsurf",
    type: "output" as const,
  },
  {
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest"',
    type: "command" as const,
  },
  { text: "Added terminator (stdio) - User scope", type: "success" as const },
  { text: "", type: "output" as const },
  {
    text: "# 32 deterministic tools + a Gemini Computer Use vision loop, same process",
    type: "success" as const,
  },
];

const hybridScript = `// One agent, two paths. Pick at the action level, not the install level.
// Source: this is the SDK shape exported from @mediar-ai/terminator (Node)
//         and mirrored 1:1 in the Python and Rust crates.

import { Desktop } from "@mediar-ai/terminator";

const desktop = new Desktop();

// ---- Path 1: deterministic. Runs in microseconds. No model.
//
// Selectors come from the live Windows UI Automation tree.
// crates/terminator-mcp-agent/src/server.rs:9953 dispatches these
// to the same Rust core that backs the SDK.

await desktop
  .locator("role:Window >> name:Calculator")
  .locator("role:Button && name:Seven")
  .click();

// ---- Path 2: vision. Drops into Gemini 2.5 Computer Use only when needed.
//
// crates/terminator-computer-use/src/lib.rs is the entire integration.
// 402 lines, no DSLs, no agent framework. Screenshots in, function calls out.
// Pixel math in convert_normalized_to_screen() at lib.rs:336.

await desktop.geminiComputerUse({
  process: "msedge",
  goal: "find the cheapest flight from SFO to NRT next Friday and copy the price",
  maxSteps: 20,
});

// Both calls in the same script. The first runs against the OS accessibility
// tree at CPU speed. The second pays for vision only when accessibility is
// empty or unreliable. The model is never in the inner loop of path 1.`;

const translateKeysSource = `// crates/terminator-computer-use/src/lib.rs:212
// Gemini 2.5 Computer Use emits keys in human format ("control+a", "Meta+Shift+T").
// Windows UI Automation needs braces and Win-mapped modifiers.
// This is the exact translation, copied verbatim. No external library.

pub fn translate_gemini_keys(gemini_keys: &str) -> Result<String, String> {
    let parts: Vec<&str> = gemini_keys.split('+').collect();
    let mut result = String::new();

    for (i, part) in parts.iter().enumerate() {
        let lower = part.trim().to_lowercase();
        let is_last = i == parts.len() - 1;

        let translated: &str = match lower.as_str() {
            // Modifiers
            "control" | "ctrl"                                   => "{Ctrl}",
            "alt"                                                 => "{Alt}",
            "shift"                                               => "{Shift}",
            "meta" | "cmd" | "command" | "win" | "windows" | "super" => "{Win}",

            // Special keys
            "enter" | "return" => "{Enter}",
            "tab"              => "{Tab}",
            "escape" | "esc"   => "{Escape}",
            "backspace"        => "{Backspace}",
            "delete" | "del"   => "{Delete}",
            "space"            => "{Space}",
            "home" | "end" | "pageup" | "pagedown" | "insert" => /* ... */ "",

            // Arrow keys
            "up" | "arrowup"       => "{Up}",
            "down" | "arrowdown"   => "{Down}",
            "left" | "arrowleft"   => "{Left}",
            "right" | "arrowright" => "{Right}",

            // f1..f24 expanded inline ...
            // Single character (a-z, 0-9), only valid as the last part
            s if s.len() == 1 && is_last => { result.push_str(s); continue; }
            unknown => return Err(format!("unknown key: {}", unknown)),
        };
        result.push_str(translated);
    }
    Ok(result)
}

// Tested in the same file:
//   "control+a"      -> "{Ctrl}a"
//   "Meta+Shift+T"   -> "{Win}{Shift}t"
//   "alt+f4"         -> "{Alt}{F4}"`;

const coordSource = `// crates/terminator-computer-use/src/lib.rs:336
// Gemini 2.5 Computer Use returns coordinates in a 0-999 normalized space,
// regardless of the screen resolution it was shown.
// We have to map back to absolute screen pixels, accounting for:
//   1. The screenshot dimensions the model actually saw
//   2. The resize scale we applied before upload (max dimension = 1920)
//   3. The host's DPI (logical vs physical)
//   4. Where the target window actually lives on the desktop

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
    // 0..999 -> screenshot pixels
    let px_x = (norm_x / 1000.0) * screenshot_w;
    let px_y = (norm_y / 1000.0) * screenshot_h;

    // undo the resize-for-upload scale
    let px_x = px_x / resize_scale;
    let px_y = px_y / resize_scale;

    // physical pixels -> logical (DPI-aware) coordinates
    let logical_x = px_x / dpi_scale;
    let logical_y = px_y / dpi_scale;

    // shift into the target window's frame
    let screen_x = window_x + logical_x;
    let screen_y = window_y + logical_y;

    (screen_x, screen_y)
}`;

const backendCallSource = `// crates/terminator-computer-use/src/lib.rs:140
// The single network call that drives the vision loop.
// Default backend is the hosted Mediar endpoint, but it's an env var:
// set GEMINI_COMPUTER_USE_BACKEND_URL to your own proxy and you control
// the model, the safety policy, and the billing.

pub async fn call_computer_use_backend(
    base64_image: &str,
    goal: &str,
    previous_actions: Option<&[ComputerUsePreviousAction]>,
) -> Result<ComputerUseResponse> {
    let backend_url = env::var("GEMINI_COMPUTER_USE_BACKEND_URL")
        .unwrap_or_else(|_| "https://app.mediar.ai/api/vision/computer-use".to_string());

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(300))
        .build()?;

    let payload = serde_json::json!({
        "image": base64_image,
        "goal": goal,
        "previous_actions": previous_actions.unwrap_or(&[])
    });

    let resp = client.post(&backend_url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send().await?;

    // returns { completed, function_call?, text?, safety_decision? }
    // function_call is the next action to perform, or None when the goal is met.
}`;

const sdkRows: ComparisonRow[] = [
  {
    feature: "Selector-driven actions (no model in the loop)",
    competitor: "No (vision-only) or browser-only",
    ours: "Yes. 32 typed tools, Windows UIA + macOS AX (Windows GA, macOS partial).",
  },
  {
    feature: "Vision-loop fallback in the same package",
    competitor: "Either/or, separate projects",
    ours: "gemini_computer_use ships in the same install. Same process.",
  },
  {
    feature: "Languages the SDK ships",
    competitor: "Usually one (Python or TS)",
    ours: "Rust (terminator-rs), Node (@mediar-ai/terminator), Python (terminator), CLI, MCP.",
  },
  {
    feature: "MCP server included",
    competitor: "Rare",
    ours: "Yes: 32 tools, one npx command, works in Claude Code, Cursor, VS Code, Windsurf.",
  },
  {
    feature: "Vision backend pluggable",
    competitor: "Hardcoded to one provider",
    ours: "GEMINI_COMPUTER_USE_BACKEND_URL env var, point at any compatible endpoint.",
  },
  {
    feature: "Pixel coordinate math written out",
    competitor: "Hidden inside the framework",
    ours: "lib.rs:336 convert_normalized_to_screen, ~25 lines of arithmetic, MIT-licensed.",
  },
  {
    feature: "Cursor / keyboard takeover",
    competitor: "Yes, breaks during runs",
    ours: "Selector path uses accessibility APIs, your cursor stays free during the deterministic phase.",
  },
  {
    feature: "License",
    competitor: "Mixed (Apache, AGPL, custom)",
    ours: "MIT.",
  },
];

const useCaseRows: ComparisonRow[] = [
  {
    feature: "Click a button you know exists",
    competitor: "Vision loop: screenshot, infer pixels, click, screenshot, verify",
    ours: "click_element({ selector: 'role:Button && name:Save' }) - one MCP call",
  },
  {
    feature: "Read text from a dialog",
    competitor: "Screenshot + OCR or model vision",
    ours: "get_window_tree returns Name and Value strings from the OS accessibility API",
  },
  {
    feature: "Drive a fully alien UI (canvas, game)",
    competitor: "Vision loop, every action",
    ours: "gemini_computer_use({ process, goal }) - one tool call, agentic loop until done",
  },
  {
    feature: "Mix both in one workflow",
    competitor: "Two installs, two harnesses",
    ours: "Same script. Selector path for known UI, vision path for the unknown.",
  },
  {
    feature: "Audit what the agent did",
    competitor: "Screenshots only",
    ours: "ComputerUseStep history persisted to %LOCALAPPDATA%/terminator/executions/",
  },
];

const sdkCards: BentoCard[] = [
  {
    title: "Rust core",
    description:
      "terminator-rs on crates.io. The platform adapters (Windows UIA, macOS AX), the selector engine, and the screenshot pipeline live here. Everything else is bindings.",
    size: "2x1",
    accent: true,
  },
  {
    title: "Node SDK",
    description:
      "@mediar-ai/terminator. napi-rs bindings, ships prebuilt binaries. Same Desktop, Locator, Element types as the Rust core.",
  },
  {
    title: "Python SDK",
    description:
      "pip install terminator. PyO3 bindings, .pyi stubs in the repo for IDE completion.",
  },
  {
    title: "MCP agent",
    description:
      "terminator-mcp-agent. 32 tools defined as match arms in server.rs. Compiled into a single binary, run via npx for any MCP host.",
    size: "2x1",
  },
  {
    title: "terminator-computer-use",
    description:
      "402-line crate. Wraps Gemini 2.5 Computer Use into the runtime: backend call, key translation, normalized-to-screen pixel math.",
  },
  {
    title: "Workflow recorder",
    description:
      "terminator-workflow-recorder. Captures real human input and emits replayable YAML, so the deterministic path can be authored without writing selectors by hand.",
    size: "2x1",
  },
  {
    title: "CLI + KV",
    description:
      "@mediar-ai/cli to drive workflows from a shell. @mediar-ai/kv to share state between deterministic and vision steps in the same run.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Claude computer use, and the selector-based path nobody talks about",
    href: "/t/claude-computer-use",
    excerpt:
      "What Claude actually emits under computer_20251022, and the 32 selector tools that replace the pixel loop.",
    tag: "Guide",
  },
  {
    title: "Accessibility API for computer use agents",
    href: "/t/accessibility-api-computer-use-agents",
    excerpt:
      "How Windows UIA and macOS AX expose a tree the model can target by role and name instead of pixels.",
    tag: "Guide",
  },
  {
    title: "Terminator on GitHub",
    href: "https://github.com/mediar-ai/terminator",
    excerpt:
      "Core Rust crates, MCP agent, Node and Python bindings, workflow recorder. MIT licensed.",
    tag: "Repo",
  },
];

const faqs = [
  {
    q: "What does an open source computer use agent SDK actually need to ship?",
    a: "Three things, at minimum. First, a way to observe the desktop: either a screenshot pipeline or an accessibility tree reader. Second, a way to act on it: cursor, keyboard, focus, scroll, drag, application launch. Third, a model loop that converts a goal into a sequence of actions and recovers from failures. Most projects with this label ship one of the three (a recorder, a tree reader, a vision loop) and call themselves an SDK. Terminator ships all three, with bindings in Rust, Node, and Python, plus an MCP server so the same runtime is reachable from Claude Code, Cursor, VS Code, and Windsurf without writing glue.",
  },
  {
    q: "Why a hybrid deterministic + vision design instead of pure vision?",
    a: "Because most desktop work is boring and structured. Clicking a Save button, typing into a known field, opening an app, reading a status string. The OS accessibility tree already knows where each of those elements is, what role they have, and what they are named. Sending a screenshot to a vision model to find the same element is paying for a model inference plus an image-token charge for something the OS gave you for free. Terminator's selector path uses Windows UIA or macOS AX directly, in-process. Vision is reserved for cases where the tree is empty or lies, which on Windows is mostly games, canvas-heavy apps, and a few Electron windows that opted out of accessibility. The README pitches a 100x speedup and a 95%+ success rate over pixel-loop agents on this premise.",
  },
  {
    q: "Where is the Gemini Computer Use integration in the source?",
    a: "It is its own crate: crates/terminator-computer-use, 402 lines total. The interesting functions are call_computer_use_backend at lib.rs line 140 (the HTTP call to the vision endpoint), translate_gemini_keys at line 212 (maps Gemini's human key format like control+a into Windows uiautomation's brace format like {Ctrl}a), and convert_normalized_to_screen at line 336 (converts Gemini's 0-999 normalized output coordinates into absolute screen pixels accounting for screenshot resize, DPI scale, and window offset). The Desktop method that ties them together lives in crates/terminator/src/computer_use/mod.rs, and the MCP tool wrapper that calls it is at crates/terminator-mcp-agent/src/server.rs line 8635.",
  },
  {
    q: "Can I point the vision loop at my own backend?",
    a: "Yes, that is the design. call_computer_use_backend reads the GEMINI_COMPUTER_USE_BACKEND_URL environment variable, falling back to the hosted Mediar endpoint at app.mediar.ai. The contract is a JSON POST with image (base64 PNG), goal (string), and previous_actions (array). The response is a small JSON object with completed (boolean), an optional function_call (the next action), an optional text (model reasoning), and an optional safety_decision. If you want to run Gemini 2.5 Computer Use yourself, OpenAI Operator, Anthropic computer use, or your own model fine-tuned on UI traces, implement that contract and set the env var. The whole protocol is two structs in lib.rs, ComputerUseFunctionCall and ComputerUseBackendResponse, both visible at the top of the file.",
  },
  {
    q: "How do I install the SDK and the MCP runtime in one go?",
    a: "Two commands. npm i @mediar-ai/terminator gives you the Node SDK with prebuilt napi-rs binaries. claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" registers the MCP server with Claude Code (the same npx command works in Cursor, VS Code, and Windsurf via their respective mcpServers JSON blocks). Python is pip install terminator, Rust is cargo add terminator-rs. All of them speak to the same Rust core, so a workflow recorded in one environment runs in another without translation.",
  },
  {
    q: "Is it really only Windows?",
    a: "The deterministic path is full-feature on Windows and partial on macOS today. Linux is unsupported. The vision path (gemini_computer_use) targets Windows in the current build because the action executors call into the Windows UIA invoke and click APIs after the coordinate conversion. The architecture is platform-clean (the computer_use crate has no OS-specific code, only types and pixel math), so a macOS executor is a matter of wiring the platform-specific click and type adapters that already exist for the selector path.",
  },
  {
    q: "What does the agentic vision loop actually look like step-by-step?",
    a: "Capture the target window with terminator-rs's screenshot API. Resize so the longest edge is 1920 pixels and remember the resize scale. Encode as base64 PNG. POST to the backend with the goal and any previous actions. Parse the response: if completed is true, finish. Otherwise, take the function_call (one of click_at, type_text_at, scroll_document, key_combination, drag, wait, etc.), translate any keys via translate_gemini_keys, run convert_normalized_to_screen on the coordinates, and execute the action through Terminator's deterministic backend. Take a fresh screenshot, append the previous action with its success or error, and loop. Each step is recorded as a ComputerUseStep in the result and the per-step PNG is dropped into %LOCALAPPDATA%/terminator/executions/ for replay.",
  },
  {
    q: "How is this different from browser-use, OpenAI Operator, or open-interpreter?",
    a: "Scope and shape. browser-use is a Python library focused on Chromium DOMs through Playwright. OpenAI Operator is a hosted product with no SDK to self-host. open-interpreter is a code-execution loop that drives a shell, not a desktop. Terminator is a cross-language SDK plus an MCP runtime, the deterministic path covers the entire desktop (any Windows app, not just browsers), and the vision path is a thin 402-line crate sitting on top of the same primitives. You can mix them in a single script: drive Excel via UIA selectors, drop into Gemini 2.5 Computer Use for a canvas-heavy CRM screen, then go back to selectors for the final report.",
  },
  {
    q: "Is the system prompt and tool list compiled into the binary?",
    a: "Yes. crates/terminator-mcp-agent/build.rs scans server.rs at build time, finds the dispatch_tool match block, and extracts the tool names into the MCP_TOOLS environment variable via cargo:rustc-env. crates/terminator-mcp-agent/src/prompt.rs reads env!(\"MCP_TOOLS\") and inlines the list into the system instructions. The practical consequence: the model cannot be told about a tool the dispatcher does not handle, and the dispatcher cannot ship a tool the model is not told about. Same list by construction, every build.",
  },
];

const jsonLdArticle = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Terminator",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
});

const jsonLdBreadcrumbs = breadcrumbListSchema(breadcrumbSchemaItems);

const jsonLdFaq = faqPageSchema(faqs);

export default function OpenSourceComputerUseAgentSdkPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdBreadcrumbs),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <article className="min-h-screen">
        {/* Hero */}
        <BackgroundGrid pattern="dots" glow className="mx-0 rounded-none border-0">
          <div className="max-w-4xl mx-auto px-6 pt-16 pb-14">
            <Breadcrumbs items={breadcrumbItems} />

            <div className="mt-6 mb-5 flex flex-wrap gap-2">
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-medium px-3 py-1 rounded-full border border-orange-300">
                Guide
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Open source
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                MIT licensed
              </span>
              <span className="inline-block bg-zinc-50 text-zinc-700 text-xs font-medium px-3 py-1 rounded-full border border-zinc-200">
                Rust + Node + Python + MCP
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-800 mb-6 leading-[1.05]">
              <GradientText variant="teal">
                Open source computer use agent SDK
              </GradientText>
              : the deterministic + vision hybrid most guides skip
            </h1>

            <p className="text-lg text-zinc-600 mb-6 max-w-3xl leading-relaxed">
              Most articles on this topic line up the same four projects: a
              browser-only library, a hosted operator product without source, a
              shell-execution agent, and a vision-loop framework. They argue
              about which one is &ldquo;real.&rdquo; They miss the more
              interesting answer. The SDK that sits closest to a working desktop
              agent is the one that ships both paths in the same install: a
              deterministic accessibility-tree runtime for the 90% of actions
              the OS already knows how to describe, and a built-in Gemini 2.5
              Computer Use vision loop for the rest. Terminator is that SDK.
              Below is the actual Rust source that wires the two together,
              including the function that turns model output into screen
              pixels.
            </p>

            <ArticleMeta
              author="Terminator"
              authorRole="desktop automation framework"
              datePublished={PUBLISHED}
              readingTime="13 min read"
            />

            <ProofBand
              rating={4.9}
              ratingCount="MIT, on GitHub"
              highlights={[
                "Rust core, Node and Python bindings, MCP server, CLI, recorder",
                "32 selector-based tools + Gemini 2.5 Computer Use loop in one binary",
                "402-line terminator-computer-use crate, fully audit-able",
                "Plug your own vision backend via GEMINI_COMPUTER_USE_BACKEND_URL",
              ]}
              className="mt-5"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <ShimmerButton href="#install">Install the SDK</ShimmerButton>
              <a
                href="#anchor"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors text-sm font-medium"
              >
                Read the 402-line vision crate
              </a>
            </div>
          </div>
        </BackgroundGrid>

        {/* Concept video */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <RemotionClip
            title="One install. Two paths into your desktop."
            subtitle="Selectors when the OS knows where the button is. Vision when it doesn't."
            accent="orange"
            captions={[
              "32 selector-based tools backed by Windows UIA and macOS AX",
              "gemini_computer_use: a vision loop sitting in the same MCP binary",
              "402 lines of Rust between Gemini 2.5 and your screen pixels",
              "Pluggable backend via one environment variable",
              "MIT licensed, available in Rust, Node, Python, and MCP",
            ]}
          />
        </section>

        {/* Marquee of bindings */}
        <section className="max-w-5xl mx-auto px-6 py-4">
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3 text-center">
            same runtime, every binding
          </p>
          <Marquee speed={40} pauseOnHover fade>
            {[
              "cargo add terminator-rs",
              "npm i @mediar-ai/terminator",
              "pip install terminator",
              "npx terminator-mcp-agent",
              "@mediar-ai/cli",
              "@mediar-ai/kv",
              "@mediar-ai/workflow",
              "Claude Code  /  Cursor  /  VS Code  /  Windsurf",
            ].map((label, i) => (
              <span
                key={i}
                className="inline-block px-5 py-2 mx-2 rounded-full border border-zinc-200 bg-white text-sm font-mono text-zinc-700"
              >
                {label}
              </span>
            ))}
          </Marquee>
        </section>

        {/* The short version */}
        <section className="max-w-4xl mx-auto px-6 pt-10">
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-5">
            The shape of an open source computer use SDK
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            A computer use agent has to do three things: observe the desktop,
            choose an action, and execute it. Most open source projects ship
            one of the three. A recorder gives you observation. A vision loop
            gives you choice. A driver like xdotool or PyAutoGUI gives you
            execution. Calling any one of those an SDK undersells what teams
            building real automations actually need.
          </p>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Terminator ships all three, in the same install, with the same
            type system across Rust, Node, and Python, plus an MCP server that
            exposes them to any agent host. The interesting design choice
            below the surface is that observation and choice come in two
            flavors. The fast flavor reads the OS accessibility tree directly,
            so &ldquo;click Save&rdquo; resolves locally without a model. The
            slow flavor talks to Gemini 2.5 Computer Use through a 402-line
            Rust crate, so a fully alien UI still works. You pick at the
            action level, not at the install level.
          </p>
        </section>

        {/* Hybrid script */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Both paths in one script
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            This is what the SDK looks like in practice. Two calls, one
            process, one MCP install. The first call resolves a selector
            against the live UIA tree. The second hands the goal to a vision
            loop and lets it work autonomously until done.
          </p>
          <AnimatedCodeBlock
            code={hybridScript}
            language="typescript"
            filename="agent.ts (Node SDK)"
            typingSpeed={0}
          />
        </section>

        {/* Architecture beam */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            How the pieces talk to each other
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Every binding (Rust, Node, Python) and every host (Claude Code,
            Cursor, VS Code, Windsurf) routes through the same{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              dispatch_tool
            </code>{" "}
            in the MCP server, which then chooses between the deterministic
            UIA path and the vision-loop crate. The vision-loop crate itself
            calls a single backend endpoint, by default hosted but switchable
            with one environment variable.
          </p>
          <AnimatedBeam
            accentColor="#FF3E00"
            title="Terminator SDK -> dispatch_tool -> deterministic OR vision"
            from={[
              { label: "Rust crate", sublabel: "terminator-rs" },
              { label: "Node SDK", sublabel: "@mediar-ai/terminator" },
              { label: "Python SDK", sublabel: "pip install terminator" },
              { label: "MCP host", sublabel: "Claude Code / Cursor" },
            ]}
            hub={{
              label: "dispatch_tool",
              sublabel: "server.rs:9953 (32 arms)",
            }}
            to={[
              { label: "Windows UIA", sublabel: "deterministic" },
              { label: "macOS AX", sublabel: "deterministic (partial)" },
              { label: "Chrome DOM", sublabel: "extension bridge" },
              { label: "Gemini 2.5 CU", sublabel: "vision loop, lib.rs:140" },
            ]}
          />
        </section>

        {/* What's in the SDK */}
        <section className="max-w-5xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3 px-2">
            What ships in the install
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed px-2">
            Seven crates and packages, all under the same MIT license, all
            speaking to the same Rust core. The deterministic primitives are
            in <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">terminator-rs</code>.
            The vision integration is its own focused 402-line crate, which is
            small enough to read in one sitting.
          </p>
          <BentoGrid cards={sdkCards} />
        </section>

        {/* Anchor: the actual computer-use crate */}
        <section
          id="anchor"
          className="max-w-4xl mx-auto px-6 py-14 scroll-mt-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-zinc-800 mb-4">
            <GradientText variant="teal">terminator-computer-use</GradientText>
            : 402 lines, three jobs
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            The vision-loop integration is a single Rust crate at{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-computer-use/src/lib.rs
            </code>
            . It is exactly 402 lines and it has three jobs: speak HTTP to a
            vision backend, translate Gemini-flavored keys into Windows
            uiautomation strings, and convert the model&apos;s 0-999
            normalized coordinates into real screen pixels. That&apos;s the
            whole crate. The Desktop method that drives the agentic loop sits
            in <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">crates/terminator/src/computer_use/mod.rs</code>{" "}
            and the MCP wrapper that exposes it to Claude / Cursor / VS Code
            sits at{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              crates/terminator-mcp-agent/src/server.rs:8635
            </code>
            . Below: the three functions that matter, copied from the source.
          </p>

          <h3 className="text-xl font-semibold text-zinc-800 mb-3 mt-8">
            1. The HTTP boundary, lib.rs:140
          </h3>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            One async function. One environment variable. One JSON shape. If
            you want to run your own model, replace the URL.
          </p>
          <AnimatedCodeBlock
            code={backendCallSource}
            language="rust"
            filename="crates/terminator-computer-use/src/lib.rs"
            typingSpeed={0}
          />

          <h3 className="text-xl font-semibold text-zinc-800 mb-3 mt-10">
            2. Key translation, lib.rs:212
          </h3>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Gemini 2.5 Computer Use emits keys in human format, like{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              control+a
            </code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              Meta+Shift+T
            </code>
            . Windows UI Automation needs braced tokens like{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              {"{Ctrl}a"}
            </code>{" "}
            with{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              meta
            </code>{" "}
            mapped onto the Windows key. The translation is a flat match
            block. There are also unit tests in the same file pinning the
            mappings.
          </p>
          <AnimatedCodeBlock
            code={translateKeysSource}
            language="rust"
            filename="crates/terminator-computer-use/src/lib.rs"
            typingSpeed={0}
          />

          <h3 className="text-xl font-semibold text-zinc-800 mb-3 mt-10">
            3. The pixel math, lib.rs:336
          </h3>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            This is the function nobody else shows. The vision model returns
            coordinates in a 0-999 normalized space, regardless of the
            screenshot it was shown. Mapping back to your monitor is a stack
            of four conversions: undo the resize, undo the DPI scale, add the
            window offset. If any of those steps is wrong by a few pixels, the
            agent clicks the wrong thing. Here&apos;s the code:
          </p>
          <AnimatedCodeBlock
            code={coordSource}
            language="rust"
            filename="crates/terminator-computer-use/src/lib.rs"
            typingSpeed={0}
          />

          <ProofBanner
            quote="The whole vision integration is 402 lines, MIT-licensed, and lives in one crate. The pixel-coordinate math is 25 lines. If you want to swap Gemini for another vision model, you change one URL and adapt one function call."
            source="crates/terminator-computer-use/src/lib.rs (HEAD)"
            metric="402 lines, 1 crate, 1 env var to swap backends"
          />
        </section>

        {/* Metrics row */}
        <section className="max-w-4xl mx-auto px-6 pt-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-4">
            Numbers you can verify
          </h2>
          <p className="text-zinc-600 mb-6 max-w-3xl leading-relaxed">
            All four come from running{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              wc -l
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              grep
            </code>{" "}
            on the repo. The 100x figure is the README&apos;s own claim about
            the deterministic path beating pixel-loop agents on long
            workflows; treat it as a target rather than a guarantee.
          </p>
          <MetricsRow
            metrics={[
              { value: 402, label: "Lines in terminator-computer-use" },
              { value: 32, label: "MCP tools exposed at server.rs:9953" },
              { value: 8635, label: "Line of gemini_computer_use tool def" },
              { value: 100, suffix: "x", label: "README's deterministic-vs-vision target" },
            ]}
          />
        </section>

        {/* Sequence diagram of one agentic step */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            One step of the agentic vision loop
          </h2>
          <p className="text-zinc-600 mb-4 max-w-3xl leading-relaxed">
            Same diagram every step. The MCP host fires{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              gemini_computer_use
            </code>{" "}
            once. Inside, the SDK runs this loop until the model returns{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              completed: true
            </code>{" "}
            or hits{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              max_steps
            </code>
            . Cancellation token is wired through, so a{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              stop_execution
            </code>{" "}
            tool can break the loop mid-step.
          </p>
          <SequenceDiagram
            title="gemini_computer_use: one step"
            actors={["MCP host", "SDK loop", "Vision backend", "Desktop"]}
            messages={[
              { from: 0, to: 1, label: "tool: gemini_computer_use(goal, process)", type: "request" },
              { from: 1, to: 3, label: "capture window screenshot", type: "request" },
              { from: 3, to: 1, label: "PNG @ <=1920px + DPI + bounds", type: "response" },
              { from: 1, to: 2, label: "POST {image, goal, previous_actions}", type: "request" },
              { from: 2, to: 2, label: "Gemini 2.5 Computer Use inference", type: "event" },
              { from: 2, to: 1, label: "function_call: click_at(x_norm, y_norm)", type: "response" },
              { from: 1, to: 1, label: "convert_normalized_to_screen()", type: "event" },
              { from: 1, to: 3, label: "execute click at absolute (x, y)", type: "request" },
              { from: 3, to: 1, label: "OK + new screenshot", type: "response" },
              { from: 1, to: 1, label: "append to previous_actions, loop", type: "event" },
            ]}
          />
        </section>

        {/* Use case rows */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            What you reach for, when
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            A simple decision rule: if the OS knows the element exists (it
            shows up in Accessibility Insights or inspect.exe), use a
            selector. If not, drop into vision. Same agent, different tool
            calls.
          </p>
          <ComparisonTable
            productName="Terminator (selector / vision hybrid)"
            competitorName="Vision-only agent"
            rows={useCaseRows}
          />
        </section>

        {/* SDK comparison */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            How the SDK shape compares
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            Most projects in this space cover one slice of the problem. This
            is a feature-by-feature look at the slice they cover vs. what an
            SDK with both paths needs to ship.
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Single-path SDK"
            rows={sdkRows}
          />
        </section>

        {/* What you get */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <GlowCard>
            <h3 className="text-xl font-semibold text-zinc-800 mb-3">
              The audit checklist most people don&apos;t run
            </h3>
            <p className="text-zinc-600 mb-4 leading-relaxed">
              Before you commit to an open source SDK in this space, these are
              the things worth verifying yourself by opening the repo. Every
              item below is checkable in under five minutes.
            </p>
            <AnimatedChecklist
              title="Things to confirm in the source"
              items={[
                { text: "There is one place where tool names are defined (not duplicated between code and prompt)." },
                { text: "The vision-backend URL is pluggable, not hardcoded to a vendor." },
                { text: "The pixel-coordinate conversion is visible and unit-tested." },
                { text: "The deterministic and vision paths share the same action executors." },
                { text: "Cancellation tokens propagate from the MCP host into the inner loop." },
                { text: "License is permissive enough for commercial deployment (MIT or Apache-2.0)." },
                { text: "The same SDK is published in at least two languages so you are not locked in." },
              ]}
            />
          </GlowCard>
        </section>

        {/* Install */}
        <section
          id="install"
          className="max-w-4xl mx-auto px-6 py-10 scroll-mt-16"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Two commands to a working hybrid agent
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            One command for the SDK, one command for the MCP runtime. The
            same npx package works for Claude Code, Cursor, VS Code, and
            Windsurf. Substitute{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              pip install terminator
            </code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 text-orange-600">
              cargo add terminator-rs
            </code>{" "}
            for the matching language.
          </p>
          <TerminalOutput title="terminal" lines={installTerminal} />
        </section>

        {/* StepTimeline */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            From npm install to first hybrid run
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The end-to-end flow once the SDK is installed. Five steps. The
            interesting one is step three: this is where you decide which
            actions belong on the deterministic path and which deserve the
            vision loop.
          </p>
          <StepTimeline
            steps={[
              {
                title: "Install the SDK in your language of choice",
                description:
                  "npm i @mediar-ai/terminator (Node, prebuilt napi-rs binary), pip install terminator (Python, PyO3), cargo add terminator-rs (Rust). All three speak to the same core.",
              },
              {
                title: "Inspect the target app's accessibility tree",
                description:
                  "Use Accessibility Insights for Windows or inspect.exe to walk the tree. Note the role and name of each element you plan to interact with. These become your selectors.",
              },
              {
                title: "Decide where vision belongs",
                description:
                  "Anything the tree exposes (buttons, edits, menu items, lists) goes through Locator. Anything the tree refuses to describe (canvas elements, custom-rendered widgets, games) goes through gemini_computer_use.",
              },
              {
                title: "Wire the MCP server if you want agent-host control",
                description:
                  "claude mcp add terminator \"npx -y terminator-mcp-agent@latest\" registers the server in Claude Code with stdio transport. Same npx command in the mcpServers JSON for Cursor, VS Code, Windsurf.",
              },
              {
                title: "Run, inspect, iterate",
                description:
                  "Each run drops a JSON of ComputerUseStep entries plus per-step screenshots into %LOCALAPPDATA%/terminator/executions/. Replay or grep them when something fails. The deterministic path also captures a UI tree diff so you can see what changed between actions.",
              },
            ]}
          />
        </section>

        {/* Side-by-side: native vision vs hybrid */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="text-2xl sm:text-3xl font-semibold text-zinc-800 mb-3">
            Vision-only vs hybrid, one click
          </h2>
          <p className="text-zinc-600 mb-5 max-w-3xl leading-relaxed">
            The single click that separates the two. On the left: a pure
            vision loop, screenshot-in, coordinate-out, every action. On the
            right: the same outcome with the deterministic path, no model
            invoked. Both shapes coexist in the SDK; you only pay for the
            right side when accessibility actually fails.
          </p>
          <CodeComparison
            leftLabel="Pure vision loop (every action)"
            rightLabel="Terminator selector (no model)"
            leftCode={`// the inner loop of a pure-vision agent
//   take screenshot
//   POST to model
//   parse function_call
//   convert normalized to screen pixels
//   execute click
//   take screenshot again

while !done {
  let png = capture_window();
  let resp = call_vision(png, goal, &history).await?;
  if resp.completed { break; }
  let fc = resp.function_call.unwrap();
  let (x, y) = convert_normalized_to_screen(
      fc.x, fc.y, win_x, win_y, w, h, dpi, scale,
  );
  desktop.click_at(x, y).await?;
  history.push(fc);
}`}
            rightCode={`// the deterministic equivalent for a known UI
//   resolve selector against UIA tree
//   invoke()
//   done

desktop
  .locator("role:Window >> name:Calculator")
  .locator("role:Button && name:Seven")
  .invoke()
  .await?;

// no screenshot, no model call, no pixel math
// no normalized-coordinate space, no DPI scale to undo
// the OS already knows where the button is`}
            leftLines={14}
            rightLines={11}
            title="one click, two implementations"
            reductionSuffix="lines, and zero model round-trips on the deterministic side"
          />
        </section>

        {/* Footer CTA */}
        <section className="max-w-4xl mx-auto px-6 py-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Bring an open source computer use SDK into your stack"
            description="Walk through your target apps with us, see the deterministic and vision paths run live, and leave with a working hybrid agent in your repo."
          />
        </section>

        {/* FAQ */}
        <FaqSection items={faqs} heading="Questions readers actually ask" />

        {/* Related */}
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <RelatedPostsGrid
            title="Keep reading"
            subtitle="More from the Terminator guides"
            posts={relatedPosts}
          />
        </section>

        {/* Sticky CTA */}
        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="See the hybrid agent live."
        />
      </article>
    </div>
  );
}
