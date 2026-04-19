import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@seo/components/src/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@m13v/seo-components/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["JetBrains Mono", "SF Mono", "Monaco", "Consolas", "monospace"],
        sans: ["Satoshi", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: {
          DEFAULT: "#FF3E00",
          hover: "#FF5722",
        },
        muted: {
          DEFAULT: "#71717A",
          foreground: "#A1A1AA",
        },
        // Remap the default Tailwind `teal`/`cyan` palettes to Terminator
        // orange so library components (@m13v/seo-components) that hardcode
        // `bg-teal-500`, `text-teal-600`, etc render in the brand color
        // without patching every component. Kept side-by-side with the
        // --seo-accent CSS vars used by library components that support
        // arbitrary-value overrides.
        teal: {
          50:  "#FFF4ED",
          100: "#FFE4D1",
          200: "#FFC3A3",
          300: "#FF9F73",
          400: "#FF7A42",
          500: "#FF5722",
          600: "#FF3E00",
          700: "#CC3200",
          800: "#992500",
          900: "#661900",
          950: "#330C00",
        },
        cyan: {
          50:  "#FFF4ED",
          100: "#FFE4D1",
          200: "#FFC3A3",
          300: "#FF9F73",
          400: "#FF7A42",
          500: "#FF5722",
          600: "#FF3E00",
          700: "#CC3200",
          800: "#992500",
          900: "#661900",
          950: "#330C00",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "cursor-blink": "cursorBlink 1s step-end infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        cursorBlink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
