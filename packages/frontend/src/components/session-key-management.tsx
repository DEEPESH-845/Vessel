/**
 * Session Key Management Component
 * Displays and manages active session keys
 * Requirements: FR-6.3
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Clock, 
  DollarSign, 
  Trash2, 
  Plus, 
  Shield, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/store';
import { SessionKey, SessionPermissions } from '@/types/wallet.types';

interface SessionKeyDisplay {
  publicKey: string;
  permissions: SessionPermissions;
  expiresAt: number;
  createdAt: number;
  remainingTime: number;
}

/**
 * Format remaining time as human-readable string
 */
function formatRemainingTime(ms: number): string {
  if (ms <= 0) return 'Expired';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h remaining`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m remaining`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s remaining`;
  }
  return `${seconds}s remaining`;
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Session Key Card Component
 */
function SessionKeyCard({ 
  sessionKey, 
  onRevoke,
  isRevoking 
}: { 
  sessionKey: SessionKeyDisplay;
  onRevoke: (publicKey: string) => void;
  isRevoking: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpiringSoon = sessionKey.remainingTime < 3600000; // 1 hour

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isExpiringSoon ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
              <Key className={`w-5 h-5 ${isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <div>
              <p className="font-mono text-sm font-medium">
                {formatAddress(sessionKey.publicKey)}
              </p>
              <p className={`text-xs ${isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {formatRemainingTime(sessionKey.remainingTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpiringSoon && (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              {/* Spending Limit */}
              {sessionKey.permissions.spendingLimit && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Spending Limit: 
                  </span>
                  <span className="text-sm font-medium">
                    {sessionKey.permissions.spendingLimit} wei
                  </span>
                </div>
              )}

              {/* Allowed Chains */}
              {sessionKey.permissions.chainIds && sessionKey.permissions.chainIds.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Allowed Chains:</p>
                  <div className="flex flex-wrap gap-2">
                    {sessionKey.permissions.chainIds.map((chainId) => (
                      <Badge key={chainId} variant="secondary">
                        Chain {chainId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allowed Contracts */}
              {sessionKey.permissions.allowedContracts && sessionKey.permissions.allowedContracts.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Allowed Contracts ({sessionKey.permissions.allowedContracts.length}):
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {sessionKey.permissions.allowedContracts.map((contract, idx) => (
                      <p key={idx} className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {formatAddress(contract)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                Created: {new Date(sessionKey.createdAt).toLocaleString()}
              </div>

              {/* Revoke Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRevoke(sessionKey.publicKey);
                }}
                disabled={isRevoking}
                className="w-full"
              >
                {isRevoking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Shield className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke Key
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Create Session Key Dialog
 */
function CreateSessionKeyDialog({ 
  isOpen, 
  onClose, 
  onCreate 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onCreate: (permissions: SessionPermissions, durationMs: number) => void;
}) {
  const [spendingLimit, setSpendingLimit] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [selectedChains, setSelectedChains] = useState<number[]>([1, 137, 42161, 8453]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const permissions: SessionPermissions = {
        spendingLimit: spendingLimit || undefined,
        chainIds: selectedChains.length > 0 ? selectedChains : undefined,
      };
      const durationMs = parseInt(durationDays) * 24 * 60 * 60 * 1000;
      await onCreate(permissions, durationMs);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4">Create Session Key</h3>
        
        <div className="space-y-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">Duration (days)</label>
            <Input
              type="number"
              min="1"
              max="30"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="7"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 30 days</p>
          </div>

          {/* Spending Limit */}
          <div>
            <label className="block text-sm font-medium mb-2">Spending Limit (wei)</label>
            <Input
              type="text"
              value={spendingLimit}
              onChange={(e) => setSpendingLimit(e.target.value)}
              placeholder="Optional - leave empty for unlimited"
            />
          </div>

          {/* Chains */}
          <div>
            <label className="block text-sm font-medium mb-2">Allowed Chains</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 1, name: 'Ethereum' },
                { id: 137, name: 'Polygon' },
                { id: 42161, name: 'Arbitrum' },
                { id: 8453, name: 'Base' },
              ].map((chain) => (
                <Badge
                  key={chain.id}
                  variant={selectedChains.includes(chain.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedChains((prev) =>
                      prev.includes(chain.id)
                        ? prev.filter((id) => id !== chain.id)
                        : [...prev, chain.id]
                    );
                  }}
                >
                  {chain.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating} className="flex-1">
            {isCreating ? 'Creating...' : 'Create Key'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Session Key Management Component
 */
export function SessionKeyManagement() {
  const { sessionKeys, addSessionKey, removeSessionKey } = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revokingKey, setRevokingKey] = useState<string | null>(null);
  const [displayKeys, setDisplayKeys] = useState<SessionKeyDisplay[]>([]);

  // Fetch session keys from API
  const fetchSessionKeys = useCallback(async () => {
    try {
      const response = await fetch('/api/session-keys');
      const data = await response.json();
      if (data.success) {
        setDisplayKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch session keys:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessionKeys();
  }, [fetchSessionKeys]);

  // Update remaining time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayKeys((keys) =>
        keys.map((key) => ({
          ...key,
          remainingTime: Math.max(0, key.expiresAt - Date.now()),
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Create a new session key
  const handleCreate = async (permissions: SessionPermissions, durationMs: number) => {
    try {
      const response = await fetch('/api/session-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions, durationMs }),
      });
      const data = await response.json();
      if (data.success) {
        addSessionKey({
          publicKey: data.data.publicKey,
          privateKey: '', // Private key is stored securely, not in state
          permissions: data.data.permissions,
          expiresAt: data.data.expiresAt,
          createdAt: data.data.createdAt,
        });
        fetchSessionKeys();
      }
    } catch (error) {
      console.error('Failed to create session key:', error);
    }
  };

  // Revoke a session key
  const handleRevoke = async (publicKey: string) => {
    setRevokingKey(publicKey);
    try {
      const response = await fetch(`/api/session-keys/${encodeURIComponent(publicKey)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        removeSessionKey(publicKey);
        setDisplayKeys((keys) => keys.filter((k) => k.publicKey !== publicKey));
      }
    } catch (error) {
      console.error('Failed to revoke session key:', error);
    } finally {
      setRevokingKey(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          Session Keys
        </CardTitle>
        <Button size="sm" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Key
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : displayKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active session keys</p>
            <p className="text-sm mt-1">Create a session key for gasless transactions</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {displayKeys.map((key) => (
                <SessionKeyCard
                  key={key.publicKey}
                  sessionKey={key}
                  onRevoke={handleRevoke}
                  isRevoking={revokingKey === key.publicKey}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {isCreateOpen && (
            <CreateSessionKeyDialog
              isOpen={isCreateOpen}
              onClose={() => setIsCreateOpen(false)}
              onCreate={handleCreate}
            />
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export default SessionKeyManagement;