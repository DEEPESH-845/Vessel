'use client';

/**
 * Social Login Buttons Component
 * Provides Email/Password and Google authentication using AWS Cognito
 */

import { useState } from 'react';
import { cognitoAuthService } from '@/services/cognito-auth.service';
import { ArrowRight, Loader2 } from 'lucide-react';

interface SocialLoginButtonsProps {
  onError?: (error: string) => void;
  onSuccess?: () => void;
  mode?: 'login' | 'signup';
}

export function SocialLoginButtons({ 
  onError, 
  onSuccess,
  mode = 'login' 
}: SocialLoginButtonsProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    if (!email || !email.includes('@')) {
      const err = 'Please enter a valid email address';
      setLocalError(err);
      onError?.(err);
      return;
    }

    if (!password || password.length < 8) {
      const err = 'Password must be at least 8 characters';
      setLocalError(err);
      onError?.(err);
      return;
    }

    try {
      setIsLoading(true);

      if (mode === 'signup') {
        const result = await cognitoAuthService.signUp(
          email, 
          password,
          givenName || undefined,
          familyName || undefined
        );
        
        if (result.success) {
          setIsConfirming(true);
        } else if (result.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
          setIsConfirming(true);
        } else {
          setLocalError(result.error || 'Sign up failed');
          onError?.(result.error || 'Sign up failed');
        }
      } else {
        const result = await cognitoAuthService.signIn(email, password);
        
        if (result.success) {
          onSuccess?.();
        } else {
          setLocalError(result.error || 'Login failed');
          onError?.(result.error || 'Login failed');
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'An error occurred';
      setLocalError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      // Note: Google OAuth requires configuration in AWS Cognito
      // To enable:
      // 1. Go to AWS Cognito Console → User Pool → Sign-in experience
      // 2. Add Google as federated identity provider
      // 3. Configure Google OAuth credentials
      // 4. Add callback URLs
      
      // For now, show an informative message
      setLocalError('Google Sign In requires AWS Cognito configuration. Please contact support.');
      onError?.('Google Sign In requires AWS Cognito configuration');
      
      // Once configured, use this:
      // const { signInWithRedirect } = await import('aws-amplify/auth');
      // await signInWithRedirect({ provider: 'Google' });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Google sign-in failed';
      setLocalError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!confirmationCode || confirmationCode.length < 6) {
      const err = 'Please enter a valid confirmation code';
      setLocalError(err);
      onError?.(err);
      return;
    }

    try {
      setIsLoading(true);
      const result = await cognitoAuthService.confirmSignUp(email, confirmationCode);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setLocalError(result.error || 'Confirmation failed');
        onError?.(result.error || 'Confirmation failed');
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Confirmation failed';
      setLocalError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      await cognitoAuthService.resendConfirmationCode(email);
    } catch (error) {
      console.error('Failed to resend code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmation view for sign up
  if (isConfirming) {
    return (
      <div className="w-full max-w-md space-y-4">
        <form onSubmit={handleConfirm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmation Code
            </label>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Enter the code from your email"
              className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
              disabled={isLoading}
              maxLength={6}
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#CCFF00] text-black font-medium rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm'}
          </button>

          <div className="flex justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setIsConfirming(false);
                setConfirmationCode('');
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-[#CCFF00] hover:text-[#b8e600] transition-colors disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Sign up form with name fields
  if (mode === 'signup') {
    return (
      <div className="w-full max-w-md space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="John"
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Doe"
                className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
              disabled={isLoading}
              minLength={8}
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#CCFF00] text-black font-medium rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Login form
  return (
    <div className="w-full max-w-md space-y-4">
      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#27272A]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0A0A0A] text-gray-500">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#CCFF00] text-black font-medium rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 pt-2">
        Secure authentication powered by AWS Cognito
      </div>
    </div>
  );
}