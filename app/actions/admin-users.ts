'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminUserSchema } from '@/lib/validations/admin-users'
import { notifyAdminCreated } from '@/lib/email/events'
import type { CreateAdminUserState } from '@/lib/state/admin-users-state'

export async function createAdminUser(
  _previousState: CreateAdminUserState,
  formData: FormData,
): Promise<CreateAdminUserState> {
  const context = await requireAdmin()
  const parsed = createAdminUserSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revise os campos destacados.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch (err) {
    console.error('[createAdminUser] falha ao criar client admin do Supabase:', err)
    return {
      status: 'error',
      message: 'Configuração do servidor incompleta. Contate o suporte técnico.',
    }
  }

  const { fullName, email, password } = parsed.data
  const { data: created, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin',
    },
    app_metadata: {
      role: 'admin',
    },
  })

  if (authError || !created.user) {
    const isDuplicate =
      authError?.message.toLowerCase().includes('already') ||
      authError?.message.toLowerCase().includes('registered')

    if (!isDuplicate) {
      console.error('[createAdminUser] falha ao criar usuário no auth:', authError)
    }

    return {
      status: 'error',
      message: isDuplicate
        ? 'Este e-mail já possui uma conta.'
        : 'Não foi possível criar o administrador. Tente novamente.',
    }
  }

  const { error: profileError } = await supabase.from('profiles').upsert({
    id: created.user.id,
    full_name: fullName,
    email,
    role: 'admin',
    status: 'active',
    company_id: null,
  })

  if (profileError) {
    console.error('[createAdminUser] falha ao criar/atualizar profile:', profileError)
    await supabase.auth.admin.deleteUser(created.user.id)
    return {
      status: 'error',
      message: 'A conta não foi concluída e nenhuma alteração parcial foi mantida.',
    }
  }

  try {
    const { error: auditError } = await supabase.from('audit_logs').insert({
      actor_id: context.user!.id,
      action: 'ADMIN_CREATED',
      target_table: 'profiles',
      target_id: created.user.id,
      payload: {
        email,
        full_name: fullName,
      },
    })
    if (auditError) {
      console.error('[createAdminUser] falha ao registrar audit_log:', auditError)
    }

    await notifyAdminCreated({
      userId: created.user.id,
      fullName,
      email,
    })
  } catch (err) {
    console.error('[createAdminUser] falha em pós-processamento (audit/email):', err)
  }

  try {
    revalidatePath('/admin/administradores')
  } catch (err) {
    console.error('[createAdminUser] falha ao revalidar path:', err)
  }

  return {
    status: 'success',
    message: `Administrador ${email} criado com sucesso. A senha não será exibida novamente.`,
  }
}
