'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { consumePublicRateLimit } from '@/lib/security/public-rate-limit'
import { PRIVACY_POLICY_VERSION } from '@/lib/privacy/config'

const newsletterSchema = z.object({
  name: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  companyName: z.string().trim().max(180).optional(),
  website: z.string().max(0).optional(),
})

export interface NewsletterActionResult {
  success: boolean
  message: string
}

export async function subscribeNewsletterAction(input: {
  name?: string
  email: string
  companyName?: string
  website?: string
}): Promise<NewsletterActionResult> {
  const parsed = newsletterSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: 'Confira o e-mail informado.' }
  }

  if (parsed.data.website) {
    return { success: true, message: 'Inscrição recebida.' }
  }

  const allowed = await consumePublicRateLimit({
    action: 'newsletter_subscription',
    maxAttempts: 10,
    windowSeconds: 3600,
    subject: parsed.data.email,
  })
  if (!allowed) {
    return { success: false, message: 'Muitas tentativas. Aguarde um pouco e tente novamente.' }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('newsletter_leads').upsert(
    {
      email: parsed.data.email,
      name: parsed.data.name || null,
      company_name: parsed.data.companyName || null,
      consent_at: new Date().toISOString(),
      consent_source: 'website_footer',
      privacy_policy_version: PRIVACY_POLICY_VERSION,
      unsubscribed_at: null,
    },
    { onConflict: 'email' },
  )

  if (error?.code === '23505') {
    return { success: true, message: 'Este e-mail já recebe nossas novidades.' }
  }

  if (error) {
    console.error('Falha ao cadastrar newsletter:', error.message)
    return { success: false, message: 'Não foi possível concluir agora. Tente novamente.' }
  }

  return { success: true, message: 'Inscrição realizada com sucesso.' }
}
