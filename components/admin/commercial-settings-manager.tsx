'use client'

import { useState, useTransition } from 'react'
import { CirclePlus, Pencil, Trash2, X } from 'lucide-react'
import {
  deletePaymentTermAction,
  deleteShippingMethodAction,
  savePaymentTermAction,
  saveShippingMethodAction,
} from '@/lib/actions/admin/commercial-settings'

type ShippingMethod = {
  id: string
  name: string
  code: string
  description: string | null
  estimated_days: number | null
  is_active: boolean
}

type PaymentTerm = {
  id: string
  name: string
  code: string
  days_to_pay: number
  installments: number
  min_order_value: number
  is_active: boolean
}

const inputClass =
  'h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/10'

function Feedback({ message, success }: { message: string; success: boolean }) {
  if (!message) return null
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-xs font-semibold ${
        success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {message}
    </p>
  )
}

export function CommercialSettingsManager({
  shippingMethods,
  paymentTerms,
}: {
  shippingMethods: ShippingMethod[]
  paymentTerms: PaymentTerm[]
}) {
  const [shippingDraft, setShippingDraft] = useState<ShippingMethod | null>(null)
  const [paymentDraft, setPaymentDraft] = useState<PaymentTerm | null>(null)
  const [feedback, setFeedback] = useState({ message: '', success: false })
  const [isPending, startTransition] = useTransition()

  function resetFeedback() {
    setFeedback({ message: '', success: false })
  }

  function remove(kind: 'shipping' | 'payment', id: string) {
    if (!window.confirm('Deseja realmente excluir este item?')) return
    resetFeedback()
    startTransition(async () => {
      const result =
        kind === 'shipping'
          ? await deleteShippingMethodAction(id)
          : await deletePaymentTermAction(id)
      setFeedback({
        success: result.success,
        message: result.success ? 'Item excluído com sucesso.' : result.message,
      })
    })
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-neutral-950">Métodos de entrega</h2>
            <p className="mt-1 text-xs text-neutral-500">Opções exibidas na finalização do pedido.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setShippingDraft({
                id: '',
                name: '',
                code: '',
                description: '',
                estimated_days: 5,
                is_active: true,
              })
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-black px-3 text-xs font-bold text-white hover:bg-neutral-800"
          >
            <CirclePlus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        <div className="mt-5 divide-y divide-neutral-100">
          {shippingMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-neutral-900">{method.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      method.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {method.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {method.code} ·{' '}
                  {method.estimated_days === null
                    ? 'prazo sob consulta'
                    : `até ${method.estimated_days} dias`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setShippingDraft(method)}
                  aria-label={`Editar ${method.name}`}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove('shipping', method.id)}
                  aria-label={`Excluir ${method.name}`}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!shippingMethods.length && (
            <p className="py-8 text-center text-sm text-neutral-500">
              Nenhuma forma de entrega cadastrada.
            </p>
          )}
        </div>

        {shippingDraft && (
          <form
            className="mt-5 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              resetFeedback()
              const formData = new FormData(event.currentTarget)
              startTransition(async () => {
                const result = await saveShippingMethodAction({
                  id: shippingDraft.id || undefined,
                  name: formData.get('name'),
                  code: formData.get('code'),
                  description: formData.get('description'),
                  estimatedDays:
                    formData.get('estimatedDays') === ''
                      ? null
                      : formData.get('estimatedDays'),
                  isActive: formData.get('isActive') === 'on',
                })
                setFeedback({
                  success: result.success,
                  message: result.success ? 'Forma de entrega salva.' : result.message,
                })
                if (result.success) setShippingDraft(null)
              })
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-neutral-900">
                {shippingDraft.id ? 'Editar entrega' : 'Nova entrega'}
              </p>
              <button type="button" onClick={() => setShippingDraft(null)} aria-label="Fechar">
                <X className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                defaultValue={shippingDraft.name}
                placeholder="Nome"
                required
                maxLength={80}
                className={inputClass}
              />
              <input
                name="code"
                defaultValue={shippingDraft.code}
                placeholder="Código"
                required
                maxLength={40}
                className={inputClass}
              />
            </div>
            <input
              name="description"
              defaultValue={shippingDraft.description ?? ''}
              placeholder="Descrição (opcional)"
              maxLength={240}
              className={inputClass}
            />
            <div className="flex items-center justify-between gap-3">
              <input
                name="estimatedDays"
                defaultValue={shippingDraft.estimated_days ?? ''}
                type="number"
                min={0}
                max={365}
                placeholder="Prazo em dias"
                className={`${inputClass} max-w-[160px]`}
              />
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input name="isActive" type="checkbox" defaultChecked={shippingDraft.is_active} />
                Ativo
              </label>
              <button
                disabled={isPending}
                className="h-10 rounded-lg bg-black px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-neutral-950">Condições de pagamento</h2>
            <p className="mt-1 text-xs text-neutral-500">Prazos disponíveis para clientes aprovados.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setPaymentDraft({
                id: '',
                name: '',
                code: '',
                days_to_pay: 0,
                installments: 1,
                min_order_value: 0,
                is_active: true,
              })
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-black px-3 text-xs font-bold text-white hover:bg-neutral-800"
          >
            <CirclePlus className="h-4 w-4" />
            Adicionar
          </button>
        </div>

        <div className="mt-5 divide-y divide-neutral-100">
          {paymentTerms.map((term) => (
            <div key={term.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-bold text-neutral-900">{term.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      term.is_active
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {term.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {term.code} · {term.installments}x · {term.days_to_pay} dias
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentDraft(term)}
                  aria-label={`Editar ${term.name}`}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-black"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove('payment', term.id)}
                  aria-label={`Excluir ${term.name}`}
                  className="rounded-lg p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!paymentTerms.length && (
            <p className="py-8 text-center text-sm text-neutral-500">
              Nenhuma condição de pagamento cadastrada.
            </p>
          )}
        </div>

        {paymentDraft && (
          <form
            className="mt-5 space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            onSubmit={(event) => {
              event.preventDefault()
              resetFeedback()
              const formData = new FormData(event.currentTarget)
              startTransition(async () => {
                const result = await savePaymentTermAction({
                  id: paymentDraft.id || undefined,
                  name: formData.get('name'),
                  code: formData.get('code'),
                  daysToPay: formData.get('daysToPay'),
                  installments: formData.get('installments'),
                  minOrderValue: formData.get('minOrderValue'),
                  isActive: formData.get('isActive') === 'on',
                })
                setFeedback({
                  success: result.success,
                  message: result.success ? 'Condição de pagamento salva.' : result.message,
                })
                if (result.success) setPaymentDraft(null)
              })
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-extrabold text-neutral-900">
                {paymentDraft.id ? 'Editar condição' : 'Nova condição'}
              </p>
              <button type="button" onClick={() => setPaymentDraft(null)} aria-label="Fechar">
                <X className="h-4 w-4 text-neutral-500" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="name"
                defaultValue={paymentDraft.name}
                placeholder="Nome"
                required
                maxLength={80}
                className={inputClass}
              />
              <input
                name="code"
                defaultValue={paymentDraft.code}
                placeholder="Código"
                required
                maxLength={40}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="space-y-1 text-[11px] font-semibold text-neutral-600">
                Prazo (dias)
                <input
                  name="daysToPay"
                  defaultValue={paymentDraft.days_to_pay}
                  type="number"
                  min={0}
                  max={3650}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-[11px] font-semibold text-neutral-600">
                Parcelas
                <input
                  name="installments"
                  defaultValue={paymentDraft.installments}
                  type="number"
                  min={1}
                  max={120}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1 text-[11px] font-semibold text-neutral-600">
                Pedido mínimo
                <input
                  name="minOrderValue"
                  defaultValue={paymentDraft.min_order_value}
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                />
              </label>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                <input name="isActive" type="checkbox" defaultChecked={paymentDraft.is_active} />
                Ativo
              </label>
              <button
                disabled={isPending}
                className="h-10 rounded-lg bg-black px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        )}
      </section>

      <div className="lg:col-span-2">
        <Feedback message={feedback.message} success={feedback.success} />
      </div>
    </div>
  )
}
