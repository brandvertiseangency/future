'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Plus, Loader2, ImageIcon, Tag, ChevronRight, Pencil, Trash2, CheckCircle2, Sparkles } from 'lucide-react'
import { useOnboardingStore, type ProductItem } from '@/stores/onboarding'
import { apiCall } from '@/lib/api'
import { cn } from '@/lib/utils'
import { AIButton } from '@/components/ui/ai-button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Product Edit Modal ───────────────────────────────────────────────────────

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
        }
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="w-full max-w-[640px] max-h-[90vh] overflow-y-auto rounded-2xl border border-white/[0.10] bg-[#0d0d0d]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <p className="text-white font-semibold text-base">Product details</p>
            <p className="text-white/40 text-xs mt-0.5">Used by the AI in prompts and content calendar</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 grid grid-cols-2 gap-6">
          {/* Left — form fields */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Product name *</label>
              <input
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                placeholder="e.g. Signature Kurta Set"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Short description (AI context)</label>
              <textarea
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20 resize-none"
                placeholder="e.g. Handwoven cotton kurta with thread embroidery, available in 6 colours"
                value={draft.description}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Price / offer</label>
              <input
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                placeholder="e.g. ₹2,499 · 20% off this week"
                value={draft.price}
                onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Category</label>
              <input
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                placeholder="e.g. ethnic wear"
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {draft.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-white/60 text-[11px]">
                    {tag}
                    <button onClick={() => setDraft((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }))} className="hover:text-white">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20"
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button onClick={addTag} className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60 text-xs hover:text-white hover:border-white/20 transition-colors">
                  Add
                </button>
              </div>
            </div>
            <div>
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-2">Use this product in</label>
              <div className="flex flex-col gap-2">
                {USE_IN_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleUseIn(key)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left',
                      draft.useIn.includes(key)
                        ? 'border-white/20 bg-white/[0.06] text-white'
                        : 'border-white/[0.06] text-white/40 hover:border-white/12'
                    )}
                  >
                    <div className={cn('w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0', draft.useIn.includes(key) ? 'bg-white border-white' : 'border-white/20')}>
                      {draft.useIn.includes(key) && <CheckCircle2 size={10} className="text-black" />}
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — image upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Product images</label>
              <span className="text-white/25 text-[10px]">{draft.images.length}/4</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {draft.images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((_, idx) => idx !== i) }))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={10} />
                  </button>
                  {i === 0 && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-white/80 text-[9px] text-black font-medium">Primary</div>
                  )}
                </div>
              ))}
              {draft.images.length < 4 && (
                <div
                  {...getRootProps()}
                  className={cn(
                    'aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors',
                    isDragActive ? 'border-white/40 bg-white/[0.06]' : 'border-white/[0.10] hover:border-white/20'
                  )}
                >
                  <input {...getInputProps()} />
                  <Plus size={16} className="text-white/30" />
                </div>
              )}
            </div>
            {/* Vision AI analyse */}
            {draft.images.length > 0 && (
              <button
                onClick={analyseWithVision}
                disabled={analysing}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/[0.10] text-white/50 text-xs hover:border-white/20 hover:text-white/70 transition-all disabled:opacity-50"
              >
                {analysing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {analysing ? 'Analysing with Vision AI...' : 'Auto-detect visual description'}
              </button>
            )}
            {draft.visualDescription && (
              <div className="mt-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">AI visual description</p>
                <p className="text-white/60 text-xs leading-relaxed">{draft.visualDescription}</p>
              </div>
            )}
            {!draft.visualDescription && (
              <div className="mt-3">
                <label className="text-white/40 text-[10px] uppercase tracking-wider font-medium block mb-1.5">Visual description (manual)</label>
                <textarea
                  rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-white/25 transition-colors placeholder:text-white/20 resize-none"
                  placeholder="e.g. Teal cotton kurta with white thread embroidery, ethnic silhouette, festive occasion"
                  value={draft.visualDescription}
                  onChange={(e) => setDraft((d) => ({ ...d, visualDescription: e.target.value }))}
                />
              </div>
            )}
            <p className="text-white/25 text-[10px] mt-2">Images used as AI reference · stored securely</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-5 border-t border-white/[0.06]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            disabled={!draft.name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40"
          >
            Save product
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Product Card ─────────────────────────────────────────────────────────────

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
      'rounded-xl border overflow-hidden transition-all',
      product.isPrimary ? 'border-white/20' : 'border-white/[0.08] hover:border-white/12'
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-square bg-white/[0.04] flex items-center justify-center">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon size={24} className="text-white/20" />
        )}
        {product.isPrimary && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-white/80 text-[9px] text-black font-semibold">Primary</div>
        )}
        {product.visualDescription && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={10} className="text-emerald-400" />
          </div>
        )}
      </div>
      {/* Info */}
      <div className="p-2.5">
        <p className="text-white text-xs font-medium truncate">{product.name}</p>
        <p className="text-white/40 text-[10px] truncate">{product.category}</p>
      </div>
      {/* Actions */}
      <div className="flex gap-1.5 px-2.5 pb-2.5">
        <button
          onClick={onEdit}
          className="flex-1 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.06] text-white/50 text-[10px] hover:text-white hover:border-white/12 transition-colors flex items-center justify-center gap-1"
        >
          <Pencil size={9} /> Edit
        </button>
        <button
          onClick={onTogglePrimary}
          className={cn(
            'flex-1 py-1.5 rounded-lg border text-[10px] transition-colors flex items-center justify-center gap-1',
            product.isPrimary
              ? 'bg-white/[0.08] border-white/20 text-white'
              : 'bg-white text-black border-white text-[10px]'
          )}
        >
          {product.isPrimary ? 'Primary' : 'Set primary'}
        </button>
        <button
          onClick={onRemove}
          className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 hover:text-red-400 hover:border-red-500/20 transition-colors flex items-center justify-center"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}

// ─── Step Product Library ─────────────────────────────────────────────────────

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
    <div className="space-y-8">
      <div>
        <h2 className="text-white font-bold text-3xl tracking-tight">Product library</h2>
        <p className="text-white/40 text-sm mt-2">
          Upload your real product images and name them clearly. The AI will reference these when generating posts and images.
        </p>
      </div>

      {/* How it works flow */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        {[
          'Product uploaded',
          'Vision AI analyses',
          'Description stored',
          'Prompt engine uses it',
          'Output references real product',
        ].map((label, i, arr) => (
          <span key={label} className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/50 text-[10px]">
              {label}
            </span>
            {i < arr.length - 1 && <ChevronRight size={11} className="text-white/20 flex-shrink-0" />}
          </span>
        ))}
      </div>

      {/* Grid */}
      {products.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
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
              onClick={() => { setShowAddModal(true) }}
              className="rounded-xl border-2 border-dashed border-white/[0.08] flex flex-col items-center justify-center aspect-square hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer"
            >
              <Plus size={18} className="text-white/25 mb-1" />
              <span className="text-white/30 text-[10px]">Add product</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 && (
        <div
          onClick={() => setShowAddModal(true)}
          className="border-2 border-dashed border-white/[0.08] rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-white/20 hover:bg-white/[0.01] transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <ImageIcon size={22} className="text-white/30" />
          </div>
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">Add your first product</p>
            <p className="text-white/30 text-xs mt-1">Upload real product images · max 20 products · up to 10MB each</p>
          </div>
          <span className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/[0.10] text-white/50 text-xs hover:text-white hover:border-white/20 transition-colors">
            <Plus size={12} /> Add product
          </span>
        </div>
      )}

      {/* Optional notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
        <Tag size={13} className="text-white/30 mt-0.5 flex-shrink-0" />
        <p className="text-white/35 text-xs leading-relaxed">
          This step is optional — you can also add products later from the Generate page or your Brand Settings. Products you add here will be available when building your content calendar.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={() => setStep(9)}
          className="px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors"
        >
          Back
        </button>
        <AIButton onClick={() => setStep(11)} className="flex-1">
          {products.length === 0 ? 'Skip for now' : `Continue with ${products.length} product${products.length > 1 ? 's' : ''}`}
        </AIButton>
      </div>

      {/* Modals */}
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
