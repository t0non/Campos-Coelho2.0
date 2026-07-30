import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeJsonLd } from '../lib/utils/json-ld.ts'
import { parseCatalogParams } from '../lib/utils/catalog-params.ts'
import { canTransitionOrderStatus } from '../lib/orders/status.ts'
import { MINIMUM_ORDER_VALUE } from '../lib/utils/constants.ts'
import { createAdminUserSchema } from '../lib/validations/admin-users.ts'
import {
  companyDecisionEmail,
  escapeEmailHtml,
  orderCreatedEmail,
} from '../lib/email/templates.ts'

test('JSON-LD não permite encerrar a tag de script', () => {
  const serialized = serializeJsonLd({
    name: '</script><script>alert("xss")</script>',
  })

  assert.equal(serialized.includes('</script>'), false)
  assert.equal(serialized.includes('<script>'), false)
  assert.match(serialized, /\\u003c/)
})

test('filtros comerciais não vazam para visitantes', () => {
  const params = parseCatalogParams(
    {
      promo: '1',
      minPrice: '10',
      maxPrice: '100',
      sort: 'menor-preco',
    },
    false,
  )

  assert.equal(params.isPromotion, false)
  assert.equal(params.minPrice, undefined)
  assert.equal(params.maxPrice, undefined)
  assert.equal(params.sort, 'relevancia')
})

test('filtros comerciais são aceitos para clientes aprovados', () => {
  const params = parseCatalogParams(
    {
      promo: '1',
      minPrice: '10',
      maxPrice: '100',
      sort: 'menor-preco',
    },
    true,
  )

  assert.equal(params.isPromotion, true)
  assert.equal(params.minPrice, 10)
  assert.equal(params.maxPrice, 100)
  assert.equal(params.sort, 'menor-preco')
})

test('paginação inválida é normalizada', () => {
  const params = parseCatalogParams({ page: '-20', perPage: '9999' })
  assert.equal(params.page, 1)
  assert.equal(params.perPage, 12)
})

test('transições finais de pedido são irreversíveis', () => {
  assert.equal(canTransitionOrderStatus('pending', 'cancelled'), true)
  assert.equal(canTransitionOrderStatus('shipped', 'delivered'), true)
  assert.equal(canTransitionOrderStatus('delivered', 'processing'), false)
  assert.equal(canTransitionOrderStatus('cancelled', 'pending'), false)
})

test('pedido mínimo oficial é de mil reais', () => {
  assert.equal(MINIMUM_ORDER_VALUE, 1000)
})

test('cadastro de administrador exige senha forte e confirmação igual', () => {
  const weakPassword = createAdminUserSchema.safeParse({
    fullName: 'Administrador Teste',
    email: 'admin@example.com',
    password: 'senha-fraca',
    passwordConfirmation: 'senha-fraca',
  })
  const differentConfirmation = createAdminUserSchema.safeParse({
    fullName: 'Administrador Teste',
    email: 'admin@example.com',
    password: 'SenhaForte#2026',
    passwordConfirmation: 'SenhaDiferente#2026',
  })
  const validAdmin = createAdminUserSchema.safeParse({
    fullName: 'Administrador Teste',
    email: 'ADMIN@EXAMPLE.COM',
    password: 'SenhaForte#2026',
    passwordConfirmation: 'SenhaForte#2026',
  })

  assert.equal(weakPassword.success, false)
  assert.equal(differentConfirmation.success, false)
  assert.equal(validAdmin.success, true)
  if (validAdmin.success) {
    assert.equal(validAdmin.data.email, 'admin@example.com')
  }
})

test('templates de e-mail escapam conteúdo informado pelo usuário', () => {
  const unsafe = '<img src=x onerror=alert(1)>'
  const email = companyDecisionEmail({
    status: 'rejected',
    contactName: unsafe,
    companyName: 'Empresa <script>alert(1)</script>',
    message: unsafe,
    siteUrl: 'https://example.com',
  })

  assert.equal(email.html.includes('<script>'), false)
  assert.equal(email.html.includes('<img src=x'), false)
  assert.match(email.html, /&lt;img/)
  assert.equal(escapeEmailHtml(`"A&B"`), '&quot;A&amp;B&quot;')
})

test('e-mail de pedido informa retirada na loja', () => {
  const email = orderCreatedEmail({
    contactName: 'Cliente',
    companyName: 'Empresa Teste',
    orderNumber: 'PED-123',
    total: 'R$ 1.000,00',
    itemCount: 2,
    orderId: '00000000-0000-0000-0000-000000000000',
    siteUrl: 'https://example.com',
    audience: 'customer',
  })

  assert.match(email.text, /Retirada na loja/)
  assert.doesNotMatch(email.text, /entrega nacional/i)
})
