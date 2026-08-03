import { z } from 'zod'
import { validateCNPJ } from '../utils/masks.ts'

export const privacyRequestTypes = [
  'confirmation_access',
  'correction',
  'deletion_anonymization',
  'portability',
  'consent_revocation',
  'processing_information',
  'automated_decision_review',
  'other',
] as const

export const privacyRelationships = [
  'customer',
  'representative',
  'lead',
  'former_customer',
  'other',
] as const

export const privacyRequestSchema = z.object({
  requestType: z.enum(privacyRequestTypes),
  requesterName: z.string().trim().min(3).max(120),
  requesterEmail: z.string().trim().toLowerCase().email().max(254),
  companyCnpj: z
    .string()
    .trim()
    .max(18)
    .refine((value) => !value || validateCNPJ(value), 'CNPJ invalido.')
    .optional()
    .or(z.literal('')),
  relationship: z.enum(privacyRelationships),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(),
})

export const privacyRequestUpdateSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(['received', 'identity_check', 'in_progress', 'completed', 'rejected']),
  responseSummary: z.string().trim().max(2000).optional(),
})

export const newsletterUnsubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
})

export type PrivacyRequestInput = z.infer<typeof privacyRequestSchema>
