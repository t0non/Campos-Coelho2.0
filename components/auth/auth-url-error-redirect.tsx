'use client'

import { useEffect } from 'react'

/**
 * Encaminha respostas de autenticação que o Supabase tenha enviado
 * acidentalmente para a raiz do site.
 */
export function AuthUrlErrorRedirect() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const errorCode = query.get('error_code') || hash.get('error_code')
    const recoveryType = query.get('type') || hash.get('type')
    const isInvite = recoveryType === 'invite'
    const targetPath = isInvite ? '/aceitar-convite' : '/recuperar-senha'

    if (recoveryType !== 'invite' && recoveryType !== 'recovery' && !errorCode) {
      return
    }

    if (errorCode) {
      if (window.location.pathname === targetPath) return

      const target = new URL(targetPath, window.location.origin)
      if (!isInvite) target.searchParams.set('type', 'recovery')
      target.searchParams.set('error_code', errorCode)
      window.location.replace(target.toString())
      return
    }

    if (recoveryType === 'recovery' && window.location.pathname !== targetPath) {
      window.location.replace(
        `/recuperar-senha?type=recovery${window.location.hash}`,
      )
      return
    }

    if (recoveryType === 'invite' && window.location.pathname !== targetPath) {
      window.location.replace(`/aceitar-convite${window.location.hash}`)
    }
  }, [])

  return null
}
