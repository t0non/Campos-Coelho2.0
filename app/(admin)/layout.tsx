import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, ShieldCheck } from 'lucide-react'
import { SidebarAdmin } from '@/components/layout/sidebar-admin'
import { LogoutButton } from '@/components/auth/logout-button'
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
    <div className="min-h-screen min-w-0 bg-neutral-50 md:grid md:grid-cols-[15.5rem_minmax(0,1fr)]">
      <SidebarAdmin />
      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 pl-16 pr-4 backdrop-blur sm:pr-6 md:px-7">
          <div className="mx-auto flex h-16 w-full max-w-[96rem] items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold tracking-tight text-neutral-950">
                Painel administrativo
              </p>
              <p className="hidden text-xs text-neutral-500 sm:block">
                Operação, catálogo e atendimento em um só lugar
              </p>
            </div>

            <div className="flex min-w-0 items-center gap-3">
              <Link
                href="/"
                className="hidden items-center gap-2 border-r border-neutral-200 pr-4 text-xs font-bold text-neutral-600 transition-colors hover:text-neutral-950 sm:flex"
              >
                Ver loja
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p className="max-w-48 truncate text-xs font-bold text-neutral-900">
                    {ctx.user.full_name ?? ctx.user.email}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">
                    Administrador
                  </p>
                </div>
              </div>
              <LogoutButton
                redirectTo="/login"
                fullWidth={false}
                className="h-8 shrink-0 px-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-100 hover:text-red-600 sm:px-3"
              />
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[96rem]">{children}</div>
        </main>
      </div>
    </div>
  )
}
