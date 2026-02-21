/**
 * ENS Display Components
 * ENSAvatar and ENSNameDisplay with fallback to identicon
 * Requirements: FR-7.3
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Generate a simple identicon SVG from an address
 */
function generateIdenticon(address: string, size: number = 32): string {
  // Simple hash-based identicon generator
  const hash = address.slice(2).toLowerCase();
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
  ];
  
  // Use address hash to pick color
  const colorIndex = parseInt(hash.slice(0, 2), 16) % colors.length;
  const color = colors[colorIndex];
  
  // Generate a simple pattern based on address
  const patterns: number[] = [];
  for (let i = 0; i < 16; i++) {
    patterns.push(parseInt(hash.slice(i * 2, (i + 1) * 2) || '00', 16) % 4);
  }
  
  // Create SVG
  const cellSize = size / 5;
  let rects = '';
  
  // Create symmetric pattern (like GitHub identicons)
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      if (patterns[idx % 16] >= 2) {
        const x = col * cellSize;
        const y = row * cellSize;
        rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
        // Mirror to right side
        const mirrorX = (4 - col) * cellSize;
        rects += `<rect x="${mirrorX}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
      }
    }
  }
  
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#f0f0f0"/>${rects}</svg>`)}`;
}

/**
 * Format address for display
 */
function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * ENS Avatar Component
 * Displays ENS avatar or falls back to identicon
 */
export function ENSAvatar({ 
  address, 
  ensName,
  avatarUrl,
  size = 40,
  className,
  onClick
}: { 
  address: string;
  ensName?: string | null;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  const [showFallback, setShowFallback] = useState(!avatarUrl);
  const [isLoading, setIsLoading] = useState(!!avatarUrl);

  const identicon = useMemo(() => generateIdenticon(address, size), [address, size]);

  const handleImageError = () => {
    setShowFallback(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <motion.div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0',
        className
      )}
      style={{ width: size, height: size }}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
    >
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
      )}
      
      {avatarUrl && !showFallback ? (
        <img
          src={avatarUrl}
          alt={ensName || address}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      ) : (
        <img
          src={identicon}
          alt={ensName || address}
          className="w-full h-full"
        />
      )}
      
      {!avatarUrl && !ensName && (
        <div className="absolute inset-0 flex items-center justify-center">
          <User className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
    </motion.div>
  );
}

/**
 * ENS Name Display Component
 * Displays ENS name with address fallback
 */
export function ENSNameDisplay({ 
  address,
  ensName,
  showAddress = true,
  showCopy = false,
  className,
  onAddressClick
}: { 
  address: string;
  ensName?: string | null;
  showAddress?: boolean;
  showCopy?: boolean;
  className?: string;
  onAddressClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  const displayName = ensName || formatAddress(address);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span 
        className={cn(
          'font-medium',
          ensName ? 'text-gray-900 dark:text-white' : 'font-mono text-sm text-gray-500'
        )}
        onClick={onAddressClick}
      >
        {displayName}
      </span>
      
      {showAddress && ensName && (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          ({formatAddress(address)})
        </span>
      )}
      
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 text-gray-400" />
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Combined ENS Profile Display
 * Avatar + Name + optional address
 */
export function ENSProfileDisplay({ 
  address,
  ensName,
  avatarUrl,
  showAddress = true,
  showCopy = false,
  size = 40,
  className,
  onClick
}: { 
  address: string;
  ensName?: string | null;
  avatarUrl?: string | null;
  showAddress?: boolean;
  showCopy?: boolean;
  size?: number;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={cn('flex items-center gap-3', className)}
      onClick={onClick}
    >
      <ENSAvatar 
        address={address}
        ensName={ensName}
        avatarUrl={avatarUrl}
        size={size}
      />
      <ENSNameDisplay
        address={address}
        ensName={ensName}
        showAddress={showAddress}
        showCopy={showCopy}
      />
    </div>
  );
}

/**
 * Hook to fetch ENS profile
 */
export function useENSProfile(address: string | null, chainId: number = 1) {
  const [profile, setProfile] = useState<{
    name: string | null;
    avatar: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/ens/profile?input=${encodeURIComponent(address)}&chainId=${chainId}`);
        const data = await response.json();
        if (data.success) {
          setProfile({
            name: data.data.name,
            avatar: data.data.avatar,
          });
        }
      } catch (error) {
        console.error('Failed to fetch ENS profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [address, chainId]);

  return { profile, isLoading };
}

/**
 * Async ENS Profile Display
 * Automatically fetches ENS data for an address
 */
export function AsyncENSProfile({ 
  address,
  showAddress = true,
  showCopy = false,
  size = 40,
  className
}: { 
  address: string;
  showAddress?: boolean;
  showCopy?: boolean;
  size?: number;
  className?: string;
}) {
  const { profile, isLoading } = useENSProfile(address);

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div 
          className="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{ width: size, height: size }}
        />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <ENSProfileDisplay
      address={address}
      ensName={profile?.name}
      avatarUrl={profile?.avatar}
      showAddress={showAddress}
      showCopy={showCopy}
      size={size}
    />
  );
}

export default ENSProfileDisplay;