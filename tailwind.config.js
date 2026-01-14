/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#242aeb',
                    50: '#eff0ff',
                    100: '#dfe1ff',
                    200: '#c6c9ff',
                    300: '#a3a6ff',
                    400: '#7d7aff',
                    500: '#5f52ff',
                    600: '#4b2ff7',
                    700: '#242aeb',
                    800: '#1d1fc0',
                    900: '#1b1d99',
                    950: '#0f1066',
                },
                'background-light': '#f9fafb',
                'background-dark': '#111121',
                'accent-warning': '#F59E0B',
                'slate-dark': '#0e0e1b',
                'slate-medium': '#4d4f99',
                'slate-light': '#e7e8f3',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                DEFAULT: '0.5rem',
                'lg': '0.5rem',
                'xl': '0.75rem',
                'full': '9999px',
                '4xl': '2rem',
            },
        },
    },
    plugins: [],
}
