'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { consumePublicRateLimit } from '@/lib/security/public-rate-limit'
import { validateCNPJ } from '@/lib/utils/masks'
import { resetPasswordSchema } from '@/lib/validations/auth'

export type CnpjLoginResult =
  | { success: true; destination: string }
  | { success: false; error: string }

export type UpdatePasswordResult =
  | { success: true }
  | { success: false; error: string; invalidSession?: boolean }

export async function updateOwnPassword(
  password: string,
  passwordConfirmation: string,
): Promise<UpdatePasswordResult> {
  const parsed = resetPasswordSchema.safeParse({
    password,
    confirm_password: passwordConfirmation,
  })
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Revise a nova senha.',
    }
  }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user?.email) {
    return {
      success: false,
      error: 'O link não é mais válido. Solicite uma nova recuperação de senha.',
      invalidSession: true,
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })
  if (error) {
    const message = error.message.toLowerCase()
    if (message.includes('same password')) {
      return { success: false, error: 'A nova senha não pode ser igual à senha atual.' }
    }
    if (message.includes('weak password')) {
      return {
        success: false,
        error: 'Senha muito fraca. Use ao menos 8 caracteres, uma maiúscula e um número.',
      }
    }
    if (message.includes('session') || message.includes('expired')) {
      return {
        success: false,
        error: 'O link não é mais válido. Solicite uma nova recuperação de senha.',
        invalidSession: true,
      }
    }
    return { success: false, error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  return { success: true }
}

export async function loginWithCnpj(
  cnpj: string,
  password: string,
): Promise<CnpjLoginResult> {
  const cleanCnpj = cnpj.replace(/\D/g, '')

  if (!validateCNPJ(cleanCnpj) || password.length < 8) {
    return { success: false, error: 'CNPJ ou senha incorretos.' }
  }

  const allowed = await consumePublicRateLimit({
    action: 'cnpj_login',
    maxAttempts: 10,
    windowSeconds: 900,
    subject: cleanCnpj,
  })

  if (!allowed) {
    return {
      success: false,
      error: 'Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.',
    }
  }

  const admin = createAdminClient()
  const { data: company } = await admin
    .from('companies')
    .select('id, status')
    .eq('cnpj', cleanCnpj)
    .maybeSingle()

  if (!company) {
    return { success: false, error: 'CNPJ ou senha incorretos.' }
  }

  const { data: primaryMember } = await admin
    .from('company_members')
    .select('profile_id')
    .eq('company_id', company.id)
    .eq('is_primary', true)
    .maybeSingle()

  if (!primaryMember) {
    return { success: false, error: 'CNPJ ou senha incorretos.' }
  }

  const { data: authUser } = await admin.auth.admin.getUserById(primaryMember.profile_id)
  const email = authUser.user?.email

  if (!email) {
    return { success: false, error: 'CNPJ ou senha incorretos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { success: false, error: 'CNPJ ou senha incorretos.' }
  }

  if (company.status === 'approved') {
    return { success: true, destination: '/minha-conta' }
  }
  if (company.status === 'pending') {
    return { success: true, destination: '/conta-pendente' }
  }

  return { success: true, destination: '/conta-recusada' }
}
