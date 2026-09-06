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
      /**
       * A named type scale so hierarchy is a class name, not a text
       * size picked freehand per component. Pairs with font-display
       * (Caslon, for display/h1/h2/price) or the default font-sans
       * (Plex Sans, for h3 down through caption). "price" is set apart
       * from h1/h2 on purpose: a price is not a heading, it needs to
       * win the eye first on a card or a detail page regardless of
       * what heading happens to sit near it.
       *
       *   display  hero-level statements, used sparingly, rarely more
       *            than once per screen
       *   h1       page and section titles
       *   h2       subsection titles, card group headings
       *   h3       card titles, list item titles
       *   body     default reading text
       *   body-sm  secondary reading text, card metadata rows
       *   caption  fine print, helper text, form hints
       *   label    all caps micro labels (eyebrows, tab labels, badges)
       *   price    the one number every listing card and detail page
       *            needs to win the eye first
       */
      fontSize: {
        display: ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        h1: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.005em" }],
        h2: ["1.375rem", { lineHeight: "1.3" }],
        h3: ["1.0625rem", { lineHeight: "1.4" }],
        body: ["0.9375rem", { lineHeight: "1.6" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.55" }],
        caption: ["0.75rem", { lineHeight: "1.4" }],
        label: ["0.6875rem", { lineHeight: "1.2", letterSpacing: "0.07em" }],
        price: ["1.375rem", { lineHeight: "1.2" }],
        "price-lg": ["1.875rem", { lineHeight: "1.15" }],
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
