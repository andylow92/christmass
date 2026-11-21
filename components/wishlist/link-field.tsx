// components/wishlist/link-field.tsx
'use client';

import type { ReactNode, Ref } from 'react';
import { ArrowUpRight, Link2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { chipClass, normalizeLinks, splitLinks } from './utils';

/** A clearly marked place for a shop link, with a preview of how it will look on the card. */
export function LinkField({
  id,
  value,
  onChange,
  notice,
  optional = false,
  ref,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Replaces the usual hint, e.g. after a link was moved here from the wish name. */
  notice?: ReactNode;
  optional?: boolean;
  ref?: Ref<HTMLInputElement>;
}) {
  const typed = value.trim().length > 0;
  const { links } = splitLinks(normalizeLinks(value));

  let hint: ReactNode;
  if (!typed) {
    hint = 'Paste the shop page and it shows on your card as a link to tap.';
  } else if (links.length > 0) {
    hint = (
      <>
        <span>Shows on your card as</span>
        {links.map((link, i) => (
          <span key={`${link.href}-${i}`} className={cn(chipClass, 'h-6 px-2 text-xs')}>
            <ArrowUpRight aria-hidden="true" />
            <span className="truncate">{link.host}</span>
          </span>
        ))}
      </>
    );
  } else {
    hint = 'That doesn’t look like a web address yet. Try copying it from your browser’s address bar.';
  }

  return (
    <div className="grid content-start gap-1.5">
      <Label htmlFor={id}>
        Link{optional && <span className="font-medium text-ink-3"> (optional)</span>}
      </Label>
      <div className="relative">
        <Link2
          aria-hidden="true"
          className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-ink-3"
        />
        <Input
          ref={ref}
          id={id}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste a link, e.g. https://…"
          maxLength={500}
          aria-describedby={`${id}-hint`}
          className="pl-10"
        />
      </div>
      <p
        id={`${id}-hint`}
        aria-live="polite"
        className={cn(
          'flex min-h-6 flex-wrap items-center gap-1.5 text-[13px] leading-snug',
          notice ? 'font-medium text-pine-text' : 'text-ink-3'
        )}
      >
        {notice ?? hint}
      </p>
    </div>
  );
}
