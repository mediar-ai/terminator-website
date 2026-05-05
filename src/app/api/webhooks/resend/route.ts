import { createResendInboundHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export const POST = createResendInboundHandler({
  domain: "t8r.tech",
  brand: "Terminator",
  forwardFrom: "Terminator Inbound <matt@t8r.tech>",
  forwardTo: process.env.TERMINATOR_INBOX_FORWARD || "i@m13v.com",
  onInbound: async (rec) => {
    const sql = getSql();
    await sql`
      INSERT INTO terminator_emails (resend_id, direction, from_email, to_email, subject, body_text, body_html, status)
      VALUES (${rec.resendId}, 'inbound', ${rec.fromEmail}, ${rec.toEmail}, ${rec.subject}, ${rec.bodyText}, ${rec.bodyHtml}, 'received')
      ON CONFLICT (resend_id) DO NOTHING
    `;
  },
  onDeliveryEvent: async ({ status, resendId, timestamp, type }) => {
    const sql = getSql();
    if (type === "email.opened") {
      await sql`UPDATE terminator_emails SET status = ${status}, opened_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.clicked") {
      await sql`UPDATE terminator_emails SET status = ${status}, clicked_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else if (type === "email.delivered") {
      await sql`UPDATE terminator_emails SET status = ${status}, delivered_at = ${timestamp} WHERE resend_id = ${resendId}`;
    } else {
      await sql`UPDATE terminator_emails SET status = ${status} WHERE resend_id = ${resendId}`;
    }
  },
});

export async function GET() {
  return Response.json({ status: "ok" });
}
