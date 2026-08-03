import React from 'react'

export function Table({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <table className={`w-full text-sm text-left text-gray-700 ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-neutral-200 bg-neutral-50 text-[10px] uppercase tracking-[0.1em] text-neutral-500">
      {children}
    </thead>
  )
}

export function TableRow({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <tr className={`border-b border-neutral-100 transition-colors last:border-0 hover:bg-neutral-50/80 ${className}`}>
      {children}
    </tr>
  )
}

export function TableHead({ children, className = '', ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={`whitespace-nowrap px-4 py-3.5 font-bold ${className}`} {...props}>
      {children}
    </th>
  )
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function TableCell({ children, className = '', ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-4 align-middle ${className}`} {...props}>
      {children}
    </td>
  )
}
