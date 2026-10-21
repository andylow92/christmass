// components/wishlist/list-header.tsx
import { EyeOff, Sparkle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { wishCount } from './utils';

export function ListHeader({
  isOwnList,
  firstName,
  count,
}: {
  isOwnList: boolean;
  firstName: string;
  count: number;
}) {
  return (
    <div className="mb-[18px] mt-9 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2
          id="list-heading"
          className="break-words font-display text-[clamp(30px,4.4vw,40px)] font-normal leading-[1.05] tracking-[-0.01em]"
        >
          {isOwnList ? 'Your wishlist' : `${firstName}'s wishlist`}
        </h2>
        <p className="mt-2 flex items-center gap-2 text-[15px] text-ink-2 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-pine-text">
          {isOwnList ? (
            <>
              <EyeOff aria-hidden="true" />
              Claims are hidden from you. No spoilers.
            </>
          ) : (
            <>
              <Sparkle aria-hidden="true" />
              Claim a gift so nobody doubles up. {firstName} won&apos;t see it.
            </>
          )}
        </p>
      </div>
      <span className="text-sm font-medium text-ink-3">{wishCount(count)}</span>
    </div>
  );
}

export function ListHeaderSkeleton() {
  return (
    <div aria-hidden="true" className="mb-[18px] mt-9">
      <Skeleton className="h-10 w-56 rounded-xl" />
      <Skeleton className="mt-3 h-5 w-72 max-w-full rounded-lg" />
    </div>
  );
}
