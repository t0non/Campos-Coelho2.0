import assert from 'node:assert/strict'
import test from 'node:test'
import { serializeJsonLd } from '../lib/utils/json-ld.ts'
import { parseCatalogParams } from '../lib/utils/catalog-params.ts'
import { canTransitionOrderStatus } from '../lib/orders/status.ts'
import { MINIMUM_ORDER_VALUE } from '../lib/utils/constants.ts'

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
