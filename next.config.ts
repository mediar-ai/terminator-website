import type { NextConfig } from "next";
import { withSeoContent } from "@seo/components/next";

const nextConfig: NextConfig = {
  transpilePackages: ["@seo/components", "@m13v/seo-components"],
  async redirects() {
    return [
      {
        source: "/t/desktop-automation-accessibility-tree",
        destination: "/t/why-accessibility-apis-beat-ocr-and-pixel-matching",
        permanent: true,
      },
      {
        source: "/alternative/accessibility-tree-vs-pixel-desktop-control",
        destination: "/alternative/accessibility-tree-vs-pixel-computer-use",
        permanent: true,
      },
      {
        source: "/alternative/accessibility-apis-vs-computer-use",
        destination: "/alternative/accessibility-tree-vs-pixel-computer-use",
        permanent: true,
      },
      {
        source: "/alternative/accessibility-apis-vs-pixel-computer-use",
        destination: "/alternative/accessibility-tree-vs-pixel-computer-use",
        permanent: true,
      },
      {
        source: "/alternative/computer-use-accessibility-vs-screenshot",
        destination: "/alternative/accessibility-tree-vs-pixel-computer-use",
        permanent: true,
      },
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
      {
        source: "/t/accessibility-crate-rust-macos-axuielement",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/docs-rs-accessibility-crate-macos-axuielement",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/accessibility-crate-axuielement-rust",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/axuielement-system-wide-rust",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/axuielement-system-wide-rust-accessibility",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/rust-crate-accessibility-axuielement",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/accessibility-crate-rust-axuielement",
        destination: "/t/axuielement-system-wide-accessibility-crate-rust",
        permanent: true,
      },
      {
        source: "/t/macos-accessibility-automation-api",
        destination: "/t/macos-accessibility-ui-tree",
        permanent: true,
      },
      {
        source: "/t/browser-automation-outside-tab",
        destination: "/t/browser-automation-os-level-ceiling",
        permanent: true,
      },
    ];
  },
};

export default withSeoContent(nextConfig, { contentDir: "src/app/(content)/t" });
