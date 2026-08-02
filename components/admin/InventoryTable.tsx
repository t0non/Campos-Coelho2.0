'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { History, Pencil } from 'lucide-react'
import { InventoryAdjustmentModal } from './InventoryAdjustmentModal'
import { InventoryHistoryModal } from './InventoryHistoryModal'
import { formatDateTime } from '@/lib/utils/format'

interface InventoryTableProps {
  data: any[]
}

export function InventoryTable({ data }: InventoryTableProps) {
  const [selectedInventory, setSelectedInventory] = useState<any>(null)
  const [historyInventory, setHistoryInventory] = useState<any>(null)

  const getStockStatus = (inv: any) => {
    if (inv.quantity_available === 0) return 'zerado'
    if (inv.quantity_available <= inv.min_stock_alert) return 'baixo'
    return 'disponivel'
  }

  const getStockStatusBadge = (inv: any) => {
    const status = getStockStatus(inv)
    switch (status) {
      case 'zerado':
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Zerado</span>
      case 'baixo':
        return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Baixo Estoque</span>
      default:
        return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Normal</span>
    }
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            Nenhum registro de estoque encontrado.
          </div>
        ) : data.map((inv) => {
          const usable = inv.quantity_available - inv.quantity_reserved
          return (
            <article key={inv.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-extrabold text-neutral-950">{inv.product?.name}</h2>
                  <p className="mt-1 truncate text-xs text-neutral-500">{inv.variant?.name || 'Sem variante'}</p>
                  <p className="mt-1 font-mono text-[11px] text-neutral-400">{inv.variant?.sku || inv.product?.sku}</p>
                </div>
                {getStockStatusBadge(inv)}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-3 text-center">
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Físico</dt>
                  <dd className="mt-1 text-base font-extrabold text-neutral-900">{inv.quantity_available}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Reservado</dt>
                  <dd className="mt-1 text-base font-extrabold text-neutral-600">{inv.quantity_reserved}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Utilizável</dt>
                  <dd className={`mt-1 text-base font-extrabold ${usable <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{usable}</dd>
                </div>
              </dl>
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedInventory(inv)} className="min-h-10 flex-1">
                  <Pencil className="h-4 w-4" /> Ajustar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setHistoryInventory(inv)} className="min-h-10 flex-1">
                  <History className="h-4 w-4" /> Histórico
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Disponível (Físico)</TableHead>
              <TableHead className="text-right">Reservado</TableHead>
              <TableHead className="text-right">Utilizável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum registro de estoque encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((inv) => {
                const usable = inv.quantity_available - inv.quantity_reserved
                return (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium text-sm">{inv.product?.name}</TableCell>
                    <TableCell className="text-sm">{inv.variant?.name || '—'}</TableCell>
                    <TableCell className="font-mono text-xs">{inv.variant?.sku || inv.product?.sku}</TableCell>
                    <TableCell className="text-right font-medium text-sm">{inv.quantity_available}</TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">{inv.quantity_reserved}</TableCell>
                    <TableCell className={`text-right font-bold text-sm ${usable <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {usable}
                    </TableCell>
                    <TableCell>{getStockStatusBadge(inv)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(inv.updated_at)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedInventory(inv)}
                        title="Ajustar Estoque"
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setHistoryInventory(inv)}
                        title="Ver Histórico de Movimentações"
                        className="h-8 w-8 p-0"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedInventory && (
        <InventoryAdjustmentModal
          inventory={selectedInventory}
          open={!!selectedInventory}
          onOpenChange={(open) => !open && setSelectedInventory(null)}
        />
      )}

      {historyInventory && (
        <InventoryHistoryModal
          inventory={historyInventory}
          open={!!historyInventory}
          onOpenChange={(open) => !open && setHistoryInventory(null)}
        />
      )}
    </>
  )
}
