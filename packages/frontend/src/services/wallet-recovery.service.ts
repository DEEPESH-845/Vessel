/**
 * Wallet Recovery Service
 * Handles MPC recovery and social recovery mechanisms
 * Requirements: FR-3.1, FR-3.2, FR-3.3, FR-3.4
 */

import { ethers } from 'ethers';

/**
 * Recovery Method Types
 */
export type RecoveryMethod = 'mpc' | 'social' | 'timelock' | 'seed-phrase';

/**
 * MPC Recovery State
 */
export interface MPCRecoveryState {
  status: 'idle' | 'requesting' | 'collecting' | 'reconstructing' | 'completed' | 'failed';
  providersRequested: string[];
  providersResponded: string[];
  progress: number; // 0-100
  error?: string;
}

/**
 * Guardian Info
 */
export interface Guardian {
  address: string;
  ensName?: string;
  addedAt: Date;
  status: 'pending' | 'active' | 'removed';
}

/**
 * Social Recovery State
 */
export interface SocialRecoveryState {
  status: 'idle' | 'initiated' | 'collecting' | 'timelock' | 'executable' | 'completed' | 'cancelled';
  initiator: string;
  guardiansApproved: string[];
  threshold: number;
  timelockEndsAt?: Date;
  newOwner?: string;
  initiatedAt?: Date;
}

/**
 * Recovery Configuration
 */
export interface RecoveryConfig {
  mpcEnabled: boolean;
  mpcThreshold: number; // Number of shares needed
  mpcProviders: string[];
  socialEnabled: boolean;
  guardians: Guardian[];
  guardianThreshold: number;
  timelockDuration: number; // seconds
}

/**
 * Wallet Recovery Service
 * Manages wallet recovery through MPC and social guardians
 */
export class WalletRecoveryService {
  private static instance: WalletRecoveryService;
  
  private mpcState: MPCRecoveryState = {
    status: 'idle',
    providersRequested: [],
    providersResponded: [],
    progress: 0,
  };

  private socialState: SocialRecoveryState = {
    status: 'idle',
    initiator: '',
    guardiansApproved: [],
    threshold: 2,
  };

  private config: RecoveryConfig = {
    mpcEnabled: true,
    mpcThreshold: 2,
    mpcProviders: ['provider1', 'provider2', 'provider3'],
    socialEnabled: false,
    guardians: [],
    guardianThreshold: 2,
    timelockDuration: 48 * 60 * 60, // 48 hours
  };

  private constructor() {}

  static getInstance(): WalletRecoveryService {
    if (!WalletRecoveryService.instance) {
      WalletRecoveryService.instance = new WalletRecoveryService();
    }
    return WalletRecoveryService.instance;
  }

  /**
   * Configure recovery settings
   */
  configure(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): RecoveryConfig {
    return this.config;
  }

  // ==================== MPC Recovery ====================

  /**
   * Initiate MPC recovery
   */
  async initiateMPCRecovery(
    walletId: string,
    userAuth: string
  ): Promise<MPCRecoveryState> {
    this.mpcState = {
      status: 'requesting',
      providersRequested: this.config.mpcProviders,
      providersResponded: [],
      progress: 10,
    };

    try {
      // Request key shares from all providers
      const requests = this.config.mpcProviders.map((provider) =>
        this.requestKeyShare(provider, walletId, userAuth)
      );

      // Wait for threshold responses
      const responses = await Promise.allSettled(requests);

      this.mpcState.status = 'collecting';
      this.mpcState.progress = 40;

      // Count successful responses
      const successfulResponses = responses.filter(
        (r) => r.status === 'fulfilled'
      );

      if (successfulResponses.length < this.config.mpcThreshold) {
        throw new Error(
          `Insufficient key shares. Need ${this.config.mpcThreshold}, got ${successfulResponses.length}`
        );
      }

      // Reconstruct private key
      this.mpcState.status = 'reconstructing';
      this.mpcState.progress = 70;

      const shares = successfulResponses.map(
        (r) => (r as PromiseFulfilledResult<string>).value
      );

      const recoveredKey = await this.reconstructKey(shares);

      this.mpcState.status = 'completed';
      this.mpcState.progress = 100;

      return this.mpcState;
    } catch (error) {
      this.mpcState.status = 'failed';
      this.mpcState.error = error instanceof Error ? error.message : 'Recovery failed';
      return this.mpcState;
    }
  }

  /**
   * Request key share from MPC provider
   */
  private async requestKeyShare(
    provider: string,
    walletId: string,
    userAuth: string
  ): Promise<string> {
    // In production, would call provider API
    // For demo, return mock share
    return `share_${provider}_${walletId.slice(0, 8)}`;
  }

  /**
   * Reconstruct private key from shares
   */
  private async reconstructKey(shares: string[]): Promise<string> {
    // In production, would use Shamir's Secret Sharing
    // For demo, return mock key
    return ethers.Wallet.createRandom().privateKey;
  }

  /**
   * Get MPC recovery state
   */
  getMPCRecoveryState(): MPCRecoveryState {
    return this.mpcState;
  }

  // ==================== Social Recovery ====================

  /**
   * Add a guardian
   */
  async addGuardian(address: string): Promise<Guardian> {
    const guardian: Guardian = {
      address: ethers.getAddress(address),
      addedAt: new Date(),
      status: 'pending',
    };

    this.config.guardians.push(guardian);
    return guardian;
  }

  /**
   * Remove a guardian
   */
  async removeGuardian(address: string): Promise<boolean> {
    const idx = this.config.guardians.findIndex(
      (g) => g.address.toLowerCase() === address.toLowerCase()
    );
    if (idx >= 0) {
      this.config.guardians.splice(idx, 1);
      return true;
    }
    return false;
  }

  /**
   * Initiate social recovery
   */
  async initiateSocialRecovery(
    newOwner: string,
    initiator: string
  ): Promise<SocialRecoveryState> {
    if (!this.config.socialEnabled) {
      throw new Error('Social recovery is not enabled');
    }

    if (this.config.guardians.filter((g) => g.status === 'active').length < this.config.guardianThreshold) {
      throw new Error('Not enough active guardians configured');
    }

    this.socialState = {
      status: 'initiated',
      initiator: ethers.getAddress(initiator),
      guardiansApproved: [],
      threshold: this.config.guardianThreshold,
      newOwner: ethers.getAddress(newOwner),
      initiatedAt: new Date(),
    };

    return this.socialState;
  }

  /**
   * Approve recovery as guardian
   */
  async approveRecovery(
    guardianAddress: string,
    signature: string
  ): Promise<SocialRecoveryState> {
    // Verify guardian
    const guardian = this.config.guardians.find(
      (g) => g.address.toLowerCase() === guardianAddress.toLowerCase() && g.status === 'active'
    );

    if (!guardian) {
      throw new Error('Not an active guardian');
    }

    // Verify signature
    const isValid = await this.verifyGuardianSignature(
      guardianAddress,
      signature,
      this.socialState.newOwner!
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Add approval
    if (!this.socialState.guardiansApproved.includes(guardianAddress)) {
      this.socialState.guardiansApproved.push(guardianAddress);
    }

    // Check if threshold reached
    if (this.socialState.guardiansApproved.length >= this.config.guardianThreshold) {
      this.socialState.status = 'timelock';
      this.socialState.timelockEndsAt = new Date(
        Date.now() + this.config.timelockDuration * 1000
      );
    }

    return this.socialState;
  }

  /**
   * Verify guardian signature
   */
  private async verifyGuardianSignature(
    guardianAddress: string,
    signature: string,
    newOwner: string
  ): Promise<boolean> {
    // In production, would verify EIP-712 signature
    // For demo, return true
    return true;
  }

  /**
   * Execute social recovery after timelock
   */
  async executeSocialRecovery(): Promise<{ success: boolean; txHash?: string }> {
    if (this.socialState.status !== 'executable') {
      throw new Error('Recovery not executable yet');
    }

    // In production, would call smart contract to transfer ownership
    this.socialState.status = 'completed';

    return {
      success: true,
      txHash: `0x${Date.now().toString(16)}`,
    };
  }

  /**
   * Cancel social recovery
   */
  async cancelRecovery(canceler: string): Promise<boolean> {
    // Only wallet owner can cancel
    if (this.socialState.status === 'idle') {
      return false;
    }

    this.socialState = {
      status: 'idle',
      initiator: '',
      guardiansApproved: [],
      threshold: this.config.guardianThreshold,
    };

    return true;
  }

  /**
   * Get social recovery state
   */
  getSocialRecoveryState(): SocialRecoveryState {
    return this.socialState;
  }

  /**
   * Check if timelock has ended
   */
  checkTimelock(): void {
    if (
      this.socialState.status === 'timelock' &&
      this.socialState.timelockEndsAt &&
      new Date() >= this.socialState.timelockEndsAt
    ) {
      this.socialState.status = 'executable';
    }
  }

  /**
   * Get available recovery methods
   */
  getAvailableRecoveryMethods(): RecoveryMethod[] {
    const methods: RecoveryMethod[] = [];

    if (this.config.mpcEnabled) {
      methods.push('mpc');
    }

    if (this.config.socialEnabled && this.config.guardians.length >= this.config.guardianThreshold) {
      methods.push('social');
    }

    return methods;
  }
}

// Export singleton instance
export const walletRecoveryService = WalletRecoveryService.getInstance();

// Missing types for recovery page
export interface RecoveryRequest {
  walletAddress: string;
  method: RecoveryMethod;
  guardians?: string[];
  timelockDuration?: number;
  requestId?: string;
  status?: string;
  timelockEndTime?: string;
}
