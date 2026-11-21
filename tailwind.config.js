/** @type {import('tailwindcss').Config} */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        paper: v("paper"),
        paper2: v("paper-2"),
        ink: v("ink"),
        muted: v("muted"),
        verm: v("red"),
        sea: v("sea"),
        ochre: v("ochre"),
      },
      fontFamily: {
        serif: ['"STIX Two Text Variable"', '"STIX Two Text"', "Cambria", "Georgia", "serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
