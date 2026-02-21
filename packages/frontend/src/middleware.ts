/**
 * Next.js Middleware
 * Handles session validation and automatic refresh
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Paths that require authentication
const protectedPaths = ['/wallet', '/activity', '/pay', '/scan'];

// Paths that should redirect to wallet if authenticated
const authPaths = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname.startsWith(path));
  
  // Get session token
  const token = request.cookies.get('auth_session')?.value;
  
  if (token) {
    try {
      // Verify token
      const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
      const { payload } = await jwtVerify(token, secret);
      
      // Check if token is about to expire (less than 1 day remaining)
      const exp = payload.exp as number;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = exp - now;
      
      // If token expires in less than 1 day, we could refresh it here
      // For now, we'll just let it expire and user will need to re-login
      
      // If user is on auth path and authenticated, redirect to wallet
      if (isAuthPath) {
        return NextResponse.redirect(new URL('/wallet', request.url));
      }
      
      // Allow access to protected paths
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      if (isProtectedPath) {
        // Redirect to home page
        const response = NextResponse.redirect(new URL('/', request.url));
        // Clear invalid token
        response.cookies.delete('auth_session');
        return response;
      }
    }
  } else {
    // No token
    if (isProtectedPath) {
      // Redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
