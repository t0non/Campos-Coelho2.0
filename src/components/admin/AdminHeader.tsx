"use client";

import React from "react";
import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/actions";
import { LogOut, ExternalLink, Sparkles } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

interface AdminHeaderProps {
  userEmail?: string;
}

export function AdminHeader({ userEmail }: AdminHeaderProps) {
  return (
    <header className="bg-brand-dark text-white border-b border-stone-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo variant="light" size="small" />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider">
            Painel de Combos
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm">
          {userEmail && (
            <span className="hidden md:inline-block text-brand-cream/70 font-mono">
              {userEmail}
            </span>
          )}

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 text-brand-cream hover:bg-stone-800 transition-colors"
          >
            <span>Ver Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-brand-primary" />
          </Link>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
