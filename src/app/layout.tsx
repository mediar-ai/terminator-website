import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terminator - AI-Native Desktop Automation",
  description:
    "Give AI hands to control any Windows application. Open-source desktop automation with >95% reliability. Like Playwright, but for your entire desktop.",
  keywords: [
    "desktop automation",
    "AI automation",
    "Windows automation",
    "RPA",
    "MCP",
    "Model Context Protocol",
    "computer use",
    "UI automation",
  ],
  authors: [{ name: "Mediar AI" }],
  openGraph: {
    title: "Terminator - AI-Native Desktop Automation",
    description: "Give AI hands to control any Windows application.",
    url: "https://terminator.dev",
    siteName: "Terminator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terminator - AI-Native Desktop Automation",
    description: "Give AI hands to control any Windows application.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
