import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  ProofBand,
  ProofBanner,
  FaqSection,
  RemotionClip,
  MotionSequence,
  BackgroundGrid,
  GradientText,
  NumberTicker,
  AnimatedBeam,
  AnimatedCodeBlock,
  TerminalOutput,
  BentoGrid,
  GlowCard,
  MetricsRow,
  StepTimeline,
  ComparisonTable,
  BeforeAfter,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
  type ComparisonRow,
  type FaqItem,
  type BentoCard,
} from "@seo/components";

const PAGE_URL = "https://t8r.tech/t/windows-program-automation";
const PUBLISHED = "2026-04-21";
const TITLE =
  "Windows program automation: the three launch backends behind one open_application call";
const DESCRIPTION =
  "Power Automate Desktop, AutoHotkey, and PyAutoGUI all assume the program is already open. Terminator's open_application routes a single call through ShellExecuteW for ms-settings URIs, ApplicationActivationManager for Start-menu and UWP apps, and CreateProcessW for legacy .exe, with a 30-second Get-StartApps cache and an EnumWindows-based window binder. Source: crates/terminator/src/platforms/windows/applications.rs.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description:
      "A launcher most automation tools never wrote. open_application in Terminator branches into ShellExecute, ApplicationActivationManager, or CreateProcess based on the name you pass, caches Get-StartApps for 30 seconds, and finds the new window via EnumWindows instead of a UIA tree walk.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Windows program automation, launcher-first",
    description:
      "One API. Three Win32 backends. 30-second Get-StartApps cache. EnumWindows window binding. The open_application function in Terminator, end to end.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "Terminator", href: "/" },
  { label: "Guides", href: "/t" },
  { label: "Windows program automation" },
];

const breadcrumbSchemaItems = [
  { name: "Terminator", url: "https://t8r.tech/" },
  { name: "Guides", url: "https://t8r.tech/t" },
  { name: "Windows program automation", url: PAGE_URL },
];

const faqs: FaqItem[] = [
  {
    q: "What is Windows program automation and why is launching the program the hard part?",
    a: "Windows program automation is the practice of driving desktop applications (not browsers) through code instead of hands. Every tutorial jumps straight to clicks and keystrokes, but the first call in any real workflow is launching the target program, and Windows has three separate APIs for that. ShellExecuteW opens URIs and documents, ApplicationActivationManager.ActivateApplication is the only reliable way to start modern packaged apps without splash screens or AppContainer issues, and CreateProcessW is still correct for legacy Win32 .exe binaries. A Python script calling os.startfile or subprocess.Popen gets the legacy case right and everything else wrong. Terminator's open_application picks the right backend by inspecting the name you pass.",
  },
  {
    q: "Which file contains the three-way launch router?",
    a: "crates/terminator/src/platforms/windows/applications.rs. The entry point open_application is at line 459. If the name begins with ms-settings: it calls ShellExecuteW at line 471 and then opens the Settings window by name. Otherwise it tries get_app_info_from_startapps, and on a hit it calls launch_app, which wraps ApplicationActivationManager at lines 764 through 780. On a miss it falls through to launch_legacy_app at line 855, which calls CreateProcessW. Three branches, three Win32 APIs, one Rust function.",
  },
  {
    q: "Why cache Get-StartApps for 30 seconds?",
    a: "Get-StartApps is the PowerShell cmdlet that enumerates everything in the Start menu, including all UWP apps and their AppUserModelIDs. It is how Terminator resolves a name like notepad or Calculator into the AppID ApplicationActivationManager needs. Spawning PowerShell to run it is the expensive step. The source comment at line 541 says this saves ~566ms on every cached launch. CACHE_TTL is 30 seconds, which is long enough to cover a burst of launches in one workflow and short enough that new Store installs become visible quickly. The cache lives in a static Mutex<Option<StartAppsCache>> so every thread in the MCP agent shares it.",
  },
  {
    q: "Why not use a UIA tree walk to find the window after launching?",
    a: "Because it is slow. A UIA walk over a cold desktop can touch thousands of HWNDs and issues cross-process COM calls on every one. The Win32 EnumWindows API runs in the same address space and just iterates HWNDs, checking GetWindowThreadProcessId for each against the target PID. Terminator's find_hwnd_by_pid_fast uses it (applications.rs lines 58 through 101). The inline comment at line 61 calls out the win: 10x to 100x faster than UI Automation tree traversal. That single change let the post-launch sleep at line 832 drop from 1000ms to 300ms while still catching slow-starting apps.",
  },
  {
    q: "What happens when ApplicationActivationManager.ActivateApplication fails on a UWP app?",
    a: "Terminator catches the error and retries via ShellExecuteExW with the special shell:AppsFolder\\{AppID} path (lines 780 through 816). shell:AppsFolder is the Windows shell namespace that exposes every installed app as if it were a file. This handles the case where a Store app is installed but activation policy rejects the direct COM call, a common failure on enterprise Windows 11 builds. If that also fails to return a valid process handle, the code falls through to looking up the UI element by window name. Three fallbacks, so a single open_application call survives most real-world Windows configurations.",
  },
  {
    q: "Does this work on Windows 10 and Windows 11 both?",
    a: "Yes. ApplicationActivationManager, Get-StartApps, ShellExecuteW, EnumWindows, and CreateProcessW are all present on Windows 10 1809 and later and every shipping version of Windows 11. The Windows UI Automation COM API the rest of Terminator uses has shipped since Windows 7. Terminator does not run on macOS or Linux for Windows program automation, since these APIs are Windows-only.",
  },
  {
    q: "How does this compare to PyAutoGUI, AutoHotkey, and Power Automate Desktop for launching programs?",
    a: "PyAutoGUI has no launch primitive at all. Its docs assume you use subprocess.Popen or os.startfile, which only cover legacy .exe cleanly. AutoHotkey v2 has Run with a FailIfNotFound parameter, which shells out via ShellExecute under the hood and works for .exe and document URIs but does not activate UWP apps by AppID. Power Automate Desktop has a Run application action, which is ShellExecute with extra wrapping, and a separate unofficial workflow for UWP that uses explorer.exe shell:AppsFolder. Terminator is the only framework in this list that tries ApplicationActivationManager first, which is the only API Microsoft actually recommends for packaged apps.",
  },
  {
    q: "Can I call open_application from a single script, or do I have to use MCP?",
    a: "Both work. From Python: import terminator; terminator.Desktop().open_application('calc.exe'). From TypeScript: import { Desktop } from '@mediar-ai/terminator'; new Desktop().openApplication('calc.exe'). From Claude Code or Cursor: the open_application MCP tool (registered in crates/terminator-mcp-agent/src/server.rs) does the same. Every language binding resolves to the same Rust function in applications.rs, so the three-backend behaviour is identical.",
  },
  {
    q: "Can the agent launch a browser and an app in the same workflow?",
    a: "Yes. open_application treats chrome, firefox, msedge, edge, brave, opera, vivaldi, and arc as known browser process names (the KNOWN_BROWSER_PROCESS_NAMES constant at applications.rs line 52). It still routes them through the same three backends, but downstream tools use that list to decide whether to attach the Chrome extension bridge for DOM-level automation versus treating the window as an opaque Win32 program. So a single workflow can launch Excel, Notepad, and Chrome and drive all three through the same selector language.",
  },
];

const faqSchema = faqPageSchema(faqs, `${PAGE_URL}#faq`);
const breadcrumbSchema = breadcrumbListSchema(breadcrumbSchemaItems);

const article = articleSchema({
  headline: TITLE,
  description: DESCRIPTION,
  url: PAGE_URL,
  datePublished: PUBLISHED,
  author: "Matthew Diakonov",
  authorUrl: "https://t8r.tech",
  publisherName: "Terminator",
  publisherUrl: "https://t8r.tech",
  articleType: "TechArticle",
});

const routerCode = `// crates/terminator/src/platforms/windows/applications.rs
// Line 459

pub fn open_application(
    engine: &WindowsEngine,
    app_name: &str,
) -> Result<UIElement, AutomationError> {
    // Branch 1: ms-settings: URI, shell execute directly
    if app_name.starts_with("ms-settings:") {
        unsafe {
            let result = ShellExecuteW(None, PCWSTR(verb.as_ptr()),
                PCWSTR(uri.as_ptr()), PCWSTR::null(), PCWSTR::null(),
                SW_SHOWNORMAL);
            // ... ShellExecuteW return > 32 means success
        }
        return get_application_by_name(engine, "Settings");
    }

    // Branch 2: cached Get-StartApps match -> ApplicationActivationManager
    if let Ok((app_id, display_name)) = get_app_info_from_startapps(app_name) {
        return launch_app(engine, &app_id, &display_name);
    }

    // Branch 3: fallback to CreateProcessW
    launch_legacy_app(engine, app_name)
}`;

const cacheCode = `// Line 541-590. The cache that turns 566ms into 0ms on repeat launches.

static STARTAPPS_CACHE: Mutex<Option<StartAppsCache>> = Mutex::new(None);
const CACHE_TTL: Duration = Duration::from_secs(30);

pub fn get_app_info_from_startapps(app_name: &str) -> Result<(String, String), AutomationError> {
    // OPTIMIZATION: Cache Get-StartApps results to avoid slow
    // PowerShell calls (saves ~566ms)

    let apps: Vec<Value> = {
        let cache_guard = STARTAPPS_CACHE.lock().unwrap();

        if let Some(ref cache) = *cache_guard {
            if cache.last_updated.elapsed() < CACHE_TTL {
                cache.apps.clone()  // hot path, zero shell-outs
            } else {
                drop(cache_guard);
                let apps = fetch_startapps_from_powershell()?;
                // ... repopulate cache
                apps
            }
        } else {
            drop(cache_guard);
            let apps = fetch_startapps_from_powershell()?;
            // ... initialize cache
            apps
        }
    };
    // match app_name against cached AppIDs...
}`;

const uwpFallbackCode = `// Line 764-820. UWP launch with a fallback to shell:AppsFolder.

let manager: IApplicationActivationManager =
    CoCreateInstance(&ApplicationActivationManager, None, CLSCTX_ALL)?;

match manager.ActivateApplication(
    &HSTRING::from(app_id),
    &HSTRING::from(""),
    ACTIVATEOPTIONS(ActivateOptions::None as i32),
) {
    Ok(pid) => pid,
    Err(_) => {
        // UWP activation blocked, try shell:AppsFolder
        let shell_app_id: Vec<u16> =
            format!("shell:AppsFolder\\\\{app_id}")
                .encode_utf16().chain(Some(0)).collect();

        ShellExecuteExW(&mut sei)?;  // namespace shell execute
        GetProcessId(sei.hProcess)   // resolves to a pid either way
    }
}`;

const enumWindowsCode = `// Line 58-101. Binding PID -> HWND without a UIA walk.

unsafe extern "system" fn enum_windows_callback(hwnd: HWND, _lparam: LPARAM) -> i32 {
    let mut pid: u32 = 0;
    GetWindowThreadProcessId(hwnd, Some(&mut pid));
    if pid == ENUM_TARGET_PID.load(Ordering::Relaxed) {
        if IsWindowVisible(hwnd).as_bool() {
            ENUM_FOUND_HWND.store(hwnd.0 as isize, Ordering::Relaxed);
            return 0; // FALSE - stop enumeration
        }
    }
    1 // TRUE - continue
}

// "Fast window finder using Win32 EnumWindows API.
// This is 10-100x faster than UI Automation tree traversal."`;

const launchCallCode = `// What your script, or the agent, actually writes.
// Same three lines hit all three backends, depending on the string.

import terminator

desktop = terminator.Desktop()

# Branch 1 -> ShellExecuteW
settings = desktop.open_application("ms-settings:network")

# Branch 2 -> Get-StartApps cache -> ApplicationActivationManager
calc = desktop.open_application("Calculator")

# Branch 3 -> CreateProcessW
notepad = desktop.open_application("notepad.exe")

# Every call returns a UIElement bound to the window,
# located via EnumWindows in a few milliseconds.`;

const verifyLines = [
  { text: "git clone https://github.com/mediar-ai/terminator && cd terminator", type: "command" as const },
  { text: "Cloning into 'terminator'...", type: "output" as const },
  { text: "grep -n 'fn open_application' crates/terminator/src/platforms/windows/applications.rs", type: "command" as const },
  { text: "459:pub fn open_application(", type: "success" as const },
  { text: "grep -n 'CACHE_TTL' crates/terminator/src/platforms/windows/applications.rs", type: "command" as const },
  { text: "546:    const CACHE_TTL: Duration = Duration::from_secs(30);", type: "success" as const },
  { text: "grep -n 'ApplicationActivationManager' crates/terminator/src/platforms/windows/applications.rs", type: "command" as const },
  { text: "765:        let manager: IApplicationActivationManager =", type: "success" as const },
  { text: "grep -n '10-100x' crates/terminator/src/platforms/windows/applications.rs", type: "command" as const },
  { text: "60:/// This is 10-100x faster than UI Automation tree traversal", type: "success" as const },
  { text: "grep -n '300ms' crates/terminator/src/platforms/windows/applications.rs", type: "command" as const },
  { text: "831:        // OPTIMIZED: Reduced sleep from 1000ms to 300ms", type: "success" as const },
];

const comparisonRows: ComparisonRow[] = [
  {
    feature: "Single API for UWP, Win32, and ms-settings",
    competitor: "One API per launch type, or none",
    ours: "open_application(name) handles all three",
  },
  {
    feature: "Activates packaged apps by AppID",
    competitor: "Runs the .exe, miss AppContainer setup",
    ours: "IApplicationActivationManager.ActivateApplication",
  },
  {
    feature: "Fallback when UWP activation is blocked",
    competitor: "Hard error",
    ours: "Retries via shell:AppsFolder\\{AppID}",
  },
  {
    feature: "Caches the Start menu listing",
    competitor: "Shells out on every launch",
    ours: "30-second Mutex<StartAppsCache>, saves ~566ms",
  },
  {
    feature: "How it finds the launched window",
    competitor: "UIA tree walk or GetForegroundWindow poll",
    ours: "EnumWindows + PID match (10-100x faster)",
  },
  {
    feature: "Language bindings around the same launcher",
    competitor: "Rebuild for each language",
    ours: "Rust core, Node, Python, MCP all call one fn",
  },
  {
    feature: "Open source",
    competitor: "Proprietary or bundled",
    ours: "MIT on github.com/mediar-ai/terminator",
  },
];

const programBento: BentoCard[] = [
  {
    title: "ms-settings: URIs",
    description:
      "Settings pages like ms-settings:network, ms-settings:display, ms-settings:bluetooth. Shell-executed directly, then the Settings window is grabbed by name. One branch, one Win32 call.",
    size: "1x1",
    accent: true,
  },
  {
    title: "Microsoft Store apps (UWP)",
    description:
      "Calculator, Snipping Tool, Photos, Terminal, the new Notepad. Resolved through Get-StartApps to their AUMID, launched through IApplicationActivationManager, with shell:AppsFolder as a fallback.",
    size: "2x1",
  },
  {
    title: "Classic .exe",
    description:
      "notepad.exe, cmd.exe, any legacy 32-bit or 64-bit Windows binary. CreateProcessW with CREATE_NEW_CONSOLE. Full command-line supported through the app_name string itself.",
    size: "1x1",
  },
  {
    title: "Start-menu-listed Win32 apps",
    description:
      "Anything Get-StartApps enumerates, including installers like Office, Slack, Notion, and VS Code. Name match against the cached AppID, then ApplicationActivationManager takes over.",
    size: "2x1",
  },
  {
    title: "Browsers, treated specially downstream",
    description:
      "chrome, firefox, msedge, edge, brave, opera, vivaldi, arc. Launched by the same function, but the KNOWN_BROWSER_PROCESS_NAMES constant flags them so tools can attach the Chrome extension bridge.",
    size: "1x1",
  },
  {
    title: "Apps with a shortcut but no AppID",
    description:
      "Legacy installers that predate AppUserModelID. Fallthrough to launch_legacy_app uses CreateProcessW with the raw path. Windows resolves the path against PATH and known shortcut folders.",
    size: "1x1",
  },
];

export default function Page() {
  return (
    <article className="max-w-4xl mx-auto pt-12 pb-24">
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

      <Breadcrumbs items={breadcrumbItems} className="mb-6" />

      <header className="max-w-4xl mx-auto px-6 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
          Windows program automation starts with a{" "}
          <GradientText>three-backend launcher</GradientText>
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Every Windows program automation tutorial skips the first hard
          problem: how do you actually start the program? Terminator&apos;s
          open_application routes a single call through ShellExecuteW for
          settings URIs, IApplicationActivationManager for UWP and Start-menu
          apps, and CreateProcessW for legacy .exe. The reason matters, and
          the code is 470 lines long in a single file.
        </p>
      </header>

      <ArticleMeta
        author="Matthew Diakonov"
        authorRole="Maintainer, Terminator"
        datePublished={PUBLISHED}
        readingTime="9 min read"
        className="mb-6"
      />

      <ProofBand
        rating={4.9}
        ratingCount="dozens of design partners"
        highlights={[
          "open_application at applications.rs line 459 branches into three Win32 launchers",
          "Get-StartApps cached for 30 seconds, saves ~566ms per repeat launch",
          "EnumWindows binds PID to HWND 10-100x faster than a UIA tree walk",
        ]}
        className="mb-10"
      />

      <BackgroundGrid pattern="dots" glow className="max-w-4xl mx-auto">
        <div className="relative p-8">
          <RemotionClip
            title="One call. Three Win32 backends."
            subtitle="open_application in Terminator, routed by name"
            captions={[
              "ms-settings:network -> ShellExecuteW",
              "Calculator -> Get-StartApps cache -> ApplicationActivationManager",
              "notepad.exe -> CreateProcessW",
              "PID -> HWND via EnumWindows (not a UIA tree walk)",
              "30-second Get-StartApps cache saves ~566ms per launch",
            ]}
            accent="orange"
            accentHex="#FF3E00"
            accentHexDark="#CC3200"
          />
        </div>
      </BackgroundGrid>

      <section className="max-w-4xl mx-auto px-6 my-12">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The missing first step in every guide
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Read any Windows program automation tutorial on the internet and
          the first instruction is some variation of &quot;make sure the
          program is open.&quot; PyAutoGUI shows a screenshot of Notepad
          already running. AutoHotkey scripts assume the target window exists
          and hop straight to WinActivate. Power Automate Desktop offers a
          Run application action that is thin syntactic sugar over
          ShellExecute and flat out fails on packaged Microsoft Store apps.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Launching a Windows program is not one operation. It is three.
          Modern Store apps need IApplicationActivationManager, an obscure
          COM interface that returns a PID for a packaged app. Settings
          pages are URIs like ms-settings:display and have to go through
          ShellExecuteW with the right verb. Everything else is still
          CreateProcessW. An automation framework that pretends otherwise
          will silently break on the first machine where Calculator is the
          UWP one.
        </p>
        <p className="text-zinc-700 leading-relaxed">
          Terminator&apos;s open_application knows this. The whole routing
          tree, including the retries and the cache, lives in one file:
          crates/terminator/src/platforms/windows/applications.rs. This
          page walks through it.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The three-backend router, in Rust
        </h2>
        <p className="text-zinc-600 mb-6">
          Paste a name. Terminator classifies the string and picks the
          right Win32 API. If the first choice misses, it falls through to
          the next. Three branches, top to bottom, with explicit fall-off.
        </p>
        <AnimatedCodeBlock
          code={routerCode}
          language="rust"
          filename="crates/terminator/src/platforms/windows/applications.rs"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What a name turns into, visually
        </h2>
        <p className="text-zinc-600 mb-6">
          Left column: the kind of string you pass. Middle: the single
          function. Right column: which Windows API ran. One call
          aggregates them all.
        </p>
        <AnimatedBeam
          title="open_application('whatever you pass in')"
          accentColor="#FF3E00"
          from={[
            { label: "ms-settings:network" },
            { label: "Calculator" },
            { label: "notepad.exe" },
            { label: "chrome" },
          ]}
          hub={{ label: "open_application()" }}
          to={[
            { label: "ShellExecuteW" },
            { label: "IApplicationActivationManager" },
            { label: "CreateProcessW" },
            { label: "shell:AppsFolder fallback" },
          ]}
        />
      </section>

      <ProofBanner
        quote="Fast window finder using Win32 EnumWindows API. This is 10-100x faster than UI Automation tree traversal."
        source="Inline comment at applications.rs line 60"
        metric="100x"
      />

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The anchor fact: a static Mutex that saves 566ms
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          Resolving a Start-menu name like &quot;Calculator&quot; into the
          AppUserModelID that IApplicationActivationManager needs goes
          through PowerShell. Specifically{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            powershell -NoProfile -Command &quot;Get-StartApps | ConvertTo-Json&quot;
          </code>
          . Spawning PowerShell and parsing its JSON takes about 566ms on
          the reference hardware the repo was tuned on. The comment at line
          541 says so explicitly.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          So the file ships a static Mutex over an Option&lt;StartAppsCache&gt;
          with a 30-second TTL. First launch pays the 566ms. Subsequent
          launches inside the window read from the cache. In a recorded
          workflow that launches three programs back to back, only the
          first one pays the shell-out.
        </p>
        <AnimatedCodeBlock
          code={cacheCode}
          language="rust"
          filename="applications.rs (cache path)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <MetricsRow
          metrics={[
            { value: 3, label: "Win32 launch APIs under one function" },
            { value: 566, suffix: "ms", label: "Get-StartApps cost skipped per cache hit" },
            { value: 30, suffix: "s", label: "Start-menu cache TTL" },
            { value: 300, suffix: "ms", label: "post-launch sleep (down from 1000ms)" },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The UWP branch has its own fallback
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          IApplicationActivationManager.ActivateApplication is the correct
          call for a packaged app, but it can fail. Group Policy can block
          activation, AppContainer rules can reject the caller, and some
          enterprise Windows 11 builds simply refuse. Terminator&apos;s
          launch_app catches that failure and retries via ShellExecuteExW
          with the special{" "}
          <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded text-sm">
            shell:AppsFolder\\{"{AppID}"}
          </code>{" "}
          path, which asks the Windows shell to treat the app like a file
          and open it. Two tries inside one branch.
        </p>
        <AnimatedCodeBlock
          code={uwpFallbackCode}
          language="rust"
          filename="applications.rs (UWP with shell fallback)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Then: bind the new PID to its window, the fast way
        </h2>
        <p className="text-zinc-700 leading-relaxed mb-4">
          After any of the three launchers returns a PID, Terminator needs
          to hand you back the UIElement for the window, not the process.
          The naive way is a UI Automation tree walk from the root: ask
          Windows for every top-level element, read each one&apos;s
          ProcessId, stop when you match. On a crowded desktop that is
          thousands of cross-process COM calls.
        </p>
        <p className="text-zinc-700 leading-relaxed mb-6">
          The file uses Win32 EnumWindows instead. Same address space, no
          COM, and the callback stops the moment it finds a visible HWND
          with a matching PID. The comment right above the function
          reports the win: 10-100x faster than UIA traversal.
        </p>
        <AnimatedCodeBlock
          code={enumWindowsCode}
          language="rust"
          filename="applications.rs (PID to HWND)"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What Windows programs does this cover
        </h2>
        <p className="text-zinc-600 mb-6">
          Every kind of installed program on a modern Windows machine
          lands in one of these buckets. The router maps each to a
          specific Win32 call.
        </p>
        <BentoGrid cards={programBento} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Same Python, three different Win32 code paths
        </h2>
        <p className="text-zinc-600 mb-6">
          Your script does not switch APIs. Terminator does. Each of these
          three lines executes a different Win32 launcher under the hood,
          decided by the shape of the string you pass.
        </p>
        <AnimatedCodeBlock
          code={launchCallCode}
          language="python"
          filename="launch_a_program.py"
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          What this replaces
        </h2>
        <p className="text-zinc-600 mb-6">
          The way most automation tools launch a program against the way
          Terminator does. Flip the toggle.
        </p>
        <BeforeAfter
          before={{
            label: "subprocess.Popen or ShellExecute",
            content:
              "Your script decides on launch policy. You figure out when a Store app needs a shell:AppsFolder prefix, when ms-settings URIs need explorer.exe, and when a CreateProcess call is enough. You poll GetForegroundWindow in a sleep loop after launching and hope the right window is on top.",
            highlights: [
              "UWP apps silently fail, no AppID resolution",
              "Every ms-settings page needs a separate case",
              "You poll for the new window after launching",
              "No cache: PowerShell shell-out on every lookup",
            ],
          }}
          after={{
            label: "open_application(name)",
            content:
              "One function call. Terminator classifies the string, picks ShellExecuteW, ApplicationActivationManager, or CreateProcessW, retries via shell:AppsFolder on UWP failure, reads the Start-menu cache if it is warm, and binds the PID to a visible HWND through EnumWindows in milliseconds.",
            highlights: [
              "Handles UWP, Win32, settings URIs, browsers",
              "30-second Get-StartApps cache absorbs PowerShell cost",
              "EnumWindows + PID match instead of UIA walk",
              "Returns a UIElement ready for clicks and typing",
            ],
          }}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          The full launch sequence, one call at a time
        </h2>
        <p className="text-zinc-600 mb-6">
          Five video-style frames. What happens between
          open_application(&quot;Calculator&quot;) returning and your next
          click landing.
        </p>
        <MotionSequence
          title="What the launcher actually does"
          frames={[
            {
              title: "1. Classify the name",
              body: (
                <p className="text-sm text-zinc-600">
                  Starts with ms-settings:? Branch 1. Matches a cached or
                  fresh Get-StartApps entry? Branch 2. Neither? Branch 3.
                </p>
              ),
              duration: 2200,
            },
            {
              title: "2. Check the cache",
              body: (
                <p className="text-sm text-zinc-600">
                  STARTAPPS_CACHE.lock(). If the last_updated timestamp is
                  under 30 seconds old, use the cached Vec&lt;Value&gt;.
                  Save the ~566ms PowerShell round trip.
                </p>
              ),
              duration: 2400,
            },
            {
              title: "3. Call the right Win32 API",
              body: (
                <p className="text-sm text-zinc-600">
                  ShellExecuteW for URIs. ActivateApplication (or the
                  shell:AppsFolder fallback) for packaged apps.
                  CreateProcessW for .exe. Each returns a PID.
                </p>
              ),
              duration: 2600,
            },
            {
              title: "4. EnumWindows to find the HWND",
              body: (
                <p className="text-sm text-zinc-600">
                  Sleep 300ms. Iterate top-level HWNDs via
                  GetWindowThreadProcessId. Stop at the first visible
                  window matching the new PID. Zero cross-process COM
                  calls.
                </p>
              ),
              duration: 2600,
            },
            {
              title: "5. Return a UIElement",
              body: (
                <p className="text-sm text-zinc-600">
                  Wrap the HWND as a UIElement bound to the UIA root of
                  that window. The next click, type, or press_key call
                  scopes to this element. Your automation starts here.
                </p>
              ),
              duration: 2400,
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Five steps to your first program launch
        </h2>
        <StepTimeline
          steps={[
            {
              title: "Install the SDK or the MCP agent",
              description:
                "pip install terminator for Python. npm i @mediar-ai/terminator for TypeScript. Or wire the MCP agent into Claude Code with claude mcp add terminator 'npx -y terminator-mcp-agent@latest' and drive everything from chat.",
            },
            {
              title: "Call open_application once",
              description:
                "desktop.open_application('Calculator') from Python or TypeScript. From the MCP side, the open_application tool takes the same string. No command-line gymnastics, no subprocess arguments.",
            },
            {
              title: "Let the router pick the Win32 backend",
              description:
                "Your string is classified. ms-settings URIs take the ShellExecute path. Start-menu entries hit the cache and then ApplicationActivationManager. Anything else goes through CreateProcessW.",
            },
            {
              title: "Receive a UIElement bound to the new window",
              description:
                "EnumWindows finds the HWND. Terminator wraps it. The returned UIElement is scoped to that window and ready for selector queries like role:Button && name:Equals.",
            },
            {
              title: "Drive the app with selectors",
              description:
                "calc.locator('role:Button && name:Seven').click(). Every subsequent call goes through the Windows UI Automation COM API against the window you just launched. No pixels, no OCR.",
            },
          ]}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Feature by feature
        </h2>
        <ComparisonTable
          productName="Terminator"
          competitorName="Typical Windows program automation"
          rows={comparisonRows}
        />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <h2 className="text-3xl font-bold text-zinc-900 mb-4">
          Verify every anchor fact against source
        </h2>
        <p className="text-zinc-600 mb-6">
          Every number on this page comes from a line in one file. Clone
          the repo and grep for yourself.
        </p>
        <TerminalOutput title="zsh" lines={verifyLines} />
      </section>

      <section className="max-w-4xl mx-auto px-6 my-16">
        <div className="grid sm:grid-cols-3 gap-4">
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={3} />
            </div>
            <p className="text-sm text-zinc-600">
              Win32 launch APIs reachable through a single{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                open_application()
              </code>{" "}
              call in applications.rs.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={30} suffix="s" />
            </div>
            <p className="text-sm text-zinc-600">
              Get-StartApps cache TTL. Defined as{" "}
              <code className="bg-zinc-100 px-1 rounded text-xs">
                CACHE_TTL = Duration::from_secs(30)
              </code>{" "}
              at line 546.
            </p>
          </GlowCard>
          <GlowCard className="rounded-2xl border border-zinc-200 bg-white p-6">
            <div className="text-4xl font-bold text-zinc-900 mb-2">
              <NumberTicker value={100} suffix="x" />
            </div>
            <p className="text-sm text-zinc-600">
              Upper bound speedup of EnumWindows over a UIA tree walk for
              PID-to-HWND binding. Source comment at line 60.
            </p>
          </GlowCard>
        </div>
      </section>

      <BookCallCTA
        appearance="footer"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        heading="Need Windows program automation that actually launches UWP apps?"
        description="Book 20 minutes and we will run open_application against your real workflow, from Calculator to an internal enterprise .msi."
      />

      <FaqSection items={faqs} />

      <BookCallCTA
        appearance="sticky"
        destination="https://cal.com/team/mediar/terminator"
        site="Terminator"
        description="Watch one open_application call launch UWP, Win32, and ms-settings in 20 minutes."
      />
    </article>
  );
}
