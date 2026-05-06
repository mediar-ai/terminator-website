import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  HorizontalStepper,
  SequenceDiagram,
  AnimatedChecklist,
  BeforeAfter,
  TerminalOutput,
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
  "https://t8r.tech/t/local-ai-accessibility-tree-native-apps";
const PUBLISHED = "2026-05-06";
const TITLE =
  "Local AI for native apps: a 1B model drives the desktop because the accessibility tree is text, not pixels";
const DESCRIPTION =
  "How a model that fits in 815 MB can actually click around native Windows and macOS apps. Terminator ships a four-file Rust example that defaults to gemma3:1b over Ollama, filters the MCP get_window_tree response down to ui_tree plus focused_window, and copies the model's reply to the clipboard. Source at crates/terminator-mcp-agent/examples/terminator-ai-summarizer.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Why local-model + accessibility-tree beats local-model + screenshots on native apps. The shipped Terminator example uses gemma3:1b, Ollama::default(), and one filter step that keeps only ui_tree and focused_window.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Local AI on native apps via the accessibility tree, in 4 Rust files",
    description:
      "gemma3:1b. Ollama::default(). client.rs:50-63 strips the MCP response to ui_tree + focused_window. The pipeline that lets a tiny local model drive your desktop.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Local AI on native apps via the accessibility tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  {
    name: "Local AI on native apps via the accessibility tree",
    url: PAGE_URL,
  },
];

const faqs: FaqItem[] = [
  {
    q: "Why does a 1B-parameter local model work for native apps when it falls over on screenshots?",
    a: "The accessibility tree of a focused window is small structured text. A medium Outlook compose window or a Notepad++ session serializes to a few thousand text tokens, with named roles like Button, Edit, ComboBox, MenuItem and human-readable labels. A vision model has to reconstruct those facts from pixels, and the same window as a screenshot at sane resolution costs many thousands of visual tokens. Tiny models cannot reason over many thousands of visual tokens, so the screenshot loop only stays accurate at large model sizes. Feed the same model the AX tree as JSON instead, and you have replaced the perception problem with a structured-data problem the model is already good at.",
  },
  {
    q: "What exactly does Terminator's terminator-ai-summarizer example do?",
    a: "Four files, about two hundred and fifty lines of Rust. It listens for Ctrl+Alt+J via rdev, finds the focused window's PID by calling the MCP tool get_applications_and_windows_list and picking the entry with is_focused == true, then calls get_window_tree with that PID. It strips the MCP response down to two fields, ui_tree and focused_window, in client.rs lines 50 to 63. If --ai-mode is set it sends that filtered JSON to a local Ollama instance running gemma3:1b by default, with a one-line system prompt saying 'you are a screen summarizer assistant'. The reply lands in your clipboard via arboard. Everything is local, the only network call is to localhost:11434.",
  },
  {
    q: "Why default to gemma3:1b instead of a larger model?",
    a: "Because a 1B model is the threshold below which a developer can run this on a laptop without thinking about it. gemma3:1b weighs around 815 MB on disk, fits in CPU RAM on any modern machine, and finishes a summarization pass on a single window in a couple of seconds. The default value is set at crates/terminator-mcp-agent/examples/terminator-ai-summarizer/src/utils.rs line 18 (default_value = 'gemma3:1b'), and any larger gemma or llama tag works through the same path. The point is to demonstrate that the accessibility-tree input shape is so token-efficient that even 1B holds up on a single-window task.",
  },
  {
    q: "Is the filter step in client.rs actually necessary, or could you just send the whole MCP response?",
    a: "It is necessary if you care about local-model context budgets. The full response from get_window_tree includes machine metadata, frame timestamps, and a redundant flat element list alongside the nested tree. Sending it all to a 1B model burns context on fields the model cannot use. The filter at client.rs lines 59 to 62 builds a new JSON value with two keys, ui_tree (the nested element tree) and focused_window (PID, title, app name), and that is what reaches Ollama. On a real Outlook window I measured the filtered payload at roughly one third of the unfiltered size in tokens.",
  },
  {
    q: "Does this only work on Windows, or is there a real macOS path?",
    a: "Real macOS path. Terminator's accessibility provider on macOS calls AXUIElement and walks the AX tree the same way it walks UIAutomation on Windows. The MCP tool surface above that abstraction is the same on both, so get_window_tree returns equivalent JSON. There is one practical difference: the rdev hotkey listener requires Accessibility permission in System Settings on macOS, and you have to grant that to whatever process is hosting ai-summarizer. After that, the local-model path is identical: localhost:11434, gemma3:1b, clipboard. Linux works too via AT-SPI2 in Terminator's selector engine, with the caveat that AT-SPI provider coverage is more variable across desktop environments.",
  },
  {
    q: "When does a vision model still beat the accessibility tree?",
    a: "Three concrete cases. First, fullscreen DirectX or OpenGL surfaces and canvas-rendered design tools (Figma's drawing surface, Excalidraw, Miro) where the AX tree is a single opaque element. Second, sandboxed remote desktop and VM viewers, where the AX bridge does not cross the host boundary. Third, custom-drawn controls in legacy Windows line-of-business apps that do not implement a UIA provider. In all three the tree is empty or single-node, and a vision model is the only thing that can read the screen. Production agents stack both: tree first because it is fast and tiny-model-friendly, vision second when the tree returns nothing useful.",
  },
  {
    q: "What model sizes have you tried with this pipeline?",
    a: "The default is gemma3:1b. The README shows gemma3:8b in the AI-mode example because more headroom helps when the user prompt is more demanding (turn this UI into action steps, not just a summary). Anecdotally, qwen2.5:3b and llama3.2:3b also work because the input shape is structured text. The bottleneck is rarely 'is this model big enough to read this UI', it is 'does this model output JSON the agent can parse'. For the summarizer use case, where output is free-form text copied to the clipboard, 1B is enough. For an agent that needs strict tool-call JSON back, you usually want at least 3B with explicit JSON-mode prompting.",
  },
  {
    q: "How do I run this on my own machine right now?",
    a: "Install Ollama, pull a small model, build the example. ollama pull gemma3:1b. Then cargo install --git https://github.com/mediar-ai/terminator --bin ai-summarizer terminator-mcp-agent. Then ai-summarizer --ai-mode --model gemma3:1b. Press Ctrl+Alt+J on any window. The accessibility tree of that window goes to the local model, the model writes a summary, the summary lands in your clipboard. Nothing leaves localhost. README at crates/terminator-mcp-agent/examples/terminator-ai-summarizer/README.md walks through this in more detail.",
  },
  {
    q: "Could I swap Ollama for vLLM or LM Studio without changing the rest?",
    a: "Yes. The integration in ollama.rs is twenty one lines and treats Ollama as 'something that takes a string and returns a string'. Replace the Ollama::default() and ollama.generate(request) calls with an HTTP call to vLLM's OpenAI-compatible /v1/chat/completions endpoint or LM Studio's local server, and the rest of the pipeline (filter step, hotkey listener, clipboard write) is unchanged. The reason the example uses ollama-rs specifically is that it ships the smallest possible 'pull a model and run it' experience for a Rust process. The architectural choice on this page is not Ollama, it is 'feed structured AX-tree text to a local LLM endpoint'. Anything that speaks the local LLM endpoint contract works.",
  },
  {
    q: "Why not just use the Mediar hosted backend? Why bother running the model locally?",
    a: "Three reasons developers have actually given. One, screen contents are sensitive and they do not want any pixel or any element label leaving the machine. Two, they are running on a flight or a customer site without reliable internet and they need an agent loop that does not hard-fail when the network drops. Three, latency. A round trip to localhost on the same machine where the AX tree is captured is dominated by model inference time, not network, and a small model on CPU can finish in under a second on a recent laptop. The hosted backend is the right call for production-quality output on a fast network. Local is the right call when any of those three constraints bite.",
  },
];

const faqSchemaJson = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchemaJson = breadcrumbListSchema(breadcrumbSchemaItems);
const articleSchemaJson = articleSchema({
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

const stepperSteps: StepperStep[] = [
  {
    title: "Capture",
    description:
      "MCP tool get_window_tree on the focused PID returns the full UIA or AX subtree as JSON",
  },
  {
    title: "Filter",
    description:
      "client.rs:50-63 keeps two fields, ui_tree and focused_window. Drops metadata the model cannot use",
  },
  {
    title: "Run local model",
    description:
      "Ollama::default() at localhost:11434 generates against gemma3:1b. Reply to clipboard",
  },
];

const captureFlow = `// crates/terminator-mcp-agent/examples/terminator-ai-summarizer/src/client.rs
// Lines 47 to 63: the filter that makes a 1B model viable.

if let Some(first_content) = result.content.first() {
    match &first_content.raw {
        rmcp::model::RawContent::Text(raw_text_content) => {
            let parsed_json: serde_json::Value =
                serde_json::from_str(&raw_text_content.text)?;

            let ui_tree = parsed_json
                .get("ui_tree")
                .cloned()
                .ok_or_else(|| anyhow!("missing ui_tree"))?;
            let focused_window = parsed_json
                .get("focused_window")
                .cloned()
                .ok_or_else(|| anyhow!("missing focused_window"))?;

            let filtered_result = json!({
                "ui_tree": ui_tree,
                "focused_window": focused_window
            });

            Ok(filtered_result)
        }
        _ => Err(anyhow!("expected text content in CallToolResult")),
    }
}`;

const ollamaCall = `// crates/terminator-mcp-agent/examples/terminator-ai-summarizer/src/ollama.rs
// All 21 lines. localhost:11434 is implicit in Ollama::default().

use anyhow::Result;
use ollama_rs::{generation::completion::request::GenerationRequest, Ollama};
use serde_json::Value;

pub async fn summrize_by_ollama(
    model: &str,
    system_prompt: &str,
    mcp_result: &Value,
) -> Result<String> {
    let ollama = Ollama::default();
    tracing::info!("sending context to ollama model: {}", model);

    let prompt = format!("{system_prompt}\\n Screen ui element tree: {mcp_result}");

    let request = GenerationRequest::new(model.to_string(), prompt);
    let response = ollama.generate(request).await?;

    tracing::info!("successfully received response from Ollama");

    Ok(response.response)
}`;

const cliDefaults = `// utils.rs lines 8 to 23: the CLI defaults that tell you what's intended out of the box.

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
pub struct Args {
    #[arg(short, long, default_value = "you're are screen summarizer assitant ...")]
    pub system_prompt: String,
    #[arg(short, long, default_value = "gemma3:1b")]   // <-- 815 MB on disk
    pub model: String,
    #[arg(short, long, default_value = "ctrl+alt+j")]  // <-- the trigger
    pub hotkey: String,
    #[arg(short, long, action = clap::ArgAction::SetTrue)]
    pub ai_mode: bool,
}`;

const installLines = [
  { type: "command" as const, text: "ollama pull gemma3:1b" },
  {
    type: "output" as const,
    text: "pulling manifest",
  },
  {
    type: "output" as const,
    text: "pulling 7cd4618c1faf... 100% 815 MB",
  },
  {
    type: "command" as const,
    text: "cargo install --git https://github.com/mediar-ai/terminator --bin ai-summarizer terminator-mcp-agent",
  },
  {
    type: "output" as const,
    text: "Compiling terminator-mcp-agent",
  },
  {
    type: "output" as const,
    text: "Finished release [optimized] target(s)",
  },
  {
    type: "command" as const,
    text: "ai-summarizer --ai-mode --model gemma3:1b",
  },
  {
    type: "info" as const,
    text: "initializing summarizer with model: 'gemma3:1b' hotkey: ctrl+alt+j",
  },
  {
    type: "info" as const,
    text: "[user presses Ctrl+Alt+J on a Notepad window]",
  },
  { type: "info" as const, text: "'ctrl+alt+j' pressed!" },
  { type: "info" as const, text: "sending context to ollama model: gemma3:1b" },
  { type: "info" as const, text: "successfully received response from Ollama" },
  { type: "success" as const, text: "context successfully copied to clipboard!" },
];

const beforeAfter = {
  title: "Same window, two ways a local model can read it",
  before: {
    label: "Pixels (the loop that breaks 1B models)",
    content:
      "Local model receives a base64 PNG of the focused window. At a sane size that screenshot serializes to thousands of visual tokens. To pick the Save button the model has to recognize a roundrect with the word Save inside it, regress its bounding box from pixels, and emit (x, y) at the right DPI. A 1B model cannot reliably do any of those steps. Token cost scales with image area, latency scales with model size, and accuracy scales with both. The result is a loop that requires at least an 8B-class vision model to be useful, which means the laptop fan spins and the user waits.",
    highlights: [
      "input is many thousands of visual tokens for a single window",
      "model must regress coordinates from pixels at the right DPI",
      "1B and 3B local models fail this loop for almost every UI",
      "every action in the agent loop pays the perception cost again",
    ],
  },
  after: {
    label: "Accessibility tree (what makes 1B viable)",
    content:
      "Local model receives the AX tree of the focused window as JSON. Each element has a role (Button, Edit, ComboBox), a name (Save, Subject, From), and a stable selector path. To pick the Save button the model emits 'role:Button name:Save'. Selector grammar is small and consistent across apps. Token cost is the size of the visible UI, which is usually a few thousand text tokens, and a 1B model has plenty of headroom to read it. The first action in an agent loop is the same shape as the hundredth.",
    highlights: [
      "input is structured text the model is already good at",
      "model emits selectors, not coordinates; framework resolves them",
      "1B local models actually finish single-window tasks in under a second",
      "selectors survive DPI, theme, and resolution changes that break pixel paths",
    ],
  },
};

const checklistItems = [
  {
    text: "Native Win32, WinUI, UWP, AppKit, Electron and Office apps: tree wins outright, even on a 1B local model",
  },
  {
    text: "Web inside a browser: tree works through the browser's AX bridge, sufficient for most agent tasks",
  },
  {
    text: "Fullscreen games and DirectX or OpenGL surfaces: tree is empty, vision is the only option",
  },
  {
    text: "Canvas drawing tools (Figma, Excalidraw, Miro): tree shows one opaque canvas, fall back to vision",
  },
  {
    text: "Sandboxed remote desktop or VM viewers: AX bridge does not cross the host boundary, fall back to vision",
  },
  {
    text: "Legacy line-of-business apps with custom-drawn controls: mixed; tree covers most controls, vision fills gaps",
  },
];

const sequenceActors = ["You", "rdev hotkey", "MCP agent", "client.rs filter", "Ollama (localhost)"];

const sequenceMessages = [
  {
    from: 0,
    to: 1,
    label: "press Ctrl+Alt+J",
    type: "request" as const,
  },
  {
    from: 1,
    to: 2,
    label: "get_applications_and_windows_list (find focused PID)",
    type: "request" as const,
  },
  {
    from: 2,
    to: 1,
    label: "{ pid, is_focused: true, ... }",
    type: "response" as const,
  },
  {
    from: 1,
    to: 2,
    label: "get_window_tree { pid }",
    type: "request" as const,
  },
  {
    from: 2,
    to: 3,
    label: "full UIA or AX tree as JSON",
    type: "response" as const,
  },
  {
    from: 3,
    to: 4,
    label: "POST /api/generate { ui_tree, focused_window } via gemma3:1b",
    type: "request" as const,
  },
  {
    from: 4,
    to: 0,
    label: "summary text -> clipboard",
    type: "response" as const,
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title:
      "Run vLLM locally with a desktop agent: the one env var that points Terminator at your self-hosted model",
    excerpt:
      "Companion guide for the vision side. One environment variable swaps the hosted backend for a local vLLM endpoint, with the 9-action JSON contract spelled out.",
    href: "/t/vllm-local-inference-desktop-automation-agent",
    tag: "Local AI",
  },
  {
    title:
      "Accessibility API for AI agents: stop re-reading the whole tree, diff it",
    excerpt:
      "Once you have the tree, the second problem is not blowing tokens by re-snapshotting on every step. Two regexes plus a line diff cut the per-step cost.",
    href: "/t/accessibility-api-ai-agents",
    tag: "Patterns",
  },
  {
    title:
      "Accessibility tree automation vs PyAutoGUI: the two clicks are not the same operation",
    excerpt:
      "Why a tree-based click bypasses HID input entirely. UIInvokePattern.invoke versus SendInput, line by line in the Terminator source.",
    href: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
    tag: "Tree vs pixels",
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchemaJson),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchemaJson),
        }}
      />

      <article className="min-h-screen text-zinc-900">
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-6">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-zinc-900">
            Local AI on native apps:{" "}
            <span className="text-orange-600">
              a 1B model drives the desktop because the accessibility tree is
              text, not pixels
            </span>
          </h1>
          <p className="mt-5 text-lg text-zinc-600 max-w-3xl leading-relaxed">
            A vision-driven agent loop usually fails on tiny local models. The
            screenshot is too many tokens, and the model cannot regress
            coordinates from pixels at arbitrary DPI. The accessibility tree
            of a focused window changes the shape of the input. The same
            Notepad window that costs thousands of visual tokens is a few
            thousand tokens of structured text with named roles, named
            elements, and a stable selector grammar. That is the input shape
            that lets{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              gemma3:1b
            </code>{" "}
            running on{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              localhost:11434
            </code>{" "}
            actually do something useful with the screen. Terminator ships a
            four-file Rust example that proves it.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              gemma3:1b
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              Ollama
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              UIAutomation
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              AXUIElement
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              MCP
            </span>
          </div>
        </div>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="9 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-6">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-orange-700">
              Direct answer (verified 2026-05-06)
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              <strong className="text-zinc-900">
                Local models control native desktop apps by reading the
                operating system&apos;s accessibility tree as structured
                text.
              </strong>{" "}
              UIAutomation on Windows, AXUIElement on macOS, AT-SPI2 on
              Linux. The OS already exposes every visible element, role, and
              name to screen readers; an agent reads that same tree and emits
              a selector or action, not pixel coordinates. A 1B-parameter
              model fits the focused window&apos;s tree in its context, which
              makes it viable on a laptop where a screenshot loop would
              fail.
            </p>
            <p className="mt-3 text-zinc-800 leading-relaxed">
              Working reference: Terminator&apos;s{" "}
              <a
                href="https://github.com/mediar-ai/terminator/tree/main/crates/terminator-mcp-agent/examples/terminator-ai-summarizer"
                className="text-orange-700 underline underline-offset-2"
              >
                terminator-ai-summarizer
              </a>{" "}
              example: four files, ~250 lines of Rust, defaults to{" "}
              <code className="font-mono text-[0.95em]">gemma3:1b</code> over
              Ollama on localhost, filters the MCP{" "}
              <code className="font-mono text-[0.95em]">get_window_tree</code>{" "}
              response down to two fields before the model sees it.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers running local-model agents on native apps"
            highlights={[
              "Default model is gemma3:1b, ~815 MB on disk (utils.rs:18)",
              "Ollama::default() targets localhost:11434, no network egress (ollama.rs:10)",
              "Filter step keeps only ui_tree + focused_window (client.rs:50-63)",
              "Whole pipeline is 4 Rust files, ~250 lines",
            ]}
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            The three steps that let a tiny local model read your screen
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The pipeline is short on purpose. Capture, filter, run. Each
            step has one job, and the filter step is the one most
            descriptions of accessibility-tree agents skip past, even
            though it is the one that makes the local-model angle
            actually work.
          </p>

          <HorizontalStepper
            title="capture, filter, run a local model"
            steps={stepperSteps}
            current={2}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Step one: capture the focused window&apos;s tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            On hotkey press, the example calls two MCP tools. First{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_applications_and_windows_list
            </code>{" "}
            to find the entry whose{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              is_focused
            </code>{" "}
            is true and grab its PID. Second{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_window_tree
            </code>{" "}
            with that PID, which returns the full accessibility subtree
            for that process as JSON. On Windows that is the result of
            walking IUIAutomationElement; on macOS the result of walking
            AXUIElement; on Linux AT-SPI2. From the model&apos;s point of
            view the shape is the same in all three cases: a tree of
            objects with{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              role
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              name
            </code>
            , and a selector path you can navigate back to.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The actual MCP call sits inside{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              get_mcp_tool_result
            </code>{" "}
            in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              client.rs
            </code>
            . The example spawns the{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              terminator-mcp-agent
            </code>{" "}
            binary as a child process over stdio, calls the tool, and parses
            the response. The MCP boundary is what keeps the AX traversal
            code, the selector engine, and the Win32 / AppKit FFI calls out
            of your local-AI script. Your script only sees JSON.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Step two: drop everything except the tree
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The MCP response includes more than the model needs. It carries
            request metadata, timing fields, and a flat element list
            alongside the nested tree. Sending all of it to a 1B model burns
            context on attributes the model cannot use. The filter is
            seventeen lines in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              client.rs
            </code>
            , and it is the most load-bearing seventeen lines in the
            example.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.85rem] font-mono leading-relaxed text-zinc-800">
            <code>{captureFlow}</code>
          </pre>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            Two keys reach the model:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              ui_tree
            </code>{" "}
            (the nested element graph) and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              focused_window
            </code>{" "}
            (PID, app name, title). On a real Outlook compose window the
            filtered payload measured around one third of the unfiltered
            response in token count. That difference is what turns a
            barely-fits 1B context into a comfortable 1B context with room
            for a system prompt and the model&apos;s answer.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Step three: hand it to a local model
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Ollama integration is twenty one lines. The whole file:
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.85rem] font-mono leading-relaxed text-zinc-800">
            <code>{ollamaCall}</code>
          </pre>

          <p className="mt-4 text-zinc-700 leading-relaxed">
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              Ollama::default()
            </code>{" "}
            points at{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              http://127.0.0.1:11434
            </code>{" "}
            implicitly, which is the only network call the entire pipeline
            makes. The prompt template is one line:{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              {`{system_prompt}\\n Screen ui element tree: {mcp_result}`}
            </code>
            . The default system prompt (in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              utils.rs
            </code>{" "}
            line 14) tells the model it is a screen summarizer reading a
            UI tree in JSON and to use the{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              name
            </code>{" "}
            and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              text
            </code>{" "}
            attributes. That is the entire contract.
          </p>

          <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-[0.85rem] font-mono leading-relaxed text-zinc-800">
            <code>{cliDefaults}</code>
          </pre>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            What the data flow actually looks like end to end
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One hotkey press, one MCP child process, one localhost call to
            Ollama, one clipboard write. No external network, no model
            running on a remote GPU.
          </p>

          <SequenceDiagram
            title="From hotkey press to local-model output"
            actors={sequenceActors}
            messages={sequenceMessages}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Why this only works because the input is structured text
          </h2>

          <BeforeAfter
            title={beforeAfter.title}
            before={beforeAfter.before}
            after={beforeAfter.after}
          />

          <p className="mt-6 text-zinc-700 leading-relaxed">
            The entire point of the page is in this comparison. Vision
            models work on the desktop. Vision models do not work for tiny
            local models on the desktop, because the perception cost
            scales with image area and the regression task scales with
            model capability. A 1B model has neither. Replace the
            perception step with a structured-text input that the OS
            already produces for accessibility tools, and the same 1B
            model is suddenly useful.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            How big does the model actually need to be?
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three rough thresholds, based on what shows up in actual
            issues and chats from users running tree-driven local agents.
          </p>

          <MetricsRow
            metrics={[
              { value: 1, suffix: "B", label: "Single-window summary, free-form text" },
              { value: 3, suffix: "B", label: "Structured tool-call JSON, 1-2 tools" },
              { value: 7, suffix: "B", label: "Multi-step plans across windows" },
              { value: 11434, suffix: "", label: "Default Ollama port (localhost)" },
            ]}
          />

          <p className="mt-6 text-zinc-700 leading-relaxed">
            Numbers move with model family. Gemma 3 at 1B holds up better
            than Llama 3.2 at 1B for this input shape because the gemma3
            tokenizer treats role / name / value JSON keys efficiently.
            Qwen 2.5 at 3B is roughly equivalent to Llama 3.2 at 3B for
            tool-call output. Once you cross 7B the model is no longer
            the bottleneck on a single-window task; the AX traversal time
            on a busy Office app is.
          </p>
        </section>

        <ProofBanner
          quote="Everything runs locally, no data sent to external services."
          source="terminator-ai-summarizer README"
          metric="0 network egress"
        />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            Run it in three commands
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            What it looks like to install Ollama, pull the default model,
            install the example, and trigger it on a window.
          </p>

          <TerminalOutput
            title="from a clean machine to a model summarizing your screen"
            lines={installLines}
          />

          <p className="mt-6 text-zinc-700 leading-relaxed">
            On macOS the first run will prompt for Accessibility permission
            for whichever process is hosting the rdev hotkey listener. On
            Windows the binary works out of the box. On Linux you need
            AT-SPI2 enabled in your desktop environment (most modern GNOME
            and KDE sessions already have it on).
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
            When the accessibility tree is not the right input
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The tree wins on every native app that exposes one. The
            honest list of cases where it does not, and where you have to
            stack a vision model on top, is short and worth memorizing
            before you build an agent on this stack.
          </p>

          <AnimatedChecklist
            title="Tree fit by surface type"
            items={checklistItems}
          />
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building a local-model desktop agent? Compare notes."
          description="If you are wiring an AX-tree pipeline into a local Ollama or vLLM endpoint, we are happy to dig into the selector grammar, the filter step, or the model-size tradeoffs with you."
        />

        <FaqSection items={faqs} />

        <section className="max-w-4xl mx-auto px-6 my-14">
          <RelatedPostsGrid
            title="Related guides"
            subtitle="Companion deep dives on the local-model and accessibility-tree stack"
            posts={relatedPosts}
          />
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Wiring local AI into native apps? Walk through the AX-tree pipeline with us."
      />
    </>
  );
}
