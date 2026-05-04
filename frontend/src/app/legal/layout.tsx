import type { ReactNode } from 'react'
import Link from 'next/link'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Brandvertise
          </Link>
          <nav className="flex gap-4 text-sm text-[#6B7280]">
            <Link href="/legal/acceptable-use" className="hover:text-[#111111]">
              Acceptable use
            </Link>
            <Link href="/legal/report-content" className="hover:text-[#111111]">
              Report
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  )
}
