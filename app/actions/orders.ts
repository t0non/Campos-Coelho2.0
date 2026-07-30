'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import type { Database } from '@/types/database.types'
import { canTransitionOrderStatus } from '@/lib/orders/status'
import { notifyOrderStatusChanged } from '@/lib/email/events'

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

  const { data: transition, error: transitionError } = await (supabase.rpc as any)(
    'admin_transition_order_status',
    {
      p_order_id: order.id,
      p_next_status: nextStatus,
      p_actor_id: ctx.user!.id,
    },
  )

  if (transitionError || !transition?.success) {
    console.error('Falha na transição atômica do pedido:', transitionError?.message ?? transition?.code)
    return {
      success: false,
      message:
        transition?.code === 'INVALID_TRANSITION'
          ? 'Essa mudança de status não é permitida para a etapa atual.'
          : 'Não foi possível atualizar o pedido e o estoque com segurança.',
    }
  }

  await notifyOrderStatusChanged(order.id)
  revalidatePath('/admin')
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${order.id}`)
  return { success: true, message: 'Status atualizado.' }
}
