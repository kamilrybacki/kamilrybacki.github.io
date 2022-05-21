const customTheme = require('./src/style/theme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: customTheme,
  plugins: [
    function({addVariant}) {
      addVariant('child', '& > *');
      addVariant('child-hover', '& > *:hover');
    },
    require('tailwind-scrollbar'),
  ],
};
