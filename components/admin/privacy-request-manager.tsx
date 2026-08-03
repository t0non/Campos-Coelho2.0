'use client'

import { useState, useTransition } from 'react'
import { CalendarClock, CheckCircle2, Mail, ShieldAlert } from 'lucide-react'
import { updatePrivacyRequest } from '@/app/actions/privacy'
import type { Database } from '@/types/database.types'

type PrivacyRequest = Database['public']['Tables']['privacy_requests']['Row']

const statusLabels: Record<string, string> = {
  received: 'Recebida',
  identity_check: 'Validando identidade',
  in_progress: 'Em atendimento',
  completed: 'Concluida',
  rejected: 'Negada com justificativa',
}

const typeLabels: Record<string, string> = {
  confirmation_access: 'Confirmacao e acesso',
  correction: 'Correcao',
  deletion_anonymization: 'Eliminacao, bloqueio ou anonimizacao',
  portability: 'Portabilidade',
  consent_revocation: 'Revogacao de consentimento',
  processing_information: 'Informacoes sobre tratamento',
  automated_decision_review: 'Revisao de decisao automatizada',
  other: 'Outro',
}

function RequestCard({ request }: { request: PrivacyRequest }) {
  const [status, setStatus] = useState(request.status)
  const [summary, setSummary] = useState(request.response_summary ?? '')
  const [feedback, setFeedback] = useState('')
  const [isPending, startTransition] = useTransition()
  const isOverdue =
    !['completed', 'rejected'].includes(request.status) && new Date(request.due_at) < new Date()

  function save() {
    setFeedback('')
    startTransition(async () => {
      const result = await updatePrivacyRequest({
        requestId: request.id,
        status,
        responseSummary: summary,
      })
      setFeedback(result.success ? 'Atualizacao salva.' : (result.error ?? 'Nao foi possivel atualizar.'))
    })
  }

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-950 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              {typeLabels[request.request_type] ?? request.request_type}
            </span>
            <span className="text-xs font-bold text-neutral-500">{request.protocol}</span>
          </div>
          <h2 className="mt-3 break-words text-base font-extrabold text-neutral-950">{request.requester_name}</h2>
          <a href={`mailto:${request.requester_email}`} className="mt-1 inline-flex items-center gap-1.5 break-all text-xs font-semibold text-blue-700 hover:underline">
            <Mail className="h-3.5 w-3.5 shrink-0" /> {request.requester_email}
          </a>
          {request.company_cnpj && <p className="mt-1 text-xs text-neutral-500">CNPJ relacionado: {request.company_cnpj}</p>}
        </div>
        <div className={`rounded-xl border px-3 py-2 text-xs ${isOverdue ? 'border-red-200 bg-red-50 text-red-800' : 'border-neutral-200 bg-neutral-50 text-neutral-600'}`}>
          <p className="flex items-center gap-1.5 font-bold">
            {isOverdue ? <ShieldAlert className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
            Prazo interno
          </p>
          <p className="mt-1">{new Date(request.due_at).toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
        {request.message}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[15rem_1fr_auto] lg:items-end">
        <label className="text-xs font-bold text-neutral-700">
          Situacao
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm">
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-xs font-bold text-neutral-700">
          Resumo da resposta ou justificativa
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} maxLength={2000} className="mt-1.5 min-h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm" />
        </label>
        <button type="button" onClick={save} disabled={isPending} className="h-11 rounded-lg bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800 disabled:opacity-60">
          {isPending ? 'Salvando' : 'Salvar'}
        </button>
      </div>
      {feedback && (
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-neutral-600">
          <CheckCircle2 className="h-4 w-4" /> {feedback}
        </p>
      )}
    </article>
  )
}

export function PrivacyRequestManager({ requests }: { requests: PrivacyRequest[] }) {
  if (!requests.length) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center">
        <p className="text-sm font-bold text-neutral-800">Nenhuma solicitacao recebida.</p>
        <p className="mt-1 text-xs text-neutral-500">Novos protocolos aparecerao aqui.</p>
      </div>
    )
  }

  return <div className="space-y-4">{requests.map((request) => <RequestCard key={request.id} request={request} />)}</div>
}
