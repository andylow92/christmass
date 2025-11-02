'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Gift, LogOut, Sparkles } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <header className="glass-strong border-b border-white/20 shadow-2xl sticky top-0 z-50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative animate-pulse">
              <Gift className="h-8 w-8 text-emerald-400 drop-shadow-lg filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <Sparkles className="h-4 w-4 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Christmas Wishlist 🎄</h1>
              <p className="text-sm text-white drop-shadow-md font-medium">
                Welcome, {session.user.name}! ✨
              </p>
            </div>
          </div>
          <Button
            onClick={() => signOut({ callbackUrl: '/login' })}
            variant="outline"
            className="glass border-white/30 text-white hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 hover:border-white/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
