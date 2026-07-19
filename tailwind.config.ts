import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb, 232 93 117) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light-rgb, 247 164 181) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark-rgb, 178 58 84) / <alpha-value>)'
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary-rgb, 108 99 255) / <alpha-value>)',
          light: 'rgb(var(--color-secondary-light-rgb, 162 155 254) / <alpha-value>)',
          dark: 'rgb(var(--color-secondary-dark-rgb, 72 52 212) / <alpha-value>)'
        },
        blush: 'rgb(var(--color-blush-rgb, 255 240 243) / <alpha-value>)',
        parchment: 'rgb(var(--color-parchment-rgb, 255 252 245) / <alpha-value>)',
        ink: 'rgb(var(--color-ink-rgb, 45 42 50) / <alpha-value>)',
        surface: 'rgb(var(--color-surface-rgb, 255 255 255) / <alpha-value>)'
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body: ['var(--font-poppins)', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 30px rgb(var(--color-primary-rgb, 232 93 117) / 0.16)',
        card: '0 4px 20px rgb(var(--color-ink-rgb, 45 42 50) / 0.08)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      backgroundImage: {
        'love-gradient': 'linear-gradient(135deg, var(--color-primary, #E85D75) 0%, var(--color-secondary, #6C63FF) 100%)'
      }
    }
  },
  plugins: []
};

export default config;
