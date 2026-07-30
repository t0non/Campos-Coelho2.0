'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Heart,
  LayoutGrid,
  MessageCircle,
  Search,
  Sparkles,
  User,
} from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Logo } from '@/components/ui/logo'
import { WHATSAPP_NUMBER } from '@/lib/config/contact'
import type { AuthContext } from '@/types/auth.types'

interface MobileNavDrawerProps {
  isOpen: boolean
  onClose: () => void
  authContext?: AuthContext
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function MobileNavDrawer({
  isOpen,
  onClose,
  authContext,
  categories = [],
}: MobileNavDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const user = authContext?.user
  const company = authContext?.company

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) return
    onClose()
    router.push(`/busca?q=${encodeURIComponent(query)}`)
  }

  const accountLinks =
    user?.role === 'admin'
      ? [
          { label: 'Painel administrativo', href: '/admin' },
          { label: 'Ver catálogo', href: '/catalogo' },
        ]
      : user?.role === 'seller'
        ? [
            { label: 'Painel do vendedor', href: '/vendedor' },
            { label: 'Ver catálogo', href: '/catalogo' },
          ]
        : [
            { label: 'Minha conta', href: '/minha-conta' },
            { label: 'Meus pedidos', href: '/minha-conta/pedidos' },
          ]

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="left"
      panelClassName="max-w-[22rem]"
      contentClassName="p-5"
    >
      <div className="flex flex-col gap-6">
        <Logo />

        <form onSubmit={handleSearch} className="flex overflow-hidden rounded-xl bg-neutral-100">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="flex h-11 w-12 items-center justify-center bg-black text-white"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                  {user.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-neutral-950">{user.full_name}</p>
                  <p className="truncate text-xs text-neutral-500">{user.email}</p>
                </div>
              </div>

              {company && (
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-600">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{company.company_name}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 border-t border-neutral-200 pt-3">
                {accountLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex min-h-11 items-center justify-center rounded-lg border border-neutral-200 bg-white p-2 text-center text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-950">Acesse sua conta B2B</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Cadastre sua empresa para visualizar preços e fazer pedidos.
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-lg bg-black px-3 text-sm font-bold text-white"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  onClick={onClose}
                  className="flex min-h-12 flex-1 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-bold text-neutral-900"
                >
                  Cadastrar
                </Link>
              </div>
            </div>
          )}
        </div>

        <nav aria-label="Categorias" className="space-y-2">
          <p className="px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-400">
            Categorias
          </p>
          <Link
            href="/catalogo"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm font-bold text-neutral-900"
          >
            <LayoutGrid className="h-4 w-4" />
            Todas as categorias
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/catalogo?cat=${category.slug}`}
              onClick={onClose}
              className="flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/catalogo?promo=1"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl bg-black px-3 py-3 text-sm font-bold text-white"
          >
            <Sparkles className="h-4 w-4" />
            Oportunidades
          </Link>
        </nav>

        <div className="space-y-2 border-t border-neutral-200 pt-4">
          {user?.role === 'customer' && (
            <Link
              href="/minha-conta/favoritos"
              onClick={onClose}
              className="flex items-center gap-3 py-1.5 text-xs font-semibold text-neutral-700"
            >
              <Heart className="h-4 w-4 text-neutral-400" />
              Meus favoritos
            </Link>
          )}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 py-1.5 text-xs font-semibold text-neutral-700"
          >
            <MessageCircle className="h-4 w-4 text-neutral-500" />
            Atendimento por WhatsApp
          </a>
        </div>
      </div>
    </Drawer>
  )
}
