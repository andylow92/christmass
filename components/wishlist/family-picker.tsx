// components/wishlist/family-picker.tsx
'use client';

import { InitialsAvatar } from '@/components/initials-avatar';
import { cn } from '@/lib/utils';
import type { FamilyMember } from './types';

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
  // You first, then everyone else alphabetically
  const ordered = [...members].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <nav aria-label="Family members">
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2 overflow-x-auto px-4 pb-2 pt-1 [scrollbar-width:thin] sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0 md:pt-0">
        {ordered.map((member) => {
          const selected = member.id === selectedId;
          const isYou = member.id === currentUserId;
          const count = wishCounts.get(member.id) ?? 0;

          return (
            <li key={member.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(member.id)}
                className={cn(
                  'relative flex h-11 items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  selected
                    ? 'bg-card text-card-foreground ring-2 ring-primary'
                    : 'bg-white/5 text-foreground ring-1 ring-white/10 hover:bg-white/10'
                )}
              >
                <InitialsAvatar name={member.name} />
                <span className="max-w-[10rem] truncate">{isYou ? 'You' : member.name}</span>
                <span
                  className={cn(
                    'min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs tabular-nums',
                    selected ? 'bg-muted text-muted-foreground' : 'bg-white/10 text-foreground/80'
                  )}
                >
                  <span className="sr-only">, </span>
                  {count}
                  <span className="sr-only">{count === 1 ? ' wish' : ' wishes'}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
