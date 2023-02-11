/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['"Playfair Display"', 'serif'],
      body: ['"Open Sans"', 'sans-serif']
    }
  },
  plugins: []
};
