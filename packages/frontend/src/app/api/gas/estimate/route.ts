/**
 * Gas Estimate API Route
 * GET: Get current gas prices for a chain
 * Requirements: FR-15.1
 */

import { NextRequest, NextResponse } from 'next/server';
import { gasEstimatorService } from '@/services/gas-estimator.service';

/**
 * GET /api/gas/estimate?chainId=1
 * Get gas estimates for a chain
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = parseInt(searchParams.get('chainId') || '1');
    const gasLimit = searchParams.get('gasLimit');

    const estimates = await gasEstimatorService.getGasEstimates(chainId);

    // Calculate costs for each level if gasLimit provided
    let costEstimates;
    if (gasLimit) {
      const limit = BigInt(gasLimit);
      costEstimates = estimates.estimates.map((estimate) => ({
        level: estimate.level,
        ...gasEstimatorService.calculateCost(estimate, limit, estimates.nativeTokenPrice),
        estimatedConfirmationTime: estimate.estimatedConfirmationTime,
        confidence: estimate.confidence,
      }));
    }

    return NextResponse.json({
      success: true,
      data: {
        chainId: estimates.chainId,
        chainName: estimates.chainName,
        nativeToken: estimates.nativeToken,
        nativeTokenPrice: estimates.nativeTokenPrice,
        baseFee: estimates.baseFee.toString(),
        networkCongestion: estimates.networkCongestion,
        recommended: estimates.recommended,
        estimates: estimates.estimates.map((e) => ({
          level: e.level,
          maxFeePerGas: e.maxFeePerGas.toString(),
          maxPriorityFeePerGas: e.maxPriorityFeePerGas.toString(),
          gasPrice: e.gasPrice.toString(),
          estimatedConfirmationTime: e.estimatedConfirmationTime,
          confidence: e.confidence,
        })),
        costEstimates,
        lastUpdated: estimates.lastUpdated.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching gas estimates:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to fetch gas estimates';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}