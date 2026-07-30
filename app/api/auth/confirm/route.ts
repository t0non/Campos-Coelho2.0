import type { EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const allowedTypes = new Set<EmailOtpType>(['invite', 'recovery'])

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const requestedType = searchParams.get('type') as EmailOtpType | null
  const baseUrl = origin

  if (tokenHash && requestedType && allowedTypes.has(requestedType)) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: requestedType,
    })

    if (!error) {
      const destination =
        requestedType === 'invite'
          ? '/aceitar-convite'
          : '/recuperar-senha?type=recovery'

      return NextResponse.redirect(new URL(destination, baseUrl))
    }
  }

  const errorDestination =
    requestedType === 'invite'
      ? '/aceitar-convite?error_code=otp_expired'
      : '/recuperar-senha?type=recovery&error_code=otp_expired'

  return NextResponse.redirect(new URL(errorDestination, baseUrl))
}
