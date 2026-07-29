export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ShoppingBag } from 'lucide-react'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { formatPrice } from '@/lib/utils/format'
import type { Database } from '@/types/database.types'

type OrderStatus = Database['public']['Enums']['order_status']

export const metadata: Metadata = { title: 'Admin — Pedidos' }

const statusOptions: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Em separação' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  await requireAdmin()
  const params = await searchParams
  const queryText = params.q?.trim() ?? ''
  const status = statusOptions.some((option) => option.value === params.status)
    ? params.status ?? ''
    : ''

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      total,
      created_at,
      company:companies!orders_company_id_fkey(company_name, trade_name),
      order_items(id)
      `,
    )
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('status', status as OrderStatus)
  if (queryText) query = query.ilike('order_number', `%${queryText}%`)

  const { data: orders, error } = await query

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
          Operação comercial
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
          Pedidos
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Consulte pedidos e atualize cada etapa do atendimento.
        </p>
      </div>

      <form className="grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative">
          <span className="sr-only">Buscar número do pedido</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            name="q"
            defaultValue={queryText}
            placeholder="Buscar por número do pedido"
            className="h-11 w-full rounded-xl border border-neutral-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
          />
        </label>
        <select
          name="status"
          defaultValue={status}
          className="h-11 rounded-xl border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="h-11 rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-neutral-800">
          Filtrar
        </button>
      </form>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          Não foi possível carregar os pedidos.
        </div>
      ) : !orders?.length ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingBag className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-3 text-sm font-semibold text-neutral-700">Nenhum pedido encontrado.</p>
          <p className="mt-1 text-xs text-neutral-500">Ajuste os filtros para tentar novamente.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[1fr_1.4fr_100px_120px_180px] gap-4 border-b border-neutral-200 bg-neutral-50 px-5 py-3 text-[11px] font-extrabold uppercase tracking-wide text-neutral-500 lg:grid">
            <span>Pedido</span>
            <span>Empresa</span>
            <span>Itens</span>
            <span>Total</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-neutral-100">
            {orders.map((order) => {
              const company = Array.isArray(order.company) ? order.company[0] : order.company
              const companyName = company?.trade_name || company?.company_name || 'Empresa não identificada'
              return (
                <article
                  key={order.id}
                  className="grid gap-4 px-5 py-5 lg:grid-cols-[1fr_1.4fr_100px_120px_180px] lg:items-center"
                >
                  <div>
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-sm font-extrabold text-neutral-950 underline-offset-4 hover:underline"
                    >
                      {order.order_number}
                    </Link>
                    <time className="mt-1 block text-xs text-neutral-500">
                      {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(order.created_at))}
                    </time>
                  </div>
                  <p className="truncate text-sm font-medium text-neutral-700">{companyName}</p>
                  <p className="text-sm text-neutral-600">
                    <span className="font-bold lg:hidden">Itens: </span>
                    {order.order_items?.length ?? 0}
                  </p>
                  <p className="text-sm font-extrabold text-neutral-950">
                    {formatPrice(Number(order.total))}
                  </p>
                  <OrderStatusSelect
                    orderId={order.id}
                    currentStatus={order.status as OrderStatus}
                  />
                </article>
              )
            })}
          </div>
        </div>
      )}

      {(queryText || status) && (
        <Link href="/admin/pedidos" className="inline-flex text-xs font-bold text-neutral-600 hover:text-black">
          Limpar filtros
        </Link>
      )}
    </div>
  )
}
