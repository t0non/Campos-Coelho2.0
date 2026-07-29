export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CreditCard,
  MapPin,
  Package,
  Truck,
  UserRound,
} from 'lucide-react'
import { OrderStatusSelect } from '@/components/admin/order-status-select'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { formatPrice } from '@/lib/utils/format'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders/status'
import { z } from 'zod'

export const metadata: Metadata = { title: 'Detalhes do pedido | Admin' }

type OrderItemView = {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  product:
    | { id: string; name: string; sku: string }
    | { id: string; name: string; sku: string }[]
    | null
  variant:
    | { id: string; name: string; sku: string }
    | { id: string; name: string; sku: string }[]
    | null
}

function related<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  if (!z.string().uuid().safeParse(id).success) notFound()

  const supabase = createAdminClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      company:companies!orders_company_id_fkey(id, company_name, trade_name, cnpj, email, phone),
      customer:profiles!orders_profile_id_fkey(full_name, email, phone),
      seller:profiles!orders_seller_id_fkey(full_name, email),
      shipping_address:addresses!orders_shipping_address_id_fkey(street, number, complement, neighborhood, city, state, zip_code),
      shipping_method:shipping_methods!orders_shipping_method_id_fkey(name, code, estimated_days),
      payment_term:payment_terms!orders_payment_term_id_fkey(name, code, days_to_pay, installments),
      order_items(
        id,
        quantity,
        unit_price,
        total_price,
        product:products!order_items_product_id_fkey(id, name, sku),
        variant:product_variants!order_items_variant_id_fkey(id, name, sku)
      ),
      order_status_history(
        id,
        status,
        notes,
        created_at,
        author:profiles!order_status_history_created_by_fkey(full_name)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !order) notFound()

  const company = related(order.company)
  const customer = related(order.customer)
  const seller = related(order.seller)
  const address = related(order.shipping_address)
  const shippingMethod = related(order.shipping_method)
  const paymentTerm = related(order.payment_term)
  const history = [...(order.order_status_history ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <Link
            href="/admin/pedidos"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos pedidos
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
            Pedido
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
            {order.order_number}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Criado em{' '}
            {new Intl.DateTimeFormat('pt-BR', {
              dateStyle: 'long',
              timeStyle: 'short',
            }).format(new Date(order.created_at))}
          </p>
        </div>
        <div className="w-full rounded-xl border border-neutral-200 bg-white p-3 shadow-sm sm:w-[230px]">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-neutral-400">
            Etapa atual
          </p>
          <OrderStatusSelect orderId={order.id} currentStatus={order.status as OrderStatus} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-200 px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-950">
                <Package className="h-5 w-5" />
                Itens do pedido
              </h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {(order.order_items as OrderItemView[]).map((item) => {
                const product = related(item.product)
                const variant = related(item.variant)
                return (
                  <div
                    key={item.id}
                    className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_80px_120px_120px] sm:items-center"
                  >
                    <div>
                      <p className="text-sm font-bold text-neutral-900">
                        {product?.name ?? 'Produto removido'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        SKU {variant?.sku ?? product?.sku ?? '—'}
                        {variant?.name ? ` · ${variant.name}` : ''}
                      </p>
                    </div>
                    <p className="text-sm text-neutral-600">
                      <span className="font-bold sm:hidden">Quantidade: </span>
                      {item.quantity}
                    </p>
                    <p className="text-sm text-neutral-600">{formatPrice(Number(item.unit_price))}</p>
                    <p className="text-sm font-extrabold text-neutral-950">
                      {formatPrice(Number(item.total_price))}
                    </p>
                  </div>
                )
              })}
            </div>
            <dl className="ml-auto w-full max-w-sm space-y-2 border-t border-neutral-200 bg-neutral-50 px-5 py-5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <dt>Subtotal</dt>
                <dd>{formatPrice(Number(order.subtotal))}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>Desconto</dt>
                <dd>- {formatPrice(Number(order.discount))}</dd>
              </div>
              <div className="flex justify-between text-neutral-600">
                <dt>Frete</dt>
                <dd>{formatPrice(Number(order.shipping_cost))}</dd>
              </div>
              <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-extrabold text-neutral-950">
                <dt>Total</dt>
                <dd>{formatPrice(Number(order.total))}</dd>
              </div>
            </dl>
          </section>

          {order.notes && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-extrabold text-neutral-950">Observações do pedido</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600">
                {order.notes}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-extrabold text-neutral-950">
              <CalendarDays className="h-5 w-5" />
              Histórico
            </h2>
            <div className="mt-4 space-y-4">
              {history.map((entry) => {
                const author = related(entry.author)
                return (
                  <div key={entry.id} className="relative border-l-2 border-neutral-200 pl-4">
                    <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-black" />
                    <p className="text-sm font-bold text-neutral-900">
                      {ORDER_STATUS_LABELS[entry.status as OrderStatus]}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {new Intl.DateTimeFormat('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      }).format(new Date(entry.created_at))}
                      {author?.full_name ? ` · ${author.full_name}` : ''}
                    </p>
                    {entry.notes && <p className="mt-1 text-xs text-neutral-600">{entry.notes}</p>}
                  </div>
                )
              })}
              {!history.length && (
                <p className="text-sm text-neutral-500">Nenhuma movimentação registrada.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
              <Building2 className="h-4 w-4" />
              Empresa
            </h2>
            <p className="mt-3 text-sm font-bold text-neutral-900">
              {company?.trade_name || company?.company_name || 'Não identificada'}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{company?.cnpj ?? 'CNPJ não informado'}</p>
            {company?.id && (
              <Link
                href={`/admin/empresas/${company.id}`}
                className="mt-3 inline-flex text-xs font-bold text-neutral-700 underline-offset-4 hover:underline"
              >
                Ver cadastro completo
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
              <UserRound className="h-4 w-4" />
              Contato
            </h2>
            <p className="mt-3 text-sm font-bold text-neutral-900">
              {customer?.full_name ?? 'Não informado'}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {customer?.email ?? company?.email ?? 'E-mail não informado'}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {customer?.phone ?? company?.phone ?? 'Telefone não informado'}
            </p>
            {seller?.full_name && (
              <p className="mt-3 border-t border-neutral-100 pt-3 text-xs text-neutral-500">
                Vendedor: <strong className="text-neutral-800">{seller.full_name}</strong>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
              <MapPin className="h-4 w-4" />
              Entrega
            </h2>
            <p className="mt-3 text-sm font-bold text-neutral-900">
              {shippingMethod?.name ?? 'Método não informado'}
            </p>
            {address ? (
              <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                {address.street}, {address.number}
                {address.complement ? `, ${address.complement}` : ''}
                <br />
                {address.neighborhood} · {address.city}/{address.state}
                <br />
                CEP {address.zip_code}
              </p>
            ) : (
              <p className="mt-2 text-xs text-neutral-500">Endereço não informado.</p>
            )}
          </section>

          <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-extrabold text-neutral-950">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </h2>
            <p className="mt-3 text-sm font-bold text-neutral-900">
              {paymentTerm?.name ?? 'Condição não informada'}
            </p>
            {paymentTerm && (
              <p className="mt-1 text-xs text-neutral-500">
                {paymentTerm.installments}x · prazo de {paymentTerm.days_to_pay} dias
              </p>
            )}
          </section>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-950 p-5 text-white shadow-sm">
            <Truck className="h-5 w-5" />
            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-neutral-400">
              Situação
            </p>
            <p className="mt-1 text-lg font-extrabold">
              {ORDER_STATUS_LABELS[order.status as OrderStatus]}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
