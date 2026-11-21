// lib/gifts.ts
import type { Gift } from '@/lib/db/schema';

/**
 * Who is getting a gift, from the viewer's point of view:
 * 'me' = the viewer claimed it, 'other' = someone else did,
 * null = nobody has, or it was claimed before claims were tracked (anyone may change it).
 */
export type Claim = 'me' | 'other' | null;

export function isTaken(gift: Pick<Gift, 'status'>): boolean {
  return gift.status === 'will_buy' || gift.status === 'bought';
}

/** True when this viewer may change the gift's status. Owners never can. */
export function canChangeStatus(gift: Gift, viewerId: number): boolean {
  if (gift.userId === viewerId) return false;
  return !isTaken(gift) || gift.claimedBy === null || gift.claimedBy === viewerId;
}

/** The gift as the viewer may see it: never who claimed it, and nothing at all on their own gifts. */
export function toClientGift(gift: Gift, viewerId: number) {
  const { claimedBy, ...rest } = gift;

  // Keep the surprise: owners never see whether their own gifts are claimed
  if (gift.userId === viewerId) {
    return { ...rest, status: null, claim: null as Claim };
  }

  const claim: Claim =
    !isTaken(gift) || claimedBy === null ? null : claimedBy === viewerId ? 'me' : 'other';
  return { ...rest, claim };
}
