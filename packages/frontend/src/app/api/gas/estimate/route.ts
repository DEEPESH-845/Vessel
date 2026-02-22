/**
 * Gas Estimate API Route
 * GET: Get current gas prices for a chain
 * Requirements: FR-15.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { gasEstimator } from '@/services/gas-estimator.service';

/**
 * GET /api/gas/estimate?chainId=1
 * Get gas estimates for a chain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const gasLimit = searchParams.get('gasLimit');

    const prediction = await gasEstimator.getGasPrice(chainId);

    // Build response similar to what was expected
    const response = {
      success: true,
      data: {
        chainId,
        chainName: getChainName(chainId),
        nativeToken: getNativeToken(chainId),
        nativeTokenPrice: '0', // Would need price feed
        baseFee: prediction.current.baseFee.toString(),
        networkCongestion: prediction.trend === 'rising' ? 'high' : prediction.trend === 'falling' ? 'low' : 'medium',
        recommended: 'standard',
        estimates: [
          {
            level: 'slow',
            maxFeePerGas: (prediction.current.slow * 1e9).toString(),
            maxPriorityFeePerGas: (prediction.current.priorityFee * 0.5 * 1e9).toString(),
            gasPrice: (prediction.current.slow * 1e9).toString(),
            estimatedConfirmationTime: '5',
            confidence: prediction.confidence,
          },
          {
            level: 'standard',
            maxFeePerGas: (prediction.current.standard * 1e9).toString(),
            maxPriorityFeePerGas: (prediction.current.priorityFee * 1e9).toString(),
            gasPrice: (prediction.current.standard * 1e9).toString(),
            estimatedConfirmationTime: '1',
            confidence: prediction.confidence,
          },
          {
            level: 'fast',
            maxFeePerGas: (prediction.current.fast * 1e9).toString(),
            maxPriorityFeePerGas: (prediction.current.priorityFee * 1.5 * 1e9).toString(),
            gasPrice: (prediction.current.fast * 1e9).toString(),
            estimatedConfirmationTime: '0.1',
            confidence: prediction.confidence,
          },
        ],
        lastUpdated: prediction.lastUpdated,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching gas estimates:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch gas estimates';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
    1135: 'Lisk',
  };
  return chains[chainId] || 'Ethereum';
}

function getNativeToken(chainId: number): string {
  const tokens: Record<number, string> = {
    1: 'ETH',
    137: 'MATIC',
    42161: 'ETH',
    8453: 'ETH',
    1135: 'LSK',
  };
  return tokens[chainId] || 'ETH';
}
