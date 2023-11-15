/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', 'public/js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
