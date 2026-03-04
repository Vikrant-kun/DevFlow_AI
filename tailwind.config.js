/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg)",
        surface: {
          1: "var(--surface-1)",
          2: "var(--surface-2)",
        },
        border: "var(--border)",
        primary: "var(--accent-mint)",
        ai: "var(--accent-violet)",
        error: "var(--error)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      transitionTimingFunction: {
        'precise-ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(110, 231, 183, 0.1)',
        'btn-primary-hover': '0 0 15px rgba(110, 231, 183, 0.4)',
        'btn-ghost-hover': '0 0 15px rgba(241, 245, 249, 0.1)',
      }
    },
  },
  plugins: [],
}
