'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, KeyRound, ShieldCheck, UserPlus } from 'lucide-react'
import {
  createAdminUser,
  initialCreateAdminUserState,
} from '@/app/actions/admin-users'
import type { AdminUserListItem } from '@/lib/data/admin-users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdminUserManagerProps {
  admins: AdminUserListItem[]
  currentUserId: string
}

export function AdminUserManager({ admins, currentUserId }: AdminUserManagerProps) {
  const [state, formAction, pending] = useActionState(
    createAdminUser,
    initialCreateAdminUserState,
  )
  const [showPassword, setShowPassword] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset()
      setShowPassword(false)
    }
  }, [state])

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-200 px-5 py-4 sm:px-6">
          <h2 className="text-base font-extrabold text-neutral-950">Contas administrativas</h2>
          <p className="mt-1 text-xs leading-relaxed text-neutral-500">
            Cada pessoa deve utilizar sua própria conta. Senhas nunca são exibidas no painel.
          </p>
        </div>

        <div className="divide-y divide-neutral-100">
          {admins.map((admin) => (
            <article
              key={admin.id}
              className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                  <ShieldCheck className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-extrabold text-neutral-950">
                      {admin.fullName}
                    </h3>
                    {admin.isPrimary && (
                      <span className="rounded-full bg-neutral-950 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-white">
                        Conta principal
                      </span>
                    )}
                    {admin.id === currentUserId && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-xs text-neutral-600">{admin.email}</p>
                  <p className="mt-1 text-[10px] text-neutral-400">
                    Criada em {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <span
                className={
                  admin.status === 'active'
                    ? 'inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700'
                    : 'inline-flex w-fit items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-neutral-600'
                }
              >
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                {admin.status === 'active' ? 'Ativa' : 'Acesso bloqueado'}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex size-11 items-center justify-center rounded-xl bg-black text-white">
          <UserPlus className="size-5" aria-hidden="true" />
        </div>
        <h2 className="mt-4 text-base font-extrabold text-neutral-950">Novo administrador</h2>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Cadastre um e-mail individual e entregue a senha temporária somente à pessoa autorizada.
        </p>

        <form ref={formRef} action={formAction} className="mt-5 space-y-4">
          <Input
            name="fullName"
            label="Nome completo"
            autoComplete="name"
            required
            error={state.fieldErrors?.fullName?.[0]}
          />
          <Input
            name="email"
            label="Gmail ou e-mail"
            type="email"
            autoComplete="off"
            required
            error={state.fieldErrors?.email?.[0]}
          />
          <div className="relative">
            <Input
              name="password"
              label="Senha temporária"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              hint="Mínimo de 12 caracteres, com maiúscula, minúscula, número e símbolo."
              error={state.fieldErrors?.password?.[0]}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-3 top-[2.15rem] text-neutral-400 hover:text-neutral-800"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <Input
            name="passwordConfirmation"
            label="Confirmar senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            error={state.fieldErrors?.passwordConfirmation?.[0]}
          />

          {state.message && (
            <div
              role={state.status === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={
                state.status === 'success'
                  ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold leading-relaxed text-emerald-800'
                  : 'rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold leading-relaxed text-red-700'
              }
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            loading={pending}
            disabled={pending}
            fullWidth
            className="bg-black hover:bg-neutral-800"
          >
            <KeyRound className="size-4" aria-hidden="true" />
            Criar administrador
          </Button>
        </form>
      </section>
    </div>
  )
}
