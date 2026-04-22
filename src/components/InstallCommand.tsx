"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { trackInstallCopied } from "@/lib/analytics";
import { trackGetStartedClick } from "@seo/components";

const DEFAULT_COMMAND =
  'claude mcp add terminator "npx -y terminator-mcp-agent@latest"';

interface InstallCommandProps {
  command?: string;
  label?: string;
  section?: string;
}

export function InstallCommand({
  command = DEFAULT_COMMAND,
  label = "Install the MCP server in Claude Code (also works for Cursor, VS Code, Windsurf via MCP config)",
  section = "article-hero",
}: InstallCommandProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    trackInstallCopied("hero");
    trackGetStartedClick({
      destination: command,
      site: "terminator",
      section,
      text: "install_copy",
      component: "InstallCommand",
      extra: { method: "copy_command" },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-[#0d1117] px-4 py-3 shadow-sm">
        <code className="truncate font-mono text-sm text-zinc-100">
          <span className="text-orange-400">$</span> {command}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Command copied" : "Copy install command"}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-zinc-200 hover:border-orange-400 hover:text-orange-300 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              copy
            </>
          )}
        </button>
      </div>
      <p className="mt-2 text-xs font-mono uppercase tracking-widest text-zinc-500">
        {label}
      </p>
    </div>
  );
}
