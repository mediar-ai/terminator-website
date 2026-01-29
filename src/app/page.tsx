"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  Github,
  ArrowRight,
  Check,
  X,
  Copy,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import {
  trackInstallCopied,
  trackCodeCopied,
  trackCtaClicked,
  trackExternalLinkClicked,
  trackNavClicked,
  trackSectionViewed,
  trackWaitlistOpened,
  trackComparisonViewed,
  trackScrollDepth,
  trackTimeOnPage,
  trackLogoClicked,
} from "@/lib/analytics";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function CodeBlock({
  code,
  language = "typescript",
  section = "unknown",
}: {
  code: string;
  language?: string;
  section?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    trackCodeCopied(section, language);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="terminal-box overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">{language}</span>
        <button
          onClick={copyToClipboard}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono text-zinc-300">{code}</code>
      </pre>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  index,
}: {
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group p-6 border border-zinc-800 rounded-lg hover:border-accent/50 transition-all duration-300 hover:bg-zinc-900/50"
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.span
          className="font-mono text-2xl font-bold text-accent/60 group-hover:text-accent transition-colors"
          whileHover={{ scale: 1.1 }}
        >
          {String(index).padStart(2, "0")}
        </motion.span>
        <div className="h-px flex-1 bg-zinc-800 group-hover:bg-accent/30 transition-colors" />
      </div>
      <h3 className="font-mono font-semibold text-lg mb-2">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ComparisonRow({
  feature,
  terminator,
  playwright,
  others,
}: {
  feature: string;
  terminator: boolean | string;
  playwright: boolean | string;
  others: boolean | string;
}) {
  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-500" />
      ) : (
        <X className="w-5 h-5 text-red-500/70" />
      );
    }
    return <span className="text-zinc-400 text-sm">{value}</span>;
  };

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-900/30">
      <td className="py-4 px-4 text-sm font-medium">{feature}</td>
      <td className="py-4 px-4 text-center">{renderCell(terminator)}</td>
      <td className="py-4 px-4 text-center">{renderCell(playwright)}</td>
      <td className="py-4 px-4 text-center">{renderCell(others)}</td>
    </tr>
  );
}

// Custom hook for section visibility tracking
function useSectionTracking(sectionId: string) {
  const ref = useRef<HTMLElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            trackSectionViewed(sectionId);
            hasTracked.current = true;
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sectionId]);

  return ref;
}

export default function Home() {
  const [waitlistModal, setWaitlistModal] = useState<{
    isOpen: boolean;
    platform: "macos" | "linux";
  }>({ isOpen: false, platform: "macos" });

  // Scroll depth tracking
  const scrollMilestones = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (window.scrollY / scrollHeight) * 100;

      const milestones = [25, 50, 75, 100] as const;
      milestones.forEach((milestone) => {
        if (scrollPercent >= milestone && !scrollMilestones.current.has(milestone)) {
          scrollMilestones.current.add(milestone);
          trackScrollDepth(milestone);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Time on page tracking
  useEffect(() => {
    const timeIntervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const trackedTimes = new Set<number>();
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      timeIntervals.forEach((seconds) => {
        if (elapsedSeconds >= seconds && !trackedTimes.has(seconds)) {
          trackedTimes.add(seconds);
          trackTimeOnPage(seconds);
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Section refs for tracking
  const heroRef = useSectionTracking("hero");
  const platformRef = useSectionTracking("platform_support");
  const actionsRef = useSectionTracking("actions");
  const featuresRef = useSectionTracking("features");
  const docsRef = useSectionTracking("docs");
  const comparisonRef = useSectionTracking("comparison");
  const quickstartRef = useSectionTracking("quickstart");
  const ctaRef = useSectionTracking("cta");

  const openWaitlist = useCallback((platform: "macos" | "linux") => {
    trackWaitlistOpened(platform);
    setWaitlistModal({ isOpen: true, platform });
  }, []);

  // Track comparison section specifically
  const comparisonTracked = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !comparisonTracked.current) {
          trackComparisonViewed();
          comparisonTracked.current = true;
        }
      },
      { threshold: 0.5 }
    );

    const section = document.querySelector("[data-section='comparison']");
    if (section) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen noise-overlay">
      <WaitlistModal
        isOpen={waitlistModal.isOpen}
        platform={waitlistModal.platform}
        onClose={() => setWaitlistModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => {
              trackLogoClicked();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-6 h-6 text-accent" />
            <span className="font-mono font-bold text-lg">terminator</span>
          </button>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              onClick={() => trackNavClicked("features", "nav")}
              className="text-sm text-zinc-400 hover:text-white transition-colors animated-underline"
            >
              Features
            </a>
            <a
              href="#docs"
              onClick={() => trackNavClicked("docs", "nav")}
              className="text-sm text-zinc-400 hover:text-white transition-colors animated-underline"
            >
              Docs
            </a>
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackExternalLinkClicked("https://github.com/mediar-ai/terminator", "github");
                trackCtaClicked("github", "nav");
              }}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 px-6 grid-bg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950" />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-xs font-mono text-zinc-400">
              MIT Licensed • Windows-native
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-mono font-bold tracking-tight mb-6"
          >
            Give AI{" "}
            <span className="gradient-text">hands</span>
            <br />
            to control your desktop
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Open-source desktop automation that works with any Windows application.
            Like Playwright, but for your entire desktop. {">"}95% reliability through
            accessibility APIs, not brittle vision models.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <a
              href="#quickstart"
              onClick={() => {
                trackCtaClicked("get_started", "hero");
                trackNavClicked("quickstart", "inline");
              }}
              className="group flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-black font-mono font-semibold rounded-lg transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackExternalLinkClicked("https://github.com/mediar-ai/terminator", "github");
                trackCtaClicked("view_on_github", "hero");
              }}
              className="flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-mono transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </motion.div>

          {/* Quick install */}
          <motion.div variants={fadeInUp} className="max-w-2xl mx-auto">
            <div className="terminal-box px-4 py-3 flex items-center justify-between gap-4">
              <code className="font-mono text-sm text-zinc-300 overflow-x-auto">
                <span className="text-accent">$</span> claude mcp add terminator &quot;npx -y terminator-mcp-agent@latest&quot;
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('claude mcp add terminator "npx -y terminator-mcp-agent@latest"');
                  trackInstallCopied("hero");
                }}
                className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Platform Support */}
      <section ref={platformRef} className="py-16 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {/* Windows - Supported */}
            <motion.div
              variants={fadeInUp}
              className="relative p-6 border-2 border-accent rounded-lg bg-accent/5"
            >
              <div className="absolute -top-3 left-4 px-2 bg-zinc-950">
                <span className="text-xs font-mono text-accent">SUPPORTED</span>
              </div>
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-accent" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
                <h3 className="font-mono font-semibold text-lg mb-1">Windows</h3>
                <p className="text-zinc-400 text-sm">Full support</p>
              </div>
            </motion.div>

            {/* macOS - Coming Soon */}
            <motion.div
              variants={fadeInUp}
              className="relative p-6 border border-zinc-700 rounded-lg bg-zinc-900/30"
            >
              <div className="absolute -top-3 left-4 px-2 bg-zinc-950">
                <span className="text-xs font-mono text-zinc-500">COMING SOON</span>
              </div>
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <h3 className="font-mono font-semibold text-lg mb-1 text-zinc-400">macOS</h3>
                <p className="text-zinc-500 text-sm mb-3">In development</p>
                <button
                  onClick={() => openWaitlist("macos")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-zinc-600 rounded hover:border-accent hover:text-accent transition-colors"
                >
                  Join waitlist
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>

            {/* Linux - Coming Soon */}
            <motion.div
              variants={fadeInUp}
              className="relative p-6 border border-zinc-700 rounded-lg bg-zinc-900/30"
            >
              <div className="absolute -top-3 left-4 px-2 bg-zinc-950">
                <span className="text-xs font-mono text-zinc-500">COMING SOON</span>
              </div>
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-3 text-zinc-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.117-.468.32-.753.654-.93z"/>
                </svg>
                <h3 className="font-mono font-semibold text-lg mb-1 text-zinc-400">Linux</h3>
                <p className="text-zinc-500 text-sm mb-3">In development</p>
                <button
                  onClick={() => openWaitlist("linux")}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono border border-zinc-600 rounded hover:border-accent hover:text-accent transition-colors"
                >
                  Join waitlist
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What It Does */}
      <section ref={actionsRef} className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={fadeInUp}
              className="text-center p-6 group"
            >
              <motion.h3
                className="font-mono font-bold text-4xl mb-4 text-accent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Click
              </motion.h3>
              <div className="h-0.5 w-12 bg-accent/50 mx-auto mb-4 group-hover:w-24 transition-all duration-300" />
              <p className="text-zinc-400">
                Find and click any UI element by role, name, or text. No XPath.
                No brittle selectors.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-center p-6 group"
            >
              <motion.h3
                className="font-mono font-bold text-4xl mb-4 text-accent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                Type
              </motion.h3>
              <div className="h-0.5 w-12 bg-accent/50 mx-auto mb-4 group-hover:w-24 transition-all duration-300" />
              <p className="text-zinc-400">
                Input text into any field. Handles focus, clearing, and special
                keys automatically.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="text-center p-6 group"
            >
              <motion.h3
                className="font-mono font-bold text-4xl mb-4 text-accent"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                See
              </motion.h3>
              <div className="h-0.5 w-12 bg-accent/50 mx-auto mb-4 group-hover:w-24 transition-all duration-300" />
              <p className="text-zinc-400">
                Capture screenshots, read UI trees, OCR text, or use AI vision
                for complex elements.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section ref={featuresRef} id="features" className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4">
              Built for reliability
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Deterministic automation through Windows accessibility APIs. Falls
              back to AI vision only when needed.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <FeatureCard
              index={1}
              title="TypeScript SDK"
              description="Full-featured Desktop class with 60+ methods. Type-safe, async/await, fluent API."
            />
            <FeatureCard
              index={2}
              title="MCP Server"
              description="35 tools for Claude, Cursor, and VS Code. AI assistants can control any app."
            />
            <FeatureCard
              index={3}
              title="Smart Selectors"
              description="role:Button && name:Submit — intuitive selector syntax that just works."
            />
            <FeatureCard
              index={4}
              title="Cross-App"
              description="Not just browsers. Automate Notepad, Excel, SAP, legacy apps — anything with a UI."
            />
            <FeatureCard
              index={5}
              title="100x Faster"
              description="Pre-recorded workflows run instantly. No AI latency for deterministic paths."
            />
            <FeatureCard
              index={6}
              title="AI Recovery"
              description="When the unexpected happens, Gemini vision kicks in to handle dynamic UIs."
            />
          </motion.div>
        </div>
      </section>

      {/* Code Examples */}
      <section ref={docsRef} id="docs" className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4">
              Simple, powerful API
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Playwright-style API that works on any Windows application.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid lg:grid-cols-2 gap-8"
          >
            <motion.div variants={fadeInUp}>
              <h3 className="font-mono text-lg font-semibold mb-4 text-zinc-300">
                TypeScript SDK
              </h3>
              <CodeBlock
                section="docs_typescript_sdk"
                code={`import { Desktop } from '@mediar-ai/terminator';

const desktop = new Desktop();

// Open Notepad and type
await desktop.openApplication('notepad');
const editor = await desktop
  .locator('role:Edit')
  .first();
await editor.typeText('Hello from Terminator!');

// Click a button
const saveBtn = await desktop
  .locator('role:Button && name:Save')
  .first();
await saveBtn.click();`}
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-mono text-lg font-semibold mb-4 text-zinc-300">
                MCP for Claude
              </h3>
              <CodeBlock
                section="docs_mcp_config"
                language="json"
                code={`{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}

// Claude can now use tools like:
// - click_element
// - type_into_element
// - get_window_tree
// - capture_screenshot
// ... and 30 more`}
              />
            </motion.div>
          </motion.div>

          {/* Selector examples */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mt-12"
          >
            <h3 className="font-mono text-lg font-semibold mb-4 text-zinc-300">
              Selector Cheatsheet
            </h3>
            <div className="terminal-box p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 font-mono text-zinc-400">
                      Selector
                    </th>
                    <th className="text-left py-2 font-mono text-zinc-400">
                      Finds
                    </th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-accent">role:Button</td>
                    <td className="py-2 text-zinc-300">Any button</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-accent">name:Submit</td>
                    <td className="py-2 text-zinc-300">Element named "Submit"</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-accent">
                      role:TextBox && name:Email
                    </td>
                    <td className="py-2 text-zinc-300">Email input field</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 text-accent">text:Click me</td>
                    <td className="py-2 text-zinc-300">Element with text</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-accent">
                      window:Notepad {">>"} role:Edit
                    </td>
                    <td className="py-2 text-zinc-300">Editor in Notepad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section ref={comparisonRef} data-section="comparison" className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4">
              Why Terminator?
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Desktop automation that actually works.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="terminal-box overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700 bg-zinc-900/50">
                  <th className="py-4 px-4 text-left font-mono text-sm text-zinc-400">
                    Feature
                  </th>
                  <th className="py-4 px-4 text-center font-mono text-sm text-accent">
                    Terminator
                  </th>
                  <th className="py-4 px-4 text-center font-mono text-sm text-zinc-400">
                    Playwright
                  </th>
                  <th className="py-4 px-4 text-center font-mono text-sm text-zinc-400">
                    Vision AI
                  </th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow
                  feature="Desktop apps"
                  terminator={true}
                  playwright={false}
                  others={true}
                />
                <ComparisonRow
                  feature="Browser automation"
                  terminator={true}
                  playwright={true}
                  others={true}
                />
                <ComparisonRow
                  feature="Reliability"
                  terminator=">95%"
                  playwright=">99%"
                  others="~70%"
                />
                <ComparisonRow
                  feature="Speed"
                  terminator="Fast"
                  playwright="Fast"
                  others="Slow"
                />
                <ComparisonRow
                  feature="MCP support"
                  terminator={true}
                  playwright={false}
                  others="Varies"
                />
                <ComparisonRow
                  feature="Open source"
                  terminator={true}
                  playwright={true}
                  others="Varies"
                />
                <ComparisonRow
                  feature="Session reuse"
                  terminator={true}
                  playwright={false}
                  others={true}
                />
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* Quick Start */}
      <section
        ref={quickstartRef}
        id="quickstart"
        className="py-20 px-6 border-t border-zinc-800 bg-gradient-to-b from-zinc-900/50 to-transparent"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="font-mono text-3xl md:text-4xl font-bold mb-4">
              Get started in 60 seconds
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-mono flex items-center justify-center">
                  1
                </span>
                <span className="font-mono text-zinc-300">Add MCP to Claude Code</span>
              </div>
              <CodeBlock
                section="quickstart_step1"
                code='claude mcp add terminator "npx -y terminator-mcp-agent@latest"'
                language="bash"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-mono flex items-center justify-center">
                  2
                </span>
                <span className="font-mono text-zinc-300">Or use the TypeScript SDK</span>
              </div>
              <CodeBlock
                section="quickstart_step2"
                code="npm install @mediar-ai/terminator"
                language="bash"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-mono flex items-center justify-center">
                  3
                </span>
                <span className="font-mono text-zinc-300">Start automating</span>
              </div>
              <CodeBlock
                section="quickstart_step3"
                code={`import { Desktop } from '@mediar-ai/terminator';
const desktop = new Desktop();
await desktop.openApplication('notepad');`}
                language="typescript"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} className="py-20 px-6 border-t border-zinc-800">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-mono text-3xl md:text-4xl font-bold mb-6">
            Ready to automate?
          </h2>
          <p className="text-zinc-400 mb-8 text-lg">
            Join thousands of developers using Terminator to give AI hands.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackExternalLinkClicked("https://github.com/mediar-ai/terminator", "github");
                trackCtaClicked("star_on_github", "cta_section");
              }}
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-mono font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </a>
            <a
              href="https://discord.gg/mediar"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackExternalLinkClicked("https://discord.gg/mediar", "discord");
                trackCtaClicked("join_discord", "cta_section");
              }}
              className="flex items-center gap-2 px-8 py-4 border border-zinc-700 hover:border-zinc-500 rounded-lg font-mono transition-colors"
            >
              Join Discord
            </a>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-accent" />
            <span className="font-mono font-semibold">terminator</span>
            <span className="text-zinc-500 text-sm">by Mediar AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a
              href="https://github.com/mediar-ai/terminator"
              onClick={() => trackExternalLinkClicked("https://github.com/mediar-ai/terminator", "github")}
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@mediar-ai/terminator"
              onClick={() => trackExternalLinkClicked("https://www.npmjs.com/package/@mediar-ai/terminator", "npm")}
              className="hover:text-white transition-colors"
            >
              npm
            </a>
            <a
              href="https://pypi.org/project/terminator/"
              onClick={() => trackExternalLinkClicked("https://pypi.org/project/terminator/", "pypi")}
              className="hover:text-white transition-colors"
            >
              PyPI
            </a>
            <a
              href="https://mediar.ai"
              onClick={() => trackExternalLinkClicked("https://mediar.ai", "mediar")}
              className="hover:text-white transition-colors"
            >
              mediar.ai
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
