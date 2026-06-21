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
          'bg-base':       'var(--ag-bg-base)',
          'bg-subtle':     'var(--ag-bg-subtle)',
          'bg-surface':    'var(--ag-bg-surface)',
          'bg-elevated':   'var(--ag-bg-elevated)',
          'border':        'var(--ag-border-base)',
          'border-strong': 'var(--ag-border-strong)',
          'fg-base':       'var(--ag-fg-base)',
          'fg-subtle':     'var(--ag-fg-subtle)',
          'fg-muted':      'var(--ag-fg-muted)',
          'fg-inverted':   'var(--ag-fg-inverted)',
          'accent':        'var(--ag-accent)',
          'accent-hover':  'var(--ag-accent-hover)',
          'accent-subtle': 'var(--ag-accent-subtle)',
          'genie':         'var(--ag-genie)',
          'genie-hover':   'var(--ag-genie-hover)',
          'genie-subtle':  'var(--ag-genie-subtle)',
          'success':       'var(--ag-success)',
          'warning':       'var(--ag-warning)',
          'error':         'var(--ag-error)',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'Georgia', 'serif'],
        sans:    ['Poppins', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      keyframes: {
        agFadeIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        agGenieReveal: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        agSparklePulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.08)' },
        },
      },
      animation: {
        'fade-in':       'agFadeIn 150ms cubic-bezier(0.16,1,0.3,1) both',
        'genie-reveal':  'agGenieReveal 200ms cubic-bezier(0.16,1,0.3,1) both',
        'sparkle-pulse': 'agSparklePulse 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
