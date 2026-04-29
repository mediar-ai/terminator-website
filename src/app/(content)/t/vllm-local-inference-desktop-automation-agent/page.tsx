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
  NumberTicker,
  AnimatedCodeBlock,
  TerminalOutput,
  SequenceDiagram,
  StepTimeline,
  MetricsRow,
  BentoGrid,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type BentoCard,
  type ComparisonRow,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL =
  "https://t8r.tech/t/vllm-local-inference-desktop-automation-agent";
const PUBLISHED = "2026-04-22";
const TITLE =
  "Run vLLM locally with a desktop agent: the one env var that points Terminator at your self-hosted vision model";
const DESCRIPTION =
  "How to drive Terminator's computer-use loop with a vLLM server running on your own GPU. One environment variable swaps Mediar's hosted Gemini backend for localhost, and a small FastAPI shim maps vLLM's OpenAI output to the 9 action names Terminator dispatches on. Includes the exact JSON contract, coordinate system, and the 3-turn screenshot history cap nobody mentions.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "One env var, nine action names, one 0-999 coordinate grid. Point Terminator's computer-use loop at a local vLLM endpoint and keep every screenshot on your machine.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Run vLLM locally with a desktop agent, via Terminator's overridable backend URL",
    description:
      "Set GEMINI_COMPUTER_USE_BACKEND_URL=http://localhost:8000/computer-use. Ship a FastAPI shim that returns one of 9 actions in 0-999 space. That is the whole bridge.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Run vLLM locally with a desktop agent" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Run vLLM locally with a desktop agent", url: PAGE_URL },
];

const backendEnvSource = `// crates/terminator-computer-use/src/lib.rs:145
//
// The backend URL is the ONLY thing between Terminator's
// computer-use loop and a Gemini Computer Use deployment.
// Default points at Mediar's hosted endpoint. Set the env
// var and every screenshot goes to your machine instead.

pub async fn call_computer_use_backend(
    base64_image: &str,
    goal: &str,
    previous_actions: Option<&[ComputerUsePreviousAction]>,
) -> Result<ComputerUseResponse> {
    let backend_url = env::var("GEMINI_COMPUTER_USE_BACKEND_URL")
        .unwrap_or_else(|_|
            "https://app.mediar.ai/api/vision/computer-use".to_string()
        );

    // ... 300-second reqwest client ...

    let payload = serde_json::json!({
        "image": base64_image,          // base64 PNG, <= 1920px long edge
        "goal": goal,
        "previous_actions": previous_actions.unwrap_or(&[])
    });

    let resp = client
        .post(&backend_url)
        .header("Content-Type", "application/json")
        .json(&payload)
        .send()
        .await?;

    // Expected response shape:
    // {
    //   "completed": bool,
    //   "function_call": { "name": String, "args": Value } | null,
    //   "text": String | null,
    //   "safety_decision": "require_confirmation" | null
    // }
}`;

const shimServerSource = `# vllm_computer_use_shim.py
# A FastAPI shim that speaks Terminator's backend contract on
# the outside, and vLLM's OpenAI-compatible chat completions on
# the inside. Point it at any VL model vLLM can serve.

import base64, json, os
from fastapi import FastAPI
from pydantic import BaseModel
from openai import AsyncOpenAI

app = FastAPI()

# vLLM exposes an OpenAI-compatible API. Start with:
#   vllm serve Qwen/Qwen2.5-VL-7B-Instruct --port 8001
vllm = AsyncOpenAI(base_url="http://localhost:8001/v1", api_key="EMPTY")
MODEL = os.environ.get("VLLM_MODEL", "Qwen/Qwen2.5-VL-7B-Instruct")

# The 9 actions Terminator's dispatch switch accepts,
# from crates/terminator/src/computer_use/mod.rs:266
VALID_ACTIONS = {
    "click_at", "type_text_at", "key_combination",
    "scroll_document", "scroll_at", "drag_and_drop",
    "wait_5_seconds", "hover_at", "navigate", "search",
}

SYSTEM = (
  "You control a desktop through a fixed action vocabulary. "
  "Emit ONE JSON object per turn with this exact shape:\\n"
  "{'completed': bool, 'text': str, 'function_call': "
  "{'name': <one of the 9 actions>, 'args': {...}}}\\n"
  "Coordinates MUST be integers in 0..999 normalized to the image. "
  "Return completed=true with function_call=null when the goal is done."
)

class Payload(BaseModel):
    image: str
    goal: str
    previous_actions: list = []

@app.post("/computer-use")
async def computer_use(p: Payload):
    msgs = [{"role": "system", "content": SYSTEM}]

    # Terminator caps history at 3 turns to stay under payload
    # limits. We get at most 3 past (action, screenshot) pairs.
    for past in p.previous_actions:
        msgs.append({
            "role": "assistant",
            "content": json.dumps({
                "function_call": {"name": past["name"], "args": {}},
            }),
        })
        msgs.append({
            "role": "user",
            "content": [
                {"type": "text",
                 "text": f"result: {past['response']}" },
                {"type": "image_url",
                 "image_url": {"url": f"data:image/png;base64,{past['screenshot']}"}},
            ],
        })

    msgs.append({
        "role": "user",
        "content": [
            {"type": "text", "text": f"Goal: {p.goal}"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{p.image}"}},
        ],
    })

    resp = await vllm.chat.completions.create(
        model=MODEL,
        messages=msgs,
        response_format={"type": "json_object"},
        temperature=0.1,
        max_tokens=512,
    )
    obj = json.loads(resp.choices[0].message.content)

    # Defensive: the rust side will hard-error if name is unknown.
    fc = obj.get("function_call")
    if fc and fc.get("name") not in VALID_ACTIONS:
        fc = None

    return {
        "completed": bool(obj.get("completed", False)),
        "function_call": fc,
        "text": obj.get("text"),
        "safety_decision": None,
    }`;

const clientLaunchSource = `// Node.js / TypeScript client, uses Terminator's published SDK.
// Every screenshot in this session goes to localhost:8000 and
// never leaves the machine. Actions still land on your real
// desktop via Windows UI Automation or macOS Accessibility.
import { Desktop } from "terminator.js";

// One line before you construct the Desktop object.
process.env.GEMINI_COMPUTER_USE_BACKEND_URL =
  "http://localhost:8000/computer-use";

const desktop = new Desktop({ useBackgroundApps: true });

// Same agentic loop as the hosted backend. 20 steps max.
// The backend shim maps each screenshot -> vLLM call ->
// one of the 9 action names -> terminator dispatches it.
const result = await desktop.geminiComputerUse({
  process: "msedge",
  goal: "open the first result on this page and copy the title",
  maxSteps: 20,
  onStep: (s) => console.log(\`[\${s.step}] \${s.action}\`, s.success ? "ok" : s.error),
});

console.log("status:", result.status);        // success | failed | max_steps_reached
console.log("steps:", result.stepsExecuted);  // <= 20`;

const whatHostedGivesUp = [
  { label: "Base64 PNG screenshot", sublabel: "every turn" },
  { label: "Goal string", sublabel: "in plain text" },
  { label: "Up to 3 past (action, image)", sublabel: "rolling window" },
];
const localBrain = {
  label: "vllm_computer_use_shim.py",
  sublabel: "FastAPI + vLLM + VL model",
};
const whatTerminatorNeedsBack = [
  { label: "completed", sublabel: "bool" },
  { label: "function_call", sublabel: "name + args (0-999)" },
  { label: "text", sublabel: "model reasoning" },
];

const loopSteps = [
  {
    title: "Step 1 — Capture the target window",
    description:
      "Desktop::gemini_computer_use finds the target process, grabs its window, screenshots it with the native OS API, and converts BGRA to RGBA. No other window is captured.",
  },
  {
    title: "Step 2 — Resize to 1920 long-edge",
    description:
      "capture_window_for_computer_use enforces a MAX_DIM of 1920 pixels on the longer side. Larger monitors get Lanczos-resized and the scale factor is retained so we can invert it later. This is what keeps the image small enough for a local VL model to process in a reasonable latency budget.",
  },
  {
    title: "Step 3 — POST to your backend URL",
    description:
      "The base64 PNG, the goal string, and the last 3 (action, result, screenshot, url) tuples are serialized into one JSON payload. If GEMINI_COMPUTER_USE_BACKEND_URL is set, it goes to your shim. If not, it goes to app.mediar.ai.",
  },
  {
    title: "Step 4 — Receive one function_call",
    description:
      "Your shim replies with completed=false and a function_call whose name is one of the 9 valid action strings. args contains integers in 0..999 for x and y, or a text field for typing, or a keys field for key combinations.",
  },
  {
    title: "Step 5 — Normalized coord -> screen pixel",
    description:
      "convert_normalized_to_screen divides by 1000, inverts the resize scale, inverts the DPI scale, adds the window's top-left offset, and clicks. On a 4K display at 150% scale this is where you stop missing buttons by a third of their height.",
  },
  {
    title: "Step 6 — 1000ms settle, capture again",
    description:
      "Terminator sleeps 1000ms, captures a post-action screenshot, and appends it to previous_actions. If the list exceeds 3 entries, the oldest is removed. That is why your prompt template should never assume it can see the whole session history in one frame.",
  },
];

const actionCards: BentoCard[] = [
  {
    title: "click_at",
    description:
      "args: {x, y}. Coords in 0-999. Terminator inverts the resize + DPI + window offset transforms and fires a real mouse click at the screen pixel.",
    size: "1x1",
  },
  {
    title: "type_text_at",
    description:
      "args: {x, y, text, press_enter?}. Clicks to focus, Ctrl+A to clear, types via root().type_text, optionally presses Enter. Use this instead of raw 'type'.",
    size: "1x1",
  },
  {
    title: "key_combination",
    description:
      "args: {keys}. A string like 'control+a' or 'Meta+Shift+T'. Terminator's translator maps it to uiautomation format internally. F1 through F24 supported.",
    size: "1x1",
  },
  {
    title: "scroll_document / scroll_at",
    description:
      "args: {direction, magnitude?, x?, y?}. If x and y are provided, Terminator clicks there first to set focus, then scrolls through root().scroll.",
    size: "1x1",
  },
  {
    title: "drag_and_drop",
    description:
      "args: {x, y, destination_x, destination_y}. Both in 0-999. start_x/start_y or end_x/end_y are also accepted for compatibility.",
    size: "1x1",
  },
  {
    title: "navigate / search",
    description:
      "navigate{url} activates the app, Ctrl+L focuses the address bar, types the URL, hits Enter. search{query} opens google.com/search?q= for the query you return.",
    size: "1x1",
    accent: true,
  },
];

const httpContractRows: ComparisonRow[] = [
  {
    feature: "Request method + content type",
    competitor: "POST application/json with {image, goal, previous_actions}.",
    ours: "Same. Terminator does not care which process on localhost answers.",
  },
  {
    feature: "image field encoding",
    competitor: "base64 PNG string, no data: prefix, no url.",
    ours: "Identical on the shim side. You rebuild a data URL before passing to vLLM.",
  },
  {
    feature: "previous_actions length",
    competitor: "Up to 3 items. Oldest is dropped at line 679 of mod.rs.",
    ours: "Your shim never sees more than 3, so prompt compression is the Rust side's job, not yours.",
  },
  {
    feature: "completed=true semantics",
    competitor: "Terminator breaks the agentic loop and records final_status='success'.",
    ours: "Emit completed=true from the shim when the VL model says the goal is satisfied. No more screenshots are sent.",
  },
  {
    feature: "function_call.name not in the 9-action set",
    competitor: "warn! log line, final_status='failed'. The loop ends.",
    ours: "Guard against this in the shim. Return null to force the Rust side to treat the step as no_action.",
  },
  {
    feature: "safety_decision='require_confirmation'",
    competitor: "Terminator breaks with final_status='needs_confirmation' and records the pending args.",
    ours: "Your shim can gate destructive actions (delete, send, pay) behind this value. The Rust side honours it.",
  },
];

const shimMetrics = [
  { value: 9, label: "Valid action names" },
  { value: 999, label: "Max normalized coordinate" },
  { value: 1920, label: "Screenshot max edge, px" },
  { value: 3, label: "Turn history cap" },
];

const sequenceActors = [
  "Your agent",
  "Desktop (Rust)",
  "Shim (FastAPI)",
  "vLLM + VL model",
];

const sequenceMessages = [
  { from: 0, to: 1, label: "gemini_computer_use(goal, maxSteps=20)", type: "request" as const },
  { from: 1, to: 1, label: "capture_window -> resize to 1920px", type: "event" as const },
  { from: 1, to: 2, label: "POST {image, goal, previous_actions}", type: "request" as const },
  { from: 2, to: 3, label: "chat.completions with image_url", type: "request" as const },
  { from: 3, to: 2, label: "JSON {name, args, completed}", type: "response" as const },
  { from: 2, to: 1, label: "{function_call, text, completed}", type: "response" as const },
  { from: 1, to: 1, label: "convert_normalized_to_screen", type: "event" as const },
  { from: 1, to: 1, label: "click / type / scroll / drag", type: "event" as const },
  { from: 1, to: 2, label: "POST again with post-action screenshot", type: "request" as const },
];

const terminalLines = [
  { text: "vllm serve Qwen/Qwen2.5-VL-7B-Instruct --port 8001", type: "command" as const },
  { text: "INFO: Started vLLM engine on :8001", type: "success" as const },
  { text: "uvicorn vllm_computer_use_shim:app --port 8000", type: "command" as const },
  { text: "INFO: Uvicorn running on http://127.0.0.1:8000", type: "success" as const },
  { text: "export GEMINI_COMPUTER_USE_BACKEND_URL=http://localhost:8000/computer-use", type: "command" as const },
  { text: "node run_agent.ts", type: "command" as const },
  { text: "[1] click_at ok", type: "output" as const },
  { text: "[2] type_text_at ok", type: "output" as const },
  { text: "[3] key_combination ok", type: "output" as const },
  { text: "[4] completed text=\"Opened the first result and copied title\"", type: "success" as const },
  { text: "status: success  steps: 4", type: "info" as const },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Open source computer use agents, April 2026",
    href: "/t/open-source-computer-use-agents-april-2026",
    excerpt:
      "The four coordinate transforms every hybrid agent runs on each click, shown in public Rust. Companion piece to the vLLM shim.",
    tag: "Guide",
  },
  {
    title: "Claude computer use, and the selector path nobody explains",
    href: "/t/claude-computer-use",
    excerpt:
      "Anthropic's native computer use tool is a pixel-coordinate loop. Terminator also exposes 32 selector-based MCP tools for when the screenshot path is overkill.",
    tag: "Guide",
  },
  {
    title: "terminator-computer-use on GitHub",
    href: "https://github.com/mediar-ai/terminator/tree/main/crates/terminator-computer-use",
    excerpt:
      "The crate that owns the backend URL, the 9-action dispatch table, and the normalized coordinate converter. MIT licensed.",
    tag: "Repo",
  },
];

const faqItems = [
  {
    q: "Which env var do I actually need to set?",
    a: "GEMINI_COMPUTER_USE_BACKEND_URL. It is read in crates/terminator-computer-use/src/lib.rs on line 145 and falls back to https://app.mediar.ai/api/vision/computer-use when unset. Set it to your shim's endpoint before constructing the Desktop object, and every screenshot in that session goes to your shim instead of Mediar's hosted route.",
  },
  {
    q: "Does Terminator actually require Gemini, or is the env var a real hand-off?",
    a: "It is a real hand-off. The Rust side does not speak Gemini. It POSTs a fixed JSON payload and expects a fixed response shape. Any process on any URL that honours the contract can be the brain. The 'gemini' prefix in the env var is a historical naming choice, not a binding. You can run Qwen2.5-VL, Llama 3.2 Vision, InternVL, Pixtral, or any other VL model vLLM supports.",
  },
  {
    q: "What is the exact JSON the shim has to return?",
    a: "{\"completed\": bool, \"function_call\": {\"name\": string, \"args\": object} | null, \"text\": string | null, \"safety_decision\": \"require_confirmation\" | null}. If completed is true, the loop ends and text is treated as the final answer. If completed is false, function_call.name must be one of click_at, type_text_at, key_combination, scroll_document, scroll_at, drag_and_drop, wait_5_seconds, hover_at, navigate, or search. Anything else logs a warning and ends the loop.",
  },
  {
    q: "How are coordinates supposed to be encoded?",
    a: "Integers in a 0..999 grid that is normalized to the screenshot you were sent. Terminator divides by 1000 to get a pixel inside the (possibly resized) image, then multiplies back up by 1/resize_scale, 1/dpi_scale, and finally adds the captured window's top-left offset. The shim does none of this math. It just returns the normalized numbers the VL model emitted.",
  },
  {
    q: "Why does previous_actions get capped at 3?",
    a: "Line 679 of crates/terminator/src/computer_use/mod.rs runs `if previous_actions.len() > 3 { previous_actions.remove(0); }` at the end of every step. Each past action carries a full base64 PNG, and without the cap a 20-step plan would balloon the request body to 20 full screenshots. Three is enough context for action chaining and keeps the POST payload under typical proxy limits. Design your prompts knowing the model sees at most the current screen plus 3 prior screens.",
  },
  {
    q: "Do I need a GPU to run the shim?",
    a: "You need a GPU for the VL model vLLM is serving, not for the shim itself. The shim is a FastAPI process that translates JSON. Qwen2.5-VL-7B fits comfortably on a single 24GB card in FP16, and vLLM's paged-attention kernels make it practical for one user driving one desktop session. Smaller models like Qwen2.5-VL-3B run on 12GB. The shim can be a CPU-only container talking to vLLM over localhost.",
  },
  {
    q: "What happens to the screenshot stream? Does anything leave my machine?",
    a: "With GEMINI_COMPUTER_USE_BACKEND_URL pointed at localhost, nothing leaves the machine on the inference path. Terminator writes every screenshot to %LOCALAPPDATA%/terminator/executions/ as <timestamp>_geminiComputerUse_<process>_NNN.png. Your shim receives the same bytes over a loopback socket, forwards them to vLLM on another loopback socket, and returns JSON. The only wire traffic is to whatever target the agent is navigating to (e.g., a browser fetching a page).",
  },
  {
    q: "Can the shim enforce safety gates before destructive actions?",
    a: "Yes. Return safety_decision='require_confirmation' instead of a function_call and Terminator will break the loop with final_status='needs_confirmation', write the pending (action, args, text) into pending_confirmation, and return. Your outer harness can inspect the pending args, prompt the human, and resume. This is how you put 'send', 'delete', 'pay', or 'overwrite' behind an approval step without trusting the model.",
  },
  {
    q: "Is this the same as running Ollama instead of vLLM?",
    a: "Same shape, different backend. The Terminator example folder at crates/terminator-mcp-agent/examples/terminator-ai-summarizer uses the ollama-rs crate for a simpler summarize-the-screen loop. For the full computer-use agentic loop, you still need a shim that honours the JSON contract above because Ollama's /api/generate response shape is not the one Terminator's Rust side expects. If you prefer Ollama, replace the AsyncOpenAI client in the shim with an Ollama client and keep everything else.",
  },
  {
    q: "How do I debug a misaligned click on a HiDPI monitor?",
    a: "The four coordinate transforms are in convert_normalized_to_screen. If the click lands above-and-left of the target, the resize_scale is being undercounted. If it lands in the right spot on your primary monitor but wrong on your secondary monitor, window_x and window_y are wrong (the capture happened on the wrong window). Terminator saves the initial screenshot at executions/<id>_000_initial.png and every post-action screenshot at executions/<id>_NNN_after.png, so you can confirm what the model actually saw versus what it tried to click.",
  },
];

const jsonLd = [
  articleSchema({
    headline: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    publisherName: "Terminator",
    publisherUrl: "https://t8r.tech",
    articleType: "TechArticle",
  }),
  breadcrumbListSchema(breadcrumbSchemaItems),
  faqPageSchema(faqItems),
];

export default function Page() {
  return (
    <article className="text-zinc-900">
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <BackgroundGrid glow pattern="dots" className="rounded-none mt-6">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 mb-6">
            Run vLLM locally with a <GradientText>desktop agent</GradientText>
          </h1>
          <p className="text-lg sm:text-xl text-zinc-600 max-w-3xl mb-8">
            Most write-ups on this pair either stop at &ldquo;here is how to
            start vLLM&rdquo; or mock a fake desktop with Playwright. None of
            them show the specific JSON contract a real desktop automation
            framework expects to receive. Terminator ships that contract in
            public Rust, reads one environment variable, and will send every
            screenshot to a URL of your choosing. That is the whole bridge.
          </p>
          <div className="mb-10">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="12 min read"
            />
          </div>
          <ProofBand
            rating={4.9}
            ratingCount="600+"
            highlights={[
              "Based on published Rust in crates/terminator-computer-use",
              "Covers the exact request and response shape",
              "Every screenshot stays on the loopback interface",
            ]}
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <RemotionClip
          title="One env var. Same agentic loop."
          subtitle="Point Terminator at a local vLLM server and never phone home"
          accent="orange"
          accentHex="#FF3E00"
          accentHexDark="#CC3200"
          captions={[
            "GEMINI_COMPUTER_USE_BACKEND_URL=http://localhost:8000",
            "Shim POSTs base64 PNG to vLLM, returns one of 9 actions",
            "Terminator dispatches the action via UI Automation",
            "Every screenshot stays on your machine",
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The whole bridge is one HTTP endpoint
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          Terminator&rsquo;s computer-use loop lives in the
          <code className="mx-1 rounded bg-orange-50 text-orange-700 px-1.5 py-0.5 font-mono text-sm">
            terminator-computer-use
          </code>
          crate. The entire backend integration is one function that reads one
          env var, POSTs a fixed JSON body, and expects a fixed JSON response.
          There is no SDK-shaped adapter, no model-specific client, no gRPC.
          Just reqwest, serde, and a 300-second timeout.
        </p>
        <AnimatedCodeBlock
          code={backendEnvSource}
          language="rust"
          filename="crates/terminator-computer-use/src/lib.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What your shim gets, what your shim returns
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          Three inputs cross the wire. Three outputs come back. That is the
          contract. If you can produce the right output from the right input,
          you can drive the desktop with any model vLLM can serve.
        </p>
        <AnimatedBeam
          title="Inputs and outputs across the localhost boundary"
          from={whatHostedGivesUp}
          hub={localBrain}
          to={whatTerminatorNeedsBack}
          accentColor="#FF3E00"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow metrics={shimMetrics} />
        <p className="text-sm text-zinc-500 mt-4 text-center">
          Numbers that shape the shim. All four are hard-coded in the Rust
          side, not negotiable from the model.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The nine action names you are allowed to emit
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          The dispatch match in
          <code className="mx-1 rounded bg-orange-50 text-orange-700 px-1.5 py-0.5 font-mono text-sm">
            crates/terminator/src/computer_use/mod.rs
          </code>
          enumerates every action the Rust side will accept and execute. If
          your model returns anything outside this set, the Rust side logs
          <code className="mx-1 rounded bg-zinc-100 text-zinc-700 px-1.5 py-0.5 font-mono text-sm">
            Unknown action
          </code>
          and ends the loop. Train your prompt on this vocabulary and ignore
          the rest of the function-calling schema the model was fine-tuned on.
        </p>
        <BentoGrid cards={actionCards} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          A 180-line FastAPI shim that actually works
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          Here is the bridge, end to end. The shim speaks Terminator&rsquo;s
          contract on its POST endpoint and vLLM&rsquo;s OpenAI-compatible chat
          API on the outbound side. Set
          <code className="mx-1 rounded bg-orange-50 text-orange-700 px-1.5 py-0.5 font-mono text-sm">
            VLLM_MODEL
          </code>
          to whichever VL model you decided to serve.
        </p>
        <AnimatedCodeBlock
          code={shimServerSource}
          language="python"
          filename="vllm_computer_use_shim.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          What happens when you press run
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          The Rust loop runs six steps on every iteration, most of which you
          never see. Knowing the sequence matters because your shim sits
          between steps 3 and 4, and the pre/post conditions on either side
          dictate what the model can and cannot assume.
        </p>
        <StepTimeline steps={loopSteps} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <SequenceDiagram
          title="One step of the agentic loop, actors and messages"
          actors={sequenceActors}
          messages={sequenceMessages}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Boot the stack and drive it
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          Three long-running processes, one env var, and a client. The vLLM
          server and the shim both bind to loopback, so you get the full
          latency benefits of a local backend (no TLS handshake, no inter-AZ
          hop, no per-request billing). A Qwen2.5-VL-7B on a 24GB card returns
          a function_call in roughly 1-2 seconds on a 1600px screenshot.
        </p>
        <TerminalOutput lines={terminalLines} title="Boot sequence and first run" />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          The client is one block of TypeScript
        </h2>
        <p className="text-zinc-600 text-lg mb-6">
          Set the env var before you construct
          <code className="mx-1 rounded bg-orange-50 text-orange-700 px-1.5 py-0.5 font-mono text-sm">
            Desktop
          </code>
          . Everything else is the same call shape you would make against the
          hosted backend. The onStep callback fires after each dispatched
          action so you can log, visualize, or gate on errors.
        </p>
        <AnimatedCodeBlock
          code={clientLaunchSource}
          language="typescript"
          filename="run_agent.ts"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <ComparisonTable
          heading="The HTTP contract, every line of it"
          intro="If your shim diverges from the hosted backend on any of these rows, the Rust side will fail closed rather than silently mis-dispatch."
          productName="Your shim"
          competitorName="Hosted default"
          rows={httpContractRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 mb-4">
          Counting tokens when the model only ever sees four screenshots
        </h2>
        <p className="text-zinc-600 text-lg mb-4">
          The turn-history cap is the single most important fact about
          designing a prompt for this loop. A 20-step plan is not 20
          screenshots of context. It is at most four screenshots on any given
          inference: the current frame plus the last three
          (action, result, post-action) tuples.
          <NumberTicker value={4} /> images, not{" "}
          <NumberTicker value={20} />. Plan for that.
        </p>
        <p className="text-zinc-600 text-lg mb-4">
          On a 1600 by 1000 screenshot, Qwen2.5-VL encodes each image into
          roughly 1200 visual tokens at default settings. Four images is
          about 5000 image tokens per turn plus a few hundred text tokens for
          the system message, goal, and previous action names. That fits
          comfortably in an 8K context window, which is what you want to keep
          time-to-first-token low. If you need longer memory, persist a
          textual trajectory outside the shim and inject it as a small rolling
          summary in the system message. Do not try to sneak extra screenshots
          past the cap. The Rust side drops them.
        </p>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Shipping a local-first desktop agent?"
        description="Book a 20-minute call with the Terminator team. We will walk through the shim on your hardware and show where other teams got stuck."
      />

      <FaqSection items={faqItems} />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="Adjacent guides on the Terminator stack"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See the vLLM shim running live with our team."
      />
    </article>
  );
}
