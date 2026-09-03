import type { Config } from "tailwindcss";

/**
 * Design tokens mirror styles/tokens.css and the design blueprint
 * (docs/architecture/design-blueprint.md) and the published style
 * guide. Do not add ad hoc hex values in component files, extend
 * this file instead so the token source stays single.
 *
 * Two radii exist in this system: sm for controls, DEFAULT for
 * surfaces. Two shadow tokens exist: float and modal, used only for
 * elements that actually float above the page. A resting card,
 * table, or section is defined by a line color border, never shadow.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F1E6",
        parchment: "#FBF7EE",
        "paper-deep": "#EFE6D3",
        ink: {
          DEFAULT: "#2B2016",
          soft: "#55483A",
        },
        bark: {
          DEFAULT: "#7C6248",
        },
        clay: "#A0937C",
        patina: {
          DEFAULT: "#8A5A2B",
          deep: "#6E4620",
        },
        line: {
          DEFAULT: "#E2D5BE",
          strong: "#CDBA9B",
        },
        verified: { DEFAULT: "#3E5C3E", bg: "#E2E8DD" },
        pending: { DEFAULT: "#A97A22", bg: "#F1E4C6" },
        danger: { DEFAULT: "#9C4331", bg: "#F0DCD3" },
        neutral: { DEFAULT: "#8A7F6C", bg: "#EAE2D0" },
      },
      fontFamily: {
        display: ["var(--font-caslon)", "Georgia", "serif"],
        sans: ["var(--font-plex-sans)", "-apple-system", "sans-serif"],
        mono: ["var(--font-plex-mono)", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
      },
      boxShadow: {
        float: "0 8px 24px rgba(43,32,22,0.12)",
        modal: "0 16px 48px rgba(43,32,22,0.18)",
      },
      spacing: {
        18: "72px",
      },
    },
  },
  plugins: [],
};

export default config;
