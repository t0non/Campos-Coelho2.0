export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { CircleAlert, ShieldCheck } from 'lucide-react'
import { AdminUserManager } from '@/components/admin/admin-user-manager'
import { getAdminUsers } from '@/lib/data/admin-users'
import { requireAdmin } from '@/lib/supabase/auth'

export const metadata: Metadata = {
  title: 'Administradores — Campos & Coelho',
}

export default async function AdminUsersPage() {
  const context = await requireAdmin()
  const admins = await getAdminUsers()

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
            Segurança de acesso
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
            Administradores
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
            Cadastre acessos individuais para quem pode administrar a loja.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <ShieldCheck className="size-4 text-neutral-500" aria-hidden="true" />
          <span className="text-xs font-extrabold text-neutral-900">
            {admins.length} {admins.length === 1 ? 'administrador' : 'administradores'}
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
        <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-extrabold">Mantenha pelo menos duas contas administrativas</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            A conta principal fica identificada nesta página. Em caso de senha esquecida, use a
            recuperação por e-mail; não existe uma senha geral ou compartilhada.
          </p>
        </div>
      </div>

      <AdminUserManager admins={admins} currentUserId={context.user!.id} />
    </div>
  )
}
