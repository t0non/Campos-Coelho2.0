'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth'
import { z } from 'zod'
import { notifyCompanyDecision } from '@/lib/email/events'
import { validateCNPJ } from '@/lib/utils/masks'

const companyIdSchema = z.string().uuid()
const companyStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended'])
const decisionSchema = z.object({
  companyId: companyIdSchema,
  status: z.enum(['approved', 'rejected']),
  decisionMessage: z.string().trim().min(5).max(1000),
})
const customerEditSchema = z.object({
  companyName: z.string().trim().min(3).max(160),
  tradeName: z.string().trim().min(2).max(120),
  cnpj: z.string().trim().refine(validateCNPJ, 'CNPJ inválido.'),
  stateRegistration: z.string().trim().max(40),
  segment: z.string().trim().max(80),
  phone: z.string().trim().min(10).max(20),
  whatsapp: z.string().trim().min(10).max(20),
  email: z.string().trim().toLowerCase().email().max(254),
  website: z.string().trim().url().max(300).or(z.literal('')),
  contactFullName: z.string().trim().min(3).max(120),
  contactPhone: z.string().trim().min(10).max(20),
  address: z.object({
    zipCode: z.string().trim().regex(/^\d{5}-?\d{3}$/),
    street: z.string().trim().min(3).max(160),
    number: z.string().trim().min(1).max(30),
    complement: z.string().trim().max(100),
    neighborhood: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().length(2),
  }),
})

function safeSearchTerm(search: string | undefined) {
  return (search ?? '')
    .normalize('NFKC')
    .replace(/[,%_()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80)
}

export async function getCustomers(search?: string, status?: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const normalizedSearch = safeSearchTerm(search)
  const parsedStatus = status && status !== 'all' ? companyStatusSchema.safeParse(status) : null
  if (parsedStatus && !parsedStatus.success) return { error: 'Filtro de status inválido.' }

  let query = supabase
    .from('companies')
    .select(`
      id,
      cnpj,
      company_name,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })

  if (normalizedSearch) {
    query = query.or(
      `company_name.ilike.%${normalizedSearch}%,cnpj.ilike.%${normalizedSearch}%`,
    )
  }

  if (parsedStatus?.success) {
    query = query.eq('status', parsedStatus.data)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return { error: 'Falha ao buscar clientes' }
  }

  return { customers: data }
}

export async function getCustomerDetails(companyId: string) {
  await requireAdmin()
  const parsedId = companyIdSchema.safeParse(companyId)
  if (!parsedId.success) return { error: 'Empresa inválida.' }
  const supabase = createAdminClient()

  // Busca a empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', parsedId.data)
    .single()

  if (companyError) return { error: 'Empresa não encontrada' }

  // Busca os endereços da empresa
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('company_id', parsedId.data)

  // Busca os membros/contatos da empresa (junto com dados do profile)
  const { data: members } = await supabase
    .from('company_members')
    .select(`
      role,
      is_primary,
      profile:profiles (
        id, full_name, email, phone
      )
    `)
    .eq('company_id', parsedId.data)

  // Busca documentos da empresa
  const { data: documents } = await supabase
    .from('company_documents')
    .select('*')
    .eq('company_id', parsedId.data)

  const { data: registrationLog } = await supabase
    .from('audit_logs')
    .select('payload')
    .eq('target_table', 'companies')
    .eq('target_id', parsedId.data)
    .eq('action', 'public_registration_submitted')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return { 
    customer: {
      ...company,
      addresses: addresses || [],
      members: members || [],
      documents: documents || [],
      registration_data: registrationLog?.payload || null,
    } 
  }
}

export async function updateCustomerStatus(
  companyId: string,
  status: 'approved' | 'rejected',
  decisionMessage: string,
) {
  const ctx = await requireAdmin()
  const parsed = decisionSchema.safeParse({ companyId, status, decisionMessage })
  if (!parsed.success) {
    return {
      error:
        parsed.error.issues[0]?.message ??
        'Escreva uma mensagem válida para o cliente antes de concluir.',
    }
  }

  const adminClient = createAdminClient()

  const { data: company } = await adminClient
    .from('companies')
    .select('id')
    .eq('id', parsed.data.companyId)
    .single()

  const { data: primaryMember } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', parsed.data.companyId)
    .eq('is_primary', true)
    .maybeSingle()

  if (!company) return { error: 'Empresa não encontrada.' }

  const updateData: Database['public']['Tables']['companies']['Update'] = { 
    status,
    internal_notes: parsed.data.decisionMessage,
  }

  if (status === 'approved') {
    const { data: defaultPriceTable, error: priceTableError } = await adminClient
      .from('price_tables')
      .select('id')
      .eq('is_default', true)
      .eq('is_active', true)
      .maybeSingle()

    if (priceTableError || !defaultPriceTable) {
      return {
        error: 'Não existe uma tabela de preços padrão ativa. Configure-a antes de aprovar o cadastro.',
      }
    }

    updateData.approved_at = new Date().toISOString()
    updateData.rejected_at = null
    updateData.rejection_reason = null
    updateData.price_table_id = defaultPriceTable.id
  } else if (status === 'rejected') {
    updateData.approved_at = null
    updateData.rejected_at = new Date().toISOString()
    updateData.rejection_reason = parsed.data.decisionMessage
    updateData.price_table_id = null
  }

  const { error } = await adminClient
    .from('companies')
    .update(updateData)
    .eq('id', parsed.data.companyId)

  if (error) {
    console.error('Erro ao atualizar status do cliente:', error)
    return { error: 'Erro ao atualizar status da empresa.' }
  }

  if (primaryMember?.profile_id) {
    await adminClient.from('notifications').insert({
      profile_id: primaryMember.profile_id,
      title: status === 'approved' ? 'Cadastro aprovado' : 'Cadastro não aprovado',
      message: parsed.data.decisionMessage,
      type: status === 'approved' ? 'company_approved' : 'company_rejected',
      link_url: status === 'approved' ? '/minha-conta' : '/conta-recusada',
    })
  }

  await adminClient.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: status === 'approved' ? 'company_approved' : 'company_rejected',
    target_table: 'companies',
    target_id: parsed.data.companyId,
    payload: { message: parsed.data.decisionMessage },
  })

  await notifyCompanyDecision({
    companyId: parsed.data.companyId,
    status,
    message: parsed.data.decisionMessage,
  })
  revalidatePath('/admin/clientes')
  return { success: true }
}

export async function updateCustomerDetails(companyId: string, input: unknown) {
  const ctx = await requireAdmin()
  const parsedId = companyIdSchema.safeParse(companyId)
  const parsed = customerEditSchema.safeParse(input)
  if (!parsedId.success) return { error: 'Empresa inválida.' }
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? 'Revise os dados informados.',
    }
  }

  const supabase = createAdminClient()
  const values = parsed.data
  const cleanCnpj = values.cnpj.replace(/\D/g, '')
  const cleanPhone = values.phone.replace(/\D/g, '')
  const cleanWhatsapp = values.whatsapp.replace(/\D/g, '')
  const cleanContactPhone = values.contactPhone.replace(/\D/g, '')
  const cleanZipCode = values.address.zipCode.replace(/\D/g, '')

  const { data: duplicateCompany, error: duplicateError } = await supabase
    .from('companies')
    .select('id')
    .eq('cnpj', cleanCnpj)
    .neq('id', parsedId.data)
    .maybeSingle()
  if (duplicateError) return { error: 'Não foi possível validar o CNPJ.' }
  if (duplicateCompany) return { error: 'Este CNPJ pertence a outra empresa.' }

  const [{ data: primaryMember, error: memberError }, { data: mainAddress, error: addressLookupError }] =
    await Promise.all([
      supabase
        .from('company_members')
        .select('profile_id')
        .eq('company_id', parsedId.data)
        .eq('is_primary', true)
        .maybeSingle(),
      supabase
        .from('addresses')
        .select('id, profile_id')
        .eq('company_id', parsedId.data)
        .eq('is_default', true)
        .maybeSingle(),
    ])
  if (memberError || !primaryMember) return { error: 'Responsável principal não encontrado.' }
  if (addressLookupError) return { error: 'Não foi possível localizar o endereço principal.' }

  const { error: companyError } = await supabase
    .from('companies')
    .update({
      company_name: values.companyName,
      trade_name: values.tradeName,
      cnpj: cleanCnpj,
      state_registration: values.stateRegistration || null,
      segment: values.segment || null,
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      email: values.email,
      website: values.website || null,
    })
    .eq('id', parsedId.data)
  if (companyError) return { error: 'Não foi possível atualizar a empresa.' }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: values.contactFullName, phone: cleanContactPhone })
    .eq('id', primaryMember.profile_id)
  if (profileError) return { error: 'A empresa foi atualizada, mas o contato não pôde ser salvo.' }

  const addressValues = {
    company_id: parsedId.data,
    profile_id: mainAddress?.profile_id ?? primaryMember.profile_id,
    label: 'Principal',
    zip_code: cleanZipCode,
    street: values.address.street,
    number: values.address.number,
    complement: values.address.complement || null,
    neighborhood: values.address.neighborhood,
    city: values.address.city,
    state: values.address.state.toUpperCase(),
    is_default: true,
  }
  const addressMutation = mainAddress
    ? supabase.from('addresses').update(addressValues).eq('id', mainAddress.id)
    : supabase.from('addresses').insert(addressValues)
  const { error: addressError } = await addressMutation
  if (addressError) return { error: 'Os dados foram atualizados, mas o endereço não pôde ser salvo.' }

  await supabase.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_details_updated',
    target_table: 'companies',
    target_id: parsedId.data,
    payload: { company_name: values.companyName, cnpj: cleanCnpj },
  })

  revalidatePath('/admin/clientes')
  return { success: true }
}

export async function deleteCustomer(companyId: string, confirmation: string) {
  const ctx = await requireAdmin()
  const parsedId = companyIdSchema.safeParse(companyId)
  if (!parsedId.success) return { error: 'Empresa inválida.' }

  const supabase = createAdminClient()
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, company_name')
    .eq('id', parsedId.data)
    .single()
  if (companyError || !company) return { error: 'Empresa não encontrada.' }
  if (confirmation.trim() !== company.company_name) {
    return { error: 'Digite a razão social exatamente como exibida para confirmar.' }
  }

  const { count: orderCount, error: orderError } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', parsedId.data)
  if (orderError) return { error: 'Não foi possível verificar o histórico de pedidos.' }
  if ((orderCount ?? 0) > 0) {
    return {
      error: 'Este cliente possui pedidos e não pode ser excluído. Suspenda o acesso para preservar o histórico.',
    }
  }

  const [{ data: members, error: membersError }, { data: documents, error: documentsError }] =
    await Promise.all([
      supabase.from('company_members').select('profile_id').eq('company_id', parsedId.data),
      supabase.from('company_documents').select('file_path').eq('company_id', parsedId.data),
    ])
  if (membersError || documentsError) return { error: 'Não foi possível preparar a exclusão.' }

  const { error: auditError } = await supabase.from('audit_logs').insert({
    actor_id: ctx.user!.id,
    action: 'company_deleted',
    target_table: 'companies',
    target_id: parsedId.data,
    payload: { company_name: company.company_name },
  })
  if (auditError) return { error: 'Não foi possível registrar a auditoria da exclusão.' }

  const { error: deleteError } = await supabase
    .from('companies')
    .delete()
    .eq('id', parsedId.data)
  if (deleteError) return { error: 'Não foi possível excluir o cliente.' }

  const cleanupWarnings: string[] = []
  const documentPaths = documents?.map((document) => document.file_path) ?? []
  if (documentPaths.length) {
    const { error: storageError } = await supabase.storage
      .from('company-documents')
      .remove(documentPaths)
    if (storageError) cleanupWarnings.push('arquivos')
  }
  for (const member of members ?? []) {
    const { error: auditActorError } = await supabase
      .from('audit_logs')
      .update({ actor_id: null })
      .eq('actor_id', member.profile_id)
    if (auditActorError) {
      cleanupWarnings.push('vínculo de auditoria')
      continue
    }
    const { error: authError } = await supabase.auth.admin.deleteUser(member.profile_id)
    if (authError) cleanupWarnings.push('conta de acesso')
  }

  revalidatePath('/admin/clientes')
  return {
    success: true,
    warning: cleanupWarnings.length
      ? 'Cliente excluído, mas houve falha ao limpar: ' + [...new Set(cleanupWarnings)].join(', ') + '.'
      : undefined,
  }
}

export async function getDocumentUrl(filePath: string) {
  await requireAdmin()
  const parsedPath = z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^[0-9a-f-]{36}\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+$/)
    .safeParse(filePath)
  if (!parsedPath.success || parsedPath.data.includes('..')) {
    return { error: 'Caminho de documento inválido.' }
  }
  const supabase = createAdminClient()
  
  // Assumindo que o bucket de documentos (company-documents) não é público e precisamos assinar a URL
  const { data, error } = await supabase.storage
    .from('company-documents')
    .createSignedUrl(parsedPath.data, 15 * 60)

  if (error || !data) {
    return { error: 'Não foi possível gerar a URL do documento' }
  }

  return { url: data.signedUrl }
}
