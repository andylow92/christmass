'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Brand } from '@/components/brand';
import { Avatar } from '@/components/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { firstNameOf } from '@/components/wishlist/utils';

export function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? '';

  return (
    <header className="sticky top-0 z-20 border-b border-[color-mix(in_srgb,var(--line)_70%,transparent)] bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] backdrop-blur-[14px] backdrop-saturate-[1.6]">
      <div className="wrap flex h-16 items-center justify-between">
        <Link href="/" aria-label="Family Wishlist home" className="rounded-xl">
          <Brand />
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {name && (
            <span className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5">
              <Avatar name={name} />
              <span className="text-sm font-semibold max-[560px]:hidden">{firstNameOf(name)}</span>
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="max-[560px]:w-10 max-[560px]:px-0"
          >
            <LogOut aria-hidden="true" />
            <span className="max-[560px]:hidden">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
