/**
 * Service Index
 * Central export for all services
 */

// Session Key Service
export { sessionKeyService, SessionKeyService } from './session-key.service';

// ENS Resolver Service
export { ensResolverService, ENSResolverService } from './ens-resolver.service';
export type { ENSResolvedProfile } from './ens-resolver.service';

// Contact Service
export { contactService, ContactService } from './contact.service';

// Meta-Transaction Service
export { metaTransactionService, MetaTransactionService } from './meta-transaction.service';
export type { MetaTransaction, SignedMetaTransaction, RelayerStatus } from './meta-transaction.service';

// Paymaster Service
export { paymasterService, PaymasterService } from './paymaster.service';
export type { GasEstimate, UserOperation, PaymasterConfig } from './paymaster.service';

// Payment Link Service
export { paymentLinkService, PaymentLinkService } from './payment-link.service';

// Gas Estimator Service
export { gasEstimatorService, GasEstimatorService } from './gas-estimator.service';
export type { GasPriceEstimate, FullGasEstimate, GasLevel } from './gas-estimator.service';

// AI Assistant Service
export { aiAssistantService, AIAssistantService } from './ai-assistant.service';
export type { ParsedIntent } from './ai-assistant.service';

// Multi-Chain Router Service
export { multiChainRouterService, MultiChainRouterService } from './multi-chain-router.service';
export type { RouteOption, RouteRequest, RouteExecution, BridgeStep } from './multi-chain-router.service';

// Address Identity Service
export { addressIdentityService, AddressIdentityService } from './address-identity.service';
export type { AddressIdentity, ReputationScore, RiskAssessment } from './address-identity.service';

// Wallet Recovery Service
export { walletRecoveryService, WalletRecoveryService } from './wallet-recovery.service';
export type { MPCRecoveryState, SocialRecoveryState, Guardian, RecoveryConfig } from './wallet-recovery.service';

// Fiat Ramp Service
export { fiatRampService, FiatRampService } from './fiat-ramp.service';
export type { FiatQuote, FiatPurchaseRequest, FiatTransactionStatus } from './fiat-ramp.service';

// Chain Aggregator Service (existing)
export { aggregateMultiChainBalances, clearBalanceCache, batchRPCRequests } from './multi-chain/chain-aggregator.service';