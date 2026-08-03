import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight, Mail, MapPin, Phone } from 'lucide-react'
import { FooterNewsletterForm } from '@/components/layout/footer-newsletter-form'
import {
  COMPANY_ADDRESS,
  COMPANY_GOOGLE_PROFILE_URL,
  COMPANY_PHONE_DISPLAY,
  WHATSAPP_MESSAGE,
  WHATSAPP_NUMBER,
} from '@/lib/config/contact'

const footerLinks = {
  institucional: [
    { label: 'Seus direitos e dados', href: '/privacidade' },
    { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
    { label: 'Termos de Uso', href: '/termos-de-uso' },
  ],
  conta: [
    { label: 'Fazer login', href: '/login' },
    { label: 'Cadastrar empresa', href: '/cadastro' },
    { label: 'Meus pedidos', href: '/minha-conta/pedidos' },
    { label: 'Minha conta', href: '/minha-conta' },
  ],
  categorias: [
    { label: 'Jardim & Decoração', href: '/catalogo?cat=jardim-decoracao' },
    { label: 'Cozinha & Mesa', href: '/catalogo?cat=cozinha-mesa' },
    { label: 'Organização', href: '/catalogo?cat=organizacao' },
    { label: 'Utilidades & Limpeza', href: '/catalogo?cat=utilidades-limpeza' },
    { label: 'Diversos', href: '/catalogo?cat=diversos' },
  ],
}

function LinkColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <div>
      <h3 className="border-b border-white/10 pb-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="group flex items-center gap-2 text-xs text-neutral-400 transition-colors hover:text-white"
            >
              <ChevronRight className="h-3 w-3 text-neutral-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <footer className="select-none bg-neutral-950 text-neutral-300">
      <div className="border-b border-white/10 bg-neutral-900">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Receba novidades e oportunidades</p>
              <p className="mt-1 text-xs text-neutral-400">
                Informações comerciais relevantes para sua empresa.
              </p>
            </div>
          </div>
          <FooterNewsletterForm />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-9">
          <div className="space-y-5 sm:col-span-2 lg:pr-10">
            <Link href="/" className="inline-flex">
              <Image
                src="/logo_campos_coelho.png"
                alt="Campos & Coelho"
                width={210}
                height={53}
                className="h-auto w-[210px] object-contain brightness-0 invert"
              />
            </Link>
            <p className="max-w-md text-xs leading-relaxed text-neutral-400">
              Distribuidora B2B com catálogo amplo para lojistas e empresas. Consulte preços,
              disponibilidade e condições comerciais após a aprovação do cadastro.
            </p>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-neutral-300">
              Venda exclusiva para empresas
            </div>
            <div className="space-y-3 text-xs text-neutral-400">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{COMPANY_PHONE_DISPLAY}</span>
              </a>
              <a
                href={COMPANY_GOOGLE_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 leading-relaxed transition-colors hover:text-white"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{COMPANY_ADDRESS}</span>
              </a>
            </div>
          </div>

          <LinkColumn title="Institucional" links={footerLinks.institucional} />
          <LinkColumn title="Minha conta" links={footerLinks.conta} />
          <LinkColumn title="Categorias" links={footerLinks.categorias} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-2 px-4 py-5 text-center text-[11px] text-neutral-500 sm:flex-row sm:px-6 sm:text-left">
          <p>© {new Date().getFullYear()} Campos &amp; Coelho Atacado.</p>
          <p className="text-neutral-600">Catálogo e atendimento comercial B2B.</p>
        </div>
      </div>
    </footer>
  )
}
