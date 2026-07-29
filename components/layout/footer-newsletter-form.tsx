'use client'

import { FormEvent, useState, useTransition } from 'react'
import { subscribeNewsletterAction } from '@/app/actions/newsletter'

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    startTransition(async () => {
      const result = await subscribeNewsletterAction({ email })
      setMessage(result.message)
      if (result.success) setEmail('')
    })
  }

  return (
    <div className="w-full md:max-w-[430px]">
      <form
        className="flex w-full overflow-hidden rounded-xl border border-white/20 bg-black"
        onSubmit={handleSubmit}
      >
        <label htmlFor="footer-newsletter-email" className="sr-only">
          E-mail para receber novidades
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Digite seu e-mail"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.08em] text-black transition-colors hover:bg-neutral-200 disabled:cursor-wait disabled:opacity-60 sm:px-7"
        >
          {isPending ? 'Enviando' : 'Assinar'}
        </button>
      </form>
      {message && <p className="mt-2 text-xs text-neutral-400">{message}</p>}
    </div>
  )
}
