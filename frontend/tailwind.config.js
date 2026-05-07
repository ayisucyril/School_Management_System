/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a',
        'primary-dark': '#15803d',
        'primary-light': '#22c55e',
        accent: '#eab308',
        'accent-dark': '#ca8a04',
        'accent-light': '#facc15',
        dark: '#0a0a0a',
        'dark-100': '#111111',
        'dark-200': '#1a1a1a',
        'dark-300': '#222222',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        heading: ['"Outfit"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        }
      },
      boxShadow: {
        'green': '0 0 20px rgba(22, 163, 74, 0.3)',
        'yellow': '0 0 20px rgba(234, 179, 8, 0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
      }
    }
  },
  plugins: []
}
