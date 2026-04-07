/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "trimerge-blue": "#1e5ba8",
        "trimerge-blue-dark": "#174a8f",
        "trimerge-gold": "#d4af37",
        "trimerge-gold-dark": "#c19a2e",
        "trimerge-gray": "#808080",
      },
    },
  },
  plugins: [],
};
