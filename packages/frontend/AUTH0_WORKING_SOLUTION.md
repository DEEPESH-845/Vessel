# Auth0 Working Solution

## Problem Summary

The Auth0 integration is not working because:
1. The wallet page checks a mock store instead of Auth0 session
2. Auth0 SDK imports are failing in the monorepo setup
3. The callback flow is not properly configured

## Working Solution

### Option 1: Use Auth0 SDK Properly (Recommended)

1. **Create the catch-all Auth0 route**: `src/app/api/auth/[...auth0]/route.ts`
```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

2. **Update the home page login**:
```typescript
const handleLogin = () => {
  window.location.href = '/api/auth/login?returnTo=/wallet';
};
```

3. **Update wallet page to check Auth0 session**:
```typescript
import { getSession } from '@auth0/nextjs-auth0';

export default async function WalletPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/');
  }
  
  // Rest of component
}
```

### Option 2: Manual Implementation (If SDK Issues Persist)

If the Auth0 SDK continues to have import issues in the monorepo, implement manually:

1. **Create manual login route**: `src/app/api/auth/login/route.ts`
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get('returnTo') || '/wallet';
  
  const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const redirectUri = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
  
  const authUrl = `${auth0Domain}/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `scope=openid profile email&` +
    `state=${encodeURIComponent(returnTo)}`;
  
  return NextResponse.redirect(authUrl);
}
```

2. **Create manual callback route**: `src/app/api/auth/callback/route.ts`
```typescript
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
    // Exchange code for tokens
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
      throw new Error('No access token received');
    }
    
    // Get user info
    const userResponse = await fetch(`${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    
    const user = await userResponse.json();
    
    // Create session JWT
    const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
    const token = await new SignJWT({ user, accessToken: tokens.access_token })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);
    
    // Set cookie and redirect
    const response = NextResponse.redirect(new URL(state, request.url));
    response.cookies.set('auth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400, // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
  }
}
```

3. **Create session check route**: `src/app/api/auth/me/route.ts`
```typescript
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
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
```

4. **Install jose for JWT handling**:
```bash
npm install jose
```

## Testing Steps

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Continue with Google"
4. You should be redirected to Google login
5. After authentication, you should be redirected to `/wallet`
6. The wallet page should display your user information

## Troubleshooting

If authentication still doesn't work:

1. **Check Auth0 Dashboard**:
   - Allowed Callback URLs: `http://localhost:3000/api/auth/callback`
   - Allowed Logout URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
   - Google connection is enabled

2. **Check Environment Variables**:
   - All AUTH0_* variables are set correctly
   - AUTH0_SECRET is a proper 32-byte hex string

3. **Check Browser Console**:
   - Look for any error messages
   - Check Network tab for failed requests

4. **Check Server Logs**:
   - Look for "Callback error" messages
   - Check for any Auth0 API errors
