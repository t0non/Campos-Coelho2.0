'use client'

import { type FormEvent, useState, useTransition } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { submitPrivacyRequest } from '@/app/actions/privacy'
import { maskCNPJ } from '@/lib/utils/masks'

const requestOptions = [
  ['confirmation_access', 'Confirmar tratamento ou acessar meus dados'],
  ['correction', 'Corrigir ou atualizar dados'],
  ['deletion_anonymization', 'Eliminar, bloquear ou anonimizar dados'],
  ['portability', 'Solicitar portabilidade'],
  ['consent_revocation', 'Revogar consentimento de marketing'],
  ['processing_information', 'Entender uso e compartilhamento'],
  ['automated_decision_review', 'Pedir revis\u00e3o de decis\u00e3o automatizada'],
  ['other', 'Outro assunto de privacidade'],
] as const

const relationshipOptions = [
  ['customer', 'Cliente atual'],
  ['representative', 'Representante de empresa'],
  ['lead', 'Interessado ou inscrito em novidades'],
  ['former_customer', 'Ex-cliente'],
  ['other', 'Outro'],
] as const

export function PrivacyRequestForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [protocol, setProtocol] = useState('')
  const [cnpj, setCnpj] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await submitPrivacyRequest({
        requestType: String(form.get('requestType')) as (typeof requestOptions)[number][0],
        requesterName: String(form.get('requesterName')),
        requesterEmail: String(form.get('requesterEmail')),
        companyCnpj: String(form.get('companyCnpj')),
        relationship: String(form.get('relationship')) as (typeof relationshipOptions)[number][0],
        message: String(form.get('message')),
        website: String(form.get('website')),
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setProtocol(result.protocol)
    })
  }

  if (protocol) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        <h2 className="mt-4 text-lg font-extrabold">Solicita&ccedil;&atilde;o registrada</h2>
        <p className="mt-2 text-sm leading-6">
          Guarde o protocolo <strong>{protocol}</strong>. Podemos confirmar sua identidade antes de entregar,
          corrigir ou excluir dados, para evitar acesso indevido.
        </p>
      </div>
    )
  }

  const fieldClass =
    'mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-xs font-semibold text-slate-700">
          Nome completo <span className="text-red-500">*</span>
          <input name="requesterName" required minLength={3} maxLength={120} autoComplete="name" className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          E-mail para retorno <span className="text-red-500">*</span>
          <input name="requesterEmail" required type="email" maxLength={254} autoComplete="email" className={fieldClass} />
        </label>
        <label className="text-xs font-semibold text-slate-700">
          Sua rela&ccedil;&atilde;o com a empresa <span className="text-red-500">*</span>
          <select name="relationship" required defaultValue="" className={fieldClass}>
            <option value="" disabled>Selecione</option>
            {relationshipOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-700">
          CNPJ relacionado (opcional)
          <input
            name="companyCnpj"
            inputMode="numeric"
            value={cnpj}
            onChange={(event) => setCnpj(maskCNPJ(event.target.value))}
            maxLength={18}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="block text-xs font-semibold text-slate-700">
        O que voc&ecirc; deseja? <span className="text-red-500">*</span>
        <select name="requestType" required defaultValue="" className={fieldClass}>
          <option value="" disabled>Selecione</option>
          {requestOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>

      <label className="block text-xs font-semibold text-slate-700">
        Explique a solicita&ccedil;&atilde;o <span className="text-red-500">*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className={`${fieldClass} h-auto min-h-32 py-3`}
          placeholder="Informe apenas o necess\u00e1rio para localizarmos seus dados. N\u00e3o envie senha nem documento por este campo."
        />
      </label>

      <label className="hidden" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <p className="text-xs leading-5 text-slate-500">
        Usaremos os dados acima somente para localizar registros, validar sua identidade e responder ao pedido.
      </p>
      {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-60 sm:w-auto"
      >
        {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando</> : 'Registrar solicita\u00e7\u00e3o'}
      </button>
    </form>
  )
}
