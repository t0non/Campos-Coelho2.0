'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
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
          <a href="/" className="inline-block">
            <span className="text-2xl font-bold text-gray-900">
              Atacado<span className="text-blue-600">B2B</span>
            </span>
          </a>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
