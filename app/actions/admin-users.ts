'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminUserSchema } from '@/lib/validations/admin-users'
import { notifyAdminCreated } from '@/lib/email/events'

export interface CreateAdminUserState {
  status: 'idle' | 'success' | 'error'
  message: string
  fieldErrors?: Partial<Record<'fullName' | 'email' | 'password' | 'passwordConfirmation', string[]>>
}

export const initialCreateAdminUserState: CreateAdminUserState = {
  status: 'idle',
  message: '',
}

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

  const supabase = createAdminClient()
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
    await supabase.auth.admin.deleteUser(created.user.id)
    return {
      status: 'error',
      message: 'A conta não foi concluída e nenhuma alteração parcial foi mantida.',
    }
  }

  await supabase.from('audit_logs').insert({
    actor_id: context.user!.id,
    action: 'ADMIN_CREATED',
    target_table: 'profiles',
    target_id: created.user.id,
    payload: {
      email,
      full_name: fullName,
    },
  })

  await notifyAdminCreated({
    userId: created.user.id,
    fullName,
    email,
  })
  revalidatePath('/admin/administradores')

  return {
    status: 'success',
    message: `Administrador ${email} criado com sucesso. A senha não será exibida novamente.`,
  }
}
