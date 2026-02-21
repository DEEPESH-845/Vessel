/**
 * Session Keys API Routes
 * GET: List all session keys
 * POST: Create a new session key
 * Requirements: FR-6.1, FR-6.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionKeyService } from '@/services/session-key.service';
import { SessionPermissions } from '@/types/wallet.types';

/**
 * GET /api/session-keys
 * List all active session keys
 */
export async function GET() {
  try {
    const keys = await sessionKeyService.getActiveSessionKeys();
    
    // Remove sensitive data before sending
    const safeKeys = keys.map((key) => ({
      publicKey: key.publicKey,
      permissions: key.permissions,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      remainingTime: key.expiresAt - Date.now(),
    }));

    return NextResponse.json({
      success: true,
      data: safeKeys,
    });
  } catch (error) {
    console.error('Error fetching session keys:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session keys' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/session-keys
 * Create a new session key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { permissions, durationMs } = body as {
      permissions: SessionPermissions;
      durationMs: number;
    };

    if (!durationMs || durationMs <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid durationMs is required' },
        { status: 400 }
      );
    }

    // Validate duration limits (max 30 days)
    const MAX_DURATION = 30 * 24 * 60 * 60 * 1000;
    if (durationMs > MAX_DURATION) {
      return NextResponse.json(
        { success: false, error: 'Duration cannot exceed 30 days' },
        { status: 400 }
      );
    }

    // Create session key
    const sessionKey = await sessionKeyService.createSessionKey(
      permissions || {},
      durationMs
    );

    // Return public info only (never expose private key in API response)
    return NextResponse.json({
      success: true,
      data: {
        publicKey: sessionKey.publicKey,
        permissions: sessionKey.permissions,
        expiresAt: sessionKey.expiresAt,
        createdAt: sessionKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating session key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session key' },
      { status: 500 }
    );
  }
}