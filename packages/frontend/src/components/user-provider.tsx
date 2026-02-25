'use client';

/**
 * User Provider Component
 * Wraps the application with session context.
 * Auth is handled by Amazon Cognito via the backend.
 */

import { ReactNode } from 'react';

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  return <>{children}</>;
}
