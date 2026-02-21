/**
 * Auth0 Logout Route Handler
 * Clears the session and redirects to Auth0 logout
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
    const clientId = process.env.AUTH0_CLIENT_ID;
    const baseUrl = process.env.AUTH0_BASE_URL;
    
    // Clear the session cookie
    const response = NextResponse.redirect(
      `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=${encodeURIComponent(baseUrl || '')}`
    );
    
    // Delete all auth-related cookies
    response.cookies.delete('auth_session');
    response.cookies.delete('has_logged_in');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('auth_session');
    response.cookies.delete('has_logged_in');
    return response;
  }
}
