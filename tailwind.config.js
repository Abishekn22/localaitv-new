/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        barlow: ["'Barlow'", 'sans-serif'],
        barlowCondensed: ["'Barlow Condensed'", 'sans-serif'],
        telugu: ["'Noto Sans Telugu'", "'Barlow'", 'sans-serif'],
      },
      colors: {
        brandRed: '#D0021B',
        brandRed2: '#FF0A2F',
        brandGold: '#FFB800',
        brandTeal: '#00C6B8',
        brandGreen: '#00D068',
        navy: '#060D1F',
        navy2: '#0D1829',
        navy3: '#131F35',
        navy4: '#1A2840',
      },
    },
  },
  plugins: [],
};
