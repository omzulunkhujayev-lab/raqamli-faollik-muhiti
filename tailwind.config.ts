import type { Config } from "tailwindcss";

// Rang mantiqi (dizayn talabi): harakat/ijobiy — yashil; e'tibor — sariq; uzilish — qizil
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Asosiy brend rangi — sokin, ta'limiy ko'k-yashil
        brand: {
          50: "#f0fdf9",
          100: "#ccfbef",
          200: "#99f6e0",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
        // Holat ranglari (me'yorga nisbatan indikator)
        ok: "#16a34a", // yashil — me'yorda
        warn: "#eab308", // sariq — e'tibor
        bad: "#dc2626", // qizil — uzilish / past
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
