import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface CatalogBreadcrumbProps {
  items: BreadcrumbItem[]
}

export function CatalogBreadcrumb({ items }: CatalogBreadcrumbProps) {
  return (
    <nav aria-label="Navegação em migalhas de pão" className="min-w-0 overflow-hidden py-2 text-xs text-slate-500">
      <ol className="flex min-w-0 items-center gap-1.5 overflow-hidden">
        <li>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors">
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Início</span>
          </Link>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1

          return (
            <li key={item.label} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              {isLast || !item.href ? (
                <span className="block min-w-0 truncate font-bold text-slate-900" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-slate-900 transition-colors truncate">
                  {item.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
