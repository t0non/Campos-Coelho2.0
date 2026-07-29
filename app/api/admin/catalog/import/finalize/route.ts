import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiContext } from '@/lib/supabase/api-admin'
import { CatalogSessionSchema } from '@/lib/validations/admin-import'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAdminApiContext()
    if ('response' in auth) return auth.response
    const { supabase, user } = auth
    const parsed = CatalogSessionSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Sessão de importação inválida.' }, { status: 400 })
    }
    const { session_id } = parsed.data
    const { data: session } = await supabase
      .from('catalog_import_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('admin_id', user.id)
      .maybeSingle()
    if (!session) {
      return NextResponse.json({ error: 'Sessão de importação não encontrada.' }, { status: 404 })
    }

    const { data, error } = await supabase.rpc('finalize_catalog_replacement_atomic', {
      p_import_session_id: session_id
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)

  } catch (error: unknown) {
    console.error('Finalize API Error:', error)
    return NextResponse.json({ error: 'Não foi possível finalizar a importação.' }, { status: 500 })
  }
}
