import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiContext } from '@/lib/supabase/api-admin'
import { ConfirmCatalogImportSchema } from '@/lib/validations/admin-import'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminApiContext()
    if ('response' in auth) return auth.response
    const { supabase } = auth
    const parsed = ConfirmCatalogImportSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Parâmetros de importação inválidos.' }, { status: 400 })
    }
    const { session_id, mode, price_table_id, publish_products } = parsed.data

    const { data, error } = await supabase.rpc('confirm_catalog_import_session_atomic', {
      p_session_id: session_id,
      p_mode: mode,
      p_price_table_id: price_table_id || null,
      p_publish_products: !!publish_products
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)

  } catch (error: unknown) {
    console.error('Confirm API Error:', error)
    return NextResponse.json({ error: 'Não foi possível confirmar a importação.' }, { status: 500 })
  }
}
