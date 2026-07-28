const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://szntzeclwouyidfossrk.supabase.co';
const supabaseKey = 'sb_publishable__8fluEp5frSCj8e6L4Ey7A_yD38juUJ';

const supabase = createClient(supabaseUrl, supabaseKey);

const TOP_20_BRAND_NAMES = [
  'PLASUTIL',
  'ARQPLAST',
  'JAGUAR',
  'BANDEIRANTES',
  'RISCHIOTO',
  'PLASMONT',
  'PLASNEW',
  'STARTOOLS',
  'ORIGINAL LINE',
  'SAO BERNARDO',
  'ERCAPLAST',
  'VASO BELLO',
  'METALTRU',
  'STOLF',
  'KEITA',
  'PLAST LEO',
  'MAXXIMO',
  'LIG BRINK',
  'GOYAMA',
  'AMIGOLD'
];

// Mapeamento de sinonimos / grafias duplicadas para o ID da marca oficial
const ALIASES = {
  'POS  INDUSTRIA ARQPLAST': 'ARQPLAST',
  'POS NDUSTRIA ARQPLAST': 'ARQPLAST',
  'BANDEIRANTE': 'BANDEIRANTES',
  'BANDEIRNATES': 'BANDEIRANTES',
  'ALUMINIOS ERCA': 'ERCAPLAST',
  'ALUMINIO ERCA': 'ERCAPLAST',
  'ERCPLAST': 'ERCAPLAST',
  'LIG BRIN': 'LIG BRINK',
  'PLASTLEO': 'PLAST LEO',
  'ORIGINAL': 'ORIGINAL LINE',
  'ORGINAL GLASS': 'ORIGINAL LINE',
  'ORIGINAL GLASS': 'ORIGINAL LINE',
  'CLEN TECH': 'CLEAN TECH',
};

async function main() {
  console.log('🔑 Realizando autenticação como Admin...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'admin@camposecoelho.com.br',
    password: 'Admin@2026!'
  });

  if (authError) {
    console.error('❌ Falha no login Admin:', authError.message);
    process.exit(1);
  }

  console.log('✅ Admin autenticado com sucesso!');

  // 1. Buscar todas as marcas da tabela
  const { data: brands, error: brandsErr } = await supabase.from('brands').select('*');
  if (brandsErr) {
    console.error('❌ Erro ao buscar marcas:', brandsErr.message);
    process.exit(1);
  }

  const brandMapByName = new Map();
  brands.forEach(b => brandMapByName.set(b.name.toUpperCase(), b));

  // Identificar IDs das 20 marcas principais
  const top20BrandIds = new Set();
  TOP_20_BRAND_NAMES.forEach(name => {
    const brand = brandMapByName.get(name);
    if (brand) {
      top20BrandIds.add(brand.id);
    } else {
      console.warn(`⚠️ Marca "${name}" não foi encontrada diretamente na tabela.`);
    }
  });

  console.log(`📌 Encontradas ${top20BrandIds.size} de 20 marcas principais.`);

  // 2. Reatribuir produtos de marcas duplicadas/alias para a marca oficial
  for (const [aliasName, targetName] of Object.entries(ALIASES)) {
    const aliasBrand = brandMapByName.get(aliasName);
    const targetBrand = brandMapByName.get(targetName);

    if (aliasBrand && targetBrand) {
      console.log(`🔄 Reatribuindo produtos de "${aliasName}" para "${targetName}"...`);
      const { error: updateProdErr } = await supabase
        .from('products')
        .update({ brand_id: targetBrand.id })
        .eq('brand_id', aliasBrand.id);

      if (updateProdErr) {
        console.error(`⚠️ Erro ao atualizar produtos de ${aliasName}:`, updateProdErr.message);
      }
    }
  }

  // 3. Ativar APENAS as 20 marcas principais e desativar as demais
  console.log('⚡ Atualizando status `is_active` na tabela de marcas...');

  const { error: deactivateErr } = await supabase
    .from('brands')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // desativa todas

  if (deactivateErr) {
    console.error('❌ Erro ao desativar marcas:', deactivateErr.message);
  }

  for (const brandId of top20BrandIds) {
    const { error: activateErr } = await supabase
      .from('brands')
      .update({ is_active: true })
      .eq('id', brandId);

    if (activateErr) {
      console.error(`❌ Erro ao ativar marca ${brandId}:`, activateErr.message);
    }
  }

  // 4. Verificar resultado final
  const { data: activeBrands } = await supabase
    .from('brands')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name');

  console.log('\n🏆 Lista Final das 20 Marcas Ativas no Sistema:');
  console.log(activeBrands.map((b, i) => `${i + 1}. ${b.name} (${b.slug})`).join('\n'));
  console.log(`\n✨ Total de marcas ativas: ${activeBrands.length}`);
}

main().catch(err => {
  console.error('💥 Erro fatal:', err);
});
