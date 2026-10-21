// components/wishlist/empty-state.tsx
import type { ReactNode } from 'react';
import { Gift } from 'lucide-react';

export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 ring-1 ring-accent/30">
        <Gift className="h-5 w-5 text-accent" aria-hidden="true" />
      </span>
      <p className="max-w-sm text-foreground/80">{children}</p>
      {action}
    </div>
  );
}
