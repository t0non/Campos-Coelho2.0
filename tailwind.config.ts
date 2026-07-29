import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          background: "var(--color-background)",
          foreground: "var(--color-foreground)",
          primary: "var(--color-primary)",
          primaryHover: "var(--color-primary-hover)",
          secondary: "var(--color-secondary)",
          muted: "var(--color-muted)",
          border: "var(--color-border)",
          surface: "var(--color-surface)",
          darkSurface: "var(--color-dark-surface)",
          heading: "var(--color-heading)",
          bodyText: "var(--color-body-text)",
          champagne: "#FBEDDF",
          champagneLight: "#FBEDDF",
          cream: "#FBEDDF",
          dark: "#2B231B",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        marquee: "marquee 40s linear infinite",
        "marquee-reverse": "marquee-reverse 40s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
