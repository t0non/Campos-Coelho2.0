$src = 'C:\Users\Eduardo Tonon\.gemini\antigravity-ide\brain\5dc8f4c3-c93f-4678-bf24-5498fd782898\hero_salao_1785185012811.png'
$destDir = "public\images\shaiff"
$destServicos = "public\images\shaiff\servicos"

New-Item -ItemType Directory -Force -Path $destDir | Out-Null
New-Item -ItemType Directory -Force -Path $destServicos | Out-Null

$files = @(
  'hero-salao.png',
  'ambiente.png',
  'ambiente-interno.png',
  'servico.png',
  'galeria-01.png',
  'galeria-02.png',
  'galeria-03.png',
  'galeria-04.png',
  'galeria-05.png',
  'galeria-06.png',
  'servicos\cortes-de-cabelo.png',
  'servicos\escova.png',
  'servicos\nutricao-e-hidratacao-capilar.png',
  'servicos\selagem-capilar.png',
  'servicos\mechas.png',
  'servicos\depilacao-feminina.png',
  'servicos\manicure-e-pedicure.png',
  'servicos\design-de-sobrancelha.png'
)

foreach ($f in $files) {
  $dest = Join-Path -Path $destDir -ChildPath $f
  Copy-Item -Path $src -Destination $dest -Force
}

Write-Host "Copy completed successfully."
