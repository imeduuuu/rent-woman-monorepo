/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        rg: {
          DEFAULT: "#C4777A",   // rose gold principal
          light: "#E8AEB2",     // rose gold claro
          dark: "#9B5D60",      // rose gold oscuro
          gold: "#D4A76A",      // toque dorado cálido
          muted: "rgba(196,119,122,0.12)"  // fondo tenue
        },
        surface: {
          DEFAULT: "#1A1010",   // card background
          soft: "#221414",      // card hover
          border: "rgba(196,119,122,0.18)"  // border rose
        }
      }
    }
  },
  plugins: []
};
