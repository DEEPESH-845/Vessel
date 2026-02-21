/**
 * Payment Links API Routes
 * GET: List all payment links
 * POST: Create a new payment link
 * Requirements: FR-12.1, FR-12.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentLinkService } from '@/services/payment-link.service';

/**
 * GET /api/payment-links
 * List all payment links
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'active' | 'inactive' | 'completed' | 'expired' | null;

    let links;
    if (status) {
      links = await paymentLinkService.getPaymentLinksByStatus(status);
    } else {
      links = await paymentLinkService.getAllPaymentLinks();
    }

    // Add total received to each link
    const linksWithTotals = links.map((link) => ({
      ...link,
      totalReceived: paymentLinkService.getTotalReceived(link.id),
    }));

    return NextResponse.json({
      success: true,
      data: linksWithTotals,
    });
  } catch (error) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payment-links
 * Create a new payment link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,
      token,
      acceptedTokens,
      recipientAddress,
      description,
      expiresAt,
      maxUses,
      branding,
    } = body;

    if (!amount || !token || !acceptedTokens || !recipientAddress) {
      return NextResponse.json(
        { success: false, error: 'amount, token, acceptedTokens, and recipientAddress are required' },
        { status: 400 }
      );
    }

    const link = await paymentLinkService.createPaymentLink({
      amount,
      token,
      acceptedTokens,
      recipientAddress,
      description,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      maxUses,
      branding,
    });

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const shareableUrl = paymentLinkService.generateShareableUrl(link.id, baseUrl);

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        shareableUrl,
      },
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to create payment link';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}