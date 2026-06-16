/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        slate: {
          50: "rgb(var(--slate-50) / <alpha-value>)",
          100: "rgb(var(--slate-100) / <alpha-value>)",
          150: "rgb(var(--slate-150) / <alpha-value>)",
          200: "rgb(var(--slate-200) / <alpha-value>)",
          250: "rgb(var(--slate-250) / <alpha-value>)",
          300: "rgb(var(--slate-300) / <alpha-value>)",
          400: "rgb(var(--slate-400) / <alpha-value>)",
          450: "rgb(var(--slate-450) / <alpha-value>)",
          500: "rgb(var(--slate-500) / <alpha-value>)",
          505: "rgb(var(--slate-505) / <alpha-value>)",
          600: "rgb(var(--slate-600) / <alpha-value>)",
          650: "rgb(var(--slate-650) / <alpha-value>)",
          700: "rgb(var(--slate-700) / <alpha-value>)",
          800: "rgb(var(--slate-800) / <alpha-value>)",
          900: "rgb(var(--slate-900) / <alpha-value>)",
        },
        zinc: {
          800: "rgb(var(--zinc-800) / <alpha-value>)",
          850: "rgb(var(--zinc-850) / <alpha-value>)",
          900: "rgb(var(--zinc-900) / <alpha-value>)",
          950: "rgb(var(--zinc-950) / <alpha-value>)",
        },
        violet: {
          50: "rgb(var(--violet-50) / <alpha-value>)",
          200: "rgb(var(--violet-200) / <alpha-value>)",
          250: "rgb(var(--violet-250) / <alpha-value>)",
          400: "rgb(var(--violet-400) / <alpha-value>)",
          550: "rgb(var(--violet-550) / <alpha-value>)",
          600: "rgb(var(--violet-600) / <alpha-value>)",
          605: "rgb(var(--violet-605) / <alpha-value>)",
          650: "rgb(var(--violet-650) / <alpha-value>)",
          700: "rgb(var(--violet-700) / <alpha-value>)",
          750: "rgb(var(--violet-750) / <alpha-value>)",
          900: "rgb(var(--violet-900) / <alpha-value>)",
          950: "rgb(var(--violet-950) / <alpha-value>)",
        },
        indigo: {
          50: "rgb(var(--indigo-50) / <alpha-value>)",
          100: "rgb(var(--indigo-100) / <alpha-value>)",
          400: "rgb(var(--indigo-400) / <alpha-value>)",
          500: "rgb(var(--indigo-500) / <alpha-value>)",
          600: "rgb(var(--indigo-600) / <alpha-value>)",
          650: "rgb(var(--indigo-650) / <alpha-value>)",
          700: "rgb(var(--indigo-700) / <alpha-value>)",
          750: "rgb(var(--indigo-750) / <alpha-value>)",
          950: "rgb(var(--indigo-950) / <alpha-value>)",
        },
        cyan: {
          50: "rgb(var(--cyan-50) / <alpha-value>)",
          100: "rgb(var(--cyan-100) / <alpha-value>)",
          400: "rgb(var(--cyan-400) / <alpha-value>)",
          500: "rgb(var(--cyan-500) / <alpha-value>)",
          700: "rgb(var(--cyan-700) / <alpha-value>)",
          705: "rgb(var(--cyan-705) / <alpha-value>)",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        outfit: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(139, 92, 246, 0.15)",
        "glow-lg": "0 0 30px rgba(139, 92, 246, 0.3)",
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
