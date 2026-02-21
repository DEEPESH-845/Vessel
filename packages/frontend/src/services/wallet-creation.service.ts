/**
 * Wallet Creation Service
 * Handles automatic wallet creation with MPC and smart contract support
 */

import { 
  WalletCreationConfig, 
  CreatedWallet, 
  RecoveryConfig,
  KeyShareMetadata,
  WalletCreationProgress 
} from '@/types/wallet-creation.types';
import { ethers } from 'ethers';

export class WalletCreationService {
  private static instance: WalletCreationService;
  private progressCallbacks: ((progress: WalletCreationProgress) => void)[] = [];

  private constructor() {}

  static getInstance(): WalletCreationService {
    if (!WalletCreationService.instance) {
      WalletCreationService.instance = new WalletCreationService();
    }
    return WalletCreationService.instance;
  }

  /**
   * Subscribe to wallet creation progress updates
   */
  onProgress(callback: (progress: WalletCreationProgress) => void): () => void {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers of progress update
   */
  private notifyProgress(progress: WalletCreationProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  /**
   * Create a new wallet based on configuration
   */
  async createWallet(config: WalletCreationConfig): Promise<CreatedWallet> {
    this.notifyProgress({
      currentStep: 'generating-address',
      progress: 10,
      message: 'Generating wallet address...'
    });

    // Generate deterministic address from user ID
    const address = await this.generateDeterministicAddress(config.userId);

    if (config.provider === 'mpc') {
      return await this.createMPCWallet(config, address);
    } else {
      return await this.createSmartContractWallet(config, address);
    }
  }

  /**
   * Generate deterministic wallet address from user ID
   * Uses a hash of the user ID to create a consistent address
   */
  private async generateDeterministicAddress(userId: string): Promise<string> {
    // Create a deterministic seed from user ID
    const seed = ethers.keccak256(ethers.toUtf8Bytes(userId));
    
    // Create a wallet from the seed
    const wallet = new ethers.Wallet(seed);
    
    return wallet.address;
  }

  /**
   * Create an MPC wallet with distributed key shares
   */
  private async createMPCWallet(
    config: WalletCreationConfig,
    address: string
  ): Promise<CreatedWallet> {
    this.notifyProgress({
      currentStep: 'distributing-keys',
      progress: 40,
      message: 'Distributing MPC key shares...'
    });

    // Distribute key shares across providers
    const keyShares = await this.distributeMPCKeyShares(config.userId, address);

    this.notifyProgress({
      currentStep: 'completed',
      progress: 100,
      message: 'MPC wallet created successfully!'
    });

    const recoveryConfig: RecoveryConfig = {
      method: 'mpc',
      threshold: 2, // 2-of-3 threshold
      keyShares
    };

    return {
      address,
      type: 'eoa',
      recoveryConfig,
      createdAt: new Date()
    };
  }

  /**
   * Distribute MPC key shares across multiple providers
   * In production, this would integrate with actual MPC providers
   */
  private async distributeMPCKeyShares(
    userId: string,
    address: string
  ): Promise<KeyShareMetadata[]> {
    // Simulate key share distribution
    // In production, this would use actual MPC libraries like TSS or Shamir's Secret Sharing
    
    const providers = ['provider-1', 'provider-2', 'provider-3'];
    const keyShares: KeyShareMetadata[] = [];

    for (let i = 0; i < providers.length; i++) {
      // Generate a unique share ID
      const shareId = ethers.keccak256(
        ethers.toUtf8Bytes(`${userId}-${address}-${providers[i]}-${Date.now()}`)
      );

      // In production, this would be the actual encrypted key share
      const encryptedShare = ethers.keccak256(
        ethers.toUtf8Bytes(`share-${i}-${userId}`)
      );

      keyShares.push({
        shareId,
        provider: providers[i],
        encryptedShare,
        createdAt: new Date()
      });

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return keyShares;
  }

  /**
   * Create a smart contract wallet (ERC-4337 Account Abstraction)
   */
  private async createSmartContractWallet(
    config: WalletCreationConfig,
    address: string
  ): Promise<CreatedWallet> {
    this.notifyProgress({
      currentStep: 'preparing-deployment',
      progress: 60,
      message: 'Preparing smart contract wallet deployment...'
    });

    // Prepare smart contract wallet deployment
    // In production, this would interact with an Account Factory contract
    const deploymentData = await this.prepareSmartContractDeployment(
      config,
      address
    );

    this.notifyProgress({
      currentStep: 'completed',
      progress: 100,
      message: 'Smart contract wallet prepared successfully!'
    });

    const recoveryConfig: RecoveryConfig = {
      method: config.recoveryMethod === 'social' ? 'social-recovery' : 'timelock',
      threshold: config.recoveryMethod === 'social' ? 2 : undefined,
      guardians: config.recoveryMethod === 'social' ? [] : undefined,
      timelockPeriod: config.recoveryMethod === 'timelock' ? 48 * 60 * 60 : undefined // 48 hours
    };

    return {
      address: deploymentData.predictedAddress,
      type: 'smart-contract',
      deploymentTxHash: undefined, // Will be set on first transaction
      recoveryConfig,
      createdAt: new Date()
    };
  }

  /**
   * Prepare smart contract wallet deployment
   * Returns the predicted address and deployment data
   */
  private async prepareSmartContractDeployment(
    config: WalletCreationConfig,
    _ownerAddress: string
  ): Promise<{ predictedAddress: string; deploymentData: string }> {
    // In production, this would:
    // 1. Connect to the Account Factory contract
    // 2. Calculate the CREATE2 address for the new wallet
    // 3. Prepare the initialization data
    
    // For now, we'll use a deterministic address based on the owner
    const salt = ethers.keccak256(ethers.toUtf8Bytes(config.userId));
    
    // Simulate CREATE2 address calculation
    const predictedAddress = ethers.getCreate2Address(
      '0x0000000000000000000000000000000000000000', // Factory address placeholder
      salt,
      ethers.keccak256('0x00') // Bytecode hash placeholder
    );

    // Simulate deployment data preparation
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      predictedAddress,
      deploymentData: '0x' // Placeholder for actual deployment data
    };
  }

  /**
   * Check if a wallet exists for a user
   */
  async walletExists(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/wallet/exists?userId=${userId}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Failed to check wallet existence:', error);
      return false;
    }
  }

  /**
   * Save wallet to backend
   */
  async saveWallet(userId: string, wallet: CreatedWallet): Promise<void> {
    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          wallet
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save wallet');
      }
    } catch (error) {
      throw new Error(`Wallet save failed: ${error}`);
    }
  }
}

export const walletCreationService = WalletCreationService.getInstance();
