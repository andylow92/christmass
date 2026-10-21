// components/wishlist/gift-card.tsx
'use client';

import { useId, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Check, Pencil, Tag, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { cn } from '@/lib/utils';
import { GiftStatusControl } from './gift-status-control';
import { LinkifiedText } from './linkified-text';
import type { GiftDetails, GiftStatus, WishlistGift } from './types';

type OwnActions = {
  onSave: (details: GiftDetails, onSuccess: () => void) => Promise<void>;
  onDelete: () => Promise<void>;
};

type OtherActions = {
  onStatusChange: (status: GiftStatus) => void;
};

export function GiftCard({
  gift,
  ...actions
}: { gift: WishlistGift } & (OwnActions | OtherActions)) {
  const [editing, setEditing] = useState(false);
  const isOwn = 'onSave' in actions;
  const status = gift.status ?? 'pending';

  return (
    <article
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border-l-4 bg-card p-5 text-card-foreground shadow-lg shadow-black/25 transition duration-200',
        !editing && 'hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30',
        !isOwn && status === 'will_buy' && 'border-l-accent',
        !isOwn && status === 'bought' && 'border-l-success bg-muted [&_h3]:text-card-foreground/80',
        (isOwn || status === 'pending') && 'border-l-transparent'
      )}
    >
      {isOwn && editing ? (
        <EditGiftForm
          gift={gift}
          onCancel={() => setEditing(false)}
          onSave={(details) => actions.onSave(details, () => setEditing(false))}
        />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 break-words text-base font-semibold leading-snug">
              {gift.item}
            </h3>
            {isOwn ? (
              <OwnGiftActions gift={gift} onEdit={() => setEditing(true)} onDelete={actions.onDelete} />
            ) : (
              <StatusBadge status={status} />
            )}
          </div>

          {gift.description && (
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
              <LinkifiedText text={gift.description} />
            </p>
          )}

          {gift.priceRange && (
            <span className="inline-flex w-fit max-w-full items-center gap-1.5 rounded-full bg-card-foreground/[0.07] px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only">Price: </span>
              <span className="truncate">{gift.priceRange}</span>
            </span>
          )}

          {!isOwn && (
            <div className="mt-auto pt-1">
              <GiftStatusControl
                value={status}
                label={`Status of ${gift.item}`}
                onChange={actions.onStatusChange}
              />
            </div>
          )}
        </>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: GiftStatus }) {
  if (status === 'will_buy') {
    return (
      <Badge variant="warning" className="shrink-0">
        Someone&apos;s getting this
      </Badge>
    );
  }
  if (status === 'bought') {
    return (
      <Badge variant="success" className="shrink-0">
        <Check aria-hidden="true" />
        Bought
      </Badge>
    );
  }
  return null;
}

function OwnGiftActions({
  gift,
  onEdit,
  onDelete,
}: {
  gift: WishlistGift;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="-mr-2 -mt-1.5 flex shrink-0 items-center">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Edit ${gift.item}`}
        title="Edit"
        onClick={onEdit}
        className="text-muted-foreground hover:text-card-foreground"
      >
        <Pencil aria-hidden="true" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${gift.item}`}
            title="Delete"
            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove &lsquo;{gift.item}&rsquo; from your list?</AlertDialogTitle>
            <AlertDialogDescription>
              Your family won&apos;t see it anymore. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void onDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
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
    <form onSubmit={submit} onKeyDown={onKeyDown} className="space-y-3" aria-label={`Edit ${gift.item}`}>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-item`}>What would you like?</Label>
        <Input
          id={`${id}-item`}
          value={details.item}
          onChange={(e) => setDetails({ ...details, item: e.target.value })}
          required
          maxLength={200}
          autoFocus
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-description`}>Details or a link</Label>
        <Textarea
          id={`${id}-description`}
          value={details.description}
          onChange={(e) => setDetails({ ...details, description: e.target.value })}
          maxLength={2000}
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-price`}>Price range</Label>
        <Input
          id={`${id}-price`}
          value={details.priceRange}
          onChange={(e) => setDetails({ ...details, priceRange: e.target.value })}
          maxLength={50}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={saving || !details.item.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
