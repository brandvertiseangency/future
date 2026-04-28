'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#0a0a0a] p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {description && <p className="mt-2 text-xs text-white/55">{description}</p>}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold"
            style={{
              background: tone === 'danger' ? 'rgba(239,68,68,0.92)' : 'rgba(255,255,255,0.9)',
              color: tone === 'danger' ? '#fff' : '#000',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
