'use client'

import { type FormEvent, useState, useTransition } from 'react'
import { unsubscribeNewsletter } from '@/app/actions/privacy'

export function NewsletterUnsubscribeForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email'))
    startTransition(async () => {
      const result = await unsubscribeNewsletter(email)
      setMessage(
        result.success
          ? (result.message ?? 'Cancelamento registrado.')
          : (result.error ?? 'Nao foi possivel concluir.'),
      )
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-end">
      <label className="flex-1 text-xs font-semibold text-slate-700">
        E-mail inscrito
        <input
          name="email"
          type="email"
          required
          className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </label>
      <button type="submit" disabled={isPending} className="h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold hover:border-slate-500 disabled:opacity-60">
        {isPending ? 'Cancelando' : 'Cancelar novidades'}
      </button>
      {message && <p className="text-xs text-slate-600 sm:basis-full">{message}</p>}
    </form>
  )
}
