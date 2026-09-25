/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef4f1',
          100: '#d6e6dd',
          400: '#2f6b4f',
          500: '#1f5138',
          600: '#1b4332',
          700: '#143024',
          800: '#0f2419',
          900: '#0c1c16',
        },
        gold: {
          50: '#fdf6e7',
          100: '#f8e6b8',
          400: '#eeb63a',
          500: '#e9a319',
          600: '#c48512',
        },
        clay: {
          500: '#b8541d',
          600: '#9a4416',
        },
        cream: '#faf7f0',
        ink: '#1a1a1a',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,48,36,0.06), 0 1px 1px rgba(20,48,36,0.04)',
        'card-hover': '0 12px 24px -8px rgba(20,48,36,0.18), 0 2px 6px rgba(20,48,36,0.08)',
        rail: 'inset -24px 0 24px -24px rgba(250,247,240,1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 22s linear infinite',
        'fade-in-up': 'fadeInUp 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
