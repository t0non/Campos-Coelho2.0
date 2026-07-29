import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext, requireAdmin } from '@/lib/supabase/auth'
import { validateCNPJ } from '@/lib/utils/masks'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = any

/**
 * Interface para submissão ou atualização de dados empresariais do cliente.
 */
export interface SaveCompanyDataInput {
  cnpj: string
  company_name: string
  trade_name?: string
  state_registration?: string
  segment?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  // Endereço
  zip_code: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

const saveCompanyDataSchema = z.object({
  cnpj: z.string().min(14).max(18),
  company_name: z.string().trim().min(3).max(160),
  trade_name: z.string().trim().max(120).optional(),
  state_registration: z.string().trim().max(40).optional(),
  segment: z.string().trim().max(80).optional(),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal('')),
  website: z
    .string()
    .trim()
    .url()
    .max(300)
    .refine((value) => /^https?:\/\//i.test(value), 'Use um endereço HTTP ou HTTPS.')
    .optional()
    .or(z.literal('')),
  zip_code: z.string().min(8).max(10),
  street: z.string().trim().min(3).max(160),
  number: z.string().trim().min(1).max(30),
  complement: z.string().trim().max(100).optional(),
  neighborhood: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().length(2),
})

/**
 * Cria ou atualiza os dados da empresa e seu endereço para o usuário logado.
 */
export async function saveClientCompanyData(input: SaveCompanyDataInput): Promise<{ success: true; companyId: string | null }> {
  const ctx = await getAuthContext()
  if (!ctx.user) {
    throw new Error('Sessão expirada ou não autenticada.')
  }
  const parsedInput = saveCompanyDataSchema.safeParse(input)
  if (!parsedInput.success) {
    throw new Error(parsedInput.error.issues[0]?.message ?? 'Dados empresariais inválidos.')
  }
  input = parsedInput.data

  const cleanCNPJ = input.cnpj.replace(/\D/g, '')
  if (!validateCNPJ(cleanCNPJ)) {
    throw new Error('CNPJ inválido.')
  }

  const cleanZip = input.zip_code.replace(/\D/g, '')
  if (cleanZip.length !== 8) {
    throw new Error('CEP inválido.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as AnyClient

  // Checar se CNPJ já está cadastrado por outra empresa
  const { data: existingCnpj } = await supabase
    .from('companies')
    .select('id')
    .eq('cnpj', cleanCNPJ)
    .single()

  if (existingCnpj && existingCnpj.id !== ctx.user.company_id) {
    throw new Error('Este CNPJ já está cadastrado para outra empresa.')
  }

  let companyId = ctx.user.company_id

  if (!companyId) {
    // Criar nova empresa (via admin client para bypass de RLS após revoke)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient() as AnyClient

    const { data: newCompany, error: createError } = await adminClient
      .from('companies')
      .insert({
        cnpj: cleanCNPJ,
        company_name: input.company_name.trim(),
        trade_name: input.trade_name?.trim() || null,
        state_registration: input.state_registration?.trim() || null,
        segment: input.segment?.trim() || null,
        phone: input.phone?.replace(/\D/g, '') || null,
        whatsapp: input.whatsapp?.replace(/\D/g, '') || null,
        email: input.email?.trim() || ctx.user.email,
        website: input.website?.trim() || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (createError || !newCompany) {
      throw new Error(`Erro ao criar empresa: ${createError?.message || 'Falha desconhecida'}`)
    }

    companyId = newCompany.id

    // Vincular usuário como membro da empresa
    await adminClient.from('company_members').insert({
      company_id: companyId,
      profile_id: ctx.user.id,
      role: 'owner',
      is_primary: true,
    })

    // Atualizar perfil do usuário com company_id (profiles tem UPDATE para authenticated)
    await supabase
      .from('profiles')
      .update({ company_id: companyId })
      .eq('id', ctx.user.id)
  } else {
    // Atualizar empresa existente via admin client (pois revogamos UPDATE de companies para authenticated)
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const adminClient = createAdminClient() as AnyClient

    const { error: updateError } = await adminClient
      .from('companies')
      .update({
        cnpj: cleanCNPJ,
        company_name: input.company_name.trim(),
        trade_name: input.trade_name?.trim() || null,
        state_registration: input.state_registration?.trim() || null,
        segment: input.segment?.trim() || null,
        phone: input.phone?.replace(/\D/g, '') || null,
        whatsapp: input.whatsapp?.replace(/\D/g, '') || null,
        email: input.email?.trim() || ctx.user.email,
        website: input.website?.trim() || null,
        submitted_at: new Date().toISOString(),
      })
      .eq('id', companyId)

    if (updateError) {
      throw new Error(`Erro ao atualizar empresa: ${updateError.message}`)
    }
  }

  // Cadastrar ou atualizar endereço comercial da empresa
  const { data: existingAddr } = await supabase
    .from('addresses')
    .select('id')
    .eq('company_id', companyId as string)
    .single()

  if (existingAddr) {
    await supabase
      .from('addresses')
      .update({
        zip_code: cleanZip,
        street: input.street.trim(),
        number: input.number.trim(),
        complement: input.complement?.trim() || null,
        neighborhood: input.neighborhood.trim(),
        city: input.city.trim(),
        state: input.state.trim().toUpperCase(),
        profile_id: ctx.user.id,
      })
      .eq('id', existingAddr.id)
  } else {
    await supabase.from('addresses').insert({
      company_id: companyId,
      profile_id: ctx.user.id,
      label: 'Endereço Comercial',
      zip_code: cleanZip,
      street: input.street.trim(),
      number: input.number.trim(),
      complement: input.complement?.trim() || null,
      neighborhood: input.neighborhood.trim(),
      city: input.city.trim(),
      state: input.state.trim().toUpperCase(),
      is_default: true,
    })
  }

  // Criar notificação e audit log de submissão
  await supabase.from('notifications').insert({
    profile_id: ctx.user.id,
    title: 'Cadastro Enviado',
    message: 'Seus dados empresariais foram salvos e enviados para análise comercial.',
    type: 'company_submitted',
    link_url: '/minha-conta/empresa',
  })

  await supabase.from('audit_logs').insert({
    actor_id: ctx.user.id,
    action: 'company_data_saved',
    target_table: 'companies',
    target_id: companyId,
    payload: { cnpj: cleanCNPJ, company_name: input.company_name },
  })

  return { success: true, companyId }
}

/**
 * Reenvia um cadastro de empresa recusado para nova análise.
 */
export async function resubmitCompanyForReview() {
  const ctx = await getAuthContext()
  if (!ctx.user || !ctx.company) {
    throw new Error('Nenhuma empresa encontrada para reenvio.')
  }

  if (ctx.company.status !== 'rejected' && ctx.company.status !== 'pending') {
    throw new Error('Empresas já aprovadas não podem ser reenviadas.')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as AnyClient

  const { createAdminClient } = await import('@/lib/supabase/admin')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = createAdminClient() as AnyClient

  const { error } = await adminClient
    .from('companies')
    .update({
      status: 'pending',
      submitted_at: new Date().toISOString(),
      rejection_reason: null,
      rejected_at: null,
    })
    .eq('id', ctx.company.id)

  if (error) {
    throw new Error(`Falha ao reenviar cadastro: ${error.message}`)
  }

  await supabase.from('notifications').insert({
    profile_id: ctx.user.id,
    title: 'Cadastro Reenviado',
    message: 'Seu cadastro empresarial foi reenviado e está sob nova análise.',
    type: 'company_resubmitted',
    link_url: '/conta-pendente',
  })

  await supabase.from('audit_logs').insert({
    actor_id: ctx.user.id,
    action: 'company_resubmitted',
    target_table: 'companies',
    target_id: ctx.company.id,
    payload: { resubmitted_at: new Date().toISOString() },
  })

  return { success: true }
}

/**
 * Gera URL assinada temporária para visualização de um documento.
 */
export async function getDocumentSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string> {
  const ctx = await getAuthContext()
  if (!ctx.user) {
    throw new Error('Acesso negado. Usuário não autenticado.')
  }

  const parsed = z
    .object({
      filePath: z
        .string()
        .trim()
        .min(1)
        .max(500)
        .regex(/^[0-9a-f-]{36}\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/),
      expiresInSeconds: z.coerce.number().int().min(60).max(3600),
    })
    .safeParse({ filePath, expiresInSeconds })
  if (!parsed.success || parsed.data.filePath.includes('..')) {
    throw new Error('Caminho de documento inválido.')
  }
  const ownsPath = Boolean(
    ctx.user.company_id && parsed.data.filePath.startsWith(`${ctx.user.company_id}/`),
  )
  if (ctx.user.role !== 'admin' && !ownsPath) {
    throw new Error('Acesso negado a este documento.')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from('company-documents')
    .createSignedUrl(parsed.data.filePath, parsed.data.expiresInSeconds)

  if (error || !data?.signedUrl) {
    throw new Error(`Falha ao gerar link seguro: ${error?.message || 'Arquivo não encontrado'}`)
  }

  return data.signedUrl
}

/**
 * AÇÃO ADMINISTRATIVA: Aprovar uma empresa.
 */
export async function approveCompanyAdmin(companyId: string, internalNotes?: string) {
  const ctx = await requireAdmin()
  const parsed = z.object({
    companyId: z.string().uuid(),
    internalNotes: z.string().trim().max(2000).optional(),
  }).safeParse({ companyId, internalNotes })
  if (!parsed.success) throw new Error('Dados da aprovação inválidos.')
  const adminClient = createAdminClient() as AnyClient

  const { data: company, error: fetchErr } = await adminClient
    .from('companies')
    .select('id, company_name, status')
    .eq('id', parsed.data.companyId)
    .single()

  if (fetchErr || !company) {
    throw new Error('Empresa não encontrada.')
  }

  if (company.status === 'approved') {
    throw new Error('Esta empresa já foi aprovada anteriormente.')
  }

  const { data: defaultPriceTable, error: priceTableError } = await adminClient
    .from('price_tables')
    .select('id')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle()
  if (priceTableError || !defaultPriceTable) {
    throw new Error('Defina uma tabela de preços padrão ativa antes de aprovar a empresa.')
  }

  const { error: updateErr } = await adminClient
    .from('companies')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      rejected_at: null,
      rejection_reason: null,
      price_table_id: defaultPriceTable.id,
      internal_notes: parsed.data.internalNotes || null,
    })
    .eq('id', parsed.data.companyId)

  if (updateErr) {
    throw new Error(`Falha ao aprovar empresa: ${updateErr.message}`)
  }

  const { data: members } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', parsed.data.companyId)

  if (members && members.length > 0) {
    await adminClient.from('notifications').insert(
      members.map((member: { profile_id: string }) => ({
        profile_id: member.profile_id,
        title: 'Cadastro Aprovado! 🎉',
        message: 'Sua empresa foi aprovada. Você já pode visualizar preços e fazer pedidos no portal.',
        type: 'company_approved',
        link_url: '/minha-conta',
      })),
    )
  }

  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_approved',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: { approved_at: new Date().toISOString(), internal_notes: parsed.data.internalNotes },
  })

  return { success: true }
}

/**
 * AÇÃO ADMINISTRATIVA: Recusar uma empresa com mensagem pública obrigatória.
 */
export async function rejectCompanyAdmin(companyId: string, rejectionReason: string, internalNotes?: string) {
  const ctx = await requireAdmin()

  const parsed = z.object({
    companyId: z.string().uuid(),
    rejectionReason: z.string().trim().min(5).max(1000),
    internalNotes: z.string().trim().max(2000).optional(),
  }).safeParse({ companyId, rejectionReason, internalNotes })
  if (!parsed.success) {
    throw new Error('Informe um motivo público claro, entre 5 e 1.000 caracteres.')
  }
  const adminClient = createAdminClient() as AnyClient

  const { data: company, error: fetchErr } = await adminClient
    .from('companies')
    .select('id, status')
    .eq('id', parsed.data.companyId)
    .single()

  if (fetchErr || !company) {
    throw new Error('Empresa não encontrada.')
  }

  const { error: updateErr } = await adminClient
    .from('companies')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      approved_at: null,
      rejection_reason: parsed.data.rejectionReason,
      price_table_id: null,
      internal_notes: parsed.data.internalNotes || null,
    })
    .eq('id', parsed.data.companyId)

  if (updateErr) {
    throw new Error(`Falha ao recusar empresa: ${updateErr.message}`)
  }

  const { data: members } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', parsed.data.companyId)

  if (members && members.length > 0) {
    await adminClient.from('notifications').insert(
      members.map((member: { profile_id: string }) => ({
        profile_id: member.profile_id,
        title: 'Atualização do Cadastro Empresarial',
        message: `Seu cadastro necessita de correções: ${parsed.data.rejectionReason}`,
        type: 'company_rejected',
        link_url: '/conta-recusada',
      })),
    )
  }

  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_rejected',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: {
      rejection_reason: parsed.data.rejectionReason,
      internal_notes: parsed.data.internalNotes,
    },
  })

  return { success: true }
}

/**
 * AÇÃO ADMINISTRATIVA: Atribuir vendedor responsável a uma empresa.
 */
export async function assignSellerAdmin(companyId: string, sellerId: string | null) {
  const ctx = await requireAdmin()
  const parsed = z.object({
    companyId: z.string().uuid(),
    sellerId: z.string().uuid().nullable(),
  }).safeParse({ companyId, sellerId })
  if (!parsed.success) throw new Error('Empresa ou vendedor inválido.')

  const adminClient = createAdminClient() as AnyClient
  if (parsed.data.sellerId) {
    const { data: seller } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', parsed.data.sellerId)
      .eq('role', 'seller')
      .maybeSingle()
    if (!seller) throw new Error('O vendedor selecionado não existe ou não está ativo como vendedor.')
  }

  const { error } = await adminClient
    .from('companies')
    .update({ seller_id: parsed.data.sellerId })
    .eq('id', parsed.data.companyId)

  if (error) {
    throw new Error(`Falha ao atribuir vendedor: ${error.message}`)
  }

  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'seller_assigned',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: { seller_id: parsed.data.sellerId },
  })

  return { success: true }
}

export async function suspendCompanyAdmin(companyId: string, reason: string) {
  const ctx = await requireAdmin()
  const parsed = z.object({
    companyId: z.string().uuid(),
    reason: z.string().trim().min(5).max(1000),
  }).safeParse({ companyId, reason })
  if (!parsed.success) throw new Error('Informe um motivo de suspensão entre 5 e 1.000 caracteres.')

  const adminClient = createAdminClient() as AnyClient
  const { data: company } = await adminClient
    .from('companies')
    .select('id, status')
    .eq('id', parsed.data.companyId)
    .maybeSingle()
  if (!company) throw new Error('Empresa não encontrada.')
  if (company.status === 'suspended') throw new Error('Esta empresa já está suspensa.')

  const { error } = await adminClient
    .from('companies')
    .update({
      status: 'suspended',
      price_table_id: null,
      rejection_reason: parsed.data.reason,
    })
    .eq('id', parsed.data.companyId)
  if (error) throw new Error('Não foi possível suspender a empresa.')

  const { data: members } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', parsed.data.companyId)
  if (members?.length) {
    await adminClient.from('notifications').insert(
      members.map((member: { profile_id: string }) => ({
        profile_id: member.profile_id,
        title: 'Acesso comercial suspenso',
        message: parsed.data.reason,
        type: 'company_suspended',
        link_url: '/conta-recusada',
      })),
    )
  }
  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_suspended',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: { reason: parsed.data.reason },
  })
  return { success: true }
}

export async function reactivateCompanyAdmin(companyId: string, internalNotes?: string) {
  const ctx = await requireAdmin()
  const parsed = z.object({
    companyId: z.string().uuid(),
    internalNotes: z.string().trim().max(2000).optional(),
  }).safeParse({ companyId, internalNotes })
  if (!parsed.success) throw new Error('Dados de reativação inválidos.')

  const adminClient = createAdminClient() as AnyClient
  const { data: table } = await adminClient
    .from('price_tables')
    .select('id')
    .eq('is_default', true)
    .eq('is_active', true)
    .maybeSingle()
  if (!table) throw new Error('Defina uma tabela de preços padrão ativa antes de reativar a empresa.')

  const { error } = await adminClient
    .from('companies')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      rejected_at: null,
      rejection_reason: null,
      price_table_id: table.id,
      internal_notes: parsed.data.internalNotes || null,
    })
    .eq('id', parsed.data.companyId)
  if (error) throw new Error('Não foi possível reativar a empresa.')

  const { data: members } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', parsed.data.companyId)
  if (members?.length) {
    await adminClient.from('notifications').insert(
      members.map((member: { profile_id: string }) => ({
        profile_id: member.profile_id,
        title: 'Acesso comercial reativado',
        message: 'Sua empresa foi reativada e já pode consultar preços e fazer pedidos.',
        type: 'company_reactivated',
        link_url: '/minha-conta',
      })),
    )
  }
  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_reactivated',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: { internal_notes: parsed.data.internalNotes },
  })
  return { success: true }
}
