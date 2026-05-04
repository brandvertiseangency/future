'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <p className="text-sm font-semibold text-foreground">Something went wrong</p>
        <p className="mt-2 text-xs text-muted-foreground">{error?.message || 'Unexpected application error.'}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
