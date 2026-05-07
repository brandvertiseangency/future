'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Plus, Loader2, ImageIcon, Tag, ChevronRight, Pencil, Trash2, CheckCircle2, Sparkles } from 'lucide-react'
import { useOnboardingStore, type ProductItem } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'
import { StepHeader, StepFooter } from '@/components/onboarding/primitives/onboarding-shell'

function genId() {
  return Math.random().toString(36).slice(2, 10)
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const USE_IN_OPTIONS: { key: ProductItem['useIn'][number]; label: string }[] = [
  { key: 'calendar', label: 'Content calendar' },
  { key: 'image_generation', label: 'Image generation' },
  { key: 'social_ads', label: 'Social ads' },
]

interface EditModalProps {
  product: ProductItem
  onSave: (updated: ProductItem) => void
  onClose: () => void
}

function EditModal({ product, onSave, onClose }: EditModalProps) {
  const [draft, setDraft] = useState<ProductItem>({ ...product })
  const [analysing, setAnalysing] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const onDropImages = useCallback(async (files: File[]) => {
    const remaining = 4 - draft.images.length
    for (const file of files.slice(0, remaining)) {
      const b64 = await fileToBase64(file)
      setDraft((d) => ({ ...d, images: [...d.images, b64] }))
    }
  }, [draft.images])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    disabled: draft.images.length >= 4,
  })

  const analyseWithVision = async () => {
    if (draft.images.length === 0) return
    setAnalysing(true)
    try {
      const result = await apiCall<{ visualDescription: string }>(
        '/api/brand-products/analyse-image',
        {
          method: 'POST',
          body: JSON.stringify({ image: draft.images[0], productName: draft.name }),
        },
      )
      setDraft((d) => ({ ...d, visualDescription: result.visualDescription }))
    } catch {
      // user can manually fill
    } finally {
      setAnalysing(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !draft.tags.includes(t)) {
      setDraft((d) => ({ ...d, tags: [...d.tags, t] }))
    }
    setTagInput('')
  }

  const toggleUseIn = (key: ProductItem['useIn'][number]) => {
    setDraft((d) => ({
      ...d,
      useIn: d.useIn.includes(key) ? d.useIn.filter((k) => k !== key) : [...d.useIn, key],
    }))
  }

  const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-foreground/40 focus:outline-none'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
      <div
        className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-base font-semibold text-foreground">Product details</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Used by the AI in prompts and content calendar</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Product name *</label>
              <input
                className={inputClass}
                placeholder="e.g. Signature Kurta Set"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Short description</label>
              <textarea
                rows={2}
                className={cn(inputClass, 'resize-none')}
                placeholder="e.g. Handwoven cotton kurta with thread embroidery"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Price / offer</label>
              <input
                className={inputClass}
                placeholder="e.g. ₹2,499 · 20% off this week"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Category</label>
              <input
                className={inputClass}
                placeholder="e.g. ethnic wear"
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tags</label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {draft.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-foreground">
                    {tag}
                    <button type="button" onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }))} className="hover:text-destructive">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className={cn(inputClass, 'h-9 flex-1 py-1.5 text-xs')}
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="inline-flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted/60"
                >
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Use this product in</label>
              <div className="flex flex-col gap-1.5">
                {USE_IN_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleUseIn(key)}
                    className={cn(
                      'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-left text-xs font-medium transition-colors',
                      draft.useIn.includes(key)
                        ? 'border-foreground bg-muted/60 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-border/70',
                    )}
                  >
                    <span className={cn(
                      'flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border',
                      draft.useIn.includes(key) ? 'border-foreground bg-foreground' : 'border-border',
                    )}>
                      {draft.useIn.includes(key) && <CheckCircle2 size={9} className="text-background" />}
                    </span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Product images</label>
              <span className="text-[10px] text-muted-foreground">{draft.images.length}/4</span>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              {draft.images.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
                  >
                    <X size={10} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 rounded bg-foreground px-1.5 py-0.5 text-[9px] font-medium text-background">Primary</div>
                  )}
                </div>
              ))}
              {draft.images.length < 4 && (
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors',
                    isDragActive ? 'border-foreground/60 bg-muted/40' : 'border-border hover:border-border/70 hover:bg-muted/30',
                  )}
                >
                  <input {...getInputProps()} />
                  <Plus size={16} className="text-muted-foreground" />
                </div>
              )}
            </div>
            {draft.images.length > 0 && (
              <button
                type="button"
                onClick={analyseWithVision}
                disabled={analysing}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/30 text-xs font-medium text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground disabled:opacity-50"
              >
                {analysing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {analysing ? 'Analysing with Vision AI...' : 'Auto-detect visual description'}
              </button>
            )}
            {draft.visualDescription && (
              <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">AI visual description</p>
                <p className="text-xs leading-relaxed text-foreground">{draft.visualDescription}</p>
              </div>
            )}
            {!draft.visualDescription && (
              <div className="mt-3">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Visual description (manual)</label>
                <textarea
                  rows={3}
                  className={cn(inputClass, 'resize-none text-xs')}
                  placeholder="e.g. Teal cotton kurta with white thread embroidery, festive occasion"
                  value={draft.visualDescription}
                  onChange={(e) => setDraft((d) => ({ ...d, visualDescription: e.target.value }))}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim()}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Save product
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  product,
  onEdit,
  onRemove,
  onTogglePrimary,
}: {
  product: ProductItem
  onEdit: () => void
  onRemove: () => void
  onTogglePrimary: () => void
}) {
  return (
    <div className={cn(
      'overflow-hidden rounded-xl border transition-colors',
      product.isPrimary ? 'border-foreground' : 'border-border hover:border-border/70',
    )}>
      <div className="relative flex aspect-square items-center justify-center bg-muted/40">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImageIcon size={22} className="text-muted-foreground" />
        )}
        {product.isPrimary && (
          <div className="absolute left-2 top-2 rounded bg-foreground px-1.5 py-0.5 text-[9px] font-semibold text-background">Primary</div>
        )}
        {product.visualDescription && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
            <CheckCircle2 size={10} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <p className="truncate text-xs font-medium text-foreground">{product.name}</p>
        <p className="truncate text-[10px] text-muted-foreground">{product.category}</p>
      </div>
      <div className="flex gap-1.5 px-2.5 pb-2.5">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border border-border bg-muted/30 py-1.5 text-[10px] text-muted-foreground transition-colors hover:border-border/70 hover:text-foreground"
        >
          <Pencil size={9} /> Edit
        </button>
        <button
          type="button"
          onClick={onTogglePrimary}
          className={cn(
            'inline-flex flex-1 items-center justify-center rounded-md border py-1.5 text-[10px] transition-colors',
            product.isPrimary
              ? 'border-foreground bg-muted/60 text-foreground'
              : 'border-border bg-foreground text-background',
          )}
        >
          {product.isPrimary ? 'Primary' : 'Set primary'}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

export function StepProductLibrary() {
  const { data, addProduct, updateProduct, removeProduct, setStep } = useOnboardingStore()
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const products = data.products || []

  const handleSaveNew = (product: ProductItem) => {
    addProduct(product)
    setShowAddModal(false)
  }

  const handleSaveEdit = (updated: ProductItem) => {
    updateProduct(updated.id, updated)
    setEditingProduct(null)
  }

  const handleTogglePrimary = (id: string) => {
    products.forEach((p) => {
      if (p.id === id) {
        updateProduct(id, { isPrimary: true })
      } else if (p.isPrimary) {
        updateProduct(p.id, { isPrimary: false })
      }
    })
  }

  const newBlankProduct = (): ProductItem => ({
    id: genId(),
    name: '',
    description: '',
    price: '',
    category: '',
    tags: [],
    images: [],
    visualDescription: '',
    useIn: ['calendar', 'image_generation'],
    isPrimary: products.length === 0,
  })

  return (
    <div className="flex h-full flex-col">
      <StepHeader
        eyebrow="Step 10"
        title="Product library"
        description="Upload your real product images and name them clearly. The AI will reference these when generating posts and images."
      />

      <div className="mt-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 p-3">
          {[
            'Product uploaded',
            'Vision AI analyses',
            'Description stored',
            'Prompt engine uses it',
            'Output references real product',
          ].map((label, i, arr) => (
            <span key={label} className="inline-flex items-center gap-2">
              <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
                {label}
              </span>
              {i < arr.length - 1 && <ChevronRight size={11} className="shrink-0 text-muted-foreground/60" />}
            </span>
          ))}
        </div>

        {products.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onRemove={() => removeProduct(product.id)}
                onTogglePrimary={() => handleTogglePrimary(product.id)}
              />
            ))}
            {products.length < 20 && (
              <button
                type="button"
                onClick={() => { setShowAddModal(true) }}
                className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border transition-colors hover:border-border/70 hover:bg-muted/30"
              >
                <Plus size={18} className="mb-1 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add product</span>
              </button>
            )}
          </div>
        )}

        {products.length === 0 && (
          <div
            onClick={() => setShowAddModal(true)}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border p-10 transition-colors hover:border-border/70 hover:bg-muted/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted/40">
              <ImageIcon size={20} className="text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Add your first product</p>
              <p className="mt-1 text-xs text-muted-foreground">Real product images · max 20 products · 10MB each</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Plus size={12} /> Add product
            </span>
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted/20 p-3">
          <Tag size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            This step is optional — you can also add products later from the Generate page or your Brand Settings.
          </p>
        </div>
      </div>

      <StepFooter
        onBack={() => setStep(9)}
        onContinue={() => setStep(11)}
        continueLabel={products.length === 0 ? 'Skip for now' : `Continue with ${products.length} product${products.length > 1 ? 's' : ''}`}
      />

      {showAddModal && (
        <EditModal
          product={newBlankProduct()}
          onSave={handleSaveNew}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}
