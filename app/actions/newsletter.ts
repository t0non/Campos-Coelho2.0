'use server'

import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

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

  const supabase = createAdminClient()
  const { error } = await supabase.from('newsletter_leads').insert({
    email: parsed.data.email,
    name: parsed.data.name || null,
    company_name: parsed.data.companyName || null,
  })

  if (error?.code === '23505') {
    return { success: true, message: 'Este e-mail já recebe nossas novidades.' }
  }

  if (error) {
    console.error('Falha ao cadastrar newsletter:', error.message)
    return { success: false, message: 'Não foi possível concluir agora. Tente novamente.' }
  }

  return { success: true, message: 'Inscrição realizada com sucesso.' }
}
