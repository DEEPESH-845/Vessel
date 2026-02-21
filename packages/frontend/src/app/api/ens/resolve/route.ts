/**
 * ENS Resolve API Route
 * POST: Resolve ENS name to address or address to ENS name
 * Requirements: FR-7.1, FR-7.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { ensResolverService } from '@/services/ens-resolver.service';

/**
 * POST /api/ens/resolve
 * Resolve ENS name or address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { input, chainId = 1, direction = 'auto' } = body as {
      input: string;
      chainId?: number;
      direction?: 'forward' | 'reverse' | 'auto';
    };

    if (!input) {
      return NextResponse.json(
        { success: false, error: 'input is required' },
        { status: 400 }
      );
    }

    const isAddress = input.startsWith('0x') && input.length === 42;

    // Auto-detect direction
    let result: { address?: string | null; name?: string | null } = {};

    if (direction === 'forward' || (direction === 'auto' && !isAddress)) {
      // Forward resolution: name -> address
      const address = await ensResolverService.resolveName(input, chainId);
      result = { address };
    } else if (direction === 'reverse' || (direction === 'auto' && isAddress)) {
      // Reverse resolution: address -> name
      const name = await ensResolverService.lookupAddress(input, chainId);
      result = { name };
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('ENS resolution error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve ENS' },
      { status: 500 }
    );
  }
}