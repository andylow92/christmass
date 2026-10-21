// components/wishlist/hero.tsx
'use client';

import { Sparkle } from 'lucide-react';
import { Snow } from '@/components/snow';
import { useClientValue } from '@/lib/use-mounted';
import { christmasCountdown, partOfDay, wishCount } from './utils';

// Greeting and countdown depend on the viewer's clock, so they're computed in the browser only
function readClock() {
  const { days, year } = christmasCountdown();
  return `${partOfDay()}|${days}|${year}`;
}

export function Hero({ firstName, totalWishes }: { firstName: string; totalWishes: number | null }) {
  const clock = useClientValue(readClock, null);
  const [part, days, year] = clock?.split('|') ?? [];
  const sleeps = Number(days);

  return (
    <section
      aria-labelledby="greeting"
      className="relative isolate mt-6 overflow-hidden rounded-hero bg-[radial-gradient(600px_300px_at_85%_0%,rgba(226,182,90,.28),transparent_60%),radial-gradient(500px_260px_at_0%_100%,rgba(108,199,157,.22),transparent_60%),linear-gradient(150deg,var(--hero-2),var(--hero-1))] px-7 py-10 text-hero-ink shadow-lg md:mt-8 md:px-12 md:py-14"
    >
      <Snow />
      <Ornaments />
      <div className="relative z-[2] max-w-[560px]">
        <p className="mb-3.5 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-gold-bright [&_svg]:size-[15px]">
          <Sparkle aria-hidden="true" />
          Christmas<span>{year}</span>
        </p>
        <h1
          id="greeting"
          className="font-display text-[clamp(40px,7vw,64px)] font-normal leading-[1.02] tracking-[-0.015em]"
        >
          {clock && firstName ? (
            <>
              Good {part}, <em className="text-gold-bright">{firstName}</em>
            </>
          ) : (
            <span aria-hidden="true" className="inline-block h-[0.9em] w-[7em] max-w-full animate-pulse rounded-xl bg-white/10 align-middle" />
          )}
        </h1>
        <p className="mt-4 min-h-[1.55em] text-[17px] text-hero-ink-2">
          {clock && (
            <>
              {sleeps === 0 ? (
                <b className="font-semibold text-hero-ink">Merry Christmas!</b>
              ) : (
                <>
                  <b className="font-semibold text-hero-ink">
                    {sleeps} {sleeps === 1 ? 'sleep' : 'sleeps'}
                  </b>{' '}
                  until Christmas
                </>
              )}
              {totalWishes !== null && ` · ${wishCount(totalWishes)} across the family`}
            </>
          )}
        </p>
      </div>
    </section>
  );
}

/** Three baubles on strings: berry, gold and cream. Decorative only. */
function Ornaments() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-0 z-[1] w-[112px] min-[561px]:right-3 min-[561px]:w-[170px] min-[761px]:right-7 min-[761px]:w-[240px]"
    >
      <svg viewBox="0 0 220 170" xmlns="http://www.w3.org/2000/svg" className="h-auto w-full">
        <defs>
          <radialGradient id="orn-gold" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#FBE6AE" />
            <stop offset=".55" stopColor="#D9A441" />
            <stop offset="1" stopColor="#8E6114" />
          </radialGradient>
          <radialGradient id="orn-berry" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#F7A3B0" />
            <stop offset=".55" stopColor="#C23149" />
            <stop offset="1" stopColor="#701225" />
          </radialGradient>
          <radialGradient id="orn-cream" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset=".6" stopColor="#ECE5D6" />
            <stop offset="1" stopColor="#ADA188" />
          </radialGradient>
        </defs>
        <g className="orn">
          <line x1="52" y1="0" x2="52" y2="74" stroke="rgba(246,241,231,.5)" strokeWidth="1.2" />
          <rect x="46" y="74" width="12" height="8" rx="2" fill="#D8C48C" />
          <circle cx="52" cy="106" r="25" fill="url(#orn-berry)" />
        </g>
        <g className="orn">
          <line x1="122" y1="0" x2="122" y2="34" stroke="rgba(246,241,231,.5)" strokeWidth="1.2" />
          <rect x="115" y="34" width="14" height="9" rx="2" fill="#D8C48C" />
          <circle cx="122" cy="82" r="40" fill="url(#orn-gold)" />
          <path d="M84 76 Q122 90 160 76" stroke="rgba(255,255,255,.45)" strokeWidth="3" fill="none" />
          <path d="M86 92 Q122 104 158 92" stroke="rgba(255,255,255,.25)" strokeWidth="2" fill="none" />
        </g>
        <g className="orn">
          <line x1="188" y1="0" x2="188" y2="94" stroke="rgba(246,241,231,.5)" strokeWidth="1.2" />
          <rect x="183" y="94" width="10" height="7" rx="2" fill="#D8C48C" />
          <circle cx="188" cy="120" r="19" fill="url(#orn-cream)" />
        </g>
      </svg>
    </div>
  );
}
