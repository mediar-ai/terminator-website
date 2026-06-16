import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  FlowDiagram,
  ComparisonTable,
  StepTimeline,
  CodeComparison,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/node-with-id-a11y-tree-browser-automation";
const PUBLISHED = "2026-06-16";
const TITLE =
  "Node with an id in the a11y tree: how browser automation does it, and how to do it for every app";
const DESCRIPTION =
  "Browser automation gives every accessibility-tree node a stable id (an AXNodeId in Chrome DevTools Protocol, a ref in a Playwright snapshot) so you can act on it without coordinates. Terminator brings the same model to native desktop apps: each node's id is a 6-character string derived from a BLAKE3 hash of its AutomationId, role, name, and class. Here is where the id comes from, how it is computed in crates/terminator/src/platforms/windows/utils.rs, and how an LLM acts on a node by its index.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Every a11y-tree node carries an id you can target without pixels. Here is how the browser does it and how Terminator does it for the whole OS.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Node with an id in the a11y tree, for every app",
    description:
      "Chrome DevTools gives a11y nodes an AXNodeId. Terminator hashes AutomationId + role + name + class into a 6-char id for native desktop nodes.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t/accessibility-api-desktop-automation" },
  { label: "Node with an id in the a11y tree" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  {
    name: "Accessibility API for desktop automation",
    url: "https://t8r.tech/t/accessibility-api-desktop-automation",
  },
  { name: "Node with an id in the a11y tree", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What does \"a node with an id in the a11y tree\" actually mean?",
    a: "The a11y tree (accessibility tree) is the structured view of an interface that the OS or browser already publishes for screen readers. Every element in it is a node: a button, a text field, a list item, a group. A node with an id is just that node plus a stable handle you can store and reuse, so automation can say \"click node 184293\" instead of \"click at pixel 612, 388\". In the browser this handle is the Chrome DevTools Protocol AXNodeId, or the ref that appears in a Playwright or MCP accessibility snapshot. In Terminator it is a 6-character string returned by the element's id() method.",
  },
  {
    q: "Where does the AXNodeId come from in browser automation?",
    a: "Chrome builds an accessibility tree alongside the DOM. The Chrome DevTools Protocol exposes it through the Accessibility domain: getFullAXTree and getPartialAXTree return AXNode objects, each with a nodeId, and getChildAXNodes walks the tree by id. Tools like Playwright, browser-use, and the various MCP accessibility bridges sit on top of this, hand the model a flattened snapshot where each interactive node has a short ref, and then translate \"act on ref e7\" back into a real node. The id is the contract between the model that decides and the engine that clicks.",
  },
  {
    q: "How does Terminator compute a node's id for a native desktop app?",
    a: "On Windows it calls generate_element_id() in crates/terminator/src/platforms/windows/utils.rs. It concatenates the element's stable properties in order (the UIA AutomationId, then the control type, then the name, then the class name), hashes that string with BLAKE3, and takes the first 8 bytes as a u64. The public id() method then returns the first 6 characters of that number's decimal form. Because the input is content, not position, the same logical element produces the same id across runs as long as those properties are unchanged.",
  },
  {
    q: "What happens to the id if a node has no stable properties?",
    a: "generate_element_id() degrades on purpose. If the AutomationId, control type, name, and class are all empty, it falls back to hashing the element's bounding rectangle (left, top, width, height). If even the bounds are unavailable, it uses the object's memory address as a last resort, which is unique within a session but not stable across sessions. So a well-labelled element gets a content-derived id you can hard-code; an anonymous one still gets a usable id, just a less durable one. The fallback chain lives at lines 62 to 81 of that file.",
  },
  {
    q: "How is this different from just using coordinates or a screenshot?",
    a: "Coordinates break the moment a window moves, a DPI scale changes, or a layout reflows. A screenshot-plus-vision approach has to re-locate the element every single step and pays model latency for it. A node id is resolved against the live tree, so the engine re-finds the element structurally each time and the id stays meaningful even when the pixels move. That is the whole reason browser automation moved to accessibility refs, and it is the same reason desktop automation should.",
  },
  {
    q: "What is the difference between the id, the index, and a selector in Terminator?",
    a: "Three different handles for three different jobs. The id (from id()) is a content hash, good for logging and for the id: selector. The index is the short numeric handle (#1, #2, or u1, d1 when sources are mixed) that the MCP server prints next to each clickable node so an LLM can say \"click u4\" in one token. A selector (role:Button, name:Save, nativeid:submitBtn, or the # shortcut) is a structural query that re-resolves to a live node every time you run it. You target by selector in code; the model targets by index in a snapshot; the id ties a node back to its source.",
  },
  {
    q: "Does Terminator expose the raw UIA AutomationId too?",
    a: "Yes. The hashed id() is for stability across the tree, but if you already know the app's real automation id you can match it directly with the nativeid: selector, which maps to the Windows UIA AutomationId. So nativeid:saveButton targets the element the app developer explicitly named, while id:1a2b3c targets a node by Terminator's computed hash. Both end up resolving against the same accessibility tree.",
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
              dateModified: PUBLISHED,
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

      <div className="max-w-3xl mx-auto px-6 pt-10">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-6">
        <p className="text-sm font-mono uppercase tracking-widest text-orange-600 mb-4">
          Accessibility tree internals
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 leading-tight">
          A node with an id in the a11y tree
        </h1>
        <p className="mt-5 text-lg text-zinc-500 leading-relaxed">
          Browser automation taught everyone the same trick: stop clicking
          pixels, give every accessibility node a stable handle, and act on the
          handle. That handle is the &quot;node with an id&quot; you keep seeing
          in a11y-tree snapshots. The interesting part is that the trick is not
          specific to the browser. Below is where the id comes from, and how
          Terminator hands the same kind of id to an automation agent for every
          app on the desktop, not just the tab.
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
      <section className="max-w-3xl mx-auto px-6 mt-10">
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-orange-700 mb-2">
            Direct answer &middot; verified 2026-06-16
          </p>
          <p className="text-zinc-800 leading-relaxed">
            A node with an id in an accessibility tree is an element plus a
            stable handle so you can target it without pixel coordinates. In the
            browser that handle is the{" "}
            <span className="font-semibold text-zinc-900">AXNodeId</span> exposed
            by the Chrome DevTools Protocol Accessibility domain (or the{" "}
            <span className="font-semibold text-zinc-900">ref</span> in a
            Playwright snapshot). Terminator brings the same model to native
            desktop apps: each node&apos;s id is a{" "}
            <span className="font-semibold text-zinc-900">6-character string</span>{" "}
            derived from a BLAKE3 hash of the element&apos;s UIA AutomationId,
            role, name, and class, computed in{" "}
            <code className="text-sm bg-white border border-orange-200 rounded px-1.5 py-0.5 text-orange-700">
              crates/terminator/src/platforms/windows/utils.rs
            </code>
            .
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Browser-side source of truth:{" "}
            <a
              href="https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/"
              className="text-orange-600 underline underline-offset-2"
            >
              Chrome DevTools Protocol, Accessibility domain
            </a>
            .
          </p>
        </div>
      </section>

      {/* Section 1: where the pattern comes from */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Where the &quot;node with an id&quot; pattern comes from
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Chrome builds an accessibility tree next to the DOM, the same one a
          screen reader consumes. The Chrome DevTools Protocol exposes it
          through the Accessibility domain: <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">getFullAXTree</code> and{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">getPartialAXTree</code> return{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">AXNode</code> objects, each carrying a{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">nodeId</code>, and{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">getChildAXNodes</code> walks the
          tree by that id. Every higher-level tool inherits this: Playwright,
          browser-use, and the various MCP accessibility bridges all hand a model
          a flattened snapshot where each interactive node has a short ref, then
          translate &quot;act on ref e7&quot; back into a real node.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          The id is the contract. The part that decides what to do (a person, a
          test script, an LLM) names a node by its id. The part that does it
          re-finds that node in the live tree and clicks it. Neither side has to
          agree on where the node is on screen, only on which node it is. That
          decoupling is what made accessibility-tree automation more reliable
          than coordinate clicking, and it is the entire reason this question
          keeps coming up.
        </p>
      </section>

      {/* Section 2: the browser stops at the tab */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          The browser&apos;s a11y tree stops at the edge of the tab
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Here is the catch nobody mentions when they explain AXNodeId. The
          Chrome accessibility tree only contains the web page. The moment your
          workflow touches a native dialog, the file picker, a desktop app, or
          the OS chrome around the tab, the browser&apos;s tree ends and your
          node ids end with it. You are back to coordinates and screenshots for
          the part of the job that lives outside the page.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Windows and macOS publish accessibility trees too, for the exact same
          reason browsers do: screen readers need them. On Windows that tree is
          UI Automation (UIA); on macOS it is AX. Every native window, button,
          and field is already a node in it. The question is whether your
          automation engine surfaces those nodes with stable ids the way the
          browser does. Terminator does, with an API deliberately shaped like
          the browser one so the mental model carries over unchanged.
        </p>

        <div className="mt-8">
          <ComparisonTable
            heading="Same pattern, different scope"
            intro="The id model is identical. What changes is how far the tree reaches."
            productName="Terminator (OS a11y tree)"
            competitorName="Browser a11y tree (CDP)"
            rows={[
              {
                feature: "What is in the tree",
                competitor: "The current web page only",
                ours: "Every native window and the page inside it",
              },
              {
                feature: "Node handle",
                competitor: "AXNodeId / snapshot ref",
                ours: "6-char id() plus a short index in snapshots",
              },
              {
                feature: "How the id is derived",
                competitor: "Assigned by the engine per session",
                ours: "BLAKE3 hash of AutomationId + role + name + class",
              },
              {
                feature: "Target by app-defined id",
                competitor: "Not exposed",
                ours: "nativeid: maps to the raw UIA AutomationId",
              },
              {
                feature: "Where it breaks",
                competitor: "Native dialogs, file pickers, other apps",
                ours: "Resolves against whichever app is in focus",
              },
            ]}
            caveat="If your automation never leaves the browser tab, the browser's own a11y tree is the right tool. Terminator is for when the workflow crosses into native apps."
          />
        </div>
      </section>

      {/* Section 3: anchor fact, the id computation */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          How Terminator computes a node&apos;s id
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          This is the part you cannot read anywhere else, so here is the actual
          mechanism rather than a hand-wave. On Windows the id comes from{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">generate_element_id()</code> in{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">crates/terminator/src/platforms/windows/utils.rs</code>{" "}
          (the function starts at line 23). It does not assign a random handle.
          It builds an id <em>from the content of the node</em>, so the same
          logical element produces the same id on the next run.
        </p>

        <div className="mt-8">
          <FlowDiagram
            title="generate_element_id(): the fallback chain"
            steps={[
              {
                label: "Collect stable properties",
                detail:
                  "Read UIA AutomationId, control type (role), name, and class name. Empty values are dropped, and a Custom control type is treated as absent.",
              },
              {
                label: "Concatenate, then BLAKE3 hash",
                detail:
                  "Join the present properties into one string and hash it with BLAKE3. Take the first 8 bytes as a u64. id() returns the first 6 characters of that number's decimal form.",
              },
              {
                label: "Fallback: bounding rectangle",
                detail:
                  "If every stable property was empty, hash the element's left, top, width, and height instead. Less durable, still deterministic for a fixed layout.",
              },
              {
                label: "Last resort: memory address",
                detail:
                  "If even the bounds are missing, use the object's pointer. Unique within the session, not stable across sessions. This is the floor, not the norm.",
              },
            ]}
          />
        </div>

        <p className="mt-8 text-zinc-700 leading-relaxed">
          The ordering matters. Because AutomationId comes first, a node the app
          developer explicitly named gets an id dominated by that name, which is
          the most stable input available. A node with only a role and a label
          still gets a content id; an anonymous, unbounded node still gets
          <em> something</em> usable. The id never throws, it just degrades, and
          you can read the degradation level off how the node was hashed.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-zinc-200 bg-white text-xs font-mono text-zinc-500">
            crates/terminator/src/platforms/windows/utils.rs
          </div>
          <pre className="p-4 text-sm overflow-x-auto text-zinc-800 font-mono leading-relaxed">
            <code>{`// stable inputs, in order
let mut to_hash = String::new();
if let Some(id) = automation_id { to_hash.push_str(&id); }
if let Some(role) = role        { to_hash.push_str(&role.to_string()); }
if let Some(n) = name           { to_hash.push_str(&n); }
if let Some(cn) = class_name    { to_hash.push_str(&cn); }

// fallbacks if no stable properties existed
if to_hash.is_empty() { /* hash the bounding rectangle */ }
if to_hash.is_empty() { /* last resort: object pointer  */ }

let hash = blake3::hash(to_hash.as_bytes());
Ok(hash.as_bytes()[0..8]
    .try_into()
    .map(u64::from_le_bytes)
    .unwrap() as usize)`}</code>
          </pre>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          The public{" "}
          <code className="text-xs bg-zinc-100 rounded px-1.5 py-0.5">id()</code>{" "}
          method then runs{" "}
          <code className="text-xs bg-zinc-100 rounded px-1.5 py-0.5">
            object_id().to_string().chars().take(6).collect()
          </code>
          , so what you see on a node is the leading 6 characters of that hashed
          number.
        </p>
      </section>

      {/* Section 4: the indexed snapshot */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          What the model actually sees: indexed nodes, by source
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          A 6-character hash is great for logging and for the{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">id:</code>{" "}
          selector, but it is a clumsy thing to ask a language model to type back
          to you. So when Terminator&apos;s MCP server hands a tree to an agent,
          it prints a much shorter handle next to each node: a sequential index.
          Nodes that have on-screen bounds (the ones you can actually click) get
          a clickable index; nodes without bounds get a dash. The agent says
          &quot;click 4&quot;, and the server maps 4 back to the node and its
          bounds.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          When a window mixes sources, the index gets a one-letter prefix so the
          handle stays unambiguous. From{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">crates/terminator/src/tree_formatter.rs</code>,
          the{" "}
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">ElementSource</code>{" "}
          enum defines exactly five prefixes:
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ["u", "Uia", "the accessibility tree node"],
            ["d", "Dom", "a browser DOM element inside the window"],
            ["o", "Ocr", "text found by OCR"],
            ["p", "Omniparser", "an element from Omniparser vision"],
            ["g", "Gemini", "an element described by Gemini vision"],
          ].map(([prefix, name, desc]) => (
            <div
              key={prefix}
              className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3"
            >
              <span className="font-mono text-orange-600 font-bold text-lg leading-none mt-0.5">
                {prefix}1
              </span>
              <span className="text-sm text-zinc-700">
                <span className="font-semibold text-zinc-900">{name}</span>
                {": "}
                {desc}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-zinc-700 leading-relaxed">
          So a single &quot;node with an id&quot; can come from the accessibility
          tree (<code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">u</code>),
          from the page DOM inside a browser window (
          <code className="text-sm bg-zinc-100 rounded px-1.5 py-0.5">d</code>),
          or from a vision pass when an app exposes nothing structural at all.
          The agent treats them the same way, as an indexed handle to act on.
          That is the bridge: the browser&apos;s DOM nodes and the OS&apos;s
          accessibility nodes end up in one unified, indexed list.
        </p>

        <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-zinc-200 bg-white text-xs font-mono text-zinc-500">
            example clustered tree snapshot
          </div>
          <pre className="p-4 text-sm overflow-x-auto text-zinc-800 font-mono leading-relaxed">
            <code>{`u1 [Window] "Save As"            (bounds: [220,140,640,480])
  u2 [ComboBox] "File name"      (bounds: [330,360,360,28])
  u3 [Button] "Save"            (bounds: [700,420,90,30])
  -  [Text] "Encoding:"          (no bounds, not clickable)
d4 [link] "terms"                (bounds: [380,300,52,18])
o5 [ocr] "Read only"             (bounds: [340,398,70,16])`}</code>
          </pre>
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Clickable nodes get a prefixed index; the un-bounded text node gets a
          dash. The agent acts on <code className="text-xs bg-zinc-100 rounded px-1.5 py-0.5">u3</code>, not on a pixel.
        </p>
      </section>

      {/* Section 5: acting on a node by id in code */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Acting on a node by its id, in your own code
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Outside the agent loop, you target nodes with selectors, and the id is
          one of the things you can select on. The API is Playwright-shaped, so
          if you have written browser automation the muscle memory transfers.
          You build a locator, the engine resolves it against the live
          accessibility tree, and you act.
        </p>

        <div className="mt-8">
          <CodeComparison
            title="Browser ref vs OS node id, same shape"
            leftLabel="Browser a11y (Playwright)"
            rightLabel="OS a11y (Terminator, Python)"
            leftLines={6}
            rightLines={6}
            leftCode={`// page accessibility tree only
const snapshot =
  await page.accessibility.snapshot();
// act on a node from the snapshot
await page.getByRole("button",
  { name: "Save" }).click();`}
            rightCode={`import terminator
desktop = terminator.Desktop()

# resolves against the live OS tree
btn = desktop.locator("role:Button && name:Save")
# or target by id / native automation id
# desktop.locator("#1a2b3c")
# desktop.locator("nativeid:saveButton")`}
          />
        </div>

        <div className="mt-10">
          <StepTimeline
            title="How a node id resolves to a click"
            steps={[
              {
                title: "You name the node",
                description:
                  "Pass a selector: a role, a name, the # id shortcut, or nativeid: for the app's own automation id. This is the handle, not a position.",
              },
              {
                title: "The engine walks the live tree",
                description:
                  "Terminator queries the OS accessibility API (UIA on Windows) and finds the node matching your selector right now, in the window that is in focus.",
              },
              {
                title: "The id is recomputed and confirmed",
                description:
                  "generate_element_id() hashes the node's current properties, so the same logical element keeps the same id even if it moved on screen.",
              },
              {
                title: "The action fires on the node",
                description:
                  "Click, type, set value, or read. No coordinates were hard-coded, so a moved or rescaled window does not break the step.",
              },
            ]}
          />
        </div>
      </section>

      {/* Section 6: when not to use this */}
      <section className="max-w-3xl mx-auto px-6 mt-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          When the browser&apos;s own a11y tree is still the right answer
        </h2>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          If your entire workflow lives inside a single web page and never
          touches a native dialog, the browser&apos;s accessibility tree is
          already perfect for the job. Playwright&apos;s role locators and the
          Chrome DevTools AXNodeId give you stable node handles with zero extra
          dependencies, and you should use them. The honest tradeoff: Terminator
          adds value precisely when the workflow leaves the tab. Native file
          pickers, installer wizards, line-of-business desktop apps, the OS
          chrome around the browser, anything where the page&apos;s tree simply
          does not reach. That is the seam where a node id from the OS tree
          starts mattering and a browser ref runs out.
        </p>
        <p className="mt-4 text-zinc-700 leading-relaxed">
          Worth saying plainly: the deep id mechanism described here is the
          Windows UIA path, which is where Terminator&apos;s native-id support is
          most complete. If you are deciding between approaches, that is the
          context to weigh it in.
        </p>

        <div className="mt-10">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Mapping a workflow that keeps leaving the browser tab?"
            description="Tell us what app your automation has to reach into and we will tell you whether OS-level node ids are the right fix or overkill."
          />
        </div>
      </section>

      <FaqSection items={faqs} heading="Questions people actually ask" />

      <section className="max-w-5xl mx-auto px-6 mt-12 mb-20">
        <RelatedPostsGrid
          title="Keep reading"
          posts={[
            {
              title: "RPA accessibility tree selectors: the actual grammar",
              href: "/t/rpa-accessibility-tree-selectors",
              excerpt:
                "The full selector language that resolves a node id back to a live element, with operator precedence and source line numbers.",
              tag: "Selectors",
            },
            {
              title:
                "The accessibility API for computer-use agents",
              href: "/t/accessibility-api-computer-use-agents",
              excerpt:
                "Why agents that drive native apps through the a11y tree beat screenshot-and-click loops.",
              tag: "Agents",
            },
            {
              title:
                "Why accessibility APIs beat OCR and pixel matching",
              href: "/t/why-accessibility-apis-beat-ocr-and-pixel-matching",
              excerpt:
                "The latency and stability case for structural node lookups over vision.",
              tag: "Architecture",
            },
          ]}
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Stuck where browser refs end? Let's look at your native-app workflow."
      />
    </article>
  );
}
