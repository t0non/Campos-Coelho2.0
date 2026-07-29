const LOCAL_SITE_URL = 'http://localhost:3000'

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL

  if (!configuredUrl) return LOCAL_SITE_URL

  const normalizedUrl = configuredUrl.trim().replace(/\/+$/, '')
  const absoluteUrl = /^https?:\/\//i.test(normalizedUrl)
    ? normalizedUrl
    : `https://${normalizedUrl}`

  try {
    return new URL(absoluteUrl).origin
  } catch {
    return LOCAL_SITE_URL
  }
}
