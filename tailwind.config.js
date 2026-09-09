/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefdf6",
          100: "#d7f9e8",
          200: "#b2f0d3",
          300: "#7de3b8",
          400: "#43cd99",
          500: "#1fb280",
          600: "#128f68",
          700: "#0f7256",
          800: "#105a46",
          900: "#0f4a3b",
          950: "#062a21",
        },
        ocean: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec5ff",
          400: "#59a5ff",
          500: "#3282fa",
          600: "#1c63ef",
          700: "#194ddb",
          800: "#1a3fb1",
          900: "#1a3a8b",
          950: "#142455",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(15, 74, 59, 0.12), 0 1px 3px -1px rgba(15,74,59,0.08)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: 0, transform: "translateX(12px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        "slide-in-right": "slide-in-right 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
