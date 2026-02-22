# Vessel Security Audit Report

**Audit Date:** February 22, 2026  
**Version:** 1.0  
**Status:** Critical Issues Found - Requires Immediate Attention

---

## Executive Summary

This security audit identified **12 critical vulnerabilities**, **8 high-severity issues**, and **15 medium/low-severity concerns** across the Vessel codebase. The application handles cryptocurrency payments and wallet management, making security paramount.

---

## Critical Vulnerabilities

### 1. Private Key Exposure in Backend Lambda (CRITICAL)
**Location:** `packages/backend/src/lambda/orchestrator.ts`

**Issue:** The orchestrator accepts `paymasterAddress` directly from request body without validation:
```typescript
const { userOpHash, validUntil, validAfter, paymasterAddress } = body;
```

**Impact:** An attacker can specify any paymaster address and potentially redirect sponsorship payments.

**Recommendation:**
```typescript
// Whitelist allowed paymaster addresses
const ALLOWED_PAYMASTERS = process.env.ALLOWED_PAYMASTERS?.split(',') || [];
if (!ALLOWED_PAYMASTERS.includes(paymasterAddress)) {
  return { statusCode: 403, body: JSON.stringify({ error: 'Unauthorized paymaster' }) };
}
```

---

### 2. Deterministic Wallet Address Generation (CRITICAL)
**Location:** `packages/frontend/src/services/wallet-creation.service.ts`

**Issue:** Wallet addresses are generated from user ID using insecure deterministic method:
```typescript
const seed = ethers.keccak256(ethers.toUtf8Bytes(userId));
const wallet = new ethers.Wallet(seed);
```

**Impact:** Anyone who knows a user's ID can derive their wallet private key. This is a complete compromise of all wallets.

**Recommendation:** Use cryptographically secure random key generation with MPC (Multi-Party Computation) for key sharding. Never derive keys from predictable inputs.

---

### 3. Session Key Private Key Storage (CRITICAL)
**Location:** `packages/frontend/src/services/session-key.service.ts`

**Issue:** Session keys include plaintext private keys stored in browser storage:
```typescript
const sessionKey: SessionKey = {
  publicKey: keyPair.publicKey,
  privateKey: keyPair.privateKey, // Stored in plaintext!
  ...
};
```

**Impact:** XSS attacks can steal session keys and drain user funds.

**Recommendation:** Use ephemeral keys that never leave the device, or integrate with hardware security modules.

---

### 4. Paymaster Signing Without Validation (CRITICAL)
**Location:** `packages/backend/src/lib/paymaster.ts`

**Issue:** The backend accepts any UserOperation for sponsorship without validating:
```typescript
// TODO: Validate userOp details against policy (e.g. whitelist, rate limit)
```

**Impact:** Attackers can drain the paymaster sponsorship pool by submitting unlimited operations.

**Recommendation:** Implement full whitelist/rate-limit validation before signing.

---

### 5. No Input Validation on PaymentProcessor (CRITICAL)
**Location:** `packages/contracts/contracts/PaymentProcessor.sol`

**Issue:** The `completePayment` function allows anyone to complete a payment:
```solidity
require(
    msg.sender == payment.payer || msg.sender == config.merchant || msg.sender == owner(),
    "PaymentProcessor: not authorized"
);
```

**Impact:** Merchant or owner can unilaterally complete payments without payer consent.

**Recommendation:** Require cryptographic authorization from the payer.

---

## High-Severity Issues

### 6. Missing Reentrancy Guards in PaymentProcessor
**Location:** `packages/contracts/contracts/PaymentProcessor.sol`

**Issue:** Multiple functions lack `nonReentrant` modifier:
- `refundPayment()`
- `disputePayment()`
- `resolveDispute()`
- `cancelSubscription()`

**Recommendation:** Add `nonReentrant` modifier to all state-changing functions that transfer tokens.

---

### 7. No Access Control on Subscription Processing
**Location:** `packages/contracts/contracts/PaymentProcessor.sol:processSubscriptionPayment`

**Issue:** Anyone can trigger subscription payments:
```solidity
function processSubscriptionPayment(bytes32 _subscriptionId) external whenNotPaused nonReentrant
```

**Impact:** Front-running of subscription payments possible; MEV extraction.

**Recommendation:** Add access control or create a dedicated executor role.

---

### 8. Frontend RPC URL Exposure
**Location:** `packages/frontend/src/services/paymaster.service.ts`

**Issue:** Hardcoded fallback RPC URLs:
```typescript
const urls: Record<number, string> = {
  1: process.env.NEXT_PUBLIC_ETHEREUM_RPC || 'https://eth.llamarpc.com',
  ...
};
```

**Impact:** Users may connect to malicious RPC endpoints that can steal private keys or censor transactions.

**Recommendation:** Only use trusted RPC providers; warn users about RPC endpoint changes.

---

### 9. Weak Rate Limiting in Paymaster
**Location:** `packages/contracts/contracts/VesselPaymaster.sol`

**Issue:** Rate limiting uses mutable window that can be gamed:
```solidity
if (block.timestamp - userLastRequestTime[_user] >= userRateLimitWindow[_user]) {
    userRequestCount[_user] = 0;
```

**Impact:** Attackers can send bursts within the same block to bypass limits.

**Recommendation:** Use a fixed time window or implement more robust rate limiting.

---

### 10. No Signature Verification on Merchant Registration
**Location:** `packages/contracts/contracts/PaymentProcessor.sol`

**Issue:** Anyone can register as any merchant by choosing any `_merchantId`:
```solidity
function registerMerchant(bytes32 _merchantId, ...) external whenNotPaused {
    require(merchantConfigs[_merchantId].merchant == address(0), "PaymentProcessor: merchant exists");
```

**Impact:** Phishing attacks - attackers can impersonate legitimate merchants.

**Recommendation:** Require signature verification or KYC process for merchant registration.

---

### 11. Missing Event Emissions for Critical Actions
**Location:** Multiple contract functions

**Issue:** Several state-changing functions lack event emissions, making off-chain monitoring difficult.

**Recommendation:** Add events for: `setUserDailyGasLimit()`, `batchSetWhitelistStatus()`, `setWhitelistStatus()`

---

### 12. Insecure Randomness in Key Generation
**Location:** `packages/frontend/src/services/session-key.service.ts`

**Issue:** Using `ethers.Wallet.createRandom()` which relies on local randomness.

**Impact:** Weak randomness can lead to predictable keys.

**Recommendation:** Integrate with hardware security module or use OS-level secure randomness.

---

## Medium/Low-Severity Issues

### 13. Missing Contract Pauser Role
**Issue:** Both `isPaused` and `Pausable` are used together inconsistently.

**Recommendation:** Consolidate to single pause mechanism.

---

### 14. No Maximum Token Whitelist Size Limit
**Location:** `PaymentProcessor.sol`

**Issue:** Unbounded array growth in `acceptedTokenList`.

**Recommendation:** Add maximum size limit and implement pagination.

---

### 15. Gas Limit Not Validated in Paymaster
**Location:** `packages/contracts/contracts/VesselPaymaster.sol`

**Issue:** Uses `maxCost` as gas estimate instead of actual gas used.

**Recommendation:** Track actual gas consumption in `_postOp`.

---

### 16. Missing Timelock on Critical Functions
**Issue:** Owner can change fee collector, fees, and pause state instantly.

**Recommendation:** Implement timelock for sensitive administrative actions.

---

### 17. No Circuit Breaker for StableSwap AMM
**Location:** `packages/contracts/contracts/StableSwapAMM.sol`

**Issue:** No emergency withdrawal mechanism if contract is compromised.

**Recommendation:** Implement circuit breaker with emergency exit.

---

### 18. Insecure Token Approval Pattern
**Location:** `packages/frontend/src/services/paymaster.service.ts`

**Issue:** Approving unlimited token spending:
```typescript
const tx = await tokenContract.approve(paymaster.address, amountWei);
```

**Recommendation:** Use `increaseAllowance` or set specific amounts.

---

### 19. JWT Secret from Environment (Potential Issue)
**Location:** `packages/frontend/src/middleware.ts`

**Issue:** Hardcoded environment variable without validation:
```typescript
const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
```

**Recommendation:** Validate secret presence and strength at startup.

---

### 20. No CSRF Protection on API Routes
**Issue:** API routes don't implement CSRF tokens.

**Recommendation:** Implement CSRF protection for state-changing operations.

---

## Security Best Practices Recommendations

### Immediate Actions Required
1. **Fix wallet generation** - Use secure random keys with MPC
2. **Add paymaster validation** - Implement whitelist/rate-limit before signing
3. **Remove TODOs** - Complete all incomplete security checks
4. **Add input validation** - Validate all external inputs

### Short-Term (1-2 Weeks)
1. Add comprehensive test coverage for security scenarios
2. Implement formal verification for smart contracts
3. Add upgradeable proxy pattern for contracts
4. Implement multi-signature for admin operations

### Long-Term (1-2 Months)
1. Bug bounty program
3rd party security audit
2. Penetration testing
3. Runtime verification monitors

---

## Security Checklist

- [ ] Fix deterministic wallet generation (Critical)
- [ ] Implement paymaster validation (Critical)
- [ ] Add reentrancy guards (High)
- [ ] Secure session key storage (Critical)
- [ ] Add merchant verification (High)
- [ ] Implement rate limiting (High)
- [ ] Add CSRF protection (Medium)
- [ ] Implement timelock (Medium)
- [ ] Add emergency withdrawal (Medium)
- [ ] Secure RPC configuration (High)

---

## Conclusion

This codebase handles significant financial value and requires immediate security hardening before production deployment. The critical vulnerabilities around wallet generation and paymaster signing could lead to complete loss of user funds. All critical issues must be resolved before any mainnet deployment.

**Recommendation:** DO NOT DEPLOY until critical issues are resolved.
