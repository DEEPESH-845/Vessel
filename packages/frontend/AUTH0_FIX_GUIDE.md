# Auth0 Integration Fix Guide

## Root Cause Analysis

The authentication issue has multiple root causes:

1. **Wrong Auth0 SDK Usage**: The code was using incorrect imports and methods from `@auth0/nextjs-auth0` v4
2. **Session Check Mismatch**: Wallet page was checking mock store (`isLoggedIn`) instead of Auth0 session
3. **Incorrect API Routes**: Auth0 routes were not properly configured for Next.js App Router

## Solution Steps

### Step 1: Install Correct Auth0 SDK

The `@auth0/nextjs-auth0` package is already installed (v4.15.0), but we need to use it correctly.

### Step 2: Create Proper Auth0 Configuration

Create a new file: `src/app/api/auth/[auth0]/route.ts`

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

This single route handles all Auth0 operations (login, logout, callback).

### Step 3: Update Environment Variables

Ensure `.env.local` has:
```env
AUTH0_SECRET='your-secret-here'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-domain.auth0.com'
AUTH0_CLIENT_ID='your-client-id'
AUTH0_CLIENT_SECRET='your-client-secret'
```

### Step 4: Update Login Flow

Change the login button to redirect to:
```typescript
window.location.href = '/api/auth/login?returnTo=/wallet';
```

### Step 5: Update Wallet Page

Check Auth0 session instead of mock store:
```typescript
import { getSession } from '@auth0/nextjs-auth0';

// In component:
const session = await getSession();
if (!session) {
  router.push('/');
}
```

### Step 6: Auth0 Dashboard Configuration

Ensure these URLs are configured in Auth0 Dashboard:

**Allowed Callback URLs:**
- `http://localhost:3000/api/auth/callback`

**Allowed Logout URLs:**
- `http://localhost:3000`

**Allowed Web Origins:**
- `http://localhost:3000`

## Implementation

I'll now implement these fixes properly.
