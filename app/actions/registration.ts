'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { fullRegistrationSchema } from '@/lib/validations/registration'
import { safeOriginalFilename, validateUploadedFile } from '@/lib/security/file-validation'
import { consumePublicRateLimit } from '@/lib/security/public-rate-limit'
import { notifyRegistrationSubmitted } from '@/lib/email/events'
import { PRIVACY_POLICY_VERSION, TERMS_VERSION } from '@/lib/privacy/config'

const MAX_FILE_SIZE = 2 * 1024 * 1024
const ALLOWED_DOCUMENT_CATEGORIES = new Set(['contrato_social', 'doc_responsavel'])

export type PublicRegistrationResult =
  | { success: true; protocol: string }
  | {
      success: false
      error: string
      field?: 'company.cnpj' | 'responsible.email'
    }

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
    maxAttempts: 10,
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
  const responsibleEmail = data.responsible.email.trim().toLowerCase()
  const responsiblePhone = (data.responsible.phone || data.responsible.whatsapp).replace(/\D/g, '')
  const companyEmail = data.company.email?.trim().toLowerCase() || responsibleEmail
  const companyPhone = (data.company.phone || data.responsible.whatsapp).replace(/\D/g, '')
  const companyWhatsapp = (data.company.whatsapp || data.responsible.whatsapp).replace(/\D/g, '')
  const tradingName = data.company.tradingName?.trim() || data.company.companyName.trim()
  let createdUserId: string | null = null
  let createdCompanyId: string | null = null
  const uploadedPaths: string[] = []

  try {
    const { data: existingCompany, error: existingCompanyError } = await supabase
      .from('companies')
      .select('id')
      .eq('cnpj', cleanCnpj)
      .maybeSingle()
    if (existingCompanyError) throw existingCompanyError
    if (existingCompany) {
      return {
        success: false,
        error: 'Este CNPJ já possui cadastro.',
        field: 'company.cnpj',
      }
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: responsibleEmail,
      password: data.responsible.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.responsible.fullName.trim(),
        phone: responsiblePhone,
        role: 'customer',
      },
    })
    if (authError || !authData.user) {
      const authMessage = authError?.message.toLowerCase() ?? ''
      const duplicate =
        authMessage.includes('already') ||
        authMessage.includes('registered') ||
        authMessage.includes('exists')
      return {
        success: false,
        error: duplicate
          ? `O e-mail de acesso do responsável (${responsibleEmail}) já possui uma conta. Altere o campo "E-mail de acesso do responsável" ou entre com a conta existente.`
          : 'Não foi possível criar a conta. Revise os dados e tente novamente.',
        ...(duplicate ? { field: 'responsible.email' as const } : {}),
      }
    }
    createdUserId = authData.user.id

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: createdUserId,
      full_name: data.responsible.fullName.trim(),
      email: responsibleEmail,
      phone: responsiblePhone,
      role: 'customer',
    })
    if (profileError) throw profileError

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        cnpj: cleanCnpj,
        company_name: data.company.companyName.trim(),
        trade_name: tradingName,
        state_registration: data.company.isStateRegistrationExempt ? null : data.company.stateRegistration?.trim() || null,
        segment: data.company.segment,
        business_type: data.company.businessType,
        estimated_order_volume: data.interests.averageOrderValue,
        phone: companyPhone,
        whatsapp: companyWhatsapp,
        email: companyEmail,
        website: data.company.website?.trim() || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (companyError || !company) throw new Error(companyError?.message ?? 'Não foi possível criar a empresa.')
    createdCompanyId = company.id

    const { error: profileCompanyError } = await supabase
      .from('profiles')
      .update({ company_id: company.id })
      .eq('id', createdUserId)
    if (profileCompanyError) throw profileCompanyError

    const { error: memberError } = await supabase.from('company_members').insert({
      company_id: company.id,
      profile_id: createdUserId,
      role: data.responsible.role?.trim() || 'owner',
      is_primary: true,
    })
    if (memberError) throw memberError

    const fiscal = data.addresses.fiscal
    const { error: addressError } = await supabase.from('addresses').insert({
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
    if (addressError) throw addressError

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

    const acknowledgedAt = new Date().toISOString()
    const { error: acknowledgementError } = await supabase
      .from('privacy_acknowledgements')
      .upsert(
        [
          {
            profile_id: createdUserId,
            company_id: company.id,
            document_type: 'terms_of_use',
            document_version: TERMS_VERSION,
            source: 'company_registration',
            acknowledged_at: acknowledgedAt,
          },
          {
            profile_id: createdUserId,
            company_id: company.id,
            document_type: 'privacy_notice',
            document_version: PRIVACY_POLICY_VERSION,
            source: 'company_registration',
            acknowledged_at: acknowledgedAt,
          },
          {
            profile_id: createdUserId,
            company_id: company.id,
            document_type: 'declaration_of_truth',
            document_version: TERMS_VERSION,
            source: 'company_registration',
            acknowledged_at: acknowledgedAt,
          },
        ],
        { onConflict: 'profile_id,document_type,document_version' },
      )
    if (acknowledgementError) throw acknowledgementError

    const protocol = `B2B-${company.id.slice(0, 8).toUpperCase()}`
    const { error: auditError } = await supabase.from('audit_logs').insert({
      actor_id: createdUserId,
      action: 'public_registration_submitted',
      target_table: 'companies',
      target_id: company.id,
      payload: {
        protocol,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
        terms_version: TERMS_VERSION,
        document_count: validatedFiles.length,
      },
    })
    if (auditError) throw auditError

    if (data.consents.receiveNewsletter) {
      const { error: newsletterError } = await supabase
        .from('newsletter_leads')
        .upsert(
          {
            email: responsibleEmail,
            name: data.responsible.fullName.trim(),
            company_name: data.company.companyName.trim(),
            consent_at: acknowledgedAt,
            consent_source: 'company_registration',
            privacy_policy_version: PRIVACY_POLICY_VERSION,
            unsubscribed_at: null,
          },
          { onConflict: 'email' },
        )
      if (newsletterError) {
        console.error('Falha ao registrar a escolha opcional de newsletter:', newsletterError.message)
      }
    }

    await notifyRegistrationSubmitted({
      companyId: company.id,
      companyName: data.company.companyName.trim(),
      cnpj: cleanCnpj,
      contactName: data.responsible.fullName.trim(),
      contactEmail: responsibleEmail,
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
