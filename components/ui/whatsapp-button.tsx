'use client'

import { useState } from 'react'
import Image from 'next/image'
import { mockCompany } from '@/lib/mocks/mock-company'

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false)

  const encodedMessage = encodeURIComponent(mockCompany.contact.whatsappMessage)
  const whatsappUrl = `https://wa.me/55${mockCompany.contact.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6">
      {/* Tooltip */}
      <div
        className={`hidden sm:flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xl transition-all duration-200 ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        }`}
        role="tooltip"
      >
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span>Fale com nosso consultor B2B</span>
      </div>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label="Atendimento via WhatsApp B2B"
        className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)] transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-500/30"
      >
        <Image
          src="/widget_whatsapp.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 object-contain"
          priority
        />
      </a>
    </div>
  )
}
