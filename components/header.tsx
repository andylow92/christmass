'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/brand-mark';
import { InitialsAvatar } from '@/components/initials-avatar';

export function Header() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  const name = session.user.name ?? '';
  const firstName = name.split(' ')[0];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <BrandMark />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {name && (
            <span className="flex items-center gap-2">
              <InitialsAvatar name={name} />
              <span className="hidden text-sm font-medium text-foreground/90 sm:inline">
                {firstName}
              </span>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="h-9 rounded-full px-2.5 text-foreground/80 hover:bg-white/10 hover:text-foreground focus-visible:ring-accent focus-visible:ring-offset-background sm:px-3"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
