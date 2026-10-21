// components/wishlist/gift-card.tsx
'use client';

import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUpRight, Check, Gift, Pencil, ShoppingBag, Tag, Trash2, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatAdded, splitLinks, tone } from './utils';
import type { GiftDetails, GiftStatus, WishlistGift } from './types';

type OwnActions = {
  onSave: (details: GiftDetails, onSuccess: () => void) => Promise<void>;
  onDelete: () => Promise<void>;
};

type OtherActions = {
  onStatusChange: (status: GiftStatus, origin: HTMLElement) => void;
};

const cardClass =
  'relative flex min-w-0 flex-col gap-4 rounded-card border bg-surface p-5 transition-[transform,box-shadow,border-color,opacity] [transition-duration:250ms]';

export function GiftCard({
  gift,
  ...actions
}: { gift: WishlistGift } & (OwnActions | OtherActions)) {
  const [editing, setEditing] = useState(false);
  const isOwn = 'onSave' in actions;
  // Never show claim status on your own gifts, whatever the API sends
  const status: GiftStatus = isOwn ? 'pending' : (gift.status ?? 'pending');

  if (isOwn && editing) {
    return (
      <article className={cn(cardClass, 'border-line shadow')}>
        <EditGiftForm
          gift={gift}
          onCancel={() => setEditing(false)}
          onSave={(details) => actions.onSave(details, () => setEditing(false))}
        />
      </article>
    );
  }

  const { rest, links } = splitLinks(gift.description);
  const claimed = status === 'will_buy';
  const bought = status === 'bought';

  return (
    <article
      className={cn(
        cardClass,
        'shadow hoverable:-translate-y-0.5 hoverable:shadow-lg',
        claimed ? 'border-gold-line' : 'border-line',
        bought && 'bg-[color-mix(in_srgb,var(--surface)_70%,var(--bg))] shadow-sm'
      )}
    >
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-[14px] [&_svg]:size-5',
            bought ? 'tone-0' : claimed ? 'tone-2' : tone(gift.item)
          )}
        >
          {bought ? <Check aria-hidden="true" /> : <Gift aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'mt-0.5 text-lg font-semibold leading-[1.3] tracking-[-0.005em] [overflow-wrap:anywhere]',
              bought && 'text-ink-2'
            )}
          >
            {gift.item}
          </h3>
          {rest && (
            <p
              className={cn(
                'mt-1.5 whitespace-pre-line text-[15px] text-ink-2 [overflow-wrap:anywhere]',
                bought && 'opacity-75'
              )}
            >
              {rest}
            </p>
          )}
          {(links.length > 0 || gift.priceRange) && (
            <div className={cn('mt-3 flex flex-wrap gap-2', bought && 'opacity-75')}>
              {links.map((link, i) => (
                <a
                  key={`${link.href}-${i}`}
                  href={link.href}
                  title={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(chipClass, 'tap-target relative hover:border-line-strong hover:text-ink')}
                >
                  <ArrowUpRight aria-hidden="true" />
                  <span className="truncate">{link.host}</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
              {gift.priceRange && (
                <span className={chipClass}>
                  <Tag aria-hidden="true" />
                  <span className="sr-only">Price: </span>
                  <span className="truncate">{gift.priceRange}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-auto flex flex-wrap items-center justify-between gap-2.5 border-t border-dashed border-line pt-3.5">
        {isOwn ? (
          <OwnFooter gift={gift} onEdit={() => setEditing(true)} onDelete={actions.onDelete} />
        ) : (
          <StatusFooter status={status} onChange={actions.onStatusChange} />
        )}
      </footer>
    </article>
  );
}

const chipClass =
  'inline-flex h-[30px] max-w-full items-center gap-1.5 rounded-full border border-line bg-surface px-[11px] text-[13px] font-medium text-ink-2 no-underline [&_svg]:size-3.5 [&_svg]:shrink-0';

const pillClass =
  'inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold [&_svg]:size-3.5';

function OwnFooter({
  gift,
  onEdit,
  onDelete,
}: {
  gift: WishlistGift;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  const added = formatAdded(gift.createdAt);

  return (
    <>
      {added && <span className="text-[13px] text-ink-3">Added {added}</span>}
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label={`Edit ${gift.item}`} title="Edit" onClick={onEdit}>
          <Pencil aria-hidden="true" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remove ${gift.item}`}
              title="Remove"
              className="hover:bg-berry-soft hover:text-berry-text"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove &ldquo;{gift.item}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>It will disappear from your list for everyone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void onDelete()}
                className={buttonVariants({ variant: 'destructive' })}
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

function StatusFooter({
  status,
  onChange,
}: {
  status: GiftStatus;
  onChange: (status: GiftStatus, origin: HTMLElement) => void;
}) {
  if (status === 'will_buy') {
    return (
      <>
        <span className={cn(pillClass, 'bg-gold-soft text-gold-text')}>
          <ShoppingBag aria-hidden="true" />
          Someone&apos;s on it
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="soft" size="sm" onClick={(e) => onChange('bought', e.currentTarget)}>
            <Check aria-hidden="true" />
            Mark as bought
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Undo claim"
            title="Undo"
            onClick={(e) => onChange('pending', e.currentTarget)}
          >
            <Undo2 aria-hidden="true" />
          </Button>
        </div>
      </>
    );
  }

  if (status === 'bought') {
    return (
      <>
        <span className={cn(pillClass, 'bg-pine-soft text-pine-text')}>
          <Check aria-hidden="true" />
          Bought
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Undo, mark as not bought"
            onClick={(e) => onChange('pending', e.currentTarget)}
          >
            <Undo2 aria-hidden="true" />
            Undo
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <span className={cn(pillClass, 'bg-surface-2 text-ink-2')}>Available</span>
      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" onClick={(e) => onChange('will_buy', e.currentTarget)}>
          <Gift aria-hidden="true" />
          I&apos;ll get this
        </Button>
      </div>
    </>
  );
}

function EditGiftForm({
  gift,
  onSave,
  onCancel,
}: {
  gift: WishlistGift;
  onSave: (details: GiftDetails) => Promise<void>;
  onCancel: () => void;
}) {
  const id = useId();
  const [details, setDetails] = useState<GiftDetails>({
    item: gift.item,
    description: gift.description ?? '',
    priceRange: gift.priceRange ?? '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!details.item.trim()) return;
    setSaving(true);
    await onSave(details);
    setSaving(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={submit} onKeyDown={onKeyDown} className="grid gap-3" aria-label={`Edit ${gift.item}`}>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-item`}>Gift</Label>
        <Input
          id={`${id}-item`}
          value={details.item}
          onChange={(e) => setDetails({ ...details, item: e.target.value })}
          required
          maxLength={200}
          autoFocus
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-description`}>Details or a link</Label>
        <Textarea
          id={`${id}-description`}
          value={details.description}
          onChange={(e) => setDetails({ ...details, description: e.target.value })}
          maxLength={2000}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${id}-price`}>Price range</Label>
        <Input
          id={`${id}-price`}
          value={details.priceRange}
          onChange={(e) => setDetails({ ...details, priceRange: e.target.value })}
          maxLength={50}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || !details.item.trim()}>
          <Check aria-hidden="true" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
