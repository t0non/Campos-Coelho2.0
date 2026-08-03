import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * Endpoint simples para o monitoramento externo confirmar que a aplicação e
 * sua conexão essencial com o banco estão disponíveis. Não expõe credenciais,
 * mensagens internas ou dados de clientes.
 */
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('products')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error) throw error

    return NextResponse.json(
      { status: 'ok', database: 'ok', checkedAt: new Date().toISOString() },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  } catch (error) {
    console.error('[health] Dependência indisponível:', error)
    return NextResponse.json(
      { status: 'unavailable', database: 'unavailable', checkedAt: new Date().toISOString() },
      { status: 503, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    )
  }
}
