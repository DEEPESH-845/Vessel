/**
 * Fiat On/Off Ramp Service
 * Integrates with fiat providers (Moonpay, Transak) for crypto on/off ramps
 * Requirements: FR-10.1, FR-10.2, FR-10.3, FR-10.4
 */

import { ethers } from 'ethers';

/**
 * Fiat Provider Types
 */
export type FiatProvider = 'moonpay' | 'transak' | 'stripe';

/**
 * Fiat Quote
 */
export interface FiatQuote {
  provider: FiatProvider;
  providerName: string;
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  rate: number;
  fee: string;
  feeBreakdown: {
    networkFee: string;
    providerFee: string;
    totalFee: string;
  };
  estimatedTime: number; // minutes
  redirectUrl: string;
}

/**
 * Fiat Purchase Request
 */
export interface FiatPurchaseRequest {
  walletAddress: string;
  fromCurrency: string; // USD, EUR, etc.
  toCurrency: string; // ETH, USDC, etc.
  amount: string;
  chainId: number;
}

/**
 * Fiat Sale Request
 */
export interface FiatSaleRequest {
  walletAddress: string;
  fromCurrency: string; // ETH, USDC, etc.
  toCurrency: string; // USD, EUR, etc.
  amount: string;
  chainId: number;
}

/**
 * Supported Currency
 */
export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'crypto';
  networks?: string[];
  minAmount: string;
  maxAmount: string;
}

/**
 * Transaction Status
 */
export interface FiatTransactionStatus {
  id: string;
  provider: FiatProvider;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  fromAmount: string;
  fromCurrency: string;
  toAmount: string;
  toCurrency: string;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Fiat On/Off Ramp Service
 * Manages fiat-to-crypto and crypto-to-fiat transactions
 */
export class FiatRampService {
  private static instance: FiatRampService;

  private moonpayApiKey: string | null = null;
  private transakApiKey: string | null = null;
  private stripeApiKey: string | null = null;

  private constructor() {}

  static getInstance(): FiatRampService {
    if (!FiatRampService.instance) {
      FiatRampService.instance = new FiatRampService();
    }
    return FiatRampService.instance;
  }

  /**
   * Configure API keys
   */
  configure(config: {
    moonpayApiKey?: string;
    transakApiKey?: string;
    stripeApiKey?: string;
  }): void {
    if (config.moonpayApiKey) this.moonpayApiKey = config.moonpayApiKey;
    if (config.transakApiKey) this.transakApiKey = config.transakApiKey;
    if (config.stripeApiKey) this.stripeApiKey = config.stripeApiKey;
  }

  /**
   * Get supported fiat currencies
   */
  getSupportedFiatCurrencies(): SupportedCurrency[] {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', type: 'fiat', minAmount: '30', maxAmount: '50000' },
      { code: 'EUR', name: 'Euro', symbol: '€', type: 'fiat', minAmount: '30', maxAmount: '50000' },
      { code: 'GBP', name: 'British Pound', symbol: '£', type: 'fiat', minAmount: '25', maxAmount: '40000' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', type: 'fiat', minAmount: '3000', maxAmount: '5000000' },
    ];
  }

  /**
   * Get supported crypto currencies
   */
  getSupportedCryptoCurrencies(): SupportedCurrency[] {
    return [
      { code: 'ETH', name: 'Ethereum', symbol: 'ETH', type: 'crypto', networks: ['ethereum', 'polygon', 'arbitrum', 'base'], minAmount: '0.01', maxAmount: '100' },
      { code: 'USDC', name: 'USD Coin', symbol: 'USDC', type: 'crypto', networks: ['ethereum', 'polygon', 'arbitrum', 'base'], minAmount: '10', maxAmount: '100000' },
      { code: 'USDT', name: 'Tether', symbol: 'USDT', type: 'crypto', networks: ['ethereum', 'polygon'], minAmount: '10', maxAmount: '100000' },
      { code: 'MATIC', name: 'Polygon', symbol: 'MATIC', type: 'crypto', networks: ['polygon'], minAmount: '10', maxAmount: '100000' },
    ];
  }

  /**
   * Get quotes from all providers
   */
  async getQuotes(request: FiatPurchaseRequest): Promise<FiatQuote[]> {
    const quotes: FiatQuote[] = [];

    // Get Moonpay quote
    if (this.moonpayApiKey) {
      try {
        const moonpayQuote = await this.getMoonpayQuote(request);
        if (moonpayQuote) quotes.push(moonpayQuote);
      } catch (error) {
        console.error('Moonpay quote error:', error);
      }
    }

    // Get Transak quote
    if (this.transakApiKey) {
      try {
        const transakQuote = await this.getTransakQuote(request);
        if (transakQuote) quotes.push(transakQuote);
      } catch (error) {
        console.error('Transak quote error:', error);
      }
    }

    // If no API keys, return mock quotes
    if (quotes.length === 0) {
      quotes.push(...this.getMockQuotes(request));
    }

    // Sort by best rate (most crypto for fiat)
    quotes.sort((a, b) => parseFloat(b.toAmount) - parseFloat(a.toAmount));

    return quotes;
  }

  /**
   * Get Moonpay quote
   */
  private async getMoonpayQuote(request: FiatPurchaseRequest): Promise<FiatQuote | null> {
    // In production, would call Moonpay API
    return null;
  }

  /**
   * Get Transak quote
   */
  private async getTransakQuote(request: FiatPurchaseRequest): Promise<FiatQuote | null> {
    // In production, would call Transak API
    return null;
  }

  /**
   * Get mock quotes for demo
   */
  private getMockQuotes(request: FiatPurchaseRequest): FiatQuote[] {
    const fromAmount = parseFloat(request.amount);
    const rate = 2500; // Mock ETH price

    const toAmountEth = (fromAmount / rate).toFixed(6);

    return [
      {
        provider: 'moonpay',
        providerName: 'MoonPay',
        fromAmount: request.amount,
        fromCurrency: request.fromCurrency,
        toAmount: toAmountEth,
        toCurrency: request.toCurrency,
        rate,
        fee: (fromAmount * 0.045).toFixed(2),
        feeBreakdown: {
          networkFee: '1.50',
          providerFee: (fromAmount * 0.03).toFixed(2),
          totalFee: (fromAmount * 0.045).toFixed(2),
        },
        estimatedTime: 10,
        redirectUrl: `https://buy.moonpay.com?walletAddress=${request.walletAddress}&currencyCode=${request.toCurrency}`,
      },
      {
        provider: 'transak',
        providerName: 'Transak',
        fromAmount: request.amount,
        fromCurrency: request.fromCurrency,
        toAmount: (parseFloat(toAmountEth) * 1.01).toFixed(6), // Slightly better rate
        toCurrency: request.toCurrency,
        rate: rate * 0.99,
        fee: (fromAmount * 0.04).toFixed(2),
        feeBreakdown: {
          networkFee: '1.00',
          providerFee: (fromAmount * 0.028).toFixed(2),
          totalFee: (fromAmount * 0.04).toFixed(2),
        },
        estimatedTime: 15,
        redirectUrl: `https://global.transak.com?walletAddress=${request.walletAddress}&cryptoCurrency=${request.toCurrency}`,
      },
    ];
  }

  /**
   * Initiate fiat purchase
   */
  async initiatePurchase(
    provider: FiatProvider,
    request: FiatPurchaseRequest
  ): Promise<{ redirectUrl: string; transactionId: string }> {
    const transactionId = `fiat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let redirectUrl: string;

    switch (provider) {
      case 'moonpay':
        redirectUrl = this.buildMoonpayUrl(request);
        break;
      case 'transak':
        redirectUrl = this.buildTransakUrl(request);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    return { redirectUrl, transactionId };
  }

  /**
   * Build Moonpay URL
   */
  private buildMoonpayUrl(request: FiatPurchaseRequest): string {
    const baseUrl = 'https://buy.moonpay.com';
    const params = new URLSearchParams({
      apiKey: this.moonpayApiKey || 'pk_test_xxx',
      walletAddress: request.walletAddress,
      currencyCode: request.toCurrency,
      baseCurrencyCode: request.fromCurrency,
      baseCurrencyAmount: request.amount,
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Build Transak URL
   */
  private buildTransakUrl(request: FiatPurchaseRequest): string {
    const baseUrl = 'https://global.transak.com';
    const params = new URLSearchParams({
      apiKey: this.transakApiKey || 'xxx',
      walletAddress: request.walletAddress,
      cryptoCurrency: request.toCurrency,
      fiatCurrency: request.fromCurrency,
      fiatAmount: request.amount,
      network: this.getNetworkName(request.chainId),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get network name for chain ID
   */
  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'ethereum',
      137: 'polygon',
      42161: 'arbitrum',
      8453: 'base',
    };
    return networks[chainId] || 'ethereum';
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    transactionId: string,
    provider: FiatProvider
  ): Promise<FiatTransactionStatus> {
    // In production, would call provider API
    // Return mock status
    return {
      id: transactionId,
      provider,
      status: 'pending',
      fromAmount: '100',
      fromCurrency: 'USD',
      toAmount: '0.04',
      toCurrency: 'ETH',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Get sell quotes (crypto to fiat)
   */
  async getSellQuotes(request: FiatSaleRequest): Promise<FiatQuote[]> {
    // Similar to buy quotes, but for selling crypto
    const fromAmount = parseFloat(request.amount);
    const rate = 2500; // Mock ETH price

    const toAmountFiat = (fromAmount * rate).toFixed(2);

    return [
      {
        provider: 'moonpay',
        providerName: 'MoonPay',
        fromAmount: request.amount,
        fromCurrency: request.fromCurrency,
        toAmount: toAmountFiat,
        toCurrency: request.toCurrency,
        rate,
        fee: (fromAmount * rate * 0.05).toFixed(2),
        feeBreakdown: {
          networkFee: '2.00',
          providerFee: (fromAmount * rate * 0.04).toFixed(2),
          totalFee: (fromAmount * rate * 0.05).toFixed(2),
        },
        estimatedTime: 30,
        redirectUrl: `https://sell.moonpay.com?walletAddress=${request.walletAddress}&currencyCode=${request.fromCurrency}`,
      },
    ];
  }

  /**
   * Check if KYC is required for amount
   */
  isKycRequired(amount: number, currency: string): boolean {
    // Most providers require KYC above certain thresholds
    const thresholds: Record<string, number> = {
      USD: 1000,
      EUR: 1000,
      GBP: 800,
    };

    return amount > (thresholds[currency] || 1000);
  }

  /**
   * Get provider fees
   */
  getProviderFees(provider: FiatProvider): {
    percentageFee: number;
    fixedFee: number;
    networkFee: number;
  } {
    const fees = {
      moonpay: { percentageFee: 3.0, fixedFee: 0, networkFee: 1.5 },
      transak: { percentageFee: 2.8, fixedFee: 0, networkFee: 1.0 },
      stripe: { percentageFee: 1.5, fixedFee: 0.30, networkFee: 0 },
    };

    return fees[provider] || fees.moonpay;
  }
}

// Export singleton instance
export const fiatRampService = FiatRampService.getInstance();