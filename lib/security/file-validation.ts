import 'server-only'

export type SupportedFileKind = 'pdf' | 'jpeg' | 'png' | 'webp'

const MIME_BY_KIND: Record<SupportedFileKind, string> = {
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

const EXTENSION_BY_KIND: Record<SupportedFileKind, string> = {
  pdf: 'pdf',
  jpeg: 'jpg',
  png: 'png',
  webp: 'webp',
}

function detectFileKind(bytes: Uint8Array): SupportedFileKind | null {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return 'pdf'
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return 'jpeg'
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png'
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return 'webp'
  }
  return null
}

export async function validateUploadedFile(
  file: File,
  options: {
    allowedKinds: SupportedFileKind[]
    maxBytes: number
  },
) {
  if (file.size === 0) {
    return { success: false as const, error: 'O arquivo enviado está vazio.' }
  }
  if (file.size > options.maxBytes) {
    return {
      success: false as const,
      error: `O arquivo deve ter no máximo ${Math.floor(options.maxBytes / 1024 / 1024)} MB.`,
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = detectFileKind(bytes)
  if (!kind || !options.allowedKinds.includes(kind)) {
    return { success: false as const, error: 'O conteúdo do arquivo não corresponde a um formato permitido.' }
  }
  if (file.type && file.type !== MIME_BY_KIND[kind]) {
    return { success: false as const, error: 'O tipo informado pelo arquivo não corresponde ao seu conteúdo.' }
  }

  return {
    success: true as const,
    bytes,
    kind,
    mimeType: MIME_BY_KIND[kind],
    extension: EXTENSION_BY_KIND[kind],
  }
}

export function safeOriginalFilename(filename: string) {
  const normalized = filename
    .normalize('NFKC')
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[\\/]/g, '-')
    .trim()
  return (normalized || 'arquivo').slice(0, 180)
}
