/**
 * Session Key Validation API Route
 * POST: Validate session key permissions for a transaction
 * Requirements: FR-6.2, FR-6.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionKeyService } from '@/services/session-key.service';

/**
 * POST /api/session-keys/validate
 * Validate if a session key can sign a specific transaction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { publicKey, transaction } = body as {
      publicKey: string;
      transaction: {
        to: string;
        value: string;
        data: string;
        chainId: number;
      };
    };

    if (!publicKey || !transaction) {
      return NextResponse.json(
        { success: false, error: 'publicKey and transaction are required' },
        { status: 400 }
      );
    }

    // Get the session key
    const keys = await sessionKeyService.getActiveSessionKeys();
    const key = keys.find((k) => k.publicKey.toLowerCase() === publicKey.toLowerCase());

    if (!key) {
      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          reason: 'Session key not found or expired',
        },
      });
    }

    // Validate permissions
    const validation = sessionKeyService.validatePermissions(key as any, transaction);

    return NextResponse.json({
      success: true,
      data: {
        valid: validation.valid,
        reason: validation.reason,
        remainingTime: sessionKeyService.getRemainingTime(key as any),
      },
    });
  } catch (error) {
    console.error('Error validating session key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate session key' },
      { status: 500 }
    );
  }
}