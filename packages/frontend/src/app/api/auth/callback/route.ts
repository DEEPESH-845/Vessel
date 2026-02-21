/**
 * Auth0 Callback Route Handler
 * Handles the OAuth callback and creates a persistent session
 */

import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/wallet';
  
  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }
  
  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
      }),
    });
    
    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      console.error('Token exchange failed:', tokens);
      throw new Error('No access token received');
    }
    
    // Get user information
    const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const user = await userResponse.json();
    
    // Create persistent session JWT (7 days)
    const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
    const token = await new SignJWT({ 
      user, 
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token, // Store refresh token if available
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days for persistent login
      .sign(secret);
    
    // Set persistent cookie and redirect
    const response = NextResponse.redirect(new URL(state, request.url));
    
    // Set auth session cookie with 7-day expiration
    response.cookies.set('auth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });
    
    // Set a flag to indicate user has logged in before (for auto-redirect)
    response.cookies.set('has_logged_in', 'true', {
      httpOnly: false, // Accessible to client-side for quick checks
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
