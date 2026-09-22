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
      },
    },
  },
  plugins: [],
};

export default config;
