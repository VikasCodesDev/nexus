/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        surface: '#0F0F0F',
        primary: '#FFFFFF',
        secondary: '#A1A1AA',
        accent: '#52525B',
        text: '#FAFAFA'
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 25px rgba(255,255,255,0.12)'
      },
      animation: {
        pulseGrid: 'pulseGrid 5s ease-in-out infinite',
        typewriter: 'typewriter 2.4s steps(30, end)'
      },
      keyframes: {
        pulseGrid: {
          '0%, 100%': { opacity: '0.15' },
          '50%': { opacity: '0.35' }
        },
        typewriter: {
          from: { width: '0' },
          to: { width: '100%' }
        }
      }
    }
  },
  plugins: []
};
