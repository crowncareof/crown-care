import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Dark Blue
        navy: {
          50:  '#eef2ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#7facff',
          400: '#3f7eff',
          500: '#1451ff',
          600: '#0032f5',
          700: '#0029d1',
          800: '#0d2461',   // Main dark blue
          900: '#0a1b4d',
          950: '#060f2e',
        },
        // Gold accent
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#d4a017',  // Main gold
          600: '#b8860b',
          700: '#92650a',
          800: '#78510c',
          900: '#634210',
        },
        // WhatsApp green
        whatsapp: '#25D366',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'premium': '0 4px 40px rgba(10, 27, 77, 0.12)',
        'premium-lg': '0 8px 60px rgba(10, 27, 77, 0.18)',
        'gold': '0 4px 24px rgba(212, 160, 23, 0.3)',
        'gold-lg': '0 8px 40px rgba(212, 160, 23, 0.4)',
      },
      backgroundImage: {
        'hero-pattern': "url('/images/hero-bg.jpg')",
        'gold-gradient': 'linear-gradient(135deg, #d4a017, #fbbf24)',
        'navy-gradient': 'linear-gradient(135deg, #0a1b4d, #0d2461)',
        'premium-gradient': 'linear-gradient(135deg, #0d2461 0%, #0a1b4d 50%, #060f2e 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,160,23,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(212,160,23,0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
