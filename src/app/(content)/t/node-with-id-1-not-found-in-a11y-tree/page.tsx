import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  ComparisonTable,
  StepTimeline,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type RelatedPost,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/node-with-id-1-not-found-in-a11y-tree";
const PUBLISHED = "2026-06-22";
const TITLE =
  '"node with id 1 not found in a11y tree": what the error means and how to stop it';
const DESCRIPTION =
  'The "node with id 1 not found in a11y tree" error is a stale reference: a numeric accessibility-tree index captured in one snapshot no longer maps to a live node by the time the click runs. Here is why it happens in computer-use agents, and how Terminator sidesteps the whole class by pairing every index with a re-resolvable selector and polling the live tree on a 100ms loop.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      'Most write-ups treat this as a Puppeteer CSS quirk. The version that bites AI agents is different: a cached numeric node id that goes stale between the tree snapshot and the action. This explains both, with the Terminator source that avoids it.',
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: '"node with id 1 not found in a11y tree" explained',
    description:
      "A numeric a11y-tree index is only valid for the snapshot it came from. Re-render the tree and id 1 is gone. The fix is re-resolving by selector, not by frozen index.",
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
  { name: "node with id 1 not found in a11y tree", url: PAGE_URL },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "What the model holds onto",
    competitor: "A bare integer (node id 1, 14, 42) valid only for one snapshot",
    ours: "A 1-based index that also carries the structural selector that produced it",
  },
  {
    feature: "When the tree re-renders",
    competitor: "The integer now points at nothing, or worse, at a different element",
    ours: "The selector is re-resolved against the live tree at action time",
  },
  {
    feature: "Reaction to a missing element",
    competitor: 'Hard throw: "node with id 1 not found in a11y tree"',
    ours: "Polls every 100ms up to the timeout, then a typed Timeout error you can branch on",
  },
  {
    feature: "Recovery path for the agent",
    competitor: "Re-snapshot the whole tree, re-number everything, retry from scratch",
    ours: "Call the same selector again, no re-numbering, no stale map to invalidate",
  },
  {
    feature: "Where the mapping lives",
    competitor: "An opaque id table inside the driver, gone after the next snapshot",
    ours: "index_to_bounds in tree_formatter.rs, a HashMap whose value includes the selector",
  },
];

const faqs: FaqItem[] = [
  {
    q: 'What does "node with id 1 not found in a11y tree" actually mean?',
    a: "It means an automation tool asked the accessibility tree for the node it had labeled id 1 (or any integer), and that node is not in the current tree. The id was assigned when the tree was serialized at some earlier moment. Between then and the lookup, the tree was rebuilt: the page re-rendered, you navigated, a dialog opened or closed, or the accessibility mode changed and the whole tree was re-sent from the root. The integer is now dangling. It is a stale reference, not proof that the button or field is gone. The element you wanted may be sitting right there in the new tree under a different id.",
  },
  {
    q: "Why does it so often say id 1 specifically?",
    a: "Because many serializers number nodes from the root down and the root or first interactive node lands at index 1. When the tree is rebuilt, code that still holds the old root or first id is the first thing to dereference, so id 1 is the most common one to fail first. The number is not special. id 14 and id 42 fail for the exact same reason; id 1 just tends to be touched earliest in a retry loop.",
  },
  {
    q: "Is this the same as Selenium's StaleElementReferenceException?",
    a: "Same root cause, different layer. Selenium hands you an element handle backed by an internal reference id; when the DOM changes, the handle goes stale and any action on it throws StaleElementReferenceException. The a11y-tree version is the same staleness, except the handle is a small integer the model was given in a flattened accessibility snapshot. In both cases the cure is identical: stop holding the reference across a tree change. Re-locate the element by a description that survives the change (a role plus a name, a structural selector) instead of by an id minted for one snapshot.",
  },
  {
    q: "I see it in Puppeteer or a browser context, not an AI agent. Same thing?",
    a: "Mostly. In a pure browser context the error can also come from CSS: an element set to display:contents has no box, so it may be dropped from the accessibility tree, and a list whose style removes its bullets can lose its list role in some engines. Those are cases where the node never made it into the tree, so add a wait for the page to settle and check that the element is actually exposed (not hidden, not display:contents). But once you are driving real apps with an agent that caches numeric indices, the dominant cause is staleness between snapshot and action, and CSS fixes will not help.",
  },
  {
    q: "How does Terminator avoid the error instead of just retrying it?",
    a: "Two design choices. First, when Terminator flattens a window into an indexed tree for a model, the index is not a bare integer. In crates/terminator/src/tree_formatter.rs the index_to_bounds map stores, for each index, the role, the name, the bounds, and the selector that produced it. So even an indexed click degrades to a re-resolvable selector rather than a dangling id. Second, actions go through a Locator that re-resolves the selector at call time. In crates/terminator/src/locator.rs the wait_for loop polls every 100ms, re-running the lookup against the live tree until the element appears or the timeout elapses. There is no frozen node id to go stale, so there is no node-not-found-in-tree throw to catch.",
  },
  {
    q: "If there is no cached id, why does Terminator have an index at all?",
    a: "Because models are good at picking an item out of a short numbered list and bad at writing perfect selector strings from scratch. The index is a convenience for the model's turn, not a durable handle. You can hand the model a compact numbered tree, let it say click index 7, and Terminator looks up entry 7, pulls the selector and bounds it stored alongside that index, and resolves it now. The number lives exactly one round-trip. It is never carried across a re-render, which is the only place it could go stale.",
  },
  {
    q: "What should I do right now if my own agent throws this?",
    a: "Stop persisting the integer. Treat any node id as valid only for the single action immediately following the snapshot it came from. Before each click, re-snapshot or re-resolve. Better, switch the contract from id to selector: capture a role plus accessible name (or a structural path) and re-find the element at action time with a short wait so transient re-renders settle. If you are on Terminator this is already the default; if you are building your own, the StepTimeline above is the pattern to copy.",
  },
];

const relatedPosts: RelatedPost[] = [
  {
    title: "Desktop automation on the accessibility tree",
    href: "/t/desktop-automation-accessibility-tree",
    tag: "Guide",
    excerpt:
      "How driving native apps through the accessibility tree differs from pixel and OCR approaches, and what the tree gives you that a screenshot cannot.",
  },
  {
    title: "Computer-use agent state tracking",
    href: "/t/computer-use-agent-state-tracking",
    tag: "Guide",
    excerpt:
      "Why agents lose track of what is on screen between turns, and how to keep the model's view of the UI in sync with reality.",
  },
  {
    title: "The seven-mode click_element router",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Deep dive",
    excerpt:
      "When the accessibility tree is silent, Terminator falls through to OCR, vision, and DOM grounding under one click tool.",
  },
];

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
            }),
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
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <div className="pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="max-w-4xl mx-auto px-6 pt-8 pb-2">
        <p className="font-mono text-xs uppercase tracking-widest text-orange-600 mb-4">
          Accessibility tree / debugging
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
          &quot;node with id 1 not found in a11y tree&quot;
        </h1>
        <p className="mt-5 text-lg text-zinc-600 leading-relaxed">
          This is one of the most confusing errors in accessibility-tree
          automation, because it points at the symptom and hides the cause. The
          node is almost never missing. The <em>id</em> is stale. Here is the
          full lifecycle of why it fires, why AI agents hit it far more than
          browser scripts do, and the two design choices that make it disappear.
        </p>
        <div className="mt-6">
          <ArticleMeta
            author="Matthew Diakonov"
            authorRole="Written with AI"
            datePublished={PUBLISHED}
            readingTime="9 min read"
          />
        </div>
      </header>

      {/* Direct answer */}
      <section className="max-w-4xl mx-auto px-6 mt-6">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 sm:p-7">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-700">
            Direct answer (verified 2026-06-22)
          </p>
          <p className="mt-3 text-zinc-800 leading-relaxed">
            <strong className="text-zinc-900">
              It means an automation tool tried to act on an accessibility-tree
              node by a numeric id that came from an earlier snapshot, and the
              tree has since been rebuilt, so that id no longer maps to any live
              node.
            </strong>{" "}
            It is a stale reference, not a vanished button. The tree gets rebuilt
            whenever the page re-renders, you navigate, a dialog opens or closes,
            or the accessibility mode changes and the whole tree is re-sent from
            the root. The integer the model was holding (id 1, id 14, id 42) is
            now dangling. The fix is to stop carrying the id across a tree change
            and re-resolve the element by something structural (a role plus a
            name, or a selector) at the moment you act on it.
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Most commonly emitted by computer-use and browser-driving agents that
            flatten the tree into a numbered list for the model. See{" "}
            <a
              href="https://github.com/browser-use/browser-use"
              className="text-orange-600 underline underline-offset-2"
              rel="noopener"
            >
              browser-use
            </a>{" "}
            for the canonical indexed-tree pattern this error grows out of.
          </p>
        </div>
      </section>

      {/* Two contexts */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          There are two different errors wearing the same words
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          When you search this message you get a wall of advice about
          <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            display:contents
          </code>
          , CSS list roles, and{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            waitUntil: networkidle0
          </code>
          . That advice answers a real but narrow case, and it does nothing for
          the case most people are actually hitting in 2026.
        </p>

        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="font-semibold text-zinc-900">
              Case A: the node never entered the tree
            </h3>
            <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
              A browser tool asks for the accessibility node of an element that
              the engine excluded from the tree. An element with
              <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-xs text-zinc-800">
                display:contents
              </code>
              has no box, so it can be dropped. A styled list can lose its list
              role. The lookup fails because the node genuinely is not there.
              This is the case the common write-ups solve: settle the page, check
              the element is exposed, do not rely on a role that CSS stripped.
            </p>
          </div>
          <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-6">
            <h3 className="font-semibold text-zinc-900">
              Case B: the node entered, then the tree changed
            </h3>
            <p className="mt-3 text-sm text-zinc-700 leading-relaxed">
              An agent serialized the tree, got back a numbered list, and the
              model chose id 1. By the time the click runs, the app re-rendered
              and the tree was rebuilt. id 1 now points at nothing. The element
              is probably still on screen under a new id. No CSS change fixes
              this, because nothing is wrong with the markup. The bug is that a
              throwaway number was treated as a durable handle.
            </p>
          </div>
        </div>
        <p className="mt-6 text-zinc-700 leading-relaxed">
          The rest of this page is about Case B, because that is the one that
          turns a working automation run into a flaky one, and the one almost no
          existing guide addresses.
        </p>
      </section>

      {/* Lifecycle sequence */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          The lifecycle of a stale id
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The gap that breaks everything is the gap between two events: the
          moment the tree is serialized, and the moment the action runs. Anything
          that rebuilds the tree inside that gap invalidates every id the model
          is holding.
        </p>
        <SequenceDiagram
          title="How id 1 goes from valid to not found"
          actors={["Agent", "A11y tree", "Live UI"]}
          messages={[
            { from: 0, to: 1, label: "serialize tree -> numbered list", type: "request" },
            { from: 1, to: 0, label: 'id 1 = "Save" button', type: "response" },
            { from: 2, to: 1, label: "form re-renders, tree rebuilt", type: "event" },
            { from: 0, to: 1, label: "act on node id 1", type: "request" },
            { from: 1, to: 0, label: "node with id 1 not found in a11y tree", type: "error" },
          ]}
        />
        <p className="mt-2 text-sm text-zinc-500">
          Note where the failure lands: not at the click, but at the lookup that
          tries to turn id 1 back into a live node. The number was only ever a
          label on the first snapshot.
        </p>
      </section>

      {/* Two approaches code */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Frozen integer vs re-resolved selector
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The difference between an automation stack that throws this error and
          one that does not is what the model is allowed to hold onto between
          turns. Hold an integer and you are betting the tree never changes. Hold
          a selector and the tree can change all it wants.
        </p>
        <div className="mt-7 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-100 px-4 py-2 font-mono text-xs text-zinc-600">
              fragile: action references a frozen id
            </div>
            <pre className="bg-white p-4 text-[13px] leading-relaxed text-zinc-800 overflow-x-auto">
              <code>{`# snapshot once, number the nodes
tree = page.a11y_snapshot()
# model picks node id 1 from the list
node_id = 1

# ... form re-renders here ...

# this dereferences a number that no
# longer exists in the rebuilt tree
page.click_node(node_id)
# -> node with id 1 not found in a11y tree`}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-orange-200 overflow-hidden">
            <div className="bg-orange-50 px-4 py-2 font-mono text-xs text-orange-700">
              durable: action re-resolves a selector
            </div>
            <pre className="bg-white p-4 text-[13px] leading-relaxed text-zinc-800 overflow-x-auto">
              <code>{`// Terminator: the handle is a selector,
// re-resolved against the live tree
let save = desktop.locator("role:Button|name:Save");

// ... form re-renders here ...

// wait() polls the live tree on a 100ms
// loop until Save exists, then clicks
save.wait(Some(Duration::from_secs(5)))
    .await?
    .click()?;`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Numeric id vs structural selector, line by line
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The two columns below are the same automation task viewed through two
          contracts. One treats a node id as a durable handle. The other treats
          it as a label that expires at the end of the turn.
        </p>
        <div className="mt-6">
          <ComparisonTable
            productName="Terminator selector"
            competitorName="Frozen node id"
            rows={comparisonRows}
          />
        </div>
      </section>

      {/* Anchor fact: the source */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Why Terminator does not have an id to lose
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          You can verify both halves of this in the source. The first half is in{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            crates/terminator/src/tree_formatter.rs
          </code>
          . When Terminator flattens a window into a numbered tree for a model,
          the index it hands out is not a bare integer with a private lookup
          table. Each index maps to a tuple that already contains the structural
          selector that produced it:
        </p>
        <pre className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 text-[13px] leading-relaxed text-zinc-800 overflow-x-auto">
          <code>{`// crates/terminator/src/tree_formatter.rs
/// Mapping of index to (role, name, bounds, selector) for click targeting
/// Key is 1-based index, value is (role, name, (x, y, width, height), selector)
pub index_to_bounds:
    HashMap<u32, (String, String, (f64, f64, f64, f64), Option<String>)>,`}</code>
        </pre>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          That fourth field, the{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            Option&lt;String&gt;
          </code>{" "}
          selector, is the whole trick. When the model says &quot;click index
          7&quot;, Terminator looks up entry 7, pulls out the selector stored
          alongside it, and resolves <em>that</em> against the current tree. The
          number lived for exactly one round-trip. It is never carried across a
          re-render, so it never goes stale.
        </p>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          The second half is in{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            crates/terminator/src/locator.rs
          </code>
          . A Locator does not dereference a cached handle; it re-runs the lookup
          on a poll loop until the element is in the state you asked for or the
          timeout elapses:
        </p>
        <pre className="mt-5 rounded-xl border border-zinc-200 bg-white p-4 text-[13px] leading-relaxed text-zinc-800 overflow-x-auto">
          <code>{`// crates/terminator/src/locator.rs (wait_for)
let start_time = std::time::Instant::now();
let poll_interval = Duration::from_millis(100);

loop {
    if start_time.elapsed() > effective_timeout {
        return Err(AutomationError::Timeout(/* ... */));
    }
    // re-validate against the LIVE tree every 100ms
    match self.validate(Some(poll_interval)).await {
        Ok(Some(element)) => { /* check condition, act */ }
        _ => { /* keep polling */ }
    }
}`}</code>
        </pre>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          A tree that rebuilt one millisecond ago is simply the tree the next
          poll iteration reads. There is no frozen id sitting in a variable
          waiting to be dereferenced, so there is no &quot;not found in a11y
          tree&quot; throw to catch. If the element genuinely never appears, you
          get a typed{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-sm text-zinc-800">
            AutomationError::Timeout
          </code>{" "}
          you can branch on, which is a very different thing from a dangling
          pointer.
        </p>
      </section>

      {/* Fix steps */}
      <section className="max-w-4xl mx-auto px-6 mt-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          How to kill this error in your own automation
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          If you are not on Terminator, you can still adopt the same contract.
          The principle is one sentence: never let a node id outlive the snapshot
          it came from.
        </p>
        <StepTimeline
          title="The pattern, in order"
          steps={[
            {
              title: "Treat every node id as single-use",
              description:
                "An id from a snapshot is valid for exactly the one action that immediately follows. Do not store it on an object, in a plan, or across a loop iteration. If your code reads a node id from a variable that was set more than one action ago, that is the bug.",
            },
            {
              title: "Re-snapshot or re-resolve before each action",
              description:
                "Before every click or type, get a fresh view of the tree, or re-find the element by a description that survives a re-render. The cost of a re-snapshot is almost always less than the cost of a flaky retry storm.",
            },
            {
              title: "Switch the handle from id to selector",
              description:
                "Capture a role plus accessible name (role:Button|name:Save) or a structural path instead of an integer. A selector describes what the element is, so it re-binds to the live node even after the tree was rebuilt. An id only describes where it sat in one snapshot.",
            },
            {
              title: "Add a bounded wait, not a fixed sleep",
              description:
                "Re-find with a short timeout that polls until the element is present and enabled, then acts. This absorbs the transient re-renders that cause the stale id in the first place, without the dead time of a hardcoded sleep. Terminator's wait() does exactly this on a 100ms loop.",
            },
            {
              title: "Branch on a typed timeout, not a thrown id lookup",
              description:
                "When the element truly is not coming, you want a clean timeout you can handle (retry, fall back to vision, escalate), not an exception about a missing tree node. Design the failure to be a decision point, not a crash.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Fighting stale a11y-tree references in your agent?"
          description="If your computer-use agent keeps losing nodes between snapshot and action, we have spent a lot of time on this exact failure. Bring your stack and we will look at it together."
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
          Frequently asked
        </h2>
        <FaqSection items={faqs} />
      </section>

      <section className="max-w-4xl mx-auto px-6 mt-16 mb-20">
        <RelatedPostsGrid
          title="Keep reading"
          subtitle="More on driving native apps through the accessibility tree"
          posts={relatedPosts}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Stale node ids killing your automation? Let's debug it."
      />
    </article>
  );
}
