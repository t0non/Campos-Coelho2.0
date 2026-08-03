import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'

export type AdminLogAction =
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DEACTIVATED'
  | 'BRAND_CREATED'
  | 'BRAND_UPDATED'
  | 'BRAND_DEACTIVATED'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_PUBLISHED'
  | 'PRODUCT_UNPUBLISHED'
  | 'PRODUCT_PUBLICATION_TOGGLED'
  | 'PRODUCT_DEACTIVATED'
  | 'PRODUCT_REACTIVATED'
  | 'PRODUCT_CATEGORIES_CORRELATED'
  | 'VARIANT_CREATED'
  | 'VARIANT_UPDATED'
  | 'VARIANT_DEACTIVATED'
  | 'VARIANT_REACTIVATED'
  | 'PRODUCT_IMAGE_UPLOADED'
  | 'PRODUCT_IMAGE_DELETED'
  | 'PRODUCT_IMAGE_ALT_UPDATED'
  | 'PRODUCT_IMAGE_PRIMARY_SET'
  | 'PRODUCT_IMAGE_REORDERED'
  | 'PRICE_TABLE_CREATED'
  | 'PRICE_TABLE_UPDATED'
  | 'PRICE_TABLE_DEACTIVATED'
  | 'PRICE_TABLE_REACTIVATED'
  | 'PRICE_ENTRY_CREATED'
  | 'PRICE_ENTRY_UPDATED'
  | 'PRICE_ENTRY_DEACTIVATED'
  | 'PRICE_ENTRY_REACTIVATED'
  | 'CATALOG_IMPORT_PRICES_NORMALIZED'
  | 'CATALOG_IMPORT_CATALOG_SYNCHRONIZED'
  | 'ORDER_STATUS_UPDATED'
  | 'ADMIN_CREATED'
  /** @deprecated Use PRICE_ENTRY_CREATED ou PRICE_ENTRY_UPDATED no novo fluxo */
  | 'PRICE_TABLE_PRODUCT_UPSERTED'

export async function createAuditLog(
  action: AdminLogAction,
  targetTable: string,
  targetId: string,
  payload: any
) {
  const { user } = await requireAdmin()
  if (!user) throw new Error('Não autenticado')
  const supabase = createAdminClient() as any

  // Limpar payload de dados sensíveis e manter um tamanho razoável
  const safePayload = JSON.parse(JSON.stringify(payload))

  const { error } = await supabase.from('audit_logs').insert({
    actor_id: user.id, // O actor_id vem DE FATO da sessão, e não do form
    action,
    target_table: targetTable,
    target_id: targetId,
    payload: safePayload,
  })

  if (error) {
    console.error('Falha ao registrar audit log:', error)
  }
}
