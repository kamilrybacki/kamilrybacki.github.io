/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"];
export const theme = {
  colors: {
    foreground: "#C4D8ED",
    background: "#111111",
    accent: "#E5F2FF",
    glow: "#C4D8ED",
  },
  extend: {
    fontFamily: {
      display: ["Anybody Variable"],
      body: ["Raleway Variable"],
      code: ["Source Code Pro Variable"],
      handwriting: ["Walter Turncoat"],
      abstract: ["Redacted Script"],
    },
  },
};
export const plugins = [];
