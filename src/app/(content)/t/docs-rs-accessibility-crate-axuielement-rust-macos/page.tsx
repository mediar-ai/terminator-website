import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  StepTimeline,
  AnimatedChecklist,
  BookCallCTA,
  RelatedPostsGrid,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://t8r.tech/t/docs-rs-accessibility-crate-axuielement-rust-macos";
const PUBLISHED = "2026-06-22";
const TITLE =
  "AXUIElement in Rust on macOS: which docs.rs crate you actually want";
const DESCRIPTION =
  "There is no single 'accessibility crate' for AXUIElement on macOS. docs.rs hosts at least five: accessibility (v0.2.0, the safe wrapper), accessibility-sys (v0.2.0, raw FFI), axuielement (v0.9.1, newer), objc2-application-services (v0.3.2), and macos-accessibility-client (v0.0.2). Here is which layer to start at, with download counts verified 2026-06-22 and field notes from Terminator's macOS code.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Five docs.rs crates expose AXUIElement to Rust on macOS at three different layers. A map of which one to import, and why most people want `accessibility` over raw `accessibility-sys`.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXUIElement in Rust on macOS: the docs.rs crate map",
    description:
      "accessibility vs accessibility-sys vs axuielement vs objc2-application-services. Layers, downloads, and the one most automation tools actually ship.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "AXUIElement in Rust on macOS" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "AXUIElement in Rust on macOS", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Which Rust crate do I import for AXUIElement on macOS?",
    a: "For most code you want `accessibility` (v0.2.0 on docs.rs), the safe high-level wrapper. It re-exports the AXUIElement struct, AXAttribute, the action and attribute modules, plus a TreeWalker and ElementFinder. It pulls in `accessibility-sys` (v0.2.0), the raw C FFI bindings, as a dependency. You only import `accessibility-sys` directly when you need a function the safe layer does not re-expose, like a specific AXValue conversion or a raw AXUIElementSetAttributeValue call. If you want an actively-maintained alternative with a richer API surface, look at `axuielement` (v0.9.1, released 2026-06-06).",
  },
  {
    q: "What is the difference between `accessibility` and `accessibility-sys`?",
    a: "`accessibility-sys` is the -sys crate: raw `unsafe extern \"C\"` declarations that match Apple's ApplicationServices headers one to one. It gives you AXUIElementCreateApplication(pid: pid_t) -> AXUIElementRef, AXUIElementCreateSystemWide(), AXUIElementCopyAttributeValue(...), the kAXErrorXXX codes, and the kAX...Attribute string constants, nothing more. `accessibility` is the safe layer on top: it wraps AXUIElementRef in an owned AXUIElement type that handles Core Foundation retain and release, turns AXError integers into a Rust `Error` enum, and adds traversal helpers. Both are published from the same repository (github.com/eiz/accessibility) under MIT/Apache-2.0.",
  },
  {
    q: "Why does the `accessibility` crate show 0% documented on docs.rs?",
    a: "Because the crate ships almost no doc comments, so docs.rs renders the type and function signatures but no prose. That is the single biggest reason people land on a search engine looking for it: the docs.rs page tells you AXUIElement::system_wide() exists and returns Self, but not that constructing it is infallible while reading any attribute off it requires accessibility permission, or that its default TreeWalker does not descend into application windows. The signatures are accurate; the behavior lives in the source and in tools that have shipped against it.",
  },
  {
    q: "Is `accessibility-sys` still maintained in 2026?",
    a: "It is stable rather than abandoned. v0.2.0 was published 2025-03-22 and is roughly 562 lines across the crate. Apple's AXUIElement C API has not changed in years, so the bindings do not need frequent updates; the -sys crate tracks a stable system framework. It carries 108,041 total downloads (verified on crates.io 2026-06-22), which is more than the safe `accessibility` wrapper above it, because other crates depend on the raw layer directly.",
  },
  {
    q: "What about objc2-application-services? Should I use that instead?",
    a: "objc2-application-services (v0.3.2, part of madsmtm's objc2 project) exposes the ApplicationServices framework, and AXUIElement is available behind a cargo feature. It is the right choice if your project is already built on the objc2 ecosystem and you want one consistent binding generator across every Apple framework you touch. If you are not already in objc2 land, the eiz `accessibility` crate is a smaller, more focused dependency that does only AX. Both reach the same underlying C functions.",
  },
  {
    q: "Do I need accessibility permission to call these crates?",
    a: "Yes, for reading. Creating an AXUIElement (system_wide, application(pid)) does not prompt or fail, but the first AXUIElementCopyAttributeValue call from an untrusted process returns kAXErrorAPIDisabled and you get empty trees. The calling process must be granted Accessibility in System Settings > Privacy & Security > Accessibility. The thin `macos-accessibility-client` crate (v0.0.2) exists specifically to wrap the trust-check and prompt side of this (AXIsProcessTrusted / the prompt option dictionary), separate from the element-driving crates.",
  },
  {
    q: "Does Terminator use the `accessibility` crate?",
    a: "Terminator is a Playwright-style desktop automation framework whose shipping platform today is Windows via UI Automation. Its macOS layer was built on the eiz `accessibility` crate's AXUIElement, and that worked example is what this guide draws from: a windows-aware TreeWalker, a CFEqual/CFHash cycle guard for the system-wide tree, and a manual `unsafe impl Send + Sync` wrapper so AXUIElement could cross threads in an async runtime. The macOS implementation was removed from the repo on 2025-12-16, so the code is historical, but the crate-selection lessons stand.",
  },
  {
    q: "Can I drive Windows apps with these crates too?",
    a: "No. AXUIElement and every crate on this page are macOS-only; they bind Apple's Accessibility C API and will not compile or link on Windows. On Windows the equivalent layer is UI Automation (UIA), a completely different API with its own element model. A cross-platform tool keeps two adapters behind one selector interface. That portability gap, AX on macOS versus UIA on Windows, is exactly what a framework like Terminator absorbs for you.",
  },
];

const crateRows = [
  {
    name: "accessibility",
    version: "0.2.0",
    downloads: "45,705",
    layer: "Safe wrapper",
    use: "Default. Owned AXUIElement, Error enum, TreeWalker, ElementFinder.",
    docs: "https://docs.rs/accessibility",
  },
  {
    name: "accessibility-sys",
    version: "0.2.0",
    downloads: "108,041",
    layer: "Raw FFI (-sys)",
    use: "Direct C bindings. Import when the safe layer omits a function.",
    docs: "https://docs.rs/accessibility-sys",
  },
  {
    name: "axuielement",
    version: "0.9.1",
    downloads: "301",
    layer: "Safe wrapper (newer)",
    use: "Actively maintained alternative, richer surface, macOS only.",
    docs: "https://docs.rs/axuielement",
  },
  {
    name: "objc2-application-services",
    version: "0.3.2",
    downloads: "objc2 family",
    layer: "Framework bindings",
    use: "AXUIElement behind a feature. Pick if already on objc2.",
    docs: "https://docs.rs/objc2-application-services",
  },
  {
    name: "macos-accessibility-client",
    version: "0.0.2",
    downloads: "372,309",
    layer: "Permission helper",
    use: "Wraps the trust check / prompt, not element driving.",
    docs: "https://docs.rs/macos-accessibility-client",
  },
];

function CodeCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
      {title ? (
        <figcaption className="border-b border-zinc-200 bg-white px-4 py-2 font-mono text-xs text-zinc-500">
          {title}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed text-zinc-800">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

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

      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-14">
        <Breadcrumbs items={breadcrumbItems} />

        <header className="mt-6">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-600">
            macOS / Rust / Accessibility
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-900 sm:text-4xl">
            AXUIElement in Rust on macOS: which docs.rs crate you actually want
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-gray-600">
            If you searched docs.rs for an &ldquo;accessibility crate&rdquo; to
            reach AXUIElement and came back confused, that is the correct
            reaction. There is no single crate. There is a small stack of them
            at three different layers, and picking the wrong layer is how people
            end up writing raw FFI they did not need.
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

        {/* DIRECT ANSWER */}
        <section className="mt-10 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-orange-700">
            Direct answer &middot; verified 2026-06-22
          </p>
          <p className="mt-3 text-[17px] leading-relaxed text-zinc-900">
            The crate most people mean by &ldquo;the accessibility crate on
            docs.rs&rdquo; is{" "}
            <a
              href="https://docs.rs/accessibility"
              className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2"
            >
              <code>accessibility</code> v0.2.0
            </a>{" "}
            , a safe wrapper over the raw FFI crate{" "}
            <a
              href="https://docs.rs/accessibility-sys"
              className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2"
            >
              <code>accessibility-sys</code> v0.2.0
            </a>
            . Import <code>accessibility</code> for normal code, drop to{" "}
            <code>accessibility-sys</code> only for functions the safe layer
            does not re-export. A newer, actively-maintained option is{" "}
            <a
              href="https://docs.rs/axuielement"
              className="font-semibold text-orange-700 underline decoration-orange-300 underline-offset-2"
            >
              <code>axuielement</code> v0.9.1
            </a>{" "}
            (released 2026-06-06). All are macOS-only and checked against
            crates.io on 2026-06-22.
          </p>
          <CodeCard title="Cargo.toml">{`[dependencies]
accessibility = "0.2"        # safe wrapper: AXUIElement, AXAttribute, TreeWalker
accessibility-sys = "0.2"    # raw FFI, only if you need a lower-level call`}</CodeCard>
        </section>

        {/* THE MAP */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            The five crates, and the layer each one lives at
          </h2>
          <p className="mt-3 text-zinc-700">
            Searching docs.rs for AXUIElement surfaces results that look
            interchangeable but are not. Two are safe wrappers, one is the raw
            FFI underneath them, one is a feature inside a giant framework-bindings
            project, and one only handles permissions. Versions and download
            totals below were pulled from the crates.io API on 2026-06-22.
          </p>

          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-50 text-left text-zinc-500">
                  <th className="px-4 py-3 font-medium">Crate</th>
                  <th className="px-4 py-3 font-medium">Ver</th>
                  <th className="px-4 py-3 font-medium">Downloads</th>
                  <th className="px-4 py-3 font-medium">Layer</th>
                  <th className="px-4 py-3 font-medium">When to reach for it</th>
                </tr>
              </thead>
              <tbody>
                {crateRows.map((r) => (
                  <tr
                    key={r.name}
                    className="border-t border-zinc-200 align-top"
                  >
                    <td className="px-4 py-3">
                      <a
                        href={r.docs}
                        className="font-mono text-[13px] font-semibold text-orange-600 underline decoration-orange-200 underline-offset-2"
                      >
                        {r.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-zinc-700">
                      {r.version}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-zinc-700">
                      {r.downloads}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{r.layer}</td>
                    <td className="px-4 py-3 text-zinc-600">{r.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Note the inversion: <code>accessibility-sys</code> (108,041) has more
            downloads than the safe <code>accessibility</code> wrapper (45,705)
            because crates that build their own abstractions pull the raw FFI
            directly. A high download count here signals &ldquo;widely depended
            on,&rdquo; not &ldquo;the one you should import.&rdquo;
          </p>
        </section>

        {/* WHY TWO LAYERS */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Why the safe crate wraps the -sys crate
          </h2>
          <p className="mt-3 text-zinc-700">
            Apple ships AXUIElement as a C API inside the ApplicationServices
            framework. The Rust convention for a C API is two crates: a{" "}
            <code>-sys</code> crate that is a mechanical translation of the
            headers, and a safe crate that wraps it in ownership-aware types.
            That is exactly the split here, both published from
            github.com/eiz/accessibility under MIT/Apache-2.0.
          </p>
          <p className="mt-3 text-zinc-700">
            The raw entry point you will see in <code>accessibility-sys</code> is
            a one-to-one mirror of Apple&rsquo;s header:
          </p>
          <CodeCard title="accessibility-sys (raw FFI)">{`// straight from the ApplicationServices header
pub unsafe extern "C" fn AXUIElementCreateApplication(
    pid: pid_t,
) -> AXUIElementRef;

pub unsafe extern "C" fn AXUIElementCopyAttributeValue(
    element: AXUIElementRef,
    attribute: CFStringRef,
    value: *mut CFTypeRef,
) -> AXError;`}</CodeCard>
          <p className="mt-1 text-zinc-700">
            Every call is <code>unsafe</code>, every return is a raw pointer or
            an integer error code, and you are responsible for Core Foundation
            retain and release. The safe <code>accessibility</code> crate exists
            so you do not write that:
          </p>
          <CodeCard title="accessibility (safe wrapper)">{`use accessibility::{AXUIElement, AXAttribute};

// owned element, no manual retain/release
let app = AXUIElement::application(pid);

// AXError integers become a Rust Result
let title = app.attribute(&AXAttribute::title())?;`}</CodeCard>
          <p className="mt-1 text-zinc-700">
            Same underlying C functions, but the safe layer gives you an owned{" "}
            <code>AXUIElement</code> that drops correctly and an <code>Error</code>{" "}
            enum instead of stray <code>-25204</code> integers. The cost is a
            wrapper that ships almost no doc comments, which is why the docs.rs
            page reads like a list of signatures with no explanation.
          </p>
        </section>

        {/* HOW TO START */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            From <code>cargo add</code> to a live element in four steps
          </h2>
          <p className="mt-3 text-zinc-700">
            The minimum path to reading a real attribute off a running app,
            assuming you went with the safe crate.
          </p>
          <div className="mt-6">
            <StepTimeline
              steps={[
                {
                  title: "Add the crate",
                  description:
                    "cargo add accessibility. It will pull accessibility-sys, core-foundation, cocoa, objc, and thiserror as transitive dependencies. You do not list those yourself.",
                },
                {
                  title: "Grant Accessibility permission",
                  description:
                    "Add your binary (or your terminal, while developing) to System Settings > Privacy & Security > Accessibility. Without it, the constructors still succeed but the first attribute read returns kAXErrorAPIDisabled and every tree comes back empty.",
                },
                {
                  title: "Get an element by PID",
                  description:
                    "AXUIElement::application(pid) scopes you to one process and is the fast path. AXUIElement::system_wide() is the broad entry point when you need the focused app or the menu bar across app boundaries.",
                },
                {
                  title: "Read attributes, then walk children",
                  description:
                    "Read AXRole / AXTitle with element.attribute(&AXAttribute::role()). To descend, remember that an application element exposes windows via AXWindows and AXMainWindow, not as ordinary AXChildren, so windows() and main_window() come before children().",
                },
              ]}
            />
          </div>
        </section>

        {/* DECISION */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Which crate, given what you are building
          </h2>
          <div className="mt-6">
            <AnimatedChecklist
              title="Pick by project shape"
              items={[
                {
                  text: "Driving a few apps, want the smallest focused dependency: accessibility (safe) + accessibility-sys (transitive). Most automation code lands here.",
                },
                {
                  text: "Already building on the objc2 ecosystem and want one binding generator for every Apple framework: objc2-application-services with the AXUIElement feature.",
                },
                {
                  text: "Want an actively-maintained safe crate with a broader API and recent releases: axuielement v0.9.1.",
                },
                {
                  text: "You only need to check or prompt for the trust grant, not drive elements: macos-accessibility-client.",
                },
                {
                  text: "You hit a C function the safe layer never re-exported (a specific AXValue conversion, AXUIElementSetAttributeValue): drop to accessibility-sys for that one call and stay in the safe crate everywhere else.",
                },
              ]}
            />
          </div>
        </section>

        {/* FIELD NOTES */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Field notes from shipping against the <code>accessibility</code> crate
          </h2>
          <p className="mt-3 text-zinc-700">
            Terminator is a Playwright-shaped desktop automation framework. Its
            shipping platform today is Windows via UI Automation, but its macOS
            layer was built directly on the eiz <code>accessibility</code> crate
            before that implementation was removed from the repo on 2025-12-16.
            Three things the docs.rs page will not tell you, learned the hard
            way:
          </p>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="font-mono text-sm font-semibold text-zinc-900">
                AXUIElement is not Hash or Eq
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                The macOS AX graph has cycles (a child points back at its
                parent), so a naive walk loops forever. You cannot drop
                AXUIElement into a HashSet to deduplicate visited nodes, because
                it implements neither trait. The fix is a wrapper that hashes and
                compares through Core Foundation&rsquo;s CFHash and CFEqual on the
                underlying CFTypeRef.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="font-mono text-sm font-semibold text-zinc-900">
                The default TreeWalker skips windows
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                The crate&rsquo;s TreeWalker descends through AXChildren. An
                application element does not list its windows as children, so a
                walk from the app root hits an immediate dead end. You read
                AXWindows and AXMainWindow explicitly, then walk children inside
                each window.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <h3 className="font-mono text-sm font-semibold text-zinc-900">
                Send + Sync is on you
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                To use AXUIElement from an async runtime, Terminator wrapped it
                in a type with a manual <code>unsafe impl Send + Sync</code>,
                relying on the underlying Core Foundation objects managing their
                own thread safety. That is a deliberate, documented unsafe
                decision, not something the crate hands you.
              </p>
            </div>
          </div>
        </section>

        {/* CROSS-PLATFORM REALITY */}
        <section className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="text-xl font-semibold text-zinc-900">
            One more thing the crate cannot do
          </h2>
          <p className="mt-3 text-zinc-700">
            Every crate here is macOS-only. The moment you need the same
            automation to run on Windows, AXUIElement gives you nothing; Windows
            uses UI Automation, a different API with a different element model.
            If you are building something that has to drive both, you are signing
            up to maintain two adapters behind one interface. That portability
            gap is the whole reason Terminator exists: a Playwright-style API
            over the OS, with the AX-versus-UIA difference absorbed under the
            selector layer so your script does not care which one is underneath.
          </p>
        </section>

        <div className="mt-12">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Building cross-platform desktop automation and hitting the AX-versus-UIA wall?"
            description="Talk through whether to wrap the accessibility crate yourself or build on a framework that already absorbed both sides."
          />
        </div>

        <section className="mt-12">
          <FaqSection
            heading="AXUIElement on macOS in Rust: common questions"
            items={faqs}
          />
        </section>

        <section className="mt-12">
          <RelatedPostsGrid
            title="Keep reading"
            posts={[
              {
                title:
                  "accessibility crate: AXUIElement::system_wide(), and what the docs leave out",
                excerpt:
                  "The system-wide root constructor, the three AXUIElement constructors, and the two traversal traps docs.rs never mentions.",
                tag: "macOS",
                href: "/t/docs-rs-accessibility-crate-axuielement-system-wide",
              },
              {
                title:
                  "macOS accessibility UI tree automation: the write path nobody warns you about",
                excerpt:
                  "AXPress and AXClick return success and do nothing on browser views. The 3-tier click fallback a real AX engine ships.",
                tag: "macOS",
                href: "/t/macos-accessibility-ui-tree",
              },
              {
                title: "AXObserver in the eiz accessibility crate",
                excerpt:
                  "Subscribing to AX notifications, run loop sources, and the lifecycle gotchas around observer callbacks.",
                tag: "macOS",
                href: "/t/axobserver-eiz-accessibility",
              },
            ]}
          />
        </section>
      </div>

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Driving native apps beyond the browser? Let's compare notes on AX, UIA, and what holds up in production."
      />
    </article>
  );
}
