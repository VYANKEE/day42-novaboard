/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a", // Dark Blue (Slate-900)
        accent: "#22c55e",  // Green (Green-500)
        surface: "#1e293b", // Lighter Blue for cards
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}