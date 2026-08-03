import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'

export interface AdminUserListItem {
  id: string
  fullName: string
  email: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  isPrimary: boolean
}

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, status, created_at')
    .eq('role', 'admin')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Não foi possível carregar os administradores.')
  }

  return (data ?? []).map((admin, index) => ({
    id: admin.id,
    fullName: admin.full_name,
    email: admin.email,
    status: admin.status,
    createdAt: admin.created_at,
    isPrimary: index === 0,
  }))
}
