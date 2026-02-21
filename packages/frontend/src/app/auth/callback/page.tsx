'use client';

/**
 * OAuth Callback Page
 * Handles the OAuth callback and redirects to the wallet dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if authentication was successful
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          setStatus('success');
          // Redirect to wallet dashboard after successful authentication
          setTimeout(() => {
            router.push('/wallet');
          }, 1000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#18181B] border border-[#27272A] rounded-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#27272A] border-t-[#CCFF00] rounded-full animate-spin"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Authenticating...</h1>
            <p className="text-gray-400">Please wait while we complete your login</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-[#CCFF00] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Success!</h1>
            <p className="text-gray-400">Redirecting to your wallet...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Failed</h1>
            <p className="text-gray-400 mb-4">{error || 'An error occurred during authentication'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#CCFF00] text-black font-medium rounded-lg hover:bg-[#b8e600] transition-colors"
            >
              Return to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
