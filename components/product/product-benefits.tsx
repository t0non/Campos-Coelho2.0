import { Store, Headset, Building2, PackageCheck } from 'lucide-react'

export function ProductBenefits() {
  const benefits = [
    { icon: Store, title: 'Retirada presencial', text: 'Loja no bairro Planalto' },
    { icon: Headset, title: 'Atendimento comercial', text: 'WhatsApp e telefone' },
    { icon: Building2, title: 'Venda empresarial', text: 'Cadastro com CNPJ' },
    { icon: PackageCheck, title: 'Pedido mínimo', text: 'R$ 1.000 no site' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 select-none">
      {benefits.map((b) => {
        const Icon = b.icon
        return (
          <div key={b.title} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
            <Icon className="h-5 w-5 text-orange-500 shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">{b.title}</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">{b.text}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
