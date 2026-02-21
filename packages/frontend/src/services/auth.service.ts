/**
 * Authentication Service
 * Handles authentication operations including social login and session management
 */

import { AuthResult, UserProfile, SessionData } from '@/types/auth.types';

export class AuthService {
  private static instance: AuthService;
  private sessionData: SessionData | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate with Google OAuth
   */
  async authenticateWithGoogle(): Promise<AuthResult> {
    try {
      // Redirect to Auth0 Google login
      window.location.href = '/api/auth/login?connection=google-oauth2';
      
      // This will never execute as we redirect, but TypeScript needs a return
      return {} as AuthResult;
    } catch (error) {
      throw new Error(`Google authentication failed: ${error}`);
    }
  }

  /**
   * Authenticate with Apple Sign In
   */
  async authenticateWithApple(): Promise<AuthResult> {
    try {
      // Redirect to Auth0 Apple login
      window.location.href = '/api/auth/login?connection=apple';
      
      return {} as AuthResult;
    } catch (error) {
      throw new Error(`Apple authentication failed: ${error}`);
    }
  }

  /**
   * Authenticate with Email (Magic Link)
   */
  async authenticateWithEmail(email: string): Promise<AuthResult> {
    try {
      // Send magic link via Auth0
      const response = await fetch('/api/auth/passwordless/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(`Email authentication failed: ${error}`);
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const response = await fetch('/api/auth/me');
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      this.sessionData = data;
      return data;
    } catch (error) {
      console.error('Failed to get session:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      window.location.href = '/api/auth/logout';
    } catch (error) {
      throw new Error(`Logout failed: ${error}`);
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      return updatedProfile;
    } catch (error) {
      throw new Error(`Profile update failed: ${error}`);
    }
  }
}

export const authService = AuthService.getInstance();
