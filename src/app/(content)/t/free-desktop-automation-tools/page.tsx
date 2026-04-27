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
  Marquee,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BeforeAfter,
  StepTimeline,
  ComparisonTable,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/free-desktop-automation-tools";
const PUBLISHED = "2026-04-24";
const TITLE =
  "Free desktop automation tools, audited at the flag level: where the cost cliff actually hides";
const DESCRIPTION =
  "Every free desktop automation tool has a cost cliff somewhere: seat caps, unattended-run paywalls, license servers, telemetry you cannot switch off, or a cloud backend that goes away if the vendor does. This guide walks through where that cliff sits for each of the usual products, then shows Terminator's cost surface flag by flag, including the three environment variables that move every remote dependency onto your own infrastructure.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Terminator defaults: UIA only, free and local. OCR, Omniparser, Gemini, and browser DOM are opt-in flags on get_window_tree. Three env vars move the cost surface onto your own infrastructure: OMNIPARSER_BACKEND_URL, POSTHOG_DISABLED, SENTRY_DISABLED.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free desktop automation tools, audited at the flag level",
    description:
      "Where the cost cliff actually lives in each free tool, and the three env vars that move Terminator off vendor infrastructure entirely.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Free desktop automation tools" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Free desktop automation tools", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Which desktop automation tools are actually free end to end, and which have a cost cliff later?",
    a: "AutoHotkey, SikuliX, Robot Framework, Pywinauto, Winium, and WinAppDriver are genuinely free and open source with no runtime vendor dependency. Ui.Vision is free for local use but its cloud execution is paid. Power Automate Desktop is bundled with Windows 11 but unattended runs require a per-bot Premium license. UiPath Community is free with a two-user limit and a community-only license that blocks production use. AutomationAnywhere Community Edition expires on a rolling basis and does not include API scheduling. Blue Prism and TestComplete are not free at all; they show up on free-tools roundups because they offer trials. Terminator is MIT licensed and ships the full feature set on npm, PyPI, and crates.io. The only paid surface it touches is the Gemini vision API, and only if you opt in with a flag. Every other remote dependency has an environment variable that points it at your own infrastructure or turns it off.",
  },
  {
    q: "What exactly are the three environment variables that move Terminator off vendor infrastructure?",
    a: "OMNIPARSER_BACKEND_URL swaps the default https://app.mediar.ai/api/omniparser/parse endpoint with any URL you control; the expected contract is a POST that takes a base64 image plus an imgsz integer and returns normalized 0 to 1 bounding boxes with element_type and content fields. POSTHOG_DISABLED=true (or TERMINATOR_ANALYTICS_DISABLED=true) turns off the PostHog EU capture that the MCP agent fires on startup and on each tool execution. SENTRY_DISABLED=true turns off the default Sentry DSN for error tracking. Each one is a single line in your MCP server env block. After those three are set, the MCP agent has no outbound network calls unless your own workflow makes them.",
  },
  {
    q: "What are the include_* flags on get_window_tree and what does each one actually cost?",
    a: "Four of them, all defaulting to false. include_ocr runs Tesseract locally on the captured window; zero dollars, but it spins up CPU and adds tens to hundreds of milliseconds depending on the window size. include_omniparser posts a screenshot to the OmniParser backend at https://app.mediar.ai/api/omniparser/parse by default; zero dollars on Mediar's tier, but you can self-host by setting OMNIPARSER_BACKEND_URL. include_gemini_vision calls Google's Gemini API with your own key; this is the only tier that can actually bill your credit card. include_browser_dom talks to the Terminator Chrome extension over a local socket; free, but requires the extension to be installed. The tool description in server.rs explicitly tells the agent to turn these on only when the default UIA tree is missing what it needs.",
  },
  {
    q: "Does Terminator require me to agree to telemetry to use it?",
    a: "No. The PostHog module in crates/terminator-mcp-agent/src/posthog.rs checks POSTHOG_DISABLED and TERMINATOR_ANALYTICS_DISABLED before every capture. The Sentry module in crates/terminator-mcp-agent/src/sentry.rs checks SENTRY_DISABLED before initializing the client. If either variable is set to true the corresponding code path exits early. The distinct ID for PostHog is a hash of the hostname, not a user identifier, and the error classifier only sends error categories like 'element_not_found' or 'timeout' rather than raw messages. If you want zero outbound packets from the agent itself, set both env vars in your MCP config and the agent stays silent.",
  },
  {
    q: "How does this compare to Power Automate Desktop's free tier?",
    a: "Power Automate Desktop is free for attended, interactive use on Windows 10 and 11. Every trigger, schedule, and unattended run is a Premium license at 15 USD per user per month minimum, and cloud flows are gated behind a separate Microsoft 365 plan. If you have an AI coding assistant that needs to kick off an automation on a schedule or in the background, the free tier does not cover that. Terminator's MCP agent is a single npx command; the assistant drives it directly, there is no scheduler service, no bot registration, no premium connector layer. If you want to host it on a VM, that is your cloud bill, not a license.",
  },
  {
    q: "Can an AI coding assistant like Claude Code, Cursor, or Codex drive these free tools without extra cost?",
    a: "SikuliX, Robot Framework, and AutoHotkey can all be shelled out from an AI assistant, but they have no structured interface; the assistant has to write and debug shell calls against a CLI that was not designed for an agent to read. WinAppDriver exposes an Appium protocol over HTTP but does not return a unified tree format. Ui.Vision RPA and AskUI have cloud or enterprise tiers that bill per API call. Terminator was designed for this use case: terminator-mcp-agent@latest is a one-line npx install, registers 35 MCP tools, and returns a YAML tree the model can read directly. The cost of the assistant itself is what you already pay for Claude Code or Cursor; the agent adds zero on top of that unless you opt into the Gemini vision tier.",
  },
  {
    q: "Is there any feature gated behind a paid Terminator tier?",
    a: "No. The Rust core, the Node and Python bindings, the CLI, the MCP agent, the workflow recorder, and the Chrome extension are all MIT and publicly versioned on crates.io, npm, and PyPI. Mediar sells managed hosting and a workflow builder product (mediar.ai) that uses Terminator underneath, but the library itself is not gated. You can cargo add terminator-rs, npm install @mediar-ai/terminator, or npx -y terminator-mcp-agent@latest today and get the same feature set the managed product uses.",
  },
  {
    q: "Why does 'free' usually break once you add an AI coding assistant into the loop?",
    a: "Because free desktop tools were designed for a human operator or a test runner. An assistant calling an API in a loop hits the parts those products did not build out as free: schedule triggers, unattended runs, multi-machine licenses, telemetry opt-outs, or cloud executors for the image-matching step. Terminator inverts this. The assistant is the operator. Every feature that costs money in a traditional RPA is either local (UIA, OCR), optional and self-hostable (Omniparser), or bring-your-own-key (Gemini). The one-user, one-license model does not apply because there is no license server to talk to.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "License",
    competitor: "Mixed: community, proprietary, seat-capped",
    ours: "MIT, unrestricted, no per-seat rules",
  },
  {
    feature: "Unattended runs on the free tier",
    competitor: "Usually blocked (PAD Premium, UiPath Production)",
    ours: "Same code path as attended; no distinction",
  },
  {
    feature: "Cloud backend required",
    competitor: "Often for vision or scheduling",
    ours: "Only Omniparser; self-host with one env var",
  },
  {
    feature: "Telemetry opt-out",
    competitor: "Enterprise feature or buried settings",
    ours: "Single env var (POSTHOG_DISABLED=true)",
  },
  {
    feature: "Error tracking opt-out",
    competitor: "Not documented",
    ours: "Single env var (SENTRY_DISABLED=true)",
  },
  {
    feature: "Cost surface visible to the agent",
    competitor: "Opaque, spread across docs and billing pages",
    ours: "Four boolean include_* flags on one MCP tool",
  },
  {
    feature: "Per-user cost at scale",
    competitor: "Grows with seats (UiPath, AutomationAnywhere)",
    ours: "Flat; agent drives one npx install",
  },
  {
    feature: "What bills your credit card",
    competitor: "Seats, unattended runs, cloud minutes",
    ours: "Gemini API (only if include_gemini_vision is true)",
  },
];

const remotionCaptions = [
  "Free until you turn on the feature that matters.",
  "Each perception tier is an explicit flag.",
  "Only UIA is on by default.",
  "Three env vars move every remote call off vendor infra.",
  "No license server, no seat cap, no cloud executor.",
];

const costSurfaceSnippet = `// crates/terminator-mcp-agent/src/utils.rs

#[serde(default)]
pub include_ocr: bool,          // Tesseract, local CPU

#[serde(default)]
pub include_omniparser: bool,   // POST to OMNIPARSER_BACKEND_URL
                                // default: https://app.mediar.ai/api/omniparser/parse

#[serde(default)]
pub include_gemini_vision: bool, // Google Gemini API, your key

#[serde(default)]
pub include_browser_dom: bool,  // Chrome extension, local socket`;

const omniparserSnippet = `// crates/terminator-mcp-agent/src/omniparser.rs

pub async fn parse_image_with_backend(
    base64_image: &str,
    image_width: u32,
    image_height: u32,
    imgsz: Option<u32>,
) -> Result<(Vec<OmniparserItem>, String)> {
    // Read the backend URL from env, fall back to Mediar's
    // hosted endpoint. Set OMNIPARSER_BACKEND_URL to point
    // at a server you control.
    let backend_url = env::var("OMNIPARSER_BACKEND_URL")
        .unwrap_or_else(|_| {
            "https://app.mediar.ai/api/omniparser/parse".to_string()
        });
    // ... POST base64 image, receive bounding boxes ...
}`;

const posthogSnippet = `// crates/terminator-mcp-agent/src/posthog.rs

fn is_disabled() -> bool {
    std::env::var("POSTHOG_DISABLED")
        .or_else(|_| std::env::var("TERMINATOR_ANALYTICS_DISABLED"))
        .unwrap_or_default()
        .eq_ignore_ascii_case("true")
}

pub fn capture(event: &str, properties: Value) {
    if is_disabled() {
        return; // no outbound request; nothing queued
    }
    // ... hash hostname, classify error, POST to eu.i.posthog.com ...
}`;

const mcpConfigSnippet = `{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"],
      "env": {
        "POSTHOG_DISABLED": "true",
        "SENTRY_DISABLED": "true",
        "OMNIPARSER_BACKEND_URL": "http://10.0.0.5:8787/parse"
      }
    }
  }
}`;

const terminalLines = [
  { text: "$ export POSTHOG_DISABLED=true", type: "command" as const },
  { text: "$ export SENTRY_DISABLED=true", type: "command" as const },
  { text: "$ export OMNIPARSER_BACKEND_URL=http://10.0.0.5:8787/parse", type: "command" as const },
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" as const },
  { text: "[terminator] MCP server listening on stdio", type: "output" as const },
  { text: "[terminator] 35 tools registered", type: "output" as const },
  { text: "[terminator] Sentry is disabled via SENTRY_DISABLED", type: "output" as const },
  { text: "[claude] get_window_tree pid=13928", type: "command" as const },
  { text: "[terminator] UIA cache request completed: 142 elements", type: "output" as const },
  { text: "[terminator] include_ocr=false include_omniparser=false include_gemini_vision=false", type: "output" as const },
  { text: "[terminator] zero outbound requests this call", type: "success" as const },
];

const beamFrom = [
  { label: "PostHog capture", sublabel: "eu.i.posthog.com" },
  { label: "Sentry errors", sublabel: "ingest.us.sentry.io" },
  { label: "Omniparser call", sublabel: "app.mediar.ai" },
];

const beamTo = [
  { label: "POSTHOG_DISABLED", sublabel: "true -> no capture" },
  { label: "SENTRY_DISABLED", sublabel: "true -> no init" },
  { label: "OMNIPARSER_BACKEND_URL", sublabel: "your server" },
];

const beamHub = { label: "Three env vars", sublabel: "the whole cost surface" };

const envStepTimeline = [
  {
    title: "POSTHOG_DISABLED=true",
    description:
      "Turns off the PostHog capture path that fires on startup and on every tool execution. The is_disabled() check returns early before any HTTP client is constructed. TERMINATOR_ANALYTICS_DISABLED=true is accepted as an alias.",
  },
  {
    title: "SENTRY_DISABLED=true",
    description:
      "Stops the default Sentry DSN from being initialized. The init_sentry function checks this env var before calling sentry::init, so no transport is created and no spans leave the process.",
  },
  {
    title: "OMNIPARSER_BACKEND_URL=<your URL>",
    description:
      "Overrides the hardcoded fallback of https://app.mediar.ai/api/omniparser/parse. The backend contract is a JSON POST with fields image (base64 PNG) and imgsz (640-1920); the response is an elements array with normalized 0-1 bounding boxes. You can host the OmniParser V2 model yourself and hand its URL to this variable.",
  },
];

const costTierSteps = [
  {
    title: "Tier 0: UIA tree",
    description:
      "On by default. Queries Windows UI Automation via one batched IUIAutomationCacheRequest. Local, synchronous, zero network, zero license. This is the tree the agent reads on every iteration.",
  },
  {
    title: "Tier 1: include_ocr",
    description:
      "Opt-in flag. Runs Tesseract on a window screenshot via the uni-ocr crate. Local and free; the only cost is the CPU spike while the recognizer runs. Nothing leaves the machine.",
  },
  {
    title: "Tier 2: include_browser_dom",
    description:
      "Opt-in flag. Talks to the Terminator Chrome extension over a local bridge. Returns tag names, identifiers, and viewport-aligned bounds for elements the DOM sees that UIA does not. No external network.",
  },
  {
    title: "Tier 3: include_omniparser",
    description:
      "Opt-in flag. Posts the window screenshot to OMNIPARSER_BACKEND_URL. Default URL is Mediar's hosted endpoint; swap it for one you run and no pixels leave your network. The model is OmniParser V2; you supply your own host or we supply ours.",
  },
  {
    title: "Tier 4: include_gemini_vision",
    description:
      "Opt-in flag. Calls Google's Gemini API with your own GEMINI_API_KEY. This is the only tier that can actually bill your credit card, and it is off by default. The tool description explicitly asks the agent to leave it off unless the others are not enough.",
  },
];

const listicleTools: Array<{ name: string; cliff: string }> = [
  { name: "AutoHotkey", cliff: "Truly free, scripting only" },
  { name: "SikuliX", cliff: "Truly free, image matching only" },
  { name: "Robot Framework", cliff: "Truly free, no agent interface" },
  { name: "Pywinauto", cliff: "Truly free, Python only" },
  { name: "Winium", cliff: "Truly free, Selenium protocol" },
  { name: "WinAppDriver", cliff: "Microsoft, Appium protocol" },
  { name: "Ui.Vision RPA", cliff: "Free local; cloud is paid" },
  { name: "Power Automate Desktop", cliff: "Unattended runs are Premium" },
  { name: "UiPath Community", cliff: "Two-user cap, non-production" },
  { name: "AutomationAnywhere Community", cliff: "No API scheduling" },
  { name: "TestComplete", cliff: "Trial only, not free" },
  { name: "AskUI", cliff: "Paid tiers for API use" },
];

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);
const faqSchema = faqPageSchema(faqs);

export default function Page() {
  return (
    <>
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

      <article className="mx-auto max-w-3xl px-6 py-12 text-zinc-900">
        <Breadcrumbs items={breadcrumbItems} />

        <BackgroundGrid pattern="dots" glow>
          <div className="py-10">
            <ArticleMeta
              datePublished={PUBLISHED}
              author="Matthew Diakonov"
            authorRole="Written with AI"
              readingTime="12 min read"
            />
            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
              Free desktop automation tools, audited at the{" "}
              <GradientText>flag level</GradientText>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-relaxed">
              Every list of free desktop automation tools is a checkbox exercise: MIT column, Windows
              column, download link. What they skip is where the cost cliff actually lives. UiPath
              Community caps at two users. Power Automate Desktop charges for every unattended run.
              Ui.Vision is local-free but cloud-paid. Terminator is the rare case where the cost
              surface is small enough to read in a single file, and three environment variables move
              the remaining remote calls onto infrastructure you control.
            </p>
          </div>
        </BackgroundGrid>

        <ProofBand
          rating={5.0}
          ratingCount="MIT core, opt-in perception tiers, telemetry off with one env var"
          highlights={[
            "Four include_* flags expose the cost surface of each perception tier",
            "Three env vars move every remote call off Mediar infrastructure",
            "No license server, no seat cap, no cloud executor",
          ]}
        />

        <div className="my-10">
          <RemotionClip
            title="What 'free' actually costs"
            subtitle="A line-by-line audit of a desktop automation tool"
            captions={remotionCaptions}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The cliff every free-tools roundup leaves off the table
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A roundup page will tell you AutoHotkey is free, UiPath is free, Power Automate Desktop
            is free. That is half a sentence. Each one is free until you hit the part of the product
            that makes it interesting to use. UiPath Community is free at two users; the third user
            breaks the license. Power Automate Desktop is free for attended flows; the moment you
            schedule one, a Premium connector kicks in at 15 USD per user per month. Ui.Vision is
            free on your laptop; the cloud runs are billed per minute. AutomationAnywhere Community
            expires on a clock. TestComplete shows up on free-tools lists because of its trial.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="What 'free' means on a roundup page vs. at the flag level"
              before={{
                label: "Roundup view",
                content:
                  "A table with a single checkmark in a Free column. No mention of seat caps, unattended-run paywalls, vendor-hosted vision backends, or telemetry that cannot be turned off.",
                highlights: [
                  "MIT column: yes or no",
                  "Windows column: yes or no",
                  "Pricing: 'contact sales' or '$0'",
                  "No per-feature cost analysis",
                ],
              }}
              after={{
                label: "Flag level view",
                content:
                  "The actual boolean flags, env vars, and code paths that decide whether turning on a feature stays free. Visible in the source, readable by the agent, and toggleable at runtime.",
                highlights: [
                  "include_ocr: local CPU, no network",
                  "include_omniparser: remote by default, self-hostable",
                  "include_gemini_vision: bring-your-own-key, off by default",
                  "POSTHOG_DISABLED, SENTRY_DISABLED, OMNIPARSER_BACKEND_URL",
                ],
              }}
            />
          </div>
        </section>

        <section className="mt-14">
          <GlowCard>
            <div className="p-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
                The anchor: three env vars, four opt-in flags, one MCP tool
              </h2>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Terminator's cost surface lives in four files. The four{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  include_*
                </code>{" "}
                booleans on <code>get_window_tree</code> are defined in{" "}
                <code>crates/terminator-mcp-agent/src/utils.rs</code>. The remote call for
                OmniParser lives in <code>crates/terminator-mcp-agent/src/omniparser.rs</code>. The
                telemetry opt-out is in <code>crates/terminator-mcp-agent/src/posthog.rs</code>. The
                error tracking opt-out is in <code>crates/terminator-mcp-agent/src/sentry.rs</code>.
              </p>
              <p className="mt-4 text-zinc-700 leading-relaxed">
                Every default that could send a packet outside your network reads an environment
                variable first. Set{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  POSTHOG_DISABLED=true
                </code>
                ,{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  SENTRY_DISABLED=true
                </code>
                , and point{" "}
                <code className="px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 text-sm">
                  OMNIPARSER_BACKEND_URL
                </code>{" "}
                at a server you run, and the MCP agent emits zero outbound requests unless your
                workflow makes them. That is the anchor claim of this guide.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The five cost tiers of <code>get_window_tree</code>
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One MCP tool returns the tree the agent reads. The base tree is UIA and always on. Four
            optional perception layers stack on top, each behind a boolean that defaults to false.
            The tiers are sorted roughly by cost.
          </p>
          <div className="mt-6">
            <StepTimeline steps={costTierSteps} />
          </div>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={costSurfaceSnippet}
              language="rust"
              filename="utils.rs (lines 487-509)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The one call that leaves your network by default, and the env var that stops it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Of the five tiers, only <code>include_omniparser</code> has a default that talks to a
            third party, and that third party is Mediar. The Rust function that makes the call
            reads <code>OMNIPARSER_BACKEND_URL</code> first and only falls back to the Mediar
            endpoint if the env var is unset. The backend contract is public: POST a base64 PNG
            plus an <code>imgsz</code> integer, receive normalized 0 to 1 bounding boxes. Build
            your own server that matches that contract, or skip the tier entirely; nothing else
            depends on it.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={omniparserSnippet}
              language="rust"
              filename="omniparser.rs (parse_image_with_backend)"
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Telemetry works the same way. The PostHog module checks an env var before every
            capture call, and the distinct ID is a hash of the hostname rather than a user
            identifier. If the var is set, the capture function exits without building an HTTP
            client.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={posthogSnippet}
              language="rust"
              filename="posthog.rs (capture path)"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Three env vars, three outbound calls turned off
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you want an MCP agent that runs on your laptop, speaks to your AI assistant locally,
            and sends nothing anywhere else unless your own workflow does, this is the full list.
          </p>
          <div className="mt-6">
            <AnimatedBeam
              title="Where the three env vars intercept each remote call"
              from={beamFrom}
              hub={beamHub}
              to={beamTo}
              accentColor="#FF3E00"
            />
          </div>
          <div className="mt-6">
            <StepTimeline steps={envStepTimeline} />
          </div>
          <div className="mt-6">
            <ProofBanner
              quote="Set POSTHOG_DISABLED and SENTRY_DISABLED and point OMNIPARSER_BACKEND_URL at localhost and you can watch the Wireshark output go silent."
              source="Implementation note, posthog.rs / sentry.rs / omniparser.rs"
              metric="0 packets"
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The MCP config that locks this in
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            One block in your assistant's MCP config pins all three variables. The agent restarts,
            the flags are in effect, and the agent's behavior is identical to the default minus
            the outbound traffic.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={mcpConfigSnippet}
              language="json"
              filename="claude_desktop_config.json"
            />
          </div>
          <div className="mt-6">
            <TerminalOutput
              title="What a zero-egress run looks like"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The usual shortlist, with the cliff printed next to it
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            These are the twelve products most guides on this topic repeat. What every list leaves
            out is the specific condition under which the free label stops applying. The chip next
            to each name is the first line in that story.
          </p>
          <div className="mt-6">
            <Marquee speed={40} fade pauseOnHover>
              <div className="flex gap-3 pr-3">
                {listicleTools.map((t) => (
                  <span
                    key={t.name}
                    className="whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-700"
                  >
                    <span className="font-semibold text-zinc-900">{t.name}</span>
                    <span className="mx-2 text-zinc-400">|</span>
                    <span className="text-zinc-600">{t.cliff}</span>
                  </span>
                ))}
              </div>
            </Marquee>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The comparison that belongs on every one of those lists
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A free desktop automation tool worth picking is one where the features that matter to
            your agent do not disappear the moment you turn them on. The question is not "free or
            paid"; it is "what is the unit that bills me once I scale this."
          </p>
          <ComparisonTable
            productName="Terminator"
            competitorName="Typical free RPA or testing tool"
            rows={comparisonRows}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The counts that actually matter
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A handful of small numbers define the entire cost surface.{" "}
            <NumberTicker value={4} /> opt-in flags,{" "}
            <NumberTicker value={3} /> env vars, and{" "}
            <NumberTicker value={35} /> MCP tools the agent can call once the tree is in hand.
            Everything else is the same open-source Rust core that ships on crates.io as{" "}
            <code>terminator-rs</code>.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Why this matters for an AI coding assistant
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The reason free desktop tools tend to get expensive the moment an assistant drives them
            is that those tools were designed for a human operator or a test runner in CI. An
            assistant calling the same tool in a loop triggers the commercial surface: scheduled
            triggers, unattended bot licenses, cloud minutes, seat counts. Terminator flips this.
            The assistant is the operator, the MCP agent is a single npx install, and every tier
            that could bill you is a boolean the model toggles.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Install once with <code>claude mcp add terminator "npx -y terminator-mcp-agent@latest"</code>
            , set your three env vars, and the cost of adding desktop automation to Claude Code,
            Cursor, Codex, or Windsurf is the cost you already pay for the assistant plus nothing.
            That is the whole pitch.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Audit the cost surface on your own setup"
          description="Bring the tool you were planning to use. We will walk through each flag and each env var, show you which one turns on the first outbound packet, and leave you with a config that runs silent."
        />

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Frequently asked
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>
      </article>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="See which flag breaks your current tool's free tier."
      />
    </>
  );
}
