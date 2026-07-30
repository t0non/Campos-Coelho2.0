'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth'
import { z } from 'zod'
import { notifyCompanyDecision } from '@/lib/email/events'

const companyIdSchema = z.string().uuid()
const companyStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended'])
const decisionSchema = z.object({
  companyId: companyIdSchema,
  status: z.enum(['approved', 'rejected']),
  decisionMessage: z.string().trim().min(5).max(1000),
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
