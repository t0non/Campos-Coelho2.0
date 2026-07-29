import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { correlateImportedProductBatch } from '@/lib/data/product-category-correlation'
import { releaseImportedProductAvailabilityBatch } from '@/lib/data/catalog-import-availability'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { session_id, batch_number } = await request.json()

    if (!session_id || batch_number === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
    const message = error instanceof Error ? error.message : 'Erro interno no servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
