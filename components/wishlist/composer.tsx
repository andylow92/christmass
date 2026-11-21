// components/wishlist/composer.tsx
'use client';

import {
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type FocusEvent,
  type FormEvent,
} from 'react';
import { Link2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { LinkField } from './link-field';
import { isBareUrl, joinDescription } from './utils';
import type { GiftDetails } from './types';

interface Draft {
  item: string;
  link: string;
  notes: string;
  priceRange: string;
}

const EMPTY: Draft = { item: '', link: '', notes: '', priceRange: '' };

/** "Add a wish": one line to start, the link and details slide open on focus. */
export function Composer({
  onAdd,
}: {
  onAdd: (details: GiftDetails, onSuccess: () => void) => Promise<void>;
}) {
  const id = useId();
  const itemRef = useRef<HTMLInputElement>(null);
  const linkRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Set when a link landed in the name box and was moved down to the Link field
  const [linkMoved, setLinkMoved] = useState(false);

  const hasContent = Boolean(draft.item || draft.link || draft.notes || draft.priceRange);
  const open = focused || hasContent;
  const needsName = draft.link.trim() !== '' && draft.item.trim() === '';

  const update = (changes: Partial<Draft>) => setDraft((current) => ({ ...current, ...changes }));

  /** Puts a link that was typed or pasted as the wish's name into the Link field instead. */
  const moveToLink = (url: string) => {
    setDraft((current) => ({
      ...current,
      item: '',
      link: current.link.trim() ? `${current.link.trim()} ${url}` : url,
    }));
    setLinkMoved(true);
    itemRef.current?.focus();
  };

  const onItemPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text');
    if (!isBareUrl(pasted) || draft.item.trim()) return;
    event.preventDefault();
    moveToLink(pasted.trim());
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (isBareUrl(draft.item)) {
      moveToLink(draft.item.trim());
      return;
    }
    if (!draft.item.trim()) {
      itemRef.current?.focus();
      return;
    }
    setSubmitting(true);
    const details: GiftDetails = {
      item: draft.item,
      description: joinDescription(draft.notes, draft.link),
      priceRange: draft.priceRange,
    };
    await onAdd(details, () => {
      setDraft(EMPTY);
      setLinkMoved(false);
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
      <div className="flex items-center gap-2">
        <span className="ml-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-[14px] tone-2 max-[520px]:hidden [&_svg]:size-5">
          <Plus aria-hidden="true" />
        </span>
        <label htmlFor={`${id}-item`} className="sr-only">
          What would you like?
        </label>
        <input
          ref={itemRef}
          id={`${id}-item`}
          value={draft.item}
          onChange={(e) => {
            update({ item: e.target.value });
            if (e.target.value) setLinkMoved(false);
          }}
          onPaste={onItemPaste}
          placeholder={needsName ? 'Now give it a name…' : "Add something you'd love…"}
          maxLength={200}
          autoComplete="off"
          className="h-12 min-w-0 flex-1 rounded-input border-0 bg-transparent px-1 text-[17px] max-[520px]:pl-2.5 text-ink placeholder:text-ink-3 focus:outline-none focus-visible:shadow-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Add a link"
          title="Add a link"
          onClick={() => linkRef.current?.focus()}
          className={cn('shrink-0', draft.link.trim() && 'bg-pine-soft text-pine-text')}
        >
          <Link2 aria-hidden="true" />
        </Button>
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
          <div className="grid gap-3 px-1.5 pb-1.5 pt-3">
            <LinkField
              ref={linkRef}
              id={`${id}-link`}
              value={draft.link}
              onChange={(link) => {
                update({ link });
                setLinkMoved(false);
              }}
              optional
              notice={
                linkMoved && needsName
                  ? 'Link added here. Now type what the gift is in the box above.'
                  : undefined
              }
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
              <div className="grid content-start gap-1.5">
                <Label htmlFor={`${id}-notes`}>
                  Details <span className="font-medium text-ink-3">(optional)</span>
                </Label>
                <Textarea
                  id={`${id}-notes`}
                  value={draft.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="Size, colour, anything that helps…"
                  maxLength={1500}
                />
              </div>
              <div className="grid content-start gap-1.5">
                <Label htmlFor={`${id}-price`}>Price range</Label>
                <Input
                  id={`${id}-price`}
                  value={draft.priceRange}
                  onChange={(e) => update({ priceRange: e.target.value })}
                  placeholder="$20–30"
                  maxLength={50}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
