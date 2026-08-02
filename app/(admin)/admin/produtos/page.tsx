import { requireAdmin } from '@/lib/supabase/auth'
import { getAdminProducts } from '@/lib/data/admin-products'
import { AdminPageHeader } from '@/components/admin/admin-page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter, Tags } from 'lucide-react'
import Link from 'next/link'
import { getAdminCategories } from '@/lib/data/admin-catalog'
import { getAdminBrands } from '@/lib/data/admin-catalog'
import Image from 'next/image'
import { correlateProductCategoriesAction } from '@/app/actions/catalog'
import { synchronizeLatestImportedCatalogAction } from '@/app/actions/catalog-sync'
import { getCategoryProductFallbackImage } from '@/lib/catalog/product-image-fallback'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    category?: string
    brand?: string
    status?: string
    publication?: string
    sort?: string
    page?: string
    categorias?: string
    processados?: string
    atualizados?: string
    precos?: string
    valores?: string
    estoques?: string
    sincronizacao?: string
    produtos?: string
    inferidos?: string
  }>
}) {
  await requireAdmin()
  const params = await searchParams

  const page = parseInt(params.page || '1', 10)
  const limit = 20

  const { data: products, count } = await getAdminProducts({
    q: params.q,
    category: params.category,
    brand: params.brand,
    status: params.status,
    publication: params.publication,
    sort: params.sort,
    page: page,
    pageSize: limit,
  })

  // Para filtros
  const { data: categories } = await getAdminCategories()
  const { data: brands } = await getAdminBrands()

  const totalPages = Math.ceil(count / limit)
  
  // Storage public URL builder
  const getImageUrl = (path: string) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Produtos"
        description="Gerencie os produtos do seu catálogo B2B."
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
            <Link href="/admin/produtos/importar?mode=import_update" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-800 hover:border-neutral-950">
              Importar planilha
            </Link>
            <Link href="/admin/produtos/novo" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white hover:bg-neutral-800">
              <Plus className="h-4 w-4" />
              Novo produto
            </Link>
            <details className="group relative col-span-2 sm:order-first">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm font-bold text-neutral-700 hover:border-neutral-950">
                Mais ações
              </summary>
              <div className="mt-2 grid gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg sm:absolute sm:right-0 sm:z-30 sm:w-72">
                <form action={synchronizeLatestImportedCatalogAction}>
                  <Button type="submit" variant="outline" className="min-h-10 w-full justify-start">
                    Aplicar preços e nomes da planilha
                  </Button>
                </form>
                <form action={correlateProductCategoriesAction}>
                  <Button type="submit" variant="outline" className="min-h-10 w-full justify-start">
                    <Tags className="h-4 w-4" />
                    Correlacionar categorias
                  </Button>
                </form>
              </div>
            </details>
          </div>
        }
      />

      {params.categorias === 'correlacionadas' && (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Categorias correlacionadas com sucesso em {params.processados ?? 'todos os'} produtos.
          {' '}
          {params.atualizados ?? '0'} cadastros precisaram ser atualizados.
        </div>
      )}

      {(params.precos === 'corrigidos' || params.precos === 'ja-corrigidos') && (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {params.precos === 'corrigidos'
            ? `${params.valores ?? '0'} preços importados foram corrigidos e os produtos foram liberados para pedidos.`
            : `Os preços desta importação já estavam corrigidos (${params.valores ?? '0'} registros).`}
        </div>
      )}

      {params.sincronizacao === 'concluida' && (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {params.produtos ?? '0'} produtos foram padronizados e {params.precos ?? '0'} preços foram sincronizados com a planilha.
          {' '}
          {params.inferidos === '1'
            ? 'O único preço zerado foi preenchido pelo produto idêntico encontrado no arquivo.'
            : `${params.inferidos ?? '0'} preços zerados foram preenchidos por produtos idênticos.`}
        </div>
      )}

      {/* FILTROS (Mínimos por GET Form para manter sem state client) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <form className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_repeat(4,minmax(8rem,11rem))_auto] xl:items-end" method="GET" action="/admin/produtos">
          <div className="sm:col-span-2 xl:col-span-1">
            <label className="text-xs text-muted-foreground mb-1 block">Buscar</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Nome, Slug ou SKU"
                className="w-full pl-9 h-9 flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
            <select name="category" defaultValue={params.category} className="w-full h-9 flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="">Todas</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Marca</label>
            <select name="brand" defaultValue={params.brand} className="w-full h-9 flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="">Todas</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Publicação</label>
            <select name="publication" defaultValue={params.publication} className="w-full h-9 flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="">Todas</option>
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Status</label>
            <select name="status" defaultValue={params.status} className="w-full h-9 flex rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div className="flex gap-2 sm:col-span-2 xl:col-span-1">
            <Button type="submit" variant="secondary" className="h-10 flex-1 xl:flex-none">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </Button>
            {(params.q || params.category || params.brand || params.status || params.publication) && (
              <Link href="/admin/produtos" className="inline-flex h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-medium text-slate-700 hover:bg-slate-100 xl:flex-none">
                Limpar
              </Link>
            )}
          </div>
        </form>
      </div>

      <div className="grid gap-3 lg:hidden">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
            Nenhum produto encontrado.
          </div>
        ) : products.map((product) => {
          const primaryImage = product.images?.[0]?.url
          const displayImage = primaryImage
            ? getImageUrl(primaryImage)!
            : getCategoryProductFallbackImage(product.category?.slug)

          return (
            <article key={product.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
                  <Image src={displayImage} alt={product.name} fill className="object-contain p-1.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="line-clamp-2 text-sm font-extrabold text-neutral-950">{product.name}</h2>
                  <p className="mt-1 truncate font-mono text-xs text-neutral-500">{product.sku || product.slug}</p>
                  <p className="mt-1 truncate text-xs text-neutral-500">
                    {product.category?.name || 'Sem categoria'} · {product.brand?.name || 'Sem marca'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
                <StatusBadge isActive={product.is_published} activeLabel="Publicado" inactiveLabel="Rascunho" />
                <StatusBadge isActive={product.is_active} activeLabel="Ativo" inactiveLabel="Inativo" />
                <span className="text-xs text-neutral-500">{product.variants[0]?.count || 0} variantes</span>
                <Link href={`/admin/produtos/${product.id}`} className="ml-auto inline-flex min-h-10 items-center justify-center rounded-lg border border-neutral-300 px-4 text-xs font-bold text-neutral-800">
                  Editar
                </Link>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Imagem</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>SKU / Slug</TableHead>
              <TableHead>Categoria / Marca</TableHead>
              <TableHead>Variantes</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const primaryImage = product.images?.[0]?.url
                const displayImage = primaryImage
                  ? getImageUrl(primaryImage)!
                  : getCategoryProductFallbackImage(product.category?.slug)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-10 w-10 relative rounded border overflow-hidden bg-muted flex items-center justify-center">
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{product.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{product.sku}</div>
                      <div className="text-xs text-muted-foreground">{product.slug}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{product.category?.name || '-'}</div>
                      <div className="text-xs text-muted-foreground">{product.brand?.name || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{product.variants[0]?.count || 0}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={product.is_published} activeLabel="Publicado" inactiveLabel="Rascunho" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={product.is_active} activeLabel="Ativo" inactiveLabel="Inativo" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/produtos/${product.id}`} className="inline-flex items-center justify-center gap-2 font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 h-8 px-3 text-xs rounded-md">
                        Editar
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando página {page} de {totalPages} ({count} produtos no total)
          </p>
          <div className="flex gap-2">
            {page <= 1 ? (
              <span className="inline-flex items-center justify-center gap-2 font-medium border border-slate-300 text-slate-700 bg-white opacity-50 cursor-not-allowed h-8 px-3 text-xs rounded-md">Anterior</span>
            ) : (
              <Link href={`/admin/produtos?${new URLSearchParams({...params, page: String(page - 1)}).toString()}`} className="inline-flex items-center justify-center gap-2 font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 h-8 px-3 text-xs rounded-md">
                Anterior
              </Link>
            )}
            {page >= totalPages ? (
              <span className="inline-flex items-center justify-center gap-2 font-medium border border-slate-300 text-slate-700 bg-white opacity-50 cursor-not-allowed h-8 px-3 text-xs rounded-md">Próxima</span>
            ) : (
              <Link href={`/admin/produtos?${new URLSearchParams({...params, page: String(page + 1)}).toString()}`} className="inline-flex items-center justify-center gap-2 font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 h-8 px-3 text-xs rounded-md">
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
