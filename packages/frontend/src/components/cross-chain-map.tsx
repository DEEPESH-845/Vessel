/**
 * Cross-Chain Transfer Map Component
 * Visualizes asset flows across chains with GSAP animations
 * Requirements: FR-11.1, FR-11.2
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ArrowRight, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Chain Position
 */
interface ChainPosition {
  id: number;
  name: string;
  x: number;
  y: number;
  color: string;
}

/**
 * Transfer Flow
 */
interface TransferFlow {
  id: string;
  fromChain: number;
  toChain: number;
  amount: string;
  token: string;
  status: 'pending' | 'processing' | 'completed';
}

/**
 * Cross-Chain Map Props
 */
interface CrossChainMapProps {
  activeChains: number[];
  activeFlow?: TransferFlow;
  pastFlows?: TransferFlow[];
  onChainClick?: (chainId: number) => void;
}

/**
 * Chain configurations
 */
const CHAIN_CONFIG: Record<number, { name: string; color: string; icon: string }> = {
  1: { name: 'Ethereum', color: '#627EEA', icon: '⟠' },
  137: { name: 'Polygon', color: '#8247E5', icon: '⬡' },
  42161: { name: 'Arbitrum', color: '#28A0F0', icon: '◈' },
  8453: { name: 'Base', color: '#0052FF', icon: '●' },
};

/**
 * Cross-Chain Transfer Map
 */
export function CrossChainMap({
  activeChains,
  activeFlow,
  pastFlows = [],
  onChainClick,
}: CrossChainMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Calculate chain positions in a circle
  const getChainPositions = (): ChainPosition[] => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const radius = Math.min(dimensions.width, dimensions.height) * 0.35;

    return activeChains.map((chainId, index) => {
      const angle = (index / activeChains.length) * 2 * Math.PI - Math.PI / 2;
      const config = CHAIN_CONFIG[chainId] || { name: `Chain ${chainId}`, color: '#888', icon: '?' };

      return {
        id: chainId,
        name: config.name,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color: config.color,
      };
    });
  };

  const chainPositions = getChainPositions();

  // Animate flow particles
  useEffect(() => {
    if (!svgRef.current || !activeFlow) return;

    const fromPos = chainPositions.find((c) => c.id === activeFlow.fromChain);
    const toPos = chainPositions.find((c) => c.id === activeFlow.toChain);

    if (!fromPos || !toPos) return;

    // Create particle animation
    const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    particle.setAttribute('r', '6');
    particle.setAttribute('fill', fromPos.color);
    particle.setAttribute('cx', String(fromPos.x));
    particle.setAttribute('cy', String(fromPos.y));
    svgRef.current.appendChild(particle);

    // GSAP animation
    gsap.to(particle, {
      duration: 2,
      repeat: -1,
      ease: 'power2.inOut',
      motionPath: {
        path: `M ${fromPos.x} ${fromPos.y} Q ${(fromPos.x + toPos.x) / 2} ${Math.min(fromPos.y, toPos.y) - 50} ${toPos.x} ${toPos.y}`,
        align: 'self',
        alignOrigin: [0.5, 0.5],
      },
    });

    return () => {
      gsap.killTweensOf(particle);
      particle.remove();
    };
  }, [activeFlow, chainPositions]);

  // Get path between two chains
  const getFlowPath = (from: ChainPosition, to: ChainPosition): string => {
    const midX = (from.x + to.x) / 2;
    const midY = Math.min(from.y, to.y) - 30;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  };

  return (
    <div className="relative w-full aspect-video max-w-3xl mx-auto">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-full"
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.05"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Flow lines for past transfers */}
        {pastFlows.map((flow) => {
          const from = chainPositions.find((c) => c.id === flow.fromChain);
          const to = chainPositions.find((c) => c.id === flow.toChain);
          if (!from || !to) return null;

          return (
            <motion.path
              key={flow.id}
              d={getFlowPath(from, to)}
              fill="none"
              stroke={from.color}
              strokeOpacity="0.3"
              strokeWidth="2"
              strokeDasharray="5,5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1 }}
            />
          );
        })}

        {/* Active flow line */}
        {activeFlow && (
          <>
            {(() => {
              const from = chainPositions.find((c) => c.id === activeFlow.fromChain);
              const to = chainPositions.find((c) => c.id === activeFlow.toChain);
              if (!from || !to) return null;

              return (
                <motion.path
                  d={getFlowPath(from, to)}
                  fill="none"
                  stroke={from.color}
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              );
            })()}
          </>
        )}

        {/* Chain nodes */}
        {chainPositions.map((chain) => (
          <g
            key={chain.id}
            onClick={() => onChainClick?.(chain.id)}
            className="cursor-pointer"
          >
            {/* Outer glow */}
            <circle
              cx={chain.x}
              cy={chain.y}
              r="45"
              fill={chain.color}
              fillOpacity="0.1"
            />
            
            {/* Main circle */}
            <motion.circle
              cx={chain.x}
              cy={chain.y}
              r="30"
              fill={chain.color}
              fillOpacity="0.2"
              stroke={chain.color}
              strokeWidth="2"
              whileHover={{ scale: 1.1 }}
            />

            {/* Inner circle */}
            <circle
              cx={chain.x}
              cy={chain.y}
              r="20"
              fill={chain.color}
            />

            {/* Chain icon */}
            <text
              x={chain.x}
              y={chain.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize="14"
              fontWeight="bold"
            >
              {CHAIN_CONFIG[chain.id]?.icon || '●'}
            </text>

            {/* Chain name */}
            <text
              x={chain.x}
              y={chain.y + 50}
              textAnchor="middle"
              fill="currentColor"
              className="text-sm font-medium"
            >
              {chain.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Active flow info */}
      {activeFlow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: CHAIN_CONFIG[activeFlow.fromChain]?.color }}
            />
            <span className="font-medium">
              {activeFlow.amount} {activeFlow.token}
            </span>
            <ArrowRight className="w-4 h-4" />
            <span className="text-gray-500">
              {CHAIN_CONFIG[activeFlow.toChain]?.name}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Mini Cross-Chain indicator for inline use
 */
export function CrossChainIndicator({
  fromChain,
  toChain,
  status,
}: {
  fromChain: number;
  toChain: number;
  status: 'pending' | 'processing' | 'completed';
}) {
  const fromConfig = CHAIN_CONFIG[fromChain];
  const toConfig = CHAIN_CONFIG[toChain];

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
        style={{ backgroundColor: fromConfig?.color }}
      >
        {fromConfig?.icon?.[0] || '●'}
      </div>
      <ArrowRight className={cn(
        'w-4 h-4',
        status === 'processing' && 'animate-pulse text-blue-500',
        status === 'completed' && 'text-green-500'
      )} />
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
        style={{ backgroundColor: toConfig?.color }}
      >
        {toConfig?.icon?.[0] || '●'}
      </div>
    </div>
  );
}

export default CrossChainMap;