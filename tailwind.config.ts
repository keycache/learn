import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'dark',
    'dark:bg-slate-950',
    'dark:text-indigo-400',
  ],
} satisfies Config
