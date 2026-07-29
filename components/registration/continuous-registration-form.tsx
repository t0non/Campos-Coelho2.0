'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UploadCloud, X, FileText } from 'lucide-react'

import { fullRegistrationSchema, type FullRegistrationFormValues } from '@/lib/validations/registration'
import { maskCNPJ, maskPhone, maskCPF, maskCEP } from '@/lib/utils/masks'
import { submitPublicRegistration } from '@/app/actions/registration'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

const INTEREST_CATEGORIES = [
  'Informática', 'Festas', 'Acessórios de uso pessoal', 'Pelúcia',
  'Times de futebol', 'Eletro eletrônicos', 'Brinquedos', 'Automóveis',
  'Perfumaria e beleza', 'Papelaria', "Pet's", 'Esportes e lazer',
  'Decoração', 'Utilidade doméstica', 'Bebês e cia', 'Ferramentas, jardinagem e bricolagem',
]

interface UploadedFile {
  id: string
  file: File
  fileName: string
  fileSize: number
  category: 'contrato_social' | 'doc_responsavel'
}

export function ContinuousRegistrationForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Document upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const contratoRef = useRef<HTMLInputElement>(null)
  const docIdRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FullRegistrationFormValues>({
    resolver: zodResolver(fullRegistrationSchema),
    defaultValues: {
      company: { isStateRegistrationExempt: false },
      addresses: { isShippingSameAsFiscal: true, isBillingSameAsFiscal: true },
      interests: { categories: [], operatingStates: [] },
      consents: {
        termsOfUse: false,
        privacyPolicy: false,
        lgpdDataProcessing: false,
        declarationOfTruth: false,
      },
    },
  })

  const isStateRegistrationExempt = watch('company.isStateRegistrationExempt')

  const onSubmit = async (data: FullRegistrationFormValues) => {
    if (isSubmitting) return
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
      } else {
        setSubmitError(result.error || 'Erro ao processar o cadastro. Tente novamente.')
        setIsSubmitting(false)
        requestAnimationFrame(() => {
          document.querySelector('[data-submit-error]')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        })
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
      )
      setIsSubmitting(false)
    }
  }

  const onInvalid = () => {
    setSubmitError('Revise os campos obrigatórios destacados antes de concluir o cadastro.')
    requestAnimationFrame(() => {
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

  const handleMaskChange = (field: any, val: string, maskFn: (v: string) => string) => {
    setValue(field, maskFn(val), { shouldValidate: true })
  }

  const handleFileUpload = (file: File, category: UploadedFile['category']) => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    const allowedTypes = new Set(['application/pdf', 'image/png', 'image/jpeg'])
    if (file.size > maxSize) {
      alert(`O arquivo "${file.name}" excede o limite de 2MB.`)
      return
    }
    if (!allowedTypes.has(file.type)) {
      alert('Use somente arquivos PDF, PNG ou JPG.')
      return
    }
    if (uploadedFiles.length >= 4) {
      alert('Você pode enviar no máximo quatro documentos.')
      return
    }
    const newFile: UploadedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      category,
    }
    setUploadedFiles((prev) => [...prev, newFile])
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const contratoFiles = uploadedFiles.filter((f) => f.category === 'contrato_social')
  const docIdFiles = uploadedFiles.filter((f) => f.category === 'doc_responsavel')

  return (
    <div className="registration-importec w-full bg-white px-[3.5vw] py-12 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#333333]">
        <span>Você está em:</span>{' '}
        <Link href="/" className="text-[#171717] hover:underline">
          Página inicial
        </Link>
      </nav>

      <div className="mb-12">
        <h1 className="text-3xl sm:text-[34px] leading-tight font-extrabold text-[#171717]">
          Cadastre-se
        </h1>
        <p className="text-[#333333] mt-4">
          Para efetuar seu cadastro, basta preencher o formulário abaixo com os seus dados.
        </p>
        <p className="text-sm text-red-600 mt-3 italic">
          Atenção: Os campos marcados com * são de preenchimento obrigatório.
        </p>
        <p className="text-base text-[#333333] mt-6">
          Cadastro exclusivo para clientes com CNPJ e Inscrição Estadual.
        </p>
        <p className="text-base text-[#333333] mt-6 leading-relaxed">
          Após o envio, os dados serão analisados pela nossa equipe comercial. Em breve entraremos
          em contato para confirmar o cadastro e liberar o acesso às condições de atacado.
        </p>
      </div>

      {submitError && (
        <div data-submit-error role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="space-y-12"
        data-registration-form
      >
        {/* ═══════════════ 1. Cadastro da Empresa ═══════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#171717] mb-6">
            Cadastro da Empresa
          </h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            <Input
              label="CNPJ *"
              placeholder="*CNPJ"
              {...register('company.cnpj')}
              onChange={(e) => handleMaskChange('company.cnpj', e.target.value, maskCNPJ)}
              error={errors.company?.cnpj?.message}
            />
            <Input
              label="Nome Fantasia *"
              placeholder="*Nome Fantasia"
              {...register('company.tradingName')}
              error={errors.company?.tradingName?.message}
            />
            <Input
              label="Razão Social *"
              placeholder="*Razão Social"
              {...register('company.companyName')}
              error={errors.company?.companyName?.message}
            />
            <Input
              label="E-mail *"
              placeholder="*E-mail"
              type="email"
              {...register('company.email')}
              error={errors.company?.email?.message}
            />

            <div className="space-y-2">
              <Input
                label="Inscrição Estadual"
                placeholder="*Inscrição Estadual"
                disabled={isStateRegistrationExempt}
                {...register('company.stateRegistration')}
                error={errors.company?.stateRegistration?.message}
              />
              <Checkbox
                label="Isento de Inscrição Estadual"
                checked={isStateRegistrationExempt}
                onChange={(e) => {
                  setValue('company.isStateRegistrationExempt', e.target.checked)
                  if (e.target.checked) setValue('company.stateRegistration', '')
                }}
              />
            </div>

            <Input
              label="Telefone *"
              placeholder="*Telefone"
              {...register('company.phone')}
              onChange={(e) => handleMaskChange('company.phone', e.target.value, maskPhone)}
              error={errors.company?.phone?.message}
            />

            <Select
              label="Segmento de Atuação *"
              placeholder="*Segmento de Atuação"
              options={[
                { label: 'Supermercado / Mercearia', value: 'supermercado' },
                { label: 'Loja de Utilidades Domésticas', value: 'utilidades' },
                { label: 'Papelaria & Escritório', value: 'papelaria' },
                { label: 'Loja de Brinquedos', value: 'brinquedos' },
                { label: 'Distribuidor / Atacadista', value: 'distribuidor' },
                { label: 'Outro Segmento', value: 'outro' },
              ]}
              {...register('company.segment')}
              error={errors.company?.segment?.message}
            />

            <Select
              label="Tipo de Negócio *"
              placeholder="*Tipo de Negócio"
              options={[
                { label: 'Matriz', value: 'matriz' },
                { label: 'Filial', value: 'filial' },
                { label: 'MEI', value: 'mei' },
                { label: 'ME / EPP', value: 'me_epp' },
              ]}
              {...register('company.businessType')}
              error={errors.company?.businessType?.message}
            />

            <Select
              label="Número de funcionários *"
              placeholder="*Número de funcionários"
              options={[
                { label: '1 a 5', value: '1-5' },
                { label: '6 a 15', value: '6-15' },
                { label: '16 a 50', value: '16-50' },
                { label: 'Mais de 50', value: '50+' },
              ]}
              {...register('company.employeeCount')}
              error={errors.company?.employeeCount?.message}
            />

            <Input
              label="WhatsApp"
              placeholder="WhatsApp"
              {...register('company.whatsapp')}
              onChange={(e) => handleMaskChange('company.whatsapp', e.target.value, maskPhone)}
              error={errors.company?.whatsapp?.message}
            />
          </div>
        </section>

        {/* ═══════════════ 2. Documentos ═══════════════ */}
        <section>
          <h2 className="sr-only">Documentos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contrato Social */}
            <div>
              <p className="text-[#333333] text-sm mb-2">
                *Inserir contrato social
              </p>
              <label
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer bg-[#fcfcfc] hover:bg-[#f7f9fc] transition-colors"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileUpload(file, 'contrato_social')
                }}
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <UploadCloud className="w-10 h-10 mb-2 text-[#171717]" />
                  <p className="text-sm text-gray-500">
                    Arraste e solte seus arquivos ou{' '}
                    <span className="text-[#171717] font-semibold">Clique para localizar</span>
                  </p>
                </div>
                <input
                  ref={contratoRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'contrato_social')
                    e.target.value = ''
                  }}
                />
              </label>
              <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400">
                <span>Formatos suportados: PNG, JPG e PDF</span>
                <span>Tamanho máximo: 2MB</span>
              </div>
              {/* Lista de arquivos do contrato social */}
              {contratoFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {contratoFiles.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[#111111] shrink-0" />
                        <span className="truncate text-gray-800">{f.fileName}</span>
                        <span className="text-gray-400 text-xs shrink-0">
                          ({(f.fileSize / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="text-red-500 hover:text-red-700 ml-2 shrink-0"
                        aria-label="Remover arquivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Documento de Identidade do Responsável */}
            <div>
              <p className="text-[#333333] text-sm mb-2">
                *Inserir documento de identidade da pessoa responsável
              </p>
              <label
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer bg-[#fcfcfc] hover:bg-[#f7f9fc] transition-colors"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) handleFileUpload(file, 'doc_responsavel')
                }}
              >
                <div className="flex flex-col items-center justify-center py-4">
                  <UploadCloud className="w-10 h-10 mb-2 text-[#171717]" />
                  <p className="text-sm text-gray-500">
                    Arraste e solte seus arquivos ou{' '}
                    <span className="text-[#171717] font-semibold">Clique para localizar</span>
                  </p>
                </div>
                <input
                  ref={docIdRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'doc_responsavel')
                    e.target.value = ''
                  }}
                />
              </label>
              <div className="flex justify-between items-center mt-2 text-[11px] text-gray-400">
                <span>Formatos suportados: PNG, JPG e PDF</span>
                <span>Tamanho máximo: 2MB</span>
              </div>
              {/* Lista de arquivos do documento de identidade */}
              {docIdFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {docIdFiles.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-[#111111] shrink-0" />
                        <span className="truncate text-gray-800">{f.fileName}</span>
                        <span className="text-gray-400 text-xs shrink-0">
                          ({(f.fileSize / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(f.id)}
                        className="text-red-500 hover:text-red-700 ml-2 shrink-0"
                        aria-label="Remover arquivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. Áreas de interesse ═══════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#171717] mb-6">
            Áreas de interesse
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {INTEREST_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={category}
                  {...register('interests.categories')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
          {errors.interests?.categories?.message && (
            <p className="text-red-500 text-xs mt-2">{errors.interests.categories.message}</p>
          )}

          <div className="grid sm:grid-cols-4 gap-4 mt-6">
            <Select
              label="Canal de Vendas *"
              placeholder="*Canal de Vendas"
              options={[
                { label: 'Loja Física', value: 'fisica' },
                { label: 'Online', value: 'online' },
                { label: 'Ambos', value: 'ambos' },
              ]}
              {...register('interests.salesChannel')}
              error={errors.interests?.salesChannel?.message}
            />
            <Select
              label="Frequência de Compra *"
              placeholder="*Frequência de Compra"
              options={[
                { label: 'Semanal', value: 'semanal' },
                { label: 'Quinzenal', value: 'quinzenal' },
                { label: 'Mensal', value: 'mensal' },
              ]}
              {...register('interests.purchaseFrequency')}
              error={errors.interests?.purchaseFrequency?.message}
            />
            <Select
              label="Volume Médio *"
              placeholder="*Volume Médio"
              options={[
                { label: 'Até R$ 5.000', value: 'ate_5k' },
                { label: 'R$ 5.000 a R$ 20.000', value: '5k_20k' },
                { label: 'Acima de R$ 20.000', value: 'acima_20k' },
              ]}
              {...register('interests.averageOrderValue')}
              error={errors.interests?.averageOrderValue?.message}
            />
            <Select
              label="Como nos conheceu? *"
              placeholder="*Como nos conheceu?"
              options={[
                { label: 'Google', value: 'google' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Indicação', value: 'indicacao' },
                { label: 'Outro', value: 'outro' },
              ]}
              {...register('interests.howDidYouHear')}
              error={errors.interests?.howDidYouHear?.message}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <Select
              label="Número de Lojas *"
              placeholder="*Número de Lojas"
              options={[
                { label: '1 loja', value: '1' },
                { label: '2 a 5 lojas', value: '2-5' },
                { label: 'Mais de 5', value: '5+' },
              ]}
              {...register('interests.storeCount')}
              error={errors.interests?.storeCount?.message}
            />
            <div className="sm:col-span-2">
              <p className="mt-1 text-sm font-medium text-gray-700">
                Onde sua empresa vende ou atende clientes? *
              </p>
              <p className="mb-3 mt-1 text-xs text-gray-500">
                Selecione os estados em que sua empresa comercializa ou entrega produtos.
              </p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-9">
                {[
                  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
                  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
                  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
                ].map((state) => (
                  <label key={state} className="flex items-center gap-1.5 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      value={state}
                      {...register('interests.operatingStates')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    {state}
                  </label>
                ))}
              </div>
              {errors.interests?.operatingStates?.message && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.interests.operatingStates.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ 4. Endereço ═══════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#171717] mb-6">Endereço</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <Input
              label="CEP *"
              placeholder="*CEP"
              {...register('addresses.fiscal.cep')}
              onChange={(e) =>
                handleMaskChange('addresses.fiscal.cep', e.target.value, maskCEP)
              }
              error={errors.addresses?.fiscal?.cep?.message}
            />
            <div className="sm:col-span-2">
              <Input
                label="Endereço *"
                placeholder="*Endereço"
                {...register('addresses.fiscal.street')}
                error={errors.addresses?.fiscal?.street?.message}
              />
            </div>
            <Input
              label="Número *"
              placeholder="*Número"
              {...register('addresses.fiscal.number')}
              error={errors.addresses?.fiscal?.number?.message}
            />

            <Input
              label="Complemento"
              placeholder="Complemento"
              {...register('addresses.fiscal.complement')}
            />
            <Input
              label="Bairro *"
              placeholder="*Bairro"
              {...register('addresses.fiscal.neighborhood')}
              error={errors.addresses?.fiscal?.neighborhood?.message}
            />
            <Input
              label="Cidade *"
              placeholder="*Cidade"
              {...register('addresses.fiscal.city')}
              error={errors.addresses?.fiscal?.city?.message}
            />
            <Input
              label="Estado *"
              placeholder="*Estado"
              {...register('addresses.fiscal.state')}
              error={errors.addresses?.fiscal?.state?.message}
            />
          </div>

          <div className="mt-4 text-xs text-gray-600">
            <p>
              As informações relativas à razão social e endereço são as mesmas da base de dados da
              Receita Federal para o CNPJ informado. Aceito receber informações de acordo com a
              Política de Segurança (Lei Geral de Proteção de Dados).
            </p>
          </div>
        </section>

        {/* ═══════════════ 5. Contato Responsável ═══════════════ */}
        <section>
          <h2 className="text-xl font-extrabold text-[#171717] mb-6">
            Contato Responsável
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Input
              label="Nome Completo *"
              placeholder="*Nome Completo"
              {...register('responsible.fullName')}
              error={errors.responsible?.fullName?.message}
            />
            <Input
              label="CPF *"
              placeholder="*CPF"
              {...register('responsible.cpf')}
              onChange={(e) => handleMaskChange('responsible.cpf', e.target.value, maskCPF)}
              error={errors.responsible?.cpf?.message}
            />
            <Select
              label="Cargo *"
              placeholder="*Cargo"
              options={[
                { label: 'Proprietário(a)', value: 'proprietario' },
                { label: 'Comprador(a)', value: 'comprador' },
                { label: 'Gerente', value: 'gerente' },
                { label: 'Outro', value: 'outro' },
              ]}
              {...register('responsible.role')}
              error={errors.responsible?.role?.message}
            />

            <Input
              label="E-mail *"
              placeholder="*E-mail"
              type="email"
              {...register('responsible.email')}
              error={errors.responsible?.email?.message}
            />
            <Input
              label="Telefone *"
              placeholder="*Telefone"
              {...register('responsible.phone')}
              onChange={(e) => handleMaskChange('responsible.phone', e.target.value, maskPhone)}
              error={errors.responsible?.phone?.message}
            />
            <Input
              label="WhatsApp *"
              placeholder="*WhatsApp"
              {...register('responsible.whatsapp')}
              onChange={(e) =>
                handleMaskChange('responsible.whatsapp', e.target.value, maskPhone)
              }
              error={errors.responsible?.whatsapp?.message}
            />

            <Input
              label="Senha *"
              placeholder="*Senha"
              type="password"
              {...register('responsible.password')}
              error={errors.responsible?.password?.message}
            />
            <Input
              label="Confirmar Senha *"
              placeholder="*Confirmar Senha"
              type="password"
              {...register('responsible.confirmPassword')}
              error={errors.responsible?.confirmPassword?.message}
            />
          </div>
        </section>

        {/* ═══════════════ 6. Termos e Condições ═══════════════ */}
        <section className="border-t border-slate-200 pt-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-[#171717]">
                Termos e declarações
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Revise e confirme cada item antes de concluir o cadastro.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[#f0f0f0] px-3 py-1 text-xs font-bold text-[#050505]">
              4 confirmações obrigatórias
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Controller
              name="consents.termsOfUse"
              control={control}
              render={({ field }) => (
                <div className="rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-[#171717]/40">
                  <Checkbox
                    label={
                      <span className="block leading-snug">
                        <strong className="block text-[#171717]">Termos de Uso</strong>
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Li e aceito as regras de utilização da plataforma.
                        </span>
                      </span>
                    }
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="consents.privacyPolicy"
              control={control}
              render={({ field }) => (
                <div className="rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-[#171717]/40">
                  <Checkbox
                    label={
                      <span className="block leading-snug">
                        <strong className="block text-[#171717]">Política de Privacidade</strong>
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Declaro que li como os meus dados serão utilizados.
                        </span>
                      </span>
                    }
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="consents.lgpdDataProcessing"
              control={control}
              render={({ field }) => (
                <div className="rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-[#171717]/40">
                  <Checkbox
                    label={
                      <span className="block leading-snug">
                        <strong className="block text-[#171717]">Tratamento de dados</strong>
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Autorizo o tratamento dos dados para análise e gestão do cadastro.
                        </span>
                      </span>
                    }
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <Controller
              name="consents.declarationOfTruth"
              control={control}
              render={({ field }) => (
                <div className="rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-[#171717]/40">
                  <Checkbox
                    label={
                      <span className="block leading-snug">
                        <strong className="block text-[#171717]">Veracidade das informações</strong>
                        <span className="mt-1 block text-xs font-normal text-slate-500">
                          Confirmo que os dados e documentos informados são verdadeiros.
                        </span>
                      </span>
                    }
                    checked={field.value}
                    onChange={field.onChange}
                  />
                </div>
              )}
            />
            <div className="text-red-500 text-xs md:col-span-2">
              {errors.consents?.termsOfUse?.message ||
                errors.consents?.privacyPolicy?.message ||
                errors.consents?.lgpdDataProcessing?.message ||
                errors.consents?.declarationOfTruth?.message}
            </div>
          </div>
        </section>

        {/* ═══════════════ Botão de Submit ═══════════════ */}
        {submitError && (
          <div data-submit-error role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {submitError}
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-black px-12 py-6 text-lg font-extrabold text-white transition-colors hover:bg-neutral-800 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                PROCESSANDO...
              </>
            ) : (
              'CADASTRAR'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
