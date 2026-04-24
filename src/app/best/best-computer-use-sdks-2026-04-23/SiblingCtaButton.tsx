"use client";

import { trackCrossProductClick } from "@seo/components";

interface SiblingCtaButtonProps {
  slug: string;
  destination: string;
  text: string;
  section: string;
}

export function SiblingCtaButton({
  slug,
  destination,
  text,
  section,
}: SiblingCtaButtonProps) {
  return (
    <a
      href={destination}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackCrossProductClick({
          site: "terminator",
          targetProduct: slug,
          destination,
          text,
          component: "CrossRoundupEntry",
          section,
        })
      }
      className="inline-flex items-center justify-center rounded-xl border border-orange-300 bg-orange-50 px-5 py-2.5 text-orange-700 font-medium hover:bg-orange-100 transition-colors"
    >
      {text} →
    </a>
  );
}
