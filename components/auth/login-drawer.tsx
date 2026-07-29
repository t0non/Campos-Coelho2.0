'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/auth/login-form'

interface LoginDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginDrawer({ isOpen, onClose }: LoginDrawerProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('overflow-hidden')
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        type="button"
        aria-label="Fechar login"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/45"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-[505px] flex-col overflow-y-auto border-l border-neutral-200 bg-white shadow-[-24px_0_70px_rgba(0,0,0,0.16)]"
      >
        <div className="px-7 pb-10 pt-3 sm:px-8">
          <button
            type="button"
            onClick={onClose}
            className="mb-3 flex items-center gap-3 text-sm font-bold text-[#171717] hover:text-[#050505]"
          >
            <ArrowLeft className="h-5 w-5" />
            voltar
          </button>

          <Link href="/" onClick={onClose} className="inline-flex">
            <Image
              src="/logo_campos_coelho.png"
              alt="Campos & Coelho"
              width={220}
              height={55}
              className="h-auto object-contain"
            />
          </Link>

          <h2
            id="login-drawer-title"
            className="mt-6 text-xl font-extrabold text-[#171717]"
          >
            Bem-vindo à Campos & Coelho
          </h2>
          <p className="mt-3 text-sm leading-snug text-[#333333]">
            Se você já possui cadastro em nossa loja, informe abaixo seus dados de login
            para entrar.
          </p>

          <div className="mt-5">
            <LoginForm variant="drawer" />
          </div>

          <div className="my-10 border-t border-slate-200" />

          <h3 className="text-lg font-extrabold text-slate-500">
            Ainda não possui cadastro?
          </h3>
          <p className="mt-3 text-sm leading-snug text-[#333333]">
            Preencha nosso formulário empresarial para solicitar acesso às condições de
            atacado.
          </p>
          <Link
            href="/cadastro"
            onClick={onClose}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-lg bg-black text-sm font-extrabold text-white transition-colors hover:bg-neutral-800"
          >
            CADASTRE-SE
          </Link>
        </div>
      </aside>
    </div>
  )
}
