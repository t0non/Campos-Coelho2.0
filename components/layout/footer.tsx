'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Youtube,
  ChevronRight,
} from 'lucide-react'

const footerLinks = {
  institucional: [
    { label: 'Sobre a Empresa', href: '/sobre' },
    { label: 'Trabalhe Conosco', href: '/trabalhe-conosco' },
    { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
    { label: 'Termos de Uso', href: '/termos-de-uso' },
    { label: 'Política de Troca e Devolução', href: '/trocas' },
  ],
  minhaConta: [
    { label: 'Fazer Login', href: '/login' },
    { label: 'Cadastre-se', href: '/cadastro' },
    { label: 'Meus Pedidos', href: '/minha-conta/pedidos' },
    { label: 'Meu Cadastro', href: '/minha-conta' },
    { label: 'Fale Conosco', href: '/contato' },
  ],
  categorias: [
    { label: 'Brinquedos', href: '/catalogo?cat=brinquedos' },
    { label: 'Utilidade Doméstica', href: '/catalogo?cat=utilidade-domestica' },
    { label: 'Decoração', href: '/catalogo?cat=decoracao' },
    { label: 'Eletro Eletrônicos', href: '/catalogo?cat=eletro-eletronicos' },
    { label: 'Bebês & Cia', href: '/catalogo?cat=bebes-cia' },
    { label: 'Esportes & Lazer', href: '/catalogo?cat=esportes-lazer' },
  ],
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#000000' }} className="text-gray-300 select-none">
      {/* Newsletter Strip */}
      <div style={{ backgroundColor: '#111111' }} className="border-b border-blue-900">
        <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-bold text-sm">Receba nossas novidades e promoções</p>
            <p className="text-blue-200 text-xs mt-0.5">Cadastre seu e-mail e fique por dentro das ofertas exclusivas</p>
          </div>
          <form className="flex w-full max-w-md gap-0" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="flex-1 bg-[#000000] border border-blue-800 border-r-0 rounded-l-md px-4 py-2.5 text-sm text-white placeholder-blue-300 focus:outline-none focus:border-[#e5e5e5]"
            />
            <button
              type="submit"
              className="bg-[#e5e5e5] hover:bg-[#cccccc] text-[#111111] px-6 py-2.5 rounded-r-md text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap"
            >
              ASSINAR
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Company */}
          <div className="space-y-4">
            <div className="inline-flex">
              <Image
                src="/logo_campos_coelho.png"
                alt="Campos & Coelho"
                width={180}
                height={45}
                className="object-contain"
              />
            </div>
            <p className="text-blue-200 text-xs leading-relaxed">
              Atacado B2B especializado em utilidades domésticas, brinquedos, eletroeletrônicos, decoração e muito mais. Venda exclusiva para CNPJ com Inscrição Estadual.
            </p>
            <div className="space-y-2 text-xs text-blue-100">
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#e5e5e5] shrink-0 mt-0.5" />
                <span>Belo Horizonte, MG — Brasil</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-[#e5e5e5] shrink-0" />
                <a href="tel:3100000000" className="hover:text-white transition-colors">(31) 0000-0000</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-[#e5e5e5] shrink-0" />
                <a href="mailto:contato@camposecoelho.com.br" className="hover:text-white transition-colors truncate">
                  contato@camposecoelho.com.br
                </a>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded flex items-center justify-center bg-[#111111] text-blue-200 hover:bg-[#e5e5e5] hover:text-[#111111] transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Institucional */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-extrabold uppercase tracking-wider border-b border-blue-900 pb-2">
              Institucional
            </h3>
            <ul className="space-y-2">
              {footerLinks.institucional.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-blue-200 hover:text-[#e5e5e5] flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Minha Conta */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-extrabold uppercase tracking-wider border-b border-blue-900 pb-2">
              Minha Conta
            </h3>
            <ul className="space-y-2">
              {footerLinks.minhaConta.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-blue-200 hover:text-[#e5e5e5] flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Categorias */}
          <div className="space-y-3">
            <h3 className="text-white text-xs font-extrabold uppercase tracking-wider border-b border-blue-900 pb-2">
              Categorias
            </h3>
            <ul className="space-y-2">
              {footerLinks.categorias.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-blue-200 hover:text-[#e5e5e5] flex items-center gap-1 transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-950 bg-[#0f1f3a]">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-300">
          <p>© {new Date().getFullYear()} Campos &amp; Coelho Atacado. Todos os direitos reservados.</p>
          <p className="text-blue-300/80">CNPJ: 00.000.000/0001-00 — Venda exclusiva para CNPJ com Inscrição Estadual</p>
        </div>
      </div>
    </footer>
  )
}
