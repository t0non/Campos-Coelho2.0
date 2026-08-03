export function safeRedirectPath(
  path: string | null | undefined,
  fallback: string = '/',
): string {
  if (!path || typeof path !== 'string') return fallback
  const normalized = path.trim()
  if (!normalized || normalized.length > 2048) return fallback
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(normalized)) return fallback
  if (normalized.startsWith('//') || !normalized.startsWith('/')) return fallback
  if (/[\u0000-\u001f\u007f\\]/.test(normalized)) return fallback
  return normalized
}

export function authCallbackFailurePath(
  type: string | null,
  errorCode: string | null = null,
): string {
  const normalizedErrorCode =
    errorCode && /^[a-z0-9_]{1,64}$/i.test(errorCode)
      ? errorCode
      : 'auth_callback_failed'

  if (type === 'recovery') {
    const params = new URLSearchParams({
      type: 'recovery',
      error_code: normalizedErrorCode,
    })
    return `/recuperar-senha?${params.toString()}`
  }

  if (type === 'invite') {
    const params = new URLSearchParams({ error_code: normalizedErrorCode })
    return `/aceitar-convite?${params.toString()}`
  }

  return '/login?error=auth_callback_failed'
}
