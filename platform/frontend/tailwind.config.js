/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#060a13',
          900: '#090d16',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155'
        },
        brand: {
          gold: '#c9a84c',
          goldHover: '#e5c05c',
          primary: '#3b82f6',
          danger: '#ef4444',
          success: '#10b981',
          warning: '#f59e0b'
        }
      }
    }
  },
  plugins: []
};
