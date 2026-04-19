"use client";

import { usePathname } from "next/navigation";
import { SitemapSidebar } from "@seo/components";

interface Props {
  pages: {
    href: string;
    title: string;
    description: string;
    datePublished?: string;
    sections: { id: string; title: string }[];
    category: string;
  }[];
}

export function SitemapSidebarWrapper({ pages }: Props) {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/lander") return null;

  return (
    <SitemapSidebar
      pages={pages}
      brandName="terminator"
      homeHref="/"
    />
  );
}
