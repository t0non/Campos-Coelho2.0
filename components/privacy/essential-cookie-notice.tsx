'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'campos_coelho_cookie_notice_v1'

export function EssentialCookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'dismissed')
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'dismissed')
    } catch {
      // O aviso pode ser fechado mesmo quando o navegador bloqueia armazenamento local.
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside
      aria-label="Aviso sobre cookies necessarios"
      className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:bottom-5 sm:flex sm:items-center sm:gap-5 sm:p-5"
    >
      <div className="min-w-0 flex-1 pr-8 sm:pr-0">
        <p className="text-sm font-extrabold text-slate-950">Cookies necess&aacute;rios</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Usamos apenas recursos essenciais para login, seguran&ccedil;a e funcionamento do carrinho.
          N&atilde;o usamos cookies de publicidade.{' '}
          <Link href="/politica-de-privacidade#cookies" className="font-bold underline underline-offset-2">
            Entenda o uso
          </Link>
          .
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-neutral-950 px-4 text-xs font-bold text-white hover:bg-neutral-800 sm:mt-0 sm:w-auto"
      >
        Entendi
      </button>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800 sm:hidden"
        aria-label="Fechar aviso"
      >
        <X className="h-4 w-4" />
      </button>
    </aside>
  )
}
