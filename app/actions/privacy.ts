'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { consumePublicRateLimit } from '@/lib/security/public-rate-limit'
import {
  newsletterUnsubscribeSchema,
  privacyRequestSchema,
  privacyRequestUpdateSchema,
  type PrivacyRequestInput,
} from '@/lib/validations/privacy'
import { sendTransactionalEmail } from '@/lib/email/sender'
import { PRIVACY_CONTACT_EMAIL } from '@/lib/privacy/config'

const REQUEST_RESPONSE_TARGET_DAYS = 15

export type PrivacyRequestResult =
  | { success: true; protocol: string }
  | { success: false; error: string }

function requestDueDate(): string {
  const due = new Date()
  due.setUTCDate(due.getUTCDate() + REQUEST_RESPONSE_TARGET_DAYS)
  return due.toISOString()
}

function createProtocol(): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `LGPD-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function submitPrivacyRequest(
  input: PrivacyRequestInput,
): Promise<PrivacyRequestResult> {
  const parsed = privacyRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: 'Revise os dados da solicitacao.' }
  }

  if (parsed.data.website) {
    return { success: true, protocol: createProtocol() }
  }

  const allowed = await consumePublicRateLimit({
    action: 'privacy_rights_request',
    maxAttempts: 5,
    windowSeconds: 24 * 60 * 60,
    subject: parsed.data.requesterEmail,
  })
  if (!allowed) {
    return { success: false, error: 'Limite de solicitacoes atingido. Tente novamente mais tarde.' }
  }

  const supabase = createAdminClient()
  const protocol = createProtocol()
  const cleanCnpj = parsed.data.companyCnpj?.replace(/\D/g, '') || null
  const { data: request, error } = await supabase
    .from('privacy_requests')
    .insert({
      protocol,
      request_type: parsed.data.requestType,
      requester_name: parsed.data.requesterName,
      requester_email: parsed.data.requesterEmail,
      company_cnpj: cleanCnpj,
      relationship: parsed.data.relationship,
      message: parsed.data.message,
      status: 'received',
      due_at: requestDueDate(),
    })
    .select('id')
    .single()

  if (error || !request) {
    console.error('[privacy] Falha ao registrar solicitacao:', error?.message)
    return { success: false, error: 'Nao foi possivel registrar agora. Tente novamente.' }
  }

  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .eq('status', 'active')

  if (admins?.length) {
    await supabase.from('notifications').insert(
      admins.map((admin) => ({
        profile_id: admin.id,
        title: 'Nova solicitacao de privacidade',
        message: `Protocolo ${protocol} recebido para analise.`,
        type: 'privacy_request',
        link_url: '/admin/privacidade',
      })),
    )
  }

  await supabase.from('audit_logs').insert({
    action: 'privacy_request_received',
    target_table: 'privacy_requests',
    target_id: request.id,
    payload: { protocol, request_type: parsed.data.requestType },
  })

  await sendTransactionalEmail({
    to: parsed.data.requesterEmail,
    idempotencyKey: `privacy-request-received-${request.id}`,
    ...(PRIVACY_CONTACT_EMAIL ? { replyTo: PRIVACY_CONTACT_EMAIL } : {}),
    subject: `Solicitacao de privacidade recebida | ${protocol}`,
    text: `Ola, ${parsed.data.requesterName}. Recebemos sua solicitacao de privacidade. Protocolo: ${protocol}. Para proteger seus dados, podemos confirmar sua identidade antes da resposta.`,
    html: `<p>Ola, ${escapeHtml(parsed.data.requesterName)}.</p><p>Recebemos sua solicitacao de privacidade.</p><p><strong>Protocolo: ${protocol}</strong></p><p>Para proteger seus dados, podemos confirmar sua identidade antes da resposta.</p>`,
  })

  return { success: true, protocol }
}

export async function updatePrivacyRequest(input: unknown) {
  const context = await requireAdmin()
  const parsed = privacyRequestUpdateSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Atualizacao invalida.' }

  const terminal = parsed.data.status === 'completed' || parsed.data.status === 'rejected'
  if (terminal && !parsed.data.responseSummary) {
    return { success: false, error: 'Registre um resumo da resposta antes de concluir.' }
  }

  const supabase = createAdminClient()
  const { data: request } = await supabase
    .from('privacy_requests')
    .select('requester_name, requester_email, protocol')
    .eq('id', parsed.data.requestId)
    .maybeSingle()
  if (!request) return { success: false, error: 'Solicitacao nao encontrada.' }

  const { error } = await supabase
    .from('privacy_requests')
    .update({
      status: parsed.data.status,
      response_summary: parsed.data.responseSummary || null,
      assigned_to: context.user!.id,
      resolved_at: terminal ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.requestId)

  if (error) return { success: false, error: 'Nao foi possivel atualizar a solicitacao.' }

  await supabase.from('audit_logs').insert({
    actor_id: context.user!.id,
    action: 'privacy_request_status_updated',
    target_table: 'privacy_requests',
    target_id: parsed.data.requestId,
    payload: { status: parsed.data.status },
  })

  if (terminal && parsed.data.responseSummary) {
    await sendTransactionalEmail({
      to: request.requester_email,
      idempotencyKey: `privacy-request-${parsed.data.requestId}-${parsed.data.status}`,
      ...(PRIVACY_CONTACT_EMAIL ? { replyTo: PRIVACY_CONTACT_EMAIL } : {}),
      subject: `Resposta da solicitacao de privacidade | ${request.protocol}`,
      text: `Ola, ${request.requester_name}. Sua solicitacao ${request.protocol} foi atualizada. Resposta: ${parsed.data.responseSummary}`,
      html: `<p>Ola, ${escapeHtml(request.requester_name)}.</p><p>Sua solicitacao <strong>${request.protocol}</strong> foi atualizada.</p><p><strong>Resposta:</strong></p><p>${escapeHtml(parsed.data.responseSummary).replaceAll('\n', '<br />')}</p>`,
    })
  }

  revalidatePath('/admin/privacidade')
  return { success: true }
}

export async function unsubscribeNewsletter(email: string) {
  const parsed = newsletterUnsubscribeSchema.safeParse({ email })
  if (!parsed.success) return { success: false, error: 'Informe um e-mail valido.' }

  const allowed = await consumePublicRateLimit({
    action: 'newsletter_unsubscribe',
    maxAttempts: 10,
    windowSeconds: 60 * 60,
    subject: parsed.data.email,
  })
  if (!allowed) return { success: false, error: 'Tente novamente mais tarde.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('newsletter_leads')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('email', parsed.data.email)

  if (error) return { success: false, error: 'Nao foi possivel concluir agora.' }
  return {
    success: true,
    message: 'Se o e-mail estava inscrito, o cancelamento foi registrado.',
  }
}
