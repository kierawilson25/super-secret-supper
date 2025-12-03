import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        darkPurple: '#460C58',
        gold: '#FBE6A6',
        hoverGold: '#CFA94A',
        offWhite: '#F8F4F0',
      },
      fontFamily: {
        greatvibes: ['var(--font-great-vibes)', 'cursive'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        h1: '7rem',
      },
    },
  },
  plugins: [],
};

export default config;
