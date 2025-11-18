/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood': {
          50: '#FAF8F5',
          100: '#F5F1EB',
          200: '#E8DED0',
          300: '#DBCBB5',
          400: '#C19A6B',
          500: '#A0522D', // Primary wood tone
          600: '#8B4513',
          700: '#6F3709',
          800: '#532906',
          900: '#371B04',
        },
      },
    },
  },
  plugins: [],
}
