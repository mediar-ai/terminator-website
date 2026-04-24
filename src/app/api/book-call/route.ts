import { createBookCallHandler } from "@seo/components/server";

export const POST = createBookCallHandler({
  site: "terminator",
  // Same audience as /api/newsletter — one Resend audience per client.
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: "Matt from Terminator <matt@t8r.tech>",
  brand: "Terminator",
  siteUrl: "https://t8r.tech",
  redirectBaseUrl: "https://t8r.tech/go/book",
});
