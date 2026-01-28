"use client";

import { motion } from "framer-motion";
import {
  Terminal,
  Zap,
  Eye,
  MousePointer2,
  Code2,
  Cpu,
  Github,
  ArrowRight,
  Check,
  Copy,
  Monitor,
  Bot,
  Layers,
} from "lucide-react";
import { useState } from "react";

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
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
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
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group p-6 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all duration-300 hover:bg-zinc-900/50"
    >
      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-accent transition-colors" />
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
        <span className="text-zinc-600">—</span>
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

export default function Home() {
  return (
    <main className="min-h-screen noise-overlay">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-accent" />
            <span className="font-mono font-bold text-lg">terminator</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-zinc-400 hover:text-white transition-colors animated-underline"
            >
              Features
            </a>
            <a
              href="#docs"
              className="text-sm text-zinc-400 hover:text-white transition-colors animated-underline"
            >
              Docs
            </a>
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 grid-bg">
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
              className="group flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-black font-mono font-semibold rounded-lg transition-all"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://github.com/mediar-ai/terminator"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 border border-zinc-700 hover:border-zinc-500 rounded-lg font-mono transition-colors"
            >
              <Github className="w-4 h-4" />
              View on GitHub
            </a>
          </motion.div>

          {/* Quick install */}
          <motion.div variants={fadeInUp} className="max-w-md mx-auto">
            <div className="terminal-box px-4 py-3 flex items-center justify-between">
              <code className="font-mono text-sm text-zinc-300">
                <span className="text-accent">$</span> npx @mediar-ai/cli --help
              </code>
              <button
                onClick={() =>
                  navigator.clipboard.writeText("npx @mediar-ai/cli --help")
                }
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* What It Does */}
      <section className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center mx-auto mb-4">
                <MousePointer2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-mono font-semibold text-xl mb-2">Click</h3>
              <p className="text-zinc-400">
                Find and click any UI element by role, name, or text. No XPath.
                No brittle selectors.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center mx-auto mb-4">
                <Code2 className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-mono font-semibold text-xl mb-2">Type</h3>
              <p className="text-zinc-400">
                Input text into any field. Handles focus, clearing, and special
                keys automatically.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-transparent flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-mono font-semibold text-xl mb-2">See</h3>
              <p className="text-zinc-400">
                Capture screenshots, read UI trees, OCR text, or use AI vision
                for complex elements.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 border-t border-zinc-800">
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
              icon={Terminal}
              title="TypeScript SDK"
              description="Full-featured Desktop class with 60+ methods. Type-safe, async/await, fluent API."
            />
            <FeatureCard
              icon={Bot}
              title="MCP Server"
              description="35 tools for Claude, Cursor, and VS Code. AI assistants can control any app."
            />
            <FeatureCard
              icon={Layers}
              title="Smart Selectors"
              description="role:Button && name:Submit — intuitive selector syntax that just works."
            />
            <FeatureCard
              icon={Monitor}
              title="Cross-App"
              description="Not just browsers. Automate Notepad, Excel, SAP, legacy apps — anything with a UI."
            />
            <FeatureCard
              icon={Zap}
              title="100x Faster"
              description="Pre-recorded workflows run instantly. No AI latency for deterministic paths."
            />
            <FeatureCard
              icon={Cpu}
              title="AI Recovery"
              description="When the unexpected happens, Gemini vision kicks in to handle dynamic UIs."
            />
          </motion.div>
        </div>
      </section>

      {/* Code Examples */}
      <section id="docs" className="py-20 px-6 border-t border-zinc-800">
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
                language="json"
                code={`{
  "mcpServers": {
    "terminator": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent"]
    }
  }
}

// Claude can now use tools like:
// - click_element
// - type_into_element
// - get_window_tree
// - capture_screenshot
// - execute_browser_script
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
      <section className="py-20 px-6 border-t border-zinc-800">
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
                <span className="font-mono text-zinc-300">Run without install</span>
              </div>
              <CodeBlock code="npx @mediar-ai/cli --help" language="bash" />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-mono flex items-center justify-center">
                  2
                </span>
                <span className="font-mono text-zinc-300">Or install globally</span>
              </div>
              <CodeBlock code="npm i -g @mediar-ai/cli" language="bash" />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-sm font-mono flex items-center justify-center">
                  3
                </span>
                <span className="font-mono text-zinc-300">Add to Claude Code</span>
              </div>
              <CodeBlock
                code="claude mcp add terminator -- npx -y terminator-mcp-agent"
                language="bash"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 border-t border-zinc-800">
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
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-mono font-semibold rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Github className="w-5 h-5" />
              Star on GitHub
            </a>
            <a
              href="https://discord.gg/mediar"
              target="_blank"
              rel="noopener noreferrer"
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
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/@mediar-ai/terminator"
              className="hover:text-white transition-colors"
            >
              npm
            </a>
            <a
              href="https://pypi.org/project/terminator/"
              className="hover:text-white transition-colors"
            >
              PyPI
            </a>
            <a href="https://mediar.ai" className="hover:text-white transition-colors">
              mediar.ai
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
