import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'light-txt': colors.zinc['900'],
        'light-hov': colors.sky['500'],
        'light-lite': colors.gray['400'],
        'light-lite-hov': colors.gray['50'],
        'light-bg': colors.white,
        'light-bg-hov': colors.gray['100'],
        'light-body': colors.slate['100'],
  
        'dark-txt': colors.slate['200'],
        'dark-hov': colors.sky['500'],
        'dark-bg': colors.slate['800'],
        'dark-bg-hov': colors.gray['700'],
        'dark-bg-lite': colors.gray['700'],
        'dark-bg-lite-hov': colors.gray['600'],
        'dark-body': colors.slate['900'],
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio')
  ],
}
export default config
