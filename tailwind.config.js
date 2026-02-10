/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)', // white/6
        input: 'var(--color-input)', // gray-900
        ring: 'var(--color-ring)', // green-400
        background: 'var(--color-background)', // black
        foreground: 'var(--color-foreground)', // gray-100
        primary: {
          DEFAULT: 'var(--color-primary)', // black
          foreground: 'var(--color-primary-foreground)', // gray-100
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', // gray-950
          foreground: 'var(--color-secondary-foreground)', // gray-100
        },
        accent: {
          DEFAULT: 'var(--color-accent)', // green-400
          foreground: 'var(--color-accent-foreground)', // black
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', // red-500
          foreground: 'var(--color-destructive-foreground)', // white
        },
        muted: {
          DEFAULT: 'var(--color-muted)', // gray-800
          foreground: 'var(--color-muted-foreground)', // gray-100/60
        },
        card: {
          DEFAULT: 'var(--color-card)', // gray-900
          foreground: 'var(--color-card-foreground)', // gray-100
        },
        popover: {
          DEFAULT: 'var(--color-popover)', // gray-900
          foreground: 'var(--color-popover-foreground)', // gray-100
        },
        success: {
          DEFAULT: 'var(--color-success)', // green-400
          foreground: 'var(--color-success-foreground)', // black
        },
        warning: {
          DEFAULT: 'var(--color-warning)', // yellow-500
          foreground: 'var(--color-warning-foreground)', // black
        },
        error: {
          DEFAULT: 'var(--color-error)', // red-500
          foreground: 'var(--color-error-foreground)', // white
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)', // 6px
        md: 'var(--radius-md)', // 12px
        lg: 'var(--radius-lg)', // 18px
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h4': ['1.125rem', { lineHeight: '1.5', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.025em' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '120': '30rem',
      },
      boxShadow: {
        'glow-sm': '0 0 20px rgba(57, 255, 136, 0.1)',
        'glow-md': '0 0 40px rgba(57, 255, 136, 0.2)',
        'glow-lg': '0 0 60px rgba(57, 255, 136, 0.3)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
      },
      zIndex: {
        'base': '0',
        'card': '1',
        'form': '10',
        'navigation': '100',
        'modal': '200',
        'toast': '300',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}