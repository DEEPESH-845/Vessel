'use client';

/**
 * Social Login Buttons Component
 * Provides Google, Apple, and Email authentication options
 */

import { useState } from 'react';
import { authService } from '@/services/auth.service';
import { Mail } from 'lucide-react';

interface SocialLoginButtonsProps {
  onError?: (error: string) => void;
  onEmailSent?: () => void;
}

export function SocialLoginButtons({ onError, onEmailSent }: SocialLoginButtonsProps) {
  const [email, setEmail] = useState('');
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await authService.authenticateWithGoogle();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    try {
      setIsLoading(true);
      await authService.authenticateWithApple();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Apple login failed');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      onError?.('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      await authService.authenticateWithEmail(email);
      onEmailSent?.();
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Email login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#18181B] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <span className="text-white font-medium">Continue with Google</span>
      </button>

      {/* Apple Login Button */}
      <button
        onClick={handleAppleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#18181B] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        <span className="text-white font-medium">Continue with Apple</span>
      </button>

      {/* Email Login Toggle/Form */}
      {!isEmailMode ? (
        <button
          onClick={() => setIsEmailMode(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#18181B] border border-[#27272A] rounded-lg hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mail className="w-5 h-5 text-white" />
          <span className="text-white font-medium">Continue with Email</span>
        </button>
      ) : (
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 bg-[#18181B] border border-[#27272A] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#CCFF00] transition-colors"
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-[#CCFF00] text-black font-medium rounded-lg hover:bg-[#b8e600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEmailMode(false);
                setEmail('');
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-[#18181B] border border-[#27272A] text-white rounded-lg hover:bg-[#27272A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#27272A]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-[#0A0A0A] text-gray-500">
            Secure authentication powered by Auth0
          </span>
        </div>
      </div>
    </div>
  );
}
