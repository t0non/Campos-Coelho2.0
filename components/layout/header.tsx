'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
import { CartSlideOver } from './cart-slide-over'
import { MobileNavDrawer } from './mobile-nav-drawer'
import { formatPrice } from '@/lib/utils/format'
import type { AuthContext } from '@/types/auth.types'
import type { CartSummary } from '@/lib/types/cart'

interface HeaderProps {
  authContext?: AuthContext
  cartSummary?: CartSummary
}

const navCategories = [
  { label: 'Prendas Juninas', href: '/catalogo?cat=prendas-juninas' },
  { label: 'Lançamentos Disney', href: '/catalogo?cat=disney' },
  { label: 'Inverno', href: '/catalogo?cat=inverno' },
  { label: 'Dia dos Pais', href: '/catalogo?cat=dia-dos-pais' },
  { label: 'Brinquedos', href: '/catalogo?cat=brinquedos' },
  { label: 'Utilidades', href: '/catalogo?cat=utilidades' },
]

export function Header({ authContext, cartSummary }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const user = authContext?.user
  const company = authContext?.company
  const canViewPrices = Boolean(authContext?.canViewPrices)
  const userStatus = company?.status ?? 'visitor'

  const cartItems = cartSummary?.items ?? []
  const cartCount = cartSummary?.count ?? 0
  const cartSubtotal = cartSummary?.subtotal ?? 0

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <>
      {/* 1. TopBar - Deep Navy Blue with Gold/Yellow Text (Importec exact style) */}
      <div className="bg-[#111111] text-[#ffde00] text-xs font-semibold py-1.5 px-4 text-center tracking-wide">
        Venda para CNPJ com Inscrição Estadual - Pedido mínimo do site R$ 1000.00
      </div>

      {/* 2. Main Header Bar - White Background */}
      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-200 ${
          isScrolled ? 'shadow-md' : 'border-b border-gray-100'
        }`}
      >
        {/* Row 1: Logo + Search + Actions */}
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-6">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Abrir menu"
            className="lg:hidden flex items-center justify-center w-10 h-10 text-[#111111]"
          >
            <Menu className="h-7 w-7" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/logo_campos_coelho.png"
              alt="Campos & Coelho"
              width={200}
              height={50}
              className="object-contain"
              priority
            />
          </Link>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex-1 hidden md:flex items-center max-w-2xl mx-6"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você procura?"
                className="w-full bg-[#f2f2f2] border-0 rounded-l-md px-5 py-3 text-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#111111]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#e5e5e5] hover:bg-[#cccccc] text-[#111111] px-7 py-3 rounded-r-md font-black text-sm tracking-wider uppercase transition-colors shrink-0"
            >
              BUSCAR
            </button>
          </form>

          {/* Extra Icons & Account/Cart */}
          <div className="flex items-center gap-5 shrink-0 text-[#111111]">
            {/* Quick helper icons */}
            <div className="hidden xl:flex items-center gap-3 text-gray-500 border-r border-gray-200 pr-5">
              <button title="Busca por Código" className="hover:text-[#111111] transition-colors">
                <Keyboard className="h-7 w-7" />
              </button>
              <button title="Pedido Rápido" className="hover:text-[#111111] transition-colors">
                <FileText className="h-7 w-7" />
              </button>
            </div>

            {/* Account Link */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-[#333333] transition-colors"
                >
                  <User className="h-8 w-8 text-[#111111]" />
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="text-sm font-bold text-[#111111]">
                      {user.full_name.split(' ')[0]}
                    </span>
                    <span className="text-xs text-gray-500">Minha Conta</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2.5 hover:text-[#333333] transition-colors"
                >
                  <User className="h-8 w-8 text-[#111111]" />
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="text-sm font-bold text-[#111111]">Conta</span>
                    <span className="text-xs text-gray-500">Faça login ou cadastre-se</span>
                  </div>
                </Link>
              )}

              {/* User Dropdown */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
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
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#333333] font-bold hover:bg-blue-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> Painel Admin
                    </Link>
                  )}
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Link */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2.5 cursor-pointer hover:text-[#333333] transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="h-8 w-8 text-[#111111]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#e5e5e5] text-[#111111] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#111111]">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-sm font-bold text-[#111111]">Carrinho</span>
                <span className="text-xs text-gray-500 font-semibold">
                  {canViewPrices && cartCount > 0 ? formatPrice(cartSubtotal) : 'R$ 0,00'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-2">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você procura?"
              className="flex-1 bg-[#f2f2f2] border-0 rounded-l-md px-3 py-2 text-xs text-gray-800 placeholder-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#e5e5e5] text-[#111111] px-4 py-2 rounded-r-md font-bold text-xs"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Row 2: Navigation Links — fundo azul idêntico à Importec */}
        <nav className="hidden lg:block bg-[#333333]">
          <div className="max-w-[1400px] mx-auto px-4">
            <ul className="flex items-center gap-0 text-sm font-semibold text-white py-0">
              {/* All Categories Dropdown */}
              <li>
                <Link
                  href="/catalogo"
                  className="flex items-center gap-2 px-4 py-2.5 text-white font-bold hover:bg-[#222222] transition-colors"
                >
                  <Menu className="h-4 w-4 stroke-[2.5]" />
                  Todas as Categorias
                </Link>
              </li>

              {/* Dynamic Nav Items */}
              {navCategories.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="block px-4 py-2.5 text-white hover:bg-[#222222] transition-colors whitespace-nowrap"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}

              {/* OPORTUNIDADES Highlight Badge */}
              <li className="ml-auto">
                <Link
                  href="/catalogo?promo=1"
                  className="bg-[#e5e5e5] hover:bg-[#cccccc] text-[#111111] font-black text-sm uppercase px-4 py-2.5 tracking-wide transition-colors inline-block"
                >
                  OPORTUNIDADES
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        authContext={authContext}
      />

      {/* Cart Slide-Over */}
      <CartSlideOver
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        canViewPrices={canViewPrices}
        userStatus={userStatus}
        initialItems={cartItems}
      />
    </>
  )
}
