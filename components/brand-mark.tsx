import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BrandMark({
  size = 'md',
  className,
}: {
  size?: 'md' | 'lg';
  className?: string;
}) {
  const large = size === 'lg';

  return (
    <span className={cn('inline-flex items-center gap-2.5 text-foreground', className)}>
      <span
        className={cn(
          'grid shrink-0 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/40',
          large ? 'h-11 w-11' : 'h-8 w-8'
        )}
      >
        <Gift className={cn('text-accent', large ? 'h-5 w-5' : 'h-4 w-4')} aria-hidden="true" />
      </span>
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          large ? 'text-3xl' : 'text-lg'
        )}
      >
        Family Wishlist
      </span>
    </span>
  );
}
