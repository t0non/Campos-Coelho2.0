'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BadgeDollarSign,
  Bookmark,
  CalendarRange,
  ClipboardList,
  ExternalLink,
  ImageIcon,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Tags,
  UserCog,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navSections = [
  {
    label: 'Visão geral',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Comercial',
    items: [
      { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
      { href: '/admin/clientes', label: 'Clientes', icon: Users },
      { href: '/admin/tabelas-de-precos', label: 'Tabelas de preços', icon: BadgeDollarSign },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/admin/produtos', label: 'Produtos', icon: Package },
      { href: '/admin/categorias', label: 'Categorias', icon: Tags },
      { href: '/admin/marcas', label: 'Marcas', icon: Bookmark },
      { href: '/admin/estoque', label: 'Estoque', icon: Warehouse },
    ],
  },
  {
    label: 'Comunicação',
    items: [
      { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
      { href: '/admin/campanhas', label: 'Campanhas', icon: CalendarRange },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/administradores', label: 'Administradores', icon: UserCog },
      { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

export function SidebarAdmin() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = (
    <nav className="space-y-5" aria-label="Menu administrativo">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-400">
            {section.label}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => {
              const isActive =
                item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-bold transition-all',
                      isActive
                        ? 'bg-neutral-950 text-white shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-white' : 'text-neutral-400 group-hover:text-neutral-700',
                      )}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  const brand = (
    <div className="border-b border-neutral-200 px-5 py-5">
      <Link href="/admin" onClick={() => setIsOpen(false)} className="block">
        <Image
          src="/logo_campos_coelho.png"
          alt="Campos & Coelho"
          width={500}
          height={91}
          className="h-auto w-[160px]"
        />
      </Link>
      <p className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-neutral-400">
        Administração B2B
      </p>
    </div>
  )

  const storeLink = (
    <div className="border-t border-neutral-200 p-4">
      <Link
        href="/"
        onClick={() => setIsOpen(false)}
        className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2.5 text-xs font-bold text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
      >
        Acessar a loja
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-950 text-white shadow-sm md:hidden"
        aria-label="Abrir menu administrativo"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="sticky top-0 hidden h-screen border-r border-neutral-200 bg-white md:flex md:flex-col">
        {brand}
        <div className="flex-1 overflow-y-auto px-4 py-5">{navigation}</div>
        {storeLink}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Fechar menu administrativo"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,19rem)] flex-col bg-white shadow-2xl">
            <div className="relative">
              {brand}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">{navigation}</div>
            {storeLink}
          </aside>
        </div>
      )}
    </>
  )
}
