'use client'

import { useEffect } from 'react'

/**
 * Encaminha respostas de autenticação que o Supabase tenha enviado
 * acidentalmente para a raiz do site.
 */
export function AuthUrlErrorRedirect() {
  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const isRoot = window.location.pathname === '/'
    const isCallbackFailureOnLogin =
      window.location.pathname === '/login' &&
      query.get('error') === 'auth_callback_failed'

    if (!isRoot && !isCallbackFailureOnLogin) return

    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    const errorCode = query.get('error_code') || hash.get('error_code')
    const recoveryType = query.get('type') || hash.get('type')

    if (errorCode) {
      const isInvite = recoveryType === 'invite'
      const target = new URL(
        isInvite ? '/aceitar-convite' : '/recuperar-senha',
        window.location.origin,
      )
      if (!isInvite) target.searchParams.set('type', 'recovery')
      target.searchParams.set('error_code', errorCode)
      window.location.replace(target.toString())
      return
    }

    if (recoveryType === 'recovery') {
      window.location.replace(
        `/recuperar-senha?type=recovery${window.location.hash}`,
      )
      return
    }

    if (recoveryType === 'invite') {
      window.location.replace(`/aceitar-convite${window.location.hash}`)
    }
  }, [])

  return null
}
