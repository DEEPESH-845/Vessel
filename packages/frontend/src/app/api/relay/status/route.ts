/**
 * Relay Status API Route
 * GET: Get status of a submitted meta-transaction
 * Requirements: FR-4.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { metaTransactionService } from '@/services/meta-transaction.service';

/**
 * GET /api/relay/status?txId=xxx
 * Get the status of a submitted transaction
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txId = searchParams.get('txId');
    const relayerEndpoint = searchParams.get('relayerEndpoint');

    if (!txId) {
      return NextResponse.json(
        { success: false, error: 'txId is required' },
        { status: 400 }
      );
    }

    // If relayer endpoint is provided, query directly
    if (relayerEndpoint) {
      const status = await metaTransactionService.getStatus(relayerEndpoint, txId);
      return NextResponse.json({
        success: true,
        data: status,
      });
    }

    // Otherwise return cached status from service
    // In production, this would check a database or cache
    return NextResponse.json({
      success: true,
      data: {
        txId,
        status: 'pending',
        message: 'Status tracking requires relayer endpoint',
      },
    });
  } catch (error) {
    console.error('Error getting transaction status:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to get status';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}