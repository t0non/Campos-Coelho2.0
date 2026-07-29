import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiContext } from '@/lib/supabase/api-admin'
import { ArchiveCatalogSchema } from '@/lib/validations/admin-import'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminApiContext()
    if ('response' in auth) return auth.response
    const { supabase } = auth
    const parsed = ArchiveCatalogSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Texto de confirmação incorreto' }, { status: 400 })
    }
    const { confirmation_text } = parsed.data

    const { data, error } = await supabase.rpc('archive_all_catalog_products_atomic', {
      p_confirmation_text: confirmation_text
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)

  } catch (error: unknown) {
    console.error('Archive API Error:', error)
    return NextResponse.json({ error: 'Não foi possível arquivar o catálogo.' }, { status: 500 })
  }
}
