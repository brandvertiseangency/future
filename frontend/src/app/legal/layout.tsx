import type { ReactNode } from 'react'
import Link from 'next/link'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            Brandvertise
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/legal/acceptable-use" className="hover:text-foreground transition-colors">
              Acceptable use
            </Link>
            <Link href="/legal/report-content" className="hover:text-foreground transition-colors">
              Report
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  )
}
