/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-image': "url(images/image-bg.jpg)",
        'custom-rachel-image':" url(images/rachel_bg.jpg)"
      }
    },
  },
  plugins: [],
}
