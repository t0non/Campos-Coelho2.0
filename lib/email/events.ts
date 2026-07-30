import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/utils/site-url'
import {
  adminWelcomeEmail,
  companyDecisionEmail,
  newRegistrationAdminEmail,
  orderCreatedEmail,
  orderStatusEmail,
  registrationReceivedEmail,
} from '@/lib/email/templates'
import { normalizeEmailRecipients, sendTransactionalEmail } from '@/lib/email/sender'
import { ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/orders/status'

type CompanyDecisionStatus = 'approved' | 'rejected' | 'suspended' | 'reactivated'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

async function getAdminEmails(): Promise<string[]> {
  const configured = normalizeEmailRecipients(
    process.env.ADMIN_NOTIFICATION_EMAILS ?? '',
  )
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('role', 'admin')
    .eq('status', 'active')

  if (error) {
    console.error('[email] Não foi possível consultar os destinatários administrativos.')
  }

  return normalizeEmailRecipients([
    ...configured,
    ...(data?.map((profile) => profile.email) ?? []),
  ])
}

export async function notifyRegistrationSubmitted(input: {
  companyId: string
  companyName: string
  cnpj: string
  contactName: string
  contactEmail: string
  protocol: string
}): Promise<void> {
  const siteUrl = getSiteUrl()
  const adminEmails = await getAdminEmails()
  const tasks = [
    sendTransactionalEmail({
      ...registrationReceivedEmail({ ...input, siteUrl }),
      to: input.contactEmail,
      idempotencyKey: `registration-customer-${input.companyId}`,
    }),
  ]

  if (adminEmails.length) {
    tasks.push(
      sendTransactionalEmail({
        ...newRegistrationAdminEmail({ ...input, siteUrl }),
        to: adminEmails,
        idempotencyKey: `registration-admin-${input.companyId}`,
      }),
    )
  }

  await Promise.all(tasks)
}

export async function notifyCompanyDecision(input: {
  companyId: string
  status: CompanyDecisionStatus
  message: string
}): Promise<void> {
  const supabase = createAdminClient()
  const [{ data: company }, { data: member }] = await Promise.all([
    supabase
      .from('companies')
      .select('company_name, updated_at')
      .eq('id', input.companyId)
      .maybeSingle(),
    supabase
      .from('company_members')
      .select('profile_id')
      .eq('company_id', input.companyId)
      .eq('is_primary', true)
      .maybeSingle(),
  ])

  if (!company || !member) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', member.profile_id)
    .maybeSingle()
  if (!profile?.email) return

  const siteUrl = getSiteUrl()
  await sendTransactionalEmail({
    ...companyDecisionEmail({
      status: input.status,
      contactName: profile.full_name,
      companyName: company.company_name,
      message: input.message,
      siteUrl,
    }),
    to: profile.email,
    idempotencyKey: `company-${input.companyId}-${input.status}-${company.updated_at}`,
  })
}

interface OrderEmailContext {
  id: string
  orderNumber: string
  total: number
  status: OrderStatus
  contactName: string
  contactEmail: string
  companyName: string
  itemCount: number
}

async function getOrderEmailContext(orderId: string): Promise<OrderEmailContext | null> {
  const supabase = createAdminClient()
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total,
      status,
      company:companies!orders_company_id_fkey(company_name),
      customer:profiles!orders_profile_id_fkey(full_name, email),
      order_items(id)
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (error || !order) return null
  const company = Array.isArray(order.company) ? order.company[0] : order.company
  const customer = Array.isArray(order.customer) ? order.customer[0] : order.customer
  if (!company || !customer?.email) return null

  return {
    id: order.id,
    orderNumber: order.order_number,
    total: Number(order.total),
    status: order.status as OrderStatus,
    contactName: customer.full_name,
    contactEmail: customer.email,
    companyName: company.company_name,
    itemCount: order.order_items?.length ?? 0,
  }
}

export async function notifyOrderCreated(orderId: string): Promise<void> {
  const order = await getOrderEmailContext(orderId)
  if (!order) return

  const siteUrl = getSiteUrl()
  const adminEmails = await getAdminEmails()
  const shared = {
    contactName: order.contactName,
    companyName: order.companyName,
    orderNumber: order.orderNumber,
    total: formatCurrency(order.total),
    itemCount: order.itemCount,
    orderId: order.id,
    siteUrl,
  }
  const tasks = [
    sendTransactionalEmail({
      ...orderCreatedEmail({ ...shared, audience: 'customer' }),
      to: order.contactEmail,
      idempotencyKey: `order-created-customer-${order.id}`,
    }),
  ]

  if (adminEmails.length) {
    tasks.push(
      sendTransactionalEmail({
        ...orderCreatedEmail({ ...shared, audience: 'admin' }),
        to: adminEmails,
        idempotencyKey: `order-created-admin-${order.id}`,
      }),
    )
  }

  await Promise.all(tasks)
}

export async function notifyOrderStatusChanged(orderId: string): Promise<void> {
  const order = await getOrderEmailContext(orderId)
  if (!order) return

  const siteUrl = getSiteUrl()
  await sendTransactionalEmail({
    ...orderStatusEmail({
      contactName: order.contactName,
      orderNumber: order.orderNumber,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      orderId: order.id,
      siteUrl,
    }),
    to: order.contactEmail,
    idempotencyKey: `order-status-${order.id}-${order.status}`,
  })
}

export async function notifyAdminCreated(input: {
  userId: string
  fullName: string
  email: string
}): Promise<void> {
  const siteUrl = getSiteUrl()
  await sendTransactionalEmail({
    ...adminWelcomeEmail({ fullName: input.fullName, siteUrl }),
    to: input.email,
    idempotencyKey: `admin-created-${input.userId}`,
  })
}
