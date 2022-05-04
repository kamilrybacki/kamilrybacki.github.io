const custom_theme = require('./src/style/theme')

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: custom_theme,
  plugins: [
    function ({ addVariant }) {
        addVariant('child', '& > *');
        addVariant('child-hover', '& > *:hover');
    }
  ]
}
