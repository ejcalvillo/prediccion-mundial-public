/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        syncopate: ['Syncopate', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        mexico: {
          green: '#006E4A',
          'green-light': '#007A54',
          red: '#CE1126',
          'red-light': '#E01E35',
          white: '#FFFFFF',
        },
        sa: {
          gold: '#FFB612',
          green: '#007A4D',
          red: '#DE3831',
          blue: '#002395',
          black: '#000000',
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F0D060',
          dark: '#B8960C',
        },
        pitch: {
          DEFAULT: '#1A4731',
          dark: '#1B4A32',
          light: '#2A6044',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px rgba(212, 175, 55, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(212, 175, 55, 0)' },
        },
      },
      boxShadow: {
        'mexico': '0 4px 24px rgba(0, 104, 71, 0.25)',
        'gold': '0 4px 24px rgba(212, 175, 55, 0.35)',
        'red': '0 4px 24px rgba(206, 17, 38, 0.25)',
      },
    },
  },
  plugins: [],
}
