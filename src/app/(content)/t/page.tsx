import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs, breadcrumbListSchema } from "@seo/components";
import { discoverGuides } from "@seo/components/server";

const SITE = "https://t8r.tech";

export const metadata: Metadata = {
  title: "Guides | Terminator",
  description:
    "Guides on Windows desktop automation, accessibility-tree control, UI automation, and AI agents that drive real apps.",
  alternates: { canonical: `${SITE}/t` },
};

export default function GuidesIndex() {
  const guides = discoverGuides();
  const jsonLd = breadcrumbListSchema([
    { name: "Home", url: SITE },
    { name: "Guides", url: `${SITE}/t` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Guides" }]}
          className="mb-8"
        />
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          Guides
        </h1>
        <p className="text-zinc-600 mb-10">
          Guides on Windows desktop automation, accessibility-tree control, UI
          automation, and AI agents that drive real apps.
        </p>
        <ul className="divide-y divide-zinc-200 border-y border-zinc-200">
          {guides.map((g) => (
            <li key={g.slug} className="py-5">
              <Link href={g.href} className="group block">
                <h2 className="text-lg font-semibold text-zinc-900 group-hover:underline">
                  {g.title}
                </h2>
                {g.description && (
                  <p className="mt-1 text-zinc-600">{g.description}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
