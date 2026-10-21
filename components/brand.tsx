import { Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Gift mark + "Family Wishlist" wordmark. `onHero` is for the pine art panel. */
export function Brand({ onHero = false, className }: { onHero?: boolean; className?: string }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid h-[34px] w-[34px] place-items-center rounded-[11px] text-gold-bright [&_svg]:size-[18px]',
          onHero
            ? 'bg-white/10'
            : 'bg-[linear-gradient(145deg,var(--hero-2),var(--hero-1))] shadow-[0_6px_14px_-6px_rgba(15,59,46,.6)]'
        )}
      >
        <Gift aria-hidden="true" />
      </span>
      <span
        className={cn(
          'font-display text-2xl leading-none tracking-[-0.01em]',
          onHero ? 'text-hero-ink' : 'text-ink'
        )}
      >
        Family <em className={onHero ? 'text-gold-bright' : 'text-pine-text'}>Wishlist</em>
      </span>
    </span>
  );
}
