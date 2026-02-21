/**
 * Auth0 Login Route Handler
 * Initiates the OAuth flow by redirecting to Auth0
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/wallet';
  const connection = searchParams.get('connection') || 'google-oauth2';
  
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
  
  const authUrl = `${auth0Domain}/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=openid profile email&` +
    `connection=${connection}&` +
    `state=${encodeURIComponent(returnTo)}`;
  
  return NextResponse.redirect(authUrl);
}
