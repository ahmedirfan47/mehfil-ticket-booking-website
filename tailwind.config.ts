import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Mehfil — Daylight. Disciplined: sky owns trust, coral owns action.
        ink: {
          DEFAULT: "#0A1A2F", // deep navy-black — never pure black
          soft: "#33425A",
          muted: "#6B7A92",
        },
        sky: {
          DEFAULT: "#1E9BFF", // electric-friendly blue — the trust accent
          600: "#0F7FE0",
          50: "#EAF5FF",
          100: "#D4EBFF",
        },
        coral: {
          DEFAULT: "#FF7A4D", // the single warm spark — actions & delight only
          600: "#F2602F",
          50: "#FFF0EA",
        },
        valid: "#13B57A",
        invalid: "#E5484D",
        paper: "#FBFCFF",   // barely-blue white
        surface: "#FFFFFF",
        mist: "#E8EEF6",    // hairlines + quiet surfaces
        // Back-compat aliases so existing classes keep working during rollout.
        primary: {
          DEFAULT: "#1E9BFF",
          50: "#EAF5FF",
          100: "#D4EBFF",
          600: "#1E9BFF",
          700: "#0F7FE0",
        },
        accent: { DEFAULT: "#FF7A4D", soft: "#FFF0EA" },
        canvas: "#FBFCFF",
        line: "#E8EEF6",
      },
      fontFamily: {
        display: ["var(--font-display)", "General Sans", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Type scale (Elements of Typographic Style — ~1.25 major third).
        "display-xl": ["clamp(2.75rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        "4xl": "2.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,26,47,0.04), 0 10px 30px -12px rgba(10,26,47,0.10)",
        lift: "0 30px 60px -24px rgba(30,155,255,0.28)",
        coral: "0 16px 40px -14px rgba(255,122,77,0.45)",
      },
      backgroundImage: {
        "daylight":
          "radial-gradient(1100px 500px at 8% -10%, rgba(30,155,255,0.14), transparent 60%), radial-gradient(800px 420px at 100% 0%, rgba(255,122,77,0.12), transparent 55%)",
      },
      keyframes: {
        "ticket-settle": {
          "0%": { opacity: "0", transform: "translateY(-18px) rotate(-3deg)" },
          "60%": { transform: "translateY(4px) rotate(0.5deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
        },
        "rise": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "ticket-settle": "ticket-settle 0.9s cubic-bezier(0.22,1,0.36,1) both",
        "rise": "rise 0.6s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;