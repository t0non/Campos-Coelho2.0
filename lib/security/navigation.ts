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
