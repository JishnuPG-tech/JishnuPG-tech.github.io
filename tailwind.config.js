/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          50: '#f8fafc',
          100: '#1e293b',
          200: '#172033',
          300: '#0f172a',
          400: '#0d1424',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        },
      },
    },
  },
  plugins: [],
}
