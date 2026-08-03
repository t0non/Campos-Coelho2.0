export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Termos de uso comercial',
  description: 'Condições gerais de uso e políticas comerciais para compras no atacado B2B.',
}

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-12">
      <Container className="max-w-4xl space-y-6">
        <div className="border-b border-slate-200 pb-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <FileText className="h-4 w-4" />
            <span>Documento institucional</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Termos de Uso Comercial</h1>
          <p className="text-xs text-slate-500">Última atualização: Julho de 2026</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Objeto e Condições B2B</h2>
            <p>
              A plataforma Campos &amp; Coelho destina-se exclusivamente à comercialização de
              produtos no atacado para pessoas jurídicas devidamente registradas com CNPJ
              ativo. A visualização de preços e a realização de pedidos dependem da aprovação
              prévia do cadastro comercial.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. Cadastro e Aprovação Comercial</h2>
            <p>
              Ao solicitar o cadastro, a empresa deve fornecer informações verdadeiras e
              atualizadas. A equipe comercial pode pedir documentos adicionais antes de
              liberar o acesso às condições de compra.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Pedidos Mínimos e Condições de Pagamento</h2>
            <p>
              Os pedidos respeitam o valor mínimo e as quantidades indicadas no catálogo.
              Formas de pagamento, retirada e demais condições são apresentadas ao cliente
              aprovado antes da confirmação do pedido.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Conta, Seguran&ccedil;a e Privacidade</h2>
            <p>
              O respons&aacute;vel deve manter a senha em sigilo e informar qualquer uso indevido da conta.
              O tratamento de dados pessoais segue o{' '}
              <a href="/politica-de-privacidade" className="font-semibold underline underline-offset-2">
                Aviso de Privacidade
              </a>
              . A aceita&ccedil;&atilde;o destes termos n&atilde;o representa consentimento para receber publicidade.
            </p>
          </section>
        </div>
      </Container>
    </div>
  )
}
