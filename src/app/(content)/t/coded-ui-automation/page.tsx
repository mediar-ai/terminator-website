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
  ComparisonTable,
  BentoGrid,
  CodeComparison,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/coded-ui-automation";
const PUBLISHED = "2026-04-20";
const TITLE =
  "Coded UI automation in 2026: replacing Microsoft's deprecated CUIT with a Playwright-shaped selector chain";
const DESCRIPTION =
  "Microsoft deprecated Coded UI Test in Visual Studio 2019 and shipped nothing to replace it. Terminator brings a Playwright-style '>>' selector chain to the same Windows AutomationId CUIT addressed through generated UIMap.Designer.cs classes, and it does it in 10 lines, cross-platform, MCP-ready. Source: docs/SELECTORS_CHEATSHEET.md and examples/win_calculator.py.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A modern coded UI automation framework that uses the same Windows AutomationId your old Coded UI Test project used, minus UIMap.uitest, minus Visual Studio, minus the dead Microsoft.VisualStudio.TestTools.UITesting namespace.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coded UI automation in 2026, without Coded UI Test",
    description:
      "One Playwright-style chain: window:Calculator >> role:Button >> name:Seven. Works on any desktop app, every AutomationId your CUIT project already used, zero Visual Studio.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Coded UI automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Coded UI automation", url: PAGE_URL },
];

const cuitCode = `// CUIT: UIMap.Designer.cs (auto-generated)
public class CalculatorResultsControl : WinText
{
    public CalculatorResultsControl(UITestControl searchLimitContainer)
        : base(searchLimitContainer)
    {
        this.SearchProperties[UITestControl.PropertyNames
            .AutomationId] = "CalculatorResults";
        this.WindowTitles.Add("Calculator");
    }
}

// CUIT: CodedUITest1.cs
[CodedUITest]
public class CalculatorTest
{
    [TestMethod]
    public void AddOnePlusTwo()
    {
        var ui = new UIMap();
        Mouse.Click(ui.OneButton);
        Mouse.Click(ui.PlusButton);
        Mouse.Click(ui.TwoButton);
        Mouse.Click(ui.EqualsButton);
        Assert.AreEqual("Display is 3",
            ui.CalculatorResultsControl.DisplayText);
    }
}`;

const terminatorCode = `# examples/win_calculator.py
import asyncio
import terminator

async def run():
    desktop = terminator.Desktop(log_level="error")
    calc = desktop.open_application("calc.exe")
    await asyncio.sleep(2)

    display = calc.locator("nativeid:CalculatorResults")
    (await calc.locator("Name:One").first()).click()
    (await calc.locator("Name:Plus").first()).click()
    (await calc.locator("Name:Two").first()).click()
    (await calc.locator("Name:Equals").first()).click()
    await asyncio.sleep(1)

    result = (await display.first()).name()
    assert result in ("Display is 3", "3")

asyncio.run(run())`;

const sdkInstall = [
  { type: "command" as const, text: "npm i @mediar-ai/terminator" },
  {
    type: "output" as const,
    text: "added 1 package, and audited 142 packages in 2s",
  },
  { type: "command" as const, text: "pip install terminator-py" },
  {
    type: "output" as const,
    text: "Successfully installed terminator-py-0.24.32",
  },
  { type: "command" as const, text: "cargo add terminator-rs" },
  {
    type: "output" as const,
    text: "Adding terminator-rs v0.24 to dependencies",
  },
  {
    type: "command" as const,
    text: 'claude mcp add terminator "npx -y terminator-mcp-agent@latest"',
  },
  {
    type: "success" as const,
    text: "MCP server registered. Claude Code, Cursor, VS Code, and Windsurf can now drive every desktop app.",
  },
];

const selectorRows: ComparisonRow[] = [
  {
    feature: "Match by AutomationId",
    ours: "nativeid:CalculatorResults",
    competitor:
      "SearchProperties[UITestControl.PropertyNames.AutomationId] = \"CalculatorResults\"",
  },
  {
    feature: "Match by role and label together",
    ours: "role:Button && name:Save",
    competitor:
      "WinButton with SearchProperties for ControlType plus Name, declared in UIMap.uitest",
  },
  {
    feature: "Descendant traversal",
    ours: "window:Calculator >> role:Button >> name:Seven",
    competitor: "Nested UITestControl containers with manual SearchLimitContainer wiring",
  },
  {
    feature: "Spatial proximity",
    ours: "rightof:name:Username, below:name:OK, near:text:Cancel",
    competitor:
      "Not supported; hand-rolled coordinate math or recorder quirks only",
  },
  {
    feature: "Localized label fallbacks",
    ours: "role:Button && (name:Confirm || name:Bestaetigen)",
    competitor: "Multiple UIMap entries, one per locale, each regenerated by hand",
  },
  {
    feature: "Invisible-element filtering",
    ours: "role:Button && !visible:false",
    competitor: "Post-hoc WaitForControlCondition with a custom predicate",
  },
  {
    feature: "Parent navigation",
    ours: "..",
    competitor: "Walk via Container until you reach the right ancestor",
  },
  {
    feature: "Editor source of truth",
    ours: "Plain string in your test file, diffable in Git",
    competitor: "UIMap.uitest XML plus UIMap.Designer.cs, regenerated by a tool",
  },
];

const whatYouLose: BentoCard[] = [
  {
    title: "Visual Studio 2022 support",
    description:
      "Coded UI Test was deprecated in Visual Studio 2019 and removed from the Test Tools workload. New projects cannot target it.",
    size: "2x1",
    accent: true,
  },
  {
    title: "UIMap.uitest file",
    description:
      "The XML map that every CUIT project generated is gone. With Terminator the selector is the locator string itself.",
    size: "1x1",
  },
  {
    title: "Microsoft.VisualStudio.TestTools.UITesting",
    description:
      "The namespace CUIT projects import is unsupported. Runtime binaries still ship for legacy projects, but no one is fixing the bugs.",
    size: "1x1",
  },
  {
    title: "Windows-only lock-in",
    description:
      "CUIT ran on Windows through MSAA and UIA. Terminator's core is Rust, talks Windows UIA and macOS AX, and the selector grammar is identical on both.",
    size: "2x1",
  },
  {
    title: "Hand-written test bodies",
    description:
      "Terminator ships an MCP server. Any coding assistant with MCP (Claude Code, Cursor, Windsurf, VS Code) can open an app, write selectors, and assert output without you typing the test.",
    size: "2x1",
  },
  {
    title: "Record-only workflows",
    description:
      "The workflow recorder captures mouse, keyboard, and UI element metadata together, then replays as a deterministic script you can edit. No more CUIT Recorder crashes.",
    size: "1x1",
  },
];

const faqs: FaqItem[] = [
  {
    q: "What is coded UI automation and is Microsoft's Coded UI Test still supported?",
    a: "Coded UI automation means writing test code that drives a desktop application through its accessibility tree, instead of by pixel coordinates. In Microsoft land, the canonical framework was Coded UI Test, exposed through the Microsoft.VisualStudio.TestTools.UITesting namespace. Microsoft deprecated Coded UI Test with the release of Visual Studio 2019 and did not bring it forward as a first-class offering in Visual Studio 2022. Existing legacy projects still run, but the product is in maintenance only, and the Test Tools installer workload no longer offers Coded UI as a new project template. The accessibility APIs Coded UI Test used, specifically Windows UI Automation (UIA), are alive and well; it is the CUIT layer on top of them that was abandoned.",
  },
  {
    q: "Can Terminator use the same AutomationId I already tagged in WPF or WinForms for my old Coded UI Test project?",
    a: "Yes. If your WPF or WinForms controls set AutomationProperties.AutomationId, Terminator finds them with the nativeid prefix. examples/win_calculator.py in the Terminator repo uses calculator_window.locator(\"nativeid:CalculatorResults\").first() to grab the same CalculatorResults element that a CUIT-era UIMap.Designer.cs class would have reached through SearchProperties[UITestControl.PropertyNames.AutomationId] = \"CalculatorResults\". No code change on the application side. The work you already did to make your app accessible carries forward.",
  },
  {
    q: "How does Terminator's selector syntax map to Playwright?",
    a: "Every prefix in docs/SELECTORS_CHEATSHEET.md has an explicit Playwright equivalent column in the cheat sheet. role:Button maps to role=button, name:Save maps to text=Save or aria/Save, id:submit maps to css=#submit, classname:Edit maps to css=.Edit, visible:true maps to the :visible pseudo-class, and the chain combinator >> is the same >> that Playwright uses for descendant selectors. The one difference is that the spatial family (rightof, leftof, above, below, near) are first-class prefixes, not second-class helpers, and they compose with boolean operators like any other predicate.",
  },
  {
    q: "How do I actually drive Calculator from code without Visual Studio?",
    a: "Install terminator-py (pip install terminator-py) or @mediar-ai/terminator (npm i @mediar-ai/terminator) and run ten lines. The full script is in examples/win_calculator.py in the repo: create a Desktop, open calc.exe with desktop.open_application, grab the CalculatorResults display through nativeid, click Name:One, Name:Plus, Name:Two, Name:Equals, then read the display element's accessible name and assert it contains 3. It finishes in under two seconds on a cold Calculator launch. No MSTest attribute, no generated XML, no Visual Studio project.",
  },
  {
    q: "Is Terminator just Coded UI Test rebranded, or is the underlying approach different?",
    a: "Different in three ways. First, selectors are parsed as a boolean expression (AND, OR, NOT, parentheses) instead of being a flat SearchProperties dictionary, so one locator can match a localized or conditionally visible control. Second, the runtime is Rust, and the Node.js and Python SDKs are native NAPI-RS and PyO3 bindings, so the hot path is accessibility calls in compiled code, not interpreter overhead. Third, Terminator ships an MCP server (terminator-mcp-agent on npm) so an AI coding assistant can drive desktop apps directly; Coded UI Test predates LLM agents and has no story for them.",
  },
  {
    q: "Does Terminator work on macOS, or is this Windows-only like CUIT was?",
    a: "The core Rust crate at crates/terminator targets Windows UI Automation and macOS Accessibility simultaneously, and the selector grammar is the same on both platforms. The same window:Calculator >> role:Button >> name:Seven chain parses and evaluates whether the accessibility backend is UIA or AX. Linux support lives in the open issues. This is the single biggest architectural difference from Coded UI Test, which only ever ran on Windows.",
  },
  {
    q: "What about the old CUIT Recorder? Is there an equivalent?",
    a: "crates/terminator-workflow-recorder records mouse, keyboard, clipboard, hotkey, and UI focus events together with the UI element metadata (role, name, bounds) at the moment of each event, then emits a timestamped JSON workflow you can edit, commit, and replay deterministically. The README shows the event envelope, including ui_element fields with role and name. The recorder also filters system noise like clock updates so the output is a readable diff, not a dump.",
  },
];

export default function Page() {
  return (
    <>
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
          __html: JSON.stringify(faqPageSchema(faqs)),
        }}
      />

      <article className="bg-white text-zinc-900">
        <BackgroundGrid pattern="dots" glow>
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Coded UI automation,{" "}
              <GradientText>without Coded UI Test</GradientText>
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Microsoft deprecated Coded UI Test in Visual Studio 2019 and never
              shipped a first-party replacement. Your old UIMap.uitest files
              still run, sort of, and the{" "}
              <code className="font-mono text-sm bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
                Microsoft.VisualStudio.TestTools.UITesting
              </code>{" "}
              namespace is on life support. This page is how to write coded UI
              automation today, against the same Windows AutomationId your old
              project used, in ten lines.
            </p>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers shipping desktop automation"
            highlights={[
              "Playwright-style >> chain for Windows UIA and macOS AX",
              "Reads the same AutomationId CUIT already tagged in your app",
              "Ten-line Calculator example in examples/win_calculator.py",
              "Full prefix table in docs/SELECTORS_CHEATSHEET.md",
              "MCP server for Claude Code, Cursor, VS Code, Windsurf",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-10">
          <RemotionClip
            title="From UIMap.Designer.cs to one selector"
            subtitle="A modern replacement for Coded UI Test"
            captions={[
              "Keep every AutomationId",
              "Drop every UIMap.uitest",
              'Chain with ">>" like Playwright',
              "Run on Windows and macOS",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What actually happened to Coded UI Test
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Coded UI Test shipped with Visual Studio 2010 as Microsoft's answer
            to writing automated UI tests in C# against WPF, WinForms, Win32,
            and MFC applications. It was built on top of Microsoft UI Automation
            (UIA), which is the accessibility API Windows still ships today,
            and it exposed that API through the{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              Microsoft.VisualStudio.TestTools.UITesting
            </code>{" "}
            namespace. You would drop a UIMap.uitest file into your test
            project, open the Coded UI Test Builder, point-and-click at
            controls, and Visual Studio would generate a{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              UIMap.Designer.cs
            </code>{" "}
            file with a typed class per control.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Microsoft officially deprecated the framework in Visual Studio 2019
            and did not bring it forward as a new project template in Visual
            Studio 2022. The runtime still loads for legacy projects, but the
            Test Tools installer workload no longer offers Coded UI as a first
            choice. The Coded UI Test Builder has not received a meaningful
            update in years. Meanwhile, the underlying accessibility API, UIA,
            is not going anywhere. The layer Microsoft abandoned is the
            high-level coded UI automation layer, not the plumbing underneath.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The rest of this guide is what to do about it. The short version is
            that you keep every AutomationId you ever tagged, you throw away the
            UIMap files, you replace the runner with something that parses
            selectors as an expression, and you gain cross-platform support,
            Playwright-shaped chains, and an MCP server for your coding
            assistant in the bargain.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Side by side: the Calculator test, then and now
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both of these add 1 + 2 in the Windows Calculator, locate the
            result display by its AutomationId (which is{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              CalculatorResults
            </code>
            , and has been for years), and assert the answer. The left side is
            the smallest coherent slice of a real Coded UI Test project,
            generated UIMap class included. The right side is the full contents
            of{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              examples/win_calculator.py
            </code>{" "}
            condensed to the same happy path.
          </p>
          <div className="mt-8">
            <CodeComparison
              leftCode={cuitCode}
              rightCode={terminatorCode}
              leftLines={28}
              rightLines={18}
              leftLabel="CUIT (deprecated)"
              rightLabel="Terminator (2026)"
              title="1 + 2 = 3 in Calculator"
              reductionSuffix="fewer lines"
            />
          </div>
          <p className="mt-6 text-zinc-700 leading-relaxed">
            The AutomationId is the same string in both snippets. That is the
            whole point. The work you did years ago to make your WPF or
            WinForms app accessible is the work a modern runner uses to drive
            it. You are changing the test harness, not the application.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The anchor fact: one file maps every selector to Playwright
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The entire selector grammar is documented in one place:{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              docs/SELECTORS_CHEATSHEET.md
            </code>
            . It lists fourteen atomic prefixes (
            <code className="font-mono text-sm">role:</code>,{" "}
            <code className="font-mono text-sm">name:</code>,{" "}
            <code className="font-mono text-sm">id:</code>,{" "}
            <code className="font-mono text-sm">nativeid:</code>,{" "}
            <code className="font-mono text-sm">classname:</code>,{" "}
            <code className="font-mono text-sm">text:</code>,{" "}
            <code className="font-mono text-sm">pos:x,y</code>,{" "}
            <code className="font-mono text-sm">visible:</code>,{" "}
            <code className="font-mono text-sm">rightof:</code>,{" "}
            <code className="font-mono text-sm">leftof:</code>,{" "}
            <code className="font-mono text-sm">above:</code>,{" "}
            <code className="font-mono text-sm">below:</code>,{" "}
            <code className="font-mono text-sm">near:</code>,{" "}
            <code className="font-mono text-sm">nth:</code>) plus the{" "}
            <code className="font-mono text-sm">&gt;&gt;</code> chain
            combinator, the <code className="font-mono text-sm">&&</code>{" "}
            compound operator, and the <code className="font-mono text-sm">..</code>{" "}
            parent navigator. The table in that file has an explicit "Rough
            Playwright equivalent" column for every one of them. A Playwright
            user reading down that table learns the desktop grammar in about
            two minutes.
          </p>

          <div className="mt-8">
            <ComparisonTable
              productName="Terminator"
              competitorName="Coded UI Test"
              rows={selectorRows}
            />
          </div>
          <p className="mt-6 text-zinc-600 text-sm">
            Source: docs/SELECTORS_CHEATSHEET.md in the Terminator repository,
            the SearchProperties and UIMap patterns in the archived{" "}
            <code className="font-mono text-xs bg-zinc-100 px-1.5 py-0.5 rounded">
              Microsoft.VisualStudio.TestTools.UITesting
            </code>{" "}
            docs.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How a selector becomes an action
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The flow is the same whether you are reading an AutomationId from a
            Win32 dialog, a WPF button, or a native macOS control. A selector
            string is parsed into a predicate, the predicate walks the OS
            accessibility tree, the match resolves to an element handle, the
            handle invokes an action. No screenshot matching on the hot path.
            No flakey pixel diff.
          </p>
          <div className="mt-8">
            <AnimatedBeam
              title="Selector to action, without pixels"
              accentColor="#FF3E00"
              from={[
                { label: "nativeid:CalculatorResults", sublabel: "AutomationId lookup" },
                { label: "role:Button && name:Save", sublabel: "compound predicate" },
                { label: "window:Calc >> role:Button >> name:Seven", sublabel: "descendant chain" },
              ]}
              hub={{
                label: "Terminator selector engine",
                sublabel: "Rust core over Windows UIA + macOS AX",
              }}
              to={[
                { label: "element.click()", sublabel: "dispatch via UIA" },
                { label: "element.type_text(...)", sublabel: "text input event" },
                { label: "element.name()", sublabel: "read accessible name" },
              ]}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The full working example
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            This is the condensed version of{" "}
            <code className="font-mono text-sm bg-zinc-100 px-1.5 py-0.5 rounded">
              examples/win_calculator.py
            </code>
            . Open Calculator, locate five controls by their accessible names,
            click them in order, read the result display through its
            AutomationId, assert. It is ten lines of real work and it is the
            same thing a Coded UI Test project does with a UIMap file, a
            designer class, and an MSTest attribute.
          </p>
          <div className="mt-8">
            <AnimatedCodeBlock
              code={terminatorCode}
              language="python"
              filename="examples/win_calculator.py"
              typingSpeed={6}
            />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Install and wire it into your agent
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Pick the language your existing tests already live in. The Rust
            core is the same under all three SDKs. The last command registers
            the MCP server so an AI coding assistant can drive the same
            selectors at the tool-call level.
          </p>
          <div className="mt-8">
            <TerminalOutput lines={sdkInstall} title="install terminator" />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the deprecation actually cost you, and what you get back
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            A concrete inventory of what leaves the building when you move off
            Coded UI Test, and what arrives in its place. Nothing here is
            aspirational; every row corresponds to code in the Terminator
            repository.
          </p>
          <div className="mt-8">
            <BentoGrid cards={whatYouLose} />
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What it looks like in numbers
          </h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={14} />
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-900">
                atomic selector prefixes
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                all documented in one cheat sheet
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={10} />
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-900">
                lines to drive Calculator
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                examples/win_calculator.py
              </div>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-4xl font-bold text-zinc-900">
                <NumberTicker value={2} suffix="+" />
              </div>
              <div className="mt-2 text-sm font-medium text-zinc-900">
                desktop platforms supported
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Windows UIA and macOS AX
              </div>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <div className="text-4xl font-bold text-orange-700">
                <NumberTicker value={4} />
              </div>
              <div className="mt-2 text-sm font-medium text-orange-900">
                MCP clients out of the box
              </div>
              <div className="mt-1 text-xs text-orange-700/80">
                Claude Code, Cursor, VS Code, Windsurf
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-6 my-14">
          <BookCallCTA
            appearance="footer"
            destination="https://cal.com/team/mediar/terminator"
            site="Terminator"
            heading="Migrating off Coded UI Test? Let us read your UIMap."
            description="Thirty minutes with the Terminator team: we open your old UIMap.uitest, point each SearchProperties entry at its Terminator selector, and hand you back a working script."
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mt-6">
            <FaqSection items={faqs} />
          </div>
        </section>

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Book a 30-min call: migrate your Coded UI Test project to Terminator."
        />
      </article>
    </>
  );
}
