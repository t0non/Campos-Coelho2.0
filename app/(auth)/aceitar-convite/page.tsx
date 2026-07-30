import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AcceptInviteContent } from '@/components/auth/accept-invite-content'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ativar acesso administrativo',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AceitarConvitePage() {
  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100" />}>
      <AcceptInviteContent />
    </Suspense>
  )
}
