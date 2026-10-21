// components/wishlist/gift-grid-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

function GiftCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow">
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-11 w-11 shrink-0 rounded-[14px]" />
        <div className="min-w-0 flex-1">
          <Skeleton className="mt-1 h-5 w-3/5 rounded-lg" />
          <Skeleton className="mt-3 h-3.5 w-full rounded-md" />
          <Skeleton className="mt-2 h-3.5 w-4/5 rounded-md" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-[30px] w-24 rounded-full" />
            <Skeleton className="h-[30px] w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-dashed border-line pt-3.5">
        <Skeleton className="h-[30px] w-24 rounded-full" />
        <Skeleton className="h-[38px] w-32 rounded-full" />
      </div>
    </div>
  );
}

export function GiftGridSkeleton() {
  return (
    <div role="status" aria-label="Loading wishes" className="grid gap-4 md:grid-cols-2 md:gap-5">
      {[0, 1, 2, 3].map((i) => (
        <GiftCardSkeleton key={i} />
      ))}
    </div>
  );
}
