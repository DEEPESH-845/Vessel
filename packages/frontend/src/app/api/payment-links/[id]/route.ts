/**
 * Payment Link by ID API Routes
 * GET: Get payment link details
 * PUT: Update a payment link
 * DELETE: Delete/deactivate a payment link
 * Requirements: FR-12.4
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentLinkService } from '@/services/payment-link.service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/payment-links/[id]
 * Get payment link by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const link = await paymentLinkService.getPaymentLink(id);

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Payment link not found' },
        { status: 404 }
      );
    }

    // Get validation status
    const validation = paymentLinkService.validatePaymentLink(link);

    // Get payments for this link
    const payments = await paymentLinkService.getPaymentsForLink(id);

    return NextResponse.json({
      success: true,
      data: {
        ...link,
        isValid: validation.valid,
        validationReason: validation.reason,
        totalReceived: paymentLinkService.getTotalReceived(id),
        paymentCount: payments.length,
      },
    });
  } catch (error) {
    console.error('Error fetching payment link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payment link' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payment-links/[id]
 * Update a payment link
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates = body as Partial<{
      description: string;
      expiresAt: string;
      maxUses: number;
      status: 'active' | 'inactive' | 'completed' | 'expired';
    }>;

    const link = await paymentLinkService.updatePaymentLink(id, {
      ...updates,
      expiresAt: updates.expiresAt ? new Date(updates.expiresAt) : undefined,
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Payment link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: link,
    });
  } catch (error) {
    console.error('Error updating payment link:', error);
    
    const message = error instanceof Error ? error.message : 'Failed to update payment link';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payment-links/[id]
 * Delete or deactivate a payment link
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const deactivate = searchParams.get('deactivate') === 'true';

    if (deactivate) {
      const success = await paymentLinkService.deactivatePaymentLink(id);
      if (!success) {
        return NextResponse.json(
          { success: false, error: 'Payment link not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        message: 'Payment link deactivated',
      });
    }

    const deleted = await paymentLinkService.deletePaymentLink(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Payment link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment link deleted',
    });
  } catch (error) {
    console.error('Error deleting payment link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment link' },
      { status: 500 }
    );
  }
}