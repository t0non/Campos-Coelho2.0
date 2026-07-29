import { Container } from '@/components/ui/container'

interface TrustNumbersProps {
  metrics: { label: string; value: string; hint: string }[]
}

export function TrustNumbers({ metrics }: TrustNumbersProps) {
  return (
    <section className="site-section border-b border-slate-200 bg-white">
      <Container>
        <div className="site-section-header mx-auto max-w-xl space-y-2 text-center">
          <h2 className="site-section-title text-slate-900">
            Estrutura Comercial Preparada para o Mercado B2B
          </h2>
          <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-slate-500">
            * Dados demonstrativos do projeto
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center"
            >
              <span className="text-3xl sm:text-4xl font-black text-orange-500">
                {m.value}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-1">
                {m.label}
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                {m.hint}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
