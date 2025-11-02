import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname.startsWith('/login');
  const isOnSignupPage = req.nextUrl.pathname.startsWith('/signup');
  const isOnAuthPage = isOnLoginPage || isOnSignupPage;

  // If not logged in and trying to access protected route
  if (!isLoggedIn && !isOnAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If logged in and trying to access auth pages, redirect to home
  if (isLoggedIn && isOnAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

// Protect all routes except API routes, static files, and images
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
