/**
 * Transaction Timeline Component
 * Visual timeline for transaction stages with animations
 * Requirements: FR-14.1, FR-14.2, FR-14.3
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Clock, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Timeline Stage
 */
export interface TimelineStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp?: Date;
  txHash?: string;
}

/**
 * Transaction Timeline Props
 */
export interface TransactionTimelineProps {
  stages: TimelineStage[];
  currentStage: number;
  estimatedTimeRemaining?: number; // seconds
  isComplete: boolean;
  hasFailed: boolean;
  reducedMotion?: boolean;
}

/**
 * Stage Icon Component
 */
function StageIcon({ 
  stage, 
  isActive,
  reducedMotion 
}: { 
  stage: TimelineStage;
  isActive: boolean;
  reducedMotion?: boolean;
}) {
  if (stage.status === 'completed') {
    return (
      <motion.div
        initial={reducedMotion ? {} : { scale: 0 }}
        animate={{ scale: 1 }}
        className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
      >
        <Check className="w-5 h-5 text-white" />
      </motion.div>
    );
  }

  if (stage.status === 'active') {
    return (
      <motion.div
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
      >
        <Loader2 className="w-5 h-5 text-white" />
      </motion.div>
    );
  }

  if (stage.status === 'failed') {
    return (
      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-white" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <Clock className="w-5 h-5 text-gray-500" />
    </div>
  );
}

/**
 * Progress Bar Component
 */
function ProgressBar({ 
  progress, 
  reducedMotion 
}: { 
  progress: number;
  reducedMotion?: boolean;
}) {
  return (
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
        initial={reducedMotion ? { width: `${progress}%` } : { width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: reducedMotion ? 0 : 0.5 }}
      />
    </div>
  );
}

/**
 * Confirmation Count Component
 */
function ConfirmationCount({ 
  current, 
  required 
}: { 
  current: number;
  required: number;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
      <span className="font-medium">{current}/{required}</span>
      <span>confirmations</span>
    </div>
  );
}

/**
 * Transaction Timeline Component
 */
export function TransactionTimeline({
  stages,
  currentStage,
  estimatedTimeRemaining,
  isComplete,
  hasFailed,
  reducedMotion = false,
}: TransactionTimelineProps) {
  const [displayedTime, setDisplayedTime] = useState(estimatedTimeRemaining);

  // Countdown timer
  useEffect(() => {
    if (displayedTime && displayedTime > 0 && !isComplete) {
      const timer = setInterval(() => {
        setDisplayedTime((prev) => (prev && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [displayedTime, isComplete]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Calculate progress
  const progress = isComplete 
    ? 100 
    : (currentStage / stages.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {isComplete ? 'Transaction Complete' : 'Processing Transaction'}
        </h3>
        {displayedTime && displayedTime > 0 && !isComplete && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ~{formatTime(displayedTime)} remaining
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar progress={progress} reducedMotion={reducedMotion} />
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={reducedMotion ? {} : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reducedMotion ? 0 : index * 0.1 }}
            className={cn(
              'flex items-start gap-4 p-4 rounded-lg transition-colors',
              stage.status === 'active' && 'bg-blue-50 dark:bg-blue-900/20',
              stage.status === 'completed' && 'bg-green-50 dark:bg-green-900/20',
              stage.status === 'failed' && 'bg-red-50 dark:bg-red-900/20'
            )}
          >
            {/* Stage Icon */}
            <StageIcon 
              stage={stage} 
              isActive={stage.status === 'active'}
              reducedMotion={reducedMotion}
            />

            {/* Stage Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{stage.name}</h4>
                {stage.timestamp && (
                  <span className="text-xs text-gray-500">
                    {stage.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stage.description}
              </p>
              {stage.txHash && (
                <a
                  href={`https://etherscan.io/tx/${stage.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                >
                  View on Etherscan →
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Completion Animation */}
      <AnimatePresence>
        {isComplete && !reducedMotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            </motion.div>
            <p className="font-medium text-green-700 dark:text-green-400">
              Transaction confirmed!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      {hasFailed && (
        <div className="mt-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="font-medium text-red-700 dark:text-red-400">
            Transaction failed
          </p>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1">
            Please try again or contact support
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Cross-Chain Transaction Timeline
 */
export function CrossChainTimeline({
  sourceStages,
  bridgeStages,
  destStages,
  currentPhase, // 'source' | 'bridge' | 'dest' | 'complete'
  estimatedTimeRemaining,
  reducedMotion = false,
}: {
  sourceStages: TimelineStage[];
  bridgeStages: TimelineStage[];
  destStages: TimelineStage[];
  currentPhase: 'source' | 'bridge' | 'dest' | 'complete';
  estimatedTimeRemaining?: number;
  reducedMotion?: boolean;
}) {
  const allStages = [
    ...sourceStages.map((s) => ({ ...s, phase: 'source' })),
    ...bridgeStages.map((s) => ({ ...s, phase: 'bridge' })),
    ...destStages.map((s) => ({ ...s, phase: 'dest' })),
  ];

  const phaseLabels = {
    source: 'Source Chain',
    bridge: 'Cross-Chain Bridge',
    dest: 'Destination Chain',
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Phase Indicators */}
      <div className="flex items-center justify-between mb-6">
        {(['source', 'bridge', 'dest'] as const).map((phase, idx) => {
          const isActive = currentPhase === phase;
          const isComplete = 
            (phase === 'source' && ['bridge', 'dest', 'complete'].includes(currentPhase)) ||
            (phase === 'bridge' && ['dest', 'complete'].includes(currentPhase)) ||
            (phase === 'dest' && currentPhase === 'complete');

          return (
            <div key={phase} className="flex items-center">
              <div
                className={cn(
                  'flex flex-col items-center',
                  isActive && 'text-blue-500',
                  isComplete && 'text-green-500'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
                    isActive && 'bg-blue-100 dark:bg-blue-900/30',
                    isComplete && 'bg-green-100 dark:bg-green-900/30',
                    !isActive && !isComplete && 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  {isComplete ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <span className="text-xs mt-1">{phaseLabels[phase]}</span>
              </div>
              {idx < 2 && (
                <ArrowRight
                  className={cn(
                    'w-8 h-4 mx-2',
                    isComplete ? 'text-green-500' : 'text-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Stages List */}
      <TransactionTimeline
        stages={allStages}
        currentStage={allStages.filter((s) => s.status === 'completed').length}
        estimatedTimeRemaining={estimatedTimeRemaining}
        isComplete={currentPhase === 'complete'}
        hasFailed={allStages.some((s) => s.status === 'failed')}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

export default TransactionTimeline;