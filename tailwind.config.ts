import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#e8edf5",
          100: "#c5d0e6",
          200: "#9fb1d4",
          300: "#7892c2",
          400: "#5a7ab5",
          500: "#3c62a8",
          600: "#1a3a6b",
          700: "#142f58",
          800: "#0e2445",
          900: "#081830",
          950: "#04101f",
        },
        gold: {
          300: "#f5d98a",
          400: "#f0c94d",
          500: "#d4a017",
          600: "#b8860b",
          700: "#9a6f08",
        },
        crown: {
          navy:  "#1a3a6b",
          gold:  "#d4a017",
          green: "#16a34a",
          white: "#ffffff",
          light: "#f8f9fc",
          gray:  "#f1f5f9",
          muted: "#64748b",
        },
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        premium:    "0 4px 24px 0 rgba(26,58,107,0.10)",
        "premium-lg":"0 8px 48px 0 rgba(26,58,107,0.16)",
        gold:       "0 4px 24px 0 rgba(212,160,23,0.20)",
        "gold-lg":  "0 8px 40px 0 rgba(212,160,23,0.30)",
      },
      animation: {
        "fade-in":  "fadeIn 0.6s ease-out both",
        "slide-up": "slideUp 0.6s ease-out both",
        float:      "float 3s ease-in-out infinite",
        shimmer:    "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
