// components/wishlist/notify.tsx
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { CircleAlert, Sparkle } from 'lucide-react';

/** Friendly toast with the gold sparkles tile. */
export function notify(message: ReactNode) {
  toast(message, { icon: <Sparkle aria-hidden="true" className="text-gold-bright dark:text-[#7A5410]" /> });
}

/** Same toast for failures, with an optional retry. */
export function notifyError(message: ReactNode, retry?: () => void) {
  toast(message, {
    icon: <CircleAlert aria-hidden="true" className="text-[#F49AAA] dark:text-[#9A1F35]" />,
    duration: 6000,
    action: retry ? { label: 'Try again', onClick: retry } : undefined,
    classNames: {
      actionButton:
        'tap-target relative ml-1 h-8 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--bg)_14%,transparent)] px-3 text-[13px] font-semibold',
    },
  });
}
