// app/layout.tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/session-provider";
import { Header } from "@/components/header";
import { Snowfall } from "@/components/snowfall";
import { Toaster } from "@/components/ui/sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Family Christmas Wishlist",
    template: "%s · Family Wishlist",
  },
  description: "Share Christmas wishes with your family and keep the surprises secret",
};

export const viewport: Viewport = {
  themeColor: "#0E2A22",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <body className="font-sans antialiased">
        <Snowfall />
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
