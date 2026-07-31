interface RateLimitEnvironment {
  RATE_LIMIT_SECRET?: string
  SUPABASE_SECRET_KEY?: string
}

export function getRateLimitSecret(
  environment: RateLimitEnvironment = process.env as RateLimitEnvironment,
): string {
  const secret =
    environment.RATE_LIMIT_SECRET?.trim() ||
    environment.SUPABASE_SECRET_KEY?.trim()

  if (!secret) throw new Error('Rate limit secret is not configured.')

  return secret
}
