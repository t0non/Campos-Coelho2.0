'use client'

import { useState, type FormEvent } from 'react'
import { Save, X } from 'lucide-react'
import { updateCustomerDetails } from '@/lib/actions/admin/customers'

interface CustomerEditFormProps {
  details: any
  onCancel: () => void
  onSaved: () => void
}

const inputClass =
  'min-h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10'

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required = true,
  readOnly = false,
  hint,
}: {
  label: string
  name: string
  defaultValue?: string | null
  type?: string
  required?: boolean
  readOnly?: boolean
  hint?: string
}) {
  return (
    <label className="space-y-1.5 text-sm font-semibold text-neutral-700">
      <span>{label}</span>
      <input
        className={`${inputClass} ${readOnly ? 'cursor-not-allowed bg-neutral-100 text-neutral-500' : ''}`}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ''}
        required={required}
        readOnly={readOnly}
      />
      {hint ? <span className="block text-xs font-normal text-neutral-500">{hint}</span> : null}
    </label>
  )
}

export function CustomerEditForm({ details, onCancel, onSaved }: CustomerEditFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const mainAddress = details.addresses?.find((address: any) => address.is_default) ?? details.addresses?.[0]
  const mainMember = details.members?.find((member: any) => member.is_primary) ?? details.members?.[0]
  const mainContact = mainMember?.profile

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const result = await updateCustomerDetails(details.id, {
      companyName: form.get('companyName'),
      tradeName: form.get('tradeName'),
      cnpj: form.get('cnpj'),
      stateRegistration: form.get('stateRegistration'),
      segment: form.get('segment'),
      phone: form.get('phone'),
      whatsapp: form.get('whatsapp'),
      email: form.get('email'),
      website: form.get('website'),
      contactFullName: form.get('contactFullName'),
      contactPhone: form.get('contactPhone'),
      address: {
        zipCode: form.get('zipCode'),
        street: form.get('street'),
        number: form.get('number'),
        complement: form.get('complement'),
        neighborhood: form.get('neighborhood'),
        city: form.get('city'),
        state: form.get('state'),
      },
    })
    setIsSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    onSaved()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <section className="space-y-3 rounded-lg border bg-white p-4">
        <h3 className="font-extrabold text-neutral-950">Dados da empresa</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Razão social" name="companyName" defaultValue={details.company_name} />
          <Field label="Nome fantasia" name="tradeName" defaultValue={details.trade_name} />
          <Field label="CNPJ" name="cnpj" defaultValue={details.cnpj} />
          <Field label="Inscrição estadual" name="stateRegistration" defaultValue={details.state_registration} required={false} />
          <Field label="Segmento" name="segment" defaultValue={details.segment} required={false} />
          <Field label="E-mail comercial" name="email" type="email" defaultValue={details.email} />
          <Field label="Telefone" name="phone" defaultValue={details.phone} />
          <Field label="WhatsApp" name="whatsapp" defaultValue={details.whatsapp} />
          <div className="sm:col-span-2">
            <Field label="Site" name="website" type="url" defaultValue={details.website} required={false} />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-white p-4">
        <h3 className="font-extrabold text-neutral-950">Responsável principal</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome completo" name="contactFullName" defaultValue={mainContact?.full_name} />
          <Field label="Telefone" name="contactPhone" defaultValue={mainContact?.phone} />
          <div className="sm:col-span-2">
            <Field
              label="E-mail de acesso"
              name="contactEmail"
              type="email"
              defaultValue={mainContact?.email}
              readOnly
              hint="O e-mail de login não é alterado aqui para preservar a conta de autenticação."
            />
          </div>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border bg-white p-4">
        <h3 className="font-extrabold text-neutral-950">Endereço principal</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="CEP" name="zipCode" defaultValue={mainAddress?.zip_code} />
          <Field label="Logradouro" name="street" defaultValue={mainAddress?.street} />
          <Field label="Número" name="number" defaultValue={mainAddress?.number} />
          <Field label="Complemento" name="complement" defaultValue={mainAddress?.complement} required={false} />
          <Field label="Bairro" name="neighborhood" defaultValue={mainAddress?.neighborhood} />
          <Field label="Cidade" name="city" defaultValue={mainAddress?.city} />
          <Field label="UF" name="state" defaultValue={mainAddress?.state} />
        </div>
      </section>

      {error ? <p role="alert" className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-neutral-300 px-4 text-sm font-bold">
          <X className="h-4 w-4" /> Cancelar
        </button>
        <button type="submit" disabled={isSaving} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-bold text-white disabled:opacity-50">
          <Save className="h-4 w-4" /> {isSaving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
