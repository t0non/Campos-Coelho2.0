import { NextRequest, NextResponse } from 'next/server'
import { getAdminApiContext } from '@/lib/supabase/api-admin'
import { validateUploadedFile } from '@/lib/security/file-validation'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB para o arquivo individual
const MAX_OPERATIONAL_BODY = 6 * 1024 * 1024 // 6 MB para o corpo total da requisição multipart

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params
  
  // Validar UUID
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId)) {
    return NextResponse.json({ success: false, message: 'ID do produto inválido' }, { status: 400 })
  }

  // Validação explícita de Origin (CSRF/Cross-Origin security)
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  
  if (origin) {
    try {
      const originUrl = new URL(origin)
      const originHost = originUrl.host
      if (host && originHost !== host) {
        return NextResponse.json({ success: false, message: 'Origem não permitida (Cross-Origin Bloqueado).' }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ success: false, message: 'Header Origin malformado.' }, { status: 400 })
    }
  }

  try {
    const auth = await getAdminApiContext()
    if ('response' in auth) return auth.response
    const { supabase } = auth
    
    // 1. ANTES DE formData(): Validação do limite operacional do corpo da requisição
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_OPERATIONAL_BODY) {
      return NextResponse.json({ success: false, message: 'Payload multipart excede o limite operacional de 6MB.' }, { status: 413 })
    }

    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ success: false, message: 'Content-Type inválido. Requer multipart/form-data.' }, { status: 415 })
    }

    const formData = await req.formData()
    
    // Precisamos validar que há exatamente UM arquivo
    let fileCount = 0
    let file: File | null = null

    for (const [, value] of Array.from(formData.entries())) {
      if (value instanceof File) {
        fileCount++
        file = value
      }
    }

    if (fileCount === 0) {
      return NextResponse.json({ success: false, message: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    if (fileCount > 1) {
      return NextResponse.json({ success: false, message: 'Apenas um arquivo é permitido por requisição.' }, { status: 400 })
    }

    // 2. DEPOIS DE formData(): Validação estrita do arquivo
    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, message: 'O arquivo enviado está vazio.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'O arquivo excede o limite de 5MB.' }, { status: 413 })
    }

    // Validação de magic bytes
    const validation = await validateUploadedFile(file, {
      allowedKinds: ['jpeg', 'png', 'webp'],
      maxBytes: MAX_FILE_SIZE,
    })
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error }, { status: 415 })
    }

    // Confirmar se produto existe
    const { data: product } = await supabase.from('products').select('id').eq('id', productId).maybeSingle()
    if (!product) {
      return NextResponse.json({ success: false, message: 'Produto não encontrado.' }, { status: 404 })
    }

    const uuid = crypto.randomUUID()
    const relativePath = `products/${productId}/${uuid}.${validation.extension}`

    // 1. Enviar ao Storage usando o token autenticado real (sem service_role)
    const { error: storageError } = await supabase.storage.from('product-images').upload(relativePath, validation.bytes, {
      contentType: validation.mimeType,
      upsert: false
    })

    if (storageError) {
      return NextResponse.json({ success: false, message: 'Falha ao enviar arquivo para o Storage.' }, { status: 500 })
    }

    // 2. Transação via RPC para registrar a imagem e gerar o log atômico
    const { data: rpcResult, error: rpcError } = await supabase.rpc('register_product_image', {
      p_product_id: productId,
      p_url: relativePath,
      p_alt_text: null
    })

    if (rpcError) {
      // 3. Compensação
      const { error: cleanupError } = await supabase.storage.from('product-images').remove([relativePath])
      if (cleanupError) {
        console.error(`COMPENSAÇÃO FALHOU: O arquivo ${relativePath} ficou órfão no Storage. Registrando tarefa persistente...`, cleanupError)
        // Registrar tarefa persistente de limpeza
        await supabase.rpc('register_storage_cleanup_task', {
          p_bucket_id: 'product-images',
          p_object_path: relativePath,
          p_operation: 'delete',
          p_source_table: 'product_images',
          p_source_id: productId,
          p_last_error: cleanupError?.message || rpcError?.message
        })
      }
      return NextResponse.json({ success: false, message: 'Falha ao registrar a imagem no banco de dados. A operação foi cancelada.' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: rpcResult 
    })

  } catch (err: any) {
    return NextResponse.json({ success: false, message: 'Erro interno no processamento do upload.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ success: false, message: 'Method Not Allowed' }, { status: 405 })
}
