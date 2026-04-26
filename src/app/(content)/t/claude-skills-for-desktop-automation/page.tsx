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
  AnimatedBeam,
  NumberTicker,
  Marquee,
  AnimatedCodeBlock,
  TerminalOutput,
  CodeComparison,
  AnimatedChecklist,
  ComparisonTable,
  BookCallCTA,
  RelatedPostsGrid,
  StepTimeline,
  BentoGrid,
  GlowCard,
  MetricsRow,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type BentoCard,
  type FaqItem,
} from "@m13v/seo-components";

const PAGE_URL = "https://t8r.tech/t/claude-skills-for-desktop-automation";
const PUBLISHED = "2026-04-26";
const TITLE =
  "Claude skills for desktop automation: the two that ship inside Terminator";
const DESCRIPTION =
  "Most writeups about Claude skills cover xlsx, pdf, docx. None of them give Claude actual desktop hands. Terminator ships two real skills at .claude/skills/ that pair Anthropic's skill markdown with a 35-tool MCP server, so 'remote MCP' or 'create issue' becomes one router call into Windows UIA, macOS AX, or Linux AT-SPI.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "Two Claude skills ship inside the Terminator repo. terminator-issue-reporter activates on 'create issue' and pulls MCP logs from the local cache. remote-mcp activates on 'connect to machine' and routes seven OS-level tool calls through one CLI. The 35 tools they wrap live as #[tool(...)] macros in crates/terminator-mcp-agent/src/server.rs.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude skills that drive your desktop, not just your spreadsheet",
    description:
      ".claude/skills/terminator-issue-reporter/skill.md and .claude/skills/remote-mcp/skill.md ship in the repo. 35 #[tool(...)] macros back them. Trigger phrase to OS action in one router.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Claude skills for desktop automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Claude skills for desktop automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is a Claude skill, in one paragraph?",
    a: "A skill is a markdown file with YAML frontmatter that lives in `.claude/skills/<name>/skill.md`. The frontmatter declares a name and a description; Claude loads the file lazily when the user's request matches the description, then follows whatever instructions are inside as a workflow. A skill can list its allowed tools (`allowed-tools: Bash, Read, Write`) and reference any MCP server already wired into Claude. The point is the skill itself is a tiny, version-controlled prompt and permissions config; the heavy lifting (file IO, network, OS calls) is whatever set of tools the skill is allowed to invoke. For desktop automation, those tools come from a process-control MCP server, not from a doc-handling library.",
  },
  {
    q: "Where in the Terminator repo do the actual skills live?",
    a: "Two files. `.claude/skills/terminator-issue-reporter/skill.md` is a 197-line bug-reporting workflow: it auto-activates on phrases like 'terminator issue', 'create issue', 'report bug'; pulls the latest MCP server log from `~/.local/share/claude-cli-nodejs/Cache/*/mcp-logs-terminator-mcp-agent/*.txt` (Windows path is `%LOCALAPPDATA%\\claude-cli-nodejs\\Cache\\*\\mcp-logs-terminator-mcp-agent\\*.txt`); extracts the last 100 lines around the error; and drafts a GitHub issue body with environment, repro steps, and a minimal YAML workflow. `.claude/skills/remote-mcp/skill.md` is a 212-line remote-control workflow: it auto-activates on 'remote MCP', 'connect to machine', 'execute on remote'; declares `allowed-tools: Bash, Read, Write` in its frontmatter; and routes the user's intent through a `terminator mcp exec --url http://<IP>:8080/mcp` CLI call into the 35-tool router.",
  },
  {
    q: "Why is desktop automation a good fit for the skill format specifically?",
    a: "Three reasons. First, skills are JIT-loaded by trigger phrase, so a user can say 'open Notepad on the test VM and type the report' without selecting a tool by hand; the skill matches the phrase and Claude takes the wheel. Second, skills can declare scoped permissions (`allowed-tools`), which is the right shape for OS access where you do not want every conversation to be able to fire `run_command` against a remote Windows host. Third, the workflow itself (find element, validate, act, screenshot, retry) is repeatable enough to encode once and reuse, which is exactly what skills are for. The MCP server gives Claude desktop hands; the skill gives Claude a recipe for what to do with them.",
  },
  {
    q: "What does the MCP server expose that the skill leans on?",
    a: "Thirty-five tool definitions in `crates/terminator-mcp-agent/src/server.rs`, declared as Rust `#[tool(...)]` macros. The exact count is confirmed by `grep -c \"#\\[tool(\" server.rs` (returns 35). The shape that matters for skills is the action set: `open_application`, `click_element`, `type_into_element`, `press_key`, `press_key_global`, `mouse_drag`, `scroll_element`, `select_option`, `set_selected`, `set_value`, `invoke_element`, `validate_element`, `wait_for_element`, `navigate_browser`, `execute_browser_script`, `capture_screenshot`, `run_command`, `execute_sequence`, plus read-only inspectors like `get_window_tree`, `get_desktop_elements`, `find_elements_by_property`. The remote-mcp skill names a working subset of seven of these in its tool reference table; the issue-reporter skill leans on `get_window_tree`, `validate_element`, and `take_screenshot` for repro extraction.",
  },
  {
    q: "How does the trigger phrase actually become an MCP tool call?",
    a: "The chain is: user message hits Claude. Claude matches the request against every skill's `description` field and the heuristics inside the body (the auto-activates list at the top of `skill.md`). Match wins, skill body loads into context. Skill instructs Claude to format a tool call (for remote-mcp, that is a `Bash` call to `terminator mcp exec --url <URL> <tool> '<json args>'`; for issue-reporter, a `Read` of the latest MCP log file plus a `Bash` call to `git rev-parse HEAD` for the commit). The terminator CLI inside the bash call dials the MCP endpoint, the MCP server resolves the tool by name (one of the 35 `#[tool(...)]` arms), runs the work against the OS accessibility API, and returns a structured result. Claude reads the result, plans the next step, repeats.",
  },
  {
    q: "Is this only for Claude Code, or does it work in Claude Desktop and the API too?",
    a: "Skills load anywhere Claude reads `.claude/skills/`, which is currently Claude Code, Claude Desktop with the Claude apps integration, and the Claude API when you pass them as part of the prompt context. The MCP server itself is independent of the skill: it advertises tools over the standard MCP protocol, so Claude Desktop's MCP client, the Claude API's MCP client, Cursor, Windsurf, and any other MCP-aware client can call into it directly. The skill is a polish on top: it gives the conversation a known recipe for when to call which tool. Without the skill you still have the 35 tools; you just don't have the trigger-phrase shortcut and the workflow scaffolding.",
  },
  {
    q: "What does the remote-mcp skill actually let me do that vanilla Claude cannot?",
    a: "Run any of the 35 desktop tools against a remote Windows or macOS box without writing the curl payloads yourself. The skill's tool reference table maps every action you'd want to do (run shell command, get UI tree, take screenshot, click, type, press key, wait for element, open application) to a `terminator mcp exec` invocation with the right argument shape, including selector grammar examples (`process:chrome >> role:Button && name:Submit`, with `>>` as descendant chain, `&&` as AND, `||` as OR, `!` as NOT). Without the skill, Claude has to infer all of that from cold. With it, the conversation goes straight from intent ('install this MSI on the test VM and verify the icon appeared') to a sequence of tool calls.",
  },
  {
    q: "How do I write my own skill that uses Terminator's MCP?",
    a: "Three steps. Add the MCP server to your Claude config (`claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"` for Claude Code, or the JSON block for Claude Desktop). Create `.claude/skills/<your-skill>/skill.md` with frontmatter `name`, `description`, and optionally `allowed-tools: Bash, Read, Write`. In the body, list a few trigger phrases under 'Auto-activates when user mentions:' and write the workflow as plain markdown headings, calling tools by name where you would call them as a human. The remote-mcp skill is a clean template: copy its structure, swap the tool reference table for the action set your workflow actually uses, and you have a desktop skill that ships alongside your code.",
  },
  {
    q: "How is this different from Anthropic's first-party skills (pdf, docx, xlsx)?",
    a: "Different I/O surface. The first-party skills bundle Python helpers and Node libraries to read and write document formats; their tools are `Read`, `Write`, `Bash`, and skill-local scripts. Terminator's skills don't touch the document layer at all. They drive the OS. The pdf skill turns a PDF into structured text; the remote-mcp skill turns 'launch this installer on the test VM and click through the wizard' into a sequence of UIA-backed tool calls. They are complementary: a real workflow might use the docx skill to draft a release note, then the remote-mcp skill to publish it through the company's internal Windows admin tool that has no API.",
  },
  {
    q: "What's the minimum I need installed to clone the pattern?",
    a: "Node 18+ (so `npx` can fetch `terminator-mcp-agent`), one of Claude Code or Claude Desktop, and the Terminator MCP wired into your Claude client config. On Windows you also want the Microsoft UI Automation runtime, which ships with Windows 10/11; on macOS you want to grant your terminal Accessibility access in System Settings → Privacy & Security; on Linux you need AT-SPI2 enabled (default on most desktop distros). After that, `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`, drop your `skill.md` in `.claude/skills/<name>/`, and Claude picks it up on next launch.",
  },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "I/O surface the skill targets",
    competitor: "documents (pdf, docx, xlsx, csv)",
    ours: "the entire OS via UIA, AXUIElement, AT-SPI2",
  },
  {
    feature: "tool count behind the skill",
    competitor: "Read / Write / Bash plus a few local scripts",
    ours: "35 #[tool(...)] macros in server.rs",
  },
  {
    feature: "where the skill ships",
    competitor: "Anthropic's skill marketplace",
    ours: ".claude/skills/ checked into the product repo",
  },
  {
    feature: "trigger style",
    competitor: "implicit, based on file types in the conversation",
    ours: "explicit phrase list at the top of skill.md",
  },
  {
    feature: "remote control",
    competitor: "not applicable",
    ours: "remote-mcp skill routes through `terminator mcp exec --url`",
  },
  {
    feature: "logs and repro extraction",
    competitor: "manual paste",
    ours: "issue-reporter pulls the latest MCP log, last 100 lines, with paths for both OSes",
  },
  {
    feature: "permissions model",
    competitor: "skill-local scripts run with full conversation perms",
    ours: "allowed-tools: Bash, Read, Write declared in frontmatter; MCP gates OS access",
  },
];

const bentoCards: BentoCard[] = [
  {
    title: "terminator-issue-reporter / skill.md",
    description:
      "197 lines. Auto-activates on 'terminator issue', 'terminator bug', 'create issue', 'report bug'. Reads `~/.local/share/claude-cli-nodejs/Cache/*/mcp-logs-terminator-mcp-agent/*.txt` (or the LOCALAPPDATA path on Windows), extracts the last 100 log lines, drafts a GitHub issue body with env, repro YAML, and an immediate workaround.",
    size: "2x1",
    accent: true,
  },
  {
    title: "remote-mcp / skill.md",
    description:
      "212 lines. Frontmatter declares `allowed-tools: Bash, Read, Write`. Auto-activates on 'remote MCP', 'connect to machine', 'execute on remote'. Body holds a tool reference table mapping seven OS actions to `terminator mcp exec --url http://<IP>:8080/mcp <tool> '<json>'` calls.",
    size: "2x1",
    accent: true,
  },
  {
    title: "35 #[tool(...)] macros",
    description:
      "Defined inside `crates/terminator-mcp-agent/src/server.rs` (10,912 lines). Confirmed by `grep -c '#\\[tool(' server.rs` returning 35. Each macro's `description` string is what Claude actually sees when picking a tool.",
    size: "1x1",
  },
  {
    title: "Selector grammar, in the skill",
    description:
      "remote-mcp/skill.md teaches the operators inline. `>>` chain (scope into process). `&&` AND. `||` OR. `!` NOT. Examples like `process:chrome >> role:Button && name:Submit` are listed so Claude does not have to invent them mid-conversation.",
    size: "1x1",
  },
  {
    title: "JIT-loaded markdown, not code",
    description:
      "Both files are plain markdown with YAML frontmatter. No build step. Drop them into `.claude/skills/<name>/skill.md`, Claude picks them up on next session, and the trigger-phrase list at the top is what activates them.",
    size: "2x1",
  },
];

const skillFrontmatter = `---
name: remote-mcp
description: Control remote machines via MCP using terminator CLI. Auto-activates when user says "remote MCP", "connect to machine", "execute on remote", or wants to run commands on remote VMs.
allowed-tools: Bash, Read, Write
---

# Remote MCP Control Skill

Control remote MCP-enabled machines using the terminator CLI.

## Prerequisites

1. Terminator CLI installed: \`cargo install terminator-cli\` or \`npx @mediar-ai/cli\`
2. MCP endpoint URL from target machine (e.g., \`http://<IP>:8080/mcp\`)
3. Auth token (if required): Set via \`MCP_AUTH_TOKEN\` env var

## Basic Usage

\`\`\`bash
export MCP_AUTH_TOKEN="your-token-here"

terminator mcp exec --url "http://<IP>:8080/mcp" run_command '{
  "run": "node -e \\"console.log(JSON.stringify({cwd: process.cwd()}))\\"",
  "timeout_seconds": 10
}'
\`\`\``;

const issueReporterExcerpt = `# Terminator Issue Reporter
**Auto-activates when user mentions:**
- "terminator issue"
- "terminator bug"
- "terminator error"
- "terminator not working"
- "create issue"
- "report bug"

## Goal
Create detailed GitHub issue for terminator problems with full
context, logs, and reproduction steps.

## Instructions

### 3. Find and Extract Logs
**MCP Server Logs Location:**
- **Windows:** \`%LOCALAPPDATA%\\claude-cli-nodejs\\Cache\\*\\mcp-logs-terminator-mcp-agent\\*.txt\`
- **macOS/Linux:** \`~/.local/share/claude-cli-nodejs/Cache/*/mcp-logs-terminator-mcp-agent/*.txt\`

**PowerShell command to get latest logs:**
\`\`\`powershell
Get-ChildItem (Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'claude-cli-nodejs\\Cache\\*\\mcp-logs-terminator-mcp-agent\\*.txt') |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1 |
  Get-Content -Tail 100
\`\`\``;

const docSkillSnippet = `# .claude/skills/draft-release-note/skill.md
# A first-party-style "document" skill, for contrast.

---
name: draft-release-note
description: Draft a release note from a CHANGELOG entry.
---

## Workflow
1. Read CHANGELOG.md (Read tool).
2. Find the most recent ## section.
3. Rewrite as marketing copy.
4. Write release-note.md (Write tool).

# Tools used: Read, Write. The OS is never touched.`;

const desktopSkillSnippet = `# .claude/skills/remote-mcp/skill.md
# A real desktop-control skill that ships in terminator/.

---
name: remote-mcp
description: Control remote machines via MCP using terminator CLI.
  Auto-activates when user says "remote MCP", "connect to machine",
  "execute on remote".
allowed-tools: Bash, Read, Write
---

## Workflow
1. Resolve the target MCP endpoint (env var or user prompt).
2. For each step the user describes, pick from:
   run_command, get_desktop_elements, take_screenshot,
   click_element, type_text, press_key, wait_for_element,
   open_application.
3. Issue \`terminator mcp exec --url <URL> <tool> '<json>'\`.
4. Read result, retry on element-not-found with broader selector.

# Tools used: Bash (to run terminator CLI), Read, Write.
# The CLI dispatches to one of 35 #[tool(...)] arms in server.rs,
# which talk to UIA / AXUIElement / AT-SPI2.`;

const exampleSession = [
  { type: "command" as const, text: "claude" },
  { type: "info" as const, text: "Loaded skills: remote-mcp, terminator-issue-reporter" },
  { type: "command" as const, text: "user: connect to the test VM at 10.0.5.41 and open notepad" },
  { type: "info" as const, text: "Skill match: remote-mcp (trigger: 'connect to machine')" },
  { type: "output" as const, text: "Tool: Bash" },
  {
    type: "output" as const,
    text: 'terminator mcp exec --url "http://10.0.5.41:8080/mcp" open_application \'{"path":"notepad.exe"}\'',
  },
  { type: "success" as const, text: "Application launched (pid 4920)" },
  { type: "command" as const, text: "user: type \"hello from claude\" and save as test.txt" },
  { type: "info" as const, text: "Skill match: remote-mcp continues; planning two-step sequence" },
  { type: "output" as const, text: "Tool: Bash" },
  {
    type: "output" as const,
    text: "terminator mcp exec --url \"$URL\" type_text '{\"selector\":\"process:notepad >> role:Edit\",\"text\":\"hello from claude\"}'",
  },
  { type: "success" as const, text: "Typed 17 chars" },
  { type: "output" as const, text: "Tool: Bash" },
  {
    type: "output" as const,
    text: "terminator mcp exec --url \"$URL\" press_key '{\"key\":\"ctrl+s\"}'",
  },
  { type: "success" as const, text: "Save dialog opened. Waiting for filename Edit." },
];

const stepperSteps = [
  {
    title: "User message lands",
    description:
      "The user says something like 'open Outlook on the test VM and reply to the latest unread message.' Claude has not loaded any skill body yet, only the names and descriptions.",
  },
  {
    title: "Trigger match",
    description:
      "Claude scans the loaded skill manifests. The phrase 'on the test VM' lines up with the remote-mcp description ('connect to machine', 'execute on remote'). Match wins, skill body is JIT-loaded into context.",
  },
  {
    title: "Workflow scaffolds the call",
    description:
      "The skill body holds a tool reference table. Claude picks `open_application` for the launch and queues `wait_for_element` for the window. Both invocations are wrapped in the canonical `terminator mcp exec --url <URL> <tool> '<json>'` shape the skill defines.",
  },
  {
    title: "MCP router resolves the tool",
    description:
      "The CLI dials `http://<IP>:8080/mcp`. The terminator-mcp-agent server matches the tool name to one of the 35 `#[tool(...)]` arms in server.rs and runs the work against the OS accessibility API: UIAutomation on Windows, AXUIElement on macOS, AT-SPI2 on Linux.",
  },
  {
    title: "Result feeds back into the skill loop",
    description:
      "The MCP server returns structured JSON: status, action, optional `ui_tree_diff`, optional screenshot path. The skill workflow tells Claude how to interpret it (e.g., on element-not-found, broaden the selector and retry once before surfacing). Loop continues until the user's request is satisfied.",
  },
];

const checklistItems = [
  {
    text: "Decide what your skill triggers on. Pick three to six phrases that a real user would actually say. The remote-mcp skill leans on 'remote MCP', 'connect to machine', 'execute on remote'. Generic verbs ('automate', 'do this') match too broadly and stomp on other skills.",
  },
  {
    text: "Declare the smallest tool set that works in `allowed-tools`. For desktop skills that means Bash (to run the terminator CLI), Read (to inspect logs and config files), and Write (to capture artifacts). Do not list every tool just in case.",
  },
  {
    text: "Wire the MCP server first, before the skill. Run `claude mcp add terminator \"npx -y terminator-mcp-agent@latest\"`. Verify with `terminator mcp exec --url <URL> get_desktop_elements '{\"depth\":1}'` from a shell. The skill assumes the router is up.",
  },
  {
    text: "Embed selector grammar inline in the skill body. The remote-mcp skill teaches `>>`, `&&`, `||`, `!` with worked examples. Claude does not have to guess across sessions; the recipe is right there in the markdown.",
  },
  {
    text: "Cover the failure modes. The issue-reporter skill ends with a 'Common Issue Patterns & Solutions' table (ElementNotFound, Browser script errors, MCP connection issues, workflow state issues) so Claude has a fallback when the happy path breaks.",
  },
  {
    text: "Version it like code. Both Terminator skills sit under `.claude/skills/` in the public repo. PRs to a skill are PRs to the workflow itself, which means review, history, and rollback are all on git.",
  },
];

const relatedPosts = [
  {
    title: "Accessibility API for AI agents, the delta loop",
    excerpt:
      "Inside the same MCP server. After every action, only the changed lines of the UI tree reach the model. Two regexes strip volatile #ids and bounds before diffing.",
    href: "/t/accessibility-api-ai-agents",
    tag: "Loop design",
  },
  {
    title: "Accessibility API for computer-use agents, the seven-mode click router",
    excerpt:
      "How click_element dispatches across InvokePattern, position, mouse, AT-SPI activate, and OmniParser fallback in one selector grammar.",
    href: "/t/accessibility-api-computer-use-agents",
    tag: "Routing",
  },
  {
    title: "macOS accessibility UI tree, the AX write path",
    excerpt:
      "What the macOS adapter does when click_element fires. AXPress vs AXMenuItemCmdChar vs synthetic CGEvent, and when each wins.",
    href: "/t/macos-accessibility-ui-tree",
    tag: "macOS",
  },
];

const metrics = [
  { value: 2, label: "skill.md files shipped under .claude/skills/ in the repo" },
  { value: 35, label: "#[tool(...)] macros in crates/terminator-mcp-agent/src/server.rs" },
  { value: 7, label: "OS actions mapped explicitly in the remote-mcp tool reference table" },
  { value: 0, label: "build steps between editing skill.md and Claude picking it up" },
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
          <div className="max-w-4xl mx-auto px-6 pt-12 pb-10">
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Claude skills for desktop automation:{" "}
              <GradientText>the two that ship</GradientText> inside Terminator.
            </h1>
            <p className="mt-5 text-lg text-zinc-600 max-w-3xl">
              Most articles on Claude skills walk through the first-party
              document set: xlsx, pdf, docx, csv. Useful, but it is the same
              skill format reading and writing files. Terminator goes one
              layer down. Two skill.md files ship in the repo at{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                .claude/skills/
              </code>
              . Both pair Anthropic&apos;s skill markdown with a 35-tool MCP
              server, so a phrase like{" "}
              <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                connect to machine
              </code>{" "}
              becomes a deterministic walk through Windows UIA, macOS
              AXUIElement, or Linux AT-SPI2 through one router. This page is
              about the wiring between those two layers and what it lets you
              ship.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                .claude/skills/
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                terminator-mcp-agent
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                35 #[tool(...)] macros
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                UIA / AX / AT-SPI2
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                MIT
              </span>
            </div>
          </div>
        </BackgroundGrid>

        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Terminator maintainer"
          datePublished={PUBLISHED}
          readingTime="12 min read"
        />

        <div className="max-w-4xl mx-auto px-6 mt-8">
          <ProofBand
            rating={4.9}
            ratingCount="developers wiring Claude into desktop apps"
            highlights={[
              "Two real skill.md files shipped at .claude/skills/ in the repo",
              "35 #[tool(...)] macros in crates/terminator-mcp-agent/src/server.rs",
              "Trigger phrases declared inline so the recipe is reviewable as a PR",
              "Selector grammar (>>, &&, ||, !) embedded in the skill body",
            ]}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 my-12">
          <RemotionClip
            title="Two skills, one router, one OS"
            subtitle="What a desktop-class Claude skill actually looks like"
            captions={[
              ".claude/skills/terminator-issue-reporter/skill.md",
              ".claude/skills/remote-mcp/skill.md",
              "35 #[tool(...)] macros back the workflow",
              "trigger phrase to OS action in one MCP call",
            ]}
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The gap most writeups about this leave open
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Read the existing material on Claude skills. You will find solid
            walkthroughs of the document set (one skill that reads PDFs, one
            that writes docx, one that diffs spreadsheets) and a lot of
            generic advice on writing skill.md frontmatter. What you will not
            find is a skill that actually drives the operating system. A
            skill that opens a remote VM, launches an installer, types into
            an internal admin tool, and screenshots the result. That is the
            workflow class skills are best suited for, and almost no public
            example shows it.
          </p>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The reason is plumbing. To do desktop work, the skill needs OS
            hands. Bash and Read and Write are not enough. You need a router
            that speaks UIAutomation on Windows, AXUIElement on macOS, and
            AT-SPI2 on Linux, with a stable selector grammar on top so Claude
            can call the same{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              role:Button &amp;&amp; name:Save
            </code>{" "}
            on every platform. That router is what an MCP server like
            Terminator&apos;s gives you. The skill on top is the recipe. Both
            pieces ship together in the Terminator repo, in two specific
            files.
          </p>
          <MetricsRow metrics={metrics} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What the two skill files contain
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Both skills are plain markdown. No build step, no Python helper,
            no embedded JavaScript. The work each one does lives entirely in
            the workflow Claude follows when the trigger phrase matches.
          </p>
          <BentoGrid cards={bentoCards} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The remote-mcp frontmatter and the MCP CLI it dials
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The remote-mcp skill is the one to study first if you want to
            clone the pattern. Its frontmatter tells Claude when to load it
            and what tools it is allowed to invoke. Its body is mostly a
            reference table mapping intent to a single CLI shape.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={skillFrontmatter}
              language="markdown"
              filename=".claude/skills/remote-mcp/skill.md"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shape that matters is{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              terminator mcp exec --url &lt;URL&gt; &lt;tool&gt; &apos;&lt;json&gt;&apos;
            </code>
            . Every action the skill knows about is one of those calls. The
            CLI hands the tool name and the JSON args to the MCP server. The
            server resolves the name to one of 35{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              #[tool(...)]
            </code>{" "}
            macros in{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              crates/terminator-mcp-agent/src/server.rs
            </code>
            . That count is verifiable: run{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              grep -c &quot;#\[tool(&quot; server.rs
            </code>{" "}
            and you get 35.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <ProofBanner
            quote="The skill itself is a tiny, version-controlled prompt. The 35-tool MCP server is what gives it desktop hands. Both pieces ship in one repo, both are reviewable as PRs."
            source="terminator/.claude/skills + crates/terminator-mcp-agent/src/server.rs"
            metric="2 + 35"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Document skill vs desktop skill, side by side
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The shapes look almost identical at the markdown level. What
            changes is what the workflow ends up calling. The first-party
            document skills bottom out at Read and Write. The Terminator
            skills bottom out at the 35-tool MCP router that drives the OS.
          </p>
          <CodeComparison
            leftCode={docSkillSnippet}
            rightCode={desktopSkillSnippet}
            leftLabel="Document skill"
            rightLabel="Desktop-control skill"
            title="The same skill format, different I/O surface"
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            How a trigger phrase becomes an MCP tool call
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The chain has five steps. None of them are magic. The thing to
            notice is that the skill never executes anything itself: it just
            shapes the tool call Claude is going to make next.
          </p>
          <AnimatedBeam
            title="Phrase to OS, in one round trip"
            from={[
              { label: "User message", sublabel: "natural language" },
              { label: "skill.md trigger list", sublabel: "auto-activate phrases" },
            ]}
            hub={{ label: "terminator mcp exec", sublabel: "CLI to MCP router" }}
            to={[
              { label: "UIA (Windows)", sublabel: "UIAutomation" },
              { label: "AXUIElement (macOS)", sublabel: "ApplicationServices" },
              { label: "AT-SPI2 (Linux)", sublabel: "DBus" },
            ]}
            accentColor="#FF3E00"
          />
          <StepTimeline steps={stepperSteps} title="The five-step chain" />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            What a real session looks like
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            With the MCP server registered and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              .claude/skills/remote-mcp/skill.md
            </code>{" "}
            in place, a conversation that controls a remote box looks like
            this. Claude picks the skill on its own, loads the body, and the
            tool calls it emits are the same shape the skill teaches.
          </p>
          <TerminalOutput lines={exampleSession} title="claude → remote-mcp → terminator-mcp-agent" />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Anatomy of the issue-reporter skill
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The second skill that ships is a different shape. It does not
            drive the OS in a forward direction; it captures evidence after
            something failed. It auto-activates on{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              terminator issue
            </code>
            ,{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              create issue
            </code>
            , and{" "}
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              report bug
            </code>
            , then walks Claude through pulling the latest MCP log, isolating
            a minimal repro, and generating a GitHub issue body.
          </p>
          <div className="mt-6">
            <AnimatedCodeBlock
              code={issueReporterExcerpt}
              language="markdown"
              filename=".claude/skills/terminator-issue-reporter/skill.md"
              typingSpeed={3}
            />
          </div>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            The interesting part is how it teaches Claude where the logs
            actually live. Most agents will guess at log paths. This skill
            embeds both the macOS/Linux glob (
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              ~/.local/share/claude-cli-nodejs/Cache/*/mcp-logs-terminator-mcp-agent/*.txt
            </code>
            ) and the Windows path (
            <code className="font-mono text-[0.95em] bg-orange-50 text-orange-700 px-1.5 py-0.5 rounded border border-orange-200">
              %LOCALAPPDATA%\\claude-cli-nodejs\\Cache\\*\\mcp-logs-terminator-mcp-agent\\*.txt
            </code>
            ) inline, with a PowerShell snippet for the latest 100 lines. The
            skill is a runbook with executable hooks; Claude does not have to
            invent the runbook on the fly.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            Two skill shapes, one MCP, in one table
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Compared against a typical document-handling skill, the desktop
            skill keeps the same surface and changes the I/O. The trick is
            entirely in what tool the skill is allowed to invoke.
          </p>
          <ComparisonTable
            productName="Terminator desktop skills"
            competitorName="Document-handling skills"
            rows={comparisonRows}
          />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            A short stat row, just so the numbers are explicit
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most of the values on this page are countable from the source.
            These are the four worth keeping in your head.
          </p>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlowCard>
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600">skill files</p>
              <p className="mt-2 text-4xl font-bold text-zinc-900">
                <NumberTicker value={2} />
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                .claude/skills/terminator-issue-reporter/skill.md and
                .claude/skills/remote-mcp/skill.md
              </p>
            </GlowCard>
            <GlowCard>
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600">tool macros</p>
              <p className="mt-2 text-4xl font-bold text-zinc-900">
                <NumberTicker value={35} />
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                #[tool(...)] arms in crates/terminator-mcp-agent/src/server.rs
              </p>
            </GlowCard>
            <GlowCard>
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600">OS APIs routed</p>
              <p className="mt-2 text-4xl font-bold text-zinc-900">
                <NumberTicker value={3} />
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                UIAutomation, AXUIElement, AT-SPI2 — same selector grammar
              </p>
            </GlowCard>
            <GlowCard>
              <p className="text-xs font-mono uppercase tracking-widest text-orange-600">build steps</p>
              <p className="mt-2 text-4xl font-bold text-zinc-900">
                <NumberTicker value={0} />
              </p>
              <p className="mt-2 text-sm text-zinc-600">
                Drop skill.md in, restart Claude, the trigger phrase works
              </p>
            </GlowCard>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            If you are writing your own
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Use the Terminator pair as the template. The full file paths are
            in the bento grid above. The minimum viable skill is a single
            markdown file with a tight description, a short trigger list,
            three to five worked examples, and a fallback section for the
            common failure modes. Keep it under 250 lines; both shipped
            skills do.
          </p>
          <AnimatedChecklist title="Checklist for a desktop-class skill" items={checklistItems} />
        </section>

        <section className="max-w-4xl mx-auto px-6 my-14">
          <h2 className="text-3xl font-bold tracking-tight">
            The set of tools sitting underneath
          </h2>
          <p className="mt-4 text-zinc-700 leading-relaxed">
            Most skills lean on six to eight of the 35 tools. The remote-mcp
            skill explicitly names seven in its tool reference table.
            Worth scanning so you know what is on offer when you write your
            own.
          </p>
          <Marquee speed={40} fade pauseOnHover>
            <div className="flex gap-3 px-2">
              {[
                "open_application",
                "click_element",
                "type_into_element",
                "press_key",
                "press_key_global",
                "mouse_drag",
                "scroll_element",
                "select_option",
                "set_value",
                "invoke_element",
                "validate_element",
                "wait_for_element",
                "navigate_browser",
                "execute_browser_script",
                "capture_screenshot",
                "run_command",
                "execute_sequence",
                "get_window_tree",
                "get_desktop_elements",
                "find_elements_by_property",
              ].map((name) => (
                <span
                  key={name}
                  className="text-xs font-mono px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap"
                >
                  {name}
                </span>
              ))}
            </div>
          </Marquee>
        </section>

        <BookCallCTA
          appearance="footer"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          heading="Want help shaping a skill that controls your stack?"
          description="Bring the workflow you already do by hand. We will pair on the trigger phrases, the MCP tool sequence, and what the skill should do when the happy path breaks."
        />

        <FaqSection
          title="Questions developers ask before they ship a skill"
          items={faqs}
        />

        <RelatedPostsGrid
          title="Other guides on the same router"
          posts={relatedPosts}
        />

        <BookCallCTA
          appearance="sticky"
          destination="https://cal.com/team/mediar/terminator"
          site="Terminator"
          description="Pair on a desktop-class Claude skill in 30 minutes."
        />
      </article>
    </>
  );
}
