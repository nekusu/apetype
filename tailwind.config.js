/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        caret: 'caret 1s steps(2, jump-none) infinite',
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
        DEFAULT: 'var(--font)',
      },
      keyframes: {
        caret: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};
