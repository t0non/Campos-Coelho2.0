import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET?.trim()
  const authorization = request.headers.get('authorization')
  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: expired, error: selectError } = await supabase
    .from('company_documents')
    .select('id, file_path, company:companies!inner(status)')
    .eq('companies.status', 'rejected')
    .not('retention_until', 'is', null)
    .lte('retention_until', new Date().toISOString())
    .limit(100)

  if (selectError) {
    console.error('[privacy-retention] Falha ao consultar documentos:', selectError.message)
    return NextResponse.json({ error: 'Falha ao consultar retencao.' }, { status: 500 })
  }
  if (!expired?.length) return NextResponse.json({ removed: 0 })

  const paths = expired.map((document) => document.file_path)
  const { error: storageError } = await supabase.storage
    .from('company-documents')
    .remove(paths)
  if (storageError) {
    console.error('[privacy-retention] Falha ao remover arquivos:', storageError.message)
    return NextResponse.json({ error: 'Falha ao remover arquivos.' }, { status: 500 })
  }

  const ids = expired.map((document) => document.id)
  const { error: deleteError } = await supabase
    .from('company_documents')
    .delete()
    .in('id', ids)
  if (deleteError) {
    console.error('[privacy-retention] Falha ao remover registros:', deleteError.message)
    return NextResponse.json({ error: 'Falha ao remover registros.' }, { status: 500 })
  }

  await supabase.from('audit_logs').insert({
    action: 'expired_company_documents_removed',
    target_table: 'company_documents',
    payload: { removed_count: ids.length },
  })

  return NextResponse.json({ removed: ids.length })
}
