'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/supabase/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createAuditLog } from '@/lib/utils/audit'
import { invalidatePricingCache, invalidateProductCache } from '@/lib/utils/cache'
import { standardizeCatalogProductName } from '@/lib/catalog/product-name'

type ImportedRow = {
  sku: string
  name: string
  sale_price: number | string | null
  validation_status: string
}

function chunksOf<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function synchronizeLatestImportedCatalogAction() {
  await requireAdmin()
  const admin = createAdminClient() as any

  const { data: session, error: sessionError } = await admin
    .from('catalog_import_sessions')
    .select('id, file_name, price_table_id')
    .not('price_table_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (sessionError || !session?.price_table_id) {
    throw new Error('Não foi encontrada uma planilha importada com tabela de preços.')
  }

  const importedRows: ImportedRow[] = []
  const pageSize = 500

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await admin
      .from('catalog_import_session_rows')
      .select('sku, name, sale_price, validation_status')
      .eq('session_id', session.id)
      .order('raw_row_number', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) throw new Error(`Não foi possível ler a planilha importada: ${error.message}`)

    const page = data ?? []
    importedRows.push(...page)
    if (page.length < pageSize) break
  }

  if (importedRows.length === 0) {
    throw new Error('A última planilha importada não possui produtos válidos.')
  }

  const { data: legacyNormalization } = await admin
    .from('audit_logs')
    .select('id')
    .eq('action', 'CATALOG_IMPORT_PRICES_NORMALIZED')
    .eq('target_id', session.id)
    .limit(1)
    .maybeSingle()

  const legacyPriceFactor = legacyNormalization ? 0.01 : 1
  const preparedRows = importedRows.map(row => ({
    sku: row.sku,
    name: standardizeCatalogProductName(row.name),
    price:
      row.sale_price == null
        ? null
        : Number((Number(row.sale_price) * legacyPriceFactor).toFixed(2)),
  }))

  const positivePricesByName = new Map<string, Set<number>>()
  for (const row of preparedRows) {
    if (row.price == null || row.price <= 0) continue
    const key = row.name.toLocaleLowerCase('pt-BR')
    const prices = positivePricesByName.get(key) ?? new Set<number>()
    prices.add(row.price)
    positivePricesByName.set(key, prices)
  }

  let inferredPrices = 0
  const completedRows = preparedRows.map(row => {
    if (row.price != null && row.price > 0) return row

    const matchingPrices = positivePricesByName.get(row.name.toLocaleLowerCase('pt-BR'))
    if (matchingPrices?.size !== 1) return row

    inferredPrices += 1
    return {
      ...row,
      price: Array.from(matchingPrices)[0],
    }
  })

  const unresolvedPrices = completedRows.filter(row => row.price == null || row.price <= 0)
  if (unresolvedPrices.length > 0) {
    throw new Error(
      `Ainda existem ${unresolvedPrices.length} produtos sem preço comprovável na planilha.`,
    )
  }

  const products: any[] = []
  for (const skuChunk of chunksOf(completedRows.map(row => row.sku), 100)) {
    const { data, error } = await admin
      .from('products')
      .select('*')
      .in('sku', skuChunk)

    if (error) throw new Error(`Não foi possível localizar os produtos: ${error.message}`)
    products.push(...(data ?? []))
  }

  const productBySku = new Map(products.map(product => [product.sku, product]))
  const missingProducts = completedRows.filter(row => !productBySku.has(row.sku))
  if (missingProducts.length > 0) {
    throw new Error(`${missingProducts.length} produtos da planilha ainda não estão no catálogo.`)
  }

  const variants: any[] = []
  for (const productIdChunk of chunksOf(products.map(product => product.id), 100)) {
    const { data, error } = await admin
      .from('product_variants')
      .select('*')
      .in('product_id', productIdChunk)

    if (error) throw new Error(`Não foi possível localizar as variantes: ${error.message}`)
    variants.push(...(data ?? []))
  }

  const variantByProductAndSku = new Map(
    variants.map(variant => [`${variant.product_id}:${variant.sku}`, variant]),
  )

  const preparedAt = new Date().toISOString()
  const updatedProducts: any[] = []
  const updatedVariants: any[] = []
  const synchronizedPrices: any[] = []

  for (const row of completedRows) {
    const product = productBySku.get(row.sku)
    const variant = variantByProductAndSku.get(`${product.id}:${row.sku}`)

    if (!variant) {
      throw new Error(`A variante principal do SKU ${row.sku} não foi encontrada.`)
    }

    updatedProducts.push({
      ...product,
      name: row.name,
      updated_at: preparedAt,
    })
    updatedVariants.push({
      ...variant,
      name: row.name,
      updated_at: preparedAt,
    })
    synchronizedPrices.push({
      price_table_id: session.price_table_id,
      product_id: product.id,
      variant_id: variant.id,
      min_quantity: 1,
      unit_price: row.price,
      is_active: true,
      updated_at: preparedAt,
    })
  }

  for (const productChunk of chunksOf(updatedProducts, 100)) {
    const { error } = await admin
      .from('products')
      .upsert(productChunk, { onConflict: 'id' })

    if (error) throw new Error(`Não foi possível padronizar os produtos: ${error.message}`)
  }

  for (const variantChunk of chunksOf(updatedVariants, 100)) {
    const { error } = await admin
      .from('product_variants')
      .upsert(variantChunk, { onConflict: 'id' })

    if (error) throw new Error(`Não foi possível padronizar as variantes: ${error.message}`)
  }

  for (const priceChunk of chunksOf(synchronizedPrices, 100)) {
    const { error } = await admin
      .from('price_table_products')
      .upsert(priceChunk, {
        onConflict: 'price_table_id,product_id,variant_id,min_quantity',
      })

    if (error) throw new Error(`Não foi possível sincronizar os preços: ${error.message}`)
  }

  await createAuditLog(
    'CATALOG_IMPORT_CATALOG_SYNCHRONIZED',
    'catalog_import_sessions',
    session.id,
    {
      file_name: session.file_name,
      products_updated: updatedProducts.length,
      variants_updated: updatedVariants.length,
      prices_synchronized: synchronizedPrices.length,
      inferred_prices: inferredPrices,
    },
  )

  invalidateProductCache()
  invalidatePricingCache()
  revalidatePath('/')
  revalidatePath('/carrinho')

  redirect(
    `/admin/produtos?sincronizacao=concluida&produtos=${updatedProducts.length}&precos=${synchronizedPrices.length}&inferidos=${inferredPrices}`,
  )
}
