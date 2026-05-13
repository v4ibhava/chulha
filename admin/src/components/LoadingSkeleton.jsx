export function StatCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse flex items-center gap-4">
      <div className="w-14 h-14 bg-neutral-200 rounded-2xl" />
      <div className="space-y-2">
        <div className="h-3 bg-neutral-200 rounded w-16" />
        <div className="h-6 bg-neutral-200 rounded w-20" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 bg-neutral-200 rounded-2xl" />
      ))}
    </div>
  );
}
