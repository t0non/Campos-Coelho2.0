'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    if (loading) return

    setLoading(true)
    const { error } = await supabase.auth.signOut({ scope: 'local' })

    if (error) {
      console.error('Erro ao encerrar sessão:', error.message)
      setLoading(false)
      return
    }

    window.location.replace('/')
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      loading={loading}
      fullWidth
      className="text-gray-600 hover:text-red-600"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair da Conta
    </Button>
  )
}
