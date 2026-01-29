"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
  }
}

const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
const SITE_NAME = "terminator.mediar.ai";

export function CrispChat() {
  const pathname = usePathname();

  // Initialize Crisp on mount
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) {
      console.warn("Crisp website ID not configured");
      return;
    }

    // Initialize Crisp
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = CRISP_WEBSITE_ID;

    // Load Crisp script
    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    script.onerror = () => {
      console.warn("Crisp chat failed to load");
    };
    document.head.appendChild(script);

    // Configure Crisp after it loads
    const configInterval = setInterval(() => {
      if (window.$crisp && typeof window.$crisp.push === "function") {
        // Use accent color theme (orange) to match site
        window.$crisp.push(["config", "color:theme", ["orange"]]);

        // Set session data to identify site and page
        window.$crisp.push([
          "set",
          "session:data",
          [
            [
              ["site", SITE_NAME],
              ["page", window.location.pathname],
              ["url", window.location.href],
            ],
          ],
        ]);

        // Show preview message after 15 seconds (once per session)
        window.$crisp.push([
          "on",
          "session:loaded",
          () => {
            if (!sessionStorage.getItem("crisp_preview_shown")) {
              setTimeout(() => {
                window.$crisp.push([
                  "do",
                  "message:show",
                  ["text", "Need help with Terminator? Chat with us!"],
                ]);
                sessionStorage.setItem("crisp_preview_shown", "true");
              }, 15000);
            }
          },
        ]);

        clearInterval(configInterval);
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(configInterval);
    };
  }, []);

  // Update Crisp session data when page changes
  useEffect(() => {
    if (!CRISP_WEBSITE_ID) return;

    if (window.$crisp && typeof window.$crisp.push === "function") {
      window.$crisp.push([
        "set",
        "session:data",
        [
          [
            ["site", SITE_NAME],
            ["page", pathname],
            ["url", window.location.origin + pathname],
          ],
        ],
      ]);
    }
  }, [pathname]);

  // Suppress Crisp errors (Crisp can throw benign errors)
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        event.message?.includes("Invalid data") ||
        event.filename?.includes("crisp")
      ) {
        event.preventDefault();
        return true;
      }
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return null;
}
