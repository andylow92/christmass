// components/wishlist/gift-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function GiftSkeleton() {
  return (
    <div className="space-y-3 rounded-lg bg-card p-5 shadow-lg shadow-black/25" aria-hidden="true">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}

export function GiftSkeletonList() {
  return (
    <div className="grid gap-4 md:grid-cols-2" role="status" aria-label="Loading wishes">
      <GiftSkeleton />
      <GiftSkeleton />
      <GiftSkeleton />
    </div>
  );
}
