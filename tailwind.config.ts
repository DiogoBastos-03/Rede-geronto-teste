import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        blue: {
          deep: '#0C4A8C',
          sky: '#2196C9',
          light: '#E8F2FB',
          border: '#85B7EB',
        },
        green: {
          forest: '#1A7A5E',
          water: '#28A87A',
          light: '#EAF4F0',
          border: '#5DCAA5',
        },
        bg: {
          primary: '#F7F9FC',
          white: '#FFFFFF',
        },
        text: {
          primary: '#2C2C2A',
          secondary: '#5F5E5A',
          muted: '#B4B2A9',
        },
        error: '#E24B4A',
      },
      borderRadius: {
        pill: '100px',
        card: '16px',
        input: '10px',
        section: '24px',
        badge: '4px',
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'ui-serif', 'Cambria', 'Times New Roman', 'serif'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.15', fontWeight: '500' }],
        h1: ['48px', { lineHeight: '1.15', fontWeight: '500' }],
        h2: ['32px', { lineHeight: '1.25', fontWeight: '500' }],
        h3: ['20px', { lineHeight: '1.4', fontWeight: '500' }],
        body: ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '1.2px' }],
      },
      boxShadow: {
        card: '0 4px 16px rgba(12, 74, 140, 0.08)',
      },
      maxWidth: {
        container: '1200px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out forwards',
        'fade-in': 'fade-in 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
