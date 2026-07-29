'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { invalidatePricingCache } from '@/lib/utils/cache'
import { parseBrazilianMoney } from '@/lib/utils/money-parser'
import { PriceTableInputSchema, PriceTableBaseSchema, PriceEntryInputSchema } from '@/lib/validations/admin-catalog'
import { createAuditLog } from '@/lib/utils/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function chunksOf<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function normalizeLatestImportedCatalogPricesAction() {
  await requireAdmin()
  const admin = createAdminClient() as any

  const { data: session, error: sessionError } = await admin
    .from('catalog_import_sessions')
    .select('id, price_table_id, file_name')
    .not('price_table_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError || !session?.price_table_id) {
    throw new Error('Não foi encontrada uma importação com tabela de preços.')
  }

  const { data: previousNormalization } = await admin
    .from('audit_logs')
    .select('id, payload')
    .eq('action', 'CATALOG_IMPORT_PRICES_NORMALIZED')
    .eq('target_id', session.id)
    .limit(1)
    .maybeSingle()

  if (previousNormalization) {
    const previousCount = Number(previousNormalization.payload?.prices_updated ?? 0)
    redirect(`/admin/produtos?precos=ja-corrigidos&valores=${previousCount}`)
  }

  const importedSkus: string[] = []
  const pageSize = 500
  for (let from = 0; ; from += pageSize) {
    const { data: rows, error } = await admin
      .from('catalog_import_session_rows')
      .select('sku')
      .eq('session_id', session.id)
      .neq('validation_status', 'error')
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`Não foi possível ler a importação: ${error.message}`)

    const page = rows ?? []
    importedSkus.push(...page.map((row: { sku: string }) => row.sku).filter(Boolean))
    if (page.length < pageSize) break
  }

  const productIds: string[] = []
  for (const skuChunk of chunksOf(Array.from(new Set(importedSkus)), 100)) {
    const { data: products, error } = await admin
      .from('products')
      .select('id')
      .in('sku', skuChunk)

    if (error) throw new Error(`Não foi possível localizar os produtos: ${error.message}`)
    productIds.push(...(products ?? []).map((product: { id: string }) => product.id))
  }

  const priceEntries: any[] = []
  const inventories: any[] = []

  for (const productIdChunk of chunksOf(productIds, 100)) {
    const [{ data: prices, error: pricesError }, { data: stockRows, error: stockError }] =
      await Promise.all([
        admin
          .from('price_table_products')
          .select('*')
          .eq('price_table_id', session.price_table_id)
          .in('product_id', productIdChunk),
        admin
          .from('inventories')
          .select('*')
          .in('product_id', productIdChunk),
      ])

    if (pricesError) {
      throw new Error(`Não foi possível ler os preços atuais: ${pricesError.message}`)
    }
    if (stockError) {
      throw new Error(`Não foi possível ler a disponibilidade atual: ${stockError.message}`)
    }

    priceEntries.push(...(prices ?? []))
    inventories.push(...(stockRows ?? []))
  }

  const correctedAt = new Date().toISOString()
  const correctedPrices = priceEntries.map((entry) => ({
    ...entry,
    unit_price: Number((Number(entry.unit_price) / 100).toFixed(2)),
    promotional_price:
      entry.promotional_price == null
        ? null
        : Number((Number(entry.promotional_price) / 100).toFixed(2)),
    updated_at: correctedAt,
  }))

  const availableInventories = inventories.map((inventory) => ({
    ...inventory,
    quantity_available:
      Number(inventory.quantity_available) > 0
        ? Number(inventory.quantity_available)
        : 9999,
    updated_at: correctedAt,
  }))

  for (const priceChunk of chunksOf(correctedPrices, 100)) {
    const { error } = await admin
      .from('price_table_products')
      .upsert(priceChunk, { onConflict: 'id' })

    if (error) throw new Error(`Não foi possível corrigir os preços: ${error.message}`)
  }

  for (const inventoryChunk of chunksOf(availableInventories, 100)) {
    const { error } = await admin
      .from('inventories')
      .upsert(inventoryChunk, { onConflict: 'id' })

    if (error) {
      throw new Error(`Não foi possível liberar os produtos para pedido: ${error.message}`)
    }
  }

  await createAuditLog(
    'CATALOG_IMPORT_PRICES_NORMALIZED',
    'catalog_import_sessions',
    session.id,
    {
      file_name: session.file_name,
      prices_updated: correctedPrices.length,
      inventories_released: availableInventories.filter(
        (inventory) => Number(inventory.quantity_available) === 9999,
      ).length,
    },
  )

  invalidatePricingCache()
  revalidatePath('/')
  revalidatePath('/catalogo')
  revalidatePath('/carrinho')

  redirect(
    `/admin/produtos?precos=corrigidos&valores=${correctedPrices.length}&estoques=${availableInventories.length}`,
  )
}

export async function createPriceTableAction(data: any) {
  await requireAdmin()
  const parsed = PriceTableInputSchema.parse(data)
  const supabase = (await createClient()) as any

  const { data: result, error } = await supabase.rpc('create_price_table_atomic', {
    p_name: parsed.name,
    p_description: parsed.description || null,
    p_starts_at: parsed.starts_at || null,
    p_ends_at: parsed.ends_at || null,
  })

  if (error) return { success: false, message: error.message }
  if (result?.no_op) return { success: true, no_op: true }

  invalidatePricingCache()
  return { success: true, id: result?.id }
}

export async function updatePriceTableAction(id: string, data: any) {
  await requireAdmin()
  const parsed = PriceTableBaseSchema.partial().parse(data)
  const supabase = (await createClient()) as any

  const { data: result, error } = await supabase.rpc('update_price_table_atomic', {
    p_id: id,
    p_name: parsed.name,
    p_description: parsed.description || null,
    p_starts_at: parsed.starts_at || null,
    p_ends_at: parsed.ends_at || null,
  })

  if (error) return { success: false, message: error.message }
  if (result?.no_op) return { success: true, no_op: true }

  invalidatePricingCache()
  return { success: true }
}

export async function togglePriceTableStatusAction(id: string, isActive: boolean) {
  await requireAdmin()
  const supabase = (await createClient()) as any

  const { data: result, error } = await supabase.rpc('set_price_table_status_atomic', {
    p_id: id,
    p_is_active: isActive,
  })

  if (error) return { success: false, message: error.message }
  if (result?.no_op) return { success: true, no_op: true }

  invalidatePricingCache()
  return { success: true }
}

export async function upsertPriceEntryAction(data: any) {
  await requireAdmin()

  // 1. Processar e normalizar strings de entrada monetária pt-BR
  const inputData = { ...data }
  if (typeof inputData.unit_price === 'string') {
    inputData.unit_price = parseBrazilianMoney(inputData.unit_price)
  }
  if (typeof inputData.promotional_price === 'string' && inputData.promotional_price.trim() !== '') {
    inputData.promotional_price = parseBrazilianMoney(inputData.promotional_price)
  } else if (!inputData.promotional_price) {
    inputData.promotional_price = null
  }

  const parsed = PriceEntryInputSchema.parse(inputData)
  const supabase = (await createClient()) as any

  const { data: result, error } = await supabase.rpc('upsert_price_entry_atomic', {
    p_price_table_id: parsed.price_table_id,
    p_product_id: parsed.product_id,
    p_variant_id: parsed.variant_id || null,
    p_min_quantity: parsed.min_quantity,
    p_unit_price: parsed.unit_price,
    p_promotional_price: parsed.promotional_price || null,
    p_promotion_starts_at: parsed.promotion_starts_at || null,
    p_promotion_ends_at: parsed.promotion_ends_at || null,
  })

  if (error) return { success: false, message: error.message }
  if (result?.no_op) return { success: true, id: result.id, no_op: true }

  invalidatePricingCache()
  return { success: true, id: result?.id }
}

export async function togglePriceEntryStatusAction(id: string, isActive: boolean) {
  await requireAdmin()
  const supabase = (await createClient()) as any

  const { data: result, error } = await supabase.rpc('set_price_entry_status_atomic', {
    p_id: id,
    p_is_active: isActive,
  })

  if (error) return { success: false, message: error.message }
  if (result?.no_op) return { success: true, no_op: true }

  invalidatePricingCache()
  return { success: true }
}
