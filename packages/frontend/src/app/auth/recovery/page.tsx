'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Users, Clock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { walletRecoveryService, RecoveryMethod, RecoveryRequest } from '@/services/wallet-recovery.service';

type RecoveryStep = 'select' | 'configure' | 'guardian' | 'timelock' | 'complete';

interface Guardian {
  address: string;
  name?: string;
  confirmed: boolean;
}

export default function WalletRecoveryPage() {
  const [step, setStep] = useState<RecoveryStep>('select');
  const [method, setMethod] = useState<RecoveryMethod | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [newGuardian, setNewGuardian] = useState('');
  const [timelockDuration, setTimelockDuration] = useState(48);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [recoveryRequest, setRecoveryRequest] = useState<RecoveryRequest | null>(null);

  const handleMethodSelect = (selectedMethod: RecoveryMethod) => {
    setMethod(selectedMethod);
    setStep('configure');
    setError('');
  };

  const handleAddGuardian = () => {
    if (!newGuardian) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(newGuardian)) {
      setError('Invalid Ethereum address');
      return;
    }
    if (guardians.some(g => g.address.toLowerCase() === newGuardian.toLowerCase())) {
      setError('Guardian already added');
      return;
    }
    setGuardians([...guardians, { address: newWalletAddress, confirmed: false }]);
    setNewGuardian('');
    setError('');
  };

  const handleRemoveGuardian = (address: string) => {
    setGuardians(guardians.filter(g => g.address.toLowerCase() !== address.toLowerCase()));
  };

  const handleStartRecovery = async () => {
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Please enter a valid wallet address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const request: RecoveryRequest = {
        walletAddress,
        method: method!,
        guardians: method === 'social' ? guardians.map(g => g.address) : undefined,
        timelockDuration: method === 'timelock' ? timelockDuration : undefined,
      };

      const result = await walletRecoveryService.initiateRecovery(request);
      setRecoveryRequest(result);
      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recovery initiation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setStep('select');
    setMethod(null);
    setWalletAddress('');
    setGuardians([]);
    setTimelockDuration(48);
    setRecoveryRequest(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h1 className="text-3xl font-bold text-white mb-2">Wallet Recovery</h1>
          <p className="text-gray-400">
            Recover access to your wallet using one of the methods below
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Step 1: Select Method */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Select Recovery Method</h2>
            
            <div className="space-y-4">
              {/* Social Recovery */}
              <button
                onClick={() => handleMethodSelect('social')}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                      Social Recovery
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Recover your wallet with help from trusted guardians (friends, family, or devices)
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
              </button>

              {/* MPC Recovery */}
              <button
                onClick={() => handleMethodSelect('mpc')}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Key className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-blue-300 transition-colors">
                      MPC Recovery
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Use Multi-Party Computation to reconstruct your key shards from distributed providers
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-blue-400 transition-colors" />
                </div>
              </button>

              {/* Timelock Recovery */}
              <button
                onClick={() => handleMethodSelect('timelock')}
                className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium group-hover:text-green-300 transition-colors">
                      Timelock Recovery
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      Self-recovery after a waiting period. Works if you still have access to your device
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                </div              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Configure Recovery */}
        {(step === 'configure' || step === 'guardian' || step === 'timelock') && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {method === 'social' && 'Configure Social Recovery'}
                {method === 'mpc' && 'MPC Recovery'}
                {method === 'timelock' && 'Timelock Recovery'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>

            {/* Wallet Address Input */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Wallet Address</label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Social Recovery: Guardian Configuration */}
            {method === 'social' && (
              <>
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2">
                    Trusted Guardians ({guardians.length}/3 minimum required)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGuardian}
                      onChange={(e) => setNewGuardian(e.target.value)}
                      placeholder="0x... (guardian address)"
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={handleAddGuardian}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Guardian List */}
                {guardians.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {guardians.map((guardian, index) => (
                      <div
                        key={guardian.address}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-purple-400 text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-mono">
                              {guardian.address.slice(0, 6)}...{guardian.address.slice(-4)}
                            </p>
                            {guardian.name && (
                              <p className="text-gray-400 text-xs">{guardian.name}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveGuardian(guardian.address)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                  <p className="text-blue-200 text-sm">
                    <strong>Tip:</strong> Add at least 3 guardians you trust. They can be friends,
                    family members, or your other devices. At least 2 must confirm to recover your wallet.
                  </p>
                </div>
              </>
            )}

            {/* Timelock: Duration Configuration */}
            {method === 'timelock' && (
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Timelock Duration: {timelockDuration} hours
                </label>
                <input
                  type="range"
                  min="12"
                  max="168"
                  value={timelockDuration}
                  onChange={(e) => setTimelockDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>12h (fast)</span>
                  <span>168h (7 days)</span>
                </div>
              </div>
            )}

            {/* MPC Info */}
            {method === 'mpc' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mb-6">
                <p className="text-blue-200 text-sm">
                  MPC Recovery will connect to your configured key shards providers.
                  You'll need access to at least 2 of your devices to reconstruct the key.
                </p>
              </div>
            )}

            {/* Start Recovery Button */}
            <button
              onClick={handleStartRecovery}
              disabled={isLoading || !walletAddress}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Start Recovery
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Step 3: Complete */}
        {step === 'complete' && recoveryRequest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Recovery Initiated!</h2>
            <p className="text-gray-400 mb-6">
              Your wallet recovery request has been submitted
            </p>

            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Request ID</span>
                  <span className="text-white font-mono text-sm">
                    {recoveryRequest.requestId.slice(0, 10)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Method</span>
                  <span className="text-white capitalize">{recoveryRequest.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-yellow-400 capitalize">{recoveryRequest.status}</span>
                </div>
                {recoveryRequest.timelockEndTime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Available After</span>
                    <span className="text-white">
                      {new Date(recoveryRequest.timelockEndTime).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg mb-6">
              <p className="text-yellow-200 text-sm">
                <strong>Important:</strong> Keep this request ID safe. You'll need it to complete
                the recovery process.
              </p>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </motion.div>
        )}

        {/* Progress Steps */}
        {step !== 'complete' && (
          <div className="flex justify-center gap-2 mt-6">
            <div className={`w-3 h-3 rounded-full ${step === 'select' ? 'bg-purple-500' : 'bg-white/30'}`} />
            <div className={`w-3 h-3 rounded-full ${step !== 'select' ? 'bg-purple-500' : 'bg-white/30'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'complete' ? 'bg-purple-500' : 'bg-white/30'}`} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
