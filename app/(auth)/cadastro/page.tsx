export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import { ContinuousRegistrationForm } from '@/components/registration/continuous-registration-form'

export const metadata: Metadata = {
  title: 'Cadastro empresarial B2B',
  description:
    'Cadastre seu CNPJ e solicite aprovação comercial para liberar os preços de atacado e faturamento.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function CadastroPage() {
  return (
    <div className="min-h-screen bg-white">
      <ContinuousRegistrationForm />
    </div>
  )
}
