// components/wishlist/types.ts
export type GiftStatus = 'pending' | 'will_buy' | 'bought';

export interface FamilyMember {
  id: number;
  name: string;
}

export interface WishlistGift {
  id: number;
  userId: number;
  item: string;
  description: string | null;
  priceRange: string | null;
  // Always null for the viewer's own gifts: the server keeps the surprise
  status: GiftStatus | null;
  // 'me' = you're getting it, 'other' = someone else is, null = nobody (or an older claim anyone can change)
  claim: 'me' | 'other' | null;
  createdAt?: string | null;
}

export interface GiftDetails {
  item: string;
  description: string;
  priceRange: string;
}
