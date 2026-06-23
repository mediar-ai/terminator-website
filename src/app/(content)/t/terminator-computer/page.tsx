import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  StepTimeline,
  ComparisonTable,
  AnimatedChecklist,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/terminator-computer";
const PUBLISHED = "2026-06-22";
const TITLE =
  "Terminator computer: the open-source tool that lets AI control your desktop";
const DESCRIPTION =
  "Search 'terminator computer' and you get Skynet from the movies. There is also a real, open-source developer tool named Terminator that gives AI assistants computer-use control over every app on your desktop, through native accessibility APIs instead of screenshots. Here is what it is and how it actually drives the machine.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Not the fictional Skynet. Terminator is a real open-source framework that hands AI assistants control of your whole computer through the accessibility tree. Install in one line.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator computer: the real tool that lets AI drive your desktop",
    description:
      "There is a developer tool named Terminator that gives AI computer-use control of every app on your machine via accessibility APIs, not screenshots. One-line MCP install.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Terminator computer" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Terminator computer", url: PAGE_URL },
];

const loopSteps = [
  {
    title: "Capture the screen and the tree",
    description:
      "The agent takes a screenshot of the target window and, on the default path, the live accessibility tree of every element in it. The tree is the structured part: each control already carries its role, name, and bounds from the OS.",
  },
  {
    title: "Ask the model what to do next",
    description:
      "The current state goes to the model. In the bundled Gemini loop, the model replies with a single action: click_at, type_text_at, or scroll_document are the literal action names documented at crates/terminator-computer-use/src/lib.rs line 20.",
  },
  {
    title: "Translate the action into a real click",
    description:
      "Vision models emit a point in a normalized 0-999 grid, not screen pixels. convert_normalized_to_screen at lib.rs:336 walks that point back through the resize scale, the DPI scale, and the window offset to land on the exact pixel. On the accessibility path there is no math: the element already knows where it is.",
  },
  {
    title: "Execute, then report a status",
    description:
      "The action runs against the OS. Each step returns one of four statuses, spelled out at lib.rs:86: success, failed, needs_confirmation, or max_steps_reached. The needs_confirmation branch is the safety gate, the agent pauses instead of clicking something destructive on its own.",
  },
  {
    title: "Feed the result back and repeat",
    description:
      "The new screenshot and the outcome of the last action go back to the model for the next step. The loop continues until the model declares the task complete or hits its step ceiling. That is the whole computer-use cycle.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "How it finds a button to click",
    competitor: "Reads a screenshot, infers pixel coordinates of the button",
    ours: "Looks up the button in the accessibility tree by role and name",
  },
  {
    feature: "What happens when the window moves or DPI changes",
    competitor: "Coordinates drift, the click misses",
    ours: "The element reference still resolves, the OS tracks its position",
  },
  {
    feature: "Speed per action",
    competitor: "Gated by a vision model round-trip every single step",
    ours: "Structural lookups run at CPU speed, the model is called only on recovery",
  },
  {
    feature: "Does it seize your mouse and keyboard",
    competitor: "Usually drives the real cursor, you cannot touch the machine",
    ours: "Runs in the background through the accessibility interface, you keep working",
  },
  {
    feature: "Where vision still helps",
    competitor: "It is the only input, so it is used everywhere",
    ours: "Reserved for canvases and custom-drawn UI the tree cannot describe",
  },
];

const faqs: FaqItem[] = [
  {
    q: "Is 'Terminator computer' the same thing as Skynet from the films?",
    a: "No. Skynet is the fictional artificial intelligence from the Terminator movies, a defense computer that becomes self-aware. This page is about a different thing that shares the name: Terminator, a real open-source software framework from Mediar AI that lets AI assistants control your actual computer. It is a developer tool you install, not a movie plot. The name is a nod to the franchise; the product is a desktop automation framework.",
  },
  {
    q: "What does the Terminator tool actually do?",
    a: "It gives an AI assistant the ability to drive every application on your desktop the way a person would: open apps, click buttons, type into fields, read what is on screen, and chain those actions into a task. It does this through native accessibility APIs (Windows UI Automation, macOS Accessibility), the same interfaces screen readers use, so it understands the structure of the UI rather than guessing from pixels. Think of it as Playwright, the browser automation tool, but pointed at your whole operating system instead of just a web page.",
  },
  {
    q: "How do I install it?",
    a: "For an AI assistant that speaks MCP, it is one line. In Claude Code: claude mcp add terminator \"npx -y terminator-mcp-agent@latest\". For Cursor, VS Code, or Windsurf you add the same npx command to your MCP config file. If you want to call it from code directly, there is a Rust crate (terminator-rs) and Python bindings (terminator-py). The full setup is in the repo at github.com/mediar-ai/terminator.",
  },
  {
    q: "Does it take over my mouse and keyboard while it runs?",
    a: "No, and this is one of its deliberate design choices. Most screenshot-driven computer-use agents move your real cursor, so you have to sit on your hands while they work. Terminator drives applications through the accessibility interface in the background, which means it can click and type inside apps without hijacking your physical mouse or keyboard. You can keep using the machine for something else while it works.",
  },
  {
    q: "What is the terminator-computer-use crate I see in the repo?",
    a: "It is a self-contained autonomous agent that uses Google's Gemini Computer Use model to drive the desktop end to end. Its Cargo.toml describes it as 'Gemini Computer Use - AI-powered autonomous desktop automation'. This is the pure-vision path: the model looks at screenshots and emits actions like click_at and type_text_at. It is the fallback for when you want a hands-off agent. The recommended path for production work is the accessibility tree, with vision used only where the tree falls short. Both share the same underlying click implementation.",
  },
  {
    q: "Why use accessibility APIs instead of just letting the model look at the screen?",
    a: "Three reasons: latency, stability, and reliability. A vision-only loop calls a model on every single step, which is slow and expensive. Accessibility lookups run at CPU speed and only invoke the model when something needs recovery. Vision-derived coordinates also break when a window moves or the display scaling changes, because nothing on the screen is anchored to a raw pixel; an accessibility element reference survives those changes because the OS tracks where the element is. The result is a deterministic automation that the project reports running with a high success rate, with AI reserved for the moments it is genuinely needed.",
  },
  {
    q: "Which operating systems does it support?",
    a: "Windows is the primary, fully supported platform, with element location, clicking and typing, application and window management, browser automation, workflow recording, and screen capture all stable. macOS support exists at the core Rust level. Linux uses the AT-SPI2 accessibility layer. The Node.js, Python, and MCP packages currently ship Windows binaries, so if you are wiring an AI assistant to your desktop today, Windows is the path with the fewest sharp edges.",
  },
  {
    q: "Is it free and open source?",
    a: "Yes. Terminator is MIT licensed, so you can read the source, fork it, and ship it inside your own product with no lock-in. The code lives at github.com/mediar-ai/terminator. There is also a hosted product (the Mediar workflow builder) for teams who want recording, mapping, and managed execution without running their own infrastructure, but the framework itself is open.",
  },
  {
    q: "Who is this for?",
    a: "Developers building desktop automation, AI agents with computer-use capabilities, or MCP tools that need to drive real applications beyond the browser. It is a strong fit if you have hit reliability limits with PyAutoGUI, AutoHotkey, raw UI Automation, or screenshot-based approaches. It is not the right tool if you only need web-browser automation (Playwright already does that well) or if you want a no-code consumer app.",
  },
];

export default function Page() {
  const jsonLd = [
    articleSchema({
      headline: TITLE,
      description: DESCRIPTION,
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      author: "Matthew Diakonov",
      authorUrl: "https://m13v.com",
      publisherName: "Terminator",
      publisherUrl: "https://t8r.tech",
    }),
    breadcrumbListSchema(breadcrumbSchemaItems),
    faqPageSchema(faqs),
  ];

  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-5 pt-10 pb-24">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-8">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-orange-600">
            Guide
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
            Terminator computer: the real tool behind the name
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-600">
            Type &ldquo;terminator computer&rdquo; into a search box and you get
            Skynet: the fictional defense computer that goes self-aware in the
            films. Fair enough. But there is also a real piece of software named
            Terminator, and it does something the movies only imagined: it lets
            an AI control your actual computer.
          </p>

          <div className="mt-6">
            <ArticleMeta
              author="Matthew Diakonov"
              authorRole="Written with AI"
              datePublished={PUBLISHED}
              readingTime="8 min read"
            />
          </div>
        </header>

        {/* Direct answer */}
        <section className="mt-10 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-orange-700">
            Direct answer &middot; verified Jun 22, 2026
          </p>
          <p className="mt-3 text-lg leading-relaxed text-zinc-800">
            <strong className="text-zinc-900">Terminator</strong> is an
            open-source framework from Mediar AI that gives AI assistants
            (Claude, Cursor, VS Code, and others) computer-use control over
            every app on your desktop. It works through native accessibility
            APIs instead of screenshots, so it is fast and deterministic. It is
            not the movie&rsquo;s Skynet; it is a developer tool you install in
            one line:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-orange-200 bg-white p-4 text-sm leading-relaxed text-zinc-800">
            <code className="font-mono">
              claude mcp add terminator &quot;npx -y
              terminator-mcp-agent@latest&quot;
            </code>
          </pre>
          <p className="mt-4 text-sm text-zinc-600">
            Source and full docs:{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              github.com/mediar-ai/terminator
            </a>{" "}
            (MIT licensed).
          </p>
        </section>

        {/* Two namesakes */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Two things named Terminator, one of them is software you can run
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500">
                The fictional one
              </p>
              <p className="mt-2 font-semibold text-zinc-900">
                Skynet / the Terminator computer
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                The artificial intelligence from the films, built by the
                fictional Cyberdyne Systems, that becomes self-aware and turns
                on humanity. A story. Nothing to install.
              </p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <p className="text-xs font-mono uppercase tracking-[0.16em] text-orange-700">
                The real one
              </p>
              <p className="mt-2 font-semibold text-zinc-900">
                Terminator by Mediar AI
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                An open-source desktop automation framework. It is shaped like
                Playwright, the browser-testing tool, but it targets your whole
                operating system rather than a single web page. Real code, real
                downloads, real AI control of real apps.
              </p>
            </div>
          </div>
          <p className="mt-6 text-base leading-relaxed text-zinc-700">
            The rest of this page is about the second one, because that is the
            one you can actually use. If you landed here looking for the movie
            lore, the short version is above and you can stop reading. If you
            are a developer who keeps seeing the name attached to AI agents and
            wants to know what it does, keep going.
          </p>
        </section>

        {/* What computer use means */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            What &ldquo;computer use&rdquo; means here
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            Computer use is the idea of letting an AI model operate a computer
            the way a person does: not by calling an API, but by clicking
            buttons, typing into fields, reading what is on screen, and stringing
            those actions together to finish a task. It is how an assistant can
            check logs in a dashboard that has no API, fill in a legacy desktop
            form, or test your own app by actually using it.
          </p>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            The hard part is the bridge between &ldquo;the model decided to click
            Save&rdquo; and &ldquo;the Save button got clicked.&rdquo; There are
            two ways to build that bridge. You can show the model a screenshot
            and have it point at a pixel. Or you can give the model the
            structured tree of every control in the window and have it pick one
            by name. Terminator is built around the second, and falls back to the
            first only when it has to. That single decision is what makes it
            different from most things sold as &ldquo;computer use.&rdquo;
          </p>
        </section>

        {/* Anchor: the loop */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            How the computer-use loop actually runs
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            You do not have to take the architecture on faith; it is in the
            source. The repository ships a crate at{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
              crates/terminator-computer-use
            </code>
            , whose Cargo.toml describes it as &ldquo;Gemini Computer Use -
            AI-powered autonomous desktop automation.&rdquo; Here is the cycle it
            runs, step by step, with the exact functions that do the work.
          </p>
          <div className="mt-8">
            <StepTimeline steps={loopSteps} />
          </div>
          <p className="mt-6 text-sm leading-relaxed text-zinc-600">
            That coordinate translation in step three is worth dwelling on,
            because it is the cost the vision path pays on every click. The model
            speaks in a normalized 0-999 grid, and{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-800">
              convert_normalized_to_screen
            </code>{" "}
            has to undo a resize scale, a DPI scale, and a window offset to find
            the real pixel. On the accessibility path that whole function is
            unnecessary, because the element told the OS where it is from the
            start. You can read both yourself in{" "}
            <a
              href="https://github.com/mediar-ai/terminator/tree/main/crates/terminator-computer-use"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              the crate source
            </a>
            .
          </p>
        </section>

        {/* Comparison */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Accessibility tree vs. looking at the screen
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            The headline products you have heard of for AI computer use mostly
            read screenshots and infer where to click. Terminator can do that
            too, but it prefers to ask the operating system what is on screen.
            The difference shows up everywhere that matters in production.
          </p>
          <div className="mt-8">
            <ComparisonTable
              productName="Terminator (accessibility-first)"
              competitorName="Screenshot-only computer use"
              rows={comparisonRows}
              caveat="Vision is not the enemy here. Terminator keeps it on hand for canvases, custom-drawn controls, and anything the accessibility tree cannot describe. The point is that it is the exception, not the default."
            />
          </div>
          <p className="mt-6 text-base leading-relaxed text-zinc-700">
            If you want the long version of this argument, with the latency and
            internationalization tradeoffs spelled out, see{" "}
            <a
              href="/t/why-accessibility-apis-beat-ocr-and-pixel-matching"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              why accessibility APIs beat OCR and pixel matching
            </a>
            , and the deeper dive on{" "}
            <a
              href="/t/accessibility-api-computer-use-agents"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              the seven grounding modes a real agent falls through
            </a>
            .
          </p>
        </section>

        {/* What you can do */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            What you can hand the computer to do
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            Once Terminator is wired into an assistant that speaks MCP, the
            assistant gains a set of desktop powers it did not have when it could
            only write code. These are the things it can now do on the machine
            itself, with you free to keep working alongside it.
          </p>
          <div className="mt-8">
            <AnimatedChecklist
              title="With the MCP server connected, the assistant can"
              items={[
                {
                  text: "Open and switch between any application, not just the browser",
                  checked: true,
                },
                {
                  text: "Click buttons and type into fields by name, across native and legacy apps",
                  checked: true,
                },
                {
                  text: "Read the structure of what is on screen instead of guessing from pixels",
                  checked: true,
                },
                {
                  text: "Record a human workflow once and replay it deterministically",
                  checked: true,
                },
                {
                  text: "Reuse your existing browser session, so no relogin and your cookies stay",
                  checked: true,
                },
                {
                  text: "Run in the background without grabbing your mouse or keyboard",
                  checked: true,
                },
              ]}
            />
          </div>
          <p className="mt-6 text-base leading-relaxed text-zinc-700">
            The maintainers list concrete examples in the repo: spin up a new
            instance on a cloud provider and connect to it from the CLI, dig
            through logs in a hosting dashboard to find the most common errors,
            or test new features of your own app based on recent commits. None
            of those require an API for the target tool; the assistant just uses
            the app.
          </p>
        </section>

        {/* Get started */}
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Getting started in one line
          </h2>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            The fastest path is the MCP server. If you use Claude Code, add it
            with a single command and the assistant can drive your desktop from
            its next message:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-900 p-4 text-sm leading-relaxed text-zinc-100">
            <code className="font-mono">
              claude mcp add terminator &quot;npx -y
              terminator-mcp-agent@latest&quot;
            </code>
          </pre>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            For Cursor, VS Code, or Windsurf, drop the same{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
              npx -y terminator-mcp-agent@latest
            </code>{" "}
            command into your MCP config file under a server entry. If you would
            rather call it from your own code, install the Rust crate{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
              terminator-rs
            </code>{" "}
            or the Python package{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-800">
              terminator-py
            </code>
            . Windows is the platform with full support today.
          </p>
        </section>

        <div className="mt-16">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Building an agent that needs to drive real desktop apps?"
            description="Talk through your automation with the team behind Terminator and find out whether the accessibility-first approach fits your use case."
          />
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <p className="text-base leading-relaxed text-zinc-700">
            The name borrows from the movies. The software is the part you can
            run today: an open-source framework that finally gives an AI the
            hands to operate your whole computer, built on the boring,
            dependable plumbing of accessibility APIs rather than the
            sci-fi of a self-aware mainframe. Read the source at{" "}
            <a
              href="https://github.com/mediar-ai/terminator"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              github.com/mediar-ai/terminator
            </a>{" "}
            or join the build conversation on{" "}
            <a
              href="https://discord.gg/dU9EBuw7Uq"
              className="font-medium text-orange-600 underline underline-offset-2"
            >
              Discord
            </a>
            .
          </p>
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Give your AI assistant hands on the desktop. Talk to the team."
      />
    </article>
  );
}
