export const PRIVACY_POLICY_VERSION = '2026-08-03'
export const TERMS_VERSION = '2026-08-03'

export const CONTROLLER_LEGAL_NAME =
  process.env.NEXT_PUBLIC_CONTROLLER_LEGAL_NAME?.trim() || 'Campos & Coelho Atacado'

export const CONTROLLER_CNPJ =
  process.env.NEXT_PUBLIC_CONTROLLER_CNPJ?.trim() || ''

export const PRIVACY_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL?.trim() || ''

export const REJECTED_DOCUMENT_RETENTION_DAYS = 180

export function addDays(date: Date, days: number): string {
  const result = new Date(date)
  result.setUTCDate(result.getUTCDate() + days)
  return result.toISOString()
}
