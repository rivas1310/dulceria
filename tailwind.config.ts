import type { Config } from "tailwindcss";
import { custom } from "zod";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors:{
        customOrange: "#c9542b",
        customBlue:"#2ab0e1",
        customBlue2:"#3b87c4",
        customAqua:"#d1f4fe",
        customBlueLight:"#9febfd",
        customViolet:"V#7d537e",
        customCyan:"#5d9ab8",
        customRed:"#c62828",
        customPink:"#ca1662",
      
      },
    },
  },
  plugins: [],
};
export default config;
