/**
 * ENS Profile API Route
 * GET: Get full ENS profile for an address or name
 * Requirements: FR-7.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { ensResolverService } from '@/services/ens-resolver.service';

/**
 * GET /api/ens/profile?input=address_or_name
 * Get full ENS profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    const chainId = parseInt(searchParams.get('chainId') || '1');

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'input parameter is required' },
        { status: 400 }
      );
    }

    const profile = await ensResolverService.resolveProfile(input, chainId);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('ENS profile resolution error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve ENS profile' },
      { status: 500 }
    );
  }
}