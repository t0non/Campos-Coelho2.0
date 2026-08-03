'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { clearCartAction, removeCartItemAction, updateCartItemQuantityAction } from '@/app/actions/cart'
import { PriceBlocked } from '@/components/product/price-blocked'
import { Drawer } from '@/components/ui/drawer'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import type { CartLineItem } from '@/lib/types/cart'
import { formatPrice } from '@/lib/utils/format'
import { getProductDisplayName } from '@/lib/utils/product-display-name'

interface CartSlideOverProps {
  isOpen: boolean
  onClose: () => void
  canViewPrices?: boolean
  userStatus?: 'visitor' | 'pending' | 'approved' | 'rejected' | 'suspended'
  initialItems?: CartLineItem[]
  targetCompanyId?: string | null
  previewOnly?: boolean
  onPreviewItemsChange?: (items: CartLineItem[]) => void
}

export function CartSlideOver({
  isOpen,
  onClose,
  canViewPrices = false,
  userStatus = 'visitor',
  initialItems = [],
  targetCompanyId,
  previewOnly = false,
  onPreviewItemsChange,
}: CartSlideOverProps) {
  const router = useRouter()
  const [items, setItems] = useState<CartLineItem[]>(initialItems)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [loadingItem, setLoadingItem] = useState<string | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (loadingItem) return

    if (previewOnly) {
      const nextItems = items.map((item) =>
        item.item_id === itemId
          ? {
              ...item,
              quantity: newQty,
              line_total: (item.effective_price ?? 0) * newQty,
            }
          : item,
      )
      setItems(nextItems)
      onPreviewItemsChange?.(nextItems)
      return
    }

    setLoadingItem(itemId)
    setErrors((current) => ({ ...current, [itemId]: '' }))

    startTransition(async () => {
      const result = await updateCartItemQuantityAction({
        item_id: itemId,
        quantity: newQty,
      })

      if (!result.success) {
        setErrors((current) => ({
          ...current,
          [itemId]: result.message ?? 'Não foi possível atualizar a quantidade.',
        }))
      } else if (!result.noOp) {
        setItems((current) =>
          current.map((item) =>
            item.item_id === itemId
              ? {
                  ...item,
                  quantity: newQty,
                  line_total: (item.effective_price ?? 0) * newQty,
                }
              : item,
          ),
        )
        router.refresh()
      }

      setLoadingItem(null)
    })
  }

  const handleRemove = (itemId: string) => {
    if (loadingItem) return

    if (previewOnly) {
      const nextItems = items.filter((item) => item.item_id !== itemId)
      setItems(nextItems)
      onPreviewItemsChange?.(nextItems)
      return
    }

    setLoadingItem(itemId)

    startTransition(async () => {
      const result = await removeCartItemAction({ item_id: itemId })
      if (result.success) {
        setItems((current) => current.filter((item) => item.item_id !== itemId))
        if (!result.noOp) router.refresh()
      }
      setLoadingItem(null)
    })
  }

  const handleClear = () => {
    if (isClearing || isPending) return

    if (previewOnly) {
      setItems([])
      onPreviewItemsChange?.([])
      return
    }

    setIsClearing(true)

    startTransition(async () => {
      const result = await clearCartAction(
        targetCompanyId ? { target_company_id: targetCompanyId } : {},
      )
      if (result.success) {
        setItems([])
        if (!result.noOp) router.refresh()
      }
      setIsClearing(false)
    })
  }

  const estimatedSubtotal = items.reduce(
    (total, item) =>
      total + (item.line_total ?? (item.effective_price ?? 0) * item.quantity),
    0,
  )
  const totalUnits = items.reduce((total, item) => total + item.quantity, 0)
  const hasUnavailable = items.some((item) => !item.is_available)

  const drawerFooter =
    items.length > 0 ? (
      <div className="space-y-3">
        {canViewPrices ? (
          <>
            {hasUnavailable && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Alguns itens estão indisponíveis. Remova-os antes de continuar.</span>
              </div>
            )}

            <div className="flex items-start gap-3 rounded-xl bg-neutral-100 px-3.5 py-3 [@media(max-height:600px)]:hidden">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-700" />
              <div>
                <p className="text-xs font-semibold text-neutral-900">Resumo do pedido</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500">
                  Valores, estoque e disponibilidade serão confirmados ao finalizar o pedido.
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-200 pt-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
                    Subtotal estimado
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Condições finais apresentadas antes da confirmação
                  </p>
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-black">
                  {formatPrice(estimatedSubtotal)}
                </span>
              </div>
            </div>

            {previewOnly ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800"
                >
                  Continuar comprando
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <p className="text-center text-[11px] leading-relaxed text-neutral-400 [@media(max-height:650px)]:hidden">
                  Visualização do administrador. Pedidos são finalizados por clientes aprovados.
                </p>
              </>
            ) : (
              <Link
                href="/carrinho"
                onClick={onClose}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800"
              >
                <span>Revisar pedido</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <PriceBlocked status={userStatus} />
            <Link
              href="/cadastro"
              onClick={onClose}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-black text-sm font-bold text-white transition-colors hover:bg-neutral-800"
            >
              Cadastrar minha empresa
            </Link>
          </div>
        )}
      </div>
    ) : undefined

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      title="Meu carrinho"
      subtitle={
        totalUnits === 0
          ? 'Nenhum item adicionado'
          : `${totalUnits} ${totalUnits === 1 ? 'item no pedido' : 'itens no pedido'}`
      }
      titleIcon={
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <ShoppingBag className="h-5 w-5" aria-hidden="true" />
        </span>
      }
      panelClassName="sm:w-[31rem] sm:max-w-[calc(100vw-1.5rem)]"
      headerClassName="min-h-[76px] border-neutral-200 px-5 sm:px-6"
      contentClassName="bg-neutral-50 p-3 sm:p-4"
      footerClassName="border-neutral-200 bg-white p-4 sm:px-6 sm:py-5"
      footer={drawerFooter}
    >
      {items.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center space-y-4 px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm">
            <ShoppingBag className="h-8 w-8" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-950">Seu carrinho está vazio</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-neutral-500">
              Navegue pelo catálogo e adicione os produtos que deseja incluir no pedido.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 h-11 rounded-xl bg-black px-6 text-sm font-bold text-white transition-colors hover:bg-neutral-800"
          >
            Explorar produtos
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1 pb-1 [@media(max-height:600px)]:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Produtos selecionados
            </p>
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing || isPending}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-white hover:text-red-600 disabled:opacity-50"
            >
              {isClearing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Limpar
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isLoading = loadingItem === item.item_id
              const itemError = errors[item.item_id]

              return (
                <article
                  key={item.item_id}
                  className={`rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                    !item.is_available ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          sizes="72px"
                          className="object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-300">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                      {!item.is_available && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/75">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 pr-1 text-sm font-bold leading-snug text-neutral-950">
                            {getProductDisplayName(item.product_name, item.variant_name)}
                          </h4>
                          <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                            Ref. {item.variant_sku ?? item.product_sku}
                          </p>
                          {item.effective_price != null && (
                            <p className="mt-2 text-xs font-semibold text-neutral-700">
                              {formatPrice(item.effective_price)}
                              <span className="font-normal text-neutral-400">
                                {' '}
                                / {item.unit ?? 'UN'}
                              </span>
                            </p>
                          )}
                          {!item.is_available && item.unavailable_reason && (
                            <p className="mt-1 text-[11px] font-medium text-red-600">
                              {item.unavailable_reason}
                            </p>
                          )}
                          {item.is_on_promotion && item.promotional_price != null && (
                            <span className="mt-1.5 inline-block rounded-full bg-neutral-900 px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
                              OFERTA
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(item.item_id)}
                          disabled={isPending || isLoading}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          aria-label={`Remover ${item.product_name}`}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-end justify-between gap-4 border-t border-neutral-100 pt-3">
                    <div>
                      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                        Quantidade
                      </p>
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(quantity) => handleQuantityChange(item.item_id, quantity)}
                        min={item.min_quantity}
                        step={item.multiple_quantity ?? 1}
                        unit={item.unit ?? undefined}
                        disabled={isPending || isLoading}
                      />
                    </div>

                    {canViewPrices ? (
                      <div className="text-right">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
                          Total do item
                        </p>
                        {item.effective_price != null ? (
                          <>
                            <span className="text-base font-extrabold text-black">
                              {formatPrice(
                                item.line_total ?? item.effective_price * item.quantity,
                              )}
                            </span>
                            {item.unit_price != null && item.unit_price !== item.effective_price && (
                              <p className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(item.unit_price * item.quantity)}
                              </p>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-medium text-red-600">Sem preço</span>
                        )}
                      </div>
                    ) : (
                      <span className="flex items-center gap-1 rounded-lg bg-neutral-100 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-600">
                        <Lock className="h-3 w-3" />
                        Preço bloqueado
                      </span>
                    )}
                  </div>

                  {itemError && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[11px] text-red-600">
                      {itemError}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </Drawer>
  )
}
