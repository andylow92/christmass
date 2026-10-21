// components/wishlist/empty-state.tsx
import type { ReactNode } from 'react';

const boxClass =
  'col-span-full rounded-card border-[1.5px] border-dashed border-line-strong bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] px-6 py-12 text-center';

export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={boxClass}>
      <GiftBoxArt />
      <h3 className="font-display text-[28px] font-normal">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-[360px] text-ink-2">{children}</p>
    </div>
  );
}

/** Inline error card with a way to retry. */
export function ErrorState({ children, action }: { children: ReactNode; action: ReactNode }) {
  return (
    <div role="alert" className={boxClass}>
      <h3 className="font-display text-[28px] font-normal">{children}</h3>
      <p className="mx-auto mt-1.5 max-w-[360px] text-ink-2">Check your connection and try again.</p>
      <div className="mt-5 flex justify-center">{action}</div>
    </div>
  );
}

function GiftBoxArt() {
  return (
    <svg viewBox="0 0 120 96" fill="none" aria-hidden="true" className="mx-auto mb-4 h-auto w-[120px]">
      <rect x="18" y="38" width="84" height="52" rx="10" fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth="2" />
      <rect x="12" y="26" width="96" height="18" rx="7" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
      <rect x="54" y="26" width="12" height="64" fill="var(--t1-bg)" />
      <path
        d="M60 26c-6-14-22-18-24-8-2 9 14 9 24 8Zm0 0c6-14 22-18 24-8 2 9-14 9-24 8Z"
        fill="var(--t1-bg)"
        stroke="var(--berry)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="98" cy="14" r="3" fill="var(--gold-text)" opacity=".6" />
      <circle cx="14" cy="16" r="2" fill="var(--pine)" opacity=".5" />
    </svg>
  );
}
