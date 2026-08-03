'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'

const optionalUuid = z.string().uuid().optional()
const codeSchema = z
  .string()
  .trim()
  .min(2, 'Informe um código.')
  .max(40, 'O código deve ter no máximo 40 caracteres.')
  .regex(/^[A-Za-z0-9_-]+$/, 'Use apenas letras, números, hífen ou sublinhado.')
  .transform((value) => value.toUpperCase())

const shippingMethodSchema = z.object({
  id: optionalUuid,
  name: z.string().trim().min(2, 'Informe o nome da entrega.').max(80),
  code: codeSchema,
  description: z.string().trim().max(240).optional(),
  estimatedDays: z.coerce.number().int().min(0).max(365).nullable(),
  isActive: z.boolean(),
})

const paymentTermSchema = z.object({
  id: optionalUuid,
  name: z.string().trim().min(2, 'Informe o nome da condição.').max(80),
  code: codeSchema,
  daysToPay: z.coerce.number().int().min(0).max(3650),
  installments: z.coerce.number().int().min(1).max(120),
  minOrderValue: z.coerce.number().min(0).max(100_000_000),
  isActive: z.boolean(),
})

type ActionResult = { success: true } | { success: false; message: string }

function databaseMessage(message: string, entity: string) {
  if (message.includes('duplicate key')) {
    return `Já existe ${entity} com esse código.`
  }
  if (message.includes('foreign key')) {
    return `${entity} já está em uso. Desative-a em vez de excluir.`
  }
  return `Não foi possível salvar ${entity}.`
}

export async function saveShippingMethodAction(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = shippingMethodSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { id, name, code, description, estimatedDays, isActive } = parsed.data
  const values = {
    name,
    code,
    description: description || null,
    estimated_days: estimatedDays,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  }
  const supabase = createAdminClient()
  const result = id
    ? await supabase.from('shipping_methods').update(values).eq('id', id).select('id').single()
    : await supabase.from('shipping_methods').insert(values).select('id').single()

  if (result.error) {
    return { success: false, message: databaseMessage(result.error.message, 'uma forma de entrega') }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}

export async function deleteShippingMethodAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) return { success: false, message: 'Forma de entrega inválida.' }

  const { error } = await createAdminClient()
    .from('shipping_methods')
    .delete()
    .eq('id', parsedId.data)

  if (error) {
    return { success: false, message: databaseMessage(error.message, 'A forma de entrega') }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}

export async function savePaymentTermAction(input: unknown): Promise<ActionResult> {
  await requireAdmin()
  const parsed = paymentTermSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const { id, name, code, daysToPay, installments, minOrderValue, isActive } = parsed.data
  const values = {
    name,
    code,
    days_to_pay: daysToPay,
    installments,
    min_order_value: minOrderValue,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  }
  const supabase = createAdminClient()
  const result = id
    ? await supabase.from('payment_terms').update(values).eq('id', id).select('id').single()
    : await supabase.from('payment_terms').insert(values).select('id').single()

  if (result.error) {
    return { success: false, message: databaseMessage(result.error.message, 'uma condição de pagamento') }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}

export async function deletePaymentTermAction(id: string): Promise<ActionResult> {
  await requireAdmin()
  const parsedId = z.string().uuid().safeParse(id)
  if (!parsedId.success) return { success: false, message: 'Condição de pagamento inválida.' }

  const { error } = await createAdminClient()
    .from('payment_terms')
    .delete()
    .eq('id', parsedId.data)

  if (error) {
    return { success: false, message: databaseMessage(error.message, 'A condição de pagamento') }
  }

  revalidatePath('/admin/configuracoes')
  revalidatePath('/checkout')
  return { success: true }
}
