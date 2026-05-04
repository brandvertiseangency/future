import type { ReactNode } from 'react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <a href="/" className="text-sm font-semibold tracking-tight">
            Brandvertise
          </a>
          <nav className="flex gap-4 text-sm text-[#6B7280]">
            <a href="/legal/acceptable-use" className="hover:text-[#111111]">
              Acceptable use
            </a>
            <a href="/legal/report-content" className="hover:text-[#111111]">
              Report
            </a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
    </div>
  )
}
