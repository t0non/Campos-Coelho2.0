/**
 * Script para criar um usuário admin diretamente no Supabase.
 * Rode com: npx tsx scripts/create-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
const ADMIN_EMAIL = process.env.ADMIN_INITIAL_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error(
    'Configure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, ADMIN_INITIAL_EMAIL e ADMIN_INITIAL_PASSWORD no ambiente local.',
  )
}

const config = {
  supabaseUrl: SUPABASE_URL,
  supabaseSecretKey: SUPABASE_SECRET_KEY,
  adminEmail: ADMIN_EMAIL,
  adminPassword: ADMIN_PASSWORD,
}

async function main() {
  console.log('🔧 Criando cliente admin do Supabase...')

  const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // 1. Criar o usuário no Auth
  console.log(`📧 Criando usuário: ${config.adminEmail}`)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: config.adminEmail,
    password: config.adminPassword,
    email_confirm: true, // Já confirma o e-mail automaticamente
  })

  if (authError) {
    // Se já existe, tenta buscar
    if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
      console.log('⚠️  Usuário já existe no Auth. Buscando ID...')
      
      const { data: listData, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) {
        console.error('❌ Erro ao listar usuários:', listError.message)
        process.exit(1)
      }

      const existingUser = listData.users.find((u) => u.email === config.adminEmail)
      if (!existingUser) {
        console.error('❌ Não consegui encontrar o usuário existente.')
        process.exit(1)
      }

      console.log(`✅ Encontrado! ID: ${existingUser.id}`)

      // Atualizar o perfil para admin
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          role: 'admin',
          full_name: 'Administrador',
          email: config.adminEmail,
        }, { onConflict: 'id' })

      if (upsertError) {
        console.error('❌ Erro ao atualizar perfil:', upsertError.message)
        process.exit(1)
      }

      console.log('✅ Perfil atualizado para admin!')
    } else {
      console.error('❌ Erro ao criar usuário:', authError.message)
      process.exit(1)
    }
  } else {
    const userId = authData.user.id
    console.log(`✅ Usuário criado! ID: ${userId}`)

    // 2. Criar o perfil com role = admin
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        role: 'admin',
        full_name: 'Administrador',
        email: config.adminEmail,
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message)
      process.exit(1)
    }

    console.log('✅ Perfil admin criado!')
  }

  console.log('')
  console.log('═══════════════════════════════════════════')
  console.log('  🎉 ADMIN CRIADO COM SUCESSO!')
  console.log('═══════════════════════════════════════════')
  console.log(`  📧 E-mail:  ${config.adminEmail}`)
  console.log('  🔑 Senha:   definida pela variável ADMIN_INITIAL_PASSWORD')
  console.log('═══════════════════════════════════════════')
  console.log('')
  console.log('Faça login em http://localhost:3000/login')
  console.log('Você será redirecionado para /admin automaticamente.')
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
