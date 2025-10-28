import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-key-that-is-at-least-32-bytes-long');

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  const isPrivateRoute = ['/dashboard', '/simulation', '/penalties'].some(path => pathname.startsWith(path));

  // If no token and trying to access a private route, redirect to login
  if (!sessionToken && isPrivateRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there is a token
  if (sessionToken) {
    try {
      // Verify the token
      await jwtVerify(sessionToken, SECRET_KEY);

      // If token is valid and user is on the login page, redirect to dashboard
      if (pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (err) {
      // If token verification fails, it's invalid.
      // If they are on a private route, redirect to login.
      // We also clear the invalid cookie.
      if (isPrivateRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session_token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/simulation/:path*', '/penalties/:path*', '/login'],
};
