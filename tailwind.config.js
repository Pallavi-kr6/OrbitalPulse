/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(217, 91%, 60%)',
        secondary: 'hsl(250, 91%, 60%)',
        accent: 'hsl(277, 91%, 60%)',
      },
    },
  },
  plugins: [],
};
