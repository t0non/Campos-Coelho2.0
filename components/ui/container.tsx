import { cn } from '@/lib/utils/cn'
import type { HTMLAttributes, ReactNode } from 'react'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  clean?: boolean
}

export function Container({ children, clean = false, className, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[75rem]',
        !clean && 'px-4 sm:px-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
