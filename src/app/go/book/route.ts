import { createBookCallRedirectHandler } from "@seo/components/server";

export const GET = createBookCallRedirectHandler({
  site: "terminator",
  fallbackBookingUrl: "https://cal.com/team/mediar/terminator",
});
