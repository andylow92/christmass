// app/page.tsx
'use client'


import ChristmasWishlist from '@/components/christmas-wishlist'

export default function Home() {
  return (
    <div className="grid grid-rows-[auto_1fr] min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">Family Christmas Wishlist</h1>
      </header>

      <main className="flex flex-col">
        <ChristmasWishlist />
      </main>
    </div>
  );
}