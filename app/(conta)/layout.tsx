import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { SidebarAccount } from '@/components/layout/sidebar-account'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getAuthContext } from '@/lib/supabase/auth'
import { getCategories } from '@/lib/supabase/queries/categories'
import { getActiveCartSummary } from '@/lib/data/cart'
import type { CartSummary } from '@/lib/types/cart'

export const metadata: Metadata = {
  title: 'Minha Conta',
}

/**
 * Layout da área de conta do cliente.
 * Verifica autenticação no servidor — redireciona se não autenticado.
 * Aninhado dentro do RootLayout global.
 */
export default async function ContaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [ctx, categories] = await Promise.all([
    getAuthContext(),
    getCategories(),
  ])
  const headerCategories = categories
    .filter((category) => !category.parent_id)
    .map(({ id, name, slug }) => ({ id, name, slug }))

  // Proteção server-side (proxy.ts já redireciona, mas verificamos novamente)
  if (!ctx.user) {
    redirect('/login')
  }

  const emptyCart: CartSummary = {
    items: [],
    count: 0,
    subtotal: 0,
    hasUnavailable: false,
  }
  const cartSummary = ctx.user ? await getActiveCartSummary(null) : emptyCart

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        authContext={ctx}
        cartSummary={cartSummary}
        categories={headerCategories}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 lg:py-8">
        <SidebarAccount />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
