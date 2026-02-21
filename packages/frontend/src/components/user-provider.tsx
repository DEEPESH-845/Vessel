'use client';

/**
 * User Provider Component
 * Wraps the application with Auth0 UserProvider for session management
 */

import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { ReactNode } from 'react';

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  return <Auth0Provider>{children}</Auth0Provider>;
}
