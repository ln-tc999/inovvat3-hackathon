/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dash: {
          bg:       "#181828",
          card:     "#232336",
          nav:      "#22223a",
          header:   "#1a1a2a",
          border:   "#29293d",
          purple:   "#a78bfa",
          cyan:     "#5eead4",
          text:     "#ffffff",
          muted:    "#b3b3c6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "dash-heading": ["28px", { lineHeight: "1.2", fontWeight: "700" }],
        "dash-section":  ["18px", { lineHeight: "1.2", fontWeight: "700" }],
        "dash-label":    ["14px", { lineHeight: "1.5", fontWeight: "500" }],
        "dash-body":     ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "dash-nav":      ["15px", { lineHeight: "1.5", fontWeight: "500" }],
        "dash-number":   ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "dash-axis":     ["12px", { lineHeight: "1.5", fontWeight: "400" }],
      },
      letterSpacing: {
        "dash-body": "0.01em",
        "dash-nav":  "0.04em",
      },
      borderRadius: {
        "dash": "24px",
      },
      boxShadow: {
        "dash-card": "0 2px 16px 0 rgba(0,0,0,0.10)",
      },
    },
  },
  plugins: [],
};
