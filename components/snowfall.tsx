'use client';

import { useSyncExternalStore, type CSSProperties } from 'react';

const FLAKE_COUNT = 40;

// Small seeded PRNG so every render (and every visit) gets the same flakes
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(1225);
const between = (min: number, max: number) => min + random() * (max - min);

const FLAKES = Array.from({ length: FLAKE_COUNT }, () => {
  const fallDuration = between(8, 20);
  return {
    left: between(0, 100),
    size: between(2, 6),
    opacity: between(0.4, 0.9),
    fallDuration,
    // Negative delay so flakes are already mid-fall on first paint
    fallDelay: -between(0, fallDuration),
    swayDuration: between(2.5, 5),
    sway: between(6, 18),
  };
});

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const prefersReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

export function Snowfall() {
  // On the server we can't know the preference, so render nothing until hydrated
  const reduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => true);

  if (reduced) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      data-testid="snowfall"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {FLAKES.map((flake, i) => (
        <div
          key={i}
          className="snowflake"
          style={
            {
              left: `${flake.left}%`,
              '--fall-duration': `${flake.fallDuration}s`,
              '--fall-delay': `${flake.fallDelay}s`,
              '--sway-duration': `${flake.swayDuration}s`,
              '--sway': `${flake.sway}px`,
            } as CSSProperties
          }
        >
          <span
            style={{
              width: flake.size,
              height: flake.size,
              opacity: flake.opacity,
            }}
          />
        </div>
      ))}
    </div>
  );
}
