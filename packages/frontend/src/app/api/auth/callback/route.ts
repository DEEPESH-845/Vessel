/**
 * Auth0 Callback Route Handler
 * Handles the OAuth callback after authentication
 */

import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // The middleware will handle the callback and create the session
    const response = await auth0.middleware(request);
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return Response.redirect(new URL('/?error=callback_failed', request.url));
  }
}
