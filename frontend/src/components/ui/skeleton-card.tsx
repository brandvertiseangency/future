export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="app-card p-4 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-[#EFEFF1]" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-[#F3F4F6]" />
        ))}
      </div>
    </div>
  )
}
