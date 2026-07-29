'use client'

export type CustomerSummary = {
  id: string
  cnpj: string
  company_name: string
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  created_at: string
}

interface CustomerListProps {
  customers: CustomerSummary[]
  onSelectCustomer: (id: string) => void
}

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  suspended: 'bg-neutral-100 text-neutral-700'
}

const statusLabels = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Recusado',
  suspended: 'Suspenso'
}

function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
}

const customerDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
})

export function CustomerList({ customers, onSelectCustomer }: CustomerListProps) {
  if (customers.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-500">
        Nenhuma empresa encontrada com os filtros atuais.
      </div>
    )
  }

  return (
    <div className="overflow-hidden border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">CNPJ</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">Razão social</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">Data de cadastro</th>
              <th className="p-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">Status</th>
              <th className="p-4 text-right text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map((customer) => (
              <tr key={customer.id} className="transition-colors hover:bg-neutral-50">
                <td className="p-4 text-sm font-semibold text-neutral-900 whitespace-nowrap">
                  {formatCNPJ(customer.cnpj)}
                </td>
                <td className="p-4 text-sm text-neutral-700">
                  {customer.company_name}
                </td>
                <td className="p-4 text-sm text-neutral-500 whitespace-nowrap">
                  {customerDateFormatter.format(new Date(customer.created_at))}
                </td>
                <td className="p-4 whitespace-nowrap">
                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${statusColors[customer.status]}`}>
                    {statusLabels[customer.status]}
                  </span>
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onSelectCustomer(customer.id)}
                    className="rounded-md border border-neutral-300 px-3 py-2 text-xs font-bold text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
                    aria-label={`Analisar cadastro de ${customer.company_name}`}
                  >
                    Analisar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
