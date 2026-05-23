/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette derived from the System Report (navy headers + teal accents).
        brand: {
          50: "#eef3f9",
          100: "#d5e1ee",
          200: "#aac2dd",
          300: "#7e9ec9",
          400: "#5079b0",
          500: "#345d94",
          600: "#274876",
          700: "#1f3a5f", // primary navy
          800: "#172c47",
          900: "#0f1d30",
        },
        accent: {
          50: "#e9f7fa",
          100: "#c8ebf2",
          200: "#94d8e6",
          300: "#5dc1d6",
          400: "#33a8c2",
          500: "#1f8ba6", // teal accent
          600: "#1a7088",
          700: "#185a6e",
          800: "#16485a",
          900: "#123c4b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,29,48,0.06), 0 4px 16px rgba(16,29,48,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};
