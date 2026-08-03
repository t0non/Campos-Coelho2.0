const LOCAL_SITE_URL = 'http://localhost:3000'
const PRODUCTION_SITE_URL = 'https://campos-coelho2-0-seven.vercel.app'

export function getSiteUrl() {
  const configuredUrls = [
    process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter((value): value is string => Boolean(value?.trim()))

  for (const configuredUrl of configuredUrls) {
    const normalizedUrl = configuredUrl.trim().replace(/\/+$/, '')
    const absoluteUrl = /^https?:\/\//i.test(normalizedUrl)
      ? normalizedUrl
      : `https://${normalizedUrl}`

    try {
      const parsedUrl = new URL(absoluteUrl)
      const isLocal =
        parsedUrl.hostname === 'localhost' ||
        parsedUrl.hostname === '127.0.0.1' ||
        parsedUrl.hostname === '[::1]'

      if (process.env.NODE_ENV === 'production' && isLocal) continue
      return parsedUrl.origin
    } catch {
      continue
    }
  }

  return process.env.NODE_ENV === 'production'
    ? PRODUCTION_SITE_URL
    : LOCAL_SITE_URL
}
