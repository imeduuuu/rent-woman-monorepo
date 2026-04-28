/** @type {import("tailwindcss").Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        rw: {
          pink:         "#FF3D8B",
          "pink-light": "#FF6BA8",
          "pink-soft":  "rgba(255,61,139,0.12)",
          "pink-border":"rgba(255,61,139,0.25)",
          black:        "#000000",
          "black-50":   "#0D0D0D",
          "black-100":  "#141414",
          "black-200":  "#1C1C1C",
          "black-300":  "#242424",
          white:        "#FFFFFF",
          "white-75":   "rgba(255,255,255,0.75)",
          "white-45":   "rgba(255,255,255,0.45)",
          "white-15":   "rgba(255,255,255,0.15)",
          "white-08":   "rgba(255,255,255,0.08)",
          online:       "#00E5A0",
        }
      },
      fontFamily: {
        display: ["Cormorant Garamond", "EB Garamond", "Georgia", "serif"],
        body:    ["Outfit", "Helvetica Neue", "sans-serif"],
        sans:    ["Outfit", "Helvetica Neue", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-l":  ["56px", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-m":  ["40px", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-s":  ["28px", { lineHeight: "1.25" }],
        "body-l":     ["18px", { lineHeight: "1.65" }],
        "body-m":     ["15px", { lineHeight: "1.5"  }],
        "body-s":     ["13px", { lineHeight: "1.5"  }],
        "body-xs":    ["11px", { lineHeight: "1.4"  }],
      },
      borderWidth: {
        DEFAULT: "0.5px",
        "0":     "0",
        "1":     "1px",
      },
      borderRadius: {
        chip:  "6px",
        input: "8px",
        card:  "12px",
        pill:  "999px",
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.15)",
      },
      maxWidth: {
        container: "1320px",
      },
      width: {
        sidebar: "180px",
      },
      height: {
        header: "64px",
      },
      transitionTimingFunction: {
        "rw-out":    "cubic-bezier(0.2,0,0,1)",
        "rw-in-out": "cubic-bezier(0.4,0,0.2,1)",
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "280ms",
      },
      boxShadow: {
        // No real shadows — only the online-dot halo, handled inline
        none: "none",
      },
    },
  },
};
