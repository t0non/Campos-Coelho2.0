'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  User,
  ShoppingCart,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Package,
  Keyboard,
  FileText,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils/format'
import type { AuthContext } from '@/types/auth.types'
import type { CartLineItem, CartSummary } from '@/lib/types/cart'
import type { CatalogProduct } from '@/types/product.types'

const CartSlideOver = dynamic(() =>
  import('./cart-slide-over').then((module) => module.CartSlideOver),
)
const MobileNavDrawer = dynamic(() =>
  import('./mobile-nav-drawer').then((module) => module.MobileNavDrawer),
)
const LoginDrawer = dynamic(() =>
  import('@/components/auth/login-drawer').then((module) => module.LoginDrawer),
)

interface HeaderProps {
  authContext?: AuthContext
  cartSummary?: CartSummary
  showNavigation?: boolean
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function Header({
  authContext,
  cartSummary,
  showNavigation = true,
  categories = [],
}: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [adminPreviewItems, setAdminPreviewItems] = useState<CartLineItem[]>([])
  const userMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const user = authContext?.user
  const company = authContext?.company
  const canViewPrices = Boolean(authContext?.canViewPrices)
  const userStatus = company?.status ?? 'visitor'

  const isAdminPreview = user?.role === 'admin'
  const cartItems = isAdminPreview ? adminPreviewItems : (cartSummary?.items ?? [])
  const cartCount = isAdminPreview
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : (cartSummary?.count ?? 0)
  const cartSubtotal = isAdminPreview
    ? cartItems.reduce(
        (total, item) =>
          total + (item.line_total ?? (item.effective_price ?? 0) * item.quantity),
        0,
      )
    : (cartSummary?.subtotal ?? 0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOpenCart = () => setIsCartOpen(true)
    window.addEventListener('cart:open', handleOpenCart)
    return () => window.removeEventListener('cart:open', handleOpenCart)
  }, [])

  useEffect(() => {
    if (!isAdminPreview) return

    const handlePreviewAdd = (event: Event) => {
      const product = (event as CustomEvent<CatalogProduct>).detail
      if (!product?.id) return

      setAdminPreviewItems((currentItems) => {
        const existing = currentItems.find((item) => item.product_id === product.id)
        if (existing) {
          return currentItems.map((item) =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + product.min_quantity,
                  line_total:
                    (item.effective_price ?? 0) *
                    (item.quantity + product.min_quantity),
                }
              : item,
          )
        }

        const effectivePrice = product.price?.effective_price ?? null
        return [
          ...currentItems,
          {
            item_id: `admin-preview-${product.id}`,
            product_id: product.id,
            variant_id: product.primary_variant_id ?? null,
            product_name: product.name,
            product_sku: product.sku,
            variant_name: null,
            variant_sku: product.sku,
            image_url: product.images?.[0] ?? null,
            unit: product.unit,
            min_quantity: product.min_quantity,
            multiple_quantity: product.multiple_quantity ?? 1,
            quantity: product.min_quantity,
            unit_price: product.price?.unit_price ?? null,
            promotional_price: product.price?.promotional_price ?? null,
            effective_price: effectivePrice,
            is_on_promotion: product.price?.is_on_promotion ?? false,
            line_total:
              effectivePrice == null ? null : effectivePrice * product.min_quantity,
            stock_available: 9999,
            is_available: true,
            unavailable_reason: null,
          },
        ]
      })
      setIsCartOpen(true)
    }

    window.addEventListener('cart:preview-add', handlePreviewAdd)
    return () => window.removeEventListener('cart:preview-add', handlePreviewAdd)
  }, [isAdminPreview])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    setIsUserMenuOpen(false)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { error } = await supabase.auth.signOut({ scope: 'local' })

    if (error) {
      console.error('Erro ao encerrar sessão:', error.message)
      setIsLoggingOut(false)
      return
    }

    window.location.replace('/')
  }

  return (
    <>
      {/* Faixa institucional */}
      <div className="flex h-[37px] items-center justify-center bg-black px-4 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-white/80">
        Venda para CNPJ com Inscrição Estadual · Pedido mínimo do site R$ 1.000,00
      </div>

      {/* 2. Main Header Bar - White Background */}
      <header
        className={`sticky top-0 z-40 border-b border-neutral-200 bg-white text-neutral-900 transition-shadow duration-200 ${
          isScrolled ? 'shadow-[0_10px_35px_rgba(0,0,0,0.10)]' : ''
        }`}
      >
        <div className="relative max-w-[1200px] mx-auto">
          {/* Desktop logo spans both header rows, matching the reference layout */}
          <Link
            href="/"
            className="absolute inset-y-0 left-0 z-10 hidden w-[185px] items-center justify-center lg:flex"
          >
            <Image
              src="/logo_campos_coelho.png"
              alt="Campos & Coelho"
              width={225}
              height={56}
              className="h-auto w-[185px] object-contain"
            />
          </Link>

          {/* Row 1: logo, search and actions */}
          <div className="flex h-[90px] items-center gap-4 px-4 lg:ml-[207px] lg:gap-0 lg:px-0">
            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Abrir menu"
              className="flex h-10 w-10 items-center justify-center text-[#171717] lg:hidden"
            >
              <Menu className="h-7 w-7" />
            </button>

            {/* Mobile logo */}
            <Link href="/" className="flex shrink-0 items-center lg:hidden">
              <Image
                src="/logo_campos_coelho.png"
                alt="Campos & Coelho"
                width={225}
                height={56}
                className="h-auto w-[180px] object-contain sm:w-[210px]"
              />
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="mx-4 hidden max-w-[510px] flex-1 items-center md:flex lg:mx-0 lg:max-w-[508px]"
            >
              <input
                ref={searchInputRef}
                type="text"
                aria-label="Buscar produtos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você procura?"
                className="h-11 min-w-0 flex-1 rounded-none border-0 bg-neutral-100 px-5 text-sm text-neutral-900 placeholder-neutral-500 outline-none transition-colors focus:bg-neutral-50 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="h-11 w-[113px] shrink-0 rounded-none border-0 bg-black text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-neutral-800 focus:outline-none focus:ring-0"
              >
                BUSCAR
              </button>
            </form>

            {/* Extra Icons & Account/Cart */}
            <div className="ml-auto flex shrink-0 items-center gap-5 text-[#171717] lg:ml-[34px] lg:gap-7">
              {/* Quick helper icons */}
              <div className="hidden items-center gap-3 border-r border-gray-200 pr-5 text-gray-500 xl:flex">
                <button
                  type="button"
                  title="Buscar por código"
                  aria-label="Buscar por código"
                  onClick={() => searchInputRef.current?.focus()}
                  className="transition-colors hover:text-[#171717]"
                >
                  <Keyboard className="h-7 w-7" />
                </button>
                <Link
                  href="/carrinho"
                  title="Revisar pedido"
                  aria-label="Revisar pedido"
                  className="transition-colors hover:text-[#171717]"
                >
                  <FileText className="h-7 w-7" />
                </Link>
              </div>

              {/* Account Link */}
              <div className="relative" ref={userMenuRef}>
                {user ? (
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    aria-label={`Abrir menu da conta de ${user.full_name}`}
                    className="flex cursor-pointer items-center gap-2.5 transition-colors hover:text-[#050505]"
                  >
                    <User className="h-8 w-8 text-[#171717]" />
                    <div className="hidden flex-col text-left leading-tight sm:flex">
                      <span className="text-sm font-bold text-[#171717]">
                        {user.full_name.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-500">Minha Conta</span>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsLoginOpen(true)}
                    aria-label="Entrar ou cadastrar empresa"
                    className="flex items-center gap-2.5 transition-colors hover:text-[#050505]"
                  >
                    <User className="h-8 w-8 text-[#171717]" />
                    <div className="hidden flex-col text-left leading-tight sm:flex">
                      <span className="text-sm font-bold text-[#171717]">Conta</span>
                      <span className="text-xs text-gray-500">Faça login ou cadastre-se</span>
                    </div>
                  </button>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && user && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/minha-conta"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4" /> Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Package className="h-4 w-4" /> Meus Pedidos
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-[#171717] hover:bg-blue-50"
                      >
                        <ShieldCheck className="h-4 w-4" /> Painel Admin
                      </Link>
                    )}
                    <div className="mt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        aria-busy={isLoggingOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50"
                      >
                        <LogOut className="h-4 w-4" /> {isLoggingOut ? 'Saindo...' : 'Sair'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Link */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Abrir carrinho, ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
                className="flex cursor-pointer items-center gap-2.5 transition-colors hover:text-[#050505]"
              >
                <div className="relative">
                  <ShoppingCart className="h-8 w-8 text-[#171717]" />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-black text-[10px] font-black text-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden flex-col text-left leading-tight sm:flex">
                  <span className="text-sm font-bold text-[#171717]">Carrinho</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {canViewPrices && cartCount > 0 ? formatPrice(cartSubtotal) : 'R$ 0,00'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Search Input */}
          <div className="px-4 pb-2 md:hidden">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                aria-label="Buscar produtos"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você procura?"
                className="flex-1 rounded-none border-0 bg-[#f2f2f2] px-3 py-2 text-xs text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="rounded-none border-0 bg-black px-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-0"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Row 2: Navigation Links */}
          {showNavigation && (
            <nav
              aria-hidden={isScrolled}
              className={`hidden overflow-hidden bg-white transition-all duration-200 ease-out lg:block ${
                isScrolled
                  ? 'pointer-events-none max-h-0 opacity-0'
                  : 'max-h-[43px] opacity-100'
              }`}
            >
              <ul className="ml-[195px] flex h-[43px] min-w-0 items-center text-[13px] font-bold text-[#171717] xl:text-[14px]">
                {/* All Categories Dropdown */}
                <li className="shrink-0">
                  <Link
                    href="/catalogo"
                    className="flex h-[43px] items-center gap-2.5 pr-3 font-extrabold text-[#171717] transition-colors hover:bg-[#f5f5f5]"
                  >
                    <Menu className="h-4 w-4 stroke-[2.5]" />
                    Todas as Categorias
                  </Link>
                </li>

                {/* Dynamic Nav Items */}
                {categories.map((category) => (
                  <li key={category.id} className="shrink-0">
                    <Link
                      href={`/catalogo?cat=${category.slug}`}
                      className="flex h-[43px] items-center whitespace-nowrap px-2.5 text-[#171717] transition-colors hover:bg-[#f5f5f5]"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}

                {/* OPORTUNIDADES Highlight Badge */}
                <li className="ml-auto flex h-[43px] shrink-0 items-center pl-2 pr-1">
                  <Link
                    href="/catalogo?promo=1"
                    className="flex h-[32px] items-center rounded-md bg-black px-3 text-[11px] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800 xl:px-4 xl:text-xs"
                  >
                    OPORTUNIDADES
                  </Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <MobileNavDrawer
          isOpen
          onClose={() => setIsMobileNavOpen(false)}
          authContext={authContext}
          categories={categories}
        />
      )}

      {/* Cart Slide-Over */}
      {isCartOpen && (
        <CartSlideOver
          isOpen
          onClose={() => setIsCartOpen(false)}
          canViewPrices={canViewPrices}
          userStatus={userStatus}
          initialItems={cartItems}
          previewOnly={isAdminPreview}
          onPreviewItemsChange={isAdminPreview ? setAdminPreviewItems : undefined}
        />
      )}

      {!user && isLoginOpen && (
        <LoginDrawer
          isOpen
          onClose={() => setIsLoginOpen(false)}
        />
      )}
    </>
  )
}
