import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  StepTimeline,
  RelatedPostsGrid,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/node-with-id-not-found-in-a11y-tree";
const PUBLISHED = "2026-06-21";
const TITLE =
  '"node with id X not found in a11y tree": what it means and the fix';
const DESCRIPTION =
  'The error means your automation acted on an accessibility node by an id it captured from an earlier tree snapshot, and the tree changed before the action ran. Here is why it happens, how to recover right now, and the architectural fix: re-resolve a durable role/name selector against the live tree at action time instead of caching snapshot ids.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      'A node id is only valid inside the snapshot it came from. When the tree re-renders, navigates, or a modal opens, the id stops resolving and you get "node with id X not found in a11y tree." The durable fix is to bind to a selector, not an id.',
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: 'Why you get "node with id X not found in a11y tree"',
    description:
      "Snapshot node ids go stale the moment the tree changes. Re-snapshot to recover, or bind to a durable role/name selector re-resolved at action time.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "node with id not found in a11y tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "node with id not found in a11y tree", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: 'What does "node with id X not found in a11y tree" actually mean?',
    a: "It means your automation tool captured a node from one accessibility-tree snapshot, recorded that node's numeric id, and then tried to act on that id later. Between the capture and the action, the tree changed, so the id no longer points to anything. The id was never a stable handle on the element; it was an index into a frozen snapshot that is now out of date.",
  },
  {
    q: "Why does the tree change between snapshot and action?",
    a: "Common triggers: the page or app re-rendered (React/Vue re-mount, virtualized list scroll), you navigated or submitted a form, a modal or consent banner opened on top, focus moved to a new window, or an async load swapped the content. Any of these rebuilds part of the tree and reassigns ids, so a previously valid id falls out.",
  },
  {
    q: "What is the quickest way to recover from this error?",
    a: "Take a fresh snapshot of the accessibility tree right before you act, then look up the element again in the new snapshot and use the new id. Never reuse an id across a navigation, a click that mutates the page, or a wait. If you re-snapshot and the element still is not present, you are waiting on something that has not rendered yet, which is a timing problem, not an id problem.",
  },
  {
    q: "Is re-snapshotting the real fix or just a workaround?",
    a: "Re-snapshotting is the correct recovery for any tool whose API is built around snapshot ids. It is a workaround for the underlying design: numeric ids are ephemeral. The structural fix is to stop binding to ids at all and bind to a durable selector (role plus name, automation id, or a relational query) that gets re-resolved against the live tree every time you act.",
  },
  {
    q: "Does this happen with desktop apps too, or only browsers?",
    a: "Both. Browser tools (CDP accessibility snapshots, Playwright a11y, agent-browser refs) hit it most visibly, but native desktop trees go stale the same way. A Windows UIA RuntimeId or an element pointer from one AX query becomes invalid when the app rebuilds its view, switches tabs, or opens a dialog. The cause is identical: you held a reference into a tree that moved.",
  },
  {
    q: "How does Terminator avoid the stale-id problem?",
    a: "Terminator never hands you a snapshot id to act on. You describe the element with a selector like role:Button|name:Save, and at action time its locator calls find_element against the live tree with a timeout, re-resolving the selector each time. Because the binding is semantic (role and name) rather than an index into a past capture, there is no id to go stale. See crates/terminator/src/locator.rs and crates/terminator/src/selector.rs.",
  },
  {
    q: "When should I still expect a failure even with a selector?",
    a: "If the element genuinely is not in the live tree (it has not rendered, it is in a different window you have not attached to, or it is drawn as raw pixels with no accessibility node), a selector returns a timeout rather than a stale-id error. That is the honest signal: the element is not there yet or is not exposed, which is a different problem from an id that expired.",
  },
];

const relatedPosts = [
  {
    title: "Accessibility API desktop automation",
    href: "/t/accessibility-api-desktop-automation",
    excerpt:
      "Why driving apps through the accessibility tree beats screenshots and pixel matching for native desktop control.",
    tag: "Guide",
  },
  {
    title: "RPA with accessibility-tree selectors",
    href: "/t/rpa-accessibility-tree-selectors",
    excerpt:
      "Selectors that survive layout changes, theme switches, and localization because they bind to role and name.",
    tag: "Guide",
  },
  {
    title: "Verifying cross-platform desktop automation",
    href: "/t/cross-platform-desktop-automation-verify",
    excerpt:
      "How to confirm an action landed when the same selector has to work on Windows UIA and macOS AX.",
    tag: "Guide",
  },
];

const staleSelectorCode = `# the stale-id pattern (every snapshot-id tool)
snapshot = agent.snapshot()              # node 42 = the Save button, right now
save_id  = find(snapshot, "Save").id     # 42
agent.click(modal_appeared_then())       # tree rebuilds, ids reassigned
agent.click_by_id(save_id)               # 42 is gone
#   -> "node with id 42 not found in a11y tree"`;

const durableSelectorCode = `// the durable-selector pattern (Terminator)
let app = desktop.application("notepad")?;

// the selector is a *description*, not an index into a past snapshot
app.locator("role:Button|name:Save")?
   .click(Some(Duration::from_secs(5)))   // re-resolved against the LIVE tree here
   .await?;
// no id is ever held across an action, so none can go stale`;

export default function Page() {
  return (
    <article className="min-h-screen">
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
              authorUrl: "https://m13v.com",
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
          __html: JSON.stringify(faqPageSchema(faqs, PAGE_URL + "#faq")),
        }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-600 mb-4">
          Error decoded
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 leading-tight">
          &ldquo;node with id <span className="text-orange-600">X</span> not
          found in a11y tree&rdquo;
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          You are not looking for an element that does not exist. You are looking
          for an element by an <strong className="text-zinc-900">id that
          expired</strong>. That id was only ever valid inside one snapshot of
          the accessibility tree, and the tree moved before your action ran.
        </p>
      </header>

      <div className="max-w-3xl mx-auto px-6">
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="6 min read"
        />
      </div>

      {/* Direct answer */}
      <section className="max-w-3xl mx-auto px-6 mt-8">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-700 mb-3">
            Direct answer &middot; verified 2026-06-21
          </p>
          <p className="text-zinc-800 leading-relaxed">
            The error means an automation captured a node by its{" "}
            <strong className="text-zinc-900">numeric id from an earlier
            accessibility-tree snapshot</strong>, then tried to act on that id
            after the tree had changed (a re-render, a navigation, a modal, or a
            focus shift). The id no longer maps to any node, so the lookup
            fails. Recover by{" "}
            <strong className="text-zinc-900">taking a fresh snapshot
            immediately before each action</strong> and re-querying the element.
            The durable fix is to stop acting on ids: bind to a{" "}
            <strong className="text-zinc-900">role plus name selector</strong>{" "}
            that is re-resolved against the live tree at action time, so there is
            no id to go stale.
          </p>
        </div>
      </section>

      {/* What is actually happening */}
      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          The id is an index into a snapshot, not a handle on the element
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Every accessibility-tree tool gives you a flattened view of the live
          tree at one instant. To make that view addressable it tags each node
          with an id: a number, a ref like <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">@e7</code>, a
          backend node id from the Chrome DevTools Protocol, or a UIA
          RuntimeId. That id is meaningful <em>only</em> inside the snapshot it
          was minted in. It is not a stable pointer to the button on screen; it
          is a row number in a table that gets thrown away and rebuilt.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          So the moment the tree is rebuilt, the table is regenerated and the row
          numbers shuffle. Your saved id now points at nothing, or worse, at a
          different element. The tool detects the first case and raises{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">
            node with id X not found in a11y tree
          </code>
          . The same class of error shows up worded slightly differently across
          stacks: &ldquo;Could not find node with id N in commit tree&rdquo; in
          React DevTools, &ldquo;Ref not found: @eN&rdquo; in
          snapshot-ref browser agents, &ldquo;Unregistered node&rdquo; in some UI
          frameworks. Different words, one cause.
        </p>
      </section>

      {/* Lifecycle diagram */}
      <section className="max-w-3xl mx-auto px-6 mt-12">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          The exact moment it goes stale
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-2">
          Here is the lifecycle of a single click that fails. The id is born
          valid and dies between two steps you did not think changed anything.
        </p>
        <SequenceDiagram
          title="snapshot id lifecycle"
          actors={["Your code", "A11y tree", "Target app"]}
          messages={[
            { from: 0, to: 1, label: "snapshot()", type: "request" },
            { from: 1, to: 0, label: 'Save = node 42', type: "response" },
            { from: 0, to: 2, label: "click() opens a dialog", type: "event" },
            { from: 2, to: 1, label: "tree rebuilt, ids reassigned", type: "event" },
            { from: 0, to: 1, label: "act on node 42", type: "request" },
            { from: 1, to: 0, label: "node 42 not found", type: "error" },
          ]}
        />
        <p className="text-zinc-600 leading-relaxed text-sm">
          Nothing is broken in the app. The button is still on screen. The only
          thing that is wrong is that you are holding a number from a snapshot
          that no longer exists.
        </p>
      </section>

      {/* Recover now */}
      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Recover right now, with the tool you already have
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          If you are on a snapshot-id API and just need the run to pass, the fix
          is mechanical. Shorten the distance between capture and action so the
          id has no time to expire.
        </p>
        <StepTimeline
          steps={[
            {
              title: "Re-snapshot immediately before acting",
              description:
                "Move the snapshot call to the line right above the action. Do not snapshot once at the top of a function and reuse ids ten lines down.",
            },
            {
              title: "Re-query, never reuse the id",
              description:
                "After any click that navigates or mutates, after any wait, and after any dialog, throw the old ids away and look the element up again in the fresh snapshot.",
            },
            {
              title: "Clear the overlay first",
              description:
                "If a consent banner or modal opened on top, that rebuild is what invalidated your id. Dismiss or interact with the covering element, then re-snapshot before retrying the original target.",
            },
            {
              title: "If it is still missing, it is a timing problem",
              description:
                "A fresh snapshot that still lacks the element means it has not rendered yet. Wait on a condition (visible, enabled) instead of sleeping a fixed number of milliseconds, then snapshot again.",
            },
          ]}
        />
      </section>

      {/* The durable fix */}
      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          The durable fix: bind to a selector, re-resolve at action time
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Re-snapshotting treats the symptom. The cause is that your action is
          coupled to an ephemeral id. Remove the id from the contract entirely:
          describe the element by what it <em>is</em> (its role and name), and
          let the framework re-find it against the live tree at the instant you
          act. There is then no value to carry across a state change, so nothing
          can go stale.
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-8">
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-200 bg-zinc-50">
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                Holds an id &rarr; goes stale
              </span>
            </div>
            <pre className="text-[13px] leading-relaxed p-4 overflow-x-auto text-zinc-800 font-mono whitespace-pre">
              <code>{staleSelectorCode}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-orange-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 border-b border-orange-200 bg-orange-50">
              <span className="font-mono text-xs uppercase tracking-widest text-orange-700">
                Holds a selector &rarr; never stale
              </span>
            </div>
            <pre className="text-[13px] leading-relaxed p-4 overflow-x-auto text-zinc-800 font-mono whitespace-pre">
              <code>{durableSelectorCode}</code>
            </pre>
          </div>
        </div>

        <p className="text-zinc-700 leading-relaxed">
          This is the design Terminator ships with. The selector is parsed into a
          semantic query, not a snapshot index. Its variants are role-and-name,
          automation id, name, text, attributes, and even relational ones like{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">RightOf</code>{" "}
          and <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">Below</code> an anchor element. None of them is an
          id from a past capture.
        </p>
      </section>

      {/* Anchor fact */}
      <section className="max-w-3xl mx-auto px-6 mt-12">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-3">
            Where this lives in the source
          </h2>
          <p className="text-zinc-700 leading-relaxed">
            In{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
              crates/terminator/src/locator.rs
            </code>
            , the locator&rsquo;s <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">wait()</code> method does not cache a
            node. Every time you act, it runs{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
              engine.find_element(&amp;selector, root, timeout)
            </code>{" "}
            on a blocking-safe thread, re-resolving the selector against the
            current tree and polling up to the timeout. The selector itself is
            defined as an enum in{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
              crates/terminator/src/selector.rs
            </code>
            : <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">Role &#123; role, name &#125;</code>,{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">Name</code>,{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">NativeId</code>,{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">Attributes</code>, and relational
            variants. There is no snapshot-index variant in the enum, which is
            precisely why there is no id that can go missing from the tree.
          </p>
          <p className="text-zinc-700 leading-relaxed mt-4">
            The same selector string flows through the MCP server too. The click
            tool in{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
              crates/terminator-mcp-agent
            </code>{" "}
            takes a selector such as{" "}
            <code className="font-mono text-sm bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-800">
              role:Button|name:Save
            </code>{" "}
            and resolves it at call time, so an AI agent driving a real app
            through Terminator never holds a stale id between tool calls either.
          </p>
        </div>
      </section>

      {/* Desktop scope */}
      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900 mb-4">
          This is not only a browser problem
        </h2>
        <p className="text-zinc-700 leading-relaxed">
          Most writing about this error assumes you are inside a browser, because
          that is where snapshot-ref agents are most common. But the failure mode
          is a property of any accessibility tree, and native desktop trees churn
          just as hard: a Windows UIA RuntimeId is invalidated when the control
          is re-created, an AX element reference on macOS dies when the app
          rebuilds a view or switches tabs, and a line-of-business app that
          redraws a grid throws away every node you were holding.
        </p>
        <p className="text-zinc-700 leading-relaxed mt-4">
          Terminator targets the whole OS rather than a single tab, so the
          stale-binding question matters across every app on the desktop, not
          just the page in front of you. The answer is the same everywhere: do
          not hold a reference into a tree that moves. Hold a description and
          re-resolve it. That is why the same{" "}
          <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">role:Button|name:Save</code>{" "}
          selector is portable across the Windows UIA adapter and the macOS AX
          adapter without you ever touching a platform-specific id.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Building an agent that keeps losing its element references?"
          description="Talk through how to drive native apps with durable selectors instead of snapshot ids that expire mid-run."
        />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-14">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Frequently asked questions
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-8">
        <p className="text-zinc-700 leading-relaxed">
          Terminator is an open-source desktop automation framework for Windows
          and macOS that drives apps through native accessibility APIs, with a
          Playwright-shaped API for the whole OS and an MCP server for AI agents.
          The source is on{" "}
          <a
            href="https://github.com/mediar-ai/terminator"
            className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          . For more on how snapshot refs go stale in browser agents, the{" "}
          <a
            href="https://github.com/vercel-labs/agent-browser"
            className="text-orange-600 underline underline-offset-2 hover:text-orange-700"
            target="_blank"
            rel="noopener noreferrer"
          >
            agent-browser
          </a>{" "}
          docs describe the same re-snapshot recovery for the browser case.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 mt-12 mb-20">
        <RelatedPostsGrid posts={relatedPosts} />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Drive native apps with selectors that never go stale."
      />
    </article>
  );
}
