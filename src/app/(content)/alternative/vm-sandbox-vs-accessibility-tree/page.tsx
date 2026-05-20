import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  BeforeAfter,
  FlowDiagram,
  ProofBanner,
  MetricsRow,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
  type RelatedPost,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/alternative/vm-sandbox-vs-accessibility-tree";
const BOOKING_URL = "https://cal.com/team/mediar/terminator";
const PUBLISHED = "2026-05-20";
const MODIFIED = "2026-05-20";
const TITLE =
  "VM sandbox vs accessibility tree: two axes, not alternatives";
const DESCRIPTION =
  "Most articles treat VM sandbox and accessibility tree as competing computer-use approaches. They are not. Sandbox is the execution environment; accessibility tree is the grounding primitive. Terminator's same Rust engine runs on the host machine AND inside a Vagrant Windows 10 VM with one env var (TERMINATOR_HEADLESS). Source: terminator/vagrant/Vagrantfile and crates/terminator/src/platforms/windows/virtual_display.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "VM sandbox is where the agent runs. Accessibility tree is how the agent grounds. They are orthogonal. Here is the proof in one repo that ships both.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "VM sandbox vs accessibility tree is not a real comparison",
    description:
      "Sandbox is the execution environment. Accessibility tree is the grounding primitive. Pick one of each. Terminator's same engine runs on host and inside a Vagrant VM.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Alternatives", href: "/" },
  { label: "VM sandbox vs accessibility tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Alternatives", url: "https://t8r.tech/" },
  { name: "VM sandbox vs accessibility tree", url: PAGE_URL },
];

const flowSteps = [
  {
    label: "Host + AX tree",
    detail: "Terminator default. Drives user's logged-in apps via UIA/AX. No virtualization.",
  },
  {
    label: "Host + pixels",
    detail: "Local screenshot agents. PyAutoGUI, OpenCV templates, Anthropic CU in a window.",
  },
  {
    label: "VM + AX tree",
    detail: "Terminator with TERMINATOR_HEADLESS=1 in a Vagrant Windows 10 VM. Same engine.",
  },
  {
    label: "VM + pixels",
    detail: "Anthropic's reference Docker container. Scrapybara, Browserbase, E2B desktops.",
  },
];

const hostStackSample = `# Terminator on the user's host machine.
# Same Rust binary, default mode.

$ npx -y terminator-mcp-agent@latest
[info] Using session ID: 1
[info] AX walker: Windows UIA (target_os = "windows")
[info] Driving user's existing Chrome session, cookies intact.

# Agent calls get_window_tree on Slack:
# returns clean role+name where Electron exposes it,
# OmniParser fallback where it doesn't.
# Same MCP grammar as the VM run below.`;

const vmStackSample = `# Terminator inside the bundled Vagrant Windows 10 VM.
# Provisioned by vagrant/Vagrantfile (stromweld/windows-10).
# 8192 MB RAM, 4 CPU, RDP forwarded, port 9222 forwarded.

$ vagrant up && vagrant ssh
$ $env:TERMINATOR_HEADLESS = "1"
$ npx -y terminator-mcp-agent@latest
[info] Initializing virtual display: 1920x1080
[info] Headless environment detected, setting up virtual session
[info] Using session ID: 0

# Agent calls get_window_tree on the same Slack build:
# identical role+name output, identical click_index resolver.
# Only the session ID changed.`;

const metrics = [
  {
    value: 1,
    label: "env var (TERMINATOR_HEADLESS) flips host mode to VM mode",
  },
  {
    value: 8192,
    label: "MB RAM in vagrant/Vagrantfile, Win10 box stromweld/windows-10",
  },
  {
    value: 9222,
    label: "guest port forwarded for Chrome remote debugging in the VM",
  },
  {
    value: 0,
    label: "lines of AX-walker code change between host and VM runs",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Are VM sandbox and accessibility tree two ways to do computer use?",
    a: "No. They sit at different layers. A VM sandbox is an execution environment: where the agent process runs and which OS it sees. The accessibility tree is a grounding primitive: how the agent identifies what to click. You always have to pick both. Most articles treat them as a binary because Anthropic's reference Claude Computer Use container ships a Docker image with pixel-only grounding hardcoded inside; people see that one stack and assume sandbox means pixels. It does not. AX-based agents work unchanged inside any VM that exposes its own desktop session.",
  },
  {
    q: "Where does the conflation come from?",
    a: "Anthropic's anthropic-quickstarts/computer-use-demo on GitHub ships a Dockerfile with a custom virtual display, a custom screenshot loop, and the computer_20251124 tool calling pixel coordinates. The whole stack is one artifact. When developers compare 'VM sandbox computer use' to a Playwright-style framework, they are really comparing two stacks that happen to differ on both axes at once: pixel-Docker versus AX-on-host. Then they ascribe the differences to one axis. The honest comparison fixes one axis at a time.",
  },
  {
    q: "Can Terminator run inside a VM today?",
    a: "Yes. The repository ships vagrant/Vagrantfile out of the box. It provisions a stromweld/windows-10 box with 8192 MB RAM, 4 CPU cores, monitor-count 3, RDP enabled, OpenSSH installed, Scoop, Git, Python, NodeJS, Rust, and Chrome installed during provisioning. Port 8080 is forwarded for the MCP server and port 9222 for Chrome remote debugging. Set TERMINATOR_HEADLESS=1 inside the VM and the same terminator-mcp-agent npm package runs with a virtual session ID instead of the desktop session ID. The Windows UIA adapter is identical in both runs.",
  },
  {
    q: "What is TERMINATOR_HEADLESS actually doing?",
    a: "It is a string check inside is_headless_environment() at crates/terminator/src/platforms/windows/virtual_display.rs line 165. If the env var equals 'true' or '1', VirtualDisplayManager::initialize() sets session_id to 0 (a virtual session) and calls create_virtual_session(). Otherwise it sets session_id to 1 (the desktop session) and skips virtual setup. The AX walker that reads UIA roles, names, and bounds is downstream of both branches. The clustering pass, the MCP tool surface, and the click resolver do not know which branch was taken.",
  },
  {
    q: "When should you actually pick a VM sandbox?",
    a: "Three cases worth the cost. First, when the agent is going to run on a server you control and there is no user desktop to drive (overnight batch automation, CI tests against installed-software flows, anything that would otherwise need a 'dedicated Windows laptop'). Second, when isolation is a security requirement (testing a flow against installers you do not trust, untrusted scripts, third-party MCP servers whose blast radius you want bounded to a single VM). Third, when reproducibility matters more than fidelity (you want the same Windows build, same DPI, same locale, same default-app set every run). Outside those cases, running on the host is cheaper, faster, and uses the user's already-logged-in browser sessions.",
  },
  {
    q: "When should you keep the agent on the host?",
    a: "When the goal is to act for the user inside their own apps. The user has Slack open with their team, Notion with their workspace, Cursor with their project, Chrome with twelve tabs and forty cookies. Spinning up a VM means losing all of that and re-authing inside the guest. The host run preserves the user's logged-in state, their installed extensions, their existing windows, and their actual screen. Terminator was built around this case, which is why the README leads with 'Uses your browser session, no need to relogin' and 'Doesn't take over your cursor or keyboard, runs in the background.' The accessibility-tree primitive is what makes 'in the background' possible; the host stack is what makes 'your browser session' possible.",
  },
  {
    q: "Why do pixel-only stacks usually ship inside a VM?",
    a: "Two reasons. First, pixel agents capture full-screen screenshots and inject mouse and keyboard events at OS level. Running that on the user's actual machine is hostile: every click steals focus, every screenshot includes the user's private windows, the user cannot use the machine while the agent runs. A VM gives the agent its own pixel buffer. Second, pixel grounding is portable across operating systems in a way that AX is not, so vendors ship one Linux Docker and call it cross-platform. The VM is not solving a computer-use problem there. It is solving an isolation and packaging problem. Pick a sandbox for the right reason.",
  },
  {
    q: "Can an accessibility-tree agent in a VM still see the host's apps?",
    a: "No. By design. The Windows UIA APIs walk the session that the calling process lives in. A Terminator instance running inside a Vagrant guest sees the guest's Notepad, the guest's Chrome, the guest's Office. It does not see the host's apps. If you need the agent to drive user-installed software, run it on the host; if you need a clean slate every run, run it in the guest and install software during provisioning. The Vagrantfile in the repo does exactly that: Chrome, Rust, Python, NodeJS, and Git all get installed during 'vagrant up' so the guest is a fresh environment ready for AX-driven automation.",
  },
  {
    q: "What about cloud sandboxes like Scrapybara, Browserbase, or E2B?",
    a: "Those are hosted sandboxes (a VM somewhere with a remote-control protocol). The same orthogonality holds: you can run Terminator inside one of them by installing the npm package and setting TERMINATOR_HEADLESS=1, or you can use their built-in pixel-based tool. The choice between AX grounding and pixel grounding is independent of whether the sandbox is yours or hosted. Today these vendors ship pixel tools by default because their reference clients are pixel-only, not because their VMs cannot host an AX agent.",
  },
  {
    q: "Where is the headless detection function in the repo?",
    a: "crates/terminator/src/platforms/windows/virtual_display.rs, function is_headless_environment, around line 165. The struct VirtualDisplayConfig (line 7) carries the resolution and refresh rate. VirtualDisplayManager::initialize (line 44) reads the env var, picks the session ID, and calls create_virtual_session. The default HeadlessConfig at line 187 wires use_virtual_display directly to the env-var check, which is why one variable is enough to switch the whole stack. None of those functions live inside the UIA adapter; they sit one layer above it.",
  },
  {
    q: "Does this all work the same on macOS?",
    a: "The orthogonality argument does. The implementation is Windows-first today. The published npx terminator-mcp-agent binary targets Windows, and the Vagrantfile provisions Windows 10. macOS support is in the Rust core (the AX walker lives at crates/terminator/src/platforms/tree_search.rs) and on app.mediar.ai for users, but the headless-VM workflow in this article runs on the Windows side. On macOS the sandbox question is usually less urgent because the user is in front of a Mac running the agent on their host; on Windows the headless server case is common, which is why the VM tooling shipped there first.",
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
    title: "Accessibility tree vs pixel for computer use: the framing is wrong",
    excerpt:
      "Tree vs pixel is not a per-agent choice. It is a per-region choice. Here is the union-find clustering pass that lets the model pick a source per click.",
    href: "/alternative/accessibility-tree-vs-pixel-computer-use",
    tag: "Alternative",
  },
  {
    title: "AX tree vs screenshot for computer use on Mac",
    excerpt:
      "Three quirks of the macOS Accessibility API that flip the AX-vs-screenshot decision from architectural to per-call.",
    href: "/alternative/ax-tree-vs-screenshot-computer-use-mac",
    tag: "Alternative",
  },
  {
    title: "Accessibility tree vs PyAutoGUI for desktop automation",
    excerpt:
      "Why selector-driven trees beat pixel coordinates and OpenCV templates for production desktop automation.",
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
            Alternative / VM sandbox vs accessibility tree
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
            VM sandbox vs accessibility tree. Two axes, not alternatives.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-700">
            The two phrases get compared in the same blog posts, threads, and roadmap docs, as if a team building a computer use agent has to pick one. They do not. A sandbox is an execution environment, an answer to <em>where does the agent process run</em>. The accessibility tree is a grounding primitive, an answer to <em>how does the agent identify what to click</em>. They sit at different layers of the same stack, and any honest deployment ends up picking one of each. This page is the long form of that argument, anchored in one open-source repo that ships both layers next to each other.
          </p>
          <div className="mt-6">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="8 min"
            />
          </div>
        </header>

        <section className="mt-10 rounded-xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer (verified 2026-05-20)
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-800">
            They are different layers, not alternatives. <strong>VM sandbox</strong> is where the agent runs (your host machine, a Vagrant box, a Scrapybara or Browserbase remote desktop, an E2B sandbox). <strong>Accessibility tree</strong> is how the agent finds targets (structured roles and names from UIA on Windows or AXUIElement on macOS, versus pixel coordinates from a screenshot). You always pick both. Most public benchmarks compare Anthropic&rsquo;s pixel-in-a-Docker reference to host-running AX frameworks like Terminator, and ascribe the differences to the sandbox axis when half the gap is on the grounding axis. The same Terminator binary runs on the host AND inside a Vagrant Windows 10 VM, gated by one env var (
            <code className="rounded bg-white px-1 text-orange-700">TERMINATOR_HEADLESS</code>) read at{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/platforms/windows/virtual_display.rs"
            >
              virtual_display.rs line 165
            </a>
            . The UIA walker is the same in both runs.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The two axes are independent
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pull them apart and the cells fall out cleanly. Execution environment along one axis, grounding primitive along the other. Each cell is a real shipped stack today, and the comparisons that matter run within a column, not across the whole matrix.
          </p>
          <FlowDiagram
            title="Four shipped stacks, two independent axes"
            steps={flowSteps}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic&rsquo;s reference Claude Computer Use container is cell four (VM + pixels). Scrapybara, Browserbase&rsquo;s computer use product, and E2B&rsquo;s desktop sandboxes default to cell four as well. PyAutoGUI scripts and Anthropic&rsquo;s desktop client running locally sit in cell two (host + pixels). Terminator&rsquo;s default install sits in cell one (host + AX). Cell three is the configuration the rest of this page is about: Terminator running unchanged inside the bundled Vagrant Windows 10 VM with{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">TERMINATOR_HEADLESS=1</code>{" "}
            set on the guest. Same Rust crate. Same MCP tool surface. Same selector grammar. Different cell.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Where the conflation came from
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anthropic&rsquo;s <code className="rounded bg-orange-50 px-1 text-orange-700">anthropic-quickstarts/computer-use-demo</code> repository ships a single Dockerfile that bundles four things: a virtual display server, a screenshot loop, the{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">computer_20251124</code> tool that returns clicks at pixel coordinates, and a Linux guest with a small set of preinstalled apps. It works as one artifact, which is exactly why people compare it as one artifact. &ldquo;Should we use the Anthropic VM sandbox or build on the accessibility tree?&rdquo; reads as a clean binary, but it folds the sandbox-versus-host axis and the pixel-versus-tree axis into one question. The two changes happen to ship together in that reference; that is not the same as the two changes being the same change.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The unbundled comparison is the useful one. A team building a finance back-office bot that needs to drive an installed Windows desktop app in production should compare cell one to cell three: AX on the user&rsquo;s machine versus AX inside a managed VM. A team prototyping a research agent that has to read pixel charts in Figma should compare cell two to cell four: pixels on a workstation versus pixels in a hosted sandbox. The cross-cell comparisons (one versus four, two versus three) are real product decisions, but the differences between those cells split fifty-fifty between the two axes, and pinning the differences on one axis is the bug.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Same engine, two cells: the proof in the repo
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Open the repo and look at how thin the diff is between cell one (host + AX) and cell three (VM + AX). Two files do the work. The Vagrantfile provisions the guest. The headless detection function flips the session ID. The accessibility tree walker is unchanged.
          </p>
          <BeforeAfter
            title="Same Terminator binary, two execution environments"
            before={{
              label: "Cell 1: host + AX",
              content: hostStackSample,
              highlights: [
                "no virtualization, drives user's existing app sessions",
                "session ID 1 (real desktop)",
                "UIA walker reads role + name from native apps directly",
              ],
            }}
            after={{
              label: "Cell 3: VM + AX",
              content: vmStackSample,
              highlights: [
                "isolated Windows 10 guest, provisioned by Vagrantfile",
                "session ID 0 (virtual session, no host interference)",
                "exact same UIA walker, exact same MCP tool grammar",
              ],
            }}
          />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The Vagrantfile lives at{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/vagrant/Vagrantfile"
            >
              vagrant/Vagrantfile
            </a>
            . It pulls the <code className="rounded bg-orange-50 px-1 text-orange-700">stromweld/windows-10</code> box, gives it 8192 MB of RAM and 4 CPU cores, turns on nested paging and large pages for VT-x, sets monitor-count to 3, forwards port 22 for SSH and 8080 for the MCP server and 9222 for Chrome remote debugging, syncs the host workspace into <code className="rounded bg-orange-50 px-1 text-orange-700">C:/Users/vagrant/terminator</code>, then runs a PowerShell provisioning script that installs OpenSSH, Scoop, Git, Python, NodeJS, Rust, and Chrome. That is everything an AX-grounded agent needs to operate, and none of it touches the accessibility-tree code path.
          </p>
          <ProofBanner
            quote="default TreeWalker does not traverse windows, so we need to traverse windows manually"
            source="crates/terminator/src/platforms/tree_search.rs, line 1"
            metric="0 lines"
          />
          <p className="mt-2 text-zinc-700 leading-relaxed">
            Zero is the number of lines that change in the AX walker between the two cells. The TLDR above is the first comment in the platform shim that backs both runs. It describes a quirk of the Windows UIA API that the implementation has to work around, and that work-around code is identical on the host and inside the VM. The session-ID flip happens one layer up, in{" "}
            <code className="rounded bg-orange-50 px-1 text-orange-700">virtual_display.rs</code>. The walker never knows which session it&rsquo;s talking to.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The numbers that define the boundary
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Four numbers from the repo, not benchmarks. Each one is a property of the boundary between the two axes.
          </p>
          <MetricsRow metrics={metrics} />
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The headline number is zero. Zero lines of AX-walker code differ between the cell-one and cell-three runs. If the two layers were really one (if sandbox-versus-host and pixels-versus-AX were the same axis), that number could not be zero. It is zero because they are not the same axis.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            When the sandbox axis actually matters
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this is an argument against VM sandboxing. There are three deployments where sandboxing is the right call regardless of grounding. First, server-side automation that has no user desktop to share, where the host case does not even exist and you need a guest to operate. Second, security-bounded automation where you are running scripts or third-party MCP servers whose blast radius needs to be contained to one virtual machine. Third, reproducibility-critical automation where the same Windows build, same DPI, same locale, same default-app set has to apply every run, and you want the Vagrant guest&rsquo;s known-clean state instead of whatever drift accumulates on a developer&rsquo;s laptop over six months.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Outside those three, the host run is cheaper and more useful, because it operates inside the user&rsquo;s existing sessions. The user has Slack logged in, the browser has the cookies, the IDE has the project open. A VM means re-authing all of that inside the guest. None of those tradeoffs are about the accessibility tree. The decision is on the sandbox axis. Picking AX-grounding or pixel-grounding inside whichever environment you chose is a separate decision, made for separate reasons (token cost, app type, surface complexity).
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            What to take to your roadmap doc
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Replace any line in your roadmap that reads &ldquo;VM sandbox vs accessibility tree&rdquo; with two separate lines. The first asks where the agent process is going to live: on a user&rsquo;s host machine, in a Vagrant or VirtualBox guest you provision yourself, or in a hosted sandbox like Scrapybara or Browserbase. Answer that one on isolation, sharing, and operational cost. The second asks how the agent identifies what to click: structured accessibility-tree nodes from UIA or AX, pixel detection from OCR or vision models, or both at once with the merging logic from{" "}
            <a
              className="text-orange-600 underline"
              href="https://github.com/mediar-ai/terminator/blob/main/crates/terminator/src/tree_formatter.rs"
            >
              tree_formatter.rs
            </a>
            . Answer that one on token cost, app coverage, and latency. The two answers compose into a cell. Cells three and one are both legitimate Terminator deployments. Cell four is the Anthropic reference. Cell two is a PyAutoGUI script. They are all real, and they are all the answer to <em>two</em> questions, not one.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination={BOOKING_URL}
          site="Terminator"
          heading="Designing a computer use stack and stuck between host and VM, AX and pixels?"
          description="30 minutes. Bring your two axes, leave with a concrete cell choice for each phase of your rollout."
        />

        <FaqSection
          heading="Questions about VM sandbox versus accessibility tree"
          items={faqs}
        />

        <RelatedPostsGrid
          title="Adjacent reads"
          subtitle="More on the grounding axis, where most of the writing already lives"
          posts={relatedPosts}
        />
      </div>

      <BookCallCTA
        appearance="sticky"
        destination={BOOKING_URL}
        site="Terminator"
        description="Stop comparing the two axes as one decision. Book a 30-minute working session."
      />
    </article>
  );
}
