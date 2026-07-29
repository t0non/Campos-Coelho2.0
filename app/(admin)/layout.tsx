import { redirect } from 'next/navigation'
import { SidebarAdmin } from '@/components/layout/sidebar-admin'
import { getAuthContext } from '@/lib/supabase/auth'

/**
 * Layout administrativo.
 * Verifica role=admin no servidor — redireciona qualquer outro usuário.
 * Aninhado dentro do RootLayout global.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await getAuthContext()

  // Verificação dupla: proxy.ts + servidor
  if (!ctx.user) {
    redirect('/login')
  }

  if (ctx.user.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen min-w-0 bg-neutral-50">
      <SidebarAdmin />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar admin */}
        <header className="border-b border-gray-100 bg-white py-4 pl-16 pr-4 sm:pr-6 md:px-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              Painel Administrativo
            </span>
            <span className="text-xs text-gray-500">
              {ctx.user.full_name ?? ctx.user.email}
            </span>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
