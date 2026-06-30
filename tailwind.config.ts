import type { Config } from 'tailwindcss'
import { tailwindColors, fontFamily, radii, shadows } from './src/styles/tokens'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...tailwindColors,
        // Convenience: transparent + currentColor stay available by default.
      },
      fontFamily: {
        display: [...fontFamily.display],
        body: [...fontFamily.body],
        mono: [...fontFamily.mono],
        sans: [...fontFamily.body],
      },
      borderRadius: radii,
      boxShadow: shadows,
      maxWidth: {
        prose: '46rem',
        reading: '72rem',
        /* Optimal long-form measure — ~70–74 characters of Inter body copy. */
        measure: '40rem',
      },
      letterSpacing: {
        label: '0.18em',
      },
      transitionTimingFunction: {
        atlas: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(-12px,-10px,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        drift: 'drift 18s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
