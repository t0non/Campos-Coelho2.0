import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { correlateImportedProductBatch } from '@/lib/data/product-category-correlation'
import { releaseImportedProductAvailabilityBatch } from '@/lib/data/catalog-import-availability'
import { getAdminApiContext } from '@/lib/supabase/api-admin'
import { ProcessCatalogBatchSchema } from '@/lib/validations/admin-import'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminApiContext()
    if ('response' in auth) return auth.response
    const { supabase, user } = auth
    const parsed = ProcessCatalogBatchSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Lote de importação inválido.' }, { status: 400 })
    }
    const { session_id, batch_number } = parsed.data
    const { data: session } = await supabase
      .from('catalog_import_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('admin_id', user.id)
      .maybeSingle()
    if (!session) {
      return NextResponse.json({ error: 'Sessão de importação não encontrada.' }, { status: 404 })
    }

    const { data, error } = await supabase.rpc('import_products_batch_atomic', {
      p_import_session_id: session_id,
      p_batch_number: batch_number
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const categoryCorrelation = await correlateImportedProductBatch(
      supabase,
      session_id,
      Number(batch_number),
    )
    const releasedForOrdering = await releaseImportedProductAvailabilityBatch(
      createAdminClient(),
      session_id,
      Number(batch_number),
    )

    return NextResponse.json({
      ...(data && typeof data === 'object' ? data : {}),
      category_correlation: categoryCorrelation,
      released_for_ordering: releasedForOrdering,
    })

  } catch (error: unknown) {
    console.error('Process Batch API Error:', error)
    return NextResponse.json({ error: 'Não foi possível processar o lote.' }, { status: 500 })
  }
}
