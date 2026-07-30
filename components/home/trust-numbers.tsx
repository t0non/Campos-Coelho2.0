import { Container } from '@/components/ui/container'
import {
  COMPANY_ADDRESS,
  COMPANY_GOOGLE_PROFILE_URL,
  COMPANY_PHONE_DISPLAY,
  WHATSAPP_NUMBER,
} from '@/lib/config/contact'
import type { HomeMetric } from '@/lib/data/home'
import {
  BadgeCheck,
  ExternalLink,
  LayoutGrid,
  MapPin,
  Package,
  Phone,
  Store,
} from 'lucide-react'

interface TrustNumbersProps {
  metrics: HomeMetric[]
}

const metricIcons = {
  Package,
  LayoutGrid,
  BadgeCheck,
  Store,
}

export function TrustNumbers({ metrics }: TrustNumbersProps) {
  return (
    <section className="site-section border-b border-neutral-200 bg-neutral-50">
      <Container>
        <div className="site-section-header mx-auto max-w-2xl text-center">
          <span className="site-section-eyebrow text-neutral-500">
            Atacado em Belo Horizonte
          </span>
          <h2 className="site-section-title mt-2 text-neutral-950">
            Estrutura para abastecer o seu negócio
          </h2>
          <p className="site-section-copy mx-auto mt-3 max-w-xl text-neutral-600">
            Catálogo atualizado, atendimento comercial e retirada presencial em
            nossa loja no bairro Planalto.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {metrics.map((m) => (
            <MetricCard key={m.label} metric={m} />
          ))}
        </div>

        <div className="mt-4 grid overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm lg:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-3 p-5 sm:items-center sm:p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black text-white">
              <MapPin aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-neutral-950">
                Retire seu pedido em nossa loja
              </p>
              <address className="mt-1 text-xs not-italic leading-relaxed text-neutral-600 sm:text-sm">
                {COMPANY_ADDRESS}
              </address>
            </div>
          </div>

          <div className="grid border-t border-neutral-200 sm:grid-cols-2 lg:border-l lg:border-t-0">
            <a
              href={COMPANY_GOOGLE_PROFILE_URL}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-center gap-2 border-b border-neutral-200 px-5 text-xs font-extrabold text-neutral-950 transition-colors hover:bg-neutral-100 sm:border-b-0 sm:border-r lg:min-w-40"
            >
              Como chegar
              <ExternalLink aria-hidden="true" className="size-4" />
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`Falar com a Campos & Coelho pelo WhatsApp no número ${COMPANY_PHONE_DISPLAY}`}
              className="flex min-h-14 items-center justify-center gap-2 bg-black px-5 text-xs font-extrabold text-white transition-colors hover:bg-neutral-800 lg:min-w-48"
            >
              <Phone aria-hidden="true" className="size-4" />
              {COMPANY_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </Container>
    </section>
  )
}

function MetricCard({ metric }: { metric: HomeMetric }) {
  const Icon = metricIcons[metric.iconName]

  return (
    <article className="group rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 sm:p-6">
      <span className="flex size-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 group-hover:bg-black group-hover:text-white">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <p className="mt-5 text-2xl font-black tracking-tight text-neutral-950 sm:text-3xl">
        {metric.value}
      </p>
      <h3 className="mt-1 text-xs font-extrabold leading-tight text-neutral-900 sm:text-sm">
        {metric.label}
      </h3>
      <p className="mt-1 text-[11px] leading-snug text-neutral-500 sm:text-xs">
        {metric.hint}
      </p>
    </article>
  )
}
