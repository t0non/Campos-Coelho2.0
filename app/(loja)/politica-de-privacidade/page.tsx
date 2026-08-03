export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { Database, FileCheck2, LockKeyhole, Mail, ShieldCheck, UserRoundCheck } from 'lucide-react'
import { Container } from '@/components/ui/container'
import {
  COMPANY_ADDRESS,
  COMPANY_PHONE_DISPLAY,
} from '@/lib/config/contact'
import {
  CONTROLLER_CNPJ,
  CONTROLLER_LEGAL_NAME,
  PRIVACY_CONTACT_EMAIL,
  PRIVACY_POLICY_VERSION,
  REJECTED_DOCUMENT_RETENTION_DAYS,
} from '@/lib/privacy/config'

export const metadata: Metadata = {
  title: 'Pol\u00edtica de privacidade e LGPD',
  description: 'Como a Campos & Coelho usa, protege e elimina dados pessoais.',
}

const processingRows = [
  {
    purpose: 'Analisar e aprovar o cadastro B2B',
    data: 'Contato do respons\u00e1vel, CPF informado, dados empresariais, endere\u00e7o e documentos',
    basis: 'Procedimentos antes do contrato e interesses leg\u00edtimos de preven\u00e7\u00e3o a fraude',
  },
  {
    purpose: 'Criar a conta, autenticar e prestar o servi\u00e7o',
    data: 'Nome, e-mail, telefone, identificadores de sess\u00e3o e registros de acesso',
    basis: 'Execu\u00e7\u00e3o do contrato e seguran\u00e7a do servi\u00e7o',
  },
  {
    purpose: 'Processar pedidos e manter o hist\u00f3rico comercial',
    data: 'Itens, valores, endere\u00e7o, contatos e eventos do pedido',
    basis: 'Execu\u00e7\u00e3o do contrato e cumprimento de obriga\u00e7\u00f5es legais',
  },
  {
    purpose: 'Responder atendimento e exercer direitos de privacidade',
    data: 'Nome, e-mail, CNPJ relacionado, mensagem e evid\u00eancias da resposta',
    basis: 'Cumprimento de obriga\u00e7\u00e3o legal e exerc\u00edcio regular de direitos',
  },
  {
    purpose: 'Enviar novidades e ofertas',
    data: 'E-mail, nome e empresa, quando informados',
    basis: 'Consentimento opcional e revog\u00e1vel',
  },
]

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <Container className="max-w-5xl space-y-6">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-600">
            <ShieldCheck className="h-4 w-4" /> Privacidade &amp; LGPD
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Aviso de Privacidade
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Este aviso explica, de forma direta, quais dados pessoais usamos, por qu&ecirc;, com quem
            podem ser compartilhados, por quanto tempo ficam guardados e como voc&ecirc; pode exercer seus direitos.
          </p>
          <p className="text-xs text-slate-500">
            Vers&atilde;o {PRIVACY_POLICY_VERSION} &middot; atualizada em 3 de agosto de 2026
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Database, 'Necessidade', 'Coletamos somente o que tem finalidade definida.'],
            [LockKeyhole, 'Acesso controlado', 'Dados e documentos ficam restritos a pessoas autorizadas.'],
            [UserRoundCheck, 'Controle do titular', 'Voc\u00ea pode consultar, corrigir e solicitar a elimina\u00e7\u00e3o quando cab\u00edvel.'],
          ].map(([Icon, title, text]) => {
            const CardIcon = Icon as typeof Database
            return (
              <article key={String(title)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <CardIcon className="h-5 w-5 text-orange-600" />
                <h2 className="mt-3 text-sm font-extrabold text-slate-950">{String(title)}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600">{String(text)}</p>
              </article>
            )
          })}
        </div>

        <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-650 shadow-sm sm:p-8">
          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">1. Quem controla os dados</h2>
            <p>
              O controlador &eacute; <strong>{CONTROLLER_LEGAL_NAME}</strong>
              {CONTROLLER_CNPJ ? <> (CNPJ {CONTROLLER_CNPJ})</> : null}, com atendimento em {COMPANY_ADDRESS} e
              telefone {COMPANY_PHONE_DISPLAY}. As decis&otilde;es sobre o uso dos dados neste site s&atilde;o tomadas pelo controlador.
            </p>
            <p>
              O canal preferencial para privacidade &eacute; o nosso{' '}
              <Link href="/privacidade" className="font-bold text-orange-700 underline underline-offset-2">
                Portal de Direitos do Titular
              </Link>
              {PRIVACY_CONTACT_EMAIL ? (
                <>
                  , tamb&eacute;m dispon&iacute;vel pelo e-mail{' '}
                  <a href={`mailto:${PRIVACY_CONTACT_EMAIL}`} className="font-bold text-orange-700 underline">
                    {PRIVACY_CONTACT_EMAIL}
                  </a>
                </>
              ) : null}
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">2. Dados tratados</h2>
            <p>
              Podemos tratar dados do respons&aacute;vel pela empresa, como nome, CPF, e-mail, telefone e cargo;
              dados cadastrais da empresa; endere&ccedil;os; documentos enviados para an&aacute;lise; dados de conta e
              sess&atilde;o; pedidos; mensagens de atendimento; e escolhas de comunica&ccedil;&atilde;o.
            </p>
            <p>
              Evite enviar informa&ccedil;&otilde;es n&atilde;o solicitadas. Nos campos de mensagem, nunca informe senha,
              dados de sa&uacute;de ou outros dados sens&iacute;veis. Nos documentos, o titular pode ocultar informa&ccedil;&otilde;es
              sem rela&ccedil;&atilde;o com a an&aacute;lise, desde que o documento continue v&aacute;lido para confirmar identidade e representa&ccedil;&atilde;o.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-950">3. Finalidades e bases legais</h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-[720px] w-full text-left text-xs leading-5">
                <thead className="bg-slate-100 text-slate-800">
                  <tr>
                    <th className="px-4 py-3 font-extrabold">Para que usamos</th>
                    <th className="px-4 py-3 font-extrabold">Dados envolvidos</th>
                    <th className="px-4 py-3 font-extrabold">Fundamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {processingRows.map((row) => (
                    <tr key={row.purpose} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-900">{row.purpose}</td>
                      <td className="px-4 py-3 text-slate-600">{row.data}</td>
                      <td className="px-4 py-3 text-slate-600">{row.basis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Dados necess&aacute;rios ao cadastro, &agrave; conta e aos pedidos n&atilde;o dependem de consentimento gen&eacute;rico.
              Quando o fundamento for consentimento, como no envio de ofertas, a escolha ser&aacute; separada, opcional e poder&aacute; ser revogada.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">4. Compartilhamento e operadores</h2>
            <p>
              Os dados podem ser acessados por fornecedores de hospedagem, banco de dados, autentica&ccedil;&atilde;o,
              armazenamento, e-mail e suporte, somente na medida necess&aacute;ria para operar o servi&ccedil;o. Tamb&eacute;m podem
              ser compartilhados com autoridades quando houver obriga&ccedil;&atilde;o legal ou ordem v&aacute;lida. N&atilde;o vendemos dados pessoais.
            </p>
            <p>
              Alguns fornecedores globais podem processar informa&ccedil;&otilde;es fora do Brasil, conforme a regi&atilde;o de
              infraestrutura contratada. Nesses casos, o tratamento deve observar as regras da LGPD sobre transfer&ecirc;ncia internacional.
              Informa&ccedil;&otilde;es sobre operadores aplic&aacute;veis podem ser solicitadas pelo Portal de Direitos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">5. Reten&ccedil;&atilde;o e elimina&ccedil;&atilde;o</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>Documentos de cadastro ficam dispon&iacute;veis durante a an&aacute;lise e o relacionamento comercial.</li>
              <li>
                Quando um cadastro &eacute; recusado, os documentos recebem prazo de elimina&ccedil;&atilde;o de{' '}
                {REJECTED_DOCUMENT_RETENTION_DAYS} dias, salvo necessidade legal ou defesa de direitos devidamente justificada.
              </li>
              <li>Dados de pedidos e registros fiscais s&atilde;o mantidos pelos prazos exigidos pela legisla&ccedil;&atilde;o aplic&aacute;vel.</li>
              <li>Dados de marketing ficam ativos at&eacute; a revoga&ccedil;&atilde;o do consentimento.</li>
              <li>Ao fim da finalidade e dos prazos aplic&aacute;veis, os dados devem ser eliminados ou anonimizados.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">6. Seus direitos</h2>
            <p>
              Voc&ecirc; pode pedir confirma&ccedil;&atilde;o do tratamento, acesso, corre&ccedil;&atilde;o, informa&ccedil;&otilde;es sobre compartilhamento,
              anonimiza&ccedil;&atilde;o, bloqueio ou elimina&ccedil;&atilde;o quando cab&iacute;vel, portabilidade nos termos da regulamenta&ccedil;&atilde;o,
              revoga&ccedil;&atilde;o do consentimento, oposi&ccedil;&atilde;o e revis&atilde;o de decis&atilde;o automatizada.
            </p>
            <p>
              O pedido &eacute; gratuito. Para evitar fraude, podemos confirmar a identidade pelo e-mail ou telefone j&aacute; cadastrado.
              A confirma&ccedil;&atilde;o e o acesso simplificado ser&atilde;o providenciados imediatamente quando poss&iacute;vel; a declara&ccedil;&atilde;o
              completa de acesso segue o prazo legal aplic&aacute;vel, atualmente de at&eacute; 15 dias.
            </p>
            <Link href="/privacidade" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-neutral-950 px-5 text-sm font-bold text-white hover:bg-neutral-800">
              Exercer meus direitos
            </Link>
          </section>

          <section id="cookies" className="scroll-mt-24 space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">7. Cookies e armazenamento no navegador</h2>
            <p>
              Atualmente usamos somente recursos necess&aacute;rios para login, seguran&ccedil;a e continuidade do checkout.
              N&atilde;o instalamos cookies de publicidade nem ferramentas de an&aacute;lise de comportamento. Se recursos opcionais
              forem adicionados, este aviso e os controles de escolha dever&atilde;o ser atualizados antes da ativa&ccedil;&atilde;o.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">8. Seguran&ccedil;a e incidentes</h2>
            <p>
              Aplicamos controles de acesso por perfil, valida&ccedil;&atilde;o de sess&atilde;o, registro de opera&ccedil;&otilde;es e acesso tempor&aacute;rio
              aos documentos. Nenhum sistema elimina totalmente os riscos. Incidentes que possam causar risco ou dano relevante
              ser&atilde;o avaliados e, quando exigido, comunicados &agrave; ANPD e aos titulares no prazo regulamentar.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-950">9. Decis&otilde;es e p&uacute;blico do site</h2>
            <p>
              A aprova&ccedil;&atilde;o comercial do cadastro &eacute; realizada por pessoas autorizadas. O site &eacute; voltado a representantes
              de empresas e n&atilde;o &eacute; direcionado a crian&ccedil;as ou adolescentes.
            </p>
          </section>

          <section className="space-y-3 border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-orange-600" />
              <h2 className="text-lg font-extrabold text-slate-950">10. Atualiza&ccedil;&otilde;es</h2>
            </div>
            <p>
              Mudan&ccedil;as relevantes ser&atilde;o indicadas nesta p&aacute;gina com nova data e vers&atilde;o. Quando a lei exigir,
              uma nova escolha ser&aacute; solicitada ao titular.
            </p>
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-600">
              <Mail className="mt-0.5 h-4 w-4 shrink-0" />
              D&uacute;vidas e reclama&ccedil;&otilde;es podem ser enviadas pelo Portal de Direitos. Se a quest&atilde;o n&atilde;o for resolvida,
              o titular tamb&eacute;m pode procurar a ANPD ou os &oacute;rg&atilde;os de defesa do consumidor.
            </div>
          </section>
        </div>
      </Container>
    </div>
  )
}
