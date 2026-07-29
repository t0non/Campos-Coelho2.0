import 'server-only'
import { z } from 'zod'

export const ConfirmCatalogImportSchema = z.object({
  session_id: z.string().uuid(),
  mode: z.enum(['import_update', 'replace']),
  price_table_id: z.string().uuid().nullable().optional(),
  publish_products: z.boolean(),
})

export const ProcessCatalogBatchSchema = z.object({
  session_id: z.string().uuid(),
  batch_number: z.number().int().min(1).max(1000),
})

export const CatalogSessionSchema = z.object({
  session_id: z.string().uuid(),
})

export const ArchiveCatalogSchema = z.object({
  confirmation_text: z.literal('REMOVER TODOS OS PRODUTOS'),
})
