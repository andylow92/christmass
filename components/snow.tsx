'use client';

import type { CSSProperties } from 'react';
import { useClientValue } from '@/lib/use-mounted';
import { cn } from '@/lib/utils';

const FLAKE_COUNT = 36;

// Seeded (Park-Miller) so every render gets the same flakes and the layout stays stable
function makeFlakes() {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: FLAKE_COUNT }, () => {
    const size = 2 + random() * 3.5;
    return {
      left: `${(random() * 100).toFixed(2)}%`,
      size: `${size.toFixed(1)}px`,
      opacity: Number((0.35 + random() * 0.5).toFixed(2)),
      duration: `${(9 + random() * 12).toFixed(1)}s`,
      delay: `-${(random() * 20).toFixed(1)}s`,
      drift: `${(random() * 40 - 20).toFixed(0)}px`,
    };
  });
}

const FLAKES = makeFlakes();

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** A light snowfall layer for the hero and the auth art panel. Nothing under reduced motion. */
export function Snow({ className }: { className?: string }) {
  // Unknown on the server, so only render once hydrated
  const reduced = useClientValue(prefersReducedMotion, true);
  if (reduced) return null;

  return (
    <div
      aria-hidden="true"
      className={cn('snow pointer-events-none absolute inset-0 z-0 overflow-hidden', className)}
    >
      {FLAKES.map((flake, i) => (
        <i
          key={i}
          style={
            {
              left: flake.left,
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
              animationDuration: flake.duration,
              animationDelay: flake.delay,
              '--drift': flake.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
