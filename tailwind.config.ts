import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd6ff",
          300: "#8ebcff",
          400: "#5996ff",
          500: "#326dff",
          600: "#1b4cf5",
          700: "#1639e1",
          800: "#1830b6",
          900: "#1a2f8f",
          950: "#151d57",
        },
        ink: {
          DEFAULT: "#0b1220",
          soft: "#1a2436",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
