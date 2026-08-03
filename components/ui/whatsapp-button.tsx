import Image from 'next/image'
import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from '@/lib/config/contact'

export function WhatsAppButton() {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE)
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`

  return (
    <div className="group fixed bottom-5 right-5 z-40 flex items-center gap-3 sm:bottom-6 sm:right-6">
      <div
        className="pointer-events-none hidden translate-x-2 items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 sm:flex"
        role="tooltip"
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span>Fale com nosso consultor B2B</span>
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atendimento via WhatsApp B2B"
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(37,211,102,0.38)] transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30 sm:h-16 sm:w-16"
      >
        <Image
          src="/widget_whatsapp.png"
          alt=""
          width={300}
          height={300}
          sizes="(min-width: 640px) 64px, 56px"
          className="h-full w-full object-contain"
        />
      </a>
    </div>
  )
}
