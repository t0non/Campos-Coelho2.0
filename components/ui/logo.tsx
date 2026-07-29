import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

interface LogoProps {
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ variant = 'dark', className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center select-none rounded-md px-1 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950',
        className,
      )}
      aria-label="Campos & Coelho - Ir para a página inicial"
    >
      <span className={cn('rounded bg-white px-2 py-1', variant === 'light' && 'bg-white')}>
        <Image
          src="/logo_campos_coelho.png"
          alt="Campos & Coelho"
          width={500}
          height={91}
          className="h-auto w-44"
        />
      </span>
    </Link>
  )
}
