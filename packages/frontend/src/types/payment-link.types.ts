/**
 * Payment Link Types
 * Stripe-style Web3 payment links with multi-token support
 */

/**
 * Payment Link
 * Shareable payment link that accepts multiple tokens
 */
export interface PaymentLink {
  id: string;
  creatorAddress: string;
  amount: string;
  currency: 'USD' | 'EUR' | 'GBP';
  acceptedTokens: string[];
  autoConvertTo?: string;
  description: string;
  expiresAt?: Date;
  maxUses?: number;
  currentUses: number;
  status: 'active' | 'expired' | 'completed';
  createdAt: Date;
}

export interface PaymentLinkConfig {
  amount: string;
  currency: string;
  acceptedTokens: string[];
  autoConvertTo?: string;
  description: string;
  expiresIn?: number;
  maxUses?: number;
  successUrl?: string;
  cancelUrl?: string;
  branding?: PaymentLinkBranding;
  requirePayerInfo?: boolean;
}

export interface PaymentLinkBranding {
  logo?: string;
  primaryColor?: string;
  backgroundColor?: string;
}

export interface PaymentDetails {
  payerAddress: string;
  token: string;
  amount: string;
  chain: number;
  payerInfo?: PayerInfo;
}

export interface PayerInfo {
  name?: string;
  email?: string;
}

export interface Payment {
  id: string;
  linkId: string;
  payerAddress: string;
  token: string;
  amount: string;
  convertedAmount?: string;
  txHash: string;
  chainId: number;
  paidAt: Date;
  payerInfo?: PayerInfo;
}

export interface PaymentLinkStats {
  totalPayments: number;
  totalAmount: string;
  uniquePayers: number;
  averagePayment: string;
  lastPaymentAt?: Date;
}
