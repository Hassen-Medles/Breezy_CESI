module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-clip-text',
    'text-transparent',
  ],
  theme: {
    extend: {
      fontFamily: {
        archivo: ['var(--font-archivo)'],
        'archivo-black': ['var(--font-archivo-black)'],
      },
    },
  },
  plugins: [],
};