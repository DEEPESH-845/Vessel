'use client';

/**
 * Login Page
 * Provides social authentication options for users
 */

import { useState } from 'react';
import { SocialLoginButtons } from '@/components/social-login-buttons';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="text-[#CCFF00]">Vessel</span>
          </h1>
          <p className="text-gray-400">
            Sign in to access your Web3 wallet
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-8">
          {emailSent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#CCFF00] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 mb-6">
                We've sent you a magic link to sign in. Click the link in your email to continue.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-[#CCFF00] hover:underline"
              >
                Try another method
              </button>
            </div>
          ) : (
            <>
              <SocialLoginButtons
                onError={setError}
                onEmailSent={() => setEmailSent(true)}
              />

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#CCFF00] hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-[#CCFF00] hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
