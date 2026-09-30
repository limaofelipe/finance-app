/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0d0d0d",
        panel: "#171717",
        gold: "#d4af37",
        "gold-light": "#f0c987",
      },
    },
  },
  plugins: [],
};
