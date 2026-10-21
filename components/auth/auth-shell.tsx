// components/auth/auth-shell.tsx
import type { ReactNode } from 'react';
import { Check, LoaderCircle, ShoppingBag } from 'lucide-react';
import { Brand } from '@/components/brand';
import { Snow } from '@/components/snow';
import { ThemeToggle } from '@/components/theme-toggle';

/** Split screen from 960px: pine art panel on the left, the form on the right. Stacked below. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate overflow-hidden bg-[radial-gradient(700px_360px_at_90%_0%,rgba(226,182,90,.30),transparent_60%),radial-gradient(600px_320px_at_0%_100%,rgba(108,199,157,.22),transparent_60%),linear-gradient(155deg,#17533F,#0B2E23)] px-6 pb-9 pt-7 text-hero-ink lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-10">
        <Snow className="lg:[--fall:105vh]" />
        <Brand onHero className="relative z-[2]" />
        <div className="relative z-[2] mt-9 max-w-[520px]">
          <h1 className="font-display text-[clamp(44px,6.5vw,76px)] font-normal leading-[0.98] tracking-[-0.02em]">
            Wishes,
            <br />
            <em className="text-gold-bright">shared.</em>
          </h1>
          <p className="mt-4 max-w-[420px] text-[17px] text-hero-ink-2">
            One list for the whole family. See what everyone&apos;s hoping for, quietly claim a gift, and
            never buy the same socks twice.
          </p>
        </div>
        <FloatingCards />
      </aside>

      <main className="relative grid place-items-center px-5 pb-[120px] pt-8 lg:p-12">
        <ThemeToggle className="absolute right-4 top-4 z-[5]" />
        <div className="w-full max-w-[400px]">
          <h2 className="font-display text-[40px] font-normal leading-[1.05]">{title}</h2>
          <p className="mb-7 mt-2 text-ink-2">{subtitle}</p>
          {children}
          <p className="mb-[1em] mt-6 text-center text-[15px] text-ink-2">{footer}</p>
        </div>
      </main>
    </div>
  );
}

const floatingCardClass =
  'absolute w-[300px] rounded-[18px] border border-white/15 bg-white/[0.08] p-4 text-hero-ink shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)] backdrop-blur-[10px]';
const floatingPillClass =
  'mt-3 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-[rgba(241,213,142,.16)] px-3 text-[13px] font-semibold text-gold-bright [&_svg]:size-3.5';

function FloatingCards() {
  return (
    <div aria-hidden="true" className="relative z-[2] mt-10 hidden h-[230px] lg:block">
      <div className={`${floatingCardClass} left-0 top-2.5 -rotate-[4deg]`}>
        <b className="block">Cozy wool blanket</b>
        <small className="mt-0.5 block text-[13px] text-hero-ink-2">Mom · $40–60</small>
        <span className={floatingPillClass}>
          <ShoppingBag />
          Someone&apos;s on it
        </span>
      </div>
      <div className={`${floatingCardClass} left-[210px] top-24 rotate-[3deg]`}>
        <b className="block">Noise-cancelling headphones</b>
        <small className="mt-0.5 block text-[13px] text-hero-ink-2">Andy · $250–350</small>
        <span className={floatingPillClass}>
          <Check />
          Bought
        </span>
      </div>
    </div>
  );
}

export function OrDivider({ children }: { children: ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[13px] text-ink-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
      {children}
    </div>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-input bg-berry-soft px-3.5 py-2.5 text-[15px] text-berry-text">
      {children}
    </div>
  );
}

export function Spinner() {
  return <LoaderCircle aria-hidden="true" className="animate-spin" />;
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export const authLinkClass = 'rounded-sm font-semibold text-pine-text no-underline hover:underline underline-offset-4';
