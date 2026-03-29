/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/renderer/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#fdfdfd',
          dark: '#0a0a0a',
        },
        surface: {
          light: '#ffffff',
          dark: '#121212',
        },
        border: {
          light: '#e5e5e5',
          dark: '#262626',
        },
        brand: {
          DEFAULT: '#000000',
          dark: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
