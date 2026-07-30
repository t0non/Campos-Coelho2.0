import 'server-only'

import type { EmailContent } from '@/lib/email/templates'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM =
  'Campos & Coelho <nao-responda@distribuidoracamposcoelho.com.br>'

export interface SendEmailInput extends EmailContent {
  to: string | string[]
  idempotencyKey: string
  replyTo?: string
}

export type SendEmailResult =
  | { sent: true; id: string }
  | { sent: false; reason: 'not_configured' | 'invalid_recipient' | 'provider_error' }

export function normalizeEmailRecipients(value: string | string[]): string[] {
  const candidates = Array.isArray(value) ? value : [value]
  return [
    ...new Set(
      candidates
        .flatMap((candidate) => candidate.split(','))
        .map((candidate) => candidate.trim().toLowerCase())
        .filter((candidate) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate)),
    ),
  ]
}

function safeIdempotencyKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^A-Za-z0-9_.:-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

export async function sendTransactionalEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY não configurada; envio ignorado.')
    return { sent: false, reason: 'not_configured' }
  }

  const recipients = normalizeEmailRecipients(input.to)
  if (!recipients.length) return { sent: false, reason: 'invalid_recipient' }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': safeIdempotencyKey(input.idempotencyKey),
      },
      body: JSON.stringify({
        from: process.env.TRANSACTIONAL_FROM_EMAIL?.trim() || DEFAULT_FROM,
        to: recipients,
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    })

    if (!response.ok) {
      const providerRequestId = response.headers.get('x-request-id')
      console.error('[email] Falha no provedor.', {
        status: response.status,
        providerRequestId,
      })
      return { sent: false, reason: 'provider_error' }
    }

    const payload = (await response.json()) as { id?: string }
    return { sent: true, id: payload.id ?? 'accepted' }
  } catch (error) {
    console.error('[email] Falha de rede no envio.', {
      message: error instanceof Error ? error.message : 'erro desconhecido',
    })
    return { sent: false, reason: 'provider_error' }
  }
}
