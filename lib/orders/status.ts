import type { Database } from '@/types/database.types'

export type OrderStatus = Database['public']['Enums']['order_status']

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  return from === to || ORDER_STATUS_TRANSITIONS[from].includes(to)
}
