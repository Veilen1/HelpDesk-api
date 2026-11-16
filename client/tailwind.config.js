/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Papel de expediente: el fondo nunca es blanco puro.
        paper: {
          DEFAULT: '#f2ede3',
          50: '#faf7f0',
          100: '#f2ede3',
          200: '#e6dfd1',
          300: '#d5cbb9',
        },
        // Tinta: el texto nunca es negro puro.
        ink: {
          DEFAULT: '#16130f',
          700: '#3b342c',
          500: '#6d6355',
          400: '#857a6b',
          300: '#a2988a',
        },
        // Acento de sello / acción principal.
        accent: {
          DEFAULT: '#b23a1e',
          dark: '#8c2b13',
          soft: '#f4ded5',
        },
        signal: {
          open: '#2f6b4f',
          progress: '#2a4a7f',
          resolved: '#96690a',
          closed: '#6d6355',
          urgent: '#a72a2a',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'Segoe UI', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        label: '0.14em',
        stamp: '0.1em',
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(22, 19, 15, 0.06), 0 12px 24px -18px rgba(22, 19, 15, 0.45)',
        lift: '0 18px 32px -24px rgba(22, 19, 15, 0.5)',
        stamp: '2px 2px 0 0 #16130f',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slide: {
          '0%': { opacity: '0', transform: 'translateY(-8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        rise: 'rise 0.5s cubic-bezier(0.2, 0.7, 0.3, 1) both',
        slide: 'slide 0.28s cubic-bezier(0.2, 0.7, 0.3, 1) both',
        sweep: 'sweep 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
