/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ebf3f9',
          100: '#d8e7f3',
          200: '#b0d0ea',
          300: '#7fb3d9',
          400: '#5399d0',
          500: '#0068b4',
          600: '#00599c',
          700: '#00487a',
          800: '#00375e',
          900: '#002a48',
        },
        neutral: {
          100: '#ffffff',
          200: '#e1e1e1',
          400: '#706f6f',
          900: '#000000',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-dot': 'bounceDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
