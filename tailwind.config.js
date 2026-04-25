/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Keeping only custom semantic tokens, removing overrides that break default palettes
        primary: "var(--violet)",
        secondary: "var(--mint)",
        surface: "var(--sur)",
        background: "var(--bg)",
        "bg-2": "var(--bg-2)",
        "bg-3": "var(--bg-3)",
        "bg-4": "var(--bg-4)",
        t1: "var(--t1)",
        t2: "var(--t2)",
        t3: "var(--t3)",
        violet: {
          DEFAULT: "var(--violet)",
          d: "var(--violet-d)",
          g: "var(--violet-g)",
        },
        mint: {
          DEFAULT: "var(--mint)",
          g: "var(--mint-g)",
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
