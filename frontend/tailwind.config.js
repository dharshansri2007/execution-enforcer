/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      colors: {
        background: '#03040a', 
        card: 'rgba(8, 14, 28, 0.85)', 
        gold: {
          DEFAULT: '#fbbf24', 
          glow: '#f59e0b',
        },
        danger: '#f43f5e', 
        success: '#10b981', 
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'tech': ['"Share Tech Mono"', 'monospace'],
        'display': ['"Rajdhani"', 'sans-serif'],
      },
      boxShadow: {
        'neon-gold': '0 0 15px rgba(251, 191, 36, 0.3)',
        'neon-danger': '0 0 15px rgba(244, 63, 94, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
}
