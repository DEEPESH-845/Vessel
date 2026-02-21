'use client';

/**
 * Wallet Creation Example
 * Example component showing how to integrate wallet creation flow
 */

import { useState } from 'react';
import { WalletCreationFlow } from '@/components/wallet-creation-flow';
import { walletCreationService } from '@/services/wallet-creation.service';
import { WalletCreationConfig, CreatedWallet } from '@/types/wallet-creation.types';

export function WalletCreationExample() {
  const [showFlow, setShowFlow] = useState(false);
  const [wallet, setWallet] = useState<CreatedWallet | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async (config: WalletCreationConfig) => {
    setIsCreating(true);
    try {
      const createdWallet = await walletCreationService.createWallet(config);
      
      // Save wallet to backend
      await walletCreationService.saveWallet(config.userId, createdWallet);
      
      setWallet(createdWallet);
      
      // Close flow after a delay to show completion
      setTimeout(() => {
        setShowFlow(false);
        setIsCreating(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to create wallet:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">
          Wallet Creation Demo
        </h1>
        
        {!wallet ? (
          <div>
            <p className="text-gray-400 mb-6">
              Click the button below to start the wallet creation flow
            </p>
            <button
              onClick={() => setShowFlow(true)}
              disabled={isCreating}
              className="px-6 py-3 bg-[#CCFF00] text-black font-semibold rounded-xl hover:bg-[#CCFF00]/90 transition-colors disabled:opacity-50"
            >
              Create Wallet
            </button>
          </div>
        ) : (
          <div className="bg-[#18181B] border border-[#27272A] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Wallet Created Successfully!
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Address:</span>
                <p className="text-white font-mono break-all">{wallet.address}</p>
              </div>
              <div>
                <span className="text-gray-400">Type:</span>
                <p className="text-white">{wallet.type}</p>
              </div>
              <div>
                <span className="text-gray-400">Recovery Method:</span>
                <p className="text-white">{wallet.recoveryConfig.method}</p>
              </div>
              <div>
                <span className="text-gray-400">Created:</span>
                <p className="text-white">{wallet.createdAt.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFlow && (
        <WalletCreationFlow
          userId="demo-user-123"
          onComplete={handleCreateWallet}
          onCancel={() => setShowFlow(false)}
        />
      )}
    </div>
  );
}
