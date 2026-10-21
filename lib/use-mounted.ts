// lib/use-mounted.ts
'use client';

import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => {};

/**
 * Reads a browser-only value without a hydration mismatch: the server and the first
 * client render get `serverValue`, then React re-renders with `read()`.
 */
export function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeToNothing, read, () => serverValue);
}

export function useMounted() {
  return useClientValue(() => true, false);
}
