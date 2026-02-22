'use client';

/**
 * Social Login Buttons Component
 * Provides Email/Password authentication using AWS Cognito
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

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#27272A]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0A0A0A] text-gray-500">
            Secure authentication powered by AWS Cognito
          </span>
        </div>
      </div>
    </div>
  );
}
