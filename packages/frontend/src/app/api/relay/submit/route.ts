/**
 * Relay Submit API Route
 * POST: Submit a signed meta-transaction to the relayer
 * Requirements: FR-4.1, FR-4.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { metaTransactionService, SignedMetaTransaction } from '@/services/meta-transaction.service';

/**
 * POST /api/relay/submit
 * Submit a signed meta-transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { metaTransaction, verifyingContract } = body as {
      metaTransaction: SignedMetaTransaction;
      verifyingContract: string;
    };

    if (!metaTransaction || !verifyingContract) {
      return NextResponse.json(
        { success: false, error: 'metaTransaction and verifyingContract are required' },
        { status: 400 }
      );
    }

    // Verify the signature
    const isValid = metaTransactionService.verifySignature(metaTransaction, verifyingContract);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Check deadline
    if (metaTransaction.deadline < Math.floor(Date.now() / 1000)) {
      return NextResponse.json(
        { success: false, error: 'Transaction deadline expired' },
        { status: 400 }
      );
    }

    // Submit to relayer
    const result = await metaTransactionService.submitToRelayer(metaTransaction, verifyingContract);

    return NextResponse.json({
      success: true,
      data: {
        txId: result.txId,
        message: 'Transaction submitted to relayer',
      },
    });
  } catch (error) {
    console.error('Error submitting meta-transaction:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to submit transaction';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}