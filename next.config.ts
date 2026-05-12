import type { NextConfig } from "next";
import { withSeoContent } from "@seo/components/next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  async redirects() {
    return [
      {
        source: "/t/automation-test-for-desktop-application",
        destination: "/t/automation-testing-for-desktop-application",
        permanent: true,
      },
      {
        source: "/alternative/accessibility-tree-vs-pyautogui-desktop-automation",
        destination: "/t/accessibility-tree-vs-pyautogui-desktop-automation",
        permanent: true,
      },
      {
        source: "/t/axuielement-system-wide-accessibility-crate",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(content)/t" });
