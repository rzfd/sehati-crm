import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Sehati CRM color system ──────────────────────────
      colors: {
        // Brand — teal (pasien side)
        teal: {
          50:  "#E1F5EE",
          100: "#C3EBD8",
          200: "#87D7B1",
          300: "#4BC38A",
          400: "#1D9E75", // primary
          500: "#0F6E56",
          600: "#085041",
          700: "#063B30",
          800: "#042820",
          900: "#021410",
        },
        // Info — blue (staff side)
        blue: {
          50:  "#E6F1FB",
          100: "#CCE3F7",
          200: "#99C7EF",
          300: "#66ABE7",
          400: "#338FDF",
          500: "#185FA5", // primary
          600: "#0C447C",
          700: "#082E53",
          800: "#04182A",
          900: "#020C15",
        },
        // Warning — amber (manager side)
        amber: {
          50:  "#FAEEDA",
          100: "#F5DDB5",
          200: "#EBBB6B",
          300: "#E19921",
          400: "#BA7517", // primary
          500: "#854F0B",
          600: "#633806",
          700: "#422504",
          800: "#211302",
          900: "#110901",
        },
        // Danger — red (urgent)
        red: {
          50:  "#FCEBEB",
          100: "#F9D7D7",
          200: "#F3AFAF",
          300: "#ED8787",
          400: "#C74040",
          500: "#A32D2D", // primary
          600: "#791F1F",
          700: "#501414",
          800: "#280A0A",
          900: "#140505",
        },
        // VIP / Admin — purple
        purple: {
          50:  "#EEEDFE",
          100: "#DDDAFD",
          200: "#BBB5FB",
          300: "#9990F9",
          400: "#776BF7",
          500: "#534AB7", // primary
          600: "#3C3489",
          700: "#28235B",
          800: "#14112E",
          900: "#0A0917",
        },
        // Asdok (doctor assistant) — pink
        pink: {
          50:  "#FBEAF0",
          100: "#F7D5E1",
          200: "#EFABC3",
          300: "#E781A5",
          400: "#C04870",
          500: "#993556", // primary
          600: "#72243E",
          700: "#4C1829",
          800: "#260C15",
          900: "#13060A",
        },
        // Neutral
        gray: {
          50:  "#F9F9F6",
          100: "#F1EFE8",
          200: "#E3E1D9",
          300: "#C8C6BC",
          400: "#ADAB9F",
          500: "#888780", // primary
          600: "#5F5E5A",
          700: "#2C2C2A",
          800: "#1A1A18",
          900: "#0D0D0C",
        },

        // ── Sand & Sage semantic tokens (design system) ─────
        // Surfaces
        background:    "#FAF6EE", // sand — app background
        surface:       "#FFFFFF", // cards
        "surface-alt": "#F2EDE0", // sidebars, inset areas
        "surface-dim": "#EEE7D5", // patient chat bubble, chips
        // Primary (Sage)
        primary: {
          DEFAULT: "#466147",
          soft:    "#EAEFE3",
          dim:     "#D9E1D2",
        },
        "on-primary": "#FFFFFF",
        "on-primary-soft": "#334d34", // readable sage text on primary-soft
        // Secondary (Clay)
        secondary: {
          DEFAULT: "#95492b",
          soft:    "#F0D9CB",
        },
        "accent-soft": "#F0D9CB",
        // Tertiary (Info / Doctor blue-slate)
        tertiary: {
          DEFAULT: "#385f73",
          soft:    "#D6E1E7",
        },
        "info-soft": "#D6E1E7",
        // Semantic
        danger: {
          DEFAULT: "#A8443E",
          soft:    "#F2D6D3",
        },
        warning: {
          DEFAULT: "#C97B2C",
          soft:    "#F4E1CC",
        },
        // Text / ink
        ink: {
          DEFAULT: "#1f1b14", // near-black warm ink (on-surface)
          muted:   "#6F665A",
          dim:     "#A39A8B",
        },
        "on-surface": "#1f1b14",
        // Lines
        border:        "#E8E0CC",
        "border-soft": "#F0E9D6",
      },

      // ── Typography ───────────────────────────────────────
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
        xs:   ["13px", { lineHeight: "18px" }],
        sm:   ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg:   ["18px", { lineHeight: "28px" }],
        xl:   ["20px", { lineHeight: "28px" }],
        "2xl":["22px", { lineHeight: "30px" }],
        "3xl":["26px", { lineHeight: "34px" }],
        "4xl":["32px", { lineHeight: "40px" }],
        // ── Sand & Sage type scale ──
        "headline-lg": ["28px", { lineHeight: "34px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "card-title":  ["14px", { lineHeight: "20px", fontWeight: "600" }],
        "body-md":     ["13px", { lineHeight: "20px", fontWeight: "500" }],
        "body-sm":     ["12px", { lineHeight: "18px", fontWeight: "500" }],
        caption:       ["11px", { lineHeight: "16px", fontWeight: "500" }],
        eyebrow:       ["10px", { lineHeight: "14px", letterSpacing: "0.05em", fontWeight: "600" }],
        "code-mono":   ["12px", { lineHeight: "16px", fontWeight: "400" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        bold:   "700",
      },

      // ── Border radius ────────────────────────────────────
      borderRadius: {
        sm:   "4px",
        md:   "6px",
        lg:   "8px",
        xl:   "12px",
        "2xl":"16px",
        "3xl":"24px",
        full: "9999px",
      },

      // ── Shadows ──────────────────────────────────────────
      // Warm brown-tinted shadows (Sand & Sage — never pure black)
      boxShadow: {
        xs:  "0 1px 2px rgba(45,30,10,0.05)",
        sm:  "0 1px 2px rgba(45,30,10,0.05)",
        md:  "0 4px 12px rgba(45,30,10,0.06)",
        lg:  "0 8px 24px rgba(45,30,10,0.06)",
        xl:  "0 16px 40px rgba(45,30,10,0.08)",
        card:"0 1px 2px rgba(45,30,10,0.05)",
        modal:"0 8px 24px rgba(45,30,10,0.06)",
      },

      // ── Spacing extras ───────────────────────────────────
      spacing: {
        "4.5": "18px",
        "13":  "52px",
        "15":  "60px",
        "18":  "72px",
        "22":  "88px",
        "sidebar-width": "224px",
        "topbar-height": "56px",
        "desktop-margin": "24px",
        "mobile-margin": "16px",
      },

      // ── Animation ────────────────────────────────────────
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.3" },
        },
      },
      animation: {
        "fade-in":       "fade-in 0.2s ease-out",
        "slide-in-right":"slide-in-right 0.3s ease-out",
        pulse:           "pulse 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
