import React from "react";
import { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { loginAdminAction } from "@/app/admin/actions";
import { Lock, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login Administrativo | Shaiff Cabeleireiros",
  robots: {
    index: false,
    follow: false,
  },
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden text-brand-heading">
      {/* Background Subtle Warm Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-cream/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Logo variant="dark" size="large" />
          </div>
          <h1 className="font-heading text-2xl font-semibold text-brand-heading tracking-tight">
            Painel Administrativo
          </h1>
          <p className="text-xs text-brand-bodyText/80 font-sans">
            Área restrita para gestão de combos promocionais do Shaiff Cabeleireiros.
          </p>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form action={loginAdminAction} className="bg-brand-surface p-6 sm:p-8 rounded-2xl border border-brand-border/80 shadow-lg space-y-5 text-left">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-brand-heading mb-1.5 uppercase tracking-wider">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-bodyText/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                id="email"
                name="email"
                required
                autoComplete="username"
                defaultValue="shaiffadmin"
                placeholder="shaiffadmin"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors font-sans"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-brand-heading mb-1.5 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-bodyText/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                id="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-brand-border bg-brand-background text-brand-heading text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors font-sans"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-brand-primary text-white text-sm font-semibold hover:bg-brand-primaryHover transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Entrar no Painel</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-brand-bodyText/70 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao site do Shaiff</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
