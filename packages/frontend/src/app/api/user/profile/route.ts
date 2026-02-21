/**
 * User Profile API
 * Handles user profile retrieval and updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function getSession(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_session')?.value;
    
    if (!token) {
      return null;
    }
    
    const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return {
      user: payload.user as any,
      accessToken: payload.accessToken,
    };
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Transform Auth0 user to our UserProfile format
    const userProfile = {
      id: session.user.sub,
      email: session.user.email,
      socialProvider: getSocialProvider(session.user.sub),
      walletAddress: session.user.walletAddress,
      walletType: session.user.walletType,
      createdAt: session.user.created_at || new Date(),
      lastLoginAt: new Date(),
      preferences: session.user.preferences || getDefaultPreferences(),
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // In a real implementation, you would update the user profile in your database
    // For now, we'll just return the updated profile
    const updatedProfile = {
      ...session.user,
      ...updates,
      lastLoginAt: new Date(),
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

function getSocialProvider(sub: string): 'google' | 'apple' | 'email' | undefined {
  if (sub.startsWith('google-oauth2|')) return 'google';
  if (sub.startsWith('apple|')) return 'apple';
  if (sub.startsWith('email|') || sub.startsWith('auth0|')) return 'email';
  return undefined;
}

function getDefaultPreferences() {
  return {
    defaultChain: 1, // Ethereum mainnet
    defaultToken: 'ETH',
    gasPreference: 'standard' as const,
    enableNotifications: true,
    enableHaptics: true,
    theme: 'dark' as const,
    currency: 'USD' as const,
  };
}
