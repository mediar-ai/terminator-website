import { createGuideChatHandler } from "@seo/components/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = createGuideChatHandler({
  app: "terminator",
  brand: "Terminator",
  siteDescription:
    "AI-native desktop automation. Give AI hands to control any Windows application. Open-source, >95% reliability. Like Playwright, but for your entire desktop.",
  contentDir: "src/app/(content)/t",
});
