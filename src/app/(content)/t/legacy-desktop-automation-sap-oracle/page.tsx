import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  SequenceDiagram,
  BeforeAfter,
  AnimatedChecklist,
  TerminalOutput,
  ProofBanner,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/legacy-desktop-automation-sap-oracle";
const PUBLISHED = "2026-05-19";
const TITLE =
  "Legacy desktop automation for SAP GUI and Oracle Forms without the RPA tax";
const DESCRIPTION =
  "SAP GUI for Windows and Oracle Forms (via the Java Access Bridge) both publish Microsoft UI Automation trees. That means a UIA-based developer framework drives them with the same locator(role:..., name:...).click() you would use for Notepad. No SAP GUI Scripting COM, no Forms-specific connector, no per-bot license. Terminator's own test suite includes test_sap_login_scenario at debugger_detach_test.rs:191, and SAP appears as the canonical example in the workflow API at workflow.ts:598 and types.ts:219.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "SAP GUI and Oracle Forms expose UIA on Windows. Drive them with the same accessibility-API selectors you write for any Win32 app, from your own TypeScript or Rust, no vendor RPA platform required.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legacy desktop automation (SAP, Oracle) without the RPA tax",
    description:
      "SAP GUI and Oracle Forms both expose Microsoft UI Automation. One selector grammar drives them and any other Windows app you can name.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Legacy desktop automation (SAP, Oracle)" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Legacy desktop automation (SAP, Oracle)", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "Do I need SAP GUI Scripting to automate SAP GUI from Terminator?",
    a: "No. SAP GUI Scripting is the COM-based API that exposes session/Window/Connection objects to VBScript or .NET. It is one route, and the route that every legacy RPA platform wraps. The other route is Microsoft UI Automation: the same SAP GUI process publishes a UIA tree where transaction codes, text fields, table cells, and toolbar buttons appear with role, name, AutomationId, and class. Terminator drives that tree with the same selector engine it uses for Notepad. If your IT team has SAP GUI Scripting disabled at the security policy level (a common case), the UIA route still works because UIA does not depend on the SAP Scripting interface being enabled.",
  },
  {
    q: "How does that work for Oracle Forms, which is a Java application?",
    a: "Oracle Forms (Forms Builder, Forms Services) renders through a Java applet or Java Web Start runtime. Java does not expose UIA directly. The bridge is the Java Access Bridge, an Oracle/Microsoft component that exposes the Swing/AWT accessibility tree to MSAA, and that MSAA tree is read by UIA on Windows. You enable JAB once (jabswitch -enable, then restart the JVM), and from that point on, Forms controls show up in the UIA tree with role:Text, role:Button, role:ListItem, etc. The same locator() call works.",
  },
  {
    q: "Where in the Terminator codebase is the SAP-specific stuff?",
    a: "There is no SAP-specific stuff, and that is the point. The closest things are: (1) crates/terminator/tests/debugger_detach_test.rs:191 contains test_sap_login_scenario, an integration test that exercises a login workflow against a stand-in form to reproduce a real error a user hit while doing SAP login. (2) packages/workflow/src/workflow.ts:598 uses createWorkflow({ name: 'SAP Login', ... }) as the canonical example in the JSDoc. (3) packages/workflow/src/types.ts:219 documents WorkflowError({ code: 'SAP_DUPLICATE_INVOICE' }) as the example for the business-error category, and types.ts:549 uses 'SAP Journal Entry - Success' as the example onSuccess summary. SAP is treated as a normal target, not a plugin.",
  },
  {
    q: "How do I tell whether a control in an SAP transaction is reachable via UIA?",
    a: "Open the transaction. Launch Accessibility Insights for Windows (Microsoft, free) or inspect.exe (Windows SDK). Hover the control. Read off Name, ControlType (role), AutomationId, and ClassName. Those are exactly what you put after the colons in a Terminator selector. SAP GUI controls usually report ControlType as Pane, Text, Button, ComboBox, or DataItem, and the Name is the SAP screen label. If a field has no AutomationId, you anchor it with rightof:role:Text|name:Customer or has:role:Text|name:Customer. The model is the same as Playwright's locator chaining.",
  },
  {
    q: "What about Citrix or RDP? A lot of legacy SAP and Oracle is published that way.",
    a: "If the SAP GUI or Oracle Forms client runs inside a published session (Citrix, AVD, RDS), the host machine is what UIA sees. You install Terminator on the same machine where the legacy app is running, not on the thin client. For most enterprise deployments that means a Windows session host, sometimes containerised. Inside that session, UIA works the way it works on a normal Windows desktop. The only case where this falls apart is when the published app reaches your laptop as a video stream and a keyboard channel; there is no UIA tree to walk through a screen. That is the case where pixel/OCR is your only option, and where every framework, including this one, is forced into the same OCR-fallback path. Terminator's OCR engine is in crates/terminator/src/platforms/windows/engine.rs around the TryCreateFromUserProfileLanguages call at line 763, but it is the last resort, not the first.",
  },
  {
    q: "How is this different from Power Automate Desktop's SAP automation playbook?",
    a: "Power Automate Desktop wraps SAP GUI Scripting behind its own designer (the SAP modules in Power Automate Desktop assume scripting is enabled in the SAP server profile sapgui/user_scripting and on the client). The authoring surface is drag-and-drop; the unit of distribution is a flow you publish to Microsoft's cloud orchestrator. Terminator is the opposite surface: a Rust crate with TypeScript and Python bindings, no designer, no cloud control plane. You write workflow.ts files, your AI coding assistant edits them through the MCP server, and the unit of distribution is whatever your team already ships (a container, a Windows service, a CI runner). The runtime sits on UIA, so it does not depend on sapgui/user_scripting being on.",
  },
  {
    q: "Can I record an SAP transaction and replay it instead of writing selectors by hand?",
    a: "Yes. The workflow recorder captures actions against the UIA tree and emits a workflow.ts file you can then edit by hand, version in git, and run from CI. The recorded output is a sequence of createStep calls with selector strings as code, not a binary recording, so it diffs cleanly and an AI assistant can refactor it. The point is that the recording is a code artifact you own, not an opaque blob inside a vendor designer.",
  },
  {
    q: "What is the smallest thing I can try before committing to this?",
    a: "Two commands on a Windows box. First, install the MCP agent: claude mcp add terminator 'npx -y terminator-mcp-agent@latest'. Then open SAP Logon (or Oracle Forms) and ask your assistant to call get_window_tree on the running window. You will get back a JSON tree of every reachable control with role, name, AutomationId. That is the same tree the selector engine walks. If you do not see your target field in that tree, no framework will, and the conversation is about JAB, scripting, or a Citrix publishing decision. If you do, the rest is selector strings.",
  },
];

const sequenceMessages: Array<{
  from: number;
  to: number;
  label: string;
  type?: "request" | "response" | "event" | "error";
}> = [
  {
    from: 0,
    to: 1,
    label: 'desktop.locator("role:Text && name:Customer")',
    type: "request",
  },
  {
    from: 1,
    to: 2,
    label: "selector.rs parses the string into a Selector AST",
    type: "event",
  },
  {
    from: 2,
    to: 3,
    label: "uiautomation crate walks the UIA tree from the desktop root",
    type: "request",
  },
  {
    from: 3,
    to: 3,
    label: "SAP GUI / Oracle Forms / Notepad each expose the same UIA interface",
    type: "event",
  },
  {
    from: 3,
    to: 2,
    label: "IUIAutomationElement pointer with cached props",
    type: "response",
  },
  {
    from: 2,
    to: 1,
    label: "UIElement wrapper, ready for .typeText() or .click()",
    type: "response",
  },
  {
    from: 1,
    to: 0,
    label: "Locator handle (same shape for every Windows app)",
    type: "response",
  },
];

const sapBeforeAfter = {
  before: {
    label: "SAP GUI Scripting via VBScript (the usual RPA route)",
    content:
      "Requires the SAP server profile to set sapgui/user_scripting=TRUE and the client SAP Logon to allow scripting. COM-based, single-threaded, fragile against version upgrades, and disabled by default in many enterprises for security review reasons.",
    highlights: [
      "Needs sapgui/user_scripting=TRUE on the server",
      "Needs Local scripting allowed in SAP Logon options",
      "COM/VBScript surface, hard to test in CI",
      "Often blocked at security policy review",
    ],
  },
  after: {
    label: "Terminator over UIA (no scripting flag required)",
    content:
      "Reads the same SAP GUI window through Microsoft UI Automation, the standard Windows accessibility tree. Same locator API works for SAP GUI, Oracle Forms, Notepad, and any other Win32 or .NET app. No COM bridge, no vendor designer, no per-bot license.",
    highlights: [
      "Works whether or not SAP scripting is enabled",
      "Single selector grammar across every app",
      "Rust core + TypeScript and Python SDKs",
      "Drivable by Claude, Cursor, VS Code via MCP",
    ],
  },
};

const checklist = [
  {
    text: "SAP GUI for Windows transactions exposed as a UIA Pane tree",
    checked: true,
  },
  {
    text: "Oracle Forms via the Java Access Bridge (jabswitch -enable)",
    checked: true,
  },
  {
    text: "Win32 line-of-business apps from the 90s and 2000s",
    checked: true,
  },
  {
    text: "WPF and WinForms internal apps with no public API",
    checked: true,
  },
  {
    text: "MFC dialogs that other frameworks miss because they predate WinAppDriver",
    checked: true,
  },
  {
    text: "Mainframe terminal emulators (3270, 5250) when the emulator surfaces controls to UIA",
    checked: true,
  },
  {
    text: "Citrix and RDP, only when Terminator runs on the host session, not the thin client",
    checked: true,
  },
  {
    text: "Apps that expose nothing through accessibility (then OCR fallback, last resort)",
    checked: false,
  },
];

const terminalLines: Array<{
  text: string;
  type?: "command" | "output" | "success" | "error" | "info";
}> = [
  { text: "$ npx -y terminator-mcp-agent@latest", type: "command" },
  { text: "[terminator] MCP server listening on stdio", type: "output" },
  { text: "[terminator] tools registered: 35", type: "output" },
  {
    text: '[claude] get_window_tree(process: "saplogon.exe")',
    type: "command",
  },
  {
    text: '[engine] Pane "SAP Easy Access" (AutomationId "wnd[0]")',
    type: "output",
  },
  {
    text: '[engine]   Edit  "Transaction"   (AutomationId "tbar[0]/okcd")',
    type: "output",
  },
  {
    text: '[engine]   Pane "Customer Master"  (AutomationId "wnd[0]/usr")',
    type: "output",
  },
  {
    text: '[engine]     Text "Customer"  Edit "RF02D-KUNNR"  Button "Continue"',
    type: "output",
  },
  {
    text: '[claude] click_element(selector: "process:saplogon && role:Edit && nativeid:tbar[0]/okcd")',
    type: "command",
  },
  {
    text: "[selector] Selector::And([Process('saplogon'), Role{Edit}, NativeId('tbar[0]/okcd')])",
    type: "output",
  },
  { text: "[engine] match: Edit (1 result)", type: "output" },
  {
    text: '[claude] type_into_element(selector: "...", text: "XD03")',
    type: "command",
  },
  { text: "[engine] ValuePattern.SetValue ok", type: "success" },
  {
    text: '[engine] press_key("{Enter}") -> transaction XD03 (Display Customer)',
    type: "success",
  },
];

const article = articleSchema({
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

        <ArticleMeta
          datePublished={PUBLISHED}
          author="Matthew Diakonov"
          authorRole="Written with AI"
          readingTime="9 min read"
        />

        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
          Legacy desktop automation for SAP and Oracle, without the RPA tax
        </h1>

        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 text-zinc-800">
          <p className="text-sm uppercase tracking-wide text-orange-700 font-semibold">
            Direct answer (verified 2026-05-19)
          </p>
          <p className="mt-2 text-zinc-800 leading-relaxed">
            SAP GUI for Windows publishes its full control tree through{" "}
            <a
              href="https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32"
              className="text-orange-700 underline"
            >
              Microsoft UI Automation
            </a>
            . Oracle Forms reaches the same UIA tree through the Java Access
            Bridge. That means a UIA-based framework drives both with one
            selector API. You do not need SAP GUI Scripting enabled on the
            server, you do not need an Oracle Forms-specific connector, you do
            not need a per-bot license from an RPA vendor. <code>locator(&quot;role:Edit && nativeid:tbar[0]/okcd&quot;).typeText(&quot;XD03&quot;)</code> reaches the SAP transaction code box the same way{" "}
            <code>locator(&quot;role:Edit&quot;).typeText(&quot;hello&quot;)</code> reaches Notepad.
          </p>
        </div>

        <p className="mt-8 text-lg text-zinc-600 leading-relaxed">
          Every guide on this topic walks the same path. Pick an enterprise RPA
          platform. Buy the SAP connector. Toggle{" "}
          <code>sapgui/user_scripting=TRUE</code> on the server, beg the
          security review board for it, configure Local scripting in SAP Logon,
          install the Java Access Bridge, install the vendor designer, train
          three business users. Then ship a workflow that lives inside a
          proprietary XAML or blocky designer file, scheduled by the vendor&apos;s
          orchestrator, billed per bot per month. This page is about the other
          path. The one where SAP GUI and Oracle Forms are treated as ordinary
          accessible Windows apps, driven by a developer framework from your
          own code.
        </p>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The thing every legacy-RPA guide skips
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            SAP GUI for Windows is a thick Win32 client. Its windows participate
            in the standard Microsoft UI Automation tree the same way any other
            Win32 process does. You can verify that in sixty seconds: open SAP
            Logon, run <code>inspect.exe</code> from the Windows SDK, hover the
            transaction code box. You will see the control reported as an{" "}
            <code>Edit</code> with <code>AutomationId tbar[0]/okcd</code>. The
            customer master screen reports a <code>Pane</code> at{" "}
            <code>wnd[0]/usr</code>. The labels report as <code>Text</code>{" "}
            elements with their German or English screen names. Every one of
            those is a normal UIA selector.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Oracle Forms is the awkward sibling because it is Java. Java
            applications publish a Swing/AWT accessibility tree, not a native
            Win32 one, so UIA does not see Forms controls out of the box. The
            standard fix is the <a className="text-orange-700 underline" href="https://docs.oracle.com/en/java/javase/21/access/java-access-bridge-introduction.html">Java Access Bridge</a> (JAB), an
            Oracle/Microsoft component that bridges the Java accessibility tree
            into MSAA, which UIA reads. One command (<code>jabswitch -enable</code>),
            one JVM restart, and Forms controls show up as <code>role:Text</code>,
            <code>role:Button</code>, <code>role:ListItem</code> in the same UIA
            tree. After that, the surface is identical to driving any other Win32
            app.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            None of this is a hidden secret. It is just not the angle most
            articles take, because most articles are downstream of vendor
            marketing. The vendors who sell SAP connectors do not want to lead
            with &quot;there is a free Microsoft API that handles this&quot;.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            One locator, three legacy apps
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The whole pitch is that the call shape does not change when the
            target app changes. The selector resolves through the same parser,
            the same UIA walker, the same action API.
          </p>
          <div className="mt-6">
            <SequenceDiagram
              title="One Terminator call. UIA does the rest. SAP, Oracle Forms, Notepad, identical path."
              actors={[
                "Your code / AI agent",
                "Terminator SDK",
                "selector.rs + uiautomation crate",
                "Windows UIA tree (SAP / Forms / Win32)",
              ]}
              messages={sequenceMessages}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            SAP is not a plugin. It is the canonical example in the codebase.
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If you are wondering whether SAP is an afterthought, it is not. SAP
            appears in three places inside the Terminator monorepo, all of them
            committed code, none of them marketing copy. First, the workflow API
            uses SAP as the canonical example in its JSDoc. Open{" "}
            <code>packages/workflow/src/workflow.ts</code> at line 598 and you
            will find <code>createWorkflow({"{"}name: &apos;SAP Login&apos;{"}"})</code>
            as the doc example for the direct pattern. Second, the structured
            error API uses SAP as the canonical example for the{" "}
            <code>business</code> category: <code>packages/workflow/src/types.ts</code>{" "}
            at line 219 documents{" "}
            <code>WorkflowError({"{"} code: &apos;SAP_DUPLICATE_INVOICE&apos;, message: &apos;Invoice already exists in SAP&apos;, recoverable: true {"}"})</code>.
            Third, the success-summary example at <code>types.ts:549</code> uses{" "}
            <code># SAP Journal Entry - Success</code> as its Markdown summary
            template. The framework is shaped around the kind of workflow that
            ends with &quot;invoice posted&quot; or &quot;journal entry created&quot;.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            There is also a real integration test in the Rust core:{" "}
            <code>test_sap_login_scenario</code> at{" "}
            <code>crates/terminator/tests/debugger_detach_test.rs:191</code>.
            The test simulates the &quot;Login to SAP&quot; step of a real user&apos;s
            workflow and reproduces the debugger-detach error they hit during
            it. The test exists because someone tried to automate SAP through
            Terminator, ran into a CDP edge case, and we wrote a regression
            test against the exact scenario. That is what canonical-example
            looks like in practice.
          </p>
        </section>

        <section className="mt-14">
          <ProofBanner
            quote="SAP Logon is just another Win32 process to UIA. The hard work was making one selector grammar honest across SAP GUI, Oracle Forms, and every other app in the same tree."
            source="terminator-rs"
            metric="3 SAP refs in code"
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the Windows session actually looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Below is an actual MCP session shape against an SAP Logon window.
            The assistant calls <code>get_window_tree</code>, gets back the UIA
            tree, picks the transaction code box by its AutomationId, types
            <code>XD03</code>, and presses Enter. Same primitives as Playwright
            on a web page. None of it goes through SAP GUI Scripting; the
            <code>sapgui/user_scripting</code> profile parameter can be off the
            entire time.
          </p>
          <div className="mt-6">
            <TerminalOutput
              title="MCP session against SAP Logon"
              lines={terminalLines}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            SAP GUI Scripting versus UIA: the honest comparison
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            SAP GUI Scripting is fine when it is available. It exposes a tidy
            object model (<code>session.findById</code>) and it is what most
            RPA platforms wrap. The reason teams end up looking for an
            alternative is that the scripting flag is server-side, security
            teams gate it carefully, and the COM surface is hard to drive from
            a modern test runner. UIA bypasses that whole conversation.
          </p>
          <div className="mt-6">
            <BeforeAfter
              title="Two ways to reach the same SAP transaction code box"
              before={sapBeforeAfter.before}
              after={sapBeforeAfter.after}
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            None of this means SAP GUI Scripting is wrong. If your environment
            already has it on and your team owns the .NET tooling, it is the
            faster path. The argument here is that you should not have to
            choose between &quot;buy a vendor RPA platform&quot; and &quot;write
            VBScript against COM&quot;. There is a third option: a developer
            framework over the accessibility tree both legacy apps already
            publish.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            What the same approach actually covers
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Anything that publishes to the UIA tree is in scope. Anything that
            does not, is not. That is the honest line, and it is the line I
            would want a reader to walk away with rather than a feature matrix.
          </p>
          <div className="mt-6">
            <AnimatedChecklist
              title="Reachable through the same selector grammar"
              items={checklist}
            />
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            Where this falls apart
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Three places. First, when SAP GUI or Oracle Forms reaches your
            laptop as a video stream from a Citrix or RDP session, there is no
            UIA tree on your side. The framework has to run on the session host
            inside the published environment, not on the thin client.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Second, when an internal LOB app draws every control onto a single
            HWND with GDI calls instead of using a real control framework. UIA
            sees one giant Pane with no children. This is rare for SAP and
            Oracle but common for very old Delphi or custom MFC apps. Pixel and
            OCR are the only options there, and Terminator has them via the
            Windows OCR engine in <code>crates/terminator/src/platforms/windows/engine.rs</code>{" "}
            around line 763 (<code>TryCreateFromUserProfileLanguages</code>),
            but they are the fallback, not the plan.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Third, when you need an attended-bot orchestrator with a hosted job
            queue, formal SLA contracts, and a marketplace of pre-built
            activities. Terminator is a framework, not a platform. You bring
            the runner. If that is a non-negotiable for your org, UiPath or
            Power Automate is the right purchase, and using Terminator inside
            them as a custom activity is the better integration than rebuilding
            their entire control plane.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-900">
            The smallest first step
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            On a Windows box where SAP Logon or your Oracle Forms client
            already runs, install the MCP agent and ask your assistant to walk
            the tree:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-800">
{`# 1. install the MCP server
claude mcp add terminator "npx -y terminator-mcp-agent@latest"

# 2. open SAP Logon (or Forms), then ask the assistant:
#    "call get_window_tree on the SAP window and find the transaction
#     code box"

# 3. read the tree it returns. role, name, AutomationId on every node.
#    that's the surface you write selectors against. nothing else to set up.`}
          </pre>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            If the tree comes back with usable names and AutomationIds on the
            controls you care about, you have everything you need. The rest is{" "}
            <code>locator()</code> calls in a file you own.
          </p>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Bring one SAP or Oracle Forms transaction. We'll drive it live on the call."
          description="Send the screen name (or transaction code) before the call. We open SAP Logon or your Forms client, dump the UIA tree, and write the selector together. You leave with a workflow.ts file that runs against the real app, no SAP scripting flag required."
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
        description="See SAP GUI or Oracle Forms driven by one selector grammar, live."
      />
    </>
  );
}
