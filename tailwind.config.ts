import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        // Mehfil palette — light theme only.
        ink: {
          DEFAULT: "#14101F", // near-black plum, primary text
          soft: "#3A3450",
          muted: "#6B6580",
        },
        primary: {
          DEFAULT: "#5B3DF5", // electric indigo-violet
          50: "#F1EEFE",
          100: "#E3DCFD",
          600: "#5B3DF5",
          700: "#4A2FD6",
        },
        accent: {
          DEFAULT: "#FF6B4A", // warm coral, used sparingly on CTAs
          soft: "#FFE7E0",
        },
        valid: "#0FAE7E", // emerald — reserved for the scanner "valid" state
        invalid: "#E5484D",
        surface: "#FFFFFF",
        canvas: "#FBFBFD",
        line: "#ECEAF3",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,16,31,0.04), 0 12px 32px -12px rgba(20,16,31,0.12)",
        lift: "0 24px 56px -20px rgba(91,61,245,0.30)",
      },
      backgroundImage: {
        "mesh-hero":
          "radial-gradient(900px 420px at 12% -10%, rgba(91,61,245,0.16), transparent 60%), radial-gradient(700px 360px at 100% 0%, rgba(255,107,74,0.14), transparent 55%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;