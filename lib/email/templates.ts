export interface EmailContent {
  subject: string
  html: string
  text: string
}

interface CallToAction {
  label: string
  url: string
}

interface BrandedEmailInput {
  preheader: string
  eyebrow: string
  title: string
  paragraphs: string[]
  details?: Array<{ label: string; value: string }>
  message?: string
  callToAction?: CallToAction
  notice?: string
}

const COMPANY_ADDRESS =
  'Av. Dr. Cristiano Guimarães, 975 — Planalto, Belo Horizonte — MG'
const COMPANY_PHONE = '(31) 3441-9534'

export function escapeEmailHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function safeUrl(value: string): string {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '#'
  } catch {
    return '#'
  }
}

function renderDetails(details: BrandedEmailInput['details']): string {
  if (!details?.length) return ''

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
      style="margin:24px 0;background:#f7f7f7;border:1px solid #e5e5e5;border-radius:12px;">
      ${details
        .map(
          ({ label, value }) => `
            <tr>
              <td style="padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:13px;color:#666666;">
                ${escapeEmailHtml(label)}
              </td>
              <td align="right" style="padding:12px 16px;border-bottom:1px solid #e8e8e8;font-size:13px;font-weight:700;color:#111111;">
                ${escapeEmailHtml(value)}
              </td>
            </tr>`,
        )
        .join('')}
    </table>`
}

function renderBrandedEmail(input: BrandedEmailInput, logoUrl: string): string {
  const cta = input.callToAction
    ? `
      <tr>
        <td align="center" style="padding:4px 34px 30px;">
          <a href="${escapeEmailHtml(safeUrl(input.callToAction.url))}"
            style="display:inline-block;min-width:210px;padding:15px 24px;border-radius:9px;background:#111111;color:#ffffff;font-size:15px;line-height:20px;font-weight:700;text-align:center;text-decoration:none;">
            ${escapeEmailHtml(input.callToAction.label)}
          </a>
        </td>
      </tr>`
    : ''

  const message = input.message
    ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="margin:22px 0;background:#f7f7f7;border-left:4px solid #111111;border-radius:8px;">
        <tr>
          <td style="padding:17px 18px;font-size:14px;line-height:22px;color:#333333;">
            ${escapeEmailHtml(input.message).replaceAll('\n', '<br />')}
          </td>
        </tr>
      </table>`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeEmailHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;color:#171717;font-family:Montserrat,Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeEmailHtml(input.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f6;">
      <tr>
        <td align="center" style="padding:30px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
            style="max-width:600px;background:#ffffff;border:1px solid #e3e3e3;border-radius:16px;overflow:hidden;">
            <tr>
              <td align="center" style="padding:28px;border-bottom:1px solid #eeeeee;">
                <img src="${escapeEmailHtml(safeUrl(logoUrl))}" width="220"
                  alt="Campos &amp; Coelho Distribuidora e Atacado"
                  style="display:block;width:220px;max-width:100%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:36px 34px 20px;">
                <p style="margin:0 0 10px;font-size:11px;line-height:17px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase;color:#666666;">
                  ${escapeEmailHtml(input.eyebrow)}
                </p>
                <h1 style="margin:0 0 16px;font-size:27px;line-height:35px;font-weight:800;color:#111111;">
                  ${escapeEmailHtml(input.title)}
                </h1>
                ${input.paragraphs
                  .map(
                    (paragraph) => `
                      <p style="margin:0 0 13px;font-size:15px;line-height:25px;color:#4b5563;">
                        ${escapeEmailHtml(paragraph)}
                      </p>`,
                  )
                  .join('')}
                ${renderDetails(input.details)}
                ${message}
              </td>
            </tr>
            ${cta}
            ${
              input.notice
                ? `<tr><td style="padding:0 34px 32px;">
                    <div style="padding:16px 18px;border-radius:10px;background:#fafafa;font-size:12px;line-height:19px;color:#666666;">
                      ${escapeEmailHtml(input.notice)}
                    </div>
                  </td></tr>`
                : ''
            }
            <tr>
              <td align="center" style="padding:22px 28px;border-top:1px solid #eeeeee;background:#fafafa;font-size:11px;line-height:18px;color:#737373;">
                Campos &amp; Coelho Distribuidora e Atacado<br />
                ${escapeEmailHtml(COMPANY_ADDRESS)}<br />
                Atendimento: ${escapeEmailHtml(COMPANY_PHONE)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function textFrom(input: BrandedEmailInput): string {
  return [
    input.title,
    '',
    ...input.paragraphs,
    ...(input.details?.map(({ label, value }) => `${label}: ${value}`) ?? []),
    ...(input.message ? ['', `Mensagem: ${input.message}`] : []),
    ...(input.callToAction
      ? ['', `${input.callToAction.label}: ${input.callToAction.url}`]
      : []),
    ...(input.notice ? ['', input.notice] : []),
    '',
    'Campos & Coelho Distribuidora e Atacado',
    COMPANY_ADDRESS,
    `Atendimento: ${COMPANY_PHONE}`,
  ].join('\n')
}

function content(
  subject: string,
  input: BrandedEmailInput,
  logoUrl: string,
): EmailContent {
  return {
    subject,
    html: renderBrandedEmail(input, logoUrl),
    text: textFrom(input),
  }
}

export function registrationReceivedEmail(input: {
  contactName: string
  companyName: string
  protocol: string
  siteUrl: string
}): EmailContent {
  const body: BrandedEmailInput = {
    preheader: `Recebemos o cadastro da ${input.companyName}.`,
    eyebrow: 'Cadastro empresarial',
    title: 'Cadastro enviado com sucesso',
    paragraphs: [
      `Olá, ${input.contactName}. Recebemos os dados e documentos da ${input.companyName}.`,
      'Nossa equipe fará a análise comercial em até 5 dias úteis. Você receberá outro e-mail com a aprovação ou com as orientações necessárias.',
    ],
    details: [{ label: 'Protocolo', value: input.protocol }],
    callToAction: {
      label: 'Acompanhar cadastro',
      url: `${input.siteUrl}/minha-conta`,
    },
    notice: 'Guarde este protocolo. Não é necessário enviar o cadastro novamente.',
  }

  return content('Cadastro recebido | Campos & Coelho', body, `${input.siteUrl}/logo_campos_coelho.png`)
}

export function newRegistrationAdminEmail(input: {
  companyName: string
  cnpj: string
  contactName: string
  contactEmail: string
  protocol: string
  companyId: string
  siteUrl: string
}): EmailContent {
  const body: BrandedEmailInput = {
    preheader: `Novo cadastro empresarial: ${input.companyName}.`,
    eyebrow: 'Nova análise pendente',
    title: 'Um novo cadastro chegou',
    paragraphs: [
      'A ficha comercial e os documentos já estão disponíveis no painel administrativo.',
    ],
    details: [
      { label: 'Empresa', value: input.companyName },
      { label: 'CNPJ', value: input.cnpj },
      { label: 'Responsável', value: input.contactName },
      { label: 'E-mail', value: input.contactEmail },
      { label: 'Protocolo', value: input.protocol },
    ],
    callToAction: {
      label: 'Analisar cadastro',
      url: `${input.siteUrl}/admin/empresas/${input.companyId}`,
    },
  }

  return content(`Novo cadastro: ${input.companyName}`, body, `${input.siteUrl}/logo_campos_coelho.png`)
}

export function companyDecisionEmail(input: {
  status: 'approved' | 'rejected' | 'suspended' | 'reactivated'
  contactName: string
  companyName: string
  message: string
  siteUrl: string
}): EmailContent {
  const config = {
    approved: {
      eyebrow: 'Cadastro aprovado',
      title: 'Sua empresa foi aprovada',
      paragraph: 'O acesso aos preços e aos pedidos já está liberado para sua conta.',
      cta: 'Acessar catálogo',
      path: '/login',
      subject: 'Cadastro aprovado | Campos & Coelho',
    },
    rejected: {
      eyebrow: 'Análise concluída',
      title: 'Seu cadastro precisa de ajustes',
      paragraph: 'Confira abaixo a orientação registrada pela nossa equipe.',
      cta: 'Ver meu cadastro',
      path: '/conta-recusada',
      subject: 'Atualização do cadastro | Campos & Coelho',
    },
    suspended: {
      eyebrow: 'Acesso comercial',
      title: 'O acesso da empresa foi suspenso',
      paragraph: 'Confira a orientação da equipe para regularizar o acesso comercial.',
      cta: 'Consultar situação',
      path: '/conta-recusada',
      subject: 'Acesso comercial suspenso | Campos & Coelho',
    },
    reactivated: {
      eyebrow: 'Acesso comercial',
      title: 'O acesso da empresa foi reativado',
      paragraph: 'Sua empresa voltou a ter acesso aos preços e aos pedidos.',
      cta: 'Acessar catálogo',
      path: '/login',
      subject: 'Acesso reativado | Campos & Coelho',
    },
  }[input.status]

  const body: BrandedEmailInput = {
    preheader: config.title,
    eyebrow: config.eyebrow,
    title: config.title,
    paragraphs: [
      `Olá, ${input.contactName}. A análise da ${input.companyName} foi atualizada.`,
      config.paragraph,
    ],
    message: input.message,
    callToAction: { label: config.cta, url: `${input.siteUrl}${config.path}` },
  }

  return content(config.subject, body, `${input.siteUrl}/logo_campos_coelho.png`)
}

export function orderCreatedEmail(input: {
  contactName: string
  companyName: string
  orderNumber: string
  total: string
  itemCount: number
  orderId: string
  siteUrl: string
  audience: 'customer' | 'admin'
}): EmailContent {
  const isAdmin = input.audience === 'admin'
  const body: BrandedEmailInput = {
    preheader: `Pedido ${input.orderNumber} recebido.`,
    eyebrow: isAdmin ? 'Novo pedido' : 'Pedido recebido',
    title: isAdmin ? 'Um novo pedido foi realizado' : 'Seu pedido foi recebido',
    paragraphs: [
      isAdmin
        ? `A ${input.companyName} concluiu um novo pedido no portal.`
        : `Olá, ${input.contactName}. O pedido da ${input.companyName} foi registrado e seguirá para conferência.`,
      'A compra é destinada à retirada na loja. Avisaremos por e-mail quando estiver pronta.',
    ],
    details: [
      { label: 'Pedido', value: input.orderNumber },
      { label: 'Itens', value: String(input.itemCount) },
      { label: 'Total', value: input.total },
      { label: 'Modalidade', value: 'Retirada na loja' },
    ],
    callToAction: {
      label: isAdmin ? 'Abrir pedido no painel' : 'Acompanhar pedido',
      url: isAdmin
        ? `${input.siteUrl}/admin/pedidos/${input.orderId}`
        : `${input.siteUrl}/minha-conta/pedidos/${input.orderId}`,
    },
  }

  return content(
    isAdmin
      ? `Novo pedido ${input.orderNumber} | Campos & Coelho`
      : `Pedido ${input.orderNumber} recebido | Campos & Coelho`,
    body,
    `${input.siteUrl}/logo_campos_coelho.png`,
  )
}

export function orderStatusEmail(input: {
  contactName: string
  orderNumber: string
  statusLabel: string
  orderId: string
  siteUrl: string
}): EmailContent {
  const ready = input.statusLabel === 'Pronto para retirada'
  const body: BrandedEmailInput = {
    preheader: `O pedido ${input.orderNumber} agora está: ${input.statusLabel}.`,
    eyebrow: 'Atualização do pedido',
    title: ready ? 'Seu pedido está pronto para retirada' : 'O status do pedido mudou',
    paragraphs: [
      `Olá, ${input.contactName}. O pedido ${input.orderNumber} agora está como “${input.statusLabel}”.`,
      ready
        ? `A retirada é feita na ${COMPANY_ADDRESS}. Em caso de dúvida, fale conosco pelo ${COMPANY_PHONE}.`
        : 'Você pode acompanhar os detalhes pela sua conta.',
    ],
    details: [
      { label: 'Pedido', value: input.orderNumber },
      { label: 'Situação', value: input.statusLabel },
    ],
    callToAction: {
      label: 'Ver pedido',
      url: `${input.siteUrl}/minha-conta/pedidos/${input.orderId}`,
    },
  }

  return content(
    `${input.orderNumber}: ${input.statusLabel} | Campos & Coelho`,
    body,
    `${input.siteUrl}/logo_campos_coelho.png`,
  )
}

export function adminWelcomeEmail(input: {
  fullName: string
  siteUrl: string
}): EmailContent {
  const body: BrandedEmailInput = {
    preheader: 'Seu acesso administrativo foi criado.',
    eyebrow: 'Acesso administrativo',
    title: 'Seu acesso ao painel está pronto',
    paragraphs: [
      `Olá, ${input.fullName}. Seu usuário administrativo da Campos & Coelho foi criado.`,
      'Por segurança, a senha não é enviada por e-mail. Use a senha definida durante o cadastro do administrador.',
    ],
    callToAction: { label: 'Entrar no painel', url: `${input.siteUrl}/login?redirect=/admin` },
    notice: 'Se você não reconhece este acesso, fale com a equipe responsável imediatamente.',
  }

  return content('Acesso administrativo criado | Campos & Coelho', body, `${input.siteUrl}/logo_campos_coelho.png`)
}
