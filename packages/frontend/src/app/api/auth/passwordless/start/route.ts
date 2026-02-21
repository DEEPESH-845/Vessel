/**
 * Passwordless Authentication Start
 * Initiates magic link email authentication
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');
    const clientId = process.env.AUTH0_CLIENT_ID;
    const clientSecret = process.env.AUTH0_CLIENT_SECRET;

    if (!auth0Domain || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Auth0 configuration is missing' },
        { status: 500 }
      );
    }

    // Call Auth0 Passwordless API
    const response = await fetch(`https://${auth0Domain}/passwordless/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        connection: 'email',
        email: email,
        send: 'link',
        authParams: {
          scope: 'openid profile email',
          redirect_uri: `${process.env.AUTH0_BASE_URL}/api/auth/callback`,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Failed to send magic link');
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent to your email',
      email,
    });
  } catch (error) {
    console.error('Passwordless start error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
