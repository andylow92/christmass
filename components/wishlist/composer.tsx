// components/wishlist/composer.tsx
'use client';

import { useId, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { GiftDetails } from './types';

const EMPTY: GiftDetails = { item: '', description: '', priceRange: '' };

/** "Add a wish": one line to start, details slide open on focus. */
export function Composer({
  onAdd,
}: {
  onAdd: (details: GiftDetails, onSuccess: () => void) => Promise<void>;
}) {
  const id = useId();
  const itemRef = useRef<HTMLInputElement>(null);
  const [details, setDetails] = useState<GiftDetails>(EMPTY);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasContent = Boolean(details.item || details.description || details.priceRange);
  const open = focused || hasContent;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!details.item.trim() || submitting) return;
    setSubmitting(true);
    await onAdd(details, () => {
      setDetails(EMPTY);
      // Keep focus here for quick entry of the next wish
      itemRef.current?.focus();
    });
    setSubmitting(false);
  };

  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <form
      onSubmit={submit}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      aria-label="Add a wish"
      className="mb-5 rounded-card border border-line bg-surface p-2.5 shadow transition-[border-color,box-shadow] duration-200 focus-within:border-[color-mix(in_srgb,var(--pine)_45%,var(--line))] focus-within:shadow-[var(--shadow),var(--focus-ring)]"
    >
      <div className="flex items-center gap-2.5">
        <span className="ml-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-[14px] tone-2 [&_svg]:size-5">
          <Plus aria-hidden="true" />
        </span>
        <label htmlFor={`${id}-item`} className="sr-only">
          What would you like?
        </label>
        <input
          ref={itemRef}
          id={`${id}-item`}
          value={details.item}
          onChange={(e) => setDetails({ ...details, item: e.target.value })}
          placeholder="Add something you'd love…"
          maxLength={200}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-input border-0 bg-transparent px-1 text-[17px] text-ink placeholder:text-ink-3 focus:outline-none focus-visible:shadow-none"
        />
        <Button
          type="submit"
          disabled={submitting}
          aria-label={submitting ? 'Adding wish' : 'Add wish'}
          className="shrink-0 max-[520px]:w-11 max-[520px]:px-0"
        >
          <Plus aria-hidden="true" />
          <span className="max-[520px]:hidden">{submitting ? 'Adding…' : 'Add wish'}</span>
        </Button>
      </div>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="grid gap-3 px-1.5 pb-1.5 pt-3 sm:grid-cols-[1fr_200px]">
            <div className="grid content-start gap-1.5">
              <Label htmlFor={`${id}-description`}>
                Details or a link <span className="font-medium text-ink-3">(optional)</span>
              </Label>
              <Textarea
                id={`${id}-description`}
                value={details.description}
                onChange={(e) => setDetails({ ...details, description: e.target.value })}
                placeholder="Size, colour, where to find it…"
                maxLength={2000}
              />
            </div>
            <div className="grid content-start gap-1.5">
              <Label htmlFor={`${id}-price`}>Price range</Label>
              <Input
                id={`${id}-price`}
                value={details.priceRange}
                onChange={(e) => setDetails({ ...details, priceRange: e.target.value })}
                placeholder="$20–30"
                maxLength={50}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
