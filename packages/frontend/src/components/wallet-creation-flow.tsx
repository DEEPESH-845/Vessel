'use client';

/**
 * Wallet Creation Flow Component
 * Guides users through wallet type selection and creation process
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WalletCreationConfig } from '@/types/wallet-creation.types';
import { WalletCreationProgress } from '@/components/wallet-creation-progress';

interface WalletCreationFlowProps {
  userId: string;
  onComplete: (config: WalletCreationConfig) => void;
  onCancel?: () => void;
}

type WalletType = 'smart-contract' | 'mpc';
type RecoveryMethod = 'social' | 'guardian' | 'timelock';

export function WalletCreationFlow({ 
  userId, 
  onComplete, 
  onCancel 
}: WalletCreationFlowProps) {
  const [step, setStep] = useState<'type-selection' | 'recovery-setup' | 'creating'>('type-selection');
  const [selectedType, setSelectedType] = useState<WalletType>('smart-contract');
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>('social');

  const handleTypeSelect = (type: WalletType) => {
    setSelectedType(type);
    setStep('recovery-setup');
  };

  const handleRecoverySelect = (method: RecoveryMethod) => {
    setRecoveryMethod(method);
  };

  const handleContinue = () => {
    const config: WalletCreationConfig = {
      userId,
      provider: selectedType,
      recoveryMethod,
      initialChains: [1, 137, 42161, 8453] // Ethereum, Polygon, Arbitrum, Base
    };
    
    setStep('creating');
    onComplete(config);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg mx-4"
      >
        <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-6 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 'type-selection' && (
              <motion.div
                key="type-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Choose Your Wallet Type
                </h2>
                <p className="text-gray-400 mb-6">
                  Select the type of wallet that best fits your needs
                </p>

                <div className="space-y-4">
                  {/* Smart Contract Wallet Option */}
                  <button
                    onClick={() => handleTypeSelect('smart-contract')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType === 'smart-contract'
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10'
                        : 'border-[#27272A] hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#CCFF00]/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#CCFF00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Smart Contract Wallet
                          </h3>
                          <span className="inline-block px-2 py-1 text-xs font-medium text-[#CCFF00] bg-[#CCFF00]/20 rounded-full mt-1">
                            Recommended
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Advanced features with account abstraction, gasless transactions, and social recovery
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#CCFF00]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Pay gas fees in stablecoins
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#CCFF00]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Social recovery with guardians
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#CCFF00]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Session keys for seamless UX
                      </li>
                    </ul>
                  </button>

                  {/* MPC Wallet Option */}
                  <button
                    onClick={() => handleTypeSelect('mpc')}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      selectedType === 'mpc'
                        ? 'border-[#CCFF00] bg-[#CCFF00]/10'
                        : 'border-[#27272A] hover:border-[#CCFF00]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            MPC Wallet
                          </h3>
                          <span className="inline-block px-2 py-1 text-xs font-medium text-purple-400 bg-purple-500/20 rounded-full mt-1">
                            Advanced
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Distributed key management with multi-party computation for enhanced security
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        No single point of failure
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Distributed key shares (2-of-3)
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Compatible with all dApps
                      </li>
                    </ul>
                  </button>
                </div>

                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="w-full mt-6 px-4 py-3 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </motion.div>
            )}

            {step === 'recovery-setup' && (
              <motion.div
                key="recovery-setup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setStep('type-selection')}
                  className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Set Up Recovery
                </h2>
                <p className="text-gray-400 mb-6">
                  Choose how you want to recover your wallet if you lose access
                </p>

                <div className="space-y-4 mb-6">
                  {selectedType === 'smart-contract' && (
                    <>
                      <button
                        onClick={() => handleRecoverySelect('social')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          recoveryMethod === 'social'
                            ? 'border-[#CCFF00] bg-[#CCFF00]/10'
                            : 'border-[#27272A] hover:border-[#CCFF00]/50'
                        }`}
                      >
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Social Recovery
                        </h3>
                        <p className="text-sm text-gray-400">
                          Add trusted guardians who can help you recover your wallet (2-of-3 threshold)
                        </p>
                      </button>

                      <button
                        onClick={() => handleRecoverySelect('timelock')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          recoveryMethod === 'timelock'
                            ? 'border-[#CCFF00] bg-[#CCFF00]/10'
                            : 'border-[#27272A] hover:border-[#CCFF00]/50'
                        }`}
                      >
                        <h3 className="text-lg font-semibold text-white mb-1">
                          Timelock Recovery
                        </h3>
                        <p className="text-sm text-gray-400">
                          48-hour timelock before recovery execution for added security
                        </p>
                      </button>
                    </>
                  )}

                  {selectedType === 'mpc' && (
                    <div className="p-4 rounded-xl border-2 border-[#CCFF00] bg-[#CCFF00]/10">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        MPC Key Share Recovery
                      </h3>
                      <p className="text-sm text-gray-400">
                        Your key will be split into 3 shares distributed across secure providers. You&apos;ll need 2 shares to recover.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full px-4 py-3 bg-[#CCFF00] text-black font-semibold rounded-xl hover:bg-[#CCFF00]/90 transition-colors"
                >
                  Create Wallet
                </button>
              </motion.div>
            )}

            {step === 'creating' && (
              <motion.div
                key="creating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <WalletCreationProgress userId={userId} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
