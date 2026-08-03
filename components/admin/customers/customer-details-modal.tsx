'use client'

import { useState, useEffect } from 'react'
import { deleteCustomer, getCustomerDetails, updateCustomerStatus, getDocumentUrl } from '@/lib/actions/admin/customers'
import { X, Building2, MapPin, User, FileText, CheckCircle, XCircle, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { CustomerEditForm } from '@/components/admin/customers/customer-edit-form'

interface CustomerDetailsModalProps {
  companyId: string
  onClose: () => void
  onUpdate: () => void
}

export function CustomerDetailsModal({ companyId, onClose, onUpdate }: CustomerDetailsModalProps) {
  const [details, setDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [decisionMessage, setDecisionMessage] = useState('')
  const [decisionFeedback, setDecisionFeedback] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await getCustomerDetails(companyId)
      if (res.error) {
        setError(res.error)
      } else {
        setDetails(res.customer)
      }
      setIsLoading(false)
    }
    fetchDetails()
  }, [companyId])

  const handleStatusChange = async (status: 'approved' | 'rejected') => {
    if (decisionMessage.trim().length < 5) {
      setActionError('Escreva uma mensagem para o cliente antes de concluir a análise.')
      return
    }
    setIsUpdating(true)
    setActionError('')
    setDecisionFeedback('')
    const res = await updateCustomerStatus(companyId, status, decisionMessage)
    setIsUpdating(false)
    
    if (res.error) {
      setActionError(res.error)
    } else {
      setDetails((current: any) => ({ ...current, status }))
      onUpdate()
      setDecisionFeedback('Decisão salva e disponibilizada na conta do cliente.')
    }
  }

  const handleViewDocument = async (filePath: string) => {
    const res = await getDocumentUrl(filePath)
    if (res.url) {
      window.open(res.url, '_blank', 'noopener,noreferrer')
    } else {
      alert(res.error || 'Erro ao abrir documento')
    }
  }

  const handleEditSaved = async () => {
    const res = await getCustomerDetails(companyId)
    if (res.customer) setDetails(res.customer)
    setIsEditing(false)
    setDecisionFeedback('Dados do cliente atualizados com sucesso.')
    onUpdate()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setActionError('')
    const result = await deleteCustomer(companyId, deleteConfirmation)
    setIsDeleting(false)
    if (result.error) {
      setActionError(result.error)
      return
    }
    if (result.warning) {
      setShowDeleteConfirmation(false)
      setDeleteConfirmation('')
      setActionError(result.warning)
      onUpdate()
      return
    }
    onUpdate()
    onClose()
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" role="dialog" aria-modal="true" aria-label="Carregando cadastro da empresa">
        <div className="w-full max-w-2xl bg-white h-full p-8 animate-pulse flex flex-col">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="h-32 bg-gray-100 rounded mb-4"></div>
          <div className="h-32 bg-gray-100 rounded mb-4"></div>
        </div>
      </div>
    )
  }

  if (error || !details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" role="dialog" aria-modal="true" aria-labelledby="customer-error-title">
        <div className="w-full max-w-2xl bg-white h-full p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 id="customer-error-title" className="text-xl font-bold text-red-600">Erro</h2>
            <button type="button" onClick={onClose} aria-label="Fechar análise do cadastro"><X className="h-6 w-6 text-gray-400" /></button>
          </div>
          <p>{error || 'Não foi possível carregar os dados.'}</p>
        </div>
      </div>
    )
  }

  const { company_name, cnpj, trade_name, state_registration, email, phone, whatsapp, segment, business_type, estimated_order_volume, status, addresses, members, documents, registration_data } = details
  const mainAddress = addresses?.find((a: any) => a.label === 'Principal') || addresses?.[0]
  const mainContact = members?.find((m: any) => m.is_primary)?.profile || members?.[0]?.profile

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
      {/* Drawer */}
      <div className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b p-4 sm:px-5">
          <div>
            <h2 id="customer-details-title" className="text-xl font-black leading-tight text-[#111111]">{company_name}</h2>
            <p className="mt-1 text-sm text-gray-500">CNPJ: {cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</p>
            
            <div className="mt-2 inline-flex">
              {status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Pendente</span>}
              {status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Aprovado</span>}
              {status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Recusado</span>}
              {status === 'suspended' && <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Suspenso</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-neutral-300 px-3 text-sm font-bold text-neutral-700 hover:border-neutral-950" aria-label="Editar dados do cliente">
                <Pencil className="h-4 w-4" /> Editar
              </button>
            ) : null}
            <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fechar análise do cadastro">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="flex-1 overflow-y-auto bg-neutral-50 p-4 sm:p-5">
            <CustomerEditForm details={details} onCancel={() => setIsEditing(false)} onSaved={handleEditSaved} />
          </div>
        ) : (
          <>
        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4 sm:p-5">
          
          {/* Dados da Empresa */}
          <section className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-extrabold text-gray-900">
              <Building2 className="h-5 w-5 text-[#111111]" /> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
              <div><span className="block text-gray-500 mb-1">Nome Fantasia</span><strong className="text-gray-900">{trade_name || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Inscrição Estadual</span><strong className="text-gray-900">{state_registration || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">E-mail Comercial</span><strong className="text-gray-900">{email || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Telefone Fixo</span><strong className="text-gray-900">{phone || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">WhatsApp</span><strong className="text-gray-900">{whatsapp || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Segmento</span><strong className="text-gray-900">{segment || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Tipo de negocio</span><strong className="text-gray-900">{business_type || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Volume estimado</span><strong className="text-gray-900">{estimated_order_volume || '-'}</strong></div>
            </div>
          </section>

          {/* Endereço Principal */}
          <section className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-extrabold text-gray-900">
              <MapPin className="h-5 w-5 text-[#111111]" /> Endereço de Faturamento/Entrega
            </h3>
            {mainAddress ? (
              <div className="text-sm space-y-1 text-gray-700">
                <p><strong>{mainAddress.street}, {mainAddress.number}</strong> {mainAddress.complement && `- ${mainAddress.complement}`}</p>
                <p>{mainAddress.neighborhood}</p>
                <p>{mainAddress.city} - {mainAddress.state}</p>
                <p>CEP: {mainAddress.zip_code.replace(/^(\d{5})(\d{3})$/, "$1-$2")}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum endereço cadastrado.</p>
            )}
          </section>

          {/* Contato Principal */}
          <section className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-extrabold text-gray-900">
              <User className="h-5 w-5 text-[#111111]" /> Responsável pela Compra
            </h3>
            {mainContact ? (
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div><span className="block text-gray-500 mb-1">Nome</span><strong className="text-gray-900">{mainContact.full_name}</strong></div>
                <div><span className="block text-gray-500 mb-1">E-mail</span><strong className="text-gray-900">{mainContact.email}</strong></div>
                <div><span className="block text-gray-500 mb-1">Telefone Pessoal</span><strong className="text-gray-900">{mainContact.phone || '-'}</strong></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum contato vinculado.</p>
            )}
          </section>

          {/* Documentos */}
          {false && registration_data && (
            <section className="rounded-lg border bg-white p-4">
              <h3 className="mb-3 border-b pb-2 text-sm font-extrabold text-gray-900">
                Ficha comercial para aprovação
              </h3>
              <div className="grid grid-cols-1 gap-x-5 gap-y-3 text-sm sm:grid-cols-2">
                <div><span className="block text-gray-500 mb-1">Segmento</span><strong>{registration_data.company?.segment || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Tipo de negócio</span><strong>{registration_data.company?.businessType || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Número de funcionários</span><strong>{registration_data.company?.employeeCount || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Cargo do responsável</span><strong>{registration_data.responsible?.role || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">CPF do responsável</span><strong>{registration_data.responsible?.cpf || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Canal de vendas</span><strong>{registration_data.interests?.salesChannel || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Frequência de compra</span><strong>{registration_data.interests?.purchaseFrequency || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Volume médio</span><strong>{registration_data.interests?.averageOrderValue || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Número de lojas</span><strong>{registration_data.interests?.storeCount || '-'}</strong></div>
                <div><span className="block text-gray-500 mb-1">Estados atendidos</span><strong>{registration_data.interests?.operatingStates?.join(', ') || '-'}</strong></div>
                <div className="sm:col-span-2"><span className="block text-gray-500 mb-1">Categorias de interesse</span><strong>{registration_data.interests?.categories?.join(', ') || '-'}</strong></div>
              </div>
            </section>
          )}

          <section className="rounded-lg border bg-white p-4">
            <h3 className="mb-3 flex items-center gap-2 border-b pb-2 text-sm font-extrabold text-gray-900">
              <FileText className="h-5 w-5 text-[#111111]" /> Documentos Anexados
            </h3>
            {documents && documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex flex-col gap-3 rounded-md border p-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">
                        {doc.document_type === 'contrato_social'
                          ? 'Contrato Social'
                          : doc.document_type === 'doc_responsavel'
                            ? 'Documento do responsável'
                            : 'Outro Documento'}
                      </p>
                      <p className="text-xs text-gray-500">{doc.file_name}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleViewDocument(doc.file_path)}
                      className="text-[#111111] text-sm font-semibold hover:underline"
                    >
                      Visualizar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum documento enviado.</p>
            )}
          </section>
        </div>

        {/* Actions Footer */}
        <div className="border-t bg-white p-4 sm:px-5">
          <label className="mb-2 block text-sm font-bold text-gray-900" htmlFor="decision-message">
            Mensagem para o cliente
          </label>
          <textarea
            id="decision-message"
            value={decisionMessage}
            onChange={(event) => setDecisionMessage(event.target.value)}
            placeholder="Explique a aprovação ou informe claramente o motivo da recusa e o que deve ser corrigido."
            rows={2}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
          />
          <p className="mt-1 text-xs text-gray-500">
            Esta mensagem ficará registrada e será exibida na conta do cliente.
          </p>
          {actionError && <p className="mt-2 text-sm font-medium text-red-600">{actionError}</p>}
          {decisionFeedback && (
            <p className="mt-2 text-sm font-medium text-green-700">
              {decisionFeedback}
            </p>
          )}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
          {status === 'pending' || status === 'rejected' ? (
            <button 
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('approved')}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-5 w-5" />
              Aprovar Cadastro
            </button>
          ) : null}

          {status === 'pending' || status === 'approved' ? (
            <button 
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('rejected')}
              className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              Recusar Cliente
            </button>
          ) : null}
          </div>

          <div className="mt-4 border-t border-red-100 pt-3">
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirmation(true)
                setActionError('')
              }}
              className="inline-flex min-h-9 items-center gap-2 text-xs font-bold text-red-700"
            >
              <Trash2 className="h-4 w-4" /> Excluir cliente
            </button>
          </div>
        </div>
          </>
        )}
      </div>

      {showDeleteConfirmation ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-customer-title">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="delete-customer-title" className="text-base font-extrabold text-neutral-950">Excluir cliente permanentemente?</h3>
                <p className="mt-1 text-sm leading-5 text-neutral-600">
                  Empresa, documentos e conta de acesso serão removidos. Clientes com pedidos não podem ser excluídos.
                </p>
              </div>
            </div>
            <label className="mt-4 block text-xs font-bold text-neutral-800" htmlFor="delete-customer-confirmation">
              Digite <strong>{company_name}</strong> para confirmar
            </label>
            <input
              id="delete-customer-confirmation"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              autoFocus
              className="mt-1 min-h-11 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
            />
            {actionError ? <p className="mt-2 text-sm font-semibold text-red-700">{actionError}</p> : null}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setShowDeleteConfirmation(false); setDeleteConfirmation(''); setActionError('') }} disabled={isDeleting} className="min-h-10 rounded-md border border-neutral-300 px-4 text-sm font-bold text-neutral-700">
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting || deleteConfirmation !== company_name} className="min-h-10 rounded-md bg-red-700 px-4 text-sm font-bold text-white disabled:opacity-40">
                {isDeleting ? 'Excluindo...' : 'Excluir permanentemente'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
