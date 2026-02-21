/**
 * Payment Link Service
 * Handles payment link creation, management, and processing
 * Requirements: FR-12.1, FR-12.2, FR-12.3, FR-12.4, FR-12.5
 */

import { ethers } from 'ethers';
import { PaymentLink, Payment } from '@/types/payment-link.types';
import { getSecureStorage } from '@/lib/secure-storage';

/**
 * Payment Link Service
 * Manages payment links with local storage and backend sync
 */
export class PaymentLinkService {
  private static instance: PaymentLinkService;
  
  private readonly STORAGE_KEY = 'vessel-payment-links';
  private paymentLinks = new Map<string, PaymentLink>();
  private payments = new Map<string, Payment[]>();
  private initialized = false;

  private constructor() {}

  static getInstance(): PaymentLinkService {
    if (!PaymentLinkService.instance) {
      PaymentLinkService.instance = new PaymentLinkService();
    }
    return PaymentLinkService.instance;
  }

  /**
   * Initialize from storage
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storage = getSecureStorage();
      if (storage.hasPassword()) {
        const data = await storage.getItem(this.STORAGE_KEY);
        if (data) {
          const links = JSON.parse(data) as PaymentLink[];
          links.forEach((link) => {
            this.paymentLinks.set(link.id, {
              ...link,
              createdAt: new Date(link.createdAt),
              expiresAt: link.expiresAt ? new Date(link.expiresAt) : undefined,
            });
          });
        }
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize payment links:', error);
    }
  }

  /**
   * Persist to storage
   */
  private async persist(): Promise<void> {
    try {
      const storage = getSecureStorage();
      if (storage.hasPassword()) {
        const data = JSON.stringify(Array.from(this.paymentLinks.values()));
        await storage.setItem(this.STORAGE_KEY, data);
      }
    } catch (error) {
      console.error('Failed to persist payment links:', error);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `pl_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Create a payment link
   */
  async createPaymentLink(params: {
    amount: string;
    token: string;
    acceptedTokens: string[];
    recipientAddress: string;
    description?: string;
    expiresAt?: Date;
    maxUses?: number;
    branding?: {
      logo?: string;
      backgroundColor?: string;
    };
  }): Promise<PaymentLink> {
    await this.initialize();

    const id = this.generateId();
    const now = new Date();

    const paymentLink: PaymentLink = {
      id,
      amount: params.amount,
      token: params.token,
      acceptedTokens: params.acceptedTokens,
      recipientAddress: ethers.getAddress(params.recipientAddress),
      description: params.description || '',
      expiresAt: params.expiresAt,
      maxUses: params.maxUses,
      currentUses: 0,
      status: 'active',
      createdAt: now,
      branding: params.branding,
    };

    this.paymentLinks.set(id, paymentLink);
    await this.persist();

    return paymentLink;
  }

  /**
   * Get payment link by ID
   */
  async getPaymentLink(id: string): Promise<PaymentLink | null> {
    await this.initialize();
    return this.paymentLinks.get(id) || null;
  }

  /**
   * Get all payment links
   */
  async getAllPaymentLinks(): Promise<PaymentLink[]> {
    await this.initialize();
    return Array.from(this.paymentLinks.values());
  }

  /**
   * Update payment link
   */
  async updatePaymentLink(
    id: string,
    updates: Partial<Pick<PaymentLink, 'description' | 'expiresAt' | 'maxUses' | 'status'>>
  ): Promise<PaymentLink | null> {
    await this.initialize();

    const existing = this.paymentLinks.get(id);
    if (!existing) {
      return null;
    }

    const updated: PaymentLink = {
      ...existing,
      ...updates,
    };

    this.paymentLinks.set(id, updated);
    await this.persist();

    return updated;
  }

  /**
   * Deactivate payment link
   */
  async deactivatePaymentLink(id: string): Promise<boolean> {
    return (await this.updatePaymentLink(id, { status: 'inactive' })) !== null;
  }

  /**
   * Validate payment link for use
   */
  validatePaymentLink(link: PaymentLink): { valid: boolean; reason?: string } {
    // Check status
    if (link.status !== 'active') {
      return { valid: false, reason: 'Payment link is not active' };
    }

    // Check expiration
    if (link.expiresAt && new Date() > link.expiresAt) {
      return { valid: false, reason: 'Payment link has expired' };
    }

    // Check max uses
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return { valid: false, reason: 'Payment link has reached maximum uses' };
    }

    return { valid: true };
  }

  /**
   * Process a payment
   */
  async processPayment(params: {
    linkId: string;
    senderAddress: string;
    token: string;
    amount: string;
    txHash: string;
    chainId: number;
  }): Promise<Payment> {
    await this.initialize();

    const link = this.paymentLinks.get(params.linkId);
    if (!link) {
      throw new Error('Payment link not found');
    }

    // Validate
    const validation = this.validatePaymentLink(link);
    if (!validation.valid) {
      throw new Error(validation.reason);
    }

    // Create payment record
    const payment: Payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      linkId: params.linkId,
      senderAddress: ethers.getAddress(params.senderAddress),
      token: params.token,
      amount: params.amount,
      txHash: params.txHash,
      chainId: params.chainId,
      status: 'pending',
      createdAt: new Date(),
    };

    // Add to payments map
    const linkPayments = this.payments.get(params.linkId) || [];
    linkPayments.push(payment);
    this.payments.set(params.linkId, linkPayments);

    // Increment uses
    link.currentUses++;

    // Check if max uses reached
    if (link.maxUses && link.currentUses >= link.maxUses) {
      link.status = 'completed';
    }

    await this.persist();

    return payment;
  }

  /**
   * Get payments for a link
   */
  async getPaymentsForLink(linkId: string): Promise<Payment[]> {
    return this.payments.get(linkId) || [];
  }

  /**
   * Get total received for a link
   */
  getTotalReceived(linkId: string): string {
    const payments = this.payments.get(linkId) || [];
    return payments
      .filter((p) => p.status === 'confirmed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0)
      .toString();
  }

  /**
   * Generate shareable URL
   */
  generateShareableUrl(linkId: string, baseUrl: string): string {
    return `${baseUrl}/pay/${linkId}`;
  }

  /**
   * Delete payment link
   */
  async deletePaymentLink(id: string): Promise<boolean> {
    await this.initialize();

    const existed = this.paymentLinks.delete(id);
    if (existed) {
      this.payments.delete(id);
      await this.persist();
    }
    return existed;
  }

  /**
   * Get payment links by status
   */
  async getPaymentLinksByStatus(status: PaymentLink['status']): Promise<PaymentLink[]> {
    await this.initialize();
    return Array.from(this.paymentLinks.values()).filter((link) => link.status === status);
  }

  /**
   * Check for expired links and update status
   */
  async checkExpiredLinks(): Promise<number> {
    await this.initialize();

    let expiredCount = 0;
    const now = new Date();

    for (const link of this.paymentLinks.values()) {
      if (link.status === 'active' && link.expiresAt && now > link.expiresAt) {
        link.status = 'expired';
        expiredCount++;
      }
    }

    if (expiredCount > 0) {
      await this.persist();
    }

    return expiredCount;
  }
}

// Export singleton instance
export const paymentLinkService = PaymentLinkService.getInstance();