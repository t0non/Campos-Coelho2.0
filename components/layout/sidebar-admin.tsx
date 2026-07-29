'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BadgeDollarSign,
  Bookmark,
  CalendarRange,
  ChevronRight,
  ClipboardList,
  Image,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  Tags,
  Users,
  Warehouse,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/categorias', label: 'Categorias', icon: Tags },
  { href: '/admin/marcas', label: 'Marcas', icon: Bookmark },
  { href: '/admin/estoque', label: 'Estoque', icon: Warehouse },
  { href: '/admin/tabelas-de-precos', label: 'Tabelas de preços', icon: BadgeDollarSign },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/campanhas', label: 'Campanhas', icon: CalendarRange },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function SidebarAdmin() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = (
    <nav aria-label="Menu administrativo">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive
                    ? 'bg-black text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-white hover:text-black',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-3 top-2.5 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-lg md:hidden"
        aria-label="Abrir menu administrativo"
      >
        <Menu className="h-5 w-5" />
      </button>

      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-neutral-200 bg-neutral-50 md:block">
        <div className="sticky top-0 p-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-400">
            Painel Admin
          </p>
          {navigation}
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Fechar menu administrativo"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-[min(86vw,20rem)] flex-col bg-neutral-50 shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
              <p className="text-sm font-extrabold text-neutral-950">Painel Admin</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{navigation}</div>
          </aside>
        </div>
      )}
    </>
  )
}
