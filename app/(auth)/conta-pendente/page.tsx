export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, Mail, SearchCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'

export const metadata: Metadata = {
  title: 'Cadastro em Análise',
}

export default function ContaPendentePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="rounded-full bg-amber-100 p-4">
        <Clock className="h-10 w-10 text-amber-600" />
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900">
        Cadastro em Análise
      </h1>

      <p className="text-gray-600 text-sm max-w-sm">
        Sua empresa está em processo de verificação fiscal e comercial pela nossa equipe. 
        Os preços e funcionalidades de pedido ficarão disponíveis assim que seu cadastro for aprovado.
      </p>

      <ol className="w-full max-w-md space-y-3 text-left">
        <li className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <span><strong>Cadastro recebido.</strong> Seus dados foram enviados com segurança.</span>
        </li>
        <li className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <SearchCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <span><strong>Análise em andamento.</strong> Confirmamos os dados da empresa para liberar a compra B2B.</span>
        </li>
        <li className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <Mail className="mt-0.5 h-5 w-5 shrink-0" />
          <span><strong>Retorno por e-mail.</strong> Você será avisado assim que houver uma decisão.</span>
        </li>
      </ol>

      <div className="w-full rounded-lg bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 space-y-1">
        <p className="font-semibold">Notificação de Aprovação:</p>
        <p>Você receberá uma notificação por e-mail assim que a análise for concluída.</p>
      </div>

      <div className="pt-4 flex flex-col gap-2 w-full">
        <Link href="/catalogo">
          <Button variant="outline" fullWidth>
            Navegar no Catálogo (sem preços)
          </Button>
        </Link>
        <LogoutButton />
      </div>
    </div>
  )
}
