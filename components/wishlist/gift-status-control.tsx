// components/wishlist/gift-status-control.tsx
'use client';

import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import type { GiftStatus } from './types';

const OPTIONS: { value: GiftStatus; label: string; selectedClass: string }[] = [
  { value: 'pending', label: 'Available', selectedClass: 'bg-white text-card-foreground shadow-sm' },
  { value: 'will_buy', label: "I'll get it", selectedClass: 'bg-warning-soft text-warning shadow-sm' },
  { value: 'bought', label: 'Bought', selectedClass: 'bg-success text-success-foreground shadow-sm' },
];

export function GiftStatusControl({
  value,
  onChange,
  label,
}: {
  value: GiftStatus;
  onChange: (status: GiftStatus) => void;
  label: string;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = OPTIONS.findIndex((option) => option.value === value);

  // Radio-group keyboard pattern: arrows move and select, Tab leaves the group
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = (selectedIndex + step + OPTIONS.length) % OPTIONS.length;
    buttons.current[next]?.focus();
    onChange(OPTIONS[next].value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="grid w-full grid-cols-3 gap-1 rounded-full bg-card-foreground/[0.07] p-1"
    >
      {OPTIONS.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(element) => {
              buttons.current[i] = element;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => !selected && onChange(option.value)}
            className={cn(
              'h-8 truncate rounded-full px-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected ? option.selectedClass : 'text-muted-foreground hover:bg-white/60 hover:text-card-foreground'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
