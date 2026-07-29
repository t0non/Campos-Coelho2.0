'use client'

import { useState, useTransition } from 'react'
import { updateOrderStatusAction } from '@/app/actions/orders'
import type { Database } from '@/types/database.types'
import { ORDER_STATUS_TRANSITIONS } from '@/lib/orders/status'

type OrderStatus = Database['public']['Enums']['order_status']

const options: { value: OrderStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Em separação' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: OrderStatus
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus)
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  return (
    <div className="min-w-[150px]">
      <label htmlFor={`status-${orderId}`} className="sr-only">
        Status do pedido
      </label>
      <select
        id={`status-${orderId}`}
        value={status}
        disabled={isPending}
        onChange={(event) => {
          const previousStatus = status
          const nextStatus = event.target.value as OrderStatus
          setStatus(nextStatus)
          setMessage('')
          startTransition(async () => {
            const result = await updateOrderStatusAction(orderId, nextStatus)
            setMessage(result.message)
            if (!result.success) setStatus(previousStatus)
          })
        }}
        className="h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-xs font-semibold text-neutral-800 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 disabled:cursor-wait disabled:opacity-60"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={
              option.value !== status &&
              !ORDER_STATUS_TRANSITIONS[status].includes(option.value)
            }
          >
            {option.label}
          </option>
        ))}
      </select>
      {message && (
        <p className="mt-1 max-w-[180px] text-[10px] leading-tight text-neutral-500">
          {message}
        </p>
      )}
    </div>
  )
}
