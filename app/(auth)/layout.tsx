import type { ReactNode } from 'react'
import { AuthShell } from '@/components/layout/auth-shell'
import { getCategories } from '@/lib/supabase/queries/categories'

/**
 * Layout do grupo de autenticação.
 * Centraliza o formulário na tela — sem header/footer da loja.
 * Aninhado dentro do RootLayout global.
 */
export default async function AuthLayout({ children }: { children: ReactNode }) {
  const categories = await getCategories()
  const headerCategories = categories
    .filter((category) => !category.parent_id)
    .map(({ id, name, slug }) => ({ id, name, slug }))

  return <AuthShell categories={headerCategories}>{children}</AuthShell>
}
