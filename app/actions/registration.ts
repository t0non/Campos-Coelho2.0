'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fullRegistrationSchema } from '@/lib/validations/registration'

const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])
const MAX_FILE_SIZE = 2 * 1024 * 1024

export type PublicRegistrationResult =
  | { success: true; protocol: string }
  | { success: false; error: string }

export async function submitPublicRegistration(formData: FormData): Promise<PublicRegistrationResult> {
  const payloadValue = formData.get('payload')
  if (typeof payloadValue !== 'string') {
    return { success: false, error: 'Os dados do cadastro não foram recebidos.' }
  }

  let rawData: unknown
  try {
    rawData = JSON.parse(payloadValue)
  } catch {
    return { success: false, error: 'Os dados do cadastro são inválidos.' }
  }

  const parsed = fullRegistrationSchema.safeParse(rawData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Revise os campos obrigatórios.' }
  }

  const data = parsed.data
  const files = formData.getAll('documents').filter((entry): entry is File => entry instanceof File && entry.size > 0)
  if (files.length < 2) {
    return { success: false, error: 'Envie o contrato social e o documento de identidade do responsável.' }
  }
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) return { success: false, error: `O arquivo "${file.name}" excede o limite de 2 MB.` }
    if (!ALLOWED_FILE_TYPES.has(file.type)) return { success: false, error: `O formato do arquivo "${file.name}" não é permitido.` }
  }

  const supabase = createAdminClient()
  const cleanCnpj = data.company.cnpj.replace(/\D/g, '')
  const cleanCpf = data.responsible.cpf.replace(/\D/g, '')
  let createdUserId: string | null = null
  let createdCompanyId: string | null = null
  const uploadedPaths: string[] = []

  try {
    const { data: existingCompany } = await supabase.from('companies').select('id').eq('cnpj', cleanCnpj).maybeSingle()
    if (existingCompany) return { success: false, error: 'Este CNPJ já possui cadastro.' }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.responsible.email.trim(),
      password: data.responsible.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.responsible.fullName.trim(),
        phone: data.responsible.phone.replace(/\D/g, ''),
        role: 'customer',
      },
    })
    if (authError || !authData.user) {
      const duplicate = authError?.message.toLowerCase().includes('already')
      return {
        success: false,
        error: duplicate
          ? 'Este e-mail já possui uma conta. Entre com a conta existente ou use outro e-mail.'
          : `Não foi possível criar a conta: ${authError?.message ?? 'erro desconhecido'}`,
      }
    }
    createdUserId = authData.user.id

    await supabase.from('profiles').upsert({
      id: createdUserId,
      full_name: data.responsible.fullName.trim(),
      email: data.responsible.email.trim(),
      phone: data.responsible.phone.replace(/\D/g, ''),
      role: 'customer',
    })

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        cnpj: cleanCnpj,
        company_name: data.company.companyName.trim(),
        trade_name: data.company.tradingName.trim(),
        state_registration: data.company.isStateRegistrationExempt ? null : data.company.stateRegistration?.trim() || null,
        segment: data.company.segment,
        phone: data.company.phone.replace(/\D/g, ''),
        whatsapp: data.company.whatsapp.replace(/\D/g, ''),
        email: data.company.email.trim(),
        website: data.company.website?.trim() || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (companyError || !company) throw new Error(companyError?.message ?? 'Não foi possível criar a empresa.')
    createdCompanyId = company.id

    await supabase.from('profiles').update({ company_id: company.id }).eq('id', createdUserId)
    await supabase.from('company_members').insert({
      company_id: company.id,
      profile_id: createdUserId,
      role: data.responsible.role,
      is_primary: true,
    })

    const fiscal = data.addresses.fiscal
    await supabase.from('addresses').insert({
      company_id: company.id,
      profile_id: createdUserId,
      label: 'Principal',
      zip_code: fiscal.cep.replace(/\D/g, ''),
      street: fiscal.street.trim(),
      number: fiscal.number.trim(),
      complement: fiscal.complement?.trim() || null,
      neighborhood: fiscal.neighborhood.trim(),
      city: fiscal.city.trim(),
      state: fiscal.state.trim().toUpperCase(),
      is_default: true,
    })

    const categories = formData.getAll('documentCategories').map(String)
    for (const [index, file] of files.entries()) {
      const category = categories[index] || 'outros'
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_')
      const filePath = `${company.id}/${category}/${crypto.randomUUID()}_${safeName}`
      const bytes = new Uint8Array(await file.arrayBuffer())
      const { error: uploadError } = await supabase.storage.from('company-documents').upload(filePath, bytes, {
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) throw new Error(`Falha ao enviar "${file.name}": ${uploadError.message}`)
      uploadedPaths.push(filePath)

      const { error: documentError } = await supabase.from('company_documents').insert({
        company_id: company.id,
        document_type: category,
        file_path: filePath,
        file_name: file.name,
        status: 'pending',
      })
      if (documentError) throw new Error(`Falha ao registrar "${file.name}": ${documentError.message}`)
    }

    await supabase.from('audit_logs').insert({
      actor_id: createdUserId,
      action: 'public_registration_submitted',
      target_table: 'companies',
      target_id: company.id,
      payload: {
        company: { ...data.company, cnpj: cleanCnpj },
        responsible: {
          fullName: data.responsible.fullName,
          cpf: cleanCpf,
          role: data.responsible.role,
          department: data.responsible.department,
          email: data.responsible.email,
          phone: data.responsible.phone,
          whatsapp: data.responsible.whatsapp,
        },
        addresses: {
          fiscal,
          shipping: data.addresses.isShippingSameAsFiscal ? fiscal : data.addresses.shipping,
          billing: data.addresses.isBillingSameAsFiscal ? fiscal : data.addresses.billing,
        },
        interests: data.interests,
        consents: data.consents,
      },
    })

    const protocol = `B2B-${company.id.slice(0, 8).toUpperCase()}`
    return { success: true, protocol }
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('company-documents').remove(uploadedPaths)
    }
    if (createdCompanyId) await supabase.from('companies').delete().eq('id', createdCompanyId)
    if (createdUserId) await supabase.auth.admin.deleteUser(createdUserId)
    return { success: false, error: error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.' }
  }
}
