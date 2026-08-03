import { Montserrat } from 'next/font/google'

export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: 'variable',
  display: 'swap',
  variable: '--font-montserrat',
  fallback: ['Arial', 'sans-serif'],
})
