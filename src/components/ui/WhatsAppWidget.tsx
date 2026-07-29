"use client";

import React, { useState, useEffect } from "react";
import { siteConfig } from "@/config/site";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppWidget() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 2.5 seconds to attract attention subtly
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!siteConfig.whatsappHref) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="relative bg-white text-stone-800 text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl border border-brand-border/60 shadow-xl max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase mb-0.5">Online agora</span>
            <span className="text-brand-heading">Agende seu horário!</span>
          </div>
          {/* Close tooltip button */}
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-[10px] shadow-sm transition-colors"
            aria-label="Fechar aviso"
          >
            ✕
          </button>
          {/* Little arrow */}
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[6px] border-l-white drop-shadow-[1px_0_1px_rgba(0,0,0,0.05)]" />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={siteConfig.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
        aria-label="Fale conosco no WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
        
        {/* Subtle breathing outer pulse ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping -z-10 group-hover:animate-none" />
      </a>
    </div>
  );
}
