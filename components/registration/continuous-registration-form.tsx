'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Building2,
  Check,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'

import {
  fullRegistrationSchema,
  type FullRegistrationFormValues,
} from '@/lib/validations/registration'
import { maskCNPJ, maskPhone, maskCPF, maskCEP } from '@/lib/utils/masks'
import { submitPublicRegistration } from '@/app/actions/registration'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

interface UploadedFile {
  id: string
  file: File
  fileName: string
  fileSize: number
  category: 'contrato_social' | 'doc_responsavel'
}

const STEPS = [
  {
    number: 1,
    title: 'Cadastro rápido',
    description: 'Empresa e contato',
    icon: Building2,
  },
  {
    number: 2,
    title: 'Perfil comercial',
    description: 'Negócio e endereço',
    icon: MapPin,
  },
  {
    number: 3,
    title: 'Análise cadastral',
    description: 'Documentos e acesso',
    icon: ShieldCheck,
  },
] as const

const STEP_FIELDS: Record<1 | 2, FieldPath<FullRegistrationFormValues>[]> = {
  1: [
    'company.cnpj',
    'company.companyName',
    'responsible.fullName',
    'responsible.whatsapp',
    'responsible.email',
  ],
  2: [
    'company.segment',
    'company.businessType',
    'interests.averageOrderValue',
    'addresses.fiscal.cep',
    'addresses.fiscal.street',
    'addresses.fiscal.number',
    'addresses.fiscal.neighborhood',
    'addresses.fiscal.city',
    'addresses.fiscal.state',
  ],
}

interface DocumentUploadFieldProps {
  title: string
  description: string
  files: UploadedFile[]
  onFile: (file: File) => void
  onRemove: (id: string) => void
}

function DocumentUploadField({
  title,
  description,
  files,
  onFile,
  onRemove,
}: DocumentUploadFieldProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <label
        className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 text-center transition-colors hover:border-slate-500 hover:bg-slate-100"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          const file = event.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
      >
        <UploadCloud className="mb-2 h-8 w-8 text-slate-600" />
        <span className="text-sm font-semibold text-slate-800">
          Selecione ou arraste o arquivo
        </span>
        <span className="mt-1 text-xs text-slate-500">PDF, PNG ou JPG · até 2 MB</span>
        <input
          type="file"
          className="hidden"
          accept=".png,.jpg,.jpeg,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onFile(file)
            event.target.value = ''
          }}
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-green-700" />
                <span className="truncate font-medium text-slate-800">{item.fileName}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="rounded-md p-1 text-slate-500 hover:bg-white hover:text-red-600"
                aria-label={`Remover ${item.fileName}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ContinuousRegistrationForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FullRegistrationFormValues>({
    resolver: zodResolver(fullRegistrationSchema),
    defaultValues: {
      company: {
        cnpj: '',
        companyName: '',
        tradingName: '',
        stateRegistration: '',
        isStateRegistrationExempt: false,
        segment: '',
        businessType: '',
        employeeCount: '',
        phone: '',
        whatsapp: '',
        email: '',
      },
      responsible: {
        fullName: '',
        cpf: '',
        role: 'owner',
        email: '',
        phone: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
      },
      addresses: {
        fiscal: {
          cep: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
        },
        isShippingSameAsFiscal: true,
        isBillingSameAsFiscal: true,
      },
      interests: {
        categories: [],
        purchaseFrequency: '',
        averageOrderValue: '',
        storeCount: '',
        operatingStates: [],
        salesChannel: '',
        howDidYouHear: '',
      },
      consents: {
        termsOfUse: false,
        privacyPolicy: false,
        lgpdDataProcessing: false,
        declarationOfTruth: false,
        receiveNewsletter: false,
      },
    },
  })

  const isStateRegistrationExempt = watch('company.isStateRegistrationExempt')
  const acceptedTerms = watch('consents.termsOfUse')
  const acknowledgedPrivacy = watch('consents.privacyPolicy')
  const declaredTruth = watch('consents.declarationOfTruth')
  const receiveNewsletter = watch('consents.receiveNewsletter')
  const contratoFiles = uploadedFiles.filter((file) => file.category === 'contrato_social')
  const responsibleDocumentFiles = uploadedFiles.filter(
    (file) => file.category === 'doc_responsavel',
  )

  const handleMaskChange = (
    field: FieldPath<FullRegistrationFormValues>,
    value: string,
    mask: (input: string) => string,
  ) => {
    setValue(field, mask(value) as never, { shouldValidate: true })
  }

  const moveToStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step)
    setSubmitError(null)
    requestAnimationFrame(() => {
      document.querySelector('[data-registration-card]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const handleNextStep = async () => {
    if (currentStep === 3) return
    const valid = await trigger(STEP_FIELDS[currentStep], { shouldFocus: true })
    if (!valid) {
      setSubmitError('Revise os campos destacados para continuar.')
      return
    }
    moveToStep((currentStep + 1) as 2 | 3)
  }

  const handleFileUpload = (file: File, category: UploadedFile['category']) => {
    const maxSize = 2 * 1024 * 1024
    const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg'])

    if (file.size > maxSize) {
      setSubmitError(`O arquivo “${file.name}” excede o limite de 2 MB.`)
      return
    }
    if (!allowedTypes.has(file.type)) {
      setSubmitError('Use somente arquivos PDF, PNG ou JPG.')
      return
    }
    if (uploadedFiles.length >= 4) {
      setSubmitError('Você pode enviar no máximo quatro documentos.')
      return
    }

    setSubmitError(null)
    setUploadedFiles((current) => [
      ...current,
      {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        category,
      },
    ])
  }

  const onSubmit = async (data: FullRegistrationFormValues) => {
    if (isSubmitting) return
    if (contratoFiles.length === 0 || responsibleDocumentFiles.length === 0) {
      setSubmitError('Envie o contrato social e um documento do responsável.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const submission = new FormData()
      submission.set('payload', JSON.stringify(data))
      uploadedFiles.forEach((item) => {
        submission.append('documents', item.file, item.fileName)
        submission.append('documentCategories', item.category)
      })

      const result = await submitPublicRegistration(submission)
      if (result.success) {
        router.push(`/cadastro/sucesso?protocol=${encodeURIComponent(result.protocol)}`)
        return
      }

      if (result.field) {
        setError(result.field, { type: 'server', message: result.error })
        if (result.field === 'company.cnpj' || result.field === 'responsible.email') {
          moveToStep(1)
        }
      }
      setSubmitError(result.error || 'Erro ao processar o cadastro. Tente novamente.')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const onInvalid = () => {
    setSubmitError('Revise os campos obrigatórios destacados antes de concluir.')
    requestAnimationFrame(() => {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  return (
    <div className="bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-500">
          <Link href="/" className="font-semibold text-slate-700 hover:underline">
            Início
          </Link>{' '}
          / Cadastro empresarial
        </nav>

        <header className="mb-8 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-600">
            Cadastro empresarial
          </span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Solicite seu acesso em três etapas
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Preencha os dados essenciais. A equipe comercial analisará a solicitação antes
            de liberar preços e pedidos.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Atendemos empresas com CNPJ ativo. A Inscrição Estadual é informada somente
            quando se aplica à atividade da empresa.
          </p>
        </header>

        <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Etapas do cadastro">
          {STEPS.map((step) => {
            const Icon = step.icon
            const completed = currentStep > step.number
            const active = currentStep === step.number
            return (
              <li
                key={step.number}
                className={`rounded-xl border p-3 sm:p-4 ${
                  active
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : completed
                      ? 'border-green-200 bg-green-50 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-500'
                }`}
                aria-current={active ? 'step' : undefined}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      active ? 'bg-white/15' : completed ? 'bg-green-600 text-white' : 'bg-slate-100'
                    }`}
                  >
                    {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="hidden text-xs font-bold sm:inline">Etapa {step.number}</span>
                </div>
                <p className="mt-2 text-xs font-bold leading-tight sm:text-sm">{step.title}</p>
                <p className={`mt-1 hidden text-xs sm:block ${active ? 'text-white/65' : 'text-slate-500'}`}>
                  {step.description}
                </p>
              </li>
            )
          })}
        </ol>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          data-registration-form
          data-registration-card
          noValidate
        >
          <div className="mb-7 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Etapa {currentStep} de 3
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                {STEPS[currentStep - 1].title}
              </h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              * obrigatórios
            </span>
          </div>

          {submitError && (
            <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {currentStep === 1 && (
            <section className="space-y-6" aria-labelledby="step-one-title">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                <h3 id="step-one-title" className="font-bold text-slate-900">
                  Empresa e responsável
                </h3>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="CNPJ"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="00.000.000/0000-00"
                  {...register('company.cnpj')}
                  onChange={(event) =>
                    handleMaskChange('company.cnpj', event.target.value, maskCNPJ)
                  }
                  error={errors.company?.cnpj?.message}
                />
                <Input
                  label="Nome da empresa"
                  required
                  autoComplete="organization"
                  placeholder="Como sua empresa é conhecida"
                  {...register('company.companyName')}
                  error={errors.company?.companyName?.message}
                />
                <Input
                  label="Nome do responsável"
                  required
                  autoComplete="name"
                  placeholder="Nome completo"
                  {...register('responsible.fullName')}
                  error={errors.responsible?.fullName?.message}
                />
                <Input
                  label="WhatsApp"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(31) 99999-9999"
                  {...register('responsible.whatsapp')}
                  onChange={(event) =>
                    handleMaskChange('responsible.whatsapp', event.target.value, maskPhone)
                  }
                  error={errors.responsible?.whatsapp?.message}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="E-mail"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="contato@empresa.com.br"
                    hint="Este e-mail será usado para acessar a conta."
                    {...register('responsible.email')}
                    error={errors.responsible?.email?.message}
                  />
                </div>
              </div>
            </section>
          )}

          {currentStep === 2 && (
            <section className="space-y-8" aria-labelledby="step-two-title">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-orange-600" />
                  <h3 id="step-two-title" className="font-bold text-slate-900">
                    Perfil comercial
                  </h3>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <Select
                    label="Segmento"
                    required
                    placeholder="Selecione"
                    options={[
                      { label: 'Supermercado / Mercearia', value: 'supermercado' },
                      { label: 'Loja de Utilidades', value: 'utilidades' },
                      { label: 'Papelaria / Escritório', value: 'papelaria' },
                      { label: 'Loja de Brinquedos', value: 'brinquedos' },
                      { label: 'Distribuidor / Atacadista', value: 'distribuidor' },
                      { label: 'Outro', value: 'outro' },
                    ]}
                    {...register('company.segment')}
                    error={errors.company?.segment?.message}
                  />
                  <Select
                    label="Tipo de negócio"
                    required
                    placeholder="Selecione"
                    options={[
                      { label: 'Loja física', value: 'loja_fisica' },
                      { label: 'Loja online', value: 'loja_online' },
                      { label: 'Loja física e online', value: 'loja_hibrida' },
                      { label: 'Distribuidor', value: 'distribuidor' },
                      { label: 'Outro', value: 'outro' },
                    ]}
                    {...register('company.businessType')}
                    error={errors.company?.businessType?.message}
                  />
                  <Select
                    label="Volume estimado por pedido"
                    required
                    placeholder="Selecione"
                    options={[
                      { label: 'R$ 1.000 a R$ 5.000', value: '1k_5k' },
                      { label: 'R$ 5.000 a R$ 20.000', value: '5k_20k' },
                      { label: 'Acima de R$ 20.000', value: 'acima_20k' },
                      { label: 'Ainda não sei informar', value: 'nao_informado' },
                    ]}
                    {...register('interests.averageOrderValue')}
                    error={errors.interests?.averageOrderValue?.message}
                  />
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-200 pt-7">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <h3 className="font-bold text-slate-900">Endereço da empresa</h3>
                </div>
                <div className="grid gap-5 sm:grid-cols-4">
                  <Input
                    label="CEP"
                    required
                    inputMode="numeric"
                    placeholder="00000-000"
                    {...register('addresses.fiscal.cep')}
                    onChange={(event) =>
                      handleMaskChange('addresses.fiscal.cep', event.target.value, maskCEP)
                    }
                    error={errors.addresses?.fiscal?.cep?.message}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Endereço"
                      required
                      autoComplete="street-address"
                      {...register('addresses.fiscal.street')}
                      error={errors.addresses?.fiscal?.street?.message}
                    />
                  </div>
                  <Input
                    label="Número"
                    required
                    {...register('addresses.fiscal.number')}
                    error={errors.addresses?.fiscal?.number?.message}
                  />
                  <Input
                    label="Complemento"
                    {...register('addresses.fiscal.complement')}
                  />
                  <Input
                    label="Bairro"
                    required
                    {...register('addresses.fiscal.neighborhood')}
                    error={errors.addresses?.fiscal?.neighborhood?.message}
                  />
                  <Input
                    label="Cidade"
                    required
                    {...register('addresses.fiscal.city')}
                    error={errors.addresses?.fiscal?.city?.message}
                  />
                  <Input
                    label="UF"
                    required
                    maxLength={2}
                    placeholder="MG"
                    className="uppercase"
                    {...register('addresses.fiscal.state')}
                    error={errors.addresses?.fiscal?.state?.message}
                  />
                </div>
              </div>
            </section>
          )}

          {currentStep === 3 && (
            <section className="space-y-8" aria-labelledby="step-three-title">
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-orange-600" />
                  <h3 id="step-three-title" className="font-bold text-slate-900">
                    Dados fiscais
                  </h3>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                  Empresas contribuintes de ICMS devem informar a Inscrição Estadual.
                  Empresas legalmente dispensadas podem marcar a opção de isenção.
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      label="Inscrição Estadual"
                      required={!isStateRegistrationExempt}
                      disabled={isStateRegistrationExempt}
                      placeholder={isStateRegistrationExempt ? 'Empresa isenta' : 'Informe a inscrição'}
                      {...register('company.stateRegistration')}
                      error={errors.company?.stateRegistration?.message}
                    />
                    <Checkbox
                      label="Sou legalmente isento de Inscrição Estadual"
                      checked={isStateRegistrationExempt}
                      onChange={(event) => {
                        setValue('company.isStateRegistrationExempt', event.target.checked, {
                          shouldValidate: true,
                        })
                        if (event.target.checked) {
                          setValue('company.stateRegistration', '', { shouldValidate: true })
                        }
                      }}
                    />
                  </div>
                  <Input
                    label="CPF do responsável"
                    required
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    {...register('responsible.cpf')}
                    onChange={(event) =>
                      handleMaskChange('responsible.cpf', event.target.value, maskCPF)
                    }
                    error={errors.responsible?.cpf?.message}
                  />
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-200 pt-7">
                <div>
                  <h3 className="font-bold text-slate-900">Documentos para análise</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Envie um arquivo de cada tipo. A equipe pode pedir complementos depois.
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <DocumentUploadField
                    title="Contrato social"
                    description="Documento empresarial atualizado"
                    files={contratoFiles}
                    onFile={(file) => handleFileUpload(file, 'contrato_social')}
                    onRemove={(id) =>
                      setUploadedFiles((current) => current.filter((file) => file.id !== id))
                    }
                  />
                  <DocumentUploadField
                    title="Documento do responsável"
                    description="Documento de identificação com foto"
                    files={responsibleDocumentFiles}
                    onFile={(file) => handleFileUpload(file, 'doc_responsavel')}
                    onRemove={(id) =>
                      setUploadedFiles((current) => current.filter((file) => file.id !== id))
                    }
                  />
                </div>
              </div>

              <div className="space-y-5 border-t border-slate-200 pt-7">
                <div>
                  <h3 className="font-bold text-slate-900">Crie sua senha</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Use pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Senha"
                    required
                    type="password"
                    autoComplete="new-password"
                    {...register('responsible.password')}
                    error={errors.responsible?.password?.message}
                  />
                  <Input
                    label="Confirmar senha"
                    required
                    type="password"
                    autoComplete="new-password"
                    {...register('responsible.confirmPassword')}
                    error={errors.responsible?.confirmPassword?.message}
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <Checkbox
                    id="registration-terms"
                    label={
                      <span>
                        Li e aceito os{' '}
                        <Link href="/termos-de-uso" target="_blank" className="font-semibold underline">
                          Termos de Uso
                        </Link>
                        .
                      </span>
                    }
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setValue('consents.termsOfUse', event.target.checked, { shouldValidate: true })
                    }
                  />
                  {errors.consents?.termsOfUse?.message && (
                    <p className="mt-1 pl-6 text-xs text-red-600">{errors.consents.termsOfUse.message}</p>
                  )}
                </div>

                <div>
                  <Checkbox
                    id="registration-privacy"
                    label={
                      <span>
                        Li o{' '}
                        <Link href="/politica-de-privacidade" target="_blank" className="font-semibold underline">
                          Aviso de Privacidade
                        </Link>{' '}
                        e entendi como os dados ser&atilde;o usados na an&aacute;lise cadastral.
                      </span>
                    }
                    checked={acknowledgedPrivacy}
                    onChange={(event) =>
                      setValue('consents.privacyPolicy', event.target.checked, { shouldValidate: true })
                    }
                  />
                  {errors.consents?.privacyPolicy?.message && (
                    <p className="mt-1 pl-6 text-xs text-red-600">{errors.consents.privacyPolicy.message}</p>
                  )}
                </div>

                <div>
                  <Checkbox
                    id="registration-truth"
                    label={
                      <span>
                        Declaro que os dados e documentos enviados s&atilde;o verdadeiros e que posso representar a empresa.
                      </span>
                    }
                    checked={declaredTruth}
                    onChange={(event) =>
                      setValue('consents.declarationOfTruth', event.target.checked, { shouldValidate: true })
                    }
                  />
                  {errors.consents?.declarationOfTruth?.message && (
                    <p className="mt-1 pl-6 text-xs text-red-600">{errors.consents.declarationOfTruth.message}</p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <Checkbox
                    id="registration-newsletter"
                    label="Quero receber novidades e ofertas por e-mail (opcional)."
                    checked={Boolean(receiveNewsletter)}
                    onChange={(event) => setValue('consents.receiveNewsletter', event.target.checked)}
                  />
                  <p className="mt-1 pl-6 text-xs leading-5 text-slate-500">
                    Esta escolha n&atilde;o interfere na an&aacute;lise do cadastro e pode ser cancelada a qualquer momento.
                  </p>
                </div>
              </div>

              <div className="hidden" aria-hidden="true">
                <Checkbox
                  label="Li e aceito os Termos de Uso e a Política de Privacidade e confirmo que os dados enviados são verdadeiros."
                  checked={acceptedTerms}
                  onChange={() => undefined}
                />
                <p className="mt-2 pl-6 text-xs text-slate-500">
                  Consulte os{' '}
                  <Link href="/termos-de-uso" target="_blank" className="font-semibold underline">
                    Termos de Uso
                  </Link>{' '}
                  e a{' '}
                  <Link href="/politica-de-privacidade" target="_blank" className="font-semibold underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
                {(errors.consents?.termsOfUse?.message ||
                  errors.consents?.privacyPolicy?.message ||
                  errors.consents?.lgpdDataProcessing?.message ||
                  errors.consents?.declarationOfTruth?.message) && (
                  <p className="mt-2 pl-6 text-xs text-red-600">
                    Confirme a leitura e a veracidade dos dados para continuar.
                  </p>
                )}
              </div>
            </section>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-between">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => moveToStep((currentStep - 1) as 1 | 2)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Voltar
              </Button>
            ) : (
              <Link
                href="/login"
                className="flex h-11 items-center justify-center px-4 text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                Já tenho cadastro
              </Link>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="w-full bg-black text-white hover:bg-neutral-800 sm:w-auto sm:min-w-40"
              >
                Continuar
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white hover:bg-neutral-800 sm:w-auto sm:min-w-48"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar para análise'
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
