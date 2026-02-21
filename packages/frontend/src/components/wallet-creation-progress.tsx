'use client';

/**
 * Wallet Creation Progress Component
 * Displays progress indicator during wallet creation
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { walletCreationService } from '@/services/wallet-creation.service';
import { WalletCreationProgress as ProgressType } from '@/types/wallet-creation.types';

interface WalletCreationProgressProps {
  userId: string;
}

export function WalletCreationProgress({ }: WalletCreationProgressProps) {
  const [progress, setProgress] = useState<ProgressType>({
    currentStep: 'generating-address',
    progress: 0,
    message: 'Initializing...'
  });

  useEffect(() => {
    const unsubscribe = walletCreationService.onProgress((newProgress) => {
      setProgress(newProgress);
    });

    return unsubscribe;
  }, []);

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'generating-address':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      case 'distributing-keys':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        );
      case 'preparing-deployment':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-8">
      <div className="flex flex-col items-center justify-center mb-8">
        <motion.div
          animate={{
            rotate: progress.currentStep === 'completed' ? 0 : 360,
            scale: progress.currentStep === 'completed' ? 1.2 : 1
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: progress.currentStep === 'completed' ? 0 : Infinity,
              ease: 'linear'
            },
            scale: {
              duration: 0.3
            }
          }}
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            progress.currentStep === 'completed'
              ? 'bg-[#CCFF00] text-black'
              : 'bg-[#CCFF00]/20 text-[#CCFF00]'
          }`}
        >
          {getStepIcon(progress.currentStep)}
        </motion.div>

        <h3 className="text-xl font-semibold text-white mb-2">
          {progress.currentStep === 'completed' ? 'Wallet Created!' : 'Creating Your Wallet'}
        </h3>
        <p className="text-gray-400 text-center">
          {progress.message}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#27272A] rounded-full h-2 mb-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-[#CCFF00] rounded-full"
        />
      </div>
      <div className="text-right text-sm text-gray-400">
        {progress.progress}%
      </div>

      {/* Step Indicators */}
      <div className="mt-8 space-y-3">
        <StepIndicator
          label="Generating Address"
          isActive={progress.currentStep === 'generating-address'}
          isCompleted={progress.progress > 10}
        />
        <StepIndicator
          label="Distributing Key Shares"
          isActive={progress.currentStep === 'distributing-keys'}
          isCompleted={progress.progress > 40}
        />
        <StepIndicator
          label="Preparing Deployment"
          isActive={progress.currentStep === 'preparing-deployment'}
          isCompleted={progress.progress > 60}
        />
        <StepIndicator
          label="Finalizing"
          isActive={progress.currentStep === 'completed'}
          isCompleted={progress.progress === 100}
        />
      </div>

      {progress.currentStep === 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-[#CCFF00]/10 border border-[#CCFF00] rounded-xl"
        >
          <p className="text-sm text-gray-300 text-center">
            Your wallet is ready to use! You can now start managing your crypto assets.
          </p>
        </motion.div>
      )}
    </div>
  );
}

interface StepIndicatorProps {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

function StepIndicator({ label, isActive, isCompleted }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-[#CCFF00] text-black'
            : isActive
            ? 'bg-[#CCFF00]/20 border-2 border-[#CCFF00]'
            : 'bg-[#27272A] border-2 border-[#27272A]'
        }`}
      >
        {isCompleted && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {isActive && !isCompleted && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-[#CCFF00]"
          />
        )}
      </div>
      <span
        className={`text-sm ${
          isCompleted || isActive ? 'text-white' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
