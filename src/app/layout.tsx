import type { Metadata } from "next";
import "./globals.css";
import { HeadingAnchors, NewsletterSignup, FounderChatPanel } from "@seo/components";
import { PostHogProvider } from "@/components/PostHogProvider";
import { SiteSidebar } from "@/components/site-sidebar";
import { GuideChat } from "@/components/guide-chat";

export const metadata: Metadata = {
  metadataBase: new URL("https://t8r.tech"),
  title: "Terminator: Playwright for your entire desktop",
  description:
    "Open-source desktop automation framework. Drives Windows apps through native accessibility APIs, not OCR or pixel matching. Playwright-style SDK plus an MCP server for Claude, Cursor, and VS Code. A saner alternative to PyAutoGUI, AutoHotkey, and UIAutomation.",
  keywords: [
    "desktop automation framework",
    "Playwright for desktop",
    "PyAutoGUI alternative",
    "AutoHotkey alternative",
    "UIAutomation framework",
    "Windows accessibility API automation",
    "MCP server desktop control",
    "computer use agent",
    "Claude desktop automation",
    "Cursor MCP desktop",
    "UI automation SDK",
    "Rust desktop automation",
  ],
  authors: [{ name: "Mediar AI" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Terminator: Playwright for your entire desktop",
    description:
      "Open-source desktop automation that drives any Windows app through native accessibility APIs. Playwright-style SDK, Rust core, MCP server for Claude, Cursor, and VS Code.",
    url: "https://t8r.tech",
    siteName: "Terminator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator: Playwright for your entire desktop",
    description:
      "Open-source desktop automation framework. Accessibility APIs, not OCR. Playwright-style SDK plus an MCP server for Claude, Cursor, and VS Code.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <PostHogProvider>
          <div className="flex min-h-screen">
            <SiteSidebar />
            <main className="flex-1 min-w-0">
              <HeadingAnchors />
              {children}
            </main>
            <GuideChat />
          </div>
          <NewsletterSignup />
          <FounderChatPanel project="Terminator" />
        </PostHogProvider>
      </body>
    </html>
  );
}
