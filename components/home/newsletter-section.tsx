'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle2, Send } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { subscribeNewsletterAction } from '@/app/actions/newsletter'

const newsletterSchema = z.object({
  name: z.string().min(2, 'Informe seu nome.'),
  email: z.string().email('E-mail inválido.'),
  whatsapp: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, 'Aceite a política de privacidade.'),
})

type NewsletterInput = z.infer<typeof newsletterSchema>

export function NewsletterSection() {
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      terms: true,
    },
  })

  const onSubmit = async (data: NewsletterInput) => {
    const result = await subscribeNewsletterAction({
      name: data.name,
      email: data.email,
    })
    if (!result.success) return
    setSuccess(true)
    reset()
  }

  return (
    <section className="site-section select-none bg-neutral-100 text-white">
      <Container>
        <div className="rounded-3xl border border-white/10 bg-black p-8 shadow-[0_20px_55px_rgba(0,0,0,0.16)] sm:p-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Lado Esquerdo - Título & Descrição */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <Mail className="h-5 w-5" />
              </div>
              <h2 className="site-section-title text-white">
                Receba Novidades & Oportunidades
              </h2>
              <p className="text-xs leading-relaxed text-neutral-400 sm:text-sm">
                Cadastre-se para acompanhar lançamentos de produtos, campanhas de temporada e promoções de atacado.
              </p>
            </div>

            {/* Lado Direito - Formulário */}
            <div className="lg:col-span-7">
              {success ? (
                <div className="flex items-center gap-3 rounded-2xl bg-green-500/20 border border-green-500/40 p-6 text-green-300">
                  <CheckCircle2 className="h-8 w-8 shrink-0 text-green-400" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Inscrição realizada com sucesso!</h3>
                    <p className="text-xs text-green-200 mt-0.5">
                      Você receberá nossas novidades comerciais em primeira mão.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Seu nome"
                      {...register('name')}
                      error={errors.name?.message}
                      className="border-white/15 bg-neutral-950 text-white placeholder:text-neutral-600"
                    />
                    <Input
                      type="email"
                      placeholder="Seu e-mail empresarial"
                      {...register('email')}
                      error={errors.email?.message}
                      className="border-white/15 bg-neutral-950 text-white placeholder:text-neutral-600"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="text-slate-300">
                      <Checkbox
                        label="Concordo em receber novidades comerciais por e-mail"
                        {...register('terms')}
                        className="border-navy-600 bg-navy-900"
                      />
                      {errors.terms && (
                        <p className="text-xs text-red-400 mt-1">{errors.terms.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      loading={isSubmitting}
                      className="w-full bg-white px-8 text-black hover:bg-neutral-200 sm:w-auto"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Inscrever-se
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
