/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f9f4',
          100: '#dbf2e4',
          200: '#bae5cc',
          300: '#8ed3ae',
          400: '#5ab88b',
          500: '#359c6f',
          600: '#277d58',
          700: '#216347',
          800: '#1d4f3a',
          900: '#0d3224',
          950: '#061b13',
        },
        emerald: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        mint: {
          50: '#f2fcf7',
          100: '#e1f9ee',
          200: '#c5f3de',
          300: '#97e8c4',
          400: '#5ed5a4',
          500: '#32bd85',
          600: '#229a6b',
        },
        lime: {
          DEFAULT: '#84cc16',
          accent: '#a3e635',
          light: '#bef264',
        },
        eco: {
          bg: '#f7faf8',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e2eae4',
          muted: '#64748b',
          darkBg: '#0B0F19',
          darkSurface: '#111827',
          darkCard: '#111827',
          darkBorder: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(13, 50, 36, 0.04), 0 1px 3px rgba(13, 50, 36, 0.02)',
        'card': '0 4px 20px -2px rgba(13, 50, 36, 0.07), 0 2px 8px -1px rgba(13, 50, 36, 0.04)',
        'hover': '0 12px 30px -4px rgba(13, 50, 36, 0.12), 0 4px 12px -2px rgba(13, 50, 36, 0.06)',
        'glow': '0 0 25px -4px rgba(16, 185, 129, 0.35)',
        'glow-lg': '0 0 35px -2px rgba(16, 185, 129, 0.45)',
        'glow-lime': '0 0 25px -4px rgba(163, 230, 53, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'scan': 'scannerBeam 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        scannerBeam: {
          '0%': { top: '5%', opacity: '0.4' },
          '50%': { top: '90%', opacity: '1' },
          '100%': { top: '5%', opacity: '0.4' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
