/**
 * Auth0 Me Route Handler
 * Returns the current user session
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_session')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    return NextResponse.json({
      user: payload.user,
      accessToken: payload.accessToken,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
