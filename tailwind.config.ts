import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/client/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Colores Base Oficiales
        'brand-purple': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          500: '#533b9e',
          700: '#3e2c7a',
          800: '#352668',
          900: '#30235F', // Color primario institucional
          950: '#1e153c',
        },
        'brand-green': {
          50: '#eafaf1',
          100: '#cbf4dc',
          200: '#9eeac0',
          500: '#009444', // Color primario operativo / telecom
          600: '#00803b',
          700: '#006b31',
          800: '#005427',
          900: '#003d1c',
        },
        // Tokens Industriales Telecom
        telecom: {
          dark: '#0F172A',
          surface: '#1E293B',
          border: '#334155',
          amber: '#F79009',
          red: '#D92D20',
          cyan: '#06B6D4',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'field': '0 2px 8px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
        'field-glow': '0 0 0 3px rgba(0, 148, 68, 0.35)',
        'panel': '0 4px 20px -2px rgba(48, 35, 95, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
