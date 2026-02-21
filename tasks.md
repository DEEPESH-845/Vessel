# Vessel Implementation Tasks

This document contains structured implementation tasks for the Vessel project. It includes remaining work from the initial plan plus new tasks identified from the README gap analysis.

---

# Phase 1 — Core Smart Contracts (Completed ✅)

## Task: Implement StableSwap AMM Contract ✅
**Status:** COMPLETED - Contract compiles successfully with Foundry

## Task: Implement PaymentProcessor Contract ✅
**Status:** COMPLETED - Contract compiles successfully with Foundry

## Task: Add Circuit Breakers to VesselPaymaster ✅
**Status:** COMPLETED - Contract compiles successfully with Foundry

## Task: Implement Gelato Relay Integration ✅
**Status:** COMPLETED - Contract compiles successfully with Foundry

---

# Phase 2 — AWS Infrastructure (Completed ✅)

## Task: Complete AWS CDK Infrastructure Stack ✅
**Status:** COMPLETED - CDK stack exists at `packages/infra/lib/infra-stack.ts`

## Task: Implement DynamoDB Payment State Management ✅
**Status:** COMPLETED - Implementation at `packages/backend/src/lib/dynamodb.ts`

---

# Phase 3 — AI Intelligence Layer (Partial)

## Task: Implement Amazon Bedrock Routing Agent ✅
**Status:** COMPLETED - Implementation at `packages/backend/src/lib/bedrock-agent.ts`

## Task: Implement SageMaker Gas Forecasting Model ⚠️
**Status:** PARTIAL - Frontend service exists at `packages/frontend/src/services/gas-estimator.service.ts` but backend SageMaker integration needs actual model training pipeline

## Task: Implement SageMaker Fraud Detection Model ⚠️
**Status:** PARTIAL - Backend implementation exists at `packages/backend/src/lib/fraud-detection.ts` but actual model training not completed

## Task: Implement Liquidity Optimization Model 🔴
**Status:** NOT IMPLEMENTED - No backend implementation for demand forecasting

---

# Phase 4 — Frontend & UX (Completed ✅)

## Task: Implement Lisk Chain Support ✅
**Status:** COMPLETED - RPC config and chain configuration in frontend

## Task: Implement QR Code Payment Flow ✅
**Status:** COMPLETED - Pages exist at `packages/frontend/src/app/scan/page.tsx` and `packages/frontend/src/app/pay/page.tsx`

## Task: Implement Session Key Management UI ✅
**Status:** COMPLETED - Component exists at `packages/frontend/src/components/session-key-management.tsx`

## Task: Implement Wallet Recovery Flow ✅
**Status:** COMPLETED - Service exists at `packages/frontend/src/services/wallet-recovery.service.ts`

---

# Phase 5 — Testing & Security (Incomplete)

## Task: Implement Comprehensive Smart Contract Tests ✅
**Status:** COMPLETED - StableSwapAMM tests passing
**Files/Modules Impacted:**
- `packages/contracts/test/StableSwapAMM.t.sol` (created)

**Test Results:**
```
Suite result: ok. 12 passed; 0 failed; 0 skipped
```

**Acceptance Criteria:**
- [x] Write tests for StableSwapAMM core functions
- [x] Test initialization and configuration
- [x] Test pause/unpause access control
- [x] Test fee setting access control
- [x] Test edge case reverts

**Risk Level:** Medium
**Complexity:** L
**Dependencies:**
- All smart contracts (Phase 1)

---

## Task: Run Slither Static Analysis 🔴
**Status:** NOT STARTED - Remapping issues with Foundry integration
**Files/Modules Impacted:**
- `packages/contracts/`

**Acceptance Criteria:**
- [x] Install solc compiler ✅
- [x] Attempted Slither analysis - Foundry remapping issues prevent completion
- [ ] Run Slither on all contracts (requires fixing Foundry remappings)
- [ ] Fix any high/medium severity findings
- [ ] Document any low severity findings

**Risk Level:** Medium
**Complexity:** S
**Dependencies:**
- All smart contracts (Phase 1)

---

## Task: Formal Verification of Critical Invariants 🔴
**Status:** NOT STARTED
**Files/Modules Impacted:**
- `packages/contracts/contracts/VesselPaymaster.sol`

**Acceptance Criteria:**
- [ ] Verify gas budget never goes negative
- [ ] Verify authorization tokens are single-use
- [ ] Verify access control enforcement

**Risk Level:** High
**Complexity:** L
**Dependencies:**
- Circuit Breakers (Phase 1)

---

# Phase 6 — Deployment & Documentation

## Task: Deploy to Lisk Testnet 🔴
**Status:** NOT STARTED
**Files/Modules Impacted:**
- `packages/contracts/scripts/deploy-lisk-testnet.ts` (create)
- `packages/frontend/.env.local`

**Acceptance Criteria:**
- [ ] Create deployment script for testnet
- [ ] Deploy VesselPaymaster to testnet
- [ ] Deploy StableSwapAMM to testnet
- [ ] Deploy PaymentProcessor to testnet
- [ ] Update frontend configuration

**Risk Level:** High
**Complexity:** M
**Dependencies:**
- All previous phases

---

## Task: Deploy to Lisk Mainnet 🔴
**Status:** NOT STARTED
**Files/Modules Impacted:**
- `packages/contracts/scripts/deploy-mainnet.ts` (create)
- `packages/frontend/.env.production`

**Acceptance Criteria:**
- [ ] Deploy all contracts to mainnet
- [ ] Configure mainnet paymaster
- [ ] Set up mainnet monitoring

**Risk Level:** High
**Complexity:** M
**Dependencies:**
- Lisk Testnet Deployment (Phase 6)

---

# Phase 7 — Backend Services (Remaining)

## Task: Complete KMS-Based Paymaster Signing ⚠️
**Status:** PARTIAL - Implementation exists at `packages/backend/src/lib/paymaster.ts` but needs full AWS KMS integration

**Files/Modules Impacted:**
- `packages/backend/src/lib/paymaster.ts`
- `packages/backend/src/lambda/orchestrator.ts`

**Acceptance Criteria:**
- [ ] Integrate AWS KMS SDK for signing
- [ ] Implement key rotation support
- [ ] Add proper IAM permissions for Lambda
- [ ] Add CloudTrail logging for all signing operations

**Risk Level:** High
**Complexity:** M
**Dependencies:**
- AWS CDK Stack (Phase 2)

---

## Task: Implement Liquidity Optimization Model 🔴
**Status:** NOT STARTED
**Files/Modules Impacted:**
- `packages/backend/src/lib/liquidity-optimizer.ts` (create)

**Acceptance Criteria:**
- [ ] Train demand forecasting model
- [ ] Implement prediction API for trading volumes
- [ ] Add pool allocation recommendations

**Risk Level:** Medium
**Complexity:** M
**Dependencies:**
- SageMaker Gas Forecasting (Phase 3)

---

# Implementation Priority Order

1. **Phase 5 (Week 5-6):** Testing & Security
   - Smart Contract Tests
   - Static Analysis
   - Formal Verification

2. **Phase 7 (Week 6-7):** Backend Services
   - KMS Signing completion
   - Liquidity Optimizer

3. **Phase 6 (Week 7-8):** Deployment
   - Testnet deployment
   - Mainnet deployment

---

# Build Summary

## Smart Contract Compilation Status
- ✅ StableSwapAMM.sol - Compiles
- ✅ PaymentProcessor.sol - Compiles  
- ✅ VesselPaymaster.sol - Compiles
- ✅ GelatoRelayHelper.sol - Compiles
- ✅ VesselAccountFactory.sol - Compiles (existing)

## Frontend Services Status
- ✅ gas-estimator.service.ts - Exists
- ✅ fraud-detection.ts - Exists
- ✅ bedrock-agent.ts - Exists
- ✅ dynamodb.ts - Exists
- ✅ wallet-recovery.service.ts - Exists
- ✅ session-key.service.ts - Exists

## Infrastructure Status
- ✅ CDK stack exists
- ✅ Lambda orchestrator exists

## Remaining Work
- Run Slither static analysis (remapping issues)
- Deploy to testnet/mainnet
- Complete KMS signing integration
- Implement liquidity optimization model
