export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { getOrderById } from '@/lib/supabase/queries/orders'
import { formatPrice } from '@/lib/utils/format'
import { OrderStatusTracker } from '@/components/account/order-status-tracker'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders/status'

export const metadata: Metadata = { title: 'Detalhes do Pedido' }

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const items = (order.order_items ?? []) as Array<{
    id: string
    quantity: number
    unit_price: number
    total_price: number
    product: { sku: string; name: string } | { sku: string; name: string }[] | null
  }>
  const address = Array.isArray(order.shipping_address)
    ? order.shipping_address[0]
    : order.shipping_address

  return (
    <div className="space-y-6">
      <Link
        href="/minha-conta/pedidos"
        className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar aos pedidos
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">Pedido</p>
          <h1 className="mt-1 text-2xl font-extrabold text-neutral-950">{order.order_number}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Realizado em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'long',
              timeStyle: 'short',
            }).format(new Date(order.created_at))}
          </p>
        </div>
        <span className="w-fit rounded-full bg-black px-4 py-2 text-xs font-bold text-white">
          {ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}
        </span>
      </div>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-extrabold text-neutral-950">Andamento do pedido</h2>
        <p className="mt-1 text-sm text-neutral-500">Acompanhe a preparação até a retirada na loja.</p>
        <div className="mt-5">
          <OrderStatusTracker status={order.status as OrderStatus} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
              <Package className="h-4 w-4" />
              Itens do pedido
            </h2>
          </div>
          <div className="divide-y divide-neutral-100">
            {items.map((item) => {
              const product = Array.isArray(item.product) ? item.product[0] : item.product
              return (
                <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <p className="text-sm font-bold text-neutral-900">
                      {product?.name ?? 'Produto'}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">Ref. {product?.sku ?? '—'}</p>
                  </div>
                  <p className="text-xs text-neutral-600">
                    {item.quantity} × {formatPrice(Number(item.unit_price))}
                  </p>
                  <p className="text-sm font-extrabold text-neutral-950">
                    {formatPrice(Number(item.total_price))}
                  </p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-extrabold text-neutral-950">Resumo</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 text-neutral-600">
                <dt>Subtotal</dt>
                <dd>{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between gap-4 text-neutral-600">
                <dt>Frete</dt>
                <dd>{formatPrice(Number(order.shipping_cost))}</dd>
              </div>
              <div className="flex justify-between gap-4 text-neutral-600">
                <dt>Desconto</dt>
                <dd>- {formatPrice(Number(order.discount))}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3 font-extrabold text-neutral-950">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </section>

          {address && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
                <MapPin className="h-4 w-4" />
                Endereço de entrega
              </h2>
              <address className="mt-3 not-italic text-sm leading-relaxed text-neutral-600">
                {address.street}, {address.number}
                {address.complement ? ` · ${address.complement}` : ''}
                <br />
                {address.neighborhood} · {address.city}/{address.state}
                <br />
                CEP {address.zip_code}
              </address>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
