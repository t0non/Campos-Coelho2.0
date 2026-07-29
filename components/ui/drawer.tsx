'use client'

import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  titleIcon?: ReactNode
  position?: 'left' | 'right'
  children: ReactNode
  footer?: ReactNode
  panelClassName?: string
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  titleIcon,
  position = 'right',
  children,
  footer,
  panelClassName,
  headerClassName,
  contentClassName,
  footerClassName,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.classList.add('overflow-hidden')
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.classList.remove('overflow-hidden')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Painel lateral'}
        className={cn(
          'relative flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out z-10',
          position === 'right' ? 'ml-auto' : 'mr-auto',
          panelClassName,
        )}
      >
        {/* Header */}
        <div
          className={cn(
            'flex min-h-16 items-center justify-between border-b border-slate-100 px-6 py-3',
            headerClassName,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {titleIcon}
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Fechar painel"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className={cn('flex-1 overflow-y-auto p-6', contentClassName)}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className={cn('border-t border-slate-100 bg-slate-50 p-6', footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
