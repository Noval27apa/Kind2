/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fbf7f0',
          100: '#f6efe3',
          200: '#ede1cc',
          300: '#e2d2b4',
        },
        espresso: {
          400: '#6b5440',
          500: '#5a4633',
          600: '#4a3829',
          700: '#382a1f',
          800: '#2a2018',
          900: '#1c1410',
        },
        sage: {
          300: '#a5b8a8',
          400: '#8aa090',
          500: '#6f8a76',
          600: '#5a7361',
          700: '#465d4d',
          800: '#384a3e',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px rgba(28, 20, 16, 0.06)',
        card: '0 4px 20px rgba(28, 20, 16, 0.08)',
        lift: '0 12px 32px rgba(28, 20, 16, 0.12)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
