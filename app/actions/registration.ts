'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fullRegistrationSchema } from '@/lib/validations/registration'
import { safeOriginalFilename, validateUploadedFile } from '@/lib/security/file-validation'
import { consumePublicRateLimit } from '@/lib/security/public-rate-limit'
import { notifyRegistrationSubmitted } from '@/lib/email/events'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_DOCUMENT_CATEGORIES = new Set(['contrato_social', 'doc_responsavel'])

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
  const allowed = await consumePublicRateLimit({
    action: 'public_registration',
    maxAttempts: 5,
    windowSeconds: 3600,
    subject: data.responsible.email,
  })
  if (!allowed) {
    return {
      success: false,
      error: 'Muitas tentativas de cadastro. Aguarde um pouco antes de tentar novamente.',
    }
  }

  const files = formData.getAll('documents').filter((entry): entry is File => entry instanceof File && entry.size > 0)
  if (files.length < 2) {
    return { success: false, error: 'Envie o contrato social e o documento de identidade do responsável.' }
  }
  if (files.length > 4) {
    return { success: false, error: 'Envie no máximo quatro documentos.' }
  }
  const categories = formData.getAll('documentCategories').map(String)
  if (
    categories.length !== files.length ||
    categories.some((category) => !ALLOWED_DOCUMENT_CATEGORIES.has(category)) ||
    !categories.includes('contrato_social') ||
    !categories.includes('doc_responsavel')
  ) {
    return { success: false, error: 'As categorias dos documentos enviados são inválidas.' }
  }

  const validatedFiles = []
  for (const file of files) {
    const validation = await validateUploadedFile(file, {
      allowedKinds: ['pdf', 'png', 'jpeg'],
      maxBytes: MAX_FILE_SIZE,
    })
    if (!validation.success) {
      return { success: false, error: `Arquivo "${safeOriginalFilename(file.name)}": ${validation.error}` }
    }
    validatedFiles.push({ file, validation })
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
          : 'Não foi possível criar a conta. Revise os dados e tente novamente.',
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

    for (const [index, { file, validation }] of validatedFiles.entries()) {
      const category = categories[index] || 'outros'
      const filePath = `${company.id}/${category}/${crypto.randomUUID()}.${validation.extension}`
      const { error: uploadError } = await supabase.storage.from('company-documents').upload(filePath, validation.bytes, {
        contentType: validation.mimeType,
        upsert: false,
      })
      if (uploadError) throw new Error(`Falha ao enviar "${file.name}": ${uploadError.message}`)
      uploadedPaths.push(filePath)

      const { error: documentError } = await supabase.from('company_documents').insert({
        company_id: company.id,
        document_type: category,
        file_path: filePath,
        file_name: safeOriginalFilename(file.name),
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
    await notifyRegistrationSubmitted({
      companyId: company.id,
      companyName: data.company.companyName.trim(),
      cnpj: cleanCnpj,
      contactName: data.responsible.fullName.trim(),
      contactEmail: data.responsible.email.trim(),
      protocol,
    })
    return { success: true, protocol }
  } catch (error) {
    console.error('Falha ao concluir cadastro público:', error)
    if (uploadedPaths.length > 0) {
      await supabase.storage.from('company-documents').remove(uploadedPaths)
    }
    if (createdCompanyId) await supabase.from('companies').delete().eq('id', createdCompanyId)
    if (createdUserId) await supabase.auth.admin.deleteUser(createdUserId)
    return {
      success: false,
      error: 'Não foi possível concluir o cadastro. Nenhum dado parcial foi mantido; tente novamente.',
    }
  }
}
