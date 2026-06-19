import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 20% 84%)",
        input: "hsl(214 20% 84%)",
        ring: "hsl(190 70% 32%)",
        background: "hsl(42 29% 97%)",
        foreground: "hsl(218 26% 13%)",
        primary: {
          DEFAULT: "hsl(190 74% 28%)",
          foreground: "hsl(0 0% 100%)"
        },
        secondary: {
          DEFAULT: "hsl(36 42% 88%)",
          foreground: "hsl(218 26% 13%)"
        },
        muted: {
          DEFAULT: "hsl(204 18% 92%)",
          foreground: "hsl(217 12% 38%)"
        },
        destructive: {
          DEFAULT: "hsl(0 72% 45%)",
          foreground: "hsl(0 0% 100%)"
        },
        accent: {
          DEFAULT: "hsl(145 36% 39%)",
          foreground: "hsl(0 0% 100%)"
        }
      },
      boxShadow: {
        panel: "0 1px 2px hsl(218 26% 13% / 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
