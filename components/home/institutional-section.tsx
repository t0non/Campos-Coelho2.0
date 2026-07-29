import Image from 'next/image'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/container'

export function InstitutionalSection() {
  const differentials = [
    'Catálogo focado em produtos de alta rotatividade comercial',
    'Preços diretos da tabela de atacado para cadastros aprovados',
    'Atendimento ágil para cotações e dúvidas de faturamento',
    'Plataforma moderna, segura e fácil de navegar',
  ]

  return (
    <section className="site-section border-b border-slate-200 bg-white">
      <Container>
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="group relative min-h-[18rem] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm lg:col-span-5">
            <Image
              src="/loja-1.webp"
              alt="Fachada da Campos & Coelho Distribuidora e Atacadista"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <h3 className="text-lg font-bold text-white">Campos &amp; Coelho</h3>
              <p className="mt-1 max-w-sm text-xs leading-relaxed text-white/80">
                Estrutura preparada para abastecer o seu negócio com agilidade.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="site-section-eyebrow text-orange-600">
                Sobre a Empresa
              </span>
              <h2 className="site-section-title text-slate-900">
                Uma Parceria para o Crescimento do Seu Negócio
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A Campos &amp; Coelho facilita o abastecimento de lojas, revendedores e
              empresas com variedade de produtos, atendimento comercial especializado e
              uma operação preparada para o mercado B2B.
            </p>

            <div className="space-y-2">
              {differentials.map((diff) => (
                <div key={diff} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  <span>{diff}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-xs font-bold text-white hover:bg-navy-800 transition-colors"
              >
                <span>Conhecer Nossa Estrutura</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
