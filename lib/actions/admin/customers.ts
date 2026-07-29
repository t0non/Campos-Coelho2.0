'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth'

export async function getCustomers(search?: string, status?: string) {
  await requireAdmin()
  const supabase = await createClient()

  // Verifica admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

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

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,cnpj.ilike.%${search}%`)
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  // Busca a empresa
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .single()

  if (companyError) return { error: 'Empresa não encontrada' }

  // Busca os endereços da empresa
  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('company_id', companyId)

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
    .eq('company_id', companyId)

  // Busca documentos da empresa
  const { data: documents } = await supabase
    .from('company_documents')
    .select('*')
    .eq('company_id', companyId)

  const { data: registrationLog } = await supabase
    .from('audit_logs')
    .select('payload')
    .eq('target_table', 'companies')
    .eq('target_id', companyId)
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
  await requireAdmin()
  if (decisionMessage.trim().length < 5) {
    return { error: 'Escreva uma mensagem para o cliente com pelo menos 5 caracteres.' }
  }
  const supabase = await createClient()

  // 1. Verificar quem está chamando a action
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Acesso negado: Apenas administradores podem executar esta ação.' }
  }

  // 2. Usar o cliente de Admin (service_role) para fazer o update ignorando as barreiras do RLS
  const adminClient = await createAdminClient()

  const { data: company } = await adminClient
    .from('companies')
    .select('id')
    .eq('id', companyId)
    .single()

  const { data: primaryMember } = await adminClient
    .from('company_members')
    .select('profile_id')
    .eq('company_id', companyId)
    .eq('is_primary', true)
    .maybeSingle()

  if (!company) return { error: 'Empresa não encontrada.' }

  const updateData: Database['public']['Tables']['companies']['Update'] = { 
    status,
    internal_notes: decisionMessage.trim(),
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
    updateData.rejection_reason = decisionMessage.trim()
    updateData.price_table_id = null
  }

  const { error } = await adminClient
    .from('companies')
    .update(updateData)
    .eq('id', companyId)

  if (error) {
    console.error('Erro ao atualizar status do cliente:', error)
    return { error: 'Erro ao atualizar status da empresa.' }
  }

  if (primaryMember?.profile_id) {
    await adminClient.from('notifications').insert({
      profile_id: primaryMember.profile_id,
      title: status === 'approved' ? 'Cadastro aprovado' : 'Cadastro não aprovado',
      message: decisionMessage.trim(),
      type: status === 'approved' ? 'company_approved' : 'company_rejected',
      link_url: status === 'approved' ? '/minha-conta' : '/conta-recusada',
    })
  }

  await adminClient.from('audit_logs').insert({
    actor_id: user.id,
    action: status === 'approved' ? 'company_approved' : 'company_rejected',
    target_table: 'companies',
    target_id: companyId,
    payload: { message: decisionMessage.trim() },
  })

  revalidatePath('/admin/clientes')
  return { success: true }
}

export async function getDocumentUrl(filePath: string) {
  await requireAdmin()
  const supabase = await createClient()
  
  // Assumindo que o bucket de documentos (company-documents) não é público e precisamos assinar a URL
  const { data, error } = await supabase.storage
    .from('company-documents')
    .createSignedUrl(filePath, 60 * 60) // 1 hora de validade

  if (error || !data) {
    return { error: 'Não foi possível gerar a URL do documento' }
  }

  return { url: data.signedUrl }
}
