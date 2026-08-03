import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { PrivacyRequestForm } from '@/components/privacy/privacy-request-form'
import { NewsletterUnsubscribeForm } from '@/components/privacy/newsletter-unsubscribe-form'

export const metadata: Metadata = {
  title: 'Seus direitos de privacidade',
  description: 'Canal para exercer direitos relacionados aos seus dados pessoais.',
}

export default function PrivacyRightsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <Container className="max-w-3xl space-y-7">
        <div>
          <Link href="/politica-de-privacidade" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-950">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Aviso de Privacidade
          </Link>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            <ShieldCheck className="h-4 w-4" /> Seus dados, seus direitos
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Solicita&ccedil;&otilde;es de privacidade</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Use este canal para consultar, corrigir, eliminar ou entender o uso dos seus dados. A solicita&ccedil;&atilde;o &eacute; gratuita.
          </p>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
          Para proteger seus dados, poderemos confirmar sua identidade por um canal j&aacute; cadastrado antes de responder.
          Nunca pediremos sua senha.
        </div>

        <PrivacyRequestForm />

        <section className="space-y-3 border-t border-slate-200 pt-7">
          <h2 className="text-lg font-extrabold text-slate-950">N&atilde;o quer mais receber novidades?</h2>
          <p className="text-sm leading-6 text-slate-600">Cancele o consentimento de marketing usando o mesmo e-mail da inscri&ccedil;&atilde;o.</p>
          <NewsletterUnsubscribeForm />
        </section>
      </Container>
    </div>
  )
}
