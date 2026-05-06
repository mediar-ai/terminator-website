import { createNewsletterHandler } from "@seo/components/server";
import { getSql } from "@/lib/db";

export const POST = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: "Matt from Terminator <matt@t8r.tech>",
  brand: "Terminator",
  siteUrl: "https://t8r.tech",
  onSignup: async (email, resendEmailId) => {
    if (!resendEmailId) return;
    try {
      const sql = getSql();
      await sql`
        INSERT INTO terminator_emails (resend_id, direction, from_email, to_email, subject, status)
        VALUES (${resendEmailId}, 'outbound', 'matt@t8r.tech', ${email}, 'Welcome email', 'sent')
        ON CONFLICT (resend_id) DO NOTHING
      `;
    } catch (err) {
      console.error("newsletter log error:", err);
    }
  },
});
