import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AtacadoB2B — Plataforma de Atacado para Empresas',
    template: '%s | AtacadoB2B',
  },
  description:
    'Plataforma B2B para compras no atacado. Cadastre sua empresa e acesse preços exclusivos, pedido mínimo e condições especiais.',
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
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-neutral-50 font-sans text-neutral-900">
        {children}
      </body>
    </html>
  )
}
