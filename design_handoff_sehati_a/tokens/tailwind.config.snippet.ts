// Sehati · Direction A — Sand & Sage
// Merge isi `theme.extend` ini ke `tailwind.config.ts` Anda.
// (Jangan ditimpa total — merge ke extend yang sudah ada dari shadcn.)

import type { Config } from 'tailwindcss';

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
          dim: 'hsl(var(--primary-dim))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          soft: 'hsl(var(--accent-soft))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
          soft: 'hsl(var(--danger-soft))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warn-soft))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          soft: 'hsl(var(--info-soft))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        surface: {
          DEFAULT: 'hsl(var(--card))',
          alt: 'hsl(var(--surface-alt))',
          dim: 'hsl(var(--surface-dim))',
        },
        ink: {
          DEFAULT: 'hsl(var(--foreground))',
          mute: 'hsl(var(--muted-foreground))',
          dim: 'hsl(var(--ink-dim))',
        },
        border: 'hsl(var(--border))',
        'border-soft': 'hsl(var(--border-soft))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'sehati-sm': '0 1px 2px rgba(45,30,10,0.05)',
        'sehati-md':
          '0 1px 2px rgba(45,30,10,0.04), 0 8px 24px rgba(45,30,10,0.06)',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'slide-in': {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.2s infinite',
        'slide-in': 'slide-in 0.25s cubic-bezier(.2,.7,.2,1) both',
      },
    },
  },
};

export default config;
