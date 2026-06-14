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
        background: "#050505",
        foreground: "#FFFFFF",
        slate: {
          50: "#18181B",
          100: "#27272A",
          150: "#27272A",
          200: "#27272A",
          250: "#27272A",
          300: "#3F3F46",
          400: "#A1A1AA",
          450: "#A1A1AA",
          500: "#A1A1AA",
          505: "#A1A1AA",
          600: "#FFFFFF",
          650: "#FFFFFF",
          700: "#FFFFFF",
          800: "#FFFFFF",
          900: "#FFFFFF",
        },
        zinc: {
          800: "#27272A",
          850: "#27272A",
          900: "#18181B",
          950: "#050505",
        },
        violet: {
          50: "#27272A",
          200: "#A1A1AA",
          250: "#A1A1AA",
          400: "#FFFFFF",
          550: "#FFFFFF",
          600: "#FFFFFF",
          605: "#FFFFFF",
          650: "#FFFFFF",
          700: "#FFFFFF",
          750: "#FFFFFF",
          900: "#18181B",
          950: "#18181B",
        },
        indigo: {
          50: "#27272A",
          100: "#27272A",
          400: "#FFFFFF",
          500: "#FFFFFF",
          600: "#FFFFFF",
          650: "#FFFFFF",
          700: "#FFFFFF",
          750: "#FFFFFF",
          950: "#18181B",
        },
        cyan: {
          50: "#27272A",
          100: "#27272A",
          400: "#A1A1AA",
          500: "#A1A1AA",
          700: "#FFFFFF",
          705: "#FFFFFF",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["DM Sans", "system-ui", "sans-serif"],
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
