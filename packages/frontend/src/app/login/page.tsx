'use client';

/**
 * Login Page
 * Provides social authentication options for users
 */

import { useState } from 'react';
import { SocialLoginButtons } from '@/components/social-login-buttons';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

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
          <SocialLoginButtons
            mode="login"
            onError={setError}
            onSuccess={() => {
              // Redirect to wallet dashboard on successful login
              window.location.href = '/wallet';
            }}
          />

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
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
