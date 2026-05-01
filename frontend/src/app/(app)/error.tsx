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
      <div className="max-w-md w-full rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center">
        <p className="text-sm font-semibold text-[#111111]">Something went wrong</p>
        <p className="mt-2 text-xs text-[#6B7280]">{error?.message || 'Unexpected application error.'}</p>
        <button
          onClick={reset}
          className="mt-4 rounded-lg bg-[#111111] px-3 py-1.5 text-xs font-semibold text-white"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
