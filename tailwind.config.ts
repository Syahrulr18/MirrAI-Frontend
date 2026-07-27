import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // ─── Colors (from design.md) ────────────────────────────
      colors: {
        primary: "#FFEB3B",
        secondary: "#FF5252",
        tertiary: "#2196F3",
        success: "#00E676",
        warning: "#FFC107",
        neutral: "#1A1A1A",
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#121212",
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#1E1E1E",
        },
        "ai-bubble": {
          DEFAULT: "#F5F5F5",
          dark: "#242424",
        },
      },

      // ─── Typography ─────────────────────────────────────────
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        hero: "clamp(2.5rem, 5vw, 4rem)",
        "display-score": "4rem",
      },
      fontWeight: {
        hero: "800",
      },

      // ─── Spacing ────────────────────────────────────────────
      spacing: {
        "section-gap": "clamp(4rem, 8vw, 8rem)",
        "app-gap": "1.5rem",
      },
      maxWidth: {
        content: "1280px",
      },

      // ─── Shadows (Neubrutalism) ────────────────────────────
      boxShadow: {
        neu: "4px 4px 0 var(--shadow-color, #1A1A1A)",
        "neu-sm": "2px 2px 0 var(--shadow-color, #1A1A1A)",
        "neu-lg": "6px 6px 0 var(--shadow-color, #1A1A1A)",
        "neu-hover": "6px 6px 0 var(--shadow-color, #1A1A1A)",
        "neu-active": "0px 0px 0 var(--shadow-color, #1A1A1A)",
        "neu-none": "0px 0px 0 transparent",
      },

      // ─── Border ─────────────────────────────────────────────
      borderWidth: {
        "3": "3px",
        "4": "4px",
      },
      borderRadius: {
        neu: "8px",
        "neu-lg": "12px",
      },

      // ─── Animations ─────────────────────────────────────────
      keyframes: {
        "hard-drop": {
          "0%": { transform: "translateY(-40px)", opacity: "0" },
          "60%": { transform: "translateY(4px)", opacity: "1" },
          "80%": { transform: "translateY(-2px)" },
          "100%": { transform: "translateY(0)" },
        },
        "shadow-pop": {
          "0%": { boxShadow: "0px 0px 0 var(--shadow-color, #1A1A1A)" },
          "100%": { boxShadow: "4px 4px 0 var(--shadow-color, #1A1A1A)" },
        },
        "shimmer-blocky": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "blocky-bounce": {
          "0%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-4px)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "50%": { transform: "translateX(4px)" },
          "75%": { transform: "translateX(-4px)" },
        },
        "blink-block": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "hard-drop": "hard-drop 900ms ease-out",
        "shadow-pop": "shadow-pop 200ms ease-out forwards",
        "shimmer-blocky": "shimmer-blocky 1.2s infinite linear",
        "blocky-bounce-1": "blocky-bounce 900ms infinite 0ms",
        "blocky-bounce-2": "blocky-bounce 900ms infinite 150ms",
        "blocky-bounce-3": "blocky-bounce 900ms infinite 300ms",
        "fade-in": "fade-in 200ms ease-out",
        "fade-in-up": "fade-in-up 420ms ease-out",
        "scale-in": "scale-in 300ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
        "pulse-ring": "pulse-ring 800ms infinite",
        shake: "shake 400ms ease-out",
        "blink-block-1": "blink-block 1s infinite 0ms",
        "blink-block-2": "blink-block 1s infinite 200ms",
        "blink-block-3": "blink-block 1s infinite 400ms",
      },

      // ─── Z-Index Contract ──────────────────────────────────
      zIndex: {
        "sticky-nav": "100",
        "floating-alert": "150",
        overlay: "200",
        modal: "300",
        toast: "500",
        "camera-prompt": "600",
      },

      // ─── Transitions ───────────────────────────────────────
      transitionDuration: {
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "420": "420ms",
      },
    },
  },
  plugins: [],
};

export default config;
