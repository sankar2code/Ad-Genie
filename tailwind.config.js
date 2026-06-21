/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ag: {
          'bg-base':        'var(--ag-bg-base)',
          'bg-subtle':      'var(--ag-bg-subtle)',
          'bg-surface':     'var(--ag-bg-surface)',
          'bg-elevated':    'var(--ag-bg-elevated)',
          'bg-card':        'var(--ag-bg-card)',
          'border':         'var(--ag-border-base)',
          'border-strong':  'var(--ag-border-strong)',
          'border-glow':    'var(--ag-border-glow)',
          'fg-base':        'var(--ag-fg-base)',
          'fg-subtle':      'var(--ag-fg-subtle)',
          'fg-muted':       'var(--ag-fg-muted)',
          'fg-inverted':    'var(--ag-fg-inverted)',
          'accent':         'var(--ag-accent)',
          'accent-hover':   'var(--ag-accent-hover)',
          'accent-subtle':  'var(--ag-accent-subtle)',
          'genie':          'var(--ag-genie)',
          'genie-hover':    'var(--ag-genie-hover)',
          'genie-subtle':   'var(--ag-genie-subtle)',
          'magic':          'var(--ag-magic)',
          'magic-hover':    'var(--ag-magic-hover)',
          'magic-subtle':   'var(--ag-magic-subtle)',
          'success':        'var(--ag-success)',
          'warning':        'var(--ag-warning)',
          'error':          'var(--ag-error)',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '10px',
        xl:  '16px',
        '2xl': '20px',
      },
      boxShadow: {
        'glow-gold':   '0 0 24px rgba(251,191,36,0.35)',
        'glow-purple': '0 0 24px rgba(139,92,246,0.4)',
        'glow-teal':   '0 0 24px rgba(20,184,166,0.35)',
        'card':        '0 4px 32px rgba(0,0,0,0.5)',
        'card-hover':  '0 8px 48px rgba(0,0,0,0.6)',
      },
      keyframes: {
        agFadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        agGenieReveal: {
          from: { opacity: '0', transform: 'scale(0.94) translateY(8px)' },
          to:   { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        agFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-14px)' },
        },
        agPulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.04)' },
        },
        agRotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        agSmoke: {
          '0%':   { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '30%':  { opacity: '0.6' },
          '100%': { opacity: '0', transform: 'translateY(-40px) scaleX(1.5)' },
        },
        agSparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%':      { opacity: '1', transform: 'scale(1)' },
        },
        agShimmer: {
          to: { transform: 'translateX(100%)' },
        },
        agOrb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%':      { transform: 'translate(20px, -15px) scale(1.05)' },
          '66%':      { transform: 'translate(-10px, 10px) scale(0.97)' },
        },
        agMagicPop: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '70%':  { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        agBounceGenie: {
          '0%, 100%': { transform: 'translateY(0)' },
          '40%':      { transform: 'translateY(-6px)' },
          '60%':      { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        'fade-in':      'agFadeIn 200ms cubic-bezier(0.16,1,0.3,1) both',
        'genie-reveal': 'agGenieReveal 300ms cubic-bezier(0.16,1,0.3,1) both',
        'float':        'agFloat 3.5s ease-in-out infinite',
        'pulse-glow':   'agPulseGlow 2s ease-in-out infinite',
        'rotate-slow':  'agRotateSlow 12s linear infinite',
        'smoke':        'agSmoke 2s ease-out infinite',
        'sparkle':      'agSparkle 1.5s ease-in-out infinite',
        'magic-pop':    'agMagicPop 350ms cubic-bezier(0.16,1,0.3,1) both',
        'bounce-genie': 'agBounceGenie 1s ease-in-out infinite',
        'orb':          'agOrb 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
