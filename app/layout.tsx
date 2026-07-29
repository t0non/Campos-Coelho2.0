import type { Metadata } from 'next'
import './globals.css'
import { montserrat } from './fonts'
import { getSiteUrl } from '@/lib/utils/site-url'

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Campos & Coelho Atacado — Distribuição para empresas',
    template: '%s | Campos & Coelho Atacado',
  },
  description:
    'Distribuidora B2B para lojistas e empresas. Cadastre sua empresa e acesse preços, disponibilidade e condições comerciais.',
  robots: {
    index: true,
    follow: true,
  },
}

/**
 * Root Layout — único layout raiz da aplicação.
 * Todos os route groups ((loja), (auth), (conta), (admin))
 * são aninhados dentro deste layout.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-neutral-50 font-sans text-neutral-900">
        {children}
      </body>
    </html>
  )
}
