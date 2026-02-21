# Vessel Wallet Architecture Documentation

## Overview

Vessel Wallet is a next-generation smart wallet built on account abstraction (ERC-4337) principles. It provides a seamless, secure, and feature-rich wallet experience with advanced capabilities like session keys, gas abstraction, cross-chain transfers, and social recovery.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   React     │  │   Wallet    │  │   Framer    │  │   GSAP      │    │
│  │   Components│  │   Connect   │  │   Motion    │  │   Animations│    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Session    │  │    ENS      │  │  Contact    │  │  Gas        │    │
│  │  Key Svc    │  │  Resolver   │  │  Service    │  │  Estimator  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Paymaster  │  │  Multi-Chain│  │  AI         │  │  Fiat       │    │
│  │  Service    │  │  Router     │  │  Assistant  │  │  Ramp       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js API Routes                            │   │
│  │  /api/session-keys  /api/ens  /api/contacts  /api/relay ...     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BLOCKCHAIN LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Ethereum   │  │  Polygon    │  │  Arbitrum   │  │   Base      │    │
│  │  Mainnet    │  │             │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  EntryPoint │  │  Paymaster  │  │  Smart      │  │  Bridge     │    │
│  │  Contract   │  │  Contracts  │  │  Wallets    │  │  Protocols  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Session Key Service

**Purpose:** Manages permissioned session keys for gasless transactions.

**Key Features:**
- Ed25519 key pair generation
- Permission validation (spending limits, allowed contracts/functions, chain restrictions)
- Secure storage with Web Crypto API encryption
- Automatic expiration handling

**File:** `src/services/session-key.service.ts`

```typescript
// Create a session key with custom permissions
const sessionKey = await sessionKeyService.createSessionKey({
  permissions: {
    spendingLimit: '1000000000000000000', // 1 ETH max
    allowedContracts: ['0x...'], // Only interact with these contracts
    allowedFunctions: ['0xa9059cbb'], // Only transfer function
    chainIds: [1, 137], // Ethereum + Polygon only
  },
  durationMs: 604800000, // 7 days
});
```

### 2. ENS Resolver Service

**Purpose:** Resolves ENS names and profiles with caching.

**Key Features:**
- Forward resolution (name → address)
- Reverse resolution (address → name)
- Full profile with avatar and social links
- LRU cache with TTL

**File:** `src/services/ens-resolver.service.ts`

### 3. Paymaster Service

**Purpose:** Enables gasless transactions through ERC-4337 paymaster.

**Key Features:**
- Gas estimation in native tokens and stablecoins
- UserOperation building
- Stablecoin approval flow
- Multi-chain support

**File:** `src/services/paymaster.service.ts`

### 4. Multi-Chain Router Service

**Purpose:** Discovers and executes cross-chain routes.

**Key Features:**
- Bridge aggregation (Socket, LI.FI)
- Route scoring (speed, cost, security)
- Slippage protection
- Cross-chain transaction tracking

**File:** `src/services/multi-chain-router.service.ts`

### 5. AI Assistant Service

**Purpose:** Natural language intent parsing for transactions.

**Key Features:**
- Pattern-based intent matching
- Clarifying question generation
- Transaction explanation
- Proactive suggestions

**File:** `src/services/ai-assistant.service.ts`

## Data Flow

### Transaction Flow

```
User Input → Intent Parsing → Transaction Builder → Gas Estimation
                  ↓                                      ↓
           [AI Assistant]                        [Paymaster Check]
                  ↓                                      ↓
           Session Key Validation                    ←─────┘
                  ↓
           Signature Creation
                  ↓
           Relayer Submission
                  ↓
           Transaction Timeline
```

### Session Key Validation Flow

```
Transaction Request
        │
        ▼
┌───────────────┐    Expired    ┌───────────────┐
│ Check Expiry  │──────────────▶│ Reject        │
└───────────────┘               └───────────────┘
        │ Valid
        ▼
┌───────────────┐    Exceeded   ┌───────────────┐
│ Check Spending│──────────────▶│ Reject        │
│    Limit      │               └───────────────┘
└───────────────┘
        │ Within limit
        ▼
┌───────────────┐    Not Allowed┌───────────────┐
│ Check Contract│──────────────▶│ Reject        │
│   Allowlist   │               └───────────────┘
└───────────────┘
        │ Allowed
        ▼
┌───────────────┐    Not Allowed┌───────────────┐
│ Check Function│──────────────▶│ Reject        │
│   Allowlist   │               └───────────────┘
└───────────────┘
        │ Allowed
        ▼
┌───────────────┐
│   APPROVE     │
└───────────────┘
```

## Security Model

### Key Management

1. **Master Key**: Stored in browser's secure storage, encrypted with user password
2. **Session Keys**: Ed25519 keys with scoped permissions, stored encrypted
3. **Recovery Keys**: Shamir's Secret Sharing across MPC providers

### Permission System

```typescript
interface SessionPermissions {
  spendingLimit?: string;        // Max value per transaction
  allowedContracts?: string[];   // Whitelisted contract addresses
  allowedFunctions?: string[];   // Whitelisted function selectors
  chainIds?: number[];           // Allowed chain IDs
}
```

### Encryption

- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Storage**: Web Crypto API with non-extractable keys

## Performance Optimizations

### Caching Strategy

| Service | Cache Type | TTL |
|---------|-----------|-----|
| ENS Resolution | LRU Cache | 5-60 min |
| Gas Estimates | Memory | 15 sec |
| Token Prices | Memory | 30 sec |
| Contacts | Local Storage | Persistent |
| Session Keys | Secure Storage | Persistent |

### Bundle Optimization

- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: ESM modules with named exports
- **Asset Optimization**: WebP images, SVG icons

## Error Handling

### Error Hierarchy

```typescript
class VesselError extends Error {
  code: string;
  details?: Record<string, any>;
}

class SessionKeyError extends VesselError {}
class TransactionError extends VesselError {}
class ValidationError extends VesselError {}
```

### Recovery Strategies

1. **Network Errors**: Exponential backoff retry
2. **Validation Errors**: User feedback, suggest corrections
3. **Signature Errors**: Prompt re-authentication
4. **Insufficient Funds**: Show deposit options

## Monitoring & Observability

### Metrics

- Transaction success rate
- Gas estimation accuracy
- Session key usage
- API response times
- Error rates by type

### Logging

```typescript
logger.info('Transaction submitted', {
  txHash,
  chainId,
  sessionId,
  gasUsed,
});
```

### Alerting

- High error rate threshold
- Gas price spikes
- Bridge downtime
- Session key expiration warnings

## Deployment Architecture

### Production Stack

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CDN       │────▶│   Nginx     │────▶│   Next.js   │
│   (Static)  │     │   (SSL)     │     │   App       │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                        ┌──────────────────────┼──────────────────────┐
                        │                      │                      │
                        ▼                      ▼                      ▼
                  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
                  │   Redis     │        │  PostgreSQL │        │  Blockchain │
                  │   (Cache)   │        │   (Data)    │        │    RPC      │
                  └─────────────┘        └─────────────┘        └─────────────┘
```

## Future Improvements

1. **MPC Integration**: Full threshold signature scheme
2. **ZK Proofs**: Privacy-preserving transactions
3. **Intent-based Architecture**: CoW-style order flow
4. **AA Smart Accounts**: Full ERC-4337 bundler integration
5. **Hardware Wallet**: Ledger/Trezor support