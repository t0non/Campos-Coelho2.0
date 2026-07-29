export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Pencil } from 'lucide-react'
import { getCheckoutAddresses } from '@/lib/data/checkout'
import { requireApprovedAccess } from '@/lib/supabase/auth'

export const metadata: Metadata = { title: 'Endereços' }

export default async function EnderecosPage() {
  const ctx = await requireApprovedAccess()
  const addresses = ctx.company ? await getCheckoutAddresses(ctx.company.id) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-950">Endereços</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Endereços vinculados à empresa e disponíveis no checkout.
          </p>
        </div>
        <Link
          href="/minha-conta/empresa"
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-bold text-neutral-800 hover:border-black"
        >
          <Pencil className="h-3.5 w-3.5" />
          Revisar cadastro
        </Link>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-14 text-center shadow-sm">
          <MapPin className="mx-auto h-9 w-9 text-neutral-300" />
          <p className="mt-3 text-sm font-bold text-neutral-800">Nenhum endereço cadastrado.</p>
          <p className="mt-1 text-xs text-neutral-500">
            Revise os dados da empresa para completar o cadastro.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="relative rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              {address.is_default && (
                <span className="absolute right-4 top-4 rounded-full bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Principal
                </span>
              )}
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-black">
                <MapPin className="h-5 w-5" />
              </span>
              <h2 className="mt-4 text-sm font-extrabold text-neutral-950">{address.label}</h2>
              <address className="mt-2 not-italic text-sm leading-relaxed text-neutral-600">
                {address.street}, {address.number}
                {address.complement ? ` · ${address.complement}` : ''}
                <br />
                {address.neighborhood} · {address.city}/{address.state}
                <br />
                CEP {address.zip_code}
              </address>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
