import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EDF7F1',
          100: '#D5EDDF',
          200: '#A9DABD',
          500: '#12824F',
          600: '#0C6B40',
          700: '#095332',
          900: '#07321F',
        },
        sun: { 100: '#FFF3CC', 400: '#F6B60B', 700: '#8A6100' },
        ink: '#14201A',
        mist: '#F3F6F4',
        line: '#E3E9E5',
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Noto Sans Ethiopic"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Noto Sans Ethiopic"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,40,28,.05), 0 8px 24px -12px rgba(16,40,28,.18)',
        lift: '0 2px 4px rgba(16,40,28,.06), 0 18px 40px -16px rgba(16,40,28,.28)',
      },
    },
  },
  plugins: [],
};

export default config;
