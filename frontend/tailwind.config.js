/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070A12',
          900: '#0B0F19',
          850: '#0F1626',
          800: '#141E33',
          750: '#1A2640',
          700: '#233252',
          600: '#33466F',
        },
        cyber: {
          blue: '#0EA5E9',
          cyan: '#06B6D4',
          teal: '#14B8A6',
          green: '#10B981',
          red: '#EF4444',
          amber: '#F59E0B',
          purple: '#8B5CF6',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.25)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.25)',
        'glow-green': '0 0 15px -3px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}
