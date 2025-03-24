// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        customOrange: "#c9542b",
        customBlue: "#3990fd",
        customBlue2: "#3b87c4",
        customAqua: "#d1f4fe",
        customBlueLight: "#9febfd",
        customViolet: "#7d537e",
        customCyan: "#5d9ab8",
        customRed: "#c62828",
        customPink: "#ca1662",
      },
    },
  },
  plugins: [],
};
