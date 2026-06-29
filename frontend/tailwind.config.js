export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        primary: {
          DEFAULT: '#D72821',
          hover: '#b91d18',
        }
      }
    },
  },
  plugins: [],
}
