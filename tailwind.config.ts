import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        colors: {
          text: {
            50: "#f2f2f2",
            100: "#e6e6e6",
            200: "#cccccc",
            300: "#b3b3b3",
            400: "#999999",
            500: "#808080",
            600: "#666666",
            700: "#4d4d4d",
            800: "#333333",
            900: "#1a1a1a",
            950: "#0d0d0d",
          },
          background: {
            50: "#e6e6e6",
            100: "#cccccc",
            200: "#b3b3b3",
            300: "#999999",
            400: "#808080",
            500: "#666666",
            600: "#4d4d4d",
            700: "#333333",
            800: "#0d0d0d",
            900: "#0A0A0A",
            950: "#080808",
          },
          primary: {
            50: "#f4ecf9",
            100: "#ead8f3",
            200: "#d5b1e7",
            300: "#c08bda",
            400: "#ab64ce",
            500: "#963dc2",
            600: "#78319b",
            700: "#5a2574",
            800: "#3c184e",
            900: "#1e0c27",
            950: "#0f0613",
          },
          secondary: {
            50: "#f3e9fb",
            100: "#e7d3f8",
            200: "#d0a7f1",
            300: "#b87bea",
            400: "#a050e2",
            500: "#8924db",
            600: "#6d1daf",
            700: "#521584",
            800: "#370e58",
            900: "#1b072c",
            950: "#0e0416",
          },
          accent: {
            50: "#ebe8fc",
            100: "#d7d1fa",
            200: "#aea4f4",
            300: "#8676ef",
            400: "#5e48ea",
            500: "#361be4",
            600: "#2b15b7",
            700: "#201089",
            800: "#150b5b",
            900: "#0b052e",
            950: "#050317",
          },
        },

        fontFamily: {
          heading: "IBM Plex Sans Thai Looped",
          body: "Inter",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
