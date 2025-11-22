/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",             // Scan your main HTML
    "./src/**/*.{js,jsx,ts,tsx}" // Scan all React components in src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
