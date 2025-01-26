import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontSize:{
        heading3: "24px",
        heading4: "20px",
        body1: "16px",
        body2: "14px",
        body3: "12px",
      },
      colors: {
        background: "#FAF5EF",
        foreground: "var(--foreground)",
        sec: "#FAF5EF",
        searchcalories: "#BD4B04",
        orange300: "#FF7E2E",
        orange400: "#CD6525",
        grey300: "#999999"
      },
      
      fontFamily: {
        sans: ['Sarabun', 'sans-serif'], // เพิ่มฟอนต์ Sarabun
      },
      
    },
  },
  plugins: [],
} satisfies Config;
