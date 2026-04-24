import { SiteNavbar, SiteFooter } from "@seo/components";

const BRAND_LOGO = (
  <span className="font-mono font-bold text-lg">
    <span className="text-[#FF3E00]">&#9656;</span> terminator
  </span>
);

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNavbar
        brandName="terminator"
        brandLogo={BRAND_LOGO}
        ctaLabel="Book a Call"
        ctaHref="https://cal.com/team/mediar/terminator"
        ctaClassName="bg-[#FF3E00] hover:bg-[#CC3200] text-white"
        site="terminator"
      />
      {children}
      <SiteFooter
        brandName="terminator"
        brandLogo={BRAND_LOGO}
        tagline="Desktop automation SDK"
      />
    </>
  );
}
