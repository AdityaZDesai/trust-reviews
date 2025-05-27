import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const pathname = request.nextUrl.pathname;

  // If there's no session and the user is trying to access a protected route
  if (!session && pathname !== '/' && !pathname.includes('/_next')) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // If there's a session and the user is on the login page
  if (session && pathname === '/') {
    const url = new URL('/dashboard', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};