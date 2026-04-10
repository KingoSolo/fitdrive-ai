/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        headline: ['"Space Grotesk"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      colors: {
        // Landing colors
        'blue-primary': '#2196F3',
        'blue-hover': '#1976D2',
        'blue-ghost': '#E3F2FD',
        // Material Design 3 color tokens
        'surface-variant': '#e0e3e5',
        'surface-container': '#eceef0',
        'surface-bright': '#f7f9fb',
        'on-surface-variant': '#404752',
        'on-surface': '#191c1e',
        'secondary-fixed-dim': '#a9c9f2',
        'surface-container-highest': '#e0e3e5',
        'surface': '#f7f9fb',
        'on-primary': '#ffffff',
        'background': '#f7f9fb',
        'surface-container-high': '#e6e8ea',
        'secondary-container': '#b4d4fe',
        'on-secondary-container': '#3c5c7f',
        'on-background': '#191c1e',
        'surface-container-low': '#f2f4f6',
        'inverse-primary': '#9ecaff',
        'primary': '#0061a4',
        'primary-container': '#2196f3',
        'on-primary-container': '#002c4f',
        'surface-container-lowest': '#ffffff',
        'outline': '#707883',
        'outline-variant': '#bfc7d4',
        'surface-dim': '#d8dadc',
        'inverse-surface': '#2d3133',
        'on-primary-fixed': '#001d36',
      },
      boxShadow: {
        ambient: '0 4px 20px rgba(25,28,30,0.04), 0 12px 40px rgba(25,28,30,0.08)',
      },
    },
  },
  plugins: [],
}
