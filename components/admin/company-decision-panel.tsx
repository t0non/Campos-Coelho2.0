'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, UserCheck, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  approveCompanyAction,
  rejectCompanyAction,
  assignSellerAction,
  reactivateCompanyAction,
  suspendCompanyAction,
} from '@/app/actions/company'

interface SellerOption {
  id: string
  full_name: string
  email: string
}

interface CompanyDecisionPanelProps {
  companyId: string
  currentStatus: string
  currentSellerId: string | null
  currentReason: string | null
  currentNotes: string | null
  sellers: SellerOption[]
}

export function CompanyDecisionPanel({
  companyId,
  currentStatus,
  currentSellerId,
  currentReason,
  currentNotes,
  sellers,
}: CompanyDecisionPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [selectedSeller, setSelectedSeller] = useState<string>(currentSellerId || '')
  const [rejectionReason, setRejectionReason] = useState<string>(currentReason || '')
  const [internalNotes, setInternalNotes] = useState<string>(currentNotes || '')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showSuspendForm, setShowSuspendForm] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')

  const handleApprove = async () => {
    if (!confirm('Confirmar a APROVAÇÃO desta empresa? O cliente terá acesso liberado aos preços e pedidos.')) {
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await approveCompanyAction(companyId, internalNotes)
      setSuccessMsg('Empresa aprovada com sucesso!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao aprovar empresa.')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectionReason || rejectionReason.trim().length < 5) {
      setErrorMsg('Informe um motivo público de recusa claro (mínimo 5 caracteres).')
      return
    }

    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await rejectCompanyAction(companyId, rejectionReason, internalNotes)
      setSuccessMsg('Empresa recusada. O cliente foi notificado com a mensagem pública.')
      setShowRejectForm(false)
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao recusar empresa.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignSeller = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await assignSellerAction(companyId, selectedSeller || null)
      setSuccessMsg('Vendedor atribuído com sucesso!')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao atribuir vendedor.')
    } finally {
      setLoading(false)
    }
  }

  const handleSuspend = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await suspendCompanyAction(companyId, suspensionReason)
      setSuccessMsg('Empresa suspensa e cliente notificado.')
      setShowSuspendForm(false)
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao suspender empresa.')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivate = async () => {
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      await reactivateCompanyAction(companyId, internalNotes)
      setSuccessMsg('Empresa reativada com acesso comercial liberado.')
      router.refresh()
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao reativar empresa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 lg:space-y-6">
      <h2 className="flex items-start gap-2 border-b border-gray-100 pb-3 text-sm font-bold leading-5 text-gray-900 sm:items-center sm:text-base">
        <ShieldAlert className="h-5 w-5 shrink-0 text-blue-600" />
        <span>Decisão comercial</span>
      </h2>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 font-semibold border border-red-200">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700 font-semibold border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Atribuição de Vendedor */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-700">Vendedor responsável pela carteira</label>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
          <select
            value={selectedSeller}
            onChange={(e) => setSelectedSeller(e.target.value)}
            className="h-11 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-xs font-medium outline-none"
          >
            <option value="">Nenhum vendedor atribuído (Sem carteira)</option>
            {sellers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.email})
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAssignSeller}
            loading={loading}
            className="w-full shrink-0 text-xs font-bold sm:w-auto lg:w-full xl:w-auto"
          >
            <UserCheck className="h-3.5 w-3.5 mr-1 text-blue-600" />
            <span>Atribuir</span>
          </Button>
        </div>
      </div>

      {/* Observação Interna (Apenas Admin) */}
      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-700">Observação interna <span className="font-medium text-gray-500">(somente administradores)</span></label>
        <textarea
          rows={2}
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Ex: Análise de crédito pré-aprovada até R$ 50.000,00..."
          className="w-full rounded-lg border border-gray-300 p-2.5 text-xs outline-none focus:border-blue-500"
        />
      </div>

      {/* Ações de Aprovação ou Recusa */}
      <div className="grid gap-2 border-t border-gray-100 pt-3 sm:grid-cols-2 lg:grid-cols-1">
        {currentStatus === 'suspended' && (
          <Button type="button" onClick={handleReactivate} loading={loading} className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span>Reativar Empresa</span>
          </Button>
        )}

        {(currentStatus === 'pending' || currentStatus === 'rejected') && (
          <Button
            type="button"
            onClick={handleApprove}
            loading={loading}
            className="w-full bg-green-600 font-bold text-white hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span>Aprovar Empresa</span>
          </Button>
        )}

        {(currentStatus === 'pending' || currentStatus === 'approved') && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowRejectForm(!showRejectForm)}
            className="w-full border-red-200 font-bold text-red-700 hover:bg-red-50"
          >
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            <span>Recusar Cadastro...</span>
          </Button>
        )}

        {currentStatus === 'approved' && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowSuspendForm(!showSuspendForm)}
            className="w-full border-amber-200 font-bold text-amber-800 hover:bg-amber-50"
          >
            <ShieldAlert className="h-4 w-4 mr-2" />
            <span>Suspender acesso...</span>
          </Button>
        )}
      </div>

      {/* Formulário de Recusa com Mensagem Pública */}
      {showRejectForm && (
        <form onSubmit={handleReject} className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-3 sm:p-4">
          <h3 className="text-xs font-bold text-red-900">Mensagem Pública de Recusa (Visível ao cliente):</h3>
          <textarea
            rows={3}
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Informe claramente o motivo da recusa ou as correções necessárias (ex: Contrato social desatualizado ou Inscrição Estadual inapta...)"
            className="w-full rounded-lg border border-red-300 bg-white p-2.5 text-xs outline-none focus:border-red-500"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectForm(false)}
            >
              <span>Cancelar</span>
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={loading}
              className="w-full bg-red-600 font-bold text-white hover:bg-red-700 sm:w-auto"
            >
              Confirmar Recusa
            </Button>
          </div>
        </form>
      )}

      {showSuspendForm && (
        <form onSubmit={handleSuspend} className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:p-4">
          <h3 className="text-xs font-bold text-amber-950">Motivo da suspensão (visível ao cliente):</h3>
          <textarea
            rows={3}
            required
            minLength={5}
            maxLength={1000}
            value={suspensionReason}
            onChange={(event) => setSuspensionReason(event.target.value)}
            placeholder="Explique por que o acesso comercial foi suspenso e como regularizar."
            className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-xs outline-none focus:border-amber-600"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowSuspendForm(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={loading} className="w-full bg-amber-700 text-white hover:bg-amber-800 sm:w-auto">
              Confirmar suspensão
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
