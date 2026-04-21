/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#151515",
          soft: "#2a2a2a",
          accent: "#d4af37"
        }
      },
      boxShadow: {
        luxury: "0 20px 60px rgba(0, 0, 0, 0.18)"
      },
      borderRadius: {
        xl2: "1.25rem"
      },
      maxWidth: {
        screen: "1440px"
      }
    }
  }
};
