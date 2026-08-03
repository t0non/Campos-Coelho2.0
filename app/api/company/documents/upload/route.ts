import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthContext } from '@/lib/supabase/auth'
import { z } from 'zod'
import { safeOriginalFilename, validateUploadedFile } from '@/lib/security/file-validation'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const BUCKET = 'company-documents'
const documentTypeSchema = z.enum(['contrato_social', 'doc_responsavel', 'comprovante_endereco', 'outro'])

export async function POST(request: NextRequest) {
  const ctx = await getAuthContext()

  if (!ctx.user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  if (!ctx.user.company_id) {
    return NextResponse.json(
      { error: 'Empresa não encontrada. Complete o cadastro empresarial primeiro.' },
      { status: 400 },
    )
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Falha ao processar requisição de upload. Tamanho máximo permitido: 10 MB.' },
      { status: 400 },
    )
  }

  const file = formData.get('file') as File | null
  const parsedDocumentType = documentTypeSchema.safeParse(formData.get('document_type'))

  if (!file || !parsedDocumentType.success) {
    return NextResponse.json({ error: 'Arquivo e tipo de documento são obrigatórios.' }, { status: 400 })
  }
  const documentType = parsedDocumentType.data

  const validation = await validateUploadedFile(file, {
    allowedKinds: ['pdf', 'jpeg', 'png', 'webp'],
    maxBytes: MAX_SIZE_BYTES,
  })
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // Gerar caminho seguro: company_id/document_type/timestamp_uuid.ext
  const uniqueId = crypto.randomUUID()
  const filePath = `${ctx.user.company_id}/${documentType}/${Date.now()}_${uniqueId}.${validation.extension}`

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createClient()) as any

  // Upload para o Storage privado
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, validation.bytes, {
      contentType: validation.mimeType,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Falha no upload: ${uploadError.message}` },
      { status: 500 },
    )
  }

  // Registrar metadados no banco de dados
  const { data: docRecord, error: dbError } = await supabase
    .from('company_documents')
    .insert({
      company_id: ctx.user.company_id,
      document_type: documentType,
      file_path: filePath,
      file_name: safeOriginalFilename(file.name),
      status: 'pending',
    })
    .select('id')
    .single()

  if (dbError) {
    // Rollback do arquivo no storage em caso de falha no banco
    await supabase.storage.from(BUCKET).remove([filePath])
    return NextResponse.json(
      { error: `Erro ao salvar metadados do documento: ${dbError.message}` },
      { status: 500 },
    )
  }

  // Registrar audit log
  const trustedWriter = createAdminClient()
  await trustedWriter.from('audit_logs').insert({
    actor_id: ctx.user.id,
    action: 'document_uploaded',
    target_table: 'company_documents',
    target_id: docRecord.id,
    payload: {
      document_type: documentType,
      file_name: safeOriginalFilename(file.name),
      company_id: ctx.user.company_id,
    },
  })

  return NextResponse.json({
    success: true,
    documentId: docRecord.id,
    filePath,
    message: 'Documento enviado com sucesso para análise.',
  })
}
