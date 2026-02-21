/**
 * Auth0 Logout Route Handler
 * Logs out the user and clears the session
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

    // Clear auth cookies
    response.cookies.delete('appSession');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
