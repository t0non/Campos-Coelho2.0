import 'server-only'

type SupabaseClientLike = any

function chunksOf<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export async function releaseImportedProductAvailabilityBatch(
  supabase: SupabaseClientLike,
  sessionId: string,
  batchNumber: number,
): Promise<number> {
  const { data: batch, error: batchError } = await supabase
    .from('catalog_import_session_batches')
    .select('rows_start, rows_end')
    .eq('session_id', sessionId)
    .eq('batch_number', batchNumber)
    .single()

  if (batchError || !batch) {
    throw new Error('Não foi possível localizar o lote importado para liberar os produtos.')
  }

  const { data: rows, error: rowsError } = await supabase
    .from('catalog_import_session_rows')
    .select('sku')
    .eq('session_id', sessionId)
    .gte('raw_row_number', batch.rows_start)
    .lte('raw_row_number', batch.rows_end)
    .neq('validation_status', 'error')

  if (rowsError) {
    throw new Error(`Não foi possível ler os SKUs importados: ${rowsError.message}`)
  }

  const skus = Array.from(
    new Set((rows ?? []).map((row: { sku: string }) => row.sku).filter(Boolean)),
  )
  if (skus.length === 0) return 0

  const productIds: string[] = []
  for (const skuChunk of chunksOf(skus, 100)) {
    const { data: products, error } = await supabase
      .from('products')
      .select('id')
      .in('sku', skuChunk)

    if (error) {
      throw new Error(`Não foi possível localizar os produtos importados: ${error.message}`)
    }

    productIds.push(...(products ?? []).map((product: { id: string }) => product.id))
  }

  let released = 0
  for (const productIdChunk of chunksOf(productIds, 100)) {
    const { data: inventories, error } = await supabase
      .from('inventories')
      .select('*')
      .in('product_id', productIdChunk)
      .lte('quantity_available', 0)

    if (error) {
      throw new Error(`Não foi possível ler a disponibilidade importada: ${error.message}`)
    }

    const normalized = (inventories ?? []).map((inventory: Record<string, unknown>) => ({
      ...inventory,
      quantity_available: 9999,
      updated_at: new Date().toISOString(),
    }))

    if (normalized.length > 0) {
      const { error: updateError } = await supabase
        .from('inventories')
        .upsert(normalized, { onConflict: 'id' })

      if (updateError) {
        throw new Error(`Não foi possível liberar os produtos importados: ${updateError.message}`)
      }
    }

    released += normalized.length
  }

  return released
}
