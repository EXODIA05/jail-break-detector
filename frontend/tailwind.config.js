/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        graphite: '#292d30',
        iris: {
          light: '#baa7ff',
          DEFAULT: '#9281f7',
          dark: '#5b47d6',
        },
        bone: '#f0f0f0',
        ash: '#a1a4a5',
        smoke: '#abafb4',
        signal: '#3b9eff',
        pulse: '#3ad389',
        alarm: '#ff9592',
        crimson: '#ff6465',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Commit Mono', 'monospace'],
        serif: ['"Times New Roman"', 'Times', 'Baskerville', 'Georgia', 'serif'],
        display: ['"Times New Roman"', 'Times', 'Baskerville', 'Georgia', 'serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '6px',
      },
      boxShadow: {
        'hairline': '0 0 0 1px #292d30',
        'iris-glow': '0 0 30px -5px rgba(146, 129, 247, 0.35)',
      },
    },
  },
  plugins: [],
}
