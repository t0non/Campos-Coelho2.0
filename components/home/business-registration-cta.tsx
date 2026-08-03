import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

export function BusinessRegistrationCTA() {
  const benefits = [
    'Acesso aos preços após aprovação do cadastro',
    'Pedido mínimo e quantidades informados no catálogo',
    'Acompanhamento completo dos pedidos',
    'Atendimento comercial para lojistas',
  ]

  return (
    <section
      className="site-section relative overflow-hidden bg-black text-white select-none"
    >
      {/* Decorative diagonal */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-10"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, #ffffff 50%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-5">
            <div className="inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Cadastro Empresarial Gratuito
            </div>

            <h2 className="site-section-title text-white">
              Compre no atacado com preços exclusivos para CNPJ
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-neutral-300">
              Cadastre sua empresa com CNPJ ativo. A Inscrição Estadual é solicitada
              somente quando se aplica à atividade da empresa.
            </p>

            <div className="grid sm:grid-cols-2 gap-2 pt-1">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <Link
              href="/cadastro"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-black transition-all hover:-translate-y-0.5 hover:bg-neutral-200"
            >
              <span>Cadastrar Minha Empresa</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/30 text-xs font-semibold text-white transition-colors hover:bg-white/10"
            >
              Já tenho cadastro → Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
