import 'server-only'

import { createHmac } from 'node:crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRateLimitSecret } from '@/lib/security/rate-limit-secret'

interface RateLimitOptions {
  action: string
  maxAttempts: number
  windowSeconds: number
  subject?: string
}

function hashRateLimitKey(value: string): string {
  const secret = getRateLimitSecret()
  return createHmac('sha256', secret).update(value).digest('hex')
}

export async function consumePublicRateLimit({
  action,
  maxAttempts,
  windowSeconds,
  subject,
}: RateLimitOptions): Promise<boolean> {
  const requestHeaders = await headers()
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwarded || requestHeaders.get('x-real-ip')?.trim() || 'unknown'
  const keys = [`ip:${ip}`]
  if (subject) keys.push(`subject:${subject.trim().toLowerCase()}`)

  const admin = createAdminClient()
  for (const key of keys) {
    const { data, error } = await (admin.rpc as any)('consume_public_rate_limit', {
      p_key_hash: hashRateLimitKey(key),
      p_action: action,
      p_max_attempts: maxAttempts,
      p_window_seconds: windowSeconds,
    })

    if (error || data !== true) return false
  }

  return true
}
