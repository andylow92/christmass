// components/wishlist/add-gift-form.tsx
'use client';

import { useId, useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { GiftDetails } from './types';

const EMPTY: GiftDetails = { item: '', description: '', priceRange: '' };

export function AddGiftForm({
  onAdd,
}: {
  onAdd: (details: GiftDetails, onSuccess: () => void) => Promise<void>;
}) {
  const id = useId();
  const [details, setDetails] = useState<GiftDetails>(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!details.item.trim() || submitting) return;
    setSubmitting(true);
    await onAdd(details, () => setDetails(EMPTY));
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={submit}
      aria-labelledby={`${id}-title`}
      className="rounded-lg bg-card p-5 text-card-foreground shadow-xl shadow-black/25 sm:p-6"
    >
      <h3 id={`${id}-title`} className="font-display text-xl font-semibold">
        Add a wish
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_12rem]">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-item`}>What would you like?</Label>
          <Input
            id={`${id}-item`}
            value={details.item}
            onChange={(e) => setDetails({ ...details, item: e.target.value })}
            placeholder="A cozy wool scarf"
            required
            maxLength={200}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-price`}>
            Price range <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id={`${id}-price`}
            value={details.priceRange}
            onChange={(e) => setDetails({ ...details, priceRange: e.target.value })}
            placeholder="$20–30"
            maxLength={50}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor={`${id}-description`}>
            Details or a link <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id={`${id}-description`}
            value={details.description}
            onChange={(e) => setDetails({ ...details, description: e.target.value })}
            placeholder="Size, color, or paste a link to the shop"
            maxLength={2000}
            rows={3}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          <Plus aria-hidden="true" />
          {submitting ? 'Adding…' : 'Add to my list'}
        </Button>
      </div>
    </form>
  );
}
