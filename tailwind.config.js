/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0e1a',
        bg2: '#0f1526',
        card: '#141929',
        card2: '#1a2035',
        accent: '#4f8ef7',
        accent2: '#7c3aed',
        accent3: '#06d6a0',
        border: '#1e2640',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
