import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#52277E', light: '#7B4BAA', dark: '#3A1B5A' },
        secondary: { DEFAULT: '#F07E0D', light: '#F59E42', dark: '#C66200' },
        background: '#F8F8F8',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
