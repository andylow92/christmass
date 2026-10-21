// components/wishlist/wishlist-app.tsx
'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AddGiftForm } from './add-gift-form';
import { EmptyState } from './empty-state';
import { FamilyPicker } from './family-picker';
import { GiftCard } from './gift-card';
import { GiftSkeletonList } from './gift-skeleton';
import { useWishlist } from './use-wishlist';
import type { GiftStatus, WishlistGift } from './types';

const STATUS_ORDER: Record<GiftStatus, number> = { pending: 0, will_buy: 1, bought: 2 };

function sleepsUntilChristmas(now = new Date()) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  let christmas = Date.UTC(now.getFullYear(), 11, 25);
  if (today > christmas) christmas = Date.UTC(now.getFullYear() + 1, 11, 25);
  return Math.round((christmas - today) / 86_400_000);
}

// The countdown depends on the viewer's clock, so it only renders on the client
const subscribeToNothing = () => () => {};

function countdownText(sleeps: number) {
  if (sleeps === 0) return 'Merry Christmas!';
  return `${sleeps} ${sleeps === 1 ? 'sleep' : 'sleeps'} until Christmas`;
}

const wishCount = (n: number) => `${n} ${n === 1 ? 'wish' : 'wishes'}`;

export function WishlistApp() {
  const { data: session } = useSession();
  const { users, gifts, loading, loadFailed, reload, addGift, updateGift, deleteGift, setStatus } =
    useWishlist();
  const [pickedId, setPickedId] = useState<number | null>(null);
  // Statuses as they were when the list was opened, so cards don't jump around as you claim them
  const [sortStatuses, setSortStatuses] = useState<Map<number, GiftStatus | null>>(new Map());
  const sleeps = useSyncExternalStore(subscribeToNothing, sleepsUntilChristmas, () => null);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  const firstName = session?.user?.name?.split(' ')[0];
  // Default to your own list so the page is never blank
  const selectedId = pickedId ?? currentUserId;
  const selectedUser = users?.find((user) => user.id === selectedId);
  const isOwnList = selectedId !== null && selectedId === currentUserId;

  const wishCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const gift of gifts ?? []) counts.set(gift.userId, (counts.get(gift.userId) ?? 0) + 1);
    return counts;
  }, [gifts]);

  const visibleGifts = useMemo(() => {
    const list = (gifts ?? []).filter((gift) => gift.userId === selectedId);
    return isOwnList
      ? list.sort((a, b) => b.id - a.id) // newest first, right under the form
      : list.sort((a, b) => {
          const statusOf = (gift: WishlistGift) =>
            (sortStatuses.has(gift.id) ? sortStatuses.get(gift.id) : gift.status) ?? 'pending';
          return STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)] || a.id - b.id;
        });
  }, [gifts, selectedId, isOwnList, sortStatuses]);

  const selectMember = (id: number) => {
    setPickedId(id);
    setSortStatuses(new Map((gifts ?? []).map((gift) => [gift.id, gift.status])));
  };

  const heading = isOwnList ? 'Your wishlist' : selectedUser ? `${selectedUser.name}'s wishlist` : '';

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 md:pt-14">
      <section className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {firstName ? (
            `Hi, ${firstName}`
          ) : (
            <span className="inline-block h-10 w-56 animate-pulse rounded-md bg-white/10 align-middle md:h-12" />
          )}
        </h1>
        <p className="min-h-6 text-foreground/70" aria-live="polite">
          {sleeps !== null && countdownText(sleeps)}
        </p>
      </section>

      <div className="mt-8">
        {users ? (
          <FamilyPicker
            members={users}
            currentUserId={currentUserId}
            selectedId={selectedId}
            wishCounts={wishCounts}
            onSelect={selectMember}
          />
        ) : (
          !loadFailed && (
            <div className="flex gap-2" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-11 w-28 rounded-full bg-white/10" />
              ))}
            </div>
          )
        )}
      </div>

      <section className="mt-10 space-y-5" aria-labelledby="list-heading">
        {loadFailed ? (
          <EmptyState
            action={
              <Button onClick={reload} variant="outline">
                <RotateCw aria-hidden="true" />
                Try again
              </Button>
            }
          >
            We couldn&apos;t load the wishlists. Check your connection and try again.
          </EmptyState>
        ) : (
          <>
            {loading || !heading ? (
              <Skeleton className="h-8 w-48 bg-white/10" />
            ) : (
              <h2
                id="list-heading"
                className="flex flex-wrap items-baseline gap-x-3 font-display text-2xl font-semibold text-foreground"
              >
                <span className="min-w-0 break-words">{heading}</span>
                <span className="font-sans text-sm font-normal text-foreground/60">
                  {wishCount(visibleGifts.length)}
                </span>
              </h2>
            )}

            {isOwnList && !loading && <AddGiftForm onAdd={addGift} />}

            {loading ? (
              <GiftSkeletonList />
            ) : visibleGifts.length === 0 ? (
              <EmptyState>
                {isOwnList
                  ? 'Your list is empty — add the first thing you’re dreaming of.'
                  : `${selectedUser?.name ?? 'They'} hasn’t added any wishes yet.`}
              </EmptyState>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2">
                {visibleGifts.map((gift: WishlistGift) => (
                  <li key={gift.id} className="grid">
                    {isOwnList ? (
                      <GiftCard
                        gift={gift}
                        onSave={(details, onSuccess) => updateGift(gift.id, details, onSuccess)}
                        onDelete={() => deleteGift(gift.id)}
                      />
                    ) : (
                      <GiftCard
                        gift={gift}
                        onStatusChange={(status) => setStatus(gift.id, status, gift.status)}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  );
}
