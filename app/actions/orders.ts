'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { createAuditLog } from '@/lib/utils/audit'
import type { Database } from '@/types/database.types'
import { canTransitionOrderStatus } from '@/lib/orders/status'

type OrderStatus = Database['public']['Enums']['order_status']

const orderStatusSchema = z.enum([
  'draft',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
])

export interface OrderStatusActionResult {
  success: boolean
  message: string
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
): Promise<OrderStatusActionResult> {
  const ctx = await requireAdmin()
  const parsedId = z.string().uuid().safeParse(orderId)
  const parsedStatus = orderStatusSchema.safeParse(status)

  if (!parsedId.success || !parsedStatus.success) {
    return { success: false, message: 'Pedido ou status inválido.' }
  }

  const supabase = createAdminClient()
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, status')
    .eq('id', parsedId.data)
    .single()

  if (orderError || !order) {
    return { success: false, message: 'Pedido não encontrado.' }
  }

  if (order.status === parsedStatus.data) {
    return { success: true, message: 'O pedido já está com esse status.' }
  }

  const nextStatus = parsedStatus.data as OrderStatus
  if (!canTransitionOrderStatus(order.status as OrderStatus, nextStatus)) {
    return {
      success: false,
      message: 'Essa mudança de status não é permitida para a etapa atual.',
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', order.id)

  if (updateError) {
    return { success: false, message: 'Não foi possível atualizar o pedido.' }
  }

  const { error: historyError } = await supabase.from('order_status_history').insert({
    order_id: order.id,
    status: nextStatus,
    created_by: ctx.user!.id,
    notes: `Status alterado de ${order.status} para ${nextStatus} pelo painel administrativo.`,
  })

  if (historyError) {
    console.error('Falha ao registrar histórico do pedido:', historyError.message)
    const { error: rollbackError } = await supabase
      .from('orders')
      .update({ status: order.status, updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .eq('status', nextStatus)
    if (rollbackError) {
      console.error('Falha crítica ao reverter status sem histórico:', rollbackError.message)
    }
    return {
      success: false,
      message: 'A atualização foi cancelada porque o histórico não pôde ser registrado.',
    }
  }

  await createAuditLog('ORDER_STATUS_UPDATED', 'orders', order.id, {
    order_number: order.order_number,
    previous_status: order.status,
    next_status: nextStatus,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${order.id}`)
  return { success: true, message: 'Status atualizado.' }
}
