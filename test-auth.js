const { createClient } = require('@supabase/supabase-js');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(process.cwd());

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Configure as variáveis públicas do Supabase em .env.local.');
}

if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
  throw new Error('Defina TEST_ADMIN_EMAIL e TEST_ADMIN_PASSWORD apenas no ambiente local.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function test() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: process.env.TEST_ADMIN_EMAIL,
    password: process.env.TEST_ADMIN_PASSWORD
  });
  
  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }
  
  console.log('User ID:', auth.user.id);
  
  const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.user.id).single();
  
  console.log('Profile Error:', error?.message);
  console.log('Profile Data:', data);
}

test();
