import Link from 'next/link'

export default function AppNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/[0.12] bg-white/[0.03] p-5 text-center">
        <p className="text-sm font-semibold text-white">Page not found</p>
        <p className="mt-2 text-xs text-white/55">This route does not exist or may have moved.</p>
        <Link href="/dashboard" className="mt-4 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-black">
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
