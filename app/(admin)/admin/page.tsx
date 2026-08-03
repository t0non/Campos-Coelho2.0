export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Image,
  Package,
  ReceiptText,
  Users,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'
import { formatPrice } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Dashboard Admin' }

const statusLabels: Record<string, string> = {
  draft: 'Rascunho',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  processing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export default async function AdminDashboardPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [
    productsResult,
    pendingCustomersResult,
    openOrdersResult,
    bannersResult,
    recentOrdersResult,
  ] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'processing', 'shipped']),
    supabase.from('banners').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        status,
        total,
        created_at,
        company:companies!orders_company_id_fkey(company_name)
        `,
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const metrics = [
    {
      label: 'Produtos ativos',
      value: productsResult.count ?? 0,
      icon: Package,
      href: '/admin/produtos',
    },
    {
      label: 'Cadastros pendentes',
      value: pendingCustomersResult.count ?? 0,
      icon: Users,
      href: '/admin/clientes',
    },
    {
      label: 'Pedidos em andamento',
      value: openOrdersResult.count ?? 0,
      icon: ReceiptText,
      href: '/admin/pedidos',
    },
    {
      label: 'Banners ativos',
      value: bannersResult.count ?? 0,
      icon: Image,
      href: '/admin/banners',
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
          Visão geral
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
          Dashboard administrativo
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Acompanhe o catálogo, os clientes e os pedidos em um só lugar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-neutral-300 transition-transform group-hover:translate-x-1 group-hover:text-black" />
            </div>
            <p className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-950">{value}</p>
            <p className="mt-1 text-sm font-medium text-neutral-500">{label}</p>
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-neutral-950">Pedidos recentes</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Últimas movimentações comerciais</p>
          </div>
          <Link href="/admin/pedidos" className="text-xs font-bold text-neutral-700 hover:text-black">
            Ver todos
          </Link>
        </div>

        {(recentOrdersResult.data ?? []).length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-neutral-500">
            Nenhum pedido registrado até o momento.
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {(recentOrdersResult.data ?? []).map((order) => {
              const company = Array.isArray(order.company) ? order.company[0] : order.company
              return (
                <div
                  key={order.id}
                  className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:px-6"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-950">{order.order_number}</p>
                    <p className="truncate text-xs text-neutral-500">
                      {company?.company_name ?? 'Empresa não identificada'}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-bold text-neutral-700">
                    {statusLabels[order.status] ?? order.status}
                  </span>
                  <p className="text-sm font-extrabold text-neutral-950">
                    {formatPrice(Number(order.total))}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
