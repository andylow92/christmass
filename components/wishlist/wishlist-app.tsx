// components/wishlist/wishlist-app.tsx
'use client';

import { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClientValue } from '@/lib/use-mounted';
import { Composer } from './composer';
import { EmptyState, ErrorState } from './empty-state';
import { FamilyPicker, FamilyPickerSkeleton } from './family-picker';
import { GiftCard } from './gift-card';
import { GiftGridSkeleton } from './gift-grid-skeleton';
import { Hero } from './hero';
import { ListHeader, ListHeaderSkeleton } from './list-header';
import { notify } from './notify';
import { sparkleBurst } from './sparkle-burst';
import { useWishlist } from './use-wishlist';
import { firstNameOf } from './utils';
import type { GiftStatus, WishlistGift } from './types';

const STATUS_ORDER: Record<GiftStatus, number> = { pending: 0, will_buy: 1, bought: 2 };

export function WishlistApp() {
  const { data: session } = useSession();
  const { users, gifts, loading, loadFailed, reload, addGift, updateGift, deleteGift, setStatus } =
    useWishlist();
  const [pickedId, setPickedId] = useState<number | null>(null);
  // Statuses as they were when the list was opened, so cards don't jump around as you claim them
  const [sortStatuses, setSortStatuses] = useState<Map<number, GiftStatus | null>>(new Map());
  const year = useClientValue(() => new Date().getFullYear(), null);

  const currentUserId = session?.user?.id ? Number(session.user.id) : null;
  // Default to your own list so the page is never blank
  const selectedId = pickedId ?? currentUserId;
  const selectedUser = users?.find((user) => user.id === selectedId);
  const isOwnList = selectedId !== null && selectedId === currentUserId;
  const selectedFirstName = firstNameOf(selectedUser?.name);

  const wishCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const gift of gifts ?? []) counts.set(gift.userId, (counts.get(gift.userId) ?? 0) + 1);
    return counts;
  }, [gifts]);

  const visibleGifts = useMemo(() => {
    const list = (gifts ?? []).filter((gift) => gift.userId === selectedId);
    return isOwnList
      ? list.sort((a, b) => a.id - b.id) // the order you added them
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

  const changeStatus = (gift: WishlistGift, status: GiftStatus, origin: HTMLElement) => {
    if (status === 'will_buy') {
      sparkleBurst(origin);
      notify(
        <>
          You&apos;re getting the <b>{gift.item}</b>. {selectedFirstName} won&apos;t see it.
        </>
      );
    } else if (status === 'bought') {
      notify('Marked as bought. Nice one!');
    }
    void setStatus(gift.id, status, gift.status);
  };

  // Your own list renders even if you're somehow missing from /api/users
  const ready = !loading && !loadFailed && selectedId !== null;

  return (
    <main className="wrap">
      <Hero firstName={firstNameOf(session?.user?.name)} totalWishes={gifts ? gifts.length : null} />

      {users ? (
        <FamilyPicker
          members={users}
          currentUserId={currentUserId}
          selectedId={selectedId}
          wishCounts={wishCounts}
          onSelect={selectMember}
        />
      ) : (
        !loadFailed && <FamilyPickerSkeleton />
      )}

      <section aria-labelledby={ready ? 'list-heading' : undefined}>
        {loadFailed ? (
          <div className="mt-9">
            <ErrorState
              action={
                <Button variant="soft" onClick={reload}>
                  <RotateCw aria-hidden="true" />
                  Try again
                </Button>
              }
            >
              We couldn&apos;t load the wishlists.
            </ErrorState>
          </div>
        ) : !ready ? (
          <>
            <ListHeaderSkeleton />
            <GiftGridSkeleton />
          </>
        ) : (
          <>
            <ListHeader isOwnList={isOwnList} firstName={selectedFirstName} count={visibleGifts.length} />

            {isOwnList && <Composer onAdd={addGift} />}

            {/* Keyed by person so cards rise in on first load and when switching, not on every change */}
            <ul key={selectedId} className="grid gap-4 md:grid-cols-2 md:gap-5">
              {visibleGifts.length === 0 ? (
                <li className="col-span-full">
                  {isOwnList ? (
                    <EmptyState title="Your list is empty">
                      Add the first thing you&apos;re dreaming of. Your family will see it right away.
                    </EmptyState>
                  ) : (
                    <EmptyState title={`${selectedFirstName} hasn't added any wishes yet`}>
                      Check back soon. New wishes show up here as soon as they are added.
                    </EmptyState>
                  )}
                </li>
              ) : (
                visibleGifts.map((gift, i) => (
                  <li key={gift.id} className="grid animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                    {isOwnList ? (
                      <GiftCard
                        gift={gift}
                        onSave={(details, onSuccess) => updateGift(gift.id, details, onSuccess)}
                        onDelete={() => deleteGift(gift.id)}
                      />
                    ) : (
                      <GiftCard
                        gift={gift}
                        onStatusChange={(status, origin) => changeStatus(gift, status, origin)}
                      />
                    )}
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </section>

      <p className="mb-[1em] mt-14 text-center text-[13px] text-ink-3">
        Made with care for the family{year && ` · ${year}`}
      </p>
    </main>
  );
}
