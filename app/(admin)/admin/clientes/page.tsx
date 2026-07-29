'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { getCustomers } from '@/lib/actions/admin/customers'
import { CustomerList, CustomerSummary } from '@/components/admin/customers/customer-list'
import { Search, Filter } from 'lucide-react'

const CustomerDetailsModal = dynamic(() =>
  import('@/components/admin/customers/customer-details-modal').then(
    (module) => module.CustomerDetailsModal,
  ),
)

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Modal
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchTerm), 400)
    return () => window.clearTimeout(timer)
  }, [searchTerm])

  const fetchList = async () => {
    setIsLoading(true)
    const res = await getCustomers(debouncedSearch, statusFilter)
    if (res.customers) {
      setCustomers(res.customers as CustomerSummary[])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchList()
  }, [debouncedSearch, statusFilter])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-neutral-400">
            Cadastro comercial
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
            Clientes e empresas
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Aprove cadastros de novos lojistas, veja documentos e libere o acesso aos preços.
          </p>
        </div>

        {/* Filtros */}
        <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_13rem] lg:w-auto">
          <div className="relative min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <input 
              type="text" 
              aria-label="Buscar por CNPJ ou nome"
              placeholder="Buscar CNPJ ou nome"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-h-11 w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10 lg:w-72"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" aria-hidden="true" />
            <select
              aria-label="Filtrar clientes por status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-11 w-full appearance-none rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Recusados</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && customers.length === 0 ? (
        <div className="border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
          Carregando lista de clientes...
        </div>
      ) : (
        <CustomerList 
          customers={customers} 
          onSelectCustomer={(id) => setSelectedCompanyId(id)}
        />
      )}

      {selectedCompanyId && (
        <CustomerDetailsModal
          companyId={selectedCompanyId}
          onClose={() => setSelectedCompanyId(null)}
          onUpdate={fetchList}
        />
      )}
    </div>
  )
}
