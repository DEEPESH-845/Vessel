/**
 * useAuth Hook
 * Provides easy access to authentication state and user profile
 */

import { useUser } from '@auth0/nextjs-auth0/client';
import { UserProfile } from '@/types/auth.types';

export function useAuth() {
  const { user, error, isLoading } = useUser();

  const userProfile: UserProfile | null = user
    ? {
        id: user.sub || '',
        email: user.email,
        socialProvider: getSocialProvider(user.sub),
        walletAddress: (user as any).walletAddress,
        walletType: (user as any).walletType,
        createdAt: new Date((user as any).created_at || Date.now()),
        lastLoginAt: new Date(),
        preferences: (user as any).preferences || getDefaultPreferences(),
      }
    : null;

  return {
    user: userProfile,
    isAuthenticated: !!user,
    isLoading,
    error,
  };
}

function getSocialProvider(sub?: string): 'google' | 'apple' | 'email' | undefined {
  if (!sub) return undefined;
  if (sub.startsWith('google-oauth2|')) return 'google';
  if (sub.startsWith('apple|')) return 'apple';
  if (sub.startsWith('email|') || sub.startsWith('auth0|')) return 'email';
  return undefined;
}

function getDefaultPreferences() {
  return {
    defaultChain: 1,
    defaultToken: 'ETH',
    gasPreference: 'standard' as const,
    enableNotifications: true,
    enableHaptics: true,
    theme: 'dark' as const,
    currency: 'USD' as const,
  };
}
