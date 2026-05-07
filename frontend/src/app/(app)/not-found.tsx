import Link from 'next/link'

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
        <p className="text-sm font-semibold text-foreground">Page not found</p>
        <p className="mt-2 text-xs text-muted-foreground">This route does not exist or may have moved.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex h-8 items-center rounded-lg bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
