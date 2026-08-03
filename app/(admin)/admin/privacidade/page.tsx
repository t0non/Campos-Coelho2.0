export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { PrivacyRequestManager } from '@/components/admin/privacy-request-manager'
import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Privacidade e LGPD | Admin' }

export default async function AdminPrivacyPage() {
  await requireAdmin()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('privacy_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="mx-auto w-full max-w-6xl">
      <AdminPageHeader
        title="Privacidade e LGPD"
        description="Receba, valide e registre a resposta aos pedidos dos titulares. Confirme a identidade antes de entregar ou alterar dados."
      />
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          A estrutura de privacidade ainda nao foi aplicada ao banco de dados. Execute a migracao pendente antes de usar este painel.
        </div>
      ) : (
        <PrivacyRequestManager requests={data ?? []} />
      )}
    </div>
  )
}
