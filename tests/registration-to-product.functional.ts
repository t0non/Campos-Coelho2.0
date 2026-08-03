import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { fullRegistrationSchema, getPasswordStrength } from '../lib/validations/registration'
import { ProductInputSchema, VariantInputSchema } from '../lib/validations/admin-products'

type AnyClient = ReturnType<typeof createClient<any, 'public', any>>

const results: Array<{ name: string; passed: boolean; detail?: string }> = []
const created = {
  userIds: [] as string[],
  companyId: null as string | null,
  categoryId: null as string | null,
  brandId: null as string | null,
  productId: null as string | null,
  orderIds: [] as string[],
  documentPaths: [] as string[],
}

function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  const values: Record<string, string> = {}
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const separator = trimmed.indexOf('=')
    if (separator < 1) continue
    values[trimmed.slice(0, separator).trim()] = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  }
  return values
}

function check(name: string, condition: unknown, detail?: string): asserts condition {
  const passed = Boolean(condition)
  results.push({ name, passed, detail })
  console.log(`${passed ? 'PASS' : 'FAIL'} | ${name}${detail ? ` | ${detail}` : ''}`)
  if (!passed) throw new Error(name)
}

function calculateDigit(base: string, weights: number[]) {
  const sum = base
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
  const remainder = sum % 11
  return remainder < 2 ? '0' : String(11 - remainder)
}

function generateCnpj(seed: string) {
  const root = seed.replace(/\D/g, '').padStart(8, '0').slice(-8)
  const base = `${root}0001`
  const first = calculateDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])
  return `${base}${first}${calculateDigit(`${base}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2])}`
}

function generateCpf(seed: string) {
  const base = seed.replace(/\D/g, '').padStart(9, '0').slice(-9)
  const first = calculateDigit(base, [10, 9, 8, 7, 6, 5, 4, 3, 2])
  return `${base}${first}${calculateDigit(`${base}${first}`, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2])}`
}

async function signIn(url: string, key: string, email: string, password: string) {
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  check(`Autenticação de ${email.split('@')[0]}`, !error && data.session, error?.message)
  return { client, session: data.session! }
}

async function fetchPage(pathname: string, accessToken?: string) {
  const response = await fetch(`http://localhost:3000${pathname}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
  return { response, body: await response.text() }
}

async function cleanup(service: AnyClient) {
  if (created.documentPaths.length) {
    await service.storage.from('company-documents').remove(created.documentPaths)
  }
  if (created.companyId) {
    const { data: orders } = await service.from('orders').select('id').eq('company_id', created.companyId)
    const orderIds = (orders ?? []).map((order) => order.id)
    if (orderIds.length) {
      await service.from('inventory_movements').delete().in('reference_id', orderIds)
      await service.from('order_status_history').delete().in('order_id', orderIds)
      await service.from('order_items').delete().in('order_id', orderIds)
      await service.from('audit_logs').delete().in('target_id', orderIds)
      await service.from('orders').delete().in('id', orderIds)
    }
    const { data: carts } = await service.from('carts').select('id').eq('company_id', created.companyId)
    const cartIds = (carts ?? []).map((cart) => cart.id)
    if (cartIds.length) {
      await service.from('cart_items').delete().in('cart_id', cartIds)
      await service.from('carts').delete().in('id', cartIds)
    }
  }
  if (created.productId) {
    const { data: inventories } = await service.from('inventories').select('id').eq('product_id', created.productId)
    const inventoryIds = (inventories ?? []).map((inventory) => inventory.id)
    if (inventoryIds.length) await service.from('inventory_movements').delete().in('inventory_id', inventoryIds)
    await service.from('price_table_products').delete().eq('product_id', created.productId)
    await service.from('inventories').delete().eq('product_id', created.productId)
    await service.from('product_images').delete().eq('product_id', created.productId)
    await service.from('product_variants').delete().eq('product_id', created.productId)
    await service.from('audit_logs').delete().eq('target_id', created.productId)
    await service.from('products').delete().eq('id', created.productId)
  }
  if (created.brandId) await service.from('brands').delete().eq('id', created.brandId)
  if (created.categoryId) await service.from('categories').delete().eq('id', created.categoryId)
  if (created.companyId) {
    await service.from('notifications').delete().in('profile_id', created.userIds)
    await service.from('company_documents').delete().eq('company_id', created.companyId)
    await service.from('addresses').delete().eq('company_id', created.companyId)
    await service.from('company_members').delete().eq('company_id', created.companyId)
    await service.from('audit_logs').delete().eq('target_id', created.companyId)
    await service.from('companies').delete().eq('id', created.companyId)
  }
  for (const userId of [...created.userIds].reverse()) {
    await service.from('audit_logs').update({ actor_id: null }).eq('actor_id', userId)
    await service.auth.admin.deleteUser(userId)
  }
}

async function main() {
  const env = loadEnvLocal()
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = env.SUPABASE_SECRET_KEY
  check('Configuração de testes disponível', supabaseUrl && anonKey && serviceKey)

  const service = createClient<any, 'public', any>(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const runId = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const compactId = runId.replace(/\D/g, '').slice(-8)
  const password = `Funcional#${crypto.randomUUID().slice(0, 8)}A1`
  const customerEmail = `codex-customer-${runId}@example.com`
  const adminEmail = `codex-admin-${runId}@example.com`
  const cnpj = generateCnpj(compactId)
  const cpf = generateCpf(compactId)
  const slug = `produto-funcional-${runId}`.toLowerCase()
  const sku = `FUNC-${runId}`.toUpperCase()

  try {
    const registration = {
      company: {
        cnpj,
        companyName: `Empresa Funcional ${runId} LTDA`,
        tradingName: `Funcional ${runId}`,
        isStateRegistrationExempt: true,
        segment: 'Varejo',
        businessType: 'Loja física',
        employeeCount: '1-10',
        phone: '3133334444',
        whatsapp: '31999998888',
        email: customerEmail,
        website: '',
        foundationYear: '2020',
      },
      responsible: {
        fullName: 'Cliente Funcional Codex',
        cpf,
        role: 'owner',
        department: 'Compras',
        email: customerEmail,
        phone: '3133334444',
        whatsapp: '31999998888',
        password,
        confirmPassword: password,
      },
      addresses: {
        fiscal: {
          cep: '31720300',
          street: 'Avenida Teste Funcional',
          number: '975',
          neighborhood: 'Planalto',
          city: 'Belo Horizonte',
          state: 'MG',
        },
        isShippingSameAsFiscal: true,
        isBillingSameAsFiscal: true,
      },
      interests: {
        categories: ['Utilidades'],
        purchaseFrequency: 'Mensal',
        averageOrderValue: '1000-5000',
        storeCount: '1',
        operatingStates: ['MG'],
        salesChannel: 'Loja física',
        howDidYouHear: 'Teste funcional',
      },
      consents: {
        termsOfUse: true,
        privacyPolicy: true,
        lgpdDataProcessing: true,
        declarationOfTruth: true,
      },
    }

    check('Validação completa do formulário de cadastro', fullRegistrationSchema.safeParse(registration).success)
    check('Senha forte classificada corretamente', getPasswordStrength('SenhaForte1').label === 'Forte')
    check('Senha excelente classificada corretamente', getPasswordStrength('SenhaForte#1').label === 'Excelente')
    const registrationPage = await fetchPage('/cadastro')
    check('Página pública de cadastro carrega', registrationPage.response.status === 200 && registrationPage.body.includes('Cadastro'))

    const { data: customerAuth, error: customerAuthError } = await service.auth.admin.createUser({
      email: customerEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: registration.responsible.fullName, role: 'customer' },
    })
    check('Conta do responsável criada', !customerAuthError && customerAuth.user, customerAuthError?.message)
    created.userIds.push(customerAuth.user!.id)

    const { error: profileError } = await service.from('profiles').upsert({
      id: customerAuth.user!.id,
      full_name: registration.responsible.fullName,
      email: customerEmail,
      phone: '3133334444',
      role: 'customer',
      status: 'active',
    })
    check('Perfil do responsável persistido', !profileError, profileError?.message)
    const { data: company, error: companyError } = await service.from('companies').insert({
      cnpj,
      company_name: registration.company.companyName,
      trade_name: registration.company.tradingName,
      segment: registration.company.segment,
      phone: '3133334444',
      whatsapp: '31999998888',
      email: customerEmail,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }).select('id,status').single()
    check('Empresa criada como pendente', !companyError && company?.status === 'pending', companyError?.message)
    created.companyId = company!.id
    check('Empresa vinculada ao perfil', !(await service.from('profiles').update({ company_id: company!.id }).eq('id', customerAuth.user!.id)).error)
    check('Responsável vinculado como membro principal', !(await service.from('company_members').insert({
      company_id: company!.id,
      profile_id: customerAuth.user!.id,
      role: 'owner',
      is_primary: true,
    })).error)
    check('Endereço empresarial persistido', !(await service.from('addresses').insert({
      company_id: company!.id,
      profile_id: customerAuth.user!.id,
      label: 'Principal',
      zip_code: '31720300',
      street: 'Avenida Teste Funcional',
      number: '975',
      neighborhood: 'Planalto',
      city: 'Belo Horizonte',
      state: 'MG',
      is_default: true,
    })).error)

    const documentPath = `${company!.id}/contrato_social/${crypto.randomUUID()}.pdf`
    const { error: uploadError } = await service.storage.from('company-documents').upload(
      documentPath,
      Buffer.from('%PDF-1.4\n%%EOF'),
      { contentType: 'application/pdf', upsert: false },
    )
    check('Documento empresarial enviado ao storage', !uploadError, uploadError?.message)
    created.documentPaths.push(documentPath)
    check('Documento empresarial registrado', !(await service.from('company_documents').insert({
      company_id: company!.id,
      document_type: 'contrato_social',
      file_path: documentPath,
      file_name: 'contrato.pdf',
      status: 'pending',
    })).error)
    const { error: duplicateCompanyError } = await service.from('companies').insert({
      cnpj,
      company_name: 'Duplicada Funcional LTDA',
      status: 'pending',
    })
    check('CNPJ duplicado rejeitado', duplicateCompanyError?.code === '23505', duplicateCompanyError?.message)

    const customer = await signIn(supabaseUrl, anonKey, customerEmail, password)
    check('Cliente pendente acessa a tela correta', (await fetchPage('/conta-pendente', customer.session.access_token)).response.status === 200)
    const forbiddenChange = await customer.client.from('companies').update({ status: 'approved' }).eq('id', company!.id).select('id,status')
    check('Cliente não pode aprovar a própria empresa', Boolean(forbiddenChange.error) || forbiddenChange.data?.length === 0)

    const { data: adminAuth, error: adminAuthError } = await service.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin Funcional Codex', role: 'admin' },
    })
    check('Conta administrativa temporária criada', !adminAuthError && adminAuth.user, adminAuthError?.message)
    created.userIds.push(adminAuth.user!.id)
    check('Perfil administrativo persistido', !(await service.from('profiles').upsert({
      id: adminAuth.user!.id,
      full_name: 'Admin Funcional Codex',
      email: adminEmail,
      role: 'admin',
      status: 'active',
    })).error)
    const admin = await signIn(supabaseUrl, anonKey, adminEmail, password)

    const anonymousAdminPage = await fetchPage('/admin/produtos')
    check('Visitante é bloqueado no painel de produtos', anonymousAdminPage.response.status === 307 && anonymousAdminPage.response.headers.get('location')?.includes('/login'))
    check('Cliente é bloqueado no painel de produtos', (await fetchPage('/admin/produtos', customer.session.access_token)).response.status === 307)
    check('Administrador acessa criação de produto', (await fetchPage('/admin/produtos/novo', admin.session.access_token)).response.status === 200)

    const priceTable = await service.from('price_tables').select('id').eq('is_default', true).eq('is_active', true).limit(1).maybeSingle()
    check('Tabela de preços padrão disponível', !priceTable.error && priceTable.data)
    const approval = await service.from('companies').update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      price_table_id: priceTable.data!.id,
    }).eq('id', company!.id).select('status,price_table_id').single()
    check('Ação administrativa aprova o cadastro', !approval.error && approval.data?.status === 'approved', approval.error?.message)
    check('Cliente aprovado acessa Minha Conta', (await fetchPage('/minha-conta', customer.session.access_token)).response.status === 200)

    const category = await admin.client.from('categories').insert({
      name: `Categoria Funcional ${runId}`,
      slug: `categoria-funcional-${runId}`.toLowerCase(),
      is_active: true,
    }).select('id').single()
    check('Administrador cria categoria', !category.error && category.data, category.error?.message)
    created.categoryId = category.data!.id
    const brand = await admin.client.from('brands').insert({
      name: `Marca Funcional ${runId}`,
      slug: `marca-funcional-${runId}`.toLowerCase(),
      is_active: true,
    }).select('id').single()
    check('Administrador cria marca', !brand.error && brand.data, brand.error?.message)
    created.brandId = brand.data!.id

    const productInput = ProductInputSchema.parse({
      name: `Produto Funcional ${runId}`,
      slug,
      sku,
      description: 'Produto criado pela suíte funcional.',
      category_id: category.data!.id,
      brand_id: brand.data!.id,
      unit: 'UN',
      min_quantity: 2,
      multiple_quantity: 2,
      is_active: true,
      is_published: false,
      is_featured: false,
      is_new_arrival: false,
    })
    check('Validação do formulário de produto', Boolean(productInput))
    check('Produto com slug inválido é rejeitado', !ProductInputSchema.safeParse({ ...productInput, slug: 'Slug Inválido' }).success)
    check('Cliente não pode criar produto', Boolean((await customer.client.from('products').insert(productInput)).error))
    const product = await admin.client.from('products').insert(productInput).select('id,name,slug,sku').single()
    check('Administrador cria produto', !product.error && product.data, product.error?.message)
    created.productId = product.data!.id
    const duplicateProduct = await admin.client.from('products').insert({ ...productInput, name: 'Produto duplicado' })
    check('SKU/slug duplicado de produto rejeitado', duplicateProduct.error?.code === '23505', duplicateProduct.error?.message)

    const updatedName = `Produto Funcional Editado ${runId}`
    const updatedProduct = await admin.client.from('products').update({
      name: updatedName,
      description: 'Descrição editada e persistida.',
      min_quantity: 4,
      multiple_quantity: 4,
      is_published: true,
    }).eq('id', product.data!.id).select('name,min_quantity,is_published').single()
    check('Administrador edita e publica produto', !updatedProduct.error && updatedProduct.data?.name === updatedName && updatedProduct.data.min_quantity === 4 && updatedProduct.data.is_published, updatedProduct.error?.message)

    const variantInput = VariantInputSchema.parse({
      product_id: product.data!.id,
      name: 'Padrão',
      sku: `${sku}-PADRAO`,
      attributes: { acabamento: 'Padrão' },
      min_quantity: 4,
      multiple_quantity: 4,
      is_active: true,
    })
    const variant = await admin.client.from('product_variants').insert(variantInput).select('id').single()
    check('Administrador cria variante', !variant.error && variant.data, variant.error?.message)
    const updatedVariant = await admin.client.from('product_variants').update({
      name: 'Padrão Editado',
      attributes: { acabamento: 'Fosco' },
    }).eq('id', variant.data!.id).select('name').single()
    check('Administrador edita variante', !updatedVariant.error && updatedVariant.data?.name === 'Padrão Editado', updatedVariant.error?.message)

    const editPage = await fetchPage(`/admin/produtos/${product.data!.id}`, admin.session.access_token)
    check('Página administrativa exibe o produto editado', editPage.response.status === 200 && editPage.body.includes(updatedName))
    const publicPage = await fetchPage(`/produto/${slug}`)
    check('Produto publicado aparece na loja', publicPage.response.status === 200 && publicPage.body.includes(updatedName))

    const priceEntry = await service.from('price_table_products').insert({
      price_table_id: priceTable.data!.id,
      product_id: product.data!.id,
      variant_id: variant.data!.id,
      unit_price: 100,
      promotional_price: null,
      min_quantity: 4,
      is_active: true,
    }).select('id').single()
    check('Preço comercial configurado', !priceEntry.error && priceEntry.data, priceEntry.error?.message)
    const inventory = await service.from('inventories').insert({
      product_id: product.data!.id,
      variant_id: variant.data!.id,
      quantity_available: 100,
      quantity_reserved: 0,
      min_stock_alert: 10,
    }).select('id,quantity_available,quantity_reserved').single()
    check('Estoque inicial configurado', !inventory.error && inventory.data?.quantity_available === 100, inventory.error?.message)

    const invalidQuantity = await customer.client.rpc('add_to_cart_atomic', {
      p_product_id: product.data!.id,
      p_variant_id: variant.data!.id,
      p_quantity: 5,
      p_target_company_id: null,
    })
    check('Carrinho rejeita quantidade fora do múltiplo', invalidQuantity.data?.success === false && invalidQuantity.data?.code === 'INVALID_MULTIPLE')
    const addToCart = await customer.client.rpc('add_to_cart_atomic', {
      p_product_id: product.data!.id,
      p_variant_id: variant.data!.id,
      p_quantity: 12,
      p_target_company_id: null,
    })
    check('Produto é adicionado ao carrinho', !addToCart.error && addToCart.data?.success === true && addToCart.data?.quantity === 12, addToCart.error?.message)
    const cartId = addToCart.data!.cart_id as string
    const cartData = await customer.client.rpc('get_active_cart_with_prices', { p_target_company_id: null })
    check('Carrinho retorna preço e subtotal corretos', !cartData.error && cartData.data?.length === 1 && Number(cartData.data[0].line_total) === 1200, cartData.error?.message)
    const stockBeforeCheckout = await service.from('inventories').select('quantity_available,quantity_reserved').eq('id', inventory.data!.id).single()
    check('Carrinho não reserva estoque antes do checkout', stockBeforeCheckout.data?.quantity_available === 100 && stockBeforeCheckout.data?.quantity_reserved === 0)
    const cartPage = await fetchPage('/carrinho', customer.session.access_token)
    check('Página do carrinho exibe o produto', cartPage.response.status === 200 && cartPage.body.includes(updatedName))
    const checkoutPage = await fetchPage('/checkout', customer.session.access_token)
    check('Página de checkout carrega', checkoutPage.response.status === 200)

    const address = await service.from('addresses').select('id').eq('company_id', company!.id).eq('is_default', true).single()
    check('Endereço de checkout disponível', !address.error && address.data)
    const idempotencyKey = crypto.randomUUID()
    const checkout = await customer.client.rpc('checkout_atomic', {
      p_idempotency_key: idempotencyKey,
      p_shipping_address_id: address.data!.id,
      p_target_company_id: null,
    })
    check('Checkout cria pedido pendente', !checkout.error && checkout.data?.success === true && checkout.data?.status === 'pending', checkout.error?.message)
    const orderId = checkout.data!.order_id as string
    created.orderIds.push(orderId)
    check('Total do pedido respeita o mínimo comercial', Number(checkout.data?.total) === 1200)
    const order = await service.from('orders').select('id,status,total,company_id,profile_id').eq('id', orderId).single()
    check('Pedido foi persistido para a empresa correta', !order.error && order.data?.company_id === company!.id && order.data?.profile_id === customerAuth.user!.id)
    const orderItems = await service.from('order_items').select('quantity,unit_price,total_price,product_name,product_sku,variant_sku').eq('order_id', orderId)
    check('Item do pedido preserva o snapshot comercial', orderItems.data?.length === 1 && orderItems.data[0].quantity === 12 && Number(orderItems.data[0].unit_price) === 100 && Number(orderItems.data[0].total_price) === 1200)
    const initialHistory = await service.from('order_status_history').select('status').eq('order_id', orderId)
    check('Histórico inicial do pedido foi criado', initialHistory.data?.length === 1 && initialHistory.data[0].status === 'pending')
    const reservedStock = await service.from('inventories').select('quantity_available,quantity_reserved').eq('id', inventory.data!.id).single()
    check('Checkout reserva o estoque atomicamente', reservedStock.data?.quantity_available === 100 && reservedStock.data?.quantity_reserved === 12)
    const convertedCart = await service.from('carts').select('status').eq('id', cartId).single()
    check('Carrinho é convertido após o checkout', convertedCart.data?.status === 'converted')

    const repeatedCheckout = await customer.client.rpc('checkout_atomic', {
      p_idempotency_key: idempotencyKey,
      p_shipping_address_id: address.data!.id,
      p_target_company_id: null,
    })
    check('Checkout repetido é idempotente', repeatedCheckout.data?.success === true && repeatedCheckout.data?.idempotent === true && repeatedCheckout.data?.order_id === orderId)
    const orderCount = await service.from('orders').select('id', { count: 'exact', head: true }).eq('idempotency_key', idempotencyKey)
    check('Idempotência impede pedido duplicado', orderCount.count === 1)
    const emptyCheckout = await customer.client.rpc('checkout_atomic', {
      p_idempotency_key: crypto.randomUUID(),
      p_shipping_address_id: address.data!.id,
      p_target_company_id: null,
    })
    check('Checkout sem carrinho ativo é rejeitado', emptyCheckout.data?.success === false && emptyCheckout.data?.code === 'EMPTY_CART')

    const successPage = await fetchPage(`/checkout/sucesso/${orderId}`, customer.session.access_token)
    check('Página de sucesso do pedido carrega', successPage.response.status === 200 && successPage.body.includes(String(checkout.data?.order_number)))
    const customerOrderPage = await fetchPage(`/minha-conta/pedidos/${orderId}`, customer.session.access_token)
    check('Cliente acessa o próprio pedido', customerOrderPage.response.status === 200)
    const adminOrderPage = await fetchPage(`/admin/pedidos/${orderId}`, admin.session.access_token)
    check('Administrador acessa o pedido', adminOrderPage.response.status === 200)

    const forbiddenTransition = await customer.client.rpc('admin_transition_order_status', {
      p_order_id: orderId,
      p_next_status: 'confirmed',
      p_actor_id: customerAuth.user!.id,
    })
    check('Cliente não pode alterar o status do pedido', forbiddenTransition.data?.success === false && forbiddenTransition.data?.code === 'FORBIDDEN')
    for (const nextStatus of ['confirmed', 'processing', 'shipped', 'delivered']) {
      const transition = await admin.client.rpc('admin_transition_order_status', {
        p_order_id: orderId,
        p_next_status: nextStatus,
        p_actor_id: adminAuth.user!.id,
      })
      check(`Administrador altera pedido para ${nextStatus}`, !transition.error && transition.data?.success === true, transition.error?.message)
    }
    const deliveredOrder = await service.from('orders').select('status').eq('id', orderId).single()
    check('Pedido termina como entregue', deliveredOrder.data?.status === 'delivered')
    const stockAfterDelivery = await service.from('inventories').select('quantity_available,quantity_reserved').eq('id', inventory.data!.id).single()
    check('Entrega baixa o estoque e libera a reserva', stockAfterDelivery.data?.quantity_available === 88 && stockAfterDelivery.data?.quantity_reserved === 0)
    const invalidTransition = await admin.client.rpc('admin_transition_order_status', {
      p_order_id: orderId,
      p_next_status: 'pending',
      p_actor_id: adminAuth.user!.id,
    })
    check('Transição regressiva após entrega é bloqueada', invalidTransition.data?.success === false && invalidTransition.data?.code === 'INVALID_TRANSITION')
    const fullHistory = await service.from('order_status_history').select('status').eq('order_id', orderId)
    check('Histórico registra todo o ciclo do pedido', fullHistory.data?.length === 5)

    console.log(`\nRESULTADO: ${results.filter((item) => item.passed).length}/${results.length} testes aprovados.`)
  } finally {
    await cleanup(service)
    console.log('Dados temporários removidos.')
  }
}

main().catch((error) => {
  console.error(`SUÍTE FUNCIONAL REPROVADA: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
