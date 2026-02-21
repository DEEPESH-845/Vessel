/**
 * Paymaster Estimate API Route
 * POST: Get gas estimation with stablecoin cost
 * Requirements: FR-5.1, FR-5.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymasterService } from '@/services/paymaster.service';

/**
 * POST /api/paymaster/estimate
 * Get gas estimate for a transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { transaction, chainId } = body as {
      transaction: {
        from: string;
        to: string;
        value: string;
        data: string;
      };
      chainId: number;
    };

    if (!transaction || !chainId) {
      return NextResponse.json(
        { success: false, error: 'transaction and chainId are required' },
        { status: 400 }
      );
    }

    const estimate = await paymasterService.estimateGas(transaction, chainId);

    return NextResponse.json({
      success: true,
      data: {
        gasLimit: estimate.gasLimit.toString(),
        gasPrice: estimate.gasPrice.toString(),
        maxFeePerGas: estimate.maxFeePerGas.toString(),
        maxPriorityFeePerGas: estimate.maxPriorityFeePerGas.toString(),
        nativeTokenCost: estimate.nativeTokenCost,
        stablecoinCost: estimate.stablecoinCost,
        exchangeRate: estimate.exchangeRate,
        paymasterFee: estimate.paymasterFee,
        totalCost: estimate.totalCost,
        paymasterAvailable: paymasterService.isPaymasterAvailable(chainId),
      },
    });
  } catch (error) {
    console.error('Error estimating gas:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to estimate gas';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}