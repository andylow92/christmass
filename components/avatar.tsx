import { cn } from '@/lib/utils';
import { initials, tone } from '@/components/wishlist/utils';

export function Avatar({
  name,
  inverted = false,
  className,
}: {
  name: string;
  /** For dark pills: swaps the tint for the page colours so it keeps contrast in both themes */
  inverted?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-grid h-8 w-8 shrink-0 select-none place-items-center rounded-full text-xs font-bold tracking-[0.02em]',
        inverted ? 'bg-bg text-ink' : tone(name),
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
