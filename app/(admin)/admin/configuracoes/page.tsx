export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, CircleAlert, CreditCard, Database, ShieldCheck, Truck } from 'lucide-react'
import { CommercialSettingsManager } from '@/components/admin/commercial-settings-manager'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/supabase/auth'

export const metadata: Metadata = { title: 'Admin — Configurações' }

export default async function AdminConfiguracoesPage() {
  await requireAdmin()
  const supabase = createAdminClient()

  const [priceTableResult, shippingResult, paymentResult] = await Promise.all([
    supabase
      .from('price_tables')
      .select('id, name, is_active, is_default')
      .eq('is_active', true)
      .order('is_default', { ascending: false }),
    supabase
      .from('shipping_methods')
      .select('id, name, code, description, estimated_days, is_active')
      .order('name'),
    supabase
      .from('payment_terms')
      .select('id, name, code, days_to_pay, installments, min_order_value, is_active')
      .order('days_to_pay'),
  ])

  const defaultTable = priceTableResult.data?.find((table) => table.is_default)
  const environmentReady = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY,
  )
  const privacyIdentityReady = Boolean(
    process.env.NEXT_PUBLIC_CONTROLLER_LEGAL_NAME &&
      process.env.NEXT_PUBLIC_CONTROLLER_CNPJ &&
      process.env.NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL &&
      process.env.CRON_SECRET,
  )

  const statusCards = [
    {
      title: 'Governanca LGPD',
      value: privacyIdentityReady ? 'Configurada' : 'Dados pendentes',
      description: privacyIdentityReady
        ? 'Controlador, canal de privacidade e rotina de retencao estao configurados.'
        : 'Preencha razao social, CNPJ, e-mail de privacidade e segredo da rotina de retencao.',
      icon: ShieldCheck,
      ready: privacyIdentityReady,
    },
    {
      title: 'Banco de dados',
      value: environmentReady ? 'Conectado' : 'Configuração incompleta',
      description: environmentReady
        ? 'As variáveis essenciais do servidor estão configuradas.'
        : 'Revise as variáveis de ambiente antes de publicar.',
      icon: Database,
      ready: environmentReady,
    },
    {
      title: 'Tabela padrão',
      value: defaultTable?.name ?? 'Não definida',
      description: `${priceTableResult.data?.length ?? 0} tabela(s) de preço ativa(s).`,
      icon: CreditCard,
      ready: Boolean(defaultTable),
    },
    {
      title: 'Formas de entrega',
      value: `${shippingResult.data?.filter((method) => method.is_active).length ?? 0} ativa(s)`,
      description: 'Opções disponíveis durante a finalização do pedido.',
      icon: Truck,
      ready: Boolean(shippingResult.data?.length),
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
          Saúde da operação
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-neutral-950 sm:text-3xl">
          Configurações
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Visão segura das configurações comerciais ativas. Nenhuma chave sensível é exibida.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statusCards.map(({ title, value, description, icon: Icon, ready }) => (
          <article key={title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
                <Icon className="h-5 w-5" />
              </span>
              {ready ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <CircleAlert className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-neutral-400">{title}</p>
            <p className="mt-1 text-lg font-extrabold text-neutral-950">{value}</p>
            <p className="mt-2 text-xs leading-relaxed text-neutral-500">{description}</p>
          </article>
        ))}
      </div>

      <CommercialSettingsManager
        shippingMethods={shippingResult.data ?? []}
        paymentTerms={paymentResult.data ?? []}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/tabelas-de-precos"
          className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-bold text-neutral-900 shadow-sm transition hover:border-neutral-400"
        >
          Gerenciar tabelas de preços
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="/admin/produtos/importar"
          className="group flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 text-sm font-bold text-neutral-900 shadow-sm transition hover:border-neutral-400"
        >
          Importar catálogo
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}
