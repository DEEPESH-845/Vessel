/**
 * Cognito Authentication Service
 * Handles authentication using AWS Cognito via Amplify
 * Replaces Auth0-based auth service
 */

import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes, confirmSignUp, resendSignUpCode, resetPassword, confirmResetPassword, updateMFAPreference, setUpTOTP } from 'aws-amplify/auth';

export interface CognitoUser {
  userId: string;
  email: string;
  givenName?: string;
  familyName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: CognitoUser;
  error?: string;
  nextStep?: {
    signUpStep: 'CONFIRM_SIGN_UP' | 'DONE';
    codeDeliveryDetails?: {
      destination: string;
      deliveryMedium: string;
      attributeName: string;
    };
  };
}

export interface SessionData {
  user: CognitoUser;
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Cognito Auth Service
 * Provides authentication methods using AWS Cognito
 */
export class CognitoAuthService {
  private static instance: CognitoAuthService;
  private currentSession: SessionData | null = null;

  private constructor() {}

  static getInstance(): CognitoAuthService {
    if (!CognitoAuthService.instance) {
      CognitoAuthService.instance = new CognitoAuthService();
    }
    return CognitoAuthService.instance;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signIn({
        username: email,
        password,
      });

      if (result.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
        return {
          success: false,
          error: 'Confirmation required',
          nextStep: {
            signUpStep: 'CONFIRM_SIGN_UP',
            codeDeliveryDetails: result.nextStep.codeDeliveryDetails,
          },
        };
      }

      // Fetch user attributes
      const user = await this.fetchCurrentUser();
      return { success: true, user };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    givenName?: string,
    familyName?: string
  ): Promise<AuthResult> {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            given_name: givenName,
            family_name: familyName,
          },
        },
      });

      if (result.isSignUpComplete) {
        return { success: true };
      }

      return {
        success: false,
        nextStep: {
          signUpStep: 'CONFIRM_SIGN_UP',
          codeDeliveryDetails: result.nextStep.codeDeliveryDetails,
        },
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  /**
   * Confirm sign up with verification code
   */
  async confirmSignUp(email: string, code: string): Promise<AuthResult> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      // Auto sign in after confirmation
      return this.signIn(email, ''); // Password not needed after confirmation
    } catch (error) {
      console.error('Confirm sign up error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Confirmation failed',
      };
    }
  }

  /**
   * Resend verification code
   */
  async resendConfirmationCode(email: string): Promise<AuthResult> {
    try {
      await resendSignUpCode({ username: email });
      return { success: true };
    } catch (error) {
      console.error('Resend code error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resend code',
      };
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut();
      this.currentSession = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      const cognitoUser: CognitoUser = {
        userId: user.userId,
        email: attributes.email || '',
        givenName: attributes.given_name,
        familyName: attributes.family_name,
        phoneNumber: attributes.phone_number,
        emailVerified: attributes.email_verified === 'true',
        phoneNumberVerified: attributes.phone_number_verified === 'true',
      };

      // Get tokens
      const result = await fetchAuthSession();
      const idToken = result.tokens?.idToken?.toString() || '';
      const accessToken = result.tokens?.accessToken?.toString() || '';

      this.currentSession = {
        user: cognitoUser,
        idToken,
        accessToken,
      };

      return this.currentSession;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Fetch current user
   */
  async fetchCurrentUser(): Promise<CognitoUser | null> {
    try {
      const user = await getCurrentUser();
      const attributes = await fetchUserAttributes();

      return {
        userId: user.userId,
        email: attributes.email || '',
        givenName: attributes.given_name,
        familyName: attributes.family_name,
        phoneNumber: attributes.phone_number,
        emailVerified: attributes.email_verified === 'true',
        phoneNumberVerified: attributes.phone_number_verified === 'true',
      };
    } catch (error) {
      console.error('Fetch user error:', error);
      return null;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await resetPassword({ username: email });
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  /**
   * Confirm password reset with new password
   */
  async confirmPasswordReset(
    email: string,
    code: string,
    newPassword: string
  ): Promise<AuthResult> {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      return { success: true };
    } catch (error) {
      console.error('Confirm password reset error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset confirmation failed',
      };
    }
  }

  /**
   * Set up TOTP (Time-based One-Time Password) for MFA
   */
  async setupTOTP(): Promise<{ secretCode: string } | null> {
    try {
      const result = await setUpTOTP();
      return { secretCode: result.sharedSecret };
    } catch (error) {
      console.error('Setup TOTP error:', error);
      return null;
    }
  }

  /**
   * Update MFA preference
   */
  async updateMFAPreference(totpEnabled: boolean, smsEnabled: boolean): Promise<void> {
    try {
      await updateMFAPreference({
        totpEnabled,
        smsEnabled,
      });
    } catch (error) {
      console.error('Update MFA preference error:', error);
      throw error;
    }
  }

  /**
   * Get ID token for API calls
   */
  async getIdToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() || null;
    } catch {
      return null;
    }
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString() || null;
    } catch {
      return null;
    }
  }
}

// Re-export fetchAuthSession for internal use
import { fetchAuthSession } from 'aws-amplify/auth';

export const cognitoAuthService = CognitoAuthService.getInstance();
