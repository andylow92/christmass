// components/wishlist/use-wishlist.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { notify, notifyError } from './notify';
import type { FamilyMember, GiftDetails, GiftStatus, WishlistGift } from './types';

class RequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new RequestError(data?.error ?? `Request failed (${response.status})`, response.status);
  }

  return (response.status === 204 ? null : await response.json()) as T;
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
      .catch(() => {
        // Shown inline with a "Try again" button
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, reload]);

  async function addGift(details: GiftDetails, onSuccess?: () => void) {
    try {
      const gift = await request<WishlistGift>('/api/gifts', {
        method: 'POST',
        body: JSON.stringify(details),
      });
      setGifts((current) => [...(current ?? []), gift]);
      onSuccess?.();
      notify(
        <>
          Added <b>{gift.item}</b> to your list
        </>
      );
    } catch {
      notifyError("Couldn't add your wish. Please try again.", () => void addGift(details, onSuccess));
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
      notify('Saved');
    } catch {
      notifyError("Couldn't save your changes. Please try again.", () =>
        void updateGift(giftId, details, onSuccess)
      );
    }
  }

  async function deleteGift(giftId: number) {
    try {
      await request<null>(`/api/gifts/${giftId}`, { method: 'DELETE' });
      setGifts((current) => (current ?? []).filter((gift) => gift.id !== giftId));
      notify('Removed from your list');
    } catch {
      notifyError("Couldn't remove that wish. Please try again.", () => void deleteGift(giftId));
    }
  }

  /** Resolves to false when the server refused and the change was rolled back. */
  async function setStatus(gift: WishlistGift, status: GiftStatus) {
    const replace = (value: WishlistGift) =>
      setGifts((current) => (current ?? []).map((item) => (item.id === gift.id ? value : item)));

    // Optimistic: flip it now, roll back if the server says no
    replace({ ...gift, status, claim: status === 'pending' ? null : 'me' });
    try {
      replace(
        await request<WishlistGift>(`/api/gifts/${gift.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        })
      );
      return true;
    } catch (error) {
      replace(gift);
      if (error instanceof RequestError && error.status === 409) {
        // Someone else got there first: show it, and fetch who has what now
        notifyError(error.message);
        reload();
      } else {
        notifyError("Couldn't update that. Please try again.");
      }
      return false;
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
