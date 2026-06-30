/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        amazon: {
          orange: '#FF9900',
          orangeLight: '#FFB84D',
          orangeDark: '#E68A00',
          blue: '#232F3E',
          blueLight: '#37475A',
          teal: '#00A8A8',
          tealLight: '#4DCCCC',
        },
        stage: {
          prime: '#10B981',
          primeCancel: '#F59E0B',
          lunaNeed: '#EF4444',
          luna: '#8B5CF6',
          paid: '#00A8A8',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-red': 'flashRed 1s ease-in-out infinite',
      },
      keyframes: {
        flashRed: {
          '0%, 100%': { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.3)' },
        }
      }
    },
  },
  plugins: [],
}
