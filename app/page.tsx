// app/page.tsx
import { Header } from '@/components/header';
import { WishlistApp } from '@/components/wishlist/wishlist-app';

export default function Home() {
  return (
    <>
      <Header />
      <WishlistApp />
    </>
  );
}
