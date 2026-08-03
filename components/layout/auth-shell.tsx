'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

interface AuthShellProps {
  children: ReactNode
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function AuthShell({ children, categories }: AuthShellProps) {
  const pathname = usePathname()
  const isRegistrationRoute = pathname.startsWith('/cadastro')

  if (isRegistrationRoute) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Header categories={categories} showNavigation={false} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            aria-label="Voltar para a página inicial"
            className="inline-flex min-h-14 items-center justify-center rounded-lg px-3"
          >
            <Image
              src="/logo_campos_coelho.png"
              alt="Campos & Coelho Distribuidora e Atacado"
              width={225}
              height={56}
              className="h-auto w-[220px] object-contain sm:w-[240px]"
              priority
            />
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
