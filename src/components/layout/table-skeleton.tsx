import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-6 px-3 py-3">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" style={{ maxWidth: c === 0 ? '30%' : undefined }} />
          ))}
        </div>
      ))}
    </div>
  );
}
