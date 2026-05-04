'use client'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'default' | 'danger'
  /** Light card for app shell pages; default overlay matches dark modals */
  surface?: 'dark' | 'light'
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
  surface = 'dark',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null
  const light = surface === 'light'
  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center p-4 ${light ? 'bg-black/40' : 'bg-black/70'}`}
      onClick={onCancel}
    >
      <div
        className={
          light
            ? 'w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm'
            : 'w-full max-w-sm rounded-2xl border border-white/[0.12] bg-[#0a0a0a] p-5'
        }
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={`text-sm font-semibold ${light ? 'text-[#111111]' : 'text-white'}`}>{title}</h3>
        {description && (
          <p className={`mt-2 text-xs ${light ? 'text-[#6B7280]' : 'text-white/55'}`}>{description}</p>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className={
              light
                ? 'rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#6B7280] hover:bg-[#F3F4F6]'
                : 'rounded-lg border border-white/[0.14] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70'
            }
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              light
                ? `rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                    tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#111111] hover:bg-[#222222]'
                  }`
                : 'rounded-lg px-3 py-1.5 text-xs font-semibold'
            }
            style={
              light
                ? undefined
                : {
                    background: tone === 'danger' ? 'rgba(239,68,68,0.92)' : 'rgba(255,255,255,0.9)',
                    color: tone === 'danger' ? '#fff' : '#000',
                  }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
