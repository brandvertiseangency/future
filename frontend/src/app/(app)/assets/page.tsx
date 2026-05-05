'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ImageIcon, Upload, Download, Trash2, Sparkles, Loader2, Package, Plus, Tag, DollarSign, X } from 'lucide-react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { BlurFade } from '@/components/ui/blur-fade'
import { DotPattern } from '@/components/ui/dot-pattern'
import { AIButton } from '@/components/ui/ai-button'
import { PageContainer, PageHeader, SurfaceCard } from '@/components/ui/page-primitives'
import { apiCall, apiUpload } from '@/lib/api'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#f43f5e', linkedin: '#3b82f6', twitter: '#94a3b8',
  facebook: '#2563eb', tiktok: '#10b981',
}

interface Asset {
  id: string
  url: string
  type: string
  platform?: string
  label?: string
  created_at: string
}

interface Product {
  id: string
  name: string
  description?: string
  price?: string
  category?: string
  tags?: string[]
  images: string[]
  visual_description?: string
  is_primary: boolean
  created_at: string
}

const fetcher = <T,>(url: string): Promise<T> => apiCall(url) as Promise<T>

// ─── Add Product Modal ────────────────────────────────────────────────────────
function AddProductModal({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: '', visual_description: '' })
  const [productImageUrl, setProductImageUrl] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name is required'); return }
    setSaving(true)
    try {
      await apiCall('/api/brand-products', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          images: productImageUrl ? [productImageUrl] : [],
        }),
      })
      toast.success('Product added!')
      onSaved()
      onClose()
    } catch { toast.error('Failed to add product') }
    finally { setSaving(false) }
  }

  const handleImagePick = async (file: File | null) => {
    if (!file) return
    setUploadingImage(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const data = await apiUpload('/api/brand-products/upload-image', fd) as { url?: string }
      if (!data?.url) throw new Error('Upload failed')
      setProductImageUrl(data.url)
      toast.success('Product image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl border border-white/[0.10] bg-[#0a0a0a] p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-base">Add Product / Service</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-card/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
            <X size={13} />
          </button>
        </div>
        {[
          { key: 'name', label: 'Name *', placeholder: 'e.g. Signature Serum' },
          { key: 'description', label: 'Description', placeholder: 'Short product description' },
          { key: 'price', label: 'Price', placeholder: 'e.g. ₹2,499' },
          { key: 'category', label: 'Category', placeholder: 'e.g. Skincare' },
          { key: 'visual_description', label: 'Visual Description (for AI)', placeholder: 'e.g. sleek gold bottle on marble surface' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-[10px] text-white/30 uppercase tracking-[0.1em] mb-1">{label}</label>
            <input
              value={form[key as keyof typeof form]}
              onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-card/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/[0.22] transition-all"
            />
          </div>
        ))}
        <div>
          <label className="block text-[10px] text-white/30 uppercase tracking-[0.1em] mb-1">Product Image</label>
          <div className="flex items-center gap-2">
            <label className="px-3 py-2 rounded-xl border border-white/[0.10] bg-card/[0.03] text-white/60 text-xs cursor-pointer hover:border-white/[0.2] transition-colors">
              {uploadingImage ? 'Uploading…' : 'Attach Image'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImagePick(e.target.files?.[0] ?? null)}
                disabled={uploadingImage}
              />
            </label>
            {productImageUrl && (
              <span className="text-[11px] text-emerald-400/80">Image attached</span>
            )}
          </div>
          {productImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={productImageUrl} alt="Product preview" className="mt-2 w-16 h-16 rounded-lg object-cover border border-white/[0.1]" />
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="w-full h-10 rounded-xl bg-card text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-card/90 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {saving ? 'Saving…' : 'Add Product'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onDelete }: { product: Product; onDelete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden hover:border-white/[0.16] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      {/* Image */}
      <div className="aspect-square bg-card/[0.03] relative overflow-hidden flex items-center justify-center">
        {product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <Package size={32} className="text-white/10" />
        )}
        {product.is_primary && (
          <span className="absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400">Primary</span>
        )}
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center hover:bg-red-900/60 transition-all"
          >
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3 border-t border-white/[0.05]">
        <p className="text-white/80 font-medium text-[13px] truncate">{product.name}</p>
        {product.price && (
          <p className="text-white/35 text-[11px] flex items-center gap-1 mt-0.5">
            <DollarSign size={9} />{product.price}
          </p>
        )}
        {product.category && (
          <p className="text-white/25 text-[10px] flex items-center gap-1 mt-1">
            <Tag size={9} />{product.category}
          </p>
        )}
        {product.description && (
          <p className="text-white/30 text-[10.5px] mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
        )}
        {product.visual_description && (
          <p className="text-white/20 text-[9.5px] italic mt-1 line-clamp-1">AI: {product.visual_description}</p>
        )}
      </div>
    </motion.div>
  )
}

// ─── Asset Card ───────────────────────────────────────────────────────────────
function AssetCard({ asset, onDelete }: { asset: Asset; onDelete: () => void }) {
  const platformColor = PLATFORM_COLORS[asset.platform?.toLowerCase() ?? '']
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl border border-white/[0.08] bg-[#0a0a0a] overflow-hidden hover:border-white/[0.16] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    >
      <div className="aspect-square bg-card/[0.03] relative overflow-hidden flex items-center justify-center">
        {asset.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset.url} alt={asset.label ?? ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <ImageIcon size={28} className="text-white/10" />
        )}
        {asset.platform && (
          <span className="absolute top-2 left-2 text-[9px] font-semibold capitalize px-2 py-0.5 rounded-md" style={{ background: `${platformColor}20`, color: platformColor, border: `1px solid ${platformColor}35` }}>
            {asset.platform}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2 gap-1.5">
          <a href={asset.url} download target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center hover:bg-card/10 transition-all">
            <Download size={13} className="text-white/60" />
          </a>
          <button onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-black/60 backdrop-blur-sm border border-white/[0.12] flex items-center justify-center hover:bg-red-900/60 transition-all">
            <Trash2 size={13} className="text-red-400" />
          </button>
        </div>
      </div>
      <div className="px-3 py-2.5 border-t border-white/[0.05]">
        <p className="text-white/40 text-[10px]">{asset.label ?? asset.type ?? 'Asset'}</p>
        <p className="text-white/20 text-[9px] mt-0.5">{new Date(asset.created_at).toLocaleDateString()}</p>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const [tab, setTab] = useState<'assets' | 'products'>('assets')
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const assetsKey = `/api/assets?q=${query}`
  const productsKey = '/api/brand-products'

  const { data: assetsData, isLoading: assetsLoading } = useSWR(assetsKey, fetcher<{ assets: Asset[] }>, { dedupingInterval: 20000 })
  const { data: productsData, isLoading: productsLoading, mutate: mutateProducts } = useSWR(productsKey, fetcher<{ products: Product[] }>, { dedupingInterval: 20000 })

  const assets = assetsData?.assets ?? []
  const products = productsData?.products ?? []

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const form = new FormData()
      Array.from(files).forEach((f) => form.append('files', f))
      await fetch('/api/assets/upload', { method: 'POST', body: form, credentials: 'include' })
      mutate(assetsKey)
      toast.success('Uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  async function handleDeleteAsset(id: string) {
    await apiCall(`/api/assets/${id}`, { method: 'DELETE' })
    mutate(assetsKey)
    setAssetToDelete(null)
  }

  async function handleDeleteProduct(id: string) {
    await apiCall(`/api/brand-products/${id}`, { method: 'DELETE' })
    mutateProducts()
    setProductToDelete(null)
  }

  const isLoading = tab === 'assets' ? assetsLoading : productsLoading

  return (
    <PageContainer className="min-h-[calc(100vh-64px)]">
      {/* Header */}
      <BlurFade delay={0}>
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader
            variant="compact"
            title="Asset library"
            description="Your generated content and brand products."
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1 sm:max-w-[260px]">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Search…"
              />
            </div>

            {tab === 'assets' ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-muted/50 disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddProduct(true)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:bg-muted/50"
              >
                <Plus size={14} /> Add product
              </button>
            )}
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />

            <Link href="/generate">
              <AIButton className="flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium">
                <Sparkles size={13} className="text-[var(--ai-color)]" />
                Generate
              </AIButton>
            </Link>
          </div>
        </div>
      </BlurFade>

      {/* Tabs */}
      <div className="mb-6 flex w-fit items-center gap-1 rounded-xl border border-border/80 bg-muted/30 p-1">
        {([
          { key: 'assets', label: 'Generated Assets', icon: ImageIcon, count: assets.length },
          { key: 'products', label: 'Products & Services', icon: Package, count: products.length },
        ] as const).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              tab === key
                ? 'border border-primary/25 bg-primary/10 text-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
            )}
          >
            <Icon size={13} />
            {label}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px]',
                tab === key ? 'bg-primary/15 text-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 size={24} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Assets Tab */}
      {!isLoading && tab === 'assets' && (
        assets.length === 0 ? (
          <SurfaceCard className="relative overflow-hidden" >
            <DotPattern className="absolute inset-0 text-white/[0.04] opacity-50" width={24} height={24} />
            <div className="relative flex flex-col items-center justify-center h-[400px] gap-5">
              <div className="w-16 h-16 rounded-2xl bg-card/[0.04] border border-white/[0.08] flex items-center justify-center">
                <ImageIcon size={28} className="text-white/15" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-white/50">No assets yet</p>
                <p className="text-[13px] text-white/25 mt-1">Generated content and uploaded files will appear here</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.10] text-white/50 text-sm hover:bg-card/[0.05] transition-all">
                  <Upload size={13} />Upload
                </button>
                <Link href="/generate"><AIButton className="px-4 py-2 rounded-xl text-sm"><Sparkles size={13} className="mr-1.5" />Generate</AIButton></Link>
              </div>
            </div>
          </SurfaceCard>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onDelete={() => setAssetToDelete(asset.id)} />
            ))}
          </div>
        )
      )}

      {/* Products Tab */}
      {!isLoading && tab === 'products' && (
        products.length === 0 ? (
          <SurfaceCard className="relative overflow-hidden">
            <DotPattern className="absolute inset-0 text-white/[0.04] opacity-50" width={24} height={24} />
            <div className="relative flex flex-col items-center justify-center h-[400px] gap-5">
              <div className="w-16 h-16 rounded-2xl bg-card/[0.04] border border-white/[0.08] flex items-center justify-center">
                <Package size={28} className="text-white/15" />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-white/50">No products yet</p>
                <p className="text-[13px] text-white/25 mt-1">Add your products and services for AI to feature in content</p>
              </div>
              <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card text-black text-sm font-semibold hover:bg-card/90 transition-all">
                <Plus size={14} />Add Product
              </button>
            </div>
          </SurfaceCard>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onDelete={() => setProductToDelete(product.id)} />
            ))}
            {/* Add another */}
            <button
              onClick={() => setShowAddProduct(true)}
              className="rounded-2xl border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 aspect-square hover:border-white/[0.18] hover:bg-card/[0.02] transition-all group"
            >
              <Plus size={20} className="text-white/20 group-hover:text-white/40 transition-colors" />
              <p className="text-white/20 text-xs group-hover:text-white/40 transition-colors">Add Product</p>
            </button>
          </div>
        )
      )}

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddProduct && (
          <AddProductModal
            onClose={() => setShowAddProduct(false)}
            onSaved={() => mutateProducts()}
          />
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={!!assetToDelete}
        title="Delete this asset?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setAssetToDelete(null)}
        onConfirm={() => assetToDelete && handleDeleteAsset(assetToDelete)}
      />
      <ConfirmDialog
        open={!!productToDelete}
        title="Delete this product?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        tone="danger"
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => productToDelete && handleDeleteProduct(productToDelete)}
      />
    </PageContainer>
  )
}
