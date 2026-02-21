/**
 * Auth0 Me Route Handler
 * Returns the current user session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

export async function GET(request: NextRequest) {
  try {
    const session = await auth0.getSession(request);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: session.user,
      accessToken: session.accessToken,
    });
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
