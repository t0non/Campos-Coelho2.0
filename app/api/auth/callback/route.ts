import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/security/navigation'
import { getSiteUrl } from '@/lib/utils/site-url'

/**
 * Callback do Supabase Auth para OAuth, magic links e recuperação de senha.
 * Troca o código de autorização por uma sessão.
 *
 * Fluxos suportados:
 * - OAuth/magic link: redireciona para `next` (default: /)
 * - Recovery (type=recovery): redireciona para /recuperar-senha?type=recovery
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = safeRedirectPath(searchParams.get('next'))
  const baseUrl = process.env.NODE_ENV === 'development' ? origin : getSiteUrl()

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Para fluxo de recuperação de senha, redirecionar para a página de nova senha
      if (type === 'recovery') {
        const recoveryPath = '/recuperar-senha?type=recovery'
        return NextResponse.redirect(new URL(recoveryPath, baseUrl))
      }

      // Para outros fluxos (OAuth, magic link), usar o `next` param
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }

  // Redireciona para login com erro se algo falhar
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', baseUrl))
}
