import { defineConfig, presetWind } from 'unocss';

export default defineConfig({
  presets: [presetWind()],
  theme: {
    animation: {
      keyframes: {
        caret: '{ 0% { opacity: 1 } 100% { opacity: 0 } }',
      },
      durations: {
        caret: '1s',
      },
      timingFns: {
        caret: 'steps(2, jump-none)',
      },
      counts: {
        caret: 'infinite',
      },
    },
    colors: {
      bg: 'var(--bg-color)',
      main: 'var(--main-color)',
      caret: 'var(--caret-color)',
      sub: 'var(--sub-color)',
      'sub-alt': 'var(--sub-alt-color)',
      text: 'var(--text-color)',
      error: 'var(--error-color)',
      'error-extra': 'var(--error-extra-color)',
      'colorful-error': 'var(--colorful-error-color)',
      'colorful-error-extra': 'var(--colorful-error-extra-color)',
    },
    fontFamily: {
      default: 'var(--font)',
    },
  },
});
