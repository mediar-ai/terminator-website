import { createNewsletterHandler } from "@seo/components/server";

export const POST = createNewsletterHandler({
  audienceId: process.env.RESEND_AUDIENCE_ID || "",
  fromEmail: "Matt from Terminator <matt@t8r.tech>",
  brand: "Terminator",
  siteUrl: "https://t8r.tech",
});
