'use client'

import { useSearchParams } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export function AcceptInviteContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error_code')

  return (
    <>
      <div className="mb-6 text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">
          Acesso administrativo
        </p>
        <h1 className="text-xl font-bold text-gray-900">Criar senha de acesso</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Defina uma senha segura para ativar seu acesso ao painel da Campos &amp; Coelho.
        </p>
      </div>
      <ResetPasswordForm flow="invite" initiallyInvalid={Boolean(errorCode)} />
    </>
  )
}
