/**
 * Session Key by ID API Routes
 * GET: Get session key details
 * DELETE: Revoke a session key
 * Requirements: FR-6.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionKeyService } from '@/services/session-key.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/session-keys/[id]
 * Get session key details by public key
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const publicKey = decodeURIComponent(id);

    // Get all keys and find the matching one
    const keys = await sessionKeyService.getActiveSessionKeys();
    const key = keys.find((k) => k.publicKey.toLowerCase() === publicKey.toLowerCase());

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Session key not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        publicKey: key.publicKey,
        permissions: key.permissions,
        expiresAt: key.expiresAt,
        createdAt: key.createdAt,
        remainingTime: sessionKeyService.getRemainingTime(key as any),
        isExpired: sessionKeyService.isExpired(key as any),
      },
    });
  } catch (error) {
    console.error('Error fetching session key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session key' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/session-keys/[id]
 * Revoke a session key
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const publicKey = decodeURIComponent(id);

    // Revoke the session key
    await sessionKeyService.revokeSessionKey(publicKey);

    return NextResponse.json({
      success: true,
      message: 'Session key revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking session key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revoke session key' },
      { status: 500 }
    );
  }
}