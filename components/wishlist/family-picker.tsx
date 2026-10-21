// components/wishlist/family-picker.tsx
'use client';

import { Avatar } from '@/components/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FamilyMember } from './types';

// Below 760px the row scrolls sideways to the screen edges, with a fade on the right so it looks scrollable
const rowClass =
  'flex gap-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:-mx-5 max-md:snap-x max-md:snap-mandatory max-md:scroll-px-5 max-md:overflow-x-auto max-md:px-5 max-md:pb-2.5 max-md:pt-1 max-md:[mask-image:linear-gradient(to_right,transparent,#000_20px,#000_calc(100%-44px),transparent)] sm:max-md:-mx-7 sm:max-md:px-7 md:flex-wrap md:px-0.5 md:pb-2.5 md:pt-1';

export function FamilyPicker({
  members,
  currentUserId,
  selectedId,
  wishCounts,
  onSelect,
}: {
  members: FamilyMember[];
  currentUserId: number | null;
  selectedId: number | null;
  wishCounts: Map<number, number>;
  onSelect: (id: number) => void;
}) {
  // You first, then everyone else in the order they joined
  const ordered = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return a.id - b.id;
  });

  return (
    <div role="group" aria-label="Choose whose wishlist to see" className={cn('mt-7', rowClass)}>
      {ordered.map((member) => {
        const selected = member.id === selectedId;
        const count = wishCounts.get(member.id) ?? 0;

        return (
          <button
            key={member.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(member.id)}
            className={cn(
              'relative inline-flex h-12 shrink-0 snap-start items-center gap-2.5 rounded-full border py-0 pl-2 pr-4 text-[15px] font-semibold shadow-sm transition-[background-color,border-color,color,transform] duration-200',
              selected
                ? 'border-ink bg-ink text-bg'
                : 'border-line bg-surface text-ink hoverable:-translate-y-px hoverable:border-line-strong'
            )}
          >
            <Avatar name={member.name} inverted={selected} />
            <span className="max-w-[12rem] truncate">{member.id === currentUserId ? 'You' : member.name}</span>
            <span
              className={cn(
                'inline-grid h-[22px] min-w-[22px] place-items-center rounded-full px-[7px] text-xs font-bold tabular-nums',
                selected ? 'bg-[color-mix(in_srgb,var(--bg)_18%,transparent)] text-bg' : 'bg-surface-2 text-ink-2'
              )}
            >
              <span className="sr-only">, </span>
              {count}
              <span className="sr-only">{count === 1 ? ' wish' : ' wishes'}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FamilyPickerSkeleton() {
  return (
    <div aria-hidden="true" className={cn('mt-7', rowClass)}>
      {[112, 120, 104, 128].map((width) => (
        <Skeleton key={width} className="h-12 shrink-0 rounded-full" style={{ width }} />
      ))}
    </div>
  );
}
