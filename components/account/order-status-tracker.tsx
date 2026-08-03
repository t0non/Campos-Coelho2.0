import { Check, Clock3, PackageCheck, PackageSearch, Store } from 'lucide-react'
import type { OrderStatus } from '@/lib/orders/status'
import { ORDER_STATUS_LABELS } from '@/lib/orders/status'

const steps: Array<{ status: OrderStatus; icon: typeof Clock3 }> = [
  { status: 'pending', icon: Clock3 },
  { status: 'confirmed', icon: Check },
  { status: 'processing', icon: PackageSearch },
  { status: 'shipped', icon: PackageCheck },
  { status: 'delivered', icon: Store },
]

const statusIndex = (status: OrderStatus) => steps.findIndex((step) => step.status === status)

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  if (status === 'draft' || status === 'cancelled') {
    return (
      <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
        {status === 'cancelled'
          ? 'Este pedido foi cancelado. Fale com a equipe comercial se tiver alguma dúvida.'
          : 'Este pedido ainda está sendo preparado para envio.'}
      </p>
    )
  }

  const currentIndex = statusIndex(status)

  return (
    <ol className="grid gap-3 sm:grid-cols-5" aria-label="Andamento do pedido">
      {steps.map((step, index) => {
        const Icon = step.icon
        const completed = index <= currentIndex
        const current = index === currentIndex

        return (
          <li key={step.status} className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            {index > 0 && (
              <span
                className={`absolute left-4 top-[-12px] h-3 border-l sm:left-[-12px] sm:top-4 sm:h-px sm:w-3 ${
                  index <= currentIndex ? 'border-green-500 bg-green-500' : 'border-neutral-200 bg-neutral-200'
                }`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                completed
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-neutral-200 bg-white text-neutral-400'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className={`text-xs font-bold ${current ? 'text-neutral-950' : 'text-neutral-500'}`}>
              {ORDER_STATUS_LABELS[step.status]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
