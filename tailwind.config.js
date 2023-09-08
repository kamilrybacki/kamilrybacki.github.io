/** @type {import('tailwindcss').Config} */
export const content = ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'];
export const theme = {
  colors: {
    'foreground': '#C4D8ED',
    'background': '#090E11',
    'glow': "#E5F2FF",
    'accent': '#4C83C2',
  },
  extend: {
    fontFamily: {
      display: ['Anybody Variable']
    },
  },
};
export const plugins = [];
