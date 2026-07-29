'use client'

import { useState, useEffect } from 'react'
import { getCustomerDetails, updateCustomerStatus, getDocumentUrl } from '@/lib/actions/admin/customers'
import { X, Building2, MapPin, User, FileText, CheckCircle, XCircle } from 'lucide-react'

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

  const { company_name, cnpj, trade_name, state_registration, email, phone, whatsapp, status, addresses, members, documents, registration_data } = details
  const mainAddress = addresses?.find((a: any) => a.label === 'Principal') || addresses?.[0]
  const mainContact = members?.find((m: any) => m.is_primary)?.profile || members?.[0]?.profile

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50" role="dialog" aria-modal="true" aria-labelledby="customer-details-title">
      {/* Drawer */}
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b">
          <div>
            <h2 id="customer-details-title" className="text-2xl font-black text-[#111111]">{company_name}</h2>
            <p className="text-gray-500 mt-1">CNPJ: {cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")}</p>
            
            <div className="mt-3 inline-flex">
              {status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Pendente</span>}
              {status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Aprovado</span>}
              {status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Recusado</span>}
              {status === 'suspended' && <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Suspenso</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fechar análise do cadastro">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
          
          {/* Dados da Empresa */}
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3 mb-4">
              <Building2 className="h-5 w-5 text-[#111111]" /> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
              <div><span className="block text-gray-500 mb-1">Nome Fantasia</span><strong className="text-gray-900">{trade_name || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Inscrição Estadual</span><strong className="text-gray-900">{state_registration || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">E-mail Comercial</span><strong className="text-gray-900">{email || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">Telefone Fixo</span><strong className="text-gray-900">{phone || '-'}</strong></div>
              <div><span className="block text-gray-500 mb-1">WhatsApp</span><strong className="text-gray-900">{whatsapp || '-'}</strong></div>
            </div>
          </section>

          {/* Endereço Principal */}
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3 mb-4">
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
          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3 mb-4">
              <User className="h-5 w-5 text-[#111111]" /> Responsável pela Compra
            </h3>
            {mainContact ? (
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                <div><span className="block text-gray-500 mb-1">Nome</span><strong className="text-gray-900">{mainContact.full_name}</strong></div>
                <div><span className="block text-gray-500 mb-1">E-mail</span><strong className="text-gray-900">{mainContact.email}</strong></div>
                <div><span className="block text-gray-500 mb-1">Telefone Pessoal</span><strong className="text-gray-900">{mainContact.phone || '-'}</strong></div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum contato vinculado.</p>
            )}
          </section>

          {/* Documentos */}
          {registration_data && (
            <section className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-3 mb-4">
                Ficha comercial para aprovação
              </h3>
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
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

          <section className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b pb-3 mb-4">
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
        <div className="border-t bg-white p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <label className="mb-2 block text-sm font-bold text-gray-900" htmlFor="decision-message">
            Mensagem para o cliente
          </label>
          <textarea
            id="decision-message"
            value={decisionMessage}
            onChange={(event) => setDecisionMessage(event.target.value)}
            placeholder="Explique a aprovação ou informe claramente o motivo da recusa e o que deve ser corrigido."
            rows={3}
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

          <div className="mt-4 flex justify-end gap-4">
          {status === 'pending' || status === 'rejected' ? (
            <button 
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('approved')}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
              className="flex-1 bg-white hover:bg-red-50 text-red-600 border-2 border-red-200 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-5 w-5" />
              Recusar Cliente
            </button>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
