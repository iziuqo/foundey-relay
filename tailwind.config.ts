import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        n: {
          0: 'var(--n-0)', 25: 'var(--n-25)', 50: 'var(--n-50)', 75: 'var(--n-75)',
          100: 'var(--n-100)', 200: 'var(--n-200)', 300: 'var(--n-300)', 400: 'var(--n-400)',
          500: 'var(--n-500)', 600: 'var(--n-600)', 800: 'var(--n-800)', 900: 'var(--n-900)',
        },
        accent: { DEFAULT: 'var(--accent)', bg: 'var(--accent-bg)', onInk: 'var(--accent-on-ink)' },
        focus: 'var(--focus)',
        now: { fg: 'var(--now-fg)', bg: 'var(--now-bg)', bgHover: 'var(--now-bg-hover)', border: 'var(--now-border)', solid: 'var(--now-solid)' },
        next: { fg: 'var(--next-fg)', bg: 'var(--next-bg)', border: 'var(--next-border)', icon: 'var(--next-icon)', rail: 'var(--next-rail)' },
        later: { fg: 'var(--later-fg)', bg: 'var(--later-bg)', border: 'var(--later-border)', icon: 'var(--later-icon)' },
        done: { fg: 'var(--done-fg)', bg: 'var(--done-bg)', border: 'var(--done-border)', solid: 'var(--done-solid)', fgStrong: 'var(--done-fg-strong)', onInk: 'var(--done-on-ink)' },
        fyi: { fg: 'var(--fyi-fg)', bg: 'var(--fyi-bg)', border: 'var(--fyi-border)', icon: 'var(--fyi-icon)' },
      },
      spacing: {
        1: 'var(--s-1)', 2: 'var(--s-2)', 3: 'var(--s-3)', 4: 'var(--s-4)', 5: 'var(--s-5)',
        6: 'var(--s-6)', 7: 'var(--s-7)', 8: 'var(--s-8)', 9: 'var(--s-9)', 10: 'var(--s-10)',
        11: 'var(--s-11)', 12: 'var(--s-12)',
      },
      borderRadius: {
        xs: 'var(--r-xs)', sm: 'var(--r-sm)', md: 'var(--r-md)', lg: 'var(--r-lg)', xl: 'var(--r-xl)', full: 'var(--r-full)',
      },
      boxShadow: {
        e1: 'var(--e-1)', e2: 'var(--e-2)', e3: 'var(--e-3)', e4: 'var(--e-4)',
      },
      fontFamily: {
        sans: 'var(--font)',
        display: 'var(--font-display)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)', in: 'var(--ease-in)', std: 'var(--ease-std)', pop: 'var(--ease-pop)',
      },
      transitionDuration: {
        press: 'var(--m-press)', hover: 'var(--m-hover)', enter: 'var(--m-enter)', exit: 'var(--m-exit)',
        list: 'var(--m-list)', hero: 'var(--m-hero)', check: 'var(--m-check)', flash: 'var(--m-flash)',
      },
    },
  },
  plugins: [],
} satisfies Config
