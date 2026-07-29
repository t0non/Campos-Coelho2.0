import 'server-only'

import {
  PRODUCT_CATEGORY_SLUGS,
  inferProductCategorySlug,
  type ProductCategorySlug,
} from '@/lib/catalog/product-category'

type SupabaseClientLike = any

type CorrelatableProduct = {
  id: string
  name: string
  category_id: string | null
}

export type ProductCategoryCorrelationResult = {
  processed: number
  updated: number
  unchanged: number
  byCategory: Record<ProductCategorySlug, number>
}

const emptyCategoryTotals = (): Record<ProductCategorySlug, number> => ({
  'cozinha-mesa': 0,
  'jardim-decoracao': 0,
  organizacao: 0,
  'utilidades-limpeza': 0,
  diversos: 0,
})

function chunksOf<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

async function getCategoryIdsBySlug(
  supabase: SupabaseClientLike,
): Promise<Map<ProductCategorySlug, string>> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug')
    .in('slug', [...PRODUCT_CATEGORY_SLUGS])
    .eq('is_active', true)

  if (error) {
    throw new Error(`Não foi possível consultar as categorias: ${error.message}`)
  }

  const categoryIds = new Map<ProductCategorySlug, string>()
  for (const category of data ?? []) {
    if (PRODUCT_CATEGORY_SLUGS.includes(category.slug as ProductCategorySlug)) {
      categoryIds.set(category.slug as ProductCategorySlug, category.id)
    }
  }

  const missing = PRODUCT_CATEGORY_SLUGS.filter((slug) => !categoryIds.has(slug))
  if (missing.length > 0) {
    throw new Error(`Categorias obrigatórias ausentes ou inativas: ${missing.join(', ')}`)
  }

  return categoryIds
}

async function applyCategoryCorrelation(
  supabase: SupabaseClientLike,
  products: CorrelatableProduct[],
): Promise<ProductCategoryCorrelationResult> {
  const categoryIds = await getCategoryIdsBySlug(supabase)
  const groupedUpdates = new Map<string, string[]>()
  const byCategory = emptyCategoryTotals()
  let unchanged = 0

  for (const product of products) {
    const categorySlug = inferProductCategorySlug(product.name)
    const categoryId = categoryIds.get(categorySlug)!
    byCategory[categorySlug] += 1

    if (product.category_id === categoryId) {
      unchanged += 1
      continue
    }

    const ids = groupedUpdates.get(categoryId) ?? []
    ids.push(product.id)
    groupedUpdates.set(categoryId, ids)
  }

  let updated = 0
  for (const [categoryId, productIds] of groupedUpdates) {
    for (const productIdChunk of chunksOf(productIds, 100)) {
      const { error } = await supabase
        .from('products')
        .update({ category_id: categoryId, updated_at: new Date().toISOString() })
        .in('id', productIdChunk)

      if (error) {
        throw new Error(`Não foi possível atualizar as categorias dos produtos: ${error.message}`)
      }

      updated += productIdChunk.length
    }
  }

  return {
    processed: products.length,
    updated,
    unchanged,
    byCategory,
  }
}

export async function correlateAllProductCategories(
  supabase: SupabaseClientLike,
): Promise<ProductCategoryCorrelationResult> {
  const products: CorrelatableProduct[] = []
  const pageSize = 500

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category_id')
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1)

    if (error) {
      throw new Error(`Não foi possível ler todos os produtos: ${error.message}`)
    }

    const page = (data ?? []) as CorrelatableProduct[]
    products.push(...page)
    if (page.length < pageSize) break
  }

  return applyCategoryCorrelation(supabase, products)
}

export async function correlateImportedProductBatch(
  supabase: SupabaseClientLike,
  sessionId: string,
  batchNumber: number,
): Promise<ProductCategoryCorrelationResult> {
  const { data: batch, error: batchError } = await supabase
    .from('catalog_import_session_batches')
    .select('rows_start, rows_end')
    .eq('session_id', sessionId)
    .eq('batch_number', batchNumber)
    .single()

  if (batchError || !batch) {
    throw new Error('Não foi possível localizar o lote importado para categorizar os produtos.')
  }

  const { data: rows, error: rowsError } = await supabase
    .from('catalog_import_session_rows')
    .select('sku')
    .eq('session_id', sessionId)
    .gte('raw_row_number', batch.rows_start)
    .lte('raw_row_number', batch.rows_end)
    .neq('validation_status', 'error')

  if (rowsError) {
    throw new Error(`Não foi possível ler os produtos importados: ${rowsError.message}`)
  }

  const skus = Array.from(new Set((rows ?? []).map((row: { sku: string }) => row.sku).filter(Boolean)))
  if (skus.length === 0) {
    return { processed: 0, updated: 0, unchanged: 0, byCategory: emptyCategoryTotals() }
  }

  const products: CorrelatableProduct[] = []
  for (const skuChunk of chunksOf(skus, 100)) {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category_id')
      .in('sku', skuChunk)

    if (error) {
      throw new Error(`Não foi possível localizar os produtos importados: ${error.message}`)
    }

    products.push(...((data ?? []) as CorrelatableProduct[]))
  }

  return applyCategoryCorrelation(supabase, products)
}
