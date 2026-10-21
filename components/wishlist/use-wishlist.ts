// components/wishlist/use-wishlist.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { FamilyMember, GiftDetails, GiftStatus, WishlistGift } from './types';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }

  return (response.status === 204 ? null : await response.json()) as T;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong';
}

export function useWishlist() {
  const [users, setUsers] = useState<FamilyMember[] | null>(null);
  const [gifts, setGifts] = useState<WishlistGift[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setUsers(null);
    setGifts(null);
    setLoadFailed(false);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      request<FamilyMember[]>('/api/users'),
      request<WishlistGift[]>('/api/gifts'),
    ])
      .then(([loadedUsers, loadedGifts]) => {
        if (cancelled) return;
        setUsers(loadedUsers);
        setGifts(loadedGifts);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadFailed(true);
        toast.error("Couldn't load the wishlists", {
          description: errorMessage(error),
          action: { label: 'Try again', onClick: reload },
        });
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, reload]);

  function failed(title: string, error: unknown, retry: () => void) {
    toast.error(title, {
      description: errorMessage(error),
      action: { label: 'Try again', onClick: retry },
    });
  }

  async function addGift(details: GiftDetails, onSuccess?: () => void) {
    try {
      const gift = await request<WishlistGift>('/api/gifts', {
        method: 'POST',
        body: JSON.stringify(details),
      });
      setGifts((current) => [...(current ?? []), gift]);
      onSuccess?.();
      toast.success(`Added “${gift.item}” to your list`);
    } catch (error) {
      failed("Couldn't add your wish", error, () => void addGift(details, onSuccess));
    }
  }

  async function updateGift(giftId: number, details: GiftDetails, onSuccess?: () => void) {
    try {
      const updated = await request<WishlistGift>(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        body: JSON.stringify(details),
      });
      setGifts((current) =>
        (current ?? []).map((gift) => (gift.id === giftId ? updated : gift))
      );
      onSuccess?.();
    } catch (error) {
      failed("Couldn't save your changes", error, () =>
        void updateGift(giftId, details, onSuccess)
      );
    }
  }

  async function deleteGift(giftId: number) {
    try {
      await request<null>(`/api/gifts/${giftId}`, { method: 'DELETE' });
      setGifts((current) => (current ?? []).filter((gift) => gift.id !== giftId));
    } catch (error) {
      failed("Couldn't remove that wish", error, () => void deleteGift(giftId));
    }
  }

  async function setStatus(giftId: number, status: GiftStatus, previous: GiftStatus | null) {
    // Optimistic: flip it now, roll back if the server says no
    const apply = (value: GiftStatus | null) =>
      setGifts((current) =>
        (current ?? []).map((gift) => (gift.id === giftId ? { ...gift, status: value } : gift))
      );

    apply(status);
    try {
      await request<WishlistGift>(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      apply(previous);
      failed("Couldn't update that gift", error, () => void setStatus(giftId, status, previous));
    }
  }

  return {
    users,
    gifts,
    loading: !loadFailed && (users === null || gifts === null),
    loadFailed,
    reload,
    addGift,
    updateGift,
    deleteGift,
    setStatus,
  };
}
