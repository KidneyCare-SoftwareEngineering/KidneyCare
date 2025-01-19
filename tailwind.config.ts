import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize:{
        heading4: "20px",
        body1: "16px",
        body2: "14px",
        body3: "12px",
      },
      colors: {
        background: "#FAF5EF",
        foreground: "var(--foreground)",
        searchcalories: "#BD4B04",
        orange300: "#FF7E2E",
        orange400: "#CD6525",
        grey300: "#999999"
      },
    },
  },
  plugins: [],
} satisfies Config;
