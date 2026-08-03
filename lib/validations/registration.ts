import { z } from 'zod'
import { validateCNPJ, validateCPF } from '../utils/masks.ts'

const optionalPhoneSchema = z
  .string()
  .max(20)
  .refine(
    (value) => !value || value.replace(/\D/g, '').length >= 10,
    'Telefone inválido.',
  )
  .optional()

const optionalEmailSchema = z
  .union([z.literal(''), z.string().trim().email('E-mail inválido.').max(254)])
  .optional()

// 1. Schema da Empresa
export const companyStepSchema = z
  .object({
    cnpj: z
      .string()
      .min(1, 'CNPJ é obrigatório.')
      .refine((val) => validateCNPJ(val), 'CNPJ inválido (verifique os dígitos).'),
    companyName: z.string().trim().min(3, 'Nome da empresa deve ter no mínimo 3 caracteres.').max(160),
    tradingName: z.string().trim().max(120).optional(),
    stateRegistration: z.string().trim().max(40).optional(),
    isStateRegistrationExempt: z.boolean().optional(),
    segment: z.string().trim().min(1, 'Selecione o segmento de atuação.').max(80),
    businessType: z.string().trim().min(1, 'Selecione o tipo de negócio.').max(80),
    employeeCount: z.string().trim().max(40).optional(),
    phone: optionalPhoneSchema,
    whatsapp: optionalPhoneSchema,
    email: optionalEmailSchema,
    website: z
      .string()
      .trim()
      .url('URL inválida.')
      .max(300)
      .refine((value) => /^https?:\/\//i.test(value), 'Use um endereço HTTP ou HTTPS.')
      .optional()
      .or(z.literal('')),
    foundationYear: z.string().regex(/^\d{4}$/, 'Ano inválido.').optional().or(z.literal('')),
  })
  .refine(
    (data) => data.isStateRegistrationExempt || (data.stateRegistration && data.stateRegistration.trim().length > 0),
    {
      message: 'Informe a Inscrição Estadual ou marque "Isento".',
      path: ['stateRegistration'],
    },
  )

export type CompanyStepFormValues = z.infer<typeof companyStepSchema>

// 2. Schema do Responsável
export const responsibleStepSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Nome completo é obrigatório.').max(120),
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório.')
      .refine((val) => validateCPF(val), 'CPF inválido (verifique os dígitos).'),
    role: z.string().trim().max(80).optional(),
    department: z.string().trim().max(80).optional(),
    email: z.string().trim().email('E-mail pessoal/corporativo inválido.').max(254),
    phone: optionalPhoneSchema,
    whatsapp: z.string().min(10, 'WhatsApp inválido.').max(20),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres.')
      .max(128, 'Senha deve ter no máximo 128 caracteres.')
      .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula.')
      .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula.')
      .regex(/[0-9]/, 'Deve conter pelo menos um número.')
      .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial.'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória.').max(128),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type ResponsibleStepFormValues = z.infer<typeof responsibleStepSchema>

// 3. Schema de Endereço
export const addressSchema = z.object({
  cep: z.string().min(8, 'CEP inválido (8 dígitos).'),
  street: z.string().trim().min(3, 'Logradouro é obrigatório.').max(160),
  number: z.string().trim().min(1, 'Número é obrigatório.').max(30),
  complement: z.string().trim().max(100).optional(),
  neighborhood: z.string().trim().min(2, 'Bairro é obrigatório.').max(100),
  city: z.string().trim().min(2, 'Cidade é obrigatória.').max(100),
  state: z.string().length(2, 'UF inválida (2 letras).'),
  referencePoint: z.string().trim().max(160).optional(),
})

// 4. Schema do Conjunto de Endereços
export const addressesStepSchema = z
  .object({
    fiscal: addressSchema,
    shipping: addressSchema.optional(),
    isShippingSameAsFiscal: z.boolean().optional(),
    billing: addressSchema.optional(),
    isBillingSameAsFiscal: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.isShippingSameAsFiscal && !data.shipping) {
      ctx.addIssue({ code: 'custom', path: ['shipping'], message: 'Informe o endereço de entrega.' })
    }
    if (!data.isBillingSameAsFiscal && !data.billing) {
      ctx.addIssue({ code: 'custom', path: ['billing'], message: 'Informe o endereço de cobrança.' })
    }
  })

export type AddressesStepFormValues = z.infer<typeof addressesStepSchema>

// 5. Schema dos Interesses
export const commercialInterestsStepSchema = z.object({
  categories: z.array(z.string().trim().min(1).max(80)).max(30).optional(),
  mainProducts: z.string().trim().max(500).optional(),
  purchaseFrequency: z.string().trim().max(80).optional(),
  averageOrderValue: z.string().trim().min(1, 'Selecione a faixa média de valor.').max(80),
  storeCount: z.string().trim().max(20).optional(),
  operatingStates: z.array(z.string().trim().length(2)).max(27).optional(),
  salesChannel: z.string().trim().max(80).optional(),
  howDidYouHear: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
})

export type CommercialInterestsStepFormValues = z.infer<typeof commercialInterestsStepSchema>

// 6. Schema dos Consentimentos
export const consentsStepSchema = z.object({
  termsOfUse: z.boolean().refine((val) => val === true, 'Aceite os Termos de Uso.'),
  privacyPolicy: z.boolean().refine((val) => val === true, 'Aceite a Política de Privacidade.'),
  lgpdDataProcessing: z
    .boolean()
    .refine((val) => val === true, 'Autorize o tratamento dos dados cadastrais.'),
  declarationOfTruth: z
    .boolean()
    .refine((val) => val === true, 'Declare que as informações são verdadeiras.'),
  receiveNewsletter: z.boolean().optional(),
  allowWhatsAppContact: z.boolean().optional(),
  allowEmailCampaigns: z.boolean().optional(),
})

export type ConsentsStepFormValues = z.infer<typeof consentsStepSchema>

// Dados necessarios para o cadastro usam bases legais proprias (execucao de
// procedimentos pre-contratuais e obrigacoes aplicaveis), e nao um
// "consentimento LGPD" generico. Mantemos a chave antiga apenas como opcional
// para aceitar envios iniciados antes desta versao.
export const registrationAcknowledgementsSchema = consentsStepSchema.extend({
  privacyPolicy: z
    .boolean()
    .refine((value) => value === true, 'Confirme a leitura do Aviso de Privacidade.'),
  lgpdDataProcessing: z.boolean().optional(),
  receiveNewsletter: z.boolean().optional(),
})

/**
 * Calculador de força de senha (0 a 4).
 */
export function getPasswordStrength(password: string): {
  score: number
  label: string
  color: string
} {
  if (!password) return { score: 0, label: 'Muito fraca', color: 'bg-slate-200' }

  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score: 1, label: 'Fraca', color: 'bg-red-500' }
  if (score === 3) return { score: 2, label: 'Média', color: 'bg-amber-500' }
  if (score === 4) return { score: 3, label: 'Forte', color: 'bg-blue-500' }
  return { score: 4, label: 'Excelente', color: 'bg-green-600' }
}

// 7. Schema Unificado (Para Formulário Contínuo)
export const fullRegistrationSchema = z.object({
  company: companyStepSchema,
  responsible: responsibleStepSchema,
  addresses: addressesStepSchema,
  documents: z.array(z.unknown()).optional(), // The file upload logic handles this manually in the component for now or via a specific schema
  interests: commercialInterestsStepSchema,
  consents: registrationAcknowledgementsSchema,
})

export type FullRegistrationFormValues = z.infer<typeof fullRegistrationSchema>
