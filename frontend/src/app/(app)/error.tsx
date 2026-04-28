'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/[0.12] bg-white/[0.03] p-5 text-center">
        <p className="text-sm font-semibold text-white">Something went wrong</p>
        <p className="mt-2 text-xs text-white/55">{error?.message || 'Unexpected application error.'}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
