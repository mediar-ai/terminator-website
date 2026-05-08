import { NextRequest } from "next/server";
import { capturePostHogServer } from "@seo/components/server";
import { getSql } from "@/lib/db";

/*
 * Custom newsletter handler for Terminator's emailOnly InstallEmailGate.
 *
 * The shared `createNewsletterHandler` only sends an HTML body to Resend; a
 * Gmail "show original" reveals an empty plain-text part. That bug ate the
 * macos-use rollout once. We send HTML + a real plain-text fallback here so
 * the install command renders correctly in every client and search index.
 *
 * No em or en dashes in any string (UTF-8 corruption in subjects).
 */

const FROM = "Matt from Terminator <matt@t8r.tech>";
const BRAND = "Terminator";
const SITE_URL = "https://t8r.tech";
const GITHUB_URL = "https://github.com/mediar-ai/terminator";
const NPM_URL = "https://www.npmjs.com/package/terminator-mcp-agent";
const CLAUDE_CODE_CMD =
  'claude mcp add terminator "npx -y terminator-mcp-agent@latest"';
const WELCOME_SUBJECT = "Your Terminator install command";
const API_KEY_ENV = "RESEND_API_KEY";

const MCP_JSON = `{
  "mcpServers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`;

// VS Code's MCP host uses `servers` rather than `mcpServers`.
const VSCODE_JSON = `{
  "servers": {
    "terminator-mcp-agent": {
      "command": "npx",
      "args": ["-y", "terminator-mcp-agent@latest"]
    }
  }
}`;

const CONFIG_FILES: ReadonlyArray<{
  client: string;
  path: string;
  config: string;
}> = [
  {
    client: "Claude Desktop",
    path: "~/Library/Application Support/Claude/claude_desktop_config.json (macOS) or %APPDATA%\\Claude\\claude_desktop_config.json (Windows)",
    config: MCP_JSON,
  },
  {
    client: "Cursor",
    path: "~/.cursor/mcp.json",
    config: MCP_JSON,
  },
  {
    client: "VS Code",
    path: "~/Library/Application Support/Code/User/mcp.json (macOS) or %APPDATA%\\Code\\User\\mcp.json (Windows)",
    config: VSCODE_JSON,
  },
  {
    client: "Windsurf",
    path: "~/.codeium/windsurf/mcp_config.json",
    config: MCP_JSON,
  },
];

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function codeBlock(code: string): string {
  return `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;color:#0f172a;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;line-height:1.5;white-space:pre;overflow-x:auto;">${escapeHtml(code)}</div>`;
}

function configRow(client: string, path: string, config: string): string {
  return `
          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              ${escapeHtml(client)}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Edit <code style="background:#f1f5f9;border-radius:4px;padding:1px 5px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;color:#0f172a;">${escapeHtml(path)}</code> and add:
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 18px;">
              ${codeBlock(config)}
            </td>
          </tr>`;
}

function buildWelcomeEmailHtml(): string {
  const configBlocks = CONFIG_FILES.map(({ client, path, config }) =>
    configRow(client, path, config),
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#f97316,#ea580c);"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 0;">
              <span style="font-size:22px;font-weight:bold;color:#0f172a;">${BRAND}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 12px;">
              <h1 style="margin:0;font-size:24px;font-weight:bold;color:#0f172a;line-height:1.3;">
                Your install command
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 18px;color:#475569;font-size:15px;line-height:1.6;">
              Pick your MCP client below. Same npx entry point everywhere; only the config file path changes.
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 8px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Claude Code (one command)
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 6px;color:#64748b;font-size:13px;line-height:1.5;">
              Run once in any terminal:
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              ${codeBlock(CLAUDE_CODE_CMD)}
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 4px;color:#0f172a;font-size:14px;font-weight:600;line-height:1.4;">
              Other MCP clients (paste JSON)
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px;color:#64748b;font-size:13px;line-height:1.5;">
              Edit your client&rsquo;s MCP config file, paste the snippet, then restart the app.
            </td>
          </tr>
          ${configBlocks}

          <tr>
            <td style="padding:4px 32px 18px;color:#64748b;font-size:13px;line-height:1.6;">
              Terminator drives Windows apps via UI Automation and macOS apps via the Accessibility API. The first run prompts for Accessibility permission on whichever app hosts your MCP client (Claude Desktop, Cursor, etc.). Revoke it any time from System Settings.
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 24px;">
              <a href="${GITHUB_URL}" style="display:inline-block;padding:11px 20px;background-color:#0f172a;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;">
                View source on GitHub
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 32px;color:#64748b;font-size:13px;line-height:1.6;">
              Hit a snag or want a feature? Just reply to this email, it goes straight to me.
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#94a3b8;font-size:12px;line-height:1.5;">
              You&rsquo;re receiving this because you signed up at <a href="${SITE_URL}" style="color:#ea580c;text-decoration:none;">t8r.tech</a>. Open source under <a href="${GITHUB_URL}" style="color:#ea580c;text-decoration:none;">mediar-ai/terminator</a>. npm: <a href="${NPM_URL}" style="color:#ea580c;text-decoration:none;">terminator-mcp-agent</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildWelcomeEmailText(): string {
  const lines: string[] = [];
  lines.push(`${BRAND} install command`);
  lines.push("");
  lines.push(
    "Pick your MCP client. Same npx entry point everywhere; only the config file path changes.",
  );
  lines.push("");
  lines.push("Claude Code (one command):");
  lines.push("");
  lines.push(`  ${CLAUDE_CODE_CMD}`);
  lines.push("");
  lines.push("Other MCP clients (paste JSON):");
  lines.push("");
  for (const { client, path, config } of CONFIG_FILES) {
    lines.push(`${client}`);
    lines.push(`  config file: ${path}`);
    lines.push("");
    for (const row of config.split("\n")) {
      lines.push(`  ${row}`);
    }
    lines.push("");
  }
  lines.push(
    "Terminator drives Windows apps via UI Automation and macOS apps via the Accessibility API. First run prompts for Accessibility permission on whichever app hosts your MCP client (Claude Desktop, Cursor, etc.). Revoke any time from System Settings.",
  );
  lines.push("");
  lines.push(`Source: ${GITHUB_URL}`);
  lines.push(`npm:    ${NPM_URL}`);
  lines.push(`Site:   ${SITE_URL}`);
  lines.push("");
  lines.push("Reply to this email if anything breaks. It goes straight to me.");
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env[API_KEY_ENV];
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return new Response(
      JSON.stringify({ error: "A valid email address is required" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  // 1. Add contact to Resend audience (idempotent upsert)
  const audienceId = process.env.RESEND_AUDIENCE_ID || "";
  if (audienceId) {
    const contactRes = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, unsubscribed: false }),
      },
    );
    if (!contactRes.ok) {
      const detail = await contactRes.text().catch(() => "");
      console.warn(
        "[newsletter] add contact non-OK:",
        contactRes.status,
        detail,
      );
      // non-fatal; still send the welcome email
    }
  }

  // 2. Send welcome email with BOTH html and text MIME parts
  const html = buildWelcomeEmailHtml();
  const text = buildWelcomeEmailText();

  let resendEmailId: string | null = null;
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: WELCOME_SUBJECT,
      html,
      text,
    }),
  });

  if (emailRes.ok) {
    const data = await emailRes.json().catch(() => ({}));
    resendEmailId = data.id || null;
  } else {
    const detail = await emailRes.text().catch(() => "");
    console.error("[newsletter] Failed to send welcome email:", detail);
    return new Response(
      JSON.stringify({ error: "Failed to send install email. Try again." }),
      { status: 502, headers: { "content-type": "application/json" } },
    );
  }

  // 3. Log to terminator_emails (mirrors macos_use_emails schema).
  if (resendEmailId) {
    try {
      const sql = getSql();
      await sql`
        INSERT INTO terminator_emails (resend_id, direction, from_email, to_email, subject, status)
        VALUES (${resendEmailId}, 'outbound', 'matt@t8r.tech', ${email}, ${WELCOME_SUBJECT}, 'sent')
        ON CONFLICT (resend_id) DO NOTHING
      `;
    } catch (err) {
      console.error("[newsletter] DB log error:", err);
      // non-fatal; the email was sent
    }
  }

  // 4. Server-side PostHog capture (ground truth, not ad-blocked).
  let host: string | undefined;
  try {
    host = req.headers.get("host") || "t8r.tech";
  } catch {
    host = "t8r.tech";
  }
  void capturePostHogServer({
    event: "newsletter_subscribed_server",
    distinctId: email,
    host,
    properties: {
      email,
      site: "terminator",
      brand: BRAND,
      resend_email_id: resendEmailId,
      component: "terminator/api/newsletter",
    },
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
