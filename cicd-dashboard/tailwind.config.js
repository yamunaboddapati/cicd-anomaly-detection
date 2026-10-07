export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "#0f0f0f",
        surface: "#161616",
        surface2: "#1c1c1c",
        border: "#2a2a2a",
        text: "#e8e8e8",
        muted: "#6b6b6b",
        faint: "#3a3a3a",
        accent: "#4f98a3",
        "accent-hover": "#227f8b",
        success: "#6daa45",
        warning: "#e8af34",
        danger: "#dd6974",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}