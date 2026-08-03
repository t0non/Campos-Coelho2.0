export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || '553134419534'

export const WHATSAPP_MESSAGE =
  process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
  'Olá! Gostaria de informações sobre compras no atacado.'

export const COMPANY_PHONE_DISPLAY = '(31) 3441-9534'

export const COMPANY_ADDRESS =
  'Avenida Doutor Cristiano Guimarães, 975 - Planalto, Belo Horizonte - MG, 31720-300'

export const COMPANY_GOOGLE_PROFILE_URL = 'https://share.google/59o0CyAluDsA12xDg'

// Ativar como NEXT_PUBLIC_SITE_URL somente após o domínio estar publicado.
export const FUTURE_COMPANY_DOMAIN = 'https://distribuidoracamposcoelho.com.br'
