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
        // Neutral dark palette used for subtle, non‑neon styling
        dark: {
          black: '#000000',
          'black-900': '#0a0a0a',
          'black-800': '#1a1a1a',
          'black-700': '#27272a',
        },
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '50%': { transform: 'translateY(-6px) translateX(4px)' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(20px, -10px) scale(1.05)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.97)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 400ms ease-out both',
        'fade-in-up-slow': 'fade-in-up 600ms ease-out both',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        blob: 'blob 18s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
