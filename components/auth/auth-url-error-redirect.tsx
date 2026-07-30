'use client'

import { useEffect } from 'react'

/**
 * Encaminha respostas de autenticação que o Supabase tenha enviado
 * acidentalmente para a raiz do site.
 */
export function AuthUrlErrorRedirect() {
  useEffect(() => {
    if (window.location.pathname !== '/') return

    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const errorCode = query.get('error_code') || hash.get('error_code')
    const recoveryType = query.get('type') || hash.get('type')

    if (errorCode) {
      const target = new URL('/recuperar-senha', window.location.origin)
      target.searchParams.set('type', 'recovery')
      target.searchParams.set('error_code', errorCode)
      window.location.replace(target.toString())
      return
    }

    if (recoveryType === 'recovery') {
      window.location.replace(
        `/recuperar-senha?type=recovery${window.location.hash}`,
      )
    }
  }, [])

  return null
}
