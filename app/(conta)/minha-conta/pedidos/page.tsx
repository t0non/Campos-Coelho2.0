export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, PackageSearch } from 'lucide-react'
import { getMyOrders } from '@/lib/supabase/queries/orders'
import { formatPrice } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Meus Pedidos' }

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default async function PedidosPage() {
  const orders = await getMyOrders()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-950">Meus pedidos</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Acompanhe o andamento e consulte os detalhes das suas compras.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
          <PackageSearch className="mx-auto h-9 w-9 text-neutral-300" />
          <p className="mt-3 text-sm font-bold text-neutral-800">Você ainda não fez nenhum pedido.</p>
          <Link
            href="/catalogo"
            className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-sm font-bold text-white hover:bg-neutral-800"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="divide-y divide-neutral-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/minha-conta/pedidos/${order.id}`}
                className="group grid gap-4 px-5 py-5 transition hover:bg-neutral-50 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-extrabold text-neutral-950">{order.order_number}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
                      new Date(order.created_at),
                    )}
                  </p>
                </div>
                <span className="w-fit rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-bold text-neutral-700">
                  {statusLabels[order.status] ?? order.status}
                </span>
                <div>
                  <p className="text-xs text-neutral-500">{order.item_count} item(ns)</p>
                  <p className="text-sm font-extrabold text-neutral-950">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
                <ArrowRight className="hidden h-4 w-4 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-black sm:block" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
