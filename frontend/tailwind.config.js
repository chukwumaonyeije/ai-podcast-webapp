/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // ✅ Add this line to enable dark mode via class
  theme: {
    extend: {},
  },
  plugins: [],
}

